/**
 * DecisionEngine.ts
 *
 * Intelligent decision-making engine for playtest bots.
 * Makes context-aware action selections based on game state, personality traits,
 * goals, and historical success rates.
 *
 * Features:
 * - Goal-oriented decision making
 * - Personality-driven preferences
 * - Historical learning from past actions
 * - Resource efficiency calculations
 * - Risk assessment and expected value analysis
 * - Human-like variance (not perfectly optimal)
 * - Situational awareness (time, events, factions)
 */

import { PersonalityProfile, PersonalitySystem, PersonalityTraits } from './PersonalitySystem.js';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Goal represents a character's objective
 * Goals are prioritized and drive decision-making
 */
export interface Goal {
  /** Unique identifier for this goal */
  id: string;

  /** Human-readable goal name */
  name: string;

  /** Goal category (combat, wealth, social, exploration, etc.) */
  type: 'combat' | 'wealth' | 'social' | 'exploration' | 'reputation' | 'skills' | 'quests' | 'custom';

  /** Priority level (1-10, where 10 is highest) */
  priority: number;

  /** Current progress (0-1) */
  progress: number;

  /** Target value to achieve */
  target?: number;

  /** Actions that contribute to this goal */
  relatedActions?: string[];

  /** Whether this goal is currently active */
  active: boolean;

  /** Optional deadline (timestamp) */
  deadline?: number;
}

/**
 * ActionOutcome records the result of a performed action
 * Used for learning and improving decision-making over time
 */
export interface ActionOutcome {
  /** Action that was performed */
  actionId: string;

  /** Action type */
  actionType: string;

  /** Timestamp when action was performed */
  timestamp: number;

  /** Whether the action succeeded */
  success: boolean;

  /** Actual reward received (gold, XP, etc.) */
  actualReward: number;

  /** Energy cost paid */
  energyCost: number;

  /** Gold cost paid */
  goldCost: number;

  /** Additional metadata about the outcome */
  metadata?: Record<string, any>;
}

/**
 * GameContext provides complete state information for decision-making
 * Includes character stats, world state, goals, and historical data
 */
export interface GameContext {
  /** Character state */
  character: {
    /** Character level */
    level: number;

    /** Current gold */
    gold: number;

    /** Current energy (0-100) */
    energy: number;

    /** Current health (0-100) */
    health: number;

    /** Skill levels (skill name -> level) */
    skills: Record<string, number>;

    /** Equipped items */
    equipment: string[];

    /** Current location/area */
    location: string;

    /** Gang membership info */
    gang?: {
      name: string;
      rank: string;
      influence: number;
    };
  };

  /** World state */
  world: {
    /** Current time of day (morning, afternoon, evening, night) */
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

    /** Faction standing scores (-100 to 100) */
    factionStandings: Record<string, number>;

    /** Active world events */
    activeEvents: string[];

    /** Current server population (low, medium, high) */
    population?: 'low' | 'medium' | 'high';
  };

  /** Active goals */
  goals: Goal[];

  /** Historical action outcomes */
  memory: ActionOutcome[];

  /** Recent actions (to avoid repetition for explorers) */
  recentActions?: string[];
}

/**
 * GameAction represents a possible action the bot can take
 * Includes costs, rewards, requirements, and metadata
 */
export interface GameAction {
  /** Unique identifier */
  id: string;

  /** Action type/category */
  type: 'combat' | 'job' | 'craft' | 'social' | 'travel' | 'crime' | 'training' | 'quest' | 'shop' | 'gang' | 'custom';

  /** Human-readable action name */
  name: string;

  /** Energy cost (0-100) */
  energyCost: number;

  /** Gold cost (0+) */
  goldCost: number;

  /** Expected reward value (gold equivalent) */
  expectedReward: number;

  /** Success probability (0-1) */
  successProbability: number;

  /** Risk level (0-1, where 1 is maximum risk) */
  risk: number;

  /** Action complexity (affects thinking time, 1-10) */
  complexity: number;

  /** Whether this action requires browser interaction */
  requiresBrowser: boolean;

  /** Minimum level requirement */
  minLevel?: number;

  /** Minimum gold requirement (different from cost) */
  minGold?: number;

  /** Goals this action contributes to */
  contributesToGoal?: string[];

  /** Skills improved by this action */
  skillsImproved?: string[];

  /** Time of day when this action is available */
  availableTime?: ('morning' | 'afternoon' | 'evening' | 'night')[];

  /** Location where this action can be performed */
  requiredLocation?: string;

  /** Cooldown period in milliseconds */
  cooldown?: number;

  /** Last time this action was performed */
  lastPerformed?: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * ScoredAction pairs an action with its calculated score
 * Used for ranking and selecting actions
 */
export interface ScoredAction {
  /** The action being scored */
  action: GameAction;

  /** Final calculated score */
  score: number;

