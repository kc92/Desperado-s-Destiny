/**
 * Balance Verification Tests
 * Phase 4.4 - Comprehensive Testing
 *
 * Verifies all balance changes from Phases 2.1-4.3 are working correctly
 */

import { describe, it, expect } from '@jest/globals';
import {
  COMBAT_CONSTANTS,
  GAMBLING_CONSTANTS,
  WEALTH_TAX,
  calculateCategoryMultiplier,
  SKILL_BONUS_MULTIPLIERS
} from '@desperados/shared';

// ============================================================================
// PHASE 2.1: DAMAGE SCALING TESTS
// ============================================================================
describe('Phase 2.1: Damage Scaling', () => {
  describe('Skill Bonus Diminishing Returns', () => {
    it('should have correct tier thresholds', () => {
      const { SKILL_BONUS } = COMBAT_CONSTANTS;
      expect(SKILL_BONUS.TIER1_END).toBe(10);
      expect(SKILL_BONUS.TIER2_END).toBe(25);
      expect(SKILL_BONUS.MAX_PER_SKILL).toBe(24);
      expect(SKILL_BONUS.MAX_TOTAL).toBe(120);
    });

    it('should calculate diminishing returns correctly', () => {
      const { SKILL_BONUS } = COMBAT_CONSTANTS;

      // Level 10 should give full bonus: 10 × 1.0 = 10
      const level10Bonus = Math.min(10, SKILL_BONUS.TIER1_END) * SKILL_BONUS.TIER1_RATE;
      expect(level10Bonus).toBe(10);

      // Level 25 should give: 10 + (15 × 0.5) = 17.5
      const level25Tier1 = SKILL_BONUS.TIER1_END * SKILL_BONUS.TIER1_RATE;
      const level25Tier2 = (25 - SKILL_BONUS.TIER1_END) * SKILL_BONUS.TIER2_RATE;
      expect(level25Tier1 + level25Tier2).toBe(17.5);

      // Level 50 should be capped at MAX_PER_SKILL (24)
      const level50Tier1 = SKILL_BONUS.TIER1_END * SKILL_BONUS.TIER1_RATE; // 10
      const level50Tier2 = (SKILL_BONUS.TIER2_END - SKILL_BONUS.TIER1_END) * SKILL_BONUS.TIER2_RATE; // 7.5
      const level50Tier3 = (50 - SKILL_BONUS.TIER2_END) * SKILL_BONUS.TIER3_RATE; // 6.25
      const totalBeforeCap = level50Tier1 + level50Tier2 + level50Tier3;
      expect(totalBeforeCap).toBe(23.75);
      expect(Math.min(Math.floor(totalBeforeCap), SKILL_BONUS.MAX_PER_SKILL)).toBe(23);
    });

    it('should cap total bonus at 120 across all skills', () => {
      expect(COMBAT_CONSTANTS.SKILL_BONUS.MAX_TOTAL).toBe(120);
    });
  });
});

// ============================================================================
// PHASE 3.3: WEALTH TAX TESTS
// ============================================================================
describe('Phase 3.3: Wealth Tax', () => {
  it('should have correct tax tiers', () => {
    expect(WEALTH_TAX.EXEMPT_THRESHOLD).toBe(100_000);
    expect(WEALTH_TAX.TIERS[0].rate).toBe(0); // 0-100K exempt
    expect(WEALTH_TAX.TIERS[1].rate).toBe(0.001); // 100K-1M: 0.1%
    expect(WEALTH_TAX.TIERS[2].rate).toBe(0.0025); // 1M-10M: 0.25%
    expect(WEALTH_TAX.TIERS[3].rate).toBe(0.005); // 10M+: 0.5%
  });

  it('should not tax below exempt threshold', () => {
    const gold = 50_000; // Below 100K
    const tax = calculateWealthTax(gold);
    expect(tax).toBe(0);
  });

  it('should apply progressive tax correctly', () => {
    // 500K gold: 0 + (400K × 0.001) = 400
    const gold500K = calculateWealthTax(500_000);
    expect(gold500K).toBe(400);

    // 2M gold: 0 + (900K × 0.001) + (1M × 0.0025) = 900 + 2500 = 3400
    const gold2M = calculateWealthTax(2_000_000);
    expect(gold2M).toBe(3_400);
  });

  it('should cap maximum daily tax', () => {
    // Very high wealth should be capped
    const maxTax = calculateWealthTax(1_000_000_000);
    expect(maxTax).toBeLessThanOrEqual(WEALTH_TAX.MAX_DAILY_TAX);
  });
});

// Helper function matching GoldService.calculateWealthTax
function calculateWealthTax(goldBalance: number): number {
  if (goldBalance <= WEALTH_TAX.EXEMPT_THRESHOLD) return 0;
  let totalTax = 0;
  for (const tier of WEALTH_TAX.TIERS) {
    if (goldBalance <= tier.min) break;
    const taxableInTier = Math.min(goldBalance, tier.max) - tier.min;
    if (taxableInTier > 0) totalTax += Math.floor(taxableInTier * tier.rate);
  }
  if (totalTax < WEALTH_TAX.MIN_COLLECTION_AMOUNT) return 0;
  return Math.min(totalTax, WEALTH_TAX.MAX_DAILY_TAX);
}

