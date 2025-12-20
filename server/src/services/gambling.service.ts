/**
 * Gambling Service
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Core gambling mechanics for all gambling games
 *
 * BALANCE FIX (Phase 4.3):
 * - Increased house edge from 2% to 5%
 * - Added daily game limit (10 games per day)
 * - Added daily gold wager limit (50,000 gold per day)
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { GamblingSession, IGamblingSession } from '../models/GamblingSession.model';
import { GamblingHistory, IGamblingHistory } from '../models/GamblingHistory.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  GamblingGameType,
  GamblingSessionStatus,
  BlackjackAction,
  CrapsBetType,
  RouletteBetType,
  GAMBLING_CONSTANTS
} from '@desperados/shared';
import { GAMBLING_GAMES, getGamblingGameById } from '../data/gamblingGames';
import logger from '../utils/logger';
import { withLock } from '../utils/distributedLock';
import { SecureRNG } from './base/SecureRNG';
import karmaService from './karma.service';
import karmaEffectsService from './karmaEffects.service';

// ============================================================================
// DAILY LIMIT TRACKING
// ============================================================================

/**
 * Get today's gambling statistics for a character
 * BALANCE FIX (Phase 4.3): Used to enforce daily limits
 */
export async function getTodayGamblingStats(characterId: string): Promise<{
  gamesPlayed: number;
  totalWagered: number;
  remainingGames: number;
  remainingWager: number;
}> {
  // Get start of today (midnight UTC)
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  // Query sessions started today
  const todaySessions = await GamblingSession.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    startTime: { $gte: startOfToday }
  }).select('totalWagered status');

  // Calculate totals
  const gamesPlayed = todaySessions.length;
  const totalWagered = todaySessions.reduce((sum, s) => sum + (s.totalWagered || 0), 0);

  // Calculate remaining
  const remainingGames = Math.max(0, GAMBLING_CONSTANTS.MAX_BETS_PER_DAY - gamesPlayed);
  const remainingWager = Math.max(0, GAMBLING_CONSTANTS.MAX_DAILY_GOLD_WAGER - totalWagered);

  return {
    gamesPlayed,
    totalWagered,
    remainingGames,
    remainingWager
  };
}

/**
 * Check if character has exceeded daily gambling limits
 * BALANCE FIX (Phase 4.3): Enforce daily limits
 */
async function checkDailyLimits(
  characterId: string,
  proposedBet: number
): Promise<{ allowed: boolean; reason?: string }> {
  const stats = await getTodayGamblingStats(characterId);

  // Check game count limit
  if (stats.remainingGames <= 0) {
    return {
      allowed: false,
      reason: `You've reached the daily limit of ${GAMBLING_CONSTANTS.MAX_BETS_PER_DAY} gambling games. Come back tomorrow!`
    };
  }

  // Check gold wager limit
  if (proposedBet > stats.remainingWager) {
    if (stats.remainingWager <= 0) {
      return {
        allowed: false,
        reason: `You've wagered the daily maximum of ${GAMBLING_CONSTANTS.MAX_DAILY_GOLD_WAGER.toLocaleString()} gold. Come back tomorrow!`
      };
    }
    return {
      allowed: false,
      reason: `You can only wager ${stats.remainingWager.toLocaleString()} more gold today. ` +
              `Daily limit: ${GAMBLING_CONSTANTS.MAX_DAILY_GOLD_WAGER.toLocaleString()} gold.`
    };
  }

  return { allowed: true };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Start a gambling session
 */
export async function startGamblingSession(
  characterId: string,
  gameId: string,
  location: string,
  initialBet: number,
  eventId?: string
): Promise<IGamblingSession> {
  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Check if character is jailed
  if (character.isCurrentlyJailed()) {
    throw new Error('Cannot gamble while in jail');
  }

  // Check for existing active session
  const existingSession = await GamblingSession.findActiveSessionByCharacter(characterId);
  if (existingSession) {
    throw new Error('You already have an active gambling session');
  }

  // Get game definition
  const game = getGamblingGameById(gameId);
  if (!game) {
    throw new Error('Invalid game ID');
  }

  // Validate location
  if (!game.availableLocations.includes(location)) {
    throw new Error('This game is not available at this location');
  }

  // Check gambling history for bans
  let history = await GamblingHistory.findByCharacter(characterId);
  if (!history) {
    history = await GamblingHistory.createNewHistory(characterId);
  }

  if (history.isBannedFrom(location)) {
    throw new Error(`You are banned from gambling at ${location}`);
  }

  // Validate bet amount
  if (initialBet < game.minimumBet) {
    throw new Error(`Minimum bet is ${game.minimumBet} gold`);
  }
  if (initialBet > game.maximumBet) {
    throw new Error(`Maximum bet is ${game.maximumBet} gold`);
  }

  // BALANCE FIX (Phase 4.3): Check daily gambling limits
  const limitCheck = await checkDailyLimits(characterId, initialBet);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason!);
  }

  // Check character has enough dollars
  if (!character.hasDollars(initialBet)) {
    throw new Error('Insufficient dollars for initial bet');
  }

  // Create session
  const session = new GamblingSession({
    characterId: character._id,
    gameId,
    gameType: game.gameType,
    eventId,
    location,
    startingGold: character.dollars,
    currentGold: character.dollars,
    dealerNPC: game.dealerNPC,
    dealerSkillLevel: SecureRNG.range(5, 10), // SECURITY FIX: Use SecureRNG
    gameState: initializeGameState(game.gameType, initialBet)
  });

  await session.save();

  logger.info(`Gambling session started: ${character.name} - ${game.name} at ${location}`);

  return session;
}

