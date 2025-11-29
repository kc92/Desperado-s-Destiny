/**
 * LoginRewardPopup Component
 * Phase B - Competitor Parity Plan
 *
 * Popup shown on login when a reward is available to claim
 */

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useLoginRewards, RewardType, CalendarDay } from '@/hooks/useLoginRewards';

interface LoginRewardPopupProps {
  onClose: () => void;
  autoShow?: boolean;
}

/**
 * Get icon for reward type
 */
const RewardIcon: React.FC<{ type: RewardType }> = ({ type }) => {
  const iconClass = 'w-12 h-12';

  switch (type) {
    case 'gold':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#FFD700" stroke="#B8860B" strokeWidth="3" />
          <text x="24" y="32" textAnchor="middle" fontSize="24" fill="#5C4600" fontWeight="bold">$</text>
        </svg>
      );
    case 'energy':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <path d="M28 4L12 26h12L20 44l16-22H24L32 4z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" />
        </svg>
      );
    case 'item':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" stroke="#D97706" strokeWidth="2">
          <rect x="8" y="12" width="32" height="28" rx="3" fill="#F59E0B" />
          <rect x="8" y="12" width="32" height="8" rx="3" fill="#FBBF24" />
          <rect x="20" y="18" width="8" height="14" fill="#B45309" rx="1" />
        </svg>
      );
    case 'material':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 44,16 44,36 24,44 4,36 4,16" fill="#9333EA" stroke="#7E22CE" strokeWidth="2" />
          <polygon points="24,12 36,20 36,32 24,38 12,32 12,20" fill="#A855F7" opacity="0.8" />
        </svg>
      );
    case 'premium':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <path
            d="M24 2l6 18h19l-15 11 6 18-16-12-16 12 6-18L-1 20h19z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="14" width="36" height="28" rx="3" />
          <path d="M24 14V10a4 4 0 10-8 0v4M32 14V10a4 4 0 10-8 0v4" />
        </svg>
      );
  }
};

export const LoginRewardPopup: React.FC<LoginRewardPopupProps> = ({
  onClose,
  autoShow = true
}) => {
  const {
    status,
    fetchStatus,
    claimReward,
    isLoading,
    lastClaimedReward
  } = useLoginRewards();

  const [isVisible, setIsVisible] = useState(false);
  const [hasClaimedInSession, setHasClaimedInSession] = useState(false);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Show popup when status loads and reward is available
  useEffect(() => {
    if (autoShow && status?.canClaim && !hasClaimedInSession) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [status, autoShow, hasClaimedInSession]);

  const handleClaim = async () => {
    await claimReward();
    setHasClaimedInSession(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Don't render if not visible or no reward available
  if (!isVisible || !status?.canClaim) return null;

  const todayPreview = status.todayRewardPreview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative animate-slide-up">
        <Card variant="wood" className="w-full max-w-sm overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-desert-sand hover:text-gold-light transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header glow effect */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold-light/20 to-transparent pointer-events-none" />

          <div className="relative p-6 text-center">
            {/* Title */}
            <h2 className="text-2xl font-western text-gold-light mb-2">
              Daily Reward Ready!
            </h2>
            <p className="text-desert-sand text-sm mb-4">
              Day {status.currentDay} of 28
            </p>

            {/* Reward preview */}
            {todayPreview && (
              <div className="bg-wood-dark/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold-light/30 blur-xl rounded-full animate-pulse" />
                    <RewardIcon type={todayPreview.baseReward.type} />
                  </div>
                </div>
                <div className="text-lg font-bold text-desert-sand mb-1">
                  {todayPreview.description}
                </div>
                {todayPreview.multiplier > 1 && (
                  <div className="text-sm text-gold-light">
                    Week {todayPreview.week} Bonus: {todayPreview.multiplier}x value!
                  </div>
                )}
              </div>
            )}

            {/* Streak info */}
            {status.streak > 1 && (
              <div className="text-sm text-green-400 mb-4">
                🔥 {status.streak} day streak!
              </div>
            )}

            {/* Claim button */}
            {!lastClaimedReward ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleClaim}
                disabled={isLoading}
              >
                {isLoading ? 'Claiming...' : 'Claim Reward'}
              </Button>
            ) : (
              <div className="text-green-400 font-bold mb-2">
                Reward Claimed!
              </div>
            )}

            {/* View calendar link */}
            <button
              onClick={handleClose}
              className="mt-3 text-sm text-desert-stone hover:text-gold-light transition-colors"
            >
              {lastClaimedReward ? 'Close' : 'Claim later'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginRewardPopup;
