/**
 * Poker Tournament System Types
 * Phase 13, Wave 13.1 - Comprehensive poker system for Desperados Destiny
 */

import type { ObjectId } from 'mongoose';

/**
 * POKER VARIANTS
 */
export type PokerVariant = 'texas_holdem' | 'five_card_draw' | 'seven_card_stud';

export const POKER_VARIANT_NAMES: Record<PokerVariant, string> = {
  texas_holdem: "Texas Hold'em",
  five_card_draw: 'Five Card Draw',
  seven_card_stud: '7-Card Stud'
};

/**
 * TOURNAMENT TYPES
 */
export type TournamentType =
  | 'sit_n_go'           // Quick games, start when full
  | 'scheduled'          // Fixed start times
  | 'multi_table'        // Large scale MTT
  | 'satellite'          // Win entry to bigger tournaments
  | 'championship';      // Monthly/Quarterly prestige events

export type TournamentStatus =
  | 'registration'       // Open for sign-ups
  | 'late_registration'  // Started but still accepting players
  | 'in_progress'        // Tournament running
  | 'final_table'        // Last table
  | 'completed'          // Tournament finished
  | 'cancelled';         // Tournament cancelled

/**
 * SEATING ALGORITHMS
 */
export type SeatingAlgorithm =
  | 'random'             // Pure random seating
  | 'balanced'           // Balance by chip stacks
  | 'seeded';            // By ranking/level

/**
 * BETTING STRUCTURES
 */
export type BettingStructure =
  | 'no_limit'           // Bet any amount
  | 'pot_limit'          // Bet up to pot size
  | 'fixed_limit';       // Fixed bet amounts

/**
 * POKER HAND RANKINGS (1 = highest)
 */
export enum PokerHandRank {
  ROYAL_FLUSH = 1,
  STRAIGHT_FLUSH = 2,
  FOUR_OF_A_KIND = 3,
  FULL_HOUSE = 4,
  FLUSH = 5,
  STRAIGHT = 6,
  THREE_OF_A_KIND = 7,
  TWO_PAIR = 8,
  ONE_PAIR = 9,
  HIGH_CARD = 10
}

export const POKER_HAND_NAMES: Record<PokerHandRank, string> = {
  [PokerHandRank.ROYAL_FLUSH]: 'Royal Flush',
  [PokerHandRank.STRAIGHT_FLUSH]: 'Straight Flush',
  [PokerHandRank.FOUR_OF_A_KIND]: 'Four of a Kind',
  [PokerHandRank.FULL_HOUSE]: 'Full House',
  [PokerHandRank.FLUSH]: 'Flush',
  [PokerHandRank.STRAIGHT]: 'Straight',
  [PokerHandRank.THREE_OF_A_KIND]: 'Three of a Kind',
  [PokerHandRank.TWO_PAIR]: 'Two Pair',
  [PokerHandRank.ONE_PAIR]: 'One Pair',
  [PokerHandRank.HIGH_CARD]: 'High Card'
};

/**
 * CARD REPRESENTATION (Standard 52-card deck)
 */
export type PokerSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type PokerRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface PokerCard {
  suit: PokerSuit;
  rank: PokerRank;
}

/**
 * POKER ACTIONS
 */
export type PokerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface PokerPlayerAction {
  playerId: string;
  action: PokerAction;
  amount?: number;
  timestamp: Date;
}

/**
 * BLIND LEVEL STRUCTURE
 */
export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  duration: number; // Minutes
}

/**
 * TOURNAMENT PRIZE STRUCTURE
 */
export interface PrizeStructure {
  placement: number;
  percentage: number;      // Percentage of prize pool
  guaranteed?: number;     // Minimum guaranteed gold
  title?: string;          // Special title reward
  item?: string;           // Item reward
}

/**
 * TOURNAMENT PLAYER
 */
export interface TournamentPlayer {
  characterId: ObjectId | string;
  characterName: string;
  tableId?: string;
  seatNumber?: number;
  chips: number;
  isEliminated: boolean;
  eliminatedAt?: Date;
  placement?: number;
  bountyValue?: number;     // For bounty tournaments
  bountiesCollected?: number;
}

/**
 * POKER TABLE
 */
