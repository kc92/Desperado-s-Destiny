/**
 * AdRewardButton Component
 * Button to watch an ad and receive a reward
 *
 * Usage:
 *   <AdRewardButton
 *     rewardType={AdRewardType.XP_BOOST}
 *     onRewardClaimed={(reward) => console.log('Got reward:', reward)}
 *   />
 */

import React, { useCallback, useMemo } from 'react';
import { AdRewardType } from '@/services/ad.service';
import { useAdRewards } from '@/hooks/useAdRewards';

/**
 * Reward type display configuration
 */
const REWARD_DISPLAY: Record<AdRewardType, { label: string; icon: string; description: string }> = {
  [AdRewardType.XP_BOOST]: {
    label: '+50% XP',
    icon: '⭐',
    description: 'Boost your XP gain for 30 minutes',
  },
  [AdRewardType.GOLD_BOOST]: {
    label: '+50% Gold',
    icon: '💰',
    description: 'Boost your gold drops for 30 minutes',
  },
  [AdRewardType.ENERGY_BOOST]: {
    label: '+50% Energy Regen',
    icon: '⚡',
    description: 'Faster energy regeneration for 30 minutes',
  },
  [AdRewardType.ENERGY_REFILL]: {
    label: '+25 Energy',
    icon: '🔋',
    description: 'Instantly refill some energy',
  },
  [AdRewardType.EXTRA_CONTRACT]: {
    label: '+1 Contract',
    icon: '📜',
    description: 'Get an extra daily contract',
  },
  [AdRewardType.BONUS_GOLD]: {
    label: 'Bonus Gold',
    icon: '🪙',
    description: 'Bonus gold on your next action',
  },
};

interface AdRewardButtonProps {
  /** Type of reward to grant */
  rewardType: AdRewardType;
  /** Callback when reward is successfully claimed */
  onRewardClaimed?: (reward: any) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Custom button text (overrides default) */
  buttonText?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show remaining views count */
  showRemainingViews?: boolean;
  /** Disabled state (in addition to internal checks) */
  disabled?: boolean;
}

/**
 * AdRewardButton component
 */
export const AdRewardButton: React.FC<AdRewardButtonProps> = ({
  rewardType,
  onRewardClaimed,
  onError,
  buttonText,
  size = 'md',
  className = '',
  showRemainingViews = true,
  disabled = false,
}) => {
  const {
    isInitialized,
    isLoading,
    isPlaying,
    canWatchAd,
    getRemainingViews,
    getActiveBonus,
    showAd,
  } = useAdRewards();

  const rewardDisplay = REWARD_DISPLAY[rewardType];
  const remainingViews = getRemainingViews(rewardType);
  const activeBonus = getActiveBonus(rewardType);
  const canWatch = canWatchAd(rewardType);

  /**
   * Handle button click
   */
  const handleClick = useCallback(async () => {
    if (!canWatch || isLoading || isPlaying || disabled) {
      return;
    }

    const result = await showAd(rewardType);

    if (result.success) {
      onRewardClaimed?.(result.reward);
    } else {
      onError?.(result.error || 'Failed to claim reward');
    }
  }, [canWatch, isLoading, isPlaying, disabled, showAd, rewardType, onRewardClaimed, onError]);

  /**
   * Determine button state
   */
  const buttonState = useMemo(() => {
    if (!isInitialized) {
      return { disabled: true, text: 'Loading...', variant: 'disabled' as const };
    }

    if (activeBonus) {
      return {
        disabled: true,
        text: `Active (${activeBonus.remainingMinutes}m)`,
        variant: 'active' as const,
      };
    }

    if (isLoading || isPlaying) {
      return { disabled: true, text: 'Playing Ad...', variant: 'loading' as const };
    }

    if (!canWatch || remainingViews <= 0) {
      return { disabled: true, text: 'Daily Limit Reached', variant: 'limit' as const };
    }

    return {
      disabled: disabled,
      text: buttonText || `Watch Ad: ${rewardDisplay.label}`,
      variant: 'ready' as const,
    };
  }, [
    isInitialized,
    activeBonus,
    isLoading,
    isPlaying,
    canWatch,
    remainingViews,
    disabled,
    buttonText,
    rewardDisplay.label,
  ]);

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant styles
  const variantStyles = {
    ready: 'bg-gradient-to-r from-gold-dark to-gold-medium hover:from-gold-medium hover:to-gold-light text-wood-dark border-gold-medium',
    loading: 'bg-wood-medium text-desert-sand border-wood-dark cursor-wait',
    active: 'bg-green-800 text-green-100 border-green-600',
    limit: 'bg-wood-dark text-desert-muted border-wood-medium opacity-60',
    disabled: 'bg-wood-dark text-desert-muted border-wood-medium opacity-50',
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={buttonState.disabled}
        className={`
          relative flex items-center gap-2 rounded-lg border-2 font-semibold
          transition-all duration-200
          ${sizeStyles[size]}
          ${variantStyles[buttonState.variant]}
          ${buttonState.disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        `}
        title={rewardDisplay.description}
      >
        {/* Icon */}
        <span className="text-lg" aria-hidden="true">
          {isLoading || isPlaying ? '⏳' : rewardDisplay.icon}
        </span>

        {/* Text */}
        <span>{buttonState.text}</span>

        {/* Play icon for ready state */}
        {buttonState.variant === 'ready' && (
          <span className="text-sm opacity-75" aria-hidden="true">▶</span>
        )}
      </button>

      {/* Remaining views indicator */}
      {showRemainingViews && isInitialized && (
        <div className="mt-1 text-xs text-desert-muted">
          {activeBonus ? (
            <span className="text-green-400">
              {rewardDisplay.label} active for {activeBonus.remainingMinutes}m
            </span>
          ) : remainingViews > 0 ? (
            <span>{remainingViews} view{remainingViews !== 1 ? 's' : ''} remaining today</span>
          ) : (
            <span className="text-red-400">Come back tomorrow!</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdRewardButton;
