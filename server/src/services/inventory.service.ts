/**
 * Inventory Service
 * Manages character inventory with dual constraints (quantity slots + weight)
 * Integrates mount system for carry capacity bonuses
 * Handles overflow: combat loot → ground drops, quest/NPC rewards → pending rewards
 */

import mongoose, { ClientSession } from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { Mount } from '../models/Mount.model';
import { GroundItem } from '../models/GroundItem.model';
import { PendingReward } from '../models/PendingReward.model';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface InventoryCapacity {
  maxSlots: number;
  maxWeight: number;
  currentSlots: number;
  currentWeight: number;
  availableSlots: number;
  availableWeight: number;
}

export interface AddItemsSource {
  type: 'combat' | 'quest' | 'npc' | 'purchase' | 'trade' | 'other';
  id?: string;
  name?: string;
}

export interface AddItemsResult {
  success: boolean;
  itemsAdded: Array<{ itemId: string; quantity: number }>;
  overflow: Array<{ itemId: string; quantity: number; reason: 'slots' | 'weight' }>;
  message: string;
}

export interface ClaimPendingRewardsResult {
  claimed: Array<{ itemId: string; quantity: number; source: string }>;
  stillPending: number;
  message: string;
}

// =============================================================================
// SERVICE
// =============================================================================

export class InventoryService {
  static readonly DEFAULT_CAPACITY_SLOTS = 100;
  static readonly DEFAULT_CAPACITY_WEIGHT = 500; // Base carry capacity in units
  static readonly GROUND_ITEM_EXPIRY_HOURS = 1;

  /**
   * Get inventory capacity including mount bonuses
   */
  static async getCapacity(character: ICharacter): Promise<InventoryCapacity> {
    let maxSlots = this.DEFAULT_CAPACITY_SLOTS;
    let maxWeight = this.DEFAULT_CAPACITY_WEIGHT;

    // Bonus from level
    maxSlots += Math.floor(character.level / 10) * 10;
    maxWeight += Math.floor(character.level / 5) * 50;

    // Bank vault tier bonuses (if exists on character)
    if ('bankVaultTier' in character) {
      const vaultTier = (character as any).bankVaultTier;
      if (vaultTier === 'bronze') {
        maxSlots += 20;
        maxWeight += 100;
      } else if (vaultTier === 'silver') {
        maxSlots += 40;
        maxWeight += 200;
      } else if (vaultTier === 'gold') {
        maxSlots += 60;
        maxWeight += 300;
      }
    }

    // Mount bonuses (if mounted)
    if ('activeMountId' in character && (character as any).activeMountId) {
      try {
        const mount = await Mount.findById((character as any).activeMountId);
        if (mount) {
          maxWeight += mount.carryCapacity;
          logger.debug(`Mount ${mount.name} adds ${mount.carryCapacity} carry capacity`);
        }
      } catch (error) {
        logger.error('Error loading mount for capacity calculation:', error);
      }
    }

    // Calculate current usage
    const currentSlots = this.getUsedSlots(character);
    const currentWeight = await this.getUsedWeight(character);

    return {
      maxSlots,
      maxWeight,
      currentSlots,
      currentWeight,
      availableSlots: maxSlots - currentSlots,
      availableWeight: maxWeight - currentWeight,
    };
  }

