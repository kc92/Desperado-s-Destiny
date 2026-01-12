/**
 * BetControls Component
 * Shared betting amount controls for all gambling games
 */

import React from 'react';
import { Button } from '@/components/ui';
import { formatDollars } from '@/utils/format';

interface BetControlsProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  minBet?: number;
  maxBet: number;
  disabled?: boolean;
  quickBets?: number[];
}

export const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  onBetChange,
  minBet = 10,
  maxBet,
  disabled = false,
  quickBets = [100, 500, 1000],
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(minBet, parseInt(e.target.value) || 0);
    onBetChange(Math.min(value, maxBet));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
      <div className="flex justify-center gap-2">
        <input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
          min={minBet}
          max={maxBet}
          disabled={disabled}
        />
      </div>
      <div className="flex justify-center gap-2">
        {quickBets.map((amt) => (
          <Button
            key={amt}
            variant="ghost"
            size="sm"
            onClick={() => onBetChange(Math.min(amt, maxBet))}
            disabled={disabled || amt > maxBet}
          >
            {formatDollars(amt)}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBetChange(maxBet)}
          disabled={disabled}
        >
          Max
        </Button>
      </div>
      <p className="text-xs text-wood-grain text-center">
        Min: {formatDollars(minBet)} | Max: {formatDollars(maxBet)}
      </p>
    </div>
  );
};

export default BetControls;
