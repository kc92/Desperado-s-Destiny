/**
 * Deity Stranger Service
 *
 * Handles the spawning, management, and interaction of divine strangers.
 * Strangers are deity manifestations that appear at locations to test,
 * reward, warn, or converse with players.
 */

import mongoose, { Types } from 'mongoose';
import {
  DeityStranger,
  IDeityStranger,
  StrangerDisguise,
  InteractionType,
  TestType,
  IStrangerPayload
} from '../models/DeityStranger.model';
import { DeityAttention, DeityName } from '../models/DeityAttention.model';
import { CharacterKarma, ICharacterKarma } from '../models/CharacterKarma.model';
import { DivineManifestation } from '../models/DivineManifestation.model';
import { Character } from '../models/Character.model';
import { Location } from '../models/Location.model';
import deityDialogueService from './deityDialogue.service';
import logger from '../utils/logger';

// ============================================================================
// STRANGER TEMPLATES
// ============================================================================

interface IStrangerTemplate {
  disguise: StrangerDisguise;
  name: string;
  description: string;
  interactions: InteractionType[];
}

const GAMBLER_STRANGERS: IStrangerTemplate[] = [
  {
    disguise: 'card_sharp',
    name: 'Well-Dressed Stranger',
    description: 'A man with knowing eyes shuffles a deck of cards endlessly. Each card seems to catch the light just so.',
    interactions: ['DIALOGUE', 'TEST', 'TRADE']
  },
  {
    disguise: 'fortune_teller',
    name: 'Mysterious Fortune Teller',
    description: 'An old woman peers at you through clouded eyes that seem to see everything and nothing.',
    interactions: ['DIALOGUE', 'WARNING', 'GIFT']
  },
  {
    disguise: 'gambler',
    name: 'Lucky Lou',
    description: 'A gambler who never seems to lose. Not once. His smile says he knows things others do not.',
    interactions: ['TEST', 'TRADE']
  },
  {
    disguise: 'traveling_preacher',
    name: 'The Preacher',
    description: 'A traveling preacher with an old bible and older eyes. His sermons speak of fate and justice.',
    interactions: ['DIALOGUE', 'WARNING']
  },
  {
    disguise: 'mysterious_merchant',
    name: 'The Collector',
    description: 'A merchant selling curious wares. He seems more interested in souls than gold.',
    interactions: ['TRADE', 'TEST', 'GIFT']
  }
];

const OUTLAW_KING_STRANGERS: IStrangerTemplate[] = [
  {
    disguise: 'grizzled_outlaw',
    name: 'Scarred Drifter',
    description: 'A man with more scars than years left, but fire in his eyes that speaks of untamed spirit.',
    interactions: ['DIALOGUE', 'TEST', 'GIFT']
  },
  {
    disguise: 'masked_rider',
    name: 'The Masked Stranger',
    description: 'A figure in black who appeared from nowhere. The horse is wild-eyed and foaming.',
    interactions: ['WARNING', 'TEST']
  },
  {
    disguise: 'wild_woman',
    name: 'The Untamed One',
    description: 'A woman who moves like a wolf and speaks in riddles. She lives beyond the reach of law.',
    interactions: ['DIALOGUE', 'GIFT', 'TEST']
  },
  {
    disguise: 'escaped_prisoner',
    name: 'The Escapee',
    description: 'A man in torn prison garb. He ran from more than just iron bars.',
    interactions: ['DIALOGUE', 'WARNING']
  },
  {
    disguise: 'frontier_hermit',
    name: 'The Mountain Man',
    description: 'A hermit who knows the wild places. He speaks of freedom like others speak of water.',
    interactions: ['TEST', 'TRADE', 'GIFT']
  }
];

// ============================================================================
// TEST TEMPLATES
// ============================================================================

interface ITestTemplate {
  type: TestType;
  description: string;
  passCondition: string;
  passReward: { type: 'BLESSING' | 'GOLD' | 'ITEM' | 'INFORMATION'; value: string | number };
  failPenalty: { type: 'CURSE' | 'GOLD_LOSS' | 'KARMA_LOSS'; value: string | number };
}

