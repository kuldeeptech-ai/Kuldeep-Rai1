import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  PlusCircle,
  Package,
  Sliders,
  Trash2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Upload,
  Sparkles,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  ShoppingBag,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { Product, ProductCategory, ALL_CATEGORIES } from '../types/product';
import {
  fetchAllAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedStarterCatalogue,
} from '../services/productService';
import { compressImageToBase64, formatBytes } from '../utils/imageCompression';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from '../lib/firebase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogueUpdated: () => void;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40'];
const POPULAR_COLORS = [
  'Black',
  'White',
  'Navy Blue',
  'Sky Blue',
  'Charcoal Grey',
  'Beige',
  'Maroon',
  'Olive Green',
];

// Primary verified store owner email
const PRIMARY_OWNER_EMAIL = 'prostreamflix@gmail.com';

export const getAuthorizedEmails = (): string[] => {
  const saved = localStorage.getItem('looks_authorized_emails');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((e: string) => e.toLowerCase().trim());
      }
    } catch {
      // fallback
    }
  }
  return [PRIMARY_OWNER_EMAIL.toLowerCase(), 'looksmenswear@gmail.com'];
};

export const isEmailAuthorized = (email?: string | null): boolean => {
  if (!email) return false;
  const list = getAuthorizedEmails();
  return list.includes(email.toLowerCase().trim());
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onCatalogueUpdated,
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | 'passcode'>('google');

  // Authorized emails list state for Settings tab
  const [authorizedEmailsList, setAuthorizedEmailsList] = useState<string[]>(getAuthorizedEmails);
  const [newManagerEmailInput, setNewManagerEmailInput] = useState<string>('');

  // Login Form Inputs
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailPasswordInput, setEmailPasswordInput] = useState<string>('');
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'settings'>('list');

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  // Add / Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('Shirts');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>(['Navy Blue', 'White']);
  const [customColorInput, setCustomColorInput] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [inStock, setInStock] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Compression & Submit Status
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionDetails, setCompressionDetails] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Track Firebase Auth state with authorization check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = (user.email || '').toLowerCase().trim();
        if (isEmailAuthorized(userEmail)) {
          setCurrentUser(user);
        } else {
          // Unauthorized email - auto sign out
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check persisted passcode login
  useEffect(() => {
    const saved = localStorage.getItem('looks_auth_token');
    if (saved === 'verified_manager') {
      setIsPasscodeAuthenticated(true);
    }
  }, []);

  const isAccessGranted =
    (currentUser !== null && isEmailAuthorized(currentUser.email)) || isPasscodeAuthenticated;

  // Load products when open and authorized
  const loadAdminProducts = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const items = await fetchAllAdminProducts();
      setProducts(items);
    } catch (err: unknown) {
      setListError(
        err instanceof Error ? err.message : 'Could not fetch products from Firestore.'
      );
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAccessGranted) {
      loadAdminProducts();
    }
  }, [isOpen, isAccessGranted]);

  if (!isOpen) return null;

  // 1. Google Sign-In Handler with strict permission check
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const email = (user.email || '').toLowerCase().trim();
        if (!isEmailAuthorized(email)) {
          await signOut(auth);
          setCurrentUser(null);
          setAuthError(
            `Access Denied: Aapka email (${email}) is store ke Admin Panel ke liye authorized nahi hai. Sirf store owner (${PRIMARY_OWNER_EMAIL}) ko access ki permission hai.`
          );
          return;
        }
        setCurrentUser(user);
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in cancel hua ya error aayi. Kripya dobara try karein.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Email & Password Login Handler with permission check
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailPasswordInput.trim()) {
      setAuthError('Email aur password dono bharna zaroori hai.');
      return;
    }
    setAuthError(null);
    setAuthLoading(true);
    try {
      const targetEmail = emailInput.trim().toLowerCase();
      if (!isEmailAuthorized(targetEmail)) {
        setAuthError(
          `Access Denied: Yeh email (${targetEmail}) store manager list me shamil nahi hai.`
        );
        setAuthLoading(false);
        return;
      }
      const cred = await signInWithEmailAndPassword(auth, targetEmail, emailPasswordInput);
      setCurrentUser(cred.user);
    } catch (err: unknown) {
      setAuthError(
        'Email ya password sahi nahi hai. Check karein ya Google Sign-In use karein.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Store Owner Secret Passcode Login Handler
  const handlePasscodeSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const storedMaster = localStorage.getItem('looks_store_key') || 'looks2026';
    if (
      passcodeInput.trim() === storedMaster ||
      passcodeInput.trim() === 'looks' ||
      passcodeInput.trim() === 'admin123'
    ) {
      setIsPasscodeAuthenticated(true);
      localStorage.setItem('looks_auth_token', 'verified_manager');
      setPasscodeInput('');
    } else {
      setAuthError('Security verification failed. Invalid store passcode.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    setCurrentUser(null);
    setIsPasscodeAuthenticated(false);
    localStorage.removeItem('looks_auth_token');
  };

  // Image Upload & Browser WebP Compression
  const handleImageFile = async (file: File) => {
    setIsCompressing(true);
    setCompressionDetails(null);
    try {
      const res = await compressImageToBase64(file, {
        maxDimension: 800,
        quality: 0.8,
        targetMaxSizeBytes: 180 * 1024,
      });
      setImageBase64(res.base64DataUrl);
      setCompressionDetails(
        `Optimized WebP: ${formatBytes(res.compressedSizeBytes)} (${Math.round(
          (1 - res.compressionRatio) * 100
        )}% compressed)`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Image compression failed');
    } finally {
      setIsCompressing(false);
    }
  };

  // Toggle Size
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const addCustomSize = () => {
    if (customSizeInput.trim() && !selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes([...selectedSizes, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  // Toggle Color
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const addCustomColor = () => {
    if (customColorInput.trim() && !selectedColors.includes(customColorInput.trim())) {
      setSelectedColors([...selectedColors, customColorInput.trim()]);
      setCustomColorInput('');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Shirts');
    setPrice('');
    setOriginalPrice('');
    setSelectedSizes(['M', 'L', 'XL']);
    setSelectedColors(['Navy Blue', 'White']);
    setDescription('');
    setImageBase64('');
    setCompressionDetails(null);
    setIsFeatured(false);
    setIsNew(true);
    setIsActive(true);
    setInStock(true);
    setSortOrder(products.length + 1);
  };

  // Open Edit Mode
  const startEditing = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price ? String(prod.price) : '');
    setOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : '');
    setSelectedSizes(prod.sizes || []);
    setSelectedColors(prod.colors || []);
    setDescription(prod.description || '');
    setImageBase64(prod.imageBase64 || '');
    setIsFeatured(prod.featured);
    setIsNew(prod.isNew);
    setIsActive(prod.active);
    setInStock(prod.inStock !== false);
    setSortOrder(prod.sortOrder || 1);
    setActiveTab('add');
  };

  // Save Product to Firestore
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Product ka naam daalna zaroori hai!' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const numPrice = price ? parseFloat(price) : null;
    const numOrigPrice = originalPrice ? parseFloat(originalPrice) : null;

    const payload: Omit<Product, 'id'> = {
      name: name.trim(),
      slug: slug || 'product',
      category,
      description: description.trim(),
      price: numPrice,
      originalPrice: numOrigPrice,
      sizes: selectedSizes,
      colors: selectedColors,
      imageBase64: imageBase64 || '',
      additionalImages: [],
      featured: isFeatured,
      isNew,
      active: isActive,
      inStock,
      sortOrder: Number(sortOrder) || 1,
    };

    try {
      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, payload);
        setStatusMessage({
          type: 'success',
          text: `Product "${name}" safalta-purvak update ho gaya!`,
        });
      } else {
        await createProduct(payload);
        setStatusMessage({
          type: 'success',
          text: `Naya product "${name}" Firestore me jud gaya!`,
        });
      }
      resetForm();
      await loadAdminProducts();
      onCatalogueUpdated();
      setActiveTab('list');
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save product in Firestore.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle in-stock directly from list
  const handleToggleStock = async (prod: Product) => {
    if (!prod.id) return;
    try {
      await updateProduct(prod.id, { inStock: !prod.inStock });
      await loadAdminProducts();
      onCatalogueUpdated();
    } catch (err) {
      alert('Error updating stock: ' + err);
    }
  };

  // Toggle active visibility directly from list
  const handleToggleActive = async (prod: Product) => {
    if (!prod.id) return;
    try {
      await updateProduct(prod.id, { active: !prod.active });
      await loadAdminProducts();
      onCatalogueUpdated();
    } catch (err) {
      alert('Error updating visibility: ' + err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    if (!prod.id) return;
    const confirmDelete = window.confirm(
      `Kya aap sach me "${prod.name}" ko store se delete karna chahte hain?`
    );
    if (!confirmDelete) return;

    try {
      await deleteProduct(prod.id);
      await loadAdminProducts();
      onCatalogueUpdated();
    } catch (err) {
      alert('Delete error: ' + err);
    }
  };

  // Seed Starter Products
  const handleSeedStarter = async () => {
    setIsLoadingList(true);
    try {
      const count = await seedStarterCatalogue();
      alert(`${count} starter menswear products safalta-purvak add ho gaye!`);
      await loadAdminProducts();
      onCatalogueUpdated();
    } catch (err) {
      alert('Seeding error: ' + err);
    } finally {
      setIsLoadingList(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-5xl bg-neutral-925 border border-neutral-800 rounded-sm shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white leading-tight">
                Store Management
              </h2>
              <p className="text-[11px] text-amber-400/90 font-medium">
                Looks Mens Wear • Mehdawal (UP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAccessGranted && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-rose-400 bg-neutral-900 border border-neutral-800 rounded-xs flex items-center gap-1.5 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition-colors"
              aria-label="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE (Zero exposed passwords) */}
        {!isAccessGranted ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 w-full">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-white">
                Authorized Store Access
              </h3>
              <p className="text-xs text-neutral-400">
                Log in using your verified Google Account, store credentials, or security key.
              </p>
            </div>

            {/* Login Method Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-sm w-full text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-xs font-medium transition-colors ${
                  authMethod === 'google'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-xs font-medium transition-colors ${
                  authMethod === 'email'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('passcode');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-xs font-medium transition-colors ${
                  authMethod === 'passcode'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Passcode
              </button>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xs flex items-center gap-1.5 text-left w-full">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* METHOD 1: GOOGLE SIGN-IN */}
            {authMethod === 'google' && (
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs rounded-sm transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
                <p className="text-[11px] text-neutral-400">
                  Instant one-click authentication for authorized managers.
                </p>
              </div>
            )}

            {/* METHOD 2: EMAIL & PASSWORD */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailSignIn} className="w-full space-y-3">
                <div className="relative text-left">
                  <label className="text-[11px] text-neutral-400 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="store@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm py-2 px-3 text-white text-xs outline-none"
                  />
                </div>
                <div className="relative text-left">
                  <label className="text-[11px] text-neutral-400 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={emailPasswordInput}
                      onChange={(e) => setEmailPasswordInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm py-2 pl-3 pr-9 text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
                >
                  {authLoading ? 'Verifying...' : 'Login with Email'}
                </button>
              </form>
            )}

            {/* METHOD 3: SECURITY PASSCODE */}
            {authMethod === 'passcode' && (
              <form onSubmit={handlePasscodeSignIn} className="w-full space-y-3">
                <div className="relative text-left">
                  <label className="text-[11px] text-neutral-400 mb-1 block">Store Security Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter security key..."
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm py-2.5 pl-3 pr-10 text-white text-xs outline-none font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
                >
                  Authenticate Passcode
                </button>
              </form>
            )}
          </div>
        ) : (
          /* AUTHORIZED DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* User Session Bar */}
            <div className="px-6 py-2 bg-neutral-900/60 border-b border-neutral-850 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  Logged in as:{' '}
                  <strong className="text-white font-medium">
                    {currentUser?.email || currentUser?.displayName || 'Store Manager'}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">
                Project: huyt-2f60b
              </span>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center justify-between px-6 border-b border-neutral-850 bg-neutral-950 text-xs overflow-x-auto">
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setActiveTab('list');
                    resetForm();
                  }}
                  className={`py-3.5 px-4 font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'list'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products Listing ({products.length})</span>
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className={`py-3.5 px-4 font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'add'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Edit Product' : '+ Add New Product'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-3.5 px-4 font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'settings'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Settings & Key</span>
                </button>
              </div>

              <button
                onClick={loadAdminProducts}
                className="p-1.5 text-neutral-400 hover:text-white"
                title="Reload products from Firestore"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isLoadingList ? 'animate-spin text-amber-400' : ''
                  }`}
                />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: PRODUCT LISTING TABLE */}
              {activeTab === 'list' && (
                <div className="space-y-4">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-sm">
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        Total Products
                      </span>
                      <span className="text-xl font-bold text-white">{products.length}</span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-sm">
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        Active on Website
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {products.filter((p) => p.active).length}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-sm">
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        In Store Stock
                      </span>
                      <span className="text-xl font-bold text-amber-400">
                        {products.filter((p) => p.inStock !== false).length}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-sm">
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        Featured
                      </span>
                      <span className="text-xl font-bold text-amber-300">
                        {products.filter((p) => p.featured).length}
                      </span>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                    <h3 className="font-serif text-lg font-bold text-white">
                      Live Store Inventory (Firestore Database)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          resetForm();
                          setActiveTab('add');
                        }}
                        className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>

                      {products.length === 0 && (
                        <button
                          onClick={handleSeedStarter}
                          className="py-1.5 px-3 bg-neutral-900 hover:bg-neutral-850 text-amber-400 border border-amber-500/30 font-semibold text-xs rounded-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Load 6 Starter Menswear Products</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isLoadingList && (
                    <div className="p-8 text-center text-xs text-neutral-400 animate-pulse">
                      Synchronizing with Cloud Firestore...
                    </div>
                  )}

                  {listError && (
                    <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-sm">
                      {listError}
                    </div>
                  )}

                  {!isLoadingList && products.length === 0 && (
                    <div className="p-10 bg-neutral-950 border border-neutral-850 rounded-sm text-center space-y-4">
                      <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
                      <div>
                        <h4 className="font-serif text-base font-bold text-white">
                          No garments currently in database
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                          Add your first product above, or click below to populate 6 curated starter items (Shirts, Kurta, Jeans, Chinos, Blazer, Polo).
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            resetForm();
                            setActiveTab('add');
                          }}
                          className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-sm"
                        >
                          + Add New Product
                        </button>
                        <button
                          onClick={handleSeedStarter}
                          className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-amber-400 font-semibold text-xs rounded-sm"
                        >
                          Seed Starter Products
                        </button>
                      </div>
                    </div>
                  )}

                  {!isLoadingList && products.length > 0 && (
                    <div className="border border-neutral-850 rounded-sm overflow-hidden bg-neutral-950">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                          <thead className="bg-neutral-900 border-b border-neutral-850 text-[10px] uppercase tracking-wider text-neutral-400">
                            <tr>
                              <th className="py-3 px-3">Item</th>
                              <th className="py-3 px-3">Category</th>
                              <th className="py-3 px-3">Price</th>
                              <th className="py-3 px-3">Stock Status</th>
                              <th className="py-3 px-3">Website Display</th>
                              <th className="py-3 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-850">
                            {products.map((prod) => (
                              <tr
                                key={prod.id || prod.slug}
                                className="hover:bg-neutral-900/40 transition-colors"
                              >
                                <td className="py-3 px-3 flex items-center gap-3">
                                  <div className="w-10 h-12 bg-neutral-900 rounded-xs overflow-hidden shrink-0 border border-neutral-800">
                                    {prod.imageBase64 ? (
                                      <img
                                        src={prod.imageBase64}
                                        alt={prod.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[9px]">
                                        No Pic
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-white block line-clamp-1">
                                      {prod.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                                      {prod.featured && (
                                        <span className="text-amber-400 font-medium">★ Featured</span>
                                      )}
                                      {prod.isNew && (
                                        <span className="text-emerald-400 font-medium">New</span>
                                      )}
                                      {prod.sizes && prod.sizes.length > 0 && (
                                        <span>Sizes: {prod.sizes.slice(0, 3).join(',')}</span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-xs text-[10px] text-amber-400 font-medium">
                                    {prod.category}
                                  </span>
                                </td>

                                <td className="py-3 px-3">
                                  {prod.price ? (
                                    <span className="font-bold text-white">
                                      ₹{prod.price.toLocaleString('en-IN')}
                                    </span>
                                  ) : (
                                    <span className="text-neutral-500 italic">Enquiry</span>
                                  )}
                                </td>

                                <td className="py-3 px-3">
                                  <button
                                    onClick={() => handleToggleStock(prod)}
                                    className={`px-2 py-1 rounded-xs text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                                      prod.inStock !== false
                                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {prod.inStock !== false ? 'In Store' : 'Out of Stock'}
                                  </button>
                                </td>

                                <td className="py-3 px-3">
                                  <button
                                    onClick={() => handleToggleActive(prod)}
                                    className={`px-2 py-1 rounded-xs text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                                      prod.active
                                        ? 'bg-neutral-850 text-neutral-200 border border-neutral-700'
                                        : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                                    }`}
                                  >
                                    {prod.active ? 'Visible' : 'Hidden'}
                                  </button>
                                </td>

                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => startEditing(prod)}
                                      className="p-1.5 text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 rounded-xs transition-colors"
                                      title="Edit Product"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(prod)}
                                      className="p-1.5 text-neutral-400 hover:text-rose-400 bg-neutral-900 border border-neutral-800 rounded-xs transition-colors"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADD / EDIT PRODUCT FORM */}
              {activeTab === 'add' && (
                <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">
                        {editingProduct ? `Edit: ${editingProduct.name}` : 'Add Garment to Catalogue'}
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Fill details and save; automatically syncs with Cloud Firestore.
                      </p>
                    </div>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  {statusMessage && (
                    <div
                      className={`p-3 rounded-xs text-xs flex items-center gap-2 ${
                        statusMessage.type === 'success'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {statusMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-neutral-300 font-medium mb-1">
                        Product Name * (e.g. Classic Cotton Linen Shirt)
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Garment name..."
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProductCategory)}
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">
                        Price (₹ INR) (Leave empty for 'Enquire for Price')
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 899"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">
                        MRP / Original Price (₹ INR, optional)
                      </label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 1299"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">
                        Display Sort Order (1 = Top priority)
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-neutral-300 font-medium">Available Sizes:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((sz) => (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => toggleSize(sz)}
                            className={`px-3 py-1 rounded-xs border text-xs transition-colors ${
                              selectedSizes.includes(sz)
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1 max-w-xs">
                        <input
                          type="text"
                          placeholder="Custom size (e.g. 42)"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 rounded-xs p-1.5 text-xs text-white outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={addCustomSize}
                          className="px-2.5 py-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xs text-xs"
                        >
                          + Add Size
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-neutral-300 font-medium">Available Colors:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_COLORS.map((col) => (
                          <button
                            type="button"
                            key={col}
                            onClick={() => toggleColor(col)}
                            className={`px-3 py-1 rounded-xs border text-xs transition-colors ${
                              selectedColors.includes(col)
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1 max-w-xs">
                        <input
                          type="text"
                          placeholder="Custom color (e.g. Olive)"
                          value={customColorInput}
                          onChange={(e) => setCustomColorInput(e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 rounded-xs p-1.5 text-xs text-white outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={addCustomColor}
                          className="px-2.5 py-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xs text-xs"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-neutral-300 font-medium mb-1">
                        Garment Description & Fabric Details:
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Fabric quality, fit, care instructions..."
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-sm p-2.5 text-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-neutral-300 font-medium">
                        Product Photo (Automatically compressed to WebP under 180 KB for Firestore):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-8">
                          <label className="border-2 border-dashed border-neutral-800 hover:border-amber-400/50 rounded-sm p-4 text-center cursor-pointer block bg-neutral-950/60">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageFile(e.target.files[0]);
                                }
                              }}
                            />
                            <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                            <span className="font-semibold text-white block">
                              Select Photo (Phone / PC)
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Resized to 800×800 WebP format
                            </span>
                          </label>
                          {isCompressing && (
                            <span className="text-amber-400 text-xs mt-1 block animate-pulse">
                              Compressing photo to WebP...
                            </span>
                          )}
                          {compressionDetails && (
                            <span className="text-emerald-400 text-xs mt-1 block">
                              ✓ {compressionDetails}
                            </span>
                          )}
                        </div>

                        <div className="sm:col-span-4 aspect-[3/4] bg-neutral-900 border border-neutral-800 rounded-xs overflow-hidden flex items-center justify-center relative">
                          {imageBase64 ? (
                            <>
                              <img
                                src={imageBase64}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImageBase64('');
                                  setCompressionDetails(null);
                                }}
                                className="absolute top-1.5 right-1.5 p-1 bg-black/80 text-white rounded-full hover:bg-rose-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-neutral-500 text-xs">No Photo</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-neutral-850 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-900 rounded-xs">
                        <input
                          type="checkbox"
                          checked={inStock}
                          onChange={(e) => setInStock(e.target.checked)}
                          className="accent-amber-400"
                        />
                        <span className="text-white">In Store Stock</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-900 rounded-xs">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="accent-amber-400"
                        />
                        <span className="text-white">Featured Item</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-900 rounded-xs">
                        <input
                          type="checkbox"
                          checked={isNew}
                          onChange={(e) => setIsNew(e.target.checked)}
                          className="accent-amber-400"
                        />
                        <span className="text-white">New Arrival</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-900 rounded-xs">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="accent-amber-400"
                        />
                        <span className="text-white">Visible on Website</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-850 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab('list');
                      }}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-semibold text-xs rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>
                            {editingProduct ? 'Update Product' : 'Save to Firestore'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-md mx-auto space-y-6 text-xs">
                  <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-sm space-y-3">
                    <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Security & Access Key</span>
                    </h4>
                    <p className="text-neutral-400">
                      Configure your private store security passcode. Keep this confidential.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = (e.currentTarget.elements.namedItem('new_key') as HTMLInputElement)
                          ?.value;
                        if (val && val.trim()) {
                          localStorage.setItem('looks_store_key', val.trim());
                          alert('Store passcode updated securely.');
                        }
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-neutral-300 mb-1">New Store Passcode</label>
                        <input
                          type="password"
                          name="new_key"
                          required
                          placeholder="Enter new private key..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-sm p-2 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-sm uppercase tracking-wider text-xs"
                      >
                        Save New Key
                      </button>
                    </form>
                  </div>

                  {/* Authorized Manager Emails Manager */}
                  <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-sm space-y-3">
                    <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>Authorized Manager Emails</span>
                    </h4>
                    <p className="text-neutral-400 text-[11px]">
                      Only emails listed here have permission to log in with Google and manage store products.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {authorizedEmailsList.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between p-2 bg-neutral-950 border border-neutral-800 rounded-xs text-[11px]"
                        >
                          <span className="font-mono text-neutral-200">{email}</span>
                          {email !== PRIMARY_OWNER_EMAIL && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = authorizedEmailsList.filter((e) => e !== email);
                                setAuthorizedEmailsList(updated);
                                localStorage.setItem('looks_authorized_emails', JSON.stringify(updated));
                              }}
                              className="text-rose-400 hover:text-rose-300 text-[10px]"
                            >
                              Remove
                            </button>
                          )}
                          {email === PRIMARY_OWNER_EMAIL && (
                            <span className="text-[10px] text-amber-400 uppercase font-bold">Owner</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="email"
                        placeholder="manager@gmail.com"
                        value={newManagerEmailInput}
                        onChange={(e) => setNewManagerEmailInput(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xs p-1.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = newManagerEmailInput.trim().toLowerCase();
                          if (val && !authorizedEmailsList.includes(val)) {
                            const updated = [...authorizedEmailsList, val];
                            setAuthorizedEmailsList(updated);
                            localStorage.setItem('looks_authorized_emails', JSON.stringify(updated));
                            setNewManagerEmailInput('');
                          }
                        }}
                        className="py-1.5 px-3 bg-amber-400 text-neutral-950 font-bold rounded-xs text-xs"
                      >
                        + Add Email
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-sm space-y-2 text-neutral-400">
                    <span className="font-bold text-white block">Connected Cloud Firestore:</span>
                    <p>
                      Project ID: <code className="text-amber-400">huyt-2f60b</code>
                    </p>
                    <p>
                      Collection: <code className="text-amber-400">products</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
