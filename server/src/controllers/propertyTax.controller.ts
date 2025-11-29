/**
 * Property Tax Controller
 *
 * Handles HTTP requests for property tax operations
 */

import { Response } from 'express';
import { PropertyTaxService } from '../services/propertyTax.service';
import { AuthRequest } from '../middleware/requireAuth';
import logger from '../utils/logger';

export class PropertyTaxController {
  /**
   * GET /api/property-tax/:propertyId/calculate
   * Calculate taxes for a specific property
   */
  static async calculateTaxes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const calculation = await PropertyTaxService.calculateTaxes(propertyId);

      res.status(200).json({
        success: true,
        data: calculation,
      });
    } catch (error) {
      logger.error('Error calculating taxes:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate taxes',
      });
    }
  }

  /**
   * GET /api/property-tax/summary
   * Get tax summary for the authenticated owner (character or gang)
   */
  static async getOwnerTaxSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ownerId } = req.query;

      if (!ownerId || typeof ownerId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'ownerId query parameter is required',
        });
        return;
      }

      const summary = await PropertyTaxService.getOwnerTaxSummary(ownerId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error getting tax summary:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tax summary',
      });
    }
  }

  /**
   * POST /api/property-tax/:propertyId/pay
   * Pay taxes for a property
   */
  static async payTaxes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { payerId, amount } = req.body;

      if (!payerId || !amount) {
        res.status(400).json({
          success: false,
          error: 'payerId and amount are required',
        });
        return;
      }

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be a positive number',
        });
        return;
      }

      const result = await PropertyTaxService.processPayment(
        propertyId,
        payerId,
        amount,
        'manual'
      );

      res.status(200).json({
        success: true,
        data: {
          taxRecord: result.taxRecord,
          message: result.message,
        },
      });
    } catch (error) {
      logger.error('Error paying taxes:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pay taxes',
      });
    }
  }

  /**
   * POST /api/property-tax/:propertyId/auto-pay
   * Enable or disable auto-pay for a property
   */
  static async setAutoPay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { ownerId, enabled } = req.body;

      if (!ownerId || typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'ownerId and enabled (boolean) are required',
        });
        return;
      }

      const taxRecord = await PropertyTaxService.setAutoPay(propertyId, ownerId, enabled);

      res.status(200).json({
        success: true,
        data: taxRecord,
        message: `Auto-pay ${enabled ? 'enabled' : 'disabled'} for property`,
      });
    } catch (error) {
      logger.error('Error setting auto-pay:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set auto-pay',
      });
    }
  }

  /**
   * POST /api/property-tax/gang-base/:gangBaseId/create
   * Create or update tax record for a gang base
   */
  static async createGangBaseTaxRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangBaseId } = req.params;

      const taxRecord = await PropertyTaxService.createGangBaseTaxRecord(gangBaseId);

      res.status(201).json({
        success: true,
        data: taxRecord,
      });
    } catch (error) {
      logger.error('Error creating gang base tax record:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tax record',
      });
    }
  }

  /**
   * POST /api/property-tax/process-auto-payments (Admin)
   * Process all pending auto-payments
   */
  static async processAutoPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await PropertyTaxService.processAutoPayments();

      res.status(200).json({
        success: true,
        data: result,
        message: `Processed ${result.processed} auto-payments: ${result.successful} successful, ${result.failed} failed`,
      });
    } catch (error) {
      logger.error('Error processing auto-payments:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process auto-payments',
      });
    }
  }

  /**
   * POST /api/property-tax/send-reminders (Admin)
   * Send tax due reminders
   */
  static async sendReminders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const remindersSent = await PropertyTaxService.sendTaxDueReminders();

      res.status(200).json({
        success: true,
        data: { remindersSent },
        message: `Sent ${remindersSent} tax due reminders`,
      });
    } catch (error) {
      logger.error('Error sending reminders:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminders',
      });
    }
  }
}

export default PropertyTaxController;
