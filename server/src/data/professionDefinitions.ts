/**
 * Profession Definitions
 * Phase 7, Wave 7.1 - Desperados Destiny
 *
 * Complete definitions for all 6 crafting professions
 */

import {
  ProfessionId,
  CharacterStat,
  CraftingSkillTier,
  CraftingFacilityType,
  MaterialCategory,
  CraftingProfession,
  CraftingSkillTierDefinition,
  ProfessionBonus
} from '@desperados/shared';

// ============================================================================
// SKILL TIER DEFINITIONS (Shared by all professions)
// ============================================================================

export const SKILL_TIERS: CraftingSkillTierDefinition[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    minLevel: 1,
    maxLevel: 15,
    xpMultiplier: 1.0,
    title: 'Novice',
    color: '#8B7355' // Brown
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    minLevel: 16,
    maxLevel: 30,
    xpMultiplier: 1.2,
    title: 'Apprentice',
    color: '#C0C0C0' // Silver
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    minLevel: 31,
    maxLevel: 50,
    xpMultiplier: 1.5,
    title: 'Journeyman',
    color: '#4169E1' // Royal Blue
  },
  {
    tier: CraftingSkillTier.EXPERT,
    minLevel: 51,
    maxLevel: 70,
    xpMultiplier: 2.0,
    title: 'Expert',
    color: '#9370DB' // Medium Purple
  },
  {
    tier: CraftingSkillTier.MASTER,
    minLevel: 71,
    maxLevel: 90,
    xpMultiplier: 2.5,
    title: 'Master',
    color: '#FFD700' // Gold
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    minLevel: 91,
    maxLevel: 100,
    xpMultiplier: 3.0,
    title: 'Grandmaster',
    color: '#FF6347' // Legendary Red
  }
];

// ============================================================================
// BLACKSMITHING PROFESSION
// ============================================================================

const BLACKSMITHING_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Apprentice Striker',
    description: 'Learn the basics of working metal at the forge.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Steady Hand',
    description: 'Your strikes become more precise.',
    effect: {
      qualityChance: 5,
      materialSavings: 5
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Master of the Forge',
    description: 'Work faster at the forge and anvil.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Tempered Steel',
    description: 'Your weapons and armor are exceptionally durable.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      specialAbility: 'durability_bonus'
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Craftsman',
    description: 'Your masterwork items are sought across the frontier.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Forgemaster',
    description: 'You can craft legendary weapons and armor of unmatched quality.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const BLACKSMITHING: CraftingProfession = {
  id: ProfessionId.BLACKSMITHING,
  name: 'Blacksmithing',
  description: 'Forge weapons, armor, horseshoes, and metal tools. Masters of fire and metal.',
  primaryStat: CharacterStat.STRENGTH,
  facilities: [
    {
      type: CraftingFacilityType.FORGE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for all metal crafting'
    },
    {
      type: CraftingFacilityType.ANVIL,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for shaping metal'
    },
    {
      type: CraftingFacilityType.QUENCH_TANK,
      tier: 1,
      optional: true,
      bonusDescription: '+10% quality on weapons and armor'
    }
  ],
  materialCategories: [
    MaterialCategory.METAL_ORE,
    MaterialCategory.REFINED_METAL,
    MaterialCategory.PRECIOUS_METAL
  ],
  skillTiers: SKILL_TIERS,
  bonuses: BLACKSMITHING_BONUSES,
  trainerLocations: ['Dusthaven Forge', 'Iron Ridge', 'Silver Creek'],
  specialization: {
    name: 'Master Blacksmith',
    description: 'Specialize in forging the finest weapons and armor in the West.',
    bonus: '+20% quality chance, can craft unique legendary items'
  }
};

// ============================================================================
// LEATHERWORKING PROFESSION
// ============================================================================

