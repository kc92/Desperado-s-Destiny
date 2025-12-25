/**
 * Business Service
 *
 * Phase 12: Business Ownership System
 *
 * Handles business CRUD operations, establishment, and management:
 * - Establishing businesses on properties
 * - Managing services and products
 * - Staff assignment
 * - Price management
 * - Business activation/suspension
 */

import mongoose, { ClientSession } from 'mongoose';
import { Business, IBusiness } from '../models/Business.model';
import { Property, IProperty } from '../models/Property.model';
import { Character } from '../models/Character.model';
import { BusinessServiceRecord } from '../models/BusinessServiceRecord.model';
import { DollarService, TransactionSource } from './dollar.service';
import logger from '../utils/logger';
import {
  PlayerBusinessType,
  PlayerBusinessStatus,
  PlayerBusinessCategory,
  IBusinessService,
  IBusinessProduct,
  IStaffAssignment,
  BusinessTier,
  PROPERTY_BUSINESS_MAPPING,
  BUSINESS_TYPE_INFO,
  BUSINESS_TIER_INFO,
  BUSINESS_REVENUE_TARGETS,
} from '@desperados/shared';
import {
  ESTABLISHMENT_REQUIREMENTS,
  SERVICE_DEFINITIONS,
  PRODUCT_DEFINITIONS,
  BUSINESS_ECONOMY_CONSTANTS,
  getServicesForBusinessType,
  getProductsForBusinessType,
} from '@desperados/shared';
import { PropertyType } from '@desperados/shared';
import {
  GangBusinessAction,
  GangBankAccountType,
  IRevenueCollectionResult,
  GANG_BUSINESS_PERMISSIONS,
} from '@desperados/shared';
import { Gang } from '../models/Gang.model';
import { GangEconomy } from '../models/GangEconomy.model';

/**
 * Result of establishing a business
 */
export interface EstablishBusinessResult {
  success: boolean;
  business?: IBusiness;
  error?: string;
  establishmentCost?: number;
}

/**
 * Result of collecting revenue
 */
export interface CollectRevenueResult {
  success: boolean;
  collectedAmount: number;
  newPendingRevenue: number;
  error?: string;
}

