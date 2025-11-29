/**
 * Race Templates and Prestigious Events
 * Phase 13, Wave 13.2
 *
 * Definitions for race templates and special racing events
 */

import {
  PrestigiousRacingEvent,
  RaceType,
  GamblingPrize,
  Trophy,
  SilkPattern
} from '@desperados/shared';

// ============================================================================
// TROPHIES
// ============================================================================

export const RACING_TROPHIES: Record<string, Trophy> = {
  FRONTIER_DERBY_CHAMPION: {
    id: 'FRONTIER_DERBY_CHAMPION',
    name: 'Frontier Derby Champion',
    description: 'Winner of the legendary Frontier Derby, the most prestigious race in the Sangre Territories',
    icon: 'trophy_gold_horse',
    prestige: 100,
    displayInProfile: true
  },

  SANGRE_STAKES_WINNER: {
    id: 'SANGRE_STAKES_WINNER',
    name: 'Sangre Stakes Winner',
    description: 'Monthly championship winner',
    icon: 'trophy_silver_horseshoe',
    prestige: 50,
    displayInProfile: true
  },

  QUARTER_HORSE_CHAMPION: {
    id: 'QUARTER_HORSE_CHAMPION',
    name: 'Quarter Horse Champion',
    description: 'Fastest sprint racer in the territory',
    icon: 'trophy_bronze_lightning',
    prestige: 60,
    displayInProfile: true
  },

  ENDURANCE_MASTER: {
    id: 'ENDURANCE_MASTER',
    name: 'Endurance Master',
    description: 'Completed the grueling Cross-Country Challenge',
    icon: 'trophy_iron_stamina',
    prestige: 75,
    displayInProfile: true
  },

  STEEPLECHASE_LEGEND: {
    id: 'STEEPLECHASE_LEGEND',
    name: 'Steeplechase Legend',
    description: 'Master of obstacle racing at Fort Ashford',
    icon: 'trophy_silver_jump',
    prestige: 65,
    displayInProfile: true
  },

  OUTLAW_TRACK_KING: {
    id: 'OUTLAW_TRACK_KING',
    name: 'Outlaw Track King',
    description: 'Undefeated champion of the dangerous Frontera Outlaw Track',
    icon: 'trophy_skull_crown',
    prestige: 70,
    displayInProfile: true
  }
};

// ============================================================================
// PRESTIGIOUS RACING EVENTS
// ============================================================================

