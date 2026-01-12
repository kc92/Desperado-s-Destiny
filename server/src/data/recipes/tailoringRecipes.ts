/**
 * Tailoring Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Masters of cloth and thread - craft clothing, disguises, and fancy wear
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType
} from '@desperados/shared';

export const tailoringRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================
  {
    id: 'tail_simple_shirt',
    name: 'Simple Cotton Shirt',
    description: 'Basic cotton shirt. Everyone needs one.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.SEWING_TABLE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'simple_shirt',
      itemName: 'Simple Cotton Shirt',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'clothing', 'basic']
  },
  {
    id: 'tail_bandana',
    name: 'Bandana',
    description: 'Simple cloth bandana. Can be worn as mask or headwear.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 1
      },
      {
        materialId: 'dye',
        materialName: 'Dye',
        category: MaterialCategory.DYE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'bandana',
      itemName: 'Bandana',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'mask', 'outlaw']
  },
  {
    id: 'tail_cloth_bag',
    name: 'Cloth Bag',
    description: 'Simple cloth bag for carrying small items.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'burlap',
        materialName: 'Burlap',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'rope',
        materialName: 'Rope',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cloth_bag',
      itemName: 'Cloth Bag',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 45,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'storage', 'bag']
  },
  {
    id: 'tail_neckerchief',
    name: 'Neckerchief',
    description: 'Decorative neckerchief worn by cowboys and ranchers.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'silk',
        materialName: 'Silk',
        category: MaterialCategory.FABRIC,
        quantity: 1
      },
      {
        materialId: 'dye',
        materialName: 'Dye',
        category: MaterialCategory.DYE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'neckerchief',
      itemName: 'Neckerchief',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'style', 'cowboy']
  },
  {
    id: 'tail_work_pants',
    name: 'Work Pants',
    description: 'Durable canvas pants for hard work.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      }
    ],
    output: {
      itemId: 'work_pants',
      itemName: 'Work Pants',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 12,
    xpGain: 20,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'pants', 'work']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'tail_work_clothes',
    name: 'Work Clothes Set',
    description: 'Complete set of working clothes. Durable and practical.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'denim',
        materialName: 'Denim',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 8
      }
    ],
    output: {
      itemId: 'work_clothes',
      itemName: 'Work Clothes Set',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'set', 'work']
  },
  {
    id: 'tail_cowboy_hat',
    name: 'Cowboy Hat',
    description: 'Classic wide-brimmed hat. Essential frontier fashion.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'felt',
        materialName: 'Felt',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'leather_band',
        materialName: 'Leather Band',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cowboy_hat',
      itemName: 'Cowboy Hat',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'hat', 'iconic']
  },
  {
    id: 'tail_travel_pack',
    name: 'Travel Pack',
    description: 'Canvas backpack with multiple pockets for organization.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.ACCESSORY,
        quantity: 3
      }
    ],
    output: {
      itemId: 'travel_pack',
      itemName: 'Travel Pack',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'bag', 'storage']
  },
  {
    id: 'tail_poncho',
    name: 'Poncho',
    description: 'Weatherproof poncho. Protects from rain and sun.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'waterproof_coating',
        materialName: 'Waterproof Coating',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'poncho',
      itemName: 'Poncho',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'coat', 'weather']
  },
  {
    id: 'tail_dress_shirt',
    name: 'Dress Shirt',
    description: 'Fine cotton shirt for formal occasions.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'fine_cotton',
        materialName: 'Fine Cotton',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'pearl_buttons',
        materialName: 'Pearl Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      }
    ],
    output: {
      itemId: 'dress_shirt',
      itemName: 'Dress Shirt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'formal', 'charisma']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'tail_fancy_vest',
    name: 'Fancy Vest',
    description: 'Embroidered vest with golden buttons. For gamblers and gentlemen.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'velvet',
        materialName: 'Velvet',
        category: MaterialCategory.FABRIC,
        quantity: 5
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'gold_buttons',
        materialName: 'Gold Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      }
    ],
    output: {
      itemId: 'fancy_vest',
      itemName: 'Fancy Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'vest', 'gambler']
  },
  {
    id: 'tail_disguise_kit',
    name: 'Disguise Kit',
    description: 'Complete outfit for assuming a different identity. Essential for infiltration.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'various_fabrics',
        materialName: 'Various Fabrics',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'false_beard',
        materialName: 'False Beard',
        category: MaterialCategory.ACCESSORY,
        quantity: 1
      },
      {
        materialId: 'makeup',
        materialName: 'Stage Makeup',
        category: MaterialCategory.DYE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'disguise_kit',
      itemName: 'Disguise Kit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.VENDOR,
    learningCost: 350,
    category: 'utility',
    tags: ['journeyman', 'disguise', 'stealth']
  },
  {
    id: 'tail_large_satchel',
    name: 'Large Satchel',
    description: 'Spacious bag with reinforced stitching. Holds significantly more items.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'heavy_canvas',
        materialName: 'Heavy Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'reinforced_thread',
        materialName: 'Reinforced Thread',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'brass_clasps',
        materialName: 'Brass Clasps',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      }
    ],
    output: {
      itemId: 'large_satchel',
      itemName: 'Large Satchel',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['journeyman', 'bag', 'storage']
  },
  {
    id: 'tail_serape',
    name: 'Traditional Serape',
    description: 'Colorful Mexican blanket worn as clothing. Stylish and warm.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'colored_dyes',
        materialName: 'Colored Dyes',
        category: MaterialCategory.DYE,
        quantity: 5
      }
    ],
    output: {
      itemId: 'serape',
      itemName: 'Traditional Serape',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 44,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'cultural', 'style']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'tail_gambler_suit',
    name: "Gambler's Suit",
    description: 'Three-piece suit with hidden pockets. Perfect for card sharps.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'fine_wool',
        materialName: 'Fine Wool',
        category: MaterialCategory.FABRIC,
        quantity: 12
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'gold_buttons',
        materialName: 'Gold Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 12
      },
      {
        materialId: 'pocket_watch_chain',
        materialName: 'Pocket Watch Chain',
        category: MaterialCategory.ACCESSORY,
        quantity: 1
      }
    ],
    output: {
      itemId: 'gambler_suit',
      itemName: "Gambler's Suit",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 65,
    xpGain: 130,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['expert', 'suit', 'gambler'],
    specialNotes: '+15 Charisma, +10% Luck'
  },
  {
    id: 'tail_theater_costume',
    name: 'Theater Costume',
    description: 'Elaborate costume for theatrical performances or elaborate disguises.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 55,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'silk',
        materialName: 'Silk',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'sequins',
        materialName: 'Sequins',
        category: MaterialCategory.ACCESSORY,
        quantity: 50
      },
      {
        materialId: 'feathers',
        materialName: 'Feathers',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 20
      }
    ],
    output: {
      itemId: 'theater_costume',
      itemName: 'Theater Costume',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'costume', 'performance']
  },
  {
    id: 'tail_bottomless_bag',
    name: 'Bottomless Bag',
    description: 'Magically enhanced bag that holds far more than it should.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'enchanted_fabric',
        materialName: 'Enchanted Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'void_essence',
        materialName: 'Void Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'rune_thread',
        materialName: 'Rune Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      }
    ],
    output: {
      itemId: 'bottomless_bag',
      itemName: 'Bottomless Bag',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 420,
    difficulty: 68,
    xpGain: 150,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'utility',
    tags: ['expert', 'bag', 'magical'],
    specialNotes: 'Increases inventory capacity by 100 slots'
  },
  {
    id: 'tail_saloon_dress',
    name: 'Saloon Girl Dress',
    description: 'Elegant dress for working the saloons. Boosts charisma significantly.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'satin',
        materialName: 'Satin',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'lace',
        materialName: 'Lace',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'ribbon',
        materialName: 'Ribbon',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      }
    ],
    output: {
      itemId: 'saloon_dress',
      itemName: 'Saloon Girl Dress',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 62,
    xpGain: 130,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'dress', 'charisma']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'tail_shadow_cloak',
    name: 'Shadow Cloak',
    description: 'Black cloak treated with shadow essence. Grants stealth bonuses.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'shadow_silk',
        materialName: 'Shadow Silk',
        category: MaterialCategory.FABRIC,
        quantity: 15
      },
      {
        materialId: 'void_essence',
        materialName: 'Void Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'obsidian_clasp',
        materialName: 'Obsidian Clasp',
        category: MaterialCategory.ACCESSORY,
        quantity: 1
      }
    ],
    output: {
      itemId: 'shadow_cloak',
      itemName: 'Shadow Cloak',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['master', 'cloak', 'stealth'],
    specialNotes: '+50% stealth, invisibility in shadows'
  },
  {
    id: 'tail_governor_attire',
    name: "Governor's Attire",
    description: 'Luxurious formal wear fit for territorial governors and high society.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'royal_silk',
        materialName: 'Royal Silk',
        category: MaterialCategory.FABRIC,
        quantity: 20
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      },
      {
        materialId: 'diamond_buttons',
        materialName: 'Diamond Buttons',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      }
    ],
    output: {
      itemId: 'governor_attire',
      itemName: "Governor's Attire",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['master', 'formal', 'prestige']
  },
  {
    id: 'tail_wedding_dress',
    name: 'Frontier Wedding Dress',
    description: 'Beautiful wedding dress with intricate lacework. A masterpiece.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'white_silk',
        materialName: 'White Silk',
        category: MaterialCategory.FABRIC,
        quantity: 18
      },
      {
        materialId: 'lace',
        materialName: 'Fine Lace',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'pearls',
        materialName: 'Pearls',
        category: MaterialCategory.ACCESSORY,
        quantity: 50
      }
    ],
    output: {
      itemId: 'wedding_dress',
      itemName: 'Frontier Wedding Dress',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['master', 'dress', 'wedding']
  },
  {
    id: 'tail_marshal_uniform',
    name: "US Marshal Uniform",
    description: 'Official uniform of United States Marshals. Commands respect and fear.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'military_wool',
        materialName: 'Military Wool',
        category: MaterialCategory.FABRIC,
        quantity: 15
      },
      {
        materialId: 'brass_buttons',
        materialName: 'Brass Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 20
      },
      {
        materialId: 'badge',
        materialName: 'Marshal Badge',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'marshal_uniform',
      itemName: 'US Marshal Uniform',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 90,
    xpGain: 300,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['master', 'lawman', 'uniform']
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'tail_desperado_coat',
    name: "The Desperado's Coat",
    description: 'Legendary coat said to be worn by the greatest outlaws. Grants incredible bonuses.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'legendary_leather',
        materialName: 'Legendary Leather',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 20
      },
      {
        materialId: 'phoenix_silk',
        materialName: 'Phoenix Silk',
        category: MaterialCategory.FABRIC,
        quantity: 15
      },
      {
        materialId: 'spirit_thread',
        materialName: 'Spirit Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'outlaw_essence',
        materialName: 'Essence of the Outlaw',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      }
    ],
    output: {
      itemId: 'desperado_coat',
      itemName: "The Desperado's Coat",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'coat', 'unique'],
    specialNotes: 'All stats +50, immunity to weather, +100% intimidation'
  },
  {
    id: 'tail_angel_dress',
    name: 'Dress of the Angel',
    description: 'Divine garment woven from celestial silk. Radiates pure light.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'celestial_silk',
        materialName: 'Celestial Silk',
        category: MaterialCategory.FABRIC,
        quantity: 25
      },
      {
        materialId: 'angel_feathers',
        materialName: 'Angel Feathers',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'holy_thread',
        materialName: 'Holy Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      }
    ],
    output: {
      itemId: 'angel_dress',
      itemName: 'Dress of the Angel',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1200,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'divine'],
    specialNotes: '+100 Charisma, healing aura, light generation'
  },
  {
    id: 'tail_infinity_cloak',
    name: 'Cloak of Infinity',
    description: 'A cloak that exists outside normal space. Provides unlimited storage in hidden pockets.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'void_fabric',
        materialName: 'Void Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 30
      },
      {
        materialId: 'space_essence',
        materialName: 'Essence of Space',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'infinity_stone',
        materialName: 'Infinity Stone',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'infinity_cloak',
      itemName: 'Cloak of Infinity',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 800,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'space', 'unique'],
    specialNotes: 'Infinite inventory capacity, teleportation ability'
  },

  // ============================================================================
  // NEW RECIPES - PHASE 7.3 EXPANSION
  // ============================================================================

  // ============================================================================
  // NOVICE TIER ADDITIONS (1-15) - 5 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_red_bandana',
    name: 'Red Outlaw Bandana',
    description: 'A crimson bandana favored by outlaws for masking their identity during robberies.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 1
      },
      {
        materialId: 'red_dye',
        materialName: 'Red Dye',
        category: MaterialCategory.DYE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'red_bandana',
      itemName: 'Red Outlaw Bandana',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 5,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'mask', 'outlaw']
  },
  {
    id: 'tail_cotton_undershirt',
    name: 'Cotton Undershirt',
    description: 'A simple undershirt worn beneath other garments. Basic but essential.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cotton_undershirt',
      itemName: 'Cotton Undershirt',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 25,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'clothing', 'basic']
  },
  {
    id: 'tail_linen_work_shirt',
    name: 'Linen Work Shirt',
    description: 'A breathable linen shirt perfect for hot days on the ranch.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'linen',
        materialName: 'Linen',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      }
    ],
    output: {
      itemId: 'linen_work_shirt',
      itemName: 'Linen Work Shirt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 35,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'clothing', 'work']
  },
  {
    id: 'tail_simple_apron',
    name: 'Simple Apron',
    description: 'A basic apron for shopkeepers, cooks, and craftsmen.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'simple_apron',
      itemName: 'Simple Apron',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 10,
    xpGain: 14,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['novice', 'work', 'apron']
  },
  {
    id: 'tail_wool_socks',
    name: 'Wool Socks',
    description: 'Warm wool socks to keep feet comfortable on long rides.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 14,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'wool_socks',
      itemName: 'Wool Socks',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 25,
    difficulty: 12,
    xpGain: 16,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['novice', 'clothing', 'comfort']
  },

  // ============================================================================
  // APPRENTICE TIER ADDITIONS (16-30) - 6 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_ranch_vest',
    name: 'Ranch Hand Vest',
    description: 'A sturdy leather-trimmed vest worn by cattle ranchers.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      }
    ],
    output: {
      itemId: 'ranch_vest',
      itemName: 'Ranch Hand Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'vest', 'ranch']
  },
  {
    id: 'tail_riding_pants',
    name: 'Riding Pants',
    description: 'Reinforced pants designed for long hours in the saddle.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'denim',
        materialName: 'Denim',
        category: MaterialCategory.FABRIC,
        quantity: 5
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 3
      }
    ],
    output: {
      itemId: 'riding_pants',
      itemName: 'Riding Pants',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 110,
    difficulty: 26,
    xpGain: 42,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'pants', 'riding']
  },
  {
    id: 'tail_flat_cap',
    name: 'Flat Cap',
    description: 'A simple flat cap popular among working men in frontier towns.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 21,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'flat_cap',
      itemName: 'Flat Cap',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 70,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'hat', 'casual']
  },
  {
    id: 'tail_cotton_vest',
    name: 'Cotton Vest',
    description: 'A lightweight cotton vest suitable for warm weather.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 23,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 5
      }
    ],
    output: {
      itemId: 'cotton_vest',
      itemName: 'Cotton Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 28,
    xpGain: 44,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'vest', 'casual']
  },
  {
    id: 'tail_suspenders',
    name: 'Suspenders',
    description: 'Sturdy suspenders to keep pants up during hard work.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 26,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 2
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      }
    ],
    output: {
      itemId: 'suspenders',
      itemName: 'Suspenders',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 50,
    difficulty: 20,
    xpGain: 30,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['apprentice', 'accessory', 'work']
  },
  {
    id: 'tail_cotton_bonnet',
    name: 'Cotton Bonnet',
    description: 'A practical bonnet worn by frontier women for sun protection.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 29,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'ribbon',
        materialName: 'Ribbon',
        category: MaterialCategory.ACCESSORY,
        quantity: 2
      },
      {
        materialId: 'thread',
        materialName: 'Thread',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cotton_bonnet',
      itemName: 'Cotton Bonnet',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 80,
    difficulty: 30,
    xpGain: 48,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['apprentice', 'hat', 'frontier']
  },

  // ============================================================================
  // JOURNEYMAN TIER ADDITIONS (31-50) - 7 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_duster_coat',
    name: 'Duster Coat',
    description: 'A long coat worn by riders to protect from dust and weather on the trail.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 32,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 8
      }
    ],
    output: {
      itemId: 'duster_coat',
      itemName: 'Duster Coat',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 160,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'coat', 'iconic']
  },
  {
    id: 'tail_riding_cloak',
    name: 'Riding Cloak',
    description: 'A weatherproof cloak with a wide hood for traveling in inclement weather.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 36,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 7
      },
      {
        materialId: 'waterproof_coating',
        materialName: 'Waterproof Coating',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'riding_cloak',
      itemName: 'Riding Cloak',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 46,
    xpGain: 82,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'cloak', 'weather']
  },
  {
    id: 'tail_bartender_outfit',
    name: 'Bartender Outfit',
    description: 'A complete outfit suitable for saloon bartenders. Includes apron and arm garters.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 39,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'cotton_fabric',
        materialName: 'Cotton Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 5
      },
      {
        materialId: 'silk',
        materialName: 'Silk',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'bartender_outfit',
      itemName: 'Bartender Outfit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 44,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'outfit', 'saloon']
  },
  {
    id: 'tail_sheriff_vest',
    name: 'Sheriff Vest',
    description: 'A respectable vest worn by lawmen. Commands authority.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 43,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'fine_wool',
        materialName: 'Fine Wool',
        category: MaterialCategory.FABRIC,
        quantity: 5
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 1
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 5
      }
    ],
    output: {
      itemId: 'sheriff_vest',
      itemName: 'Sheriff Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 48,
    xpGain: 85,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'vest', 'lawman']
  },
  {
    id: 'tail_dance_hall_skirt',
    name: 'Dance Hall Skirt',
    description: 'A layered, colorful skirt designed for saloon dancers.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 45,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'satin',
        materialName: 'Satin',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'lace',
        materialName: 'Lace',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'dye',
        materialName: 'Dye',
        category: MaterialCategory.DYE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'dance_hall_skirt',
      itemName: 'Dance Hall Skirt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 130,
    difficulty: 50,
    xpGain: 88,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'skirt', 'saloon']
  },
  {
    id: 'tail_preacher_coat',
    name: 'Preacher Coat',
    description: 'A long black coat worn by frontier preachers and traveling ministers.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 47,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'wool',
        materialName: 'Wool',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'black_dye',
        materialName: 'Black Dye',
        category: MaterialCategory.DYE,
        quantity: 4
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 10
      }
    ],
    output: {
      itemId: 'preacher_coat',
      itemName: 'Preacher Coat',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 52,
    xpGain: 92,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['journeyman', 'coat', 'religious']
  },
  {
    id: 'tail_bandolier',
    name: 'Bandolier',
    description: 'A cloth and leather bandolier for carrying ammunition across the chest.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 49,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'canvas',
        materialName: 'Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.ACCESSORY,
        quantity: 2
      }
    ],
    output: {
      itemId: 'bandolier',
      itemName: 'Bandolier',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 46,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'accessory',
    tags: ['journeyman', 'utility', 'combat']
  },

  // ============================================================================
  // EXPERT TIER ADDITIONS (51-70) - 6 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_fancy_corset',
    name: 'Fancy Corset',
    description: 'An elegantly embroidered corset for high society women of the frontier.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 52,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'satin',
        materialName: 'Satin',
        category: MaterialCategory.FABRIC,
        quantity: 5
      },
      {
        materialId: 'silk',
        materialName: 'Silk',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      },
      {
        materialId: 'whalebone',
        materialName: 'Whalebone',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 6
      }
    ],
    output: {
      itemId: 'fancy_corset',
      itemName: 'Fancy Corset',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 60,
    xpGain: 115,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'formal', 'charisma']
  },
  {
    id: 'tail_showman_jacket',
    name: 'Showman Jacket',
    description: 'A flashy jacket worn by snake oil salesmen and traveling showmen.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 56,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'velvet',
        materialName: 'Velvet',
        category: MaterialCategory.FABRIC,
        quantity: 7
      },
      {
        materialId: 'sequins',
        materialName: 'Sequins',
        category: MaterialCategory.ACCESSORY,
        quantity: 30
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'buttons',
        materialName: 'Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 8
      }
    ],
    output: {
      itemId: 'showman_jacket',
      itemName: 'Showman Jacket',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 62,
    xpGain: 125,
    learningSource: RecipeSource.VENDOR,
    learningCost: 500,
    category: 'armor',
    tags: ['expert', 'jacket', 'charisma']
  },
  {
    id: 'tail_mourning_dress',
    name: 'Mourning Dress',
    description: 'A somber black dress worn for funerals and periods of mourning.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 59,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'black_silk',
        materialName: 'Black Silk',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'lace',
        materialName: 'Black Lace',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'jet_buttons',
        materialName: 'Jet Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 10
      }
    ],
    output: {
      itemId: 'mourning_dress',
      itemName: 'Mourning Dress',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 260,
    difficulty: 64,
    xpGain: 130,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'dress', 'formal']
  },
  {
    id: 'tail_cavalry_shirt',
    name: 'Cavalry Shirt',
    description: 'Military-style shirt worn by cavalry officers and soldiers.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 64,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'military_wool',
        materialName: 'Military Wool',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'gold_buttons',
        materialName: 'Gold Buttons',
        category: MaterialCategory.ACCESSORY,
        quantity: 8
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'cavalry_shirt',
      itemName: 'Cavalry Shirt',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 66,
    xpGain: 135,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['expert', 'military', 'uniform']
  },
  {
    id: 'tail_ball_gown',
    name: 'Ball Gown',
    description: 'An exquisite gown for formal balls and high society gatherings.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 67,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'silk',
        materialName: 'Silk',
        category: MaterialCategory.FABRIC,
        quantity: 12
      },
      {
        materialId: 'satin',
        materialName: 'Satin',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'lace',
        materialName: 'Lace',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'pearls',
        materialName: 'Pearls',
        category: MaterialCategory.ACCESSORY,
        quantity: 20
      }
    ],
    output: {
      itemId: 'ball_gown',
      itemName: 'Ball Gown',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 70,
    xpGain: 150,
    learningSource: RecipeSource.TRAINER,
    category: 'armor',
    tags: ['expert', 'dress', 'formal'],
    specialNotes: '+25 Charisma, +10% Social Influence'
  },
  {
    id: 'tail_gunslinger_duster',
    name: 'Gunslinger Duster',
    description: 'A long duster with reinforced inner pockets for concealing weapons.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 69,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'heavy_canvas',
        materialName: 'Heavy Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 4
      },
      {
        materialId: 'reinforced_thread',
        materialName: 'Reinforced Thread',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'buckles',
        materialName: 'Buckles',
        category: MaterialCategory.ACCESSORY,
        quantity: 6
      }
    ],
    output: {
      itemId: 'gunslinger_duster',
      itemName: 'Gunslinger Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 68,
    xpGain: 145,
    learningSource: RecipeSource.VENDOR,
    learningCost: 600,
    category: 'armor',
    tags: ['expert', 'coat', 'combat'],
    specialNotes: '+2 hidden weapon slots, +10% Quick Draw speed'
  },

  // ============================================================================
  // MASTER TIER ADDITIONS (71-90) - 5 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_outlaw_legend_vest',
    name: 'Outlaw Legend Vest',
    description: 'A vest crafted with meticulous detail, rumored to have belonged to legendary outlaws.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 73,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'fine_wool',
        materialName: 'Fine Wool',
        category: MaterialCategory.FABRIC,
        quantity: 8
      },
      {
        materialId: 'silk_lining',
        materialName: 'Silk Lining',
        category: MaterialCategory.FABRIC,
        quantity: 4
      },
      {
        materialId: 'silver_thread',
        materialName: 'Silver Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 4
      },
      {
        materialId: 'cursed_buttons',
        materialName: 'Cursed Buttons',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      }
    ],
    output: {
      itemId: 'outlaw_legend_vest',
      itemName: 'Outlaw Legend Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 78,
    xpGain: 180,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.08,
    category: 'armor',
    tags: ['master', 'vest', 'legendary'],
    specialNotes: '+20% Intimidation, +15% Notoriety gain'
  },
  {
    id: 'tail_bulletproof_vest',
    name: 'Bulletproof Vest',
    description: 'A reinforced vest woven with metal fibers to provide protection against bullets.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 77,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'heavy_canvas',
        materialName: 'Heavy Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 10
      },
      {
        materialId: 'steel_mesh',
        materialName: 'Steel Mesh',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'reinforced_thread',
        materialName: 'Reinforced Thread',
        category: MaterialCategory.FABRIC,
        quantity: 6
      },
      {
        materialId: 'padding',
        materialName: 'Padding',
        category: MaterialCategory.FABRIC,
        quantity: 4
      }
    ],
    output: {
      itemId: 'bulletproof_vest',
      itemName: 'Bulletproof Vest',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 86,
    xpGain: 260,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['master', 'vest', 'protection'],
    specialNotes: '30% bullet damage reduction, -5% movement speed'
  },
  {
    id: 'tail_ghost_touched_cloak',
    name: 'Ghost-Touched Cloak',
    description: 'A pale, ethereal cloak that seems to shimmer with spectral energy.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 82,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'ethereal_silk',
        materialName: 'Ethereal Silk',
        category: MaterialCategory.FABRIC,
        quantity: 12
      },
      {
        materialId: 'ghost_essence',
        materialName: 'Ghost Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'silver_thread',
        materialName: 'Silver Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'ghost_touched_cloak',
      itemName: 'Ghost-Touched Cloak',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 500,
    difficulty: 88,
    xpGain: 290,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'armor',
    tags: ['master', 'cloak', 'supernatural'],
    specialNotes: 'Ability to see spirits, +30% stealth at night'
  },
  {
    id: 'tail_armored_duster',
    name: 'Armored Duster',
    description: 'A heavy duster reinforced with hidden metal plates for battlefield protection.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 86,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'reinforced_canvas',
        materialName: 'Reinforced Canvas',
        category: MaterialCategory.FABRIC,
        quantity: 14
      },
      {
        materialId: 'steel_plates',
        materialName: 'Steel Plates',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'leather_straps',
        materialName: 'Leather Straps',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 6
      },
      {
        materialId: 'padding',
        materialName: 'Padding',
        category: MaterialCategory.FABRIC,
        quantity: 6
      }
    ],
    output: {
      itemId: 'armored_duster',
      itemName: 'Armored Duster',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 92,
    xpGain: 320,
    learningSource: RecipeSource.REPUTATION,
    category: 'armor',
    tags: ['master', 'coat', 'armored'],
    specialNotes: '+25 Armor, 20% bullet resistance, conceals light weapons'
  },
  {
    id: 'tail_deadeye_bandana',
    name: 'Deadeye Bandana',
    description: 'A mystical bandana said to grant the wearer unnaturally keen eyesight.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 88,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'enchanted_silk',
        materialName: 'Enchanted Silk',
        category: MaterialCategory.FABRIC,
        quantity: 3
      },
      {
        materialId: 'hawk_feathers',
        materialName: 'Hawk Feathers',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 4
      },
      {
        materialId: 'rune_thread',
        materialName: 'Rune Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'dye',
        materialName: 'Dye',
        category: MaterialCategory.DYE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'deadeye_bandana',
      itemName: 'Deadeye Bandana',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 85,
    xpGain: 270,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'accessory',
    tags: ['master', 'accessory', 'magical'],
    specialNotes: '+25% accuracy, enhanced vision, see enemy weak points'
  },

  // ============================================================================
  // GRANDMASTER TIER ADDITIONS (91-100) - 4 NEW RECIPES
  // ============================================================================
  {
    id: 'tail_blessed_vestments',
    name: 'Blessed Vestments',
    description: 'Holy robes blessed by multiple faiths. Radiates divine protection.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'holy_silk',
        materialName: 'Holy Silk',
        category: MaterialCategory.FABRIC,
        quantity: 20
      },
      {
        materialId: 'blessed_thread',
        materialName: 'Blessed Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      },
      {
        materialId: 'sacred_symbols',
        materialName: 'Sacred Symbols',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'gold_trim',
        materialName: 'Gold Trim',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 6
      }
    ],
    output: {
      itemId: 'blessed_vestments',
      itemName: 'Blessed Vestments',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 720,
    difficulty: 95,
    xpGain: 450,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'armor',
    tags: ['grandmaster', 'vestments', 'holy'],
    specialNotes: 'Immunity to curses, +50% healing received, harms undead on touch'
  },
  {
    id: 'tail_spirit_woven_serape',
    name: 'Spirit-Woven Serape',
    description: 'A serape woven with threads from the spirit world. The patterns seem to move on their own.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'spirit_wool',
        materialName: 'Spirit Wool',
        category: MaterialCategory.FABRIC,
        quantity: 15
      },
      {
        materialId: 'ancestral_dyes',
        materialName: 'Ancestral Dyes',
        category: MaterialCategory.DYE,
        quantity: 8
      },
      {
        materialId: 'spirit_thread',
        materialName: 'Spirit Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 6
      },
      {
        materialId: 'shaman_blessing',
        materialName: 'Shaman Blessing',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'spirit_woven_serape',
      itemName: 'Spirit-Woven Serape',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 97,
    xpGain: 550,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'armor',
    tags: ['grandmaster', 'serape', 'supernatural'],
    specialNotes: 'Communicate with spirits, +40% resistance to supernatural damage'
  },
  {
    id: 'tail_death_shroud',
    name: "Death's Shroud",
    description: 'A cloak woven from the fabric between life and death. Feared across the frontier.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'void_fabric',
        materialName: 'Void Fabric',
        category: MaterialCategory.FABRIC,
        quantity: 25
      },
      {
        materialId: 'death_essence',
        materialName: "Death's Essence",
        category: MaterialCategory.RARE_REAGENT,
        quantity: 8
      },
      {
        materialId: 'shadow_thread',
        materialName: 'Shadow Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'bone_clasps',
        materialName: 'Bone Clasps',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 4
      }
    ],
    output: {
      itemId: 'death_shroud',
      itemName: "Death's Shroud",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1200,
    difficulty: 99,
    xpGain: 700,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['grandmaster', 'cloak', 'death', 'unique'],
    specialNotes: 'Immune to instant death effects, fear aura, can temporarily phase out of reality'
  },
  {
    id: 'tail_frontier_legend_outfit',
    name: 'Frontier Legend Outfit',
    description: 'The ultimate expression of frontier fashion. A complete outfit that embodies the spirit of the Wild West.',
    professionId: ProfessionId.TAILORING,
    requirements: {
      professionId: ProfessionId.TAILORING,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.MANNEQUIN,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'legendary_leather',
        materialName: 'Legendary Leather',
        category: MaterialCategory.EXOTIC_HIDE,
        quantity: 15
      },
      {
        materialId: 'celestial_silk',
        materialName: 'Celestial Silk',
        category: MaterialCategory.FABRIC,
        quantity: 20
      },
      {
        materialId: 'spirit_thread',
        materialName: 'Spirit Thread',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 12
      },
      {
        materialId: 'gold_thread',
        materialName: 'Gold Thread',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 10
      },
      {
        materialId: 'frontier_essence',
        materialName: 'Essence of the Frontier',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'frontier_legend_outfit',
      itemName: 'Frontier Legend Outfit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 2400,
    difficulty: 100,
    xpGain: 1000,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'armor',
    tags: ['grandmaster', 'legendary', 'outfit', 'unique'],
    specialNotes: 'All stats +75, +25% to all skills, immune to environmental hazards, legendary aura'
  }
];

export default tailoringRecipes;
