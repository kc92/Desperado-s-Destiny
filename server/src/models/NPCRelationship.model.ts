/**
 * NPC Relationship Model
 *
 * Stores relationships between NPCs for cross-reference dialogue and gossip
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  RelationshipType,
  FamilyRelation,
  NPCRelationship as INPCRelationshipData
} from '@desperados/shared';

/**
 * NPC Relationship document interface
 */
export interface INPCRelationship extends Document {
  npcId: string;
  relatedNpcId: string;
  relationshipType: RelationshipType;
  familyRelation?: FamilyRelation;
  strength: number;
  sentiment: number;
  history?: string;
  sharedSecrets?: string[];
  ongoingConflict?: string;
  canGossipAbout: boolean;
  gossipTrustRequired?: number;
  isPublic: boolean;
  isSecret: boolean;
  revealCondition?: {
    npcTrustLevel?: number;
    questComplete?: string;
    itemRequired?: string;
    eventTriggered?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * NPC Relationship static methods interface
 */
export interface INPCRelationshipModel extends Model<INPCRelationship> {
  findRelationships(npcId: string): Promise<INPCRelationship[]>;
  findRelationship(npcId1: string, npcId2: string): Promise<INPCRelationship | null>;
  findRelationshipsByType(relationshipType: RelationshipType): Promise<INPCRelationship[]>;
  findPublicRelationships(npcId: string): Promise<INPCRelationship[]>;
  findSecretRelationships(npcId: string): Promise<INPCRelationship[]>;
  findGossipableRelationships(npcId: string): Promise<INPCRelationship[]>;
  getRelationshipStrength(npcId1: string, npcId2: string): Promise<number>;
  getSentiment(npcId1: string, npcId2: string): Promise<number>;
  findConnectionPath(npcId1: string, npcId2: string, maxDepth?: number): Promise<string[]>;
}

/**
 * NPC Relationship schema definition
 */
const NPCRelationshipSchema = new Schema<INPCRelationship>(
  {
    npcId: {
      type: String,
      required: true,
      index: true
    },
    relatedNpcId: {
      type: String,
      required: true,
      index: true
    },
    relationshipType: {
      type: String,
      required: true,
      enum: Object.values(RelationshipType),
      index: true
    },
    familyRelation: {
      type: String,
      enum: Object.values(FamilyRelation)
    },
    strength: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5
    },
    sentiment: {
      type: Number,
      required: true,
      min: -10,
      max: 10,
      default: 0
    },
    history: {
      type: String
    },
    sharedSecrets: [{
      type: String
    }],
    ongoingConflict: {
      type: String
    },
    canGossipAbout: {
      type: Boolean,
      default: true
    },
    gossipTrustRequired: {
      type: Number,
      min: 0,
      max: 100
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isSecret: {
      type: Boolean,
      default: false
    },
    revealCondition: {
      npcTrustLevel: { type: Number },
      questComplete: { type: String },
      itemRequired: { type: String },
      eventTriggered: { type: String }
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
NPCRelationshipSchema.index({ npcId: 1, relatedNpcId: 1 }, { unique: true });
NPCRelationshipSchema.index({ relationshipType: 1, isPublic: 1 });
NPCRelationshipSchema.index({ npcId: 1, canGossipAbout: 1 });
NPCRelationshipSchema.index({ isSecret: 1 });

/**
 * Static method: Find all relationships for an NPC
 */
NPCRelationshipSchema.statics.findRelationships = async function(
  npcId: string
): Promise<INPCRelationship[]> {
  return this.find({
    $or: [{ npcId }, { relatedNpcId: npcId }]
  }).sort({ strength: -1 });
};

/**
 * Static method: Find relationship between two NPCs
 */
NPCRelationshipSchema.statics.findRelationship = async function(
  npcId1: string,
  npcId2: string
): Promise<INPCRelationship | null> {
  return this.findOne({
    $or: [
      { npcId: npcId1, relatedNpcId: npcId2 },
      { npcId: npcId2, relatedNpcId: npcId1 }
    ]
  });
};

/**
 * Static method: Find relationships by type
 */
NPCRelationshipSchema.statics.findRelationshipsByType = async function(
  relationshipType: RelationshipType
): Promise<INPCRelationship[]> {
  return this.find({ relationshipType });
};

/**
 * Static method: Find public relationships for an NPC
 */
NPCRelationshipSchema.statics.findPublicRelationships = async function(
  npcId: string
): Promise<INPCRelationship[]> {
  return this.find({
    $or: [{ npcId }, { relatedNpcId: npcId }],
    isPublic: true
  });
};

/**
 * Static method: Find secret relationships for an NPC
 */
NPCRelationshipSchema.statics.findSecretRelationships = async function(
  npcId: string
): Promise<INPCRelationship[]> {
  return this.find({
    $or: [{ npcId }, { relatedNpcId: npcId }],
    isSecret: true
  });
};

/**
 * Static method: Find relationships that can be gossiped about
 */
NPCRelationshipSchema.statics.findGossipableRelationships = async function(
  npcId: string
): Promise<INPCRelationship[]> {
  return this.find({
    npcId,
    canGossipAbout: true
  });
};

/**
 * Static method: Get relationship strength between two NPCs
 */
NPCRelationshipSchema.statics.getRelationshipStrength = async function(
  npcId1: string,
  npcId2: string
): Promise<number> {
  const relationship = await (this as any).findRelationship(npcId1, npcId2);
  return relationship ? relationship.strength : 0;
};

/**
 * Static method: Get sentiment between two NPCs
 */
NPCRelationshipSchema.statics.getSentiment = async function(
  npcId1: string,
  npcId2: string
): Promise<number> {
  const relationship = await (this as any).findRelationship(npcId1, npcId2);
  return relationship ? relationship.sentiment : 0;
};

/**
 * Static method: Find connection path between two NPCs
 * Uses breadth-first search to find shortest path through relationship network
 */
NPCRelationshipSchema.statics.findConnectionPath = async function(
  npcId1: string,
  npcId2: string,
  maxDepth: number = 6
): Promise<string[]> {
  // Direct connection?
  const directRelationship = await (this as any).findRelationship(npcId1, npcId2);
  if (directRelationship) {
    return [npcId1, npcId2];
  }

  // BFS to find path
  const queue: { npcId: string; path: string[] }[] = [{ npcId: npcId1, path: [npcId1] }];
  const visited = new Set<string>([npcId1]);

  while (queue.length > 0) {
    const { npcId, path } = queue.shift()!;

    // Check depth limit
    if (path.length > maxDepth) {
      continue;
    }

    // Get all relationships for current NPC
    const relationships = await this.find({
      $or: [{ npcId }, { relatedNpcId: npcId }],
      isPublic: true // Only use public relationships for pathfinding
    });

    for (const rel of relationships) {
      const nextNpcId = rel.npcId === npcId ? rel.relatedNpcId : rel.npcId;

      // Found target?
      if (nextNpcId === npcId2) {
        return [...path, nextNpcId];
      }

      // Add to queue if not visited
      if (!visited.has(nextNpcId)) {
        visited.add(nextNpcId);
        queue.push({ npcId: nextNpcId, path: [...path, nextNpcId] });
      }
    }
  }

  // No path found
  return [];
};

/**
 * NPC Relationship model
 */
export const NPCRelationship = mongoose.model<INPCRelationship, INPCRelationshipModel>(
  'NPCRelationship',
  NPCRelationshipSchema
);
