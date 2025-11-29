/**
 * ConfirmStep Component
 * Final step of character creation - review and confirm
 */

import React from 'react';
import { Faction, FACTIONS } from '@desperados/shared';
import { Button } from '../ui/Button';
import { CharacterPreview } from './CharacterPreview';

interface ConfirmStepProps {
  name: string;
  faction: Faction;
  isCreating: boolean;
  error: string | null;
  onBack: () => void;
  onCreate: () => void;
}

/**
 * Confirmation step with character summary
 */
export const ConfirmStep: React.FC<ConfirmStepProps> = ({
  name,
  faction,
  isCreating,
  error,
  onBack,
  onCreate,
}) => {
  const factionData = FACTIONS[faction];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-western text-desert-sand mb-2">
          Confirm Your Character
        </h3>
        <p className="text-desert-stone">
          Review your choices before entering the Sangre Territory
        </p>
      </div>

      {/* Character Preview */}
      <CharacterPreview faction={faction} name={name} />

      {/* Character Summary */}
      <div className="bg-wood-dark/50 rounded-lg p-6 border-2 border-wood-medium space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-desert-stone mb-1">Character Name</h4>
            <p className="text-lg font-western text-desert-sand">{name}</p>
          </div>
          <div>
            <h4 className="text-sm text-desert-stone mb-1">Faction</h4>
            <p className="text-lg font-semibold text-gold-medium">{factionData.name}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-desert-stone mb-1">Starting Location</h4>
          <p className="text-base text-desert-sand">{factionData.startingLocation}</p>
        </div>

        <div>
          <h4 className="text-sm text-desert-stone mb-1">Cultural Bonus</h4>
          <p className="text-base text-gold-light">+5 {factionData.culturalBonus}</p>
        </div>

        <div>
          <h4 className="text-sm text-desert-stone mb-1">Philosophy</h4>
          <p className="text-sm text-desert-sand italic">{factionData.philosophy}</p>
        </div>

        <div className="pt-2 border-t border-wood-medium">
          <h4 className="text-sm text-desert-stone mb-2">Starting Benefits</h4>
          <ul className="list-disc list-inside text-sm text-desert-sand space-y-1">
            <li>Level 1 character ready for adventure</li>
            <li>150 Energy to explore the territory</li>
            <li>5-card Destiny Deck for challenges</li>
            <li>Unique faction starting bonuses</li>
          </ul>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4">
          <p className="text-blood-red font-semibold">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isCreating}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onCreate}
          isLoading={isCreating}
          disabled={isCreating}
        >
          {isCreating ? 'Creating Character...' : 'Create Character'}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmStep;
