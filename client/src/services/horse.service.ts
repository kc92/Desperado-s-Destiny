/**
 * Horse Service
 * API client for horse ownership, care, training, and breeding
 */

import api from './api';

// ===== Types =====

export type HorseBreed =
  | 'mustang'
  | 'quarter_horse'
  | 'arabian'
  | 'thoroughbred'
  | 'appaloosa'
  | 'morgan'
  | 'paint'
  | 'palomino';

export type HorseGender = 'stallion' | 'mare' | 'gelding';

export type HorseSkill = 'speed' | 'stamina' | 'handling' | 'jumping' | 'bravery';

export type FoodQuality = 'basic' | 'quality' | 'premium';

export interface HorseStats {
  speed: number;
  stamina: number;
  handling: number;
  jumping: number;
  bravery: number;
}

export interface HorseBond {
  level: number;
  experience: number;
  nextLevelXp: number;
  bonuses: string[];
  recommendations: string[];
}

export interface HorseCombatBonus {
  trampleDamage: number;
  chargeBonus: number;
  mountedAccuracy: number;
  mountedEvasion: number;
}

export interface HorseLineage {
  sire?: {
    id: string;
    name: string;
    breed: HorseBreed;
  };
  dam?: {
    id: string;
    name: string;
    breed: HorseBreed;
  };
  offspring: Array<{
    id: string;
    name: string;
    breed: HorseBreed;
    gender: HorseGender;
  }>;
  generation: number;
}

export interface Horse {
  _id: string;
  name: string;
  breed: HorseBreed;
  gender: HorseGender;
  age: number;
  stats: HorseStats;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  bondLevel: number;
  isActive: boolean;
  lastFed?: string;
  lastGroomed?: string;
  lastRested?: string;
  trainingProgress: Partial<Record<HorseSkill, number>>;
  purchasePrice: number;
  purchaseDate: string;
  sireId?: string;
  damId?: string;
}

export interface BreedingRecommendation {
  horseId: string;
  horseName: string;
  compatibility: number;
  predictedStats: Partial<HorseStats>;
  notes: string[];
}

// ===== Request/Response Types =====

export interface PurchaseHorseRequest {
  breed: HorseBreed;
  gender?: HorseGender;
  name: string;
}

export interface PurchaseHorseResponse {
  horse: Horse;
  cost: number;
  newGold: number;
  message: string;
}

export interface FeedHorseRequest {
  foodQuality: FoodQuality;
}

export interface FeedHorseResponse {
  horse: Horse;
  hungerRestored: number;
  happinessGained: number;
  cost: number;
  message: string;
}

export interface GroomHorseResponse {
  horse: Horse;
  cleanlinessRestored: number;
  happinessGained: number;
  bondXpGained: number;
  message: string;
}

export interface RestHorseRequest {
  hours: number;
}

export interface RestHorseResponse {
  horse: Horse;
  staminaRestored: number;
  message: string;
}

export interface HealHorseRequest {
  healthAmount: number;
}

export interface HealHorseResponse {
  horse: Horse;
  healthRestored: number;
  cost: number;
  message: string;
}

export interface TrainHorseRequest {
  skill: HorseSkill;
}

export interface TrainHorseResponse {
  horse: Horse;
  skillTrained: HorseSkill;
  progressGained: number;
  leveledUp: boolean;
  newSkillLevel?: number;
  message: string;
}

export interface WhistleRequest {
  distance: number;
}

export interface WhistleResponse {
  success: boolean;
  arrivalTime: number;
  message: string;
}

export interface BreedHorsesRequest {
  stallionId: string;
  mareId: string;
}

export interface BreedHorsesResponse {
  success: boolean;
  foal?: Horse;
  message: string;
  cooldownEnds?: string;
}

// ===== Horse Service =====

