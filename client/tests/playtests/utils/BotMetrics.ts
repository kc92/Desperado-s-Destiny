/**
 * BotMetrics - Metrics collection and reporting for playtest bots
 */

import * as fs from 'fs';
import * as path from 'path';

interface ActionRecord {
  action: string;
  timestamp: number;
  metadata?: any;
}

interface MetricsSummary {
  botName: string;
  startTime: number;
  endTime?: number;
  totalActions: number;
  actionCounts: Record<string, number>;
  actionHistory: ActionRecord[];
  errors: number;
  sessionDuration?: number;
}

export class BotMetrics {
  private botName: string;
  private metrics: MetricsSummary;
  private dataFile: string;

  constructor(botName: string) {
    this.botName = botName;

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'tests', 'playtests', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.dataFile = path.join(dataDir, `${botName}-metrics-${timestamp}.json`);

    this.metrics = {
      botName,
      startTime: Date.now(),
      totalActions: 0,
      actionCounts: {},
      actionHistory: [],
      errors: 0,
    };
  }

  recordAction(action: string, metadata?: any): void {
    this.metrics.totalActions++;

    if (!this.metrics.actionCounts[action]) {
      this.metrics.actionCounts[action] = 0;
    }
    this.metrics.actionCounts[action]++;

    this.metrics.actionHistory.push({
      action,
      timestamp: Date.now(),
      metadata,
    });

    // Save periodically (every 10 actions)
    if (this.metrics.totalActions % 10 === 0) {
      this.saveMetrics();
    }
  }

  recordError(): void {
    this.metrics.errors++;
  }

  private saveMetrics(): void {
    this.metrics.endTime = Date.now();
    this.metrics.sessionDuration = this.metrics.endTime - this.metrics.startTime;

    fs.writeFileSync(this.dataFile, JSON.stringify(this.metrics, null, 2));
  }

  saveSummary(): void {
    this.saveMetrics();

    // Create a summary report
    const summary = {
      botName: this.botName,
      sessionDuration: `${Math.floor((this.metrics.sessionDuration || 0) / 1000 / 60)} minutes`,
      totalActions: this.metrics.totalActions,
      actionsPerMinute: ((this.metrics.totalActions / ((this.metrics.sessionDuration || 1) / 1000 / 60)).toFixed(2)),
      topActions: Object.entries(this.metrics.actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
      errors: this.metrics.errors,
    };

    const summaryFile = this.dataFile.replace('.json', '-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('\n=== Bot Metrics Summary ===');
    console.log(JSON.stringify(summary, null, 2));
  }

  getMetrics(): MetricsSummary {
    return { ...this.metrics };
  }
}
