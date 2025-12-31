/**
 * Gang Business Service
 *
 * Phase 15: Gang Businesses
 *
 * Handles gang-owned business operations:
 * - Permission validation for business actions
 * - Purchasing businesses for the gang
 * - Transferring player businesses to gang ownership
 * - Gang business summaries and management
 */

import mongoose, { ClientSession } from 'mongoose';
import { Business, IBusiness } from '../models/Business.model';
import { Gang, IGang } from '../models/Gang.model';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';
import { GangEconomy, IGangEconomy } from '../models/GangEconomy.model';
import { Property } from '../models/Property.model';
import { BusinessService } from './business.service';
import { DollarService } from './dollar.service';
import {
  GangBusinessAction,
  PlayerBusinessType,
  PlayerBusinessStatus,
  IGangBusinessSummary,
  IGangBusinessListItem,
  IBusinessTransferRequest,
  IGangBusinessPurchaseRequest,
  IGangBusinessBonuses,
  GangBusinessEventType,
  IGangBusinessNotification,
  GANG_BUSINESS_CONSTANTS,
  GANG_BUSINESS_REQUIREMENTS,
  GANG_BUSINESS_PERMISSIONS,
  GangBankAccountType,
} from '@desperados/shared';
import logger from '../utils/logger';

export class GangBusinessService {
  /**
   * Validate that a character has permission for a gang business action
   */
  static async validatePermission(
    gangId: mongoose.Types.ObjectId | string,
    characterId: mongoose.Types.ObjectId | string,
    action: GangBusinessAction
  ): Promise<{ allowed: boolean; reason?: string }> {
    const gang = await Gang.findById(gangId);
    if (!gang) {
      return { allowed: false, reason: 'Gang not found' };
    }

    const member = gang.members.find(
      (m) => m.characterId.toString() === characterId.toString()
    );

    if (!member) {
      return { allowed: false, reason: 'Not a gang member' };
    }

    const allowedRoles = GANG_BUSINESS_PERMISSIONS[action];
    if (!allowedRoles.includes(member.role)) {
      return {
        allowed: false,
        reason: `Requires ${allowedRoles.join(' or ')} role for ${action}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get the maximum number of businesses a gang can own
   */
  static getMaxGangBusinesses(gangLevel: number): number {
    const calculated = gangLevel * GANG_BUSINESS_CONSTANTS.MAX_BUSINESSES_PER_GANG_LEVEL;
    return Math.min(calculated, GANG_BUSINESS_CONSTANTS.MAX_BUSINESSES_TOTAL);
  }

  /**
   * Check if a gang can purchase a specific business type
   */
  static canGangPurchaseBusinessType(
    gangLevel: number,
    businessType: PlayerBusinessType
  ): { canPurchase: boolean; reason?: string } {
    const requirement = GANG_BUSINESS_REQUIREMENTS[businessType];

    if (!requirement) {
      return { canPurchase: false, reason: 'Unknown business type' };
    }

    if (gangLevel < requirement.minGangLevel) {
      return {
        canPurchase: false,
        reason: `Gang must be level ${requirement.minGangLevel} to purchase ${businessType}`,
      };
    }

    return { canPurchase: true };
  }

  /**
   * Purchase a new business for the gang
   */
  static async purchaseBusinessForGang(
    gangId: mongoose.Types.ObjectId | string,
    purchaserId: mongoose.Types.ObjectId | string,
    request: IGangBusinessPurchaseRequest
  ): Promise<IBusiness> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const purchaserObjectId = new mongoose.Types.ObjectId(purchaserId);

    // Validate permissions (Leader only)
    const permission = await this.validatePermission(
      gangObjectId,
      purchaserObjectId,
      GangBusinessAction.PURCHASE
    );
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Not authorized to purchase businesses');
    }

    const gang = await Gang.findById(gangObjectId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const businessType = request.businessType as PlayerBusinessType;

    // Check gang level requirements
    const typeCheck = this.canGangPurchaseBusinessType(gang.level, businessType);
    if (!typeCheck.canPurchase) {
      throw new Error(typeCheck.reason);
    }

    // Check business count limit
    const currentCount = await Business.countGangBusinesses(gangObjectId);
    const maxAllowed = this.getMaxGangBusinesses(gang.level);
    if (currentCount >= maxAllowed) {
      throw new Error(`Gang has reached maximum business limit (${maxAllowed})`);
    }

    // Check gang treasury
    const economy = await GangEconomy.findOne({ gangId: gangObjectId });
    if (!economy) {
      throw new Error('Gang economy not found');
    }

    const requirement = GANG_BUSINESS_REQUIREMENTS[businessType];
    const cost = requirement.establishmentCost;

    if (!economy.canAfford(GangBankAccountType.OPERATING_FUND, cost)) {
      throw new Error(
        `Insufficient gang funds. Need $${cost}`
      );
    }

    // Verify property exists and can have a business
    const property = await Property.findById(request.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Check if property already has a business
    const existingBusiness = await Business.findByProperty(request.propertyId);
    if (existingBusiness) {
      throw new Error('Property already has a business');
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct from gang treasury (use instance method)
      economy.deductFromAccount(GangBankAccountType.OPERATING_FUND, cost);
      await economy.save({ session });

      // Create business - BusinessService handles its own transaction internally
      // So we need to create the business directly here
      const businessName = request.customName || `${gang.name}'s ${businessType}`;

      const business = new Business({
        propertyId: new mongoose.Types.ObjectId(request.propertyId),
        characterId: purchaserObjectId, // Original creator for audit
        locationId: property.locationId,
        businessType,
        businessName,
        tier: property.tier || 1,
        status: PlayerBusinessStatus.ACTIVE,
        baseTrafficRate: 10, // Base rate
        maxPendingRevenue: 10000, // Default cap
        // Phase 15: Gang ownership fields
        ownerType: 'gang',
        gangId: gangObjectId,
        gangRole: 'operated',
        transferredAt: new Date(),
        revenueSharePercent: 100,
      });

      await business.save({ session });

      await session.commitTransaction();

      // Notify gang members
      await this.notifyGangBusinessEvent(gangObjectId, GangBusinessEventType.BUSINESS_PURCHASED, {
        businessName: business.businessName,
        businessType,
        characterId: purchaserId.toString(),
      });

      logger.info(
        `[GangBusiness] Gang ${gang.name} purchased ${business.businessName} for $${cost}`
      );

      return business;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer an existing player business to the gang
   */
  static async transferBusinessToGang(
    request: IBusinessTransferRequest,
    ownerId: mongoose.Types.ObjectId | string
  ): Promise<IBusiness> {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const gangObjectId = new mongoose.Types.ObjectId(request.gangId);
    const businessObjectId = new mongoose.Types.ObjectId(request.businessId);

    const business = await Business.findById(businessObjectId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Validate owner is transferring their own business
    if (business.characterId.toString() !== ownerObjectId.toString()) {
      throw new Error('Only the owner can transfer this business');
    }

    // Validate transferability
    if (!business.canBeTransferredToGang()) {
      throw new Error('Business cannot be transferred in current state');
    }

    // Validate character is a gang member
    const gang = await Gang.findById(gangObjectId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const isMember = gang.members.some(
      (m) => m.characterId.toString() === ownerObjectId.toString()
    );
    if (!isMember) {
      throw new Error('You must be a gang member to transfer business to gang');
    }

    // Check gang business limit
    const currentCount = await Business.countGangBusinesses(gangObjectId);
    const maxAllowed = this.getMaxGangBusinesses(gang.level);
    if (currentCount >= maxAllowed) {
      throw new Error(`Gang has reached maximum business limit (${maxAllowed})`);
    }

    // Determine revenue share
    const revenueSharePercent = request.revenueSharePercent ?? 100;
    if (revenueSharePercent < GANG_BUSINESS_CONSTANTS.MIN_REVENUE_SHARE_PERCENT) {
      throw new Error(
        `Minimum gang revenue share is ${GANG_BUSINESS_CONSTANTS.MIN_REVENUE_SHARE_PERCENT}%`
      );
    }

    // Update ownership
    business.ownerType = 'gang';
    business.gangId = gangObjectId;
    business.gangRole = revenueSharePercent < 100 ? 'subsidiary' : 'operated';
    business.managerId = ownerObjectId; // Original owner becomes manager
    business.transferredFrom = business.characterId;
    business.transferredAt = new Date();
    business.revenueSharePercent = revenueSharePercent;

    await business.save();

    // Notify gang
    await this.notifyGangBusinessEvent(gangObjectId, GangBusinessEventType.BUSINESS_TRANSFERRED, {
      businessName: business.businessName,
      characterId: ownerId.toString(),
      revenueSharePercent,
    });

    logger.info(
      `[GangBusiness] Business ${business.businessName} transferred to gang ${gang.name} ` +
        `(${revenueSharePercent}% to gang)`
    );

    return business;
  }

  /**
   * Set or change the manager of a gang business
   */
  static async setBusinessManager(
    gangId: mongoose.Types.ObjectId | string,
    businessId: mongoose.Types.ObjectId | string,
    newManagerId: mongoose.Types.ObjectId | string | null,
    requesterId: mongoose.Types.ObjectId | string
  ): Promise<IBusiness> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    // Validate permissions
    const permission = await this.validatePermission(
      gangObjectId,
      requesterObjectId,
      GangBusinessAction.SET_MANAGER
    );
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Not authorized to set manager');
    }

    const business = await Business.findById(businessObjectId);
    if (!business) {
      throw new Error('Business not found');
    }

    if (!business.gangId?.equals(gangObjectId)) {
      throw new Error('Business does not belong to this gang');
    }

    if (newManagerId) {
      const newManagerObjectId = new mongoose.Types.ObjectId(newManagerId);

      // Verify new manager is a gang member
      const gang = await Gang.findById(gangObjectId);
      const isMember = gang?.members.some(
        (m) => m.characterId.toString() === newManagerObjectId.toString()
      );
      if (!isMember) {
        throw new Error('New manager must be a gang member');
      }

      business.managerId = newManagerObjectId;
    } else {
      business.managerId = undefined;
    }

    await business.save();

    logger.info(
      `[GangBusiness] Manager for ${business.businessName} set to ${newManagerId || 'none'}`
    );

    return business;
  }

  /**
   * Update revenue share percentage for a subsidiary business
   */
  static async updateRevenueShare(
    gangId: mongoose.Types.ObjectId | string,
    businessId: mongoose.Types.ObjectId | string,
    newSharePercent: number,
    requesterId: mongoose.Types.ObjectId | string
  ): Promise<IBusiness> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    // Validate permissions (Leader only)
    const permission = await this.validatePermission(
      gangObjectId,
      requesterObjectId,
      GangBusinessAction.TRANSFER // Requires leader
    );
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Not authorized to update revenue share');
    }

    if (newSharePercent < GANG_BUSINESS_CONSTANTS.MIN_REVENUE_SHARE_PERCENT) {
      throw new Error(
        `Minimum gang revenue share is ${GANG_BUSINESS_CONSTANTS.MIN_REVENUE_SHARE_PERCENT}%`
      );
    }

    if (newSharePercent > 100) {
      throw new Error('Maximum revenue share is 100%');
    }

    const business = await Business.findById(businessObjectId);
    if (!business) {
      throw new Error('Business not found');
    }

    if (!business.gangId?.equals(gangObjectId)) {
      throw new Error('Business does not belong to this gang');
    }

    business.revenueSharePercent = newSharePercent;
    business.gangRole = newSharePercent < 100 ? 'subsidiary' : 'operated';

    await business.save();

    return business;
  }

  /**
   * Get all businesses owned by a gang with summary
   */
  static async getGangBusinesses(
    gangId: mongoose.Types.ObjectId | string
  ): Promise<IGangBusinessSummary> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const businesses = await Business.findByGang(gangObjectId);

    const summary: IGangBusinessSummary = {
      total: businesses.length,
      byType: {},
      byZone: {},
      totalPendingRevenue: 0,
      weeklyRevenue: 0,
      businesses: [],
    };

    for (const biz of businesses) {
      // Count by type
      summary.byType[biz.businessType] = (summary.byType[biz.businessType] || 0) + 1;

      // Count by zone
      summary.byZone[biz.locationId] = (summary.byZone[biz.locationId] || 0) + 1;

      // Sum pending revenue
      summary.totalPendingRevenue += biz.pendingRevenue;

      // Sum weekly revenue
      summary.weeklyRevenue += biz.trafficStats.weeklyRevenue;

      // Build list item
      const listItem: IGangBusinessListItem = {
        id: biz._id.toString(),
        name: biz.businessName,
        type: biz.businessType,
        location: biz.locationId,
        status: biz.status,
        pendingRevenue: biz.pendingRevenue,
        reputation: biz.reputation.overall,
        managerId: biz.managerId?.toString(),
        gangRole: biz.gangRole || 'operated',
        revenueSharePercent: biz.revenueSharePercent ?? 100,
      };

      summary.businesses.push(listItem);
    }

    return summary;
  }

