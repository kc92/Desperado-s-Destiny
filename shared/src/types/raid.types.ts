/**
 * Raid System Types
 *
 * Shared types for the gang raid system (Phase 2.3)
 * Supports property raids, treasury raids, territory influence raids, and production disruption
 * Also supports NPC gang attacks for unified raid tracking
 */

import { NPCGangId, AttackType } from './npcGang.types';

/**
 * Raid Target Types
 */
export enum RaidTargetType {
  PROPERTY = 'property',                      // Target player properties
  TREASURY = 'treasury',                      // Target gang treasury
  TERRITORY_INFLUENCE = 'territory_influence', // Reduce zone influence
  PRODUCTION = 'production',                  // Disrupt production/workers
}

/**
 * Raid Status Lifecycle
 */
export enum RaidStatus {
  PLANNING = 'planning',           // Raid being planned (can cancel)
  SCHEDULED = 'scheduled',         // Execution time set
  IN_PROGRESS = 'in_progress',     // Currently executing
  COMPLETED = 'completed',         // Successfully executed
  FAILED = 'failed',               // Attackers failed
  DEFENDED = 'defended',           // Defenders repelled attack
  CANCELLED = 'cancelled',         // Cancelled before execution
}

/**
 * Raid Outcome (for completed raids)
 */
export enum RaidOutcome {
  CRITICAL_SUCCESS = 'critical_success',  // 150% damage, bonus loot
  SUCCESS = 'success',                     // Normal damage
  PARTIAL_SUCCESS = 'partial_success',    // 50% damage
  FAILURE = 'failure',                     // No damage, penalties
  CRITICAL_FAILURE = 'critical_failure',  // Counter-attack damage
}

/**
 * Guard Skill Tiers (for property defense)
 */
export enum GuardSkillTier {
  ROOKIE = 'rookie',           // 5 defense, $10/day
  EXPERIENCED = 'experienced', // 10 defense, $25/day
  VETERAN = 'veteran',         // 18 defense, $50/day
  ELITE = 'elite',             // 30 defense, $100/day
}

/**
 * Insurance Levels for properties
 */
export enum InsuranceLevel {
  NONE = 'none',             // 0% recovery
  BASIC = 'basic',           // 25% recovery, $50/week
  STANDARD = 'standard',     // 50% recovery, $150/week
  PREMIUM = 'premium',       // 75% recovery, $400/week
}

/**
 * Raid participant roles
 */
export enum RaidParticipantRole {
  LEADER = 'leader',
  ATTACKER = 'attacker',
  SCOUT = 'scout',
}

/**
 * Property guard information
 */
export interface IPropertyGuard {
  id: string;
  name: string;
  skillTier: GuardSkillTier;
  defense: number;           // Calculated from tier
  dailyWage: number;
  hiredAt: Date;
  loyalty: number;           // 0-100, affects defense contribution
}

/**
 * Raid participant information
 */
export interface IRaidParticipant {
  characterId: string;
  characterName?: string;
  role: RaidParticipantRole;
  contribution: number;      // Points earned
  joinedAt: Date;
}

/**
 * Items stolen during a raid
 */
export interface IStolenItem {
  itemId: string;
  itemName?: string;
  quantity: number;
}

/**
 * Raid result details
 */
export interface IRaidResult {
  outcome: RaidOutcome;
  damageDealt: number;              // Percentage or absolute value
  goldStolen?: number;              // For treasury raids
  influenceLost?: number;           // For territory raids
  productionHaltHours?: number;     // For production raids
  conditionDamage?: number;         // For property raids
  storageLostPercent?: number;      // For property raids
  itemsStolen?: IStolenItem[];      // Specific items taken
  defenderCasualties?: number;      // Guards lost
  attackerCasualties?: number;      // Participants injured
  xpAwarded: number;
  goldAwarded: number;
  insuranceRecovery?: number;       // Amount recovered from insurance
}

/**
 * Raid history entry for properties
 */
export interface IRaidHistoryEntry {
  raidId: string;
  attackingGangId: string;
  attackingGangName: string;
  outcome: RaidOutcome;
  damageReceived: number;
  date: Date;
}

/**
 * Raid Data Transfer Object (for API responses)
 */
export interface IRaidDTO {
  raidId: string;
  attackingGangId: string;
  attackingGangName: string;
  defendingGangId?: string;
  defendingGangName?: string;
  targetType: RaidTargetType;
  targetId: string;
  targetName: string;
  zoneId: string;
  zoneName?: string;
  status: RaidStatus;
  plannedAt: Date;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  leaderId: string;
  leaderName?: string;
  participants: IRaidParticipant[];
  attackPower?: number;
  defensePower?: number;
  isWarRaid: boolean;
  warId?: string;
  result?: IRaidResult;

