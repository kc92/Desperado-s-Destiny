/**
 * Skill Model
 * Defines the 30 trainable skills in Desperados Destiny
 * Data sourced from shared/src/constants/skills.constants.ts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { SkillCategory, DestinySuit } from '@desperados/shared';

export interface ISkill extends Document {
  skillId: string;
  name: string;
  description: string;
  category: SkillCategory;
  suit: DestinySuit;
  icon: string;
  maxLevel: number;
  baseTrainingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    skillId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(SkillCategory),
      required: true,
    },
    suit: {
      type: String,
      enum: Object.values(DestinySuit),
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    maxLevel: {
      type: Number,
      required: true,
      default: 99,
    },
    baseTrainingTime: {
      type: Number,
      required: true,
      comment: 'Base training time in milliseconds',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SkillSchema.index({ category: 1 });
SkillSchema.index({ suit: 1 });

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);
