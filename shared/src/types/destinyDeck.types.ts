/**
 * Destiny Deck Types - Core Game Mechanic
 *
 * The Destiny Deck is the core game mechanic using poker hands
 * to resolve challenges and progression in Desperados Destiny
 */

/**
 * The four suits in a standard deck
 * Each suit represents a different aspect of character capability
 */
export enum Suit {
  /** Cunning - Social manipulation, deception, intelligence */
  SPADES = 'SPADES',
  /** Spirit - Willpower, magic, faith, determination */
  HEARTS = 'HEARTS',
  /** Combat - Physical fighting, violence, intimidation */
  CLUBS = 'CLUBS',
  /** Craft - Creation, building, technical skills */
  DIAMONDS = 'DIAMONDS'
}

/**
 * Card ranks from 2 to Ace
 * Values represent card strength in hand evaluation
 */
export enum Rank {
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
  ACE = 14
}

/**
 * A single playing card
 */
export interface Card {
  /** Card's suit */
  suit: Suit;
  /** Card's rank */
  rank: Rank;
}

/**
 * Poker hand rankings
 * Higher values are better hands
 */
export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}

/**
 * Result of evaluating a poker hand
 */
export interface HandEvaluation {
  /** The poker hand rank */
  rank: HandRank;
  /** Numeric score for precise comparison (higher is better) */
  score: number;
  /** Human-readable description of the hand */
  description: string;
  /** The cards that make up the primary hand (e.g., the pair in a pair) */
  primaryCards: Card[];
  /** Kicker cards for tiebreaking */
  kickers: Card[];
}

/**
 * A challenge that must be resolved with a Destiny Deck draw
 */
export interface Challenge {
  /** Challenge ID */
  id: string;
  /** Challenge name */
  name: string;
  /** Challenge description */
  description: string;
  /** Required suit (if any) */
  requiredSuit?: Suit;
  /** Difficulty level (1-10) */
  difficulty: number;
  /** Minimum hand rank required to succeed */
  minimumHandRank: HandRank;
}

/**
 * Result of attempting a challenge
 */
export interface ChallengeResult {
  /** Whether the challenge was successful */
  success: boolean;
  /** The hand that was drawn */
  hand: Card[];
  /** Evaluation of the hand */
  evaluation: HandEvaluation;
  /** The challenge that was attempted */
  challenge: Challenge;
  /** Margin of success/failure */
  margin: number;
}

// ============================================================================
// Effectiveness System Types (New Unified Formula)
// ============================================================================

/**
 * Breakdown of how effectiveness was calculated
 * Used for UI display and debugging
 */
export interface EffectivenessBreakdown {
  /** Name of the poker hand (e.g., "Flush", "Two Pair") */
  handName: string;

  /** Base value from hand rank (50-500) */
  baseValue: number;

  /** Number of cards matching the relevant suit (0-5) */
  suitMatches: number;

  /** Suit multiplier applied (1.0-1.5) */
  suitMultiplier: number;

  /** Skill boost percentage applied (0-50) */
  skillBoostPercent: number;

  /** Skill multiplier applied (1.0-1.5) */
  skillMultiplier: number;

  /** The relevant suit for this action */
  relevantSuit?: Suit;
}

/**
 * Result of effectiveness calculation
 */
export interface EffectivenessResult {
  /** Final calculated effectiveness value */
  effectiveness: number;

  /** Detailed breakdown of calculation components */
  breakdown: EffectivenessBreakdown;

  /** Whether this meets the success threshold (if applicable) */
  meetsThreshold?: boolean;

  /** The threshold that was required (if applicable) */
  threshold?: number;
}

/**
 * Extended game result with effectiveness data
 */
export interface EffectivenessGameResult {
  /** Whether the action succeeded */
  success: boolean;

  /** The hand that was drawn */
  hand: Card[];

  /** Hand evaluation details */
  evaluation: HandEvaluation;

  /** Effectiveness calculation result */
  effectiveness: EffectivenessResult;

  /** Rewards earned from the action */
  rewards: {
    gold?: number;
    xp?: number;
    items?: string[];
  };

  /** Special effects triggered (e.g., "Perfect Suit Mastery!") */
  specialEffects?: string[];
}
