/**
 * CardTable Model
 *
 * Represents a card game table at a tavern/saloon location.
 * Players can create, join, and play casual card games at these tables.
 *
 * Design considerations:
 * - Tables exist at specific saloon/tavern locations
 * - 4 seats per table (team games: seats 0,2 vs 1,3)
 * - TTL-based auto-cleanup for abandoned tables
 * - Stakes system for gold wagering
 * - AI can fill empty seats on host request
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { TeamCardGameType } from '@desperados/shared';

/**
 * Seat status at a card table
 */
export interface ITableSeat {
  seatIndex: 0 | 1 | 2 | 3;
  characterId: mongoose.Types.ObjectId | null;
  characterName: string | null;
  isReady: boolean;
  isNPC: boolean;
  joinedAt: Date | null;
}

/**
 * Stakes configuration for a table
 */
export interface ITableStakes {
  enabled: boolean;
  buyIn: number;        // Gold required to sit
  potTotal: number;     // Accumulated gold in pot
}

/**
 * Table status enum
 */
export enum TableStatus {
  WAITING = 'waiting',       // Waiting for players to join/ready up
  IN_PROGRESS = 'in_progress', // Game is active
  FINISHED = 'finished',     // Game complete, awaiting cleanup
}

/**
 * CardTable document interface
 */
export interface ICardTable extends Document {
  tableId: string;
  locationId: mongoose.Types.ObjectId;
  locationName: string;       // Denormalized for display
  hostId: mongoose.Types.ObjectId;
  hostName: string;           // Denormalized for display
  gameType: TeamCardGameType;
  seats: ITableSeat[];
  status: TableStatus;
  stakes: ITableStakes;
  sessionId: string | null;   // Reference to TeamCardGameSession when game starts
  lastActivityAt: Date;       // For tracking abandonment
  createdAt: Date;
  expiresAt: Date;

  // Instance methods
  canStartGame(): boolean;
  getPlayerCount(): number;
  getEmptySeats(): number[];
  hasPlayer(characterId: string): boolean;
  getPlayerSeat(characterId: string): number | null;
  extendExpiry(minutes?: number): void;
  toClientObject(): any;
}

/**
 * CardTable model interface with static methods
 */
export interface ICardTableModel extends Model<ICardTable> {
  findTablesAtLocation(locationId: string): Promise<ICardTable[]>;
  findActiveTableByPlayer(characterId: string): Promise<ICardTable | null>;
  findWaitingTables(locationId?: string): Promise<ICardTable[]>;
  cleanupExpiredTables(): Promise<number>;
}

/**
 * Default empty seats for a new table
 */
const createEmptySeats = (): ITableSeat[] => [
  { seatIndex: 0, characterId: null, characterName: null, isReady: false, isNPC: false, joinedAt: null },
  { seatIndex: 1, characterId: null, characterName: null, isReady: false, isNPC: false, joinedAt: null },
  { seatIndex: 2, characterId: null, characterName: null, isReady: false, isNPC: false, joinedAt: null },
  { seatIndex: 3, characterId: null, characterName: null, isReady: false, isNPC: false, joinedAt: null },
];

/**
 * Seat schema
 */
const TableSeatSchema = new Schema<ITableSeat>({
  seatIndex: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3],
  },
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null,
  },
  characterName: {
    type: String,
    default: null,
  },
  isReady: {
    type: Boolean,
    default: false,
  },
  isNPC: {
    type: Boolean,
    default: false,
  },
  joinedAt: {
    type: Date,
    default: null,
  },
}, { _id: false });

/**
 * Stakes schema
 */