  /** Component scores for debugging */
  breakdown: {
    baseScore: number;
    goalAlignment: number;
    resourceEfficiency: number;
    riskAdjustment: number;
    personalityMultiplier: number;
    historicalBonus: number;
    situationalBonus: number;
  };

  /** Human-readable reasoning */
  reasoning: string;
}

/**
 * DecisionOptions configure decision-making behavior
 */
export interface DecisionOptions {
  /** Enable debug logging */
  debug?: boolean;

  /** Allow risky actions */
  allowRisky?: boolean;

  /** Minimum energy threshold (don't select actions below this) */
  minEnergyThreshold?: number;

  /** Weight for goal alignment (default: 1.0) */
  goalWeight?: number;

  /** Weight for resource efficiency (default: 1.0) */
  efficiencyWeight?: number;

  /** Amount of random variance (0-1, default: 0.2) */
  randomVariance?: number;

  /** Whether to consider combos/sequences */
  considerCombos?: boolean;

  /** Whether to use historical data */
  useHistory?: boolean;
}

// ============================================================================
// DECISION ENGINE CLASS
// ============================================================================

/**
 * DecisionEngine makes intelligent action choices for bots
 *
 * Features:
 * - Multi-factor scoring (goals, efficiency, risk, personality)
 * - Learning from historical outcomes
 * - Situational awareness (time, events, location)
 * - Human-like variance to avoid deterministic patterns
 * - Combo detection and planning
 *
 * Usage:
 * ```typescript
 * const personality = PersonalitySystem.createPersonality('grinder');
 * const engine = new DecisionEngine(personality);
 *
 * const context = { character: {...}, world: {...}, goals: [...], memory: [...] };
 * const actions = createDefaultActions();
 *
 * const bestAction = engine.selectAction(actions, context);
 * ```
 */
export class DecisionEngine {
  private personality: PersonalityProfile;
  private options: Required<DecisionOptions>;
  private actionHistory: Map<string, number[]>; // actionId -> scores

  /**
   * Create a new DecisionEngine
   * @param personality Personality profile to drive decisions
   * @param options Optional configuration
   */
  constructor(personality: PersonalityProfile, options: DecisionOptions = {}) {
    this.personality = personality;
    this.options = {
      debug: options.debug ?? false,
      allowRisky: options.allowRisky ?? true,
      minEnergyThreshold: options.minEnergyThreshold ?? 10,
      goalWeight: options.goalWeight ?? 1.0,
      efficiencyWeight: options.efficiencyWeight ?? 1.0,
      randomVariance: options.randomVariance ?? 0.2,
      considerCombos: options.considerCombos ?? true,
      useHistory: options.useHistory ?? true,
    };
    this.actionHistory = new Map();
  }

  /**
   * Select the best action from available options
   * Main entry point for decision-making
   *
   * @param availableActions Actions to choose from
   * @param context Current game state
   * @returns Best action to perform
   */
  selectAction(availableActions: GameAction[], context: GameContext): GameAction {
    if (availableActions.length === 0) {
      throw new Error('No actions available to select from');
    }

    // Filter out impossible actions
    const viableActions = availableActions.filter(action =>
      this.isActionViable(action, context)
    );

    if (viableActions.length === 0) {
      // If no actions are viable, return a wait/idle action or the least costly action
      const leastCostly = availableActions.reduce((min, action) =>
        action.energyCost < min.energyCost ? action : min
      );
      if (this.options.debug) {
        console.log('[DecisionEngine] No viable actions, selecting least costly:', leastCostly.name);
      }
      return leastCostly;
    }

    // Chaos archetype: completely random selection
    if (this.personality.archetype === 'chaos') {
      const randomAction = viableActions[Math.floor(Math.random() * viableActions.length)];
      if (this.options.debug) {
        console.log('[DecisionEngine] Chaos archetype - random selection:', randomAction.name);
      }
      return randomAction;
    }

    // Score all viable actions
    const scoredActions = viableActions.map(action =>
      this.scoreAction(action, context)
    );

    // Sort by score (highest first)
    scoredActions.sort((a, b) => b.score - a.score);

    if (this.options.debug) {
      console.log('[DecisionEngine] Top 5 actions:');
      scoredActions.slice(0, 5).forEach((sa, i) => {
        console.log(`  ${i + 1}. ${sa.action.name} (score: ${sa.score.toFixed(2)})`);
        console.log(`     ${sa.reasoning}`);
      });
    }

    // Return highest scoring action
    return scoredActions[0].action;
  }

