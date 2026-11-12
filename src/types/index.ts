export type NavSection =
  | 'home'
  | 'abandoned-room'
  | 'unknown-chat'
  | 'forgotten-files'
  | 'midnight-test'
  | 'final-secret'
  | 'link-preview';

export interface UserAccount {
  email: string;
  isVerified: boolean;
  securityPasswordHash?: string;
  createdAt: number;
}

export interface ClueItem {
  id: string;
  name: string;
  category: string;
  description: string;
  foundAt: string;
  isFound: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'entity' | 'system';
  text: string;
  timestamp: string;
  isGlitched?: boolean;
}

export interface ArchiveDocument {
  id: string;
  code: string;
  title: string;
  date: string;
  classification: 'TOP SECRET' | 'RESTRICTED' | 'CORRUPTED';
  summary: string;
  body: string[];
  redactedPhrases: string[];
  imageSrc?: string;
  imageAlt?: string;
  hasAudioWaveform?: boolean;
  audioTranscript?: string;
}

export interface LinkPreviewData {
  url: string;
  domain: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string;
  success: boolean;
  createdAt?: number;
}

export interface GameProgress {
  sanity: number; // 0 - 100
  powerRestored: boolean;
  safeUnlocked: boolean;
  cassettePlayed: boolean;
  frequencyTuned: boolean;
  cipherSolved: boolean;
  memorySequencePassed: boolean;
  moralChoice: 'silence' | 'broadcast' | 'sever' | null;
  activeEnding: 'silence' | 'broadcast' | 'sever' | 'merge' | null;
  unlockedEndings: string[];
  foundClueIds: string[];
}
