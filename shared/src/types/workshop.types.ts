/**
 * Workshop Building System Types
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Type definitions for workshop buildings where players craft using professions
 */

import { ObjectId } from 'mongodb';
import { ProfessionId, CraftingFacilityType } from './crafting.types';

// ============================================================================
// CORE WORKSHOP TYPES
// ============================================================================

export type FacilityTier = 1 | 2 | 3 | 4 | 5;

export interface AccessRequirement {
  type: 'level' | 'reputation' | 'faction' | 'quest' | 'gold' | 'item';
  value: string | number;
  description: string;
}

export interface WorkshopOperatingHours {
  open: number;  // 0-23 (24h format)
  close: number; // 0-23 (24h format)
  description?: string;
  alwaysOpen?: boolean; // 24/7 operation
}

export interface WorkshopFacilityBonus {
  type: 'speed' | 'quality' | 'material_savings' | 'durability' | 'special';
  value: number; // Percentage or specific value
  description: string;
}

export interface WorkshopFacility {
  type: CraftingFacilityType;
  tier: FacilityTier;
  condition: number; // 0-100%, affects bonuses
  bonuses: WorkshopFacilityBonus[];
  maintenanceCost?: number; // Daily/weekly cost to keep functional
  description: string;
}

// ============================================================================
// NPC TYPES
// ============================================================================

export type WorkshopNPCRole = 'trainer' | 'merchant' | 'assistant' | 'quest_giver' | 'lore_keeper';

export interface NPCDialogue {
  greeting: string[];
  idle: string[];
  training?: string[];
  selling?: string[];
  questGiving?: string[];
  farewell: string[];
  specialEvents?: { [event: string]: string[] };
}

export interface NPCService {
  type: 'train' | 'sell' | 'buy' | 'repair' | 'upgrade' | 'quest';
  name: string;
  description: string;
  cost?: number;
  requirements?: AccessRequirement[];
  availableItems?: string[]; // Item IDs for merchants
  trainableProfession?: ProfessionId; // For trainers
}

export interface WorkshopNPC {
  id: string;
  name: string;
  role: WorkshopNPCRole;
  title?: string;
  description: string;
  personality: string;
  faction?: 'settler' | 'nahi' | 'frontera' | 'neutral';
  dialogue: NPCDialogue;
  services: NPCService[];
  schedule?: {
    hour: number;
    location?: string;
    activity: string;
  }[];
  reputation?: {
    required: number;
    faction?: string;
  };
  backstory?: string;
}

// ============================================================================
// WORKSHOP BUILDING TYPES
// ============================================================================

export type WorkshopType =
  | 'smithy'
  | 'tannery'
  | 'apothecary'
  | 'kitchen'
  | 'tailor_shop'
  | 'gunsmith';

export interface MembershipOption {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  cost: number;
  benefits: string[];
  description: string;
}

export interface WorkshopBuilding {
  id: string;
  name: string;
  workshopType: WorkshopType;
  locationId: string; // References game location (Red Gulch, etc.)
  locationName: string;
  professionSupported: ProfessionId;
  description: string;
  atmosphere: string; // Descriptive flavor text
  facilities: WorkshopFacility[];
  npcs: string[]; // NPC IDs
  operatingHours: WorkshopOperatingHours;
  accessRequirements?: AccessRequirement[];
  rentalCost?: number; // Gold per hour to use
  membershipAvailable?: boolean;
  membershipOptions?: MembershipOption[];
  capacity: number; // Max concurrent crafters
  reputation?: {
    faction?: string;
    required: number;
  };
  features: string[]; // Special features/amenities
  tier: FacilityTier; // Overall facility tier
  ownerNPC?: string; // NPC ID of owner
  specialRules?: string[]; // Special rules (e.g., "No questions asked", "Barter only")
}

// ============================================================================
// WORKSHOP ACCESS TYPES
// ============================================================================

export interface WorkshopAccessRequest {
  workshopId: string;
  characterId: ObjectId;
  duration?: number; // Hours
  membershipType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface WorkshopAccessResponse {
  success: boolean;
  workshopId: string;
  accessGranted: boolean;
  message: string;
  cost?: number;
  expiresAt?: Date;
  restrictions?: string[];
}

export interface ActiveWorkshopSession {
  workshopId: string;
  characterId: ObjectId;
  startTime: Date;
  endTime?: Date;
  facilitiesUsed: CraftingFacilityType[];
  totalCost: number;
  membership?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    expiresAt: Date;
  };
}

// ============================================================================
// WORKSHOP EVENTS
// ============================================================================

export interface WorkshopEvent {
  id: string;
  workshopId: string;
  eventType: 'discount' | 'master_visiting' | 'competition' | 'shortage' | 'upgrade';
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  effects: {
    rentalDiscount?: number;
    qualityBonus?: number;
    specialRecipes?: string[];
    bonusXP?: number;
  };
  active: boolean;
}

// ============================================================================
// LOCATION REFERENCES
// ============================================================================

export enum GameLocation {
  RED_GULCH = 'red_gulch',
  THE_FRONTERA = 'the_frontera',
  FORT_ASHFORD = 'fort_ashford',
  WHISKEY_BEND = 'whiskey_bend',
  KAIOWA_MESA = 'kaiowa_mesa',
  SPIRIT_SPRINGS = 'spirit_springs',
  GOLDFINGER_MINE = 'goldfinger_mine',
  LONGHORN_RANCH = 'longhorn_ranch'
}

export const LOCATION_NAMES: Record<GameLocation, string> = {
  [GameLocation.RED_GULCH]: 'Red Gulch',
  [GameLocation.THE_FRONTERA]: 'The Frontera',
  [GameLocation.FORT_ASHFORD]: 'Fort Ashford',
  [GameLocation.WHISKEY_BEND]: 'Whiskey Bend',
  [GameLocation.KAIOWA_MESA]: 'Kaiowa Mesa',
  [GameLocation.SPIRIT_SPRINGS]: 'Spirit Springs',
  [GameLocation.GOLDFINGER_MINE]: "Goldfinger's Mine",
  [GameLocation.LONGHORN_RANCH]: 'Longhorn Ranch'
};
