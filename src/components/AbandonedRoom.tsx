import React, { useState } from 'react';
import {
  Zap,
  Terminal,
  Volume2,
  FileText,
  Lock,
  Unlock,
  Key,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { GameProgress, ClueItem } from '../types';
import { sound } from '../audio/soundEngine';

interface AbandonedRoomProps {
  progress: GameProgress;
  onUpdateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onDiscoverClue: (clueId: string, clueName: string) => void;
}

type ModalType = 'monitor' | 'tapedeck' | 'breaker' | 'journal' | 'safe' | null;

export const AbandonedRoom: React.FC<AbandonedRoomProps> = ({
  progress,
  onUpdateProgress,
  onDiscoverClue,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);
  const [safeInput, setSafeInput] = useState<string>('');
  const [safeError, setSafeError] = useState<string>('');

  // Breaker switch state: 3 switches
  const [breakerSwitches, setBreakerSwitches] = useState<[boolean, boolean, boolean]>([false, false, false]);

  // Tape deck playback state
  const [isPlayingTape, setIsPlayingTape] = useState<boolean>(false);

  // Monitor decryption state
  const [monitorDecrypted, setMonitorDecrypted] = useState<boolean>(false);

  const handleOpenHotspot = (type: ModalType) => {
    sound.playClick();
    setActiveModal(type);
    setSafeError('');
  };

  const handleCloseModal = () => {
    sound.playClick();
    setActiveModal(null);
  };

  const handleToggleBreaker = (index: 0 | 1 | 2) => {
    sound.playClick();
    const updated: [boolean, boolean, boolean] = [...breakerSwitches];
    updated[index] = !updated[index];
    setBreakerSwitches(updated);

    // Target sequence: [true, false, true]
    if (updated[0] === true && updated[1] === false && updated[2] === true) {
      if (!progress.powerRestored) {
        sound.playChime();
        sound.playStatic(0.3);
        onUpdateProgress((prev) => ({ ...prev, powerRestored: true }));
        onDiscoverClue('breaker-power', 'Auxiliary Power Relay');
      }
    }
  };

  const handlePlayTape = () => {
    if (isPlayingTape) {
      setIsPlayingTape(false);
      return;
    }
    sound.playClick();
    sound.playStatic(0.5);
    setIsPlayingTape(true);
    if (!progress.cassettePlayed) {
      sound.playChime();
      onUpdateProgress((prev) => ({ ...prev, cassettePlayed: true }));
      onDiscoverClue('cassette-log', 'Cassette Log #14');
    }
  };

  const handleDecryptMonitor = () => {
    sound.playStatic(0.4);
    setMonitorDecrypted(true);
    onDiscoverClue('monitor-cipher', 'Terminal Boot Key 108.4');
  };

  const handleSafeDigit = (digit: string) => {
    sound.playClick();
    if (safeInput.length < 4) {
      const next = safeInput + digit;
      setSafeInput(next);
      setSafeError('');
    }
  };

  const handleClearSafe = () => {
    sound.playClick();
    setSafeInput('');
    setSafeError('');
  };

  const handleSafeSubmit = () => {
    // Valid codes: 1968 (year on dossier) or 1084 (frequency)
    if (safeInput === '1968' || safeInput === '1084') {
      sound.playChime();
      onUpdateProgress((prev) => ({ ...prev, safeUnlocked: true }));
      onDiscoverClue('vault-keycard', 'Core Vault Keycard');
      setSafeError('');
    } else {
      sound.playHeartbeat();
      setSafeError('INVALID ACCESS CODE. CHECK LOG DATES.');
      setSafeInput('');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-200">
      {/* Room Header Controls */}
      <div className="border-b border-neutral-900 bg-black/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold tracking-wider text-neutral-100">
              SECTOR 4: SUBTERRANEAN BROADCAST BUNKER
            </h2>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-xs font-mono text-neutral-400">
              Power: {progress.powerRestored ? (
                <span className="text-green-400 font-bold">ONLINE</span>
              ) : (
                <span className="text-red-400 font-bold">OFFLINE</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setFlashlightOn(!flashlightOn);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                flashlightOn
                  ? 'border-amber-700 bg-amber-950/40 text-amber-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{flashlightOn ? 'Flashlight: ON' : 'Flashlight: OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Viewport */}
      <div className="relative mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden rounded-lg border border-neutral-800 bg-black shadow-2xl">
          {/* Bunker Image with Aspect Ratio */}
          <div className="relative aspect-[16/9] w-full select-none overflow-hidden">
            <img
              src="/src/assets/images/abandoned_bunker_terminal_1794490565810.jpg"
              alt="Interactive abandoned broadcast bunker with retro CRT monitors"
              className={`h-full w-full object-cover transition-all duration-700 ${
                flashlightOn ? 'brightness-90 contrast-115' : 'brightness-25 contrast-140'
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Flashlight Focus Radial Mask if turned on */}
            {flashlightOn && (
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.7)_80%)]" />
            )}

            {/* Hotspot 1: CRT Monitor (Left Side) */}
            <button
              onClick={() => handleOpenHotspot('monitor')}
              className="group absolute top-[44%] left-[10%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
              title="Inspect CRT Terminal"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950/80 border border-red-500/80 text-red-200 shadow-lg shadow-red-900/60 animate-pulse">
                <Terminal className="h-5 w-5" />
              </span>
              <span className="mt-1.5 rounded bg-black/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300 border border-neutral-800 whitespace-nowrap opacity-90 group-hover:opacity-100">
                CRT Terminal
              </span>
            </button>

            {/* Hotspot 2: Reel-to-Reel Tape Deck (Right Desk) */}
            <button
              onClick={() => handleOpenHotspot('tapedeck')}
              className="group absolute top-[68%] right-[16%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
              title="Inspect Reel Tape Recorder"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90 border border-neutral-400 text-neutral-200 shadow-lg shadow-neutral-900/60">
                <Volume2 className="h-5 w-5 text-amber-400" />
              </span>
              <span className="mt-1.5 rounded bg-black/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300 border border-neutral-800 whitespace-nowrap opacity-90 group-hover:opacity-100">
                Reel Tape Deck
              </span>
            </button>

            {/* Hotspot 3: Emergency Breaker Box (Far Right Rack) */}
            <button
              onClick={() => handleOpenHotspot('breaker')}
              className="group absolute top-[28%] right-[8%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
              title="Emergency Breaker Panel"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg ${
                  progress.powerRestored
                    ? 'bg-green-950/80 border-green-500 text-green-300 shadow-green-900/50'
                    : 'bg-red-950/80 border-red-600 text-red-300 shadow-red-900/50 animate-pulse'
                }`}
              >
                <Zap className="h-5 w-5" />
              </span>
              <span className="mt-1.5 rounded bg-black/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300 border border-neutral-800 whitespace-nowrap opacity-90 group-hover:opacity-100">
                Breaker Box
              </span>
            </button>

            {/* Hotspot 4: Maintenance Journal (Center Desk) */}
            <button
              onClick={() => handleOpenHotspot('journal')}
              className="group absolute top-[62%] left-[44%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
              title="Examine Scattered Papers & Journal"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90 border border-amber-600/80 text-amber-200 shadow-lg shadow-amber-950/60">
                <FileText className="h-5 w-5" />
              </span>
              <span className="mt-1.5 rounded bg-black/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300 border border-neutral-800 whitespace-nowrap opacity-90 group-hover:opacity-100">
                Operator Journal
              </span>
            </button>

            {/* Hotspot 5: Armored Electronic Safe (Under Desk Left) */}
            <button
              onClick={() => handleOpenHotspot('safe')}
              className="group absolute top-[80%] left-[25%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
              title="Electronic Keycard Safe"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg ${
                  progress.safeUnlocked
                    ? 'bg-green-950/80 border-green-500 text-green-300'
                    : 'bg-neutral-900/90 border-neutral-500 text-neutral-200'
                }`}
              >
                {progress.safeUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </span>
              <span className="mt-1.5 rounded bg-black/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300 border border-neutral-800 whitespace-nowrap opacity-90 group-hover:opacity-100">
                Digital Safe
              </span>
            </button>
          </div>
        </div>

        {/* Inventory and Investigation Clues Status */}
        <div className="mt-6 rounded-lg border border-neutral-900 bg-neutral-950 p-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              Recovered Bunker Artifacts & Evidence
            </h3>
            <span className="font-mono text-xs text-neutral-500">
              Click objects inside the bunker room above to investigate
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div
              className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
                progress.powerRestored
                  ? 'border-green-900/60 bg-green-950/20 text-green-300'
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-500'
              }`}
            >
              <Zap className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">{progress.powerRestored ? 'Power Restored' : 'Breaker Relays'}</div>
                <div className="text-[10px] text-neutral-400">{progress.powerRestored ? 'Auxiliary Grid Active' : 'Switches Offline'}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
                progress.cassettePlayed
                  ? 'border-amber-900/60 bg-amber-950/20 text-amber-300'
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-500'
              }`}
            >
              <Volume2 className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">{progress.cassettePlayed ? 'Tape #14 Decoded' : 'Cassette Reel'}</div>
                <div className="text-[10px] text-neutral-400">{progress.cassettePlayed ? 'Year 1968 Referenced' : 'Unplayed'}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
                monitorDecrypted
                  ? 'border-blue-900/60 bg-blue-950/20 text-blue-300'
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-500'
              }`}
            >
              <Terminal className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">{monitorDecrypted ? 'Terminal Boot Key' : 'CRT Terminal'}</div>
                <div className="text-[10px] text-neutral-400">{monitorDecrypted ? '108.4 MHz Logged' : 'Corrupted Memory'}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
                progress.foundClueIds.includes('operator-journal')
                  ? 'border-purple-900/60 bg-purple-950/20 text-purple-300'
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-500'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">{progress.foundClueIds.includes('operator-journal') ? "Miller's Diary" : "Operator Notes"}</div>
                <div className="text-[10px] text-neutral-400">{progress.foundClueIds.includes('operator-journal') ? 'Found on Desk' : 'Unread'}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
                progress.safeUnlocked
                  ? 'border-red-900/60 bg-red-950/20 text-red-300'
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-500'
              }`}
            >
              <Key className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">{progress.safeUnlocked ? 'Vault Keycard' : 'Digital Safe'}</div>
                <div className="text-[10px] text-neutral-400">{progress.safeUnlocked ? 'Keycard Acquired' : 'Locked (4 Digits)'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CRT TERMINAL */}
      {activeModal === 'monitor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-lg border border-red-900/80 bg-neutral-950 p-6 shadow-2xl font-mono">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-red-500 mb-4">
              <Terminal className="h-5 w-5" />
              <h3 className="font-bold text-sm tracking-widest uppercase">
                CRT MON-01 // BOOT SECTOR DIAGNOSTIC
              </h3>
            </div>

            <div className="bg-black border border-neutral-800 rounded p-4 text-xs space-y-2 text-neutral-300 max-h-64 overflow-y-auto crt-overlay">
              <p className="text-red-400 font-bold">&gt; MEMORY DUMP: OCT 14, 1968</p>
              <p className="text-neutral-400">&gt; CARRIER FREQUENCY DETECTED: 108.40 MHz</p>
              <p className="text-neutral-400">&gt; STATUS: ANOMALOUS MODULATION BEYOND IONOSPHERE</p>
              {monitorDecrypted ? (
                <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded text-red-300 space-y-1">
                  <p className="font-bold">DECRYPTED MESSAGE FROM CHIEF OPERATOR:</p>
                  <p className="italic">
                    &ldquo;Do not answer the carrier frequency directly without the safety limiter. Tune Midnight Relay to 108.4 MHz when ready. The entity is listening through the chat terminal.&rdquo;
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-400">
                  <p className="text-neutral-500">PAYLOAD ENCRYPTION: 7F 2A 99 C4 01 BE ...</p>
                  <button
                    onClick={handleDecryptMonitor}
                    className="mt-3 px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                  >
                    Run Decryption Routine
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-xs"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REEL TAPE RECORDER */}
      {activeModal === 'tapedeck' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-lg border border-amber-900/80 bg-neutral-950 p-6 shadow-2xl font-mono">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <Volume2 className="h-5 w-5" />
              <h3 className="font-bold text-sm tracking-widest uppercase">
                AMPEX 600 // AUDIO LOG #14
              </h3>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                <span>Tape: &ldquo;Session 14 - Anomaly Isolation&rdquo;</span>
                <span className="text-amber-400">Recorded: Oct 1968</span>
              </div>

              {/* Animated tape reels */}
              <div className="flex justify-center items-center gap-12 py-4">
                <div
                  className={`h-16 w-16 rounded-full border-4 border-neutral-700 bg-neutral-800 flex items-center justify-center ${
                    isPlayingTape ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <div className="h-4 w-4 rounded-full bg-neutral-950" />
                </div>
                <div
                  className={`h-16 w-16 rounded-full border-4 border-neutral-700 bg-neutral-800 flex items-center justify-center ${
                    isPlayingTape ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3.5s' }}
                >
                  <div className="h-4 w-4 rounded-full bg-neutral-950" />
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handlePlayTape}
                  className={`px-6 py-2 rounded text-xs font-bold tracking-wider transition-colors ${
                    isPlayingTape
                      ? 'bg-amber-600 hover:bg-amber-500 text-black'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100'
                  }`}
                >
                  {isPlayingTape ? 'Stop Playback' : 'Play Magnetic Tape'}
                </button>
              </div>

              {isPlayingTape && (
                <div className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-300 space-y-2">
                  <p className="text-amber-400 italic">
                    [Static hiss... breathing... tape hum]
                  </p>
                  <p>
                    &ldquo;If anyone finds this... we didn&apos;t pick up a cosmic reflection. It wasn&apos;t a pulsar. It knows we are looking at it. The safe under the desk holds the keycard. The passcode is the year we opened the project: <strong>1968</strong>.&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-xs"
              >
                Close Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BREAKER BOX */}
      {activeModal === 'breaker' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl font-mono">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-neutral-200 mb-4">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm tracking-widest uppercase">
                EMERGENCY AUXILIARY BREAKER BOX
              </h3>
            </div>

            <p className="text-xs text-neutral-400 mb-6">
              Align the 3 relay levers to synchronize backup generators. (Hint: Toggle levers until the relay circuit illuminates green).
            </p>

            <div className="grid grid-cols-3 gap-4 bg-neutral-900 p-6 rounded-lg border border-neutral-800">
              {([0, 1, 2] as const).map((idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-bold">RELAY {idx + 1}</span>
                  <button
                    onClick={() => handleToggleBreaker(idx)}
                    className={`h-24 w-12 rounded-lg border-2 flex flex-col items-center justify-between p-1.5 transition-all ${
                      breakerSwitches[idx]
                        ? 'border-green-600 bg-green-950/40'
                        : 'border-neutral-700 bg-neutral-950'
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-md flex items-center justify-center font-bold text-xs transition-all ${
                        breakerSwitches[idx]
                          ? 'bg-green-500 text-black translate-y-0'
                          : 'bg-neutral-700 text-neutral-300 translate-y-12'
                      }`}
                    >
                      {breakerSwitches[idx] ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs">
                Status:{' '}
                {progress.powerRestored ? (
                  <span className="text-green-400 font-bold">POWER SYNCHRONIZED</span>
                ) : (
                  <span className="text-red-400 font-bold">CIRCUIT BROKEN</span>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-xs"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OPERATOR JOURNAL */}
      {activeModal === 'journal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-lg border border-purple-900/80 bg-neutral-950 p-6 shadow-2xl font-mono">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="font-bold text-sm tracking-widest uppercase">
                CHIEF OPERATOR MILLER&apos;S LOGBOOK
              </h3>
            </div>

            <div className="bg-black/90 border border-neutral-800 rounded p-4 text-xs text-neutral-300 space-y-4 max-h-72 overflow-y-auto">
              <div className="border-b border-neutral-900 pb-2">
                <span className="text-purple-400 font-bold">ENTRY: October 11, 1968</span>
                <p className="mt-1 text-neutral-400">
                  &ldquo;We calibrated the 40-meter parabolic dish to the Northern quadrant. At 03:00 AM, the ambient noise dropped to zero. True silence. Then, a pulse began—a clean 108.4 MHz tone that repeated in triple pulses.&rdquo;
                </p>
              </div>

              <div className="border-b border-neutral-900 pb-2">
                <span className="text-purple-400 font-bold">ENTRY: October 13, 1968</span>
                <p className="mt-1 text-neutral-400">
                  &ldquo;It is not an astronomical body. When we typed questions on the teletype machine, the signal changed its frequency modulation. It answered. It called itself ENTITY-7. It knows our names.&rdquo;
                </p>
              </div>

              <div>
                <span className="text-purple-400 font-bold">FINAL ENTRY: Scrawled in dark ink</span>
                <p className="mt-1 text-red-400 font-semibold italic">
                  &ldquo;Do not trust the broadcast relay. If you enter the Core Chamber, remember the frequency code 108.4. Whatever happens, don&apos;t let it transmit beyond this mountain.&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-between items-center">
              <span className="text-[11px] text-neutral-500">
                Clue saved to investigation journal
              </span>
              <button
                onClick={() => {
                  onDiscoverClue('operator-journal', "Chief Operator Miller's Logbook");
                  handleCloseModal();
                }}
                className="px-4 py-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-xs"
              >
                Close & Record Clue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DIGITAL KEYCARD SAFE */}
      {activeModal === 'safe' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl font-mono">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-neutral-200 mb-4">
              <Lock className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-sm tracking-widest uppercase">
                VAULT SECURITY KEYPAD
              </h3>
            </div>

            {progress.safeUnlocked ? (
              <div className="bg-green-950/40 border border-green-800 rounded p-5 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <h4 className="font-bold text-green-300 text-sm">VAULT UNLOCKED</h4>
                <p className="text-xs text-neutral-300 mt-2">
                  You have retrieved the <strong>Core Vault Keycard</strong>! This grants authorization at the Final Secret terminal.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-400 mb-3">
                  Enter 4-digit security code (Found in audio logs or incident files):
                </p>

                {/* Display */}
                <div className="bg-black border border-neutral-800 rounded p-3 text-center mb-4">
                  <div className="text-2xl font-bold tracking-widest text-red-400 min-h-[32px]">
                    {safeInput.padEnd(4, '•')}
                  </div>
                  {safeError && <div className="text-[10px] text-red-500 mt-1">{safeError}</div>}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENTER'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'CLR') handleClearSafe();
                        else if (key === 'ENTER') handleSafeSubmit();
                        else handleSafeDigit(key);
                      }}
                      className="h-11 rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-sm transition-colors active:scale-95"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-xs"
              >
                Close Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
