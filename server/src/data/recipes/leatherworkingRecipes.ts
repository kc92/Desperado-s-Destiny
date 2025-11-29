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
  }
];

export default leatherworkingRecipes;
