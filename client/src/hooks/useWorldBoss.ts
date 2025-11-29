/**
 * useWorldBoss Hook
 * Handles world boss API operations for boss fights and encounters
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Enums
export enum BossPhase {
  IDLE = 'idle',
  ACTIVE = 'active',
  ENRAGED = 'enraged',
  DEFEATED = 'defeated',
}

export enum BossDifficulty {
  NORMAL = 'normal',
  HARD = 'hard',
  LEGENDARY = 'legendary',
}

// Interfaces
export interface BossStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  specialAttackCharge: number;
}

export interface BossReward {
  gold?: number;
  experience?: number;
  items?: Array<{
    itemId: string;
    name: string;
    quantity: number;
    rarity: string;
  }>;
  reputation?: {
    faction: string;
    amount: number;
  };
}

export interface WorldBoss {
  id: string;
  name: string;
  title: string;
  description: string;
  locationId: string;
  locationName: string;
  difficulty: BossDifficulty;
  level: number;
  stats: BossStats;
  phase: BossPhase;
  specialAbilities: string[];
  weaknesses: string[];
  immunities: string[];
  lootTable: BossReward[];
  spawnSchedule?: {
    dayOfWeek: number;
    hour: number;
    duration: number;
  };
  imageUrl?: string;
}

export interface BossStatus {
  bossId: string;
  bossName: string;
  isActive: boolean;
  currentHealth: number;
  maxHealth: number;
  phase: BossPhase;
  participantCount: number;
  timeRemaining?: number;
  nextSpawnTime?: string;
  topDamageDealer?: {
    characterId: string;
    characterName: string;
    damage: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  damage: number;
  attacks: number;
  lastAttackAt: string;
}

export interface ParticipantData {
  characterId: string;
  characterName: string;
  totalDamage: number;
  attackCount: number;
  lastAttackAt: string;
  rewards: BossReward[];
  rank: number;
}

export interface JoinBossResult {
  success: boolean;
  message: string;
  boss: WorldBoss;
  participantData: ParticipantData;
}

export interface AttackResult {
  success: boolean;
  message: string;
  damageDealt: number;
  criticalHit: boolean;
  bossRetaliation?: {
    damage: number;
    effect?: string;
  };
  bossHealthRemaining: number;
  bossPhase: BossPhase;
  isBossDefeated: boolean;
  rewards?: BossReward;
  cooldownRemaining: number;
}

export interface BossAvailability {
  bossId: string;
  isAvailable: boolean;
  reason?: string;
  nextAvailableAt?: string;
  requirements?: {
    minLevel?: number;
    requiredItems?: string[];
    requiredQuests?: string[];
  };
}

export interface BossEncounterSession {
  sessionId: string;
  bossId: string;
  characterId: string;
  startedAt: string;
  expiresAt: string;
  bossHealth: number;
  playerHealth: number;
  turnNumber: number;
  status: 'active' | 'victory' | 'defeat' | 'fled';
}

export interface InitiateEncounterResult {
  success: boolean;
  message: string;
  session: BossEncounterSession;
  boss: WorldBoss;
}

export interface EncounterAttackResult {
  success: boolean;
  message: string;
  damageDealt: number;
  damageReceived: number;
  criticalHit: boolean;
  bossAbilityUsed?: string;
  session: BossEncounterSession;
  rewards?: BossReward;
}

interface UseWorldBossReturn {
  // State
  bosses: WorldBoss[];
  selectedBoss: WorldBoss | null;
  bossStatus: BossStatus | null;
  leaderboard: LeaderboardEntry[];
  participantData: ParticipantData | null;
  encounterSession: BossEncounterSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllBosses: () => Promise<void>;
  fetchBossStatus: (bossId: string) => Promise<void>;
  fetchLeaderboard: (bossId: string) => Promise<void>;
  joinBossFight: (bossId: string) => Promise<JoinBossResult | null>;
  attackBoss: (bossId: string) => Promise<AttackResult | null>;
  fetchParticipantData: (bossId: string) => Promise<void>;
  checkBossAvailability: (bossId: string) => Promise<BossAvailability | null>;
  initiateEncounter: (bossId: string) => Promise<InitiateEncounterResult | null>;
  attackInEncounter: (sessionId: string) => Promise<EncounterAttackResult | null>;
  clearSelectedBoss: () => void;
  clearEncounterSession: () => void;
}

export const useWorldBoss = (): UseWorldBossReturn => {
  const [bosses, setBosses] = useState<WorldBoss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<WorldBoss | null>(null);
  const [bossStatus, setBossStatus] = useState<BossStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [encounterSession, setEncounterSession] = useState<BossEncounterSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all world bosses
  const fetchAllBosses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { bosses: WorldBoss[] } }>('/world-bosses');
      setBosses(response.data.data.bosses);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch world bosses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch boss status
  const fetchBossStatus = useCallback(async (bossId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { status: BossStatus } }>(
        `/world-bosses/${bossId}/status`
      );
      setBossStatus(response.data.data.status);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch boss status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch damage leaderboard
  const fetchLeaderboard = useCallback(async (bossId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
        `/world-bosses/${bossId}/leaderboard`
      );
      setLeaderboard(response.data.data.leaderboard);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join a boss fight
  const joinBossFight = useCallback(
    async (bossId: string): Promise<JoinBossResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: JoinBossResult }>(
          `/world-bosses/${bossId}/join`
        );
        setSelectedBoss(response.data.data.boss);
        setParticipantData(response.data.data.participantData);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to join boss fight');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Attack the boss
  const attackBoss = useCallback(
    async (bossId: string): Promise<AttackResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: AttackResult }>(
          `/world-bosses/${bossId}/attack`
        );
        await refreshCharacter();

        // Update boss status with new health
        if (bossStatus) {
          setBossStatus({
            ...bossStatus,
            currentHealth: response.data.data.bossHealthRemaining,
            phase: response.data.data.bossPhase,
          });
        }

        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to attack boss');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCharacter, bossStatus]
  );

  // Fetch participant data
  const fetchParticipantData = useCallback(async (bossId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { participant: ParticipantData } }>(
        `/world-bosses/${bossId}/participant`
      );
      setParticipantData(response.data.data.participant);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch participant data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check boss availability
  const checkBossAvailability = useCallback(
    async (bossId: string): Promise<BossAvailability | null> => {
      try {
        const response = await api.get<{ data: { availability: BossAvailability } }>(
          `/world-bosses/encounters/${bossId}/availability`
        );
        return response.data.data.availability;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to check boss availability');
        return null;
      }
    },
    []
  );

  // Initiate boss encounter (solo session)
  const initiateEncounter = useCallback(
    async (bossId: string): Promise<InitiateEncounterResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: InitiateEncounterResult }>(
          `/world-bosses/encounters/${bossId}/initiate`
        );
        setEncounterSession(response.data.data.session);
        setSelectedBoss(response.data.data.boss);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to initiate encounter');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Attack in encounter session
  const attackInEncounter = useCallback(
    async (sessionId: string): Promise<EncounterAttackResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: EncounterAttackResult }>(
          `/world-bosses/encounters/${sessionId}/attack`
        );
        setEncounterSession(response.data.data.session);
        await refreshCharacter();
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to attack in encounter');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCharacter]
  );

  // Clear selected boss
  const clearSelectedBoss = useCallback(() => {
    setSelectedBoss(null);
    setBossStatus(null);
    setLeaderboard([]);
    setParticipantData(null);
  }, []);

  // Clear encounter session
  const clearEncounterSession = useCallback(() => {
    setEncounterSession(null);
  }, []);

  return {
    // State
    bosses,
    selectedBoss,
    bossStatus,
    leaderboard,
    participantData,
    encounterSession,
    isLoading,
    error,

    // Actions
    fetchAllBosses,
    fetchBossStatus,
    fetchLeaderboard,
    joinBossFight,
    attackBoss,
    fetchParticipantData,
    checkBossAvailability,
    initiateEncounter,
    attackInEncounter,
    clearSelectedBoss,
    clearEncounterSession,
  };
};

export default useWorldBoss;
