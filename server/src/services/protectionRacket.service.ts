/**
 * Protection Racket Service
 *
 * Phase 15: Gang Businesses
 *
 * Handles protection agreements between gangs and individual player businesses:
 * - Offering protection to businesses in gang territory
 * - Accepting/refusing protection offers
 * - Processing weekly payments
 * - Applying/removing protection benefits
 */

import mongoose, { ClientSession } from 'mongoose';
import { ProtectionContract, IProtectionContract } from '../models/ProtectionContract.model';
import { Business, IBusiness } from '../models/Business.model';
import { Gang } from '../models/Gang.model';
import { GangEconomy } from '../models/GangEconomy.model';
import { Character } from '../models/Character.model';
import { TerritoryZone } from '../models/TerritoryZone.model';
import { DollarService, TransactionSource } from './dollar.service';
import { GangBusinessService } from './gangBusiness.service';
import logger from '../utils/logger';
import {
  ProtectionStatus,
  ProtectionTier,
  IProtectionOfferRequest,
  IProtectionOfferResponse,
  IProtectionPaymentResult,
  GangBusinessEventType,
  GangBankAccountType,
  PROTECTION_TIERS,
  PROTECTION_CONSTANTS,
  GANG_BUSINESS_PERMISSIONS,
  GangBusinessAction,
} from '@desperados/shared';

export class ProtectionRacketService {
  /**
   * Offer protection to a business in gang territory
   */
  static async offerProtection(
    gangId: mongoose.Types.ObjectId | string,
    businessId: mongoose.Types.ObjectId | string,
    tier: ProtectionTier,
    offeredById: mongoose.Types.ObjectId | string
  ): Promise<IProtectionContract> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const offererObjectId = new mongoose.Types.ObjectId(offeredById);

