/**
 * Fortification Type Definitions
 *
 * Detailed definitions for all fortification types
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import { FortificationType } from '@desperados/shared';

/**
 * Fortification type details
 */
export interface FortificationTypeDetail {
  id: FortificationType;
  name: string;
  description: string;
  longDescription: string;

  // Costs (base level)
  baseCost: {
    gold: number;
    supplies: number;
    buildTimeDays: number;
  };

  // Upgrade scaling
  upgradeMultiplier: number;
  maxLevel: number;

  // Defense bonuses
  defensePerLevel: number;
  specialBonus?: {
    type: string;
    value: number;
    description: string;
  };

  // Requirements
  requirements: {
    minTerritoryLevel?: number;
    prerequisiteFortifications?: FortificationType[];
    minInfluence?: number;
  };

  // Visual and gameplay
  category: 'defensive' | 'offensive' | 'support' | 'economic';
  priority: number;
  tags: string[];
}

/**
 * All fortification type definitions
 */
export const FORTIFICATION_TYPES: Record<FortificationType, FortificationTypeDetail> = {
  [FortificationType.WALLS]: {
    id: FortificationType.WALLS,
    name: 'Defensive Walls',
    description: 'Sturdy defensive walls provide general protection against sieges',
    longDescription:
      'Massive stone and timber fortifications that encircle key areas of the territory. ' +
      'These walls provide fundamental protection against assault and serve as the ' +
      'backbone of any defensive strategy. Higher levels represent stronger materials, ' +
      'greater height, and more sophisticated defensive features.',

    baseCost: {
      gold: 5000,
      supplies: 1000,
      buildTimeDays: 3,
    },

    upgradeMultiplier: 1.5,
    maxLevel: 10,
    defensePerLevel: 2.0,

    specialBonus: {
      type: 'breach_resistance',
      value: 10,
      description: '+10% resistance to siege weapon damage per level',
    },

    requirements: {
      minInfluence: 50,
    },

    category: 'defensive',
    priority: 1,
    tags: ['defense', 'protection', 'essential', 'structure'],
  },

  [FortificationType.WATCHTOWERS]: {
    id: FortificationType.WATCHTOWERS,
    name: 'Watchtowers',
    description: 'Elevated observation posts give early warning of incoming threats',
    longDescription:
      'Tall towers strategically positioned to provide maximum visibility of approaching ' +
      'forces. Watchtowers give defenders crucial advance warning of sieges, allowing ' +
      'time to rally defenses and prepare countermeasures. Higher levels increase range ' +
      'and effectiveness of early warning systems.',

    baseCost: {
      gold: 3000,
      supplies: 500,
      buildTimeDays: 2,
    },

    upgradeMultiplier: 1.4,
    maxLevel: 10,
    defensePerLevel: 1.5,

    specialBonus: {
      type: 'warning_time',
      value: 2,
      description: '+2 hours warning time before siege begins per level',
    },

    requirements: {
      minInfluence: 40,
    },

    category: 'support',
    priority: 2,
    tags: ['reconnaissance', 'warning', 'intelligence', 'structure'],
  },

  [FortificationType.BARRACKS]: {
    id: FortificationType.BARRACKS,
    name: 'Barracks',
    description: 'Housing for troops increases defensive capacity',
    longDescription:
      'Military housing facilities that allow for the permanent stationing of defensive ' +
      'forces. Barracks increase the number of troops available to defend the territory ' +
      'and improve their readiness and effectiveness. Higher levels accommodate more ' +
      'troops and provide better training facilities.',

    baseCost: {
      gold: 4000,
      supplies: 800,
      buildTimeDays: 3,
    },

    upgradeMultiplier: 1.5,
    maxLevel: 10,
    defensePerLevel: 2.0,

    specialBonus: {
      type: 'troop_capacity',
      value: 10,
      description: '+10 defending troops per level',
    },

    requirements: {
      minInfluence: 45,
    },

    category: 'defensive',
    priority: 3,
    tags: ['troops', 'military', 'capacity', 'structure'],
  },

  [FortificationType.SUPPLY_DEPOT]: {
    id: FortificationType.SUPPLY_DEPOT,
    name: 'Supply Depot',
    description: 'Stockpiled resources extend siege endurance',
    longDescription:
      'Fortified warehouses storing food, ammunition, and other critical supplies. ' +
      'Supply depots allow defenders to withstand prolonged sieges without running out ' +
      'of essential resources. Higher levels increase storage capacity and improve ' +
      'resource distribution efficiency during combat.',

    baseCost: {
      gold: 3500,
      supplies: 700,
      buildTimeDays: 2,
    },

    upgradeMultiplier: 1.4,
    maxLevel: 10,
    defensePerLevel: 1.5,

    specialBonus: {
      type: 'siege_duration',
      value: 6,
      description: '+6 hours maximum siege endurance per level',
    },

    requirements: {
      minInfluence: 40,
    },

    category: 'support',
    priority: 4,
    tags: ['supplies', 'endurance', 'logistics', 'structure'],
  },

  [FortificationType.ARTILLERY]: {
    id: FortificationType.ARTILLERY,
    name: 'Artillery Emplacements',
    description: 'Heavy weapons provide powerful defensive firepower',
    longDescription:
      'Fortified positions housing cannons, mortars, and other heavy weaponry. ' +
      'Artillery emplacements provide devastating offensive firepower against besieging ' +
      'forces and can destroy enemy siege equipment before it reaches the walls. Higher ' +
      'levels represent more numerous and powerful weapons with greater range and accuracy.',

    baseCost: {
      gold: 6000,
      supplies: 1200,
      buildTimeDays: 4,
    },

    upgradeMultiplier: 1.6,
    maxLevel: 10,
    defensePerLevel: 3.0,

    specialBonus: {
      type: 'countersiege',
      value: 15,
      description: '+15% damage to enemy siege weapons per level',
    },

    requirements: {
      prerequisiteFortifications: [FortificationType.WALLS],
      minInfluence: 60,
    },

    category: 'offensive',
    priority: 5,
    tags: ['weapons', 'artillery', 'offense', 'structure'],
  },
};

