import { ObjectId } from 'mongodb';
import { NPCKnowledge, INPCKnowledge } from '../models/NPCKnowledge.model';
import { GossipItemModel } from '../models/GossipItem.model';
import {
  ReactionPattern,
  ReactionType,
  NPCReaction,
  ReactionBehavior,
  GossipTopic
} from '@desperados/shared';
import { getReactionPatternsForNPC } from '../data/npcReactionPatterns';

/**
 * NPC REACTION SERVICE
 * Handles how NPCs react to news, gossip, and player actions
 */

export class NPCReactionService {
  // ============================================================================
  // REACTION EVALUATION
  // ============================================================================

  /**
   * Evaluate NPC's reaction when player approaches
   */
  static async evaluatePlayerApproach(
    npcId: string,
    characterId: ObjectId | string,
    npcType: string,
    npcFaction?: string
  ): Promise<NPCReaction[]> {
    // Get NPC's knowledge about the character
    const knowledge = await NPCKnowledge.findOne({
      npcId,
      characterId
    });

    if (!knowledge) {
      // No knowledge = no reaction
      return [];
    }

    // Get reaction patterns for this NPC type
    const patterns = getReactionPatternsForNPC(npcType);

    const reactions: NPCReaction[] = [];

    // Check each pattern
    for (const pattern of patterns) {
      // Check faction requirements
      if (pattern.requiredFaction && pattern.requiredFaction !== npcFaction) {
        continue;
      }
      if (pattern.excludedFaction && pattern.excludedFaction === npcFaction) {
        continue;
      }

      // Check notoriety requirements
      const notoriety = await this.calculateNotoriety(characterId);
      if (pattern.minNotoriety && notoriety < pattern.minNotoriety) {
        continue;
      }
      if (pattern.maxNotoriety && notoriety > pattern.maxNotoriety) {
        continue;
      }

      // Check if any triggers match
      const triggered = await this.checkTriggers(
        pattern,
        knowledge,
        characterId,
        'player_nearby'
      );

      if (triggered) {
        const reaction = await this.createReaction(
          pattern,
          knowledge,
          notoriety
        );
        reactions.push(reaction);
      }
    }

    return reactions;
  }

  /**
   * Evaluate NPC's reaction when they hear gossip
   */
  static async evaluateGossipHeard(
    npcId: string,
    gossipId: ObjectId | string,
    npcType: string,
    npcFaction?: string
  ): Promise<NPCReaction[]> {
    const gossip = await GossipItemModel.findById(gossipId);
    if (!gossip) return [];

    // Get patterns for this NPC type
    const patterns = getReactionPatternsForNPC(npcType);

    const reactions: NPCReaction[] = [];

    for (const pattern of patterns) {
      // Check faction requirements
      if (pattern.requiredFaction && pattern.requiredFaction !== npcFaction) {
        continue;
      }
      if (pattern.excludedFaction && pattern.excludedFaction === npcFaction) {
        continue;
      }

      // Check if gossip triggers this reaction
      const triggered = pattern.triggers.some(trigger => {
        if (trigger.triggerType !== 'gossip_heard') return false;

        const cond = trigger.conditions;

        // Check topic
        if (cond.topic && !cond.topic.includes(gossip.topic)) {
          return false;
        }

        // Check sentiment
        if (cond.sentiment && !cond.sentiment.includes(gossip.sentiment)) {
          return false;
        }

        // Check truthfulness
        if (cond.minTruthfulness && gossip.truthfulness < cond.minTruthfulness) {
          return false;
        }

        // Check impact
        if (cond.minNotorietyImpact &&
            Math.abs(gossip.notorietyImpact) < cond.minNotorietyImpact) {
          return false;
        }

        return true;
      });

      if (triggered) {
        const reaction: NPCReaction = {
          reactionType: pattern.reactionType,
          intensity: Math.abs(gossip.notorietyImpact),
          triggeredBy: gossip._id as ObjectId,
          behaviorsTriggered: pattern.behaviors,
          startedAt: new Date(),
          duration: this.calculateDuration(pattern.reactionType, gossip.notorietyImpact),
          expiresAt: new Date(Date.now() + this.calculateDuration(pattern.reactionType, gossip.notorietyImpact) * 60000)
        };

        reactions.push(reaction);
      }
    }

    return reactions;
  }

