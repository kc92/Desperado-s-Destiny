/**
 * Deck Games Service
 * Core game logic for all 4 strategic mini-games
 *
 * PHASE 3: Strategic Choices Implementation
 * - Multi-round poker with skill-unlocked abilities
 * - Vegas-style blackjack options
 * - Press Your Luck with risk/reward mechanics
 * - Skill-based special abilities
 */

import crypto from 'crypto';
import { Card, Rank, Suit as CardSuit } from '@desperados/shared';
import { ActionType } from '../models/Action.model';
import { SecureRNG } from './base/SecureRNG';

// =============================================================================
// TYPES
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

/**
 * Calculate special abilities based on character skill level
 * This is the key to meaningful progression - higher skill unlocks more options!
 */
export function calculateSpecialAbilities(skillLevel: number): SpecialAbilities {
  const skill = Math.max(0, Math.min(100, skillLevel));

  return {
    // === POKER ===
    // Rerolls: 1 at skill 30, 2 at skill 60, 3 at skill 90
    rerollsAvailable: Math.floor(skill / 30),
    // Peeks: 1 at skill 50, 2 at skill 80
    peeksAvailable: skill >= 50 ? Math.floor((skill - 20) / 30) : 0,
    // Early finish always available
    canEarlyFinish: true,

    // === BLACKJACK ===
    // Double down at skill 5+
    canDoubleDown: skill >= 5,
    // Insurance at skill 15+
    canInsurance: skill >= 15,
    // Card counting bonus: 0-30 based on skill (at 20+)
    cardCountingBonus: skill >= 20 ? Math.min(30, Math.floor((skill - 20) * 0.5)) : 0,

    // === PRESS YOUR LUCK ===
    // Safe draw at skill 10+
    canSafeDraw: skill >= 10,
    // Safe draw cost: 100 gold at skill 10, down to 25 gold at skill 100
    safeDrawCost: skill >= 10 ? Math.max(25, 100 - Math.floor((skill - 10) * 0.83)) : 100,
    // Double down at skill 25+
    canDoubleDownPYL: skill >= 25
  };
}

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
  // Player chooses which cards to attack with vs defend with
  opponentHP?: number;
  opponentMaxHP?: number;
  opponentName?: string;
  opponentDifficulty?: number;
  playerHP?: number;
  playerMaxHP?: number;
  attackCards?: number[];       // Indices of cards used for attack
  defenseCards?: number[];      // Indices of cards used for defense
  opponentAttackDamage?: number; // Damage enemy will deal this turn
  opponentDefenseReduction?: number; // Defense enemy has this turn
  lastPlayerDamage?: number;    // Damage dealt to opponent last turn
  lastOpponentDamage?: number;  // Damage taken from opponent last turn
  combatRound?: number;
  canFlee?: boolean;            // Can only flee in first 3 rounds
  weaponBonus?: number;         // Equipped weapon adds to attack
  armorBonus?: number;          // Equipped armor adds to defense

  // === PHASE 5: RISK/REWARD SYSTEMS ===
  // Wagering system
  wagerAmount?: number;         // Gold wagered on this game
  wagerTier?: 'low' | 'medium' | 'high' | 'vip';  // Stakes tier
  wagerMultiplier?: number;     // 1x, 2x, 5x, 10x based on tier

  // Streak & Momentum
  currentStreak?: number;       // Consecutive wins
  streakBonus?: number;         // Bonus multiplier from streak (1.0 - 1.5)
  hotHandActive?: boolean;      // Hot hand buff active
  hotHandRoundsLeft?: number;   // Rounds remaining on hot hand
  underdogBonus?: number;       // Comeback bonus after losses (0 - 0.2)

  // Bail-out tracking
  canBailOut?: boolean;         // Can cash out early
  bailOutValue?: number;        // Guaranteed value if bail out now
  partialRewardPercent?: number; // % of rewards if bail out
}

/**
 * Skill Modifier Calculation
 * IMPLEMENTS FORMULA FROM DESIGN DOC (docs/destiny-deck-algorithm.md)
 *
 * This is the core formula that makes skills MATTER for success rates.
 * Without this, progression is meaningless - just reward multipliers.
 *
 * PHASE 6: Now integrates talent bonuses and synergy multipliers
 *
 * @param characterSuitBonus - Total skill levels for relevant suit (1-100+)
 * @param difficulty - Action difficulty (1-5)
 * @param talentBonuses - Optional bonuses from talent tree (Phase 6)
 * @param synergyMultiplier - Optional multiplier from build synergies (Phase 6)
 * @returns Modifiers that affect success thresholds
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

export function calculateSkillModifiers(
  characterSuitBonus: number,
  difficulty: number,
  talentBonuses?: TalentBonuses,
  synergyMultiplier: number = 1.0
): SkillModifiers {
  // Clamp skill bonus to reasonable range (0-100)
  const skillLevel = Math.max(0, Math.min(100, characterSuitBonus));

  // Linear component: each skill level gives 0.75 bonus
  const linear = skillLevel * 0.75;

  // Exponential component: small additional bonus that scales with mastery
  const exponential = Math.pow(skillLevel, 1.1) * 0.05;

  const totalBonus = linear + exponential;

  // Scale effects based on difficulty (harder = skills matter more)
  const difficultyScale = 0.8 + (difficulty * 0.1); // 0.9 to 1.3

  // Phase 6: Apply talent bonuses
  const talentDeckBonus = talentBonuses?.deckScoreBonus || 0;
  const talentThresholdBonus = talentBonuses?.thresholdBonus || 0;
  const talentDangerBonus = talentBonuses?.dangerAvoidBonus || 0;

  return {
    // Reduce threshold by 40% of bonus - lower target = easier success
    // At skill 10: reduces by ~3 points
    // At skill 50: reduces by ~18 points
    // Phase 6: Add talent threshold bonus
    thresholdReduction: Math.floor((totalBonus * 0.4 * difficultyScale) + talentThresholdBonus),

    // Add 30% of bonus to score - higher score = more likely success
    // At skill 10: adds ~2 points
    // At skill 50: adds ~13 points
    // Phase 6: Add talent deck bonus, multiply by synergy
    cardBonus: Math.floor((totalBonus * 0.3 * difficultyScale + talentDeckBonus) * synergyMultiplier),

    // Unlock rerolls at higher skill levels (one per 30 levels)
    rerollsAvailable: Math.floor(skillLevel / 30),

    // Press your luck: chance to avoid danger cards
    // At skill 10: ~7% avoid chance
    // At skill 50: ~33% avoid chance
    // Capped at 50% to keep game challenging
    // Phase 6: Add talent danger avoidance bonus
    dangerAvoidChance: Math.min(0.5, skillLevel * 0.007 + (talentDangerBonus / 100))
  };
}

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

// Deck creation
function createDeck(): Card[] {
  const suits: CardSuit[] = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.CLUBS, CardSuit.DIAMONDS];
  const ranks: Rank[] = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  // SECURITY FIX: Use SecureRNG
  // Shuffle using Fisher-Yates with cryptographically secure RNG
  return SecureRNG.shuffle(deck);
}

// Draw cards from deck
function drawCards(state: GameState, count: number): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < count && state.deck.length > 0; i++) {
    drawn.push(state.deck.pop()!);
  }
  return drawn;
}

// SECURITY FIX: Use SecureRNG
// Shuffle a deck in place
function shuffleDeck(deck: Card[]): void {
  const shuffled = SecureRNG.shuffle(deck);
  deck.splice(0, deck.length, ...shuffled);
}

// =============================================================================
// COMBAT DUEL: Unified Combat System
// =============================================================================

/**
 * Calculate card value for combat damage/defense
 * Face cards = 10, Ace = 11, Number cards = face value
 */
function getCardCombatValue(card: Card): number {
  if (card.rank === Rank.ACE) return 11;
  if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) return 10;
  return card.rank as number;
}

/**
 * Calculate combat damage from selected cards
 * Sum of card values + weapon bonus + skill modifier
 */
