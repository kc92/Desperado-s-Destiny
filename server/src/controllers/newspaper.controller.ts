/**
 * Newspaper Controller
 * Phase 12, Wave 12.1 - Desperados Destiny
 */

import { Request, Response } from 'express';
import { newspaperService } from '../services/newspaper.service';
import { newspaperPublisherJob } from '../jobs/newspaperPublisher.job';
import {
  ArticleGenerationParams,
  SearchArticlesRequest,
  GetEditionRequest,
} from '@desperados/shared';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

export const newspaperController = {
  /**
   * GET /api/newspapers
   * Get all newspapers
   */
  getAllNewspapers: async (req: Request, res: Response): Promise<void> => {
    try {
      const newspapers = newspaperService.getAllNewspapers();
      res.json({ success: true, newspapers });
    } catch (error) {
      logger.error('[NewspaperController] Error getting newspapers:', error);
      res.status(500).json({ success: false, message: 'Failed to get newspapers' });
    }
  },

  /**
   * GET /api/newspapers/:newspaperId/current
   * Get current edition of newspaper
   */
  getCurrentEdition: async (req: Request, res: Response): Promise<void> => {
    try {
      const { newspaperId } = req.params;
      const edition = await newspaperService.getCurrentEdition(newspaperId);

      if (!edition) {
        res.status(404).json({ success: false, message: 'No edition found' });
        return;
      }

      res.json({ success: true, edition });
    } catch (error) {
      logger.error('[NewspaperController] Error getting current edition:', error);
      res.status(500).json({ success: false, message: 'Failed to get edition' });
    }
  },

  /**
   * GET /api/newspapers/:newspaperId/editions/:editionNumber
   * Get specific edition
   */
  getEdition: async (req: Request, res: Response): Promise<void> => {
    try {
      const { newspaperId, editionNumber } = req.params;

      const request: GetEditionRequest = {
        newspaperId,
        editionNumber: parseInt(editionNumber),
      };

      const edition = await newspaperService.getEdition(request);

      if (!edition) {
        res.status(404).json({ success: false, message: 'Edition not found' });
        return;
      }

      res.json({ success: true, edition });
    } catch (error) {
      logger.error('[NewspaperController] Error getting edition:', error);
      res.status(500).json({ success: false, message: 'Failed to get edition' });
    }
  },

  /**
   * GET /api/newspapers/articles/:articleId
   * Get specific article
   */
  getArticle: async (req: Request, res: Response): Promise<void> => {
    try {
      const { articleId } = req.params;
      const article = await newspaperService.getArticle(articleId);

      if (!article) {
        res.status(404).json({ success: false, message: 'Article not found' });
        return;
      }

      // Mark as read if character is authenticated
      if (req.user?.characterId) {
        await newspaperService.markArticleAsRead(articleId, req.user.characterId);
      }

      res.json({ success: true, article });
    } catch (error) {
      logger.error('[NewspaperController] Error getting article:', error);
      res.status(500).json({ success: false, message: 'Failed to get article' });
    }
  },

  /**
   * POST /api/newspapers/search
   * Search articles
   */
  searchArticles: async (req: Request, res: Response): Promise<void> => {
    try {
      const searchRequest: SearchArticlesRequest = req.body;
      const articles = await newspaperService.searchArticles(searchRequest);

      res.json({ success: true, articles, count: articles.length });
    } catch (error) {
      logger.error('[NewspaperController] Error searching articles:', error);
      res.status(500).json({ success: false, message: 'Failed to search articles' });
    }
  },

  /**
   * POST /api/newspapers/:newspaperId/subscribe
   * Subscribe to newspaper
   */
  subscribe: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.characterId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { newspaperId } = req.params;
      const { subscriptionType, autoRenew } = req.body;

      const subscription = await newspaperService.subscribe(
        req.user.characterId,
        newspaperId,
        subscriptionType,
        autoRenew || false
      );

      res.json({ success: true, subscription });
    } catch (error: any) {
      logger.error('[NewspaperController] Error subscribing:', error);
      res.status(400).json({ success: false, message: sanitizeErrorMessage(error) });
    }
  },

  /**
   * POST /api/newspapers/:newspaperId/buy
   * Buy single newspaper
   */
  buySingleNewspaper: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.characterId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { newspaperId } = req.params;
      const subscription = await newspaperService.buySingleNewspaper(
        req.user.characterId,
        newspaperId
      );

      res.json({ success: true, subscription });
    } catch (error: any) {
      logger.error('[NewspaperController] Error buying newspaper:', error);
      res.status(400).json({ success: false, message: sanitizeErrorMessage(error) });
    }
  },

  /**
   * DELETE /api/newspapers/subscriptions/:subscriptionId
   * Cancel subscription
   */
  cancelSubscription: async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;
      await newspaperService.cancelSubscription(subscriptionId);

      res.json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      logger.error('[NewspaperController] Error cancelling subscription:', error);
      res.status(400).json({ success: false, message: 'Failed to cancel subscription' });
    }
  },

  /**
   * GET /api/newspapers/subscriptions
   * Get character's subscriptions
   */
  getSubscriptions: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.characterId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const subscriptions = await newspaperService.getCharacterSubscriptions(
        req.user.characterId
      );

      res.json({ success: true, subscriptions });
    } catch (error) {
      logger.error('[NewspaperController] Error getting subscriptions:', error);
      res.status(500).json({ success: false, message: 'Failed to get subscriptions' });
    }
  },

  /**
   * GET /api/newspapers/breaking-news
   * Get breaking news (recent featured articles)
   */
  getBreakingNews: async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await newspaperService.getBreakingNews(limit);

      res.json({ success: true, articles });
    } catch (error) {
      logger.error('[NewspaperController] Error getting breaking news:', error);
      res.status(500).json({ success: false, message: 'Failed to get breaking news' });
    }
  },

  /**
   * GET /api/newspapers/mentions/:characterId
   * Get articles mentioning character
   */
  getCharacterMentions: async (req: Request, res: Response): Promise<void> => {
    try {
      const { characterId } = req.params;
      const articles = await newspaperService.getArticlesMentioningCharacter(characterId);

      res.json({ success: true, articles });
    } catch (error) {
      logger.error('[NewspaperController] Error getting character mentions:', error);
      res.status(500).json({ success: false, message: 'Failed to get mentions' });
    }
  },

  /**
   * GET /api/newspapers/:newspaperId/stats
   * Get newspaper statistics
   */
  getStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { newspaperId } = req.params;
      const stats = await newspaperService.getNewspaperStats(newspaperId);

      res.json({ success: true, stats });
    } catch (error) {
      logger.error('[NewspaperController] Error getting stats:', error);
      res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
  },

  /**
   * POST /api/newspapers/articles (Admin only)
   * Create article manually
   */
  createArticle: async (req: Request, res: Response): Promise<void> => {
    try {
      // Admin authorization enforced at route level via requireAdmin middleware
      const params: ArticleGenerationParams = req.body;
      const article = await newspaperService.createArticle(params);

      res.json({ success: true, article });
    } catch (error) {
      logger.error('[NewspaperController] Error creating article:', error);
      res.status(500).json({ success: false, message: 'Failed to create article' });
    }
  },

  /**
   * POST /api/newspapers/publish (Admin only)
   * Trigger publication manually
   */
  publishNewspaper: async (req: Request, res: Response): Promise<void> => {
    try {
      // Admin authorization enforced at route level via requireAdmin middleware
      const { newspaperId } = req.body;
      const edition = await newspaperService.publishEdition(newspaperId);

      res.json({ success: true, edition });
    } catch (error) {
      logger.error('[NewspaperController] Error publishing newspaper:', error);
      res.status(500).json({ success: false, message: 'Failed to publish newspaper' });
    }
  },

  /**
   * POST /api/newspapers/world-event (System only)
   * Handle world event and create articles
   */
  handleWorldEvent: async (req: Request, res: Response): Promise<void> => {
    try {
      const params: ArticleGenerationParams = req.body;
      await newspaperPublisherJob.handleWorldEvent(params);

      res.json({ success: true, message: 'World event processed' });
    } catch (error) {
      logger.error('[NewspaperController] Error handling world event:', error);
      res.status(500).json({ success: false, message: 'Failed to handle world event' });
    }
  },
};
