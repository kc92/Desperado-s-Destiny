/**
 * Reality Distortion Service - Phase 14, Wave 14.1
 *
 * Manages reality distortions, spatial shifts, and cosmic anomalies in The Scar
 */

import {
  RealityDistortion,
  DistortionType,
  CorruptionLevel,
  COSMIC_HORROR_CONSTANTS
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { CorruptionService } from './corruption.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

/**
 * Active distortions (in-memory, could be database)
 */
const activeDistortions = new Map<string, {
  distortion: RealityDistortion;
  affectedCharacters: Set<string>;
  startedAt: Date;
  expiresAt?: Date;
}>();

/**
 * Track pending distortion cleanup timeouts to prevent timer leaks in tests
 */
const pendingDistortionCleanups = new Map<string, NodeJS.Timeout>();

/**
 * Reality distortion definitions
 */
const REALITY_DISTORTIONS: RealityDistortion[] = [
  {
    id: 'spatial_shift',
    type: DistortionType.SPATIAL_SHIFT,
    name: 'Spatial Shift',
    description: 'Space twists. Distances become meaningless. Paths lead to different places.',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TOUCHED,
    chance: 0.15,
    effect: {
      description: 'Your location suddenly changes',
      mechanicalEffect: { randomTeleport: true, range: '100-500 yards' },
      duration: 1
    },
    severity: 4,
    sanityLoss: 5,
    resistible: true,
    resistCheck: { stat: 'spirit', difficulty: 12 }
  },

  {
    id: 'time_dilation',
    type: DistortionType.TIME_DILATION,
    name: 'Time Dilation',
    description: 'Time becomes elastic. Moments stretch. Hours compress. Your watch spins wildly.',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TAINTED,
    chance: 0.1,
    effect: {
      description: 'Time passes at different rates',
      mechanicalEffect: { timeMultiplier: 'random 0.5-2.0' },
      duration: 30
    },
    severity: 6,
    sanityLoss: 10,
    resistible: false
  },

  {
    id: 'probability_flux',
    type: DistortionType.PROBABILITY_FLUX,
    name: 'Probability Flux',
    description: 'Cause and effect divorce. The impossible becomes probable. The certain becomes doubtful.',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TAINTED,
    chance: 0.12,
    effect: {
      description: 'Random outcomes defy expectation',
      mechanicalEffect: { criticalChanceChange: '+20%', failureChanceChange: '+20%' },
      duration: 15
    },
    severity: 5,
    sanityLoss: 8,
    resistible: false
  },

  {
    id: 'memory_corruption',
    type: DistortionType.MEMORY_CORRUPTION,
    name: 'Memory Corruption',
    description: 'You forget something important. Or do you remember something that never happened?',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TOUCHED,
    chance: 0.08,
    effect: {
      description: 'Memories alter or vanish',
      mechanicalEffect: { forgetQuestObjective: 0.3, falseMemory: 0.3 },
      duration: 60
    },
    severity: 7,
    sanityLoss: 12,
    resistible: true,
    resistCheck: { stat: 'cunning', difficulty: 15 }
  },

  {
    id: 'duplicate_entity',
    type: DistortionType.DUPLICATE_ENTITY,
    name: 'Entity Duplication',
    description: 'You see someone. Then you see them again. Both are real. Both are here. Which one is which?',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TAINTED,
    chance: 0.1,
    effect: {
      description: 'NPCs or items appear duplicated',
      mechanicalEffect: { npcDuplicate: true, confusionPenalty: -10 },
      duration: 20
    },
    severity: 6,
    sanityLoss: 10,
    resistible: false
  },

  {
    id: 'path_alteration',
    type: DistortionType.PATH_ALTERATION,
    name: 'Path Alteration',
    description: 'The road you walk is not the road you chose. Every path leads somewhere... else.',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.TOUCHED,
    chance: 0.13,
    effect: {
      description: 'Paths lead to wrong destinations',
      mechanicalEffect: { destinationRandomization: 0.5 },
      duration: 10
    },
    severity: 5,
    sanityLoss: 6,
    resistible: true,
    resistCheck: { stat: 'cunning', difficulty: 10 }
  },

  {
    id: 'property_change',
    type: DistortionType.PROPERTY_CHANGE,
    name: 'Property Flux',
    description: 'Items in your inventory feel different. Look different. Are different. Were they always like this?',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.CORRUPTED,
    chance: 0.08,
    effect: {
      description: 'Item properties randomly change',
      mechanicalEffect: { itemStatChange: 'random +/- 20%' },
      duration: 30
    },
    severity: 7,
    sanityLoss: 15,
    resistible: false
  },

  {
    id: 'reality_inversion',
    type: DistortionType.SPATIAL_SHIFT,
    name: 'Reality Inversion',
    description: 'Up is down. Left is right. Inside is outside. You are walking on the ceiling. Or are you?',
    location: 'The Scar - Deep',
    corruptionLevelTrigger: CorruptionLevel.CORRUPTED,
    chance: 0.05,
    effect: {
      description: 'Physical laws invert',
      mechanicalEffect: { controlsInverted: true, statPenalty: -20 },
      duration: 5
    },
    severity: 9,
    sanityLoss: 20,
    resistible: true,
    resistCheck: { stat: 'spirit', difficulty: 18 }
  },

  {
    id: 'echo_event',
    type: DistortionType.TIME_DILATION,
    name: 'Echo Event',
    description: 'The last minute repeats. And repeats. And repeats. How many times have you lived this moment?',
    location: 'The Scar',
    corruptionLevelTrigger: CorruptionLevel.CORRUPTED,
    chance: 0.06,
    effect: {
      description: 'Same events repeat multiple times',
      mechanicalEffect: { timeLoop: 'micro', iterations: '3-7' },
      duration: 1
    },
    severity: 8,
    sanityLoss: 18,
    resistible: false
  },

  {
    id: 'void_tear',
    type: DistortionType.SPATIAL_SHIFT,
    name: 'Void Tear',
    description: 'Reality tears. Through the gap, you see the void. The nothing. And it sees you.',
    location: 'The Scar - Deep',
    corruptionLevelTrigger: CorruptionLevel.LOST,
    chance: 0.15,
    effect: {
      description: 'Brief glimpse into the void',
      mechanicalEffect: { voidExposure: true, damage: 30 },
      duration: 0.5
    },
    severity: 10,
    sanityLoss: 30,
    resistible: true,
    resistCheck: { stat: 'spirit', difficulty: 20 }
  }
];

export class RealityDistortionService {
  /**
   * Roll for reality distortion
   */
  static async rollForDistortion(
    characterId: string,
    location: string
  ): Promise<{
    occurred: boolean;
    distortion?: RealityDistortion;
    resisted: boolean;
    message?: string;
  }> {
    // Only in The Scar
    if (!location.toLowerCase().includes('scar')) {
      return { occurred: false, resisted: false };
    }

    const corruption = await CorruptionService.getOrCreateTracker(characterId);
    const character = await Character.findById(characterId);

    if (!character) {
      return { occurred: false, resisted: false };
    }

    // Get possible distortions
    const possibleDistortions = REALITY_DISTORTIONS.filter(d => {
      // Check location
      if (!location.toLowerCase().includes(d.location.toLowerCase())) {
        return false;
      }

      // Check corruption level requirement
      const corruptionLevels = [
        CorruptionLevel.CLEAN,
        CorruptionLevel.TOUCHED,
        CorruptionLevel.TAINTED,
        CorruptionLevel.CORRUPTED,
        CorruptionLevel.LOST
      ];

      const currentIndex = corruptionLevels.indexOf(corruption.corruptionLevel);
      const requiredIndex = corruptionLevels.indexOf(d.corruptionLevelTrigger);

      return currentIndex >= requiredIndex;
    });

    if (possibleDistortions.length === 0) {
      return { occurred: false, resisted: false };
    }

    // Roll for occurrence
    const baseChance = corruption.corruptionLevel === CorruptionLevel.CORRUPTED ||
                      corruption.corruptionLevel === CorruptionLevel.LOST
      ? COSMIC_HORROR_CONSTANTS.DISTORTION_HIGH_CORRUPTION_CHANCE
      : COSMIC_HORROR_CONSTANTS.DISTORTION_BASE_CHANCE;

    if (!SecureRNG.chance(baseChance)) {
      return { occurred: false, resisted: false };
    }

    // Select random distortion
    const distortion = SecureRNG.select(possibleDistortions);

    // Check resistance
    let resisted = false;
    if (distortion.resistible && distortion.resistCheck) {
      const stat = character.stats[distortion.resistCheck.stat as keyof typeof character.stats];
      const roll = SecureRNG.range(1, 20) + stat;

      if (roll >= distortion.resistCheck.difficulty) {
        resisted = true;
        logger.info(`Character ${characterId} resisted distortion ${distortion.id}`);
      }
    }

    if (resisted) {
      return {
        occurred: true,
        distortion,
        resisted: true,
        message: `Reality begins to warp around you, but you resist its pull. ${distortion.description}`
      };
    }

    // Apply distortion
    await this.applyDistortion(characterId, distortion);

    logger.info(`Character ${characterId} experienced distortion ${distortion.id}`);

    return {
      occurred: true,
      distortion,
      resisted: false,
      message: `${distortion.description}\n\n${distortion.effect.description}`
    };
  }

  /**
   * Apply distortion effects
   */
  static async applyDistortion(
    characterId: string,
    distortion: RealityDistortion
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Apply sanity loss
    // Would integrate with sanity service
    logger.info(`Character loses ${distortion.sanityLoss} sanity from distortion`);

    // Create active distortion
    const distortionId = `${distortion.id}_${Date.now()}`;
    const expiresAt = distortion.effect.duration
      ? new Date(Date.now() + distortion.effect.duration * 60 * 1000)
      : undefined;

    activeDistortions.set(distortionId, {
      distortion,
      affectedCharacters: new Set([characterId]),
      startedAt: new Date(),
      expiresAt
    });

    // Apply specific effects
    switch (distortion.type) {
      case DistortionType.SPATIAL_SHIFT:
        await this.applySpatialShift(characterId, distortion);
        break;

      case DistortionType.TIME_DILATION:
        await this.applyTimeDilation(characterId, distortion);
        break;

      case DistortionType.PROBABILITY_FLUX:
        await this.applyProbabilityFlux(characterId, distortion);
        break;

      case DistortionType.MEMORY_CORRUPTION:
        await this.applyMemoryCorruption(characterId, distortion);
        break;

      case DistortionType.DUPLICATE_ENTITY:
        await this.applyEntityDuplication(characterId, distortion);
        break;

      case DistortionType.PATH_ALTERATION:
        await this.applyPathAlteration(characterId, distortion);
        break;

      case DistortionType.PROPERTY_CHANGE:
        await this.applyPropertyChange(characterId, distortion);
        break;
    }

    // Schedule cleanup if temporary (skip in test environment to prevent timer leaks)
    if (expiresAt && process.env.NODE_ENV !== 'test') {
      const timeoutId = setTimeout(() => {
        this.removeDistortion(distortionId);
        pendingDistortionCleanups.delete(distortionId);
      }, distortion.effect.duration! * 60 * 1000);
      pendingDistortionCleanups.set(distortionId, timeoutId);
    }
  }

  /**
   * Apply spatial shift
   */
  static async applySpatialShift(characterId: string, distortion: RealityDistortion): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Teleport to random location within The Scar
    const scarLocations = [
      'The Scar - Edge',
      'The Scar - Depths',
      'The Scar - Void Nexus',
      'The Scar - Reality Fissure',
      'The Scar - Echo Chamber'
    ];

    const newLocation = SecureRNG.select(scarLocations);
    character.currentLocation = newLocation;
    await character.save();

    logger.info(`Character ${characterId} spatially shifted to ${newLocation}`);
  }

  /**
   * Apply time dilation
   */
  static async applyTimeDilation(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would affect game time passage
    // For now, just log
    logger.info(`Time dilation applied to character ${characterId}`);
  }

  /**
   * Apply probability flux
   */
  static async applyProbabilityFlux(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would affect next action outcomes
    // Store in temporary effects
    logger.info(`Probability flux applied to character ${characterId}`);
  }

  /**
   * Apply memory corruption
   */
  static async applyMemoryCorruption(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would affect quest memory or character knowledge
    // For now, just apply corruption
    await CorruptionService.gainCorruption(characterId, 3, 'Memory Corruption');
    logger.info(`Memory corruption applied to character ${characterId}`);
  }

  /**
   * Apply entity duplication
   */
  static async applyEntityDuplication(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would create duplicate NPCs in current location
    logger.info(`Entity duplication applied to character ${characterId}`);
  }

  /**
   * Apply path alteration
   */
  static async applyPathAlteration(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would affect travel outcomes
    logger.info(`Path alteration applied to character ${characterId}`);
  }

  /**
   * Apply property change
   */
  static async applyPropertyChange(characterId: string, distortion: RealityDistortion): Promise<void> {
    // Would randomly modify item stats in inventory
    logger.info(`Property change applied to character ${characterId}`);
  }

  /**
   * Remove distortion
   */
  static removeDistortion(distortionId: string): void {
    const distortion = activeDistortions.get(distortionId);
    if (distortion) {
      activeDistortions.delete(distortionId);
      logger.info(`Distortion ${distortion.distortion.id} expired`);
    }
  }

  /**
   * Get active distortions affecting character
   */
  static getActiveDistortions(characterId: string): RealityDistortion[] {
    const distortions: RealityDistortion[] = [];

    for (const [id, data] of activeDistortions.entries()) {
      if (data.affectedCharacters.has(characterId)) {
        // Check if expired
        if (data.expiresAt && data.expiresAt < new Date()) {
          this.removeDistortion(id);
          continue;
        }

        distortions.push(data.distortion);
      }
    }

    return distortions;
  }

  /**
   * Force a specific distortion (for quests/events)
   */
  static async forceDistortion(
    characterId: string,
    distortionId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const distortion = REALITY_DISTORTIONS.find(d => d.id === distortionId);
    if (!distortion) {
      return { success: false, message: 'Distortion not found' };
    }

    await this.applyDistortion(characterId, distortion);

    return {
      success: true,
      message: `${distortion.description}\n\n${distortion.effect.description}`
    };
  }

  /**
   * Get all possible distortions
   */
  static getAllDistortions(): RealityDistortion[] {
    return REALITY_DISTORTIONS;
  }

  /**
   * Check if location has reality instability
   */
  static isLocationUnstable(location: string): boolean {
    return location.toLowerCase().includes('scar');
  }

  /**
   * Get reality stability of location
   */
  static getLocationStability(location: string): {
    stable: boolean;
    stabilityLevel: number;
    description: string;
  } {
    const lowerLocation = location.toLowerCase();

    if (!lowerLocation.includes('scar')) {
      return {
        stable: true,
        stabilityLevel: 100,
        description: 'Reality is stable here.'
      };
    }

    if (lowerLocation.includes('edge')) {
      return {
        stable: false,
        stabilityLevel: 70,
        description: 'Reality occasionally flickers at the edge of The Scar.'
      };
    }

    if (lowerLocation.includes('deep') || lowerLocation.includes('depths')) {
      return {
        stable: false,
        stabilityLevel: 40,
        description: 'Reality is highly unstable. Distortions are common.'
      };
    }

    if (lowerLocation.includes('nexus') || lowerLocation.includes('void')) {
      return {
        stable: false,
        stabilityLevel: 10,
        description: 'Reality barely exists here. The void bleeds through constantly.'
      };
    }

    return {
      stable: false,
      stabilityLevel: 50,
      description: 'Reality is weakened in The Scar.'
    };
  }

  /**
   * Periodic distortion check (called regularly for characters in Scar)
   */
  static async periodicCheck(characterId: string): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Only check if in Scar
    if (!this.isLocationUnstable(character.currentLocation)) {
      return;
    }

    // Roll for distortion
    await this.rollForDistortion(characterId, character.currentLocation);
  }
}

/**
 * Cleanup function to stop all pending distortion timers
 * Called during graceful shutdown to prevent timer leaks
 */
export function stopRealityDistortionTimers(): void {
  for (const timeoutId of pendingDistortionCleanups.values()) {
    clearTimeout(timeoutId);
  }
  pendingDistortionCleanups.clear();
}
