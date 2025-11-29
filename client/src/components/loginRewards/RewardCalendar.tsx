/**
 * RewardCalendar Component
 * Phase B - Competitor Parity Plan
 *
 * Full 28-day reward calendar grid (4 rows of 7 days)
 */

import React from 'react';
import { Card } from '@/components/ui';
import { RewardDay } from './RewardDay';
import { CalendarDay } from '@/hooks/useLoginRewards';

interface RewardCalendarProps {
  days: CalendarDay[];
  currentDay: number;
  onDayClick?: (day: CalendarDay) => void;
}

/**
 * Week labels for the calendar
 */
const WEEK_LABELS = [
  { week: 1, label: 'Week 1', bonus: '1x Rewards' },
  { week: 2, label: 'Week 2', bonus: '1.5x Rewards' },
  { week: 3, label: 'Week 3', bonus: '2x Rewards' },
  { week: 4, label: 'Week 4', bonus: '2.5x Rewards + Monthly Bonus!' }
];

/**
 * Day of week headers
 */
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const RewardCalendar: React.FC<RewardCalendarProps> = ({
  days,
  currentDay,
  onDayClick
}) => {
  // Split days into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(days.slice(i * 7, (i + 1) * 7));
  }

  // Calculate progress
  const claimedDays = days.filter(d => d.claimed).length;
  const progressPercent = (claimedDays / 28) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <Card variant="wood" padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-serif text-desert-sand">
            Monthly Progress
          </span>
          <span className="text-sm font-bold text-gold-light">
            {claimedDays}/28 Days
          </span>
        </div>
        <div className="h-3 bg-wood-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Week milestones on progress bar */}
        <div className="relative h-2">
          {[7, 14, 21, 28].map((milestone, idx) => (
            <div
              key={milestone}
              className="absolute top-0 w-px h-2 bg-desert-sand/30"
              style={{ left: `${(milestone / 28) * 100}%` }}
            >
              <span className="absolute top-3 -translate-x-1/2 text-[10px] text-desert-stone">
                W{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar grid */}
      <Card variant="leather">
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAY_HEADERS.map((dayName, idx) => (
              <div
                key={dayName}
                className={`
                  text-center text-sm font-bold py-1
                  ${idx >= 5 ? 'text-gold-light' : 'text-desert-sand'}
                `}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((weekDays, weekIdx) => {
            const weekInfo = WEEK_LABELS[weekIdx];

            return (
              <div key={weekIdx} className="mb-4 last:mb-0">
                {/* Week header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-western text-desert-sand">
                    {weekInfo.label}
                  </span>
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded
                    ${weekIdx === 3 ? 'bg-gold-dark text-wood-dark' : 'bg-wood-dark/50 text-desert-stone'}
                  `}>
                    {weekInfo.bonus}
                  </span>
                </div>

                {/* Week days grid */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <RewardDay
                      key={day.absoluteDay}
                      day={day}
                      isCurrentDay={day.absoluteDay === currentDay}
                      onClick={() => onDayClick?.(day)}
                      disabled={day.claimed || day.absoluteDay !== currentDay}
                    />
                  ))}
                </div>

                {/* Divider between weeks */}
                {weekIdx < 3 && (
                  <div className="mt-4 border-t border-wood-grain/30" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card variant="parchment" padding="sm">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gold-dark/30 border border-gold-dark/50" />
            <span className="text-wood-dark">Gold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-900/30 border border-amber-600/50" />
            <span className="text-wood-dark">Item</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-900/30 border border-blue-600/50" />
            <span className="text-wood-dark">Energy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-900/30 border border-purple-600/50" />
            <span className="text-wood-dark">Material</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-500/50" />
            <span className="text-wood-dark">Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-900/30 border border-green-600/50 flex items-center justify-center text-green-400 text-xs">
              ✓
            </div>
            <span className="text-wood-dark">Claimed</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RewardCalendar;
