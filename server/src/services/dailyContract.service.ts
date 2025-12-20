/**
 * Daily Contract Service
 *
 * Handles procedural generation of daily contracts and progress tracking
 * Part of the Competitor Parity Plan - Phase B
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  DailyContract,
  IDailyContract,
  IContract,
  ContractType,
  ContractDifficulty,
  ContractStatus,
  ContractRewards,
  STREAK_BONUSES,
  getStreakBonus
} from '../models/DailyContract.model';
import { Character, ICharacter } from '../models/Character.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import {
  ALL_CONTRACT_TEMPLATES,
  ContractTemplate,
  PLACEHOLDER_DATA,
  generateSeed,
  seededRandom,
  getDifficultyDistribution,
  scaleProgressByLevel,
  scaleRewards,
  getTemplatesByDifficulty,
  getSeededRandomElement
} from '../data/contractTemplates';

/**
 * Contract generation result
 */
interface GeneratedContract extends Omit<IContract, 'status' | 'progress' | 'acceptedAt' | 'completedAt'> {
  status: ContractStatus;
  progress: number;
}

/**
 * Streak info returned to client
 */
export interface StreakInfo {
  currentStreak: number;
  todayCompleted: number;
  totalContractsToday: number;
  nextBonusDay: number;
  nextBonus: {
    gold: number;
    xp: number;
    item?: string;
    premiumCurrency?: number;
    description: string;
  } | null;
  canClaimStreakBonus: boolean;
  streakHistory: Array<{ day: number; completed: boolean }>;
}

/**
 * Contract completion result
 */
export interface ContractCompletionResult {
  contract: IContract;
  rewards: ContractRewards;
  streakUpdate: {
    newStreak: number;
    bonusClaimed: boolean;
    bonusRewards?: {
      gold: number;
      xp: number;
      item?: string;
      premiumCurrency?: number;
    };
  };
}

