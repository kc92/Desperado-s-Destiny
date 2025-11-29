/**
 * HumanLikenessScoring.ts - Calculates how human-like bot behavior appears
 *
 * Analyzes bot behavior patterns and generates a "human-likeness" score (0-100)
 * based on timing variance, error rate, break patterns, and social engagement.
 * Helps identify "too perfect" robotic behavior and suggests improvements.
 */

import { CognitiveState } from '../behavior/HumanBehaviorSimulator.js';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Human-likeness score breakdown
 */
export interface HumanLikenessScore {
  overall: number; // 0-100
  breakdown: {
    timingVariance: number; // 0-100
    errorRate: number; // 0-100
    breakPatterns: number; // 0-100
    socialEngagement: number; // 0-100
    actionVariety: number; // 0-100
  };
  flags: string[]; // Issues detected
  recommendations: string[]; // How to improve
  classification: 'robotic' | 'suspicious' | 'human-like' | 'very-human';
}

/**
 * Behavioral data for analysis
 */
export interface BehaviorData {
  // Timing data
  actionTimings: number[]; // milliseconds between actions
  avgActionDuration: number;
  timingStdDev: number;

  // Error data
  totalActions: number;
  totalErrors: number;
  errorRate: number;

  // Break data
  breaksTaken: number;
  avgBreakDuration: number;
  timeSinceLastBreak: number;

  // Social data
  messagesSent: number;
  friendshipsFormed: number;
  socialInteractions: number;

  // Action variety
  uniqueActions: number;
  totalActionTypes: number;
  repetitionRate: number;

  // Cognitive state (if available)
  cognitiveState?: CognitiveState;
}

/**
 * Expected human baseline values
 */
export interface HumanBaseline {
  timing: {
    minStdDev: number; // Minimum expected variance
    maxStdDev: number; // Maximum expected variance
    avgActionDuration: number;
  };
  errors: {
    minRate: number; // Humans make some mistakes
    maxRate: number; // But not too many
    targetRate: number;
  };
  breaks: {
    minFrequency: number; // Actions before break
    maxFrequency: number;
    minDuration: number; // Seconds
    maxDuration: number;
  };
  social: {
    minEngagementRate: number; // % of actions that are social
    targetEngagementRate: number;
  };
  variety: {
    minUniqueRatio: number; // Unique actions / total action types
    targetUniqueRatio: number;
  };
}

// ============================================================================
// HUMAN BASELINES
// ============================================================================

/**
 * Baseline values representing typical human behavior
 */
export const HUMAN_BASELINES: HumanBaseline = {
  timing: {
    minStdDev: 500, // Humans vary by at least 0.5s
    maxStdDev: 5000, // But not wildly (under 5s variance)
    avgActionDuration: 3000, // ~3 seconds per action
  },
  errors: {
    minRate: 0.02, // 2% minimum error rate
    maxRate: 0.15, // 15% maximum (too many errors is suspicious)
    targetRate: 0.05, // 5% is ideal
  },
  breaks: {
    minFrequency: 20, // Break every 20-100 actions
    maxFrequency: 100,
    minDuration: 30, // 30s - 10min breaks
    maxDuration: 600,
  },
  social: {
    minEngagementRate: 0.1, // At least 10% social
    targetEngagementRate: 0.25, // 25% is good
  },
  variety: {
    minUniqueRatio: 0.4, // At least 40% of available actions used
    targetUniqueRatio: 0.7, // 70% is ideal
  },
};

// ============================================================================
// HUMAN-LIKENESS SCORER
// ============================================================================

/**
 * Calculates human-likeness scores for bot behavior
 */
export class HumanLikenessScorer {
  private baselines: HumanBaseline;

  constructor(customBaselines?: Partial<HumanBaseline>) {
    this.baselines = {
      ...HUMAN_BASELINES,
      ...customBaselines,
    };
  }

  /**
   * Calculate comprehensive human-likeness score
   */
  calculateScore(data: BehaviorData): HumanLikenessScore {
    const timingScore = this.scoreTimingVariance(data);
    const errorScore = this.scoreErrorRate(data);
    const breakScore = this.scoreBreakPatterns(data);
    const socialScore = this.scoreSocialEngagement(data);
    const varietyScore = this.scoreActionVariety(data);

    // Weighted average (timing and errors are most important)
    const overall =
      timingScore.score * 0.3 +
      errorScore.score * 0.25 +
      breakScore.score * 0.2 +
      socialScore.score * 0.15 +
      varietyScore.score * 0.1;

    // Collect all flags and recommendations
    const flags: string[] = [
      ...timingScore.flags,
      ...errorScore.flags,
      ...breakScore.flags,
      ...socialScore.flags,
      ...varietyScore.flags,
    ];

    const recommendations: string[] = [
      ...timingScore.recommendations,
      ...errorScore.recommendations,
      ...breakScore.recommendations,
      ...socialScore.recommendations,
      ...varietyScore.recommendations,
    ];

    // Classify behavior
    let classification: HumanLikenessScore['classification'];
    if (overall >= 80) {
      classification = 'very-human';
    } else if (overall >= 60) {
      classification = 'human-like';
    } else if (overall >= 40) {
      classification = 'suspicious';
    } else {
      classification = 'robotic';
    }

    return {
      overall: Math.round(overall),
      breakdown: {
        timingVariance: Math.round(timingScore.score),
        errorRate: Math.round(errorScore.score),
        breakPatterns: Math.round(breakScore.score),
        socialEngagement: Math.round(socialScore.score),
        actionVariety: Math.round(varietyScore.score),
      },
      flags,
      recommendations,
      classification,
    };
  }

