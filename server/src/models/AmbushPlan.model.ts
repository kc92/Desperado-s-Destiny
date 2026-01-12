import mongoose, { Schema, Document } from 'mongoose';

export interface IAmbushPlan extends Document {
  characterId: mongoose.Types.ObjectId;
  routeId: string;
  ambushSpotId: string;
  scheduledTime: Date;
  setupTime: number;
  gangMembers?: string[];
  strategy: 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack';
  objectives: ('cargo' | 'passengers' | 'mail' | 'strongbox')[];
  escapeRoute: string;
  status: 'planning' | 'setup' | 'ready' | 'executed' | 'failed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
}

const AmbushPlanSchema = new Schema<IAmbushPlan>({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  routeId: { type: String, required: true },
  ambushSpotId: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  setupTime: { type: Number, required: true },
  gangMembers: [{ type: String }],
  strategy: {
    type: String,
    enum: ['roadblock', 'canyon_trap', 'bridge_sabotage', 'surprise_attack'],
    required: true
  },
  objectives: [{
    type: String,
    enum: ['cargo', 'passengers', 'mail', 'strongbox']
  }],
  escapeRoute: { type: String, required: true },
  status: {
    type: String,
    enum: ['planning', 'setup', 'ready', 'executed', 'failed', 'cancelled'],
    default: 'planning'
    // Note: indexed via compound index below
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
  // Note: expiresAt indexed via TTL index below
});

// TTL index - automatically delete documents after they expire
AmbushPlanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for finding active plans
AmbushPlanSchema.index({ characterId: 1, status: 1 });

// Pre-save hook to set default expiration if not provided
AmbushPlanSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Plans expire 2 hours after creation
    this.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  next();
});

export const AmbushPlanModel = mongoose.model<IAmbushPlan>('AmbushPlan', AmbushPlanSchema);
