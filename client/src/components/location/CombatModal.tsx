/**
 * Combat Modal Component
 *
 * A modal wrapper for combat encounters inline at locations.
 * Uses the CombatArena component for the actual combat.
 * Integrates with the permadeath system via LastStandModal.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { CombatArena } from '@/components/game/CombatArena';
import { CombatResultModal } from '@/components/game/CombatResultModal';
import { Button } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useCombatStore } from '@/store/useCombatStore';
import { logger } from '@/services/logger.service';
import { dispatchCombatWon } from '@/utils/tutorialEvents';
import { LastStandModal } from '@/components/death/LastStandModal';
import type {
  NPC,
  CombatResult,
  MortalDangerResult,
  KarmaJudgement,
  DivineSalvation,
  PermadeathOutcome,
} from '@desperados/shared';

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

interface CombatModalProps {
  npc: NPC;
  onClose: () => void;
  onComplete: (victory: boolean, rewards?: { gold?: number; xp?: number; items?: any[] }) => void;
}

export const CombatModal: React.FC<CombatModalProps> = ({
  npc,
  onClose,
  onComplete,
}) => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const {
    activeCombat,
    inCombat,
    isProcessingCombat,
    startCombat,
    fleeCombat,
    endCombat,
    // Sprint 2: Hold/Discard system
    roundState,
    heldCardIndices,
    startTurn,
    toggleHeldCard,
    confirmHold,
    rerollCard,
    peekNextCard,
    clearRoundState,
    // Combat end state
    combatEnded,
    lootAwarded,
    deathPenalty,
  } = useCombatStore();

  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);

  // Last Stand / Permadeath state
  const [showLastStand, setShowLastStand] = useState(false);
  const [lastStandData, setLastStandData] = useState<{
    karmaJudgement: KarmaJudgement;
    salvation: DivineSalvation | null;
    permadeath: PermadeathOutcome | null;
  } | null>(null);

  // Start combat when modal opens
  useEffect(() => {
    const initCombat = async () => {
      if (!currentCharacter?._id) {
        setError('No character selected');
        setIsStarting(false);
        return;
      }

      try {
        await startCombat(npc._id || '', currentCharacter._id);
        setIsStarting(false);
      } catch (err: any) {
        logger.error('Failed to start combat from CombatModal', err, {
          npcId: npc._id,
          characterId: currentCharacter._id
        });
        setError(err.message || 'Failed to start combat');
        setIsStarting(false);
      }
    };

    initCombat();
  }, [npc, currentCharacter, startCombat]);

  // Watch for combat end
  useEffect(() => {
    if (combatEnded && !showResultModal && !showLastStand) {
      const isVictory = !!lootAwarded;

      // Check for mortal danger / Last Stand trigger
      const mortalDanger = (deathPenalty as any)?.mortalDangerResult as MortalDangerResult | undefined;

      if (mortalDanger?.lastStandTriggered) {
        // Show Last Stand modal instead of regular result
        setLastStandData({
          karmaJudgement: (deathPenalty as any)?.karmaJudgement || defaultKarmaJudgement,
          salvation: mortalDanger.divineIntervention || null,
          permadeath: mortalDanger.deathOutcome || null,
        });
        setShowLastStand(true);
        return; // Don't show regular result modal
      }

      const result = {
        victory: isVictory,
        xpGained: lootAwarded?.xp ?? 0,
        goldGained: lootAwarded?.gold ?? 0,
        goldLost: deathPenalty?.goldLost ?? 0,
        itemsLooted: lootAwarded?.items ?? [],
        totalRounds: activeCombat?.rounds?.length ?? 0,
        totalDamageDealt: activeCombat?.rounds?.reduce((sum, round) => sum + round.playerDamage, 0) ?? 0,
        totalDamageTaken: activeCombat?.rounds?.reduce((sum, round) => sum + round.npcDamage, 0) ?? 0,
      };

      // Dispatch tutorial event if player won
      if (isVictory) {
        dispatchCombatWon(npc._id || npc.name);
      }

      setCombatResult(result as any);
      setShowResultModal(true);
    }
  }, [combatEnded, lootAwarded, deathPenalty, activeCombat, showResultModal, showLastStand, npc]);

  // Handle Last Stand acknowledgement
  const handleLastStandAcknowledge = useCallback(() => {
    setShowLastStand(false);

    // Refresh character state (may be dead now)
    refreshCharacter();

    // If permadeath occurred, the character is dead
    const wasSaved = lastStandData?.salvation !== null;

    if (!wasSaved && lastStandData?.permadeath) {
      // Character died - redirect to character select
      logger.info('[CombatModal] Character died in Last Stand', {
        characterId: lastStandData.permadeath.characterId,
        characterName: lastStandData.permadeath.characterName
      });
      endCombat();
      clearRoundState();
      onComplete(false);
    } else {
      // Character survived - show regular result
      const result = {
        victory: false,
        xpGained: 0,
        goldGained: 0,
        goldLost: deathPenalty?.goldLost ?? 0,
        itemsLooted: [],
        totalRounds: activeCombat?.rounds?.length ?? 0,
        totalDamageDealt: activeCombat?.rounds?.reduce((sum, round) => sum + round.playerDamage, 0) ?? 0,
        totalDamageTaken: activeCombat?.rounds?.reduce((sum, round) => sum + round.npcDamage, 0) ?? 0,
        salvationMessage: lastStandData?.salvation?.message,
      };
      setCombatResult(result as any);
      setShowResultModal(true);
    }

    setLastStandData(null);
  }, [lastStandData, refreshCharacter, endCombat, clearRoundState, onComplete, deathPenalty, activeCombat]);

  // Handle combat actions
  const handleStartTurn = async () => {
    try {
      await startTurn();
    } catch (error) {
      logger.error('Failed to start turn', error as Error);
    }
  };

  const handleToggleCard = (index: number) => {
    toggleHeldCard(index);
  };

  const handleConfirmHold = async () => {
    try {
      await confirmHold();
    } catch (error) {
      logger.error('Failed to confirm hold', error as Error);
    }
  };

  const handleRerollCard = async (cardIndex: number) => {
    try {
      await rerollCard(cardIndex);
    } catch (error) {
      logger.error('Failed to reroll card', error as Error);
    }
  };

  const handlePeekNextCard = async () => {
    try {
      await peekNextCard();
    } catch (error) {
      logger.error('Failed to peek next card', error as Error);
    }
  };

  const handleFlee = async () => {
    try {
      await fleeCombat();
      await refreshCharacter();
      onComplete(false);
    } catch (error) {
      logger.error('Failed to flee combat', error as Error);
    }
  };

  // Handle result modal close
  const handleContinue = async () => {
    setShowResultModal(false);

    const isVictory = !!lootAwarded;

    endCombat();
    clearRoundState();
    await refreshCharacter();

    onComplete(
      isVictory,
      isVictory && lootAwarded ? {
        gold: lootAwarded.gold,
        xp: lootAwarded.xp,
        items: lootAwarded.items
      } : undefined
    );
  };

  // Loading state
  if (isStarting) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-wood-dark p-8 rounded-lg border-2 border-gold-light text-center">
          <div className="animate-pulse text-4xl mb-4">⚔️</div>
          <p className="text-gold-light font-western text-xl">Preparing Combat...</p>
          <p className="text-desert-sand text-sm mt-2">
            Facing {npc.name}
          </p>
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
          <p className="text-red-500 font-western text-xl">Combat Failed</p>
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

  // Result modal
  if (showResultModal && combatResult) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <CombatResultModal
          result={combatResult}
          isOpen={showResultModal}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  // Last Stand modal (permadeath system)
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

  // Combat arena
  if (inCombat && activeCombat) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto relative">
          {/* Close/Back button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 text-desert-stone hover:text-red-500 text-2xl"
            title="Close (combat will continue)"
          >
            ✕
          </button>

          <CombatArena
            encounter={activeCombat}
            onFlee={handleFlee}
            isProcessingTurn={isProcessingCombat}
            // Sprint 2: Hold/Discard props
            roundState={roundState}
            heldCardIndices={heldCardIndices}
            onStartTurn={handleStartTurn}
            onToggleCard={handleToggleCard}
            onConfirmHold={handleConfirmHold}
            onRerollCard={handleRerollCard}
            onPeekNextCard={handlePeekNextCard}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default CombatModal;
