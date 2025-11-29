/**
 * Territory Influence Routes
 *
 * API endpoints for faction influence and territory control
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import { Router } from 'express';
import { TerritoryInfluenceController } from '../controllers/territoryInfluence.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All territory influence routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// TERRITORY QUERIES
// ========================

/**
 * @route   GET /api/territory-influence
 * @desc    Get all territory influence summaries
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(TerritoryInfluenceController.getAllTerritories)
);

/**
 * @route   GET /api/territory-influence/:territoryId
 * @desc    Get territory influence summary
 * @access  Private
 */
router.get(
  '/:territoryId',
  asyncHandler(TerritoryInfluenceController.getTerritoryInfluence)
);

/**
 * @route   GET /api/territory-influence/:territoryId/history
 * @desc    Get influence history for a territory
 * @access  Private
 * @query   limit (optional, default 50)
 */
router.get(
  '/:territoryId/history',
  asyncHandler(TerritoryInfluenceController.getInfluenceHistory)
);

/**
 * @route   GET /api/territory-influence/:territoryId/benefits
 * @desc    Get alignment benefits for faction in territory
 * @access  Private
 * @query   factionId (required)
 */
router.get(
  '/:territoryId/benefits',
  asyncHandler(TerritoryInfluenceController.getAlignmentBenefits)
);

// ========================
// FACTION QUERIES
// ========================

/**
 * @route   GET /api/territory-influence/factions/:factionId/overview
 * @desc    Get faction overview across all territories
 * @access  Private
 */
router.get(
  '/factions/:factionId/overview',
  asyncHandler(TerritoryInfluenceController.getFactionOverview)
);

// ========================
// CHARACTER CONTRIBUTIONS
// ========================

/**
 * @route   GET /api/territory-influence/characters/:characterId/contributions
 * @desc    Get character's influence contributions
 * @access  Private
 * @query   limit (optional, default 50)
 */
router.get(
  '/characters/:characterId/contributions',
  asyncHandler(TerritoryInfluenceController.getCharacterInfluence)
);

// ========================
// INFLUENCE MODIFICATION
// ========================

/**
 * @route   POST /api/territory-influence/:territoryId/contribute
 * @desc    Contribute to faction influence in a territory
 * @access  Private
 * @body    { factionId, amount, source, metadata? }
 */
router.post(
  '/:territoryId/contribute',
  asyncHandler(TerritoryInfluenceController.contributeInfluence)
);

/**
 * @route   POST /api/territory-influence/:territoryId/donate
 * @desc    Donate gold to faction for influence
 * @access  Private
 * @body    { factionId, donationAmount }
 */
router.post(
  '/:territoryId/donate',
  asyncHandler(TerritoryInfluenceController.donateForInfluence)
);

/**
 * @route   POST /api/territory-influence/:territoryId/gang-alignment
 * @desc    Apply gang alignment influence (daily passive gain)
 * @access  Private (system/cron)
 * @body    { gangId, gangName, factionId, influenceAmount }
 */
router.post(
  '/:territoryId/gang-alignment',
  asyncHandler(TerritoryInfluenceController.applyGangAlignmentInfluence)
);

/**
 * @route   POST /api/territory-influence/:territoryId/quest
 * @desc    Apply quest completion influence
 * @access  Private
 * @body    { factionId, questId, influenceAmount }
 */
router.post(
  '/:territoryId/quest',
  asyncHandler(TerritoryInfluenceController.applyQuestInfluence)
);

/**
 * @route   POST /api/territory-influence/:territoryId/crime
 * @desc    Apply criminal activity influence (negative for controlling faction)
 * @access  Private
 * @body    { crimeType }
 */
router.post(
  '/:territoryId/crime',
  asyncHandler(TerritoryInfluenceController.applyCrimeInfluence)
);

// ========================
// SYSTEM OPERATIONS (Admin/Cron)
// ========================

/**
 * @route   POST /api/territory-influence/initialize
 * @desc    Initialize all territories with base influence
 * @access  Private (should be admin only in production)
 */
router.post(
  '/initialize',
  asyncHandler(TerritoryInfluenceController.initializeTerritories)
);

/**
 * @route   POST /api/territory-influence/apply-daily-decay
 * @desc    Apply daily influence decay to all territories
 * @access  Private (should be admin/cron only in production)
 */
router.post(
  '/apply-daily-decay',
  asyncHandler(TerritoryInfluenceController.applyDailyDecay)
);

export default router;
