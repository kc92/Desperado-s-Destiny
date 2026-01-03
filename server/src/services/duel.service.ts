/**
 * Duel Service
 * Handles PvP deck game challenges and resolution
 */

import mongoose from 'mongoose';
import { Duel, DuelStatus, DuelType, IDuel } from '../models/Duel.model';
import { Character } from '../models/Character.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DuelSession } from '../models/DuelSession.model';
import {
  initGame,
  processAction,
  resolveGame,
  GameState,
  GameResult,
  PlayerAction,
  GameType
} from './deckGames';
import { SkillCategory } from '@desperados/shared';
import { UnlockEnforcementService } from './unlockEnforcement.service';
import { withLock, duelChallengeLockKey } from '../utils/distributedLock';
import logger from '../utils/logger';
import { logCombatEvent, logEconomyEvent, CombatEvent, EconomyEvent } from './base';
import karmaService from './karma.service';
import { SkillService } from './skill.service';
import { CharacterProgressionService } from './characterProgression.service';

// DuelGameState interface for type safety
interface DuelGameState {
  duelId: string;
  challengerState: GameState;
  challengedState: GameState;
  challengerResolved: boolean;
  challengedResolved: boolean;
  challengerResult?: GameResult;
  challengedResult?: GameResult;
}

// Challenge expiration time (5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Create a new duel challenge
 * C5 SECURITY FIX: Uses distributed lock to prevent race condition double-spend
 */
