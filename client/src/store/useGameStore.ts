/**
 * Game Store - Unified Export
 *
 * This file re-exports all domain-specific stores for backward compatibility.
 * For new code, prefer importing from the specific store directly:
 *
 * import { useCharacterStore } from '@/store/useCharacterStore';
 * import { useEnergyStore } from '@/store/useEnergyStore';
 * import { useActionStore } from '@/store/useActionStore';
 * import { useSkillStore } from '@/store/useSkillStore';
 * import { useCombatStore } from '@/store/useCombatStore';
 * import { useCrimeStore } from '@/store/useCrimeStore';
 */

// Re-export all domain stores
export { useCharacterStore } from './useCharacterStore';
export { useEnergyStore } from './useEnergyStore';
export { useActionStore } from './useActionStore';
export { useSkillStore } from './useSkillStore';
export { useCombatStore } from './useCombatStore';
export { useCrimeStore } from './useCrimeStore';

// For backward compatibility, create a combined hook
import { useCharacterStore } from './useCharacterStore';
import { useEnergyStore } from './useEnergyStore';
import { useActionStore } from './useActionStore';
import { useSkillStore } from './useSkillStore';
import { useCombatStore } from './useCombatStore';
import { useCrimeStore } from './useCrimeStore';

/**
 * Combined game store hook for backward compatibility
 *
 * @deprecated Use individual stores instead for better performance
 */
export const useGameStore = () => {
  const character = useCharacterStore();
  const energy = useEnergyStore();
  const action = useActionStore();
  const skill = useSkillStore();
  const combat = useCombatStore();
  const crime = useCrimeStore();

  return {
    // Character state
    characters: character.characters,
    currentCharacter: character.currentCharacter,
    currentLocation: character.currentLocation,
    isLoading: character.isLoading || action.isLoading || skill.isLoading || combat.isLoading || crime.isLoading,
    error: character.error || action.error || skill.error || combat.error || crime.error,
    lastAction: character.lastAction,

    // Energy state
    energy: energy.energy,
    energyTimerId: energy.energyTimerId,

    // Action state
    actions: action.actions,
    currentChallenge: action.currentChallenge,
    isChallengingAction: action.isChallengingAction,

    // Skill state
    skills: skill.skills,
    skillData: skill.skillData,
    currentTraining: skill.currentTraining,
    skillBonuses: skill.skillBonuses,
    isTrainingSkill: skill.isTrainingSkill,
    skillsPollingInterval: skill.skillsPollingInterval,

    // Combat state
    npcs: combat.npcs,
    activeCombat: combat.activeCombat,
    inCombat: combat.inCombat,
    combatHistory: combat.combatHistory,
    combatStats: combat.combatStats,
    isProcessingCombat: combat.isProcessingCombat,

    // Crime state
    crime: crime.crime,

    // Character actions
    loadCharacters: character.loadCharacters,
    createCharacter: character.createCharacter,
    selectCharacter: async (id: string) => {
      await character.selectCharacter(id);
      const char = character.currentCharacter;
      if (char) {
        energy.initializeEnergy(char.energy, char.maxEnergy || 100, 1, false);
      }
    },
    deleteCharacter: character.deleteCharacter,
    loadSelectedCharacter: async () => {
      await character.loadSelectedCharacter();
      const char = character.currentCharacter;
      if (char) {
        energy.initializeEnergy(char.energy, char.maxEnergy || 100, 1, false);
      }
    },
    updateCharacter: character.updateCharacter,
    setLocation: character.setLocation,
    setLoading: character.setLoading,
    setError: character.setError,
    clearError: character.clearError,
    setLastAction: character.setLastAction,
    clearGameState: () => {
      character.clearCharacterState();
      energy.clearEnergyState();
      action.clearActionState();
      skill.clearSkillState();
      combat.clearCombatState();
      crime.clearCrimeState();
    },
    hasCharacters: character.hasCharacters,
    canCreateCharacter: character.canCreateCharacter,
    refreshCharacter: character.refreshCharacter,

    // Energy actions
    initializeEnergy: energy.initializeEnergy,
    updateEnergy: energy.updateEnergy,
    deductEnergy: energy.deductEnergy,
    startEnergyTimer: energy.startEnergyTimer,
    stopEnergyTimer: energy.stopEnergyTimer,
    syncEnergyWithBackend: async () => {
      if (character.currentCharacter) {
        await energy.syncEnergyWithBackend(character.currentCharacter._id);
      }
    },

    // Action actions
    fetchActions: action.fetchActions,
    attemptAction: async (actionId: string) => {
      if (!character.currentCharacter) {
        character.setError('No character selected');
        return null;
      }
      const result = await action.attemptAction(actionId, character.currentCharacter._id);
      if (result) {
        character.updateCharacter({
          energy: character.currentCharacter.energy - result.energySpent,
          experience: result.success && result.rewards
            ? character.currentCharacter.experience + result.rewards.xp
            : character.currentCharacter.experience,
          gold: result.success && result.rewards
            ? character.currentCharacter.gold + (result.rewards?.gold ?? 0)
            : character.currentCharacter.gold,
        });
      }
      return result;
    },
    clearChallenge: action.clearChallenge,

    // Skill actions
    fetchSkills: skill.fetchSkills,
    startTraining: skill.startTraining,
    cancelTraining: skill.cancelTraining,
    completeTraining: skill.completeTraining,
    startSkillsPolling: skill.startSkillsPolling,
    stopSkillsPolling: skill.stopSkillsPolling,

    // Combat actions
    fetchNPCs: combat.fetchNPCs,
    startCombat: async (npcId: string) => {
      if (!character.currentCharacter) {
        character.setError('No character selected');
        return;
      }
      await combat.startCombat(npcId, character.currentCharacter._id);
    },
    playTurn: combat.playTurn,
    fleeCombat: combat.fleeCombat,
    endCombat: combat.endCombat,
    fetchCombatHistory: combat.fetchCombatHistory,
    fetchCombatStats: combat.fetchCombatStats,
    checkActiveCombat: combat.checkActiveCombat,

    // Crime actions
    checkJailStatus: crime.checkJailStatus,
    checkWantedStatus: crime.checkWantedStatus,
    payBail: async () => {
      const result = await crime.payBail();
      if (result.success && character.currentCharacter) {
        character.updateCharacter({ gold: result.newGold });
      }
    },
    layLow: async (useGold: boolean) => {
      const result = await crime.layLow(useGold);
      if (result.success && result.newGold !== undefined && character.currentCharacter) {
        character.updateCharacter({ gold: result.newGold });
      }
    },
    arrestPlayer: async (targetId: string) => {
      try {
        const result = await crime.arrestPlayer(targetId);
        if (result.success && character.currentCharacter) {
          character.updateCharacter({ gold: result.newGold });
        }
        return result.success;
      } catch {
        return false;
      }
    },
    fetchBounties: crime.fetchBounties,
    startJailTimer: crime.startJailTimer,
    stopJailTimer: crime.stopJailTimer,
    loadCrimeStatus: crime.loadCrimeStatus,
  };
};

export default useGameStore;