  // ============================================================================
  // INDIVIDUAL SCORING COMPONENTS
  // ============================================================================

  /**
   * Score timing variance (0-100)
   * Perfect timing = robotic, moderate variance = human
   */
  private scoreTimingVariance(data: BehaviorData): {
    score: number;
    flags: string[];
    recommendations: string[];
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let score = 50; // Start at neutral

    const stdDev = data.timingStdDev;
    const { minStdDev, maxStdDev } = this.baselines.timing;

    if (stdDev < minStdDev * 0.5) {
      // Too consistent = robotic
      score = 20;
      flags.push('Timing too consistent (robotic)');
      recommendations.push('Increase timing variance - add randomness to delays');
    } else if (stdDev < minStdDev) {
      // Slightly too consistent
      score = 50;
      flags.push('Low timing variance');
      recommendations.push('Add more variability to action timings');
    } else if (stdDev >= minStdDev && stdDev <= maxStdDev) {
      // Perfect range
      score = 100;
    } else if (stdDev > maxStdDev) {
      // Too erratic
      score = 70;
      flags.push('Timing too erratic');
      recommendations.push('Reduce extreme timing variations');
    }

    // Check for patterns in timing
    if (data.actionTimings.length >= 10) {
      const recentTimings = data.actionTimings.slice(-10);
      const variance = this.calculateVariance(recentTimings);

      if (variance < 100) {
        // Very similar timings in sequence
        score *= 0.8;
        flags.push('Repetitive timing pattern detected');
        recommendations.push('Vary timings more - humans are inconsistent');
      }
    }

    return { score, flags, recommendations };
  }

  /**
   * Score error rate (0-100)
   * No errors = suspicious, moderate errors = human
   */
  private scoreErrorRate(data: BehaviorData): {
    score: number;
    flags: string[];
    recommendations: string[];
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let score = 50;

    const errorRate = data.errorRate;
    const { minRate, maxRate, targetRate } = this.baselines.errors;

    if (errorRate === 0) {
      // Perfect = robotic
      score = 30;
      flags.push('Zero error rate (too perfect)');
      recommendations.push('Introduce occasional mistakes to appear more human');
    } else if (errorRate < minRate) {
      // Too few errors
      score = 60;
      flags.push('Very low error rate');
      recommendations.push('Increase mistake frequency slightly');
    } else if (errorRate >= minRate && errorRate <= targetRate * 1.5) {
      // Good range
      const distanceFromTarget = Math.abs(errorRate - targetRate);
      score = 100 - (distanceFromTarget / targetRate) * 20;
    } else if (errorRate > maxRate) {
      // Too many errors
      score = 50;
      flags.push('High error rate');
      recommendations.push('Reduce error frequency - bot appears incompetent');
    }

    return { score, flags, recommendations };
  }

  /**
   * Score break patterns (0-100)
   * No breaks = robotic, regular breaks = human
   */
  private scoreBreakPatterns(data: BehaviorData): {
    score: number;
    flags: string[];
    recommendations: string[];
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let score = 50;

    if (data.breaksTaken === 0) {
      // No breaks = robotic
      score = 20;
      flags.push('No breaks taken (robotic endurance)');
      recommendations.push('Implement break system based on fatigue/boredom');
      return { score, flags, recommendations };
    }

    // Check break frequency
    const actionsPerBreak = data.totalActions / data.breaksTaken;
    const { minFrequency, maxFrequency } = this.baselines.breaks;

    if (actionsPerBreak < minFrequency) {
      // Too frequent
      score = 70;
      flags.push('Breaks too frequent');
      recommendations.push('Increase time between breaks');
    } else if (actionsPerBreak >= minFrequency && actionsPerBreak <= maxFrequency) {
      // Good frequency
      score = 100;
    } else {
      // Not frequent enough
      score = 60;
      flags.push('Breaks infrequent');
      recommendations.push('Take breaks more often');
    }

    // Check break duration
    const avgBreakSec = data.avgBreakDuration / 1000;
    const { minDuration, maxDuration } = this.baselines.breaks;

    if (avgBreakSec < minDuration) {
      score *= 0.8;
      flags.push('Breaks too short');
      recommendations.push('Increase break duration');
    } else if (avgBreakSec > maxDuration) {
      score *= 0.9;
      flags.push('Breaks very long');
    }

    // Check time since last break
    const actionsSinceBreak = data.timeSinceLastBreak;
    if (actionsSinceBreak > maxFrequency * 1.5) {
      score *= 0.9;
      flags.push('Overdue for break');
      recommendations.push('Take a break - humans need rest');
    }

    return { score, flags, recommendations };
  }

