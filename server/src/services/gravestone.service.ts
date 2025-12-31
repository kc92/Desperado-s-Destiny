/**
 * Gravestone Service
 *
 * Handles creation of gravestones when characters die permanently,
 * and manages the inheritance system for visiting ancestors' graves.
 */

import mongoose from 'mongoose';
import { Gravestone, IGravestone, GravestoneHeirloom } from '../models/Gravestone.model';
import { Character, ICharacter } from '../models/Character.model';
import { SecureRNG } from './base/SecureRNG';
import karmaService from './karma.service';
import logger from '../utils/logger';
import {
  DeathType,
  InheritanceTier,
  INHERITANCE_TIERS,
  GRAVESTONE_GOLD_POOL_PERCENT,
  HEIRLOOM_DEGRADATION,
  PRESTIGE_INHERITANCE_BONUS,
  EPITAPH_TEMPLATES
} from '@desperados/shared';

/**
 * Result of creating a gravestone
 */
export interface GravestoneCreationResult {
  gravestone: IGravestone;
  epitaph: string;
}

export class GravestoneService {
  /**
   * Create a gravestone for a permanently dead character
   */
  static async createGravestone(
    character: ICharacter,
    session?: mongoose.ClientSession
  ): Promise<GravestoneCreationResult> {
    // Generate epitaph based on karma
    const epitaph = await this.generateEpitaph(character);

    // Calculate gold pool (50% of character's gold)
    const characterGold = character.dollars ?? character.gold ?? 0;
    const goldPool = Math.floor(characterGold * GRAVESTONE_GOLD_POOL_PERCENT);

    // Select heirloom items (top quality items from inventory)
    const heirloomItems = await this.selectHeirloomItems(character);

    // Build skill memory
    const skillMemory = new Map<string, number>();
    for (const skill of character.skills || []) {
      skillMemory.set(skill.skillId, skill.level);
    }

    // Get prestige tier
    const prestigeTier = character.prestige?.currentRank || 0;

    // Create gravestone
    const gravestone = new Gravestone({
      characterId: character._id,
      characterName: character.name,
      userId: character.userId,

      level: character.level,
      deathLocation: character.currentLocation,
      causeOfDeath: character.causeOfDeath || DeathType.COMBAT,
      killerName: character.killedBy,
      epitaph,
      diedAt: character.diedAt || new Date(),

      faction: character.faction,
      totalPlayTime: 0, // Would need to track this
      totalKills: character.combatStats?.kills || 0,
      totalDeaths: character.combatStats?.totalDeaths || 0,
      highestBounty: character.bountyAmount || 0,

      goldPool,
      heirloomItems,
      skillMemory,
      prestigeTier,

      claimed: false
    });

    await gravestone.save(session ? { session } : undefined);

    logger.info(
      `Gravestone created for ${character.name} at ${character.currentLocation}. ` +
      `Gold pool: ${goldPool}, Heirlooms: ${heirloomItems.length}`
    );

    return { gravestone, epitaph };
  }

  /**
   * Generate an epitaph based on character's karma
   */
  private static async generateEpitaph(character: ICharacter): Promise<string> {
    try {
      const karma = await karmaService.getOrCreateKarma(character._id.toString());

      // Determine dominant trait
      const dominant = karma.getDominantTrait();

      // Select template based on karma
      let templateKey: keyof typeof EPITAPH_TEMPLATES = 'neutral';

      if (dominant.value > 30) {
        if (dominant.trait === 'honor' || dominant.trait === 'justice') {
          templateKey = 'honorable';
        } else if (dominant.trait === 'chaos') {
          templateKey = 'chaotic';
        } else if (dominant.trait === 'mercy' || dominant.trait === 'charity') {
          templateKey = 'merciful';
        } else if (dominant.trait === 'cruelty') {
          templateKey = 'cruel';
        } else if (dominant.trait === 'greed') {
          templateKey = 'greedy';
        }
      } else if (dominant.value < -30) {
        if (dominant.trait === 'honor') {
          templateKey = 'chaotic';
        } else if (dominant.trait === 'mercy') {
          templateKey = 'cruel';
        } else if (dominant.trait === 'charity') {
          templateKey = 'greedy';
        }
      }

      const templates = EPITAPH_TEMPLATES[templateKey];
      const template = templates[Math.floor(SecureRNG.float(0, 1) * templates.length)];

      return template.replace('{name}', character.name);
    } catch {
      // Fallback epitaph
      return `Here lies ${character.name}, taken by the frontier.`;
    }
  }

  /**
   * Select items from inventory to become heirlooms
   */
  private static async selectHeirloomItems(character: ICharacter): Promise<GravestoneHeirloom[]> {
    const heirlooms: GravestoneHeirloom[] = [];

    // Get all items from inventory
    const inventory = character.inventory || [];
    if (inventory.length === 0) {
      return heirlooms;
    }

    // Sort by perceived value (higher quantity items last, unique items first)
    // In a full implementation, we'd look up item data for rarity
    const sortedItems = [...inventory].sort((a, b) => a.quantity - b.quantity);

    // Take up to 5 best items as potential heirlooms
    const maxHeirlooms = 5;
    for (let i = 0; i < Math.min(maxHeirlooms, sortedItems.length); i++) {
      const item = sortedItems[i];
      heirlooms.push({
        itemId: item.itemId,
        itemName: item.itemId, // Would need item lookup for real name
        itemType: 'equipment', // Would need item lookup
        rarity: 'common' // Would need item lookup
      });
    }

    return heirlooms;
  }

