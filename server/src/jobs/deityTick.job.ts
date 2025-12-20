/**
 * Deity Tick Job
 *
 * Main background job that runs every 10 minutes to process deity AI decisions.
 * Evaluates watched characters for potential divine interventions:
 * - Dreams (during rest)
 * - Stranger encounters (at locations)
 * - Omens (environmental signs)
 * - Whispers (subtle messages)
 *
 * Also updates deity mood based on world state.
 */

import mongoose from 'mongoose';
import { DeityAttention, DeityName } from '../models/DeityAttention.model';
import { DeityAgent, IDeityAgent } from '../models/DeityAgent.model';
import { CharacterKarma, ICharacterKarma } from '../models/CharacterKarma.model';
import { DivineManifestation, IDivineManifestation, ManifestationType } from '../models/DivineManifestation.model';
import { Character } from '../models/Character.model';
import deityDecisionService from '../services/deityDecision.service';
import deityDialogueService from '../services/deityDialogue.service';
import logger from '../utils/logger';

/**
 * Result interface for tick processing
 */
export interface DeityTickResult {
  evaluated: number;
  interventions: number;
  byDeity: {
    GAMBLER: number;
    OUTLAW_KING: number;
  };
  moodUpdates: {
    gamblerMood: string;
    outlawKingMood: string;
  };
  duration: number;
}

/**
 * Maximum characters to evaluate per tick
 * Prevents overwhelming the system with too many evaluations
 */
const MAX_EVALUATIONS_PER_TICK = 100;

/**
 * Base intervention chance per tick (modified by attention)
 */
const BASE_INTERVENTION_CHANCE = 0.05; // 5%

/**
 * Process the deity tick - main entry point
 */
export async function processDeityTick(): Promise<DeityTickResult> {
  const startTime = Date.now();
  let totalEvaluated = 0;
  let totalInterventions = 0;
  const byDeity = { GAMBLER: 0, OUTLAW_KING: 0 };

  try {
    // Get both deities
    const gamblerAgent = await DeityAgent.findOne({ name: 'The Gambler' });
    const outlawKingAgent = await DeityAgent.findOne({ name: 'The Outlaw King' });

    if (!gamblerAgent || !outlawKingAgent) {
      logger.warn('Deity agents not found - deity tick skipped');
      return {
        evaluated: 0,
        interventions: 0,
        byDeity,
        moodUpdates: { gamblerMood: 'N/A', outlawKingMood: 'N/A' },
        duration: Date.now() - startTime
      };
    }

    // Process each deity
    for (const deity of [gamblerAgent, outlawKingAgent]) {
      const deityName: DeityName = deity.name === 'The Gambler' ? 'GAMBLER' : 'OUTLAW_KING';

      // Get top watched characters
      const watchedAttentions = await DeityAttention.findTopWatched(deityName, MAX_EVALUATIONS_PER_TICK / 2);

      for (const attention of watchedAttentions) {
        totalEvaluated++;

        try {
          // Get karma record
          const karma = await CharacterKarma.findByCharacterId(attention.characterId);
          if (!karma) continue;

          // Update attention values
          attention.attention = await deityDecisionService.calculateAttention(karma, deityName);
          attention.interest = await deityDecisionService.calculateInterest(karma, attention.characterId, deityName);
          await deityDecisionService.updateAttentionTriggers(attention, karma, attention.characterId);

          // Check if deity phase allows intervention
          if (deity.currentPhase === 'DORMANT') continue;

          // Evaluate for intervention
          const interventionType = await deityDecisionService.evaluateIntervention(attention, deity, karma);

          if (interventionType) {
            const manifestation = await generateManifestation(
              attention.characterId,
              deityName,
              interventionType,
              karma,
              deity
            );

            if (manifestation) {
              totalInterventions++;
              byDeity[deityName]++;

              // Record the intervention
              attention.recordIntervention(interventionType);
              deity.recordManifestation(interventionType.toLowerCase());
            }
          }

          // Update tracking
          attention.lastEvaluatedAt = new Date();
          await attention.save();
        } catch (error) {
          logger.error(`Error processing attention for character ${attention.characterId}:`, error);
        }
      }

      // Also process characters with significant karma but no attention record yet
      const untracked = await findUntrackedHighKarmaCharacters(deityName, 20);
      for (const karma of untracked) {
        totalEvaluated++;

        try {
          // Create attention record
          const attention = await DeityAttention.getOrCreate(karma.characterId, deityName);
          attention.attention = await deityDecisionService.calculateAttention(karma, deityName);
          attention.interest = await deityDecisionService.calculateInterest(karma, karma.characterId, deityName);
          await deityDecisionService.updateAttentionTriggers(attention, karma, karma.characterId);
          attention.lastEvaluatedAt = new Date();
          await attention.save();
        } catch (error) {
          logger.error(`Error creating attention for character ${karma.characterId}:`, error);
        }
      }

      // Save deity changes
      await deity.save();
    }

    // Update deity moods based on world state
    await deityDecisionService.updateDeityMood(gamblerAgent);
    await deityDecisionService.updateDeityMood(outlawKingAgent);

    const duration = Date.now() - startTime;

    logger.info(`Deity tick completed in ${duration}ms`, {
      evaluated: totalEvaluated,
      interventions: totalInterventions,
      byDeity,
      gamblerMood: gamblerAgent.mood,
      outlawKingMood: outlawKingAgent.mood
    });

    return {
      evaluated: totalEvaluated,
      interventions: totalInterventions,
      byDeity,
      moodUpdates: {
        gamblerMood: gamblerAgent.mood,
        outlawKingMood: outlawKingAgent.mood
      },
      duration
    };
  } catch (error) {
    logger.error('Error in deity tick:', error);
    throw error;
  }
}

