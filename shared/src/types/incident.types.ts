/**
 * Incident Types
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Random negative events affecting player assets with prevention mechanics,
 * response windows, and insurance recovery.
 */

// Reuse InsuranceLevel from raid types since it's the same property insurance system
import { InsuranceLevel } from './raid.types';
export { InsuranceLevel };

/**
 * Categories of incidents
 */
export enum IncidentCategory {
  PROPERTY = 'property',
  BUSINESS = 'business',
  MINING = 'mining',
}

/**
 * Specific incident types by category
 */
export enum IncidentType {
  // Property incidents
  FIRE = 'fire',
  THEFT = 'theft',
  STRUCTURAL_DAMAGE = 'structural_damage',
  INFESTATION = 'infestation',
  WORKER_STRIKE = 'worker_strike',
  CUSTOMER_COMPLAINT = 'customer_complaint',

  // Business-specific incidents
  SUPPLY_SHORTAGE = 'supply_shortage',
  COMPETITION_UNDERCUT = 'competition_undercut',
  HEALTH_INSPECTION_FAILURE = 'health_inspection_failure',
  STAFF_TURNOVER = 'staff_turnover',

  // Mining claim incidents
  CLAIM_JUMPER = 'claim_jumper',
  EQUIPMENT_THEFT = 'equipment_theft',
  ENVIRONMENTAL_HAZARD = 'environmental_hazard',
  INSPECTOR_CRACKDOWN = 'inspector_crackdown',
}

/**
 * Severity levels affecting damage multipliers
 */
export enum IncidentSeverity {
  MINOR = 'minor',           // 50% damage
  MODERATE = 'moderate',     // 100% damage
  SEVERE = 'severe',         // 150% damage
  CATASTROPHIC = 'catastrophic', // 250% damage
}

/**
 * Status of an incident throughout its lifecycle
 */
export enum IncidentStatus {
  PENDING = 'pending',           // Just occurred, awaiting response
  IN_PROGRESS = 'in_progress',   // Player is responding
  RESOLVED = 'resolved',         // Successfully handled
  FAILED = 'failed',             // Response failed or expired
  PREVENTED = 'prevented',       // Prevention factors blocked it
  AUTO_RESOLVED = 'auto_resolved', // System auto-resolved (minor incidents)
}

/**
 * Response options available to players
 */
export enum IncidentResponseType {
  // General responses
  IGNORE = 'ignore',             // Accept full damage
  PAY_TO_FIX = 'pay_to_fix',     // Pay gold to resolve immediately
  INSURANCE_CLAIM = 'insurance_claim', // Use insurance for partial recovery

  // Property-specific responses
  CALL_FIRE_BRIGADE = 'call_fire_brigade', // For fires
  HIRE_GUARDS = 'hire_guards',    // For theft
  EMERGENCY_REPAIRS = 'emergency_repairs', // For structural damage
  EXTERMINATOR = 'exterminator',  // For infestation
  NEGOTIATE = 'negotiate',        // For worker strikes

  // Mining-specific responses
  DEFEND_CLAIM = 'defend_claim',  // For claim jumpers
  BRIBE_INSPECTOR = 'bribe_inspector', // For inspector crackdown
  EVACUATE = 'evacuate',          // For environmental hazards
}

/**
 * Target type for incidents
 */
export enum IncidentTargetType {
  PROPERTY = 'property',
  BUSINESS = 'business',
  MINING_CLAIM = 'mining_claim',
}

/**
 * Effect types that incidents can apply
 */
export enum IncidentEffectType {
  CONDITION_DAMAGE = 'condition_damage',
  INVENTORY_LOSS = 'inventory_loss',
  GOLD_LOSS = 'gold_loss',
  REPUTATION_LOSS = 'reputation_loss',
  PRODUCTION_HALT = 'production_halt',
  STATUS_CHANGE = 'status_change',
  WORKER_LOSS = 'worker_loss',
  EQUIPMENT_DAMAGE = 'equipment_damage',
  FINE = 'fine',
}

/**
 * Individual effect applied by an incident
 */
export interface IIncidentEffect {
  type: IncidentEffectType;
  value: number;                 // Amount/percentage based on type
  duration?: number;             // Duration in hours (for temporary effects)
  description: string;
}

/**
 * Prevention factor that can reduce incident chance
 */
export interface IPreventionFactor {
  type: 'condition' | 'guards' | 'territory' | 'upgrade' | 'insurance' | 'gang_protection';
  reductionPercent: number;
  description: string;
}

/**
 * Response option available to player
 */
export interface IIncidentResponse {
  type: IncidentResponseType;
  cost: number;                  // Gold cost to execute
  successChance: number;         // 0-100 chance of success
  damageReduction: number;       // Percentage of damage prevented (0-100)
  timeRequired: number;          // Time in minutes to complete
  requirements?: {
    minLevel?: number;
    requiredItems?: Array<{ itemId: string; quantity: number }>;
    requiredGangRank?: string;
    requiredSkill?: { skillId: string; minLevel: number };
  };
  description: string;
}

/**
 * Core incident document interface
 */
export interface IIncident {
  _id: string;

  // Target information
  targetType: IncidentTargetType;
  targetId: string;              // Property, Business, or MiningClaim ID
  targetName: string;            // Cached for display
  characterId: string;           // Owner of the target

