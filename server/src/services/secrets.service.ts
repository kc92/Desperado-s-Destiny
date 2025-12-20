/**
 * Secrets Service
 * Manages hidden content discovery and rewards in Desperados Destiny
 */

import mongoose from 'mongoose';
import {
  SecretDefinition,
  CharacterSecret,
  ISecretDefinition,
  ICharacterSecret,
  SecretRequirement,
  SecretReward
} from '../models/Secret.model';
import { Character, ICharacter } from '../models/Character.model';
import { CharacterQuest } from '../models/Quest.model';
import { Achievement } from '../models/Achievement.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Result of checking if a character can unlock a secret
 */
export interface SecretUnlockCheck {
  canUnlock: boolean;
  requirements: SecretRequirement[];
  metRequirements: string[];
  unmetRequirements: string[];
  progress?: number; // Percentage (0-100)
}

/**
 * Result of unlocking a secret
 */
export interface SecretUnlockResult {
  success: boolean;
  reward?: SecretReward[];
  message: string;
  secret?: ICharacterSecret;
}

/**
 * Location secrets summary
 */
export interface LocationSecretsResult {
  discovered: Array<ISecretDefinition & { discoveredAt: Date; rewardClaimed: boolean }>;
  hidden: number;
  hints: Array<{ secretId: string; hint: string }>;
}

/**
 * Discovered secret with details
 */
export interface DiscoveredSecret extends ICharacterSecret {
  definition?: ISecretDefinition;
}

export class SecretsService {
  /**
   * Check if a character can unlock a specific secret
   */
  static async canUnlockSecret(
    characterId: string,
    secretId: string
  ): Promise<SecretUnlockCheck> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const secretDef = await SecretDefinition.findOne({ secretId, isActive: true });
    if (!secretDef) {
      throw new AppError('Secret not found', 404);
    }

    // Check if already discovered (for non-repeatable secrets)
    if (!secretDef.isRepeatable) {
      const existing = await CharacterSecret.findOne({ characterId, secretId });
      if (existing) {
        return {
          canUnlock: false,
          requirements: secretDef.requirements,
          metRequirements: [],
          unmetRequirements: ['Secret already discovered'],
          progress: 100
        };
      }
    } else {
      // Check cooldown for repeatable secrets
      const existing = await CharacterSecret.findOne({ characterId, secretId });
      if (existing && existing.lastDiscoveredAt && secretDef.cooldownMinutes) {
        const cooldownMs = secretDef.cooldownMinutes * 60 * 1000;
        const timeSince = Date.now() - existing.lastDiscoveredAt.getTime();
        if (timeSince < cooldownMs) {
          const minutesLeft = Math.ceil((cooldownMs - timeSince) / 60000);
          return {
            canUnlock: false,
            requirements: secretDef.requirements,
            metRequirements: [],
            unmetRequirements: [`Cooldown active: ${minutesLeft} minutes remaining`],
            progress: 0
          };
        }
      }
    }

    const metRequirements: string[] = [];
    const unmetRequirements: string[] = [];

    // Check each requirement
    for (const req of secretDef.requirements) {
      const met = await this.checkRequirement(character, req);
      if (met) {
        metRequirements.push(req.description);
      } else {
        unmetRequirements.push(req.description);
      }
    }

    const progress = secretDef.requirements.length > 0
      ? Math.round((metRequirements.length / secretDef.requirements.length) * 100)
      : 100;

