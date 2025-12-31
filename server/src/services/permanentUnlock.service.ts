/**
 * Permanent Unlock Service
 * Business logic for account-wide permanent unlocks
 */

import mongoose, { Model } from 'mongoose';
import { AccountUnlocks, IAccountUnlocks } from '../models/AccountUnlocks.model';
import { Character } from '../models/Character.model';
import { User } from '../models/User.model';
import { Achievement } from '../models/Achievement.model';
import { Gang } from '../models/Gang.model';
import {
  PermanentUnlock,
  UnlockRequirement,
  UnlockRequirementType,
  UnlockProgress,
  AvailableUnlock,
  UnlockEffect,
  ClaimUnlockResponse,
  EarnedUnlock,
  UnlockCategory,
  GangRole
} from '@desperados/shared';
import { allUnlocks, getUnlockById } from '../data/unlocks';

// Extend AccountUnlocks Model to include static method
interface IAccountUnlocksModel extends Model<IAccountUnlocks> {
  findOrCreate(userId: mongoose.Types.ObjectId): Promise<IAccountUnlocks>;
}

// Type assertion for AccountUnlocks model with static methods
const AccountUnlocksModel = AccountUnlocks as unknown as IAccountUnlocksModel;

/**
 * Get account unlocks for a user
 */
export async function getAccountUnlocks(userId: string): Promise<IAccountUnlocks> {
  const objectId = new mongoose.Types.ObjectId(userId);
  return await AccountUnlocksModel.findOrCreate(objectId);
}

/**
 * Check if user meets requirements for an unlock
 */
export async function checkUnlockEligibility(
  userId: string,
  unlockId: string
): Promise<{ eligible: boolean; progress: UnlockProgress }> {
  const unlock = getUnlockById(unlockId);
  if (!unlock) {
    throw new Error(`Unlock ${unlockId} not found`);
  }

  const progress = await getUnlockProgress(userId, unlockId);

  return {
    eligible: progress.requirementsMet,
    progress
  };
}

/**
 * Get progress toward earning an unlock
 */
export async function getUnlockProgress(
  userId: string,
  unlockId: string
): Promise<UnlockProgress> {
  const unlock = getUnlockById(unlockId);
  if (!unlock) {
    throw new Error(`Unlock ${unlockId} not found`);
  }

  const objectId = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(objectId);
  if (!user) {
    throw new Error('User not found');
  }

  return await evaluateRequirement(userId, unlock.requirements);
}

/**
 * Evaluate a requirement and return progress
 */
