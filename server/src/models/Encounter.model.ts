/**
 * Encounter Model
 *
 * Random travel encounters that occur when moving between locations
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { RegionType } from '@desperados/shared';

/**
 * Encounter types
 */
export enum EncounterType {
  COMBAT = 'COMBAT',       // Fight NPCs/creatures
  EVENT = 'EVENT',         // Choice-based event with outcomes
  DISCOVERY = 'DISCOVERY', // Find items, locations, secrets
  STORY = 'STORY'          // Narrative moments, lore
}

/**
 * Time restrictions for encounters
 */
export enum TimeRestriction {
  DAY = 'DAY',     // 6am - 10pm
  NIGHT = 'NIGHT', // 10pm - 6am
  ANY = 'ANY'      // Any time
}

/**
 * Encounter outcome effect
 */
export interface EncounterEffect {
  gold?: number;           // Gold gained/lost (negative = lost)
  xp?: number;            // XP gained
  damage?: number;        // HP damage taken
  items?: string[];       // Items gained
  itemsLost?: string[];   // Items lost
  wantedLevel?: number;   // Change to wanted level
  reputation?: {
    faction: 'settler' | 'nahi' | 'frontera';
    amount: number;       // Positive or negative
  };
  energyCost?: number;    // Additional energy cost
}

/**
 * Requirements for an outcome choice
 */
export interface EncounterRequirement {
  minLevel?: number;
  skill?: {
    skillId: string;
    level: number;
  };
  item?: string;          // Must have this item
  gold?: number;          // Must have this much gold
}

/**
 * Possible outcome for an encounter choice
 */
export interface EncounterOutcome {
  id: string;
  description: string;
  buttonText: string;      // What the player sees as the choice
  effects: EncounterEffect;
  requirements?: EncounterRequirement;
  successChance?: number;  // 0-100, if undefined = guaranteed
  failureEffects?: EncounterEffect; // Effects if success roll fails
}

/**
 * Encounter Definition (template)
 */
export interface IEncounterDefinition extends Document {
  // Identity
  name: string;
  description: string;
  type: EncounterType;

  // Where/when it can occur
  regions: RegionType[];
  minDangerLevel: number;  // 1-10
  maxDangerLevel: number;  // 1-10
  timeRestriction: TimeRestriction;

  // Rarity and conditions
  weight: number;          // Higher = more common (1-100)
  minLevel?: number;       // Min character level
  maxLevel?: number;       // Max character level (for starter encounters)

  // Story/flavor
  atmosphere?: string;     // Additional flavor text
  imageUrl?: string;       // Optional image

