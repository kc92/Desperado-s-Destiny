/**
 * Entertainer Service
 *
 * Handles wandering entertainer logic, performances, and their effects on players
 * Phase 4, Wave 4.1 - Entertainment System
 */

import {
  WANDERING_ENTERTAINERS,
  WanderingEntertainer,
  Performance,
  PerformanceType,
  TeachableSkill,
  getEntertainerById,
  getEntertainersByType,
  getEntertainersAtLocation,
  getAvailablePerformances
} from '../data/wanderingEntertainers';
import { Character } from '../models/Character.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';

/**
 * Result of watching a performance
 */
export interface PerformanceResult {
  success: boolean;
  message: string;
  performance: Performance;
  moodChange: {
    mood: string;
    duration: number;
    intensity: number;
  };
  buffsApplied?: Array<{
    stat: string;
    modifier: number;
    duration: number;
    expiresAt: Date;
  }>;
  experienceGained: number;
  dollarsEarned?: number;
  itemReceived?: string;
  trustGained: number;
}

/**
 * Result of learning a skill from an entertainer
 */
export interface SkillLearningResult {
  success: boolean;
  message: string;
  skill?: TeachableSkill;
  energyCost: number;
  goldCost: number;
  effectApplied?: {
    stat: string;
    modifier: number;
    permanent: boolean;
  };
  trustRequired: number;
  currentTrust: number;
}

/**
 * Watch a performance
 */