async function evaluateRequirement(
  userId: string,
  requirement: UnlockRequirement
): Promise<UnlockProgress> {
  const objectId = new mongoose.Types.ObjectId(userId);

  // Handle compound requirements
  if (requirement.allOf) {
    const subProgress = await Promise.all(
      requirement.allOf.map(req => evaluateRequirement(userId, req))
    );
    const allMet = subProgress.every(p => p.requirementsMet);
    const avgPercentage = subProgress.reduce((sum, p) => sum + p.percentage, 0) / subProgress.length;

    return {
      unlockId: '',
      currentValue: 0,
      requiredValue: 0,
      percentage: avgPercentage,
      requirementsMet: allMet,
      subProgress: subProgress.map((p, i) => ({
        requirement: requirement.allOf![i].type,
        met: p.requirementsMet,
        current: p.currentValue,
        required: p.requiredValue
      }))
    };
  }

  if (requirement.anyOf) {
    const subProgress = await Promise.all(
      requirement.anyOf.map(req => evaluateRequirement(userId, req))
    );
    const anyMet = subProgress.some(p => p.requirementsMet);
    const maxPercentage = Math.max(...subProgress.map(p => p.percentage));

    return {
      unlockId: '',
      currentValue: 0,
      requiredValue: 0,
      percentage: maxPercentage,
      requirementsMet: anyMet,
      subProgress: subProgress.map((p, i) => ({
        requirement: requirement.anyOf![i].type,
        met: p.requirementsMet,
        current: p.currentValue,
        required: p.requiredValue
      }))
    };
  }

  // Handle simple requirements
  switch (requirement.type) {
    case UnlockRequirementType.ACHIEVEMENT: {
      if (!requirement.achievementId) {
        throw new Error('Achievement ID required');
      }

      const achievement = await Achievement.findOne({
        userId: objectId,
        achievementId: requirement.achievementId,
        unlockedAt: { $exists: true }
      });

      return {
        unlockId: '',
        currentValue: achievement ? 1 : 0,
        requiredValue: 1,
        percentage: achievement ? 100 : 0,
        requirementsMet: !!achievement
      };
    }

    case UnlockRequirementType.LEGACY_TIER: {
      const user = await User.findById(objectId);
      const currentTier = user?.legacyTier || 0;
      const requiredTier = requirement.legacyTier || 0;

      return {
        unlockId: '',
        currentValue: currentTier,
        requiredValue: requiredTier,
        percentage: Math.min(100, (currentTier / requiredTier) * 100),
        requirementsMet: currentTier >= requiredTier
      };
    }

    case UnlockRequirementType.CHARACTER_LEVEL: {
      const characters = await Character.find({ userId: objectId }).select('level').lean();
      const maxLevel = Math.max(...characters.map(c => c.level || 1), 0);
      const requiredLevel = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: maxLevel,
        requiredValue: requiredLevel,
        percentage: Math.min(100, (maxLevel / requiredLevel) * 100),
        requirementsMet: maxLevel >= requiredLevel
      };
    }

    case UnlockRequirementType.GOLD_EARNED: {
      const user = await User.findById(objectId);
      const totalGold = user?.totalGoldEarned || 0;
      const requiredGold = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: totalGold,
        requiredValue: requiredGold,
        percentage: Math.min(100, (totalGold / requiredGold) * 100),
        requirementsMet: totalGold >= requiredGold
      };
    }

    case UnlockRequirementType.CRIMES_COMMITTED: {
      const user = await User.findById(objectId);
      const totalCrimes = user?.totalCrimesCommitted || 0;
      const requiredCrimes = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: totalCrimes,
        requiredValue: requiredCrimes,
        percentage: Math.min(100, (totalCrimes / requiredCrimes) * 100),
        requirementsMet: totalCrimes >= requiredCrimes
      };
    }

    case UnlockRequirementType.DUELS_WON: {
      const user = await User.findById(objectId);
      const totalDuels = user?.totalDuelsWon || 0;
      const requiredDuels = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: totalDuels,
        requiredValue: requiredDuels,
        percentage: Math.min(100, (totalDuels / requiredDuels) * 100),
        requirementsMet: totalDuels >= requiredDuels
      };
    }

    case UnlockRequirementType.TIME_PLAYED: {
      const user = await User.findById(objectId);
      const timePlayed = user?.totalTimePlayed || 0;
      const requiredTime = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: timePlayed,
        requiredValue: requiredTime,
        percentage: Math.min(100, (timePlayed / requiredTime) * 100),
        requirementsMet: timePlayed >= requiredTime
      };
    }

    case UnlockRequirementType.GANG_RANK: {
      // Map gang roles to numeric ranks: LEADER=3, OFFICER=2, MEMBER=1, None=0
      const roleToRank: Record<string, number> = {
        [GangRole.LEADER]: 3,
        [GangRole.OFFICER]: 2,
        [GangRole.MEMBER]: 1
      };

      const characters = await Character.find({ userId: objectId }).select('_id').lean();
      const characterIds = characters.map(c => c._id);

      // Find all gangs where any of the user's characters are members
      const gangs = await Gang.find({
        'members.characterId': { $in: characterIds },
        isActive: true
      }).select('members').lean();

      // Calculate highest rank across all characters
      let maxGangRank = 0;
      for (const gang of gangs) {
        for (const member of gang.members) {
          if (characterIds.some(id => id.toString() === member.characterId.toString())) {
            const rank = roleToRank[member.role] || 0;
            if (rank > maxGangRank) {
              maxGangRank = rank;
            }
          }
        }
      }

      const requiredRank = requirement.minValue || 0;

      return {
        unlockId: '',
        currentValue: maxGangRank,
        requiredValue: requiredRank,
        percentage: Math.min(100, requiredRank > 0 ? (maxGangRank / requiredRank) * 100 : 0),
        requirementsMet: maxGangRank >= requiredRank
      };
    }

    case UnlockRequirementType.EVENT: {
      // Events need to be implemented separately
      // For now, always return false
      return {
        unlockId: '',
        currentValue: 0,
        requiredValue: 1,
        percentage: 0,
        requirementsMet: false
      };
    }

    case UnlockRequirementType.PURCHASE: {
      // Premium purchases need to be implemented separately
      // For now, always return false
      return {
        unlockId: '',
        currentValue: 0,
        requiredValue: 1,
        percentage: 0,
        requirementsMet: false
      };
    }

    default:
      throw new Error(`Unknown requirement type: ${requirement.type}`);
  }
}