  /**
   * Score social engagement (0-100)
   * No social interaction = suspicious, moderate = human
   */
  private scoreSocialEngagement(data: BehaviorData): {
    score: number;
    flags: string[];
    recommendations: string[];
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let score = 50;

    if (data.totalActions === 0) {
      return { score, flags, recommendations };
    }

    const socialRate = data.socialInteractions / data.totalActions;
    const { minEngagementRate, targetEngagementRate } = this.baselines.social;

    if (socialRate === 0) {
      // No social interaction
      score = 40;
      flags.push('No social engagement');
      recommendations.push('Add social interactions - humans chat and make friends');
    } else if (socialRate < minEngagementRate) {
      // Too little social
      score = 60;
      flags.push('Low social engagement');
      recommendations.push('Increase social interactions');
    } else if (socialRate >= minEngagementRate && socialRate <= targetEngagementRate * 1.5) {
      // Good range
      score = 100;
    } else {
      // Too much social (suspicious)
      score = 80;
      flags.push('Very high social engagement');
    }

    // Bonus for friendships (shows long-term relationships)
    if (data.friendshipsFormed > 0) {
      score = Math.min(100, score + 10);
    }

    return { score, flags, recommendations };
  }

  /**
   * Score action variety (0-100)
   * Repetitive actions = bot-like, varied = human
   */
  private scoreActionVariety(data: BehaviorData): {
    score: number;
    flags: string[];
    recommendations: string[];
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let score = 50;

    if (data.totalActionTypes === 0) {
      return { score, flags, recommendations };
    }

    const varietyRatio = data.uniqueActions / data.totalActionTypes;
    const { minUniqueRatio, targetUniqueRatio } = this.baselines.variety;

    if (varietyRatio < minUniqueRatio * 0.5) {
      // Very repetitive
      score = 30;
      flags.push('Highly repetitive actions (grinding pattern)');
      recommendations.push('Vary actions more - humans get bored with repetition');
    } else if (varietyRatio < minUniqueRatio) {
      // Somewhat repetitive
      score = 60;
      flags.push('Limited action variety');
      recommendations.push('Try different types of actions');
    } else if (varietyRatio >= minUniqueRatio && varietyRatio <= targetUniqueRatio * 1.2) {
      // Good variety
      score = 100;
    } else {
      // Too much variety (chaotic)
      score = 90;
    }

    // Check repetition rate
    if (data.repetitionRate > 0.7) {
      score *= 0.8;
      flags.push('High action repetition rate');
      recommendations.push('Break up repetitive sequences with different actions');
    }

    return { score, flags, recommendations };
  }

  // ============================================================================
  // COGNITIVE STATE ANALYSIS
  // ============================================================================

  /**
   * Analyze cognitive state for human-likeness
   */
  analyzeCognitiveState(state: CognitiveState): {
    score: number;
    insights: string[];
  } {
    const insights: string[] = [];
    let score = 100;

    // Perfect attention is suspicious
    if (state.attention === 1.0) {
      score -= 20;
      insights.push('Perfect attention maintained - humans lose focus');
    }

    // Zero fatigue over time is suspicious
    if (state.fatigue === 0) {
      score -= 15;
      insights.push('No fatigue accumulation - humans get tired');
    }

    // Good cognitive patterns
    if (state.attention > 0.7 && state.attention < 0.95) {
      insights.push('Natural attention level');
    }

    if (state.fatigue > 0.3 && state.fatigue < 0.8) {
      insights.push('Realistic fatigue accumulation');
    }

    if (state.boredom > 0.2) {
      insights.push('Experiencing boredom (human trait)');
    }

    if (state.frustration > 0.1) {
      insights.push('Shows frustration from failures (human emotion)');
    }

    return { score, insights };
  }

  // ============================================================================
  // PATTERN DETECTION
  // ============================================================================

