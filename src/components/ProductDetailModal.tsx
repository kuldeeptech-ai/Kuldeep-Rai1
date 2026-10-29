import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, MapPin, Tag, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Product, STORE_INFO } from '../types/product';
import { buildProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Sync defaults whenever product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes.length > 0 ? product.sizes[0] : '');
      setSelectedColor(product.colors.length > 0 ? product.colors[0] : '');
      setActiveImageIndex(0);
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Build images list
  const allImages = [
    ...(product.imageBase64 ? [product.imageBase64] : []),
    ...(product.additionalImages || []),
  ];
  const currentImage = allImages[activeImageIndex] || product.imageBase64;

  const hasConfiguredPrice =
    typeof product.price === 'number' && !isNaN(product.price) && product.price > 0;
  const hasOriginalPrice =
    typeof product.originalPrice === 'number' &&
    !isNaN(product.originalPrice) &&
    product.originalPrice > 0;

  // Dynamic WhatsApp enquiry link with user-selected size and color
  const whatsappUrl = buildProductWhatsAppUrl({
    product,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-neutral-925 border border-neutral-800 rounded-sm shadow-2xl overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 rounded-full transition-colors focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="bg-neutral-950 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-850">
            <div className="relative aspect-[3/4] w-full bg-neutral-900 rounded-sm overflow-hidden flex items-center justify-center">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400 p-6 text-center">
                  <Tag className="w-12 h-12 mb-3 text-neutral-400" />
                  <span className="text-sm font-serif uppercase tracking-widest text-neutral-300">
                    {product.category}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1">
                    Image currently in preparation
                  </span>
                </div>
              )}

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                {product.isNew && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-neutral-950 rounded-sm shadow">
                    <Sparkles className="w-3 h-3" />
                    New Arrival
                  </span>
                )}
                {product.featured && (
                  <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider bg-neutral-900/90 text-amber-300 border border-amber-500/30 rounded-sm backdrop-blur-xs">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-16 rounded-xs overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-400 scale-105'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details and WhatsApp Enquiry */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs tracking-[0.25em] uppercase font-semibold text-amber-400">
                  {product.category}
                </span>
                <h2
                  id="product-detail-title"
                  className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1 leading-snug"
                >
                  {product.name}
                </h2>
              </div>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-neutral-850">
                {hasConfiguredPrice ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      ₹{product.price!.toLocaleString('en-IN')}
                    </span>
                    {hasOriginalPrice && product.originalPrice! > product.price! && (
                      <span className="text-sm sm:text-base text-neutral-400 line-through">
                        ₹{product.originalPrice!.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400 ml-auto">
                      Inclusive of all taxes
                    </span>
                  </>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-base font-medium italic text-amber-300">
                      Price upon enquiry
                    </span>
                    <p className="text-xs text-neutral-400">
                      Message on WhatsApp for current store pricing and seasonal offers.
                    </p>
                  </div>
                )}
              </div>

              {/* In-Stock Status (Only when explicitly configured) */}
              {typeof product.inStock === 'boolean' && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-sm ${
                      product.inStock
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.inStock ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    {product.inStock ? 'Available in Store' : 'Out of Stock / Custom Order'}
                  </span>
                </div>
              )}

              {/* Sizes Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-neutral-300 font-semibold">
                      Select Size:
                    </span>
                    <span className="text-amber-400/90 font-medium">{selectedSize || 'None'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[42px] py-1.5 px-3 text-xs uppercase font-medium rounded-sm border transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-neutral-300 font-semibold">
                      Available Colors:
                    </span>
                    <span className="text-amber-400/90 font-medium">{selectedColor || 'None'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`py-1.5 px-3 text-xs font-medium rounded-sm border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-neutral-950" />}
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Description & Fit:
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons & WhatsApp Enquiry */}
            <div className="pt-4 border-t border-neutral-850 space-y-3">
              {/* WhatsApp Enquiry Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current text-neutral-950" />
                <span>WhatsApp Par Baat Karein</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={STORE_INFO.rawPhone}
                  className="py-2.5 px-3 font-medium text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Store</span>
                </a>

                <a
                  href={STORE_INFO.mapsQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 font-medium text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store Directions</span>
                </a>
              </div>

              {/* Notice */}
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Enquiry connects directly with store staff in Mehdawal. No advance payment required.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
