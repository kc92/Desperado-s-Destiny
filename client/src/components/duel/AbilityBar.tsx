/**
 * AbilityBar Component
 * Displays available duel abilities with cooldowns and energy costs
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================================================
// TYPES
// =============================================================================

export interface DuelAbilityDef {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  icon: string;
  cooldownRounds: number;
  isCheat?: boolean;
}

interface AbilityBarProps {
  /** Available abilities */
  abilities: DuelAbilityDef[];
  /** Current energy */
  energy: number;
  /** Maximum energy */
  maxEnergy: number;
  /** Cooldowns: ability ID -> rounds remaining */
  cooldowns: Record<string, number>;
  /** Callback when ability is used */
  onUseAbility: (abilityId: string) => void;
  /** Whether abilities can be used right now */
  canUse: boolean;
  /** Whether currently processing */
  isProcessing: boolean;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const ABILITY_DEFINITIONS: Record<string, DuelAbilityDef> = {
  read_opponent: {
    id: 'read_opponent',
    name: 'Read Opponent',
    description: 'Attempt to reveal 1-2 of their cards (contested vs Deception)',
    energyCost: 10,
    icon: '👁️',
    cooldownRounds: 2
  },
  cold_read: {
    id: 'cold_read',
    name: 'Cold Read',
    description: 'Reveal their exact hand strength (contested vs Poker Face)',
    energyCost: 25,
    icon: '🔮',
    cooldownRounds: 3
  },
  poker_face: {
    id: 'poker_face',
    name: 'Poker Face',
    description: 'Block all opponent reads for 2 rounds',
    energyCost: 20,
    icon: '😐',
    cooldownRounds: 4
  },
  false_tell: {
    id: 'false_tell',
    name: 'False Tell',
    description: 'Feed fake confidence signals to opponent',
    energyCost: 15,
    icon: '🎭',
    cooldownRounds: 2
  },
  peek: {
    id: 'peek',
    name: 'Peek',
    description: 'Glimpse their next draw (RISKY - may be detected)',
    energyCost: 5,
    icon: '👀',
    cooldownRounds: 1,
    isCheat: true
  },
  mark_cards: {
    id: 'mark_cards',
    name: 'Mark Cards',
    description: 'Track high cards through shuffles (VERY RISKY)',
    energyCost: 30,
    icon: '✏️',
    cooldownRounds: 5,
    isCheat: true
  }
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Energy meter display
 */
const EnergyMeter: React.FC<{
  current: number;
  max: number;
}> = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const isLow = percentage <= 25;
  const isMedium = percentage > 25 && percentage <= 50;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-wood-light">Energy</span>
      <div className="flex-1 h-2 bg-wood-dark/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${
            isLow ? 'bg-red-500' :
            isMedium ? 'bg-amber-500' :
            'bg-blue-500'
          }`}
        />
      </div>
      <span className={`text-xs font-bold ${
        isLow ? 'text-red-400' :
        isMedium ? 'text-amber-400' :
        'text-blue-400'
      }`}>
        {current}/{max}
      </span>
    </div>
  );
};

/**
 * Individual ability button
 */
const AbilityButton: React.FC<{
  ability: DuelAbilityDef;
  energy: number;
  cooldown: number;
  onUse: () => void;
  canUse: boolean;
  isProcessing: boolean;
}> = ({ ability, energy, cooldown, onUse, canUse, isProcessing }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isOnCooldown = cooldown > 0;
  const hasEnergy = energy >= ability.energyCost;
  const isDisabled = !canUse || isOnCooldown || !hasEnergy || isProcessing;

  return (
    <div className="relative">
      <motion.button
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={onUse}
        disabled={isDisabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          relative w-12 h-12 rounded-lg
          flex items-center justify-center text-xl
          transition-all duration-200
          ${ability.isCheat
            ? 'bg-blood-red/20 border-2 border-blood-red/50'
            : 'bg-wood-dark/80 border-2 border-gold-primary/50'}
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed grayscale'
            : 'hover:border-gold-primary cursor-pointer'}
        `}
      >
        {/* Icon */}
        <span className={isDisabled ? 'opacity-50' : ''}>
          {ability.icon}
        </span>

        {/* Cooldown overlay */}
        {isOnCooldown && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{cooldown}</span>
          </div>
        )}

        {/* Energy cost indicator */}
        {!isOnCooldown && (
          <div className={`
            absolute -bottom-1 -right-1
            w-5 h-5 rounded-full text-xs font-bold
            flex items-center justify-center
            ${hasEnergy
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'}
          `}>
            {ability.energyCost}
          </div>
        )}

        {/* Cheat warning indicator */}
        {ability.isCheat && !isDisabled && (
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-blood-red rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              w-48 p-2 rounded-lg text-xs
              ${ability.isCheat
                ? 'bg-blood-red/90'
                : 'bg-wood-dark/95'}
              backdrop-blur-sm z-50
            `}
          >
            <p className="font-bold text-parchment">{ability.name}</p>
            <p className="text-wood-light mt-1">{ability.description}</p>
            <div className="flex justify-between mt-2 text-wood-light/80">
              <span>Cost: {ability.energyCost}</span>
              <span>CD: {ability.cooldownRounds}r</span>
            </div>
            {ability.isCheat && (
              <p className="mt-2 text-red-300 font-bold">
                Warning: Can be detected!
              </p>
            )}
            {/* Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className={`
                w-0 h-0 border-l-4 border-r-4 border-t-4
                border-transparent
                ${ability.isCheat
                  ? 'border-t-blood-red/90'
                  : 'border-t-wood-dark/95'}
              `} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AbilityBar: React.FC<AbilityBarProps> = ({
  abilities,
  energy,
  maxEnergy,
  cooldowns,
  onUseAbility,
  canUse,
  isProcessing,
  className = '',
}) => {
  // Separate regular abilities from cheating abilities
  const regularAbilities = abilities.filter(a => !a.isCheat);
  const cheatAbilities = abilities.filter(a => a.isCheat);

  return (
    <div className={`bg-wood-dark/60 backdrop-blur-sm rounded-xl p-3 ${className}`}>
      {/* Energy meter */}
      <EnergyMeter current={energy} max={maxEnergy} />

      {/* Ability buttons */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {/* Regular abilities */}
        {regularAbilities.map(ability => (
          <AbilityButton
            key={ability.id}
            ability={ability}
            energy={energy}
            cooldown={cooldowns[ability.id] || 0}
            onUse={() => onUseAbility(ability.id)}
            canUse={canUse}
            isProcessing={isProcessing}
          />
        ))}

        {/* Divider if we have cheat abilities */}
        {cheatAbilities.length > 0 && regularAbilities.length > 0 && (
          <div className="w-px h-10 bg-wood-medium/50 mx-1" />
        )}

        {/* Cheat abilities */}
        {cheatAbilities.map(ability => (
          <AbilityButton
            key={ability.id}
            ability={ability}
            energy={energy}
            cooldown={cooldowns[ability.id] || 0}
            onUse={() => onUseAbility(ability.id)}
            canUse={canUse}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-xs text-wood-light"
        >
          Processing...
        </motion.div>
      )}

      {/* Can't use indicator */}
      {!canUse && !isProcessing && (
        <p className="mt-2 text-center text-xs text-wood-light/50">
          Wait for your turn
        </p>
      )}
    </div>
  );
};

export default AbilityBar;
