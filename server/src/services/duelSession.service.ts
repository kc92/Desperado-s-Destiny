/**
 * Duel Session Service
 * Manages persistent duel state for crash-safety
 * Integrates with Socket.io duel handlers
 */

import mongoose, { ClientSession } from 'mongoose';
import { DuelSession, IDuelSession, DuelPlayerState, DuelRoundState, AbilityState } from '../models/DuelSession.model';
import { DuelStatus, DuelPhase, BettingAction, HandRank } from '@desperados/shared';
import logger from '../utils/logger';

// =============================================================================
// TYPES (matching client expectations)
// =============================================================================

export interface ActiveDuelState {
  duelId: string;
  challengerId: string;
  challengedId: string;
  status: DuelStatus;
  currentRound: number;

  // Player states
  challenger: DuelPlayerState;
  challenged: DuelPlayerState;

  // Round state
  round: DuelRoundState;

  // Round results
  roundResults: any[];

  // Ability states
  challengerAbilityState: AbilityState;
  challengedAbilityState: AbilityState;

  // Betting history
  challengerBettingHistory: BettingAction[];
  challengedBettingHistory: BettingAction[];
}

// =============================================================================
// SERVICE
// =============================================================================

export class DuelSessionService {
  /**
   * Create a new duel session
   *
   * @param duelId - Unique duel identifier
   * @param challengerId - Challenger character ID
   * @param challengedId - Challenged character ID
   * @param challengerName - Challenger character name
   * @param challengedName - Challenged character name
   * @returns Created duel session
   */
  static async createSession(
    duelId: string,
    challengerId: string,
    challengedId: string,
    challengerName: string,
    challengedName: string
  ): Promise<IDuelSession> {
    const initialPlayerState: DuelPlayerState = {
      characterId: '',
      characterName: '',
      hand: [],
      handRank: HandRank.HIGH_CARD,
      gold: 0,
      currentBet: 0,
      roundsWon: 0,
      hasSubmittedAction: false,
      isReady: false,
    };

    const initialRoundState: DuelRoundState = {
      roundNumber: 1,
      phase: DuelPhase.WAITING,
      pot: 0,
      turnStartedAt: new Date(),
      turnTimeLimit: 60,
    };

    const initialAbilityState: AbilityState = {
      available: [],
      cooldowns: {},
      energy: 50,
      maxEnergy: 100,
      pokerFaceActive: false,
      pokerFaceRoundsLeft: 0,
    };

    const session = await DuelSession.create({
      duelId,
      challengerId,
      challengedId,
      status: DuelStatus.PENDING,
      currentRound: 1,
      challengerState: {
        ...initialPlayerState,
        characterId: challengerId,
        characterName: challengerName,
      },
      challengedState: {
        ...initialPlayerState,
        characterId: challengedId,
        characterName: challengedName,
      },
      roundState: initialRoundState,
      roundResults: [],
      challengerAbilityState: initialAbilityState,
      challengedAbilityState: initialAbilityState,
      challengerBettingHistory: [],
      challengedBettingHistory: [],
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    logger.info(`Created duel session ${duelId}: ${challengerName} vs ${challengedName}`);

    return session;
  }

  /**
   * Load duel session from database
   *
   * @param duelId - Duel ID
   * @returns Active duel state or null if not found
   */
  static async loadSession(duelId: string): Promise<ActiveDuelState | null> {
    const session = await DuelSession.findOne({ duelId });

    if (!session) {
      return null;
    }

    // Map database model to active state format expected by socket handlers
    return {
      duelId: session.duelId,
      challengerId: session.challengerId.toString(),
      challengedId: session.challengedId.toString(),
      status: session.status,
      currentRound: session.currentRound,
      challenger: session.challengerState,
      challenged: session.challengedState,
      round: session.roundState,
      roundResults: session.roundResults,
      challengerAbilityState: session.challengerAbilityState,
      challengedAbilityState: session.challengedAbilityState,
      challengerBettingHistory: session.challengerBettingHistory,
      challengedBettingHistory: session.challengedBettingHistory,
    };
  }

  /**
   * Save duel session state
   * Updates lastActionAt and expiresAt automatically
   *
   * @param state - Active duel state
   */
  static async saveSession(state: ActiveDuelState): Promise<void> {
    await DuelSession.findOneAndUpdate(
      { duelId: state.duelId },
      {
        status: state.status,
        currentRound: state.currentRound,
        challengerState: state.challenger,
        challengedState: state.challenged,
        roundState: state.round,
        roundResults: state.roundResults,
        challengerAbilityState: state.challengerAbilityState,
        challengedAbilityState: state.challengedAbilityState,
        challengerBettingHistory: state.challengerBettingHistory,
        challengedBettingHistory: state.challengedBettingHistory,
        lastActionAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      { upsert: false } // Don't create if doesn't exist
    );

    logger.debug(`Saved duel session ${state.duelId}`);
  }

  /**
   * Delete duel session (when duel completes)
   *
   * @param duelId - Duel ID
   */
  static async deleteSession(duelId: string): Promise<void> {
    await DuelSession.deleteOne({ duelId });
    logger.info(`Deleted duel session ${duelId}`);
  }

  /**
   * Get all active duel sessions for a character
   *
   * @param characterId - Character ID
   * @returns Array of active duel states
   */
  static async getActiveSessionsForCharacter(characterId: string): Promise<ActiveDuelState[]> {
    const sessions = await DuelSession.find({
      $or: [
        { challengerId: characterId },
        { challengedId: characterId },
      ],
      status: { $in: [DuelStatus.PENDING, DuelStatus.IN_PROGRESS] },
      expiresAt: { $gt: new Date() },
    });

    return sessions.map((session) => ({
      duelId: session.duelId,
      challengerId: session.challengerId.toString(),
      challengedId: session.challengedId.toString(),
      status: session.status,
      currentRound: session.currentRound,
      challenger: session.challengerState,
      challenged: session.challengedState,
      round: session.roundState,
      roundResults: session.roundResults,
      challengerAbilityState: session.challengerAbilityState,
      challengedAbilityState: session.challengedAbilityState,
      challengerBettingHistory: session.challengerBettingHistory,
      challengedBettingHistory: session.challengedBettingHistory,
    }));
  }

  /**
   * Clean up expired duel sessions (maintenance task)
   * Usually handled by TTL index, but useful for manual cleanup
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await DuelSession.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired duel sessions`);
    }

    return result.deletedCount;
  }

  /**
   * Restore all active duel sessions on server startup
   * Reconnects duels to socket rooms
   */
  static async restoreActiveSessions(): Promise<ActiveDuelState[]> {
    const sessions = await DuelSession.find({
      status: { $in: [DuelStatus.PENDING, DuelStatus.IN_PROGRESS] },
      expiresAt: { $gt: new Date() },
    });

    logger.info(`Restoring ${sessions.length} active duel sessions after server restart`);

    return sessions.map((session) => ({
      duelId: session.duelId,
      challengerId: session.challengerId.toString(),
      challengedId: session.challengedId.toString(),
      status: session.status,
      currentRound: session.currentRound,
      challenger: session.challengerState,
      challenged: session.challengedState,
      round: session.roundState,
      roundResults: session.roundResults,
      challengerAbilityState: session.challengerAbilityState,
      challengedAbilityState: session.challengedAbilityState,
      challengerBettingHistory: session.challengerBettingHistory,
      challengedBettingHistory: session.challengedBettingHistory,
    }));
  }
}
