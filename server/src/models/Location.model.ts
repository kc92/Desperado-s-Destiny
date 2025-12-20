/**
 * Location Model
 * Mongoose model for game locations
 */

import mongoose, { Document, Schema } from 'mongoose';
import type {
  LocationType,
  RegionType,
  LocationRequirements,
  LocationConnection,
  LocationJob,
  LocationShop,
  LocationNPC,
  TownTier,
  OperatingHours,
  SecretContent,
  WorldZoneType,
} from '@desperados/shared';

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  shortDescription: string;
  type: LocationType;
  region: RegionType;
  parentId?: mongoose.Types.ObjectId;
  // Zone system fields
  zone?: WorldZoneType;
  isZoneHub?: boolean;
  // Building system fields
  tier?: TownTier;
  dominantFaction?: 'settler' | 'nahi' | 'frontera' | 'neutral';
  operatingHours?: OperatingHours;
  secrets?: SecretContent[];
  // Crowd system fields
  baseCapacity?: number;
  isIndoor?: boolean;
  // Visual/UI
  icon?: string;
  imageUrl?: string;
  atmosphere?: string;
  requirements?: LocationRequirements;
  availableActions: string[];
  availableCrimes: string[];
  jobs: LocationJob[];
  shops: LocationShop[];
  npcs: LocationNPC[];
  connections: LocationConnection[];
  dangerLevel: number;
  factionInfluence: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  isUnlocked: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationRequirementsSchema = new Schema<LocationRequirements>(
  {
    minLevel: { type: Number },
    minReputation: { type: Number },
    maxWanted: { type: Number },
    minCriminalRep: { type: Number },
    requiredSkills: [
      {
        skillId: { type: String },
        level: { type: Number },
      },
    ],
    requiredItems: [{ type: String }],
    requiredQuests: [{ type: String }],
    faction: { type: String },
    factionStanding: {
      type: String,
      enum: ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored']
    },
    gangMember: { type: Boolean },
  },
  { _id: false }
);

// Operating hours schema
const OperatingHoursSchema = new Schema(
  {
    open: { type: Number, required: true, min: 0, max: 23 },
    close: { type: Number, required: true, min: 0, max: 23 },
    peakStart: { type: Number, min: 0, max: 23 },
    peakEnd: { type: Number, min: 0, max: 23 },
  },
  { _id: false }
);

// Secret content schema
const SecretContentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['hidden_room', 'secret_action', 'easter_egg', 'progressive']
    },
    unlockCondition: {
      minReputation: { type: Number },
      npcTrust: {
        npcId: { type: String },
        level: { type: Number },
      },
      questComplete: { type: String },
      itemRequired: { type: String },
      visitCount: { type: Number },
    },
    content: {
      actions: [{ type: String }],
      npcs: [{ type: String }],
      dialogue: [{ type: String }],
      rewards: {
        gold: { type: Number },
        xp: { type: Number },
        items: [{ type: String }],
      },
    },
    isDiscovered: { type: Boolean, default: false },
  },
  { _id: false }
);

const LocationConnectionSchema = new Schema<LocationConnection>(
  {
    targetLocationId: { type: String, required: true },
    travelTime: { type: Number, required: true, default: 0 },
    energyCost: { type: Number, required: true, default: 0 },
    description: { type: String },
    requirements: LocationRequirementsSchema,
  },
  { _id: false }
);

// Shop item schema
const ShopItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number },
    requiredLevel: { type: Number },
  },
  { _id: false }
);

// Shop schema
const LocationShopSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    shopType: {
      type: String,
      required: true,
      enum: ['general', 'weapons', 'armor', 'medicine', 'black_market', 'specialty'],
    },
    items: [ShopItemSchema],
    buyMultiplier: { type: Number, default: 0.5 },
  },
  { _id: false }
);

// Job schema
const LocationJobSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    energyCost: { type: Number, required: true },
    cooldownMinutes: { type: Number, required: true },
    rewards: {
      goldMin: { type: Number, required: true },
      goldMax: { type: Number, required: true },
      xp: { type: Number, required: true },
      items: [{ type: String }],
    },
    requirements: {
      minLevel: { type: Number },
      requiredSkill: { type: String },
      skillLevel: { type: Number },
    },
  },
  { _id: false }
);