/**
 * Make a bet in an active session
 */
export async function makeBet(
  sessionId: string,
  characterId: string,
  betAmount: number,
  betType?: string,
  betDetails?: any
): Promise<{
  result: 'WIN' | 'LOSS' | 'PUSH' | 'IN_PROGRESS';
  amountWon: number;
  amountLost: number;
  newBalance: number;
  gameState: any;
  message: string;
}> {
  // PHASE 3 FIX: Add distributed lock to prevent race conditions on concurrent bets
  const lockKey = `lock:gambling:${sessionId}`;

  return withLock(lockKey, async () => {
    const session = await GamblingSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.characterId.toString() !== characterId) {
    throw new Error('Not your session');
  }

  if (session.status !== GamblingSessionStatus.ACTIVE) {
    throw new Error('Session is not active');
  }

  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  const game = getGamblingGameById(session.gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  // Validate bet
  if (betAmount < game.minimumBet || betAmount > game.maximumBet) {
    throw new Error(`Bet must be between ${game.minimumBet} and ${game.maximumBet} dollars`);
  }

  if (!character.hasDollars(betAmount)) {
    throw new Error('Insufficient dollars for bet');
  }

  // Process bet based on game type
  let result: 'WIN' | 'LOSS' | 'PUSH';
  let payout = 0;
  let newGameState: any;

  switch (game.gameType) {
    case GamblingGameType.BLACKJACK:
      ({ result, payout, newGameState } = await playBlackjackHand(
        session.gameState,
        betAmount,
        game.houseEdge,
        betType as BlackjackAction
      ));
      break;

    case GamblingGameType.ROULETTE:
      ({ result, payout, newGameState } = await playRouletteSpin(
        betAmount,
        betType as RouletteBetType,
        betDetails,
        game.houseEdge
      ));
      break;

    case GamblingGameType.CRAPS:
      ({ result, payout, newGameState } = await playCrapsRoll(
        session.gameState,
        betAmount,
        betType as CrapsBetType
      ));
      break;

    case GamblingGameType.FARO:
      ({ result, payout, newGameState } = await playFaroRound(
        session.gameState,
        betAmount,
        betDetails
      ));
      break;

    case GamblingGameType.THREE_CARD_MONTE:
      ({ result, payout, newGameState } = await playMonteRound(
        betAmount,
        betDetails,
        game.houseEdge
      ));
      break;

    case GamblingGameType.WHEEL_OF_FORTUNE:
      ({ result, payout, newGameState } = await playWheelSpin(
        betAmount,
        betDetails
      ));
      break;

    default:
      throw new Error('Game type not yet implemented');
  }

  // Update session
  const netChange = payout - betAmount;
  (session as any).updateFinancials(netChange, betAmount);
  (session as any).recordHandResult(result.toLowerCase() as 'win' | 'loss' | 'push');
  session.gameState = newGameState;
  session.currentGold = character.dollars + netChange;

  await session.save();

  // Update character dollars
  if (netChange > 0) {
    await character.deductDollars(betAmount, TransactionSource.GAMBLING_LOSS);
    await character.addDollars(payout, TransactionSource.GAMBLING_WIN);
  } else if (netChange < 0) {
    await character.deductDollars(betAmount, TransactionSource.GAMBLING_LOSS);
  }

  await character.save();

  // DEITY SYSTEM: Record karma for gambling wins
  // Fair wins please The Gambler deity
  if (result === 'WIN') {
    try {
      await karmaService.recordAction(
        characterId,
        'GAMBLING_FAIR_WIN',
        `Won ${payout} dollars at ${session.gameType}`
      );
      logger.debug(`Karma recorded for gambling win: GAMBLING_FAIR_WIN`);
    } catch (karmaError) {
      logger.warn('Failed to record karma for gambling win:', karmaError);
    }
  }

  // Generate message
  let message = '';
  if (result === 'WIN') {
    message = `You won ${payout} dollars! Net profit: ${netChange} dollars`;
  } else if (result === 'LOSS') {
    message = `You lost ${betAmount} dollars.`;
  } else {
    message = `Push - your bet of ${betAmount} dollars is returned.`;
  }

    return {
      result,
      amountWon: result === 'WIN' ? payout : 0,
      amountLost: result === 'LOSS' ? betAmount : 0,
      newBalance: character.dollars + netChange,
      gameState: newGameState,
      message
    };
  }, { ttl: 30, retries: 10 });
}