const LEATHERWORKING_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Hide Tanner',
    description: 'Learn to work with basic hides and leather.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Skilled Tanner',
    description: 'Work with leather more efficiently.',
    effect: {
      materialSavings: 10,
      qualityChance: 5
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Exotic Leatherworker',
    description: 'Can work with snakeskin, bear leather, and other exotic materials.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10,
      specialAbility: 'exotic_materials'
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Master Tanner',
    description: 'Your armor and goods are lightweight yet durable.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      materialSavings: 15
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Leatherworker',
    description: 'Craft masterwork saddles, holsters, and armor.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Leatherworking Artisan',
    description: 'Your legendary leather goods are unmatched across the frontier.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const LEATHERWORKING: CraftingProfession = {
  id: ProfessionId.LEATHERWORKING,
  name: 'Leatherworking',
  description: 'Craft armor, saddles, holsters, and bags from various hides and leather.',
  primaryStat: CharacterStat.DEXTERITY,
  facilities: [
    {
      type: CraftingFacilityType.TANNING_RACK,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for processing raw hides'
    },
    {
      type: CraftingFacilityType.LEATHER_WORKBENCH,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for leather crafting'
    },
    {
      type: CraftingFacilityType.DYE_VAT,
      tier: 1,
      optional: true,
      bonusDescription: 'Allows custom coloring of leather goods'
    }
  ],
  materialCategories: [
    MaterialCategory.RAW_HIDE,
    MaterialCategory.TANNED_LEATHER,
    MaterialCategory.EXOTIC_HIDE
  ],
  skillTiers: SKILL_TIERS,
  bonuses: LEATHERWORKING_BONUSES,
  trainerLocations: ['Dusthaven Tannery', 'Deadwood Leather Works', 'Snake Creek Trading Post'],
  specialization: {
    name: 'Master Leatherworker',
    description: 'Specialize in crafting the finest leather armor and goods.',
    bonus: '+20% quality chance, +15% material savings'
  }
};

// ============================================================================
// ALCHEMY PROFESSION
// ============================================================================

const ALCHEMY_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Novice Alchemist',
    description: 'Learn the basics of mixing herbs and reagents.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Herbalist',
    description: 'Better understanding of herbal properties.',
    effect: {
      materialSavings: 10,
      qualityChance: 5
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Chemist',
    description: 'Create more potent potions and poisons.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10,
      specialAbility: 'potion_potency'
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Master Alchemist',
    description: 'Craft powerful explosives and rare medicines.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      specialAbility: 'explosive_craft'
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Alchemist',
    description: 'Your concoctions are legendary across the West.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25,
      materialSavings: 20
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Transmutation Master',
    description: 'Unlock the secrets of legendary elixirs and supernatural concoctions.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const ALCHEMY: CraftingProfession = {
  id: ProfessionId.ALCHEMY,
  name: 'Alchemy',
  description: 'Mix potions, poisons, explosives, and medicines from herbs and reagents.',
  primaryStat: CharacterStat.INTELLIGENCE,
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for distilling potions'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for mixing ingredients'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 1,
      optional: true,
      bonusDescription: 'Preserves volatile ingredients longer'
    }
  ],
  materialCategories: [
    MaterialCategory.HERB,
    MaterialCategory.MINERAL,
    MaterialCategory.ANIMAL_PART,
    MaterialCategory.RARE_REAGENT
  ],
  skillTiers: SKILL_TIERS,
  bonuses: ALCHEMY_BONUSES,
  trainerLocations: ['Dusthaven Apothecary', 'Medicine Rock', 'Witch Creek'],
  specialization: {
    name: 'Master Alchemist',
    description: 'Specialize in creating the most potent concoctions in the West.',
    bonus: '+20% quality chance, +20% material savings, double potion duration'
  }
};

// ============================================================================
// COOKING PROFESSION
// ============================================================================

