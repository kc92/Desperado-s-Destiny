/**
 * Tutorial Analytics Utilities
 * Helper functions for analyzing and exporting tutorial skip behavior
 */

import { useTutorialStore } from '@/store/useTutorialStore';
import { logger } from '@/services/logger.service';

/**
 * Get detailed analytics report
 */
export function getTutorialAnalyticsReport() {
  const state = useTutorialStore.getState();
  const summary = state.getAnalyticsSummary();
  const { skipEvents, completionEvents, sectionStartTimes } = state.analytics;

  return {
    summary,
    details: {
      skipEvents,
      completionEvents,
      sectionStartTimes,
    },
    metadata: {
      tutorialCompleted: state.tutorialCompleted,
      totalSkipCount: state.skipCount,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
    },
  };
}

/**
 * Export analytics to JSON file
 */
export function exportAnalyticsToJSON() {
  const report = getTutorialAnalyticsReport();
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tutorial-analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Log formatted analytics to console
 */
export function logAnalyticsSummary() {
  const report = getTutorialAnalyticsReport();

  logger.info('Tutorial Analytics Report', {
    context: 'tutorialAnalytics',
    section: 'summary'
  });

  logger.info('Summary', {
    context: 'tutorialAnalytics',
    totalSkips: report.summary.totalSkips,
    completedSections: report.summary.completedSections.length,
    avgProgressAtSkip: `${report.summary.averageProgressAtSkip.toFixed(1)}%`,
    avgTimeBeforeSkip: `${Math.round(report.summary.averageTimeBeforeSkipMs / 1000)}s`
  });

  if (Object.keys(report.summary.skipsBySection).length > 0) {
    logger.info('Skips by Section', {
      context: 'tutorialAnalytics',
      skipsBySection: report.summary.skipsBySection
    });
  }

  if (Object.keys(report.summary.sectionCompletionTimes).length > 0) {
    const completionTimes = Object.entries(report.summary.sectionCompletionTimes).reduce(
      (acc, [section, timeMs]) => {
        acc[section] = `${Math.round(timeMs / 1000)}s`;
        return acc;
      },
      {} as Record<string, string>
    );
    logger.info('Section Completion Times', {
      context: 'tutorialAnalytics',
      completionTimes
    });
  }

  if (report.details.skipEvents.length > 0) {
    const skipEventsFormatted = report.details.skipEvents.map(event => ({
      Section: event.sectionId,
      Step: event.stepId,
      Progress: `${event.progress}%`,
      'Time Spent': `${Math.round(event.timeSpentMs / 1000)}s`,
      Timestamp: new Date(event.timestamp).toLocaleTimeString(),
    }));
    logger.info('Skip Events Detail', {
      context: 'tutorialAnalytics',
      skipEvents: skipEventsFormatted
    });
  }
}

/**
 * Identify potential pain points based on analytics
 */
export function identifyPainPoints() {
  const report = getTutorialAnalyticsReport();
  const painPoints: Array<{
    section: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
    data: any;
  }> = [];

  // Check for sections with high skip rates
  for (const [section, skipCount] of Object.entries(report.summary.skipsBySection)) {
    if (skipCount >= 3) {
      painPoints.push({
        section,
        reason: `High skip count (${skipCount} skips)`,
        severity: 'high',
        data: { skipCount },
      });
    } else if (skipCount >= 2) {
      painPoints.push({
        section,
        reason: `Moderate skip count (${skipCount} skips)`,
        severity: 'medium',
        data: { skipCount },
      });
    }
  }

  // Check for sections with long completion times (> 2 minutes)
  for (const [section, timeMs] of Object.entries(report.summary.sectionCompletionTimes)) {
    const minutes = timeMs / 60000;
    if (minutes > 5) {
      painPoints.push({
        section,
        reason: `Very long completion time (${Math.round(minutes)} min)`,
        severity: 'high',
        data: { timeMs, minutes },
      });
    } else if (minutes > 3) {
      painPoints.push({
        section,
        reason: `Long completion time (${Math.round(minutes)} min)`,
        severity: 'medium',
        data: { timeMs, minutes },
      });
    }
  }

  // Check for early skips (progress < 20%)
  const earlySkips = report.details.skipEvents.filter(event => event.progress < 20);
  if (earlySkips.length > 0) {
    painPoints.push({
      section: 'overall',
      reason: `${earlySkips.length} early skips (< 20% progress)`,
      severity: 'high',
      data: { earlySkips: earlySkips.length, events: earlySkips },
    });
  }

  // Check for quick skips (< 30 seconds)
  const quickSkips = report.details.skipEvents.filter(event => event.timeSpentMs < 30000);
  if (quickSkips.length > 0) {
    painPoints.push({
      section: 'overall',
      reason: `${quickSkips.length} quick skips (< 30s)`,
      severity: 'medium',
      data: { quickSkips: quickSkips.length, events: quickSkips },
    });
  }

  return painPoints;
}

/**
 * Log pain points to console
 */
export function logPainPoints() {
  const painPoints = identifyPainPoints();

  if (painPoints.length === 0) {
    logger.info('No tutorial pain points detected', { context: 'tutorialAnalytics' });
    return;
  }

  logger.info('Tutorial Pain Points Detected', { context: 'tutorialAnalytics' });

  const highPriority = painPoints.filter(p => p.severity === 'high');
  const mediumPriority = painPoints.filter(p => p.severity === 'medium');
  const lowPriority = painPoints.filter(p => p.severity === 'low');

  if (highPriority.length > 0) {
    logger.warn('High Priority Pain Points', {
      context: 'tutorialAnalytics',
      priority: 'high',
      points: highPriority
    });
  }

  if (mediumPriority.length > 0) {
    logger.warn('Medium Priority Pain Points', {
      context: 'tutorialAnalytics',
      priority: 'medium',
      points: mediumPriority
    });
  }

  if (lowPriority.length > 0) {
    logger.info('Low Priority Pain Points', {
      context: 'tutorialAnalytics',
      priority: 'low',
      points: lowPriority
    });
  }
}

/**
 * Send analytics to API endpoint (placeholder for future implementation)
 */
export async function sendAnalyticsToAPI() {
  const report = getTutorialAnalyticsReport();

  // TODO: Implement API endpoint
  logger.warn('API endpoint not yet implemented', { context: 'tutorialAnalytics' });
  logger.info('Would send analytics report', { context: 'tutorialAnalytics', report });

  // Example implementation:
  /*
  try {
    const response = await fetch('/api/analytics/tutorial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      throw new Error('Failed to send analytics');
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to send tutorial analytics', error as Error, { context: 'tutorialAnalytics' });
    throw error;
  }
  */
}

/**
 * Development helper: Expose analytics functions to window object
 */
export function exposeAnalyticsToDevTools() {
  if (import.meta.env.DEV) {
    (window as any).tutorialAnalytics = {
      getReport: getTutorialAnalyticsReport,
      export: exportAnalyticsToJSON,
      log: logAnalyticsSummary,
      painPoints: logPainPoints,
      identify: identifyPainPoints,
    };

    logger.info('Tutorial Analytics Tools Available', {
      context: 'tutorialAnalytics',
      message: 'Access via window.tutorialAnalytics',
      methods: {
        getReport: 'Get full analytics report',
        export: 'Export to JSON file',
        log: 'Log formatted summary',
        painPoints: 'Log identified pain points',
        identify: 'Get pain points array'
      }
    });
  }
}
