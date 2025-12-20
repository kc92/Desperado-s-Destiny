/**
 * CharacterSelect Page
 * Character selection and creation screen
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterCreatorModal } from '@/components/CharacterCreator/CharacterCreatorModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { logger } from '@/services/logger.service';

/**
 * Character selection page
 */
export const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  useAuthStore(); // Keep auth store hydrated
  const {
    characters,
    isLoading,
    error,
    loadCharacters,
    selectCharacter,
    deleteCharacter,
    canCreateCharacter,
    clearError,
  } = useCharacterStore();

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleSelectCharacter = async (id: string) => {
    try {
      await selectCharacter(id);
      navigate('/game');
    } catch (error) {
      logger.error('Failed to select character', error as Error, { context: 'CharacterSelect.handleSelectCharacter', characterId: id });
    }
  };

  const handleDeleteClick = (id: string) => {
    setCharacterToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCharacter(characterToDelete);
      setDeleteModalOpen(false);
      setCharacterToDelete(null);
    } catch (error) {
      logger.error('Failed to delete character', error as Error, { context: 'CharacterSelect.handleConfirmDelete', characterId: characterToDelete });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setCharacterToDelete(null);
    }
  };

  const handleCreateCharacter = () => {
    // Open character creator modal
    // Note: The button itself won't render if user can't create a character,
    // so no need for additional validation here
    setCreatorOpen(true);
  };

  // Find character to delete for modal display
  const characterToDeleteData = characters.find((c) => c._id === characterToDelete);

  return (
    <div className="min-h-screen bg-gradient-to-b from-desert-sand to-desert-stone py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-western text-wood-dark text-shadow-light mb-2">
            Your Characters
          </h1>
          <p className="text-lg text-wood-medium">
            Welcome back! Select a character to continue your journey.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && characters.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <Card variant="wood" className="bg-blood-red/20 border-2 border-blood-red">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blood-red flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <div className="flex-1">
                  <p className="text-blood-red font-semibold">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearError();
                      loadCharacters();
                    }}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Character Grid */}
        {!isLoading && characters.length === 0 && !error && (
          <div className="max-w-md mx-auto">
            <Card variant="wood" className="text-center">
              <div className="py-8">
                <div className="mb-4">
                  <svg
                    className="w-24 h-24 mx-auto text-desert-stone opacity-50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-western text-desert-sand mb-2">
                  No Characters Yet
                </h2>
                <p className="text-desert-stone mb-6">
                  Create your first character to begin your adventure in the Sangre Territory!
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateCharacter}
                  data-testid="create-first-character-button"
                >
                  Create Your First Character
                </Button>
              </div>
            </Card>
          </div>
        )}

        {!isLoading && characters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Characters */}
            {characters.map((character) => (
              <CharacterCard
                key={character._id}
                character={character}
                onSelect={handleSelectCharacter}
                onDelete={handleDeleteClick}
                showActions={true}
              />
            ))}

            {/* Create New Character Card */}
            {canCreateCharacter() && (
              <button
                onClick={handleCreateCharacter}
                className="focus:outline-none focus:ring-2 focus:ring-gold-medium rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Card
                  variant="wood"
                  className="h-full border-2 border-dashed border-wood-medium hover:border-gold-medium transition-colors"
                >
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gold-medium/20 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gold-medium"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-western text-desert-sand mb-1">
                        Create New Character
                      </h3>
                      <p className="text-sm text-desert-stone">
                        {3 - characters.length} slot{3 - characters.length !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            )}

            {/* Max Characters Reached */}
            {!canCreateCharacter() && (
              <Card variant="wood" className="border-2 border-wood-dark opacity-60">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-wood-dark/20 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-wood-dark"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-wood-dark mb-1">
                      Maximum Characters Reached
                    </h3>
                    <p className="text-sm text-desert-stone">
                      Delete a character to create a new one
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={creatorOpen}
        onClose={() => setCreatorOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Character?"
        size="sm"
        showCloseButton={!isDeleting}
      >
        {characterToDeleteData && (
          <div className="space-y-4">
            <p className="text-desert-sand">
              Are you sure you want to delete{' '}
              <span className="font-western text-gold-medium">
                {characterToDeleteData.name}
              </span>
              ?
            </p>
            <p className="text-sm text-blood-red font-semibold">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                fullWidth
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CharacterSelect;
