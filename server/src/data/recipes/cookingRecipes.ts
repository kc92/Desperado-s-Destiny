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

  // -------------------------------------------------------------------------
  // BASIC COOKING (Level 1-5) - Using Gathered Materials
  // -------------------------------------------------------------------------
  {
    id: 'cook_cooked_meat',
    name: 'Cooked Meat',
    description: 'Simple cooked meat. Better than eating it raw.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'meat',
        materialName: 'Meat',
        category: MaterialCategory.MEAT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cooked_meat',
      itemName: 'Cooked Meat',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 15,
    difficulty: 2,
    xpGain: 5,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'food', 'basic']
  },
  {
    id: 'cook_bone_broth',
    name: 'Bone Broth',
    description: 'Nutritious broth made from animal bones. Restores health slowly.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'bone',
        materialName: 'Bone',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
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
      itemId: 'bone_broth',
      itemName: 'Bone Broth',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 4,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'soup', 'healing']
  },
  {
    id: 'cook_hand_rolled_cigars',
    name: 'Hand-Rolled Cigars',
    description: 'Fine cigars hand-rolled from fresh tobacco. A frontier luxury.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tobacco',
        materialName: 'Tobacco',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'hand_rolled_cigars',
      itemName: 'Hand-Rolled Cigars',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 5,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'tobacco', 'luxury']
  },
  {
    id: 'cook_seasoned_meat',
    name: 'Seasoned Meat',
    description: 'Meat cooked with herbs for better flavor and health benefits.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'meat',
        materialName: 'Meat',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'herbs',
        materialName: 'Herbs',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'seasoned_meat',
      itemName: 'Seasoned Meat',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 25,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'meat', 'seasoned']
  },
  {
    id: 'cook_wood_chips',
    name: 'Prepare Smoking Wood Chips',
    description: 'Chop and season mesquite wood into smoking chips for BBQ.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'mesquite_wood',
        materialName: 'Mesquite Wood',
        category: MaterialCategory.WOOD,
        quantity: 2
      }
    ],
    output: {
      itemId: 'wood_chips',
      itemName: 'Mesquite Wood Chips',
      baseQuantity: 4,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'smoking', 'preparation']
  },

  // -------------------------------------------------------------------------
  // TRADITIONAL NOVICE RECIPES (Level 1-15)
  // -------------------------------------------------------------------------
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
  },

  // ============================================================================
  // NEW RECIPES - EXPANSION (35 Additional Recipes)
  // ============================================================================

  // -------------------------------------------------------------------------
  // NOVICE TIER EXPANSION (Level 1-15) - 5 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_trail_rations',
    name: 'Trail Rations',
    description: 'Simple packed rations for long journeys. Keeps for weeks without spoiling.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'hardtack',
        materialName: 'Hardtack Biscuits',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'beef_jerky',
        materialName: 'Beef Jerky',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'dried_fruit',
        materialName: 'Dried Fruit',
        category: MaterialCategory.VEGETABLE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'trail_rations',
      itemName: 'Trail Rations',
      baseQuantity: 4,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 4,
    xpGain: 7,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'travel', 'preserved']
  },
  {
    id: 'cook_venison_jerky',
    name: 'Venison Jerky',
    description: 'Dried deer meat seasoned with wild herbs. A hunter\'s favorite trail snack.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'venison',
        materialName: 'Venison',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'herbs',
        materialName: 'Wild Herbs',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'venison_jerky',
      itemName: 'Venison Jerky',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 50,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'meat', 'preserved', 'wild']
  },
  {
    id: 'cook_pan_fried_fish',
    name: 'Pan-Fried Fish',
    description: 'Fresh river fish cooked in a cast iron pan. Simple but satisfying.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'fish',
        materialName: 'Fresh Fish',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'butter',
        materialName: 'Butter',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'pan_fried_fish',
      itemName: 'Pan-Fried Fish',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 25,
    difficulty: 7,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'fish', 'quick']
  },
  {
    id: 'cook_potato_hash',
    name: 'Potato Hash',
    description: 'Diced potatoes fried with onions. A filling breakfast staple on the frontier.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'potato',
        materialName: 'Potato',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'wild_onion',
        materialName: 'Wild Onion',
        category: MaterialCategory.VEGETABLE,
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
      itemId: 'potato_hash',
      itemName: 'Potato Hash',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 10,
    xpGain: 14,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'vegetable', 'breakfast']
  },
  {
    id: 'cook_buffalo_jerky',
    name: 'Buffalo Jerky',
    description: 'Thick strips of dried buffalo meat. Provides extra stamina on long rides.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 14,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'buffalo_meat',
        materialName: 'Buffalo Meat',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'pepper',
        materialName: 'Black Pepper',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'buffalo_jerky',
      itemName: 'Buffalo Jerky',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 55,
    difficulty: 12,
    xpGain: 16,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'meat', 'preserved', 'stamina']
  },

  // -------------------------------------------------------------------------
  // APPRENTICE TIER EXPANSION (Level 16-30) - 6 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_rabbit_stew',
    name: 'Rabbit Stew',
    description: 'Tender rabbit cooked slow with root vegetables. A frontier comfort food.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'rabbit_meat',
        materialName: 'Rabbit Meat',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'potato',
        materialName: 'Potato',
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
      itemId: 'rabbit_stew',
      itemName: 'Rabbit Stew',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'stew', 'wild']
  },
  {
    id: 'cook_buttermilk_biscuits',
    name: 'Buttermilk Biscuits',
    description: 'Fluffy biscuits that melt in your mouth. Perfect with gravy or honey.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'flour',
        materialName: 'Flour',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'buttermilk',
        materialName: 'Buttermilk',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'butter',
        materialName: 'Butter',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'buttermilk_biscuits',
      itemName: 'Buttermilk Biscuits',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 60,
    difficulty: 20,
    xpGain: 30,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'bread', 'comfort']
  },
  {
    id: 'cook_cowboy_coffee',
    name: 'Cowboy Coffee',
    description: 'Extra strong coffee boiled in a pot over campfire. Keeps you sharp for night watch.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 21,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'coffee_beans',
        materialName: 'Coffee Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'sugar',
        materialName: 'Sugar',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'cowboy_coffee',
      itemName: 'Cowboy Coffee',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 25,
    difficulty: 18,
    xpGain: 28,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'drink', 'energy', 'alertness']
  },
  {
    id: 'cook_chuck_wagon_beans',
    name: 'Chuck Wagon Beans',
    description: 'Hearty beans cooked with bacon and molasses. The classic cattle drive meal.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 23,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'beans',
        materialName: 'Dried Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'bacon',
        materialName: 'Bacon',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'molasses',
        materialName: 'Molasses',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'wild_onion',
        materialName: 'Wild Onion',
        category: MaterialCategory.VEGETABLE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'chuck_wagon_beans',
      itemName: 'Chuck Wagon Beans',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'trail', 'filling']
  },
  {
    id: 'cook_venison_stew',
    name: 'Venison Stew',
    description: 'Rich stew made with wild deer meat and foraged vegetables.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 26,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'venison',
        materialName: 'Venison',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'potato',
        materialName: 'Potato',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'wild_onion',
        materialName: 'Wild Onion',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'herbs',
        materialName: 'Wild Herbs',
        category: MaterialCategory.SPICE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'venison_stew',
      itemName: 'Venison Stew',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 130,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'stew', 'wild', 'hearty']
  },
  {
    id: 'cook_frontier_hotcakes',
    name: 'Frontier Hotcakes',
    description: 'Fluffy pancakes served with butter and honey. A breakfast worth waking up for.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 29,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'flour',
        materialName: 'Flour',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'eggs',
        materialName: 'Eggs',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'buttermilk',
        materialName: 'Buttermilk',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'honey',
        materialName: 'Honey',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'frontier_hotcakes',
      itemName: 'Frontier Hotcakes',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 26,
    xpGain: 42,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'breakfast', 'sweet']
  },

  // -------------------------------------------------------------------------
  // JOURNEYMAN TIER EXPANSION (Level 31-50) - 7 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_smoked_trout',
    name: 'Smoked Trout',
    description: 'Delicate trout smoked over hickory chips. A refined frontier delicacy.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 32,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.SMOKER,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'trout',
        materialName: 'Fresh Trout',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'wood_chips',
        materialName: 'Hickory Wood Chips',
        category: MaterialCategory.WOOD,
        quantity: 2
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 1
      },
      {
        materialId: 'herbs',
        materialName: 'Fresh Herbs',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'smoked_trout',
      itemName: 'Smoked Trout',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 40,
    xpGain: 70,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'fish', 'smoked']
  },
  {
    id: 'cook_cattle_drive_feast',
    name: 'Cattle Drive Feast',
    description: 'A hearty spread for hungry cowboys after a long drive. Feeds the whole crew.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 36,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'beef_chunks',
        materialName: 'Beef Chunks',
        category: MaterialCategory.MEAT,
        quantity: 5
      },
      {
        materialId: 'beans',
        materialName: 'Dried Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'cornbread',
        materialName: 'Golden Cornbread',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'coffee_beans',
        materialName: 'Coffee Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'cattle_drive_feast',
      itemName: 'Cattle Drive Feast',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 44,
    xpGain: 85,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'feast', 'trail']
  },
  {
    id: 'cook_pemmican',
    name: 'Pemmican',
    description: 'Traditional preserved meat mixed with fat and berries. Lasts for months.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 39,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'venison_jerky',
        materialName: 'Venison Jerky',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'animal_fat',
        materialName: 'Animal Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'dried_berries',
        materialName: 'Dried Berries',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'pemmican',
      itemName: 'Pemmican',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 46,
    xpGain: 82,
    learningSource: RecipeSource.VENDOR,
    learningCost: 300,
    category: 'consumable',
    tags: ['journeyman', 'preserved', 'survival']
  },
  {
    id: 'cook_salted_ham',
    name: 'Salt-Cured Ham',
    description: 'Whole ham cured with salt and spices. A prized possession on the frontier.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 41,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'pork_leg',
        materialName: 'Pork Leg',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 4
      },
      {
        materialId: 'sugar',
        materialName: 'Brown Sugar',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'pepper',
        materialName: 'Black Pepper',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'salted_ham',
      itemName: 'Salt-Cured Ham',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 48,
    xpGain: 88,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'meat', 'preserved', 'cured']
  },
  {
    id: 'cook_frontier_hospitality_spread',
    name: 'Frontier Hospitality Spread',
    description: 'A welcoming spread of meats, cheeses, and bread. Shows proper frontier courtesy.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 44,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'salted_ham',
        materialName: 'Salt-Cured Ham',
        category: MaterialCategory.MEAT,
        quantity: 1
      },
      {
        materialId: 'cheese',
        materialName: 'Aged Cheese',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'sourdough_bread',
        materialName: 'Sourdough Bread',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'pickled_vegetables',
        materialName: 'Pickled Vegetables',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'hospitality_spread',
      itemName: 'Frontier Hospitality Spread',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 50,
    xpGain: 92,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['journeyman', 'hospitality', 'social'],
    specialNotes: '+15 Charisma for 2 hours'
  },
  {
    id: 'cook_smoked_bacon',
    name: 'Smoked Bacon',
    description: 'Thick-cut bacon smoked to perfection. Worth its weight in gold on the trail.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 47,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.SMOKER,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'pork_belly',
        materialName: 'Pork Belly',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'wood_chips',
        materialName: 'Apple Wood Chips',
        category: MaterialCategory.WOOD,
        quantity: 2
      },
      {
        materialId: 'maple_syrup',
        materialName: 'Maple Syrup',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'smoked_bacon',
      itemName: 'Smoked Bacon',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 52,
    xpGain: 95,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'meat', 'smoked', 'premium']
  },
  {
    id: 'cook_miners_lunch_pail',
    name: "Miner's Lunch Pail",
    description: 'Complete packed lunch for hard-working miners. Hearty and sustaining.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 49,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'smoked_bacon',
        materialName: 'Smoked Bacon',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'hardtack',
        materialName: 'Hardtack Biscuits',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'cheese',
        materialName: 'Cheese',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'apple',
        materialName: 'Apple',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'miners_lunch_pail',
      itemName: "Miner's Lunch Pail",
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 60,
    difficulty: 45,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'packed', 'stamina'],
    specialNotes: '+10 Stamina regeneration for 4 hours'
  },

  // -------------------------------------------------------------------------
  // EXPERT TIER EXPANSION (Level 51-70) - 7 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_governors_roast',
    name: "Governor's Roast",
    description: 'Prime roast prepared in the style of territorial governors. Impressive and delicious.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 52,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'prime_beef',
        materialName: 'Prime Beef Roast',
        category: MaterialCategory.MEAT,
        quantity: 5
      },
      {
        materialId: 'garlic',
        materialName: 'Garlic',
        category: MaterialCategory.SPICE,
        quantity: 3
      },
      {
        materialId: 'herbs',
        materialName: 'Fresh Rosemary',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'red_wine',
        materialName: 'Red Wine',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'governors_roast',
      itemName: "Governor's Roast",
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 58,
    xpGain: 115,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['expert', 'gourmet', 'prestige'],
    specialNotes: '+20 Charisma, +10 Luck for 3 hours'
  },
  {
    id: 'cook_sharpshooter_stew',
    name: 'Sharpshooter Stew',
    description: 'A secret recipe said to steady the hand and sharpen the eye.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 54,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'venison',
        materialName: 'Venison',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'carrots',
        materialName: 'Carrots',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'eye_bright_herb',
        materialName: 'Eye-Bright Herb',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'steady_root',
        materialName: 'Steady Root',
        category: MaterialCategory.HERB,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sharpshooter_stew',
      itemName: 'Sharpshooter Stew',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.VENDOR,
    learningCost: 500,
    category: 'consumable',
    tags: ['expert', 'combat', 'accuracy'],
    specialNotes: '+25 Accuracy, +15 Perception for 2 hours'
  },
  {
    id: 'cook_outlaws_courage',
    name: "Outlaw's Courage",
    description: 'Strong drink mixed with stimulating herbs. Gives courage in dangerous situations.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 57,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'premium_bourbon',
        materialName: 'Premium Bourbon',
        category: MaterialCategory.ALCOHOL,
        quantity: 2
      },
      {
        materialId: 'courage_root',
        materialName: 'Courage Root',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'honey',
        materialName: 'Wild Honey',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'outlaws_courage',
      itemName: "Outlaw's Courage",
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 62,
    xpGain: 125,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'consumable',
    tags: ['expert', 'alcohol', 'combat'],
    specialNotes: '+30 Bravery, immunity to fear effects for 1 hour'
  },
  {
    id: 'cook_trail_boss_special',
    name: 'Trail Boss Special',
    description: 'Complete meal fit for a trail boss. Commands respect and provides leadership bonuses.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 60,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'buffalo_ribeye',
        materialName: 'Buffalo Ribeye',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'chuck_wagon_beans',
        materialName: 'Chuck Wagon Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'cornbread',
        materialName: 'Golden Cornbread',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'cowboy_coffee',
        materialName: 'Cowboy Coffee',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'trail_boss_special',
      itemName: 'Trail Boss Special',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 64,
    xpGain: 135,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['expert', 'leadership', 'complete'],
    specialNotes: '+20 to all Leadership skills for 4 hours'
  },
  {
    id: 'cook_iron_gut_tonic',
    name: 'Iron Gut Tonic',
    description: 'Medicinal brew that hardens the constitution against poisons and illness.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 64,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'frontier_whiskey',
        materialName: 'Frontier Whiskey',
        category: MaterialCategory.ALCOHOL,
        quantity: 2
      },
      {
        materialId: 'charcoal',
        materialName: 'Activated Charcoal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'ginger_root',
        materialName: 'Ginger Root',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'mint',
        materialName: 'Wild Mint',
        category: MaterialCategory.HERB,
        quantity: 1
      }
    ],
    output: {
      itemId: 'iron_gut_tonic',
      itemName: 'Iron Gut Tonic',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 66,
    xpGain: 140,
    learningSource: RecipeSource.VENDOR,
    learningCost: 600,
    category: 'consumable',
    tags: ['expert', 'tonic', 'resistance'],
    specialNotes: '+50% Poison Resistance, +30% Disease Resistance for 3 hours'
  },
  {
    id: 'cook_desperados_delight',
    name: "Desperado's Delight",
    description: 'A legendary meal combining the best of frontier cooking. Sought after by outlaws and lawmen alike.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 67,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'bbq_brisket',
        materialName: 'BBQ Brisket',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'chili_con_carne',
        materialName: 'Chili Con Carne',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'cornbread',
        materialName: 'Golden Cornbread',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      },
      {
        materialId: 'apple_pie',
        materialName: 'Apple Pie',
        category: MaterialCategory.VEGETABLE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'desperados_delight',
      itemName: "Desperado's Delight",
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 70,
    xpGain: 160,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['expert', 'legendary', 'complete'],
    specialNotes: '+25 to all combat stats for 4 hours'
  },
  {
    id: 'cook_stamina_jerky',
    name: 'Endurance Jerky',
    description: 'Special jerky infused with energy-boosting herbs. Keeps you going when others falter.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 69,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'buffalo_meat',
        materialName: 'Buffalo Meat',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'ginseng',
        materialName: 'Wild Ginseng',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'salt',
        materialName: 'Rock Salt',
        category: MaterialCategory.SPICE,
        quantity: 2
      },
      {
        materialId: 'cayenne',
        materialName: 'Cayenne Pepper',
        category: MaterialCategory.SPICE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'endurance_jerky',
      itemName: 'Endurance Jerky',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 68,
    xpGain: 155,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['expert', 'preserved', 'stamina'],
    specialNotes: '+40 Max Stamina, +25% Stamina regeneration for 6 hours'
  },

  // -------------------------------------------------------------------------
  // MASTER TIER EXPANSION (Level 71-90) - 5 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_spirit_offering',
    name: 'Spirit Offering',
    description: 'Sacred meal prepared according to ancient traditions. Attracts benevolent spirits.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 73,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'white_buffalo_meat',
        materialName: 'White Buffalo Meat',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'sacred_corn',
        materialName: 'Sacred Corn',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'spirit_water',
        materialName: 'Spirit Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'sage',
        materialName: 'Sacred Sage',
        category: MaterialCategory.HERB,
        quantity: 3
      }
    ],
    output: {
      itemId: 'spirit_offering',
      itemName: 'Spirit Offering',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 78,
    xpGain: 200,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['master', 'spiritual', 'sacred'],
    specialNotes: 'Can be offered to spirits for blessings. If consumed: +20 Spirit, +15 Luck'
  },
  {
    id: 'cook_texas_pit_master',
    name: 'Texas Pit Master Feast',
    description: 'Ultimate BBQ spread with multiple smoked meats. The pride of Texas cooking.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 77,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.SMOKER,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'bbq_brisket',
        materialName: 'BBQ Brisket',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'smoked_bacon',
        materialName: 'Smoked Bacon',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'smoked_sausage',
        materialName: 'Smoked Sausage',
        category: MaterialCategory.MEAT,
        quantity: 4
      },
      {
        materialId: 'bbq_sauce',
        materialName: 'Secret BBQ Sauce',
        category: MaterialCategory.SPICE,
        quantity: 3
      },
      {
        materialId: 'wood_chips',
        materialName: 'Pecan Wood Chips',
        category: MaterialCategory.WOOD,
        quantity: 4
      }
    ],
    output: {
      itemId: 'texas_pit_master',
      itemName: 'Texas Pit Master Feast',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 82,
    xpGain: 240,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['master', 'bbq', 'feast', 'regional'],
    specialNotes: 'Feeds 8. All receive +30 Strength, +20 Constitution for 4 hours'
  },
  {
    id: 'cook_new_orleans_gumbo',
    name: 'New Orleans Gumbo',
    description: 'Rich Creole gumbo with secrets from the bayou. Whispered to have mystical properties.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 81,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'crawfish',
        materialName: 'Crawfish',
        category: MaterialCategory.MEAT,
        quantity: 5
      },
      {
        materialId: 'andouille_sausage',
        materialName: 'Andouille Sausage',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'okra',
        materialName: 'Okra',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'cajun_spices',
        materialName: 'Cajun Spice Blend',
        category: MaterialCategory.SPICE,
        quantity: 3
      },
      {
        materialId: 'file_powder',
        materialName: 'File Powder',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'new_orleans_gumbo',
      itemName: 'New Orleans Gumbo',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 86,
    xpGain: 260,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.02,
    category: 'consumable',
    tags: ['master', 'regional', 'mystical'],
    specialNotes: '+25 Spirit, +20 Charisma, chance to receive voodoo blessing'
  },
  {
    id: 'cook_prospectors_gold',
    name: "Prospector's Gold",
    description: 'Legendary meal that brings good fortune. Said to help prospectors find gold.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 84,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'golden_trout',
        materialName: 'Golden Trout',
        category: MaterialCategory.MEAT,
        quantity: 3
      },
      {
        materialId: 'saffron',
        materialName: 'Saffron',
        category: MaterialCategory.SPICE,
        quantity: 4
      },
      {
        materialId: 'gold_dust',
        materialName: 'Edible Gold Dust',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'lucky_clover',
        materialName: 'Four-Leaf Clover',
        category: MaterialCategory.HERB,
        quantity: 4
      }
    ],
    output: {
      itemId: 'prospectors_gold',
      itemName: "Prospector's Gold",
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 88,
    xpGain: 275,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'consumable',
    tags: ['master', 'legendary', 'luck'],
    specialNotes: '+50 Luck, +25% gold find, +15% rare item find for 6 hours'
  },
  {
    id: 'cook_gunslingers_focus',
    name: "Gunslinger's Focus",
    description: 'Concentrated meal that sharpens reflexes to supernatural levels.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 88,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'hawk_meat',
        materialName: 'Hawk Meat',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'rattlesnake_meat',
        materialName: 'Rattlesnake Meat',
        category: MaterialCategory.MEAT,
        quantity: 2
      },
      {
        materialId: 'peyote_essence',
        materialName: 'Peyote Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'cowboy_coffee',
        materialName: 'Triple-Strong Coffee',
        category: MaterialCategory.VEGETABLE,
        quantity: 3
      }
    ],
    output: {
      itemId: 'gunslingers_focus',
      itemName: "Gunslinger's Focus",
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 90,
    xpGain: 290,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['master', 'combat', 'legendary'],
    specialNotes: '+40 Accuracy, +35 Reflex, -20% draw time for 2 hours'
  },

  // -------------------------------------------------------------------------
  // GRANDMASTER TIER EXPANSION (Level 91-100) - 5 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'cook_ghost_rider_provisions',
    name: 'Ghost Rider Provisions',
    description: 'Supernatural rations that sustain the dead. Allows communication with spirits.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'ghost_meat',
        materialName: 'Phantom Meat',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'grave_dirt',
        materialName: 'Consecrated Grave Dirt',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'spirit_water',
        materialName: 'Spirit Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'nightshade',
        materialName: 'Nightshade',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'ghost_rider_provisions',
      itemName: 'Ghost Rider Provisions',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 94,
    xpGain: 450,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['grandmaster', 'supernatural', 'spirit'],
    specialNotes: 'Can speak with ghosts for 1 hour. +30 Spirit, ethereal form for 10 minutes'
  },
  {
    id: 'cook_cursed_provisions',
    name: 'Cursed Provisions',
    description: 'Food touched by darkness. Grants terrible power at a terrible price.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'corrupted_meat',
        materialName: 'Corrupted Meat',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'blood_of_the_damned',
        materialName: 'Blood of the Damned',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'brimstone',
        materialName: 'Brimstone',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'wormwood',
        materialName: 'Wormwood',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'cursed_provisions',
      itemName: 'Cursed Provisions',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 720,
    difficulty: 96,
    xpGain: 500,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'consumable',
    tags: ['grandmaster', 'cursed', 'dark'],
    specialNotes: '+100 to all combat stats, but -50 HP per minute for 30 minutes. Cannot be healed during effect.'
  },
  {
    id: 'cook_wendigo_feast',
    name: 'Wendigo Feast',
    description: 'Forbidden meal that awakens primal hunger. Grants monstrous strength.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 96,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.STOVE,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'wendigo_heart',
        materialName: 'Wendigo Heart',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'frost_essence',
        materialName: 'Eternal Frost Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'hunger_herb',
        materialName: 'Hunger Herb',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'bone_marrow',
        materialName: 'Ancient Bone Marrow',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      }
    ],
    output: {
      itemId: 'wendigo_feast',
      itemName: 'Wendigo Feast',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 900,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.01,
    category: 'consumable',
    tags: ['grandmaster', 'cursed', 'transformation'],
    specialNotes: 'Transform into Wendigo form for 10 minutes. +200 Strength, +150 Speed, but lose control'
  },
  {
    id: 'cook_heavenly_manna',
    name: 'Heavenly Manna',
    description: 'Divine food that fell from the heavens. Purifies body and soul completely.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'angel_feather',
        materialName: 'Angel Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'celestial_grain',
        materialName: 'Celestial Grain',
        category: MaterialCategory.VEGETABLE,
        quantity: 7
      },
      {
        materialId: 'divine_honey',
        materialName: 'Divine Honey',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'heavenly_manna',
      itemName: 'Heavenly Manna',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1080,
    difficulty: 99,
    xpGain: 700,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['grandmaster', 'divine', 'purification'],
    specialNotes: 'Removes ALL curses, debuffs, and corruption. Full heal. +50 to all stats for 24 hours'
  },
  {
    id: 'cook_immortal_banquet',
    name: 'Immortal Banquet',
    description: 'The ultimate feast that transcends mortality. Those who partake are forever changed.',
    professionId: ProfessionId.COOKING,
    requirements: {
      professionId: ProfessionId.COOKING,
      minLevel: 100,
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
        quantity: 3
      },
      {
        materialId: 'ambrosia',
        materialName: 'Ambrosia',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'elixir_of_life',
        materialName: 'Elixir of Life',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'stardust',
        materialName: 'Captured Stardust',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'essence_of_eternity',
        materialName: 'Essence of Eternity',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'immortal_banquet',
      itemName: 'Immortal Banquet',
      baseQuantity: 12,
      qualityAffectsStats: true
    },
    baseCraftTime: 2400,
    difficulty: 100,
    xpGain: 1000,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'immortal', 'unique'],
    specialNotes: 'Feeds 12. All receive: +100 all stats, death immunity (1 use), permanently +10 max HP'
  }
];

export default cookingRecipes;