const GAMBLER_TESTS: ITestTemplate[] = [
  {
    type: 'CARD_GAME',
    description: 'Draw a card. Speak truth about what you see.',
    passCondition: 'Honest interpretation',
    passReward: { type: 'BLESSING', value: 'FORTUNE_FAVOR' },
    failPenalty: { type: 'KARMA_LOSS', value: 'DECEPTION:5' }
  },
  {
    type: 'MORAL_CHOICE',
    description: 'A man owes you gold but his family starves. What do you do?',
    passCondition: 'Show mercy',
    passReward: { type: 'BLESSING', value: 'RIGHTEOUS_HAND' },
    failPenalty: { type: 'KARMA_LOSS', value: 'MERCY:-10' }
  },
  {
    type: 'WAGER',
    description: 'Bet something precious. Win, and gain more. Lose, and learn.',
    passCondition: 'Accept the wager',
    passReward: { type: 'GOLD', value: 500 },
    failPenalty: { type: 'GOLD_LOSS', value: 250 }
  }
];

const OUTLAW_KING_TESTS: ITestTemplate[] = [
  {
    type: 'TRUST_TEST',
    description: 'A lawman approaches. He asks for your help catching an outlaw. What do you say?',
    passCondition: 'Refuse to help the law',
    passReward: { type: 'BLESSING', value: 'WILD_SPIRIT' },
    failPenalty: { type: 'KARMA_LOSS', value: 'CHAOS:-5' }
  },
  {
    type: 'MORAL_CHOICE',
    description: 'You find a locked box in the road. Breaking it is illegal. What do you do?',
    passCondition: 'Break it open',
    passReward: { type: 'ITEM', value: 'mysterious_trinket' },
    failPenalty: { type: 'CURSE', value: 'CHAINS_OF_ORDER' }
  },
  {
    type: 'WAGER',
    description: 'Risk your reputation for a chance at freedom. Do you accept?',
    passCondition: 'Take the risk',
    passReward: { type: 'BLESSING', value: 'UNKILLABLE' },
    failPenalty: { type: 'KARMA_LOSS', value: 'SURVIVAL:-5' }
  }
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

class DeityStrangerService {
  /**
   * Spawn a new stranger at a location
   */
  async spawnStranger(
    deity: DeityName,
    locationId: Types.ObjectId,
    targetCharacterId?: Types.ObjectId
  ): Promise<IDeityStranger | null> {
    try {
      // Get location name
      const location = await Location.findById(locationId);
      const locationName = location?.name || 'Unknown Location';

      // Select stranger template
      const templates = deity === 'GAMBLER' ? GAMBLER_STRANGERS : OUTLAW_KING_STRANGERS;
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Select interaction type
      const interactionType = template.interactions[
        Math.floor(Math.random() * template.interactions.length)
      ];

      // Generate payload
      const payload = await this.generatePayload(deity, interactionType, targetCharacterId);

      // Calculate expiration (4 hours default)
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

      // Create stranger
      const stranger = new DeityStranger({
        deitySource: deity,
        name: template.name,
        description: template.description,
        disguise: template.disguise,
        locationId,
        locationName,
        targetCharacterId: targetCharacterId || null,
        interactionType,
        payload,
        expiresAt,
        status: 'WAITING'
      });

      await stranger.save();

      logger.info(`Spawned ${deity} stranger at ${locationName}`, {
        strangerId: stranger._id,
        disguise: template.disguise,
        interactionType,
        targeted: !!targetCharacterId
      });

      return stranger;
    } catch (error) {
      logger.error('Error spawning stranger:', error);
      return null;
    }
  }

  /**
   * Generate interaction payload based on type
   */
  private async generatePayload(
    deity: DeityName,
    interactionType: InteractionType,
    targetCharacterId?: Types.ObjectId
  ): Promise<IStrangerPayload> {
    const payload: IStrangerPayload = {};

    // Get karma context if targeted
    let karma: ICharacterKarma | null = null;
    if (targetCharacterId) {
      karma = await CharacterKarma.findByCharacterId(targetCharacterId);
    }
    const affinity = karma
      ? (deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity)
      : 0;

    switch (interactionType) {
      case 'DIALOGUE':
        payload.dialogue = this.generateDialogue(deity, affinity);
        payload.responseOptions = this.generateResponseOptions(deity);
        break;

      case 'TEST':
        const tests = deity === 'GAMBLER' ? GAMBLER_TESTS : OUTLAW_KING_TESTS;
        const test = tests[Math.floor(Math.random() * tests.length)];
        payload.testType = test.type;
        payload.testDescription = test.description;
        payload.passReward = test.passReward;
        payload.failPenalty = test.failPenalty;
        break;

      case 'TRADE':
        payload.tradeOffer = this.generateTradeOffer(deity);
        break;

      case 'GIFT':
        const giftResult = this.generateGift(deity, affinity);
        payload.giftType = giftResult.type;
        payload.giftDescription = giftResult.description;
        break;

      case 'WARNING':
        payload.warningMessage = this.generateWarning(deity, karma);
        payload.warningAbout = this.determineWarningSubject(karma);
        break;
    }

    return payload;
  }

  /**
   * Generate dialogue lines for a stranger
   */
  private generateDialogue(deity: DeityName, affinity: number): string[] {
    const isPositive = affinity > 0;

    if (deity === 'GAMBLER') {
      if (isPositive) {
        return [
          'The cards speak well of you, stranger.',
          'Fate has brought us together for a reason.',
          'I see honor in your eyes. That is rare in these parts.'
        ];
      } else {
        return [
          'You play a dangerous game, friend.',
          'The deck holds many secrets. Some should remain hidden.',
          'Not all debts are paid in gold.'
        ];
      }
    } else {
      if (isPositive) {
        return [
          'The wild places whisper your name.',
          'Freedom recognizes its own.',
          'You understand what it means to live unchained.'
        ];
      } else {
        return [
          'You smell like civilization. Like fear.',
          'The cage you carry is one of your own making.',
          'Break free, or be broken.'
        ];
      }
    }
  }

  /**
   * Generate response options for dialogue
   */
  private generateResponseOptions(deity: DeityName): Array<{
    text: string;
    karmaEffect?: { dimension: string; delta: number };
    reward?: string;
  }> {
    if (deity === 'GAMBLER') {
      return [
        {
          text: 'Tell me more about my fate.',
          karmaEffect: { dimension: 'HONOR', delta: 2 },
          reward: 'insight'
        },
        {
          text: 'I make my own fate.',
          karmaEffect: { dimension: 'CHAOS', delta: 3 }
        },
        {
          text: 'I must be going.',
        }
      ];
    } else {
      return [
        {
          text: 'What must I do to be free?',
          karmaEffect: { dimension: 'CHAOS', delta: 2 },
          reward: 'insight'
        },
        {
          text: 'There is strength in order.',
          karmaEffect: { dimension: 'JUSTICE', delta: 3 }
        },
        {
          text: 'I have nothing to say to you.',
        }
      ];
    }
  }

  /**
   * Generate trade offer
   */
  private generateTradeOffer(deity: DeityName): {
    gives: string;
    wants: string;
    goldCost?: number;
  } {
    if (deity === 'GAMBLER') {
      const offers = [
        { gives: 'A glimpse of tomorrow', wants: 'A promise of honor', goldCost: 100 },
        { gives: 'Fortune\'s favor for a day', wants: 'An honest confession' },
        { gives: 'Lucky charm', wants: 'Your word', goldCost: 50 }
      ];
      return offers[Math.floor(Math.random() * offers.length)];
    } else {
      const offers = [
        { gives: 'The secret of escape', wants: 'A law broken' },
        { gives: 'Wild spirit\'s blessing', wants: 'An act of defiance', goldCost: 75 },
        { gives: 'The outlaw\'s way', wants: 'Your chains', goldCost: 150 }
      ];
      return offers[Math.floor(Math.random() * offers.length)];
    }
  }

  /**
   * Generate gift based on affinity
   */
  private generateGift(deity: DeityName, affinity: number): {
    type: string;
    description: string;
  } {
    const isPositive = affinity > 0;

    if (deity === 'GAMBLER') {
      if (isPositive) {
        return {
          type: 'LUCK_BLESSING',
          description: 'A worn playing card with an ace. It feels warm to the touch.'
        };
      } else {
        return {
          type: 'WARNING_TOKEN',
          description: 'A dead man\'s hand. Five cards, all black.'
        };
      }
    } else {
      if (isPositive) {
        return {
          type: 'FREEDOM_BLESSING',
          description: 'A key that fits no lock you\'ve ever seen. Yet.'
        };
      } else {
        return {
          type: 'CHAINS_REMINDER',
          description: 'A rusted chain link. A reminder of what awaits the tamed.'
        };
      }
    }
  }

  /**
   * Generate warning message
   */
  private generateWarning(deity: DeityName, karma: ICharacterKarma | null): string {
    if (deity === 'GAMBLER') {
      if (karma && karma.getActiveCurses().length > 0) {
        return 'You carry curses like stones in your pocket. Each one pulls you deeper.';
      }
      return 'The cards show danger ahead. Tread carefully, for fate is not always kind.';
    } else {
      if (karma && karma.karma.justice > 30) {
        return 'You lean too heavily on order. The wild places forget those who forget them.';
      }
      return 'Chains approach from all directions. Will you run, or will you fight?';
    }
  }

  /**
   * Determine what the warning is about
   */
  private determineWarningSubject(karma: ICharacterKarma | null): string {
    if (!karma) return 'unknown_danger';

    // Check for upcoming issues based on karma
    if (karma.karma.greed > 50) return 'greed_consequences';
    if (karma.karma.cruelty > 50) return 'vengeance_coming';
    if (karma.karma.deception > 50) return 'lies_unraveling';
    if (Math.abs(karma.gamblerAffinity) > 75 || Math.abs(karma.outlawKingAffinity) > 75) {
      return 'divine_attention';
    }

    return 'general_danger';
  }

  /**
   * Find strangers available to a character at their location
   */
  async findStrangersForCharacter(
    characterId: string | Types.ObjectId,
    locationId?: string | Types.ObjectId
  ): Promise<IDeityStranger[]> {
    return DeityStranger.findAvailableForCharacter(characterId, locationId);
  }

  /**
   * Start an interaction with a stranger
   */
  async startInteraction(
    strangerId: string | Types.ObjectId,
    characterId: string | Types.ObjectId
  ): Promise<{ success: boolean; stranger?: IDeityStranger; error?: string }> {
    try {
      const stranger = await DeityStranger.findById(strangerId);
      if (!stranger) {
        return { success: false, error: 'Stranger not found' };
      }

      // Pre-check availability (helps provide better error messages)
      if (!stranger.isAvailableFor(characterId)) {
        return { success: false, error: 'Stranger is not available for interaction' };
      }

      // Atomic operation - will throw if stranger is no longer available
      // This protects against TOCTOU race conditions
      await stranger.startInteraction(characterId);

      // Create manifestation record
      const manifestation = new DivineManifestation({
        deityName: stranger.deitySource,
        targetCharacterId: characterId,
        type: 'STRANGER',
        message: `You encounter ${stranger.name}. ${stranger.description}`,
        effect: JSON.stringify({
          strangerId: stranger._id,
          interactionType: stranger.interactionType
        }),
        urgency: 'MEDIUM',
        delivered: true,
        acknowledged: false
      });
      await manifestation.save();

      return { success: true, stranger };
    } catch (error) {
      // Handle specific error from atomic startInteraction
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('no longer available')) {
        logger.debug('Stranger was claimed by another character', { strangerId, characterId });
        return { success: false, error: 'The mysterious stranger has already moved on.' };
      }
      logger.error('Error starting stranger interaction:', error);
      return { success: false, error: 'Failed to start interaction' };
    }
  }

  /**
   * Complete an interaction (process result)
   */
  async completeInteraction(
    strangerId: string | Types.ObjectId,
    characterId: string | Types.ObjectId,
    result: {
      testPassed?: boolean;
      responseChosen?: number;
      tradeAccepted?: boolean;
      giftAccepted?: boolean;
    }
  ): Promise<{ success: boolean; rewards?: Record<string, unknown>; error?: string }> {
    try {
      const stranger = await DeityStranger.findById(strangerId);
      if (!stranger) {
        return { success: false, error: 'Stranger not found' };
      }

      if (stranger.currentlyInteractingWith?.toString() !== characterId.toString()) {
        return { success: false, error: 'Not currently interacting with this stranger' };
      }

      const rewards: Record<string, unknown> = {};

      // Process based on interaction type
      switch (stranger.interactionType) {
        case 'TEST':
          if (result.testPassed !== undefined) {
            await this.processTestResult(characterId, stranger, result.testPassed);
            rewards.testResult = result.testPassed ? 'passed' : 'failed';
            if (result.testPassed && stranger.payload.passReward) {
              rewards.reward = stranger.payload.passReward;
            }
          }
          await stranger.completeInteraction(result.testPassed);
          break;

        case 'DIALOGUE':
          if (result.responseChosen !== undefined) {
            await this.processDialogueResponse(characterId, stranger, result.responseChosen);
            const option = stranger.payload.responseOptions?.[result.responseChosen];
            if (option?.reward) {
              rewards.insight = option.reward;
            }
          }
          await stranger.completeInteraction();
          break;

        case 'TRADE':
          if (result.tradeAccepted) {
            await this.processTradeAccepted(characterId, stranger);
            rewards.trade = stranger.payload.tradeOffer;
          }
          await stranger.completeInteraction();
          break;

        case 'GIFT':
          if (result.giftAccepted) {
            rewards.gift = {
              type: stranger.payload.giftType,
              description: stranger.payload.giftDescription
            };
          }
          await stranger.completeInteraction();
          break;

        case 'WARNING':
          rewards.warning = {
            message: stranger.payload.warningMessage,
            about: stranger.payload.warningAbout
          };
          await stranger.completeInteraction();
          break;
      }

      // Update attention record
      const attention = await DeityAttention.findByCharacterAndDeity(
        characterId,
        stranger.deitySource
      );
      if (attention) {
        attention.recordIntervention('STRANGER');
        await attention.save();
      }

      return { success: true, rewards };
    } catch (error) {
      logger.error('Error completing stranger interaction:', error);
      return { success: false, error: 'Failed to complete interaction' };
    }
  }

  /**
   * Process test result
   */
  private async processTestResult(
    characterId: string | Types.ObjectId,
    stranger: IDeityStranger,
    passed: boolean
  ): Promise<void> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return;

    if (passed && stranger.payload.passReward) {
      const reward = stranger.payload.passReward;
      if (reward.type === 'BLESSING') {
        karma.blessings.push({
          source: stranger.deitySource,
          type: reward.value as string,
          power: 1,
          description: `Reward from ${stranger.name}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          grantedAt: new Date()
        });
      } else if (reward.type === 'GOLD') {
        // Gold would be added via gold service
        logger.debug(`Should grant ${reward.value} gold to ${characterId}`);
      }
    } else if (!passed && stranger.payload.failPenalty) {
      const penalty = stranger.payload.failPenalty;
      if (penalty.type === 'CURSE') {
        karma.curses.push({
          source: stranger.deitySource,
          type: penalty.value as string,
          severity: 1,
          description: `Penalty from ${stranger.name}`,
          removalCondition: 'Complete a redemption action',
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          inflictedAt: new Date()
        });
      } else if (penalty.type === 'KARMA_LOSS') {
        const [dimension, amount] = (penalty.value as string).split(':');
        const dim = dimension.toLowerCase() as keyof typeof karma.karma;
        if (karma.karma[dim] !== undefined) {
          karma.karma[dim] = Math.max(-100, karma.karma[dim] - parseInt(amount, 10));
        }
      }
    }

    await karma.save();
  }

  /**
   * Process dialogue response
   */
  private async processDialogueResponse(
    characterId: string | Types.ObjectId,
    stranger: IDeityStranger,
    responseIndex: number
  ): Promise<void> {
    const option = stranger.payload.responseOptions?.[responseIndex];
    if (!option) return;

    if (option.karmaEffect) {
      const karma = await CharacterKarma.findByCharacterId(characterId);
      if (karma) {
        const dim = option.karmaEffect.dimension.toLowerCase() as keyof typeof karma.karma;
        if (karma.karma[dim] !== undefined) {
          karma.karma[dim] = Math.max(-100, Math.min(100,
            karma.karma[dim] + option.karmaEffect.delta
          ));
          await karma.save();
        }
      }
    }
  }

  /**
   * Process accepted trade
   */
  private async processTradeAccepted(
    characterId: string | Types.ObjectId,
    stranger: IDeityStranger
  ): Promise<void> {
    // Trade processing would interact with gold service, inventory service, etc.
    // For now, just log it
    logger.debug(`Trade accepted by ${characterId}`, {
      trade: stranger.payload.tradeOffer
    });
  }

  /**
   * Cleanup expired strangers
   */
  async cleanupExpiredStrangers(): Promise<{ deleted: number }> {
    return DeityStranger.cleanupExpired();
  }
}

export const deityStrangerService = new DeityStrangerService();
export default deityStrangerService;
