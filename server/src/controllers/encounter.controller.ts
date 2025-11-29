/**
 * Encounter Controller
 * Handles random encounter operations during travel
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { EncounterService } from '../services/encounter.service';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Get player's active encounter (if any)
 * GET /api/encounters/active
 */
export const getActiveEncounter = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.character?._id;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const encounter = await EncounterService.getActiveEncounter(characterId.toString());

    if (!encounter) {
      return res.status(200).json({
        success: true,
        data: { encounter: null },
      });
    }

    res.status(200).json({
      success: true,
      data: { encounter },
    });
  }
);

/**
 * Resolve encounter with choice
 * POST /api/encounters/resolve
 * Body: { choice: string } - The choice ID from encounter options
 */
export const resolveEncounter = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.character?._id;
    const { choice } = req.body;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    if (!choice) {
      return res.status(400).json({
        success: false,
        message: 'Choice is required',
      });
    }

    const encounter = await EncounterService.getActiveEncounter(characterId.toString());

    if (!encounter) {
      return res.status(404).json({
        success: false,
        message: 'No active encounter',
      });
    }

    // Fetch definition to validate choices against outcomes
    const encounterDetails = await EncounterService.getEncounterWithDetails(encounter._id.toString());
    if (!encounterDetails) {
      return res.status(404).json({
        success: false,
        message: 'Encounter definition not found',
      });
    }

    // Validate choice against definition outcomes
    const validChoice = encounterDetails.definition.outcomes.some(o => o.id === choice);
    if (!validChoice) {
      return res.status(400).json({
        success: false,
        message: 'Invalid choice for this encounter',
      });
    }

    const result = await EncounterService.resolveEncounter(
      characterId.toString(),
      encounter._id.toString(),
      choice
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Refresh character data
    const updatedCharacter = await Character.findById(characterId);

    logger.info(
      `Character ${characterId} resolved encounter ${encounter._id} with choice: ${choice}`
    );

    res.status(200).json({
      success: true,
      data: {
        result,
        character: updatedCharacter?.toSafeObject(),
      },
    });
  }
);

/**
 * Attempt to flee from combat encounter
 * POST /api/encounters/flee
 */
export const fleeEncounter = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.character?._id;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const encounter = await EncounterService.getActiveEncounter(characterId.toString());

    if (!encounter) {
      return res.status(404).json({
        success: false,
        message: 'No active encounter',
      });
    }

    // Check if this encounter allows fleeing
    if (encounter.encounterType !== 'COMBAT') {
      return res.status(400).json({
        success: false,
        message: 'Can only flee from combat encounters',
      });
    }

    const result = await EncounterService.attemptFlee(
      characterId.toString(),
      encounter._id.toString()
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Refresh character data
    const updatedCharacter = await Character.findById(characterId);

    logger.info(
      `Character ${characterId} ${result.escaped ? 'successfully fled from' : 'failed to flee from'} encounter ${encounter._id}`
    );

    res.status(200).json({
      success: true,
      data: {
        result,
        character: updatedCharacter?.toSafeObject(),
      },
    });
  }
);

export default {
  getActiveEncounter,
  resolveEncounter,
  fleeEncounter,
};
