import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Compass,
} from 'lucide-react';
import { STORE_INFO, ProductCategory } from '../types/product';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenAdmin: () => void;
  onSelectCategory?: (category: ProductCategory | 'ALL') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onSelectCategory,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Collection', href: '#catalogue' },
    { label: 'Featured', href: '#featured' },
    { label: 'New Arrivals', href: '#new-arrivals' },
    { label: 'About Store', href: '#about' },
    { label: 'Location & Contact', href: '#location' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 dark:bg-neutral-950/90 light:bg-white/90 backdrop-blur-md border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 transition-colors">
      {/* Top subtle store location and phone bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 light:from-neutral-100 light:via-neutral-50 light:to-neutral-100 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 text-xs py-1.5 px-4 border-b border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide text-white dark:text-white light:text-neutral-900 text-xs">
              {STORE_INFO.name}
            </span>
            <span className="hidden sm:inline text-neutral-400 dark:text-neutral-400 light:text-neutral-600 text-xs">
              • {STORE_INFO.address}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={STORE_INFO.rawPhone}
              className="inline-flex items-center gap-1.5 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{STORE_INFO.phone}</span>
            </a>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-neutral-400 hover:text-amber-400 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark and Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-neutral-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Wordmark */}
          <a href="#" className="flex flex-col group focus:outline-none">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-bold text-white dark:text-white light:text-neutral-950 group-hover:text-amber-400 transition-colors duration-200 uppercase">
              LOOKS
            </span>
            <span className="text-[10px] tracking-[0.4em] text-neutral-400 dark:text-neutral-400 light:text-neutral-600 font-medium uppercase -mt-1 group-hover:text-neutral-300 transition-colors">
              MENS WEAR • MEHDAWAL
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-amber-400 transition-colors py-1 relative text-xs uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <a
              href={STORE_INFO.mapsQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 dark:text-neutral-300 light:text-neutral-800 hover:text-white bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 rounded-sm transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Directions</span>
            </a>

            <a
              href={buildGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-sm shadow-sm transition-all duration-200 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="tracking-wide">WhatsApp Baat</span>
            </a>

            {/* Menu Trigger (Contains Menu Links and discrete Store Manager Access) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-800 hover:text-amber-400 bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 rounded-sm transition-colors focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over / Dropdown Menu */}
      {menuOpen && (
        <div className="bg-neutral-950 dark:bg-neutral-950 light:bg-white border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 px-6 py-6 shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Navigation links */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                  Navigation
                </span>
                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-neutral-200 dark:text-neutral-200 light:text-neutral-900 hover:text-amber-400 font-medium text-sm py-1 transition-colors uppercase tracking-wider"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Direct Store Actions */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                  Quick Actions
                </span>
                <div className="flex flex-col gap-2">
                  <a
                    href={STORE_INFO.rawPhone}
                    className="flex items-center gap-2 py-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-200 dark:text-neutral-200 light:text-neutral-800 bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 rounded-sm border border-neutral-800 dark:border-neutral-800 light:border-neutral-300"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Call Store: +91 91182 68554</span>
                  </a>

                  <a
                    href={STORE_INFO.mapsQueryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-200 dark:text-neutral-200 light:text-neutral-800 bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 rounded-sm border border-neutral-800 dark:border-neutral-800 light:border-neutral-300"
                  >
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Get Directions (Anjahiya Bazar)</span>
                  </a>

                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between py-2 px-3 text-xs font-medium text-neutral-300 dark:text-neutral-300 light:text-neutral-800 bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 rounded-sm border border-neutral-800 dark:border-neutral-800 light:border-neutral-300"
                  >
                    <span>Appearance: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confidential Store Manager Access (Kept exclusively in menu button as requested) */}
            <div className="pt-4 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-200 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Looks Mens Wear • Mehdawal Store Operations
              </span>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAdmin();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-neutral-400 hover:text-white bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-neutral-200 hover:bg-neutral-850 rounded-xs border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 transition-colors"
                title="Store Manager Access"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Store Manager Access</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
