/**
 * Item Model
 * Master collection of all items in the game
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'mount' | 'material' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'head' | 'body' | 'feet' | 'mount' | 'accessory';

/**
 * Item effect - stat bonuses or special abilities
 */
export interface ItemEffect {
  type: 'stat' | 'energy' | 'health' | 'special';
  stat?: 'combat' | 'cunning' | 'spirit' | 'craft' | 'hp' | 'energy';
  value: number;
  description: string;
}

/**
 * Item document interface
 */
export interface IItem extends Document {
  // Identity
  itemId: string; // Unique string ID (e.g., 'rusty-revolver')
  name: string;
  description: string;

  // Classification
  type: ItemType;
  rarity: ItemRarity;

  // Shop
  price: number; // Buy price
  sellPrice: number; // Sell price (usually 50% of buy)
  inShop: boolean; // Available in shop

  // Requirements
  levelRequired: number;

  // Visual
  icon: string;

  // Effects when equipped/used
  effects: ItemEffect[];

  // Equipment
  equipSlot?: EquipmentSlot;
  isEquippable: boolean;
  isConsumable: boolean;
  isStackable: boolean;
  maxStack: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item model static methods
 */
export interface IItemModel extends Model<IItem> {
  findByItemId(itemId: string): Promise<IItem | null>;
  getShopItems(type?: ItemType): Promise<IItem[]>;
}

/**
 * Item schema definition
 */
const ItemSchema = new Schema<IItem>(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['weapon', 'armor', 'consumable', 'mount', 'material', 'quest']
    },
    rarity: {
      type: String,
      required: true,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    sellPrice: {
      type: Number,
      required: true,
      min: 0
    },
    inShop: {
      type: Boolean,
      default: true
    },
    levelRequired: {
      type: Number,
      default: 1,
      min: 1
    },
    icon: {
      type: String,
      default: '📦'
    },
    effects: [{
      type: {
        type: String,
        enum: ['stat', 'energy', 'health', 'special'],
        required: true
      },
      stat: {
        type: String,
        enum: ['combat', 'cunning', 'spirit', 'craft', 'hp', 'energy']
      },
      value: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    }],
    equipSlot: {
      type: String,
      enum: ['weapon', 'head', 'body', 'feet', 'mount', 'accessory']
    },
    isEquippable: {
      type: Boolean,
      default: false
    },
    isConsumable: {
      type: Boolean,
      default: false
    },
    isStackable: {
      type: Boolean,
      default: true
    },
    maxStack: {
      type: Number,
      default: 99
    }
  },
  {
    timestamps: true
  }
);

// Indexes
ItemSchema.index({ type: 1, inShop: 1 });
ItemSchema.index({ rarity: 1 });

/**
 * Static method: Find item by itemId
 */
ItemSchema.statics.findByItemId = async function(itemId: string): Promise<IItem | null> {
  return this.findOne({ itemId });
};

/**
 * Static method: Get all shop items
 */
ItemSchema.statics.getShopItems = async function(type?: ItemType): Promise<IItem[]> {
  const query: any = { inShop: true };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ levelRequired: 1, price: 1 });
};

export const Item = mongoose.model<IItem, IItemModel>('Item', ItemSchema);
