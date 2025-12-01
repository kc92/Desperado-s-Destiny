/**
 * Energy Management Service
 *
 * Handles energy regeneration and spending with transaction safety
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { ENERGY } from '@desperados/shared';
import logger from '../utils/logger';

export class EnergyService {
  /**
   * Calculate energy regeneration amount for a character
   */
  static calculateRegenAmount(character: ICharacter): number {
    const now = Date.now();
    const lastUpdate = character.lastEnergyUpdate.getTime();
    const elapsedMs = now - lastUpdate;

    // Determine regeneration rate based on subscription status
    // TODO: Check user's premium status when user model supports it
    const regenHours = ENERGY.FREE_REGEN_TIME_HOURS;
    const maxEnergy = character.maxEnergy;

    // Calculate regeneration rate per millisecond
    const regenRate = maxEnergy / (regenHours * 60 * 60 * 1000);
    const regenAmount = elapsedMs * regenRate;

    // Cap regeneration at max energy
    return Math.min(regenAmount, maxEnergy - character.energy);
  }

  /**
   * Regenerate energy for a character
   * Updates the character's energy and lastEnergyUpdate timestamp
   */
  static regenerateEnergy(character: ICharacter): void {
    const regenAmount = this.calculateRegenAmount(character);
    character.energy = Math.min(character.energy + regenAmount, character.maxEnergy);
    character.lastEnergyUpdate = new Date();
  }

  /**
   * Spend energy with transaction safety to prevent race conditions
   *
   * @param characterId - The character's ID
   * @param cost - Amount of energy to spend
   * @returns Promise<boolean> - true if energy was spent successfully, false if insufficient
   * @throws Error if transaction fails
   */
  static async spendEnergy(characterId: string, cost: number): Promise<boolean> {
    try {
      // Find character
      const character = await Character.findById(characterId);

      if (!character) {
        throw new Error('Character not found');
      }

      // Regenerate energy before checking
      this.regenerateEnergy(character);

      // Check if character has enough energy
      if (character.energy < cost) {
        return false;
      }

      // Spend energy
      character.energy -= cost;
      character.lastEnergyUpdate = new Date();

      // Save character
      await character.save();

      logger.debug(`Character ${characterId} spent ${cost} energy. Remaining: ${character.energy}`);
      return true;
    } catch (error) {
      logger.error('Error spending energy:', error);
      throw error;
    }
  }

  /**
   * Get time until energy is fully regenerated
   *
   * @param character - The character
   * @returns milliseconds until full energy
   */
  static getTimeUntilFullEnergy(character: ICharacter): number {
    if (character.energy >= character.maxEnergy) {
      return 0;
    }

    const energyNeeded = character.maxEnergy - character.energy;
    const regenHours = ENERGY.FREE_REGEN_TIME_HOURS; // TODO: Check premium status
    const regenRatePerMs = character.maxEnergy / (regenHours * 60 * 60 * 1000);

    return Math.ceil(energyNeeded / regenRatePerMs);
  }

  /**
   * Check if character can afford an action
   *
   * @param character - The character
   * @param cost - Energy cost of the action
   * @returns boolean
   */
  static canAffordAction(character: ICharacter, cost: number): boolean {
    // First regenerate energy
    this.regenerateEnergy(character);
    return character.energy >= cost;
  }

  /**
   * Grant energy to a character (e.g., from premium subscription or items)
   *
   * @param characterId - The character's ID
   * @param amount - Amount of energy to grant
   * @param allowOverMax - Whether to allow energy to exceed maxEnergy
   */
  static async grantEnergy(
    characterId: string,
    amount: number,
    allowOverMax: boolean = false
  ): Promise<void> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw new Error('Character not found');
    }

    // Regenerate energy first
    this.regenerateEnergy(character);

    // Add energy
    if (allowOverMax) {
      character.energy += amount;
    } else {
      character.energy = Math.min(character.energy + amount, character.maxEnergy);
    }

    character.lastEnergyUpdate = new Date();
    await character.save();

    logger.info(`Granted ${amount} energy to character ${characterId}. New energy: ${character.energy}`);
  }
}
