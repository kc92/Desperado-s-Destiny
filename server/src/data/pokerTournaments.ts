/**
 * Poker Tournament Templates and Prize Structures
 * Predefined tournament configurations
 */

import type { TournamentTemplate, PrizeStructure } from '@desperados/shared';

/**
 * PRIZE STRUCTURES
 */

// Standard prize structure for small tournaments (4-9 players)
export const SMALL_TOURNAMENT_PRIZES: PrizeStructure[] = [
  { placement: 1, percentage: 60 },
  { placement: 2, percentage: 30 },
  { placement: 3, percentage: 10 }
];

// Standard prize structure for medium tournaments (10-20 players)
export const MEDIUM_TOURNAMENT_PRIZES: PrizeStructure[] = [
  { placement: 1, percentage: 40 },
  { placement: 2, percentage: 25 },
  { placement: 3, percentage: 15 },
  { placement: 4, percentage: 10 },
  { placement: 5, percentage: 6 },
  { placement: 6, percentage: 4 }
];

// Standard prize structure for large tournaments (21-50 players)
export const LARGE_TOURNAMENT_PRIZES: PrizeStructure[] = [
  { placement: 1, percentage: 30 },
  { placement: 2, percentage: 20 },
  { placement: 3, percentage: 13 },
  { placement: 4, percentage: 10 },
  { placement: 5, percentage: 7 },
  { placement: 6, percentage: 5 },
  { placement: 7, percentage: 4 },
  { placement: 8, percentage: 3 },
  { placement: 9, percentage: 3 },
  { placement: 10, percentage: 2.5 },
  { placement: 11, percentage: 1.5 },
  { placement: 12, percentage: 1 }
];

// MTT prize structure (51-100 players)
export const MTT_TOURNAMENT_PRIZES: PrizeStructure[] = [
  { placement: 1, percentage: 25 },
  { placement: 2, percentage: 17 },
  { placement: 3, percentage: 12 },
  { placement: 4, percentage: 9 },
  { placement: 5, percentage: 7 },
  { placement: 6, percentage: 5 },
  { placement: 7, percentage: 4 },
  { placement: 8, percentage: 3.5 },
  { placement: 9, percentage: 3 },
  { placement: 10, percentage: 2.5 },
  { placement: 11, percentage: 2 },
  { placement: 12, percentage: 2 },
  { placement: 13, percentage: 1.5 },
  { placement: 14, percentage: 1.5 },
  { placement: 15, percentage: 1.5 },
  { placement: 16, percentage: 1 },
  { placement: 17, percentage: 1 },
  { placement: 18, percentage: 0.5 }
];

// Championship prize structure with titles
export const CHAMPIONSHIP_PRIZES: PrizeStructure[] = [
  {
    placement: 1,
    percentage: 30,
    title: 'Poker Champion',
    item: 'championship_ring'
  },
  {
    placement: 2,
    percentage: 20,
    title: 'Runner-up'
  },
  {
    placement: 3,
    percentage: 13,
    title: 'Third Place Finisher'
  },
  { placement: 4, percentage: 10 },
  { placement: 5, percentage: 7 },
  { placement: 6, percentage: 5 },
  { placement: 7, percentage: 4 },
  { placement: 8, percentage: 3 },
  { placement: 9, percentage: 3 },
  { placement: 10, percentage: 2.5 },
  { placement: 11, percentage: 1.5 },
  { placement: 12, percentage: 1 }
];

/**
 * Prize structure lookup by ID
 */
export const PRIZE_STRUCTURES: Record<string, PrizeStructure[]> = {
  small: SMALL_TOURNAMENT_PRIZES,
  medium: MEDIUM_TOURNAMENT_PRIZES,
  large: LARGE_TOURNAMENT_PRIZES,
  mtt: MTT_TOURNAMENT_PRIZES,
  championship: CHAMPIONSHIP_PRIZES
};

/**
 * Get prize structure by ID
 */
export function getPrizeStructure(structureId: string): PrizeStructure[] {
  const structure = PRIZE_STRUCTURES[structureId];
  if (!structure) {
    throw new Error(`Unknown prize structure: ${structureId}`);
  }
  return structure;
}

/**
 * TOURNAMENT TEMPLATES
 */

