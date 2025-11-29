/**
 * SkillCard Component
 * Display a single skill with training controls
 */

import React from 'react';
import { Skill, SkillData, SkillCategory, DestinySuit } from '@desperados/shared';
import { SkillProgressBar } from './SkillProgressBar';
import { Button } from '@/components/ui/Button';
import { TierBadge, getTierFromLevel, getNextTierLevel } from './TierBadge';

interface SkillCardProps {
  skill: Skill;
  skillData: SkillData;
  isTraining: boolean;
  canTrain: boolean;
  onTrain: () => void;
}

const categoryColors = {
  COMBAT: {
    border: 'border-blood-red',
    badge: 'bg-blood-red text-desert-sand',
    text: 'text-blood-crimson',
  },
  CUNNING: {
    border: 'border-purple-600',
    badge: 'bg-purple-600 text-desert-sand',
    text: 'text-purple-400',
  },
  SPIRIT: {
    border: 'border-blue-600',
    badge: 'bg-blue-600 text-desert-sand',
    text: 'text-blue-400',
  },
  CRAFT: {
    border: 'border-gold-dark',
    badge: 'bg-gold-dark text-wood-dark',
    text: 'text-gold-light',
  },
};

const suitSymbols = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

const suitNames = {
  SPADES: 'Spades',
  HEARTS: 'Hearts',
  CLUBS: 'Clubs',
  DIAMONDS: 'Diamonds',
};

/**
 * Format training time from seconds to readable string
 */
function formatTrainingTime(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  return `${seconds}s`;
}

/**
 * Calculate training time for next level (increases with level)
 * Returns time in seconds
 */
function calculateTrainingTime(baseTimeMs: number, currentLevel: number): number {
  // Training time increases by 10% per level (linear formula matching server)
  // Convert from milliseconds to seconds
  return Math.floor((baseTimeMs / 1000) * (1 + currentLevel * 0.1));
}

/**
 * Western-styled skill card with parchment background
 * Memoized to prevent unnecessary re-renders in skill lists
 */
export const SkillCard: React.FC<SkillCardProps> = React.memo(({
  skill,
  skillData,
  isTraining,
  canTrain,
  onTrain,
}) => {
  const colors = categoryColors[skill.category as SkillCategory];
  const isMaxLevel = skillData.level >= skill.maxLevel;
  const trainingTime = calculateTrainingTime(skill.baseTrainingTime, skillData.level);
  const bonusValue = skillData.level;

  // Tier calculations
  const currentTier = getTierFromLevel(skillData.level);
  const nextTierLevel = getNextTierLevel(skillData.level);

  // Button state
  let buttonText = 'Train';
  let buttonDisabled = !canTrain;
  let buttonVariant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';

  if (isMaxLevel) {
    buttonText = 'Max Level';
    buttonDisabled = true;
    buttonVariant = 'ghost';
  } else if (isTraining) {
    buttonText = 'Training...';
    buttonDisabled = true;
    buttonVariant = 'secondary';
  } else if (!canTrain) {
    buttonText = 'Another Skill Training';
    buttonDisabled = true;
    buttonVariant = 'ghost';
  }

  return (
    <div
      className={`
        parchment p-6 rounded-lg
        border-4 ${colors.border}
        transition-all duration-200
        hover:scale-102 hover:shadow-xl
        ${isTraining ? 'ring-2 ring-gold-light animate-pulse-gold' : ''}
      `}
      role="article"
      aria-label={`${skill.name} skill card`}
    >
      {/* Header: Icon + Name + Level */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Skill Icon */}
          <span className="text-4xl" role="img" aria-label={skill.name}>
            {skill.icon}
          </span>

          {/* Name and Category */}
          <div>
            <h3 className="text-xl font-western text-wood-dark mb-1">
              {skill.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${colors.badge}`}>
                {skill.category}
              </span>
              <TierBadge tier={currentTier} size="sm" />
            </div>
          </div>
        </div>

        {/* Level Display */}
        <div className="text-right">
          <div className="text-2xl font-western text-gold-dark">
            {skillData.level}
          </div>
          <div className="text-xs text-wood-grain">
            / {skill.maxLevel}
          </div>
        </div>
      </div>

      {/* Next Tier Progress */}
      {nextTierLevel && (
        <div className="mb-3 text-xs text-wood-grain">
          <span>Next tier at level {nextTierLevel}</span>
          <span className="ml-2 text-gold-dark font-semibold">
            ({nextTierLevel - skillData.level} levels away)
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-wood-dark mb-4 leading-relaxed">
        {skill.description}
      </p>

      {/* Suit Indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-2xl ${colors.text}`}>
          {suitSymbols[skill.suit as DestinySuit]}
        </span>
        <span className="text-sm font-semibold text-wood-dark">
          Boosts {suitNames[skill.suit as DestinySuit]} cards
        </span>
      </div>

      {/* Benefit Text */}
      <div className="mb-4 p-3 bg-wood-light/10 rounded border border-wood-light">
        <div className="text-sm font-bold text-gold-dark">
          Current Bonus: +{bonusValue} to {suitSymbols[skill.suit as DestinySuit]}
        </div>
        {!isMaxLevel && (
          <div className="text-xs text-wood-grain mt-1">
            Next level: +{bonusValue + 1} to {suitSymbols[skill.suit as DestinySuit]}
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      {!isMaxLevel && (
        <div className="mb-4">
          <SkillProgressBar
            current={skillData.xp}
            max={skillData.xpToNextLevel}
            label="Experience"
            color="gold"
            showPercentage={true}
            animated={true}
          />
        </div>
      )}

      {/* Training Time */}
      {!isMaxLevel && (
        <div className="mb-4 text-sm text-wood-dark">
          <span className="font-semibold">Training time:</span>{' '}
          <span className="text-gold-dark font-bold">
            {formatTrainingTime(trainingTime)}
          </span>
        </div>
      )}

      {/* Train Button */}
      <Button
        variant={buttonVariant}
        size="md"
        fullWidth
        disabled={buttonDisabled}
        onClick={onTrain}
        className={isTraining ? 'animate-pulse-gold' : ''}
      >
        {buttonText}
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render if relevant props change
  return (
    prevProps.skill.id === nextProps.skill.id &&
    prevProps.skillData.level === nextProps.skillData.level &&
    prevProps.skillData.xp === nextProps.skillData.xp &&
    prevProps.skillData.xpToNextLevel === nextProps.skillData.xpToNextLevel &&
    prevProps.isTraining === nextProps.isTraining &&
    prevProps.canTrain === nextProps.canTrain
  );
});

// Display name for React DevTools
SkillCard.displayName = 'SkillCard';

export default SkillCard;
