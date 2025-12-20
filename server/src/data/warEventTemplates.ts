/**
 * War Event Templates
 *
 * Pre-configured templates for different war event types
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import { WarEventType, WarEventTemplate } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Skirmish templates (small, frequent)
 */
export const SKIRMISH_TEMPLATES: WarEventTemplate[] = [
  {
    id: 'border_patrol_clash',
    eventType: WarEventType.SKIRMISH,
    name: 'Border Patrol Clash',
    description: 'Rival faction patrols have encountered each other at the border. Tensions are high and conflict is inevitable.',
    lore: 'The borderlands have always been contested. When patrols meet, old grudges flare up.',

    durationHours: 4,
    announcementHours: 2,
    mobilizationHours: 1,

    minParticipants: 5,
    maxParticipants: 20,
    minLevel: 10,

    territoryTypes: ['border', 'wilderness'],

    primaryObjectiveCount: 2,
    secondaryObjectiveCount: 2,
    bonusObjectiveCount: 1,

    victoryGoldMultiplier: 1.2,
    victoryXpMultiplier: 1.3,
    participationGoldBase: 50,
    participationXpBase: 100,
    mvpBonusMultiplier: 2,

    victoryInfluenceGain: 7,
    defeatInfluenceLoss: 3,

    cooldownHours: 6,
    spawnChance: 0.7,
  },
  {
    id: 'supply_raid',
    eventType: WarEventType.SKIRMISH,
    name: 'Supply Raid',
    description: 'Intelligence reports indicate an enemy supply convoy is moving through the region. Strike fast and disrupt their logistics.',
    lore: 'Wars are won by cutting off your enemy\'s supplies. Every convoy destroyed is a small victory.',

    durationHours: 3,
    announcementHours: 1,
    mobilizationHours: 0.5,

    minParticipants: 5,
    maxParticipants: 15,
    minLevel: 8,

    territoryTypes: ['road', 'wilderness', 'mountain'],

    primaryObjectiveCount: 2,
    secondaryObjectiveCount: 1,
    bonusObjectiveCount: 2,

    victoryGoldMultiplier: 1.5,
    victoryXpMultiplier: 1.2,
    participationGoldBase: 75,
    participationXpBase: 80,
    mvpBonusMultiplier: 2,

    victoryInfluenceGain: 5,
    defeatInfluenceLoss: 2,

    cooldownHours: 8,
    spawnChance: 0.6,
  },
  {
    id: 'reconnaissance_mission',
    eventType: WarEventType.SKIRMISH,
    name: 'Reconnaissance Mission',
    description: 'Scout enemy positions and gather intelligence while preventing them from doing the same.',
    lore: 'Knowledge is power. The faction that sees the battlefield clearly wins the war.',

    durationHours: 5,
    announcementHours: 3,
    mobilizationHours: 1,

    minParticipants: 8,
    maxParticipants: 20,
    minLevel: 12,

    territoryTypes: ['all'],

    primaryObjectiveCount: 3,
    secondaryObjectiveCount: 2,
    bonusObjectiveCount: 1,

    victoryGoldMultiplier: 1.1,
    victoryXpMultiplier: 1.4,
    participationGoldBase: 40,
    participationXpBase: 120,
    mvpBonusMultiplier: 2,

    victoryInfluenceGain: 6,
    defeatInfluenceLoss: 3,

    cooldownHours: 12,
    spawnChance: 0.5,
  },
];

/**
 * Battle templates (medium, weekly)
 */