function calculateCombatDamage(
  cards: Card[],
  weaponBonus: number = 0,
  skillModifier: number = 0
): number {
  if (cards.length === 0) return 0;

  const baseValue = cards.reduce((sum, card) => sum + getCardCombatValue(card), 0);

  // Evaluate poker hand for bonus damage
  const handResult = evaluatePokerHand(cards);
  const handBonus = getHandBonusDamage(handResult.handName);

  return Math.max(1, baseValue + weaponBonus + skillModifier + handBonus);
}

/**
 * Calculate defense reduction from cards
 * Sum of card values + armor bonus + skill modifier
 */
function calculateCombatDefense(
  cards: Card[],
  armorBonus: number = 0,
  skillModifier: number = 0
): number {
  if (cards.length === 0) return 0;

  const baseValue = cards.reduce((sum, card) => sum + getCardCombatValue(card), 0);

  // Pairs and better give bonus defense
  const handResult = evaluatePokerHand(cards);
  const handBonus = Math.floor(getHandBonusDamage(handResult.handName) * 0.5);

  return Math.max(0, baseValue + armorBonus + skillModifier + handBonus);
}

/**
 * Get bonus damage based on poker hand rank
 */
function getHandBonusDamage(handRank: string): number {
  const bonuses: Record<string, number> = {
    'Royal Flush': 50,
    'Straight Flush': 40,
    'Four of a Kind': 35,
    'Full House': 30,
    'Flush': 25,
    'Straight': 20,
    'Three of a Kind': 15,
    'Two Pair': 10,
    'Pair': 5,
    'High Card': 0
  };
  return bonuses[handRank] || 0;
}

/**
 * AI opponent decides how to split cards between attack and defense
 * Higher difficulty = smarter decisions
 */
function simulateOpponentCombat(
  hand: Card[],
  difficulty: number
): { attack: number; defense: number; attackCards: Card[]; defenseCards: Card[] } {
  // Sort cards by value (highest first)
  const sortedCards = [...hand].sort((a, b) => getCardCombatValue(b) - getCardCombatValue(a));

  // Determine split based on difficulty
  // Easy (1-3): Random split
  // Medium (4-6): 3 attack, 2 defense
  // Hard (7-9): Optimal split based on situation
  // Extreme (10): All-in attack

  let attackCount: number;

  if (difficulty <= 3) {
    // SECURITY FIX: Use SecureRNG
    // Random split
    attackCount = SecureRNG.range(1, 4); // 1-4 cards for attack
  } else if (difficulty <= 6) {
    // Balanced: 3 attack, 2 defense
    attackCount = 3;
  } else if (difficulty <= 9) {
    // Aggressive: 4 attack, 1 defense
    attackCount = 4;
  } else {
    // All-out: 5 attack, 0 defense (high risk, high reward)
    attackCount = 5;
  }

  const attackCards = sortedCards.slice(0, attackCount);
  const defenseCards = sortedCards.slice(attackCount);

  const attack = calculateCombatDamage(attackCards, difficulty, 0);
  const defense = calculateCombatDefense(defenseCards, 0, 0);

  return { attack, defense, attackCards, defenseCards };
}

/**
 * Process combat turn
 * Player has already selected which cards to use for attack/defense
 */
function processCombatTurn(state: GameState): {
  playerDamageDealt: number;
  playerDamageTaken: number;
  opponentDefeated: boolean;
  playerDefeated: boolean;
} {
  const attackIndices = state.attackCards || [];
  const defenseIndices = state.defenseCards || [];

  // Get actual cards from indices
  const attackCards = attackIndices.map(i => state.hand[i]).filter(Boolean);
  const defenseCards = defenseIndices.map(i => state.hand[i]).filter(Boolean);

  // Calculate player's attack damage
  const skillMod = Math.floor((state.characterSuitBonus || 0) * 0.3);
  const playerAttack = calculateCombatDamage(attackCards, state.weaponBonus || 0, skillMod);
  const playerDefense = calculateCombatDefense(defenseCards, state.armorBonus || 0, skillMod);

  // Get opponent's pre-calculated attack (shown to player for strategy)
  const opponentAttack = state.opponentAttackDamage || 0;
  const opponentDefense = state.opponentDefenseReduction || 0;

  // Calculate actual damage dealt
  // Player damage is reduced by opponent defense
  const playerDamageDealt = Math.max(1, playerAttack - opponentDefense);
  // Opponent damage is reduced by player defense
  const playerDamageTaken = Math.max(0, opponentAttack - playerDefense);

  // Apply damage
  state.opponentHP = Math.max(0, (state.opponentHP || 0) - playerDamageDealt);
  state.playerHP = Math.max(0, (state.playerHP || 0) - playerDamageTaken);

  // Store for UI display
  state.lastPlayerDamage = playerDamageDealt;
  state.lastOpponentDamage = playerDamageTaken;

  return {
    playerDamageDealt,
    playerDamageTaken,
    opponentDefeated: state.opponentHP <= 0,
    playerDefeated: state.playerHP <= 0
  };
}

// Calculate blackjack hand value
function calculateBlackjackValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === Rank.ACE) {
      aces++;
      value += 11;
    } else if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
      value += 10;
    } else {
      value += card.rank as number;
    }
  }

  // Adjust aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Get available actions for current game state
 * PHASE 3: Now includes skill-unlocked special abilities
 */
