/**
 * Leadership Profession Definition
 * Phase 7.2 Crafting Expansion
 * Command and coordination: banners, documents, forgeries, war drums, gang equipment
 */

import {
  CraftingProfession,
  ProfessionId,
  CharacterStat,
  CraftingFacilityType,
  MaterialCategory,
  CraftingSkillTier
} from '@desperados/shared';

export const leadershipProfession: CraftingProfession = {
  id: ProfessionId.LEADERSHIP,
  name: 'Leadership',
  description: 'The art of commanding and inspiring others. Create banners, legal documents, forgeries, war drums, and equipment that boosts gang effectiveness.',

  primaryStat: CharacterStat.CHARISMA,

  facilities: [
    {
      type: CraftingFacilityType.COMMAND_TENT,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for basic leadership crafts'
    },
    {
      type: CraftingFacilityType.PRINTING_PRESS,
      tier: 2,
      optional: true,
      bonusDescription: '+20% quality on documents and forgeries'
    },
    {
      type: CraftingFacilityType.WAR_ROOM,
      tier: 3,
      optional: true,
      bonusDescription: 'Required for strategic items and war equipment'
    }
  ],

  materialCategories: [
    MaterialCategory.PAPER,
    MaterialCategory.INK,
    MaterialCategory.SEAL_COMPONENT,
    MaterialCategory.MORALE_ITEM,
    MaterialCategory.FABRIC,
    MaterialCategory.DYE,
    MaterialCategory.REFINED_METAL,
    MaterialCategory.TANNED_LEATHER
  ],

  skillTiers: [
    { tier: CraftingSkillTier.NOVICE, minLevel: 1, maxLevel: 15, xpMultiplier: 1.0, title: 'Recruit', color: '#808080' },
    { tier: CraftingSkillTier.APPRENTICE, minLevel: 16, maxLevel: 30, xpMultiplier: 1.2, title: 'Lieutenant', color: '#4169E1' },
    { tier: CraftingSkillTier.JOURNEYMAN, minLevel: 31, maxLevel: 50, xpMultiplier: 1.5, title: 'Captain', color: '#000080' },
    { tier: CraftingSkillTier.EXPERT, minLevel: 51, maxLevel: 70, xpMultiplier: 2.0, title: 'Commander', color: '#8B0000' },
    { tier: CraftingSkillTier.MASTER, minLevel: 71, maxLevel: 90, xpMultiplier: 2.5, title: 'General', color: '#FFD700' },
    { tier: CraftingSkillTier.GRANDMASTER, minLevel: 91, maxLevel: 100, xpMultiplier: 3.0, title: 'Legendary Leader', color: '#800080' }
  ],

  bonuses: [
    {
      tier: CraftingSkillTier.NOVICE,
      unlockLevel: 1,
      name: 'Basic Orders',
      description: 'Learn to create simple command documents',
      effect: { xpGain: 5 }
    },
    {
      tier: CraftingSkillTier.APPRENTICE,
      unlockLevel: 20,
      name: 'Forger\'s Hand',
      description: 'Improved quality on documents and papers',
      effect: { qualityChance: 12 }
    },
    {
      tier: CraftingSkillTier.JOURNEYMAN,
      unlockLevel: 40,
      name: 'Battle Standard',
      description: 'Can craft morale-boosting banners',
      effect: { criticalChance: 10, specialAbility: 'banner_crafting' }
    },
    {
      tier: CraftingSkillTier.EXPERT,
      unlockLevel: 60,
      name: 'Master Forger',
      description: 'Forgeries are nearly undetectable',
      effect: { qualityChance: 20, specialAbility: 'master_forgery' }
    },
    {
      tier: CraftingSkillTier.MASTER,
      unlockLevel: 80,
      name: 'War Council',
      description: 'Can craft strategic planning items',
      effect: { craftingSpeed: 20, specialAbility: 'war_planning' }
    },
    {
      tier: CraftingSkillTier.GRANDMASTER,
      unlockLevel: 95,
      name: 'Legendary Commander',
      description: 'All leadership items provide maximum bonuses',
      effect: { criticalChance: 25, materialSavings: 20 }
    }
  ],

  trainerLocations: [
    'fort-redemption',
    'gang-hideout',
    'town-hall',
    'military-outpost'
  ],

  specialization: {
    name: 'War Chief',
    description: 'Focus on combat leadership and gang warfare',
    bonus: '+25% effectiveness on gang buffs, +15% quality on war equipment'
  }
};
