import React, { useState } from 'react';
import {
  FileText,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Volume2,
  Lock,
  Download,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { ArchiveDocument, GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface ForgottenFilesProps {
  progress: GameProgress;
  onDiscoverClue: (clueId: string, clueName: string) => void;
}

export const ForgottenFiles: React.FC<ForgottenFilesProps> = ({ progress, onDiscoverClue }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('dossier-01');
  const [revealedRedactions, setRevealedRedactions] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const documents: ArchiveDocument[] = [
    {
      id: 'dossier-01',
      code: 'ARC-1968-09B',
      title: 'Project Echo Operational Debrief',
      date: 'October 14, 1968',
      classification: 'TOP SECRET',
      summary: 'Initial discovery of anomalous auditory carrier wave on 108.4 MHz.',
      imageSrc: '/src/assets/images/classified_signal_anomaly_1794490566312.jpg',
      imageAlt: 'Classified dossier folder with oscilloscope waveform photograph',
      body: [
        'At 02:18 local military time, Station 4 recorded non-random electromagnetic oscillations centered at 108.40 MHz.',
        'Initial assessment attributed the event to atmospheric ionospheric bounce. However, spectrum analyzer sweeps demonstrated complex self-modulating harmonic intervals.',
        'The frequency code [REDACTED_1] was entered into the primary synthesizer, prompting an instantaneous responsive pulse from within the facility receiver.',
        'Subject was given the military designation ENTITY-7. All civilian personnel evacuated immediately under Directive 44.',
      ],
      redactedPhrases: ['108.4 MHz HARMONIC SEED'],
    },
    {
      id: 'dossier-02',
      code: 'SEC-1968-CCTV',
      title: 'Corrupted Surveillance Logs (Corridor B)',
      date: 'October 15, 1968 // 23:47:31',
      classification: 'RESTRICTED',
      summary: 'Security camera capture moments before auxiliary power grid severed.',
      imageSrc: '/src/assets/images/creepy_surveillance_still_1794490565590.jpg',
      imageAlt: 'Monochrome CCTV security capture of an empty industrial corridor with flickering fluorescent fixture',
      body: [
        'Camera unit 04 recorded persistent light fluctuations along subterranean hallway B-9.',
        'Audio track registered low-frequency whispering and localized pressure drops.',
        'At 23:47:31, Senior Operator Miller was documented standing at the door threshold, speaking into an unpowered handheld microphone.',
        'His final recorded words were: [REDACTED_2]. Moments later, the central circuit breakers were manually toggled into the emergency fail-safe state.',
      ],
      redactedPhrases: ['"THE SIGNAL IS NO LONGER OUTSIDE. IT IS INSIDE THE DISPATCH DIAL."'],
    },
    {
      id: 'dossier-03',
      code: 'TEL-1968-DISH',
      title: 'Deep Space Parabolic Dish Array Diagnostic',
      date: 'October 17, 1968',
      classification: 'RESTRICTED',
      summary: 'Physical inspection of the 40-meter receiver antenna in the Blackwood Valley.',
      imageSrc: '/src/assets/images/signal_transmission_dish_1794490567810.jpg',
      imageAlt: 'Weathered radio telescope dish under dark stormy sky and dense fog',
      body: [
        'Field engineers reached the parabolic dish perimeter during heavy mountain mist.',
        'Although all main generator cables were severed at the substation, the dish feed horn continued to emit a faint crimson glow.',
        'The azimuth drive was found locked in place, permanently aimed toward coordinates [REDACTED_3].',
        'Physical access to the dish pedestal is currently quarantined. Decoupling must be conducted through the Subterranean Core Chamber.',
      ],
      redactedPhrases: ['AZIMUTH 342.1° / ELEVATION 89.4° (CELESTIAL POLAR VOID)'],
    },
    {
      id: 'dossier-04',
      code: 'SIG-1968-SPEC',
      title: 'Autopsy of Carrier Signal 89-K',
      date: 'November 02, 1968',
      classification: 'CORRUPTED',
      summary: 'Biometric and cognitive analysis of operators exposed to the broadcast.',
      hasAudioWaveform: true,
      audioTranscript:
        '[Static hum] ... Operator Miller: "It sounds like a flute carved out of glass... once you hear the rhythm in the static, you can’t make it stop. You start hearing it in refrigerator motors. In fluorescent light bulbs." [Tone burst]',
      body: [
        'Medical examination of remaining research staff revealed severe insomnia, heightened auditory sensitivity, and shared auditory hallucinations.',
        'All subjects repeatedly reproduced the same 5-tone frequency pattern during testing.',
        'Conclusion: The signal does not transmit data; it transmits a cognitive structure. Prolonged exposure causes complete integration.',
        'Warning: Do not listen to raw unmodulated tape recordings without cognitive grounding.',
      ],
      redactedPhrases: ['SUBJECT CONSCIOUSNESS SUCCESSFULLY BOUND TO REPEATER MEMORY'],
    },
  ];

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const toggleRedaction = (phraseKey: string) => {
    sound.playClick();
    setRevealedRedactions((prev) => ({
      ...prev,
      [phraseKey]: !prev[phraseKey],
    }));
    onDiscoverClue('dossier-unredacted', 'Classified Incident Record');
  };

  const handlePlayWaveform = () => {
    sound.playClick();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      sound.playStatic(0.8);
      sound.playRadioSweep(0.4);
      onDiscoverClue('audio-spectral', 'Harmonic 89-K Audio Spectrogram');
      setTimeout(() => setIsPlayingAudio(false), 4500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-4 mb-6 gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wider text-neutral-100 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-red-500" />
              <span>THE FORGOTTEN FILES // ARCHIVE REPOSITORY</span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Declassified military dossiers, surveillance stills, and harmonic spectrographs from Station 4.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playChime();
              const allRevealed: Record<string, boolean> = {};
              documents.forEach((d) => {
                d.redactedPhrases.forEach((p) => {
                  allRevealed[p] = true;
                });
              });
              setRevealedRedactions(allRevealed);
              onDiscoverClue('all-dossiers-unlocked', 'Complete Classified Archive');
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-300 transition-colors shrink-0"
          >
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>Declassify All Redactions</span>
          </button>
        </div>

        {/* 2-Column Archive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document File Selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
              Classified Dossiers
            </div>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedDocId(doc.id);
                }}
                className={`w-full text-left p-3.5 rounded border transition-all ${
                  selectedDocId === doc.id
                    ? 'border-red-800 bg-neutral-900/90 text-neutral-100'
                    : 'border-neutral-900 bg-neutral-950/60 text-neutral-400 hover:border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-red-400 font-bold">{doc.code}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                      doc.classification === 'TOP SECRET'
                        ? 'bg-red-950 text-red-300'
                        : doc.classification === 'CORRUPTED'
                        ? 'bg-purple-950 text-purple-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {doc.classification}
                  </span>
                </div>
                <div className="font-semibold text-sm line-clamp-1">{doc.title}</div>
                <div className="text-xs text-neutral-500 mt-1 line-clamp-1">{doc.date}</div>
              </button>
            ))}
          </div>

          {/* Document Content Viewer (8 Cols) */}
          <div className="lg:col-span-8 rounded-lg border border-neutral-800 bg-black/90 p-6 shadow-2xl font-mono text-xs">
            {/* Dossier Header */}
            <div className="border-b border-neutral-900 pb-4 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-red-500 font-bold uppercase tracking-widest text-sm">
                  {currentDoc.code} // {currentDoc.classification}
                </span>
                <span className="text-neutral-500 text-xs">{currentDoc.date}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-100">{currentDoc.title}</h3>
              <p className="text-neutral-400 mt-1 italic">{currentDoc.summary}</p>
            </div>

            {/* Photography / Surveillance Stills Slot */}
            {currentDoc.imageSrc && (
              <div className="mb-6 overflow-hidden rounded border border-neutral-800 bg-neutral-950">
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full">
                  <img
                    src={currentDoc.imageSrc}
                    alt={currentDoc.imageAlt || currentDoc.title}
                    className="h-full w-full object-cover filter contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 text-[10px] text-neutral-400 font-mono border border-neutral-800">
                    EXHIBIT PHOTO // {currentDoc.code}
                  </div>
                </div>
              </div>
            )}

            {/* Audio Log / Spectrogram Section if present */}
            {currentDoc.hasAudioWaveform && (
              <div className="mb-6 rounded border border-purple-900/60 bg-purple-950/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Volume2 className="h-4 w-4" />
                    <span>AUDIO SPECTROGRAM ANALYSIS</span>
                  </div>
                  <button
                    onClick={handlePlayWaveform}
                    className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  >
                    {isPlayingAudio ? 'Transmitting Harmonic...' : 'Play Spectrogram Audio'}
                  </button>
                </div>

                {/* Animated waveform bars */}
                <div className="flex items-end justify-between h-14 bg-black/60 rounded p-2 gap-1">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t transition-all duration-150 ${
                        isPlayingAudio ? 'bg-purple-500' : 'bg-neutral-800'
                      }`}
                      style={{
                        height: isPlayingAudio
                          ? `${20 + Math.sin((i + Date.now() / 150) * 0.8) * 40 + Math.random() * 30}%`
                          : `${15 + (i % 5) * 8}%`,
                      }}
                    />
                  ))}
                </div>

                {currentDoc.audioTranscript && (
                  <div className="mt-3 p-2.5 bg-black/80 rounded border border-neutral-900 text-[11px] text-neutral-300">
                    <span className="text-purple-400 font-semibold">Transcript:</span>{' '}
                    {currentDoc.audioTranscript}
                  </div>
                )}
              </div>
            )}

            {/* Document Body with Interactive Clickable Redactions */}
            <div className="space-y-4 leading-relaxed text-neutral-300">
              {currentDoc.body.map((paragraph, pIdx) => {
                let renderedText = paragraph;
                currentDoc.redactedPhrases.forEach((phrase) => {
                  const isRevealed = !!revealedRedactions[phrase];
                  const redactedPlaceholder = `[REDACTED_${pIdx + 1}]`;

                  if (renderedText.includes(redactedPlaceholder)) {
                    renderedText = renderedText.replace(
                      redactedPlaceholder,
                      isRevealed ? `[UNLOCKED: ${phrase}]` : '[REDACTED // CLICK TO REVEAL]'
                    );
                  }
                });

                return (
                  <p
                    key={pIdx}
                    onClick={() => {
                      currentDoc.redactedPhrases.forEach((phrase) => toggleRedaction(phrase));
                    }}
                    className="cursor-pointer hover:bg-neutral-900/40 p-1.5 rounded transition-colors"
                  >
                    {renderedText}
                  </p>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="mt-6 border-t border-neutral-900 pt-3 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Security Classification: Level 4 Terminal Eyes Only</span>
              <span className="text-red-400">Station 108.4 MHz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
