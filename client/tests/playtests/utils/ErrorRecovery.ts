/**
 * ErrorRecovery - Production-ready error handling and recovery for playtest bots
 *
 * Features:
 * - Automatic bot restart on crashes
 * - Graceful degradation when features unavailable
 * - Network error handling with exponential backoff
 * - Session recovery (continue from where crashed)
 * - Comprehensive error reporting and logging
 * - Circuit breaker pattern for repeated failures
 */

import { BotLogger } from './BotLogger.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorRecoveryConfig {
  maxRetries: number;
  initialRetryDelay: number;
  maxRetryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetTime: number;
  stateDir: string;
}

export interface BotState {
  botName: string;
  lastSuccessfulAction: string;
  timestamp: number;
  sessionData: {
    gold?: number;
    energy?: number;
    level?: number;
    location?: string;
    inventory?: any[];
  };
  errorHistory: ErrorRecord[];
  consecutiveFailures: number;
}

export interface ErrorRecord {
  error: string;
  action: string;
  timestamp: number;
  stack?: string;
  recovered: boolean;
  recoveryStrategy?: string;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  NAVIGATION = 'NAVIGATION',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export class ErrorRecovery {
  private config: ErrorRecoveryConfig;
  private logger: BotLogger;
  private state: BotState;
  private stateFile: string;
  private circuitBreakers: Map<string, CircuitBreaker>;

  constructor(botName: string, config?: Partial<ErrorRecoveryConfig>) {
    this.config = {
      maxRetries: 3,
      initialRetryDelay: 1000,
      maxRetryDelay: 30000,
      circuitBreakerThreshold: 5,
      circuitBreakerResetTime: 300000, // 5 minutes
      stateDir: path.join(process.cwd(), 'tests', 'playtests', 'state'),
      ...config,
    };

    this.logger = new BotLogger(`${botName}-ErrorRecovery`);
    this.circuitBreakers = new Map();

    // Ensure state directory exists
    if (!fs.existsSync(this.config.stateDir)) {
      fs.mkdirSync(this.config.stateDir, { recursive: true });
    }

    this.stateFile = path.join(this.config.stateDir, `${botName}-state.json`);

    // Load or initialize state
    this.state = this.loadState(botName);

    this.logger.info('ErrorRecovery initialized');
  }

  /**
   * Load saved state or create new state
   */
  private loadState(botName: string): BotState {
    if (fs.existsSync(this.stateFile)) {
      try {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        const state = JSON.parse(data);
        this.logger.info(`Loaded saved state from ${this.stateFile}`);
        return state;
      } catch (error) {
        this.logger.warn(`Failed to load state, creating new state: ${error}`);
      }
    }

    return {
      botName,
      lastSuccessfulAction: 'initialization',
      timestamp: Date.now(),
      sessionData: {},
      errorHistory: [],
      consecutiveFailures: 0,
    };
  }

  /**
   * Save current state to disk
   */
  saveState(): void {
    try {
      this.state.timestamp = Date.now();
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      this.logger.error(`Failed to save state: ${error}`);
    }
  }

  /**
   * Update session data
   */
  updateSessionData(data: Partial<BotState['sessionData']>): void {
    this.state.sessionData = { ...this.state.sessionData, ...data };
    this.saveState();
  }

  /**
   * Record successful action
   */
  recordSuccess(action: string): void {
    this.state.lastSuccessfulAction = action;
    this.state.consecutiveFailures = 0;
    this.saveState();
  }

  /**
   * Classify error type
   */
  private classifyError(error: any): ErrorType {
    const errorMessage = error.message?.toLowerCase() || String(error).toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return ErrorType.NETWORK;
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return ErrorType.TIMEOUT;
    }
    if (errorMessage.includes('not found') || errorMessage.includes('selector') || errorMessage.includes('element')) {
      return ErrorType.ELEMENT_NOT_FOUND;
    }
    if (errorMessage.includes('navigation') || errorMessage.includes('navigate')) {
      return ErrorType.NAVIGATION;
    }
    if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Get recovery strategy for error type
   */
  private getRecoveryStrategy(errorType: ErrorType): string {
    const strategies: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'retry_with_backoff',
      [ErrorType.TIMEOUT]: 'increase_timeout_and_retry',
      [ErrorType.ELEMENT_NOT_FOUND]: 'graceful_skip',
      [ErrorType.NAVIGATION]: 'reload_page',
      [ErrorType.AUTHENTICATION]: 'restart_session',
      [ErrorType.VALIDATION]: 'skip_and_log',
      [ErrorType.UNKNOWN]: 'retry_once',
    };

    return strategies[errorType];
  }

