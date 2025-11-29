/**
 * Permanent Unlocks System - Shared Types
 * Account-wide features that persist across all characters
 */

/**
 * Categories of permanent unlocks
 */
export enum UnlockCategory {
  COSMETIC = 'cosmetic',
  GAMEPLAY = 'gameplay',
  CONVENIENCE = 'convenience',
  PRESTIGE = 'prestige'
}

/**
 * How an unlock can be earned
 */
export enum UnlockRequirementType {
  ACHIEVEMENT = 'achievement',
  LEGACY_TIER = 'legacy_tier',
  PURCHASE = 'purchase',
  EVENT = 'event',
  TIME_PLAYED = 'time_played',
  CHARACTER_LEVEL = 'character_level',
  GOLD_EARNED = 'gold_earned',
  CRIMES_COMMITTED = 'crimes_committed',
  DUELS_WON = 'duels_won',
  GANG_RANK = 'gang_rank'
}

/**
 * Requirement needed to earn an unlock
 */
export interface UnlockRequirement {
  type: UnlockRequirementType;

  // Achievement requirement
  achievementId?: string;

  // Legacy tier requirement
  legacyTier?: number;

  // Purchase requirement
  purchaseId?: string;
  premiumCurrency?: number;

  // Event requirement
  eventId?: string;

  // Numeric requirements
  minValue?: number;

  // Combined requirements (all must be met)
  allOf?: UnlockRequirement[];

  // Alternative requirements (any can be met)
  anyOf?: UnlockRequirement[];
}

/**
 * What an unlock provides
 */
export interface UnlockEffect {
  // Character slots
  extraCharacterSlots?: number;

  // Starting bonuses
  startingGold?: number;
  startingStats?: {
    strength?: number;
    speed?: number;
    cunning?: number;
    charisma?: number;
  };

  // Location access
  unlockedLocations?: string[];
  unlockedStartingLocations?: string[];

  // Cosmetics
  portraitFrames?: string[];
  nameplateColors?: string[];
  titles?: string[];
  chatBadges?: string[];
  profileBackgrounds?: string[];
  deathAnimations?: string[];

  // Gameplay features
  abilities?: string[];
  horseBreeds?: string[];
  companionTypes?: string[];

  // Convenience features
  autoLoot?: boolean;
  fastTravelPoints?: string[];
  inventorySlots?: number;
  bankVaultSlots?: number;
  mailAttachmentSlots?: number;

  // Prestige features
  factionAccess?: string[];
  vipAreas?: string[];
  npcDialogues?: string[];
  hallOfFameEntry?: boolean;
}

/**
 * A single permanent unlock definition
 */
export interface PermanentUnlock {
  id: string;
  name: string;
  description: string;
  category: UnlockCategory;

  // Requirements to earn
  requirements: UnlockRequirement;

  // What it provides
  effects: UnlockEffect;

  // UI/Display
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  // Metadata
  hidden?: boolean; // Hidden until requirements nearly met
  exclusive?: boolean; // Limited time or special event
  premium?: boolean; // Requires purchase

  // Ordering
  order: number;
}

/**
 * Progress toward earning an unlock
 */
export interface UnlockProgress {
  unlockId: string;
  currentValue: number;
  requiredValue: number;
  percentage: number;
  requirementsMet: boolean;

  // Breakdown of complex requirements
  subProgress?: {
    requirement: string;
    met: boolean;
    current?: number;
    required?: number;
  }[];
}

/**
 * A user's earned unlock
 */
export interface EarnedUnlock {
  unlockId: string;
  earnedAt: Date;
  source: string; // How it was earned (e.g., "achievement:first_kill", "legacy:tier_5")
  claimed?: boolean; // Whether user has seen/acknowledged it
  claimedAt?: Date;
}

/**
 * Complete account unlocks for a user
 */
export interface AccountUnlocks {
  userId: string;

  // All earned unlocks
  unlocks: EarnedUnlock[];

  // Quick lookup for active effects
  activeEffects: {
    totalCharacterSlots: number;
    cosmetics: {
      portraitFrames: string[];
      nameplateColors: string[];
      titles: string[];
      chatBadges: string[];
      profileBackgrounds: string[];
      deathAnimations: string[];
    };
    gameplay: {
      abilities: string[];
      horseBreeds: string[];
      companionTypes: string[];
      unlockedLocations: string[];
      startingLocations: string[];
    };
    convenience: {
      autoLoot: boolean;
      fastTravelPoints: string[];
      extraInventorySlots: number;
      extraBankVaultSlots: number;
      extraMailAttachmentSlots: number;
    };
    prestige: {
      factionAccess: string[];
      vipAreas: string[];
      npcDialogues: string[];
      hallOfFameEntry: boolean;
    };
  };

  // Statistics
  stats: {
    totalUnlocks: number;
    unlocksPerCategory: Record<UnlockCategory, number>;
    firstUnlockDate?: Date;
    lastUnlockDate?: Date;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response for available unlocks
 */
export interface AvailableUnlock extends PermanentUnlock {
  progress: UnlockProgress;
  earned: boolean;
}

/**
 * Unlock notification
 */
export interface UnlockNotification {
  unlockId: string;
  name: string;
  description: string;
  category: UnlockCategory;
  rarity: string;
  icon: string;
  earnedAt: Date;
}

/**
 * Request to claim an unlock
 */
export interface ClaimUnlockRequest {
  unlockId: string;
}

/**
 * Response after claiming unlock
 */
export interface ClaimUnlockResponse {
  success: boolean;
  unlock: PermanentUnlock;
  effects: UnlockEffect;
  newlyUnlocked?: PermanentUnlock[]; // Unlocking one might unlock others
}

/**
 * Unlock trigger event
 */
export interface UnlockTriggerEvent {
  userId: string;
  type: UnlockRequirementType;
  value: number | string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
