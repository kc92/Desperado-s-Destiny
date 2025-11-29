/**
 * ActionChallenge Page
 * Main gameplay interface for attempting actions and resolving challenges
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useActionStore } from '@/store/useActionStore';
import { ActionCard } from '@/components/game/ActionCard';
import { CardHand } from '@/components/game/CardHand';
import { HandEvaluation } from '@/components/game/HandEvaluation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui';
import { Action, ActionType } from '@desperados/shared';

/**
 * Main action challenge page
 */
export const ActionChallenge: React.FC = () => {
  const {
    currentCharacter,
  } = useCharacterStore();
  const {
    actions,
    currentChallenge,
    isChallengingAction,
    isLoading,
    error,
    fetchActions,
    attemptAction,
    clearChallenge,
  } = useActionStore();

  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [filterType, setFilterType] = useState<ActionType | 'ALL'>('ALL');

  // Load actions on mount
  useEffect(() => {
    if (currentCharacter) {
      fetchActions(currentCharacter.locationId);
    }
  }, [currentCharacter, fetchActions]);

  // Show result modal when challenge completes
  useEffect(() => {
    if (currentChallenge && !isChallengingAction) {
      setIsRevealing(true);
      setShowResultModal(true);
    }
  }, [currentChallenge, isChallengingAction]);

  // Handle action selection
  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setShowConfirmModal(true);
  };

  // Handle challenge attempt
  const handleAttemptChallenge = async () => {
    if (!selectedAction) return;

    setShowConfirmModal(false);
    await attemptAction(selectedAction._id);
  };

  // Handle result modal close
  const handleCloseResult = () => {
    setShowResultModal(false);
    setIsRevealing(false);
    clearChallenge();
    setSelectedAction(null);
  };

  // Filter actions by type
  const filteredActions = filterType === 'ALL'
    ? actions
    : actions.filter(action => action.type === filterType);

  if (!currentCharacter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-western text-wood-dark mb-4">No Character Selected</h2>
          <p className="text-wood-medium">Please select a character to attempt actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-western text-wood-dark mb-2">Available Actions</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-wood-medium">Character:</span>
            <span className="text-xl font-bold text-wood-dark">{currentCharacter.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-wood-medium">Energy:</span>
            <span className="text-xl font-bold text-gold-medium">
              {currentCharacter.energy} / {currentCharacter.maxEnergy} ⚡
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-blood-red/20 border-2 border-blood-red rounded-lg">
          <p className="text-blood-red font-semibold">{error}</p>
        </div>
      )}

      {/* Action Type Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={filterType === 'ALL' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterType('ALL')}
        >
          All Actions
        </Button>
        <Button
          variant={filterType === ActionType.CRIME ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterType(ActionType.CRIME)}
        >
          💰 Crime
        </Button>
        <Button
          variant={filterType === ActionType.COMBAT ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterType(ActionType.COMBAT)}
        >
          ⚔️ Combat
        </Button>
        <Button
          variant={filterType === ActionType.CRAFT ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterType(ActionType.CRAFT)}
        >
          🔨 Craft
        </Button>
        <Button
          variant={filterType === ActionType.SOCIAL ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterType(ActionType.SOCIAL)}
        >
          🎭 Social
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Actions Grid */}
      {!isLoading && filteredActions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-wood-medium text-lg">No actions available in this category.</p>
        </div>
      )}

      {!isLoading && filteredActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action) => (
            <ActionCard
              key={action._id}
              action={action}
              canAfford={currentCharacter.energy >= action.energyCost}
              currentEnergy={currentCharacter.energy}
              onAttempt={handleActionSelect}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Attempt Action"
        size="md"
      >
        {selectedAction && (
          <div className="space-y-4">
            <p className="text-wood-dark text-lg">
              Are you sure you want to attempt <strong>{selectedAction.name}</strong>?
            </p>

            <div className="parchment p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-wood-medium">Energy Cost:</span>
                <span className="font-bold text-gold-dark">{selectedAction.energyCost} ⚡</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wood-medium">Target Score:</span>
                <span className="font-bold text-gold-dark">{selectedAction.targetScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wood-medium">Difficulty:</span>
                <span className="font-bold text-blood-red">{selectedAction.difficulty}/10</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleAttemptChallenge}
                disabled={isChallengingAction}
                isLoading={isChallengingAction}
              >
                Attempt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={handleCloseResult}
        title={currentChallenge?.success ? 'Success!' : 'Failure'}
        size="xl"
        showCloseButton={false}
      >
        {currentChallenge && (
          <div className="space-y-6">
            {/* Card Hand */}
            <div className="flex justify-center py-4">
              <CardHand
                cards={currentChallenge.hand}
                isRevealing={isRevealing}
                onRevealComplete={() => {
                  // Card reveal complete
                }}
                size="md"
              />
            </div>

            {/* Hand Evaluation */}
            {isRevealing && (
              <HandEvaluation
                handRank={currentChallenge.handEvaluation.rank}
                handScore={currentChallenge.handEvaluation.score}
                suitBonuses={currentChallenge.suitBonuses}
                totalScore={currentChallenge.totalScore}
              />
            )}

            {/* Result Summary */}
            <div
              className={`
                p-6 rounded-lg border-4
                ${currentChallenge.success
                  ? 'bg-green-100 border-green-600'
                  : 'bg-red-100 border-red-600'
                }
              `}
            >
              <h3
                className={`
                  text-2xl font-western text-center mb-4
                  ${currentChallenge.success ? 'text-green-800' : 'text-red-800'}
                `}
              >
                {currentChallenge.success ? 'Action Succeeded!' : 'Action Failed'}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Target Score:</span>
                  <span className="text-xl font-bold">{currentChallenge.action.targetScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Your Score:</span>
                  <span className="text-xl font-bold">{currentChallenge.totalScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Margin:</span>
                  <span
                    className={`text-xl font-bold ${
                      currentChallenge.margin >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {currentChallenge.margin >= 0 ? '+' : ''}{currentChallenge.margin}
                  </span>
                </div>
              </div>

              {/* Rewards */}
              {currentChallenge.success && currentChallenge.rewards && (
                <div className="mt-4 pt-4 border-t-2 border-green-600/30">
                  <h4 className="font-semibold mb-2">Rewards Earned:</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gold-dark font-bold">+{currentChallenge.rewards.xp}</span>
                      <span>XP</span>
                    </div>
                    {currentChallenge.rewards.gold && currentChallenge.rewards.gold > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-gold-dark font-bold">+{currentChallenge.rewards.gold}</span>
                        <span>Gold</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleCloseResult}
            >
              Continue
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActionChallenge;
