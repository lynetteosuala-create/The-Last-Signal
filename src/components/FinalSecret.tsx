import React, { useState } from 'react';
import {
  Key,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Radio,
  Sparkles,
  Lock,
  Unlock,
  Flame,
  Globe,
  Scissors,
  Eye,
} from 'lucide-react';
import { GameProgress, NavSection } from '../types';
import { sound } from '../audio/soundEngine';

interface FinalSecretProps {
  progress: GameProgress;
  onUpdateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onNavigate: (section: NavSection) => void;
  onRestartExperience: () => void;
}

export const FinalSecret: React.FC<FinalSecretProps> = ({
  progress,
  onUpdateProgress,
  onNavigate,
  onRestartExperience,
}) => {
  const [keycardInserted, setKeycardInserted] = useState<boolean>(false);
  const [terminalActivated, setTerminalActivated] = useState<boolean>(false);

  const hasPower = progress.powerRestored;
  const hasKeycard = progress.safeUnlocked;
  const hasTuned = progress.frequencyTuned;
  const hasMoral = !!progress.moralChoice;

  const allPrerequisitesMet = hasPower && hasKeycard && hasTuned && hasMoral;

  const handleInsertKeycard = () => {
    sound.playClick();
    setKeycardInserted(true);
  };

  const handleExecuteEnding = () => {
    sound.playStinger();
    setTerminalActivated(true);

    const endingType = progress.moralChoice || 'silence';
    if (!progress.unlockedEndings.includes(endingType)) {
      onUpdateProgress((prev) => ({
        ...prev,
        activeEnding: endingType,
        unlockedEndings: [...prev.unlockedEndings, endingType],
      }));
    }
  };

  const endingDetails = {
    silence: {
      title: 'ENDING 1: THE SIGNAL SILENCED',
      subtitle: 'The embers go cold in Blackwood Valley.',
      narrative: [
        'You pull the emergency detonation lever.',
        'Deep within the subterranean basalt foundations, the charges detonate in a synchronized shockwave. Tons of shattered concrete collapse into the broadcast silo, crushing the transmitters and tearing the copper transmission dishes apart.',
        'The static ceases. An eerie, profound stillness settles over the mountain.',
        'You climb out into the freezing midnight mist. Humanity will never know how close it came to hearing what lies in the silence. The mystery is buried... but when you look into the night sky, you wonder if it is still looking back.',
      ],
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-950/30 border-red-800',
    },
    broadcast: {
      title: 'ENDING 2: THE SIGNAL UNLEASHED',
      subtitle: 'The carrier wave circles the globe in seven seconds.',
      narrative: [
        'You depress the auxiliary satellite bridge switch.',
        'The massive 40-meter parabolic dish groans on its gears, aiming upward into the ionosphere. Megawatts of power surge through the horn, broadcasting 108.4 MHz into orbital transponders, television relays, and cellular repeaters.',
        'Across every continent, screens flicker to life with the same distorted waveform. Radios hum with the gentle, crystalline melody of Entity-7.',
        'You didn’t destroy the anomaly—you gave it a voice. In the distance, millions of listeners awaken to the sound of the universe whispering in unison.',
      ],
      icon: Globe,
      color: 'text-amber-500',
      bgColor: 'bg-amber-950/30 border-amber-800',
    },
    sever: {
      title: 'ENDING 3: THE ETERNAL LOOP',
      subtitle: 'The transmission plays on for an audience of none.',
      narrative: [
        'You sever the master link and seal the blast doors behind you.',
        'Inside the subterranean bunker, the glowing CRT monitors continue their loop: 108.4 MHz pulsing endlessly in the dark. The magnetic tapes turn without witnesses.',
        'You walk down the gravel road away from the installation. The air is clean and silent.',
        'Yet weeks later, whenever you pick up a telephone, before the dial tone begins, you hear a faint whisper: "We are still waiting, Operator."',
      ],
      icon: Scissors,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30 border-purple-800',
    },
  };

  const activeEndingInfo = progress.activeEnding
    ? endingDetails[progress.activeEnding as keyof typeof endingDetails] || endingDetails.silence
    : endingDetails.silence;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b border-neutral-900 pb-4 mb-6">
          <h2 className="font-display text-xl font-bold tracking-wider text-neutral-100 flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            <span>THE FINAL SECRET // CORE TRANSMISSION VAULT</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Access to the central broadcast core requires verified clearance keys from all sectors.
          </p>
        </div>

        {terminalActivated || progress.activeEnding ? (
          /* Ending Epilogue Display */
          <div className={`rounded-lg border p-8 shadow-2xl ${activeEndingInfo.bgColor}`}>
            <div className="flex items-center gap-3 mb-4">
              <activeEndingInfo.icon className={`h-8 w-8 ${activeEndingInfo.color}`} />
              <div>
                <h3 className={`font-display text-2xl font-black tracking-wider ${activeEndingInfo.color}`}>
                  {activeEndingInfo.title}
                </h3>
                <p className="text-xs text-neutral-400 italic">{activeEndingInfo.subtitle}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs sm:text-sm text-neutral-200 leading-relaxed border-t border-neutral-800 pt-6">
              {activeEndingInfo.narrative.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Endings Record Strip */}
            <div className="mt-8 border-t border-neutral-800 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="text-neutral-400">
                Endings Discovered:{' '}
                <span className="text-red-400 font-bold">{progress.unlockedEndings.length} of 3</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onNavigate('midnight-test');
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded transition-colors"
                >
                  Change Moral Directive
                </button>
                <button
                  onClick={onRestartExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded font-bold transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart Investigation</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Pre-requisite Checklist & Terminal Trigger */
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl">
            <h3 className="font-bold text-sm text-neutral-200 uppercase tracking-wider mb-4">
              Chamber Authorization Interlocks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                className={`p-3.5 rounded border text-xs flex items-center justify-between ${
                  hasPower
                    ? 'border-green-900/60 bg-green-950/20 text-green-300'
                    : 'border-red-950 bg-red-950/10 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="h-4 w-4" />
                  <span>01. Auxiliary Power Relay</span>
                </div>
                <span>{hasPower ? 'VERIFIED' : 'OFFLINE'}</span>
              </div>

              <div
                className={`p-3.5 rounded border text-xs flex items-center justify-between ${
                  hasKeycard
                    ? 'border-green-900/60 bg-green-950/20 text-green-300'
                    : 'border-red-950 bg-red-950/10 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Key className="h-4 w-4" />
                  <span>02. Core Vault Keycard</span>
                </div>
                <span>{hasKeycard ? 'HELD' : 'IN SAFE'}</span>
              </div>

              <div
                className={`p-3.5 rounded border text-xs flex items-center justify-between ${
                  hasTuned
                    ? 'border-green-900/60 bg-green-950/20 text-green-300'
                    : 'border-red-950 bg-red-950/10 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="h-4 w-4" />
                  <span>03. 108.4 MHz Calibration</span>
                </div>
                <span>{hasTuned ? 'TUNED' : 'UNALIGNED'}</span>
              </div>

              <div
                className={`p-3.5 rounded border text-xs flex items-center justify-between ${
                  hasMoral
                    ? 'border-green-900/60 bg-green-950/20 text-green-300'
                    : 'border-red-950 bg-red-950/10 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>04. Final Directive Choice</span>
                </div>
                <span>{hasMoral ? progress.moralChoice?.toUpperCase() : 'NOT SET'}</span>
              </div>
            </div>

            {/* Terminal Actions */}
            {allPrerequisitesMet ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-center">
                <div className="mb-4 text-xs text-neutral-300">
                  All interlocks cleared. Insert Core Vault Keycard into the primary terminal to initiate the final directive.
                </div>

                {!keycardInserted ? (
                  <button
                    onClick={handleInsertKeycard}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 rounded text-xs font-bold transition-all"
                  >
                    <Key className="h-4 w-4 text-amber-400" />
                    <span>Insert Core Vault Keycard</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs text-green-400 font-bold">
                      KEYCARD AUTHORIZED. READY FOR TERMINAL EXECUTION.
                    </div>
                    <button
                      onClick={handleExecuteEnding}
                      className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded font-bold text-sm tracking-widest shadow-lg shadow-red-950/80 transition-all active:scale-95"
                    >
                      EXECUTE FINAL DIRECTIVE ({progress.moralChoice?.toUpperCase()})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>Some chamber prerequisites are incomplete. Check the other sectors first.</span>
                <div className="flex gap-2">
                  {!hasPower && (
                    <button
                      onClick={() => onNavigate('abandoned-room')}
                      className="text-red-400 underline hover:text-red-300"
                    >
                      Bunker Room &rarr;
                    </button>
                  )}
                  {!hasTuned && (
                    <button
                      onClick={() => onNavigate('midnight-test')}
                      className="text-red-400 underline hover:text-red-300"
                    >
                      Midnight Test &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
