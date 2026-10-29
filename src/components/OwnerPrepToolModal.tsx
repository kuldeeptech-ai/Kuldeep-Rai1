import React, { useState } from 'react';
import {
  X,
  Upload,
  Check,
  Copy,
  AlertTriangle,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { compressImageToBase64, formatBytes, CompressionResult } from '../utils/imageCompression';
import { ALL_CATEGORIES, ProductCategory } from '../types/product';

interface OwnerPrepToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerPrepToolModal: React.FC<OwnerPrepToolModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Form fields for document preparation
  const [productName, setProductName] = useState('Classic Oxford Cotton Shirt');
  const [category, setCategory] = useState<ProductCategory>('Shirts');
  const [price, setPrice] = useState('899');
  const [originalPrice, setOriginalPrice] = useState('1299');
  const [sizesInput, setSizesInput] = useState('M, L, XL, XXL');
  const [colorsInput, setColorsInput] = useState('Navy Blue, White');
  const [description, setDescription] = useState(
    'Premium 100% combed cotton shirt with tailored collar and breathable weave. Suitable for formal and semi-casual occasions.'
  );
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setCompressionResult(null);
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const result = await compressImageToBase64(selectedFile, {
        maxDimension: 800,
        quality: 0.8,
        targetMaxSizeBytes: 180 * 1024, // 180 KB
      });
      setCompressionResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to compress image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Generate clean Firestore Document payload
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const parsedPrice = price ? parseFloat(price) : null;
  const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
  const parsedSizes = sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
  const parsedColors = colorsInput.split(',').map((c) => c.trim()).filter(Boolean);

  const documentPayload = {
    name: productName,
    slug: slug || 'product-slug',
    category,
    description,
    price: parsedPrice,
    originalPrice: parsedOriginalPrice,
    sizes: parsedSizes,
    colors: parsedColors,
    imageBase64: compressionResult ? compressionResult.base64DataUrl : 'DATA_URL_HERE',
    additionalImages: [],
    featured: isFeatured,
    isNew,
    active: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(documentPayload, null, 2);

  const copyBase64Only = () => {
    if (!compressionResult) return;
    navigator.clipboard.writeText(compressionResult.base64DataUrl);
    setCopiedBase64(true);
    setTimeout(() => setCopiedBase64(false), 2000);
  };

  const copyFullJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-neutral-925 border border-neutral-800 rounded-sm shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h2 className="font-serif text-lg font-bold text-white">
              Store Owner Base64 Image & Document Prep Tool
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Instructions banner */}
          <div className="p-4 bg-neutral-900/80 border border-amber-500/30 rounded-sm text-xs space-y-1 text-neutral-300">
            <span className="font-semibold text-amber-400 uppercase tracking-wider block">
              Direct Firebase Console Workflow
            </span>
            <p>
              In accordance with security requirements, product additions are managed manually via
              Firebase Console to protect your database from unauthenticated writes. Use this tool
              to compress your garment photos into WebP Base64 under 200 KB and generate copy-paste
              ready document payloads.
            </p>
          </div>

          {/* Upload and Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-neutral-800 hover:border-amber-400/60 rounded-sm p-6 text-center transition-colors bg-neutral-950/60 cursor-pointer"
            onClick={() => document.getElementById('image-upload-input')?.click()}
          >
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white">
              Choose or Drag a Product Photo Here
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports JPEG, PNG, WebP. Automatically resizes to 800×800 and compresses under 200 KB.
            </p>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 bg-neutral-900 border border-neutral-800 text-center text-xs text-amber-400 animate-pulse rounded-sm">
              Compressing garment photo to optimized WebP format...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Compression Results & Inspection */}
          {compressionResult && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-neutral-950 p-4 rounded-sm border border-neutral-850">
              {/* Image Preview */}
              <div className="md:col-span-4 aspect-[3/4] bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800 relative">
                <img
                  src={compressionResult.base64DataUrl}
                  alt="Compressed preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-neutral-950/90 text-amber-400 rounded-xs">
                  {compressionResult.width}×{compressionResult.height} px
                </span>
              </div>

              {/* Stats & Firestore Headroom */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-4 text-xs">
                <div>
                  <h4 className="font-serif text-base font-bold text-white mb-2">
                    Compression Analytics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-neutral-900 border border-neutral-850 rounded-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase">Original</span>
                      <span className="text-neutral-200 font-semibold">
                        {formatBytes(compressionResult.originalSizeBytes)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-neutral-850 rounded-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase">Compressed</span>
                      <span className="text-emerald-400 font-bold">
                        {formatBytes(compressionResult.compressedSizeBytes)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-neutral-850 rounded-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase">Savings</span>
                      <span className="text-amber-400 font-semibold">
                        {Math.round((1 - compressionResult.compressionRatio) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Firestore 1MB safety indicator */}
                  <div className="mt-3 p-3 bg-neutral-900/80 border border-emerald-500/30 rounded-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Safe for Firestore 1 MiB Document Limit</span>
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        ~{Math.round((compressionResult.compressedSizeBytes / 1048576) * 100)}% of doc limit
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Standard Firestore document limit is 1,048,576 bytes. This image easily leaves
                      80%+ headroom for product attributes and metadata.
                    </p>
                  </div>
                </div>

                {/* Quick copy Base64 string button */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={copyBase64Only}
                    className="flex-1 py-2.5 px-3 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 rounded-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedBase64 ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Base64!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Copy Base64 String Only</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Document Builder */}
          <div className="space-y-4 pt-4 border-t border-neutral-850">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Configure Product Attributes for Console Entry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Price (₹ INR, optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 799 (Leave blank if unconfigured)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Original MRP (₹, optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1199"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Black, Navy, White"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xs p-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 sm:col-span-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <span className="text-neutral-300">Mark as Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <span className="text-neutral-300">Mark as New Arrival</span>
                </label>
              </div>
            </div>

            {/* Complete JSON Payload & Copy button */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Prepared Firestore Document JSON
                </span>
                <button
                  onClick={copyFullJson}
                  className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xs font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Document JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-neutral-950 border border-neutral-850 rounded-xs text-[11px] text-neutral-300 overflow-x-auto max-h-40 font-mono">
                {jsonString.length > 500
                  ? jsonString.substring(0, 300) +
                    `\n  "imageBase64": "data:image/webp;base64,...[${formatBytes(
                      compressionResult?.compressedSizeBytes || 0
                    )}]"\n}`
                  : jsonString}
              </pre>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-4 bg-neutral-950 border border-neutral-850 rounded-xs space-y-2 text-xs text-neutral-400">
            <span className="font-semibold text-white block">
              How to add this product into Firebase Console:
            </span>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your Firebase Console: <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Navigate to <strong>Firestore Database</strong> &gt; click <strong>Start collection</strong> (ID: <code>products</code>).</li>
              <li>Click <strong>Add document</strong> &gt; set Document ID (or Auto-ID) &gt; add the fields matching the schema above.</li>
              <li>Paste the generated Base64 data URI into the <code>imageBase64</code> field.</li>
              <li>Save document, then return to Looks Mens Wear website and click <strong>Sync Catalogue</strong>!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
