/**
 * Template Resolver Service
 *
 * Core service for resolving procedural templates with dynamic content.
 * Part of Phase D - Content Explosion System
 *
 * Provides:
 * - Variable substitution from pools and database
 * - Crime outcome generation
 * - Gossip generation
 * - NPC dialogue generation
 * - Quest generation
 */

import { NPC } from '../models/NPC.model';
import { Location } from '../models/Location.model';
import { Item } from '../models/Item.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';

import {
  CrimeOutcomeTemplate,
  ALL_CRIME_TEMPLATES,
  VARIABLE_POOLS,
  getTemplates as getCrimeTemplates,
  getWitnessOutcome,
  getRandomFromPool,
  CrimeOutcome,
} from '../data/crimeOutcomeTemplates';

import {
  GossipExpansionTemplate,
  ALL_GOSSIP_TEMPLATES,
  GOSSIP_VARIABLE_POOLS,
  getGossipTemplatesByCategory,
  getGossipTemplatesByTone,
  getGossipTemplatesByEvent,
  getRandomEmbellishment,
  getRandomDegradation,
  degradeTruthValue,
  GossipTone,
} from '../data/gossipExpansion';

import {
  DialogueTemplate,
  ALL_DIALOGUE_TEMPLATES,
  getDialogueTemplate,
  getRandomDialogue,
  mapMoodToDialogueMood,
  NPCRole,
  DialogueMood,
  DialogueContext,
} from '../data/npcDialogueTemplates';

import {
  QuestTemplate,
  ALL_QUEST_TEMPLATES,
  QUEST_VARIABLE_POOLS,
  getQuestTemplatesByType,
  getQuestTemplatesForLevel,
  getQuestTemplatesForGiver,
  QuestType,
} from '../data/questTemplates';

import { GossipCategory, MoodType } from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';

import logger from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateContext {
  characterId?: string;
  characterName?: string;
  locationId?: string;
  npcId?: string;
  gangId?: string;
  recentLocation?: string;
  [key: string]: any;
}

export interface NPCFilters {
  role?: string;
  locationId?: string;
  faction?: string;
  excludeIds?: string[];
}

export interface LocationFilters {
  type?: string;
  region?: string;
  excludeIds?: string[];
}

export interface ItemFilters {
  category?: string;
  rarity?: string;
  excludeIds?: string[];
}

export interface ResolvedCrimeOutcome {
  template: CrimeOutcomeTemplate;
  resolvedText: string;
  rewards?: {
    gold?: number;
    xp?: number;
    item?: string;
  };
  consequences?: {
    wanted?: number;
    jailTime?: number;
    bounty?: number;
    reputationChange?: { faction: string; amount: number };
  };
}

export interface ResolvedGossip {
  template: GossipExpansionTemplate;
  resolvedText: string;
  truthValue: number;
  spreadRate: number;
  category: GossipCategory;
  embellishment?: string;
  variables: Record<string, string>;
}

export interface ResolvedDialogue {
  template: DialogueTemplate;
  resolvedText: string;
  variables: Record<string, string>;
  mood: DialogueMood;
  context: DialogueContext;
}

export interface ResolvedQuest {
  template: QuestTemplate;
  resolvedTitle: string;
  resolvedDescription: string;
  resolvedBriefing?: string;
  variables: Record<string, string>;
  objectives: ResolvedObjective[];
  rewards: ResolvedRewards;
}

export interface ResolvedObjective {
  type: string;
  description: string;
  target?: string;
  location?: string;
  count?: number;
  optional?: boolean;
  hidden?: boolean;
}

export interface ResolvedRewards {
  gold?: number;
  xp?: number;
  item?: string;
  reputation?: { faction: string; amount: number }[];
}

// ============================================================================
// TEMPLATE RESOLVER SERVICE
// ============================================================================

export class TemplateResolverService {
  // =========================================================================
  // CORE RESOLUTION METHODS
  // =========================================================================

