/**
 * Cooking Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Masters of the kitchen - prepare meals and drinks that sustain and empower
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType
} from '@desperados/shared';

export const cookingRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================
  {
    id: 'cook_campfire_beans',
    name: 'Campfire Beans',
    description: 'Simple beans cooked over a fire. Fills the belly on the trail.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'beans',
        materialName: 'Dried Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'campfire_beans',
      itemName: 'Campfire Beans',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'food', 'basic']
  },
  {
    id: 'cook_jerky',
    name: 'Beef Jerky',
    description: 'Dried and salted meat. Lasts for weeks on the trail.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'raw_beef',
        materialName: 'Raw Beef',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'beef_jerky',
      itemName: 'Beef Jerky',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'meat', 'preserved']
  },
  {
    id: 'cook_coffee',
    name: 'Strong Coffee',
    description: 'Hot black coffee. Keeps you alert and moving.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'coffee_beans',
        materialName: 'Coffee Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'strong_coffee',
      itemName: 'Strong Coffee',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'drink', 'energy']
  },
  {
    id: 'cook_hardtack',
    name: 'Hardtack Biscuits',
    description: 'Rock-hard biscuits that last forever. Not tasty, but filling.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'flour',
        materialName: 'Flour',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hardtack',
      itemName: 'Hardtack Biscuits',
      baseQuantity: 6,
      qualityAffectsStats: false
    },
    baseCraftTime: 60,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'bread', 'preserved']
  },
  {
    id: 'cook_bacon_strips',
    name: 'Fried Bacon',
    description: 'Crispy bacon strips. A frontier breakfast staple.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'raw_pork',
        materialName: 'Raw Pork Belly',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'fried_bacon',
      itemName: 'Fried Bacon',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'meat', 'breakfast']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'cook_stew',
    name: 'Hearty Stew',
    description: 'Thick stew with meat and vegetables. Warms the soul.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'beef_chunks',
        materialName: 'Beef Chunks',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'potatoes',
        materialName: 'Potatoes',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'carrots',
        materialName: 'Carrots',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'herbs',
        materialName: 'Herbs',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hearty_stew',
      itemName: 'Hearty Stew',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'stew', 'meal']
  },
  {
    id: 'cook_cornbread',
    name: 'Golden Cornbread',
    description: 'Sweet cornbread that pairs perfectly with chili or stew.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'cornmeal',
        materialName: 'Cornmeal',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'eggs',
        materialName: 'Eggs',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'butter',
        materialName: 'Butter',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cornbread',
      itemName: 'Golden Cornbread',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'bread', 'side']
  },
  {
    id: 'cook_whiskey',
    name: 'Frontier Whiskey',
    description: 'Strong homemade whiskey. Burns going down, warms the insides.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'grain',
        materialName: 'Grain',
        category: MaterialCategory.VEGETABLE,
        quantity: 5
      },
      {
        materialId: 'yeast',
        materialName: 'Yeast',
        category: MaterialCategory.HERB,
        quantity: 1
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'frontier_whiskey',
      itemName: 'Frontier Whiskey',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'alcohol', 'drink']
  },
  {
    id: 'cook_roasted_chicken',
    name: 'Roasted Chicken',
    description: 'Whole chicken roasted to perfection with herbs.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'whole_chicken',
        materialName: 'Whole Chicken',
        category: MaterialCategory.MEAT,
        quantity: 1
      },
      {
        materialId: 'herbs',
        materialName: 'Fresh Herbs',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'butter',
        materialName: 'Butter',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'roasted_chicken',
      itemName: 'Roasted Chicken',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'poultry', 'meal']
  },
  {
    id: 'cook_apple_pie',
    name: 'Apple Pie',
    description: 'Sweet apple pie like mama used to make. Provides comfort and healing.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'apples',
        materialName: 'Fresh Apples',
        category: MaterialCategory.VEGETABLE,
        quantity: 6
      },
      {
        materialId: 'flour',
        materialName: 'Flour',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'sugar',
        materialName: 'Sugar',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'cinnamon',
        materialName: 'Cinnamon',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'apple_pie',
      itemName: 'Apple Pie',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'dessert', 'healing']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'cook_bbq_brisket',
    name: 'BBQ Brisket',
    description: 'Slow-smoked brisket with a tangy sauce. A Texas delicacy.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.SMOKER,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'beef_brisket',
        materialName: 'Beef Brisket',
        category: MaterialCategory.MEAT,
        quantity: 5
      },
      {
        materialId: 'bbq_sauce',
        materialName: 'BBQ Sauce',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'wood_chips',
        materialName: 'Mesquite Wood Chips',
        category: MaterialCategory.WOOD,
        quantity: 3
      }
    ],
    output: {
      itemId: 'bbq_brisket',
      itemName: 'BBQ Brisket',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'meat', 'bbq'],
    specialNotes: '+15 Strength for 2 hours'
  },
  {
    id: 'cook_sourdough',
    name: 'Sourdough Bread',
    description: 'Tangy sourdough bread made with traditional starter. Excellent quality.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'sourdough_starter',
        materialName: 'Sourdough Starter',
        category: MaterialCategory.HERB,
        quantity: 1
      },
      {
        materialId: 'flour',
        materialName: 'Flour',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sourdough_bread',
      itemName: 'Sourdough Bread',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'bread', 'artisan']
  },
  {
    id: 'cook_premium_bourbon',
    name: 'Premium Bourbon',
    description: 'Aged bourbon whiskey with smooth finish. Top shelf quality.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'corn',
        materialName: 'Corn',
        category: MaterialCategory.VEGETABLE,
        quantity: 6
      },
      {
        materialId: 'oak_barrel',
        materialName: 'Oak Barrel',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'yeast',
        materialName: 'Premium Yeast',
        category: MaterialCategory.HERB,
        quantity: 1
      }
    ],
    output: {
      itemId: 'premium_bourbon',
      itemName: 'Premium Bourbon',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.VENDOR,
    learningCost: 400,
    category: 'consumable',
    tags: ['journeyman', 'alcohol', 'premium']
  },
  {
    id: 'cook_venison_steak',
    name: 'Venison Steak',
    description: 'Perfectly cooked deer steak. Lean and flavorful.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'venison',
        materialName: 'Venison',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'garlic',
        materialName: 'Garlic',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'butter',
        materialName: 'Butter',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'venison_steak',
      itemName: 'Venison Steak',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 44,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'meat', 'wild']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'cook_chili_con_carne',
    name: 'Chili Con Carne',
    description: 'Spicy chili that brings tears to your eyes and fire to your belly.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'ground_beef',
        materialName: 'Ground Beef',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'chili_peppers',
        materialName: 'Chili Peppers',
        category: MaterialCategory.SPICE,
        quantity: 5
      },
      {
        materialId: 'beans',
        materialName: 'Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'tomatoes',
        materialName: 'Tomatoes',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'chili_con_carne',
      itemName: 'Chili Con Carne',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['expert', 'spicy', 'meal'],
    specialNotes: '+20 Combat, +10% Fire Resistance'
  },
  {
    id: 'cook_fancy_dinner',
    name: 'Fancy Dinner',
    description: 'Multi-course meal fit for high society. Provides multiple buffs.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 55,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'prime_steak',
        materialName: 'Prime Steak',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'lobster',
        materialName: 'Lobster',
        category: MaterialCategory.MEAT,
        quantity: 1
      },
      {
        materialId: 'truffle',
        materialName: 'Truffle',
        category: MaterialCategory.HERB,
        quantity: 1
      },
      {
        materialId: 'fine_wine',
        materialName: 'Fine Wine',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'fancy_dinner',
      itemName: 'Fancy Dinner',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 65,
    xpGain: 140,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['expert', 'gourmet', 'multi-buff']
  },
  {
    id: 'cook_aged_whiskey',
    name: 'Aged Whiskey',
    description: '20-year aged whiskey. Smooth as silk, valuable as gold.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'grain_mash',
        materialName: 'Premium Grain Mash',
        category: MaterialCategory.VEGETABLE,
        quantity: 8
      },
      {
        materialId: 'oak_barrel_aged',
        materialName: 'Aged Oak Barrel',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'time_essence',
        materialName: 'Time Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'aged_whiskey',
      itemName: 'Aged Whiskey',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 68,
    xpGain: 150,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['expert', 'alcohol', 'aged'],
    specialNotes: 'Can be sold for high profit'
  },
  {
    id: 'cook_buffalo_steak',
    name: 'Buffalo Ribeye',
    description: 'Massive buffalo steak. Provides significant strength boost.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'buffalo_meat',
        materialName: 'Buffalo Ribeye',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'rock_salt',
        materialName: 'Rock Salt',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'black_pepper',
        materialName: 'Black Pepper',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'buffalo_ribeye',
      itemName: 'Buffalo Ribeye',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 62,
    xpGain: 130,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['expert', 'meat', 'strength']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'cook_fiesta_feast',
    name: 'Fiesta Feast',
    description: 'Elaborate Mexican feast with enchiladas, tamales, and more. Feeds a gang.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'beef',
        materialName: 'Beef',
        category: MaterialCategory.MEAT,
        quantity: 6
      },
      {
        materialId: 'chicken',
        materialName: 'Chicken',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'tortillas',
        materialName: 'Tortillas',
        category: MaterialCategory.VEGETABLE,
        quantity: 20
      },
      {
        materialId: 'peppers',
        materialName: 'Peppers',
        category: MaterialCategory.SPICE,
        quantity: 8
      },
      {
        materialId: 'cheese',
        materialName: 'Cheese',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      }
    ],
    output: {
      itemId: 'fiesta_feast',
      itemName: 'Fiesta Feast',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['master', 'feast', 'party'],
    specialNotes: 'Feeds 8 people, all get buffs'
  },
  {
    id: 'cook_dragons_breath_chili',
    name: "Dragon's Breath Chili",
    description: 'Legendary chili so spicy it grants fire immunity. Not for the faint of heart.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'dragon_pepper',
        materialName: 'Dragon Pepper',
        category: MaterialCategory.SPICE,
        quantity: 10
      },
      {
        materialId: 'ghost_pepper',
        materialName: 'Ghost Pepper',
        category: MaterialCategory.SPICE,
        quantity: 8
      },
      {
        materialId: 'fire_essence',
        materialName: 'Fire Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'beef',
        materialName: 'Beef',
        category: MaterialCategory.MEAT,
        quantity: 5
      }
    ],
    output: {
      itemId: 'dragons_breath_chili',
      itemName: "Dragon's Breath Chili",
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.03,
    category: 'consumable',
    tags: ['master', 'spicy', 'legendary'],
    specialNotes: 'Grants fire immunity for 1 hour'
  },
  {
    id: 'cook_ambrosia',
    name: 'Ambrosia',
    description: 'Food of the gods. Heals all wounds and provides divine blessing.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'golden_apple',
        materialName: 'Golden Apple',
        category: MaterialCategory.VEGETABLE,
        quantity: 5
      },
      {
        materialId: 'nectar',
        materialName: 'Divine Nectar',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'honey',
        materialName: 'Sacred Honey',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'ambrosia',
      itemName: 'Ambrosia',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['master', 'divine', 'healing']
  },
  {
    id: 'cook_legendary_moonshine',
    name: 'Legendary Moonshine',
    description: 'Impossibly strong moonshine. One sip grants courage, two grant invincibility (or unconsciousness).',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'corn_mash',
        materialName: 'Premium Corn Mash',
        category: MaterialCategory.VEGETABLE,
        quantity: 12
      },
      {
        materialId: 'lightning_in_bottle',
        materialName: 'Bottled Lightning',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'spring_water',
        materialName: 'Mountain Spring Water',
        category: MaterialCategory.MINERAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'legendary_moonshine',
      itemName: 'Legendary Moonshine',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 90,
    xpGain: 300,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['master', 'alcohol', 'legendary']
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'cook_last_supper',
    name: 'The Last Supper',
    description: 'A legendary feast that grants massive buffs to an entire gang. Only the greatest chefs can prepare it.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'phoenix_meat',
        materialName: 'Phoenix Meat',
        category: MaterialCategory.MEAT,
        quantity: 5
      },
      {
        materialId: 'divine_vegetables',
        materialName: 'Divine Vegetables',
        category: MaterialCategory.VEGETABLE,
        quantity: 10
      },
      {
        materialId: 'celestial_wine',
        materialName: 'Celestial Wine',
        category: MaterialCategory.ALCOHOL,
        quantity: 3
      },
      {
        materialId: 'blessing_of_plenty',
        materialName: 'Blessing of Plenty',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'the_last_supper',
      itemName: 'The Last Supper',
      baseQuantity: 12,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'feast', 'unique'],
    specialNotes: 'Feeds 12 people. All stats +50, all resistances +25% for 6 hours'
  },
  {
    id: 'cook_elixir_of_life',
    name: 'Elixir of Life',
    description: 'A drink that restores youth and vitality. The ultimate achievement in cooking.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'fountain_water',
        materialName: 'Fountain of Youth Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'life_fruit',
        materialName: 'Fruit of Life',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'immortal_honey',
        materialName: 'Immortal Honey',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'elixir_of_life',
      itemName: 'Elixir of Life',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1200,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'immortality'],
    specialNotes: 'Restores full health, removes all debuffs, +100 max HP permanently'
  },
  {
    id: 'cook_perfect_meal',
    name: 'The Perfect Meal',
    description: 'Culinary perfection. A meal so good it brings tears to those who taste it.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'wagyu_beef',
        materialName: 'Legendary Wagyu Beef',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'truffle_supreme',
        materialName: 'Supreme Truffle',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'saffron',
        materialName: 'Pure Saffron',
        category: MaterialCategory.SPICE,
        quantity: 5
      },
      {
        materialId: 'essence_of_perfection',
        materialName: 'Essence of Perfection',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'the_perfect_meal',
      itemName: 'The Perfect Meal',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 800,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'perfection', 'unique'],
    specialNotes: 'All stats +100 for 24 hours. Provides enlightenment buff.'
  }
];

export default cookingRecipes;
