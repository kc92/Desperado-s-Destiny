/**
 * Divine Intervention Service - Divine Struggle System
 *
 * Manages divine/demonic manifestations, spiritual phenomena, and celestial anomalies in The Rift
 * Rebranded from Reality Distortion Service (cosmic horror → angels & demons)
 */

import {
  RealityDistortion as DivineManifest,
  DistortionType as ManifestationType,
  CorruptionLevel as SinLevel,
  COSMIC_HORROR_CONSTANTS as DIVINE_STRUGGLE_CONSTANTS
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { SinService } from './sin.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

// Import original service for reference (use RealityDistortionService directly if you need the original)
import { RealityDistortionService as OriginalRealityDistortionService } from './realityDistortion.service';
export const RealityDistortionServiceRef = OriginalRealityDistortionService;

/**
 * Active manifestations (in-memory, could be database)
 */
const activeManifestations = new Map<string, {
  manifestation: DivineManifest;
  affectedCharacters: Set<string>;
  startedAt: Date;
  expiresAt?: Date;
}>();

/**
 * Track pending manifestation cleanup timeouts to prevent timer leaks in tests
 */
const pendingManifestationCleanups = new Map<string, NodeJS.Timeout>();

/**
 * Divine manifestation definitions
 */
const DIVINE_MANIFESTATIONS: DivineManifest[] = [
  {
    id: 'angelic_transport',
    type: ManifestationType.SPATIAL_SHIFT,
    name: 'Angelic Transport',
    description: 'Wings of light carry you. Space folds. You find yourself somewhere else entirely.',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TOUCHED,
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
    id: 'temporal_grace',
    type: ManifestationType.TIME_DILATION,
    name: 'Temporal Grace',
    description: 'Time flows differently in the presence of the divine. Moments stretch. Hours compress.',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TAINTED,
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
    id: 'divine_lottery',
    type: ManifestationType.PROBABILITY_FLUX,
    name: 'Divine Lottery',
    description: 'The Lord works in mysterious ways. Fortune and misfortune strike randomly.',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TAINTED,
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
    id: 'memory_blessing',
    type: ManifestationType.MEMORY_CORRUPTION,
    name: 'Memory of Grace',
    description: 'You forget your sins. Or perhaps you remember absolution that never came?',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TOUCHED,
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
    id: 'doppelganger_demon',
    type: ManifestationType.DUPLICATE_ENTITY,
    name: 'Doppelganger Demon',
    description: 'A demon takes familiar form. You see someone. Then you see them again. Which is real?',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TAINTED,
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
    id: 'wandering_path',
    type: ManifestationType.PATH_ALTERATION,
    name: 'Wandering Path',
    description: 'The road to Hell is paved with good intentions. Every path leads somewhere... else.',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.TOUCHED,
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
    id: 'cursed_transformation',
    type: ManifestationType.PROPERTY_CHANGE,
    name: 'Cursed Transformation',
    description: 'Your possessions feel different. Blessed items become cursed. Were they always like this?',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.CORRUPTED,
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
    id: 'inverted_heaven',
    type: ManifestationType.SPATIAL_SHIFT,
    name: 'Inverted Heaven',
    description: 'Heaven inverts. Hell rises. Up is down. You walk on clouds below and flames above.',
    location: 'The Rift - Deep',
    corruptionLevelTrigger: SinLevel.CORRUPTED,
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
    id: 'purgatorial_loop',
    type: ManifestationType.TIME_DILATION,
    name: 'Purgatorial Loop',
    description: 'The last minute repeats. And repeats. Like a soul in purgatory, you relive the moment.',
    location: 'The Rift',
    corruptionLevelTrigger: SinLevel.CORRUPTED,
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
    id: 'veil_tear',
    type: ManifestationType.SPATIAL_SHIFT,
    name: 'Tear in the Veil',
    description: 'The veil between worlds tears. Through the gap, you see Hell. Or Heaven. And it sees you.',
    location: 'The Rift - Deep',
    corruptionLevelTrigger: SinLevel.LOST,
    chance: 0.15,
    effect: {
      description: 'Brief glimpse into the divine realm',
      mechanicalEffect: { voidExposure: true, damage: 30 },
      duration: 0.5
    },
    severity: 10,
    sanityLoss: 30,
    resistible: true,
    resistCheck: { stat: 'spirit', difficulty: 20 }
  }
];

export class DivineInterventionService {
  /**
   * Roll for divine manifestation
   */
  static async rollForManifestation(
    characterId: string,
    location: string
  ): Promise<{
    occurred: boolean;
    manifestation?: DivineManifest;
    resisted: boolean;
    message?: string;
  }> {
    // Only in The Rift (formerly The Scar)
    if (!location.toLowerCase().includes('rift') && !location.toLowerCase().includes('scar')) {
      return { occurred: false, resisted: false };
    }

    const sinTracker = await SinService.getOrCreateTracker(characterId);
    const character = await Character.findById(characterId);

    if (!character) {
      return { occurred: false, resisted: false };
    }

    // Get possible manifestations
    const possibleManifestations = DIVINE_MANIFESTATIONS.filter(m => {
      // Check location
      const manifestLocation = m.location.toLowerCase().replace('scar', 'rift');
      if (!location.toLowerCase().includes(manifestLocation.split(' - ')[0])) {
        return false;
      }

      // Check sin level requirement
      const sinLevels = [
        SinLevel.CLEAN,
        SinLevel.TOUCHED,
        SinLevel.TAINTED,
        SinLevel.CORRUPTED,
        SinLevel.LOST
      ];

      const currentIndex = sinLevels.indexOf(sinTracker.corruptionLevel);
      const requiredIndex = sinLevels.indexOf(m.corruptionLevelTrigger);

      return currentIndex >= requiredIndex;
    });

    if (possibleManifestations.length === 0) {
      return { occurred: false, resisted: false };
    }

    // Roll for occurrence
    const baseChance = sinTracker.corruptionLevel === SinLevel.CORRUPTED ||
                      sinTracker.corruptionLevel === SinLevel.LOST
      ? DIVINE_STRUGGLE_CONSTANTS.DISTORTION_HIGH_CORRUPTION_CHANCE
      : DIVINE_STRUGGLE_CONSTANTS.DISTORTION_BASE_CHANCE;

    if (!SecureRNG.chance(baseChance)) {
      return { occurred: false, resisted: false };
    }

    // Select random manifestation
    const manifestation = SecureRNG.select(possibleManifestations);

    // Check resistance (through faith/prayer)
    let resisted = false;
    if (manifestation.resistible && manifestation.resistCheck) {
      const stat = character.stats[manifestation.resistCheck.stat as keyof typeof character.stats];
      const roll = SecureRNG.range(1, 20) + stat;

      if (roll >= manifestation.resistCheck.difficulty) {
        resisted = true;
        logger.info(`Character ${characterId} resisted divine manifestation ${manifestation.id}`);
      }
    }

    if (resisted) {
      return {
        occurred: true,
        manifestation,
        resisted: true,
        message: `The divine presence reaches for you, but your faith holds strong. ${manifestation.description}`
      };
    }

    // Apply manifestation
    await this.applyManifestation(characterId, manifestation);

    logger.info(`Character ${characterId} experienced divine manifestation ${manifestation.id}`);

    return {
      occurred: true,
      manifestation,
      resisted: false,
      message: `${manifestation.description}\n\n${manifestation.effect.description}`
    };
  }

  /**
   * Apply manifestation effects
   */
  static async applyManifestation(
    characterId: string,
    manifestation: DivineManifest
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Apply faith loss
    logger.info(`Character loses ${manifestation.sanityLoss} faith from divine manifestation`);

    // Create active manifestation
    const manifestationId = `${manifestation.id}_${Date.now()}`;
    const expiresAt = manifestation.effect.duration
      ? new Date(Date.now() + manifestation.effect.duration * 60 * 1000)
      : undefined;

    activeManifestations.set(manifestationId, {
      manifestation,
      affectedCharacters: new Set([characterId]),
      startedAt: new Date(),
      expiresAt
    });

    // Apply specific effects
    switch (manifestation.type) {
      case ManifestationType.SPATIAL_SHIFT:
        await this.applyAngelicTransport(characterId, manifestation);
        break;

      case ManifestationType.TIME_DILATION:
        await this.applyTemporalGrace(characterId, manifestation);
        break;

      case ManifestationType.PROBABILITY_FLUX:
        await this.applyDivineLottery(characterId, manifestation);
        break;

      case ManifestationType.MEMORY_CORRUPTION:
        await this.applyMemoryBlessing(characterId, manifestation);
        break;

      case ManifestationType.DUPLICATE_ENTITY:
        await this.applyDoppelganger(characterId, manifestation);
        break;

      case ManifestationType.PATH_ALTERATION:
        await this.applyWanderingPath(characterId, manifestation);
        break;

      case ManifestationType.PROPERTY_CHANGE:
        await this.applyCursedTransformation(characterId, manifestation);
        break;
    }

    // Schedule cleanup if temporary (skip in test environment to prevent timer leaks)
    if (expiresAt && process.env.NODE_ENV !== 'test') {
      const timeoutId = setTimeout(() => {
        this.removeManifestation(manifestationId);
        pendingManifestationCleanups.delete(manifestationId);
      }, manifestation.effect.duration! * 60 * 1000);
      pendingManifestationCleanups.set(manifestationId, timeoutId);
    }
  }

  /**
   * Apply angelic transport (spatial shift)
   */
  static async applyAngelicTransport(characterId: string, manifestation: DivineManifest): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Teleport to random location within The Rift
    const riftLocations = [
      'The Rift - Edge',
      'The Rift - Depths',
      'The Rift - Heaven\'s Gate',
      'The Rift - Hell\'s Maw',
      'The Rift - Purgatory'
    ];

    const newLocation = SecureRNG.select(riftLocations);
    character.currentLocation = newLocation;
    await character.save();

    logger.info(`Character ${characterId} was transported to ${newLocation}`);
  }

  /**
   * Apply temporal grace (time dilation)
   */
  static async applyTemporalGrace(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would affect game time passage
    logger.info(`Temporal grace applied to character ${characterId}`);
  }

  /**
   * Apply divine lottery (probability flux)
   */
  static async applyDivineLottery(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would affect next action outcomes
    logger.info(`Divine lottery applied to character ${characterId}`);
  }

  /**
   * Apply memory blessing/curse
   */
  static async applyMemoryBlessing(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would affect quest memory or character knowledge
    await SinService.gainSin(characterId, 3, 'Memory Alteration');
    logger.info(`Memory blessing/curse applied to character ${characterId}`);
  }

  /**
   * Apply doppelganger demon
   */
  static async applyDoppelganger(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would create duplicate NPCs in current location
    logger.info(`Doppelganger demon appeared near character ${characterId}`);
  }

  /**
   * Apply wandering path
   */
  static async applyWanderingPath(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would affect travel outcomes
    logger.info(`Wandering path affects character ${characterId}`);
  }

  /**
   * Apply cursed transformation
   */
  static async applyCursedTransformation(characterId: string, manifestation: DivineManifest): Promise<void> {
    // Would randomly modify item stats in inventory
    logger.info(`Cursed transformation affects character ${characterId}'s items`);
  }

  /**
   * Remove manifestation
   */
  static removeManifestation(manifestationId: string): void {
    const manifestation = activeManifestations.get(manifestationId);
    if (manifestation) {
      activeManifestations.delete(manifestationId);
      logger.info(`Divine manifestation ${manifestation.manifestation.id} faded`);
    }
  }

  /**
   * Get active manifestations affecting character
   */
  static getActiveManifestations(characterId: string): DivineManifest[] {
    const manifestations: DivineManifest[] = [];

    for (const [id, data] of activeManifestations.entries()) {
      if (data.affectedCharacters.has(characterId)) {
        // Check if expired
        if (data.expiresAt && data.expiresAt < new Date()) {
          this.removeManifestation(id);
          continue;
        }

        manifestations.push(data.manifestation);
      }
    }

    return manifestations;
  }

  /**
   * Force a specific manifestation (for quests/events)
   */
  static async forceManifestation(
    characterId: string,
    manifestationId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const manifestation = DIVINE_MANIFESTATIONS.find(m => m.id === manifestationId);
    if (!manifestation) {
      return { success: false, message: 'Manifestation not found' };
    }

    await this.applyManifestation(characterId, manifestation);

    return {
      success: true,
      message: `${manifestation.description}\n\n${manifestation.effect.description}`
    };
  }

  /**
   * Get all possible manifestations
   */
  static getAllManifestations(): DivineManifest[] {
    return DIVINE_MANIFESTATIONS;
  }

  /**
   * Check if location is touched by the divine
   */
  static isLocationBlessed(location: string): boolean {
    return location.toLowerCase().includes('rift') || location.toLowerCase().includes('scar');
  }

  /**
   * Get divine presence level of location
   */
  static getDivinePresence(location: string): {
    stable: boolean;
    presenceLevel: number;
    description: string;
  } {
    const lowerLocation = location.toLowerCase();

    if (!lowerLocation.includes('rift') && !lowerLocation.includes('scar')) {
      return {
        stable: true,
        presenceLevel: 0,
        description: 'The mortal world holds sway here.'
      };
    }

    if (lowerLocation.includes('edge')) {
      return {
        stable: false,
        presenceLevel: 30,
        description: 'You sense faint whispers of the divine at the edge of The Rift.'
      };
    }

    if (lowerLocation.includes('deep') || lowerLocation.includes('depths')) {
      return {
        stable: false,
        presenceLevel: 60,
        description: 'Divine and infernal presences war constantly. Manifestations are common.'
      };
    }

    if (lowerLocation.includes('gate') || lowerLocation.includes('maw')) {
      return {
        stable: false,
        presenceLevel: 90,
        description: 'You stand at the threshold between worlds. Heaven and Hell bleed through.'
      };
    }

    return {
      stable: false,
      presenceLevel: 50,
      description: 'The veil between worlds is thin in The Rift.'
    };
  }

  /**
   * Periodic manifestation check (called regularly for characters in Rift)
   */
  static async periodicCheck(characterId: string): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Only check if in The Rift
    if (!this.isLocationBlessed(character.currentLocation)) {
      return;
    }

    // Roll for manifestation
    await this.rollForManifestation(characterId, character.currentLocation);
  }
}

// Backwards compatibility alias
export const RealityDistortionService = DivineInterventionService;

/**
 * Cleanup function to stop all pending manifestation timers
 * Called during graceful shutdown to prevent timer leaks
 */
export function stopDivineInterventionTimers(): void {
  for (const timeoutId of pendingManifestationCleanups.values()) {
    clearTimeout(timeoutId);
  }
  pendingManifestationCleanups.clear();
}
