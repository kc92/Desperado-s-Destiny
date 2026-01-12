/**
 * Native Crafts Profession Definition
 * Phase 7.2 Crafting Expansion
 * Traditional crafting: bows, totems, beadwork, medicine bags, ceremonial items
 */

import {
  CraftingProfession,
  ProfessionId,
  CharacterStat,
  CraftingFacilityType,
  MaterialCategory,
  CraftingSkillTier
} from '@desperados/shared';

export const nativeCraftsProfession: CraftingProfession = {
  id: ProfessionId.NATIVE_CRAFTS,
  name: 'Native Crafts',
  description: 'The traditional arts passed down through generations. Create bows, totems, beadwork, and sacred medicine items using natural materials and spiritual knowledge.',

  primaryStat: CharacterStat.WISDOM,

  facilities: [
    {
      type: CraftingFacilityType.CRAFT_CIRCLE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for basic crafting'
    },
    {
      type: CraftingFacilityType.MEDICINE_LODGE,
      tier: 2,
      optional: true,
      bonusDescription: '+15% quality for medicine items'
    },
    {
      type: CraftingFacilityType.SACRED_FIRE,
      tier: 3,
      optional: true,
      bonusDescription: 'Required for ceremonial and spirit items'
    }
  ],

  materialCategories: [
    MaterialCategory.FEATHER,
    MaterialCategory.BONE,
    MaterialCategory.BEAD,
    MaterialCategory.QUILL,
    MaterialCategory.SACRED_HERB,
    MaterialCategory.SPIRIT_COMPONENT,
    MaterialCategory.TOTEM_PART,
    MaterialCategory.RAW_HIDE,
    MaterialCategory.WOOD
  ],

  skillTiers: [
    { tier: CraftingSkillTier.NOVICE, minLevel: 1, maxLevel: 15, xpMultiplier: 1.0, title: 'Apprentice', color: '#8B4513' },
    { tier: CraftingSkillTier.APPRENTICE, minLevel: 16, maxLevel: 30, xpMultiplier: 1.2, title: 'Crafter', color: '#CD853F' },
    { tier: CraftingSkillTier.JOURNEYMAN, minLevel: 31, maxLevel: 50, xpMultiplier: 1.5, title: 'Artisan', color: '#DAA520' },
    { tier: CraftingSkillTier.EXPERT, minLevel: 51, maxLevel: 70, xpMultiplier: 2.0, title: 'Master Artisan', color: '#FFD700' },
    { tier: CraftingSkillTier.MASTER, minLevel: 71, maxLevel: 90, xpMultiplier: 2.5, title: 'Elder Crafter', color: '#00CED1' },
    { tier: CraftingSkillTier.GRANDMASTER, minLevel: 91, maxLevel: 100, xpMultiplier: 3.0, title: 'Spirit Keeper', color: '#9400D3' }
  ],

  bonuses: [
    {
      tier: CraftingSkillTier.NOVICE,
      unlockLevel: 1,
      name: 'Traditional Knowledge',
      description: 'Begin learning the old ways',
      effect: { xpGain: 5 }
    },
    {
      tier: CraftingSkillTier.APPRENTICE,
      unlockLevel: 20,
      name: 'Feather Master',
      description: 'Improved quality when crafting with feathers',
      effect: { qualityChance: 10 }
    },
    {
      tier: CraftingSkillTier.JOURNEYMAN,
      unlockLevel: 40,
      name: 'Spirit Touched',
      description: 'Chance to create items with minor spiritual properties',
      effect: { criticalChance: 8 }
    },
    {
      tier: CraftingSkillTier.EXPERT,
      unlockLevel: 60,
      name: 'Medicine Way',
      description: 'Medicine items are more potent',
      effect: { qualityChance: 15, specialAbility: 'medicine_potency' }
    },
    {
      tier: CraftingSkillTier.MASTER,
      unlockLevel: 80,
      name: 'Elder Wisdom',
      description: 'Reduced material costs and faster crafting',
      effect: { materialSavings: 15, craftingSpeed: 20 }
    },
    {
      tier: CraftingSkillTier.GRANDMASTER,
      unlockLevel: 95,
      name: 'Spirit Walker',
      description: 'Can craft legendary spirit totems and sacred items',
      effect: { criticalChance: 20, specialAbility: 'spirit_crafting' }
    }
  ],

  trainerLocations: [
    'sacred-springs',
    'medicine-wheel',
    'nahi-village',
    'spirit-canyon'
  ],

  specialization: {
    name: 'Sacred Crafter',
    description: 'Focus on spiritual and ceremonial items',
    bonus: '+25% quality and +10% chance for spiritual effects on all sacred items'
  }
};