  /**
   * Get businesses protected by a gang
   */
  static async getProtectedBusinesses(
    gangId: mongoose.Types.ObjectId | string
  ): Promise<IBusiness[]> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    return Business.findProtectedBusinesses(gangObjectId);
  }

  /**
   * Sell a gang-owned business
   */
  static async sellGangBusiness(
    gangId: mongoose.Types.ObjectId | string,
    businessId: mongoose.Types.ObjectId | string,
    sellerId: mongoose.Types.ObjectId | string
  ): Promise<{ salePrice: number }> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Validate permissions (Leader only)
    const permission = await this.validatePermission(
      gangObjectId,
      sellerObjectId,
      GangBusinessAction.SELL
    );
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Not authorized to sell businesses');
    }

    const business = await Business.findById(businessObjectId);
    if (!business) {
      throw new Error('Business not found');
    }

    if (!business.gangId?.equals(gangObjectId)) {
      throw new Error('Business does not belong to this gang');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate sale price (50% of establishment cost + 25% of total revenue)
      const requirement = GANG_BUSINESS_REQUIREMENTS[business.businessType as PlayerBusinessType];
      const baseSalePrice = Math.floor(requirement.establishmentCost * 0.5);
      const revenueBonus = Math.floor(business.totalRevenue * 0.25);
      const salePrice = baseSalePrice + revenueBonus;

      // Get economy and add funds
      const economy = await GangEconomy.findOne({ gangId: gangObjectId }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // Collect any pending revenue first
      if (business.pendingRevenue > 0) {
        economy.addToAccount(GangBankAccountType.OPERATING_FUND, business.pendingRevenue);
        business.pendingRevenue = 0;
      }

      // Add sale proceeds to treasury
      economy.addToAccount(GangBankAccountType.OPERATING_FUND, salePrice);
      await economy.save({ session });

      // Mark business as closed
      business.status = PlayerBusinessStatus.CLOSED;
      await business.save({ session });

      await session.commitTransaction();

      // Notify gang
      await this.notifyGangBusinessEvent(gangObjectId, GangBusinessEventType.BUSINESS_SOLD, {
        businessName: business.businessName,
        salePrice,
        characterId: sellerId.toString(),
      });

      logger.info(
        `[GangBusiness] Gang business ${business.businessName} sold for $${salePrice}`
      );

      return { salePrice };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Calculate territory bonuses for a gang-owned business
   */
  static async calculateGangBusinessBonuses(
    businessId: mongoose.Types.ObjectId | string,
    gangId: mongoose.Types.ObjectId | string
  ): Promise<IGangBusinessBonuses> {
    const business = await Business.findById(businessId);
    if (!business) {
      return {
        baseBonus: 1.0,
        gangOwnershipBonus: 0,
        highInfluenceBonus: 0,
        totalMultiplier: 1.0,
        isInGangTerritory: false,
        zoneInfluence: 0,
      };
    }

    // Import TerritoryBonusService dynamically to avoid circular dependency
    const { TerritoryBonusService } = await import('./territoryBonus.service');

    const zoneId = business.locationId;
    const gangObjectId = new mongoose.Types.ObjectId(gangId);

    // Get gang's influence in this zone
    const zoneInfluence = await TerritoryBonusService.getGangZoneInfluence(
      gangObjectId,
      zoneId
    );

    let baseBonus = 1.0;
    let gangOwnershipBonus = 0;
    let highInfluenceBonus = 0;

    // Check if gang has significant control
    const isInGangTerritory = zoneInfluence >= 50; // Gang needs 50%+ to be "controlling"

    if (isInGangTerritory) {
      // Gang owns business in their own territory
      gangOwnershipBonus = GANG_BUSINESS_CONSTANTS.OWN_TERRITORY_BONUS;

      // High influence bonus
      if (zoneInfluence >= GANG_BUSINESS_CONSTANTS.HIGH_INFLUENCE_THRESHOLD) {
        highInfluenceBonus = GANG_BUSINESS_CONSTANTS.HIGH_INFLUENCE_BONUS;
      }
    }

    const totalMultiplier = Math.min(
      baseBonus + gangOwnershipBonus + highInfluenceBonus,
      GANG_BUSINESS_CONSTANTS.MAX_BONUS
    );

    return {
      baseBonus,
      gangOwnershipBonus,
      highInfluenceBonus,
      totalMultiplier,
      isInGangTerritory,
      zoneInfluence,
    };
  }

  /**
   * Send notification about gang business events
   */
  static async notifyGangBusinessEvent(
    gangId: mongoose.Types.ObjectId,
    eventType: GangBusinessEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      const gang = await Gang.findById(gangId);
      if (!gang) return;

      const notification: IGangBusinessNotification = {
        eventType,
        gangId: gangId.toString(),
        businessId: data.businessId as string | undefined,
        businessName: data.businessName as string | undefined,
        characterId: data.characterId as string | undefined,
        amount: data.amount as number | undefined,
        timestamp: new Date(),
      };

      // Log the event
      logger.info(`[GangBusiness] Event: ${eventType}`, notification);

      // Notify gang officers about business events
      const gangWithMembers = gang as IGang;
      const officerIds = gangWithMembers.members
        ?.filter(m => m.role === 'leader' || m.role === 'officer')
        .map(m => m.characterId) || [];

      const eventDescriptions: Record<GangBusinessEventType, string> = {
        [GangBusinessEventType.BUSINESS_PURCHASED]: `Gang purchased ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.BUSINESS_TRANSFERRED]: `${notification.businessName || 'Business'} transferred to gang`,
        [GangBusinessEventType.BUSINESS_SOLD]: `Gang sold ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.REVENUE_COLLECTED]: `Collected ${notification.amount || 0} from businesses`,
        [GangBusinessEventType.MANAGER_ASSIGNED]: `Manager assigned to ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_OFFERED]: `Protection offered for ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_ACCEPTED]: `Protection accepted for ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_REFUSED]: `Protection refused for ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_SUSPENDED]: `Protection suspended for ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_TERMINATED]: `Protection terminated for ${notification.businessName || 'a business'}`,
        [GangBusinessEventType.PROTECTION_PAYMENT_RECEIVED]: `Received ${notification.amount || 0} protection payment`,
        [GangBusinessEventType.PROTECTION_PAYMENT_MISSED]: `Missed protection payment for ${notification.businessName || 'a business'}`,
      };

      const message = eventDescriptions[eventType] || `Gang business event: ${eventType}`;

      for (const officerId of officerIds) {
        try {
          await NotificationService.sendNotification(
            officerId.toString(),
            NotificationType.SYSTEM,
            message,
            { link: '/gang/businesses' }
          );
        } catch (notifError) {
          logger.debug(`[GangBusiness] Failed to notify officer ${officerId}:`, notifError);
        }
      }
    } catch (error) {
      logger.error('[GangBusiness] Failed to send notification:', error);
    }
  }
}
