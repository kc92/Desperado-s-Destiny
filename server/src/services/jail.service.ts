/**
 * Jail Service
 *
 * Handles jail mechanics including imprisonment, activities, escape, bail, and turn-ins
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { NotificationService } from './notification.service';
import {
  JailState,
  JailActivity,
  JailActivityResult,
  JailReason,
  JailLocation,
  TurnInResult,
  EscapeAttemptResult,
  BribeAttemptResult,
  BailPaymentResult,
  JailStats,
  JAIL_ACTIVITIES,
  JAIL_SENTENCES,
  WANTED_ARREST_THRESHOLD,
  BOUNTY_TURN_IN_MULTIPLIER
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Activity cooldown tracking
 */
interface ActivityCooldown {
  lastPrisonLabor?: Date;
  lastEscapeAttempt?: Date;
  lastBribeAttempt?: Date;
}

export class JailService {
  /**
   * Send a player to jail
   */
  static async jailPlayer(
    characterId: string | mongoose.Types.ObjectId,
    sentence: number, // Minutes
    reason: JailReason,
    bailAmount?: number,
    canBail: boolean = true,
    session?: mongoose.ClientSession
  ): Promise<JailState> {
    const useSession = session || null;
    const isExternalSession = !!session;
    const internalSession = !isExternalSession ? await mongoose.startSession() : null;

    try {
      if (internalSession) {
        await internalSession.startTransaction();
      }

      const activeSession = useSession || internalSession;

      const characterQuery = Character.findById(characterId);
      const character = activeSession
        ? await characterQuery.session(activeSession)
        : await characterQuery;

      if (!character) {
        throw new Error('Character not found');
      }

      // Check if already jailed
      if (character.isCurrentlyJailed()) {
        throw new Error('Character is already in jail');
      }

      // Determine jail location based on current location
      const jailLocation = this.determineJailLocation(character.currentLocation);

      // Calculate bail if not provided
      const calculatedBail = bailAmount || this.calculateBail(character.wantedLevel, sentence);

      // Send to jail
      character.sendToJail(sentence, calculatedBail);
      character.lastArrestTime = new Date();

      // Move to jail location
      character.currentLocation = jailLocation;

      await character.save(activeSession ? { session: activeSession } : undefined);

      // Send notification
      await NotificationService.sendNotification(
        character._id.toString(),
        'JAIL',
        `You have been jailed for ${sentence} minutes. Reason: ${this.getReasonText(reason)}`,
        { sentence, reason, bailAmount: calculatedBail, canBail }
      );

      if (internalSession) {
        await internalSession.commitTransaction();
      }

      logger.info(
        `Player jailed: ${character.name} sent to ${jailLocation} for ${sentence} minutes. Reason: ${reason}`
      );

      return this.getJailInfo(character);
    } catch (error) {
      if (internalSession) {
        await internalSession.abortTransaction();
      }
      logger.error('Error jailing player:', error);
      throw error;
    } finally {
      if (internalSession) {
        internalSession.endSession();
      }
    }
  }

  /**
   * Release a player from jail
   */
  static async releasePlayer(
    characterId: string | mongoose.Types.ObjectId,
    reason: 'served' | 'bailed' | 'escaped' | 'pardoned' = 'served',
    session?: mongoose.ClientSession
  ): Promise<ICharacter> {
    const characterQuery = Character.findById(characterId);
    const character = session
      ? await characterQuery.session(session)
      : await characterQuery;

    if (!character) {
      throw new Error('Character not found');
    }

    if (!character.isJailed) {
      throw new Error('Character is not in jail');
    }

    const wasLocation = character.currentLocation;

    // Release from jail
    character.releaseFromJail();

    // Move to town square of jail location
    const townSquare = this.getJailTownSquare(wasLocation as JailLocation);
    character.currentLocation = townSquare;

    await character.save(session ? { session } : undefined);

    // Send notification
    await NotificationService.sendNotification(
      character._id.toString(),
      'JAIL_RELEASE',
      `You have been released from jail (${reason})`,
      { reason, location: townSquare }
    );

    logger.info(`Player released: ${character.name} released from jail (${reason})`);

    return character;
  }

  /**
   * Check jail status of a player
   */
  static async checkJailStatus(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<JailState> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    return this.getJailInfo(character);
  }

