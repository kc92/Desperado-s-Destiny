/**
 * Game Layout Component
 * Main layout wrapper for authenticated game pages
 */

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { DayNightOverlay } from '@/components/ui';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Layout wrapper for game pages with header and footer
 * Ensures character is loaded for all game routes
 */
export const GameLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter, loadSelectedCharacter } = useCharacterStore();

  // Load character ONCE on mount if not already loaded
  useEffect(() => {
    if (!currentCharacter) {
      loadSelectedCharacter().catch((error) => {
        console.error('[GameLayout] Failed to load character:', error);
        // If character loading fails, redirect to character select
        navigate('/character-select');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - GameLayout is the single source of truth for character loading

  // Show loading state ONLY while character is being loaded (not for actions/skills)
  // Don't check isLoading because fetchActions/fetchSkills also set it, causing unmount loops
  if (!currentCharacter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto"></div>
              <p className="text-desert-sand font-serif">Loading the frontier...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Day/Night overlay - tints screen based on time of day */}
      <DayNightOverlay enabled={true} />

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-light focus:text-wood-dark focus:rounded focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default GameLayout;
