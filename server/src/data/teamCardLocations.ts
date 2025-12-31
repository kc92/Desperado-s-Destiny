/**
 * Team Card Game Locations
 * Locations where team-based card games can be played
 */

import {
  TeamCardLocation,
  TeamCardGameType,
  LocationUnlockRequirements
} from '@desperados/shared';

// =============================================================================
// LOCATION DEFINITIONS
// =============================================================================

/**
 * The Dusty Rose Back Room - Red Gulch
 * Entry-level location for Euchre and Spades
 */
export const DUSTY_ROSE_BACK_ROOM: TeamCardLocation = {
  id: 'saloon_back_room',
  name: 'The Dusty Rose Back Room',
  description: 'A smoke-filled room behind the Dusty Rose Saloon where serious games happen away from prying eyes.',
  locationId: 'red_gulch',
  availableGames: [TeamCardGameType.EUCHRE, TeamCardGameType.SPADES],
  raidBosses: ['black_hat_morgan'],
  unlockRequirements: {
    level: 10,
    gamblingSkill: 15
  },
  atmosphere: {
    theme: 'saloon',
    ambience: 'smoke_filled_room',
    backgroundMusic: 'honky_tonk_piano'
  }
};

/**
 * The Golden Dragon Car - Railroad
 * High-stakes games on the moving train
 */
export const GOLDEN_DRAGON_CAR: TeamCardLocation = {
  id: 'railroad_car',
  name: 'The Golden Dragon Car',
  description: 'A private railroad car where high-stakes games never stop. The Chinese Consortium\'s floating casino.',
  locationId: 'railroad',
  availableGames: [TeamCardGameType.BRIDGE, TeamCardGameType.PINOCHLE, TeamCardGameType.SPADES],
  raidBosses: ['lady_luck', 'the_alchemist'],
  unlockRequirements: {
    level: 20,
    gamblingSkill: 35,
    reputation: {
      faction: 'chinese_diaspora',
      minimum: 25
    }
  },
  atmosphere: {
    theme: 'railroad',
    ambience: 'train_rhythm',
    backgroundMusic: 'oriental_strings'
  }
};

/**
 * Perdition's Card Hall - Widow's Peak (Ghost Town)
 * The dead play eternal Hearts
 */
export const PERDITIONS_CARD_HALL: TeamCardLocation = {
  id: 'ghost_town',
  name: 'Perdition\'s Card Hall',
  description: 'In the abandoned town of Widow\'s Peak, the dead gather to play their eternal games. Hearts is the game of choice.',
  locationId: 'widows_peak',
  availableGames: [TeamCardGameType.HEARTS],
  raidBosses: ['the_reaper'],
  unlockRequirements: {
    level: 15,
    gamblingSkill: 25,
    cosmicProgress: {
      corruptionLevel: 10
    }
  },
  atmosphere: {
    theme: 'ghost_town',
    ambience: 'whispers_wind',
    backgroundMusic: 'haunted_waltz'
  }
};

/**
 * The Gentleman's Club - Frontera
 * Elite Bridge players only
 */
export const GENTLEMANS_CLUB: TeamCardLocation = {
  id: 'gentlemans_club',
  name: 'The Gentleman\'s Club',
  description: 'Frontera\'s exclusive club for the wealthy and well-connected. Only the finest Bridge players are welcome.',
  locationId: 'frontera',
  availableGames: [TeamCardGameType.BRIDGE, TeamCardGameType.EUCHRE, TeamCardGameType.SPADES, TeamCardGameType.HEARTS, TeamCardGameType.PINOCHLE],
  raidBosses: ['the_contractor'],
  unlockRequirements: {
    level: 30,
    gamblingSkill: 50,
    reputation: {
      faction: 'frontera_elite',
      minimum: 40
    }
  },
  atmosphere: {
    theme: 'fancy',
    ambience: 'chandelier_clink',
    backgroundMusic: 'classical_strings'
  }
};

/**
 * Devil's Crossroads - Wilderness
 * Nightmare difficulty only - where demons deal
 */
export const DEVILS_CROSSROADS: TeamCardLocation = {
  id: 'devils_crossroads',
  name: 'Devil\'s Crossroads',
  description: 'Where two trails meet under a blood moon, the Devil himself deals cards. Only the brave or foolish come here.',
  locationId: 'wilderness',
  availableGames: [TeamCardGameType.EUCHRE, TeamCardGameType.SPADES, TeamCardGameType.HEARTS, TeamCardGameType.BRIDGE, TeamCardGameType.PINOCHLE],
  raidBosses: ['black_hat_morgan', 'lady_luck', 'the_reaper', 'the_contractor', 'the_alchemist'],
  unlockRequirements: {
    level: 40,
    gamblingSkill: 60,
    questComplete: 'the_devils_bargain',
    cosmicProgress: {
      storyProgress: 'act_3_complete'
    }
  },
  atmosphere: {
    theme: 'wilderness',
    ambience: 'crossroads_wind',
    backgroundMusic: 'hellfire_fiddle'
  }
};

/**
 * The Mississippi Belle - River
 * Classic riverboat gambling
 */
export const MISSISSIPPI_BELLE: TeamCardLocation = {
  id: 'mississippi_belle',
  name: 'The Mississippi Belle',
  description: 'A paddle steamer casino that docks at various towns. Weekend tournaments and high-stakes games.',
  locationId: 'river_port',
  availableGames: [TeamCardGameType.EUCHRE, TeamCardGameType.SPADES, TeamCardGameType.PINOCHLE],
  raidBosses: ['black_hat_morgan'],
  unlockRequirements: {
    level: 15,
    gamblingSkill: 20
  },
  atmosphere: {
    theme: 'railroad', // Similar vibe to train
    ambience: 'paddle_wheel',
    backgroundMusic: 'dixieland_jazz'
  }
};