export function getAvailableActions(state: GameState): string[] {
  if (state.status === 'resolved' || state.status === 'busted') {
    return [];
  }

  const abilities = state.abilities;

  // Phase 5: Check if bail-out is available for any game type
  const addBailOutIfAvailable = (actions: string[]) => {
    if (state.canBailOut && state.bailOutValue && state.bailOutValue > 0) {
      actions.push('bail_out');
    }
    return actions;
  };

  switch (state.gameType) {
    case 'pokerHoldDraw': {
      const actions: string[] = [];
      const round = state.currentRound || 1;
      const maxRounds = state.maxRounds || 3;

      // Base actions
      if (round === 1 && state.hand.length === 0) {
        return ['draw']; // Initial draw
      }

      // During rounds: hold cards, then draw
      actions.push('hold', 'draw');

      // Early finish - always available after round 1
      if (round > 1 && abilities?.canEarlyFinish) {
        actions.push('early_finish');
      }

      // Reroll - if available and not all used
      if (abilities && abilities.rerollsAvailable > (state.rerollsUsed || 0)) {
        actions.push('reroll');
      }

      // Peek - if available and not all used
      if (abilities && abilities.peeksAvailable > (state.peeksUsed || 0) && !state.peekedCard) {
        actions.push('peek');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'pressYourLuck': {
      const actions: string[] = [];

      if (state.hand.length === 0) {
        return ['draw'];
      }

      if (state.hand.length >= state.maxTurns) {
        return ['stop'];
      }

      // Base actions
      actions.push('draw', 'stop');

      // Safe draw - skill 10+, costs gold
      if (abilities?.canSafeDraw && (state.safeDrawsUsed || 0) < 2) {
        actions.push('safe_draw');
      }

      // Double down - skill 25+, risk all for 2x
      if (abilities?.canDoubleDownPYL && !state.isDoubleDownPYL && state.hand.length >= 2) {
        actions.push('double_down');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'blackjack': {
      const value = calculateBlackjackValue(state.hand);

      if (value >= 21) return [];
      if (state.hand.length < 2) return ['hit'];

      const actions: string[] = ['hit', 'stand'];

      // Double down - skill 5+, only on first decision (2 cards)
      if (abilities?.canDoubleDown && state.hand.length === 2 && !state.isDoubledDown) {
        actions.push('double_down');
      }

      // Insurance - skill 15+, only when dealer shows Ace
      if (abilities?.canInsurance &&
          state.dealerUpCard?.rank === Rank.ACE &&
          !state.hasInsurance &&
          state.hand.length === 2) {
        actions.push('insurance');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'deckbuilder': {
      const actions: string[] = [];
      if (state.hand.length >= state.maxTurns) return ['stop'];
      if (state.hand.length === 0) return ['draw'];
      actions.push('draw', 'stop');
      return addBailOutIfAvailable(actions);
    }

    case 'combatDuel': {
      const actions: string[] = [];

      // Card selection actions (always available during combat)
      actions.push('select_attack', 'select_defense', 'execute_turn');

      // Flee - only in first 3 rounds
      if (state.canFlee && (state.combatRound || 1) <= 3) {
        actions.push('flee');
      }

      return addBailOutIfAvailable(actions);
    }

    default:
      return [];
  }
}

/**
 * Calculate danger meter for Press Your Luck
 * Shows probability of drawing a danger card (J, Q, K)
 */
function calculateDangerMeter(state: GameState): number {
  const remainingCards = state.deck.length;
  if (remainingCards === 0) return 0;

  // Count danger cards remaining in deck
  const dangerCards = state.deck.filter(c =>
    [Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
  ).length;

  // Raw probability as percentage
  const rawProbability = (dangerCards / remainingCards) * 100;

  // Account for danger avoidance from skills
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const adjustedProbability = rawProbability * (1 - modifiers.dangerAvoidChance);

  return Math.round(adjustedProbability);
}

/**
 * Generate card counting hint for skilled blackjack players
 */
function generateCardCountHint(state: GameState): string {
  const abilities = state.abilities;
  if (!abilities || abilities.cardCountingBonus === 0) {
    return '';
  }

  const remainingCards = state.deck.length;
  const highCards = state.deck.filter(c =>
    [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].includes(c.rank)
  ).length;
  const lowCards = state.deck.filter(c =>
    [Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX].includes(c.rank)
  ).length;

  const highPercent = Math.round((highCards / remainingCards) * 100);

  // More specific hints at higher skill
  if (abilities.cardCountingBonus >= 20) {
    return `Deck: ${highPercent}% high cards (${highCards}/${remainingCards})`;
  } else if (abilities.cardCountingBonus >= 10) {
    if (highPercent > 45) return 'Deck favors high cards';
    if (highPercent < 35) return 'Deck favors low cards';
    return 'Deck is balanced';
  } else {
    if (highPercent > 50) return 'Many high cards remain';
    if (highPercent < 30) return 'Few high cards remain';
    return '';
  }
}

function getMaxTurns(gameType: GameType): number {
  switch (gameType) {
    case 'pokerHoldDraw': return 3; // 3 rounds: initial deal + 2 draw phases
    case 'pressYourLuck': return 10;
    case 'blackjack': return 10;
    case 'deckbuilder': return 7;
    default: return 5;
  }
}

// =============================================================================
// POKER: Multi-Round System with Special Abilities
// =============================================================================

/**
 * Process poker action with multi-round support and special abilities
 *
 * PHASE 3 ENHANCEMENTS:
 * - 3 rounds instead of 1
 * - Reroll ability (skill 30+): redraw a single card
 * - Peek ability (skill 50+): see next card before deciding
 * - Early finish: end game early for speed bonus
 */
function processPokerAction(state: GameState, action: PlayerAction): GameState {
  const maxRounds = state.maxRounds || 3;
  const currentRound = state.currentRound || 1;

  // === HOLD ===
  if (action.type === 'hold') {
    state.heldCards = action.cardIndices || [];
    return state;
  }

  // === DRAW ===
  if (action.type === 'draw') {
    // Discard non-held cards and draw new ones
    const heldIndices = state.heldCards || [];
    const keptCards: Card[] = [];
    const discardedCards: Card[] = [];

    state.hand.forEach((card, i) => {
      if (heldIndices.includes(i)) {
        keptCards.push(card);
      } else {
        discardedCards.push(card);
      }
    });

    state.discarded.push(...discardedCards);
    const newCards = drawCards(state, 5 - keptCards.length);
    state.hand = [...keptCards, ...newCards];
    state.heldCards = [];

    // Clear peeked card after draw
    state.peekedCard = null;

    // Advance round
    state.currentRound = currentRound + 1;
    state.turnNumber++;

    // Check if game is complete (>= because we resolve when reaching the final round, not after)
    if ((state.currentRound || 1) >= maxRounds) {
      state.status = 'resolved';
    }

    return state;
  }

  // === REROLL (Skill 30+) ===
  if (action.type === 'reroll') {
    const abilities = state.abilities;
    if (!abilities || abilities.rerollsAvailable <= (state.rerollsUsed || 0)) {
      return state; // Can't reroll
    }

    // SECURITY FIX: Use SecureRNG
    // Reroll specific cards (or random if not specified)
    const indicesToReroll = action.cardIndices || [SecureRNG.range(0, state.hand.length - 1)];

    indicesToReroll.forEach(idx => {
      if (idx >= 0 && idx < state.hand.length && state.deck.length > 0) {
        const oldCard = state.hand[idx];
        state.discarded.push(oldCard);
        state.hand[idx] = drawCards(state, 1)[0];
      }
    });

    state.rerollsUsed = (state.rerollsUsed || 0) + 1;
    return state;
  }

  // === PEEK (Skill 50+) ===
  if (action.type === 'peek') {
    const abilities = state.abilities;
    if (!abilities || abilities.peeksAvailable <= (state.peeksUsed || 0)) {
      return state; // Can't peek
    }

    if (state.deck.length > 0) {
      // Show the next card without removing it from deck
      state.peekedCard = state.deck[state.deck.length - 1];
      state.peeksUsed = (state.peeksUsed || 0) + 1;
    }

    return state;
  }

  // === EARLY FINISH ===
  if (action.type === 'early_finish') {
    // Calculate speed bonus based on rounds saved
    const roundsSaved = maxRounds - currentRound;
    state.earlyFinishBonus = roundsSaved * 25; // 25 points per round saved
    state.status = 'resolved';
    return state;
  }

  return state;
}

// =============================================================================
// PRESS YOUR LUCK: Risk/Reward with Strategic Options
// =============================================================================

/**
 * Process Press Your Luck action with enhanced mechanics
 *
 * PHASE 3 ENHANCEMENTS:
 * - Safe Draw (skill 10+): pay gold for guaranteed safe card
 * - Double Down (skill 25+): risk current score for 2x multiplier
 * - Streak tracking: consecutive safe draws give bonus
 * - Danger meter: shows bust probability
 */
function processPressYourLuckAction(state: GameState, action: PlayerAction): GameState {
  // === STOP ===
  if (action.type === 'stop') {
    state.status = 'resolved';
    return state;
  }

  // === REGULAR DRAW ===
  if (action.type === 'draw') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    // Check for danger cards (J, Q, K)
    if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
      // SKILL MODIFIER: Chance to avoid danger
      const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

      // SECURITY FIX: Use SecureRNG
      if (SecureRNG.chance(modifiers.dangerAvoidChance)) {
        // Avoided danger - track for streak
        state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;
      } else {
        // Danger counted - reset streak
        state.dangerCount = (state.dangerCount || 0) + 1;
        state.consecutiveSafeDraws = 0;
      }
    } else {
      // Safe card - build streak
      state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;
    }

    // Update streak multiplier (3+ safe draws = bonus)
    const streak = state.consecutiveSafeDraws || 0;
    if (streak >= 5) {
      state.streakMultiplier = 1.5;
    } else if (streak >= 3) {
      state.streakMultiplier = 1.25;
    } else {
      state.streakMultiplier = 1.0;
    }

    // Update danger meter
    state.dangerMeter = calculateDangerMeter(state);

    // Bust on 3 danger cards
    if ((state.dangerCount || 0) >= 3) {
      state.status = 'busted';
    } else if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }

    return state;
  }

  // === SAFE DRAW (Skill 10+) ===
  if (action.type === 'safe_draw') {
    const abilities = state.abilities;
    if (!abilities?.canSafeDraw || (state.safeDrawsUsed || 0) >= 2) {
      return state; // Can't safe draw
    }

    // Find a safe card (not J, Q, K) in the deck
    const safeCardIndex = state.deck.findIndex(c =>
      ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
    );

    if (safeCardIndex === -1) {
      // No safe cards left - normal draw
      return processPressYourLuckAction(state, { type: 'draw' });
    }

    // Remove the safe card and add to hand
    const [safeCard] = state.deck.splice(safeCardIndex, 1);
    state.hand.push(safeCard);

    // Track safe draw usage
    state.safeDrawsUsed = (state.safeDrawsUsed || 0) + 1;

    // Build streak
    state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;

    // Update streak multiplier
    const streak = state.consecutiveSafeDraws || 0;
    if (streak >= 5) {
      state.streakMultiplier = 1.5;
    } else if (streak >= 3) {
      state.streakMultiplier = 1.25;
    }

    // Update danger meter
    state.dangerMeter = calculateDangerMeter(state);

    if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }

    return state;
  }

  // === DOUBLE DOWN (Skill 25+) ===
  if (action.type === 'double_down') {
    const abilities = state.abilities;
    if (!abilities?.canDoubleDownPYL || state.isDoubleDownPYL) {
      return state; // Can't double down
    }

    // Store current accumulated score before risk
    const safeCards = state.hand.filter(c =>
      ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
    ).length;
    state.accumulatedScore = safeCards * 50;

    // Activate double down mode
    state.isDoubleDownPYL = true;

    return state;
  }

  return state;
}

// =============================================================================
// BLACKJACK: Vegas-Style Options
// =============================================================================

/**
 * Process blackjack action with Vegas-style options
 *
 * PHASE 3 ENHANCEMENTS:
 * - Double Down (skill 5+): double bet, get exactly one card
 * - Insurance (skill 15+): protect against dealer blackjack
 * - Card counting hints (skill 20+): see deck composition
 */
function processBlackjackAction(state: GameState, action: PlayerAction): GameState {
  // === STAND ===
  if (action.type === 'stand') {
    state.status = 'resolved';
    return state;
  }

  // === HIT ===
  if (action.type === 'hit') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    // Update card counting info
    state.cardCountInfo = generateCardCountHint(state);

    const value = calculateBlackjackValue(state.hand);
    if (value > 21) {
      state.status = 'busted';
    } else if (value === 21) {
      state.status = 'resolved';
    }

    return state;
  }

  // === DOUBLE DOWN (Skill 5+) ===
  if (action.type === 'double_down') {
    const abilities = state.abilities;
    if (!abilities?.canDoubleDown || state.isDoubledDown || state.hand.length !== 2) {
      return state; // Can't double down
    }

    // Mark as doubled down
    state.isDoubledDown = true;
    state.currentBetMultiplier = 2.0;

    // Draw exactly one card
    const card = drawCards(state, 1)[0];
    if (card) {
      state.hand.push(card);
    }

    // Update card counting info
    state.cardCountInfo = generateCardCountHint(state);

    // Resolve immediately after double down
    const value = calculateBlackjackValue(state.hand);
    if (value > 21) {
      state.status = 'busted';
    } else {
      state.status = 'resolved';
    }

    return state;
  }

  // === INSURANCE (Skill 15+) ===
  if (action.type === 'insurance') {
    const abilities = state.abilities;
    if (!abilities?.canInsurance || state.hasInsurance) {
      return state; // Can't take insurance
    }

    // Only available when dealer shows Ace
    if (state.dealerUpCard?.rank !== Rank.ACE) {
      return state;
    }

    state.hasInsurance = true;
    // Insurance pays 2:1 if dealer has blackjack
    // This is resolved in the resolution phase

    return state;
  }

  return state;
}

// Deckbuilder logic
function processDeckbuilderAction(state: GameState, action: PlayerAction): GameState {
  if (action.type === 'stop') {
    state.status = 'resolved';
    return state;
  }

  if (action.type === 'draw') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }
  }

  return state;
}

