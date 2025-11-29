/**
 * CharacterCreatorModal Component
 * Multi-step modal for creating a new character
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Faction, CharacterCreation } from '@desperados/shared';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Modal } from '../ui/Modal';
import { NameAndFactionStep } from './NameAndFactionStep';
import { ConfirmStep } from './ConfirmStep';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreationStep = 'name-faction' | 'confirm';

/**
 * Multi-step character creation modal
 */
export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { createCharacter, selectCharacter, error, clearError } = useCharacterStore();

  const [currentStep, setCurrentStep] = useState<CreationStep>('name-faction');
  const [name, setName] = useState('');
  const [faction, setFaction] = useState<Faction | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setCurrentStep('name-faction');
    setName('');
    setFaction(null);
    setIsCreating(false);
    clearError();
  };

  const handleNextStep = () => {
    setCurrentStep('confirm');
  };

  const handleBackStep = () => {
    setCurrentStep('name-faction');
  };

  const handleCreate = async () => {
    if (!faction) {
      return;
    }

    setIsCreating(true);
    clearError();

    try {
      const data: CharacterCreation = {
        name: name.trim(),
        faction,
      };

      // Create the character and get it back
      const newCharacter = await createCharacter(data);

      if (newCharacter) {
        // Select the new character
        await selectCharacter(newCharacter._id);

        // Navigate to game
        navigate('/game');

        // Close modal and reset
        resetForm();
        onClose();
      }
    } catch {
      setIsCreating(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'name-faction':
        return 'Create Character - Step 1 of 2';
      case 'confirm':
        return 'Create Character - Step 2 of 2';
      default:
        return 'Create Character';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getStepTitle()}
      size="xl"
      showCloseButton={!isCreating}
    >
      <div className="min-h-[400px]">
        {currentStep === 'name-faction' && (
          <NameAndFactionStep
            name={name}
            faction={faction}
            onNameChange={setName}
            onFactionChange={setFaction}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 'confirm' && faction && (
          <ConfirmStep
            name={name}
            faction={faction}
            isCreating={isCreating}
            error={error}
            onBack={handleBackStep}
            onCreate={handleCreate}
          />
        )}
      </div>
    </Modal>
  );
};

export default CharacterCreatorModal;