export const PRESTIGIOUS_EVENTS: Record<string, PrestigiousRacingEvent> = {
  // 1. FRONTIER DERBY - Annual, most prestigious
  FRONTIER_DERBY: {
    id: 'FRONTIER_DERBY',
    name: 'The Frontier Derby',
    description: 'The most prestigious horse race in the Sangre Territories. Only the finest horses and riders compete for glory, riches, and eternal fame.',
    lore: 'Founded fifty years ago by cattle baron Cornelius Whitmore, the Frontier Derby has crowned the finest horses in the West. Winners are remembered for generations, their names etched in silver on the Champion\'s Wall at Whiskey Bend Downs.',

    eventType: 'DERBY',
    raceType: RaceType.LONG_DISTANCE,
    prestige: 10,

    frequency: 'ANNUAL',
    nextOccurrence: new Date('2026-05-15'), // Third Saturday in May
    duration: 180,

    entryFee: 1000,
    qualificationRequired: true,
    qualificationCriteria: {
      minWins: 5,
      minRaceLevel: 10
    },

    purse: 25000,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 15000,
        reputation: 100,
        experience: 1000
      },
      {
        position: 2,
        gold: 6000,
        reputation: 50,
        experience: 500
      },
      {
        position: 3,
        gold: 3000,
        reputation: 30,
        experience: 300
      },
      {
        position: 4,
        gold: 1000,
        reputation: 15,
        experience: 150
      }
    ],
    trophies: [RACING_TROPHIES.FRONTIER_DERBY_CHAMPION],

    winnerTitle: 'Derby Champion',
    titleDuration: 'ANNUAL',

    maxParticipants: 12,
    minParticipants: 8,

    specialRules: [
      'Horses must be at least 3 years old',
      'Maximum weight carried: 126 lbs',
      'No equipment bonuses allowed',
      'Track will be prepared to FAST condition',
      'Race distance: 1.5 miles (2640 yards)'
    ],

    uniqueRewards: [
      'Derby Winner\'s Blanket of Roses (unique item)',
      'Permanent +5% speed bonus to winning horse',
      'Access to Derby Club (exclusive location)'
    ],

    previousWinners: [],

    trackId: 'WHISKEY_BEND_DOWNS',

    minimumLevel: 15,
    reputationRequired: 200
  },

  // 2. SANGRE STAKES - Monthly championship
  SANGRE_STAKES: {
    id: 'SANGRE_STAKES',
    name: 'Sangre Stakes',
    description: 'Monthly territory championship featuring the best horses and riders. A stepping stone to the Frontier Derby and a chance to prove your worth.',
    lore: 'The Sangre Stakes has been the proving ground for champions since the territories were settled. Many Derby winners got their start here.',

    eventType: 'STAKES',
    raceType: RaceType.MIDDLE_DISTANCE,
    prestige: 8,

    frequency: 'MONTHLY',
    nextOccurrence: new Date('2026-01-30'),
    duration: 120,

    entryFee: 500,
    qualificationRequired: false,

    purse: 5000,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 2500,
        reputation: 40,
        experience: 400
      },
      {
        position: 2,
        gold: 1500,
        reputation: 25,
        experience: 250
      },
      {
        position: 3,
        gold: 1000,
        reputation: 15,
        experience: 150
      }
    ],
    trophies: [RACING_TROPHIES.SANGRE_STAKES_WINNER],

    winnerTitle: 'Stakes Winner',
    titleDuration: 'UNTIL_BEATEN',

    maxParticipants: 10,
    minParticipants: 5,

    specialRules: [
      'Open to all breeds and levels',
      'Half-mile distance (880 yards)',
      'Winner qualifies for Frontier Derby'
    ],

    uniqueRewards: [
      'Automatic Frontier Derby qualification'
    ],

    previousWinners: [],

    trackId: 'WHISKEY_BEND_DOWNS',

    minimumLevel: 8
  },

  // 3. QUARTER HORSE CHAMPIONSHIP - Sprint specialists
  QUARTER_HORSE_CHAMPIONSHIP: {
    id: 'QUARTER_HORSE_CHAMPIONSHIP',
    name: 'Quarter Horse Championship',
    description: 'The ultimate test of pure speed. Quarter mile sprint where only the fastest horses compete for glory and gold.',
    lore: 'Born from impromptu races down Main Street, the Quarter Horse Championship celebrates the explosive speed of the frontier\'s fastest breed.',

    eventType: 'CHAMPIONSHIP',
    raceType: RaceType.SPRINT,
    prestige: 9,

    frequency: 'SEASONAL',
    nextOccurrence: new Date('2026-03-01'),
    duration: 90,

    entryFee: 750,
    qualificationRequired: true,
    qualificationCriteria: {
      minWins: 3,
      specificTrack: 'RED_GULCH_FAIRGROUNDS'
    },

    purse: 10000,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 6000,
        reputation: 60,
        experience: 600
      },
      {
        position: 2,
        gold: 3000,
        reputation: 35,
        experience: 350
      },
      {
        position: 3,
        gold: 1000,
        reputation: 20,
        experience: 200
      }
    ],
    trophies: [RACING_TROPHIES.QUARTER_HORSE_CHAMPION],

    winnerTitle: 'Speed Demon',
    titleDuration: 'ANNUAL',

    maxParticipants: 8,
    minParticipants: 6,

    specialRules: [
      'Quarter mile distance only (440 yards)',
      'Speed record attempts eligible',
      'Only horses with 85+ speed stat may enter',
      'Winner crowned "Fastest Horse in the West"'
    ],

    uniqueRewards: [
      'Golden Horseshoes (unique equipment, +10 speed)',
      'Speed record bonus: +1000 gold if track record broken'
    ],

    previousWinners: [],

    trackId: 'RED_GULCH_FAIRGROUNDS',

    minimumLevel: 10,
    reputationRequired: 100
  },

  // 4. CROSS-COUNTRY CHALLENGE - Endurance test
  CROSS_COUNTRY_CHALLENGE: {
    id: 'CROSS_COUNTRY_CHALLENGE',
    name: 'Cross-Country Challenge',
    description: 'A brutal test of endurance across 10 miles of varied terrain. Only the toughest horses and most skilled riders complete this ultimate challenge.',
    lore: 'Inspired by the great pony express rides, this race tests the limits of horse and rider. Completion alone brings honor; victory brings legend.',

    eventType: 'CHALLENGE',
    raceType: RaceType.ENDURANCE,
    prestige: 9,

    frequency: 'MONTHLY',
    nextOccurrence: new Date('2026-02-15'),
    duration: 240,

    entryFee: 800,
    qualificationRequired: true,
    qualificationCriteria: {
      minRaceLevel: 12
    },

    purse: 15000,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 8000,
        reputation: 80,
        experience: 800
      },
      {
        position: 2,
        gold: 4500,
        reputation: 50,
        experience: 500
      },
      {
        position: 3,
        gold: 2500,
        reputation: 35,
        experience: 350
      }
    ],
    trophies: [RACING_TROPHIES.ENDURANCE_MASTER],

    winnerTitle: 'Endurance Master',
    titleDuration: 'PERMANENT',

    maxParticipants: 15,
    minParticipants: 6,

    specialRules: [
      'Course covers 10 miles of mixed terrain',
      'Mandatory rest stops every 2 miles',
      'Veterinary checks at each checkpoint',
      'Horse must finish in good condition',
      'Riders may be required to dismount and lead horses over dangerous terrain',
      'Stamina and survival matter more than raw speed'
    ],

    uniqueRewards: [
      'Endurance Saddle (unique, +20 stamina)',
      'All finishers receive completion bonus of 500 gold',
      'Permanent +10% endurance for completing horse'
    ],

    previousWinners: [],

    trackId: 'LONGHORN_RANCH_TRACK',

    minimumLevel: 15,
    reputationRequired: 150
  },

  // 5. FORT ASHFORD STEEPLECHASE CLASSIC
  FORT_ASHFORD_CLASSIC: {
    id: 'FORT_ASHFORD_CLASSIC',
    name: 'Fort Ashford Steeplechase Classic',
    description: 'The military\'s premier racing event featuring challenging obstacles and technical jumps. A true test of horse training and rider skill.',
    lore: 'Established to showcase cavalry mounts, this race has become the gold standard for steeplechase competition in the territories.',

    eventType: 'CHAMPIONSHIP',
    raceType: RaceType.STEEPLECHASE,
    prestige: 8,

    frequency: 'MONTHLY',
    nextOccurrence: new Date('2026-02-01'),
    duration: 150,

    entryFee: 600,
    qualificationRequired: false,

    purse: 8000,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 4500,
        reputation: 55,
        experience: 550
      },
      {
        position: 2,
        gold: 2500,
        reputation: 35,
        experience: 350
      },
      {
        position: 3,
        gold: 1000,
        reputation: 20,
        experience: 200
      }
    ],
    trophies: [RACING_TROPHIES.STEEPLECHASE_LEGEND],

    winnerTitle: 'Steeplechase Champion',
    titleDuration: 'UNTIL_BEATEN',

    maxParticipants: 12,
    minParticipants: 6,

    specialRules: [
      '2-mile course with 12 obstacles',
      'Falls result in elimination',
      'Horse must have SURE_FOOTED or RACING_FORM skill',
      'Perfect run bonus: +1000 gold for no faults'
    ],

    uniqueRewards: [
      'Military Barding (unique, +10 bravery)',
      'Fort Ashford training access for one month'
    ],

    previousWinners: [],

    trackId: 'FORT_ASHFORD_CAVALRY_COURSE',

    minimumLevel: 10,
    reputationRequired: 75
  },

  // 6. OUTLAW TRACK SHOWDOWN - Dangerous underground racing
  OUTLAW_TRACK_SHOWDOWN: {
    id: 'OUTLAW_TRACK_SHOWDOWN',
    name: 'Frontera Outlaw Track Showdown',
    description: 'No rules. No regulations. Just pure speed and danger. The most dangerous race in the territories where anything goes and winners take all.',
    lore: 'Where outlaws settle disputes and legends are born. The law doesn\'t reach here, and neither does mercy. Ride fast or die trying.',

    eventType: 'INVITATIONAL',
    raceType: RaceType.SPRINT,
    prestige: 7,

    frequency: 'MONTHLY',
    nextOccurrence: new Date('2026-01-25'),
    duration: 60,

    entryFee: 1500, // High stakes
    qualificationRequired: false,

    purse: 10000, // Winner takes all
    guaranteedPrizes: [
      {
        position: 1,
        gold: 10000,
        reputation: 50,
        experience: 500
      }
      // No prizes for losers - winner takes all!
    ],
    trophies: [RACING_TROPHIES.OUTLAW_TRACK_KING],

    winnerTitle: 'Outlaw Track King',
    titleDuration: 'UNTIL_BEATEN',

    maxParticipants: 6,
    minParticipants: 3,

    specialRules: [
      'WINNER TAKES ALL - No second place prizes',
      'Course changes each race',
      'Interference allowed',
      'No veterinary checks',
      'Bring your own equipment',
      'Law enforcement banned from spectating',
      'Risk of horse injury increased by 50%'
    ],

    uniqueRewards: [
      'Outlaw\'s Spurs (unique, risky speed boost)',
      'Underground racing circuit access'
    ],

    previousWinners: [],

    trackId: 'FRONTERA_OUTLAW_TRACK',

    minimumLevel: 15,
    reputationRequired: 0 // Outlaws don't care about reputation
  },

  // 7. SPIRIT SPRINGS BLESSING RACE - Mystical event
  SPIRIT_SPRINGS_BLESSING: {
    id: 'SPIRIT_SPRINGS_BLESSING',
    name: 'Spirit Springs Blessing Race',
    description: 'A sacred race held at the mystical Spirit Springs. Legend says horses blessed by the spirits run with divine speed.',
    lore: 'For centuries, Native tribes have raced at Spirit Springs during the full moon. Now, all worthy riders are invited to seek the spirits\' blessing.',

    eventType: 'INVITATIONAL',
    raceType: RaceType.MIDDLE_DISTANCE,
    prestige: 9,

    frequency: 'MONTHLY',
    nextOccurrence: new Date('2026-02-20'), // Full moon
    duration: 180,

    entryFee: 500,
    qualificationRequired: true,
    qualificationCriteria: {
      minWins: 2,
      minRaceLevel: 8
    },

    purse: 7500,
    guaranteedPrizes: [
      {
        position: 1,
        gold: 4000,
        reputation: 60,
        experience: 600
      },
      {
        position: 2,
        gold: 2250,
        reputation: 40,
        experience: 400
      },
      {
        position: 3,
        gold: 1250,
        reputation: 25,
        experience: 250
      }
    ],
    trophies: [],

    winnerTitle: 'Spirit-Blessed Rider',
    titleDuration: 'PERMANENT',

    maxParticipants: 10,
    minParticipants: 5,

    specialRules: [
      'Race held during full moon only',
      'Horses with high bond level receive bonuses',
      'Spirit blessing may grant random buffs',
      'Course blessed by tribal elders',
      'Respect for the sacred grounds required'
    ],

    uniqueRewards: [
      'Spirit Blessing (permanent +5% to all horse stats)',
      'Sacred Horseshoe Charm (unique trinket)',
      'Honor among Native tribes'
    ],

    previousWinners: [],

    trackId: 'SPIRIT_SPRINGS_OASIS',

    minimumLevel: 12,
    reputationRequired: 150
  }
};