    // Validate offerer has permission
    const permission = await GangBusinessService.validatePermission(
      gangObjectId,
      offererObjectId,
      GangBusinessAction.COLLECT // Officers can offer protection
    );
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Not authorized to offer protection');
    }

    // Get business
    const business = await Business.findById(businessObjectId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Cannot offer protection to gang-owned businesses
    if (business.isGangOwned()) {
      throw new Error('Cannot offer protection to gang-owned businesses');
    }

    // Check if business already has protection
    const existingContract = await ProtectionContract.findActiveByBusiness(businessObjectId);
    if (existingContract) {
      throw new Error('Business already has a protection arrangement');
    }

    // Validate gang controls the territory
    const gang = await Gang.findById(gangObjectId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    // Check if gang has influence in the zone
    const zone = await TerritoryZone.findOne({ id: business.locationId });
    if (zone) {
      const gangInfluence = zone.influence.find(
        (inf) => inf.gangId.equals(gangObjectId)
      );
      if (!gangInfluence || gangInfluence.influence < 30) {
        throw new Error('Gang must have at least 30% influence in the zone to offer protection');
      }
    }

    // Get business owner info
    const businessOwner = await Character.findById(business.characterId);
    if (!businessOwner) {
      throw new Error('Business owner not found');
    }

    // Get tier config
    const tierConfig = PROTECTION_TIERS[tier];
    if (!tierConfig) {
      throw new Error('Invalid protection tier');
    }

    // Calculate next renewal date (next Sunday at noon)
    const renewsAt = this.getNextPaymentDate();

    // Create contract
    const contract = await ProtectionContract.create({
      businessId: businessObjectId,
      businessName: business.businessName,
      businessOwnerId: business.characterId,
      businessOwnerName: businessOwner.name,
      gangId: gangObjectId,
      gangName: gang.name,
      tier,
      protectionFeePercent: tierConfig.feePercent,
      weeklyMinimum: tierConfig.weeklyMinimum,
      status: ProtectionStatus.OFFERED,
      incidentReduction: tierConfig.incidentReduction,
      raidProtection: tierConfig.raidProtection,
      reputationBoost: tierConfig.reputationBoost,
      startedAt: new Date(),
      renewsAt,
      totalPaid: 0,
      weeksActive: 0,
      missedPayments: 0,
    });

    // Notify business owner
    await GangBusinessService.notifyGangBusinessEvent(
      gangObjectId,
      GangBusinessEventType.PROTECTION_OFFERED,
      {
        businessId: business._id.toString(),
        businessName: business.businessName,
        characterId: business.characterId.toString(),
        tier,
      }
    );

    logger.info(
      `[Protection] Gang ${gang.name} offered ${tier} protection to ${business.businessName}`
    );

    return contract;
  }

  /**
   * Business owner responds to protection offer
   */
  static async respondToOffer(
    contractId: mongoose.Types.ObjectId | string,
    businessOwnerId: mongoose.Types.ObjectId | string,
    accept: boolean
  ): Promise<IProtectionContract> {
    const contractObjectId = new mongoose.Types.ObjectId(contractId);
    const ownerObjectId = new mongoose.Types.ObjectId(businessOwnerId);

    const contract = await ProtectionContract.findById(contractObjectId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Validate ownership
    if (!contract.businessOwnerId.equals(ownerObjectId)) {
      throw new Error('Only the business owner can respond to this offer');
    }

    if (contract.status !== ProtectionStatus.OFFERED) {
      throw new Error('This offer is no longer valid');
    }

    if (accept) {
      contract.status = ProtectionStatus.ACTIVE;
      contract.startedAt = new Date();
      contract.renewsAt = this.getNextPaymentDate();

      // Apply protection benefits to business
      await this.applyProtectionBenefits(contract);

      // Notify gang
      await GangBusinessService.notifyGangBusinessEvent(
        contract.gangId,
        GangBusinessEventType.PROTECTION_ACCEPTED,
        {
          businessId: contract.businessId.toString(),
          businessName: contract.businessName,
          tier: contract.tier,
        }
      );

      logger.info(
        `[Protection] ${contract.businessName} accepted ${contract.tier} protection from ${contract.gangName}`
      );
    } else {
      contract.status = ProtectionStatus.REFUSED;
      contract.terminatedAt = new Date();
      contract.terminatedBy = 'business';

      // Notify gang
      await GangBusinessService.notifyGangBusinessEvent(
        contract.gangId,
        GangBusinessEventType.PROTECTION_REFUSED,
        {
          businessId: contract.businessId.toString(),
          businessName: contract.businessName,
        }
      );

      logger.info(
        `[Protection] ${contract.businessName} refused protection from ${contract.gangName}`
      );
    }

    await contract.save();
    return contract;
  }

  /**
   * Terminate a protection contract
   */
  static async terminateContract(
    contractId: mongoose.Types.ObjectId | string,
    terminatedBy: 'business' | 'gang' | 'war_loss',
    requesterId: mongoose.Types.ObjectId | string
  ): Promise<IProtectionContract> {
    const contractObjectId = new mongoose.Types.ObjectId(contractId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    const contract = await ProtectionContract.findById(contractObjectId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== ProtectionStatus.ACTIVE) {
      throw new Error('Contract is not active');
    }

    // Validate requester can terminate
    if (terminatedBy === 'business') {
      if (!contract.businessOwnerId.equals(requesterObjectId)) {
        throw new Error('Only the business owner can terminate this contract');
      }
    } else if (terminatedBy === 'gang') {
      const permission = await GangBusinessService.validatePermission(
        contract.gangId,
        requesterObjectId,
        GangBusinessAction.TRANSFER // Leader only
      );
      if (!permission.allowed) {
        throw new Error('Only gang leader can terminate protection contracts');
      }
    }

    // Remove protection benefits
    await this.removeProtectionBenefits(contract);

    // Update contract
    contract.status = ProtectionStatus.TERMINATED;
    contract.terminatedAt = new Date();
    contract.terminatedBy = terminatedBy;

    await contract.save();

    // Notify both parties
    await GangBusinessService.notifyGangBusinessEvent(
      contract.gangId,
      GangBusinessEventType.PROTECTION_TERMINATED,
      {
        businessId: contract.businessId.toString(),
        businessName: contract.businessName,
        terminatedBy,
      }
    );

    logger.info(
      `[Protection] Contract terminated for ${contract.businessName} by ${terminatedBy}`
    );

    return contract;
  }

  /**
   * Process weekly protection payments for all active contracts
   * Called by scheduled job every Sunday
   */
  static async processWeeklyPayments(): Promise<IProtectionPaymentResult> {
    const now = new Date();
    const dueContracts = await ProtectionContract.findDueForPayment(now);

    let processed = 0;
    let totalCollected = 0;
    let suspended = 0;
    let failed = 0;

    for (const contract of dueContracts) {
      try {
        const result = await this.processContractPayment(contract);
        processed++;
        totalCollected += result.payment;

        if (result.suspended) {
          suspended++;
        }
      } catch (error) {
        logger.error(`[Protection] Failed to process payment for contract ${contract._id}:`, error);
        failed++;
      }
    }

    logger.info(
      `[Protection] Weekly payments processed: ${processed} contracts, ` +
        `$${totalCollected} collected, ${suspended} suspended, ${failed} failed`
    );

    return {
      processed,
      totalCollected,
      suspended,
      failed,
    };
  }

  /**
   * Process payment for a single contract
   */
  private static async processContractPayment(
    contract: IProtectionContract
  ): Promise<{ payment: number; suspended: boolean }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const business = await Business.findById(contract.businessId).session(session);
      if (!business) {
        throw new Error('Business not found');
      }

      // Calculate payment (% of weekly revenue or minimum)
      const weeklyRevenue = business.trafficStats.weeklyRevenue;
      const percentPayment = Math.floor(weeklyRevenue * (contract.protectionFeePercent / 100));
      const payment = Math.max(percentPayment, contract.weeklyMinimum);

      // Check if owner can pay
      const canPay = await DollarService.canAfford(
        contract.businessOwnerId.toString(),
        payment
      );

      if (canPay && payment > 0) {
        // Collect payment
        await DollarService.deductDollars(
          contract.businessOwnerId.toString(),
          payment,
          'protection_payment' as TransactionSource,
          {
            contractId: contract._id.toString(),
            gangId: contract.gangId.toString(),
            gangName: contract.gangName,
          },
          session
        );

        // Add to gang treasury
        const economy = await GangEconomy.findOne({ gangId: contract.gangId }).session(session);
        if (economy) {
          economy.addToAccount(GangBankAccountType.OPERATING_FUND, payment);
          await economy.save({ session });
        }

        // Update contract
        contract.totalPaid += payment;
        contract.lastPaymentAt = new Date();
        contract.weeksActive++;
        contract.missedPayments = 0;
        contract.renewsAt = this.getNextPaymentDate();

        await contract.save({ session });
        await session.commitTransaction();

        // Notify gang
        await GangBusinessService.notifyGangBusinessEvent(
          contract.gangId,
          GangBusinessEventType.PROTECTION_PAYMENT_RECEIVED,
          {
            businessId: contract.businessId.toString(),
            businessName: contract.businessName,
            amount: payment,
          }
        );

        return { payment, suspended: false };
      } else {
        // Missed payment
        contract.missedPayments++;
        contract.renewsAt = this.getNextPaymentDate();

        let suspended = false;
        if (contract.missedPayments >= PROTECTION_CONSTANTS.MAX_MISSED_PAYMENTS) {
          contract.status = ProtectionStatus.SUSPENDED;
          await this.removeProtectionBenefits(contract);
          suspended = true;

          await GangBusinessService.notifyGangBusinessEvent(
            contract.gangId,
            GangBusinessEventType.PROTECTION_SUSPENDED,
            {
              businessId: contract.businessId.toString(),
              businessName: contract.businessName,
              missedPayments: contract.missedPayments,
            }
          );
        } else {
          await GangBusinessService.notifyGangBusinessEvent(
            contract.gangId,
            GangBusinessEventType.PROTECTION_PAYMENT_MISSED,
            {
              businessId: contract.businessId.toString(),
              businessName: contract.businessName,
              missedPayments: contract.missedPayments,
            }
          );
        }

        await contract.save({ session });
        await session.commitTransaction();

        return { payment: 0, suspended };
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Apply protection benefits to a business
   */
  private static async applyProtectionBenefits(
    contract: IProtectionContract
  ): Promise<void> {
    const business = await Business.findById(contract.businessId);
    if (!business) return;

    business.protection = {
      isProtected: true,
      gangId: contract.gangId,
      tier: contract.tier,
      incidentReduction: contract.incidentReduction,
      reputationBoost: contract.reputationBoost,
    };

    // Apply immediate reputation boost if configured
    if (PROTECTION_CONSTANTS.REPUTATION_BOOST_IMMEDIATE && contract.reputationBoost > 0) {
      business.reputation.overall = Math.min(
        100,
        business.reputation.overall + contract.reputationBoost
      );
    }

    await business.save();

    logger.debug(
      `[Protection] Applied benefits to ${business.businessName}: ` +
        `incident -${contract.incidentReduction * 100}%, ` +
        `raid protection: ${contract.raidProtection}, ` +
        `reputation +${contract.reputationBoost}`
    );
  }

  /**
   * Remove protection benefits from a business
   */
  private static async removeProtectionBenefits(
    contract: IProtectionContract
  ): Promise<void> {
    const business = await Business.findById(contract.businessId);
    if (!business) return;

    business.protection = {
      isProtected: false,
      incidentReduction: 0,
      reputationBoost: 0,
    };

    // Apply reputation penalty when suspended
    if (
      contract.status === ProtectionStatus.SUSPENDED &&
      PROTECTION_CONSTANTS.SUSPENSION_PENALTY_REPUTATION
    ) {
      business.reputation.overall = Math.max(
        0,
        business.reputation.overall + PROTECTION_CONSTANTS.SUSPENSION_PENALTY_REPUTATION
      );
    }

    await business.save();

    logger.debug(`[Protection] Removed benefits from ${business.businessName}`);
  }

  /**
   * Get protection contracts for a gang
   */
  static async getGangProtectionContracts(
    gangId: mongoose.Types.ObjectId | string
  ): Promise<{
    active: IProtectionContract[];
    pending: IProtectionContract[];
    totalWeeklyIncome: number;
    totalLifetimeIncome: number;
  }> {
    const gangObjectId = new mongoose.Types.ObjectId(gangId);

    const active = await ProtectionContract.findActiveByGang(gangObjectId);
    const pending = await ProtectionContract.find({
      gangId: gangObjectId,
      status: ProtectionStatus.OFFERED,
    });

    const totalWeeklyIncome = active.reduce((sum, c) => {
      // Estimate based on minimum payment
      return sum + c.weeklyMinimum;
    }, 0);

    const totalLifetimeIncome = active.reduce((sum, c) => sum + c.totalPaid, 0);

    return {
      active,
      pending,
      totalWeeklyIncome,
      totalLifetimeIncome,
    };
  }

  /**
   * Get protection status for a business
   */
  static async getBusinessProtectionStatus(
    businessId: mongoose.Types.ObjectId | string
  ): Promise<IProtectionContract | null> {
    return ProtectionContract.findActiveByBusiness(
      new mongoose.Types.ObjectId(businessId)
    );
  }

  /**
   * Get the next Sunday at noon UTC for payment scheduling
   */
  private static getNextPaymentDate(): Date {
    const now = new Date();
    const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
    nextSunday.setUTCHours(PROTECTION_CONSTANTS.PAYMENT_HOUR, 0, 0, 0);
    return nextSunday;
  }
}
