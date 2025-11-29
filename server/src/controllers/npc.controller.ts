/**
 * NPC Controller
 * Handles NPC interaction endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { NPCService } from '../services/npc.service';
import { Character } from '../models/Character.model';

/**
 * Get NPCs at a location
 * GET /api/npcs/location/:locationId
 */
export const getNPCsAtLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { locationId } = req.params;
    const characterId = req.character?._id.toString();

    const npcs = await NPCService.getNPCsAtLocation(locationId, characterId);

    res.status(200).json({
      success: true,
      data: { npcs }
    });
  }
);

/**
 * Get specific NPC details
 * GET /api/npcs/:npcId
 */
export const getNPCDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { npcId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected'
      });
    }

    const npc = await NPCService.getNPCTrustWithDetails(
      character._id.toString(),
      npcId
    );

    if (!npc) {
      return res.status(404).json({
        success: false,
        message: 'NPC not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { npc }
    });
  }
);

/**
 * Interact with an NPC
 * POST /api/npcs/:npcId/interact
 */
export const interactWithNPC = asyncHandler(
  async (req: Request, res: Response) => {
    const { npcId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected'
      });
    }

    // Check if character is jailed
    if (character.isCurrentlyJailed()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot interact with NPCs while in jail'
      });
    }

    const result = await NPCService.interactWithNPC(
      character._id.toString(),
      character.currentLocation,
      npcId
    );

    // Refresh character data
    const updatedCharacter = await Character.findById(character._id);

    res.status(200).json({
      success: true,
      data: {
        interaction: result,
        character: updatedCharacter?.toSafeObject()
      }
    });
  }
);

/**
 * Get available quests from an NPC
 * GET /api/npcs/:npcId/quests
 */
export const getQuestsFromNPC = asyncHandler(
  async (req: Request, res: Response) => {
    const { npcId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected'
      });
    }

    const quests = await NPCService.getQuestsFromNPC(
      npcId,
      character._id.toString()
    );

    res.status(200).json({
      success: true,
      data: { quests }
    });
  }
);

/**
 * Get trust level with an NPC
 * GET /api/npcs/:npcId/trust
 */
export const getNPCTrust = asyncHandler(
  async (req: Request, res: Response) => {
    const { npcId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected'
      });
    }

    const trustLevel = await NPCService.getTrustLevel(
      character._id.toString(),
      npcId
    );

    res.status(200).json({
      success: true,
      data: {
        npcId,
        trustLevel,
        tier: NPCService.getTrustTier(trustLevel)
      }
    });
  }
);

/**
 * Get all NPC trusts for current character
 * GET /api/npcs/trusts
 */
export const getCharacterTrusts = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected'
      });
    }

    const trusts = await NPCService.getCharacterTrusts(
      character._id.toString()
    );

    // Add trust tier to each
    const trustsWithTier = trusts.map(trust => ({
      ...trust.toObject(),
      tier: NPCService.getTrustTier(trust.trustLevel)
    }));

    res.status(200).json({
      success: true,
      data: { trusts: trustsWithTier }
    });
  }
);

export default {
  getNPCsAtLocation,
  getNPCDetails,
  interactWithNPC,
  getQuestsFromNPC,
  getNPCTrust,
  getCharacterTrusts
};
