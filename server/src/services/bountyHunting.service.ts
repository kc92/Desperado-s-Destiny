/**
 * Bounty Hunting Service
 * Handles bounty hunting mechanics for mid-game players (L20+)
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting System
 */

import mongoose from 'mongoose';
import { BountyHunt, IBountyHunt, BountyHuntStatus, BountyEncounter } from '../models/BountyHunt.model';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { CharacterProgressionService } from './characterProgression.service';
import { EnergyService } from './energy.service';
import { MilestoneRewardService } from './milestoneReward.service';
import { DailyContractService } from './dailyContract.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  getBountyTargetById,
  getAvailableBounties,
  calculateBountyReward,
  BOUNTY_TIER_CONFIG,
  BountyTarget,
  BountyTier
} from '../data/activities/bountyTargets';
import logger from '../utils/logger';
import { TerritoryBonusService } from './territoryBonus.service';

export interface AcceptBountyResult {
  success: boolean;
  hunt?: IBountyHunt;
  error?: string;
}

export interface TrackingResult {
  success: boolean;
  progressGained: number;
  newProgress: number;
  encounter?: BountyEncounter;
  canConfront: boolean;
  error?: string;
}

export interface ConfrontResult {
  success: boolean;
  outcome: 'captured' | 'killed' | 'escaped' | 'negotiated';
  goldAwarded?: number;
  xpAwarded?: number;
  reputationChange?: { faction: string; amount: number };
  error?: string;
}

export class BountyHuntingService {
  private static readonly TRACKING_THRESHOLD = 75; // Progress needed to confront
  private static readonly PROGRESS_PER_ACTION = 15; // Base progress per tracking action
  private static readonly ENCOUNTER_CHANCE = 0.25; // 25% chance of encounter during tracking

  /**
   * Check if a character has the bounty hunting feature unlocked
   */
  static async hasFeatureUnlocked(characterId: string): Promise<boolean> {
    return MilestoneRewardService.hasFeature(characterId, 'bounty_hunting');
  }

  /**
   * Get available bounties for a character based on their level
   */
  static async getAvailableBounties(characterId: string): Promise<{
    bounties: BountyTarget[];
    activeHunt: IBountyHunt | null;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check feature unlock
    const hasFeature = await this.hasFeatureUnlocked(characterId);
    if (!hasFeature) {
      return { bounties: [], activeHunt: null };
    }

    const bounties = getAvailableBounties(character.level);
    const activeHunt = await BountyHunt.findActiveHunt(characterId);

    return { bounties, activeHunt };
  }

  /**
   * Accept a bounty and start hunting
   */
  static async acceptBounty(
    characterId: string,
    targetId: string
  ): Promise<AcceptBountyResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check feature unlock
      const hasFeature = await this.hasFeatureUnlocked(characterId);
      if (!hasFeature) {
        return { success: false, error: 'Bounty hunting not unlocked. Reach level 20.' };
      }

      // Check for active hunt
      const activeHunt = await BountyHunt.findActiveHunt(characterId);
      if (activeHunt) {
        return { success: false, error: 'You already have an active bounty hunt' };
      }

      // Get target
      const target = getBountyTargetById(targetId);
      if (!target) {
        return { success: false, error: 'Invalid bounty target' };
      }

      // Check level requirement
      if (character.level < target.levelRequired) {
        return { success: false, error: `You must be level ${target.levelRequired} to hunt this target` };
      }

      // Calculate expiry time
      const tierConfig = BOUNTY_TIER_CONFIG[target.tier];
      const expiresAt = new Date(Date.now() + target.expiresInHours * 60 * 60 * 1000);