  /**
   * Get current inventory slot usage
   */
  static getUsedSlots(character: ICharacter): number {
    return character.inventory.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate total weight of inventory
   * Note: Requires item database lookup to get weight per item
   */
  static async getUsedWeight(character: ICharacter): Promise<number> {
    let totalWeight = 0;

    for (const item of character.inventory) {
      // TODO: Replace with actual item database lookup when available
      // For now, assume average weight of 1 unit per item
      const itemWeight = 1; // await ItemDatabase.findById(item.itemId).weight
      totalWeight += itemWeight * item.quantity;
    }

    return totalWeight;
  }

  /**
   * Add items to inventory with capacity checks and overflow handling
   *
   * @param characterId - Character receiving items
   * @param items - Items to add
   * @param source - Source of items (determines overflow behavior)
   * @param session - Optional MongoDB session for transactions
   */
  static async addItems(
    characterId: string | mongoose.Types.ObjectId,
    items: Array<{ itemId: string; quantity: number }>,
    source: AddItemsSource,
    session?: ClientSession
  ): Promise<AddItemsResult> {
    // Validate inputs
    if (!items || items.length === 0) {
      return {
        success: true,
        itemsAdded: [],
        overflow: [],
        message: 'No items to add',
      };
    }

    // Validate all quantities are positive
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity ${item.quantity} for item ${item.itemId}`);
      }
    }

    const character = session
      ? await Character.findById(characterId).session(session)
      : await Character.findById(characterId);

    if (!character) {
      throw new Error('Character not found');
    }

    const capacity = await this.getCapacity(character);
    const itemsAdded: Array<{ itemId: string; quantity: number }> = [];
    const overflow: Array<{ itemId: string; quantity: number; reason: 'slots' | 'weight' }> = [];

    // Calculate total slots and weight needed
    let slotsNeeded = 0;
    let weightNeeded = 0;

    for (const item of items) {
      slotsNeeded += item.quantity;
      // TODO: Replace with actual item weight lookup
      const itemWeight = 1; // await ItemDatabase.findById(item.itemId).weight
      weightNeeded += itemWeight * item.quantity;
    }

    // Check if all items fit
    if (
      slotsNeeded <= capacity.availableSlots &&
      weightNeeded <= capacity.availableWeight
    ) {
      // All items fit - add them all
      for (const item of items) {
        this.addItemToInventory(character, item.itemId, item.quantity);
        itemsAdded.push(item);
      }

      if (session) {
        await character.save({ session });
      } else {
        await character.save();
      }

      logger.debug(
        `Added ${items.length} item types to character ${characterId} inventory`
      );

      return {
        success: true,
        itemsAdded,
        overflow: [],
        message: `Successfully added ${items.length} item type(s) to inventory`,
      };
    }

    // Partial fit - try to add what we can
    let currentSlots = capacity.currentSlots;
    let currentWeight = capacity.currentWeight;

    for (const item of items) {
      const itemWeight = 1; // TODO: Replace with actual item weight lookup
      const itemSlotsNeeded = item.quantity;
      const itemWeightNeeded = itemWeight * item.quantity;

      // Check if this item fits completely
      if (
        currentSlots + itemSlotsNeeded <= capacity.maxSlots &&
        currentWeight + itemWeightNeeded <= capacity.maxWeight
      ) {
        // Add all
        this.addItemToInventory(character, item.itemId, item.quantity);
        itemsAdded.push(item);
        currentSlots += itemSlotsNeeded;
        currentWeight += itemWeightNeeded;
      } else {
        // Determine limiting factor
        const slotsAvailable = capacity.maxSlots - currentSlots;
        const weightAvailable = capacity.maxWeight - currentWeight;

        if (slotsAvailable <= 0 || weightAvailable <= 0) {
          // No space at all
          const reason = slotsAvailable <= 0 ? 'slots' : 'weight';
          overflow.push({ itemId: item.itemId, quantity: item.quantity, reason });
        } else {
          // Partial fit
          const maxBySlots = slotsAvailable;
          const maxByWeight = Math.floor(weightAvailable / itemWeight);
          const canFit = Math.min(maxBySlots, maxByWeight, item.quantity);

          if (canFit > 0) {
            this.addItemToInventory(character, item.itemId, canFit);
            itemsAdded.push({ itemId: item.itemId, quantity: canFit });
            currentSlots += canFit;
            currentWeight += canFit * itemWeight;
          }

          const remaining = item.quantity - canFit;
          if (remaining > 0) {
            const reason = maxBySlots < maxByWeight ? 'slots' : 'weight';
            overflow.push({ itemId: item.itemId, quantity: remaining, reason });
          }
        }
      }
    }

    // Save character inventory changes
    if (session) {
      await character.save({ session });
    } else {
      await character.save();
    }

    // Handle overflow based on source
    if (overflow.length > 0) {
      await this.handleOverflow(
        characterId,
        overflow.map((o) => ({ itemId: o.itemId, quantity: o.quantity })),
        source,
        character.currentLocation,
        session
      );
    }

    const message =
      overflow.length > 0
        ? `Added ${itemsAdded.length} item type(s). ${overflow.length} item type(s) couldn't fit.`
        : `Successfully added ${itemsAdded.length} item type(s)`;

    logger.info(
      `Inventory add result for character ${characterId}: ${itemsAdded.length} added, ${overflow.length} overflow`
    );

    return {
      success: overflow.length === 0,
      itemsAdded,
      overflow,
      message,
    };
  }

  /**
   * Add item to character's inventory array
   * Handles stacking if item already exists
   */
  private static addItemToInventory(
    character: ICharacter,
    itemId: string,
    quantity: number
  ): void {
    const existing = character.inventory.find((i) => i.itemId === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      character.inventory.push({
        itemId,
        quantity,
        acquiredAt: new Date(),
      } as any);
    }
  }

  /**
   * Handle overflow items based on source
   * Combat/purchase → drop on ground
   * Quest/NPC → create pending reward
   */
  private static async handleOverflow(
    characterId: string | mongoose.Types.ObjectId,
    items: Array<{ itemId: string; quantity: number }>,
    source: AddItemsSource,
    locationId: string,
    session?: ClientSession
  ): Promise<void> {
    if (source.type === 'quest' || source.type === 'npc') {
      // NPCs hold items indefinitely
      const pendingReward = {
        characterId,
        source: source.type,
        sourceId: source.id || 'unknown',
        sourceName: source.name || `${source.type} reward`,
        items,
      };

      if (session) {
        await PendingReward.create([pendingReward], { session });
      } else {
        await PendingReward.create(pendingReward);
      }

      logger.info(
        `Created pending reward for character ${characterId}: ${items.length} item types from ${source.type}`
      );
    } else {
      // Drop on ground with 1-hour expiry
      const expiresAt = new Date(
        Date.now() + this.GROUND_ITEM_EXPIRY_HOURS * 60 * 60 * 1000
      );

      const groundItems = items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        locationId,
        droppedBy: characterId,
        expiresAt,
      }));