// =============================================================================
// COMBAT DUEL: Process Actions
// =============================================================================

/**
 * Process combat duel actions
 * Player selects which cards to use for attack vs defense
 */
function processCombatDuelAction(state: GameState, action: PlayerAction): GameState {
  // Handle flee action (only in first 3 rounds)
  if (action.type === 'flee') {
    if (state.canFlee && (state.combatRound || 1) <= 3) {
      state.status = 'resolved';
      state.opponentHP = state.opponentMaxHP; // Didn't beat opponent
      return state;
    }
    // Can't flee after round 3
    return state;
  }

  // Handle card selection for attack
  if (action.type === 'select_attack') {
    if (action.cardIndices && action.cardIndices.length > 0) {
      state.attackCards = action.cardIndices;
      // Remove from defense if already there
      state.defenseCards = (state.defenseCards || []).filter(
        i => !action.cardIndices!.includes(i)
      );
    }
    return state;
  }

  // Handle card selection for defense
  if (action.type === 'select_defense') {
    if (action.cardIndices && action.cardIndices.length > 0) {
      state.defenseCards = action.cardIndices;
      // Remove from attack if already there
      state.attackCards = (state.attackCards || []).filter(
        i => !action.cardIndices!.includes(i)
      );
    }
    return state;
  }

  // Handle execute turn (commit attack/defense choices)
  if (action.type === 'execute_turn') {
    // Validate: all 5 cards must be assigned
    const totalAssigned = (state.attackCards?.length || 0) + (state.defenseCards?.length || 0);
    if (totalAssigned !== 5) {
      // Auto-assign remaining cards to attack
      const allIndices = [0, 1, 2, 3, 4];
      const assigned = [...(state.attackCards || []), ...(state.defenseCards || [])];
      const unassigned = allIndices.filter(i => !assigned.includes(i));
      state.attackCards = [...(state.attackCards || []), ...unassigned];
    }

    // Process the combat turn
    const result = processCombatTurn(state);

    // Check for end conditions
    if (result.opponentDefeated) {
      state.status = 'resolved';
      return state;
    }

    if (result.playerDefeated) {
      state.status = 'busted'; // Player lost
      return state;
    }

    // Continue to next round
    state.combatRound = (state.combatRound || 1) + 1;
    state.turnNumber = state.combatRound;

    // Can only flee in first 3 rounds
    if (state.combatRound > 3) {
      state.canFlee = false;
    }

    // Check for max rounds
    if (state.combatRound > state.maxTurns) {
      // Timeout - determine winner by remaining HP percentage
      const playerHPPercent = (state.playerHP || 0) / (state.playerMaxHP || 1);
      const opponentHPPercent = (state.opponentHP || 0) / (state.opponentMaxHP || 1);
      if (playerHPPercent >= opponentHPPercent) {
        state.status = 'resolved'; // Player wins by HP
      } else {
        state.status = 'busted'; // Opponent wins
      }
      return state;
    }

    // Draw fresh hand for next round
    // Discard current hand
    state.discarded.push(...state.hand);
    state.hand = [];

    // Shuffle discard back if deck is low
    if (state.deck.length < 5) {
      state.deck.push(...state.discarded);
      state.discarded = [];
      shuffleDeck(state.deck);
    }

    // Draw new hand
    state.hand = drawCards(state, 5);

    // Reset attack/defense selections
    state.attackCards = [];
    state.defenseCards = [];

    // Simulate next opponent attack (shown to player for strategy)
    const tempCards = drawCards(state, 5);
    const { attack: oppAttack, defense: oppDefense } = simulateOpponentCombat(
      tempCards,
      state.opponentDifficulty || state.difficulty
    );
    state.opponentAttackDamage = oppAttack;
    state.opponentDefenseReduction = oppDefense;

    // Put opponent's cards back
    state.deck.push(...tempCards);
    shuffleDeck(state.deck);

    return state;
  }

  return state;
}

/**
 * Resolve combat duel game
 * Called when status becomes 'resolved' or 'busted'
 */
function resolveCombatDuelGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const playerWon = state.opponentHP !== undefined && state.opponentHP <= 0;
  const playerDefeated = state.playerHP !== undefined && state.playerHP <= 0;
  const fled = state.status === 'resolved' && !playerWon && !playerDefeated;

  // Calculate score based on performance
  let score = 0;
  if (playerWon) {
    // Score based on HP remaining and rounds taken
    const hpPercent = (state.playerHP || 0) / (state.playerMaxHP || 1);
    const roundsUsed = state.combatRound || 1;
    score = Math.floor(100 + (hpPercent * 50) + (20 / roundsUsed));
  } else if (fled) {
    score = 10; // Minimal score for fleeing
  } else {
    score = 0; // Defeat
  }

  // Calculate rewards based on opponent difficulty and performance
  const difficultyMult = 1 + ((state.opponentDifficulty || 1) * 0.2);
  const baseGold = playerWon ? Math.floor((30 + (state.opponentDifficulty || 1) * 15) * difficultyMult * suitBonus.multiplier) : 0;
  const baseXP = playerWon ? Math.floor((20 + (state.opponentDifficulty || 1) * 8) * suitBonus.multiplier) : fled ? 5 : 10;

  return {
    success: playerWon,
    score,
    handName: playerWon
      ? `Victory in ${state.combatRound || 1} rounds`
      : fled
        ? 'Fled from battle'
        : `Defeated after ${state.combatRound || 1} rounds`,
    suitMatches,
    suitBonus,
    mitigation: playerDefeated ? {
      damageReduction: Math.min(0.3, suitMatches * 0.1)
    } : undefined,
    rewards: {
      gold: baseGold,
      experience: baseXP
    }
  };
}

function getBlackjackTarget(difficulty: number): number {
  const targets: Record<number, number> = {
    1: 15,
    2: 17,
    3: 18,
    4: 19,
    5: 21
  };
  return targets[difficulty] || 18;
}

/**
 * Resolve blackjack game with Phase 3 Vegas-style options
 * - Double down multiplier
 * - Insurance payout
 * - Card counting feedback
 */
function resolveBlackjackGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const value = calculateBlackjackValue(state.hand);
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // Double down bet multiplier
  const betMultiplier = state.currentBetMultiplier || 1.0;

  // === BUSTED ===
  if (state.status === 'busted' || value > 21) {
    const baseMitigation = Math.min(0.3, suitMatches * 0.1);
    const skillMitigation = modifiers.thresholdReduction * 0.005;

    // Double down bust = double the pain
    const handName = state.isDoubledDown
      ? `DOUBLE DOWN BUST! (Lost 2x)`
      : 'Bust';

    return {
      success: false,
      score: 0,
      handName,
      suitMatches,
      suitBonus: { ...suitBonus, specialEffect: state.isDoubledDown ? 'Risky Move!' : undefined },
      mitigation: { damageReduction: Math.min(0.5, baseMitigation + skillMitigation) }
    };
  }

  const baseTarget = getBlackjackTarget(state.difficulty);
  const adjustedTarget = Math.max(12, baseTarget - Math.floor(modifiers.thresholdReduction * 0.3));
  const success = value >= adjustedTarget;

  // Build feedback
  const feedbackParts: string[] = [];

  if (state.isDoubledDown) {
    feedbackParts.push('2x Bet');
  }

  if (state.hasInsurance) {
    // Check if dealer has blackjack (simulate)
    const dealerValue = state.dealerUpCard ?
      (state.dealerUpCard.rank === Rank.ACE ? 11 :
       [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING].includes(state.dealerUpCard.rank) ? 10 :
       state.dealerUpCard.rank as number) : 0;

    // Dealer blackjack = insurance pays 2:1
    if (dealerValue >= 10) {
      feedbackParts.push('Insurance Paid');
    }
  }

  if (state.cardCountInfo && state.cardCountInfo.length > 0) {
    feedbackParts.push(`Count: ${state.cardCountInfo}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  // Calculate final score with bet multiplier
  const baseScore = value * 10;
  const finalScore = Math.round(baseScore * betMultiplier);

  // Hand name
  let handName = `${value}`;
  if (value === 21 && state.hand.length === 2) {
    handName = 'BLACKJACK!';
    if (state.isDoubledDown) {
      handName += ' (Cannot DD on Blackjack)';
    }
  } else if (state.isDoubledDown && success) {
    handName = `${value} - DOUBLE DOWN WIN!`;
  }

  handName += feedbackStr;

  // Special effect
  let specialEffect = suitBonus.specialEffect;
  if (state.isDoubledDown && success) {
    specialEffect = 'Double Down Success! 2x Rewards!';
  } else if (value === 21 && state.hand.length === 2) {
    specialEffect = 'Natural Blackjack!';
  }

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}

function resolveDeckbuilderGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  // Score based on combos found
  let score = 0;
  const combos: string[] = [];

  // Count ranks
  const rankCounts: Record<string, number> = {};
  state.hand.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  // Check for pairs/trips/quads
  Object.values(rankCounts).forEach(count => {
    if (count >= 4) { score += 200; combos.push('Four of a Kind'); }
    else if (count >= 3) { score += 100; combos.push('Triple'); }
    else if (count >= 2) { score += 50; combos.push('Pair'); }
  });

  // Efficiency bonus for unused draws
  const efficiency = (state.maxTurns - state.hand.length) * 10;
  score += efficiency;

  const threshold = state.difficulty * 100;
  const success = score >= threshold;

  return {
    success,
    score,
    handName: combos.length > 0 ? combos.join(', ') : 'No Combos',
    suitMatches,
    suitBonus,
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}

function getPokerThreshold(difficulty: number): number {
  const thresholds: Record<number, number> = {
    1: 100, // Pair
    2: 200, // Two Pair
    3: 300, // Three of a Kind
    4: 400, // Straight
    5: 500  // Flush
  };
  return thresholds[difficulty] || 200;
}

function checkStraight(cards: Card[]): boolean {
  const values = cards.map(c => {
    if (c.rank === Rank.ACE) return 14;
    if (c.rank === Rank.KING) return 13;
    if (c.rank === Rank.QUEEN) return 12;
    if (c.rank === Rank.JACK) return 11;
    return c.rank as number;
  }).sort((a, b) => a - b);

  let consecutive = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1] + 1) {
      consecutive++;
      if (consecutive >= 5) return true;
    } else if (values[i] !== values[i - 1]) {
      consecutive = 1;
    }
  }
  return false;
}

function evaluatePokerHand(cards: Card[]): { handName: string; score: number } {
  // Count ranks and suits
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};

  cards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(c => c >= 5);
  const isStraight = checkStraight(cards);

  // Evaluate hand
  if (isFlush && isStraight) return { handName: 'Straight Flush', score: 800 };
  if (counts[0] === 4) return { handName: 'Four of a Kind', score: 700 };
  if (counts[0] === 3 && counts[1] === 2) return { handName: 'Full House', score: 600 };
  if (isFlush) return { handName: 'Flush', score: 500 };
  if (isStraight) return { handName: 'Straight', score: 400 };
  if (counts[0] === 3) return { handName: 'Three of a Kind', score: 300 };
  if (counts[0] === 2 && counts[1] === 2) return { handName: 'Two Pair', score: 200 };
  if (counts[0] === 2) return { handName: 'One Pair', score: 100 };
  return { handName: 'High Card', score: 50 };
}

/**
 * Resolve poker game with Phase 3 enhancements
 * - Early finish speed bonus
 * - Ability usage tracking
 * - Enhanced feedback
 */
function resolvePokerGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const { handName, score } = evaluatePokerHand(state.hand);
  const baseThreshold = getPokerThreshold(state.difficulty);

  // SKILL MODIFIERS
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // Lower threshold = easier to succeed
  const adjustedThreshold = Math.max(50, baseThreshold - modifiers.thresholdReduction);

  // Add skill bonus to score + early finish bonus
  const earlyBonus = state.earlyFinishBonus || 0;
  const adjustedScore = score + modifiers.cardBonus + earlyBonus;

  const success = adjustedScore >= adjustedThreshold;

  // Build detailed feedback
  const feedbackParts: string[] = [];

  if (modifiers.cardBonus > 0) {
    feedbackParts.push(`Skill +${modifiers.cardBonus}`);
  }

  if (earlyBonus > 0) {
    feedbackParts.push(`Speed +${earlyBonus}`);
  }

  if (state.rerollsUsed && state.rerollsUsed > 0) {
    feedbackParts.push(`${state.rerollsUsed} reroll${state.rerollsUsed > 1 ? 's' : ''}`);
  }

  if (state.peeksUsed && state.peeksUsed > 0) {
    feedbackParts.push(`${state.peeksUsed} peek${state.peeksUsed > 1 ? 's' : ''}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  // Special effect for early finish
  const specialEffect = earlyBonus > 0
    ? `Speed Bonus! +${earlyBonus}`
    : suitBonus.specialEffect;

  return {
    success,
    score: adjustedScore,
    handName: handName + feedbackStr,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.5, suitMatches * 0.1) }
  };
}

