/**
 * Newspaper Routes
 * Phase 12, Wave 12.1 - Desperados Destiny
 */

import { Router } from 'express';
import { newspaperController } from '../controllers/newspaper.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// Public routes - no auth required
router.get('/', asyncHandler(newspaperController.getAllNewspapers));
router.get('/breaking-news', asyncHandler(newspaperController.getBreakingNews));
router.get('/:newspaperId/current', asyncHandler(newspaperController.getCurrentEdition));
router.get(
  '/:newspaperId/editions/:editionNumber',
  asyncHandler(newspaperController.getEdition)
);
router.get('/articles/:articleId', asyncHandler(newspaperController.getArticle));
router.post('/search', requireCsrfToken, asyncHandler(newspaperController.searchArticles));
router.get('/:newspaperId/stats', asyncHandler(newspaperController.getStats));

// Protected routes - require authentication
router.post(
  '/:newspaperId/subscribe',
  requireAuth,
  requireCsrfToken,
  asyncHandler(newspaperController.subscribe)
);
router.post('/:newspaperId/buy', requireAuth, requireCsrfToken, asyncHandler(newspaperController.buySingleNewspaper));
router.delete(
  '/subscriptions/:subscriptionId',
  requireAuth,
  requireCsrfToken,
  asyncHandler(newspaperController.cancelSubscription)
);
router.get('/subscriptions', requireAuth, asyncHandler(newspaperController.getSubscriptions));
router.get(
  '/mentions/:characterId',
  requireAuth,
  asyncHandler(newspaperController.getCharacterMentions)
);

// Admin routes (Protected by requireAdmin middleware)
router.post('/articles', requireAuth, requireAdmin, requireCsrfToken, asyncHandler(newspaperController.createArticle));
router.post('/publish', requireAuth, requireAdmin, requireCsrfToken, asyncHandler(newspaperController.publishNewspaper));

// System routes (Protected by requireAdmin middleware)
router.post('/world-event', requireAuth, requireAdmin, requireCsrfToken, asyncHandler(newspaperController.handleWorldEvent));

export default router;
