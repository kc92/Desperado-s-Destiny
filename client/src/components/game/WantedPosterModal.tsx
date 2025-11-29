/**
 * WantedPosterModal Component
 * Detailed wanted poster with crimes, consequences, and lay low option
 */

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Crime {
  name: string;
  timestamp: Date;
}

interface WantedPosterModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Character name */
  characterName: string;
  /** Current wanted level (0-5) */
  wantedLevel: number;
  /** Current bounty amount */
  bountyAmount: number;
  /** Time until wanted level decreases (in ms) */
  timeUntilDecay: number;
  /** Recent crimes committed */
  recentCrimes: Crime[];
  /** Current gold (for lay low cost) */
  currentGold: number;
  /** Callback when laying low */
  onLayLow: (useGold: boolean) => void;
}

/**
 * Format time until decay
 */
const formatTimeUntilDecay = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get consequences text for current wanted level
 */
const getConsequences = (level: number): string[] => {
  const consequences: string[] = [];

  if (level >= 1) {
    consequences.push(`Crime difficulty: +${level * 10}%`);
  }

  if (level >= 3) {
    consequences.push("Can be arrested by other players");
    consequences.push("Sheriff patrols actively hunting you");
  }

  if (level >= 4) {
    consequences.push("Guards attack on sight in towns");
    consequences.push("Double jail time on capture");
  }

  if (level >= 5) {
    consequences.push("Entire territory is hostile");
    consequences.push("Legendary bounty hunter tracking you");
  }

  return consequences;
};

/**
 * Wanted poster modal with western styling
 */
export const WantedPosterModal: React.FC<WantedPosterModalProps> = ({
  isOpen,
  onClose,
  characterName,
  wantedLevel,
  bountyAmount,
  timeUntilDecay,
  recentCrimes,
  currentGold,
  onLayLow,
}) => {
  const [layLowMethod, setLayLowMethod] = useState<'time' | 'gold'>('time');
  const [showLayLowConfirm, setShowLayLowConfirm] = useState(false);

  const consequences = getConsequences(wantedLevel);
  const canAffordLayLow = currentGold >= 50;

  const handleLayLow = () => {
    onLayLow(layLowMethod === 'gold');
    setShowLayLowConfirm(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      {/* Wanted Poster Design */}
      <div
        className="relative p-8 bg-gradient-to-br from-amber-100 to-amber-200 border-8 border-double border-leather-brown rounded-lg shadow-2xl"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="paper" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="2" cy="2" r="1" fill="%23d4a574" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23paper)"/%3E%3C/svg%3E")',
        }}
      >
        {/* Rusty Nails in Corners */}
        <div className="absolute top-2 left-2 w-4 h-4 bg-gray-600 rounded-full shadow-md" />
        <div className="absolute top-2 right-2 w-4 h-4 bg-gray-600 rounded-full shadow-md" />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-gray-600 rounded-full shadow-md" />
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-gray-600 rounded-full shadow-md" />

        {/* WANTED Header */}
        <div className="text-center mb-6">
          <h1
            className="text-7xl font-western text-blood-red mb-2"
            style={{
              textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            WANTED
          </h1>
          <div className="inline-block bg-blood-red text-white px-6 py-2 font-western text-2xl transform -rotate-2">
            DEAD OR ALIVE
          </div>
        </div>

        {/* Character Name */}
        <div className="text-center mb-6">
          <div className="text-4xl font-western text-wood-dark mb-2">
            {characterName}
          </div>
        </div>

        {/* Wanted Level Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={`text-4xl ${
                index < wantedLevel ? 'text-gold-dark' : 'text-gray-300'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Bounty Amount */}
        <div className="text-center mb-6 p-4 bg-gold-dark/30 border-4 border-gold-dark rounded">
          <div className="text-sm text-wood-grain uppercase tracking-wide mb-1">Reward</div>
          <div className="text-5xl font-western text-gold-dark">
            ${bountyAmount}
          </div>
        </div>

        {/* Recent Crimes */}
        {recentCrimes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-western text-wood-dark mb-3 text-center border-b-2 border-wood-medium pb-2">
              Known Offenses
            </h3>
            <ul className="space-y-2">
              {recentCrimes.slice(0, 5).map((crime, index) => (
                <li key={index} className="flex items-center gap-2 text-wood-dark">
                  <span className="text-blood-red font-bold">•</span>
                  <span className="flex-1">{crime.name}</span>
                  <span className="text-xs text-wood-grain">
                    {new Date(crime.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Consequences */}
        {consequences.length > 0 && (
          <div className="mb-6 p-4 bg-blood-red/10 border-2 border-blood-red/30 rounded">
            <h3 className="text-lg font-western text-blood-red mb-2">
              Current Consequences:
            </h3>
            <ul className="space-y-1">
              {consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-wood-dark">
                  <span className="text-blood-red">⚠</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Time Until Decay */}
        <div className="mb-6 text-center p-3 bg-wood-light/30 rounded border border-wood-medium">
          <div className="text-sm text-wood-grain mb-1">Wanted level decreases in</div>
          <div className="text-2xl font-western text-wood-dark">
            {formatTimeUntilDecay(timeUntilDecay)}
          </div>
        </div>

        {/* Lay Low Option */}
        {!showLayLowConfirm && (
          <div className="space-y-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setShowLayLowConfirm(true)}
            >
              Lay Low (Reduce Wanted Level)
            </Button>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={onClose}
            >
              Accept Wanted Status
            </Button>
          </div>
        )}

        {/* Lay Low Confirmation */}
        {showLayLowConfirm && (
          <div className="space-y-4 p-4 bg-white/50 rounded-lg border-2 border-wood-medium">
            <h3 className="text-lg font-western text-wood-dark text-center">
              Lay Low Options
            </h3>

            <p className="text-sm text-wood-medium text-center">
              Choose how you want to reduce your wanted level by 1:
            </p>

            {/* Time Option */}
            <label className="flex items-start gap-3 p-3 border-2 border-wood-medium rounded cursor-pointer hover:bg-wood-light/20 transition-colors">
              <input
                type="radio"
                name="laylow"
                value="time"
                checked={layLowMethod === 'time'}
                onChange={() => setLayLowMethod('time')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-bold text-wood-dark">Wait 30 Minutes</div>
                <div className="text-sm text-wood-medium">
                  Hide out and avoid authorities for half an hour
                </div>
              </div>
            </label>

            {/* Gold Option */}
            <label className="flex items-start gap-3 p-3 border-2 border-wood-medium rounded cursor-pointer hover:bg-wood-light/20 transition-colors">
              <input
                type="radio"
                name="laylow"
                value="gold"
                checked={layLowMethod === 'gold'}
                onChange={() => setLayLowMethod('gold')}
                className="mt-1"
                disabled={!canAffordLayLow}
              />
              <div className="flex-1">
                <div className="font-bold text-wood-dark">Pay 50 Gold</div>
                <div className="text-sm text-wood-medium">
                  Bribe contacts to spread misinformation (instant)
                </div>
                {!canAffordLayLow && (
                  <div className="text-sm text-blood-red mt-1">
                    Insufficient gold
                  </div>
                )}
              </div>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => setShowLayLowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleLayLow}
                disabled={layLowMethod === 'gold' && !canAffordLayLow}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WantedPosterModal;
