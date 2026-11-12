import React from 'react';
import { Volume2, VolumeX, ShieldAlert, KeyRound, Radio } from 'lucide-react';
import { NavSection, UserAccount } from '../types';
import { sound } from '../audio/soundEngine';

interface HeaderProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  user: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  sanity: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  isAudioMuted,
  onToggleAudio,
  sanity,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark (single line text element) */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-wider text-red-600 transition-colors hover:text-red-500 whitespace-nowrap shrink-0 font-display"
        >
          <Radio className="h-5 w-5 text-red-600 animate-pulse-subtle" />
          <span>THE LAST SIGNAL</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('abandoned-room');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentSection === 'abandoned-room'
                ? 'text-red-500 font-semibold border-b-2 border-red-600'
                : 'hover:text-neutral-200'
            }`}
          >
            Abandoned Room
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('unknown-chat');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentSection === 'unknown-chat'
                ? 'text-red-500 font-semibold border-b-2 border-red-600'
                : 'hover:text-neutral-200'
            }`}
          >
            Unknown Chat
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('forgotten-files');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentSection === 'forgotten-files'
                ? 'text-red-500 font-semibold border-b-2 border-red-600'
                : 'hover:text-neutral-200'
            }`}
          >
            Forgotten Files
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('midnight-test');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentSection === 'midnight-test'
                ? 'text-red-500 font-semibold border-b-2 border-red-600'
                : 'hover:text-neutral-200'
            }`}
          >
            Midnight Test
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('link-preview');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentSection === 'link-preview'
                ? 'text-red-500 font-semibold border-b-2 border-red-600'
                : 'hover:text-neutral-200'
            }`}
          >
            Signal Scanner
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Audio Mute Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="flex h-9 w-9 items-center justify-center rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-100 transition-colors"
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Sanity Meter Quick Readout */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs border border-neutral-800 rounded bg-neutral-950 font-mono text-neutral-400">
            <span>Sanity:</span>
            <span className={sanity < 35 ? 'text-red-500 font-bold animate-pulse' : 'text-neutral-200 font-medium'}>
              {sanity}%
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block max-w-[120px] truncate text-xs text-neutral-400 font-mono">
                {user.email.split('@')[0]}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded hover:border-red-900 hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 rounded transition-colors whitespace-nowrap shrink-0"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Operator Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between border-t border-neutral-900 bg-black/95 px-3 py-2 text-xs overflow-x-auto gap-2">
        <button
          onClick={() => { sound.playClick(); onNavigate('home'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'home' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Intro
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('abandoned-room'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'abandoned-room' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Room
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('unknown-chat'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'unknown-chat' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Chat
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('forgotten-files'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'forgotten-files' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Files
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('midnight-test'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'midnight-test' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Puzzles
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('final-secret'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'final-secret' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Final
        </button>
        <button
          onClick={() => { sound.playClick(); onNavigate('link-preview'); }}
          className={`px-2 py-1 rounded whitespace-nowrap shrink-0 ${currentSection === 'link-preview' ? 'text-red-500 font-bold bg-neutral-900' : 'text-neutral-400'}`}
        >
          Scanner
        </button>
      </div>
    </header>
  );
};
