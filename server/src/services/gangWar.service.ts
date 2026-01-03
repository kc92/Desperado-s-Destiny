/**
 * Gang War Service
 *
 * Handles gang war declarations, contributions, and resolution
 * All operations are transaction-safe
 */

import mongoose from 'mongoose';
import { GangWar, IGangWar } from '../models/GangWar.model';
import { GangWarStatus as WarStatus, WarLeagueTier } from '@desperados/shared';
import { Territory, ITerritory } from '../models/Territory.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { WarScheduleService } from './warSchedule.service';
import { GangPowerRating } from '../models/GangPowerRating.model';
import { WorldEventType, EventStatus } from '../models/WorldEvent.model';
import { WorldEventService } from './worldEvent.service';
import logger from '../utils/logger';
import { getSocketIO } from '../config/socket';
import { SkillService } from './skill.service';
import { CharacterProgressionService } from './characterProgression.service';

export class GangWarService {
  /**
   * Declare war on a territory
   * Transaction-safe: deducts gang bank gold and creates war record atomically
   *
   * @param gangId - Gang declaring war
   * @param characterId - Character (must be gang leader)
   * @param territoryId - Territory to attack
   * @param funding - Initial war funding from gang bank (min 1000)
   * @returns Created war record
   */
  static async declareWar(
    gangId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    territoryId: string,
    funding: number
  ): Promise<IGangWar> {
    if (funding < 1000) {
      throw new Error('Minimum war funding is 1000 gold');
    }

    // Phase 2.1: Check declaration window eligibility
    const eligibility = await WarScheduleService.canGangDeclareWar(gangId);
    if (!eligibility.eligible) {
      throw new Error(`Cannot declare war: ${eligibility.reasons.join(', ')}`);
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (gang.leaderId.toString() !== characterId.toString()) {
        throw new Error('Only gang leader can declare war');
      }

      if (!gang.hasWarChest()) {
        throw new Error('Gang must have War Chest upgrade to declare war');
      }

      if (gang.bank < funding) {
        throw new Error(`Insufficient gang bank balance. Have ${gang.bank}, need ${funding}`);
      }

      // Check war cooldown
      if (gang.warCooldownUntil && gang.warCooldownUntil > new Date()) {
        throw new Error(`Gang is on war cooldown until ${gang.warCooldownUntil.toISOString()}`);
      }

      const territory = await Territory.findOne({ id: territoryId }).session(session);
      if (!territory) {
        throw new Error('Territory not found');
      }

      const existingWar = await GangWar.findOne({
        territoryId,
        status: WarStatus.ACTIVE,
      }).session(session);

      if (existingWar) {
        throw new Error('Territory is already under siege');
      }

      const gangActiveWars = await GangWar.find({
        $or: [
          { attackerGangId: gangId },
          { defenderGangId: gangId },
        ],
        status: WarStatus.ACTIVE,
      }).session(session);

      if (gangActiveWars.length > 0) {
        throw new Error('Gang is already involved in an active war');
      }

      gang.bank -= funding;
      await gang.save({ session });

      const declaredAt = new Date();
      const resolveAt = new Date(declaredAt.getTime() + 24 * 60 * 60 * 1000);

      // Phase 2.1: Get schedule and season info
      const schedule = await WarScheduleService.getCurrentWeekSchedule();
      const season = await WarScheduleService.getOrCreateCurrentSeason();

      // Get or calculate power rating for tier assignment
      let powerRating = await GangPowerRating.findByGang(gangId);
      if (!powerRating) {
        powerRating = await GangPowerRating.calculateAndCache(gangId);
      }

      const war = await GangWar.create([{
        attackerGangId: gang._id,
        attackerGangName: gang.name,
        attackerGangTag: gang.tag || '',
        defenderGangId: territory.controllingGangId,
        defenderGangName: territory.controllingGangId ?
          (await Gang.findById(territory.controllingGangId).session(session))?.name || null :
          null,
        defenderGangTag: territory.controllingGangId ?
          (await Gang.findById(territory.controllingGangId).session(session))?.tag || '' :
          '',
        territoryId,
        status: WarStatus.DECLARED,
        declaredAt,
        startsAt: schedule.resolutionWindowStart, // War starts when resolution window opens
        resolveAt,
        attackerFunding: funding,
        defenderFunding: 0,
        capturePoints: 100,
        attackerContributions: [],
        defenderContributions: [],

        // Phase 2.1: Weekly War Schedule fields
        weekScheduleId: schedule._id,
        seasonId: season._id,
        tier: powerRating.tier,
        isAutoTournament: false,

        warLog: [{
          timestamp: declaredAt,
          event: 'WAR_DECLARED',
          data: {
            attackerGang: gang.name,
            defenderGang: territory.controllingGangId ?
              (await Gang.findById(territory.controllingGangId).session(session))?.name :
              'Unclaimed',
            territory: territory.name,
            initialFunding: funding,
            tier: powerRating.tier,
          },
        }],
        resolvedAt: null,
      }], { session });

      // Register war with schedule
      await WarScheduleService.registerWar(
        war[0]._id as mongoose.Types.ObjectId,
        gangId,
        territory.controllingGangId as mongoose.Types.ObjectId
      );

      await session.commitTransaction();

      logger.info(
        `War declared: ${gang.name} vs ${war[0].defenderGangName || 'Unclaimed'} ` +
        `for ${territory.name} with ${funding} gold`
      );

      const io = getSocketIO();
      if (io) {
        io.emit('territory:war_declared', {
          warId: war[0]._id,
          territory: territoryId,
          attacker: gang.name,
          defender: war[0].defenderGangName || 'Unclaimed',
          funding,
        });
      }

      return war[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error declaring war:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Contribute gold to an active war
   * Transaction-safe: deducts character gold and updates war atomically
   *
   * @param warId - War to contribute to
   * @param characterId - Character making contribution
   * @param amount - Gold amount to contribute
   * @returns Updated war record
   */
  static async contributeToWar(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    amount: number
  ): Promise<IGangWar> {
    if (amount <= 0) {
      throw new Error('Contribution amount must be positive');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const war = await GangWar.findById(warId).session(session);
      if (!war) {
        throw new Error('War not found');
      }

      if (war.status !== WarStatus.ACTIVE) {
        throw new Error('War is not active');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (character.gold < amount) {
        throw new Error(`Insufficient gold. Have ${character.gold}, need ${amount}`);
      }

      const gang = await Gang.findByMember(characterId);
      if (!gang) {
        throw new Error('Character is not in a gang');
      }

      let side: 'attacker' | 'defender';

      if (gang._id.toString() === war.attackerGangId.toString()) {
        side = 'attacker';
      } else if (war.defenderGangId && gang._id.toString() === war.defenderGangId.toString()) {
        side = 'defender';
      } else {
        throw new Error('Your gang is not involved in this war');
      }

      const { GoldService } = await import('./gold.service');
      await GoldService.deductGold(
        characterId,
        amount,
        TransactionSource.WAR_CONTRIBUTION,
        {
          warId: war._id,
          territoryId: war.territoryId,
          side,
        },
        session
      );

      war.contribute(character._id as mongoose.Types.ObjectId, character.name, side, amount);

      await war.save({ session });

      await session.commitTransaction();

      logger.info(
        `War contribution: ${character.name} contributed ${amount} gold to ${side} in war ${war._id}`
      );

      const io = getSocketIO();
      if (io) {
        io.emit('territory:war_contributed', {
          warId: war._id,
          territory: war.territoryId,
          contributor: character.name,
          side,
          amount,
          newCapturePoints: war.capturePoints,
        });
      }

      return war;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error contributing to war:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Resolve war and update territory ownership
   * Transaction-safe: updates territory, gangs, and war status atomically
   *
   * @param warId - War to resolve
   * @returns Resolved war and updated territory
   */
  static async resolveWar(
    warId: mongoose.Types.ObjectId
  ): Promise<{ war: IGangWar; territory: ITerritory }> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const war = await GangWar.findById(warId).session(session);
      if (!war) {
        throw new Error('War not found');
      }

      if (war.status !== WarStatus.ACTIVE) {
        throw new Error('War is not active');
      }

      const { winner, capturePoints } = await war.resolve();

      const territory = await Territory.findOne({ id: war.territoryId }).session(session);
      if (!territory) {
        throw new Error('Territory not found');
      }

      const attackerGang = await Gang.findById(war.attackerGangId).session(session);
      if (!attackerGang) {
        throw new Error('Attacker gang not found');
      }

      let defenderGang: IGang | null = null;
      if (war.defenderGangId) {
        defenderGang = await Gang.findById(war.defenderGangId).session(session);
      }

      const io = getSocketIO();

      if (winner === 'attacker') {
        if (defenderGang && territory.controllingGangId) {
          defenderGang.removeTerritory(war.territoryId);
          defenderGang.incrementLosses();
          await defenderGang.save({ session });
        }

        territory.conquerBy(attackerGang._id as mongoose.Types.ObjectId, attackerGang.name, capturePoints);
        await territory.save({ session });

        attackerGang.addTerritory(war.territoryId);
        attackerGang.incrementWins();
        await attackerGang.save({ session });

        logger.info(
          `War resolved: ${attackerGang.name} conquered ${territory.name} ` +
          `with ${capturePoints} capture points`
        );

        if (io) {
          io.emit('territory:conquered', {
            territory: war.territoryId,
            winner: attackerGang.name,
            loser: war.defenderGangName || 'Unclaimed',
            capturePoints,
          });
        }
      } else {
        if (defenderGang) {
          defenderGang.incrementWins();
          await defenderGang.save({ session });
        }

        attackerGang.incrementLosses();
        await attackerGang.save({ session });

        logger.info(
          `War resolved: ${territory.name} defended by ${war.defenderGangName || 'Unclaimed'} ` +
          `with ${100 - capturePoints} defense points`
        );

        if (io) {
          io.emit('territory:defended', {
            territory: war.territoryId,
            defender: war.defenderGangName || 'Unclaimed',
            attacker: attackerGang.name,
            capturePoints,
          });
        }
      }

      await war.save({ session });

      // Create gang war aftermath world event for decisive victories
      const captureMargin = Math.abs(capturePoints - 50);
      const wasDecisive = captureMargin >= 30; // 80+ or 20- capture points

      if (wasDecisive) {
        try {
          const now = new Date();
          const eventDuration = 24 * 60 * 60 * 1000; // 24 hours
          const winnerGang = winner === 'attacker' ? attackerGang : defenderGang;
          const loserGang = winner === 'attacker' ? defenderGang : attackerGang;

          if (winnerGang) {
            // Create aftermath event - increased danger and reduced reputation gains
            await WorldEventService.createRandomEvent(territory.id);

            // Log the event creation
            logger.info(
              `Gang war aftermath event would be created: ${winnerGang.name} dominated ${loserGang?.name || 'territory'} ` +
              `in ${territory.name} (${capturePoints}% capture points)`
            );

            // Add to world state headlines and gossip
            await WorldEventService.addNewsHeadline(
              `${winnerGang.name.toUpperCase()} DOMINATES ${territory.name.toUpperCase()} - TERRITORY IN CHAOS`
            );
            await WorldEventService.addGossip(
              `The war at ${territory.name} was brutal. ${winnerGang.name} showed no mercy.`,
              territory.id
            );
            await WorldEventService.addGossip(
              `Stay away from ${territory.name} for a while - too dangerous after the gang war.`,
              territory.id
            );
          }
        } catch (eventError) {
          // Don't fail war resolution if event creation fails
          logger.error('Failed to create gang war aftermath event:', eventError);
        }
      }

      // Set 24-hour war cooldown for both gangs to prevent war spamming
      const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const cooldownUntil = new Date(Date.now() + cooldownDuration);

      // Update attacker gang cooldown (need to reload since we may have saved already)
      await Gang.findByIdAndUpdate(
        war.attackerGangId,
        { warCooldownUntil: cooldownUntil },
        { session }
      );

      // Update defender gang cooldown if exists
      if (war.defenderGangId) {
        await Gang.findByIdAndUpdate(
          war.defenderGangId,
          { warCooldownUntil: cooldownUntil },
          { session }
        );
      }

      logger.info(
        `War cooldown set: Both gangs on cooldown until ${cooldownUntil.toISOString()}`
      );

      // Award Combat XP to winning gang members based on contributions
      try {
        const winningContributions = winner === 'attacker'
          ? war.attackerContributions
          : war.defenderContributions;

        for (const contribution of winningContributions) {
          // Use contribution amount as basis for combat XP (gold contributed = effort)
          const warXP = SkillService.calculateGangWarCombatXP(contribution.amount);

          const combatResult = await SkillService.awardCombatXP(
            contribution.characterId.toString(),
            warXP,
            'gang_war',
            session
          );

          // Check Combat Level milestones if leveled up
          if (combatResult.leveledUp) {
            await CharacterProgressionService.checkCombatLevelMilestones(
              contribution.characterId.toString(),
              combatResult.newCombatLevel,
              combatResult.totalCombatXp,
              session
            );
          }
        }

        logger.info(
          `Gang war combat XP awarded to ${winningContributions.length} winning members`
        );
      } catch (combatXpError) {
        // Combat XP is non-critical - don't fail war resolution
        logger.warn('Failed to award gang war combat XP:', combatXpError);
      }

      await session.commitTransaction();

      return { war, territory };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error resolving war:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all active wars
   */
  static async getActiveWars(): Promise<IGangWar[]> {
    return GangWar.find({ status: WarStatus.ACTIVE })
      .populate('attackerGangId', 'name tag')
      .populate('defenderGangId', 'name tag')
      .sort({ resolveAt: 1 });
  }

  /**
   * Get war by ID
   */
  static async getWar(warId: mongoose.Types.ObjectId): Promise<IGangWar> {
    const war = await GangWar.findById(warId)
      .populate('attackerGangId', 'name tag')
      .populate('defenderGangId', 'name tag');

    if (!war) {
      throw new Error('War not found');
    }

    return war;
  }

  /**
   * Get war history for a territory
   *
   * @param territoryId - Territory slug
   * @param limit - Maximum wars to return
   * @param offset - Number of wars to skip
   * @returns Paginated war history
   */
  static async getWarHistory(
    territoryId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ wars: IGangWar[]; total: number }> {
    const query = {
      territoryId,
      status: WarStatus.RESOLVED,
    };

    const total = await GangWar.countDocuments(query);
    const wars = await GangWar.find(query)
      .populate('attackerGangId', 'name tag')
      .populate('defenderGangId', 'name tag')
      .sort({ resolvedAt: -1 })
      .skip(offset)
      .limit(limit);

    return { wars, total };
  }

  /**
   * Auto-resolve all expired wars
   * Called by CRON job
   *
   * @returns Number of wars resolved
   */
  static async autoResolveWars(): Promise<number> {
    try {
      const expiredWars = await GangWar.findExpiredWars();

      logger.info(`Found ${expiredWars.length} expired wars to resolve`);

      let resolved = 0;

      for (const war of expiredWars) {
        try {
          await this.resolveWar(war._id as mongoose.Types.ObjectId);
          resolved += 1;
        } catch (error) {
          logger.error(`Error auto-resolving war ${war._id}:`, error);
        }
      }

      logger.info(`Auto-resolved ${resolved} wars`);

      return resolved;
    } catch (error) {
      logger.error('Error in autoResolveWars:', error);
      throw error;
    }
  }

  /**
   * Get active wars involving a gang
   */
  static async getGangWars(gangId: mongoose.Types.ObjectId): Promise<IGangWar[]> {
    return GangWar.findActiveByGang(gangId);
  }
}