export interface PokerTable {
  tableId: string;
  tableName: string;
  maxSeats: number;
  players: TablePlayer[];
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  currentPlayerPosition: number;
  pot: number;
  sidePots: SidePot[];
  communityCards: PokerCard[];
  deck: PokerCard[];
  currentRound: PokerRound;
  isActive: boolean;
}

export type PokerRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface TablePlayer {
  characterId: string;
  characterName: string;
  seatNumber: number;
  chips: number;
  holeCards: PokerCard[];
  currentBet: number;
  folded: boolean;
  allIn: boolean;
  lastAction?: PokerAction;
  isActive: boolean;
}

export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

/**
 * HAND HISTORY
 */
export interface HandHistory {
  handId: string;
  tournamentId: ObjectId | string;
  tableId: string;
  timestamp: Date;
  players: HandPlayer[];
  communityCards: PokerCard[];
  pot: number;
  winnerId: string;
  winningHand: PokerHandRank;
  actions: PokerPlayerAction[];
}

export interface HandPlayer {
  characterId: string;
  characterName: string;
  holeCards: PokerCard[];
  finalHand?: PokerCard[];
  handRank?: PokerHandRank;
  won: boolean;
  amountWon?: number;
}

/**
 * POKER TOURNAMENT
 */
export interface PokerTournament {
  id: string;
  name: string;
  description: string;
  variant: PokerVariant;
  tournamentType: TournamentType;
  bettingStructure: BettingStructure;

  // Entry
  buyIn: number;
  entryFee: number;        // House rake (percentage)
  rebuysAllowed: boolean;
  rebuyPeriod?: number;    // Minutes from start
  rebuyCost?: number;
  addOnsAllowed: boolean;
  addOnCost?: number;
  addOnChips?: number;

  // Structure
  startingChips: number;
  blindLevels: BlindLevel[];
  currentBlindLevel: number;
  blindDuration: number;   // Default duration in minutes
  nextBlindIncrease?: Date;

  // Players
  minPlayers: number;
  maxPlayers: number;
  registeredPlayers: TournamentPlayer[];
  eliminatedPlayers: number;

  // Timing
  registrationOpens: Date;
  registrationCloses: Date;
  scheduledStart: Date;
  lateRegistrationMinutes: number;
  lateRegistrationEnds?: Date;
  status: TournamentStatus;
  startedAt?: Date;
  completedAt?: Date;

  // Tables
  tables: PokerTable[];
  seatingAlgorithm: SeatingAlgorithm;
  playersPerTable: number;

  // Prizes
  prizePool: number;
  guaranteedPrizePool?: number;
  prizeStructure: PrizeStructure[];

  // Special Features
  bountyTournament: boolean;
  bountyAmount?: number;
  shootout: boolean;         // Winner-take-all per table
  turbo: boolean;            // Faster blind increases
  hyperTurbo: boolean;       // Very fast blind increases

  // Championship features
  isChampionship: boolean;
  championshipTier?: 'monthly' | 'quarterly' | 'annual';
  minLevelRequired?: number;

  // Location
  locationId: string;
  locationName: string;

  // Winner
  winnerId?: string;
  winnerName?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * CASH GAME (Non-tournament)
 */
export interface CashGameTable {
  id: string;
  name: string;
  variant: PokerVariant;
  bettingStructure: BettingStructure;

  // Stakes
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;

  // Table
  maxSeats: number;
  players: CashGamePlayer[];

  // Location
  locationId: string;
  locationName: string;

  // Requirements
  minLevel?: number;
  isPrivate: boolean;
  password?: string;

