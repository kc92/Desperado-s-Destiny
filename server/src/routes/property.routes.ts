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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes
router.get('/listings', getListings);
router.get('/foreclosed', getForeclosedListings);
router.get('/:propertyId', getPropertyDetails);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get my properties
router.get('/my-properties', getMyProperties);

// Get my loans
router.get('/loans', getMyLoans);

// Purchase property
router.post('/purchase', purchaseProperty);

// Property upgrades
router.post('/:propertyId/upgrade-tier', upgradeTier);
router.post('/:propertyId/upgrade', addUpgrade);

// Worker management
router.post('/:propertyId/hire', hireWorker);
router.post('/:propertyId/fire', fireWorker);

// Storage management
router.post('/:propertyId/storage/deposit', depositItem);
router.post('/:propertyId/storage/withdraw', withdrawItem);

// Loan payment
router.post('/loans/:loanId/pay', makeLoanPayment);

// Property transfer
router.post('/:propertyId/transfer', transferProperty);

export default router;
