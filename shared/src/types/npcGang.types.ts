/**
 * NPC Gang System Types
 *
 * Shared types for NPC gang conflicts between client and server
 */

/**
 * NPC Gang IDs
 */
export enum NPCGangId {
  EL_REY_FRONTERA = 'el-rey-frontera',
  COMANCHE_RAIDERS = 'comanche-raiders',
  RAILROAD_BARONS = 'railroad-barons',
  BANKERS_SYNDICATE = 'bankers-syndicate',
}

/**
 * NPC Gang specialty types
 */
export enum NPCGangSpecialty {
  SMUGGLING = 'smuggling',
  BORDER_RAIDS = 'border_raids',
  AMBUSHES = 'ambushes',
  TRACKING = 'tracking',
  WILDERNESS = 'wilderness',
  HIT_AND_RUN = 'hit_and_run',
  INDUSTRIAL = 'industrial',
  HIRED_GUNS = 'hired_guns',
  LEGAL_PRESSURE = 'legal_pressure',
  ECONOMIC_WARFARE = 'economic_warfare',
  CORRUPTION = 'corruption',
  ASSASSINATION = 'assassination',
}

/**
 * Relationship attitude
 */
export enum RelationshipAttitude {
  HOSTILE = 'hostile',
  UNFRIENDLY = 'unfriendly',
  NEUTRAL = 'neutral',
  FRIENDLY = 'friendly',
  ALLIED = 'allied',
}

/**
 * NPC Gang leader information
 */
export interface NPCLeader {
  name: string;
  title: string;
  level: number;
  maxHP: number;
  description: string;
  abilities: string[];
  loot: {
    goldMin: number;
    goldMax: number;
    uniqueItems: string[];
  };
}

/**
 * NPC Gang definition
 */
export interface NPCGang {
  id: NPCGangId;
  name: string;
  description: string;
  leader: NPCLeader;
  strength: number;
  specialty: NPCGangSpecialty[];
  controlledZones: string[];
  tributeCost: number;
  baseTribute: number;
  attitude: RelationshipAttitude;
  missions: NPCGangMissionTemplate[];
  attackPatterns: AttackPattern[];

  // Story/lore
  backstory: string;
  allies: NPCGangId[];
  enemies: NPCGangId[];
}

/**
 * Attack pattern types
 */
export enum AttackType {
  RAID = 'raid',
  AMBUSH = 'ambush',
  BLOCKADE = 'blockade',
  ASSASSINATION = 'assassination',
  FULL_ASSAULT = 'full_assault',
}

/**
 * Attack pattern
 */
export interface AttackPattern {
  type: AttackType;
  frequency: number; // days between attacks
  damage: {
    goldLoss: number;
    influenceLoss: number;
  };
  description: string;
}

/**
 * NPC Gang mission types
 */
export enum NPCMissionType {
  DELIVERY = 'delivery',
  PROTECTION = 'protection',
  SABOTAGE = 'sabotage',
  ESPIONAGE = 'espionage',
  RECRUITMENT = 'recruitment',
  ASSASSINATION = 'assassination',
  TERRITORY_DEFENSE = 'territory_defense',
}

/**
 * Mission requirement types
 */
export enum MissionRequirementType {
  LEVEL = 'level',
  REPUTATION = 'reputation',
  ITEMS = 'items',
  GOLD = 'gold',
  GANG_SIZE = 'gang_size',
}

/**
 * Mission requirement
 */
export interface MissionRequirement {
  type: MissionRequirementType;
  value: number | string;
  description: string;
}

/**
 * Mission reward types
 */
export enum MissionRewardType {
  GOLD = 'gold',
  REPUTATION = 'reputation',
  ITEMS = 'items',
  TERRITORY_ACCESS = 'territory_access',
  NPC_BACKUP = 'npc_backup',
  INFLUENCE = 'influence',
}

/**
 * Mission reward
 */
export interface MissionReward {
  type: MissionRewardType;
  amount?: number;
  itemId?: string;
  zoneId?: string;
  description: string;
}

/**
 * NPC Gang mission template
 */
export interface NPCGangMissionTemplate {
  id: string;
  gangId: NPCGangId;
  name: string;
  description: string;
  type: NPCMissionType;
  requirements: MissionRequirement[];
  rewards: MissionReward[];
  minRelationship: number;
  cooldown: number; // hours
  repeatable: boolean;
  difficulty: number;
}

/**
 * Territory challenge progress
 */
export interface ChallengeProgress {
  targetZone: string;
  missionsCompleted: number;
  missionsRequired: number;
  completedMissionTypes: string[];
  startedAt: Date;
  expiresAt: Date;
}

/**
 * NPC Gang relationship (database record)
 */