export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  // ===== SIT-N-GO TOURNAMENTS =====
  {
    id: 'sng_beginner',
    name: "Beginner's Sit-n-Go",
    description: 'Quick poker game for newcomers. 6 players, low buy-in.',
    variant: 'texas_holdem',
    tournamentType: 'sit_n_go',
    bettingStructure: 'no_limit',
    buyIn: 50,
    entryFee: 5,
    minPlayers: 4,
    maxPlayers: 6,
    startingChips: 1500,
    blindScheduleId: 'sit_n_go',
    prizeStructureId: 'small',
    specialFeatures: {}
  },
  {
    id: 'sng_standard',
    name: 'Standard Sit-n-Go',
    description: 'Classic 9-player sit-n-go tournament.',
    variant: 'texas_holdem',
    tournamentType: 'sit_n_go',
    bettingStructure: 'no_limit',
    buyIn: 200,
    entryFee: 20,
    minPlayers: 6,
    maxPlayers: 9,
    startingChips: 2000,
    blindScheduleId: 'sit_n_go',
    prizeStructureId: 'small',
    specialFeatures: {}
  },
  {
    id: 'sng_turbo',
    name: 'Turbo Sit-n-Go',
    description: 'Fast-paced action with 8-minute blind levels.',
    variant: 'texas_holdem',
    tournamentType: 'sit_n_go',
    bettingStructure: 'no_limit',
    buyIn: 150,
    entryFee: 15,
    minPlayers: 6,
    maxPlayers: 9,
    startingChips: 1500,
    blindScheduleId: 'turbo',
    prizeStructureId: 'small',
    specialFeatures: { turbo: true }
  },
  {
    id: 'sng_bounty',
    name: 'Bounty Sit-n-Go',
    description: 'Collect bounties for eliminating players!',
    variant: 'texas_holdem',
    tournamentType: 'sit_n_go',
    bettingStructure: 'no_limit',
    buyIn: 100,
    entryFee: 10,
    minPlayers: 6,
    maxPlayers: 9,
    startingChips: 2000,
    blindScheduleId: 'sit_n_go',
    prizeStructureId: 'small',
    specialFeatures: { bounty: true }
  },
  {
    id: 'sng_five_card',
    name: 'Five Card Draw Sit-n-Go',
    description: 'Classic Western poker in sit-n-go format.',
    variant: 'five_card_draw',
    tournamentType: 'sit_n_go',
    bettingStructure: 'no_limit',
    buyIn: 100,
    entryFee: 10,
    minPlayers: 4,
    maxPlayers: 6,
    startingChips: 2000,
    blindScheduleId: 'sit_n_go',
    prizeStructureId: 'small',
    specialFeatures: {}
  },

  // ===== SCHEDULED TOURNAMENTS =====
  {
    id: 'daily_noon',
    name: 'Daily Noon Showdown',
    description: 'Daily tournament at high noon. All skill levels welcome.',
    variant: 'texas_holdem',
    tournamentType: 'scheduled',
    bettingStructure: 'no_limit',
    buyIn: 250,
    entryFee: 25,
    minPlayers: 10,
    maxPlayers: 50,
    startingChips: 3000,
    blindScheduleId: 'standard',
    prizeStructureId: 'large',
    specialFeatures: { rebuys: true }
  },
  {
    id: 'evening_special',
    name: 'Evening Special',
    description: 'Prime time poker tournament with guaranteed prize pool.',
    variant: 'texas_holdem',
    tournamentType: 'scheduled',
    bettingStructure: 'no_limit',
    buyIn: 500,
    entryFee: 50,
    minPlayers: 20,
    maxPlayers: 100,
    startingChips: 5000,
    blindScheduleId: 'standard',
    prizeStructureId: 'mtt',
    specialFeatures: { rebuys: true, addOns: true }
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Saturday and Sunday special with deep stacks.',
    variant: 'texas_holdem',
    tournamentType: 'scheduled',
    bettingStructure: 'no_limit',
    buyIn: 1000,
    entryFee: 100,
    minPlayers: 30,
    maxPlayers: 150,
    startingChips: 10000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'mtt',
    specialFeatures: { rebuys: true, addOns: true }
  },
  {
    id: 'stud_sunday',
    name: 'Stud Sunday',
    description: 'Weekly 7-Card Stud tournament for skilled players.',
    variant: 'seven_card_stud',
    tournamentType: 'scheduled',
    bettingStructure: 'pot_limit',
    buyIn: 750,
    entryFee: 75,
    minPlayers: 15,
    maxPlayers: 50,
    startingChips: 5000,
    blindScheduleId: 'standard',
    prizeStructureId: 'large',
    specialFeatures: {}
  },

  // ===== MULTI-TABLE TOURNAMENTS =====
  {
    id: 'grand_mtt',
    name: 'Grand Multi-Table Championship',
    description: 'Massive tournament with 100+ players and huge prize pool.',
    variant: 'texas_holdem',
    tournamentType: 'multi_table',
    bettingStructure: 'no_limit',
    buyIn: 2000,
    entryFee: 200,
    minPlayers: 50,
    maxPlayers: 500,
    startingChips: 10000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'mtt',
    specialFeatures: { rebuys: true, addOns: true }
  },
  {
    id: 'hyper_mtt',
    name: 'Hyper-Turbo MTT',
    description: 'Fast-paced multi-table madness! Quick blind increases.',
    variant: 'texas_holdem',
    tournamentType: 'multi_table',
    bettingStructure: 'no_limit',
    buyIn: 500,
    entryFee: 50,
    minPlayers: 30,
    maxPlayers: 200,
    startingChips: 3000,
    blindScheduleId: 'hyper_turbo',
    prizeStructureId: 'mtt',
    specialFeatures: { turbo: true }
  },
  {
    id: 'bounty_mtt',
    name: 'Bounty Hunter MTT',
    description: 'Large tournament with bounties on every player.',
    variant: 'texas_holdem',
    tournamentType: 'multi_table',
    bettingStructure: 'no_limit',
    buyIn: 1000,
    entryFee: 100,
    minPlayers: 40,
    maxPlayers: 200,
    startingChips: 5000,
    blindScheduleId: 'standard',
    prizeStructureId: 'mtt',
    specialFeatures: { bounty: true }
  },

  // ===== SATELLITE TOURNAMENTS =====
  {
    id: 'satellite_small',
    name: 'Championship Satellite',
    description: 'Win your way into the monthly championship for a fraction of the cost!',
    variant: 'texas_holdem',
    tournamentType: 'satellite',
    bettingStructure: 'no_limit',
    buyIn: 200,
    entryFee: 20,
    minPlayers: 10,
    maxPlayers: 50,
    startingChips: 2000,
    blindScheduleId: 'satellite',
    prizeStructureId: 'small',
    specialFeatures: {}
  },
  {
    id: 'satellite_medium',
    name: 'High Roller Satellite',
    description: 'Qualify for the high roller tournament at a reduced cost.',
    variant: 'texas_holdem',
    tournamentType: 'satellite',
    bettingStructure: 'no_limit',
    buyIn: 500,
    entryFee: 50,
    minPlayers: 20,
    maxPlayers: 100,
    startingChips: 3000,
    blindScheduleId: 'satellite',
    prizeStructureId: 'medium',
    specialFeatures: { rebuys: true }
  },

  // ===== CHAMPIONSHIP TOURNAMENTS =====
  {
    id: 'monthly_championship',
    name: 'Monthly Championship',
    description: 'Prestigious monthly event with exclusive title and prizes.',
    variant: 'texas_holdem',
    tournamentType: 'championship',
    bettingStructure: 'no_limit',
    buyIn: 5000,
    entryFee: 500,
    minPlayers: 50,
    maxPlayers: 200,
    startingChips: 20000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'championship',
    specialFeatures: { rebuys: true, addOns: true }
  },
  {
    id: 'quarterly_masters',
    name: 'Quarterly Masters',
    description: 'Elite quarterly tournament for the best poker players.',
    variant: 'texas_holdem',
    tournamentType: 'championship',
    bettingStructure: 'no_limit',
    buyIn: 10000,
    entryFee: 1000,
    minPlayers: 30,
    maxPlayers: 100,
    startingChips: 30000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'championship',
    specialFeatures: { addOns: true }
  },
  {
    id: 'annual_world_series',
    name: 'World Series of Desperados Poker',
    description: 'The most prestigious poker tournament in the West. Champions only.',
    variant: 'texas_holdem',
    tournamentType: 'championship',
    bettingStructure: 'no_limit',
    buyIn: 25000,
    entryFee: 2500,
    minPlayers: 50,
    maxPlayers: 500,
    startingChips: 50000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'championship',
    specialFeatures: { rebuys: true, addOns: true }
  },
  {
    id: 'high_stakes_invitational',
    name: 'High Stakes Invitational',
    description: 'Invitation-only tournament for top-ranked players.',
    variant: 'texas_holdem',
    tournamentType: 'championship',
    bettingStructure: 'no_limit',
    buyIn: 15000,
    entryFee: 1500,
    minPlayers: 20,
    maxPlayers: 50,
    startingChips: 40000,
    blindScheduleId: 'deep_stack',
    prizeStructureId: 'championship',
    specialFeatures: { addOns: true }
  }
];

