/**
 * CombatResultModal Component
 * Displays combat results - victory or defeat
 */

import React from 'react';
import { CombatResult } from '@desperados/shared';
import { Modal, Button } from '@/components/ui';

interface CombatResultModalProps {
  /** Combat result data */
  result: CombatResult;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when continuing from victory/defeat */
  onContinue: () => void;
}

// Rarity colors
const RARITY_COLORS = {
  common: 'text-gray-400',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-gold-light',
};

// Rarity backgrounds
const RARITY_BG = {
  common: 'bg-gray-400/10',
  uncommon: 'bg-green-500/10',
  rare: 'bg-blue-500/10',
  epic: 'bg-purple-500/10',
  legendary: 'bg-gold-light/10',
};

/**
 * Victory/Defeat modal with western styling
 */
export const CombatResultModal: React.FC<CombatResultModalProps> = ({
  result,
  isOpen,
  onContinue,
}) => {
  const isVictory = result.victory;

  return (
    <Modal isOpen={isOpen} onClose={onContinue} title={isVictory ? "Victory" : "Defeated"}>
      {isVictory ? (
        /* VICTORY MODE */
        <div className="relative bg-gradient-to-br from-gold-pale to-desert-sand border-4 border-gold-dark rounded-lg p-8 shadow-gold max-w-2xl">
          {/* Wanted Poster Style Header */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-full text-center">
            <div className="inline-block bg-gold-dark px-8 py-3 rounded-full shadow-lg border-4 border-wood-dark">
              <h2 className="text-4xl font-western text-wood-dark animate-victory-pulse">
                VICTORY!
              </h2>
            </div>
          </div>

          {/* Celebration effects */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-gold-light rounded-full animate-damage-float" />
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-gold-light rounded-full animate-damage-float" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-gold-medium rounded-full animate-damage-float" style={{ animationDelay: '0.4s' }} />
          </div>

          <div className="mt-8 space-y-6">
            {/* Rewards Section */}
            <div className="text-center space-y-4">
              {/* XP Gained */}
              <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
                <div className="text-sm text-wood-medium font-serif mb-1">Experience Gained</div>
                <div className="text-3xl font-western text-blue-600">
                  +{result.xpGained} XP
                </div>
              </div>

              {/* Gold Gained */}
              <div className="bg-gold-light/10 border-2 border-gold-dark/30 rounded-lg p-4">
                <div className="text-sm text-wood-medium font-serif mb-1">Gold Earned</div>
                <div className="text-3xl font-western text-gold-dark">
                  💰 {result.goldGained}
                </div>
              </div>

              {/* Items Looted */}
              {result.itemsLooted && result.itemsLooted.length > 0 && (
                <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
                  <div className="text-sm text-wood-medium font-serif mb-2">Items Looted</div>
                  <div className="space-y-2">
                    {result.itemsLooted.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${RARITY_BG[item.rarity]}`}
                      >
                        <span className={`font-serif font-bold ${RARITY_COLORS[item.rarity]}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-wood-medium uppercase">
                          {item.rarity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.itemsLooted && result.itemsLooted.length === 0 && (
                <div className="bg-wood-dark/5 border-2 border-wood-dark/10 rounded-lg p-3">
                  <p className="text-sm text-wood-medium font-serif italic">
                    No items dropped this time
                  </p>
                </div>
              )}
            </div>

            {/* Combat Stats */}
            <div className="border-t-2 border-wood-dark/20 pt-4">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-wood-medium font-serif">Rounds</div>
                  <div className="font-bold text-wood-dark">{result.totalRounds}</div>
                </div>
                <div>
                  <div className="text-wood-medium font-serif">Damage Dealt</div>
                  <div className="font-bold text-gold-dark">{result.totalDamageDealt}</div>
                </div>
                <div>
                  <div className="text-wood-medium font-serif">Damage Taken</div>
                  <div className="font-bold text-blood-red">{result.totalDamageTaken}</div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              variant="primary"
              className="w-full font-western text-lg py-3 bg-gold-dark hover:bg-gold-medium"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        /* DEFEAT MODE */
        <div className="relative bg-gradient-to-br from-wood-darker to-wood-dark border-4 border-blood-red rounded-lg p-8 shadow-2xl max-w-2xl">
          {/* Tombstone Style Header */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-full text-center">
            <div className="inline-block bg-blood-dark px-8 py-3 rounded-full shadow-lg border-4 border-blood-red">
              <h2 className="text-4xl font-western text-desert-sand">
                DEFEATED
              </h2>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Tombstone Icon */}
            <div className="text-center">
              <div className="text-8xl mb-4">🪦</div>
              <p className="text-lg text-desert-sand font-serif italic">
                "You fought bravely, but the frontier claimed another..."
              </p>
            </div>

            {/* Death Message */}
            <div className="bg-blood-dark/30 border-2 border-blood-red/50 rounded-lg p-4 text-center">
              <p className="text-desert-dust font-serif">
                You were defeated and lost consciousness.
              </p>
            </div>

            {/* Gold Lost */}
            <div className="bg-blood-red/10 border-2 border-blood-red/30 rounded-lg p-4">
              <div className="text-sm text-desert-dust font-serif mb-1">Gold Lost</div>
              <div className="text-2xl font-western text-blood-crimson">
                - {result.goldLost} 💰
              </div>
              <p className="text-xs text-desert-dust font-serif italic mt-2">
                (10% of your gold)
              </p>
            </div>

            {/* Combat Stats */}
            <div className="border-t-2 border-desert-dust/20 pt-4">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-desert-dust font-serif">Rounds</div>
                  <div className="font-bold text-desert-sand">{result.totalRounds}</div>
                </div>
                <div>
                  <div className="text-desert-dust font-serif">Damage Dealt</div>
                  <div className="font-bold text-gold-dark">{result.totalDamageDealt}</div>
                </div>
                <div>
                  <div className="text-desert-dust font-serif">Damage Taken</div>
                  <div className="font-bold text-blood-crimson">{result.totalDamageTaken}</div>
                </div>
              </div>
            </div>

            {/* Respawn Flavor Text */}
            <div className="bg-wood-dark/50 border-2 border-desert-dust/20 rounded-lg p-4 text-center">
              <p className="text-sm text-desert-sand font-serif italic">
                You wake up in town, bruised but alive. The frontier is unforgiving, but there's always another chance to prove yourself.
              </p>
            </div>

            {/* Respawn Button */}
            <Button
              onClick={onContinue}
              variant="secondary"
              className="w-full font-western text-lg py-3 bg-blood-red hover:bg-blood-crimson border-2 border-desert-sand"
            >
              Respawn in Town
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CombatResultModal;
