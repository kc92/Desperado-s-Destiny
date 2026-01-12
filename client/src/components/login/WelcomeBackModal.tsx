/**
 * WelcomeBackModal Component
 * Displays offline progress summary when a player logs back in
 */

import React, { useEffect, useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { formatDollars } from '@/utils/format';

export interface OfflineProgress {
  // Training completions
  completedTraining: {
    skillId: string;
    skillName: string;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  }[];

  // Completed expeditions
  completedExpeditions: {
    type: string;
    typeName: string;
    outcome: 'success' | 'partial_success' | 'failure';
    goldEarned: number;
    xpEarned: number;
    itemsFound: { itemId: string; itemName: string; quantity: number }[];
    events: string[];
  }[];

  // Property income
  propertyIncome: {
    propertyId: string;
    propertyName: string;
    goldEarned: number;
  }[];

  // Gang activity results
  gangResults: {
    type: 'war' | 'heist' | 'raid' | 'oc';
    name: string;
    outcome: 'victory' | 'defeat' | 'draw';
    rewardsEarned?: number;
    message?: string;
  }[];

  // Energy restored
  energyRestored: number;
  currentEnergy: number;
  maxEnergy: number;

  // Time offline
  timeOfflineMs: number;
  lastLogin: string;
}

interface WelcomeBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: OfflineProgress | null;
  characterName: string;
}

/**
 * Format time duration in human-readable format
 */
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Progress section component
 */
const ProgressSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}> = ({ title, icon, children, isEmpty = false }) => {
  if (isEmpty) return null;

  return (
    <div className="mb-4">
      <h3 className="flex items-center gap-2 font-western text-gold-light mb-2">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      <div className="pl-7">{children}</div>
    </div>
  );
};

/**
 * WelcomeBackModal Component
 */
export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  isOpen,
  onClose,
  progress,
  characterName,
}) => {
  const [totalGold, setTotalGold] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  // Calculate totals
  useEffect(() => {
    if (!progress) return;

    let gold = 0;
    let xp = 0;

    // From training
    progress.completedTraining.forEach((t) => {
      xp += t.xpGained;
    });

    // From expeditions
    progress.completedExpeditions.forEach((e) => {
      gold += e.goldEarned;
      xp += e.xpEarned;
    });

    // From properties
    progress.propertyIncome.forEach((p) => {
      gold += p.goldEarned;
    });

    // From gang activities
    progress.gangResults.forEach((g) => {
      if (g.rewardsEarned) {
        gold += g.rewardsEarned;
      }
    });

    setTotalGold(gold);
    setTotalXp(xp);
  }, [progress]);

  if (!progress) return null;

  const hasAnyProgress =
    progress.completedTraining.length > 0 ||
    progress.completedExpeditions.length > 0 ||
    progress.propertyIncome.length > 0 ||
    progress.gangResults.length > 0 ||
    progress.energyRestored > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome Back!">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center pb-4 border-b border-wood-grain/30">
          <p className="text-desert-sand font-serif">
            Welcome back, <span className="text-gold-light font-bold">{characterName}</span>!
          </p>
          <p className="text-sm text-desert-stone mt-1">
            You were away for {formatDuration(progress.timeOfflineMs)}
          </p>
        </div>

        {/* No progress case */}
        {!hasAnyProgress && (
          <div className="text-center py-8">
            <p className="text-desert-stone">
              Nothing happened while you were away. Time to make your mark!
            </p>
          </div>
        )}

        {/* Progress sections */}
        {hasAnyProgress && (
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {/* Training Completions */}
            <ProgressSection
              title="Skill Training"
              icon="📚"
              isEmpty={progress.completedTraining.length === 0}
            >
              {progress.completedTraining.map((training, idx) => (
                <div
                  key={`${training.skillId}-${idx}`}
                  className="flex justify-between items-center py-1 text-sm"
                >
                  <span className="text-desert-sand">{training.skillName}</span>
                  <span className="text-gold-light">
                    +{training.xpGained} XP
                    {training.leveledUp && (
                      <span className="text-green-400 ml-2">
                        Level {training.newLevel}!
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </ProgressSection>

            {/* Expedition Completions */}
            <ProgressSection
              title="Expeditions"
              icon="🏕️"
              isEmpty={progress.completedExpeditions.length === 0}
            >
              {progress.completedExpeditions.map((expedition, idx) => (
                <div
                  key={`expedition-${idx}`}
                  className="py-2 border-b border-wood-grain/20 last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-desert-sand">{expedition.typeName}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        expedition.outcome === 'success'
                          ? 'bg-green-600/20 text-green-400'
                          : expedition.outcome === 'partial_success'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {expedition.outcome.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm mt-1">
                    <span className="text-gold-light">
                      +{formatDollars(expedition.goldEarned)}
                    </span>
                    <span className="text-blue-400">+{expedition.xpEarned} XP</span>
                  </div>
                  {expedition.itemsFound.length > 0 && (
                    <div className="text-xs text-desert-stone mt-1">
                      Items: {expedition.itemsFound.map((i) => i.itemName).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </ProgressSection>

            {/* Property Income */}
            <ProgressSection
              title="Property Income"
              icon="🏠"
              isEmpty={progress.propertyIncome.length === 0}
            >
              {progress.propertyIncome.map((property, idx) => (
                <div
                  key={`${property.propertyId}-${idx}`}
                  className="flex justify-between items-center py-1 text-sm"
                >
                  <span className="text-desert-sand">{property.propertyName}</span>
                  <span className="text-gold-light">+{formatDollars(property.goldEarned)}</span>
                </div>
              ))}
            </ProgressSection>

            {/* Gang Activity Results */}
            <ProgressSection
              title="Gang Activity"
              icon="🏴"
              isEmpty={progress.gangResults.length === 0}
            >
              {progress.gangResults.map((gang, idx) => (
                <div
                  key={`gang-${idx}`}
                  className="flex justify-between items-center py-1 text-sm"
                >
                  <span className="text-desert-sand">
                    {gang.type.toUpperCase()}: {gang.name}
                  </span>
                  <span
                    className={
                      gang.outcome === 'victory'
                        ? 'text-green-400'
                        : gang.outcome === 'defeat'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }
                  >
                    {gang.outcome}
                    {gang.rewardsEarned && ` +${formatDollars(gang.rewardsEarned)}`}
                  </span>
                </div>
              ))}
            </ProgressSection>

            {/* Energy Restored */}
            <ProgressSection
              title="Energy Restored"
              icon="⚡"
              isEmpty={progress.energyRestored === 0}
            >
              <div className="text-sm">
                <span className="text-green-400">+{progress.energyRestored}</span>
                <span className="text-desert-stone ml-2">
                  ({progress.currentEnergy}/{progress.maxEnergy})
                </span>
              </div>
            </ProgressSection>
          </div>
        )}

        {/* Summary Footer */}
        {hasAnyProgress && (totalGold > 0 || totalXp > 0) && (
          <div className="pt-4 border-t border-wood-grain/30">
            <div className="flex justify-center gap-8 text-center">
              {totalGold > 0 && (
                <div>
                  <p className="text-2xl font-western text-gold-light">
                    +{formatDollars(totalGold)}
                  </p>
                  <p className="text-xs text-desert-stone">Gold Earned</p>
                </div>
              )}
              {totalXp > 0 && (
                <div>
                  <p className="text-2xl font-western text-blue-400">+{totalXp}</p>
                  <p className="text-xs text-desert-stone">Total XP</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center pt-4">
          <Button variant="primary" onClick={onClose}>
            Continue to Game
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
