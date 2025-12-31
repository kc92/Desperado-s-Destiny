/**
 * Last Stand Service
 *
 * Handles karma judgement when a character faces mortal danger.
 * The deities weigh the character's soul to determine if they will intervene.
 *
 * "The moment between life and death is when the gods pay closest attention."
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { CharacterKarma, ICharacterKarma, IBlessing } from '../models/CharacterKarma.model';
import { SecureRNG } from './base/SecureRNG';
import { MortalDangerService } from './mortalDanger.service';
import karmaService, { DEITY_AFFINITY_WEIGHTS } from './karma.service';
import logger from '../utils/logger';
import {
  KarmaJudgement,
  DivineSalvation,
  DivineSalvationEffect,
  DeityType,
  SalvationType,
  SALVATION_CONFIG,
  MortalDangerResult,
  SurvivalType,
  DevilDealType,
  ActiveDevilDeal
} from '@desperados/shared';
import { DeathType } from '@desperados/shared';

/**
 * Messages for divine salvation
 */
const GAMBLER_SALVATION_MESSAGES = [
  'A card flutters down from nowhere - the Ace of Spades. "Not today," whispers the wind.',
  'Time freezes. A silver coin spins in the air, landing on heads. "Fortune favors you... this once."',
  'The fatal blow stops inches from your heart. A playing card, glowing faintly, floats between you and death.',
  'You hear dice rolling in the distance. They come up sevens. "The house gives you one more play."',
  'A ghostly hand stays the killing blow. "Your story isn\'t finished," echoes a calm voice.',
];

const OUTLAW_KING_SALVATION_MESSAGES = [
  'The bullet stops mid-air. A scarred stranger tips his hat from the shadows. "You\'re mine now."',
  'Darkness wraps around you like a shield. "Death can wait. You still owe me," growls a deep voice.',
  'Blood and chaos swirl. When it clears, you still breathe. "The grave can wait," laughs the wind.',
  'A crown of thorns appears above your head, then fades. "I have plans for you, outlaw."',
  'The killing blow passes through you like smoke. "You belong to chaos. Death has no claim."',
];

/**
 * Effect templates for divine salvation
 */
const GAMBLER_GRACE_EFFECT: DivineSalvationEffect = {
  name: "Gambler's Grace",
  description: 'The Gambler has blessed you with fortune. Your luck in the Destiny Deck is enhanced.',
  durationHours: SALVATION_CONFIG.gamblerGraceDuration,
  bonuses: {
    destinyDeckBonus: SALVATION_CONFIG.gamblerGraceBonus
  }
};

const OUTLAW_DEBT_EFFECT: DivineSalvationEffect = {
  name: "Outlaw's Debt",
  description: 'The Outlaw King has spared you, but you owe a debt of chaos.',
  durationHours: SALVATION_CONFIG.outlawDebtDuration,
  bonuses: {
    crimeRewardBonus: SALVATION_CONFIG.outlawDebtBonus
  },
  requirement: {
    type: 'complete_chaotic_deed',
    deadline: new Date(Date.now() + SALVATION_CONFIG.outlawDeedDeadlineDays * 24 * 60 * 60 * 1000),
    failurePenalty: 'Lose the borrowed life - immediate permadeath'
  }
};

export class LastStandService {
  /**
   * Perform karma judgement to determine if a deity saves the character
   * This is the core of the Last Stand system
   */
  static async performKarmaJudgement(
    characterId: string,
    session?: mongoose.ClientSession
  ): Promise<MortalDangerResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get karma state
    const karma = await karmaService.getOrCreateKarma(characterId, session);

    // Build judgement state
    const judgement = this.buildKarmaJudgement(karma);

    logger.info(
      `Last Stand triggered for ${character.name}. ` +
      `Gambler Score: ${judgement.gamblerScore.toFixed(1)}, ` +
      `Outlaw Score: ${judgement.outlawScore.toFixed(1)}, ` +
      `Faith: ${judgement.faithLevel}, Sin: ${judgement.sinLevel}`
    );

    // Check for active devil deals first
    const dealResult = await this.checkDevilDeals(character, session);
    if (dealResult) {
      return dealResult;
    }

