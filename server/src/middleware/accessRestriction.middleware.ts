/**
 * Access Restriction Middleware
 * Validates character access to buildings based on requirements
 */

import { Request, Response, NextFunction } from 'express';
import { ICharacter } from '../models/Character.model';
import { LocationRequirements } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

export interface AccessCheckResult {
  canAccess: boolean;
  reason?: string;
  canBribe?: boolean;
  bribeCost?: number;
}

/**
 * Check all access requirements for a building
 */
export function checkBuildingAccess(
  character: ICharacter,
  requirements: LocationRequirements | undefined,
  operatingHours?: { open: number; close: number },
  currentHour?: number
): AccessCheckResult {
  // No requirements = always accessible
  if (!requirements) {
    // Still check operating hours
    if (operatingHours && currentHour !== undefined) {
      const isOpen = isWithinOperatingHours(operatingHours, currentHour);
      if (!isOpen) {
        return {
          canAccess: false,
          reason: `Closed. Opens at ${operatingHours.open}:00`,
        };
      }
    }
    return { canAccess: true };
  }

  // Check operating hours first
  if (operatingHours && currentHour !== undefined) {
    const isOpen = isWithinOperatingHours(operatingHours, currentHour);
    if (!isOpen) {
      return {
        canAccess: false,
        reason: `Closed. Opens at ${operatingHours.open}:00`,
      };
    }
  }

  // Level check
  if (requirements.minLevel && character.level < requirements.minLevel) {
    return {
      canAccess: false,
      reason: `Requires level ${requirements.minLevel}`,
    };
  }

  // Wanted level check (for law-abiding buildings)
  const effectiveWantedLevel = getEffectiveWantedLevel(character);
  if (requirements.maxWanted !== undefined && effectiveWantedLevel > requirements.maxWanted) {
    return {
      canAccess: false,
      reason: `Wanted level too high (max ${requirements.maxWanted})`,
      canBribe: true,
      bribeCost: calculateBribeCost(effectiveWantedLevel, requirements.maxWanted),
    };
  }

  // Criminal reputation check (for outlaw buildings)
  if (requirements.minCriminalRep !== undefined && character.criminalReputation < requirements.minCriminalRep) {
    return {
      canAccess: false,
      reason: `Requires criminal reputation ${requirements.minCriminalRep}+`,
    };
  }

  // Faction reputation check
  if (requirements.faction && requirements.factionStanding) {
    const factionRep = getFactionReputation(character, requirements.faction);
    const requiredRep = getReputationThreshold(requirements.factionStanding);

    if (factionRep < requiredRep) {
      return {
        canAccess: false,
        reason: `Requires ${requirements.factionStanding} standing with ${requirements.faction}`,
      };
    }
  }

  // Gang membership check
  if (requirements.gangMember && !character.gangId) {
    return {
      canAccess: false,
      reason: 'Gang members only',
    };
  }

  // Required items check
  if (requirements.requiredItems && requirements.requiredItems.length > 0) {
    const hasAllItems = requirements.requiredItems.every((itemId) =>
      character.inventory.some((inv) => inv.itemId === itemId && inv.quantity > 0)
    );
    if (!hasAllItems) {
      return {
        canAccess: false,
        reason: 'Missing required items',
      };
    }
  }

  // Required skills check
  if (requirements.requiredSkills && requirements.requiredSkills.length > 0) {
    const hasAllSkills = requirements.requiredSkills.every((req) => {
      const skill = character.skills.find((s) => s.skillId === req.skillId);
      return skill && skill.level >= req.level;
    });
    if (!hasAllSkills) {
      return {
        canAccess: false,
        reason: 'Missing required skills',
      };
    }
  }

  return { canAccess: true };
}

/**
 * Check if current time is within operating hours
 */
function isWithinOperatingHours(
  hours: { open: number; close: number },
  currentHour: number
): boolean {
  // Handle overnight hours (e.g., open: 22, close: 6)
  if (hours.close < hours.open) {
    return currentHour >= hours.open || currentHour < hours.close;
  }
  return currentHour >= hours.open && currentHour < hours.close;
}

/**
 * Get effective wanted level (considering disguises)
 */
function getEffectiveWantedLevel(character: ICharacter): number {
  // Check if character has active disguise
  if (character.currentDisguise && character.disguiseExpiresAt) {
    const now = new Date();
    if (character.disguiseExpiresAt > now) {
      // Disguise reduces effective wanted level by 2
      return Math.max(0, character.wantedLevel - 2);
    }
  }
  return character.wantedLevel;
}

/**
 * Get faction reputation value
 */
function getFactionReputation(character: ICharacter, faction: string): number {
  switch (faction.toLowerCase()) {
    case 'settler':
    case 'settleralliance':
      return character.factionReputation?.settlerAlliance || 0;
    case 'nahi':
    case 'nahicoalition':
      return character.factionReputation?.nahiCoalition || 0;
    case 'frontera':
      return character.factionReputation?.frontera || 0;
    default:
      return 0;
  }
}

/**
 * Get reputation threshold for standing
 */
function getReputationThreshold(standing: string): number {
  switch (standing) {
    case 'hostile':
      return -100;
    case 'unfriendly':
      return -50;
    case 'neutral':
      return 0;
    case 'friendly':
      return 25;
    case 'honored':
      return 75;
    default:
      return 0;
  }
}

/**
 * Calculate bribe cost based on wanted level
 */
function calculateBribeCost(wantedLevel: number, maxAllowed: number): number {
  const difference = wantedLevel - maxAllowed;
  // Base cost 50 gold per wanted level over limit
  return difference * 50 + (difference * difference * 10);
}

/**
 * Middleware to validate building access
 * Attaches accessCheck result to request
 */
export function validateBuildingAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const character = (req as any).character as ICharacter;
  const building = (req as any).building;

  if (!character || !building) {
    return next();
  }

  const currentHour = new Date().getHours();
  const accessCheck = checkBuildingAccess(
    character,
    building.requirements,
    building.operatingHours,
    currentHour
  );

  (req as any).accessCheck = accessCheck;
  next();
}

/**
 * Calculate danger encounter chance
 */
export function calculateDangerChance(
  dangerLevel: number,
  currentHour: number,
  wantedLevel: number
): number {
  // Base chance from danger level (0-10%)
  let chance = dangerLevel;

  // Night time increases danger (10pm - 6am)
  if (currentHour >= 22 || currentHour < 6) {
    chance *= 1.5;
  }

  // Wanted level increases encounters
  chance += wantedLevel * 2;

  // Cap at 50%
  return Math.min(50, chance);
}

/**
 * Roll for random encounter
 */
export function rollForEncounter(chance: number): boolean {
  return SecureRNG.d100() < chance;
}

export default {
  checkBuildingAccess,
  validateBuildingAccess,
  calculateDangerChance,
  rollForEncounter,
};
