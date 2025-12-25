/**
 * Business Controller
 *
 * Phase 12: Business Ownership System
 *
 * Handles HTTP requests for business operations
 */

import { Request, Response } from 'express';
import { BusinessService } from '../services/business.service';
import { BusinessRevenueService } from '../services/businessRevenue.service';
import { Business } from '../models/Business.model';
import { BusinessServiceRecord } from '../models/BusinessServiceRecord.model';
import logger from '../utils/logger';
import {
  PlayerBusinessType,
  PROPERTY_BUSINESS_MAPPING,
  BUSINESS_TYPE_INFO,
} from '@desperados/shared';
import { PropertyType } from '@desperados/shared';

// Use Express Request with character middleware - character is injected by auth middleware

export class BusinessController {
  /**
   * GET /api/businesses/my-businesses
   * Get all businesses owned by the authenticated character
   */
  static async getMyBusinesses(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const businesses = await BusinessService.getBusinessesByOwner(characterId);
      const pendingRevenue = await BusinessRevenueService.getPendingRevenueByOwner(characterId);

      res.json({
        businesses,
        pendingRevenue,
      });
    } catch (error) {
      logger.error('Failed to get businesses:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get businesses',
      });
    }
  }

  /**
   * GET /api/businesses/:businessId
   * Get business details
   */
  static async getBusinessDetails(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;

      const business = await BusinessService.getBusinessById(businessId);
      if (!business) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      // Get recent transactions
      const recentTransactions = await BusinessServiceRecord.findByBusiness(businessId, 20);

      // Get statistics
      const statistics = await BusinessService.getBusinessStatistics(businessId, 'week');

      res.json({
        business,
        recentTransactions,
        statistics,
      });
    } catch (error) {
      logger.error('Failed to get business details:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get business details',
      });
    }
  }

  /**
   * POST /api/businesses/establish
   * Establish a new business on a property
   */
  static async establishBusiness(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { propertyId, businessType, businessName, description } = req.body;

      if (!propertyId || !businessType || !businessName) {
        res.status(400).json({
          error: 'Missing required fields: propertyId, businessType, businessName',
        });
        return;
      }

      const result = await BusinessService.establishBusiness(
        characterId,
        propertyId,
        businessType as PlayerBusinessType,
        businessName,
        description
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(201).json({
        message: 'Business established successfully',
        business: result.business,
        establishmentCost: result.establishmentCost,
      });
    } catch (error) {
      logger.error('Failed to establish business:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to establish business',
      });
    }
  }

  /**
   * PUT /api/businesses/:businessId/services/:serviceId/price
   * Update service price
   */
  static async updateServicePrice(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId, serviceId } = req.params;
      const { price } = req.body;

      if (typeof price !== 'number' || price < 0) {
        res.status(400).json({ error: 'Invalid price' });
        return;
      }

      const result = await BusinessService.updateServicePrice(
        characterId,
        businessId,
        serviceId,
        price
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Service price updated' });
    } catch (error) {
      logger.error('Failed to update service price:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update service price',
      });
    }
  }

  /**
   * POST /api/businesses/:businessId/services/:serviceId/toggle
   * Toggle service active state
   */
  static async toggleService(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId, serviceId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({ error: 'isActive must be a boolean' });
        return;
      }

      const result = await BusinessService.toggleService(
        characterId,
        businessId,
        serviceId,
        isActive
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: `Service ${isActive ? 'enabled' : 'disabled'}` });
    } catch (error) {
      logger.error('Failed to toggle service:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to toggle service',
      });
    }
  }

  /**
   * POST /api/businesses/:businessId/staff/assign
   * Assign worker to business
   */
  static async assignStaff(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId } = req.params;
      const { workerId, workerName, specialization, role, serviceId, productId } = req.body;

      if (!workerId || !workerName || !specialization || !role) {
        res.status(400).json({
          error: 'Missing required fields: workerId, workerName, specialization, role',
        });
        return;
      }

      const result = await BusinessService.assignStaff(
        characterId,
        businessId,
        workerId,
        workerName,
        specialization,
        role,
        serviceId,
        productId
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Staff assigned successfully' });
    } catch (error) {
      logger.error('Failed to assign staff:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to assign staff',
      });
    }
  }

  /**
   * DELETE /api/businesses/:businessId/staff/:workerId
   * Remove staff from business
   */
  static async removeStaff(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId, workerId } = req.params;

      const result = await BusinessService.removeStaff(characterId, businessId, workerId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Staff removed successfully' });
    } catch (error) {
      logger.error('Failed to remove staff:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to remove staff',
      });
    }
  }

  /**
   * POST /api/businesses/:businessId/collect
   * Collect pending revenue
   */
  static async collectRevenue(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId } = req.params;

      const result = await BusinessService.collectRevenue(characterId, businessId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        message: 'Revenue collected successfully',
        collectedAmount: result.collectedAmount,
        newPendingRevenue: result.newPendingRevenue,
      });
    } catch (error) {
      logger.error('Failed to collect revenue:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to collect revenue',
      });
    }
  }

  /**
   * GET /api/businesses/:businessId/statistics
   * Get business statistics
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const period = (req.query.period as 'day' | 'week' | 'month' | 'all') || 'week';

      const statistics = await BusinessService.getBusinessStatistics(businessId, period);

      res.json(statistics);
    } catch (error) {
      logger.error('Failed to get statistics:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      });
    }
  }

  /**
   * POST /api/businesses/:businessId/close
   * Close a business
   */
  static async closeBusiness(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId } = req.params;

      const result = await BusinessService.closeBusiness(characterId, businessId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Business closed successfully' });
    } catch (error) {
      logger.error('Failed to close business:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to close business',
      });
    }
  }

  /**
   * POST /api/businesses/:businessId/reopen
   * Reopen a closed business
   */
  static async reopenBusiness(req: Request, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;
      if (!characterId) {
        res.status(401).json({ error: 'Character not found' });
        return;
      }

      const { businessId } = req.params;

      const result = await BusinessService.reopenBusiness(characterId, businessId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Business reopened successfully' });
    } catch (error) {
      logger.error('Failed to reopen business:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to reopen business',
      });
    }
  }

  /**
   * GET /api/businesses/location/:locationId
   * Get all businesses at a location (for customers)
   */
  static async getBusinessesAtLocation(req: Request, res: Response): Promise<void> {
    try {
      const { locationId } = req.params;

      const businesses = await BusinessService.getBusinessesByLocation(locationId);

      // Format for customer view
      const formatted = businesses.map(b => ({
        businessId: b._id,
        businessName: b.businessName,
        businessType: b.businessType,
        reputation: b.reputation.overall,
        isOpen: b.isOpen(),
        services: b.services
          .filter(s => s.isActive)
          .map(s => ({
            serviceId: s.serviceId,
            name: s.name,
            price: s.currentPrice,
            duration: s.duration,
          })),
        products: b.products
          .filter(p => p.stockLevel > 0)
          .map(p => ({
            productId: p.productId,
            name: p.name,
            price: p.currentPrice,
            stock: p.stockLevel,
          })),
      }));

      res.json({
        locationId,
        businesses: formatted,
      });
    } catch (error) {
      logger.error('Failed to get businesses at location:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get businesses',
      });
    }
  }

  /**
   * GET /api/businesses/types/:propertyType
   * Get available business types for a property type
   */
  static async getAvailableTypes(req: Request, res: Response): Promise<void> {
    try {
      const { propertyType } = req.params;

      const availableTypes = BusinessService.getAvailableBusinessTypes(propertyType as PropertyType);

      const typeDetails = availableTypes.map(type => ({
        type,
        ...BUSINESS_TYPE_INFO[type],
      }));

      res.json({ propertyType, availableTypes: typeDetails });
    } catch (error) {
      logger.error('Failed to get available types:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get available types',
      });
    }
  }

  /**
   * GET /api/businesses/services/:businessType
   * Get service definitions for a business type
   */
  static async getServiceDefinitions(req: Request, res: Response): Promise<void> {
    try {
      const { businessType } = req.params;

      const services = BusinessService.getServiceDefinitions(
        businessType as PlayerBusinessType
      );

      res.json({ businessType, services });
    } catch (error) {
      logger.error('Failed to get service definitions:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get service definitions',
      });
    }
  }

  /**
   * GET /api/businesses/products/:businessType
   * Get product definitions for a business type
   */
  static async getProductDefinitions(req: Request, res: Response): Promise<void> {
    try {
      const { businessType } = req.params;

      const products = BusinessService.getProductDefinitions(
        businessType as PlayerBusinessType
      );

      res.json({ businessType, products });
    } catch (error) {
      logger.error('Failed to get product definitions:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get product definitions',
      });
    }
  }
}