/**
 * Resolve Press Your Luck game with Phase 3 enhancements
 * - Streak multiplier bonus
 * - Double down 2x multiplier
 * - Safe draw tracking
 * - Enhanced feedback
 */
function resolvePressYourLuckGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const dangerCount = state.dangerCount || 0;
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // === BUSTED ===
  if (state.status === 'busted') {
    const baseMitigation = Math.min(0.3, suitMatches * 0.1);
    const skillMitigation = modifiers.dangerAvoidChance * 0.3;

    // If double-downed, lose everything
    const wasDDing = state.isDoubleDownPYL;

    return {
      success: false,
      score: 0,
      handName: wasDDing
        ? `DOUBLE DOWN BUST! Lost ${state.accumulatedScore || 0} points!`
        : `BUSTED! ${state.hand.length} Cards (${dangerCount} Danger)`,
      suitMatches,
      suitBonus: { ...suitBonus, specialEffect: wasDDing ? 'Risk Failed!' : 'Caught!' },
      mitigation: { damageReduction: Math.min(0.5, baseMitigation + skillMitigation) }
    };
  }

  // === SUCCESS ===
  const safeCards = state.hand.filter(c =>
    ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
  ).length;

  // Base score + skill bonus
  const baseScore = safeCards * 50;
  const skillBonusScore = modifiers.cardBonus * 5;
  let score = baseScore + skillBonusScore;

  // Calculate tier multiplier
  const skillBonus = (state.characterSuitBonus || 0) * 0.02;
  const effectiveCards = state.hand.length + (suitMatches * 0.5) + skillBonus;
  let tierMultiplier = 0.5;
  let tierName = 'Cautious';

  if (effectiveCards >= 7) {
    tierMultiplier = 2.0;
    tierName = 'Daring Heist';
  } else if (effectiveCards >= 5) {
    tierMultiplier = 1.5;
    tierName = 'Bold Move';
  } else if (effectiveCards >= 3) {
    tierMultiplier = 1.0;
    tierName = 'Balanced';
  }

  // Apply streak multiplier
  const streakMult = state.streakMultiplier || 1.0;
  if (streakMult > 1.0) {
    tierName += ` + ${Math.round((streakMult - 1) * 100)}% Streak`;
  }

  // Apply double-down multiplier (if active and successful)
  const ddMultiplier = state.isDoubleDownPYL ? 2.0 : 1.0;
  if (state.isDoubleDownPYL) {
    tierName = 'DOUBLE DOWN WIN! ' + tierName;
  }

  // Final score calculation
  const finalScore = Math.round(score * tierMultiplier * streakMult * ddMultiplier * suitBonus.multiplier);

  // Build feedback
  const feedbackParts: string[] = [];
  if (state.safeDrawsUsed && state.safeDrawsUsed > 0) {
    feedbackParts.push(`${state.safeDrawsUsed} safe draw${state.safeDrawsUsed > 1 ? 's' : ''}`);
  }
  if (state.consecutiveSafeDraws && state.consecutiveSafeDraws >= 3) {
    feedbackParts.push(`${state.consecutiveSafeDraws} streak`);
  }
  if (state.dangerMeter) {
    feedbackParts.push(`${state.dangerMeter}% risk`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` | ${feedbackParts.join(', ')}` : '';

  return {
    success: true,
    score: finalScore,
    handName: `${state.hand.length} Cards (${dangerCount} Danger)${feedbackStr}`,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect: tierName },
    mitigation: undefined
  };
}

function calculateSuitBonus(suitMatches: number): { multiplier: number; specialEffect?: string } {
  if (suitMatches >= 5) {
    return { multiplier: 2.0, specialEffect: 'Perfect Suit Mastery!' };
  } else if (suitMatches >= 4) {
    return { multiplier: 1.75, specialEffect: 'Excellent Suit Alignment' };
  } else if (suitMatches >= 3) {
    return { multiplier: 1.5, specialEffect: 'Strong Suit Bonus' };
  } else if (suitMatches >= 2) {
    return { multiplier: 1.25 };
  } else if (suitMatches >= 1) {
    return { multiplier: 1.1 };
  }
  return { multiplier: 1.0 };
}

function countSuitMatches(hand: Card[], relevantSuit?: string): number {
  if (!relevantSuit) return 0;
  return hand.filter(card =>
    card.suit.toLowerCase() === relevantSuit.toLowerCase()
  ).length;
}


// =============================================================================
// NEW CARD GAME RESOLVERS
// =============================================================================

/**
 * Faro - Simple betting on card order
 * Classic Old West saloon game with minimal complexity
 *
 * Rules:
 * - Draw a series of cards (5-7 cards based on difficulty)
 * - Score based on card values (Ace=14, King=13, ..., 2=2)
 * - Success if total value meets or exceeds threshold
 * - Suit matches provide bonus multipliers
 */
function resolveFaroGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  // Calculate card values for Faro
  const cardValues = state.hand.map(card => {
    if (card.rank === Rank.ACE) return 14;
    if (card.rank === Rank.KING) return 13;
    if (card.rank === Rank.QUEEN) return 12;
    if (card.rank === Rank.JACK) return 11;
    return card.rank as number;
  });

  const baseScore = cardValues.reduce((sum, val) => sum + val, 0);

  // Get skill modifiers
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // Calculate threshold based on difficulty
  // Easy: 35, Medium: 50, Hard: 65, Very Hard: 80, Extreme: 95
  const baseThreshold = 35 + (state.difficulty * 15);
  const adjustedThreshold = Math.max(30, baseThreshold - modifiers.thresholdReduction);

  // Apply skill bonus to score
  const adjustedScore = baseScore + modifiers.cardBonus;

  const success = adjustedScore >= adjustedThreshold;

  // Build hand description
  const highCard = cardValues.length > 0 ? Math.max(...cardValues) : 0;
  const highCardName = highCard === 14 ? 'Ace' :
                        highCard === 13 ? 'King' :
                        highCard === 12 ? 'Queen' :
                        highCard === 11 ? 'Jack' : `${highCard}`;

  const handName = `Faro (${state.hand.length} cards, High: ${highCardName})`;

  // Build feedback
  const feedbackParts: string[] = [];
  if (modifiers.cardBonus > 0) {
    feedbackParts.push(`Skill +${modifiers.cardBonus}`);
  }
  if (suitMatches > 0) {
    feedbackParts.push(`${suitMatches} suit match${suitMatches > 1 ? 'es' : ''}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  return {
    success,
    score: adjustedScore,
    handName: handName + feedbackStr,
    suitMatches,
    suitBonus,
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}


// =============================================================================
// PHASE 5: RISK/REWARD SYSTEMS
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

const WAGER_TIERS: Record<string, WagerConfig> = {
  low: {
    tier: 'low',
    minAmount: 10,
    maxAmount: 100,
    multiplier: 1.0,
    lossMultiplier: 1.0,
    unlockLevel: 1,
    houseEdge: 0.0
  },
  medium: {
    tier: 'medium',
    minAmount: 100,
    maxAmount: 500,
    multiplier: 2.0,
    lossMultiplier: 1.5,
    unlockLevel: 10,
    houseEdge: 0.02
  },
  high: {
    tier: 'high',
    minAmount: 500,
    maxAmount: 2000,
    multiplier: 5.0,
    lossMultiplier: 2.0,
    unlockLevel: 25,
    houseEdge: 0.05
  },
  vip: {
    tier: 'vip',
    minAmount: 2000,
    maxAmount: 10000,
    multiplier: 10.0,
    lossMultiplier: 3.0,
    unlockLevel: 50,
    houseEdge: 0.08
  }
};

/**
 * Get wager configuration for a tier
 */
export function getWagerConfig(tier: string): WagerConfig {
  return WAGER_TIERS[tier] || WAGER_TIERS.low;
}

/**
 * Validate and calculate wager for a game
 * @returns Validated wager amount and multiplier, or null if invalid
 */
export function calculateWager(
  requestedAmount: number,
  tier: string,
  characterLevel: number,
  characterGold: number
): { amount: number; multiplier: number; tier: string } | null {
  const config = getWagerConfig(tier);

  // Check unlock level
  if (characterLevel < config.unlockLevel) {
    return null;
  }

  // Check if player can afford
  if (characterGold < requestedAmount) {
    return null;
  }

  // Clamp to valid range
  const amount = Math.max(config.minAmount, Math.min(config.maxAmount, requestedAmount));

  return {
    amount,
    multiplier: config.multiplier,
    tier: config.tier
  };
}

/**
 * Calculate streak bonus based on consecutive wins
 * Rewards hot hands while preventing runaway bonuses
 *
 * Streak 1-2: 1.0x (no bonus)
 * Streak 3: 1.1x
 * Streak 4: 1.2x
 * Streak 5: 1.3x
 * Streak 6+: 1.5x (capped)
 */
export function calculateStreakBonus(consecutiveWins: number): number {
  if (consecutiveWins < 3) return 1.0;
  if (consecutiveWins === 3) return 1.1;
  if (consecutiveWins === 4) return 1.2;
  if (consecutiveWins === 5) return 1.3;
  return 1.5; // Max cap at 6+ wins
}

/**
 * Calculate underdog bonus for players on a losing streak
 * Helps prevent frustration spirals
 *
 * 0-2 losses: 0% bonus
 * 3 losses: +5% success chance
 * 4 losses: +10% success chance
 * 5+ losses: +15% success chance (capped)
 */
export function calculateUnderdogBonus(consecutiveLosses: number): number {
  if (consecutiveLosses < 3) return 0;
  if (consecutiveLosses === 3) return 0.05;
  if (consecutiveLosses === 4) return 0.10;
  return 0.15; // Max cap at 5+ losses
}

/**
 * Check if hot hand is triggered
 * Hot hand activates after 4+ consecutive wins
 * Lasts for 3 rounds with +20% success rate
 */
export function checkHotHand(consecutiveWins: number): { active: boolean; rounds: number } {
  if (consecutiveWins >= 4) {
    return { active: true, rounds: 3 };
  }
  return { active: false, rounds: 0 };
}

/**
 * Calculate bail-out value
 * Players can cash out early for a guaranteed partial reward
 * Value depends on game progress and current score
 *
 * @param currentScore - Current game score (0-100+)
 * @param turnsRemaining - How many turns left
 * @param maxTurns - Total turns in game
 * @param difficulty - Game difficulty (1-5)
 * @param baseReward - What full success would pay
 * @returns Guaranteed value if player bails out now
 */
export function calculateBailOutValue(
  currentScore: number,
  turnsRemaining: number,
  maxTurns: number,
  difficulty: number,
  baseReward: number
): { canBailOut: boolean; value: number; percent: number } {
  // Can only bail out after at least 1 turn and before last turn
  if (turnsRemaining >= maxTurns || turnsRemaining <= 0) {
    return { canBailOut: false, value: 0, percent: 0 };
  }

  // Progress through the game (0-1)
  const progress = (maxTurns - turnsRemaining) / maxTurns;

  // Score factor - how close to "good" score (assume 50+ is decent)
  const scoreFactor = Math.min(1, currentScore / 50);

  // Base bail-out percentage (30% minimum, up to 70%)
  const basePercent = 0.30 + (progress * 0.25) + (scoreFactor * 0.15);

  // Difficulty penalty - harder games penalize early bail-out more
  const difficultyPenalty = (difficulty - 1) * 0.05;
  const finalPercent = Math.max(0.20, basePercent - difficultyPenalty);

  const value = Math.floor(baseReward * finalPercent);

  return {
    canBailOut: true,
    value,
    percent: Math.round(finalPercent * 100)
  };
}

/**
 * Apply wager and streak modifiers to final rewards
 */
export function applyRewardModifiers(
  baseReward: { gold: number; xp: number },
  state: GameState,
  success: boolean
): { gold: number; xp: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let goldMultiplier = 1.0;
  let xpMultiplier = 1.0;

  // === WAGER MULTIPLIER ===
  if (state.wagerMultiplier && state.wagerMultiplier > 1) {
    if (success) {
      goldMultiplier *= state.wagerMultiplier;
      breakdown.push(`Wager ${state.wagerTier}: ${state.wagerMultiplier}x gold`);
    } else {
      // On loss, wager amount is already deducted - no additional penalty to rewards
      breakdown.push(`Wager lost: -${state.wagerAmount} gold`);
    }
  }

  // === STREAK BONUS (only on success) ===
  if (success && state.streakBonus && state.streakBonus > 1) {
    goldMultiplier *= state.streakBonus;
    xpMultiplier *= (1 + (state.streakBonus - 1) * 0.5); // XP gets half the streak bonus
    breakdown.push(`Streak ${state.currentStreak}: ${state.streakBonus}x`);
  }

  // === HOT HAND (only on success) ===
  if (success && state.hotHandActive) {
    goldMultiplier *= 1.2;
    breakdown.push('Hot Hand: 1.2x gold');
  }

  // === UNDERDOG BONUS (built into success chance, not rewards) ===
  // But we note it for player feedback
  if (success && state.underdogBonus && state.underdogBonus > 0) {
    breakdown.push(`Underdog comeback! (+${Math.round(state.underdogBonus * 100)}% success)`);
  }

  return {
    gold: Math.floor(baseReward.gold * goldMultiplier),
    xp: Math.floor(baseReward.xp * xpMultiplier),
    breakdown
  };
}

/**
 * Update streak tracking after a game result
 */
export function updateStreakTracking(
  currentStreak: number,
  hotHandActive: boolean,
  hotHandRoundsLeft: number,
  success: boolean
): {
  newStreak: number;
  newStreakBonus: number;
  newHotHandActive: boolean;
  newHotHandRoundsLeft: number;
  newUnderdogBonus: number;
} {
  if (success) {
    const newStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
    const hotHand = checkHotHand(newStreak);

    return {
      newStreak,
      newStreakBonus: calculateStreakBonus(newStreak),
      newHotHandActive: hotHand.active || (hotHandActive && hotHandRoundsLeft > 1),
      newHotHandRoundsLeft: hotHand.active ? hotHand.rounds : Math.max(0, hotHandRoundsLeft - 1),
      newUnderdogBonus: 0 // Reset on win
    };
  } else {
    // Loss - track negative streak for underdog bonus
    const lossStreak = currentStreak <= 0 ? currentStreak - 1 : -1;

    return {
      newStreak: lossStreak,
      newStreakBonus: 1.0,
      newHotHandActive: false,
      newHotHandRoundsLeft: 0,
      newUnderdogBonus: calculateUnderdogBonus(Math.abs(lossStreak))
    };
  }
}

/**
 * Get game type based on action type
 */
export function getGameTypeForAction(actionType: string): GameType {
  switch (actionType) {
    case ActionType.COMBAT:
      return 'pokerHoldDraw';
    case ActionType.CRIME:
      return 'pressYourLuck';
    case ActionType.SOCIAL:
      return 'blackjack';
    case ActionType.CRAFT:
      return 'deckbuilder';
    default:
      return 'pokerHoldDraw';
  }
}

/**
 * Get game type based on job category
 * Maps location job categories to appropriate deck game types:
 * - labor: Standard work tasks → Poker (build the best hand)
 * - skilled: Precision crafting → Deckbuilder (collect combos)
 * - dangerous: Risk/reward tasks → Press Your Luck (know when to stop)
 * - social: Social interactions → Blackjack (read the situation)
 */
export function getGameTypeForJobCategory(category: string): GameType {
  switch (category) {
    case 'labor':
      return 'pokerHoldDraw';
    case 'skilled':
      return 'deckbuilder';
    case 'dangerous':
      return 'pressYourLuck';
    case 'social':
      return 'blackjack';
    default:
      return 'pokerHoldDraw';
  }
}

/**
 * Get human-readable game type name
 */
export function getGameTypeName(gameType: GameType): string {
  const names: Record<GameType, string> = {
    // Original 5 games
    pokerHoldDraw: 'Poker Hold/Draw',
    pressYourLuck: 'Press Your Luck',
    blackjack: 'Blackjack',
    deckbuilder: 'Deckbuilder',
    combatDuel: 'Combat Duel',
    // New card game expansion
    faro: 'Faro',
    threeCardMonte: 'Three-Card Monte',
    solitaireRace: 'Solitaire Race',
    texasHoldem: 'Texas Hold\'em',
    rummy: 'Rummy',
    warOfAttrition: 'War of Attrition',
    euchre: 'Euchre',
    cribbage: 'Cribbage'
  };
  return names[gameType];
}

/**
 * Initialize a new game
 *
 * PHASE 3: Now initializes all strategic options and special abilities
 * PHASE 5: Added wagering and streak tracking options
 *
 * @param options.characterSuitBonus - Character's total skill level for the relevant suit.
 *   This is the key to making stats matter! Higher skill = better success rates AND
 *   unlocks special abilities (reroll, peek, double down, etc.)
 * @param options.wagerAmount - Optional gold wager for risk/reward
 * @param options.wagerTier - Wager tier: 'low', 'medium', 'high', 'vip'
 * @param options.currentStreak - Player's current win/loss streak (positive = wins)
 * @param options.hotHandActive - Whether hot hand buff is active
 * @param options.hotHandRoundsLeft - Remaining rounds on hot hand
 */
export function initGame(options: {
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
}): GameState {
  const deck = createDeck();
  const skillLevel = options.characterSuitBonus || 0;

  // Calculate special abilities based on skill level
  const abilities = calculateSpecialAbilities(skillLevel);

  const state: GameState = {
    gameId: crypto.randomUUID(),
    gameType: options.gameType,
    playerId: options.playerId,
    deck,
    hand: [],
    discarded: [],
    status: 'waiting_action',
    turnNumber: 0,
    maxTurns: getMaxTurns(options.gameType),
    timeLimit: options.timeLimit || 60,
    startedAt: new Date(),
    relevantSuit: options.relevantSuit,
    difficulty: options.difficulty,
    characterSuitBonus: skillLevel,

    // Special abilities
    abilities,

    // === POKER: Multi-Round ===
    heldCards: [],
    currentRound: 1,
    maxRounds: getMaxTurns(options.gameType), // Use same value as maxTurns for consistency
    rerollsUsed: 0,
    peeksUsed: 0,
    peekedCard: null,
    earlyFinishBonus: 0,

    // === BLACKJACK: Vegas Options ===
    isDoubledDown: false,
    currentBetMultiplier: 1.0,
    hasInsurance: false,
    dealerUpCard: undefined,
    cardCountInfo: '',

    // === PRESS YOUR LUCK: Risk/Reward ===
    dangerCount: 0,
    consecutiveSafeDraws: 0,
    streakMultiplier: 1.0,
    safeDrawsUsed: 0,
    isDoubleDownPYL: false,
    accumulatedScore: 0,
    dangerMeter: 0,

    // === PHASE 5: WAGERING ===
    wagerAmount: options.wagerAmount || 0,
    wagerTier: options.wagerTier || 'low',
    wagerMultiplier: options.wagerTier ? getWagerConfig(options.wagerTier).multiplier : 1.0,

    // === PHASE 5: STREAK & MOMENTUM ===
    currentStreak: options.currentStreak || 0,
    streakBonus: calculateStreakBonus(options.currentStreak || 0),
    hotHandActive: options.hotHandActive || false,
    hotHandRoundsLeft: options.hotHandRoundsLeft || 0,
    underdogBonus: options.currentStreak && options.currentStreak < 0
      ? calculateUnderdogBonus(Math.abs(options.currentStreak))
      : 0,

    // === PHASE 5: BAIL-OUT ===
    canBailOut: false,  // Will be calculated dynamically
    bailOutValue: 0,
    partialRewardPercent: 0
  };

  // Game-type specific initialization
  switch (options.gameType) {
    case 'blackjack': {
      // Draw initial hand
      state.hand = drawCards(state, 2);

      // Simulate dealer's visible card for insurance decisions
      state.dealerUpCard = drawCards(state, 1)[0];

      // Generate card counting hint if skilled enough
      state.cardCountInfo = generateCardCountHint(state);
      break;
    }

    case 'pokerHoldDraw': {
      // Draw initial 5-card hand
      state.hand = drawCards(state, 5);
      state.turnNumber = 1;
      break;
    }

    case 'pressYourLuck': {
      // Calculate initial danger meter
      state.dangerMeter = calculateDangerMeter(state);
      break;
    }

    case 'deckbuilder': {
      // No special initialization needed
      break;
    }

    case 'combatDuel': {
      // Initialize combat-specific state
      state.opponentName = options.opponentName || 'Unknown Opponent';
      state.opponentMaxHP = options.opponentMaxHP || 100;
      state.opponentHP = state.opponentMaxHP;
      state.opponentDifficulty = options.opponentDifficulty || options.difficulty;
      state.playerMaxHP = options.playerMaxHP || 100;
      state.playerHP = state.playerMaxHP;
      state.combatRound = 1;
      state.canFlee = true;
      state.weaponBonus = options.weaponBonus || 0;
      state.armorBonus = options.armorBonus || 0;
      state.attackCards = [];
      state.defenseCards = [];
      state.lastPlayerDamage = 0;
      state.lastOpponentDamage = 0;

      // Draw initial 5-card hand
      state.hand = drawCards(state, 5);

      // Simulate opponent's initial attack (shown so player can strategize)
      const opponentCards = drawCards(state, 5);
      const { attack: oppAttack, defense: oppDefense } = simulateOpponentCombat(opponentCards, state.opponentDifficulty!);
      state.opponentAttackDamage = oppAttack;
      state.opponentDefenseReduction = oppDefense;

      // Put opponent's cards back for next round (they'll draw fresh)
      state.deck.push(...opponentCards);
      shuffleDeck(state.deck);

      state.maxTurns = 20; // Max combat rounds
      state.turnNumber = 1;
      break;
    }
  }

  return state;
}

/**
 * Process a player action
 */
export function processAction(state: GameState, action: PlayerAction): GameState {
  const newState = { ...state };

  switch (state.gameType) {
    case 'pokerHoldDraw':
      return processPokerAction(newState, action);
    case 'pressYourLuck':
      return processPressYourLuckAction(newState, action);
    case 'blackjack':
      return processBlackjackAction(newState, action);
    case 'deckbuilder':
      return processDeckbuilderAction(newState, action);
    case 'combatDuel':
      return processCombatDuelAction(newState, action);
    default:
      return newState;
  }
}

/**
 * Resolve the game and calculate results
 */
export function resolveGame(state: GameState): GameResult {
  const suitMatches = countSuitMatches(state.hand, state.relevantSuit);
  const suitBonus = calculateSuitBonus(suitMatches);

  switch (state.gameType) {
    // Original 5 games
    case 'pokerHoldDraw':
      return resolvePokerGame(state, suitMatches, suitBonus);
    case 'pressYourLuck':
      return resolvePressYourLuckGame(state, suitMatches, suitBonus);
    case 'blackjack':
      return resolveBlackjackGame(state, suitMatches, suitBonus);
    case 'deckbuilder':
      return resolveDeckbuilderGame(state, suitMatches, suitBonus);
    case 'combatDuel':
      return resolveCombatDuelGame(state, suitMatches, suitBonus);

    // New card game expansion
    case 'faro':
      return resolveFaroGame(state, suitMatches, suitBonus);

    // TODO: Add remaining new game types
    case 'threeCardMonte':
    case 'solitaireRace':
    case 'texasHoldem':
    case 'rummy':
    case 'warOfAttrition':
    case 'euchre':
    case 'cribbage':
      // Temporary fallback - implement these resolvers
      return resolveFaroGame(state, suitMatches, suitBonus);

    default:
      return {
        success: false,
        score: 0,
        suitMatches,
        suitBonus
      };
  }
}

export default {
  initGame,
  processAction,
  resolveGame,
  getGameTypeForAction,
  getGameTypeName,
  getAvailableActions
};