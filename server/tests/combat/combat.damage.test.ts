/**
 * Combat Damage Calculation Tests
 * Sprint 4 - Agent 3
 *
 * Comprehensive tests for combat damage calculations including:
 * - Base damage by hand rank
 * - Skill bonuses
 * - Damage variance
 * - NPC difficulty modifiers
 */

import { CombatService } from '../../src/services/combat';
import { HandRank } from '@desperados/shared';
import { ICharacter } from '../../src/models/Character.model';

describe('Combat Damage Calculation', () => {
  describe('Base Damage by Hand Rank', () => {
    it('should deal 50 damage for Royal Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.ROYAL_FLUSH, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(50);
      expect(damage).toBeLessThanOrEqual(55); // 50 + max variance of 5
    });

    it('should deal 40 damage for Straight Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.STRAIGHT_FLUSH, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(40);
      expect(damage).toBeLessThanOrEqual(45);
    });

    it('should deal 35 damage for Four of a Kind', () => {
      const damage = CombatService.calculateDamage(HandRank.FOUR_OF_A_KIND, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(35);
      expect(damage).toBeLessThanOrEqual(40);
    });

    it('should deal 30 damage for Full House', () => {
      const damage = CombatService.calculateDamage(HandRank.FULL_HOUSE, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(30);
      expect(damage).toBeLessThanOrEqual(35);
    });

    it('should deal 25 damage for Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.FLUSH, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(25);
      expect(damage).toBeLessThanOrEqual(30);
    });

    it('should deal 20 damage for Straight', () => {
      const damage = CombatService.calculateDamage(HandRank.STRAIGHT, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(20);
      expect(damage).toBeLessThanOrEqual(25);
    });

    it('should deal 15 damage for Three of a Kind', () => {
      const damage = CombatService.calculateDamage(HandRank.THREE_OF_A_KIND, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(15);
      expect(damage).toBeLessThanOrEqual(20);
    });

    it('should deal 10 damage for Two Pair', () => {
      const damage = CombatService.calculateDamage(HandRank.TWO_PAIR, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(10);
      expect(damage).toBeLessThanOrEqual(15);
    });

    it('should deal 8 damage for Pair', () => {
      const damage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(8);
      expect(damage).toBeLessThanOrEqual(13);
    });

    it('should deal 5 damage for High Card', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(5);
      expect(damage).toBeLessThanOrEqual(10);
    });
  });

  describe('Skill Bonuses', () => {
    it('should add +1 damage per skill level', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(10);
    });

    it('should stack multiple combat skills', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' },
          { skillId: 'shooting', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'HEARTS' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(15);
    });

    it('should handle character with no combat skills', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'lockpicking', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'DIAMONDS' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(0);
    });

    it('should apply skill bonuses to damage calculation', () => {
      const baseDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      const bonusDamage = CombatService.calculateDamage(HandRank.PAIR, 10, 0);

      expect(bonusDamage).toBeGreaterThanOrEqual(baseDamage + 10);
    });

    it('should handle empty skills array', () => {
      const mockCharacter = {
        skills: []
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(0);
    });
  });

  describe('Damage Variance', () => {
    it('should add 0-5 random damage', () => {
      const damages: number[] = [];

      // Run 100 iterations to ensure we get variance
      for (let i = 0; i < 100; i++) {
        damages.push(CombatService.calculateDamage(HandRank.PAIR, 0, 0));
      }

      const min = Math.min(...damages);
      const max = Math.max(...damages);

      // Variance should be at most 5
      expect(max - min).toBeLessThanOrEqual(5);

      // Should have at least some variance (not all the same)
      const uniqueDamages = new Set(damages);
      expect(uniqueDamages.size).toBeGreaterThan(1);
    });

    it('should apply variance to all hand ranks', () => {
      const handRanks = [
        HandRank.ROYAL_FLUSH,
        HandRank.STRAIGHT_FLUSH,
        HandRank.FOUR_OF_A_KIND,
        HandRank.FULL_HOUSE,
        HandRank.FLUSH,
        HandRank.STRAIGHT,
        HandRank.THREE_OF_A_KIND,
        HandRank.TWO_PAIR,
        HandRank.PAIR,
        HandRank.HIGH_CARD
      ];

      for (const rank of handRanks) {
        const damages: number[] = [];
        for (let i = 0; i < 50; i++) {
          damages.push(CombatService.calculateDamage(rank, 0, 0));
        }

        const uniqueDamages = new Set(damages);
        expect(uniqueDamages.size).toBeGreaterThan(1);
      }
    });
  });

  describe('NPC Difficulty Modifier', () => {
    it('should add difficulty bonus to NPC damage', () => {
      const baseDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      const hardDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 5);

      expect(hardDamage).toBeGreaterThanOrEqual(baseDamage + 5);
    });

    it('should handle difficulty 0 (no modifier)', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 0);
      expect(damage).toBeGreaterThanOrEqual(5);
      expect(damage).toBeLessThanOrEqual(10);
    });

    it('should handle high difficulty modifier', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 20);
      expect(damage).toBeGreaterThanOrEqual(25); // 5 base + 20 difficulty
    });
  });

  describe('Combined Modifiers', () => {
    it('should correctly apply skill + difficulty + variance', () => {
      const skillBonus = 15;
      const difficulty = 5;
      const damage = CombatService.calculateDamage(HandRank.PAIR, skillBonus, difficulty);

      // Base 8 + skill 15 + difficulty 5 + variance 0-5 = 28-33
      expect(damage).toBeGreaterThanOrEqual(28);
      expect(damage).toBeLessThanOrEqual(33);
    });

    it('should handle maximum possible damage', () => {
      const skillBonus = 50; // High level character
      const difficulty = 10; // Boss NPC
      const damage = CombatService.calculateDamage(HandRank.ROYAL_FLUSH, skillBonus, difficulty);

      // Base 50 + skill 50 + difficulty 10 + variance 0-5 = 110-115
      expect(damage).toBeGreaterThanOrEqual(110);
      expect(damage).toBeLessThanOrEqual(115);
    });
  });
});
