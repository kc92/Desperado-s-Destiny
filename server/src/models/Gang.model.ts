/**
 * Gang Model
 *
 * Mongoose schema for gang system in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  GangRole,
  GangUpgradeType,
  GangPermission,
  GANG_LEVEL,
  GANG_CONSTRAINTS,
  GANG_UPGRADE_MAX_LEVELS,
} from '@desperados/shared';
import {
  getUpgradeBenefit,
  getMaxLevel,
  canUpgrade,
} from '../utils/gangUpgrades';

/**
 * Gang member subdocument
 */
export interface IGangMember {
  characterId: mongoose.Types.ObjectId;
  role: GangRole;
  joinedAt: Date;
  contribution: number;
}

/**
 * Gang perks
 */
export interface IGangPerks {
  xpBonus: number;
  goldBonus: number;
  energyBonus: number;
}

/**
 * Gang upgrades
 */
export interface IGangUpgrades {
  vaultSize: number;
  memberSlots: number;
  warChest: number;
  perkBooster: number;
}

/**
 * Gang statistics
 */
export interface IGangStats {
  totalWins: number;
  totalLosses: number;
  territoriesConquered: number;
  totalRevenue: number;
}

/**
 * Gang war settings (Phase 2.1: Weekly War Schedule)
 */
export interface IGangWarSettings {
  autoTournamentOptIn: boolean;
  preferredWarDays?: number[]; // 0-6 for Sun-Sat
}

/**
 * Gang document interface
 */
export interface IGang extends Document {
  name: string;
  tag: string;
  leaderId: mongoose.Types.ObjectId;
  members: IGangMember[];
  bank: number;
  level: number;
  perks: IGangPerks;
  upgrades: IGangUpgrades;
  territories: string[];
  stats: IGangStats;
  baseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  isActive: boolean;

  // Phase 2.1: Weekly War Schedule
  warSettings: IGangWarSettings;
  warCooldownUntil?: Date;

  isMember(characterId: string | mongoose.Types.ObjectId): boolean;
  isOfficer(characterId: string | mongoose.Types.ObjectId): boolean;
  isLeader(characterId: string | mongoose.Types.ObjectId): boolean;
  hasPermission(
    characterId: string | mongoose.Types.ObjectId,
    permission: GangPermission
  ): Promise<boolean>;
  getMemberRole(characterId: string | mongoose.Types.ObjectId): GangRole | null;
  addMember(characterId: mongoose.Types.ObjectId, role: GangRole): void;
  removeMember(characterId: string | mongoose.Types.ObjectId): void;
  promoteMember(
    characterId: string | mongoose.Types.ObjectId,
    newRole: GangRole
  ): void;
  canAfford(amount: number): boolean;
  calculateLevel(): Promise<number>;
  getActivePerks(): IGangPerks;
  getMaxBankCapacity(): number;
  getMaxMembers(): number;
  canUpgrade(upgradeType: GangUpgradeType): boolean;
  toSafeObject(): Record<string, unknown>;

  currentMembers: number;
  officerCount: number;
  territoriesCount: number;

  hasWarChest(): boolean;
  addTerritory(territoryId: string): void;
  removeTerritory(territoryId: string): void;
  incrementWins(): void;
  incrementLosses(): void;
}

/**
 * Gang static methods interface
 */
export interface IGangModel extends Model<IGang> {
  findByName(name: string): Promise<IGang | null>;
  findByTag(tag: string): Promise<IGang | null>;
  findByCharacterId(characterId: string | mongoose.Types.ObjectId): Promise<IGang | null>;
  findByMember(characterId: mongoose.Types.ObjectId): Promise<IGang | null>;
  isNameTaken(name: string): Promise<boolean>;
  isTagTaken(tag: string): Promise<boolean>;
}

/**
 * Gang member schema
 */
const GangMemberSchema = new Schema<IGangMember>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(GangRole),
      required: true,
      default: GangRole.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    contribution: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Gang schema definition
 */