/**
 * Get tournament template by ID
 */
export function getTournamentTemplate(templateId: string): TournamentTemplate | undefined {
  return TOURNAMENT_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get templates by tournament type
 */
export function getTemplatesByType(tournamentType: string): TournamentTemplate[] {
  return TOURNAMENT_TEMPLATES.filter(t => t.tournamentType === tournamentType);
}

/**
 * Get templates by variant
 */
export function getTemplatesByVariant(variant: string): TournamentTemplate[] {
  return TOURNAMENT_TEMPLATES.filter(t => t.variant === variant);
}

/**
 * Calculate prize pool distribution
 */
export function calculatePrizeDistribution(
  prizePool: number,
  structureId: string
): Map<number, number> {
  const structure = getPrizeStructure(structureId);
  const distribution = new Map<number, number>();

  for (const prize of structure) {
    const amount = Math.floor((prizePool * prize.percentage) / 100);
    const finalAmount = prize.guaranteed ? Math.max(amount, prize.guaranteed) : amount;
    distribution.set(prize.placement, finalAmount);
  }

  return distribution;
}

/**
 * Calculate total prize pool
 */
export function calculatePrizePool(
  buyIn: number,
  entryFee: number,
  playerCount: number,
  guaranteed?: number
): number {
  const totalBuyIns = buyIn * playerCount;
  const calculatedPool = totalBuyIns - (entryFee * playerCount);

  // Use guaranteed if it's higher
  return guaranteed ? Math.max(calculatedPool, guaranteed) : calculatedPool;
}

/**
 * Get number of players who cash (finish in the money)
 */
export function getPayoutCount(structureId: string): number {
  const structure = getPrizeStructure(structureId);
  return structure.length;
}
