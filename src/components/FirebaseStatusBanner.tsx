import React from 'react';
import { Database, AlertCircle, HelpCircle, Wrench, ChevronRight } from 'lucide-react';
import { getFirebaseConfigStatus } from '../lib/firebase';

interface FirebaseStatusBannerProps {
  onOpenGuide: () => void;
  onOpenPrepTool: () => void;
}

export const FirebaseStatusBanner: React.FC<FirebaseStatusBannerProps> = ({
  onOpenGuide,
  onOpenPrepTool,
}) => {
  const status = getFirebaseConfigStatus();

  // If already configured with real keys, do not show warning banner
  if (status.isConfigured) return null;

  return (
    <div className="bg-neutral-900 border-b border-amber-500/30 text-neutral-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-white">Firebase Connection Notice:</span>{' '}
            <span className="text-neutral-400">
              {status.missingKeys.length > 0
                ? `Missing credentials (${status.missingKeys.join(', ')}) in .env.`
                : 'Configure your Firestore credentials to sync live store inventory.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 rounded-xs flex items-center gap-1.5 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Setup Guide</span>
          </button>
          <button
            onClick={onOpenPrepTool}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xs flex items-center gap-1 font-semibold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Prep Garment</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