  /**
   * Detect robotic patterns in timing
   */
  detectTimingPatterns(timings: number[]): {
    hasPattern: boolean;
    patternType?: string;
    confidence: number;
  } {
    if (timings.length < 10) {
      return { hasPattern: false, confidence: 0 };
    }

    // Check for exact repetition
    const uniqueTimings = new Set(timings.slice(-10));
    if (uniqueTimings.size === 1) {
      return {
        hasPattern: true,
        patternType: 'exact_repetition',
        confidence: 1.0,
      };
    }

    // Check for arithmetic progression
    const diffs = [];
    for (let i = 1; i < timings.length; i++) {
      diffs.push(timings[i] - timings[i - 1]);
    }

    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const diffVariance = this.calculateVariance(diffs);

    if (diffVariance < 10 && Math.abs(avgDiff) > 0) {
      return {
        hasPattern: true,
        patternType: 'arithmetic_progression',
        confidence: 0.8,
      };
    }

    // Check for periodic pattern
    const fft = this.detectPeriodicity(timings);
    if (fft.periodic) {
      return {
        hasPattern: true,
        patternType: 'periodic',
        confidence: fft.confidence,
      };
    }

    return { hasPattern: false, confidence: 0 };
  }

  /**
   * Simple periodicity detection
   */
  private detectPeriodicity(values: number[]): { periodic: boolean; confidence: number } {
    if (values.length < 20) {
      return { periodic: false, confidence: 0 };
    }

    // Check for repeating sequences
    const windowSize = 5;
    const windows: number[][] = [];

    for (let i = 0; i <= values.length - windowSize; i++) {
      windows.push(values.slice(i, i + windowSize));
    }

    // Look for similar windows
    let matchCount = 0;
    for (let i = 0; i < windows.length - 1; i++) {
      for (let j = i + 1; j < windows.length; j++) {
        if (this.arraysAreSimilar(windows[i], windows[j], 0.1)) {
          matchCount++;
        }
      }
    }

    const matchRate = matchCount / (windows.length * windows.length);

    return {
      periodic: matchRate > 0.3,
      confidence: matchRate,
    };
  }

  // ============================================================================
  // RECOMMENDATIONS ENGINE
  // ============================================================================

  /**
   * Generate prioritized recommendations for improvement
   */
  generateRecommendations(score: HumanLikenessScore): string[] {
    const prioritized: Array<{ priority: number; text: string }> = [];

    // Critical issues (score < 40)
    if (score.breakdown.timingVariance < 40) {
      prioritized.push({
        priority: 1,
        text: 'CRITICAL: Increase timing variance - currently too robotic',
      });
    }

    if (score.breakdown.errorRate < 40) {
      prioritized.push({
        priority: 1,
        text: 'CRITICAL: Add mistakes - zero errors is suspicious',
      });
    }

    // Important improvements (score < 60)
    if (score.breakdown.breakPatterns < 60) {
      prioritized.push({
        priority: 2,
        text: 'IMPORTANT: Implement realistic break patterns',
      });
    }

    if (score.breakdown.actionVariety < 60) {
      prioritized.push({
        priority: 2,
        text: 'IMPORTANT: Increase action variety to avoid grinding patterns',
      });
    }

    // Minor improvements (score < 80)
    if (score.breakdown.socialEngagement < 80) {
      prioritized.push({
        priority: 3,
        text: 'Suggested: Add more social interactions',
      });
    }

    // Sort by priority and return
    return prioritized.sort((a, b) => a.priority - b.priority).map(r => r.text);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate variance of array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Check if two arrays are similar (within tolerance)
   */
  private arraysAreSimilar(arr1: number[], arr2: number[], tolerance: number): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      const diff = Math.abs(arr1[i] - arr2[i]);
      const avg = (arr1[i] + arr2[i]) / 2;
      if (diff / avg > tolerance) {
        return false;
      }
    }

    return true;
  }

  /**
   * Format score report as string
   */
  formatReport(score: HumanLikenessScore): string {
    const lines = [
      '='.repeat(80),
      'HUMAN-LIKENESS ANALYSIS REPORT',
      '='.repeat(80),
      '',
      `Overall Score: ${score.overall}/100 [${score.classification.toUpperCase()}]`,
      '',
      'Component Scores:',
      `  Timing Variance:    ${score.breakdown.timingVariance}/100`,
      `  Error Rate:         ${score.breakdown.errorRate}/100`,
      `  Break Patterns:     ${score.breakdown.breakPatterns}/100`,
      `  Social Engagement:  ${score.breakdown.socialEngagement}/100`,
      `  Action Variety:     ${score.breakdown.actionVariety}/100`,
      '',
    ];

    if (score.flags.length > 0) {
      lines.push('Flags:');
      score.flags.forEach(flag => lines.push(`  - ${flag}`));
      lines.push('');
    }

    if (score.recommendations.length > 0) {
      lines.push('Recommendations:');
      const prioritized = this.generateRecommendations(score);
      prioritized.forEach(rec => lines.push(`  ${rec}`));
      lines.push('');
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default HumanLikenessScorer;
