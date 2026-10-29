import React from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { STORE_INFO } from '../types/product';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const MobileStickyBar: React.FC = () => {
  return (
    <aside
      aria-label="Quick Store Actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 px-3 py-2.5 shadow-2xl safe-area-pb"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* 1. Call Now */}
        <a
          href={STORE_INFO.rawPhone}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-200 active:bg-neutral-800 transition-colors"
        >
          <Phone className="w-4 h-4 text-amber-400 mb-0.5" />
          <span className="text-[10px] uppercase font-semibold tracking-wider">Call Now</span>
        </a>

        {/* 2. WhatsApp */}
        <a
          href={buildGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-sm bg-emerald-400 text-neutral-950 active:bg-emerald-300 transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4 fill-current text-neutral-950 mb-0.5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">WhatsApp Baat</span>
        </a>

        {/* 3. Directions */}
        <a
          href={STORE_INFO.mapsQueryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-200 active:bg-neutral-800 transition-colors"
        >
          <MapPin className="w-4 h-4 text-amber-400 mb-0.5" />
          <span className="text-[10px] uppercase font-semibold tracking-wider">Directions</span>
        </a>
      </div>
    </aside>
  );
};
