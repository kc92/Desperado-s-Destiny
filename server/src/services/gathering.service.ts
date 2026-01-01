/**
 * Gathering Service
 * Handles resource gathering mechanics
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { Location } from '../models/Location.model';
import { EnergyService } from './energy.service';
import { SkillService } from './skill.service';
import {
  GATHERING_NODES,
  GatheringNode,
  GatheringYield,
  GatheringType,
  getNodeById,
  getNodesAtLocation,
} from '../data/gatheringNodes';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { getRedisClient } from '../config/redis';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert a location name to a slug for matching gathering nodes
 * e.g., "Western Outpost" -> "western-outpost"
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .trim();
}

/**
 * Resolve a location ObjectId or slug to a slug string for gathering node matching
 * Handles both ObjectId strings and already-slug strings
 */
async function resolveLocationSlug(locationIdOrSlug: string): Promise<string> {
  // If it looks like a slug already (contains hyphens and lowercase letters), use it directly
  if (locationIdOrSlug.includes('-') && /^[a-z0-9-]+$/.test(locationIdOrSlug)) {
    return locationIdOrSlug;
  }

  // Try to look up as ObjectId
  if (mongoose.Types.ObjectId.isValid(locationIdOrSlug)) {
    const location = await Location.findById(locationIdOrSlug).lean();
    if (location) {
      return nameToSlug(location.name);
    }
  }

  // Fallback: try to find by name
  const locationByName = await Location.findOne({
    name: { $regex: new RegExp(`^${locationIdOrSlug}$`, 'i') }
  }).lean();
  if (locationByName) {
    return nameToSlug(locationByName.name);
  }

  // Last resort: assume it's already a slug or return as-is
  return nameToSlug(locationIdOrSlug);
}

// ============================================================================
// TYPES
// ============================================================================

export interface GatheringResult {
  success: boolean;
  message: string;
  loot: GatheringLootItem[];
  xpGained: number;
  skillLevelUp?: {
    skillId: string;
    newLevel: number;
  };
  cooldownEndsAt: Date;
  energySpent: number;
}

export interface GatheringLootItem {
  itemId: string;
  name: string;
  quantity: number;
  quality?: 'poor' | 'common' | 'good' | 'excellent';
  rarity?: string;
}

export interface GatheringCooldown {
  nodeId: string;
  endsAt: Date;
  remainingSeconds: number;
}

export interface GatheringRequirements {
  canGather: boolean;
  errors: string[];
  missingRequirements: {
    skillLevel?: { required: number; current: number };
    energy?: { required: number; current: number };
    tool?: string;
  };
  cooldownRemaining?: number;
}

// ============================================================================
// GATHERING SERVICE CLASS
// ============================================================================

// Redis key prefix for gathering cooldowns
const COOLDOWN_KEY_PREFIX = 'gathering:cooldown';

export class GatheringService {
  /**
   * Get Redis key for a character's node cooldown
   */
  private static getCooldownKey(characterId: string, nodeId: string): string {
    return `${COOLDOWN_KEY_PREFIX}:${characterId}:${nodeId}`;
  }

  /**
   * Get Redis key pattern for all cooldowns of a character
   */
  private static getCooldownPattern(characterId: string): string {
    return `${COOLDOWN_KEY_PREFIX}:${characterId}:*`;
  }

  /**
   * Get all gathering nodes available at a location
   */
  static async getNodesAtLocation(
    characterId: string,
    locationId?: string
  ): Promise<{ nodes: GatheringNode[]; available: GatheringNode[]; cooldowns: GatheringCooldown[] }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const rawLocation = locationId || character.currentLocation;
    // Resolve ObjectId to slug for gathering node matching
    const locationSlug = await resolveLocationSlug(rawLocation);
    logger.debug(`Gathering: resolved location "${rawLocation}" to slug "${locationSlug}"`);
    const allNodes = getNodesAtLocation(locationSlug);

    // Get character skill levels
    const skillLevels: Record<string, number> = {};
    for (const skill of character.skills || []) {
      skillLevels[skill.skillId.toLowerCase()] = skill.level;
    }

    // Filter available nodes
    const available = allNodes.filter(node => {
      const playerLevel = skillLevels[node.skillRequired] || 0;
      return playerLevel >= node.levelRequired;
    });

    // Get cooldowns from Redis
    const cooldowns = await this.getActiveCooldowns(characterId.toString());

