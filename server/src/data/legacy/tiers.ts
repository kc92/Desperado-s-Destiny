/**
 * Legacy Tier Definitions
 * Defines tier requirements and bonuses
 */

import {
  LegacyTier,
  LegacyTierDefinition,
  LegacyBonusType,
} from '@desperados/shared';

export const LEGACY_TIER_DEFINITIONS: Record<LegacyTier, LegacyTierDefinition> =
  {
    [LegacyTier.NONE]: {
      tier: LegacyTier.NONE,
      milestonesRequired: 0,
      bonuses: [],
      displayName: 'Newcomer',
      description: 'Just starting your legacy in the West',
      color: '#808080',
    },

    [LegacyTier.BRONZE]: {
      tier: LegacyTier.BRONZE,
      milestonesRequired: 10,
      bonuses: [
        {
          type: LegacyBonusType.XP_MULTIPLIER,
          value: 0.05,
          description: '+5% XP gain on all actions',
          displayName: 'Bronze XP Boost',
          icon: 'xp-boost',
        },
        {
          type: LegacyBonusType.STARTING_GOLD,
          value: 100,
          description: 'Start new characters with +100 gold',
          displayName: 'Bronze Starting Fund',
          icon: 'coin',
        },
      ],
      displayName: 'Bronze Legacy',
      description:
        'Your name is starting to be known across the frontier. The basics are mastered.',
      color: '#CD7F32',
    },

    [LegacyTier.SILVER]: {
      tier: LegacyTier.SILVER,
      milestonesRequired: 25,
      bonuses: [
        {
          type: LegacyBonusType.XP_MULTIPLIER,
          value: 0.1,
          description: '+10% XP gain on all actions',
          displayName: 'Silver XP Boost',
          icon: 'xp-boost',
        },
        {
          type: LegacyBonusType.GOLD_MULTIPLIER,
          value: 0.05,
          description: '+5% gold earned from all sources',
          displayName: 'Silver Gold Boost',
          icon: 'gold-boost',
        },
        {
          type: LegacyBonusType.STARTING_GOLD,
          value: 250,
          description: 'Start new characters with +250 gold',
          displayName: 'Silver Starting Fund',
          icon: 'coin',
        },
        {
          type: LegacyBonusType.STARTING_ITEMS,
          value: ['iron_revolver', 'leather_vest'],
          description: 'Start with Iron Revolver and Leather Vest',
          displayName: 'Silver Starter Gear',
          icon: 'gear',
        },
      ],
      displayName: 'Silver Legacy',
      description:
        'Your reputation precedes you. Towns recognize your family name.',
      color: '#C0C0C0',
    },

    [LegacyTier.GOLD]: {
      tier: LegacyTier.GOLD,
      milestonesRequired: 50,
      bonuses: [
        {
          type: LegacyBonusType.XP_MULTIPLIER,
          value: 0.15,
          description: '+15% XP gain on all actions',
          displayName: 'Gold XP Boost',
          icon: 'xp-boost',
        },
        {
          type: LegacyBonusType.GOLD_MULTIPLIER,
          value: 0.1,
          description: '+10% gold earned from all sources',
          displayName: 'Gold Gold Boost',
          icon: 'gold-boost',
        },
        {
          type: LegacyBonusType.STARTING_GOLD,
          value: 500,
          description: 'Start new characters with +500 gold',
          displayName: 'Gold Starting Fund',
          icon: 'coin',
        },
        {
          type: LegacyBonusType.STARTING_ITEMS,
          value: [
            'steel_revolver',
            'reinforced_vest',
            'riding_boots',
            'travelers_hat',
          ],
          description:
            'Start with Steel Revolver, Reinforced Vest, Riding Boots, and Traveler\'s Hat',
          displayName: 'Gold Starter Gear',
          icon: 'gear',
        },
        {
          type: LegacyBonusType.STARTING_SKILLS,
          value: 10,
          description: 'Start with +10 skill points',
          displayName: 'Gold Skill Bonus',
          icon: 'brain',
        },
        {
          type: LegacyBonusType.ENERGY_BONUS,
          value: 0.1,
          description: '+10% maximum energy',
          displayName: 'Gold Energy Boost',
          icon: 'energy',
        },
      ],
      displayName: 'Gold Legacy',
      description:
        'Your lineage is respected across the territories. You have proven yourself time and again.',
      color: '#FFD700',
    },

    [LegacyTier.PLATINUM]: {
      tier: LegacyTier.PLATINUM,
      milestonesRequired: 75, // Adjusted: Legendary now at 100
      bonuses: [
        {
          type: LegacyBonusType.XP_MULTIPLIER,
          value: 0.2,
          description: '+20% XP gain on all actions',
          displayName: 'Platinum XP Boost',
          icon: 'xp-boost',
        },
        {
          type: LegacyBonusType.GOLD_MULTIPLIER,
          value: 0.15,
          description: '+15% gold earned from all sources',
          displayName: 'Platinum Gold Boost',
          icon: 'gold-boost',
        },
        {
          type: LegacyBonusType.STARTING_GOLD,
          value: 1000,
          description: 'Start new characters with +1000 gold',
          displayName: 'Platinum Starting Fund',
          icon: 'coin',
        },
        {
          type: LegacyBonusType.STARTING_ITEMS,
          value: [
            'masterwork_revolver',
            'reinforced_duster',
            'combat_boots',
            'wide_brim_hat',
            'silver_spurs',
            'engraved_belt',
          ],
          description: 'Start with premium equipment set',
          displayName: 'Platinum Starter Gear',
          icon: 'gear',
        },
        {
          type: LegacyBonusType.STARTING_SKILLS,
          value: 20,
          description: 'Start with +20 skill points',
          displayName: 'Platinum Skill Bonus',
          icon: 'brain',
        },
        {
          type: LegacyBonusType.STARTING_REPUTATION,
          value: 500,
          description: 'Start with +500 reputation',
          displayName: 'Platinum Reputation',
          icon: 'medal',
        },
        {
          type: LegacyBonusType.ENERGY_BONUS,
          value: 0.15,
          description: '+15% maximum energy',
          displayName: 'Platinum Energy Boost',
          icon: 'energy',
        },
        {
          type: LegacyBonusType.FAME_BONUS,
          value: 0.1,
          description: '+10% Fame gain',
          displayName: 'Platinum Fame Boost',
          icon: 'star',
        },
        {
          type: LegacyBonusType.UNLOCK_CLASS,
          value: 'legendary_gunslinger',
          description: 'Unlock Legendary Gunslinger class',
          displayName: 'Legendary Class',
          icon: 'class',
        },
        {
          type: LegacyBonusType.UNLOCK_CLASS,
          value: 'pathfinder',
          description: 'Unlock Pathfinder class',
          displayName: 'Pathfinder Class',
          icon: 'class',
        },
      ],
      displayName: 'Platinum Legacy',
      description:
        'Your family name is legendary. Songs are sung about your ancestors.',
      color: '#E5E4E2',
    },

    [LegacyTier.LEGENDARY]: {
      tier: LegacyTier.LEGENDARY,
      milestonesRequired: 100, // Reduced from 200 - only ~64 milestones exist in game
      bonuses: [
        {
          type: LegacyBonusType.XP_MULTIPLIER,
          value: 0.25,
          description: '+25% XP gain on all actions',
          displayName: 'Legendary XP Boost',
          icon: 'xp-boost',
        },
        {
          type: LegacyBonusType.GOLD_MULTIPLIER,
          value: 0.2,
          description: '+20% gold earned from all sources',
          displayName: 'Legendary Gold Boost',
          icon: 'gold-boost',
        },
        {
          type: LegacyBonusType.STARTING_GOLD,
          value: 2000,
          description: 'Start new characters with +2000 gold',
          displayName: 'Legendary Starting Fund',
          icon: 'coin',
        },
        {
          type: LegacyBonusType.STARTING_ITEMS,
          value: [
            'legendary_revolver',
            'legendary_duster',
            'legendary_boots',
            'legendary_hat',
            'golden_spurs',
            'masterwork_belt',
            'heirloom_rifle',
            'family_heirloom',
          ],
          description: 'Start with legendary equipment set',
          displayName: 'Legendary Starter Gear',
          icon: 'gear',
        },
        {
          type: LegacyBonusType.STARTING_SKILLS,
          value: 50,
          description: 'Start with +50 skill points',
          displayName: 'Legendary Skill Bonus',
          icon: 'brain',
        },
        {
          type: LegacyBonusType.STARTING_REPUTATION,
          value: 1000,
          description: 'Start with +1000 reputation',
          displayName: 'Legendary Reputation',
          icon: 'medal',
        },
        {
          type: LegacyBonusType.ENERGY_BONUS,
          value: 0.25,
          description: '+25% maximum energy',
          displayName: 'Legendary Energy Boost',
          icon: 'energy',
        },
        {
          type: LegacyBonusType.FAME_BONUS,
          value: 0.15,
          description: '+15% Fame gain',
          displayName: 'Legendary Fame Boost',
          icon: 'star',
        },
        {
          type: LegacyBonusType.UNLOCK_CLASS,
          value: 'legendary_gunslinger',
          description: 'Unlock Legendary Gunslinger class',
          displayName: 'Legendary Gunslinger',
          icon: 'class',
        },
        {
          type: LegacyBonusType.UNLOCK_CLASS,
          value: 'pathfinder',
          description: 'Unlock Pathfinder class',
          displayName: 'Pathfinder',
          icon: 'class',
        },
        {
          type: LegacyBonusType.UNLOCK_CLASS,
          value: 'chronicle_keeper',
          description: 'Unlock Chronicle Keeper class',
          displayName: 'Chronicle Keeper',
          icon: 'class',
        },
        {
          type: LegacyBonusType.UNLOCK_FEATURE,
          value: 'legendary_quests',
          description: 'Access to exclusive legendary quest lines',
          displayName: 'Legendary Quests',
          icon: 'quest',
        },
        {
          type: LegacyBonusType.UNLOCK_FEATURE,
          value: 'vip_areas',
          description: 'Access to VIP areas and exclusive content',
          displayName: 'VIP Access',
          icon: 'vip',
        },
        {
          type: LegacyBonusType.COSMETIC,
          value: 'legendary_title',
          description: 'Exclusive "The Legendary" title',
          displayName: 'Legendary Title',
          icon: 'title',
        },
        {
          type: LegacyBonusType.COSMETIC,
          value: 'legendary_aura',
          description: 'Exclusive visual aura effect',
          displayName: 'Legendary Aura',
          icon: 'aura',
        },
        {
          type: LegacyBonusType.COSMETIC,
          value: 'golden_name_color',
          description: 'Golden name color in-game',
          displayName: 'Golden Name',
          icon: 'name',
        },
      ],
      displayName: 'Legendary Legacy',
      description:
        'Your name will echo through eternity. You are a true Legend of the West.',
      color: '#FF4500',
    },
  };

