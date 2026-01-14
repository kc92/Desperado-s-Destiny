/**
 * Monetization Controller
 *
 * Handles ad rewards and player bonus endpoints.
 * Core of the FAIR monetization model where free players
 * can get the same bonuses as subscribers via ads.
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MonetizationService } from '../services/monetization.service';
import { AdRewardType, AD_REWARD_CONFIG } from '../models/AdReward.model';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import logger from '../utils/logger';

export class MonetizationController {
  /**
   * GET /api/monetization/bonuses
   * Get player's current bonuses (from subscription or ads)
   */
  static getPlayerBonuses = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    const bonuses = await MonetizationService.getPlayerBonuses(
      new mongoose.Types.ObjectId(characterId)
    );

    res.json({
      success: true,
      data: bonuses
    });
  });

  /**
   * GET /api/monetization/ad-status
   * Get ad reward status (active bonuses, remaining daily views)
   */
  static getAdRewardStatus = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    const status = await MonetizationService.getAdRewardStatus(
      new mongoose.Types.ObjectId(characterId)
    );

    res.json({
      success: true,
      data: status
    });
  });

  /**
   * GET /api/monetization/ad-config
   * Get configuration for all ad reward types
   */
  static getAdConfig = asyncHandler(async (_req: Request, res: Response) => {
    // Transform config for frontend consumption
    const config = Object.entries(AD_REWARD_CONFIG).map(([type, settings]) => ({
      type,
      ...settings
    }));

    res.json({
      success: true,
      data: {
        rewards: config,
        // Standard ad duration in seconds
        adDurationSeconds: 30
      }
    });
  });

  /**
   * POST /api/monetization/ad-reward
   * Record that player watched an ad and grant the reward
   *
   * In production, this should be called after server-side
   * verification that the ad was actually watched (via ad network callback)
   */
  static claimAdReward = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;
    const { rewardType, adNetworkToken } = req.body;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    if (!rewardType || !Object.values(AdRewardType).includes(rewardType)) {
      throw new AppError('Invalid reward type', 400);
    }

    // In production, verify the ad was watched via ad network
    // For now, we trust the client (stub mode)
    if (process.env.NODE_ENV === 'production' && !adNetworkToken) {
      throw new AppError('Ad verification token required', 400);
    }

    // TODO: In production, verify adNetworkToken with ad network API
    // This prevents players from claiming rewards without watching ads
    // Example: await AdNetworkService.verifyToken(adNetworkToken);

    const result = await MonetizationService.recordAdView(
      new mongoose.Types.ObjectId(characterId),
      rewardType as AdRewardType
    );

    if (!result.success) {
      throw new AppError(result.error || 'Failed to claim reward', 400);
    }

    logger.info('Ad reward claimed', {
      characterId,
      rewardType,
      reward: result.reward
    });

    res.json({
      success: true,
      data: {
        rewardType,
        reward: result.reward,
        message: AD_REWARD_CONFIG[rewardType as AdRewardType].description
      }
    });
  });

  /**
   * GET /api/monetization/should-show-ads
   * Check if player should see ads (not a subscriber)
   */
  static shouldShowAds = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    const showAds = await MonetizationService.shouldShowAds(
      new mongoose.Types.ObjectId(characterId)
    );

    res.json({
      success: true,
      data: { showAds }
    });
  });

  /**
   * POST /api/monetization/use-bonus-gold
   * Consume a pending bonus gold reward (from ad)
   */
  static useBonusGold = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    const consumed = await MonetizationService.consumeBonusGoldUse(
      new mongoose.Types.ObjectId(characterId)
    );

    if (!consumed) {
      throw new AppError('No bonus gold reward available', 400);
    }

    res.json({
      success: true,
      data: {
        consumed: true,
        message: 'Bonus gold applied to next action'
      }
    });
  });

  /**
   * POST /api/monetization/use-extra-contract
   * Consume a pending extra contract reward (from ad)
   */
  static useExtraContract = asyncHandler(async (req: Request, res: Response) => {
    const characterId = req.headers['x-character-id'] as string;

    if (!characterId) {
      throw new AppError('Character ID required', 400);
    }

    const consumed = await MonetizationService.consumeExtraContract(
      new mongoose.Types.ObjectId(characterId)
    );

    if (!consumed) {
      throw new AppError('No extra contract reward available', 400);
    }

    res.json({
      success: true,
      data: {
        consumed: true,
        message: 'Extra daily contract granted'
      }
    });
  });
}

export default MonetizationController;
