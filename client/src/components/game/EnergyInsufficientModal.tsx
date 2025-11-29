/**
 * EnergyInsufficientModal Component
 *
 * Modal displayed when a player attempts an action without sufficient energy
 * Shows deficit, wait time, and premium upgrade option
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface EnergyInsufficientModalProps {
  isOpen: boolean;
  onClose: () => void;
  energyNeeded: number;
  energyCurrent: number;
  timeUntilAvailable: string;
  isPremium?: boolean;
}

/**
 * Wanted poster themed modal for insufficient energy
 */
export const EnergyInsufficientModal: React.FC<EnergyInsufficientModalProps> = ({
  isOpen,
  onClose,
  energyNeeded,
  energyCurrent,
  timeUntilAvailable,
  isPremium = false,
}) => {
  const deficit = energyNeeded - energyCurrent;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Not Enough Energy!" size="md">
      <div className="space-y-6">
        {/* Wanted poster style header */}
        <div className="text-center border-4 border-double border-wood-dark p-4 bg-desert-sand/20">
          <div className="text-6xl mb-2">⚡</div>
          <h3 className="text-3xl font-western text-red-600 text-shadow-dark mb-2">
            OUT OF ENERGY
          </h3>
          <p className="text-lg text-wood-dark font-semibold">
            Your character is too exhausted to continue!
          </p>
        </div>

        {/* Energy deficit information */}
        <div className="bg-wood-dark/20 rounded-lg p-4 border-2 border-wood-medium">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-desert-stone mb-1">Required</div>
              <div className="text-2xl font-bold text-gold-medium">{energyNeeded}</div>
            </div>
            <div>
              <div className="text-sm text-desert-stone mb-1">Current</div>
              <div className="text-2xl font-bold text-orange-500">{energyCurrent}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-wood-medium text-center">
            <div className="text-sm text-desert-stone mb-1">Shortage</div>
            <div className="text-3xl font-bold text-red-500">-{deficit}</div>
          </div>
        </div>

        {/* Wait time */}
        <div className="text-center p-4 bg-yellow-900/20 rounded-lg border-2 border-yellow-700">
          <div className="text-sm text-desert-stone mb-2">Energy regenerates in:</div>
          <div className="text-2xl font-bold text-yellow-500">{timeUntilAvailable}</div>
          <div className="text-xs text-desert-stone mt-2 italic">
            Come back when your character has rested
          </div>
        </div>

        {/* Premium upgrade CTA (only for free players) */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-900/30 to-purple-700/30 rounded-lg p-4 border-2 border-purple-500">
            <div className="flex items-start gap-3">
              <div className="text-3xl">👑</div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-purple-300 mb-2">
                  Upgrade to Premium
                </h4>
                <ul className="text-sm text-desert-sand space-y-1">
                  <li>• 250 max energy (instead of 150)</li>
                  <li>• Faster regeneration rate</li>
                  <li>• More actions per day</li>
                  <li>• Exclusive premium perks</li>
                </ul>
                <Button
                  variant="primary"
                  className="mt-3 w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  onClick={() => {
                    // TODO: Navigate to premium upgrade page when implemented
                  }}
                >
                  Learn More About Premium
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="text-center">
          <Button variant="secondary" onClick={onClose} className="min-w-[200px]">
            Okay, I'll Wait
          </Button>
        </div>

        {/* Flavor text */}
        <div className="text-center text-xs text-desert-stone italic border-t border-wood-medium pt-4">
          "Even the toughest desperado needs rest between adventures"
        </div>
      </div>
    </Modal>
  );
};

export default EnergyInsufficientModal;