const GangSchema = new Schema<IGang>(
  {
    name: {
      type: String,
      required: true,
      // Note: unique index defined below with collation for case-insensitivity
      trim: true,
      minlength: GANG_CONSTRAINTS.NAME_MIN_LENGTH,
      maxlength: GANG_CONSTRAINTS.NAME_MAX_LENGTH,
    },
    tag: {
      type: String,
      required: true,
      // Note: unique index defined below
      uppercase: true,
      trim: true,
      minlength: GANG_CONSTRAINTS.TAG_MIN_LENGTH,
      maxlength: GANG_CONSTRAINTS.TAG_MAX_LENGTH,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      // Note: index defined below
    },
    members: {
      type: [GangMemberSchema],
      default: [],
    },
    bank: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: GANG_LEVEL.MIN_LEVEL,
      max: GANG_LEVEL.MAX_LEVEL,
    },
    perks: {
      xpBonus: { type: Number, default: 5 },
      goldBonus: { type: Number, default: 0 },
      energyBonus: { type: Number, default: 0 },
    },
    upgrades: {
      vaultSize: {
        type: Number,
        default: 0,
        min: 0,
        max: GANG_UPGRADE_MAX_LEVELS[GangUpgradeType.VAULT_SIZE],
      },
      memberSlots: {
        type: Number,
        default: 0,
        min: 0,
        max: GANG_UPGRADE_MAX_LEVELS[GangUpgradeType.MEMBER_SLOTS],
      },
      warChest: {
        type: Number,
        default: 0,
        min: 0,
        max: GANG_UPGRADE_MAX_LEVELS[GangUpgradeType.WAR_CHEST],
      },
      perkBooster: {
        type: Number,
        default: 0,
        min: 0,
        max: GANG_UPGRADE_MAX_LEVELS[GangUpgradeType.PERK_BOOSTER],
      },
    },
    territories: {
      type: [String],
      default: [],
    },
    stats: {
      totalWins: { type: Number, default: 0 },
      totalLosses: { type: Number, default: 0 },
      territoriesConquered: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
    baseId: {
      type: Schema.Types.ObjectId,
      ref: 'GangBase',
      index: true,
    },

    // Phase 2.1: Weekly War Schedule
    warSettings: {
      autoTournamentOptIn: {
        type: Boolean,
        default: false,
      },
      preferredWarDays: {
        type: [Number],
        default: [],
        validate: {
          validator: (v: number[]) => v.every(d => d >= 0 && d <= 6),
          message: 'War days must be between 0 (Sunday) and 6 (Saturday)',
        },
      },
    },
    warCooldownUntil: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
GangSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
GangSchema.index({ tag: 1 }, { unique: true });
GangSchema.index({ leaderId: 1 });
GangSchema.index({ 'members.characterId': 1 });
GangSchema.index({ isActive: 1, level: -1 });
GangSchema.index({ baseId: 1 });

/**
 * Virtual: Current member count
 */
GangSchema.virtual('currentMembers').get(function (this: IGang) {
  return this.members.length;
});

/**
 * Virtual: Officer count (including leader)
 */
GangSchema.virtual('officerCount').get(function (this: IGang) {
  return this.members.filter(
    (m) => m.role === GangRole.OFFICER || m.role === GangRole.LEADER
  ).length;
});

/**
 * Virtual: Territories count
 */
GangSchema.virtual('territoriesCount').get(function (this: IGang) {
  return this.territories.length;
});

/**
 * Instance method: Check if character is a member
 */
GangSchema.methods.isMember = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId
): boolean {
  const id = characterId.toString();
  return this.members.some((m) => m.characterId.toString() === id);
};

/**
 * Instance method: Check if character is an officer or leader
 */
GangSchema.methods.isOfficer = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId
): boolean {
  const id = characterId.toString();
  const member = this.members.find((m) => m.characterId.toString() === id);
  return member ? (member.role === GangRole.OFFICER || member.role === GangRole.LEADER) : false;
};

/**
 * Instance method: Check if character is the leader
 */
GangSchema.methods.isLeader = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId
): boolean {
  const id = characterId.toString();
  return this.leaderId.toString() === id;
};

/**
 * Instance method: Get member role
 */
GangSchema.methods.getMemberRole = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId
): GangRole | null {
  const id = characterId.toString();
  const member = this.members.find((m) => m.characterId.toString() === id);
  return member ? member.role : null;
};

/**
 * Instance method: Check permission for a character
 */
GangSchema.methods.hasPermission = async function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId,
  permission: GangPermission
): Promise<boolean> {
  if (!this.isMember(characterId)) {
    return false;
  }

  const role = this.getMemberRole(characterId);
  if (!role) {
    return false;
  }

  switch (permission) {
    case GangPermission.VIEW_DETAILS:
    case GangPermission.DEPOSIT_BANK:
      return true;

    case GangPermission.INVITE_MEMBERS:
    case GangPermission.KICK_MEMBERS:
    case GangPermission.WITHDRAW_BANK:
      return role === GangRole.OFFICER || role === GangRole.LEADER;

    case GangPermission.PROMOTE_MEMBERS:
    case GangPermission.PURCHASE_UPGRADES:
    case GangPermission.DECLARE_WAR:
    case GangPermission.DISBAND_GANG:
      return role === GangRole.LEADER;

    default:
      return false;
  }
};

