/**
 * TerritoryWarStatus Component
 * Shows active territory war progress
 */

import { Card, Button } from '@/components/ui';
import type { Territory } from '@desperados/shared';

interface TerritoryWarStatusProps {
  territory: Territory;
  isGangMember: boolean;
  userGangId?: string;
  onJoinWar?: () => void;
  onContribute?: () => void;
  isLoading?: boolean;
}

export function TerritoryWarStatus({
  territory,
  isGangMember,
  userGangId,
  onJoinWar,
  onContribute,
  isLoading,
}: TerritoryWarStatusProps) {
  if (!territory.isUnderSiege) {
    return null;
  }

  // Mock war data - would come from backend
  const warProgress = {
    attackerScore: 65,
    defenderScore: 35,
    attackerName: 'Black Rose Gang',
    defenderName: territory.controllingGangName || territory.faction,
    timeRemaining: '12h 34m',
    participantCount: 24,
    isUserParticipating: userGangId === territory.controllingGangId,
  };

  const isUserDefender = warProgress.isUserParticipating;

  return (
    <Card className="p-4 border-red-500 bg-gradient-to-r from-red-900/20 to-orange-900/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">⚔️</span>
          <div>
            <h3 className="font-bold text-red-400">TERRITORY WAR</h3>
            <p className="text-xs text-gray-500">{territory.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-amber-400 font-bold">{warProgress.timeRemaining}</div>
          <div className="text-xs text-gray-500">remaining</div>
        </div>
      </div>

      {/* War Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-400">{warProgress.attackerName}</span>
          <span className="text-blue-400">{warProgress.defenderName}</span>
        </div>
        <div className="relative h-6 bg-gray-700 rounded overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500"
            style={{ width: `${warProgress.attackerScore}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-600 to-blue-500"
            style={{ width: `${warProgress.defenderScore}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
            {warProgress.attackerScore}% - {warProgress.defenderScore}%
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center text-sm">
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">{warProgress.participantCount}</div>
          <div className="text-xs text-gray-600">Participants</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-amber-400">$12,500</div>
          <div className="text-xs text-gray-600">Stakes</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-purple-400">+500 XP</div>
          <div className="text-xs text-gray-600">Victory Bonus</div>
        </div>
      </div>

      {/* User Status */}
      {isGangMember && (
        <div className="border-t border-gray-700 pt-3">
          {warProgress.isUserParticipating ? (
            <div className="flex items-center justify-between">
              <span className={`font-bold ${isUserDefender ? 'text-blue-400' : 'text-red-400'}`}>
                {isUserDefender ? '🛡️ Defending' : '⚔️ Attacking'}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={onContribute}
                disabled={isLoading}
              >
                Contribute Now
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={onJoinWar}
              disabled={isLoading}
            >
              Join This War
            </Button>
          )}
        </div>
      )}

      {!isGangMember && (
        <div className="text-center text-gray-500 text-sm">
          Join a gang to participate in territory wars
        </div>
      )}
    </Card>
  );
}

export default TerritoryWarStatus;
