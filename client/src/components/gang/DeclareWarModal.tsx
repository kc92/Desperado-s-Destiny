/**
 * DeclareWarModal Component
 * Modal for declaring war on a territory with funding amount selection
 */

import React, { useState } from 'react';
import { Modal, Button, Card } from '@/components/ui';
import type { Territory } from '@/hooks/useGangWars';

interface DeclareWarModalProps {
  isOpen: boolean;
  onClose: () => void;
  territories: Territory[];
  gangBank: number;
  hasWarChest: boolean;
  hasActiveWar: boolean;
  onDeclare: (territoryId: string, fundingAmount: number) => Promise<boolean>;
}

export const DeclareWarModal: React.FC<DeclareWarModalProps> = ({
  isOpen,
  onClose,
  territories,
  gangBank,
  hasWarChest,
  hasActiveWar,
  onDeclare,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDeclare = hasWarChest && !hasActiveWar && fundingAmount >= 1000 && selectedTerritory && fundingAmount <= gangBank;

  const handleDeclare = async () => {
    if (!selectedTerritory || !canDeclare) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onDeclare(selectedTerritory, fundingAmount);
      if (success) {
        onClose();
        setSelectedTerritory(null);
        setFundingAmount(1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to declare war');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Declare War">
      <div className="space-y-6">
        {/* Territory Selection */}
        <div>
          <label className="block text-sm font-western text-desert-sand mb-2">
            Target Territory
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {territories.map((territory) => (
              <button
                key={territory.id}
                onClick={() => setSelectedTerritory(territory.id)}
                className={`p-3 rounded border text-left transition-colors ${
                  selectedTerritory === territory.id
                    ? 'border-gold-light bg-wood-dark'
                    : 'border-wood-grain hover:border-gold-light/50'
                }`}
              >
                <p className="font-western text-sm text-desert-sand">
                  {territory.name}
                </p>
                <p className="text-xs text-desert-stone">
                  {territory.controllingGangName || 'Unclaimed'}
                </p>
              </button>
            ))}
          </div>
          {territories.length === 0 && (
            <p className="text-sm text-desert-stone text-center py-4">
              No territories available for war
            </p>
          )}
        </div>

        {/* Funding Amount */}
        <div>
          <label htmlFor="war-fund-amount" className="block text-sm font-western text-desert-sand mb-2">
            Initial War Fund
          </label>
          <input
            id="war-fund-amount"
            name="warFundAmount"
            type="range"
            min={1000}
            max={Math.max(1000, gangBank)}
            step={100}
            value={fundingAmount}
            onChange={(e) => setFundingAmount(Number(e.target.value))}
            className="w-full h-2 bg-wood-dark rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-desert-stone mt-1">
            <span>1,000g (min)</span>
            <span className="text-gold-light font-bold">{fundingAmount.toLocaleString()}g</span>
            <span>{gangBank.toLocaleString()}g (max)</span>
          </div>
        </div>

        {/* Requirements */}
        <Card variant="wood" className="p-3">
          <p className="text-desert-sand text-sm mb-2 font-western">Requirements:</p>
          <ul className="space-y-1 text-sm">
            <li className={hasWarChest ? 'text-green-500' : 'text-red-500'}>
              {hasWarChest ? '✓' : '✗'} War Chest upgrade
            </li>
            <li className={fundingAmount >= 1000 ? 'text-green-500' : 'text-red-500'}>
              {fundingAmount >= 1000 ? '✓' : '✗'} Minimum 1,000g funding
            </li>
            <li className={!hasActiveWar ? 'text-green-500' : 'text-red-500'}>
              {!hasActiveWar ? '✓' : '✗'} No other active wars
            </li>
            <li className={fundingAmount <= gangBank ? 'text-green-500' : 'text-red-500'}>
              {fundingAmount <= gangBank ? '✓' : '✗'} Sufficient gang funds
            </li>
          </ul>
        </Card>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeclare}
            className="flex-1"
            disabled={!canDeclare || isSubmitting}
          >
            {isSubmitting ? 'Declaring...' : 'Declare War'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeclareWarModal;