export class BusinessService {
  /**
   * Establish a new business on a property
   */
  static async establishBusiness(
    characterId: string,
    propertyId: string,
    businessType: PlayerBusinessType,
    businessName: string,
    description?: string
  ): Promise<EstablishBusinessResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Validate character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Validate property ownership
      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }
      if (!property.ownerId || property.ownerId.toString() !== characterId) {
        throw new Error('You do not own this property');
      }

      // Check if property already has a business
      const existingBusiness = await Business.findByProperty(propertyId);
      if (existingBusiness) {
        throw new Error('This property already has a business');
      }

      // Validate business type can be established on this property type
      const allowedTypes = PROPERTY_BUSINESS_MAPPING[property.propertyType as PropertyType];
      if (!allowedTypes || !allowedTypes.includes(businessType)) {
        throw new Error(
          `Cannot establish ${businessType} on a ${property.propertyType} property. ` +
          `Allowed types: ${allowedTypes?.join(', ') || 'none'}`
        );
      }

      // Check establishment requirements
      const requirements = ESTABLISHMENT_REQUIREMENTS[businessType];
      if (!requirements) {
        throw new Error(`Unknown business type: ${businessType}`);
      }

      // Check level requirement
      if (character.level < requirements.minCharacterLevel) {
        throw new Error(
          `Level ${requirements.minCharacterLevel} required to establish this business. ` +
          `Your level: ${character.level}`
        );
      }

      // Check property tier requirement
      if (property.tier < requirements.minPropertyTier) {
        throw new Error(
          `Property tier ${requirements.minPropertyTier} required. ` +
          `Current tier: ${property.tier}`
        );
      }

      // Check reputation requirement if any
      if (requirements.minReputation) {
        // Calculate overall reputation as max of all faction reputations
        const rep = character.reputation || {};
        const overallReputation = Math.max(
          rep.outlaws ?? 0,
          rep.coalition ?? 0,
          rep.settlers ?? 0
        );
        if (overallReputation < requirements.minReputation) {
          throw new Error(
            `Reputation ${requirements.minReputation} required. ` +
            `Your highest reputation: ${overallReputation}`
          );
        }
      }

      // Calculate establishment cost
      const typeInfo = BUSINESS_TYPE_INFO[businessType];
      const establishmentCost = requirements.goldCost +
        Math.floor(property.purchasePrice * typeInfo.establishmentCostMultiplier);

      // Check if character can afford
      const dollars = character.dollars ?? character.gold ?? 0;
      if (dollars < establishmentCost) {
        throw new Error(
          `Insufficient funds. Establishment cost: $${establishmentCost.toLocaleString()}. ` +
          `Your balance: $${dollars.toLocaleString()}`
        );
      }

      // Deduct establishment cost
      await DollarService.deductDollars(
        characterId,
        establishmentCost,
        TransactionSource.BUSINESS_ESTABLISHMENT,
        { businessType, propertyId },
        session
      );

      // Get default services for this business type
      const serviceDefinitions = getServicesForBusinessType(businessType);
      const services: IBusinessService[] = serviceDefinitions.map(def => ({
        serviceId: def.serviceId,
        name: def.name,
        category: def.category,
        basePrice: def.basePrice,
        currentPrice: def.basePrice, // Start at base price
        duration: def.baseDuration,
        isActive: true,
        requiredWorkerSpecialization: def.requiredWorkerSpecialization,
        totalServiced: 0,
      }));

      // Get default products for production businesses
      const productDefinitions = getProductsForBusinessType(businessType);
      const products: IBusinessProduct[] = productDefinitions.map(def => ({
        productId: def.productId,
        itemId: def.productId, // Use productId as itemId for now
        name: def.name,
        currentPrice: def.basePrice,
        stockLevel: 0,
        maxStock: 100,
        autoSellEnabled: false,
        autoRestockEnabled: false,
        restockThreshold: 10,
        totalSold: 0,
      }));

      // Get tier info
      const tierInfo = BUSINESS_TIER_INFO[property.tier as BusinessTier];
      const revenueTargets = BUSINESS_REVENUE_TARGETS[property.tier as BusinessTier];

      // Create the business
      const business = new Business({
        propertyId: property._id,
        characterId: character._id,
        locationId: property.locationId,
        businessType,
        businessName,
        description,
        tier: property.tier,
        status: PlayerBusinessStatus.ACTIVE,
        establishedAt: new Date(),
        lastActiveAt: new Date(),
        services,
        products,
        staffAssignments: [],
        maxStaff: tierInfo.maxStaff,
        reputation: {
          overall: 50,
          serviceQuality: 50,
          priceValue: 50,
          availability: 50,
          cleanliness: 50,
          lastUpdated: new Date(),
        },
        operatingHours: {
          mode: 'always_open',
        },
        baseTrafficRate: typeInfo.baseTrafficRate,
        currentTrafficRate: typeInfo.baseTrafficRate * tierInfo.trafficMultiplier,
        pendingRevenue: 0,
        lastRevenueCollection: new Date(),
        maxPendingRevenue: revenueTargets.maxPending,
        totalCustomersServed: 0,
        totalRevenue: 0,
        totalExpenses: establishmentCost,
        trafficStats: {
          todayVisitors: 0,
          todayRevenue: 0,
          weeklyVisitors: 0,
          weeklyRevenue: 0,
          monthlyVisitors: 0,
          monthlyRevenue: 0,
          peakHour: 18,
          averageSatisfaction: 50,
        },
        allowPlayerCustomers: true,
        playerServicePremium: 0,
      });

      await business.save({ session });
      await session.commitTransaction();

      logger.info(
        `Business established: ${businessName} (${businessType}) on property ${propertyId} ` +
        `by character ${characterId} for $${establishmentCost}`
      );

      return {
        success: true,
        business,
        establishmentCost,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to establish business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all businesses owned by a character
   */
  static async getBusinessesByOwner(characterId: string): Promise<IBusiness[]> {
    return Business.findByOwner(characterId);
  }

  /**
   * Get business by ID
   */
  static async getBusinessById(businessId: string): Promise<IBusiness | null> {
    return Business.findById(businessId);
  }

  /**
   * Get business for a property
   */
  static async getBusinessByProperty(propertyId: string): Promise<IBusiness | null> {
    return Business.findByProperty(propertyId);
  }

  /**
   * Get all businesses at a location
   */
  static async getBusinessesByLocation(locationId: string): Promise<IBusiness[]> {
    return Business.findByLocation(locationId);
  }

  /**
   * Update service price
   */
  static async updateServicePrice(
    characterId: string,
    businessId: string,
    serviceId: string,
    newPrice: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      const service = business.services.find(s => s.serviceId === serviceId);
      if (!service) {
        return { success: false, error: 'Service not found' };
      }

      if (newPrice < 0) {
        return { success: false, error: 'Price cannot be negative' };
      }

      // Apply price change
      service.currentPrice = newPrice;
      await business.save();

      // Update reputation based on price value
      const priceRatio = newPrice / service.basePrice;
      let priceValue = 50;
      if (priceRatio < 0.8) {
        priceValue = 80; // Cheap = good value
      } else if (priceRatio > 1.3) {
        priceValue = 20; // Expensive = poor value
      } else if (priceRatio <= 1.1) {
        priceValue = 60; // Fair = decent value
      }

      business.updateReputation(
        business.reputation.serviceQuality,
        priceValue,
        business.reputation.availability
      );
      await business.save();

      logger.info(
        `Service price updated: ${serviceId} to $${newPrice} in business ${businessId}`
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to update service price:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Toggle service active state
   */
  static async toggleService(
    characterId: string,
    businessId: string,
    serviceId: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      business.toggleService(serviceId, isActive);
      await business.save();

      logger.info(
        `Service ${serviceId} ${isActive ? 'enabled' : 'disabled'} in business ${businessId}`
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to toggle service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Assign staff to business
   */
  static async assignStaff(
    characterId: string,
    businessId: string,
    workerId: string,
    workerName: string,
    specialization: string,
    role: 'service' | 'production' | 'sales' | 'management',
    serviceId?: string,
    productId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      // Check staff capacity
      if (business.staffAssignments.length >= business.maxStaff) {
        return { success: false, error: 'Maximum staff capacity reached' };
      }

      const assignment: IStaffAssignment = {
        workerId,
        workerName,
        specialization: specialization as any,
        role,
        serviceId,
        productId,
        efficiency: 1.0,
        assignedAt: new Date(),
      };

      business.assignStaff(assignment);

      // If assigned to a service, link them
      if (serviceId) {
        const service = business.services.find(s => s.serviceId === serviceId);
        if (service) {
          service.assignedWorkerId = workerId;
        }
      }

      await business.save();

      logger.info(
        `Staff ${workerName} (${workerId}) assigned to business ${businessId} as ${role}`
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to assign staff:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove staff from business
   */
  static async removeStaff(
    characterId: string,
    businessId: string,
    workerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      business.removeStaff(workerId);
      await business.save();

      logger.info(`Staff ${workerId} removed from business ${businessId}`);

      return { success: true };
    } catch (error) {
      logger.error('Failed to remove staff:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Collect pending revenue from business
   * Phase 15: Now supports gang-owned businesses with revenue routing
   */
  static async collectRevenue(
    characterId: string,
    businessId: string
  ): Promise<CollectRevenueResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const business = await Business.findById(businessId).session(session);
      if (!business) {
        throw new Error('Business not found');
      }

      if (business.pendingRevenue < BUSINESS_ECONOMY_CONSTANTS.MIN_COLLECTION_AMOUNT) {
        throw new Error(
          `Minimum collection amount is $${BUSINESS_ECONOMY_CONSTANTS.MIN_COLLECTION_AMOUNT}`
        );
      }

      // Phase 15: Handle gang-owned business collection
      if (business.isGangOwned()) {
        return await this.collectGangBusinessRevenue(business, characterId, session);
      }

      // Individual-owned business: original logic
      if (business.characterId.toString() !== characterId) {
        throw new Error('You do not own this business');
      }

      const collectedAmount = business.collectRevenue();

      // Add to character's balance
      await DollarService.addDollars(
        characterId,
        collectedAmount,
        TransactionSource.BUSINESS_REVENUE,
        { businessId, businessName: business.businessName },
        session
      );

      await business.save({ session });
      await session.commitTransaction();

      logger.info(
        `Revenue collected: $${collectedAmount} from business ${businessId} by ${characterId}`
      );

      return {
        success: true,
        collectedAmount,
        newPendingRevenue: business.pendingRevenue,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to collect revenue:', error);
      return {
        success: false,
        collectedAmount: 0,
        newPendingRevenue: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Phase 15: Collect revenue from gang-owned business
   * Routes revenue to gang treasury with optional manager split
   */
  private static async collectGangBusinessRevenue(
    business: IBusiness,
    collectorId: string,
    session: mongoose.ClientSession
  ): Promise<CollectRevenueResult> {
    try {
      // Validate collector has permission (Officer+ or manager)
      const gang = await Gang.findById(business.gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const member = gang.members.find(
        (m) => m.characterId.toString() === collectorId
      );
      if (!member) {
        throw new Error('You are not a member of this gang');
      }

      const canCollect =
        member.role === 'officer' ||
        member.role === 'leader' ||
        business.managerId?.toString() === collectorId;

      if (!canCollect) {
        throw new Error('Only officers, leaders, or the assigned manager can collect gang business revenue');
      }

      // Get the revenue share calculation
      const collectedAmount = business.pendingRevenue;
      const { gangShare, managerShare } = business.calculateGangRevenueShare(collectedAmount);

      // Reset pending revenue
      business.pendingRevenue = 0;
      business.lastRevenueCollection = new Date();

      // Route gang share to treasury
      if (gangShare > 0) {
        const economy = await GangEconomy.findOne({ gangId: business.gangId }).session(session);
        if (economy) {
          economy.addToAccount(GangBankAccountType.OPERATING_FUND, gangShare);
          await economy.save({ session });
        }
      }

      // Route manager share to manager's wallet (for subsidiary businesses)
      if (managerShare > 0 && business.managerId) {
        await DollarService.addDollars(
          business.managerId.toString(),
          managerShare,
          TransactionSource.BUSINESS_REVENUE,
          {
            businessId: business._id.toString(),
            businessName: business.businessName,
            gangId: business.gangId?.toString(),
            isManagerShare: true,
          },
          session
        );
      }

      await business.save({ session });
      await session.commitTransaction();

      const destination = managerShare > 0 ? 'split' : 'gang_treasury';
      logger.info(
        `[GangBusiness] Revenue collected: $${collectedAmount} from ${business.businessName} ` +
        `(gang: $${gangShare}, manager: $${managerShare})`
      );

      return {
        success: true,
        collectedAmount,
        newPendingRevenue: business.pendingRevenue,
      };
    } catch (error) {
      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Close/suspend a business
   */
  static async closeBusiness(
    characterId: string,
    businessId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      business.status = PlayerBusinessStatus.CLOSED;
      await business.save();

      logger.info(`Business ${businessId} closed by ${characterId}`);

      return { success: true };
    } catch (error) {
      logger.error('Failed to close business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reopen a closed business
   */
  static async reopenBusiness(
    characterId: string,
    businessId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) {
        return { success: false, error: 'Business not found' };
      }

      if (business.characterId.toString() !== characterId) {
        return { success: false, error: 'You do not own this business' };
      }

      if (business.status !== PlayerBusinessStatus.CLOSED) {
        return { success: false, error: 'Business is not closed' };
      }

      business.status = PlayerBusinessStatus.ACTIVE;
      business.lastActiveAt = new Date();
      await business.save();

      logger.info(`Business ${businessId} reopened by ${characterId}`);

      return { success: true };
    } catch (error) {
      logger.error('Failed to reopen business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get business statistics
   */
  static async getBusinessStatistics(
    businessId: string,
    period: 'day' | 'week' | 'month' | 'all' = 'week'
  ): Promise<{
    totalRevenue: number;
    customersServed: number;
    averageSatisfaction: number;
    topServices: Array<{ serviceId: string; name: string; revenue: number; count: number }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const [revenueData, topServices, avgSatisfaction] = await Promise.all([
      BusinessServiceRecord.getRevenueForPeriod(businessId, startDate, now),
      BusinessServiceRecord.getTopServices(businessId, startDate, now, 5),
      BusinessServiceRecord.getAverageSatisfaction(businessId, startDate, now),
    ]);

    return {
      totalRevenue: revenueData.total,
      customersServed: revenueData.count,
      averageSatisfaction: avgSatisfaction,
      topServices,
    };
  }

  /**
   * Sync business tier with property tier (called when property is upgraded)
   */
  static async syncBusinessWithProperty(propertyId: string): Promise<void> {
    const property = await Property.findById(propertyId);
    if (!property) return;

    const business = await Business.findByProperty(propertyId);
    if (!business) return;

    business.syncWithPropertyTier(property.tier as BusinessTier);
    await business.save();

    logger.info(
      `Business ${business._id} synced with property tier ${property.tier}`
    );
  }

  /**
   * Get available business types for a property
   */
  static getAvailableBusinessTypes(propertyType: PropertyType): PlayerBusinessType[] {
    return PROPERTY_BUSINESS_MAPPING[propertyType] || [];
  }

  /**
   * Get service definitions for a business type
   */
  static getServiceDefinitions(businessType: PlayerBusinessType) {
    return getServicesForBusinessType(businessType);
  }

  /**
   * Get product definitions for a business type
   */
  static getProductDefinitions(businessType: PlayerBusinessType) {
    return getProductsForBusinessType(businessType);
  }
}
