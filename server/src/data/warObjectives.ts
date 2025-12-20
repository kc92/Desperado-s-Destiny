/**
 * War Objectives Data
 *
 * Objective templates for faction war events
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import {
  WarObjectiveType,
  ObjectivePriority,
  WarObjectiveTemplate,
} from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Combat objective templates
 */
export const COMBAT_OBJECTIVES: WarObjectiveTemplate[] = [
  {
    id: 'kill_enemy_npcs',
    type: WarObjectiveType.KILL_NPCS,
    priority: ObjectivePriority.PRIMARY,
    name: 'Eliminate Enemy Forces',
    description: 'Defeat enemy faction NPCs in the combat zone',
    defaultTarget: 50,
    defaultPoints: 2,
    defaultBonus: 100,
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'win_duels',
    type: WarObjectiveType.WIN_DUELS,
    priority: ObjectivePriority.PRIMARY,
    name: 'Defeat Enemy Champions',
    description: 'Win duels against enemy players to prove your faction\'s might',
    defaultTarget: 20,
    defaultPoints: 5,
    defaultBonus: 150,
    minLevel: 15,
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'defend_location',
    type: WarObjectiveType.DEFEND_LOCATION,
    priority: ObjectivePriority.PRIMARY,
    name: 'Hold the Line',
    description: 'Defend the strategic location against enemy assault',
    defaultTarget: 60, // minutes
    defaultPoints: 10,
    defaultBonus: 500,
    timeLimit: 120,
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'escort_convoy',
    type: WarObjectiveType.ESCORT_CONVOY,
    priority: ObjectivePriority.SECONDARY,
    name: 'Protect the Supply Convoy',
    description: 'Safely escort supply wagons through enemy territory',
    defaultTarget: 5, // wagons
    defaultPoints: 20,
    defaultBonus: 200,
    timeLimit: 90,
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'assassinate_commander',
    type: WarObjectiveType.ASSASSINATE_COMMANDER,
    priority: ObjectivePriority.BONUS,
    name: 'Eliminate Enemy Commander',
    description: 'Track down and eliminate the enemy field commander',
    defaultTarget: 1,
    defaultPoints: 500,
    defaultBonus: 1000,
    minLevel: 20,
    requiredSkills: ['stealth', 'combat'],
    scaleWithParticipants: false,
    scaleWithEventType: false,
  },
  {
    id: 'eliminate_squad',
    type: WarObjectiveType.ELIMINATE_SQUAD,
    priority: ObjectivePriority.SECONDARY,
    name: 'Destroy Elite Squad',
    description: 'Defeat a well-armed enemy elite squad',
    defaultTarget: 15, // elite NPCs
    defaultPoints: 10,
    defaultBonus: 300,
    minLevel: 18,
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'break_siege',
    type: WarObjectiveType.BREAK_SIEGE,
    priority: ObjectivePriority.PRIMARY,
    name: 'Break the Siege',
    description: 'Break through enemy lines and relieve the besieged position',
    defaultTarget: 100, // enemies defeated
    defaultPoints: 3,
    defaultBonus: 400,
    timeLimit: 120,
    minLevel: 16,
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
];

/**
 * Strategic objective templates
 */
export const STRATEGIC_OBJECTIVES: WarObjectiveTemplate[] = [
  {
    id: 'capture_strategic_point',
    type: WarObjectiveType.CAPTURE_POINT,
    priority: ObjectivePriority.PRIMARY,
    name: 'Capture Strategic Point',
    description: 'Seize and hold the strategic location for your faction',
    defaultTarget: 30, // minutes held
    defaultPoints: 15,
    defaultBonus: 600,
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'destroy_supply_cache',
    type: WarObjectiveType.DESTROY_SUPPLIES,
    priority: ObjectivePriority.SECONDARY,
    name: 'Destroy Enemy Supplies',
    description: 'Locate and destroy enemy supply caches',
    defaultTarget: 10, // caches
    defaultPoints: 30,
    defaultBonus: 250,
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'cut_communications',
    type: WarObjectiveType.CUT_COMMUNICATIONS,
    priority: ObjectivePriority.SECONDARY,
    name: 'Sever Communications',
    description: 'Cut enemy telegraph lines and signal stations',
    defaultTarget: 5, // stations
    defaultPoints: 40,
    defaultBonus: 300,
    requiredSkills: ['sabotage'],
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'sabotage_equipment',
    type: WarObjectiveType.SABOTAGE_EQUIPMENT,
    priority: ObjectivePriority.BONUS,
    name: 'Sabotage Enemy Equipment',
    description: 'Disable enemy weapons, vehicles, and artillery',
    defaultTarget: 8, // equipment pieces
    defaultPoints: 50,
    defaultBonus: 400,
    minLevel: 14,
    requiredSkills: ['craft', 'sabotage'],
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'plant_faction_flag',
    type: WarObjectiveType.PLANT_FLAG,
    priority: ObjectivePriority.PRIMARY,
    name: 'Raise Your Colors',
    description: 'Plant your faction flag at the highest point in enemy territory',
    defaultTarget: 1,
    defaultPoints: 200,
    defaultBonus: 500,
    minLevel: 12,
    scaleWithParticipants: false,
    scaleWithEventType: false,
  },
  {
    id: 'secure_bridge',
    type: WarObjectiveType.SECURE_BRIDGE,
    priority: ObjectivePriority.PRIMARY,
    name: 'Secure the Bridge',
    description: 'Control the bridge to enable troop movement',
    defaultTarget: 45, // minutes held
    defaultPoints: 12,
    defaultBonus: 450,
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'infiltrate_base',
    type: WarObjectiveType.INFILTRATE_BASE,
    priority: ObjectivePriority.BONUS,
    name: 'Infiltrate Enemy Base',
    description: 'Sneak into enemy headquarters and gather intelligence',
    defaultTarget: 1,
    defaultPoints: 300,
    defaultBonus: 700,
    minLevel: 18,
    requiredSkills: ['stealth', 'cunning'],
    scaleWithParticipants: false,
    scaleWithEventType: false,
  },
];

/**
 * Support objective templates
 */
export const SUPPORT_OBJECTIVES: WarObjectiveTemplate[] = [
  {
    id: 'heal_wounded_allies',
    type: WarObjectiveType.HEAL_ALLIES,
    priority: ObjectivePriority.SECONDARY,
    name: 'Tend the Wounded',
    description: 'Heal wounded faction members and NPCs',
    defaultTarget: 30, // allies healed
    defaultPoints: 5,
    defaultBonus: 150,
    requiredSkills: ['medicine'],
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'deliver_supplies',
    type: WarObjectiveType.DELIVER_SUPPLIES,
    priority: ObjectivePriority.SECONDARY,
    name: 'Supply Line Reinforcement',
    description: 'Deliver critical supplies to frontline positions',
    defaultTarget: 15, // supply runs
    defaultPoints: 15,
    defaultBonus: 200,
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'scout_enemy_positions',
    type: WarObjectiveType.SCOUT_POSITIONS,
    priority: ObjectivePriority.SECONDARY,
    name: 'Reconnaissance',
    description: 'Scout enemy positions and report troop movements',
    defaultTarget: 20, // locations scouted
    defaultPoints: 10,
    defaultBonus: 180,
    requiredSkills: ['tracking'],
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'spread_propaganda',
    type: WarObjectiveType.SPREAD_PROPAGANDA,
    priority: ObjectivePriority.BONUS,
    name: 'Hearts and Minds',
    description: 'Spread propaganda to demoralize enemies and rally allies',
    defaultTarget: 25, // pamphlets distributed
    defaultPoints: 8,
    defaultBonus: 160,
    requiredSkills: ['persuasion'],
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'recruit_neutral_npcs',
    type: WarObjectiveType.RECRUIT_NPCS,
    priority: ObjectivePriority.SECONDARY,
    name: 'Rally the People',
    description: 'Convince neutral NPCs to join your faction\'s cause',
    defaultTarget: 20, // NPCs recruited
    defaultPoints: 12,
    defaultBonus: 220,
    requiredSkills: ['charisma'],
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
  {
    id: 'fortify_position',
    type: WarObjectiveType.FORTIFY_POSITION,
    priority: ObjectivePriority.SECONDARY,
    name: 'Build Defenses',
    description: 'Construct barricades and defensive structures',
    defaultTarget: 12, // structures built
    defaultPoints: 20,
    defaultBonus: 240,
    requiredSkills: ['craft'],
    scaleWithParticipants: false,
    scaleWithEventType: true,
  },
  {
    id: 'rally_troops',
    type: WarObjectiveType.RALLY_TROOPS,
    priority: ObjectivePriority.BONUS,
    name: 'Inspire the Troops',
    description: 'Boost morale and organize scattered forces',
    defaultTarget: 40, // troops rallied
    defaultPoints: 8,
    defaultBonus: 180,
    requiredSkills: ['leadership'],
    scaleWithParticipants: true,
    scaleWithEventType: true,
  },
];

/**
 * Get all objective templates
 */
export const ALL_OBJECTIVE_TEMPLATES = [
  ...COMBAT_OBJECTIVES,
  ...STRATEGIC_OBJECTIVES,
  ...SUPPORT_OBJECTIVES,
];

/**
 * Get objectives by priority
 */
export function getObjectivesByPriority(priority: ObjectivePriority): WarObjectiveTemplate[] {
  return ALL_OBJECTIVE_TEMPLATES.filter(obj => obj.priority === priority);
}

/**
 * Get objectives by type
 */
export function getObjectivesByType(type: WarObjectiveType): WarObjectiveTemplate[] {
  return ALL_OBJECTIVE_TEMPLATES.filter(obj => obj.type === type);
}

/**
 * Get objective template by ID
 */
export function getObjectiveTemplate(id: string): WarObjectiveTemplate | undefined {
  return ALL_OBJECTIVE_TEMPLATES.find(obj => obj.id === id);
}

/**
 * Get random objectives for a war event
 */
export function selectRandomObjectives(
  priority: ObjectivePriority,
  count: number,
  minLevel?: number
): WarObjectiveTemplate[] {
  let eligible = getObjectivesByPriority(priority);

  // Filter by level requirement
  if (minLevel !== undefined) {
    eligible = eligible.filter(obj => !obj.minLevel || obj.minLevel <= minLevel);
  }

  // Shuffle and select
  const shuffled = SecureRNG.shuffle([...eligible]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Scale objective target based on participants and event type
 */
export function scaleObjectiveTarget(
  template: WarObjectiveTemplate,
  participantCount: number,
  eventTypeMultiplier: number
): number {
  let target = template.defaultTarget;

  // Scale with participants
  if (template.scaleWithParticipants) {
    const participantMultiplier = Math.max(1, Math.floor(participantCount / 10));
    target *= participantMultiplier;
  }

  // Scale with event type
  if (template.scaleWithEventType) {
    target = Math.floor(target * eventTypeMultiplier);
  }

  return Math.max(1, target);
}

/**
 * Get event type multiplier for scaling
 */
export function getEventTypeMultiplier(eventType: string): number {
  switch (eventType) {
    case 'SKIRMISH':
      return 1;
    case 'BATTLE':
      return 2;
    case 'CAMPAIGN':
      return 4;
    case 'WAR':
      return 8;
    default:
      return 1;
  }
}
