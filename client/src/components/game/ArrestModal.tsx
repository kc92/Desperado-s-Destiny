/**
 * ArrestModal Component
 * Confirmation modal before arresting a wanted player
 * Shows success screen after arrest
 */

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ArrestTarget {
  characterId: string;
  characterName: string;
  wantedLevel: number;
  bountyAmount: number;
  recentCrimes: string[];
}

interface ArrestModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Target to arrest */
  target: ArrestTarget | null;
  /** Callback when arrest is confirmed */
  onConfirm: (targetId: string) => Promise<boolean>;
}

/**
 * Arrest confirmation and success modal
 */
export const ArrestModal: React.FC<ArrestModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirm,
}) => {
  const [isArresting, setIsArresting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [arrestError, setArrestError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!target) return;

    setIsArresting(true);
    setArrestError(null);

    try {
      const success = await onConfirm(target.characterId);

      if (success) {
        setShowSuccess(true);
      } else {
        setArrestError('Arrest failed. Target may have already been arrested.');
      }
    } catch (error: any) {
      setArrestError(error.message || 'Failed to arrest target');
    } finally {
      setIsArresting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setArrestError(null);
    onClose();
  };

  if (!target) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="md"
    >
      {!showSuccess ? (
        // Confirmation Screen
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-western text-blood-red mb-2">
              ARREST OUTLAW?
            </h2>
            <div className="text-wood-medium">Bring this criminal to justice</div>
          </div>

          {/* Target Info */}
          <div className="parchment p-6 rounded-lg border-4 border-leather-brown">
            {/* Name */}
            <div className="text-center mb-4">
              <div className="text-3xl font-western text-wood-dark">
                {target.characterName}
              </div>
            </div>

            {/* Wanted Stars */}
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={`text-2xl ${
                    index < target.wantedLevel ? 'text-blood-red' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Bounty */}
            <div className="text-center mb-4 p-3 bg-gold-dark/20 rounded border-2 border-gold-dark">
              <div className="text-sm text-wood-grain uppercase tracking-wide">Bounty Reward</div>
              <div className="text-3xl font-western text-gold-dark">
                {target.bountyAmount}g
              </div>
            </div>

            {/* Recent Crimes */}
            {target.recentCrimes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-western text-wood-dark mb-2 text-center">
                  Recent Offenses
                </h4>
                <ul className="space-y-1">
                  {target.recentCrimes.slice(0, 3).map((crime, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-wood-medium">
                      <span className="text-blood-red">•</span>
                      <span>{crime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            <div className="p-3 bg-wood-light/30 rounded border border-wood-medium">
              <div className="text-xs text-wood-grain uppercase tracking-wide mb-1">
                Warning
              </div>
              <div className="text-sm text-wood-dark">
                Target may resist arrest. Ensure you're prepared for potential conflict.
              </div>
            </div>
          </div>

          {/* Error Display */}
          {arrestError && (
            <div className="p-4 bg-blood-red/20 border-2 border-blood-red rounded">
              <p className="text-blood-red text-center font-semibold">{arrestError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleClose}
              disabled={isArresting}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleConfirm}
              disabled={isArresting}
              isLoading={isArresting}
            >
              Arrest
            </Button>
          </div>
        </div>
      ) : (
        // Success Screen
        <div className="space-y-6">
          {/* Success Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-4xl font-western text-green-700 mb-2">
              ARREST SUCCESSFUL!
            </h2>
            <p className="text-wood-medium">
              You've brought {target.characterName} to justice
            </p>
          </div>

          {/* Bounty Earned */}
          <div className="parchment p-6 rounded-lg border-4 border-gold-dark bg-gradient-to-br from-gold-light/30 to-gold-medium/30">
            <div className="text-center mb-4">
              <div className="text-sm text-wood-grain uppercase tracking-wide mb-2">
                Bounty Earned
              </div>
              <div className="text-5xl font-western text-gold-dark mb-2">
                +{target.bountyAmount}g
              </div>
              <div className="text-wood-medium">
                Added to your gold
              </div>
            </div>

            {/* Badge Earned (Optional) */}
            <div className="pt-4 border-t-2 border-gold-dark/30">
              <div className="flex items-center justify-center gap-2 text-sm text-wood-dark">
                <span className="text-2xl">🏆</span>
                <span className="font-bold">Badge: Bounty Hunter</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleClose}
          >
            Continue
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ArrestModal;
