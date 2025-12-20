/**
 * Hunting Service
 * API client for the hunting system
 */

import api from './api';

// ===== Types =====

export enum AnimalSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  DANGEROUS = 'DANGEROUS'
}

export enum AnimalRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum HuntingWeapon {
  HUNTING_RIFLE = 'HUNTING_RIFLE',
  VARMINT_RIFLE = 'VARMINT_RIFLE',
  BOW = 'BOW',
  SHOTGUN = 'SHOTGUN',
  PISTOL = 'PISTOL'
}

export enum ShotPlacement {
  HEAD = 'HEAD',
  HEART = 'HEART',
  LUNGS = 'LUNGS',
  BODY = 'BODY',
  MISS = 'MISS'
}

export enum KillQuality {
  PERFECT = 'PERFECT',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  COMMON = 'COMMON',
  POOR = 'POOR'
}

export enum HarvestResourceType {
  MEAT = 'MEAT',
  HIDE = 'HIDE',
  FUR = 'FUR',
  PELT = 'PELT',
  BONE = 'BONE',
  ANTLER = 'ANTLER',
  HORN = 'HORN',
  FEATHER = 'FEATHER',
  CLAW = 'CLAW',
  TOOTH = 'TOOTH',
  TROPHY = 'TROPHY'
}

export enum AnimalSpecies {
  // Small Game
  RABBIT = 'RABBIT',
  PRAIRIE_DOG = 'PRAIRIE_DOG',
  SQUIRREL = 'SQUIRREL',
  RACCOON = 'RACCOON',
  SKUNK = 'SKUNK',
  OPOSSUM = 'OPOSSUM',
  // Medium Game
  TURKEY = 'TURKEY',
  PHEASANT = 'PHEASANT',
  DUCK = 'DUCK',
  GOOSE = 'GOOSE',
  COYOTE = 'COYOTE',
  FOX = 'FOX',
  BADGER = 'BADGER',
  // Large Game
  WHITE_TAILED_DEER = 'WHITE_TAILED_DEER',
  MULE_DEER = 'MULE_DEER',
  PRONGHORN = 'PRONGHORN',
  WILD_BOAR = 'WILD_BOAR',
  JAVELINA = 'JAVELINA',
  BIGHORN_SHEEP = 'BIGHORN_SHEEP',
  ELK = 'ELK',
  // Dangerous Game
  BLACK_BEAR = 'BLACK_BEAR',
  GRIZZLY_BEAR = 'GRIZZLY_BEAR',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BISON = 'BISON',
  // Additional
  EAGLE = 'EAGLE',
  RATTLESNAKE = 'RATTLESNAKE',
  ARMADILLO = 'ARMADILLO',
  PORCUPINE = 'PORCUPINE'
}

export interface HuntingGround {
  locationId: string;
  name: string;
  description: string;
  shortDescription: string;
  availableAnimals: AnimalSpecies[];
  spawnRates: Record<AnimalSpecies, number>;
  terrain: 'plains' | 'forest' | 'mountains' | 'desert' | 'swamp';
  coverLevel: number;
  dangerLevel: number;
  energyCost: number;
  minLevel: number;
}

export interface HuntingEquipment {
  weapon: HuntingWeapon;
  hasBinoculars: boolean;
  hasCamouflage: boolean;
  hasAnimalCalls: boolean;
  hasScentBlocker: boolean;
  hasHuntingKnife: boolean;
}

export interface HuntAvailability {
  canHunt: boolean;
  reason?: string;
  availableGrounds: HuntingGround[];
  equipment: HuntingEquipment;
  companion?: {
    id: string;
    name: string;
    trackingBonus: number;
    huntingBonus: number;
  };
}

export interface HarvestResource {
  type: HarvestResourceType;
  quantity: number;
  value: number;
}

export interface HarvestResult {
  success: boolean;
  quality: KillQuality;
  resources: HarvestResource[];
  totalValue: number;
}

