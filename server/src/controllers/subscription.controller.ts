/**
 * Subscription Controller
 * Handles subscription and payment endpoints
 * Phase 7 - Stripe Stub Implementation
 */

import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { PaymentService } from '../services/payment.service';
import { User } from '../models/User.model';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import logger from '../utils/logger';

// Price in cents for each plan
const PLAN_PRICES: Record<string, number> = {
  premium_monthly: 500, // $5.00
  premium_yearly: 5000, // $50.00
};

export class SubscriptionController {
  /**
   * GET /api/subscription/plans
   * Get all available subscription plans
   */
  static getPlans = asyncHandler(async (_req: Request, res: Response) => {
    const plans = SubscriptionService.getPlans();

    res.json({
      success: true,
      data: {
        plans,
        isStubMode: PaymentService.isStubMode(),
      },
    });
  });

  /**
   * GET /api/subscription/current
   * Get current user's subscription status
   */
  static getCurrentSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const subscription = await SubscriptionService.getSubscription(userId);

    res.json({
      success: true,
      data: {
        ...subscription,
        isCancelled: !!(await User.findById(userId))?.subscriptionCancelled,
      },
    });
  });

  /**
   * POST /api/subscription/checkout
   * Create a payment intent for subscription checkout
   */
  static createCheckout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { planId } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!planId || !PLAN_PRICES[planId]) {
      throw new AppError('Invalid plan ID', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already subscribed to a premium plan
    const currentSubscription = await SubscriptionService.getSubscription(userId);
    if (currentSubscription.isActive && currentSubscription.plan.id !== 'free') {
      throw new AppError('Already subscribed to a premium plan', 400);
    }

    const amount = PLAN_PRICES[planId];

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      userId,
      planId,
      amount,
      metadata: {
        userEmail: user.email,
      },
    });

    logger.info(`Checkout created for user ${userId}, plan ${planId}`);

    res.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        planId,
        isStubMode: PaymentService.isStubMode(),
      },
    });
  });

  /**
   * POST /api/subscription/confirm
   * Confirm payment and activate subscription
   */
  static confirmPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { paymentIntentId, planId, paymentMethodId } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!paymentIntentId || !planId) {
      throw new AppError('Payment intent ID and plan ID required', 400);
    }

    // Confirm the payment
    const paymentSuccess = await PaymentService.confirmPayment({
      paymentIntentId,
      paymentMethodId,
    });

    if (!paymentSuccess) {
      throw new AppError('Payment confirmation failed', 402);
    }

    // Activate the subscription
    const result = await SubscriptionService.subscribe(userId, planId);

    logger.info(`Subscription activated for user ${userId}, plan ${planId}`);

    res.json({
      success: true,
      data: {
        ...result,
        subscription: await SubscriptionService.getSubscription(userId),
      },
    });
  });

  /**
   * POST /api/subscription/cancel
   * Cancel current subscription
   */
  static cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const result = await SubscriptionService.cancelSubscription(userId);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /api/subscription/reactivate
   * Reactivate a cancelled subscription (before expiration)
   */
  static reactivateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.subscriptionCancelled) {
      throw new AppError('Subscription is not cancelled', 400);
    }

    if (!user.subscriptionExpiresAt || user.subscriptionExpiresAt < new Date()) {
      throw new AppError('Subscription has already expired. Please subscribe again.', 400);
    }

    user.subscriptionCancelled = false;
    await user.save();

    logger.info(`Subscription reactivated for user ${userId}`);

    res.json({
      success: true,
      data: {
        message: 'Subscription reactivated successfully',
        subscription: await SubscriptionService.getSubscription(userId),
      },
    });
  });

  /**
   * GET /api/subscription/payment-status/:paymentIntentId
   * Check payment intent status
   */
  static getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { paymentIntentId } = req.params;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const status = await PaymentService.getPaymentIntentStatus(paymentIntentId);

    if (!status) {
      throw new AppError('Payment intent not found', 404);
    }

    res.json({
      success: true,
      data: status,
    });
  });

  /**
   * POST /api/subscription/webhook
   * Handle Stripe webhooks (for production)
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (PaymentService.isStubMode()) {
      logger.warn('Webhook received in stub mode - ignoring');
      return res.json({ received: true, stubMode: true });
    }

    if (!webhookSecret) {
      throw new AppError('Webhook secret not configured', 500);
    }

    const event = PaymentService.validateWebhookSignature(
      req.body,
      signature,
      webhookSecret
    );

    if (!event) {
      throw new AppError('Invalid webhook signature', 400);
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info(`Payment succeeded: ${event.data.object}`);
        // Payment is already confirmed in confirmPayment endpoint
        break;

      case 'payment_intent.payment_failed':
        logger.warn(`Payment failed: ${event.data.object}`);
        break;

      case 'customer.subscription.deleted':
        logger.info(`Subscription deleted: ${event.data.object}`);
        // Handle subscription cancellation from Stripe dashboard
        break;

      default:
        logger.debug(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });
  });
}
