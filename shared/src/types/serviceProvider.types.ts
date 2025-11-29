/**
 * Service Provider Types
 *
 * Types for traveling service provider NPCs who offer various services
 * as they move between locations throughout the game world
 */

import { NPCActivity } from './schedule.types';

/**
 * Types of services that can be offered
 */
export enum ServiceType {
  // Medical Services
  MEDICAL_TREATMENT = 'medical_treatment',
  SURGERY = 'surgery',
  DISEASE_CURE = 'disease_cure',
  ADDICTION_TREATMENT = 'addiction_treatment',
  SUPERNATURAL_HEALING = 'supernatural_healing',

  // Spiritual Services
  BLESSING = 'blessing',
  CONFESSION = 'confession',
  MARRIAGE = 'marriage',
  LAST_RITES = 'last_rites',
  SANCTUARY = 'sanctuary',
  CURSE_REMOVAL = 'curse_removal',

  // Repair Services
  EQUIPMENT_REPAIR = 'equipment_repair',
  EQUIPMENT_UPGRADE = 'equipment_upgrade',
  WEAPON_REPAIR = 'weapon_repair',
  ARMOR_REPAIR = 'armor_repair',

  // Food Services
  HOT_MEAL = 'hot_meal',
  PROVISIONS = 'provisions',
  SPECIAL_MEAL = 'special_meal',

  // Gambling & Games
  GAMBLING_LESSON = 'gambling_lesson',
  CARD_GAME = 'card_game',
  LUCK_CHARM = 'luck_charm',

  // Legal Services
  TRIAL = 'trial',
  LEGAL_RULING = 'legal_ruling',
  BOUNTY_REDUCTION = 'bounty_reduction',
  CLAIM_LEGITIMIZATION = 'claim_legitimization',

  // Crafting Services
  CLOTHING_REPAIR = 'clothing_repair',
  CUSTOM_OUTFIT = 'custom_outfit',
  DISGUISE_CREATION = 'disguise_creation',

  // Animal Services
  ANIMAL_HEALING = 'animal_healing',
  HORSE_CARE = 'horse_care',
  COMPANION_TREATMENT = 'companion_treatment',
  HORSE_UPGRADE = 'horse_upgrade',
}

/**
 * Service effect types
 */
export enum ServiceEffectType {
  HEAL = 'heal',
  BUFF = 'buff',
  CURE = 'cure',
  REPAIR = 'repair',
  UNLOCK = 'unlock',
  TEACH = 'teach',
  REDUCE_BOUNTY = 'reduce_bounty',
  STAT_INCREASE = 'stat_increase',
}

/**
 * Cost structure for services
 */
export interface ServiceCost {
  type: 'gold' | 'barter' | 'mixed';
  gold?: number;
  barterItems?: {
    itemType: string;
    quantity: number;
    alternatives?: string[]; // Alternative item types accepted
  }[];
}

/**
 * Effect of a service when used
 */
export interface ServiceEffect {
  type: ServiceEffectType;
  target: 'character' | 'equipment' | 'companion' | 'stat' | 'legal';
  value: number;
  duration?: number; // Duration in minutes (for buffs)
  statName?: string; // For stat increases/buffs
  description: string;
}

/**
 * Requirements to access a service
 */
export interface ServiceRequirements {
  minTrustLevel?: number;
  maxBounty?: number;
  faction?: string;
  questCompleted?: string;
  minLevel?: number;
  excludedFactions?: string[];
}

/**
 * Individual service offered by a provider
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  cost: ServiceCost;
  duration: number; // How long the service takes (minutes)
  effects: ServiceEffect[];
  requirements?: ServiceRequirements;
  cooldown?: number; // Cooldown in minutes before can use again
  emergencyCost?: ServiceCost; // Higher cost if used during off-hours
}

/**
 * Trust level bonuses
 */
export interface TrustBonus {
  trustLevel: number;
  benefits: {
    discountPercentage?: number;
    unlockServices?: string[]; // Service IDs
    priorityService?: boolean;
    exclusiveServices?: string[]; // Service IDs
    canTeachAbilities?: boolean;
  };
}

/**
 * Route stop for a wandering service provider
 */
export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number; // Day of week (0-6, 0 = Sunday)
  arrivalHour: number; // Hour of day (0-23)
  departureDay: number;
  departureHour: number;
  stayDuration: number; // Hours at this location
  setupLocation?: string; // Specific building/area within location
}

