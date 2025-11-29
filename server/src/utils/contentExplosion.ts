/**
 * Content Explosion Utilities
 *
 * Integration utilities for connecting the procedural template system
 * with existing game services.
 * Part of Phase D - Content Explosion System
 */

import { TemplateResolverService, TemplateContext } from '../services/templateResolver.service';
import { CrimeOutcome } from '../data/crimeOutcomeTemplates';
import { GossipCategory, MoodType } from '@desperados/shared';
import { GossipTone } from '../data/gossipExpansion';
import { NPCRole, DialogueContext, DialogueMood } from '../data/npcDialogueTemplates';
import { QuestType } from '../data/questTemplates';
import logger from './logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CrimeOutcomeResult {
  message: string;
  goldEarned?: number;
  xpEarned?: number;
  itemFound?: string;
  wantedIncrease?: number;
  jailTime?: number;
  bountyIncrease?: number;
  reputationChange?: { faction: string; amount: number };
}

export interface GossipGenerationResult {
  headline: string;
  content: string;
  truthValue: number;
  spreadRate: number;
  category: string;
  tone: string;
}

export interface DialogueResult {
  text: string;
  mood: string;
  context: string;
  responseOptions?: { text: string; effect: string }[];
}

export interface QuestGenerationResult {
  id: string;
  title: string;
  description: string;
  briefing?: string;
  objectives: {
    type: string;
    description: string;
    target?: string;
    location?: string;
    count?: number;
    optional?: boolean;
    hidden?: boolean;
  }[];
  rewards: {
    gold?: number;
    xp?: number;
    item?: string;
    reputation?: { faction: string; amount: number }[];
  };
  tags: string[];
  levelRange: { min: number; max: number };
  timeLimit?: number;
  repeatable: boolean;
}

// ============================================================================
// CRIME INTEGRATION
// ============================================================================

/**
 * Generate a rich crime outcome message with rewards/consequences
 *
 * Use in CrimeService after determining success/failure
 */
export async function generateCrimeOutcomeMessage(
  crimeType: string,
  outcome: 'success' | 'partial' | 'failure' | 'caught',
  characterId: string,
  characterName: string,
  locationId?: string
): Promise<CrimeOutcomeResult> {
  const context: TemplateContext = {
    characterId,
    characterName,
    PLAYER: characterName,
    locationId,
  };

  const result = await TemplateResolverService.generateCrimeOutcome(
    crimeType,
    outcome as CrimeOutcome,
    context
  );

  if (!result) {
    // Fallback to basic messages
    return {
      message: getBasicCrimeMessage(crimeType, outcome),
    };
  }

  return {
    message: result.resolvedText,
    goldEarned: result.rewards?.gold,
    xpEarned: result.rewards?.xp,
    itemFound: result.rewards?.item,
    wantedIncrease: result.consequences?.wanted,
    jailTime: result.consequences?.jailTime,
    bountyIncrease: result.consequences?.bounty,
    reputationChange: result.consequences?.reputationChange,
  };
}

/**
 * Basic fallback messages for crimes
 */
function getBasicCrimeMessage(crimeType: string, outcome: string): string {
  const messages: Record<string, Record<string, string>> = {
    robbery: {
      success: 'You pulled off the robbery without a hitch.',
      partial: 'The robbery was partially successful.',
      failure: 'The robbery failed.',
      caught: 'You were caught red-handed!',
    },
    pickpocket: {
      success: 'Your nimble fingers found their mark.',
      partial: 'You managed to grab something, but not much.',
      failure: 'Your target was too alert.',
      caught: 'They caught your hand in their pocket!',
    },
    default: {
      success: 'You succeeded.',
      partial: 'Partial success.',
      failure: 'You failed.',
      caught: 'You were caught!',
    },
  };

  const crimeMessages = messages[crimeType] || messages.default;
  return crimeMessages[outcome] || crimeMessages.default;
}

// ============================================================================
// GOSSIP INTEGRATION
// ============================================================================

/**
 * Generate gossip content for the gossip system
 *
 * Use in GossipService when creating new gossip items
 */
export async function generateGossipContent(
  options: {
    category?: GossipCategory;
    tone?: GossipTone;
    eventType?: string;
    aboutCharacterId?: string;
    aboutCharacterName?: string;
    locationId?: string;
  } = {}
): Promise<GossipGenerationResult | null> {
  const context: TemplateContext = {
    characterId: options.aboutCharacterId,
    characterName: options.aboutCharacterName,
    PLAYER: options.aboutCharacterName,
    locationId: options.locationId,
  };

  const result = await TemplateResolverService.generateGossip(context, {
    category: options.category,
    tone: options.tone,
    eventType: options.eventType,
  });

  if (!result) {
    return null;
  }

  // Generate a headline from the first sentence
  const firstSentence = result.resolvedText.split(/[.!?]/)[0];
  const headline = firstSentence.length > 50
    ? firstSentence.substring(0, 47) + '...'
    : firstSentence;

  return {
    headline,
    content: result.resolvedText,
    truthValue: result.truthValue,
    spreadRate: result.spreadRate,
    category: result.category,
    tone: result.template.tone,
  };
}