  /**
   * Evaluate reaction to newspaper article
   */
  static async evaluateArticleRead(
    npcId: string,
    articleId: ObjectId | string,
    articleTopic: GossipTopic,
    articleSentiment: 'positive' | 'negative' | 'neutral' | 'shocking',
    npcType: string,
    npcFaction?: string
  ): Promise<NPCReaction[]> {
    const patterns = getReactionPatternsForNPC(npcType);
    const reactions: NPCReaction[] = [];

    for (const pattern of patterns) {
      // Check faction requirements
      if (pattern.requiredFaction && pattern.requiredFaction !== npcFaction) {
        continue;
      }
      if (pattern.excludedFaction && pattern.excludedFaction === npcFaction) {
        continue;
      }

      // Check article triggers
      const triggered = pattern.triggers.some(trigger => {
        if (trigger.triggerType !== 'article_read') return false;

        const cond = trigger.conditions;

        if (cond.topic && !cond.topic.includes(articleTopic)) {
          return false;
        }

        if (cond.sentiment && !cond.sentiment.includes(articleSentiment)) {
          return false;
        }

        return true;
      });

      if (triggered) {
        const reaction: NPCReaction = {
          reactionType: pattern.reactionType,
          intensity: 50, // Medium intensity for articles
          triggeredBy: articleId as ObjectId,
          behaviorsTriggered: pattern.behaviors,
          startedAt: new Date(),
          duration: this.calculateDuration(pattern.reactionType, 50),
          expiresAt: new Date(Date.now() + this.calculateDuration(pattern.reactionType, 50) * 60000)
        };

        reactions.push(reaction);
      }
    }

    return reactions;
  }

  // ============================================================================
  // BEHAVIOR APPLICATION
  // ============================================================================

  /**
   * Apply reaction behaviors to NPC interaction
   */
  static applyReactionBehaviors(
    reactions: NPCReaction[],
    basePrice?: number
  ): {
    willingToServe: boolean;
    priceModifier: number;
    dialogueSet: string;
    specialBehaviors: string[];
  } {
    let willingToServe = true;
    let priceModifier = 1.0;
    let dialogueSet = 'neutral';
    const specialBehaviors: string[] = [];

    // Process all active reactions
    for (const reaction of reactions) {
      if (new Date() > reaction.expiresAt) continue;

      for (const behavior of reaction.behaviorsTriggered) {
        switch (behavior.type) {
          case 'refuse_service':
            willingToServe = false;
            dialogueSet = behavior.params?.dialogueSet || 'hostile';
            break;

          case 'flee':
            willingToServe = false;
            specialBehaviors.push('flee');
            dialogueSet = 'fearful';
            break;

          case 'discount':
            priceModifier = Math.min(
              priceModifier,
              behavior.params?.priceModifier || 0.9
            );
            dialogueSet = behavior.params?.dialogueSet || 'friendly';
            break;

          case 'price_increase':
            priceModifier = Math.max(
              priceModifier,
              behavior.params?.priceModifier || 1.2
            );
            break;

          case 'call_law':
            specialBehaviors.push('call_law');
            break;

          case 'attack':
            willingToServe = false;
            specialBehaviors.push('attack');
            dialogueSet = 'hostile';
            break;

          case 'tip':
            specialBehaviors.push(`tip:${behavior.params?.tipContent || 'general'}`);
            break;

          case 'question':
            dialogueSet = behavior.params?.dialogueSet || 'curious';
            break;

          case 'gather':
            specialBehaviors.push('gather_crowd');
            break;

          case 'gossip':
            dialogueSet = behavior.params?.dialogueSet || 'gossipy';
            break;

          case 'limit_service':
            specialBehaviors.push('limited_service');
            if (behavior.params?.itemsRefused) {
              specialBehaviors.push(
                `refuse:${behavior.params.itemsRefused.join(',')}`
              );
            }
            break;
        }
      }
    }

    return {
      willingToServe,
      priceModifier,
      dialogueSet,
      specialBehaviors
    };
  }

