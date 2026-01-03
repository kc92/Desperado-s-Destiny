/**
 * Combat Reward Service
 *
 * Handles all loot generation, reward distribution, and death penalties.
 * Manages combat victory rewards including gold, XP, items, and achievements.
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import mongoose from 'mongoose';
import { ICharacter } from '../../models/Character.model';
import { INPC } from '../../models/NPC.model';
import { CombatEncounter, ICombatEncounter, ILootAwarded } from '../../models/CombatEncounter.model';
import { CombatStatus, DeathType } from '@desperados/shared';
import { TransactionSource, CurrencyType } from '../../models/GoldTransaction.model';
import { getBossById } from '../../data/bosses';
import { SecureRNG } from '../base/SecureRNG';
import logger from '../../utils/logger';
import { safeAchievementBatch, safeAchievementUpdate } from '../../utils/achievementUtils';

/**
 * Legendary drop rates by boss name
 * Maps boss names to item IDs and drop chances
 */
const LEGENDARY_DROP_RATES: Record<string, Record<string, number>> = {
  'The Wendigo': { 'wendigo-fang': 0.12 },
  // Add more bosses here as needed
};

/**
 * Result of death penalty application
 */
export interface DeathPenaltyResult {
  goldLost: number;
  respawned: boolean;
}

export class CombatRewardService {
  /**
   * Roll loot from NPC's loot table
   * For bosses, uses boss data loot tables instead of NPC loot table
   *
   * @param npc - The NPC that was defeated
   * @param isFirstKill - Whether this is the player's first kill of this boss
   * @param bossId - Optional boss ID for boss data lookup
   * @returns Loot awarded (gold, xp, items)
   */
  static rollLoot(npc: INPC, isFirstKill: boolean = false, bossId?: string): ILootAwarded {
    // Check if this is a boss with defined boss data
    const bossData = bossId ? getBossById(bossId) : null;

    if (bossData) {
      // Use boss data loot tables for proper boss encounters
      return this.rollBossLoot(bossData, isFirstKill);
    }

    // Fall back to NPC loot table for non-boss or undefined boss encounters
    const { lootTable } = npc;

    // SECURITY FIX: Use SecureRNG for dollars roll
    const gold = SecureRNG.range(lootTable.goldMin, lootTable.goldMax);
    const xp = lootTable.xpReward;

    // SECURITY FIX: Use SecureRNG for item drop chances
    const items: string[] = [];
    for (const item of lootTable.items) {
      if (SecureRNG.chance(item.chance)) {
        items.push(item.name);
      }
    }

    // SECURITY FIX: Use SecureRNG for legendary drop chances
    // Legacy: Roll for legendary boss drops from hardcoded table
    if (npc.type === 'BOSS' && LEGENDARY_DROP_RATES[npc.name]) {
      const legendaryDrops = LEGENDARY_DROP_RATES[npc.name];

      for (const [itemId, dropChance] of Object.entries(legendaryDrops)) {
        if (isFirstKill && Object.keys(legendaryDrops)[0] === itemId) {
          items.push(itemId);
          logger.info(`First kill bonus: Guaranteed ${itemId} drop from ${npc.name}`);
        } else if (SecureRNG.chance(dropChance)) {
          items.push(itemId);
          logger.info(`Legendary drop: ${itemId} from ${npc.name} (${(dropChance * 100).toFixed(1)}% chance)`);
        }
      }
    }

    return { gold, xp, items };
  }

