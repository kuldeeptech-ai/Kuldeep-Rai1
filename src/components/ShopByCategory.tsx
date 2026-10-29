import React from 'react';
import { ALL_CATEGORIES, ProductCategory } from '../types/product';
import { ArrowUpRight } from 'lucide-react';

interface ShopByCategoryProps {
  onSelectCategory: (category: ProductCategory) => void;
}

// Curated high-fashion imagery for category cards
const CATEGORY_META: Record<
  ProductCategory,
  { image: string; tag: string }
> = {
  Shirts: {
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
    tag: 'Oxford, Linen & Casuals',
  },
  'T-Shirts': {
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    tag: 'Crewnecks & Polos',
  },
  Jeans: {
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600&auto=format&fit=crop',
    tag: 'Slim, Regular & Comfort Fit',
  },
  Trousers: {
    image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop',
    tag: 'Chinos & Formal Pants',
  },
  'Formal Wear': {
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
    tag: 'Blazers, Suits & Trousers',
  },
  'Casual Wear': {
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&auto=format&fit=crop',
    tag: 'Everyday Street & Relaxed',
  },
  Jackets: {
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
    tag: 'Bombers, Overcoats & Denims',
  },
  'Ethnic Wear': {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    tag: 'Kurtas & Traditional Sets',
  },
  'Festive Wear': {
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    tag: 'Sherwanis & Celebration Wear',
  },
};

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-16 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">
            Wardrobe Essentials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Shop by Category
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-2">
            Tailored menswear crafted for comfort, occasions, and timeless masculine appeal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  const el = document.getElementById('catalogue');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer border border-neutral-800 hover:border-amber-500/50 transition-all duration-300"
              >
                <img
                  src={meta.image}
                  alt={cat}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-medium">
                      {meta.tag}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {cat}
                    </h3>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
