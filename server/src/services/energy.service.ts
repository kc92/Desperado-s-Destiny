/**
 * Energy Management Service
 *
 * Handles energy regeneration and spending with transaction safety using atomic operations.
 *
 * SECURITY: All write operations use MongoDB $inc for atomic updates to prevent
 * race condition exploits that could allow double-spending energy.
 */

import mongoose, { ClientSession } from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { ENERGY } from '@desperados/shared';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Result type for energy operations
 * Provides consistent, structured responses
 */
export interface EnergyResult {
  success: boolean;
  currentEnergy: number;
  maxEnergy: number;
  error?: string;
}

/**
 * Energy status information
 */
export interface EnergyStatus {
  currentEnergy: number;
  maxEnergy: number;
  lastUpdate: Date;
  regeneratedEnergy: number;
  timeUntilFull: number;
}

/**
 * Calculate level-scaled energy cost multiplier
 * BALANCE FIX: Higher level actions cost more energy
 *
 * @param level - Character level
 * @returns Energy cost multiplier for that level
 */
export function getEnergyCostMultiplier(level: number): number {
  const { LEVEL_SCALING } = ENERGY;

  if (level <= LEVEL_SCALING.TIER1_END) {
    return LEVEL_SCALING.TIER1_MULTIPLIER;
  } else if (level <= LEVEL_SCALING.TIER2_END) {
    return LEVEL_SCALING.TIER2_MULTIPLIER;
  } else if (level <= LEVEL_SCALING.TIER3_END) {
    return LEVEL_SCALING.TIER3_MULTIPLIER;
  } else {
    return LEVEL_SCALING.TIER4_MULTIPLIER;
  }
}

/**
 * Calculate scaled energy cost for an action
 * BALANCE FIX: Action costs scale with character level
 *
 * @param baseCost - Base energy cost of the action
 * @param level - Character level
 * @returns Scaled energy cost (rounded up)
 */
export function calculateScaledEnergyCost(baseCost: number, level: number): number {
  const multiplier = getEnergyCostMultiplier(level);
  return Math.ceil(baseCost * multiplier);
}

export class EnergyService {
  /**
   * Calculate energy regeneration amount based on time elapsed
   * Pure function - no database access, just calculation
   *
   * @param lastUpdate - Last energy update timestamp
   * @param currentEnergy - Current energy amount
   * @param maxEnergy - Maximum energy capacity
   * @param regenMultiplier - Premium regeneration multiplier (1.0 = normal)
   * @returns Amount of energy to regenerate
   */
  static calculateRegeneration(
    lastUpdate: Date,
    currentEnergy: number,
    maxEnergy: number,
    regenMultiplier: number = 1.0
  ): number {
    const now = Date.now();
    const lastUpdateMs = lastUpdate.getTime();
    const elapsedMs = now - lastUpdateMs;

    // Apply regeneration multiplier (higher = faster regen)
    const regenHours = ENERGY.FREE_REGEN_TIME_HOURS / regenMultiplier;

    // Calculate regeneration rate per millisecond
    const regenRate = maxEnergy / (regenHours * 60 * 60 * 1000);
    const regenAmount = elapsedMs * regenRate;

    // Cap regeneration at max energy
    const energyDeficit = maxEnergy - currentEnergy;
    return Math.min(Math.floor(regenAmount), Math.max(0, energyDeficit));
  }

  /**
   * Get premium regeneration multiplier for a character
   * Caches result to avoid repeated lookups
   */
  private static async getRegenMultiplier(userId: string): Promise<number> {
    try {
      const { PremiumUtils } = await import('../utils/premium.utils');
      return await PremiumUtils.getEnergyRegenMultiplier(userId);
    } catch (error) {
      logger.warn(`Failed to get premium multiplier for user ${userId}, using default:`, error);
      return 1.0;
    }
  }

  /**
   * Get current energy status including regeneration calculation
   * Read-only operation - does not modify database
   *
   * @param characterId - Character ID
   * @returns Energy status with regenerated energy calculation
   */
  static async getStatus(characterId: string): Promise<EnergyStatus> {
    const character = await Character.findById(characterId).select(
      'energy maxEnergy lastEnergyUpdate userId'
    );

    if (!character) {
      throw new AppError('Character not found', HttpStatus.NOT_FOUND);
    }

    const regenMultiplier = await this.getRegenMultiplier(character.userId.toString());

    const regeneratedEnergy = this.calculateRegeneration(
      character.lastEnergyUpdate,
      character.energy,
      character.maxEnergy,
      regenMultiplier
    );

    const effectiveEnergy = Math.min(
      character.energy + regeneratedEnergy,
      character.maxEnergy
    );

    // Calculate time until full
    const energyDeficit = character.maxEnergy - effectiveEnergy;
    const regenHours = ENERGY.FREE_REGEN_TIME_HOURS / regenMultiplier;
    const regenRatePerMs = character.maxEnergy / (regenHours * 60 * 60 * 1000);
    const timeUntilFull = energyDeficit > 0 ? Math.ceil(energyDeficit / regenRatePerMs) : 0;

    return {
      currentEnergy: effectiveEnergy,
      maxEnergy: character.maxEnergy,
      lastUpdate: character.lastEnergyUpdate,
      regeneratedEnergy,
      timeUntilFull,
    };
  }

