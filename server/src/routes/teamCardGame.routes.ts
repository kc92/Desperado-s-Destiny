/**
 * Team Card Game Routes
 *
 * REST API routes for team-based card game features
 */

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import * as TeamCardGameController from '../controllers/teamCardGame.controller';

const router = Router();

// =============================================================================
// LOBBY ROUTES
// =============================================================================

/**
 * GET /api/team-card/lobbies
 * Get list of available lobbies
 * Query params: gameType, locationId
 */
router.get('/lobbies', optionalAuth, TeamCardGameController.getLobbies);

// =============================================================================
// SESSION ROUTES
// =============================================================================

/**
 * GET /api/team-card/session
 * Get current player's active session (if any)
 */
router.get('/session', authenticate, TeamCardGameController.getActiveSession);

/**
 * GET /api/team-card/session/:sessionId
 * Get specific session details
 */
router.get('/session/:sessionId', authenticate, TeamCardGameController.getSession);

// =============================================================================
// LOCATION ROUTES
// =============================================================================

/**
 * GET /api/team-card/locations
 * Get all team card game locations with access status
 */
router.get('/locations', optionalAuth, TeamCardGameController.getLocations);

/**
 * GET /api/team-card/locations/:locationId
 * Get specific location details
 */
router.get('/locations/:locationId', optionalAuth, TeamCardGameController.getLocation);

// =============================================================================
// BOSS ROUTES
// =============================================================================

/**
 * GET /api/team-card/bosses
 * Get all raid bosses
 * Query params: gameType
 */
router.get('/bosses', TeamCardGameController.getBosses);

/**
 * GET /api/team-card/bosses/:bossId
 * Get specific boss details
 */
router.get('/bosses/:bossId', TeamCardGameController.getBoss);

// =============================================================================
// GAME TYPE ROUTES
// =============================================================================

/**
 * GET /api/team-card/games
 * Get info about all available game types
 */
router.get('/games', TeamCardGameController.getGameTypes);

// =============================================================================
// STATS ROUTES
// =============================================================================

/**
 * GET /api/team-card/stats
 * Get player's team card game statistics
 */
router.get('/stats', authenticate, TeamCardGameController.getPlayerStats);

// =============================================================================
// EXPORT
// =============================================================================

export default router;