export interface HuntingTrip {
  _id: string;
  characterId: string;
  huntingGroundId: string;
  status: 'tracking' | 'stalking' | 'aiming' | 'shooting' | 'harvesting' | 'complete' | 'failed';
  targetAnimal?: AnimalSpecies;
  trackingProgress?: number;
  shotPlacement?: ShotPlacement;
  harvestResult?: HarvestResult;
  energySpent: number;
  goldEarned?: number;
  xpEarned?: number;
  weaponUsed?: HuntingWeapon;
  createdAt: string;
  completedAt?: string;
}

export interface HuntingStatistics {
  totalHunts: number;
  successfulHunts: number;
  killsBySpecies: Record<AnimalSpecies, number>;
  perfectKills: number;
  totalGoldEarned: number;
  totalXpEarned: number;
  favoriteHuntingGround?: string;
  largestKill?: {
    species: AnimalSpecies;
    quality: KillQuality;
    value: number;
    date: string;
  };
}

// ===== Request/Response Types =====

export interface CheckAvailabilityResponse {
  success: boolean;
  availability: HuntAvailability;
}

export interface StartHuntRequest {
  huntingGroundId: string;
  weapon: HuntingWeapon;
  companionId?: string;
}

export interface StartHuntResponse {
  success: boolean;
  trip: HuntingTrip;
  message: string;
}

export interface GetCurrentTripResponse {
  success: boolean;
  trip: HuntingTrip | null;
  hasActiveHunt: boolean;
  phase?: string;
  animal?: AnimalSpecies;
  trackingProgress?: number;
}

export interface TrackAnimalRequest {
  direction?: string;
}

export interface TrackAnimalResponse {
  success: boolean;
  error?: string;
  animalFound?: boolean;
  animal?: AnimalSpecies;
  distance?: number;
  trackingProgress?: number;
}

export interface TakeShotRequest {
  shotPlacement: ShotPlacement;
}

export interface TakeShotResponse {
  success: boolean;
  error?: string;
  hit?: boolean;
  quality?: KillQuality;
  harvestResult?: HarvestResult;
  xpEarned?: number;
  goldEarned?: number;
}

export interface AbandonHuntResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface GetStatisticsResponse {
  success: boolean;
  statistics: HuntingStatistics;
}

// ===== Hunting Service =====

