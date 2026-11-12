import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface FooterProps {
  onOpenPrivacyNotice: () => void;
  onOpenSafetyNotice: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyNotice, onOpenSafetyNotice }) => {
  return (
    <footer className="w-full border-t border-neutral-900 bg-black/95 text-xs text-neutral-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Radio className="h-4 w-4 text-red-600" />
          <span className="font-display font-semibold text-neutral-200">THE LAST SIGNAL</span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span>Station 108.4 MHz</span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span>Psychological Mystery Experience</span>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-neutral-400">
          <button
            onClick={() => {
              sound.playClick();
              onOpenSafetyNotice();
            }}
            className="hover:text-red-400 transition-colors"
          >
            Atmospheric Advisory
          </button>
          <span aria-hidden="true" className="text-neutral-700">/</span>
          <button
            onClick={() => {
              sound.playClick();
              onOpenPrivacyNotice();
            }}
            className="hover:text-neutral-200 transition-colors"
          >
            Terminal Privacy & Data
          </button>
          <span aria-hidden="true" className="text-neutral-700">/</span>
          <span>© 2026 Blackwood Transmission Archives</span>
        </div>
      </div>
    </footer>
  );
};
