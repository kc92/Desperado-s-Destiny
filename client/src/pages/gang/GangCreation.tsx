/**
 * Gang Creation Page
 * Form for creating a new gang with validation and availability checks
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGangStore } from '@/store/useGangStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { gangService } from '@/services/gang.service';
import { Button, Input, Card } from '@/components/ui';
import { GANG_CREATION, GANG_CONSTRAINTS } from '@desperados/shared';
import { logger } from '@/services/logger.service';

export function GangCreation() {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { createGang, isCreating, error, clearError: _clearError } = useGangStore();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [tagAvailable, setTagAvailable] = useState<boolean | null>(null);
  const [nameCheckTimeout, setNameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tagCheckTimeout, setTagCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ name?: string; tag?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const canAfford = currentCharacter && currentCharacter.gold! >= GANG_CREATION.COST;
  // Use Total Level for gang creation requirement
  const totalLevel = currentCharacter?.totalLevel || 30;
  const meetsLevelRequirement = currentCharacter && totalLevel >= GANG_CREATION.MIN_TOTAL_LEVEL;

  const validateName = useCallback((value: string): string | undefined => {
    if (value.length < GANG_CONSTRAINTS.NAME_MIN_LENGTH) {
      return `Name must be at least ${GANG_CONSTRAINTS.NAME_MIN_LENGTH} characters`;
    }
    if (value.length > GANG_CONSTRAINTS.NAME_MAX_LENGTH) {
      return `Name must be at most ${GANG_CONSTRAINTS.NAME_MAX_LENGTH} characters`;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
      return 'Name can only contain letters, numbers, and spaces';
    }
    return undefined;
  }, []);

  const validateTag = useCallback((value: string): string | undefined => {
    if (value.length < GANG_CONSTRAINTS.TAG_MIN_LENGTH) {
      return `Tag must be at least ${GANG_CONSTRAINTS.TAG_MIN_LENGTH} characters`;
    }
    if (value.length > GANG_CONSTRAINTS.TAG_MAX_LENGTH) {
      return `Tag must be at most ${GANG_CONSTRAINTS.TAG_MAX_LENGTH} characters`;
    }
    if (!/^[a-zA-Z]+$/.test(value)) {
      return 'Tag can only contain letters';
    }
    return undefined;
  }, []);

  const checkNameAvailability = useCallback(async (value: string) => {
    const validationError = validateName(value);
    if (validationError) {
      setNameAvailable(null);
      return;
    }

    try {
      const response = await gangService.checkNameAvailability(value);
      if (response.success && response.data) {
        setNameAvailable(response.data.available);
      }
    } catch (error) {
      logger.error('Failed to check name availability', error as Error, { context: 'GangCreation.checkNameAvailability', name: value });
      setNameAvailable(null);
    }
  }, [validateName]);

  const checkTagAvailability = useCallback(async (value: string) => {
    const validationError = validateTag(value);
    if (validationError) {
      setTagAvailable(null);
      return;
    }

    try {
      const response = await gangService.checkTagAvailability(value);
      if (response.success && response.data) {
        setTagAvailable(response.data.available);
      }
    } catch (error) {
      logger.error('Failed to check tag availability', error as Error, { context: 'GangCreation.checkTagAvailability', tag: value });
      setTagAvailable(null);
    }
  }, [validateTag]);

  useEffect(() => {
    if (name) {
      const error = validateName(name);
      setValidationErrors((prev) => ({ ...prev, name: error }));

      if (nameCheckTimeout) {
        clearTimeout(nameCheckTimeout);
      }

      if (!error) {
        const timeout = setTimeout(() => checkNameAvailability(name), 500);
        setNameCheckTimeout(timeout);
      } else {
        setNameAvailable(null);
      }
    } else {
      setNameAvailable(null);
      setValidationErrors((prev) => ({ ...prev, name: undefined }));
    }

    return () => {
      if (nameCheckTimeout) {
        clearTimeout(nameCheckTimeout);
      }
    };
  }, [name, validateName, checkNameAvailability]);

  useEffect(() => {
    if (tag) {
      const error = validateTag(tag);
      setValidationErrors((prev) => ({ ...prev, tag: error }));

      if (tagCheckTimeout) {
        clearTimeout(tagCheckTimeout);
      }

      if (!error) {
        const timeout = setTimeout(() => checkTagAvailability(tag), 500);
        setTagCheckTimeout(timeout);
      } else {
        setTagAvailable(null);
      }
    } else {
      setTagAvailable(null);
      setValidationErrors((prev) => ({ ...prev, tag: undefined }));
    }

    return () => {
      if (tagCheckTimeout) {
        clearTimeout(tagCheckTimeout);
      }
    };
  }, [tag, validateTag, checkTagAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAfford || !meetsLevelRequirement || !nameAvailable || !tagAvailable) {
      return;
    }

    try {
      await createGang(name, tag);
      setShowSuccessModal(true);
      setTimeout(() => navigate('/game/gang/profile'), 2000);
    } catch (error) {
      logger.error('Failed to create gang', error as Error, { context: 'GangCreation.handleSubmit', name, tag });
    }
  };

  if (!currentCharacter) {
    return <div className="p-4 text-center">Loading character...</div>;
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-amber-100 border-4 border-amber-900 shadow-xl">
          <div className="bg-amber-900 text-amber-50 p-6 text-center">
            <h1 className="text-3xl md:text-4xl font-western">Create Your Gang</h1>
            <p className="mt-2 text-amber-200">Forge a legendary outfit in the Wild West</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="gangName" className="block text-lg font-semibold text-amber-900 mb-2">
                Gang Name
              </label>
              <div className="relative">
                <Input
                  id="gangName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter gang name (3-20 characters)"
                  maxLength={GANG_CONSTRAINTS.NAME_MAX_LENGTH}
                  className={`w-full ${
                    validationErrors.name
                      ? 'border-red-500'
                      : nameAvailable === true
                      ? 'border-green-500'
                      : nameAvailable === false
                      ? 'border-red-500'
                      : ''
                  }`}
                  aria-invalid={!!validationErrors.name || nameAvailable === false}
                  aria-describedby="name-error name-status"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {nameAvailable === true && <span className="text-green-600 text-xl">✓</span>}
                  {nameAvailable === false && <span className="text-red-600 text-xl">✗</span>}
                </div>
              </div>
              {validationErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
              {nameAvailable === false && !validationErrors.name && (
                <p id="name-status" className="mt-1 text-sm text-red-600">
                  This name is already taken
                </p>
              )}
              {nameAvailable === true && (
                <p id="name-status" className="mt-1 text-sm text-green-600">
                  This name is available
                </p>
              )}
            </div>

            <div>
              <label htmlFor="gangTag" className="block text-lg font-semibold text-amber-900 mb-2">
                Gang Tag
              </label>
              <div className="relative">
                <Input
                  id="gangTag"
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  placeholder="TAG (2-5 letters)"
                  maxLength={GANG_CONSTRAINTS.TAG_MAX_LENGTH}
                  className={`w-full ${
                    validationErrors.tag
                      ? 'border-red-500'
                      : tagAvailable === true
                      ? 'border-green-500'
                      : tagAvailable === false
                      ? 'border-red-500'
                      : ''
                  }`}
                  aria-invalid={!!validationErrors.tag || tagAvailable === false}
                  aria-describedby="tag-error tag-status"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {tagAvailable === true && <span className="text-green-600 text-xl">✓</span>}
                  {tagAvailable === false && <span className="text-red-600 text-xl">✗</span>}
                </div>
              </div>
              {validationErrors.tag && (
                <p id="tag-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.tag}
                </p>
              )}
              {tagAvailable === false && !validationErrors.tag && (
                <p id="tag-status" className="mt-1 text-sm text-red-600">
                  This tag is already taken
                </p>
              )}
              {tagAvailable === true && (
                <p id="tag-status" className="mt-1 text-sm text-green-600">
                  This tag is available
                </p>
              )}
              {tag && tagAvailable && (
                <div className="mt-2 inline-block bg-amber-900 text-amber-50 px-3 py-1 rounded font-semibold">
                  [{tag}]
                </div>
              )}
            </div>

            <Card className="bg-amber-200 p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Requirements</h3>
              <ul className="space-y-2">
                <li className={`flex items-center ${canAfford ? 'text-green-700' : 'text-red-700'}`}>
                  <span className="mr-2">{canAfford ? '✓' : '✗'}</span>
                  <span>
                    Cost: {GANG_CREATION.COST} gold (You have: {currentCharacter.gold || 0} gold)
                  </span>
                </li>
                <li className={`flex items-center ${meetsLevelRequirement ? 'text-green-700' : 'text-red-700'}`}>
                  <span className="mr-2">{meetsLevelRequirement ? '✓' : '✗'}</span>
                  <span>
                    Total Level {GANG_CREATION.MIN_TOTAL_LEVEL}+ (You are Total Level {totalLevel})
                  </span>
                </li>
              </ul>
            </Card>

            {name && tag && nameAvailable && tagAvailable && (
              <Card className="bg-amber-300 p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Preview</h3>
                <div className="text-center">
                  <div className="text-2xl font-western text-amber-900">
                    {name} <span className="text-lg">[{tag}]</span>
                  </div>
                  <div className="mt-2 text-sm text-amber-800">
                    Level 1 | $0 in bank | Base perks active
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate('/game/gang')}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating ||
                  !name ||
                  !tag ||
                  !nameAvailable ||
                  !tagAvailable ||
                  !canAfford ||
                  !meetsLevelRequirement ||
                  !!validationErrors.name ||
                  !!validationErrors.tag
                }
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold"
              >
                {isCreating ? 'Creating...' : `Create Gang (${GANG_CREATION.COST} gold)`}
              </Button>
            </div>
          </form>
        </Card>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-amber-100 border-4 border-amber-900 p-8 max-w-md text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-western text-amber-900 mb-2">Gang Created Successfully!</h2>
              <p className="text-amber-800">Redirecting to your gang profile...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