  /**
   * Roll loot from boss data loot tables
   * Uses the structured loot table from boss definitions
   *
   * @param bossData - Boss data from boss registry
   * @param isFirstKill - Whether this is first kill
   * @returns Loot awarded
   */
  private static rollBossLoot(bossData: any, isFirstKill: boolean): ILootAwarded {
    const items: string[] = [];

    // Roll gold from boss gold reward range
    const gold = SecureRNG.range(bossData.goldReward.min, bossData.goldReward.max);
    const xp = bossData.experienceReward;

    // Add guaranteed drops
    if (bossData.guaranteedDrops && bossData.guaranteedDrops.length > 0) {
      for (const drop of bossData.guaranteedDrops) {
        // Only add if it's not first-kill-only, or if it is first kill
        if (!drop.guaranteedFirstKill || isFirstKill) {
          for (let i = 0; i < drop.quantity; i++) {
            items.push(drop.itemId);
          }
          logger.info(`Boss guaranteed drop: ${drop.quantity}x ${drop.name} from ${bossData.name}`);
        }
      }
    }

    // Roll loot table entries
    if (bossData.lootTable && bossData.lootTable.length > 0) {
      for (const loot of bossData.lootTable) {
        // Skip first-kill-only items if not first kill
        if (loot.requiresFirstKill && !isFirstKill) {
          continue;
        }

        if (SecureRNG.chance(loot.dropChance)) {
          const quantity = SecureRNG.range(loot.minQuantity, loot.maxQuantity);
          for (let i = 0; i < quantity; i++) {
            items.push(loot.itemId);
          }
          logger.info(
            `Boss loot drop: ${quantity}x ${loot.name} from ${bossData.name} ` +
            `(${(loot.dropChance * 100).toFixed(1)}% chance)`
          );
        }
      }
    }

    // First kill bonus
    if (isFirstKill && bossData.firstKillBonus) {
      if (bossData.firstKillBonus.item) {
        items.push(bossData.firstKillBonus.item);
        logger.info(`First kill bonus item: ${bossData.firstKillBonus.item} from ${bossData.name}`);
      }
      // Note: firstKillBonus.gold and title are handled separately
    }

    logger.info(
      `Boss loot rolled for ${bossData.name}: $${gold}, ${xp} XP, ${items.length} items`
    );

    return { gold, xp, items };
  }