/**
 * Instance method: Add member to gang
 */
GangSchema.methods.addMember = function (
  this: IGang,
  characterId: mongoose.Types.ObjectId,
  role: GangRole = GangRole.MEMBER
): void {
  if (this.isMember(characterId)) {
    throw new Error('Character is already a member of this gang');
  }

  if (this.members.length >= this.getMaxMembers()) {
    throw new Error('Gang is at maximum capacity');
  }

  this.members.push({
    characterId,
    role,
    joinedAt: new Date(),
    contribution: 0,
  });
};

/**
 * Instance method: Remove member from gang
 */
GangSchema.methods.removeMember = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId
): void {
  const id = characterId.toString();
  const index = this.members.findIndex((m) => m.characterId.toString() === id);

  if (index === -1) {
    throw new Error('Character is not a member of this gang');
  }

  if (this.isLeader(characterId)) {
    throw new Error('Cannot remove the leader. Transfer leadership first.');
  }

  this.members.splice(index, 1);
};

/**
 * Instance method: Promote or demote member
 */
GangSchema.methods.promoteMember = function (
  this: IGang,
  characterId: string | mongoose.Types.ObjectId,
  newRole: GangRole
): void {
  const id = characterId.toString();
  const member = this.members.find((m) => m.characterId.toString() === id);

  if (!member) {
    throw new Error('Character is not a member of this gang');
  }

  if (newRole === GangRole.LEADER) {
    const currentLeader = this.members.find((m) => m.role === GangRole.LEADER);
    if (currentLeader) {
      currentLeader.role = GangRole.OFFICER;
    }
    this.leaderId = member.characterId;
  }

  member.role = newRole;
};

/**
 * Instance method: Check if gang can afford amount
 */
GangSchema.methods.canAfford = function (this: IGang, amount: number): boolean {
  return this.bank >= amount;
};

/**
 * Instance method: Calculate gang level based on member XP
 */
GangSchema.methods.calculateLevel = async function (this: IGang): Promise<number> {
  const Character = mongoose.model('Character');
  const memberIds = this.members.map((m) => m.characterId);

  const characters = await Character.find({ _id: { $in: memberIds } }).select('level');
  const totalMemberLevels = characters.reduce((sum, char: { level: number }) => sum + char.level, 0);
  const totalXP = totalMemberLevels * GANG_LEVEL.XP_PER_MEMBER_LEVEL;

  const calculatedLevel = Math.min(
    Math.floor(totalXP / 1000) + 1,
    GANG_LEVEL.MAX_LEVEL
  );

  return calculatedLevel;
};

/**
 * Instance method: Get active perks with perk booster multiplier
 */
GangSchema.methods.getActivePerks = function (this: IGang): IGangPerks {
  const boosterMultiplier = getUpgradeBenefit(GangUpgradeType.PERK_BOOSTER, this.upgrades.perkBooster);

  const baseXP = 5 + this.level;
  const baseGold = 0 + this.level * 2;
  const baseEnergy = Math.floor(this.level / 5);

  return {
    xpBonus: Math.floor(baseXP * boosterMultiplier),
    goldBonus: Math.floor(baseGold * boosterMultiplier),
    energyBonus: Math.floor(baseEnergy * boosterMultiplier),
  };
};

/**
 * Instance method: Get maximum bank capacity
 */
GangSchema.methods.getMaxBankCapacity = function (this: IGang): number {
  return getUpgradeBenefit(GangUpgradeType.VAULT_SIZE, this.upgrades.vaultSize);
};

/**
 * Instance method: Get maximum member count
 */
GangSchema.methods.getMaxMembers = function (this: IGang): number {
  return getUpgradeBenefit(GangUpgradeType.MEMBER_SLOTS, this.upgrades.memberSlots);
};

/**
 * Instance method: Check if upgrade type can be upgraded
 */
GangSchema.methods.canUpgrade = function (this: IGang, upgradeType: GangUpgradeType): boolean {
  const currentLevel = this.upgrades[upgradeType];
  return canUpgrade(upgradeType, currentLevel);
};

