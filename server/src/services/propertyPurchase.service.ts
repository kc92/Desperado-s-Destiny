/**
 * Property Purchase Service
 *
 * Handles property purchases, auctions, loans, and ownership transfers
 * Phase 8, Wave 8.1 - Property Ownership System
 */

import { Property, IProperty } from '../models/Property.model';
import { PropertyLoan, IPropertyLoan } from '../models/PropertyLoan.model';
import { PropertyAuction, IPropertyAuction } from '../models/PropertyAuction.model';
import { Character } from '../models/Character.model';
import { Location } from '../models/Location.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import { NotificationService } from './notification.service';
import { getUpgradeById } from '../data/propertyUpgrades';
import mongoose from 'mongoose';
import {
  PROPERTY_TIER_INFO,
  PROPERTY_SIZE_INFO,
  PROPERTY_TYPE_INFO,
  LOAN_CONFIG,
  PROPERTY_CONSTRAINTS,
  BASE_WORKER_WAGES,
  WORKER_SKILL_TIERS,
} from '@desperados/shared';
import type {
  PropertyListing,
  PropertyPurchaseRequest,
  PropertyBidRequest,
  PropertyUpgradeRequest,
  PropertyTierUpgradeRequest,
  WorkerHireRequest,
  WorkerFireRequest,
  PropertyStorageRequest,
  ProductionStartRequest,
  LoanPaymentRequest,
  PropertyTransferRequest,
  PropertyType,
  PropertySize,
  PropertyTier,
  PropertyUpgrade,
  PropertyWorker,
  WorkerType,
  UpgradeCategory,
} from '@desperados/shared';
import { PropertyStatus, PurchaseSource } from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';

/**
 * Property Purchase Service
 */
export class PropertyPurchaseService {
  /**
   * Get all available property listings
   */
  static async getAvailableListings(locationId?: string): Promise<PropertyListing[]> {
    const query: any = {
      ownerId: { $exists: false },
      status: 'active',
    };

    if (locationId) {
      query.locationId = locationId;
    }

    const properties = await Property.find(query);

    return Promise.all(properties.map((prop) => this.propertyToListing(prop)));
  }

  /**
   * Get foreclosed properties for sale
   */
  static async getForeclosedListings(): Promise<PropertyListing[]> {
    const properties = await Property.find({ status: 'foreclosed' });
    return Promise.all(properties.map((prop) => this.propertyToListing(prop)));
  }

  /**
   * Convert property to listing
   */
  private static async propertyToListing(property: IProperty): Promise<PropertyListing> {
    const typeInfo = PROPERTY_TYPE_INFO[property.propertyType];
    const sizeInfo = PROPERTY_SIZE_INFO[property.size];

    // Lookup location name
    const location = await Location.findById(property.locationId).select('name');

    return {
      _id: property._id.toString(),
      propertyType: property.propertyType,
      name: property.name,
      description: typeInfo.description,
      locationId: property.locationId,
      locationName: location?.name ?? 'Unknown Location',
      size: property.size,
      tier: property.tier,
      price: property.purchasePrice,
      condition: property.condition,
      requirements: {
        minGold: property.purchasePrice,
        allowsLoan: true,
        minDownPayment: LOAN_CONFIG.MIN_DOWN_PAYMENT,
      },
      isAvailable: !property.ownerId,
      isAuction: false,
      source: property.purchaseSource,
    };
  }

