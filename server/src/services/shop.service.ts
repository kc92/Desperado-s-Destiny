/**
 * Shop Service
 * Handles buying, selling, and inventory management
 */

import mongoose from 'mongoose';
import { Item, IItem, ItemType } from '../models/Item.model';
import { Character, ICharacter } from '../models/Character.model';
import { WorldEvent } from '../models/WorldEvent.model';
import { Location } from '../models/Location.model';
import { GoldTransaction, TransactionSource } from '../models/GoldTransaction.model';
import { AppError } from '../utils/errors';
import { areTransactionsDisabled } from '../utils/transaction.helper';
import { QuestService } from './quest.service';
import logger from '../utils/logger';
import { TerritoryBonusService } from './territoryBonus.service';
import { DynamicPricingService } from './dynamicPricing.service';

export class ShopService {
  /**
   * Get all items available in the shop
   */
  static async getShopItems(type?: ItemType): Promise<IItem[]> {
    return Item.getShopItems(type);
  }

  /**
   * Get a single item by ID
   */
  static async getItem(itemId: string): Promise<IItem | null> {
    return Item.findByItemId(itemId);
  }

  /**
   * Buy an item from the shop
   *
   * SECURITY FIX: Uses atomic operations with MongoDB transactions to prevent race conditions
   * The character document is locked during the transaction to prevent concurrent modifications
   */
  static async buyItem(
    characterId: string,
    itemId: string,
    quantity: number = 1,
    shopFaction?: 'settlerAlliance' | 'nahiCoalition' | 'frontera'
  ): Promise<{ character: ICharacter; item: IItem; totalCost: number; basePrice: number; priceModifier: number }> {
    // Validate quantity to prevent overflow
    if (quantity <= 0 || quantity > 1000 || !Number.isInteger(quantity)) {
      throw new AppError('Invalid quantity', 400);
    }

    const useSession = !areTransactionsDisabled();
    const session = useSession ? await mongoose.startSession() : null;

    if (session) session.startTransaction();

    try {
      // Get item (read-only, no lock needed)
      const item = await Item.findByItemId(itemId);
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      if (!item.inShop) {
        throw new AppError('This item is not available in the shop', 400);
      }

      // Calculate price modifier based on faction reputation
      let priceModifier = 1.0;
      if (shopFaction) {
        try {
          const { ReputationService } = await import('./reputation.service');
          const standings = await ReputationService.getAllStandings(characterId);
          priceModifier = ReputationService.getPriceModifier(standings[shopFaction].standing);
        } catch (repError) {
          // If reputation check fails, use normal price
          logger.error('Failed to check reputation for pricing', { error: repError instanceof Error ? repError.message : repError, stack: repError instanceof Error ? repError.stack : undefined });
        }
      }

      // Apply NPC mood modifier to prices
      // If shopkeeper has a personality, their mood affects prices
      try {
        const { MoodService } = await import('./mood.service');
        // For now, use a generic shopkeeper NPC ID
        // In production, you'd pass the actual shopkeeper NPC ID
        const shopkeeperNpcId = 'general_store_01';
        const moodState = await MoodService.getNPCMood(shopkeeperNpcId);
        const moodEffects = MoodService.getMoodEffects(moodState.currentMood, moodState.moodIntensity);
        priceModifier *= moodEffects.priceModifier;

        logger.debug(`Shopkeeper mood "${moodState.currentMood}" modified price by ${moodEffects.priceModifier}x`);
      } catch (moodError) {
        // If mood check fails, use normal price
        logger.error('Failed to check mood for pricing', { error: moodError instanceof Error ? moodError.message : moodError, stack: moodError instanceof Error ? moodError.stack : undefined });
      }

      // PRODUCTION FIX: World event modifiers are handled by DynamicPricingService
      // Only track them here for static pricing fallback to avoid double-application
      let worldEventModifier = 1;
      try {
        const character = session
          ? await Character.findById(characterId).session(session)
          : await Character.findById(characterId);

        if (character) {
          const location = await Location.findById(character.currentLocation);
          if (location) {
            const activeEvents = await WorldEvent.find({
              status: 'ACTIVE',
              $or: [
                { region: location.region },
                { isGlobal: true }
              ]
            });

            for (const event of activeEvents) {
              for (const effect of event.worldEffects) {
                // FESTIVAL or TRADE_CARAVAN: reduce shop prices
                if (effect.type === 'price_modifier' && (effect.target === 'all' || effect.target === 'shop_items')) {
                  // Store separately - only apply to static pricing path
                  worldEventModifier *= effect.value;
                  logger.debug(`World event "${event.name}" modifier ${effect.value}x (${effect.description})`);
                }
              }
            }
          }
        }
      } catch (eventError) {
        // Don't fail purchase if event check fails
        logger.error('Failed to check world events for price modifiers', { error: eventError instanceof Error ? eventError.message : eventError, stack: eventError instanceof Error ? eventError.stack : undefined });
      }

      // TERRITORY BONUS: Apply gang territory trade bonuses (Phase 2.2)
      try {
        const charObjId = new mongoose.Types.ObjectId(characterId);
        const tradeBonuses = await TerritoryBonusService.getTradeBonuses(charObjId);
        if (tradeBonuses.hasBonuses) {
          // Buy bonus reduces price (lower multiplier = cheaper)
          priceModifier *= tradeBonuses.bonuses.buy;
          logger.debug(`Territory trade bonus: buy price ${tradeBonuses.bonuses.buy}x`);
        }
      } catch (territoryError) {
        logger.warn('Failed to apply territory trade bonus:', territoryError);
      }

      // DYNAMIC PRICING: Get current price with supply/demand mechanics
      let totalCost: number;
      let dynamicPriceData: Awaited<ReturnType<typeof DynamicPricingService.getItemPrice>> | null = null;

      try {
        // Get character location for dynamic pricing
        const character = session
          ? await Character.findById(characterId).session(session)
          : await Character.findById(characterId);

        if (character && character.currentLocation) {
          const locationIdStr = character.currentLocation.toString();
          dynamicPriceData = await DynamicPricingService.getItemPrice(itemId, locationIdStr, 'buy');

          // Apply additional modifiers (reputation, mood, territory) to dynamic price
          const baseDynamicPrice = dynamicPriceData.currentPrice * quantity;
          totalCost = Math.round(baseDynamicPrice * priceModifier);

          logger.debug(`Dynamic pricing: base=$${item.price}, dynamic=$${dynamicPriceData.currentPrice}, final=$${totalCost} (supply: ${dynamicPriceData.supplyLevel}, demand: ${dynamicPriceData.demandLevel})`);
        } else {
          // Fallback to static pricing if location unavailable
          // Include world event modifier here since DynamicPricingService isn't used
          const basePrice = item.price * quantity;
          totalCost = Math.round(basePrice * priceModifier * worldEventModifier);
          logger.debug('Using static pricing (no location)');
        }
      } catch (dynamicPricingError) {
        // Fallback to static pricing on error
        // Include world event modifier here since DynamicPricingService isn't used
        logger.warn('Dynamic pricing failed, using static pricing:', dynamicPricingError);
        const basePrice = item.price * quantity;
        totalCost = Math.round(basePrice * priceModifier * worldEventModifier);
      }

      if (totalCost > Number.MAX_SAFE_INTEGER || totalCost < 0) {
        throw new AppError('Total cost exceeds safe limits', 400);
      }

      // RACE CONDITION FIX: Use findOneAndUpdate with conditional check
      // This ensures dollar deduction is atomic and balance cannot go negative
      const characterQuery = {
        _id: characterId,
        isActive: true,
        dollars: { $gte: totalCost } // Only update if sufficient dollars
      };

      const characterUpdate = {
        $inc: { dollars: -totalCost, gold: -totalCost }, // Update both for legacy sync
        $push: {
          inventory: {
            itemId: item.itemId,
            quantity,
            acquiredAt: new Date()
          }
        }
      };

      // For stackable items, we need to check if item exists first
      let character;
      if (item.isStackable) {
        // Fetch character with lock
        character = session
          ? await Character.findById(characterId).session(session)
          : await Character.findById(characterId);

        if (!character || !character.isActive) {
          throw new AppError('Character not found', 404);
        }

        // Check level requirement (use Total Level for content gating)
        const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);
        if (effectiveLevel < item.levelRequired) {
          throw new AppError(`Total Level ${item.levelRequired * 10} required to purchase this item`, 400);
        }

        // PRODUCTION FIX: Atomic dollar deduction via DollarService
        // DollarService.deductDollars uses findOneAndUpdate with $gte check
        // This prevents race conditions where balance could go negative
        // The pre-check below is optional for better error messages, but the
        // atomic operation is the final authority
        if (character.dollars < totalCost) {
          throw new AppError(`Insufficient dollars. Need $${totalCost}, have $${character.dollars}`, 400);
        }

        // Atomic operation: Only deducts if sufficient funds (race-safe)
        await character.deductDollars(totalCost, TransactionSource.SHOP_PURCHASE, {
          itemId: item.itemId,
          quantity,
          unitPrice: item.price
        });

        // Handle inventory
        const existingItem = character.inventory.find(inv => inv.itemId === item.itemId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          character.inventory.push({
            itemId: item.itemId,
            quantity,
            acquiredAt: new Date()
          });
        }

        await character.save(session ? { session } : undefined);
      } else {
        // For non-stackable items, use findOneAndUpdate for atomic operation
        character = session
          ? await Character.findOneAndUpdate(
              characterQuery,
              characterUpdate,
              { new: true, session }
            )
          : await Character.findOneAndUpdate(
              characterQuery,
              characterUpdate,
              { new: true }
            );

        if (!character) {
          // Fetch to determine specific error
          const char = await Character.findById(characterId);
          if (!char || !char.isActive) {
            throw new AppError('Character not found', 404);
          }
          if (char.level < item.levelRequired) {
            throw new AppError(`Level ${item.levelRequired} required to purchase this item`, 400);
          }
          if (char.dollars < totalCost) {
            throw new AppError(`Insufficient dollars. Need $${totalCost}, have $${char.dollars}`, 400);
          }
          throw new AppError('Purchase failed', 500);
        }

        // Create transaction record manually for non-stackable items
        // (stackable items use deductDollars which creates the record)
        const { CurrencyType } = await import('../models/GoldTransaction.model');
        await GoldTransaction.create([{
          characterId: character._id,
          currencyType: CurrencyType.DOLLAR,
          amount: -totalCost,
          type: 'SPENT',
          source: TransactionSource.SHOP_PURCHASE,
          balanceBefore: character.dollars + totalCost,
          balanceAfter: character.dollars,
          metadata: {
            itemId: item.itemId,
            quantity,
            unitPrice: item.price
          },
          timestamp: new Date(),
        }], session ? { session } : {});
      }

      if (session) await session.commitTransaction();

      // DYNAMIC PRICING: Record transaction for supply/demand tracking
      if (dynamicPriceData && character && character.currentLocation) {
        const locationIdStr = character.currentLocation.toString();
        const unitPrice = Math.round(totalCost / quantity);
        await DynamicPricingService.recordTransaction(
          itemId,
          locationIdStr,
          quantity,
          'buy',
          unitPrice
        );
      }

      // Trigger quest progress for item collected
      try {
        await QuestService.onItemCollected(characterId, itemId, quantity);
      } catch (questError) {
        // Don't fail purchase if quest update fails
        logger.error('Failed to update quest progress for item purchase', { error: questError instanceof Error ? questError.message : questError, stack: questError instanceof Error ? questError.stack : undefined });
      }

      return { character, item, totalCost, basePrice: item.price, priceModifier };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Sell an item from inventory
   */
  static async sellItem(
    characterId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<{ character: ICharacter; item: IItem; dollarsEarned: number }> {
    const useSession = !areTransactionsDisabled();
    const session = useSession ? await mongoose.startSession() : null;

    if (session) session.startTransaction();

    try {
      // Get item definition
      const item = await Item.findByItemId(itemId);
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // Get character
      const characterQuery = Character.findById(characterId);
      const character = session ? await characterQuery.session(session) : await characterQuery;
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Find item in inventory
      const inventoryItem = character.inventory.find(inv => inv.itemId === itemId);
      if (!inventoryItem) {
        throw new AppError('Item not in inventory', 400);
      }

      if (inventoryItem.quantity < quantity) {
        throw new AppError(`Only have ${inventoryItem.quantity}, cannot sell ${quantity}`, 400);
      }

      // DYNAMIC PRICING: Get current sell price with supply/demand mechanics
      let dollarsEarned: number;
      let dynamicPriceData: Awaited<ReturnType<typeof DynamicPricingService.getItemPrice>> | null = null;

      try {
        if (character.currentLocation) {
          const locationIdStr = character.currentLocation.toString();
          dynamicPriceData = await DynamicPricingService.getItemPrice(itemId, locationIdStr, 'sell');

          // Start with dynamic price
          dollarsEarned = dynamicPriceData.currentPrice * quantity;

          // Apply territory sell bonus to dynamic price
          try {
            const charObjId = new mongoose.Types.ObjectId(characterId);
            const tradeBonuses = await TerritoryBonusService.getTradeBonuses(charObjId);
            if (tradeBonuses.hasBonuses) {
              dollarsEarned = Math.floor(dollarsEarned * tradeBonuses.bonuses.sell);
              logger.debug(`Territory trade bonus: sell price ${tradeBonuses.bonuses.sell}x`);
            }
          } catch (territoryError) {
            logger.warn('Failed to apply territory sell bonus:', territoryError);
          }

          logger.debug(`Dynamic sell pricing: base=$${item.sellPrice}, dynamic=$${dynamicPriceData.currentPrice}, final=$${dollarsEarned} (supply: ${dynamicPriceData.supplyLevel}, demand: ${dynamicPriceData.demandLevel})`);
        } else {
          // Fallback to static pricing
          dollarsEarned = item.sellPrice * quantity;
          logger.debug('Using static sell pricing (no location)');
        }
      } catch (dynamicPricingError) {
        // Fallback to static pricing on error
        logger.warn('Dynamic sell pricing failed, using static pricing:', dynamicPricingError);
        dollarsEarned = item.sellPrice * quantity;

        // Still try to apply territory bonus
        try {
          const charObjId = new mongoose.Types.ObjectId(characterId);
          const tradeBonuses = await TerritoryBonusService.getTradeBonuses(charObjId);
          if (tradeBonuses.hasBonuses) {
            dollarsEarned = Math.floor(dollarsEarned * tradeBonuses.bonuses.sell);
            logger.debug(`Territory trade bonus: sell price ${tradeBonuses.bonuses.sell}x`);
          }
        } catch (territoryError) {
          logger.warn('Failed to apply territory sell bonus:', territoryError);
        }
      }

      // Remove from inventory
      inventoryItem.quantity -= quantity;
      if (inventoryItem.quantity <= 0) {
        character.inventory = character.inventory.filter(inv => inv.itemId !== itemId);
      }

      // Add dollars
      await character.addDollars(dollarsEarned, TransactionSource.SHOP_SALE, {
        itemId: item.itemId,
        quantity,
        unitPrice: item.sellPrice
      });

      await character.save(session ? { session } : undefined);
      if (session) await session.commitTransaction();

      // DYNAMIC PRICING: Record transaction for supply/demand tracking
      if (dynamicPriceData && character.currentLocation) {
        const locationIdStr = character.currentLocation.toString();
        const unitPrice = Math.round(dollarsEarned / quantity);
        await DynamicPricingService.recordTransaction(
          itemId,
          locationIdStr,
          quantity,
          'sell',
          unitPrice
        );
      }

      return { character, item, dollarsEarned };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Use a consumable item
   */
  static async useItem(
    characterId: string,
    itemId: string
  ): Promise<{ character: ICharacter; item: IItem; effects: string[] }> {
    const useSession = !areTransactionsDisabled();
    const session = useSession ? await mongoose.startSession() : null;

    if (session) session.startTransaction();

    try {
      // Get item definition
      const item = await Item.findByItemId(itemId);
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      if (!item.isConsumable) {
        throw new AppError('This item cannot be used', 400);
      }

      // Get character
      const characterQuery = Character.findById(characterId);
      const character = session ? await characterQuery.session(session) : await characterQuery;
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Find item in inventory
      const inventoryItem = character.inventory.find(inv => inv.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity < 1) {
        throw new AppError('Item not in inventory', 400);
      }

      // Apply effects
      const appliedEffects: string[] = [];
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'energy':
            character.energy = Math.min(character.maxEnergy, character.energy + effect.value);
            appliedEffects.push(`+${effect.value} Energy`);
            break;
          case 'health':
            // Health would be tracked separately in combat scenarios
            appliedEffects.push(`Healed ${effect.value} HP`);
            break;
          case 'special':
            if (effect.stat === 'energy' && effect.description.includes('Wanted')) {
              character.wantedLevel = Math.max(0, character.wantedLevel - 1);
              character.bountyAmount = character.calculateBounty();
              appliedEffects.push('Reduced Wanted Level by 1');
            }
            break;
        }
      }

      // Remove one from inventory
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity <= 0) {
        character.inventory = character.inventory.filter(inv => inv.itemId !== itemId);
      }

      await character.save(session ? { session } : undefined);
      if (session) await session.commitTransaction();

      return { character, item, effects: appliedEffects };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Get character's inventory with item details
   */
  static async getInventoryWithDetails(characterId: string): Promise<{
    inventory: Array<{
      item: IItem;
      quantity: number;
      acquiredAt: Date;
    }>;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const inventory = await Promise.all(
      character.inventory.map(async (invItem) => {
        const item = await Item.findByItemId(invItem.itemId);
        return {
          item: item!,
          quantity: invItem.quantity,
          acquiredAt: invItem.acquiredAt
        };
      })
    );

    // Filter out any null items (in case of data inconsistency)
    return {
      inventory: inventory.filter(inv => inv.item !== null)
    };
  }

  /**
   * Equip an item from inventory
   */
  static async equipItem(
    characterId: string,
    itemId: string
  ): Promise<{ character: ICharacter; item: IItem; unequippedItem?: IItem }> {
    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get item from database
    const item = await Item.findByItemId(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check if item is equippable
    if (!item.isEquippable || !item.equipSlot) {
      throw new AppError('This item cannot be equipped', 400);
    }

    // Check if character owns the item
    const inventoryItem = character.inventory.find(inv => inv.itemId === itemId);
    if (!inventoryItem) {
      throw new AppError('You do not own this item', 400);
    }

    // Get currently equipped item in that slot
    const slot = item.equipSlot as keyof typeof character.equipment;
    const currentEquipped = character.equipment[slot];
    let unequippedItem: IItem | undefined;

    // Unequip current item if any
    if (currentEquipped) {
      unequippedItem = await Item.findByItemId(currentEquipped) || undefined;
    }

    // Equip the new item
    character.equipment[slot] = itemId;
    await character.save();

    return { character, item, unequippedItem };
  }

  /**
   * Unequip an item from a slot
   */
  static async unequipItem(
    characterId: string,
    slot: string
  ): Promise<{ character: ICharacter; unequippedItem?: IItem }> {
    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Validate slot
    const validSlots = ['weapon', 'head', 'body', 'feet', 'mount', 'accessory'];
    if (!validSlots.includes(slot)) {
      throw new AppError('Invalid equipment slot', 400);
    }

    const equipSlot = slot as keyof typeof character.equipment;
    const currentEquipped = character.equipment[equipSlot];

    if (!currentEquipped) {
      throw new AppError('No item equipped in that slot', 400);
    }

    // Get the item being unequipped
    const unequippedItem = await Item.findByItemId(currentEquipped) || undefined;

    // Unequip
    character.equipment[equipSlot] = null;
    await character.save();

    return { character, unequippedItem };
  }

  /**
   * Get character's equipped items
   */
  static async getEquipment(characterId: string): Promise<{
    equipment: Record<string, IItem | null>;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const equipment: Record<string, IItem | null> = {};
    const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'accessory'];

    for (const slot of slots) {
      const itemId = character.equipment[slot as keyof typeof character.equipment];
      if (itemId) {
        equipment[slot] = await Item.findByItemId(itemId);
      } else {
        equipment[slot] = null;
      }
    }

    return { equipment };
  }
}
