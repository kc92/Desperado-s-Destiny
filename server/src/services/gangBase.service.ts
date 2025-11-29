/**
 * Gang Base Service
 *
 * Handles all gang base operations with transaction safety
 */

import mongoose from 'mongoose';
import { GangBase, IGangBase } from '../models/GangBase.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { Item } from '../models/Item.model';
import {
  BaseTier,
  BaseLocationType,
  FacilityType,
  BaseUpgradeType,
  BASE_TIER_INFO,
  BASE_LOCATION_INFO,
  FACILITY_INFO,
  BASE_UPGRADE_INFO,
  GangPermission,
} from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

export class GangBaseService {
  /**
   * Establish a new gang base
   *
   * @param gangId - Gang establishing the base
   * @param characterId - Character establishing (must be leader)
   * @param tier - Starting tier (defaults to HIDEOUT)
   * @param locationType - Location type for the base
   * @param region - Region name
   * @param coordinates - Optional coordinates
   * @returns Created gang base
   */
  static async establishBase(
    gangId: string,
    characterId: string,
    tier: BaseTier = BaseTier.HIDEOUT,
    locationType: BaseLocationType,
    region: string,
    coordinates?: { x: number; y: number }
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can establish a base');
      }

      // Check if gang already has a base
      const existingBase = await GangBase.findByGangId(gangId);
      if (existingBase) {
        throw new Error('Gang already has a base');
      }

      const tierInfo = BASE_TIER_INFO[tier];
      const locationInfo = BASE_LOCATION_INFO[locationType];

      // Check if gang can afford the base
      if (!gang.canAfford(tierInfo.cost)) {
        throw new Error(`Insufficient gang bank funds. Need ${tierInfo.cost}, have ${gang.bank}`);
      }

      // Deduct cost from gang bank
      gang.bank -= tierInfo.cost;

      // Create base location
      const location = {
        region,
        coordinates,
        locationType,
        bonuses: locationInfo.bonuses,
      };

      // Create default facilities based on tier
      const facilities = [
        {
          facilityType: FacilityType.MEETING_ROOM,
          level: 1,
          isActive: true,
          installedAt: new Date(),
        },
        {
          facilityType: FacilityType.STORAGE,
          level: 1,
          isActive: true,
          installedAt: new Date(),
        },
      ];

      // Add armory for tier 2+
      if (tier >= BaseTier.SAFEHOUSE) {
        facilities.push({
          facilityType: FacilityType.ARMORY,
          level: 1,
          isActive: true,
          installedAt: new Date(),
        });
      }

      // Create defense system
      const defense = {
        guards: [],
        traps: [],
        alarmLevel: 0,
        escapeRoutes: 1,
        overallDefense: tierInfo.defense,
        raidHistory: 0,
      };

      // Create storage
      const storage = {
        items: [],
        capacity: tierInfo.storageCapacity,
        currentUsage: 0,
        categories: {
          weapons: [],
          supplies: [],
          valuables: [],
          materials: [],
        },
      };

      // Create the base
      const base = await GangBase.create(
        [
          {
            gangId: gang._id,
            tier,
            tierName: tierInfo.name,
            location,
            storage,
            facilities,
            upgrades: [],
            defense,
            capacity: tierInfo.capacity,
            currentOccupants: gang.members.length,
            isActive: true,
          },
        ],
        { session }
      );

      // Link base to gang
      gang.baseId = base[0]._id as mongoose.Types.ObjectId;
      await gang.save({ session });

      await session.commitTransaction();

      logger.info(
        `Gang base established: ${tierInfo.name} for gang ${gang.name} at ${locationInfo.name}`
      );

      return base[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error establishing gang base:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang base details
   *
   * @param gangId - Gang ID
   * @returns Gang base
   */
  static async getBase(gangId: string): Promise<IGangBase> {
    const base = await GangBase.findByGangId(gangId);
    if (!base) {
      throw new Error('Gang base not found');
    }
    return base;
  }

  /**
   * Upgrade base tier
   *
   * @param gangId - Gang ID
   * @param characterId - Character upgrading (must be leader)
   * @returns Updated gang base
   */
  static async upgradeTier(gangId: string, characterId: string): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can upgrade the base');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      if (!base.canUpgradeTier()) {
        throw new Error('Base is already at maximum tier');
      }

      const upgradeCost = base.getUpgradeTierCost();

      if (!gang.canAfford(upgradeCost)) {
        throw new Error(`Insufficient gang bank funds. Need ${upgradeCost}, have ${gang.bank}`);
      }

      // Deduct cost
      gang.bank -= upgradeCost;
      await gang.save({ session });