export async function createChallenge(
  challengerId: string,
  challengedId: string,
  type: DuelType = DuelType.CASUAL,
  wagerAmount: number = 0
): Promise<IDuel> {
  // C5 SECURITY FIX: Acquire distributed lock on challenger's gold to prevent race conditions
  // This prevents creating multiple wager challenges simultaneously that exceed available gold
  const lockKey = duelChallengeLockKey(challengerId);

  return withLock(lockKey, async () => {
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

    // Check COMBAT level 25 requirement for PvP dueling - both players must have it
    const challengerCheck = UnlockEnforcementService.checkUnlockForCharacter(
      challenger,
      SkillCategory.COMBAT,
      'PvP Dueling'
    );
    if (!challengerCheck.allowed) {
      throw new Error(`You need COMBAT level 25 to challenge other players (current: ${challengerCheck.currentLevel || 0})`);
    }

    const challengedCheck = UnlockEnforcementService.checkUnlockForCharacter(
      challenged,
      SkillCategory.COMBAT,
      'PvP Dueling'
    );
    if (!challengedCheck.allowed) {
      throw new Error(`${challenged.name} has not unlocked PvP dueling yet (requires COMBAT level 25)`);
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

    // Validate wager amount and LOCK gold atomically for challenger
    if (type === DuelType.WAGER) {
      if (wagerAmount <= 0) {
        throw new Error('Wager amount must be positive');
      }
      if (!Number.isFinite(wagerAmount) || !Number.isInteger(wagerAmount)) {
        throw new Error('Wager amount must be a valid integer');
      }
      const challengerBalance = challenger.dollars ?? challenger.gold ?? 0;
      const challengedBalance = challenged.dollars ?? challenged.gold ?? 0;
      if (challengerBalance < wagerAmount) {
        throw new Error(`Insufficient dollars. You have ${challengerBalance}, need ${wagerAmount}`);
      }
      if (challengedBalance < wagerAmount) {
        throw new Error(`${challenged.name} doesn't have enough dollars for this wager`);
      }

      // ATOMIC OPERATION: Lock challenger's dollars to prevent spending after challenge creation
      const lockResult = await Character.findOneAndUpdate(
        {
          _id: challengerId,
          $or: [
            { dollars: { $gte: wagerAmount } },
            { dollars: { $exists: false }, gold: { $gte: wagerAmount } }
          ]
        },
        {
          $inc: {
            dollars: -wagerAmount,
            gold: -wagerAmount,
            lockedGold: wagerAmount
          }
        },
        { new: true }
      );

      if (!lockResult) {
        throw new Error('Failed to lock wager dollars. Please try again.');
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

    // H8 FIX: If duel save fails after dollars are locked, unlock the dollars
    try {
      await duel.save();
    } catch (error) {
      if (type === DuelType.WAGER) {
        // Unlock challenger's dollars atomically
        await Character.findOneAndUpdate(
          { _id: challengerId },
          {
            $inc: {
              dollars: wagerAmount,
              gold: wagerAmount,
              lockedGold: -wagerAmount
            }
          }
        );
        logger.warn(`Duel creation failed, unlocked ${wagerAmount} dollars for challenger ${challengerId}`);
      }
      throw error;
    }

    logger.info(`Duel challenge created: ${challenger.name} vs ${challenged.name} (${type})`);

    // Audit log the duel challenge creation
    await logCombatEvent({
      event: CombatEvent.DUEL_START,
      characterId: challengerId,
      metadata: {
        duelId: duel._id.toString(),
        challengedId,
        challengedName: challenged.name,
        duelType: type,
        wagerAmount: type === DuelType.WAGER ? wagerAmount : 0,
        expiresAt: duel.expiresAt
      }
    });

    return duel;
  });
}

/**
 * Accept a duel challenge with full transaction safety
 *
 * SESSION FIX: For wager duels, all gold locking and status updates
 * are now wrapped in a single transaction.
 */
export async function acceptChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  // For wager duels, use a transaction; for casual, no transaction needed
  const session = await mongoose.startSession();

  try {
    // First, get the duel to check type (outside transaction is fine for read)
    const duelCheck = await Duel.findById(duelId);

    if (!duelCheck) {
      throw new Error('Duel not found');
    }

    if (duelCheck.challengedId.toString() !== characterId) {
      throw new Error('Only the challenged player can accept');
    }

    if (duelCheck.status !== DuelStatus.PENDING) {
      throw new Error(`Cannot accept duel with status: ${duelCheck.status}`);
    }

    if (duelCheck.expiresAt < new Date()) {
      duelCheck.status = DuelStatus.EXPIRED;
      await duelCheck.save();
      throw new Error('Challenge has expired');
    }

    // For wager duels, use transaction for atomicity
    if (duelCheck.type === DuelType.WAGER) {
      session.startTransaction();

      // Re-fetch duel within transaction for isolation
      const duel = await Duel.findById(duelId).session(session);
      if (!duel || duel.status !== DuelStatus.PENDING) {
        throw new Error('Duel is no longer available');
      }

      // Lock challenged player's dollars atomically - WITH SESSION
      const lockResult = await Character.findOneAndUpdate(
        {
          _id: duel.challengedId,
          $or: [
            { dollars: { $gte: duel.wagerAmount } },
            { dollars: { $exists: false }, gold: { $gte: duel.wagerAmount } }
          ]
        },
        {
          $inc: {
            dollars: -duel.wagerAmount,
            gold: -duel.wagerAmount,
            lockedGold: duel.wagerAmount
          }
        },
        { new: true, session }
      );

      if (!lockResult) {
        throw new Error('Insufficient dollars. You no longer have enough dollars for this wager.');
      }

      // Verify challenger still has their dollars locked - WITH SESSION
      const challenger = await Character.findById(duel.challengerId).session(session);
      if (!challenger || (challenger.lockedGold || 0) < duel.wagerAmount) {
        throw new Error('Challenger no longer has dollars locked for this wager. Challenge may have been cancelled.');
      }

      // Update duel status - WITH SESSION
      duel.status = DuelStatus.ACCEPTED;
      await duel.save({ session });

      // Commit transaction
      await session.commitTransaction();

      logger.info(`Wager duel accepted: ${duel.challengerName} vs ${duel.challengedName}`);
      return duel;
    } else {
      // Casual duel - no transaction needed
      duelCheck.status = DuelStatus.ACCEPTED;
      await duelCheck.save();

      logger.info(`Casual duel accepted: ${duelCheck.challengerName} vs ${duelCheck.challengedName}`);
      return duelCheck;
    }
  } catch (error) {
    // Abort transaction if it was started
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Decline a duel challenge with transaction safety for wager duels
 *
 * SESSION FIX: Gold unlock and status update are atomic for wager duels
 */
export async function declineChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  const session = await mongoose.startSession();

  try {
    const duelCheck = await Duel.findById(duelId);

    if (!duelCheck) {
      throw new Error('Duel not found');
    }

    if (duelCheck.challengedId.toString() !== characterId) {
      throw new Error('Only the challenged player can decline');
    }

    if (duelCheck.status !== DuelStatus.PENDING) {
      throw new Error(`Cannot decline duel with status: ${duelCheck.status}`);
    }

    // For wager duels, use transaction for atomicity
    if (duelCheck.type === DuelType.WAGER && duelCheck.wagerAmount > 0) {
      session.startTransaction();

      // Re-fetch within transaction
      const duel = await Duel.findById(duelId).session(session);
      if (!duel || duel.status !== DuelStatus.PENDING) {
        throw new Error('Duel is no longer available');
      }

      // Return locked dollars to challenger - WITH SESSION
      await Character.findByIdAndUpdate(
        duel.challengerId,
        {
          $inc: {
            dollars: duel.wagerAmount,
            gold: duel.wagerAmount,
            lockedGold: -duel.wagerAmount
          }
        },
        { session }
      );

      // Update duel status - WITH SESSION
      duel.status = DuelStatus.DECLINED;
      await duel.save({ session });

      await session.commitTransaction();

      logger.info(`Returned ${duel.wagerAmount} locked dollars to ${duel.challengerName} after decline`);
      return duel;
    } else {
      // Casual duel - no transaction needed
      duelCheck.status = DuelStatus.DECLINED;
      await duelCheck.save();
      return duelCheck;
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Cancel a duel challenge (by challenger) with transaction safety
 *
 * SESSION FIX: Gold unlock and status update are atomic for wager duels
 */
export async function cancelChallenge(
  duelId: string,
  characterId: string
): Promise<IDuel> {
  const session = await mongoose.startSession();

  try {
    const duelCheck = await Duel.findById(duelId);

    if (!duelCheck) {
      throw new Error('Duel not found');
    }

    if (duelCheck.challengerId.toString() !== characterId) {
      throw new Error('Only the challenger can cancel');
    }

    if (duelCheck.status !== DuelStatus.PENDING) {
      throw new Error(`Cannot cancel duel with status: ${duelCheck.status}`);
    }

    // For wager duels, use transaction for atomicity
    if (duelCheck.type === DuelType.WAGER && duelCheck.wagerAmount > 0) {
      session.startTransaction();

      // Re-fetch within transaction
      const duel = await Duel.findById(duelId).session(session);
      if (!duel || duel.status !== DuelStatus.PENDING) {
        throw new Error('Duel is no longer available');
      }

      // Return locked dollars to challenger - WITH SESSION
      await Character.findByIdAndUpdate(
        duel.challengerId,
        {
          $inc: {
            dollars: duel.wagerAmount,
            gold: duel.wagerAmount,
            lockedGold: -duel.wagerAmount
          }
        },
        { session }
      );

      // Update duel status - WITH SESSION
      duel.status = DuelStatus.CANCELLED;
      await duel.save({ session });

      await session.commitTransaction();

      logger.info(`Returned ${duel.wagerAmount} locked dollars to ${duel.challengerName} after cancel`);
      return duel;
    } else {
      // Casual duel - no transaction needed
      duelCheck.status = DuelStatus.CANCELLED;
      await duelCheck.save();
      return duelCheck;
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Start the duel game (both players ready) with transaction safety
 *
 * SESSION FIX: DuelSession creation and Duel status update are atomic
 */
export async function startDuelGame(duelId: string): Promise<DuelGameState> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch duel WITH SESSION for isolation
    const duel = await Duel.findById(duelId).session(session);

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

    // Store game states in database
    const duelGameState: DuelGameState = {
      duelId,
      challengerState,
      challengedState,
      challengerResolved: false,
      challengedResolved: false
    };

    // Store in DuelSession model with upsert - WITH SESSION
    await DuelSession.findOneAndUpdate(
      { duelId },
      {
        duelId,
        challengerId: duel.challengerId,
        challengedId: duel.challengedId,
        status: DuelStatus.IN_PROGRESS,
        challengerState: {
          ...challengerState,
          resolved: false,
          result: undefined
        },
        challengedState: {
          ...challengedState,
          resolved: false,
          result: undefined
        },
        currentRound: 1,
        roundState: {},
        roundResults: [],
        challengerAbilityState: {},
        challengedAbilityState: {},
        challengerBettingHistory: [],
        challengedBettingHistory: []
      },
      { upsert: true, new: true, session }
    );

    // Update duel status - WITH SESSION
    duel.status = DuelStatus.IN_PROGRESS;
    duel.gameId = duelId; // Use duel ID as game ID
    await duel.save({ session });

    // Commit transaction
    await session.commitTransaction();

    logger.info(`Duel game started: ${duel.challengerName} vs ${duel.challengedName}`);

    return duelGameState;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Get player's game state in a duel
 */
export async function getDuelGameState(
  duelId: string,
  characterId: string
): Promise<GameState | null> {
  const session = await DuelSession.findOne({ duelId });
  if (!session) return null;

  const challengerState = session.challengerState as any;
  const challengedState = session.challengedState as any;

  if (challengerState.playerId === characterId) {
    return challengerState;
  } else if (challengedState.playerId === characterId) {
    return challengedState;
  }

  return null;
}


/**
 * Resolve a completed duel with full transaction safety
 *
 * SESSION FIX: All operations are now wrapped in a single MongoDB transaction
 * to ensure atomicity. This prevents race conditions where:
 * - Gold is transferred but duel status isn't updated
 * - DuelSession is deleted but duel status shows stale data
 */
async function resolveDuel(duelId: string): Promise<{
  winnerId: string;
  winnerName: string;
  challengerScore: number;
  challengedScore: number;
  challengerHand: string;
  challengedHand: string;
  goldTransferred?: number;
}> {
  // Start transaction at the top level for full atomicity
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    // Fetch game state from database WITH SESSION
    const duelSession = await DuelSession.findOne({ duelId }).session(dbSession);
    if (!duelSession) {
      throw new Error('Duel session not found');
    }

    const challengerState = duelSession.challengerState as any;
    const challengedState = duelSession.challengedState as any;

    if (!challengerState.resolved || !challengedState.resolved ||
        !challengerState.result || !challengedState.result) {
      throw new Error('Duel game not properly resolved');
    }

    // Fetch duel record WITH SESSION
    const duel = await Duel.findById(duelId).session(dbSession);
    if (!duel) {
      throw new Error('Duel not found');
    }

    const challengerScore = challengerState.result.score;
    const challengedScore = challengedState.result.score;

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

    // Update duel record (will be saved with session)
    duel.status = DuelStatus.COMPLETED;
    duel.winnerId = new mongoose.Types.ObjectId(winnerId);
    duel.winnerName = winnerName;
    duel.challengerScore = challengerScore;
    duel.challengedScore = challengedScore;
    duel.challengerHandName = challengerState.result.handName || 'Unknown';
    duel.challengedHandName = challengedState.result.handName || 'Unknown';
    duel.completedAt = new Date();

    // Handle wager transfer from locked dollars
    // Both players already have their wager locked, so we transfer from locked to winner's wallet
    let goldTransferred = 0;
    if (duel.type === DuelType.WAGER && duel.wagerAmount > 0) {
      const totalPot = duel.wagerAmount * 2;  // Both players wagered

      // Clear loser's locked dollars (they forfeit it) - WITH SESSION
      await Character.findByIdAndUpdate(
        loserId,
        { $inc: { lockedGold: -duel.wagerAmount } },
        { session: dbSession }
      );

      // Clear winner's locked dollars and add total pot to their wallet - WITH SESSION
      await Character.findByIdAndUpdate(
        winnerId,
        {
          $inc: {
            lockedGold: -duel.wagerAmount,
            dollars: totalPot,
            gold: totalPot
          }
        },
        { session: dbSession }
      );

      // Record transactions for audit trail
      const { GoldTransaction, TransactionType } = await import('../models/GoldTransaction.model');

      // Get balances for transaction records - WITH SESSION
      const winnerChar = await Character.findById(winnerId).session(dbSession);
      const loserChar = await Character.findById(loserId).session(dbSession);

      const winnerBalance = winnerChar?.dollars ?? winnerChar?.gold ?? 0;
      const loserBalance = loserChar?.dollars ?? loserChar?.gold ?? 0;

      await GoldTransaction.create([{
        characterId: loserId,
        currencyType: CurrencyType.DOLLAR,
        amount: -duel.wagerAmount,
        type: TransactionType.SPENT,
        source: TransactionSource.DUEL_LOSS,
        balanceBefore: loserBalance + duel.wagerAmount,
        balanceAfter: loserBalance,
        metadata: {
          duelId: duel._id,
          opponentId: winnerId,
          description: `Lost duel wager to ${winnerName}`
        },
        timestamp: new Date()
      }], { session: dbSession });

      await GoldTransaction.create([{
        characterId: winnerId,
        currencyType: CurrencyType.DOLLAR,
        amount: duel.wagerAmount,  // Net gain is opponent's wager
        type: TransactionType.EARNED,
        source: TransactionSource.DUEL_WIN,
        balanceBefore: winnerBalance - totalPot,
        balanceAfter: winnerBalance,
        metadata: {
          duelId: duel._id,
          opponentId: loserId,
          description: `Won duel wager against ${loserId === duel.challengerId.toString() ? duel.challengerName : duel.challengedName}`
        },
        timestamp: new Date()
      }], { session: dbSession });

      goldTransferred = duel.wagerAmount;

      logger.info(
        `Duel wager resolved: ${winnerName} won ${duel.wagerAmount} dollars from duel`
      );
    }

    // Save duel status update - WITH SESSION
    await duel.save({ session: dbSession });

    // Delete DuelSession - WITH SESSION (ensures atomic cleanup)
    await DuelSession.deleteOne({ duelId }, { session: dbSession });

    // Commit the entire transaction
    await dbSession.commitTransaction();

    logger.info(
      `Duel completed: ${duel.challengerName} (${challengerScore}) vs ${duel.challengedName} (${challengedScore}) - Winner: ${winnerName}`
    );
    logger.debug(`Cleaned up DuelSession entry for duel ${duelId}`);

    // Audit logs happen AFTER transaction commit (non-critical, can fail independently)
    try {
      if (duel.type === DuelType.WAGER && goldTransferred > 0) {
        await logEconomyEvent({
          event: EconomyEvent.DUEL_WAGER,
          characterId: winnerId,
          amount: duel.wagerAmount,
          metadata: {
            duelId: duel._id.toString(),
            loserId,
            loserName: loserId === duel.challengerId.toString() ? duel.challengerName : duel.challengedName,
            totalPot: duel.wagerAmount * 2,
            duelType: duel.type
          }
        });
      }

      await logCombatEvent({
        event: CombatEvent.DUEL_END,
        characterId: winnerId,
        metadata: {
          duelId: duel._id.toString(),
          challengerId: duel.challengerId.toString(),
          challengerName: duel.challengerName,
          challengedId: duel.challengedId.toString(),
          challengedName: duel.challengedName,
          challengerScore,
          challengedScore,
          challengerHand: challengerState.result.handName || 'Unknown',
          challengedHand: challengedState.result.handName || 'Unknown',
          winnerId,
          winnerName,
          loserId,
          duelType: duel.type,
          wagerAmount: duel.wagerAmount,
          goldTransferred
        }
      });
    } catch (auditError) {
      // Audit logging is non-critical - log error but don't fail the operation
      logger.warn('Failed to log duel audit events:', auditError);
    }

    // DEITY SYSTEM: Record karma for duel participation
    // Both players get karma for participating in fair combat
    try {
      // Determine level difference for karma type
      const winnerChar = await Character.findById(winnerId);
      const loserChar = await Character.findById(loserId);
      const levelDiff = Math.abs((winnerChar?.level || 1) - (loserChar?.level || 1));
      const isEvenMatch = levelDiff <= 5;

      // Winner gets karma for fair duel (or ambush if uneven match)
      await karmaService.recordAction(
        winnerId,
        isEvenMatch ? 'COMBAT_FAIR_DUEL' : 'COMBAT_AMBUSH',
        `Won duel against ${loserId === duel.challengerId.toString() ? duel.challengerName : duel.challengedName}${duel.wagerAmount ? ` for ${duel.wagerAmount} gold` : ''}`
      );

      // Loser also gets fair duel karma for participating honorably
      await karmaService.recordAction(
        loserId,
        'COMBAT_FAIR_DUEL',
        `Lost honorable duel to ${winnerName}`
      );

      // If wagered duel, also record gambling karma for winner
      if (duel.type === DuelType.WAGER && duel.wagerAmount > 0) {
        await karmaService.recordAction(
          winnerId,
          'GAMBLING_FAIR_WIN',
          `Won wagered duel - ${duel.wagerAmount * 2} dollar pot`
        );
      }

      logger.debug(`Karma recorded for duel: winner=${winnerId}, loser=${loserId}, evenMatch=${isEvenMatch}`);
    } catch (karmaError) {
      // Karma recording is non-critical
      logger.warn('Failed to record karma for duel:', karmaError);
    }

    // Award PvP Combat XP to the winner
    try {
      const winnerChar = await Character.findById(winnerId);
      const loserChar = await Character.findById(loserId);

      if (winnerChar && loserChar) {
        const pvpXP = SkillService.calculatePvPCombatXP(
          winnerChar.combatLevel || 1,
          loserChar.combatLevel || 1
        );

        const combatResult = await SkillService.awardCombatXP(
          winnerId,
          pvpXP,
          'pvp'
        );

        // Check Combat Level milestones if leveled up
        if (combatResult.leveledUp) {
          await CharacterProgressionService.checkCombatLevelMilestones(
            winnerId,
            combatResult.newCombatLevel,
            combatResult.totalCombatXp
          );
        }

        logger.debug(`PvP Combat XP awarded: ${winnerName} gained ${pvpXP} XP`);
      }
    } catch (combatXpError) {
      // Combat XP is non-critical
      logger.warn('Failed to award PvP combat XP:', combatXpError);
    }

    return {
      winnerId,
      winnerName,
      challengerScore,
      challengedScore,
      challengerHand: challengerState.result.handName || 'Unknown',
      challengedHand: challengedState.result.handName || 'Unknown',
      goldTransferred
    };
  } catch (error) {
    // Abort transaction on any error
    await dbSession.abortTransaction();
    logger.error(`Failed to resolve duel ${duelId}:`, error);

    // If this was a wager duel, attempt to recover dollars outside the failed transaction
    try {
      const duel = await Duel.findById(duelId);
      if (duel && duel.type === DuelType.WAGER && duel.wagerAmount > 0 &&
          duel.status !== DuelStatus.COMPLETED) {
        // Return locked dollars to both players
        const bulkResult = await Character.bulkWrite([
          {
            updateOne: {
              filter: { _id: duel.challengerId },
              update: { $inc: { dollars: duel.wagerAmount, gold: duel.wagerAmount, lockedGold: -duel.wagerAmount } }
            }
          },
          {
            updateOne: {
              filter: { _id: duel.challengedId },
              update: { $inc: { dollars: duel.wagerAmount, gold: duel.wagerAmount, lockedGold: -duel.wagerAmount } }
            }
          }
        ], { ordered: false });

        if (bulkResult.modifiedCount === 2) {
          logger.info(
            `Recovered ${duel.wagerAmount} dollars for both players after transaction failure`
          );
        } else {
          logger.error(
            `CRITICAL: Partial dollar recovery - only ${bulkResult.modifiedCount} of 2 updates succeeded. ` +
            `Manual intervention required for duel ${duelId}`
          );
        }
      }
    } catch (recoveryError) {
      logger.error(
        `CRITICAL: Failed to recover dollars for duel ${duelId}. Manual intervention required:`,
        recoveryError
      );
    }

    throw error;
  } finally {
    await dbSession.endSession();
  }
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
  // Fetch game state from database
  const session = await DuelSession.findOne({ duelId });
  if (!session) {
    throw new Error('Duel game not found');
  }

  const challengerState = session.challengerState as any;
  const challengedState = session.challengedState as any;

  const isChallenger = challengerState.playerId === characterId;
  const isChallenged = challengedState.playerId === characterId;

  if (!isChallenger && !isChallenged) {
    throw new Error('Not a participant in this duel');
  }

  // Check if player already resolved
  if (isChallenger && challengerState.resolved) {
    throw new Error('You have already completed your turn');
  }
  if (isChallenged && challengedState.resolved) {
    throw new Error('You have already completed your turn');
  }

  // Process the action
  let gameState: GameState;
  if (isChallenger) {
    gameState = processAction(challengerState, action);
    session.challengerState = gameState as any;
  } else {
    gameState = processAction(challengedState, action);
    session.challengedState = gameState as any;
  }

  // Check if this player's game is resolved
  const isResolved = gameState.status === 'resolved';
  if (isResolved) {
    const result = resolveGame(gameState);
    if (isChallenger) {
      (session.challengerState as any).resolved = true;
      (session.challengerState as any).result = result;
    } else {
      (session.challengedState as any).resolved = true;
      (session.challengedState as any).result = result;
    }
  }

  // Save updated state to database
  await session.save();

  // Check if both players have resolved
  const challengerResolved = (session.challengerState as any).resolved || false;
  const challengedResolved = (session.challengedState as any).resolved || false;
  const duelComplete = challengerResolved && challengedResolved;

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
  let dollarsWon = 0;
  let dollarsLost = 0;

  for (const duel of completedDuels) {
    const isWinner = duel.winnerId?.toString() === characterId;

    if (isWinner) {
      wins++;
      if (duel.type === DuelType.WAGER) {
        dollarsWon += duel.wagerAmount;
      }
    } else {
      losses++;
      if (duel.type === DuelType.WAGER) {
        dollarsLost += duel.wagerAmount;
      }
    }
  }

  return {
    totalDuels: completedDuels.length,
    wins,
    losses,
    winRate: completedDuels.length > 0 ? (wins / completedDuels.length) * 100 : 0,
    goldWon: dollarsWon,
    goldLost: dollarsLost
  };
}

/**
 * Clean up expired challenges and return locked dollars
 */
export async function cleanupExpiredChallenges(): Promise<number> {
  // First, find all expired wager duels so we can return locked dollars
  const expiredWagerDuels = await Duel.find({
    status: DuelStatus.PENDING,
    expiresAt: { $lt: new Date() },
    type: DuelType.WAGER,
    wagerAmount: { $gt: 0 }
  });

  // Return locked dollars to each challenger
  for (const duel of expiredWagerDuels) {
    await Character.findByIdAndUpdate(duel.challengerId, {
      $inc: {
        dollars: duel.wagerAmount,
        gold: duel.wagerAmount,
        lockedGold: -duel.wagerAmount
      }
    });
    logger.info(`Returned ${duel.wagerAmount} locked dollars to ${duel.challengerName} after challenge expired`);
  }

  // Now update all expired duels
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
