/**
 * BountyHunterAlert Component
 * Alert when a bounty hunter is tracking the player
 */

import { Card, Button } from '@/components/ui';
import { type BountyHunterCheck } from '@/services/bounty.service';

interface BountyHunterAlertProps {
  hunterCheck: BountyHunterCheck | null;
  onPayOff?: () => void;
  onFight?: () => void;
  onEscape?: () => void;
  isLoading?: boolean;
}

export function BountyHunterAlert({
  hunterCheck,
  onPayOff,
  onFight,
  onEscape,
  isLoading,
}: BountyHunterAlertProps) {
  if (!hunterCheck?.shouldSpawn) {
    return null;
  }

  return (
    <Card className="p-4 border-red-500 bg-gradient-to-r from-red-900/40 to-transparent animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🤠</span>
          <div>
            <h3 className="font-bold text-red-400 text-lg">BOUNTY HUNTER!</h3>
            <p className="text-amber-400">
              {hunterCheck.hunterName || 'A hunter'} is tracking you!
            </p>
          </div>
        </div>
        {hunterCheck.hunterLevel && (
          <div className="text-right">
            <div className="text-gray-400 text-sm">Hunter Level</div>
            <div className="text-xl font-bold text-amber-400">{hunterCheck.hunterLevel}</div>
          </div>
        )}
      </div>

      {/* Bounty Info */}
      <div className="bg-gray-800/50 rounded p-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Bounty on your head:</span>
          <span className="text-green-400 font-bold">${hunterCheck.bountyAmount || 0}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-400">Your wanted level:</span>
          <span className="text-red-400 font-bold">{hunterCheck.wantedLevel} stars</span>
        </div>
      </div>

      {/* Message */}
      {hunterCheck.message && (
        <p className="text-gray-300 italic mb-4">"{hunterCheck.message}"</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {onPayOff && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onPayOff}
            disabled={isLoading}
          >
            Pay Off (${Math.floor((hunterCheck.bountyAmount || 0) * 1.5)})
          </Button>
        )}
        {onFight && (
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={onFight}
            disabled={isLoading}
          >
            Fight!
          </Button>
        )}
        {onEscape && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEscape}
            disabled={isLoading}
          >
            Try to Escape
          </Button>
        )}
      </div>

      {/* Warning */}
      <p className="text-xs text-red-400/70 mt-3 text-center">
        Escaping or fighting may result in additional bounty!
      </p>
    </Card>
  );
}

export default BountyHunterAlert;