export const BATTLE_TEMPLATES: WarEventTemplate[] = [
  {
    id: 'fort_assault',
    eventType: WarEventType.BATTLE,
    name: 'Fort Assault',
    description: 'Launch a coordinated assault on an enemy-held fort. Breaking their defenses will shift the balance of power.',
    lore: 'Forts represent the might and determination of a faction. Taking one sends a message.',

    durationHours: 18,
    announcementHours: 24,
    mobilizationHours: 2,

    minParticipants: 20,
    maxParticipants: 50,
    minLevel: 15,

    territoryTypes: ['fort', 'town', 'stronghold'],

    primaryObjectiveCount: 4,
    secondaryObjectiveCount: 3,
    bonusObjectiveCount: 2,

    victoryGoldMultiplier: 2.0,
    victoryXpMultiplier: 2.5,
    participationGoldBase: 150,
    participationXpBase: 300,
    mvpBonusMultiplier: 3,

    victoryInfluenceGain: 15,
    defeatInfluenceLoss: 8,

    cooldownHours: 48,
    spawnChance: 0.4,
  },
  {
    id: 'town_takeover',
    eventType: WarEventType.BATTLE,
    name: 'Town Takeover',
    description: 'Seize control of a strategic town. Capture key locations and win over the population.',
    lore: 'Towns are the heart of the frontier. Control the towns, control the territory.',

    durationHours: 20,
    announcementHours: 36,
    mobilizationHours: 2,

    minParticipants: 25,
    maxParticipants: 50,
    minLevel: 18,

    territoryTypes: ['town', 'settlement'],

    primaryObjectiveCount: 5,
    secondaryObjectiveCount: 3,
    bonusObjectiveCount: 3,

    victoryGoldMultiplier: 2.2,
    victoryXpMultiplier: 2.0,
    participationGoldBase: 200,
    participationXpBase: 250,
    mvpBonusMultiplier: 3,

    victoryInfluenceGain: 18,
    defeatInfluenceLoss: 9,

    cooldownHours: 72,
    spawnChance: 0.35,
  },
  {
    id: 'railway_sabotage',
    eventType: WarEventType.BATTLE,
    name: 'Railway Sabotage',
    description: 'Disrupt enemy supply lines by targeting critical railway infrastructure. Engineers vs. defenders.',
    lore: 'The railroad brought civilization to the frontier. It can also be its undoing.',

    durationHours: 16,
    announcementHours: 24,
    mobilizationHours: 2,

    minParticipants: 20,
    maxParticipants: 45,
    minLevel: 16,

    territoryTypes: ['railway', 'industrial'],

    primaryObjectiveCount: 3,
    secondaryObjectiveCount: 4,
    bonusObjectiveCount: 2,

    victoryGoldMultiplier: 1.8,
    victoryXpMultiplier: 2.2,
    participationGoldBase: 180,
    participationXpBase: 280,
    mvpBonusMultiplier: 3,

    victoryInfluenceGain: 14,
    defeatInfluenceLoss: 7,

    cooldownHours: 60,
    spawnChance: 0.3,
  },
];

/**
 * Campaign templates (large, monthly)
 */
export const CAMPAIGN_TEMPLATES: WarEventTemplate[] = [
  {
    id: 'territory_invasion',
    eventType: WarEventType.CAMPAIGN,
    name: 'Territory Invasion',
    description: 'A massive invasion force seeks to conquer an entire territory. All hands on deck for this week-long struggle.',
    lore: 'Some conflicts define generations. This is one of them. The outcome will reshape the frontier.',

    durationHours: 120, // 5 days
    announcementHours: 48,
    mobilizationHours: 3,

    minParticipants: 50,
    maxParticipants: 200,
    minLevel: 20,

    territoryTypes: ['all'],

    primaryObjectiveCount: 8,
    secondaryObjectiveCount: 6,
    bonusObjectiveCount: 4,

    victoryGoldMultiplier: 3.5,
    victoryXpMultiplier: 4.0,
    participationGoldBase: 500,
    participationXpBase: 800,
    mvpBonusMultiplier: 5,

    victoryInfluenceGain: 30,
    defeatInfluenceLoss: 15,

    cooldownHours: 336, // 2 weeks
    spawnChance: 0.2,
  },
  {
    id: 'faction_offensive',
    eventType: WarEventType.CAMPAIGN,
    name: 'Faction Offensive',
    description: 'Launch a coordinated multi-territory offensive. Victory here could change the entire power structure.',
    lore: 'When factions commit everything to one decisive push, legends are born.',

    durationHours: 96, // 4 days
    announcementHours: 48,
    mobilizationHours: 3,

    minParticipants: 60,
    maxParticipants: 150,
    minLevel: 22,

    territoryTypes: ['all'],

    primaryObjectiveCount: 7,
    secondaryObjectiveCount: 5,
    bonusObjectiveCount: 5,

    victoryGoldMultiplier: 3.0,
    victoryXpMultiplier: 3.5,
    participationGoldBase: 400,
    participationXpBase: 700,
    mvpBonusMultiplier: 4,

    victoryInfluenceGain: 25,
    defeatInfluenceLoss: 12,

    cooldownHours: 240,
    spawnChance: 0.25,
  },
];

