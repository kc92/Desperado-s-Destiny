/**
 * Tutorial State Service
 *
 * Manages tutorial progression state machine with 10-phase system
 * Handles skip/resume, phase transitions, and integration with game systems
 */

import mongoose, { ClientSession } from 'mongoose';
import {
  TutorialProgress,
  ITutorialProgress,
  TutorialPhase,
  PHASE_REQUIREMENTS,
  PHASE_TRANSITIONS,
  PHASE_DISPLAY_NAMES,
  getNextPhase,
  getPhaseIndex,
  SkipReason
} from '../models/TutorialProgress.model';
import {
  HawkCompanion,
  IHawkCompanion,
  HawkExpression,
  HawkMood,
  calculateMoodFromMetrics
} from '../models/HawkCompanion.model';
import { Character, ICharacter } from '../models/Character.model';
import { getMilestoneForPhase, ITutorialMilestone } from '../data/tutorialMilestones';
import { getPhaseDialogue, getReturningDialogue, HawkDialogueEntry } from '../data/hawkDialogue';
import logger from '../utils/logger';
import { broadcastToUser } from '../config/socket';

/**
 * Tutorial summary returned to frontend
 */
export interface ITutorialSummary {
  characterId: string;
  isActive: boolean;
  currentPhase: TutorialPhase;
  currentStep: number;
  totalSteps: number;
  phaseName: string;
  phaseProgress: number;
  overallProgress: number;
  phasesCompleted: TutorialPhase[];
  milestonesEarned: string[];
  mechanicsLearned: string[];
  wasSkipped: boolean;
  isGraduated: boolean;
  hawk: {
    isActive: boolean;
    expression: HawkExpression;
    mood: HawkMood;
  } | null;
}

/**
 * Step advance result
 */
export interface IStepAdvanceResult {
  newStep: number;
  phaseComplete: boolean;
  hawkDialogue?: HawkDialogueEntry;
  mechanicLearned?: string;
}

/**
 * Phase complete result
 */
export interface IPhaseCompleteResult {
  previousPhase: TutorialPhase;
  newPhase: TutorialPhase;
  milestone: ITutorialMilestone | null;
  hawkDialogue: HawkDialogueEntry;
  isGraduation: boolean;
}

/**
 * Auto-skip threshold - players above this level auto-skip
 */
const AUTO_SKIP_LEVEL = 15;

/**
 * Tutorial State Service
 */
