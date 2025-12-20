/**
 * Property Routes
 * Property ownership, purchase, and management system
 */

import { Router } from 'express';
import {
  getListings,
  getForeclosedListings,
  getPropertyDetails,
  purchaseProperty,
  getMyProperties,
  upgradeTier,
  addUpgrade,
  hireWorker,
  fireWorker,
  depositItem,
  withdrawItem,
  getMyLoans,
  makeLoanPayment,
  transferProperty,
} from '../controllers/property.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { checkGoldDuplication, rateLimitGoldTransactions, logEconomicTransaction } from '../middleware/antiExploit.middleware';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { validate, validateObjectId } from '../validation/middleware';
import { PropertySchemas } from '../validation/schemas';

const router = Router();

// Public routes
router.get('/listings', asyncHandler(getListings));
router.get('/foreclosed', asyncHandler(getForeclosedListings));
router.get(
  '/:propertyId',
  validateObjectId('propertyId'),
  asyncHandler(getPropertyDetails)
);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get my properties
router.get('/my-properties', asyncHandler(getMyProperties));

// Get my loans
router.get('/loans', asyncHandler(getMyLoans));

// Purchase property - validate body
router.post(
  '/purchase',
  requireCsrfToken,
  validate(PropertySchemas.purchase),
  checkGoldDuplication(),
  asyncHandler(purchaseProperty)
);

// Property upgrades - validate propertyId param
router.post(
  '/:propertyId/upgrade-tier',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.upgradeTier),
  checkGoldDuplication(),
  asyncHandler(upgradeTier)
);

router.post(
  '/:propertyId/upgrade',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.upgrade),
  checkGoldDuplication(),
  asyncHandler(addUpgrade)
);

// Worker management - validate propertyId and body
router.post(
  '/:propertyId/hire',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.hireWorker),
  asyncHandler(hireWorker)
);

router.post(
  '/:propertyId/fire',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.fireWorker),
  asyncHandler(fireWorker)
);

// Storage management - validate propertyId and body
router.post(
  '/:propertyId/storage/deposit',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.depositItem),
  asyncHandler(depositItem)
);

router.post(
  '/:propertyId/storage/withdraw',
  requireCsrfToken,
  validateObjectId('propertyId'),
  validate(PropertySchemas.withdrawItem),
  asyncHandler(withdrawItem)
);

// Loan payment - validate loanId and body
router.post(
  '/loans/:loanId/pay',
  requireCsrfToken,
  validateObjectId('loanId'),
  validate(PropertySchemas.makeLoanPayment),
  rateLimitGoldTransactions(20),
  checkGoldDuplication(),
  asyncHandler(makeLoanPayment)
);

// Property transfer - CSRF rotation for asset transfer
router.post(
  '/:propertyId/transfer',
  validateObjectId('propertyId'),
  validate(PropertySchemas.transferProperty),
  requireCsrfTokenWithRotation,
  checkGoldDuplication(),
  asyncHandler(transferProperty)
);

export default router;