  /**
   * Resolve a template string with context variables
   */
  static async resolve(
    template: string,
    context: TemplateContext
  ): Promise<string> {
    let resolved = template;

    // First pass: Replace known context variables
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`\\{${key.toUpperCase()}\\}`, 'g');
        resolved = resolved.replace(regex, String(value));
      }
    }

    // Second pass: Find remaining variables and resolve from pools/database
    const variableRegex = /\{([A-Z_]+)\}/g;
    let match;
    const unresolvedVariables: string[] = [];

    while ((match = variableRegex.exec(resolved)) !== null) {
      unresolvedVariables.push(match[1]);
    }

    for (const variable of unresolvedVariables) {
      const value = await this.resolveVariable(variable, context);
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      resolved = resolved.replace(regex, value);
    }

    return resolved;
  }

  /**
   * Resolve a single variable from pools or database
   */
  static async resolveVariable(
    variable: string,
    context: TemplateContext
  ): Promise<string> {
    // Check crime variable pools
    if (VARIABLE_POOLS[variable as keyof typeof VARIABLE_POOLS]) {
      return getRandomFromPool(variable as keyof typeof VARIABLE_POOLS);
    }

    // Check gossip variable pools
    if (GOSSIP_VARIABLE_POOLS[variable as keyof typeof GOSSIP_VARIABLE_POOLS]) {
      const pool = GOSSIP_VARIABLE_POOLS[variable as keyof typeof GOSSIP_VARIABLE_POOLS];
      return SecureRNG.select(pool);
    }

    // Check quest variable pools
    if (QUEST_VARIABLE_POOLS[variable as keyof typeof QUEST_VARIABLE_POOLS]) {
      const pool = QUEST_VARIABLE_POOLS[variable as keyof typeof QUEST_VARIABLE_POOLS];
      return SecureRNG.select(pool);
    }

    // Database lookups for specific variables
    switch (variable) {
      case 'NPC':
      case 'NPC1':
      case 'NPC2':
      case 'TARGET':
      case 'VICTIM':
      case 'THIEF':
      case 'SHERIFF':
      case 'RECIPIENT':
        return await this.getRandomNPCName(context);

      case 'LOCATION':
      case 'DESTINATION':
      case 'ORIGIN':
      case 'MEETUP_LOCATION':
      case 'ALTERNATE_LOCATION':
        return await this.getRandomLocationName(context);

      case 'GANG':
      case 'GANG1':
      case 'GANG2':
        return await this.getRandomGangName(context);

      case 'PLAYER':
        return context.characterName || 'stranger';

      case 'GOLD':
      case 'BASE_GOLD':
      case 'BONUS_GOLD':
        return this.generateGoldAmount(10, 200);

      case 'BOUNTY':
        return this.generateGoldAmount(50, 500);

      case 'COUNT':
      case 'NUMBER':
      case 'CATTLE_COUNT':
      case 'GANG_COUNT':
      case 'GUARD_COUNT':
        return String(SecureRNG.range(2, 6));

      case 'WITNESS_OUTCOME':
        return getWitnessOutcome(false);

      case 'TIME_PERIOD':
        return this.getRandomTimePeriod();

      case 'GOSSIP':
        // Recursive gossip generation - careful to avoid infinite loops
        return 'something interesting happened recently';

      default:
        logger.warn(`Unresolved template variable: ${variable}`);
        return `[${variable}]`;
    }
  }

  // =========================================================================
  // DATABASE HELPER METHODS
  // =========================================================================

  /**
   * Get a random NPC for template
   */
  static async getRandomNPC(filters?: NPCFilters): Promise<any | null> {
    try {
      const query: any = {};
      if (filters?.role) query.role = filters.role;
      if (filters?.locationId) query.locationId = filters.locationId;
      if (filters?.faction) query.faction = filters.faction;
      if (filters?.excludeIds) query._id = { $nin: filters.excludeIds };

      const count = await NPC.countDocuments(query);
      if (count === 0) return null;

      const random = SecureRNG.range(0, count - 1);
      const npc = await NPC.findOne(query).skip(random);
      return npc;
    } catch (error) {
      logger.error('Error getting random NPC:', error);
      return null;
    }
  }

  /**
   * Get a random NPC name
   */
  static async getRandomNPCName(context: TemplateContext): Promise<string> {
    const npc = await this.getRandomNPC();
    if (npc) return npc.name;

    // Fallback to pool
    const fallbackNames = [
      'Jake McGraw', 'Sarah Jenkins', 'Doc Morrison', 'Sheriff Cole',
      'Madame Rose', 'Black Jack', 'One-Eye Morgan', 'Ruby Heart',
      'Ezekiel Goldstein', 'Maria Santos', 'Old Bill', 'Fingers O\'Malley',
    ];
    return SecureRNG.select(fallbackNames);
  }

  /**
   * Get a random location for template
   */
  static async getRandomLocation(filters?: LocationFilters): Promise<any | null> {
    try {
      const query: any = {};
      if (filters?.type) query.type = filters.type;
      if (filters?.region) query.region = filters.region;
      if (filters?.excludeIds) query._id = { $nin: filters.excludeIds };

      const count = await Location.countDocuments(query);
      if (count === 0) return null;

      const random = SecureRNG.range(0, count - 1);
      const location = await Location.findOne(query).skip(random);
      return location;
    } catch (error) {
      logger.error('Error getting random location:', error);
      return null;
    }
  }

  /**
   * Get a random location name
   */
  static async getRandomLocationName(context: TemplateContext): Promise<string> {
    const location = await this.getRandomLocation();
    if (location) return location.name;

    // Fallback to pool
    const fallbackLocations = [
      'the saloon', 'Dead Man\'s Gulch', 'the old mine', 'Snake Ridge',
      'the trading post', 'Ghost Canyon', 'the railroad depot', 'the church',
      'the cemetery', 'Coyote Pass', 'the river crossing', 'Devil\'s Butte',
    ];
    return SecureRNG.select(fallbackLocations);
  }

  /**
   * Get a random item for template
   */
  static async getRandomItem(filters?: ItemFilters): Promise<any | null> {
    try {
      const query: any = {};
      if (filters?.category) query.category = filters.category;
      if (filters?.rarity) query.rarity = filters.rarity;
      if (filters?.excludeIds) query._id = { $nin: filters.excludeIds };

      const count = await Item.countDocuments(query);
      if (count === 0) return null;

      const random = SecureRNG.range(0, count - 1);
      const item = await Item.findOne(query).skip(random);
      return item;
    } catch (error) {
      logger.error('Error getting random item:', error);
      return null;
    }
  }

  /**
   * Get a random gang name
   */
  static async getRandomGangName(context: TemplateContext): Promise<string> {
    try {
      const count = await Gang.countDocuments({});
      if (count > 0) {
        const random = SecureRNG.range(0, count - 1);
        const gang = await Gang.findOne({}).skip(random);
        if (gang) return gang.name;
      }
    } catch (error) {
      // Fall through to fallback
    }

    // Fallback to pool
    const fallbackGangs = [
      'the Desperados', 'the Red River Gang', 'the Comancheros',
      'Black Jack\'s Boys', 'the Night Riders', 'the Border Bandits',
    ];
    return SecureRNG.select(fallbackGangs);
  }

  // =========================================================================
  // GENERATION HELPER METHODS
  // =========================================================================

  /**
   * Generate a random gold amount in range
   */
  static generateGoldAmount(min: number, max: number): string {
    return String(SecureRNG.range(min, max));
  }

  /**
   * Get random time period string
   */
  static getRandomTimePeriod(): string {
    const periods = [
      'last night', 'yesterday', 'two days ago', 'last week',
      'a few hours ago', 'this morning', 'just now',
    ];
    return SecureRNG.select(periods);
  }

  /**
   * Parse gold formula (e.g., '50-100' or '{BASE_GOLD}')
   */
  static parseGoldAmount(formula: string): number {
    if (formula.includes('-')) {
      const [min, max] = formula.split('-').map(Number);
      return SecureRNG.range(min, max);
    }
    return parseInt(formula, 10) || 0;
  }

  // =========================================================================
  // CRIME OUTCOME GENERATION
  // =========================================================================

  /**
   * Generate a crime outcome with resolved template
   */
  static async generateCrimeOutcome(
    crimeType: string,
    outcome: CrimeOutcome,
    context: TemplateContext
  ): Promise<ResolvedCrimeOutcome | null> {
    const templates = getCrimeTemplates(crimeType, outcome);

    if (templates.length === 0) {
      logger.warn(`No templates found for crime type: ${crimeType}, outcome: ${outcome}`);
      return null;
    }

    // Weight by rarity
    const weightedTemplates = templates.flatMap((t) => {
      const weight = t.rarity === 'rare' ? 1 : t.rarity === 'uncommon' ? 3 : 5;
      return Array(weight).fill(t);
    });

    const template = SecureRNG.select(weightedTemplates);

    // Add witness outcome based on the crime outcome
    const witnessContext = {
      ...context,
      WITNESS_OUTCOME: getWitnessOutcome(
        outcome === 'caught' || outcome === 'partial',
        outcome === 'partial'
      ),
    };

    const resolvedText = await this.resolve(template.template, witnessContext);

    // Parse rewards
    let rewards: ResolvedCrimeOutcome['rewards'];
    if (template.rewards) {
      rewards = {};
      if (template.rewards.gold) {
        const goldStr = await this.resolve(template.rewards.gold, context);
        rewards.gold = this.parseGoldAmount(goldStr);
      }
      if (template.rewards.xp) {
        rewards.xp = parseInt(template.rewards.xp, 10);
      }
      if (template.rewards.item) {
        rewards.item = await this.resolve(template.rewards.item, context);
      }
    }

    // Parse consequences
    let consequences: ResolvedCrimeOutcome['consequences'];
    if (template.consequences) {
      consequences = {};
      if (template.consequences.wanted) {
        consequences.wanted = parseInt(template.consequences.wanted, 10);
      }
      if (template.consequences.jailTime) {
        consequences.jailTime = parseInt(template.consequences.jailTime, 10);
      }
      if (template.consequences.bounty) {
        consequences.bounty = parseInt(template.consequences.bounty, 10);
      }
      if (template.consequences.reputation) {
        consequences.reputationChange = {
          faction: template.consequences.reputation.faction,
          amount: parseInt(template.consequences.reputation.amount, 10),
        };
      }
    }

    return {
      template,
      resolvedText,
      rewards,
      consequences,
    };
  }

  // =========================================================================
  // GOSSIP GENERATION
  // =========================================================================

  /**
   * Generate gossip with resolved template
   */
  static async generateGossip(
    context: TemplateContext,
    options?: {
      category?: GossipCategory;
      tone?: GossipTone;
      eventType?: string;
    }
  ): Promise<ResolvedGossip | null> {
    let templates = [...ALL_GOSSIP_TEMPLATES];

    // Filter by options
    if (options?.category) {
      templates = templates.filter((t) => t.category === options.category);
    }
    if (options?.tone) {
      templates = templates.filter((t) => t.tone === options.tone);
    }
    if (options?.eventType) {
      templates = templates.filter(
        (t) => t.triggerEvents && t.triggerEvents.includes(options.eventType)
      );
    }

    if (templates.length === 0) {
      logger.warn('No gossip templates found for given options');
      return null;
    }

    const template = SecureRNG.select(templates);

    // Track resolved variables
    const variables: Record<string, string> = {};

    // Resolve template, capturing variables
    let resolvedText = template.template;
    const variableRegex = /\{([A-Z_0-9]+)\}/g;
    let match;

    while ((match = variableRegex.exec(template.template)) !== null) {
      const variable = match[1];
      if (!variables[variable]) {
        variables[variable] = await this.resolveVariable(variable, context);
      }
    }

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      resolvedText = resolvedText.replace(regex, value);
    }

    // Maybe add embellishment
    const embellishment = SecureRNG.chance(0.3) ? getRandomEmbellishment(template) : null;

    return {
      template,
      resolvedText,
      truthValue: template.truthValue,
      spreadRate: template.spreadRate,
      category: template.category,
      embellishment: embellishment || undefined,
      variables,
    };
  }

  /**
   * Spread gossip with potential degradation
   */
  static async spreadGossip(
    originalGossip: ResolvedGossip,
    spreadCount: number
  ): Promise<ResolvedGossip> {
    const degradedTruth = degradeTruthValue(
      originalGossip.truthValue,
      spreadCount,
      originalGossip.template
    );

    // Maybe add degradation
    const degradation = spreadCount > 0 ? getRandomDegradation(originalGossip.template) : null;

    let newText = originalGossip.resolvedText;
    if (degradation) {
      // Resolve degradation variables
      const resolvedDegradation = await this.resolve(degradation, originalGossip.variables);
      newText += ' ' + resolvedDegradation;
    }

    // Maybe add embellishment
    const embellishment = SecureRNG.chance(0.4) ? getRandomEmbellishment(originalGossip.template) : null;
    if (embellishment && !originalGossip.embellishment) {
      const resolvedEmbellishment = await this.resolve(embellishment, originalGossip.variables);
      newText += ' ' + resolvedEmbellishment;
    }

    return {
      ...originalGossip,
      resolvedText: newText,
      truthValue: degradedTruth,
      embellishment: embellishment || originalGossip.embellishment,
    };
  }

  // =========================================================================
  // NPC DIALOGUE GENERATION
  // =========================================================================

  /**
   * Generate NPC dialogue based on role, mood, and context
   */
  static async generateDialogue(
    npcRole: NPCRole,
    mood: MoodType | DialogueMood,
    context: DialogueContext,
    templateContext: TemplateContext
  ): Promise<ResolvedDialogue | null> {
    // Convert MoodType to DialogueMood if needed
    const dialogueMood: DialogueMood =
      typeof mood === 'string' && ['friendly', 'neutral', 'hostile', 'fearful', 'drunk'].includes(mood)
        ? (mood as DialogueMood)
        : mapMoodToDialogueMood(mood as MoodType);

    const template = getDialogueTemplate(npcRole, dialogueMood, context);

    if (!template) {
      logger.warn(
        `No dialogue template found for role: ${npcRole}, mood: ${dialogueMood}, context: ${context}`
      );
      return null;
    }

    const dialogueText = getRandomDialogue(template);

    // Track resolved variables
    const variables: Record<string, string> = {};

    let resolvedText = dialogueText;
    const variableRegex = /\{([A-Z_0-9]+)\}/g;
    let match;

    while ((match = variableRegex.exec(dialogueText)) !== null) {
      const variable = match[1];
      if (!variables[variable]) {
        variables[variable] = await this.resolveVariable(variable, templateContext);
      }
    }

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      resolvedText = resolvedText.replace(regex, value);
    }

    return {
      template,
      resolvedText,
      variables,
      mood: dialogueMood,
      context,
    };
  }

  /**
   * Generate dialogue for a specific NPC by ID
   */
  static async generateDialogueForNPC(
    npcId: string,
    context: DialogueContext,
    templateContext: TemplateContext
  ): Promise<ResolvedDialogue | null> {
    try {
      const npc = await NPC.findById(npcId);
      if (!npc) {
        logger.warn(`NPC not found: ${npcId}`);
        return null;
      }

      // Get NPC mood (would integrate with MoodService in production)
      const mood: DialogueMood = 'neutral';

      // Map NPC role to dialogue role
      const role = this.mapNPCRoleToDialogueRole(npc.role);

      const enrichedContext: TemplateContext = {
        ...templateContext,
        NPC: npc.name,
      };

      return this.generateDialogue(role, mood, context, enrichedContext);
    } catch (error) {
      logger.error('Error generating dialogue for NPC:', error);
      return null;
    }
  }

  /**
   * Map NPC role string to DialogueRole
   */
  static mapNPCRoleToDialogueRole(role: string): NPCRole {
    const roleMap: Record<string, NPCRole> = {
      bartender: 'bartender',
      barkeep: 'bartender',
      sheriff: 'sheriff',
      marshal: 'sheriff',
      deputy: 'sheriff',
      merchant: 'merchant',
      shopkeeper: 'merchant',
      trader: 'merchant',
      blacksmith: 'blacksmith',
      smith: 'blacksmith',
      doctor: 'doctor',
      doc: 'doctor',
      physician: 'doctor',
      banker: 'banker',
      saloon_girl: 'saloon_girl',
      dancer: 'saloon_girl',
      rancher: 'rancher',
      farmer: 'rancher',
      outlaw: 'outlaw',
      bandit: 'outlaw',
      criminal: 'outlaw',
      preacher: 'preacher',
      priest: 'preacher',
      reverend: 'preacher',
    };

    return roleMap[role.toLowerCase()] || 'merchant'; // Default to merchant
  }

  // =========================================================================
  // QUEST GENERATION
  // =========================================================================

  /**
   * Generate a procedural quest
   */
  static async generateQuest(
    options: {
      type?: QuestType;
      level?: number;
      giverRole?: string;
      tags?: string[];
    },
    context: TemplateContext
  ): Promise<ResolvedQuest | null> {
    let templates = [...ALL_QUEST_TEMPLATES];

    // Filter by options
    if (options.type) {
      templates = getQuestTemplatesByType(options.type);
    }
    if (options.level) {
      templates = templates.filter(
        (t) =>
          !t.levelRange ||
          (options.level! >= t.levelRange.min && options.level! <= t.levelRange.max)
      );
    }
    if (options.giverRole) {
      templates = templates.filter(
        (t) => !t.giverRoles || t.giverRoles.includes(options.giverRole!)
      );
    }
    if (options.tags && options.tags.length > 0) {
      templates = templates.filter(
        (t) => t.tags && options.tags!.some((tag) => t.tags!.includes(tag))
      );
    }

    if (templates.length === 0) {
      logger.warn('No quest templates found for given options');
      return null;
    }

    const template = SecureRNG.select(templates);

    // Track resolved variables
    const variables: Record<string, string> = {};

    // Resolve all variables first (for consistency across title, description, objectives)
    const allText = [
      template.title,
      template.description,
      template.briefing || '',
      ...template.objectives.map((o) => o.description),
    ].join(' ');

    const variableRegex = /\{([A-Z_0-9]+)\}/g;
    let match;

    while ((match = variableRegex.exec(allText)) !== null) {
      const variable = match[1];
      if (!variables[variable]) {
        variables[variable] = await this.resolveVariable(variable, context);
      }
    }

    // Helper to resolve text
    const resolveText = (text: string): string => {
      let resolved = text;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        resolved = resolved.replace(regex, value);
      }
      return resolved;
    };

    const resolvedTitle = resolveText(template.title);
    const resolvedDescription = resolveText(template.description);
    const resolvedBriefing = template.briefing ? resolveText(template.briefing) : undefined;

    // Resolve objectives
    const resolvedObjectives: ResolvedObjective[] = template.objectives.map((obj) => ({
      type: obj.type,
      description: resolveText(obj.description),
      target: obj.target ? resolveText(obj.target) : undefined,
      location: obj.location ? resolveText(obj.location) : undefined,
      count: typeof obj.count === 'string' ? parseInt(resolveText(obj.count), 10) : obj.count,
      optional: obj.optional,
      hidden: obj.hidden,
    }));

    // Resolve rewards
    const resolvedRewards: ResolvedRewards = {};
    if (template.rewards.gold) {
      const goldStr = resolveText(template.rewards.gold);
      resolvedRewards.gold = this.parseGoldAmount(goldStr);
    }
    if (template.rewards.xp) {
      resolvedRewards.xp = parseInt(template.rewards.xp, 10);
    }
    if (template.rewards.item) {
      resolvedRewards.item = resolveText(template.rewards.item);
    }
    if (template.rewards.reputation) {
      resolvedRewards.reputation = template.rewards.reputation.map((r) => ({
        faction: resolveText(r.faction),
        amount: parseInt(r.amount, 10),
      }));
    }

    return {
      template,
      resolvedTitle,
      resolvedDescription,
      resolvedBriefing,
      variables,
      objectives: resolvedObjectives,
      rewards: resolvedRewards,
    };
  }

  /**
   * Generate multiple quest options for an NPC
   */
  static async generateQuestOptions(
    npcRole: string,
    characterLevel: number,
    count: number = 3,
    context: TemplateContext
  ): Promise<ResolvedQuest[]> {
    const quests: ResolvedQuest[] = [];
    const usedTemplateIds: string[] = [];

    for (let i = 0; i < count; i++) {
      let templates = getQuestTemplatesForGiver(npcRole);
      templates = templates.filter(
        (t) =>
          !t.levelRange ||
          (characterLevel >= t.levelRange.min && characterLevel <= t.levelRange.max)
      );
      templates = templates.filter((t) => !usedTemplateIds.includes(t.id));

      if (templates.length === 0) break;

      const template = SecureRNG.select(templates);
      usedTemplateIds.push(template.id);

      const quest = await this.generateQuest(
        { type: template.type, level: characterLevel, giverRole: npcRole },
        context
      );

      if (quest) {
        quests.push(quest);
      }
    }

    return quests;
  }

  // =========================================================================
  // STATISTICS
  // =========================================================================

  /**
   * Get content explosion statistics
   */
  static getContentStatistics(): {
    crimeTemplates: number;
    gossipTemplates: number;
    dialogueTemplates: number;
    questTemplates: number;
    estimatedCrimeCombinations: number;
    estimatedGossipCombinations: number;
    estimatedDialogueVariations: number;
    estimatedQuestCombinations: number;
    totalEstimatedContent: number;
  } {
    // Import the calculation functions
    const { calculateTotalCombinations: calcCrime } = require('../data/crimeOutcomeTemplates');
    const { calculateGossipCombinations: calcGossip } = require('../data/gossipExpansion');
    const { calculateDialogueCombinations: calcDialogue } = require('../data/npcDialogueTemplates');
    const { calculateQuestCombinations: calcQuest } = require('../data/questTemplates');

    const crimeCombos = calcCrime();
    const gossipCombos = calcGossip();
    const dialogueCombos = calcDialogue();
    const questCombos = calcQuest();

    return {
      crimeTemplates: ALL_CRIME_TEMPLATES.length,
      gossipTemplates: ALL_GOSSIP_TEMPLATES.length,
      dialogueTemplates: ALL_DIALOGUE_TEMPLATES.length,
      questTemplates: ALL_QUEST_TEMPLATES.length,
      estimatedCrimeCombinations: crimeCombos,
      estimatedGossipCombinations: gossipCombos,
      estimatedDialogueVariations: dialogueCombos,
      estimatedQuestCombinations: questCombos,
      totalEstimatedContent: crimeCombos + gossipCombos + dialogueCombos + questCombos,
    };
  }
}

export default TemplateResolverService;