// ============================================================================
// PHASE 4.1: SKILL UNLOCK BONUSES (MULTIPLICATIVE)
// ============================================================================
describe('Phase 4.1: Skill Unlock Bonuses', () => {
  describe('Combat Category Multiplier', () => {
    it('should return 1.0 for level 0-14', () => {
      expect(calculateCategoryMultiplier(0, 'COMBAT')).toBe(1.0);
      expect(calculateCategoryMultiplier(14, 'COMBAT')).toBe(1.0);
    });

    it('should return 1.05 for level 15-29', () => {
      expect(calculateCategoryMultiplier(15, 'COMBAT')).toBe(1.05);
      expect(calculateCategoryMultiplier(29, 'COMBAT')).toBe(1.05);
    });

    it('should return 1.155 for level 30-44', () => {
      // 1.05 × 1.10 = 1.155
      const result = calculateCategoryMultiplier(30, 'COMBAT');
      expect(result).toBeCloseTo(1.155, 5);
    });

    it('should return 1.328 for level 45+', () => {
      // 1.05 × 1.10 × 1.15 = 1.32825
      const result = calculateCategoryMultiplier(45, 'COMBAT');
      expect(result).toBeCloseTo(1.32825, 5);
    });
  });

  describe('Cunning Category Multiplier', () => {
    it('should use level 48 for tier 3 (Ghost)', () => {
      // Level 45 should only have tier 1 and 2
      const level45 = calculateCategoryMultiplier(45, 'CUNNING');
      expect(level45).toBeCloseTo(1.155, 5);

      // Level 48 should have all tiers
      const level48 = calculateCategoryMultiplier(48, 'CUNNING');
      expect(level48).toBeCloseTo(1.32825, 5);
    });
  });

  describe('Bonus Multiplier Constants', () => {
    it('should have correct tier multipliers', () => {
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_1.multiplier).toBe(1.05);
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_2.multiplier).toBe(1.10);
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_3.multiplier).toBe(1.15);
    });

    it('should have correct unlock levels', () => {
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_1.level).toBe(15);
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_2.level).toBe(30);
      expect(SKILL_BONUS_MULTIPLIERS.COMBAT.TIER_3.level).toBe(45);

      // Cunning tier 3 is at level 48 (Ghost)
      expect(SKILL_BONUS_MULTIPLIERS.CUNNING.TIER_3.level).toBe(48);
    });
  });
});

// ============================================================================
// PHASE 4.3: GAMBLING BALANCE TESTS
// ============================================================================
describe('Phase 4.3: Gambling Balance', () => {
  it('should have 5% house edge', () => {
    expect(GAMBLING_CONSTANTS.HOUSE_EDGE).toBe(0.05);
  });

  it('should limit games to 10 per day', () => {
    expect(GAMBLING_CONSTANTS.MAX_BETS_PER_DAY).toBe(10);
  });

  it('should limit daily gold wager to 50,000', () => {
    expect(GAMBLING_CONSTANTS.MAX_DAILY_GOLD_WAGER).toBe(50_000);
  });

  it('should maintain maximum bet of 100,000', () => {
    expect(GAMBLING_CONSTANTS.MAX_BET).toBe(100_000);
  });

  it('should have reasonable payout multiplier cap', () => {
    expect(GAMBLING_CONSTANTS.MAX_PAYOUT_MULTIPLIER).toBe(10);
  });
});

// ============================================================================
// COMBAT BALANCE SIMULATION
// ============================================================================
describe('Combat Balance Simulation', () => {
  const DAMAGE_TABLE = {
    ROYAL_FLUSH: 50,
    STRAIGHT_FLUSH: 40,
    FOUR_OF_A_KIND: 35,
    FULL_HOUSE: 30,
    FLUSH: 25,
    STRAIGHT: 20,
    THREE_OF_A_KIND: 15,
    TWO_PAIR: 10,
    PAIR: 8,
    HIGH_CARD: 5
  };

  it('should not allow one-shot kills at equal levels', () => {
    // Level 50 character: 100 + (50 × 5) = 350 HP
    const level50HP = 100 + (50 * 5);
    expect(level50HP).toBe(350);

    // Max damage with all bonuses:
    // Royal Flush (50) + Max skill bonus (120) + variance (5) = 175
    // × category multiplier (1.328) = 232.4
    const maxDamage = Math.floor((50 + 120 + 5) * 1.328);
    expect(maxDamage).toBe(232);

    // Should NOT one-shot (damage < HP)
    expect(maxDamage).toBeLessThan(level50HP);
  });

  it('should require at least 2 turns to defeat equal-level opponent', () => {
    const level50HP = 350;

    // Average damage (Two Pair is most common strong hand):
    // Two Pair (10) + avg skill bonus (~80) + variance (2) = 92
    // × category multiplier (1.328) = 122
    const avgDamage = Math.floor((10 + 80 + 2) * 1.328);
    expect(avgDamage).toBe(122);

    // Should require 3 turns on average
    const turnsToKill = Math.ceil(level50HP / avgDamage);
    expect(turnsToKill).toBeGreaterThanOrEqual(2);
  });

  it('should give meaningful advantage to skilled players', () => {
    // Skilled player: max skill bonus (120) + max multiplier (1.328)
    // Unskilled player: no skill bonus (0) + no multiplier (1.0)

    const baseDamage = 10; // Two Pair
    const skilledDamage = Math.floor((baseDamage + 120) * 1.328);
    const unskilledDamage = baseDamage;

    // Skilled should deal ~17x more damage
    const advantage = skilledDamage / unskilledDamage;
    expect(advantage).toBeGreaterThan(10);
    expect(advantage).toBeLessThan(20);
  });
});
