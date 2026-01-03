/**
 * DeckGames Type Definitions
 * All interfaces and types for the deck games system
 */

import { Card } from '@desperados/shared';

// =============================================================================
// BASIC TYPES
// =============================================================================

export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';

export type GameType =
  // Original 5 games
  | 'pokerHoldDraw'
  | 'pressYourLuck'
  | 'blackjack'
  | 'deckbuilder'
  | 'combatDuel'
  // New card game expansion (8 games)
  | 'faro'                  // Simple betting on card order
  | 'threeCardMonte'        // Track the card, perception vs sleight of hand
  | 'solitaireRace'         // Time-based puzzle, clear cards in sequence
  | 'texasHoldem'           // Strategic poker variant with community cards
  | 'rummy'                 // Set collection for investigation
  | 'warOfAttrition'        // Endurance contest, card comparison
  | 'euchre'                // Team partnership game
  | 'cribbage';             // Counting/math game

// =============================================================================
// PLAYER ACTION
// =============================================================================

/**
 * Extended PlayerAction for Phase 3 strategic choices
 */
export interface PlayerAction {
  type: string;
  cardIndices?: number[];
  // Blackjack options
  betMultiplier?: number;      // For double down
  insuranceAccepted?: boolean; // For insurance
  // Press Your Luck options
  goldSpent?: number;          // For safe draw
}

// =============================================================================
// SPECIAL ABILITIES
// =============================================================================

/**
 * Special abilities unlocked by skill level
 */
export interface SpecialAbilities {
  // Poker abilities
  rerollsAvailable: number;    // Skill 30+: 1 reroll, Skill 60+: 2 rerolls
  peeksAvailable: number;      // Skill 50+: see next card before deciding
  canEarlyFinish: boolean;     // Always available - finish early for speed bonus

  // Blackjack abilities
  canDoubleDown: boolean;      // Skill 5+: double bet, one card only
  canInsurance: boolean;       // Skill 15+: insure against dealer blackjack
  cardCountingBonus: number;   // Skill 20+: know approximate deck composition

  // Press Your Luck abilities
  canSafeDraw: boolean;        // Skill 10+: pay gold for guaranteed safe card
  safeDrawCost: number;        // Gold cost for safe draw (decreases with skill)
  canDoubleDownPYL: boolean;   // Skill 25+: risk current earnings for 2x
}

// =============================================================================
// SKILL MODIFIERS
// =============================================================================

/**
 * Skill Modifier Calculation
 * IMPLEMENTS FORMULA FROM DESIGN DOC (docs/destiny-deck-algorithm.md)
 */
export interface SkillModifiers {
  thresholdReduction: number;  // Lower the success threshold
  cardBonus: number;           // Add to hand score/value
  rerollsAvailable: number;    // Future: allow rerolls
  dangerAvoidChance: number;   // For press your luck: chance to avoid danger
}

/**
 * Phase 6: Talent bonuses that can be passed to skill calculations
 */
export interface TalentBonuses {
  deckScoreBonus?: number;      // Flat bonus to deck game scores
  thresholdBonus?: number;      // Additional threshold reduction
  dangerAvoidBonus?: number;    // Additional danger avoidance %
  criticalChance?: number;      // Chance for critical success
  damageBonus?: number;         // Combat damage multiplier
  defenseBonus?: number;        // Combat defense multiplier
}

// =============================================================================
// GAME STATE
// =============================================================================

/**
 * Extended GameState with Phase 3 strategic options
 */
export interface GameState {
  gameId: string;
  gameType: GameType;
  playerId: string;
  deck: Card[];
  hand: Card[];
  discarded: Card[];
  status: 'waiting_action' | 'resolved' | 'busted';
  turnNumber: number;
  maxTurns: number;
  timeLimit: number;
  startedAt: Date;
  relevantSuit?: string;
  difficulty: number;
  characterSuitBonus?: number;

