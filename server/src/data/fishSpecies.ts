/**
 * Fish Species Data
 *
 * Complete definitions for all fish species in Desperados Destiny
 */

import {
  FishSpecies,
  FishRarity,
  FishCategory,
  WaterType,
  FishingTimeOfDay,
  FishingWeather,
  SpotType,
  BaitType,
  LureType
} from '@desperados/shared';

/**
 * All fish species in the game
 */
export const FISH_SPECIES: Record<string, FishSpecies> = {
  // ==================== COMMON FISH ====================

  CATFISH: {
    id: 'CATFISH',
    name: 'Catfish',
    scientificName: 'Ictalurus punctatus',
    rarity: FishRarity.COMMON,
    category: FishCategory.CATFISH,
    description: 'A bottom-dwelling whisker fish. Common in muddy waters.',
    waterTypes: [WaterType.RIVER, WaterType.LAKE, WaterType.POND],
    locations: ['red_gulch_creek', 'coyote_river', 'rio_frontera'],
    activeTimeOfDay: [FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT, FishingTimeOfDay.DAWN],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN],
    depthPreference: [SpotType.BOTTOM, SpotType.DEEP],
    minWeight: 2,
    maxWeight: 15,
    averageWeight: 6,
    recordWeight: 15,
    baseChance: 25,
    biteSpeed: 3000,
    hookDifficulty: 20,
    baseFightTime: 30,
    fightDifficulty: 25,
    stamina: 40,
    aggression: 30,
    preferredBait: [BaitType.WORMS, BaitType.CUT_BAIT, BaitType.CRAWFISH],
    preferredLures: [],
    baseValue: 8,
    experience: 15,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 2] },
      { itemId: 'fish_bones', chance: 0.5, quantity: [1, 1] }
    ]
  },

  BLUEGILL: {
    id: 'BLUEGILL',
    name: 'Bluegill',
    scientificName: 'Lepomis macrochirus',
    rarity: FishRarity.COMMON,
    category: FishCategory.PANFISH,
    description: 'A small panfish with blue-tinted gills. Easy to catch and good eating.',
    waterTypes: [WaterType.POND, WaterType.LAKE],
    locations: ['spirit_springs_lake', 'longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.SHALLOW, SpotType.STRUCTURE],
    minWeight: 0.5,
    maxWeight: 2,
    averageWeight: 0.8,
    recordWeight: 2,
    baseChance: 35,
    biteSpeed: 2000,
    hookDifficulty: 15,
    baseFightTime: 15,
    fightDifficulty: 15,
    stamina: 25,
    aggression: 20,
    preferredBait: [BaitType.WORMS, BaitType.INSECTS],
    preferredLures: [LureType.FLY_LURE, LureType.JIG],
    baseValue: 5,
    experience: 10,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 1] }
    ]
  },

  LARGEMOUTH_BASS: {
    id: 'LARGEMOUTH_BASS',
    name: 'Largemouth Bass',
    scientificName: 'Micropterus salmoides',
    rarity: FishRarity.COMMON,
    category: FishCategory.BASS,
    description: 'Popular sport fish with a big mouth and fighting spirit.',
    waterTypes: [WaterType.LAKE, WaterType.POND, WaterType.RIVER],
    locations: ['red_gulch_creek', 'spirit_springs_lake', 'longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK, FishingTimeOfDay.MORNING],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.STRUCTURE, SpotType.SHALLOW, SpotType.DEEP],
    minWeight: 1,
    maxWeight: 10,
    averageWeight: 4,
    recordWeight: 10,
    baseChance: 20,
    biteSpeed: 2500,
    hookDifficulty: 30,
    baseFightTime: 45,
    fightDifficulty: 35,
    stamina: 50,
    aggression: 60,
    preferredBait: [BaitType.MINNOWS, BaitType.WORMS, BaitType.CRAWFISH],
    preferredLures: [LureType.SPOON_LURE, LureType.PLUG, LureType.JIG],
    baseValue: 12,
    experience: 25,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [2, 3] },
      { itemId: 'bass_scale', chance: 0.3, quantity: [1, 2] }
    ]
  },

  SMALLMOUTH_BASS: {
    id: 'SMALLMOUTH_BASS',
    name: 'Smallmouth Bass',
    scientificName: 'Micropterus dolomieu',
    rarity: FishRarity.COMMON,
    category: FishCategory.BASS,
    description: 'A scrappy fighter found in cooler, clearer waters.',
    waterTypes: [WaterType.RIVER, WaterType.STREAM],
    locations: ['coyote_river', 'mountain_lake'],
    activeTimeOfDay: [FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.STRUCTURE, SpotType.DEEP],
    minWeight: 0.5,
    maxWeight: 6,
    averageWeight: 2.5,
    recordWeight: 6,
    baseChance: 18,
    biteSpeed: 2000,
    hookDifficulty: 35,
    baseFightTime: 40,
    fightDifficulty: 40,
    stamina: 55,
    aggression: 70,
    preferredBait: [BaitType.MINNOWS, BaitType.CRAWFISH],
    preferredLures: [LureType.SPOON_LURE, LureType.JIG],
    baseValue: 14,
    experience: 30,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [2, 2] },
      { itemId: 'bass_scale', chance: 0.4, quantity: [1, 2] }
    ]
  },

  CRAPPIE: {
    id: 'CRAPPIE',
    name: 'Crappie',
    scientificName: 'Pomoxis nigromaculatus',
    rarity: FishRarity.COMMON,
    category: FishCategory.PANFISH,
    description: 'Schooling panfish known for excellent flavor. Find one, find many.',
    waterTypes: [WaterType.LAKE, WaterType.POND],
    locations: ['longhorn_reservoir', 'spirit_springs_lake'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 0.5,
    maxWeight: 3,
    averageWeight: 1,
    recordWeight: 3,
    baseChance: 30,
    biteSpeed: 2500,
    hookDifficulty: 20,
    baseFightTime: 20,
    fightDifficulty: 20,
    stamina: 30,
    aggression: 25,
    preferredBait: [BaitType.MINNOWS, BaitType.INSECTS],
    preferredLures: [LureType.JIG, LureType.FLY_LURE],
    baseValue: 7,
    experience: 12,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 2] }
    ]
  },

  PERCH: {
    id: 'PERCH',
    name: 'Perch',
    scientificName: 'Perca flavescens',
    rarity: FishRarity.COMMON,
    category: FishCategory.PANFISH,
    description: 'Small but abundant yellow-striped fish.',
    waterTypes: [WaterType.LAKE, WaterType.RIVER],
    locations: ['coyote_river', 'longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 0.3,
    maxWeight: 1.5,
    averageWeight: 0.6,
    recordWeight: 1.5,
    baseChance: 32,
    biteSpeed: 2000,
    hookDifficulty: 15,
    baseFightTime: 15,
    fightDifficulty: 18,
    stamina: 28,
    aggression: 30,
    preferredBait: [BaitType.WORMS, BaitType.MINNOWS, BaitType.INSECTS],
    preferredLures: [LureType.JIG],
    baseValue: 6,
    experience: 10,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 1] }
    ]
  },

  SUNFISH: {
    id: 'SUNFISH',
    name: 'Sunfish',
    scientificName: 'Lepomis gibbosus',
    rarity: FishRarity.COMMON,
    category: FishCategory.PANFISH,
    description: 'Colorful little fish that practically jump on the hook.',
    waterTypes: [WaterType.POND, WaterType.LAKE],
    locations: ['spirit_springs_lake', 'longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON],
    preferredWeather: [FishingWeather.CLEAR],
    depthPreference: [SpotType.SHALLOW, SpotType.SURFACE],
    minWeight: 0.2,
    maxWeight: 1,
    averageWeight: 0.4,
    recordWeight: 1,
    baseChance: 40,
    biteSpeed: 1500,
    hookDifficulty: 10,
    baseFightTime: 10,
    fightDifficulty: 12,
    stamina: 20,
    aggression: 15,
    preferredBait: [BaitType.WORMS, BaitType.INSECTS],
    preferredLures: [LureType.FLY_LURE],
    baseValue: 5,
    experience: 8,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 1] }
    ]
  },

  // ==================== QUALITY FISH ====================

  RAINBOW_TROUT: {
    id: 'RAINBOW_TROUT',
    name: 'Rainbow Trout',
    scientificName: 'Oncorhynchus mykiss',
    rarity: FishRarity.QUALITY,
    category: FishCategory.TROUT,
    description: 'Beautiful cold-water fish with rainbow stripes. Acrobatic fighter.',
    waterTypes: [WaterType.STREAM, WaterType.RIVER, WaterType.LAKE],
    locations: ['mountain_lake', 'coyote_river'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK, FishingTimeOfDay.MORNING],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN],
    depthPreference: [SpotType.SURFACE, SpotType.STRUCTURE],
    minWeight: 1,
    maxWeight: 8,
    averageWeight: 3,
    recordWeight: 8,
    baseChance: 15,
    biteSpeed: 2000,
    hookDifficulty: 40,
    baseFightTime: 50,
    fightDifficulty: 45,
    stamina: 60,
    aggression: 75,
    preferredBait: [BaitType.INSECTS, BaitType.WORMS],
    preferredLures: [LureType.FLY_LURE, LureType.SPOON_LURE],
    baseValue: 25,
    experience: 45,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [2, 3] },
      { itemId: 'trout_roe', chance: 0.3, quantity: [1, 2] },
      { itemId: 'fish_oil', chance: 0.2, quantity: [1, 1] }
    ]
  },

  BROWN_TROUT: {
    id: 'BROWN_TROUT',
    name: 'Brown Trout',
    scientificName: 'Salmo trutta',
    rarity: FishRarity.QUALITY,
    category: FishCategory.TROUT,
    description: 'Wary and challenging trout. Smart fish that tests your skill.',
    waterTypes: [WaterType.STREAM, WaterType.RIVER],
    locations: ['coyote_river', 'mountain_lake'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN, FishingWeather.FOG],
    depthPreference: [SpotType.STRUCTURE, SpotType.DEEP],
    minWeight: 1,
    maxWeight: 12,
    averageWeight: 4,
    recordWeight: 12,
    baseChance: 12,
    biteSpeed: 1800,
    hookDifficulty: 50,
    baseFightTime: 60,
    fightDifficulty: 55,
    stamina: 70,
    aggression: 65,
    preferredBait: [BaitType.INSECTS, BaitType.MINNOWS],
    preferredLures: [LureType.FLY_LURE, LureType.SPOON_LURE],
    baseValue: 35,
    experience: 60,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [2, 4] },
      { itemId: 'trout_roe', chance: 0.4, quantity: [1, 3] },
      { itemId: 'fish_oil', chance: 0.3, quantity: [1, 2] }
    ]
  },

  BROOK_TROUT: {
    id: 'BROOK_TROUT',
    name: 'Brook Trout',
    scientificName: 'Salvelinus fontinalis',
    rarity: FishRarity.QUALITY,
    category: FishCategory.TROUT,
    description: 'Native to mountain streams. Delicate and beautiful.',
    waterTypes: [WaterType.STREAM],
    locations: ['mountain_lake'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.MORNING],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.SHALLOW, SpotType.STRUCTURE],
    minWeight: 0.5,
    maxWeight: 5,
    averageWeight: 1.5,
    recordWeight: 5,
    baseChance: 14,
    biteSpeed: 2000,
    hookDifficulty: 38,
    baseFightTime: 40,
    fightDifficulty: 40,
    stamina: 50,
    aggression: 60,
    preferredBait: [BaitType.INSECTS, BaitType.WORMS],
    preferredLures: [LureType.FLY_LURE],
    baseValue: 28,
    experience: 50,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 2] },
      { itemId: 'trout_roe', chance: 0.35, quantity: [1, 2] }
    ]
  },

  WALLEYE: {
    id: 'WALLEYE',
    name: 'Walleye',
    scientificName: 'Sander vitreus',
    rarity: FishRarity.QUALITY,
    category: FishCategory.PIKE,
    description: 'Night feeder with excellent table quality. Prized by anglers.',
    waterTypes: [WaterType.LAKE, WaterType.RIVER],
    locations: ['longhorn_reservoir', 'coyote_river'],
    activeTimeOfDay: [FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT, FishingTimeOfDay.DAWN],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN, FishingWeather.FOG],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 2,
    maxWeight: 15,
    averageWeight: 5,
    recordWeight: 15,
    baseChance: 10,
    biteSpeed: 2500,
    hookDifficulty: 45,
    baseFightTime: 55,
    fightDifficulty: 50,
    stamina: 65,
    aggression: 55,
    preferredBait: [BaitType.MINNOWS, BaitType.CRAWFISH],
    preferredLures: [LureType.JIG, LureType.PLUG],
    baseValue: 42,
    experience: 70,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [3, 4] },
      { itemId: 'fish_oil', chance: 0.4, quantity: [1, 2] }
    ]
  },

  PIKE: {
    id: 'PIKE',
    name: 'Northern Pike',
    scientificName: 'Esox lucius',
    rarity: FishRarity.QUALITY,
    category: FishCategory.PIKE,
    description: 'Aggressive predator with sharp teeth. Strong fighter.',
    waterTypes: [WaterType.LAKE, WaterType.RIVER],
    locations: ['longhorn_reservoir', 'coyote_river'],
    activeTimeOfDay: [FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.STRUCTURE, SpotType.DEEP, SpotType.SHALLOW],
    minWeight: 3,
    maxWeight: 25,
    averageWeight: 8,
    recordWeight: 25,
    baseChance: 8,
    biteSpeed: 1500,
    hookDifficulty: 50,
    baseFightTime: 70,
    fightDifficulty: 60,
    stamina: 80,
    aggression: 85,
    preferredBait: [BaitType.MINNOWS],
    preferredLures: [LureType.SPOON_LURE, LureType.PLUG],
    baseValue: 48,
    experience: 85,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [3, 5] },
      { itemId: 'pike_tooth', chance: 0.5, quantity: [1, 3] },
      { itemId: 'fish_oil', chance: 0.3, quantity: [1, 2] }
    ]
  },

  MUSKIE: {
    id: 'MUSKIE',
    name: 'Muskellunge',
    scientificName: 'Esox masquinongy',
    rarity: FishRarity.QUALITY,
    category: FishCategory.PIKE,
    description: 'Trophy fish. Massive predator that fights like the devil.',
    waterTypes: [WaterType.LAKE, WaterType.RIVER],
    locations: ['longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.FOG],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 10,
    maxWeight: 50,
    averageWeight: 20,
    recordWeight: 50,
    baseChance: 5,
    biteSpeed: 2000,
    hookDifficulty: 60,
    baseFightTime: 90,
    fightDifficulty: 70,
    stamina: 100,
    aggression: 90,
    preferredBait: [BaitType.MINNOWS, BaitType.SPECIAL_BAIT],
    preferredLures: [LureType.PLUG, LureType.SPOON_LURE],
    baseValue: 85,
    experience: 120,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [5, 8] },
      { itemId: 'pike_tooth', chance: 0.7, quantity: [2, 5] },
      { itemId: 'trophy_scale', chance: 0.4, quantity: [1, 2] }
    ]
  },

  CHANNEL_CATFISH: {
    id: 'CHANNEL_CATFISH',
    name: 'Channel Catfish',
    scientificName: 'Ictalurus punctatus',
    rarity: FishRarity.QUALITY,
    category: FishCategory.CATFISH,
    description: 'Large, strong catfish. Puts up a serious fight.',
    waterTypes: [WaterType.RIVER, WaterType.LAKE],
    locations: ['rio_frontera', 'coyote_river'],
    activeTimeOfDay: [FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN, FishingWeather.STORM],
    depthPreference: [SpotType.BOTTOM, SpotType.DEEP],
    minWeight: 5,
    maxWeight: 30,
    averageWeight: 12,
    recordWeight: 30,
    baseChance: 10,
    biteSpeed: 3500,
    hookDifficulty: 35,
    baseFightTime: 65,
    fightDifficulty: 48,
    stamina: 75,
    aggression: 50,
    preferredBait: [BaitType.CUT_BAIT, BaitType.CRAWFISH, BaitType.SPECIAL_BAIT],
    preferredLures: [],
    baseValue: 38,
    experience: 65,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [3, 5] },
      { itemId: 'fish_bones', chance: 0.6, quantity: [2, 3] }
    ]
  },

  // ==================== RARE FISH ====================

  GOLDEN_TROUT: {
    id: 'GOLDEN_TROUT',
    name: 'Golden Trout',
    scientificName: 'Oncorhynchus aguabonita',
    rarity: FishRarity.RARE,
    category: FishCategory.TROUT,
    description: 'Rare high-altitude trout with golden coloring. Found in the clearest mountain waters.',
    lore: 'Native legends say this fish swam in sacred pools before the white man came.',
    waterTypes: [WaterType.STREAM, WaterType.LAKE],
    locations: ['mountain_lake', 'sacred_waters'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 1,
    maxWeight: 6,
    averageWeight: 2.5,
    recordWeight: 6,
    baseChance: 3,
    biteSpeed: 1500,
    hookDifficulty: 65,
    baseFightTime: 55,
    fightDifficulty: 60,
    stamina: 70,
    aggression: 70,
    preferredBait: [BaitType.INSECTS, BaitType.SPECIAL_BAIT],
    preferredLures: [LureType.FLY_LURE],
    baseValue: 120,
    experience: 150,
    requiresSpecialBait: false,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [2, 3] },
      { itemId: 'golden_scale', chance: 0.8, quantity: [1, 3] },
      { itemId: 'trout_roe', chance: 0.6, quantity: [2, 4] }
    ]
  },

  APACHE_TROUT: {
    id: 'APACHE_TROUT',
    name: 'Apache Trout',
    scientificName: 'Oncorhynchus apache',
    rarity: FishRarity.RARE,
    category: FishCategory.TROUT,
    description: 'Native trout found only in protected Coalition waters.',
    lore: 'The Nahi Coalition protects this sacred fish. Fishing requires their blessing.',
    waterTypes: [WaterType.STREAM],
    locations: ['sacred_waters'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.MORNING],
    preferredWeather: [FishingWeather.CLEAR],
    depthPreference: [SpotType.SHALLOW, SpotType.STRUCTURE],
    minWeight: 0.5,
    maxWeight: 4,
    averageWeight: 1.5,
    recordWeight: 4,
    baseChance: 4,
    biteSpeed: 1800,
    hookDifficulty: 60,
    baseFightTime: 45,
    fightDifficulty: 55,
    stamina: 65,
    aggression: 65,
    preferredBait: [BaitType.INSECTS],
    preferredLures: [LureType.FLY_LURE],
    baseValue: 150,
    experience: 175,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 2] },
      { itemId: 'sacred_scale', chance: 0.9, quantity: [1, 2] },
      { itemId: 'spirit_essence', chance: 0.3, quantity: [1, 1] }
    ]
  },

  STURGEON: {
    id: 'STURGEON',
    name: 'Sturgeon',
    scientificName: 'Acipenser transmontanus',
    rarity: FishRarity.RARE,
    category: FishCategory.STURGEON,
    description: 'Ancient armored fish. Living fossil that can weigh hundreds of pounds.',
    lore: 'Some sturgeon in these waters are older than the Territory itself.',
    waterTypes: [WaterType.RIVER],
    locations: ['rio_frontera', 'coyote_river'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN],
    depthPreference: [SpotType.BOTTOM, SpotType.DEEP],
    minWeight: 50,
    maxWeight: 200,
    averageWeight: 100,
    recordWeight: 200,
    baseChance: 2,
    biteSpeed: 4000,
    hookDifficulty: 70,
    baseFightTime: 120,
    fightDifficulty: 80,
    stamina: 150,
    aggression: 60,
    preferredBait: [BaitType.CUT_BAIT, BaitType.SPECIAL_BAIT],
    preferredLures: [],
    baseValue: 180,
    experience: 250,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [10, 15] },
      { itemId: 'sturgeon_roe', chance: 0.7, quantity: [3, 6] },
      { itemId: 'ancient_scale', chance: 0.5, quantity: [2, 4] },
      { itemId: 'fish_oil', chance: 0.6, quantity: [3, 5] }
    ]
  },

  PADDLEFISH: {
    id: 'PADDLEFISH',
    name: 'Paddlefish',
    scientificName: 'Polyodon spathula',
    rarity: FishRarity.RARE,
    category: FishCategory.STURGEON,
    description: 'Prehistoric fish with a bizarre paddle-shaped nose. Filter feeder.',
    lore: 'Older than the mountains. Some say they remember when spirits walked the earth.',
    waterTypes: [WaterType.RIVER, WaterType.LAKE],
    locations: ['rio_frontera', 'longhorn_reservoir'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.FOG],
    depthPreference: [SpotType.DEEP, SpotType.BOTTOM],
    minWeight: 30,
    maxWeight: 120,
    averageWeight: 60,
    recordWeight: 120,
    baseChance: 2.5,
    biteSpeed: 4000,
    hookDifficulty: 65,
    baseFightTime: 100,
    fightDifficulty: 75,
    stamina: 130,
    aggression: 55,
    preferredBait: [BaitType.SPECIAL_BAIT],
    preferredLures: [],
    baseValue: 160,
    experience: 220,
    requiresSpecialBait: true,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [8, 12] },
      { itemId: 'paddlefish_roe', chance: 0.8, quantity: [3, 5] },
      { itemId: 'ancient_scale', chance: 0.4, quantity: [1, 3] }
    ]
  },

  GAR: {
    id: 'GAR',
    name: 'Alligator Gar',
    scientificName: 'Atractosteus spatula',
    rarity: FishRarity.RARE,
    category: FishCategory.EXOTIC,
    description: 'Armor-plated predator with rows of needle teeth. Living dinosaur.',
    lore: 'Fronterans say El Diablo himself put these things in the river to punish fishermen.',
    waterTypes: [WaterType.RIVER],
    locations: ['rio_frontera'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.CLOUDY],
    depthPreference: [SpotType.DEEP, SpotType.STRUCTURE],
    minWeight: 20,
    maxWeight: 150,
    averageWeight: 60,
    recordWeight: 150,
    baseChance: 3,
    biteSpeed: 2000,
    hookDifficulty: 75,
    baseFightTime: 110,
    fightDifficulty: 85,
    stamina: 140,
    aggression: 95,
    preferredBait: [BaitType.CUT_BAIT, BaitType.MINNOWS],
    preferredLures: [],
    baseValue: 170,
    experience: 240,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [8, 12] },
      { itemId: 'gar_scale', chance: 0.9, quantity: [5, 8] },
      { itemId: 'gar_tooth', chance: 0.7, quantity: [3, 6] }
    ]
  },

  // ==================== LEGENDARY FISH ====================

  OLD_WHISKERS: {
    id: 'OLD_WHISKERS',
    name: 'Old Whiskers',
    scientificName: 'Ictalurus giganteus',
    rarity: FishRarity.LEGENDARY,
    category: FishCategory.CATFISH,
    description: 'The giant catfish of Spirit Springs. Said to be 50 years old and big as a man.',
    lore: 'Every angler in Sangre Territory has a story about Old Whiskers. Nobody has a photo. He\'s taken more fishing gear than the general store has sold. Some say he\'s unkillable - that the springs themselves protect him.',
    waterTypes: [WaterType.LAKE],
    locations: ['spirit_springs_lake'],
    activeTimeOfDay: [FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.STORM, FishingWeather.FOG],
    depthPreference: [SpotType.BOTTOM, SpotType.DEEP],
    minWeight: 80,
    maxWeight: 100,
    averageWeight: 90,
    recordWeight: 100,
    baseChance: 0.5,
    biteSpeed: 5000,
    hookDifficulty: 90,
    baseFightTime: 180,
    fightDifficulty: 95,
    stamina: 200,
    aggression: 80,
    preferredBait: [BaitType.SPECIAL_BAIT, BaitType.BLOOD_LURE],
    preferredLures: [],
    baseValue: 600,
    experience: 500,
    isLegendary: true,
    onePerLocation: true,
    requiresSpecialBait: true,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [15, 20] },
      { itemId: 'legendary_whisker', chance: 1.0, quantity: [1, 1] },
      { itemId: 'ancient_scale', chance: 0.8, quantity: [3, 5] },
      { itemId: 'fish_oil', chance: 0.9, quantity: [5, 8] }
    ]
  },

  THE_GHOST: {
    id: 'THE_GHOST',
    name: 'The Ghost',
    scientificName: 'Oncorhynchus albinus',
    rarity: FishRarity.RARE,
    category: FishCategory.TROUT,
    description: 'Pure white albino trout of Mountain Lake. Seen only in moonlight.',
    lore: 'Nahi shamans say The Ghost is a transformed spirit - a warrior who chose to remain in the sacred lake forever. To catch it is to earn great honor... or great curse.',
    waterTypes: [WaterType.LAKE],
    locations: ['mountain_lake'],
    activeTimeOfDay: [FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLEAR, FishingWeather.FOG],
    depthPreference: [SpotType.DEEP],
    minWeight: 12,
    maxWeight: 15,
    averageWeight: 13,
    recordWeight: 15,
    baseChance: 0.8,
    biteSpeed: 1000,
    hookDifficulty: 85,
    baseFightTime: 90,
    fightDifficulty: 88,
    stamina: 120,
    aggression: 90,
    preferredBait: [BaitType.SPIRIT_WORM, BaitType.SPECIAL_BAIT],
    preferredLures: [LureType.FLY_LURE],
    baseValue: 800,
    experience: 600,
    isLegendary: true,
    onePerLocation: true,
    requiresSpecialBait: true,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [5, 7] },
      { itemId: 'ghost_scale', chance: 1.0, quantity: [3, 5] },
      { itemId: 'spirit_essence', chance: 0.9, quantity: [2, 3] },
      { itemId: 'moonlight_pearl', chance: 0.5, quantity: [1, 1] }
    ]
  },

  RIVER_KING: {
    id: 'RIVER_KING',
    name: 'River King',
    scientificName: 'Micropterus maximus',
    rarity: FishRarity.LEGENDARY,
    category: FishCategory.BASS,
    description: 'Massive bass that rules Red Gulch Creek. Bigger than any bass has a right to be.',
    lore: 'Creek prospectors used to feed him their lunch scraps for luck. Now he\'s grown so big he could swallow a dog. Still likes cornbread, though.',
    waterTypes: [WaterType.RIVER],
    locations: ['red_gulch_creek'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.DUSK],
    preferredWeather: [FishingWeather.CLOUDY, FishingWeather.RAIN],
    depthPreference: [SpotType.STRUCTURE, SpotType.DEEP],
    minWeight: 18,
    maxWeight: 22,
    averageWeight: 20,
    recordWeight: 22,
    baseChance: 1.0,
    biteSpeed: 1500,
    hookDifficulty: 82,
    baseFightTime: 100,
    fightDifficulty: 85,
    stamina: 140,
    aggression: 95,
    preferredBait: [BaitType.MINNOWS, BaitType.CRAWFISH, BaitType.GOLDEN_GRUB],
    preferredLures: [LureType.PLUG, LureType.SPOON_LURE],
    baseValue: 1000,
    experience: 700,
    isLegendary: true,
    onePerLocation: true,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [8, 10] },
      { itemId: 'kings_scale', chance: 1.0, quantity: [1, 1] },
      { itemId: 'trophy_scale', chance: 0.9, quantity: [3, 5] }
    ]
  },

  EL_DIABLO: {
    id: 'EL_DIABLO',
    name: 'El Diablo',
    scientificName: 'Sanguis infernus',
    rarity: FishRarity.LEGENDARY,
    category: FishCategory.EXOTIC,
    description: 'Blood-red fish from The Scar\'s cursed waters. Not entirely natural.',
    lore: 'When the meteor struck and created The Scar, something changed in the waters. El Diablo appeared - a fish that glows red in darkness and seems to know your thoughts. Fronterans won\'t fish there anymore. They say El Diablo doesn\'t bite hooks - he chooses who to take.',
    waterTypes: [WaterType.SACRED],
    locations: ['the_scar_pool'],
    activeTimeOfDay: [FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.STORM, FishingWeather.FOG],
    depthPreference: [SpotType.DEEP, SpotType.BOTTOM],
    minWeight: 25,
    maxWeight: 30,
    averageWeight: 27,
    recordWeight: 30,
    baseChance: 0.3,
    biteSpeed: 800,
    hookDifficulty: 95,
    baseFightTime: 150,
    fightDifficulty: 98,
    stamina: 180,
    aggression: 100,
    preferredBait: [BaitType.BLOOD_LURE, BaitType.SPECIAL_BAIT],
    preferredLures: [],
    baseValue: 2000,
    experience: 1000,
    isLegendary: true,
    onePerLocation: true,
    requiresSpecialBait: true,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [10, 12] },
      { itemId: 'diablo_scale', chance: 1.0, quantity: [3, 5] },
      { itemId: 'cursed_essence', chance: 0.9, quantity: [2, 4] },
      { itemId: 'blood_crystal', chance: 0.6, quantity: [1, 2] }
    ]
  },

  // SPECIAL: Blind Cave Fish (Underground River)
  CAVE_BLINDFISH: {
    id: 'CAVE_BLINDFISH',
    name: 'Blind Cave Fish',
    scientificName: 'Amblyopsis spelaea',
    rarity: FishRarity.RARE,
    category: FishCategory.EXOTIC,
    description: 'Eyeless fish adapted to total darkness in underground waters.',
    lore: 'Found only in the deepest mine tunnels that broke through to underground rivers.',
    waterTypes: [WaterType.UNDERGROUND],
    locations: ['underground_river'],
    activeTimeOfDay: [FishingTimeOfDay.DAWN, FishingTimeOfDay.MORNING, FishingTimeOfDay.AFTERNOON, FishingTimeOfDay.DUSK, FishingTimeOfDay.NIGHT],
    preferredWeather: [FishingWeather.CLEAR], // Underground, weather doesn't matter
    depthPreference: [SpotType.DEEP, SpotType.BOTTOM],
    minWeight: 0.2,
    maxWeight: 0.8,
    averageWeight: 0.4,
    recordWeight: 0.8,
    baseChance: 8,
    biteSpeed: 3000,
    hookDifficulty: 25,
    baseFightTime: 20,
    fightDifficulty: 20,
    stamina: 25,
    aggression: 15,
    preferredBait: [BaitType.INSECTS, BaitType.WORMS],
    preferredLures: [],
    baseValue: 100,
    experience: 120,
    drops: [
      { itemId: 'fish_meat', chance: 1.0, quantity: [1, 1] },
      { itemId: 'cave_specimen', chance: 0.7, quantity: [1, 1] }
    ]
  }
};

/**
 * Get all fish species as array
 */
export function getAllFishSpecies(): FishSpecies[] {
  return Object.values(FISH_SPECIES);
}

/**
 * Get fish by ID
 */
export function getFishSpecies(fishId: string): FishSpecies | undefined {
  return FISH_SPECIES[fishId];
}

/**
 * Get fish by rarity
 */
export function getFishByRarity(rarity: FishRarity): FishSpecies[] {
  return getAllFishSpecies().filter(fish => fish.rarity === rarity);
}

/**
 * Get fish by location
 */
export function getFishByLocation(locationId: string): FishSpecies[] {
  return getAllFishSpecies().filter(fish => fish.locations.includes(locationId));
}

/**
 * Get legendary fish for a location
 */
export function getLegendaryFishForLocation(locationId: string): FishSpecies | undefined {
  return getAllFishSpecies().find(fish =>
    fish.isLegendary &&
    fish.locations.includes(locationId)
  );
}