export const huntingService = {
  /**
   * Check if character can hunt and get available grounds
   */
  async checkAvailability(): Promise<HuntAvailability> {
    const response = await api.get<{ data: HuntAvailability }>('/hunting/availability');
    return response.data.data;
  },

  /**
   * Get current hunting trip (if any)
   */
  async getCurrentTrip(): Promise<HuntingTrip | null> {
    try {
      const response = await api.get<{ data: { trip: HuntingTrip | null } }>('/hunting/current');
      return response.data.data?.trip || null;
    } catch {
      return null;
    }
  },

  /**
   * Get hunting statistics
   */
  async getStatistics(): Promise<HuntingStatistics> {
    const response = await api.get<{ data: HuntingStatistics }>('/hunting/statistics');
    return response.data.data;
  },

  /**
   * Start a new hunting trip
   */
  async startHunt(huntingGroundId: string, weapon: HuntingWeapon, companionId?: string): Promise<StartHuntResponse> {
    const response = await api.post<{ data: StartHuntResponse }>('/hunting/start', {
      huntingGroundId,
      weapon,
      companionId,
    });
    return response.data.data;
  },

  /**
   * Track an animal during the tracking phase
   */
  async trackAnimal(direction?: string): Promise<TrackAnimalResponse> {
    const response = await api.post<{ data: TrackAnimalResponse }>('/hunting/track', {
      direction,
    });
    return response.data.data;
  },

  /**
   * Take a shot at the animal during the aiming phase
   */
  async takeShot(shotPlacement: ShotPlacement): Promise<TakeShotResponse> {
    const response = await api.post<{ data: TakeShotResponse }>('/hunting/shoot', {
      shotPlacement,
    });
    return response.data.data;
  },

  /**
   * Abandon current hunting trip
   */
  async abandonHunt(): Promise<AbandonHuntResponse> {
    const response = await api.post<{ data: AbandonHuntResponse }>('/hunting/abandon');
    return response.data.data;
  },

  // ===== Helper Methods =====

  /**
   * Get weapon display name
   */
  getWeaponName(weapon: HuntingWeapon): string {
    const names: Record<HuntingWeapon, string> = {
      [HuntingWeapon.HUNTING_RIFLE]: 'Hunting Rifle',
      [HuntingWeapon.VARMINT_RIFLE]: 'Varmint Rifle',
      [HuntingWeapon.BOW]: 'Bow',
      [HuntingWeapon.SHOTGUN]: 'Shotgun',
      [HuntingWeapon.PISTOL]: 'Pistol',
    };
    return names[weapon] || weapon;
  },

  /**
   * Get animal display name
   */
  getAnimalName(species: AnimalSpecies): string {
    return species
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Get shot placement display name
   */
  getShotPlacementName(placement: ShotPlacement): string {
    const names: Record<ShotPlacement, string> = {
      [ShotPlacement.HEAD]: 'Head Shot',
      [ShotPlacement.HEART]: 'Heart Shot',
      [ShotPlacement.LUNGS]: 'Lung Shot',
      [ShotPlacement.BODY]: 'Body Shot',
      [ShotPlacement.MISS]: 'Missed',
    };
    return names[placement] || placement;
  },

  /**
   * Get kill quality display name and color
   */
  getQualityInfo(quality: KillQuality): { name: string; color: string } {
    const info: Record<KillQuality, { name: string; color: string }> = {
      [KillQuality.PERFECT]: { name: 'Perfect', color: 'text-yellow-400' },
      [KillQuality.EXCELLENT]: { name: 'Excellent', color: 'text-purple-400' },
      [KillQuality.GOOD]: { name: 'Good', color: 'text-blue-400' },
      [KillQuality.COMMON]: { name: 'Common', color: 'text-green-400' },
      [KillQuality.POOR]: { name: 'Poor', color: 'text-gray-400' },
    };
    return info[quality] || { name: quality, color: 'text-white' };
  },

  /**
   * Get terrain display info
   */
  getTerrainInfo(terrain: string): { name: string; icon: string } {
    const info: Record<string, { name: string; icon: string }> = {
      plains: { name: 'Plains', icon: '🌾' },
      forest: { name: 'Forest', icon: '🌲' },
      mountains: { name: 'Mountains', icon: '⛰️' },
      desert: { name: 'Desert', icon: '🏜️' },
      swamp: { name: 'Swamp', icon: '🌿' },
    };
    return info[terrain] || { name: terrain, icon: '🗺️' };
  },

  /**
   * Get resource type display name
   */
  getResourceName(type: HarvestResourceType): string {
    const names: Record<HarvestResourceType, string> = {
      [HarvestResourceType.MEAT]: 'Meat',
      [HarvestResourceType.HIDE]: 'Hide',
      [HarvestResourceType.FUR]: 'Fur',
      [HarvestResourceType.PELT]: 'Pelt',
      [HarvestResourceType.BONE]: 'Bone',
      [HarvestResourceType.ANTLER]: 'Antler',
      [HarvestResourceType.HORN]: 'Horn',
      [HarvestResourceType.FEATHER]: 'Feather',
      [HarvestResourceType.CLAW]: 'Claw',
      [HarvestResourceType.TOOTH]: 'Tooth',
      [HarvestResourceType.TROPHY]: 'Trophy',
    };
    return names[type] || type;
  },

  /**
   * Calculate shot difficulty description
   */
  getShotDifficultyDescription(placement: ShotPlacement): string {
    const descriptions: Record<ShotPlacement, string> = {
      [ShotPlacement.HEAD]: 'Very Hard - Highest reward',
      [ShotPlacement.HEART]: 'Hard - High reward',
      [ShotPlacement.LUNGS]: 'Medium - Normal reward',
      [ShotPlacement.BODY]: 'Easy - Lower reward',
      [ShotPlacement.MISS]: '',
    };
    return descriptions[placement] || '';
  },
};

export default huntingService;
