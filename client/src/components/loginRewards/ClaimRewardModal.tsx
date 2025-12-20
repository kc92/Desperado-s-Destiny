/**
 * ClaimRewardModal Component
 * Phase B - Competitor Parity Plan
 *
 * Modal for revealing claimed rewards with animation
 */

import React, { useEffect, useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { RewardItem, RewardType } from '@/hooks/useLoginRewards';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: RewardItem | null;
  day?: number;
  week?: number;
}

/**
 * Get icon component for reward type
 */
const RewardIcon: React.FC<{ type: RewardType; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconClass = sizeClasses[size];

  switch (type) {
    case 'dollars':
      return (
        <div className={`${iconClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="dollarGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#166534" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#dollarGrad)" stroke="#14532D" strokeWidth="3" />
            <text x="50" y="65" textAnchor="middle" fontSize="40" fill="#052E16" fontWeight="bold">$</text>
          </svg>
          {/* Sparkle effects */}
          <div className="absolute top-0 right-0 animate-ping w-3 h-3 bg-green-200 rounded-full opacity-75" />
          <div className="absolute bottom-2 left-1 animate-ping delay-300 w-2 h-2 bg-green-200 rounded-full opacity-75" />
        </div>
      );
    case 'item':
      return (
        <div className={`${iconClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="15" y="25" width="70" height="55" rx="5" fill="#8B4513" stroke="#5C2D0E" strokeWidth="3" />
            <rect x="15" y="25" width="70" height="15" rx="5" fill="#A0522D" />
            <rect x="43" y="35" width="14" height="25" fill="#FFD700" rx="2" />
          </svg>
        </div>
      );
    case 'energy':
      return (
        <div className={`${iconClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
            <path
              d="M55 10L25 55h25L40 90l35-45H50L65 10z"
              fill="#60A5FA"
              stroke="#3B82F6"
              strokeWidth="3"
            />
          </svg>
          {/* Energy glow */}
          <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full animate-pulse" />
        </div>
      );
    case 'material':
      return (
        <div className={`${iconClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,10 90,35 90,75 50,90 10,75 10,35"
              fill="#9333EA"
              stroke="#7E22CE"
              strokeWidth="3"
            />
            <polygon
              points="50,25 75,40 75,65 50,75 25,65 25,40"
              fill="#A855F7"
              opacity="0.8"
            />
          </svg>
        </div>
      );
    case 'premium':
      return (
        <div className={`${iconClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <path
              d="M50 5l12 36h38l-30 22 12 36-32-24-32 24 12-36-30-22h38z"
              fill="url(#premiumGrad)"
              stroke="#D97706"
              strokeWidth="2"
            />
          </svg>
          {/* Star sparkles */}
          <div className="absolute top-1 left-1 animate-ping w-2 h-2 bg-yellow-200 rounded-full" />
          <div className="absolute bottom-1 right-1 animate-ping delay-500 w-2 h-2 bg-yellow-200 rounded-full" />
          <div className="absolute top-1/2 right-0 animate-ping delay-200 w-1.5 h-1.5 bg-yellow-200 rounded-full" />
        </div>
      );
    default:
      return (
        <div className={`${iconClass} bg-desert-sand rounded-lg flex items-center justify-center`}>
          <span className="text-4xl">?</span>
        </div>
      );
  }
};

/**
 * Get rarity color classes
 */
const getRarityColors = (rarity?: string): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-300 border-gray-400';
    case 'uncommon':
      return 'text-green-400 border-green-500';
    case 'rare':
      return 'text-blue-400 border-blue-500';
    case 'epic':
      return 'text-purple-400 border-purple-500';
    case 'legendary':
      return 'text-yellow-400 border-yellow-500';
    default:
      return 'text-desert-sand border-wood-grain';
  }
};

export const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
  isOpen,
  onClose,
  reward,
  day,
  week
}) => {
  const [showReward, setShowReward] = useState(false);

  // Animation: show reward after modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowReward(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowReward(false);
    }
  }, [isOpen]);

  if (!reward) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Reward Claimed!"
      size="sm"
    >
      <div className="flex flex-col items-center py-6">
        {/* Day indicator */}
        {day && week && (
          <div className="text-sm text-desert-stone mb-4">
            Day {day} - Week {week}
          </div>
        )}

        {/* Reward reveal animation */}
        <div className={`
          transition-all duration-500 transform
          ${showReward ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}>
          {/* Glow background */}
          <div className="relative">
            <div className={`
              absolute inset-0 rounded-full blur-2xl opacity-50
              ${reward.type === 'dollars' ? 'bg-green-400' : ''}
              ${reward.type === 'energy' ? 'bg-blue-400' : ''}
              ${reward.type === 'premium' ? 'bg-yellow-300' : ''}
              ${reward.type === 'material' ? 'bg-purple-400' : ''}
              ${reward.type === 'item' ? 'bg-amber-400' : ''}
            `} />
            <RewardIcon type={reward.type} size="lg" />
          </div>
        </div>

        {/* Reward details */}
        <div className={`
          mt-6 text-center transition-all duration-500 delay-300
          ${showReward ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          {/* Amount or name */}
          <div className={`text-2xl font-western mb-2 ${getRarityColors(reward.rarity)}`}>
            {reward.type === 'dollars' && `+$${reward.amount}`}
            {reward.type === 'energy' && `+${reward.amount} Energy`}
            {reward.itemName && reward.itemName}
          </div>

          {/* Description */}
          <p className="text-desert-sand font-serif">
            {reward.description}
          </p>

          {/* Rarity badge */}
          {reward.rarity && (
            <div className={`
              mt-3 inline-block px-3 py-1 rounded-full text-sm font-bold uppercase
              border ${getRarityColors(reward.rarity)}
            `}>
              {reward.rarity}
            </div>
          )}
        </div>

        {/* Action button */}
        <Button
          variant="primary"
          className="mt-8"
          onClick={onClose}
        >
          Awesome!
        </Button>

        {/* Tip */}
        <p className="mt-4 text-xs text-desert-stone text-center">
          Come back tomorrow for your next reward!
        </p>
      </div>
    </Modal>
  );
};

export default ClaimRewardModal;
