/**
 * GravestoneVisit Component
 * Full-screen immersive experience for visiting a gravestone
 */

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Gravestone, InheritanceClaimResult, DeathType } from '@desperados/shared';
import { InheritanceGame } from './InheritanceGame';

interface GravestoneVisitProps {
  /** Whether the visit modal is open */
  isOpen: boolean;
  /** Gravestone being visited */
  gravestone: Gravestone;
  /** Whether the current character can claim this gravestone */
  canClaim: boolean;
  /** Called to close the visit */
  onClose: () => void;
  /** Called to claim inheritance */
  onClaim: () => Promise<InheritanceClaimResult>;
}

/**
 * Get atmospheric description based on death type
 */
const getAtmosphericText = (deathType: DeathType, location: string): string => {
  const texts: Record<string, string> = {
    COMBAT: `The wind whispers tales of battle as you approach the weathered stone at ${location}.`,
    DUEL: `Dust settles where pistols once blazed. The marker stands silent at ${location}.`,
    EXECUTION: `Justice was served here at ${location}. Whether it was just... the grave does not say.`,
    ENVIRONMENTAL: `Nature claimed another soul at ${location}. The land remembers.`,
    DISEASE: `A simple grave at ${location}. Some battles cannot be won with bullets.`,
    CRIME: `A criminal's end at ${location}. Even outlaws are remembered.`,
    GANG_WAR: `Blood was shed for territory at ${location}. The war continues without them.`,
    BOUNTY_HUNTING: `The hunter became the hunted at ${location}.`,
    TRAIN_ROBBERY: `The iron horse claimed a victim at ${location}.`,
    DIVINE_WRATH: `Even the gods have limits. This one learned that at ${location}.`,
  };

  return texts[deathType] || `A grave stands solemnly at ${location}. The frontier has claimed another.`;
};

export const GravestoneVisit: React.FC<GravestoneVisitProps> = ({
  isOpen,
  gravestone,
  canClaim,
  onClose,
  onClaim,
}) => {
  const [showInheritanceGame, setShowInheritanceGame] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(gravestone.claimed);

  // Handle claim
  const handleClaim = useCallback(async () => {
    const result = await onClaim();
    if (result.success) {
      setHasClaimed(true);
    }
    return result;
  }, [onClaim]);

  // Open inheritance game
  const startInheritanceGame = useCallback(() => {
    setShowInheritanceGame(true);
  }, []);

  // Close inheritance game
  const closeInheritanceGame = useCallback(() => {
    setShowInheritanceGame(false);
    if (hasClaimed) {
      onClose();
    }
  }, [hasClaimed, onClose]);

  if (!isOpen) return null;

  const atmosphericText = getAtmosphericText(gravestone.causeOfDeath, gravestone.deathLocation);

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        {/* Atmospheric backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          {/* Fog effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-gray-900/80" />
          </div>

          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 40}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Moon */}
          <div className="absolute top-20 right-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)]" />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl mx-4 text-center">
          {/* Atmospheric text */}
          <p className="text-gray-400 italic mb-8 animate-fade-in">
            {atmosphericText}
          </p>

          {/* Gravestone */}
          <div className="relative mx-auto mb-8" style={{ animationDelay: '0.5s' }}>
            {/* Stone */}
            <div className="w-72 h-96 mx-auto bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-full border-4 border-gray-500 shadow-2xl relative">
              {/* Texture overlay */}
              <div className="absolute inset-0 opacity-20 rounded-t-full bg-[url('data:image/svg+xml,...')]" />

              {/* Cross */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                <div className="text-5xl text-gray-400 drop-shadow-lg">✟</div>
              </div>

              {/* RIP */}
              <div className="absolute top-20 left-0 right-0 text-center">
                <span className="font-western text-3xl text-gray-300 tracking-[0.5em]">R.I.P.</span>
              </div>

              {/* Name */}
              <div className="absolute top-36 left-0 right-0 text-center px-6">
                <div className="font-western text-2xl text-gray-200 leading-tight">
                  {gravestone.characterName}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Level {gravestone.level}
                </div>
              </div>

              {/* Divider */}
              <div className="absolute top-56 left-8 right-8">
                <div className="h-0.5 bg-gray-500" />
              </div>

              {/* Epitaph */}
              <div className="absolute top-60 left-0 right-0 text-center px-8">
                <p className="text-sm italic text-gray-400 leading-relaxed">
                  "{gravestone.epitaph}"
                </p>
              </div>

              {/* Date */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="text-xs text-gray-500">
                  {new Date(gravestone.diedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Ground */}
            <div className="w-80 h-12 mx-auto bg-gradient-to-t from-amber-950 to-amber-900 rounded-b-lg -mt-2 relative">
              {/* Grass */}
              <div className="absolute -top-3 left-8 text-xl text-green-800">🌿</div>
              <div className="absolute -top-3 right-10 text-xl text-green-800">🌾</div>
              {/* Flowers */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <span className="text-lg">🌷</span>
                <span className="text-lg">🌹</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {!hasClaimed && canClaim && (
              <>
                <p className="text-desert-sand/70">
                  You feel a connection to this ancestor. Their legacy awaits...
                </p>
                <button
                  onClick={startInheritanceGame}
                  className="px-8 py-4 bg-gold-dark hover:bg-gold-medium text-wood-dark font-western text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Claim Your Inheritance
                </button>
              </>
            )}

            {hasClaimed && (
              <div className="text-center">
                <p className="text-gold-light mb-4">
                  You have claimed your ancestor's legacy.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  Leave
                </button>
              </div>
            )}

            {!canClaim && !hasClaimed && (
              <div className="text-center">
                <p className="text-gray-400 italic mb-4">
                  You pay your respects to the fallen.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  Leave
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inheritance Game Modal */}
      <InheritanceGame
        isOpen={showInheritanceGame}
        gravestone={gravestone}
        onClose={closeInheritanceGame}
        onClaim={handleClaim}
      />

      {/* Animation styles */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </>,
    document.body
  );
};

export default GravestoneVisit;