export class DailyContractService {
  /**
   * Generate daily contracts for a character
   * Uses seeded RNG for consistent daily generation per player
   */
  static async generateDailyContracts(characterId: string): Promise<IDailyContract> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new NotFoundError('Character');
    }

    // Get or create today's contract record
    let dailyContract = await DailyContract.findOrCreateForToday(characterId);

    // Only generate contracts if none exist for today
    if (dailyContract.contracts.length > 0) {
      return dailyContract;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Generate 3-5 contracts based on level
    const contractCount = this.getContractCount(character.level);
    const seed = generateSeed(characterId, today);

    // Get difficulty distribution for character level
    const distribution = getDifficultyDistribution(character.level);

    const contracts: GeneratedContract[] = [];
    const usedTemplateIds = new Set<string>();
    let currentSeed = seed;

    // Generate contracts ensuring variety
    const difficultyOrder: ContractDifficulty[] = [];

    // Build difficulty order based on distribution
    for (let i = 0; i < distribution.easy && difficultyOrder.length < contractCount; i++) {
      difficultyOrder.push('easy');
    }
    for (let i = 0; i < distribution.medium && difficultyOrder.length < contractCount; i++) {
      difficultyOrder.push('medium');
    }
    for (let i = 0; i < distribution.hard && difficultyOrder.length < contractCount; i++) {
      difficultyOrder.push('hard');
    }

    // Shuffle difficulty order with seeded random
    for (let i = difficultyOrder.length - 1; i > 0; i--) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      const j = Math.floor(seededRandom(currentSeed) * (i + 1));
      [difficultyOrder[i], difficultyOrder[j]] = [difficultyOrder[j], difficultyOrder[i]];
    }

    // Track used types to ensure variety
    const usedTypes = new Set<ContractType>();

    for (const difficulty of difficultyOrder) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);

      // Get templates for this difficulty
      const templates = getTemplatesByDifficulty(difficulty).filter(
        t => !usedTemplateIds.has(t.id)
      );

      if (templates.length === 0) continue;

      // Prefer unused types for variety
      const unusedTypeTemplates = templates.filter(t => !usedTypes.has(t.type));
      const availableTemplates = unusedTypeTemplates.length > 0 ? unusedTypeTemplates : templates;

      // Select template with seeded random
      const templateIndex = Math.floor(seededRandom(currentSeed) * availableTemplates.length);
      const template = availableTemplates[templateIndex];

      usedTemplateIds.add(template.id);
      usedTypes.add(template.type);

      // Generate contract from template
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      const contract = this.generateContractFromTemplate(template, character.level, currentSeed);
      contracts.push(contract);
    }

    // Set expiry to end of day UTC
    const expiresAt = new Date(today);
    expiresAt.setUTCHours(23, 59, 59, 999);

    // Update contracts with proper expiry
    contracts.forEach(c => {
      c.expiresAt = expiresAt;
    });

    // Save contracts to the record
    dailyContract.contracts = contracts as IContract[];
    await dailyContract.save();

    return dailyContract;
  }

  /**
   * Get today's contracts for a character
   */
  static async getContracts(characterId: string): Promise<IDailyContract> {
    // This will generate contracts if they don't exist
    return this.generateDailyContracts(characterId);
  }

  /**
   * Accept a contract (start working on it)
   */
  static async acceptContract(characterId: string, contractId: string): Promise<IContract> {
    const dailyContract = await this.getContracts(characterId);

    const contract = dailyContract.contracts.find(c => c.id === contractId);
    if (!contract) {
      throw new NotFoundError('Contract');
    }

    if (contract.status !== 'available') {
      throw new ValidationError(`Contract is already ${contract.status}`);
    }

    // Check if contract is expired
    if (new Date() > contract.expiresAt) {
      contract.status = 'expired';
      await dailyContract.save();
      throw new ValidationError('Contract has expired');
    }

    // Update status
    contract.status = 'in_progress';
    contract.acceptedAt = new Date();

    await dailyContract.save();

    return contract;
  }

  /**
   * Update progress on a contract
   */
  static async updateProgress(
    characterId: string,
    contractId: string,
    progressAmount: number = 1
  ): Promise<IContract> {
    const dailyContract = await this.getContracts(characterId);

    const contract = dailyContract.contracts.find(c => c.id === contractId);
    if (!contract) {
      throw new NotFoundError('Contract');
    }

    if (contract.status !== 'in_progress') {
      throw new ValidationError('Contract must be in progress to update');
    }

    // Check if contract is expired
    if (new Date() > contract.expiresAt) {
      contract.status = 'expired';
      await dailyContract.save();
      throw new ValidationError('Contract has expired');
    }

    // Update progress
    contract.progress = Math.min(contract.progress + progressAmount, contract.progressMax);

    await dailyContract.save();

    return contract;
  }

  /**
   * Complete a contract and claim rewards
   */
  static async completeContract(
    characterId: string,
    contractId: string
  ): Promise<ContractCompletionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dailyContract = await DailyContract.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        'contracts.id': contractId
      }).session(session);

      if (!dailyContract) {
        throw new NotFoundError('Contract');
      }

      const contract = dailyContract.contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new NotFoundError('Contract');
      }

      if (contract.status === 'completed') {
        throw new ValidationError('Contract already completed');
      }

      if (contract.status !== 'in_progress') {
        throw new ValidationError('Contract must be in progress to complete');
      }

      // Check if progress is complete
      if (contract.progress < contract.progressMax) {
        throw new ValidationError(`Contract not complete: ${contract.progress}/${contract.progressMax}`);
      }

      // Get character for rewards
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new NotFoundError('Character');
      }

      // Grant rewards
      const rewards = contract.rewards;

      // Dollars
      if (rewards.gold > 0) {
        await DollarService.addDollars(
          characterId,
          rewards.gold,
          TransactionSource.CONTRACT_REWARD,
          { contractId: contract.id, contractTitle: contract.title },
          session
        );
      }

      // XP
      if (rewards.xp > 0) {
        await character.addExperience(rewards.xp);
      }

      // Items
      if (rewards.items && rewards.items.length > 0) {
        for (const itemId of rewards.items) {
          const existingItem = character.inventory.find(inv => inv.itemId === itemId);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            character.inventory.push({
              itemId,
              quantity: 1,
              acquiredAt: new Date()
            });
          }
        }
      }

      // Reputation
      if (rewards.reputation) {
        const reputationMap = rewards.reputation instanceof Map
          ? rewards.reputation
          : new Map(Object.entries(rewards.reputation));

        for (const [faction, amount] of reputationMap) {
          const factionKey = faction as keyof typeof character.factionReputation;
          if (factionKey in character.factionReputation) {
            character.factionReputation[factionKey] = Math.max(
              -100,
              Math.min(100, character.factionReputation[factionKey] + (amount as number))
            );
          }
        }
      }

      // Update contract status
      contract.status = 'completed';
      contract.completedAt = new Date();

      // Update daily contract stats
      dailyContract.completedCount += 1;
      dailyContract.lastCompletedDate = new Date();

      // Update streak if this is first completion today
      if (dailyContract.completedCount === 1) {
        dailyContract.streak += 1;
      }

      // Check for streak bonus
      let streakBonusClaimed = false;
      let streakBonusRewards: any = undefined;

      // Check if we should award a streak bonus
      const streakBonus = getStreakBonus(dailyContract.streak);
      if (streakBonus && !dailyContract.streakBonusClaimed) {
        // Award milestone bonuses on exact matches
        if (STREAK_BONUSES.some(b => b.day === dailyContract.streak)) {
          streakBonusClaimed = true;
          streakBonusRewards = {
            gold: streakBonus.gold,
            xp: streakBonus.xp,
            item: streakBonus.item,
            premiumCurrency: streakBonus.premiumCurrency
          };

          // Grant streak bonus rewards
          await DollarService.addDollars(
            characterId,
            streakBonus.gold,
            TransactionSource.STREAK_BONUS,
            { streakDay: dailyContract.streak },
            session
          );

          await character.addExperience(streakBonus.xp);

          if (streakBonus.item) {
            const existingItem = character.inventory.find(inv => inv.itemId === streakBonus.item);
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              character.inventory.push({
                itemId: streakBonus.item,
                quantity: 1,
                acquiredAt: new Date()
              });
            }
          }

          dailyContract.streakBonusClaimed = true;
          dailyContract.lastStreakBonusClaimedAt = new Date();
        }
      }

      await character.save({ session });
      await dailyContract.save({ session });

      await session.commitTransaction();

      return {
        contract,
        rewards,
        streakUpdate: {
          newStreak: dailyContract.streak,
          bonusClaimed: streakBonusClaimed,
          bonusRewards: streakBonusRewards
        }
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get streak information for a character
   */
  static async getStreak(characterId: string): Promise<StreakInfo> {
    const dailyContract = await this.getContracts(characterId);

    const currentStreak = dailyContract.streak;

    // Find next milestone bonus
    const nextMilestone = STREAK_BONUSES.find(b => b.day > currentStreak);
    const nextBonus = nextMilestone ? {
      gold: nextMilestone.gold,
      xp: nextMilestone.xp,
      item: nextMilestone.item,
      premiumCurrency: nextMilestone.premiumCurrency,
      description: nextMilestone.description
    } : null;

    // Check if streak bonus can be claimed (on milestone days)
    const canClaimStreakBonus = STREAK_BONUSES.some(b => b.day === currentStreak)
      && !dailyContract.streakBonusClaimed;

    // Get streak history (last 7 days)
    const streakHistory: Array<{ day: number; completed: boolean }> = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);

      if (i === 0) {
        // Today
        streakHistory.push({
          day: currentStreak,
          completed: dailyContract.completedCount > 0
        });
      } else {
        // Past days - simplified (would need historical data for accuracy)
        const dayStreak = currentStreak - (6 - i);
        streakHistory.push({
          day: Math.max(0, dayStreak),
          completed: dayStreak > 0
        });
      }
    }

    return {
      currentStreak,
      todayCompleted: dailyContract.completedCount,
      totalContractsToday: dailyContract.contracts.length,
      nextBonusDay: nextMilestone?.day || 0,
      nextBonus,
      canClaimStreakBonus,
      streakHistory
    };
  }

  /**
   * Claim streak bonus manually (if not auto-claimed on completion)
   */
  static async claimStreakBonus(characterId: string): Promise<{
    success: boolean;
    rewards?: {
      gold: number;
      xp: number;
      item?: string;
      premiumCurrency?: number;
    };
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dailyContract = await DailyContract.findOrCreateForToday(characterId);

      if (dailyContract.streakBonusClaimed) {
        throw new ValidationError('Streak bonus already claimed today');
      }

      const streakBonus = getStreakBonus(dailyContract.streak);

      // Only allow claiming on milestone days
      if (!STREAK_BONUSES.some(b => b.day === dailyContract.streak)) {
        throw new ValidationError('No streak bonus available for current streak day');
      }

      if (!streakBonus) {
        throw new ValidationError('No streak bonus available');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new NotFoundError('Character');
      }

      // Grant rewards
      await DollarService.addDollars(
        characterId,
        streakBonus.gold,
        TransactionSource.STREAK_BONUS,
        { streakDay: dailyContract.streak },
        session
      );

      await character.addExperience(streakBonus.xp);

      if (streakBonus.item) {
        const existingItem = character.inventory.find(inv => inv.itemId === streakBonus.item);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          character.inventory.push({
            itemId: streakBonus.item,
            quantity: 1,
            acquiredAt: new Date()
          });
        }
      }

      dailyContract.streakBonusClaimed = true;
      dailyContract.lastStreakBonusClaimedAt = new Date();

      await character.save({ session });
      await dailyContract.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        rewards: {
          gold: streakBonus.gold,
          xp: streakBonus.xp,
          item: streakBonus.item,
          premiumCurrency: streakBonus.premiumCurrency
        }
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Trigger progress update from game actions
   * Called by other services when relevant actions occur
   */
  static async triggerProgress(
    characterId: string,
    actionType: string,
    actionDetails: {
      type?: ContractType;
      targetType?: string;
      targetId?: string;
      amount?: number;
    }
  ): Promise<IContract[]> {
    const dailyContract = await this.getContracts(characterId);
    const updatedContracts: IContract[] = [];

    for (const contract of dailyContract.contracts) {
      if (contract.status !== 'in_progress') continue;

      let shouldUpdate = false;

      // Match based on contract type and action
      switch (contract.type) {
        case 'combat':
          if (actionType === 'enemy_defeated' || actionType === 'duel_won' || actionType === 'combat_victory') {
            if (contract.target.type === 'enemy' && contract.target.id === actionDetails.targetId) {
              shouldUpdate = true;
            } else if (contract.target.type === 'count') {
              shouldUpdate = true;
            }
          }
          break;

        case 'crime':
          if (actionType === 'crime_completed') {
            shouldUpdate = true;
          }
          break;

        case 'social':
          if (actionType === 'gossip_gathered' || actionType === 'reputation_gained' ||
              actionType === 'poker_played' || actionType === 'social_interaction') {
            shouldUpdate = true;
          }
          break;

        case 'delivery':
          if (actionType === 'delivery_completed' || actionType === 'item_delivered') {
            if (contract.target.id === actionDetails.targetId) {
              shouldUpdate = true;
            }
          }
          break;

        case 'investigation':
          if (actionType === 'clue_found' || actionType === 'investigation_progress') {
            shouldUpdate = true;
          }
          break;

        case 'crafting':
          if (actionType === 'item_crafted' || actionType === 'item_sold') {
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate) {
        const amount = actionDetails.amount || 1;
        contract.progress = Math.min(contract.progress + amount, contract.progressMax);
        updatedContracts.push(contract);
      }
    }

    if (updatedContracts.length > 0) {
      await dailyContract.save();
    }

    return updatedContracts;
  }

  /**
   * Get leaderboard of top streaks
   */
  static async getStreakLeaderboard(limit: number = 10): Promise<
    Array<{ characterId: string; streak: number; name: string }>
  > {
    return DailyContract.getStreakLeaderboard(limit);
  }

  /**
   * Get time until daily reset
   */
  static getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  // ============ Private Helpers ============

  /**
   * Get number of contracts based on level
   */
  private static getContractCount(level: number): number {
    if (level < 3) return 3;
    if (level < 10) return 4;
    return 5;
  }

  /**
   * Generate a contract instance from a template
   */
  private static generateContractFromTemplate(
    template: ContractTemplate,
    characterLevel: number,
    seed: number
  ): GeneratedContract {
    // Process placeholders in title and description
    const placeholderData = this.selectPlaceholders(template, seed);
    const title = this.replacePlaceholders(template.titleTemplate, placeholderData);
    const description = this.replacePlaceholders(template.descriptionTemplate, placeholderData);

    // Scale progress and rewards
    const progressMax = template.levelScaling
      ? scaleProgressByLevel(template.baseProgressMax, characterLevel)
      : template.baseProgressMax;

    const scaledRewards = scaleRewards(template.baseRewards, template.difficulty, characterLevel);

    // Build rewards object
    const rewards: ContractRewards = {
      gold: scaledRewards.gold,
      xp: scaledRewards.xp
    };

    if (template.itemReward) {
      rewards.items = [template.itemReward];
    }

    if (template.reputationReward) {
      const faction = template.reputationReward.faction === 'variable'
        ? placeholderData.faction?.id || 'settlerAlliance'
        : template.reputationReward.faction;
      rewards.reputation = { [faction]: template.reputationReward.amount };
    }

    // Build target
    const target = {
      type: template.targetType,
      id: placeholderData.npc?.id || placeholderData.location?.id || placeholderData.item?.id || undefined,
      name: placeholderData.npc?.name || placeholderData.location?.name || placeholderData.item?.name || 'Target',
      location: placeholderData.location?.name || placeholderData.npc?.location
    };

    const expiresAt = new Date();
    expiresAt.setUTCHours(23, 59, 59, 999);

    return {
      id: uuidv4(),
      templateId: template.id,
      type: template.type,
      title,
      description,
      target,
      requirements: {
        amount: progressMax,
        ...template.requirements
      },
      rewards,
      difficulty: template.difficulty,
      status: 'available',
      progress: 0,
      progressMax,
      expiresAt
    };
  }

  /**
   * Select placeholder data for template
   */
  private static selectPlaceholders(template: ContractTemplate, seed: number): {
    npc?: { id: string; name: string; location?: string };
    location?: { id: string; name: string };
    item?: { id: string; name: string };
    enemy?: { id: string; name: string; location?: string };
    faction?: { id: string; name: string };
    building?: { id: string; name: string };
    count?: number;
  } {
    const result: any = {};
    let currentSeed = seed;

    // Check what placeholders are in the template
    const hasNPC = template.titleTemplate.includes('{NPC}') || template.descriptionTemplate.includes('{NPC}');
    const hasLocation = template.titleTemplate.includes('{LOCATION}') || template.descriptionTemplate.includes('{LOCATION}');
    const hasItem = template.titleTemplate.includes('{ITEM}') || template.descriptionTemplate.includes('{ITEM}');
    const hasEnemy = template.titleTemplate.includes('{ENEMY}') || template.descriptionTemplate.includes('{ENEMY}');
    const hasFaction = template.titleTemplate.includes('{FACTION}') || template.descriptionTemplate.includes('{FACTION}');
    const hasBuilding = template.titleTemplate.includes('{BUILDING}') || template.descriptionTemplate.includes('{BUILDING}');
    const hasCount = template.titleTemplate.includes('{COUNT}') || template.descriptionTemplate.includes('{COUNT}');

    if (hasNPC) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      result.npc = getSeededRandomElement(PLACEHOLDER_DATA.NPCS, currentSeed);
    }

    if (hasLocation) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      result.location = getSeededRandomElement(PLACEHOLDER_DATA.LOCATIONS, currentSeed);
    }

    if (hasItem) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      // Choose from appropriate item list based on contract type
      const items = template.type === 'crafting'
        ? PLACEHOLDER_DATA.CRAFTABLE_ITEMS
        : PLACEHOLDER_DATA.ITEMS;
      result.item = getSeededRandomElement(items, currentSeed);
    }

    if (hasEnemy) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      result.enemy = getSeededRandomElement(PLACEHOLDER_DATA.ENEMIES, currentSeed);
    }

    if (hasFaction) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      result.faction = getSeededRandomElement(PLACEHOLDER_DATA.FACTIONS, currentSeed);
    }

    if (hasBuilding) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      result.building = getSeededRandomElement(PLACEHOLDER_DATA.BUILDINGS, currentSeed);
    }

    if (hasCount) {
      result.count = template.baseProgressMax;
    }

    return result;
  }

  /**
   * Replace placeholders in template string
   */
  private static replacePlaceholders(template: string, data: any): string {
    let result = template;

    if (data.npc) {
      result = result.replace(/{NPC}/g, data.npc.name);
    }
    if (data.location) {
      result = result.replace(/{LOCATION}/g, data.location.name);
    }
    if (data.item) {
      result = result.replace(/{ITEM}/g, data.item.name);
    }
    if (data.enemy) {
      result = result.replace(/{ENEMY}/g, data.enemy.name);
    }
    if (data.faction) {
      result = result.replace(/{FACTION}/g, data.faction.name);
    }
    if (data.building) {
      result = result.replace(/{BUILDING}/g, data.building.name);
    }
    if (data.count !== undefined) {
      result = result.replace(/{COUNT}/g, data.count.toString());
    }

    return result;
  }
}

