/**
 * useHorses Hook
 * Handles horse management, care, training, and breeding operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// ============================================================================
// ENUMS
// ============================================================================

export enum HorseBreed {
  // Common Breeds
  QUARTER_HORSE = 'QUARTER_HORSE',
  MUSTANG = 'MUSTANG',
  PAINT_HORSE = 'PAINT_HORSE',
  MORGAN = 'MORGAN',
  APPALOOSA = 'APPALOOSA',

  // Quality Breeds
  TENNESSEE_WALKER = 'TENNESSEE_WALKER',
  AMERICAN_STANDARDBRED = 'AMERICAN_STANDARDBRED',
  MISSOURI_FOX_TROTTER = 'MISSOURI_FOX_TROTTER',
  THOROUGHBRED = 'THOROUGHBRED',
  ARABIAN = 'ARABIAN',

  // Rare Breeds
  ANDALUSIAN = 'ANDALUSIAN',
  FRIESIAN = 'FRIESIAN',
  AKHAL_TEKE = 'AKHAL_TEKE',
  PERCHERON = 'PERCHERON',
  LEGENDARY_WILD_STALLION = 'LEGENDARY_WILD_STALLION',
}

export enum HorseGender {
  STALLION = 'stallion',
  MARE = 'mare',
  GELDING = 'gelding',
}

export enum HorseColor {
  BAY = 'BAY',
  BLACK = 'BLACK',
  CHESTNUT = 'CHESTNUT',
  BROWN = 'BROWN',
  WHITE = 'WHITE',
  GRAY = 'GRAY',
  PALOMINO = 'PALOMINO',
  BUCKSKIN = 'BUCKSKIN',
  DAPPLE_GRAY = 'DAPPLE_GRAY',
  ROAN = 'ROAN',
  PINTO = 'PINTO',
  APPALOOSA_SPOTTED = 'APPALOOSA_SPOTTED',
  PAINT = 'PAINT',
  CREMELLO = 'CREMELLO',
  GOLDEN = 'GOLDEN',
  SILVER_DAPPLE = 'SILVER_DAPPLE',
}

export enum HorseCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  INJURED = 'injured',
}

export enum HorseSkill {
  SPEED_BURST = 'SPEED_BURST',
  SURE_FOOTED = 'SURE_FOOTED',
  WAR_HORSE = 'WAR_HORSE',
  TRICK_HORSE = 'TRICK_HORSE',
  DRAFT_TRAINING = 'DRAFT_TRAINING',
  RACING_FORM = 'RACING_FORM',
  STEALTH = 'STEALTH',
  ENDURANCE = 'ENDURANCE',
}

export enum BondLevel {
  STRANGER = 'STRANGER',
  ACQUAINTANCE = 'ACQUAINTANCE',
  PARTNER = 'PARTNER',
  COMPANION = 'COMPANION',
  BONDED = 'BONDED',
}

export enum HorseRarity {
  COMMON = 'COMMON',
  QUALITY = 'QUALITY',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY',
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface HorseStats {
  speed: number;
  stamina: number;
  health: number;
  bravery: number;
  temperament: number;
}

export interface HorseDerivedStats {
  carryCapacity: number;
  travelSpeedBonus: number;
  combatBonus: number;
}

export interface HorseBond {
  level: number;
  trust: number;
  loyalty: boolean;
  lastInteraction: string;
}

export interface HorseTraining {
  trainedSkills: HorseSkill[];
  maxSkills: number;
  trainingProgress: Record<HorseSkill, number>;
}

export interface HorseEquipment {
  saddle?: string;
  saddlebags?: string;
  horseshoes?: string;
  barding?: string;
}

export interface HorseConditionState {
  currentHealth: number;
  currentStamina: number;
  hunger: number;
  cleanliness: number;
  mood: HorseCondition;
}

export interface HorseBreeding {
  birthDate?: string;
  sire?: string;
  dam?: string;
  foals: string[];
  isPregnant?: boolean;
  pregnantBy?: string;
  dueDate?: string;
  breedingCooldown?: string;
}

export interface HorseHistory {
  purchasePrice: number;
  purchaseDate: string;
  acquisitionMethod: 'purchase' | 'tame' | 'breed' | 'gift' | 'steal';
  racesWon: number;
  racesEntered: number;
  combatVictories: number;
  combatsEntered: number;
  distanceTraveled: number;
}

export interface Horse {
  _id: string;
  ownerId: string;
  name: string;
  breed: HorseBreed;
  gender: HorseGender;
  age: number;
  color: HorseColor;
  stats: HorseStats;
  derivedStats: HorseDerivedStats;
  bond: HorseBond;
  training: HorseTraining;
  equipment: HorseEquipment;
  condition: HorseConditionState;
  breeding?: HorseBreeding;
  history: HorseHistory;
  currentLocation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HorseResponse {
  horse: Horse;
  bondLevelName: BondLevel;
  canBreed: boolean;
  canTrain: boolean;
  needsCare: string[];
}

export interface HorseListResponse {
  horses: HorseResponse[];
  totalCount: number;
  activeHorse?: string;
}

export interface BondStatusResponse {
  horse: Horse;
  bondLevel: BondLevel;
  bondProgress: number;
  trustProgress: number;
  loyalty: boolean;
  nextLevelAt: number;
  bonuses: {
    speed: number;
    stamina: number;
    bravery: number;
  };
}

export interface HorseBreedingResult {
  success: boolean;
  message: string;
  foal?: {
    breed: HorseBreed;
    gender: HorseGender;
    color: HorseColor;
    predictedStats: HorseStats;
    isExceptional: boolean;
    specialTrait?: string;
  };
  dueDate?: string;
}

export interface HorseLineage {
  horse: Horse;
  sire?: Horse;
  dam?: Horse;
  siblings: Horse[];
  offspring: Horse[];
  generation: number;
}

export interface PurchaseHorseData {
  breed: HorseBreed;
  gender?: HorseGender;
  name: string;
}

export interface FeedHorseData {
  foodQuality: 'basic' | 'quality' | 'premium';
}

export interface TrainHorseData {
  skill: HorseSkill;
}

export interface BreedHorsesData {
  stallionId: string;
  mareId: string;
}

/**
 * Action result type
 */
interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

interface UseHorsesReturn {
  // State
  horses: HorseResponse[];
  selectedHorse: HorseResponse | null;
  activeHorseId: string | null;
  bondStatus: BondStatusResponse | null;
  lineage: HorseLineage | null;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchHorses: () => Promise<void>;
  fetchHorse: (horseId: string) => Promise<void>;
  fetchBondStatus: (horseId: string) => Promise<void>;
  fetchLineage: (horseId: string) => Promise<void>;

  // Horse operations
  purchaseHorse: (data: PurchaseHorseData) => Promise<ActionResult<Horse>>;
  activateHorse: (horseId: string) => Promise<ActionResult>;
  feedHorse: (horseId: string, data: FeedHorseData) => Promise<ActionResult>;
  groomHorse: (horseId: string) => Promise<ActionResult>;
  trainHorse: (horseId: string, data: TrainHorseData) => Promise<ActionResult>;
  breedHorses: (data: BreedHorsesData) => Promise<ActionResult<HorseBreedingResult>>;

  // UI helpers
  clearSelectedHorse: () => void;
  clearError: () => void;
}

export const useHorses = (): UseHorsesReturn => {
  const [horses, setHorses] = useState<HorseResponse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<HorseResponse | null>(null);
  const [activeHorseId, setActiveHorseId] = useState<string | null>(null);
  const [bondStatus, setBondStatus] = useState<BondStatusResponse | null>(null);
  const [lineage, setLineage] = useState<HorseLineage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch all owned horses
   */
  const fetchHorses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: HorseListResponse }>('/horses');
      setHorses(response.data.data.horses || []);
      setActiveHorseId(response.data.data.activeHorse || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch horses';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a specific horse
   */
  const fetchHorse = useCallback(async (horseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: HorseResponse }>(`/horses/${horseId}`);
      setSelectedHorse(response.data.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch horse details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch bond status for a horse
   */
  const fetchBondStatus = useCallback(async (horseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: BondStatusResponse }>(
        `/horses/${horseId}/bond`
      );
      setBondStatus(response.data.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch bond status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch breeding lineage for a horse
   */
  const fetchLineage = useCallback(async (horseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: HorseLineage }>(
        `/horses/${horseId}/lineage`
      );
      setLineage(response.data.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch lineage';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a new horse
   */
  const purchaseHorse = useCallback(
    async (data: PurchaseHorseData): Promise<ActionResult<Horse>> => {
      try {
        const response = await api.post<{ data: { message: string; horse: Horse } }>(
          '/horses/purchase',
          data
        );
        await refreshCharacter();
        await fetchHorses();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.horse,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to purchase horse';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchHorses]
  );

  /**
   * Set a horse as active (currently riding)
   */
  const activateHorse = useCallback(
    async (horseId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/horses/${horseId}/activate`
        );
        setActiveHorseId(horseId);
        await fetchHorses();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to activate horse';
        return { success: false, message: errorMessage };
      }
    },
    [fetchHorses]
  );

  /**
   * Feed a horse
   */
  const feedHorse = useCallback(
    async (horseId: string, data: FeedHorseData): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/horses/${horseId}/feed`,
          data
        );
        await refreshCharacter();
        await fetchHorse(horseId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to feed horse';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchHorse]
  );

  /**
   * Groom a horse
   */
  const groomHorse = useCallback(
    async (horseId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/horses/${horseId}/groom`
        );
        await fetchHorse(horseId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to groom horse';
        return { success: false, message: errorMessage };
      }
    },
    [fetchHorse]
  );

  /**
   * Train a horse skill
   */
  const trainHorse = useCallback(
    async (horseId: string, data: TrainHorseData): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/horses/${horseId}/train`,
          data
        );
        await refreshCharacter();
        await fetchHorse(horseId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to train horse';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchHorse]
  );

  /**
   * Breed two horses
   */
  const breedHorses = useCallback(
    async (data: BreedHorsesData): Promise<ActionResult<HorseBreedingResult>> => {
      try {
        const response = await api.post<{
          data: { message: string; result: HorseBreedingResult };
        }>('/horses/breed', data);
        await refreshCharacter();
        await fetchHorses();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to breed horses';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchHorses]
  );

  /**
   * Clear selected horse
   */
  const clearSelectedHorse = useCallback(() => {
    setSelectedHorse(null);
    setBondStatus(null);
    setLineage(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    horses,
    selectedHorse,
    activeHorseId,
    bondStatus,
    lineage,
    isLoading,
    error,

    // Fetch operations
    fetchHorses,
    fetchHorse,
    fetchBondStatus,
    fetchLineage,

    // Horse operations
    purchaseHorse,
    activateHorse,
    feedHorse,
    groomHorse,
    trainHorse,
    breedHorses,

    // UI helpers
    clearSelectedHorse,
    clearError,
  };
};

export default useHorses;
