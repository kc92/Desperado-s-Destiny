/**
 * Hawk Companion Model
 *
 * Tracks Hawk's state as a persistent mentor companion during tutorial (L1-10)
 * Manages expressions, mood, interaction history, and relationship building
 */

import mongoose, { Schema, Document, Model, ClientSession } from 'mongoose';
import { TutorialPhase } from './TutorialProgress.model';

/**
 * Hawk's expressions for portrait system (10 expressions)
 */
export enum HawkExpression {
  NEUTRAL = 'neutral',           // Default standing pose
  TEACHING = 'teaching',         // Pointing gesture, explaining
  WARNING = 'warning',           // Serious face, raised eyebrow
  PLEASED = 'pleased',           // Slight smile, approving nod
  THINKING = 'thinking',         // Hand on chin, contemplative
  CONCERNED = 'concerned',       // Worried look
  AMUSED = 'amused',             // Dry smile, crinkled eyes
  PROUD = 'proud',               // Warm smile, chest out
  FAREWELL = 'farewell',         // Bittersweet, tipping hat
  COMBAT_READY = 'combat_ready', // Alert, hand on rifle
}

/**
 * Hawk's mood - affects dialogue tone
 */
export enum HawkMood {
  FRIENDLY = 'friendly',         // Default
  CONCERNED = 'concerned',       // Player struggling
  PROUD = 'proud',               // Player doing well
  URGENT = 'urgent',             // Time-sensitive situation
  NOSTALGIC = 'nostalgic',       // Near graduation
}

/**
 * Hawk's canonical profile
 */
export const HAWK_PROFILE = {
  id: 'hawk',
  fullName: 'Ezra "Hawk" Hawthorne',
  nickname: 'Hawk',
  age: 58,
  heritage: 'Mixed (Irish-American father, Lakota mother)',

  history: `Former U.S. Army scout who witnessed the Sand Creek Massacre.
            Resigned in disgust and has lived on the frontier ever since.
            Known for his tracking skills and ability to survive anywhere.
            Has a $500 bounty in Colorado Territory from helping Native families escape.`,

  personality: {
    tone: 'gruff_but_caring',
    speakingStyle: 'frontier_wisdom',
    humor: 'dry_sarcasm',
    values: ['survival', 'independence', 'justice', 'respect_for_nature'],
  },

  faction: 'NEUTRAL',

  appearance: {
    description: 'Weather-worn face, sharp observant eyes, long grey-streaked hair',
    distinguishingFeatures: ['Hawk feather in hat', 'Beaded leather vest', 'Old army rifle'],
  },

  expressions: Object.values(HawkExpression),
};

/**
 * Topics the player can discuss with Hawk
 */
export type HawkTopic =
  | 'combat'
  | 'survival'
  | 'skills'
  | 'factions'
  | 'gangs'
  | 'economy'
  | 'reputation'
  | 'frontier_life'
  | 'hawk_past'
  | 'general_advice';

/**
 * Hawk Companion document interface
 */
export interface IHawkCompanion extends Document {
  characterId: mongoose.Types.ObjectId;

  // State
  isActive: boolean;
  currentExpression: HawkExpression;
  mood: HawkMood;

  // Relationship
  interactionCount: number;
  favoriteTopics: HawkTopic[];
  lastInteractionAt: Date;

  // Position tracking
  lastSeenLocation: string;
  isFollowing: boolean;

  // Tutorial context
  currentPhase: TutorialPhase;
  tipsShown: string[];
  questsGuided: string[];
  dialoguesViewed: string[];

  // Special interactions
  personalStoriesShared: string[];
  adviceGiven: string[];

  // Graduation
  graduatedAt?: Date;
  farewellGiven: boolean;
  farewellChoice?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods interface
 */
export interface IHawkCompanionModel extends Model<IHawkCompanion> {
  findByCharacterId(characterId: string | mongoose.Types.ObjectId): Promise<IHawkCompanion | null>;
  findOrCreate(characterId: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<IHawkCompanion>;
  activate(characterId: string | mongoose.Types.ObjectId, phase: TutorialPhase, session?: ClientSession): Promise<IHawkCompanion>;
  deactivate(characterId: string | mongoose.Types.ObjectId, graduated: boolean, session?: ClientSession): Promise<void>;
}

/**
 * Hawk Companion Schema
 */
const HawkCompanionSchema = new Schema<IHawkCompanion>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    // State
    isActive: {
      type: Boolean,
      default: true
    },
    currentExpression: {
      type: String,
      enum: Object.values(HawkExpression),
      default: HawkExpression.NEUTRAL
    },
    mood: {
      type: String,
      enum: Object.values(HawkMood),
      default: HawkMood.FRIENDLY
    },

    // Relationship
    interactionCount: {
      type: Number,
      default: 0,
      min: 0
    },
    favoriteTopics: [{
      type: String,
      enum: ['combat', 'survival', 'skills', 'factions', 'gangs', 'economy', 'reputation', 'frontier_life', 'hawk_past', 'general_advice']
    }],
    lastInteractionAt: {
      type: Date,
      default: Date.now
    },

