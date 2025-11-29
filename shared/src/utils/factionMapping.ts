/**
 * Faction Type Mapping Utilities
 *
 * Handles mapping and conversion between different faction type systems:
 * - TerritoryFactionId (enum): The primary faction system for territory control
 * - ActionFactionId (enum): Faction IDs used in action influence mapping
 * - Faction (enum): Character faction from character.types
 */

import { TerritoryFactionId } from '../types/territoryWar.types';
import { ActionFactionId } from '../types/actionEffects.types';
import { Faction } from '../types/character.types';

/**
 * Map ActionFactionId to TerritoryFactionId
 * Returns null for ActionFactionIds that don't have a territory equivalent
 */
export function actionFactionToTerritoryFaction(
  actionFaction: ActionFactionId
): TerritoryFactionId | null {
  const mapping: Partial<Record<ActionFactionId, TerritoryFactionId>> = {
    [ActionFactionId.SETTLER_ALLIANCE]: TerritoryFactionId.SETTLER_ALLIANCE,
    [ActionFactionId.SETTLER]: TerritoryFactionId.SETTLER_ALLIANCE,
    [ActionFactionId.NAHI_COALITION]: TerritoryFactionId.NAHI_COALITION,
    [ActionFactionId.NATIVE]: TerritoryFactionId.NAHI_COALITION,
    [ActionFactionId.FRONTERA_CARTEL]: TerritoryFactionId.FRONTERA_CARTEL,
    [ActionFactionId.FRONTERA]: TerritoryFactionId.FRONTERA_CARTEL,
    [ActionFactionId.MILITARY]: TerritoryFactionId.US_MILITARY,
    [ActionFactionId.RAILROAD_CORP]: TerritoryFactionId.RAILROAD_BARONS,
    [ActionFactionId.OUTLAW_FACTION]: TerritoryFactionId.INDEPENDENT_OUTLAWS,
  };

  return mapping[actionFaction] || null;
}

/**
 * Map TerritoryFactionId to ActionFactionId
 * Returns null for TerritoryFactionIds that don't have an action equivalent
 */
export function territoryFactionToActionFaction(
  territoryFaction: TerritoryFactionId
): ActionFactionId | null {
  const mapping: Partial<Record<TerritoryFactionId, ActionFactionId>> = {
    [TerritoryFactionId.SETTLER_ALLIANCE]: ActionFactionId.SETTLER_ALLIANCE,
    [TerritoryFactionId.NAHI_COALITION]: ActionFactionId.NAHI_COALITION,
    [TerritoryFactionId.FRONTERA_CARTEL]: ActionFactionId.FRONTERA_CARTEL,
    [TerritoryFactionId.US_MILITARY]: ActionFactionId.MILITARY,
    [TerritoryFactionId.RAILROAD_BARONS]: ActionFactionId.RAILROAD_CORP,
    [TerritoryFactionId.INDEPENDENT_OUTLAWS]: ActionFactionId.OUTLAW_FACTION,
  };

  return mapping[territoryFaction] || null;
}

/**
 * Map Character Faction to TerritoryFactionId
 */
export function characterFactionToTerritoryFaction(
  characterFaction: Faction
): TerritoryFactionId {
  const mapping: Record<Faction, TerritoryFactionId> = {
    [Faction.SETTLER_ALLIANCE]: TerritoryFactionId.SETTLER_ALLIANCE,
    [Faction.NAHI_COALITION]: TerritoryFactionId.NAHI_COALITION,
    [Faction.FRONTERA]: TerritoryFactionId.FRONTERA_CARTEL,
  };

  return mapping[characterFaction];
}

/**
 * Map TerritoryFactionId to Character Faction
 * Returns null for NPC-only factions (US_MILITARY, RAILROAD_BARONS, INDEPENDENT_OUTLAWS)
 */
export function territoryFactionToCharacterFaction(
  territoryFaction: TerritoryFactionId
): Faction | null {
  const mapping: Partial<Record<TerritoryFactionId, Faction>> = {
    [TerritoryFactionId.SETTLER_ALLIANCE]: Faction.SETTLER_ALLIANCE,
    [TerritoryFactionId.NAHI_COALITION]: Faction.NAHI_COALITION,
    [TerritoryFactionId.FRONTERA_CARTEL]: Faction.FRONTERA,
  };

  return mapping[territoryFaction] || null;
}

/**
 * Type guard: Check if ActionFactionId can be converted to TerritoryFactionId
 */
export function isActionFactionMappableToTerritory(
  actionFaction: ActionFactionId
): boolean {
  return actionFactionToTerritoryFaction(actionFaction) !== null;
}

/**
 * Type guard: Check if TerritoryFactionId is a playable faction
 */
export function isPlayableFaction(territoryFaction: TerritoryFactionId): boolean {
  return territoryFactionToCharacterFaction(territoryFaction) !== null;
}

/**
 * Get all playable TerritoryFactionIds
 */
export function getPlayableFactions(): TerritoryFactionId[] {
  return [
    TerritoryFactionId.SETTLER_ALLIANCE,
    TerritoryFactionId.NAHI_COALITION,
    TerritoryFactionId.FRONTERA_CARTEL,
  ];
}

/**
 * Get all NPC-only TerritoryFactionIds
 */
export function getNPCOnlyFactions(): TerritoryFactionId[] {
  return [
    TerritoryFactionId.US_MILITARY,
    TerritoryFactionId.RAILROAD_BARONS,
    TerritoryFactionId.INDEPENDENT_OUTLAWS,
  ];
}

/**
 * Get all TerritoryFactionIds
 */
export function getAllTerritoryFactions(): TerritoryFactionId[] {
  return Object.values(TerritoryFactionId);
}
