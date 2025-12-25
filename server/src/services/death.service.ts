/**
 * Death Service
 *
 * Handles player death, penalties, and respawn mechanics
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { Location } from '../models/Location.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import deityDreamService from './deityDream.service';
import {
  DeathType,
  DeathPenalty,
  DEATH_PENALTIES,
  RESPAWN_DELAYS,
  DeathStats
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Death record stored in character metadata
 */
interface DeathRecord {
  deathType: DeathType;
  goldLost: number;
  xpLost: number;
  itemsLost: string[];
  location: string;
  timestamp: Date;
}

export class DeathService {
  /**
   * Handle character death
   * Applies penalties, records death, and prepares for respawn
   */
  static async handleDeath(
    characterId: string | mongoose.Types.ObjectId,
    deathType: DeathType,
    session?: mongoose.ClientSession
  ): Promise<DeathPenalty> {
    const useSession = session || null;
    const isExternalSession = !!session;
    const internalSession = !isExternalSession ? await mongoose.startSession() : null;

    try {
      if (internalSession) {
        await internalSession.startTransaction();
      }

      const activeSession = useSession || internalSession;

      // Fetch character
      const characterQuery = Character.findById(characterId);
      const character = activeSession
        ? await characterQuery.session(activeSession)
        : await characterQuery;

      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate penalties
      const penalty = await this.calculatePenalties(character, deathType, activeSession);

      // Apply penalties
      await this.applyPenalties(character, penalty, activeSession);

      // Record death statistics
      await this.recordDeath(character, deathType, penalty, activeSession);

      // Save character
      await character.save(activeSession ? { session: activeSession } : undefined);

      if (internalSession) {
        await internalSession.commitTransaction();
      }

      logger.info(
        `Death processed: ${character.name} died (${deathType}). ` +
        `Lost ${penalty.goldLost} gold, ${penalty.xpLost} XP, ${penalty.itemsDropped.length} items`
      );

      return penalty;
    } catch (error) {
      if (internalSession) {
        await internalSession.abortTransaction();
      }
      logger.error('Error handling death:', error);
      throw error;
    } finally {
      if (internalSession) {
        internalSession.endSession();
      }
    }
  }

  /**
   * Calculate death penalties based on character state and death type
   */
  static async calculatePenalties(
    character: ICharacter,
    deathType: DeathType,
    session?: mongoose.ClientSession
  ): Promise<DeathPenalty> {
    const penalties = DEATH_PENALTIES[deathType];

    // Calculate dollars loss
    const characterBalance = character.dollars ?? character.gold ?? 0;
    const goldLost = Math.floor(characterBalance * penalties.goldLoss);

    // Calculate XP loss
    const xpLost = Math.floor(character.experience * penalties.xpLoss);

    // Calculate item drops
    const itemsDropped: string[] = [];
    for (const item of character.inventory) {
      // Each item has a chance to be dropped
      if (SecureRNG.chance(penalties.itemDropChance)) {
        // Drop a percentage of the stack (1-3 items or 10-30% of stack)
        const dropCount = Math.max(
          1,
          Math.min(
            Math.ceil(item.quantity * (0.1 + SecureRNG.float(0, 1) * 0.2)),
            3
          )
        );

        for (let i = 0; i < dropCount && i < item.quantity; i++) {
          itemsDropped.push(item.itemId);
        }
      }
    }

    // Determine respawn location (nearest safe town)
    const respawnLocation = await this.getRespawnLocation(
      character.currentLocation,
      session
    );

    // Get respawn delay
    const respawnDelay = RESPAWN_DELAYS[deathType];

    return {
      goldLost,
      itemsDropped,
      xpLost,
      respawnLocation,
      respawnDelay,
      deathType,
      respawned: true
    };
  }

  /**
   * Apply death penalties to character
   */
  private static async applyPenalties(
    character: ICharacter,
    penalty: DeathPenalty,
    session?: mongoose.ClientSession
  ): Promise<void> {
    // Deduct dollars
    if (penalty.goldLost > 0) {
      await DollarService.deductDollars(
        character._id as string,
        penalty.goldLost,
        TransactionSource.COMBAT_DEATH,
        {
          deathType: penalty.deathType,
          description: `Lost ${penalty.goldLost} dollars from ${penalty.deathType} death`,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );
    }

    // Deduct XP
    if (penalty.xpLost > 0) {
      character.experience = Math.max(0, character.experience - penalty.xpLost);
    }

    // Remove dropped items
    for (const itemId of penalty.itemsDropped) {
      const item = character.inventory.find(i => i.itemId === itemId);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          character.inventory = character.inventory.filter(i => i.itemId !== itemId);
        }
      }
    }

    // Move to respawn location
    character.currentLocation = penalty.respawnLocation;

