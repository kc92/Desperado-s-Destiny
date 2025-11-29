/**
 * Foreclosure Service
 *
 * Service for property foreclosure, auctions, and bankruptcy management
 */

import mongoose from 'mongoose';
import { PropertyAuction, IPropertyAuction } from '../models/PropertyAuction.model';
import { TaxDelinquency, ITaxDelinquency } from '../models/TaxDelinquency.model';
import { PropertyTax } from '../models/PropertyTax.model';
import { GangBase, IGangBase } from '../models/GangBase.model';
import { GangEconomy } from '../models/GangEconomy.model';
import { Gang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  AuctionStatus,
  DelinquencyStage,
  BankruptcyStatus,
  TaxPaymentStatus,
  TAX_CONSTANTS,
  BaseTier,
  GangBankAccountType,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Foreclosure Service
 */
export class ForeclosureService {
  /**
   * Create auction for a delinquent property
   */
  static async createAuction(delinquencyId: string): Promise<IPropertyAuction> {
    const delinquency = await TaxDelinquency.findById(delinquencyId);

    if (!delinquency) {
      throw new Error('Delinquency not found');
    }

    if (delinquency.auctionScheduled && delinquency.auctionId) {
      const existingAuction = await PropertyAuction.findById(delinquency.auctionId);
      if (existingAuction) {
        return existingAuction;
      }
    }

    // Get property details (for now, gang base)
    let propertyName = 'Unknown Property';
    let propertyValue = 10000;
    let propertyTier = 1;

    if (delinquency.propertyType === 'gang_base') {
      const gangBase = await GangBase.findById(delinquency.propertyId);
      if (gangBase) {
        propertyName = `${gangBase.tierName} in ${gangBase.location.region}`;
        propertyValue = gangBase.tier * 10000;
        propertyTier = gangBase.tier;
      }
    }

    // Create auction
    const auction = await PropertyAuction.createAuction(
      delinquency.propertyId,
      delinquency.propertyType,
      propertyName,
      delinquency.ownerId,
      delinquency.ownerType,
      delinquency.ownerName,
      delinquency._id as mongoose.Types.ObjectId,
      propertyValue,
      propertyTier,
      delinquency.location,
      delinquency.currentDebtAmount
    );

    // Update delinquency
    delinquency.auctionScheduled = true;
    delinquency.auctionId = auction._id as mongoose.Types.ObjectId;
    await delinquency.save();

    logger.info(
      `Created auction ${auction._id} for property ${delinquency.propertyId}: Minimum bid ${auction.minimumBid} gold`
    );

    return auction;
  }

  /**
   * Place a bid on an auction
   */
  static async placeBid(
    auctionId: string,
    bidderId: string,
    bidAmount: number
  ): Promise<IPropertyAuction> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const auction = await PropertyAuction.findById(auctionId).session(session);

      if (!auction) {
        throw new Error('Auction not found');
      }

      // Get bidder (could be gang or character)
      let bidderName = 'Unknown';
      let hasEnoughFunds = false;

      // Try gang first
      const gang = await Gang.findById(bidderId).session(session);
      if (gang) {
        bidderName = gang.name;
        const gangEconomy = await GangEconomy.findOne({ gangId: bidderId }).session(session);
        if (gangEconomy) {
          hasEnoughFunds = gangEconomy.canAfford(GangBankAccountType.WAR_CHEST, bidAmount);
        }
      } else {
        // Try character
        const character = await Character.findById(bidderId).session(session);
        if (character) {
          bidderName = character.name;
          hasEnoughFunds = character.hasGold(bidAmount);
        } else {
          throw new Error('Bidder not found');
        }
      }

      if (!hasEnoughFunds) {
        throw new Error('Insufficient funds to place bid');
      }

      // Place bid
      auction.placeBid(new mongoose.Types.ObjectId(bidderId), bidderName, bidAmount);
      await auction.save({ session });

      await session.commitTransaction();

      logger.info(
        `Bid placed on auction ${auctionId}: ${bidderName} bid ${bidAmount} gold`
      );

      return auction;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error placing bid on auction ${auctionId}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Complete ended auctions
   */
  static async completeEndedAuctions(): Promise<{
    completed: number;
    transferred: number;
    failed: number;
  }> {
    const endedAuctions = await PropertyAuction.findEndedAuctions();

    let completed = 0;
    let transferred = 0;
    let failed = 0;

    for (const auction of endedAuctions) {
      try {
        auction.completeAuction();
        await auction.save();

        if (auction.status === AuctionStatus.COMPLETED && auction.winnerId) {
          // Transfer property to winner
          await this.transferProperty(auction);
          transferred++;

          // Pay proceeds to original owner if any
          if (auction.proceedsToOwner > 0) {
            await this.payProceeds(auction);
          }

          // Resolve delinquency
          await this.resolveDelinquency(auction.delinquencyId.toString(), 'foreclosure');
        } else if (auction.status === AuctionStatus.FAILED) {
          // No bids - property goes to bank
          await this.transferToBank(auction);
          failed++;
        }

        completed++;
        logger.info(`Completed auction ${auction._id}: Status ${auction.status}`);
      } catch (error) {
        logger.error(`Error completing auction ${auction._id}:`, error);
      }
    }

    logger.info(
      `Auction completion: ${completed} completed, ${transferred} transferred, ${failed} failed`
    );

    return { completed, transferred, failed };
  }

  /**
   * Transfer property to auction winner
   */
  private static async transferProperty(auction: IPropertyAuction): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      if (!auction.winnerId || !auction.finalPrice) {
        throw new Error('No winner or final price');
      }

      // Deduct payment from winner
      const gang = await Gang.findById(auction.winnerId).session(session);

      if (gang) {
        // Gang won the auction
        const gangEconomy = await GangEconomy.findOne({ gangId: auction.winnerId }).session(
          session
        );

        if (!gangEconomy) {
          throw new Error('Gang economy not found');
        }

        if (!gangEconomy.canAfford(GangBankAccountType.WAR_CHEST, auction.finalPrice)) {
          throw new Error('Winner cannot afford the bid');
        }

        gangEconomy.deductFromAccount(GangBankAccountType.WAR_CHEST, auction.finalPrice);
        await gangEconomy.save({ session });

        // Transfer property if gang base
        if (auction.propertyType === 'gang_base') {
          const gangBase = await GangBase.findById(auction.propertyId).session(session);

          if (gangBase) {
            // Reset to tier 1 (auction rules)
            gangBase.tier = TAX_CONSTANTS.AUCTION_TIER_RESET as BaseTier;
            gangBase.gangId = new mongoose.Types.ObjectId(auction.winnerId.toString());
            await gangBase.save({ session });

            logger.info(
              `Gang base ${gangBase._id} transferred to gang ${gang.name} (reset to tier 1)`
            );
          }
        }
      } else {
        // Character won the auction
        const character = await Character.findById(auction.winnerId).session(session);

        if (!character) {
          throw new Error('Winner character not found');
        }

        if (!character.hasGold(auction.finalPrice)) {
          throw new Error('Winner cannot afford the bid');
        }

        await character.deductGold(
          auction.finalPrice,
          TransactionSource.SHOP_PURCHASE, // TODO: Add PROPERTY_AUCTION_WIN source
          { auctionId: auction._id.toString(), propertyId: auction.propertyId.toString() }
        );

        // Transfer property ownership
        // TODO: Implement character property ownership
      }

      await session.commitTransaction();

      logger.info(
        `Property ${auction.propertyId} transferred to ${auction.winnerName} for ${auction.finalPrice} gold`
      );
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error transferring property for auction ${auction._id}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Pay auction proceeds to original owner
   */
  private static async payProceeds(auction: IPropertyAuction): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      if (auction.ownerType === 'gang') {
        const gangEconomy = await GangEconomy.findOne({
          gangId: auction.originalOwnerId,
        }).session(session);

        if (gangEconomy) {
          gangEconomy.addToAccount(
            GangBankAccountType.OPERATING_FUND,
            auction.proceedsToOwner
          );
          await gangEconomy.save({ session });

          logger.info(
            `Paid ${auction.proceedsToOwner} gold proceeds to gang ${auction.originalOwnerName}`
          );
        }
      } else {
        const character = await Character.findById(auction.originalOwnerId).session(session);

        if (character) {
          await character.addGold(
            auction.proceedsToOwner,
            TransactionSource.SHOP_SALE, // TODO: Add PROPERTY_AUCTION_PROCEEDS source
            { auctionId: auction._id.toString() }
          );

          logger.info(
            `Paid ${auction.proceedsToOwner} gold proceeds to ${auction.originalOwnerName}`
          );
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error paying proceeds for auction ${auction._id}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer property to bank (failed auction)
   */
  private static async transferToBank(auction: IPropertyAuction): Promise<void> {
    // For now, just mark property as bank-owned
    // TODO: Implement bank ownership system

    if (auction.propertyType === 'gang_base') {
      const gangBase = await GangBase.findById(auction.propertyId);

      if (gangBase) {
        gangBase.isActive = false;
        await gangBase.save();

        logger.info(`Gang base ${gangBase._id} deactivated (transferred to bank)`);
      }
    }

    await this.resolveDelinquency(auction.delinquencyId.toString(), 'foreclosure');
  }

  /**
   * Declare bankruptcy for a property
   */
  static async declareBankruptcy(
    delinquencyId: string,
    declarerId: string
  ): Promise<ITaxDelinquency> {
    const delinquency = await TaxDelinquency.findById(delinquencyId);

    if (!delinquency) {
      throw new Error('Delinquency not found');
    }

    if (delinquency.ownerId.toString() !== declarerId) {
      throw new Error('Not authorized to declare bankruptcy for this property');
    }

    if (!delinquency.canDeclareBankruptcy()) {
      throw new Error('Cannot declare bankruptcy at this time');
    }

    delinquency.declareBankruptcy();
    await delinquency.save();

    // Cancel any scheduled auction
    if (delinquency.auctionId) {
      const auction = await PropertyAuction.findById(delinquency.auctionId);
      if (auction && auction.status !== AuctionStatus.COMPLETED) {
        auction.cancelAuction('Bankruptcy filed');
        await auction.save();
      }
    }

    logger.info(
      `Bankruptcy declared for property ${delinquency.propertyId} by ${delinquency.ownerName}`
    );

    return delinquency;
  }

  /**
   * Resolve bankruptcy (successful or failed)
   */
  static async resolveBankruptcy(
    delinquencyId: string,
    success: boolean,
    paidAmount?: number
  ): Promise<ITaxDelinquency> {
    const delinquency = await TaxDelinquency.findById(delinquencyId);

    if (!delinquency) {
      throw new Error('Delinquency not found');
    }

    if (delinquency.bankruptcyStatus !== BankruptcyStatus.ACTIVE) {
      throw new Error('No active bankruptcy to resolve');
    }

    if (success && paidAmount) {
      // Process payment
      delinquency.processPayment(paidAmount);
    }

    delinquency.resolveBankruptcy(success);
    await delinquency.save();

    if (!success) {
      // Create forced sale auction at 30% value
      await this.createForcedSaleAuction(delinquency);
    }

    logger.info(
      `Bankruptcy ${success ? 'resolved successfully' : 'failed'} for property ${delinquency.propertyId}`
    );

    return delinquency;
  }

  /**
   * Create forced sale auction (bankruptcy failed)
   */
  private static async createForcedSaleAuction(
    delinquency: ITaxDelinquency
  ): Promise<IPropertyAuction> {
    // Get property details
    let propertyName = 'Unknown Property';
    let propertyValue = 10000;
    let propertyTier = 1;

    if (delinquency.propertyType === 'gang_base') {
      const gangBase = await GangBase.findById(delinquency.propertyId);
      if (gangBase) {
        propertyName = `${gangBase.tierName} in ${gangBase.location.region}`;
        propertyValue = gangBase.tier * 10000;
        propertyTier = gangBase.tier;
      }
    }

    // Create auction at 30% value
    const forcedSaleValue = Math.floor(
      propertyValue * TAX_CONSTANTS.BANKRUPTCY_FORCED_SALE_PERCENT
    );

    const auction = await PropertyAuction.createAuction(
      delinquency.propertyId,
      delinquency.propertyType,
      propertyName + ' (Forced Sale)',
      delinquency.ownerId,
      delinquency.ownerType,
      delinquency.ownerName,
      delinquency._id as mongoose.Types.ObjectId,
      forcedSaleValue,
      propertyTier,
      delinquency.location,
      delinquency.currentDebtAmount
    );

    // Update delinquency
    delinquency.auctionId = auction._id as mongoose.Types.ObjectId;
    await delinquency.save();

    logger.info(
      `Created forced sale auction ${auction._id} at 30% value: ${forcedSaleValue} gold`
    );

    return auction;
  }

  /**
   * Resolve delinquency record
   */
  private static async resolveDelinquency(
    delinquencyId: string,
    method: 'payment' | 'bankruptcy' | 'foreclosure' | 'cancelled'
  ): Promise<void> {
    const delinquency = await TaxDelinquency.findById(delinquencyId);

    if (!delinquency) {
      return;
    }

    delinquency.isResolved = true;
    delinquency.resolvedDate = new Date();
    delinquency.resolutionMethod = method;
    await delinquency.save();

    // Update related tax record
    const taxRecord = await PropertyTax.findById(delinquency.taxRecordId);
    if (taxRecord) {
      taxRecord.paymentStatus =
        method === 'foreclosure' ? TaxPaymentStatus.FORECLOSED : TaxPaymentStatus.PAID;
      await taxRecord.save();
    }

    logger.info(`Delinquency ${delinquencyId} resolved via ${method}`);
  }

  /**
   * Process bankruptcy expirations
   */
  static async processBankruptcyExpirations(): Promise<number> {
    const now = new Date();
    const expiredBankruptcies = await TaxDelinquency.find({
      bankruptcyStatus: BankruptcyStatus.ACTIVE,
      bankruptcyEndsDate: { $lte: now },
    });

    let processed = 0;

    for (const delinquency of expiredBankruptcies) {
      try {
        // Check if debt was paid during bankruptcy
        if (delinquency.currentDebtAmount === 0) {
          await this.resolveBankruptcy(delinquency._id.toString(), true);
        } else {
          await this.resolveBankruptcy(delinquency._id.toString(), false);
        }

        processed++;
      } catch (error) {
        logger.error(
          `Error processing bankruptcy expiration for ${delinquency._id}:`,
          error
        );
      }
    }

    logger.info(`Processed ${processed} expired bankruptcies`);

    return processed;
  }

  /**
   * Get active auctions
   */
  static async getActiveAuctions(): Promise<IPropertyAuction[]> {
    return PropertyAuction.findActiveAuctions();
  }

  /**
   * Get auction details
   */
  static async getAuction(auctionId: string): Promise<IPropertyAuction | null> {
    return PropertyAuction.findById(auctionId);
  }

  /**
   * Cancel auction (owner paid debt)
   */
  static async cancelAuction(auctionId: string, reason: string): Promise<IPropertyAuction> {
    const auction = await PropertyAuction.findById(auctionId);

    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status === AuctionStatus.COMPLETED) {
      throw new Error('Cannot cancel completed auction');
    }

    auction.cancelAuction(reason);
    await auction.save();

    logger.info(`Auction ${auctionId} cancelled: ${reason}`);

    return auction;
  }
}

export default ForeclosureService;
