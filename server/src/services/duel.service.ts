/**
 * Duel Service
 * Handles PvP deck game challenges and resolution
 */

import mongoose from 'mongoose';
import { Duel, DuelStatus, DuelType, IDuel } from '../models/Duel.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  initGame,
  processAction,
  resolveGame,
  GameState,
  GameResult,
  PlayerAction,
  GameType
} from './deckGames';
import logger from '../utils/logger';

// Store active duel games (in production, use Redis)
interface DuelGameState {
  duelId: string;
  challengerState: GameState;
  challengedState: GameState;
  challengerResolved: boolean;
  challengedResolved: boolean;
  challengerResult?: GameResult;
  challengedResult?: GameResult;
}

const activeDuelGames = new Map<string, DuelGameState>();

// Challenge expiration time (5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Create a new duel challenge
 */
export async function createChallenge(
  challengerId: string,
  challengedId: string,
  type: DuelType = DuelType.CASUAL,
  wagerAmount: number = 0
): Promise<IDuel> {
  // Validate players exist
  const [challenger, challenged] = await Promise.all([
    Character.findById(challengerId),
    Character.findById(challengedId)
  ]);

  if (!challenger) {
    throw new Error('Challenger character not found');
  }
  if (!challenged) {
    throw new Error('Challenged character not found');
  }

  // Can't challenge yourself
  if (challengerId === challengedId) {
    throw new Error('Cannot challenge yourself');
  }

  // Check for existing pending challenges between these players
  const existingChallenge = await Duel.findOne({
    $or: [
      { challengerId, challengedId },
      { challengerId: challengedId, challengedId: challengerId }
    ],
    status: { $in: [DuelStatus.PENDING, DuelStatus.ACCEPTED, DuelStatus.IN_PROGRESS] }
  });

  if (existingChallenge) {
    throw new Error('There is already an active challenge between these players');
  }

  // Validate wager amount
  if (type === DuelType.WAGER) {
    if (wagerAmount <= 0) {
      throw new Error('Wager amount must be positive');
    }
    if (challenger.gold < wagerAmount) {
      throw new Error(`Insufficient gold. You have ${challenger.gold}, need ${wagerAmount}`);
    }
    if (challenged.gold < wagerAmount) {
      throw new Error(`${challenged.name} doesn't have enough gold for this wager`);
    }
  }

  // Create the duel
  const duel = new Duel({
    challengerId,
    challengedId,
    challengerName: challenger.name,
    challengedName: challenged.name,
    status: DuelStatus.PENDING,
    type,
    wagerAmount: type === DuelType.WAGER ? wagerAmount : 0,
    gameType: 'pokerHoldDraw', // PvP uses poker
    expiresAt: new Date(Date.now() + CHALLENGE_EXPIRY_MS)
  });

  void await duel.save();

  logger.info(`Duel challenge created: ${challenger.name} vs ${challenged.name} (${type})`);

  return duel;
}

/**
 * Accept a duel challenge
 */
export async function acceptChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  const duel = await Duel.findById(duelId);

  if (!duel) {
    throw new Error('Duel not found');
  }

  if (duel.challengedId.toString() !== characterId) {
    throw new Error('Only the challenged player can accept');
  }

  if (duel.status !== DuelStatus.PENDING) {
    throw new Error(`Cannot accept duel with status: ${duel.status}`);
  }

  if (duel.expiresAt < new Date()) {
    duel.status = DuelStatus.EXPIRED;
    await duel.save();
    throw new Error('Challenge has expired');
  }

  // Verify wager funds still available
  if (duel.type === DuelType.WAGER) {
    const [challenger, challenged] = await Promise.all([
      Character.findById(duel.challengerId),
      Character.findById(duel.challengedId)
    ]);

    if (!challenger || challenger.gold < duel.wagerAmount) {
      throw new Error('Challenger no longer has sufficient gold');
    }
    if (!challenged || challenged.gold < duel.wagerAmount) {
      throw new Error('You no longer have sufficient gold');
    }
  }

  duel.status = DuelStatus.ACCEPTED;
  await duel.save();

  logger.info(`Duel accepted: ${duel.challengerName} vs ${duel.challengedName}`);

  return duel;
}

/**
 * Decline a duel challenge
 */
export async function declineChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  const duel = await Duel.findById(duelId);

  if (!duel) {
    throw new Error('Duel not found');
  }

  if (duel.challengedId.toString() !== characterId) {
    throw new Error('Only the challenged player can decline');
  }

  if (duel.status !== DuelStatus.PENDING) {
    throw new Error(`Cannot decline duel with status: ${duel.status}`);
  }

  duel.status = DuelStatus.DECLINED;
  await duel.save();

  return duel;
}

/**
 * Cancel a duel challenge (by challenger)
 */
export async function cancelChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  const duel = await Duel.findById(duelId);

  if (!duel) {
    throw new Error('Duel not found');
  }

  if (duel.challengerId.toString() !== characterId) {
    throw new Error('Only the challenger can cancel');
  }

  if (duel.status !== DuelStatus.PENDING) {
    throw new Error(`Cannot cancel duel with status: ${duel.status}`);
  }

  duel.status = DuelStatus.CANCELLED;
  await duel.save();

  return duel;
}

