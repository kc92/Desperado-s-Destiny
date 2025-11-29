import { Schema, model, Document } from 'mongoose';
import { Stable as IStable } from '@desperados/shared';

// ============================================================================
// MONGOOSE DOCUMENT INTERFACE
// ============================================================================

export interface StableDocument extends Omit<IStable, '_id' | 'currentHorses'>, Document {
  _id: Schema.Types.ObjectId;
  currentHorses: Schema.Types.ObjectId[];

  // Virtuals
  isFull: boolean;

  // Methods
  addHorse(horseId: Schema.Types.ObjectId | string): void;
  removeHorse(horseId: Schema.Types.ObjectId | string): void;
  upgradeCapacity(additionalSlots: number): void;
  upgradeFacility(facilityType: string): void;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const StableSchema = new Schema<StableDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      default: 'My Stable'
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 3
    },

    currentHorses: {
      type: [Schema.Types.ObjectId],
      ref: 'Horse',
      default: []
    },

    facilities: {
      hasTrainingGrounds: {
        type: Boolean,
        default: false
      },
      hasBreedingPen: {
        type: Boolean,
        default: false
      },
      hasVeterinarian: {
        type: Boolean,
        default: false
      },
      quality: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        default: 'basic'
      }
    },

    services: {
      autoFeed: {
        type: Boolean,
        default: false
      },
      autoGroom: {
        type: Boolean,
        default: false
      },
      training: {
        type: Boolean,
        default: false
      }
    },

    upkeepCost: {
      type: Number,
      required: true,
      min: 0,
      default: 5
    },

    lastUpkeepPaid: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

StableSchema.index({ ownerId: 1 });
StableSchema.index({ location: 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

StableSchema.virtual('isFull').get(function (this: StableDocument) {
  return this.currentHorses.length >= this.capacity;
});

StableSchema.virtual('availableSpace').get(function (this: StableDocument) {
  return this.capacity - this.currentHorses.length;
});

StableSchema.virtual('dailyUpkeep').get(function (this: StableDocument) {
  let cost = this.upkeepCost;

  // Services add to cost
  if (this.services.autoFeed) cost += 2 * this.currentHorses.length;
  if (this.services.autoGroom) cost += 1 * this.currentHorses.length;
  if (this.services.training) cost += 3 * this.currentHorses.length;

  // Facilities add to cost
  if (this.facilities.hasTrainingGrounds) cost += 5;
  if (this.facilities.hasBreedingPen) cost += 3;
  if (this.facilities.hasVeterinarian) cost += 10;

  return cost;
});

// ============================================================================
// METHODS
// ============================================================================

StableSchema.methods.addHorse = function (this: StableDocument, horseId: Schema.Types.ObjectId | string) {
  if (this.isFull) {
    throw new Error('Stable is at capacity');
  }

  const horseIdStr = typeof horseId === 'string' ? horseId : horseId.toString();
  if (this.currentHorses.some(id => id.toString() === horseIdStr)) {
    throw new Error('Horse is already in this stable');
  }

  this.currentHorses.push(horseId as any);
};

StableSchema.methods.removeHorse = function (this: StableDocument, horseId: Schema.Types.ObjectId | string) {
  const horseIdStr = typeof horseId === 'string' ? horseId : horseId.toString();
  const index = this.currentHorses.findIndex(id => id.toString() === horseIdStr);
  if (index === -1) {
    throw new Error('Horse is not in this stable');
  }

  this.currentHorses.splice(index, 1);
};

StableSchema.methods.upgradeCapacity = function (this: StableDocument, additionalSlots: number) {
  this.capacity = Math.min(20, this.capacity + additionalSlots);
};

StableSchema.methods.upgradeFacility = function (
  this: StableDocument,
  facility: 'trainingGrounds' | 'breedingPen' | 'veterinarian'
) {
  switch (facility) {
    case 'trainingGrounds':
      this.facilities.hasTrainingGrounds = true;
      break;
    case 'breedingPen':
      this.facilities.hasBreedingPen = true;
      break;
    case 'veterinarian':
      this.facilities.hasVeterinarian = true;
      break;
  }
};

StableSchema.methods.upgradeQuality = function (this: StableDocument) {
  if (this.facilities.quality === 'basic') {
    this.facilities.quality = 'standard';
  } else if (this.facilities.quality === 'standard') {
    this.facilities.quality = 'premium';
  }
};

StableSchema.methods.enableService = function (
  this: StableDocument,
  service: 'autoFeed' | 'autoGroom' | 'training'
) {
  this.services[service] = true;
};

StableSchema.methods.disableService = function (
  this: StableDocument,
  service: 'autoFeed' | 'autoGroom' | 'training'
) {
  this.services[service] = false;
};

StableSchema.methods.payUpkeep = function (this: StableDocument) {
  this.lastUpkeepPaid = new Date();
};

// ============================================================================
// STATICS
// ============================================================================

StableSchema.statics.findByOwner = function (ownerId: Schema.Types.ObjectId) {
  return this.find({ ownerId }).populate('currentHorses');
};

StableSchema.statics.findByLocation = function (locationId: Schema.Types.ObjectId) {
  return this.find({ location: locationId });
};

// ============================================================================
// EXPORT
// ============================================================================

export const Stable = model<StableDocument>('Stable', StableSchema);
