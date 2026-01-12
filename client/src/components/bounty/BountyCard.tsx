/**
 * BountyCard Component
 * Displays a single bounty listing
 */

import { Card, Button } from '@/components/ui';
import { bountyService, type BountyListing } from '@/services/bounty.service';

interface BountyCardProps {
  bounty: BountyListing;
  onClaim?: () => void;
  isLoading?: boolean;
  currentCharacterId?: string;
}

export function BountyCard({
  bounty,
  onClaim,
  isLoading,
  currentCharacterId,
}: BountyCardProps) {
  const difficultyColors: Record<string, string> = {
    easy: 'text-green-400 bg-green-900/30',
    medium: 'text-amber-400 bg-amber-900/30',
    hard: 'text-red-400 bg-red-900/30',
    deadly: 'text-purple-400 bg-purple-900/30',
  };

  const isExpiring = bountyService.isExpiringSoon(bounty);
  const isSelf = bounty.targetId === currentCharacterId;

  return (
    <Card className={`p-4 ${isSelf ? 'border-red-500/50 bg-red-900/10' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-lg text-amber-400">{bounty.targetName}</h3>
            {bounty.isOnline && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online" />
            )}
          </div>
          <p className="text-sm text-gray-500">Level {bounty.targetLevel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">${bounty.amount}</div>
          <span className={`text-xs px-2 py-0.5 rounded capitalize ${difficultyColors[bounty.difficulty]}`}>
            {bounty.difficulty}
          </span>
        </div>
      </div>

      {/* Details */}
      {bounty.reason && (
        <p className="text-sm text-gray-400 italic mb-3">"{bounty.reason}"</p>
      )}

      {/* Location & Timing */}
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <span>
          {bounty.targetLocation ? `Last seen: ${bounty.targetLocation}` : 'Location unknown'}
        </span>
        <span className={isExpiring ? 'text-red-400' : ''}>
          {isExpiring ? 'Expiring soon!' : `Expires: ${new Date(bounty.expiresAt).toLocaleDateString()}`}
        </span>
      </div>

      {/* Actions */}
      {isSelf ? (
        <div className="p-2 bg-red-900/30 rounded text-center text-red-400 text-sm">
          This bounty is on YOU!
        </div>
      ) : onClaim && (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onClaim}
          disabled={isLoading}
        >
          {isLoading ? 'Claiming...' : 'Hunt Target'}
        </Button>
      )}
    </Card>
  );
}

export default BountyCard;
