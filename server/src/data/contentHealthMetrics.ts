/**
 * Content Health Metrics
 *
 * Defines scoring system and metrics for content health dashboard.
 * Provides real-time view of content completeness and quality.
 *
 * Phase 15, Wave 15.2 - CONTENT AUDIT
 */

export interface ContentHealthScore {
  overall: number; // 0-100
  categories: {
    completeness: number;
    balance: number;
    quality: number;
    coverage: number;
    progression: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'production_ready' | 'needs_work' | 'critical_gaps';
  recommendations: string[];
}

export interface ContentCompletenessMetrics {
  locations: { current: number; target: number; percentage: number };
  npcs: { current: number; target: number; percentage: number };
  quests: { current: number; target: number; percentage: number };
  items: { current: number; target: number; percentage: number };
  bosses: { current: number; target: number; percentage: number };
  systems: { current: number; target: number; percentage: number };
}

export interface ContentBalanceMetrics {
  factionEquity: number; // 0-100
  levelDistribution: number; // 0-100
  rarityBalance: number; // 0-100
  typeVariety: number; // 0-100
}

export interface ContentQualityMetrics {
  averageQuestComplexity: number; // Objectives per quest
  itemDepth: number; // Stats/effects per item
  npcUtilization: number; // Percentage with quests/shops
  bossQuality: number; // Unique drops per boss
}

export interface ContentCoverageMetrics {
  geographicCoverage: number; // Percentage of locations with content
  levelCoverage: number; // Percentage of levels with content
  factionCoverage: number; // Percentage of factions with full content
  systemIntegration: number; // Percentage of systems with content
}

export interface ContentProgressionMetrics {
  earlyGame: number; // 0-100, levels 1-15
  midGame: number; // 0-100, levels 16-30
  lateGame: number; // 0-100, levels 31-45
  endGame: number; // 0-100, levels 46-50
}

/**
 * Content Health Targets
 * Expected values for production-ready content
 */
export const CONTENT_TARGETS = {
  locations: 15,
  npcs: 100,
  quests: 100,
  items: 200,
  bosses: 25,
  systems: 15,

  // Balance targets
  factionEquityMin: 70,
  levelDistributionMin: 80,
  rarityBalanceMin: 70,

  // Quality targets
  avgQuestObjectives: 3,
  avgItemEffects: 2,
  npcUtilizationMin: 60,
  avgBossDrops: 3,

  // Coverage targets
  geographicCoverageMin: 75,
  levelCoverageMin: 80,
  factionCoverageMin: 80,
  systemIntegrationMin: 90,

  // Progression targets (content per level range)
  earlyGameQuestsMin: 30,
  midGameQuestsMin: 25,
  lateGameQuestsMin: 20,
  endGameQuestsMin: 10
};

/**
 * Calculate content health score
 */
export function calculateContentHealth(
  completeness: ContentCompletenessMetrics,
  balance: ContentBalanceMetrics,
  quality: ContentQualityMetrics,
  coverage: ContentCoverageMetrics,
  progression: ContentProgressionMetrics
): ContentHealthScore {
  // Calculate category scores
  const completenessScore = calculateCompletenessScore(completeness);
  const balanceScore = calculateBalanceScore(balance);
  const qualityScore = calculateQualityScore(quality);
  const coverageScore = calculateCoverageScore(coverage);
  const progressionScore = calculateProgressionScore(progression);

  // Weighted overall score
  const overall = Math.round(
    completenessScore * 0.25 +
    balanceScore * 0.20 +
    qualityScore * 0.20 +
    coverageScore * 0.20 +
    progressionScore * 0.15
  );

  // Determine grade
  const grade = overall >= 90 ? 'A' :
                overall >= 80 ? 'B' :
                overall >= 70 ? 'C' :
                overall >= 60 ? 'D' : 'F';

  // Determine status
  const status = overall >= 85 ? 'production_ready' :
                 overall >= 65 ? 'needs_work' : 'critical_gaps';

  // Generate recommendations
  const recommendations = generateRecommendations(
    completenessScore,
    balanceScore,
    qualityScore,
    coverageScore,
    progressionScore
  );

  return {
    overall,
    categories: {
      completeness: completenessScore,
      balance: balanceScore,
      quality: qualityScore,
      coverage: coverageScore,
      progression: progressionScore
    },
    grade,
    status,
    recommendations
  };
}

/**
 * Calculate completeness score
 */
function calculateCompletenessScore(metrics: ContentCompletenessMetrics): number {
  const scores = [
    metrics.locations.percentage,
    metrics.npcs.percentage,
    metrics.quests.percentage,
    metrics.items.percentage,
    metrics.bosses.percentage,
    metrics.systems.percentage
  ];

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Calculate balance score
 */
function calculateBalanceScore(metrics: ContentBalanceMetrics): number {
  return Math.round(
    (metrics.factionEquity + metrics.levelDistribution +
     metrics.rarityBalance + metrics.typeVariety) / 4
  );
}

/**
 * Calculate quality score
 */
function calculateQualityScore(metrics: ContentQualityMetrics): number {
  const questScore = Math.min(100, (metrics.averageQuestComplexity / CONTENT_TARGETS.avgQuestObjectives) * 100);
  const itemScore = Math.min(100, (metrics.itemDepth / CONTENT_TARGETS.avgItemEffects) * 100);
  const npcScore = metrics.npcUtilization;
  const bossScore = Math.min(100, (metrics.bossQuality / CONTENT_TARGETS.avgBossDrops) * 100);

  return Math.round((questScore + itemScore + npcScore + bossScore) / 4);
}

/**
 * Calculate coverage score
 */
function calculateCoverageScore(metrics: ContentCoverageMetrics): number {
  return Math.round(
    (metrics.geographicCoverage + metrics.levelCoverage +
     metrics.factionCoverage + metrics.systemIntegration) / 4
  );
}

/**
 * Calculate progression score
 */
function calculateProgressionScore(metrics: ContentProgressionMetrics): number {
  // Weight mid-game more heavily as it's most critical
  return Math.round(
    metrics.earlyGame * 0.25 +
    metrics.midGame * 0.35 +
    metrics.lateGame * 0.25 +
    metrics.endGame * 0.15
  );
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  completeness: number,
  balance: number,
  quality: number,
  coverage: number,
  progression: number
): string[] {
  const recommendations: string[] = [];

  // Completeness recommendations
  if (completeness < 70) {
    recommendations.push('CRITICAL: Add more core content (quests, items, bosses)');
  } else if (completeness < 85) {
    recommendations.push('Increase content volume to reach production targets');
  }

  // Balance recommendations
  if (balance < 70) {
    recommendations.push('CRITICAL: Address faction and level distribution imbalances');
  } else if (balance < 85) {
    recommendations.push('Fine-tune content balance across factions and levels');
  }

  // Quality recommendations
  if (quality < 70) {
    recommendations.push('CRITICAL: Improve content quality and depth');
  } else if (quality < 85) {
    recommendations.push('Add complexity to quests and items');
  }

  // Coverage recommendations
  if (coverage < 70) {
    recommendations.push('CRITICAL: Major gaps in geographic or level coverage');
  } else if (coverage < 85) {
    recommendations.push('Expand content to cover underserved areas');
  }

  // Progression recommendations
  if (progression < 70) {
    recommendations.push('CRITICAL: Progression bottlenecks detected');
  } else if (progression < 85) {
    recommendations.push('Add content to smooth progression curve');
  }

  // If everything is good
  if (recommendations.length === 0) {
    recommendations.push('Content is in excellent shape! Focus on polish and optimization.');
  }

  return recommendations;
}

/**
 * Content health thresholds for alerts
 */
export const HEALTH_THRESHOLDS = {
  critical: 60,
  warning: 75,
  good: 85,
  excellent: 95
};

/**
 * Get health status color
 */
export function getHealthStatusColor(score: number): string {
  if (score >= HEALTH_THRESHOLDS.excellent) return 'green';
  if (score >= HEALTH_THRESHOLDS.good) return 'blue';
  if (score >= HEALTH_THRESHOLDS.warning) return 'yellow';
  if (score >= HEALTH_THRESHOLDS.critical) return 'orange';
  return 'red';
}

/**
 * Get health status message
 */
export function getHealthStatusMessage(score: number): string {
  if (score >= HEALTH_THRESHOLDS.excellent) return 'Excellent - Production Ready';
  if (score >= HEALTH_THRESHOLDS.good) return 'Good - Minor improvements needed';
  if (score >= HEALTH_THRESHOLDS.warning) return 'Fair - Significant work required';
  if (score >= HEALTH_THRESHOLDS.critical) return 'Poor - Critical gaps exist';
  return 'Critical - Major work required';
}

/**
 * Priority levels for content work
 */
export enum ContentPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

/**
 * Determine content work priority based on scores
 */
export function determineContentPriority(
  categoryScore: number
): ContentPriority {
  if (categoryScore < HEALTH_THRESHOLDS.critical) return ContentPriority.CRITICAL;
  if (categoryScore < HEALTH_THRESHOLDS.warning) return ContentPriority.HIGH;
  if (categoryScore < HEALTH_THRESHOLDS.good) return ContentPriority.MEDIUM;
  return ContentPriority.LOW;
}

/**
 * Export metrics for dashboard
 */
export interface ContentDashboardData {
  timestamp: Date;
  healthScore: ContentHealthScore;
  completeness: ContentCompletenessMetrics;
  balance: ContentBalanceMetrics;
  quality: ContentQualityMetrics;
  coverage: ContentCoverageMetrics;
  progression: ContentProgressionMetrics;
  alerts: ContentAlert[];
}

export interface ContentAlert {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  actionRequired: string;
}

/**
 * Generate content alerts
 */
export function generateContentAlerts(
  healthScore: ContentHealthScore
): ContentAlert[] {
  const alerts: ContentAlert[] = [];

  // Check each category
  Object.entries(healthScore.categories).forEach(([category, score]) => {
    if (score < HEALTH_THRESHOLDS.critical) {
      alerts.push({
        severity: 'critical',
        category,
        message: `${category} score is critically low (${score}/100)`,
        actionRequired: `Immediate work required on ${category}`
      });
    } else if (score < HEALTH_THRESHOLDS.warning) {
      alerts.push({
        severity: 'warning',
        category,
        message: `${category} score needs improvement (${score}/100)`,
        actionRequired: `Address ${category} gaps in next sprint`
      });
    }
  });

  return alerts;
}

export default {
  calculateContentHealth,
  getHealthStatusColor,
  getHealthStatusMessage,
  determineContentPriority,
  generateContentAlerts,
  CONTENT_TARGETS,
  HEALTH_THRESHOLDS
};