/**
 * Generate gossip when specific events occur
 */
export async function generateEventGossip(
  eventType: string,
  eventData: {
    characterId?: string;
    characterName?: string;
    targetId?: string;
    targetName?: string;
    locationId?: string;
    amount?: number;
  }
): Promise<GossipGenerationResult | null> {
  const context: TemplateContext = {
    characterId: eventData.characterId,
    characterName: eventData.characterName,
    PLAYER: eventData.characterName,
    TARGET: eventData.targetName,
    VICTIM: eventData.targetName,
    locationId: eventData.locationId,
    GOLD: eventData.amount?.toString(),
    AMOUNT: eventData.amount?.toString(),
  };

  return generateGossipContent({
    eventType,
    aboutCharacterId: eventData.characterId,
    aboutCharacterName: eventData.characterName,
    locationId: eventData.locationId,
  });
}

// ============================================================================
// NPC DIALOGUE INTEGRATION
// ============================================================================

/**
 * Generate NPC dialogue based on their role and mood
 *
 * Use in NPCService for dynamic conversations
 */
export async function generateNPCDialogue(
  npcRole: string,
  mood: MoodType | DialogueMood,
  context: DialogueContext,
  options: {
    characterId?: string;
    characterName?: string;
    recentLocation?: string;
    gossip?: string;
  } = {}
): Promise<DialogueResult | null> {
  const templateContext: TemplateContext = {
    characterId: options.characterId,
    characterName: options.characterName,
    PLAYER: options.characterName || 'stranger',
    RECENT_LOCATION: options.recentLocation,
    GOSSIP: options.gossip,
  };

  // Map string role to NPCRole
  const mappedRole = TemplateResolverService.mapNPCRoleToDialogueRole(npcRole);

  const result = await TemplateResolverService.generateDialogue(
    mappedRole,
    mood,
    context,
    templateContext
  );

  if (!result) {
    return null;
  }

  return {
    text: result.resolvedText,
    mood: result.mood,
    context: result.context,
    responseOptions: result.template.responseOptions?.map((r) => ({
      text: r.text,
      effect: r.effect || 'neutral',
    })),
  };
}

/**
 * Get a greeting for an NPC based on their mood and player relationship
 */
export async function getNPCGreeting(
  npcRole: string,
  mood: MoodType,
  characterName: string
): Promise<string> {
  const result = await generateNPCDialogue(npcRole, mood, 'greeting', {
    characterName,
  });

  return result?.text || 'Hello.';
}

/**
 * Get trade dialogue for an NPC
 */
export async function getNPCTradeDialogue(
  npcRole: string,
  mood: MoodType,
  characterName: string
): Promise<string> {
  const result = await generateNPCDialogue(npcRole, mood, 'trade', {
    characterName,
  });

  return result?.text || 'Here\'s what I have for sale.';
}

/**
 * Get gossip from an NPC
 */
export async function getNPCGossipDialogue(
  npcRole: string,
  mood: MoodType,
  characterName: string,
  gossipContent?: string
): Promise<string> {
  const result = await generateNPCDialogue(npcRole, mood, 'gossip', {
    characterName,
    gossip: gossipContent || 'something interesting happened recently',
  });

  return result?.text || 'I don\'t know anything.';
}

// ============================================================================
// QUEST INTEGRATION
// ============================================================================

/**
 * Generate procedural quests for an NPC to offer
 *
 * Use in QuestService when player talks to NPC about work
 */
export async function generateQuestsForNPC(
  npcRole: string,
  characterLevel: number,
  characterId: string,
  characterName: string,
  count: number = 3
): Promise<QuestGenerationResult[]> {
  const context: TemplateContext = {
    characterId,
    characterName,
    PLAYER: characterName,
  };

  const quests = await TemplateResolverService.generateQuestOptions(
    npcRole,
    characterLevel,
    count,
    context
  );

  return quests.map((quest) => ({
    id: `generated_${quest.template.id}_${Date.now()}`,
    title: quest.resolvedTitle,
    description: quest.resolvedDescription,
    briefing: quest.resolvedBriefing,
    objectives: quest.objectives,
    rewards: quest.rewards,
    tags: quest.template.tags || [],
    levelRange: quest.template.levelRange || { min: 1, max: 50 },
    timeLimit: quest.template.timeLimit ? parseInt(quest.template.timeLimit, 10) : undefined,
    repeatable: quest.template.repeatable || false,
  }));
}

