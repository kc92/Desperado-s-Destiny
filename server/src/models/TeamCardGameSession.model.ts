/**
 * Team Card Game Session Model
 * MongoDB persistence for team-based trick-taking card game sessions
 */

import mongoose, { Schema, Document } from 'mongoose';
import {
  TeamCardGameType,
  TeamCardGamePhase,
  TrickCard,
  PlayedCard,
  TrickResult,
  TeamCardRoundScore,
  BossMechanic,
  NPCDifficulty
} from '@desperados/shared';

// =============================================================================
// INTERFACES
// =============================================================================

export interface ITeamCardPlayer {
  characterId: string;
  characterName: string;
  isNPC: boolean;
  npcDifficulty?: NPCDifficulty;
  teamIndex: 0 | 1;
  seatIndex: 0 | 1 | 2 | 3;
  hand: TrickCard[];
  bid?: any;
  melds?: any[];
  tricksWonRound: number;
  tricksWonTotal: number;
  isConnected: boolean;
  socketId?: string;
  lastActionAt: number;
  isReady: boolean;
  gamblingSkill: number;
  perceptionSkill: number;
  deceptionSkill: number;
  sleightOfHandSkill: number;
  contributionScore: number;
  mechanicsCountered: number;
  perfectTricks: number;
  clutchPlays: number;
}

export interface ITeamCardGameSession extends Document {
  sessionId: string;
  gameType: TeamCardGameType;

  // Raid configuration
  raidMode: boolean;
  raidBossId?: string;

  // Players (4 slots)
  players: ITeamCardPlayer[];

  // Game phase
  phase: TeamCardGamePhase;

  // Round tracking
  currentRound: number;
  maxRounds: number;
  tricksPerRound: number;

  // Dealer and turn
  dealer: number;
  currentPlayer: number;

  // Trump/Contract
  trump?: string;
  contract?: any;
  declarer?: number;
  dummy?: number;

  // Euchre specific
  kitty?: TrickCard[];
  upCard?: TrickCard;
  maker?: number;
  goingAlone?: boolean;

  // Current trick
  currentTrick: PlayedCard[];
  trickNumber: number;
  tricksWon: [number, number];
  trickHistory: TrickResult[];

  // Hearts specific
  heartsBroken?: boolean;
  pointsTaken?: [number, number, number, number];

  // Spades specific
  bags?: [number, number];

  // Scoring
  teamScores: [number, number];
  roundScores: TeamCardRoundScore[];

  // Boss state
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: number;
  activeBossMechanics: any[];

  // Timing
  turnTimeLimit: number;
  turnStartedAt: number;
  createdAt: Date;
  expiresAt: Date;

  // Location
  locationId?: string;

  // Session state
  isPrivate: boolean;
  password?: string;

  // Instance methods
  getPlayer(characterId: string): ITeamCardPlayer | undefined;
  getPlayerIndex(characterId: string): number;
  hasPlayer(characterId: string): boolean;
  getEmptySeats(): number[];
  canStart(): boolean;
  isActive(): boolean;
  getTeamPlayers(teamIndex: 0 | 1): ITeamCardPlayer[];
  updatePlayerConnection(characterId: string, isConnected: boolean, socketId?: string): void;
  extendExpiry(minutes?: number): void;
}

// =============================================================================
// SCHEMAS
// =============================================================================

const TeamCardPlayerSchema = new Schema<ITeamCardPlayer>({
  characterId: { type: String, required: true },
  characterName: { type: String, required: true },
  isNPC: { type: Boolean, default: false },
  npcDifficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'] },
  teamIndex: { type: Number, enum: [0, 1], required: true },
  seatIndex: { type: Number, enum: [0, 1, 2, 3], required: true },
  hand: { type: Schema.Types.Mixed, default: [] },
  bid: { type: Schema.Types.Mixed },
  melds: [{ type: Schema.Types.Mixed }],
  tricksWonRound: { type: Number, default: 0 },
  tricksWonTotal: { type: Number, default: 0 },
  isConnected: { type: Boolean, default: true },
  socketId: { type: String },
  lastActionAt: { type: Number, default: Date.now },
  isReady: { type: Boolean, default: false },
  gamblingSkill: { type: Number, default: 1 },
  perceptionSkill: { type: Number, default: 1 },
  deceptionSkill: { type: Number, default: 1 },
  sleightOfHandSkill: { type: Number, default: 1 },
  contributionScore: { type: Number, default: 0 },
  mechanicsCountered: { type: Number, default: 0 },
  perfectTricks: { type: Number, default: 0 },
  clutchPlays: { type: Number, default: 0 }
}, { _id: false });