/**
 * Start the duel game (both players ready)
 */
export async function startDuelGame(duelId: string): Promise<DuelGameState> {
  const duel = await Duel.findById(duelId);

  if (!duel) {
    throw new Error('Duel not found');
  }

  if (duel.status !== DuelStatus.ACCEPTED) {
    throw new Error('Duel must be accepted before starting');
  }

  // Initialize game states for both players
  const gameConfig = {
    gameType: 'pokerHoldDraw' as GameType,
    difficulty: 3, // Medium difficulty for PvP
    relevantSuit: undefined, // No suit bonus in PvP
    timeLimit: 60
  };

  const challengerState = initGame({
    ...gameConfig,
    playerId: duel.challengerId.toString()
  });

  const challengedState = initGame({
    ...gameConfig,
    playerId: duel.challengedId.toString()
  });

  // Store game states
  const duelGameState: DuelGameState = {
    duelId,
    challengerState,
    challengedState,
    challengerResolved: false,
    challengedResolved: false
  };

  activeDuelGames.set(duelId, duelGameState);

  // Update duel status
  duel.status = DuelStatus.IN_PROGRESS;
  duel.gameId = duelId; // Use duel ID as game ID
  await duel.save();

  logger.info(`Duel game started: ${duel.challengerName} vs ${duel.challengedName}`);

  return duelGameState;
}

/**
 * Get player's game state in a duel
 */
export function getDuelGameState(
  duelId: string,
  characterId: string
): GameState | null {
  const duelGame = activeDuelGames.get(duelId);
  if (!duelGame) return null;

  if (duelGame.challengerState.playerId === characterId) {
    return duelGame.challengerState;
  } else if (duelGame.challengedState.playerId === characterId) {
    return duelGame.challengedState;
  }

  return null;
}


async function resolveDuel(duelId: string): Promise<{
  winnerId: string;
  winnerName: string;
  challengerScore: number;
  challengedScore: number;
  challengerHand: string;
  challengedHand: string;
  goldTransferred?: number;
}> {
  const duelGame = activeDuelGames.get(duelId);
  if (!duelGame || !duelGame.challengerResult || !duelGame.challengedResult) {
    throw new Error('Duel game not properly resolved');
  }

  const duel = await Duel.findById(duelId);
  if (!duel) {
    throw new Error('Duel not found');
  }

  const challengerScore = duelGame.challengerResult.score;
  const challengedScore = duelGame.challengedResult.score;

  // Determine winner (higher score wins)
  let winnerId: string;
  let winnerName: string;
  let loserId: string;

  if (challengerScore > challengedScore) {
    winnerId = duel.challengerId.toString();
    winnerName = duel.challengerName;
    loserId = duel.challengedId.toString();
  } else if (challengedScore > challengerScore) {
    winnerId = duel.challengedId.toString();
    winnerName = duel.challengedName;
    loserId = duel.challengerId.toString();
  } else {
    // Tie - challenger wins (they took the initiative)
    winnerId = duel.challengerId.toString();
    winnerName = duel.challengerName;
    loserId = duel.challengedId.toString();
  }

  // Update duel record
  duel.status = DuelStatus.COMPLETED;
  duel.winnerId = new mongoose.Types.ObjectId(winnerId);
  duel.winnerName = winnerName;
  duel.challengerScore = challengerScore;
  duel.challengedScore = challengedScore;
  duel.challengerHandName = duelGame.challengerResult.handName || 'Unknown';
  duel.challengedHandName = duelGame.challengedResult.handName || 'Unknown';
  duel.completedAt = new Date();

  // Handle wager transfer
  let goldTransferred = 0;
  if (duel.type === DuelType.WAGER && duel.wagerAmount > 0) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { GoldService } = await import('./gold.service');
      // Deduct from loser
      await GoldService.deductGold(
        loserId as any,
        duel.wagerAmount,
        TransactionSource.DUEL_LOSS,
        {
          duelId: duel._id,
          opponentId: winnerId,
          description: `Lost duel wager to ${winnerName}`
        },
        session
      );

      // Add to winner
      await GoldService.addGold(
        winnerId as any,
        duel.wagerAmount,
        TransactionSource.DUEL_WIN,
        {
          duelId: duel._id,
          opponentId: loserId,
          description: `Won duel wager against ${loserId === duel.challengerId.toString() ? duel.challengerName : duel.challengedName}`
        },
        session
      );

      await session.commitTransaction();
      goldTransferred = duel.wagerAmount;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to transfer duel wager:', error);
    } finally {
      session.endSession();
    }
  }

  await duel.save();

  // Clean up game state
  activeDuelGames.delete(duelId);

  logger.info(
    `Duel completed: ${duel.challengerName} (${challengerScore}) vs ${duel.challengedName} (${challengedScore}) - Winner: ${winnerName}`
  );

  return {
    winnerId,
    winnerName,
    challengerScore,
    challengedScore,
    challengerHand: duelGame.challengerResult.handName || 'Unknown',
    challengedHand: duelGame.challengedResult.handName || 'Unknown',
    goldTransferred
  };
}

