export interface CompressionOptions {
  maxDimension?: number; // defaults to 800
  quality?: number; // defaults to 0.8
  targetMaxSizeBytes?: number; // 200 KB
  format?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  base64DataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
  isSafeForFirestore: boolean; // Must leave ample room within 1 MiB document limit
  sizeWarning?: string;
}

// 1 MiB hard ceiling in Firestore
export const FIRESTORE_MAX_DOC_SIZE_BYTES = 1048576;
// Recommended safe threshold for a single image in a product doc (approx 350KB Base64 max)
export const SAFE_IMAGE_BYTE_CEILING = 350000;

/**
 * Validates file type and reads image into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file must be an image (JPEG, PNG, WebP, etc.).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from local disk.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data. The file might be corrupted.'));
      img.onload = () => resolve(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses and resizes an image file in the browser, outputting a Base64 data URL
 * optimized for Firestore document storage under 200 KB.
 */
export async function compressImageToBase64(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxDim = options.maxDimension || 800;
  const initialQuality = options.quality ?? 0.82;
  const targetMaxBytes = options.targetMaxSizeBytes || 200 * 1024; // 200 KB target

  const originalSizeBytes = file.size;
  const img = await loadImageFromFile(file);

  // Compute aspect-ratio preserved dimensions
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (targetWidth > maxDim || targetHeight > maxDim) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
      targetWidth = maxDim;
    } else {
      targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
      targetHeight = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not initialize browser 2D canvas context for image compression.');
  }

  // Draw smooth background and render
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Test WebP support
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 1;
  testCanvas.height = 1;
  const supportsWebP = testCanvas.toDataURL('image/webp').startsWith('data:image/webp');
  const preferredFormat = supportsWebP ? 'image/webp' : 'image/jpeg';

  let currentQuality = initialQuality;
  let base64Result = canvas.toDataURL(preferredFormat, currentQuality);
  let compressedSizeBytes = Math.round((base64Result.length * 3) / 4);

  // If size exceeds targetMaxBytes, iteratively reduce quality down to 0.45
  let attempts = 0;
  while (compressedSizeBytes > targetMaxBytes && currentQuality > 0.45 && attempts < 5) {
    currentQuality -= 0.1;
    base64Result = canvas.toDataURL(preferredFormat, currentQuality);
    compressedSizeBytes = Math.round((base64Result.length * 3) / 4);
    attempts++;
  }

  // Safety checks for Firestore
  const isSafeForFirestore = compressedSizeBytes <= SAFE_IMAGE_BYTE_CEILING;
  let sizeWarning: string | undefined;

  if (compressedSizeBytes > FIRESTORE_MAX_DOC_SIZE_BYTES) {
    throw new Error(
      `Image size (${formatBytes(compressedSizeBytes)}) exceeds the absolute Firestore 1 MiB document limit. Please use a smaller source image or reduce dimensions.`
    );
  } else if (!isSafeForFirestore) {
    sizeWarning = `Compressed image size (${formatBytes(compressedSizeBytes)}) is larger than recommended 200 KB. It will fit in Firestore, but may increase read bandwidth.`;
  }

  const compressionRatio = originalSizeBytes > 0 ? compressedSizeBytes / originalSizeBytes : 1;

  return {
    base64DataUrl: base64Result,
    originalSizeBytes,
    compressedSizeBytes,
    compressionRatio,
    width: targetWidth,
    height: targetHeight,
    format: preferredFormat,
    isSafeForFirestore,
    sizeWarning,
  };
}

/**
 * Human-readable byte formatting utility
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