/**
 * Calculate upgrade cost for a fortification
 */
export function calculateUpgradeCost(
  type: FortificationType,
  currentLevel: number
): { gold: number; supplies: number; buildTimeDays: number } {
  const fortType = FORTIFICATION_TYPES[type];
  const multiplier = Math.pow(fortType.upgradeMultiplier, currentLevel);

  return {
    gold: Math.floor(fortType.baseCost.gold * multiplier),
    supplies: Math.floor(fortType.baseCost.supplies * multiplier),
    buildTimeDays: fortType.baseCost.buildTimeDays + Math.floor(currentLevel / 2),
  };
}

/**
 * Calculate defense bonus for a fortification
 */
export function calculateDefenseBonus(
  type: FortificationType,
  level: number,
  healthPercentage: number
): number {
  const fortType = FORTIFICATION_TYPES[type];
  const baseBonus = fortType.defensePerLevel * level;

  // Apply damage reduction based on health
  let healthMultiplier = 1.0;
  if (healthPercentage < 20) {
    healthMultiplier = 0.2;
  } else if (healthPercentage < 40) {
    healthMultiplier = 0.5;
  } else if (healthPercentage < 70) {
    healthMultiplier = 0.7;
  } else if (healthPercentage < 90) {
    healthMultiplier = 0.9;
  }

  return Math.floor(baseBonus * healthMultiplier * 10) / 10;
}

/**
 * Calculate repair cost for damaged fortification
 */
export function calculateRepairCost(
  type: FortificationType,
  level: number,
  currentHealth: number
): { gold: number; supplies: number; repairTimeDays: number } {
  const fortType = FORTIFICATION_TYPES[type];
  const buildCost = calculateUpgradeCost(type, level);

  // Repair cost is proportional to damage
  const damagePercentage = (100 - currentHealth) / 100;

  return {
    gold: Math.floor(buildCost.gold * damagePercentage * 0.6), // 60% of build cost
    supplies: Math.floor(buildCost.supplies * damagePercentage * 0.6),
    repairTimeDays: Math.max(1, Math.floor(buildCost.buildTimeDays * damagePercentage * 0.5)),
  };
}

/**
 * Get total defense bonus from all fortifications
 */
export function getTotalDefenseBonus(
  fortifications: Array<{ type: FortificationType; level: number; healthPercentage: number }>
): number {
  return fortifications.reduce((total, fort) => {
    return total + calculateDefenseBonus(fort.type, fort.level, fort.healthPercentage);
  }, 0);
}

