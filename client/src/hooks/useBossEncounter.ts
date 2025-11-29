/**
 * useBossEncounter Hook
 * Manages individual boss encounters (separate from world boss events)
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Boss difficulty
export type BossDifficulty = 'NORMAL' | 'HARD' | 'NIGHTMARE' | 'LEGENDARY';

// Boss phase
export type BossPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'ENRAGED';

// Combat action
export type BossCombatAction = 'attack' | 'defend' | 'item' | 'flee';

// Boss encounter definition
export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  difficulty: BossDifficulty;
  levelRequirement: number;
  locations: string[];
  spawnConditions: BossSpawnCondition[];
  baseStats: BossStats;
  phases: BossPhaseDefinition[];
  abilities: BossAbility[];
  rewards: BossReward[];
  respawnCooldown: number; // hours
  energyCost: number;
  imageUrl?: string;
}

// Spawn condition
export interface BossSpawnCondition {
  type: 'LEVEL' | 'QUEST' | 'REPUTATION' | 'ACHIEVEMENT' | 'TIME' | 'WEATHER';
  value: string;
  required: boolean;
  description: string;
}

// Boss stats
export interface BossStats {
  health: number;
  damage: number;
  defense: number;
  speed: number;
  critChance: number;
  resistances: Record<string, number>;
}

// Phase definition
export interface BossPhaseDefinition {
  phase: BossPhase;
  healthThreshold: number;
  name: string;
  description: string;
  statModifiers: Partial<BossStats>;
  newAbilities: string[];
  specialEvent?: string;
}

// Boss ability
export interface BossAbility {
  id: string;
  name: string;
  description: string;
  damage?: number;
  effect?: string;
  cooldown: number;
  phaseOnly?: BossPhase;
  targetType: 'SINGLE' | 'AOE' | 'SELF';
}

// Boss reward
export interface BossReward {
  type: 'ITEM' | 'GOLD' | 'XP' | 'REPUTATION' | 'ACHIEVEMENT' | 'UNLOCK';
  id?: string;
  name: string;
  amount?: number;
  chance: number;
  guaranteed: boolean;
  firstKillOnly?: boolean;
}

// Boss discovery status
export interface BossDiscovery {
  bossId: string;
  characterId: string;
  discovered: boolean;
  firstDiscoveredAt?: string;
  encountersAttempted: number;
  victories: number;
  defeats: number;
  bestTime?: number;
  lastVictoryAt?: string;
  lastAttemptAt?: string;
}

// Boss availability
export interface BossAvailability {
  bossId: string;
  available: boolean;
  reason?: string;
  requirements: {
    met: boolean;
    missing?: string[];
  };
  cooldown?: {
    active: boolean;
    remainingHours: number;
    availableAt: string;
  };
}

// Boss session
export interface BossSession {
  sessionId: string;
  bossId: string;
  characterId: string;
  partyMemberIds: string[];
  bossHealth: number;
  bossMaxHealth: number;
  characterHealth: number;
  characterMaxHealth: number;
  currentPhase: BossPhase;
  roundNumber: number;
  activeEffects: BossStatusEffect[];
  abilitiesOnCooldown: string[];
  startedAt: string;
  lastActionAt: string;
}

// Status effect
export interface BossStatusEffect {
  id: string;
  name: string;
  type: 'BUFF' | 'DEBUFF';
  duration: number;
  effect: string;
  source: 'BOSS' | 'PLAYER';
}

// Combat round result
export interface BossCombatRound {
  success: boolean;
  message: string;
  playerAction: BossActionResult;
  bossAction: BossActionResult;
  playerDamageDealt: number;
  playerDamageTaken: number;
  bossHealth: number;
  characterHealth: number;
  phaseChanged: boolean;
  newPhase?: BossPhase;
  combatEnded: boolean;
  victory?: boolean;
  rewards?: BossReward[];
  session: BossSession | null;
}

// Action result
export interface BossActionResult {
  type: string;
  name: string;
  damage: number;
  effect?: string;
  critical: boolean;
  blocked?: boolean;
}

// Encounter history entry
export interface EncounterHistoryEntry {
  sessionId: string;
  bossId: string;
  bossName: string;
  victory: boolean;
  duration: number;
  damageDealt: number;
  damageTaken: number;
  finalPhase: BossPhase;
  rewards: BossReward[];
  completedAt: string;
}

// Leaderboard entry
export interface BossLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  bestTime: number;
  victories: number;
  totalDamageDealt: number;
  achievedAt: string;
}

// Boss with discovery progress
export interface BossWithProgress {
  boss: BossEncounter;
  discovery: BossDiscovery;
  availability: BossAvailability;
}

// Initiate encounter result
export interface InitiateEncounterResult {
  success: boolean;
  message: string;
  session?: BossSession;
  boss?: BossEncounter;
}

interface UseBossEncounterReturn {
  bosses: BossWithProgress[];
  currentSession: BossSession | null;
  activeEncounter: BossSession | null;
  isLoading: boolean;
  error: string | null;

  // Discovery & Information
  fetchAllBosses: () => Promise<void>;
  fetchBossDetails: (bossId: string) => Promise<BossWithProgress | null>;
  fetchActiveEncounter: () => Promise<BossSession | null>;
  checkAvailability: (bossId: string) => Promise<BossAvailability | null>;
  fetchEncounterHistory: (bossId: string) => Promise<EncounterHistoryEntry[]>;
  getLeaderboard: (bossId: string, limit?: number) => Promise<BossLeaderboardEntry[]>;

  // Combat
  initiateEncounter: (bossId: string, location: string, partyMemberIds?: string[]) => Promise<InitiateEncounterResult>;
  getEncounterSession: (sessionId: string) => Promise<BossSession | null>;
  processAttack: (sessionId: string, action: BossCombatAction, targetId?: string, itemId?: string) => Promise<BossCombatRound>;
  abandonEncounter: (sessionId: string) => Promise<{ success: boolean; message: string }>;

  clearError: () => void;
}

export const useBossEncounter = (): UseBossEncounterReturn => {
  const [bosses, setBosses] = useState<BossWithProgress[]>([]);
  const [currentSession, setCurrentSession] = useState<BossSession | null>(null);
  const [activeEncounter, setActiveEncounter] = useState<BossSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all bosses with progress
  const fetchAllBosses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { bosses: BossWithProgress[] } }>(
        '/boss-encounters'
      );
      setBosses(response.data.data.bosses || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch bosses';
      setError(errorMessage);
      console.error('[useBossEncounter] Fetch bosses error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specific boss details
  const fetchBossDetails = useCallback(async (bossId: string): Promise<BossWithProgress | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { boss: BossWithProgress } }>(
        `/boss-encounters/${bossId}`
      );
      return response.data.data.boss;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch boss details';
      setError(errorMessage);
      console.error('[useBossEncounter] Fetch boss details error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch active encounter if any
  const fetchActiveEncounter = useCallback(async (): Promise<BossSession | null> => {
    try {
      const response = await api.get<{ data: { session: BossSession | null } }>(
        '/boss-encounters/active'
      );
      const session = response.data.data.session;
      setActiveEncounter(session);
      if (session) {
        setCurrentSession(session);
      }
      return session;
    } catch (err: any) {
      console.error('[useBossEncounter] Fetch active encounter error:', err);
      return null;
    }
  }, []);

  // Check boss availability
  const checkAvailability = useCallback(async (bossId: string): Promise<BossAvailability | null> => {
    try {
      const response = await api.get<{ data: { availability: BossAvailability } }>(
        `/boss-encounters/${bossId}/availability`
      );
      return response.data.data.availability;
    } catch (err: any) {
      console.error('[useBossEncounter] Check availability error:', err);
      return null;
    }
  }, []);

  // Fetch encounter history
  const fetchEncounterHistory = useCallback(async (bossId: string): Promise<EncounterHistoryEntry[]> => {
    try {
      const response = await api.get<{ data: { history: EncounterHistoryEntry[] } }>(
        `/boss-encounters/${bossId}/history`
      );
      return response.data.data.history || [];
    } catch (err: any) {
      console.error('[useBossEncounter] Fetch history error:', err);
      return [];
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback(async (
    bossId: string,
    limit: number = 10
  ): Promise<BossLeaderboardEntry[]> => {
    try {
      const response = await api.get<{ data: { leaderboard: BossLeaderboardEntry[] } }>(
        `/boss-encounters/${bossId}/leaderboard`,
        { params: { limit } }
      );
      return response.data.data.leaderboard || [];
    } catch (err: any) {
      console.error('[useBossEncounter] Get leaderboard error:', err);
      return [];
    }
  }, []);

  // Initiate boss encounter
  const initiateEncounter = useCallback(async (
    bossId: string,
    location: string,
    partyMemberIds?: string[]
  ): Promise<InitiateEncounterResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: InitiateEncounterResult }>(
        `/boss-encounters/${bossId}/initiate`,
        { location, partyMemberIds }
      );
      const result = response.data.data;

      if (result.session) {
        setCurrentSession(result.session);
        setActiveEncounter(result.session);
      }

      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate encounter';
      setError(errorMessage);
      console.error('[useBossEncounter] Initiate encounter error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Get encounter session
  const getEncounterSession = useCallback(async (sessionId: string): Promise<BossSession | null> => {
    try {
      const response = await api.get<{ data: { session: BossSession } }>(
        `/boss-encounters/sessions/${sessionId}`
      );
      const session = response.data.data.session;
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      console.error('[useBossEncounter] Get session error:', err);
      return null;
    }
  }, []);

  // Process attack in combat
  const processAttack = useCallback(async (
    sessionId: string,
    action: BossCombatAction,
    targetId?: string,
    itemId?: string
  ): Promise<BossCombatRound> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: BossCombatRound }>(
        `/boss-encounters/sessions/${sessionId}/attack`,
        { action, targetId, itemId }
      );
      const result = response.data.data;

      setCurrentSession(result.session);

      if (result.combatEnded) {
        setActiveEncounter(null);
        await refreshCharacter();
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to process attack';
      setError(errorMessage);
      console.error('[useBossEncounter] Process attack error:', err);
      return {
        success: false,
        message: errorMessage,
        playerAction: { type: 'error', name: 'Error', damage: 0, critical: false },
        bossAction: { type: 'error', name: 'Error', damage: 0, critical: false },
        playerDamageDealt: 0,
        playerDamageTaken: 0,
        bossHealth: 0,
        characterHealth: 0,
        phaseChanged: false,
        combatEnded: false,
        session: currentSession,
      };
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, refreshCharacter]);

  // Abandon encounter
  const abandonEncounter = useCallback(async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/boss-encounters/sessions/${sessionId}/abandon`
      );

      setCurrentSession(null);
      setActiveEncounter(null);
      await refreshCharacter();

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to abandon encounter';
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bosses,
    currentSession,
    activeEncounter,
    isLoading,
    error,
    fetchAllBosses,
    fetchBossDetails,
    fetchActiveEncounter,
    checkAvailability,
    fetchEncounterHistory,
    getLeaderboard,
    initiateEncounter,
    getEncounterSession,
    processAttack,
    abandonEncounter,
    clearError,
  };
};

export default useBossEncounter;
