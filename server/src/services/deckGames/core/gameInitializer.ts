/**
 * Game Initializer
 * Initialize new deck games
 */

import crypto from 'crypto';
import { GameState, GameType, InitGameOptions } from '../types';
import { MAX_TURNS, BLACKJACK_TARGETS } from '../constants';
import { createDeck, drawCards, shuffleDeck } from '../deck';
import { calculateSpecialAbilities, calculateSkillModifiers } from '../skills';
import { getWagerConfig } from '../wagering';
import { calculateStreakBonus, calculateUnderdogBonus } from '../momentum';
import { simulateOpponentCombat } from '../combat';
import { generateCardCountHint } from '../actions/blackjack';

/**
 * Get max turns for a game type
 */
function getMaxTurns(gameType: GameType): number {
  return MAX_TURNS[gameType] || MAX_TURNS.default;
}

/**
 * Initialize a new game
 *
 * PHASE 3: Now initializes all strategic options and special abilities
 * PHASE 5: Added wagering and streak tracking options
 */
export function initGame(options: InitGameOptions): GameState {
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
    maxRounds: getMaxTurns(options.gameType),
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
    canBailOut: false,
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

      // Calculate skill-adjusted target for client display
      const baseTarget = BLACKJACK_TARGETS[state.difficulty] || 18;
      const modifiers = calculateSkillModifiers(skillLevel, state.difficulty);
      state.adjustedTarget = Math.max(12, baseTarget - Math.floor(modifiers.thresholdReduction * 0.3));
      break;
    }

    case 'pokerHoldDraw': {
      // Draw initial 5-card hand
      state.hand = drawCards(state, 5);
      state.turnNumber = 1;
      break;
    }

    case 'pressYourLuck': {
      // Calculate initial danger meter (done via action processing)
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

      state.maxTurns = 20;
      state.turnNumber = 1;
      break;
    }
  }

  return state;
}
