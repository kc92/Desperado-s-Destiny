/**
 * ActionCard Component
 * Displays a single available action with details and attempt button
 */

import React from 'react';
import { Action, ActionType, Suit } from '@desperados/shared';
import { Button } from '@/components/ui/Button';

interface CrimeMetadata {
  jailTimeMinutes?: number;
  wantedLevelIncrease?: number;
  witnessChance?: number;
  bailCost?: number;
}

interface ActionCardProps {
  /** The action to display */
  action: Action;
  /** Whether the character can afford this action */
  canAfford: boolean;
  /** Current character energy */
  currentEnergy: number;
  /** Callback when player attempts the action */
  onAttempt: (action: Action) => void;
  /** Additional CSS classes */
  className?: string;
  /** Crime-specific metadata */
  crimeMetadata?: CrimeMetadata;
}

// Map action types to icons/symbols
const ACTION_TYPE_ICONS: Record<ActionType, string> = {
  [ActionType.CRIME]: '💰',
  [ActionType.COMBAT]: '⚔️',
  [ActionType.CRAFT]: '🔨',
  [ActionType.SOCIAL]: '🎭',
};

// Map action types to colors
const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  [ActionType.CRIME]: 'from-blood-dark to-blood-red',
  [ActionType.COMBAT]: 'from-leather-saddle to-leather-brown',
  [ActionType.CRAFT]: 'from-gold-dark to-gold-medium',
  [ActionType.SOCIAL]: 'from-faction-settler to-faction-nahi',
};

// Map suits to icons
const SUIT_ICONS: Record<Suit, string> = {
  [Suit.SPADES]: '♠',
  [Suit.HEARTS]: '♥',
  [Suit.CLUBS]: '♣',
  [Suit.DIAMONDS]: '♦',
};

// Map suits to names
const SUIT_NAMES: Record<Suit, string> = {
  [Suit.SPADES]: 'Cunning',
  [Suit.HEARTS]: 'Spirit',
  [Suit.CLUBS]: 'Combat',
  [Suit.DIAMONDS]: 'Craft',
};

/**
 * Calculate risk level based on crime metadata
 */
const getRiskLevel = (metadata?: CrimeMetadata): 'low' | 'medium' | 'high' | 'extreme' => {
  if (!metadata) return 'low';

  const { witnessChance = 0, jailTimeMinutes = 0 } = metadata;

  if (witnessChance > 80 || jailTimeMinutes > 120) return 'extreme';
  if (witnessChance > 60 || jailTimeMinutes > 60) return 'high';
  if (witnessChance > 30 || jailTimeMinutes > 15) return 'medium';
  return 'low';
};

/**
 * Get border color for risk level
 */
const getRiskBorderColor = (risk: 'low' | 'medium' | 'high' | 'extreme'): string => {
  switch (risk) {
    case 'low':
      return 'border-green-600';
    case 'medium':
      return 'border-yellow-500';
    case 'high':
      return 'border-orange-500';
    case 'extreme':
      return 'border-blood-red';
    default:
      return 'border-leather-brown';
  }
};

/**
 * Displays an action card with western styling
 * Memoized to prevent unnecessary re-renders in action lists
 */
