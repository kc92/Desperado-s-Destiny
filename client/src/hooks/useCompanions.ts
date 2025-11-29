/**
 * useCompanions Hook
 * Handles animal companion management, taming, training, and combat operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// ============================================================================
// ENUMS
// ============================================================================

export enum CompanionCategory {
  DOG = 'DOG',
  BIRD = 'BIRD',
  EXOTIC = 'EXOTIC',
  SUPERNATURAL = 'SUPERNATURAL',
}

export enum CompanionSpecies {
  // Dogs
  AUSTRALIAN_SHEPHERD = 'AUSTRALIAN_SHEPHERD',
  CATAHOULA_LEOPARD_DOG = 'CATAHOULA_LEOPARD_DOG',
  BLOODHOUND = 'BLOODHOUND',
  GERMAN_SHEPHERD = 'GERMAN_SHEPHERD',
  COLLIE = 'COLLIE',
  PITBULL = 'PITBULL',
  COYDOG = 'COYDOG',
  WOLF_HYBRID = 'WOLF_HYBRID',

  // Birds
  RED_TAILED_HAWK = 'RED_TAILED_HAWK',
  GOLDEN_EAGLE = 'GOLDEN_EAGLE',
  RAVEN = 'RAVEN',

  // Exotic
  RACCOON = 'RACCOON',
  FERRET = 'FERRET',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BEAR_CUB = 'BEAR_CUB',
  COYOTE = 'COYOTE',

  // Supernatural
  GHOST_HOUND = 'GHOST_HOUND',
  SKINWALKER_GIFT = 'SKINWALKER_GIFT',
  THUNDERBIRD_FLEDGLING = 'THUNDERBIRD_FLEDGLING',
  CHUPACABRA = 'CHUPACABRA',
}

export enum TrustLevel {
  WILD = 'WILD',
  WARY = 'WARY',
  FAMILIAR = 'FAMILIAR',
  TRUSTED = 'TRUSTED',
  DEVOTED = 'DEVOTED',
}

export enum CompanionCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL',
}

export enum CombatRole {
  ATTACKER = 'ATTACKER',
  DEFENDER = 'DEFENDER',
  SUPPORT = 'SUPPORT',
  SCOUT = 'SCOUT',
}

export enum CompanionAbilityId {
  // Dog Abilities
  TRACK = 'TRACK',
  GUARD = 'GUARD',
  HERD = 'HERD',
  ATTACK = 'ATTACK',
  FETCH = 'FETCH',
  INTIMIDATE = 'INTIMIDATE',
  SENSE_DANGER = 'SENSE_DANGER',
  LOYAL_DEFENSE = 'LOYAL_DEFENSE',

  // Bird Abilities
  SCOUT = 'SCOUT',
  HUNT = 'HUNT',
  MESSAGE = 'MESSAGE',
  DISTRACT = 'DISTRACT',
  OMEN = 'OMEN',
  AERIAL_ASSAULT = 'AERIAL_ASSAULT',
  KEEN_SIGHT = 'KEEN_SIGHT',

  // Exotic Abilities
  STEALTH = 'STEALTH',
  NIGHT_VISION = 'NIGHT_VISION',
  PACK_TACTICS = 'PACK_TACTICS',
  INTIMIDATE_PREY = 'INTIMIDATE_PREY',
  FERAL_RAGE = 'FERAL_RAGE',
  SCAVENGE = 'SCAVENGE',
  BURROW_FLUSH = 'BURROW_FLUSH',
  CLIMB = 'CLIMB',
  POUNCE = 'POUNCE',
  MAUL = 'MAUL',

  // Supernatural Abilities
  GHOST_WALK = 'GHOST_WALK',
  SPIRIT_HOWL = 'SPIRIT_HOWL',
  SHAPE_SHIFT = 'SHAPE_SHIFT',
  THUNDER_STRIKE = 'THUNDER_STRIKE',
  BLOOD_DRAIN = 'BLOOD_DRAIN',
  CURSE_BITE = 'CURSE_BITE',
  PHASE_SHIFT = 'PHASE_SHIFT',
  SOUL_SENSE = 'SOUL_SENSE',
}

export enum AcquisitionMethod {
  PURCHASE = 'PURCHASE',
  TAMED = 'TAMED',
  GIFT = 'GIFT',
  QUEST = 'QUEST',
  BRED = 'BRED',
  RESCUED = 'RESCUED',
  SUPERNATURAL = 'SUPERNATURAL',
}

export type CompanionRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// ============================================================================
// INTERFACES
// ============================================================================

export interface TrainingProgress {
  abilityId: CompanionAbilityId;
  progress: number;
  startedAt: string;
  completesAt: string;
}

export interface Companion {
  _id: string;
  ownerId: string;
  name: string;
  species: CompanionSpecies;
  breed?: string;
  age: number;
  gender: 'male' | 'female';

  // Core Stats
  loyalty: number;
  intelligence: number;
  aggression: number;
  health: number;

  // Abilities
  abilities: CompanionAbilityId[];
  maxAbilities: number;
  abilityCooldowns: Record<CompanionAbilityId, string>;

  // Bond
  bondLevel: number;
  trustLevel: TrustLevel;

  // Combat
  attackPower: number;
  defensePower: number;
  combatRole: CombatRole;

  // Utility
  trackingBonus: number;
  huntingBonus: number;
  guardBonus: number;
  socialBonus: number;

  // Condition
  currentHealth: number;
  maxHealth: number;
  hunger: number;
  happiness: number;
  condition: CompanionCondition;

  // State
  isActive: boolean;
  location: string;

  // History
  acquiredDate: string;
  acquiredMethod: AcquisitionMethod;
  kills: number;
  itemsFound: number;
  encountersHelped: number;

  // Training
  trainingProgress?: TrainingProgress;

  // Timestamps
  lastFed?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionSpeciesDefinition {
  species: CompanionSpecies;
  name: string;
  category: CompanionCategory;
  description: string;
  flavorText: string;
  baseStats: {
    loyalty: number;
    intelligence: number;
    aggression: number;
    health: number;
  };
  combatStats: {
    attackPower: number;
    defensePower: number;
    combatRole: CombatRole;
  };
  utilityStats: {
    trackingBonus: number;
    huntingBonus: number;
    guardBonus: number;
    socialBonus: number;
  };
  availableAbilities: CompanionAbilityId[];
  maxAbilities: number;
  acquisitionMethods: AcquisitionMethod[];
  purchasePrice?: number;
  tamingDifficulty?: number;
  careRequirements: {
    foodType: string[];
    dailyFoodCost: number;
    shelterRequired: boolean;
  };
  rarity: CompanionRarity;
  levelRequired: number;
  reputationRequired?: {
    faction: string;
    amount: number;
  };
}

export interface CompanionShopListing {
  species: CompanionSpecies;
  definition: CompanionSpeciesDefinition;
  available: boolean;
  reason?: string;
  price: number;
}

export interface CompanionStatsSummary {
  totalOwnedAllTime: number;
  currentCompanions: number;
  totalKills: number;
  totalItemsFound: number;
  totalEncountersHelped: number;
  favoriteSpecies?: CompanionSpecies;
  highestBond: number;
}

export interface CompanionListResponse {
  companions: Companion[];
  activeCompanion?: Companion;
  capacity: number;
  dailyUpkeep: number;
  stats: CompanionStatsSummary;
}

export interface WildEncounter {
  species: CompanionSpecies;
  location: string;
  tameable: boolean;
  hostility: number;
  difficulty: number;
  description: string;
}

export interface WildEncountersResponse {
  encounters: WildEncounter[];
  location: string;
}

export interface CompanionCombatStats {
  companionId: string;
  name: string;
  species: CompanionSpecies;
  attackPower: number;
  defensePower: number;
  combatRole: CombatRole;
  currentHealth: number;
  maxHealth: number;
  abilities: CompanionAbilityId[];
  abilityCooldowns: Record<CompanionAbilityId, string>;
  bonuses: {
    damageBonus: number;
    defenseBonus: number;
    initiativeBonus: number;
  };
}

export interface TamingResult {
  success: boolean;
  message: string;
  companion?: Companion;
  progress?: number;
  canRetry?: boolean;
  energyCost: number;
}

export interface FeedResult {
  success: boolean;
  message: string;
  hungerBefore: number;
  hungerAfter: number;
  happinessChange: number;
  bondChange: number;
  costGold: number;
}

export interface TrainingResult {
  success: boolean;
  message: string;
  ability?: CompanionAbilityId;
  progress: number;
  completesAt?: string;
  costGold: number;
}

export interface AbilityUseResult {
  success: boolean;
  message: string;
  damage?: number;
  effects?: string[];
  cooldownEnds?: string;
}

export interface PurchaseCompanionData {
  species: CompanionSpecies;
  name: string;
}

export interface TameAnimalData {
  species: CompanionSpecies;
  name: string;
}

export interface TrainCompanionData {
  abilityId: CompanionAbilityId;
}

export interface UseAbilityData {
  abilityId: CompanionAbilityId;
  targetId?: string;
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

interface UseCompanionsReturn {
  // State
  companions: Companion[];
  activeCompanion: Companion | null;
  shopListings: CompanionShopListing[];
  wildEncounters: WildEncounter[];
  combatStats: CompanionCombatStats | null;
  stats: CompanionStatsSummary | null;
  capacity: number;
  dailyUpkeep: number;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchCompanions: () => Promise<void>;
  fetchShopListings: () => Promise<void>;
  fetchWildEncounters: () => Promise<void>;
  fetchCombatStats: () => Promise<void>;

  // Companion operations
  purchaseCompanion: (data: PurchaseCompanionData) => Promise<ActionResult<Companion>>;
  activateCompanion: (companionId: string) => Promise<ActionResult>;
  feedCompanion: (companionId: string) => Promise<ActionResult<FeedResult>>;
  trainCompanion: (
    companionId: string,
    data: TrainCompanionData
  ) => Promise<ActionResult<TrainingResult>>;
  tameAnimal: (data: TameAnimalData) => Promise<ActionResult<TamingResult>>;
  useAbility: (
    companionId: string,
    data: UseAbilityData
  ) => Promise<ActionResult<AbilityUseResult>>;

  // UI helpers
  clearError: () => void;
}

export const useCompanions = (): UseCompanionsReturn => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);
  const [shopListings, setShopListings] = useState<CompanionShopListing[]>([]);
  const [wildEncounters, setWildEncounters] = useState<WildEncounter[]>([]);
  const [combatStats, setCombatStats] = useState<CompanionCombatStats | null>(null);
  const [stats, setStats] = useState<CompanionStatsSummary | null>(null);
  const [capacity, setCapacity] = useState(3);
  const [dailyUpkeep, setDailyUpkeep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch all owned companions
   */
  const fetchCompanions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CompanionListResponse }>('/companions');
      setCompanions(response.data.data.companions || []);
      setActiveCompanion(response.data.data.activeCompanion || null);
      setCapacity(response.data.data.capacity);
      setDailyUpkeep(response.data.data.dailyUpkeep);
      setStats(response.data.data.stats);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch companions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch available companions for purchase
   */
  const fetchShopListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { listings: CompanionShopListing[] } }>(
        '/companions/shop'
      );
      setShopListings(response.data.data.listings || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch shop listings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch wild animal encounters at current location
   */
  const fetchWildEncounters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: WildEncountersResponse }>(
        '/companions/wild-encounters'
      );
      setWildEncounters(response.data.data.encounters || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch wild encounters';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch active companion combat stats
   */
  const fetchCombatStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CompanionCombatStats }>(
        '/companions/active/combat-stats'
      );
      setCombatStats(response.data.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch combat stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a companion from the shop
   */
  const purchaseCompanion = useCallback(
    async (data: PurchaseCompanionData): Promise<ActionResult<Companion>> => {
      try {
        const response = await api.post<{
          data: { message: string; companion: Companion };
        }>('/companions/purchase', data);
        await refreshCharacter();
        await fetchCompanions();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.companion,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to purchase companion';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchCompanions]
  );

  /**
   * Set a companion as active (following player)
   */
  const activateCompanion = useCallback(
    async (companionId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/companions/${companionId}/activate`
        );
        await fetchCompanions();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to activate companion';
        return { success: false, message: errorMessage };
      }
    },
    [fetchCompanions]
  );

  /**
   * Feed a companion
   */
  const feedCompanion = useCallback(
    async (companionId: string): Promise<ActionResult<FeedResult>> => {
      try {
        const response = await api.post<{ data: FeedResult }>(
          `/companions/${companionId}/feed`
        );
        await refreshCharacter();
        await fetchCompanions();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to feed companion';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchCompanions]
  );

  /**
   * Train a companion to learn an ability
   */
  const trainCompanion = useCallback(
    async (
      companionId: string,
      data: TrainCompanionData
    ): Promise<ActionResult<TrainingResult>> => {
      try {
        const response = await api.post<{ data: TrainingResult }>(
          `/companions/${companionId}/train`,
          data
        );
        await refreshCharacter();
        await fetchCompanions();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to train companion';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchCompanions]
  );

  /**
   * Attempt to tame a wild animal
   */
  const tameAnimal = useCallback(
    async (data: TameAnimalData): Promise<ActionResult<TamingResult>> => {
      try {
        const response = await api.post<{ data: TamingResult }>(
          '/companions/tame',
          data
        );
        await refreshCharacter();
        if (response.data.data.success) {
          await fetchCompanions();
        }
        return {
          success: response.data.data.success,
          message: response.data.data.message,
          data: response.data.data,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to tame animal';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchCompanions]
  );

  /**
   * Use a companion ability in combat
   */
  const useAbility = useCallback(
    async (
      companionId: string,
      data: UseAbilityData
    ): Promise<ActionResult<AbilityUseResult>> => {
      try {
        const response = await api.post<{ data: AbilityUseResult }>(
          `/companions/${companionId}/use-ability`,
          data
        );
        await fetchCombatStats();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to use ability';
        return { success: false, message: errorMessage };
      }
    },
    [fetchCombatStats]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    companions,
    activeCompanion,
    shopListings,
    wildEncounters,
    combatStats,
    stats,
    capacity,
    dailyUpkeep,
    isLoading,
    error,

    // Fetch operations
    fetchCompanions,
    fetchShopListings,
    fetchWildEncounters,
    fetchCombatStats,

    // Companion operations
    purchaseCompanion,
    activateCompanion,
    feedCompanion,
    trainCompanion,
    tameAnimal,
    useAbility,

    // UI helpers
    clearError,
  };
};

export default useCompanions;
