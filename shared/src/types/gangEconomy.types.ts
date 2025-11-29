/**
 * Gang Economy System Types
 *
 * Shared types for gang economy, businesses, investments, and heists
 */

import { GangUpgradeType } from './gang.types';

/**
 * Gang Bank Account Types
 */
export enum GangBankAccountType {
  OPERATING_FUND = 'operating_fund',
  WAR_CHEST = 'war_chest',
  INVESTMENT_FUND = 'investment_fund',
  EMERGENCY_RESERVE = 'emergency_reserve',
}

/**
 * Gang Bank Accounts
 */
export interface GangBankAccounts {
  operatingFund: number;
  warChest: number;
  investmentFund: number;
  emergencyReserve: number;
  totalBalance: number;
}

/**
 * Enhanced Bank Transaction Types (extends existing GangBankTransactionType)
 */
export enum GangEconomyTransactionType {
  BUSINESS_INCOME = 'BUSINESS_INCOME',
  BUSINESS_PURCHASE = 'BUSINESS_PURCHASE',
  BUSINESS_SALE = 'BUSINESS_SALE',
  BUSINESS_RAID = 'BUSINESS_RAID',
  INVESTMENT_PURCHASE = 'INVESTMENT_PURCHASE',
  INVESTMENT_RETURN = 'INVESTMENT_RETURN',
  INVESTMENT_LOSS = 'INVESTMENT_LOSS',
  HEIST_COST = 'HEIST_COST',
  HEIST_PAYOUT = 'HEIST_PAYOUT',
  PAYROLL = 'PAYROLL',
  TRIBUTE_PAYMENT = 'TRIBUTE_PAYMENT',
  PROTECTION_PAYMENT = 'PROTECTION_PAYMENT',
  BRIBE_PAYMENT = 'BRIBE_PAYMENT',
  ACCOUNT_TRANSFER = 'ACCOUNT_TRANSFER',
  INTEREST_EARNED = 'INTEREST_EARNED',
}

/**
 * Bank Transaction with Account Type
 */
export interface GangBankAccountTransaction {
  _id: string;
  gangId: string;
  characterId?: string;
  characterName?: string;
  type: GangEconomyTransactionType;
  accountType: GangBankAccountType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: {
    businessId?: string;
    businessName?: string;
    investmentId?: string;
    heistId?: string;
    upgradeType?: GangUpgradeType;
    description?: string;
    fromAccount?: GangBankAccountType;
    toAccount?: GangBankAccountType;
  };
  timestamp: Date;
}

/**
 * Business Category
 */
export enum BusinessCategory {
  LEGITIMATE = 'legitimate',
  CRIMINAL = 'criminal',
}

/**
 * Business Type
 */
export enum BusinessType {
  // Legitimate
  SALOON = 'saloon',
  GENERAL_STORE = 'general_store',
  STABLE = 'stable',
  HOTEL = 'hotel',
  // Criminal
  GAMBLING_DEN = 'gambling_den',
  SMUGGLING_RING = 'smuggling_ring',
  PROTECTION_RACKET = 'protection_racket',
  COUNTERFEITING = 'counterfeiting',
}

/**
 * Risk Level
 */
export enum RiskLevel {
  SAFE = 'safe',
  RISKY = 'risky',
  VERY_RISKY = 'very_risky',
  EXTREMELY_RISKY = 'extremely_risky',
}

/**
 * Business Status
 */
export enum BusinessStatus {
  ACTIVE = 'active',
  RAIDED = 'raided',
  CLOSED = 'closed',
  UNDER_INVESTIGATION = 'under_investigation',
}

/**
 * Gang Business
 */
export interface GangBusiness {
  _id: string;
  gangId: string;
  gangName: string;
  name: string;
  category: BusinessCategory;
  businessType: BusinessType;
  location: string;
  startupCost: number;
  dailyIncome: {
    min: number;
    max: number;
  };
  riskLevel: RiskLevel;
  operatingCost: number;
  status: BusinessStatus;
  purchasedAt: Date;
  lastIncomeDate: Date;
  totalEarnings: number;
  raidCount: number;
  nextRaidCheck?: Date;
}

/**
 * Investment Type
 */
export enum InvestmentType {
  PROPERTY = 'property',
  SMUGGLING_ROUTE = 'smuggling_route',
  POLITICAL_INFLUENCE = 'political_influence',
  NPC_BUSINESS = 'npc_business',
}

