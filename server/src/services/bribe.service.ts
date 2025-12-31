/**
 * Bribe Service
 * Handles bribery mechanics for bypassing access restrictions
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import karmaService from './karma.service';
import { SkillService } from './skill.service';

export interface BribeResult {
  success: boolean;
  goldSpent?: number;
  accessGranted?: boolean;
  duration?: number; // Minutes of access
  message: string;
  newCriminalRep?: number;
}

export class BribeService {
  /**
   * Bribe a guard to bypass wanted level restriction
   */
  static async bribeGuard(
    characterId: string,
    buildingId: string,
    bribeCost: number
  ): Promise<BribeResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, message: 'Character not found' };
      }

      // Check if character has enough dollars
      if (character.dollars < bribeCost) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient dollars. Need $${bribeCost}, have $${character.dollars}.`,
        };
      }

      // Deduct dollars
      await DollarService.deductDollars(
        characterId,
        bribeCost,
        TransactionSource.BRIBE,
        {
          buildingId,
          description: `Bribed guard for building access`,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Increase criminal reputation slightly (bribing is illegal)
      character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 1);
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      // DEITY SYSTEM: Record karma for bribing official
      // Bribery is corruption - affects justice and deception dimensions
      try {
        await karmaService.recordAction(
          characterId,
          'BRIBED_OFFICIAL',
          `Bribed guard at ${buildingId} for $${bribeCost}`
        );
        logger.debug('Karma recorded for bribe: BRIBED_OFFICIAL');
      } catch (karmaError) {
        logger.warn('Failed to record karma for bribe:', karmaError);
      }

      logger.info(`Character ${characterId} bribed guard for $${bribeCost}`);

      return {
        success: true,
        goldSpent: bribeCost,
        accessGranted: true,
        duration: 30, // 30 minutes of access
        message: `You slip $${bribeCost} to the guard. "I didn't see nothin'..."`,
        newCriminalRep: character.criminalReputation,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error bribing guard:', error);
      throw error;
    }
  }

  /**
   * Bribe an NPC for information or services
   */
  static async bribeNPC(
    characterId: string,
    npcId: string,
    amount: number
  ): Promise<BribeResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, message: 'Character not found' };
      }

      // Check if character has enough dollars
      if (character.dollars < amount) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient dollars. Need $${amount}, have $${character.dollars}.`,
        };
      }

      // Calculate success chance based on amount and character cunning
      const basChance = 50;
      const amountBonus = Math.min(30, amount / 10);
      const effectiveCunning = SkillService.getEffectiveStat(character, 'cunning');
      const cunningBonus = effectiveCunning * 2;
      const successChance = basChance + amountBonus + cunningBonus;

      const succeeded = SecureRNG.chance(successChance / 100);

      if (succeeded) {
        // Deduct dollars
        await DollarService.deductDollars(
          characterId,
          amount,
          TransactionSource.BRIBE,
          {
            npcId,
            description: `Bribed NPC for information`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );

        // Increase criminal reputation
        character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 2);
        await character.save({ session });

        await session.commitTransaction();
        session.endSession();

        // DEITY SYSTEM: Record karma for bribing NPC
        try {
          await karmaService.recordAction(
            characterId,
            'BRIBED_OFFICIAL',
            `Bribed NPC ${npcId} for $${amount}`
          );
          logger.debug('Karma recorded for NPC bribe: BRIBED_OFFICIAL');
        } catch (karmaError) {
          logger.warn('Failed to record karma for NPC bribe:', karmaError);
        }

        logger.info(`Character ${characterId} successfully bribed NPC ${npcId}`);

        return {
          success: true,
          goldSpent: amount,
          message: 'The NPC glances around nervously and leans in close...',
          newCriminalRep: character.criminalReputation,
        };
      } else {
        // Failed bribe - still lose some dollars
        const lostAmount = Math.floor(amount / 2);
        if (lostAmount > 0) {
          await DollarService.deductDollars(
            characterId,
            lostAmount,
            TransactionSource.BRIBE,
            {
              npcId,
              description: `Failed bribe attempt`,
              currencyType: CurrencyType.DOLLAR,
            },
            session
          );
        }

        await session.commitTransaction();
        session.endSession();

        return {
          success: false,
          goldSpent: lostAmount,
          message: `"How dare you! Get out of my sight!" You lost $${lostAmount}.`,
        };
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error bribing NPC:', error);
      throw error;
    }
  }

  /**
   * Calculate recommended bribe amount for NPC
   */
  static calculateRecommendedBribe(
    npcFaction: string | undefined,
    characterFaction: string,
    requestDifficulty: number // 1-10
  ): number {
    let baseCost = requestDifficulty * 10;

    // Cross-faction bribes cost more
    if (npcFaction && npcFaction !== characterFaction) {
      baseCost *= 1.5;
    }

    return Math.floor(baseCost);
  }
}

export default BribeService;
