/**
 * PerceptionHUD Component
 * Displays perception hints and tells during PvP duels
 * Shows confidence meters, hand strength estimates, and revealed cards
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PerceptionHint, Card } from '@desperados/shared';

interface PerceptionHUDProps {
  /** Active perception hints */
  hints: PerceptionHint[];
  /** Player's perception skill level */
  perceptionLevel: number;
  /** Callback when a hint expires */
  onHintExpire?: (index: number) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Individual hint display with appropriate styling
 */
const HintDisplay: React.FC<{
  hint: PerceptionHint;
  index: number;
  onExpire: () => void;
}> = ({ hint, onExpire }) => {
  const [isExpiring, setIsExpiring] = useState(false);

  // Auto-expire hints after duration based on type
  useEffect(() => {
    const duration = hint.type === 'partial_reveal' ? 8000 : 5000;
    const timer = setTimeout(() => {
      setIsExpiring(true);
      setTimeout(onExpire, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [hint, onExpire]);

  // Get icon based on hint type
  const getIcon = () => {
    switch (hint.type) {
      case 'confidence':
        return '🎭';
      case 'hand_strength':
      case 'hand_range':
        return '📊';
      case 'tell':
      case 'behavior_tell':
        return '👁️';
      case 'partial_reveal':
        return '🃏';
      case 'prediction':
      case 'action_predict':
        return '🔮';
      case 'false_tell':
        return '⚠️';
      default:
        return '💡';
    }
  };

  // Get color based on confidence
  const getConfidenceColor = () => {
    if (hint.confidence >= 0.8) return 'text-green-400 border-green-500/50';
    if (hint.confidence >= 0.5) return 'text-amber-400 border-amber-500/50';
    return 'text-red-400 border-red-500/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: isExpiring ? 0 : 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        relative p-3 rounded-lg backdrop-blur-sm
        bg-wood-dark/80 border-l-4
        ${getConfidenceColor()}
      `}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-parchment italic">
            "{hint.message}"
          </p>
          {/* Confidence bar */}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-wood-medium/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hint.confidence * 100}%` }}
                className={`h-full ${
                  hint.confidence >= 0.8 ? 'bg-green-500' :
                  hint.confidence >= 0.5 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
              />
            </div>
            <span className="text-xs text-wood-light">
              {Math.round(hint.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Revealed card display */}
      {hint.revealedCard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 flex justify-center"
        >
          <PartialRevealCard card={hint.revealedCard} />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Displays a partially revealed card with ghostly appearance
 */
const PartialRevealCard: React.FC<{ card: Card }> = ({ card }) => {
  const getSuitSymbol = () => {
    switch (card.suit) {
      case 'SPADES': return '♠';
      case 'HEARTS': return '♥';
      case 'DIAMONDS': return '♦';
      case 'CLUBS': return '♣';
      default: return '?';
    }
  };

  const getRankDisplay = () => {
    if (card.rank === 14) return 'A';
    if (card.rank === 13) return 'K';
    if (card.rank === 12) return 'Q';
    if (card.rank === 11) return 'J';
    return String(card.rank);
  };

  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';

  return (
    <motion.div
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        relative w-12 h-18 rounded-md
        bg-parchment/60 backdrop-blur-sm
        border-2 border-gold-primary/50
        flex flex-col items-center justify-center
        shadow-lg shadow-gold-primary/20
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <span className={`text-xl ${isRed ? 'text-blood-red/80' : 'text-wood-dark/80'}`}>
        {getSuitSymbol()}
      </span>
      <span className={`text-sm font-bold ${isRed ? 'text-blood-red/80' : 'text-wood-dark/80'}`}>
        {getRankDisplay()}
      </span>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-md bg-gold-primary/10 animate-pulse" />
    </motion.div>
  );
};

/**
 * Confidence meter showing opponent's demeanor
 */
const ConfidenceMeter: React.FC<{
  level: 'nervous' | 'calm' | 'confident';
}> = ({ level }) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'nervous':
        return { width: '33%', color: 'bg-green-500', label: 'Nervous' };
      case 'calm':
        return { width: '66%', color: 'bg-amber-500', label: 'Calm' };
      case 'confident':
        return { width: '100%', color: 'bg-red-500', label: 'Confident' };
    }
  };

  const config = getLevelConfig();

  return (
    <div className="p-2 rounded-lg bg-wood-dark/60 backdrop-blur-sm">
      <div className="flex justify-between text-xs text-wood-light mb-1">
        <span>Opponent Confidence</span>
        <span className="font-bold">{config.label}</span>
      </div>
      <div className="h-2 bg-wood-medium/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 0.5 }}
          className={`h-full ${config.color}`}
        />
      </div>
    </div>
  );
};

/**
 * Main PerceptionHUD component
 */
export const PerceptionHUD: React.FC<PerceptionHUDProps> = ({
  hints,
  perceptionLevel,
  onHintExpire,
  className = '',
}) => {
  const [activeHints, setActiveHints] = useState<PerceptionHint[]>(hints);

  // Update active hints when props change
  useEffect(() => {
    setActiveHints(hints);
  }, [hints]);

  const handleHintExpire = (index: number) => {
    setActiveHints(prev => prev.filter((_, i) => i !== index));
    onHintExpire?.(index);
  };

  // Determine overall confidence level from hints
  const getOverallConfidence = (): 'nervous' | 'calm' | 'confident' | null => {
    const confidenceHint = activeHints.find(
      h => h.type === 'confidence' || h.type === 'hand_strength' || h.type === 'hand_range'
    );
    if (!confidenceHint) return null;

    if (confidenceHint.message.toLowerCase().includes('nervous') ||
        confidenceHint.message.toLowerCase().includes('weak')) {
      return 'nervous';
    }
    if (confidenceHint.message.toLowerCase().includes('confident') ||
        confidenceHint.message.toLowerCase().includes('strong')) {
      return 'confident';
    }
    return 'calm';
  };

  const overallConfidence = getOverallConfidence();

  if (activeHints.length === 0 && !overallConfidence) {
    return null;
  }

  return (
    <div className={`absolute top-4 right-4 w-72 space-y-2 z-20 ${className}`}>
      {/* Perception level indicator */}
      <div className="flex items-center justify-between px-2 py-1 rounded bg-wood-dark/40 backdrop-blur-sm">
        <span className="text-xs text-wood-light">Perception</span>
        <span className="text-xs font-bold text-gold-primary">Lv. {perceptionLevel}</span>
      </div>

      {/* Confidence meter if available */}
      {overallConfidence && (
        <ConfidenceMeter level={overallConfidence} />
      )}

      {/* Individual hints */}
      <AnimatePresence>
        {activeHints.map((hint, index) => (
          <HintDisplay
            key={`${hint.type}-${index}-${hint.message.substring(0, 10)}`}
            hint={hint}
            index={index}
            onExpire={() => handleHintExpire(index)}
          />
        ))}
      </AnimatePresence>

      {/* No hints message */}
      {activeHints.length === 0 && overallConfidence && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-xs text-center text-wood-light italic"
        >
          Watching for tells...
        </motion.p>
      )}
    </div>
  );
};

export default PerceptionHUD;
