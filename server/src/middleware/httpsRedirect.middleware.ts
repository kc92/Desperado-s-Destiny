/**
 * HTTPS Redirect Middleware
 * Production Readiness - Security Fix
 *
 * Redirects all HTTP requests to HTTPS in production environments.
 * Prevents unencrypted traffic and enforces secure connections.
 *
 * Only active in production. Development environments can use HTTP.
 */

import { Request, Response, NextFunction } from 'express';
import config from '../config';
import logger from '../utils/logger';

/**
 * Redirects HTTP requests to HTTPS in production
 *
 * Checks multiple headers to detect HTTPS:
 * - req.secure (Express built-in)
 * - x-forwarded-proto (load balancers, proxies)
 * - x-forwarded-ssl (some reverse proxies)
 *
 * Uses 301 (permanent redirect) to inform browsers/search engines
 * that HTTPS is the canonical URL.
 */
export function httpsRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip redirect in non-production environments
  if (!config.isProduction) {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  if (!isHttps) {
    // Construct HTTPS URL
    const httpsUrl = `https://${req.hostname}${req.url}`;

    // Log the redirect for monitoring
    logger.warn(`[HTTPS Redirect] Redirecting HTTP request to HTTPS`, {
      originalUrl: req.url,
      httpsUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // 301 = Permanent redirect
    // Tells browsers/crawlers to always use HTTPS
    return res.redirect(301, httpsUrl);
  }

  // Request is already HTTPS, continue
  next();
}

export default httpsRedirect;
