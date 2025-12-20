/**
 * Karma Controller
 *
 * REST API handlers for the karma and deity system.
 * Provides endpoints for:
 * - Getting karma summary
 * - Getting divine manifestations/messages
 * - Acknowledging divine messages
 */

import { Request, Response } from 'express';
import karmaService from '../services/karma.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { isValidObjectId } from 'mongoose';

/**
 * Valid curse types that can be removed via admin endpoint
 * Must match curse types defined in karma.service.ts
 */
const VALID_CURSE_TYPES = new Set([
  // Gambler curses
  'FATES_DISFAVOR',
  'MARKED_LIAR',
  'UNLUCKY_STREAK',
  // Outlaw King curses
  'CHAINS_OF_ORDER',
  'FOOLS_MARK',
  'BRANDED_COWARD',
  // Omen-based curses (prefixed with OMEN_)
  'OMEN_SNAKE_EYES',
  'OMEN_CRACKED_MIRROR',
  'OMEN_DEAD_MANS_HAND',
  'OMEN_CAGED_BIRD',
  'OMEN_TIGHTENING_ROPE',
  'OMEN_SILENT_HORSE'
]);

/**
 * Maximum pagination limit to prevent resource exhaustion
 */
const MAX_PAGINATION_LIMIT = 100;

/**
 * Get karma summary for a character
 * GET /api/karma/:characterId
 */
