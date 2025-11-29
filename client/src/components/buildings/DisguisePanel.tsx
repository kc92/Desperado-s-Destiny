/**
 * DisguisePanel Component
 * Panel for managing character disguises
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DisguiseType {
  id: string;
  name: string;
  description: string;
  faction: string | null;
  wantedReduction: number;
  durationMinutes: number;
  cost: number;
}

interface CurrentDisguise {
  id: string;
  name: string;
  expiresAt: Date;
  remainingMinutes: number;
  faction: string | null;
}

interface DisguisePanelProps {
  availableDisguises: DisguiseType[];
  currentDisguise: CurrentDisguise | null;
  characterGold: number;
  characterWantedLevel: number;
  onApplyDisguise: (disguiseId: string) => Promise<{ success: boolean; message: string }>;
  onRemoveDisguise: () => Promise<{ success: boolean; message: string }>;
}

// Faction colors
const FACTION_COLORS: Record<string, string> = {
  settler: 'bg-faction-settler/20 border-faction-settler text-faction-settler',
  nahi: 'bg-faction-nahi/20 border-faction-nahi text-faction-nahi',
  frontera: 'bg-faction-frontera/20 border-faction-frontera text-faction-frontera',
};

export const DisguisePanel: React.FC<DisguisePanelProps> = ({
  availableDisguises,
  currentDisguise,
  characterGold,
  characterWantedLevel,
  onApplyDisguise,
  onRemoveDisguise,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleApply = async (disguiseId: string) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await onApplyDisguise(disguiseId);
      setMessage({ text: result.message, success: result.success });
    } catch (error) {
      setMessage({ text: 'Failed to apply disguise', success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await onRemoveDisguise();
      setMessage({ text: result.message, success: result.success });
    } catch (error) {
      setMessage({ text: 'Failed to remove disguise', success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card variant="wood" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-western text-desert-sand">
          🎭 Disguises
        </h3>
        {characterWantedLevel > 0 && (
          <span className="text-sm text-blood-red">
            Wanted: ⭐ {characterWantedLevel}
          </span>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-2 rounded text-sm text-center ${
          message.success ? 'bg-green-500/20 text-green-400' : 'bg-blood-red/20 text-blood-red'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current disguise */}
      {currentDisguise && (
        <Card variant="leather" padding="sm" className="border-2 border-gold-medium">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-desert-clay uppercase">Current Disguise</span>
            <span className="text-xs text-gold-medium">
              ⏱️ {currentDisguise.remainingMinutes}m remaining
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-desert-sand">{currentDisguise.name}</p>
              {currentDisguise.faction && (
                <p className="text-xs text-desert-clay">
                  Disguised as: {currentDisguise.faction}
                </p>
              )}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemove}
              disabled={isProcessing}
            >
              Remove
            </Button>
          </div>

          {/* Countdown bar */}
          <div className="mt-2 w-full h-1 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-medium transition-all duration-1000"
              style={{
                width: `${Math.min(100, (currentDisguise.remainingMinutes / 30) * 100)}%`
              }}
            />
          </div>
        </Card>
      )}

      {/* Available disguises */}
      <div>
        <h4 className="text-sm text-desert-clay uppercase mb-2">
          {currentDisguise ? 'Other Disguises' : 'Available Disguises'}
        </h4>
        <div className="space-y-3">
          {availableDisguises.map((disguise) => {
            const canAfford = characterGold >= disguise.cost;
            const isCurrentlyWearing = currentDisguise?.id === disguise.id;

            return (
              <div
                key={disguise.id}
                className={`
                  p-3 rounded-lg border-2 transition-colors
                  ${isCurrentlyWearing
                    ? 'border-gold-medium bg-gold-medium/10'
                    : canAfford
                      ? 'border-wood-light hover:border-gold-medium/50'
                      : 'border-wood-dark opacity-60'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-desert-sand">
                        {disguise.name}
                      </h4>
                      {disguise.faction && (
                        <span className={`
                          px-2 py-0.5 text-xs rounded border
                          ${FACTION_COLORS[disguise.faction] || 'bg-wood-light/20 border-wood-light text-desert-clay'}
                        `}>
                          {disguise.faction}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-desert-clay mt-1">
                      {disguise.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-desert-clay mb-3">
                  <span>
                    ⭐ -{disguise.wantedReduction} Wanted
                  </span>
                  <span>
                    ⏱️ {disguise.durationMinutes}min
                  </span>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${canAfford ? 'text-gold-medium' : 'text-blood-red'}`}>
                    💰 {disguise.cost} gold
                  </span>
                  <Button
                    variant={canAfford ? 'secondary' : 'ghost'}
                    size="sm"
                    disabled={!canAfford || isProcessing || isCurrentlyWearing || !!currentDisguise}
                    onClick={() => handleApply(disguise.id)}
                  >
                    {isCurrentlyWearing
                      ? 'Wearing'
                      : currentDisguise
                        ? 'Remove First'
                        : canAfford
                          ? 'Apply'
                          : 'Need Gold'
                    }
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-wood-light/10 rounded text-xs text-desert-clay">
        <p className="mb-1">💡 <strong>How Disguises Work:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Reduces your effective wanted level</li>
          <li>Lets you enter restricted buildings</li>
          <li>Can be detected - risk increases with danger level</li>
          <li>Detection increases wanted level</li>
        </ul>
      </div>
    </Card>
  );
};

export default DisguisePanel;
