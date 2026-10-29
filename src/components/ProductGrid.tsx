import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCw,
  FilterX,
  AlertCircle,
  ShoppingBag,
  ArrowUpDown,
  LayoutGrid,
  List,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { Product, ProductCategory } from '../types/product';
import { ProductCard } from './ProductCard';
import { CategoryPills } from './CategoryPills';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onViewDetails: (product: Product) => void;
  onOpenAdmin: () => void;
  initialCategory?: ProductCategory | 'ALL';
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  onRefresh,
  onViewDetails,
  onOpenAdmin,
  initialCategory = 'ALL',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Compute category item counts based on all products in database
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Check if at least one product has a usable price for sorting
  const hasPricedProducts = useMemo(() => {
    return products.some((p) => typeof p.price === 'number' && p.price > 0);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Featured toggle
    if (onlyFeatured) {
      result = result.filter((p) => p.featured);
    }

    // New Arrivals toggle
    if (onlyNew) {
      result = result.filter((p) => p.isNew);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pa = typeof a.price === 'number' && a.price > 0 ? a.price : 999999;
        const pb = typeof b.price === 'number' && b.price > 0 ? b.price : 999999;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pa = typeof a.price === 'number' && a.price > 0 ? a.price : -1;
        const pb = typeof b.price === 'number' && b.price > 0 ? b.price : -1;
        return pb - pa;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return result;
  }, [products, selectedCategory, onlyFeatured, onlyNew, searchQuery, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    searchQuery.trim() !== '' ||
    onlyFeatured ||
    onlyNew ||
    sortBy !== 'default';

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setOnlyFeatured(false);
    setOnlyNew(false);
    setSortBy('default');
  };

  return (
    <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">
            Product Catalogue
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Explore Curated Menswear
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
            Live collection from Looks Mens Wear. Kisi bhi garment par click karein aur direct WhatsApp par baat karein.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Grid vs List View Toggle ("badhiya se listing ki tarah dikhe") */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-sm p-0.5">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-xs transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-xs transition-colors ${
                layoutMode === 'list'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Listing View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-sm transition-colors disabled:opacity-50"
            title="Refresh catalogue from Firebase"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="space-y-4 mb-8 bg-neutral-925 p-4 rounded-sm border border-neutral-800/80">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search garments by name or category (e.g. Linen Shirt, Denim, Kurta)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-neutral-100 placeholder-neutral-400 text-xs rounded-sm pl-10 pr-4 py-2.5 transition-colors focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-all ${
                onlyFeatured
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setOnlyNew(!onlyNew)}
              className={`px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border transition-all ${
                onlyNew
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              New
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-sm py-2 px-3 pr-8 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none"
              >
                <option value="default">Sort: Default Order</option>
                <option value="name-asc">Sort: Name (A-Z)</option>
                {hasPricedProducts && (
                  <>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </>
                )}
              </select>
              <ArrowUpDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Reset all search queries and filters"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="pt-2 border-t border-neutral-850">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* Grid Content States */}
      {/* 1. Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-neutral-900/40 border border-neutral-850 rounded-sm overflow-hidden p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-[3/4] bg-neutral-850 rounded-xs" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-neutral-800 rounded-xs" />
                <div className="h-4 w-3/4 bg-neutral-800 rounded-xs" />
                <div className="h-4 w-1/3 bg-neutral-800 rounded-xs" />
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="h-7 bg-neutral-800 rounded-xs" />
                <div className="h-7 bg-neutral-800 rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && error && (
        <div className="bg-neutral-925 border border-rose-900/40 rounded-sm p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Firestore Notice</h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-md mx-auto leading-relaxed">
              {error}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onRefresh}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-sm transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-neutral-900 border border-neutral-800 rounded-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Admin Panel</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Empty Database State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-neutral-925 border border-neutral-800 rounded-sm p-10 text-center max-w-2xl mx-auto space-y-5">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-white">
              Catalogue Ready in Firestore
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Abhi aapke Firestore database (<code className="text-amber-400">products</code>) me koi garment nahi hai.
              Aap apne <strong>Admin Panel</strong> se turant naya product add kar sakte hain ya 6 starter menswear garments load kar sakte hain!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAdmin}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admin Panel Se Product Add Karein</span>
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-sm transition-colors"
            >
              Refresh Karein
            </button>
          </div>
        </div>
      )}

      {/* 4. No Results Matching Filter/Search State */}
      {!isLoading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="bg-neutral-925 border border-neutral-850 rounded-sm p-10 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-neutral-400 flex items-center justify-center mx-auto">
            <FilterX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">No Matching Products</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Aapke chune hue category ya search ke anusaar koi product nahi mila.
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-neutral-900 border border-neutral-800 rounded-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. Product Grid or Listing Layout */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 px-1">
            <span>
              Showing <span className="text-white font-medium">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'garment' : 'garments'}
            </span>
            <div className="flex items-center gap-2">
              {selectedCategory !== 'ALL' && (
                <span className="text-amber-400 font-medium">{selectedCategory}</span>
              )}
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 capitalize">{layoutMode} View</span>
            </div>
          </div>

          {layoutMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  onViewDetails={onViewDetails}
                  layoutMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  onViewDetails={onViewDetails}
                  layoutMode="list"
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