export const horseService = {
  // ===== Ownership =====

  /**
   * Get all horses owned by the character
   */
  async getHorses(): Promise<Horse[]> {
    const response = await api.get<{ data: { horses: Horse[] } }>('/horses');
    return response.data.data?.horses || [];
  },

  /**
   * Get a specific horse by ID
   */
  async getHorse(horseId: string): Promise<Horse> {
    const response = await api.get<{ data: Horse }>(`/horses/${horseId}`);
    return response.data.data;
  },

  /**
   * Purchase a new horse
   */
  async purchaseHorse(request: PurchaseHorseRequest): Promise<PurchaseHorseResponse> {
    const response = await api.post<{ data: PurchaseHorseResponse }>('/horses/purchase', request);
    return response.data.data;
  },

  /**
   * Set a horse as the active mount
   */
  async activateHorse(horseId: string): Promise<{ horse: Horse; message: string }> {
    const response = await api.post<{ data: { horse: Horse; message: string } }>(
      `/horses/${horseId}/activate`
    );
    return response.data.data;
  },

  /**
   * Rename a horse
   */
  async renameHorse(horseId: string, newName: string): Promise<{ horse: Horse; message: string }> {
    const response = await api.patch<{ data: { horse: Horse; message: string } }>(
      `/horses/${horseId}/rename`,
      { newName }
    );
    return response.data.data;
  },

  // ===== Care =====

  /**
   * Feed a horse
   */
  async feedHorse(horseId: string, foodQuality: FoodQuality): Promise<FeedHorseResponse> {
    const response = await api.post<{ data: FeedHorseResponse }>(
      `/horses/${horseId}/feed`,
      { foodQuality }
    );
    return response.data.data;
  },

  /**
   * Groom a horse
   */
  async groomHorse(horseId: string): Promise<GroomHorseResponse> {
    const response = await api.post<{ data: GroomHorseResponse }>(`/horses/${horseId}/groom`);
    return response.data.data;
  },

  /**
   * Rest a horse to restore stamina
   */
  async restHorse(horseId: string, hours: number): Promise<RestHorseResponse> {
    const response = await api.post<{ data: RestHorseResponse }>(
      `/horses/${horseId}/rest`,
      { hours }
    );
    return response.data.data;
  },

  /**
   * Heal a horse
   */
  async healHorse(horseId: string, healthAmount: number): Promise<HealHorseResponse> {
    const response = await api.post<{ data: HealHorseResponse }>(
      `/horses/${horseId}/heal`,
      { healthAmount }
    );
    return response.data.data;
  },

  // ===== Training =====

  /**
   * Train a horse skill
   */
  async trainHorse(horseId: string, skill: HorseSkill): Promise<TrainHorseResponse> {
    const response = await api.post<{ data: TrainHorseResponse }>(
      `/horses/${horseId}/train`,
      { skill }
    );
    return response.data.data;
  },

  // ===== Bond =====

  /**
   * Get bond status and recommendations
   */
  async getHorseBond(horseId: string): Promise<HorseBond> {
    const response = await api.get<{ data: HorseBond }>(`/horses/${horseId}/bond`);
    return response.data.data;
  },

  /**
   * Whistle to call your horse from a distance
   */
  async whistleForHorse(horseId: string, distance: number): Promise<WhistleResponse> {
    const response = await api.post<{ data: WhistleResponse }>(
      `/horses/${horseId}/whistle`,
      { distance }
    );
    return response.data.data;
  },

  // ===== Combat =====

  /**
   * Get mounted combat bonuses for a horse
   */
  async getHorseCombatBonus(horseId: string): Promise<HorseCombatBonus> {
    const response = await api.get<{ data: HorseCombatBonus }>(`/horses/${horseId}/combat-bonus`);
    return response.data.data;
  },

  // ===== Breeding =====

  /**
   * Breed two horses together
   */
  async breedHorses(stallionId: string, mareId: string): Promise<BreedHorsesResponse> {
    const response = await api.post<{ data: BreedHorsesResponse }>('/horses/breed', {
      stallionId,
      mareId,
    });
    return response.data.data;
  },

  /**
   * Get breeding lineage for a horse
   */
  async getHorseLineage(horseId: string): Promise<HorseLineage> {
    const response = await api.get<{ data: HorseLineage }>(`/horses/${horseId}/lineage`);
    return response.data.data;
  },

  /**
   * Get breeding recommendations for a horse
   */
  async getBreedingRecommendations(horseId: string): Promise<BreedingRecommendation[]> {
    const response = await api.get<{ data: { recommendations: BreedingRecommendation[] } }>(
      `/horses/${horseId}/breeding-recommendations`
    );
    return response.data.data?.recommendations || [];
  },
};

export default horseService;
