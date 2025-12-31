/**
 * Shop Controller
 * Handles shop and inventory API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ShopService } from '../services/shop.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { ItemType } from '../models/Item.model';

/**
 * Get all shop items
 * GET /api/shop
 *
 * PRODUCTION FIX: Now includes dynamic prices based on character location
 * Returns both base price and current price (with all modifiers applied)
 */
export const getShopItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const type = req.query.type as ItemType | undefined;
    const items = await ShopService.getShopItems(type);

    // If character is available, calculate dynamic prices
    if (req.character && req.character.currentLocation) {
      const { DynamicPricingService } = await import('../services/dynamicPricing.service');
      const locationId = req.character.currentLocation.toString();

      const itemsWithPrices = await Promise.all(
        items.map(async (item) => {
          try {
            const priceData = await DynamicPricingService.getItemPrice(
              item.itemId,
              locationId,
              'buy'
            );
            return {
              ...item.toObject(),
              currentPrice: priceData.currentPrice,
              priceModifiers: priceData.modifiers,
              priceTrend: priceData.trend
            };
          } catch {
            // Fallback to base price if dynamic pricing fails
            return {
              ...item.toObject(),
              currentPrice: item.price,
              priceModifiers: [],
              priceTrend: 'stable' as const
            };
          }
        })
      );

      return res.status(200).json({
        success: true,
        data: { items: itemsWithPrices }
      });
    }

    res.status(200).json({
      success: true,
      data: { items }
    });
  }
);

/**
 * Get a single item by ID
 * GET /api/shop/items/:itemId
 */
export const getItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const item = await ShopService.getItem(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { item }
    });
  }
);

/**
 * Buy an item
 * POST /api/shop/buy
 */
export const buyItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required'
      });
    }

    const result = await ShopService.buyItem(characterId, itemId, quantity);

    res.status(200).json({
      success: true,
      data: {
        message: `Purchased ${quantity}x ${result.item.name}`,
        item: result.item,
        quantity,
        totalCost: result.totalCost,
        newGold: result.character.gold,
        inventory: result.character.inventory
      }
    });
  }
);

/**
 * Sell an item
 * POST /api/shop/sell
 */
export const sellItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required'
      });
    }

    const result = await ShopService.sellItem(characterId, itemId, quantity);

    res.status(200).json({
      success: true,
      data: {
        message: `Sold ${quantity}x ${result.item.name}`,
        item: result.item,
        quantity,
        dollarsEarned: result.dollarsEarned,
        newGold: result.character.gold,
        inventory: result.character.inventory
      }
    });
  }
);

/**
 * Use a consumable item
 * POST /api/shop/use
 */
export const useItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required'
      });
    }

    const result = await ShopService.useItem(characterId, itemId);

    res.status(200).json({
      success: true,
      data: {
        message: `Used ${result.item.name}`,
        effects: result.effects,
        character: result.character.toSafeObject()
      }
    });
  }
);

/**
 * Get inventory with full item details
 * GET /api/shop/inventory
 */
export const getInventory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const result = await ShopService.getInventoryWithDetails(characterId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Equip an item
 * POST /api/shop/equip
 */
export const equipItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required'
      });
    }

    const result = await ShopService.equipItem(characterId, itemId);

    res.status(200).json({
      success: true,
      data: {
        message: `Equipped ${result.item.name}`,
        item: result.item,
        slot: result.item.equipSlot,
        unequippedItem: result.unequippedItem,
        equipment: req.character!.equipment
      }
    });
  }
);

/**
 * Unequip an item
 * POST /api/shop/unequip
 */
export const unequipItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { slot } = req.body;

    if (!slot) {
      return res.status(400).json({
        success: false,
        error: 'slot is required'
      });
    }

    const result = await ShopService.unequipItem(characterId, slot);

    res.status(200).json({
      success: true,
      data: {
        message: result.unequippedItem
          ? `Unequipped ${result.unequippedItem.name}`
          : 'Slot cleared',
        slot,
        unequippedItem: result.unequippedItem,
        equipment: result.character.equipment
      }
    });
  }
);

/**
 * Get equipped items
 * GET /api/shop/equipment
 */
export const getEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const result = await ShopService.getEquipment(characterId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);