/**
 * Find characters with high karma values but no attention record
 */
async function findUntrackedHighKarmaCharacters(
  deityName: DeityName,
  limit: number
): Promise<ICharacterKarma[]> {
  // Find karma records with significant affinity
  const affinityField = deityName === 'GAMBLER' ? 'gamblerAffinity' : 'outlawKingAffinity';

  const karmaRecords = await CharacterKarma.find({
    $or: [
      { [affinityField]: { $gte: 25 } },
      { [affinityField]: { $lte: -25 } },
      { totalActions: { $gte: 100 } }
    ]
  }).limit(limit * 2);

  if (karmaRecords.length === 0) {
    return [];
  }

  // PERF-1 FIX: Batch query to find all tracked characters at once (eliminates N+1 problem)
  // Instead of querying attention records one-by-one, get all at once
  const characterIds = karmaRecords.map(k => k.characterId);
  const existingAttentions = await DeityAttention.find({
    characterId: { $in: characterIds },
    deityName
  }).select('characterId').lean();

  // Create a Set of tracked character IDs for O(1) lookup
  const trackedCharacterIds = new Set(
    existingAttentions.map(a => a.characterId.toString())
  );

  // Filter to those without attention records
  const untracked = karmaRecords.filter(
    karma => !trackedCharacterIds.has(karma.characterId.toString())
  );

  return untracked.slice(0, limit);
}

/**
 * Generate a divine manifestation based on intervention type
 */
async function generateManifestation(
  characterId: mongoose.Types.ObjectId,
  deityName: DeityName,
  interventionType: 'DREAM' | 'STRANGER' | 'OMEN' | 'WHISPER',
  karma: ICharacterKarma,
  deity: IDeityAgent
): Promise<IDivineManifestation | null> {
  try {
    const affinity = deityName === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
    const isPositive = affinity > 0;

    // Determine manifestation type and generate message
    let manifestationType: ManifestationType;
    let message: string;
    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let effect: Record<string, unknown> = {};

    switch (interventionType) {
      case 'WHISPER':
        manifestationType = 'WHISPER';
        message = deityDialogueService.generateMessage(deityName, 'WHISPER', {
          karma: karma.karma,
          affinity,
          isBlessing: false,
          isCurse: false
        });
        urgency = 'LOW';
        break;

      case 'OMEN':
        manifestationType = 'OMEN';
        const omenResult = generateOmenEffect(deityName, affinity);
        message = omenResult.description;
        effect = omenResult.effect;
        urgency = omenResult.isNeutral ? 'MEDIUM' : (isPositive ? 'MEDIUM' : 'HIGH');
        break;

      case 'STRANGER':
        manifestationType = 'STRANGER';
        message = deityDialogueService.generateMessage(deityName, 'STRANGER', {
          karma: karma.karma,
          affinity,
          isBlessing: isPositive,
          isCurse: !isPositive
        });
        urgency = 'MEDIUM';
        effect = {
          strangerType: deityName === 'GAMBLER' ? 'card_sharp' : 'grizzled_outlaw',
          interactionAvailable: true
        };
        break;

      case 'DREAM':
        manifestationType = 'DREAM';
        message = deityDialogueService.generateMessage(deityName, 'DREAM', {
          karma: karma.karma,
          affinity,
          isBlessing: isPositive,
          isCurse: !isPositive
        });
        urgency = 'LOW';
        effect = {
          dreamType: getDreamType(affinity, karma),
          sanityEffect: isPositive ? 1 : -1
        };
        break;

      default:
        return null;
    }

    // Apply mood modifier to effect
    const moodModifier = getMoodModifier(deity.mood, isPositive);
    if (effect && typeof effect === 'object') {
      effect.moodIntensity = moodModifier;
    }

    // Create and save manifestation
    const manifestation = new DivineManifestation({
      deityName,
      targetCharacterId: characterId,
      type: manifestationType,
      message,
      effect: JSON.stringify(effect),
      urgency,
      delivered: false,
      acknowledged: false
    });

    await manifestation.save();

    logger.debug(`Generated ${manifestationType} manifestation from ${deityName} for character ${characterId}`);

    return manifestation;
  } catch (error) {
    logger.error(`Error generating manifestation:`, error);
    return null;
  }
}