/**
 * End a gambling session
 */
export async function endGamblingSession(
  sessionId: string,
  characterId: string
): Promise<IGamblingSession> {
  const session = await GamblingSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.characterId.toString() !== characterId) {
    throw new Error('Not your session');
  }

  session.completeSession();
  await session.save();

  // Update gambling history
  const history = await GamblingHistory.findByCharacter(characterId);
  if (history) {
    history.recordSession({
      gameType: session.gameType,
      netProfit: session.netProfit,
      totalWagered: session.totalWagered
    });
    await history.save();
  }

  logger.info(`Gambling session ended: ${sessionId} - Profit: ${session.netProfit}`);

  return session;
}

// ============================================================================
// GAME MECHANICS
// ============================================================================

/**
 * Initialize game state based on game type
 */
function initializeGameState(gameType: GamblingGameType, initialBet: number): any {
  switch (gameType) {
    case GamblingGameType.BLACKJACK:
      return {
        playerHand: [],
        dealerHand: [],
        playerTotal: 0,
        dealerTotal: 0,
        bet: initialBet
      };

    case GamblingGameType.CRAPS:
      return {
        point: null,
        comeOutRoll: true,
        bets: {}
      };

    case GamblingGameType.FARO:
      return {
        currentCard: null,
        bets: {},
        dealerWins: [],
        playerWins: []
      };

    default:
      return {};
  }
}

/**
 * Play a blackjack hand
 */
async function playBlackjackHand(
  gameState: any,
  betAmount: number,
  houseEdge: number,
  action?: BlackjackAction
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // Deal initial cards
  const playerCard1 = drawCard();
  const playerCard2 = drawCard();
  const dealerCard1 = drawCard();
  const dealerCard2 = drawCard();

  let playerTotal = getBlackjackValue([playerCard1, playerCard2]);
  let dealerTotal = getBlackjackValue([dealerCard1, dealerCard2]);

  // Check for player blackjack
  if (playerTotal === 21) {
    // Dealer checks for blackjack
    if (dealerTotal === 21) {
      return { result: 'PUSH', payout: betAmount, newGameState: {} };
    }
    // Player wins 3:2
    return { result: 'WIN', payout: Math.floor(betAmount * 2.5), newGameState: {} };
  }

  // Simulate house edge
  // SECURITY FIX: Use SecureRNG for cryptographically secure outcomes
  const winChance = 50 - houseEdge;
  const random = SecureRNG.d100();

  let result: 'WIN' | 'LOSS' | 'PUSH';
  let payout = 0;

  if (random <= winChance) {
    result = 'WIN';
    payout = betAmount * 2;
  } else if (random < winChance + 5) {
    result = 'PUSH';
    payout = betAmount;
  } else {
    result = 'LOSS';
    payout = 0;
  }

  return { result, payout, newGameState: {} };
}

