/**
 * Action Influence Map
 *
 * Comprehensive mapping of all action types to their influence effects
 * Defines base values, modifiers, and spillover effects
 * Phase 11, Wave 11.1
 */

import {
  ActionCategory,
  ActionInfluenceEffect,
  ActionFactionId,
  FactionSpilloverRule,
  TerritoryVolatility,
  TerritoryVolatilityLevel,
} from '@desperados/shared';

/**
 * All action influence effect definitions
 */
export const ACTION_INFLUENCE_MAP: Record<ActionCategory, ActionInfluenceEffect> = {
  // ============================================================================
  // COMBAT ACTIONS
  // ============================================================================

  [ActionCategory.COMBAT_NPC_KILL]: {
    actionCategory: ActionCategory.COMBAT_NPC_KILL,
    baseInfluence: -5,
    minInfluence: -10,
    maxInfluence: -2,
    primaryFaction: null, // Determined by NPC faction at runtime
    primaryDirection: 'negative',
    secondaryEffects: [],
    description: 'Killing faction NPC reduces their influence',
    diminishingReturns: {
      dailyLimit: 20,
      diminishingAfter: 10,
      diminishingRate: 0.85,
    },
  },

  [ActionCategory.COMBAT_ENEMY_KILL]: {
    actionCategory: ActionCategory.COMBAT_ENEMY_KILL,
    baseInfluence: 5,
    minInfluence: 2,
    maxInfluence: 10,
    primaryFaction: null, // Determined by enemy faction at runtime
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Killing faction enemy increases your faction influence',
    diminishingReturns: {
      dailyLimit: 20,
      diminishingAfter: 8,
      diminishingRate: 0.90,
    },
  },

  [ActionCategory.COMBAT_DUEL_WIN]: {
    actionCategory: ActionCategory.COMBAT_DUEL_WIN,
    baseInfluence: 5,
    minInfluence: 3,
    maxInfluence: 8,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Winning a duel for your faction increases influence',
  },

  [ActionCategory.COMBAT_DEFEND_TERRITORY]: {
    actionCategory: ActionCategory.COMBAT_DEFEND_TERRITORY,
    baseInfluence: 15,
    minInfluence: 10,
    maxInfluence: 20,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Successfully defending territory grants significant influence',
  },

  [ActionCategory.COMBAT_RAID_TERRITORY]: {
    actionCategory: ActionCategory.COMBAT_RAID_TERRITORY,
    baseInfluence: -15,
    minInfluence: -20,
    maxInfluence: -10,
    primaryFaction: null,
    primaryDirection: 'negative',
    secondaryEffects: [],
    description: 'Raiding territory damages defender influence',
  },

  [ActionCategory.COMBAT_BOUNTY_CLAIM]: {
    actionCategory: ActionCategory.COMBAT_BOUNTY_CLAIM,
    baseInfluence: 8,
    minInfluence: 5,
    maxInfluence: 12,
    primaryFaction: ActionFactionId.LAW_ENFORCEMENT,
    primaryDirection: 'positive',
    secondaryEffects: [
      {
        factionId: ActionFactionId.OUTLAW_FACTION,
        influenceMultiplier: -0.30,
        direction: 'negative',
      },
    ],
    description: 'Claiming bounties strengthens law enforcement',
    diminishingReturns: {
      dailyLimit: 10,
      diminishingAfter: 5,
      diminishingRate: 0.88,
    },
  },

  [ActionCategory.COMBAT_ESCORT_MISSION]: {
    actionCategory: ActionCategory.COMBAT_ESCORT_MISSION,
    baseInfluence: 6,
    minInfluence: 4,
    maxInfluence: 10,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Escorting caravans builds faction trust',
  },

  // ============================================================================
  // ECONOMIC ACTIONS
  // ============================================================================

  [ActionCategory.ECONOMIC_FACTION_JOB]: {
    actionCategory: ActionCategory.ECONOMIC_FACTION_JOB,
    baseInfluence: 5,
    minInfluence: 3,
    maxInfluence: 8,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Completing faction jobs builds reputation',
    diminishingReturns: {
      dailyLimit: 15,
      diminishingAfter: 8,
      diminishingRate: 0.92,
    },
  },

  [ActionCategory.ECONOMIC_TRADE]: {
    actionCategory: ActionCategory.ECONOMIC_TRADE,
    baseInfluence: 1, // Per 200 gold traded
    minInfluence: 0.5,
    maxInfluence: 2,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Trading with faction merchants builds economic ties',
  },

  [ActionCategory.ECONOMIC_DONATE]: {
    actionCategory: ActionCategory.ECONOMIC_DONATE,
    baseInfluence: 1, // Per 100 gold donated
    minInfluence: 1,
    maxInfluence: 1,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Direct donations increase faction influence',
    diminishingReturns: {
      dailyLimit: 50, // Can donate a lot
      diminishingAfter: 20,
      diminishingRate: 0.95,
    },
  },

  [ActionCategory.ECONOMIC_SABOTAGE]: {
    actionCategory: ActionCategory.ECONOMIC_SABOTAGE,
    baseInfluence: -10,
    minInfluence: -15,
    maxInfluence: -5,
    primaryFaction: null,
    primaryDirection: 'negative',
    secondaryEffects: [],
    description: 'Economic sabotage weakens rival factions',
  },

  [ActionCategory.ECONOMIC_INVEST]: {
    actionCategory: ActionCategory.ECONOMIC_INVEST,
    baseInfluence: 12,
    minInfluence: 5,
    maxInfluence: 20,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Investing in territory infrastructure boosts influence',
  },

  [ActionCategory.ECONOMIC_MERCHANT_DEAL]: {
    actionCategory: ActionCategory.ECONOMIC_MERCHANT_DEAL,
    baseInfluence: 4,
    minInfluence: 2,
    maxInfluence: 7,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Merchant deals strengthen faction economy',
  },

  [ActionCategory.ECONOMIC_PROPERTY_PURCHASE]: {
    actionCategory: ActionCategory.ECONOMIC_PROPERTY_PURCHASE,
    baseInfluence: 8,
    minInfluence: 5,
    maxInfluence: 15,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Property ownership demonstrates commitment to faction',
  },

  // ============================================================================
  // CRIMINAL ACTIONS
  // ============================================================================

  [ActionCategory.CRIMINAL_ROB_TERRITORY]: {
    actionCategory: ActionCategory.CRIMINAL_ROB_TERRITORY,
    baseInfluence: -3,
    minInfluence: -5,
    maxInfluence: -2,
    primaryFaction: null,
    primaryDirection: 'negative',
    secondaryEffects: [
      {
        factionId: ActionFactionId.OUTLAW_FACTION,
        influenceMultiplier: 0.50, // Crime boosts outlaw faction
        direction: 'positive',
      },
      {
        factionId: ActionFactionId.LAW_ENFORCEMENT,
        influenceMultiplier: 0.25, // Law responds to crime
        direction: 'positive',
      },
    ],
    description: 'Robberies harm territory controller and embolden outlaws',
    diminishingReturns: {
      dailyLimit: 15,
      diminishingAfter: 5,
      diminishingRate: 0.85,
    },
  },

  [ActionCategory.CRIMINAL_SMUGGLE]: {
    actionCategory: ActionCategory.CRIMINAL_SMUGGLE,
    baseInfluence: 7,
    minInfluence: 5,
    maxInfluence: 10,
    primaryFaction: null, // Criminal faction
    primaryDirection: 'positive',
    secondaryEffects: [
      {
        factionId: ActionFactionId.LAW_ENFORCEMENT,
        influenceMultiplier: -0.20,
        direction: 'negative',
      },
    ],
    description: 'Smuggling for criminal factions builds trust',
  },

  [ActionCategory.CRIMINAL_ARREST]: {
    actionCategory: ActionCategory.CRIMINAL_ARREST,
    baseInfluence: 5,
    minInfluence: 3,
    maxInfluence: 8,
    primaryFaction: ActionFactionId.LAW_ENFORCEMENT,
    primaryDirection: 'positive',
    secondaryEffects: [
      {
        factionId: ActionFactionId.OUTLAW_FACTION,
        influenceMultiplier: -0.30,
        direction: 'negative',
      },
    ],
    description: 'Getting arrested ironically strengthens law enforcement presence',
  },

  [ActionCategory.CRIMINAL_BREAKOUT]: {
    actionCategory: ActionCategory.CRIMINAL_BREAKOUT,
    baseInfluence: 10,
    minInfluence: 8,
    maxInfluence: 15,
    primaryFaction: ActionFactionId.OUTLAW_FACTION,
    primaryDirection: 'positive',
    secondaryEffects: [
      {
        factionId: ActionFactionId.LAW_ENFORCEMENT,
        influenceMultiplier: -0.40,
        direction: 'negative',
      },
    ],
    description: 'Breaking out prisoners is a major blow to law and order',
  },

  [ActionCategory.CRIMINAL_PROTECTION_RACKET]: {
    actionCategory: ActionCategory.CRIMINAL_PROTECTION_RACKET,
    baseInfluence: 6,
    minInfluence: 4,
    maxInfluence: 9,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Protection rackets establish criminal control',
  },

  [ActionCategory.CRIMINAL_CONTRABAND]: {
    actionCategory: ActionCategory.CRIMINAL_CONTRABAND,
    baseInfluence: 5,
    minInfluence: 3,
    maxInfluence: 8,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Contraband trade enriches criminal factions',
  },

  [ActionCategory.CRIMINAL_ASSASSINATION]: {
    actionCategory: ActionCategory.CRIMINAL_ASSASSINATION,
    baseInfluence: 15,
    minInfluence: 10,
    maxInfluence: 25,
    primaryFaction: null,
    primaryDirection: 'negative',
    secondaryEffects: [],
    description: 'Assassinations severely damage faction leadership',
  },

  // ============================================================================
  // SOCIAL ACTIONS
  // ============================================================================

  [ActionCategory.SOCIAL_REPUTATION_QUEST]: {
    actionCategory: ActionCategory.SOCIAL_REPUTATION_QUEST,
    baseInfluence: 18,
    minInfluence: 10,
    maxInfluence: 25,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Reputation quests provide major influence gains',
  },

  [ActionCategory.SOCIAL_PROPAGANDA]: {
    actionCategory: ActionCategory.SOCIAL_PROPAGANDA,
    baseInfluence: 5,
    minInfluence: 3,
    maxInfluence: 8,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Spreading propaganda sways public opinion',
    diminishingReturns: {
      dailyLimit: 12,
      diminishingAfter: 6,
      diminishingRate: 0.88,
    },
  },

  [ActionCategory.SOCIAL_RECRUIT]: {
    actionCategory: ActionCategory.SOCIAL_RECRUIT,
    baseInfluence: 10,
    minInfluence: 5,
    maxInfluence: 15,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Recruiting supporters strengthens faction presence',
  },

  [ActionCategory.SOCIAL_BETRAY]: {
    actionCategory: ActionCategory.SOCIAL_BETRAY,
    baseInfluence: -40,
    minInfluence: -50,
    maxInfluence: -30,
    primaryFaction: null, // Betrayed faction
    primaryDirection: 'negative',
    secondaryEffects: [],
    description: 'Betrayal devastates former faction influence',
  },

  [ActionCategory.SOCIAL_DIPLOMACY]: {
    actionCategory: ActionCategory.SOCIAL_DIPLOMACY,
    baseInfluence: 8,
    minInfluence: 5,
    maxInfluence: 12,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Diplomatic actions improve relations',
  },

  [ActionCategory.SOCIAL_NEGOTIATE]: {
    actionCategory: ActionCategory.SOCIAL_NEGOTIATE,
    baseInfluence: 6,
    minInfluence: 4,
    maxInfluence: 10,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Negotiations strengthen faction standing',
  },

  [ActionCategory.SOCIAL_MEDIATE]: {
    actionCategory: ActionCategory.SOCIAL_MEDIATE,
    baseInfluence: 4,
    minInfluence: 2,
    maxInfluence: 7,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Mediation builds trust with multiple factions',
  },

  // ============================================================================
  // GANG ACTIONS
  // ============================================================================

  [ActionCategory.GANG_CONTROL_BUILDING]: {
    actionCategory: ActionCategory.GANG_CONTROL_BUILDING,
    baseInfluence: 3, // Per day
    minInfluence: 2,
    maxInfluence: 5,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Gang-controlled buildings provide passive influence',
  },

  [ActionCategory.GANG_CLAIM_TERRITORY]: {
    actionCategory: ActionCategory.GANG_CLAIM_TERRITORY,
    baseInfluence: 20,
    minInfluence: 10,
    maxInfluence: 30,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Territory claims establish major presence',
  },

  [ActionCategory.GANG_WAR_VICTORY]: {
    actionCategory: ActionCategory.GANG_WAR_VICTORY,
    baseInfluence: 30,
    minInfluence: 20,
    maxInfluence: 40,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Gang war victories demonstrate dominance',
  },

  [ActionCategory.GANG_ALLIANCE]: {
    actionCategory: ActionCategory.GANG_ALLIANCE,
    baseInfluence: 10,
    minInfluence: 5,
    maxInfluence: 15,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Gang alliances create mutual influence benefits',
  },

  [ActionCategory.GANG_RAID]: {
    actionCategory: ActionCategory.GANG_RAID,
    baseInfluence: 12,
    minInfluence: 8,
    maxInfluence: 18,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Coordinated gang raids expand territory control',
  },

  [ActionCategory.GANG_DEFEND]: {
    actionCategory: ActionCategory.GANG_DEFEND,
    baseInfluence: 15,
    minInfluence: 10,
    maxInfluence: 22,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Successfully defending gang territory solidifies control',
  },

  // ============================================================================
  // SPECIAL ACTIONS
  // ============================================================================

  [ActionCategory.SPECIAL_TRAIN_HEIST]: {
    actionCategory: ActionCategory.SPECIAL_TRAIN_HEIST,
    baseInfluence: 20,
    minInfluence: 15,
    maxInfluence: 30,
    primaryFaction: ActionFactionId.RAILROAD_CORP,
    primaryDirection: 'negative',
    secondaryEffects: [
      {
        factionId: ActionFactionId.OUTLAW_FACTION,
        influenceMultiplier: 0.60,
        direction: 'positive',
      },
    ],
    description: 'Train heists damage railroad and boost outlaw reputation',
  },

  [ActionCategory.SPECIAL_BANK_ROBBERY]: {
    actionCategory: ActionCategory.SPECIAL_BANK_ROBBERY,
    baseInfluence: 25,
    minInfluence: 18,
    maxInfluence: 35,
    primaryFaction: null,
    primaryDirection: 'negative',
    secondaryEffects: [
      {
        factionId: ActionFactionId.OUTLAW_FACTION,
        influenceMultiplier: 0.70,
        direction: 'positive',
      },
      {
        factionId: ActionFactionId.LAW_ENFORCEMENT,
        influenceMultiplier: 0.40,
        direction: 'positive',
      },
    ],
    description: 'Major bank robberies shift power dynamics',
  },

  [ActionCategory.SPECIAL_ARTIFACT_RECOVERY]: {
    actionCategory: ActionCategory.SPECIAL_ARTIFACT_RECOVERY,
    baseInfluence: 30,
    minInfluence: 20,
    maxInfluence: 45,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Recovering faction artifacts provides massive influence',
  },

  [ActionCategory.SPECIAL_RITUAL_COMPLETION]: {
    actionCategory: ActionCategory.SPECIAL_RITUAL_COMPLETION,
    baseInfluence: 35,
    minInfluence: 25,
    maxInfluence: 50,
    primaryFaction: ActionFactionId.NAHI_COALITION,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Spiritual rituals deeply resonate with Nahi Coalition',
  },

  [ActionCategory.SPECIAL_LEGENDARY_HUNT]: {
    actionCategory: ActionCategory.SPECIAL_LEGENDARY_HUNT,
    baseInfluence: 28,
    minInfluence: 20,
    maxInfluence: 40,
    primaryFaction: null,
    primaryDirection: 'positive',
    secondaryEffects: [],
    description: 'Legendary hunts prove prowess and earn respect',
  },
};

