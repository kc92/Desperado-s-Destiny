/**
 * CombatArena Component
 * Main combat interface with HP bars, card hands, and combat log
 */

import React, { useState, useEffect } from 'react';
import { CombatEncounter, HandRank } from '@desperados/shared';
import { HPBar } from './HPBar';
import { CardHand } from './CardHand';
import { DamageNumber } from './DamageNumber';
import { Button } from '@/components/ui';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CombatArenaProps {
  /** Active combat encounter */
  encounter: CombatEncounter;
  /** Callback to play a turn (draw cards) */
  onPlayTurn: () => void;
  /** Callback to flee from combat */
  onFlee: () => void;
  /** Whether a turn is being processed */
  isProcessingTurn?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Combat arena with three sections: NPC, Combat Log, Player
 */
export const CombatArena: React.FC<CombatArenaProps> = ({
  encounter,
  onPlayTurn,
  onFlee,
  isProcessingTurn = false,
  className = '',
}) => {
  const [showPlayerDamage, setShowPlayerDamage] = useState(false);
  const [showNPCDamage, setShowNPCDamage] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const { playSound } = useSoundEffects();

  const currentRound = encounter.rounds[encounter.rounds.length - 1];
  const isPlayerTurn = !currentRound || currentRound.npcDamage > 0;
  const canFlee = encounter.rounds.length <= 3;

  // Show damage numbers when a new round is completed
  useEffect(() => {
    if (currentRound) {
      // Start card reveal
      setIsRevealing(true);
      playSound('flip');

      // Show player damage after cards reveal
      setTimeout(() => {
        setShowPlayerDamage(true);
        // Play combat sound based on player damage
        if (currentRound.playerDamage > 0) {
          if (currentRound.playerDamage >= 50) {
            playSound('combat_critical');
          } else {
            playSound('combat_hit');
          }
        }
      }, 1500);

      // Show NPC damage after player damage
      setTimeout(() => {
        setShowNPCDamage(true);
        // Play damage sound when NPC hits player
        if (currentRound.npcDamage > 0) {
          playSound('damage_taken');
        } else {
          playSound('combat_miss');
        }
      }, 2000);

      // Clean up damage numbers
      const timer = setTimeout(() => {
        setShowPlayerDamage(false);
        setShowNPCDamage(false);
        setIsRevealing(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentRound, playSound]);

  // Format hand rank for display
  const formatHandRank = (rank: HandRank | string): string => {
    const rankStr = typeof rank === 'number' ? HandRank[rank] : rank;
    return rankStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get NPC emoji
  const getNPCEmoji = (): string => {
    switch (encounter.npc?.type) {
      case 'OUTLAW': return '🤠';
      case 'WILDLIFE': return '🐺';
      case 'LAWMAN': return '⭐';
      case 'BOSS': return '💀';
      default: return '👤';
    }
  };

  return (
    <div
      className={`
        relative w-full min-h-screen bg-gradient-to-b from-desert-clay to-desert-stone
        ${className}
      `}
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20 bg-wood-grain pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* TOP SECTION - NPC */}
        <div className="bg-gradient-to-br from-blood-dark/80 to-blood-red/80 border-4 border-blood-red rounded-lg p-6 shadow-2xl">
          {/* Boss aura effect */}
          {encounter.npc?.isBoss && (
            <div className="absolute inset-0 bg-gradient-radial from-gold-light/20 to-transparent rounded-lg animate-pulse-gold pointer-events-none" />
          )}

          <div className="relative flex items-center gap-6">
            {/* NPC Visual */}
            <div className="flex-shrink-0">
              <div
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center text-6xl
                  bg-gradient-to-br from-desert-sand to-desert-dust
                  border-4 shadow-2xl
                  ${encounter.npc?.isBoss ? 'border-gold-light animate-victory-pulse' : 'border-wood-dark'}
                `}
              >
                {getNPCEmoji()}
              </div>
            </div>

            {/* NPC Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-western text-desert-sand">
                    {encounter.npc?.name}
                  </h2>
                  <p className="text-sm text-desert-dust font-serif">
                    Level {encounter.npc?.level} {encounter.npc?.type}
                    {encounter.npc?.isBoss && ' BOSS'}
                  </p>
                </div>
              </div>

              {/* NPC HP Bar */}
              <HPBar
                current={encounter.npcHP}
                max={encounter.npcMaxHP}
                label="Enemy HP"
                color="red"
                showDamage={true}
              />
            </div>
          </div>

          {/* Damage number for NPC */}
          {showNPCDamage && currentRound && currentRound.playerDamage > 0 && (
            <DamageNumber
              damage={currentRound.playerDamage}
              color="gold"
              isCritical={currentRound.playerDamage >= 50}
              x="50%"
              y="30%"
              onComplete={() => setShowNPCDamage(false)}
            />
          )}
        </div>

        {/* MIDDLE SECTION - Combat Log */}
        <div className="bg-gradient-to-br from-desert-sand to-desert-dust border-4 border-leather-saddle rounded-lg shadow-wood">
          <div className="bg-wood-dark/10 px-4 py-2 border-b-2 border-leather-saddle">
            <h3 className="font-western text-lg text-wood-dark">Combat Log</h3>
          </div>

          <div
            className="p-4 space-y-2 max-h-64 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions"
          >
            {encounter.rounds.length === 0 ? (
              <p className="text-center text-wood-medium font-serif italic">
                Draw your cards to begin combat!
              </p>
            ) : (
              [...encounter.rounds].reverse().slice(0, 5).map((round, index) => (
                <div
                  key={encounter.rounds.length - index}
                  className="space-y-1 pb-2 border-b border-wood-dark/10 last:border-0"
                >
                  <div className="font-western text-sm text-wood-dark">
                    Round {round.roundNumber || round.roundNum}
                  </div>

                  {/* Player's turn */}
                  <div className="text-sm text-wood-medium font-serif">
                    <span className="text-gold-dark font-bold">You</span> drew{' '}
                    <span className="font-bold">{formatHandRank(round.playerHandRank)}</span> for{' '}
                    <span className="text-gold-dark font-bold">{round.playerDamage} damage</span>!
                  </div>

                  {/* NPC's turn */}
                  <div className="text-sm text-wood-medium font-serif">
                    <span className="text-blood-red font-bold">{encounter.npc?.name}</span> drew{' '}
                    <span className="font-bold">{formatHandRank(round.npcHandRank)}</span> for{' '}
                    <span className="text-blood-red font-bold">{round.npcDamage} damage</span>!
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM SECTION - Player */}
        <div className="bg-gradient-to-br from-green-900/80 to-green-700/80 border-4 border-green-600 rounded-lg p-6 shadow-2xl relative">
          {/* Turn Indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            {isPlayerTurn ? (
              <div className="px-6 py-2 bg-gold-dark rounded-full shadow-gold">
                <span className="text-xl font-western text-wood-dark">YOUR TURN</span>
              </div>
            ) : (
              <div className="px-6 py-2 bg-blood-red rounded-full shadow-lg">
                <span className="text-xl font-western text-desert-sand">Enemy attacks...</span>
              </div>
            )}
          </div>

          <div className="relative space-y-4 mt-4">
            {/* Player HP Bar */}
            <HPBar
              current={encounter.playerHP}
              max={encounter.playerMaxHP}
              label="Your HP"
              color="green"
              showDamage={true}
            />

            {/* Player Cards */}
            {currentRound && (
              <div className="py-4">
                <CardHand
                  cards={currentRound.playerHand || currentRound.playerCards}
                  isRevealing={isRevealing}
                  size="md"
                  className="mb-4"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onPlayTurn}
                disabled={!isPlayerTurn || isProcessingTurn}
                variant="primary"
                className="font-western px-8 py-3 text-lg"
                aria-label={isProcessingTurn ? 'Drawing cards, please wait' : 'Draw cards to play your turn'}
              >
                <span aria-hidden="true">🎴 </span>
                {isProcessingTurn ? 'Drawing Cards...' : 'Draw Cards'}
              </Button>

              {canFlee && (
                <Button
                  onClick={onFlee}
                  disabled={isProcessingTurn}
                  variant="secondary"
                  className="font-western px-8 py-3 text-lg"
                  aria-label="Flee from combat (only available in first 3 rounds)"
                >
                  <span aria-hidden="true">💨 </span>
                  Flee
                </Button>
              )}
            </div>

            {!canFlee && (
              <p className="text-center text-xs text-desert-sand font-serif italic">
                Too late to flee! Fight to the finish!
              </p>
            )}
          </div>

          {/* Damage number for Player */}
          {showPlayerDamage && currentRound && currentRound.npcDamage > 0 && (
            <DamageNumber
              damage={currentRound.npcDamage}
              color="red"
              isCritical={currentRound.npcDamage >= 50}
              x="50%"
              y="20%"
              onComplete={() => setShowPlayerDamage(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatArena;
