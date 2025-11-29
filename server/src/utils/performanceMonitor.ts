/**
 * Performance Monitoring Utility
 *
 * Provides utilities for monitoring and logging performance metrics
 * Use in production to track API response times, database queries, etc.
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics in memory

  /**
   * Start a performance timer
   */
  startTimer(operation: string): (metadata?: Record<string, any>) => void {
    const start = Date.now();

    return (metadata?: Record<string, any>) => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration, metadata);

      // Log slow operations (> 1 second)
      if (duration > 1000) {
        console.warn(`[PERFORMANCE] Slow operation: ${operation} took ${duration}ms`, metadata);
      }
    };
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const endTimer = this.startTimer(operation);
    try {
      const result = await fn();
      endTimer(metadata);
      return result;
    } catch (error) {
      endTimer({ ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure a sync operation
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const endTimer = this.startTimer(operation);
    try {
      const result = fn();
      endTimer(metadata);
      return result;
    } catch (error) {
      endTimer({ ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.metrics.push({
      operation,
      duration,
      timestamp: new Date(),
      metadata
    });

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const operationMetrics = this.metrics
      .filter(m => m.operation === operation)
      .map(m => m.duration)
      .sort((a, b) => a - b);

    if (operationMetrics.length === 0) {
      return null;
    }

    const sum = operationMetrics.reduce((a, b) => a + b, 0);

    return {
      count: operationMetrics.length,
      min: operationMetrics[0],
      max: operationMetrics[operationMetrics.length - 1],
      avg: sum / operationMetrics.length,
      p50: operationMetrics[Math.floor(operationMetrics.length * 0.5)],
      p95: operationMetrics[Math.floor(operationMetrics.length * 0.95)],
      p99: operationMetrics[Math.floor(operationMetrics.length * 0.99)]
    };
  }

  /**
   * Get all operation stats
   */
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const operations = new Set(this.metrics.map(m => m.operation));
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};

    for (const operation of operations) {
      stats[operation] = this.getStats(operation);
    }

    return stats;
  }

  /**
   * Print performance summary
   */
  printSummary(): void {
    const stats = this.getAllStats();

    console.log('\n========================================');
    console.log('PERFORMANCE SUMMARY');
    console.log('========================================\n');

    for (const [operation, stat] of Object.entries(stats)) {
      if (!stat) continue;

      console.log(`${operation}:`);
      console.log(`  Count: ${stat.count}`);
      console.log(`  Avg: ${stat.avg.toFixed(2)}ms`);
      console.log(`  Min: ${stat.min}ms`);
      console.log(`  P50: ${stat.p50}ms`);
      console.log(`  P95: ${stat.p95}ms`);
      console.log(`  P99: ${stat.p99}ms`);
      console.log(`  Max: ${stat.max}ms\n`);
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get recent slow operations
   */
  getSlowOperations(threshold: number = 1000, limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Express middleware for automatic request timing
 */
export function performanceMiddleware(req: any, res: any, next: any): void {
  const endTimer = performanceMonitor.startTimer(`${req.method} ${req.path}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    endTimer({
      statusCode: res.statusCode,
      userId: req.user?._id,
      characterId: req.character?._id
    });
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Database query timer decorator
 */
export function measureQuery(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const endTimer = performanceMonitor.startTimer(`DB: ${propertyKey}`);
    try {
      const result = await originalMethod.apply(this, args);
      endTimer();
      return result;
    } catch (error) {
      endTimer({ error: true });
      throw error;
    }
  };
}

/**
 * Usage Examples:
 *
 * 1. Manual timing:
 *    const endTimer = performanceMonitor.startTimer('my-operation');
 *    // ... do work ...
 *    endTimer();
 *
 * 2. Async function:
 *    const result = await performanceMonitor.measureAsync(
 *      'fetch-user',
 *      () => User.findById(userId)
 *    );
 *
 * 3. Express middleware:
 *    app.use(performanceMiddleware);
 *
 * 4. Get stats:
 *    const stats = performanceMonitor.getStats('GET /api/characters');
 *    console.log(`Average response time: ${stats.avg}ms`);
 *
 * 5. Print summary:
 *    performanceMonitor.printSummary();
 */