      // Upgrade tier
      base.upgradeTier();
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Gang base upgraded to tier ${base.tier} for gang ${gang.name}`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error upgrading base tier:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add facility to base
   *
   * @param gangId - Gang ID
   * @param characterId - Character adding facility (must be leader)
   * @param facilityType - Type of facility to add
   * @returns Updated gang base
   */
  static async addFacility(
    gangId: string,
    characterId: string,
    facilityType: FacilityType
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can add facilities');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const facilityInfo = FACILITY_INFO[facilityType];

      // Check tier requirement
      if (base.tier < facilityInfo.minTier) {
        throw new Error(
          `Base must be tier ${facilityInfo.minTier} or higher to add ${facilityInfo.name}`
        );
      }

      // Check if facility requires another facility
      if ('requires' in facilityInfo && facilityInfo.requires && typeof facilityInfo.requires === 'string') {
        const requiredFacility = facilityInfo.requires as FacilityType;
        if (!base.hasFacility(requiredFacility)) {
          const requiredInfo = FACILITY_INFO[requiredFacility];
          throw new Error(`Requires ${requiredInfo.name} to be built first`);
        }
      }

      if (!base.canAddFacility(facilityType)) {
        throw new Error('Cannot add facility');
      }

      const cost = facilityInfo.cost;

      if (!gang.canAfford(cost)) {
        throw new Error(`Insufficient gang bank funds. Need ${cost}, have ${gang.bank}`);
      }

      // Deduct cost
      gang.bank -= cost;
      await gang.save({ session });

      // Add facility
      base.addFacility(facilityType);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Facility ${facilityInfo.name} added to gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error adding facility:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add upgrade to base
   *
   * @param gangId - Gang ID
   * @param characterId - Character adding upgrade (must be leader)
   * @param upgradeType - Type of upgrade to add
   * @returns Updated gang base
   */
  static async addUpgrade(
    gangId: string,
    characterId: string,
    upgradeType: BaseUpgradeType
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can add upgrades');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const upgradeInfo = BASE_UPGRADE_INFO[upgradeType];

      // Check tier requirement
      if (base.tier < upgradeInfo.minTier) {
        throw new Error(
          `Base must be tier ${upgradeInfo.minTier} or higher to add ${upgradeInfo.name}`
        );
      }

      // Check if upgrade requires a facility
      if ('requires' in upgradeInfo && upgradeInfo.requires && typeof upgradeInfo.requires === 'string') {
        const requiredFacility = upgradeInfo.requires as FacilityType;
        if (!base.hasFacility(requiredFacility)) {
          const facilityInfo = FACILITY_INFO[requiredFacility];
          throw new Error(`Requires ${facilityInfo.name} to be built first`);
        }
      }

      if (!base.canAddUpgrade(upgradeType)) {
        throw new Error('Cannot add upgrade');
      }

      const cost = upgradeInfo.cost;

      if (!gang.canAfford(cost)) {
        throw new Error(`Insufficient gang bank funds. Need ${cost}, have ${gang.bank}`);
      }

      // Deduct cost
      gang.bank -= cost;
      await gang.save({ session });

      // Add upgrade
      base.addUpgrade(upgradeType);

      // Apply upgrade benefits
      if (upgradeType === BaseUpgradeType.SECRET_EXIT) {
        base.defense.escapeRoutes += 1;
      } else if (upgradeType === BaseUpgradeType.REINFORCED_VAULT) {
        base.storage.capacity = Math.floor(base.storage.capacity * 2);
      }

      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Upgrade ${upgradeInfo.name} added to gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error adding upgrade:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deposit item to base storage
   *
   * @param gangId - Gang ID
   * @param characterId - Character depositing item
   * @param itemId - Item ID to deposit
   * @param quantity - Quantity to deposit
   * @returns Updated gang base
   */
  static async depositItem(
    gangId: string,
    characterId: string,
    itemId: string,
    quantity: number
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isMember(characterId)) {
        throw new Error('Character is not a member of this gang');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const item = await Item.findByItemId(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Check if character has the item in inventory
      const characterItem = character.inventory.find((i) => i.itemId === itemId);
      if (!characterItem || characterItem.quantity < quantity) {
        throw new Error('Insufficient items in inventory');
      }

      // Check storage capacity
      const newUsage = base.calculateStorageUsage() + quantity;
      if (newUsage > base.storage.capacity) {
        throw new Error('Insufficient storage capacity');
      }

      // Remove from character inventory
      characterItem.quantity -= quantity;
      if (characterItem.quantity === 0) {
        character.inventory = character.inventory.filter((i) => i.itemId !== itemId);
      }
      await character.save({ session });

      // Add to base storage
      base.addStorageItem(itemId, item.name, quantity, character._id as mongoose.Types.ObjectId);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(
        `${quantity}x ${item.name} deposited to gang ${gang.name} base by ${character.name}`
      );

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error depositing item:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Withdraw item from base storage
   *
   * @param gangId - Gang ID
   * @param characterId - Character withdrawing item (must be officer+)
   * @param itemId - Item ID to withdraw
   * @param quantity - Quantity to withdraw
   * @returns Updated gang base
   */
  static async withdrawItem(
    gangId: string,
    characterId: string,
    itemId: string,
    quantity: number
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isOfficer(characterId)) {
        throw new Error('Only officers and leaders can withdraw from storage');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const item = await Item.findByItemId(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Check if base has the item
      const storageItem = base.getStorageItem(itemId);
      if (!storageItem || storageItem.quantity < quantity) {
        throw new Error('Insufficient items in storage');
      }

      // Remove from base storage
      base.removeStorageItem(itemId, quantity);
      await base.save({ session });

      // Add to character inventory
      const characterItem = character.inventory.find((i) => i.itemId === itemId);
      if (characterItem) {
        characterItem.quantity += quantity;
      } else {
        character.inventory.push({
          itemId,
          quantity,
          acquiredAt: new Date(),
        });
      }
      await character.save({ session });

      await session.commitTransaction();

      logger.info(
        `${quantity}x ${item.name} withdrawn from gang ${gang.name} base by ${character.name}`
      );

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error withdrawing item:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Hire a guard for base defense
   *
   * @param gangId - Gang ID
   * @param characterId - Character hiring guard (must be leader)
   * @param guardName - Name of the guard
   * @param level - Guard level
   * @param combatSkill - Guard combat skill
   * @returns Updated gang base
   */
  static async hireGuard(
    gangId: string,
    characterId: string,
    guardName: string,
    level: number,
    combatSkill: number
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can hire guards');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const hireCost = level * 50;

      if (!gang.canAfford(hireCost)) {
        throw new Error(`Insufficient gang bank funds. Need ${hireCost}, have ${gang.bank}`);
      }

      // Deduct hire cost
      gang.bank -= hireCost;
      await gang.save({ session });

      // Hire guard
      base.hireGuard(guardName, level, combatSkill);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Guard ${guardName} hired for gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error hiring guard:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fire a guard
   *
   * @param gangId - Gang ID
   * @param characterId - Character firing guard (must be leader)
   * @param guardId - Guard ID to fire
   * @returns Updated gang base
   */
  static async fireGuard(
    gangId: string,
    characterId: string,
    guardId: string
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can fire guards');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      // Fire guard
      base.fireGuard(guardId);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Guard ${guardId} fired from gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error firing guard:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Install a trap
   *
   * @param gangId - Gang ID
   * @param characterId - Character installing trap (must be leader)
   * @param trapType - Type of trap
   * @param effectiveness - Trap effectiveness (1-100)
   * @returns Updated gang base
   */
  static async installTrap(
    gangId: string,
    characterId: string,
    trapType: 'alarm' | 'damage' | 'slow' | 'capture',
    effectiveness: number
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can install traps');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      const trapCost = Math.floor(effectiveness * 10);

      if (!gang.canAfford(trapCost)) {
        throw new Error(`Insufficient gang bank funds. Need ${trapCost}, have ${gang.bank}`);
      }

      // Deduct cost
      gang.bank -= trapCost;
      await gang.save({ session });

      // Install trap
      base.installTrap(trapType, effectiveness, trapCost);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`${trapType} trap installed at gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error installing trap:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Remove a trap
   *
   * @param gangId - Gang ID
   * @param characterId - Character removing trap (must be leader)
   * @param trapId - Trap ID to remove
   * @returns Updated gang base
   */
  static async removeTrap(
    gangId: string,
    characterId: string,
    trapId: string
  ): Promise<IGangBase> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can remove traps');
      }

      const base = await GangBase.findByGangId(gangId);
      if (!base) {
        throw new Error('Gang base not found');
      }

      // Remove trap
      base.removeTrap(trapId);
      await base.save({ session });

      await session.commitTransaction();

      logger.info(`Trap ${trapId} removed from gang ${gang.name} base`);

      return base;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error removing trap:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get base storage details
   *
   * @param gangId - Gang ID
   * @returns Storage information
   */
  static async getStorage(gangId: string): Promise<{
    items: any[];
    capacity: number;
    currentUsage: number;
    categories: any;
  }> {
    const base = await GangBase.findByGangId(gangId);
    if (!base) {
      throw new Error('Gang base not found');
    }

    return {
      items: base.storage.items,
      capacity: base.storage.capacity,
      currentUsage: base.storage.currentUsage,
      categories: base.storage.categories,
    };
  }

  /**
   * Get all active bases (for admin/leaderboard)
   *
   * @returns All active bases
   */
  static async getAllActiveBases(): Promise<IGangBase[]> {
    return GangBase.findActiveBases();
  }
}