/**
 * Check if fortification requirements are met
 */
export function checkFortificationRequirements(
  type: FortificationType,
  currentInfluence: number,
  existingFortifications: FortificationType[]
): { canBuild: boolean; missingRequirements: string[] } {
  const fortType = FORTIFICATION_TYPES[type];
  const missing: string[] = [];

  // Check influence
  if (fortType.requirements.minInfluence && currentInfluence < fortType.requirements.minInfluence) {
    missing.push(`Requires ${fortType.requirements.minInfluence}% influence (current: ${currentInfluence}%)`);
  }

  // Check prerequisites
  if (fortType.requirements.prerequisiteFortifications) {
    for (const prereq of fortType.requirements.prerequisiteFortifications) {
      if (!existingFortifications.includes(prereq)) {
        const prereqType = FORTIFICATION_TYPES[prereq];
        missing.push(`Requires ${prereqType.name} to be built first`);
      }
    }
  }

  return {
    canBuild: missing.length === 0,
    missingRequirements: missing,
  };
}

/**
 * Get fortification build order recommendation
 */
export function getRecommendedBuildOrder(): FortificationType[] {
  return Object.values(FORTIFICATION_TYPES)
    .sort((a, b) => a.priority - b.priority)
    .map((f) => f.id);
}

/**
 * Calculate siege damage to fortifications
 */
export function calculateSiegeDamage(
  fortifications: Array<{
    type: FortificationType;
    level: number;
    healthPercentage: number;
  }>,
  siegeIntensity: number, // 0-100
  duration: number // Hours
): Array<{ type: FortificationType; damageDealt: number; newHealth: number }> {
  return fortifications.map((fort) => {
    const fortType = FORTIFICATION_TYPES[fort.type];

    // Base damage calculation
    let baseDamage = siegeIntensity * (duration / 24) * 10; // ~10% per 24 hours at full intensity

    // Artillery is more vulnerable to siege weapons
    if (fort.type === FortificationType.ARTILLERY) {
      baseDamage *= 1.3;
    }

    // Walls are more resistant
    if (fort.type === FortificationType.WALLS && fortType.specialBonus?.type === 'breach_resistance') {
      baseDamage *= 1 - fortType.specialBonus.value / 100;
    }

    // Higher level fortifications are slightly more durable
    baseDamage *= 1 - fort.level * 0.02;

    const damageDealt = Math.min(fort.healthPercentage, baseDamage);
    const newHealth = Math.max(0, fort.healthPercentage - damageDealt);

    return {
      type: fort.type,
      damageDealt: Math.round(damageDealt * 10) / 10,
      newHealth: Math.round(newHealth * 10) / 10,
    };
  });
}

/**
 * Get fortification summary for display
 */
export function getFortificationSummary(fortifications: Array<{
  type: FortificationType;
  level: number;
  healthPercentage: number;
}>): {
  totalDefense: number;
  fortificationCount: number;
  averageLevel: number;
  averageHealth: number;
  strongestType: FortificationType | null;
} {
  if (fortifications.length === 0) {
    return {
      totalDefense: 0,
      fortificationCount: 0,
      averageLevel: 0,
      averageHealth: 0,
      strongestType: null,
    };
  }

  const totalDefense = getTotalDefenseBonus(fortifications);
  const averageLevel =
    fortifications.reduce((sum, f) => sum + f.level, 0) / fortifications.length;
  const averageHealth =
    fortifications.reduce((sum, f) => sum + f.healthPercentage, 0) / fortifications.length;

  // Find strongest by defense contribution
  const strongest = fortifications.reduce((prev, current) => {
    const prevBonus = calculateDefenseBonus(prev.type, prev.level, prev.healthPercentage);
    const currentBonus = calculateDefenseBonus(current.type, current.level, current.healthPercentage);
    return currentBonus > prevBonus ? current : prev;
  });

  return {
    totalDefense: Math.round(totalDefense * 10) / 10,
    fortificationCount: fortifications.length,
    averageLevel: Math.round(averageLevel * 10) / 10,
    averageHealth: Math.round(averageHealth * 10) / 10,
    strongestType: strongest.type,
  };
}
