/**
 * StreakTracker Component
 *
 * Displays streak progress with milestone bonuses
 * Part of the Competitor Parity Plan - Phase B
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { StreakInfo } from '@/hooks/useDailyContracts';

interface StreakTrackerProps {
  streakInfo: StreakInfo | null;
  onClaimBonus: () => void;
  isLoading?: boolean;
}

/**
 * Streak milestone data for display
 */
const STREAK_MILESTONES = [
  { day: 1, label: 'Day 1' },
  { day: 2, label: 'Day 2' },
  { day: 3, label: 'Day 3' },
  { day: 4, label: 'Day 4' },
  { day: 5, label: 'Day 5' },
  { day: 6, label: 'Day 6' },
  { day: 7, label: 'Week 1', special: true },
  { day: 14, label: 'Week 2', special: true },
  { day: 21, label: 'Week 3', special: true },
  { day: 30, label: 'Month', special: true, legendary: true }
];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streakInfo,
  onClaimBonus,
  isLoading = false
}) => {
  if (!streakInfo) {
    return (
      <Card variant="wood" className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-wood-grain/30 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-wood-grain/30 rounded mb-2"></div>
          <div className="h-4 bg-wood-grain/30 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  const currentStreak = streakInfo.currentStreak;
  const nextBonusDay = streakInfo.nextBonusDay;
  const progressToNext = nextBonusDay > 0 ? (currentStreak / nextBonusDay) * 100 : 100;

  // Determine which milestone markers to show based on current streak
  const visibleMilestones = STREAK_MILESTONES.filter(
    m => m.day <= Math.max(currentStreak + 7, 7)
  );

  return (
    <Card variant="leather" className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-western text-xl text-gold-light">Daily Streak</h3>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gold-light">{currentStreak}</span>
          <span className="text-desert-stone text-sm">days</span>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-wood-dark/50 rounded p-3 mb-4 border border-wood-grain/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-desert-sand text-sm">Today's Contracts</span>
          <span className="text-gold-light">
            {streakInfo.todayCompleted} / {streakInfo.totalContractsToday}
          </span>
        </div>
        <div className="h-2 bg-wood-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-light transition-all duration-300"
            style={{
              width: `${(streakInfo.todayCompleted / streakInfo.totalContractsToday) * 100}%`
            }}
          />
        </div>
        {streakInfo.todayCompleted === 0 && currentStreak > 0 && (
          <p className="text-xs text-yellow-400 mt-2 text-center">
            Complete at least one contract to maintain your streak!
          </p>
        )}
      </div>

      {/* Streak Progress Bar */}
      <div className="relative mb-6">
        <div className="h-3 bg-wood-dark rounded-full overflow-hidden border border-wood-grain/30">
          <div
            className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
            style={{ width: `${Math.min(progressToNext, 100)}%` }}
          />
        </div>

        {/* Milestone markers */}
        <div className="relative mt-1">
          {visibleMilestones.slice(0, 7).map((milestone, _index) => {
            const position = (milestone.day / Math.max(nextBonusDay, visibleMilestones[6]?.day || 7)) * 100;
            const isReached = currentStreak >= milestone.day;
            const isCurrent = currentStreak === milestone.day;

            return (
              <div
                key={milestone.day}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${Math.min(position, 100)}%` }}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isReached
                      ? milestone.legendary
                        ? 'bg-yellow-400 border-yellow-300'
                        : milestone.special
                        ? 'bg-purple-500 border-purple-400'
                        : 'bg-gold-light border-gold-dark'
                      : 'bg-wood-grain border-wood-dark'
                  } ${isCurrent ? 'ring-2 ring-gold-light/50' : ''}`}
                />
                <span
                  className={`text-[10px] block text-center mt-1 ${
                    isReached ? 'text-desert-sand' : 'text-desert-stone'
                  }`}
                >
                  {milestone.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Bonus Preview */}
      {streakInfo.nextBonus && (
        <div className="bg-wood-dark/50 rounded p-3 mb-4 border border-gold-light/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-desert-sand text-sm">Next Milestone: Day {nextBonusDay}</span>
            <span className="text-xs text-desert-stone">
              {nextBonusDay - currentStreak} days away
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gold-light/10 text-gold-light px-2 py-1 rounded">
              +{streakInfo.nextBonus.gold} Gold
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
              +{streakInfo.nextBonus.xp} XP
            </span>
            {streakInfo.nextBonus.item && (
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                {streakInfo.nextBonus.item}
              </span>
            )}
            {streakInfo.nextBonus.premiumCurrency && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded">
                +{streakInfo.nextBonus.premiumCurrency} Premium
              </span>
            )}
          </div>
          <p className="text-xs text-desert-stone mt-2 italic">
            "{streakInfo.nextBonus.description}"
          </p>
        </div>
      )}

      {/* Claim Bonus Button */}
      {streakInfo.canClaimStreakBonus && (
        <Button
          onClick={onClaimBonus}
          disabled={isLoading}
          variant="primary"
          fullWidth
          className="animate-pulse"
        >
          Claim Streak Bonus!
        </Button>
      )}

      {/* Streak History (Last 7 days) */}
      <div className="mt-4 pt-4 border-t border-wood-grain/30">
        <h4 className="text-sm font-western text-desert-sand mb-2">This Week</h4>
        <div className="flex justify-between gap-1">
          {streakInfo.streakHistory.map((day, index) => {
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const today = new Date().getDay();
            const dayIndex = (today - (6 - index) + 7) % 7;

            return (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`h-8 rounded flex items-center justify-center text-xs ${
                    day.completed
                      ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                      : index === 6
                      ? 'bg-wood-grain/20 text-desert-stone border border-dashed border-wood-grain/50'
                      : 'bg-red-900/20 text-red-400/50 border border-red-500/20'
                  }`}
                >
                  {day.completed ? 'Y' : index === 6 ? '?' : 'X'}
                </div>
                <span className="text-[10px] text-desert-stone mt-1 block">
                  {dayLabels[dayIndex]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default StreakTracker;