/**
 * Play a roulette spin
 */
async function playRouletteSpin(
  betAmount: number,
  betType: RouletteBetType,
  betDetails: any,
  houseEdge: number
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // Spin the wheel (0-36 for European, 0-37 for American with 00)
  // SECURITY FIX: Use SecureRNG for cryptographically secure outcomes
  const spinResult = SecureRNG.range(0, 36);

  let won = false;
  let payoutMultiplier = 0;

  switch (betType) {
    case RouletteBetType.STRAIGHT_UP:
      won = spinResult === betDetails.number;
      payoutMultiplier = 35;
      break;

    case RouletteBetType.RED_BLACK:
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      won = betDetails.color === 'RED' ? redNumbers.includes(spinResult) : !redNumbers.includes(spinResult) && spinResult !== 0;
      payoutMultiplier = 1;
      break;

    case RouletteBetType.EVEN_ODD:
      won = betDetails.choice === 'EVEN' ? spinResult % 2 === 0 && spinResult !== 0 : spinResult % 2 === 1;
      payoutMultiplier = 1;
      break;

    case RouletteBetType.HIGH_LOW:
      won = betDetails.choice === 'HIGH' ? spinResult >= 19 && spinResult <= 36 : spinResult >= 1 && spinResult <= 18;
      payoutMultiplier = 1;
      break;

    case RouletteBetType.DOZEN:
      const dozen = betDetails.dozen;
      won = dozen === 1 ? (spinResult >= 1 && spinResult <= 12) :
            dozen === 2 ? (spinResult >= 13 && spinResult <= 24) :
            (spinResult >= 25 && spinResult <= 36);
      payoutMultiplier = 2;
      break;

    default:
      won = false;
      payoutMultiplier = 0;
  }

  const result = won ? 'WIN' : 'LOSS';
  const payout = won ? betAmount * (payoutMultiplier + 1) : 0;

  return {
    result,
    payout,
    newGameState: { lastSpin: spinResult }
  };
}

/**
 * Play a craps roll
 */
async function playCrapsRoll(
  gameState: any,
  betAmount: number,
  betType: CrapsBetType
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // SECURITY FIX: Use SecureRNG for cryptographically secure dice rolls
  const die1 = SecureRNG.roll(6);
  const die2 = SecureRNG.roll(6);
  const total = die1 + die2;

  let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';
  let payout = 0;

  if (betType === CrapsBetType.PASS_LINE) {
    if (gameState.comeOutRoll) {
      if (total === 7 || total === 11) {
        result = 'WIN';
        payout = betAmount * 2;
      } else if (total === 2 || total === 3 || total === 12) {
        result = 'LOSS';
      } else {
        gameState.point = total;
        gameState.comeOutRoll = false;
        result = 'PUSH';
        payout = betAmount;
      }
    } else {
      if (total === gameState.point) {
        result = 'WIN';
        payout = betAmount * 2;
        gameState.comeOutRoll = true;
        gameState.point = null;
      } else if (total === 7) {
        result = 'LOSS';
        gameState.comeOutRoll = true;
        gameState.point = null;
      } else {
        result = 'PUSH';
        payout = betAmount;
      }
    }
  }

  return {
    result,
    payout,
    newGameState: gameState
  };
}

/**
 * Play a faro round
 */
async function playFaroRound(
  gameState: any,
  betAmount: number,
  betDetails: any
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // SECURITY FIX: Use SecureRNG for cryptographically secure card draws
  const losingCard = SecureRNG.range(1, 13);
  const winningCard = SecureRNG.range(1, 13);
  const playerBetCard = betDetails.card;

  let result: 'WIN' | 'LOSS' | 'PUSH';
  let payout = 0;

  if (losingCard === winningCard) {
    // Soda - house wins half
    result = 'LOSS';
    payout = Math.floor(betAmount / 2);
  } else if (winningCard === playerBetCard) {
    result = 'WIN';
    payout = betAmount * 2;
  } else if (losingCard === playerBetCard) {
    result = 'LOSS';
    payout = 0;
  } else {
    result = 'PUSH';
    payout = betAmount;
  }

  return { result, payout, newGameState: {} };
}