export class TutorialStateService {
  /**
   * Initialize tutorial for a new character
   */
  static async initializeTutorial(
    characterId: string | mongoose.Types.ObjectId,
    session?: ClientSession
  ): Promise<ITutorialProgress> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    try {
      // Create tutorial progress document
      const progress = await TutorialProgress.findOrCreate(charId, session);

      // Create Hawk companion document
      await HawkCompanion.findOrCreate(charId, session);

      // Start at awakening phase
      if (progress.currentPhase === TutorialPhase.NOT_STARTED) {
        progress.currentPhase = TutorialPhase.AWAKENING;
        progress.currentStep = 0;
        progress.phaseStartedAt = new Date();
        progress.phaseProgress.set(TutorialPhase.AWAKENING, {
          startedAt: new Date(),
          stepsCompleted: 0,
          objectivesCompleted: []
        });
        await progress.save({ session });
      }

      // Activate Hawk
      await HawkCompanion.activate(charId, TutorialPhase.AWAKENING, session);

      // Emit socket event
      this.emitTutorialUpdate(charId.toString(), 'tutorial:initialized', {
        phase: progress.currentPhase,
        step: progress.currentStep
      });

      logger.info('Tutorial initialized', { characterId: charId.toString() });

      return progress;
    } catch (error) {
      logger.error('Failed to initialize tutorial', {
        error: error instanceof Error ? error.message : error,
        characterId: charId.toString()
      });
      throw error;
    }
  }

  /**
   * Progress to next step within current phase
   */
  static async advanceStep(
    characterId: string | mongoose.Types.ObjectId,
    objectiveCompleted?: string,
    session?: ClientSession
  ): Promise<IStepAdvanceResult> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      throw new Error('Tutorial progress not found');
    }

    // Check if tutorial is already complete or skipped
    if (progress.currentPhase === TutorialPhase.COMPLETED ||
        progress.currentPhase === TutorialPhase.SKIPPED) {
      throw new Error('Tutorial already completed or skipped');
    }

    const phaseReq = PHASE_REQUIREMENTS[progress.currentPhase];
    const totalSteps = phaseReq.steps || 1;

    // Record objective if provided
    if (objectiveCompleted) {
      const phaseProgress = progress.phaseProgress.get(progress.currentPhase);
      if (phaseProgress && !phaseProgress.objectivesCompleted.includes(objectiveCompleted)) {
        phaseProgress.objectivesCompleted.push(objectiveCompleted);
        progress.phaseProgress.set(progress.currentPhase, phaseProgress);
      }
    }

    // Advance step
    const newStep = progress.currentStep + 1;
    progress.currentStep = newStep;
    progress.totalStepsCompleted += 1;

    // Update phase progress
    const phaseProgress = progress.phaseProgress.get(progress.currentPhase);
    if (phaseProgress) {
      phaseProgress.stepsCompleted = newStep;
      progress.phaseProgress.set(progress.currentPhase, phaseProgress);
    }

    // Check if phase is complete
    const phaseComplete = newStep >= totalSteps;

    // Get Hawk dialogue for this step
    const dialogue = getPhaseDialogue(progress.currentPhase);
    let hawkDialogue: HawkDialogueEntry | undefined;
    if (dialogue && newStep > 0 && newStep <= dialogue.steps.length) {
      const stepDialogue = dialogue.steps[newStep - 1];
      hawkDialogue = {
        text: stepDialogue.text,
        expression: stepDialogue.expression,
        duration: 5000
      };
    }

    await progress.save({ session });

    // Update Hawk expression
    await this.updateHawkExpression(charId, hawkDialogue?.expression || HawkExpression.TEACHING);

    // Emit socket event
    this.emitTutorialUpdate(charId.toString(), 'tutorial:step_completed', {
      phase: progress.currentPhase,
      step: newStep,
      phaseComplete,
      totalSteps
    });

    return {
      newStep,
      phaseComplete,
      hawkDialogue
    };
  }

  /**
   * Complete current phase and transition to next
   */
  static async completePhase(
    characterId: string | mongoose.Types.ObjectId,
    session?: ClientSession
  ): Promise<IPhaseCompleteResult> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      throw new Error('Tutorial progress not found');
    }

    const previousPhase = progress.currentPhase;
    const validTransitions = PHASE_TRANSITIONS[previousPhase];

    // Get next phase (non-skip transition)
    const newPhase = getNextPhase(previousPhase);
    if (!newPhase || !validTransitions.includes(newPhase)) {
      throw new Error(`Invalid phase transition from ${previousPhase}`);
    }

    // Mark current phase as completed
    const phaseProgress = progress.phaseProgress.get(previousPhase);
    if (phaseProgress) {
      phaseProgress.completedAt = new Date();
      progress.phaseProgress.set(previousPhase, phaseProgress);
    }
    progress.phasesCompleted.push(previousPhase);

    // Get milestone for completed phase
    const milestone = getMilestoneForPhase(previousPhase) || null;
    if (milestone) {
      progress.milestonesEarned.push(milestone.id);
    }

    // Update to new phase
    progress.currentPhase = newPhase;
    progress.currentStep = 0;
    progress.phaseStartedAt = new Date();
    progress.phaseCompletedAt = undefined;

    // Initialize new phase progress
    if (newPhase !== TutorialPhase.COMPLETED) {
      progress.phaseProgress.set(newPhase, {
        startedAt: new Date(),
        stepsCompleted: 0,
        objectivesCompleted: []
      });
    }

    // Check for graduation
    const isGraduation = newPhase === TutorialPhase.GRADUATION ||
                         previousPhase === TutorialPhase.GRADUATION;

    // Mark as completed if graduating
    if (newPhase === TutorialPhase.COMPLETED) {
      progress.completedAt = new Date();
      progress.phaseCompletedAt = new Date();
    }

    await progress.save({ session });

    // Update Hawk companion phase
    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (hawk) {
      hawk.currentPhase = newPhase;
      if (newPhase === TutorialPhase.GRADUATION) {
        hawk.mood = HawkMood.NOSTALGIC;
        hawk.currentExpression = HawkExpression.PROUD;
      } else if (newPhase === TutorialPhase.COMPLETED) {
        hawk.currentExpression = HawkExpression.FAREWELL;
        hawk.isActive = false;
        hawk.graduatedAt = new Date();
        hawk.farewellGiven = true;
      }
      await hawk.save({ session });
    }

    // Get phase completion dialogue
    const phaseDialogue = getPhaseDialogue(previousPhase);
    const hawkDialogue: HawkDialogueEntry = phaseDialogue?.complete || {
      text: "You've done well. On to the next lesson.",
      expression: HawkExpression.PLEASED,
      duration: 5000
    };

    // Emit socket event
    this.emitTutorialUpdate(charId.toString(), 'tutorial:phase_completed', {
      previousPhase,
      newPhase,
      milestone: milestone?.id,
      isGraduation
    });

    logger.info('Tutorial phase completed', {
      characterId: charId.toString(),
      previousPhase,
      newPhase,
      milestoneEarned: milestone?.id
    });

    return {
      previousPhase,
      newPhase,
      milestone,
      hawkDialogue,
      isGraduation
    };
  }

  /**
   * Skip tutorial entirely
   */
  static async skipTutorial(
    characterId: string | mongoose.Types.ObjectId,
    reason: SkipReason = 'user_request',
    session?: ClientSession
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      throw new Error('Tutorial progress not found');
    }

    // Get character level for tracking
    const character = await Character.findById(charId);
    const level = character?.level || 1;

    // Update progress
    progress.wasSkipped = true;
    progress.skippedAt = new Date();
    progress.skippedAtPhase = progress.currentPhase;
    progress.skippedAtLevel = level;
    progress.skipReason = reason;
    progress.currentPhase = TutorialPhase.SKIPPED;

    await progress.save({ session });

    // Deactivate Hawk
    await HawkCompanion.deactivate(charId, false, session);

    // Emit socket event
    this.emitTutorialUpdate(charId.toString(), 'tutorial:skipped', {
      reason,
      skippedAtPhase: progress.skippedAtPhase,
      skippedAtLevel: level
    });

    logger.info('Tutorial skipped', {
      characterId: charId.toString(),
      reason,
      skippedAtPhase: progress.skippedAtPhase,
      level
    });
  }

  /**
   * Resume tutorial after disconnect/break
   */
  static async resumeTutorial(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<{
    currentPhase: TutorialPhase;
    currentStep: number;
    hawkDialogue: HawkDialogueEntry;
  }> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      throw new Error('Tutorial progress not found');
    }

    // Check if already completed or skipped
    if (progress.currentPhase === TutorialPhase.COMPLETED ||
        progress.currentPhase === TutorialPhase.SKIPPED) {
      throw new Error('Tutorial already completed or skipped');
    }

    // Update session tracking
    progress.lastSessionAt = new Date();
    progress.sessionCount += 1;
    await progress.save();

    // Get returning dialogue
    const hawkDialogue = getReturningDialogue(progress.currentPhase, progress.currentStep);

    // Update Hawk mood and expression
    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (hawk) {
      hawk.currentExpression = HawkExpression.PLEASED;
      hawk.mood = HawkMood.FRIENDLY;
      hawk.lastInteractionAt = new Date();
      await hawk.save();
    }

    // Emit socket event
    this.emitTutorialUpdate(charId.toString(), 'tutorial:resumed', {
      phase: progress.currentPhase,
      step: progress.currentStep
    });

    return {
      currentPhase: progress.currentPhase,
      currentStep: progress.currentStep,
      hawkDialogue
    };
  }

  /**
   * Check if player should auto-skip tutorial (overlevel)
   */
  static async checkAutoSkip(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const character = await Character.findById(charId);
    if (!character) return false;

    // Auto-skip if character is too high level
    if (character.level >= AUTO_SKIP_LEVEL) {
      const progress = await TutorialProgress.findByCharacterId(charId);

      // Only auto-skip if tutorial not already complete
      if (progress &&
          progress.currentPhase !== TutorialPhase.COMPLETED &&
          progress.currentPhase !== TutorialPhase.SKIPPED) {
        await this.skipTutorial(charId, 'overlevel');
        return true;
      }
    }

    return false;
  }

  /**
   * Record mechanic learned (for conditional tips)
   */
  static async recordMechanicLearned(
    characterId: string | mongoose.Types.ObjectId,
    mechanic: string
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) return;

    if (!progress.mechanicsLearned.includes(mechanic)) {
      progress.mechanicsLearned.push(mechanic);
      await progress.save();
    }
  }

  /**
   * Record tutorial statistics
   */
  static async recordTutorialStat(
    characterId: string | mongoose.Types.ObjectId,
    stat: 'combatWin' | 'skillTrained' | 'contractCompleted'
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) return;

    // Only track if tutorial is active
    if (progress.currentPhase === TutorialPhase.COMPLETED ||
        progress.currentPhase === TutorialPhase.SKIPPED) {
      return;
    }

    switch (stat) {
      case 'combatWin':
        progress.combatWinsInTutorial += 1;
        break;
      case 'skillTrained':
        progress.skillsTrainedInTutorial += 1;
        break;
      case 'contractCompleted':
        progress.contractsCompletedInTutorial += 1;
        break;
    }

    await progress.save();
  }

  /**
   * Get tutorial summary for API
   */
  static async getTutorialSummary(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<ITutorialSummary> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    const hawk = await HawkCompanion.findByCharacterId(charId);

    if (!progress) {
      // Return default for characters without tutorial progress
      return {
        characterId: charId.toString(),
        isActive: false,
        currentPhase: TutorialPhase.NOT_STARTED,
        currentStep: 0,
        totalSteps: 0,
        phaseName: PHASE_DISPLAY_NAMES[TutorialPhase.NOT_STARTED],
        phaseProgress: 0,
        overallProgress: 0,
        phasesCompleted: [],
        milestonesEarned: [],
        mechanicsLearned: [],
        wasSkipped: false,
        isGraduated: false,
        hawk: null
      };
    }

    const phaseReq = PHASE_REQUIREMENTS[progress.currentPhase];
    const totalSteps = phaseReq.steps || 1;
    const phaseProgress = totalSteps > 0 ? (progress.currentStep / totalSteps) * 100 : 0;

    // Calculate overall progress (phases completed / total active phases)
    const totalActivePhases = 9; // Awakening through Graduation
    const overallProgress = (progress.phasesCompleted.length / totalActivePhases) * 100;

    const isActive = progress.currentPhase !== TutorialPhase.COMPLETED &&
                     progress.currentPhase !== TutorialPhase.SKIPPED;

    return {
      characterId: charId.toString(),
      isActive,
      currentPhase: progress.currentPhase,
      currentStep: progress.currentStep,
      totalSteps,
      phaseName: PHASE_DISPLAY_NAMES[progress.currentPhase],
      phaseProgress,
      overallProgress,
      phasesCompleted: progress.phasesCompleted,
      milestonesEarned: progress.milestonesEarned,
      mechanicsLearned: progress.mechanicsLearned,
      wasSkipped: progress.wasSkipped,
      isGraduated: progress.currentPhase === TutorialPhase.COMPLETED,
      hawk: hawk ? {
        isActive: hawk.isActive,
        expression: hawk.currentExpression,
        mood: hawk.mood
      } : null
    };
  }

  /**
   * Update Hawk's expression
   */
  private static async updateHawkExpression(
    characterId: mongoose.Types.ObjectId,
    expression: HawkExpression
  ): Promise<void> {
    const hawk = await HawkCompanion.findByCharacterId(characterId);
    if (hawk && hawk.isActive) {
      hawk.currentExpression = expression;
      hawk.lastInteractionAt = new Date();
      await hawk.save();
    }
  }

  /**
   * Emit tutorial update via socket
   */
  private static emitTutorialUpdate(
    characterId: string,
    event: string,
    data: Record<string, unknown>
  ): void {
    try {
      broadcastToUser(characterId, event, data);
    } catch (error) {
      // Socket emission is non-critical
      logger.debug('Failed to emit tutorial update', {
        characterId,
        event,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Check if tutorial is active for character
   */
  static async isTutorialActive(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) return false;

    return progress.currentPhase !== TutorialPhase.COMPLETED &&
           progress.currentPhase !== TutorialPhase.SKIPPED;
  }

  /**
   * Get current phase for character
   */
  static async getCurrentPhase(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<TutorialPhase> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    return progress?.currentPhase || TutorialPhase.NOT_STARTED;
  }
}
