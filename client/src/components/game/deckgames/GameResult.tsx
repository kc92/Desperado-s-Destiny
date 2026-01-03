/**
 * GameResult Component
 * Displays the outcome of a deck game with rewards
 * Enhanced with framer-motion animations and HandStrengthBanner
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HandRank } from '@desperados/shared';
import { DeckGameResult, ActionResult, GameType } from './DeckGame';
import { HandStrengthBanner } from '../card';
import { VictoryCelebration, DefeatEffect } from '../effects';
import { announcer } from '../../../utils/announcer';

// Helper to convert hand name string to HandRank enum
function getHandRankFromName(handName: string): HandRank {
  const nameMap: Record<string, HandRank> = {
    'high card': HandRank.HIGH_CARD,
    'pair': HandRank.PAIR,
    'one pair': HandRank.PAIR,
    'two pair': HandRank.TWO_PAIR,
    'three of a kind': HandRank.THREE_OF_A_KIND,
    'straight': HandRank.STRAIGHT,
    'flush': HandRank.FLUSH,
    'full house': HandRank.FULL_HOUSE,
    'four of a kind': HandRank.FOUR_OF_A_KIND,
    'straight flush': HandRank.STRAIGHT_FLUSH,
    'royal flush': HandRank.ROYAL_FLUSH,
  };
  return nameMap[handName.toLowerCase()] || HandRank.HIGH_CARD;
}

interface GameResultProps {
  gameResult: DeckGameResult;
  actionResult?: ActionResult;
  actionInfo?: {
    name: string;
    type: string;
    difficulty: number;
    energyCost: number;
    rewards: any;
  };
  gameType: GameType;
  onDismiss?: () => void;
}

const GAME_TYPE_NAMES: Record<GameType, string> = {
  pokerHoldDraw: 'Poker Hold/Draw',
  pressYourLuck: 'Press Your Luck',
  blackjack: 'Blackjack',
  deckbuilder: 'Deckbuilder',
  combatDuel: 'Combat Duel',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const scoreVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    },
  },
};

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; className?: string }> = ({
  value,
  duration = 1000,
  prefix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span className={className}>{prefix}{displayValue}</span>;
};

export const GameResult: React.FC<GameResultProps> = ({
  gameResult,
  actionResult,
  actionInfo,
  gameType,
  onDismiss,
}) => {
  const isSuccess = gameResult.success;
  const [showBanner, setShowBanner] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const handRank = gameResult.handName ? getHandRankFromName(gameResult.handName) : HandRank.HIGH_CARD;

  // Delay effects for dramatic sequencing
  useEffect(() => {
    const bannerTimer = setTimeout(() => setShowBanner(true), 200);
    const celebrationTimer = setTimeout(() => setShowCelebration(true), 400);

    // Announce result to screen readers after a brief delay
    const announceTimer = setTimeout(() => {
      announcer.announceGameResult(
        isSuccess,
        gameResult.handName || 'Unknown',
        gameResult.score,
        actionResult?.rewardsGained.gold,
        actionResult?.rewardsGained.xp
      );
    }, 600);

    return () => {
      clearTimeout(bannerTimer);
      clearTimeout(celebrationTimer);
      clearTimeout(announceTimer);
    };
  }, [isSuccess, gameResult, actionResult]);

  return (
    <motion.div
      className="bg-wood-dark rounded-lg border-4 border-leather-saddle p-6 text-center relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Victory/Defeat celebration effects */}
      {isSuccess ? (
        <VictoryCelebration
          isActive={showCelebration}
          intensity={handRank}
        />
      ) : (
        <DefeatEffect isActive={showCelebration} />
      )}
      {/* Hand Strength Banner - PROMINENT at top */}
      {gameResult.handName && (
        <motion.div
          className="mb-6"
          variants={itemVariants}
        >
          <HandStrengthBanner
            handRank={handRank}
            handName={gameResult.handName}
            isVisible={showBanner}
            isSuccess={isSuccess}
          />
        </motion.div>
      )}

      {/* Success/Failure indicator */}
      <motion.div
        className={`mb-4 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}
        variants={itemVariants}
      >
        <motion.div
          className="text-4xl mb-1"
          variants={iconVariants}
        >
          {isSuccess ? '🎉' : '💀'}
        </motion.div>
        <motion.h2
          className="text-2xl font-western"
          variants={scoreVariants}
        >
          {isSuccess ? 'SUCCESS!' : 'FAILED'}
        </motion.h2>
        {actionInfo && (
          <motion.p
            className="text-desert-sand mt-1 text-sm"
            variants={itemVariants}
          >
            {actionInfo.name}
          </motion.p>
        )}
      </motion.div>

      {/* Game result details - condensed since banner shows hand */}
      <motion.div
        className="bg-wood-darker rounded p-4 mb-4 border border-wood-light/30"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-desert-dust">{GAME_TYPE_NAMES[gameType]}</span>
          <span className="text-gold-light font-bold">
            Score: <AnimatedCounter value={gameResult.score} duration={800} />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <motion.div
            className="text-left"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-desert-dust">Suit Matches:</span>
            <span className="text-white ml-2">{gameResult.suitMatches}/5</span>
          </motion.div>

          <motion.div
            className="text-left"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-desert-dust">Multiplier:</span>
            <motion.span
              className={`ml-2 font-bold ${
                gameResult.suitBonus.multiplier >= 1.5 ? 'text-gold-light' :
                gameResult.suitBonus.multiplier >= 1.2 ? 'text-green-400' :
                'text-white'
              }`}
              initial={{ scale: 1 }}
              animate={gameResult.suitBonus.multiplier >= 1.5 ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.5, delay: 0.8 },
              } : {}}
            >
              {gameResult.suitBonus.multiplier.toFixed(1)}x
            </motion.span>
          </motion.div>
        </div>

        {gameResult.suitBonus.specialEffect && (
          <motion.p
            className="mt-3 text-sm text-gold-light bg-gold-dark/20 rounded py-1 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            ⭐ {gameResult.suitBonus.specialEffect}
          </motion.p>
        )}

        {/* NEW: Effectiveness Breakdown (V2 System) */}
        {(gameResult as any).effectiveness && (gameResult as any).effectivenessBreakdown && (
          <motion.div
            className="mt-4 p-3 bg-gradient-to-r from-wood-darker to-wood-dark rounded border border-gold-dark/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gold-light font-bold text-sm">Effectiveness</span>
              <motion.span
                className="text-2xl font-western text-gold-light"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: 'spring' }}
              >
                <AnimatedCounter value={(gameResult as any).effectiveness} duration={600} />
              </motion.span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <motion.div
                className="text-center p-1 bg-wood-darker/50 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-desert-dust">Base</div>
                <div className="text-white font-bold">
                  {(gameResult as any).effectivenessBreakdown.baseValue}
                </div>
              </motion.div>
              <motion.div
                className="text-center p-1 bg-wood-darker/50 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >
                <div className="text-desert-dust">Suit</div>
                <div className={`font-bold ${
                  (gameResult as any).effectivenessBreakdown.suitMultiplier >= 1.3 ? 'text-green-400' : 'text-white'
                }`}>
                  {((gameResult as any).effectivenessBreakdown.suitMultiplier).toFixed(1)}x
                </div>
              </motion.div>
              <motion.div
                className="text-center p-1 bg-wood-darker/50 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-desert-dust">Skill</div>
                <div className={`font-bold ${
                  (gameResult as any).effectivenessBreakdown.skillMultiplier >= 1.2 ? 'text-blue-400' : 'text-white'
                }`}>
                  {((gameResult as any).effectivenessBreakdown.skillMultiplier).toFixed(1)}x
                </div>
              </motion.div>
            </div>
            <motion.p
              className="text-xs text-desert-dust text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
            >
              {(gameResult as any).effectivenessBreakdown.handName} × {(gameResult as any).effectivenessBreakdown.suitMatches} suit matches
            </motion.p>
          </motion.div>
        )}

        {!isSuccess && gameResult.mitigation && (
          <motion.p
            className="mt-2 text-sm text-yellow-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            🛡️ Damage reduced by {(gameResult.mitigation.damageReduction * 100).toFixed(0)}%
          </motion.p>
        )}
      </motion.div>

      {/* Action rewards */}
      {actionResult && (
        <motion.div
          className="bg-wood-darker rounded p-4 border border-gold-dark/50"
          variants={itemVariants}
        >
          <h3 className="text-gold-light font-bold mb-3">Rewards Earned</h3>

          <div className="space-y-2">
            {actionResult.rewardsGained.xp > 0 && (
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: 'spring' }}
              >
                <motion.span
                  className="text-blue-400 text-xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  ⭐
                </motion.span>
                <span className="text-white">
                  +<AnimatedCounter value={actionResult.rewardsGained.xp} duration={600} /> XP
                </span>
              </motion.div>
            )}

            {actionResult.rewardsGained.gold > 0 && (
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: 'spring' }}
              >
                <motion.span
                  className="text-yellow-400 text-xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, delay: 1.4, repeat: 2 }}
                >
                  💰
                </motion.span>
                <span className="text-gold-light font-bold">
                  +<AnimatedCounter value={actionResult.rewardsGained.gold} duration={800} /> Gold
                </span>
              </motion.div>
            )}

            {actionResult.rewardsGained.items.length > 0 && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <p className="text-desert-dust text-sm">Items:</p>
                {actionResult.rewardsGained.items.map((item, i) => (
                  <motion.span
                    key={i}
                    className="inline-block px-2 py-1 bg-leather-brown text-white text-xs rounded m-1"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.1, type: 'spring' }}
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Phase 5: Bonus Breakdown */}
            {gameResult.bonusBreakdown && gameResult.bonusBreakdown.length > 0 && (
              <motion.div
                className="mt-3 pt-3 border-t border-wood-light/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-desert-dust text-xs mb-1">Bonus Breakdown:</p>
                {gameResult.bonusBreakdown.map((bonus, i) => (
                  <motion.p
                    key={i}
                    className="text-xs text-green-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + i * 0.1 }}
                  >
                    ✓ {bonus}
                  </motion.p>
                ))}
              </motion.div>
            )}

            {/* Bail-out indicator */}
            {gameResult.bailedOut && (
              <motion.p
                className="mt-2 text-sm text-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                🏃 Bailed out early - partial rewards secured!
              </motion.p>
            )}
          </div>

          <motion.div
            className="mt-4 pt-3 border-t border-wood-light/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-desert-dust text-sm">Energy Remaining: </span>
            <span className="text-green-400 font-bold">
              {actionResult.energyRemaining}
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* Crime consequences */}
      {actionResult && (actionResult as any).crimeResolution && (
        <motion.div
          className="mt-4 p-3 bg-red-900/30 rounded border border-red-500/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <h4 className="text-red-400 font-bold mb-2">Crime Consequences</h4>
          <p className="text-sm text-desert-sand">
            {(actionResult as any).crimeResolution.message || 'The law is watching...'}
          </p>
        </motion.div>
      )}

      {/* Dismiss button */}
      {onDismiss && (
        <motion.button
          onClick={onDismiss}
          className="mt-6 px-6 py-3 bg-leather-saddle hover:bg-leather-brown text-gold-light font-western text-lg rounded border-2 border-gold-dark transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      )}
    </motion.div>
  );
};

export default GameResult;
