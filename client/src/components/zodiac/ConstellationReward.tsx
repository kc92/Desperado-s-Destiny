/**
 * ConstellationReward Component
 * Display and claim rewards for completed constellations
 */

import React, { useState } from 'react';
import type { ConstellationRewardData, FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';
import { Card, Button, Modal } from '@/components/ui';

interface ConstellationRewardProps {
  sign: FrontierSign;
  reward: ConstellationRewardData;
  isComplete: boolean;
  onClaim?: () => Promise<void>;
  isClaimLoading?: boolean;
  className?: string;
}

/**
 * Get icon for reward type
 */
function getRewardIcon(type: ConstellationRewardData['type']): string {
  switch (type) {
    case 'item':
      return '🎁';
    case 'title':
      return '📜';
    case 'ability':
      return '⚡';
    case 'cosmetic':
      return '✨';
    case 'permanent_bonus':
      return '🌟';
    default:
      return '🏆';
  }
}

/**
 * Get label for reward type
 */
function getRewardLabel(type: ConstellationRewardData['type']): string {
  switch (type) {
    case 'item':
      return 'Exclusive Item';
    case 'title':
      return 'Character Title';
    case 'ability':
      return 'Special Ability';
    case 'cosmetic':
      return 'Cosmetic Reward';
    case 'permanent_bonus':
      return 'Permanent Bonus';
    default:
      return 'Reward';
  }
}

/**
 * Constellation reward display component
 */
export const ConstellationReward: React.FC<ConstellationRewardProps> = ({
  sign,
  reward,
  isComplete,
  onClaim,
  isClaimLoading = false,
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimed, setClaimed] = useState(reward.claimed);
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!onClaim) return;

    setClaimError(null);
    try {
      await onClaim();
      setClaimed(true);
      setShowClaimModal(false);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim reward');
    }
  };

  // Locked state
  if (!isComplete) {
    return (
      <div className={`relative ${className}`}>
        <Card variant="leather" className="p-4 opacity-60">
          <div className="flex items-center gap-3">
            {/* Lock icon */}
            <div className="text-4xl opacity-50">🔒</div>

            {/* Info */}
            <div className="flex-1">
              <div className="text-sm text-desert-stone">Constellation Reward</div>
              <div className="font-western text-desert-sand">
                {reward.name}
              </div>
              <div className="text-xs text-desert-stone/70 mt-1">
                Complete the constellation to unlock
              </div>
            </div>

            {/* Type badge */}
            <div className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded">
              {getRewardLabel(reward.type)}
            </div>
          </div>
        </Card>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
      </div>
    );
  }

  // Claimed state
  if (claimed) {
    return (
      <Card
        variant="leather"
        className={`p-4 ${colors?.bgClass || 'bg-amber-500/20'} ${className}`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="text-4xl"
            style={{
              textShadow: `0 0 15px ${colors?.glow || 'rgba(255,215,0,0.5)'}`,
            }}
          >
            {reward.iconEmoji}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-western ${colors?.textClass || 'text-gold-light'}`}>
                {reward.name}
              </span>
              <span className="text-xs bg-green-500/50 text-green-200 px-2 py-0.5 rounded">
                Claimed
              </span>
            </div>
            <div className="text-sm text-desert-stone">{reward.description}</div>
            {reward.claimedAt && (
              <div className="text-xs text-desert-stone/70 mt-1">
                Claimed on {new Date(reward.claimedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Type icon */}
          <div className="text-2xl opacity-50">
            {getRewardIcon(reward.type)}
          </div>
        </div>
      </Card>
    );
  }

  // Ready to claim state
  return (
    <>
      <Card
        variant="leather"
        className={`
          p-4 cursor-pointer
          ${colors?.bgClass || 'bg-amber-500/20'}
          border-2 ${colors?.borderClass || 'border-amber-500/30'}
          hover:scale-102 hover:shadow-lg hover:shadow-gold-dark/30
          transition-all animate-pulse
          ${className}
        `}
        onClick={() => setShowClaimModal(true)}
      >
        <div className="flex items-center gap-3">
          {/* Glowing icon */}
          <div
            className="text-5xl animate-bounce"
            style={{
              textShadow: `0 0 20px ${colors?.glow || 'rgba(255,215,0,0.8)'}`,
            }}
          >
            {reward.iconEmoji}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="text-xs text-gold-light uppercase tracking-wider mb-1">
              Constellation Complete!
            </div>
            <div className={`font-western text-lg ${colors?.textClass || 'text-gold-light'}`}>
              {reward.name}
            </div>
            <div className="text-sm text-desert-sand">{reward.description}</div>
          </div>

          {/* Claim button */}
          <div className="text-center">
            <div className="bg-gold-medium text-wood-dark px-4 py-2 rounded-lg font-western animate-bounce">
              CLAIM
            </div>
          </div>
        </div>
      </Card>

      {/* Claim confirmation modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Claim Constellation Reward"
        size="md"
      >
        <div className="text-center space-y-4">
          {/* Sign constellation complete celebration */}
          <div className="relative py-6">
            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Sign icon */}
            <div
              className="text-7xl mb-4 animate-bounce relative z-10"
              style={{
                textShadow: `0 0 40px ${colors?.glow || 'rgba(255,215,0,0.8)'}`,
              }}
            >
              {sign.iconEmoji}
            </div>

            <h2 className={`font-western text-2xl ${colors?.textClass || 'text-gold-light'} relative z-10`}>
              {sign.name}
            </h2>
            <p className="text-desert-stone text-sm relative z-10">
              Constellation Complete!
            </p>
          </div>

          {/* Reward preview */}
          <Card variant="wood" className="p-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">{reward.iconEmoji}</span>
              <div className="text-left">
                <div className={`font-western text-lg ${colors?.textClass || 'text-gold-light'}`}>
                  {reward.name}
                </div>
                <div className="text-xs text-desert-stone">
                  {getRewardIcon(reward.type)} {getRewardLabel(reward.type)}
                </div>
              </div>
            </div>
            <p className="text-desert-sand text-sm">{reward.description}</p>

            {/* Reward value details */}
            {reward.value && (
              <div className="mt-3 pt-3 border-t border-wood-grain/20 text-sm text-desert-stone">
                {reward.value.title && (
                  <div>Title: <span className="text-gold-light">"{reward.value.title}"</span></div>
                )}
                {reward.value.bonusType && reward.value.bonusValue && (
                  <div>
                    Bonus: <span className="text-gold-light">+{reward.value.bonusValue}% {reward.value.bonusType.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Error display */}
          {claimError && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{claimError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowClaimModal(false)}
              disabled={isClaimLoading}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleClaim}
              isLoading={isClaimLoading}
              loadingText="Claiming..."
              fullWidth
            >
              Claim Reward
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Compact reward preview for lists
 */
interface RewardPreviewProps {
  reward: ConstellationRewardData;
  isComplete: boolean;
  signColors?: typeof SIGN_COLORS[ZodiacSignId];
  className?: string;
}

export const RewardPreview: React.FC<RewardPreviewProps> = ({
  reward,
  isComplete,
  signColors,
  className = '',
}) => {
  const canClaim = isComplete && !reward.claimed;

  return (
    <div
      className={`
        flex items-center gap-2 p-2 rounded
        ${!isComplete ? 'opacity-50' : ''}
        ${signColors?.bgClass || 'bg-amber-500/20'}
        ${canClaim ? 'ring-1 ring-gold-light animate-pulse' : ''}
        ${className}
      `}
    >
      <span className="text-lg">{isComplete ? reward.iconEmoji : '🔒'}</span>
      <span className={`text-sm truncate ${signColors?.textClass || 'text-gold-light'}`}>
        {reward.name}
      </span>
      {reward.claimed && (
        <span className="text-xs text-green-400">✓</span>
      )}
      {canClaim && (
        <span className="text-xs bg-gold-medium text-wood-dark px-1 rounded">
          Claim!
        </span>
      )}
    </div>
  );
};

export default ConstellationReward;