  /**
   * Attempt to escape from jail
   */
  static async attemptEscape(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<EscapeAttemptResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!character.isCurrentlyJailed()) {
        throw new Error('Character is not in jail');
      }

      // Check cooldown
      const cooldown = this.checkActivityCooldown(character, JailActivity.ESCAPE_ATTEMPT);
      if (!cooldown.canPerform) {
        throw new Error(`Must wait ${cooldown.minutesRemaining} minutes before attempting escape again`);
      }

      // Calculate escape chance
      const escapeChance = this.calculateEscapeChance(character);
      const success = SecureRNG.chance(escapeChance);

      if (success) {
        // Successful escape
        await this.releasePlayer(character._id.toString(), 'escaped', session);
        await session.commitTransaction();
        session.endSession();

        logger.info(`Escape successful: ${character.name} escaped from jail`);

        return {
          success: true,
          escaped: true,
          caught: false,
          message: 'You successfully escaped from jail! Stay hidden to avoid recapture.'
        };
      } else {
        // Failed escape - add time to sentence
        const penaltyMinutes = JAIL_ACTIVITIES.escape_attempt.failurePenalty;
        const newReleaseTime = new Date(character.jailedUntil!.getTime() + penaltyMinutes * 60 * 1000);
        character.jailedUntil = newReleaseTime;

        // Record escape attempt (for cooldown)
        this.recordActivityAttempt(character, JailActivity.ESCAPE_ATTEMPT);

        await character.save({ session });
        await session.commitTransaction();
        session.endSession();

        logger.info(
          `Escape failed: ${character.name} caught escaping, sentence extended by ${penaltyMinutes} minutes`
        );

        return {
          success: true,
          escaped: false,
          caught: true,
          sentenceAdded: penaltyMinutes,
          message: `Escape attempt failed! The guards caught you and added ${penaltyMinutes} minutes to your sentence.`
        };
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Attempt to bribe a guard
   */
  static async attemptBribe(
    characterId: string | mongoose.Types.ObjectId,
    amount: number
  ): Promise<BribeAttemptResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!character.isCurrentlyJailed()) {
        throw new Error('Character is not in jail');
      }

      // Check cooldown
      const cooldown = this.checkActivityCooldown(character, JailActivity.BRIBE_GUARD);
      if (!cooldown.canPerform) {
        throw new Error(`Must wait ${cooldown.minutesRemaining} minutes before attempting another bribe`);
      }

      // Check if player can afford bribe
      if (character.dollars < amount) {
        throw new Error(`Insufficient dollars. Need $${amount}, have $${character.dollars}`);
      }

      // Calculate minimum bribe amount
      const remainingMinutes = character.getRemainingJailTime();
      const minBribe = remainingMinutes * JAIL_ACTIVITIES.bribe_guard.costPerMinute;

      if (amount < minBribe) {
        throw new Error(`Bribe too low. Minimum bribe: $${minBribe}`);
      }

      // Calculate acceptance chance (more gold = higher chance)
      const bribeRatio = amount / minBribe;
      const baseChance = JAIL_ACTIVITIES.bribe_guard.baseAcceptChance;
      const acceptChance = Math.min(0.90, baseChance + (bribeRatio - 1) * 0.15);

      const accepted = SecureRNG.chance(acceptChance);

      // Record bribe attempt
      this.recordActivityAttempt(character, JailActivity.BRIBE_GUARD);

