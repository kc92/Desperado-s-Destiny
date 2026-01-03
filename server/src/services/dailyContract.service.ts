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
import { SkillService } from './skill.service';
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
  getSeededRandomElement,
  GANG_CONTRACTS,
  GANG_BOUNTY_CONTRACTS,
  BOUNTY_CONTRACTS
} from '../data/contractTemplates';
import { Gang, IGang } from '../models/Gang.model';
import {
  PREMIUM_CONTRACT_TEMPLATES,
  PremiumContractTemplate,
  getAvailablePremiumContracts,
  getPremiumContractTemplate,
  fillContractTemplate
} from '../data/activities/premiumContractTemplates';
import { MilestoneRewardService } from './milestoneReward.service';
import { EnergyService } from './energy.service';
import { TerritoryBonusService } from './territoryBonus.service';
import logger from '../utils/logger';

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

    // Generate 3-5 contracts based on Total Level (divide by 10 for old level equivalent)
    const totalLevel = character.totalLevel || 30;
    const effectiveOldLevel = Math.floor(totalLevel / 10);
    const contractCount = this.getContractCount(effectiveOldLevel);
    const seed = generateSeed(characterId, today);

    // Get difficulty distribution for Total Level
    const distribution = getDifficultyDistribution(effectiveOldLevel);

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

      // Generate contract from template (use effective old level for reward scaling)
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      const contract = this.generateContractFromTemplate(template, effectiveOldLevel, currentSeed);
      contracts.push(contract);
    }

    // Set expiry to end of day UTC
    const expiresAt = new Date(today);
    expiresAt.setUTCHours(23, 59, 59, 999);

    // Update contracts with proper expiry
    contracts.forEach(c => {
      c.expiresAt = expiresAt;
    });

    // Phase 3: Generate gang-specific contracts if character is in a gang
    try {
      const gangContracts = await this.generateGangContracts(character, seed + 1000);
      if (gangContracts.length > 0) {
        // Set expiry for gang contracts
        gangContracts.forEach(c => {
          c.expiresAt = expiresAt;
        });
        contracts.push(...gangContracts);
        logger.debug(`Generated ${gangContracts.length} gang contracts for character ${characterId}`);
      }
    } catch (gangError) {
      logger.warn('Failed to generate gang contracts:', gangError);
      // Continue without gang contracts - don't fail the whole generation
    }

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

      // Grant rewards (with territory contract bonuses - Phase 2.2)
      const rewards = contract.rewards;

      // TERRITORY BONUS: Fetch contract bonuses
      let contractBonuses = { gold: 1.0, xp: 1.0, streak: 1.0 };
      try {
        const charObjId = new mongoose.Types.ObjectId(characterId);
        const bonusResult = await TerritoryBonusService.getContractBonuses(charObjId);
        if (bonusResult.hasBonuses) {
          contractBonuses = bonusResult.bonuses;
          logger.debug(`Territory contract bonuses: gold ${contractBonuses.gold}x, xp ${contractBonuses.xp}x`);
        }
      } catch (bonusError) {
        logger.warn('Failed to get territory contract bonuses:', bonusError);
      }

      // Dollars (with territory bonus)
      if (rewards.gold > 0) {
        const bonusGold = Math.floor(rewards.gold * contractBonuses.gold);
        await DollarService.addDollars(
          characterId,
          bonusGold,
          TransactionSource.CONTRACT_REWARD,
          { contractId: contract.id, contractTitle: contract.title },
          session
        );
      }

      // XP (with territory bonus)
      if (rewards.xp > 0) {
        const bonusXp = Math.floor(rewards.xp * contractBonuses.xp);
        await character.addExperience(bonusXp);
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

      // Skill XP
      if (rewards.skillXp && rewards.skillXp.length > 0) {
        await SkillService.awardMultipleSkillXP(
          characterId,
          rewards.skillXp,
          session
        );
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

        // Phase 3: Gang and Territory contracts
        case 'gang':
          if (actionType === 'gang_combat_win' || actionType === 'gang_war_participation' ||
              actionType === 'gang_raid_completed' || actionType === 'contract_completed' ||
              actionType === 'gang_treasury_contribution' || actionType === 'gang_recruit') {
            shouldUpdate = true;
          }
          break;

        case 'territory':
          if (actionType === 'influence_gained' || actionType === 'territory_defended' ||
              actionType === 'territory_captured') {
            shouldUpdate = true;
          }
          break;

        case 'boss':
          if (actionType === 'boss_defeated') {
            shouldUpdate = true;
          }
          break;

        case 'bounty':
          if (actionType === 'bounty_completed' || actionType === 'bounty_captured' || actionType === 'bounty_killed') {
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
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  // ============ Gang Contract Methods (Phase 3) ============

  /**
   * Generate gang-specific contracts for a character
   * Called from generateDailyContracts if character is in a gang
   */
  private static async generateGangContracts(
    character: ICharacter,
    seed: number
  ): Promise<GeneratedContract[]> {
    // Check if character is in a gang
    if (!character.gangId) {
      return [];
    }

    const gang = await Gang.findById(character.gangId);
    if (!gang) {
      return [];
    }

    const contracts: GeneratedContract[] = [];
    let currentSeed = seed;

    // Determine member rank
    const member = gang.members.find(
      m => m.characterId.toString() === character._id.toString()
    );
    const memberRank = member?.role || 'member';

    // Filter templates by gang rank requirement
    // Combine regular gang contracts and gang bounty contracts
    const allGangTemplates = [...GANG_CONTRACTS, ...GANG_BOUNTY_CONTRACTS];
    const availableTemplates = allGangTemplates.filter(template => {
      if (!template.gangRankRequired) return true;

      const rankOrder = { member: 1, officer: 2, leader: 3 };
      const requiredRank = rankOrder[template.gangRankRequired] || 1;
      const actualRank = rankOrder[memberRank as keyof typeof rankOrder] || 1;

      return actualRank >= requiredRank;
    });

    if (availableTemplates.length === 0) {
      return [];
    }

    // Generate 1-2 gang contracts
    // 1 contract always, 2nd contract if gang controls territory
    const gangContractCount = gang.territories && gang.territories.length > 0 ? 2 : 1;
    const usedTemplateIds = new Set<string>();

    for (let i = 0; i < gangContractCount && i < availableTemplates.length; i++) {
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);

      // Filter out already used templates
      const remainingTemplates = availableTemplates.filter(t => !usedTemplateIds.has(t.id));
      if (remainingTemplates.length === 0) break;

      // Prefer territory contracts if gang has territory
      let selectedTemplate: ContractTemplate;
      if (gang.territories && gang.territories.length > 0) {
        const territoryTemplates = remainingTemplates.filter(t => t.type === 'territory');
        if (territoryTemplates.length > 0 && i === 0) {
          const templateIndex = Math.floor(seededRandom(currentSeed) * territoryTemplates.length);
          selectedTemplate = territoryTemplates[templateIndex];
        } else {
          const templateIndex = Math.floor(seededRandom(currentSeed) * remainingTemplates.length);
          selectedTemplate = remainingTemplates[templateIndex];
        }
      } else {
        const templateIndex = Math.floor(seededRandom(currentSeed) * remainingTemplates.length);
        selectedTemplate = remainingTemplates[templateIndex];
      }

      usedTemplateIds.add(selectedTemplate.id);

      // Generate contract from template (use Total Level / 10 for backward compat)
      currentSeed = Math.abs(currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
      const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);
      const contract = this.generateContractFromTemplate(selectedTemplate, effectiveLevel, currentSeed);

      // Mark as gang contract in requirements
      contract.requirements = {
        ...contract.requirements,
        gangRequired: true,
        gangRankRequired: selectedTemplate.gangRankRequired
      };

      contracts.push(contract);
    }

    return contracts;
  }

  // ============ Premium Contract Methods (Sprint 7) ============

  /**
   * Check if character has access to premium contracts
   */
  static async hasPremiumContractAccess(characterId: string): Promise<boolean> {
    return MilestoneRewardService.hasFeature(characterId, 'contracts_board');
  }

  /**
   * Generate available premium contracts for a character
   * Returns 1-2 contracts based on level, filtered by cooldowns
   */
  static async generatePremiumContracts(characterId: string): Promise<IContract[]> {
    // Check feature unlock
    const hasFeature = await this.hasPremiumContractAccess(characterId);
    if (!hasFeature) {
      return [];
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new NotFoundError('Character');
    }

    // Get or create today's contract record
    const dailyContract = await DailyContract.findOrCreateForToday(characterId);

    // Filter templates by level and cooldowns
    const now = new Date();
    const cooldowns = dailyContract.premiumCooldowns instanceof Map
      ? dailyContract.premiumCooldowns
      : new Map(Object.entries(dailyContract.premiumCooldowns || {}));

    // Use Total Level for premium contract filtering (old level × 10)
    const totalLevel = character.totalLevel || 30;
    const effectiveOldLevel = Math.floor(totalLevel / 10);

    const availableTemplates = PREMIUM_CONTRACT_TEMPLATES.filter(template => {
      // Check Total Level requirement (template level × 10)
      if (totalLevel < template.levelRequired * 10) {
        return false;
      }

      // Check cooldown
      const cooldownExpiry = cooldowns.get(template.id);
      if (cooldownExpiry && new Date(cooldownExpiry) > now) {
        return false;
      }

      return true;
    });

    // Determine how many premium contracts to offer (1-2 based on Total Level)
    const count = totalLevel >= 400 ? 2 : 1;  // Old level 40 = Total Level 400
    const selectedTemplates = availableTemplates.slice(0, count);

    // Generate contracts from templates
    const contracts: IContract[] = selectedTemplates.map(template =>
      this.generatePremiumContractFromTemplate(template, effectiveOldLevel)
    );

    return contracts;
  }

  /**
   * Get premium contracts for a character (including active ones)
   */
  static async getPremiumContracts(characterId: string): Promise<{
    available: IContract[];
    active: IContract[];
    cooldowns: Record<string, Date>;
  }> {
    const hasFeature = await this.hasPremiumContractAccess(characterId);
    if (!hasFeature) {
      return { available: [], active: [], cooldowns: {} };
    }

    const dailyContract = await DailyContract.findOrCreateForToday(characterId);
    const available = await this.generatePremiumContracts(characterId);

    // Get active premium contracts
    const active = dailyContract.premiumContracts.filter(
      c => c.status === 'in_progress'
    );

    // Convert cooldowns to plain object
    const cooldowns: Record<string, Date> = {};
    const cooldownMap = dailyContract.premiumCooldowns instanceof Map
      ? dailyContract.premiumCooldowns
      : new Map(Object.entries(dailyContract.premiumCooldowns || {}));

    for (const [key, value] of cooldownMap) {
      cooldowns[key] = new Date(value);
    }

    return { available, active, cooldowns };
  }

  /**
   * Accept a premium contract
   */
  static async acceptPremiumContract(
    characterId: string,
    templateId: string
  ): Promise<{ success: boolean; contract?: IContract; error?: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hasFeature = await this.hasPremiumContractAccess(characterId);
      if (!hasFeature) {
        throw new ValidationError('Premium contracts not unlocked (requires Level 35)');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new NotFoundError('Character');
      }

      const template = getPremiumContractTemplate(templateId);
      if (!template) {
        throw new NotFoundError('Premium contract template');
      }

      // Check Total Level requirement (template level × 10)
      const totalLevel = character.totalLevel || 30;
      const requiredTotalLevel = template.levelRequired * 10;
      if (totalLevel < requiredTotalLevel) {
        throw new ValidationError(`Requires Total Level ${requiredTotalLevel} (current: ${totalLevel})`);
      }

      // Check skill requirements
      if (template.requiredSkills && template.requiredSkills.length > 0) {
        for (const req of template.requiredSkills) {
          const characterSkill = character.skills.find(s => s.skillId === req.skillId);
          const skillLevel = characterSkill?.level || 0;
          if (skillLevel < req.minLevel) {
            throw new ValidationError(`Requires ${req.skillId} level ${req.minLevel}`);
          }
        }
      }

      const dailyContract = await DailyContract.findOrCreateForToday(characterId);

      // Check cooldown
      const cooldowns = dailyContract.premiumCooldowns instanceof Map
        ? dailyContract.premiumCooldowns
        : new Map(Object.entries(dailyContract.premiumCooldowns || {}));

      const cooldownExpiry = cooldowns.get(templateId);
      if (cooldownExpiry && new Date(cooldownExpiry) > new Date()) {
        const remainingHours = Math.ceil(
          (new Date(cooldownExpiry).getTime() - Date.now()) / (1000 * 60 * 60)
        );
        throw new ValidationError(`Contract on cooldown for ${remainingHours} more hours`);
      }

      // Check if already have an active premium contract of this type
      const existingActive = dailyContract.premiumContracts.find(
        c => c.premiumTemplateId === templateId && c.status === 'in_progress'
      );
      if (existingActive) {
        throw new ValidationError('Already have an active contract of this type');
      }

      // Check energy cost
      const energyStatus = await EnergyService.getStatus(characterId);
      if (energyStatus.currentEnergy < template.energyCost) {
        throw new ValidationError(`Requires ${template.energyCost} energy (have ${energyStatus.currentEnergy})`);
      }

      // Deduct energy
      await EnergyService.spend(characterId, template.energyCost);

      // Generate the contract (use effective old level for reward scaling)
      const effectiveOldLevel = Math.floor(totalLevel / 10);
      const contract = this.generatePremiumContractFromTemplate(template, effectiveOldLevel);
      contract.status = 'in_progress';
      contract.acceptedAt = new Date();

      // Add to premium contracts array
      dailyContract.premiumContracts.push(contract);

      await dailyContract.save({ session });
      await session.commitTransaction();

      return { success: true, contract };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) {
        return { success: false, error: error.message };
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Progress a multi-phase premium contract
   */
  static async progressPremiumContract(
    characterId: string,
    contractId: string
  ): Promise<{ success: boolean; contract?: IContract; phaseCompleted?: number; error?: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dailyContract = await DailyContract.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        'premiumContracts.id': contractId
      }).session(session);

      if (!dailyContract) {
        throw new NotFoundError('Premium contract');
      }

      const contract = dailyContract.premiumContracts.find(c => c.id === contractId);
      if (!contract) {
        throw new NotFoundError('Premium contract');
      }

      if (contract.status !== 'in_progress') {
        throw new ValidationError('Contract is not in progress');
      }

      // Check if contract is already complete
      if (contract.progress >= contract.progressMax) {
        throw new ValidationError('Contract progress already complete - ready for completion');
      }

      const template = getPremiumContractTemplate(contract.premiumTemplateId || '');
      if (!template) {
        throw new NotFoundError('Premium contract template');
      }

      // Check energy cost for this phase
      const energyStatus = await EnergyService.getStatus(characterId);
      if (energyStatus.currentEnergy < template.energyCost) {
        throw new ValidationError(`Requires ${template.energyCost} energy for next phase`);
      }

      // Deduct energy
      await EnergyService.spend(characterId, template.energyCost);

      // Advance progress
      contract.progress += 1;
      contract.phaseProgress = contract.progress;

      await dailyContract.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        contract,
        phaseCompleted: contract.progress
      };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) {
        return { success: false, error: error.message };
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Complete a premium contract and claim rewards
   */
  static async completePremiumContract(
    characterId: string,
    contractId: string
  ): Promise<{
    success: boolean;
    contract?: IContract;
    rewards?: ContractRewards;
    factionChanges?: Record<string, number>;
    error?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dailyContract = await DailyContract.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        'premiumContracts.id': contractId
      }).session(session);

      if (!dailyContract) {
        throw new NotFoundError('Premium contract');
      }

      const contract = dailyContract.premiumContracts.find(c => c.id === contractId);
      if (!contract) {
        throw new NotFoundError('Premium contract');
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

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new NotFoundError('Character');
      }

      const template = getPremiumContractTemplate(contract.premiumTemplateId || '');

      // Grant rewards
      const rewards = contract.rewards;

      // Dollars
      if (rewards.gold > 0) {
        await DollarService.addDollars(
          characterId,
          rewards.gold,
          TransactionSource.CONTRACT_REWARD,
          { contractId: contract.id, contractTitle: contract.title, isPremium: true },
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

      // Skill XP
      if (rewards.skillXp && rewards.skillXp.length > 0) {
        await SkillService.awardMultipleSkillXP(
          characterId,
          rewards.skillXp,
          session
        );
      }

      // Apply faction impact
      const factionChanges: Record<string, number> = {};
      if (contract.factionImpact && !contract.factionImpactApplied) {
        const impactMap = contract.factionImpact instanceof Map
          ? contract.factionImpact
          : new Map(Object.entries(contract.factionImpact));

        for (const [faction, amount] of impactMap) {
          const factionKey = faction as keyof typeof character.factionReputation;
          if (factionKey in character.factionReputation) {
            const change = amount as number;
            character.factionReputation[factionKey] = Math.max(
              -100,
              Math.min(100, character.factionReputation[factionKey] + change)
            );
            factionChanges[faction] = change;
          }
        }
        contract.factionImpactApplied = true;
      }

      // Update contract status
      contract.status = 'completed';
      contract.completedAt = new Date();

      // Set cooldown for this contract type
      if (template) {
        const cooldownExpiry = new Date();
        cooldownExpiry.setTime(cooldownExpiry.getTime() + template.cooldownHours * 60 * 60 * 1000);

        // Ensure premiumCooldowns is an object
        if (!dailyContract.premiumCooldowns) {
          dailyContract.premiumCooldowns = {} as Record<string, Date>;
        }
        (dailyContract.premiumCooldowns as Record<string, Date>)[template.id] = cooldownExpiry;

        // Also set on the contract for reference
        contract.cooldownExpiresAt = cooldownExpiry;
      }

      await character.save({ session });
      await dailyContract.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        contract,
        rewards,
        factionChanges: Object.keys(factionChanges).length > 0 ? factionChanges : undefined
      };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) {
        return { success: false, error: error.message };
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Abandon a premium contract (no rewards, partial cooldown)
   */
  static async abandonPremiumContract(
    characterId: string,
    contractId: string
  ): Promise<{ success: boolean; error?: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dailyContract = await DailyContract.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        'premiumContracts.id': contractId
      }).session(session);

      if (!dailyContract) {
        throw new NotFoundError('Premium contract');
      }

      const contractIndex = dailyContract.premiumContracts.findIndex(c => c.id === contractId);
      if (contractIndex === -1) {
        throw new NotFoundError('Premium contract');
      }

      const contract = dailyContract.premiumContracts[contractIndex];

      if (contract.status !== 'in_progress') {
        throw new ValidationError('Can only abandon in-progress contracts');
      }

      const template = getPremiumContractTemplate(contract.premiumTemplateId || '');

      // Set partial cooldown (half the normal cooldown time)
      if (template) {
        const partialCooldownHours = Math.ceil(template.cooldownHours / 2);
        const cooldownExpiry = new Date();
        cooldownExpiry.setTime(cooldownExpiry.getTime() + partialCooldownHours * 60 * 60 * 1000);

        // Ensure premiumCooldowns is an object
        if (!dailyContract.premiumCooldowns) {
          dailyContract.premiumCooldowns = {} as Record<string, Date>;
        }
        (dailyContract.premiumCooldowns as Record<string, Date>)[template.id] = cooldownExpiry;
      }

      // Remove the contract from the array
      dailyContract.premiumContracts.splice(contractIndex, 1);

      await dailyContract.save({ session });
      await session.commitTransaction();

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) {
        return { success: false, error: error.message };
      }
      throw error;
    } finally {
      session.endSession();
    }
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
   * Generate a premium contract from template
   */
  private static generatePremiumContractFromTemplate(
    template: PremiumContractTemplate,
    characterLevel: number
  ): IContract {
    const { title, description, targetName, targetLocation } = fillContractTemplate(template);

    // Calculate expiry (premium contracts don't expire daily, they expire when completed or abandoned)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    // Build rewards
    const rewards: ContractRewards = {
      gold: template.baseRewards.gold,
      xp: template.baseRewards.xp
    };

    // Add skill XP rewards if defined
    if (template.skillXpRewards && template.skillXpRewards.length > 0) {
      rewards.skillXp = template.skillXpRewards.map(r => ({
        skillId: r.skillId,
        amount: r.amount
      }));
    }

    // Build requirements
    const requirements: any = {
      amount: template.baseProgressMax
    };

    if (template.requiredSkills && template.requiredSkills.length > 0) {
      requirements.skills = template.requiredSkills.map(skill => ({
        skillId: skill.skillId,
        minLevel: skill.minLevel
      }));
    }

    // Build target
    const target = {
      type: template.targetType,
      name: targetName || 'Target',
      location: targetLocation,
      id: undefined
    };

    return {
      id: uuidv4(),
      templateId: template.id,
      type: template.type,
      title,
      description,
      target,
      requirements,
      rewards,
      difficulty: template.difficulty,
      status: 'available' as ContractStatus,
      progress: 0,
      progressMax: template.baseProgressMax,
      expiresAt,
      // Premium-specific fields
      isPremium: true,
      premiumTemplateId: template.id,
      energyCost: template.energyCost,
      phaseProgress: 0,
      factionImpact: template.factionImpact,
      factionImpactApplied: false
    } as IContract;
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

    // Add skill XP rewards from template
    if (template.skillXpRewards && template.skillXpRewards.length > 0) {
      rewards.skillXp = template.skillXpRewards.map(reward => ({
        skillId: reward.skillId,
        amount: reward.amount
      }));
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

    // Build requirements with skill requirements
    const requirements: any = {
      amount: progressMax,
      ...template.requirements
    };

    // Add skill requirements from template
    if (template.requiredSkills && template.requiredSkills.length > 0) {
      requirements.skills = template.requiredSkills.map(skill => ({
        skillId: skill.skillId,
        minLevel: skill.minLevel
      }));
    }

    return {
      id: uuidv4(),
      templateId: template.id,
      type: template.type,
      title,
      description,
      target,
      requirements,
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