  // NPC Gang Attack fields
  isNPCRaid?: boolean;              // True if this raid was initiated by an NPC gang
  npcGangId?: NPCGangId;            // The NPC gang that initiated the raid
  npcAttackType?: AttackType;       // Original NPC attack type (raid, ambush, etc.)
}

/**
 * Raid planning request
 */
export interface IPlanRaidRequest {
  targetType: RaidTargetType;
  targetId: string;
}

/**
 * Raid join request
 */
export interface IJoinRaidRequest {
  role: Exclude<RaidParticipantRole, 'leader'>;
}

/**
 * Raid schedule request
 */
export interface IScheduleRaidRequest {
  scheduledFor: Date;
}

/**
 * Raid target preview (for target selection UI)
 */
export interface IRaidTargetPreview {
  targetId: string;
  targetName: string;
  targetType: RaidTargetType;
  ownerName: string;
  ownerId: string;
  gangId?: string;
  gangName?: string;
  zoneId: string;
  zoneName: string;
  estimatedDefensePower: number;
  defenseLevel: 'low' | 'medium' | 'high' | 'fortress';
  isImmune: boolean;
  immuneUntil?: Date;
  lastRaidedAt?: Date;
  canRaid: boolean;
  cannotRaidReason?: string;
  potentialLoot: {
    goldMin: number;
    goldMax: number;
    hasStorage: boolean;
  };
}

/**
 * Property defense overview
 */
export interface IPropertyDefenseDTO {
  propertyId: string;
  propertyName: string;
  defenseLevel: number;
  guards: IPropertyGuard[];
  maxGuards: number;
  insuranceLevel: InsuranceLevel;
  insurancePaidUntil?: Date;
  isInsured: boolean;
  weeklyInsuranceCost: number;
  lastRaidAt?: Date;
  raidImmunityUntil?: Date;
  isImmune: boolean;
  raidHistory: IRaidHistoryEntry[];
  upgradeDefenseBonus: number;
}

/**
 * Hire guard request
 */
export interface IHireGuardRequest {
  guardName: string;
  skillTier: GuardSkillTier;
}

/**
 * Set insurance request
 */
export interface ISetInsuranceRequest {
  level: InsuranceLevel;
}

/**
 * Guard tier configuration
 */
export interface IGuardTierConfig {
  defense: number;
  dailyWage: number;
  hireCost: number;
}

/**
 * Insurance tier configuration
 */
export interface IInsuranceTierConfig {
  recovery: number;        // Percentage (0-1)
  weeklyPremium: number;
}

/**
 * Raid damage configuration per target type
 */
export interface IRaidDamageConfig {
  storage?: [number, number];           // [min, max] percentage
  condition?: [number, number];         // [min, max] points
  upgradeSabotageChance?: number;       // Percentage
  gold?: [number, number];              // [min, max] percentage
  influence?: [number, number];         // [min, max] points
  haltHours?: [number, number];         // [min, max] hours
  resources?: [number, number];         // [min, max] percentage
}

/**
 * Active raids summary for gang overview
 */
export interface IGangRaidsSummary {
  planningRaids: number;
  scheduledRaids: number;
  inProgressRaids: number;
  incomingRaids: number;
  recentRaidsCompleted: number;
  recentRaidsDefended: number;
  nextScheduledRaid?: {
    raidId: string;
    targetName: string;
    targetType: RaidTargetType;
    scheduledFor: Date;
  };
  nextIncomingRaid?: {
    raidId: string;
    attackerName: string;
    targetName: string;
    scheduledFor: Date;
  };
}

/**
 * Raid notification payload
 */
export interface IRaidNotificationPayload {
  raidId: string;
  attackingGangId: string;
  attackingGangName: string;
  defendingGangId?: string;
  targetType: RaidTargetType;
  targetId: string;
  targetName: string;
  scheduledFor?: Date;
  result?: IRaidResult;
}

/**
 * Raid socket events
 */
export enum RaidSocketEvent {
  RAID_PLANNED = 'raid:planned',
  RAID_JOINED = 'raid:joined',
  RAID_SCHEDULED = 'raid:scheduled',
  RAID_STARTED = 'raid:started',
  RAID_COMPLETED = 'raid:completed',
  RAID_CANCELLED = 'raid:cancelled',
  RAID_INCOMING = 'raid:incoming',
  DEFENSE_UPDATED = 'raid:defense_updated',
}
