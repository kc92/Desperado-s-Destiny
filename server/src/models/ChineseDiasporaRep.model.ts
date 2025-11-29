/**
 * Chinese Diaspora Reputation Model
 *
 * Tracks character reputation with the hidden Chinese immigrant network
 * This system is separate from main faction reputation and must be discovered
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  DiasporaTrustLevel,
  NetworkStanding,
  DiscoveryMethodRep,
  TRUST_LEVELS
} from '@desperados/shared';

/**
 * Betrayal record for permanent tracking
 */
export interface BetrayalRecord {
  action: string;
  description: string;
  date: Date;
  severity: 'minor' | 'major' | 'unforgivable';
  witnesses: string[]; // NPC IDs who know about this
}

/**
 * Vouch record for network trust building
 */
export interface VouchRecord {
  voucherId: string; // Character ID or NPC ID who vouched
  voucherName: string;
  date: Date;
  trustGranted: number; // Reputation boost from vouch
}

/**
 * Secret entrusted to player
 */
export interface EntrustedSecret {
  secretId: string;
  description: string;
  npcId: string; // Who shared it
  learnedAt: Date;
  importance: 'low' | 'medium' | 'high' | 'critical';
  revealed: boolean; // If player revealed it (betrayal)
}

/**
 * Chinese Diaspora Reputation document interface
 */
export interface IChineseDiasporaRep extends Document {
  characterId: mongoose.Types.ObjectId;

  // Discovery
  discoveredNetwork: boolean;
  discoveryMethod: DiscoveryMethodRep | null;
  discoveryDate: Date | null;

  // Trust system
  trustLevel: DiasporaTrustLevel;
  reputationPoints: number; // 0-1000
  networkStanding: NetworkStanding;

  // Network knowledge
  knownNpcs: string[]; // NPC IDs the player knows about
  knownLocations: string[]; // Location IDs revealed to player
  completedQuests: string[]; // Quest IDs completed for network

  // Trust building
  vouchedBy: VouchRecord[]; // Who has vouched for this character
  hasVouchedFor: string[]; // Character IDs this character has vouched for

  // Secrets and trust
  secrets: EntrustedSecret[]; // Secrets shared with player
  betrayals: BetrayalRecord[]; // Betrayals (if any)

  // Services and access
  safeHouseAccess: boolean;
  safeHouseExpiresAt: Date | null;
  undergroundRailroadParticipant: boolean;
  permanentSafeHouse: boolean; // Dragon level only

  // Activity tracking
  lastInteraction: Date;
  weeklySecretKeeping: number; // Counter for passive rep gain
  lastWeeklyReset: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getTrustLevelInfo(): typeof TRUST_LEVELS[DiasporaTrustLevel];
  calculateTrustLevel(): DiasporaTrustLevel;
  canAccessService(service: string): boolean;
  addReputation(amount: number, reason: string): void;
  removeReputation(amount: number, reason: string): void;
  revealNPC(npcId: string): void;
  addSecret(secret: EntrustedSecret): void;
  recordBetrayal(betrayal: BetrayalRecord): void;
  isExiled(): boolean;
  canBeVouched(): boolean;
  grantSafeHouse(duration: number): void;
}

/**
 * Chinese Diaspora Reputation static methods interface
 */
export interface IChineseDiasporaRepModel extends Model<IChineseDiasporaRep> {
  getOrCreateReputation(characterId: string): Promise<IChineseDiasporaRep>;
  discoverNetwork(
    characterId: string,
    method: DiscoveryMethodRep,
    initialNpcId: string
  ): Promise<IChineseDiasporaRep>;
  getTopDragons(limit: number): Promise<IChineseDiasporaRep[]>;
}

/**
 * Chinese Diaspora Reputation schema definition
 */