/**
 * Play three-card monte
 */
async function playMonteRound(
  betAmount: number,
  betDetails: any,
  houseEdge: number
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // SECURITY FIX: Use SecureRNG for cryptographically secure outcomes
  const queenPosition = SecureRNG.range(0, 2);
  const playerGuess = betDetails.guess;

  // Monte is heavily rigged
  const actualWinChance = 33.33 - houseEdge;
  const random = SecureRNG.d100();

  let result: 'WIN' | 'LOSS';
  let payout = 0;

  if (random < actualWinChance && playerGuess === queenPosition) {
    result = 'WIN';
    payout = betAmount * 3; // 2:1 payout
  } else {
    result = 'LOSS';
    payout = 0;
  }

  return { result, payout, newGameState: { queenPosition } };
}

/**
 * Play wheel of fortune
 */
async function playWheelSpin(
  betAmount: number,
  betDetails: any
): Promise<{ result: 'WIN' | 'LOSS' | 'PUSH'; payout: number; newGameState: any }> {
  // Wheel segments and payouts
  const segments = [
    { symbol: 'STAR', count: 1, payout: 40 },
    { symbol: 'LOGO', count: 2, payout: 20 },
    { symbol: 'GOLD_BAR', count: 4, payout: 10 },
    { symbol: 'HORSESHOE', count: 7, payout: 5 },
    { symbol: 'BADGE', count: 10, payout: 3 },
    { symbol: 'HAT', count: 15, payout: 2 },
    { symbol: 'SUIT', count: 15, payout: 1 }
  ];

  // Generate wheel
  const wheel: string[] = [];
  segments.forEach(seg => {
    for (let i = 0; i < seg.count; i++) {
      wheel.push(seg.symbol);
    }
  });

  // SECURITY FIX: Use SecureRNG for cryptographically secure wheel spin
  const spinResult = SecureRNG.select(wheel);
  const playerBet = betDetails.symbol;

  let result: 'WIN' | 'LOSS';
  let payout = 0;

  if (spinResult === playerBet) {
    result = 'WIN';
    const segment = segments.find(s => s.symbol === playerBet)!;
    payout = betAmount * (segment.payout + 1);
  } else {
    result = 'LOSS';
    payout = 0;
  }

  return { result, payout, newGameState: { lastSpin: spinResult } };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Draw a random card (1-13)
 * SECURITY FIX: Use SecureRNG for cryptographically secure card draws
 */
function drawCard(): number {
  return SecureRNG.range(1, 13);
}

/**
 * Calculate blackjack hand value
 */
function getBlackjackValue(cards: number[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card === 1) {
      aces += 1;
      total += 11;
    } else if (card >= 11) {
      total += 10;
    } else {
      total += card;
    }
  }

  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

/**
 * Get gambling statistics for a character
 */
export async function getGamblingStats(characterId: string): Promise<any> {
  const history = await GamblingHistory.findByCharacter(characterId);
  const currentSession = await GamblingSession.findActiveSessionByCharacter(characterId);

  return {
    history: history || null,
    currentSession: currentSession || null,
    hasActiveSession: !!currentSession
  };
}

/**
 * Get leaderboard
 */
export async function getGamblingLeaderboard(
  metric: 'PROFIT' | 'WINS' | 'SESSIONS' | 'BIGGEST_WIN',
  limit: number = 10
): Promise<any[]> {
  const metricMap = {
    PROFIT: 'netLifetimeProfit',
    WINS: 'longestWinStreak',
    SESSIONS: 'totalSessions',
    BIGGEST_WIN: 'biggestSingleWin'
  };

  return GamblingHistory.getLeaderboard(metricMap[metric], limit);
}

export const GamblingService = {
  startGamblingSession,
  makeBet,
  endGamblingSession,
  getGamblingStats,
  getGamblingLeaderboard
};
