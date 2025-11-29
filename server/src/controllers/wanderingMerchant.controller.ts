/**
 * Wandering Merchant Controller
 * Handles traveling merchant API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { WanderingMerchantService } from '../services/wanderingMerchant.service';

/**
 * Get all wandering merchants
 * GET /api/merchants/all
 */
export const getAllMerchants = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { faction } = req.query;

    let merchants;
    if (faction && typeof faction === 'string') {
      merchants = WanderingMerchantService.getMerchantsByFaction(faction);
    } else {
      merchants = WanderingMerchantService.getAllMerchants();
    }

    res.status(200).json({
      success: true,
      data: {
        merchants,
        total: merchants.length,
      },
    });
  }
);

/**
 * Get currently available merchants
 * GET /api/merchants/available
 */
export const getAvailableMerchants = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const merchants = WanderingMerchantService.getAvailableMerchants();

    res.status(200).json({
      success: true,
      data: {
        merchants,
        total: merchants.length,
      },
    });
  }
);

/**
 * Get specific merchant details
 * GET /api/merchants/:merchantId
 */
export const getMerchantDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { merchantId } = req.params;

    const merchant = WanderingMerchantService.getMerchant(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    const state = WanderingMerchantService.getMerchantState(merchantId);
    const schedule = WanderingMerchantService.getMerchantRouteSchedule(merchantId);

    res.status(200).json({
      success: true,
      data: {
        merchant,
        state,
        schedule,
      },
    });
  }
);

/**
 * Get merchant's current state (location, availability)
 * GET /api/merchants/:merchantId/state
 */
export const getMerchantState = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { merchantId } = req.params;

    const state = WanderingMerchantService.getMerchantState(merchantId);
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found or state unavailable',
      });
    }

    res.status(200).json({
      success: true,
      data: state,
    });
  }
);

/**
 * Get merchants at a specific location
 * GET /api/merchants/at-location/:locationId
 */
export const getMerchantsAtLocation = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { locationId } = req.params;

    const merchants = WanderingMerchantService.getMerchantsAtLocation(locationId);

    res.status(200).json({
      success: true,
      data: {
        merchants,
        locationId,
        total: merchants.length,
      },
    });
  }
);

/**
 * Get upcoming merchants arriving at location
 * GET /api/merchants/upcoming/:locationId
 */
export const getUpcomingMerchants = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { locationId } = req.params;
    const { hours = 48 } = req.query;

    const upcoming = WanderingMerchantService.getUpcomingMerchantsAtLocation(
      locationId,
      Number(hours)
    );

    res.status(200).json({
      success: true,
      data: {
        upcoming,
        locationId,
        hoursAhead: Number(hours),
        total: upcoming.length,
      },
    });
  }
);

/**
 * Search merchants by name or goods
 * GET /api/merchants/search
 */
export const searchMerchants = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const merchants = WanderingMerchantService.searchMerchants(q);

    res.status(200).json({
      success: true,
      data: {
        merchants,
        query: q,
        total: merchants.length,
      },
    });
  }
);

/**
 * Get merchant inventory (filtered by player trust)
 * GET /api/merchants/:merchantId/inventory
 */
export const getMerchantInventory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { merchantId } = req.params;

    // TODO: Get actual trust level from character-NPC relationship
    const playerTrustLevel = 0;

    const inventory = WanderingMerchantService.getMerchantInventory(
      merchantId,
      playerTrustLevel
    );

    const priceModifier = WanderingMerchantService.getPriceModifier(
      merchantId,
      playerTrustLevel
    );

    res.status(200).json({
      success: true,
      data: {
        inventory,
        priceModifier,
        trustLevel: playerTrustLevel,
        total: inventory.length,
      },
    });
  }
);

/**
 * Get merchant dialogue
 * GET /api/merchants/:merchantId/dialogue
 */
export const getMerchantDialogue = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { merchantId } = req.params;
    const { context = 'greeting' } = req.query;

    // TODO: Get actual trust level from character-NPC relationship
    const playerTrustLevel = 0;

    const validContexts = ['greeting', 'trading', 'departure', 'busy'] as const;
    const dialogueContext = validContexts.includes(context as any)
      ? (context as 'greeting' | 'trading' | 'departure' | 'busy')
      : 'greeting';

    const dialogue = WanderingMerchantService.getMerchantDialogue(
      merchantId,
      playerTrustLevel,
      dialogueContext
    );

    res.status(200).json({
      success: true,
      data: {
        dialogue,
        context: dialogueContext,
        trustLevel: playerTrustLevel,
      },
    });
  }
);

/**
 * Get trust level info for merchant
 * GET /api/merchants/:merchantId/trust
 */
export const getMerchantTrustInfo = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { merchantId } = req.params;

    // TODO: Get actual trust level from character-NPC relationship
    const currentTrustLevel = 0;

    const trustInfo = WanderingMerchantService.getTrustLevelInfo(
      merchantId,
      currentTrustLevel
    );

    res.status(200).json({
      success: true,
      data: {
        ...trustInfo,
        currentLevel: currentTrustLevel,
      },
    });
  }
);

/**
 * Discover a hidden merchant
 * POST /api/merchants/:merchantId/discover
 */
export const discoverMerchant = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { merchantId } = req.params;

    const merchant = WanderingMerchantService.getMerchant(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    if (!merchant.hidden) {
      return res.status(400).json({
        success: false,
        error: 'This merchant is not hidden',
      });
    }

    // Check if already discovered
    if (WanderingMerchantService.hasPlayerDiscovered(characterId, merchantId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already discovered this merchant',
      });
    }

    // TODO: Check discovery conditions (rep, quest, etc.)

    WanderingMerchantService.discoverMerchant(characterId, merchantId);

    res.status(200).json({
      success: true,
      data: {
        merchant,
        message: `You discovered ${merchant.name}, the ${merchant.title}!`,
      },
    });
  }
);

/**
 * Get merchants visible to player (including discovered hidden ones)
 * GET /api/merchants/visible
 */
export const getVisibleMerchants = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const merchants = WanderingMerchantService.getVisibleMerchantsForPlayer(characterId);

    res.status(200).json({
      success: true,
      data: {
        merchants,
        total: merchants.length,
      },
    });
  }
);

/**
 * Get merchant statistics
 * GET /api/merchants/stats
 */
export const getMerchantStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = WanderingMerchantService.getMerchantStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Buy an item from a wandering merchant
 * POST /api/merchants/:merchantId/buy
 */
export const buyFromMerchant = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { merchantId } = req.params;
    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required',
      });
    }

    // TODO: Get actual trust level from character-NPC relationship
    // For now, using 0 as default - in a full implementation,
    // this would query the NPCRelationship or similar model
    const playerTrustLevel = 0;

    const result = await WanderingMerchantService.buyFromMerchant(
      characterId,
      merchantId,
      itemId,
      quantity,
      playerTrustLevel
    );

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
        item: result.item,
        quantity,
        totalCost: result.totalCost,
        priceModifier: result.priceModifier,
        newGold: result.character.gold,
        inventory: result.character.inventory,
      },
    });
  }
);
