/**
 * Alchemy Recipes Database
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Masters of potions and explosives - brew elixirs, poisons, and volatile compounds
 */

import {
  CraftingRecipe,
  ProfessionId,
  CraftingSkillTier,
  MaterialCategory,
  RecipeSource,
  CraftingFacilityType
} from '@desperados/shared';

export const alchemyRecipes: CraftingRecipe[] = [
  // ============================================================================
  // NOVICE TIER (1-15)
  // ============================================================================
  {
    id: 'alc_healing_salve',
    name: 'Healing Salve',
    description: 'A basic ointment that speeds wound recovery. Smells terrible.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.CAULDRON,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'prairie_herbs',
        materialName: 'Prairie Herbs',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'water',
        materialName: 'Clean Water',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'healing_salve',
      itemName: 'Healing Salve',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 30,
    difficulty: 5,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'healing', 'medicine']
  },
  {
    id: 'alc_snake_oil',
    name: 'Snake Oil',
    description: 'Dubious tonic that claims to cure everything. Actually does provide minor energy boost.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'snake_venom',
        materialName: 'Snake Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'alcohol',
        materialName: 'Alcohol',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      },
      {
        materialId: 'herbs',
        materialName: 'Mixed Herbs',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'snake_oil',
      itemName: 'Snake Oil',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 45,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'energy', 'tonic']
  },
  {
    id: 'alc_basic_antidote',
    name: 'Basic Antidote',
    description: 'Counters common poisons and venoms. Keep one handy in rattlesnake country.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'charcoal',
        materialName: 'Activated Charcoal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'milk_thistle',
        materialName: 'Milk Thistle',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'basic_antidote',
      itemName: 'Basic Antidote',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 60,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'antidote', 'medicine']
  },
  {
    id: 'alc_smelling_salts',
    name: 'Smelling Salts',
    description: 'Pungent salts that wake the unconscious. Also clears the head.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 8,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'ammonia',
        materialName: 'Ammonia',
        category: MaterialCategory.MINERAL,
        quantity: 1
      },
      {
        materialId: 'peppermint',
        materialName: 'Peppermint Oil',
        category: MaterialCategory.HERB,
        quantity: 1
      }
    ],
    output: {
      itemId: 'smelling_salts',
      itemName: 'Smelling Salts',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'revival', 'utility']
  },
  {
    id: 'alc_pain_killer',
    name: 'Pain Killer Draught',
    description: 'Numbs pain and allows continued action despite injury.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 12,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'opium_poppy',
        materialName: 'Opium Poppy',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'whiskey',
        materialName: 'Whiskey',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'pain_killer',
      itemName: 'Pain Killer Draught',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 15,
    xpGain: 25,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'pain', 'medicine']
  },

  // ============================================================================
  // APPRENTICE TIER (16-30)
  // ============================================================================
  {
    id: 'alc_strength_tonic',
    name: 'Strength Tonic',
    description: 'Increases physical power temporarily. Popular with brawlers.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 16,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'bear_root',
        materialName: 'Bear Root',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'iron_shavings',
        materialName: 'Iron Shavings',
        category: MaterialCategory.MINERAL,
        quantity: 1
      },
      {
        materialId: 'buffalo_blood',
        materialName: 'Buffalo Blood',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'strength_tonic',
      itemName: 'Strength Tonic',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 25,
    xpGain: 40,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'buff', 'strength']
  },
  {
    id: 'alc_speed_elixir',
    name: 'Speed Elixir',
    description: 'Quickens reflexes and movement. Favored by thieves and gunslingers.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 18,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'coyote_gland',
        materialName: 'Coyote Adrenaline Gland',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'ginseng',
        materialName: 'Wild Ginseng',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'cactus_extract',
        materialName: 'Cactus Extract',
        category: MaterialCategory.HERB,
        quantity: 1
      }
    ],
    output: {
      itemId: 'speed_elixir',
      itemName: 'Speed Elixir',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'buff', 'speed']
  },
  {
    id: 'alc_smoke_bomb',
    name: 'Smoke Bomb',
    description: 'Creates a thick cloud of smoke for quick escapes or confusion.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 20,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'saltpeter',
        materialName: 'Saltpeter',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'sugar',
        materialName: 'Sugar',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'dye_powder',
        materialName: 'Dye Powder',
        category: MaterialCategory.DYE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'smoke_bomb',
      itemName: 'Smoke Bomb',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 22,
    xpGain: 35,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'explosive', 'tactical']
  },
  {
    id: 'alc_night_vision_elixir',
    name: 'Night Vision Elixir',
    description: 'Allows clear vision in darkness. Essential for night raids.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 24,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'owl_eyes',
        materialName: 'Owl Eyes',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'moonflower',
        materialName: 'Moonflower',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'bat_guano',
        materialName: 'Bat Guano',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'night_vision_elixir',
      itemName: 'Night Vision Elixir',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.VENDOR,
    learningCost: 200,
    category: 'consumable',
    tags: ['apprentice', 'vision', 'night']
  },
  {
    id: 'alc_fire_oil',
    name: 'Fire Oil',
    description: 'Flammable liquid that burns intensely. Coat weapons or throw as incendiary.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 28,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'oil',
        materialName: 'Lamp Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'sulfur',
        materialName: 'Sulfur',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'phosphorus',
        materialName: 'Phosphorus',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'fire_oil',
      itemName: 'Fire Oil',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 32,
    xpGain: 55,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['apprentice', 'fire', 'weapon']
  },

  // ============================================================================
  // JOURNEYMAN TIER (31-50)
  // ============================================================================
  {
    id: 'alc_invisibility_potion',
    name: 'Invisibility Potion',
    description: 'Renders the drinker invisible for a short time. Perfect for infiltration.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 31,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'ghost_pepper',
        materialName: 'Ghost Pepper',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'chameleon_skin',
        materialName: 'Chameleon Skin',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'void_essence',
        materialName: 'Void Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'invisibility_potion',
      itemName: 'Invisibility Potion',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 45,
    xpGain: 80,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.08,
    category: 'consumable',
    tags: ['journeyman', 'stealth', 'magic']
  },
  {
    id: 'alc_explosive_charge',
    name: 'Explosive Charge',
    description: 'Powerful explosive for demolition or combat. Handle with extreme care.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 34,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 5
      },
      {
        materialId: 'nitroglycerin',
        materialName: 'Nitroglycerin',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'clay',
        materialName: 'Clay',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'explosive_charge',
      itemName: 'Explosive Charge',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 48,
    xpGain: 90,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['journeyman', 'explosive', 'demolition']
  },
  {
    id: 'alc_numbing_agent',
    name: 'Numbing Agent',
    description: 'Powerful anesthetic for surgery or interrogation resistance.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 38,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'laudanum',
        materialName: 'Laudanum',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'ice_crystal',
        materialName: 'Ice Crystal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'nightshade',
        materialName: 'Nightshade',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'numbing_agent',
      itemName: 'Numbing Agent',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 42,
    xpGain: 75,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'anesthetic', 'medicine']
  },
  {
    id: 'alc_truth_serum',
    name: 'Truth Serum',
    description: 'Makes the subject compelled to answer questions honestly. Illegal in most territories.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 42,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'truth_flower',
        materialName: 'Truth Flower',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'mercury',
        materialName: 'Mercury',
        category: MaterialCategory.MINERAL,
        quantity: 1
      },
      {
        materialId: 'angel_tears',
        materialName: 'Angel Tears',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'truth_serum',
      itemName: 'Truth Serum',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 50,
    xpGain: 95,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['journeyman', 'interrogation', 'illegal']
  },

  // ============================================================================
  // EXPERT TIER (51-70)
  // ============================================================================
  {
    id: 'alc_resurrection_tonic',
    name: 'Resurrection Tonic',
    description: 'Brings someone back from the brink of death. Miracle medicine.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 51,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'phoenix_ash',
        materialName: 'Phoenix Ash',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'life_root',
        materialName: 'Life Root',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'diamond_dust',
        materialName: 'Diamond Dust',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'resurrection_tonic',
      itemName: 'Resurrection Tonic',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 360,
    difficulty: 65,
    xpGain: 130,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['expert', 'revival', 'rare'],
    specialNotes: 'Can revive fallen allies in combat'
  },
  {
    id: 'alc_deadly_poison',
    name: 'Deadly Poison',
    description: 'Lethal toxin that kills slowly and painfully. Coat weapons or slip into drinks.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 55,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'death_cap',
        materialName: 'Death Cap Mushroom',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'scorpion_venom',
        materialName: 'Scorpion Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      },
      {
        materialId: 'arsenic',
        materialName: 'Arsenic',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'deadly_poison',
      itemName: 'Deadly Poison',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 68,
    xpGain: 140,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['expert', 'poison', 'assassination']
  },
  {
    id: 'alc_dynamite_bundle',
    name: 'Dynamite Bundle',
    description: 'Multiple sticks of dynamite for maximum destructive power.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 58,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'dynamite_stick',
        materialName: 'Dynamite Stick',
        category: MaterialCategory.GUNPOWDER,
        quantity: 5
      },
      {
        materialId: 'blasting_wire',
        materialName: 'Blasting Wire',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      },
      {
        materialId: 'detonator',
        materialName: 'Detonator',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'dynamite_bundle',
      itemName: 'Dynamite Bundle',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 60,
    xpGain: 120,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['expert', 'explosive', 'demolition']
  },
  {
    id: 'alc_mind_control_elixir',
    name: 'Mind Control Elixir',
    description: 'Makes the drinker susceptible to suggestion. Extremely dangerous and illegal.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 62,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'brain_fungus',
        materialName: 'Mind-Altering Fungus',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'hypnotic_powder',
        materialName: 'Hypnotic Powder',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'demon_blood',
        materialName: 'Demon Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'mind_control_elixir',
      itemName: 'Mind Control Elixir',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 70,
    xpGain: 150,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'consumable',
    tags: ['expert', 'mind', 'illegal', 'dark']
  },

  // ============================================================================
  // MASTER TIER (71-90)
  // ============================================================================
  {
    id: 'alc_berserker_brew',
    name: 'Berserker Brew',
    description: 'Unleashes primal fury. Massive strength boost but loss of control.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 71,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'rage_root',
        materialName: 'Rage Root',
        category: MaterialCategory.HERB,
        quantity: 6
      },
      {
        materialId: 'bear_adrenal_gland',
        materialName: 'Grizzly Adrenal Gland',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      },
      {
        materialId: 'war_paint',
        materialName: 'War Paint',
        category: MaterialCategory.DYE,
        quantity: 2
      },
      {
        materialId: 'moonshine',
        materialName: 'Moonshine',
        category: MaterialCategory.ALCOHOL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'berserker_brew',
      itemName: 'Berserker Brew',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 80,
    xpGain: 200,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['master', 'strength', 'rage'],
    specialNotes: '+200% damage but cannot use items or flee'
  },
  {
    id: 'alc_paralytic_venom',
    name: 'Paralytic Venom',
    description: 'Instantly paralyzes the target. Used by assassins and law enforcement.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 75,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'tarantula_venom',
        materialName: 'Tarantula Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 4
      },
      {
        materialId: 'hemlock',
        materialName: 'Hemlock',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'ice_essence',
        materialName: 'Essence of Ice',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'paralytic_venom',
      itemName: 'Paralytic Venom',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 85,
    xpGain: 250,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['master', 'poison', 'paralysis']
  },
  {
    id: 'alc_immortality_elixir',
    name: 'Elixir of Temporary Immortality',
    description: 'Prevents death for a short time. You cannot be killed while under its effects.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 80,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'phoenix_feather',
        materialName: 'Phoenix Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'unicorn_horn',
        materialName: 'Unicorn Horn Powder',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'eternal_flame',
        materialName: 'Eternal Flame Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'immortality_elixir',
      itemName: 'Elixir of Temporary Immortality',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 88,
    xpGain: 280,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['master', 'immortality', 'legendary']
  },
  {
    id: 'alc_transformation_potion',
    name: 'Transformation Potion',
    description: 'Allows the drinker to take on the appearance of another person.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 85,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'chameleon_essence',
        materialName: 'Chameleon Essence',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 5
      },
      {
        materialId: 'mirror_dust',
        materialName: 'Mirror Dust',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'shapeshifter_blood',
        materialName: 'Shapeshifter Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'transformation_potion',
      itemName: 'Transformation Potion',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 90,
    xpGain: 300,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['master', 'disguise', 'transformation']
  },

  // ============================================================================
  // GRANDMASTER TIER (91-100)
  // ============================================================================
  {
    id: 'alc_elixir_of_legends',
    name: 'Elixir of Legends',
    description: 'The ultimate alchemical achievement. Permanently increases all stats.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 91,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'philosopher_stone',
        materialName: "Philosopher's Stone",
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      },
      {
        materialId: 'dragon_blood',
        materialName: 'Dragon Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'ambrosia',
        materialName: 'Ambrosia',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'time_essence',
        materialName: 'Essence of Time',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'elixir_of_legends',
      itemName: 'Elixir of Legends',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 900,
    difficulty: 100,
    xpGain: 500,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'permanent', 'unique'],
    specialNotes: 'Can only be consumed once per character. +5 to all stats permanently.'
  },
  {
    id: 'alc_atomic_explosive',
    name: 'Atomic Explosive',
    description: 'Devastatingly powerful explosive. Can level entire buildings.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 94,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'uranium_ore',
        materialName: 'Enriched Uranium',
        category: MaterialCategory.MINERAL,
        quantity: 10
      },
      {
        materialId: 'explosive_compound',
        materialName: 'Experimental Explosive',
        category: MaterialCategory.GUNPOWDER,
        quantity: 20
      },
      {
        materialId: 'containment_vessel',
        materialName: 'Containment Vessel',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'atomic_explosive',
      itemName: 'Atomic Explosive',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 1200,
    difficulty: 98,
    xpGain: 600,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'utility',
    tags: ['grandmaster', 'explosive', 'mass-destruction'],
    specialNotes: 'Banned in most territories. Use triggers wanted level.'
  },
  {
    id: 'alc_fountain_of_youth',
    name: 'Fountain of Youth Elixir',
    description: 'Reverses aging and grants extended lifespan. The dream of immortals.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 97,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'youth_essence',
        materialName: 'Essence of Youth',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'celestial_dew',
        materialName: 'Celestial Dew',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'life_crystal',
        materialName: 'Life Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      }
    ],
    output: {
      itemId: 'fountain_of_youth',
      itemName: 'Fountain of Youth Elixir',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1800,
    difficulty: 100,
    xpGain: 800,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'youth', 'unique'],
    specialNotes: 'Resets character age and grants longevity buff'
  }
];

export default alchemyRecipes;
