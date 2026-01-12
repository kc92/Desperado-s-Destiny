/**
 * Permanent Unlocks System Tests
 */

import mongoose from 'mongoose';
import { AccountUnlocks } from '../../src/models/AccountUnlocks.model';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import * as unlockService from '../../src/services/permanentUnlock.service';
import * as triggerService from '../../src/services/unlockTrigger.service';
import { UnlockCategory, UnlockRequirementType } from '../../../shared/src/types/permanentUnlocks.types';
import { createTestCharacter } from '../helpers/testHelpers';

describe('Permanent Unlocks System', () => {
  describe('Account Unlocks Model', () => {
    it('should create account unlocks with default values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const accountUnlocks = await AccountUnlocks.findOrCreate(userId);

      expect(accountUnlocks.userId).toEqual(userId);
      expect(accountUnlocks.activeEffects.totalCharacterSlots).toBe(2);
      expect(accountUnlocks.stats.totalUnlocks).toBe(0);
      expect(accountUnlocks.unlocks).toHaveLength(0);
    });

    it('should check if user has specific unlock', async () => {
      const userId = new mongoose.Types.ObjectId();
      const accountUnlocks = await AccountUnlocks.findOrCreate(userId);

      accountUnlocks.unlocks.push({
        unlockId: 'test_unlock',
        earnedAt: new Date(),
        source: 'test',
        claimed: false
      });

      expect(accountUnlocks.hasUnlock('test_unlock')).toBe(true);
      expect(accountUnlocks.hasUnlock('other_unlock')).toBe(false);
    });

    it('should get unclaimed unlocks', async () => {
      const userId = new mongoose.Types.ObjectId();
      const accountUnlocks = await AccountUnlocks.findOrCreate(userId);

      accountUnlocks.unlocks.push(
        {
          unlockId: 'unlock_1',
          earnedAt: new Date(),
          source: 'test',
          claimed: false
        },
        {
          unlockId: 'unlock_2',
          earnedAt: new Date(),
          source: 'test',
          claimed: true
        }
      );

      const unclaimed = accountUnlocks.getUnclaimedUnlocks();
      expect(unclaimed).toHaveLength(1);
      expect(unclaimed[0].unlockId).toBe('unlock_1');
    });

    it('should mark unlock as claimed', async () => {
      const userId = new mongoose.Types.ObjectId();
      const accountUnlocks = await AccountUnlocks.findOrCreate(userId);

      accountUnlocks.unlocks.push({
        unlockId: 'test_unlock',
        earnedAt: new Date(),
        source: 'test',
        claimed: false
      });

      const success = accountUnlocks.claimUnlock('test_unlock');
      expect(success).toBe(true);

      const unlock = accountUnlocks.unlocks.find(u => u.unlockId === 'test_unlock');
      expect(unlock?.claimed).toBe(true);
      expect(unlock?.claimedAt).toBeDefined();
    });
  });

  describe('Unlock Service', () => {
    it('should grant unlock to user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      await unlockService.grantUnlock(
        user._id.toString(),
        'portrait_frame_bronze',
        'test:grant'
      );

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks).toBeDefined();
      expect(accountUnlocks!.hasUnlock('portrait_frame_bronze')).toBe(true);
      expect(accountUnlocks!.stats.totalUnlocks).toBe(1);
    });

    it('should not duplicate unlocks', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'portrait_frame_bronze', 'test:grant');
      await unlockService.grantUnlock(userId, 'portrait_frame_bronze', 'test:grant');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.unlocks.filter(u => u.unlockId === 'portrait_frame_bronze')).toHaveLength(1);
    });

    it('should apply character slot unlocks', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 2
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'character_slot_3', 'legacy:tier_2');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.activeEffects.totalCharacterSlots).toBe(3);
    });

    it('should check character creation eligibility', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      // Create 2 characters (max default)
      await createTestCharacter({ userId: user._id, name: 'Char1' });
      await createTestCharacter({ userId: user._id, name: 'Char2' });

      // Should not be able to create more
      const canCreate = await unlockService.canCreateCharacter(userId);
      expect(canCreate).toBe(false);

      // Grant extra slot
      await unlockService.grantUnlock(userId, 'character_slot_3', 'test');

      // Should now be able to create
      const canCreateNow = await unlockService.canCreateCharacter(userId);
      expect(canCreateNow).toBe(true);
    });

    it('should apply starting bonuses to character', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      // Grant starting gold bonus
      await unlockService.grantUnlock(userId, 'start_bonus_gold_small', 'test');
      await unlockService.grantUnlock(userId, 'start_bonus_strength', 'test');

      const characterData = {
        name: 'TestChar',
        gold: 100,
        strength: 10,
        speed: 10,
        cunning: 10,
        charisma: 10
      };

      const enhanced = await unlockService.applyUnlockEffectsToCharacter(userId, characterData);

      expect(enhanced.gold).toBe(200); // 100 base + 100 bonus
      expect(enhanced.strength).toBe(12); // 10 base + 2 bonus
    });
  });

  describe('Unlock Requirements', () => {
    it('should evaluate legacy tier requirement', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 5
      });

      const userId = user._id.toString();

      const progress = await unlockService.getUnlockProgress(userId, 'character_slot_4');

      expect(progress.requirementsMet).toBe(true);
      expect(progress.percentage).toBe(100);
    });

    it('should evaluate character level requirement', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      await createTestCharacter({
        userId: user._id,
        name: 'TestChar',
        level: 15
      });

      const userId = user._id.toString();

      const progress = await unlockService.getUnlockProgress(userId, 'portrait_frame_silver');

      expect(progress.requirementsMet).toBe(true);
    });

    it('should evaluate gold earned requirement', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        totalGoldEarned: 50000
      });

      const userId = user._id.toString();

      const progress = await unlockService.getUnlockProgress(userId, 'nameplate_gold_rush');

      expect(progress.requirementsMet).toBe(true);
    });
  });

  describe('Unlock Triggers', () => {
    it('should grant unlocks on legacy tier increase', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 5
      });

      const userId = user._id.toString();

      await triggerService.processLegacyTierUnlock(userId, 5);

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.hasUnlock('character_slot_4')).toBe(true);
      expect(accountUnlocks!.hasUnlock('auto_loot')).toBe(true);
    });

    it('should grant unlocks on level milestone', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await triggerService.processLevelMilestone(userId, 10);

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.hasUnlock('bg_desert_sunset')).toBe(true);
      expect(accountUnlocks!.hasUnlock('inventory_expand_1')).toBe(true);
    });

    it('should grant unlocks on duel milestone', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        totalDuelsWon: 10
      });

      const userId = user._id.toString();

      await triggerService.processDuelMilestone(userId, 10);

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.hasUnlock('title_gunslinger')).toBe(true);
    });

    it('should sync all milestone unlocks', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 5,
        totalGoldEarned: 50000,
        totalDuelsWon: 25,
        totalCrimesCommitted: 100
      });

      await createTestCharacter({
        userId: user._id,
        name: 'TestChar',
        level: 30
      });

      const userId = user._id.toString();

      await triggerService.syncAllMilestoneUnlocks(userId);

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });

      // Should have multiple unlocks from different milestones
      expect(accountUnlocks!.stats.totalUnlocks).toBeGreaterThan(5);
      expect(accountUnlocks!.hasUnlock('portrait_frame_gold')).toBe(true); // Level 30
      expect(accountUnlocks!.hasUnlock('nameplate_gold_rush')).toBe(true); // 50k gold
      expect(accountUnlocks!.hasUnlock('nameplate_blood_red')).toBe(true); // 25 duels
      expect(accountUnlocks!.hasUnlock('portrait_frame_wanted')).toBe(true); // 100 crimes
    });
  });

  describe('Available Unlocks', () => {
    it('should return available unlocks with progress', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 3,
        totalGoldEarned: 25000
      });

      const userId = user._id.toString();

      const available = await unlockService.getAvailableUnlocks(userId);

      expect(available.length).toBeGreaterThan(0);

      // Check that progress is included
      const goldUnlock = available.find(u => u.id === 'start_bonus_gold_small');
      expect(goldUnlock).toBeDefined();
      expect(goldUnlock!.progress.requirementsMet).toBe(true);
    });

    it('should hide unlocks with low progress', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        legacyTier: 1
      });

      const userId = user._id.toString();

      const available = await unlockService.getAvailableUnlocks(userId);

      // Hidden unlocks should not appear if progress < 50%
      const hiddenUnlock = available.find(u => u.hidden && u.progress.percentage < 50);
      expect(hiddenUnlock).toBeUndefined();
    });
  });

  describe('Cosmetic Effects', () => {
    it('should accumulate portrait frames', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'portrait_frame_bronze', 'test');
      await unlockService.grantUnlock(userId, 'portrait_frame_silver', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      const frames = accountUnlocks!.activeEffects.cosmetics.portraitFrames;

      expect(frames).toContain('bronze');
      expect(frames).toContain('silver');
      expect(frames).toContain('default'); // Always includes default
    });

    it('should accumulate titles', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'title_gunslinger', 'test');
      await unlockService.grantUnlock(userId, 'title_outlaw', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      const titles = accountUnlocks!.activeEffects.cosmetics.titles;

      expect(titles).toContain('Gunslinger');
      expect(titles).toContain('Outlaw');
    });
  });

  describe('Gameplay Effects', () => {
    it('should accumulate abilities', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'ability_lucky_draw', 'test');
      await unlockService.grantUnlock(userId, 'ability_eagle_eye', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      const abilities = accountUnlocks!.activeEffects.gameplay.abilities;

      expect(abilities).toContain('lucky_draw');
      expect(abilities).toContain('eagle_eye');
    });

    it('should track starting locations', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'start_ghost_town', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      const locations = accountUnlocks!.activeEffects.gameplay.startingLocations;

      expect(locations).toContain('ghost_town');
      expect(locations).toContain('dusty_gulch'); // Always includes default
    });
  });

  describe('Convenience Effects', () => {
    it('should enable auto-loot', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'auto_loot', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.activeEffects.convenience.autoLoot).toBe(true);
    });

    it('should accumulate inventory slots', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'inventory_expand_1', 'test');
      await unlockService.grantUnlock(userId, 'inventory_expand_2', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      expect(accountUnlocks!.activeEffects.convenience.extraInventorySlots).toBe(30); // 10 + 20
    });
  });

  describe('Statistics', () => {
    it('should track unlock statistics', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true
      });

      const userId = user._id.toString();

      await unlockService.grantUnlock(userId, 'portrait_frame_bronze', 'test');
      await unlockService.grantUnlock(userId, 'character_slot_3', 'test');
      await unlockService.grantUnlock(userId, 'auto_loot', 'test');

      const accountUnlocks = await AccountUnlocks.findOne({ userId: user._id });
      const stats = accountUnlocks!.stats;

      expect(stats.totalUnlocks).toBe(3);
      expect(stats.unlocksPerCategory[UnlockCategory.COSMETIC]).toBe(1);
      expect(stats.unlocksPerCategory[UnlockCategory.GAMEPLAY]).toBe(1);
      expect(stats.unlocksPerCategory[UnlockCategory.CONVENIENCE]).toBe(1);
      expect(stats.firstUnlockDate).toBeDefined();
      expect(stats.lastUnlockDate).toBeDefined();
    });
  });
});
