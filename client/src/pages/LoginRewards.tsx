/**
 * LoginRewards Page
 * Phase B - Competitor Parity Plan
 *
 * Full page view of the login reward calendar and claiming system
 */

import React, { useEffect, useState } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  RewardCalendar,
  ClaimRewardModal,
  MonthlyBonus
} from '@/components/loginRewards';
import { useLoginRewards, CalendarDay } from '@/hooks/useLoginRewards';

export const LoginRewards: React.FC = () => {
  const {
    status,
    calendar,
    statistics,
    isLoading,
    error,
    lastClaimedReward,
    showClaimModal,
    fetchStatus,
    fetchCalendar,
    fetchStatistics,
    claimReward,
    claimMonthlyBonus,
    setShowClaimModal: _setShowClaimModal,
    clearLastClaimedReward
  } = useLoginRewards();

  const [_selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Load data on mount
  useEffect(() => {
    fetchStatus();
    fetchCalendar();
    fetchStatistics();
  }, [fetchStatus, fetchCalendar, fetchStatistics]);

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    if (day.absoluteDay === calendar?.currentDay && status?.canClaim) {
      handleClaim();
    } else {
      setSelectedDay(day);
    }
  };

  // Handle claim
  const handleClaim = async () => {
    await claimReward();
  };

  // Handle monthly bonus claim
  const handleMonthlyBonus = async () => {
    await claimMonthlyBonus();
  };

  // Loading state
  if (isLoading && !calendar) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error && !calendar) {
    return (
      <Card variant="leather" className="p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => { fetchStatus(); fetchCalendar(); }}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Daily Login Rewards
              </h1>
              <p className="text-desert-sand font-serif mt-1">
                Log in each day to claim rewards. Complete all 28 days for a special bonus!
              </p>
            </div>

            {/* Quick claim button */}
            {status?.canClaim && (
              <Button
                variant="primary"
                onClick={handleClaim}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <span className="text-xl">🎁</span>
                {isLoading ? 'Claiming...' : 'Claim Today\'s Reward'}
              </Button>
            )}

            {!status?.canClaim && status?.nextClaimAvailable && (
              <div className="text-right">
                <div className="text-sm text-desert-stone">Next reward in</div>
                <CountdownTimer targetDate={status.nextClaimAvailable} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Current Streak"
            value={`${statistics.currentStreak} days`}
            icon="🔥"
          />
          <StatCard
            label="Total Days"
            value={statistics.totalDaysClaimed.toString()}
            icon="📅"
          />
          <StatCard
            label="Gold Earned"
            value={statistics.goldEarned.toString()}
            icon="💰"
          />
          <StatCard
            label="Premium Rewards"
            value={statistics.premiumRewardsReceived.toString()}
            icon="⭐"
          />
        </div>
      )}

      {/* Today's reward preview */}
      {status?.todayRewardPreview && (
        <Card variant="parchment">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-western text-wood-dark">
                  {status.canClaim ? 'Today\'s Reward' : 'Today\'s Reward (Claimed)'}
                </h3>
                <p className="text-wood-grain font-serif">
                  Day {status.currentDay} - Week {status.currentWeek}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-wood-dark">
                  {status.todayRewardPreview.description}
                </div>
                {status.todayRewardPreview.multiplier > 1 && (
                  <div className="text-sm text-gold-dark">
                    {status.todayRewardPreview.multiplier}x multiplier
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      {calendar && (
        <RewardCalendar
          days={calendar.days}
          currentDay={calendar.currentDay}
          onDayClick={handleDayClick}
        />
      )}

      {/* Monthly Bonus */}
      {calendar && (
        <MonthlyBonus
          bonus={calendar.monthlyBonus}
          totalDaysClaimed={status?.totalDaysClaimed || 0}
          onClaim={handleMonthlyBonus}
          isLoading={isLoading}
        />
      )}

      {/* Server time info */}
      <Card variant="parchment" padding="sm">
        <div className="text-center text-sm text-wood-grain">
          <p>
            Rewards reset at midnight UTC.
            {status?.serverTime && (
              <span className="ml-2">
                Server time: {new Date(status.serverTime).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
      </Card>

      {/* Claim reward modal */}
      <ClaimRewardModal
        isOpen={showClaimModal}
        onClose={clearLastClaimedReward}
        reward={lastClaimedReward}
        day={calendar?.currentDay}
        week={calendar?.currentWeek}
      />
    </div>
  );
};

/**
 * Stat card component
 */
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <Card variant="wood" padding="sm">
    <div className="flex items-center gap-3 p-2">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs text-desert-stone">{label}</div>
        <div className="text-lg font-bold text-gold-light">{value}</div>
      </div>
    </div>
  </Card>
);

/**
 * Countdown timer component
 */
interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-gold-light font-mono text-lg">
      {timeLeft}
    </div>
  );
};

export default LoginRewards;
