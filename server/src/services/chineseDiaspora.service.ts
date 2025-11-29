/**
 * Chinese Diaspora Service
 *
 * Handles all operations for the hidden Chinese immigrant network reputation system
 * This is a separate, discovery-based reputation system distinct from main factions
 */

import mongoose from 'mongoose';
import {
  ChineseDiasporaRep,
  IChineseDiasporaRep,
  BetrayalRecord,
  VouchRecord,
  EntrustedSecret
} from '../models/ChineseDiasporaRep.model';
import { Character, ICharacter } from '../models/Character.model';
import {
  DiasporaTrustLevel,
  NetworkStanding,
  DiscoveryMethodRep,
  DiasporaService,
  DiasporaReputationAction,
  TRUST_LEVELS,
  REPUTATION_CHANGES,
  SAFE_HOUSE_DURATION,
  NPC_REVELATION
} from '@desperados/shared';
import logger from '../utils/logger';

export class ChineseDiasporaService {
  /**
   * Get character's reputation status (returns null if not discovered)
   */
  static async getReputationStatus(characterId: string): Promise<IChineseDiasporaRep | null> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    // Don't return if network not discovered yet
    if (!rep || !rep.discoveredNetwork) {
      return null;
    }

    return rep;
  }

  /**
   * Discover the network for the first time
   */
  static async discoverNetwork(
    characterId: string,
    method: DiscoveryMethodRep,
    initialNpcId: string,
    locationId?: string
  ): Promise<{
    reputation: IChineseDiasporaRep;
    message: string;
    firstDiscovery: boolean;
  }> {
    const existing = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (existing && existing.discoveredNetwork) {
      return {
        reputation: existing,
        message: 'You are already known to the network.',
        firstDiscovery: false
      };
    }

    const rep = await ChineseDiasporaRep.discoverNetwork(
      characterId,
      method,
      initialNpcId
    );

    if (locationId) {
      rep.knownLocations.push(locationId);
      await rep.save();
    }

    // Grant initial reputation based on discovery method
    let initialRep = 10;
    let discoveryMessage = '';

    switch (method) {
      case DiscoveryMethodRep.HELPED_NPC:
        initialRep = 50;
        discoveryMessage = 'Your kindness has not gone unnoticed. The network remembers those who help without expectation of reward.';
        break;
      case DiscoveryMethodRep.WITNESSED_VIOLENCE:
        initialRep = 75;
        discoveryMessage = 'You stood against injustice when others turned away. This act of courage has earned their trust.';
        break;
      case DiscoveryMethodRep.VOUCHED_FOR:
        initialRep = 30;
        discoveryMessage = 'Someone within the network has spoken on your behalf. Prove yourself worthy of their faith.';
        break;
      case DiscoveryMethodRep.WONG_CHEN:
        initialRep = 20;
        discoveryMessage = 'Wong Chen sees potential in you. The network will be watching.';
        break;
      case DiscoveryMethodRep.QUEST_CHAIN:
        initialRep = 25;
        discoveryMessage = 'Your persistence has led you to something few outsiders ever find.';
        break;
    }

    rep.addReputation(initialRep, `Network discovery via ${method}`);
    await rep.save();

    logger.info(`Character ${characterId} discovered Chinese Diaspora network via ${method}`);

    return {
      reputation: rep,
      message: `Network Discovered: ${discoveryMessage}`,
      firstDiscovery: true
    };
  }

  /**
   * Add reputation to character
   */
  static async addReputation(
    characterId: string,
    action: DiasporaReputationAction,
    customAmount?: number,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{
    reputation: IChineseDiasporaRep;
    change: number;
    leveledUp: boolean;
    newLevel?: DiasporaTrustLevel;
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    }).session(session || null);

    if (!rep || !rep.discoveredNetwork) {
      throw new Error('Character has not discovered the network yet');
    }

    if (rep.isExiled()) {
      throw new Error('Character is exiled from the network');
    }

    const oldLevel = rep.trustLevel;
    const amount = customAmount !== undefined ? customAmount : REPUTATION_CHANGES[action];

    rep.addReputation(amount, action);
    await rep.save({ session });

    const leveledUp = rep.trustLevel > oldLevel;

    if (leveledUp) {
      await this.onTrustLevelUp(rep, oldLevel, rep.trustLevel);
    }

    logger.info(`Character ${characterId} gained ${amount} Diaspora reputation for ${action}`);

    return {
      reputation: rep,
      change: amount,
      leveledUp,
      newLevel: leveledUp ? rep.trustLevel : undefined
    };
  }

  /**
   * Remove reputation (for negative actions)
   */
  static async removeReputation(
    characterId: string,
    action: DiasporaReputationAction,
    customAmount?: number,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{
    reputation: IChineseDiasporaRep;
    change: number;
    leveledDown: boolean;
    exiled: boolean;
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    }).session(session || null);

    if (!rep || !rep.discoveredNetwork) {
      throw new Error('Character has not discovered the network yet');
    }

    const oldLevel = rep.trustLevel;
    const amount = Math.abs(customAmount !== undefined ? customAmount : REPUTATION_CHANGES[action]);

    rep.removeReputation(amount, action);

    // Check if action warrants betrayal record
    if (this.isBetrayalAction(action)) {
      const betrayal = this.createBetrayalRecord(action, amount, metadata);
      rep.recordBetrayal(betrayal);
    }

    await rep.save({ session });

    const leveledDown = rep.trustLevel < oldLevel;
    const exiled = rep.isExiled();

    if (exiled) {
      logger.warn(`Character ${characterId} has been EXILED from the Chinese Diaspora network`);
    }

    logger.info(`Character ${characterId} lost ${amount} Diaspora reputation for ${action}`);

    return {
      reputation: rep,
      change: -amount,
      leveledDown,
      exiled
    };
  }

  /**
   * Vouch for another character
   */
  static async vouchForCharacter(
    voucherId: string,
    targetCharacterId: string
  ): Promise<{
    success: boolean;
    message: string;
    trustGranted?: number;
  }> {
    const voucherRep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(voucherId)
    });

    if (!voucherRep || !voucherRep.discoveredNetwork) {
      return {
        success: false,
        message: 'You are not known to the network'
      };
    }

    if (voucherRep.trustLevel < DiasporaTrustLevel.SIBLING) {
      return {
        success: false,
        message: 'You do not have enough trust to vouch for others (requires Brother/Sister level)'
      };
    }

    if (voucherRep.isExiled()) {
      return {
        success: false,
        message: 'The exiled cannot vouch for anyone'
      };
    }

    const voucher = await Character.findById(voucherId);
    if (!voucher) {
      throw new Error('Voucher character not found');
    }

    const targetRep = await ChineseDiasporaRep.getOrCreateReputation(targetCharacterId);

    if (targetRep.discoveredNetwork && targetRep.trustLevel >= DiasporaTrustLevel.FAMILY) {
      return {
        success: false,
        message: 'This character is already well-known to the network'
      };
    }

    if (!targetRep.canBeVouched()) {
      return {
        success: false,
        message: 'This character cannot be vouched for'
      };
    }

    // Check if already vouched
    const alreadyVouched = targetRep.vouchedBy.some(
      v => v.voucherId === voucherId
    );

    if (alreadyVouched) {
      return {
        success: false,
        message: 'You have already vouched for this character'
      };
    }

    // Grant trust based on voucher's level
    let trustGranted = 50;
    if (voucherRep.trustLevel === DiasporaTrustLevel.DRAGON) {
      trustGranted = 100;
    } else if (voucherRep.trustLevel === DiasporaTrustLevel.FAMILY) {
      trustGranted = 75;
    }

    const vouchRecord: VouchRecord = {
      voucherId,
      voucherName: voucher.name,
      date: new Date(),
      trustGranted
    };

    targetRep.vouchedBy.push(vouchRecord);

    if (!targetRep.discoveredNetwork) {
      targetRep.discoveredNetwork = true;
      targetRep.discoveryMethod = DiscoveryMethodRep.VOUCHED_FOR;
      targetRep.discoveryDate = new Date();
      targetRep.networkStanding = NetworkStanding.NEUTRAL;
    }

    targetRep.addReputation(trustGranted, 'Vouched for by ' + voucher.name);
    await targetRep.save();

    // Record in voucher's records
    voucherRep.hasVouchedFor.push(targetCharacterId);
    await voucherRep.save();

    logger.info(`Character ${voucherId} vouched for ${targetCharacterId}, granting ${trustGranted} trust`);

    return {
      success: true,
      message: `You have vouched for this character. They now have the network's attention.`,
      trustGranted
    };
  }

  /**
   * Request safe house protection
   */
  static async requestSafeHouse(
    characterId: string,
    session?: mongoose.ClientSession
  ): Promise<{
    success: boolean;
    message: string;
    duration?: number;
    expiresAt?: Date;
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    }).session(session || null);

    if (!rep || !rep.discoveredNetwork) {
      return {
        success: false,
        message: 'Unknown to the network'
      };
    }

    if (rep.trustLevel < DiasporaTrustLevel.FAMILY) {
      return {
        success: false,
        message: 'Safe houses are only available to Family-level members (600+ reputation)'
      };
    }

    if (rep.permanentSafeHouse) {
      return {
        success: true,
        message: 'You have permanent safe house access as a Dragon of the network',
        duration: 0,
        expiresAt: undefined
      };
    }

    const duration = SAFE_HOUSE_DURATION[rep.trustLevel];
    rep.grantSafeHouse(duration);
    await rep.save({ session });

    logger.info(`Character ${characterId} granted safe house for ${duration} hours`);

    return {
      success: true,
      message: `The network will shelter you for ${duration} hours`,
      duration,
      expiresAt: rep.safeHouseExpiresAt!
    };
  }

  /**
   * Get available services for character
   */
  static async getAvailableServices(characterId: string): Promise<{
    trustLevel: DiasporaTrustLevel;
    services: DiasporaService[];
    levelInfo: typeof TRUST_LEVELS[DiasporaTrustLevel];
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (!rep || !rep.discoveredNetwork) {
      throw new Error('Network not discovered');
    }

    const levelInfo = rep.getTrustLevelInfo();

    return {
      trustLevel: rep.trustLevel,
      services: levelInfo.services,
      levelInfo
    };
  }

  /**
   * Get known NPCs based on trust level
   */
  static async getKnownNPCs(characterId: string): Promise<{
    knownNpcs: string[];
    maxRevealed: number;
    canLearnMore: boolean;
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (!rep || !rep.discoveredNetwork) {
      throw new Error('Network not discovered');
    }

    const maxRevealed = NPC_REVELATION[rep.trustLevel];
    const canLearnMore = rep.knownNpcs.length < maxRevealed;

    return {
      knownNpcs: rep.knownNpcs,
      maxRevealed,
      canLearnMore
    };
  }

  /**
   * Interact with network NPC
   */
  static async interactWithNPC(
    characterId: string,
    npcId: string
  ): Promise<{
    success: boolean;
    message: string;
    newNpcsRevealed?: string[];
  }> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (!rep || !rep.discoveredNetwork) {
      return {
        success: false,
        message: 'Unknown to the network'
      };
    }

    if (!rep.knownNpcs.includes(npcId)) {
      return {
        success: false,
        message: 'You do not know this person'
      };
    }

    rep.lastInteraction = new Date();
    await rep.save();

    // Check if trust level allows learning about more NPCs
    const { canLearnMore } = await this.getKnownNPCs(characterId);
    const newNpcs: string[] = [];

    if (canLearnMore) {
      // Logic for revealing new NPCs would go here
      // For now, just acknowledge the interaction
    }

    return {
      success: true,
      message: 'Interaction recorded',
      newNpcsRevealed: newNpcs.length > 0 ? newNpcs : undefined
    };
  }

  /**
   * Add entrusted secret
   */
  static async entrustSecret(
    characterId: string,
    secret: EntrustedSecret
  ): Promise<IChineseDiasporaRep> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (!rep || !rep.discoveredNetwork) {
      throw new Error('Network not discovered');
    }

    rep.addSecret(secret);
    await rep.save();

    logger.info(`Secret ${secret.secretId} entrusted to character ${characterId}`);

    return rep;
  }

  /**
   * Get leaderboard of Dragons
   */
  static async getDragonLeaderboard(limit: number = 10): Promise<IChineseDiasporaRep[]> {
    return ChineseDiasporaRep.getTopDragons(limit);
  }

  /**
   * Process weekly secret-keeping reputation gain
   */
  static async processWeeklySecretKeeping(characterId: string): Promise<void> {
    const rep = await ChineseDiasporaRep.findOne({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    if (!rep || !rep.discoveredNetwork) {
      return;
    }

    const now = new Date();
    const weeksSinceReset = Math.floor(
      (now.getTime() - rep.lastWeeklyReset.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    if (weeksSinceReset >= 1) {
      const secretsKept = rep.secrets.filter(s => !s.revealed).length;
      if (secretsKept > 0) {
        const bonusRep = Math.min(secretsKept * 5, 25); // Max 25 per week
        rep.addReputation(bonusRep, 'Weekly secret-keeping bonus');
        rep.weeklySecretKeeping = bonusRep;
        rep.lastWeeklyReset = now;
        await rep.save();

        logger.info(`Character ${characterId} received ${bonusRep} weekly reputation for keeping secrets`);
      }
    }
  }

  /**
   * Helper: Check if action is a betrayal
   */
  private static isBetrayalAction(action: DiasporaReputationAction): boolean {
    return [
      DiasporaReputationAction.BETRAY_SECRET,
      DiasporaReputationAction.HARM_NPC,
      DiasporaReputationAction.WORK_WITH_EXCLUSION,
      DiasporaReputationAction.REVEAL_SAFE_HOUSE,
      DiasporaReputationAction.STEAL
    ].includes(action);
  }

  /**
   * Helper: Create betrayal record
   */
  private static createBetrayalRecord(
    action: DiasporaReputationAction,
    reputationLoss: number,
    metadata?: any
  ): BetrayalRecord {
    let severity: 'minor' | 'major' | 'unforgivable' = 'minor';
    let description = '';

    switch (action) {
      case DiasporaReputationAction.BETRAY_SECRET:
        severity = 'major';
        description = 'Revealed a network secret to outsiders';
        break;
      case DiasporaReputationAction.HARM_NPC:
        severity = 'major';
        description = 'Harmed a member of the network';
        break;
      case DiasporaReputationAction.WORK_WITH_EXCLUSION:
        severity = 'unforgivable';
        description = 'Collaborated with Chinese Exclusion enforcers';
        break;
      case DiasporaReputationAction.REVEAL_SAFE_HOUSE:
        severity = 'unforgivable';
        description = 'Revealed the location of a safe house';
        break;
      case DiasporaReputationAction.STEAL:
        severity = 'minor';
        description = 'Stole from the community';
        break;
    }

    return {
      action,
      description,
      date: new Date(),
      severity,
      witnesses: metadata?.witnesses || []
    };
  }

  /**
   * Helper: Handle trust level up events
   */
  private static async onTrustLevelUp(
    rep: IChineseDiasporaRep,
    oldLevel: DiasporaTrustLevel,
    newLevel: DiasporaTrustLevel
  ): Promise<void> {
    logger.info(`Character ${rep.characterId} reached trust level ${newLevel}`);

    // Grant appropriate rewards/unlocks based on new level
    switch (newLevel) {
      case DiasporaTrustLevel.FRIEND:
        // Unlock basic services
        break;
      case DiasporaTrustLevel.SIBLING:
        // Unlock network services, reveal more NPCs
        break;
      case DiasporaTrustLevel.FAMILY:
        // Grant safe house access
        rep.safeHouseAccess = true;
        break;
      case DiasporaTrustLevel.DRAGON:
        // Grant permanent safe house
        rep.permanentSafeHouse = true;
        rep.safeHouseAccess = true;
        rep.networkStanding = NetworkStanding.HONORED;
        break;
    }
  }
}
