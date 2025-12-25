/**
 * useLegendaryHunt Hook
 * Manages legendary animal hunt mechanics including discovery, tracking, and combat
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Discovery status
export type DiscoveryStatus = 'UNKNOWN' | 'RUMORED' | 'TRACKED' | 'DISCOVERED' | 'HUNTED' | 'DEFEATED';

// Legendary animal category
export type LegendaryCategory = 'APEX_PREDATOR' | 'MYTHICAL' | 'RARE' | 'LEGENDARY';

// Combat action
export type HuntAction = 'attack' | 'special' | 'defend' | 'item' | 'flee';

// Legendary animal definition
export interface LegendaryAnimal {
  id: string;
  name: string;
  description: string;
  category: LegendaryCategory;
  locations: string[];
  levelRequirement: number;
  reputationRequirement?: {
    faction: string;
    reputation: number;
  };
  spawnConditions: SpawnCondition[];
  baseStats: LegendaryStats;
  abilities: LegendaryAbility[];
  rewards: LegendaryReward[];
  lore: string;
  imageUrl?: string;
}

// Spawn condition
export interface SpawnCondition {
  type: 'TIME' | 'WEATHER' | 'SEASON' | 'MOON_PHASE' | 'REPUTATION' | 'QUEST';
  value: string;
  description: string;
}

// Legendary animal stats
export interface LegendaryStats {
  health: number;
  damage: number;
  defense: number;
  speed: number;
  critChance: number;
}

// Legendary ability
export interface LegendaryAbility {
  id: string;
  name: string;
  description: string;
  damage?: number;
  effect?: string;
  cooldown: number;
  phaseThreshold?: number;
}

// Legendary reward
export interface LegendaryReward {
  type: 'ITEM' | 'GOLD' | 'XP' | 'REPUTATION' | 'TROPHY' | 'UNLOCK';
  id?: string;
  name: string;
  amount?: number;
  chance: number;
  guaranteed: boolean;
}

// Hunt record for a character
export interface LegendaryHuntRecord {
  legendaryId: string;
  characterId: string;
  discoveryStatus: DiscoveryStatus;
  cluesFound: number;
  totalClues: number;
  rumorsHeard: number;
  encountersAttempted: number;
  wins: number;
  losses: number;
  bestTime?: number;
  lastEncounterAt?: string;
  firstDiscoveredAt?: string;
  firstDefeatedAt?: string;
  trophiesCollected: LegendaryTrophy[];
}

// Legendary trophy
export interface LegendaryTrophy {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  obtainedAt: string;
  displayValue: number;
}

// Hunt session
export interface LegendaryHuntSession {
  sessionId: string;
  legendaryId: string;
  characterId: string;
  legendaryHealth: number;
  legendaryMaxHealth: number;
  characterHealth: number;
  characterMaxHealth: number;
  currentPhase: number;
  totalPhases: number;
  roundNumber: number;
  activeEffects: StatusEffect[];
  abilitiesOnCooldown: string[];
  startedAt: string;
  lastActionAt: string;
}

// Status effect
export interface StatusEffect {
  id: string;
  name: string;
  type: 'BUFF' | 'DEBUFF';
  duration: number;
  effect: string;
}

// Combat turn result
export interface HuntTurnResult {
  success: boolean;
  message: string;
  playerAction: CombatAction;
  legendaryAction: CombatAction;
  playerDamageDealt: number;
  playerDamageTaken: number;
  legendaryHealth: number;
  characterHealth: number;
  phaseChanged: boolean;
  newPhase?: number;
  combatEnded: boolean;
  victory?: boolean;
  rewards?: LegendaryReward[];
  session: LegendaryHuntSession | null;
}

// Combat action
export interface CombatAction {
  type: string;
  name: string;
  damage: number;
  effect?: string;
  critical: boolean;
}

// Difficulty rating
export interface DifficultyRating {
  legendaryId: string;
  characterLevel: number;
  overallDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME' | 'IMPOSSIBLE';
  ratingScore: number;
  factors: DifficultyFactor[];
  recommendedLevel: number;
  recommendedGear: string[];
  tips: string[];
}

// Difficulty factor
export interface DifficultyFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Leaderboard entry
export interface HuntLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  bestTime: number;
  wins: number;
  trophiesCollected: number;
  achievedAt: string;
}

// Clue discovery result
export interface ClueDiscoveryResult {
  success: boolean;
  message: string;
  clueNumber: number;
  totalClues: number;
  clueText: string;
  discoveryProgress: number;
  newStatus?: DiscoveryStatus;
}

// Rumor result
export interface RumorResult {
  success: boolean;
  message: string;
  rumorText: string;
  newStatus?: DiscoveryStatus;
  rumorCount: number;
}

// Initiate hunt result
export interface InitiateHuntResult {
  success: boolean;
  message: string;
  session?: LegendaryHuntSession;
  legendary?: LegendaryAnimal;
}

interface UseLegendaryHuntReturn {
  legendaries: LegendaryWithProgress[];
  currentSession: LegendaryHuntSession | null;
  trophies: LegendaryTrophy[];
  isLoading: boolean;
  error: string | null;

  // Discovery & Information
  fetchLegendaries: (filters?: { category?: string; location?: string; discoveryStatus?: DiscoveryStatus }) => Promise<void>;
  fetchLegendary: (legendaryId: string) => Promise<LegendaryWithProgress | null>;
  fetchTrophies: () => Promise<void>;
  getDifficultyRating: (legendaryId: string) => Promise<DifficultyRating | null>;
  getLeaderboard: (legendaryId: string, limit?: number) => Promise<HuntLeaderboardEntry[]>;

  // Clue & Rumor Discovery
  discoverClue: (legendaryId: string, location: string) => Promise<ClueDiscoveryResult>;
  hearRumor: (legendaryId: string, npcId: string) => Promise<RumorResult>;

  // Hunt Combat
  initiateHunt: (legendaryId: string, location: string) => Promise<InitiateHuntResult>;
  executeHuntTurn: (sessionId: string, action: HuntAction, itemId?: string) => Promise<HuntTurnResult>;
  getHuntSession: (sessionId: string) => Promise<LegendaryHuntSession | null>;
  abandonHunt: (sessionId: string) => Promise<{ success: boolean; message: string }>;

  // Rewards
  claimRewards: (legendaryId: string, sessionId?: string) => Promise<{ success: boolean; message: string; rewards?: LegendaryReward[] }>;

  clearError: () => void;
}

// Legendary with character progress
export interface LegendaryWithProgress {
  legendary: LegendaryAnimal;
  record?: LegendaryHuntRecord;
  available: boolean;
  canSpawn: boolean;
}

export const useLegendaryHunt = (): UseLegendaryHuntReturn => {
  const [legendaries, setLegendaries] = useState<LegendaryWithProgress[]>([]);
  const [currentSession, setCurrentSession] = useState<LegendaryHuntSession | null>(null);
  const [trophies, setTrophies] = useState<LegendaryTrophy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all legendary animals with progress
  const fetchLegendaries = useCallback(async (filters?: {
    category?: string;
    location?: string;
    discoveryStatus?: DiscoveryStatus;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { legendaries: LegendaryWithProgress[] } }>(
        '/legendary-hunts',
        { params: filters }
      );
      setLegendaries(response.data.data.legendaries || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch legendaries';
      setError(errorMessage);
      logger.error('Fetch legendaries error', err as Error, { context: 'useLegendaryHunt' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specific legendary with progress
  const fetchLegendary = useCallback(async (legendaryId: string): Promise<LegendaryWithProgress | null> => {
    try {
      const response = await api.get<{ data: { legendary: LegendaryWithProgress } }>(
        `/legendary-hunts/${legendaryId}`
      );
      return response.data.data.legendary;
    } catch (err: any) {
      logger.error('Fetch legendary error', err as Error, { context: 'useLegendaryHunt' });
      return null;
    }
  }, []);

  // Fetch all trophies
  const fetchTrophies = useCallback(async () => {
    try {
      const response = await api.get<{ data: { trophies: LegendaryTrophy[] } }>(
        '/legendary-hunts/trophies'
      );
      setTrophies(response.data.data.trophies || []);
    } catch (err: any) {
      logger.error('Fetch trophies error', err as Error, { context: 'useLegendaryHunt' });
    }
  }, []);

  // Get difficulty rating
  const getDifficultyRating = useCallback(async (legendaryId: string): Promise<DifficultyRating | null> => {
    try {
      const response = await api.get<{ data: { rating: DifficultyRating } }>(
        `/legendary-hunts/${legendaryId}/difficulty`
      );
      return response.data.data.rating;
    } catch (err: any) {
      logger.error('Get difficulty rating error', err as Error, { context: 'useLegendaryHunt' });
      return null;
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback(async (
    legendaryId: string,
    limit: number = 10
  ): Promise<HuntLeaderboardEntry[]> => {
    try {
      const response = await api.get<{ data: { leaderboard: HuntLeaderboardEntry[] } }>(
        `/legendary-hunts/${legendaryId}/leaderboard`,
        { params: { limit } }
      );
      return response.data.data.leaderboard || [];
    } catch (err: any) {
      logger.error('Get leaderboard error', err as Error, { context: 'useLegendaryHunt' });
      return [];
    }
  }, []);

  // Discover a clue
  const discoverClue = useCallback(async (
    legendaryId: string,
    location: string
  ): Promise<ClueDiscoveryResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: ClueDiscoveryResult }>(
        `/legendary-hunts/${legendaryId}/discover-clue`,
        { location }
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to discover clue';
      setError(errorMessage);
      logger.error('Discover clue error', err as Error, { context: 'useLegendaryHunt' });
      return { success: false, message: errorMessage, clueNumber: 0, totalClues: 0, clueText: '', discoveryProgress: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hear a rumor from NPC
  const hearRumor = useCallback(async (
    legendaryId: string,
    npcId: string
  ): Promise<RumorResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: RumorResult }>(
        `/legendary-hunts/${legendaryId}/hear-rumor`,
        { npcId }
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to hear rumor';
      setError(errorMessage);
      logger.error('Hear rumor error', err as Error, { context: 'useLegendaryHunt' });
      return { success: false, message: errorMessage, rumorText: '', rumorCount: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiate a legendary hunt
  const initiateHunt = useCallback(async (
    legendaryId: string,
    location: string
  ): Promise<InitiateHuntResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: InitiateHuntResult }>(
        `/legendary-hunts/${legendaryId}/initiate`,
        { location }
      );
      const result = response.data.data;

      if (result.session) {
        setCurrentSession(result.session);
      }

      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate hunt';
      setError(errorMessage);
      logger.error('Initiate hunt error', err as Error, { context: 'useLegendaryHunt' });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Execute a turn in combat
  const executeHuntTurn = useCallback(async (
    sessionId: string,
    action: HuntAction,
    itemId?: string
  ): Promise<HuntTurnResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: HuntTurnResult }>(
        `/legendary-hunts/combat/${sessionId}/attack`,
        { action, itemId }
      );
      const result = response.data.data;

      setCurrentSession(result.session);

      if (result.combatEnded) {
        await refreshCharacter();
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to execute turn';
      setError(errorMessage);
      logger.error('Execute turn error', err as Error, { context: 'useLegendaryHunt' });
      return {
        success: false,
        message: errorMessage,
        playerAction: { type: 'error', name: 'Error', damage: 0, critical: false },
        legendaryAction: { type: 'error', name: 'Error', damage: 0, critical: false },
        playerDamageDealt: 0,
        playerDamageTaken: 0,
        legendaryHealth: 0,
        characterHealth: 0,
        phaseChanged: false,
        combatEnded: false,
        session: currentSession,
      };
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, refreshCharacter]);

  // Get hunt session
  const getHuntSession = useCallback(async (sessionId: string): Promise<LegendaryHuntSession | null> => {
    try {
      const response = await api.get<{ data: { session: LegendaryHuntSession } }>(
        `/legendary-hunts/combat/${sessionId}`
      );
      const session = response.data.data.session;
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      logger.error('Get session error', err as Error, { context: 'useLegendaryHunt' });
      return null;
    }
  }, []);

  // Abandon hunt
  const abandonHunt = useCallback(async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ data: { message: string } }>(
        `/legendary-hunts/combat/${sessionId}`
      );

      setCurrentSession(null);
      await refreshCharacter();

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to abandon hunt';
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Claim rewards
  const claimRewards = useCallback(async (
    legendaryId: string,
    sessionId?: string
  ): Promise<{ success: boolean; message: string; rewards?: LegendaryReward[] }> => {
    try {
      const response = await api.post<{ data: { message: string; rewards: LegendaryReward[] } }>(
        `/legendary-hunts/${legendaryId}/claim-rewards`,
        { sessionId }
      );
      const { message, rewards } = response.data.data;

      await refreshCharacter();
      await fetchTrophies();

      return { success: true, message, rewards };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to claim rewards';
      return { success: false, message: errorMessage };
    }
  }, [fetchTrophies, refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    legendaries,
    currentSession,
    trophies,
    isLoading,
    error,
    fetchLegendaries,
    fetchLegendary,
    fetchTrophies,
    getDifficultyRating,
    getLeaderboard,
    discoverClue,
    hearRumor,
    initiateHunt,
    executeHuntTurn,
    getHuntSession,
    abandonHunt,
    claimRewards,
    clearError,
  };
};

export default useLegendaryHunt;
