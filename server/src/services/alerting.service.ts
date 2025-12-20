/**
 * Discord Alerting Service
 *
 * Sends admin notifications via Discord webhooks.
 * Supports different severity levels and rate limiting.
 */

import axios from 'axios';
import logger from '../utils/logger';

interface AlertOptions {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: Date;
}

interface AlertConfig {
  webhookUrl: string;
  enabled: boolean;
  minSeverity: 'info' | 'warning' | 'error' | 'critical';
  rateLimitMs: number;
}

// Severity colors for Discord embeds
const SEVERITY_COLORS = {
  info: 0x3498db,     // Blue
  warning: 0xf39c12,  // Orange
  error: 0xe74c3c,    // Red
  critical: 0x9b59b6, // Purple
};

// Severity emojis
const SEVERITY_EMOJIS = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  critical: '🚨',
};

// Severity levels for comparison
const SEVERITY_LEVELS = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

class AlertingService {
  private config: AlertConfig;
  private lastAlertTime: Map<string, number> = new Map();
  private alertQueue: AlertOptions[] = [];
  private processingQueue = false;

  constructor() {
    this.config = {
      webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
      enabled: process.env.ENABLE_DISCORD_ALERTS === 'true',
      minSeverity: (process.env.ALERT_MIN_SEVERITY as AlertConfig['minSeverity']) || 'warning',
      rateLimitMs: parseInt(process.env.ALERT_RATE_LIMIT_MS || '60000', 10),
    };

    if (this.config.enabled && !this.config.webhookUrl) {
      logger.warn('Discord alerting enabled but DISCORD_WEBHOOK_URL not set');
      this.config.enabled = false;
    }
  }

  /**
   * Send an alert to Discord
   */
  async send(options: AlertOptions): Promise<boolean> {
    if (!this.config.enabled) {
      logger.debug('Discord alerting disabled, skipping alert:', options.title);
      return false;
    }

    // Check severity threshold
    if (SEVERITY_LEVELS[options.severity] < SEVERITY_LEVELS[this.config.minSeverity]) {
      return false;
    }

    // Rate limiting by alert title
    const alertKey = `${options.severity}:${options.title}`;
    const now = Date.now();
    const lastTime = this.lastAlertTime.get(alertKey) || 0;

    if (now - lastTime < this.config.rateLimitMs) {
      logger.debug(`Rate limiting alert: ${options.title}`);
      return false;
    }

    this.lastAlertTime.set(alertKey, now);

    try {
      const embed = {
        title: `${SEVERITY_EMOJIS[options.severity]} ${options.title}`,
        description: options.description,
        color: SEVERITY_COLORS[options.severity],
        fields: options.fields?.map(f => ({
          name: f.name,
          value: f.value.substring(0, 1024), // Discord field value limit
          inline: f.inline ?? false,
        })) || [],
        timestamp: (options.timestamp || new Date()).toISOString(),
        footer: {
          text: 'Desperados Destiny Alert System',
        },
      };

      await axios.post(
        this.config.webhookUrl,
        { embeds: [embed] },
        { timeout: 5000 }
      );

      logger.info(`Discord alert sent: ${options.title}`);
      return true;
    } catch (error) {
      logger.error('Failed to send Discord alert:', error);
      return false;
    }
  }

  /**
   * Send a security alert (immediate, high priority)
   */
  async security(
    title: string,
    description: string,
    fields?: AlertOptions['fields']
  ): Promise<boolean> {
    return this.send({
      title: `🔒 Security: ${title}`,
      description,
      severity: 'critical',
      fields,
    });
  }

  /**
   * Send an error alert
   */
  async error(
    title: string,
    description: string,
    fields?: AlertOptions['fields']
  ): Promise<boolean> {
    return this.send({
      title: `Error: ${title}`,
      description,
      severity: 'error',
      fields,
    });
  }

  /**
   * Send a warning alert
   */
  async warning(
    title: string,
    description: string,
    fields?: AlertOptions['fields']
  ): Promise<boolean> {
    return this.send({
      title,
      description,
      severity: 'warning',
      fields,
    });
  }