/**
 * Faction spillover rules
 * Defines how influence gains/losses affect other factions
 */
export const FACTION_SPILLOVER_RULES: FactionSpilloverRule[] = [
  // Military vs Outlaws
  {
    primaryFaction: ActionFactionId.MILITARY,
    antagonists: [
      { factionId: ActionFactionId.OUTLAW_FACTION, spilloverRate: 0.40 },
      { factionId: ActionFactionId.FRONTERA_CARTEL, spilloverRate: 0.25 },
    ],
    allies: [
      { factionId: ActionFactionId.LAW_ENFORCEMENT, spilloverRate: 0.20 },
      { factionId: ActionFactionId.SETTLER_ALLIANCE, spilloverRate: 0.15 },
    ],
  },

  // Coalition vs Railroad
  {
    primaryFaction: ActionFactionId.NAHI_COALITION,
    antagonists: [
      { factionId: ActionFactionId.RAILROAD_CORP, spilloverRate: 0.35 },
      { factionId: ActionFactionId.MILITARY, spilloverRate: 0.20 },
    ],
    allies: [
      { factionId: ActionFactionId.CHINESE_TONG, spilloverRate: 0.15 },
    ],
  },

  // Cartel vs Settlers
  {
    primaryFaction: ActionFactionId.FRONTERA_CARTEL,
    antagonists: [
      { factionId: ActionFactionId.SETTLER_ALLIANCE, spilloverRate: 0.30 },
      { factionId: ActionFactionId.LAW_ENFORCEMENT, spilloverRate: 0.35 },
    ],
    allies: [
      { factionId: ActionFactionId.OUTLAW_FACTION, spilloverRate: 0.20 },
    ],
  },

  // Settlers vs Cartel
  {
    primaryFaction: ActionFactionId.SETTLER_ALLIANCE,
    antagonists: [
      { factionId: ActionFactionId.FRONTERA_CARTEL, spilloverRate: 0.30 },
      { factionId: ActionFactionId.OUTLAW_FACTION, spilloverRate: 0.20 },
    ],
    allies: [
      { factionId: ActionFactionId.LAW_ENFORCEMENT, spilloverRate: 0.15 },
      { factionId: ActionFactionId.MILITARY, spilloverRate: 0.10 },
    ],
  },

  // Law Enforcement
  {
    primaryFaction: ActionFactionId.LAW_ENFORCEMENT,
    antagonists: [
      { factionId: ActionFactionId.OUTLAW_FACTION, spilloverRate: 0.50 },
      { factionId: ActionFactionId.FRONTERA_CARTEL, spilloverRate: 0.30 },
    ],
    allies: [
      { factionId: ActionFactionId.SETTLER_ALLIANCE, spilloverRate: 0.15 },
      { factionId: ActionFactionId.MILITARY, spilloverRate: 0.20 },
    ],
  },

  // Outlaw Faction
  {
    primaryFaction: ActionFactionId.OUTLAW_FACTION,
    antagonists: [
      { factionId: ActionFactionId.LAW_ENFORCEMENT, spilloverRate: 0.45 },
      { factionId: ActionFactionId.MILITARY, spilloverRate: 0.25 },
    ],
    allies: [
      { factionId: ActionFactionId.FRONTERA_CARTEL, spilloverRate: 0.15 },
    ],
  },

  // Railroad Corporation
  {
    primaryFaction: ActionFactionId.RAILROAD_CORP,
    antagonists: [
      { factionId: ActionFactionId.NAHI_COALITION, spilloverRate: 0.35 },
      { factionId: ActionFactionId.OUTLAW_FACTION, spilloverRate: 0.25 },
    ],
    allies: [
      { factionId: ActionFactionId.SETTLER_ALLIANCE, spilloverRate: 0.20 },
      { factionId: ActionFactionId.MILITARY, spilloverRate: 0.15 },
    ],
  },

  // Chinese Tong
  {
    primaryFaction: ActionFactionId.CHINESE_TONG,
    antagonists: [
      { factionId: ActionFactionId.SETTLER_ALLIANCE, spilloverRate: 0.20 },
    ],
    allies: [
      { factionId: ActionFactionId.NAHI_COALITION, spilloverRate: 0.15 },
    ],
  },
];