export async function watchPerformance(
  characterId: string,
  entertainerId: string,
  performanceId: string
): Promise<PerformanceResult> {
  try {
    // Get the character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get the entertainer
    const entertainer = getEntertainerById(entertainerId);
    if (!entertainer) {
      throw new Error('Entertainer not found');
    }

    // Get the performance
    const performance = entertainer.performances.find(p => p.id === performanceId);
    if (!performance) {
      throw new Error('Performance not found');
    }

    // Check if character has enough energy
    if (character.energy < performance.energyCost) {
      return {
        success: false,
        message: `Not enough energy. Need ${performance.energyCost}, have ${character.energy}`,
        performance,
        moodChange: performance.moodEffect,
        experienceGained: 0,
        trustGained: 0
      };
    }

    // Deduct energy
    character.energy -= performance.energyCost;

    // Apply mood effect
    const moodChange = performance.moodEffect;

    // Apply rewards
    const buffsApplied: Array<{
      stat: string;
      modifier: number;
      duration: number;
      expiresAt: Date;
    }> = [];

    let experienceGained = 0;
    let dollarsEarned = 0;
    let itemReceived: string | undefined;

    if (performance.rewards) {
      // Experience
      if (performance.rewards.experience) {
        experienceGained = performance.rewards.experience;
        character.experience += experienceGained;
      }

      // Dollars
      if (performance.rewards.gold) {
        dollarsEarned = performance.rewards.gold;
        await DollarService.addDollars(
          character._id.toString(),
          dollarsEarned,
          TransactionSource.JOB_INCOME,
          {
            entertainerId,
            performanceId,
            performanceName: performance.name
          }
        );
      }

      // Item
      if (performance.rewards.item) {
        itemReceived = performance.rewards.item;
        // Add item to character inventory (implementation depends on inventory system)
      }

      // Buff
      if (performance.rewards.buff) {
        const buff = performance.rewards.buff;
        const expiresAt = new Date(Date.now() + buff.duration * 60 * 1000);

        buffsApplied.push({
          stat: buff.stat,
          modifier: buff.modifier,
          duration: buff.duration,
          expiresAt
        });

        // Apply buff to character (implementation depends on buff system)
        // This would typically add to a character.activeBuffs array
      }
    }

    // Increase trust with entertainer (small amount per performance)
    const trustGained = 2;
    // Trust tracking would be implemented in a separate system

    // Save character
    await character.save();

    return {
      success: true,
      message: `You watched ${performance.name}! ${performance.description}`,
      performance,
      moodChange,
      buffsApplied: buffsApplied.length > 0 ? buffsApplied : undefined,
      experienceGained,
      dollarsEarned: dollarsEarned > 0 ? dollarsEarned : undefined,
      itemReceived,
      trustGained
    };
  } catch (error) {
    throw new Error(`Failed to watch performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Learn a skill from an entertainer
 */
export async function learnSkillFromEntertainer(
  characterId: string,
  entertainerId: string,
  skillId: string
): Promise<SkillLearningResult> {
  try {
    // Get the character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get the entertainer
    const entertainer = getEntertainerById(entertainerId);
    if (!entertainer) {
      throw new Error('Entertainer not found');
    }

    // Get the skill
    const skill = entertainer.teachableSkills?.find(s => s.skillId === skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    // Get current trust (would come from a trust tracking system)
    const currentTrust = entertainer.trustLevel; // Placeholder

    // Check trust requirement
    if (currentTrust < skill.trustRequired) {
      return {
        success: false,
        message: `Not enough trust. Need ${skill.trustRequired}, have ${currentTrust}`,
        energyCost: skill.energyCost,
        goldCost: skill.goldCost,
        trustRequired: skill.trustRequired,
        currentTrust
      };
    }

    // Check energy
    if (character.energy < skill.energyCost) {
      return {
        success: false,
        message: `Not enough energy. Need ${skill.energyCost}, have ${character.energy}`,
        energyCost: skill.energyCost,
        goldCost: skill.goldCost,
        trustRequired: skill.trustRequired,
        currentTrust
      };
    }

    // Check dollars
    if (character.dollars < skill.goldCost) {
      return {
        success: false,
        message: `Not enough dollars. Need ${skill.goldCost}, have ${character.dollars}`,
        energyCost: skill.energyCost,
        goldCost: skill.goldCost,
        trustRequired: skill.trustRequired,
        currentTrust
      };
    }

    // Deduct costs
    character.energy -= skill.energyCost;
    await DollarService.deductDollars(
      character._id.toString(),
      skill.goldCost,
      TransactionSource.SHOP_PURCHASE,
      {
        entertainerId,
        skillId,
        skillName: skill.skillName
      }
    );

    // Apply skill effect
    const effectApplied = {
      stat: skill.effect.stat,
      modifier: skill.effect.modifier,
      permanent: skill.effect.permanent
    };

    // Apply permanent stat increase (implementation depends on character stat system)
    // This would typically modify character stats or add to a learnedSkills array

    // Save character
    await character.save();

    return {
      success: true,
      message: `You learned ${skill.skillName} from ${entertainer.name}! ${skill.description}`,
      skill,
      energyCost: skill.energyCost,
      goldCost: skill.goldCost,
      effectApplied,
      trustRequired: skill.trustRequired,
      currentTrust
    };
  } catch (error) {
    throw new Error(`Failed to learn skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get entertainers at a specific location on a specific day
 */
export function getEntertainersAtLocationOnDay(
  locationId: string,
  currentDay: number
): WanderingEntertainer[] {
  return getEntertainersAtLocation(locationId, currentDay);
}

/**
 * Get all available performances at a location
 */
export function getLocationPerformances(
  locationId: string,
  currentDay: number
): Performance[] {
  return getAvailablePerformances(locationId, currentDay);
}

/**
 * Get entertainer current location based on their route and current day
 */
export function getEntertainerCurrentLocation(
  entertainerId: string,
  currentDay: number
): { locationId: string; locationName: string; performanceVenue: string } | null {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return null;
  }

  // Calculate position in route based on day
  let totalDays = 0;
  for (const stop of entertainer.route) {
    totalDays += stop.stayDuration;
  }

  const dayInCycle = currentDay % totalDays;
  let currentDayCount = 0;

  for (const stop of entertainer.route) {
    currentDayCount += stop.stayDuration;
    if (dayInCycle < currentDayCount) {
      return {
        locationId: stop.locationId,
        locationName: stop.locationName,
        performanceVenue: stop.performanceVenue
      };
    }
  }

  // Default to first location if calculation fails
  return {
    locationId: entertainer.route[0].locationId,
    locationName: entertainer.route[0].locationName,
    performanceVenue: entertainer.route[0].performanceVenue
  };
}

/**
 * Check if entertainer is currently performing (based on schedule and time)
 */
export function isEntertainerPerforming(
  entertainerId: string,
  currentHour: number
): boolean {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return false;
  }

  // Check schedule
  const schedule = entertainer.schedule.defaultSchedule;
  for (const entry of schedule) {
    if (currentHour >= entry.hour && currentHour < entry.endHour) {
      return entry.activity === 'performing';
    }
  }

  return false;
}

/**
 * Get gossip from entertainer (if player has enough trust)
 */
export function getGossipFromEntertainer(
  entertainerId: string,
  trustLevel: number,
  category?: string
): string[] {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return [];
  }

  // Require minimum trust to get gossip
  if (trustLevel < 20) {
    return ["I don't know you well enough to share secrets."];
  }

  // If no gossip access, return empty
  if (!entertainer.gossipAccess || entertainer.gossipAccess.length === 0) {
    return ["I don't really hear much gossip in my line of work."];
  }

  // Filter by category if specified
  const availableCategories = category
    ? entertainer.gossipAccess.filter(c => c === category)
    : entertainer.gossipAccess;

  if (availableCategories.length === 0) {
    return ["I don't know much about that particular subject."];
  }

  // Return placeholder gossip
  // In a full implementation, this would query the gossip system
  return [
    `I hear things about ${availableCategories.join(', ')}...`,
    "Let me tell you what I've heard...",
    "People talk freely around entertainers..."
  ];
}