export const ActionCard: React.FC<ActionCardProps> = React.memo(({
  action,
  canAfford,
  currentEnergy,
  onAttempt,
  className = '',
  crimeMetadata,
}) => {
  const typeIcon = ACTION_TYPE_ICONS[action.type];
  const typeGradient = ACTION_TYPE_COLORS[action.type];
  const actionEnergyCost = action.energyCost ?? (action as any).energyRequired ?? 0;
  const energyDeficit = actionEnergyCost - Math.floor(currentEnergy);

  // Generate difficulty stars (1-10)
  const difficultyStars = Math.min(Math.max(Math.ceil(action.difficulty / 2), 1), 5);

  // Calculate risk level for crimes
  const isCrime = action.type === ActionType.CRIME;
  const riskLevel = isCrime ? getRiskLevel(crimeMetadata) : null;
  const borderColor = riskLevel ? getRiskBorderColor(riskLevel) : 'border-leather-brown';

  return (
    <div
      className={`
        parchment p-6 rounded-lg border-4 ${borderColor}
        shadow-wood hover:shadow-gold transition-all duration-300
        transform hover:-translate-y-1
        ${className}
      `}
      title={isCrime && riskLevel ? `Risk Level: ${riskLevel.toUpperCase()} - High risk = high reward, but you might get caught!` : undefined}
    >
      {/* Header with Type Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{typeIcon}</span>
            <h3 className="text-xl font-western text-wood-dark">{action.name}</h3>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${typeGradient} text-white text-xs font-bold uppercase tracking-wider`}>
            {action.type}
          </div>
        </div>

        {/* Energy Cost Badge */}
        <div className="flex flex-col items-center">
          <div
            className={`
              px-4 py-2 rounded-lg font-bold text-lg
              ${canAfford ? 'bg-gold-medium text-wood-dark' : 'bg-blood-red text-white'}
            `}
          >
            {actionEnergyCost} ⚡
          </div>
          <span className="text-xs text-wood-grain mt-1">Energy</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-wood-medium text-sm mb-4 leading-relaxed">
        {action.description}
      </p>

      {/* Difficulty and Target Score */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-desert-clay">
        {/* Difficulty Stars */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-wood-grain uppercase tracking-wide">Difficulty</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`text-xl ${index < difficultyStars ? 'text-blood-red' : 'text-desert-clay'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Target Score */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-wood-grain uppercase tracking-wide">Target Score</span>
          <span className="text-2xl font-bold text-gold-dark">{action.targetScore}</span>
        </div>
      </div>

      {/* Suit Affinities */}
      {action.suitBonuses && action.suitBonuses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-wood-grain uppercase tracking-wide mb-2">Suit Bonuses</h4>
          <div className="flex flex-wrap gap-2">
            {action.suitBonuses.map(({ suit, bonus }) => (
              <div
                key={suit}
                className="flex items-center gap-1 px-2 py-1 bg-wood-light/20 rounded border border-wood-medium"
              >
                <span className="text-lg">{SUIT_ICONS[suit]}</span>
                <span className="text-xs text-wood-dark">{SUIT_NAMES[suit]}</span>
                <span className="text-xs font-bold text-gold-dark">+{bonus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crime Risk Indicators */}
      {isCrime && crimeMetadata && (
        <div className="mb-4 p-3 bg-blood-red/10 border-2 border-blood-red/30 rounded">
          <h4 className="text-xs text-blood-red uppercase tracking-wide mb-2 font-bold">Crime Risks</h4>
          <div className="space-y-1 text-xs">
            {crimeMetadata.jailTimeMinutes && (
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-wood-dark">
                  <strong>{crimeMetadata.jailTimeMinutes}min jail</strong> on failure
                </span>
              </div>
            )}
            {crimeMetadata.wantedLevelIncrease && (
              <div className="flex items-center gap-2">
                <span>{'⭐'.repeat(crimeMetadata.wantedLevelIncrease)}</span>
                <span className="text-wood-dark">
                  <strong>+{crimeMetadata.wantedLevelIncrease} wanted</strong> level
                </span>
              </div>
            )}
            {crimeMetadata.witnessChance && (
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span className="text-wood-dark">
                  <strong>{crimeMetadata.witnessChance}%</strong> detection risk
                </span>
              </div>
            )}
            {crimeMetadata.bailCost && (
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="text-wood-dark">
                  Bail: <strong>{crimeMetadata.bailCost}g</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="mb-4">
        <h4 className="text-xs text-wood-grain uppercase tracking-wide mb-2">Rewards</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gold-medium font-bold">+{action.rewards.xp}</span>
            <span className="text-wood-medium">XP</span>
          </div>
          {action.rewards.gold && action.rewards.gold > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gold-medium font-bold">+{action.rewards.gold}</span>
              <span className="text-wood-medium">Gold</span>
            </div>
          )}
          {action.rewards.items && action.rewards.items.length > 0 && (
            <div className="text-sm text-wood-medium">
              + Items
            </div>
          )}
        </div>
      </div>

      {/* Attempt Button */}
      <Button
        variant={canAfford ? 'secondary' : 'ghost'}
        size="md"
        fullWidth
        disabled={!canAfford}
        onClick={() => onAttempt(action)}
      >
        {canAfford ? (
          'Attempt Action'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>Insufficient Energy</span>
            <span className="text-sm">(-{energyDeficit} ⚡)</span>
          </span>
        )}
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render if relevant props change
  return (
    prevProps.action.id === nextProps.action.id &&
    prevProps.canAfford === nextProps.canAfford &&
    prevProps.currentEnergy === nextProps.currentEnergy &&
    prevProps.className === nextProps.className
  );
});

// Display name for React DevTools
ActionCard.displayName = 'ActionCard';

export default ActionCard;
