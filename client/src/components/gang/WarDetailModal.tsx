/**
 * WarDetailModal Component
 * Full war view with contribution interface, top contributors, and war log
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Card } from '@/components/ui';
import type { GangWar } from '@/hooks/useGangWars';

interface WarDetailModalProps {
  war: GangWar;
  currentGangId?: string;
  characterGold: number;
  onClose: () => void;
  onContribute: (warId: string, amount: number) => Promise<boolean>;
}

// Format time remaining
const formatTimeRemaining = (resolveAt: string): string => {
  const remaining = new Date(resolveAt).getTime() - Date.now();
  if (remaining <= 0) return 'Resolving...';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

// Format timestamp
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const WarDetailModal: React.FC<WarDetailModalProps> = ({
  war,
  currentGangId,
  characterGold,
  onClose,
  onContribute,
}) => {
  const [contributionAmount, setContributionAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeDisplay, setTimeDisplay] = useState(formatTimeRemaining(war.resolveAt));

  const isAttacker = war.attackerGangId === currentGangId;
  const isDefender = war.defenderGangId === currentGangId;
  const canContribute = (isAttacker || isDefender) && contributionAmount > 0 && contributionAmount <= characterGold;

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeDisplay(formatTimeRemaining(war.resolveAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [war.resolveAt]);

  const handleContribute = async () => {
    if (!canContribute) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onContribute(war._id, contributionAmount);
      if (success) {
        setContributionAmount(100);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to contribute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const territoryName = war.territoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Battle for ${territoryName}`}
    >
      <div className="space-y-6">
        {/* Countdown Timer */}
        <div className="text-center">
          <p className="text-sm text-desert-stone mb-1">Time Remaining</p>
          <p className="text-3xl font-western text-gold-light">{timeDisplay}</p>
        </div>

        {/* Capture Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-400 font-western">{war.attackerGangName}</span>
            <span className="text-blue-400 font-western">{war.defenderGangName || 'Defenders'}</span>
          </div>
          <div className="relative h-10 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${war.capturePoints}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white drop-shadow-lg">
                {war.capturePoints}% / 60% needed
              </span>
            </div>
            {/* 60% threshold */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gold-light"
              style={{ left: '60%' }}
            />
          </div>
        </div>

        {/* Contribution Form */}
        {(isAttacker || isDefender) && (
          <Card variant="wood" className="p-4">
            <h4 className="font-western text-gold-light mb-3">Contribute to War Effort</h4>
            <div className="flex gap-3">
              <input
                type="number"
                min={1}
                max={characterGold}
                value={contributionAmount}
                onChange={(e) => setContributionAmount(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-wood-dark border border-wood-grain rounded px-3 py-2 text-desert-sand"
              />
              <Button
                onClick={handleContribute}
                disabled={!canContribute || isSubmitting}
              >
                {isSubmitting ? '...' : `Contribute`}
              </Button>
            </div>
            <p className="text-xs text-desert-stone mt-2">
              Your gold: {characterGold.toLocaleString()}g
            </p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </Card>
        )}

        {/* Top Contributors */}
        <div>
          <h4 className="font-western text-gold-light mb-3">Top Contributors</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Attackers */}
            <div>
              <p className="text-xs text-red-400 mb-2 font-western">Attackers</p>
              {war.attackerContributions.length === 0 ? (
                <p className="text-xs text-desert-stone">No contributions yet</p>
              ) : (
                war.attackerContributions.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-desert-sand truncate">{c.characterName}</span>
                    <span className="text-gold-light">{c.amount.toLocaleString()}g</span>
                  </div>
                ))
              )}
            </div>
            {/* Defenders */}
            <div>
              <p className="text-xs text-blue-400 mb-2 font-western">Defenders</p>
              {war.defenderContributions.length === 0 ? (
                <p className="text-xs text-desert-stone">No contributions yet</p>
              ) : (
                war.defenderContributions.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-desert-sand truncate">{c.characterName}</span>
                    <span className="text-gold-light">{c.amount.toLocaleString()}g</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* War Log */}
        <div>
          <h4 className="font-western text-gold-light mb-3">Battle Log</h4>
          <div className="max-h-32 overflow-y-auto bg-wood-dark/50 rounded p-2 space-y-1">
            {war.warLog.length === 0 ? (
              <p className="text-xs text-desert-stone text-center py-2">No activity yet</p>
            ) : (
              war.warLog.slice().reverse().map((entry, i) => (
                <p key={i} className="text-xs text-desert-stone">
                  <span className="text-desert-sand">{formatTime(entry.timestamp)}</span>
                  {' '}{entry.message}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <Button variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default WarDetailModal;
