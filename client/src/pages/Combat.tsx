/**
 * Combat Page
 * Main combat interface with NPC selection and combat arena
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useCombatStore } from '@/store/useCombatStore';
import { NPCCard } from '@/components/game/NPCCard';
import { CombatArena } from '@/components/game/CombatArena';
import { CombatResultModal } from '@/components/game/CombatResultModal';
import { Button, EmptyState } from '@/components/ui';
import { CardGridSkeleton, StatSkeleton } from '@/components/ui/Skeleton';
import { NPCType, CombatResult, CombatStatus } from '@desperados/shared';
import { logger } from '@/services/logger.service';
import { dispatchCombatWon } from '@/utils/tutorialEvents';

type NPCFilterType = NPCType | 'ALL' | 'BOSS';

/**
 * Combat page with NPC selection and combat interface
 */
export const Combat: React.FC = () => {
  const {
    currentCharacter,
    isLoading: isCharacterLoading,
    error: characterError
  } = useCharacterStore();
  const {
    npcs,
    activeCombat,
    inCombat,
    combatStats,
    isProcessingCombat,
    isLoading: isCombatLoading,
    error: combatError,
    fetchNPCs,
    startCombat,
    fleeCombat,
    endCombat,
    fetchCombatStats,
    checkActiveCombat,
    // Sprint 2: Hold/Discard system
    roundState,
    heldCardIndices,
    startTurn,
    toggleHeldCard,
    confirmHold,
    rerollCard,
    peekNextCard,
    clearRoundState,
  } = useCombatStore();

  const isLoading = isCharacterLoading || isCombatLoading;
  const error = characterError || combatError;

  const [selectedFilter, setSelectedFilter] = useState<NPCFilterType>('ALL');
  const [showResultModal, setShowResultModal] = useState(false);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null);

  // Load NPCs and combat stats on mount
  useEffect(() => {
    fetchNPCs();
    fetchCombatStats();
    checkActiveCombat();
  }, [fetchNPCs, fetchCombatStats, checkActiveCombat]);

  // Check if combat ended after each turn
  useEffect(() => {
    if (activeCombat && activeCombat.status !== CombatStatus.ACTIVE) {
      // Combat ended, calculate result
      const npc = activeCombat.npc;
      const lootTable = npc?.lootTable;

      // Dispatch tutorial event if player won
      if (activeCombat.status === CombatStatus.PLAYER_VICTORY && npc) {
        dispatchCombatWon(npc._id || npc.name);
      }

      const result = {
        victory: activeCombat.status === CombatStatus.PLAYER_VICTORY,
        xpGained: activeCombat.status === CombatStatus.PLAYER_VICTORY ?
          (lootTable?.xpReward ?? 0) : 0,
        goldGained: activeCombat.status === CombatStatus.PLAYER_VICTORY && lootTable ?
          Math.floor(lootTable.goldMin + Math.random() * (lootTable.goldMax - lootTable.goldMin)) : 0,
        goldLost: activeCombat.status === CombatStatus.PLAYER_DEFEAT ? Math.floor((currentCharacter?.gold || 0) * 0.1) : 0,
        itemsLooted: activeCombat.status === CombatStatus.PLAYER_VICTORY && lootTable ? generateLoot(lootTable) : [],
        // Note: finalPlayerHP and finalNPCHP not in CombatResult type
        totalRounds: activeCombat.rounds.length,
        totalDamageDealt: activeCombat.rounds.reduce((sum, round) => sum + round.playerDamage, 0),
        totalDamageTaken: activeCombat.rounds.reduce((sum, round) => sum + round.npcDamage, 0),
      };

      setCombatResult(result as any);
      setShowResultModal(true);
    }
  }, [activeCombat, currentCharacter]);

  // Filter NPCs based on selected filter
  const filteredNPCs = (npcs || []).filter((npc) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'BOSS') return npc.isBoss;
    return npc.type === selectedFilter;
  });

  // Handle NPC challenge
  const handleChallenge = (npcId: string) => {
    setSelectedNPCId(npcId);
    setShowConfirmModal(true);
  };

  // Confirm and start combat
  const handleConfirmChallenge = async () => {
    if (!selectedNPCId) return;

    setShowConfirmModal(false);
    try {
      await startCombat(selectedNPCId, currentCharacter?._id || '');
    } catch (error) {
      logger.error('Failed to start combat from UI', error as Error, {
        npcId: selectedNPCId,
        characterId: currentCharacter?._id
      });
    }
    setSelectedNPCId(null);
  };

  // Sprint 2: Handle start turn
  const handleStartTurn = async () => {
    try {
      await startTurn();
    } catch (error) {
      logger.error('Failed to start turn from UI', error as Error);
    }
  };

  // Sprint 2: Handle toggle card selection
  const handleToggleCard = (index: number) => {
    toggleHeldCard(index);
  };

  // Sprint 2: Handle confirm hold
  const handleConfirmHold = async () => {
    try {
      await confirmHold();
    } catch (error) {
      logger.error('Failed to confirm hold from UI', error as Error);
    }
  };

  // Sprint 2: Handle reroll card
  const handleRerollCard = async (cardIndex: number) => {
    try {
      await rerollCard(cardIndex);
    } catch (error) {
      logger.error('Failed to reroll card from UI', error as Error);
    }
  };

  // Sprint 2: Handle peek next card
  const handlePeekNextCard = async () => {
    try {
      await peekNextCard();
    } catch (error) {
      logger.error('Failed to peek next card from UI', error as Error);
    }
  };

  // Handle flee
  const handleFlee = async () => {
    try {
      await fleeCombat();
    } catch (error) {
      logger.error('Failed to flee combat from UI', error as Error);
    }
  };

  // Handle combat result modal close
  const handleContinue = () => {
    setShowResultModal(false);
    setCombatResult(null);
    endCombat();
    clearRoundState(); // Sprint 2: Clear round state when combat ends
  };

  // Check if player can challenge (has enough energy)
  const canChallenge = (currentCharacter?.energy || 0) >= 10;

  // Loading state
  if (isLoading && npcs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-desert-sand to-desert-stone p-8">
        <div className="container mx-auto space-y-6" aria-busy="true" aria-live="polite">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-br from-wood-dark to-wood-medium border-4 border-leather-saddle rounded-lg p-6 shadow-wood space-y-4">
            <div className="h-10 w-64 bg-wood-darker/30 rounded animate-pulse" />
            <div className="h-5 w-96 bg-wood-darker/20 rounded animate-pulse" />
            <StatSkeleton count={4} />
          </div>

          {/* Filter Tabs Skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-wood-dark/30 rounded animate-pulse" />
            ))}
          </div>

          {/* NPC Grid Skeleton */}
          <CardGridSkeleton count={6} columns={3} />
        </div>
      </div>
    );
  }

  // Active combat view
  if (inCombat && activeCombat) {
    return (
      <>
        <CombatArena
          encounter={activeCombat}
          onFlee={handleFlee}
          isProcessingTurn={isProcessingCombat}
          // Sprint 2: Hold/Discard system
          roundState={roundState}
          heldCardIndices={heldCardIndices}
          onStartTurn={handleStartTurn}
          onToggleCard={handleToggleCard}
          onConfirmHold={handleConfirmHold}
          onRerollCard={handleRerollCard}
          onPeekNextCard={handlePeekNextCard}
        />

        {/* Combat Result Modal */}
        {showResultModal && combatResult && (
          <CombatResultModal
            result={combatResult}
            isOpen={showResultModal}
            onContinue={handleContinue}
          />
        )}
      </>
    );
  }

  // NPC selection view
  return (
    <div className="min-h-screen bg-gradient-to-b from-desert-sand to-desert-stone p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-wood-dark to-wood-medium border-4 border-leather-saddle rounded-lg p-6 shadow-wood">
          <h1 className="text-4xl font-western text-desert-sand mb-2">Combat Arena</h1>
          <p className="text-desert-dust font-serif">
            Challenge outlaws, wildlife, and lawmen to test your skills and earn rewards
          </p>

          {/* Combat Stats */}
          {combatStats && (
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div className="bg-wood-darker/50 rounded p-3">
                <div className="text-sm text-desert-dust font-serif">Win Rate</div>
                <div className="text-2xl font-western text-gold-light">
                  {(combatStats?.winRate ?? 0).toFixed(0)}%
                </div>
              </div>
              <div className="bg-wood-darker/50 rounded p-3">
                <div className="text-sm text-desert-dust font-serif">Victories</div>
                <div className="text-2xl font-western text-green-500">
                  {combatStats.victories}
                </div>
              </div>
              <div className="bg-wood-darker/50 rounded p-3">
                <div className="text-sm text-desert-dust font-serif">Defeats</div>
                <div className="text-2xl font-western text-blood-red">
                  {combatStats.defeats}
                </div>
              </div>
              <div className="bg-wood-darker/50 rounded p-3">
                <div className="text-sm text-desert-dust font-serif">Total Gold</div>
                <div className="text-2xl font-western text-gold-medium">
                  {combatStats.totalGoldGained}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OUTLAW', 'WILDLIFE', 'LAWMAN', 'BOSS'] as NPCFilterType[]).map((filter) => (
            <Button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              variant={selectedFilter === filter ? 'primary' : 'secondary'}
              className="font-western"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Energy Warning */}
        {!canChallenge && (
          <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4 text-center">
            <p className="text-wood-dark font-serif">
              Insufficient energy! You need at least 10 energy to start combat.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4 text-center">
            <p className="text-wood-dark font-serif">{error}</p>
          </div>
        )}

        {/* NPC Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNPCs.map((npc) => (
            <NPCCard
              key={npc._id}
              npc={npc}
              canChallenge={canChallenge}
              onChallenge={handleChallenge}
            />
          ))}
        </div>

        {filteredNPCs.length === 0 && (
          <EmptyState
            icon="⚔️"
            title="No Opponents Found"
            description="No outlaws or varmints matching that filter. Try a different category or check back later."
            variant="search"
            size="md"
          />
        )}
      </div>

      {/* Challenge Confirmation Modal */}
      {showConfirmModal && selectedNPCId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-modal-title"
          aria-describedby="challenge-modal-description"
        >
          <div className="bg-gradient-to-br from-desert-sand to-desert-dust border-4 border-wood-dark rounded-lg p-8 max-w-md shadow-2xl">
            <h2 id="challenge-modal-title" className="text-2xl font-western text-wood-dark mb-4">
              Challenge {npcs.find(n => n._id === selectedNPCId)?.name}?
            </h2>
            <p id="challenge-modal-description" className="text-wood-medium font-serif mb-6">
              This will cost 10 energy. Are you ready for combat?
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleConfirmChallenge}
                variant="primary"
                className="flex-1 font-western"
                aria-label={`Confirm challenge against ${npcs.find(n => n._id === selectedNPCId)?.name}`}
              >
                Yes, Challenge!
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedNPCId(null);
                }}
                variant="secondary"
                className="flex-1 font-western"
                aria-label="Cancel challenge"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate loot
function generateLoot(lootTable: any): any[] {
  const items: any[] = [];

  // Check if item drops
  const dropChance = Math.random() * 100;
  if (dropChance <= lootTable.itemChance) {
    // Determine rarity
    const rarityRoll = Math.random() * 100;
    let rarity = 'common';

    if (rarityRoll < lootTable.itemRarities.legendary) {
      rarity = 'legendary';
    } else if (rarityRoll < lootTable.itemRarities.legendary + lootTable.itemRarities.epic) {
      rarity = 'epic';
    } else if (rarityRoll < lootTable.itemRarities.legendary + lootTable.itemRarities.epic + lootTable.itemRarities.rare) {
      rarity = 'rare';
    } else if (rarityRoll < lootTable.itemRarities.legendary + lootTable.itemRarities.epic + lootTable.itemRarities.rare + lootTable.itemRarities.uncommon) {
      rarity = 'uncommon';
    }

    items.push({
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Loot`,
      rarity,
      type: 'misc',
      description: 'A valuable item from combat',
    });
  }

  return items;
}

export default Combat;
