/**
 * Moral Reputation Types
 *
 * Phase 19.3: Frontier Justice - Marshal/Outlaw system types
 */

import { MoralReputationTier, MoralAction } from '../constants/moralReputation.constants';

/**
 * Character's moral reputation state
 */
export interface IMoralReputationState {
  value: number;                          // -100 to +100
  tier: MoralReputationTier;
  dailyChange: number;                    // Track daily changes for limit
  lastDecayDate: Date;                    // For daily decay calculation
  history: IMoralReputationEvent[];       // Recent reputation events
}

/**
 * Individual reputation change event
 */
export interface IMoralReputationEvent {
  id: string;
  action: MoralAction;
  change: number;
  previousValue: number;
  newValue: number;
  description: string;
  locationId?: string;
  timestamp: Date;
}

/**
 * Moral reputation summary for API responses
 */
export interface IMoralReputationSummary {
  characterId: string;
  value: number;
  tier: MoralReputationTier;
  tierName: string;
  tierDescription: string;
  tierIcon: string;
  hasMarshalAccess: boolean;
  hasOutlawAccess: boolean;
  bonuses: IMoralReputationBonuses;
  recentEvents: IMoralReputationEvent[];
}

/**
 * Active bonuses from moral reputation
 */
export interface IMoralReputationBonuses {
  bountyRewardBonus: number;
  crimePayoutBonus: number;
  escortPayBonus: number;
  fenceRateBonus: number;
  intimidationBonus: number;
  townPriceDiscount: number;
  unlockedFeatures: string[];
}

/**
 * Request to modify moral reputation
 */
export interface IModifyMoralReputationRequest {
  characterId: string;
  action: MoralAction;
  context?: {
    locationId?: string;
    targetId?: string;
    description?: string;
    multiplier?: number;          // Context-based multiplier (0.5 to 2.0)
  };
}

/**
 * Response from moral reputation modification
 */
export interface IModifyMoralReputationResponse {
  success: boolean;
  previousValue: number;
  newValue: number;
  change: number;
  previousTier: MoralReputationTier;
  newTier: MoralReputationTier;
  tierChanged: boolean;
  message: string;
  unlockedFeatures?: string[];
  lostFeatures?: string[];
}

/**
 * Cross-faction respect check result
 */
export interface ICrossFactionRespectResult {
  character1Id: string;
  character2Id: string;
  sharesAlignment: boolean;
  alignmentType: 'lawful' | 'criminal' | 'none';
  respectBonus: number;           // 0.0 to 0.25 interaction bonus
}

/**
 * Moral reputation leaderboard entry
 */
export interface IMoralReputationLeaderboardEntry {
  characterId: string;
  characterName: string;
  faction: string;
  value: number;
  tier: MoralReputationTier;
  tierName: string;
}

/**
 * Contract availability based on moral reputation
 */
export interface IMoralContractAccess {
  bountyContracts: boolean;       // Available at Deputy+
  escortContracts: boolean;       // Available at Respectable+
  assassinationContracts: boolean; // Available at Wanted Criminal-
  sabotageContracts: boolean;     // Available at Petty Crook-
  factionWarfareContracts: boolean; // Available at any alignment
}

/**
 * Options for contract filtering by moral reputation
 */
export interface IMoralContractFilter {
  minMoralReputation?: number;
  maxMoralReputation?: number;
  requireMarshalAccess?: boolean;
  requireOutlawAccess?: boolean;
}