  /**
   * Purchase a property
   */
  static async purchaseProperty(request: PropertyPurchaseRequest): Promise<{
    property: IProperty;
    loan?: IPropertyLoan;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check property limit
      const ownedProperties = await Property.find({
        ownerId: character._id,
        status: { $in: ['active', 'under_construction'] },
      }).session(session);

      if (ownedProperties.length >= PROPERTY_CONSTRAINTS.MAX_PROPERTIES_PER_CHARACTER) {
        throw new Error('Maximum properties owned');
      }

      // Get property listing
      const property = await Property.findById(request.listingId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId) {
        throw new Error('Property already owned');
      }

      // Calculate payment
      const totalPrice = property.purchasePrice;
      let downPayment = totalPrice;
      let loan: IPropertyLoan | undefined;

      if (request.useLoan) {
        // Validate down payment percentage
        const downPaymentPercent = request.downPaymentPercentage || LOAN_CONFIG.MIN_DOWN_PAYMENT;
        if (downPaymentPercent < LOAN_CONFIG.MIN_DOWN_PAYMENT || downPaymentPercent > LOAN_CONFIG.MAX_DOWN_PAYMENT) {
          throw new Error(
            `Down payment must be between ${LOAN_CONFIG.MIN_DOWN_PAYMENT}% and ${LOAN_CONFIG.MAX_DOWN_PAYMENT}%`
          );
        }

        downPayment = Math.ceil((totalPrice * downPaymentPercent) / 100);
        const loanAmount = totalPrice - downPayment;

        // Calculate interest rate based on reputation (simplified)
        const interestRate = this.calculateInterestRate(character);

        // Create loan
        loan = await PropertyLoan.createLoan(
          property._id.toString(),
          character._id.toString(),
          loanAmount,
          interestRate
        );
        await loan.save({ session });
      }

      // Deduct dollars using DollarService (handles insufficient funds check internally)
      await DollarService.deductDollars(
        character._id as any,
        downPayment,
        TransactionSource.PROPERTY_PURCHASE,
        {
          propertyId: property._id,
          propertyName: property.name,
          usedLoan: request.useLoan,
          downPayment,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Transfer ownership
      property.ownerId = character._id as any;
      property.purchaseDate = new Date();
      property.purchaseSource = PurchaseSource.NPC_DIRECT as any;
      property.status = PropertyStatus.ACTIVE as any;
      property.lastTaxPayment = new Date();

      await property.save({ session });

      await session.commitTransaction();

      return { property, loan };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Calculate interest rate based on character reputation
   */
  private static calculateInterestRate(character: any): number {
    // Simplified: Use Total Level / 10 as proxy for reputation
    // Lower effective level = higher interest rate
    const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);
    const baseRate = LOAN_CONFIG.MAX_INTEREST_RATE;
    const reductionPerLevel = 0.2;
    const rate = Math.max(LOAN_CONFIG.MIN_INTEREST_RATE, baseRate - effectiveLevel * reductionPerLevel);
    return Math.round(rate * 10) / 10; // Round to 1 decimal
  }

  /**
   * Place bid on auction property
   */
  static async placeBid(request: PropertyBidRequest): Promise<{
    auction: IPropertyAuction;
    previousBidder?: { id: string; name: string };
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Find active auction for property
      const auction = await PropertyAuction.findByPropertyId(request.listingId);
      if (!auction) {
        throw new Error('Auction not found for this property');
      }

      // Check auction is active
      if (!auction.isActive()) {
        throw new Error('Auction is not currently active');
      }

      // Check character has sufficient funds for bid
      if (character.dollars < request.bidAmount) {
        throw new Error(`Insufficient funds. You have $${character.dollars} but bid requires $${request.bidAmount}`);
      }

      // Check bid meets minimum requirements
      const minimumBid = auction.getMinimumNextBid();
      if (request.bidAmount < minimumBid) {
        throw new Error(`Bid must be at least $${minimumBid}. Current high bid is $${auction.currentBid}`);
      }

      // Check bidder can bid (not already high bidder, not original owner bidding against themselves)
      const bidderId = new mongoose.Types.ObjectId(request.characterId);
      if (!auction.canBid(bidderId)) {
        throw new Error('You cannot place a bid at this time');
      }

      // Store previous bidder for notification
      const previousBidder = auction.currentBidderId
        ? { id: auction.currentBidderId.toString(), name: auction.currentBidderName || 'Unknown' }
        : undefined;

      // Place the bid - this validates and updates the auction
      auction.placeBid(bidderId, character.name, request.bidAmount);

      await auction.save({ session });

      // Notify previous high bidder they were outbid
      if (previousBidder) {
        await NotificationService.sendNotification(
          previousBidder.id,
          'auction_outbid',
          `You have been outbid on ${auction.propertyName}! New high bid: $${request.bidAmount}`,
          {
            link: `/properties/auction/${auction._id}`,
            auctionId: auction._id.toString(),
            propertyName: auction.propertyName,
            newBidAmount: request.bidAmount
          }
        );
      }

      // Notify bidder of successful bid
      await NotificationService.sendNotification(
        request.characterId,
        'auction_bid_placed',
        `Your bid of $${request.bidAmount} on ${auction.propertyName} has been placed. You are the current high bidder!`,
        {
          link: `/properties/auction/${auction._id}`,
          auctionId: auction._id.toString(),
          propertyName: auction.propertyName,
          bidAmount: request.bidAmount
        }
      );

      await session.commitTransaction();

      return { auction, previousBidder };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get active auctions
   */
  static async getActiveAuctions(): Promise<IPropertyAuction[]> {
    return PropertyAuction.findActiveAuctions();
  }

  /**
   * Get auction by property ID
   */
  static async getAuctionByProperty(propertyId: string): Promise<IPropertyAuction | null> {
    return PropertyAuction.findByPropertyId(propertyId);
  }

  /**
   * Upgrade property tier
   */
  static async upgradeTier(request: PropertyTierUpgradeRequest): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const property = await Property.findById(request.propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== character._id.toString()) {
        throw new Error('Not the property owner');
      }

      if (property.tier >= 5) {
        throw new Error('Property already at maximum tier');
      }

      // Get upgrade cost
      const tierInfo = PROPERTY_TIER_INFO[property.tier as PropertyTier];
      const upgradeCost = tierInfo.upgradeCost;

      // Deduct dollars using DollarService (handles insufficient funds check internally)
      await DollarService.deductDollars(
        character._id as any,
        upgradeCost,
        TransactionSource.PROPERTY_PURCHASE,
        {
          propertyId: property._id,
          upgradeType: 'tier',
          fromTier: property.tier,
          toTier: property.tier + 1,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Upgrade tier
      property.tier = (property.tier + 1) as PropertyTier;

      // Update limits based on new tier
      const newTierInfo = PROPERTY_TIER_INFO[property.tier];
      property.maxUpgrades = newTierInfo.upgradeSlots;
      property.maxWorkers = newTierInfo.workerSlots;
      property.storage.capacity = Math.floor(
        PROPERTY_SIZE_INFO[property.size].baseStorage * newTierInfo.storageMultiplier
      );

      // Add production slots
      while (property.productionSlots.length < newTierInfo.productionSlots) {
        property.productionSlots.push({
          slotId: `slot_${property.productionSlots.length + 1}`,
          slotNumber: property.productionSlots.length + 1,
          propertyType: property.propertyType,
          status: 'idle' as any,
          baseCapacity: 1,
          currentCapacity: 1,
          efficiencyBonus: 0,
          qualityBonus: 0,
          speedBonus: 0,
        } as any);
      }

      await property.save({ session });
      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add upgrade to property
   */
  static async addUpgrade(request: PropertyUpgradeRequest): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const property = await Property.findById(request.propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== character._id.toString()) {
        throw new Error('Not the property owner');
      }

      // Check if upgrade slots available
      if (property.getAvailableUpgradeSlots() === 0) {
        throw new Error('No upgrade slots available');
      }

      // Get upgrade definition (from data file)
      // For now, use placeholder cost
      const upgradeCost = 500 * property.tier;

      // Deduct dollars using DollarService (handles insufficient funds check internally)
      await DollarService.deductDollars(
        character._id as any,
        upgradeCost,
        TransactionSource.PROPERTY_PURCHASE,
        {
          propertyId: property._id,
          upgradeType: request.upgradeType,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Add upgrade - get category from upgrade definition
      const upgradeDef = getUpgradeById(request.upgradeType);
      const upgrade: PropertyUpgrade = {
        upgradeId: `upgrade_${Date.now()}`,
        upgradeType: request.upgradeType as any,
        category: upgradeDef?.category ?? ('capacity' as UpgradeCategory),
        installedAt: new Date(),
        level: 1,
        maxLevel: upgradeDef?.maxLevel ?? 5,
      };

      property.addUpgrade(upgrade);
      await property.save({ session });
      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Hire worker for property
   */
  static async hireWorker(request: WorkerHireRequest): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const property = await Property.findById(request.propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== character._id.toString()) {
        throw new Error('Not the property owner');
      }

      if (property.getAvailableWorkerSlots() === 0) {
        throw new Error('No worker slots available');
      }

      // Calculate wage based on skill
      const baseWage = BASE_WORKER_WAGES[request.workerType];
      let wageMultiplier = 1;

      if (request.skill <= WORKER_SKILL_TIERS.NOVICE.max) {
        wageMultiplier = WORKER_SKILL_TIERS.NOVICE.wageMultiplier;
      } else if (request.skill <= WORKER_SKILL_TIERS.SKILLED.max) {
        wageMultiplier = WORKER_SKILL_TIERS.SKILLED.wageMultiplier;
      } else if (request.skill <= WORKER_SKILL_TIERS.EXPERT.max) {
        wageMultiplier = WORKER_SKILL_TIERS.EXPERT.wageMultiplier;
      } else {
        wageMultiplier = WORKER_SKILL_TIERS.MASTER.wageMultiplier;
      }

      const dailyWage = Math.ceil(baseWage * wageMultiplier);

      // Hiring cost (1 week wages upfront)
      const hiringCost = dailyWage * 7;

      // Deduct dollars using DollarService (handles insufficient funds check internally)
      await DollarService.deductDollars(
        character._id as any,
        hiringCost,
        TransactionSource.PROPERTY_PURCHASE,
        {
          propertyId: property._id,
          workerType: request.workerType,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Generate worker name
      const workerName = this.generateWorkerName(request.workerType);

      // Hire worker
      const worker: PropertyWorker = {
        workerId: `worker_${Date.now()}`,
        propertyId: property._id.toString(),
        name: workerName,
        specialization: request.workerType as any,
        skillLevel: request.skill,
        loyalty: 50,
        efficiency: 50,
        wage: dailyWage,
        experience: 0,
        hiredAt: new Date(),
        assignedTo: null,
        status: 'idle' as any,
      } as any;

      (property as any).hireWorker(worker);
      await property.save({ session });
      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fire worker from property
   */
  static async fireWorker(request: WorkerFireRequest): Promise<IProperty> {
    const property = await Property.findById(request.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const character = await Character.findById(request.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    if (property.ownerId?.toString() !== character._id.toString()) {
      throw new Error('Not the property owner');
    }

    property.fireWorker(request.workerId);
    await property.save();

    return property;
  }

  /**
   * Manage property storage
   */
  static async manageStorage(request: PropertyStorageRequest): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const property = await Property.findById(request.propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== character._id.toString()) {
        throw new Error('Not the property owner');
      }

      if (request.action === 'deposit') {
        // Check character inventory
        const inventoryItem = character.inventory.find((item) => item.itemId === request.itemId);
        if (!inventoryItem || inventoryItem.quantity < request.quantity) {
          throw new Error('Insufficient items in inventory');
        }

        // Remove from character inventory
        inventoryItem.quantity -= request.quantity;
        if (inventoryItem.quantity === 0) {
          character.inventory = character.inventory.filter((item) => item.itemId !== request.itemId);
        }

        // Add to property storage
        property.depositItem(request.itemId, inventoryItem.itemId, request.quantity);
      } else {
        // Withdraw
        const success = property.withdrawItem(request.itemId, request.quantity);
        if (!success) {
          throw new Error('Item not available in storage');
        }

        // Add to character inventory
        const existingItem = character.inventory.find((item) => item.itemId === request.itemId);
        if (existingItem) {
          existingItem.quantity += request.quantity;
        } else {
          character.inventory.push({
            itemId: request.itemId,
            quantity: request.quantity,
            acquiredAt: new Date(),
          });
        }
      }

      await property.save({ session });
      await character.save({ session });
      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Make loan payment
   */
  static async makeLoanPayment(request: LoanPaymentRequest): Promise<IPropertyLoan> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const loan = await PropertyLoan.findById(request.loanId).session(session);
      if (!loan) {
        throw new Error('Loan not found');
      }

      if (loan.characterId.toString() !== character._id.toString()) {
        throw new Error('Not the loan owner');
      }

      // Calculate payment amount
      const paymentAmount = request.amount || loan.monthlyPayment;

      // Add penalty if overdue
      let totalPayment = paymentAmount;
      if (loan.isOverdue()) {
        totalPayment += loan.calculatePenalty();
      }

      // Deduct dollars using DollarService (handles insufficient funds check internally)
      await DollarService.deductDollars(
        character._id as any,
        totalPayment,
        TransactionSource.PROPERTY_PURCHASE,
        {
          loanId: loan._id,
          paymentAmount,
          penalty: loan.isOverdue() ? loan.calculatePenalty() : 0,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Make payment
      loan.makePayment(paymentAmount);
      await loan.save({ session });
      await session.commitTransaction();

      return loan;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer property ownership
   */
  static async transferProperty(request: PropertyTransferRequest): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const seller = await Character.findById(request.characterId).session(session);
      if (!seller) {
        throw new Error('Seller not found');
      }

      const buyer = await Character.findById(request.targetCharacterId).session(session);
      if (!buyer) {
        throw new Error('Buyer not found');
      }

      const property = await Property.findById(request.propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== seller._id.toString()) {
        throw new Error('Not the property owner');
      }

      // Check if property has active loan
      const loan = await PropertyLoan.findByProperty(property._id.toString());
      if (loan) {
        throw new Error('Cannot transfer property with active loan');
      }

      const price = request.price || 0;

      if (price > 0) {
        // Handle sale
        // CRITICAL FIX: Use DollarService methods instead of non-existent Character methods
        if (buyer.dollars < price) {
          throw new Error('Buyer has insufficient dollars');
        }

        // Transfer dollars using DollarService (transaction-safe with audit trail)
        await DollarService.deductDollars(
          buyer._id.toString(),
          price,
          TransactionSource.PLAYER_TRADE,
          {
            propertyId: property._id.toString(),
            sellerId: seller._id.toString(),
            description: 'Property purchase transfer',
            currencyType: 'DOLLAR'
          },
          session
        );

        await DollarService.addDollars(
          seller._id.toString(),
          price,
          TransactionSource.PLAYER_TRADE,
          {
            propertyId: property._id.toString(),
            buyerId: buyer._id.toString(),
            description: 'Property sale proceeds',
            currencyType: 'DOLLAR'
          },
          session
        );
      }

      // Transfer ownership
      property.ownerId = buyer._id as any;
      property.purchaseDate = new Date();
      property.purchaseSource = PurchaseSource.TRANSFER as any;

      await property.save({ session });
      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get properties owned by character
   */
  static async getOwnedProperties(characterId: string): Promise<IProperty[]> {
    return Property.findByOwner(characterId);
  }

  /**
   * Get loans for character
   */
  static async getCharacterLoans(characterId: string): Promise<IPropertyLoan[]> {
    return PropertyLoan.findByCharacter(characterId);
  }

  /**
   * Generate worker name based on type
   */
  private static generateWorkerName(workerType: WorkerType): string {
    const firstNames = [
      'Jake',
      'Sarah',
      'Tom',
      'Mary',
      'Bill',
      'Annie',
      'Frank',
      'Rosa',
      'Charlie',
      'Emma',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Brown',
      'Davis',
      'Miller',
      'Wilson',
      'Moore',
      'Taylor',
      'Anderson',
      'Thomas',
    ];

    const firstName = SecureRNG.select(firstNames);
    const lastName = SecureRNG.select(lastNames);

    return `${firstName} ${lastName}`;
  }
}
