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

  // -------------------------------------------------------------------------
  // BASIC REMEDIES (Level 1-5) - Using Gathered Materials
  // -------------------------------------------------------------------------
  {
    id: 'alc_medicinal_poultice',
    name: 'Medicinal Poultice',
    description: 'A simple poultice made from medicinal roots. Effective at treating wounds.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 1,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'medicinal_root',
        materialName: 'Medicinal Root',
        category: MaterialCategory.HERB,
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
      itemId: 'medicinal_poultice',
      itemName: 'Medicinal Poultice',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 3,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'healing', 'basic']
  },
  {
    id: 'alc_herbal_tea',
    name: 'Herbal Tea',
    description: 'A calming tea that restores energy and minor health.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'herbs',
        materialName: 'Herbs',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'herbal_tea',
      itemName: 'Herbal Tea',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 15,
    difficulty: 2,
    xpGain: 6,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'drink', 'energy']
  },
  {
    id: 'alc_poison_coating',
    name: 'Poison Coating',
    description: 'A basic toxin to coat weapons. Causes damage over time.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'poison_herb',
        materialName: 'Poison Herb',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'animal_fat',
        materialName: 'Animal Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'poison_coating',
      itemName: 'Poison Coating',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 25,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'poison', 'weapon']
  },
  {
    id: 'alc_rare_essence',
    name: 'Rare Flower Essence',
    description: 'Distilled essence from rare flowers. Used in advanced alchemy.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 6,
      minTier: CraftingSkillTier.NOVICE,
      facility: {
        type: CraftingFacilityType.CAULDRON,
        tier: 1
      }
    },
    materials: [
      {
        materialId: 'rare_flower',
        materialName: 'Rare Flower',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'rare_essence',
      itemName: 'Rare Flower Essence',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 40,
    difficulty: 10,
    xpGain: 15,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'essence', 'component']
  },
  {
    id: 'alc_tallow_candle',
    name: 'Tallow Candle',
    description: 'A simple candle made from animal fat. Provides light in darkness.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 2,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'animal_fat',
        materialName: 'Animal Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'cloth',
        materialName: 'Cloth',
        category: MaterialCategory.FABRIC,
        quantity: 1
      }
    ],
    output: {
      itemId: 'tallow_candle',
      itemName: 'Tallow Candle',
      baseQuantity: 4,
      qualityAffectsStats: false
    },
    baseCraftTime: 15,
    difficulty: 2,
    xpGain: 5,
    learningSource: RecipeSource.TRAINER,
    category: 'utility',
    tags: ['novice', 'light', 'basic']
  },
  {
    id: 'alc_pine_tar',
    name: 'Pine Tar',
    description: 'Sticky tar made from pine resin. Used as an adhesive and waterproofing.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 5,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'pine_resin',
        materialName: 'Pine Resin',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'charcoal',
        materialName: 'Charcoal',
        category: MaterialCategory.MINERAL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'pine_tar',
      itemName: 'Pine Tar',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 30,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['novice', 'adhesive', 'component']
  },

  // -------------------------------------------------------------------------
  // TRADITIONAL NOVICE POTIONS (Level 1-15)
  // -------------------------------------------------------------------------
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
  },

  // ============================================================================
  // NEW RECIPES - EXPANDED ALCHEMY COLLECTION
  // ============================================================================

  // -------------------------------------------------------------------------
  // NOVICE TIER ADDITIONS (Level 1-15) - 6 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_sage_salve',
    name: 'Sage Salve',
    description: 'A soothing balm made from wild sage. Treats burns and skin irritations.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 3,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'sage',
        materialName: 'Sage',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'bear_fat',
        materialName: 'Bear Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'sage_salve',
      itemName: 'Sage Salve',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 25,
    difficulty: 5,
    xpGain: 9,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'healing', 'salve']
  },
  {
    id: 'alc_tobacco_chew',
    name: 'Medicinal Tobacco Chew',
    description: 'Treated tobacco that steadies the nerves. Improves aim slightly.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 4,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'tobacco',
        materialName: 'Tobacco',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'honey',
        materialName: 'Honey',
        category: MaterialCategory.VEGETABLE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'tobacco_chew',
      itemName: 'Medicinal Tobacco Chew',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 20,
    difficulty: 4,
    xpGain: 8,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'focus', 'tobacco']
  },
  {
    id: 'alc_ginseng_tonic',
    name: 'Ginseng Tonic',
    description: 'Restorative tonic that fights fatigue. Popular with prospectors and miners.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 7,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'ginseng',
        materialName: 'Ginseng',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'honey',
        materialName: 'Honey',
        category: MaterialCategory.VEGETABLE,
        quantity: 1
      }
    ],
    output: {
      itemId: 'ginseng_tonic',
      itemName: 'Ginseng Tonic',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 35,
    difficulty: 8,
    xpGain: 12,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'energy', 'tonic']
  },
  {
    id: 'alc_sunburn_remedy',
    name: 'Sunburn Remedy',
    description: 'Aloe-based mixture that soothes sun-scorched skin. Essential in desert country.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 9,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'aloe',
        materialName: 'Aloe Vera',
        category: MaterialCategory.HERB,
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
      itemId: 'sunburn_remedy',
      itemName: 'Sunburn Remedy',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 20,
    difficulty: 6,
    xpGain: 10,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'healing', 'environmental']
  },
  {
    id: 'alc_cough_syrup',
    name: 'Prairie Cough Syrup',
    description: 'Thick syrup that suppresses coughs and soothes sore throats.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 11,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'sage',
        materialName: 'Sage',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'honey',
        materialName: 'Honey',
        category: MaterialCategory.VEGETABLE,
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
      itemId: 'cough_syrup',
      itemName: 'Prairie Cough Syrup',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 40,
    difficulty: 10,
    xpGain: 14,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'medicine', 'illness']
  },
  {
    id: 'alc_basic_stimulant',
    name: 'Coffee Extract Stimulant',
    description: 'Concentrated coffee essence that keeps you alert through long nights.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 14,
      minTier: CraftingSkillTier.NOVICE
    },
    materials: [
      {
        materialId: 'coffee_beans',
        materialName: 'Coffee Beans',
        category: MaterialCategory.VEGETABLE,
        quantity: 4
      },
      {
        materialId: 'sugar',
        materialName: 'Sugar',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      }
    ],
    output: {
      itemId: 'coffee_stimulant',
      itemName: 'Coffee Extract Stimulant',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 50,
    difficulty: 12,
    xpGain: 18,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['novice', 'stimulant', 'energy']
  },

  // -------------------------------------------------------------------------
  // APPRENTICE TIER ADDITIONS (Level 16-30) - 7 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_rattlesnake_antidote',
    name: 'Rattlesnake Antidote',
    description: 'Specialized antidote for rattlesnake bites. Made from the venom itself.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 17,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'snake_venom',
        materialName: 'Snake Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'ginseng',
        materialName: 'Ginseng',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'charcoal',
        materialName: 'Activated Charcoal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'rattlesnake_antidote',
      itemName: 'Rattlesnake Antidote',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 90,
    difficulty: 24,
    xpGain: 38,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'antidote', 'medicine']
  },
  {
    id: 'alc_courage_draught',
    name: 'Liquid Courage',
    description: 'Potent stimulant that suppresses fear. Popular before gunfights.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 19,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'whiskey',
        materialName: 'Whiskey',
        category: MaterialCategory.ALCOHOL,
        quantity: 2
      },
      {
        materialId: 'tobacco',
        materialName: 'Tobacco',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'adrenaline_extract',
        materialName: 'Adrenaline Extract',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'liquid_courage',
      itemName: 'Liquid Courage',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 100,
    difficulty: 26,
    xpGain: 42,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'buff', 'courage']
  },
  {
    id: 'alc_red_dye',
    name: 'Crimson Dye',
    description: 'Vibrant red dye made from desert flowers. Used for clothing and war paint.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 21,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'red_flower',
        materialName: 'Red Desert Flower',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'salt',
        materialName: 'Salt',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'vinegar',
        materialName: 'Vinegar',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'crimson_dye',
      itemName: 'Crimson Dye',
      baseQuantity: 3,
      qualityAffectsStats: false
    },
    baseCraftTime: 80,
    difficulty: 20,
    xpGain: 32,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['apprentice', 'dye', 'crafting']
  },
  {
    id: 'alc_blue_dye',
    name: 'Indigo Dye',
    description: 'Deep blue dye prized for its rich color. Expensive and sought after.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 23,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'indigo_plant',
        materialName: 'Indigo Plant',
        category: MaterialCategory.HERB,
        quantity: 6
      },
      {
        materialId: 'ammonia',
        materialName: 'Ammonia',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'indigo_dye',
      itemName: 'Indigo Dye',
      baseQuantity: 2,
      qualityAffectsStats: false
    },
    baseCraftTime: 100,
    difficulty: 28,
    xpGain: 45,
    learningSource: RecipeSource.VENDOR,
    learningCost: 150,
    category: 'material',
    tags: ['apprentice', 'dye', 'crafting']
  },
  {
    id: 'alc_peyote_vision',
    name: 'Peyote Vision Draught',
    description: 'Hallucinogenic brew used in spiritual ceremonies. Reveals hidden truths.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 25,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'peyote',
        materialName: 'Peyote',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'sage',
        materialName: 'Sage',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'water',
        materialName: 'Water',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'peyote_vision',
      itemName: 'Peyote Vision Draught',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 30,
    xpGain: 50,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['apprentice', 'vision', 'spiritual']
  },
  {
    id: 'alc_gunpowder_refined',
    name: 'Refined Gunpowder',
    description: 'High-quality gunpowder with improved burn rate. Essential for ammunition crafting.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 27,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'saltpeter',
        materialName: 'Saltpeter',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'sulfur',
        materialName: 'Sulfur',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'charcoal',
        materialName: 'Charcoal',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'refined_gunpowder',
      itemName: 'Refined Gunpowder',
      baseQuantity: 5,
      qualityAffectsStats: true
    },
    baseCraftTime: 120,
    difficulty: 28,
    xpGain: 48,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['apprentice', 'gunpowder', 'ammunition']
  },
  {
    id: 'alc_burn_cream',
    name: 'Fireproof Salve',
    description: 'Protective cream that resists fire damage. Useful around explosives.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 29,
      minTier: CraftingSkillTier.APPRENTICE
    },
    materials: [
      {
        materialId: 'aloe',
        materialName: 'Aloe Vera',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'bear_fat',
        materialName: 'Bear Fat',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'mineral_oil',
        materialName: 'Mineral Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'fireproof_salve',
      itemName: 'Fireproof Salve',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 130,
    difficulty: 32,
    xpGain: 52,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['apprentice', 'protection', 'fire']
  },

  // -------------------------------------------------------------------------
  // JOURNEYMAN TIER ADDITIONS (Level 31-50) - 8 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_potent_healing_elixir',
    name: 'Potent Healing Elixir',
    description: 'Powerful restorative that rapidly heals wounds. Superior to basic remedies.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 32,
      minTier: CraftingSkillTier.JOURNEYMAN,
      facility: {
        type: CraftingFacilityType.CAULDRON,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'ginseng',
        materialName: 'Ginseng',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'life_root',
        materialName: 'Life Root',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'honey',
        materialName: 'Honey',
        category: MaterialCategory.VEGETABLE,
        quantity: 2
      },
      {
        materialId: 'rare_essence',
        materialName: 'Rare Flower Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'potent_healing_elixir',
      itemName: 'Potent Healing Elixir',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 40,
    xpGain: 70,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'healing', 'medicine']
  },
  {
    id: 'alc_snake_venom_poison',
    name: 'Concentrated Viper Venom',
    description: 'Deadly poison extracted and concentrated from multiple snakes. Coats blades.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 35,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'snake_venom',
        materialName: 'Snake Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 5
      },
      {
        materialId: 'nightshade',
        materialName: 'Nightshade',
        category: MaterialCategory.HERB,
        quantity: 2
      },
      {
        materialId: 'alcohol',
        materialName: 'Pure Alcohol',
        category: MaterialCategory.ALCOHOL,
        quantity: 1
      }
    ],
    output: {
      itemId: 'viper_venom_poison',
      itemName: 'Concentrated Viper Venom',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 45,
    xpGain: 78,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'poison', 'blade']
  },
  {
    id: 'alc_weapon_oil_frost',
    name: 'Frost Weapon Oil',
    description: 'Magical oil that imbues weapons with freezing cold. Slows enemies.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 37,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'ice_crystal',
        materialName: 'Ice Crystal',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'mint',
        materialName: 'Arctic Mint',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'oil',
        materialName: 'Refined Oil',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'frost_weapon_oil',
      itemName: 'Frost Weapon Oil',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 160,
    difficulty: 42,
    xpGain: 72,
    learningSource: RecipeSource.VENDOR,
    learningCost: 300,
    category: 'consumable',
    tags: ['journeyman', 'oil', 'weapon', 'frost']
  },
  {
    id: 'alc_stink_bomb',
    name: 'Sulfur Stink Bomb',
    description: 'Releases noxious fumes that sicken and disorient enemies.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 40,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'sulfur',
        materialName: 'Sulfur',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'skunk_gland',
        materialName: 'Skunk Gland',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'clay',
        materialName: 'Clay',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'stink_bomb',
      itemName: 'Sulfur Stink Bomb',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 140,
    difficulty: 38,
    xpGain: 68,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'tactical', 'debuff']
  },
  {
    id: 'alc_laudanum',
    name: 'Laudanum',
    description: 'Opium-based tincture for severe pain. Highly addictive if overused.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 43,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'opium_poppy',
        materialName: 'Opium Poppy',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'alcohol',
        materialName: 'Alcohol',
        category: MaterialCategory.ALCOHOL,
        quantity: 3
      },
      {
        materialId: 'sage',
        materialName: 'Sage',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'laudanum',
      itemName: 'Laudanum',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 200,
    difficulty: 48,
    xpGain: 85,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'medicine', 'pain', 'addictive']
  },
  {
    id: 'alc_acid_vial',
    name: 'Corrosive Acid Vial',
    description: 'Powerful acid that dissolves metal and flesh. Used for locks or combat.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 45,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'sulfuric_compound',
        materialName: 'Sulfuric Compound',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'nitric_salt',
        materialName: 'Nitric Salt',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'glass_vial',
        materialName: 'Glass Vial',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'acid_vial',
      itemName: 'Corrosive Acid Vial',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 180,
    difficulty: 50,
    xpGain: 88,
    learningSource: RecipeSource.DISCOVERY,
    discoveryChance: 0.1,
    category: 'weapon',
    tags: ['journeyman', 'acid', 'utility']
  },
  {
    id: 'alc_endurance_elixir',
    name: 'Endurance Elixir',
    description: 'Grants incredible stamina for extended physical exertion.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 47,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'ginseng',
        materialName: 'Ginseng',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'buffalo_heart',
        materialName: 'Buffalo Heart',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'iron_shavings',
        materialName: 'Iron Shavings',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'endurance_elixir',
      itemName: 'Endurance Elixir',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 220,
    difficulty: 52,
    xpGain: 92,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['journeyman', 'buff', 'stamina']
  },
  {
    id: 'alc_flash_powder',
    name: 'Flash Powder',
    description: 'Blindingly bright explosive powder. Perfect for distractions or escapes.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 49,
      minTier: CraftingSkillTier.JOURNEYMAN
    },
    materials: [
      {
        materialId: 'magnesium',
        materialName: 'Magnesium Powder',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'saltpeter',
        materialName: 'Saltpeter',
        category: MaterialCategory.MINERAL,
        quantity: 2
      },
      {
        materialId: 'aluminum_dust',
        materialName: 'Aluminum Dust',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'flash_powder',
      itemName: 'Flash Powder',
      baseQuantity: 4,
      qualityAffectsStats: true
    },
    baseCraftTime: 150,
    difficulty: 46,
    xpGain: 82,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['journeyman', 'tactical', 'blind']
  },

  // -------------------------------------------------------------------------
  // EXPERT TIER ADDITIONS (Level 51-70) - 7 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_nitroglycerin',
    name: 'Nitroglycerin',
    description: 'Extremely volatile explosive liquid. Handle with utmost care.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 52,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 2
      }
    },
    materials: [
      {
        materialId: 'glycerin',
        materialName: 'Glycerin',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'nitric_acid',
        materialName: 'Nitric Acid',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'sulfuric_acid',
        materialName: 'Sulfuric Acid',
        category: MaterialCategory.MINERAL,
        quantity: 2
      }
    ],
    output: {
      itemId: 'nitroglycerin',
      itemName: 'Nitroglycerin',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 62,
    xpGain: 125,
    learningSource: RecipeSource.TRAINER,
    category: 'material',
    tags: ['expert', 'explosive', 'volatile'],
    specialNotes: 'Explodes if dropped. Handle with care.'
  },
  {
    id: 'alc_dynamite_stick',
    name: 'Dynamite Stick',
    description: 'Stable explosive with reliable detonation. The prospector\'s best friend.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 54,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'nitroglycerin',
        materialName: 'Nitroglycerin',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'diatomaceous_earth',
        materialName: 'Diatomaceous Earth',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'paper',
        materialName: 'Heavy Paper',
        category: MaterialCategory.FABRIC,
        quantity: 2
      },
      {
        materialId: 'fuse',
        materialName: 'Blasting Fuse',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'dynamite_stick',
      itemName: 'Dynamite Stick',
      baseQuantity: 3,
      qualityAffectsStats: true
    },
    baseCraftTime: 240,
    difficulty: 58,
    xpGain: 115,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'explosive', 'demolition']
  },
  {
    id: 'alc_ironhide_potion',
    name: 'Ironhide Potion',
    description: 'Hardens skin to resist damage. Makes you tough as iron for a short time.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 57,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'iron_ore',
        materialName: 'Iron Ore',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'armadillo_shell',
        materialName: 'Armadillo Shell',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      },
      {
        materialId: 'earth_essence',
        materialName: 'Earth Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'ironhide_potion',
      itemName: 'Ironhide Potion',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 64,
    xpGain: 135,
    learningSource: RecipeSource.TRAINER,
    category: 'consumable',
    tags: ['expert', 'buff', 'defense']
  },
  {
    id: 'alc_greek_fire',
    name: 'Greek Fire',
    description: 'Ancient incendiary that burns even on water. Devastating in combat.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 60,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'naphtha',
        materialName: 'Naphtha',
        category: MaterialCategory.MINERAL,
        quantity: 4
      },
      {
        materialId: 'quickite',
        materialName: 'Quickite',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'sulfur',
        materialName: 'Sulfur',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'pine_resin',
        materialName: 'Pine Resin',
        category: MaterialCategory.HERB,
        quantity: 2
      }
    ],
    output: {
      itemId: 'greek_fire',
      itemName: 'Greek Fire',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 320,
    difficulty: 68,
    xpGain: 145,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['expert', 'fire', 'incendiary']
  },
  {
    id: 'alc_universal_antidote',
    name: 'Universal Antidote',
    description: 'Cures all known poisons and venoms. A master healer\'s creation.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 63,
      minTier: CraftingSkillTier.EXPERT,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 3
      }
    },
    materials: [
      {
        materialId: 'snake_venom',
        materialName: 'Snake Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      },
      {
        materialId: 'scorpion_venom',
        materialName: 'Scorpion Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 3
      },
      {
        materialId: 'ginseng',
        materialName: 'Ginseng',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'phoenix_ash',
        materialName: 'Phoenix Ash',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'universal_antidote',
      itemName: 'Universal Antidote',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 350,
    difficulty: 70,
    xpGain: 155,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['expert', 'antidote', 'medicine', 'rare']
  },
  {
    id: 'alc_berserker_poison',
    name: 'Madness Poison',
    description: 'Causes the victim to attack friend and foe alike in blind rage.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 66,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'peyote',
        materialName: 'Peyote',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'rage_root',
        materialName: 'Rage Root',
        category: MaterialCategory.HERB,
        quantity: 3
      },
      {
        materialId: 'spider_venom',
        materialName: 'Black Widow Venom',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'madness_poison',
      itemName: 'Madness Poison',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 300,
    difficulty: 66,
    xpGain: 140,
    learningSource: RecipeSource.REPUTATION,
    category: 'weapon',
    tags: ['expert', 'poison', 'mind', 'illegal']
  },
  {
    id: 'alc_incendiary_bomb',
    name: 'Incendiary Bomb',
    description: 'Explosive that spreads fire over a wide area. Used in sieges and raids.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 69,
      minTier: CraftingSkillTier.EXPERT
    },
    materials: [
      {
        materialId: 'greek_fire',
        materialName: 'Greek Fire',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'gunpowder',
        materialName: 'Gunpowder',
        category: MaterialCategory.GUNPOWDER,
        quantity: 4
      },
      {
        materialId: 'metal_casing',
        materialName: 'Metal Casing',
        category: MaterialCategory.GUN_PART,
        quantity: 1
      }
    ],
    output: {
      itemId: 'incendiary_bomb',
      itemName: 'Incendiary Bomb',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 280,
    difficulty: 68,
    xpGain: 150,
    learningSource: RecipeSource.TRAINER,
    category: 'weapon',
    tags: ['expert', 'explosive', 'fire']
  },

  // -------------------------------------------------------------------------
  // MASTER TIER ADDITIONS (Level 71-90) - 6 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_werewolf_bane',
    name: 'Werewolf Bane',
    description: 'Silver-infused poison deadly to werewolves and other lycanthropes.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 72,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'silver_dust',
        materialName: 'Silver Dust',
        category: MaterialCategory.MINERAL,
        quantity: 5
      },
      {
        materialId: 'wolfsbane',
        materialName: 'Wolfsbane',
        category: MaterialCategory.HERB,
        quantity: 4
      },
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'werewolf_bane',
      itemName: 'Werewolf Bane',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 400,
    difficulty: 78,
    xpGain: 190,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['master', 'supernatural', 'poison', 'silver']
  },
  {
    id: 'alc_vampire_cure',
    name: 'Vampire Cure',
    description: 'Reverses vampirism if administered within three days of infection.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 76,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'garlic_essence',
        materialName: 'Garlic Essence',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'sunlight_essence',
        materialName: 'Bottled Sunlight',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'vampire_blood',
        materialName: 'Vampire Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 1
      }
    ],
    output: {
      itemId: 'vampire_cure',
      itemName: 'Vampire Cure',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 500,
    difficulty: 85,
    xpGain: 240,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'consumable',
    tags: ['master', 'supernatural', 'cure', 'vampire']
  },
  {
    id: 'alc_ghost_oil',
    name: 'Specter Oil',
    description: 'Allows weapons to harm incorporeal beings like ghosts and spirits.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 78,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'ectoplasm',
        materialName: 'Ectoplasm',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'spirit_essence',
        materialName: 'Spirit Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'sage',
        materialName: 'Sage',
        category: MaterialCategory.HERB,
        quantity: 4
      }
    ],
    output: {
      itemId: 'specter_oil',
      itemName: 'Specter Oil',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 420,
    difficulty: 82,
    xpGain: 220,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['master', 'supernatural', 'oil', 'ghost']
  },
  {
    id: 'alc_time_slow_potion',
    name: 'Time Dilation Potion',
    description: 'Speeds up the user\'s perception, making the world seem to slow down.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 82,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'time_essence',
        materialName: 'Essence of Time',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'hummingbird_heart',
        materialName: 'Hummingbird Heart',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 5
      },
      {
        materialId: 'quicksilver',
        materialName: 'Quicksilver',
        category: MaterialCategory.MINERAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'time_dilation_potion',
      itemName: 'Time Dilation Potion',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 480,
    difficulty: 88,
    xpGain: 270,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['master', 'time', 'buff', 'magical'],
    specialNotes: '+50% action speed for 30 seconds'
  },
  {
    id: 'alc_devils_breath',
    name: 'Devil\'s Breath',
    description: 'Rare poison that makes victims completely susceptible to commands.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 86,
      minTier: CraftingSkillTier.MASTER
    },
    materials: [
      {
        materialId: 'angel_trumpet',
        materialName: 'Angel Trumpet Flower',
        category: MaterialCategory.HERB,
        quantity: 6
      },
      {
        materialId: 'demon_blood',
        materialName: 'Demon Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'peyote',
        materialName: 'Peyote',
        category: MaterialCategory.HERB,
        quantity: 3
      }
    ],
    output: {
      itemId: 'devils_breath',
      itemName: 'Devil\'s Breath',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 450,
    difficulty: 90,
    xpGain: 290,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['master', 'poison', 'mind', 'illegal', 'dark']
  },
  {
    id: 'alc_regeneration_elixir',
    name: 'Regeneration Elixir',
    description: 'Grants rapid healing over time. Can regrow minor lost body parts.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 89,
      minTier: CraftingSkillTier.MASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 4
      }
    },
    materials: [
      {
        materialId: 'troll_blood',
        materialName: 'Troll Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'life_root',
        materialName: 'Life Root',
        category: MaterialCategory.HERB,
        quantity: 6
      },
      {
        materialId: 'phoenix_ash',
        materialName: 'Phoenix Ash',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'regeneration_elixir',
      itemName: 'Regeneration Elixir',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 540,
    difficulty: 92,
    xpGain: 310,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['master', 'healing', 'regeneration', 'rare']
  },

  // -------------------------------------------------------------------------
  // GRANDMASTER TIER ADDITIONS (Level 91-100) - 5 New Recipes
  // -------------------------------------------------------------------------
  {
    id: 'alc_holy_water_blessed',
    name: 'Sanctified Holy Water',
    description: 'The purest holy water, blessed by the highest clergy. Devastates the unholy.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 92,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'holy_water',
        materialName: 'Holy Water',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'angel_tears',
        materialName: 'Angel Tears',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'silver_dust',
        materialName: 'Silver Dust',
        category: MaterialCategory.MINERAL,
        quantity: 3
      },
      {
        materialId: 'sunlight_essence',
        materialName: 'Bottled Sunlight',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'sanctified_holy_water',
      itemName: 'Sanctified Holy Water',
      baseQuantity: 2,
      qualityAffectsStats: true
    },
    baseCraftTime: 600,
    difficulty: 95,
    xpGain: 400,
    learningSource: RecipeSource.QUEST_REWARD,
    category: 'weapon',
    tags: ['grandmaster', 'holy', 'supernatural', 'blessed']
  },
  {
    id: 'alc_spirit_communion_potion',
    name: 'Spirit Communion Potion',
    description: 'Allows communication with the dead. See and speak with departed souls.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 93,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'ectoplasm',
        materialName: 'Ectoplasm',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'peyote',
        materialName: 'Peyote',
        category: MaterialCategory.HERB,
        quantity: 5
      },
      {
        materialId: 'death_essence',
        materialName: 'Essence of Death',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'grave_dirt',
        materialName: 'Grave Dirt',
        category: MaterialCategory.MINERAL,
        quantity: 3
      }
    ],
    output: {
      itemId: 'spirit_communion_potion',
      itemName: 'Spirit Communion Potion',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 720,
    difficulty: 96,
    xpGain: 450,
    learningSource: RecipeSource.REPUTATION,
    category: 'consumable',
    tags: ['grandmaster', 'supernatural', 'spirit', 'death']
  },
  {
    id: 'alc_cursed_elixir',
    name: 'Cursed Elixir of Misfortune',
    description: 'Brings terrible luck to whoever drinks it. Accidents follow them everywhere.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 95,
      minTier: CraftingSkillTier.GRANDMASTER
    },
    materials: [
      {
        materialId: 'demon_blood',
        materialName: 'Demon Blood',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 4
      },
      {
        materialId: 'black_cat_bone',
        materialName: 'Black Cat Bone',
        category: MaterialCategory.ANIMAL_PART,
        quantity: 1
      },
      {
        materialId: 'broken_mirror',
        materialName: 'Broken Mirror Shards',
        category: MaterialCategory.MINERAL,
        quantity: 7
      },
      {
        materialId: 'curse_essence',
        materialName: 'Essence of Curse',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'cursed_elixir',
      itemName: 'Cursed Elixir of Misfortune',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 800,
    difficulty: 98,
    xpGain: 550,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['grandmaster', 'curse', 'dark', 'illegal'],
    specialNotes: '-50% luck for 24 hours. Critical failures become common.'
  },
  {
    id: 'alc_phoenix_rebirth',
    name: 'Phoenix Rebirth Elixir',
    description: 'Automatically resurrects the drinker upon death. One-time protection.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 98,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'phoenix_feather',
        materialName: 'Phoenix Feather',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'phoenix_ash',
        materialName: 'Phoenix Ash',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 5
      },
      {
        materialId: 'eternal_flame',
        materialName: 'Eternal Flame Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      },
      {
        materialId: 'life_crystal',
        materialName: 'Life Crystal',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 2
      }
    ],
    output: {
      itemId: 'phoenix_rebirth_elixir',
      itemName: 'Phoenix Rebirth Elixir',
      baseQuantity: 1,
      qualityAffectsStats: false
    },
    baseCraftTime: 1200,
    difficulty: 100,
    xpGain: 700,
    learningSource: RecipeSource.ACHIEVEMENT,
    category: 'consumable',
    tags: ['grandmaster', 'legendary', 'resurrection', 'phoenix'],
    specialNotes: 'Upon death, resurrect with 50% health. Effect consumed on use.'
  },
  {
    id: 'alc_apocalypse_bomb',
    name: 'Doomsday Explosive',
    description: 'The ultimate destructive force. Can level an entire town. Banned everywhere.',
    professionId: ProfessionId.ALCHEMY,
    requirements: {
      professionId: ProfessionId.ALCHEMY,
      minLevel: 100,
      minTier: CraftingSkillTier.GRANDMASTER,
      facility: {
        type: CraftingFacilityType.DISTILLERY,
        tier: 5
      }
    },
    materials: [
      {
        materialId: 'uranium_ore',
        materialName: 'Enriched Uranium',
        category: MaterialCategory.MINERAL,
        quantity: 15
      },
      {
        materialId: 'nitroglycerin',
        materialName: 'Nitroglycerin',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 10
      },
      {
        materialId: 'hellfire_essence',
        materialName: 'Hellfire Essence',
        category: MaterialCategory.RARE_REAGENT,
        quantity: 3
      },
      {
        materialId: 'containment_vessel',
        materialName: 'Containment Vessel',
        category: MaterialCategory.GUN_PART,
        quantity: 2
      }
    ],
    output: {
      itemId: 'doomsday_explosive',
      itemName: 'Doomsday Explosive',
      baseQuantity: 1,
      qualityAffectsStats: true
    },
    baseCraftTime: 2400,
    difficulty: 100,
    xpGain: 1000,
    learningSource: RecipeSource.WORLD_DROP,
    category: 'weapon',
    tags: ['grandmaster', 'explosive', 'mass-destruction', 'legendary', 'illegal'],
    specialNotes: 'Destroys everything in massive radius. Triggers maximum wanted level.'
  }
];

export default alchemyRecipes;