  /**
   * Get a gravestone by ID
   */
  static async getGravestone(gravestoneId: string): Promise<IGravestone | null> {
    return Gravestone.findById(gravestoneId);
  }

  /**
   * Get all gravestones for a user (their dead characters)
   */
  static async getUserGravestones(userId: string): Promise<IGravestone[]> {
    return Gravestone.findByUser(userId);
  }

  /**
   * Get unclaimed gravestones for a user
   */
  static async getUnclaimedGravestones(userId: string): Promise<IGravestone[]> {
    return Gravestone.findUnclaimedByUser(userId);
  }

  /**
   * Get gravestones visible at a location
   */
  static async getGravestonesAtLocation(
    locationId: string,
    limit: number = 10
  ): Promise<IGravestone[]> {
    return Gravestone.findNearLocation(locationId, limit);
  }

  /**
   * Get recent deaths for world news
   */
  static async getRecentDeaths(limit: number = 20): Promise<IGravestone[]> {
    return Gravestone.getRecentDeaths(limit);
  }

  /**
   * Check if a character can claim a gravestone
   */
  static async canClaimGravestone(
    characterId: string,
    gravestoneId: string
  ): Promise<{ canClaim: boolean; reason?: string }> {
    const gravestone = await Gravestone.findById(gravestoneId);
    if (!gravestone) {
      return { canClaim: false, reason: 'Gravestone not found.' };
    }

    if (gravestone.claimed) {
      return { canClaim: false, reason: 'This inheritance has already been claimed.' };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return { canClaim: false, reason: 'Character not found.' };
    }

    // Must belong to same user
    if (gravestone.userId.toString() !== character.userId.toString()) {
      return { canClaim: false, reason: 'You can only claim your own ancestors\' inheritance.' };
    }

    // Can't claim your own gravestone (shouldn't happen, but safety check)
    if (gravestone.characterId.toString() === characterId) {
      return { canClaim: false, reason: 'You cannot claim your own gravestone.' };
    }

    return { canClaim: true };
  }

  /**
   * Mark gravestone as claimed
   */
  static async markClaimed(
    gravestoneId: string,
    claimingCharacterId: string,
    tier: InheritanceTier,
    result: {
      goldReceived: number;
      heirloomsReceived: string[];
      skillBoosts: Record<string, number>;
      destinyHand: string[];
    },
    session?: mongoose.ClientSession
  ): Promise<void> {
    await Gravestone.findByIdAndUpdate(
      gravestoneId,
      {
        claimed: true,
        claimedBy: new mongoose.Types.ObjectId(claimingCharacterId),
        claimedAt: new Date(),
        inheritanceTier: tier,
        inheritanceResult: result
      },
      session ? { session } : {}
    );
  }

  /**
   * Get inheritance preview (what's available without claiming)
   */
  static async getInheritancePreview(gravestoneId: string): Promise<{
    goldPool: number;
    heirloomCount: number;
    skillCount: number;
    prestigeBonus: number;
    ancestorName: string;
    ancestorLevel: number;
    epitaph: string;
  } | null> {
    const gravestone = await Gravestone.findById(gravestoneId);
    if (!gravestone) {
      return null;
    }

    return {
      goldPool: gravestone.goldPool,
      heirloomCount: gravestone.heirloomItems.length,
      skillCount: gravestone.skillMemory.size,
      prestigeBonus: gravestone.prestigeTier * PRESTIGE_INHERITANCE_BONUS,
      ancestorName: gravestone.characterName,
      ancestorLevel: gravestone.level,
      epitaph: gravestone.epitaph
    };
  }

  /**
   * Get graveyard stats for a user
   */
  static async getGraveyardStats(userId: string): Promise<{
    totalDeadCharacters: number;
    claimedInheritances: number;
    unclaimedInheritances: number;
    totalGoldInherited: number;
    highestLevelDeath: number;
  }> {
    const gravestones = await Gravestone.findByUser(userId);

    const claimed = gravestones.filter(g => g.claimed);
    const unclaimed = gravestones.filter(g => !g.claimed);

    const totalGoldInherited = claimed.reduce((sum, g) =>
      sum + (g.inheritanceResult?.goldReceived || 0), 0
    );

    const highestLevel = gravestones.reduce((max, g) =>
      Math.max(max, g.level), 0
    );

    return {
      totalDeadCharacters: gravestones.length,
      claimedInheritances: claimed.length,
      unclaimedInheritances: unclaimed.length,
      totalGoldInherited,
      highestLevelDeath: highestLevel
    };
  }
}

export default GravestoneService;
