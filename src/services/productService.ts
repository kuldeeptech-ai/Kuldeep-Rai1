import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../lib/firebase';
import { Product, ProductCategory, ALL_CATEGORIES } from '../types/product';

export interface FetchProductsResult {
  products: Product[];
  error: string | null;
  isEmpty: boolean;
  isUnconfigured: boolean;
}

/**
 * Validates and sanitizes a raw Firestore product document into a safe Product object.
 */
export function sanitizeProductDoc(id: string, data: DocumentData): Product | null {
  if (!data || typeof data !== 'object') return null;

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;

  const slug =
    typeof data.slug === 'string' && data.slug.trim()
      ? data.slug.trim()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  let category: ProductCategory = 'Casual Wear';
  if (data.category && ALL_CATEGORIES.includes(data.category)) {
    category = data.category as ProductCategory;
  }

  const description = typeof data.description === 'string' ? data.description : '';

  let price: number | null = null;
  if (typeof data.price === 'number' && !isNaN(data.price) && data.price > 0) {
    price = data.price;
  }

  let originalPrice: number | null = null;
  if (
    typeof data.originalPrice === 'number' &&
    !isNaN(data.originalPrice) &&
    data.originalPrice > 0
  ) {
    originalPrice = data.originalPrice;
  }

  const sizes: string[] = Array.isArray(data.sizes)
    ? data.sizes.filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
    : [];

  const colors: string[] = Array.isArray(data.colors)
    ? data.colors.filter((c: unknown) => typeof c === 'string' && c.trim().length > 0)
    : [];

  const imageBase64 = typeof data.imageBase64 === 'string' ? data.imageBase64 : '';

  const additionalImages: string[] = Array.isArray(data.additionalImages)
    ? data.additionalImages.filter((img: unknown) => typeof img === 'string')
    : [];

  const featured = Boolean(data.featured);
  const isNew = Boolean(data.isNew);
  const active = data.active !== false;
  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : 99;

  let inStock: boolean | undefined = undefined;
  if (typeof data.inStock === 'boolean') {
    inStock = data.inStock;
  }

  return {
    id,
    name,
    slug,
    category,
    description,
    price,
    originalPrice,
    sizes,
    colors,
    imageBase64,
    additionalImages,
    featured,
    isNew,
    active,
    sortOrder,
    inStock,
    createdAt: data.createdAt,
  };
}

/**
 * Fetches active products for the public customer storefront
 */
export async function fetchActiveProducts(): Promise<FetchProductsResult> {
  if (!db || !isFirebaseConfigured) {
    return {
      products: [],
      error: 'Firebase is not initialized.',
      isEmpty: true,
      isUnconfigured: true,
    };
  }

  const collectionPath = 'products';

  try {
    const productsRef = collection(db, collectionPath);
    // Fetch all docs and filter active in memory to avoid missing composite index errors on fresh Firestore
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) {
      return {
        products: [],
        error: null,
        isEmpty: true,
        isUnconfigured: false,
      };
    }

    const items: Product[] = [];
    snapshot.forEach((docSnap) => {
      const sanitized = sanitizeProductDoc(docSnap.id, docSnap.data());
      if (sanitized && sanitized.active) {
        items.push(sanitized);
      }
    });

    items.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      products: items,
      error: null,
      isEmpty: items.length === 0,
      isUnconfigured: false,
    };
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    const message =
      error instanceof Error ? error.message : 'Failed to connect to Cloud Firestore.';

    let friendlyError = message;
    if (message.toLowerCase().includes('permission') || message.includes('permission-denied')) {
      friendlyError =
        'Firestore permission denied. Please verify in Firebase Console that firestore.rules allow read/write access.';
    }

    return {
      products: [],
      error: friendlyError,
      isEmpty: true,
      isUnconfigured: false,
    };
  }
}

/**
 * Fetches all products (including inactive/draft) for the Store Admin Panel
 */
export async function fetchAllAdminProducts(): Promise<Product[]> {
  if (!db) return [];
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const items: Product[] = [];
    snapshot.forEach((docSnap) => {
      const sanitized = sanitizeProductDoc(docSnap.id, docSnap.data());
      if (sanitized) items.push(sanitized);
    });
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return items;
  } catch (err) {
    console.error('Error fetching admin products:', err);
    throw err;
  }
}

