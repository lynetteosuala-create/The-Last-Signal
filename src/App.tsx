/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavSection, GameProgress, UserAccount } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Homepage } from './components/Homepage';
import { AbandonedRoom } from './components/AbandonedRoom';
import { UnknownChat } from './components/UnknownChat';
import { ForgottenFiles } from './components/ForgottenFiles';
import { MidnightTest } from './components/MidnightTest';
import { FinalSecret } from './components/FinalSecret';
import { LinkPreviewScanner } from './components/LinkPreviewScanner';
import { AuthModal } from './components/AuthModal';
import { GlitchOverlay } from './components/GlitchOverlay';
import { AtmosphericParticles } from './components/AtmosphericParticles';
import { sound } from './audio/soundEngine';

const INITIAL_PROGRESS: GameProgress = {
  sanity: 88,
  powerRestored: false,
  safeUnlocked: false,
  cassettePlayed: false,
  frequencyTuned: false,
  cipherSolved: false,
  memorySequencePassed: false,
  moralChoice: null,
  activeEnding: null,
  unlockedEndings: [],
  foundClueIds: [],
};

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('home');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [showSafetyNotice, setShowSafetyNotice] = useState<boolean>(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(false);

  // Load saved progress and active user on mount
  useEffect(() => {
    try {
      const savedUserEmail = localStorage.getItem('active_operator_email');
      if (savedUserEmail) {
        const storedUser = localStorage.getItem(`user_${savedUserEmail}`);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      const savedProgress = localStorage.getItem('last_signal_game_progress');
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem('last_signal_game_progress', JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const handleNavigate = (section: NavSection) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAudio = () => {
    const nextMuted = sound.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      sound.startAmbientDrone();
    }
  };

  const handleDiscoverClue = (clueId: string, clueName: string) => {
    setProgress((prev) => {
      if (prev.foundClueIds.includes(clueId)) return prev;
      return {
        ...prev,
        foundClueIds: [...prev.foundClueIds, clueId],
      };
    });

    setToast({
      title: 'Investigation Clue Acquired',
      message: `${clueName} added to terminal dossier.`,
    });

    setTimeout(() => {
      setToast((current) => (current?.title === 'Investigation Clue Acquired' ? null : current));
    }, 4000);
  };

  const handleRestartExperience = () => {
    sound.playClick();
    setProgress(INITIAL_PROGRESS);
    try {
      localStorage.removeItem('last_signal_game_progress');
    } catch {
      // ignore
    }
    setCurrentSection('home');
    setToast({
      title: 'Facility Reset',
      message: 'Terminal memory scrubbed. Returning to station entrance.',
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sound.playClick();
    setUser(null);
    try {
      localStorage.removeItem('active_operator_email');
    } catch {
      // ignore
    }
    setToast({
      title: 'Operator Logged Out',
      message: 'Terminal session closed.',
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-200 flex flex-col font-sans selection:bg-red-950 selection:text-red-200">
      {/* Interactive atmospheric rain & dust particle system */}
      <AtmosphericParticles initialMode="blend" />

      {/* Visual scanlines, ambient noise vignette and notifications */}
      <GlitchOverlay
        toast={toast}
        onDismissToast={() => setToast(null)}
        showSafetyNotice={showSafetyNotice}
        onCloseSafetyNotice={() => setShowSafetyNotice(false)}
        showPrivacyNotice={showPrivacyNotice}
        onClosePrivacyNotice={() => setShowPrivacyNotice(false)}
      />

      {/* Top Header conforming strictly to Top Bar Contract */}
      <Header
        currentSection={currentSection}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        sanity={progress.sanity}
      />

      {/* Main Experience Viewport */}
      <main className="flex-1 w-full">
        {currentSection === 'home' && (
          <Homepage
            onEnter={() => handleNavigate('abandoned-room')}
            onNavigate={handleNavigate}
            isAudioMuted={isAudioMuted}
            onToggleAudio={handleToggleAudio}
            progress={progress}
          />
        )}

        {currentSection === 'abandoned-room' && (
          <AbandonedRoom
            progress={progress}
            onUpdateProgress={setProgress}
            onDiscoverClue={handleDiscoverClue}
          />
        )}

        {currentSection === 'unknown-chat' && (
          <UnknownChat
            progress={progress}
            onUpdateProgress={setProgress}
            onDiscoverClue={handleDiscoverClue}
          />
        )}

        {currentSection === 'forgotten-files' && (
          <ForgottenFiles
            progress={progress}
            onDiscoverClue={handleDiscoverClue}
          />
        )}

        {currentSection === 'midnight-test' && (
          <MidnightTest
            progress={progress}
            onUpdateProgress={setProgress}
            onDiscoverClue={handleDiscoverClue}
          />
        )}

        {currentSection === 'final-secret' && (
          <FinalSecret
            progress={progress}
            onUpdateProgress={setProgress}
            onNavigate={handleNavigate}
            onRestartExperience={handleRestartExperience}
          />
        )}

        {currentSection === 'link-preview' && <LinkPreviewScanner />}
      </main>

      {/* Clean Unboxed Footer */}
      <Footer
        onOpenSafetyNotice={() => setShowSafetyNotice(true)}
        onOpenPrivacyNotice={() => setShowPrivacyNotice(true)}
      />

      {/* User Accounts & Security Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(authedUser) => {
          setUser(authedUser);
          setToast({
            title: 'Operator Authenticated',
            message: `Welcome, ${authedUser.email}. Clearance level 4 active.`,
          });
          setTimeout(() => setToast(null), 3500);
        }}
      />
    </div>
  );
}