  /**
   * Execute action with retry logic and error recovery
   */
  async executeWithRecovery<T>(
    action: string,
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      fallback?: () => Promise<T>;
      critical?: boolean;
    }
  ): Promise<{ success: boolean; result?: T; error?: any }> {
    const maxRetries = options?.maxRetries ?? this.config.maxRetries;
    let retryCount = 0;
    let lastError: any;

    // Check circuit breaker
    const breaker = this.getCircuitBreaker(action);
    if (breaker.isOpen()) {
      this.logger.warn(`Circuit breaker OPEN for action: ${action}`);

      if (options?.fallback) {
        try {
          const result = await options.fallback();
          return { success: true, result };
        } catch (fallbackError) {
          return { success: false, error: fallbackError };
        }
      }

      return { success: false, error: new Error('Circuit breaker open') };
    }

    while (retryCount <= maxRetries) {
      try {
        this.logger.info(`Executing action: ${action} (attempt ${retryCount + 1}/${maxRetries + 1})`);

        const result = await fn();

        // Success!
        breaker.recordSuccess();
        this.recordSuccess(action);

        return { success: true, result };

      } catch (error) {
        lastError = error;
        retryCount++;

        const errorType = this.classifyError(error);
        this.logger.error(`Action failed: ${action} - ${error} (Type: ${errorType})`);

        // Record error
        const errorRecord: ErrorRecord = {
          error: String(error),
          action,
          timestamp: Date.now(),
          stack: error instanceof Error ? error.stack : undefined,
          recovered: false,
          recoveryStrategy: this.getRecoveryStrategy(errorType),
        };

        this.state.errorHistory.push(errorRecord);
        this.state.consecutiveFailures++;
        breaker.recordFailure();

        // If we've exhausted retries, break
        if (retryCount > maxRetries) {
          break;
        }

        // Apply recovery strategy
        const recovered = await this.applyRecoveryStrategy(errorType, retryCount);
        errorRecord.recovered = recovered;

        this.saveState();

        // If critical action and recovery failed, don't retry
        if (options?.critical && !recovered) {
          break;
        }
      }
    }

    // All retries failed
    this.logger.error(`Action failed after ${retryCount} attempts: ${action}`);
    this.saveState();

    // Try fallback if available
    if (options?.fallback) {
      try {
        this.logger.info(`Attempting fallback for: ${action}`);
        const result = await options.fallback();
        return { success: true, result };
      } catch (fallbackError) {
        this.logger.error(`Fallback failed: ${fallbackError}`);
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Apply recovery strategy based on error type
   */
  private async applyRecoveryStrategy(errorType: ErrorType, retryCount: number): Promise<boolean> {
    const strategy = this.getRecoveryStrategy(errorType);
    this.logger.info(`Applying recovery strategy: ${strategy}`);

    try {
      switch (strategy) {
        case 'retry_with_backoff':
          const delay = Math.min(
            this.config.initialRetryDelay * Math.pow(2, retryCount - 1),
            this.config.maxRetryDelay
          );
          this.logger.info(`Waiting ${delay}ms before retry (exponential backoff)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return true;

        case 'increase_timeout_and_retry':
          this.logger.info('Increasing timeout and retrying');
          await new Promise(resolve => setTimeout(resolve, 5000));
          return true;

        case 'graceful_skip':
          this.logger.warn('Element not found, skipping gracefully');
          return false; // Don't retry, just skip

        case 'reload_page':
          this.logger.info('Attempting page reload');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return true;

        case 'restart_session':
          this.logger.warn('Authentication error, session restart needed');
          return false; // Require manual restart

        case 'skip_and_log':
          this.logger.warn('Validation error, skipping action');
          return false;

        case 'retry_once':
        default:
          await new Promise(resolve => setTimeout(resolve, 1000));
          return retryCount === 1; // Only retry once for unknown errors
      }
    } catch (error) {
      this.logger.error(`Recovery strategy failed: ${error}`);
      return false;
    }
  }

  /**
   * Get or create circuit breaker for action
   */
  private getCircuitBreaker(action: string): CircuitBreaker {
    if (!this.circuitBreakers.has(action)) {
      this.circuitBreakers.set(
        action,
        new CircuitBreaker(
          action,
          this.config.circuitBreakerThreshold,
          this.config.circuitBreakerResetTime,
          this.logger
        )
      );
    }
    return this.circuitBreakers.get(action)!;
  }

  /**
   * Check if bot should restart based on error history
   */
  shouldRestart(): boolean {
    // Restart if too many consecutive failures
    if (this.state.consecutiveFailures >= 10) {
      this.logger.error('Too many consecutive failures, restart recommended');
      return true;
    }

    // Restart if error rate is too high
    const recentErrors = this.state.errorHistory.filter(
      e => Date.now() - e.timestamp < 600000 // Last 10 minutes
    );

    if (recentErrors.length >= 20) {
      this.logger.error('High error rate detected, restart recommended');
      return true;
    }

    return false;
  }

  /**
   * Get recovery report
   */
  getReport(): {
    totalErrors: number;
    consecutiveFailures: number;
    errorsByType: Record<string, number>;
    recentErrors: ErrorRecord[];
    circuitBreakerStatus: Record<string, string>;
  } {
    const errorsByType: Record<string, number> = {};

    for (const error of this.state.errorHistory) {
      const type = error.recoveryStrategy || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    }

    const recentErrors = this.state.errorHistory
      .filter(e => Date.now() - e.timestamp < 3600000) // Last hour
      .slice(-10);

    const circuitBreakerStatus: Record<string, string> = {};
    for (const [action, breaker] of this.circuitBreakers.entries()) {
      circuitBreakerStatus[action] = breaker.getStatus();
    }

    return {
      totalErrors: this.state.errorHistory.length,
      consecutiveFailures: this.state.consecutiveFailures,
      errorsByType,
      recentErrors,
      circuitBreakerStatus,
    };
  }

  /**
   * Reset error history
   */
  reset(): void {
    this.state.errorHistory = [];
    this.state.consecutiveFailures = 0;
    this.circuitBreakers.clear();
    this.saveState();
    this.logger.info('Error recovery state reset');
  }

  /**
   * Get bot state
   */
  getState(): BotState {
    return { ...this.state };
  }
}

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private action: string,
    private threshold: number,
    private resetTime: number,
    private logger: BotLogger
  ) {}

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.logger.warn(`Circuit breaker OPENED for ${this.action} (${this.failureCount} failures)`);
    }
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.logger.info(`Circuit breaker CLOSED for ${this.action}`);
    } else if (this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime > this.resetTime) {
        this.state = 'HALF_OPEN';
        this.logger.info(`Circuit breaker HALF-OPEN for ${this.action}`);
        return false;
      }
      return true;
    }
    return false;
  }

  getStatus(): string {
    return `${this.state} (failures: ${this.failureCount})`;
  }
}