/**
 * Generate an omen effect based on deity and affinity
 */
function generateOmenEffect(deityName: DeityName, affinity: number): {
  description: string;
  effect: Record<string, unknown>;
  isNeutral: boolean;
} {
  const isPositive = affinity > 0;
  const isNeutral = Math.abs(affinity) < 15;

  if (deityName === 'GAMBLER') {
    if (isNeutral) {
      return {
        description: 'An Ace of Spades lies face-up in your path.',
        effect: { omen_type: 'fate_undecided', duration: 7200 },
        isNeutral: true
      };
    } else if (isPositive) {
      return {
        description: 'A four-leaf clover grows where you step.',
        effect: { luck_bonus: 5, duration: 3600 },
        isNeutral: false
      };
    } else {
      return {
        description: 'Dice fall from your pocket. Both show ones.',
        effect: { luck_penalty: -5, duration: 3600 },
        isNeutral: false
      };
    }
  } else {
    // Outlaw King
    if (isNeutral) {
      return {
        description: "The wind howls a name. It sounds like yours.",
        effect: { omen_type: 'confrontation_coming', duration: 7200 },
        isNeutral: true
      };
    } else if (isPositive) {
      return {
        description: 'A rusted chain breaks as you pass.',
        effect: { escape_bonus: 10, duration: 3600 },
        isNeutral: false
      };
    } else {
      return {
        description: 'A bird in a cage watches you with knowing eyes.',
        effect: { movement_penalty: -5, duration: 3600 },
        isNeutral: false
      };
    }
  }
}

/**
 * Get dream type based on affinity and karma trajectory
 */
function getDreamType(affinity: number, karma: ICharacterKarma): string {
  const isPositive = affinity > 0;

  // Get recent trajectory from karma actions
  const recentActions = karma.recentActions.slice(-10);
  const avgDelta = recentActions.reduce((sum, a) => sum + a.delta, 0) / (recentActions.length || 1);
  const isImproving = avgDelta > 0;

  if (isImproving && isPositive) return 'PROPHETIC';
  if (!isImproving && isPositive) return 'WARNING';
  if (isImproving && !isPositive) return 'VISION';
  if (!isImproving && !isPositive) return 'NIGHTMARE';
  return 'MEMORY';
}

/**
 * Get mood modifier for effect intensity
 */
function getMoodModifier(mood: string, isPositive: boolean): number {
  const modifiers: Record<string, { blessing: number; curse: number }> = {
    PLEASED: { blessing: 1.5, curse: 0.5 },
    AMUSED: { blessing: 1.2, curse: 0.8 },
    NEUTRAL: { blessing: 1.0, curse: 1.0 },
    DISPLEASED: { blessing: 0.8, curse: 1.2 },
    WRATHFUL: { blessing: 0.5, curse: 2.0 }
  };

  const mod = modifiers[mood] || modifiers.NEUTRAL;
  return isPositive ? mod.blessing : mod.curse;
}

/**
 * Clean up stale attention records
 * Run less frequently (daily)
 */
export async function cleanupStaleAttention(): Promise<{ deleted: number }> {
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

  // Delete attention records for inactive characters
  const result = await DeityAttention.deleteMany({
    lastEvaluatedAt: { $lt: cutoffDate },
    attention: { $lt: 10 } // Low attention = not interesting
  });

  logger.info(`Cleaned up ${result.deletedCount} stale attention records`);

  return { deleted: result.deletedCount };
}

export default {
  processDeityTick,
  cleanupStaleAttention
};
