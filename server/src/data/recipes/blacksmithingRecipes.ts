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
  CraftingFacilityType
} from '@desperados/shared';

export const blacksmithingRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================
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
  }
];

export default blacksmithingRecipes;