/**
 * Apply mood effect from performance
 */
export async function applyPerformanceMoodEffect(
  characterId: string,
  moodEffect: {
    mood: string;
    duration: number;
    intensity: number;
  }
): Promise<void> {
  try {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Apply mood effect (implementation depends on mood system)
    // This would typically set or modify character.currentMood
    // and track duration/expiration

    await character.save();
  } catch (error) {
    throw new Error(`Failed to apply mood effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all entertainers
 */
export function getAllEntertainers(): WanderingEntertainer[] {
  return WANDERING_ENTERTAINERS;
}

/**
 * Search entertainers by name
 */
export function searchEntertainersByName(searchTerm: string): WanderingEntertainer[] {
  const lowerSearch = searchTerm.toLowerCase();
  return WANDERING_ENTERTAINERS.filter(
    e =>
      e.name.toLowerCase().includes(lowerSearch) ||
      e.title.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Get entertainer schedule for a specific day
 */
export function getEntertainerSchedule(entertainerId: string) {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return null;
  }

  return entertainer.schedule;
}

/**
 * Calculate trust gain from interaction
 */
export function calculateTrustGain(interactionType: 'performance' | 'conversation' | 'skill_learning'): number {
  switch (interactionType) {
    case 'performance':
      return 2; // Small gain from watching performances
    case 'conversation':
      return 5; // Moderate gain from meaningful conversations
    case 'skill_learning':
      return 10; // Significant gain from learning skills
    default:
      return 0;
  }
}

/**
 * Check if player can afford a performance
 */
export function canAffordPerformance(
  characterEnergy: number,
  performance: Performance
): { canAfford: boolean; reason?: string } {
  if (characterEnergy < performance.energyCost) {
    return {
      canAfford: false,
      reason: `Need ${performance.energyCost} energy, have ${characterEnergy}`
    };
  }

  return { canAfford: true };
}

/**
 * Get recommended performances based on character needs
 */
export function getRecommendedPerformances(
  characterLevel: number,
  characterNeeds: string[]
): Performance[] {
  const allPerformances = WANDERING_ENTERTAINERS.flatMap(e => e.performances);

  // Filter based on character needs (mood, buffs, etc.)
  // This is a simplified implementation
  return allPerformances.slice(0, 5); // Return top 5 for now
}
