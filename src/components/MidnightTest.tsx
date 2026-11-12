import React, { useState } from 'react';
import {
  Radio,
  Sliders,
  Binary,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  Globe,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface MidnightTestProps {
  progress: GameProgress;
  onUpdateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onDiscoverClue: (clueId: string, clueName: string) => void;
}

export const MidnightTest: React.FC<MidnightTestProps> = ({
  progress,
  onUpdateProgress,
  onDiscoverClue,
}) => {
  const [activeTab, setActiveTab] = useState<'tuner' | 'cipher' | 'memory' | 'moral'>('tuner');

  // Challenge 1: Frequency Tuner
  const [frequency, setFrequency] = useState<number>(94.2);
  const targetFrequency = 108.4;
  const isFrequencyMatched = Math.abs(frequency - targetFrequency) <= 0.15;

  // Challenge 2: Substitution Cipher
  const [cipherInput, setCipherInput] = useState<string>('');
  const [cipherSolved, setCipherSolved] = useState<boolean>(progress.cipherSolved);
  const [cipherError, setCipherError] = useState<string>('');

  // Challenge 3: Void Memory Sequence
  const [sequencePattern] = useState<number[]>([1, 3, 0, 2]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [memoryPassed, setMemoryPassed] = useState<boolean>(progress.memorySequencePassed);

  // Challenge 4: Moral Choice
  const [selectedMoral, setSelectedMoral] = useState<'silence' | 'broadcast' | 'sever' | null>(
    progress.moralChoice
  );

  const handleFrequencyChange = (val: number) => {
    setFrequency(val);
    const ratio = (val - 88) / 30;
    sound.playRadioSweep(ratio);

    if (Math.abs(val - targetFrequency) <= 0.15) {
      if (!progress.frequencyTuned) {
        sound.playChime();
        onUpdateProgress((prev) => ({ ...prev, frequencyTuned: true }));
        onDiscoverClue('frequency-tuned', 'Calibrated 108.4 MHz Carrier');
      }
    }
  };

  const handleCipherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (cipherInput.trim().toUpperCase() === 'SIGNAL') {
      sound.playChime();
      setCipherSolved(true);
      setCipherError('');
      onUpdateProgress((prev) => ({ ...prev, cipherSolved: true }));
      onDiscoverClue('cipher-solved', 'Decoded Broadcast Keyword: SIGNAL');
    } else {
      sound.playHeartbeat();
      setCipherError('INCORRECT DECRYPTION KEY. SHIFT = -3 (CAESAR CIPHER)');
    }
  };

  const playMemoryPattern = () => {
    sound.playClick();
    setIsSequencePlaying(true);
    setUserSequence([]);

    sequencePattern.forEach((nodeIdx, step) => {
      setTimeout(() => {
        setHighlightedNode(nodeIdx);
        sound.playRadioSweep(0.2 + nodeIdx * 0.2);
        setTimeout(() => setHighlightedNode(null), 350);

        if (step === sequencePattern.length - 1) {
          setTimeout(() => setIsSequencePlaying(false), 400);
        }
      }, (step + 1) * 600);
    });
  };

  const handleMemoryNodeClick = (nodeIdx: number) => {
    if (isSequencePlaying || memoryPassed) return;
    sound.playRadioSweep(0.2 + nodeIdx * 0.2);

    const nextUserSeq = [...userSequence, nodeIdx];
    setUserSequence(nextUserSeq);

    // Check correctness
    const currentStep = nextUserSeq.length - 1;
    if (nextUserSeq[currentStep] !== sequencePattern[currentStep]) {
      sound.playHeartbeat();
      setUserSequence([]);
      return;
    }

    if (nextUserSeq.length === sequencePattern.length) {
      sound.playChime();
      setMemoryPassed(true);
      onUpdateProgress((prev) => ({ ...prev, memorySequencePassed: true }));
      onDiscoverClue('void-memory-passed', 'Void Resonance Pattern Key');
    }
  };

  const handleSelectMoral = (choice: 'silence' | 'broadcast' | 'sever') => {
    sound.playStinger();
    setSelectedMoral(choice);
    onUpdateProgress((prev) => ({
      ...prev,
      moralChoice: choice,
      activeEnding: choice,
    }));
    onDiscoverClue('moral-choice', `Directive Selected: ${choice.toUpperCase()}`);
  };

  const completedCount =
    (progress.frequencyTuned ? 1 : 0) +
    (progress.cipherSolved ? 1 : 0) +
    (progress.memorySequencePassed ? 1 : 0) +
    (selectedMoral ? 1 : 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-4 mb-6 gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wider text-neutral-100 flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500" />
              <span>THE MIDNIGHT TEST // COGNITIVE TRIALS</span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Solve the four terminal trials to unlock authorization codes for the Final Secret chamber.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span>Trials Passed:</span>
            <span className="text-red-400 font-bold">{completedCount}/4</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-1 bg-black rounded-lg border border-neutral-900 mb-6 overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tuner');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'tuner'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>01. Resonance Tuner</span>
            {progress.frequencyTuned && <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('cipher');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'cipher'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Binary className="h-3.5 w-3.5" />
            <span>02. Caesar Cipher</span>
            {progress.cipherSolved && <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('memory');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'memory'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>03. Void Memory</span>
            {progress.memorySequencePassed && <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('moral');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'moral'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>04. Moral Conundrum</span>
            {selectedMoral && <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />}
          </button>
        </div>

        {/* TAB 1: RESONANCE TUNER */}
        {activeTab === 'tuner' && (
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-neutral-100 text-sm">TRIAL 01: HARMONIC FREQUENCY CALIBRATION</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Slide the analog tuner to lock onto the anomalous carrier frequency (Reference clue: 108.4 MHz).
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isFrequencyMatched ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'
                }`}
              >
                {isFrequencyMatched ? 'CARRIER LOCKED' : 'SEARCHING FREQUENCY'}
              </span>
            </div>

            {/* Dial / Frequency Readout */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-center mb-6">
              <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                Current Tuner Frequency
              </div>
              <div className="text-5xl font-black tracking-wider text-red-500 tabular-nums">
                {frequency.toFixed(1)} <span className="text-2xl text-neutral-400">MHz</span>
              </div>

              {/* Oscilloscope simulation wave */}
              <div className="mt-6 flex items-center justify-center gap-1 h-16 bg-black rounded p-2">
                {Array.from({ length: 48 }).map((_, i) => {
                  const dist = Math.abs(frequency - targetFrequency);
                  const amplitude = Math.max(5, 50 - dist * 8);
                  const h = Math.sin((i / 48) * Math.PI * 4) * amplitude + 35;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isFrequencyMatched ? 'bg-green-400' : 'bg-red-900/60'
                      }`}
                      style={{ height: `${Math.max(4, h)}%` }}
                    />
                  );
                })}
              </div>

              {/* Slider Control */}
              <div className="mt-8 max-w-lg mx-auto">
                <input
                  type="range"
                  min="88.0"
                  max="118.0"
                  step="0.1"
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 mt-2">
                  <span>88.0 MHz</span>
                  <span>100.0 MHz</span>
                  <span className="text-red-400 font-bold">108.4 MHz</span>
                  <span>118.0 MHz</span>
                </div>
              </div>
            </div>

            {isFrequencyMatched && (
              <div className="p-4 bg-green-950/30 border border-green-800/80 rounded-lg text-xs text-green-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <strong>FREQUENCY 108.4 MHz SYNCHRONIZED:</strong> The carrier wave aligns perfectly with the station oscillators. Frequency authorization verified!
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAESAR CIPHER */}
        {activeTab === 'cipher' && (
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-neutral-100 text-sm">TRIAL 02: THE CAESAR TRANSMISSION CIPHER</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Decode the encrypted radio intercept using the standard military shift of -3.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  cipherSolved ? 'bg-green-950 text-green-300' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {cipherSolved ? 'CIPHER SOLVED' : 'ENCRYPTED'}
              </span>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
                  Intercepted Ciphertext
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-[0.5em] text-amber-400">
                  V - L - J - Q - D - O
                </div>
                <p className="text-xs text-neutral-400 mt-3 max-w-md mx-auto">
                  Hint: Shift each letter backwards by 3 positions in the alphabet (V &rarr; S, L &rarr; I, J &rarr; G ...). What 6-letter English word forms the keyword?
                </p>
              </div>

              {cipherSolved ? (
                <div className="mt-6 p-4 bg-green-950/30 border border-green-800 rounded text-center text-xs text-green-300">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-green-400 mb-1" />
                  <p className="font-bold text-sm">DECRYPTED WORD: &ldquo;SIGNAL&rdquo;</p>
                  <p className="text-neutral-400 mt-1">Authorization phrase accepted for terminal protocol.</p>
                </div>
              ) : (
                <form onSubmit={handleCipherSubmit} className="mt-6 max-w-sm mx-auto flex flex-col gap-3">
                  <input
                    type="text"
                    value={cipherInput}
                    onChange={(e) => setCipherInput(e.target.value)}
                    placeholder="Enter decrypted word..."
                    className="rounded border border-neutral-800 bg-black px-4 py-2.5 text-center text-sm font-bold tracking-widest uppercase text-white focus:border-red-600 focus:outline-none"
                  />
                  {cipherError && <div className="text-xs text-red-500 text-center">{cipherError}</div>}
                  <button
                    type="submit"
                    className="py-2.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                  >
                    Submit Decryption Key
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VOID MEMORY */}
        {activeTab === 'memory' && (
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-neutral-100 text-sm">TRIAL 03: THE VOID RESONANCE SEQUENCE</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Listen and watch the harmonic beacon pulse in sequence, then replicate the exact pattern.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  memoryPassed ? 'bg-green-950 text-green-300' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {memoryPassed ? 'RESONANCE VERIFIED' : 'PENDING SEQUENCE'}
              </span>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 flex flex-col items-center mb-6">
              <div className="grid grid-cols-2 gap-4 max-w-xs w-full mb-6">
                {['NORTH BEACON', 'EAST BEACON', 'SOUTH BEACON', 'WEST BEACON'].map((label, idx) => (
                  <button
                    key={idx}
                    disabled={isSequencePlaying || memoryPassed}
                    onClick={() => handleMemoryNodeClick(idx)}
                    className={`h-24 rounded-lg border-2 flex flex-col items-center justify-center p-3 transition-all ${
                      highlightedNode === idx
                        ? 'border-red-500 bg-red-950 text-white scale-105 shadow-lg shadow-red-900/80'
                        : userSequence.includes(idx) && !memoryPassed
                        ? 'border-neutral-700 bg-neutral-900 text-neutral-300'
                        : 'border-neutral-800 bg-black text-neutral-500 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full mb-2 ${
                        highlightedNode === idx ? 'bg-red-400 animate-ping' : 'bg-neutral-800'
                      }`}
                    />
                    <span className="text-[11px] font-bold">{label}</span>
                  </button>
                ))}
              </div>

              {!memoryPassed && (
                <button
                  onClick={playMemoryPattern}
                  disabled={isSequencePlaying}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 border border-neutral-800 rounded text-xs font-semibold transition-colors"
                >
                  {isSequencePlaying ? 'Beacon Transmitting...' : 'Play Resonance Sequence'}
                </button>
              )}

              {memoryPassed && (
                <div className="p-3 bg-green-950/30 border border-green-800 rounded text-center text-xs text-green-300">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-green-400 mb-1" />
                  Sequence replicated successfully! Void harmonic attuned.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MORAL CONUNDRUM */}
        {activeTab === 'moral' && (
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-neutral-100 text-sm">TRIAL 04: THE FINAL MORAL CONUNDRUM</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Determine the fate of the transmission before stepping into the Final Secret chamber.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-neutral-800 text-neutral-300">
                {selectedMoral ? `SELECTED: ${selectedMoral.toUpperCase()}` : 'CHOICE REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Choice A: Silence */}
              <button
                onClick={() => handleSelectMoral('silence')}
                className={`text-left p-5 rounded-lg border transition-all flex flex-col justify-between ${
                  selectedMoral === 'silence'
                    ? 'border-red-600 bg-red-950/40 text-red-100'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2">
                    <Flame className="h-4 w-4" />
                    <span>DIRECTIVE: SILENCE</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Detonate the subterranean station relays. Bury Entity-7 beneath 500 tons of rock. The world is spared, but the truth will die in ashes.
                  </p>
                </div>
                <div className="mt-4 text-[11px] text-red-400 font-bold">
                  {selectedMoral === 'silence' ? '✓ Directive Locked' : 'Select Silence'}
                </div>
              </button>

              {/* Choice B: Broadcast */}
              <button
                onClick={() => handleSelectMoral('broadcast')}
                className={`text-left p-5 rounded-lg border transition-all flex flex-col justify-between ${
                  selectedMoral === 'broadcast'
                    ? 'border-amber-600 bg-amber-950/40 text-amber-100'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                    <Globe className="h-4 w-4" />
                    <span>DIRECTIVE: BROADCAST</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Override the safety limiters and beam the carrier wave into global satellite networks. Humanity will awaken to the truth, even if it breaks reality.
                  </p>
                </div>
                <div className="mt-4 text-[11px] text-amber-400 font-bold">
                  {selectedMoral === 'broadcast' ? '✓ Directive Locked' : 'Select Broadcast'}
                </div>
              </button>

              {/* Choice C: Sever */}
              <button
                onClick={() => handleSelectMoral('sever')}
                className={`text-left p-5 rounded-lg border transition-all flex flex-col justify-between ${
                  selectedMoral === 'sever'
                    ? 'border-purple-600 bg-purple-950/40 text-purple-100'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
                    <Scissors className="h-4 w-4" />
                    <span>DIRECTIVE: SEVER</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Sever your own connection and lock the facility in an eternal closed loop. You walk out into the dawn, but the ghost frequency hums in your ears forever.
                  </p>
                </div>
                <div className="mt-4 text-[11px] text-purple-400 font-bold">
                  {selectedMoral === 'sever' ? '✓ Directive Locked' : 'Select Sever'}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
