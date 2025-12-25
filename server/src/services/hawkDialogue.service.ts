/**
 * Hawk Dialogue Service
 *
 * Contextual dialogue generation for Hawk mentor companion
 * Handles dialogue triggers, tips, and state-based responses
 */

import mongoose from 'mongoose';
import {
  HawkCompanion,
  IHawkCompanion,
  HawkExpression,
  HawkMood,
  HawkTopic,
  calculateMoodFromMetrics
} from '../models/HawkCompanion.model';
import { TutorialProgress, TutorialPhase } from '../models/TutorialProgress.model';
import { Character } from '../models/Character.model';
import {
  DialogueTrigger,
  HawkDialogueEntry,
  getPhaseDialogue,
  getStepDialogue,
  getContextualTip,
  CONTEXTUAL_TIPS
} from '../data/hawkDialogue';
import logger from '../utils/logger';
import { broadcastToUser } from '../config/socket';

/**
 * Dialogue request from game systems
 */
export interface IHawkDialogueRequest {
  trigger: DialogueTrigger;
  context?: {
    phase?: TutorialPhase;
    step?: number;
    mechanic?: string;
    failCount?: number;
    location?: string;
    time?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

/**
 * Dialogue response
 */
export interface IHawkDialogueResponse {
  text: string;
  expression: HawkExpression;
  voiceHint?: string;
  duration: number;
  hasChoice?: boolean;
  choices?: Array<{
    id: string;
    text: string;
  }>;
}

/**
 * Tip context for contextual tip selection
 */
export interface ITipContext {
  energy?: number;
  maxEnergy?: number;
  health?: number;
  maxHealth?: number;
  recentCombatLosses?: number;
  consecutiveWins?: number;
  wantedLevel?: number;
  isNight?: boolean;
  isFirstTime?: boolean;
  featureLocked?: boolean;
  inventoryFull?: boolean;
  leveledUp?: boolean;
  isReturning?: boolean;
}

/**
 * Tip response
 */
export interface IContextualTipResponse {
  tipId: string;
  text: string;
  expression: HawkExpression;
  priority: 'low' | 'medium' | 'high';
  dismissable: boolean;
}

/**
 * Hawk Dialogue Service
 */
export class HawkDialogueService {
  /**
   * Get contextual dialogue for current situation
   */
  static async getDialogue(
    characterId: string | mongoose.Types.ObjectId,
    request: IHawkDialogueRequest
  ): Promise<IHawkDialogueResponse | null> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk || !hawk.isActive) {
      return null;
    }

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      return null;
    }

    // Get phase dialogue
    const phaseDialogue = getPhaseDialogue(progress.currentPhase);
    if (!phaseDialogue) {
      return null;
    }

    let dialogueEntry: HawkDialogueEntry | undefined;

    switch (request.trigger) {
      case DialogueTrigger.PHASE_START:
        dialogueEntry = phaseDialogue.intro;
        break;

      case DialogueTrigger.PHASE_COMPLETE:
        dialogueEntry = phaseDialogue.complete;
        break;

      case DialogueTrigger.STEP_COMPLETE:
        const step = request.context?.step ?? progress.currentStep;
        const stepDialogue = getStepDialogue(progress.currentPhase, step);
        if (stepDialogue) {
          dialogueEntry = {
            text: stepDialogue.text,
            expression: stepDialogue.expression,
            duration: 5000
          };
        }
        break;

      case DialogueTrigger.COMBAT_LOSS:
        dialogueEntry = phaseDialogue.contextual?.combat_loss ||
          CONTEXTUAL_TIPS['combat_struggling'];
        break;

      case DialogueTrigger.COMBAT_WIN:
        dialogueEntry = phaseDialogue.contextual?.combat_win;
        break;

      case DialogueTrigger.LOW_ENERGY:
        dialogueEntry = phaseDialogue.contextual?.energy_low ||
          CONTEXTUAL_TIPS['energy_low'];
        break;

      case DialogueTrigger.LOW_HEALTH:
        dialogueEntry = CONTEXTUAL_TIPS['health_low'];
        break;

      case DialogueTrigger.LEVEL_UP:
        dialogueEntry = CONTEXTUAL_TIPS['level_up'];
        break;

      case DialogueTrigger.RETURNING:
        dialogueEntry = CONTEXTUAL_TIPS['returning_player'];
        break;

      case DialogueTrigger.IDLE:
        dialogueEntry = phaseDialogue.contextual?.idle ||
          CONTEXTUAL_TIPS['idle_reminder'];
        break;

      default:
        // Check contextual dialogues for the phase
        if (request.trigger && phaseDialogue.contextual) {
          dialogueEntry = phaseDialogue.contextual[request.trigger];
        }
        break;
    }

    if (!dialogueEntry) {
      return null;
    }

    // Update Hawk state
    hawk.currentExpression = dialogueEntry.expression;
    hawk.lastInteractionAt = new Date();
    hawk.interactionCount += 1;

    // Track dialogue viewed
    const dialogueId = `${progress.currentPhase}_${request.trigger}`;
    if (!hawk.dialoguesViewed.includes(dialogueId)) {
      hawk.dialoguesViewed.push(dialogueId);
    }

    await hawk.save();