  /**
   * Send an info alert
   */
  async info(
    title: string,
    description: string,
    fields?: AlertOptions['fields']
  ): Promise<boolean> {
    return this.send({
      title,
      description,
      severity: 'info',
      fields,
    });
  }

  /**
   * Send system health summary
   */
  async healthSummary(metrics: {
    activeUsers: number;
    cpuUsage: number;
    memoryUsage: number;
    dbConnections: number;
    jobQueueSize: number;
  }): Promise<boolean> {
    const severity =
      metrics.cpuUsage > 90 || metrics.memoryUsage > 90 ? 'warning' : 'info';

    return this.send({
      title: '📊 System Health Summary',
      description: 'Periodic system health report',
      severity,
      fields: [
        { name: 'Active Users', value: metrics.activeUsers.toString(), inline: true },
        { name: 'CPU Usage', value: `${metrics.cpuUsage.toFixed(1)}%`, inline: true },
        { name: 'Memory Usage', value: `${metrics.memoryUsage.toFixed(1)}%`, inline: true },
        { name: 'DB Connections', value: metrics.dbConnections.toString(), inline: true },
        { name: 'Job Queue', value: metrics.jobQueueSize.toString(), inline: true },
      ],
    });
  }

  /**
   * Send failed login alert (after threshold)
   */
  async failedLoginAttempts(
    email: string,
    attempts: number,
    ip: string,
    locked: boolean
  ): Promise<boolean> {
    return this.security(
      locked ? 'Account Locked' : 'Multiple Failed Login Attempts',
      locked
        ? `Account ${email} has been locked due to too many failed login attempts`
        : `Account ${email} has ${attempts} failed login attempts`,
      [
        { name: 'Email', value: email, inline: true },
        { name: 'Attempts', value: attempts.toString(), inline: true },
        { name: 'IP Address', value: ip, inline: true },
        { name: 'Account Locked', value: locked ? 'Yes' : 'No', inline: true },
      ]
    );
  }

  /**
   * Send JWT key rotation alert
   */
  async keyRotation(
    previousVersion: number,
    newVersion: number,
    expiryDays: number
  ): Promise<boolean> {
    return this.security(
      'JWT Key Rotated',
      `JWT signing key has been rotated. Old keys will remain valid for ${expiryDays} days.`,
      [
        { name: 'Previous Version', value: previousVersion.toString(), inline: true },
        { name: 'New Version', value: newVersion.toString(), inline: true },
        { name: 'Grace Period', value: `${expiryDays} days`, inline: true },
      ]
    );
  }

  /**
   * Send server error alert
   */
  async serverError(
    message: string,
    stack: string | undefined,
    path: string,
    method: string
  ): Promise<boolean> {
    return this.error(
      'Server Error',
      message,
      [
        { name: 'Path', value: `${method} ${path}`, inline: true },
        { name: 'Stack Trace', value: stack?.substring(0, 1000) || 'No stack trace' },
      ]
    );
  }

  /**
   * Send database connection error alert
   */
  async databaseError(error: string): Promise<boolean> {
    return this.error(
      'Database Connection Error',
      'The application is having trouble connecting to the database.',
      [
        { name: 'Error', value: error.substring(0, 1000) },
      ]
    );
  }

  /**
   * Send job failure alert
   */
  async jobFailure(
    jobName: string,
    error: string,
    attemptsMade: number
  ): Promise<boolean> {
    return this.error(
      'Background Job Failed',
      `Job "${jobName}" has failed after ${attemptsMade} attempts.`,
      [
        { name: 'Job Name', value: jobName, inline: true },
        { name: 'Attempts', value: attemptsMade.toString(), inline: true },
        { name: 'Error', value: error.substring(0, 1000) },
      ]
    );
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<AlertConfig>): void {
    Object.assign(this.config, updates);
    logger.info('Alert config updated:', updates);
  }

  /**
   * Check if alerting is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Clear rate limit cache (for testing)
   */
  clearRateLimitCache(): void {
    this.lastAlertTime.clear();
  }
}

// Export singleton instance
export const alertService = new AlertingService();

// Export class for testing
export { AlertingService };

export default alertService;
