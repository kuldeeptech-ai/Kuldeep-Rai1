import React from 'react';
import { ALL_CATEGORIES, ProductCategory } from '../types/product';

interface CategoryPillsProps {
  selectedCategory: ProductCategory | 'ALL';
  onSelectCategory: (category: ProductCategory | 'ALL') => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
        {/* All option */}
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`shrink-0 px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-all duration-200 ${
            selectedCategory === 'ALL'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold shadow-sm'
              : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
          }`}
        >
          All Categories
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold shadow-sm'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span>{cat}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
