/**
 * Property Purchase Service
 *
 * Handles property purchases, auctions, loans, and ownership transfers
 * Phase 8, Wave 8.1 - Property Ownership System
 */

import { Property, IProperty } from '../models/Property.model';
import { PropertyLoan, IPropertyLoan } from '../models/PropertyLoan.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
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

    return properties.map((prop) => this.propertyToListing(prop));
  }

  /**
   * Get foreclosed properties for sale
   */
  static async getForeclosedListings(): Promise<PropertyListing[]> {
    const properties = await Property.find({ status: 'foreclosed' });
    return properties.map((prop) => this.propertyToListing(prop));
  }

  /**
   * Convert property to listing
   */
  private static propertyToListing(property: IProperty): PropertyListing {
    const typeInfo = PROPERTY_TYPE_INFO[property.propertyType];
    const sizeInfo = PROPERTY_SIZE_INFO[property.size];

    return {
      _id: property._id.toString(),
      propertyType: property.propertyType,
      name: property.name,
      description: typeInfo.description,
      locationId: property.locationId,
      locationName: property.locationId, // TODO: Lookup location name
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

      // Check if character has enough gold
      if (!character.hasGold(downPayment)) {
        throw new Error('Insufficient gold for down payment');
      }

      // Deduct gold
      await character.deductGold(downPayment, TransactionSource.SHOP_PURCHASE, {
        propertyId: property._id,
        propertyName: property.name,
        usedLoan: request.useLoan,
        downPayment,
      });

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
    // Simplified: Use level as proxy for reputation
    // Lower level = higher interest rate
    const baseRate = LOAN_CONFIG.MAX_INTEREST_RATE;
    const reductionPerLevel = 0.2;
    const rate = Math.max(LOAN_CONFIG.MIN_INTEREST_RATE, baseRate - character.level * reductionPerLevel);
    return Math.round(rate * 10) / 10; // Round to 1 decimal
  }

  /**
   * Place bid on auction property
   */
  static async placeBid(request: PropertyBidRequest): Promise<void> {
    // TODO: Implement auction system
    throw new Error('Auction system not yet implemented');
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

      if (!character.hasGold(upgradeCost)) {
        throw new Error('Insufficient gold for tier upgrade');
      }

      // Deduct gold
      await character.deductGold(upgradeCost, TransactionSource.SHOP_PURCHASE, {
        propertyId: property._id,
        upgradeType: 'tier',
        fromTier: property.tier,
        toTier: property.tier + 1,
      });

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

      if (!character.hasGold(upgradeCost)) {
        throw new Error('Insufficient gold for upgrade');
      }

      // Deduct gold
      await character.deductGold(upgradeCost, TransactionSource.SHOP_PURCHASE, {
        propertyId: property._id,
        upgradeType: request.upgradeType,
      });

      // Add upgrade
      const upgrade: PropertyUpgrade = {
        upgradeId: `upgrade_${Date.now()}`,
        upgradeType: request.upgradeType as any,
        category: 'capacity' as UpgradeCategory, // TODO: Get from upgrade definition
        installedAt: new Date(),
        level: 1,
        maxLevel: 5,
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

      if (!character.hasGold(hiringCost)) {
        throw new Error('Insufficient gold to hire worker');
      }

      // Deduct gold
      await character.deductGold(hiringCost, TransactionSource.SHOP_PURCHASE, {
        propertyId: property._id,
        workerType: request.workerType,
      });

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

      if (!character.hasGold(totalPayment)) {
        throw new Error('Insufficient gold for payment');
      }

      // Deduct gold
      await character.deductGold(totalPayment, TransactionSource.SHOP_PURCHASE, {
        loanId: loan._id,
        paymentAmount,
        penalty: loan.isOverdue() ? loan.calculatePenalty() : 0,
      });

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
        if (!buyer.hasGold(price)) {
          throw new Error('Buyer has insufficient gold');
        }

        // Transfer gold
        await buyer.deductGold(price, TransactionSource.PLAYER_TRADE, {
          propertyId: property._id,
          sellerId: seller._id,
        });

        await seller.addGold(price, TransactionSource.PLAYER_TRADE, {
          propertyId: property._id,
          buyerId: buyer._id,
        });
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

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }
}
