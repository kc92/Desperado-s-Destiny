import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { investmentRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// All routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Get available investment products
router.get('/products', asyncHandler(InvestmentController.getProducts));

// Get portfolio
router.get('/portfolio', asyncHandler(InvestmentController.getPortfolio));

// Make investment
router.post('/invest', requireCsrfToken, investmentRateLimiter, asyncHandler(InvestmentController.invest));

// Cash out investment
router.post('/:investmentId/cashout', requireCsrfToken, investmentRateLimiter, asyncHandler(InvestmentController.cashOut));

// Get investment history
router.get('/history', asyncHandler(InvestmentController.getHistory));

export default router;
