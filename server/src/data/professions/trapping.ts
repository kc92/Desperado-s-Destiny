/**
 * Trapping Profession Definition
 * Phase 7.2 Crafting Expansion
 * Trapping and taxidermy: traps, bait, fur processing, trophy mounts
 */

import {
  CraftingProfession,
  ProfessionId,
  CharacterStat,
  CraftingFacilityType,
  MaterialCategory,
  CraftingSkillTier
} from '@desperados/shared';

export const trappingProfession: CraftingProfession = {
  id: ProfessionId.TRAPPING,
  name: 'Trapping',
  description: 'The mountain man tradition of trapping game. Craft traps, prepare bait, process furs, and create trophy mounts from your catches.',

  primaryStat: CharacterStat.PERCEPTION,

  facilities: [
    {
      type: CraftingFacilityType.SKINNING_RACK,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for pelt and hide processing'
    },
    {
      type: CraftingFacilityType.BAIT_STATION,
      tier: 2,
      optional: true,
      bonusDescription: '+15% effectiveness on crafted baits'
    },
    {
      type: CraftingFacilityType.TAXIDERMY_STAND,
      tier: 3,
      optional: true,
      bonusDescription: 'Required for trophy mounts'
    }
  ],

  materialCategories: [
    MaterialCategory.FUR,
    MaterialCategory.TROPHY_PART,
    MaterialCategory.BAIT_COMPONENT,
    MaterialCategory.TRAP_COMPONENT,
    MaterialCategory.RAW_HIDE,
    MaterialCategory.ANIMAL_PART,
    MaterialCategory.BONE,
    MaterialCategory.MEAT
  ],

  skillTiers: [
    { tier: CraftingSkillTier.NOVICE, minLevel: 1, maxLevel: 15, xpMultiplier: 1.0, title: 'Snare Setter', color: '#8B4513' },
    { tier: CraftingSkillTier.APPRENTICE, minLevel: 16, maxLevel: 30, xpMultiplier: 1.2, title: 'Trapper', color: '#A0522D' },
    { tier: CraftingSkillTier.JOURNEYMAN, minLevel: 31, maxLevel: 50, xpMultiplier: 1.5, title: 'Fur Trader', color: '#CD853F' },
    { tier: CraftingSkillTier.EXPERT, minLevel: 51, maxLevel: 70, xpMultiplier: 2.0, title: 'Mountain Man', color: '#D2691E' },
    { tier: CraftingSkillTier.MASTER, minLevel: 71, maxLevel: 90, xpMultiplier: 2.5, title: 'Master Trapper', color: '#8B0000' },
    { tier: CraftingSkillTier.GRANDMASTER, minLevel: 91, maxLevel: 100, xpMultiplier: 3.0, title: 'Legendary Hunter', color: '#800080' }
  ],

  bonuses: [
    {
      tier: CraftingSkillTier.NOVICE,
      unlockLevel: 1,
      name: 'Trap Basics',
      description: 'Learn to craft simple snares and traps',
      effect: { xpGain: 5 }
    },
    {
      tier: CraftingSkillTier.APPRENTICE,
      unlockLevel: 20,
      name: 'Clean Skinning',
      description: 'Improved pelt quality from processing',
      effect: { qualityChance: 12 }
    },
    {
      tier: CraftingSkillTier.JOURNEYMAN,
      unlockLevel: 40,
      name: 'Bait Master',
      description: 'Crafted baits are more effective',
      effect: { criticalChance: 10, specialAbility: 'potent_bait' }
    },
    {
      tier: CraftingSkillTier.EXPERT,
      unlockLevel: 60,
      name: 'Prime Pelts',
      description: 'Chance to get rare pelt quality',
      effect: { qualityChance: 18, materialSavings: 10 }
    },
    {
      tier: CraftingSkillTier.MASTER,
      unlockLevel: 80,
      name: 'Taxidermy Arts',
      description: 'Create impressive trophy mounts',
      effect: { criticalChance: 15, specialAbility: 'taxidermy' }
    },
    {
      tier: CraftingSkillTier.GRANDMASTER,
      unlockLevel: 95,
      name: 'Spirit Trapper',
      description: 'Can process supernatural creature materials',
      effect: { qualityChance: 25, specialAbility: 'spirit_trapping' }
    }
  ],

  trainerLocations: [
    'mountain-mans-cabin',
    'beaver-creek',
    'fur-trading-post',
    'wilderness-outpost'
  ],

  specialization: {
    name: 'Master Taxidermist',
    description: 'Focus on trophy creation and display',
    bonus: '+30% quality on taxidermy, mounts provide morale bonuses to properties'
  }
};
