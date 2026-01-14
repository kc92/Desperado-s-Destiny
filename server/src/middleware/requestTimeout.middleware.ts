/**
 * Request Timeout Middleware
 *
 * Prevents hung requests from accumulating and exhausting server resources.
 * Sets a timeout on each request and returns 503 Service Unavailable if exceeded.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { config } from '../config';

// Default timeout in milliseconds (30 seconds for most endpoints)
const DEFAULT_TIMEOUT_MS = 30000;

// Longer timeouts for specific route patterns
const ROUTE_TIMEOUTS: Record<string, number> = {
  // Complex game operations
  '/api/combat': 60000,           // Combat can take longer
  '/api/team-card-game': 60000,   // Team card games
  '/api/deck-game': 60000,        // Deck games
  '/api/expedition': 60000,       // Expeditions

  // Admin operations
  '/api/admin': 120000,           // Admin operations may be complex

  // File uploads
  '/api/upload': 120000,          // File uploads need more time

  // Auth operations (can involve external services)
  '/api/auth': 45000,
};

/**
 * Get timeout for a specific route
 */
function getRouteTimeout(path: string): number {
  // Check for matching route patterns
  for (const [pattern, timeout] of Object.entries(ROUTE_TIMEOUTS)) {
    if (path.startsWith(pattern)) {
      return timeout;
    }
  }
  return DEFAULT_TIMEOUT_MS;
}

/**
 * Request timeout middleware factory
 * @param defaultTimeout Default timeout in milliseconds (optional override)
 */
export function requestTimeout(defaultTimeout?: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = defaultTimeout || getRouteTimeout(req.path);

    // Set timeout header for debugging
    res.setHeader('X-Request-Timeout', timeout.toString());

    // Create timeout timer
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout exceeded', {
          path: req.path,
          method: req.method,
          timeout,
          ip: req.ip,
          userId: (req as any).user?.id,
          characterId: (req as any).character?.id,
        });

        res.status(503).json({
          success: false,
          error: 'Request timeout - the server took too long to respond',
          code: 'REQUEST_TIMEOUT',
          timeout,
        });
      }
    }, timeout);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout on connection close
    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout on error
    res.on('error', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
}

/**
 * Quick timeout middleware for fast endpoints (e.g., health checks)
 */
export function quickTimeout(timeoutMs: number = 5000) {
  return requestTimeout(timeoutMs);
}

/**
 * Extended timeout middleware for long-running operations
 */
export function extendedTimeout(timeoutMs: number = 120000) {
  return requestTimeout(timeoutMs);
}

export default requestTimeout;
