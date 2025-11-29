/**
 * NPC Gang Conflict Controller
 *
 * Handles HTTP requests for NPC gang conflict system
 */

import { Request, Response } from 'express';
import { NPCGangConflictService } from '../services/npcGangConflict.service';
import { NPCGangId, AttackType } from '@desperados/shared';
import { asyncHandler } from '../middleware/asyncHandler';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * GET /api/npc-gangs
 * List all NPC gangs
 */
export const listNPCGangs = asyncHandler(async (req: Request, res: Response) => {
  const gangs = await NPCGangConflictService.getAllNPCGangs();

  res.status(200).json({
    success: true,
    data: gangs,
  });
});

/**
 * GET /api/npc-gangs/:gangId
 * Get specific NPC gang details
 */
export const getNPCGangDetails = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;

  const gang = await NPCGangConflictService.getNPCGang(gangId as NPCGangId);

  res.status(200).json({
    success: true,
    data: gang,
  });
});

/**
 * GET /api/npc-gangs/:gangId/relationship
 * Get player gang's relationship with NPC gang
 */
export const getRelationship = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const relationship = await NPCGangConflictService.getRelationship(
    character.gangId,
    gangId as NPCGangId
  );

  res.status(200).json({
    success: true,
    data: relationship,
  });
});

/**
 * GET /api/npc-gangs/:gangId/overview
 * Get comprehensive overview of NPC gang for player
 */
export const getNPCGangOverview = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const overview = await NPCGangConflictService.getNPCGangOverview(
    character.gangId,
    gangId as NPCGangId
  );

  res.status(200).json({
    success: true,
    data: overview,
  });
});

/**
 * POST /api/npc-gangs/:gangId/tribute
 * Pay tribute to NPC gang
 */
export const payTribute = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const result = await NPCGangConflictService.payTribute(
    character.gangId,
    gangId as NPCGangId,
    character._id as mongoose.Types.ObjectId
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

/**
 * GET /api/npc-gangs/:gangId/missions
 * Get available missions from NPC gang
 */
export const getAvailableMissions = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const overview = await NPCGangConflictService.getNPCGangOverview(
    character.gangId,
    gangId as NPCGangId
  );

  res.status(200).json({
    success: true,
    data: {
      missions: overview.availableMissions,
      activeMissions: overview.activeMissions,
    },
  });
});

/**
 * POST /api/npc-gangs/:gangId/missions/:missionId
 * Accept mission from NPC gang
 */
export const acceptMission = asyncHandler(async (req: Request, res: Response) => {
  const { gangId, missionId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const result = await NPCGangConflictService.acceptMission(
    character.gangId,
    gangId as NPCGangId,
    missionId,
    character._id as mongoose.Types.ObjectId
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.mission,
  });
});

/**
 * POST /api/npc-gangs/:gangId/challenge
 * Challenge NPC gang for territory
 */
export const challengeTerritory = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { zoneId } = req.body;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  if (!zoneId) {
    return res.status(400).json({
      success: false,
      message: 'Zone ID is required',
    });
  }

  const result = await NPCGangConflictService.challengeTerritory(
    character.gangId,
    gangId as NPCGangId,
    zoneId,
    character._id as mongoose.Types.ObjectId
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

/**
 * POST /api/npc-gangs/:gangId/challenge/mission
 * Complete challenge mission
 */
export const completeChallengeMission = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { missionType } = req.body;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  if (!missionType) {
    return res.status(400).json({
      success: false,
      message: 'Mission type is required',
    });
  }

  const result = await NPCGangConflictService.completeChallengeMission(
    character.gangId,
    gangId as NPCGangId,
    missionType
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

/**
 * POST /api/npc-gangs/:gangId/challenge/final-battle
 * Fight final battle for territory
 */
export const fightFinalBattle = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const result = await NPCGangConflictService.fightFinalBattle(
    character.gangId,
    gangId as NPCGangId,
    character._id as mongoose.Types.ObjectId
  );

  res.status(200).json({
    success: result.victory,
    message: result.message,
    data: result,
  });
});

/**
 * GET /api/npc-gangs/relationships
 * Get all NPC gang relationships for player gang
 */
export const getAllRelationships = asyncHandler(async (req: Request, res: Response) => {
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  const relationships = await NPCGangConflictService.getGangRelationships(character.gangId);

  res.status(200).json({
    success: true,
    data: relationships,
  });
});

/**
 * POST /api/npc-gangs/:gangId/attack
 * Simulate NPC gang attack (admin/testing only)
 */
export const simulateAttack = asyncHandler(async (req: Request, res: Response) => {
  const { gangId } = req.params;
  const { attackType } = req.body;
  const { character } = req;

  if (!character || !character.gangId) {
    return res.status(400).json({
      success: false,
      message: 'Character must be in a gang',
    });
  }

  if (!attackType || !Object.values(AttackType).includes(attackType)) {
    return res.status(400).json({
      success: false,
      message: 'Valid attack type is required',
    });
  }

  const result = await NPCGangConflictService.processNPCAttack(
    character.gangId,
    gangId as NPCGangId,
    attackType as AttackType
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});
