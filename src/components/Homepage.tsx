import React, { useState, useEffect } from 'react';
import { Radio, Volume2, VolumeX, AlertTriangle, ArrowRight, Compass, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { NavSection, GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface HomepageProps {
  onEnter: () => void;
  onNavigate: (section: NavSection) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  progress: GameProgress;
}

export const Homepage: React.FC<HomepageProps> = ({
  onEnter,
  onNavigate,
  isAudioMuted,
  onToggleAudio,
  progress,
}) => {
  // Countdown timer that glitches periodically
  const [secondsLeft, setSecondsLeft] = useState<number>(342); // 05:42
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>('00:05:42');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 600; // loop
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const formatted = `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Periodic glitch
    if (Math.random() < 0.22) {
      setIsGlitching(true);
      const chars = ['#', '!', '?', 'Ø', '8', 'X', '9', '§', '¶', 'Δ'];
      const corrupted = formatted
        .split('')
        .map((c) => (Math.random() < 0.4 ? chars[Math.floor(Math.random() * chars.length)] : c))
        .join('');
      setGlitchText(corrupted);
      const timeout = setTimeout(() => {
        setIsGlitching(false);
        setGlitchText(formatted);
      }, 160);
      return () => clearTimeout(timeout);
    } else {
      setIsGlitching(false);
      setGlitchText(formatted);
    }
  }, [secondsLeft]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Cinematic Background Image with Atmospheric Lighting */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/abandoned_bunker_terminal_1794490565810.jpg"
          alt="Abandoned broadcast bunker terminal"
          className="h-full w-full object-cover object-center filter brightness-45 contrast-125"
          referrerPolicy="no-referrer"
        />
        {/* Deep dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/70" />
        <div className="absolute inset-0 horror-vignette opacity-80" />
      </div>

      {/* Hero Content Section */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Warning Banner */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-red-950 bg-red-950/40 px-3 py-1.5 text-xs font-mono text-red-400">
          <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          <span>FACILITY INCIDENT REPORT // FREQUENCY 108.4 MHz UNSTABLE</span>
        </div>

        {/* Main Title with Distortion Effect */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-white drop-shadow-md">
          THE LAST SIGNAL
        </h1>

        {/* Creepy Tagline */}
        <p className="mt-4 max-w-xl text-lg sm:text-2xl font-light text-neutral-300 tracking-wide italic">
          &ldquo;Something is watching. Something is waiting.&rdquo;
        </p>

        {/* Distorted Countdown Display */}
        <div className="mt-8 flex flex-col items-center">
          <div className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
            SIGNAL DECAY WINDOW
          </div>
          <div
            className={`mt-1 font-mono text-3xl sm:text-4xl font-bold tracking-widest tabular-nums ${
              isGlitching ? 'text-red-500 translate-x-0.5 filter blur-[0.4px]' : 'text-red-400'
            }`}
          >
            {glitchText}
          </div>
          <div className="text-xs text-neutral-400 font-mono mt-1">
            Automated terminal lockdown sequence in progress
          </div>
        </div>

        {/* Atmospheric Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => {
              sound.playStinger();
              sound.startAmbientDrone();
              onEnter();
            }}
            className="group relative w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-display text-base font-bold tracking-widest rounded shadow-lg shadow-red-950/50 transition-all duration-200 active:scale-95"
          >
            <span>ENTER IF YOU DARE</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onToggleAudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded font-mono text-xs transition-colors"
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-red-400" />
                <span>Audio Muted (Click to Enable)</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-green-400" />
                <span>Audio Active</span>
              </>
            )}
          </button>
        </div>

        {/* Atmospheric Warning Message */}
        <p className="mt-8 max-w-lg text-xs text-neutral-400 leading-relaxed">
          WARNING: This interactive archive contains psychological suspense, auditory illusions, and flickering digital frequencies. Headset recommended. No real-world danger exists.
        </p>

        {/* Quick Access Matrix to All Interactive Sections */}
        <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-5 gap-3 text-left">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('abandoned-room');
            }}
            className="p-3 bg-neutral-950/70 border border-neutral-800 hover:border-red-900 rounded group transition-all"
          >
            <div className="text-xs font-mono text-neutral-400">01. EXP</div>
            <div className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors">
              The Abandoned Room
            </div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Explore terminal & clues
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('unknown-chat');
            }}
            className="p-3 bg-neutral-950/70 border border-neutral-800 hover:border-red-900 rounded group transition-all"
          >
            <div className="text-xs font-mono text-neutral-400">02. EXP</div>
            <div className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors">
              The Unknown Chat
            </div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Converse with Entity-7
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('forgotten-files');
            }}
            className="p-3 bg-neutral-950/70 border border-neutral-800 hover:border-red-900 rounded group transition-all"
          >
            <div className="text-xs font-mono text-neutral-400">03. EXP</div>
            <div className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors">
              Forgotten Files
            </div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Redacted military dossiers
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('midnight-test');
            }}
            className="p-3 bg-neutral-950/70 border border-neutral-800 hover:border-red-900 rounded group transition-all"
          >
            <div className="text-xs font-mono text-neutral-400">04. EXP</div>
            <div className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors">
              The Midnight Test
            </div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Ciphers, tuning & riddles
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('link-preview');
            }}
            className="col-span-2 md:col-span-1 p-3 bg-neutral-950/70 border border-neutral-800 hover:border-red-900 rounded group transition-all"
          >
            <div className="text-xs font-mono text-neutral-400">05. TOOL</div>
            <div className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors">
              Link Scanner
            </div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Full Link Preview tool
            </div>
          </button>
        </div>

        {/* Clues & Progress Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-400">
          <div>
            Clues Discovered: <span className="text-red-400 font-bold">{progress.foundClueIds.length}/5</span>
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <div>
            Endings Unlocked: <span className="text-red-400 font-bold">{progress.unlockedEndings.length}/4</span>
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <div>
            Emergency Power: <span className={progress.powerRestored ? 'text-green-400' : 'text-neutral-400'}>{progress.powerRestored ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