/**
 * War templates (epic, rare)
 */
export const WAR_TEMPLATES: WarEventTemplate[] = [
  {
    id: 'sangre_civil_war',
    eventType: WarEventType.WAR,
    name: 'Sangre Civil War',
    description: 'The tensions have finally erupted into full-scale war. Every faction must choose a side. The frontier will never be the same.',
    lore: 'History will remember this war. Children will ask their grandparents which side they fought on.',

    durationHours: 240, // 10 days
    announcementHours: 72,
    mobilizationHours: 4,

    minParticipants: 100,
    maxParticipants: 1000,
    minLevel: 25,

    territoryTypes: ['all'],

    primaryObjectiveCount: 12,
    secondaryObjectiveCount: 10,
    bonusObjectiveCount: 8,

    victoryGoldMultiplier: 5.0,
    victoryXpMultiplier: 6.0,
    participationGoldBase: 1000,
    participationXpBase: 2000,
    mvpBonusMultiplier: 10,

    victoryInfluenceGain: 50,
    defeatInfluenceLoss: 25,

    cooldownHours: 2160, // 90 days
    spawnChance: 0.05,
  },
  {
    id: 'foreign_invasion',
    eventType: WarEventType.WAR,
    name: 'Foreign Invasion',
    description: 'An outside force threatens the entire frontier. Old enemies must become allies to survive.',
    lore: 'When faced with extinction, even the bitterest rivals find common ground.',

    durationHours: 288, // 12 days
    announcementHours: 96,
    mobilizationHours: 4,

    minParticipants: 150,
    maxParticipants: 1000,
    minLevel: 30,

    territoryTypes: ['all'],

    primaryObjectiveCount: 15,
    secondaryObjectiveCount: 12,
    bonusObjectiveCount: 10,

    victoryGoldMultiplier: 6.0,
    victoryXpMultiplier: 7.0,
    participationGoldBase: 1500,
    participationXpBase: 2500,
    mvpBonusMultiplier: 12,

    victoryInfluenceGain: 60,
    defeatInfluenceLoss: 30,

    cooldownHours: 4320, // 180 days
    spawnChance: 0.02,
  },
];

/**
 * Get all templates by type
 */
export function getTemplatesByType(eventType: WarEventType): WarEventTemplate[] {
  switch (eventType) {
    case WarEventType.SKIRMISH:
      return SKIRMISH_TEMPLATES;
    case WarEventType.BATTLE:
      return BATTLE_TEMPLATES;
    case WarEventType.CAMPAIGN:
      return CAMPAIGN_TEMPLATES;
    case WarEventType.WAR:
      return WAR_TEMPLATES;
    default:
      return [];
  }
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): WarEventTemplate | undefined {
  const allTemplates = [
    ...SKIRMISH_TEMPLATES,
    ...BATTLE_TEMPLATES,
    ...CAMPAIGN_TEMPLATES,
    ...WAR_TEMPLATES,
  ];
  return allTemplates.find(t => t.id === templateId);
}

/**
 * Get random template by type
 */
export function getRandomTemplate(eventType: WarEventType): WarEventTemplate | undefined {
  const templates = getTemplatesByType(eventType);
  if (templates.length === 0) return undefined;
  return SecureRNG.select(templates);
}
