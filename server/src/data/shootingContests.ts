/**
 * Shooting Contest Templates
 * Predefined contest configurations for recurring events
 */

import type { ContestTemplate, ContestPrize } from '@desperados/shared';

/**
 * PRIZE STRUCTURES
 */

// Small contest prizes (4-9 participants)
export const SMALL_CONTEST_PRIZES: ContestPrize[] = [
  { placement: 1, gold: 300, reputation: 15 },
  { placement: 2, gold: 150, reputation: 8 },
  { placement: 3, gold: 50, reputation: 3 }
];

// Medium contest prizes (10-20 participants)
export const MEDIUM_CONTEST_PRIZES: ContestPrize[] = [
  { placement: 1, gold: 600, reputation: 25 },
  { placement: 2, gold: 350, reputation: 15 },
  { placement: 3, gold: 200, reputation: 8 },
  { placement: 4, gold: 100, reputation: 4 },
  { placement: 5, gold: 50, reputation: 2 }
];

// Large contest prizes (21+ participants)
export const LARGE_CONTEST_PRIZES: ContestPrize[] = [
  { placement: 1, gold: 1000, reputation: 40 },
  { placement: 2, gold: 600, reputation: 25 },
  { placement: 3, gold: 350, reputation: 15 },
  { placement: 4, gold: 200, reputation: 10 },
  { placement: 5, gold: 100, reputation: 5 },
  { placement: 6, gold: 50, reputation: 2 }
];

/**
 * DAILY SHOOTING CONTESTS
 */

export const DAILY_TARGET_PRACTICE: ContestTemplate = {
  id: 'daily_target_practice',
  name: 'Daily Target Practice',
  description: 'Casual target shooting competition for all skill levels',
  contestType: 'target_shooting',
  location: 'Red Gulch Shooting Range',

  frequency: 'daily',
  hour: 14, // 2 PM

  entryFee: 25,
  minLevel: 1,
  maxParticipants: 16,
  minParticipants: 4,
  allowedWeapons: ['revolver', 'competition_pistol'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 3,
      shotsPerPlayer: 5,
      timeLimit: 10,
      eliminations: 8
    },
    {
      roundType: 'finals',
      targetCount: 5,
      shotsPerPlayer: 5,
      timeLimit: 8
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 400,
  prizes: SMALL_CONTEST_PRIZES,
  prestigious: false,
  invitationOnly: false
};

export const DAILY_QUICK_DRAW: ContestTemplate = {
  id: 'daily_quick_draw',
  name: 'Daily Quick Draw',
  description: 'Speed shooting competition - fastest gun wins',
  contestType: 'quick_draw',
  location: 'Silver Creek Outdoor Range',

  frequency: 'daily',
  hour: 18, // 6 PM

  entryFee: 50,
  minLevel: 3,
  maxParticipants: 12,
  minParticipants: 4,
  allowedWeapons: ['revolver', 'derringer', 'competition_pistol'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 1,
      shotsPerPlayer: 3,
      timeLimit: 3,
      eliminations: 6
    },
    {
      roundType: 'finals',
      targetCount: 1,
      shotsPerPlayer: 5,
      timeLimit: 2
    }
  ],

  scoringSystem: 'time_based',
  basePrizePool: 600,
  prizes: SMALL_CONTEST_PRIZES,
  prestigious: false,
  invitationOnly: false
};

/**
 * WEEKLY SHOOTING CONTESTS
 */