/**
 * Creates a new product directly in Cloud Firestore
 */
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized.');

  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'products');
    throw err;
  }
}

/**
 * Updates an existing product in Firestore
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    throw err;
  }
}

/**
 * Deletes a product from Firestore
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    throw err;
  }
}

/**
 * Seed starter menswear products with high-quality fashion imagery
 */
export async function seedStarterCatalogue(): Promise<number> {
  if (!db) throw new Error('Firestore is not initialized.');

  const starters: Omit<Product, 'id'>[] = [
    {
      name: 'Pure Linen Mandarin Collar Shirt',
      slug: 'pure-linen-mandarin-collar-shirt',
      category: 'Shirts',
      description: 'Crafted from 100% pure organic breathable linen. Tailored with a modern mandarin band collar, coconut-shell buttons, and a relaxed regular fit perfect for Indian summers.',
      price: 1199,
      originalPrice: 1599,
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Sky Blue', 'White', 'Beige'],
      imageBase64: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
      featured: true,
      isNew: true,
      active: true,
      inStock: true,
      sortOrder: 1,
    },
    {
      name: 'Slim Fit Dark Indigo Stretch Denim',
      slug: 'slim-fit-dark-indigo-stretch-denim',
      category: 'Jeans',
      description: 'Premium ring-spun cotton denim woven with 2% elastane for maximum all-day movement and shape retention. Finished with custom copper rivets and subtle whiskering.',
      price: 1499,
      originalPrice: 1999,
      sizes: ['30', '32', '34', '36', '38'],
      colors: ['Dark Indigo', 'Midnight Black'],
      imageBase64: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop',
      featured: true,
      isNew: false,
      active: true,
      inStock: true,
      sortOrder: 2,
    },
    {
      name: 'Royal Heritage Embroidered Kurta',
      slug: 'royal-heritage-embroidered-kurta',
      category: 'Ethnic Wear',
      description: 'Elegantly detailed festive kurta featuring fine thread embroidery around the placket and cuffs. Made from blended silk for wedding celebrations, Diwali, and festive occasions.',
      price: 1899,
      originalPrice: 2499,
      sizes: ['38', '40', '42', '44'],
      colors: ['Maroon', 'Mustard Gold', 'Off-White'],
      imageBase64: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      featured: true,
      isNew: true,
      active: true,
      inStock: true,
      sortOrder: 3,
    },
    {
      name: 'Tailored Italian Cut Formal Blazer',
      slug: 'tailored-italian-cut-formal-blazer',
      category: 'Formal Wear',
      description: 'Single-breasted two-button blazer with structured notch lapels and double rear vents. Gives an authoritative and sharp silhouette for business meetings, conferences, and parties.',
      price: 3499,
      originalPrice: 4499,
      sizes: ['38', '40', '42', '44'],
      colors: ['Charcoal Grey', 'Navy Blue'],
      imageBase64: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      featured: true,
      isNew: false,
      active: true,
      inStock: true,
      sortOrder: 4,
    },
    {
      name: 'Cotton Pique Textured Polo T-Shirt',
      slug: 'cotton-pique-textured-polo-t-shirt',
      category: 'T-Shirts',
      description: 'Heavyweight combed cotton pique knit with ribbed collar and tipped sleeve bands. Resists fading and shrinking, making it an everyday wardrobe staple.',
      price: 699,
      originalPrice: 999,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Forest Green', 'Burgundy', 'Jet Black'],
      imageBase64: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      featured: false,
      isNew: true,
      active: true,
      inStock: true,
      sortOrder: 5,
    },
    {
      name: 'Smart Stretch Chino Trousers',
      slug: 'smart-stretch-chino-trousers',
      category: 'Trousers',
      description: 'Mid-rise flat-front chinos crafted from twill cotton with spandex blend. Clean taper through the leg makes them versatile with both dress shirts and casual tees.',
      price: 1099,
      originalPrice: 1499,
      sizes: ['30', '32', '34', '36'],
      colors: ['Khaki', 'Olive', 'Navy'],
      imageBase64: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop',
      featured: false,
      isNew: true,
      active: true,
      inStock: true,
      sortOrder: 6,
    },
  ];

  let addedCount = 0;
  for (const item of starters) {
    await addDoc(collection(db, 'products'), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    addedCount++;
  }

  return addedCount;
}