/**
 * Grant an unlock to a user
 */
export async function grantUnlock(
  userId: string,
  unlockId: string,
  source: string
): Promise<IAccountUnlocks> {
  const unlock = getUnlockById(unlockId);
  if (!unlock) {
    throw new Error(`Unlock ${unlockId} not found`);
  }

  const objectId = new mongoose.Types.ObjectId(userId);
  const accountUnlocks = await AccountUnlocksModel.findOrCreate(objectId);

  // Check if already unlocked
  if (accountUnlocks.hasUnlock(unlockId)) {
    return accountUnlocks;
  }

  // Add the unlock
  const earnedUnlock: EarnedUnlock = {
    unlockId,
    earnedAt: new Date(),
    source,
    claimed: false
  };

  accountUnlocks.unlocks.push(earnedUnlock);

  // Apply effects
  applyUnlockEffectsToAccount(accountUnlocks, unlock.effects);

  // Update stats
  accountUnlocks.stats.totalUnlocks += 1;
  accountUnlocks.stats.unlocksPerCategory[unlock.category] += 1;

  if (!accountUnlocks.stats.firstUnlockDate) {
    accountUnlocks.stats.firstUnlockDate = new Date();
  }
  accountUnlocks.stats.lastUnlockDate = new Date();

  await accountUnlocks.save();

  return accountUnlocks;
}

/**
 * Apply unlock effects to account unlocks document
 */
