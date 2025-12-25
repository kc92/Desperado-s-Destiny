/**
 * Mining Claim Service
 * Handles mining claim staking, yield collection, and contests
 *
 * Sprint 7: Mid-Game Content - Mining Claims (L25 unlock)
 */

import mongoose from 'mongoose';
import { MiningClaim, IMiningClaim } from '../models/MiningClaim.model';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { MilestoneRewardService } from './milestoneReward.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  getClaimLocationById,
  getAvailableClaims,
  CLAIM_TIER_CONFIG,
  MINING_RESOURCES,
  calculateYieldValue,
  MiningClaimLocation,
  ClaimTier
} from '../data/activities/miningClaims';
import { MINING_CLAIM_DECAY, ScarcityResourceType } from '@desperados/shared';
import logger from '../utils/logger';
import { TerritoryBonusService } from './territoryBonus.service';
import { ResourceScarcityService } from './resourceScarcity.service';
import { SecureRNG } from './base/SecureRNG';
import { DailyContractService } from './dailyContract.service';

export interface StakeClaimResult {
  success: boolean;
  claim?: IMiningClaim;
  error?: string;
}

export interface CollectYieldResult {
  success: boolean;
  resources: Record<string, number>;
  goldValue: number;
  hoursAccumulated: number;
  encounter?: MiningEncounter;
  error?: string;
  // Phase 14: Condition info for UI
  condition?: number;
  conditionTier?: string;
  yieldMultiplier?: number;
  isOverworked?: boolean;
  collectionsToday?: number;
}

export interface UpgradeClaimResult {
  success: boolean;
  newTier: ClaimTier;
  cost: number;
  error?: string;
}

// Phase 5.2: Active prospecting mechanics
export type ProspectTechnique = 'shallow' | 'deep' | 'explosive';

export interface ProspectResult {
  success: boolean;
  technique: ProspectTechnique;
  resourcesFound: Record<string, number>;
  goldValue: number;
  claimDamage?: number;
  criticalSuccess?: boolean;
  error?: string;
}

// Phase 5.2: Mining encounters
export type EncounterType = 'bandit_raid' | 'cave_in' | 'rare_discovery' | 'claim_jumper' | 'gas_leak';
export type EncounterSeverity = 'minor' | 'moderate' | 'severe';

export interface EncounterOption {
  id: string;
  text: string;
  requirements?: {
    skill?: string;
    level?: number;
  };
  outcomes: {
    success: {
      description: string;
      goldBonus?: number;
      resourceBonus?: Record<string, number>;
      claimDamage?: number;
    };
    failure: {
      description: string;
      goldBonus?: number; // Some failures still yield partial rewards (e.g., damaged discovery)
      goldLoss?: number;
      claimDamage?: number;
      injuryChance?: number;
    };
  };
}

export interface MiningEncounter {
  id: string;
  type: EncounterType;
  severity: EncounterSeverity;
  title: string;
  description: string;
  options: EncounterOption[];
  expiresAt: Date;
}

export interface EncounterResult {
  success: boolean;
  encounter: MiningEncounter;
  chosenOption: string;
  outcome: 'success' | 'failure';
  description: string;
  rewards?: {
    gold?: number;
    resources?: Record<string, number>;
  };
  penalties?: {
    goldLoss?: number;
    claimDamage?: number;
    injured?: boolean;
  };
  error?: string;
}

export class MiningClaimService {
  private static readonly MAX_CLAIMS_PER_CHARACTER = 3;
  private static readonly CONTEST_DURATION_HOURS = 24;
  private static readonly ENCOUNTER_CHANCE = 15; // 15% per collection
  private static readonly PROSPECTING_COOLDOWN_HOURS = 4; // Cooldown between prospecting attempts

  /**
   * Check if a character has the mining claims feature unlocked
   */
  static async hasFeatureUnlocked(characterId: string): Promise<boolean> {
    return MilestoneRewardService.hasFeature(characterId, 'mining_claims');
  }

  /**
   * Get available claim locations for a character
   */
  static async getAvailableLocations(characterId: string): Promise<{
    locations: MiningClaimLocation[];
    ownedClaims: IMiningClaim[];
    canStakeMore: boolean;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const hasFeature = await this.hasFeatureUnlocked(characterId);
    if (!hasFeature) {
      return { locations: [], ownedClaims: [], canStakeMore: false };
    }

    const locations = getAvailableClaims(character.level);
    const ownedClaims = await MiningClaim.findActiveByCharacter(characterId);
    const canStakeMore = ownedClaims.length < this.MAX_CLAIMS_PER_CHARACTER;

    return { locations, ownedClaims, canStakeMore };
  }

  /**
   * Stake a new mining claim
   */
  static async stakeClaim(
    characterId: string,
    claimId: string,
    useDeed: boolean = false
  ): Promise<StakeClaimResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check feature unlock
      const hasFeature = await this.hasFeatureUnlocked(characterId);
      if (!hasFeature) {
        return { success: false, error: 'Mining claims not unlocked. Reach level 25.' };
      }