export const RED_GULCH_SHOOTOUT: ContestTemplate = {
  id: 'red_gulch_shootout',
  name: 'Red Gulch Shootout',
  description: 'Weekly mixed-event competition featuring multiple shooting disciplines',
  contestType: 'target_shooting',
  location: 'Red Gulch Shooting Range',

  frequency: 'weekly',
  dayOfWeek: 6, // Saturday
  hour: 15, // 3 PM

  entryFee: 100,
  minLevel: 5,
  maxParticipants: 24,
  minParticipants: 8,
  allowedWeapons: ['revolver', 'competition_pistol', 'winchester', 'competition_rifle'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 5,
      shotsPerPlayer: 10,
      timeLimit: 12,
      eliminations: 12
    },
    {
      roundType: 'semifinals',
      targetCount: 5,
      shotsPerPlayer: 10,
      timeLimit: 10,
      eliminations: 6
    },
    {
      roundType: 'finals',
      targetCount: 5,
      shotsPerPlayer: 10,
      timeLimit: 8
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 2400,
  prizes: MEDIUM_CONTEST_PRIZES,
  prestigious: true,
  invitationOnly: false
};

export const QUICK_DRAW_SHOWDOWN: ContestTemplate = {
  id: 'quick_draw_showdown',
  name: 'Quick Draw Showdown',
  description: 'The fastest guns in the territory compete for the title',
  contestType: 'quick_draw',
  location: 'Desperado Valley Competition Grounds',

  frequency: 'weekly',
  dayOfWeek: 0, // Sunday
  hour: 12, // Noon

  entryFee: 200,
  minLevel: 8,
  maxParticipants: 16,
  minParticipants: 8,
  allowedWeapons: ['revolver', 'derringer', 'competition_pistol'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 1,
      shotsPerPlayer: 5,
      timeLimit: 2,
      eliminations: 8
    },
    {
      roundType: 'semifinals',
      targetCount: 1,
      shotsPerPlayer: 5,
      timeLimit: 2,
      eliminations: 4
    },
    {
      roundType: 'finals',
      targetCount: 1,
      shotsPerPlayer: 5,
      timeLimit: 1.5
    }
  ],

  scoringSystem: 'time_based',
  basePrizePool: 3200,
  prizes: [
    { placement: 1, gold: 1500, title: 'Fastest Gun', reputation: 50 },
    { placement: 2, gold: 900, reputation: 30 },
    { placement: 3, gold: 500, reputation: 15 },
    { placement: 4, gold: 300, reputation: 8 }
  ],
  prestigious: true,
  invitationOnly: false
};

