/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ShopByCategory } from './components/ShopByCategory';
import { FeaturedSection } from './components/FeaturedSection';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { ProductGrid } from './components/ProductGrid';
import { StoreInfo } from './components/StoreInfo';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { fetchActiveProducts } from './services/productService';
import { Product, ProductCategory, ALL_CATEGORIES } from './types/product';

const DEFAULT_PAGE_TITLE = "Looks Mens Wear – Premium Men's Clothing Store | Mehdawal, UP";

function MainApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Active category filter
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'ALL'>('ALL');

  const isInitialSyncDone = useRef(false);

  // Helper to update URL address without reloading page
  const updateUrl = useCallback(
    (params: { category?: ProductCategory | 'ALL'; productSlug?: string | null; page?: string | null }) => {
      const url = new URL(window.location.href);

      // Handle category param
      if (params.category && params.category !== 'ALL') {
        url.searchParams.set('category', params.category);
      } else if (params.category === 'ALL') {
        url.searchParams.delete('category');
      }

      // Handle product param
      if (params.productSlug) {
        url.searchParams.set('product', params.productSlug);
      } else if (params.productSlug === null) {
        url.searchParams.delete('product');
      }

      // Handle page param (e.g. admin)
      if (params.page) {
        url.searchParams.set('page', params.page);
      } else if (params.page === null) {
        url.searchParams.delete('page');
      }

      const newUrlStr = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '');
      window.history.pushState(
        {
          category: params.category || activeCategory,
          productSlug: params.productSlug,
          page: params.page,
        },
        '',
        newUrlStr
      );
    },
    [activeCategory]
  );

  // Load active products from Cloud Firestore
  const loadCatalogue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchActiveProducts();
      setProducts(res.products);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred while loading products.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Read URL query params on initial load and on popstate (browser back/forward)
  const syncFromUrl = useCallback(
    (productList: Product[]) => {
      const searchParams = new URLSearchParams(window.location.search);
      const catParam = searchParams.get('category');
      const prodParam = searchParams.get('product');
      const pageParam = searchParams.get('page');

      // 1. Sync category
      if (catParam && ALL_CATEGORIES.includes(catParam as ProductCategory)) {
        setActiveCategory(catParam as ProductCategory);
      } else if (!catParam) {
        setActiveCategory('ALL');
      }

      // 2. Sync admin panel modal
      if (pageParam === 'admin') {
        setIsAdminOpen(true);
        document.title = 'Store Manager | Looks Mens Wear';
      } else {
        setIsAdminOpen(false);
      }

      // 3. Sync product detail modal
      if (prodParam && productList.length > 0) {
        const found = productList.find(
          (p) => p.slug === prodParam || p.id === prodParam || p.name.toLowerCase().includes(prodParam.toLowerCase())
        );
        if (found) {
          setSelectedProduct(found);
          document.title = `${found.name} | Looks Mens Wear`;
        } else {
          setSelectedProduct(null);
        }
      } else if (!prodParam) {
        setSelectedProduct(null);
        if (pageParam !== 'admin') {
          document.title = DEFAULT_PAGE_TITLE;
        }
      }
    },
    []
  );

  // Sync from URL when products first load
  useEffect(() => {
    if (!isInitialSyncDone.current && products.length > 0) {
      isInitialSyncDone.current = true;
      syncFromUrl(products);
    }
  }, [products, syncFromUrl]);

  // Handle browser Back / Forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      syncFromUrl(products);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, syncFromUrl]);

  // Category selection handler with URL update
  const handleSelectCategory = (cat: ProductCategory | 'ALL') => {
    setActiveCategory(cat);
    updateUrl({ category: cat });
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    setActiveCategory('ALL');
    updateUrl({ category: 'ALL' });
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open product detail modal with URL update
  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    document.title = `${prod.name} | Looks Mens Wear`;
    updateUrl({ productSlug: prod.slug });
  };

  // Close product detail modal with URL update
  const handleCloseProduct = () => {
    setSelectedProduct(null);
    document.title = DEFAULT_PAGE_TITLE;
    updateUrl({ productSlug: null });
  };

  // Open Admin Panel with URL update
  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    document.title = 'Store Manager | Looks Mens Wear';
    updateUrl({ page: 'admin' });
  };

  // Close Admin Panel with URL update
  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    document.title = DEFAULT_PAGE_TITLE;
    updateUrl({ page: null });
  };

  return (
    <div className="min-h-screen bg-neutral-950 dark:bg-neutral-950 light:bg-neutral-50 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 flex flex-col selection:bg-amber-400 selection:text-neutral-950 transition-colors">
      {/* 1. Header with brand wordmark, menu-only admin access & theme toggle */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Hero Banner */}
        <Hero />

        {/* 3. Shop by Category Visual Showcase */}
        <ShopByCategory onSelectCategory={handleSelectCategory} />

        {/* 4. Featured Products (loaded from Firebase where featured == true) */}
        <FeaturedSection
          products={products}
          onViewDetails={handleOpenProduct}
          onViewAll={handleViewAll}
        />

        {/* 5. New Arrivals (loaded from Firebase where isNew == true) */}
        <NewArrivalsSection
          products={products}
          onViewDetails={handleOpenProduct}
          onViewAll={handleViewAll}
        />

        {/* 6. Product Catalogue Grid with live Search, Filter Pills & Sort */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          onRefresh={loadCatalogue}
          onViewDetails={handleOpenProduct}
          onOpenAdmin={handleOpenAdmin}
          initialCategory={activeCategory}
        />

        {/* 7. About Store, Location & Google Rating (verified details) */}
        <StoreInfo />
      </main>

      {/* 8. Footer with verified contact links */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* 9. Mobile Sticky Bottom Bar (Call Now, WhatsApp Baat, Directions) */}
      <MobileStickyBar />

      {/* 10. Modals with synchronized URL addresses */}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProduct}
        />
      )}

      {/* Store Owner Admin Panel (Strictly menu-only with Google/Email/Passcode Auth) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        onCatalogueUpdated={loadCatalogue}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
