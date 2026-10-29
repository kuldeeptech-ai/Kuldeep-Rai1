import React, { useState } from 'react';
import { MessageCircle, Eye, Tag, Sparkles } from 'lucide-react';
import { Product } from '../types/product';
import { buildProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  layoutMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  layoutMode = 'grid',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Safe WhatsApp enquiry link for card-level action
  const whatsappUrl = buildProductWhatsAppUrl({
    product,
    selectedSize: product.sizes.length > 0 ? product.sizes[0] : undefined,
    selectedColor: product.colors.length > 0 ? product.colors[0] : undefined,
  });

  const hasConfiguredPrice =
    typeof product.price === 'number' && !isNaN(product.price) && product.price > 0;
  const hasOriginalPrice =
    typeof product.originalPrice === 'number' &&
    !isNaN(product.originalPrice) &&
    product.originalPrice > 0;

  // Render Horizontal Listing Style
  if (layoutMode === 'list') {
    return (
      <div className="group bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 rounded-sm overflow-hidden p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Badges */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div
            onClick={() => onViewDetails(product)}
            className="relative w-20 h-24 sm:w-24 sm:h-28 bg-neutral-950 rounded-xs overflow-hidden shrink-0 cursor-pointer border border-neutral-800"
          >
            {product.imageBase64 && !imageError ? (
              <img
                src={product.imageBase64}
                alt={product.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                <Tag className="w-6 h-6" />
              </div>
            )}
            {product.isNew && (
              <span className="absolute top-1 left-1 px-1.5 py-0.2 text-[8px] uppercase font-bold bg-amber-400 text-neutral-950 rounded-xs">
                New
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-amber-400">
              {product.category}
            </span>
            <h3
              onClick={() => onViewDetails(product)}
              className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-300 cursor-pointer transition-colors"
            >
              {product.name}
            </h3>

            {/* Sizes & Colors */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 pt-0.5">
              {product.sizes && product.sizes.length > 0 && (
                <span>Sizes: <strong className="text-neutral-200 font-normal">{product.sizes.join(', ')}</strong></span>
              )}
              {product.colors && product.colors.length > 0 && (
                <span>• Colors: <strong className="text-neutral-200 font-normal">{product.colors.join(', ')}</strong></span>
              )}
            </div>

            {/* In stock badge */}
            {typeof product.inStock === 'boolean' && (
              <span
                className={`inline-block px-2 py-0.5 text-[9px] uppercase font-semibold tracking-wider rounded-xs mt-1 ${
                  product.inStock
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                }`}
              >
                {product.inStock ? 'Available in Store' : 'Available on Order'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Price & WhatsApp Action Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-850">
          <div className="text-left sm:text-right">
            {hasConfiguredPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-white">
                  ₹{product.price!.toLocaleString('en-IN')}
                </span>
                {hasOriginalPrice && product.originalPrice! > product.price! && (
                  <span className="text-xs text-neutral-400 line-through">
                    ₹{product.originalPrice!.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs italic text-amber-400 font-medium">Enquire for Price</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(product)}
              className="py-2 px-3 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 rounded-xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>Details</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Par Baat Karein</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card
  return (
    <div className="group flex flex-col bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-750 transition-all duration-300 rounded-sm overflow-hidden">
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] w-full bg-neutral-950 overflow-hidden">
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {product.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-neutral-950 rounded-sm shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              New
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-neutral-900/90 text-amber-300 border border-amber-500/30 rounded-sm backdrop-blur-xs">
              Featured
            </span>
          )}
        </div>

        {/* In-stock status ONLY if explicitly configured in doc */}
        {typeof product.inStock === 'boolean' && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={`px-2 py-0.5 text-[10px] uppercase font-medium tracking-wider rounded-sm ${
                product.inStock
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
              }`}
            >
              {product.inStock ? 'In Store' : 'Available on Order'}
            </span>
          </div>
        )}

        {/* Product Image or Fallback */}
        {product.imageBase64 && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-neutral-850 animate-pulse" />
            )}
            <img
              src={product.imageBase64}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-925 text-neutral-400 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-850 flex items-center justify-center mb-2 text-neutral-400">
              <Tag className="w-6 h-6" />
            </div>
            <span className="text-xs font-serif tracking-widest text-neutral-300 uppercase">
              {product.category}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">Photo In Preparation</span>
          </div>
        )}

        {/* Quick View Hover Button (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-2 px-3 text-xs uppercase tracking-wider font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-sm shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick Details</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-amber-400/90">
            {product.category}
          </span>
          <h3 className="font-serif text-sm sm:text-base font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mt-0.5">
            {product.name}
          </h3>

          {/* Sizes preview if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-[10px] text-neutral-400 uppercase">Sizes:</span>
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="text-[10px] px-1 py-0.2 rounded-xs bg-neutral-850 text-neutral-300 border border-neutral-800"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-neutral-400">+{product.sizes.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Price and Action Buttons */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2.5">
          {/* Price display */}
          <div className="flex items-baseline justify-between">
            {hasConfiguredPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ₹{product.price!.toLocaleString('en-IN')}
                </span>
                {hasOriginalPrice && product.originalPrice! > product.price! && (
                  <span className="text-xs text-neutral-400 line-through">
                    ₹{product.originalPrice!.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs italic text-amber-400/90 font-medium">
                Enquire for Price
              </span>
            )}
          </div>

          {/* Primary Action Button: WhatsApp Par Baat Karein */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-sm transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            title="Chat on WhatsApp with product details"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp Par Baat Karein</span>
          </a>

          {/* Secondary Details button */}
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-neutral-850 hover:bg-neutral-800 rounded-xs transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3 text-neutral-400" />
            <span>View Sizing & Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
