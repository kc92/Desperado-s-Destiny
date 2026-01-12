/**
 * Leatherworking Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Masters of hide and leather - craft armor, saddles, holsters, and bags
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType
} from '@desperados/shared';

export const leatherworkingRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================

  // -------------------------------------------------------------------------
  // LEATHER PROCESSING RECIPES (Level 1-10) - Core Material Processing
  // -------------------------------------------------------------------------
  {
    id: 'lw_tan_raw_hide',
    name: 'Tan Raw Hide',
    description: 'Process raw animal hide into usable tanned leather. The foundation of leatherworking.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'raw_hide',
        materialName: 'Raw Hide',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'tanned_leather',
      itemName: 'Tanned Leather',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 3,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'tanning', 'processing', 'basic']
  },
  {
    id: 'lw_thick_leather',
    name: 'Craft Thick Leather',
    description: 'Layer and treat tanned leather to create thicker, more durable material.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'animal_fat',
        materialName: 'Animal Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'thick_leather',
      itemName: 'Thick Leather',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 45,
    difficulty: 10,
    xpGain: 14,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'processing', 'reinforced']
  },
  {
    id: 'lw_craft_leather_strip',
    name: 'Cut Leather Strips',
    description: 'Cut tanned leather into useful strips for binding and lacing.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'leather_strip',
      itemName: 'Leather Strip',
      baseQuantity: 4,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 4,
    xpGain: 6,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'cutting', 'component']
  },

  // -------------------------------------------------------------------------
  // TRADITIONAL NOVICE ITEMS (Level 1-15)
  // -------------------------------------------------------------------------
  {
    id: 'lw_simple_belt',
    name: 'Simple Leather Belt',
    description: 'A basic leather belt. Every cowboy needs one.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'brass_buckle',
        materialName: 'Brass Buckle',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'simple_belt',
      itemName: 'Simple Leather Belt',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'clothing', 'basic']
  },
  {
    id: 'lw_leather_gloves',
    name: 'Leather Gloves',
    description: 'Simple leather work gloves. Protect your hands from rope burn.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'thread',
        materialName: 'Leather Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'leather_gloves',
      itemName: 'Leather Gloves',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'gloves', 'utility']
  },
  {
    id: 'lw_water_canteen',
    name: 'Water Canteen',
    description: 'A leather-wrapped canteen for carrying water across the harsh frontier.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'cork',
        materialName: 'Cork Stopper',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'water_canteen',
      itemName: 'Water Canteen',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 60,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'survival', 'consumable']
  },
  {
    id: 'lw_leather_pouch',
    name: 'Leather Pouch',
    description: 'A small pouch for carrying coins and small items.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'drawstring',
        materialName: 'Drawstring',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'leather_pouch',
      itemName: 'Leather Pouch',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 45,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'storage', 'bag']
  },
  {
    id: 'lw_simple_boots',
    name: 'Simple Leather Boots',
    description: 'Basic leather boots for walking the dusty trails.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'leather_laces',
        materialName: 'Leather Laces',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'simple_boots',
      itemName: 'Simple Leather Boots',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 15,
    xpGain: 25,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'boots', 'armor']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'lw_cowboy_chaps',
    name: 'Cowboy Chaps',
    description: 'Tough leather chaps that protect your legs while riding.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'cowboy_chaps',
      itemName: 'Cowboy Chaps',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'legs', 'riding']
  },
  {
    id: 'lw_holster',
    name: 'Gun Holster',
    description: 'A well-crafted holster for quick draws and safe carry.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'tooled_leather',
        materialName: 'Tooled Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'rivets',
        materialName: 'Leather Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'gun_holster',
      itemName: 'Gun Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'gunslinger', 'utility']
  },
  {
    id: 'lw_saddle_blanket',
    name: 'Saddle Blanket',
    description: 'A padded blanket that protects both horse and rider.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'wool_padding',
        materialName: 'Wool Padding',
        category: MaterialCategory.FABRIC,
        quantity: 3
      }
    ],
    output: {
      itemId: 'saddle_blanket',
      itemName: 'Saddle Blanket',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'mount',
    tags: ['apprentice', 'horse', 'riding']
  },
  {
    id: 'lw_leather_vest',
    name: 'Leather Vest',
    description: 'A sturdy vest that provides some protection without restricting movement.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 10
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      }
    ],
    output: {
      itemId: 'leather_vest',
      itemName: 'Leather Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'chest', 'armor']
  },
  {
    id: 'lw_ammunition_belt',
    name: 'Ammunition Belt',
    description: 'A bandolier for carrying extra ammunition into battle.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'tooled_leather',
        materialName: 'Tooled Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'brass_loops',
        materialName: 'Brass Loops',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 20
      }
    ],
    output: {
      itemId: 'ammunition_belt',
      itemName: 'Ammunition Belt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'ammunition', 'utility']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'lw_trail_saddle',
    name: 'Trail Saddle',
    description: 'A comfortable, durable saddle built for long journeys.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 15
      },
      {
        materialId: 'saddle_tree',
        materialName: 'Wooden Saddle Tree',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'stirrups',
        materialName: 'Steel Stirrups',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'trail_saddle',
      itemName: 'Trail Saddle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'mount',
    tags: ['journeyman', 'saddle', 'riding']
  },
  {
    id: 'lw_leather_duster',
    name: 'Leather Duster',
    description: 'A long leather coat that protects from the elements and danger.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 18
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 12
      },
      {
        materialId: 'lining_fabric',
        materialName: 'Lining Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 8
      }
    ],
    output: {
      itemId: 'leather_duster',
      itemName: 'Leather Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'coat', 'iconic']
  },
  {
    id: 'lw_saddlebags',
    name: 'Saddlebags',
    description: 'Large leather bags that attach to your saddle for extra storage.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 12
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'saddlebags',
      itemName: 'Saddlebags',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['journeyman', 'storage', 'mount']
  },
  {
    id: 'lw_snakeskin_boots',
    name: 'Snakeskin Boots',
    description: 'Exotic boots crafted from rattlesnake hide. Stylish and deadly.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'snakeskin',
        materialName: 'Rattlesnake Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 6
      },
      {
        materialId: 'leather_sole',
        materialName: 'Leather Sole',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'snakeskin_boots',
      itemName: 'Snakeskin Boots',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 210,
    difficulty: 50,
    xpGain: 95,
    learningSource: RecipeSource.VENDOR,
    learningCost: 300,
    category: 'armor',
    tags: ['journeyman', 'exotic', 'boots']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'lw_quickdraw_holster',
    name: 'Quickdraw Holster',
    description: 'A masterfully designed holster that allows for lightning-fast draws.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      },
      {
        materialId: 'oiled_rivets',
        materialName: 'Oiled Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'quickdraw_spring',
        materialName: 'Quickdraw Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'quickdraw_holster',
      itemName: 'Quickdraw Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 65,
    xpGain: 130,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'accessory',
    tags: ['expert', 'gunslinger', 'combat'],
    specialNotes: 'Increases draw speed in duels'
  },
  {
    id: 'lw_armored_vest',
    name: 'Armored Leather Vest',
    description: 'Reinforced with metal plates beneath the leather. Maximum protection.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 55,
      minTier: CraftingSkillTier.EXPERT,
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 40
      }
    },
    materials: [
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 15
      },
      {
        materialId: 'steel_plates',
        materialName: 'Steel Plates',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'kevlar_lining',
        materialName: 'Kevlar Lining',
        category: MaterialCategory.FABRIC,
        quantity: 4
      }
    ],
    output: {
      itemId: 'armored_vest',
      itemName: 'Armored Leather Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 68,
    xpGain: 140,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'armor', 'protection']
  },
  {
    id: 'lw_exotic_boots',
    name: 'Exotic Leather Boots',
    description: 'Made from rare animal hides. Extremely comfortable and durable.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'gator_hide',
        materialName: 'Alligator Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 8
      },
      {
        materialId: 'buffalo_hide',
        materialName: 'Buffalo Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 4
      },
      {
        materialId: 'silver_buckles',
        materialName: 'Silver Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'exotic_boots',
      itemName: 'Exotic Leather Boots',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 62,
    xpGain: 125,
    learningSource: RecipeSource.VENDOR,
    learningCost: 600,
    category: 'armor',
    tags: ['expert', 'exotic', 'prestige']
  },
  {
    id: 'lw_traveling_pack',
    name: 'Traveling Pack',
    description: 'A large leather backpack with multiple compartments for long journeys.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 20
      },
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      }
    ],
    output: {
      itemId: 'traveling_pack',
      itemName: 'Traveling Pack',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['expert', 'storage', 'bag']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'lw_shadow_armor',
    name: 'Shadow Leather Armor',
    description: 'Dark leather armor treated with special oils. Silent as the night.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.DYE_VAT,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'shadow_leather',
        materialName: 'Shadow-treated Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 25
      },
      {
        materialId: 'void_essence',
        materialName: 'Void Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 12
      }
    ],
    output: {
      itemId: 'shadow_armor',
      itemName: 'Shadow Leather Armor',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['master', 'stealth', 'armor'],
    specialNotes: 'Provides stealth bonuses at night'
  },
  {
    id: 'lw_legendary_saddle',
    name: 'Legendary Saddle',
    description: 'The finest saddle ever crafted. Horses move faster and tire less.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'dragon_hide',
        materialName: 'Dragon Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 10
      },
      {
        materialId: 'mythril_stirrups',
        materialName: 'Mythril Stirrups',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'enchanted_thread',
        materialName: 'Enchanted Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      }
    ],
    output: {
      itemId: 'legendary_saddle',
      itemName: 'Legendary Saddle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'mount',
    tags: ['master', 'legendary', 'mount'],
    specialNotes: '+50% mount speed and stamina'
  },
  {
    id: 'lw_bear_hide_coat',
    name: 'Bearskin Coat',
    description: 'A massive coat made from grizzly bear hide. Intimidating and warm.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 78,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'grizzly_hide',
        materialName: 'Grizzly Bear Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 15
      },
      {
        materialId: 'fur_lining',
        materialName: 'Fur Lining',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'bone_buttons',
        materialName: 'Bone Buttons',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 8
      }
    ],
    output: {
      itemId: 'bearskin_coat',
      itemName: 'Bearskin Coat',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 82,
    xpGain: 220,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['master', 'exotic', 'intimidation']
  },
  {
    id: 'lw_masterwork_holster_set',
    name: 'Masterwork Holster Set',
    description: 'A matched pair of holsters for dual-wielding gunslingers.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 83,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 16
      },
      {
        materialId: 'silver_rivets',
        materialName: 'Silver Rivets',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 24
      },
      {
        materialId: 'quick_release',
        materialName: 'Quick-Release Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'masterwork_holster_set',
      itemName: 'Masterwork Holster Set',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['master', 'gunslinger', 'dual-wield']
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'lw_outlaw_skin',
    name: "The Outlaw's Skin",
    description: 'Legendary armor set said to make the wearer impossible to catch. A ghost on the frontier.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DYE_VAT,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'phantom_leather',
        materialName: 'Phantom Leather',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 30
      },
      {
        materialId: 'shadow_essence',
        materialName: 'Shadow Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'moonsilk',
        materialName: 'Moonsilk',
        category: MaterialCategory.FABRIC,
        quantity: 15
      },
      {
        materialId: 'ghost_metal_buckles',
        materialName: 'Ghost Metal Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 12
      }
    ],
    output: {
      itemId: 'outlaws_skin',
      itemName: "The Outlaw's Skin",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'set', 'unique'],
    specialNotes: 'Full armor set. Grants invisibility and escape abilities.'
  },
  {
    id: 'lw_phoenix_saddle',
    name: 'Phoenix Saddle',
    description: 'Crafted from fireproof materials and blessed by ancient spirits. The ultimate mount enhancement.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'phoenix_hide',
        materialName: 'Phoenix Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 20
      },
      {
        materialId: 'eternal_flame',
        materialName: 'Eternal Flame Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'celestial_thread',
        materialName: 'Celestial Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      }
    ],
    output: {
      itemId: 'phoenix_saddle',
      itemName: 'Phoenix Saddle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1200,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'mount',
    tags: ['grandmaster', 'legendary', 'mount', 'supernatural'],
    specialNotes: 'Mount gains fire immunity and flight capability'
  },
  {
    id: 'lw_timeless_duster',
    name: 'Timeless Duster',
    description: 'A coat that seems to exist outside of time itself. Never wears, never tears.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'temporal_leather',
        materialName: 'Temporal Leather',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 25
      },
      {
        materialId: 'time_crystal',
        materialName: 'Time Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'eternity_thread',
        materialName: 'Eternity Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      }
    ],
    output: {
      itemId: 'timeless_duster',
      itemName: 'Timeless Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1500,
    difficulty: 100,
    xpGain: 700,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'time', 'unique'],
    specialNotes: 'Infinite durability. Provides temporal manipulation abilities.'
  },

  // ============================================================================
  // NEW RECIPES - NOVICE TIER (1-15) - 5 Additional Recipes
  // ============================================================================
  {
    id: 'lw_coin_pouch',
    name: 'Coin Pouch',
    description: 'A small drawstring pouch perfect for carrying gold and silver coins.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      },
      {
        materialId: 'drawstring',
        materialName: 'Drawstring',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'coin_pouch',
      itemName: 'Coin Pouch',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 4,
    xpGain: 7,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'storage', 'basic']
  },
  {
    id: 'lw_basic_strap',
    name: 'Basic Leather Strap',
    description: 'A simple leather strap used for securing gear and equipment.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'basic_strap',
      itemName: 'Basic Leather Strap',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 5,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'component',
    tags: ['novice', 'component', 'basic']
  },
  {
    id: 'lw_tobacco_pouch',
    name: 'Tobacco Pouch',
    description: 'A lined pouch to keep tobacco fresh on the trail.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tanned_leather',
        materialName: 'Tanned Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'oilcloth',
        materialName: 'Oilcloth',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'tobacco_pouch',
      itemName: 'Tobacco Pouch',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 35,
    difficulty: 8,
    xpGain: 11,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'storage', 'utility']
  },
  {
    id: 'lw_wrist_guard',
    name: 'Leather Wrist Guard',
    description: 'A simple wrist guard to protect from rope burns and recoil.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'leather_laces',
        materialName: 'Leather Laces',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'wrist_guard',
      itemName: 'Leather Wrist Guard',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 40,
    difficulty: 12,
    xpGain: 16,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'armor', 'protection']
  },
  {
    id: 'lw_knife_sheath',
    name: 'Knife Sheath',
    description: 'A basic sheath to safely carry a hunting knife on your belt.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 14,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'rivets',
        materialName: 'Leather Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'knife_sheath',
      itemName: 'Knife Sheath',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 50,
    difficulty: 14,
    xpGain: 20,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'utility', 'weapon']
  },

  // ============================================================================
  // NEW RECIPES - APPRENTICE TIER (16-30) - 6 Additional Recipes
  // ============================================================================
  {
    id: 'lw_hip_holster',
    name: 'Hip Holster',
    description: 'A low-riding holster that sits comfortably on the hip.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'tooled_leather',
        materialName: 'Tooled Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'rivets',
        materialName: 'Leather Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'brass_buckle',
        materialName: 'Brass Buckle',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hip_holster',
      itemName: 'Hip Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'gunslinger', 'utility']
  },
  {
    id: 'lw_cartridge_belt',
    name: 'Cartridge Belt',
    description: 'A wide belt with loops to hold rifle cartridges within easy reach.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 5
      },
      {
        materialId: 'brass_loops',
        materialName: 'Brass Loops',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 15
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'cartridge_belt',
      itemName: 'Cartridge Belt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 26,
    xpGain: 42,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'ammunition', 'rifle']
  },
  {
    id: 'lw_pommel_bag',
    name: 'Pommel Bag',
    description: 'A small bag that attaches to the saddle horn for quick-access storage.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 22,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'leather_strip',
        materialName: 'Leather Strip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'pommel_bag',
      itemName: 'Pommel Bag',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 80,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'storage', 'mount']
  },
  {
    id: 'lw_riding_boots',
    name: 'Riding Boots',
    description: 'Sturdy boots with reinforced heels, perfect for stirrups.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 25,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'leather_sole',
        materialName: 'Leather Sole',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'steel_heel',
        materialName: 'Steel Heel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'riding_boots',
      itemName: 'Riding Boots',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 28,
    xpGain: 48,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'boots', 'riding']
  },
  {
    id: 'lw_scout_satchel',
    name: 'Scout Satchel',
    description: 'A messenger-style bag favored by scouts and outriders.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 27,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 2
      }
    ],
    output: {
      itemId: 'scout_satchel',
      itemName: 'Scout Satchel',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 110,
    difficulty: 30,
    xpGain: 52,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'storage', 'utility']
  },
  {
    id: 'lw_studded_belt',
    name: 'Studded Leather Belt',
    description: 'A decorative belt with metal studs. Popular among frontier folk.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 29,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'tooled_leather',
        materialName: 'Tooled Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'silver_studs',
        materialName: 'Silver Studs',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 12
      },
      {
        materialId: 'brass_buckle',
        materialName: 'Brass Buckle',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'studded_belt',
      itemName: 'Studded Leather Belt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'clothing', 'decorative']
  },

  // ============================================================================
  // NEW RECIPES - JOURNEYMAN TIER (31-50) - 6 Additional Recipes
  // ============================================================================
  {
    id: 'lw_reinforced_chaps',
    name: 'Reinforced Chaps',
    description: 'Heavy-duty chaps with extra padding for rough terrain and thorny brush.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 33,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 10
      },
      {
        materialId: 'wool_padding',
        materialName: 'Wool Padding',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'reinforced_chaps',
      itemName: 'Reinforced Chaps',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 160,
    difficulty: 44,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'legs', 'protection']
  },
  {
    id: 'lw_bullwhip',
    name: 'Bullwhip',
    description: 'A long braided leather whip. Useful for herding cattle and intimidating outlaws.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 36,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      },
      {
        materialId: 'leather_strip',
        materialName: 'Leather Strip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 12
      },
      {
        materialId: 'lead_shot',
        materialName: 'Lead Shot',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'bullwhip',
      itemName: 'Bullwhip',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 46,
    xpGain: 82,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['journeyman', 'weapon', 'ranching']
  },
  {
    id: 'lw_frontier_jacket',
    name: 'Frontier Jacket',
    description: 'A stylish leather jacket with fringe. The mark of a true frontiersman.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 40,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 14
      },
      {
        materialId: 'leather_strip',
        materialName: 'Leather Strip',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 20
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 8
      }
    ],
    output: {
      itemId: 'frontier_jacket',
      itemName: 'Frontier Jacket',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 48,
    xpGain: 88,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'chest', 'iconic']
  },
  {
    id: 'lw_deer_hide_gloves',
    name: 'Deerskin Gloves',
    description: 'Supple gloves made from deer hide. Perfect for precision work.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 44,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'deer_hide',
        materialName: 'Deer Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 4
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'thread',
        materialName: 'Leather Thread',
        category: MaterialCategory.FABRIC,
        quantity: 2
      }
    ],
    output: {
      itemId: 'deerskin_gloves',
      itemName: 'Deerskin Gloves',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 50,
    xpGain: 92,
    learningSource: RecipeSource.VENDOR,
    learningCost: 200,
    category: 'armor',
    tags: ['journeyman', 'gloves', 'precision']
  },
  {
    id: 'lw_saddle_holster',
    name: 'Saddle Holster',
    description: 'A holster that attaches to the saddle for quick access to a rifle or shotgun.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 47,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      },
      {
        materialId: 'rivets',
        materialName: 'Leather Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'saddle_holster',
      itemName: 'Saddle Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 52,
    xpGain: 96,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['journeyman', 'mount', 'weapon']
  },
  {
    id: 'lw_elk_hide_vest',
    name: 'Elk Hide Vest',
    description: 'A warm, durable vest made from elk hide. Popular in mountain territories.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 49,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'elk_hide',
        materialName: 'Elk Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 8
      },
      {
        materialId: 'fur_lining',
        materialName: 'Fur Lining',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'bone_buttons',
        materialName: 'Bone Buttons',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 5
      }
    ],
    output: {
      itemId: 'elk_hide_vest',
      itemName: 'Elk Hide Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 54,
    xpGain: 100,
    learningSource: RecipeSource.VENDOR,
    learningCost: 250,
    category: 'armor',
    tags: ['journeyman', 'chest', 'warmth']
  },

  // ============================================================================
  // NEW RECIPES - EXPERT TIER (51-70) - 6 Additional Recipes
  // ============================================================================
  {
    id: 'lw_buffalo_hide_duster',
    name: 'Buffalo Hide Duster',
    description: 'A massive duster made from buffalo hide. Offers superior protection.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 53,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'buffalo_hide',
        materialName: 'Buffalo Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 12
      },
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 8
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 10
      }
    ],
    output: {
      itemId: 'buffalo_hide_duster',
      itemName: 'Buffalo Hide Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 64,
    xpGain: 128,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'coat', 'protection']
  },
  {
    id: 'lw_concealed_holster',
    name: 'Concealed Holster',
    description: 'A shoulder holster designed to be worn under a jacket. For discreet carry.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 56,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'rivets',
        materialName: 'Leather Rivets',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      }
    ],
    output: {
      itemId: 'concealed_holster',
      itemName: 'Concealed Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 66,
    xpGain: 132,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.08,
    category: 'accessory',
    tags: ['expert', 'gunslinger', 'stealth']
  },
  {
    id: 'lw_war_saddle',
    name: 'War Saddle',
    description: 'A reinforced saddle designed for combat. Provides stability during mounted combat.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 60,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.LEATHER_WORKBENCH,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'hardened_leather',
        materialName: 'Hardened Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 20
      },
      {
        materialId: 'steel_plates',
        materialName: 'Steel Plates',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'saddle_tree',
        materialName: 'Wooden Saddle Tree',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'stirrups',
        materialName: 'Steel Stirrups',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'war_saddle',
      itemName: 'War Saddle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 400,
    difficulty: 68,
    xpGain: 140,
    learningSource: RecipeSource.TRAINER,
    category: 'mount',
    tags: ['expert', 'saddle', 'combat'],
    specialNotes: 'Provides combat bonuses while mounted'
  },
  {
    id: 'lw_reinforced_vest',
    name: 'Reinforced Leather Vest',
    description: 'A vest with hidden reinforced panels. Excellent protection without bulk.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 64,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 12
      },
      {
        materialId: 'steel_mesh',
        materialName: 'Steel Mesh',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'lining_fabric',
        materialName: 'Lining Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 6
      }
    ],
    output: {
      itemId: 'reinforced_vest',
      itemName: 'Reinforced Leather Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 70,
    xpGain: 145,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'chest', 'protection']
  },
  {
    id: 'lw_snake_skin_holster',
    name: 'Rattlesnake Holster',
    description: 'An exotic holster made from rattlesnake skin. A conversation starter.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 66,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'snakeskin',
        materialName: 'Rattlesnake Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 5
      },
      {
        materialId: 'tooled_leather',
        materialName: 'Tooled Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'silver_rivets',
        materialName: 'Silver Rivets',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      }
    ],
    output: {
      itemId: 'rattlesnake_holster',
      itemName: 'Rattlesnake Holster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 68,
    xpGain: 138,
    learningSource: RecipeSource.VENDOR,
    learningCost: 500,
    category: 'accessory',
    tags: ['expert', 'exotic', 'prestige']
  },
  {
    id: 'lw_outrider_gear',
    name: 'Outrider Gear Set',
    description: 'A complete set of gear for long-range scouts. Includes saddlebags and pouches.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 69,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'thick_leather',
        materialName: 'Thick Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 18
      },
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 10
      },
      {
        materialId: 'oilcloth',
        materialName: 'Oilcloth',
        category: MaterialCategory.FABRIC,
        quantity: 4
      }
    ],
    output: {
      itemId: 'outrider_gear',
      itemName: 'Outrider Gear Set',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 380,
    difficulty: 72,
    xpGain: 150,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['expert', 'mount', 'utility', 'set']
  },

  // ============================================================================
  // NEW RECIPES - MASTER TIER (71-90) - 5 Additional Recipes
  // ============================================================================
  {
    id: 'lw_gunfighter_rig',
    name: 'Gunfighter Rig',
    description: 'A professional-grade dual holster system with ammunition belt. For serious gunslingers.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 73,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 14
      },
      {
        materialId: 'silver_rivets',
        materialName: 'Silver Rivets',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 20
      },
      {
        materialId: 'brass_loops',
        materialName: 'Brass Loops',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 30
      },
      {
        materialId: 'quickdraw_spring',
        materialName: 'Quickdraw Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'gunfighter_rig',
      itemName: 'Gunfighter Rig',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 82,
    xpGain: 210,
    learningSource: RecipeSource.REPUTATION,
    category: 'accessory',
    tags: ['master', 'gunslinger', 'combat', 'set'],
    specialNotes: 'Complete gunfighter loadout with draw speed bonus'
  },
  {
    id: 'lw_legendary_boots',
    name: 'Legendary Cowboy Boots',
    description: 'The finest boots ever crafted. Comfortable, durable, and impossibly stylish.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 76,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'gator_hide',
        materialName: 'Alligator Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 6
      },
      {
        materialId: 'snakeskin',
        materialName: 'Rattlesnake Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 4
      },
      {
        materialId: 'silver_buckles',
        materialName: 'Silver Buckles',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 4
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 4
      }
    ],
    output: {
      itemId: 'legendary_boots',
      itemName: 'Legendary Cowboy Boots',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 84,
    xpGain: 230,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['master', 'boots', 'legendary', 'prestige']
  },
  {
    id: 'lw_wolf_pelt_cloak',
    name: 'Wolf Pelt Cloak',
    description: 'A fearsome cloak made from wolf pelts. Intimidates enemies and protects from cold.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.DYE_VAT,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'wolf_pelt',
        materialName: 'Wolf Pelt',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 8
      },
      {
        materialId: 'soft_leather',
        materialName: 'Soft Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 10
      },
      {
        materialId: 'silver_clasp',
        materialName: 'Silver Clasp',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'wolf_pelt_cloak',
      itemName: 'Wolf Pelt Cloak',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 500,
    difficulty: 86,
    xpGain: 260,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['master', 'cloak', 'intimidation', 'warmth'],
    specialNotes: 'Provides intimidation bonus and cold resistance'
  },
  {
    id: 'lw_desperado_duster',
    name: 'Desperado Duster',
    description: 'A legendary duster worn by the most notorious outlaws. Dark as midnight.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'shadow_leather',
        materialName: 'Shadow-treated Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 20
      },
      {
        materialId: 'premium_leather',
        materialName: 'Premium Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 10
      },
      {
        materialId: 'obsidian_buttons',
        materialName: 'Obsidian Buttons',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 8
      }
    ],
    output: {
      itemId: 'desperado_duster',
      itemName: 'Desperado Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 560,
    difficulty: 90,
    xpGain: 300,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.03,
    category: 'armor',
    tags: ['master', 'coat', 'legendary', 'stealth'],
    specialNotes: 'Provides stealth and intimidation bonuses'
  },
  {
    id: 'lw_mountain_man_armor',
    name: 'Mountain Man Armor',
    description: 'Full leather armor made from various exotic hides. A testament to frontier survival.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 88,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'grizzly_hide',
        materialName: 'Grizzly Bear Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 10
      },
      {
        materialId: 'elk_hide',
        materialName: 'Elk Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 8
      },
      {
        materialId: 'buffalo_hide',
        materialName: 'Buffalo Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 6
      },
      {
        materialId: 'fur_lining',
        materialName: 'Fur Lining',
        category: MaterialCategory.FABRIC,
        quantity: 12
      }
    ],
    output: {
      itemId: 'mountain_man_armor',
      itemName: 'Mountain Man Armor',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 92,
    xpGain: 350,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['master', 'armor', 'legendary', 'set'],
    specialNotes: 'Full armor set with survival bonuses'
  },

  // ============================================================================
  // NEW RECIPES - GRANDMASTER TIER (91-100) - 4 Additional Recipes
  // ============================================================================
  {
    id: 'lw_spirit_touched_armor',
    name: 'Spirit-Touched Armor',
    description: 'Leather armor imbued with the essence of frontier spirits. Offers supernatural protection.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DYE_VAT,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'spectral_hide',
        materialName: 'Spectral Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 20
      },
      {
        materialId: 'spirit_essence',
        materialName: 'Spirit Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      },
      {
        materialId: 'moonsilk',
        materialName: 'Moonsilk',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'blessed_thread',
        materialName: 'Blessed Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 6
      }
    ],
    output: {
      itemId: 'spirit_touched_armor',
      itemName: 'Spirit-Touched Armor',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1000,
    difficulty: 96,
    xpGain: 550,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'supernatural', 'set'],
    specialNotes: 'Provides resistance to supernatural damage and spirit sight'
  },
  {
    id: 'lw_wendigo_hide_cloak',
    name: 'Wendigo Hide Cloak',
    description: 'A terrifying cloak made from wendigo hide. Strikes fear into all who behold it.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'wendigo_hide',
        materialName: 'Wendigo Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 15
      },
      {
        materialId: 'nightmare_essence',
        materialName: 'Nightmare Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'void_silk',
        materialName: 'Void Silk',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'bone_clasp',
        materialName: 'Cursed Bone Clasp',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'wendigo_hide_cloak',
      itemName: 'Wendigo Hide Cloak',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1100,
    difficulty: 98,
    xpGain: 620,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'supernatural', 'fear'],
    specialNotes: 'Causes fear in enemies and grants cold immunity'
  },
  {
    id: 'lw_thunderbird_saddle',
    name: 'Thunderbird Saddle',
    description: 'A mythical saddle crafted from thunderbird feathers and hide. Commands the storm.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'thunderbird_hide',
        materialName: 'Thunderbird Hide',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 18
      },
      {
        materialId: 'storm_essence',
        materialName: 'Storm Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'sky_metal_stirrups',
        materialName: 'Sky Metal Stirrups',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'lightning_thread',
        materialName: 'Lightning Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      }
    ],
    output: {
      itemId: 'thunderbird_saddle',
      itemName: 'Thunderbird Saddle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1400,
    difficulty: 100,
    xpGain: 750,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'mount',
    tags: ['grandmaster', 'legendary', 'supernatural', 'mount'],
    specialNotes: 'Grants mount lightning speed and storm calling abilities'
  },
  {
    id: 'lw_skinwalker_garb',
    name: 'Skinwalker Garb',
    description: 'Ancient armor that allows the wearer to take on aspects of beasts. A forbidden art.',
    professionId: ProfessionId.LEATHERWORKING,
    requirements: {
      professionId: ProfessionId.LEATHERWORKING,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DYE_VAT,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'skinwalker_pelt',
        materialName: 'Skinwalker Pelt',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 25
      },
      {
        materialId: 'primal_essence',
        materialName: 'Primal Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 15
      },
      {
        materialId: 'shapeshifter_blood',
        materialName: 'Shapeshifter Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'moonstone_clasp',
        materialName: 'Moonstone Clasp',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'eternity_thread',
        materialName: 'Eternity Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 12
      }
    ],
    output: {
      itemId: 'skinwalker_garb',
      itemName: 'Skinwalker Garb',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 900,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'supernatural', 'transformation', 'unique'],
    specialNotes: 'Legendary set. Grants ability to temporarily transform into animal forms.'
  }
];

export default leatherworkingRecipes;