    return {
      nodes: allNodes,
      available,
      cooldowns,
    };
  }

  /**
   * Check if a character can gather from a specific node
   */
  static async checkRequirements(
    characterId: string,
    nodeId: string
  ): Promise<GatheringRequirements> {
    const result: GatheringRequirements = {
      canGather: true,
      errors: [],
      missingRequirements: {},
    };

    const character = await Character.findById(characterId);
    if (!character) {
      result.canGather = false;
      result.errors.push('Character not found');
      return result;
    }

    const node = getNodeById(nodeId);
    if (!node) {
      result.canGather = false;
      result.errors.push('Gathering node not found');
      return result;
    }

    // Check location - resolve ObjectId to slug for comparison
    const locationSlug = await resolveLocationSlug(character.currentLocation);
    if (!node.locationIds.includes(locationSlug)) {
      result.canGather = false;
      result.errors.push(`This resource is not available at your current location`);
    }

    // Check skill level
    const playerSkillLevel = character.getSkillLevel(node.skillRequired);
    if (playerSkillLevel < node.levelRequired) {
      result.canGather = false;
      result.errors.push(
        `Requires ${node.skillRequired} level ${node.levelRequired} (you have ${playerSkillLevel})`
      );
      result.missingRequirements.skillLevel = {
        required: node.levelRequired,
        current: playerSkillLevel,
      };
    }

    // Check energy
    if (character.energy < node.energyCost) {
      result.canGather = false;
      result.errors.push(
        `Requires ${node.energyCost} energy (you have ${character.energy})`
      );
      result.missingRequirements.energy = {
        required: node.energyCost,
        current: character.energy,
      };
    }

    // Check cooldown from Redis
    const cooldownRemaining = await this.getCooldownRemaining(characterId.toString(), nodeId);
    if (cooldownRemaining > 0) {
      result.canGather = false;
      result.errors.push(
        `This resource is on cooldown (${Math.ceil(cooldownRemaining)}s remaining)`
      );
      result.cooldownRemaining = cooldownRemaining;
    }

    // Check tool (warning only, not blocking)
    if (node.toolRequired) {
      const hasTool = character.inventory.some(
        item => item.itemId.toLowerCase().includes(node.toolRequired!.toLowerCase())
      );
      if (!hasTool) {
        result.missingRequirements.tool = node.toolRequired;
        // Don't block, just reduce yield
      }
    }

    return result;
  }

  /**
   * Attempt to gather resources from a node
   */
  static async gather(
    characterId: string,
    nodeId: string
  ): Promise<GatheringResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check requirements
      const requirements = await this.checkRequirements(characterId, nodeId);
      if (!requirements.canGather) {
        throw new AppError(requirements.errors[0] || 'Cannot gather', 400);
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const node = getNodeById(nodeId)!;

      // Spend energy directly on character (don't use EnergyService to avoid write conflict)
      // Regenerate energy first to get current amount
      EnergyService.regenerateEnergy(character);
      if (character.energy < node.energyCost) {
        throw new AppError('Insufficient energy', 400);
      }
      character.energy -= node.energyCost;

      // Get skill level for quality calculations
      const skillLevel = character.getSkillLevel(node.skillRequired);

      // Check for tool bonus
      let toolBonus = 0;
      if (node.toolRequired) {
        const hasTool = character.inventory.some(
          item => item.itemId.toLowerCase().includes(node.toolRequired!.toLowerCase())
        );
        if (hasTool) {
          toolBonus = node.toolBonus || 0;
        }
      }

      // Roll for loot
      const loot = this.rollLoot(node, skillLevel, toolBonus);

      // Add loot to inventory
      for (const item of loot) {
        const existingItem = character.inventory.find(i => i.itemId === item.itemId);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          character.inventory.push({
            itemId: item.itemId,
            quantity: item.quantity,
            acquiredAt: new Date(),
          });
        }
      }

      // Calculate and award skill XP
      const xpGained = this.calculateXP(node, skillLevel, loot.length);
      let skillLevelUp: { skillId: string; newLevel: number } | undefined;

      // Find the skill and add XP
      const skillIndex = character.skills.findIndex(
        s => s.skillId.toLowerCase() === node.skillRequired.toLowerCase()
      );
      if (skillIndex >= 0) {
        const skill = character.skills[skillIndex];
        skill.experience += xpGained;

        // Check for level up (simple formula: 100 * level^1.5)
        const xpForNextLevel = Math.floor(100 * Math.pow(skill.level, 1.5));
        if (skill.experience >= xpForNextLevel) {
          skill.level += 1;
          skill.experience -= xpForNextLevel;
          skillLevelUp = {
            skillId: node.skillRequired,
            newLevel: skill.level,
          };
        }
      }

      // Set cooldown in Redis
      const cooldownEndsAt = new Date(Date.now() + node.cooldownSeconds * 1000);
      await this.setCooldown(characterId, nodeId, cooldownEndsAt);

      // Mark modified nested arrays for Mongoose change detection
      character.markModified('inventory');
      character.markModified('skills');

      // Save character
      await character.save({ session });
      await session.commitTransaction();

      logger.info(
        `Character ${character.name} gathered from ${node.name}: ${loot.map(l => `${l.quantity}x ${l.name}`).join(', ')}`
      );

      return {
        success: true,
        message: `Successfully gathered from ${node.name}`,
        loot,
        xpGained,
        skillLevelUp,
        cooldownEndsAt,
        energySpent: node.energyCost,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Roll for loot from a gathering node
   */
  private static rollLoot(
    node: GatheringNode,
    skillLevel: number,
    toolBonus: number
  ): GatheringLootItem[] {
    const loot: GatheringLootItem[] = [];

    for (const yield_ of node.yields) {
      // Roll for chance (skill level improves chances slightly)
      const skillBonus = Math.min(10, skillLevel - node.levelRequired); // Max +10%
      const effectiveChance = Math.min(100, yield_.chance + skillBonus + (toolBonus / 2));

      if (!SecureRNG.chance(effectiveChance / 100)) {
        continue;
      }

      // Roll for quantity
      let quantity = SecureRNG.range(yield_.minQuantity, yield_.maxQuantity);
      if (quantity <= 0) continue;

      // Apply tool bonus to quantity
      if (toolBonus > 0 && SecureRNG.chance(toolBonus / 100)) {
        quantity += 1;
      }

      // Determine quality if affected by skill
      let quality: GatheringLootItem['quality'] = 'common';
      if (yield_.qualityAffected) {
        const qualityRoll = SecureRNG.d100();
        const skillQualityBonus = Math.min(20, skillLevel * 0.5); // Max +20%

        if (qualityRoll < 5 + skillQualityBonus) {
          quality = 'excellent';
        } else if (qualityRoll < 20 + skillQualityBonus) {
          quality = 'good';
        } else if (qualityRoll > 90 - (skillLevel * 0.3)) {
          quality = 'poor';
        }
      }

      loot.push({
        itemId: yield_.itemId,
        name: yield_.name,
        quantity,
        quality,
        rarity: yield_.rarity,
      });
    }

    return loot;
  }

  /**
   * Calculate XP gained from gathering
   */
  private static calculateXP(
    node: GatheringNode,
    skillLevel: number,
    itemsGathered: number
  ): number {
    // Base XP from node difficulty
    const baseXP = node.levelRequired * 3 + 5;

    // Bonus for gathering multiple items
    const itemBonus = Math.min(10, itemsGathered * 2);

    // Penalty/bonus based on level difference
    const levelDiff = node.levelRequired - skillLevel;
    let levelMultiplier = 1.0;
    if (levelDiff > 0) {
      // Harder content = more XP
      levelMultiplier = 1 + (levelDiff * 0.1);
    } else if (levelDiff < -10) {
      // Much easier content = reduced XP
      levelMultiplier = 0.5;
    }

    return Math.floor((baseXP + itemBonus) * levelMultiplier);
  }

  // ============================================================================
  // COOLDOWN MANAGEMENT (Redis-backed for horizontal scaling)
  // ============================================================================

  /**
   * Set a cooldown for a node using Redis with automatic expiration
   */
  private static async setCooldown(characterId: string, nodeId: string, expiresAt: Date): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = this.getCooldownKey(characterId, nodeId);
      const ttlMs = expiresAt.getTime() - Date.now();
      const ttlSeconds = Math.ceil(ttlMs / 1000);

      if (ttlSeconds > 0) {
        // Store expiration timestamp with auto-expiry
        await redis.setEx(key, ttlSeconds, expiresAt.getTime().toString());
      }
    } catch (error) {
      logger.error('Failed to set gathering cooldown in Redis:', error);
      // Fail silently - cooldown won't be enforced but gathering will still work
    }
  }

  /**
   * Get remaining cooldown in seconds from Redis
   */
  private static async getCooldownRemaining(characterId: string, nodeId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const key = this.getCooldownKey(characterId, nodeId);
      const expiresAtStr = await redis.get(key);

      if (!expiresAtStr) return 0;

      const expiresAt = parseInt(expiresAtStr, 10);
      const remaining = (expiresAt - Date.now()) / 1000;

      return remaining > 0 ? remaining : 0;
    } catch (error) {
      logger.error('Failed to get gathering cooldown from Redis:', error);
      return 0; // Allow gathering if Redis fails
    }
  }

  /**
   * Get all active cooldowns for a character from Redis
   */
  static async getActiveCooldowns(characterId: string): Promise<GatheringCooldown[]> {
    try {
      const redis = getRedisClient();
      const pattern = this.getCooldownPattern(characterId);
      const now = Date.now();
      const active: GatheringCooldown[] = [];

      // Use SCAN for non-blocking iteration
      let cursor = 0;
      do {
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;

        for (const key of result.keys) {
          const expiresAtStr = await redis.get(key);
          if (!expiresAtStr) continue;

          const expiresAt = parseInt(expiresAtStr, 10);
          const remaining = (expiresAt - now) / 1000;

          if (remaining > 0) {
            // Extract nodeId from key: gathering:cooldown:{characterId}:{nodeId}
            const nodeId = key.split(':').pop() || '';
            active.push({
              nodeId,
              endsAt: new Date(expiresAt),
              remainingSeconds: remaining,
            });
          }
        }
      } while (cursor !== 0);

      return active;
    } catch (error) {
      logger.error('Failed to get active gathering cooldowns from Redis:', error);
      return []; // Return empty if Redis fails
    }
  }

  /**
   * Clear all cooldowns for a character (admin function)
   */
  static async clearCooldowns(characterId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const pattern = this.getCooldownPattern(characterId);

      // Use SCAN + DEL for safe deletion
      let cursor = 0;
      do {
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;

        if (result.keys.length > 0) {
          await redis.del(result.keys);
        }
      } while (cursor !== 0);
    } catch (error) {
      logger.error('Failed to clear gathering cooldowns from Redis:', error);
    }
  }
}