    // Calculate salvation chances
    const gamblerChance = this.calculateGamblerSalvation(judgement);
    const outlawChance = this.calculateOutlawSalvation(judgement);

    logger.info(
      `Salvation chances for ${character.name}: ` +
      `Gambler: ${(gamblerChance * 100).toFixed(1)}%, ` +
      `Outlaw King: ${(outlawChance * 100).toFixed(1)}%`
    );

    // Roll for Gambler salvation first (order matters)
    if (gamblerChance > 0 && SecureRNG.chance(gamblerChance)) {
      return await this.applyGamblerSalvation(character, karma, session);
    }

    // Roll for Outlaw King salvation
    if (outlawChance > 0 && SecureRNG.chance(outlawChance)) {
      return await this.applyOutlawSalvation(character, karma, session);
    }

    // No salvation - character faces permadeath
    logger.warn(
      `No divine salvation for ${character.name}. The gods have turned away.`
    );

    return {
      survived: false,
      message: 'The gods are silent. Your fate is sealed.',
      lastStandTriggered: true
    };
  }

  /**
   * Build karma judgement state from karma record
   */
  private static buildKarmaJudgement(karma: ICharacterKarma): KarmaJudgement {
    // Calculate deity scores based on affinity weights
    const gamblerScore = this.normalizeScore(karma.gamblerAffinity);
    const outlawScore = this.normalizeScore(karma.outlawKingAffinity);

    // Calculate faith and sin from relevant dimensions
    // Faith is derived from positive actions (Honor, Justice, Mercy, Charity)
    const faithLevel = Math.max(0, Math.min(100,
      (karma.karma.honor + karma.karma.justice + karma.karma.mercy + karma.karma.charity) / 4 + 50
    ));

    // Sin is derived from negative actions (Cruelty, Greed, Deception, Chaos)
    const sinLevel = Math.max(0, Math.min(100,
      (karma.karma.cruelty + karma.karma.greed + karma.karma.deception + karma.karma.chaos) / 4 + 50
    ));

    return {
      gamblerScore,
      outlawScore,
      faithLevel,
      sinLevel,
      dimensions: {
        mercy: karma.karma.mercy,
        cruelty: karma.karma.cruelty,
        greed: karma.karma.greed,
        charity: karma.karma.charity,
        justice: karma.karma.justice,
        chaos: karma.karma.chaos,
        honor: karma.karma.honor,
        deception: karma.karma.deception,
        survival: karma.karma.survival,
        loyalty: karma.karma.loyalty
      }
    };
  }

  /**
   * Normalize affinity score to 0-100 range
   */
  private static normalizeScore(affinity: number): number {
    // Affinity ranges from -100 to 100, normalize to 0-100
    return Math.max(0, Math.min(100, (affinity + 100) / 2));
  }

  /**
   * Calculate Gambler's salvation chance
   * The Gambler favors: Honor, Justice, Mercy, Faith
   * Sin blocks the Gambler's help
   */
  private static calculateGamblerSalvation(judgement: KarmaJudgement): number {
    // Must have minimum Gambler affinity
    if (judgement.gamblerScore < SALVATION_CONFIG.gamblerMinScore) {
      return 0;
    }

    // High sin blocks Gambler entirely
    if (judgement.sinLevel >= SALVATION_CONFIG.gamblerSinBlock) {
      logger.debug(`Gambler blocked by high sin level: ${judgement.sinLevel}`);
      return 0;
    }

    // Base chance from Gambler score
    const baseChance = judgement.gamblerScore / 100;

    // Faith multiplier (faith increases Gambler's reach)
    const faithMultiplier = (judgement.faithLevel / 100) * SALVATION_CONFIG.faithMultiplier;

    // Sin reduction (sin weakens Gambler's connection)
    const sinReduction = 1 - (judgement.sinLevel / 100) * 0.5;

    // Calculate final chance
    const finalChance = baseChance * faithMultiplier * sinReduction;

    // Cap at maximum
    return Math.min(finalChance, SALVATION_CONFIG.gamblerMaxChance);
  }

  /**
   * Calculate Outlaw King's salvation chance
   * The Outlaw King favors: Chaos, Survival, Deception
   * Sin actually helps with Outlaw salvation
   */
  private static calculateOutlawSalvation(judgement: KarmaJudgement): number {
    // Must have minimum Outlaw affinity
    if (judgement.outlawScore < SALVATION_CONFIG.outlawMinScore) {
      return 0;
    }

    // Base chance from Outlaw score
    const baseChance = judgement.outlawScore / 100;

    // Sin bonus (sin empowers Outlaw's connection)
    const sinBonus = 0.5 + (judgement.sinLevel / 100) * SALVATION_CONFIG.outlawSinBonus;

    // Calculate final chance
    const finalChance = baseChance * sinBonus;

    // Cap at maximum
    return Math.min(finalChance, SALVATION_CONFIG.outlawMaxChance);
  }

  /**
   * Apply Gambler's salvation
   */
  private static async applyGamblerSalvation(
    character: ICharacter,
    karma: ICharacterKarma,
    session?: mongoose.ClientSession
  ): Promise<MortalDangerResult> {
    // Select random message
    const message = GAMBLER_SALVATION_MESSAGES[
      Math.floor(SecureRNG.float(0, 1) * GAMBLER_SALVATION_MESSAGES.length)
    ];

    // Clear all fate marks
    await MortalDangerService.clearAllFateMarks(character._id.toString(), session);

    // Add blessing to karma
    const blessing: IBlessing = {
      source: 'GAMBLER',
      type: 'GAMBLERS_GRACE_SALVATION',
      power: 2,
      expiresAt: new Date(Date.now() + SALVATION_CONFIG.gamblerGraceDuration * 60 * 60 * 1000),
      description: GAMBLER_GRACE_EFFECT.description,
      grantedAt: new Date()
    };
    karma.blessings.push(blessing);
    await karma.save(session ? { session } : undefined);

    // Small faith boost
    const faithBoost = 5;

    logger.info(
      `GAMBLER SALVATION: ${character.name} was saved by The Gambler's grace!`
    );

    return {
      survived: true,
      survivalType: SurvivalType.DIVINE_GRACE,
      divineIntervention: {
        deity: DeityType.THE_GAMBLER,
        type: SalvationType.GRACE,
        message,
        effect: GAMBLER_GRACE_EFFECT,
        faithChange: faithBoost,
        sinChange: 0
      },
      message,
      lastStandTriggered: true
    };
  }

  /**
   * Apply Outlaw King's salvation
   */
  private static async applyOutlawSalvation(
    character: ICharacter,
    karma: ICharacterKarma,
    session?: mongoose.ClientSession
  ): Promise<MortalDangerResult> {
    // Select random message
    const message = OUTLAW_KING_SALVATION_MESSAGES[
      Math.floor(SecureRNG.float(0, 1) * OUTLAW_KING_SALVATION_MESSAGES.length)
    ];

    // Add blessing/curse hybrid to karma
    const blessing: IBlessing = {
      source: 'OUTLAW_KING',
      type: 'OUTLAWS_DEBT_SALVATION',
      power: 2,
      expiresAt: new Date(Date.now() + SALVATION_CONFIG.outlawDebtDuration * 60 * 60 * 1000),
      description: OUTLAW_DEBT_EFFECT.description,
      grantedAt: new Date()
    };
    karma.blessings.push(blessing);
    await karma.save(session ? { session } : undefined);

    // Sin increases from Outlaw deal
    const sinGain = 1;

    logger.info(
      `OUTLAW SALVATION: ${character.name} was saved by The Outlaw King's deal!`
    );

    return {
      survived: true,
      survivalType: SurvivalType.OUTLAW_DEBT,
      divineIntervention: {
        deity: DeityType.THE_OUTLAW_KING,
        type: SalvationType.DEAL,
        message,
        effect: OUTLAW_DEBT_EFFECT,
        faithChange: 0,
        sinChange: sinGain
      },
      message,
      lastStandTriggered: true
    };
  }

  /**
   * Check for active devil deals that could save the character
   */
  private static async checkDevilDeals(
    character: ICharacter,
    session?: mongoose.ClientSession
  ): Promise<MortalDangerResult | null> {
    // Get active devil deals (stored in character metadata)
    const devilDeals = (character as any).devilDeals as ActiveDevilDeal[] | undefined;
    if (!devilDeals || devilDeals.length === 0) {
      return null;
    }

    // Check for protective deals in priority order
    const protectiveDeals = [
      DevilDealType.SOUL_FRAGMENT,    // Auto Last Stand success
      DevilDealType.BORROWED_TIME,     // Guaranteed survival
    ];

    for (const dealType of protectiveDeals) {
      const deal = devilDeals.find(d =>
        d.type === dealType &&
        !d.consumed &&
        (!d.expiresAt || new Date(d.expiresAt) > new Date())
      );

      if (deal) {
        // Consume the deal
        deal.consumed = true;
        deal.consumedAt = new Date();
        await character.save(session ? { session } : undefined);

        logger.info(
          `Devil deal ${dealType} consumed to save ${character.name} from permadeath!`
        );

        const message = dealType === DevilDealType.SOUL_FRAGMENT
          ? 'Your soul fragment burns bright, pulling you back from the abyss. The Outlaw King collects his due.'
          : 'Time fractures around you. Your borrowed time pays its debt, and death passes you by.';

        return {
          survived: true,
          survivalType: SurvivalType.DEVIL_DEAL,
          dealConsumed: dealType,
          message,
          lastStandTriggered: true
        };
      }
    }

    return null;
  }

  /**
   * Check if character has Death's Delay (reduced death risk) active
   */
  static async hasDeathsDelay(characterId: string): Promise<boolean> {
    const character = await Character.findById(characterId);
    if (!character) return false;

    const devilDeals = (character as any).devilDeals as ActiveDevilDeal[] | undefined;
    if (!devilDeals) return false;

    return devilDeals.some(d =>
      d.type === DevilDealType.DEATHS_DELAY &&
      !d.consumed &&
      d.expiresAt && new Date(d.expiresAt) > new Date()
    );
  }

  /**
   * Get death risk modifier from active deals/blessings
   */
  static async getDeathRiskModifier(characterId: string): Promise<number> {
    let modifier = 1.0;

    // Check for Death's Delay
    if (await this.hasDeathsDelay(characterId)) {
      modifier *= 0.5; // 50% reduced death risk
    }

    // Check for karma blessings that affect death risk
    const karma = await karmaService.getOrCreateKarma(characterId);
    const activeBlessings = karma.getActiveBlessings();

    for (const blessing of activeBlessings) {
      if (blessing.type === 'GAMBLERS_GRACE_SALVATION') {
        modifier *= 0.9; // 10% reduced death risk from recent Gambler salvation
      }
    }

    return modifier;
  }

  /**
   * Get salvation preview (for UI display, no rolls)
   */
  static async getSalvationPreview(characterId: string): Promise<{
    gamblerChance: number;
    outlawChance: number;
    activeDeals: DevilDealType[];
    gamblerBlocked: boolean;
    gamblerBlockReason?: string;
  }> {
    const karma = await karmaService.getOrCreateKarma(characterId);
    const judgement = this.buildKarmaJudgement(karma);

    const gamblerChance = this.calculateGamblerSalvation(judgement);
    const outlawChance = this.calculateOutlawSalvation(judgement);

    // Check if Gambler is blocked
    const gamblerBlocked = judgement.sinLevel >= SALVATION_CONFIG.gamblerSinBlock ||
      judgement.gamblerScore < SALVATION_CONFIG.gamblerMinScore;

    let gamblerBlockReason: string | undefined;
    if (gamblerBlocked) {
      if (judgement.sinLevel >= SALVATION_CONFIG.gamblerSinBlock) {
        gamblerBlockReason = 'Your sins are too heavy. The Gambler cannot reach you.';
      } else if (judgement.gamblerScore < SALVATION_CONFIG.gamblerMinScore) {
        gamblerBlockReason = 'The Gambler does not know you. Build your honor and justice.';
      }
    }

    // Get active protective deals
    const character = await Character.findById(characterId);
    const devilDeals = (character as any)?.devilDeals as ActiveDevilDeal[] | undefined;
    const activeDeals = devilDeals
      ?.filter(d => !d.consumed && (!d.expiresAt || new Date(d.expiresAt) > new Date()))
      .map(d => d.type) || [];

    return {
      gamblerChance,
      outlawChance,
      activeDeals,
      gamblerBlocked,
      gamblerBlockReason
    };
  }
}

export default LastStandService;
