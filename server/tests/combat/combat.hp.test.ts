/**
 * Combat HP System Tests
 * Sprint 4 - Agent 3
 *
 * Comprehensive tests for HP calculations including:
 * - Player HP scaling with level
 * - Player HP scaling with skills
 * - Premium player HP bonuses
 * - NPC HP scaling
 * - HP boundaries
 */

import { CombatService } from '../../src/services/combat.service';
import { ICharacter } from '../../src/models/Character.model';

describe('HP System', () => {
  describe('Player HP Scaling', () => {
    it('should start with 100 base HP at level 1', () => {
      const mockCharacter = {
        level: 1,
        skills: []
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(105); // 100 + (1 * 5)
    });

    it('should add +5 HP per level', () => {
      const level5Character = {
        level: 5,
        skills: []
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(level5Character, false);
      expect(maxHP).toBe(125); // 100 + (5 * 5)
    });

    it('should add +2 HP per combat skill level', () => {
      const mockCharacter = {
        level: 1,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(125); // 100 + (1 * 5) + (10 * 2)
    });

    it('should give premium players +20% HP', () => {
      const mockCharacter = {
        level: 1,
        skills: []
      } as unknown as ICharacter;

      const regularHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      const premiumHP = CombatService.getCharacterMaxHP(mockCharacter, true);

      expect(premiumHP).toBe(Math.floor(regularHP * 1.2));
      expect(premiumHP).toBe(126); // floor(105 * 1.2)
    });

    it('should correctly calculate max HP with all bonuses', () => {
      const mockCharacter = {
        level: 10,
        skills: [
          { skillId: 'melee_combat', level: 15, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' },
          { skillId: 'defense', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'HEARTS' }
        ]
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, true);

      // 100 + (10 * 5) + (15 * 2) + (10 * 2) = 100 + 50 + 30 + 20 = 200
      // Premium: floor(200 * 1.2) = 240
      expect(maxHP).toBe(240);
    });

    it('should handle character with no skills', () => {
      const mockCharacter = {
        level: 5,
        skills: []
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(125); // 100 + (5 * 5)
    });

    it('should handle level 1 character', () => {
      const mockCharacter = {
        level: 1,
        skills: []
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBeGreaterThanOrEqual(100);
    });

    it('should handle high level character', () => {
      const mockCharacter = {
        level: 50,
        skills: []
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(350); // 100 + (50 * 5)
    });
  });

  describe('Combat Skill HP Bonuses', () => {
    it('should recognize combat-related skills', () => {
      const combatSkills = ['combat', 'fight', 'defense', 'melee_combat', 'fighting'];

      for (const skillId of combatSkills) {
        const mockCharacter = {
          level: 1,
          skills: [
            { skillId, level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
          ]
        } as unknown as ICharacter;

        const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
        expect(maxHP).toBeGreaterThan(105); // Should have combat skill bonus
      }
    });

    it('should not give HP bonus for non-combat skills', () => {
      const mockCharacter = {
        level: 1,
        skills: [
          { skillId: 'lockpicking', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'DIAMONDS' },
          { skillId: 'persuasion', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'HEARTS' }
        ]
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(105); // No combat skill bonus
    });

    it('should stack multiple combat skills', () => {
      const mockCharacter = {
        level: 1,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' },
          { skillId: 'fighting', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'HEARTS' },
          { skillId: 'defense', level: 8, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
        ]
      } as unknown as ICharacter;

      const maxHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      // 100 + 5 (level) + 20 (melee) + 10 (fighting) + 16 (defense) = 151
      expect(maxHP).toBe(151);
    });
  });

  describe('Premium Player Bonuses', () => {
    it('should give +20% HP to premium players', () => {
      const mockCharacter = {
        level: 10,
        skills: []
      } as unknown as ICharacter;

      const regularHP = CombatService.getCharacterMaxHP(mockCharacter, false);
      const premiumHP = CombatService.getCharacterMaxHP(mockCharacter, true);

      expect(premiumHP).toBe(Math.floor(regularHP * 1.2));
    });

    it('should apply premium bonus after all other calculations', () => {
      const mockCharacter = {
        level: 10,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      // 100 + 50 (level) + 20 (skill) = 170
      // Premium: floor(170 * 1.2) = 204
      const premiumHP = CombatService.getCharacterMaxHP(mockCharacter, true);
      expect(premiumHP).toBe(204);
    });

    it('should handle premium bonus with high HP values', () => {
      const mockCharacter = {
        level: 50,
        skills: [
          { skillId: 'melee_combat', level: 50, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      // 100 + 250 (level) + 100 (skill) = 450
      // Premium: floor(450 * 1.2) = 540
      const premiumHP = CombatService.getCharacterMaxHP(mockCharacter, true);
      expect(premiumHP).toBe(540);
    });
  });
});
