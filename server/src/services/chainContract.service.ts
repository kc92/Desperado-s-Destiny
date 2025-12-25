/**
 * Chain Contract Service
 *
 * Phase 3: Contract Expansion
 * Handles multi-step sequential contracts with escalating rewards
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DailyContract, IContract, IDailyContract, ContractStatus } from '../models/DailyContract.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { IChainStep, IChainData, CONTRACT_CONSTANTS } from '@desperados/shared';
import { CHAIN_CONTRACTS, ContractTemplate, scaleRewards } from '../data/contractTemplates';
import { DollarService } from './dollar.service';
import { broadcastToUser } from '../config/socket';
import logger from '../utils/logger';

/**
 * Chain step completion result
 */
export interface IChainStepResult {
  stepCompleted: boolean;
  chainCompleted: boolean;
  stepReward?: {
    gold: number;
    xp: number;
  };
  nextStep?: IChainStep;
  totalProgress: {
    currentStep: number;
    totalSteps: number;
    overallProgress: number; // 0-100%
  };
}

/**
 * Chain completion result
 */
export interface IChainCompletionResult {
  totalReward: {
    gold: number;
    xp: number;
  };
  bonusReward: {
    gold: number;
    xp: number;
  };
  stepRewardsCollected: number;
  chainDuration: number; // milliseconds
}

/**
 * Chain Contract Service
 */
export class ChainContractService {
  /**
   * Start a chain contract from a template
   */
  static async startChain(
    characterId: mongoose.Types.ObjectId,
    chainTemplateId: string
  ): Promise<IContract | null> {
    try {
      // Find the chain template
      const template = CHAIN_CONTRACTS.find(t => t.id === chainTemplateId);
      if (!template || !template.chainSteps || template.chainSteps.length === 0) {
        logger.warn(`Chain template not found or invalid: ${chainTemplateId}`);
        return null;
      }

      // Get character for level check
      const character = await Character.findById(characterId);
      if (!character) {
        logger.warn(`Character not found: ${characterId}`);
        return null;
      }

      // Check level requirement
      if (template.levelRequirement && character.level < template.levelRequirement) {
        logger.debug(`Character ${characterId} doesn't meet level requirement for chain ${chainTemplateId}`);
        return null;
      }

      // Get today's daily contract record
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today
      });

      if (!dailyRecord) {
        logger.warn(`No daily contract record found for character ${characterId}`);
        return null;
      }

      // Check if player already has this chain active
      const existingChain = dailyRecord.contracts.find(
        c => c.templateId === chainTemplateId &&
             c.status !== 'completed' &&
             c.status !== 'expired'
      );

      if (existingChain) {
        logger.debug(`Character ${characterId} already has chain ${chainTemplateId} active`);
        return null;
      }

      // Calculate rewards based on character level
      const scaledRewards = template.levelScaling
        ? scaleRewards(template.baseRewards, template.difficulty, character.level)
        : template.baseRewards;

      const totalRewards = {
        gold: Math.floor(scaledRewards.gold * (template.rewardMultiplier || 1.0)),
        xp: Math.floor(scaledRewards.xp * (template.rewardMultiplier || 1.0))
      };

      // Get first step
      const firstStep = template.chainSteps[0];

      // Create chain contract
      const now = new Date();
      const expiresAt = new Date(today);
      expiresAt.setUTCHours(23, 59, 59, 999);

      const chainContract: IContract = {
        id: uuidv4(),
        templateId: template.id,
        type: 'chain',
        title: template.titleTemplate,
        description: template.descriptionTemplate,
        target: {
          type: 'chain',
          name: firstStep.title
        },
        requirements: {
          amount: firstStep.progressRequired,
          ...(template.gangRequired && { gangRequired: true }),
          ...(template.gangRankRequired && { gangRankRequired: template.gangRankRequired })
        },
        rewards: totalRewards,
        difficulty: template.difficulty,
        status: 'available' as ContractStatus,
        progress: 0,
        progressMax: firstStep.progressRequired,
        expiresAt,
        chainData: {
          chainId: template.id,
          currentStep: 1,
          totalSteps: template.chainSteps.length,
          stepProgress: 0,
          stepProgressMax: firstStep.progressRequired,
          stepsCompleted: [],
          startedAt: now,
          stepRewardsCollected: 0
        }
      };

