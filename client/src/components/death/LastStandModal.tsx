/**
 * LastStandModal Component
 * Blood-red dramatic modal for the Last Stand karma judgement
 *
 * Features:
 * - Blood-red modal with dark backdrop blur
 * - Deity quote displayed prominently with western font
 * - Karma dimension bars flash to show which deity is judging
 * - 2-3 second dramatic reveal before outcome
 * - The Gambler: Golden card animation, Ace of Spades flutter
 * - The Outlaw King: Dark smoke effect, scarred figure silhouette
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  DivineSalvation,
  DeityType,
  // SalvationType, // Unused - type inferred from DivineSalvation
  KarmaJudgement,
  PermadeathOutcome,
} from '@desperados/shared';

interface LastStandModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Karma judgement data */
  karmaJudgement: KarmaJudgement;
  /** Divine salvation result (if saved) */
  salvation: DivineSalvation | null;
  /** Permadeath outcome (if died) */
  permadeath: PermadeathOutcome | null;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called when the outcome has been acknowledged */
  onAcknowledge: () => void;
}

/**
 * Animated playing card component for The Gambler
 */
const GamblerCardAnimation: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    {/* Floating cards */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="absolute text-6xl animate-float-card opacity-70"
        style={{
          left: `${20 + i * 15}%`,
          top: `${30 + Math.sin(i) * 20}%`,
          animationDelay: `${i * 0.3}s`,
          transform: `rotate(${-30 + i * 15}deg)`,
        }}
      >
        {['🂡', '🂢', '🂣', '🂤', '🂥'][i]}
      </div>
    ))}
    {/* Central Ace of Spades */}
    <div className="text-9xl animate-pulse drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]">
      🂡
    </div>
  </div>
);

/**
 * Dark smoke effect for The Outlaw King
 */
const OutlawKingAnimation: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    {/* Smoke tendrils */}
    <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-950/30 to-black/60 animate-pulse" />
    {/* Dark figure silhouette */}
    <div className="relative">
      <div className="text-9xl animate-float opacity-80 drop-shadow-[0_0_30px_rgba(127,29,29,1)]">
        👤
      </div>
      {/* Glowing eyes */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-6">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
      </div>
    </div>
  </div>
);

/**
 * Karma bar component showing dimension scores
 */