/**
 * Instance method: Return safe gang object (no sensitive data)
 */
GangSchema.methods.toSafeObject = function (this: IGang): Record<string, unknown> {
  const id = this._id.toString();
  return {
    id,
    _id: id,
    name: this.name,
    tag: this.tag,
    leaderId: this.leaderId.toString(),
    members: this.members.map((m) => ({
      characterId: m.characterId.toString(),
      role: m.role,
      joinedAt: m.joinedAt,
      contribution: m.contribution,
    })),
    bank: this.bank,
    level: this.level,
    perks: this.getActivePerks(),
    upgrades: this.upgrades,
    territories: this.territories,
    stats: this.stats,
    baseId: this.baseId?.toString(),
    createdAt: this.createdAt,
    currentMembers: this.currentMembers,
    officerCount: this.officerCount,
    territoriesCount: this.territoriesCount,
    maxMembers: this.getMaxMembers(),
    maxBankCapacity: this.getMaxBankCapacity(),
  };
};

/**
 * Instance method: Check if gang has war chest upgrade (backward compatibility)
 */
GangSchema.methods.hasWarChest = function (this: IGang): boolean {
  return this.upgrades.warChest >= 1;
};

/**
 * Instance method: Add territory to gang (backward compatibility)
 */
GangSchema.methods.addTerritory = function (this: IGang, territoryId: string): void {
  if (!this.territories.includes(territoryId)) {
    this.territories.push(territoryId);
    this.stats.territoriesConquered += 1;
  }
};

/**
 * Instance method: Remove territory from gang (backward compatibility)
 */
GangSchema.methods.removeTerritory = function (this: IGang, territoryId: string): void {
  const index = this.territories.indexOf(territoryId);
  if (index > -1) {
    this.territories.splice(index, 1);
  }
};

/**
 * Instance method: Increment wins (backward compatibility)
 */
GangSchema.methods.incrementWins = function (this: IGang): void {
  this.stats.totalWins += 1;
};

/**
 * Instance method: Increment losses (backward compatibility)
 */
GangSchema.methods.incrementLosses = function (this: IGang): void {
  this.stats.totalLosses += 1;
};

/**
 * Pre-save hook: Recalculate level and perks before saving
 */
GangSchema.pre('save', async function (next) {
  if (this.isModified('members')) {
    const newLevel = await this.calculateLevel();
    this.level = newLevel;
    this.perks = this.getActivePerks();
  }

  if (this.isModified('upgrades.perkBooster')) {
    this.perks = this.getActivePerks();
  }

  if (this.members.length > this.getMaxMembers()) {
    throw new Error(`Gang exceeds maximum member capacity of ${this.getMaxMembers()}`);
  }

  next();
});

/**
 * Static method: Find gang by name (case-insensitive)
 */
GangSchema.statics.findByName = async function (name: string): Promise<IGang | null> {
  return this.findOne({ name, isActive: true }).collation({ locale: 'en', strength: 2 });
};

/**
 * Static method: Find gang by tag (case-insensitive)
 */
GangSchema.statics.findByTag = async function (tag: string): Promise<IGang | null> {
  return this.findOne({ tag: tag.toUpperCase(), isActive: true });
};

/**
 * Static method: Find gang by character ID
 */
GangSchema.statics.findByCharacterId = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<IGang | null> {
  const id = typeof characterId === 'string' ? new mongoose.Types.ObjectId(characterId) : characterId;
  return this.findOne({
    'members.characterId': id,
    isActive: true,
  });
};

/**
 * Static method: Find gang by member character ID (backward compatibility)
 */
GangSchema.statics.findByMember = async function (
  characterId: mongoose.Types.ObjectId
): Promise<IGang | null> {
  return (this as IGangModel).findByCharacterId(characterId);
};

/**
 * Static method: Check if gang name is taken
 */
GangSchema.statics.isNameTaken = async function (name: string): Promise<boolean> {
  const gang = await this.findOne({ name, isActive: true }).collation({ locale: 'en', strength: 2 });
  return !!gang;
};

/**
 * Static method: Check if gang tag is taken
 */
GangSchema.statics.isTagTaken = async function (tag: string): Promise<boolean> {
  const gang = await this.findOne({ tag: tag.toUpperCase(), isActive: true });
  return !!gang;
};

/**
 * Gang model
 */
export const Gang = mongoose.model<IGang, IGangModel>('Gang', GangSchema);