  /**
   * Score an action and return detailed breakdown
   * @param action Action to score
   * @param context Current game state
   * @returns Scored action with breakdown
   */
  scoreAction(action: GameAction, context: GameContext): ScoredAction {
    // Calculate base score
    const baseScore = this.calculateBaseScore(action, context);

    // Goal alignment scoring
    const goalAlignment = this.calculateGoalAlignment(action, context) * this.options.goalWeight;

    // Resource efficiency
    const resourceEfficiency = this.calculateResourceEfficiency(action, context) * this.options.efficiencyWeight;

    // Risk adjustment
    const riskAdjustment = this.calculateRiskAdjustment(action, context);

    // Historical performance bonus
    const historicalBonus = this.options.useHistory
      ? this.calculateHistoricalBonus(action, context)
      : 0;

    // Situational awareness bonus
    const situationalBonus = this.calculateSituationalBonus(action, context);

    // Combine scores
    let totalScore = baseScore + goalAlignment + resourceEfficiency + riskAdjustment + historicalBonus + situationalBonus;

    // Apply personality multiplier
    const personalityMultiplier = PersonalitySystem.getActionMultiplier(action.type, this.personality.traits);
    totalScore *= personalityMultiplier;

    // Apply preference bonus/penalty
    const prefMatch = PersonalitySystem.matchesPreferences(action.name, this.personality.preferences);
    if (prefMatch === true) {
      totalScore *= 1.5; // 50% bonus for preferred activities
    } else if (prefMatch === false) {
      totalScore *= 0.3; // 70% penalty for avoided activities
    }

    // Add human-like variance
    totalScore = this.addHumanVariance(totalScore);

    // Generate reasoning
    const reasoning = this.generateReasoning(action, {
      baseScore,
      goalAlignment,
      resourceEfficiency,
      riskAdjustment,
      personalityMultiplier,
      historicalBonus,
      situationalBonus,
    });

    return {
      action,
      score: Math.max(0, totalScore), // Ensure non-negative
      breakdown: {
        baseScore,
        goalAlignment,
        resourceEfficiency,
        riskAdjustment,
        personalityMultiplier,
        historicalBonus,
        situationalBonus,
      },
      reasoning,
    };
  }

  /**
   * Calculate base score for an action
   * Considers expected reward, costs, and success probability
   */
  private calculateBaseScore(action: GameAction, context: GameContext): number {
    // Base score starts with expected value
    const expectedValue = this.calculateExpectedValue(action);

    // Normalize to 0-100 scale (assume max reward of 1000)
    const normalizedEV = (expectedValue / 1000) * 100;

    return normalizedEV;
  }

  /**
   * Calculate how well an action aligns with active goals
   * High-priority goals that are far from completion get highest scores
   */
  private calculateGoalAlignment(action: GameAction, context: GameContext): number {
    if (!context.goals || context.goals.length === 0) {
      return 0;
    }

    let alignmentScore = 0;

    // Check each active goal
    for (const goal of context.goals.filter(g => g.active)) {
      // Check if action contributes to this goal
      const contributes = this.actionContributesToGoal(action, goal);

      if (contributes) {
        // Score based on priority and progress
        // Prioritize goals that are: high priority, low progress
        const priorityWeight = goal.priority / 10; // Normalize 1-10 to 0.1-1.0
        const progressWeight = 1 - goal.progress; // Favor incomplete goals
        const urgencyWeight = goal.deadline ? this.calculateUrgency(goal.deadline) : 1.0;

        const goalScore = 50 * priorityWeight * progressWeight * urgencyWeight;
        alignmentScore += goalScore;
      }
    }

    return alignmentScore;
  }

  /**
   * Calculate resource efficiency of an action
   * Reward-to-cost ratio, adjusted for personality
   */
  private calculateResourceEfficiency(action: GameAction, context: GameContext): number {
    // Avoid division by zero
    const totalCost = Math.max(1, action.energyCost + action.goldCost / 10); // Weight gold less than energy

    // Calculate efficiency ratio
    const efficiency = action.expectedReward / totalCost;

    // Normalize (assume max efficiency of 50)
    const normalizedEfficiency = Math.min(efficiency / 50, 1.0) * 30;

    // Grinders heavily weight efficiency
    if (this.personality.archetype === 'grinder') {
      return normalizedEfficiency * 1.5;
    }

    // Explorers don't care much about efficiency
    if (this.personality.archetype === 'explorer') {
      return normalizedEfficiency * 0.5;
    }

    return normalizedEfficiency;
  }

  /**
   * Calculate risk adjustment based on personality and action risk
   * Risk-averse personalities penalize risky actions, risk-seekers boost them
   */
  private calculateRiskAdjustment(action: GameAction, context: GameContext): number {
    const riskLevel = action.risk;
    const riskTolerance = this.personality.traits.riskTolerance;

    // Calculate risk penalty/bonus
    if (riskLevel > riskTolerance) {
      // Too risky for this personality - penalty
      const penalty = (riskLevel - riskTolerance) * -30;
      return penalty;
    } else if (riskLevel > 0.3 && riskTolerance > 0.7) {
      // Risk-seeker with risky action - bonus!
      const bonus = riskLevel * 15;
      return bonus;
    }

    return 0;
  }