const TeamCardGameSessionSchema = new Schema<ITeamCardGameSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  gameType: {
    type: String,
    enum: Object.values(TeamCardGameType),
    required: true
  },

  // Raid configuration
  raidMode: { type: Boolean, default: false },
  raidBossId: { type: String },

  // Players
  players: [TeamCardPlayerSchema],

  // Game phase
  phase: {
    type: String,
    enum: Object.values(TeamCardGamePhase),
    default: TeamCardGamePhase.WAITING
  },

  // Round tracking
  currentRound: { type: Number, default: 1 },
  maxRounds: { type: Number, default: 10 },
  tricksPerRound: { type: Number, default: 13 },

  // Dealer and turn
  dealer: { type: Number, default: 0 },
  currentPlayer: { type: Number, default: 0 },

  // Trump/Contract
  trump: { type: String, enum: ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'] },
  contract: { type: Schema.Types.Mixed },
  declarer: { type: Number },
  dummy: { type: Number },

  // Euchre specific
  kitty: [{ type: Schema.Types.Mixed }],
  upCard: { type: Schema.Types.Mixed },
  maker: { type: Number },
  goingAlone: { type: Boolean, default: false },

  // Current trick
  currentTrick: [{
    card: { type: Schema.Types.Mixed },
    playerIndex: { type: Number },
    timestamp: { type: Number }
  }],
  trickNumber: { type: Number, default: 0 },
  tricksWon: { type: [Number], default: [0, 0] },
  trickHistory: [{ type: Schema.Types.Mixed }],

  // Hearts specific
  heartsBroken: { type: Boolean, default: false },
  pointsTaken: { type: [Number], default: [0, 0, 0, 0] },

  // Spades specific
  bags: { type: [Number], default: [0, 0] },

  // Scoring
  teamScores: { type: [Number], default: [0, 0] },
  roundScores: [{ type: Schema.Types.Mixed }],

  // Boss state
  bossHealth: { type: Number },
  bossMaxHealth: { type: Number },
  bossPhase: { type: Number, default: 1 },
  activeBossMechanics: [{ type: Schema.Types.Mixed }],

  // Timing
  turnTimeLimit: { type: Number, default: 30 },
  turnStartedAt: { type: Number, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },

  // Location
  locationId: { type: String },

  // Session state
  isPrivate: { type: Boolean, default: false },
  password: { type: String }
}, { timestamps: true });

// =============================================================================
// INDEXES
// =============================================================================

// TTL index for automatic cleanup of stale sessions
TeamCardGameSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for efficient queries
TeamCardGameSessionSchema.index({ gameType: 1, phase: 1 });
TeamCardGameSessionSchema.index({ raidMode: 1, raidBossId: 1 });
TeamCardGameSessionSchema.index({ 'players.characterId': 1 });
TeamCardGameSessionSchema.index({ locationId: 1 });

// =============================================================================
// PRE-SAVE HOOKS
// =============================================================================

// Set default expiry (2 hours for card games)
TeamCardGameSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  next();
});

// =============================================================================
// STATIC METHODS
// =============================================================================

TeamCardGameSessionSchema.statics.findBySessionId = function(sessionId: string) {
  return this.findOne({ sessionId });
};

TeamCardGameSessionSchema.statics.findByPlayer = function(characterId: string) {
  return this.findOne({
    'players.characterId': characterId,
    phase: { $ne: TeamCardGamePhase.GAME_COMPLETE }
  });
};

TeamCardGameSessionSchema.statics.findOpenLobbies = function(gameType?: TeamCardGameType) {
  const query: any = {
    phase: TeamCardGamePhase.WAITING,
    isPrivate: false
  };

  if (gameType) {
    query.gameType = gameType;
  }

  return this.find(query).sort({ createdAt: -1 }).limit(20);
};

