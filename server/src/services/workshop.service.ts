/**
 * Workshop Service
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Business logic for workshop access and management
 */

import {
  WorkshopBuilding,
  WorkshopAccessRequest,
  WorkshopAccessResponse,
  ActiveWorkshopSession,
  AccessRequirement,
  GameLocation
} from '@desperados/shared';
import { ProfessionId } from '@desperados/shared';
import {
  getWorkshop,
  getWorkshopsByLocation,
  getWorkshopsByProfession,
  getWorkshopsByTier
} from '../data/workshops';
import { ObjectId } from 'mongodb';

// ============================================================================
// ACCESS VALIDATION
// ============================================================================

/**
 * Check if a character meets the access requirements for a workshop
 */
export function validateWorkshopAccess(
  workshop: WorkshopBuilding,
  character: {
    level: number;
    totalLevel?: number;  // New Total Level system
    reputation: Record<string, number>;
    faction?: string;
    completedQuests: string[];
    gold: number;
    inventory: { itemId: string }[];
  }
): { canAccess: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!workshop.accessRequirements) {
    return { canAccess: true, errors: [], warnings: [] };
  }

  // Use Total Level for content gating (divided by 10 for backward compat)
  const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);
  for (const requirement of workshop.accessRequirements) {
    switch (requirement.type) {
      case 'level':
        if (effectiveLevel < (requirement.value as number)) {
          errors.push(
            `Requires Total Level ${(requirement.value as number) * 10} (you are at ${character.totalLevel || 30})`
          );
        }
        break;

      case 'reputation':
        const repValue = requirement.value as number;
        const faction = workshop.reputation?.faction || 'general';
        const currentRep = character.reputation[faction] || 0;

        if (currentRep < repValue) {
          errors.push(
            `Requires ${repValue} reputation with ${faction} (you have ${currentRep})`
          );
        }
        break;

      case 'faction':
        const requiredFaction = requirement.value as string;
        if (character.faction !== requiredFaction) {
          errors.push(`Requires ${requiredFaction} faction membership`);
        }
        break;

      case 'quest':
        const questId = requirement.value as string;
        if (!character.completedQuests.includes(questId)) {
          errors.push(`Requires quest completion: ${requirement.description}`);
        }
        break;

      case 'gold':
        const goldRequired = requirement.value as number;
        if (character.gold < goldRequired) {
          errors.push(
            `Requires $${goldRequired} (you have $${character.gold})`
          );
        }
        break;

      case 'item':
        const itemId = requirement.value as string;
        const hasItem = character.inventory.some(i => i.itemId === itemId);
        if (!hasItem) {
          errors.push(`Requires item: ${requirement.description}`);
        }
        break;
    }
  }

  // Check if workshop is currently open
  if (!isWorkshopOpen(workshop)) {
    warnings.push(
      `Workshop is currently closed. Opens at ${workshop.operatingHours.open}:00`
    );
  }

  return {
    canAccess: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if workshop is currently open based on game time
 */
export function isWorkshopOpen(
  workshop: WorkshopBuilding,
  currentHour: number = new Date().getHours()
): boolean {
  if (workshop.operatingHours.alwaysOpen) {
    return true;
  }

  const { open, close } = workshop.operatingHours;

  // Handle cases where closing time is after midnight
  if (close < open) {
    return currentHour >= open || currentHour < close;
  }

  return currentHour >= open && currentHour < close;
}

// ============================================================================
// WORKSHOP ACCESS
// ============================================================================

/**
 * Request access to a workshop
 */
export async function requestWorkshopAccess(
  request: WorkshopAccessRequest,
  character: {
    level: number;
    reputation: Record<string, number>;
    faction?: string;
    completedQuests: string[];
    gold: number;
    inventory: { itemId: string }[];
  }
): Promise<WorkshopAccessResponse> {
  const workshop = getWorkshop(request.workshopId);

  if (!workshop) {
    return {
      success: false,
      workshopId: request.workshopId,
      accessGranted: false,
      message: 'Workshop not found'
    };
  }

  // Validate access requirements
  const validation = validateWorkshopAccess(workshop, character);

  if (!validation.canAccess) {
    return {
      success: false,
      workshopId: request.workshopId,
      accessGranted: false,
      message: validation.errors.join(', '),
      restrictions: validation.errors
    };
  }

  // Calculate cost
  let cost = 0;
  let expiresAt: Date | undefined;

  if (request.membershipType) {
    // Membership purchase
    const membership = workshop.membershipOptions?.find(
      m => m.type === request.membershipType
    );

    if (!membership) {
      return {
        success: false,
        workshopId: request.workshopId,
        accessGranted: false,
        message: 'Membership type not available'
      };
    }

    cost = membership.cost;
    expiresAt = calculateMembershipExpiration(request.membershipType);
  } else if (request.duration) {
    // Hourly rental
    if (!workshop.rentalCost) {
      return {
        success: false,
        workshopId: request.workshopId,
        accessGranted: false,
        message: 'Hourly rental not available at this workshop'
      };
    }

    cost = workshop.rentalCost * request.duration;
    expiresAt = new Date(Date.now() + request.duration * 60 * 60 * 1000);
  }

  // Check if character has enough gold
  if (cost > 0 && character.gold < cost) {
    return {
      success: false,
      workshopId: request.workshopId,
      accessGranted: false,
      message: `Insufficient funds. Required: $${cost}, you have: $${character.gold}`,
      cost
    };
  }

  return {
    success: true,
    workshopId: request.workshopId,
    accessGranted: true,
    message: cost > 0
      ? `Access granted! $${cost} has been charged.`
      : 'Access granted!',
    cost,
    expiresAt,
    restrictions: validation.warnings
  };
}

/**
 * Calculate membership expiration date
 */
function calculateMembershipExpiration(
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Date {
  const now = new Date();

  switch (type) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'yearly':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
}

// ============================================================================
// WORKSHOP QUERIES
// ============================================================================

/**
 * Find workshops that support a specific profession
 */
export function findWorkshopsForProfession(
  profession: ProfessionId,
  options?: {
    minTier?: number;
    location?: GameLocation;
    accessibleBy?: {
      level: number;
      reputation: Record<string, number>;
      faction?: string;
      completedQuests: string[];
      gold: number;
      inventory: { itemId: string }[];
    };
  }
): WorkshopBuilding[] {
  let workshops = getWorkshopsByProfession(profession);

  // Filter by tier
  if (options?.minTier) {
    workshops = workshops.filter(w => w.tier >= options.minTier!);
  }

  // Filter by location
  if (options?.location) {
    workshops = workshops.filter(w => w.locationId === options.location);
  }

  // Filter by accessibility
  if (options?.accessibleBy) {
    workshops = workshops.filter(w => {
      const validation = validateWorkshopAccess(w, options.accessibleBy!);
      return validation.canAccess;
    });
  }

  return workshops;
}

/**
 * Get all workshops at a location
 */
export function getLocationWorkshops(location: GameLocation): WorkshopBuilding[] {
  return getWorkshopsByLocation(location);
}

/**
 * Find the best workshop for a profession (highest tier accessible)
 */
export function findBestWorkshop(
  profession: ProfessionId,
  character: {
    level: number;
    reputation: Record<string, number>;
    faction?: string;
    completedQuests: string[];
    gold: number;
    inventory: { itemId: string }[];
  }
): WorkshopBuilding | null {
  const accessibleWorkshops = findWorkshopsForProfession(profession, {
    accessibleBy: character
  });

  if (accessibleWorkshops.length === 0) {
    return null;
  }

  // Sort by tier (descending) and return highest
  return accessibleWorkshops.sort((a, b) => b.tier - a.tier)[0];
}

/**
 * Get workshop recommendations for a character
 */
export function getWorkshopRecommendations(
  character: {
    level: number;
    totalLevel?: number;  // New Total Level system
    reputation: Record<string, number>;
    faction?: string;
    completedQuests: string[];
    gold: number;
    inventory: { itemId: string }[];
    professions?: ProfessionId[];
  }
): {
  available: WorkshopBuilding[];
  upcoming: { workshop: WorkshopBuilding; requirements: string[] }[];
} {
  const available: WorkshopBuilding[] = [];
  const upcoming: { workshop: WorkshopBuilding; requirements: string[] }[] = [];

  const professionsToCheck = character.professions || Object.values(ProfessionId);

  for (const profession of professionsToCheck) {
    const workshops = getWorkshopsByProfession(profession);

    for (const workshop of workshops) {
      const validation = validateWorkshopAccess(workshop, character);

      if (validation.canAccess) {
        if (!available.some(w => w.id === workshop.id)) {
          available.push(workshop);
        }
      } else {
        // Check if requirements are close to being met (use Total Level)
        const levelReq = workshop.accessRequirements?.find(r => r.type === 'level');
        const effectiveLevelCheck = Math.floor((character.totalLevel || 30) / 10);
        if (levelReq && (effectiveLevelCheck >= (levelReq.value as number) - 5)) {
          upcoming.push({
            workshop,
            requirements: validation.errors
          });
        }
      }
    }
  }

  // Sort available by tier (descending)
  available.sort((a, b) => b.tier - a.tier);

  return { available, upcoming };
}

// ============================================================================
// WORKSHOP SESSION MANAGEMENT
// ============================================================================

/**
 * Create an active workshop session
 */
export function createWorkshopSession(
  workshopId: string,
  characterId: ObjectId,
  options?: {
    duration?: number;
    membershipType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }
): ActiveWorkshopSession {
  const session: ActiveWorkshopSession = {
    workshopId,
    characterId,
    startTime: new Date(),
    facilitiesUsed: [],
    totalCost: 0
  };

  if (options?.membershipType) {
    session.membership = {
      type: options.membershipType,
      expiresAt: calculateMembershipExpiration(options.membershipType)
    };
  } else if (options?.duration) {
    session.endTime = new Date(Date.now() + options.duration * 60 * 60 * 1000);
  }

  return session;
}

/**
 * Check if a session is still valid
 */
export function isSessionValid(session: ActiveWorkshopSession): boolean {
  const now = new Date();

  // Check membership expiration
  if (session.membership) {
    return now < session.membership.expiresAt;
  }

  // Check time-based expiration
  if (session.endTime) {
    return now < session.endTime;
  }

  // If no expiration, session is always valid
  return true;
}

/**
 * Calculate cost for a session
 */
export function calculateSessionCost(
  workshop: WorkshopBuilding,
  duration: number
): number {
  if (!workshop.rentalCost) {
    return 0;
  }

  return workshop.rentalCost * duration;
}

// ============================================================================
// WORKSHOP STATS AND INFORMATION
// ============================================================================

/**
 * Get comprehensive workshop information
 */
export function getWorkshopInfo(workshopId: string): {
  workshop: WorkshopBuilding | null;
  isOpen: boolean;
  nextOpening?: number;
  capacity: number;
  facilities: {
    total: number;
    byTier: Record<number, number>;
  };
} | null {
  const workshop = getWorkshop(workshopId);

  if (!workshop) {
    return null;
  }

  const currentHour = new Date().getHours();
  const isOpen = isWorkshopOpen(workshop, currentHour);

  let nextOpening: number | undefined;
  if (!isOpen && !workshop.operatingHours.alwaysOpen) {
    nextOpening = workshop.operatingHours.open;
  }

  const tierCounts: Record<number, number> = {};
  workshop.facilities.forEach(f => {
    tierCounts[f.tier] = (tierCounts[f.tier] || 0) + 1;
  });

  return {
    workshop,
    isOpen,
    nextOpening,
    capacity: workshop.capacity,
    facilities: {
      total: workshop.facilities.length,
      byTier: tierCounts
    }
  };
}

/**
 * Get all workshops summary
 */
export function getAllWorkshopsSummary(): {
  total: number;
  byLocation: Record<string, number>;
  byProfession: Record<string, number>;
  byTier: Record<number, number>;
} {
  const { ALL_WORKSHOPS } = require('../data/workshops');

  const summary = {
    total: ALL_WORKSHOPS.length,
    byLocation: {} as Record<string, number>,
    byProfession: {} as Record<string, number>,
    byTier: {} as Record<number, number>
  };

  ALL_WORKSHOPS.forEach((workshop: WorkshopBuilding) => {
    // Count by location
    summary.byLocation[workshop.locationId] =
      (summary.byLocation[workshop.locationId] || 0) + 1;

    // Count by profession
    summary.byProfession[workshop.professionSupported] =
      (summary.byProfession[workshop.professionSupported] || 0) + 1;

    // Count by tier
    summary.byTier[workshop.tier] =
      (summary.byTier[workshop.tier] || 0) + 1;
  });

  return summary;
}

// Export all functions
export default {
  validateWorkshopAccess,
  isWorkshopOpen,
  requestWorkshopAccess,
  findWorkshopsForProfession,
  getLocationWorkshops,
  findBestWorkshop,
  getWorkshopRecommendations,
  createWorkshopSession,
  isSessionValid,
  calculateSessionCost,
  getWorkshopInfo,
  getAllWorkshopsSummary
};