/**
 * Schedule entry for service provider
 */
export interface ServiceScheduleEntry {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number;
  endHour: number;
  activity: NPCActivity;
  locationId: string;
  locationName: string;
  servicesAvailable: boolean; // Are they offering services during this time?
  emergencyOnly?: boolean; // Only emergency services available
}

/**
 * Dialogue for service provider
 */
export interface ServiceProviderDialogue {
  greeting: string[];
  serviceOffer: string[];
  serviceDone: string[];
  cannotAfford: string[];
  trustLow: string[];
  trustHigh: string[];
  emergency: string[];
  departingSoon: string[];
  busy: string[];
}

/**
 * Service provider profession types
 */
export enum ServiceProviderProfession {
  TRAVELING_PREACHER = 'traveling_preacher',
  TRAVELING_PHYSICIAN = 'traveling_physician',
  TRAVELING_MECHANIC = 'traveling_mechanic',
  COALITION_HEALER = 'coalition_healer',
  CATHOLIC_PRIEST = 'catholic_priest',
  TRAVELING_COOK = 'traveling_cook',
  TRAVELING_GAMBLER = 'traveling_gambler',
  CIRCUIT_JUDGE = 'circuit_judge',
  TRAVELING_SEAMSTRESS = 'traveling_seamstress',
  TRAVELING_VETERINARIAN = 'traveling_veterinarian',
}

/**
 * Complete wandering service provider definition
 */
export interface WanderingServiceProvider {
  id: string;
  name: string;
  title: string;
  profession: ServiceProviderProfession;
  description: string;
  personality: string;
  faction: 'neutral' | 'settler' | 'frontera' | 'coalition';

  // Movement and location
  route: RouteStop[];
  schedule: ServiceScheduleEntry[];

  // Services offered
  services: Service[];

  // Social interactions
  dialogue: ServiceProviderDialogue;
  specialAbilities?: string[];
  trustBonuses?: TrustBonus[];

  // Reputation
  baseTrust: number; // Starting trust level
  trustDecayRate: number; // How fast trust decreases without interaction
  maxTrust: number; // Maximum achievable trust
}

/**
 * Player's relationship with a service provider
 */
export interface ServiceProviderRelationship {
  providerId: string;
  characterId: string;
  trustLevel: number;
  lastInteraction: Date;
  servicesUsed: number;
  totalSpent: number; // Gold spent on services
  favorsDone?: number; // Special favors/quests completed
}

/**
 * Service usage record
 */
export interface ServiceUsageRecord {
  serviceId: string;
  providerId: string;
  characterId: string;
  usedAt: Date;
  costPaid: ServiceCost;
  effectsApplied: ServiceEffect[];
  availableAgainAt?: Date; // If there's a cooldown
}

/**
 * Request to use a service
 */
export interface UseServiceRequest {
  providerId: string;
  serviceId: string;
  characterId: string;
  paymentType: 'gold' | 'barter';
  barterItems?: {
    itemId: string;
    quantity: number;
  }[];
}

/**
 * Response after using a service
 */
export interface UseServiceResponse {
  success: boolean;
  message: string;
  effectsApplied?: ServiceEffect[];
  costPaid?: ServiceCost;
  newTrustLevel?: number;
  cooldownUntil?: Date;
}

/**
 * Request to get available service providers at location
 */
export interface GetServiceProvidersAtLocationRequest {
  locationId: string;
  currentTime?: Date;
}

/**
 * Response with service providers at location
 */
export interface GetServiceProvidersAtLocationResponse {
  success: boolean;
  providers: {
    provider: WanderingServiceProvider;
    currentActivity: NPCActivity;
    servicesAvailable: boolean;
    departingIn?: number; // Hours until departure
    trustLevel?: number; // Player's trust with this provider
  }[];
}

/**
 * Request to get provider schedule
 */
export interface GetProviderScheduleRequest {
  providerId: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Response with provider schedule
 */
export interface GetProviderScheduleResponse {
  success: boolean;
  provider: WanderingServiceProvider;
  upcomingStops: {
    location: string;
    arrivalTime: Date;
    departureTime: Date;
    servicesOffered: Service[];
  }[];
  currentLocation?: {
    locationId: string;
    locationName: string;
    departingAt: Date;
  };
}
