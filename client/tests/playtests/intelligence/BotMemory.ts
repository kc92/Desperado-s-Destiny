/**
 * BotMemory.ts
 *
 * Advanced learning and memory system for bot players.
 * Records action outcomes, detects patterns, learns from experience,
 * and provides intelligent recommendations based on historical data.
 *
 * Features:
 * - Limited memory (human-like forgetting)
 * - Pattern recognition
 * - Success rate tracking
 * - Strategy adaptation
 * - Temporal pattern detection
 * - Action combo learning
 * - Risk calibration
 * - Efficiency optimization
 */

/**
 * Represents the outcome of a single action
 */
export interface ActionOutcome {
  id: string;
  action: GameAction;
  timestamp: Date;
  success: boolean;
  reward: number;
  cost: number;
  context: GameContext;
  duration: number; // milliseconds
  error?: string;
}

/**
 * Represents a game action
 */
export interface GameAction {
  type: string;
  target?: string;
  params?: Record<string, any>;
}

/**
 * Context in which an action was performed
 */
export interface GameContext {
  character: {
    health: number;
    energy: number;
    gold: number;
    level: number;
    equipment?: string[];
  };
  location?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  hourOfDay?: number;
  recentActions?: string[];
}

/**
 * Detected pattern in action outcomes
 */
export interface Pattern {
  id: string;
  pattern: string; // e.g., "combat_health_low"
  successRate: number;
  occurrences: number;
  confidence: number; // 0-1
  lastSeen?: Date;
  trend?: 'improving' | 'declining' | 'stable';
}

/**
 * Statistical summary of bot performance
 */
export interface MemoryStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  totalReward: number;
  totalCost: number;
  averageSuccessRate: number;
  actionBreakdown: Record<string, {
    count: number;
    successRate: number;
    averageReward: number;
    averageCost: number;
    efficiency: number; // reward per cost
  }>;
  recentTrend: 'improving' | 'declining' | 'stable';
  bestAction?: string;
  worstAction?: string;
}

/**
 * Action sequence that has been observed
 */
interface ActionCombo {
  sequence: string[];
  occurrences: number;
  successRate: number;
  averageReward: number;
  confidence: number;
}

/**
 * Temporal pattern data
 */
interface TemporalPattern {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  actionType: string;
  successRate: number;
  occurrences: number;
  averageReward: number;
}

/**
 * Risk assessment data
 */
interface RiskCalibration {
  actionType: string;
  estimatedRisk: number;
  actualFailureRate: number;
  calibrationError: number;
  occurrences: number;
}

/**
 * Efficiency metrics for an action
 */
interface EfficiencyMetric {
  actionType: string;
  goldPerEnergy: number;
  goldPerMinute: number;
  successRateWeighted: number;
  overallScore: number;
}

/**
 * Main bot memory and learning system
 */
export class BotMemory {
  private history: ActionOutcome[] = [];
  private successRates: Map<string, number> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private combos: Map<string, ActionCombo> = new Map();
  private temporalPatterns: Map<string, TemporalPattern> = new Map();
  private riskCalibrations: Map<string, RiskCalibration> = new Map();
  private efficiencyMetrics: Map<string, EfficiencyMetric> = new Map();

  private maxHistorySize: number = 1000; // Human-like limited memory
  private minPatternOccurrences: number = 5; // Minimum data for pattern confidence
  private comboLength: number = 3; // Track sequences of 3 actions

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Record outcome of an action
   * This is the primary method for teaching the bot
   */
  recordOutcome(outcome: ActionOutcome): void {
    this.history.push(outcome);

    // Maintain memory limit (forget old memories like humans do)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift(); // Remove oldest
    }