  /**
   * Check if this is the character's first kill of a specific boss
   *
   * @param characterId - Character ID
   * @param bossId - Boss NPC ID
   * @returns True if this is the first kill
   */
  static async isFirstBossKill(characterId: string, bossId: string): Promise<boolean> {
    const previousKill = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: bossId,
      status: CombatStatus.PLAYER_VICTORY
    });

    return !previousKill;
  }

  /**
   * Award loot to character after combat victory
   *
   * Handles:
   * - Territory bonus application
   * - Dollar awarding via DollarService
   * - XP awarding
   * - Item distribution
   * - Combat stats updates
   * - Achievement tracking
   *
   * @param character - The victorious character
   * @param npc - The defeated NPC
   * @param loot - Loot to award
   * @param session - Optional MongoDB session for transaction
   * @param encounter - Combat encounter for stat tracking
   */
  static async awardLoot(
    character: ICharacter,
    npc: INPC,
    loot: ILootAwarded,
    session: mongoose.ClientSession | undefined,
    encounter: ICombatEncounter
  ): Promise<void> {
    // Lazy load services to prevent circular dependencies
    const { TerritoryBonusService } = await import('../territoryBonus.service');
    const { DollarService } = await import('../dollar.service');
    const { QuestService } = await import('../quest.service');

    // TERRITORY BONUS: Apply gang territory gold and XP bonuses (Phase 2.2)
    let goldAmount = loot.gold;
    let xpAmount = loot.xp;
    try {
      const combatBonuses = await TerritoryBonusService.getCombatBonuses(
        character._id as mongoose.Types.ObjectId
      );
      if (combatBonuses.hasBonuses) {
        goldAmount = Math.floor(goldAmount * combatBonuses.bonuses.gold);
        xpAmount = Math.floor(xpAmount * combatBonuses.bonuses.xp);
        logger.debug(`Territory combat loot bonus: gold ${combatBonuses.bonuses.gold}x, xp ${combatBonuses.bonuses.xp}x`);
      }
    } catch (territoryError) {
      logger.warn('Failed to apply territory combat loot bonus:', territoryError);
    }

    // Award dollars using DollarService (transaction-safe)
    if (goldAmount > 0) {
      await DollarService.addDollars(
        character._id as string,
        goldAmount,
        TransactionSource.COMBAT_VICTORY,
        {
          npcId: npc._id,
          npcName: npc.name,
          npcLevel: npc.level,
          description: `Defeated ${npc.name} (Level ${npc.level}) and looted ${goldAmount} dollars`,
          currencyType: CurrencyType.DOLLAR,
        }
      );
    }

    // Award XP
    await character.addExperience(xpAmount);

    // Award items
    for (const itemName of loot.items) {
      const existingItem = character.inventory.find(i => i.itemId === itemName);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        character.inventory.push({
          itemId: itemName,
          quantity: 1,
          acquiredAt: new Date()
        });
      }

      // Trigger quest progress for item collected
      try {
        await QuestService.onItemCollected(character._id.toString(), itemName, 1);
      } catch (questError) {
        // Don't fail loot if quest update fails
        logger.error('Failed to update quest progress for combat loot:', questError);
      }
    }

    // Update combat stats
    if (!character.combatStats) {
      character.combatStats = {
        wins: 0,
        losses: 0,
        totalDamage: 0,
        kills: 0,
        totalDeaths: 0
      };
    }

    character.combatStats.wins += 1;
    character.combatStats.kills += 1;

    // Track total damage dealt in this combat
    const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + r.playerDamage, 0);
    character.combatStats.totalDamage += totalDamageDealt;

    // Achievement tracking: Combat wins (first_blood, gunslinger_10/50/100)
    const characterIdStr = character._id.toString();

    // Track progress for combat win achievements
    safeAchievementBatch(characterIdStr, [
      { type: 'first_blood' },
      { type: 'gunslinger_10' },
      { type: 'gunslinger_50' },
      { type: 'gunslinger_100' }
    ], 'combat:victory');

    // Boss achievements
    if (npc.type === 'BOSS') {
      safeAchievementBatch(characterIdStr, [
        { type: 'boss_slayer' },
        { type: 'boss_hunter_5' }
      ], 'combat:boss_victory');
    }

    // Flawless victory: Check if player took no damage
    const totalDamageReceived = encounter.rounds.reduce((sum, r) => sum + r.npcDamage, 0);
    if (totalDamageReceived === 0 && encounter.playerHP === encounter.playerMaxHP) {
      safeAchievementUpdate(characterIdStr, 'flawless_victory', 1, 'combat:flawless');
    }

    // Mark NPC as defeated
    npc.lastDefeated = new Date();
    npc.isActive = false;

    await character.save();
    await npc.save();

    logger.info(
      `Loot awarded to ${character.name}: ${loot.gold} dollars, ${loot.xp} XP, ${loot.items.length} items`
    );
  }

  /**
   * Apply death penalty: lose 10% dollars, respawn at full HP
   * Uses Death Service for comprehensive death handling
   *
   * @param character - Character who died
   * @param session - MongoDB session for transaction
   * @returns Death penalty result with gold lost and respawn status
   */
  static async applyDeathPenalty(
    character: ICharacter,
    session: mongoose.ClientSession
  ): Promise<DeathPenaltyResult> {
    // Lazy load Death Service to prevent circular dependencies
    const { DeathService } = await import('../death.service');

    // Use Death Service for comprehensive death handling
    const deathPenalty = await DeathService.handleDeath(
      character._id.toString(),
      DeathType.COMBAT,
      session
    );

    logger.info(
      `Death penalty applied to ${character.name}: lost ${deathPenalty.goldLost} dollars, ` +
      `${deathPenalty.xpLost} XP, ${deathPenalty.itemsDropped.length} items`
    );

    return {
      goldLost: deathPenalty.goldLost,
      respawned: deathPenalty.respawned
    };
  }
}

export default CombatRewardService;