  /**
   * Calculate bonus based on historical success with this action type
   * Learn from past performance
   */
  private calculateHistoricalBonus(action: GameAction, context: GameContext): number {
    const successRate = this.getHistoricalSuccessRate(action.type, context.memory);

    if (successRate === null) {
      return 0; // No history
    }

    // Bonus for actions with proven success
    if (successRate > 0.7) {
      return 10; // Reliable actions get a boost
    } else if (successRate < 0.3) {
      return -15; // Unreliable actions get penalized
    }

    return 0;
  }

  /**
   * Calculate bonus based on situational factors
   * Time of day, active events, location, etc.
   */
  private calculateSituationalBonus(action: GameAction, context: GameContext): number {
    let bonus = 0;

    // Time of day matching
    if (action.availableTime && !action.availableTime.includes(context.world.timeOfDay)) {
      return -50; // Action not available at this time
    }

    // Location matching
    if (action.requiredLocation && action.requiredLocation !== context.character.location) {
      bonus -= 10; // Slight penalty for needing to travel
    }

    // Cooldown check
    if (action.cooldown && action.lastPerformed) {
      const timeSinceLastUse = Date.now() - action.lastPerformed;
      if (timeSinceLastUse < action.cooldown) {
        return -100; // Action on cooldown, heavily penalize
      }
    }

    // Active events bonus
    if (context.world.activeEvents && context.world.activeEvents.length > 0) {
      // Check if action relates to active events
      for (const event of context.world.activeEvents) {
        if (action.name.toLowerCase().includes(event.toLowerCase()) ||
            action.type.toLowerCase().includes(event.toLowerCase())) {
          bonus += 15; // Bonus for event-related actions
        }
      }
    }

    // Gang actions bonus for high loyalty
    if (action.type === 'gang' && this.personality.traits.loyalty > 0.7) {
      bonus += 10;
    }

    // Social actions during high population
    if (action.type === 'social' && context.world.population === 'high') {
      bonus += 10;
    }

    // Explorer archetype: penalize recently performed actions
    if (this.personality.archetype === 'explorer' && context.recentActions) {
      const recentlyPerformed = context.recentActions.includes(action.id);
      if (recentlyPerformed) {
        bonus -= 25; // Explorers avoid repetition
      }
    }

    // Grinder archetype: bonus for recently performed actions
    if (this.personality.archetype === 'grinder' && context.recentActions) {
      const recentlyPerformed = context.recentActions.includes(action.id);
      if (recentlyPerformed) {
        bonus += 15; // Grinders love repetition
      }
    }

    return bonus;
  }

  /**
   * Calculate expected value considering success/failure outcomes
   * EV = (successReward * successProb) - (failureCost * failureProb)
   */
  private calculateExpectedValue(action: GameAction): number {
    const successReward = action.expectedReward;
    const successProb = action.successProbability;

    // Failure cost is the costs paid with no reward
    const failureCost = action.energyCost + action.goldCost;
    const failureProb = 1 - successProb;

    const expectedValue = (successReward * successProb) - (failureCost * failureProb);

    return expectedValue;
  }

  /**
   * Check if an action is viable given current resources and state
   */
  private isActionViable(action: GameAction, context: GameContext): boolean {
    // Energy check
    if (action.energyCost > context.character.energy) {
      return false;
    }

    // Gold check
    if (action.goldCost > context.character.gold) {
      return false;
    }

    // Level requirement
    if (action.minLevel && context.character.level < action.minLevel) {
      return false;
    }

    // Minimum gold requirement (different from cost)
    if (action.minGold && context.character.gold < action.minGold) {
      return false;
    }

    // Energy threshold check
    if (action.energyCost > 0 && context.character.energy < this.options.minEnergyThreshold) {
      return false;
    }

    // Risk tolerance check
    if (!this.options.allowRisky && action.risk > 0.8) {
      return false;
    }

    // Health check for combat
    if (action.type === 'combat' && context.character.health < 30) {
      return false; // Too injured for combat
    }

    return true;
  }

  /**
   * Get historical success rate for an action type
   * Returns null if no history exists
   */
  private getHistoricalSuccessRate(actionType: string, memory: ActionOutcome[]): number | null {
    const relevantOutcomes = memory.filter(outcome => outcome.actionType === actionType);

    if (relevantOutcomes.length === 0) {
      return null;
    }

    const successes = relevantOutcomes.filter(outcome => outcome.success).length;
    const successRate = successes / relevantOutcomes.length;

    return successRate;
  }

