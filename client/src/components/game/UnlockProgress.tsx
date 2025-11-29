/**
 * UnlockProgress Component
 * Shows progress toward the next skill unlock
 */

import React from 'react';
import { SkillCategory } from '@desperados/shared';

export interface NextUnlock {
  level: number;
  name: string;
  description: string;
  type: 'action' | 'ability' | 'bonus' | 'recipe';
}

interface UnlockProgressProps {
  category: SkillCategory;
  currentLevel: number;
  nextUnlock: NextUnlock | null;
}

const typeIcons: Record<string, string> = {
  action: '⚔️',
  ability: '✨',
  bonus: '📈',
  recipe: '🔧',
};

const typeLabels: Record<string, string> = {
  action: 'Action',
  ability: 'Ability',
  bonus: 'Bonus',
  recipe: 'Recipe',
};

/**
 * Show progress toward the next unlock for a skill category
 */
export const UnlockProgress: React.FC<UnlockProgressProps> = ({
  category,
  currentLevel,
  nextUnlock,
}) => {
  if (!nextUnlock) {
    return (
      <div className="p-3 bg-gold-dark/10 border border-gold-dark rounded text-sm text-wood-dark">
        <span className="text-gold-dark font-bold">All Unlocked!</span>
        <span className="ml-2">You've mastered all {category.toLowerCase()} content.</span>
      </div>
    );
  }

  const levelsAway = nextUnlock.level - currentLevel;
  const icon = typeIcons[nextUnlock.type] || '🔓';
  const typeLabel = typeLabels[nextUnlock.type] || 'Unlock';

  return (
    <div className="p-3 bg-wood-light/10 border border-wood-light rounded">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl" role="img" aria-label={nextUnlock.type}>
          {icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-wood-dark">
              {nextUnlock.name}
            </span>
            <span className="text-xs px-2 py-0.5 bg-wood-light/30 rounded text-wood-grain">
              {typeLabel}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-wood-grain mb-2">
            {nextUnlock.description}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-wood-light/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-dark transition-all duration-300"
                style={{
                  width: `${Math.max(0, Math.min(100, ((currentLevel / nextUnlock.level) * 100)))}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gold-dark whitespace-nowrap">
              Level {nextUnlock.level}
            </span>
          </div>

          {/* Levels away */}
          <div className="mt-1 text-xs text-wood-grain">
            {levelsAway === 1 ? (
              <span className="text-green-600 font-bold">Almost there! 1 level away</span>
            ) : levelsAway <= 3 ? (
              <span className="text-gold-dark font-semibold">{levelsAway} levels away</span>
            ) : (
              <span>{levelsAway} levels away</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockProgress;
