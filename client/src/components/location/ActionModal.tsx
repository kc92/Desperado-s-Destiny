/**
 * Action Modal Component
 *
 * A modal wrapper for executing actions (crimes, jobs, etc.) inline at locations.
 * Uses the DeckGame component for the action challenge.
 * Integrates with the permadeath system via LastStandModal.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DeckGame, GameState, DeckGameResult, ActionResult } from '@/components/game/deckgames';
import { Button } from '@/components/ui';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { logger } from '@/services/logger.service';
import { dispatchJobCompleted } from '@/utils/tutorialEvents';
import { tutorialService } from '@/services/tutorial.service';
import { LastStandModal } from '@/components/death/LastStandModal';
import type {
  Action,
  MortalDangerResult,
  KarmaJudgement,
  DivineSalvation,
  PermadeathOutcome,
} from '@desperados/shared';

interface ActionModalProps {
  action: Action;
  onClose: () => void;
  onComplete: (success: boolean, rewards?: { gold?: number; xp?: number; items?: any[] }) => void;
}

// Default karma judgement for when backend doesn't provide one
const defaultKarmaJudgement: KarmaJudgement = {
  gamblerScore: 50,
  outlawScore: 50,
  faithLevel: 50,
  sinLevel: 50,
  dimensions: {
    mercy: 50, cruelty: 50, greed: 50, charity: 50, justice: 50,
    chaos: 50, honor: 50, deception: 50, survival: 50, loyalty: 50
  }
};

export const ActionModal: React.FC<ActionModalProps> = ({
  action,
  onClose,
  onComplete,
}) => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const { playSound } = useSoundEffects();

  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<{
    gameState: GameState;
    actionInfo: {
      name: string;
      type: string;
      difficulty: number;
      energyCost: number;
      rewards: any;
    };
  } | null>(null);

  // Last Stand / Permadeath state
  const [showLastStand, setShowLastStand] = useState(false);
  const [lastStandData, setLastStandData] = useState<{
    karmaJudgement: KarmaJudgement;
    salvation: DivineSalvation | null;
    permadeath: PermadeathOutcome | null;
  } | null>(null);
  const [pendingResult, setPendingResult] = useState<{
    success: boolean;
    rewards?: { gold?: number; xp?: number; items?: any[] };
  } | null>(null);

  // Start the action when the modal opens
  useEffect(() => {
    const startAction = async () => {
      if (!currentCharacter) {
        setError('No character selected');
        setIsStarting(false);
        return;
      }

      try {
        const response = await api.post('/actions/start', {
          actionId: action.id || action._id
        });

        const { data } = response.data;

        setActiveGame({
          gameState: {
            gameId: data.gameId,
            gameType: data.gameType,
            status: 'waiting_action',
            hand: data.hand,
            turnNumber: data.turnNumber,
            maxTurns: data.maxTurns,
            timeLimit: data.timeLimit,
            relevantSuit: data.relevantSuit,
            difficulty: data.difficulty,
            availableActions: data.availableActions
          },
          actionInfo: data.action
        });

        setIsStarting(false);
      } catch (err: any) {
        logger.error('Failed to start action from ActionModal', err, { actionId: action._id });
        setError(err.response?.data?.error || 'Failed to start action');
        setIsStarting(false);
      }
    };

    startAction();
  }, [action, currentCharacter]);

  // Handle game completion
  const handleGameComplete = (result: { gameResult: DeckGameResult; actionResult?: ActionResult }) => {
    // Check for mortal danger / Last Stand trigger
    const mortalDanger = (result.actionResult as any)?.mortalDangerResult as MortalDangerResult | undefined;

    if (mortalDanger?.lastStandTriggered) {
      // Store pending result and show Last Stand modal
      setPendingResult({
        success: result.gameResult.success,
        rewards: result.actionResult ? {
          gold: result.actionResult.rewardsGained.gold,
          xp: result.actionResult.rewardsGained.xp,
          items: result.actionResult.rewardsGained.items
        } : undefined
      });

      setLastStandData({
        karmaJudgement: (result.actionResult as any)?.karmaJudgement || defaultKarmaJudgement,
        salvation: mortalDanger.divineIntervention || null,
        permadeath: mortalDanger.deathOutcome || null,
      });

      // Play ominous sound for danger
      playSound('notification');

      setShowLastStand(true);
      return; // Don't complete yet - wait for Last Stand acknowledgement
    }

    // Dispatch tutorial event
    if (result.gameResult.success && (action.id || action._id)) {
      dispatchJobCompleted(action.id || action._id);

      if (currentCharacter?._id) {
        tutorialService.advanceStep(currentCharacter._id, `complete-job-${action.id || action._id}`)
          .catch((err) => {
            logger.warn('[ActionModal] Failed to advance tutorial', { error: err });
          });
      }
    }

    // Play sounds
    if (result.gameResult.success) {
      playSound('success');
      if (result.actionResult?.rewardsGained.gold) {
        setTimeout(() => playSound('gold_gained'), 300);
      }
      if (result.actionResult?.rewardsGained.xp) {
        setTimeout(() => playSound('xp_gained'), 600);
      }
    } else {
      playSound('failure');
    }

    // Refresh character
    refreshCharacter();

    // Sync energy
    const energyStore = useEnergyStore.getState();
    if (result.actionResult?.energyRemaining !== undefined) {
      energyStore.updateEnergy(result.actionResult.energyRemaining);
    } else if ((result.actionResult as { character?: { energy?: number } })?.character?.energy !== undefined) {
      energyStore.updateEnergy((result.actionResult as { character?: { energy?: number } }).character!.energy!);
    }

    // Call onComplete with results
    onComplete(
      result.gameResult.success,
      result.actionResult ? {
        gold: result.actionResult.rewardsGained.gold,
        xp: result.actionResult.rewardsGained.xp,
        items: result.actionResult.rewardsGained.items
      } : undefined
    );
  };

  // Handle Last Stand acknowledgement
  const handleLastStandAcknowledge = useCallback(() => {
    setShowLastStand(false);

    // Refresh character state (may be dead now)
    refreshCharacter();

    // Complete the action with stored result
    if (pendingResult) {
      // If permadeath occurred, the character is dead
      const wasSaved = lastStandData?.salvation !== null;

      if (!wasSaved && lastStandData?.permadeath) {
        // Character died - redirect to character select
        logger.info('[ActionModal] Character died in Last Stand', {
          characterId: lastStandData.permadeath.characterId,
          characterName: lastStandData.permadeath.characterName
        });
        // Force failure result since character died
        onComplete(false);
      } else {
        // Character survived - complete normally
        onComplete(pendingResult.success, pendingResult.rewards);
      }
    }

    // Clean up
    setLastStandData(null);
    setPendingResult(null);
  }, [pendingResult, lastStandData, refreshCharacter, onComplete]);

  // Handle forfeit
  const handleGameForfeit = () => {
    onComplete(false);
  };

  // Loading/starting state
  if (isStarting) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-wood-dark p-8 rounded-lg border-2 border-gold-light text-center">
          <div className="animate-spin text-4xl mb-4">🎴</div>
          <p className="text-gold-light font-western text-xl">Preparing {action.name}...</p>
          <p className="text-desert-sand text-sm mt-2">Shuffling the deck...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-wood-dark p-8 rounded-lg border-2 border-red-600 text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 font-western text-xl">Failed to Start</p>
          <p className="text-desert-sand text-sm mt-2">{error}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Game state
  if (activeGame) {
    return (
      <>
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DeckGame
              initialState={activeGame.gameState}
              actionInfo={activeGame.actionInfo}
              onComplete={handleGameComplete}
              onForfeit={handleGameForfeit}
              context="action"
            />
          </div>
        </div>

        {/* Last Stand Modal - Permadeath System */}
        {showLastStand && lastStandData && (
          <LastStandModal
            isOpen={showLastStand}
            karmaJudgement={lastStandData.karmaJudgement}
            salvation={lastStandData.salvation}
            permadeath={lastStandData.permadeath}
            onClose={() => setShowLastStand(false)}
            onAcknowledge={handleLastStandAcknowledge}
          />
        )}
      </>
    );
  }

  // Show Last Stand modal even if game is complete
  if (showLastStand && lastStandData) {
    return (
      <LastStandModal
        isOpen={showLastStand}
        karmaJudgement={lastStandData.karmaJudgement}
        salvation={lastStandData.salvation}
        permadeath={lastStandData.permadeath}
        onClose={() => setShowLastStand(false)}
        onAcknowledge={handleLastStandAcknowledge}
      />
    );
  }

  return null;
};

export default ActionModal;