    // If death by execution, clear wanted level and bounty
    if (penalty.deathType === DeathType.EXECUTION) {
      character.wantedLevel = 0;
      character.bountyAmount = 0;
      logger.info(`Execution cleared wanted level and bounty for ${character.name}`);
    }
  }

  /**
   * Get nearest safe respawn location
   */
  private static async getRespawnLocation(
    currentLocationId: string,
    session?: mongoose.ClientSession
  ): Promise<string> {
    try {
      const locationQuery = Location.findById(currentLocationId);
      const currentLocation = session
        ? await locationQuery.session(session)
        : await locationQuery;

      if (!currentLocation) {
        // Default to starting location if current location not found
        return 'perdition';
      }

      // Find nearest safe town in same region
      const safeLocationsQuery = Location.find({
        region: currentLocation.region,
        type: { $in: ['town', 'city'] },
        isActive: true
      });

      const safeLocations = session
        ? await safeLocationsQuery.session(session)
        : await safeLocationsQuery;

      if (safeLocations.length > 0) {
        // Return first safe location in region
        return safeLocations[0]._id.toString();
      }

      // Fallback to default starting locations by region
      const regionDefaults: Record<string, string> = {
        'sangre': 'perdition',
        'frontera': 'redstone-pass',
        'nahi': 'ironwood-basin'
      };

      return regionDefaults[currentLocation.region] || 'perdition';
    } catch (error) {
      logger.error('Error finding respawn location:', error);
      return 'perdition'; // Ultimate fallback
    }
  }

  /**
   * Record death in character's history
   * AAA BALANCE: All deaths now tracked for visibility and stakes
   */
  private static async recordDeath(
    character: ICharacter,
    deathType: DeathType,
    penalty: DeathPenalty,
    _session?: mongoose.ClientSession
  ): Promise<void> {
    // Initialize combat stats if missing
    if (!character.combatStats) {
      character.combatStats = {
        wins: 0,
        losses: 0,
        totalDamage: 0,
        kills: 0,
        totalDeaths: 0
      };
    }

    // Always increment total deaths counter (all death types)
    character.combatStats.totalDeaths = (character.combatStats.totalDeaths || 0) + 1;

    // Also track combat-related deaths in losses
    if (deathType === DeathType.COMBAT || deathType === DeathType.DUEL || deathType === DeathType.PVP) {
      character.combatStats.losses += 1;
    }

    logger.info(
      `Death recorded for ${character.name}: ` +
      `Type: ${deathType}, Total Deaths: ${character.combatStats.totalDeaths}, ` +
      `Gold Lost: ${penalty.goldLost}, XP Lost: ${penalty.xpLost}`
    );
  }

  /**
   * Respawn player at specified location
   * This is called after respawn delay expires
   *
   * During the moment between death and life, the character may receive
   * divine visions from The Gambler or Outlaw King - especially if they
   * have drawn significant deity attention through their actions.
   */
  static async respawnPlayer(
    characterId: string | mongoose.Types.ObjectId,
    respawnLocation: string
  ): Promise<{ character: ICharacter; dream: any | null }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Move to respawn location
    character.currentLocation = respawnLocation;

    // Restore some energy on respawn (50%)
    character.energy = Math.floor(character.maxEnergy * 0.5);
    character.lastEnergyUpdate = new Date();

    await character.save();

    // Check for divine dreams during the "between life and death" moment
    // Death provides a heightened chance for divine visions
    let dream = null;
    try {
      dream = await deityDreamService.checkForDream(
        characterId.toString(),
        'death' // Special rest type for death - higher dream chance
      );

      if (dream) {
        logger.info(`Character ${character.name} received a death vision from ${dream.deity}`);
      }
    } catch (error) {
      // Don't fail respawn if dream check fails
      logger.error('Error checking for death dream:', error);
    }

    logger.info(`Player ${character.name} respawned at ${respawnLocation}`);

    return { character, dream };
  }

  /**
   * Get death statistics for a character
   * AAA BALANCE: Now returns actual totalDeaths from new tracking field
   */
  static async getDeathHistory(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<DeathStats> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Return actual death count from combatStats
    const stats: DeathStats = {
      totalDeaths: character.combatStats?.totalDeaths || 0,
      deathsByCombat: character.combatStats?.losses || 0,
      deathsByEnvironmental: 0, // Would need detailed tracking
      deathsByExecution: 0,
      deathsByDuel: 0,
      deathsByPVP: 0,
      totalGoldLost: 0, // Would need to track this
      totalXPLost: 0, // Would need to track this
      totalItemsLost: 0 // Would need to track this
    };

    return stats;
  }

  /**
   * Check if death should result in jail instead
   * This happens when killed by lawful NPCs/players with active bounty
   */
  static async shouldSendToJail(
    character: ICharacter,
    killerType: 'lawful_npc' | 'lawful_player' | 'outlaw'
  ): Promise<boolean> {
    // Only lawful entities can send to jail
    if (killerType === 'outlaw') {
      return false;
    }

    // Character must have wanted level 3+ to be jailed
    return character.wantedLevel >= 3;
  }

  /**
   * Calculate jail sentence based on wanted level
   */
  static calculateJailSentence(wantedLevel: number): number {
    // Base sentence: 10 minutes per wanted level
    const baseSentence = wantedLevel * 10;

    // Add some randomness (±20%)
    const variance = baseSentence * 0.2;
    const sentence = baseSentence + (SecureRNG.float(0, 1) * variance * 2 - variance);

    return Math.max(5, Math.floor(sentence)); // Minimum 5 minutes
  }
}
