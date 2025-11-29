/**
 * ContractCard Component
 *
 * Displays an individual daily contract with progress, rewards, and actions
 * Part of the Competitor Parity Plan - Phase B
 */

import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Contract, ContractType, ContractDifficulty, ContractStatus } from '@/hooks/useDailyContracts';
import { ContractRewards } from './ContractRewards';

interface ContractCardProps {
  contract: Contract;
  onAccept: (contractId: string) => void;
  onComplete: (contractId: string) => void;
  isLoading?: boolean;
}

/**
 * Contract type colors and icons
 */
const CONTRACT_TYPE_CONFIG: Record<ContractType, { color: string; icon: string; label: string }> = {
  combat: { color: 'text-red-400 border-red-400/50 bg-red-900/20', icon: '', label: 'Combat' },
  crime: { color: 'text-purple-400 border-purple-400/50 bg-purple-900/20', icon: '', label: 'Crime' },
  social: { color: 'text-blue-400 border-blue-400/50 bg-blue-900/20', icon: '', label: 'Social' },
  delivery: { color: 'text-green-400 border-green-400/50 bg-green-900/20', icon: '', label: 'Delivery' },
  investigation: { color: 'text-yellow-400 border-yellow-400/50 bg-yellow-900/20', icon: '', label: 'Investigation' },
  crafting: { color: 'text-orange-400 border-orange-400/50 bg-orange-900/20', icon: '', label: 'Crafting' }
};

/**
 * Difficulty badge colors
 */
const DIFFICULTY_CONFIG: Record<ContractDifficulty, { color: string; label: string }> = {
  easy: { color: 'bg-green-900/50 text-green-300 border-green-500/30', label: 'Easy' },
  medium: { color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30', label: 'Medium' },
  hard: { color: 'bg-red-900/50 text-red-300 border-red-500/30', label: 'Hard' }
};

/**
 * Status badge colors
 */
const STATUS_CONFIG: Record<ContractStatus, { color: string; label: string }> = {
  available: { color: 'bg-blue-900/50 text-blue-300', label: 'Available' },
  in_progress: { color: 'bg-yellow-900/50 text-yellow-300', label: 'In Progress' },
  completed: { color: 'bg-green-900/50 text-green-300', label: 'Completed' },
  expired: { color: 'bg-gray-900/50 text-gray-400', label: 'Expired' }
};

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onAccept,
  onComplete,
  isLoading = false
}) => {
  const typeConfig = CONTRACT_TYPE_CONFIG[contract.type];
  const difficultyConfig = DIFFICULTY_CONFIG[contract.difficulty];
  const statusConfig = STATUS_CONFIG[contract.status];

  const progressPercent = Math.min((contract.progress / contract.progressMax) * 100, 100);
  const isReadyToComplete = contract.status === 'in_progress' && contract.progress >= contract.progressMax;
  const isCompleted = contract.status === 'completed';
  const isExpired = contract.status === 'expired';
  const canAccept = contract.status === 'available';

  // Format expiry time
  const expiresAt = new Date(contract.expiresAt);
  const now = new Date();
  const timeLeft = expiresAt.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card
      variant={isCompleted ? 'wood' : 'leather'}
      className={`p-4 transition-all duration-200 ${
        isCompleted ? 'opacity-60' : ''
      } ${isExpired ? 'opacity-40 grayscale' : ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Type Badge */}
            <span className={`text-xs px-2 py-0.5 rounded border ${typeConfig.color}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
            {/* Difficulty Badge */}
            <span className={`text-xs px-2 py-0.5 rounded border ${difficultyConfig.color}`}>
              {difficultyConfig.label}
            </span>
          </div>
          <h3 className="font-western text-lg text-gold-light">{contract.title}</h3>
        </div>
        {/* Status Badge */}
        <span className={`text-xs px-2 py-1 rounded ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-desert-stone mb-3 font-serif">{contract.description}</p>

      {/* Target Info */}
      {contract.target.location && (
        <p className="text-xs text-desert-sand/70 mb-3">
          Location: <span className="text-desert-sand">{contract.target.location}</span>
        </p>
      )}

      {/* Progress Bar (if in progress) */}
      {contract.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-desert-sand">Progress</span>
            <span className={isReadyToComplete ? 'text-green-400' : 'text-desert-stone'}>
              {contract.progress}/{contract.progressMax}
            </span>
          </div>
          <div className="h-3 bg-wood-dark rounded-full overflow-hidden border border-wood-grain/30">
            <div
              className={`h-full transition-all duration-300 ${
                isReadyToComplete ? 'bg-green-500' : 'bg-gold-light'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {isReadyToComplete && (
            <p className="text-xs text-green-400 mt-1 text-center font-serif">
              Ready to complete!
            </p>
          )}
        </div>
      )}

      {/* Rewards */}
      <ContractRewards rewards={contract.rewards} compact />

      {/* Time Left */}
      {!isCompleted && !isExpired && (
        <div className="text-xs text-desert-stone mt-3 text-center">
          Expires in: <span className="text-desert-sand">{hoursLeft}h {minutesLeft}m</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-wood-grain/30">
        {canAccept && (
          <Button
            onClick={() => onAccept(contract.id)}
            disabled={isLoading}
            fullWidth
          >
            Accept Contract
          </Button>
        )}
        {isReadyToComplete && (
          <Button
            onClick={() => onComplete(contract.id)}
            disabled={isLoading}
            variant="success"
            fullWidth
          >
            Complete & Claim Rewards
          </Button>
        )}
        {contract.status === 'in_progress' && !isReadyToComplete && (
          <div className="text-center text-sm text-desert-stone font-serif">
            Complete the objective to claim rewards
          </div>
        )}
        {isCompleted && (
          <div className="text-center text-green-400 font-serif">
            Contract Completed
          </div>
        )}
        {isExpired && (
          <div className="text-center text-gray-400 font-serif">
            Contract Expired
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContractCard;
