/**
 * Game Layout Component
 * Main layout wrapper for authenticated game pages
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { DayNightOverlay } from '@/components/ui';
import { Header } from './Header';
import { Footer } from './Footer';
import { PlayerSidebar } from './PlayerSidebar';
import { WorldEventBanner } from '@/components/game/WorldEventBanner';
import { DivineMessagePopup, KarmaNotificationToast } from '@/components/karma';
import { useKarma } from '@/hooks/useKarma';
import { logger } from '@/services/logger.service';

/**
 * Layout wrapper for game pages with header and footer
 * Ensures character is loaded for all game routes
 */
export const GameLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter, loadSelectedCharacter } = useCharacterStore();
  const { toasts, dismissToast } = useKarma();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load character ONCE on mount if not already loaded
  useEffect(() => {
    if (!currentCharacter) {
      loadSelectedCharacter().catch((error) => {
        logger.error('Failed to load character', error as Error, { context: 'GameLayout.useEffect' });
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
          <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite" aria-label="Loading game content">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto" aria-hidden="true"></div>
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

      {/* Skip link is provided by App.tsx for the entire application */}

      <Header />

      {/* World Event Banner - Shows active global events */}
      <WorldEventBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Player Sidebar */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-64'} flex-shrink-0`}>
          {!sidebarCollapsed && <PlayerSidebar />}
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-wood-dark hover:bg-wood-light/20 text-gold-light p-1 rounded-r border border-l-0 border-wood-light/30 transition-all"
          style={{ left: sidebarCollapsed ? 0 : '256px' }}
          title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>

        {/* Main Content */}
        <main id="main-content" role="main" aria-label="Game content" className="flex-1 overflow-y-auto px-4 py-8" tabIndex={-1}>
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />

      {/* Divine Message Popup - Shows deity messages/visions */}
      <DivineMessagePopup autoShow={true} />

      {/* Karma Toast Notifications - Shows karma changes, blessings, curses */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <KarmaNotificationToast
              key={toast.id}
              toast={toast}
              onClose={() => dismissToast(toast.id)}
              duration={5000}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameLayout;
