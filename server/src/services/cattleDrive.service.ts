/**
 * Cattle Drive Service
 * Handles cattle drive operations: starting, progressing, events, and completion
 *
 * Sprint 7: Mid-Game Content - Cattle Drives (L30 unlock)
 */

import mongoose from 'mongoose';
import { SecureRNG } from './base/SecureRNG';
import {
  CattleDrive,
  ICattleDrive,
  DriveStatus,
  DailyDecisionType,
  CompanionRole,
  IHerdStatus,
  IDailyDecision,
  IDriveCompanion
} from '../models/CattleDrive.model';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { EnergyService } from './energy.service';
import { MilestoneRewardService } from './milestoneReward.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  getDriveRoute,
  getAvailableRoutes,
  getRandomEvent,
  getEventById,
  calculateCattleLoss,
  calculateDriveRewards,
  DriveRouteConfig,
  DriveEvent,
  DriveRoute
} from '../data/activities/cattleDrives';
import logger from '../utils/logger';
import { TerritoryBonusService } from './territoryBonus.service';

export interface StartDriveResult {
  success: boolean;
  drive?: ICattleDrive;
  error?: string;
}

export interface ProgressDriveResult {
  success: boolean;
  drive?: ICattleDrive;
  phaseCompleted?: number;
  eventTriggered?: DriveEvent;
  error?: string;
}

export interface HandleEventResult {
  success: boolean;
  drive?: ICattleDrive;
  outcome: 'success' | 'failure';
  cattleLost: number;
  bonusGold: number;
  message: string;
  error?: string;
}

export interface CompleteDriveResult {
  success: boolean;
  gold: number;
  xp: number;
  survivalRate: number;
  cattleDelivered: number;
  cattleLost: number;
  error?: string;
}

export interface DriveStatistics {
  totalDrives: number;
  completedDrives: number;
  abandonedDrives: number;
  failedDrives: number;
  totalCattleDelivered: number;
  totalGoldEarned: number;
  totalXpEarned: number;
  averageSurvivalRate: number;
  routeBreakdown: Record<string, number>;
}

// Phase 5.3: Active Gameplay Enhancement Results
export interface DecisionEffects {
  healthChange: number;
  moraleChange: number;
  fatigueChange: number;
  message: string;
}

export interface DailyDecisionResult {
  success: boolean;
  drive?: ICattleDrive;
  herdStatusChange?: DecisionEffects;
  message?: string;
  error?: string;
}

export interface HerdStatusResult {
  health: number;
  morale: number;
  fatigue: number;
  headCount: number;
  losses: number;
}

export interface CompanionInviteResult {
  success: boolean;
  error?: string;
}

export interface EventResponseResult {
  success: boolean;
  drive?: ICattleDrive;
  outcome: 'success' | 'failure';
  cattleLost: number;
  bonusGold: number;
  message: string;
  timedOut?: boolean;
  error?: string;
}

export class CattleDriveService {
  /**
   * Check if a character has the cattle drives feature unlocked
   */
  static async hasFeatureUnlocked(characterId: string): Promise<boolean> {
    return MilestoneRewardService.hasFeature(characterId, 'cattle_drives');
  }

  /**
   * Get available routes for a character
   */
  static async getAvailableRoutesForCharacter(characterId: string): Promise<{
    routes: DriveRouteConfig[];
    activeDrive: ICattleDrive | null;
    canStartDrive: boolean;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const hasFeature = await this.hasFeatureUnlocked(characterId);
    if (!hasFeature) {
      return { routes: [], activeDrive: null, canStartDrive: false };
    }

    const routes = getAvailableRoutes(character.level);
    const activeDrive = await CattleDrive.findActiveByCharacter(characterId);
    const canStartDrive = !activeDrive;

    return { routes, activeDrive, canStartDrive };
  }

  /**
   * Start a new cattle drive
   */
  static async startDrive(
    characterId: string,
    routeId: DriveRoute
  ): Promise<StartDriveResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check feature unlock
      const hasFeature = await this.hasFeatureUnlocked(characterId);
      if (!hasFeature) {
        return { success: false, error: 'Cattle drives not unlocked. Reach level 30.' };
      }

      // Check for active drive
      const activeDrive = await CattleDrive.findActiveByCharacter(characterId);
      if (activeDrive) {
        return { success: false, error: 'You already have an active cattle drive' };
      }

