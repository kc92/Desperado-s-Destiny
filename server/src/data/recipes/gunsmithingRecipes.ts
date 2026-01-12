/**
 * Gunsmithing Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Masters of firearms - craft ammunition, modifications, and legendary weapons
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType
} from '@desperados/shared';

export const gunsmithingRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================
  {
    id: 'gun_basic_bullets',
    name: 'Basic Bullets',
    description: 'Standard lead bullets. Nothing fancy, but they get the job done.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.POWDER_PRESS,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'basic_bullets',
      itemName: 'Basic Bullets',
      baseQuantity: 20,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['novice', 'ammunition', 'basic']
  },
  {
    id: 'gun_oil',
    name: 'Gun Oil',
    description: 'Quality oil for cleaning and maintaining firearms.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'mineral_oil',
        materialName: 'Mineral Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'solvent',
        materialName: 'Solvent',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'gun_oil',
      itemName: 'Gun Oil',
      baseQuantity: 5,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'maintenance', 'oil']
  },
  {
    id: 'gun_simple_grip',
    name: 'Simple Wooden Grip',
    description: 'Basic wooden grip replacement for revolvers.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'hardwood',
        materialName: 'Hardwood',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'grip_screws',
        materialName: 'Grip Screws',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'simple_grip',
      itemName: 'Simple Wooden Grip',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['novice', 'modification', 'grip']
  },
  {
    id: 'gun_shotgun_shells',
    name: 'Shotgun Shells',
    description: 'Standard buckshot shells for shotguns.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 1
      },
      {
        materialId: 'buckshot',
        materialName: 'Buckshot',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'shotgun_shells',
      itemName: 'Shotgun Shells',
      baseQuantity: 10,
      qualityAffectsStats: false
    },
    baseCraftTime: 60,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['novice', 'shotgun', 'ammunition']
  },
  {
    id: 'gun_cleaning_kit',
    name: 'Gun Cleaning Kit',
    description: 'Complete kit with brushes, rods, and oil for firearm maintenance.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'brass_brush',
        materialName: 'Brass Brush',
        category: MaterialCategory.GUN_PART,
        quantity: 3
      },
      {
        materialId: 'cleaning_rod',
        materialName: 'Cleaning Rod',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'gun_oil',
        materialName: 'Gun Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'gun_cleaning_kit',
      itemName: 'Gun Cleaning Kit',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 90,
    difficulty: 15,
    xpGain: 25,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'maintenance', 'kit']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'gun_hollow_points',
    name: 'Hollow Point Bullets',
    description: 'Bullets designed to expand on impact. Increased stopping power.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      },
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hollow_point_bullets',
      itemName: 'Hollow Point Bullets',
      baseQuantity: 15,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['apprentice', 'ammunition', 'damage']
  },
  {
    id: 'gun_scope_mount',
    name: 'Rifle Scope Mount',
    description: 'Mount for attaching scopes to rifles. Improves accuracy.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'mounting_screws',
        materialName: 'Mounting Screws',
        category: MaterialCategory.GUN_PART,
        quantity: 4
      },
      {
        materialId: 'lens',
        materialName: 'Glass Lens',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'scope_mount',
      itemName: 'Rifle Scope Mount',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['apprentice', 'modification', 'accuracy']
  },
  {
    id: 'gun_extended_magazine',
    name: 'Extended Magazine',
    description: 'Larger capacity magazine for pistols. Hold more rounds.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_sheet',
        materialName: 'Steel Sheet',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'magazine_spring',
        materialName: 'Magazine Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'extended_magazine',
      itemName: 'Extended Magazine',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['apprentice', 'modification', 'capacity']
  },
  {
    id: 'gun_rifle_ammo',
    name: 'Rifle Ammunition',
    description: 'High-powered rifle rounds for long-range engagements.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'copper_jacket',
        materialName: 'Copper Jacket',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'rifle_ammo',
      itemName: 'Rifle Ammunition',
      baseQuantity: 15,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['apprentice', 'rifle', 'ammunition']
  },
  {
    id: 'gun_trigger_job',
    name: 'Trigger Job Kit',
    description: 'Components for smoothing trigger pull. Improves firing speed.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'polishing_compound',
        materialName: 'Polishing Compound',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'trigger_spring',
        materialName: 'Lightened Trigger Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'precision_tools',
        materialName: 'Precision Tools',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'trigger_job_kit',
      itemName: 'Trigger Job Kit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 35,
    xpGain: 60,
    learningSource: RecipeSource.VENDOR,
    learningCost: 250,
    category: 'weapon',
    tags: ['apprentice', 'modification', 'trigger']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'gun_rifled_barrel',
    name: 'Rifled Barrel',
    description: 'Precision-rifled barrel that dramatically improves accuracy.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'High-Grade Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'rifling_tools',
        materialName: 'Rifling Tools',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'rifled_barrel',
      itemName: 'Rifled Barrel',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'barrel', 'accuracy']
  },
  {
    id: 'gun_hair_trigger',
    name: 'Hair Trigger Mechanism',
    description: 'Ultra-sensitive trigger for lightning-fast shooting.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'precision_spring',
        materialName: 'Precision Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      },
      {
        materialId: 'titanium_parts',
        materialName: 'Titanium Parts',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'jeweled_bearing',
        materialName: 'Jeweled Bearing',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hair_trigger',
      itemName: 'Hair Trigger Mechanism',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.06,
    category: 'weapon',
    tags: ['journeyman', 'trigger', 'speed']
  },
  {
    id: 'gun_incendiary_rounds',
    name: 'Incendiary Rounds',
    description: 'Bullets that ignite on impact. Sets targets on fire.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 25
      }
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'phosphorus',
        materialName: 'White Phosphorus',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'magnesium',
        materialName: 'Magnesium',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'incendiary_rounds',
      itemName: 'Incendiary Rounds',
      baseQuantity: 10,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 50,
    xpGain: 95,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['journeyman', 'special', 'fire']
  },
  {
    id: 'gun_sniper_scope',
    name: 'Sniper Scope',
    description: 'High-magnification scope for extreme long-range shooting.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'optical_glass',
        materialName: 'Optical Glass',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'brass_housing',
        materialName: 'Brass Housing',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 3
      },
      {
        materialId: 'adjustment_dials',
        materialName: 'Precision Adjustment Dials',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'sniper_scope',
      itemName: 'Sniper Scope',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 52,
    xpGain: 100,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'scope', 'precision']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'gun_custom_grip',
    name: 'Custom Carved Grip',
    description: 'Masterfully carved grip from exotic materials. Improves control.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'ebony_wood',
        materialName: 'Ebony Wood',
        category: MaterialCategory.WOOD,
        quantity: 2
      },
      {
        materialId: 'mother_of_pearl',
        materialName: 'Mother of Pearl',
        category: MaterialCategory.ACCESSORY,
        quantity: 4
      },
      {
        materialId: 'ivory_inlay',
        materialName: 'Ivory Inlay',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'custom_grip',
      itemName: 'Custom Carved Grip',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 65,
    xpGain: 130,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['expert', 'grip', 'exotic']
  },
  {
    id: 'gun_silencer',
    name: 'Suppressor',
    description: 'Reduces gunshot noise to a whisper. Perfect for stealth kills.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 55,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'steel_tube',
        materialName: 'Steel Tube',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      },
      {
        materialId: 'baffles',
        materialName: 'Baffles',
        category: MaterialCategory.GUN_PART,
        quantity: 8
      },
      {
        materialId: 'sound_dampening',
        materialName: 'Sound Dampening Material',
        category: MaterialCategory.FABRIC,
        quantity: 4
      }
    ],
    output: {
      itemId: 'suppressor',
      itemName: 'Suppressor',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 68,
    xpGain: 140,
    learningSource: RecipeSource.VENDOR,
    learningCost: 800,
    category: 'weapon',
    tags: ['expert', 'stealth', 'suppressor'],
    specialNotes: 'Reduces detection range by 80%'
  },
  {
    id: 'gun_explosive_rounds',
    name: 'Explosive Rounds',
    description: 'Bullets that explode on impact. Devastating but expensive.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 40
      }
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'nitroglycerin',
        materialName: 'Nitroglycerin',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'impact_detonator',
        materialName: 'Impact Detonator',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'explosive_rounds',
      itemName: 'Explosive Rounds',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 70,
    xpGain: 150,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'ammo',
    tags: ['expert', 'explosive', 'special']
  },
  {
    id: 'gun_auto_loader',
    name: 'Auto-Loader Mechanism',
    description: 'Converts single-action to double-action. Faster firing rate.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'precision_gears',
        materialName: 'Precision Gears',
        category: MaterialCategory.GUN_PART,
        quantity: 6
      },
      {
        materialId: 'spring_assembly',
        materialName: 'Spring Assembly',
        category: MaterialCategory.GUN_PART,
        quantity: 3
      },
      {
        materialId: 'titanium_parts',
        materialName: 'Titanium Parts',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      }
    ],
    output: {
      itemId: 'auto_loader',
      itemName: 'Auto-Loader Mechanism',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 72,
    xpGain: 160,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'modification', 'automatic']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'gun_perfect_balance',
    name: 'Perfect Balance Modification',
    description: 'Expertly balanced components that eliminate recoil.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.TEST_RANGE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'counterweight',
        materialName: 'Precision Counterweight',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      },
      {
        materialId: 'shock_absorber',
        materialName: 'Recoil Shock Absorber',
        category: MaterialCategory.GUN_PART,
        quantity: 3
      },
      {
        materialId: 'tungsten_weight',
        materialName: 'Tungsten Weight',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'perfect_balance_mod',
      itemName: 'Perfect Balance Modification',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['master', 'modification', 'balance'],
    specialNotes: 'Eliminates recoil completely'
  },
  {
    id: 'gun_lightning_draw',
    name: 'Lightning Draw Mechanism',
    description: 'Revolutionary mechanism that enables impossibly fast draws.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'quicksilver',
        materialName: 'Quicksilver',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'lightning_crystal',
        materialName: 'Lightning Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'masterwork_spring',
        materialName: 'Masterwork Spring',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'lightning_draw_mech',
      itemName: 'Lightning Draw Mechanism',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['master', 'speed', 'draw']
  },
  {
    id: 'gun_armor_piercing',
    name: 'Armor-Piercing Rounds',
    description: 'Hardened tungsten core bullets that punch through armor.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'tungsten_core',
        materialName: 'Tungsten Core',
        category: MaterialCategory.REFINED_METAL,
        quantity: 5
      },
      {
        materialId: 'hardened_steel',
        materialName: 'Hardened Steel Jacket',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 4
      },
      {
        materialId: 'high_powder',
        materialName: 'High-Pressure Powder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'armor_piercing_rounds',
      itemName: 'Armor-Piercing Rounds',
      baseQuantity: 10,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.TRAINER,
    category: 'ammo',
    tags: ['master', 'armor-piercing', 'special']
  },
  {
    id: 'gun_gatling_conversion',
    name: 'Gatling Conversion Kit',
    description: 'Converts a rifle into a hand-cranked rapid-fire weapon.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER,
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 60
      }
    },
    materials: [
      {
        materialId: 'rotating_barrel',
        materialName: 'Rotating Barrel Assembly',
        category: MaterialCategory.GUN_PART,
        quantity: 6
      },
      {
        materialId: 'crank_mechanism',
        materialName: 'Hand Crank Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'steel_frame',
        materialName: 'Reinforced Steel Frame',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      }
    ],
    output: {
      itemId: 'gatling_conversion',
      itemName: 'Gatling Conversion Kit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 90,
    xpGain: 320,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['master', 'conversion', 'rapid-fire']
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'gun_devils_own',
    name: "The Devil's Own",
    description: 'Legendary gun modification said to be cursed. Grants supernatural accuracy.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.TEST_RANGE,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 75
      }
    },
    materials: [
      {
        materialId: 'demon_steel',
        materialName: 'Demon-Forged Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 15
      },
      {
        materialId: 'soul_crystal',
        materialName: 'Soul Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'hellfire_essence',
        materialName: 'Essence of Hellfire',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'cursed_silver',
        materialName: 'Cursed Silver',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      }
    ],
    output: {
      itemId: 'devils_own',
      itemName: "The Devil's Own",
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'cursed', 'unique'],
    specialNotes: 'Never misses. Bullets seek targets. Soul-bound to crafter.'
  },
  {
    id: 'gun_judgement_rounds',
    name: 'Rounds of Judgement',
    description: 'Blessed ammunition that deals massive damage to the wicked.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 70
      }
    },
    materials: [
      {
        materialId: 'blessed_silver',
        materialName: 'Blessed Silver',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 10
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'angel_feather',
        materialName: 'Angel Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'judgement_rounds',
      itemName: 'Rounds of Judgement',
      baseQuantity: 6,
      qualityAffectsStats: true
    },
    baseCraftTime: 720,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'ammo',
    tags: ['grandmaster', 'legendary', 'holy'],
    specialNotes: 'Deals 500% damage to outlaws and supernatural evil'
  },
  {
    id: 'gun_infinity_chamber',
    name: 'Infinity Chamber',
    description: 'A cylinder that never needs reloading. Generates ammunition from the void.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'void_metal',
        materialName: 'Void Metal',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      },
      {
        materialId: 'infinity_stone',
        materialName: 'Infinity Stone',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'time_crystal',
        materialName: 'Time Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'infinity_chamber',
      itemName: 'Infinity Chamber',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1200,
    difficulty: 100,
    xpGain: 700,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'infinite', 'unique'],
    specialNotes: 'Never runs out of ammunition. Auto-generates perfect rounds.'
  },
  {
    id: 'gun_destiny_revolver',
    name: 'Destiny Revolver',
    description: 'The ultimate firearm. Each shot changes fate itself.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 90
      }
    },
    materials: [
      {
        materialId: 'destiny_metal',
        materialName: 'Metal of Destiny',
        category: MaterialCategory.REFINED_METAL,
        quantity: 25
      },
      {
        materialId: 'fate_crystal',
        materialName: 'Crystal of Fate',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 6
      },
      {
        materialId: 'god_essence',
        materialName: 'Essence of the Divine',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'destiny_revolver',
      itemName: 'Destiny Revolver',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 1000,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'legendary', 'destiny', 'unique'],
    specialNotes: 'Only one exists per server. Can rewrite destiny itself. All stats +100.'
  },

  // ============================================================================
  // NEW RECIPES - NOVICE TIER (1-15) - 5 additional recipes
  // ============================================================================
  {
    id: 'gs_paper_cartridges',
    name: 'Paper Cartridges',
    description: 'Simple paper-wrapped powder charges for muzzle-loaders. A frontier staple.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      },
      {
        materialId: 'paper',
        materialName: 'Wrapping Paper',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'paper_cartridges',
      itemName: 'Paper Cartridges',
      baseQuantity: 15,
      qualityAffectsStats: false
    },
    baseCraftTime: 25,
    difficulty: 4,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['novice', 'ammunition', 'basic', 'muzzle-loader']
  },
  {
    id: 'gs_pistol_cleaning_brush',
    name: 'Pistol Cleaning Brush',
    description: 'A brass-bristled brush sized for pistol barrels. Essential maintenance.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      },
      {
        materialId: 'hardwood',
        materialName: 'Hardwood',
        category: MaterialCategory.WOOD,
        quantity: 1
      }
    ],
    output: {
      itemId: 'pistol_cleaning_brush',
      itemName: 'Pistol Cleaning Brush',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 35,
    difficulty: 7,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['novice', 'maintenance', 'cleaning', 'pistol']
  },
  {
    id: 'gs_small_caliber_bullets',
    name: 'Small Caliber Bullets',
    description: 'Light .22 caliber rounds perfect for varmint hunting and target practice.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.POWDER_PRESS,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 1
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 1
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'small_caliber_bullets',
      itemName: 'Small Caliber Bullets',
      baseQuantity: 30,
      qualityAffectsStats: false
    },
    baseCraftTime: 40,
    difficulty: 8,
    xpGain: 14,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['novice', 'ammunition', 'small-caliber', 'practice']
  },
  {
    id: 'gs_basic_holster_clip',
    name: 'Basic Holster Clip',
    description: 'A simple belt clip to secure your holster. Nothing fancy, but reliable.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 10,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      },
      {
        materialId: 'leather_strap',
        materialName: 'Leather Strap',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 1
      }
    ],
    output: {
      itemId: 'basic_holster_clip',
      itemName: 'Basic Holster Clip',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 50,
    difficulty: 11,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'component',
    tags: ['novice', 'holster', 'accessory', 'clip']
  },
  {
    id: 'gs_field_repair_kit',
    name: 'Field Repair Kit',
    description: 'Portable kit with screwdrivers, springs, and pins for emergency gun repairs.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 14,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'iron_bar',
        materialName: 'Iron Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'spring_wire',
        materialName: 'Spring Wire',
        category: MaterialCategory.GUN_PART,
        quantity: 3
      },
      {
        materialId: 'canvas',
        materialName: 'Canvas Pouch',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'field_repair_kit',
      itemName: 'Field Repair Kit',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 75,
    difficulty: 14,
    xpGain: 22,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['novice', 'maintenance', 'repair', 'portable']
  },

  // ============================================================================
  // NEW RECIPES - APPRENTICE TIER (16-30) - 6 additional recipes
  // ============================================================================
  {
    id: 'gs_wadcutter_rounds',
    name: 'Wadcutter Rounds',
    description: 'Flat-nosed bullets that punch clean holes. Favored for target shooting.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.POWDER_PRESS,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'wadcutter_rounds',
      itemName: 'Wadcutter Rounds',
      baseQuantity: 18,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['apprentice', 'ammunition', 'precision', 'target']
  },
  {
    id: 'gs_revolver_cylinder',
    name: 'Revolver Cylinder',
    description: 'Replacement six-shot cylinder for standard revolvers. Machined from solid steel.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
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
        materialId: 'cylinder_pin',
        materialName: 'Cylinder Pin',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'revolver_cylinder',
      itemName: 'Revolver Cylinder',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 27,
    xpGain: 44,
    learningSource: RecipeSource.TRAINER,
    category: 'component',
    tags: ['apprentice', 'revolver', 'cylinder', 'replacement']
  },
  {
    id: 'gs_quick_draw_holster_spring',
    name: 'Quick-Draw Holster Spring',
    description: 'Spring mechanism that pops your pistol into your hand faster than a rattlesnake strikes.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 22,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'spring_wire',
        materialName: 'Spring Wire',
        category: MaterialCategory.GUN_PART,
        quantity: 4
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'quick_draw_spring',
      itemName: 'Quick-Draw Holster Spring',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 130,
    difficulty: 30,
    xpGain: 48,
    learningSource: RecipeSource.VENDOR,
    learningCost: 180,
    category: 'component',
    tags: ['apprentice', 'holster', 'speed', 'quick-draw']
  },
  {
    id: 'gs_buckshot_spread_shells',
    name: 'Buckshot Spread Shells',
    description: 'Modified shells with a wider spread pattern. Devastating at close range.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 25,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'buckshot',
        materialName: 'Buckshot',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 4
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'buckshot_spread_shells',
      itemName: 'Buckshot Spread Shells',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 110,
    difficulty: 32,
    xpGain: 52,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['apprentice', 'shotgun', 'ammunition', 'spread']
  },
  {
    id: 'gs_hammer_spur',
    name: 'Extended Hammer Spur',
    description: 'Elongated hammer spur for easier cocking. Popular with quick-draw artists.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 27,
      minTier: CraftingSkillTier.APPRENTICE,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      },
      {
        materialId: 'grip_screws',
        materialName: 'Grip Screws',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'hammer_spur',
      itemName: 'Extended Hammer Spur',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 33,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'component',
    tags: ['apprentice', 'modification', 'hammer', 'speed']
  },
  {
    id: 'gs_leather_speed_loader',
    name: 'Leather Speed Loader Pouch',
    description: 'Belt pouch holding pre-loaded cylinders for lightning-fast reloads.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 29,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'leather',
        materialName: 'Leather',
        category: MaterialCategory.TANNED_LEATHER,
        quantity: 3
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'speed_loader_pouch',
      itemName: 'Leather Speed Loader Pouch',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 35,
    xpGain: 58,
    learningSource: RecipeSource.VENDOR,
    learningCost: 220,
    category: 'component',
    tags: ['apprentice', 'reload', 'speed', 'accessory']
  },

  // ============================================================================
  // NEW RECIPES - JOURNEYMAN TIER (31-50) - 8 additional recipes
  // ============================================================================
  {
    id: 'gs_colt_peacemaker',
    name: 'Colt Peacemaker Replica',
    description: 'The gun that won the West. A faithful recreation of the legendary Single Action Army.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 32,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 3
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
        materialId: 'pistol_grip',
        materialName: 'Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'revolver_cylinder',
        materialName: 'Revolver Cylinder',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'trigger_assembly',
        materialName: 'Trigger Assembly',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'colt_peacemaker',
      itemName: 'Colt Peacemaker Replica',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 44,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'revolver', 'colt', 'iconic']
  },
  {
    id: 'gs_winchester_lever_action',
    name: 'Winchester Lever-Action Rifle',
    description: 'The quintessential frontier rifle. Reliable lever action with a 12-round tube magazine.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 36,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
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
        materialId: 'rifle_stock',
        materialName: 'Rifle Stock',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'lever_mechanism',
        materialName: 'Lever Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'winchester_lever_action',
      itemName: 'Winchester Lever-Action Rifle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 48,
    xpGain: 88,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'rifle', 'winchester', 'lever-action']
  },
  {
    id: 'gs_coach_gun',
    name: 'Coach Gun',
    description: 'Short-barreled double-barrel shotgun. The stagecoach guards favorite.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 39,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
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
        materialId: 'pistol_grip',
        materialName: 'Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      },
      {
        materialId: 'break_action_hinge',
        materialName: 'Break-Action Hinge',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'coach_gun',
      itemName: 'Coach Gun',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 50,
    xpGain: 92,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'shotgun', 'double-barrel', 'coach']
  },
  {
    id: 'gs_tracer_rounds',
    name: 'Tracer Rounds',
    description: 'Bullets that leave a visible trail. Helpful for adjusting aim at long range.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 40,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'phosphorus',
        materialName: 'Phosphorus Compound',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'tracer_rounds',
      itemName: 'Tracer Rounds',
      baseQuantity: 12,
      qualityAffectsStats: true
    },
    baseCraftTime: 160,
    difficulty: 51,
    xpGain: 94,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.08,
    category: 'ammunition',
    tags: ['journeyman', 'ammunition', 'tracer', 'visibility']
  },
  {
    id: 'gs_derringer_pistol',
    name: 'Derringer Pocket Pistol',
    description: 'Compact two-shot pistol easily concealed in a vest or boot. A gamblers insurance.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 43,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 3
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'mother_of_pearl',
        materialName: 'Mother of Pearl',
        category: MaterialCategory.ACCESSORY,
        quantity: 1
      }
    ],
    output: {
      itemId: 'derringer_pistol',
      itemName: 'Derringer Pocket Pistol',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 52,
    xpGain: 98,
    learningSource: RecipeSource.VENDOR,
    learningCost: 400,
    category: 'weapon',
    tags: ['journeyman', 'pistol', 'derringer', 'concealed']
  },
  {
    id: 'gs_sawed_off_shotgun',
    name: 'Sawed-Off Shotgun',
    description: 'Brutally shortened shotgun. Illegal in most territories, devastating up close.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 46,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 3
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
        materialId: 'pistol_grip',
        materialName: 'Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sawed_off_shotgun',
      itemName: 'Sawed-Off Shotgun',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 54,
    xpGain: 102,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.05,
    category: 'weapon',
    tags: ['journeyman', 'shotgun', 'illegal', 'close-range']
  },
  {
    id: 'gs_slug_shells',
    name: 'Rifled Slug Shells',
    description: 'Single heavy projectile shells that turn a shotgun into a devastating long-range weapon.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 48,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 4
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'slug_shells',
      itemName: 'Rifled Slug Shells',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 55,
    xpGain: 105,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['journeyman', 'shotgun', 'ammunition', 'slug']
  },
  {
    id: 'gs_sharps_rifle',
    name: 'Sharps Buffalo Rifle',
    description: 'Heavy single-shot rifle with legendary range and stopping power. A buffalo hunters tool.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 50,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 3
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
        materialId: 'rifle_stock',
        materialName: 'Rifle Stock',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Heavy Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'falling_block_action',
        materialName: 'Falling Block Action',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sharps_rifle',
      itemName: 'Sharps Buffalo Rifle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 400,
    difficulty: 58,
    xpGain: 115,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['journeyman', 'rifle', 'sharps', 'long-range', 'powerful']
  },

  // ============================================================================
  // NEW RECIPES - EXPERT TIER (51-70) - 7 additional recipes
  // ============================================================================
  {
    id: 'gs_schofield_revolver',
    name: 'Schofield Top-Break Revolver',
    description: 'Elegant break-action revolver with rapid reload capability. Preferred by outlaws and lawmen alike.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 52,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 7
      },
      {
        materialId: 'nickel_plating',
        materialName: 'Nickel Plating',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      },
      {
        materialId: 'pistol_grip',
        materialName: 'Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'top_break_latch',
        materialName: 'Top-Break Latch',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'schofield_revolver',
      itemName: 'Schofield Top-Break Revolver',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 340,
    difficulty: 64,
    xpGain: 128,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'revolver', 'schofield', 'quick-reload']
  },
  {
    id: 'gs_match_grade_ammo',
    name: 'Match-Grade Ammunition',
    description: 'Precision-loaded rounds with exact powder charges. Competition-quality accuracy.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 54,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.POWDER_PRESS,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Match-Grade Brass',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 3
      },
      {
        materialId: 'precision_powder',
        materialName: 'Precision Powder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'match_grade_ammo',
      itemName: 'Match-Grade Ammunition',
      baseQuantity: 12,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 66,
    xpGain: 135,
    learningSource: RecipeSource.TRAINER,
    category: 'ammunition',
    tags: ['expert', 'ammunition', 'precision', 'competition']
  },
  {
    id: 'gs_volcanic_pistol',
    name: 'Volcanic Repeating Pistol',
    description: 'Innovative lever-action pistol with internal magazine. Eight shots before reloading.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 57,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
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
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 4
      },
      {
        materialId: 'lever_mechanism',
        materialName: 'Miniature Lever Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'tube_magazine',
        materialName: 'Tube Magazine',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'volcanic_pistol',
      itemName: 'Volcanic Repeating Pistol',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 380,
    difficulty: 69,
    xpGain: 145,
    learningSource: RecipeSource.VENDOR,
    learningCost: 650,
    category: 'weapon',
    tags: ['expert', 'pistol', 'repeating', 'lever-action']
  },
  {
    id: 'gs_poison_tipped_rounds',
    name: 'Poison-Tipped Rounds',
    description: 'Bullets coated with rattlesnake venom. Wounds fester and weaken the target.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 60,
      minTier: CraftingSkillTier.EXPERT,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 35
      }
    },
    materials: [
      {
        materialId: 'brass_casing',
        materialName: 'Brass Casing',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'lead',
        materialName: 'Lead',
        category: MaterialCategory.AMMUNITION_COMPONENT,
        quantity: 2
      },
      {
        materialId: 'rattlesnake_venom',
        materialName: 'Rattlesnake Venom',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'poison_tipped_rounds',
      itemName: 'Poison-Tipped Rounds',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 220,
    difficulty: 70,
    xpGain: 152,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.04,
    category: 'ammunition',
    tags: ['expert', 'ammunition', 'poison', 'special'],
    specialNotes: 'Applies poison damage over time'
  },
  {
    id: 'gs_henry_rifle',
    name: 'Henry Repeating Rifle',
    description: 'Brass-framed lever-action marvel. Sixteen shots as fast as you can work the lever.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 63,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
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
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 8
      },
      {
        materialId: 'rifle_stock',
        materialName: 'Rifle Stock',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'lever_mechanism',
        materialName: 'Lever Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'henry_rifle',
      itemName: 'Henry Repeating Rifle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 72,
    xpGain: 158,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['expert', 'rifle', 'henry', 'repeating', 'high-capacity']
  },
  {
    id: 'gs_dragoon_revolver',
    name: 'Colt Dragoon Revolver',
    description: 'Massive six-shooter with cavalry heritage. Heavy but hits like a cannon.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 66,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Steel Bar',
        category: MaterialCategory.REFINED_METAL,
        quantity: 9
      },
      {
        materialId: 'pistol_grip',
        materialName: 'Oversized Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'heavy_cylinder',
        materialName: 'Heavy Revolver Cylinder',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Heavy Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'dragoon_revolver',
      itemName: 'Colt Dragoon Revolver',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 380,
    difficulty: 74,
    xpGain: 165,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'revolver', 'dragoon', 'heavy', 'powerful']
  },
  {
    id: 'gs_blued_steel_finish',
    name: 'Blued Steel Finishing Kit',
    description: 'Professional-grade bluing solution and tools. Protects metal and looks magnificent.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 69,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'bluing_salts',
        materialName: 'Bluing Salts',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'polishing_compound',
        materialName: 'Polishing Compound',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'gun_oil',
        materialName: 'Gun Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'blued_steel_kit',
      itemName: 'Blued Steel Finishing Kit',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 75,
    xpGain: 170,
    learningSource: RecipeSource.TRAINER,
    category: 'tool',
    tags: ['expert', 'finishing', 'cosmetic', 'protection'],
    specialNotes: 'Increases weapon durability by 25%'
  },

  // ============================================================================
  // NEW RECIPES - MASTER TIER (71-90) - 5 additional recipes
  // ============================================================================
  {
    id: 'gs_lemat_revolver',
    name: 'LeMat Grapeshot Revolver',
    description: 'Nine-shot revolver with an underslung shotgun barrel. Two weapons in one.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 73,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
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
        materialId: 'pistol_grip',
        materialName: 'Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'nine_shot_cylinder',
        materialName: 'Nine-Shot Cylinder',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'shotgun_barrel_mini',
        materialName: 'Underslung Shotgun Barrel',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'lemat_revolver',
      itemName: 'LeMat Grapeshot Revolver',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 500,
    difficulty: 82,
    xpGain: 210,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['master', 'revolver', 'lemat', 'hybrid', 'unique']
  },
  {
    id: 'gs_custom_engraved_barrel',
    name: 'Custom Engraved Barrel',
    description: 'Masterfully engraved barrel with silver inlay. A true work of art.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 77,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Damascus Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 10
      },
      {
        materialId: 'silver_inlay',
        materialName: 'Silver Inlay Wire',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 5
      },
      {
        materialId: 'engraving_tools',
        materialName: 'Master Engraving Tools',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'engraved_barrel',
      itemName: 'Custom Engraved Barrel',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 86,
    xpGain: 260,
    learningSource: RecipeSource.REPUTATION,
    category: 'component',
    tags: ['master', 'cosmetic', 'engraved', 'prestigious'],
    specialNotes: 'Adds +15% to weapon sale value and intimidation'
  },
  {
    id: 'gs_colt_walker',
    name: 'Colt Walker Revolver',
    description: 'The most powerful black-powder revolver ever made. Four and a half pounds of pure devastation.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 82,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 55
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Reinforced Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 14
      },
      {
        materialId: 'pistol_grip',
        materialName: 'Oversized Walnut Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'heavy_cylinder',
        materialName: 'Massive Cylinder',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'barrel_blank',
        materialName: 'Nine-Inch Barrel Blank',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'colt_walker',
      itemName: 'Colt Walker Revolver',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 88,
    xpGain: 290,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['master', 'revolver', 'colt', 'walker', 'devastating']
  },
  {
    id: 'gs_mercury_fulminate_primers',
    name: 'Mercury Fulminate Primers',
    description: 'Highly sensitive primers for guaranteed ignition. Handle with extreme care.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 86,
      minTier: CraftingSkillTier.MASTER,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 50
      }
    },
    materials: [
      {
        materialId: 'mercury',
        materialName: 'Mercury',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'nitric_acid',
        materialName: 'Nitric Acid',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'brass',
        materialName: 'Brass',
        category: MaterialCategory.REFINED_METAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'mercury_primers',
      itemName: 'Mercury Fulminate Primers',
      baseQuantity: 20,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 89,
    xpGain: 300,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.03,
    category: 'component',
    tags: ['master', 'primer', 'dangerous', 'reliable'],
    specialNotes: 'Never misfires. Highly volatile during crafting.'
  },
  {
    id: 'gs_gatling_pistol',
    name: 'Gatling Pistol',
    description: 'Experimental hand-cranked pistol with rotating barrels. Fires as fast as you can crank.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 89,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 4
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 65
      }
    },
    materials: [
      {
        materialId: 'steel_bar',
        materialName: 'Hardened Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 16
      },
      {
        materialId: 'rotating_barrel_assembly',
        materialName: 'Miniature Rotating Barrel Assembly',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      },
      {
        materialId: 'pistol_grip',
        materialName: 'Reinforced Pistol Grip',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'crank_mechanism',
        materialName: 'Micro Crank Mechanism',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'gatling_pistol',
      itemName: 'Gatling Pistol',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 660,
    difficulty: 92,
    xpGain: 340,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['master', 'pistol', 'experimental', 'rapid-fire', 'unique']
  },

  // ============================================================================
  // NEW RECIPES - GRANDMASTER TIER (91-100) - 5 additional recipes
  // ============================================================================
  {
    id: 'gs_silver_bullets',
    name: 'Pure Silver Bullets',
    description: 'Blessed silver ammunition for hunting supernatural creatures. Essential for monster hunters.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'blessed_silver',
        materialName: 'Blessed Silver',
        category: MaterialCategory.PRECIOUS_METAL,
        quantity: 8
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Consecrated Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 3
      }
    ],
    output: {
      itemId: 'silver_bullets',
      itemName: 'Pure Silver Bullets',
      baseQuantity: 12,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 95,
    xpGain: 450,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'ammunition',
    tags: ['grandmaster', 'ammunition', 'silver', 'supernatural', 'holy'],
    specialNotes: 'Deals 300% damage to werewolves, vampires, and undead'
  },
  {
    id: 'gs_hellfire_pistol',
    name: 'Hellfire Pistol',
    description: 'Revolver forged in brimstone and quenched in demons blood. Each shot burns with infernal fire.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 80
      }
    },
    materials: [
      {
        materialId: 'demon_steel',
        materialName: 'Demon-Forged Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 12
      },
      {
        materialId: 'hellfire_essence',
        materialName: 'Essence of Hellfire',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'brimstone',
        materialName: 'Brimstone',
        category: MaterialCategory.MINERAL,
        quantity: 8
      },
      {
        materialId: 'cursed_grip',
        materialName: 'Bone Grip',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'hellfire_pistol',
      itemName: 'Hellfire Pistol',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 840,
    difficulty: 98,
    xpGain: 550,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'pistol', 'demonic', 'fire', 'legendary'],
    specialNotes: 'Shots ignite targets. Wielder takes minor fire damage per shot.'
  },
  {
    id: 'gs_ghost_killing_rounds',
    name: 'Ghost-Killing Rounds',
    description: 'Ethereal ammunition that can harm spirits. Crafted with ectoplasm and cold iron.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 96,
      minTier: CraftingSkillTier.GRANDMASTER,
      otherProfession: {
        professionId: ProfessionId.ALCHEMY,
        minLevel: 65
      }
    },
    materials: [
      {
        materialId: 'cold_iron',
        materialName: 'Cold Iron',
        category: MaterialCategory.REFINED_METAL,
        quantity: 6
      },
      {
        materialId: 'ectoplasm',
        materialName: 'Ectoplasm',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'graveyard_dust',
        materialName: 'Consecrated Graveyard Dust',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'gunpowder',
        materialName: 'Spirit-Infused Powder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 2
      }
    ],
    output: {
      itemId: 'ghost_killing_rounds',
      itemName: 'Ghost-Killing Rounds',
      baseQuantity: 8,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 97,
    xpGain: 580,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'ammunition',
    tags: ['grandmaster', 'ammunition', 'ethereal', 'supernatural'],
    specialNotes: 'Can damage incorporeal entities. Passes through normal matter.'
  },
  {
    id: 'gs_blessed_carbine',
    name: 'Blessed Carbine of St. Michael',
    description: 'Holy rifle blessed by a frontier priest. Its shots pierce darkness and banish evil.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.GUN_LATHE,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'blessed_steel',
        materialName: 'Thrice-Blessed Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 15
      },
      {
        materialId: 'angel_feather',
        materialName: 'Angel Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'holy_oak',
        materialName: 'Holy Oak Stock',
        category: MaterialCategory.WOOD,
        quantity: 1
      },
      {
        materialId: 'saints_relic',
        materialName: 'Saints Relic Fragment',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'blessed_carbine',
      itemName: 'Blessed Carbine of St. Michael',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1080,
    difficulty: 99,
    xpGain: 750,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['grandmaster', 'rifle', 'holy', 'legendary', 'blessed'],
    specialNotes: 'Deals radiant damage. Banishes demons on critical hit. Glows in presence of evil.'
  },
  {
    id: 'gs_pale_rider_revolvers',
    name: 'Pale Rider Matched Revolvers',
    description: 'Twin revolvers of bone-white metal. Said to have been carried by Death himself.',
    professionId: ProfessionId.GUNSMITHING,
    requirements: {
      professionId: ProfessionId.GUNSMITHING,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.TEST_RANGE,
        tier: 5
      },
      otherProfession: {
        professionId: ProfessionId.BLACKSMITHING,
        minLevel: 85
      }
    },
    materials: [
      {
        materialId: 'spectral_steel',
        materialName: 'Spectral Steel',
        category: MaterialCategory.REFINED_METAL,
        quantity: 20
      },
      {
        materialId: 'deaths_essence',
        materialName: 'Essence of Death',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'pale_bone',
        materialName: 'Ancient Pale Bone',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'void_crystal',
        materialName: 'Void Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'pale_rider_revolvers',
      itemName: 'Pale Rider Matched Revolvers',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 1500,
    difficulty: 100,
    xpGain: 900,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'weapon',
    tags: ['grandmaster', 'revolver', 'legendary', 'death', 'unique', 'paired'],
    specialNotes: 'Paired weapons. Instant kill on targets below 10% health. Wielder becomes immune to fear.'
  }
];

export default gunsmithingRecipes;