    return {
      text: dialogueEntry.text,
      expression: dialogueEntry.expression,
      voiceHint: dialogueEntry.voiceHint,
      duration: dialogueEntry.duration || 5000,
      hasChoice: false
    };
  }

  /**
   * Get contextual tip based on game state
   */
  static async getContextualTip(
    characterId: string | mongoose.Types.ObjectId,
    context: ITipContext
  ): Promise<IContextualTipResponse | null> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk || !hawk.isActive) {
      return null;
    }

    // Prioritize tips based on context
    let tipId: string | null = null;
    let priority: 'low' | 'medium' | 'high' = 'low';

    // High priority checks
    if (context.energy !== undefined && context.maxEnergy !== undefined) {
      const energyRatio = context.energy / context.maxEnergy;
      if (energyRatio <= 0.1) {
        tipId = 'energy_critical';
        priority = 'high';
      } else if (energyRatio <= 0.25) {
        tipId = 'energy_low';
        priority = 'high';
      }
    }

    if (context.health !== undefined && context.maxHealth !== undefined) {
      const healthRatio = context.health / context.maxHealth;
      if (healthRatio <= 0.25 && !tipId) {
        tipId = 'health_low';
        priority = 'high';
      }
    }

    // Medium priority checks
    if (!tipId && context.recentCombatLosses && context.recentCombatLosses >= 3) {
      tipId = 'combat_streak_loss';
      priority = 'medium';
    }

    if (!tipId && context.wantedLevel && context.wantedLevel >= 4) {
      tipId = 'wanted_level_high';
      priority = 'medium';
    }

    if (!tipId && context.leveledUp) {
      tipId = 'level_up';
      priority = 'medium';
    }

    // Low priority checks
    if (!tipId && context.isNight) {
      tipId = 'night_warning';
      priority = 'low';
    }

    if (!tipId && context.inventoryFull) {
      tipId = 'inventory_full';
      priority = 'low';
    }

    if (!tipId && context.featureLocked) {
      tipId = 'locked_feature';
      priority = 'low';
    }

    if (!tipId && context.isReturning) {
      tipId = 'returning_player';
      priority = 'low';
    }

    if (!tipId) {
      return null;
    }

    // Check if tip was already shown
    const shouldShow = await this.shouldShowTip(charId, tipId);
    if (!shouldShow) {
      return null;
    }

    const tipEntry = getContextualTip(tipId);
    if (!tipEntry) {
      return null;
    }

    return {
      tipId,
      text: tipEntry.text,
      expression: tipEntry.expression,
      priority,
      dismissable: priority !== 'high'
    };
  }

  /**
   * Check if tip should be shown (not shown recently)
   */
  static async shouldShowTip(
    characterId: string | mongoose.Types.ObjectId,
    tipId: string
  ): Promise<boolean> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk) {
      return false;
    }

    // Allow repeat of important tips after cooldown
    const highPriorityTips = ['energy_critical', 'health_low', 'energy_low'];
    const tipShownRecently = hawk.tipsShown.includes(tipId);

    // High priority tips can repeat
    if (highPriorityTips.includes(tipId)) {
      return true;
    }

    // Other tips only show once
    return !tipShownRecently;
  }

  /**
   * Mark tip as shown
   */
  static async markTipShown(
    characterId: string | mongoose.Types.ObjectId,
    tipId: string
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk) {
      return;
    }

    if (!hawk.tipsShown.includes(tipId)) {
      hawk.tipsShown.push(tipId);
      await hawk.save();
    }
  }

  /**
   * Update Hawk mood based on player performance
   */
  static async updateMoodFromMetrics(
    characterId: string | mongoose.Types.ObjectId,
    metrics: {
      recentCombatLosses?: number;
      lowEnergy?: boolean;
      isNearGraduation?: boolean;
      consecutiveWins?: number;
    }
  ): Promise<HawkMood> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk) {
      return HawkMood.FRIENDLY;
    }

    const newMood = calculateMoodFromMetrics(metrics);
    hawk.mood = newMood;
    await hawk.save();

    return newMood;
  }

  /**
   * Record topic of interest for player
   */
  static async recordTopicInterest(
    characterId: string | mongoose.Types.ObjectId,
    topic: HawkTopic
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (!hawk) {
      return;
    }

    // Add topic if not already tracked
    if (!hawk.favoriteTopics.includes(topic)) {
      hawk.favoriteTopics.push(topic);
      // Keep only top 5 topics
      if (hawk.favoriteTopics.length > 5) {
        hawk.favoriteTopics = hawk.favoriteTopics.slice(-5);
      }
      await hawk.save();
    }
  }

  /**
   * Emit Hawk dialogue via socket
   */
  static async emitHawkDialogue(
    characterId: string,
    dialogue: IHawkDialogueResponse
  ): Promise<void> {
    try {
      broadcastToUser(characterId, 'tutorial:hawk_dialogue', dialogue);
    } catch (error) {
      logger.debug('Failed to emit Hawk dialogue', {
        characterId,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Trigger dialogue and emit via socket
   */
  static async triggerDialogue(
    characterId: string | mongoose.Types.ObjectId,
    trigger: DialogueTrigger,
    context?: IHawkDialogueRequest['context']
  ): Promise<IHawkDialogueResponse | null> {
    const charId = typeof characterId === 'string'
      ? characterId
      : characterId.toString();

    const dialogue = await this.getDialogue(characterId, { trigger, context });

    if (dialogue) {
      await this.emitHawkDialogue(charId, dialogue);
    }

    return dialogue;
  }

  /**
   * Get all tips for a character
   */
  static async getShownTips(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<string[]> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    return hawk?.tipsShown || [];
  }

  /**
   * Reset shown tips (for testing or special cases)
   */
  static async resetShownTips(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const hawk = await HawkCompanion.findByCharacterId(charId);
    if (hawk) {
      hawk.tipsShown = [];
      await hawk.save();
    }
  }
}