/**
 * Generate a single quest of a specific type
 */
export async function generateQuest(
  type: QuestType,
  characterLevel: number,
  characterId: string,
  characterName: string,
  giverRole?: string
): Promise<QuestGenerationResult | null> {
  const context: TemplateContext = {
    characterId,
    characterName,
    PLAYER: characterName,
  };

  const quest = await TemplateResolverService.generateQuest(
    { type, level: characterLevel, giverRole },
    context
  );

  if (!quest) {
    return null;
  }

  return {
    id: `generated_${quest.template.id}_${Date.now()}`,
    title: quest.resolvedTitle,
    description: quest.resolvedDescription,
    briefing: quest.resolvedBriefing,
    objectives: quest.objectives,
    rewards: quest.rewards,
    tags: quest.template.tags || [],
    levelRange: quest.template.levelRange || { min: 1, max: 50 },
    timeLimit: quest.template.timeLimit ? parseInt(quest.template.timeLimit, 10) : undefined,
    repeatable: quest.template.repeatable || false,
  };
}

/**
 * Generate bounty quests
 */
export async function generateBountyQuests(
  characterLevel: number,
  characterId: string,
  characterName: string,
  count: number = 3
): Promise<QuestGenerationResult[]> {
  const context: TemplateContext = {
    characterId,
    characterName,
    PLAYER: characterName,
  };

  const quests: QuestGenerationResult[] = [];

  for (let i = 0; i < count; i++) {
    const quest = await TemplateResolverService.generateQuest(
      { type: 'bounty', level: characterLevel },
      context
    );

    if (quest) {
      quests.push({
        id: `bounty_${quest.template.id}_${Date.now()}_${i}`,
        title: quest.resolvedTitle,
        description: quest.resolvedDescription,
        briefing: quest.resolvedBriefing,
        objectives: quest.objectives,
        rewards: quest.rewards,
        tags: quest.template.tags || [],
        levelRange: quest.template.levelRange || { min: 1, max: 50 },
        timeLimit: quest.template.timeLimit ? parseInt(quest.template.timeLimit, 10) : undefined,
        repeatable: quest.template.repeatable || false,
      });
    }
  }

  return quests;
}

// ============================================================================
// STATISTICS AND REPORTING
// ============================================================================

/**
 * Get content explosion statistics for monitoring/debugging
 */
export function getContentStatistics(): {
  templates: {
    crime: number;
    gossip: number;
    dialogue: number;
    quest: number;
  };
  estimatedCombinations: {
    crime: number;
    gossip: number;
    dialogue: number;
    quest: number;
    total: number;
  };
} {
  const stats = TemplateResolverService.getContentStatistics();

  return {
    templates: {
      crime: stats.crimeTemplates,
      gossip: stats.gossipTemplates,
      dialogue: stats.dialogueTemplates,
      quest: stats.questTemplates,
    },
    estimatedCombinations: {
      crime: stats.estimatedCrimeCombinations,
      gossip: stats.estimatedGossipCombinations,
      dialogue: stats.estimatedDialogueVariations,
      quest: stats.estimatedQuestCombinations,
      total: stats.totalEstimatedContent,
    },
  };
}

/**
 * Log content statistics
 */
export function logContentStatistics(): void {
  const stats = getContentStatistics();

  logger.info('=== CONTENT EXPLOSION STATISTICS ===');
  logger.info(`Templates:`);
  logger.info(`  - Crime Outcomes: ${stats.templates.crime}`);
  logger.info(`  - Gossip: ${stats.templates.gossip}`);
  logger.info(`  - NPC Dialogue: ${stats.templates.dialogue}`);
  logger.info(`  - Quests: ${stats.templates.quest}`);
  logger.info(`Estimated Unique Combinations:`);
  logger.info(`  - Crime Outcomes: ${stats.estimatedCombinations.crime.toLocaleString()}`);
  logger.info(`  - Gossip: ${stats.estimatedCombinations.gossip.toLocaleString()}`);
  logger.info(`  - NPC Dialogue: ${stats.estimatedCombinations.dialogue.toLocaleString()}`);
  logger.info(`  - Quests: ${stats.estimatedCombinations.quest.toLocaleString()}`);
  logger.info(`  - TOTAL: ${stats.estimatedCombinations.total.toLocaleString()}`);
  logger.info('====================================');
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  generateCrimeOutcomeMessage,
  generateGossipContent,
  generateEventGossip,
  generateNPCDialogue,
  getNPCGreeting,
  getNPCTradeDialogue,
  getNPCGossipDialogue,
  generateQuestsForNPC,
  generateQuest,
  generateBountyQuests,
  getContentStatistics,
  logContentStatistics,
};