const COOKING_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Camp Cook',
    description: 'Learn basic campfire cooking.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Trail Cook',
    description: 'Cook faster and waste less ingredients.',
    effect: {
      craftingSpeed: 10,
      materialSavings: 10
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Restaurant Chef',
    description: 'Create meals that provide substantial buffs.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10,
      specialAbility: 'buff_duration'
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Master Chef',
    description: 'Your meals provide exceptional benefits.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      specialAbility: 'multi_buff'
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Chef',
    description: 'Your cooking is renowned across the frontier.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Culinary Master',
    description: 'Create legendary feasts that grant powerful long-lasting buffs.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const COOKING: CraftingProfession = {
  id: ProfessionId.COOKING,
  name: 'Cooking',
  description: 'Prepare food and drinks that provide powerful buffs and restore resources.',
  primaryStat: CharacterStat.WISDOM,
  facilities: [
    {
      type: CraftingFacilityType.STOVE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for most recipes'
    },
    {
      type: CraftingFacilityType.SMOKER,
      tier: 1,
      optional: true,
      bonusDescription: 'Preserves meat, adds unique flavors'
    },
    {
      type: CraftingFacilityType.ICE_BOX,
      tier: 1,
      optional: true,
      bonusDescription: 'Keeps ingredients fresh longer'
    }
  ],
  materialCategories: [
    MaterialCategory.MEAT,
    MaterialCategory.VEGETABLE,
    MaterialCategory.SPICE,
    MaterialCategory.ALCOHOL
  ],
  skillTiers: SKILL_TIERS,
  bonuses: COOKING_BONUSES,
  trainerLocations: ['Dusthaven Saloon', 'Silver Fork Restaurant', 'Trail\'s End Inn'],
  specialization: {
    name: 'Master Chef',
    description: 'Specialize in creating exceptional meals with powerful buffs.',
    bonus: '+20% quality chance, +50% buff duration, can craft feast items'
  }
};

// ============================================================================
// TAILORING PROFESSION
// ============================================================================

const TAILORING_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Novice Tailor',
    description: 'Learn basic sewing and mending.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Seamstress',
    description: 'Sew faster and waste less fabric.',
    effect: {
      craftingSpeed: 10,
      materialSavings: 10
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Fashion Designer',
    description: 'Create stylish clothing with charisma bonuses.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10,
      specialAbility: 'charisma_bonus'
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Master Tailor',
    description: 'Craft exceptional disguises and fine clothing.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      specialAbility: 'disguise_bonus'
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Tailor',
    description: 'Your garments are sought by high society and outlaws alike.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Couturier',
    description: 'Create legendary garments that provide exceptional benefits.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const TAILORING: CraftingProfession = {
  id: ProfessionId.TAILORING,
  name: 'Tailoring',
  description: 'Create clothing, disguises, fancy wear, and bags from various fabrics.',
  primaryStat: CharacterStat.CHARISMA,
  facilities: [
    {
      type: CraftingFacilityType.LOOM,
      tier: 1,
      optional: true,
      bonusDescription: 'Required for weaving fabric from raw materials'
    },
    {
      type: CraftingFacilityType.SEWING_TABLE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for all tailoring'
    },
    {
      type: CraftingFacilityType.MANNEQUIN,
      tier: 1,
      optional: true,
      bonusDescription: 'Preview designs, +5% quality'
    }
  ],
  materialCategories: [
    MaterialCategory.FABRIC,
    MaterialCategory.DYE,
    MaterialCategory.ACCESSORY
  ],
  skillTiers: SKILL_TIERS,
  bonuses: TAILORING_BONUSES,
  trainerLocations: ['Dusthaven Tailor Shop', 'High Society Boutique', 'Frontier Fashions'],
  specialization: {
    name: 'Master Tailor',
    description: 'Specialize in creating the finest garments and disguises.',
    bonus: '+20% quality chance, +25% charisma bonus on crafted items'
  }
};

// ============================================================================
// GUNSMITHING PROFESSION
// ============================================================================