/**
 * Process a player's action in the duel
 */
export async function processDuelAction(
  duelId: string,
  characterId: string,
  action: PlayerAction
): Promise<{
  gameState: GameState;
  isResolved: boolean;
  duelComplete: boolean;
  result?: any;
}> {
  const duelGame = activeDuelGames.get(duelId);
  if (!duelGame) {
    throw new Error('Duel game not found');
  }

  const isChallenger = duelGame.challengerState.playerId === characterId;
  const isChallenged = duelGame.challengedState.playerId === characterId;

  if (!isChallenger && !isChallenged) {
    throw new Error('Not a participant in this duel');
  }

  // Check if player already resolved
  if (isChallenger && duelGame.challengerResolved) {
    throw new Error('You have already completed your turn');
  }
  if (isChallenged && duelGame.challengedResolved) {
    throw new Error('You have already completed your turn');
  }

  // Process the action
  let gameState: GameState;
  if (isChallenger) {
    gameState = processAction(duelGame.challengerState, action);
    duelGame.challengerState = gameState;
  } else {
    gameState = processAction(duelGame.challengedState, action);
    duelGame.challengedState = gameState;
  }

  // Check if this player's game is resolved
  const isResolved = gameState.status === 'resolved';
  if (isResolved) {
    const result = resolveGame(gameState);
    if (isChallenger) {
      duelGame.challengerResolved = true;
      duelGame.challengerResult = result;
    } else {
      duelGame.challengedResolved = true;
      duelGame.challengedResult = result;
    }
  }

  // Check if both players have resolved
  const duelComplete = duelGame.challengerResolved && duelGame.challengedResolved;

  if (duelComplete) {
    // Determine winner and apply results
    const finalResult = await resolveDuel(duelId);
    return {
      gameState,
      isResolved,
      duelComplete: true,
      result: finalResult
    };
  }

  return {
    gameState,
    isResolved,
    duelComplete: false
  };
}


/**
 * Get pending challenges for a character
 */
export async function getPendingChallenges(characterId: string): Promise<IDuel[]> {
  return Duel.find({
    challengedId: characterId,
    status: DuelStatus.PENDING,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
}

/**
 * Get active duels for a character
 */
export async function getActiveDuels(characterId: string): Promise<IDuel[]> {
  return Duel.find({
    $or: [
      { challengerId: characterId },
      { challengedId: characterId }
    ],
    status: { $in: [DuelStatus.PENDING, DuelStatus.ACCEPTED, DuelStatus.IN_PROGRESS] }
  }).sort({ createdAt: -1 });
}

/**
 * Get duel history for a character
 */
export async function getDuelHistory(
  characterId: string,
  limit: number = 20
): Promise<IDuel[]> {
  return Duel.find({
    $or: [
      { challengerId: characterId },
      { challengedId: characterId }
    ],
    status: DuelStatus.COMPLETED
  })
    .sort({ completedAt: -1 })
    .limit(limit);
}

/**
 * Get duel statistics for a character
 */
export async function getDuelStats(characterId: string): Promise<{
  totalDuels: number;
  wins: number;
  losses: number;
  winRate: number;
  goldWon: number;
  goldLost: number;
}> {
  const completedDuels = await Duel.find({
    $or: [
      { challengerId: characterId },
      { challengedId: characterId }
    ],
    status: DuelStatus.COMPLETED
  });

  let wins = 0;
  let losses = 0;
  let goldWon = 0;
  let goldLost = 0;

  for (const duel of completedDuels) {
    const isWinner = duel.winnerId?.toString() === characterId;

    if (isWinner) {
      wins++;
      if (duel.type === DuelType.WAGER) {
        goldWon += duel.wagerAmount;
      }
    } else {
      losses++;
      if (duel.type === DuelType.WAGER) {
        goldLost += duel.wagerAmount;
      }
    }
  }

  return {
    totalDuels: completedDuels.length,
    wins,
    losses,
    winRate: completedDuels.length > 0 ? (wins / completedDuels.length) * 100 : 0,
    goldWon,
    goldLost
  };
}

/**
 * Clean up expired challenges
 */
export async function cleanupExpiredChallenges(): Promise<number> {
  const result = await Duel.updateMany(
    {
      status: DuelStatus.PENDING,
      expiresAt: { $lt: new Date() }
    },
    {
      status: DuelStatus.EXPIRED
    }
  );

  if (result.modifiedCount > 0) {
    logger.info(`Cleaned up ${result.modifiedCount} expired duel challenges`);
  }

  return result.modifiedCount;
}

export const DuelService = {
  createChallenge,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  startDuelGame,
  getDuelGameState,
  processDuelAction,
  getPendingChallenges,
  getActiveDuels,
  getDuelHistory,
  getDuelStats,
  cleanupExpiredChallenges
};
