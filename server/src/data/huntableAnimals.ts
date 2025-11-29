/**
 * Huntable Animals Data - Phase 10, Wave 10.1
 *
 * Definitions for all huntable animals in Desperados Destiny
 */

import {
  AnimalDefinition,
  AnimalSpecies,
  AnimalSize,
  AnimalRarity,
  AnimalBehavior,
  HuntingWeapon,
  HarvestResourceType
} from '@desperados/shared';

/**
 * All huntable animals in the game
 */
export const HUNTABLE_ANIMALS: Record<AnimalSpecies, AnimalDefinition> = {
  // ========================================
  // SMALL GAME (Common)
  // ========================================

  [AnimalSpecies.RABBIT]: {
    species: AnimalSpecies.RABBIT,
    name: 'Rabbit',
    description: 'Common cottontail rabbit found throughout the frontier.',
    flavorText: 'Quick and skittish, but easy prey for a skilled hunter.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.DOCILE,

    health: 20,
    speed: 8,
    alertness: 9,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 3,
    killDifficulty: 2,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'rabbit_meat',
        name: 'Rabbit Meat',
        baseQuantity: 2,
        quantityVariation: 1,
        baseValue: 5,
        weight: 0.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'rabbit_pelt',
        name: 'Rabbit Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 3,
        weight: 0.2,
        successChance: 0.8
      }
    ],

    locations: ['RED_GULCH_PLAINS', 'LONGHORN_RANGE', 'SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.4,

    levelRequired: 1,
    xpReward: 10,
    canAttack: false
  },

  [AnimalSpecies.PRAIRIE_DOG]: {
    species: AnimalSpecies.PRAIRIE_DOG,
    name: 'Prairie Dog',
    description: 'Small burrowing rodent, considered a pest by ranchers.',
    flavorText: 'Their colonies dot the plains, always on alert.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 15,
    speed: 7,
    alertness: 10,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 1,
    stalkingDifficulty: 4,
    killDifficulty: 3,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'prairie_dog_meat',
        name: 'Prairie Dog Meat',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 2,
        weight: 0.3,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'prairie_dog_pelt',
        name: 'Prairie Dog Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 2,
        weight: 0.1,
        successChance: 0.7
      }
    ],

    locations: ['RED_GULCH_PLAINS', 'LONGHORN_RANGE'],
    spawnChance: 0.5,

    levelRequired: 1,
    xpReward: 8,
    canAttack: false
  },

  [AnimalSpecies.SQUIRREL]: {
    species: AnimalSpecies.SQUIRREL,
    name: 'Squirrel',
    description: 'Fast tree-dwelling rodent.',
    flavorText: 'Their erratic movements make them challenging targets.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 15,
    speed: 9,
    alertness: 10,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 5,
    killDifficulty: 4,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'squirrel_meat',
        name: 'Squirrel Meat',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 3,
        weight: 0.3,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'squirrel_pelt',
        name: 'Squirrel Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 2,
        weight: 0.1,
        successChance: 0.75
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'LONGHORN_RANGE'],
    spawnChance: 0.45,

    levelRequired: 1,
    xpReward: 12,
    canAttack: false
  },

  [AnimalSpecies.RACCOON]: {
    species: AnimalSpecies.RACCOON,
    name: 'Raccoon',
    description: 'Clever nocturnal scavenger with distinctive mask.',
    flavorText: 'More active at night, these bandits are opportunistic hunters.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 30,
    speed: 6,
    alertness: 7,
    aggression: 3,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 3,
    stalkingDifficulty: 4,
    killDifficulty: 3,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'raccoon_meat',
        name: 'Raccoon Meat',
        baseQuantity: 3,
        quantityVariation: 1,
        baseValue: 4,
        weight: 0.7,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'raccoon_pelt',
        name: 'Raccoon Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 8,
        weight: 0.4,
        successChance: 0.85
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'RED_GULCH_PLAINS'],
    spawnChance: 0.3,

    levelRequired: 2,
    xpReward: 15,
    canAttack: false
  },

  [AnimalSpecies.SKUNK]: {
    species: AnimalSpecies.SKUNK,
    name: 'Skunk',
    description: 'Black and white striped animal with defensive spray.',
    flavorText: 'Best killed from a distance - that spray will ruin your day.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 25,
    speed: 4,
    alertness: 6,
    aggression: 2,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 3,
    killDifficulty: 2,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'skunk_meat',
        name: 'Skunk Meat',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 3,
        weight: 0.5,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'skunk_pelt',
        name: 'Skunk Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 10,
        weight: 0.3,
        successChance: 0.8
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'THE_WASTES'],
    spawnChance: 0.25,

    levelRequired: 1,
    xpReward: 12,
    canAttack: false
  },

  [AnimalSpecies.OPOSSUM]: {
    species: AnimalSpecies.OPOSSUM,
    name: 'Opossum',
    description: 'Nocturnal marsupial known for playing dead.',
    flavorText: 'They may look dead, but make sure before approaching.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.DOCILE,

    health: 25,
    speed: 5,
    alertness: 6,
    aggression: 2,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 2,
    killDifficulty: 2,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'opossum_meat',
        name: 'Opossum Meat',
        baseQuantity: 3,
        quantityVariation: 1,
        baseValue: 3,
        weight: 0.6,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'opossum_pelt',
        name: 'Opossum Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 5,
        weight: 0.3,
        successChance: 0.8
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'THE_WASTES'],
    spawnChance: 0.35,

    levelRequired: 1,
    xpReward: 10,
    canAttack: false
  },

  // ========================================
  // MEDIUM GAME (Standard)
  // ========================================

  [AnimalSpecies.TURKEY]: {
    species: AnimalSpecies.TURKEY,
    name: 'Wild Turkey',
    description: 'Large game bird with excellent meat.',
    flavorText: 'A Thanksgiving feast on the hoof... or wing.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 40,
    speed: 7,
    alertness: 8,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.SHOTGUN, HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 3,
    stalkingDifficulty: 5,
    killDifficulty: 3,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'turkey_meat',
        name: 'Turkey Meat',
        baseQuantity: 5,
        quantityVariation: 2,
        baseValue: 8,
        weight: 2.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.FEATHER,
        itemId: 'turkey_feather',
        name: 'Turkey Feather',
        baseQuantity: 5,
        quantityVariation: 3,
        baseValue: 2,
        weight: 0.1,
        successChance: 0.9
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'LONGHORN_RANGE', 'RED_GULCH_PLAINS'],
    spawnChance: 0.35,

    levelRequired: 3,
    xpReward: 20,
    canAttack: false
  },

  [AnimalSpecies.PHEASANT]: {
    species: AnimalSpecies.PHEASANT,
    name: 'Pheasant',
    description: 'Colorful game bird prized by sport hunters.',
    flavorText: 'Their sudden flight startles even experienced hunters.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 35,
    speed: 8,
    alertness: 9,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.SHOTGUN, HuntingWeapon.VARMINT_RIFLE],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 4,
    stalkingDifficulty: 6,
    killDifficulty: 4,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'pheasant_meat',
        name: 'Pheasant Meat',
        baseQuantity: 4,
        quantityVariation: 1,
        baseValue: 12,
        weight: 1.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.FEATHER,
        itemId: 'pheasant_feather',
        name: 'Pheasant Feather',
        baseQuantity: 8,
        quantityVariation: 3,
        baseValue: 3,
        weight: 0.1,
        successChance: 0.9
      }
    ],

    locations: ['LONGHORN_RANGE', 'SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.25,

    levelRequired: 4,
    xpReward: 25,
    canAttack: false
  },

  [AnimalSpecies.DUCK]: {
    species: AnimalSpecies.DUCK,
    name: 'Duck',
    description: 'Waterfowl found near rivers and lakes.',
    flavorText: 'Best hunted from blinds near water.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 30,
    speed: 9,
    alertness: 8,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.SHOTGUN, HuntingWeapon.VARMINT_RIFLE],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 5,
    killDifficulty: 4,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'duck_meat',
        name: 'Duck Meat',
        baseQuantity: 3,
        quantityVariation: 1,
        baseValue: 10,
        weight: 1.2,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.FEATHER,
        itemId: 'duck_feather',
        name: 'Duck Feather',
        baseQuantity: 10,
        quantityVariation: 5,
        baseValue: 1,
        weight: 0.05,
        successChance: 0.95
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.3,

    levelRequired: 2,
    xpReward: 18,
    canAttack: false
  },

  [AnimalSpecies.GOOSE]: {
    species: AnimalSpecies.GOOSE,
    name: 'Goose',
    description: 'Large migratory waterfowl.',
    flavorText: 'Seasonal migrations make them valuable when present.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 45,
    speed: 8,
    alertness: 9,
    aggression: 2,

    recommendedWeapons: [HuntingWeapon.SHOTGUN, HuntingWeapon.VARMINT_RIFLE],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 3,
    stalkingDifficulty: 6,
    killDifficulty: 4,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'goose_meat',
        name: 'Goose Meat',
        baseQuantity: 6,
        quantityVariation: 2,
        baseValue: 12,
        weight: 2.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.FEATHER,
        itemId: 'goose_feather',
        name: 'Goose Feather',
        baseQuantity: 15,
        quantityVariation: 5,
        baseValue: 2,
        weight: 0.05,
        successChance: 0.95
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.2,

    levelRequired: 3,
    xpReward: 22,
    canAttack: false
  },

  [AnimalSpecies.COYOTE]: {
    species: AnimalSpecies.COYOTE,
    name: 'Coyote',
    description: 'Cunning predator of the plains.',
    flavorText: 'Their howls echo across the desert at night.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 60,
    speed: 9,
    alertness: 9,
    aggression: 5,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.SHOTGUN],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 5,
    stalkingDifficulty: 6,
    killDifficulty: 5,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'coyote_meat',
        name: 'Coyote Meat',
        baseQuantity: 4,
        quantityVariation: 1,
        baseValue: 6,
        weight: 1.5,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'coyote_pelt',
        name: 'Coyote Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 25,
        weight: 1.0,
        successChance: 0.8
      },
      {
        type: HarvestResourceType.TOOTH,
        itemId: 'coyote_tooth',
        name: 'Coyote Tooth',
        baseQuantity: 2,
        quantityVariation: 1,
        baseValue: 5,
        weight: 0.1,
        successChance: 0.6
      }
    ],

    locations: ['THE_WASTES', 'RED_GULCH_PLAINS', 'LONGHORN_RANGE'],
    spawnChance: 0.3,

    levelRequired: 5,
    xpReward: 30,
    canAttack: true,
    attackDamage: 15
  },

  [AnimalSpecies.FOX]: {
    species: AnimalSpecies.FOX,
    name: 'Red Fox',
    description: 'Sleek predator with valuable fur.',
    flavorText: 'Their pelts fetch high prices from traders.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 50,
    speed: 10,
    alertness: 10,
    aggression: 3,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 7,
    killDifficulty: 5,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'fox_meat',
        name: 'Fox Meat',
        baseQuantity: 3,
        quantityVariation: 1,
        baseValue: 7,
        weight: 1.2,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'fox_pelt',
        name: 'Fox Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 40,
        weight: 0.8,
        successChance: 0.8,
        skillRequirement: 2
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'LONGHORN_RANGE'],
    spawnChance: 0.2,

    levelRequired: 5,
    skillRequirements: {
      tracking: 2
    },
    xpReward: 35,
    canAttack: false
  },

  [AnimalSpecies.BADGER]: {
    species: AnimalSpecies.BADGER,
    name: 'Badger',
    description: 'Aggressive burrowing animal.',
    flavorText: "Don't let their size fool you - they're fierce fighters.",

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.AGGRESSIVE,

    health: 70,
    speed: 6,
    alertness: 7,
    aggression: 8,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.SHOTGUN],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 4,
    stalkingDifficulty: 5,
    killDifficulty: 6,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'badger_meat',
        name: 'Badger Meat',
        baseQuantity: 4,
        quantityVariation: 1,
        baseValue: 5,
        weight: 1.5,
        successChance: 0.8
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'badger_pelt',
        name: 'Badger Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 30,
        weight: 1.0,
        successChance: 0.75
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'badger_claw',
        name: 'Badger Claw',
        baseQuantity: 4,
        quantityVariation: 2,
        baseValue: 3,
        weight: 0.1,
        successChance: 0.7
      }
    ],

    locations: ['THE_WASTES', 'RED_GULCH_PLAINS'],
    spawnChance: 0.2,

    levelRequired: 6,
    xpReward: 35,
    canAttack: true,
    attackDamage: 20
  },

  // ========================================
  // LARGE GAME (Challenging)
  // ========================================

  [AnimalSpecies.WHITE_TAILED_DEER]: {
    species: AnimalSpecies.WHITE_TAILED_DEER,
    name: 'White-Tailed Deer',
    description: 'Common deer species throughout the frontier.',
    flavorText: 'A staple of frontier hunting, providing meat and hide.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 100,
    speed: 9,
    alertness: 9,
    aggression: 2,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 5,
    stalkingDifficulty: 6,
    killDifficulty: 5,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'venison',
        name: 'Venison',
        baseQuantity: 15,
        quantityVariation: 5,
        baseValue: 10,
        weight: 5.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'deer_hide',
        name: 'Deer Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 50,
        weight: 3.0,
        successChance: 0.85,
        skillRequirement: 3
      },
      {
        type: HarvestResourceType.ANTLER,
        itemId: 'deer_antler',
        name: 'Deer Antler',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 15,
        weight: 1.0,
        successChance: 0.7
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'LONGHORN_RANGE'],
    spawnChance: 0.3,

    levelRequired: 7,
    skillRequirements: {
      tracking: 3,
      marksmanship: 2
    },
    xpReward: 50,
    canAttack: false
  },

  [AnimalSpecies.MULE_DEER]: {
    species: AnimalSpecies.MULE_DEER,
    name: 'Mule Deer',
    description: 'Western deer with distinctive large ears.',
    flavorText: 'Named for their mule-like ears, these deer are wary and alert.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 110,
    speed: 8,
    alertness: 10,
    aggression: 2,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 7,
    killDifficulty: 5,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'venison',
        name: 'Venison',
        baseQuantity: 18,
        quantityVariation: 5,
        baseValue: 10,
        weight: 5.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'mule_deer_hide',
        name: 'Mule Deer Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 60,
        weight: 3.5,
        successChance: 0.85,
        skillRequirement: 3
      },
      {
        type: HarvestResourceType.ANTLER,
        itemId: 'mule_deer_antler',
        name: 'Mule Deer Antler',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 20,
        weight: 1.2,
        successChance: 0.7
      }
    ],

    locations: ['LONGHORN_RANGE', 'THUNDERBIRD_PEAK'],
    spawnChance: 0.25,

    levelRequired: 8,
    skillRequirements: {
      tracking: 3,
      marksmanship: 2
    },
    xpReward: 55,
    canAttack: false
  },

  [AnimalSpecies.PRONGHORN]: {
    species: AnimalSpecies.PRONGHORN,
    name: 'Pronghorn Antelope',
    description: 'Fastest land animal in North America.',
    flavorText: 'Their incredible speed makes them a challenging hunt.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.SKITTISH,

    health: 90,
    speed: 10,
    alertness: 10,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 8,
    killDifficulty: 7,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'pronghorn_meat',
        name: 'Pronghorn Meat',
        baseQuantity: 14,
        quantityVariation: 4,
        baseValue: 12,
        weight: 4.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'pronghorn_hide',
        name: 'Pronghorn Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 70,
        weight: 2.5,
        successChance: 0.85,
        skillRequirement: 4
      },
      {
        type: HarvestResourceType.HORN,
        itemId: 'pronghorn_horn',
        name: 'Pronghorn Horn',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 25,
        weight: 0.8,
        successChance: 0.75
      }
    ],

    locations: ['LONGHORN_RANGE', 'RED_GULCH_PLAINS'],
    spawnChance: 0.2,

    levelRequired: 10,
    skillRequirements: {
      tracking: 4,
      marksmanship: 3
    },
    xpReward: 65,
    canAttack: false
  },

  [AnimalSpecies.WILD_BOAR]: {
    species: AnimalSpecies.WILD_BOAR,
    name: 'Wild Boar',
    description: 'Aggressive tusked pig.',
    flavorText: 'Wounded boars are extremely dangerous - aim true.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.AGGRESSIVE,

    health: 150,
    speed: 7,
    alertness: 6,
    aggression: 8,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.SHOTGUN],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 5,
    stalkingDifficulty: 5,
    killDifficulty: 7,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'boar_meat',
        name: 'Boar Meat',
        baseQuantity: 20,
        quantityVariation: 5,
        baseValue: 8,
        weight: 6.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'boar_hide',
        name: 'Boar Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 45,
        weight: 4.0,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.TOOTH,
        itemId: 'boar_tusk',
        name: 'Boar Tusk',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 30,
        weight: 0.5,
        successChance: 0.8
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'THE_WASTES'],
    spawnChance: 0.2,

    levelRequired: 9,
    skillRequirements: {
      marksmanship: 3
    },
    xpReward: 60,
    canAttack: true,
    attackDamage: 35
  },

  [AnimalSpecies.JAVELINA]: {
    species: AnimalSpecies.JAVELINA,
    name: 'Javelina',
    description: 'Desert peccary, smaller cousin to the boar.',
    flavorText: 'Travel in groups and can be aggressive when cornered.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 80,
    speed: 7,
    alertness: 7,
    aggression: 6,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 4,
    stalkingDifficulty: 5,
    killDifficulty: 5,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'javelina_meat',
        name: 'Javelina Meat',
        baseQuantity: 10,
        quantityVariation: 3,
        baseValue: 9,
        weight: 3.5,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'javelina_hide',
        name: 'Javelina Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 35,
        weight: 2.0,
        successChance: 0.85
      }
    ],

    locations: ['THE_WASTES', 'RED_GULCH_PLAINS'],
    spawnChance: 0.25,

    levelRequired: 7,
    xpReward: 45,
    canAttack: true,
    attackDamage: 20
  },

  [AnimalSpecies.BIGHORN_SHEEP]: {
    species: AnimalSpecies.BIGHORN_SHEEP,
    name: 'Bighorn Sheep',
    description: 'Mountain-dwelling sheep with impressive horns.',
    flavorText: 'A trophy animal sought by hunters for their magnificent horns.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.RARE,
    behavior: AnimalBehavior.SKITTISH,

    health: 120,
    speed: 8,
    alertness: 10,
    aggression: 3,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 7,
    stalkingDifficulty: 8,
    killDifficulty: 6,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'bighorn_meat',
        name: 'Bighorn Meat',
        baseQuantity: 16,
        quantityVariation: 4,
        baseValue: 15,
        weight: 5.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'bighorn_hide',
        name: 'Bighorn Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 80,
        weight: 3.0,
        successChance: 0.85,
        skillRequirement: 5
      },
      {
        type: HarvestResourceType.HORN,
        itemId: 'bighorn_horn',
        name: 'Bighorn Horn',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 100,
        weight: 2.0,
        successChance: 0.8
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'bighorn_trophy',
        name: 'Bighorn Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 200,
        weight: 5.0,
        successChance: 0.3,
        skillRequirement: 6
      }
    ],

    locations: ['THUNDERBIRD_PEAK'],
    spawnChance: 0.15,

    levelRequired: 12,
    skillRequirements: {
      tracking: 5,
      marksmanship: 4
    },
    xpReward: 85,
    canAttack: false
  },

  [AnimalSpecies.ELK]: {
    species: AnimalSpecies.ELK,
    name: 'Elk',
    description: 'Massive member of the deer family.',
    flavorText: 'Their bugling calls echo through mountain valleys.',

    size: AnimalSize.LARGE,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 180,
    speed: 7,
    alertness: 8,
    aggression: 4,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 7,
    killDifficulty: 7,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'elk_meat',
        name: 'Elk Meat',
        baseQuantity: 35,
        quantityVariation: 10,
        baseValue: 12,
        weight: 10.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'elk_hide',
        name: 'Elk Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 100,
        weight: 6.0,
        successChance: 0.85,
        skillRequirement: 5
      },
      {
        type: HarvestResourceType.ANTLER,
        itemId: 'elk_antler',
        name: 'Elk Antler',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 60,
        weight: 3.0,
        successChance: 0.75
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'elk_trophy',
        name: 'Elk Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 250,
        weight: 8.0,
        successChance: 0.25,
        skillRequirement: 6
      }
    ],

    locations: ['THUNDERBIRD_PEAK', 'SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.2,

    levelRequired: 12,
    skillRequirements: {
      tracking: 4,
      marksmanship: 4
    },
    xpReward: 90,
    canAttack: true,
    attackDamage: 30
  },

  // ========================================
  // DANGEROUS GAME (Expert)
  // ========================================

  [AnimalSpecies.BLACK_BEAR]: {
    species: AnimalSpecies.BLACK_BEAR,
    name: 'Black Bear',
    description: 'Powerful omnivorous bear.',
    flavorText: 'Generally avoid humans, but extremely dangerous when provoked.',

    size: AnimalSize.DANGEROUS,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 250,
    speed: 7,
    alertness: 7,
    aggression: 6,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 6,
    killDifficulty: 8,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'bear_meat',
        name: 'Bear Meat',
        baseQuantity: 40,
        quantityVariation: 10,
        baseValue: 10,
        weight: 12.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'bear_pelt',
        name: 'Bear Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 150,
        weight: 8.0,
        successChance: 0.8,
        skillRequirement: 6
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'bear_claw',
        name: 'Bear Claw',
        baseQuantity: 5,
        quantityVariation: 2,
        baseValue: 20,
        weight: 0.3,
        successChance: 0.7
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'bear_trophy',
        name: 'Bear Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 300,
        weight: 15.0,
        successChance: 0.2,
        skillRequirement: 7
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'THUNDERBIRD_PEAK'],
    spawnChance: 0.15,

    levelRequired: 15,
    skillRequirements: {
      tracking: 5,
      marksmanship: 5
    },
    xpReward: 120,
    canAttack: true,
    attackDamage: 50
  },

  [AnimalSpecies.GRIZZLY_BEAR]: {
    species: AnimalSpecies.GRIZZLY_BEAR,
    name: 'Grizzly Bear',
    description: 'Massive and extremely dangerous predator.',
    flavorText: 'The apex predator of the frontier. Hunt at your own risk.',

    size: AnimalSize.DANGEROUS,
    rarity: AnimalRarity.RARE,
    behavior: AnimalBehavior.AGGRESSIVE,

    health: 350,
    speed: 8,
    alertness: 8,
    aggression: 9,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 7,
    stalkingDifficulty: 7,
    killDifficulty: 10,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'grizzly_meat',
        name: 'Grizzly Meat',
        baseQuantity: 60,
        quantityVariation: 15,
        baseValue: 12,
        weight: 18.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'grizzly_pelt',
        name: 'Grizzly Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 250,
        weight: 12.0,
        successChance: 0.75,
        skillRequirement: 7
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'grizzly_claw',
        name: 'Grizzly Claw',
        baseQuantity: 5,
        quantityVariation: 2,
        baseValue: 35,
        weight: 0.4,
        successChance: 0.7
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'grizzly_trophy',
        name: 'Grizzly Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 500,
        weight: 25.0,
        successChance: 0.15,
        skillRequirement: 8
      }
    ],

    locations: ['THUNDERBIRD_PEAK', 'THE_WASTES'],
    spawnChance: 0.08,

    levelRequired: 18,
    skillRequirements: {
      tracking: 6,
      marksmanship: 7
    },
    xpReward: 180,
    canAttack: true,
    attackDamage: 75
  },

  [AnimalSpecies.MOUNTAIN_LION]: {
    species: AnimalSpecies.MOUNTAIN_LION,
    name: 'Mountain Lion',
    description: 'Stealthy apex predator of the mountains.',
    flavorText: "You rarely see them before they see you.",

    size: AnimalSize.DANGEROUS,
    rarity: AnimalRarity.RARE,
    behavior: AnimalBehavior.PREDATOR,

    health: 180,
    speed: 10,
    alertness: 10,
    aggression: 8,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 8,
    stalkingDifficulty: 9,
    killDifficulty: 8,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'mountain_lion_meat',
        name: 'Mountain Lion Meat',
        baseQuantity: 25,
        quantityVariation: 8,
        baseValue: 15,
        weight: 8.0,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'mountain_lion_pelt',
        name: 'Mountain Lion Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 200,
        weight: 5.0,
        successChance: 0.8,
        skillRequirement: 6
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'mountain_lion_claw',
        name: 'Mountain Lion Claw',
        baseQuantity: 4,
        quantityVariation: 2,
        baseValue: 25,
        weight: 0.2,
        successChance: 0.75
      },
      {
        type: HarvestResourceType.TOOTH,
        itemId: 'mountain_lion_tooth',
        name: 'Mountain Lion Tooth',
        baseQuantity: 4,
        quantityVariation: 2,
        baseValue: 20,
        weight: 0.1,
        successChance: 0.7
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'mountain_lion_trophy',
        name: 'Mountain Lion Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 400,
        weight: 12.0,
        successChance: 0.2,
        skillRequirement: 7
      }
    ],

    locations: ['THUNDERBIRD_PEAK', 'LONGHORN_RANGE'],
    spawnChance: 0.1,

    levelRequired: 16,
    skillRequirements: {
      tracking: 6,
      marksmanship: 6
    },
    xpReward: 150,
    canAttack: true,
    attackDamage: 60
  },

  [AnimalSpecies.WOLF]: {
    species: AnimalSpecies.WOLF,
    name: 'Gray Wolf',
    description: 'Intelligent pack predator.',
    flavorText: 'Never hunt alone - where there\'s one, there\'s a pack.',

    size: AnimalSize.DANGEROUS,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.PREDATOR,

    health: 120,
    speed: 9,
    alertness: 9,
    aggression: 7,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 7,
    stalkingDifficulty: 8,
    killDifficulty: 7,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'wolf_meat',
        name: 'Wolf Meat',
        baseQuantity: 18,
        quantityVariation: 5,
        baseValue: 8,
        weight: 6.0,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.PELT,
        itemId: 'wolf_pelt',
        name: 'Wolf Pelt',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 120,
        weight: 4.0,
        successChance: 0.8,
        skillRequirement: 5
      },
      {
        type: HarvestResourceType.TOOTH,
        itemId: 'wolf_tooth',
        name: 'Wolf Tooth',
        baseQuantity: 4,
        quantityVariation: 2,
        baseValue: 15,
        weight: 0.1,
        successChance: 0.7
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'wolf_claw',
        name: 'Wolf Claw',
        baseQuantity: 4,
        quantityVariation: 2,
        baseValue: 12,
        weight: 0.1,
        successChance: 0.65
      }
    ],

    locations: ['THUNDERBIRD_PEAK', 'THE_WASTES', 'SPIRIT_SPRINGS_FOREST'],
    spawnChance: 0.18,

    levelRequired: 14,
    skillRequirements: {
      tracking: 5,
      marksmanship: 5
    },
    xpReward: 110,
    canAttack: true,
    attackDamage: 45
  },

  [AnimalSpecies.BISON]: {
    species: AnimalSpecies.BISON,
    name: 'American Bison',
    description: 'Massive icon of the frontier.',
    flavorText: 'Once numbered in the millions, now rare and protected.',

    size: AnimalSize.DANGEROUS,
    rarity: AnimalRarity.RARE,
    behavior: AnimalBehavior.NEUTRAL,

    health: 400,
    speed: 6,
    alertness: 6,
    aggression: 5,

    recommendedWeapons: [HuntingWeapon.HUNTING_RIFLE],
    minimumWeapon: HuntingWeapon.HUNTING_RIFLE,

    trackingDifficulty: 5,
    stalkingDifficulty: 6,
    killDifficulty: 9,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'bison_meat',
        name: 'Bison Meat',
        baseQuantity: 80,
        quantityVariation: 20,
        baseValue: 15,
        weight: 25.0,
        successChance: 0.95
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'bison_hide',
        name: 'Bison Hide',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 180,
        weight: 15.0,
        successChance: 0.85,
        skillRequirement: 6
      },
      {
        type: HarvestResourceType.HORN,
        itemId: 'bison_horn',
        name: 'Bison Horn',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 50,
        weight: 2.0,
        successChance: 0.75
      },
      {
        type: HarvestResourceType.TROPHY,
        itemId: 'bison_trophy',
        name: 'Bison Trophy',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 450,
        weight: 30.0,
        successChance: 0.18,
        skillRequirement: 7
      }
    ],

    locations: ['LONGHORN_RANGE', 'RED_GULCH_PLAINS'],
    spawnChance: 0.1,

    levelRequired: 17,
    skillRequirements: {
      tracking: 4,
      marksmanship: 6
    },
    xpReward: 160,
    canAttack: true,
    attackDamage: 65
  },

  // ========================================
  // ADDITIONAL ANIMALS
  // ========================================

  [AnimalSpecies.EAGLE]: {
    species: AnimalSpecies.EAGLE,
    name: 'Bald Eagle',
    description: 'Majestic bird of prey.',
    flavorText: 'Hunting eagles is controversial and often illegal.',

    size: AnimalSize.MEDIUM,
    rarity: AnimalRarity.RARE,
    behavior: AnimalBehavior.NEUTRAL,

    health: 50,
    speed: 10,
    alertness: 10,
    aggression: 4,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 6,
    stalkingDifficulty: 9,
    killDifficulty: 8,

    harvestResources: [
      {
        type: HarvestResourceType.FEATHER,
        itemId: 'eagle_feather',
        name: 'Eagle Feather',
        baseQuantity: 10,
        quantityVariation: 5,
        baseValue: 15,
        weight: 0.1,
        successChance: 0.9
      },
      {
        type: HarvestResourceType.CLAW,
        itemId: 'eagle_talon',
        name: 'Eagle Talon',
        baseQuantity: 4,
        quantityVariation: 0,
        baseValue: 25,
        weight: 0.2,
        successChance: 0.75
      }
    ],

    locations: ['THUNDERBIRD_PEAK', 'LONGHORN_RANGE'],
    spawnChance: 0.1,

    levelRequired: 12,
    skillRequirements: {
      marksmanship: 5
    },
    xpReward: 80,
    canAttack: false
  },

  [AnimalSpecies.RATTLESNAKE]: {
    species: AnimalSpecies.RATTLESNAKE,
    name: 'Rattlesnake',
    description: 'Venomous pit viper.',
    flavorText: 'Listen for the rattle - it\'s your only warning.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.COMMON,
    behavior: AnimalBehavior.AGGRESSIVE,

    health: 20,
    speed: 5,
    alertness: 8,
    aggression: 7,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.PISTOL],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 3,
    stalkingDifficulty: 4,
    killDifficulty: 3,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'rattlesnake_meat',
        name: 'Rattlesnake Meat',
        baseQuantity: 2,
        quantityVariation: 1,
        baseValue: 8,
        weight: 0.5,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'rattlesnake_skin',
        name: 'Rattlesnake Skin',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 20,
        weight: 0.2,
        successChance: 0.7,
        skillRequirement: 3
      },
      {
        type: HarvestResourceType.TOOTH,
        itemId: 'rattlesnake_fang',
        name: 'Rattlesnake Fang',
        baseQuantity: 2,
        quantityVariation: 0,
        baseValue: 10,
        weight: 0.05,
        successChance: 0.6
      }
    ],

    locations: ['THE_WASTES', 'RED_GULCH_PLAINS', 'LONGHORN_RANGE'],
    spawnChance: 0.3,

    levelRequired: 4,
    xpReward: 20,
    canAttack: true,
    attackDamage: 25
  },

  [AnimalSpecies.ARMADILLO]: {
    species: AnimalSpecies.ARMADILLO,
    name: 'Armadillo',
    description: 'Armored burrowing mammal.',
    flavorText: 'Their armor makes clean kills difficult.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.DOCILE,

    health: 35,
    speed: 4,
    alertness: 5,
    aggression: 1,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 3,
    killDifficulty: 4,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'armadillo_meat',
        name: 'Armadillo Meat',
        baseQuantity: 2,
        quantityVariation: 1,
        baseValue: 6,
        weight: 0.8,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.HIDE,
        itemId: 'armadillo_shell',
        name: 'Armadillo Shell',
        baseQuantity: 1,
        quantityVariation: 0,
        baseValue: 15,
        weight: 0.5,
        successChance: 0.8
      }
    ],

    locations: ['THE_WASTES', 'RED_GULCH_PLAINS'],
    spawnChance: 0.25,

    levelRequired: 3,
    xpReward: 15,
    canAttack: false
  },

  [AnimalSpecies.PORCUPINE]: {
    species: AnimalSpecies.PORCUPINE,
    name: 'Porcupine',
    description: 'Slow-moving rodent covered in quills.',
    flavorText: 'Those quills are painful - keep your distance.',

    size: AnimalSize.SMALL,
    rarity: AnimalRarity.UNCOMMON,
    behavior: AnimalBehavior.NEUTRAL,

    health: 30,
    speed: 3,
    alertness: 5,
    aggression: 3,

    recommendedWeapons: [HuntingWeapon.VARMINT_RIFLE, HuntingWeapon.BOW],
    minimumWeapon: HuntingWeapon.VARMINT_RIFLE,

    trackingDifficulty: 2,
    stalkingDifficulty: 2,
    killDifficulty: 2,

    harvestResources: [
      {
        type: HarvestResourceType.MEAT,
        itemId: 'porcupine_meat',
        name: 'Porcupine Meat',
        baseQuantity: 3,
        quantityVariation: 1,
        baseValue: 5,
        weight: 0.8,
        successChance: 0.85
      },
      {
        type: HarvestResourceType.BONE,
        itemId: 'porcupine_quill',
        name: 'Porcupine Quill',
        baseQuantity: 20,
        quantityVariation: 10,
        baseValue: 1,
        weight: 0.02,
        successChance: 0.95
      }
    ],

    locations: ['SPIRIT_SPRINGS_FOREST', 'THUNDERBIRD_PEAK'],
    spawnChance: 0.2,

    levelRequired: 2,
    xpReward: 12,
    canAttack: false
  }
};

/**
 * Get animal definition by species
 */
export function getAnimalDefinition(species: AnimalSpecies): AnimalDefinition | undefined {
  return HUNTABLE_ANIMALS[species];
}

/**
 * Get all animals by size
 */
export function getAnimalsBySize(size: AnimalSize): AnimalDefinition[] {
  return Object.values(HUNTABLE_ANIMALS).filter(animal => animal.size === size);
}

/**
 * Get all animals by rarity
 */
export function getAnimalsByRarity(rarity: AnimalRarity): AnimalDefinition[] {
  return Object.values(HUNTABLE_ANIMALS).filter(animal => animal.rarity === rarity);
}

/**
 * Get animals available at location
 */
export function getAnimalsAtLocation(locationId: string): AnimalDefinition[] {
  return Object.values(HUNTABLE_ANIMALS).filter(animal =>
    animal.locations.includes(locationId)
  );
}
