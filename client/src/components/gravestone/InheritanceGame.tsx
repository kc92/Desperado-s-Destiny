/**
 * InheritanceGame Component
 * Destiny Deck card game played at gravestone to determine inheritance tier
 *
 * Features:
 * - 5-card draw animation
 * - Poker hand evaluation display
 * - Tier reveal with dramatic effect
 * - Rewards summary
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  InheritanceTier,
  InheritanceClaimResult,
  INHERITANCE_TIERS,
  Gravestone,
} from '@desperados/shared';

interface InheritanceGameProps {
  /** Whether the game modal is open */
  isOpen: boolean;
  /** Gravestone being claimed */
  gravestone: Gravestone;
  /** Called to close the modal */
  onClose: () => void;
  /** Called to claim inheritance */
  onClaim: () => Promise<InheritanceClaimResult>;
}

/**
 * Playing card component
 */
const PlayingCard: React.FC<{
  card: string;
  isRevealed: boolean;
  delay: number;
  index: number;
}> = ({ card, isRevealed, delay, index }) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => setFlipped(true), delay);
      return () => clearTimeout(timer);
    }
    setFlipped(false);
  }, [isRevealed, delay]);

  // Parse card string like "A♠" or "10♥"
  const isRed = card.includes('♥') || card.includes('♦');

  return (
    <div
      className="relative w-20 h-28 perspective-1000"
      style={{
        transform: `rotate(${(index - 2) * 8}deg)`,
        transformOrigin: 'bottom center',
      }}
    >
      <div
        className={`
          absolute inset-0 transition-all duration-500 preserve-3d
          ${flipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* Card back */}
        <div
          className={`
            absolute inset-0 backface-hidden
            bg-gradient-to-br from-red-900 to-red-950
            border-4 border-gold-dark rounded-lg
            flex items-center justify-center
          `}
        >
          <div className="text-3xl text-gold-dark/50">🎴</div>
        </div>

        {/* Card front */}
        <div
          className={`
            absolute inset-0 backface-hidden rotate-y-180
            bg-gradient-to-b from-cream to-white
            border-4 border-gray-300 rounded-lg
            flex items-center justify-center
            ${isRed ? 'text-red-600' : 'text-gray-900'}
          `}
        >
          <span className="text-2xl font-bold">{card}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Get tier display info
 */
const getTierInfo = (tier: InheritanceTier): {
  color: string;
  glow: string;
  label: string;
} => {
  const info: Record<InheritanceTier, { color: string; glow: string; label: string }> = {
    [InheritanceTier.MEAGER]: { color: 'text-gray-400', glow: '', label: 'Meager' },
    [InheritanceTier.MODEST]: { color: 'text-gray-300', glow: '', label: 'Modest' },
    [InheritanceTier.FAIR]: { color: 'text-green-400', glow: 'shadow-green-500/30', label: 'Fair' },
    [InheritanceTier.GOOD]: { color: 'text-blue-400', glow: 'shadow-blue-500/30', label: 'Good' },
    [InheritanceTier.GREAT]: { color: 'text-purple-400', glow: 'shadow-purple-500/30', label: 'Great' },
    [InheritanceTier.EXCELLENT]: { color: 'text-yellow-400', glow: 'shadow-yellow-500/40', label: 'Excellent' },
    [InheritanceTier.LEGENDARY]: { color: 'text-orange-400', glow: 'shadow-orange-500/50', label: 'Legendary!' },
    [InheritanceTier.MYTHIC]: { color: 'text-red-400', glow: 'shadow-red-500/60', label: 'MYTHIC!' },
    [InheritanceTier.BLESSED]: { color: 'text-gold-light', glow: 'shadow-gold-light/70', label: 'BLESSED!!' },
  };
  return info[tier];
};

/**
 * Get poker hand name
 */
const getHandName = (tier: InheritanceTier): string => {
  const hands: Record<InheritanceTier, string> = {
    [InheritanceTier.MEAGER]: 'High Card',
    [InheritanceTier.MODEST]: 'Pair',
    [InheritanceTier.FAIR]: 'Two Pair',
    [InheritanceTier.GOOD]: 'Three of a Kind',
    [InheritanceTier.GREAT]: 'Straight',
    [InheritanceTier.EXCELLENT]: 'Flush',
    [InheritanceTier.LEGENDARY]: 'Full House',
    [InheritanceTier.MYTHIC]: 'Four of a Kind',
    [InheritanceTier.BLESSED]: 'Straight Flush',
  };
  return hands[tier];
};

type Phase = 'intro' | 'drawing' | 'revealing' | 'result';

export const InheritanceGame: React.FC<InheritanceGameProps> = ({
  isOpen,
  gravestone,
  onClose,
  onClaim,
}) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<InheritanceClaimResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle draw button
  const handleDraw = useCallback(async () => {
    setPhase('drawing');
    setIsLoading(true);
    setError(null);

    try {
      // Call API to claim inheritance
      const claimResult = await onClaim();

      if (!claimResult.success) {
        setError(claimResult.message);
        setPhase('intro');
        return;
      }

      setResult(claimResult);

      // Animate reveal
      setTimeout(() => setPhase('revealing'), 500);
      setTimeout(() => setPhase('result'), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to claim inheritance');
      setPhase('intro');
    } finally {
      setIsLoading(false);
    }
  }, [onClaim]);

  if (!isOpen) return null;

  const tierInfo = result ? getTierInfo(result.tier) : null;
  const tierConfig = result ? INHERITANCE_TIERS[result.tier] : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={phase === 'result' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-gradient-to-b from-wood-dark to-wood-darker border-4 border-gold-dark rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-gold-dark/30 bg-wood-dark/50">
          <h2 className="font-western text-3xl text-gold-light mb-2">
            Destiny's Deck
          </h2>
          <p className="text-desert-sand/70">
            Draw your cards to claim {gravestone.characterName}'s inheritance
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Intro phase */}
          {phase === 'intro' && (
            <div className="text-center space-y-6">
              <div className="py-8">
                <p className="text-desert-sand mb-4">
                  You stand before the grave of your ancestor, {gravestone.characterName}.
                </p>
                <p className="text-desert-sand/70 italic">
                  "{gravestone.epitaph}"
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-desert-sand/50 mb-2">Available Inheritance:</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl text-gold-light font-bold">
                      ${gravestone.goldPool.toLocaleString()}
                    </div>
                    <div className="text-xs text-desert-sand/50">Gold Pool</div>
                  </div>
                  <div>
                    <div className="text-2xl text-purple-400 font-bold">
                      {gravestone.heirloomItemIds.length}
                    </div>
                    <div className="text-xs text-desert-sand/50">Heirlooms</div>
                  </div>
                  <div>
                    <div className="text-2xl text-blue-400 font-bold">
                      {Object.keys(gravestone.skillMemory).length}
                    </div>
                    <div className="text-xs text-desert-sand/50">Skill Memories</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <button
                onClick={handleDraw}
                disabled={isLoading}
                className="px-8 py-4 bg-gold-dark hover:bg-gold-medium text-wood-dark font-western text-xl rounded-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Drawing...' : 'Draw the Cards of Fate'}
              </button>
            </div>
          )}

          {/* Drawing/Revealing phases */}
          {(phase === 'drawing' || phase === 'revealing') && result && (
            <div className="text-center space-y-6">
              <div className="text-desert-sand/70 mb-4">
                {phase === 'drawing' ? 'Drawing your destiny...' : 'Revealing your fate...'}
              </div>

              {/* Cards display */}
              <div className="flex justify-center items-end gap-2 py-8">
                {result.destinyHand.map((card, i) => (
                  <PlayingCard
                    key={i}
                    card={card}
                    isRevealed={phase === 'revealing'}
                    delay={i * 400}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Result phase */}
          {phase === 'result' && result && tierInfo && tierConfig && (
            <div className="text-center space-y-6 animate-fade-in">
              {/* Hand result */}
              <div className={`${tierInfo.glow} shadow-2xl rounded-lg p-6 bg-black/40`}>
                <div className="text-desert-sand/70 text-sm mb-2">Your Hand:</div>
                <div className={`font-western text-3xl ${tierInfo.color} mb-2`}>
                  {getHandName(result.tier)}
                </div>
                <div className={`font-western text-4xl ${tierInfo.color} animate-pulse`}>
                  {tierInfo.label}
                </div>
              </div>

              {/* Cards */}
              <div className="flex justify-center items-end gap-2">
                {result.destinyHand.map((card, i) => (
                  <div
                    key={i}
                    className="w-16 h-24 bg-cream border-2 border-gray-300 rounded flex items-center justify-center text-xl font-bold"
                    style={{ color: card.includes('♥') || card.includes('♦') ? '#dc2626' : '#1f2937' }}
                  >
                    {card}
                  </div>
                ))}
              </div>

              {/* Rewards */}
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-desert-sand/50 mb-3">You Received:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl text-gold-light font-bold">
                      ${result.goldReceived.toLocaleString()}
                    </div>
                    <div className="text-xs text-desert-sand/50">Gold</div>
                  </div>
                  <div>
                    <div className="text-xl text-purple-400 font-bold">
                      {result.heirlooms.length}
                    </div>
                    <div className="text-xs text-desert-sand/50">Heirlooms</div>
                  </div>
                  <div>
                    <div className="text-xl text-blue-400 font-bold">
                      {Object.keys(result.skillBoosts).length}
                    </div>
                    <div className="text-xs text-desert-sand/50">Skill Boosts</div>
                  </div>
                  {result.divineBlessing && (
                    <div>
                      <div className="text-xl text-gold-light">✨</div>
                      <div className="text-xs text-gold-light">Divine Blessing!</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divine blessing details */}
              {result.divineBlessing && (
                <div className="bg-gold-dark/20 border border-gold-dark/30 rounded-lg p-4">
                  <div className="text-gold-light font-bold">{result.divineBlessing.name}</div>
                  <div className="text-sm text-desert-sand/80">{result.divineBlessing.description}</div>
                </div>
              )}

              {/* Message */}
              <p className="text-desert-sand italic">{result.message}</p>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-gold-dark hover:bg-gold-medium text-wood-dark font-western text-lg rounded-lg transition-all"
              >
                Accept Your Inheritance
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles for card flip */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default InheritanceGame;
