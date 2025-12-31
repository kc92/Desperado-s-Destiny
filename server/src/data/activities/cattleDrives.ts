/**
 * Cattle Drives Data
 * Routes, events, and configuration for the cattle drive system
 *
 * Sprint 7: Mid-Game Content - Cattle Drives (L30 unlock)
 */

import { SecureRNG } from '../../services/base/SecureRNG';

// =============================================================================
// TYPES
// =============================================================================

export type DriveRoute = 'short_trail' | 'long_trail' | 'dangerous_trail' | 'cattle_baron_run';

export interface DriveRouteConfig {
  routeId: DriveRoute;
  name: string;
  description: string;
  levelRequired: number;
  phases: number;
  energyCostPerPhase: number;
  baseCattleCapacity: number;
  baseReward: number;
  baseXp: number;
  eventChance: number;
  participantBonusPercent: number;
  flavorText: string;
}

export interface DriveEventChoice {
  choiceId: string;
  label: string;
  description: string;
  skillCheck?: {
    skill: string;
    difficulty: number;
  };
  successOutcome: {
    cattleSavedPercent: number;
    bonusGold?: number;
    message: string;
  };
  failureOutcome: {
    cattleLostPercent: number;
    message: string;
  };
}

export interface DriveEvent {
  eventId: string;
  name: string;
  description: string;
  choices: DriveEventChoice[];
  baseCattleLoss: { min: number; max: number };
  flavorText: string;
}

// =============================================================================
// DRIVE ROUTES
// =============================================================================

export const DRIVE_ROUTES: Record<DriveRoute, DriveRouteConfig> = {
  short_trail: {
    routeId: 'short_trail',
    name: 'Short Trail',
    description: 'A quick drive through familiar territory to the nearest market town.',
    levelRequired: 30,
    phases: 3,
    energyCostPerPhase: 15,
    baseCattleCapacity: 50,
    baseReward: 5000,
    baseXp: 1000,
    eventChance: 0.3,
    participantBonusPercent: 15,
    flavorText: 'An easy route for novice trail bosses. The path is well-worn and the dangers are few.'
  },

  long_trail: {
    routeId: 'long_trail',
    name: 'Long Trail',
    description: 'A challenging drive across rough terrain to a distant cattle market.',
    levelRequired: 33,
    phases: 5,
    energyCostPerPhase: 20,
    baseCattleCapacity: 75,
    baseReward: 12000,
    baseXp: 2500,
    eventChance: 0.4,
    participantBonusPercent: 20,
    flavorText: 'Veteran drovers prefer this profitable route. The longer journey means better prices.'
  },

  dangerous_trail: {
    routeId: 'dangerous_trail',
    name: 'Dangerous Trail',
    description: 'A perilous journey through hostile territory where rustlers and nature conspire against you.',
    levelRequired: 36,
    phases: 7,
    energyCostPerPhase: 25,
    baseCattleCapacity: 100,
    baseReward: 25000,
    baseXp: 5000,
    eventChance: 0.5,
    participantBonusPercent: 25,
    flavorText: 'Only the boldest trail bosses attempt this run. Many have lost everything on this trail.'
  },

  cattle_baron_run: {
    routeId: 'cattle_baron_run',
    name: 'Cattle Baron Run',
    description: 'The legendary route that made fortunes and broke men. A true test of a drover\'s mettle.',
    levelRequired: 40,
    phases: 10,
    energyCostPerPhase: 30,
    baseCattleCapacity: 150,
    baseReward: 50000,
    baseXp: 10000,
    eventChance: 0.6,
    participantBonusPercent: 30,
    flavorText: 'Complete this and you\'ll be the talk of the territory. Fail, and they might not find your bones.'
  }
};

// =============================================================================
// DRIVE EVENTS
// =============================================================================

