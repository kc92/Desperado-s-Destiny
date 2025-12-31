/**
 * Subscription Routes
 * Handles subscription and payment endpoints
 * Phase 7 - Stripe Stub Implementation
 */

import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';
import csrfProtection from '../middleware/csrf.middleware';
import express from 'express';

const router = Router();

// Public routes (no auth required)
router.get('/plans', SubscriptionController.getPlans);

// Protected routes (auth required)
router.get('/current', authenticate, SubscriptionController.getCurrentSubscription);
router.post('/checkout', authenticate, csrfProtection.requireCsrfToken, SubscriptionController.createCheckout);
router.post('/confirm', authenticate, csrfProtection.requireCsrfToken, SubscriptionController.confirmPayment);
router.post('/cancel', authenticate, csrfProtection.requireCsrfToken, SubscriptionController.cancelSubscription);
router.post('/reactivate', authenticate, csrfProtection.requireCsrfToken, SubscriptionController.reactivateSubscription);
router.get('/payment-status/:paymentIntentId', authenticate, SubscriptionController.getPaymentStatus);

// Webhook route (raw body required for Stripe signature verification)
// Note: This should be mounted BEFORE body parser middleware in production
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  SubscriptionController.handleWebhook
);

export default router;
