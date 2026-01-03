/**
 * Wager System
 * Wager configuration and validation
 */

import { WagerConfig } from '../types';
import { WAGER_TIERS } from '../constants';

/**
 * Get wager configuration for a tier
 */
export function getWagerConfig(tier: string): WagerConfig {
  return WAGER_TIERS[tier] || WAGER_TIERS.low;
}

/**
 * Validate and calculate wager for a game
 * @returns Validated wager amount and multiplier, or null if invalid
 */
export function calculateWager(
  requestedAmount: number,
  tier: string,
  characterLevel: number,
  characterGold: number
): { amount: number; multiplier: number; tier: string } | null {
  const config = getWagerConfig(tier);

  // Check unlock level
  if (characterLevel < config.unlockLevel) {
    return null;
  }

  // Check if player can afford
  if (characterGold < requestedAmount) {
    return null;
  }

  // Clamp to valid range
  const amount = Math.max(config.minAmount, Math.min(config.maxAmount, requestedAmount));

  return {
    amount,
    multiplier: config.multiplier,
    tier: config.tier
  };
}
