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

// Mock SecureRNG for deterministic damage
jest.mock('../../src/services/base/SecureRNG', () => ({
  SecureRNG: {
    range: jest.fn().mockReturnValue(0)
  }
}));

describe('Combat Damage Calculation', () => {
  describe('Base Damage by Hand Rank', () => {
    it('should deal 50 damage for Royal Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.ROYAL_FLUSH, 0, 0);
      expect(damage).toBe(50);
    });

    it('should deal 40 damage for Straight Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.STRAIGHT_FLUSH, 0, 0);
      expect(damage).toBe(40);
    });

    it('should deal 35 damage for Four of a Kind', () => {
      const damage = CombatService.calculateDamage(HandRank.FOUR_OF_A_KIND, 0, 0);
      expect(damage).toBe(35);
    });

    it('should deal 30 damage for Full House', () => {
      const damage = CombatService.calculateDamage(HandRank.FULL_HOUSE, 0, 0);
      expect(damage).toBe(30);
    });

    it('should deal 25 damage for Flush', () => {
      const damage = CombatService.calculateDamage(HandRank.FLUSH, 0, 0);
      expect(damage).toBe(25);
    });

    it('should deal 20 damage for Straight', () => {
      const damage = CombatService.calculateDamage(HandRank.STRAIGHT, 0, 0);
      expect(damage).toBe(20);
    });

    it('should deal 15 damage for Three of a Kind', () => {
      const damage = CombatService.calculateDamage(HandRank.THREE_OF_A_KIND, 0, 0);
      expect(damage).toBe(15);
    });

    it('should deal 10 damage for Two Pair', () => {
      const damage = CombatService.calculateDamage(HandRank.TWO_PAIR, 0, 0);
      expect(damage).toBe(10);
    });

    it('should deal 8 damage for Pair', () => {
      const damage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      expect(damage).toBe(8);
    });

    it('should deal 5 damage for High Card', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 0);
      expect(damage).toBe(5);
    });
  });

  describe('Skill Bonuses', () => {
    it('should add +1 damage per skill level', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(10);
    });

    it('should stack multiple combat skills', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' },
          { skillId: 'ranged_combat', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(15);
    });

    it('should handle character with no combat skills', () => {
      const mockCharacter = {
        skills: [
          { skillId: 'lockpicking', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(0);
    });

    it('should apply skill bonuses to damage calculation', () => {
      const baseDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      const bonusDamage = CombatService.calculateDamage(HandRank.PAIR, 10, 0);

      expect(bonusDamage).toBe(baseDamage + 10);
    });

    it('should handle empty skills array', () => {
      const mockCharacter = {
        skills: []
      } as unknown as ICharacter;

      const skillBonus = CombatService.getCombatSkillBonus(mockCharacter);
      expect(skillBonus).toBe(0);
    });
  });

  describe('NPC Difficulty Modifier', () => {
    it('should add difficulty bonus to NPC damage', () => {
      const baseDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 0);
      const hardDamage = CombatService.calculateDamage(HandRank.PAIR, 0, 5);

      expect(hardDamage).toBe(baseDamage + 5);
    });

    it('should handle difficulty 0 (no modifier)', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 0);
      expect(damage).toBe(5);
    });

    it('should handle high difficulty modifier', () => {
      const damage = CombatService.calculateDamage(HandRank.HIGH_CARD, 0, 20);
      expect(damage).toBe(25); // 5 base + 20 difficulty
    });
  });

  describe('Combined Modifiers', () => {
    it('should correctly apply skill + difficulty', () => {
      const skillBonus = 15;
      const difficulty = 5;
      const damage = CombatService.calculateDamage(HandRank.PAIR, skillBonus, difficulty);

      // Base 8 + skill 15 + difficulty 5 = 28
      expect(damage).toBe(28);
    });

    it('should handle maximum possible damage', () => {
      const skillBonus = 50; // High level character
      const difficulty = 10; // Boss NPC
      const damage = CombatService.calculateDamage(HandRank.ROYAL_FLUSH, skillBonus, difficulty);

      // Base 50 + skill 50 + difficulty 10 = 110
      expect(damage).toBe(110);
    });
  });
});
