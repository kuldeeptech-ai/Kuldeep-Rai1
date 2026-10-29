import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface FeaturedSectionProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  products,
  onViewDetails,
  onViewAll,
}) => {
  const featuredItems = products.filter((p) => p.featured);

  if (featuredItems.length === 0) return null;

  return (
    <section id="featured" className="border-t border-neutral-900 bg-neutral-950/60 py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Featured Collections
            </h2>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Garments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredItems.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