// NPC schema
const LocationNPCSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String },
    description: { type: String, required: true },
    personality: { type: String },
    faction: { type: String },
    dialogue: [{ type: String }],
    quests: [{ type: String }],
    isVendor: { type: Boolean, default: false },
    shopId: { type: String },
    // Enhanced NPC features
    schedule: [{
      hour: { type: Number, min: 0, max: 23 },
      buildingId: { type: String },
    }],
    trustLevels: [{
      playerId: { type: String },
      level: { type: Number, default: 0 },
    }],
    defaultTrust: { type: Number, default: 0 },
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'town_square',
        'saloon',
        'sheriff_office',
        'bank',
        'general_store',
        'stables',
        'train_station',
        'doctors_office',
        'gang_hq',
        'blacksmith',
        'camp',
        'cave',
        'mine',
        'outpost',
        'ruins',
        'wilderness',
        'ranch',
        'hideout',
        'settlement',
        'sacred_site',
        'trading_post',
        'fort',
        'canyon',
        'mesa',
        'springs',
        // New building types
        'hotel',
        'telegraph_office',
        'church',
        // Settler faction buildings
        'assay_office',
        'railroad_station',
        'newspaper_office',
        // Nahi faction buildings
        'spirit_lodge',
        'council_fire',
        'medicine_lodge',
        // Frontera faction buildings
        'cantina',
        'fighting_pit',
        'smugglers_den',
        'shrine',
        // Red Gulch expansion buildings
        'government',
        'mining_office',
        'elite_club',
        'labor_exchange',
        'worker_tavern',
        'tent_city',
        'laundry',
        'apothecary',
        'tea_house',
        'business',
        'entertainment',
        'labor',
        'service',
        // High-level zone types
        'wasteland',
      ] as LocationType[],
    },
    region: {
      type: String,
      required: true,
      enum: [
        'town',
        'dusty_flats',
        'devils_canyon',
        'sangre_mountains',
        'border_territories',
        'ghost_towns',
        'sacred_lands',
        'outlaw_territory',
        'frontier',
      ] as RegionType[],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
    },

    // Zone system fields
    zone: {
      type: String,
      enum: [
        'settler_territory',
        'sangre_canyon',
        'coalition_lands',
        'outlaw_territory',
        'frontier',
        'ranch_country',
        'sacred_mountains',
      ],
    },
    isZoneHub: {
      type: Boolean,
      default: false,
    },

    // Building system fields
    tier: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    dominantFaction: {
      type: String,
      enum: ['settler', 'nahi', 'frontera', 'neutral'],
    },
    operatingHours: OperatingHoursSchema,
    secrets: [SecretContentSchema],

    // Crowd system fields
    baseCapacity: { type: Number, default: 50 },
    isIndoor: { type: Boolean, default: true },

    // Visual/UI
    icon: { type: String },
    imageUrl: { type: String },
    atmosphere: { type: String },

    // Requirements
    requirements: LocationRequirementsSchema,

    // Available actions
    availableActions: [{ type: String }],

    // Available crimes at this location
    availableCrimes: [{ type: String }],

    // Jobs available at this location
    jobs: [LocationJobSchema],

    // Shops at this location
    shops: [LocationShopSchema],

    // NPCs
    npcs: [LocationNPCSchema],

    // Connections
    connections: [LocationConnectionSchema],

    // Danger level (1-10)
    dangerLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    // Faction influence at this location
    factionInfluence: {
      settlerAlliance: { type: Number, default: 0, min: 0, max: 100 },
      nahiCoalition: { type: Number, default: 0, min: 0, max: 100 },
      frontera: { type: Number, default: 0, min: 0, max: 100 },
    },

    // State
    isUnlocked: {
      type: Boolean,
      default: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LocationSchema.index({ type: 1 });
LocationSchema.index({ region: 1 });
LocationSchema.index({ zone: 1 });
LocationSchema.index({ 'connections.targetLocationId': 1 });
// H8 FIX: Index for hierarchical location queries
LocationSchema.index({ parentId: 1 });

// Virtual for id
LocationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
LocationSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
export default Location;
