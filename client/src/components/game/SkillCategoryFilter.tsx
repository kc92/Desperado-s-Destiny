/**
 * SkillCategoryFilter Component
 * Filter skills by category with western-styled tabs
 */

import React from 'react';
import { SkillCategory } from '@desperados/shared';

interface SkillCategoryFilterProps {
  selectedCategory: SkillCategory | 'ALL';
  onCategoryChange: (category: SkillCategory | 'ALL') => void;
  counts?: {
    ALL: number;
    COMBAT: number;
    CUNNING: number;
    SPIRIT: number;
    CRAFT: number;
  };
}

const categoryConfig = {
  ALL: {
    label: 'All Skills',
    icon: '⚡',
    color: 'bg-gold-medium hover:bg-gold-dark',
    activeColor: 'bg-gold-dark border-gold-light',
    textColor: 'text-wood-dark',
  },
  COMBAT: {
    label: 'Combat',
    icon: '⚔️',
    color: 'bg-blood-red/80 hover:bg-blood-red',
    activeColor: 'bg-blood-red border-blood-crimson',
    textColor: 'text-desert-sand',
  },
  CUNNING: {
    label: 'Cunning',
    icon: '🎭',
    color: 'bg-purple-600/80 hover:bg-purple-600',
    activeColor: 'bg-purple-600 border-purple-400',
    textColor: 'text-desert-sand',
  },
  SPIRIT: {
    label: 'Spirit',
    icon: '🌟',
    color: 'bg-blue-600/80 hover:bg-blue-600',
    activeColor: 'bg-blue-600 border-blue-400',
    textColor: 'text-desert-sand',
  },
  CRAFT: {
    label: 'Craft',
    icon: '🔨',
    color: 'bg-gold-dark/80 hover:bg-gold-dark',
    activeColor: 'bg-gold-dark border-gold-light',
    textColor: 'text-wood-dark',
  },
};

/**
 * Tab-style category filter with counts and icons
 */
export const SkillCategoryFilter: React.FC<SkillCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  counts,
}) => {
  const categories: Array<SkillCategory | 'ALL'> = [
    'ALL',
    SkillCategory.COMBAT,
    SkillCategory.CUNNING,
    SkillCategory.SPIRIT,
    SkillCategory.CRAFT,
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => {
        const config = categoryConfig[category];
        const isActive = selectedCategory === category;
        const count = counts?.[category] ?? 0;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg
              border-2 transition-all duration-200
              font-semibold text-sm uppercase tracking-wide
              ${isActive ? config.activeColor : `${config.color} border-transparent`}
              ${config.textColor}
              ${isActive ? 'shadow-lg scale-105' : 'shadow-md hover:scale-102'}
              focus:outline-none focus:ring-2 focus:ring-gold-medium focus:ring-offset-2
            `}
            aria-pressed={isActive}
            aria-label={`Filter by ${config.label}`}
          >
            {/* Icon */}
            <span className="text-lg" role="img" aria-hidden="true">
              {config.icon}
            </span>

            {/* Label */}
            <span>{config.label}</span>

            {/* Count badge */}
            {counts && (
              <span
                className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/20' : 'bg-black/20'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SkillCategoryFilter;