  // Incident details
  category: IncidentCategory;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Location context
  zoneId: string;
  locationId: string;

  // Timing
  occurredAt: Date;
  expiresAt: Date;               // Response window deadline
  resolvedAt?: Date;

  // Effects
  effects: IIncidentEffect[];
  totalDamageEstimate: number;   // Estimated gold value of damage

  // Prevention tracking
  preventionFactors: IPreventionFactor[];
  totalPreventionReduction: number; // Sum of all prevention factors
  wasPartiallyPrevented: boolean;

  // Response tracking
  availableResponses: IIncidentResponse[];
  selectedResponse?: IncidentResponseType;
  responseStartedAt?: Date;
  responseCompletedAt?: Date;
  responseSuccess?: boolean;

  // Insurance
  insuranceLevel: InsuranceLevel;
  insuranceRecovery?: number;    // Amount recovered via insurance
  insuranceClaimed: boolean;

  // Final outcome
  actualDamage?: number;         // Final damage after response/insurance
  recoveredAmount?: number;      // Total recovered via response + insurance

  // Notification tracking
  notificationSent: boolean;
  reminderSent: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new incident
 */
export interface ICreateIncidentDTO {
  targetType: IncidentTargetType;
  targetId: string;
  characterId: string;
  category: IncidentCategory;
  type: IncidentType;
  severity: IncidentSeverity;
  zoneId: string;
  locationId: string;
}

/**
 * DTO for incident response
 */
export interface IIncidentResponseDTO {
  incidentId: string;
  responseType: IncidentResponseType;
  useInsurance?: boolean;
}

/**
 * Result of resolving an incident
 */
export interface IIncidentResolutionResult {
  success: boolean;
  incidentId: string;
  status: IncidentStatus;
  damageApplied: number;
  damagePreventedByResponse: number;
  insuranceRecovery: number;
  totalRecovered: number;
  finalCost: number;             // Net cost to player
  effectsApplied: IIncidentEffect[];
  message: string;
}

/**
 * Incident history entry for display
 */
export interface IIncidentHistoryEntry {
  incidentId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  targetName: string;
  occurredAt: Date;
  status: IncidentStatus;
  damageAmount: number;
  recovered: number;
  wasInsured: boolean;
}

/**
 * Active incident summary for dashboard
 */
export interface IActiveIncidentSummary {
  incidentId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  targetType: IncidentTargetType;
  targetName: string;
  targetId: string;
  timeRemaining: number;         // Seconds until expiry
  estimatedDamage: number;
  availableResponseCount: number;
  insuranceAvailable: boolean;
}

/**
 * Prevention calculation result
 */
export interface IPreventionCalculation {
  baseChance: number;
  factors: IPreventionFactor[];
  totalReduction: number;
  finalChance: number;
  isPrevented: boolean;
}

/**
 * Incident spawn check result
 */
export interface IIncidentSpawnResult {
  targetId: string;
  targetType: IncidentTargetType;
  targetName: string;
  incidentOccurred: boolean;
  incidentType?: IncidentType;
  incidentId?: string;
  preventionCalculation: IPreventionCalculation;
  cooldownRemaining?: number;    // Seconds if on cooldown
}

/**
 * Batch spawn check result for job processing
 */
export interface IBatchIncidentSpawnResult {
  processedCount: number;
  incidentsCreated: number;
  incidentsPrevented: number;
  onCooldown: number;
  errors: number;
  results: IIncidentSpawnResult[];
}

/**
 * Incident type definition for configuration
 */
export interface IIncidentTypeConfig {
  type: IncidentType;
  category: IncidentCategory;
  applicableTargets: IncidentTargetType[];
  baseChance: number;            // Daily percentage chance
  severityDistribution: {
    [IncidentSeverity.MINOR]: number;
    [IncidentSeverity.MODERATE]: number;
    [IncidentSeverity.SEVERE]: number;
    [IncidentSeverity.CATASTROPHIC]: number;
  };
  baseEffects: IIncidentEffect[];
  availableResponses: IncidentResponseType[];
  responseWindowHours: number;
  cooldownHours: number;         // Hours before same incident can recur on target
  description: string;
  flavorText: string;
}

/**
 * Insurance tier configuration for incidents
 * (Extended from raid insurance to include incident-specific fields)
 */
export interface IIncidentInsuranceTierConfig {
  level: InsuranceLevel;
  recoveryPercent: number;
  weeklyPremium: number;
  maxClaimPerIncident: number;
  claimsPerMonth: number;
  coveredIncidentTypes: IncidentType[];
}

/**
 * Socket event payloads for real-time updates
 */
export interface IIncidentSocketEvents {
  'incident:occurred': {
    incident: IActiveIncidentSummary;
    characterId: string;
  };
  'incident:resolved': {
    incidentId: string;
    status: IncidentStatus;
    result: IIncidentResolutionResult;
  };
  'incident:expired': {
    incidentId: string;
    damageApplied: number;
    targetName: string;
  };
  'incident:prevented': {
    targetId: string;
    targetName: string;
    incidentType: IncidentType;
    preventionReason: string;
  };
  'incident:reminder': {
    incidentId: string;
    timeRemaining: number;
    targetName: string;
  };
}
