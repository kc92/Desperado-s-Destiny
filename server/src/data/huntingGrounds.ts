/**
 * Hunting Grounds Data - Phase 10, Wave 10.1
 *
 * Definitions for hunting locations in Desperados Destiny
 */

import { HuntingGround, AnimalSpecies } from '@desperados/shared';

/**
 * All hunting grounds in the game
 */
export const HUNTING_GROUNDS: Record<string, HuntingGround> = {
  RED_GULCH_PLAINS: {
    locationId: 'RED_GULCH_PLAINS',
    name: 'Red Gulch Plains',
    description: 'Wide open grasslands surrounding Red Gulch, perfect for hunting small to medium game.',
    shortDescription: 'Open plains with abundant small game',

    availableAnimals: [
      AnimalSpecies.RABBIT,
      AnimalSpecies.PRAIRIE_DOG,
      AnimalSpecies.RACCOON,
      AnimalSpecies.TURKEY,
      AnimalSpecies.COYOTE,
      AnimalSpecies.PRONGHORN,
      AnimalSpecies.JAVELINA,
      AnimalSpecies.RATTLESNAKE,
      AnimalSpecies.ARMADILLO,
      AnimalSpecies.BISON
    ],

    spawnRates: {
      [AnimalSpecies.RABBIT]: 0.4,
      [AnimalSpecies.PRAIRIE_DOG]: 0.5,
      [AnimalSpecies.RACCOON]: 0.3,
      [AnimalSpecies.TURKEY]: 0.35,
      [AnimalSpecies.COYOTE]: 0.3,
      [AnimalSpecies.PRONGHORN]: 0.2,
      [AnimalSpecies.JAVELINA]: 0.25,
      [AnimalSpecies.RATTLESNAKE]: 0.3,
      [AnimalSpecies.ARMADILLO]: 0.25,
      [AnimalSpecies.BISON]: 0.1,
      // Default 0 for others
      [AnimalSpecies.SQUIRREL]: 0,
      [AnimalSpecies.SKUNK]: 0,
      [AnimalSpecies.OPOSSUM]: 0,
      [AnimalSpecies.PHEASANT]: 0,
      [AnimalSpecies.DUCK]: 0,
      [AnimalSpecies.GOOSE]: 0,
      [AnimalSpecies.FOX]: 0,
      [AnimalSpecies.BADGER]: 0,
      [AnimalSpecies.WHITE_TAILED_DEER]: 0,
      [AnimalSpecies.MULE_DEER]: 0,
      [AnimalSpecies.WILD_BOAR]: 0,
      [AnimalSpecies.BIGHORN_SHEEP]: 0,
      [AnimalSpecies.ELK]: 0,
      [AnimalSpecies.BLACK_BEAR]: 0,
      [AnimalSpecies.GRIZZLY_BEAR]: 0,
      [AnimalSpecies.MOUNTAIN_LION]: 0,
      [AnimalSpecies.WOLF]: 0,
      [AnimalSpecies.EAGLE]: 0,
      [AnimalSpecies.PORCUPINE]: 0
    },

    terrain: 'plains',
    coverLevel: 3,
    dangerLevel: 3,

    energyCost: 10,
    minLevel: 1
  },

  LONGHORN_RANGE: {
    locationId: 'LONGHORN_RANGE',
    name: 'Longhorn Range',
    description: 'Rolling hills and grasslands, home to deer, antelope, and various game birds.',
    shortDescription: 'Prime hunting grounds with diverse game',

    availableAnimals: [
      AnimalSpecies.RABBIT,
      AnimalSpecies.PRAIRIE_DOG,
      AnimalSpecies.SQUIRREL,
      AnimalSpecies.TURKEY,
      AnimalSpecies.PHEASANT,
      AnimalSpecies.COYOTE,
      AnimalSpecies.FOX,
      AnimalSpecies.WHITE_TAILED_DEER,
      AnimalSpecies.MULE_DEER,
      AnimalSpecies.PRONGHORN,
      AnimalSpecies.RATTLESNAKE,
      AnimalSpecies.MOUNTAIN_LION,
      AnimalSpecies.EAGLE,
      AnimalSpecies.BISON
    ],

    spawnRates: {
      [AnimalSpecies.RABBIT]: 0.4,
      [AnimalSpecies.PRAIRIE_DOG]: 0.5,
      [AnimalSpecies.SQUIRREL]: 0.45,
      [AnimalSpecies.TURKEY]: 0.35,
      [AnimalSpecies.PHEASANT]: 0.25,
      [AnimalSpecies.COYOTE]: 0.3,
      [AnimalSpecies.FOX]: 0.2,
      [AnimalSpecies.WHITE_TAILED_DEER]: 0.3,
      [AnimalSpecies.MULE_DEER]: 0.25,
      [AnimalSpecies.PRONGHORN]: 0.2,
      [AnimalSpecies.RATTLESNAKE]: 0.3,
      [AnimalSpecies.MOUNTAIN_LION]: 0.1,
      [AnimalSpecies.EAGLE]: 0.1,
      [AnimalSpecies.BISON]: 0.1,
      // Default 0 for others
      [AnimalSpecies.RACCOON]: 0,
      [AnimalSpecies.SKUNK]: 0,
      [AnimalSpecies.OPOSSUM]: 0,
      [AnimalSpecies.DUCK]: 0,
      [AnimalSpecies.GOOSE]: 0,
      [AnimalSpecies.BADGER]: 0,
      [AnimalSpecies.WILD_BOAR]: 0,
      [AnimalSpecies.JAVELINA]: 0,
      [AnimalSpecies.BIGHORN_SHEEP]: 0,
      [AnimalSpecies.ELK]: 0,
      [AnimalSpecies.BLACK_BEAR]: 0,
      [AnimalSpecies.GRIZZLY_BEAR]: 0,
      [AnimalSpecies.WOLF]: 0,
      [AnimalSpecies.ARMADILLO]: 0,
      [AnimalSpecies.PORCUPINE]: 0
    },

    terrain: 'plains',
    coverLevel: 5,
    dangerLevel: 5,

    energyCost: 12,
    minLevel: 5
  },

  SPIRIT_SPRINGS_FOREST: {
    locationId: 'SPIRIT_SPRINGS_FOREST',
    name: 'Spirit Springs Forest',
    description: 'Dense woodland with streams and clearings, teeming with wildlife from small game to dangerous predators.',
    shortDescription: 'Rich forest hunting grounds',

    availableAnimals: [
      AnimalSpecies.RABBIT,
      AnimalSpecies.SQUIRREL,
      AnimalSpecies.RACCOON,
      AnimalSpecies.SKUNK,
      AnimalSpecies.OPOSSUM,
      AnimalSpecies.TURKEY,
      AnimalSpecies.PHEASANT,
      AnimalSpecies.DUCK,
      AnimalSpecies.GOOSE,
      AnimalSpecies.FOX,
      AnimalSpecies.WHITE_TAILED_DEER,
      AnimalSpecies.WILD_BOAR,
      AnimalSpecies.ELK,
      AnimalSpecies.BLACK_BEAR,
      AnimalSpecies.WOLF,
      AnimalSpecies.PORCUPINE
    ],

    spawnRates: {
      [AnimalSpecies.RABBIT]: 0.4,
      [AnimalSpecies.SQUIRREL]: 0.45,
      [AnimalSpecies.RACCOON]: 0.3,
      [AnimalSpecies.SKUNK]: 0.25,
      [AnimalSpecies.OPOSSUM]: 0.35,
      [AnimalSpecies.TURKEY]: 0.35,
      [AnimalSpecies.PHEASANT]: 0.25,
      [AnimalSpecies.DUCK]: 0.3,
      [AnimalSpecies.GOOSE]: 0.2,
      [AnimalSpecies.FOX]: 0.2,
      [AnimalSpecies.WHITE_TAILED_DEER]: 0.3,
      [AnimalSpecies.WILD_BOAR]: 0.2,
      [AnimalSpecies.ELK]: 0.2,
      [AnimalSpecies.BLACK_BEAR]: 0.15,
      [AnimalSpecies.WOLF]: 0.18,
      [AnimalSpecies.PORCUPINE]: 0.2,
      // Default 0 for others
      [AnimalSpecies.PRAIRIE_DOG]: 0,
      [AnimalSpecies.COYOTE]: 0,
      [AnimalSpecies.BADGER]: 0,
      [AnimalSpecies.MULE_DEER]: 0,
      [AnimalSpecies.PRONGHORN]: 0,
      [AnimalSpecies.JAVELINA]: 0,
      [AnimalSpecies.BIGHORN_SHEEP]: 0,
      [AnimalSpecies.GRIZZLY_BEAR]: 0,
      [AnimalSpecies.MOUNTAIN_LION]: 0,
      [AnimalSpecies.BISON]: 0,
      [AnimalSpecies.EAGLE]: 0,
      [AnimalSpecies.RATTLESNAKE]: 0,
      [AnimalSpecies.ARMADILLO]: 0
    },

    terrain: 'forest',
    coverLevel: 8,
    dangerLevel: 7,

    energyCost: 15,
    minLevel: 7
  },

  THUNDERBIRD_PEAK: {
    locationId: 'THUNDERBIRD_PEAK',
    name: 'Thunderbird Peak',
    description: 'Rugged mountain terrain where trophy animals roam. Home to bighorn sheep, elk, and dangerous predators.',
    shortDescription: 'Mountain hunting for experienced hunters',

    availableAnimals: [
      AnimalSpecies.MULE_DEER,
      AnimalSpecies.BIGHORN_SHEEP,
      AnimalSpecies.ELK,
      AnimalSpecies.BLACK_BEAR,
      AnimalSpecies.GRIZZLY_BEAR,
      AnimalSpecies.MOUNTAIN_LION,
      AnimalSpecies.WOLF,
      AnimalSpecies.EAGLE,
      AnimalSpecies.PORCUPINE
    ],

    spawnRates: {
      [AnimalSpecies.MULE_DEER]: 0.25,
      [AnimalSpecies.BIGHORN_SHEEP]: 0.15,
      [AnimalSpecies.ELK]: 0.2,
      [AnimalSpecies.BLACK_BEAR]: 0.15,
      [AnimalSpecies.GRIZZLY_BEAR]: 0.08,
      [AnimalSpecies.MOUNTAIN_LION]: 0.1,
      [AnimalSpecies.WOLF]: 0.18,
      [AnimalSpecies.EAGLE]: 0.1,
      [AnimalSpecies.PORCUPINE]: 0.2,
      // Default 0 for others
      [AnimalSpecies.RABBIT]: 0,
      [AnimalSpecies.PRAIRIE_DOG]: 0,
      [AnimalSpecies.SQUIRREL]: 0,
      [AnimalSpecies.RACCOON]: 0,
      [AnimalSpecies.SKUNK]: 0,
      [AnimalSpecies.OPOSSUM]: 0,
      [AnimalSpecies.TURKEY]: 0,
      [AnimalSpecies.PHEASANT]: 0,
      [AnimalSpecies.DUCK]: 0,
      [AnimalSpecies.GOOSE]: 0,
      [AnimalSpecies.COYOTE]: 0,
      [AnimalSpecies.FOX]: 0,
      [AnimalSpecies.BADGER]: 0,
      [AnimalSpecies.WHITE_TAILED_DEER]: 0,
      [AnimalSpecies.PRONGHORN]: 0,
      [AnimalSpecies.WILD_BOAR]: 0,
      [AnimalSpecies.JAVELINA]: 0,
      [AnimalSpecies.BISON]: 0,
      [AnimalSpecies.RATTLESNAKE]: 0,
      [AnimalSpecies.ARMADILLO]: 0
    },

    terrain: 'mountains',
    coverLevel: 6,
    dangerLevel: 9,

    energyCost: 18,
    minLevel: 12
  },

  THE_WASTES: {
    locationId: 'THE_WASTES',
    name: 'The Wastes',
    description: 'Harsh desert badlands where only the toughest survive. Dangerous game and deadly predators roam here.',
    shortDescription: 'Dangerous desert hunting grounds',

    availableAnimals: [
      AnimalSpecies.SKUNK,
      AnimalSpecies.OPOSSUM,
      AnimalSpecies.COYOTE,
      AnimalSpecies.BADGER,
      AnimalSpecies.JAVELINA,
      AnimalSpecies.WILD_BOAR,
      AnimalSpecies.GRIZZLY_BEAR,
      AnimalSpecies.WOLF,
      AnimalSpecies.RATTLESNAKE,
      AnimalSpecies.ARMADILLO
    ],

    spawnRates: {
      [AnimalSpecies.SKUNK]: 0.25,
      [AnimalSpecies.OPOSSUM]: 0.35,
      [AnimalSpecies.COYOTE]: 0.3,
      [AnimalSpecies.BADGER]: 0.2,
      [AnimalSpecies.JAVELINA]: 0.25,
      [AnimalSpecies.WILD_BOAR]: 0.2,
      [AnimalSpecies.GRIZZLY_BEAR]: 0.08,
      [AnimalSpecies.WOLF]: 0.18,
      [AnimalSpecies.RATTLESNAKE]: 0.3,
      [AnimalSpecies.ARMADILLO]: 0.25,
      // Default 0 for others
      [AnimalSpecies.RABBIT]: 0,
      [AnimalSpecies.PRAIRIE_DOG]: 0,
      [AnimalSpecies.SQUIRREL]: 0,
      [AnimalSpecies.RACCOON]: 0,
      [AnimalSpecies.TURKEY]: 0,
      [AnimalSpecies.PHEASANT]: 0,
      [AnimalSpecies.DUCK]: 0,
      [AnimalSpecies.GOOSE]: 0,
      [AnimalSpecies.FOX]: 0,
      [AnimalSpecies.WHITE_TAILED_DEER]: 0,
      [AnimalSpecies.MULE_DEER]: 0,
      [AnimalSpecies.PRONGHORN]: 0,
      [AnimalSpecies.BIGHORN_SHEEP]: 0,
      [AnimalSpecies.ELK]: 0,
      [AnimalSpecies.BLACK_BEAR]: 0,
      [AnimalSpecies.MOUNTAIN_LION]: 0,
      [AnimalSpecies.BISON]: 0,
      [AnimalSpecies.EAGLE]: 0,
      [AnimalSpecies.PORCUPINE]: 0
    },

    terrain: 'desert',
    coverLevel: 2,
    dangerLevel: 8,

    energyCost: 16,
    minLevel: 9
  },

  GHOST_VALLEY: {
    locationId: 'GHOST_VALLEY',
    name: 'Ghost Valley',
    description: 'A mysterious valley known for elk and other large game, as well as legendary predators.',
    shortDescription: 'Remote valley with trophy game',

    availableAnimals: [
      AnimalSpecies.WHITE_TAILED_DEER,
      AnimalSpecies.MULE_DEER,
      AnimalSpecies.ELK,
      AnimalSpecies.WILD_BOAR,
      AnimalSpecies.BLACK_BEAR,
      AnimalSpecies.GRIZZLY_BEAR,
      AnimalSpecies.MOUNTAIN_LION,
      AnimalSpecies.WOLF
    ],

    spawnRates: {
      [AnimalSpecies.WHITE_TAILED_DEER]: 0.3,
      [AnimalSpecies.MULE_DEER]: 0.25,
      [AnimalSpecies.ELK]: 0.2,
      [AnimalSpecies.WILD_BOAR]: 0.2,
      [AnimalSpecies.BLACK_BEAR]: 0.15,
      [AnimalSpecies.GRIZZLY_BEAR]: 0.08,
      [AnimalSpecies.MOUNTAIN_LION]: 0.1,
      [AnimalSpecies.WOLF]: 0.18,
      // Default 0 for others
      [AnimalSpecies.RABBIT]: 0,
      [AnimalSpecies.PRAIRIE_DOG]: 0,
      [AnimalSpecies.SQUIRREL]: 0,
      [AnimalSpecies.RACCOON]: 0,
      [AnimalSpecies.SKUNK]: 0,
      [AnimalSpecies.OPOSSUM]: 0,
      [AnimalSpecies.TURKEY]: 0,
      [AnimalSpecies.PHEASANT]: 0,
      [AnimalSpecies.DUCK]: 0,
      [AnimalSpecies.GOOSE]: 0,
      [AnimalSpecies.COYOTE]: 0,
      [AnimalSpecies.FOX]: 0,
      [AnimalSpecies.BADGER]: 0,
      [AnimalSpecies.PRONGHORN]: 0,
      [AnimalSpecies.JAVELINA]: 0,
      [AnimalSpecies.BIGHORN_SHEEP]: 0,
      [AnimalSpecies.BISON]: 0,
      [AnimalSpecies.EAGLE]: 0,
      [AnimalSpecies.RATTLESNAKE]: 0,
      [AnimalSpecies.ARMADILLO]: 0,
      [AnimalSpecies.PORCUPINE]: 0
    },

    terrain: 'forest',
    coverLevel: 7,
    dangerLevel: 8,

    energyCost: 17,
    minLevel: 10
  }
};

/**
 * Get hunting ground by ID
 */
export function getHuntingGround(locationId: string): HuntingGround | undefined {
  return HUNTING_GROUNDS[locationId];
}

/**
 * Get all hunting grounds
 */
export function getAllHuntingGrounds(): HuntingGround[] {
  return Object.values(HUNTING_GROUNDS);
}

/**
 * Get hunting grounds available at character level
 */
export function getAvailableHuntingGrounds(characterLevel: number): HuntingGround[] {
  return Object.values(HUNTING_GROUNDS).filter(
    ground => ground.minLevel <= characterLevel
  );
}

/**
 * Get hunting grounds by terrain type
 */
export function getHuntingGroundsByTerrain(
  terrain: 'plains' | 'forest' | 'mountains' | 'desert' | 'swamp'
): HuntingGround[] {
  return Object.values(HUNTING_GROUNDS).filter(ground => ground.terrain === terrain);
}
