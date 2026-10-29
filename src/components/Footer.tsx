import React from 'react';
import { Phone, MessageCircle, MapPin, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { STORE_INFO, ALL_CATEGORIES, ProductCategory } from '../types/product';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

interface FooterProps {
  onSelectCategory?: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="bg-neutral-950 dark:bg-neutral-950 light:bg-neutral-100 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-200 text-neutral-400 dark:text-neutral-400 light:text-neutral-600 text-xs pb-20 md:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-[0.2em] font-bold text-white dark:text-white light:text-neutral-950 uppercase">
                LOOKS
              </span>
              <span className="text-[10px] tracking-[0.35em] text-amber-400 font-medium uppercase -mt-0.5">
                MENS WEAR • MEHDAWAL
              </span>
            </div>
            <p className="text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
              Premium men's clothing boutique in Anjahiya Bazar, Mehdawal. Curated shirts, trousers,
              denim, ethnic attire, and formal wear. Direct WhatsApp inquiries and personal sizing support.
            </p>
            <div className="flex items-center gap-2 pt-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-white dark:text-white light:text-neutral-900">
                {STORE_INFO.rating} / 5.0 Rating
              </span>
              <span className="text-neutral-500">
                ({STORE_INFO.reviewCount} Google reviews)
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white dark:text-white light:text-neutral-900 uppercase tracking-wider">
              Shop Categories
            </h4>
            <ul className="space-y-2">
              {ALL_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat);
                      const el = document.getElementById('catalogue');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white dark:text-white light:text-neutral-900 uppercase tracking-wider">
              Store Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-800">
                  {STORE_INFO.fullAddress}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={STORE_INFO.rawPhone}
                  className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors text-neutral-300 dark:text-neutral-300 light:text-neutral-800"
                >
                  {STORE_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={buildGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  WhatsApp: +91 91182 68554
                </a>
              </li>
            </ul>
          </div>

          {/* Boutique Commitments */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white dark:text-white light:text-neutral-900 uppercase tracking-wider">
              Boutique Experience
            </h4>
            <div className="space-y-2.5 text-[11px] text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Verified fabric quality & custom tailored fits right in Anjahiya Bazar.</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Wedding, festive, and seasonal collections updated regularly.</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant WhatsApp support for availability, sizing, and pricing.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>
            © {new Date().getFullYear()} Looks Mens Wear. All rights reserved. Anjahiya Bazar, Mehdawal, UP.
          </p>
          <p className="text-center sm:text-right">
            Official product showcase & WhatsApp enquiry portal. No online payments taken.
          </p>
        </div>
      </div>
    </footer>
  );
};