export async function getKarma(req: Request, res: Response): Promise<void> {
  try {
    const { characterId } = req.params;

    if (!isValidObjectId(characterId)) {
      throw new AppError('Invalid character ID', 400);
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && req.character?._id?.toString() !== characterId) {
      throw new AppError('Not authorized to view this karma', 403);
    }

    const summary = await karmaService.getKarmaSummary(characterId);

    res.json({
      success: true,
      data: {
        characterId,
        karma: summary.karma.karma,
        totalActions: summary.karma.totalActions,
        deityRelationships: {
          gambler: {
            affinity: summary.karma.gamblerAffinity,
            relationship: summary.gamblerRelationship
          },
          outlawKing: {
            affinity: summary.karma.outlawKingAffinity,
            relationship: summary.outlawKingRelationship
          }
        },
        dominantTrait: summary.dominantTrait,
        moralConflict: summary.moralConflict,
        activeBlessings: summary.activeBlessings.map(b => ({
          source: b.source,
          type: b.type,
          power: b.power,
          description: b.description,
          expiresAt: b.expiresAt,
          grantedAt: b.grantedAt
        })),
        activeCurses: summary.activeCurses.map(c => ({
          source: c.source,
          type: c.type,
          severity: c.severity,
          description: c.description,
          removalCondition: c.removalCondition,
          expiresAt: c.expiresAt,
          inflictedAt: c.inflictedAt
        })),
        recentActions: summary.karma.recentActions.slice(-10).map(a => ({
          actionType: a.actionType,
          dimension: a.dimension,
          delta: a.delta,
          timestamp: a.timestamp,
          context: a.context
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting karma:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get karma' });
    }
  }
}

/**
 * Get divine manifestations for a character
 * GET /api/karma/:characterId/manifestations
 * Query params: ?undelivered=true&unacknowledged=true&deity=GAMBLER&type=BLESSING&limit=20&skip=0
 */
export async function getManifestations(req: Request, res: Response): Promise<void> {
  try {
    const { characterId } = req.params;
    const {
      undelivered,
      unacknowledged,
      deity,
      type,
      limit = '20',
      skip = '0'
    } = req.query;

    if (!isValidObjectId(characterId)) {
      throw new AppError('Invalid character ID', 400);
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && req.character?._id?.toString() !== characterId) {
      throw new AppError('Not authorized to view these manifestations', 403);
    }

    let manifestations;

    // Parse and bound pagination parameters
    const parsedLimit = Math.min(
      Math.max(1, parseInt(limit as string, 10) || 20),
      MAX_PAGINATION_LIMIT
    );
    const parsedSkip = Math.max(0, parseInt(skip as string, 10) || 0);

    if (undelivered === 'true') {
      manifestations = await karmaService.getUndeliveredManifestations(characterId);
    } else if (unacknowledged === 'true') {
      manifestations = await karmaService.getUnacknowledgedManifestations(characterId);
    } else {
      manifestations = await karmaService.getManifestationHistory(characterId, {
        deity: deity as 'GAMBLER' | 'OUTLAW_KING' | undefined,
        type: type as any,
        limit: parsedLimit,
        skip: parsedSkip
      });
    }

    res.json({
      success: true,
      data: {
        characterId,
        manifestations: manifestations.map(m => ({
          id: m._id,
          deityName: m.deityName,
          type: m.type,
          disguise: m.disguise,
          location: m.location,
          message: m.message,
          effect: m.getEffectData(),
          urgency: m.urgency,
          delivered: m.delivered,
          deliveredAt: m.deliveredAt,
          acknowledged: m.acknowledged,
          playerResponse: m.playerResponse,
          responseAt: m.responseAt,
          createdAt: m.createdAt
        })),
        count: manifestations.length
      }
    });
  } catch (error) {
    logger.error('Error getting manifestations:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get manifestations' });
    }
  }
}

/**
 * Acknowledge a divine manifestation
 * POST /api/karma/manifestations/:manifestationId/acknowledge
 * Body: { response?: string }
 */
export async function acknowledgeManifest(req: Request, res: Response): Promise<void> {
  try {
    const { manifestationId } = req.params;
    const { response } = req.body;

    if (!isValidObjectId(manifestationId)) {
      throw new AppError('Invalid manifestation ID', 400);
    }

    // Get manifestation to check ownership
    const { DivineManifestation } = await import('../models/DivineManifestation.model');
    const manifestation = await DivineManifestation.findById(manifestationId);

    if (!manifestation) {
      throw new AppError('Manifestation not found', 404);
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && req.character?._id?.toString() !== manifestation.targetCharacterId.toString()) {
      throw new AppError('Not authorized to acknowledge this manifestation', 403);
    }

    if (manifestation.acknowledged) {
      throw new AppError('Manifestation already acknowledged', 400);
    }

    await karmaService.acknowledgeManifestations(manifestationId, response);

    res.json({
      success: true,
      message: 'Manifestation acknowledged',
      data: {
        manifestationId,
        response: response || null,
        acknowledgedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error acknowledging manifestation:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to acknowledge manifestation' });
    }
  }
}

/**
 * Mark a manifestation as delivered (called when shown to player)
 * POST /api/karma/manifestations/:manifestationId/deliver
 */
export async function deliverManifest(req: Request, res: Response): Promise<void> {
  try {
    const { manifestationId } = req.params;

    if (!isValidObjectId(manifestationId)) {
      throw new AppError('Invalid manifestation ID', 400);
    }

    // Get manifestation to check ownership
    const { DivineManifestation } = await import('../models/DivineManifestation.model');
    const manifestation = await DivineManifestation.findById(manifestationId);

    if (!manifestation) {
      throw new AppError('Manifestation not found', 404);
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && req.character?._id?.toString() !== manifestation.targetCharacterId.toString()) {
      throw new AppError('Not authorized to mark this manifestation', 403);
    }

    if (manifestation.delivered) {
      res.json({
        success: true,
        message: 'Manifestation already delivered',
        data: { manifestationId, deliveredAt: manifestation.deliveredAt }
      });
      return;
    }

    await karmaService.markManifestationDelivered(manifestationId);

    res.json({
      success: true,
      message: 'Manifestation marked as delivered',
      data: {
        manifestationId,
        deliveredAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error delivering manifestation:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to deliver manifestation' });
    }
  }
}

/**
 * Get blessing/curse status for gameplay effects
 * GET /api/karma/:characterId/effects
 */
export async function getActiveEffects(req: Request, res: Response): Promise<void> {
  try {
    const { characterId } = req.params;

    if (!isValidObjectId(characterId)) {
      throw new AppError('Invalid character ID', 400);
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && req.character?._id?.toString() !== characterId) {
      throw new AppError('Not authorized to view these effects', 403);
    }

    const summary = await karmaService.getKarmaSummary(characterId);

    // Combine all active effects into a single object
    const combinedEffects: Record<string, number> = {};

    for (const blessing of summary.activeBlessings) {
      // Parse effect data if stored as string
      const effect = typeof blessing === 'object' ? blessing : JSON.parse(blessing as unknown as string);
      // Skip non-numeric properties
      for (const [key, value] of Object.entries(effect)) {
        if (typeof value === 'number' && key !== 'power' && key !== 'source') {
          combinedEffects[key] = (combinedEffects[key] || 0) + value;
        }
      }
    }

    for (const curse of summary.activeCurses) {
      const effect = typeof curse === 'object' ? curse : JSON.parse(curse as unknown as string);
      for (const [key, value] of Object.entries(effect)) {
        if (typeof value === 'number' && key !== 'severity' && key !== 'source') {
          combinedEffects[key] = (combinedEffects[key] || 0) + value;
        }
      }
    }

    res.json({
      success: true,
      data: {
        characterId,
        effects: combinedEffects,
        blessingCount: summary.activeBlessings.length,
        curseCount: summary.activeCurses.length
      }
    });
  } catch (error) {
    logger.error('Error getting active effects:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get active effects' });
    }
  }
}

/**
 * Admin: Force remove a curse (for testing/support)
 * DELETE /api/karma/:characterId/curses/:curseType
 */
export async function adminRemoveCurse(req: Request, res: Response): Promise<void> {
  try {
    const { characterId, curseType } = req.params;

    if (!isValidObjectId(characterId)) {
      throw new AppError('Invalid character ID', 400);
    }

    // Validate curseType against whitelist to prevent injection
    if (!curseType || typeof curseType !== 'string' || !VALID_CURSE_TYPES.has(curseType)) {
      throw new AppError(`Invalid curse type. Valid types: ${Array.from(VALID_CURSE_TYPES).join(', ')}`, 400);
    }

    // Admin only (defense in depth - also checked at route level)
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const removed = await karmaService.removeCurse(characterId, curseType);

    if (!removed) {
      throw new AppError('Curse not found or already removed', 404);
    }

    res.json({
      success: true,
      message: `Curse ${curseType} removed from character`,
      data: { characterId, curseType }
    });
  } catch (error) {
    logger.error('Error removing curse:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to remove curse' });
    }
  }
}

/**
 * Admin: Get deity watch list
 * GET /api/karma/admin/watched/:deity
 */
export async function getWatchedCharacters(req: Request, res: Response): Promise<void> {
  try {
    const { deity } = req.params;
    const { limit = '100' } = req.query;

    // Admin only (defense in depth - also checked at route level)
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (deity !== 'GAMBLER' && deity !== 'OUTLAW_KING') {
      throw new AppError('Invalid deity name. Use GAMBLER or OUTLAW_KING', 400);
    }

    // Bound the limit parameter to prevent resource exhaustion
    const parsedLimit = Math.min(
      Math.max(1, parseInt(limit as string, 10) || 100),
      MAX_PAGINATION_LIMIT
    );

    const characters = await karmaService.getWatchedCharacters(
      deity as 'GAMBLER' | 'OUTLAW_KING',
      parsedLimit
    );

    res.json({
      success: true,
      data: {
        deity,
        characters: characters.map(c => ({
          characterId: c.characterId,
          affinity: deity === 'GAMBLER' ? c.gamblerAffinity : c.outlawKingAffinity,
          dominantTrait: c.getDominantTrait(),
          totalActions: c.totalActions,
          blessingCount: c.blessings.length,
          curseCount: c.curses.length
        })),
        count: characters.length
      }
    });
  } catch (error) {
    logger.error('Error getting watched characters:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get watched characters' });
    }
  }
}

export default {
  getKarma,
  getManifestations,
  acknowledgeManifest,
  deliverManifest,
  getActiveEffects,
  adminRemoveCurse,
  getWatchedCharacters
};