/**
 * Territory volatility configurations
 */
export const TERRITORY_VOLATILITY_MAP: Record<string, TerritoryVolatility> = {
  'red-gulch': {
    territoryId: 'red-gulch',
    territoryName: 'Red Gulch',
    volatilityMultiplier: 1.25,
    specialRules: [
      'All influence changes +25%',
      'Control can flip rapidly',
      'Gang wars more frequent',
    ],
  },
  'fort-ashford': {
    territoryId: 'fort-ashford',
    territoryName: 'Fort Ashford',
    volatilityMultiplier: 0.80,
    specialRules: [
      'Military always has +20 base influence',
      'Civilian influence capped at 30%',
      'Martial law can be declared',
    ],
  },
  'the-frontera': {
    territoryId: 'the-frontera',
    territoryName: 'The Frontera',
    volatilityMultiplier: 1.50,
    specialRules: [
      'Law enforcement influence always low',
      'Criminal actions less impactful',
      'Cartel has +15% base influence',
    ],
  },
  'coalition-lands': {
    territoryId: 'coalition-lands',
    territoryName: 'Coalition Lands',
    volatilityMultiplier: 0.75,
    specialRules: [
      'Non-Coalition influence capped at 25%',
      'Spiritual events affect influence',
      'Unique Coalition-only actions available',
    ],
  },
  'whiskey-ridge': {
    territoryId: 'whiskey-ridge',
    territoryName: 'Whiskey Ridge',
    volatilityMultiplier: 1.10,
    specialRules: [
      'Outlaw actions more effective',
      'Bounty hunter presence high',
    ],
  },
  'silver-springs': {
    territoryId: 'silver-springs',
    territoryName: 'Silver Springs',
    volatilityMultiplier: 1.15,
    specialRules: [
      'Economic actions more impactful',
      'Mining operations affect influence',
    ],
  },
};

/**
 * Default territory volatility for unmapped territories
 */
export const DEFAULT_TERRITORY_VOLATILITY: TerritoryVolatility = {
  territoryId: 'default',
  territoryName: 'Standard Territory',
  volatilityMultiplier: 1.0,
  specialRules: [],
};
