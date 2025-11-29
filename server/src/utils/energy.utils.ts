/**
 * Energy Validation Utilities
 *
 * Utilities for calculating energy, regeneration, and time estimates
 */

import { ICharacter } from '../models/Character.model';
import { ENERGY } from '@desperados/shared';

/**
 * Calculate current energy for a character with regeneration applied
 * Does not modify the character object
 *
 * @param character - The character document
 * @param isPremium - Whether the character's user has premium subscription
 * @returns Current energy after regeneration
 */
export function calculateCurrentEnergy(
  character: ICharacter,
  isPremium: boolean = false
): number {
  const now = Date.now();
  const lastUpdate = character.lastEnergyUpdate.getTime();
  const elapsedMs = now - lastUpdate;

  // Determine regeneration rate based on premium status
  const regenPerHour = isPremium ? ENERGY.PREMIUM_REGEN_PER_HOUR : ENERGY.FREE_REGEN_PER_HOUR;
  const maxEnergy = isPremium ? ENERGY.PREMIUM_MAX : ENERGY.FREE_MAX;

  // Calculate regeneration rate per millisecond
  const regenPerMs = regenPerHour / (60 * 60 * 1000);
  const regenAmount = elapsedMs * regenPerMs;

  // Cap at max energy
  const currentEnergy = Math.min(character.energy + regenAmount, maxEnergy);

  return Math.floor(currentEnergy);
}

/**
 * Calculate time in milliseconds until character reaches target energy
 *
 * @param character - The character document
 * @param targetEnergy - The target energy amount
 * @param isPremium - Whether the character's user has premium subscription
 * @returns Milliseconds until target energy is reached (0 if already at or above target)
 */
export function getTimeUntilEnergy(
  character: ICharacter,
  targetEnergy: number,
  isPremium: boolean = false
): number {
  const currentEnergy = calculateCurrentEnergy(character, isPremium);

  if (currentEnergy >= targetEnergy) {
    return 0;
  }

  const energyNeeded = targetEnergy - currentEnergy;
  const regenPerHour = isPremium ? ENERGY.PREMIUM_REGEN_PER_HOUR : ENERGY.FREE_REGEN_PER_HOUR;
  const regenPerMs = regenPerHour / (60 * 60 * 1000);

  return Math.ceil(energyNeeded / regenPerMs);
}

/**
 * Calculate time in milliseconds until character reaches max energy
 *
 * @param character - The character document
 * @param isPremium - Whether the character's user has premium subscription
 * @returns Milliseconds until max energy is reached (0 if already at max)
 */
export function getTimeUntilFullEnergy(
  character: ICharacter,
  isPremium: boolean = false
): number {
  const maxEnergy = isPremium ? ENERGY.PREMIUM_MAX : ENERGY.FREE_MAX;
  return getTimeUntilEnergy(character, maxEnergy, isPremium);
}

/**
 * Format milliseconds into a human-readable time string
 *
 * @param ms - Milliseconds to format
 * @returns Formatted string (e.g., "2h 15m", "45m", "12s")
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {
    return 'Ready now';
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0 && minutes < 5) {
      // Only show seconds if less than 5 minutes
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Validate if character can afford an energy spend
 *
 * @param character - The character document
 * @param cost - Energy cost to validate
 * @param isPremium - Whether the character's user has premium subscription
 * @returns true if character has sufficient energy
 */
export function validateEnergySpend(
  character: ICharacter,
  cost: number,
  isPremium: boolean = false
): boolean {
  const currentEnergy = calculateCurrentEnergy(character, isPremium);
  return currentEnergy >= cost;
}

/**
 * Get energy regeneration rate per hour
 *
 * @param isPremium - Whether the user has premium subscription
 * @returns Energy regenerated per hour
 */
export function getEnergyRegenRate(isPremium: boolean = false): number {
  return isPremium ? ENERGY.PREMIUM_REGEN_PER_HOUR : ENERGY.FREE_REGEN_PER_HOUR;
}

/**
 * Get maximum energy capacity
 *
 * @param isPremium - Whether the user has premium subscription
 * @returns Maximum energy capacity
 */
export function getMaxEnergy(isPremium: boolean = false): number {
  return isPremium ? ENERGY.PREMIUM_MAX : ENERGY.FREE_MAX;
}

/**
 * Calculate energy deficit for error messages
 *
 * @param character - The character document
 * @param cost - Energy cost of action
 * @param isPremium - Whether the character's user has premium subscription
 * @returns Object with current, required, and deficit amounts
 */
export function calculateEnergyDeficit(
  character: ICharacter,
  cost: number,
  isPremium: boolean = false
): {
  current: number;
  required: number;
  deficit: number;
} {
  const current = calculateCurrentEnergy(character, isPremium);
  const deficit = Math.max(0, cost - current);

  return {
    current,
    required: cost,
    deficit,
  };
}