function applyUnlockEffectsToAccount(
  accountUnlocks: IAccountUnlocks,
  effects: UnlockEffect
): void {
  // Character slots
  if (effects.extraCharacterSlots) {
    accountUnlocks.activeEffects.totalCharacterSlots += effects.extraCharacterSlots;
  }

  // Cosmetics
  if (effects.portraitFrames) {
    accountUnlocks.activeEffects.cosmetics.portraitFrames.push(...effects.portraitFrames);
  }
  if (effects.nameplateColors) {
    accountUnlocks.activeEffects.cosmetics.nameplateColors.push(...effects.nameplateColors);
  }
  if (effects.titles) {
    accountUnlocks.activeEffects.cosmetics.titles.push(...effects.titles);
  }
  if (effects.chatBadges) {
    accountUnlocks.activeEffects.cosmetics.chatBadges.push(...effects.chatBadges);
  }
  if (effects.profileBackgrounds) {
    accountUnlocks.activeEffects.cosmetics.profileBackgrounds.push(...effects.profileBackgrounds);
  }
  if (effects.deathAnimations) {
    accountUnlocks.activeEffects.cosmetics.deathAnimations.push(...effects.deathAnimations);
  }

  // Gameplay
  if (effects.abilities) {
    accountUnlocks.activeEffects.gameplay.abilities.push(...effects.abilities);
  }
  if (effects.horseBreeds) {
    accountUnlocks.activeEffects.gameplay.horseBreeds.push(...effects.horseBreeds);
  }
  if (effects.companionTypes) {
    accountUnlocks.activeEffects.gameplay.companionTypes.push(...effects.companionTypes);
  }
  if (effects.unlockedLocations) {
    accountUnlocks.activeEffects.gameplay.unlockedLocations.push(...effects.unlockedLocations);
  }
  if (effects.unlockedStartingLocations) {
    accountUnlocks.activeEffects.gameplay.startingLocations.push(...effects.unlockedStartingLocations);
  }

  // Convenience
  if (effects.autoLoot !== undefined) {
    accountUnlocks.activeEffects.convenience.autoLoot = effects.autoLoot;
  }
  if (effects.fastTravelPoints) {
    accountUnlocks.activeEffects.convenience.fastTravelPoints.push(...effects.fastTravelPoints);
  }
  if (effects.inventorySlots) {
    accountUnlocks.activeEffects.convenience.extraInventorySlots += effects.inventorySlots;
  }
  if (effects.bankVaultSlots) {
    accountUnlocks.activeEffects.convenience.extraBankVaultSlots += effects.bankVaultSlots;
  }
  if (effects.mailAttachmentSlots) {
    accountUnlocks.activeEffects.convenience.extraMailAttachmentSlots += effects.mailAttachmentSlots;
  }

  // Prestige
  if (effects.factionAccess) {
    accountUnlocks.activeEffects.prestige.factionAccess.push(...effects.factionAccess);
  }
  if (effects.vipAreas) {
    accountUnlocks.activeEffects.prestige.vipAreas.push(...effects.vipAreas);
  }
  if (effects.npcDialogues) {
    accountUnlocks.activeEffects.prestige.npcDialogues.push(...effects.npcDialogues);
  }
  if (effects.hallOfFameEntry) {
    accountUnlocks.activeEffects.prestige.hallOfFameEntry = true;
  }
}

/**
 * Get available unlocks for a user
 */
export async function getAvailableUnlocks(userId: string): Promise<AvailableUnlock[]> {
  const accountUnlocks = await getAccountUnlocks(userId);
  const earnedIds = new Set(accountUnlocks.unlocks.map(u => u.unlockId));

  const available: AvailableUnlock[] = [];

  for (const unlock of allUnlocks) {
    // Skip hidden unlocks unless progress is significant
    const progress = await getUnlockProgress(userId, unlock.id);

    if (unlock.hidden && progress.percentage < 50) {
      continue;
    }

    available.push({
      ...unlock,
      progress,
      earned: earnedIds.has(unlock.id)
    });
  }

  return available;
}

/**
 * Apply unlock effects when creating a new character
 */
