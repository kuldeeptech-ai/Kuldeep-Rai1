import React from 'react';
import { ArrowDown, MessageCircle, MapPin, Sparkles, Star } from 'lucide-react';
import { STORE_INFO } from '../types/product';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center bg-neutral-950 overflow-hidden border-b border-neutral-900">
      {/* Background with luxury editorial mood lighting */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2000&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.12),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Editorial Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-amber-400 text-xs tracking-[0.2em] uppercase font-medium mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Menswear Boutique • Mehdawal, UP</span>
        </div>

        {/* Mandatory Heading */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
          Upgrade Your Style. <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent italic font-normal">
            Define Your Look.
          </span>
        </h1>

        {/* Mandatory Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-300 font-light tracking-wide mb-10 leading-relaxed">
          Discover your style at Looks Mens Wear, Mehdawal. From sharply tailored formal
          shirts to comfortable denim and celebratory festive wear, find your ideal fit in Anjahiya Bazar.
        </p>

        {/* Mandatory 3 Buttons: Explore Collection, WhatsApp Us, Get Directions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-12">
          {/* 1. Explore Collection */}
          <a
            href="#catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-sm shadow-lg shadow-amber-950/20 transition-all duration-200 active:scale-95"
          >
            <span>Explore Collection</span>
            <ArrowDown className="w-4 h-4" />
          </a>

          {/* 2. WhatsApp Us */}
          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-sm shadow-md transition-all duration-200 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current text-neutral-950" />
            <span>WhatsApp Par Baat Karein</span>
          </a>

          {/* 3. Get Directions */}
          <a
            href={STORE_INFO.mapsQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-sm transition-all duration-200"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Get Directions</span>
          </a>
        </div>

        {/* Verified Store Metrics Bar (Strictly un-fabricated) */}
        <div className="pt-8 border-t border-neutral-850/80 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Location</span>
            <p className="text-xs sm:text-sm font-medium text-neutral-200">
              Anjahiya Bazar, Mehdawal
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Google Rating</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-amber-400">
                {STORE_INFO.rating} / 5.0
              </span>
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-[11px] text-neutral-400">
                ({STORE_INFO.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Direct Enquiry</span>
            <p className="text-xs sm:text-sm font-medium text-neutral-200">
              Instant WhatsApp assistance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
