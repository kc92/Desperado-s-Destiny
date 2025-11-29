/**
 * MonthlyBonus Component
 * Phase B - Competitor Parity Plan
 *
 * Display and claim the monthly bonus reward
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { MonthlyBonus as MonthlyBonusType } from '@/hooks/useLoginRewards';

interface MonthlyBonusProps {
  bonus: {
    available: boolean;
    claimed: boolean;
    reward: MonthlyBonusType;
  };
  totalDaysClaimed: number;
  onClaim: () => Promise<void>;
  isLoading?: boolean;
}

export const MonthlyBonus: React.FC<MonthlyBonusProps> = ({
  bonus,
  totalDaysClaimed,
  onClaim,
  isLoading = false
}) => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const handleClaim = async () => {
    await onClaim();
    setHasClaimed(true);
    setTimeout(() => setShowClaimModal(false), 2000);
  };

  const progress = Math.min((totalDaysClaimed / 28) * 100, 100);
  const daysRemaining = Math.max(28 - totalDaysClaimed, 0);

  return (
    <>
      <Card
        variant="wood"
        className={`relative overflow-hidden ${bonus.available ? 'ring-2 ring-gold-light animate-pulse' : ''}`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-dark/20 to-transparent pointer-events-none" />

        {/* Sparkle effects when available */}
        {bonus.available && (
          <>
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping delay-300" />
            <div className="absolute bottom-6 left-12 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-500" />
          </>
        )}

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-western text-gold-light flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Monthly Champion Bonus
            </h3>
            {bonus.claimed && (
              <span className="px-3 py-1 bg-green-900/50 text-green-400 text-sm rounded-full">
                Claimed
              </span>
            )}
          </div>

          {/* Progress to unlock */}
          {!bonus.available && !bonus.claimed && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-desert-sand">Progress to unlock</span>
                <span className="text-gold-light">{totalDaysClaimed}/28 days</span>
              </div>
              <div className="h-3 bg-wood-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-desert-stone mt-2">
                {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} to unlock the monthly bonus!
              </p>
            </div>
          )}

          {/* Reward preview */}
          <div className="bg-wood-dark/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-desert-sand mb-3">Bonus Rewards:</h4>
            <div className="space-y-2">
              {/* Gold */}
              <div className="flex items-center gap-3 text-gold-light">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#000">$</text>
                </svg>
                <span className="font-bold">{bonus.reward.gold} Gold</span>
              </div>

              {/* Premium Tokens */}
              <div className="flex items-center gap-3 text-purple-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15,9 22,9 17,14 19,22 12,17 5,22 7,14 2,9 9,9" />
                </svg>
                <span className="font-bold">{bonus.reward.premiumTokens} Premium Tokens</span>
              </div>

              {/* Special Item */}
              <div className="flex items-center gap-3 text-yellow-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
                <div>
                  <span className="font-bold">{bonus.reward.specialItem.itemName}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-900/50 rounded-full">
                    {bonus.reward.specialItem.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Claim button */}
          {bonus.available && !bonus.claimed && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setShowClaimModal(true)}
              disabled={isLoading}
            >
              Claim Monthly Bonus!
            </Button>
          )}

          {/* Already claimed message */}
          {bonus.claimed && (
            <div className="text-center text-green-400 font-serif">
              You've claimed this month's bonus. Start a new cycle!
            </div>
          )}

          {/* Not yet available message */}
          {!bonus.available && !bonus.claimed && (
            <div className="text-center text-desert-stone font-serif">
              Complete all 28 days to unlock this bonus
            </div>
          )}
        </div>
      </Card>

      {/* Claim confirmation modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Claim Monthly Bonus"
        size="sm"
      >
        <div className="text-center py-4">
          {!hasClaimed ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-western text-gold-light mb-2">
                Congratulations, Champion!
              </h3>
              <p className="text-desert-sand mb-6">
                You've logged in for 28 days! Claim your well-deserved rewards.
              </p>

              <div className="bg-wood-dark/50 rounded-lg p-4 mb-6 text-left">
                <div className="text-gold-light mb-1">+{bonus.reward.gold} Gold</div>
                <div className="text-purple-400 mb-1">+{bonus.reward.premiumTokens} Premium Tokens</div>
                <div className="text-yellow-400">+{bonus.reward.specialItem.itemName}</div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowClaimModal(false)}
                >
                  Later
                </Button>
                <Button
                  variant="primary"
                  onClick={handleClaim}
                  disabled={isLoading}
                >
                  {isLoading ? 'Claiming...' : 'Claim Now!'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-xl font-western text-green-400 mb-2">
                Rewards Claimed!
              </h3>
              <p className="text-desert-sand">
                Your rewards have been added to your account.
              </p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MonthlyBonus;
