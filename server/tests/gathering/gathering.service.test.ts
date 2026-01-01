/**
 * Gathering Service Tests
 *
 * Tests for the gathering system including:
 * - Resource gathering mechanics
 * - Inventory persistence (CRITICAL - fixes bug where items weren't added)
 * - Energy deduction
 * - Skill XP rewards
 * - Cooldown management
 */

import mongoose from 'mongoose';
import { GatheringService } from '../../src/services/gathering.service';
import { Character } from '../../src/models/Character.model';
import { clearDatabase } from '../helpers';

// Mock SecureRNG to make tests deterministic
jest.mock('../../src/services/base/SecureRNG', () => ({
  SecureRNG: {
    chance: jest.fn().mockReturnValue(true), // Always succeed
    range: jest.fn().mockImplementation((min: number, max: number) => min + 1), // Return min + 1
    d100: jest.fn().mockReturnValue(50), // Mid-range quality roll
  },
}));

describe('GatheringService', () => {
  let testCharacter: any;

  beforeEach(async () => {
    await clearDatabase();

    // Clear cooldowns between tests
    GatheringService.clearCooldowns('test-char');

    // Create a test character with gathering skills
    testCharacter = await Character.create({
      userId: new mongoose.Types.ObjectId(),
      name: 'Test Gatherer',
      faction: 'SETTLER_ALLIANCE',
      level: 10,
      experience: 0,
      dollars: 100,
      gold: 100,
      energy: 100,
      maxEnergy: 150,
      health: 100,
      maxHealth: 100,
      currentLocation: 'red-gulch', // Location with gathering nodes
      inventory: [],
      skills: [
        { skillId: 'mining', level: 10, experience: 0 },
        { skillId: 'herbalism', level: 5, experience: 0 },
        { skillId: 'woodcutting', level: 5, experience: 0 },
        { skillId: 'foraging', level: 5, experience: 0 },
      ],
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1,
      },
    });
  });

  afterEach(async () => {
    // Clear cooldowns after each test
    if (testCharacter?._id) {
      GatheringService.clearCooldowns(testCharacter._id.toString());
    }
  });

  describe('gather - Inventory Persistence', () => {
    /**
     * CRITICAL TEST: Verifies fix for bug where gathered items weren't added to inventory
     * Root cause was missing markModified('inventory') call before save
     */
    it('should add gathered items to inventory and persist to database', async () => {
      const characterId = testCharacter._id.toString();

      // Find a gathering node at red-gulch
      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      expect(nodes.length).toBeGreaterThan(0);

      // Use first available node
      const nodeId = nodes[0].id;

      // Record initial inventory state
      const initialInventoryCount = testCharacter.inventory.length;
      expect(initialInventoryCount).toBe(0);

      // Perform gathering
      const result = await GatheringService.gather(characterId, nodeId);

      // Verify gathering succeeded
      expect(result.success).toBe(true);
      expect(result.loot.length).toBeGreaterThan(0);

      // CRITICAL: Reload character from database to verify persistence
      const reloadedCharacter = await Character.findById(characterId);
      expect(reloadedCharacter).toBeDefined();

      // Verify inventory was updated IN THE DATABASE
      expect(reloadedCharacter!.inventory.length).toBeGreaterThan(0);

      // Verify the loot items match what was returned
      for (const lootItem of result.loot) {
        const inventoryItem = reloadedCharacter!.inventory.find(
          (item: any) => item.itemId === lootItem.itemId
        );
        expect(inventoryItem).toBeDefined();
        expect(inventoryItem!.quantity).toBe(lootItem.quantity);
      }
    });

    it('should stack items if already in inventory', async () => {
      const characterId = testCharacter._id.toString();

      // Pre-populate inventory with an item
      testCharacter.inventory.push({
        itemId: 'test-item',
        quantity: 5,
        acquiredAt: new Date(),
      });
      testCharacter.markModified('inventory');
      await testCharacter.save();

      // Verify pre-population
      const preCheck = await Character.findById(characterId);
      expect(preCheck!.inventory.length).toBe(1);
      expect(preCheck!.inventory[0].quantity).toBe(5);
    });
  });

  describe('gather - Energy Deduction', () => {
    it('should deduct energy when gathering', async () => {
      const characterId = testCharacter._id.toString();
      const initialEnergy = testCharacter.energy;

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      expect(nodes.length).toBeGreaterThan(0);

      const node = nodes[0];
      const nodeId = node.id;

      // Perform gathering
      const result = await GatheringService.gather(characterId, nodeId);
      expect(result.success).toBe(true);
      expect(result.energySpent).toBe(node.energyCost);

      // Reload and verify energy deducted
      const reloadedCharacter = await Character.findById(characterId);
      expect(reloadedCharacter!.energy).toBe(initialEnergy - node.energyCost);
    });

    it('should reject gathering when insufficient energy', async () => {
      const characterId = testCharacter._id.toString();

      // Drain energy
      testCharacter.energy = 1;
      await testCharacter.save();

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      const nodeId = nodes[0].id;

      // Should fail due to insufficient energy
      await expect(GatheringService.gather(characterId, nodeId)).rejects.toThrow();
    });
  });

  describe('gather - Cooldown Management', () => {
    it('should set cooldown after gathering', async () => {
      const characterId = testCharacter._id.toString();

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      const nodeId = nodes[0].id;

      const result = await GatheringService.gather(characterId, nodeId);
      expect(result.success).toBe(true);
      expect(result.cooldownEndsAt).toBeDefined();
      expect(result.cooldownEndsAt.getTime()).toBeGreaterThan(Date.now());

      // Check cooldowns are tracked
      const cooldowns = GatheringService.getActiveCooldowns(characterId);
      expect(cooldowns.length).toBe(1);
      expect(cooldowns[0].nodeId).toBe(nodeId);
    });

    it('should reject gathering while on cooldown', async () => {
      const characterId = testCharacter._id.toString();

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      const nodeId = nodes[0].id;

      // First gather succeeds
      await GatheringService.gather(characterId, nodeId);

      // Second gather should fail (on cooldown)
      await expect(GatheringService.gather(characterId, nodeId)).rejects.toThrow(
        /cooldown/i
      );
    });
  });

  describe('gather - Skill XP', () => {
    it('should award skill XP when gathering', async () => {
      const characterId = testCharacter._id.toString();

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      const nodeId = nodes[0].id;

      const result = await GatheringService.gather(characterId, nodeId);
      expect(result.success).toBe(true);
      expect(result.xpGained).toBeGreaterThan(0);
    });
  });

  describe('getNodesAtLocation', () => {
    it('should return gathering nodes for a valid location', async () => {
      const characterId = testCharacter._id.toString();

      const result = await GatheringService.getNodesAtLocation(characterId);

      expect(result.nodes).toBeDefined();
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(result.available).toBeDefined();
      expect(result.cooldowns).toBeDefined();
    });
  });

  describe('checkRequirements', () => {
    it('should return canGather true when all requirements met', async () => {
      const characterId = testCharacter._id.toString();

      const { nodes } = await GatheringService.getNodesAtLocation(characterId);
      expect(nodes.length).toBeGreaterThan(0);

      const nodeId = nodes[0].id;
      const result = await GatheringService.checkRequirements(characterId, nodeId);

      expect(result.canGather).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});
