/**
 * WarCard Component
 * Displays a gang war summary with progress bar, funding, and time remaining
 */

import React from 'react';
import type { GangWar } from '@/hooks/useGangWars';

interface WarCardProps {
  war: GangWar;
  currentGangId?: string;
  onClick?: () => void;
}

export const WarCard: React.FC<WarCardProps> = ({ war, currentGangId, onClick }) => {
  const isAttacker = war.attackerGangId === currentGangId;
  const timeRemaining = new Date(war.resolveAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

  // Determine if winning
  const isWinning = isAttacker ? war.capturePoints >= 60 : war.capturePoints < 60;

  return (
    <div
      onClick={onClick}
      className="bg-wood-dark/50 rounded-lg p-4 border border-wood-grain hover:border-gold-light transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-western text-lg text-gold-light">
            Battle for {war.territoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          <p className="text-sm text-desert-stone">
            {isAttacker ? 'Attacking' : 'Defending'} • {hoursLeft}h {minutesLeft}m remaining
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            isWinning ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'
          }`}
        >
          {war.capturePoints}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 bg-wood-dark rounded-full overflow-hidden mb-4">
        {/* Attacker progress (red from left) */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
          style={{ width: `${war.capturePoints}%` }}
        />
        {/* Defender progress (blue from right) */}
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-600 to-blue-500 transition-all duration-500"
          style={{ width: `${100 - war.capturePoints}%` }}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {war.attackerGangName} vs {war.defenderGangName || 'Unclaimed'}
          </span>
        </div>
        {/* 60% threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gold-light"
          style={{ left: '60%' }}
        />
      </div>

      {/* Funding Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-red-400">Attacker Funding</p>
          <p className="font-western text-gold-light">${war.attackerFunding.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Defender Funding</p>
          <p className="font-western text-gold-light">${war.defenderFunding.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick info */}
      <div className="mt-3 pt-3 border-t border-wood-grain/30 text-center">
        <p className="text-xs text-desert-stone">
          {war.attackerContributions.length + war.defenderContributions.length} contributions
          {' • '}
          {war.capturePoints >= 60 ? 'Attackers winning' : 'Defenders holding'}
        </p>
      </div>
    </div>
  );
};

export default WarCard;
