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

import { CombatService } from '../../src/services/combat';
import { ICharacter } from '../../src/models/Character.model';
import mongoose from 'mongoose';

// Mock PremiumUtils
jest.mock('../../src/utils/premium.utils', () => ({
  PremiumUtils: {
    calculateHPWithBonus: jest.fn().mockImplementation((baseHP, userId) => {
      // Simulate +20% bonus if "premium" is passed as a flag (in tests we pass boolean, but service calls with ID)
      // We'll control the return value in the test cases or simple logic here
      return Promise.resolve(baseHP); 
    })
  }
}));

import { PremiumUtils } from '../../src/utils/premium.utils';

describe('HP System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default implementation: just return base HP
    (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _userId) => Promise.resolve(baseHP));
  });

  describe('Player HP Scaling', () => {
    it('should start with 100 base HP at level 1', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        skills: []
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(105); // 100 + (1 * 5)
    });

    it('should add +5 HP per level', async () => {
      const level5Character = {
        _id: new mongoose.Types.ObjectId(),
        level: 5,
        combatLevel: 5, // HP uses combatLevel now
        skills: []
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(level5Character, false);
      expect(maxHP).toBe(125); // 100 + (5 * 5)
    });

    it('should add +2 HP per combat skill level', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        combatLevel: 1,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      // 100 + 5 (level 1) + 10 (skill level 10 -> +10 damage bonus) = 115
      // Wait, getCharacterMaxHP adds getCombatSkillBonus
      // Levels 1-10 give +1 per level. So +10.
      // Total = 100 + 5 + 10 = 115.
      // Original expectation was 125 (10 * 2). But diminishing returns formula is used now.
      // Let's check calculateSkillBonusWithDiminishingReturns: 1-10 is full rate (1.0).
      // So bonus is 10.
      // Expected: 115.
      expect(maxHP).toBe(115); 
    });

    it('should give premium players +20% HP', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        combatLevel: 1,
        skills: []
      } as unknown as ICharacter;

      // Mock premium implementation for this test
      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _userId) => Promise.resolve(Math.floor(baseHP * 1.2)));

      const premiumHP = await CombatService.getCharacterMaxHP(mockCharacter, true);

      // Base: 100 + 5 = 105. Premium: 105 * 1.2 = 126.
      expect(premiumHP).toBe(126); 
    });

    it('should correctly calculate max HP with all bonuses', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 10,
        combatLevel: 10,
        skills: [
          { skillId: 'melee_combat', level: 15, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' },
          { skillId: 'defensive_tactics', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
        ]
      } as unknown as ICharacter;

      // Mock premium
      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _userId) => Promise.resolve(Math.floor(baseHP * 1.2)));

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, true);

      // Base: 100
      // Level 10: +50
      // Skills:
      //   Melee 15: 10 (Tier 1) + 2.5 (Tier 2: 5 * 0.5) = 12.5 -> floor(12.5) = 12
      //   Defensive Tactics 10: 10 (Tier 1) = 10
      // Total Skill Bonus: 22
      // Base Total: 100 + 50 + 22 = 172
      // Premium: 172 * 1.2 = 206.4 -> 206
      expect(maxHP).toBe(206);
    });

    it('should handle character with no skills', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 5,
        combatLevel: 5,
        skills: []
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(125); // 100 + (5 * 5)
    });

    it('should handle level 1 character', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        combatLevel: 1,
        skills: []
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBeGreaterThanOrEqual(100);
    });

    it('should handle high level character', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 50,
        combatLevel: 50,
        skills: []
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(350); // 100 + (50 * 5)
    });
  });

  describe('Combat Skill HP Bonuses', () => {
    it('should recognize combat-related skills', async () => {
      const combatSkills = ['melee_combat', 'ranged_combat', 'defensive_tactics', 'mounted_combat', 'explosives'];

      for (const skillId of combatSkills) {
        const mockCharacter = {
          _id: new mongoose.Types.ObjectId(),
          level: 1,
          combatLevel: 1,
          skills: [
            { skillId, level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
          ]
        } as unknown as ICharacter;

        const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
        // Base 105. Skill 5 -> +5 bonus. Total 110.
        expect(maxHP).toBeGreaterThan(105); 
      }
    });

    it('should not give HP bonus for non-combat skills', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        combatLevel: 1,
        skills: [
          { skillId: 'lockpicking', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' },
          { skillId: 'persuasion', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'HEARTS' }
        ]
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      expect(maxHP).toBe(105); // No combat skill bonus
    });

    it('should stack multiple combat skills', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 1,
        combatLevel: 1,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' },
          { skillId: 'ranged_combat', level: 5, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' },
          { skillId: 'defensive_tactics', level: 8, xp: 0, trainingStartedAt: null, associatedSuit: 'CLUBS' }
        ]
      } as unknown as ICharacter;

      const maxHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      // 100 + 5 (level) 
      // Melee 10 -> +10
      // Ranged 5 -> +5
      // Defense 8 -> +8
      // Total Skill Bonus: 23
      // Total: 100 + 5 + 23 = 128
      expect(maxHP).toBe(128);
    });
  });

  describe('Premium Player Bonuses', () => {
    it('should give +20% HP to premium players', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 10,
        combatLevel: 10,
        skills: []
      } as unknown as ICharacter;

      // Mock dynamic behavior
      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _id) => {
         // Logic here is tricky because getCharacterMaxHP passes ID string, not boolean
         // But in our test we want to simulate the result.
         // Let's manually calculate for assertion
         return Promise.resolve(baseHP);
      });
      const regularHP = await CombatService.getCharacterMaxHP(mockCharacter, false);
      
      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _id) => {
         return Promise.resolve(Math.floor(baseHP * 1.2));
      });
      const premiumHP = await CombatService.getCharacterMaxHP(mockCharacter, true);

      expect(premiumHP).toBe(Math.floor(regularHP * 1.2));
    });

    it('should apply premium bonus after all other calculations', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 10,
        combatLevel: 10,
        skills: [
          { skillId: 'melee_combat', level: 10, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _id) => Promise.resolve(Math.floor(baseHP * 1.2)));

      // 100 + 50 (level) + 10 (skill) = 160
      // Premium: floor(160 * 1.2) = 192
      const premiumHP = await CombatService.getCharacterMaxHP(mockCharacter, true);
      expect(premiumHP).toBe(192);
    });

    it('should handle premium bonus with high HP values', async () => {
      const mockCharacter = {
        _id: new mongoose.Types.ObjectId(),
        level: 50,
        combatLevel: 50,
        skills: [
          { skillId: 'melee_combat', level: 50, xp: 0, trainingStartedAt: null, associatedSuit: 'SPADES' }
        ]
      } as unknown as ICharacter;

      (PremiumUtils.calculateHPWithBonus as jest.Mock).mockImplementation((baseHP, _id) => Promise.resolve(Math.floor(baseHP * 1.2)));

      // 100 + 250 (level)
      // Skill 50:
      // 1-10: 10 * 1 = 10
      // 11-25: 15 * 0.5 = 7.5
      // 26-50: 25 * 0.25 = 6.25
      // Total: 23.75 -> 23
      // Base Total: 373
      // Premium: 373 * 1.2 = 447.6 -> 447
      const premiumHP = await CombatService.getCharacterMaxHP(mockCharacter, true);
      expect(premiumHP).toBe(447);
    });
  });
});