/**
 * The Miner's Rest - Mining Town
 * Working class card games
 */
export const MINERS_REST: TeamCardLocation = {
  id: 'miners_rest',
  name: 'The Miner\'s Rest',
  description: 'Miners spend their hard-earned pay at the card tables. Rough games, rougher players.',
  locationId: 'mining_town',
  availableGames: [TeamCardGameType.EUCHRE, TeamCardGameType.HEARTS],
  raidBosses: [],
  unlockRequirements: {
    level: 5,
    gamblingSkill: 5
  },
  atmosphere: {
    theme: 'saloon',
    ambience: 'mining_town',
    backgroundMusic: 'folk_guitar'
  }
};

// =============================================================================
// LOCATION REGISTRY
// =============================================================================

export const TEAM_CARD_LOCATIONS: Record<string, TeamCardLocation> = {
  [DUSTY_ROSE_BACK_ROOM.id]: DUSTY_ROSE_BACK_ROOM,
  [GOLDEN_DRAGON_CAR.id]: GOLDEN_DRAGON_CAR,
  [PERDITIONS_CARD_HALL.id]: PERDITIONS_CARD_HALL,
  [GENTLEMANS_CLUB.id]: GENTLEMANS_CLUB,
  [DEVILS_CROSSROADS.id]: DEVILS_CROSSROADS,
  [MISSISSIPPI_BELLE.id]: MISSISSIPPI_BELLE,
  [MINERS_REST.id]: MINERS_REST
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get location by ID
 */
export function getLocationById(locationId: string): TeamCardLocation | undefined {
  return TEAM_CARD_LOCATIONS[locationId];
}

/**
 * Get all locations for a game type
 */
export function getLocationsForGameType(gameType: TeamCardGameType): TeamCardLocation[] {
  return Object.values(TEAM_CARD_LOCATIONS).filter(location =>
    location.availableGames.includes(gameType)
  );
}

/**
 * Get locations with raid bosses
 */
export function getLocationsWithRaids(): TeamCardLocation[] {
  return Object.values(TEAM_CARD_LOCATIONS).filter(location =>
    location.raidBosses.length > 0
  );
}

/**
 * Get locations by theme
 */
export function getLocationsByTheme(
  theme: 'saloon' | 'railroad' | 'ghost_town' | 'fancy' | 'wilderness'
): TeamCardLocation[] {
  return Object.values(TEAM_CARD_LOCATIONS).filter(location =>
    location.atmosphere.theme === theme
  );
}

/**
 * Check if a character meets location unlock requirements
 */
export function checkLocationAccess(
  requirements: LocationUnlockRequirements,
  character: {
    level: number;
    skills: Record<string, number>;
    reputation: Record<string, number>;
    cosmicProgress?: { corruptionLevel?: number; storyProgress?: string };
    completedQuests?: string[];
  }
): { canAccess: boolean; missingRequirements: string[] } {
  const missing: string[] = [];

  // Check level
  if (requirements.level && character.level < requirements.level) {
    missing.push(`Level ${requirements.level} required (you are ${character.level})`);
  }

  // Check gambling skill
  if (requirements.gamblingSkill) {
    const gamblingSkill = character.skills?.gambling || 0;
    if (gamblingSkill < requirements.gamblingSkill) {
      missing.push(`Gambling skill ${requirements.gamblingSkill} required (you have ${gamblingSkill})`);
    }
  }

  // Check reputation
  if (requirements.reputation) {
    const factionRep = character.reputation?.[requirements.reputation.faction] || 0;
    if (factionRep < requirements.reputation.minimum) {
      missing.push(`${requirements.reputation.faction} reputation ${requirements.reputation.minimum} required (you have ${factionRep})`);
    }
  }

  // Check quest completion
  if (requirements.questComplete) {
    if (!character.completedQuests?.includes(requirements.questComplete)) {
      missing.push(`Must complete quest: ${requirements.questComplete}`);
    }
  }

  // Check cosmic progress
  if (requirements.cosmicProgress) {
    if (requirements.cosmicProgress.corruptionLevel) {
      const corruption = character.cosmicProgress?.corruptionLevel || 0;
      if (corruption < requirements.cosmicProgress.corruptionLevel) {
        missing.push(`Corruption level ${requirements.cosmicProgress.corruptionLevel} required`);
      }
    }
    if (requirements.cosmicProgress.storyProgress) {
      if (character.cosmicProgress?.storyProgress !== requirements.cosmicProgress.storyProgress) {
        missing.push(`Story progress required: ${requirements.cosmicProgress.storyProgress}`);
      }
    }
  }

  return {
    canAccess: missing.length === 0,
    missingRequirements: missing
  };
}

/**
 * Get accessible locations for a character
 */
export function getAccessibleLocations(character: {
  level: number;
  skills: Record<string, number>;
  reputation: Record<string, number>;
  cosmicProgress?: { corruptionLevel?: number; storyProgress?: string };
  completedQuests?: string[];
}): TeamCardLocation[] {
  return Object.values(TEAM_CARD_LOCATIONS).filter(location => {
    const access = checkLocationAccess(location.unlockRequirements, character);
    return access.canAccess;
  });
}

/**
 * Get entry-level locations (no special requirements)
 */
export function getEntryLevelLocations(): TeamCardLocation[] {
  return Object.values(TEAM_CARD_LOCATIONS).filter(location =>
    !location.unlockRequirements.reputation &&
    !location.unlockRequirements.questComplete &&
    !location.unlockRequirements.cosmicProgress &&
    (location.unlockRequirements.level || 0) <= 10 &&
    (location.unlockRequirements.gamblingSkill || 0) <= 15
  );
}
