/**
 * AdPlayerOverlay Component
 * Full-screen overlay for mock ad playback during development
 *
 * This simulates what a real ad would look like, allowing testing of:
 * - Ad flow UI/UX
 * - Progress indicators
 * - Skip functionality
 * - Reward messaging
 */

import React from 'react';
import { useAdRewards } from '@/hooks/useAdRewards';
import { AdRewardType } from '@/services/ad.service';

/**
 * Reward type display names
 */
const REWARD_NAMES: Record<AdRewardType, string> = {
  [AdRewardType.XP_BOOST]: '+50% XP Boost',
  [AdRewardType.GOLD_BOOST]: '+50% Gold Boost',
  [AdRewardType.ENERGY_BOOST]: '+50% Energy Regen',
  [AdRewardType.ENERGY_REFILL]: '+25 Energy',
  [AdRewardType.EXTRA_CONTRACT]: '+1 Daily Contract',
  [AdRewardType.BONUS_GOLD]: 'Bonus Gold',
};

/**
 * AdPlayerOverlay component
 * Renders a full-screen mock ad overlay during development
 */
export const AdPlayerOverlay: React.FC = () => {
  const { isPlaying, isMockProvider, mockAdState, skipAd } = useAdRewards();

  // Only show for mock provider when an ad is playing
  if (!isPlaying || !isMockProvider || !mockAdState?.isShowing) {
    return null;
  }

  const { progress, remainingSeconds, rewardType, canSkip } = mockAdState;
  const rewardName = rewardType ? REWARD_NAMES[rewardType] : 'Reward';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
    >
      {/* Mock ad content */}
      <div className="relative w-full max-w-2xl mx-4">
        {/* "AD" label */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
          AD (MOCK)
        </div>

        {/* Skip button (top right) */}
        {canSkip ? (
          <button
            onClick={skipAd}
            className="absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded transition-colors"
          >
            Skip Ad →
          </button>
        ) : (
          <div className="absolute top-4 right-4 px-4 py-2 bg-white/10 text-white/60 text-sm rounded">
            Skip in {Math.ceil(2 - (progress * 5))}s
          </div>
        )}

        {/* Mock ad visual */}
        <div className="aspect-video bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950 rounded-lg overflow-hidden border-4 border-gold-medium shadow-2xl">
          {/* Western-themed mock ad content */}
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            {/* Decorative border */}
            <div className="absolute inset-4 border-2 border-gold-medium/30 rounded-lg pointer-events-none" />

            {/* Mock ad logo/branding */}
            <div className="text-6xl mb-4">🤠</div>

            <h2 className="text-3xl font-bold text-gold-light mb-2 font-western">
              DESPERADOS DESTINY
            </h2>

            <p className="text-xl text-desert-sand mb-6">
              Development Mode - Mock Advertisement
            </p>

            {/* Reward preview */}
            <div className="bg-black/30 rounded-lg px-6 py-4 mb-6">
              <p className="text-sm text-desert-muted mb-1">Watch to earn:</p>
              <p className="text-2xl font-bold text-gold-medium">{rewardName}</p>
            </div>

            {/* Progress indicator */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-desert-muted mb-2">
                <span>Ad Progress</span>
                <span>{remainingSeconds}s remaining</span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Instructions */}
            <p className="mt-6 text-sm text-desert-muted">
              {canSkip
                ? 'You can now skip this ad, but you won\'t receive the reward'
                : 'Please wait while the ad plays to receive your reward'}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-sm text-white/50">
          This is a mock ad for development testing.
          In production, real video ads will be shown.
        </div>
      </div>
    </div>
  );
};

export default AdPlayerOverlay;