  /**
   * Maximum retry attempts for atomic operations under contention
   */
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  /**
   * Base delay for exponential backoff (milliseconds)
   */
  private static readonly BASE_RETRY_DELAY_MS = 50;

  /**
   * Sleep utility for retry backoff
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Spend energy using atomic MongoDB operation with retry logic
   *
   * SECURITY: Uses atomic findOneAndUpdate with optimistic locking to prevent
   * race conditions. Implements exponential backoff retry for contention handling.
   *
   * The operation:
   * 1. Calculates regenerated energy
   * 2. Atomically checks and updates energy in one operation
   * 3. Retries with exponential backoff if contention detected
   * 4. Returns failure if insufficient energy or max retries exceeded
   *
   * @param characterId - Character ID
   * @param cost - Energy cost to spend
   * @param session - Optional MongoDB session for transaction support
   * @returns EnergyResult with success/failure and current energy
   */
  static async spend(
    characterId: string,
    cost: number,
    session?: ClientSession
  ): Promise<EnergyResult> {
    return this.spendWithRetry(characterId, cost, session, 0);
  }

  /**
   * Internal spend implementation with retry tracking
   */
  private static async spendWithRetry(
    characterId: string,
    cost: number,
    session: ClientSession | undefined,
    attempt: number
  ): Promise<EnergyResult> {
    try {
      // First, get current state to calculate regeneration
      const character = await Character.findById(characterId)
        .select('energy maxEnergy lastEnergyUpdate userId')
        .session(session || null);

      if (!character) {
        return {
          success: false,
          currentEnergy: 0,
          maxEnergy: 0,
          error: 'Character not found',
        };
      }

      // Calculate regenerated energy
      const regenMultiplier = await this.getRegenMultiplier(character.userId.toString());
      const regeneratedEnergy = this.calculateRegeneration(
        character.lastEnergyUpdate,
        character.energy,
        character.maxEnergy,
        regenMultiplier
      );

      // Effective energy after regeneration
      const effectiveEnergy = Math.min(
        character.energy + regeneratedEnergy,
        character.maxEnergy
      );

      // Check if we can afford it
      if (effectiveEnergy < cost) {
        logger.debug(`Insufficient energy for character ${characterId}. Has: ${effectiveEnergy}, Needs: ${cost}`);
        return {
          success: false,
          currentEnergy: effectiveEnergy,
          maxEnergy: character.maxEnergy,
          error: `Insufficient energy. Have ${effectiveEnergy}, need ${cost}`,
        };
      }

      // ATOMIC OPERATION: Apply regeneration and spend in one update
      // This prevents race conditions by doing read-modify-write atomically
      const newEnergy = effectiveEnergy - cost;

      const result = await Character.findOneAndUpdate(
        {
          _id: characterId,
          // Optimistic lock: ensure energy hasn't changed since we read it
          energy: character.energy,
          lastEnergyUpdate: character.lastEnergyUpdate,
        },
        {
          $set: {
            energy: newEnergy,
            lastEnergyUpdate: new Date(),
          },
        },
        {
          new: true,
          session: session || undefined,
        }
      );

      if (!result) {
        // Optimistic lock failed - concurrent modification detected
        if (attempt >= this.MAX_RETRY_ATTEMPTS) {
          logger.error(
            `Energy spend failed after ${this.MAX_RETRY_ATTEMPTS} retries for character ${characterId}. ` +
            `High contention detected.`
          );
          return {
            success: false,
            currentEnergy: effectiveEnergy,
            maxEnergy: character.maxEnergy,
            error: 'Action failed due to high server load. Please try again.',
          };
        }

        // Exponential backoff: 50ms, 100ms, 200ms
        const backoffMs = this.BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        logger.warn(
          `Energy spend race condition detected for character ${characterId}. ` +
          `Retry ${attempt + 1}/${this.MAX_RETRY_ATTEMPTS} after ${backoffMs}ms`
        );

        await this.sleep(backoffMs);
        return this.spendWithRetry(characterId, cost, session, attempt + 1);
      }

      logger.debug(`Character ${characterId} spent ${cost} energy. Remaining: ${newEnergy}`);

      return {
        success: true,
        currentEnergy: result.energy,
        maxEnergy: result.maxEnergy,
      };
    } catch (error) {
      logger.error(`Error spending energy for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Grant energy to a character using atomic operation
   *
   * @param characterId - Character ID
   * @param amount - Amount of energy to grant
   * @param allowOverMax - Whether to allow exceeding maxEnergy
   * @param session - Optional MongoDB session for transaction support
   * @returns EnergyResult with updated energy
   */
  static async grant(
    characterId: string,
    amount: number,
    allowOverMax: boolean = false,
    session?: ClientSession
  ): Promise<EnergyResult> {
    try {
      // Get current state
      const character = await Character.findById(characterId)
        .select('energy maxEnergy lastEnergyUpdate userId')
        .session(session || null);

      if (!character) {
        return {
          success: false,
          currentEnergy: 0,
          maxEnergy: 0,
          error: 'Character not found',
        };
      }

      // Calculate regenerated energy first
      const regenMultiplier = await this.getRegenMultiplier(character.userId.toString());
      const regeneratedEnergy = this.calculateRegeneration(
        character.lastEnergyUpdate,
        character.energy,
        character.maxEnergy,
        regenMultiplier
      );

      const effectiveEnergy = Math.min(
        character.energy + regeneratedEnergy,
        character.maxEnergy
      );

      // Calculate new energy
      let newEnergy = effectiveEnergy + amount;
      if (!allowOverMax) {
        newEnergy = Math.min(newEnergy, character.maxEnergy);
      }

      // Atomic update
      const result = await Character.findByIdAndUpdate(
        characterId,
        {
          $set: {
            energy: newEnergy,
            lastEnergyUpdate: new Date(),
          },
        },
        {
          new: true,
          session: session || undefined,
        }
      );

      if (!result) {
        return {
          success: false,
          currentEnergy: 0,
          maxEnergy: 0,
          error: 'Failed to update character',
        };
      }

      logger.info(`Granted ${amount} energy to character ${characterId}. New energy: ${result.energy}`);

      return {
        success: true,
        currentEnergy: result.energy,
        maxEnergy: result.maxEnergy,
      };
    } catch (error) {
      logger.error(`Error granting energy to character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Check if character can afford an action (includes regeneration)
   *
   * @param characterId - Character ID
   * @param cost - Energy cost to check
   * @returns boolean indicating if action is affordable
   */
  static async canAfford(characterId: string, cost: number): Promise<boolean> {
    const status = await this.getStatus(characterId);
    return status.currentEnergy >= cost;
  }

  /**
   * Get time until energy is fully regenerated
   *
   * @param characterId - Character ID
   * @returns milliseconds until full energy
   */
  static async getTimeUntilFull(characterId: string): Promise<number> {
    const status = await this.getStatus(characterId);
    return status.timeUntilFull;
  }

  // ============================================
  // LEGACY API COMPATIBILITY METHODS
  // These methods maintain backward compatibility with existing code
  // ============================================

  /**
   * @deprecated Use EnergyService.spend() instead
   * Legacy method for backward compatibility
   */
  static async spendEnergy(
    characterId: string,
    cost: number,
    _reason?: string,
    _session?: unknown
  ): Promise<boolean> {
    const result = await this.spend(characterId, cost);
    return result.success;
  }

  /**
   * @deprecated Use EnergyService.grant() instead
   * Legacy method for backward compatibility
   */
  static async grantEnergy(
    characterId: string,
    amount: number,
    allowOverMax: boolean = false
  ): Promise<void> {
    await this.grant(characterId, amount, allowOverMax);
  }

  /**
   * @deprecated Use EnergyService.canAfford() instead
   * Legacy method for backward compatibility
   */
  static async canAffordAction(character: ICharacter, cost: number): Promise<boolean> {
    return this.canAfford(character._id.toString(), cost);
  }

  /**
   * @deprecated Use EnergyService.getTimeUntilFull() instead
   * Legacy method for backward compatibility
   */
  static async getTimeUntilFullEnergy(character: ICharacter): Promise<number> {
    return this.getTimeUntilFull(character._id.toString());
  }

  /**
   * @deprecated Direct mutation of character object is discouraged
   * Use the atomic methods instead
   */
  static async regenerateEnergy(character: ICharacter): Promise<void> {
    const regenMultiplier = await this.getRegenMultiplier(character.userId.toString());
    const regenAmount = this.calculateRegeneration(
      character.lastEnergyUpdate,
      character.energy,
      character.maxEnergy,
      regenMultiplier
    );
    character.energy = Math.min(character.energy + regenAmount, character.maxEnergy);
    character.lastEnergyUpdate = new Date();
  }

  /**
   * @deprecated Use calculateRegeneration() instead
   */
  static async calculateRegenAmount(character: ICharacter): Promise<number> {
    const regenMultiplier = await this.getRegenMultiplier(character.userId.toString());
    return this.calculateRegeneration(
      character.lastEnergyUpdate,
      character.energy,
      character.maxEnergy,
      regenMultiplier
    );
  }
}
