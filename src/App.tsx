/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { Product, ProductCategory } from './types/product';

function MainApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Active category filter passed from ShopByCategory or navigation
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'ALL'>('ALL');

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

  const handleSelectCategory = (cat: ProductCategory | 'ALL') => {
    setActiveCategory(cat);
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    setActiveCategory('ALL');
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 dark:bg-neutral-950 light:bg-neutral-50 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 flex flex-col selection:bg-amber-400 selection:text-neutral-950 transition-colors">
      {/* 1. Header with brand wordmark, menu-only admin access & theme toggle */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
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
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onViewAll={handleViewAll}
        />

        {/* 5. New Arrivals (loaded from Firebase where isNew == true) */}
        <NewArrivalsSection
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onViewAll={handleViewAll}
        />

        {/* 6. Product Catalogue Grid with live Search, Filter Pills & Sort */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          onRefresh={loadCatalogue}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          initialCategory={activeCategory}
        />

        {/* 7. About Store, Location & Google Rating (verified details) */}
        <StoreInfo />
      </main>

      {/* 8. Footer with verified contact links */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* 9. Mobile Sticky Bottom Bar (Call Now, WhatsApp Baat, Directions) */}
      <MobileStickyBar />

      {/* 10. Modals */}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Store Owner Admin Panel (Accessed strictly via menu button with Google/Email/Passcode Auth) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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
