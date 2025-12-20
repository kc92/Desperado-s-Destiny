import mongoose, { Schema, Document } from 'mongoose';

export interface IRitualSession extends Document {
  sessionId: string;
  ritualId: string;
  characterId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  startedAt: Date;
  completesAt: Date;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  expiresAt: Date;
}

const RitualSessionSchema = new Schema<IRitualSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  ritualId: { type: String, required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true, index: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  startedAt: { type: Date, default: Date.now },
  completesAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed', 'cancelled'],
    default: 'in_progress',
    index: true
  },
  expiresAt: { type: Date, required: true, index: true }
});

// TTL index - auto delete expired sessions
RitualSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for finding active rituals
RitualSessionSchema.index({ characterId: 1, status: 1 });

RitualSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Expire 1 hour after completion time
    this.expiresAt = new Date(this.completesAt.getTime() + 60 * 60 * 1000);
  }
  next();
});

export const RitualSession = mongoose.model<IRitualSession>('RitualSession', RitualSessionSchema);
