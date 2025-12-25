import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// All routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Get available investment products
router.get('/products', InvestmentController.getProducts);

// Get portfolio
router.get('/portfolio', InvestmentController.getPortfolio);

// Make investment
router.post('/invest', InvestmentController.invest);

// Cash out investment
router.post('/:investmentId/cashout', InvestmentController.cashOut);

// Get investment history
router.get('/history', InvestmentController.getHistory);

export default router;