  isActive: boolean;
  createdAt: Date;
}

export interface CashGamePlayer {
  characterId: string;
  characterName: string;
  seatNumber: number;
  chips: number;
  joinedAt: Date;
}

/**
 * POKER STAKES
 */
export interface PokerStakes {
  id: string;
  name: string;
  description: string;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  minLevel: number;
}

export const POKER_STAKES: PokerStakes[] = [
  {
    id: 'penny_ante',
    name: 'Penny Ante',
    description: 'Perfect for beginners learning the ropes',
    smallBlind: 1,
    bigBlind: 2,
    minBuyIn: 20,
    maxBuyIn: 200,
    minLevel: 1
  },
  {
    id: 'low_stakes',
    name: 'Low Stakes',
    description: 'Friendly games with modest pots',
    smallBlind: 5,
    bigBlind: 10,
    minBuyIn: 100,
    maxBuyIn: 1000,
    minLevel: 5
  },
  {
    id: 'medium_stakes',
    name: 'Medium Stakes',
    description: 'Serious players with decent bankrolls',
    smallBlind: 25,
    bigBlind: 50,
    minBuyIn: 500,
    maxBuyIn: 5000,
    minLevel: 10
  },
  {
    id: 'high_stakes',
    name: 'High Stakes',
    description: 'For seasoned gamblers with deep pockets',
    smallBlind: 100,
    bigBlind: 200,
    minBuyIn: 2000,
    maxBuyIn: 20000,
    minLevel: 20
  },
  {
    id: 'nosebleed',
    name: 'Nosebleed Stakes',
    description: 'Only the wealthiest outlaws dare play here',
    smallBlind: 500,
    bigBlind: 1000,
    minBuyIn: 10000,
    maxBuyIn: 100000,
    minLevel: 30
  }
];

/**
 * POKER LOCATIONS
 */
export interface PokerLocation {
  locationId: string;
  name: string;
  description: string;
  availableVariants: PokerVariant[];
  availableStakes: string[]; // IDs from POKER_STAKES
  maxTables: number;
  atmosphere: string;
  specialRules?: string[];
}

export const POKER_LOCATIONS: PokerLocation[] = [
  {
    locationId: 'red_gulch_saloon',
    name: 'Red Gulch Saloon',
    description: 'The most popular poker hall in the territory. All skill levels welcome.',
    availableVariants: ['texas_holdem', 'five_card_draw', 'seven_card_stud'],
    availableStakes: ['penny_ante', 'low_stakes', 'medium_stakes', 'high_stakes'],
    maxTables: 20,
    atmosphere: 'Lively saloon with piano music and flowing whiskey'
  },
  {
    locationId: 'frontera_casino',
    name: 'Frontera Casino',
    description: 'High-stakes games for serious players. Frontera territory rules apply.',
    availableVariants: ['texas_holdem', 'seven_card_stud'],
    availableStakes: ['high_stakes', 'nosebleed'],
    maxTables: 10,
    atmosphere: 'Exclusive, dimly lit casino with armed guards',
    specialRules: ['No cheating tolerated - violators may be shot']
  },
  {
    locationId: 'whiskey_bend_hotel',
    name: 'Whiskey Bend Grand Hotel',
    description: 'Championship tournaments and elite poker games.',
    availableVariants: ['texas_holdem'],
    availableStakes: ['medium_stakes', 'high_stakes', 'nosebleed'],
    maxTables: 15,
    atmosphere: 'Luxurious hotel ballroom with velvet tables',
    specialRules: ['Formal attire encouraged', 'Championship events only']
  },
  {
    locationId: 'fort_ashford_club',
    name: "Fort Ashford Officer's Club",
    description: 'Military poker nights. Officers and invited guests only.',
    availableVariants: ['five_card_draw', 'texas_holdem'],
    availableStakes: ['low_stakes', 'medium_stakes'],
    maxTables: 5,
    atmosphere: 'Refined officers club with military discipline',
    specialRules: ['Military or Settler Alliance members only']
  },
  {
    locationId: 'riverboat',
    name: 'Mississippi Belle Riverboat',
    description: 'Floating poker palace with special weekend tournaments.',
    availableVariants: ['texas_holdem', 'five_card_draw'],
    availableStakes: ['low_stakes', 'medium_stakes', 'high_stakes'],
    maxTables: 12,
    atmosphere: 'Elegant riverboat with scenic views',
    specialRules: ['Weekend special events', 'Prize tournaments']
  }
];

/**
 * PLAYER POKER STATISTICS
 */
export interface PokerStats {
  characterId: string;

  // Tournament stats
  tournamentsPlayed: number;
  tournamentsWon: number;
  tournamentCashes: number;    // Finished in the money
  totalWinnings: number;
  totalBuyIns: number;
  roi: number;                 // Return on investment %

  // Cash game stats
  cashHandsPlayed: number;
  cashWinnings: number;
  cashLosses: number;
  biggestWin: number;
  biggestLoss: number;

  // Hand stats
  totalHandsPlayed: number;
  handsWon: number;
  handsLost: number;
  showdownsWon: number;
  showdownsLost: number;