      // Add to daily contracts
      dailyRecord.contracts.push(chainContract);
      await dailyRecord.save();

      logger.info(`Started chain contract "${template.titleTemplate}" for character ${characterId}`);

      // Notify player
      try {
        await broadcastToUser(characterId.toString(), 'chain_contract:started', {
          contract: {
            id: chainContract.id,
            title: chainContract.title,
            currentStep: 1,
            totalSteps: template.chainSteps.length,
            stepTitle: firstStep.title,
            stepDescription: firstStep.description
          }
        });
      } catch (socketError) {
        logger.debug('Socket broadcast failed for chain start');
      }

      return chainContract;
    } catch (error) {
      logger.error('Error starting chain contract:', error);
      return null;
    }
  }

  /**
   * Progress current step of chain
   * Returns true if step was completed
   */
  static async progressChainStep(
    characterId: mongoose.Types.ObjectId,
    contractId: string,
    amount: number = 1
  ): Promise<IChainStepResult | null> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today
      });

      if (!dailyRecord) {
        return null;
      }

      const contractIndex = dailyRecord.contracts.findIndex(c => c.id === contractId);
      if (contractIndex === -1) {
        return null;
      }

      const contract = dailyRecord.contracts[contractIndex];

      // Verify this is a chain contract
      if (contract.type !== 'chain' || !contract.chainData) {
        logger.warn(`Contract ${contractId} is not a chain contract`);
        return null;
      }

      // Verify contract is in progress
      if (contract.status !== 'in_progress') {
        if (contract.status === 'available') {
          // Auto-accept the contract
          contract.status = 'in_progress';
          contract.acceptedAt = new Date();
        } else {
          return null;
        }
      }

      // Check expiry
      if (new Date() > contract.expiresAt) {
        contract.status = 'expired';
        await dailyRecord.save();
        return null;
      }

      // Get the template for step info
      const template = CHAIN_CONTRACTS.find(t => t.id === contract.chainData!.chainId);
      if (!template || !template.chainSteps) {
        return null;
      }

      const currentStepIndex = contract.chainData.currentStep - 1;
      const currentStep = template.chainSteps[currentStepIndex];

      // Update step progress
      contract.chainData.stepProgress = Math.min(
        contract.chainData.stepProgress + amount,
        contract.chainData.stepProgressMax
      );

      // Update main progress for display
      contract.progress = contract.chainData.stepProgress;

      const stepCompleted = contract.chainData.stepProgress >= contract.chainData.stepProgressMax;
      const isLastStep = contract.chainData.currentStep >= contract.chainData.totalSteps;

      let stepReward: { gold: number; xp: number } | undefined;
      let nextStep: IChainStep | undefined;

      if (stepCompleted) {
        // Calculate step reward
        const totalGold = contract.rewards.gold;
        const totalXp = contract.rewards.xp;

        stepReward = {
          gold: Math.floor(totalGold * currentStep.rewardMultiplier),
          xp: Math.floor(totalXp * currentStep.rewardMultiplier)
        };

        // Mark step as completed
        contract.chainData.stepsCompleted.push(`step_${contract.chainData.currentStep}`);
        contract.chainData.stepRewardsCollected += stepReward.gold;

        // Award step reward
        const character = await Character.findById(characterId);
        if (character) {
          await DollarService.addDollars(
            characterId,
            stepReward.gold,
            TransactionSource.CONTRACT_REWARD,
            `Chain step ${contract.chainData.currentStep} reward: ${contract.title}`
          );
          await character.addExperience(stepReward.xp);
        }

        if (isLastStep) {
          // Chain completed!
          contract.status = 'completed';
          contract.completedAt = new Date();

          // Award completion bonus (CONTRACT_CONSTANTS.CHAIN_COMPLETION_BONUS = 0.5 = 50%)
          const completionBonus = {
            gold: Math.floor(totalGold * 0.5),
            xp: Math.floor(totalXp * 0.5)
          };

          if (character) {
            await DollarService.addDollars(
              characterId,
              completionBonus.gold,
              TransactionSource.CONTRACT_REWARD,
              `Chain completion bonus: ${contract.title}`
            );
            await character.addExperience(completionBonus.xp);
          }

          logger.info(`Chain contract "${contract.title}" completed by character ${characterId}`);

          // Notify player of chain completion
          try {
            await broadcastToUser(characterId.toString(), 'chain_contract:completed', {
              contractId: contract.id,
              title: contract.title,
              totalReward: {
                gold: contract.chainData.stepRewardsCollected + completionBonus.gold,
                xp: totalXp
              },
              completionBonus
            });
          } catch (socketError) {
            logger.debug('Socket broadcast failed for chain completion');
          }
        } else {
          // Advance to next step
          contract.chainData.currentStep += 1;
          const nextStepData = template.chainSteps[contract.chainData.currentStep - 1];
          contract.chainData.stepProgress = 0;
          contract.chainData.stepProgressMax = nextStepData.progressRequired;
          contract.progress = 0;
          contract.progressMax = nextStepData.progressRequired;
          contract.target.name = nextStepData.title;

          nextStep = nextStepData;

          logger.debug(`Chain contract "${contract.title}" advanced to step ${contract.chainData.currentStep}`);

          // Notify player of step completion
          try {
            await broadcastToUser(characterId.toString(), 'chain_contract:step_completed', {
              contractId: contract.id,
              completedStep: currentStepIndex + 1,
              nextStep: contract.chainData.currentStep,
              totalSteps: contract.chainData.totalSteps,
              stepReward,
              nextStepTitle: nextStepData.title,
              nextStepDescription: nextStepData.description
            });
          } catch (socketError) {
            logger.debug('Socket broadcast failed for step completion');
          }
        }
      }

      await dailyRecord.save();

      // Calculate overall progress
      const completedStepsProgress = (contract.chainData.stepsCompleted.length / contract.chainData.totalSteps) * 100;
      const currentStepProgress = (contract.chainData.stepProgress / contract.chainData.stepProgressMax) *
                                  (100 / contract.chainData.totalSteps);
      const overallProgress = Math.min(completedStepsProgress + currentStepProgress, 100);

      return {
        stepCompleted,
        chainCompleted: stepCompleted && isLastStep,
        stepReward,
        nextStep,
        totalProgress: {
          currentStep: contract.chainData.currentStep,
          totalSteps: contract.chainData.totalSteps,
          overallProgress
        }
      };
    } catch (error) {
      logger.error('Error progressing chain step:', error);
      return null;
    }
  }

  /**
   * Get current chain contract status for a character
   */
  static async getActiveChainContracts(
    characterId: mongoose.Types.ObjectId
  ): Promise<IContract[]> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today
      });

      if (!dailyRecord) {
        return [];
      }

      return dailyRecord.contracts.filter(
        c => c.type === 'chain' &&
             c.chainData &&
             (c.status === 'available' || c.status === 'in_progress')
      );
    } catch (error) {
      logger.error('Error getting active chain contracts:', error);
      return [];
    }
  }

  /**
   * Get chain contract details with step information
   */
  static async getChainDetails(
    characterId: mongoose.Types.ObjectId,
    contractId: string
  ): Promise<{
    contract: IContract;
    template: ContractTemplate;
    currentStep: IChainStep;
    allSteps: IChainStep[];
  } | null> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today
      });

      if (!dailyRecord) {
        return null;
      }

      const contract = dailyRecord.contracts.find(c => c.id === contractId);
      if (!contract || contract.type !== 'chain' || !contract.chainData) {
        return null;
      }

      const template = CHAIN_CONTRACTS.find(t => t.id === contract.chainData!.chainId);
      if (!template || !template.chainSteps) {
        return null;
      }

      const currentStep = template.chainSteps[contract.chainData.currentStep - 1];

      return {
        contract,
        template,
        currentStep,
        allSteps: template.chainSteps
      };
    } catch (error) {
      logger.error('Error getting chain details:', error);
      return null;
    }
  }

  /**
   * Check if an action triggers progress on any active chain contracts
   * Called from various services when actions complete
   */
  static async triggerChainProgress(
    characterId: mongoose.Types.ObjectId,
    actionType: string,
    actionData?: Record<string, unknown>
  ): Promise<IChainStepResult[]> {
    const results: IChainStepResult[] = [];

    try {
      const activeChains = await this.getActiveChainContracts(characterId);

      for (const contract of activeChains) {
        if (!contract.chainData) continue;

        const template = CHAIN_CONTRACTS.find(t => t.id === contract.chainData!.chainId);
        if (!template || !template.chainSteps) continue;

        const currentStep = template.chainSteps[contract.chainData.currentStep - 1];

        // Check if this action matches the current step's target type
        const matches = this.actionMatchesStepTarget(actionType, currentStep.targetType, actionData);

        if (matches) {
          const result = await this.progressChainStep(characterId, contract.id, 1);
          if (result) {
            results.push(result);
          }
        }
      }
    } catch (error) {
      logger.error('Error triggering chain progress:', error);
    }

    return results;
  }

  /**
   * Check if an action type matches a step's target type
   */
  private static actionMatchesStepTarget(
    actionType: string,
    stepTargetType: string,
    actionData?: Record<string, unknown>
  ): boolean {
    const actionToTargetMap: Record<string, string[]> = {
      // NPC interactions
      'npc_talk': ['npc'],
      'npc_interact': ['npc'],
      'social_complete': ['npc'],

      // Location visits
      'location_visit': ['location'],
      'travel_complete': ['location'],

      // Combat
      'combat_victory': ['enemy'],
      'npc_defeated': ['enemy'],
      'boss_defeated': ['boss', 'enemy'],

      // Crime
      'crime_success': ['crime'],
      'heist_complete': ['crime'],

      // Items
      'item_collected': ['item'],
      'item_crafted': ['item'],

      // Territory
      'territory_captured': ['territory'],
      'influence_gained': ['territory'],

      // Escape/count (generic progression)
      'action_complete': ['escape', 'count'],
      'contract_complete': ['count'],
    };

    const matchingTargets = actionToTargetMap[actionType] || [];
    return matchingTargets.includes(stepTargetType);
  }

  /**
   * Generate a chain contract for a character (for daily generation)
   */
  static async generateChainContract(
    characterId: mongoose.Types.ObjectId,
    seed: number
  ): Promise<IContract | null> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return null;
      }

      // Filter eligible chain templates
      const eligibleTemplates = CHAIN_CONTRACTS.filter(template => {
        // Check level requirement
        if (template.levelRequirement && character.level < template.levelRequirement) {
          return false;
        }

        // Check gang requirement
        if (template.gangRequired && !character.gangId) {
          return false;
        }

        return true;
      });

      if (eligibleTemplates.length === 0) {
        return null;
      }

      // Select template based on seed
      const templateIndex = Math.floor((seed % 1000) / 1000 * eligibleTemplates.length);
      const template = eligibleTemplates[templateIndex];

      // Create the chain contract
      return await this.startChain(characterId, template.id);
    } catch (error) {
      logger.error('Error generating chain contract:', error);
      return null;
    }
  }
}

export default ChainContractService;
