/**
 * Property Controller
 * Handles property purchase, management, and ownership endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { PropertyPurchaseService } from '../services/propertyPurchase.service';
import { Property } from '../models/Property.model';
import { PropertyLoan } from '../models/PropertyLoan.model';

/**
 * Get available property listings
 * GET /api/properties/listings
 */
export const getListings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { location } = req.query;

    const listings = await PropertyPurchaseService.getAvailableListings(
      location as string | undefined
    );

    res.status(200).json({
      success: true,
      data: {
        listings,
        total: listings.length,
      },
    });
  }
);

/**
 * Get foreclosed properties
 * GET /api/properties/foreclosed
 */
export const getForeclosedListings = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const listings = await PropertyPurchaseService.getForeclosedListings();

    res.status(200).json({
      success: true,
      data: {
        listings,
        total: listings.length,
      },
    });
  }
);

/**
 * Get specific property details
 * GET /api/properties/:propertyId
 */
export const getPropertyDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    // Check if character owns this property
    let isOwner = false;
    if (req.character) {
      isOwner = property.ownerId?.toString() === req.character._id.toString();
    }

    // Get loan if exists
    let loan = null;
    if (isOwner) {
      loan = await PropertyLoan.findByProperty(propertyId);
    }

    res.status(200).json({
      success: true,
      data: {
        property,
        isOwner,
        loan,
      },
    });
  }
);

/**
 * Purchase a property
 * POST /api/properties/purchase
 */
export const purchaseProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { listingId, useLoan, downPaymentPercentage } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'Listing ID is required',
      });
    }

    const result = await PropertyPurchaseService.purchaseProperty({
      characterId,
      listingId,
      useLoan: useLoan || false,
      downPaymentPercentage: downPaymentPercentage || 20,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Successfully purchased ${result.property.name}!`,
    });
  }
);

/**
 * Get my properties
 * GET /api/properties/my-properties
 */
export const getMyProperties = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const properties = await PropertyPurchaseService.getOwnedProperties(characterId);

    res.status(200).json({
      success: true,
      data: {
        properties,
        total: properties.length,
      },
    });
  }
);

/**
 * Upgrade property tier
 * POST /api/properties/:propertyId/upgrade-tier
 */
export const upgradeTier = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;

    const property = await PropertyPurchaseService.upgradeTier({
      characterId,
      propertyId,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: `Property upgraded to tier ${property.tier}!`,
    });
  }
);

/**
 * Add upgrade to property
 * POST /api/properties/:propertyId/upgrade
 */
export const addUpgrade = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { upgradeType } = req.body;

    if (!upgradeType) {
      return res.status(400).json({
        success: false,
        error: 'Upgrade type is required',
      });
    }

    const property = await PropertyPurchaseService.addUpgrade({
      characterId,
      propertyId,
      upgradeType,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Upgrade added successfully!',
    });
  }
);

/**
 * Hire worker for property
 * POST /api/properties/:propertyId/hire
 */
export const hireWorker = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { workerType, skill } = req.body;

    if (!workerType) {
      return res.status(400).json({
        success: false,
        error: 'Worker type is required',
      });
    }

    const property = await PropertyPurchaseService.hireWorker({
      characterId,
      propertyId,
      workerType,
      skill: skill || 50,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Worker hired successfully!',
    });
  }
);

/**
 * Fire worker from property
 * POST /api/properties/:propertyId/fire
 */
export const fireWorker = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        error: 'Worker ID is required',
      });
    }

    const property = await PropertyPurchaseService.fireWorker({
      characterId,
      propertyId,
      workerId,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Worker fired.',
    });
  }
);

/**
 * Deposit item to property storage
 * POST /api/properties/:propertyId/storage/deposit
 */
export const depositItem = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and quantity are required',
      });
    }

    const property = await PropertyPurchaseService.manageStorage({
      characterId,
      propertyId,
      action: 'deposit',
      itemId,
      quantity,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Item deposited to storage.',
    });
  }
);

/**
 * Withdraw item from property storage
 * POST /api/properties/:propertyId/storage/withdraw
 */
export const withdrawItem = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and quantity are required',
      });
    }

    const property = await PropertyPurchaseService.manageStorage({
      characterId,
      propertyId,
      action: 'withdraw',
      itemId,
      quantity,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Item withdrawn from storage.',
    });
  }
);

/**
 * Get my loans
 * GET /api/properties/loans
 */
export const getMyLoans = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const loans = await PropertyPurchaseService.getCharacterLoans(characterId);

    res.status(200).json({
      success: true,
      data: {
        loans,
        total: loans.length,
      },
    });
  }
);

/**
 * Make loan payment
 * POST /api/properties/loans/:loanId/pay
 */
export const makeLoanPayment = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { loanId } = req.params;
    const { amount } = req.body;

    const loan = await PropertyPurchaseService.makeLoanPayment({
      characterId,
      loanId,
      amount,
    });

    res.status(200).json({
      success: true,
      data: loan,
      message: loan.remainingBalance > 0
        ? `Payment made. Remaining balance: ${loan.remainingBalance}`
        : 'Loan paid off!',
    });
  }
);

/**
 * Transfer property to another player
 * POST /api/properties/:propertyId/transfer
 */
export const transferProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { propertyId } = req.params;
    const { targetCharacterId, price } = req.body;

    if (!targetCharacterId) {
      return res.status(400).json({
        success: false,
        error: 'Target character ID is required',
      });
    }

    const property = await PropertyPurchaseService.transferProperty({
      characterId,
      propertyId,
      targetCharacterId,
      price: price || 0,
    });

    res.status(200).json({
      success: true,
      data: property,
      message: price > 0
        ? `Property sold for ${price} gold!`
        : 'Property transferred successfully!',
    });
  }
);