/**
 * Investment Status
 */
export enum InvestmentStatus {
  ACTIVE = 'active',
  MATURED = 'matured',
  FAILED = 'failed',
  SEIZED = 'seized',
}

/**
 * Gang Investment
 */
export interface GangInvestment {
  _id: string;
  gangId: string;
  type: InvestmentType;
  name: string;
  description: string;
  investmentAmount: number;
  expectedReturn: number;
  actualReturn?: number;
  status: InvestmentStatus;
  purchasedAt: Date;
  maturityDate: Date;
  completedAt?: Date;
  riskLevel: RiskLevel;
}

/**
 * Payroll Entry
 */
export interface PayrollEntry {
  memberId: string;
  memberName: string;
  role: string;
  amount: number;
  bonuses?: number;
}

/**
 * Gang Payroll
 */
export interface GangPayroll {
  weeklyWages: PayrollEntry[];
  officerBonuses: PayrollEntry[];
  totalWeekly: number;
  lastPaid: Date;
  nextPayday: Date;
}

/**
 * Heist Target
 */
export enum HeistTarget {
  RED_GULCH_BANK = 'red_gulch_bank',
  WHISKEY_BEND_BANK = 'whiskey_bend_bank',
  FORT_ASHFORD_PAYROLL = 'fort_ashford_payroll',
  RAILROAD_EXPRESS = 'railroad_express',
  STAGECOACH = 'stagecoach',
  WEALTHY_ESTATE = 'wealthy_estate',
}

/**
 * Heist Role
 */
export enum HeistRole {
  LOOKOUT = 'lookout',
  SAFECRACKER = 'safecracker',
  MUSCLE = 'muscle',
  DRIVER = 'driver',
  MASTERMIND = 'mastermind',
}

/**
 * Heist Status
 */