const TableStakesSchema = new Schema<ITableStakes>({
  enabled: {
    type: Boolean,
    default: false,
  },
  buyIn: {
    type: Number,
    default: 0,
    min: 0,
  },
  potTotal: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

/**
 * CardTable schema
 */
const CardTableSchema = new Schema<ICardTable>({
  tableId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  hostName: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    required: true,
    enum: Object.values(TeamCardGameType),
  },
  seats: {
    type: [TableSeatSchema],
    default: createEmptySeats,
    validate: {
      validator: (seats: ITableSeat[]) => seats.length === 4,
      message: 'Table must have exactly 4 seats',
    },
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(TableStatus),
    default: TableStatus.WAITING,
    index: true,
  },
  stakes: {
    type: TableStakesSchema,
    default: () => ({ enabled: false, buyIn: 0, potTotal: 0 }),
  },
  sessionId: {
    type: String,
    default: null,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: false,
});

// TTL index - MongoDB auto-deletes when expiresAt is reached
CardTableSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for location + status queries
CardTableSchema.index({ locationId: 1, status: 1 });

// Index for finding player's active table
CardTableSchema.index({ 'seats.characterId': 1 });

/**
 * Pre-save hook to set expiry and validate
 */
CardTableSchema.pre('save', function(next) {
  // Set expiry to 30 minutes from creation if not set
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  }

  // Update lastActivityAt on any save
  this.lastActivityAt = new Date();

  next();
});

/**
 * Static method: Find all tables at a location
 */
CardTableSchema.statics.findTablesAtLocation = async function(
  locationId: string
): Promise<ICardTable[]> {
  return this.find({
    locationId: new mongoose.Types.ObjectId(locationId),
    status: { $ne: TableStatus.FINISHED },
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find a player's active table (if any)
 */
CardTableSchema.statics.findActiveTableByPlayer = async function(
  characterId: string
): Promise<ICardTable | null> {
  return this.findOne({
    'seats.characterId': new mongoose.Types.ObjectId(characterId),
    status: { $ne: TableStatus.FINISHED },
  });
};

/**
 * Static method: Find all waiting tables (optionally filtered by location)
 */
CardTableSchema.statics.findWaitingTables = async function(
  locationId?: string
): Promise<ICardTable[]> {
  const query: any = { status: TableStatus.WAITING };
  if (locationId) {
    query.locationId = new mongoose.Types.ObjectId(locationId);
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Static method: Cleanup expired/abandoned tables
 */
CardTableSchema.statics.cleanupExpiredTables = async function(): Promise<number> {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lte: new Date() } },
      { status: TableStatus.FINISHED },
      // Also cleanup tables with no activity for 15 minutes
      {
        status: TableStatus.WAITING,
        lastActivityAt: { $lte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    ],
  });
  return result.deletedCount;
};

/**
 * Instance method: Check if table can start (all seats filled and ready)
 */
CardTableSchema.methods.canStartGame = function(): boolean {
  if (this.status !== TableStatus.WAITING) {
    return false;
  }

  // All seats must be filled (either player or NPC)
  const allFilled = this.seats.every(
    (seat: ITableSeat) => seat.characterId !== null || seat.isNPC
  );

  // All non-NPC players must be ready
  const allReady = this.seats.every(
    (seat: ITableSeat) => seat.isNPC || seat.isReady
  );

  return allFilled && allReady;
};

/**
 * Instance method: Get number of players at table
 */
CardTableSchema.methods.getPlayerCount = function(): number {
  return this.seats.filter(
    (seat: ITableSeat) => seat.characterId !== null || seat.isNPC
  ).length;
};

/**
 * Instance method: Get empty seat indices
 */
CardTableSchema.methods.getEmptySeats = function(): number[] {
  return this.seats
    .filter((seat: ITableSeat) => seat.characterId === null && !seat.isNPC)
    .map((seat: ITableSeat) => seat.seatIndex);
};

/**
 * Instance method: Check if a specific player is at this table
 */
CardTableSchema.methods.hasPlayer = function(characterId: string): boolean {
  return this.seats.some(
    (seat: ITableSeat) => seat.characterId?.toString() === characterId
  );
};

/**
 * Instance method: Get seat index for a player
 */
CardTableSchema.methods.getPlayerSeat = function(characterId: string): number | null {
  const seat = this.seats.find(
    (s: ITableSeat) => s.characterId?.toString() === characterId
  );
  return seat ? seat.seatIndex : null;
};

/**
 * Instance method: Extend expiry time (when activity happens)
 */
CardTableSchema.methods.extendExpiry = function(minutes: number = 30): void {
  this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  this.lastActivityAt = new Date();
};

/**
 * Instance method: Convert to client-safe object
 */
CardTableSchema.methods.toClientObject = function(): any {
  return {
    tableId: this.tableId,
    locationId: this.locationId.toString(),
    locationName: this.locationName,
    hostId: this.hostId.toString(),
    hostName: this.hostName,
    gameType: this.gameType,
    seats: this.seats.map((seat: ITableSeat) => ({
      seatIndex: seat.seatIndex,
      characterId: seat.characterId?.toString() || null,
      characterName: seat.characterName,
      isReady: seat.isReady,
      isNPC: seat.isNPC,
    })),
    status: this.status,
    stakes: this.stakes,
    playerCount: this.getPlayerCount(),
    canStart: this.canStartGame(),
    createdAt: this.createdAt,
  };
};

export const CardTable = mongoose.model<ICardTable, ICardTableModel>(
  'CardTable',
  CardTableSchema
);

export default CardTable;
