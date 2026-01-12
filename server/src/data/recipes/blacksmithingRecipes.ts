/**
 * Blacksmithing Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Master craftsmen of metal - forge weapons, armor, and tools
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType,
  CurseType,
  BlessingType
} from '@desperados/shared';

export const blacksmithingRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================

  // -------------------------------------------------------------------------
  // SMELTING/REFINING RECIPES (Level 1-5) - Core Material Processing
  // -------------------------------------------------------------------------
  {
    id: 'bs_smelt_iron_bar',
    name: 'Smelt Iron Bar',
    description: 'Smelt raw iron ore into usable iron bars. The foundation of blacksmithing.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_ore',
        materialName: 'Iron Ore',
        category: MaterialCategory.METAL_ORE,
        quantity: 3
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_bar',
      itemName: 'Iron Bar',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 3,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'smelting', 'refining', 'basic']
  },
  {
    id: 'bs_smelt_silver_bar',
    name: 'Smelt Silver Bar',
    description: 'Refine silver ore into gleaming silver bars for fine metalwork.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'silver_ore',
        materialName: 'Silver Ore',
        category: MaterialCategory.METAL_ORE,
        quantity: 4
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'silver_bar',
      itemName: 'Silver Bar',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'smelting', 'refining', 'precious']
  },
  {
    id: 'bs_smelt_gold_bar',
    name: 'Smelt Gold Bar',
    description: 'Transform gold nuggets and ore into pure gold bars.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'gold_ore',
        materialName: 'Gold Ore',
        category: MaterialCategory.METAL_ORE,
        quantity: 3
      },
      {
        materialId: 'gold_nugget',
        materialName: 'Gold Nugget',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'gold_bar',
      itemName: 'Gold Bar',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 40,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'smelting', 'refining', 'precious']
  },
  {
    id: 'bs_forge_steel_bar',
    name: 'Forge Steel Bar',
    description: 'Combine iron bars with additional carbon to create stronger steel.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'steel_bar',
      itemName: 'Steel Bar',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 45,
    difficulty: 15,
    xpGain: 20,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'smelting', 'refining', 'steel']
  },
  {
    id: 'bs_salvage_metal_scrap',
    name: 'Salvage Metal Scrap',
    description: 'Melt down scrap metal to recover usable iron.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'metal_scrap',
        materialName: 'Metal Scrap',
        category: MaterialCategory.METAL_ORE,
        quantity: 4
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_bar',
      itemName: 'Iron Bar',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 25,
    difficulty: 4,
    xpGain: 7,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'salvage', 'recycling']
  },
  {
    id: 'bs_salvage_broken_weapon',
    name: 'Salvage Broken Weapon',
    description: 'Break down a damaged weapon for usable metal parts.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'broken_weapon',
        materialName: 'Broken Weapon',
        category: MaterialCategory.METAL_ORE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_bar',
      itemName: 'Iron Bar',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 35,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'salvage', 'recycling']
  },
  {
    id: 'bs_craft_wood_handle',
    name: 'Carve Wood Handle',
    description: 'Shape raw wood into a usable tool handle.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'wood',
        materialName: 'Wood',
        category: MaterialCategory.WOOD,
        quantity: 2
      }
    ],
    output: {
      itemId: 'wood_handle',
      itemName: 'Wooden Handle',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 3,
    xpGain: 5,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'woodworking', 'component']
  },
  {
    id: 'bs_craft_hardwood_handle',
    name: 'Carve Hardwood Handle',
    description: 'Shape quality hardwood into a durable tool handle.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'hardwood',
        materialName: 'Hardwood',
        category: MaterialCategory.WOOD,
        quantity: 2
      }
    ],
    output: {
      itemId: 'hardwood_handle',
      itemName: 'Hardwood Handle',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 25,
    difficulty: 12,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'woodworking', 'component', 'quality']
  },
  {
    id: 'bs_craft_stone_block',
    name: 'Cut Stone Block',
    description: 'Shape rough stone into building blocks.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'stone',
        materialName: 'Stone',
        category: MaterialCategory.MINERAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'stone_block',
      itemName: 'Stone Block',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 5,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'stonework', 'building']
  },
  {
    id: 'bs_craft_rope',
    name: 'Twist Rope',
    description: 'Create strong rope from hemp fibers.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'hemp',
        materialName: 'Hemp',
        category: MaterialCategory.FABRIC,
        quantity: 3
      }
    ],
    output: {
      itemId: 'rope',
      itemName: 'Rope',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 2,
    xpGain: 5,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'cordage', 'utility']
  },
  {
    id: 'bs_polish_gemstone',
    name: 'Polish Gemstone',
    description: 'Cut and polish a rough gemstone into a valuable gem.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 15,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'gemstone_rough',
        materialName: 'Rough Gemstone',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'gemstone_polished',
      itemName: 'Polished Gemstone',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 18,
    xpGain: 25,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'jewelry', 'precious']
  },

  // -------------------------------------------------------------------------
  // TRADITIONAL NOVICE ITEMS (Level 1-15)
  // -------------------------------------------------------------------------
  {
    id: 'bs_iron_horseshoe',
    name: 'Iron Horseshoe',
    description: 'A simple iron horseshoe. Every blacksmith starts here.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'iron_horseshoe',
      itemName: 'Iron Horseshoe',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'mount', 'basic']
  },
  {
    id: 'bs_basic_knife',
    name: 'Basic Knife',
    description: 'A simple utility knife. Useful for skinning and everyday tasks.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'wood_handle',
        materialName: 'Wooden Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'basic_knife',
      itemName: 'Basic Knife',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['novice', 'blade', 'utility']
  },
  {
    id: 'bs_iron_nails',
    name: 'Iron Nails',
    description: 'Simple iron nails for construction and repairs.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_nails',
      itemName: 'Iron Nails',
      baseQuantity: 20,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'consumable', 'utility']
  },
  {
    id: 'bs_camp_cooking_pot',
    name: 'Camp Cooking Pot',
    description: 'A sturdy iron pot for trail cooking.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 7,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'camp_cooking_pot',
      itemName: 'Camp Cooking Pot',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 60,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'cooking', 'camp']
  },
  {
    id: 'bs_simple_hatchet',
    name: 'Simple Hatchet',
    description: 'A basic hatchet for chopping wood and light combat.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'wood_handle',
        materialName: 'Wooden Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'simple_hatchet',
      itemName: 'Simple Hatchet',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 15,
    xpGain: 25,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['novice', 'axe', 'utility']
  },
  {
    id: 'bs_iron_repair_kit',
    name: 'Iron Repair Kit',
    description: 'A basic set of tools for mending worn iron equipment in the field.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_repair_kit',
      itemName: 'Iron Repair Kit',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 40,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['novice', 'repair', 'utility']
  },
  {
    id: 'bs_railroad_spikes',
    name: 'Railroad Spikes',
    description: 'Heavy iron spikes used for securing railroad tracks. Also make decent improvised weapons.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'railroad_spikes',
      itemName: 'Railroad Spikes',
      baseQuantity: 10,
      qualityAffectsStats: false
    },
    baseCraftTime: 35,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'construction', 'utility']
  },
  {
    id: 'bs_prospector_pan',
    name: 'Prospector Pan',
    description: 'A shallow iron pan for sifting gold from river sediment. Essential for any aspiring miner.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 9,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'prospector_pan',
      itemName: 'Prospector Pan',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 50,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['novice', 'mining', 'prospecting']
  },
  {
    id: 'bs_lantern_frame',
    name: 'Lantern Frame',
    description: 'The iron framework for an oil lantern. Needs glass and a wick to complete.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 11,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'copper_ore',
        materialName: 'Copper Ore',
        category: MaterialCategory.METAL_ORE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'lantern_frame',
      itemName: 'Lantern Frame',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 45,
    difficulty: 12,
    xpGain: 16,
    learningSource: RecipeSource.TRAINER,
    category: 'component',
    tags: ['novice', 'lighting', 'camp']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'bs_steel_blade',
    name: 'Steel Blade',
    description: 'A quality steel blade, sharper and more durable than iron.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      },
      {
        materialId: 'leather_grip',
        materialName: 'Leather Grip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'steel_blade',
      itemName: 'Steel Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['apprentice', 'blade', 'combat']
  },
  {
    id: 'bs_pickaxe',
    name: 'Mining Pickaxe',
    description: 'A sturdy pickaxe for breaking rocks and mining ore.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'mining_pickaxe',
      itemName: 'Mining Pickaxe',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'mining', 'tool']
  },
  {
    id: 'bs_branding_iron',
    name: 'Branding Iron',
    description: 'Used to brand cattle and mark property. Essential for ranchers.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'wood_handle',
        materialName: 'Wooden Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'branding_iron',
      itemName: 'Branding Iron',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 90,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'ranching', 'tool']
  },
  {
    id: 'bs_steel_spurs',
    name: 'Steel Spurs',
    description: 'Quality spurs for better horse control.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 23,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'steel_spurs',
      itemName: 'Steel Spurs',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'mount', 'equipment']
  },
  {
    id: 'bs_bear_trap',
    name: 'Bear Trap',
    description: 'A heavy steel trap for catching large game or unwary outlaws.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 26,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'iron_chain',
        materialName: 'Iron Chain',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'bear_trap',
      itemName: 'Bear Trap',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 35,
    xpGain: 60,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'trap', 'hunting']
  },
  {
    id: 'bs_steel_horseshoes',
    name: 'Steel Horseshoes',
    description: 'Superior horseshoes forged from steel. Last longer and provide better traction.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'steel_horseshoes',
      itemName: 'Steel Horseshoes',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['apprentice', 'mount', 'farrier']
  },
  {
    id: 'bs_bowie_knife',
    name: 'Bowie Knife',
    description: 'A heavy fighting knife with a clip point blade. Deadly in close combat.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'leather_grip',
        materialName: 'Leather Grip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'bowie_knife',
      itemName: 'Bowie Knife',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 130,
    difficulty: 26,
    xpGain: 42,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['apprentice', 'blade', 'combat']
  },
  {
    id: 'bs_iron_chain',
    name: 'Iron Chain',
    description: 'Heavy iron links forged together. Used for securing prisoners, animals, or equipment.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 21,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      }
    ],
    output: {
      itemId: 'iron_chain',
      itemName: 'Iron Chain',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 90,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['apprentice', 'component', 'utility']
  },
  {
    id: 'bs_throwing_knives',
    name: 'Throwing Knives',
    description: 'Balanced steel throwing knives. Silent and deadly at range.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'throwing_knives',
      itemName: 'Throwing Knives',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 110,
    difficulty: 30,
    xpGain: 48,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['apprentice', 'blade', 'ranged']
  },
  {
    id: 'bs_steel_repair_kit',
    name: 'Steel Repair Kit',
    description: 'An advanced repair kit with steel tools and materials for fixing quality equipment.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'coal',
        materialName: 'Coal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'steel_repair_kit',
      itemName: 'Steel Repair Kit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['apprentice', 'repair', 'utility']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'bs_cavalry_saber',
    name: 'Cavalry Saber',
    description: 'An elegant curved blade favored by military officers.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'brass_fittings',
        materialName: 'Brass Fittings',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'leather_grip',
        materialName: 'Leather Grip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cavalry_saber',
      itemName: 'Cavalry Saber',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'sword', 'military']
  },
  {
    id: 'bs_sheriff_badge',
    name: "Sheriff's Badge",
    description: 'A symbol of law and order. Commands respect and fear.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 33,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'silver_bar',
        materialName: 'Silver Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'brass_fittings',
        materialName: 'Brass Fittings',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sheriff_badge',
      itemName: "Sheriff's Badge",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'accessory',
    tags: ['journeyman', 'lawman', 'prestige'],
    specialNotes: 'Grants bonus reputation with lawmen'
  },
  {
    id: 'bs_steel_armor_plates',
    name: 'Steel Armor Plates',
    description: 'Reinforced steel plates that can be added to vests and coats.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 36,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.ANVIL,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'rivets',
        materialName: 'Steel Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      }
    ],
    output: {
      itemId: 'steel_armor_plates',
      itemName: 'Steel Armor Plates',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'armor', 'protection']
  },
  {
    id: 'bs_reinforced_lockbox',
    name: 'Reinforced Lockbox',
    description: 'A secure steel lockbox for protecting valuables from thieves.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 40,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 15
      },
      {
        materialId: 'lock_mechanism',
        materialName: 'Lock Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'reinforced_lockbox',
      itemName: 'Reinforced Lockbox',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 50,
    xpGain: 95,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['journeyman', 'storage', 'security']
  },
  {
    id: 'bs_tomahawk',
    name: 'Steel Tomahawk',
    description: 'A balanced throwing axe with roots in Native American design. Deadly at close or throwing range.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'steel_tomahawk',
      itemName: 'Steel Tomahawk',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 44,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'axe', 'throwing']
  },
  {
    id: 'bs_reinforced_chest_plate',
    name: 'Reinforced Chest Plate',
    description: 'A heavy steel chest plate worn under a duster. Stops most pistol rounds.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.ANVIL,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 14
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'rivets',
        materialName: 'Steel Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 30
      }
    ],
    output: {
      itemId: 'reinforced_chest_plate',
      itemName: 'Reinforced Chest Plate',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 52,
    xpGain: 100,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'armor', 'protection']
  },
  {
    id: 'bs_quality_mining_pick',
    name: 'Quality Mining Pick',
    description: 'A superior pickaxe forged for professional miners. Extracts ore more efficiently.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'quality_mining_pick',
      itemName: 'Quality Mining Pick',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 48,
    xpGain: 88,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['journeyman', 'mining', 'tool']
  },
  {
    id: 'bs_machete',
    name: 'Frontier Machete',
    description: 'A broad-bladed tool for clearing brush and defending against hostile wildlife.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 45,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'frontier_machete',
      itemName: 'Frontier Machete',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 160,
    difficulty: 46,
    xpGain: 85,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'blade', 'utility']
  },
  {
    id: 'bs_silver_horseshoes',
    name: 'Silver-Inlaid Horseshoes',
    description: 'Premium horseshoes with silver inlay. Said to ward off evil spirits and provide sure footing.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 47,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'silver_bar',
        materialName: 'Silver Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'silver_horseshoes',
      itemName: 'Silver-Inlaid Horseshoes',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 55,
    xpGain: 92,
    learningSource: RecipeSource.VENDOR,
    learningCost: 200,
    category: 'tool',
    tags: ['journeyman', 'mount', 'supernatural']
  },
  {
    id: 'bs_army_saber',
    name: 'Army Officer Saber',
    description: 'A regulation military saber issued to cavalry officers. Symbol of rank and deadly in skilled hands.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 49,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'brass_fittings',
        materialName: 'Brass Fittings',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'leather_grip',
        materialName: 'Leather Grip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'army_officer_saber',
      itemName: 'Army Officer Saber',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 58,
    xpGain: 105,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['journeyman', 'sword', 'military']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'bs_damascus_knife',
    name: 'Damascus Steel Knife',
    description: 'A beautifully patterned blade of legendary sharpness and durability.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'exotic_wood_handle',
        materialName: 'Exotic Wood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'silver_inlay',
        materialName: 'Silver Inlay',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'damascus_knife',
      itemName: 'Damascus Steel Knife',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 65,
    xpGain: 130,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'weapon',
    tags: ['expert', 'blade', 'exotic']
  },
  {
    id: 'bs_silver_bullet_mold',
    name: 'Silver Bullet Mold',
    description: 'A precision mold for casting silver bullets. Some say they work on more than werewolves.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 54,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'brass_fittings',
        materialName: 'Brass Fittings',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'silver_bullet_mold',
      itemName: 'Silver Bullet Mold',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.VENDOR,
    learningCost: 500,
    category: 'utility',
    tags: ['expert', 'ammunition', 'supernatural']
  },
  {
    id: 'bs_reinforced_strongbox',
    name: 'Reinforced Strongbox',
    description: 'A nearly impenetrable safe for storing the most valuable treasures.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 25
      },
      {
        materialId: 'titanium_bar',
        materialName: 'Titanium Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      },
      {
        materialId: 'complex_lock',
        materialName: 'Complex Lock Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'reinforced_strongbox',
      itemName: 'Reinforced Strongbox',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 68,
    xpGain: 140,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['expert', 'storage', 'security']
  },
  {
    id: 'bs_chain_armor_vest',
    name: 'Chainmail Vest',
    description: 'Interlocking steel rings provide excellent protection without restricting movement.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'steel_rings',
        materialName: 'Steel Rings',
        category: MaterialCategory.REFINED_METAL,
        quantity: 500
      },
      {
        materialId: 'leather_backing',
        materialName: 'Leather Backing',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'chainmail_vest',
      itemName: 'Chainmail Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 70,
    xpGain: 150,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'armor', 'protection']
  },
  {
    id: 'bs_master_mining_pick',
    name: 'Master Mining Pick',
    description: 'The finest pickaxe money can buy. Forged for the most demanding mining operations.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 53,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'exotic_wood_handle',
        materialName: 'Exotic Wood Handle',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'master_mining_pick',
      itemName: 'Master Mining Pick',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 62,
    xpGain: 125,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['expert', 'mining', 'tool']
  },
  {
    id: 'bs_dueling_sword',
    name: 'Gentleman Dueling Sword',
    description: 'An elegant rapier designed for formal duels. Light, fast, and deadly precise.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 56,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 7
      },
      {
        materialId: 'silver_inlay',
        materialName: 'Silver Inlay',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'leather_grip',
        materialName: 'Leather Grip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'gentleman_dueling_sword',
      itemName: 'Gentleman Dueling Sword',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 380,
    difficulty: 66,
    xpGain: 135,
    learningSource: RecipeSource.VENDOR,
    learningCost: 400,
    category: 'weapon',
    tags: ['expert', 'sword', 'prestige']
  },
  {
    id: 'bs_bounty_hunter_shackles',
    name: 'Bounty Hunter Shackles',
    description: 'Reinforced restraints designed to hold the most dangerous outlaws.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 60,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'iron_chain',
        materialName: 'Iron Chain',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'complex_lock',
        materialName: 'Complex Lock Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'bounty_hunter_shackles',
      itemName: 'Bounty Hunter Shackles',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 64,
    xpGain: 128,
    learningSource: RecipeSource.REPUTATION,
    category: 'tool',
    tags: ['expert', 'lawman', 'utility']
  },
  {
    id: 'bs_war_axe',
    name: 'Frontier War Axe',
    description: 'A massive two-handed axe designed for devastating strikes in combat.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 65,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.ANVIL,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'hardwood_handle',
        materialName: 'Hardwood Handle',
        category: MaterialCategory.WOOD,
        quantity: 2
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'frontier_war_axe',
      itemName: 'Frontier War Axe',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 400,
    difficulty: 72,
    xpGain: 155,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.08,
    category: 'weapon',
    tags: ['expert', 'axe', 'combat']
  },
  {
    id: 'bs_cursed_iron_blade',
    name: 'Cursed Iron Blade',
    description: 'A blade forged with forbidden techniques. Whispers promise power at a terrible cost.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 68,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'cursed_ore',
        materialName: 'Cursed Ore',
        category: MaterialCategory.CURSED_MATERIAL,
        quantity: 5
      },
      {
        materialId: 'blood_vial',
        materialName: 'Blood Vial',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cursed_iron_blade',
      itemName: 'Cursed Iron Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 450,
    difficulty: 75,
    xpGain: 165,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['expert', 'blade', 'supernatural', 'cursed'],
    specialNotes: 'Deals bonus damage but slowly drains user sanity',
    karmaCost: -15,
    sanityCost: 5,
    curseEffect: {
      type: CurseType.BLOODTHIRST,
      severity: 2,
      description: 'The blade hungers for blood',
      triggerChance: 0.15
    }
  },
  {
    id: 'bs_rifle_bayonet',
    name: 'Rifle Bayonet',
    description: 'A precision-forged blade attachment that turns any rifle into a deadly melee weapon.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 70,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 2
      },
      otherProfession: {
        professionId: ProfessionId.GUNSMITHING,
        minLevel: 40
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      },
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'brass_fittings',
        materialName: 'Brass Fittings',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'rifle_bayonet',
      itemName: 'Rifle Bayonet',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 350,
    difficulty: 74,
    xpGain: 160,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'blade', 'firearm', 'military']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'bs_legendary_bowie',
    name: 'Legendary Bowie Knife',
    description: 'A massive blade of exceptional quality. Named after the legendary fighter Jim Bowie.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'bear_bone_handle',
        materialName: 'Bear Bone Handle',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'gold_pommel',
        materialName: 'Gold Pommel',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'legendary_bowie_knife',
      itemName: 'Legendary Bowie Knife',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['master', 'blade', 'legendary'],
    specialNotes: 'Can only be crafted by Master Blacksmiths'
  },
  {
    id: 'bs_masterwork_revolver_frame',
    name: 'Masterwork Revolver Frame',
    description: 'A perfectly balanced revolver frame. The foundation of legendary firearms.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER,
      otherProfession: {
        professionId: ProfessionId.GUNSMITHING,
        minLevel: 50
      }
    },
    materials: [
      {
        materialId: 'titanium_bar',
        materialName: 'Titanium Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'precision_springs',
        materialName: 'Precision Springs',
        category: MaterialCategory.GUN_PART,
        quantity: 4
      },
      {
        materialId: 'silver_inlay',
        materialName: 'Silver Inlay',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'masterwork_revolver_frame',
      itemName: 'Masterwork Revolver Frame',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['master', 'firearm', 'component']
  },
  {
    id: 'bs_ceremonial_sword',
    name: 'Ceremonial Sword',
    description: 'An ornate blade fit for presentation to generals and governors.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'gold_inlay',
        materialName: 'Gold Inlay',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'ruby',
        materialName: 'Ruby',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'ceremonial_sword',
      itemName: 'Ceremonial Sword',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['master', 'sword', 'prestige']
  },
  {
    id: 'bs_titanium_armor_set',
    name: 'Titanium Armor Set',
    description: 'Lightweight yet incredibly strong armor plates made from rare titanium.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'titanium_bar',
        materialName: 'Titanium Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      },
      {
        materialId: 'steel_rivets',
        materialName: 'Steel Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 50
      },
      {
        materialId: 'leather_padding',
        materialName: 'Leather Padding',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      }
    ],
    output: {
      itemId: 'titanium_armor_set',
      itemName: 'Titanium Armor Set',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 720,
    difficulty: 90,
    xpGain: 320,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.03,
    category: 'armor',
    tags: ['master', 'armor', 'exotic']
  },
  {
    id: 'bs_ghost_steel_alloy',
    name: 'Ghost Steel Alloy',
    description: 'A rare alloy that phases between realms. Required for crafting items that can harm spirits.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 73,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'silver_bar',
        materialName: 'Silver Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 5
      },
      {
        materialId: 'spirit_essence',
        materialName: 'Spirit Essence',
        category: MaterialCategory.SPIRIT_ESSENCE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'ghost_steel_alloy',
      itemName: 'Ghost Steel Alloy',
      baseQuantity: 4,
      qualityAffectsStats: false
    },
    baseCraftTime: 420,
    difficulty: 78,
    xpGain: 180,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'material',
    tags: ['master', 'supernatural', 'component'],
    specialNotes: 'Can harm spectral entities'
  },
  {
    id: 'bs_blessed_steel_ingot',
    name: 'Blessed Steel Ingot',
    description: 'Steel purified by holy water and blessed by a man of faith. Effective against unholy creatures.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 77,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.BLESSED_MATERIAL,
        quantity: 3
      },
      {
        materialId: 'silver_bar',
        materialName: 'Silver Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'blessed_steel_ingot',
      itemName: 'Blessed Steel Ingot',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 380,
    difficulty: 82,
    xpGain: 200,
    learningSource: RecipeSource.REPUTATION,
    category: 'material',
    tags: ['master', 'blessed', 'component'],
    faithCost: 10,
    specialNotes: 'Bonus damage against undead and demons'
  },
  {
    id: 'bs_executioner_blade',
    name: 'Executioner Blade',
    description: 'A massive two-handed sword designed for a single, final purpose. Feared by criminals across the frontier.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 82,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 18
      },
      {
        materialId: 'titanium_bar',
        materialName: 'Titanium Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'exotic_wood_handle',
        materialName: 'Exotic Wood Handle',
        category: MaterialCategory.WOOD,
        quantity: 2
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'executioner_blade',
      itemName: 'Executioner Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 650,
    difficulty: 88,
    xpGain: 300,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['master', 'sword', 'legendary'],
    specialNotes: 'Massive critical hit bonus against humanoids'
  },
  {
    id: 'bs_legendary_anvil',
    name: 'Legendary Anvil',
    description: 'A master-crafted anvil that improves the quality of all items forged upon it.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 88,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'titanium_bar',
        materialName: 'Titanium Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 30
      },
      {
        materialId: 'damascus_steel',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      },
      {
        materialId: 'gold_bar',
        materialName: 'Gold Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 5
      }
    ],
    output: {
      itemId: 'legendary_anvil',
      itemName: 'Legendary Anvil',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 92,
    xpGain: 400,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.02,
    category: 'tool',
    tags: ['master', 'facility', 'legendary'],
    specialNotes: 'Grants +15% quality chance when used as crafting facility'
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'bs_the_peacemaker',
    name: 'The Peacemaker',
    description: 'A legendary revolver said to end conflicts with a single shot. The pinnacle of blacksmithing.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.GUNSMITHING,
        minLevel: 75
      }
    },
    materials: [
      {
        materialId: 'meteorite_steel',
        materialName: 'Meteorite Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 15
      },
      {
        materialId: 'mithril_bar',
        materialName: 'Mithril Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      },
      {
        materialId: 'phoenix_feather',
        materialName: 'Phoenix Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'master_lock_mechanism',
        materialName: 'Master Lock Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'the_peacemaker',
      itemName: 'The Peacemaker',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'firearm', 'unique'],
    specialNotes: 'Only one can exist per server. Grants unique abilities.'
  },
  {
    id: 'bs_meteorite_blade',
    name: 'Meteorite Blade',
    description: 'Forged from metal that fell from the heavens. Impossibly sharp and eternally durable.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'meteorite_steel',
        materialName: 'Meteorite Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      },
      {
        materialId: 'dragon_bone_handle',
        materialName: 'Dragon Bone Handle',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'moonstone',
        materialName: 'Moonstone',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'meteorite_blade',
      itemName: 'Meteorite Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1200,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'blade', 'supernatural'],
    specialNotes: 'Deals bonus damage to supernatural creatures'
  },
  {
    id: 'bs_divine_armor',
    name: 'Divine Armor',
    description: 'Blessed armor said to turn aside even the most deadly attacks.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'mithril_bar',
        materialName: 'Mithril Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 25
      },
      {
        materialId: 'blessed_steel',
        materialName: 'Blessed Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 30
      },
      {
        materialId: 'angel_tears',
        materialName: 'Angel Tears',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      }
    ],
    output: {
      itemId: 'divine_armor',
      itemName: 'Divine Armor',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 800,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'armor', 'blessed'],
    specialNotes: 'Provides immunity to certain status effects'
  },
  {
    id: 'bs_spirit_forged_blade',
    name: 'Spirit-Forged Blade',
    description: 'A weapon forged in communion with ancestral spirits. Cuts through both flesh and ectoplasm.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'ghost_steel_alloy',
        materialName: 'Ghost Steel Alloy',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'spirit_essence',
        materialName: 'Spirit Essence',
        category: MaterialCategory.SPIRIT_ESSENCE,
        quantity: 8
      },
      {
        materialId: 'moonstone',
        materialName: 'Moonstone',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'silver_bar',
        materialName: 'Silver Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'spirit_forged_blade',
      itemName: 'Spirit-Forged Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1000,
    difficulty: 95,
    xpGain: 550,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'blade', 'supernatural'],
    specialNotes: 'Can harm incorporeal enemies. Glows faintly in the presence of spirits.'
  },
  {
    id: 'bs_hellfire_brand',
    name: 'Hellfire Brand',
    description: 'A blade quenched in brimstone and forged with infernal techniques. Burns with unholy flame.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'meteorite_steel',
        materialName: 'Meteorite Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 14
      },
      {
        materialId: 'brimstone',
        materialName: 'Brimstone',
        category: MaterialCategory.CURSED_MATERIAL,
        quantity: 10
      },
      {
        materialId: 'demon_blood',
        materialName: 'Demon Blood',
        category: MaterialCategory.ELDRITCH_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'obsidian_core',
        materialName: 'Obsidian Core',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'hellfire_brand',
      itemName: 'Hellfire Brand',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1100,
    difficulty: 97,
    xpGain: 620,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'blade', 'cursed', 'supernatural'],
    specialNotes: 'Deals fire damage. Corrupts the soul of its wielder over time.',
    karmaCost: -25,
    sanityCost: 10,
    curseEffect: {
      type: CurseType.CORRUPTION,
      severity: 4,
      description: 'The flames consume more than flesh',
      triggerChance: 0.25
    }
  },
  {
    id: 'bs_archangel_blade',
    name: 'Archangel Blade',
    description: 'A holy weapon blessed by the highest powers. Anathema to all darkness.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.QUENCH_TANK,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'mithril_bar',
        materialName: 'Mithril Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 15
      },
      {
        materialId: 'blessed_steel_ingot',
        materialName: 'Blessed Steel Ingot',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'angel_feather',
        materialName: 'Angel Feather',
        category: MaterialCategory.BLESSED_MATERIAL,
        quantity: 2
      },
      {
        materialId: 'divine_light_essence',
        materialName: 'Divine Light Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'archangel_blade',
      itemName: 'Archangel Blade',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1400,
    difficulty: 99,
    xpGain: 750,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'blade', 'blessed', 'supernatural'],
    faithCost: 50,
    specialNotes: 'Devastating damage to undead and demons. Requires pure heart to wield.',
    blessingEffect: {
      type: BlessingType.HOLY_LIGHT,
      potency: 5,
      description: 'Radiates divine light that burns the unholy'
    }
  },
  {
    id: 'bs_world_splitter',
    name: 'World Splitter',
    description: 'A mythic weapon of impossible power. Legends say it was forged to slay gods themselves.',
    professionId: ProfessionId.BLACKSMITHING,
    requirements: {
      professionId: ProfessionId.BLACKSMITHING,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.FORGE,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.GUNSMITHING,
        minLevel: 80
      }
    },
    materials: [
      {
        materialId: 'meteorite_steel',
        materialName: 'Meteorite Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 30
      },
      {
        materialId: 'mithril_bar',
        materialName: 'Mithril Bar',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 20
      },
      {
        materialId: 'primordial_essence',
        materialName: 'Primordial Essence',
        category: MaterialCategory.ELDRITCH_COMPONENT,
        quantity: 5
      },
      {
        materialId: 'stardust',
        materialName: 'Stardust',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'titan_bone',
        materialName: 'Titan Bone',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'world_splitter',
      itemName: 'World Splitter',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 2400,
    difficulty: 100,
    xpGain: 1000,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'mythic', 'blade', 'unique', 'supernatural'],
    specialNotes: 'The ultimate blacksmithing achievement. Only one can exist per server.',
    eldritchTaint: true
  }
];

export default blacksmithingRecipes;
