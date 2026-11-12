import React from 'react';
import { Sparkles, ShieldAlert, X } from 'lucide-react';

interface GlitchOverlayProps {
  toast: { message: string; title: string } | null;
  onDismissToast: () => void;
  showSafetyNotice: boolean;
  onCloseSafetyNotice: () => void;
  showPrivacyNotice: boolean;
  onClosePrivacyNotice: () => void;
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({
  toast,
  onDismissToast,
  showSafetyNotice,
  onCloseSafetyNotice,
  showPrivacyNotice,
  onClosePrivacyNotice,
}) => {
  return (
    <>
      {/* CRT Scanline Layer */}
      <div className="crt-overlay fixed inset-0 z-30 opacity-40 pointer-events-none" />

      {/* Subtle Horror Vignette */}
      <div className="horror-vignette fixed inset-0 z-20 opacity-60 pointer-events-none" />

      {/* Discovery Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-red-800 bg-neutral-950 p-4 shadow-2xl shadow-red-950/60 font-mono text-xs max-w-sm animate-flicker">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-950 text-red-400 border border-red-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-300 uppercase tracking-wider">{toast.title}</div>
            <div className="text-neutral-400 text-[11px] mt-0.5">{toast.message}</div>
          </div>
          <button
            onClick={onDismissToast}
            className="text-neutral-500 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Atmospheric Safety Notice Modal */}
      {showSafetyNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md font-mono text-xs">
          <div className="relative w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <button
              onClick={onCloseSafetyNotice}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-amber-500 mb-4 font-bold text-sm uppercase">
              <ShieldAlert className="h-5 w-5" />
              <span>Atmospheric & Sensory Advisory</span>
            </div>
            <div className="text-neutral-300 space-y-3 leading-relaxed">
              <p>
                <strong>The Last Signal</strong> is an interactive psychological horror experience designed for suspense, puzzle solving, and atmospheric storytelling.
              </p>
              <p>
                It contains synthesized low-frequency audio drones, simulated radio static, and subtle visual lighting shifts. It contains NO graphic violence, gore, or disturbing real-world trauma.
              </p>
              <p className="text-neutral-500 text-[11px]">
                Audio levels can be adjusted or muted at any time using the speaker icon in the top header.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onCloseSafetyNotice}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded text-xs"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice Modal */}
      {showPrivacyNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md font-mono text-xs">
          <div className="relative w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <button
              onClick={onClosePrivacyNotice}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-sm text-neutral-100 uppercase tracking-wider mb-4">
              Terminal Privacy & Data Security
            </h3>
            <div className="text-neutral-300 space-y-3 leading-relaxed">
              <p>
                All operator profiles, clues, sound settings, and link preview scan history are stored locally in your browser&apos;s isolated web storage.
              </p>
              <p>
                No third-party trackers, telemetry beacons, or unauthorized external profiling are executed. External links scanned through the Signal Scanner are processed purely for Open Graph metadata extraction and opened in secure sandboxed windows (<code className="text-red-400">rel=&quot;noopener noreferrer&quot;</code>).
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClosePrivacyNotice}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded text-xs"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