export const DRIVE_EVENTS: DriveEvent[] = [
  {
    eventId: 'rustlers',
    name: 'Rustler Attack',
    description: 'A gang of cattle rustlers ambushes your herd! They\'re armed and mean business.',
    choices: [
      {
        choiceId: 'fight',
        label: 'Fight them off',
        description: 'Draw your weapons and defend your herd.',
        skillCheck: { skill: 'firearms', difficulty: 5 },
        successOutcome: {
          cattleSavedPercent: 100,
          bonusGold: 500,
          message: 'You drove off the rustlers and found some gold in their saddlebags!'
        },
        failureOutcome: {
          cattleLostPercent: 15,
          message: 'The fight was brutal. You drove them off but lost some cattle in the chaos.'
        }
      },
      {
        choiceId: 'negotiate',
        label: 'Pay them off',
        description: 'Offer them a cut to leave peacefully.',
        successOutcome: {
          cattleSavedPercent: 90,
          message: 'They took their bribe and rode off. Cheaper than a gunfight.'
        },
        failureOutcome: {
          cattleLostPercent: 5,
          message: 'They took your money and a few cattle. Could have been worse.'
        }
      },
      {
        choiceId: 'flee',
        label: 'Scatter and flee',
        description: 'Disperse the herd and regroup later.',
        successOutcome: {
          cattleSavedPercent: 70,
          message: 'You scattered the herd and escaped. Took hours to round them up again.'
        },
        failureOutcome: {
          cattleLostPercent: 20,
          message: 'The rustlers got a good portion of your herd while you fled.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 15 },
    flavorText: 'The frontier is full of men who\'d rather steal than work.'
  },

  {
    eventId: 'stampede',
    name: 'Stampede!',
    description: 'Something spooked the herd - they\'re running wild! The thunder of hooves shakes the earth.',
    choices: [
      {
        choiceId: 'ride_ahead',
        label: 'Ride ahead to turn them',
        description: 'Race to the front and try to turn the herd.',
        skillCheck: { skill: 'riding', difficulty: 6 },
        successOutcome: {
          cattleSavedPercent: 95,
          message: 'Masterful riding! You turned the herd before anyone got hurt.'
        },
        failureOutcome: {
          cattleLostPercent: 25,
          message: 'You couldn\'t get ahead in time. Many cattle ran off cliffs or into ravines.'
        }
      },
      {
        choiceId: 'let_run',
        label: 'Let them run it out',
        description: 'Stay back and let the cattle exhaust themselves.',
        successOutcome: {
          cattleSavedPercent: 75,
          message: 'They finally stopped, but many strayed far from the trail.'
        },
        failureOutcome: {
          cattleLostPercent: 10,
          message: 'The stampede wore itself out. You lost some stragglers to the wilderness.'
        }
      }
    ],
    baseCattleLoss: { min: 10, max: 25 },
    flavorText: 'A stampede can happen without warning. Stay alert.'
  },

  {
    eventId: 'river_crossing',
    name: 'Dangerous River Crossing',
    description: 'The river is running high from recent rains. Crossing will be risky, but going around adds days to the journey.',
    choices: [
      {
        choiceId: 'ford_now',
        label: 'Ford the river now',
        description: 'Push through the swollen river.',
        skillCheck: { skill: 'survival', difficulty: 5 },
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'You found a shallow crossing and got everyone across safely.'
        },
        failureOutcome: {
          cattleLostPercent: 20,
          message: 'The current was too strong. Several cattle were swept downstream.'
        }
      },
      {
        choiceId: 'wait',
        label: 'Wait for waters to recede',
        description: 'Camp here and wait for safer conditions.',
        successOutcome: {
          cattleSavedPercent: 95,
          message: 'A day later, the crossing was much easier. Lost time but saved cattle.'
        },
        failureOutcome: {
          cattleLostPercent: 5,
          message: 'Some cattle wandered off during the wait, but most made it across.'
        }
      },
      {
        choiceId: 'find_bridge',
        label: 'Find a bridge (costs time)',
        description: 'Take a detour to find a safer crossing.',
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'The bridge was out of the way, but everyone crossed safely.'
        },
        failureOutcome: {
          cattleLostPercent: 0,
          message: 'The detour added time, but you didn\'t lose a single head.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 20 },
    flavorText: 'Rivers have claimed more cattle than any rustler gang.'
  },

  {
    eventId: 'weather',
    name: 'Severe Weather',
    description: 'Dark clouds gather on the horizon. A violent storm is approaching fast.',
    choices: [
      {
        choiceId: 'push_through',
        label: 'Push through',
        description: 'Keep moving despite the storm.',
        skillCheck: { skill: 'toughness', difficulty: 4 },
        successOutcome: {
          cattleSavedPercent: 90,
          message: 'The storm was brutal, but your determination kept the herd together.'
        },
        failureOutcome: {
          cattleLostPercent: 15,
          message: 'Lightning spooked the cattle and the wind scattered them.'
        }
      },
      {
        choiceId: 'shelter',
        label: 'Find shelter and wait',
        description: 'Hunker down until the storm passes.',
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'You found a sheltered canyon. Everyone stayed dry and safe.'
        },
        failureOutcome: {
          cattleLostPercent: 5,
          message: 'The shelter was cramped. A few cattle broke loose in the confusion.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 15 },
    flavorText: 'Weather on the frontier changes faster than a gambler\'s luck.'
  },

  {
    eventId: 'breakdown',
    name: 'Equipment Breakdown',
    description: 'Your chuck wagon has broken an axle. Without supplies, the drive will be much harder.',
    choices: [
      {
        choiceId: 'repair',
        label: 'Repair it',
        description: 'Attempt to fix the broken axle.',
        skillCheck: { skill: 'crafting', difficulty: 4 },
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'Good as new! The wagon rolls on.'
        },
        failureOutcome: {
          cattleLostPercent: 5,
          message: 'The repair took longer than expected. Lost some stragglers while working.'
        }
      },
      {
        choiceId: 'abandon',
        label: 'Abandon the wagon',
        description: 'Leave the wagon and continue without it.',
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'The drive continues, though morale is lower without hot meals.'
        },
        failureOutcome: {
          cattleLostPercent: 0,
          message: 'No cattle lost, but your supplies are gone.'
        }
      }
    ],
    baseCattleLoss: { min: 0, max: 5 },
    flavorText: 'A good chuck wagon is worth its weight in gold on the trail.'
  },

  {
    eventId: 'predators',
    name: 'Predator Attack',
    description: 'Wolves are circling your herd at night. Their eyes gleam in the firelight.',
    choices: [
      {
        choiceId: 'shoot',
        label: 'Shoot them',
        description: 'Take aim and thin out the pack.',
        skillCheck: { skill: 'firearms', difficulty: 4 },
        successOutcome: {
          cattleSavedPercent: 100,
          bonusGold: 200,
          message: 'Every shot found its mark. Wolf pelts will fetch a good price.'
        },
        failureOutcome: {
          cattleLostPercent: 10,
          message: 'Your shots went wide in the dark. The wolves got some calves.'
        }
      },
      {
        choiceId: 'fire',
        label: 'Build fires to scare them',
        description: 'Ring the herd with fires to keep predators at bay.',
        successOutcome: {
          cattleSavedPercent: 95,
          message: 'The fires kept the wolves at bay, though you didn\'t sleep much.'
        },
        failureOutcome: {
          cattleLostPercent: 5,
          message: 'A few bold wolves slipped past the fires, but most stayed back.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 10 },
    flavorText: 'The wilderness is always watching, always hungry.'
  },

  {
    eventId: 'sickness',
    name: 'Cattle Sickness',
    description: 'Some of your cattle are showing signs of illness. Fever, lethargy, and loss of appetite.',
    choices: [
      {
        choiceId: 'treat',
        label: 'Treat them',
        description: 'Use your medical knowledge to cure the sick.',
        skillCheck: { skill: 'medicine', difficulty: 5 },
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'Your treatment worked! All cattle recovered within days.'
        },
        failureOutcome: {
          cattleLostPercent: 15,
          message: 'Despite your efforts, the sickness spread through the herd.'
        }
      },
      {
        choiceId: 'isolate',
        label: 'Isolate and continue',
        description: 'Separate the sick cattle and push on.',
        successOutcome: {
          cattleSavedPercent: 85,
          message: 'The sick ones didn\'t make it, but you saved the rest.'
        },
        failureOutcome: {
          cattleLostPercent: 10,
          message: 'The sickness spread to a few healthy ones before you isolated them.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 15 },
    flavorText: 'Disease can wipe out a herd faster than any stampede.'
  },

  {
    eventId: 'lost_cattle',
    name: 'Cattle Wandered Off',
    description: 'Some cattle have strayed from the herd overnight. Their tracks lead into rough country.',
    choices: [
      {
        choiceId: 'search',
        label: 'Search for them',
        description: 'Track down the strays.',
        skillCheck: { skill: 'tracking', difficulty: 3 },
        successOutcome: {
          cattleSavedPercent: 100,
          message: 'You found every last stray and brought them back.'
        },
        failureOutcome: {
          cattleLostPercent: 10,
          message: 'The tracks led into a box canyon. Found some, but not all.'
        }
      },
      {
        choiceId: 'continue',
        label: 'Cut your losses',
        description: 'Leave the strays and keep moving.',
        successOutcome: {
          cattleSavedPercent: 90,
          message: 'Hard choice, but the drive must go on.'
        },
        failureOutcome: {
          cattleLostPercent: 10,
          message: 'Those cattle are gone. Best not to think about it.'
        }
      }
    ],
    baseCattleLoss: { min: 5, max: 10 },
    flavorText: 'Cattle are creatures of habit, but the frontier calls to some.'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a drive route by ID
 */
export function getDriveRoute(routeId: DriveRoute): DriveRouteConfig | undefined {
  return DRIVE_ROUTES[routeId];
}

/**
 * Get available routes for a character level
 */
export function getAvailableRoutes(level: number): DriveRouteConfig[] {
  return Object.values(DRIVE_ROUTES).filter(route => level >= route.levelRequired);
}

/**
 * Get a random event for a drive
 */
export function getRandomEvent(): DriveEvent {
  return SecureRNG.select(DRIVE_EVENTS);
}

/**
 * Get an event by ID
 */
export function getEventById(eventId: string): DriveEvent | undefined {
  return DRIVE_EVENTS.find(e => e.eventId === eventId);
}

/**
 * Calculate cattle loss based on event outcome
 */
export function calculateCattleLoss(
  currentCattle: number,
  lossPercent: number
): number {
  return Math.floor(currentCattle * (lossPercent / 100));
}

/**
 * Calculate final rewards based on cattle survival
 */
export function calculateDriveRewards(
  route: DriveRouteConfig,
  startingCattle: number,
  currentCattle: number,
  participantCount: number,
  bonusGold: number = 0
): { gold: number; xp: number; survivalRate: number } {
  const survivalRate = currentCattle / startingCattle;
  const participantBonus = 1 + ((participantCount - 1) * route.participantBonusPercent / 100);

  const gold = Math.floor(route.baseReward * survivalRate * participantBonus) + bonusGold;
  const xp = Math.floor(route.baseXp * survivalRate);

  return { gold, xp, survivalRate };
}