export async function applyUnlockEffectsToCharacter(
  userId: string,
  characterData: any
): Promise<any> {
  const accountUnlocks = await getAccountUnlocks(userId);

  // Apply starting gold
  let totalStartingGold = 0;
  for (const unlock of accountUnlocks.unlocks) {
    const unlockDef = getUnlockById(unlock.unlockId);
    if (unlockDef?.effects.startingGold) {
      totalStartingGold += unlockDef.effects.startingGold;
    }
  }

  if (totalStartingGold > 0) {
    // Set both dollars (new) and gold (legacy) for compatibility
    const currentBalance = characterData.dollars ?? characterData.gold ?? 0;
    characterData.dollars = currentBalance + totalStartingGold;
    characterData.gold = characterData.dollars;
  }

  // Apply starting stats
  const startingStats = { strength: 0, speed: 0, cunning: 0, charisma: 0 };
  for (const unlock of accountUnlocks.unlocks) {
    const unlockDef = getUnlockById(unlock.unlockId);
    if (unlockDef?.effects.startingStats) {
      const stats = unlockDef.effects.startingStats;
      if (stats.strength) startingStats.strength += stats.strength;
      if (stats.speed) startingStats.speed += stats.speed;
      if (stats.cunning) startingStats.cunning += stats.cunning;
      if (stats.charisma) startingStats.charisma += stats.charisma;
    }
  }

  if (startingStats.strength > 0) {
    characterData.strength = (characterData.strength || 0) + startingStats.strength;
  }
  if (startingStats.speed > 0) {
    characterData.speed = (characterData.speed || 0) + startingStats.speed;
  }
  if (startingStats.cunning > 0) {
    characterData.cunning = (characterData.cunning || 0) + startingStats.cunning;
  }
  if (startingStats.charisma > 0) {
    characterData.charisma = (characterData.charisma || 0) + startingStats.charisma;
  }

  return characterData;
}

/**
 * Claim an earned unlock
 */
export async function claimUnlock(userId: string, unlockId: string): Promise<ClaimUnlockResponse> {
  const unlock = getUnlockById(unlockId);
  if (!unlock) {
    throw new Error(`Unlock ${unlockId} not found`);
  }

  const objectId = new mongoose.Types.ObjectId(userId);
  const accountUnlocks = await AccountUnlocksModel.findOrCreate(objectId);

  const success = accountUnlocks.claimUnlock(unlockId);
  if (!success) {
    throw new Error('Unlock not found or already claimed');
  }

  await accountUnlocks.save();

  // Check if claiming this unlock unlocked other things
  const newlyUnlocked: PermanentUnlock[] = [];
  // This could be expanded to check for unlocks that require having other unlocks

  return {
    success: true,
    unlock,
    effects: unlock.effects,
    newlyUnlocked
  };
}

/**
 * Sync unlocks based on legacy tier milestones
 */
export async function syncLegacyUnlocks(userId: string): Promise<void> {
  const user = await User.findById(new mongoose.Types.ObjectId(userId));
  if (!user) {
    throw new Error('User not found');
  }

  const legacyTier = user.legacyTier || 0;

  // Grant unlocks for all legacy tiers up to current tier
  const legacyUnlocks = allUnlocks.filter(
    u => u.requirements.type === UnlockRequirementType.LEGACY_TIER &&
         (u.requirements.legacyTier || 0) <= legacyTier
  );

  for (const unlock of legacyUnlocks) {
    const { eligible } = await checkUnlockEligibility(userId, unlock.id);
    if (eligible) {
      await grantUnlock(userId, unlock.id, `legacy:tier_${legacyTier}`);
    }
  }
}

/**
 * Check and grant unlocks based on achievement
 */
export async function checkAchievementUnlocks(
  userId: string,
  achievementId: string
): Promise<void> {
  const achievementUnlocks = allUnlocks.filter(
    u => u.requirements.type === UnlockRequirementType.ACHIEVEMENT &&
         u.requirements.achievementId === achievementId
  );

  for (const unlock of achievementUnlocks) {
    await grantUnlock(userId, unlock.id, `achievement:${achievementId}`);
  }
}

/**
 * Validate character slot availability
 */
export async function canCreateCharacter(userId: string): Promise<boolean> {
  const accountUnlocks = await getAccountUnlocks(userId);
  const maxSlots = accountUnlocks.activeEffects.totalCharacterSlots;

  const objectId = new mongoose.Types.ObjectId(userId);
  const characterCount = await Character.countDocuments({ userId: objectId });

  return characterCount < maxSlots;
}

/**
 * Get max character slots for user
 */
export async function getMaxCharacterSlots(userId: string): Promise<number> {
  const accountUnlocks = await getAccountUnlocks(userId);
  return accountUnlocks.activeEffects.totalCharacterSlots;
}