      // Create the hunt
      const hunt = await BountyHunt.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        targetId,
        tier: target.tier,
        status: 'tracking',
        startedAt: new Date(),
        expiresAt,
        trackingProgress: 0,
        currentLocation: target.knownLocations[0],
        cluesFound: 0,
        energySpent: 0,
        encounters: []
      });

      logger.info('Bounty hunt started', {
        characterId,
        characterName: character.name,
        targetId,
        targetName: target.name,
        tier: target.tier
      });

      return { success: true, hunt };
    } catch (error) {
      logger.error('Error accepting bounty', { characterId, targetId, error });
      return { success: false, error: 'Failed to accept bounty' };
    }
  }

  /**
   * Progress tracking on the current bounty
   */
  static async progressTracking(characterId: string): Promise<TrackingResult> {
    try {
      const hunt = await BountyHunt.findActiveHunt(characterId);
      if (!hunt) {
        return { success: false, progressGained: 0, newProgress: 0, canConfront: false, error: 'No active hunt' };
      }

      const target = getBountyTargetById(hunt.targetId);
      if (!target) {
        return { success: false, progressGained: 0, newProgress: 0, canConfront: false, error: 'Invalid target' };
      }

      // Check if hunt has expired
      if (new Date() > hunt.expiresAt) {
        hunt.status = 'expired';
        hunt.completedAt = new Date();
        await hunt.save();
        return { success: false, progressGained: 0, newProgress: 0, canConfront: false, error: 'Hunt has expired' };
      }

      // Check energy
      const tierConfig = BOUNTY_TIER_CONFIG[target.tier];
      const energyCost = tierConfig.energyCost;

      const canAffordEnergy = await EnergyService.canAfford(characterId, energyCost);
      if (!canAffordEnergy) {
        return { success: false, progressGained: 0, newProgress: hunt.trackingProgress, canConfront: false, error: 'Not enough energy' };
      }

      // Spend energy
      await EnergyService.spend(characterId, energyCost);

      // Calculate progress based on tracking difficulty
      const difficultyModifier = 1 - (target.trackingDifficulty / 200); // 0.5 to 1.0
      const progressGained = Math.floor(this.PROGRESS_PER_ACTION * difficultyModifier * (0.8 + Math.random() * 0.4));

      hunt.trackingProgress = Math.min(100, hunt.trackingProgress + progressGained);
      hunt.energySpent += energyCost;

      // Check for random encounter
      let encounter: BountyEncounter | undefined;
      if (Math.random() < this.ENCOUNTER_CHANCE) {
        encounter = this.generateEncounter(target, hunt);
        hunt.encounters.push(encounter);
        hunt.cluesFound++;
      }

      await hunt.save();

      const canConfront = hunt.trackingProgress >= this.TRACKING_THRESHOLD;

      logger.debug('Tracking progress', {
        characterId,
        targetId: hunt.targetId,
        progressGained,
        newProgress: hunt.trackingProgress,
        canConfront
      });

      return {
        success: true,
        progressGained,
        newProgress: hunt.trackingProgress,
        encounter,
        canConfront
      };
    } catch (error) {
      logger.error('Error progressing tracking', { characterId, error });
      return { success: false, progressGained: 0, newProgress: 0, canConfront: false, error: 'Failed to progress tracking' };
    }
  }

  /**
   * Generate a random encounter during tracking
   */
  private static generateEncounter(target: BountyTarget, hunt: IBountyHunt): BountyEncounter {
    const encounterTypes: Array<BountyEncounter['type']> = ['clue', 'witness', 'trap'];
    if (target.hasGang) {
      encounterTypes.push('gang_encounter');
    }

    const type = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
    const location = target.knownLocations[Math.floor(Math.random() * target.knownLocations.length)];

    // Determine outcome based on random chance
    const roll = Math.random() * 100;
    const successThreshold = 60 - (target.trackingDifficulty / 5);
    const partialThreshold = successThreshold + 25;

    let outcome: 'success' | 'partial' | 'failure';
    if (roll < successThreshold) {
      outcome = 'success';
    } else if (roll < partialThreshold) {
      outcome = 'partial';
    } else {
      outcome = 'failure';
    }

    const descriptions: Record<BountyEncounter['type'], string[]> = {
      clue: [
        `Found tracks leading toward ${location}`,
        'Discovered a discarded item belonging to the target',
        'Found a witness who saw the target recently'
      ],
      witness: [
        'A local shopkeeper remembers selling supplies to the target',
        'A traveler reports seeing the target on the road',
        'A bartender overheard the target discussing plans'
      ],
      trap: [
        'The target left a trap that you narrowly avoided',
        'You triggered an alarm set by the target',
        'An ambush was waiting but you spotted it in time'
      ],
      ambush: [
        'The target tried to ambush you but you were ready',
        'You walked into a trap set by the target'
      ],
      gang_encounter: [
        'You encountered members of the target\'s gang',
        'Gang lookouts spotted you and reported back',
        'You had to fight off gang members protecting the target'
      ]
    };

    const descriptionList = descriptions[type];
    const description = descriptionList[Math.floor(Math.random() * descriptionList.length)];

    return {
      type,
      location,
      outcome,
      description,
      timestamp: new Date()
    };
  }

  /**
   * Confront the bounty target
   */
  static async confrontTarget(
    characterId: string,
    method: 'fight' | 'negotiate' | 'ambush'
  ): Promise<ConfrontResult> {
    try {
      const hunt = await BountyHunt.findActiveHunt(characterId);
      if (!hunt) {
        return { success: false, outcome: 'escaped', error: 'No active hunt' };
      }

      if (hunt.trackingProgress < this.TRACKING_THRESHOLD) {
        return { success: false, outcome: 'escaped', error: 'Not enough tracking progress to confront' };
      }

      const target = getBountyTargetById(hunt.targetId);
      if (!target) {
        return { success: false, outcome: 'escaped', error: 'Invalid target' };
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, outcome: 'escaped', error: 'Character not found' };
      }

      // Check if hunt has expired
      if (new Date() > hunt.expiresAt) {
        hunt.status = 'expired';
        hunt.completedAt = new Date();
        await hunt.save();
        return { success: false, outcome: 'escaped', error: 'Hunt has expired' };
      }

      // Validate method
      if (method === 'negotiate' && !target.canNegotiate) {
        return { success: false, outcome: 'escaped', error: 'This target cannot be negotiated with' };
      }
      if (method === 'ambush' && !target.canAmbush) {
        return { success: false, outcome: 'escaped', error: 'This target cannot be ambushed' };
      }

      hunt.status = 'confronted';

      // Calculate success chance
      let successChance = 50; // Base 50%
      successChance += (hunt.trackingProgress - this.TRACKING_THRESHOLD) / 2; // Bonus for extra tracking
      successChance += hunt.cluesFound * 5; // Bonus for clues
      successChance -= target.combatDifficulty / 3; // Penalty for difficulty

      // Method bonuses
      if (method === 'ambush') {
        successChance += 15;
      } else if (method === 'negotiate') {
        successChance += 10;
        successChance += character.stats.spirit * 2; // Spirit helps negotiation
      } else if (method === 'fight') {
        successChance += character.stats.combat * 2; // Combat helps fighting
      }

      // Cap success chance
      successChance = Math.max(20, Math.min(90, successChance));

      const roll = Math.random() * 100;
      const success = roll < successChance;

      if (success) {
        // Determine capture or kill
        const captureMethod: 'dead' | 'alive' = method === 'negotiate' || Math.random() > 0.3 ? 'alive' : 'dead';
        const outcome = captureMethod === 'alive' ? 'captured' : 'killed';

        hunt.status = captureMethod === 'alive' ? 'captured' : 'killed';
        hunt.captureMethod = captureMethod;
        hunt.completedAt = new Date();

        // Calculate rewards (with territory bounty bonuses - Phase 2.2)
        let goldAwarded = calculateBountyReward(target, captureMethod);
        let xpAwarded = target.xpReward;

        // TERRITORY BONUS: Apply bounty bonuses
        try {
          const charObjId = new mongoose.Types.ObjectId(characterId);
          const bountyBonuses = await TerritoryBonusService.getBountyBonuses(charObjId);
          if (bountyBonuses.hasBonuses) {
            goldAwarded = Math.floor(goldAwarded * bountyBonuses.bonuses.value);
            xpAwarded = Math.floor(xpAwarded * bountyBonuses.bonuses.xp);
            logger.debug(`Territory bounty bonuses: gold ${bountyBonuses.bonuses.value}x, xp ${bountyBonuses.bonuses.xp}x`);
          }
        } catch (bonusError) {
          logger.warn('Failed to apply territory bounty bonus:', bonusError);
        }

        hunt.goldAwarded = goldAwarded;
        hunt.xpAwarded = xpAwarded;

        // Award gold
        await GoldService.addGold(
          characterId,
          goldAwarded,
          TransactionSource.BOUNTY_REWARD,
          { targetId: target.targetId, captureMethod }
        );

        // Award XP
        await CharacterProgressionService.addExperience(characterId, xpAwarded, 'bounty_hunting');

        // Handle reputation
        let reputationChange: { faction: string; amount: number } | undefined;
        if (target.reputationReward) {
          reputationChange = target.reputationReward;
          hunt.reputationChange = reputationChange;
          // TODO: Apply reputation change to character
        }

        await hunt.save();

        // Phase 5.1: Trigger daily contract progress for bounty completion
        try {
          await DailyContractService.triggerProgress(
            characterId,
            outcome === 'captured' ? 'bounty_captured' : 'bounty_killed',
            { type: 'bounty', amount: 1 }
          );
        } catch (contractError) {
          logger.warn('Failed to update daily contract progress for bounty', { characterId, error: contractError });
        }

        // Phase 5.1: Process portfolio investments (passive income)
        try {
          await this.processPortfolioInvestments(hunt._id.toString(), true);
        } catch (portfolioError) {
          logger.warn('Failed to process portfolio investments', { bountyId: hunt._id.toString(), error: portfolioError });
        }

        logger.info('Bounty hunt completed', {
          characterId,
          characterName: character.name,
          targetId: target.targetId,
          targetName: target.name,
          outcome,
          goldAwarded,
          xpAwarded
        });

        return {
          success: true,
          outcome,
          goldAwarded,
          xpAwarded,
          reputationChange
        };
      } else {
        // Target escaped
        if (Math.random() * 100 < target.escapeChance) {
          hunt.status = 'escaped';
          hunt.completedAt = new Date();
          await hunt.save();

          // Phase 5.1: Process failed portfolio investments
          try {
            await this.processPortfolioInvestments(hunt._id.toString(), false);
          } catch (portfolioError) {
            logger.warn('Failed to process failed portfolio investments', { bountyId: hunt._id.toString(), error: portfolioError });
          }

          logger.info('Bounty target escaped', {
            characterId,
            targetId: target.targetId,
            targetName: target.name
          });

          return {
            success: false,
            outcome: 'escaped',
            error: target.escapeDialogue || 'The target got away!'
          };
        } else {
          // Failed confrontation but can try again
          hunt.status = 'tracking';
          hunt.trackingProgress = Math.max(0, hunt.trackingProgress - 20); // Lose some progress
          await hunt.save();

          return {
            success: false,
            outcome: 'escaped',
            error: 'The confrontation failed. Track them again.'
          };
        }
      }
    } catch (error) {
      logger.error('Error confronting target', { characterId, error });
      return { success: false, outcome: 'escaped', error: 'Failed to confront target' };
    }
  }

  /**
   * Abandon the current bounty hunt
   */
  static async abandonHunt(characterId: string): Promise<boolean> {
    try {
      const hunt = await BountyHunt.findActiveHunt(characterId);
      if (!hunt) {
        return false;
      }

      hunt.status = 'abandoned';
      hunt.completedAt = new Date();
      await hunt.save();

      logger.info('Bounty hunt abandoned', { characterId, targetId: hunt.targetId });
      return true;
    } catch (error) {
      logger.error('Error abandoning hunt', { characterId, error });
      return false;
    }
  }

  /**
   * Get hunt history for a character
   */
  static async getHuntHistory(characterId: string, limit: number = 20): Promise<IBountyHunt[]> {
    return BountyHunt.getHuntHistory(characterId, limit);
  }

  /**
   * Get bounty hunting statistics for a character
   */
  static async getStatistics(characterId: string): Promise<{
    totalHunts: number;
    successfulHunts: number;
    escapedHunts: number;
    totalGoldEarned: number;
    totalXpEarned: number;
    favoriteTarget?: string;
  }> {
    const history = await BountyHunt.find({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    const successfulHunts = history.filter(h => h.status === 'captured' || h.status === 'killed');
    const escapedHunts = history.filter(h => h.status === 'escaped');

    const totalGoldEarned = successfulHunts.reduce((sum, h) => sum + (h.goldAwarded || 0), 0);
    const totalXpEarned = successfulHunts.reduce((sum, h) => sum + (h.xpAwarded || 0), 0);

    // Find most hunted target
    const targetCounts: Record<string, number> = {};
    for (const hunt of successfulHunts) {
      targetCounts[hunt.targetId] = (targetCounts[hunt.targetId] || 0) + 1;
    }
    const favoriteTarget = Object.entries(targetCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return {
      totalHunts: history.length,
      successfulHunts: successfulHunts.length,
      escapedHunts: escapedHunts.length,
      totalGoldEarned,
      totalXpEarned,
      favoriteTarget
    };
  }

  // ============ Passive Bounty Portfolio Methods (Phase 5.1) ============

  /**
   * Invest in an existing bounty for passive returns
   * Target: 30% of bounty income from passive investments
   */
  static async investInBounty(
    characterId: string,
    bountyId: string,
    goldAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check feature unlock
      const hasFeature = await this.hasFeatureUnlocked(characterId);
      if (!hasFeature) {
        return { success: false, error: 'Bounty hunting not unlocked. Reach level 20.' };
      }

      // Validate investment amount (minimum 50 gold)
      if (goldAmount < 50) {
        return { success: false, error: 'Minimum investment is 50 gold' };
      }

      // Check if character has enough gold
      if (!character.hasGoldResource(goldAmount)) {
        return { success: false, error: 'Not enough gold for investment' };
      }

      // Find the bounty hunt
      const hunt = await BountyHunt.findById(bountyId);
      if (!hunt) {
        return { success: false, error: 'Bounty hunt not found' };
      }

      // Validate bounty is active
      if (hunt.status !== 'tracking' && hunt.status !== 'confronted') {
        return { success: false, error: 'Can only invest in active bounties' };
      }

      // Can't invest in your own bounty
      if (hunt.characterId.toString() === characterId) {
        return { success: false, error: 'Cannot invest in your own bounty' };
      }

      // Check if bounty has expired
      if (new Date() > hunt.expiresAt) {
        return { success: false, error: 'Bounty has expired' };
      }

      // Initialize portfolio if not exists
      if (!character.bountyPortfolio) {
        character.bountyPortfolio = {
          activeBounties: [],
          portfolioValue: 0,
          totalInvested: 0,
          totalReturns: 0,
          pendingReturns: 0,
          successfulInvestments: 0,
          failedInvestments: 0
        };
      }

      // Check for duplicate investment
      const existingInvestment = character.bountyPortfolio.activeBounties.find(
        b => b.bountyId === bountyId
      );
      if (existingInvestment) {
        return { success: false, error: 'Already invested in this bounty' };
      }

      // Calculate expected return (30% profit on success)
      const expectedReturn = Math.floor(goldAmount * 1.30);

      // Deduct gold from character
      character.goldResource -= goldAmount;

      // Add investment to portfolio
      character.bountyPortfolio.activeBounties.push({
        bountyId,
        targetId: hunt.targetId,
        goldInvested: goldAmount,
        investedAt: new Date(),
        expectedReturn,
        status: 'active'
      });

      // Update portfolio stats
      character.bountyPortfolio.portfolioValue += goldAmount;
      character.bountyPortfolio.totalInvested += goldAmount;

      await character.save();

      logger.info('Bounty investment made', {
        characterId,
        bountyId,
        goldAmount,
        expectedReturn
      });

      return { success: true };
    } catch (error) {
      logger.error('Error investing in bounty', { characterId, bountyId, error });
      return { success: false, error: 'Failed to invest in bounty' };
    }
  }

  /**
   * Collect returns from successful bounty investments
   */
  static async collectPortfolioReturns(characterId: string): Promise<{
    success: boolean;
    goldCollected: number;
    error?: string;
  }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, goldCollected: 0, error: 'Character not found' };
      }

      if (!character.bountyPortfolio || character.bountyPortfolio.pendingReturns === 0) {
        return { success: false, goldCollected: 0, error: 'No returns to collect' };
      }

      const goldCollected = character.bountyPortfolio.pendingReturns;

      // Award gold
      await GoldService.addGold(
        characterId,
        goldCollected,
        TransactionSource.BOUNTY_REWARD,
        { portfolioReturns: true }
      );

      // Update portfolio
      character.bountyPortfolio.pendingReturns = 0;
      character.bountyPortfolio.totalReturns += goldCollected;

      await character.save();

      logger.info('Bounty portfolio returns collected', {
        characterId,
        goldCollected
      });

      return { success: true, goldCollected };
    } catch (error) {
      logger.error('Error collecting portfolio returns', { characterId, error });
      return { success: false, goldCollected: 0, error: 'Failed to collect returns' };
    }
  }

  /**
   * Get portfolio status and overview
   */
  static async getPortfolioStatus(characterId: string): Promise<{
    portfolioValue: number;
    totalInvested: number;
    totalReturns: number;
    pendingReturns: number;
    activeBounties: number;
    successfulInvestments: number;
    failedInvestments: number;
    successRate: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character || !character.bountyPortfolio) {
      return {
        portfolioValue: 0,
        totalInvested: 0,
        totalReturns: 0,
        pendingReturns: 0,
        activeBounties: 0,
        successfulInvestments: 0,
        failedInvestments: 0,
        successRate: 0
      };
    }

    const portfolio = character.bountyPortfolio;
    const totalInvestments = portfolio.successfulInvestments + portfolio.failedInvestments;
    const successRate = totalInvestments > 0
      ? (portfolio.successfulInvestments / totalInvestments) * 100
      : 0;

    return {
      portfolioValue: portfolio.portfolioValue,
      totalInvested: portfolio.totalInvested,
      totalReturns: portfolio.totalReturns,
      pendingReturns: portfolio.pendingReturns,
      activeBounties: portfolio.activeBounties.filter(b => b.status === 'active').length,
      successfulInvestments: portfolio.successfulInvestments,
      failedInvestments: portfolio.failedInvestments,
      successRate: Math.round(successRate)
    };
  }

  /**
   * Process portfolio investments when a bounty hunt completes
   * Called internally when a bounty is completed
   */
  static async processPortfolioInvestments(bountyId: string, success: boolean): Promise<void> {
    try {
      // Find all characters with investments in this bounty
      const investors = await Character.find({
        'bountyPortfolio.activeBounties.bountyId': bountyId,
        'bountyPortfolio.activeBounties.status': 'active'
      });

      for (const investor of investors) {
        if (!investor.bountyPortfolio) continue;

        const investment = investor.bountyPortfolio.activeBounties.find(
          b => b.bountyId === bountyId && b.status === 'active'
        );

        if (!investment) continue;

        if (success) {
          // Bounty successful - add returns to pending
          investment.status = 'completed';
          investor.bountyPortfolio.pendingReturns += investment.expectedReturn;
          investor.bountyPortfolio.successfulInvestments += 1;

          logger.info('Portfolio investment successful', {
            characterId: investor._id.toString(),
            bountyId,
            goldInvested: investment.goldInvested,
            returns: investment.expectedReturn
          });
        } else {
          // Bounty failed - investment lost
          investment.status = 'failed';
          investor.bountyPortfolio.failedInvestments += 1;

          logger.info('Portfolio investment failed', {
            characterId: investor._id.toString(),
            bountyId,
            goldInvested: investment.goldInvested
          });
        }

        // Update portfolio value (remove this investment)
        investor.bountyPortfolio.portfolioValue -= investment.goldInvested;

        await investor.save();
      }
    } catch (error) {
      logger.error('Error processing portfolio investments', { bountyId, error });
    }
  }
}