export interface NPCGangRelationship {
  _id: string;
  playerGangId: string;
  npcGangId: NPCGangId;
  relationshipScore: number; // -100 to +100
  attitude: RelationshipAttitude;
  tributePaid: boolean;
  lastTributeDate?: Date;
  tributeStreak: number;
  completedMissions: string[];
  activeConflict: boolean;
  conflictReason?: string;
  challengeProgress?: ChallengeProgress;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relationship score thresholds
 */
export const RELATIONSHIP_THRESHOLDS = {
  HOSTILE: -50,
  UNFRIENDLY: -10,
  NEUTRAL_LOW: -9,
  NEUTRAL_HIGH: 9,
  FRIENDLY: 10,
  ALLIED: 50,
} as const;

/**
 * Relationship change reasons
 */
export enum RelationshipChangeReason {
  TRIBUTE_PAID = 'tribute_paid',
  MISSION_COMPLETED = 'mission_completed',
  TERRITORY_ATTACKED = 'territory_attacked',
  MEMBER_KILLED = 'member_killed',
  BETRAYAL = 'betrayal',
  ALLIANCE_FORMED = 'alliance_formed',
  GIFT_GIVEN = 'gift_given',
  TREATY_SIGNED = 'treaty_signed',
}

/**
 * Tribute payment result
 */
export interface TributePaymentResult {
  success: boolean;
  npcGangId: NPCGangId;
  npcGangName: string;
  amountPaid: number;
  relationshipChange: number;
  newRelationship: number;
  newAttitude: RelationshipAttitude;
  message: string;
  streak: number;
}

/**
 * Challenge zone result
 */
export interface ChallengeNPCZoneResult {
  success: boolean;
  npcGangId: NPCGangId;
  npcGangName: string;
  zoneId: string;
  zoneName: string;
  challengeStarted: boolean;
  missionsRequired: number;
  message: string;
}

/**
 * Challenge mission completion result
 */
export interface ChallengeMissionResult {
  success: boolean;
  npcGangId: NPCGangId;
  zoneId: string;
  missionType: string;
  missionsCompleted: number;
  missionsRequired: number;
  challengeComplete: boolean;
  message: string;
}

/**
 * Final battle result
 */
export interface FinalBattleResult {
  success: boolean;
  victory: boolean;
  npcGangId: NPCGangId;
  zoneId: string;
  zoneName: string;
  rewards: {
    gold: number;
    xp: number;
    items: string[];
  };
  message: string;
}

/**
 * NPC Gang attack result
 */
export interface NPCAttackResult {
  npcGangId: NPCGangId;
  npcGangName: string;
  attackType: AttackType;
  damage: {
    goldLost: number;
    influenceLost: number;
    membersInjured: number;
  };
  zoneAffected?: string;
  canRetaliate: boolean;
  message: string;
}

/**
 * Mission acceptance result
 */
export interface MissionAcceptanceResult {
  success: boolean;
  mission: ActiveNPCMission;
  message: string;
}

/**
 * Active NPC mission (player's active mission)
 */
export interface ActiveNPCMission {
  _id: string;
  playerGangId: string;
  npcGangId: NPCGangId;
  missionId: string;
  missionName: string;
  missionType: NPCMissionType;
  description: string;
  requirements: MissionRequirement[];
  rewards: MissionReward[];
  progress: {
    current: number;
    required: number;
  };
  status: 'active' | 'completed' | 'failed';
  acceptedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

/**
 * NPC Gang overview (for UI)
 */
export interface NPCGangOverview {
  gang: NPCGang;
  relationship: NPCGangRelationship;
  availableMissions: NPCGangMissionTemplate[];
  activeMissions: ActiveNPCMission[];
  recentAttacks: NPCAttackResult[];
  canChallenge: boolean;
  challengeCost: number;
}

/**
 * NPC Gang world event types
 */
export enum NPCGangEventType {
  EXPANSION = 'expansion',
  NPC_WAR = 'npc_war',
  WEAKENED = 'weakened',
  ALLIANCE_OFFER = 'alliance_offer',
  TRIBUTE_DEMAND = 'tribute_demand',
  PEACE_TREATY = 'peace_treaty',
}

/**
 * NPC Gang world event
 */
export interface NPCGangWorldEvent {
  id: string;
  type: NPCGangEventType;
  npcGangId: NPCGangId;
  targetGangId?: NPCGangId;
  title: string;
  description: string;
  effects: {
    description: string;
    duration?: number; // days
  };
  startedAt: Date;
  endsAt?: Date;
  isActive: boolean;
}

/**
 * Global NPC gang state
 */
export interface NPCGangGlobalState {
  activeEvents: NPCGangWorldEvent[];
  gangStates: {
    [gangId: string]: {
      strength: number;
      zonesControlled: number;
      atWar: boolean;
      warWith?: NPCGangId;
    };
  };
}