    // Position tracking
    lastSeenLocation: {
      type: String,
      default: ''
    },
    isFollowing: {
      type: Boolean,
      default: true
    },

    // Tutorial context
    currentPhase: {
      type: String,
      enum: Object.values(TutorialPhase),
      default: TutorialPhase.NOT_STARTED
    },
    tipsShown: [{
      type: String
    }],
    questsGuided: [{
      type: String
    }],
    dialoguesViewed: [{
      type: String
    }],

    // Special interactions
    personalStoriesShared: [{
      type: String
    }],
    adviceGiven: [{
      type: String
    }],

    // Graduation
    graduatedAt: {
      type: Date
    },
    farewellGiven: {
      type: Boolean,
      default: false
    },
    farewellChoice: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
HawkCompanionSchema.index({ characterId: 1 }, { unique: true });
HawkCompanionSchema.index({ isActive: 1, currentPhase: 1 });

/**
 * Static: Find by character ID
 */
HawkCompanionSchema.statics.findByCharacterId = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<IHawkCompanion | null> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;
  return this.findOne({ characterId: id });
};

/**
 * Static: Find or create Hawk companion for a character
 */
HawkCompanionSchema.statics.findOrCreate = async function(
  characterId: string | mongoose.Types.ObjectId,
  session?: ClientSession
): Promise<IHawkCompanion> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;

  let companion = await this.findOne({ characterId: id }).session(session || null);

  if (!companion) {
    const newCompanion = new this({
      characterId: id,
      isActive: true,
      currentExpression: HawkExpression.NEUTRAL,
      mood: HawkMood.FRIENDLY,
      lastInteractionAt: new Date()
    });
    companion = await newCompanion.save({ session });
  }

  return companion;
};

/**
 * Static: Activate Hawk for a character's tutorial
 */
HawkCompanionSchema.statics.activate = async function(
  characterId: string | mongoose.Types.ObjectId,
  phase: TutorialPhase,
  session?: ClientSession
): Promise<IHawkCompanion> {
  const model = this as IHawkCompanionModel;
  const companion = await model.findOrCreate(characterId, session);

  companion.isActive = true;
  companion.currentPhase = phase;
  companion.currentExpression = HawkExpression.TEACHING;
  companion.mood = HawkMood.FRIENDLY;
  companion.lastInteractionAt = new Date();

  await companion.save({ session });
  return companion;
};

/**
 * Static: Deactivate Hawk (graduation or skip)
 */
HawkCompanionSchema.statics.deactivate = async function(
  characterId: string | mongoose.Types.ObjectId,
  graduated: boolean,
  session?: ClientSession
): Promise<void> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;

  const updateData: Partial<IHawkCompanion> = {
    isActive: false,
    currentExpression: graduated ? HawkExpression.FAREWELL : HawkExpression.CONCERNED,
    mood: graduated ? HawkMood.NOSTALGIC : HawkMood.CONCERNED
  };

  if (graduated) {
    updateData.graduatedAt = new Date();
    updateData.farewellGiven = true;
  }

  await this.findOneAndUpdate(
    { characterId: id },
    { $set: updateData },
    { session }
  );
};

/**
 * Get expression suitable for the current mood
 */
export function getExpressionForMood(mood: HawkMood): HawkExpression {
  switch (mood) {
    case HawkMood.FRIENDLY:
      return HawkExpression.NEUTRAL;
    case HawkMood.CONCERNED:
      return HawkExpression.CONCERNED;
    case HawkMood.PROUD:
      return HawkExpression.PROUD;
    case HawkMood.URGENT:
      return HawkExpression.WARNING;
    case HawkMood.NOSTALGIC:
      return HawkExpression.THINKING;
    default:
      return HawkExpression.NEUTRAL;
  }
}

/**
 * Get mood based on player performance metrics
 */
export function calculateMoodFromMetrics(metrics: {
  recentCombatLosses?: number;
  lowEnergy?: boolean;
  isNearGraduation?: boolean;
  consecutiveWins?: number;
}): HawkMood {
  // Near graduation triggers nostalgic mood
  if (metrics.isNearGraduation) {
    return HawkMood.NOSTALGIC;
  }

  // Player doing well
  if (metrics.consecutiveWins && metrics.consecutiveWins >= 3) {
    return HawkMood.PROUD;
  }

  // Player struggling
  if (metrics.recentCombatLosses && metrics.recentCombatLosses >= 2) {
    return HawkMood.CONCERNED;
  }

  // Urgent if low energy
  if (metrics.lowEnergy) {
    return HawkMood.URGENT;
  }

  return HawkMood.FRIENDLY;
}

export const HawkCompanion = mongoose.model<IHawkCompanion, IHawkCompanionModel>(
  'HawkCompanion',
  HawkCompanionSchema
);
