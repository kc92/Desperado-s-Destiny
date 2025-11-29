/**
 * SkillBonusSummary Component
 * Shows total skill bonuses to Destiny Deck suits
 */

import React, { useState } from 'react';
import { SuitBonuses, DestinySuit, Skill, SkillData } from '@desperados/shared';

interface SkillBonusSummaryProps {
  bonuses: SuitBonuses;
  skills: Skill[];
  skillData: SkillData[];
}

const suitConfig = {
  SPADES: {
    symbol: '♠',
    name: 'Spades',
    category: 'Combat',
    color: 'text-gray-800',
    bg: 'bg-gray-100',
    border: 'border-gray-800',
  },
  HEARTS: {
    symbol: '♥',
    name: 'Hearts',
    category: 'Spirit',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-600',
  },
  CLUBS: {
    symbol: '♣',
    name: 'Clubs',
    category: 'Cunning',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-600',
  },
  DIAMONDS: {
    symbol: '♦',
    name: 'Diamonds',
    category: 'Craft',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-600',
  },
};

/**
 * Suit bonus summary with expandable skill breakdown
 */
export const SkillBonusSummary: React.FC<SkillBonusSummaryProps> = ({
  bonuses,
  skills,
  skillData,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Calculate which skills contribute to each suit
  const getSkillsForSuit = (suit: DestinySuit) => {
    return skills
      .filter((skill) => skill.suit === suit)
      .map((skill) => {
        const data = skillData.find((sd) => sd.skillId === skill.id);
        return {
          name: skill.name,
          icon: skill.icon,
          bonus: data?.level || 0,
        };
      })
      .filter((s) => s.bonus > 0);
  };

  const suits: DestinySuit[] = [
    DestinySuit.SPADES,
    DestinySuit.HEARTS,
    DestinySuit.CLUBS,
    DestinySuit.DIAMONDS,
  ];

  return (
    <div className="mb-6">
      {/* Header with expand/collapse */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-western text-wood-dark text-shadow-gold">
            Destiny Deck Bonuses
          </h2>
          <p className="text-sm text-wood-grain">
            Your skills provide these bonuses to Destiny Deck challenges
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gold-dark hover:text-gold-light transition-colors px-3 py-1 rounded border border-gold-dark"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
        </button>
      </div>

      {/* Suit Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suits.map((suit) => {
          const config = suitConfig[suit];
          const bonus = bonuses[suit] || 0;
          const contributingSkills = getSkillsForSuit(suit);

          return (
            <div
              key={suit}
              className={`
                parchment p-4 rounded-lg
                border-3 ${config.border}
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
              `}
            >
              {/* Suit Symbol and Name */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-4xl ${config.color}`}>
                    {config.symbol}
                  </span>
                  <div>
                    <div className="text-lg font-western text-wood-dark">
                      {config.name}
                    </div>
                    <div className="text-xs text-wood-grain uppercase">
                      {config.category}
                    </div>
                  </div>
                </div>

                {/* Bonus Value */}
                <div className="text-right">
                  <div className="text-3xl font-western text-gold-dark">
                    +{bonus}
                  </div>
                </div>
              </div>

              {/* Expanded: Contributing Skills */}
              {isExpanded && contributingSkills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-wood-light">
                  <div className="text-xs font-semibold text-wood-dark mb-2 uppercase">
                    Contributing Skills:
                  </div>
                  <div className="space-y-1">
                    {contributingSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1">
                          <span>{skill.icon}</span>
                          <span className="text-wood-dark">{skill.name}</span>
                        </span>
                        <span className="font-bold text-gold-dark">
                          +{skill.bonus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when expanded */}
              {isExpanded && contributingSkills.length === 0 && (
                <div className="mt-3 pt-3 border-t border-wood-light">
                  <div className="text-xs text-wood-grain italic">
                    No skills trained for this suit yet
                  </div>
                </div>
              )}

              {/* Tooltip hint when collapsed */}
              {!isExpanded && bonus > 0 && (
                <div className="text-xs text-wood-grain text-center mt-2">
                  {contributingSkills.length} skill{contributingSkills.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info tooltip */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded text-sm text-blue-800">
        <strong>ℹ️ How it works:</strong> These bonuses are added to your Destiny Deck draws when facing challenges. Higher bonuses increase your chances of success!
      </div>
    </div>
  );
};

export default SkillBonusSummary;
