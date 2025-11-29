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
  }
];

export default gunsmithingRecipes;