    // Update all learning systems
    this.updateSuccessRates(outcome);
    this.detectPatterns(outcome);
    this.detectCombos(outcome);
    this.detectTemporalPatterns(outcome);
    this.calibrateRisk(outcome);
    this.updateEfficiencyMetrics(outcome);
  }

  /**
   * Update success rate statistics for action type
   */
  private updateSuccessRates(outcome: ActionOutcome): void {
    const actionType = outcome.action.type;
    const outcomes = this.history.filter(h => h.action.type === actionType);
    const successes = outcomes.filter(o => o.success).length;
    this.successRates.set(actionType, successes / outcomes.length);
  }

  /**
   * Get success rate for specific action type
   */
  getSuccessRate(actionType: string): number {
    return this.successRates.get(actionType) || 0.5; // Default neutral
  }

  /**
   * Detect patterns in action outcomes
   * Analyzes correlations between context and success
   */
  private detectPatterns(outcome: ActionOutcome): void {
    const actionType = outcome.action.type;

    // Pattern 1: Health correlation (combat effectiveness at different health levels)
    if (actionType === 'combat') {
      const healthBucket = Math.floor(outcome.context.character.health / 20) * 20;
      this.updatePattern(
        `combat_health_${healthBucket}`,
        outcome,
        h => h.action.type === 'combat' &&
             Math.floor(h.context.character.health / 20) * 20 === healthBucket
      );
    }

    // Pattern 2: Energy correlation (performance at different energy levels)
    const energyBucket = Math.floor(outcome.context.character.energy / 25) * 25;
    this.updatePattern(
      `${actionType}_energy_${energyBucket}`,
      outcome,
      h => h.action.type === actionType &&
           Math.floor(h.context.character.energy / 25) * 25 === energyBucket
    );

    // Pattern 3: Location correlation (success varies by location)
    if (outcome.context.location) {
      this.updatePattern(
        `${actionType}_location_${outcome.context.location}`,
        outcome,
        h => h.action.type === actionType && h.context.location === outcome.context.location
      );
    }

    // Pattern 4: Equipment correlation (gear affects success)
    if (outcome.context.character.equipment && outcome.context.character.equipment.length > 0) {
      const hasGear = outcome.context.character.equipment.length > 0;
      this.updatePattern(
        `${actionType}_${hasGear ? 'equipped' : 'unequipped'}`,
        outcome,
        h => h.action.type === actionType &&
             (h.context.character.equipment?.length || 0) > 0 === hasGear
      );
    }

    // Pattern 5: Level correlation
    const levelBucket = Math.floor(outcome.context.character.level / 5) * 5;
    this.updatePattern(
      `${actionType}_level_${levelBucket}`,
      outcome,
      h => h.action.type === actionType &&
           Math.floor(h.context.character.level / 5) * 5 === levelBucket
    );
  }

  /**
   * Helper to update or create a pattern
   */
  private updatePattern(
    patternKey: string,
    outcome: ActionOutcome,
    filter: (h: ActionOutcome) => boolean
  ): void {
    const existingPattern = this.patterns.get(patternKey);
    const matchingOutcomes = this.history.filter(filter);
    const successes = matchingOutcomes.filter(o => o.success).length;
    const successRate = matchingOutcomes.length > 0 ? successes / matchingOutcomes.length : 0;
    const confidence = Math.min(1.0, matchingOutcomes.length / this.minPatternOccurrences);

    // Calculate trend if we have enough history
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (matchingOutcomes.length >= 10) {
      const recent = matchingOutcomes.slice(-5);
      const older = matchingOutcomes.slice(-10, -5);
      const recentRate = recent.filter(o => o.success).length / recent.length;
      const olderRate = older.filter(o => o.success).length / older.length;

      if (recentRate > olderRate + 0.1) trend = 'improving';
      else if (recentRate < olderRate - 0.1) trend = 'declining';
    }

    if (existingPattern) {
      existingPattern.occurrences = matchingOutcomes.length;
      existingPattern.successRate = successRate;
      existingPattern.confidence = confidence;
      existingPattern.lastSeen = outcome.timestamp;
      existingPattern.trend = trend;
    } else {
      this.patterns.set(patternKey, {
        id: patternKey,
        pattern: patternKey,
        successRate,
        occurrences: matchingOutcomes.length,
        confidence,
        lastSeen: outcome.timestamp,
        trend
      });
    }
  }

  /**
   * Detect action combos/sequences that work well together
   */
  private detectCombos(outcome: ActionOutcome): void {
    if (this.history.length < this.comboLength) return;

    // Get last N actions as a sequence
    const recentActions = this.history.slice(-this.comboLength);
    const sequence = recentActions.map(h => h.action.type);
    const comboKey = sequence.join('->');

    // Find all occurrences of this combo
    const comboOccurrences: ActionOutcome[][] = [];
    for (let i = 0; i <= this.history.length - this.comboLength; i++) {
      const slice = this.history.slice(i, i + this.comboLength);
      const sliceSeq = slice.map(h => h.action.type).join('->');
      if (sliceSeq === comboKey) {
        comboOccurrences.push(slice);
      }
    }

    if (comboOccurrences.length > 0) {
      const successes = comboOccurrences.filter(combo =>
        combo.every(o => o.success)
      ).length;
      const totalReward = comboOccurrences.reduce((sum, combo) =>
        sum + combo.reduce((s, o) => s + o.reward, 0), 0
      );

      this.combos.set(comboKey, {
        sequence,
        occurrences: comboOccurrences.length,
        successRate: successes / comboOccurrences.length,
        averageReward: totalReward / comboOccurrences.length,
        confidence: Math.min(1.0, comboOccurrences.length / this.minPatternOccurrences)
      });
    }
  }

  /**
   * Detect temporal patterns (time-of-day affects success)
   */
  private detectTemporalPatterns(outcome: ActionOutcome): void {
    if (!outcome.context.timeOfDay) return;

    const patternKey = `${outcome.context.timeOfDay}_${outcome.action.type}`;
    const matchingOutcomes = this.history.filter(h =>
      h.context.timeOfDay === outcome.context.timeOfDay &&
      h.action.type === outcome.action.type
    );

    if (matchingOutcomes.length > 0) {
      const successes = matchingOutcomes.filter(o => o.success).length;
      const totalReward = matchingOutcomes.reduce((sum, o) => sum + o.reward, 0);

      this.temporalPatterns.set(patternKey, {
        timeOfDay: outcome.context.timeOfDay,
        actionType: outcome.action.type,
        successRate: successes / matchingOutcomes.length,
        occurrences: matchingOutcomes.length,
        averageReward: totalReward / matchingOutcomes.length
      });
    }
  }

  /**
   * Calibrate risk assessment based on actual outcomes
   * Learn whether estimated risks match reality
   */
  private calibrateRisk(outcome: ActionOutcome): void {
    const actionType = outcome.action.type;
    const estimatedRisk = outcome.action.params?.estimatedRisk || 0.5;

    const outcomes = this.history.filter(h => h.action.type === actionType);
    const failures = outcomes.filter(o => !o.success).length;
    const actualFailureRate = outcomes.length > 0 ? failures / outcomes.length : 0;
    const calibrationError = Math.abs(estimatedRisk - actualFailureRate);

    this.riskCalibrations.set(actionType, {
      actionType,
      estimatedRisk,
      actualFailureRate,
      calibrationError,
      occurrences: outcomes.length
    });
  }

  /**
   * Update efficiency metrics for actions
   * Calculate gold-per-energy, gold-per-minute, etc.
   */
  private updateEfficiencyMetrics(outcome: ActionOutcome): void {
    const actionType = outcome.action.type;
    const outcomes = this.history.filter(h => h.action.type === actionType);

    if (outcomes.length === 0) return;

    const totalReward = outcomes.reduce((sum, o) => sum + o.reward, 0);
    const totalCost = outcomes.reduce((sum, o) => sum + o.cost, 0);
    const totalDuration = outcomes.reduce((sum, o) => sum + o.duration, 0);
    const successes = outcomes.filter(o => o.success).length;
    const successRate = successes / outcomes.length;

    const goldPerEnergy = totalCost > 0 ? totalReward / totalCost : 0;
    const goldPerMinute = totalDuration > 0 ? (totalReward / totalDuration) * 60000 : 0;

    // Overall score combines efficiency and reliability
    const overallScore = goldPerEnergy * successRate;

    this.efficiencyMetrics.set(actionType, {
      actionType,
      goldPerEnergy,
      goldPerMinute,
      successRateWeighted: successRate,
      overallScore
    });
  }

  /**
   * Analyze all detected patterns
   */
  analyzePatterns(): Map<string, Pattern> {
    return new Map(this.patterns);
  }

  /**
   * Get high-confidence patterns only
   */
  getConfidentPatterns(minConfidence: number = 0.7): Pattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Check if current strategy is failing
   * Triggers need for adaptation
   */
  shouldAdaptStrategy(): boolean {
    const recentHistory = this.history.slice(-20); // Last 20 actions
    if (recentHistory.length < 10) return false; // Not enough data

    const recentSuccessRate = recentHistory.filter(h => h.success).length / recentHistory.length;

    // If recent success < 40%, time to adapt
    return recentSuccessRate < 0.4;
  }

  /**
   * Get recommendation based on learned patterns
   * This is where the bot's intelligence shows
   */
  getRecommendation(context: GameContext): string | null {
    const recommendations: string[] = [];

    // Recommendation 1: Avoid combat at low health
    if (context.character.health < 40) {
      const lowHealthPattern = this.patterns.get('combat_health_20');
      if (lowHealthPattern &&
          lowHealthPattern.successRate < 0.3 &&
          lowHealthPattern.confidence > 0.6) {
        recommendations.push('avoid_combat_low_health');
      }
    }

    // Recommendation 2: Avoid actions at low energy
    if (context.character.energy < 25) {
      const lowEnergyPatterns = Array.from(this.patterns.values())
        .filter(p => p.pattern.includes('_energy_0') && p.successRate < 0.3);

      if (lowEnergyPatterns.length > 0) {
        recommendations.push('rest_low_energy');
      }
    }

    // Recommendation 3: Exploit good temporal patterns
    if (context.timeOfDay) {
      const temporalKey = `${context.timeOfDay}_`;
      const goodTemporalPatterns = Array.from(this.temporalPatterns.values())
        .filter(p => p.timeOfDay === context.timeOfDay &&
                     p.successRate > 0.7 &&
                     p.occurrences >= 5)
        .sort((a, b) => b.averageReward - a.averageReward);

      if (goodTemporalPatterns.length > 0) {
        recommendations.push(`focus_${goodTemporalPatterns[0].actionType}_${context.timeOfDay}`);
      }
    }

    // Recommendation 4: Use successful combos
    const goodCombos = Array.from(this.combos.values())
      .filter(c => c.successRate > 0.7 && c.confidence > 0.6)
      .sort((a, b) => b.averageReward - a.averageReward);

    if (goodCombos.length > 0 && context.recentActions) {
      const recentSeq = context.recentActions.slice(-2);
      for (const combo of goodCombos) {
        // Check if we're in the middle of a good combo
        if (combo.sequence.slice(0, 2).join('->') === recentSeq.join('->')) {
          recommendations.push(`complete_combo_${combo.sequence.join('->')}`);
        }
      }
    }

    // Recommendation 5: Equipment matters
    if (!context.character.equipment || context.character.equipment.length === 0) {
      const equippedPattern = this.patterns.get('combat_equipped');
      const unequippedPattern = this.patterns.get('combat_unequipped');

      if (equippedPattern && unequippedPattern &&
          equippedPattern.successRate > unequippedPattern.successRate + 0.2 &&
          equippedPattern.confidence > 0.6) {
        recommendations.push('equip_gear_before_combat');
      }
    }

    return recommendations.length > 0 ? recommendations[0] : null;
  }

  /**
   * Get recent performance statistics
   */
  getStats(): MemoryStats {
    const totalActions = this.history.length;
    const successful = this.history.filter(h => h.success).length;

    const actionBreakdown: Record<string, any> = {};
    for (const [actionType, successRate] of this.successRates.entries()) {
      const actionOutcomes = this.history.filter(h => h.action.type === actionType);
      const count = actionOutcomes.length;
      const totalReward = actionOutcomes.reduce((sum, h) => sum + h.reward, 0);
      const totalCost = actionOutcomes.reduce((sum, h) => sum + h.cost, 0);

      actionBreakdown[actionType] = {
        count,
        successRate,
        averageReward: count > 0 ? totalReward / count : 0,
        averageCost: count > 0 ? totalCost / count : 0,
        efficiency: totalCost > 0 ? totalReward / totalCost : 0
      };
    }

    // Calculate trend
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (this.history.length >= 20) {
      const recent = this.history.slice(-10);
      const older = this.history.slice(-20, -10);
      const recentRate = recent.filter(h => h.success).length / recent.length;
      const olderRate = older.filter(h => h.success).length / older.length;

      if (recentRate > olderRate + 0.1) recentTrend = 'improving';
      else if (recentRate < olderRate - 0.1) recentTrend = 'declining';
    }

    return {
      totalActions,
      successfulActions: successful,
      failedActions: totalActions - successful,
      totalReward: this.history.reduce((sum, h) => sum + h.reward, 0),
      totalCost: this.history.reduce((sum, h) => sum + h.cost, 0),
      averageSuccessRate: totalActions > 0 ? successful / totalActions : 0,
      actionBreakdown,
      recentTrend,
      bestAction: this.getBestAction(),
      worstAction: this.getWorstAction()
    };
  }

  /**
   * Get best performing action type
   */
  getBestAction(): string | null {
    let bestAction: string | null = null;
    let bestScore = 0;

    for (const [actionType, metric] of this.efficiencyMetrics.entries()) {
      if (metric.overallScore > bestScore) {
        bestScore = metric.overallScore;
        bestAction = actionType;
      }
    }

    return bestAction;
  }

  /**
   * Get worst performing action type
   */
  getWorstAction(): string | null {
    let worstAction: string | null = null;
    let worstRate = 1.0;

    for (const [actionType, successRate] of this.successRates.entries()) {
      const outcomes = this.history.filter(h => h.action.type === actionType);
      // Only consider actions with enough data
      if (outcomes.length >= 5 && successRate < worstRate) {
        worstRate = successRate;
        worstAction = actionType;
      }
    }

    return worstAction;
  }

  /**
   * Get most efficient actions by different metrics
   */
  getMostEfficientActions(): {
    byGoldPerEnergy: string | null;
    byGoldPerMinute: string | null;
    byOverallScore: string | null;
  } {
    let bestGPE: string | null = null;
    let bestGPM: string | null = null;
    let bestOverall: string | null = null;
    let maxGPE = 0;
    let maxGPM = 0;
    let maxOverall = 0;

    for (const [actionType, metric] of this.efficiencyMetrics.entries()) {
      if (metric.goldPerEnergy > maxGPE) {
        maxGPE = metric.goldPerEnergy;
        bestGPE = actionType;
      }
      if (metric.goldPerMinute > maxGPM) {
        maxGPM = metric.goldPerMinute;
        bestGPM = actionType;
      }
      if (metric.overallScore > maxOverall) {
        maxOverall = metric.overallScore;
        bestOverall = actionType;
      }
    }

    return {
      byGoldPerEnergy: bestGPE,
      byGoldPerMinute: bestGPM,
      byOverallScore: bestOverall
    };
  }

  /**
   * Get best combos for planning sequences
   */
  getBestCombos(minConfidence: number = 0.6): ActionCombo[] {
    return Array.from(this.combos.values())
      .filter(c => c.confidence >= minConfidence)
      .sort((a, b) => b.averageReward - a.averageReward)
      .slice(0, 10); // Top 10
  }

  /**
   * Get temporal insights
   */
  getTemporalInsights(): {
    bestTimeForAction: Map<string, string>;
    actionsByTimeOfDay: Map<string, string[]>;
  } {
    const bestTimeForAction = new Map<string, string>();
    const actionsByTimeOfDay = new Map<string, string[]>();

    // Initialize time buckets
    ['morning', 'afternoon', 'evening', 'night'].forEach(time => {
      actionsByTimeOfDay.set(time, []);
    });

    // Find best time for each action
    const actionTypes = new Set(this.history.map(h => h.action.type));
    for (const actionType of actionTypes) {
      let bestTime = 'morning';
      let bestRate = 0;

      for (const [key, pattern] of this.temporalPatterns.entries()) {
        if (pattern.actionType === actionType &&
            pattern.occurrences >= 5 &&
            pattern.successRate > bestRate) {
          bestRate = pattern.successRate;
          bestTime = pattern.timeOfDay;
        }
      }

      if (bestRate > 0) {
        bestTimeForAction.set(actionType, bestTime);
        actionsByTimeOfDay.get(bestTime)?.push(actionType);
      }
    }

    return { bestTimeForAction, actionsByTimeOfDay };
  }

  /**
   * Get risk calibration insights
   */
  getRiskInsights(): RiskCalibration[] {
    return Array.from(this.riskCalibrations.values())
      .filter(r => r.occurrences >= 5)
      .sort((a, b) => b.calibrationError - a.calibrationError);
  }

  /**
   * Clear memory (start fresh)
   */
  reset(): void {
    this.history = [];
    this.successRates.clear();
    this.patterns.clear();
    this.combos.clear();
    this.temporalPatterns.clear();
    this.riskCalibrations.clear();
    this.efficiencyMetrics.clear();
  }

  /**
   * Export memory for analysis/debugging
   */
  exportMemory(): string {
    return JSON.stringify({
      historySize: this.history.length,
      successRates: Array.from(this.successRates.entries()),
      patterns: Array.from(this.patterns.values()),
      combos: Array.from(this.combos.values()),
      temporalPatterns: Array.from(this.temporalPatterns.values()),
      riskCalibrations: Array.from(this.riskCalibrations.values()),
      efficiencyMetrics: Array.from(this.efficiencyMetrics.values()),
      stats: this.getStats()
    }, null, 2);
  }

  /**
   * Import memory from exported data
   */
  importMemory(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      this.successRates = new Map(parsed.successRates);
      this.patterns = new Map(parsed.patterns.map((p: Pattern) => [p.id, p]));
      this.combos = new Map(parsed.combos.map((c: ActionCombo) => [c.sequence.join('->'), c]));
      this.temporalPatterns = new Map(parsed.temporalPatterns.map((t: TemporalPattern) =>
        [`${t.timeOfDay}_${t.actionType}`, t]
      ));
      this.riskCalibrations = new Map(parsed.riskCalibrations.map((r: RiskCalibration) =>
        [r.actionType, r]
      ));
      this.efficiencyMetrics = new Map(parsed.efficiencyMetrics.map((e: EfficiencyMetric) =>
        [e.actionType, e]
      ));

      return true;
    } catch (error) {
      console.error('Failed to import memory:', error);
      return false;
    }
  }

  /**
   * Get a learning report showing how the bot has improved
   */
  getLearningReport(): string {
    const stats = this.getStats();
    const patterns = this.getConfidentPatterns(0.7);
    const combos = this.getBestCombos(0.7);
    const temporal = this.getTemporalInsights();
    const efficient = this.getMostEfficientActions();

    let report = `=== BOT LEARNING REPORT ===\n\n`;

    report += `OVERALL PERFORMANCE:\n`;
    report += `- Total Actions: ${stats.totalActions}\n`;
    report += `- Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%\n`;
    report += `- Total Reward: ${stats.totalReward.toFixed(0)} gold\n`;
    report += `- Total Cost: ${stats.totalCost.toFixed(0)} energy\n`;
    report += `- Trend: ${stats.recentTrend}\n`;
    report += `- Best Action: ${stats.bestAction || 'None'}\n`;
    report += `- Worst Action: ${stats.worstAction || 'None'}\n\n`;

    report += `PATTERNS LEARNED (${patterns.length} confident patterns):\n`;
    patterns.slice(0, 5).forEach(p => {
      report += `- ${p.pattern}: ${(p.successRate * 100).toFixed(1)}% success `;
      report += `(${p.occurrences} times, ${(p.confidence * 100).toFixed(0)}% confidence, `;
      report += `trend: ${p.trend})\n`;
    });
    report += `\n`;

    report += `BEST ACTION COMBOS (${combos.length} learned):\n`;
    combos.slice(0, 3).forEach(c => {
      report += `- ${c.sequence.join(' → ')}: ${(c.successRate * 100).toFixed(1)}% success, `;
      report += `${c.averageReward.toFixed(0)} avg reward\n`;
    });
    report += `\n`;

    report += `EFFICIENCY INSIGHTS:\n`;
    report += `- Best Gold/Energy: ${efficient.byGoldPerEnergy || 'Unknown'}\n`;
    report += `- Best Gold/Minute: ${efficient.byGoldPerMinute || 'Unknown'}\n`;
    report += `- Best Overall: ${efficient.byOverallScore || 'Unknown'}\n\n`;

    report += `TEMPORAL PATTERNS:\n`;
    temporal.actionsByTimeOfDay.forEach((actions, time) => {
      if (actions.length > 0) {
        report += `- ${time}: ${actions.join(', ')}\n`;
      }
    });

    return report;
  }
}

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * const memory = new BotMemory();
 *
 * // Record an action outcome
 * memory.recordOutcome({
 *   id: 'action-123',
 *   action: { type: 'combat', target: 'bandit' },
 *   timestamp: new Date(),
 *   success: true,
 *   reward: 50,
 *   cost: 10,
 *   context: {
 *     character: {
 *       health: 80,
 *       energy: 45,
 *       gold: 200,
 *       level: 5,
 *       equipment: ['pistol', 'hat']
 *     },
 *     location: 'saloon',
 *     timeOfDay: 'afternoon'
 *   },
 *   duration: 2500
 * });
 *
 * // Check if strategy needs adaptation
 * if (memory.shouldAdaptStrategy()) {
 *   console.log('Recent performance poor - adapting strategy');
 * }
 *
 * // Get recommendation for current context
 * const recommendation = memory.getRecommendation({
 *   character: {
 *     health: 30,
 *     energy: 50,
 *     gold: 100,
 *     level: 5
 *   },
 *   timeOfDay: 'evening'
 * });
 *
 * if (recommendation === 'avoid_combat_low_health') {
 *   console.log('Bot learned: Combat at low health is risky!');
 * }
 *
 * // Get performance statistics
 * const stats = memory.getStats();
 * console.log(`Success rate: ${stats.averageSuccessRate * 100}%`);
 * console.log(`Best action: ${stats.bestAction}`);
 *
 * // Get learned patterns
 * const patterns = memory.getConfidentPatterns(0.7);
 * patterns.forEach(p => {
 *   console.log(`Pattern: ${p.pattern} - ${p.successRate * 100}% success`);
 * });
 *
 * // Get best combos
 * const combos = memory.getBestCombos(0.6);
 * combos.forEach(c => {
 *   console.log(`Combo: ${c.sequence.join(' -> ')} - ${c.averageReward} gold`);
 * });
 *
 * // Export for later analysis
 * const exported = memory.exportMemory();
 * fs.writeFileSync('bot-memory.json', exported);
 *
 * // Get learning report
 * console.log(memory.getLearningReport());
 * ```
 */