      // Get route configuration
      const route = getDriveRoute(routeId);
      if (!route) {
        return { success: false, error: 'Invalid route' };
      }

      // Check level requirement
      if (character.level < route.levelRequired) {
        return { success: false, error: `You must be level ${route.levelRequired} to start this drive` };
      }

      // Check energy for first phase
      const canAffordEnergy = await EnergyService.canAfford(characterId, route.energyCostPerPhase);
      if (!canAffordEnergy) {
        return { success: false, error: `Not enough energy. Need ${route.energyCostPerPhase} energy to start.` };
      }

      // Deduct energy
      await EnergyService.spend(characterId, route.energyCostPerPhase);

      // Phase 5.3: Initialize herd status and first daily decision
      const now = new Date();
      const firstDecisionDeadline = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours

      const initialHerdStatus: IHerdStatus = {
        health: 100,
        morale: 100,
        fatigue: 0,
        headCount: route.baseCattleCapacity,
        losses: 0,
        lastUpdated: now
      };

      const firstDailyDecision: IDailyDecision = {
        day: 1,
        deadline: firstDecisionDeadline,
        timedOut: false
      };

      // Create the drive
      const drive = await CattleDrive.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        routeId: route.routeId,
        status: 'awaiting_decision', // Phase 5.3: Start with decision required
        currentPhase: 1,
        totalPhases: route.phases,
        startingCattle: route.baseCattleCapacity,
        currentCattle: route.baseCattleCapacity,
        participants: [new mongoose.Types.ObjectId(characterId)],
        companions: [],
        herdStatus: initialHerdStatus,
        dailyDecision: firstDailyDecision,
        decisionHistory: [],
        events: [],
        totalGoldEarned: 0,
        totalXpEarned: 0,
        startedAt: now
      });

      logger.info('Cattle drive started', {
        characterId,
        characterName: character.name,
        routeId,
        cattle: route.baseCattleCapacity,
        phases: route.phases
      });

      return { success: true, drive };
    } catch (error) {
      logger.error('Error starting cattle drive', { characterId, routeId, error });
      return { success: false, error: 'Failed to start cattle drive' };
    }
  }

  // =========================================================================
  // Phase 5.3: ACTIVE GAMEPLAY ENHANCEMENT
  // =========================================================================

  /**
   * Get the current daily decision for a character's active drive
   */
  static async getDailyDecision(characterId: string): Promise<IDailyDecision | null> {
    const drive = await CattleDrive.findActiveByCharacter(characterId);
    if (!drive || !drive.dailyDecision) {
      return null;
    }

    // Check if decision has expired
    const now = new Date();
    if (drive.dailyDecision.deadline < now && !drive.dailyDecision.decision) {
      // Auto-apply default decision
      await this.applyDefaultDecision(drive);
      return null;
    }

    return drive.dailyDecision;
  }

  /**
   * Make a daily decision for the drive
   */
  static async makeDailyDecision(
    characterId: string,
    decision: DailyDecisionType
  ): Promise<DailyDecisionResult> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, error: 'No active cattle drive found' };
      }

      if (!drive.dailyDecision) {
        return { success: false, error: 'No pending decision' };
      }

      if (drive.dailyDecision.decision) {
        return { success: false, error: 'Decision already made for today' };
      }

      const now = new Date();
      if (drive.dailyDecision.deadline < now) {
        return { success: false, error: 'Decision deadline has passed' };
      }

      // Apply decision effects
      const effects = this.calculateDecisionEffects(decision, drive);

      // Update herd status
      drive.herdStatus.health = Math.max(0, Math.min(100, drive.herdStatus.health + effects.healthChange));
      drive.herdStatus.morale = Math.max(0, Math.min(100, drive.herdStatus.morale + effects.moraleChange));
      drive.herdStatus.fatigue = Math.max(0, Math.min(100, drive.herdStatus.fatigue + effects.fatigueChange));
      drive.herdStatus.lastUpdated = now;

      // Record decision
      drive.dailyDecision.decision = decision;
      drive.dailyDecision.madeAt = now;
      drive.decisionHistory.push({ ...drive.dailyDecision });
      drive.dailyDecision = undefined;

      // Change status back to in_progress
      drive.status = 'in_progress';

      await drive.save();

      logger.info('Daily decision made', {
        characterId,
        driveId: drive.driveId,
        decision,
        effects
      });

      return {
        success: true,
        drive,
        herdStatusChange: effects,
        message: effects.message
      };
    } catch (error) {
      logger.error('Error making daily decision', { characterId, decision, error });
      return { success: false, error: 'Failed to make decision' };
    }
  }

  /**
   * Apply default decision when deadline is missed
   */
  private static async applyDefaultDecision(drive: ICattleDrive): Promise<void> {
    if (!drive.dailyDecision) return;

    const now = new Date();
    const effects = this.calculateDecisionEffects('steady_pace', drive);

    // Apply penalty for missing deadline
    drive.herdStatus.health = Math.max(0, drive.herdStatus.health + effects.healthChange - 5);
    drive.herdStatus.morale = Math.max(0, drive.herdStatus.morale + effects.moraleChange - 10);
    drive.herdStatus.fatigue = Math.min(100, drive.herdStatus.fatigue + effects.fatigueChange + 5);
    drive.herdStatus.lastUpdated = now;

    drive.dailyDecision.decision = 'steady_pace';
    drive.dailyDecision.timedOut = true;
    drive.dailyDecision.madeAt = now;
    drive.decisionHistory.push({ ...drive.dailyDecision });
    drive.dailyDecision = undefined;
    drive.status = 'in_progress';

    await drive.save();

    logger.warn('Daily decision timed out - default applied', {
      driveId: drive.driveId,
      day: drive.dailyDecision?.day
    });
  }

  /**
   * Calculate the effects of a daily decision
   */
  private static calculateDecisionEffects(
    decision: DailyDecisionType,
    drive: ICattleDrive
  ): DecisionEffects {
    // Get companion bonuses
    const companionBonuses = this.getCompanionBonuses(drive.companions);

    switch (decision) {
      case 'push_hard':
        return {
          healthChange: -5,
          moraleChange: -10,
          fatigueChange: 20,
          message: 'Pushed hard - made good progress but the herd is tired'
        };

      case 'steady_pace':
        return {
          healthChange: -2,
          moraleChange: 0,
          fatigueChange: 10,
          message: 'Steady pace - balanced progress without overexertion'
        };

      case 'rest_day':
        const cookBonus = companionBonuses.cookMoraleBonus || 0;
        return {
          healthChange: 5,
          moraleChange: 10 + cookBonus,
          fatigueChange: -15,
          message: 'Rest day - herd recovered well' + (cookBonus > 0 ? ' (cook bonus!)' : '')
        };

      case 'take_shortcut':
        return {
          healthChange: -10,
          moraleChange: -5,
          fatigueChange: 5,
          message: 'Took shortcut - rough terrain took its toll'
        };

      case 'avoid_danger':
        const scoutBonus = companionBonuses.scoutAvoidanceBonus || 0;
        return {
          healthChange: 0,
          moraleChange: 5,
          fatigueChange: 8,
          message: 'Avoided danger - safer but slower' + (scoutBonus > 0 ? ' (scout helped!)' : '')
        };

      default:
        return {
          healthChange: 0,
          moraleChange: 0,
          fatigueChange: 10,
          message: 'Standard progress'
        };
    }
  }

  /**
   * Get current herd status
   */
  static async getHerdStatus(characterId: string): Promise<HerdStatusResult | null> {
    const drive = await CattleDrive.findActiveByCharacter(characterId);
    if (!drive) {
      return null;
    }

    return {
      health: drive.herdStatus.health,
      morale: drive.herdStatus.morale,
      fatigue: drive.herdStatus.fatigue,
      headCount: drive.herdStatus.headCount,
      losses: drive.herdStatus.losses
    };
  }

  /**
   * Update herd status based on external events
   */
  static async updateHerdStatus(
    driveId: string,
    changes: Partial<IHerdStatus>
  ): Promise<void> {
    const drive = await CattleDrive.findOne({ driveId });
    if (!drive) {
      throw new Error('Drive not found');
    }

    if (changes.health !== undefined) {
      drive.herdStatus.health = Math.max(0, Math.min(100, changes.health));
    }
    if (changes.morale !== undefined) {
      drive.herdStatus.morale = Math.max(0, Math.min(100, changes.morale));
    }
    if (changes.fatigue !== undefined) {
      drive.herdStatus.fatigue = Math.max(0, Math.min(100, changes.fatigue));
    }
    if (changes.headCount !== undefined) {
      drive.herdStatus.headCount = changes.headCount;
      drive.currentCattle = changes.headCount;
    }
    if (changes.losses !== undefined) {
      drive.herdStatus.losses = changes.losses;
    }

    drive.herdStatus.lastUpdated = new Date();
    await drive.save();
  }

  /**
   * Invite a companion to join the drive
   */
  static async inviteCompanion(
    driveId: string,
    companionCharacterId: string,
    role: CompanionRole
  ): Promise<CompanionInviteResult> {
    try {
      const drive = await CattleDrive.findOne({ driveId });
      if (!drive) {
        return { success: false, error: 'Drive not found' };
      }

      // Check if companion already exists
      const existingCompanion = drive.companions.find(
        c => c.characterId.toString() === companionCharacterId
      );
      if (existingCompanion) {
        return { success: false, error: 'Character already a companion on this drive' };
      }

      // Check if role is already filled
      const roleExists = drive.companions.find(c => c.role === role);
      if (roleExists) {
        return { success: false, error: `Role ${role} is already filled` };
      }

      // Add companion
      const companion: IDriveCompanion = {
        characterId: new mongoose.Types.ObjectId(companionCharacterId),
        role,
        contribution: 0,
        joinedAt: new Date()
      };

      drive.companions.push(companion);
      await drive.save();

      logger.info('Companion added to drive', {
        driveId,
        companionCharacterId,
        role
      });

      return { success: true };
    } catch (error) {
      logger.error('Error inviting companion', { driveId, companionCharacterId, role, error });
      return { success: false, error: 'Failed to invite companion' };
    }
  }

  /**
   * Get companion bonuses for a drive
   */
  private static getCompanionBonuses(companions: IDriveCompanion[]): {
    scoutAvoidanceBonus?: number;
    wranglerControlBonus?: number;
    cookMoraleBonus?: number;
    guardDefenseBonus?: number;
  } {
    const bonuses: any = {};

    for (const companion of companions) {
      switch (companion.role) {
        case 'scout':
          bonuses.scoutAvoidanceBonus = 20; // +20% encounter avoidance
          break;
        case 'wrangler':
          bonuses.wranglerControlBonus = 15; // +15% herd control
          break;
        case 'cook':
          bonuses.cookMoraleBonus = 10; // +10 morale recovery
          break;
        case 'guard':
          bonuses.guardDefenseBonus = 25; // +25% bandit defense
          break;
      }
    }

    return bonuses;
  }

  /**
   * Respond to an active event (replaces handleEvent for Phase 5.3)
   */
  static async respondToEvent(
    characterId: string,
    eventId: string,
    choiceId: string
  ): Promise<EventResponseResult> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'No active cattle drive found' };
      }

      if (drive.status !== 'event' || !drive.pendingEvent) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'No pending event to handle' };
      }

      // Check if event has timed out
      const now = new Date();
      let timedOut = false;
      if (drive.pendingEvent.expiresAt < now) {
        timedOut = true;
        // Apply worst outcome
        return await this.handleEventTimeout(drive);
      }

      const event = getEventById(drive.pendingEvent.eventId);
      if (!event) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Invalid event' };
      }

      const choice = event.choices.find(c => c.choiceId === choiceId);
      if (!choice) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Invalid choice' };
      }

      // Determine outcome
      let isSuccess = true;
      if (choice.skillCheck) {
        const character = await Character.findById(characterId);
        if (!character) {
          return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Character not found' };
        }

        const skillLevel = character.stats?.cunning || 5;
        const roll = SecureRNG.float(0, 10, 1) + skillLevel;
        isSuccess = roll >= choice.skillCheck.difficulty + 5;
      }

      // Get companion bonuses
      const companionBonuses = this.getCompanionBonuses(drive.companions);

      // Calculate cattle lost
      let cattleLost = 0;
      let bonusGold = 0;
      let message = '';

      if (isSuccess) {
        let lossPercent = 100 - choice.successOutcome.cattleSavedPercent;

        // Apply wrangler bonus to reduce cattle loss
        if (companionBonuses.wranglerControlBonus) {
          lossPercent = lossPercent * (1 - companionBonuses.wranglerControlBonus / 100);
        }

        cattleLost = calculateCattleLoss(drive.currentCattle, lossPercent);
        bonusGold = choice.successOutcome.bonusGold || 0;
        message = choice.successOutcome.message;
      } else {
        let lossPercent = choice.failureOutcome.cattleLostPercent;

        // Apply wrangler bonus to reduce cattle loss
        if (companionBonuses.wranglerControlBonus) {
          lossPercent = lossPercent * (1 - companionBonuses.wranglerControlBonus / 100);
        }

        cattleLost = calculateCattleLoss(drive.currentCattle, lossPercent);
        message = choice.failureOutcome.message;
      }

      // Update drive
      drive.currentCattle = Math.max(0, drive.currentCattle - cattleLost);
      drive.herdStatus.headCount = drive.currentCattle;
      drive.herdStatus.losses += cattleLost;
      drive.herdStatus.health = Math.max(0, drive.herdStatus.health - (cattleLost / drive.startingCattle) * 20);
      drive.herdStatus.lastUpdated = now;
      drive.totalGoldEarned += bonusGold;

      drive.events.push({
        phaseNumber: drive.currentPhase,
        eventId: event.eventId,
        choiceId,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        timestamp: now
      });

      drive.pendingEvent = undefined;
      drive.status = drive.currentCattle > 0 ? 'in_progress' : 'failed';

      if (drive.currentCattle === 0) {
        drive.completedAt = now;
      }

      await drive.save();

      // Award bonus gold if any
      if (bonusGold > 0) {
        await GoldService.addGold(
          characterId,
          bonusGold,
          TransactionSource.CATTLE_DRIVE,
          { type: 'cattle_drive_event_bonus', driveId: drive.driveId }
        );
      }

      logger.info('Cattle drive event responded', {
        characterId,
        driveId: drive.driveId,
        eventId: event.eventId,
        choiceId,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        timedOut
      });

      return {
        success: true,
        drive,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        message,
        timedOut
      };
    } catch (error) {
      logger.error('Error responding to cattle drive event', { characterId, eventId, choiceId, error });
      return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Failed to respond to event' };
    }
  }

  /**
   * Handle event timeout (worst outcome)
   */
  private static async handleEventTimeout(drive: ICattleDrive): Promise<EventResponseResult> {
    const event = getEventById(drive.pendingEvent!.eventId);
    if (!event) {
      return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Invalid event' };
    }

    // Find worst outcome among all choices
    let worstLoss = 0;
    for (const choice of event.choices) {
      const lossPercent = choice.failureOutcome.cattleLostPercent;
      worstLoss = Math.max(worstLoss, lossPercent);
    }

    const cattleLost = calculateCattleLoss(drive.currentCattle, worstLoss);
    const now = new Date();

    drive.currentCattle = Math.max(0, drive.currentCattle - cattleLost);
    drive.herdStatus.headCount = drive.currentCattle;
    drive.herdStatus.losses += cattleLost;
    drive.herdStatus.health = Math.max(0, drive.herdStatus.health - 25); // Extra penalty
    drive.herdStatus.morale = Math.max(0, drive.herdStatus.morale - 15);
    drive.herdStatus.lastUpdated = now;

    drive.events.push({
      phaseNumber: drive.currentPhase,
      eventId: event.eventId,
      choiceId: 'timeout',
      outcome: 'failure',
      cattleLost,
      bonusGold: 0,
      timestamp: now
    });

    drive.pendingEvent!.timedOut = true;
    drive.pendingEvent = undefined;
    drive.status = drive.currentCattle > 0 ? 'in_progress' : 'failed';

    if (drive.currentCattle === 0) {
      drive.completedAt = now;
    }

    await drive.save();

    return {
      success: true,
      drive,
      outcome: 'failure',
      cattleLost,
      bonusGold: 0,
      message: 'No response to the event - worst outcome occurred',
      timedOut: true
    };
  }

  // =========================================================================
  // END Phase 5.3
  // =========================================================================

  /**
   * Progress to the next phase of the drive
   */
  static async progressDrive(characterId: string): Promise<ProgressDriveResult> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, error: 'No active cattle drive found' };
      }

      // Can't progress if there's a pending event
      if (drive.status === 'event' && drive.pendingEvent) {
        return { success: false, error: 'You must resolve the current event first' };
      }

      // Phase 5.3: Can't progress if awaiting decision
      if (drive.status === 'awaiting_decision' && drive.dailyDecision) {
        return { success: false, error: 'You must make a daily decision first' };
      }

      const route = getDriveRoute(drive.routeId as DriveRoute);
      if (!route) {
        return { success: false, error: 'Invalid route configuration' };
      }

      // Check if drive is complete
      if (drive.currentPhase >= drive.totalPhases) {
        return { success: false, error: 'Drive is already at the final phase. Complete the drive.' };
      }

      // Check energy
      const canAffordEnergy = await EnergyService.canAfford(characterId, route.energyCostPerPhase);
      if (!canAffordEnergy) {
        return { success: false, error: `Not enough energy. Need ${route.energyCostPerPhase} energy.` };
      }

      // Deduct energy
      await EnergyService.spend(characterId, route.energyCostPerPhase);

      // Advance phase
      drive.currentPhase++;
      const now = new Date();

      // Phase 5.3: Apply herd fatigue for progression
      drive.herdStatus.fatigue = Math.min(100, drive.herdStatus.fatigue + 5);
      drive.herdStatus.lastUpdated = now;

      // Check for random event (with scout companion bonus)
      const companionBonuses = this.getCompanionBonuses(drive.companions);
      let eventChance = route.eventChance;
      if (companionBonuses.scoutAvoidanceBonus) {
        eventChance = eventChance * (1 - companionBonuses.scoutAvoidanceBonus / 100);
      }

      let eventTriggered: DriveEvent | undefined;
      if (SecureRNG.chance(eventChance)) {
        const event = getRandomEvent();
        const eventExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        drive.pendingEvent = {
          eventId: event.eventId,
          occurredAt: now,
          expiresAt: eventExpiry,
          timedOut: false
        };
        drive.status = 'event';
        eventTriggered = event;
      } else {
        // Phase 5.3: Create new daily decision after progress
        const nextDecisionDeadline = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
        drive.dailyDecision = {
          day: drive.currentPhase,
          deadline: nextDecisionDeadline,
          timedOut: false
        };
        drive.status = 'awaiting_decision';
      }

      await drive.save();

      logger.info('Cattle drive progressed', {
        characterId,
        driveId: drive.driveId,
        phase: drive.currentPhase,
        totalPhases: drive.totalPhases,
        eventTriggered: eventTriggered?.eventId
      });

      return {
        success: true,
        drive,
        phaseCompleted: drive.currentPhase,
        eventTriggered
      };
    } catch (error) {
      logger.error('Error progressing cattle drive', { characterId, error });
      return { success: false, error: 'Failed to progress cattle drive' };
    }
  }

  /**
   * Handle a drive event choice
   */
  static async handleEvent(
    characterId: string,
    choiceId: string
  ): Promise<HandleEventResult> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'No active cattle drive found' };
      }

      if (drive.status !== 'event' || !drive.pendingEvent) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'No pending event to handle' };
      }

      const event = getEventById(drive.pendingEvent.eventId);
      if (!event) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Invalid event' };
      }

      const choice = event.choices.find(c => c.choiceId === choiceId);
      if (!choice) {
        return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Invalid choice' };
      }

      // Determine outcome
      let isSuccess = true;
      if (choice.skillCheck) {
        // Get character's skill level
        const character = await Character.findById(characterId);
        if (!character) {
          return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Character not found' };
        }

        // Simplified skill check: compare skill level to difficulty
        // In a real implementation, this would use the skill system
        const skillLevel = character.stats?.cunning || 5; // Default fallback
        const roll = SecureRNG.float(0, 10, 1) + skillLevel;
        isSuccess = roll >= choice.skillCheck.difficulty + 5;
      }

      // Calculate cattle lost
      let cattleLost = 0;
      let bonusGold = 0;
      let message = '';

      if (isSuccess) {
        const lossPercent = 100 - choice.successOutcome.cattleSavedPercent;
        cattleLost = calculateCattleLoss(drive.currentCattle, lossPercent);
        bonusGold = choice.successOutcome.bonusGold || 0;
        message = choice.successOutcome.message;
      } else {
        cattleLost = calculateCattleLoss(drive.currentCattle, choice.failureOutcome.cattleLostPercent);
        message = choice.failureOutcome.message;
      }

      // Update drive
      drive.currentCattle = Math.max(0, drive.currentCattle - cattleLost);
      drive.totalGoldEarned += bonusGold;
      drive.events.push({
        phaseNumber: drive.currentPhase,
        eventId: event.eventId,
        choiceId,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        timestamp: new Date()
      });
      drive.pendingEvent = undefined;
      drive.status = drive.currentCattle > 0 ? 'in_progress' : 'failed';

      // Check for drive failure
      if (drive.currentCattle === 0) {
        drive.completedAt = new Date();
      }

      await drive.save();

      // Award bonus gold if any
      if (bonusGold > 0) {
        await GoldService.addGold(
          characterId,
          bonusGold,
          TransactionSource.CATTLE_DRIVE,
          { type: 'cattle_drive_event_bonus', driveId: drive.driveId }
        );
      }

      logger.info('Cattle drive event handled', {
        characterId,
        driveId: drive.driveId,
        eventId: event.eventId,
        choiceId,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        remainingCattle: drive.currentCattle
      });

      return {
        success: true,
        drive,
        outcome: isSuccess ? 'success' : 'failure',
        cattleLost,
        bonusGold,
        message
      };
    } catch (error) {
      logger.error('Error handling cattle drive event', { characterId, choiceId, error });
      return { success: false, outcome: 'failure', cattleLost: 0, bonusGold: 0, message: '', error: 'Failed to handle event' };
    }
  }

  /**
   * Complete a cattle drive and collect rewards
   */
  static async completeDrive(characterId: string): Promise<CompleteDriveResult> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'No active cattle drive found' };
      }

      if (drive.status === 'event' && drive.pendingEvent) {
        return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'You must resolve the current event first' };
      }

      if (drive.currentPhase < drive.totalPhases) {
        return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'Drive not yet complete. Continue progressing.' };
      }

      if (drive.currentCattle === 0) {
        return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'All cattle lost. Drive failed.' };
      }

      const route = getDriveRoute(drive.routeId as DriveRoute);
      if (!route) {
        return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'Invalid route configuration' };
      }

      // Phase 5.3: Apply herd health to survival rate
      const healthMultiplier = drive.herdStatus.health / 100;
      const moraleMultiplier = drive.herdStatus.morale / 100;
      const adjustedCattle = Math.floor(drive.currentCattle * healthMultiplier);

      // Calculate rewards (with territory cattle bonuses - Phase 2.2)
      const baseRewards = calculateDriveRewards(
        route,
        drive.startingCattle,
        adjustedCattle,
        drive.participants.length + drive.companions.length, // Include companions
        drive.totalGoldEarned
      );

      // TERRITORY BONUS: Apply cattle drive bonuses (Phase 2.2 + Phase 5.3)
      let rewards = { ...baseRewards };
      try {
        const charObjId = new mongoose.Types.ObjectId(characterId);
        const cattleBonuses = await TerritoryBonusService.getCattleBonuses(charObjId);
        if (cattleBonuses.hasBonuses) {
          // Apply reward bonus
          rewards.gold = Math.floor(baseRewards.gold * cattleBonuses.bonuses.reward);
          rewards.xp = Math.floor(baseRewards.xp * cattleBonuses.bonuses.reward);

          // Apply survival bonus to final cattle count (retroactive)
          const survivalBonus = cattleBonuses.bonuses.survival;
          const bonusCattle = Math.floor(drive.startingCattle * (survivalBonus - 1));
          const finalAdjustedCattle = Math.min(drive.startingCattle, adjustedCattle + bonusCattle);

          // Recalculate with survival bonus
          const bonusRewards = calculateDriveRewards(
            route,
            drive.startingCattle,
            finalAdjustedCattle,
            drive.participants.length + drive.companions.length,
            drive.totalGoldEarned
          );

          rewards.gold = Math.floor(bonusRewards.gold * cattleBonuses.bonuses.reward);
          rewards.xp = Math.floor(bonusRewards.xp * cattleBonuses.bonuses.reward);

          logger.debug(`Territory cattle bonuses: reward ${cattleBonuses.bonuses.reward}x, survival ${cattleBonuses.bonuses.survival}x`);
        }
      } catch (bonusError) {
        logger.warn('Failed to apply territory cattle bonus:', bonusError);
      }

      // Phase 5.3: Apply morale bonus to gold
      rewards.gold = Math.floor(rewards.gold * (0.8 + moraleMultiplier * 0.2)); // 80%-100% based on morale

      // Award gold
      await GoldService.addGold(
        characterId,
        rewards.gold,
        TransactionSource.CATTLE_DRIVE,
        { type: 'cattle_drive_completion', driveId: drive.driveId, routeId: route.routeId }
      );

      // Award XP (would integrate with character progression)
      // For now, we track it in the drive record

      // Update drive
      drive.status = 'completed';
      drive.completedAt = new Date();
      drive.totalGoldEarned = rewards.gold;
      drive.totalXpEarned = rewards.xp;
      await drive.save();

      const cattleLost = drive.startingCattle - drive.currentCattle;

      logger.info('Cattle drive completed', {
        characterId,
        driveId: drive.driveId,
        routeId: route.routeId,
        gold: rewards.gold,
        xp: rewards.xp,
        survivalRate: rewards.survivalRate,
        cattleDelivered: drive.currentCattle,
        cattleLost
      });

      return {
        success: true,
        gold: rewards.gold,
        xp: rewards.xp,
        survivalRate: rewards.survivalRate,
        cattleDelivered: drive.currentCattle,
        cattleLost
      };
    } catch (error) {
      logger.error('Error completing cattle drive', { characterId, error });
      return { success: false, gold: 0, xp: 0, survivalRate: 0, cattleDelivered: 0, cattleLost: 0, error: 'Failed to complete cattle drive' };
    }
  }

  /**
   * Abandon a cattle drive early
   */
  static async abandonDrive(characterId: string): Promise<{ success: boolean; partialReward?: number; error?: string }> {
    try {
      const drive = await CattleDrive.findActiveByCharacter(characterId);
      if (!drive) {
        return { success: false, error: 'No active cattle drive found' };
      }

      const route = getDriveRoute(drive.routeId as DriveRoute);
      if (!route) {
        return { success: false, error: 'Invalid route configuration' };
      }

      // Calculate partial reward (25% of what would have been earned)
      const partialReward = Math.floor(
        route.baseReward * (drive.currentPhase / drive.totalPhases) *
        (drive.currentCattle / drive.startingCattle) * 0.25
      );

      if (partialReward > 0) {
        await GoldService.addGold(
          characterId,
          partialReward,
          TransactionSource.CATTLE_DRIVE,
          { type: 'cattle_drive_abandoned', driveId: drive.driveId }
        );
      }

      drive.status = 'abandoned';
      drive.completedAt = new Date();
      drive.totalGoldEarned = partialReward;
      await drive.save();

      logger.info('Cattle drive abandoned', {
        characterId,
        driveId: drive.driveId,
        phase: drive.currentPhase,
        partialReward
      });

      return { success: true, partialReward };
    } catch (error) {
      logger.error('Error abandoning cattle drive', { characterId, error });
      return { success: false, error: 'Failed to abandon cattle drive' };
    }
  }

  /**
   * Get the current status of an active drive
   */
  static async getActiveDriveStatus(characterId: string): Promise<{
    drive: ICattleDrive | null;
    route?: DriveRouteConfig;
    pendingEvent?: DriveEvent;
  }> {
    const drive = await CattleDrive.findActiveByCharacter(characterId);
    if (!drive) {
      return { drive: null };
    }

    const route = getDriveRoute(drive.routeId as DriveRoute);
    let pendingEvent: DriveEvent | undefined;

    if (drive.pendingEvent) {
      pendingEvent = getEventById(drive.pendingEvent.eventId);
    }

    return { drive, route, pendingEvent };
  }

  /**
   * Get cattle drive statistics for a character
   */
  static async getStatistics(characterId: string): Promise<DriveStatistics> {
    const drives = await CattleDrive.findByCharacter(characterId);

    const completedDrives = drives.filter(d => d.status === 'completed');
    const abandonedDrives = drives.filter(d => d.status === 'abandoned');
    const failedDrives = drives.filter(d => d.status === 'failed');

    const totalCattleDelivered = completedDrives.reduce((sum, d) => sum + d.currentCattle, 0);
    const totalGoldEarned = drives.reduce((sum, d) => sum + d.totalGoldEarned, 0);
    const totalXpEarned = drives.reduce((sum, d) => sum + d.totalXpEarned, 0);

    const survivalRates = completedDrives.map(d => d.currentCattle / d.startingCattle);
    const averageSurvivalRate = survivalRates.length > 0
      ? survivalRates.reduce((a, b) => a + b, 0) / survivalRates.length
      : 0;

    const routeBreakdown: Record<string, number> = {};
    for (const drive of completedDrives) {
      routeBreakdown[drive.routeId] = (routeBreakdown[drive.routeId] || 0) + 1;
    }

    return {
      totalDrives: drives.length,
      completedDrives: completedDrives.length,
      abandonedDrives: abandonedDrives.length,
      failedDrives: failedDrives.length,
      totalCattleDelivered,
      totalGoldEarned,
      totalXpEarned,
      averageSurvivalRate: Math.round(averageSurvivalRate * 100) / 100,
      routeBreakdown
    };
  }
}
