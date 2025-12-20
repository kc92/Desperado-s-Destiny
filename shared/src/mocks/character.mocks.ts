/**
 * Character Mock Data Generators
 *
 * Generate realistic mock character data for testing and development
 */

import {
  Character,
  SafeCharacter,
  CharacterCreation,
  CharacterListItem,
  Faction
} from '../types/character.types';
import { generateMockId } from './user.mocks';
import { PROGRESSION, ENERGY } from '../constants/game.constants';

/**
 * Generates a mock Character object
 */
export function mockCharacter(overrides?: Partial<Character>): Character {
  const level = overrides?.level || 1;
  const experienceToNextLevel = calculateExperienceForLevel(level + 1);

  const defaultCharacter: Character = {
    _id: generateMockId(),
    userId: generateMockId(),
    name: generateMockCharacterName(),
    faction: getRandomFaction(),
    level,
    experience: 0,
    experienceToNextLevel,
    energy: ENERGY.FREE_MAX,
    maxEnergy: ENERGY.FREE_MAX,
    lastEnergyRegen: new Date(),
    locationId: 'red-gulch',
    destinyDeck: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    ...overrides
  };

  return defaultCharacter;
}

/**
 * Generates a mock SafeCharacter object
 */
export function mockSafeCharacter(overrides?: Partial<SafeCharacter>): SafeCharacter {
  return {
    _id: generateMockId(),
    name: generateMockCharacterName(),
    faction: getRandomFaction(),
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 0,
      hairStyle: 0,
      hairColor: 0
    },
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    energy: ENERGY.FREE_MAX,
    maxEnergy: ENERGY.FREE_MAX,
    dollars: 100,
    goldResource: 0,
    silverResource: 0,
    gold: 100,
    currentLocation: 'red-gulch',
    gangId: null,
    stats: {
      cunning: 0,
      spirit: 0,
      combat: 0,
      craft: 0
    },
    skills: [],
    inventory: [],
    combatStats: {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0
    },
    isJailed: false,
    jailedUntil: null,
    wantedLevel: 0,
    bountyAmount: 0,
    createdAt: new Date(),
    lastActive: new Date(),
    ...overrides
  };
}

/**
 * Generates mock CharacterCreation data
 */
export function mockCharacterCreation(overrides?: Partial<CharacterCreation>): CharacterCreation {
  return {
    name: generateMockCharacterName(),
    faction: getRandomFaction(),
    ...overrides
  };
}

/**
 * Generates a mock CharacterListItem
 */
export function mockCharacterListItem(overrides?: Partial<CharacterListItem>): CharacterListItem {
  const character = mockCharacter(overrides);
  return {
    _id: character._id,
    name: character.name,
    faction: character.faction,
    level: character.level,
    locationId: character.locationId
  };
}

/**
 * Generates an array of mock characters
 */
export function mockCharacters(count: number, overrides?: Partial<Character>): Character[] {
  return Array.from({ length: count }, () => mockCharacter(overrides));
}

/**
 * Generates a random character name
 */
export function generateMockCharacterName(): string {
  const firstNames = [
    'Jack', 'Sarah', 'Miguel', 'Rosa', 'William', 'Elena',
    'Jesse', 'Maria', 'Cole', 'Isabella', 'Wyatt', 'Carmen',
    'Hank', 'Lucia', 'Buck', 'Guadalupe'
  ];

  const lastNames = [
    'Thornton', 'McAllister', 'Rodriguez', 'Fernandez', 'O\'Brien',
    'Garcia', 'Blackwood', 'Ramirez', 'Sterling', 'Cruz',
    'Hawkins', 'Morales', 'Cassidy', 'Reyes'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${firstName} ${lastName}`;
}

/**
 * Gets a random faction
 */
export function getRandomFaction(): Faction {
  const factions = [Faction.SETTLER_ALLIANCE, Faction.NAHI_COALITION, Faction.FRONTERA];
  return factions[Math.floor(Math.random() * factions.length)];
}

/**
 * Calculates experience required for a given level
 */
function calculateExperienceForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, level - 2));
}

/**
 * Generates a character at a specific level with appropriate experience
 */
export function mockCharacterAtLevel(level: number, overrides?: Partial<Character>): Character {
  const totalExperience = Array.from({ length: level - 1 }, (_, i) =>
    calculateExperienceForLevel(i + 2)
  ).reduce((sum, exp) => sum + exp, 0);

  return mockCharacter({
    level,
    experience: totalExperience,
    experienceToNextLevel: calculateExperienceForLevel(level + 1),
    ...overrides
  });
}