export enum HeistStatus {
  PLANNING = 'planning',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Heist Outcome
 */
export enum HeistOutcome {
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILURE = 'failure',
}

/**
 * Heist Role Assignment
 */
export interface HeistRoleAssignment {
  role: HeistRole;
  characterId: string;
  characterName: string;
  skillLevel: number;
}

/**
 * Gang Heist
 */
export interface GangHeist {
  _id: string;
  gangId: string;
  gangName: string;
  target: HeistTarget;
  targetName: string;
  targetLocation: string;
  potentialPayout: {
    min: number;
    max: number;
  };
  requiredMembers: number;
  roles: HeistRoleAssignment[];
  planningProgress: number; // 0-100
  equipmentCost: number;
  riskLevel: number; // 1-100
  heatLevel: number; // Gang attention from law (1-100)
  status: HeistStatus;
  outcome?: HeistOutcome;
  actualPayout?: number;
  arrested?: string[]; // characterIds
  casualties?: string[]; // characterIds
  scheduledDate?: Date;
  completedDate?: Date;
  createdAt: Date;
}

/**
 * Financial Report
 */
export interface FinancialReport {
  weekStart: Date;
  weekEnd: Date;
  income: {
    businessIncome: number;
    investmentReturns: number;
    heistPayouts: number;
    memberDeposits: number;
    territoryIncome: number;
    other: number;
    total: number;
  };
  expenses: {
    payroll: number;
    businessCosts: number;
    heistCosts: number;
    tribute: number;
    protection: number;
    bribes: number;
    upgrades: number;
    other: number;
    total: number;
  };
  netIncome: number;
  topEarningBusiness?: {
    businessId: string;
    businessName: string;
    earnings: number;
  };
  topContributor?: {
    memberId: string;
    memberName: string;
    contribution: number;
  };
}

/**
 * Gang Economy Overview
 */
export interface GangEconomy {
  _id: string;
  gangId: string;
  gangName: string;
  bank: GangBankAccounts;
  businesses: GangBusiness[];
  investments: GangInvestment[];
  payroll: GangPayroll;
  weeklyReport?: FinancialReport;
  totalAssets: number;
  liquidAssets: number;
  debtOwed: number;
  creditRating: number; // 0-100, affects investment opportunities
  lastUpdated: Date;
}

/**
 * Business Configuration
 */
export interface BusinessConfig {
  type: BusinessType;
  name: string;
  category: BusinessCategory;
  startupCost: number;
  dailyIncome: { min: number; max: number };
  operatingCost: number;
  riskLevel: RiskLevel;
  description: string;
  requirements?: {
    gangLevel?: number;
    territoryControl?: string;
  };
}

/**
 * Heist Target Configuration
 */
export interface HeistTargetConfig {
  target: HeistTarget;
  name: string;
  location: string;
  description: string;
  potentialPayout: { min: number; max: number };
  requiredMembers: number;
  equipmentCost: number;
  baseRiskLevel: number;
  requiredRoles: HeistRole[];
  cooldownDays: number;
  requirements?: {
    gangLevel?: number;
    heatLevelMax?: number;
  };
}

/**
 * Business Purchase Request
 */
export interface BusinessPurchaseRequest {
  businessType: BusinessType;
  customName?: string;
  location: string;
}

/**
 * Heist Planning Request
 */
export interface HeistPlanningRequest {
  target: HeistTarget;
  roleAssignments: Array<{
    role: HeistRole;
    characterId: string;
  }>;
}

/**
 * Payroll Settings Request
 */
export interface PayrollSettingsRequest {
  wages: Array<{
    memberId: string;
    amount: number;
  }>;
  officerBonuses?: Array<{
    officerId: string;
    amount: number;
  }>;
}

/**
 * Account Transfer Request
 */
export interface AccountTransferRequest {
  fromAccount: GangBankAccountType;
  toAccount: GangBankAccountType;
  amount: number;
}

/**
 * Business Constants
 */
export const BUSINESS_CONFIGS: Record<BusinessType, Omit<BusinessConfig, 'type'>> = {
  [BusinessType.SALOON]: {
    name: 'Saloon',
    category: BusinessCategory.LEGITIMATE,
    startupCost: 1000,
    dailyIncome: { min: 50, max: 200 },
    operatingCost: 20,
    riskLevel: RiskLevel.SAFE,
    description: 'A respectable drinking establishment with gambling in the back',
  },
  [BusinessType.GENERAL_STORE]: {
    name: 'General Store',
    category: BusinessCategory.LEGITIMATE,
    startupCost: 800,
    dailyIncome: { min: 30, max: 100 },
    operatingCost: 15,
    riskLevel: RiskLevel.SAFE,
    description: 'Supplies and goods for frontier folk',
  },
  [BusinessType.STABLE]: {
    name: 'Stable',
    category: BusinessCategory.LEGITIMATE,
    startupCost: 1200,
    dailyIncome: { min: 40, max: 120 },
    operatingCost: 25,
    riskLevel: RiskLevel.SAFE,
    description: 'Horse boarding and trading',
  },
  [BusinessType.HOTEL]: {
    name: 'Hotel',
    category: BusinessCategory.LEGITIMATE,
    startupCost: 2000,
    dailyIncome: { min: 60, max: 250 },
    operatingCost: 40,
    riskLevel: RiskLevel.SAFE,
    description: 'Lodging for travelers and prospectors',
  },
  [BusinessType.GAMBLING_DEN]: {
    name: 'Gambling Den',
    category: BusinessCategory.CRIMINAL,
    startupCost: 2000,
    dailyIncome: { min: 100, max: 400 },
    operatingCost: 50,
    riskLevel: RiskLevel.RISKY,
    description: 'High-stakes gambling in the shadows',
  },
  [BusinessType.SMUGGLING_RING]: {
    name: 'Smuggling Ring',
    category: BusinessCategory.CRIMINAL,
    startupCost: 3000,
    dailyIncome: { min: 150, max: 500 },
    operatingCost: 80,
    riskLevel: RiskLevel.VERY_RISKY,
    description: 'Moving contraband across the border',
  },
  [BusinessType.PROTECTION_RACKET]: {
    name: 'Protection Racket',
    category: BusinessCategory.CRIMINAL,
    startupCost: 1500,
    dailyIncome: { min: 80, max: 300 },
    operatingCost: 30,
    riskLevel: RiskLevel.RISKY,
    description: 'Protecting businesses... from yourself',
    requirements: {
      territoryControl: 'required',
    },
  },
  [BusinessType.COUNTERFEITING]: {
    name: 'Counterfeiting Operation',
    category: BusinessCategory.CRIMINAL,
    startupCost: 5000,
    dailyIncome: { min: 200, max: 600 },
    operatingCost: 100,
    riskLevel: RiskLevel.EXTREMELY_RISKY,
    description: 'Printing fake money... what could go wrong?',
    requirements: {
      gangLevel: 5,
    },
  },
};

/**
 * Heist Target Constants
 */
export const HEIST_CONFIGS: Record<HeistTarget, Omit<HeistTargetConfig, 'target'>> = {
  [HeistTarget.RED_GULCH_BANK]: {
    name: 'Red Gulch Bank',
    location: 'Red Gulch',
    description: 'Small town bank with moderate security',
    potentialPayout: { min: 2000, max: 5000 },
    requiredMembers: 3,
    equipmentCost: 200,
    baseRiskLevel: 40,
    requiredRoles: [HeistRole.LOOKOUT, HeistRole.SAFECRACKER, HeistRole.MUSCLE],
    cooldownDays: 7,
  },
  [HeistTarget.WHISKEY_BEND_BANK]: {
    name: 'Whiskey Bend Bank',
    location: 'Whiskey Bend',
    description: 'Larger bank with better security',
    potentialPayout: { min: 3000, max: 8000 },
    requiredMembers: 4,
    equipmentCost: 400,
    baseRiskLevel: 60,
    requiredRoles: [HeistRole.LOOKOUT, HeistRole.SAFECRACKER, HeistRole.MUSCLE, HeistRole.DRIVER],
    cooldownDays: 14,
    requirements: {
      gangLevel: 3,
    },
  },
  [HeistTarget.FORT_ASHFORD_PAYROLL]: {
    name: 'Fort Ashford Payroll',
    location: 'Fort Ashford',
    description: 'Military payroll transport - extremely dangerous',
    potentialPayout: { min: 4000, max: 10000 },
    requiredMembers: 5,
    equipmentCost: 600,
    baseRiskLevel: 80,
    requiredRoles: [HeistRole.LOOKOUT, HeistRole.MASTERMIND, HeistRole.MUSCLE, HeistRole.MUSCLE, HeistRole.DRIVER],
    cooldownDays: 30,
    requirements: {
      gangLevel: 5,
      heatLevelMax: 50,
    },
  },
  [HeistTarget.RAILROAD_EXPRESS]: {
    name: 'Railroad Express',
    location: 'Various',
    description: 'Rob the train carrying valuables',
    potentialPayout: { min: 3500, max: 9000 },
    requiredMembers: 4,
    equipmentCost: 500,
    baseRiskLevel: 70,
    requiredRoles: [HeistRole.LOOKOUT, HeistRole.SAFECRACKER, HeistRole.MUSCLE, HeistRole.DRIVER],
    cooldownDays: 21,
    requirements: {
      gangLevel: 4,
    },
  },
  [HeistTarget.STAGECOACH]: {
    name: 'Stagecoach Robbery',
    location: 'Desert Road',
    description: 'Classic stagecoach holdup',
    potentialPayout: { min: 1000, max: 3000 },
    requiredMembers: 2,
    equipmentCost: 100,
    baseRiskLevel: 30,
    requiredRoles: [HeistRole.MUSCLE, HeistRole.DRIVER],
    cooldownDays: 3,
  },
  [HeistTarget.WEALTHY_ESTATE]: {
    name: 'Wealthy Estate',
    location: 'Rich District',
    description: 'Break into a wealthy ranch owner\'s estate',
    potentialPayout: { min: 2500, max: 6000 },
    requiredMembers: 3,
    equipmentCost: 300,
    baseRiskLevel: 50,
    requiredRoles: [HeistRole.LOOKOUT, HeistRole.SAFECRACKER, HeistRole.MUSCLE],
    cooldownDays: 10,
    requirements: {
      gangLevel: 2,
    },
  },
};

/**
 * Interest Rates
 */
export const BANK_INTEREST = {
  WEEKLY_RATE: 0.01 as number, // 1% per week
  MINIMUM_BALANCE: 1000 as number, // Minimum for interest
  BONUS_THRESHOLD: 10000 as number, // Bonus interest above this
  BONUS_RATE: 0.015 as number, // 1.5% for balances above threshold
};

/**
 * Payroll Constants
 */
export const PAYROLL_CONSTANTS = {
  DEFAULT_MEMBER_WAGE: 50,
  DEFAULT_OFFICER_WAGE: 150,
  DEFAULT_LEADER_WAGE: 300,
  MAX_WAGE: 1000,
  PAYROLL_DAY: 0, // Sunday = 0
} as const;