const ChineseDiasporaRepSchema = new Schema<IChineseDiasporaRep>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    // Discovery
    discoveredNetwork: {
      type: Boolean,
      default: false
    },
    discoveryMethod: {
      type: String,
      enum: [...Object.values(DiscoveryMethodRep), null],
      default: null
    },
    discoveryDate: {
      type: Date,
      default: null
    },

    // Trust system
    trustLevel: {
      type: Number,
      enum: Object.values(DiasporaTrustLevel),
      default: DiasporaTrustLevel.OUTSIDER
    },
    reputationPoints: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000
    },
    networkStanding: {
      type: String,
      enum: Object.values(NetworkStanding),
      default: NetworkStanding.UNKNOWN
    },

    // Network knowledge
    knownNpcs: [{
      type: String
    }],
    knownLocations: [{
      type: String
    }],
    completedQuests: [{
      type: String
    }],

    // Trust building
    vouchedBy: [{
      voucherId: { type: String, required: true },
      voucherName: { type: String, required: true },
      date: { type: Date, default: Date.now },
      trustGranted: { type: Number, default: 0 }
    }],
    hasVouchedFor: [{
      type: String
    }],

    // Secrets and trust
    secrets: [{
      secretId: { type: String, required: true },
      description: { type: String, required: true },
      npcId: { type: String, required: true },
      learnedAt: { type: Date, default: Date.now },
      importance: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      revealed: { type: Boolean, default: false }
    }],
    betrayals: [{
      action: { type: String, required: true },
      description: { type: String, required: true },
      date: { type: Date, default: Date.now },
      severity: {
        type: String,
        enum: ['minor', 'major', 'unforgivable'],
        required: true
      },
      witnesses: [{ type: String }]
    }],

    // Services and access
    safeHouseAccess: {
      type: Boolean,
      default: false
    },
    safeHouseExpiresAt: {
      type: Date,
      default: null
    },
    undergroundRailroadParticipant: {
      type: Boolean,
      default: false
    },
    permanentSafeHouse: {
      type: Boolean,
      default: false
    },

    // Activity tracking
    lastInteraction: {
      type: Date,
      default: Date.now
    },
    weeklySecretKeeping: {
      type: Number,
      default: 0
    },
    lastWeeklyReset: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
ChineseDiasporaRepSchema.index({ characterId: 1 }, { unique: true });
ChineseDiasporaRepSchema.index({ trustLevel: -1, reputationPoints: -1 }); // Leaderboards
ChineseDiasporaRepSchema.index({ networkStanding: 1 });
ChineseDiasporaRepSchema.index({ discoveredNetwork: 1 });

/**
 * Instance method: Get trust level configuration
 */
ChineseDiasporaRepSchema.methods.getTrustLevelInfo = function(
  this: IChineseDiasporaRep
): typeof TRUST_LEVELS[DiasporaTrustLevel] {
  return TRUST_LEVELS[this.trustLevel];
};

/**
 * Instance method: Calculate trust level based on reputation points
 */
ChineseDiasporaRepSchema.methods.calculateTrustLevel = function(
  this: IChineseDiasporaRep
): DiasporaTrustLevel {
  const rep = this.reputationPoints;

  if (rep >= 900) return DiasporaTrustLevel.DRAGON;
  if (rep >= 600) return DiasporaTrustLevel.FAMILY;
  if (rep >= 300) return DiasporaTrustLevel.SIBLING;
  if (rep >= 100) return DiasporaTrustLevel.FRIEND;
  return DiasporaTrustLevel.OUTSIDER;
};

/**
 * Instance method: Check if character can access a specific service
 */
ChineseDiasporaRepSchema.methods.canAccessService = function(
  this: IChineseDiasporaRep,
  service: string
): boolean {
  if (this.networkStanding === NetworkStanding.EXILED) {
    return false;
  }

  const levelInfo = this.getTrustLevelInfo();
  return levelInfo.services.includes(service as any);
};

/**
 * Instance method: Add reputation with bounds checking
 */
ChineseDiasporaRepSchema.methods.addReputation = function(
  this: IChineseDiasporaRep,
  amount: number,
  reason: string
): void {
  if (this.networkStanding === NetworkStanding.EXILED) {
    // Exiled characters cannot gain reputation
    return;
  }

  const oldLevel = this.trustLevel;
  this.reputationPoints = Math.min(1000, this.reputationPoints + amount);
  this.trustLevel = this.calculateTrustLevel();

  // Update standing if reaching higher tiers
  if (this.trustLevel >= DiasporaTrustLevel.FAMILY && this.networkStanding !== NetworkStanding.HONORED) {
    this.networkStanding = NetworkStanding.HONORED;
  } else if (this.trustLevel >= DiasporaTrustLevel.SIBLING && this.networkStanding === NetworkStanding.NEUTRAL) {
    this.networkStanding = NetworkStanding.TRUSTED;
  }

  // Grant permanent safe house at Dragon level
  if (this.trustLevel === DiasporaTrustLevel.DRAGON && oldLevel < DiasporaTrustLevel.DRAGON) {
    this.permanentSafeHouse = true;
  }

  this.lastInteraction = new Date();
};

/**
 * Instance method: Remove reputation (can lead to exile)
 */
