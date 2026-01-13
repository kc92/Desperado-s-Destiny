/**
 * Bounty Service
 *
 * Handles bounty creation, collection, wanted levels, and bounty hunter encounters
 */

import mongoose from 'mongoose';
import { Bounty, IBounty, WantedLevel, IWantedLevel } from '../models/Bounty.model';
import { Character, ICharacter } from '../models/Character.model';
import {
  BountyType,
  BountyStatus,
  BountyCollectibleBy,
  BountyFaction,
  WantedRank,
  CRIME_BOUNTY_AMOUNTS,
  WANTED_RANK_THRESHOLDS,
  BOUNTY_HUNTER_SPAWN_RATES,
  BOUNTY_HUNTER_SCALING,
  BountyBoardEntry,
} from '@desperados/shared';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class BountyService {
  /**
   * Add a faction bounty when a crime is witnessed
   */
  static async addCrimeBounty(
    targetId: string,
    crimeName: string,
    faction: BountyFaction,
    location?: string
  ): Promise<{ bounty: IBounty; wantedLevel: IWantedLevel }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const target = await Character.findById(targetId).session(session);
      if (!target) {
        throw new Error('Target character not found');
      }

      // Get bounty amount for this crime type
      const crimeKey = crimeName.toUpperCase().replace(/\s+/g, '_');
      const crimeConfig = CRIME_BOUNTY_AMOUNTS[crimeKey];

      if (!crimeConfig) {
        // Default bounty for unknown crimes
        logger.warn(`Unknown crime type for bounty: ${crimeName}, using default`);
      }

      const min = crimeConfig?.min || 25;
      const max = crimeConfig?.max || 100;
      const amount = SecureRNG.range(min, max);

      // Create bounty
      const bounty = new Bounty({
        targetId: target._id,
        targetName: target.name,
        bountyType: BountyType.FACTION,
        issuerFaction: faction,
        amount,
        reason: `Crime: ${crimeName}`,
        crimes: [crimeName],
        status: BountyStatus.ACTIVE,
        lastSeenLocation: location || target.currentLocation,
        collectibleBy: BountyCollectibleBy.ANYONE,
        createdAt: new Date(),
      });

      await bounty.save({ session });

      // Update wanted level
      const wantedLevel = await this.updateWantedLevel(targetId, session);

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Crime bounty added: ${amount} gold on ${target.name} by ${faction} for ${crimeName}`
      );

      return { bounty, wantedLevel };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error adding crime bounty:', error);
      throw error;
    }
  }

  /**
   * Player places bounty on another player
   */
  static async placeBounty(
    issuerId: string,
    targetId: string,
    amount: number,
    reason?: string
  ): Promise<IBounty> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const issuer = await Character.findById(issuerId).session(session);
      const target = await Character.findById(targetId).session(session);

      if (!issuer) {
        throw new Error('Issuer character not found');
      }
      if (!target) {
        throw new Error('Target character not found');
      }

      // Can't place bounty on yourself
      if (issuerId === targetId) {
        throw new Error('Cannot place bounty on yourself');
      }

      // Minimum bounty is 100 dollars
      if (amount < 100) {
        throw new Error('Minimum bounty is 100 dollars');
      }

      // Check if issuer has enough dollars
      const issuerBalance = issuer.dollars ?? issuer.gold ?? 0;
      if (issuerBalance < amount) {
        throw new Error(`Insufficient dollars. Need ${amount} dollars, have ${issuerBalance}.`);
      }

      // Deduct dollars from issuer
      await DollarService.deductDollars(
        issuer._id as any,
        amount,
        TransactionSource.BOUNTY_PLACED,
        {
          targetCharacterId: target._id,
          targetName: target.name,
          description: `Placed ${amount} dollar bounty on ${target.name}`,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Create bounty
      const bounty = new Bounty({
        targetId: target._id,
        targetName: target.name,
        bountyType: BountyType.PLAYER,
        issuerId: issuer._id,
        issuerName: issuer.name,
        amount,
        reason: reason || `Bounty placed by ${issuer.name}`,
        crimes: [],
        status: BountyStatus.ACTIVE,
        lastSeenLocation: target.currentLocation,
        collectibleBy: BountyCollectibleBy.ANYONE,
        createdAt: new Date(),
        // Player bounties expire after 7 days
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await bounty.save({ session });

      // Update wanted level
      await this.updateWantedLevel(targetId, session);

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Player bounty placed: ${amount} dollars on ${target.name} by ${issuer.name}`
      );

      return bounty;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error placing bounty:', error);
      throw error;
    }
  }

  /**
   * Collect a bounty by capturing/killing the target
   */
  static async collectBounty(
    hunterId: string,
    bountyId: string
  ): Promise<{ goldEarned: number; message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hunter = await Character.findById(hunterId).session(session);
      const bounty = await Bounty.findById(bountyId).session(session);

      if (!hunter) {
        throw new Error('Hunter character not found');
      }
      if (!bounty) {
        throw new Error('Bounty not found');
      }

      // Check if bounty is still active
      if (!bounty.isActive()) {
        throw new Error('Bounty is no longer active');
      }

      // Can't collect bounty on yourself
      if (hunterId === bounty.targetId.toString()) {
        throw new Error('Cannot collect bounty on yourself');
      }

      // Check if hunter can collect this bounty
      const characterFaction = hunter.faction;
      if (!bounty.canBeCollectedBy(hunterId, characterFaction)) {
        throw new Error('You are not authorized to collect this bounty');
      }

      // Get target and verify they were defeated
      const target = await Character.findById(bounty.targetId).session(session);
      if (!target) {
        throw new Error('Target character not found');
      }

      const isDefeated = target.isDead || target.isJailed || target.isKnockedOut;
      if (!isDefeated) {
        throw new Error('Cannot collect bounty - target has not been defeated');
      }

      // Award dollars to hunter
      await DollarService.addDollars(
        hunter._id as any,
        bounty.amount,
        TransactionSource.BOUNTY_REWARD,
        {
          bountyId: bounty._id,
          targetCharacterId: bounty.targetId,
          targetName: bounty.targetName,
          description: `Collected ${bounty.amount} dollar bounty on ${bounty.targetName}`,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Mark bounty as collected
      bounty.status = BountyStatus.COLLECTED;
      bounty.collectedBy = hunter._id as any;
      bounty.collectedAt = new Date();
      await bounty.save({ session });

      // Update wanted level for target
      await this.updateWantedLevel(bounty.targetId.toString(), session);

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Bounty collected: ${hunter.name} earned ${bounty.amount} dollars for capturing ${bounty.targetName}`
      );

      return {
        goldEarned: bounty.amount,
        message: `You brought ${bounty.targetName} to justice and earned ${bounty.amount} dollars!`,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error collecting bounty:', error);
      throw error;
    }
  }

  /**
   * Get wanted level for a character
   */
  static async getWantedLevel(characterId: string): Promise<IWantedLevel> {
    try {
      const character = await Character.findById(characterId).lean();
      if (!character) {
        throw new Error('Character not found');
      }

      // Get or create wanted level
      let wantedLevel = await WantedLevel.findOne({ characterId });

      if (!wantedLevel) {
        wantedLevel = new WantedLevel({
          characterId: character._id,
          characterName: character.name,
          settlerAlliance: 0,
          nahiCoalition: 0,
          frontera: 0,
          totalBounty: 0,
          wantedRank: WantedRank.UNKNOWN,
          activeBounties: 0,
        });
        await wantedLevel.save();
      }

      return wantedLevel;
    } catch (error) {
      logger.error('Error getting wanted level:', error);
      throw error;
    }
  }

  /**
   * Get all active bounties for a character
   */
  static async getActiveBounties(characterId: string): Promise<IBounty[]> {
    try {
      return await Bounty.find({
        targetId: new mongoose.Types.ObjectId(characterId),
        status: BountyStatus.ACTIVE,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      }).sort({ amount: -1 }).lean() as unknown as IBounty[];
    } catch (error) {
      logger.error('Error getting active bounties:', error);
      throw error;
    }
  }

  /**
   * Get bounty board (available bounties to hunt)
   */
  static async getBountyBoard(
    location?: string,
    limit: number = 50
  ): Promise<BountyBoardEntry[]> {
    try {
      const bounties = await Bounty.find({
        status: BountyStatus.ACTIVE,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      })
        .sort({ amount: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      if (bounties.length === 0) {
        return [];
      }

      // BATCH QUERY FIX: Fetch all targets and wanted levels in two queries instead of N+1
      const targetIds = bounties.map(b => b.targetId);

      // Batch fetch characters
      const targets = await Character.find({ _id: { $in: targetIds } })
        .select('_id level')
        .lean();
      const targetMap = new Map(targets.map(t => [t._id.toString(), t.level]));

      // Batch fetch wanted levels
      const wantedLevels = await WantedLevel.find({ characterId: { $in: targetIds } }).lean();
      const wantedMap = new Map(wantedLevels.map(w => [w.characterId.toString(), w.wantedRank]));

      // Enrich bounties with cached data
      const entries: BountyBoardEntry[] = bounties.map(bounty => ({
        id: bounty._id.toString(),
        targetId: bounty.targetId.toString(),
        targetName: bounty.targetName,
        targetLevel: targetMap.get(bounty.targetId.toString()) || 1,
        amount: bounty.amount,
        reason: bounty.reason,
        issuerFaction: bounty.issuerFaction,
        wantedRank: wantedMap.get(bounty.targetId.toString()) || WantedRank.UNKNOWN,
        lastSeenLocation: bounty.lastSeenLocation,
        crimes: bounty.crimes,
        createdAt: bounty.createdAt,
        expiresAt: bounty.expiresAt,
      }));

      return entries;
    } catch (error) {
      logger.error('Error getting bounty board:', error);
      throw error;
    }
  }

  /**
   * Update wanted level for a character (recalculates from all bounties)
   */
  static async updateWantedLevel(
    characterId: string,
    session?: mongoose.ClientSession
  ): Promise<IWantedLevel> {
    try {
      const character = await Character.findById(characterId).lean();
      if (!character) {
        throw new Error('Character not found');
      }

      // Get all active bounties
      const bounties = await Bounty.find({
        targetId: new mongoose.Types.ObjectId(characterId),
        status: BountyStatus.ACTIVE,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      }).lean();

      // Calculate bounty by faction
      let settlerAlliance = 0;
      let nahiCoalition = 0;
      let frontera = 0;

      for (const bounty of bounties) {
        if (bounty.bountyType === BountyType.FACTION && bounty.issuerFaction) {
          switch (bounty.issuerFaction) {
            case BountyFaction.SETTLER_ALLIANCE:
              settlerAlliance += bounty.amount;
              break;
            case BountyFaction.NAHI_COALITION:
              nahiCoalition += bounty.amount;
              break;
            case BountyFaction.FRONTERA:
              frontera += bounty.amount;
              break;
          }
        } else if (bounty.bountyType === BountyType.PLAYER) {
          // Player bounties count toward all factions
          settlerAlliance += bounty.amount;
        }
      }

      // Update or create wanted level
      let wantedLevel = await WantedLevel.findOne({ characterId });

      if (!wantedLevel) {
        wantedLevel = new WantedLevel({
          characterId: character._id,
          characterName: character.name,
        });
      }

      wantedLevel.settlerAlliance = settlerAlliance;
      wantedLevel.nahiCoalition = nahiCoalition;
      wantedLevel.frontera = frontera;
      wantedLevel.activeBounties = bounties.length;
      wantedLevel.lastSeenLocation = character.currentLocation;
      wantedLevel.recalculate();

      if (bounties.length > 0) {
        wantedLevel.lastCrimeDate = new Date();
      }

      await wantedLevel.save({ session });

      return wantedLevel;
    } catch (error) {
      logger.error('Error updating wanted level:', error);
      throw error;
    }
  }

  /**
   * Check if bounty hunter should spawn for a character
   * @deprecated Use BountyHunterService.checkHunterSpawn instead
   */
  static shouldSpawnBountyHunter(wantedRank: WantedRank): boolean {
    const spawnRate = BOUNTY_HUNTER_SPAWN_RATES[wantedRank];
    return SecureRNG.chance(spawnRate);
  }

  /**
   * Get bounty hunter encounter data for a character
   * @deprecated Use BountyHunterService.checkHunterSpawn instead
   */
  static async getBountyHunterEncounter(characterId: string): Promise<{
    shouldSpawn: boolean;
    hunterLevel?: number;
    hunterCount?: number;
    payOffAmount?: number;
  }> {
    try {
      const wantedLevel = await this.getWantedLevel(characterId);

      // Check if should spawn
      const shouldSpawn = this.shouldSpawnBountyHunter(wantedLevel.wantedRank);

      if (!shouldSpawn) {
        return { shouldSpawn: false };
      }

      // Get hunter scaling
      const scaling = BOUNTY_HUNTER_SCALING[wantedLevel.wantedRank];

      // Pay-off amount is 50% of total bounty
      const payOffAmount = Math.floor(wantedLevel.totalBounty * 0.5);

      return {
        shouldSpawn: true,
        hunterLevel: scaling.level,
        hunterCount: scaling.count,
        payOffAmount,
      };
    } catch (error) {
      logger.error('Error getting bounty hunter encounter:', error);
      throw error;
    }
  }

  /**
   * Decay bounties over time (background job)
   * Reduces faction bounties by 10% every 24 hours
   */
  static async decayBounties(): Promise<{
    bountiesDecayed: number;
    totalReduced: number;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find faction bounties older than 24 hours
      const bounties = await Bounty.find({
        status: BountyStatus.ACTIVE,
        bountyType: BountyType.FACTION,
        createdAt: { $lte: oneDayAgo },
        amount: { $gt: 10 }, // Don't decay below 10 gold
      });

      let bountiesDecayed = 0;
      let totalReduced = 0;
      const affectedTargetIds = new Set<string>();

      // Process bounties and collect saves
      const saveOperations: Promise<any>[] = [];

      for (const bounty of bounties) {
        const reduction = Math.floor(bounty.amount * 0.1);
        if (reduction > 0) {
          bounty.amount -= reduction;
          totalReduced += reduction;

          // If bounty is now too small, cancel it
          if (bounty.amount < 10) {
            bounty.status = BountyStatus.CANCELLED;
          }

          saveOperations.push(bounty.save());
          bountiesDecayed++;

          // Track unique target IDs for batch wanted level update
          affectedTargetIds.add(bounty.targetId.toString());
        }
      }

      // Execute all bounty saves in parallel
      if (saveOperations.length > 0) {
        await Promise.all(saveOperations);
      }

      // BATCH UPDATE: Update wanted levels for all affected targets
      // Instead of N individual updateWantedLevel calls, batch the updates
      const wantedLevelUpdates = Array.from(affectedTargetIds).map(targetId =>
        this.updateWantedLevel(targetId).catch(err => {
          logger.warn(`Failed to update wanted level for ${targetId}:`, err);
        })
      );

      await Promise.all(wantedLevelUpdates);

      logger.info(
        `Bounty decay: ${bountiesDecayed} bounties decayed, ${totalReduced} gold reduced`
      );

      return { bountiesDecayed, totalReduced };
    } catch (error) {
      logger.error('Error decaying bounties:', error);
      throw error;
    }
  }

  /**
   * Expire old bounties (background job)
   */
  static async expireOldBounties(): Promise<number> {
    try {
      const result = await Bounty.updateMany(
        {
          status: BountyStatus.ACTIVE,
          expiresAt: { $lte: new Date() },
        },
        {
          $set: { status: BountyStatus.EXPIRED },
        }
      );

      const expired = result.modifiedCount || 0;

      if (expired > 0) {
        logger.info(`Expired ${expired} old bounties`);
      }

      return expired;
    } catch (error) {
      logger.error('Error expiring bounties:', error);
      throw error;
    }
  }

  /**
   * Get wanted level leaderboard (most wanted criminals)
   */
  static async getMostWanted(limit: number = 10): Promise<IWantedLevel[]> {
    try {
      return await WantedLevel.find({
        totalBounty: { $gt: 0 },
      })
        .sort({ totalBounty: -1 })
        .limit(limit)
        .lean() as unknown as IWantedLevel[];
    } catch (error) {
      logger.error('Error getting most wanted:', error);
      throw error;
    }
  }

  /**
   * Cancel all bounties for a character (admin function)
   */
  static async cancelBounties(characterId: string): Promise<number> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await Bounty.updateMany(
        {
          targetId: new mongoose.Types.ObjectId(characterId),
          status: BountyStatus.ACTIVE,
        },
        {
          $set: { status: BountyStatus.CANCELLED },
        },
        { session }
      );

      // Update wanted level
      await this.updateWantedLevel(characterId, session);

      await session.commitTransaction();
      session.endSession();

      const cancelled = result.modifiedCount || 0;
      logger.info(`Cancelled ${cancelled} bounties for character ${characterId}`);

      return cancelled;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error cancelling bounties:', error);
      throw error;
    }
  }
}
