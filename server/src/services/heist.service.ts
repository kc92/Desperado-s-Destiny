/**
 * Heist Service
 *
 * Handles heist planning, execution, and management
 */

import mongoose from 'mongoose';
import { GangHeist, IGangHeist } from '../models/GangHeist.model';
import { GangEconomy } from '../models/GangEconomy.model';
import { Gang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import {
  HeistTarget,
  HEIST_CONFIGS,
  GangBankAccountType,
  HeistPlanningRequest,
  HeistRole,
  HeistStatus,
} from '@desperados/shared';
import logger from '../utils/logger';

export class HeistService {
  /**
   * Get available heist targets for a gang
   */
  static async getAvailableHeists(gangId: string): Promise<
    Array<{
      target: HeistTarget;
      config: typeof HEIST_CONFIGS[HeistTarget];
      onCooldown: boolean;
      meetsRequirements: boolean;
    }>
  > {
    const gang = await Gang.findById(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) });

    const availableHeists = [];

    for (const [target, config] of Object.entries(HEIST_CONFIGS)) {
      const onCooldown = await GangHeist.isTargetOnCooldown(gangId, target as HeistTarget, config.cooldownDays);

      let meetsRequirements = true;
      if (config.requirements?.gangLevel && gang.level < config.requirements.gangLevel) {
        meetsRequirements = false;
      }
      if (config.requirements?.heatLevelMax) {
        // Check gang's heat level from active heists
        const activeHeists = await GangHeist.findActiveHeists(gangId);
        const totalHeat = activeHeists.reduce((sum, h) => sum + h.heatLevel, 0);
        if (totalHeat > config.requirements.heatLevelMax) {
          meetsRequirements = false;
        }
      }

      availableHeists.push({
        target: target as HeistTarget,
        config,
        onCooldown,
        meetsRequirements,
      });
    }

    return availableHeists;
  }

  /**
   * Start planning a heist
   */
  static async planHeist(
    gangId: string,
    characterId: string,
    request: HeistPlanningRequest
  ): Promise<IGangHeist> {
    const { target, roleAssignments } = request;

    const config = HEIST_CONFIGS[target];
    if (!config) {
      throw new Error('Invalid heist target');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can plan heists');
      }

      // Check cooldown
      const onCooldown = await GangHeist.isTargetOnCooldown(gangId, target, config.cooldownDays);
      if (onCooldown) {
        throw new Error(`Heist target is on cooldown for ${config.cooldownDays} days`);
      }

      // Check requirements
      if (config.requirements?.gangLevel && gang.level < config.requirements.gangLevel) {
        throw new Error(`Gang must be level ${config.requirements.gangLevel} for this heist`);
      }

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // Check if gang can afford equipment
      if (!economy.canAfford(GangBankAccountType.OPERATING_FUND, config.equipmentCost)) {
        throw new Error(
          `Insufficient funds for equipment. Need ${config.equipmentCost}, have ${economy.bank.operatingFund}`
        );
      }

      // Deduct equipment cost
      economy.deductFromAccount(GangBankAccountType.OPERATING_FUND, config.equipmentCost);
      await economy.save({ session });

      // Create heist
      const heist = await GangHeist.create(
        [
          {
            gangId: new mongoose.Types.ObjectId(gangId),
            gangName: gang.name,
            target,
            targetName: config.name,
            targetLocation: config.location,
            potentialPayout: config.potentialPayout,
            requiredMembers: config.requiredMembers,
            roles: [],
            planningProgress: 0,
            equipmentCost: config.equipmentCost,
            riskLevel: config.baseRiskLevel,
            heatLevel: 0,
            status: HeistStatus.PLANNING,
          },
        ],
        { session }
      );

      // Assign roles
      for (const assignment of roleAssignments) {
        const character = await Character.findById(assignment.characterId).session(session);
        if (!character) {
          throw new Error(`Character ${assignment.characterId} not found`);
        }

        if (!gang.isMember(assignment.characterId)) {
          throw new Error(`Character ${character.name} is not a member of the gang`);
        }

        // Calculate skill level based on character level and relevant skills
        const skillLevel = Math.min(100, character.level * 2);

        heist[0].addRoleAssignment(assignment.role, assignment.characterId, character.name, skillLevel);
      }

      await heist[0].save({ session });
      await session.commitTransaction();

      logger.info(`Gang ${gang.name} started planning heist: ${config.name}`);

      return heist[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error planning heist:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Increase planning progress (requires time/actions)
   */
  static async increasePlanning(
    gangId: string,
    heistId: string,
    characterId: string,
    amount: number = 10
  ): Promise<IGangHeist> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const heist = await GangHeist.findById(heistId).session(session);
      if (!heist) {
        throw new Error('Heist not found');
      }

      if (heist.gangId.toString() !== gangId) {
        throw new Error('Heist does not belong to this gang');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isMember(characterId)) {
        throw new Error('Character is not a member of this gang');
      }

      heist.increasePlanningProgress(amount);
      await heist.save({ session });

      await session.commitTransaction();

      logger.info(`Heist ${heistId} planning increased to ${heist.planningProgress}%`);

      return heist;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error increasing planning:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute a heist
   */
  static async executeHeist(gangId: string, heistId: string, characterId: string): Promise<IGangHeist> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const heist = await GangHeist.findById(heistId).session(session);
      if (!heist) {
        throw new Error('Heist not found');
      }

      if (heist.gangId.toString() !== gangId) {
        throw new Error('Heist does not belong to this gang');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can execute heists');
      }

      if (!heist.canExecute()) {
        throw new Error('Heist is not ready to execute');
      }

      // Execute the heist
      const result = await heist.executeHeist();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // Add payout to war chest if successful
      if (result.payout > 0) {
        economy.addToAccount(GangBankAccountType.WAR_CHEST, result.payout);
        await economy.save({ session });
      }

      // Handle arrested members
      if (result.arrested.length > 0) {
        for (const arrestedId of result.arrested) {
          const character = await Character.findById(arrestedId).session(session);
          if (character) {
            // Add jail time (simple implementation - in full game would use jail system)
            logger.info(`Character ${character.name} was arrested during heist`);
          }
        }
      }

      // Handle casualties
      if (result.casualties.length > 0) {
        for (const casualtyId of result.casualties) {
          const character = await Character.findById(casualtyId).session(session);
          if (character) {
            // Handle injury/death (simple implementation)
            logger.info(`Character ${character.name} was injured during heist`);
          }
        }
      }

      // Increase gang heat level
      const activeHeists = await GangHeist.findActiveHeists(gangId);
      const totalHeat = activeHeists.reduce((sum, h) => sum + h.heatLevel, 0);
      logger.info(`Gang ${gang.name} heat level: ${totalHeat + heist.riskLevel}`);

      await session.commitTransaction();

      logger.info(
        `Heist ${heist.targetName} executed: ${result.outcome}, payout: ${result.payout}, arrested: ${result.arrested.length}`
      );

      return heist;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error executing heist:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel a heist (loses planning progress, keeps equipment cost)
   */
  static async cancelHeist(gangId: string, heistId: string, characterId: string): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const heist = await GangHeist.findById(heistId).session(session);
      if (!heist) {
        throw new Error('Heist not found');
      }

      if (heist.gangId.toString() !== gangId) {
        throw new Error('Heist does not belong to this gang');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can cancel heists');
      }

      if (heist.status === HeistStatus.COMPLETED || heist.status === HeistStatus.IN_PROGRESS) {
        throw new Error('Cannot cancel completed or in-progress heists');
      }

      heist.status = HeistStatus.CANCELLED;
      await heist.save({ session });

      await session.commitTransaction();

      logger.info(`Heist ${heist.targetName} cancelled by gang ${gang.name}`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error cancelling heist:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang heists
   */
  static async getGangHeists(gangId: string, includeCompleted: boolean = false): Promise<IGangHeist[]> {
    const query: any = { gangId: new mongoose.Types.ObjectId(gangId) };

    if (!includeCompleted) {
      query.status = { $ne: HeistStatus.COMPLETED };
    }

    return GangHeist.find(query).sort({ createdAt: -1 });
  }
}