// ============================================================================
// DEFAULT SILK COLORS
// ============================================================================

export const DEFAULT_SILK_COLORS = [
  {
    pattern: SilkPattern.SOLID,
    primaryColor: '#8B0000', // Dark red
    secondaryColor: '#8B0000',
    sleeves: '#8B0000',
    cap: '#8B0000'
  },
  {
    pattern: SilkPattern.STRIPED,
    primaryColor: '#000080', // Navy
    secondaryColor: '#FFD700', // Gold
    sleeves: '#000080',
    cap: '#FFD700'
  },
  {
    pattern: SilkPattern.CHECKERED,
    primaryColor: '#000000', // Black
    secondaryColor: '#FFFFFF', // White
    sleeves: '#000000',
    cap: '#FFFFFF'
  },
  {
    pattern: SilkPattern.QUARTERED,
    primaryColor: '#228B22', // Forest green
    secondaryColor: '#FFD700', // Gold
    sleeves: '#228B22',
    cap: '#228B22'
  },
  {
    pattern: SilkPattern.DIAGONAL,
    primaryColor: '#8B4513', // Saddle brown
    secondaryColor: '#F5F5DC', // Beige
    sleeves: '#8B4513',
    cap: '#F5F5DC'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get event by ID
 */
export function getPrestigiousEvent(eventId: string): PrestigiousRacingEvent | undefined {
  return PRESTIGIOUS_EVENTS[eventId];
}

/**
 * Get all upcoming prestigious events
 */
export function getUpcomingEvents(): PrestigiousRacingEvent[] {
  const now = new Date();
  return Object.values(PRESTIGIOUS_EVENTS)
    .filter(event => event.nextOccurrence > now)
    .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());
}

/**
 * Get events by type
 */
export function getEventsByType(eventType: PrestigiousRacingEvent['eventType']): PrestigiousRacingEvent[] {
  return Object.values(PRESTIGIOUS_EVENTS).filter(event => event.eventType === eventType);
}

/**
 * Get trophy by ID
 */
export function getTrophy(trophyId: string): Trophy | undefined {
  return RACING_TROPHIES[trophyId];
}

/**
 * Check if character qualifies for event
 */
export function checkEventQualification(
  event: PrestigiousRacingEvent,
  characterLevel: number,
  characterReputation: number,
  raceWins: number
): { qualified: boolean; reason?: string } {
  if (event.minimumLevel && characterLevel < event.minimumLevel) {
    return {
      qualified: false,
      reason: `Requires level ${event.minimumLevel}`
    };
  }

  if (event.reputationRequired && characterReputation < event.reputationRequired) {
    return {
      qualified: false,
      reason: `Requires ${event.reputationRequired} reputation`
    };
  }

  if (event.qualificationRequired && event.qualificationCriteria) {
    const criteria = event.qualificationCriteria;

    if (criteria.minWins && raceWins < criteria.minWins) {
      return {
        qualified: false,
        reason: `Requires ${criteria.minWins} race wins`
      };
    }
  }

  return { qualified: true };
}

/**
 * Get all events for a specific track
 */
export function getEventsForTrack(trackId: string): PrestigiousRacingEvent[] {
  return Object.values(PRESTIGIOUS_EVENTS).filter(event => event.trackId === trackId);
}
