/**
 * Bribe Service
 * Handles bribery mechanics for bypassing access restrictions
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

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

      // Check if character has enough gold
      if (!character.hasGold(bribeCost)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient gold. Need ${bribeCost}, have ${character.gold}.`,
        };
      }

      // Deduct gold
      const { GoldService } = await import('./gold.service');
      await GoldService.deductGold(
        characterId,
        bribeCost,
        TransactionSource.BRIBE,
        {
          buildingId,
          description: `Bribed guard for building access`,
        },
        session
      );

      // Increase criminal reputation slightly (bribing is illegal)
      character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 1);
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} bribed guard for ${bribeCost} gold`);

      return {
        success: true,
        goldSpent: bribeCost,
        accessGranted: true,
        duration: 30, // 30 minutes of access
        message: `You slip ${bribeCost} gold to the guard. "I didn't see nothin'..."`,
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

      // Check if character has enough gold
      if (!character.hasGold(amount)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient gold. Need ${amount}, have ${character.gold}.`,
        };
      }

      // Calculate success chance based on amount and character cunning
      const basChance = 50;
      const amountBonus = Math.min(30, amount / 10);
      const cunningBonus = character.stats.cunning * 2;
      const successChance = basChance + amountBonus + cunningBonus;

      const roll = Math.random() * 100;
      const succeeded = roll < successChance;

      if (succeeded) {
        // Deduct gold
        const { GoldService } = await import('./gold.service');
        await GoldService.deductGold(
          characterId,
          amount,
          TransactionSource.BRIBE,
          {
            npcId,
            description: `Bribed NPC for information`,
          },
          session
        );

        // Increase criminal reputation
        character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 2);
        await character.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} successfully bribed NPC ${npcId}`);

        return {
          success: true,
          goldSpent: amount,
          message: 'The NPC glances around nervously and leans in close...',
          newCriminalRep: character.criminalReputation,
        };
      } else {
        // Failed bribe - still lose some gold
        const lostAmount = Math.floor(amount / 2);
        if (lostAmount > 0) {
          const { GoldService } = await import('./gold.service');
          await GoldService.deductGold(
            characterId,
            lostAmount,
            TransactionSource.BRIBE,
            {
              npcId,
              description: `Failed bribe attempt`,
            },
            session
          );
        }

        await session.commitTransaction();
        session.endSession();

        return {
          success: false,
          goldSpent: lostAmount,
          message: `"How dare you! Get out of my sight!" You lost ${lostAmount} gold.`,
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
