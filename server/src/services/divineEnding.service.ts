/**
 * Divine Ending Service - Divine Struggle System
 *
 * Handles the resolution of The Eternal Struggle questline
 * and the four possible divine endings
 * Rebranded from Cosmic Ending Service (cosmic horror → angels & demons)
 */

import {
  CosmicEnding as DivineEnding,
  EndingOutcome,
  CosmicProgress as DivineProgress,
  CosmicReward as DivineReward,
  WorldEffect
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { AppError } from '../utils/errors';
import { DivinePathService } from './divinePath.service';
import { ENDING_EPILOGUES } from '../data/cosmicQuests/act4';
import { COSMIC_ARTIFACTS as SACRED_RELICS, COSMIC_POWERS as DIVINE_POWERS } from '../data/cosmicLore';

// Import original service for reference (use CosmicEndingService directly if you need the original)
import { CosmicEndingService as OriginalCosmicEndingService } from './cosmicEnding.service';
export const CosmicEndingServiceRef = OriginalCosmicEndingService;

export class DivineEndingService {
  /**
   * Trigger the Salvation ending (strengthening the seals against The Bound One)
   */
  static async triggerSalvation(characterId: string): Promise<EndingOutcome> {
    const progress = await DivinePathService.getDivineProgress(characterId);
    if (!progress) {
      throw new AppError('Divine path not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_salvation_seals_renewed',
        type: 'environmental',
        description: 'The three seals are renewed with holy blood. The Bound One sinks into deep slumber once more.',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_salvation_faithful_honored',
        type: 'faction_war',
        description: 'The Faithful honor you as the greatest Guardian of this age',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_salvation_rift_stabilized',
        type: 'environmental',
        description: 'The Rift stabilizes. Sin recedes. The area becomes sanctified.',
        affectedArea: 'the_rift',
        isPermanent: true
      }
    ];

    // Purge sin through the ritual
    if (progress.corruption.level > 0) {
      await DivinePathService.addSin(characterId, -progress.corruption.level, 'Salvation Ritual');
    }

    const outcome: EndingOutcome = {
      ending: DivineEnding.BANISHMENT, // BANISHMENT -> SALVATION
      characterId,
      finalCorruption: 0,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_divine_bishop',
        'npc_divine_prophet',
        'order_of_guardians'
      ],
      alliesLost: [
        'npc_divine_tempter',
        'cult_of_the_fallen'
      ],
      artifactsObtained: ['artifact_guardian_legacy'],
      powersGained: [],
      worldChanges,
      epilogue: ENDING_EPILOGUES[DivineEnding.BANISHMENT],
      achievedAt: new Date()
    };

    // Mark progress as completed
    progress.completedAt = new Date();
    progress.endingPath = DivineEnding.BANISHMENT;

    return outcome;
  }

  /**
   * Trigger the Purification ending (destroying the demonic entity)
   */
  static async triggerPurification(characterId: string): Promise<EndingOutcome> {
    const progress = await DivinePathService.getDivineProgress(characterId);
    if (!progress) {
      throw new AppError('Divine path not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_purification_entity_destroyed',
        type: 'environmental',
        description: 'The Bound One is torn from existence through divine sacrifice',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_purification_rift_wasteland',
        type: 'environmental',
        description: 'The Rift becomes hallowed but desolate ground. No sin remains.',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_purification_dimensional_scar',
        type: 'environmental',
        description: 'A permanent mark in reality shows where a great evil was banished',
        affectedArea: 'the_rift',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: DivineEnding.DESTRUCTION, // DESTRUCTION -> PURIFICATION
      characterId,
      finalCorruption: progress.corruption.level,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_divine_inquisitor',
        'angelic_forces',
        'npc_divine_crusader'
      ],
      alliesLost: [
        'npc_divine_martyr1', // Died in ritual
        'npc_divine_martyr2', // Died in ritual
        'npc_divine_martyr3'  // Died in ritual
      ],
      artifactsObtained: ['artifact_martyrs_flame'],
      powersGained: [],
      worldChanges,
      epilogue: ENDING_EPILOGUES[DivineEnding.DESTRUCTION],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = DivineEnding.DESTRUCTION;

    return outcome;
  }

  /**
   * Trigger the Covenant ending (making a pact with The Bound One)
   */
  static async triggerCovenant(characterId: string): Promise<EndingOutcome> {
    const progress = await DivinePathService.getDivineProgress(characterId);
    if (!progress) {
      throw new AppError('Divine path not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_covenant_partial_freedom',
        type: 'environmental',
        description: 'The Bound One is partially freed but restrained by infernal contract',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_covenant_reality_shift',
        type: 'environmental',
        description: 'Reality begins to shift in subtle ways. Prayers are answered differently. Power flows to those who bargain.',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_covenant_arbiter_status',
        type: 'npc_appearance',
        description: 'You are recognized as the Arbiter - broker between mortal and infernal',
        affectedArea: 'all',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: DivineEnding.BARGAIN, // BARGAIN -> COVENANT
      characterId,
      finalCorruption: progress.corruption.level,
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_divine_tempter',
        'the_bound_one'
      ],
      alliesLost: [], // No one dies, but no one fully trusts you
      artifactsObtained: ['artifact_covenant_stone'],
      powersGained: ['power_arbiter_authority'],
      worldChanges,
      epilogue: ENDING_EPILOGUES[DivineEnding.BARGAIN],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = DivineEnding.BARGAIN;

    return outcome;
  }

  /**
   * Trigger the Ascension ending (freeing The Bound One completely)
   */
  static async triggerAscension(characterId: string): Promise<EndingOutcome> {
    const progress = await DivinePathService.getDivineProgress(characterId);
    if (!progress) {
      throw new AppError('Divine path not started', 400);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Create world effects
    const worldChanges: WorldEffect[] = [
      {
        id: 'effect_ascension_seals_broken',
        type: 'environmental',
        description: 'The three seals shatter. The Bound One rises in full glory - or horror.',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_ascension_reality_transformed',
        type: 'environmental',
        description: 'Reality transforms according to infernal will. Heaven and Hell merge with Earth.',
        affectedArea: 'all',
        isPermanent: true
      },
      {
        id: 'effect_ascension_temple_city',
        type: 'location_change',
        description: 'The Rift becomes a temple of impossible architecture - cathedral and dungeon merged',
        affectedArea: 'the_rift',
        isPermanent: true
      },
      {
        id: 'effect_ascension_humanity_transformed',
        type: 'environmental',
        description: 'Humanity is offered transcendence through damnation. Many accept. Many resist.',
        affectedArea: 'all',
        isPermanent: true
      }
    ];

    const outcome: EndingOutcome = {
      ending: DivineEnding.AWAKENING, // AWAKENING -> ASCENSION
      characterId,
      finalCorruption: 100, // Full transformation
      choicesMade: progress.majorChoices.map(c => c.choiceId),
      alliesGained: [
        'npc_divine_tempter',
        'cult_of_the_fallen',
        'the_bound_one',
        'damned_humanity'
      ],
      alliesLost: [
        'npc_divine_bishop',
        'order_of_guardians',
        'npc_divine_inquisitor',
        'the_faithful'
      ],
      artifactsObtained: ['artifact_crown_of_thorns'],
      powersGained: ['power_transformed_one'],
      worldChanges,
      epilogue: ENDING_EPILOGUES[DivineEnding.AWAKENING],
      achievedAt: new Date()
    };

    progress.completedAt = new Date();
    progress.endingPath = DivineEnding.AWAKENING;

    return outcome;
  }

  /**
   * Determine which ending the player is heading toward based on choices
   */
  static async predictEnding(characterId: string): Promise<{
    likelyEnding: DivineEnding;
    confidence: number;
    factors: string[];
  }> {
    const progress = await DivinePathService.getDivineProgress(characterId);
    if (!progress) {
      throw new AppError('Divine path not started', 400);
    }

    const factors: string[] = [];
    const scores = {
      [DivineEnding.BANISHMENT]: 0, // Salvation
      [DivineEnding.DESTRUCTION]: 0, // Purification
      [DivineEnding.BARGAIN]: 0, // Covenant
      [DivineEnding.AWAKENING]: 0 // Ascension
    };

    // Sin level is a major factor
    if (progress.corruption.level < 20) {
      scores[DivineEnding.BANISHMENT] += 3;
      scores[DivineEnding.DESTRUCTION] += 2;
      factors.push('Low sin suggests resistance to demonic influence');
    } else if (progress.corruption.level < 40) {
      scores[DivineEnding.BANISHMENT] += 2;
      scores[DivineEnding.DESTRUCTION] += 2;
      scores[DivineEnding.BARGAIN] += 1;
      factors.push('Moderate sin suggests openness to compromise');
    } else if (progress.corruption.level < 60) {
      scores[DivineEnding.BARGAIN] += 3;
      scores[DivineEnding.AWAKENING] += 1;
      factors.push('High sin suggests significant demonic influence');
    } else {
      scores[DivineEnding.AWAKENING] += 3;
      scores[DivineEnding.BARGAIN] += 1;
      factors.push('Very high sin suggests embracing damnation');
    }

    // Major choices
    for (const choice of progress.majorChoices) {
      if (choice.choiceId.includes('resist') || choice.choiceId.includes('pray')) {
        scores[DivineEnding.BANISHMENT] += 1;
        scores[DivineEnding.DESTRUCTION] += 1;
      }
      if (choice.choiceId.includes('embrace') || choice.choiceId.includes('bargain')) {
        scores[DivineEnding.AWAKENING] += 1;
        scores[DivineEnding.BARGAIN] += 1;
      }
    }

    // NPC relationships
    const faithfulRelation = progress.npcRelationships.find(r => r.npcId === 'npc_divine_bishop');
    const cultRelation = progress.npcRelationships.find(r => r.npcId === 'npc_divine_tempter');

    if (faithfulRelation && faithfulRelation.disposition > 50) {
      scores[DivineEnding.BANISHMENT] += 2;
      factors.push('Strong Faithful relationship');
    }

    if (cultRelation && cultRelation.disposition > 50) {
      scores[DivineEnding.AWAKENING] += 2;
      factors.push('Strong Cult relationship');
    }

    // Explicit ending path choice
    if (progress.endingPath) {
      scores[progress.endingPath] += 5;
      factors.push(`Explicit choice toward ${progress.endingPath}`);
    }

    // Find highest score
    let likelyEnding = DivineEnding.BARGAIN; // Default - the middle path
    let maxScore = 0;

    for (const [ending, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        likelyEnding = ending as DivineEnding;
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
  static getEndingRewards(ending: DivineEnding): DivineReward[] {
    const baseRewards: DivineReward[] = [
      {
        type: 'xp',
        amount: 10000
      },
      {
        type: 'dollars',
        amount: 5000
      }
    ];

    switch (ending) {
      case DivineEnding.BANISHMENT: // Salvation
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_guardian_legacy'
          },
          {
            type: 'reputation',
            faction: 'theFaithful' as any,
            amount: 200
          }
        ];

      case DivineEnding.DESTRUCTION: // Purification
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_martyrs_flame'
          }
        ];

      case DivineEnding.BARGAIN: // Covenant
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_covenant_stone'
          },
          {
            type: 'power',
            powerId: 'power_arbiter_authority'
          }
        ];

      case DivineEnding.AWAKENING: // Ascension
        return [
          ...baseRewards,
          {
            type: 'artifact',
            artifactId: 'artifact_crown_of_thorns'
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

// Backwards compatibility alias
export const CosmicEndingService = DivineEndingService;
