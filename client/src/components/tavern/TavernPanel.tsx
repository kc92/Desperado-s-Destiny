/**
 * TavernPanel Component
 * Displays available tavern activities for energy regeneration buffs
 *
 * Part of the Tavern Rest & Social System
 */

import React, { useEffect, useState } from 'react';
import { Beer, Coffee, Bath, Bed, Users, Clock, Coins, Zap, Sparkles, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { useTavern, TavernActivity } from '@/hooks/useTavern';
import { useCharacterStore } from '@/store/useCharacterStore';
import { WesternPanel } from '@/components/ui/WesternPanel';
import { Button } from '@/components/ui/Button';

/**
 * Get icon for activity type
 */
const getActivityIcon = (activityId: string): React.ReactNode => {
  switch (activityId) {
    case 'tavern_drink':
      return <Beer className="w-5 h-5" />;
    case 'tavern_socialize':
      return <Users className="w-5 h-5" />;
    case 'tavern_cards':
      return <span className="text-lg">🃏</span>;
    case 'tavern_bath':
      return <Bath className="w-5 h-5" />;
    case 'tavern_rest':
      return <Bed className="w-5 h-5" />;
    default:
      return <Coffee className="w-5 h-5" />;
  }
};

/**
 * Activity Card Component
 */
interface ActivityCardProps {
  activity: TavernActivity;
  onPerform: (activityId: string) => void;
  isPerforming: boolean;
  formatCooldown: (ms: number) => string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPerform,
  isPerforming,
  formatCooldown
}) => {
  const canPerform = !activity.onCooldown && activity.canAfford && activity.hasEnergy && !isPerforming;

  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${canPerform
          ? 'bg-wood-dark/50 border-gold-medium/30 hover:border-gold-medium/60 hover:bg-wood-dark/70'
          : 'bg-wood-darker/30 border-wood-dark/30 opacity-60'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          p-2 rounded-lg
          ${canPerform ? 'bg-gold-medium/20 text-gold-light' : 'bg-wood-dark/50 text-desert-stone'}
        `}>
          {getActivityIcon(activity.id)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-desert-sand">{activity.name}</h4>
          <p className="text-sm text-desert-stone">{activity.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        {/* Regen Bonus */}
        <div className="flex items-center gap-2 text-green-400">
          <Sparkles className="w-4 h-4" />
          <span>+{activity.regenBonus}% regen</span>
          {activity.locationBonus > 0 && (
            <span className="text-xs text-gold-light">(+{activity.locationBonus}% bonus)</span>
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-desert-stone">
          <Timer className="w-4 h-4" />
          <span>{activity.durationMinutes} min buff</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-2 text-gold-light">
          <Coins className="w-4 h-4" />
          <span>{activity.cost > 0 ? `$${activity.cost}` : 'Free'}</span>
        </div>

        {/* Energy Cost */}
        {activity.energyCost > 0 && (
          <div className="flex items-center gap-2 text-blue-400">
            <Zap className="w-4 h-4" />
            <span>{activity.energyCost} energy</span>
          </div>
        )}
      </div>

      {/* XP Reward */}
      <div className="text-xs text-desert-stone mb-3">
        Rewards: +{activity.xpReward.amount} {activity.xpReward.skill} XP
      </div>

      {/* Cooldown or Action Button */}
      {activity.onCooldown ? (
        <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-wood-darker/50 text-desert-stone">
          <Clock className="w-4 h-4" />
          <span>Available in {formatCooldown(activity.cooldownRemainingMs)}</span>
        </div>
      ) : (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => onPerform(activity.id)}
          disabled={!canPerform}
          isLoading={isPerforming}
          loadingText="..."
        >
          {!activity.canAfford
            ? `Need $${activity.cost}`
            : !activity.hasEnergy
              ? `Need ${activity.energyCost} energy`
              : activity.name
          }
        </Button>
      )}
    </div>
  );
};

/**
 * TavernPanel Props
 */
export interface TavernPanelProps {
  /** Whether panel starts collapsed */
  defaultCollapsed?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * TavernPanel Component
 */
export const TavernPanel: React.FC<TavernPanelProps> = ({
  defaultCollapsed = false,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    activities,
    isInTavern,
    totalRegenBonus,
    inTavernBonusActive,
    config,
    isLoading,
    isPerforming,
    error,
    fetchActivities,
    fetchBuffs,
    performActivity,
    formatCooldown,
    clearError
  } = useTavern();

  const { currentCharacter } = useCharacterStore();

  // Fetch data on mount and when location changes
  useEffect(() => {
    if (currentCharacter) {
      fetchActivities();
      fetchBuffs();
    }
  }, [currentCharacter?.currentLocation, fetchActivities, fetchBuffs]);

  // Handle activity performance
  const handlePerformActivity = async (activityId: string) => {
    const result = await performActivity(activityId);
    if (result) {
      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Don't render if not in tavern
  if (!isInTavern && !isLoading) {
    return null;
  }

  return (
    <WesternPanel
      variant="wood"
      padding="md"
      className={`${className}`}
      aria-label="Tavern Activities"
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between mb-4 focus:outline-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <Beer className="w-6 h-6 text-gold-light" />
          <h3 className="text-lg font-western text-gold-light">Tavern Activities</h3>
        </div>
        <div className="flex items-center gap-3">
          {totalRegenBonus > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-900/30 text-green-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>+{totalRegenBonus}% regen</span>
              {inTavernBonusActive && (
                <span className="text-xs text-gold-light ml-1">(in tavern)</span>
              )}
            </div>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-desert-stone" />
          ) : (
            <ChevronUp className="w-5 h-5 text-desert-stone" />
          )}
        </div>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <>
          {/* Info Banner */}
          {config && (
            <div className="mb-4 p-3 rounded-lg bg-wood-darker/50 text-sm text-desert-stone">
              <p>
                Perform activities to boost your energy regeneration rate.
                Buffs stack up to +{config.maxRegenBuff}% max.
                {config.inTavernBonus > 0 && (
                  <span className="text-gold-light">
                    {' '}Stay in the tavern for an extra +{config.inTavernBonus}% bonus!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-300 hover:text-red-100 ml-2"
                aria-label="Dismiss error"
              >
                &times;
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-desert-stone">
              <div className="animate-spin w-6 h-6 border-2 border-gold-light border-t-transparent rounded-full mr-3" />
              <span>Loading activities...</span>
            </div>
          ) : (
            /* Activities Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPerform={handlePerformActivity}
                  isPerforming={isPerforming}
                  formatCooldown={formatCooldown}
                />
              ))}
            </div>
          )}
        </>
      )}
    </WesternPanel>
  );
};

export default TavernPanel;