const GUNSMITHING_BONUSES: ProfessionBonus[] = [
  {
    tier: CraftingSkillTier.NOVICE,
    unlockLevel: 1,
    name: 'Gun Cleaner',
    description: 'Learn basic gun maintenance and simple repairs.',
    effect: {
      craftingSpeed: 0,
      qualityChance: 0
    }
  },
  {
    tier: CraftingSkillTier.APPRENTICE,
    unlockLevel: 16,
    name: 'Ammunition Crafter',
    description: 'Craft ammunition more efficiently.',
    effect: {
      craftingSpeed: 10,
      materialSavings: 10
    }
  },
  {
    tier: CraftingSkillTier.JOURNEYMAN,
    unlockLevel: 31,
    name: 'Gun Modifier',
    description: 'Add modifications to improve gun performance.',
    effect: {
      craftingSpeed: 15,
      qualityChance: 10,
      specialAbility: 'gun_modifications'
    }
  },
  {
    tier: CraftingSkillTier.EXPERT,
    unlockLevel: 51,
    name: 'Master Gunsmith',
    description: 'Craft exceptional firearms and special ammunition.',
    effect: {
      qualityChance: 15,
      criticalChance: 10,
      specialAbility: 'special_ammo'
    }
  },
  {
    tier: CraftingSkillTier.MASTER,
    unlockLevel: 71,
    name: 'Legendary Gunsmith',
    description: 'Your firearms are legendary across the West.',
    effect: {
      craftingSpeed: 25,
      qualityChance: 20,
      criticalChance: 15,
      xpGain: 25
    }
  },
  {
    tier: CraftingSkillTier.GRANDMASTER,
    unlockLevel: 91,
    name: 'Gun Master',
    description: 'Create legendary firearms of unmatched precision and power.',
    effect: {
      craftingSpeed: 40,
      qualityChance: 30,
      criticalChance: 25,
      specialAbility: 'legendary_craft'
    }
  }
];

export const GUNSMITHING: CraftingProfession = {
  id: ProfessionId.GUNSMITHING,
  name: 'Gunsmithing',
  description: 'Modify, repair, and craft firearms and ammunition for the frontier.',
  primaryStat: CharacterStat.PERCEPTION,
  facilities: [
    {
      type: CraftingFacilityType.GUN_LATHE,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for gun modifications'
    },
    {
      type: CraftingFacilityType.POWDER_PRESS,
      tier: 1,
      optional: false,
      bonusDescription: 'Required for ammunition crafting'
    },
    {
      type: CraftingFacilityType.TEST_RANGE,
      tier: 1,
      optional: true,
      bonusDescription: 'Test firearms, +10% quality on guns'
    }
  ],
  materialCategories: [
    MaterialCategory.GUNPOWDER,
    MaterialCategory.AMMUNITION_COMPONENT,
    MaterialCategory.GUN_PART,
    MaterialCategory.WOOD
  ],
  skillTiers: SKILL_TIERS,
  bonuses: GUNSMITHING_BONUSES,
  trainerLocations: ['Dusthaven Gun Shop', 'Iron Ridge Armory', 'Deadshot\'s Workshop'],
  specialization: {
    name: 'Master Gunsmith',
    description: 'Specialize in crafting and modifying the deadliest firearms.',
    bonus: '+20% quality chance, +15% damage on crafted weapons'
  }
};

// ============================================================================
// PROFESSION REGISTRY
// ============================================================================

export const ALL_PROFESSIONS: CraftingProfession[] = [
  BLACKSMITHING,
  LEATHERWORKING,
  ALCHEMY,
  COOKING,
  TAILORING,
  GUNSMITHING
];

export const PROFESSION_MAP = new Map<ProfessionId, CraftingProfession>([
  [ProfessionId.BLACKSMITHING, BLACKSMITHING],
  [ProfessionId.LEATHERWORKING, LEATHERWORKING],
  [ProfessionId.ALCHEMY, ALCHEMY],
  [ProfessionId.COOKING, COOKING],
  [ProfessionId.TAILORING, TAILORING],
  [ProfessionId.GUNSMITHING, GUNSMITHING]
]);

/**
 * Get profession definition by ID
 */
export function getProfession(id: ProfessionId): CraftingProfession | undefined {
  return PROFESSION_MAP.get(id);
}

/**
 * Get all professions
 */
export function getAllProfessions(): CraftingProfession[] {
  return ALL_PROFESSIONS;
}

/**
 * Get professions that use a specific stat
 */
export function getProfessionsByStat(stat: CharacterStat): CraftingProfession[] {
  return ALL_PROFESSIONS.filter(p => p.primaryStat === stat);
}

/**
 * Get professions that use a specific material category
 */
export function getProfessionsByMaterial(category: MaterialCategory): CraftingProfession[] {
  return ALL_PROFESSIONS.filter(p => p.materialCategories.includes(category));
}
