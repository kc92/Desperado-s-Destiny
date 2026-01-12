/**
 * Woodworking Profession Definition
 * Phase 7.2 Crafting Expansion
 * Carpentry and wood crafts: tool handles, gun stocks, bows, furniture
 */

import {
  CraftingProfession,
  ProfessionId,
  CharacterStat,
  CraftingFacilityType,
  MaterialCategory,
  CraftingSkillTier
} from '@desperados/shared';

export const woodworkingProfession: CraftingProfession = {
  id: ProfessionId.WOODWORKING,
  name: 'Woodworking',
  description: 'The craft of shaping wood into useful items. Create tool handles, weapon stocks, bows, and furniture from frontier timber.',

  primaryStat: CharacterStat.DEXTERITY,

  facilities: [
    {
      type: CraftingFacilityType.WOODWORKING_BENCH,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for basic woodworking'
    },
    {
      type: CraftingFacilityType.WOOD_LATHE,
      tier: 2,
      optional: true,
      bonusDescription: '+10% quality on turned items'
    },
    {
      type: CraftingFacilityType.SAWMILL,
      tier: 3,
      optional: true,
      bonusDescription: '+25% lumber yield from raw logs'
    }
  ],

  materialCategories: [
    MaterialCategory.RAW_WOOD,
    MaterialCategory.LUMBER,
    MaterialCategory.EXOTIC_WOOD,
    MaterialCategory.RESIN,
    MaterialCategory.WOOD,
    MaterialCategory.ANIMAL_PART, // For glue
    MaterialCategory.REFINED_METAL // For hardware
  ],

  skillTiers: [
    { tier: CraftingSkillTier.NOVICE, minLevel: 1, maxLevel: 15, xpMultiplier: 1.0, title: 'Whittler', color: '#DEB887' },
    { tier: CraftingSkillTier.APPRENTICE, minLevel: 16, maxLevel: 30, xpMultiplier: 1.2, title: 'Carpenter', color: '#D2691E' },
    { tier: CraftingSkillTier.JOURNEYMAN, minLevel: 31, maxLevel: 50, xpMultiplier: 1.5, title: 'Joiner', color: '#8B4513' },
    { tier: CraftingSkillTier.EXPERT, minLevel: 51, maxLevel: 70, xpMultiplier: 2.0, title: 'Woodwright', color: '#A0522D' },
    { tier: CraftingSkillTier.MASTER, minLevel: 71, maxLevel: 90, xpMultiplier: 2.5, title: 'Master Craftsman', color: '#CD853F' },
    { tier: CraftingSkillTier.GRANDMASTER, minLevel: 91, maxLevel: 100, xpMultiplier: 3.0, title: 'Artisan Woodworker', color: '#DAA520' }
  ],

  bonuses: [
    {
      tier: CraftingSkillTier.NOVICE,
      unlockLevel: 1,
      name: 'Steady Hands',
      description: 'Begin learning basic woodworking',
      effect: { xpGain: 5 }
    },
    {
      tier: CraftingSkillTier.APPRENTICE,
      unlockLevel: 20,
      name: 'Wood Grain Reading',
      description: 'Better material selection reduces waste',
      effect: { materialSavings: 10 }
    },
    {
      tier: CraftingSkillTier.JOURNEYMAN,
      unlockLevel: 40,
      name: 'Stock Maker',
      description: 'Improved quality on weapon stocks and handles',
      effect: { qualityChance: 15 }
    },
    {
      tier: CraftingSkillTier.EXPERT,
      unlockLevel: 60,
      name: 'Bow Maker',
      description: 'Can craft masterwork bows and crossbows',
      effect: { criticalChance: 12, specialAbility: 'bow_crafting' }
    },
    {
      tier: CraftingSkillTier.MASTER,
      unlockLevel: 80,
      name: 'Spirit Wood',
      description: 'Can work with supernatural wood types',
      effect: { qualityChance: 20, specialAbility: 'spirit_wood' }
    },
    {
      tier: CraftingSkillTier.GRANDMASTER,
      unlockLevel: 95,
      name: 'Living Wood',
      description: 'Items crafted seem almost alive with quality',
      effect: { craftingSpeed: 25, criticalChance: 25 }
    }
  ],

  trainerLocations: [
    'dusty-hollow-carpentry',
    'lumber-camp',
    'frontier-workshop',
    'oak-ridge-settlement'
  ],

  specialization: {
    name: 'Master Bow Maker',
    description: 'Specialize in bow and weapon stock crafting',
    bonus: '+25% quality on bows and weapon components, weapons gain +5% damage'
  }
};
