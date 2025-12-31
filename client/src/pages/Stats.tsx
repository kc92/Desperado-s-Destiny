/**
 * Stats Page
 * Comprehensive character statistics and combat analytics
 */

import React, { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useSkillStore } from '@/store/useSkillStore';
import { useEnergy } from '@/hooks/useEnergy';
import { useDuels } from '@/hooks/useDuels';
import {
  calculateMaxHP,
  calculateSkillBonusByCategory,
  calculateCombatSkillBonus,
  formatNumber,
  formatTimeRemaining
} from '@/utils/statsCalculations';

// Core stat configuration matching sidebar colors
const STAT_CONFIG = {
  cunning: {
    icon: '♠',
    gradient: 'from-gray-600 to-gray-400',
    border: 'border-gray-600',
    description: 'Stealth, deception, crimes'
  },
  spirit: {
    icon: '♥',
    gradient: 'from-red-700 to-red-400',
    border: 'border-red-700',
    description: 'Social, supernatural, charm'
  },
  combat: {
    icon: '♣',
    gradient: 'from-green-700 to-green-400',
    border: 'border-green-700',
    description: 'Fighting, violence, force'
  },
  craft: {
    icon: '♦',
    gradient: 'from-blue-600 to-blue-400',
    border: 'border-blue-600',
    description: 'Economy, creation, trade'
  }
} as const;

type StatKey = keyof typeof STAT_CONFIG;