      if (accepted) {
        // Bribe accepted - deduct dollars and release
        await DollarService.deductDollars(
          character._id as string,
          amount,
          TransactionSource.BRIBE,
          { description: `Bribed guard for early jail release (${remainingMinutes} minutes remaining)`, currencyType: CurrencyType.DOLLAR },
          session
        );

        await this.releasePlayer(character._id.toString(), 'bailed', session);
        await session.commitTransaction();
        session.endSession();

        logger.info(`Bribe accepted: ${character.name} bribed guard for $${amount}`);

        return {
          success: true,
          accepted: true,
          goldSpent: amount,
          released: true,
          message: `The guard accepts your bribe of $${amount} and lets you out!`
        };
      } else {
        // Bribe rejected - lose half the dollars
        const lostDollars = Math.floor(amount * 0.5);
        await DollarService.deductDollars(
          character._id as string,
          lostDollars,
          TransactionSource.BRIBE,
          { description: `Failed bribe attempt, guard took $${lostDollars}`, currencyType: CurrencyType.DOLLAR },
          session
        );

        await character.save({ session });
        await session.commitTransaction();
        session.endSession();

        logger.info(`Bribe rejected: ${character.name} lost $${lostDollars} in failed bribe`);

        return {
          success: true,
          accepted: false,
          goldSpent: lostDollars,
          released: false,
          message: `The guard refuses your bribe and takes $${lostDollars} for himself!`
        };
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Pay bail for self or another player
   */
  static async payBail(
    characterId: string | mongoose.Types.ObjectId,
    payerId: string | mongoose.Types.ObjectId
  ): Promise<BailPaymentResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      const payer = await Character.findById(payerId).session(session);

      if (!character) {
        throw new Error('Character not found');
      }
      if (!payer) {
        throw new Error('Payer not found');
      }

      if (!character.isCurrentlyJailed()) {
        throw new Error('Character is not in jail');
      }

      const bailCost = character.lastBailCost;

      // Check if bail is allowed
      // Some crimes don't allow bail (would need to track this)
      if (bailCost === 0) {
        throw new Error('Bail is not available for this sentence');
      }

      // Check if payer can afford bail
      if (payer.dollars < bailCost) {
        throw new Error(`Insufficient dollars. Bail costs $${bailCost}, payer has $${payer.dollars}`);
      }

      // Deduct dollars from payer
      await DollarService.deductDollars(
        payer._id as string,
        bailCost,
        TransactionSource.BAIL_PAYMENT,
        {
          description: `Paid bail of $${bailCost} for ${character.name}`,
          targetCharacterId: character._id,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Release from jail
      await this.releasePlayer(character._id.toString(), 'bailed', session);

      // Notify both players
      if (characterId.toString() !== payerId.toString()) {
        await NotificationService.sendNotification(
          character._id.toString(),
          'BAIL_PAID',
          `${payer.name} paid your bail of $${bailCost}!`,
          { paidBy: payer.name, amount: bailCost }
        );
      }

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Bail paid: ${payer.name} paid $${bailCost} bail for ${character.name}`
      );

      return {
        success: true,
        goldSpent: bailCost,
        released: true,
        paidBy: payer._id.toString(),
        message: `Bail of $${bailCost} has been paid. ${character.name} is released.`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Perform jail activity
   */
  static async doJailActivity(
    characterId: string | mongoose.Types.ObjectId,
    activity: JailActivity
  ): Promise<JailActivityResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!character.isCurrentlyJailed()) {
        throw new Error('Character is not in jail');
      }

      let result: JailActivityResult;

      switch (activity) {
        case JailActivity.PRISON_LABOR:
          result = await this.doPrisonLabor(character, session);
          break;

        case JailActivity.SOCIALIZE:
          result = await this.socialize(character, session);
          break;

        case JailActivity.WAIT:
          result = {
            success: true,
            activity: JailActivity.WAIT,
            message: 'You wait patiently in your cell...'
          };
          break;

        default:
          throw new Error(`Invalid activity: ${activity}`);
      }

      await character.save({ session });
      await session.commitTransaction();
      session.endSession();

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Turn in a wanted player for bounty reward
   */
  static async turnInPlayer(
    hunterId: string | mongoose.Types.ObjectId,
    targetId: string | mongoose.Types.ObjectId
  ): Promise<TurnInResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hunter = await Character.findById(hunterId).session(session);
      const target = await Character.findById(targetId).session(session);

      if (!hunter) {
        throw new Error('Hunter character not found');
      }
      if (!target) {
        throw new Error('Target character not found');
      }

      // Check if target has bounty
      if (target.wantedLevel < WANTED_ARREST_THRESHOLD) {
        throw new Error(`Target does not have a high enough wanted level (need ${WANTED_ARREST_THRESHOLD}+)`);
      }

      // Check arrest cooldown
      if (!hunter.canArrestTarget(target._id.toString())) {
        throw new Error('You must wait before arresting this target again');
      }

      // Calculate bounty reward
      const baseBounty = target.bountyAmount;
      const bountyReward = Math.floor(baseBounty * BOUNTY_TURN_IN_MULTIPLIER);

      // Calculate jail sentence
      const jailMinutes = target.wantedLevel * 15; // 15 minutes per wanted level

      // Award bounty to hunter
      await DollarService.addDollars(
        hunter._id as string,
        bountyReward,
        TransactionSource.BOUNTY_REWARD,
        {
          description: `Bounty reward for turning in ${target.name}`,
          targetCharacterId: target._id,
          wantedLevel: target.wantedLevel,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Send target to jail
      await this.jailPlayer(
        target._id.toString(),
        jailMinutes,
        JailReason.TURNED_IN,
        target.wantedLevel * 100, // $100 bail per wanted level
        true,
        session
      );

      // Reduce target's wanted level
      target.decreaseWantedLevel(1);

      // Record arrest
      hunter.recordArrest(target._id.toString());

      await hunter.save({ session });
      await target.save({ session });

      // Send notifications
      await NotificationService.sendNotification(
        hunter._id.toString(),
        'BOUNTY_COLLECTED',
        `You turned in ${target.name} and collected $${bountyReward} bounty!`,
        { reward: bountyReward, targetName: target.name }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Player turned in: ${hunter.name} turned in ${target.name} for $${bountyReward}. ` +
        `Target jailed for ${jailMinutes} minutes`
      );

      return {
        success: true,
        bountyReward,
        targetJailed: true,
        jailSentence: jailMinutes,
        message: `You turned in ${target.name} and received $${bountyReward} bounty!`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get jail information for a character
   */
  static getJailInfo(character: ICharacter): JailState {
    return {
      characterId: character._id.toString(),
      isJailed: character.isJailed,
      jailLocation: character.isJailed ? this.determineJailLocation(character.currentLocation) : null,
      jailedAt: character.isJailed && character.jailedUntil
        ? new Date(character.jailedUntil.getTime() - character.getRemainingJailTime() * 60 * 1000)
        : null,
      releaseAt: character.jailedUntil,
      sentence: character.isJailed && character.jailedUntil
        ? Math.floor((character.jailedUntil.getTime() - Date.now() + character.getRemainingJailTime() * 60 * 1000) / (60 * 1000))
        : 0,
      reason: null, // Would need to track this
      bailAmount: character.lastBailCost,
      canBail: character.lastBailCost > 0,
      remainingTime: character.getRemainingJailTime()
    };
  }

  /**
   * Get jail statistics for a character
   */
  static async getJailStats(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<JailStats> {
    // For now, return basic stats
    // In full implementation, we'd track detailed jail history
    return {
      totalArrests: 0,
      totalJailTime: 0,
      successfulEscapes: 0,
      failedEscapes: 0,
      timesBailed: 0,
      totalBailPaid: 0,
      totalBribes: 0,
      totalBribesPaid: 0,
      prisonLaborGold: 0,
      prisonLaborXP: 0
    };
  }

  // ========== Private Helper Methods ==========

  /**
   * Determine which jail to send player to based on location
   */
  private static determineJailLocation(currentLocation: string): JailLocation {
    // Map locations to jails
    // This is simplified - would need full location mapping
    const locationJailMap: Record<string, JailLocation> = {
      'perdition': JailLocation.PERDITION_JAIL,
      'sangre-mesa': JailLocation.SANGRE_JAIL,
      'redstone-pass': JailLocation.REDSTONE_JAIL,
      'ironwood-basin': JailLocation.IRONWOOD_JAIL
    };

    return locationJailMap[currentLocation] || JailLocation.PERDITION_JAIL;
  }

  /**
   * Get town square location for a jail
   */
  private static getJailTownSquare(jailLocation: JailLocation): string {
    const townMap: Record<JailLocation, string> = {
      [JailLocation.PERDITION_JAIL]: 'perdition',
      [JailLocation.SANGRE_JAIL]: 'sangre-mesa',
      [JailLocation.REDSTONE_JAIL]: 'redstone-pass',
      [JailLocation.IRONWOOD_JAIL]: 'ironwood-basin'
    };

    return townMap[jailLocation] || 'perdition';
  }

  /**
   * Calculate bail amount
   */
  private static calculateBail(wantedLevel: number, sentenceMinutes: number): number {
    return (wantedLevel * 100) + (sentenceMinutes * 5);
  }

  /**
   * Get human-readable reason text
   */
  private static getReasonText(reason: JailReason): string {
    const reasonTexts: Record<JailReason, string> = {
      [JailReason.BOUNTY_COLLECTION]: 'Bounty collected',
      [JailReason.CAUGHT_STEALING]: 'Caught stealing',
      [JailReason.CAUGHT_CRIME]: 'Caught committing a crime',
      [JailReason.TURNED_IN]: 'Turned in by another player',
      [JailReason.SURRENDER]: 'Surrendered to authorities',
      [JailReason.FAILED_ESCAPE]: 'Failed escape attempt',
      [JailReason.LAWFUL_EXECUTION]: 'Lawful execution'
    };

    return reasonTexts[reason] || 'Unknown';
  }

  /**
   * Calculate escape chance based on character skills
   */
  private static calculateEscapeChance(character: ICharacter): number {
    let chance = JAIL_ACTIVITIES.escape_attempt.baseSuccessChance;

    // Cunning skill increases escape chance
    const cunningBonus = character.stats.cunning * 0.01; // +1% per cunning point
    chance += cunningBonus;

    // Check for relevant skills (lockpicking, stealth, etc)
    for (const skill of character.skills) {
      if (skill.skillId.toLowerCase().includes('stealth') ||
          skill.skillId.toLowerCase().includes('lockpick') ||
          skill.skillId.toLowerCase().includes('escape')) {
        chance += skill.level * 0.02; // +2% per skill level
      }
    }

    // Cap at 75% max chance
    return Math.min(0.75, chance);
  }

  /**
   * Check activity cooldown
   */
  private static checkActivityCooldown(
    character: ICharacter,
    activity: JailActivity
  ): { canPerform: boolean; minutesRemaining: number } {
    // This would need to be tracked in character model
    // For now, always allow
    return { canPerform: true, minutesRemaining: 0 };
  }

  /**
   * Record activity attempt
   */
  private static recordActivityAttempt(character: ICharacter, activity: JailActivity): void {
    // Would need to track this in character model
    logger.debug(`Activity attempted: ${character.name} - ${activity}`);
  }

  /**
   * Prison labor activity
   */
  private static async doPrisonLabor(
    character: ICharacter,
    session: mongoose.ClientSession
  ): Promise<JailActivityResult> {
    // Check cooldown
    const cooldown = this.checkActivityCooldown(character, JailActivity.PRISON_LABOR);
    if (!cooldown.canPerform) {
      throw new Error(`Must wait ${cooldown.minutesRemaining} minutes before doing prison labor again`);
    }

    // Calculate rewards
    const config = JAIL_ACTIVITIES.prison_labor;
    const dollarsEarned = SecureRNG.range(config.goldReward.min, config.goldReward.max);
    const xpEarned = SecureRNG.range(config.xpReward.min, config.xpReward.max);

    // Award dollars
    await DollarService.addDollars(
      character._id as string,
      dollarsEarned,
      TransactionSource.JOB_INCOME,
      { description: 'Prison labor work', jailActivity: true, currencyType: CurrencyType.DOLLAR },
      session
    );

    // Award XP
    await character.addExperience(xpEarned);

    // Record activity
    this.recordActivityAttempt(character, JailActivity.PRISON_LABOR);

    return {
      success: true,
      activity: JailActivity.PRISON_LABOR,
      message: `You worked hard and earned $${dollarsEarned} and ${xpEarned} XP.`,
      goldEarned: dollarsEarned,
      xpEarned
    };
  }

  /**
   * Socialize activity
   */
  private static async socialize(
    character: ICharacter,
    _session: mongoose.ClientSession
  ): Promise<JailActivityResult> {
    // Random socializing messages
    const messages = [
      'You chat with other prisoners and hear some interesting rumors...',
      'An old-timer tells you stories about past escapes.',
      'You make friends with a fellow inmate.',
      'You learn about the guard rotation schedule.',
      'Someone mentions a loose bar in cell block C...'
    ];

    const randomMessage = SecureRNG.select(messages);

    // Small chance to get a useful tip (future quest hook)
    const gotTip = SecureRNG.chance(0.1);

    return {
      success: true,
      activity: JailActivity.SOCIALIZE,
      message: randomMessage + (gotTip ? ' This information might be useful later.' : '')
    };
  }
}