export const SKEET_SHOOTING_CHALLENGE: ContestTemplate = {
  id: 'skeet_shooting_challenge',
  name: 'Skeet Shooting Challenge',
  description: 'Test your reflexes against flying clay pigeons',
  contestType: 'skeet_shooting',
  location: 'Whiskey Bend Exhibition Grounds',

  frequency: 'weekly',
  dayOfWeek: 3, // Wednesday
  hour: 16, // 4 PM

  entryFee: 75,
  minLevel: 4,
  maxParticipants: 20,
  minParticipants: 6,
  allowedWeapons: ['shotgun'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 10,
      shotsPerPlayer: 10,
      timeLimit: 5,
      eliminations: 10
    },
    {
      roundType: 'semifinals',
      targetCount: 15,
      shotsPerPlayer: 15,
      timeLimit: 4,
      eliminations: 5
    },
    {
      roundType: 'finals',
      targetCount: 20,
      shotsPerPlayer: 20,
      timeLimit: 3
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 1500,
  prizes: MEDIUM_CONTEST_PRIZES,
  prestigious: false,
  invitationOnly: false
};

/**
 * MONTHLY SHOOTING CONTESTS
 */

export const FRONTIER_MARKSMANSHIP_CHAMPIONSHIP: ContestTemplate = {
  id: 'frontier_championship',
  name: 'Frontier Marksmanship Championship',
  description: 'Monthly championship featuring all shooting disciplines. Winners earn prestigious titles.',
  contestType: 'target_shooting',
  location: 'Fort Ashford Military Range',

  frequency: 'monthly',
  dayOfMonth: 15,
  hour: 12, // Noon

  entryFee: 500,
  minLevel: 10,
  maxParticipants: 32,
  minParticipants: 12,
  allowedWeapons: ['revolver', 'competition_pistol', 'winchester', 'sharps_rifle', 'competition_rifle'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 10,
      shotsPerPlayer: 15,
      timeLimit: 15,
      eliminations: 16
    },
    {
      roundType: 'elimination',
      targetCount: 10,
      shotsPerPlayer: 15,
      timeLimit: 12,
      eliminations: 8
    },
    {
      roundType: 'semifinals',
      targetCount: 10,
      shotsPerPlayer: 20,
      timeLimit: 10,
      eliminations: 4
    },
    {
      roundType: 'finals',
      targetCount: 15,
      shotsPerPlayer: 20,
      timeLimit: 8
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 16000,
  prizes: [
    { placement: 1, gold: 5000, title: 'Frontier Marksman', reputation: 100, item: 'championship_rifle' },
    { placement: 2, gold: 3500, title: 'Master Shooter', reputation: 75 },
    { placement: 3, gold: 2000, title: 'Expert Marksman', reputation: 50 },
    { placement: 4, gold: 1500, reputation: 35 },
    { placement: 5, gold: 1000, reputation: 25 },
    { placement: 6, gold: 750, reputation: 15 },
    { placement: 7, gold: 500, reputation: 10 },
    { placement: 8, gold: 500, reputation: 10 }
  ],
  prestigious: true,
  invitationOnly: false
};

export const LONG_RANGE_RIFLE_COMPETITION: ContestTemplate = {
  id: 'long_range_rifle',
  name: 'Long Range Rifle Competition',
  description: 'Extreme distance shooting - only the steadiest hands prevail',
  contestType: 'long_range',
  location: 'Fort Ashford Military Range',

  frequency: 'monthly',
  dayOfMonth: 1,
  hour: 10, // 10 AM

  entryFee: 300,
  minLevel: 12,
  maxParticipants: 20,
  minParticipants: 8,
  allowedWeapons: ['winchester', 'sharps_rifle', 'competition_rifle'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 3,
      shotsPerPlayer: 5,
      timeLimit: 30,
      eliminations: 10
    },
    {
      roundType: 'semifinals',
      targetCount: 3,
      shotsPerPlayer: 5,
      timeLimit: 30,
      eliminations: 5
    },
    {
      roundType: 'finals',
      targetCount: 5,
      shotsPerPlayer: 5,
      timeLimit: 30
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 6000,
  prizes: [
    { placement: 1, gold: 2500, title: 'Long Range Specialist', reputation: 80 },
    { placement: 2, gold: 1500, reputation: 50 },
    { placement: 3, gold: 1000, reputation: 30 },
    { placement: 4, gold: 600, reputation: 20 },
    { placement: 5, gold: 400, reputation: 10 }
  ],
  prestigious: true,
  invitationOnly: false
};

export const TRICK_SHOT_SPECTACULAR: ContestTemplate = {
  id: 'trick_shot_spectacular',
  name: 'Trick Shot Spectacular',
  description: 'Showmanship meets marksmanship - dazzle the crowd with impossible shots',
  contestType: 'trick_shooting',
  location: 'Whiskey Bend Exhibition Grounds',

  frequency: 'monthly',
  dayOfMonth: 20,
  hour: 14, // 2 PM

  entryFee: 250,
  minLevel: 8,
  maxParticipants: 16,
  minParticipants: 6,
  allowedWeapons: ['revolver', 'competition_pistol', 'winchester'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 5,
      shotsPerPlayer: 10,
      timeLimit: 15,
      eliminations: 8
    },
    {
      roundType: 'semifinals',
      targetCount: 6,
      shotsPerPlayer: 12,
      timeLimit: 12,
      eliminations: 4
    },
    {
      roundType: 'finals',
      targetCount: 8,
      shotsPerPlayer: 15,
      timeLimit: 10
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 4000,
  prizes: [
    { placement: 1, gold: 1800, title: 'Trick Shot Artist', reputation: 70 },
    { placement: 2, gold: 1100, reputation: 45 },
    { placement: 3, gold: 700, reputation: 25 },
    { placement: 4, gold: 400, reputation: 15 }
  ],
  prestigious: true,
  invitationOnly: false
};

/**
 * ANNUAL SPECIAL EVENTS
 */

export const ANNIE_OAKLEY_MEMORIAL: ContestTemplate = {
  id: 'annie_oakley_memorial',
  name: 'Annie Oakley Memorial',
  description: 'The most prestigious trick shooting competition in the territory. Invitation only for proven masters.',
  contestType: 'trick_shooting',
  location: 'Desperado Valley Competition Grounds',

  frequency: 'annual',
  dayOfMonth: 15, // Mid-year
  hour: 12, // Noon

  entryFee: 1000,
  minLevel: 15,
  maxParticipants: 12,
  minParticipants: 6,
  minWins: 3, // Must have won at least 3 contests
  allowedWeapons: ['revolver', 'competition_pistol', 'winchester', 'competition_rifle'],

  rounds: [
    {
      roundType: 'qualification',
      targetCount: 10,
      shotsPerPlayer: 20,
      timeLimit: 20,
      eliminations: 6
    },
    {
      roundType: 'semifinals',
      targetCount: 12,
      shotsPerPlayer: 25,
      timeLimit: 15,
      eliminations: 3
    },
    {
      roundType: 'finals',
      targetCount: 15,
      shotsPerPlayer: 30,
      timeLimit: 12
    }
  ],

  scoringSystem: 'total_points',
  basePrizePool: 12000,
  prizes: [
    {
      placement: 1,
      gold: 5000,
      title: 'Legendary Sharpshooter',
      reputation: 150,
      item: 'legendary_trick_pistol'
    },
    {
      placement: 2,
      gold: 3500,
      title: 'Master of the Impossible',
      reputation: 100
    },
    {
      placement: 3,
      gold: 2000,
      title: 'Trick Shot Virtuoso',
      reputation: 75
    },
    {
      placement: 4, gold: 1500, reputation: 50 }
  ],
  prestigious: true,
  invitationOnly: true
};

export const FRONTERA_UNDERGROUND_DUEL: ContestTemplate = {
  id: 'frontera_underground_duel',
  name: 'Frontera Underground Exhibition',
  description: 'No-rules exhibition dueling in the underground arena. Reputation on the line.',
  contestType: 'dueling',
  location: 'The Frontera Underground Arena',

  frequency: 'weekly',
  dayOfWeek: 5, // Friday
  hour: 22, // 10 PM

  entryFee: 150,
  minLevel: 6,
  maxParticipants: 16,
  minParticipants: 8,
  allowedWeapons: ['revolver', 'derringer', 'competition_pistol'],

  rounds: [
    {
      roundType: 'elimination',
      targetCount: 1,
      shotsPerPlayer: 1,
      timeLimit: 2,
      eliminations: 8
    },
    {
      roundType: 'semifinals',
      targetCount: 1,
      shotsPerPlayer: 1,
      timeLimit: 1.5,
      eliminations: 4
    },
    {
      roundType: 'finals',
      targetCount: 1,
      shotsPerPlayer: 1,
      timeLimit: 1
    }
  ],

  scoringSystem: 'elimination',
  basePrizePool: 2400,
  prizes: [
    { placement: 1, gold: 1200, title: 'Underground Champion', reputation: 60 },
    { placement: 2, gold: 700, reputation: 35 },
    { placement: 3, gold: 350, reputation: 20 },
    { placement: 4, gold: 150, reputation: 10 }
  ],
  prestigious: true,
  invitationOnly: false
};

/**
 * CONTEST TEMPLATE REGISTRY
 */
export const CONTEST_TEMPLATES: Record<string, ContestTemplate> = {
  // Daily
  daily_target_practice: DAILY_TARGET_PRACTICE,
  daily_quick_draw: DAILY_QUICK_DRAW,

  // Weekly
  red_gulch_shootout: RED_GULCH_SHOOTOUT,
  quick_draw_showdown: QUICK_DRAW_SHOWDOWN,
  skeet_shooting_challenge: SKEET_SHOOTING_CHALLENGE,
  frontera_underground_duel: FRONTERA_UNDERGROUND_DUEL,

  // Monthly
  frontier_championship: FRONTIER_MARKSMANSHIP_CHAMPIONSHIP,
  long_range_rifle: LONG_RANGE_RIFLE_COMPETITION,
  trick_shot_spectacular: TRICK_SHOT_SPECTACULAR,

  // Annual
  annie_oakley_memorial: ANNIE_OAKLEY_MEMORIAL
};

/**
 * Get all templates by frequency
 */
export function getTemplatesByFrequency(frequency: 'daily' | 'weekly' | 'monthly' | 'annual'): ContestTemplate[] {
  return Object.values(CONTEST_TEMPLATES).filter(t => t.frequency === frequency);
}

/**
 * Get all prestigious contests
 */
export function getPrestigiousTemplates(): ContestTemplate[] {
  return Object.values(CONTEST_TEMPLATES).filter(t => t.prestigious);
}

/**
 * Get templates by contest type
 */
export function getTemplatesByType(contestType: string): ContestTemplate[] {
  return Object.values(CONTEST_TEMPLATES).filter(t => t.contestType === contestType);
}