TeamCardGameSessionSchema.statics.findActiveRaids = function(bossId?: string) {
  const query: any = {
    raidMode: true,
    phase: { $nin: [TeamCardGamePhase.GAME_COMPLETE, TeamCardGamePhase.WAITING] }
  };

  if (bossId) {
    query.raidBossId = bossId;
  }

  return this.find(query);
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

TeamCardGameSessionSchema.methods.getPlayer = function(characterId: string): ITeamCardPlayer | undefined {
  return this.players.find((p: ITeamCardPlayer) => p.characterId === characterId);
};

TeamCardGameSessionSchema.methods.getPlayerIndex = function(characterId: string): number {
  return this.players.findIndex((p: ITeamCardPlayer) => p.characterId === characterId);
};

TeamCardGameSessionSchema.methods.hasPlayer = function(characterId: string): boolean {
  return this.players.some((p: ITeamCardPlayer) => p.characterId === characterId);
};

TeamCardGameSessionSchema.methods.getEmptySeats = function(): number[] {
  const filledSeats = this.players.map((p: ITeamCardPlayer) => p.seatIndex);
  return [0, 1, 2, 3].filter(seat => !filledSeats.includes(seat));
};

TeamCardGameSessionSchema.methods.canStart = function(): boolean {
  // Need 4 players (NPCs count)
  if (this.players.length !== 4) return false;

  // All players must be ready (NPCs are always ready)
  return this.players.every((p: ITeamCardPlayer) => p.isReady || p.isNPC);
};

TeamCardGameSessionSchema.methods.isActive = function(): boolean {
  return this.phase !== TeamCardGamePhase.WAITING &&
         this.phase !== TeamCardGamePhase.GAME_COMPLETE;
};

TeamCardGameSessionSchema.methods.getTeamPlayers = function(teamIndex: 0 | 1): ITeamCardPlayer[] {
  return this.players.filter((p: ITeamCardPlayer) => p.teamIndex === teamIndex);
};

TeamCardGameSessionSchema.methods.updatePlayerConnection = function(
  characterId: string,
  isConnected: boolean,
  socketId?: string
) {
  const player = this.getPlayer(characterId);
  if (player) {
    player.isConnected = isConnected;
    player.socketId = socketId;
    player.lastActionAt = Date.now();
  }
};

TeamCardGameSessionSchema.methods.extendExpiry = function(minutes: number = 30) {
  this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
};

// =============================================================================
// VIRTUALS
// =============================================================================

TeamCardGameSessionSchema.virtual('humanPlayerCount').get(function() {
  return this.players.filter((p: ITeamCardPlayer) => !p.isNPC).length;
});

TeamCardGameSessionSchema.virtual('npcCount').get(function() {
  return this.players.filter((p: ITeamCardPlayer) => p.isNPC).length;
});

TeamCardGameSessionSchema.virtual('connectedPlayerCount').get(function() {
  return this.players.filter((p: ITeamCardPlayer) => p.isConnected && !p.isNPC).length;
});

TeamCardGameSessionSchema.virtual('averageTeamSkill').get(function() {
  if (this.players.length === 0) return 0;
  const totalSkill = this.players.reduce((sum: number, p: ITeamCardPlayer) =>
    sum + p.gamblingSkill, 0
  );
  return totalSkill / this.players.length;
});

// =============================================================================
// EXPORT
// =============================================================================

// Type for static methods
export interface TeamCardGameSessionModel extends mongoose.Model<ITeamCardGameSession> {
  findBySessionId(sessionId: string): Promise<ITeamCardGameSession | null>;
  findByPlayer(characterId: string): Promise<ITeamCardGameSession | null>;
  findOpenLobbies(gameType?: TeamCardGameType): Promise<ITeamCardGameSession[]>;
  findActiveRaids(bossId?: string): Promise<ITeamCardGameSession[]>;
}

export const TeamCardGameSession = mongoose.model<ITeamCardGameSession, TeamCardGameSessionModel>(
  'TeamCardGameSession',
  TeamCardGameSessionSchema
);