    return {
      canUnlock: unmetRequirements.length === 0,
      requirements: secretDef.requirements,
      metRequirements,
      unmetRequirements,
      progress
    };
  }

  /**
   * Check a single requirement
   */
  private static async checkRequirement(
    character: ICharacter,
    requirement: SecretRequirement
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'npc_trust':
        // TODO: Implement NPC trust system tracking
        // For now, return true to allow testing
        // In production: check character's trust level with the NPC
        return true;

      case 'quest_complete':
        if (!requirement.questId) return false;
        const quest = await CharacterQuest.findOne({
          characterId: character._id,
          questId: requirement.questId,
          status: 'completed'
        });
        return !!quest;

      case 'item_owned':
        if (!requirement.itemId) return false;
        const hasItem = character.inventory.some(inv => inv.itemId === requirement.itemId);
        return hasItem;

      case 'level':
        if (!requirement.minLevel) return false;
        return character.level >= requirement.minLevel;

      case 'faction_standing':
        if (!requirement.faction || !requirement.minReputation) return false;
        const factionRep = character.factionReputation[requirement.faction];
        return factionRep >= requirement.minReputation;

      case 'time':
        if (requirement.startHour === undefined || requirement.endHour === undefined) return false;
        const currentHour = new Date().getHours();

        // Handle overnight time ranges (e.g., 22-2)
        if (requirement.startHour > requirement.endHour) {
          return currentHour >= requirement.startHour || currentHour <= requirement.endHour;
        }
        return currentHour >= requirement.startHour && currentHour <= requirement.endHour;

      case 'secret_known':
        if (!requirement.secretId) return false;
        const knownSecret = await CharacterSecret.findOne({
          characterId: character._id,
          secretId: requirement.secretId
        });
        return !!knownSecret;

      case 'achievement':
        if (!requirement.achievementType) return false;
        const achievement = await Achievement.findOne({
          characterId: character._id,
          achievementType: requirement.achievementType,
          completed: true
        });
        return !!achievement;

      case 'skill_level':
        if (!requirement.skillId || requirement.skillLevel === undefined) return false;
        const skillLevel = character.getSkillLevel(requirement.skillId);
        return skillLevel >= requirement.skillLevel;

      case 'location_visit':
        // TODO: Implement location visit tracking
        // For now, return true to allow testing
        // In production: track how many times character has visited each location
        return true;

      default:
        return false;
    }
  }

  /**
   * Unlock a secret for a character
   */
  static async unlockSecret(
    characterId: string,
    secretId: string
  ): Promise<SecretUnlockResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if can unlock
      const unlockCheck = await this.canUnlockSecret(characterId, secretId);
      if (!unlockCheck.canUnlock) {
        return {
          success: false,
          message: `Cannot unlock secret. Missing requirements: ${unlockCheck.unmetRequirements.join(', ')}`
        };
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const secretDef = await SecretDefinition.findOne({ secretId, isActive: true });
      if (!secretDef) {
        throw new AppError('Secret definition not found', 404);
      }

      // Create or update character secret
      let characterSecret = await CharacterSecret.findOne({ characterId, secretId });

      if (!characterSecret) {
        // First discovery
        const created = await CharacterSecret.create([{
          characterId,
          secretId,
          discoveredAt: new Date(),
          rewardClaimed: false,
          discoveryCount: 1,
          lastDiscoveredAt: new Date()
        }], { session });
        characterSecret = created[0] as any;
      } else {
        // Repeatable secret - update discovery
        characterSecret.lastDiscoveredAt = new Date();
        characterSecret.discoveryCount = (characterSecret.discoveryCount || 0) + 1;
        characterSecret.rewardClaimed = false;
        await characterSecret.save({ session });
      }

      // Grant rewards
      await this.grantRewards(character, secretDef.rewards, secretId, session);

      // Mark rewards as claimed
      characterSecret.rewardClaimed = true;
      await characterSecret.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        reward: secretDef.rewards,
        message: `Secret discovered: ${secretDef.name}!`,
        secret: characterSecret
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Grant rewards to character
   */
  private static async grantRewards(
    character: ICharacter,
    rewards: SecretReward[],
    secretId: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'dollars':
          if (reward.amount) {
            await DollarService.addDollars(
              character._id.toString(),
              reward.amount,
              TransactionSource.SECRET_DISCOVERY,
              { secretId, amount: reward.amount },
              session
            );
          }
          break;

        case 'xp':
          if (reward.amount) {
            await character.addExperience(reward.amount);
          }
          break;

        case 'item':
          if (reward.itemId) {
            const existing = character.inventory.find(inv => inv.itemId === reward.itemId);
            if (existing) {
              existing.quantity += 1;
            } else {
              character.inventory.push({
                itemId: reward.itemId,
                quantity: 1,
                acquiredAt: new Date()
              });
            }
          }
          break;

        case 'quest_unlock':
          // Quest will become available through normal quest system
          // No direct action needed here
          break;

        case 'location_access':
          // Location access will be checked by location service
          // No direct action needed here
          break;

        case 'npc_dialogue':
          // NPC dialogue will be unlocked through NPC system
          // No direct action needed here
          break;

        case 'lore_entry':
          // Lore entries tracked separately
          // Could implement a LoreEntry model in the future
          break;

        case 'achievement':
          // Achievements granted through achievement system
          if (reward.achievementType) {
            try {
              // Dynamic import to avoid circular dependency
              // TODO: Implement achievement service
              // const { AchievementService } = await import('./achievement.service');
              // await AchievementService.checkAndGrantAchievement(
              //   character._id.toString(),
              //   reward.achievementType
              // );
            } catch (error) {
              // Don't fail reward granting if achievement fails
              logger.error('Failed to grant achievement from secret', { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
            }
          }
          break;
      }
    }

    await character.save({ session });
  }

  /**
   * Get all secrets at a location
   */
  static async getLocationSecrets(
    locationId: string,
    characterId: string
  ): Promise<LocationSecretsResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get all active secrets for this location
    const locationSecrets = await SecretDefinition.find({
      locationId,
      isActive: true
    });

    // Get character's discovered secrets
    const discoveredSecretIds = await CharacterSecret.find({
      characterId,
      secretId: { $in: locationSecrets.map(s => s.secretId) }
    });

    const discoveredMap = new Map(
      discoveredSecretIds.map(ds => [ds.secretId, ds])
    );

    const discovered: Array<ISecretDefinition & { discoveredAt: Date; rewardClaimed: boolean }> = [];
    const hints: Array<{ secretId: string; hint: string }> = [];
    let hiddenCount = 0;

    for (const secret of locationSecrets) {
      const charSecret = discoveredMap.get(secret.secretId);

      if (charSecret) {
        // Already discovered
        discovered.push({
          ...secret.toObject(),
          discoveredAt: charSecret.discoveredAt,
          rewardClaimed: charSecret.rewardClaimed
        } as any);
      } else {
        // Not yet discovered
        hiddenCount++;

        // Check if character meets some requirements (show hint if partially qualified)
        const unlockCheck = await this.canUnlockSecret(characterId, secret.secretId);
        if (unlockCheck.progress && unlockCheck.progress >= 50 && secret.hint) {
          hints.push({
            secretId: secret.secretId,
            hint: secret.hint
          });
        }
      }
    }

    return {
      discovered,
      hidden: hiddenCount,
      hints
    };
  }

  /**
   * Check and auto-unlock any secrets character now qualifies for
   * Called after significant character changes (level up, quest complete, etc.)
   */
  static async checkSecretProgress(characterId: string): Promise<ISecretDefinition[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get all active secrets
    const allSecrets = await SecretDefinition.find({ isActive: true });

    // Get already discovered secrets
    const discoveredSecrets = await CharacterSecret.find({ characterId });
    const discoveredIds = new Set(discoveredSecrets.map(ds => ds.secretId));

    const newlyQualified: ISecretDefinition[] = [];

    for (const secret of allSecrets) {
      // Skip if already discovered and not repeatable
      if (!secret.isRepeatable && discoveredIds.has(secret.secretId)) {
        continue;
      }

      // Check if now qualifies
      const unlockCheck = await this.canUnlockSecret(characterId, secret.secretId);
      if (unlockCheck.canUnlock) {
        // Note: We don't auto-unlock, just notify that they qualify
        // Player should manually discover secrets for better game experience
        newlyQualified.push(secret);
      }
    }

    return newlyQualified;
  }

  /**
   * Get all secrets discovered by a character
   */
  static async getDiscoveredSecrets(characterId: string): Promise<DiscoveredSecret[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const discoveredSecrets = await CharacterSecret.find({ characterId })
      .sort({ discoveredAt: -1 });

    const secretsWithDefinitions: DiscoveredSecret[] = [];

    for (const charSecret of discoveredSecrets) {
      const definition = await SecretDefinition.findOne({ secretId: charSecret.secretId });
      secretsWithDefinitions.push({
        ...charSecret.toObject(),
        definition: definition || undefined
      } as any);
    }

    return secretsWithDefinitions;
  }

  /**
   * Get secrets by type
   */
  static async getSecretsByType(
    characterId: string,
    type: string
  ): Promise<{ discovered: DiscoveredSecret[]; available: ISecretDefinition[] }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get all secrets of this type
    const allSecretsOfType = await SecretDefinition.find({ type, isActive: true });

    // Get character's discovered secrets of this type
    const discoveredSecrets = await CharacterSecret.find({
      characterId,
      secretId: { $in: allSecretsOfType.map(s => s.secretId) }
    });

    const discoveredMap = new Map(discoveredSecrets.map(ds => [ds.secretId, ds]));

    const discovered: DiscoveredSecret[] = [];
    const available: ISecretDefinition[] = [];

    for (const secret of allSecretsOfType) {
      const charSecret = discoveredMap.get(secret.secretId);

      if (charSecret) {
        discovered.push({
          ...charSecret.toObject(),
          definition: secret
        } as any);
      } else {
        // Check if available to unlock
        const unlockCheck = await this.canUnlockSecret(characterId, secret.secretId);
        if (unlockCheck.canUnlock || (unlockCheck.progress && unlockCheck.progress > 0)) {
          available.push(secret);
        }
      }
    }

    return { discovered, available };
  }

  /**
   * Get secret details with unlock progress
   */
  static async getSecretDetails(
    characterId: string,
    secretId: string
  ): Promise<{
    definition: ISecretDefinition;
    discovered: ICharacterSecret | null;
    unlockCheck: SecretUnlockCheck;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const definition = await SecretDefinition.findOne({ secretId, isActive: true });
    if (!definition) {
      throw new AppError('Secret not found', 404);
    }

    const discovered = await CharacterSecret.findOne({ characterId, secretId });
    const unlockCheck = await this.canUnlockSecret(characterId, secretId);

    return {
      definition,
      discovered,
      unlockCheck
    };
  }

  /**
   * Get secrets related to an NPC
   */
  static async getNPCSecrets(
    npcId: string,
    characterId: string
  ): Promise<{
    discovered: DiscoveredSecret[];
    available: Array<ISecretDefinition & { progress: number }>;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const npcSecrets = await SecretDefinition.find({ npcId, isActive: true });

    const discoveredSecrets = await CharacterSecret.find({
      characterId,
      secretId: { $in: npcSecrets.map(s => s.secretId) }
    });

    const discoveredMap = new Map(discoveredSecrets.map(ds => [ds.secretId, ds]));

    const discovered: DiscoveredSecret[] = [];
    const available: Array<ISecretDefinition & { progress: number }> = [];

    for (const secret of npcSecrets) {
      const charSecret = discoveredMap.get(secret.secretId);

      if (charSecret) {
        discovered.push({
          ...charSecret.toObject(),
          definition: secret
        } as any);
      } else {
        const unlockCheck = await this.canUnlockSecret(characterId, secret.secretId);
        if (unlockCheck.progress && unlockCheck.progress > 0) {
          available.push({
            ...secret.toObject(),
            progress: unlockCheck.progress
          } as any);
        }
      }
    }

    return { discovered, available };
  }

  /**
   * Get character's secret statistics
   */
  static async getSecretStatistics(characterId: string): Promise<{
    totalDiscovered: number;
    byType: Record<string, number>;
    totalAvailable: number;
    recentDiscoveries: DiscoveredSecret[];
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const discoveredSecrets = await CharacterSecret.find({ characterId });
    const secretIds = discoveredSecrets.map(ds => ds.secretId);

    const definitions = await SecretDefinition.find({
      secretId: { $in: secretIds }
    });

    const byType: Record<string, number> = {};
    for (const def of definitions) {
      byType[def.type] = (byType[def.type] || 0) + 1;
    }

    const totalAvailable = await SecretDefinition.countDocuments({ isActive: true });

    const recentDiscoveries = await CharacterSecret.find({ characterId })
      .sort({ discoveredAt: -1 })
      .limit(5);

    const recentWithDefs: DiscoveredSecret[] = [];
    for (const charSecret of recentDiscoveries) {
      const definition = await SecretDefinition.findOne({ secretId: charSecret.secretId });
      recentWithDefs.push({
        ...charSecret.toObject(),
        definition: definition || undefined
      } as any);
    }

    return {
      totalDiscovered: discoveredSecrets.length,
      byType,
      totalAvailable,
      recentDiscoveries: recentWithDefs
    };
  }
}