      // Check claim limit
      const ownedClaims = await MiningClaim.findActiveByCharacter(characterId);
      if (ownedClaims.length >= this.MAX_CLAIMS_PER_CHARACTER) {
        return { success: false, error: `Maximum ${this.MAX_CLAIMS_PER_CHARACTER} claims allowed` };
      }

      // Get claim location
      const location = getClaimLocationById(claimId);
      if (!location) {
        return { success: false, error: 'Invalid claim location' };
      }

      // Check level requirement
      if (character.level < location.levelRequired) {
        return { success: false, error: `You must be level ${location.levelRequired} to stake this claim` };
      }

      // Check if already owns this claim
      const existingClaim = ownedClaims.find(c => c.claimId === claimId);
      if (existingClaim) {
        return { success: false, error: 'You already own a claim at this location' };
      }

      // Check availability at location
      const claimsAtLocation = await MiningClaim.countClaimsAtLocation(claimId);
      if (claimsAtLocation >= location.maxConcurrentClaims) {
        return { success: false, error: 'No claims available at this location' };
      }

      // Calculate cost (0 if using deed from milestone reward)
      const tierConfig = CLAIM_TIER_CONFIG[location.tier];
      let stakeCost = useDeed ? 0 : tierConfig.stakeCost;

      // Deduct gold if not using deed
      if (stakeCost > 0) {
        const canAfford = await GoldService.canAfford(characterId, stakeCost);
        if (!canAfford) {
          return { success: false, error: `Not enough gold. Need $${stakeCost.toLocaleString()}` };
        }

        await GoldService.deductGold(
          characterId,
          stakeCost,
          TransactionSource.PROPERTY_PURCHASE,
          { type: 'mining_claim', claimId }
        );
      }

