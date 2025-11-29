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
          console.error('Failed to check reputation for pricing:', repError);
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

        console.log(`Shopkeeper mood "${moodState.currentMood}" modified price by ${moodEffects.priceModifier}x`);
      } catch (moodError) {
        // If mood check fails, use normal price
        console.error('Failed to check mood for pricing:', moodError);
      }

      // Apply world event modifiers to shop prices
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
                  priceModifier *= effect.value;
                  console.log(`World event "${event.name}" modified shop price by ${effect.value}x (${effect.description})`);
                }
              }
            }
          }
        }
      } catch (eventError) {
        // Don't fail purchase if event check fails
        console.error('Failed to check world events for price modifiers:', eventError);
      }

      // Calculate total cost with overflow check and price modifier
      const basePrice = item.price * quantity;
      const totalCost = Math.round(basePrice * priceModifier);
      if (totalCost > Number.MAX_SAFE_INTEGER || totalCost < 0) {
        throw new AppError('Total cost exceeds safe limits', 400);
      }

      // RACE CONDITION FIX: Use findOneAndUpdate with conditional check
      // This ensures gold deduction is atomic and balance cannot go negative
      const characterQuery = {
        _id: characterId,
        isActive: true,
        gold: { $gte: totalCost } // Only update if sufficient gold
      };

      const characterUpdate = {
        $inc: { gold: -totalCost },
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

        // Check level requirement
        if (character.level < item.levelRequired) {
          throw new AppError(`Level ${item.levelRequired} required to purchase this item`, 400);
        }

        // Check gold with race condition prevention
        if (character.gold < totalCost) {
          throw new AppError(`Insufficient gold. Need ${totalCost}, have ${character.gold}`, 400);
        }

        // Deduct gold atomically via gold service
        await character.deductGold(totalCost, TransactionSource.SHOP_PURCHASE, {
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
          if (char.gold < totalCost) {
            throw new AppError(`Insufficient gold. Need ${totalCost}, have ${char.gold}`, 400);
          }
          throw new AppError('Purchase failed', 500);
        }

        // Create transaction record manually for non-stackable items
        // (stackable items use deductGold which creates the record)
        await GoldTransaction.create([{
          characterId: character._id,
          amount: -totalCost,
          type: 'SPENT',
          source: TransactionSource.SHOP_PURCHASE,
          balanceBefore: character.gold + totalCost,
          balanceAfter: character.gold,
          metadata: {
            itemId: item.itemId,
            quantity,
            unitPrice: item.price
          },
          timestamp: new Date(),
        }], session ? { session } : {});
      }

      if (session) await session.commitTransaction();

      // Trigger quest progress for item collected
      try {
        await QuestService.onItemCollected(characterId, itemId, quantity);
      } catch (questError) {
        // Don't fail purchase if quest update fails
        console.error('Failed to update quest progress for item purchase:', questError);
      }

      return { character, item, totalCost, basePrice, priceModifier };
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
  ): Promise<{ character: ICharacter; item: IItem; goldEarned: number }> {
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

      // Calculate gold earned
      const goldEarned = item.sellPrice * quantity;

      // Remove from inventory
      inventoryItem.quantity -= quantity;
      if (inventoryItem.quantity <= 0) {
        character.inventory = character.inventory.filter(inv => inv.itemId !== itemId);
      }

      // Add gold
      await character.addGold(goldEarned, TransactionSource.SHOP_SALE, {
        itemId: item.itemId,
        quantity,
        unitPrice: item.sellPrice
      });

      await character.save(session ? { session } : undefined);
      if (session) await session.commitTransaction();

      return { character, item, goldEarned };
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
