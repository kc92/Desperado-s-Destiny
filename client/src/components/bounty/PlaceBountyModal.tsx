/**
 * PlaceBountyModal Component
 * Modal to place a bounty on another player
 */

import { useState } from 'react';
import { Card, Button } from '@/components/ui';

interface PlaceBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetName: string, amount: number, reason?: string) => Promise<void>;
  isLoading?: boolean;
  playerGold: number;
  minBounty?: number;
}

export function PlaceBountyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  playerGold,
  minBounty = 100,
}: PlaceBountyModalProps) {
  const [targetName, setTargetName] = useState('');
  const [amount, setAmount] = useState(minBounty);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!targetName.trim()) {
      setError('Please enter a target name');
      return;
    }

    if (amount < minBounty) {
      setError(`Minimum bounty is $${minBounty}`);
      return;
    }

    if (amount > playerGold) {
      setError("You don't have enough gold");
      return;
    }

    try {
      await onSubmit(targetName.trim(), amount, reason.trim() || undefined);
      // Reset form
      setTargetName('');
      setAmount(minBounty);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place bounty');
    }
  };

  const presetAmounts = [100, 250, 500, 1000, 2500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <span>🎯</span> Place a Bounty
        </h2>

        {/* Target Name */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Target Name</label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="Enter character name..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            Bounty Amount (Your gold: ${playerGold})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
            min={minBounty}
            max={playerGold}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
          {/* Preset amounts */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {presetAmounts.filter(a => a <= playerGold).map(preset => (
              <Button
                key={preset}
                variant="ghost"
                size="sm"
                onClick={() => setAmount(preset)}
                disabled={isLoading}
              >
                ${preset}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmount(playerGold)}
              disabled={isLoading}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Reason (Optional) */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you want this outlaw caught?"
            maxLength={200}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 focus:border-amber-500 focus:outline-none resize-none"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-600 text-right">{reason.length}/200</div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Bounty Posted:</span>
            <span className="text-green-400 font-bold">${amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Your remaining gold:</span>
            <span className={playerGold - amount < 0 ? 'text-red-400' : 'text-gray-300'}>
              ${Math.max(0, playerGold - amount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading || amount > playerGold || !targetName.trim()}
          >
            {isLoading ? 'Posting...' : 'Post Bounty'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PlaceBountyModal;
