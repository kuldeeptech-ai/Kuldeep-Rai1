import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Shield, Database, Key, Layers } from 'lucide-react';

interface ConsoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsoleGuideModal: React.FC<ConsoleGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!isOpen) return null;

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /products/{productId} {
      function isValidId(id) {
        return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
      }
      allow get: if isValidId(productId) && resource.data.active == true;
      allow list: if resource.data.active == true;
      allow create, update, delete: if false;
    }
  }
}`;

  const sampleProductDoc = {
    name: "Pure Linen Casual Shirt",
    slug: "pure-linen-casual-shirt",
    category: "Shirts",
    description: "Tailored from 100% breathable organic linen. Features a modern mandarin collar, mother-of-pearl buttons, and a relaxed regular fit designed for hot climates.",
    price: 1199,
    originalPrice: 1599,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Sky Blue", "White", "Beige"],
    imageBase64: "", // Store compressed Base64 data URI from the Owner Prep Tool
    additionalImages: [],
    featured: true,
    isNew: true,
    active: true,
    sortOrder: 1,
    inStock: true
  };

  const copyRules = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const copySample = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleProductDoc, null, 2));
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl bg-neutral-925 border border-neutral-800 rounded-sm shadow-2xl overflow-hidden z-10 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Firebase Firestore Setup & Console Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h3>Create Firebase Project & Register Web App</h3>
            </div>
            <p className="text-neutral-400 pl-7">
              Go to{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 underline inline-flex items-center gap-0.5"
              >
                console.firebase.google.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and click <strong>Add project</strong>. Once created, click the Web icon (<code>&lt;/&gt;</code>) to register your web application.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h3>Add Environment Variables</h3>
            </div>
            <p className="text-neutral-400 pl-7">
              Copy the keys from your Firebase Web configuration and place them in your <code>.env</code> file:
            </p>
            <pre className="ml-7 p-3 bg-neutral-950 border border-neutral-850 rounded-xs font-mono text-[11px] text-amber-300">
              VITE_FIREBASE_API_KEY="AIzaSy..."{'\n'}
              VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"{'\n'}
              VITE_FIREBASE_PROJECT_ID="your-project-id"{'\n'}
              VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"{'\n'}
              VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"{'\n'}
              VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
            </pre>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h3>Enable Cloud Firestore & Apply Security Rules</h3>
            </div>
            <p className="text-neutral-400 pl-7">
              In Firebase Console, go to <strong>Firestore Database</strong> &gt; <strong>Create database</strong> (choose Production mode). Then open the <strong>Rules</strong> tab, paste the rules below, and click <strong>Publish</strong>.
            </p>

            <div className="ml-7 space-y-1.5">
              <div className="flex justify-end">
                <button
                  onClick={copyRules}
                  className="px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-neutral-900 border border-neutral-800 rounded-xs flex items-center gap-1"
                >
                  {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRules ? 'Copied Rules' : 'Copy Rules'}</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 border border-neutral-850 rounded-xs font-mono text-[11px] text-neutral-300 overflow-x-auto">
                {sampleRules}
              </pre>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-bold">
                4
              </span>
              <h3>Create 'products' Collection & Add Items</h3>
            </div>
            <p className="text-neutral-400 pl-7">
              In Firestore Database, click <strong>Start collection</strong> and enter Collection ID:{' '}
              <code className="text-amber-400 font-bold">products</code>. For each garment, add document fields. Here is a sample JSON schema template:
            </p>

            <div className="ml-7 space-y-1.5">
              <div className="flex justify-end">
                <button
                  onClick={copySample}
                  className="px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-neutral-900 border border-neutral-800 rounded-xs flex items-center gap-1"
                >
                  {copiedSample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSample ? 'Copied Schema' : 'Copy Schema Template'}</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 border border-neutral-850 rounded-xs font-mono text-[11px] text-neutral-300 overflow-x-auto">
                {JSON.stringify(sampleProductDoc, null, 2)}
              </pre>
            </div>
          </div>

          {/* Limits notice */}
          <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xs space-y-1 text-neutral-400">
            <span className="font-semibold text-amber-400 block">
              Important Firestore Limits & Cost Notes
            </span>
            <p>
              • <strong>1 MiB limit per document:</strong> Using our WebP Base64 compression tool keeps images around 100–200 KB, safely inside the limit.
            </p>
            <p>
              • <strong>Spark Plan:</strong> Free tier gives 50,000 reads and 20,000 writes per day. Base64 images are fetched as document reads, so optimize dimensions for best performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