const KarmaBar: React.FC<{
  label: string;
  value: number;
  isFlashing: boolean;
  color: 'gold' | 'red';
}> = ({ label, value, isFlashing, color }) => {
  const barColor = color === 'gold'
    ? 'from-yellow-600 to-yellow-400'
    : 'from-red-700 to-red-500';

  return (
    <div className={`${isFlashing ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-desert-sand/70">{label}</span>
        <span className={color === 'gold' ? 'text-yellow-400' : 'text-red-400'}>
          {value}
        </span>
      </div>
      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Death skull animation for permadeath
 */
const DeathAnimation: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-[150px] animate-pulse drop-shadow-[0_0_40px_rgba(127,29,29,1)]">
      💀
    </div>
  </div>
);

type Phase = 'judging' | 'revealing' | 'outcome';

export const LastStandModal: React.FC<LastStandModalProps> = ({
  isOpen,
  karmaJudgement,
  salvation,
  permadeath,
  onClose,
  onAcknowledge,
}) => {
  const [phase, setPhase] = useState<Phase>('judging');
  const [showContent, setShowContent] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('judging');
      setShowContent(false);

      // Show content after brief delay
      const showTimer = setTimeout(() => setShowContent(true), 100);

      // Move to revealing phase after 2 seconds
      const revealTimer = setTimeout(() => setPhase('revealing'), 2000);

      // Move to outcome phase after 3.5 seconds
      const outcomeTimer = setTimeout(() => setPhase('outcome'), 3500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(revealTimer);
        clearTimeout(outcomeTimer);
      };
    }
  }, [isOpen]);

  // Determine which deity is judging based on karma
  const primaryDeity = karmaJudgement.gamblerScore > karmaJudgement.outlawScore
    ? DeityType.THE_GAMBLER
    : DeityType.THE_OUTLAW_KING;

  // Get dramatic quote based on phase and outcome
  const getQuote = (): string => {
    if (phase === 'judging') {
      return primaryDeity === DeityType.THE_GAMBLER
        ? '"The cards are being dealt..."'
        : '"The shadows gather to judge..."';
    }

    if (phase === 'revealing') {
      return primaryDeity === DeityType.THE_GAMBLER
        ? '"Your soul hangs in the balance..."'
        : '"Your deeds echo in the darkness..."';
    }

    // Outcome phase
    if (salvation) {
      return salvation.message;
    }

    return `"The frontier claims another..."`;
  };

  // Handle acknowledgement
  const handleAcknowledge = useCallback(() => {
    onAcknowledge();
    onClose();
  }, [onAcknowledge, onClose]);

  if (!isOpen) return null;

  const wasSaved = salvation !== null;
  const savingDeity = salvation?.deity;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        transition-all duration-500
        ${showContent ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={phase === 'outcome' ? handleAcknowledge : undefined}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10
          w-full max-w-2xl mx-4
          rounded-lg overflow-hidden
          transition-all duration-500 transform
          ${showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${wasSaved ? 'shadow-[0_0_60px_rgba(234,179,8,0.3)]' : 'shadow-[0_0_60px_rgba(127,29,29,0.5)]'}
        `}
        style={{
          background: wasSaved && savingDeity === DeityType.THE_GAMBLER
            ? 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
            : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #450a0a 100%)',
        }}
      >
        {/* Deity animation overlay */}
        {phase !== 'outcome' && (
          <>
            {primaryDeity === DeityType.THE_GAMBLER ? (
              <GamblerCardAnimation />
            ) : (
              <OutlawKingAnimation />
            )}
          </>
        )}

        {/* Outcome animations */}
        {phase === 'outcome' && (
          <>
            {wasSaved && savingDeity === DeityType.THE_GAMBLER && <GamblerCardAnimation />}
            {wasSaved && savingDeity === DeityType.THE_OUTLAW_KING && <OutlawKingAnimation />}
            {!wasSaved && <DeathAnimation />}
          </>
        )}

        {/* Content */}
        <div className="relative z-20 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="font-western text-4xl text-gold-light mb-2">
              {phase === 'outcome'
                ? wasSaved ? 'SAVED' : 'PERMADEATH'
                : 'LAST STAND'}
            </h2>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-gold-light to-transparent" />
          </div>

          {/* Dramatic Quote */}
          <div className="text-center mb-8">
            <p
              className={`
                font-western text-2xl italic
                ${wasSaved ? 'text-gold-light' : 'text-red-300'}
                transition-all duration-500
              `}
            >
              {getQuote()}
            </p>
          </div>

          {/* Karma bars (only during judging/revealing) */}
          {phase !== 'outcome' && (
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-black/30 rounded-lg">
              <div>
                <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span>🎲</span> The Gambler
                </h3>
                <KarmaBar
                  label="Honor"
                  value={Math.max(0, karmaJudgement.dimensions.honor)}
                  isFlashing={primaryDeity === DeityType.THE_GAMBLER}
                  color="gold"
                />
                <KarmaBar
                  label="Mercy"
                  value={Math.max(0, karmaJudgement.dimensions.mercy)}
                  isFlashing={primaryDeity === DeityType.THE_GAMBLER}
                  color="gold"
                />
                <div className="mt-2 text-xs text-desert-sand/50">
                  Faith: {karmaJudgement.faithLevel}%
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <span>👁️</span> The Outlaw King
                </h3>
                <KarmaBar
                  label="Chaos"
                  value={Math.max(0, karmaJudgement.dimensions.chaos)}
                  isFlashing={primaryDeity === DeityType.THE_OUTLAW_KING}
                  color="red"
                />
                <KarmaBar
                  label="Survival"
                  value={Math.max(0, karmaJudgement.dimensions.survival)}
                  isFlashing={primaryDeity === DeityType.THE_OUTLAW_KING}
                  color="red"
                />
                <div className="mt-2 text-xs text-desert-sand/50">
                  Sin: {karmaJudgement.sinLevel}%
                </div>
              </div>
            </div>
          )}

          {/* Outcome details */}
          {phase === 'outcome' && (
            <div className="text-center mb-8">
              {wasSaved && salvation && (
                <div className="space-y-4">
                  <div className="text-lg text-desert-sand">
                    <span className="font-bold text-gold-light">
                      {salvation.deity === DeityType.THE_GAMBLER ? 'The Gambler' : 'The Outlaw King'}
                    </span>
                    {' has intervened on your behalf.'}
                  </div>
                  {salvation.effect && (
                    <div className="p-4 bg-black/40 rounded-lg border border-gold-dark/30">
                      <div className="text-gold-light font-bold">{salvation.effect.name}</div>
                      <div className="text-sm text-desert-sand/80">{salvation.effect.description}</div>
                      <div className="text-xs text-desert-sand/50 mt-1">
                        Duration: {salvation.effect.durationHours} hours
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!wasSaved && permadeath && (
                <div className="space-y-4">
                  <div className="text-xl text-red-300 font-western">
                    {permadeath.characterName} has died.
                  </div>
                  <div className="text-desert-sand/70 italic">
                    "{permadeath.epitaph}"
                  </div>
                  <div className="text-sm text-desert-sand/50">
                    Died at {permadeath.deathLocation}
                    {permadeath.killerName && ` by ${permadeath.killerName}`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {phase === 'outcome' && (
            <div className="text-center">
              <button
                onClick={handleAcknowledge}
                className={`
                  px-8 py-3 rounded-lg font-western text-lg
                  transition-all duration-300
                  ${wasSaved
                    ? 'bg-gold-dark hover:bg-gold-medium text-wood-dark'
                    : 'bg-red-900 hover:bg-red-800 text-red-100 border border-red-700'
                  }
                `}
              >
                {wasSaved ? 'Continue Your Journey' : 'Rest In Peace'}
              </button>
            </div>
          )}

          {/* Phase indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2">
              {['judging', 'revealing', 'outcome'].map((p) => (
                <div
                  key={p}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${phase === p ? 'bg-gold-light scale-125' : 'bg-desert-sand/30'}
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind animation styles */}
      <style>{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(calc(var(--rotate, 0deg) + 10deg)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-card {
          animation: float-card 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LastStandModal;
