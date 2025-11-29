/**
 * Cosmic Ending Service
 *
 * Handles the resolution of the What-Waits-Below questline
 * and the four possible endings
 */

import {
  CosmicEnding,
  EndingOutcome,
  CosmicProgress,
  CosmicReward,
  WorldEffect
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { AppError } from '../utils/errors';
import { CosmicQuestService } from './cosmicQuest.service';
import { ENDING_EPILOGUES } from '../data/cosmicQuests/act4';
import { COSMIC_ARTIFACTS, COSMIC_POWERS } from '../data/cosmicLore';

export class CosmicEndingService {
  /**
   * Trigger the Banishment ending
   */
  static async triggerBanishment(characterId: string): Promise<EndingOutcome> {
    const progress = await CosmicQuestService.getCosmicProgress(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_banishment_seals_renewed',
        type: 'environmental',
        description: 'The three seals are renewed with Guardian blood. What-Waits-Below sinks into deep slumber once more.',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_banishment_coalition_honored',
        type: 'faction_war',
        description: 'The Coalition honors you as the greatest Guardian of this age',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_banishment_scar_stabilized',
        type: 'environmental',
        description: 'The Scar stabilizes. Corruption recedes. The area becomes safer.',
        affectedArea: 'the_scar',
        isPermanent: true
      }
    ];

    // Purge corruption through the ritual
    if (progress.corruption.level > 0) {
      await CosmicQuestService.addCorruption(characterId, -progress.corruption.level, 'Banishment Ritual');
    }

    const outcome: EndingOutcome = {
      ending: CosmicEnding.BANISHMENT,
      characterId,
      finalCorruption: 0,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_cosmic_chief',
        'npc_cosmic_shaman',
        'coalition_guardians'
      ],
      alliesLost: [
        'npc_cosmic_ezekiel',
        'cult_of_the_deep'
      ],
      artifactsObtained: ['artifact_guardian_legacy'],
      powersGained: [],
      worldChanges,
      epilogue: ENDING_EPILOGUES[CosmicEnding.BANISHMENT],
      achievedAt: new Date()
    };

    // Mark progress as completed
    progress.completedAt = new Date();
    progress.endingPath = CosmicEnding.BANISHMENT;

    return outcome;
  }

  /**
   * Trigger the Destruction ending
   */
  static async triggerDestruction(characterId: string): Promise<EndingOutcome> {
    const progress = await CosmicQuestService.getCosmicProgress(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_destruction_entity_destroyed',
        type: 'environmental',
        description: 'What-Waits-Below is torn from existence in a cataclysmic working of magic',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_destruction_scar_wasteland',
        type: 'environmental',
        description: 'The Scar becomes a lifeless but safe wasteland. No corruption remains.',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_destruction_dimensional_scar',
        type: 'environmental',
        description: 'A permanent scar in reality marks where a cosmic entity was destroyed',
        affectedArea: 'the_scar',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: CosmicEnding.DESTRUCTION,
      characterId,
      finalCorruption: progress.corruption.level,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_cosmic_holloway',
        'military_forces',
        'npc_cosmic_blackwood'
      ],
      alliesLost: [
        'npc_cosmic_survivor', // Died in ritual
        'npc_cosmic_delgado', // Died in ritual
        'npc_cosmic_mcgraw'   // Died in ritual
      ],
      artifactsObtained: ['artifact_slayers_mark'],
      powersGained: [],
      worldChanges,
      epilogue: ENDING_EPILOGUES[CosmicEnding.DESTRUCTION],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = CosmicEnding.DESTRUCTION;

    return outcome;
  }

  /**
   * Trigger the Bargain ending
   */
  static async triggerBargain(characterId: string): Promise<EndingOutcome> {
    const progress = await CosmicQuestService.getCosmicProgress(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_bargain_partial_freedom',
        type: 'environmental',
        description: 'What-Waits-Below is partially freed but bound by cosmic oath',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_bargain_reality_shift',
        type: 'environmental',
        description: 'Reality begins to shift in subtle ways. Dreams become more vivid. Creativity flourishes.',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_bargain_herald_status',
        type: 'npc_appearance',
        description: 'You are recognized as the Herald - bridge between humanity and the entity',
        affectedArea: 'all',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: CosmicEnding.BARGAIN,
      characterId,
      finalCorruption: progress.corruption.level,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_cosmic_voice',
        'entity_itself'
      ],
      alliesLost: [], // No one dies, but no one fully trusts you
      artifactsObtained: ['artifact_covenant_stone'],
      powersGained: ['power_herald_authority'],
      worldChanges,
      epilogue: ENDING_EPILOGUES[CosmicEnding.BARGAIN],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = CosmicEnding.BARGAIN;

    return outcome;
  }

  /**
   * Trigger the Awakening ending
   */
  static async triggerAwakening(characterId: string): Promise<EndingOutcome> {
    const progress = await CosmicQuestService.getCosmicProgress(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_awakening_seals_broken',
        type: 'environmental',
        description: 'The three seals shatter. What-Waits-Below rises fully awake.',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_awakening_reality_transformed',
        type: 'environmental',
        description: 'Reality transforms according to the entity\'s will. The world is remade.',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_awakening_temple_city',
        type: 'location_change',
        description: 'The Scar becomes a temple city of impossible architecture',
        affectedArea: 'the_scar',
        isPermanent: true
      },
      {
        id: 'effect_awakening_humanity_elevated',
        type: 'environmental',
        description: 'Humanity is offered transcendence. Many accept. Many resist.',
        affectedArea: 'all',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: CosmicEnding.AWAKENING,
      characterId,
      finalCorruption: 100, // Full transformation
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_cosmic_ezekiel',
        'cult_of_the_deep',
        'entity_itself',
        'transformed_humanity'
      ],
      alliesLost: [
        'npc_cosmic_chief',
        'coalition_guardians',
        'npc_cosmic_holloway',
        'resisters'
      ],
      artifactsObtained: ['artifact_dreamers_crown'],
      powersGained: ['power_transformed_one'],
      worldChanges,
      epilogue: ENDING_EPILOGUES[CosmicEnding.AWAKENING],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = CosmicEnding.AWAKENING;

    return outcome;
  }

  /**
   * Determine which ending the player is heading toward based on choices
   */
  static async predictEnding(characterId: string): Promise<{
    likelyEnding: CosmicEnding;
    confidence: number;
    factors: string[];
  }> {
    const progress = await CosmicQuestService.getCosmicProgress(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    const factors: string[] = [];
    const scores = {
      [CosmicEnding.BANISHMENT]: 0,
      [CosmicEnding.DESTRUCTION]: 0,
      [CosmicEnding.BARGAIN]: 0,
      [CosmicEnding.AWAKENING]: 0
    };

    // Corruption level is a major factor
    if (progress.corruption.level < 20) {
      scores[CosmicEnding.BANISHMENT] += 3;
      scores[CosmicEnding.DESTRUCTION] += 2;
      factors.push('Low corruption suggests resistance to entity influence');
    } else if (progress.corruption.level < 40) {
      scores[CosmicEnding.BANISHMENT] += 2;
      scores[CosmicEnding.DESTRUCTION] += 2;
      scores[CosmicEnding.BARGAIN] += 1;
      factors.push('Moderate corruption suggests openness to compromise');
    } else if (progress.corruption.level < 60) {
      scores[CosmicEnding.BARGAIN] += 3;
      scores[CosmicEnding.AWAKENING] += 1;
      factors.push('High corruption suggests significant entity influence');
    } else {
      scores[CosmicEnding.AWAKENING] += 3;
      scores[CosmicEnding.BARGAIN] += 1;
      factors.push('Very high corruption suggests embracing transformation');
    }

    // Major choices
    for (const choice of progress.majorChoices) {
      if (choice.choiceId.includes('resist') || choice.choiceId.includes('flee')) {
        scores[CosmicEnding.BANISHMENT] += 1;
        scores[CosmicEnding.DESTRUCTION] += 1;
      }
      if (choice.choiceId.includes('embrace') || choice.choiceId.includes('listen')) {
        scores[CosmicEnding.AWAKENING] += 1;
        scores[CosmicEnding.BARGAIN] += 1;
      }
    }

    // NPC relationships
    const coalitionRelation = progress.npcRelationships.find(r => r.npcId === 'npc_cosmic_chief');
    const cultRelation = progress.npcRelationships.find(r => r.npcId === 'npc_cosmic_ezekiel');

    if (coalitionRelation && coalitionRelation.relationship > 50) {
      scores[CosmicEnding.BANISHMENT] += 2;
      factors.push('Strong Coalition relationship');
    }

    if (cultRelation && cultRelation.relationship > 50) {
      scores[CosmicEnding.AWAKENING] += 2;
      factors.push('Strong Cult relationship');
    }

    // Explicit ending path choice
    if (progress.endingPath) {
      scores[progress.endingPath] += 5;
      factors.push(`Explicit choice toward ${progress.endingPath}`);
    }

    // Find highest score
    let likelyEnding = CosmicEnding.BARGAIN; // Default
    let maxScore = 0;

    for (const [ending, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        likelyEnding = ending as CosmicEnding;
      }
    }

    // Calculate confidence (0-100)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.round((maxScore / totalScore) * 100) : 0;

    return {
      likelyEnding,
      confidence,
      factors
    };
  }

  /**
   * Get rewards for a specific ending
   */
  static getEndingRewards(ending: CosmicEnding): CosmicReward[] {
    const baseRewards: CosmicReward[] = [
      {
        type: 'xp',
        amount: 10000
      },
      {
        type: 'gold',
        amount: 5000
      }
    ];

    switch (ending) {
      case CosmicEnding.BANISHMENT:
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_guardian_legacy'
          },
          {
            type: 'reputation',
            faction: 'nahiCoalition' as any,
            amount: 200
          }
        ];

      case CosmicEnding.DESTRUCTION:
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_slayers_mark'
          }
        ];

      case CosmicEnding.BARGAIN:
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_covenant_stone'
          },
          {
            type: 'power',
            powerId: 'power_herald_authority'
          }
        ];

      case CosmicEnding.AWAKENING:
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_dreamers_crown'
          },
          {
            type: 'power',
            powerId: 'power_transformed_one'
          }
        ];

      default:
        return baseRewards;
    }
  }
}