  /**
   * Check if an action contributes to a goal
   */
  private actionContributesToGoal(action: GameAction, goal: Goal): boolean {
    // Direct contribution check
    if (action.contributesToGoal && action.contributesToGoal.includes(goal.id)) {
      return true;
    }

    // Type-based matching
    if (action.type === goal.type) {
      return true;
    }

    // Related actions check
    if (goal.relatedActions && goal.relatedActions.includes(action.name)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate urgency multiplier based on deadline
   */
  private calculateUrgency(deadline: number): number {
    const now = Date.now();
    const timeRemaining = deadline - now;

    if (timeRemaining <= 0) {
      return 3.0; // Overdue - VERY urgent
    }

    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    if (timeRemaining < oneHour) {
      return 2.5; // Less than 1 hour - very urgent
    } else if (timeRemaining < 6 * oneHour) {
      return 2.0; // Less than 6 hours - urgent
    } else if (timeRemaining < oneDay) {
      return 1.5; // Less than 1 day - moderately urgent
    } else {
      return 1.0; // Plenty of time - normal priority
    }
  }

  /**
   * Add human-like variance to score
   * Prevents perfectly deterministic behavior
   */
  private addHumanVariance(score: number): number {
    const variance = this.options.randomVariance;
    const randomFactor = 1 - variance + (Math.random() * variance * 2);
    return score * randomFactor;
  }

  /**
   * Generate human-readable reasoning for a decision
   */
  private generateReasoning(action: GameAction, breakdown: ScoredAction['breakdown']): string {
    const reasons: string[] = [];

    // Primary reason
    if (breakdown.goalAlignment > 20) {
      reasons.push('strongly aligns with active goals');
    } else if (breakdown.resourceEfficiency > 20) {
      reasons.push('highly efficient reward-to-cost ratio');
    } else if (breakdown.historicalBonus > 5) {
      reasons.push('proven success in past attempts');
    }

    // Personality influence
    if (breakdown.personalityMultiplier > 1.3) {
      reasons.push(`matches ${this.personality.name} personality`);
    } else if (breakdown.personalityMultiplier < 0.7) {
      reasons.push(`conflicts with ${this.personality.name} personality`);
    }

    // Risk assessment
    if (action.risk > 0.7 && this.personality.traits.riskTolerance > 0.7) {
      reasons.push('high-risk opportunity matches risk-seeking nature');
    } else if (action.risk < 0.3) {
      reasons.push('low-risk safe option');
    }

    // Situational factors
    if (breakdown.situationalBonus > 10) {
      reasons.push('favorable situational factors');
    } else if (breakdown.situationalBonus < -10) {
      reasons.push('unfavorable conditions');
    }

    if (reasons.length === 0) {
      return 'best available option';
    }

    return reasons.join(', ');
  }

  /**
   * Get detailed analysis of all actions
   * Useful for debugging and understanding decision-making
   */
  getAllActionScores(availableActions: GameAction[], context: GameContext): ScoredAction[] {
    const scored = availableActions.map(action => this.scoreAction(action, context));
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * Update personality (e.g., for learning/adaptation)
   */
  updatePersonality(newPersonality: PersonalityProfile): void {
    this.personality = newPersonality;
  }

  /**
   * Record an action for future learning
   */
  recordAction(actionId: string, score: number): void {
    if (!this.actionHistory.has(actionId)) {
      this.actionHistory.set(actionId, []);
    }
    this.actionHistory.get(actionId)!.push(score);

    // Keep only last 100 scores per action
    const scores = this.actionHistory.get(actionId)!;
    if (scores.length > 100) {
      scores.shift();
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a set of default game actions for testing
 * Covers all major action types with realistic parameters
 */
export function createDefaultActions(): GameAction[] {
  const now = Date.now();

  return [
    // Combat actions
    {
      id: 'combat_bandit',
      type: 'combat',
      name: 'Fight Bandits',
      energyCost: 15,
      goldCost: 0,
      expectedReward: 50,
      successProbability: 0.7,
      risk: 0.5,
      complexity: 5,
      requiresBrowser: true,
      contributesToGoal: ['combat_mastery', 'earn_gold'],
      skillsImproved: ['combat', 'marksmanship'],
    },
    {
      id: 'combat_duel',
      type: 'combat',
      name: 'Challenge Player to Duel',
      energyCost: 20,
      goldCost: 10,
      expectedReward: 100,
      successProbability: 0.5,
      risk: 0.8,
      complexity: 7,
      requiresBrowser: true,
      contributesToGoal: ['pvp_champion', 'reputation'],
      cooldown: 30 * 60 * 1000, // 30 minutes
    },
    {
      id: 'combat_boss',
      type: 'combat',
      name: 'Hunt Notorious Outlaw',
      energyCost: 30,
      goldCost: 0,
      expectedReward: 200,
      successProbability: 0.4,
      risk: 0.9,
      complexity: 9,
      requiresBrowser: true,
      minLevel: 5,
      contributesToGoal: ['bounty_hunter', 'reputation'],
    },

    // Job/Work actions
    {
      id: 'job_sheriff',
      type: 'job',
      name: 'Work as Deputy Sheriff',
      energyCost: 10,
      goldCost: 0,
      expectedReward: 30,
      successProbability: 0.9,
      risk: 0.2,
      complexity: 3,
      requiresBrowser: true,
      contributesToGoal: ['earn_gold', 'faction_law'],
      skillsImproved: ['law_enforcement'],
      availableTime: ['morning', 'afternoon'],
    },
    {
      id: 'job_bartender',
      type: 'job',
      name: 'Tend Bar at Saloon',
      energyCost: 8,
      goldCost: 0,
      expectedReward: 25,
      successProbability: 0.95,
      risk: 0.1,
      complexity: 2,
      requiresBrowser: true,
      contributesToGoal: ['earn_gold', 'social_connections'],
      skillsImproved: ['charisma'],
      availableTime: ['evening', 'night'],
    },
    {
      id: 'job_mining',
      type: 'job',
      name: 'Mine for Gold',
      energyCost: 20,
      goldCost: 0,
      expectedReward: 60,
      successProbability: 0.8,
      risk: 0.3,
      complexity: 4,
      requiresBrowser: true,
      contributesToGoal: ['earn_gold'],
      skillsImproved: ['mining', 'strength'],
    },

    // Crafting actions
    {
      id: 'craft_ammo',
      type: 'craft',
      name: 'Craft Ammunition',
      energyCost: 5,
      goldCost: 10,
      expectedReward: 20,
      successProbability: 0.85,
      risk: 0.1,
      complexity: 3,
      requiresBrowser: true,
      contributesToGoal: ['self_sufficient'],
      skillsImproved: ['crafting'],
    },
    {
      id: 'craft_weapon',
      type: 'craft',
      name: 'Forge Custom Weapon',
      energyCost: 15,
      goldCost: 50,
      expectedReward: 120,
      successProbability: 0.6,
      risk: 0.4,
      complexity: 7,
      requiresBrowser: true,
      minLevel: 3,
      contributesToGoal: ['master_craftsman'],
      skillsImproved: ['crafting', 'blacksmithing'],
    },

    // Social actions
    {
      id: 'social_chat',
      type: 'social',
      name: 'Chat in Saloon',
      energyCost: 2,
      goldCost: 0,
      expectedReward: 5,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 1,
      requiresBrowser: true,
      contributesToGoal: ['social_connections', 'gather_info'],
      skillsImproved: ['charisma'],
    },
    {
      id: 'social_mail',
      type: 'social',
      name: 'Send Mail to Friends',
      energyCost: 1,
      goldCost: 1,
      expectedReward: 0,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 2,
      requiresBrowser: true,
      contributesToGoal: ['social_connections'],
    },
    {
      id: 'social_recruit',
      type: 'social',
      name: 'Recruit for Gang',
      energyCost: 5,
      goldCost: 0,
      expectedReward: 10,
      successProbability: 0.7,
      risk: 0.2,
      complexity: 4,
      requiresBrowser: true,
      contributesToGoal: ['gang_leader'],
      skillsImproved: ['charisma', 'leadership'],
    },

    // Travel/Exploration actions
    {
      id: 'travel_frontier',
      type: 'travel',
      name: 'Explore Frontier Territory',
      energyCost: 12,
      goldCost: 5,
      expectedReward: 40,
      successProbability: 0.75,
      risk: 0.6,
      complexity: 5,
      requiresBrowser: true,
      contributesToGoal: ['explorer', 'discover_locations'],
      skillsImproved: ['survival'],
    },
    {
      id: 'travel_town',
      type: 'travel',
      name: 'Visit Neighboring Town',
      energyCost: 8,
      goldCost: 3,
      expectedReward: 15,
      successProbability: 0.9,
      risk: 0.2,
      complexity: 3,
      requiresBrowser: true,
      contributesToGoal: ['explorer', 'social_connections'],
    },

    // Crime actions
    {
      id: 'crime_robbery',
      type: 'crime',
      name: 'Rob Stagecoach',
      energyCost: 18,
      goldCost: 0,
      expectedReward: 150,
      successProbability: 0.5,
      risk: 0.9,
      complexity: 8,
      requiresBrowser: true,
      contributesToGoal: ['outlaw_legend', 'earn_gold'],
      skillsImproved: ['stealth', 'intimidation'],
      availableTime: ['night'],
    },
    {
      id: 'crime_pickpocket',
      type: 'crime',
      name: 'Pickpocket Tourists',
      energyCost: 5,
      goldCost: 0,
      expectedReward: 20,
      successProbability: 0.6,
      risk: 0.5,
      complexity: 4,
      requiresBrowser: true,
      contributesToGoal: ['outlaw_legend', 'earn_gold'],
      skillsImproved: ['stealth', 'sleight_of_hand'],
    },
    {
      id: 'crime_smuggle',
      type: 'crime',
      name: 'Smuggle Contraband',
      energyCost: 12,
      goldCost: 20,
      expectedReward: 80,
      successProbability: 0.7,
      risk: 0.7,
      complexity: 6,
      requiresBrowser: true,
      contributesToGoal: ['outlaw_legend', 'earn_gold'],
      skillsImproved: ['stealth', 'persuasion'],
    },

    // Training actions
    {
      id: 'train_combat',
      type: 'training',
      name: 'Combat Training',
      energyCost: 10,
      goldCost: 15,
      expectedReward: 0,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 3,
      requiresBrowser: true,
      contributesToGoal: ['combat_mastery'],
      skillsImproved: ['combat', 'marksmanship'],
    },
    {
      id: 'train_stealth',
      type: 'training',
      name: 'Stealth Training',
      energyCost: 10,
      goldCost: 15,
      expectedReward: 0,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 3,
      requiresBrowser: true,
      contributesToGoal: ['master_thief'],
      skillsImproved: ['stealth'],
    },

    // Quest actions
    {
      id: 'quest_delivery',
      type: 'quest',
      name: 'Deliver Package to Town',
      energyCost: 15,
      goldCost: 0,
      expectedReward: 75,
      successProbability: 0.85,
      risk: 0.3,
      complexity: 5,
      requiresBrowser: true,
      contributesToGoal: ['quest_completion', 'faction_merchant'],
    },
    {
      id: 'quest_rescue',
      type: 'quest',
      name: 'Rescue Kidnapped Settler',
      energyCost: 25,
      goldCost: 0,
      expectedReward: 150,
      successProbability: 0.6,
      risk: 0.7,
      complexity: 8,
      requiresBrowser: true,
      minLevel: 4,
      contributesToGoal: ['quest_completion', 'hero_reputation'],
    },

    // Shop actions
    {
      id: 'shop_weapon',
      type: 'shop',
      name: 'Buy Better Weapon',
      energyCost: 2,
      goldCost: 100,
      expectedReward: -100, // Negative because it's a purchase
      successProbability: 1.0,
      risk: 0.0,
      complexity: 2,
      requiresBrowser: true,
      minGold: 100,
      contributesToGoal: ['combat_mastery'],
    },
    {
      id: 'shop_armor',
      type: 'shop',
      name: 'Buy Better Armor',
      energyCost: 2,
      goldCost: 80,
      expectedReward: -80,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 2,
      requiresBrowser: true,
      minGold: 80,
      contributesToGoal: ['combat_mastery'],
    },
    {
      id: 'shop_horse',
      type: 'shop',
      name: 'Buy Faster Horse',
      energyCost: 2,
      goldCost: 200,
      expectedReward: -200,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 2,
      requiresBrowser: true,
      minGold: 200,
      contributesToGoal: ['explorer', 'status_symbol'],
    },

    // Gang actions
    {
      id: 'gang_mission',
      type: 'gang',
      name: 'Gang Territory Mission',
      energyCost: 20,
      goldCost: 0,
      expectedReward: 100,
      successProbability: 0.7,
      risk: 0.6,
      complexity: 6,
      requiresBrowser: true,
      contributesToGoal: ['gang_leader', 'territory_control'],
      skillsImproved: ['leadership', 'tactics'],
    },
    {
      id: 'gang_war',
      type: 'gang',
      name: 'Participate in Gang War',
      energyCost: 30,
      goldCost: 0,
      expectedReward: 200,
      successProbability: 0.5,
      risk: 0.9,
      complexity: 9,
      requiresBrowser: true,
      minLevel: 5,
      contributesToGoal: ['gang_leader', 'pvp_champion'],
      cooldown: 60 * 60 * 1000, // 1 hour
    },

    // Idle/Wait action
    {
      id: 'wait',
      type: 'custom',
      name: 'Rest and Recover Energy',
      energyCost: 0,
      goldCost: 0,
      expectedReward: 0,
      successProbability: 1.0,
      risk: 0.0,
      complexity: 1,
      requiresBrowser: false,
      contributesToGoal: [],
    },
  ];
}

/**
 * Filter actions by context to remove impossible actions
 * More aggressive filtering than isActionViable
 */
export function filterActionsByContext(
  actions: GameAction[],
  context: GameContext
): GameAction[] {
  return actions.filter(action => {
    // All the basic viability checks
    if (action.energyCost > context.character.energy) return false;
    if (action.goldCost > context.character.gold) return false;
    if (action.minLevel && context.character.level < action.minLevel) return false;
    if (action.minGold && context.character.gold < action.minGold) return false;

    // Time of day restriction
    if (action.availableTime && !action.availableTime.includes(context.world.timeOfDay)) {
      return false;
    }

    // Cooldown check
    if (action.cooldown && action.lastPerformed) {
      const timeSinceLastUse = Date.now() - action.lastPerformed;
      if (timeSinceLastUse < action.cooldown) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate human-readable explanation of decision
 * Shows top choices and why the selected action won
 */
export function explainDecision(scoredActions: ScoredAction[]): string {
  if (scoredActions.length === 0) {
    return 'No actions available';
  }

  const sorted = [...scoredActions].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  let explanation = `Selected: ${winner.action.name}\n`;
  explanation += `Score: ${winner.score.toFixed(2)}\n`;
  explanation += `Reasoning: ${winner.reasoning}\n\n`;

  explanation += 'Score Breakdown:\n';
  explanation += `  Base Score: ${winner.breakdown.baseScore.toFixed(2)}\n`;
  explanation += `  Goal Alignment: ${winner.breakdown.goalAlignment.toFixed(2)}\n`;
  explanation += `  Resource Efficiency: ${winner.breakdown.resourceEfficiency.toFixed(2)}\n`;
  explanation += `  Risk Adjustment: ${winner.breakdown.riskAdjustment.toFixed(2)}\n`;
  explanation += `  Personality Multiplier: ${winner.breakdown.personalityMultiplier.toFixed(2)}x\n`;
  explanation += `  Historical Bonus: ${winner.breakdown.historicalBonus.toFixed(2)}\n`;
  explanation += `  Situational Bonus: ${winner.breakdown.situationalBonus.toFixed(2)}\n`;

  if (sorted.length > 1) {
    explanation += '\nAlternatives Considered:\n';
    for (let i = 1; i < Math.min(4, sorted.length); i++) {
      const alt = sorted[i];
      explanation += `  ${i + 1}. ${alt.action.name} (${alt.score.toFixed(2)}): ${alt.reasoning}\n`;
    }
  }

  return explanation;
}

/**
 * Create a sample game context for testing
 */
export function createSampleContext(): GameContext {
  return {
    character: {
      level: 3,
      gold: 150,
      energy: 75,
      health: 90,
      skills: {
        combat: 5,
        marksmanship: 4,
        stealth: 2,
        charisma: 3,
      },
      equipment: ['basic_pistol', 'leather_vest'],
      location: 'frontier_town',
    },
    world: {
      timeOfDay: 'afternoon',
      factionStandings: {
        law: 20,
        outlaws: -10,
        merchants: 15,
      },
      activeEvents: ['gold_rush', 'gang_war'],
    },
    goals: [
      {
        id: 'earn_gold',
        name: 'Earn 1000 Gold',
        type: 'wealth',
        priority: 8,
        progress: 0.15,
        target: 1000,
        active: true,
      },
      {
        id: 'combat_mastery',
        name: 'Become Combat Master',
        type: 'combat',
        priority: 6,
        progress: 0.3,
        active: true,
      },
    ],
    memory: [
      {
        actionId: 'combat_bandit',
        actionType: 'combat',
        timestamp: Date.now() - 1000000,
        success: true,
        actualReward: 55,
        energyCost: 15,
        goldCost: 0,
      },
      {
        actionId: 'combat_bandit',
        actionType: 'combat',
        timestamp: Date.now() - 2000000,
        success: true,
        actualReward: 48,
        energyCost: 15,
        goldCost: 0,
      },
      {
        actionId: 'crime_robbery',
        actionType: 'crime',
        timestamp: Date.now() - 3000000,
        success: false,
        actualReward: 0,
        energyCost: 18,
        goldCost: 0,
      },
    ],
    recentActions: ['combat_bandit', 'job_sheriff'],
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example demonstrating the DecisionEngine in action
 */
export function runExample(): void {
  console.log('=== DecisionEngine Example ===\n');

  // Create a personality
  const personality = PersonalitySystem.createPersonality('grinder');
  console.log(`Personality: ${personality.name}`);
  console.log(`Description: ${personality.description}\n`);

  // Create decision engine
  const engine = new DecisionEngine(personality, { debug: true });

  // Create context
  const context = createSampleContext();
  console.log('Game Context:');
  console.log(`  Level: ${context.character.level}`);
  console.log(`  Gold: ${context.character.gold}`);
  console.log(`  Energy: ${context.character.energy}`);
  console.log(`  Location: ${context.character.location}`);
  console.log(`  Active Goals: ${context.goals.map(g => g.name).join(', ')}\n`);

  // Get all actions
  const allActions = createDefaultActions();
  console.log(`Total Actions Available: ${allActions.length}\n`);

  // Filter by context
  const viableActions = filterActionsByContext(allActions, context);
  console.log(`Viable Actions: ${viableActions.length}\n`);

  // Make decision
  console.log('Making decision...\n');
  const bestAction = engine.selectAction(viableActions, context);

  // Get detailed analysis
  const allScored = engine.getAllActionScores(viableActions, context);

  console.log('\n' + explainDecision(allScored));

  console.log(`\nFinal Decision: ${bestAction.name}`);
  console.log(`Energy Cost: ${bestAction.energyCost}`);
  console.log(`Expected Reward: ${bestAction.expectedReward}`);
  console.log(`Success Probability: ${(bestAction.successProbability * 100).toFixed(0)}%`);
}

// Uncomment to run example
// runExample();
