/**
 * Combat Loot System Tests
 * Sprint 4 - Agent 3
 *
 * Comprehensive tests for combat loot distribution including:
 * - Gold drops within min/max range
 * - XP rewards
 * - Item drops based on chance
 * - Boss loot bonuses
 * - Loot on defeat scenarios
 */

import { CombatService } from '../../src/services/combat.service';
import { INPC } from '../../src/models/NPC.model';
import { NPCType } from '@desperados/shared';

describe('Loot System', () => {
  describe('Gold Drops', () => {
    it('should award gold within NPC goldMin-goldMax range', () => {
      const mockNPC = {
        name: 'Test Bandit',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 50,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);

      expect(loot.gold).toBeGreaterThanOrEqual(10);
      expect(loot.gold).toBeLessThanOrEqual(20);
    });

    it('should award more gold from higher level NPCs', () => {
      const lowLevelNPC = {
        name: 'Weak Bandit',
        type: NPCType.OUTLAW,
        level: 1,
        maxHP: 20,
        difficulty: 1,
        lootTable: {
          goldMin: 5,
          goldMax: 10,
          xpReward: 25,
          items: []
        }
      } as INPC;

      const highLevelNPC = {
        name: 'Elite Bandit',
        type: NPCType.OUTLAW,
        level: 20,
        maxHP: 200,
        difficulty: 8,
        lootTable: {
          goldMin: 100,
          goldMax: 200,
          xpReward: 500,
          items: []
        }
      } as INPC;

      const lowLoot = CombatService.rollLoot(lowLevelNPC);
      const highLoot = CombatService.rollLoot(highLevelNPC);

      expect(highLoot.gold).toBeGreaterThan(lowLoot.gold);
    });

    it('should handle NPCs with same goldMin and goldMax', () => {
      const mockNPC = {
        name: 'Fixed Gold NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 50,
          goldMax: 50,
          xpReward: 100,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);
      expect(loot.gold).toBe(50);
    });

    it('should always award at least goldMin', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 25,
          goldMax: 100,
          xpReward: 50,
          items: []
        }
      } as INPC;

      for (let i = 0; i < 20; i++) {
        const loot = CombatService.rollLoot(mockNPC);
        expect(loot.gold).toBeGreaterThanOrEqual(25);
      }
    });
  });

  describe('XP Rewards', () => {
    it('should award xpReward from NPC', () => {
      const mockNPC = {
        name: 'Test Bandit',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 75,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);
      expect(loot.xp).toBe(75);
    });

    it('should scale XP with NPC level', () => {
      const lowLevelNPC = {
        name: 'Weak Enemy',
        type: NPCType.OUTLAW,
        level: 1,
        maxHP: 20,
        difficulty: 1,
        lootTable: {
          goldMin: 5,
          goldMax: 10,
          xpReward: 25,
          items: []
        }
      } as INPC;

      const highLevelNPC = {
        name: 'Strong Enemy',
        type: NPCType.BOSS,
        level: 20,
        maxHP: 500,
        difficulty: 10,
        lootTable: {
          goldMin: 200,
          goldMax: 500,
          xpReward: 1000,
          items: []
        }
      } as INPC;

      const lowLoot = CombatService.rollLoot(lowLevelNPC);
      const highLoot = CombatService.rollLoot(highLevelNPC);

      expect(highLoot.xp).toBeGreaterThan(lowLoot.xp);
    });

    it('should award consistent XP (not randomized)', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 100,
          items: []
        }
      } as INPC;

      const xpValues = [];
      for (let i = 0; i < 10; i++) {
        const loot = CombatService.rollLoot(mockNPC);
        xpValues.push(loot.xp);
      }

      // All XP values should be the same
      expect(new Set(xpValues).size).toBe(1);
      expect(xpValues[0]).toBe(100);
    });
  });

  describe('Item Drops', () => {
    it('should roll items based on drop chance', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 50,
          items: [
            { name: 'Common Item', chance: 1.0, rarity: 'common' as const },
            { name: 'Impossible Item', chance: 0.0, rarity: 'legendary' as const }
          ]
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);

      // Should always get Common Item (100% chance)
      expect(loot.items).toContain('Common Item');

      // Should never get Impossible Item (0% chance)
      expect(loot.items).not.toContain('Impossible Item');
    });

    it('should drop multiple items if chance allows', () => {
      const mockNPC = {
        name: 'Generous NPC',
        type: NPCType.BOSS,
        level: 10,
        maxHP: 200,
        difficulty: 8,
        lootTable: {
          goldMin: 50,
          goldMax: 100,
          xpReward: 200,
          items: [
            { name: 'Item 1', chance: 1.0, rarity: 'common' as const },
            { name: 'Item 2', chance: 1.0, rarity: 'common' as const },
            { name: 'Item 3', chance: 1.0, rarity: 'uncommon' as const }
          ]
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);

      expect(loot.items.length).toBeGreaterThanOrEqual(3);
      expect(loot.items).toContain('Item 1');
      expect(loot.items).toContain('Item 2');
      expect(loot.items).toContain('Item 3');
    });

    it('should respect item rarity probabilities', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 50,
          items: [
            { name: 'Common', chance: 0.9, rarity: 'common' as const },
            { name: 'Rare', chance: 0.1, rarity: 'rare' as const }
          ]
        }
      } as INPC;

      let commonCount = 0;
      let rareCount = 0;

      // Roll 100 times
      for (let i = 0; i < 100; i++) {
        const loot = CombatService.rollLoot(mockNPC);
        if (loot.items.includes('Common')) commonCount++;
        if (loot.items.includes('Rare')) rareCount++;
      }

      // Common should drop way more often than Rare
      expect(commonCount).toBeGreaterThan(rareCount);
    });

    it('should handle NPCs with no items', () => {
      const mockNPC = {
        name: 'Poor NPC',
        type: NPCType.WILDLIFE,
        level: 1,
        maxHP: 10,
        difficulty: 1,
        lootTable: {
          goldMin: 1,
          goldMax: 3,
          xpReward: 10,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);

      expect(loot.items).toBeDefined();
      expect(loot.items.length).toBe(0);
    });
  });

  describe('Boss Loot', () => {
    it('should have higher gold range for bosses', () => {
      const regularNPC = {
        name: 'Regular Bandit',
        type: NPCType.OUTLAW,
        level: 10,
        maxHP: 100,
        difficulty: 5,
        lootTable: {
          goldMin: 20,
          goldMax: 40,
          xpReward: 100,
          items: []
        }
      } as INPC;

      const bossNPC = {
        name: 'Bandit Boss',
        type: NPCType.BOSS,
        level: 10,
        maxHP: 300,
        difficulty: 9,
        lootTable: {
          goldMin: 100,
          goldMax: 200,
          xpReward: 500,
          items: []
        }
      } as INPC;

      const regularLoot = CombatService.rollLoot(regularNPC);
      const bossLoot = CombatService.rollLoot(bossNPC);

      expect(bossLoot.gold).toBeGreaterThan(regularLoot.gold);
    });

    it('should have higher XP rewards for bosses', () => {
      const regularNPC = {
        name: 'Regular Enemy',
        type: NPCType.OUTLAW,
        level: 15,
        maxHP: 150,
        difficulty: 6,
        lootTable: {
          goldMin: 30,
          goldMax: 60,
          xpReward: 150,
          items: []
        }
      } as INPC;

      const bossNPC = {
        name: 'Boss Enemy',
        type: NPCType.BOSS,
        level: 15,
        maxHP: 500,
        difficulty: 10,
        lootTable: {
          goldMin: 150,
          goldMax: 300,
          xpReward: 800,
          items: []
        }
      } as INPC;

      const regularLoot = CombatService.rollLoot(regularNPC);
      const bossLoot = CombatService.rollLoot(bossNPC);

      expect(bossLoot.xp).toBeGreaterThan(regularLoot.xp);
    });

    it('should have better item drop rates for bosses', () => {
      const bossNPC = {
        name: 'Boss with Loot',
        type: NPCType.BOSS,
        level: 20,
        maxHP: 500,
        difficulty: 10,
        lootTable: {
          goldMin: 200,
          goldMax: 500,
          xpReward: 1000,
          items: [
            { name: 'Epic Sword', chance: 0.5, rarity: 'epic' as const },
            { name: 'Legendary Ring', chance: 0.1, rarity: 'legendary' as const }
          ]
        }
      } as INPC;

      let epicCount = 0;
      let legendaryCount = 0;

      for (let i = 0; i < 100; i++) {
        const loot = CombatService.rollLoot(bossNPC);
        if (loot.items.includes('Epic Sword')) epicCount++;
        if (loot.items.includes('Legendary Ring')) legendaryCount++;
      }

      // With 50% chance over 100 rolls, should get around 40-60
      expect(epicCount).toBeGreaterThan(30);

      // With 10% chance over 100 rolls, should get around 5-15
      expect(legendaryCount).toBeGreaterThan(0);
    });
  });

  describe('Loot Consistency', () => {
    it('should always return loot structure with gold, xp, items', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 50,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);

      expect(loot).toHaveProperty('gold');
      expect(loot).toHaveProperty('xp');
      expect(loot).toHaveProperty('items');
      expect(typeof loot.gold).toBe('number');
      expect(typeof loot.xp).toBe('number');
      expect(Array.isArray(loot.items)).toBe(true);
    });

    it('should never award negative gold', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 1,
        maxHP: 10,
        difficulty: 1,
        lootTable: {
          goldMin: 0,
          goldMax: 5,
          xpReward: 10,
          items: []
        }
      } as INPC;

      for (let i = 0; i < 50; i++) {
        const loot = CombatService.rollLoot(mockNPC);
        expect(loot.gold).toBeGreaterThanOrEqual(0);
      }
    });

    it('should never award negative XP', () => {
      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.WILDLIFE,
        level: 1,
        maxHP: 5,
        difficulty: 1,
        lootTable: {
          goldMin: 0,
          goldMax: 2,
          xpReward: 5,
          items: []
        }
      } as INPC;

      const loot = CombatService.rollLoot(mockNPC);
      expect(loot.xp).toBeGreaterThanOrEqual(0);
    });
  });
});