  // Best hands
  royalFlushes: number;
  straightFlushes: number;
  fourOfAKinds: number;

  // Achievements
  achievements: PokerAchievement[];

  // Rankings
  skillRating: number;         // ELO-style rating
  rank: string;                // Title based on performance

  updatedAt: Date;
}

export interface PokerAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
}

/**
 * POKER ACHIEVEMENT DEFINITIONS
 */
export const POKER_ACHIEVEMENTS = {
  FIRST_WIN: {
    id: 'first_win',
    name: 'First Blood',
    description: 'Win your first poker tournament'
  },
  ROYAL_FLUSH: {
    id: 'royal_flush',
    name: 'Royal Treatment',
    description: 'Get a Royal Flush in tournament play'
  },
  TOURNAMENT_CHAMPION: {
    id: 'tournament_champion',
    name: 'Tournament Champion',
    description: 'Win 10 poker tournaments'
  },
  HIGH_ROLLER: {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Win a high stakes tournament (1000+ gold buy-in)'
  },
  BOUNTY_HUNTER: {
    id: 'bounty_hunter',
    name: 'Bounty Hunter',
    description: 'Collect 5 bounties in a single tournament'
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 3 tournaments in a row'
  },
  CARD_SHARK: {
    id: 'card_shark',
    name: 'Card Shark',
    description: 'Reach skill rating of 2000+'
  },
  CHAMPIONSHIP_VICTORY: {
    id: 'championship_victory',
    name: 'Championship Victory',
    description: 'Win a monthly or quarterly championship'
  },
  BIG_BLUFFER: {
    id: 'big_bluffer',
    name: 'Big Bluffer',
    description: 'Win with high card at showdown 10 times'
  },
  CASH_KING: {
    id: 'cash_king',
    name: 'Cash Game King',
    description: 'Win 10,000 gold in cash games'
  }
} as const;

/**
 * POKER SKILL RANKINGS
 */
export const POKER_RANKS = [
  { minRating: 0, maxRating: 1200, name: 'Greenhorn', title: 'the Greenhorn' },
  { minRating: 1200, maxRating: 1400, name: 'Novice Player', title: 'the Novice' },
  { minRating: 1400, maxRating: 1600, name: 'Decent Player', title: 'the Decent' },
  { minRating: 1600, maxRating: 1800, name: 'Skilled Player', title: 'the Skilled' },
  { minRating: 1800, maxRating: 2000, name: 'Expert Player', title: 'the Expert' },
  { minRating: 2000, maxRating: 2200, name: 'Card Shark', title: 'the Card Shark' },
  { minRating: 2200, maxRating: 2400, name: 'Master Gambler', title: 'the Master Gambler' },
  { minRating: 2400, maxRating: 2600, name: 'Poker Legend', title: 'the Poker Legend' },
  { minRating: 2600, maxRating: Infinity, name: 'Poker God', title: 'the Poker God' }
];

/**
 * TOURNAMENT TEMPLATE
 */
export interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  variant: PokerVariant;
  tournamentType: TournamentType;
  bettingStructure: BettingStructure;
  buyIn: number;
  entryFee: number;
  minPlayers: number;
  maxPlayers: number;
  startingChips: number;
  blindScheduleId: string;
  prizeStructureId: string;
  specialFeatures: {
    bounty?: boolean;
    rebuys?: boolean;
    addOns?: boolean;
    turbo?: boolean;
  };
}

/**
 * API REQUEST/RESPONSE TYPES
 */
export interface RegisterTournamentRequest {
  tournamentId: string;
}

export interface RegisterTournamentResponse {
  success: boolean;
  tournament: PokerTournament;
  seatNumber?: number;
}

export interface LeaveTournamentRequest {
  tournamentId: string;
}

export interface PokerActionRequest {
  tournamentId: string;
  tableId: string;
  action: PokerAction;
  amount?: number;
}

export interface PokerActionResponse {
  success: boolean;
  table: PokerTable;
  nextPlayer: string;
}

export interface TournamentListRequest {
  variant?: PokerVariant;
  tournamentType?: TournamentType;
  status?: TournamentStatus;
  minBuyIn?: number;
  maxBuyIn?: number;
  limit?: number;
  offset?: number;
}

export interface TournamentListResponse {
  tournaments: PokerTournament[];
  total: number;
  hasMore: boolean;
}
