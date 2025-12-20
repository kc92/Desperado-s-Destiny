/**
 * Gossip Service
 *
 * API methods for the gossip and cross-reference system
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import { apiCall } from './api';
import type {
  RelationshipGossipItem,
  NPCRelationship,
  RelationshipNPCOpinion,
  GossipCategory,
  GetGossipResponse,
  SpreadGossipResponse,
  RelationshipCluster,
} from '@desperados/shared';

/**
 * Request/Response type definitions
 */

// Response type for getGossipFromNPC
export interface GetGossipFromNPCResponse {
  gossip: RelationshipGossipItem[];
  newGossipCount: number;
}

// Response type for getGossipAboutNPC
export interface GetGossipAboutNPCResponse {
  gossip: RelationshipGossipItem[];
}

// Response type for getNPCOpinion
export interface GetNPCOpinionResponse {
  opinion: RelationshipNPCOpinion;
}

// Response type for getNPCRelationships
export interface GetNPCRelationshipsResponse {
  relationships: NPCRelationship[];
}

// Response type for findConnection
export interface FindConnectionResponse {
  path: string[];
  degrees: number;
  connected: boolean;
}

// Response type for getGossipByCategory
export interface GetGossipByCategoryResponse {
  gossip: RelationshipGossipItem[];
}

// Response type for getActiveGossip
export interface GetActiveGossipResponse {
  gossip: RelationshipGossipItem[];
}

// Request type for createGossip
export interface CreateGossipRequest {
  originNpc: string;
  options: {
    subject: string;
    category: GossipCategory;
    content: string;
    truthfulness: number;
    verifiable?: boolean;
    verificationMethod?: string;
    spreadFactor?: number;
    spreadTo?: string[];
    trustRequired?: number;
    factionRequired?: string;
    locationRequired?: string;
    playerInvolved?: boolean;
    playerReputationEffect?: number;
    expiresAt?: Date;
  };
}

// Response type for createGossip
export interface CreateGossipResponse {
  gossip: RelationshipGossipItem;
}

// Response type for cleanupGossip
export interface CleanupGossipResponse {
  message: string;
  count: number;
}

/**
 * Public routes (no authentication required)
 */

/**
 * Get active gossip (public news/rumors)
 * GET /api/gossip/active
 */
export async function getActiveGossip(): Promise<GetActiveGossipResponse> {
  const response = await apiCall<{ gossip: RelationshipGossipItem[] }>(
    'get',
    '/gossip/active'
  );
  return { gossip: response.gossip };
}

/**
 * Get gossip by category
 * GET /api/gossip/category/:category
 */
export async function getGossipByCategory(
  category: GossipCategory
): Promise<GetGossipByCategoryResponse> {
  const response = await apiCall<{ gossip: RelationshipGossipItem[] }>(
    'get',
    `/gossip/category/${category}`
  );
  return { gossip: response.gossip };
}

/**
 * Find connection path between two NPCs
 * GET /api/gossip/connection/:npcId1/:npcId2
 */
export async function findConnection(
  npcId1: string,
  npcId2: string
): Promise<FindConnectionResponse> {
  return apiCall<FindConnectionResponse>(
    'get',
    `/gossip/connection/${npcId1}/${npcId2}`
  );
}

/**
 * Protected routes (require authentication)
 */

/**
 * Get gossip from an NPC (player interaction)
 * GET /api/gossip/npc/:npcId
 */
export async function getGossipFromNPC(
  npcId: string
): Promise<GetGossipFromNPCResponse> {
  return apiCall<GetGossipFromNPCResponse>('get', `/gossip/npc/${npcId}`);
}

/**
 * Get gossip about a specific NPC
 * GET /api/gossip/about/:npcId
 */
export async function getGossipAboutNPC(
  npcId: string
): Promise<GetGossipAboutNPCResponse> {
  const response = await apiCall<{ gossip: RelationshipGossipItem[] }>(
    'get',
    `/gossip/about/${npcId}`
  );
  return { gossip: response.gossip };
}

/**
 * Get NPC's opinion about another NPC
 * GET /api/gossip/opinion/:askerNpcId/:subjectNpcId
 */
export async function getNPCOpinion(
  askerNpcId: string,
  subjectNpcId: string
): Promise<GetNPCOpinionResponse> {
  const response = await apiCall<{ opinion: RelationshipNPCOpinion }>(
    'get',
    `/gossip/opinion/${askerNpcId}/${subjectNpcId}`
  );
  return { opinion: response.opinion };
}

/**
 * Get relationships for an NPC
 * GET /api/gossip/relationships/:npcId
 */
export async function getNPCRelationships(
  npcId: string
): Promise<GetNPCRelationshipsResponse> {
  const response = await apiCall<{ relationships: NPCRelationship[] }>(
    'get',
    `/gossip/relationships/${npcId}`
  );
  return { relationships: response.relationships };
}

/**
 * Admin/testing routes
 */

/**
 * Spread gossip (admin/testing only)
 * POST /api/gossip/:gossipId/spread
 */
export async function spreadGossip(gossipId: string): Promise<SpreadGossipResponse> {
  return apiCall<SpreadGossipResponse>('post', `/gossip/${gossipId}/spread`);
}

/**
 * Create gossip (admin/testing only)
 * POST /api/gossip/create
 */
export async function createGossip(
  request: CreateGossipRequest
): Promise<CreateGossipResponse> {
  const response = await apiCall<{ gossip: RelationshipGossipItem }>(
    'post',
    '/gossip/create',
    request
  );
  return { gossip: response.gossip };
}

/**
 * Cleanup old gossip (admin/cron job)
 * POST /api/gossip/cleanup
 */
export async function cleanupGossip(): Promise<CleanupGossipResponse> {
  return apiCall<CleanupGossipResponse>('post', '/gossip/cleanup');
}

/**
 * Default export - Service object with all methods
 */
const gossipService = {
  // Public routes
  getActiveGossip,
  getGossipByCategory,
  findConnection,

  // Protected routes
  getGossipFromNPC,
  getGossipAboutNPC,
  getNPCOpinion,
  getNPCRelationships,

  // Admin routes
  spreadGossip,
  createGossip,
  cleanupGossip,
};

export default gossipService;