  // Outcomes (player choices)
  outcomes: EncounterOutcome[];

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Active Encounter (player's current encounter)
 */
export interface IActiveEncounter extends Document {
  // Ownership
  characterId: mongoose.Types.ObjectId;

  // Encounter reference
  encounterId: mongoose.Types.ObjectId; // References EncounterDefinition
  encounterName: string;                 // Cached for display
  encounterDescription: string;          // Cached for display
  encounterType: EncounterType;

  // Location context
  fromLocationId: string;
  toLocationId: string;
  region: RegionType;

  // Status
  isResolved: boolean;
  selectedOutcomeId?: string;   // Which choice was made
  outcomeEffects?: EncounterEffect; // Effects that were applied

  // Timestamps
  createdAt: Date;
  resolvedAt?: Date;
}

/**
 * Encounter Definition Schema
 */
const EncounterDefinitionSchema = new Schema<IEncounterDefinition>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1000
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(EncounterType),
      index: true
    },
    regions: [{
      type: String,
      enum: [
        'town',
        'dusty_flats',
        'devils_canyon',
        'sangre_mountains',
        'border_territories',
        'ghost_towns',
        'sacred_lands',
        'outlaw_territory',
        'frontier'
      ] as RegionType[]
    }],
    minDangerLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    maxDangerLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    timeRestriction: {
      type: String,
      required: true,
      enum: Object.values(TimeRestriction),
      default: TimeRestriction.ANY
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 50
    },
    minLevel: {
      type: Number,
      min: 1,
      required: false
    },
    maxLevel: {
      type: Number,
      min: 1,
      required: false
    },
    atmosphere: {
      type: String,
      maxlength: 500,
      required: false
    },
    imageUrl: {
      type: String,
      required: false
    },
    outcomes: [{
      id: { type: String, required: true },
      description: { type: String, required: true },
      buttonText: { type: String, required: true },
      effects: {
        gold: { type: Number },
        xp: { type: Number },
        damage: { type: Number },
        items: [{ type: String }],
        itemsLost: [{ type: String }],
        wantedLevel: { type: Number },
        reputation: {
          faction: { type: String, enum: ['settler', 'nahi', 'frontera'] },
          amount: { type: Number }
        },
        energyCost: { type: Number }
      },
      requirements: {
        minLevel: { type: Number },
        skill: {
          skillId: { type: String },
          level: { type: Number }
        },
        item: { type: String },
        gold: { type: Number }
      },
      successChance: { type: Number, min: 0, max: 100 },
      failureEffects: {
        gold: { type: Number },
        xp: { type: Number },
        damage: { type: Number },
        items: [{ type: String }],
        itemsLost: [{ type: String }],
        wantedLevel: { type: Number },
        reputation: {
          faction: { type: String, enum: ['settler', 'nahi', 'frontera'] },
          amount: { type: Number }
        },
        energyCost: { type: Number }
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Active Encounter Schema
 */
const ActiveEncounterSchema = new Schema<IActiveEncounter>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    encounterId: {
      type: Schema.Types.ObjectId,
      ref: 'EncounterDefinition',
      required: true
    },
    encounterName: {
      type: String,
      required: true
    },
    encounterDescription: {
      type: String,
      required: true
    },
    encounterType: {
      type: String,
      required: true,
      enum: Object.values(EncounterType)
    },
    fromLocationId: {
      type: String,
      required: true
    },
    toLocationId: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true
    },
    selectedOutcomeId: {
      type: String,
      required: false
    },
    outcomeEffects: {
      gold: { type: Number },
      xp: { type: Number },
      damage: { type: Number },
      items: [{ type: String }],
      itemsLost: [{ type: String }],
      wantedLevel: { type: Number },
      reputation: {
        faction: { type: String, enum: ['settler', 'nahi', 'frontera'] },
        amount: { type: Number }
      },
      energyCost: { type: Number }
    },
    resolvedAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
EncounterDefinitionSchema.index({ type: 1, isActive: 1 });
EncounterDefinitionSchema.index({ regions: 1 });
EncounterDefinitionSchema.index({ minDangerLevel: 1, maxDangerLevel: 1 });
EncounterDefinitionSchema.index({ weight: -1 });

ActiveEncounterSchema.index({ characterId: 1, isResolved: 1 });
ActiveEncounterSchema.index({ createdAt: -1 });

/**
 * Encounter Definition static methods
 */
export interface IEncounterDefinitionModel extends Model<IEncounterDefinition> {
  findActiveEncounters(): Promise<IEncounterDefinition[]>;
  findByRegionAndDanger(region: RegionType, dangerLevel: number): Promise<IEncounterDefinition[]>;
}

EncounterDefinitionSchema.statics.findActiveEncounters = async function(): Promise<IEncounterDefinition[]> {
  return this.find({ isActive: true }).sort({ weight: -1 });
};

EncounterDefinitionSchema.statics.findByRegionAndDanger = async function(
  region: RegionType,
  dangerLevel: number
): Promise<IEncounterDefinition[]> {
  return this.find({
    isActive: true,
    regions: region,
    minDangerLevel: { $lte: dangerLevel },
    maxDangerLevel: { $gte: dangerLevel }
  });
};

/**
 * Active Encounter static methods
 */
export interface IActiveEncounterModel extends Model<IActiveEncounter> {
  findUnresolvedByCharacter(characterId: string): Promise<IActiveEncounter | null>;
  resolveEncounter(encounterId: string, outcomeId: string, effects: EncounterEffect): Promise<IActiveEncounter>;
}

ActiveEncounterSchema.statics.findUnresolvedByCharacter = async function(
  characterId: string
): Promise<IActiveEncounter | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    isResolved: false
  }).sort({ createdAt: -1 });
};

ActiveEncounterSchema.statics.resolveEncounter = async function(
  encounterId: string,
  outcomeId: string,
  effects: EncounterEffect
): Promise<IActiveEncounter> {
  const encounter = await this.findById(encounterId);
  if (!encounter) {
    throw new Error('Encounter not found');
  }

  encounter.isResolved = true;
  encounter.selectedOutcomeId = outcomeId;
  encounter.outcomeEffects = effects;
  encounter.resolvedAt = new Date();

  await encounter.save();
  return encounter;
};

// Virtuals for JSON
EncounterDefinitionSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  }
});

ActiveEncounterSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const EncounterDefinition = mongoose.model<IEncounterDefinition, IEncounterDefinitionModel>(
  'EncounterDefinition',
  EncounterDefinitionSchema
);

export const ActiveEncounter = mongoose.model<IActiveEncounter, IActiveEncounterModel>(
  'ActiveEncounter',
  ActiveEncounterSchema
);
