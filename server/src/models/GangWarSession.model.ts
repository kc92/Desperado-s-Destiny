import mongoose, { Schema, Document } from 'mongoose';

export type GangWarSessionType = 'raid' | 'champion_duel' | 'leader_showdown';

export interface IGangWarSession extends Document {
  sessionId: string;
  warId: mongoose.Types.ObjectId;
  type: GangWarSessionType;
  characterId?: mongoose.Types.ObjectId;
  characterName?: string;
  side?: 'attacker' | 'defender';
  gameState: any;

  // For duels/showdowns
  attackerChampionId?: mongoose.Types.ObjectId;
  defenderChampionId?: mongoose.Types.ObjectId;
  attackerState?: any;
  defenderState?: any;
  attackerResolved?: boolean;
  defenderResolved?: boolean;
  attackerResult?: any;
  defenderResult?: any;

  createdAt: Date;
  expiresAt: Date;
}

const GangWarSessionSchema = new Schema<IGangWarSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  warId: { type: Schema.Types.ObjectId, ref: 'GangWar', required: true, index: true },
  type: { type: String, enum: ['raid', 'champion_duel', 'leader_showdown'], required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
  characterName: String,
  side: { type: String, enum: ['attacker', 'defender'] },
  gameState: { type: Schema.Types.Mixed },
  attackerChampionId: { type: Schema.Types.ObjectId, ref: 'Character' },
  defenderChampionId: { type: Schema.Types.ObjectId, ref: 'Character' },
  attackerState: { type: Schema.Types.Mixed },
  defenderState: { type: Schema.Types.Mixed },
  attackerResolved: Boolean,
  defenderResolved: Boolean,
  attackerResult: { type: Schema.Types.Mixed },
  defenderResult: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });

// TTL index for automatic cleanup
GangWarSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for efficient queries
GangWarSessionSchema.index({ warId: 1, type: 1 });

// Pre-save hook to set expiry (1 hour for gang wars)
GangWarSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  }
  next();
});

export const GangWarSession = mongoose.model<IGangWarSession>('GangWarSession', GangWarSessionSchema);