  /**
   * Get dialogue modifications based on reactions
   */
  static getDialogueModifications(
    reactions: NPCReaction[],
    characterName: string
  ): {
    greeting?: string;
    comments: string[];
    questions: string[];
  } {
    const comments: string[] = [];
    const questions: string[] = [];
    let greeting: string | undefined;

    for (const reaction of reactions) {
      if (new Date() > reaction.expiresAt) continue;

      switch (reaction.reactionType) {
        case 'fear':
          if (reaction.intensity > 70) {
            greeting = `*backs away nervously* ${characterName}... I... I don't want any trouble.`;
            comments.push("I heard what you did. Please, just leave me be.");
          } else {
            comments.push(`People say ${characterName} is dangerous. Is that true?`);
          }
          break;

        case 'respect':
          if (reaction.intensity > 70) {
            greeting = `${characterName}! An honor to meet you.`;
            comments.push("The stories about you are impressive.");
          } else {
            comments.push(`You've made quite a name for yourself, ${characterName}.`);
          }
          break;

        case 'hostility':
          if (reaction.intensity > 70) {
            greeting = `${characterName}. You're not welcome here.`;
            comments.push("You've got a lot of nerve showing your face here.");
          } else {
            comments.push("I've heard about you. Keep your distance.");
          }
          break;

        case 'curiosity':
          questions.push("Is it true what they say about you?");
          questions.push("Tell me, what really happened?");
          comments.push(`Everyone's talking about ${characterName}.`);
          break;

        case 'admiration':
          greeting = `${characterName}! I've heard great things.`;
          comments.push("You're a legend around here.");
          break;

        case 'nervousness':
          comments.push("These are dangerous times...");
          comments.push("I'm not comfortable with all this trouble.");
          break;

        case 'disgust':
          comments.push("What you did was dishonorable.");
          comments.push("I want nothing to do with the likes of you.");
          break;

        case 'amusement':
          comments.push("I heard about that! *chuckles*");
          break;
      }
    }

    return {
      greeting,
      comments: comments.slice(0, 3), // Max 3 comments
      questions: questions.slice(0, 2) // Max 2 questions
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if pattern triggers match
   */
  private static async checkTriggers(
    pattern: ReactionPattern,
    knowledge: INPCKnowledge,
    characterId: ObjectId | string,
    triggerType: string
  ): Promise<boolean> {
    for (const trigger of pattern.triggers) {
      if (trigger.triggerType !== triggerType) continue;

      // For player_nearby triggers, check recent events
      if (triggerType === 'player_nearby') {
        const recentEvents = knowledge.events
          .filter(e => {
            const ageInDays = (Date.now() - e.learnedAt.getTime()) / (1000 * 60 * 60 * 24);
            return ageInDays < 7; // Events from last week
          });

        // Check if any recent events match the conditions
        const matches = recentEvents.some(event => {
          if (trigger.conditions.sentiment) {
            const eventSentiment = event.perceivedSentiment > 20 ? 'positive' :
                                   event.perceivedSentiment < -20 ? 'negative' : 'neutral';
            if (!trigger.conditions.sentiment.includes(eventSentiment as any)) {
              return false;
            }
          }

          if (trigger.conditions.minNotorietyImpact) {
            if (event.perceivedMagnitude < trigger.conditions.minNotorietyImpact) {
              return false;
            }
          }

          return true;
        });

        if (matches) return true;
      }
    }

    return false;
  }

  /**
   * Create reaction from pattern
   */
  private static async createReaction(
    pattern: ReactionPattern,
    knowledge: INPCKnowledge,
    notoriety: number
  ): Promise<NPCReaction> {
    // Calculate intensity using formula
    const intensity = this.calculateIntensity(
      pattern.intensityFormula,
      notoriety,
      knowledge.overallOpinion
    );

    const duration = this.calculateDuration(pattern.reactionType, intensity);

    return {
      reactionType: pattern.reactionType,
      intensity,
      triggeredBy: new ObjectId(), // Would be specific gossip/event ID
      behaviorsTriggered: pattern.behaviors,
      startedAt: new Date(),
      duration,
      expiresAt: new Date(Date.now() + duration * 60000)
    };
  }

  /**
   * Calculate intensity from formula
   */
  private static calculateIntensity(
    formula: string,
    notoriety: number,
    opinion: number
  ): number {
    // Simple formula evaluation
    // Supports: notoriety, opinion, basic math
    try {
      let result = formula
        .replace(/notoriety/g, notoriety.toString())
        .replace(/opinion/g, opinion.toString())
        .replace(/truthfulness/g, '50'); // Default

      // Safely evaluate simple math
      result = result.replace(/[\s]/g, '');

      // Basic evaluation (only supports *, +, -, /)
      const match = result.match(/^(\d+(?:\.\d+)?)([\*\+\-\/])(\d+(?:\.\d+)?)$/);
      if (match) {
        const a = parseFloat(match[1]);
        const op = match[2];
        const b = parseFloat(match[3]);

        switch (op) {
          case '*': return Math.min(100, a * b);
          case '+': return Math.min(100, a + b);
          case '-': return Math.max(0, a - b);
          case '/': return b !== 0 ? Math.min(100, a / b) : 0;
        }
      }

      // If just a number
      const num = parseFloat(result);
      if (!isNaN(num)) {
        return Math.min(100, Math.max(0, num));
      }

      return 50; // Default
    } catch (e) {
      return 50; // Default on error
    }
  }

  /**
   * Calculate reaction duration in minutes
   */
  private static calculateDuration(
    reactionType: ReactionType,
    intensity: number
  ): number {
    // Base durations by type (in minutes)
    const baseDurations: Record<ReactionType, number> = {
      fear: 60,
      respect: 120,
      hostility: 90,
      curiosity: 30,
      nervousness: 45,
      admiration: 180,
      disgust: 60,
      amusement: 15,
      indifference: 5
    };

    const base = baseDurations[reactionType] || 30;

    // Scale by intensity
    return Math.round(base * (intensity / 100) + base);
  }

  /**
   * Calculate character's overall notoriety
   */
  private static async calculateNotoriety(
    characterId: ObjectId | string
  ): Promise<number> {
    // Get all gossip about this character
    const gossip = await (GossipItemModel as any).findGossipAboutCharacter(
      characterId.toString()
    );

    if (gossip.length === 0) return 0;

    // Sum notoriety impacts
    const totalImpact = gossip.reduce(
      (sum, g) => sum + Math.abs(g.notorietyImpact),
      0
    );

    // Average and scale
    return Math.min(100, totalImpact / gossip.length);
  }
}