/**
 * Get tier definition by tier enum
 */
export function getTierDefinition(tier: LegacyTier): LegacyTierDefinition {
  return LEGACY_TIER_DEFINITIONS[tier];
}

/**
 * Get all tier definitions in order
 */
export function getAllTierDefinitions(): LegacyTierDefinition[] {
  return [
    LEGACY_TIER_DEFINITIONS[LegacyTier.NONE],
    LEGACY_TIER_DEFINITIONS[LegacyTier.BRONZE],
    LEGACY_TIER_DEFINITIONS[LegacyTier.SILVER],
    LEGACY_TIER_DEFINITIONS[LegacyTier.GOLD],
    LEGACY_TIER_DEFINITIONS[LegacyTier.PLATINUM],
    LEGACY_TIER_DEFINITIONS[LegacyTier.LEGENDARY],
  ];
}

/**
 * Get next tier based on current tier
 */
export function getNextTier(
  currentTier: LegacyTier
): LegacyTierDefinition | null {
  const tiers = [
    LegacyTier.NONE,
    LegacyTier.BRONZE,
    LegacyTier.SILVER,
    LegacyTier.GOLD,
    LegacyTier.PLATINUM,
    LegacyTier.LEGENDARY,
  ];

  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null; // Already at max tier
  }

  return LEGACY_TIER_DEFINITIONS[tiers[currentIndex + 1]];
}

/**
 * Calculate tier based on milestones completed
 */
export function calculateTierFromMilestones(
  milestonesCompleted: number
): LegacyTier {
  if (milestonesCompleted >= 100) return LegacyTier.LEGENDARY; // Reduced from 200
  if (milestonesCompleted >= 75) return LegacyTier.PLATINUM; // Adjusted for new Legendary threshold
  if (milestonesCompleted >= 50) return LegacyTier.GOLD;
  if (milestonesCompleted >= 25) return LegacyTier.SILVER;
  if (milestonesCompleted >= 10) return LegacyTier.BRONZE;
  return LegacyTier.NONE;
}

/**
 * Get milestones needed for next tier
 */
export function getMilestonesUntilNextTier(
  currentMilestones: number,
  currentTier: LegacyTier
): number | null {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;

  return Math.max(0, nextTier.milestonesRequired - currentMilestones);
}