ChineseDiasporaRepSchema.methods.removeReputation = function(
  this: IChineseDiasporaRep,
  amount: number,
  reason: string
): void {
  this.reputationPoints = Math.max(0, this.reputationPoints - amount);
  this.trustLevel = this.calculateTrustLevel();

  // Severe reputation loss can change standing
  if (amount >= 200) {
    if (this.networkStanding === NetworkStanding.HONORED) {
      this.networkStanding = NetworkStanding.TRUSTED;
    } else if (this.networkStanding === NetworkStanding.TRUSTED) {
      this.networkStanding = NetworkStanding.SUSPICIOUS;
    }
  }

  this.lastInteraction = new Date();
};

/**
 * Instance method: Reveal NPC to player
 */
ChineseDiasporaRepSchema.methods.revealNPC = function(
  this: IChineseDiasporaRep,
  npcId: string
): void {
  if (!this.knownNpcs.includes(npcId)) {
    this.knownNpcs.push(npcId);
  }
};

/**
 * Instance method: Add secret to character's knowledge
 */
ChineseDiasporaRepSchema.methods.addSecret = function(
  this: IChineseDiasporaRep,
  secret: EntrustedSecret
): void {
  this.secrets.push(secret);
};

/**
 * Instance method: Record betrayal (severe reputation loss)
 */
ChineseDiasporaRepSchema.methods.recordBetrayal = function(
  this: IChineseDiasporaRep,
  betrayal: BetrayalRecord
): void {
  this.betrayals.push(betrayal);

  // Unforgivable betrayals lead to permanent exile
  if (betrayal.severity === 'unforgivable') {
    this.networkStanding = NetworkStanding.EXILED;
    this.reputationPoints = 0;
    this.safeHouseAccess = false;
    this.permanentSafeHouse = false;
  } else if (betrayal.severity === 'major') {
    this.networkStanding = NetworkStanding.SUSPICIOUS;
  }
};

/**
 * Instance method: Check if character is exiled
 */
ChineseDiasporaRepSchema.methods.isExiled = function(
  this: IChineseDiasporaRep
): boolean {
  return this.networkStanding === NetworkStanding.EXILED;
};

/**
 * Instance method: Check if character can be vouched for
 */
ChineseDiasporaRepSchema.methods.canBeVouched = function(
  this: IChineseDiasporaRep
): boolean {
  return (
    this.networkStanding !== NetworkStanding.EXILED &&
    this.trustLevel < DiasporaTrustLevel.DRAGON
  );
};

/**
 * Instance method: Grant safe house access
 */
ChineseDiasporaRepSchema.methods.grantSafeHouse = function(
  this: IChineseDiasporaRep,
  duration: number
): void {
  if (this.permanentSafeHouse) {
    // Already has permanent access
    return;
  }

  this.safeHouseAccess = true;
  this.safeHouseExpiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
};

/**
 * Static method: Get or create reputation for character
 */
ChineseDiasporaRepSchema.statics.getOrCreateReputation = async function(
  characterId: string
): Promise<IChineseDiasporaRep> {
  let rep = await this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId)
  });

  if (!rep) {
    rep = await this.create({
      characterId: new mongoose.Types.ObjectId(characterId),
      discoveredNetwork: false,
      networkStanding: NetworkStanding.UNKNOWN
    });
  }

  return rep;
};

/**
 * Static method: Discover network for first time
 */
ChineseDiasporaRepSchema.statics.discoverNetwork = async function(
  characterId: string,
  method: DiscoveryMethodRep,
  initialNpcId: string
): Promise<IChineseDiasporaRep> {
  const rep = await (this as any).getOrCreateReputation(characterId);

  if (!rep.discoveredNetwork) {
    rep.discoveredNetwork = true;
    rep.discoveryMethod = method;
    rep.discoveryDate = new Date();
    rep.networkStanding = NetworkStanding.NEUTRAL;
    rep.knownNpcs = [initialNpcId];
    rep.lastInteraction = new Date();
    await rep.save();
  }

  return rep;
};

/**
 * Static method: Get top Dragon-level characters (leaderboard)
 */
ChineseDiasporaRepSchema.statics.getTopDragons = async function(
  limit: number = 10
): Promise<IChineseDiasporaRep[]> {
  return this.find({
    trustLevel: DiasporaTrustLevel.DRAGON,
    networkStanding: { $ne: NetworkStanding.EXILED }
  })
    .sort({ reputationPoints: -1 })
    .limit(limit)
    .populate('characterId', 'name level faction');
};

/**
 * Chinese Diaspora Reputation model
 */
export const ChineseDiasporaRep = mongoose.model<IChineseDiasporaRep, IChineseDiasporaRepModel>(
  'ChineseDiasporaRep',
  ChineseDiasporaRepSchema
);
