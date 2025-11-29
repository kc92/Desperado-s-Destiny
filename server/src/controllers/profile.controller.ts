/**
 * Profile Controller
 * Handles public profile viewing
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';

/**
 * Get public profile by character name
 * GET /api/profiles/:name
 */
export const getPublicProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;

    // Find character by name
    const character = await Character.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true,
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    // Get gang info if character is in a gang
    let gangInfo = null;
    if (character.gangId) {
      const gang = await Gang.findById(character.gangId);
      if (gang) {
        gangInfo = {
          id: gang._id,
          name: gang.name,
          tag: gang.tag,
          // Could determine role here if needed
        };
      }
    }

    // Build public profile response
    const profile = {
      // Public info
      name: character.name,
      faction: character.faction,
      level: character.level,
      appearance: character.appearance,

      // Stats
      stats: character.stats,

      // Combat record
      combatRecord: {
        wins: character.combatStats.wins,
        losses: character.combatStats.losses,
      },

      // Crime status
      wantedLevel: character.wantedLevel,
      bountyAmount: character.bountyAmount,
      isJailed: character.isCurrentlyJailed(),

      // Gang
      gang: gangInfo,

      // Activity
      lastActive: character.lastActive,
      createdAt: character.createdAt,
    };

    res.status(200).json({
      success: true,
      data: { profile },
    });
  }
);

/**
 * Search characters by name
 * GET /api/profiles/search?q=name
 */
export const searchCharacters = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Search for characters matching the query (case-insensitive)
    const characters = await Character.find({
      name: { $regex: new RegExp(q, 'i') },
      isActive: true,
    })
      .select('_id name faction level')
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: characters,
    });
  }
);

export default {
  getPublicProfile,
  searchCharacters,
};