  // === POKER: Multi-Round System ===
  heldCards?: number[];
  currentRound?: number;       // 1-3 for multi-round poker
  maxRounds?: number;          // Default 3
  rerollsUsed?: number;
  peeksUsed?: number;
  peekedCard?: Card | null;    // Card shown by peek ability
  earlyFinishBonus?: number;   // Speed bonus for finishing early

  // === BLACKJACK: Vegas Options ===
  isDoubledDown?: boolean;
  originalBet?: number;        // Bet before double down
  currentBetMultiplier?: number;
  hasInsurance?: boolean;
  dealerUpCard?: Card;         // Visible dealer card for insurance decision
  cardCountInfo?: string;      // Hint about remaining deck for skilled players

  // === PRESS YOUR LUCK: Risk/Reward ===
  dangerCount?: number;
  consecutiveSafeDraws?: number;
  streakMultiplier?: number;
  safeDrawsUsed?: number;
  isDoubleDownPYL?: boolean;   // Currently in double-down mode
  accumulatedScore?: number;   // Score before double-down risk
  dangerMeter?: number;        // 0-100 showing bust probability

  // === SPECIAL ABILITIES ===
  abilities?: SpecialAbilities;

  // === COMBAT DUEL: Unified Combat System ===
  opponentHP?: number;
  opponentMaxHP?: number;
  opponentName?: string;
  opponentDifficulty?: number;
  playerHP?: number;
  playerMaxHP?: number;
  attackCards?: number[];       // Indices of cards used for attack
  defenseCards?: number[];      // Indices of cards used for defense
  opponentAttackDamage?: number;
  opponentDefenseReduction?: number;
  lastPlayerDamage?: number;
  lastOpponentDamage?: number;
  combatRound?: number;
  canFlee?: boolean;
  weaponBonus?: number;
  armorBonus?: number;

  // === PHASE 5: RISK/REWARD SYSTEMS ===
  // Wagering system
  wagerAmount?: number;
  wagerTier?: 'low' | 'medium' | 'high' | 'vip';
  wagerMultiplier?: number;

  // Streak & Momentum
  currentStreak?: number;
  streakBonus?: number;
  hotHandActive?: boolean;
  hotHandRoundsLeft?: number;
  underdogBonus?: number;

  // Bail-out tracking
  canBailOut?: boolean;
  bailOutValue?: number;
  partialRewardPercent?: number;
}

// =============================================================================
// GAME RESULT
// =============================================================================

export interface GameResult {
  success: boolean;
  score: number;
  handName?: string;
  suitMatches: number;
  suitBonus: {
    multiplier: number;
    specialEffect?: string;
  };
  mitigation?: {
    damageReduction: number;
  };
  rewards?: {
    gold?: number;
    experience?: number;
  };
}

// =============================================================================
// WAGERING
// =============================================================================

/**
 * Wager tier configuration
 * Higher stakes = higher rewards AND higher risks
 */
export interface WagerConfig {
  tier: 'low' | 'medium' | 'high' | 'vip';
  minAmount: number;
  maxAmount: number;
  multiplier: number;         // Reward multiplier (1x, 2x, 5x, 10x)
  lossMultiplier: number;     // How much extra you lose on failure
  unlockLevel: number;        // Character level required
  houseEdge: number;          // Slight house edge at higher tiers
}

// =============================================================================
// INIT OPTIONS
// =============================================================================

export interface InitGameOptions {
  gameType: GameType;
  playerId: string;
  difficulty: number;
  relevantSuit?: string;
  timeLimit?: number;
  characterSuitBonus?: number;
  // Combat-specific options
  opponentName?: string;
  opponentMaxHP?: number;
  opponentDifficulty?: number;
  playerMaxHP?: number;
  weaponBonus?: number;
  armorBonus?: number;
  // Phase 5: Wagering options
  wagerAmount?: number;
  wagerTier?: 'low' | 'medium' | 'high' | 'vip';
  // Phase 5: Streak tracking (passed from character state)
  currentStreak?: number;
  hotHandActive?: boolean;
  hotHandRoundsLeft?: number;
  // Base reward for bail-out calculations
  baseReward?: number;
}
