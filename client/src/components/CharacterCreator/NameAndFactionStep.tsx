/**
 * NameAndFactionStep Component
 * First step of character creation - name and faction selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Faction, validateCharacterName } from '@desperados/shared';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FactionCard } from './FactionCard';
import apiClient from '@/services/api';
import { logger } from '@/services/logger.service';

interface NameAndFactionStepProps {
  name: string;
  faction: Faction | null;
  onNameChange: (name: string) => void;
  onFactionChange: (faction: Faction) => void;
  onNext: () => void;
}

/**
 * Name and faction selection step
 */
export const NameAndFactionStep: React.FC<NameAndFactionStepProps> = ({
  name,
  faction,
  onNameChange,
  onFactionChange,
  onNext,
}) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleNameBlur = () => {
    setTouched(true);
    const result = validateCharacterName(name);
    if (!result.valid) {
      setNameError(result.errors[0]);
    } else {
      setNameError(null);
    }
  };

  const handleNameChange = (value: string) => {
    onNameChange(value);
    if (nameError) {
      setNameError(null);
    }
  };

  // Check name availability with debouncing
  const checkNameAvailability = useCallback(async (characterName: string) => {
    if (!characterName || characterName.length < 3) {
      setNameAvailable(null);
      return;
    }

    const validation = validateCharacterName(characterName);
    if (!validation.valid) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      const response = await apiClient.get(`/characters/check-name?name=${encodeURIComponent(characterName)}`);
      setNameAvailable(response.data.available);
    } catch (err) {
      logger.error('Failed to check character name', err as Error, { context: 'NameAndFactionStep.checkNameAvailability', characterName });
      setNameAvailable(null);
    } finally {
      setCheckingName(false);
    }
  }, []);

  // Debounced name check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name && name.length >= 3 && !nameError) {
        checkNameAvailability(name.trim());
      } else {
        setNameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name, nameError, checkNameAvailability]);

  const canProceed = () => {
    const nameValidation = validateCharacterName(name);
    return nameValidation.valid && faction !== null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-western text-desert-sand mb-2">
          Name Your Character
        </h3>
        <p className="text-desert-stone">
          Choose your name and faction to begin your journey in the Sangre Territory
        </p>
      </div>

      {/* Character Name */}
      <div className="space-y-2">
        <label htmlFor="character-name" className="block text-desert-sand font-semibold">
          Character Name
        </label>
        <div className="relative">
          <Input
            id="character-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Enter character name (3-20 characters)"
            className={nameError ? 'border-blood-red' : ''}
            maxLength={20}
            autoFocus
          />
          {/* Name availability indicator */}
          {name && name.length >= 3 && !nameError && (
            <div className="absolute right-3 top-2.5">
              {checkingName ? (
                <span className="text-desert-stone text-sm">Checking...</span>
              ) : nameAvailable === true ? (
                <span className="text-green-500 text-xl" aria-label="Name available">✓</span>
              ) : nameAvailable === false ? (
                <span className="text-red-500 text-xl" aria-label="Name taken">✗</span>
              ) : null}
            </div>
          )}
          {/* Validation error indicator */}
          {touched && name && nameError && (
            <div className="absolute right-3 top-2.5">
              <span className="text-red-500 text-xl" aria-label="Invalid name">✗</span>
            </div>
          )}
        </div>
        {nameError && (
          <p className="text-blood-red text-sm">{nameError}</p>
        )}
        {nameAvailable === false && name.length >= 3 && (
          <p className="text-sm text-red-500">This name is already taken</p>
        )}
        {nameAvailable === true && (
          <p className="text-sm text-green-500">Name is available!</p>
        )}
        <div className="flex justify-between items-center text-xs">
          <p className={`${name.length > 20 ? 'text-blood-red font-semibold' : 'text-desert-stone'}`}>
            {name.length}/20 characters
          </p>
          <p className="text-desert-stone">
            3-20 alphanumeric characters
          </p>
        </div>
      </div>

      {/* Faction Selection */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-desert-sand">
          Choose Your Faction
        </h4>
        <p className="text-sm text-desert-stone">
          Your faction determines your starting location, allies, and cultural bonuses
        </p>

        <div className="grid grid-cols-1 gap-3">
          <FactionCard
            faction={Faction.SETTLER_ALLIANCE}
            isSelected={faction === Faction.SETTLER_ALLIANCE}
            onSelect={onFactionChange}
          />
          <FactionCard
            faction={Faction.NAHI_COALITION}
            isSelected={faction === Faction.NAHI_COALITION}
            onSelect={onFactionChange}
          />
          <FactionCard
            faction={Faction.FRONTERA}
            isSelected={faction === Faction.FRONTERA}
            onSelect={onFactionChange}
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!canProceed()}
          data-testid="character-next-button"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default NameAndFactionStep;