export const Stats: React.FC = () => {
  // Hooks for data
  const { currentCharacter } = useCharacterStore();
  const { skills, skillData, fetchSkills } = useSkillStore();
  const { timeToFull } = useEnergy();
  const { duelStats, fetchDuelStats } = useDuels();

  // Fetch data on mount
  useEffect(() => {
    fetchSkills();
    fetchDuelStats();
  }, [fetchSkills, fetchDuelStats]);

  // Calculate derived stats
  const derivedStats = useMemo(() => {
    if (!currentCharacter || !skills.length) return null;

    const skillBonusByCategory = calculateSkillBonusByCategory(skillData, skills);
    const combatSkillBonus = calculateCombatSkillBonus(skillData, skills);
    const maxHP = calculateMaxHP(currentCharacter.level, combatSkillBonus);

    return {
      maxHP,
      skillBonusByCategory,
      combatSkillBonus,
      levelHPBonus: currentCharacter.level * 5,
      baseHP: 100
    };
  }, [currentCharacter, skillData, skills]);

  // Loading state
  if (!currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto" />
          <p className="text-desert-sand font-serif">Loading stats...</p>
        </div>
      </div>
    );
  }

  // Calculate XP progress
  const xpProgress = (currentCharacter.experience / currentCharacter.experienceToNextLevel) * 100;

  // Format faction display
  const factionDisplay = currentCharacter.faction
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-western text-gold-light">Character Stats</h1>

      {/* Character Header */}
      <Card variant="wood" className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-wood-dark rounded-full flex items-center justify-center text-3xl border-2 border-wood-light/30">
            🤠
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-western text-gold-light">{currentCharacter.name}</h2>
            <p className="text-desert-sand">
              Level {currentCharacter.level} • {factionDisplay}
            </p>
            {/* XP Progress Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-desert-stone mb-1">
                <span>Experience</span>
                <span>{formatNumber(currentCharacter.experience)} / {formatNumber(currentCharacter.experienceToNextLevel)}</span>
              </div>
              <div className="h-2 bg-wood-dark rounded-full overflow-hidden border border-wood-light/30">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-300"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Stats Grid */}
      <div>
        <h3 className="text-lg font-western text-gold-light mb-3">Core Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(STAT_CONFIG) as [StatKey, typeof STAT_CONFIG[StatKey]][]).map(([statKey, config]) => {
            const statValue = currentCharacter.stats?.[statKey] || 0;
            const skillBonus = derivedStats?.skillBonusByCategory[statKey] || 0;
            const total = statValue + skillBonus;

            return (
              <Card key={statKey} variant="leather" className={`p-4 border-l-4 ${config.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span className="font-western text-gold-light uppercase">{statKey}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Base Value</span>
                    <span className="text-desert-sand font-bold">{statValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Skill Bonus</span>
                    <span className="text-green-400 font-bold">+{skillBonus}</span>
                  </div>
                  <div className="flex justify-between border-t border-wood-light/20 pt-1 mt-1">
                    <span className="text-desert-sand">Total</span>
                    <span className="text-gold-light font-bold">{total}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-wood-dark rounded-full overflow-hidden border border-wood-light/30">
                  <div
                    className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-300`}
                    style={{ width: `${Math.min(total, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-desert-stone mt-1">{config.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Combat Effectiveness */}
      <Card variant="wood" className="p-4">
        <h3 className="text-lg font-western text-gold-light mb-3">Combat Effectiveness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-desert-stone">Estimated Max HP</span>
              <span className="text-gold-light font-bold text-lg">{derivedStats?.maxHP || 100}</span>
            </div>
            <div className="text-xs text-desert-stone pl-4 space-y-1 border-l-2 border-wood-light/20">
              <div className="flex justify-between">
                <span>Base HP</span>
                <span>{derivedStats?.baseHP || 100}</span>
              </div>
              <div className="flex justify-between">
                <span>Level Bonus (×5)</span>
                <span className="text-green-400">+{derivedStats?.levelHPBonus || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Combat Skills</span>
                <span className="text-green-400">+{derivedStats?.combatSkillBonus || 0}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-desert-stone">Total Damage Dealt</span>
              <span className="text-red-400 font-bold">{formatNumber(currentCharacter.combatStats?.totalDamage || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-desert-stone">Total Kills</span>
              <span className="text-gold-light font-bold">{formatNumber(currentCharacter.combatStats?.kills || 0)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Combat Record */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PvE Combat */}
        <Card variant="leather" className="p-4">
          <h3 className="font-western text-gold-light mb-3">PvE Combat</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-desert-stone">Wins</span>
              <span className="text-green-400 font-bold">{currentCharacter.combatStats?.wins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-desert-stone">Losses</span>
              <span className="text-red-400 font-bold">{currentCharacter.combatStats?.losses || 0}</span>
            </div>
            <div className="flex justify-between border-t border-wood-light/20 pt-2 mt-2">
              <span className="text-desert-sand">Win Rate</span>
              <span className={`font-bold ${(currentCharacter.combatStats?.winRate || 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {(currentCharacter.combatStats?.winRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* PvP Duels */}
        <Card variant="leather" className="p-4">
          <h3 className="font-western text-gold-light mb-3">PvP Duels</h3>
          {duelStats ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-desert-stone">Wins</span>
                <span className="text-green-400 font-bold">{duelStats.wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-desert-stone">Losses</span>
                <span className="text-red-400 font-bold">{duelStats.losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-desert-stone">Draws</span>
                <span className="text-desert-sand font-bold">{duelStats.draws}</span>
              </div>
              <div className="flex justify-between border-t border-wood-light/20 pt-2 mt-2">
                <span className="text-desert-sand">Win Rate</span>
                <span className={`font-bold ${duelStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {duelStats.winRate.toFixed(1)}%
                </span>
              </div>
              {duelStats.currentStreak !== 0 && (
                <div className="flex justify-between">
                  <span className="text-desert-stone">Current Streak</span>
                  <span className={`font-bold ${duelStats.currentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {duelStats.currentStreak > 0 ? 'W' : 'L'}{Math.abs(duelStats.currentStreak)}
                    {Math.abs(duelStats.currentStreak) >= 3 && ' 🔥'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-desert-stone">Best Streak</span>
                <span className="text-gold-light font-bold">W{duelStats.longestWinStreak}</span>
              </div>
            </div>
          ) : (
            <p className="text-desert-stone text-sm italic">No duel history yet</p>
          )}
        </Card>
      </div>

      {/* Resources */}
      <Card variant="wood" className="p-4">
        <h3 className="text-lg font-western text-gold-light mb-3">Resources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-wood-dark/50 rounded-lg">
            <div className="text-2xl mb-1">💵</div>
            <div className="text-gold-light font-bold">${formatNumber(currentCharacter.dollars || 0)}</div>
            <div className="text-xs text-desert-stone">Dollars</div>
          </div>
          <div className="text-center p-2 bg-wood-dark/50 rounded-lg">
            <div className="text-2xl mb-1">🥇</div>
            <div className="text-yellow-400 font-bold">{formatNumber(currentCharacter.goldResource || 0)}</div>
            <div className="text-xs text-desert-stone">Gold</div>
          </div>
          <div className="text-center p-2 bg-wood-dark/50 rounded-lg">
            <div className="text-2xl mb-1">🥈</div>
            <div className="text-gray-300 font-bold">{formatNumber(currentCharacter.silverResource || 0)}</div>
            <div className="text-xs text-desert-stone">Silver</div>
          </div>
          <div className="text-center p-2 bg-wood-dark/50 rounded-lg">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-blue-400 font-bold">{currentCharacter.energy}/{currentCharacter.maxEnergy}</div>
            <div className="text-xs text-desert-stone">
              {currentCharacter.energy >= currentCharacter.maxEnergy ? 'Full' : `Full in ${formatTimeRemaining(timeToFull)}`}
            </div>
          </div>
        </div>
      </Card>

      {/* Reputation */}
      <Card variant="wood" className="p-4">
        <h3 className="text-lg font-western text-gold-light mb-3">Reputation</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-desert-stone">Wanted Level</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl transition-colors ${i < (currentCharacter.wantedLevel || 0) ? 'text-red-500' : 'text-desert-stone/30'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          {(currentCharacter.bountyAmount || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-desert-stone">Bounty</span>
              <span className="text-red-400 font-bold">${formatNumber(currentCharacter.bountyAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-desert-stone">Status</span>
            {currentCharacter.isJailed ? (
              <span className="text-red-400 font-bold">JAILED</span>
            ) : (
              <span className="text-green-400 font-bold">FREE</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Stats;