      if (session) {
        await GroundItem.insertMany(groundItems, { session });
      } else {
        await GroundItem.insertMany(groundItems);
      }

      logger.info(
        `Dropped ${items.length} item types on ground at ${locationId} for character ${characterId}`
      );
    }
  }

  /**
   * Claim pending rewards
   * Attempts to add all pending rewards to inventory
   * Returns what was successfully claimed
   */
  static async claimPendingRewards(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<ClaimPendingRewardsResult> {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const pendingRewards = await PendingReward.find({ characterId }).session(session);

      if (pendingRewards.length === 0) {
        await session.commitTransaction();
        session.endSession();

        return {
          claimed: [],
          stillPending: 0,
          message: 'No pending rewards to claim',
        };
      }

      const claimed: Array<{ itemId: string; quantity: number; source: string }> = [];
      const stillPending: string[] = [];

      for (const reward of pendingRewards) {
        // Try to add items
        const result = await this.addItems(
          characterId,
          reward.items,
          { type: reward.source, id: reward.sourceId, name: reward.sourceName },
          session
        );

        if (result.success) {
          // All items fit - delete pending reward
          await PendingReward.deleteOne({ _id: reward._id }).session(session);

          // Track claimed items
          for (const item of result.itemsAdded) {
            claimed.push({
              itemId: item.itemId,
              quantity: item.quantity,
              source: reward.sourceName,
            });
          }

          logger.debug(
            `Claimed pending reward ${reward._id} for character ${characterId}`
          );
        } else {
          // Still can't fit all items, keep in pending
          stillPending.push(reward._id.toString());
        }
      }

      await session.commitTransaction();
      session.endSession();

      const message =
        stillPending.length > 0
          ? `Claimed ${claimed.length} item(s). ${stillPending.length} reward(s) still pending.`
          : `Successfully claimed ${claimed.length} item(s) from ${pendingRewards.length} reward(s)`;

      logger.info(
        `Character ${characterId} claimed ${claimed.length} items, ${stillPending.length} rewards still pending`
      );

      return {
        claimed,
        stillPending: stillPending.length,
        message,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all ground items at a location
   */
  static async getGroundItemsAtLocation(locationId: string): Promise<any[]> {
    return GroundItem.find({
      locationId,
      expiresAt: { $gt: new Date() },
    }).sort({ droppedAt: -1 });
  }

  /**
   * Pick up ground item
   */
  static async pickupGroundItem(
    characterId: string | mongoose.Types.ObjectId,
    groundItemId: string
  ): Promise<AddItemsResult> {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const groundItem = await GroundItem.findById(groundItemId).session(session);

      if (!groundItem) {
        throw new Error('Ground item not found');
      }

      if (groundItem.expiresAt < new Date()) {
        throw new Error('Ground item has expired');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check if character is at the same location
      if (character.currentLocation !== groundItem.locationId) {
        throw new Error('Character not at item location');
      }

      // Try to add to inventory
      const result = await this.addItems(
        characterId,
        [{ itemId: groundItem.itemId, quantity: groundItem.quantity }],
        { type: 'other', name: 'ground pickup' },
        session
      );

      if (result.success) {
        // Item successfully added, delete ground item
        await GroundItem.deleteOne({ _id: groundItemId }).session(session);
      }

      await session.commitTransaction();
      session.endSession();

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all pending rewards for a character
   */
  static async getPendingRewards(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<any[]> {
    return PendingReward.find({ characterId }).sort({ createdAt: -1 });
  }

  /**
   * Remove items from inventory
   * Returns true if successful, false if insufficient quantity
   *
   * SECURITY: Uses atomic operations to prevent item duplication exploits.
   * The operation atomically checks quantity and decrements in one operation.
   */
  static async removeItems(
    characterId: string | mongoose.Types.ObjectId,
    itemId: string,
    quantity: number,
    session?: ClientSession
  ): Promise<boolean> {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    // ATOMIC OPERATION: First try to decrement the quantity atomically
    // This prevents race conditions where two concurrent requests could
    // both pass a quantity check and both remove items
    const decrementResult = await Character.findOneAndUpdate(
      {
        _id: characterId,
        'inventory.itemId': itemId,
        'inventory.quantity': { $gte: quantity }  // Atomic check: must have enough
      },
      {
        $inc: { 'inventory.$.quantity': -quantity }
      },
      {
        new: true,
        session: session || undefined
      }
    );

    if (!decrementResult) {
      // Either character not found, item not in inventory, or insufficient quantity
      return false;
    }

    // Clean up: If quantity is now 0, remove the item from inventory
    const updatedItem = decrementResult.inventory.find((i) => i.itemId === itemId);
    if (updatedItem && updatedItem.quantity === 0) {
      await Character.findOneAndUpdate(
        { _id: characterId },
        { $pull: { inventory: { itemId: itemId } } },
        { session: session || undefined }
      );
    }

    logger.debug(`Removed ${quantity}x ${itemId} from character ${characterId} inventory`);

    return true;
  }
}
