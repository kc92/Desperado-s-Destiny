/**
 * Gang System Types
 *
 * Shared types for gang system between client and server
 */

/**
 * Gang member role in hierarchy
 */
export enum GangRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
}

/**
 * Gang member information
 */
export interface GangMember {
  characterId: string;
  characterName: string;
  level: number;
  role: GangRole;
  joinedAt: Date;
  contribution: number;
  isOnline?: boolean;
}

/**
 * Gang perks from level progression
 */
export interface GangPerks {
  xpBonus: number;
  goldBonus: number;
  energyBonus: number;
}

/**
 * Gang upgrade types
 */
export enum GangUpgradeType {
  VAULT_SIZE = 'vaultSize',
  MEMBER_SLOTS = 'memberSlots',
  WAR_CHEST = 'warChest',
  PERK_BOOSTER = 'perkBooster',
}

/**
 * Gang upgrade levels
 */
export interface GangUpgrades {
  vaultSize: number;
  memberSlots: number;
  warChest: number;
  perkBooster: number;
}

/**
 * Gang statistics
 */
export interface GangStats {
  totalWins: number;
  warsWon?: number;
  totalLosses: number;
  warsLost?: number;
  territoriesConquered: number;
  totalRevenue: number;
}

/**
 * Complete gang information
 */
export interface Gang {
  _id: string;
  name: string;
  tag: string;
  leaderId: string;
  members: GangMember[];
  bank: number;
  level: number;
  perks: GangPerks;
  upgrades: GangUpgrades;
  territories: string[];
  stats: GangStats;
  createdAt: Date;
  isActive: boolean;
  currentMembers: number;
  maxMembers?: number;
  officerCount: number;
  territoriesCount: number;
}

/**
 * Gang bank transaction types
 */
export enum GangBankTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  UPGRADE_PURCHASE = 'UPGRADE_PURCHASE',
  WAR_FUNDING = 'WAR_FUNDING',
  WAR_REFUND = 'WAR_REFUND',
  DISBAND_DISTRIBUTION = 'DISBAND_DISTRIBUTION',
}

/**
 * Gang bank transaction record
 */
export interface GangBankTransaction {
  _id: string;
  gangId: string;
  characterId: string;
  characterName: string;
  type: GangBankTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: {
    upgradeType?: GangUpgradeType;
    upgradeLevel?: number;
    warId?: string;
    description?: string;
  };
  timestamp: Date;
}

/**
 * Gang invitation status
 */
export enum GangInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Gang invitation
 */
export interface GangInvitation {
  _id: string;
  gangId: string;
  gangName: string;
  inviterId: string;
  inviterName: string;
  recipientId: string;
  recipientName: string;
  status: GangInvitationStatus;
  createdAt: Date;
  respondedAt: Date | null;
}

/**
 * Gang permissions
 */
export enum GangPermission {
  VIEW_DETAILS = 'VIEW_DETAILS',
  INVITE_MEMBERS = 'INVITE_MEMBERS',
  KICK_MEMBERS = 'KICK_MEMBERS',
  PROMOTE_MEMBERS = 'PROMOTE_MEMBERS',
  DEPOSIT_BANK = 'DEPOSIT_BANK',
  WITHDRAW_BANK = 'WITHDRAW_BANK',
  PURCHASE_UPGRADES = 'PURCHASE_UPGRADES',
  DECLARE_WAR = 'DECLARE_WAR',
  DISBAND_GANG = 'DISBAND_GANG',
}

/**
 * Gang creation requirements
 */
export const GANG_CREATION = {
  MIN_LEVEL: 10,
  COST: 2000,
} as const;

/**
 * Gang constraints
 */
export const GANG_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 20,
  TAG_MIN_LENGTH: 2,
  TAG_MAX_LENGTH: 5,
  BASE_MEMBER_SLOTS: 15,
} as const;

/**
 * Gang level calculation
 */
export const GANG_LEVEL = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 50,
  XP_PER_MEMBER_LEVEL: 100,
} as const;

/**
 * Gang upgrade max levels
 */
export const GANG_UPGRADE_MAX_LEVELS = {
  [GangUpgradeType.VAULT_SIZE]: 10,
  [GangUpgradeType.MEMBER_SLOTS]: 5,
  [GangUpgradeType.WAR_CHEST]: 10,
  [GangUpgradeType.PERK_BOOSTER]: 5,
} as const;


/**
 * Gang search filters
 */
export interface GangSearchFilters {
  sortBy?: 'level' | 'members' | 'territories' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  hasSlots?: boolean;
  limit?: number;
  offset?: number;
}
