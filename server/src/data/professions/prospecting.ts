/**
 * Prospecting Profession Definition
 * Phase 7.2 Crafting Expansion
 * Mining and ore processing: refined metals, explosives, mining equipment
 */

import {
  CraftingProfession,
  ProfessionId,
  CharacterStat,
  CraftingFacilityType,
  MaterialCategory,
  CraftingSkillTier
} from '@desperados/shared';

export const prospectingProfession: CraftingProfession = {
  id: ProfessionId.PROSPECTING,
  name: 'Prospecting',
  description: 'The science of finding and refining precious metals. Process ores, craft explosives, and create specialized mining equipment.',

  primaryStat: CharacterStat.STRENGTH,

  facilities: [
    {
      type: CraftingFacilityType.ASSAY_TABLE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for ore analysis and basic refining'
    },
    {
      type: CraftingFacilityType.ORE_REFINERY,
      tier: 2,
      optional: false,
      bonusDescription: 'Required for metal smelting'
    },
    {
      type: CraftingFacilityType.BLAST_FURNACE,
      tier: 3,
      optional: true,
      bonusDescription: '+20% yield on rare metal refining'
    }
  ],

  materialCategories: [
    MaterialCategory.CRUDE_ORE,
    MaterialCategory.METAL_ORE,
    MaterialCategory.GEOLOGICAL_SAMPLE,
    MaterialCategory.EXPLOSIVE_COMPONENT,
    MaterialCategory.GEM,
    MaterialCategory.REFINED_METAL,
    MaterialCategory.PRECIOUS_METAL,
    MaterialCategory.MINERAL
  ],

  skillTiers: [
    { tier: CraftingSkillTier.NOVICE, minLevel: 1, maxLevel: 15, xpMultiplier: 1.0, title: 'Greenhorn', color: '#8B4513' },
    { tier: CraftingSkillTier.APPRENTICE, minLevel: 16, maxLevel: 30, xpMultiplier: 1.2, title: 'Prospector', color: '#A0522D' },
    { tier: CraftingSkillTier.JOURNEYMAN, minLevel: 31, maxLevel: 50, xpMultiplier: 1.5, title: 'Miner', color: '#B8860B' },
    { tier: CraftingSkillTier.EXPERT, minLevel: 51, maxLevel: 70, xpMultiplier: 2.0, title: 'Assayer', color: '#DAA520' },
    { tier: CraftingSkillTier.MASTER, minLevel: 71, maxLevel: 90, xpMultiplier: 2.5, title: 'Mining Engineer', color: '#FFD700' },
    { tier: CraftingSkillTier.GRANDMASTER, minLevel: 91, maxLevel: 100, xpMultiplier: 3.0, title: 'Mining Baron', color: '#E5E4E2' }
  ],

  bonuses: [
    {
      tier: CraftingSkillTier.NOVICE,
      unlockLevel: 1,
      name: 'Gold Fever',
      description: 'Begin learning to identify ore types',
      effect: { xpGain: 5 }
    },
    {
      tier: CraftingSkillTier.APPRENTICE,
      unlockLevel: 20,
      name: 'Keen Eye',
      description: 'Better yield from raw ore processing',
      effect: { materialSavings: 10 }
    },
    {
      tier: CraftingSkillTier.JOURNEYMAN,
      unlockLevel: 40,
      name: 'Powder Monkey',
      description: 'Improved quality when crafting explosives',
      effect: { qualityChance: 12 }
    },
    {
      tier: CraftingSkillTier.EXPERT,
      unlockLevel: 60,
      name: 'Mother Lode',
      description: 'Chance for bonus refined materials',
      effect: { criticalChance: 15, specialAbility: 'bonus_yield' }
    },
    {
      tier: CraftingSkillTier.MASTER,
      unlockLevel: 80,
      name: 'Starmetal Sense',
      description: 'Can identify and process supernatural ores',
      effect: { qualityChance: 20, specialAbility: 'supernatural_ore' }
    },
    {
      tier: CraftingSkillTier.GRANDMASTER,
      unlockLevel: 95,
      name: 'Midas Touch',
      description: 'Maximum yield and quality on all ore processing',
      effect: { materialSavings: 25, craftingSpeed: 30 }
    }
  ],

  trainerLocations: [
    'silver-strike-mines',
    'devils-gulch',
    'copper-canyon',
    'assay-office-dusty-hollow'
  ],

  specialization: {
    name: 'Master Assayer',
    description: 'Focus on precious metal extraction',
    bonus: '+30% yield on gold and silver, +15% on rare gems'
  }
};
