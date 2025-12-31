/**
 * Payment Service
 * Handles Stripe payment integration with stub mode for development
 * Phase 7 - Stripe Stub Implementation
 */

import Stripe from 'stripe';
import { config } from '../config';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

// Stripe API version
const STRIPE_API_VERSION = '2024-11-20.acacia';

// Check if we're in stub mode (no real Stripe keys)
const isStubMode = !process.env.STRIPE_SECRET_KEY ||
                   process.env.STRIPE_SECRET_KEY === 'sk_test_stub' ||
                   process.env.STRIPE_SECRET_KEY.startsWith('sk_test_stub');

// Initialize Stripe client (or null in stub mode)
let stripe: Stripe | null = null;

if (!isStubMode && process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
  });
  logger.info('Stripe initialized with live/test keys');
} else {
  logger.warn('Stripe running in STUB MODE - payments will be simulated');
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
}

export interface CreatePaymentIntentParams {
  userId: string;
  planId: string;
  amount: number; // in cents
  currency?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export class PaymentService {
  /**
   * Check if running in stub mode
   */
  static isStubMode(): boolean {
    return isStubMode;
  }

  /**
   * Create a payment intent for subscription
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    const { userId, planId, amount, currency = 'usd', metadata = {} } = params;

    if (isStubMode) {
      // Stub mode: Return simulated payment intent
      const stubId = `pi_stub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      logger.info(`[STUB] Created payment intent: ${stubId} for user ${userId}, plan ${planId}`);

      return {
        id: stubId,
        clientSecret: `${stubId}_secret_stub`,
        amount,
        currency,
        status: 'requires_confirmation',
      };
    }

    // Real Stripe mode
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          userId,
          planId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Created Stripe payment intent: ${paymentIntent.id}`);

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentIntent['status'],
      };
    } catch (error) {
      logger.error('Stripe createPaymentIntent error:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPayment(params: ConfirmPaymentParams): Promise<boolean> {
    const { paymentIntentId, paymentMethodId } = params;

    if (isStubMode) {
      // Stub mode: Always succeed for stub payment intents
      if (paymentIntentId.startsWith('pi_stub_')) {
        logger.info(`[STUB] Confirmed payment intent: ${paymentIntentId}`);
        return true;
      }
      // Simulate failure for invalid stub IDs
      logger.warn(`[STUB] Invalid payment intent ID: ${paymentIntentId}`);
      return false;
    }

    // Real Stripe mode
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        return true;
      }

      if (paymentIntent.status === 'requires_confirmation' && paymentMethodId) {
        const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        });
        return confirmed.status === 'succeeded';
      }

      return false;
    } catch (error) {
      logger.error('Stripe confirmPayment error:', error);
      return false;
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntent | null> {
    if (isStubMode) {
      if (paymentIntentId.startsWith('pi_stub_')) {
        return {
          id: paymentIntentId,
          clientSecret: `${paymentIntentId}_secret_stub`,
          amount: 0,
          currency: 'usd',
          status: 'succeeded', // Stub always succeeds
        };
      }
      return null;
    }

    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentIntent['status'],
      };
    } catch (error) {
      logger.error('Stripe getPaymentIntentStatus error:', error);
      return null;
    }
  }

  /**
   * Cancel a payment intent
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    if (isStubMode) {
      logger.info(`[STUB] Cancelled payment intent: ${paymentIntentId}`);
      return true;
    }

    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      logger.info(`Cancelled Stripe payment intent: ${paymentIntentId}`);
      return true;
    } catch (error) {
      logger.error('Stripe cancelPaymentIntent error:', error);
      return false;
    }
  }

  /**
   * Create or get Stripe customer for user
   */
  static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    if (isStubMode) {
      const stubCustomerId = `cus_stub_${userId}`;
      logger.info(`[STUB] Using customer: ${stubCustomerId}`);
      return stubCustomerId;
    }

    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      // Search for existing customer
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0].id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });

      logger.info(`Created Stripe customer: ${customer.id} for user ${userId}`);
      return customer.id;
    } catch (error) {
      logger.error('Stripe getOrCreateCustomer error:', error);
      throw new AppError('Failed to create customer', 500);
    }
  }

  /**
   * Process refund
   */
  static async refund(paymentIntentId: string, amount?: number): Promise<boolean> {
    if (isStubMode) {
      logger.info(`[STUB] Refunded payment intent: ${paymentIntentId}, amount: ${amount || 'full'}`);
      return true;
    }

    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      await stripe.refunds.create(refundParams);
      logger.info(`Created refund for payment intent: ${paymentIntentId}`);
      return true;
    } catch (error) {
      logger.error('Stripe refund error:', error);
      return false;
    }
  }

  /**
   * Validate webhook signature (for production webhook handling)
   */
  static validateWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event | null {
    if (isStubMode) {
      logger.warn('[STUB] Webhook validation skipped in stub mode');
      return null;
    }

    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      logger.error('Webhook signature validation failed:', error);
      return null;
    }
  }
}