      // Create the claim
      const claim = await MiningClaim.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        claimId,
        locationId: location.region,
        tier: location.tier,
        status: 'active',
        stakedAt: new Date(),
        lastCollectedAt: new Date(),
        accumulatedYield: {},
        totalYield: 0,
        totalCollections: 0,
        upgrades: [],
        upgradeLevel: 0,
        contested: false,
        totalInvested: stakeCost
      });

      logger.info('Mining claim staked', {
        characterId,
        characterName: character.name,
        claimId,
        tier: location.tier,
        cost: stakeCost,
        usedDeed: useDeed
      });

      return { success: true, claim };
    } catch (error) {
      logger.error('Error staking claim', { characterId, claimId, error });
      return { success: false, error: 'Failed to stake claim' };
    }
  }

  /**
   * Collect yield from a mining claim
   */
  static async collectYield(
    characterId: string,
    claimDocId: string
  ): Promise<CollectYieldResult> {
    try {
      const claim = await MiningClaim.findById(claimDocId);
      if (!claim) {
        return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: 'Claim not found' };
      }

      if (claim.characterId.toString() !== characterId) {
        return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: 'You do not own this claim' };
      }

      if (claim.status !== 'active') {
        return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: 'Claim is not active' };
      }

      // TERRITORY BONUS: Fetch mining bonuses (Phase 2.2)
      let miningBonuses = { yield: 1.0, rareChance: 1.0, speed: 1.0, value: 1.0 };
      try {
        const charObjId = new mongoose.Types.ObjectId(characterId);
        const bonusResult = await TerritoryBonusService.getMiningBonuses(charObjId);
        if (bonusResult.hasBonuses) {
          miningBonuses = bonusResult.bonuses;
          logger.debug(`Territory mining bonuses applied: yield ${miningBonuses.yield}x, speed ${miningBonuses.speed}x, value ${miningBonuses.value}x`);
        }
      } catch (bonusError) {
        logger.warn('Failed to get territory mining bonuses:', bonusError);
      }

      // Check cooldown (with territory speed bonus reducing cooldown)
      const tierConfig = CLAIM_TIER_CONFIG[claim.tier as ClaimTier];
      const baseCooldownMs = tierConfig.collectCooldownHours * 60 * 60 * 1000;
      const cooldownMs = Math.floor(baseCooldownMs * miningBonuses.speed); // speed < 1 means faster
      const timeSinceCollect = Date.now() - claim.lastCollectedAt.getTime();

      if (timeSinceCollect < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - timeSinceCollect) / (60 * 60 * 1000));
        return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: `Collection on cooldown. ${remainingHours}h remaining` };
      }

      // Get claim location for resource types
      const location = getClaimLocationById(claim.claimId);
      if (!location) {
        return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: 'Invalid claim location' };
      }

      // Calculate yield based on time since last collection (capped at max storage)
      const maxStorageMs = tierConfig.maxStorageHours * 60 * 60 * 1000;
      const effectiveTime = Math.min(timeSinceCollect, maxStorageMs);
      const hoursAccumulated = effectiveTime / (60 * 60 * 1000);

      // Generate resources based on location and tier
      const resources: Record<string, number> = {};
      const baseYield = location.baseYieldPerHour;

      // Phase 14: Get condition-based yield multiplier
      const conditionMultiplier = claim.getYieldMultiplier();
      const isOverworked = claim.isOverworked();

      // Phase 14.3: Get resource scarcity modifier (competition between claims on same vein)
      let scarcityModifier = 1.0;
      try {
        const scarcityResult = await ResourceScarcityService.calculateYieldModifier(
          claimDocId, // veinId - using claim ID as placeholder, actual vein lookup happens in service
          claimDocId
        );
        scarcityModifier = scarcityResult.finalYieldMultiplier;
        if (scarcityModifier < 1.0) {
          logger.debug(
            `[MiningClaim] Resource scarcity applied: ${scarcityModifier.toFixed(2)}x ` +
            `(${scarcityResult.claimCount} claims, status: ${scarcityResult.status})`
          );
        }
      } catch (scarcityError) {
        logger.warn('[MiningClaim] Failed to get resource scarcity modifier:', scarcityError);
      }

      for (const resourceId of location.resources) {
        const resource = MINING_RESOURCES[resourceId as keyof typeof MINING_RESOURCES];
        if (resource) {
          // Calculate quantity based on time, tier multiplier, and randomness
          const baseQuantity = (baseYield.min + Math.random() * (baseYield.max - baseYield.min)) * hoursAccumulated;
          const tierMultiplier = tierConfig.yieldMultiplier;
          const upgradeMultiplier = 1 + (claim.upgradeLevel * 0.1); // 10% per upgrade level
          // TERRITORY BONUS: Apply yield multiplier (Phase 2.2)
          // Phase 14: Apply condition multiplier
          // Phase 14.3: Apply scarcity multiplier
          const quantity = Math.floor(
            baseQuantity * tierMultiplier * upgradeMultiplier * miningBonuses.yield * conditionMultiplier * scarcityModifier / resource.value
          );

          if (quantity > 0) {
            resources[resourceId] = quantity;
          }
        }
      }

      // Calculate gold value (with territory value bonus - Phase 2.2)
      const baseGoldValue = calculateYieldValue(resources);
      const goldValue = Math.floor(baseGoldValue * miningBonuses.value);

      // Award gold
      await GoldService.addGold(
        characterId,
        goldValue,
        TransactionSource.PROPERTY_INCOME,
        { type: 'mining_claim', claimId: claim.claimId }
      );

      // Update claim
      claim.totalYield += goldValue;

      // Phase 14: Record collection and apply decay
      claim.recordCollection(); // Updates lastCollectedAt, totalCollections, collectionsToday

      // Phase 14: Apply collection decay (with overwork penalty)
      let collectionDecay = MINING_CLAIM_DECAY.COLLECTION_DECAY;
      if (isOverworked) {
        collectionDecay *= MINING_CLAIM_DECAY.OVERWORK_DECAY_MULTIPLIER;
        logger.debug(`Claim ${claimDocId} is overworked - applying ${MINING_CLAIM_DECAY.OVERWORK_DECAY_MULTIPLIER}x decay penalty`);
      }
      claim.applyDecay(collectionDecay);

      await claim.save();

      // Phase 5.2: Check for random encounter (15% chance)
      let encounter: MiningEncounter | undefined;
      try {
        const charObjId = new mongoose.Types.ObjectId(characterId);
        const possibleEncounter = await this.checkForMiningEncounter(charObjId, claimDocId);
        if (possibleEncounter) {
          encounter = possibleEncounter;
        }
      } catch (encounterError) {
        logger.warn('Failed to check for mining encounter:', encounterError);
      }

      // Phase 5.2: Update daily contract progress for mining-type contracts
      try {
        await DailyContractService.triggerProgress(
          characterId,
          'mining_collection',
          {
            type: 'crafting', // Mining contracts are under crafting type
            amount: 1
          }
        );
      } catch (contractError) {
        logger.warn('Failed to update mining contract progress:', contractError);
      }

      logger.info('Mining yield collected', {
        characterId,
        claimId: claim.claimId,
        goldValue,
        hoursAccumulated: Math.round(hoursAccumulated * 10) / 10,
        encounterTriggered: !!encounter,
        // Phase 14: Log condition info
        condition: claim.condition,
        conditionMultiplier,
        isOverworked,
        collectionsToday: claim.collectionsToday
      });

      return {
        success: true,
        resources,
        goldValue,
        hoursAccumulated: Math.round(hoursAccumulated * 10) / 10,
        encounter,
        // Phase 14: Condition info for UI
        condition: claim.condition,
        conditionTier: claim.getConditionTier(),
        yieldMultiplier: conditionMultiplier,
        isOverworked,
        collectionsToday: claim.collectionsToday
      };
    } catch (error) {
      logger.error('Error collecting yield', { characterId, claimDocId, error });
      return { success: false, resources: {}, goldValue: 0, hoursAccumulated: 0, error: 'Failed to collect yield' };
    }
  }

  /**
   * Upgrade a mining claim to the next tier
   */
  static async upgradeClaim(
    characterId: string,
    claimDocId: string
  ): Promise<UpgradeClaimResult> {
    try {
      const claim = await MiningClaim.findById(claimDocId);
      if (!claim) {
        return { success: false, newTier: 1, cost: 0, error: 'Claim not found' };
      }

      if (claim.characterId.toString() !== characterId) {
        return { success: false, newTier: claim.tier as ClaimTier, cost: 0, error: 'You do not own this claim' };
      }

      if (claim.tier >= 5) {
        return { success: false, newTier: 5, cost: 0, error: 'Claim is already at maximum tier' };
      }

      const currentTierConfig = CLAIM_TIER_CONFIG[claim.tier as ClaimTier];
      const upgradeCost = currentTierConfig.upgradeCost;

      // Check gold
      const canAfford = await GoldService.canAfford(characterId, upgradeCost);
      if (!canAfford) {
        return { success: false, newTier: claim.tier as ClaimTier, cost: upgradeCost, error: `Not enough gold. Need $${upgradeCost.toLocaleString()}` };
      }

      // Deduct gold
      await GoldService.deductGold(
        characterId,
        upgradeCost,
        TransactionSource.PROPERTY_PURCHASE,
        { type: 'mining_claim_upgrade', claimId: claim.claimId }
      );

      // Upgrade claim
      const newTier = (claim.tier + 1) as ClaimTier;
      claim.tier = newTier;
      claim.upgradeLevel++;
      claim.totalInvested += upgradeCost;
      await claim.save();

      logger.info('Mining claim upgraded', {
        characterId,
        claimId: claim.claimId,
        newTier,
        cost: upgradeCost
      });

      return { success: true, newTier, cost: upgradeCost };
    } catch (error) {
      logger.error('Error upgrading claim', { characterId, claimDocId, error });
      return { success: false, newTier: 1, cost: 0, error: 'Failed to upgrade claim' };
    }
  }

  /**
   * Abandon a mining claim
   */
  static async abandonClaim(characterId: string, claimDocId: string): Promise<boolean> {
    try {
      const claim = await MiningClaim.findById(claimDocId);
      if (!claim || claim.characterId.toString() !== characterId) {
        return false;
      }

      claim.status = 'abandoned';
      await claim.save();

      logger.info('Mining claim abandoned', { characterId, claimId: claim.claimId });
      return true;
    } catch (error) {
      logger.error('Error abandoning claim', { characterId, claimDocId, error });
      return false;
    }
  }

  /**
   * Contest another player's claim (PvP)
   */
  static async contestClaim(
    attackerId: string,
    claimDocId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const claim = await MiningClaim.findById(claimDocId);
      if (!claim) {
        return { success: false, error: 'Claim not found' };
      }

      if (claim.characterId.toString() === attackerId) {
        return { success: false, error: 'Cannot contest your own claim' };
      }

      if (claim.status !== 'active') {
        return { success: false, error: 'Claim is not active' };
      }

      if (claim.contested) {
        return { success: false, error: 'Claim is already being contested' };
      }

      const location = getClaimLocationById(claim.claimId);
      if (!location || !location.contestable) {
        return { success: false, error: 'This claim cannot be contested' };
      }

      // Mark as contested
      claim.contested = true;
      claim.contestedBy = new mongoose.Types.ObjectId(attackerId);
      claim.contestStartedAt = new Date();
      claim.status = 'contested';
      await claim.save();

      logger.info('Mining claim contested', {
        attackerId,
        defenderId: claim.characterId.toString(),
        claimId: claim.claimId
      });

      return { success: true };
    } catch (error) {
      logger.error('Error contesting claim', { attackerId, claimDocId, error });
      return { success: false, error: 'Failed to contest claim' };
    }
  }

  /**
   * Phase 5.2: Prospect a mining vein with active gameplay
   * Players choose technique with risk/reward trade-offs
   */
  static async prospectVein(
    characterId: mongoose.Types.ObjectId,
    claimId: string,
    technique: ProspectTechnique
  ): Promise<ProspectResult> {
    try {
      const claim = await MiningClaim.findById(claimId);
      if (!claim) {
        return { success: false, technique, resourcesFound: {}, goldValue: 0, error: 'Claim not found' };
      }

      if (claim.characterId.toString() !== characterId.toString()) {
        return { success: false, technique, resourcesFound: {}, goldValue: 0, error: 'You do not own this claim' };
      }

      if (claim.status !== 'active') {
        return { success: false, technique, resourcesFound: {}, goldValue: 0, error: 'Claim is not active' };
      }

      // Get claim location for resource types
      const location = getClaimLocationById(claim.claimId);
      if (!location) {
        return { success: false, technique, resourcesFound: {}, goldValue: 0, error: 'Invalid claim location' };
      }

      // Get territory bonuses
      let miningBonuses = { yield: 1.0, rareChance: 1.0, speed: 1.0, value: 1.0 };
      try {
        const bonusResult = await TerritoryBonusService.getMiningBonuses(characterId);
        if (bonusResult.hasBonuses) {
          miningBonuses = bonusResult.bonuses;
        }
      } catch (bonusError) {
        logger.warn('Failed to get territory mining bonuses:', bonusError);
      }

      const tierConfig = CLAIM_TIER_CONFIG[claim.tier as ClaimTier];
      const resources: Record<string, number> = {};
      let claimDamage = 0;
      let criticalSuccess = false;

      // Technique-specific mechanics
      switch (technique) {
        case 'shallow': {
          // Low risk, low reward, fast
          const baseYield = location.baseYieldPerHour.min * 0.5; // 50% of min yield

          for (const resourceId of location.resources) {
            const resource = MINING_RESOURCES[resourceId as keyof typeof MINING_RESOURCES];
            if (resource && SecureRNG.chance(40)) { // 40% chance per resource
              const quantity = Math.floor(
                baseYield * tierConfig.yieldMultiplier * miningBonuses.yield / resource.value
              );
              if (quantity > 0) resources[resourceId] = quantity;
            }
          }

          // 5% crit chance for double
          if (SecureRNG.chance(5)) {
            criticalSuccess = true;
            for (const key in resources) {
              resources[key] *= 2;
            }
          }
          break;
        }

        case 'deep': {
          // Medium risk, medium reward, slower
          const baseYield = (location.baseYieldPerHour.min + location.baseYieldPerHour.max) * 0.5;

          for (const resourceId of location.resources) {
            const resource = MINING_RESOURCES[resourceId as keyof typeof MINING_RESOURCES];
            if (resource && SecureRNG.chance(60)) { // 60% chance per resource
              const quantity = Math.floor(
                baseYield * tierConfig.yieldMultiplier * miningBonuses.yield / resource.value
              );
              if (quantity > 0) resources[resourceId] = quantity;
            }
          }

          // 10% chance of minor claim damage
          if (SecureRNG.chance(10)) {
            claimDamage = SecureRNG.range(1, 5);
          }

          // 10% crit chance for double
          if (SecureRNG.chance(10)) {
            criticalSuccess = true;
            for (const key in resources) {
              resources[key] *= 2;
            }
          }
          break;
        }

        case 'explosive': {
          // High risk, high reward, can damage claim
          const baseYield = location.baseYieldPerHour.max * 1.5; // 150% of max yield

          // Roll for success (70% base chance)
          const successRoll = SecureRNG.chance(70);

          if (successRoll) {
            for (const resourceId of location.resources) {
              const resource = MINING_RESOURCES[resourceId as keyof typeof MINING_RESOURCES];
              if (resource && SecureRNG.chance(80)) { // 80% chance per resource
                const quantity = Math.floor(
                  baseYield * tierConfig.yieldMultiplier * miningBonuses.yield / resource.value
                );
                if (quantity > 0) resources[resourceId] = quantity;
              }
            }

            // 20% crit chance for triple!
            if (SecureRNG.chance(20)) {
              criticalSuccess = true;
              for (const key in resources) {
                resources[key] *= 3;
              }
            }
          }

          // Always risk claim damage with explosives (30-60% chance)
          if (SecureRNG.chance(successRoll ? 30 : 60)) {
            claimDamage = SecureRNG.range(5, 15);
          }
          break;
        }
      }

      // Calculate gold value with territory bonus
      const baseGoldValue = calculateYieldValue(resources);
      const goldValue = Math.floor(baseGoldValue * miningBonuses.value);

      // Award gold if any resources found
      if (goldValue > 0) {
        await GoldService.addGold(
          characterId.toString(),
          goldValue,
          TransactionSource.PROPERTY_INCOME,
          { type: 'mining_prospect', claimId: claim.claimId, technique }
        );

        claim.totalYield += goldValue;
        await claim.save();
      }

      logger.info('Mining prospecting completed', {
        characterId: characterId.toString(),
        claimId: claim.claimId,
        technique,
        goldValue,
        claimDamage,
        criticalSuccess
      });

      return {
        success: true,
        technique,
        resourcesFound: resources,
        goldValue,
        claimDamage: claimDamage > 0 ? claimDamage : undefined,
        criticalSuccess
      };
    } catch (error) {
      logger.error('Error prospecting vein', { characterId, claimId, technique, error });
      return { success: false, technique, resourcesFound: {}, goldValue: 0, error: 'Failed to prospect vein' };
    }
  }

  /**
   * Phase 5.2: Check for random mining encounter during collection
   */
  static async checkForMiningEncounter(
    characterId: mongoose.Types.ObjectId,
    claimId: string
  ): Promise<MiningEncounter | null> {
    try {
      // 15% chance per collection
      if (!SecureRNG.chance(this.ENCOUNTER_CHANCE)) {
        return null;
      }

      const claim = await MiningClaim.findById(claimId);
      if (!claim) return null;

      // Select encounter type (weighted by tier)
      const encounterTypes: Array<{ type: EncounterType; weight: number }> = [
        { type: 'bandit_raid', weight: 25 },
        { type: 'cave_in', weight: 20 },
        { type: 'rare_discovery', weight: 15 },
        { type: 'claim_jumper', weight: 25 },
        { type: 'gas_leak', weight: 15 }
      ];

      const encounterType = SecureRNG.weightedSelect(
        encounterTypes.map(e => ({ item: e.type, weight: e.weight }))
      );

      // Select severity (harder claims = higher severity)
      const severities: Array<{ severity: EncounterSeverity; weight: number }> = [
        { severity: 'minor', weight: claim.tier <= 2 ? 50 : 30 },
        { severity: 'moderate', weight: 35 },
        { severity: 'severe', weight: claim.tier >= 4 ? 30 : 15 }
      ];

      const severity = SecureRNG.weightedSelect(
        severities.map(s => ({ item: s.severity, weight: s.weight }))
      );

      // Generate encounter based on type
      const encounter = this.generateEncounter(encounterType, severity, claim.tier as ClaimTier);

      logger.info('Mining encounter generated', {
        characterId: characterId.toString(),
        claimId: claim.claimId,
        type: encounterType,
        severity
      });

      return encounter;
    } catch (error) {
      logger.error('Error checking for mining encounter', { characterId, claimId, error });
      return null;
    }
  }

  /**
   * Phase 5.2: Resolve a mining encounter based on player choice
   */
  static async resolveMiningEncounter(
    characterId: mongoose.Types.ObjectId,
    encounterId: string,
    claimId: string,
    choice: string
  ): Promise<EncounterResult> {
    try {
      const claim = await MiningClaim.findById(claimId);
      if (!claim) {
        return {
          success: false,
          encounter: {} as MiningEncounter,
          chosenOption: choice,
          outcome: 'failure',
          description: 'Claim not found',
          error: 'Claim not found'
        };
      }

      if (claim.characterId.toString() !== characterId.toString()) {
        return {
          success: false,
          encounter: {} as MiningEncounter,
          chosenOption: choice,
          outcome: 'failure',
          description: 'You do not own this claim',
          error: 'You do not own this claim'
        };
      }

      // In a full implementation, encounters would be stored in the database
      // For now, we'll regenerate based on encounterId pattern
      const [type, severity] = encounterId.split('_') as [EncounterType, EncounterSeverity];
      const encounter = this.generateEncounter(type, severity, claim.tier as ClaimTier);

      const option = encounter.options.find(o => o.id === choice);
      if (!option) {
        return {
          success: false,
          encounter,
          chosenOption: choice,
          outcome: 'failure',
          description: 'Invalid choice',
          error: 'Invalid choice'
        };
      }

      // Determine success based on difficulty
      const successChance = severity === 'minor' ? 75 : severity === 'moderate' ? 60 : 45;
      const isSuccess = SecureRNG.chance(successChance);
      const outcome = isSuccess ? 'success' : 'failure';

      const result: EncounterResult = {
        success: true,
        encounter,
        chosenOption: choice,
        outcome,
        description: isSuccess ? option.outcomes.success.description : option.outcomes.failure.description
      };

      // Apply outcomes
      if (isSuccess) {
        if (option.outcomes.success.goldBonus) {
          await GoldService.addGold(
            characterId.toString(),
            option.outcomes.success.goldBonus,
            TransactionSource.PROPERTY_INCOME,
            { type: 'mining_encounter', encounterType: type }
          );
          result.rewards = { gold: option.outcomes.success.goldBonus };
        }
        if (option.outcomes.success.resourceBonus) {
          result.rewards = {
            ...result.rewards,
            resources: option.outcomes.success.resourceBonus
          };
        }
      } else {
        // Failures can still grant reduced gold (e.g., damaged discoveries)
        if (option.outcomes.failure.goldBonus) {
          await GoldService.addGold(
            characterId.toString(),
            option.outcomes.failure.goldBonus,
            TransactionSource.PROPERTY_INCOME,
            { type: 'mining_encounter', encounterType: type }
          );
          result.rewards = { gold: option.outcomes.failure.goldBonus };
        }
        if (option.outcomes.failure.goldLoss) {
          await GoldService.deductGold(
            characterId.toString(),
            option.outcomes.failure.goldLoss,
            TransactionSource.PROPERTY_LOSS,
            { type: 'mining_encounter', encounterType: type }
          );
          result.penalties = { goldLoss: option.outcomes.failure.goldLoss };
        }
        if (option.outcomes.failure.claimDamage) {
          result.penalties = {
            ...result.penalties,
            claimDamage: option.outcomes.failure.claimDamage
          };
        }
      }

      logger.info('Mining encounter resolved', {
        characterId: characterId.toString(),
        encounterId,
        choice,
        outcome
      });

      return result;
    } catch (error) {
      logger.error('Error resolving mining encounter', { characterId, encounterId, choice, error });
      return {
        success: false,
        encounter: {} as MiningEncounter,
        chosenOption: choice,
        outcome: 'failure',
        description: 'Failed to resolve encounter',
        error: 'Failed to resolve encounter'
      };
    }
  }

  /**
   * Helper: Generate encounter details based on type and severity
   */
  private static generateEncounter(
    type: EncounterType,
    severity: EncounterSeverity,
    tier: ClaimTier
  ): MiningEncounter {
    const id = `${type}_${severity}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const baseGold = tier * 100;
    const multiplier = severity === 'minor' ? 1 : severity === 'moderate' ? 2 : 3;

    switch (type) {
      case 'bandit_raid':
        return {
          id,
          type,
          severity,
          title: 'Bandit Raid!',
          description: `A group of ${severity === 'severe' ? 'heavily armed' : severity === 'moderate' ? 'dangerous' : 'opportunistic'} bandits is approaching your mining claim!`,
          options: [
            {
              id: 'fight',
              text: 'Stand your ground and fight',
              outcomes: {
                success: {
                  description: 'You successfully drove off the bandits and found gold they dropped!',
                  goldBonus: baseGold * multiplier
                },
                failure: {
                  description: 'The bandits overpowered you and stole some of your equipment.',
                  goldLoss: baseGold * multiplier * 0.5,
                  claimDamage: 10 * multiplier
                }
              }
            },
            {
              id: 'negotiate',
              text: 'Try to negotiate with the bandits',
              outcomes: {
                success: {
                  description: 'The bandits accepted a small payment and left peacefully.'
                },
                failure: {
                  description: 'Negotiations failed and they took more than you offered!',
                  goldLoss: baseGold * multiplier,
                  claimDamage: 5
                }
              }
            },
            {
              id: 'hide',
              text: 'Hide and wait for them to leave',
              outcomes: {
                success: {
                  description: 'The bandits didn\'t find you or your main stash.'
                },
                failure: {
                  description: 'They found your hiding spot and ransacked the claim.',
                  goldLoss: baseGold * multiplier * 0.75,
                  claimDamage: 15 * multiplier
                }
              }
            }
          ],
          expiresAt
        };

      case 'cave_in':
        return {
          id,
          type,
          severity,
          title: 'Cave-In Warning!',
          description: `The tunnel is showing ${severity === 'severe' ? 'critical' : severity === 'moderate' ? 'concerning' : 'minor'} signs of instability.`,
          options: [
            {
              id: 'shore_up',
              text: 'Shore up the supports immediately',
              outcomes: {
                success: {
                  description: 'You reinforced the tunnel and discovered a new vein in the process!',
                  goldBonus: baseGold * multiplier * 1.5,
                  resourceBonus: { silver_ore: multiplier }
                },
                failure: {
                  description: 'The supports failed during installation. The tunnel is badly damaged.',
                  claimDamage: 20 * multiplier
                }
              }
            },
            {
              id: 'evacuate',
              text: 'Evacuate and seal the tunnel',
              outcomes: {
                success: {
                  description: 'You sealed the tunnel safely. Minimal damage sustained.',
                  claimDamage: 5
                },
                failure: {
                  description: 'The tunnel collapsed during evacuation.',
                  claimDamage: 15 * multiplier
                }
              }
            },
            {
              id: 'keep_mining',
              text: 'Keep mining - it\'s probably fine',
              outcomes: {
                success: {
                  description: 'The supports held! You got extra ore from working quickly.',
                  goldBonus: baseGold * multiplier * 2,
                  resourceBonus: { gold_ore: multiplier, silver_ore: multiplier }
                },
                failure: {
                  description: 'The tunnel collapsed! Heavy damage to the claim.',
                  goldLoss: baseGold * multiplier,
                  claimDamage: 30 * multiplier,
                  injuryChance: 30
                }
              }
            }
          ],
          expiresAt
        };

      case 'rare_discovery':
        return {
          id,
          type,
          severity,
          title: 'Rare Discovery!',
          description: `You've found signs of a ${severity === 'severe' ? 'legendary' : severity === 'moderate' ? 'valuable' : 'interesting'} deposit!`,
          options: [
            {
              id: 'extract_carefully',
              text: 'Extract carefully to preserve quality',
              outcomes: {
                success: {
                  description: 'Perfect extraction! You found premium quality ore worth a fortune!',
                  goldBonus: baseGold * multiplier * 3,
                  resourceBonus: { gold_ore: multiplier * 2, gems: multiplier }
                },
                failure: {
                  description: 'You damaged the deposit during extraction. Still valuable though.',
                  goldBonus: baseGold * multiplier
                }
              }
            },
            {
              id: 'extract_quickly',
              text: 'Extract quickly before anyone notices',
              outcomes: {
                success: {
                  description: 'You got it all out before claim jumpers arrived!',
                  goldBonus: baseGold * multiplier * 2
                },
                failure: {
                  description: 'In your haste, you caused a small collapse.',
                  goldBonus: baseGold * multiplier * 0.5,
                  claimDamage: 10
                }
              }
            }
          ],
          expiresAt
        };

      case 'claim_jumper':
        return {
          id,
          type,
          severity,
          title: 'Claim Jumper!',
          description: `A ${severity === 'severe' ? 'notorious' : severity === 'moderate' ? 'experienced' : 'desperate'} claim jumper is trying to steal your claim!`,
          options: [
            {
              id: 'legal_action',
              text: 'File legal papers to protect your claim',
              outcomes: {
                success: {
                  description: 'The law is on your side. The jumper was fined and you kept the proceeds!',
                  goldBonus: baseGold * multiplier
                },
                failure: {
                  description: 'The paperwork was denied. You had to pay legal fees.',
                  goldLoss: baseGold * multiplier * 0.5
                }
              }
            },
            {
              id: 'intimidate',
              text: 'Intimidate them into leaving',
              outcomes: {
                success: {
                  description: 'They backed down and left behind some equipment!',
                  goldBonus: baseGold * multiplier * 0.75
                },
                failure: {
                  description: 'They called your bluff and damaged your equipment.',
                  claimDamage: 15 * multiplier
                }
              }
            },
            {
              id: 'booby_trap',
              text: 'Set up booby traps around the claim',
              outcomes: {
                success: {
                  description: 'The traps worked perfectly! They won\'t be back.',
                  goldBonus: baseGold * multiplier * 0.5
                },
                failure: {
                  description: 'You triggered your own trap. Oops.',
                  goldLoss: baseGold * multiplier * 0.25,
                  claimDamage: 10,
                  injuryChance: 20
                }
              }
            }
          ],
          expiresAt
        };

      case 'gas_leak':
        return {
          id,
          type,
          severity,
          title: 'Gas Leak!',
          description: `You've hit a pocket of ${severity === 'severe' ? 'deadly' : severity === 'moderate' ? 'dangerous' : 'harmful'} gas!`,
          options: [
            {
              id: 'ventilate',
              text: 'Set up ventilation and wait',
              outcomes: {
                success: {
                  description: 'The gas cleared safely. You can continue mining.'
                },
                failure: {
                  description: 'The ventilation failed. You had to abandon work for the day.',
                  goldLoss: baseGold * multiplier * 0.25
                }
              }
            },
            {
              id: 'mask_continue',
              text: 'Wear a mask and continue working',
              outcomes: {
                success: {
                  description: 'The mask held! You found extra ore near the gas pocket.',
                  goldBonus: baseGold * multiplier * 1.5
                },
                failure: {
                  description: 'The mask leaked. You got sick and lost work time.',
                  goldLoss: baseGold * multiplier,
                  injuryChance: 40
                }
              }
            },
            {
              id: 'seal_pocket',
              text: 'Seal the gas pocket permanently',
              outcomes: {
                success: {
                  description: 'Successfully sealed. This area is now safe to mine.',
                  goldBonus: baseGold * multiplier * 0.5
                },
                failure: {
                  description: 'The seal failed and caused a small explosion.',
                  claimDamage: 20 * multiplier,
                  injuryChance: 25
                }
              }
            }
          ],
          expiresAt
        };

      default:
        throw new Error(`Unknown encounter type: ${type}`);
    }
  }

  /**
   * Get mining statistics for a character
   */
  static async getStatistics(characterId: string): Promise<{
    totalClaims: number;
    activeClaims: number;
    totalYieldCollected: number;
    totalInvested: number;
    claimsByTier: Record<number, number>;
  }> {
    const claims = await MiningClaim.findByCharacter(characterId);

    const activeClaims = claims.filter(c => c.status === 'active');
    const totalYieldCollected = claims.reduce((sum, c) => sum + c.totalYield, 0);
    const totalInvested = claims.reduce((sum, c) => sum + c.totalInvested, 0);

    const claimsByTier: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const claim of activeClaims) {
      claimsByTier[claim.tier]++;
    }

    return {
      totalClaims: claims.length,
      activeClaims: activeClaims.length,
      totalYieldCollected,
      totalInvested,
      claimsByTier
    };
  }
}
