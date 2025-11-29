/**
 * BribeModal Component
 * Modal for bribing guards or NPCs
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface BribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetType: 'guard' | 'npc';
  bribeCost: number;
  characterGold: number;
  characterCunning?: number;
  onConfirm: (amount: number) => Promise<{ success: boolean; message: string }>;
}

export const BribeModal: React.FC<BribeModalProps> = ({
  isOpen,
  onClose,
  targetName,
  targetType,
  bribeCost,
  characterGold,
  characterCunning = 0,
  onConfirm,
}) => {
  const [customAmount, setCustomAmount] = useState(bribeCost);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const canAfford = characterGold >= customAmount;

  // Calculate success chance for NPC bribes
  const calculateSuccessChance = (amount: number): number => {
    if (targetType === 'guard') return 100; // Guards always accept
    const base = 50;
    const amountBonus = Math.min(30, amount / 10);
    const cunningBonus = characterCunning * 2;
    return Math.min(95, base + amountBonus + cunningBonus);
  };

  const successChance = calculateSuccessChance(customAmount);

  const handleConfirm = async () => {
    if (!canAfford) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await onConfirm(customAmount);
      setResult(response);

      if (response.success) {
        // Close after short delay on success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setCustomAmount(bribeCost);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={targetType === 'guard' ? 'Bribe Guard' : 'Bribe NPC'}
      size="sm"
    >
      {/* Result display */}
      {result && (
        <Card
          variant={result.success ? 'leather' : 'wood'}
          className={`mb-4 ${result.success ? 'border-green-500' : 'border-blood-red'} border-2`}
        >
          <p className={`text-center ${result.success ? 'text-green-400' : 'text-blood-red'}`}>
            {result.message}
          </p>
        </Card>
      )}

      {/* Main content - hide when showing result */}
      {!result && (
        <>
          {/* Target info */}
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">
              {targetType === 'guard' ? '👮' : '🤝'}
            </span>
            <p className="text-desert-sand font-semibold">{targetName}</p>
            <p className="text-sm text-desert-clay">
              {targetType === 'guard'
                ? 'Slip some gold to look the other way...'
                : 'A little gold can loosen lips...'}
            </p>
          </div>

          {/* Amount selection */}
          <div className="mb-4">
            <label className="block text-sm text-desert-sand mb-2">
              Bribe Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={characterGold}
                value={customAmount}
                onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 bg-wood-dark border border-wood-light rounded text-desert-sand"
              />
              <span className="text-gold-medium font-bold">gold</span>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {[bribeCost, Math.floor(bribeCost * 1.5), bribeCost * 2].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCustomAmount(amount)}
                  disabled={characterGold < amount}
                  className={`
                    flex-1 py-1 text-sm rounded border
                    ${customAmount === amount
                      ? 'bg-gold-medium text-wood-dark border-gold-medium'
                      : characterGold >= amount
                        ? 'bg-wood-dark text-desert-sand border-wood-light hover:border-gold-medium'
                        : 'bg-wood-dark/50 text-desert-clay border-wood-dark cursor-not-allowed'
                    }
                  `}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Success chance for NPC bribes */}
          {targetType === 'npc' && (
            <div className="mb-4 p-3 bg-wood-light/20 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-desert-clay">Success Chance</span>
                <span className={`font-bold ${
                  successChance >= 80 ? 'text-green-500' :
                  successChance >= 60 ? 'text-gold-medium' :
                  successChance >= 40 ? 'text-orange-500' :
                  'text-blood-red'
                }`}>
                  {successChance}%
                </span>
              </div>
              <div className="w-full h-2 bg-wood-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    successChance >= 80 ? 'bg-green-500' :
                    successChance >= 60 ? 'bg-gold-medium' :
                    successChance >= 40 ? 'bg-orange-500' :
                    'bg-blood-red'
                  }`}
                  style={{ width: `${successChance}%` }}
                />
              </div>
              <p className="text-xs text-desert-clay mt-2">
                💡 Higher amounts and Cunning stat improve chances
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="mb-4 p-2 bg-blood-red/10 border border-blood-red/30 rounded">
            <p className="text-xs text-blood-red text-center">
              ⚠️ Bribing increases your criminal reputation
            </p>
          </div>

          {/* Gold status */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-desert-clay">Your Gold</span>
            <span className={`font-bold ${canAfford ? 'text-gold-medium' : 'text-blood-red'}`}>
              {characterGold} gold
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleConfirm}
              disabled={!canAfford || isProcessing}
              isLoading={isProcessing}
              className="flex-1"
            >
              {canAfford ? `Pay ${customAmount} Gold` : 'Not Enough Gold'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default BribeModal;
