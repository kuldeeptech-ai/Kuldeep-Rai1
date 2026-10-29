import React from 'react';
import { Phone, MessageCircle, MapPin, Star, Building2, ShieldCheck, Compass } from 'lucide-react';
import { STORE_INFO } from '../types/product';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const StoreInfo: React.FC = () => {
  return (
    <section id="location" className="py-16 bg-neutral-950 border-t border-neutral-900 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* About Store column */}
          <div id="about" className="lg:col-span-6 space-y-6 scroll-mt-24">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">
                Local Boutique
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                About Looks Mens Wear
              </h2>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed font-light">
              Situated in the heart of Anjahiya Bazar in Mehdawal, Uttar Pradesh,{' '}
              <strong className="text-white font-medium">Looks Mens Wear</strong> is dedicated to
              providing modern, refined clothing for men of all ages. Whether you require everyday
              casual shirts, rugged denim, sharp formal wear for meetings, or celebratory ethnic attire,
              our boutique offers personalized styling assistance right in store.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-sm space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">In-Store Assistance</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Try out fits in person, inspect fabrics, and consult directly on custom tailoring and sizing.
                </p>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-sm space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Direct WhatsApp Enquiry</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Check stock, colors, and prices instantaneously before visiting the store.
                </p>
              </div>
            </div>

            {/* Google Business Rating (strictly as supplied: 3.5/5 from 2 reviews) */}
            <div className="p-4 bg-neutral-925 border border-neutral-800 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {STORE_INFO.rating}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current/50" />
                    <Star className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                  <span className="text-xs text-neutral-400">
                    Google Business rating ({STORE_INFO.rating} from {STORE_INFO.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <a
                href={STORE_INFO.mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
              >
                View on Google
              </a>
            </div>
          </div>

          {/* Store Location & Contact Card */}
          <div className="lg:col-span-6 bg-neutral-925 border border-neutral-800 rounded-sm p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">
                Store Location & Contact
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">
                Visit Us in Mehdawal
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">Looks Mens Wear</span>
                  <p className="text-neutral-300 leading-relaxed">{STORE_INFO.address}</p>
                  <p className="text-neutral-400 text-xs">Menhdawal, Uttar Pradesh 272271, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">Phone & WhatsApp Enquiries</span>
                  <p className="text-neutral-300">{STORE_INFO.phone}</p>
                </div>
              </div>
            </div>

            {/* 3 Working Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href={STORE_INFO.rawPhone}
                className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Now</span>
              </a>

              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-neutral-950" />
                <span>WhatsApp</span>
              </a>

              <a
                href={STORE_INFO.mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-neutral-950" />
                <span>Directions</span>
              </a>
            </div>

            {/* Google Maps Search Preview Card */}
            <div className="pt-2">
              <a
                href={STORE_INFO.mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-44 rounded-sm overflow-hidden border border-neutral-800 group"
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop)',
                  }}
                />
                <div className="absolute inset-0 bg-neutral-950/70 group-hover:bg-neutral-950/60 transition-colors flex flex-col items-center justify-center p-4 text-center">
                  <MapPin className="w-7 h-7 text-amber-400 mb-2 animate-bounce" />
                  <span className="text-xs uppercase font-bold tracking-widest text-white">
                    Open Google Maps
                  </span>
                  <span className="text-[11px] text-neutral-300 mt-1">
                    Anjahiya Bazar, Mehdawal, Uttar Pradesh
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
