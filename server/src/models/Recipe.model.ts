/**
 * Recipe Model
 * Defines crafting recipes for the workshop system
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  recipeId: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'consumable' | 'ammo' | 'material';
  ingredients: Array<{
    itemId: string;
    quantity: number;
  }>;
  output: {
    itemId: string;
    quantity: number;
  };
  skillRequired: {
    skillId: string;
    level: number;
  };
  facilityRequired?: {
    type: string;
    tier?: number;
    optional?: boolean;
  };
  craftTime: number; // minutes
  xpReward: number;
  isUnlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    recipeId: {
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
    category: {
      type: String,
      required: true,
      enum: ['weapon', 'armor', 'consumable', 'ammo', 'material']
    },
    ingredients: [{
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }],
    output: {
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 }
    },
    skillRequired: {
      skillId: { type: String, required: true },
      level: { type: Number, required: true, min: 1 }
    },
    facilityRequired: {
      type: {
        type: String,
        required: function(this: any) { return !!this.facilityRequired; }
      },
      tier: { type: Number, min: 1, max: 5, default: 1 },
      optional: { type: Boolean, default: false }
    },
    craftTime: {
      type: Number,
      required: true,
      min: 0
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0
    },
    isUnlocked: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

RecipeSchema.index({ category: 1, 'skillRequired.level': 1 });

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
