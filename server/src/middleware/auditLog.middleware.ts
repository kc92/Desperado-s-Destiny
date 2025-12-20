/**
 * Audit Log Middleware
 * Security Audit - Phase 2
 *
 * Middleware to log all admin actions asynchronously
 * Captures request details without blocking the response
 */

import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Extract action description from endpoint and method
 */
function getActionDescription(endpoint: string, method: string): string {
  const endpointActions: Record<string, string> = {
    '/api/calendar/admin/advance': 'Advanced game calendar',
    '/api/calendar/admin/sync': 'Synced calendar with server time',
    '/api/world-boss/:bossId/spawn': 'Spawned world boss',
    '/api/world-boss/:bossId/end': 'Ended world boss session',
    '/api/weather/set': 'Set weather manually',
    '/api/energy/grant': 'Granted energy to character',
    '/api/login-rewards/reset': 'Reset login reward progress',
    '/api/jail/release/:characterId': 'Released character from jail',
    '/api/gossip/:gossipId/spread': 'Spread gossip manually',
    '/api/gossip/create': 'Created gossip entry',
    '/api/newspaper/articles': 'Created newspaper article',
    '/api/newspaper/publish': 'Published newspaper',
    '/api/newspaper/world-event': 'Handled world event for newspaper',
  };

  // Try exact match first
  if (endpointActions[endpoint]) {
    return endpointActions[endpoint];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, action] of Object.entries(endpointActions)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    if (regex.test(endpoint)) {
      return action;
    }
  }

  // Fallback to generic description
  return `${method} ${endpoint}`;
}

/**
 * Extract IP address from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(data: any): any {
  if (!data) return {};

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Middleware to audit log admin actions
 * Uses setImmediate to log asynchronously without blocking the response
 */
export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only log if user is authenticated and is an admin
  if (!req.user || req.user.role !== 'admin') {
    return next();
  }

  const startTime = Date.now();

  // Capture request data
  const requestData = {
    userId: new mongoose.Types.ObjectId(req.user._id),
    characterId: req.character?._id
      ? new mongoose.Types.ObjectId(req.character._id)
      : undefined,
    action: getActionDescription(req.path, req.method),
    endpoint: req.path,
    method: req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
    metadata: sanitizeMetadata({
      params: req.params,
      query: req.query,
      body: req.body,
    }),
  };

  // Hook into response finish event
  const originalSend = res.send;
  res.send = function (data: any) {
    res.send = originalSend;

    // Log asynchronously after response is sent
    setImmediate(async () => {
      try {
        const responseTime = Date.now() - startTime;

        await AuditLog.create({
          ...requestData,
          statusCode: res.statusCode,
          metadata: {
            ...requestData.metadata,
            responseTime,
          },
        });

        logger.info('Admin action audited', {
          action: requestData.action,
          user: req.user?.email,
          statusCode: res.statusCode,
          responseTime,
        });
      } catch (error) {
        logger.error('Failed to create audit log', {
          error: error instanceof Error ? error.message : 'Unknown error',
          action: requestData.action,
          user: req.user?.email,
        });
      }
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Standalone function to manually log admin actions
 * Use this for actions that don't go through the middleware
 */
export async function logAdminAction(params: {
  userId: mongoose.Types.ObjectId;
  action: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  ip: string;
  characterId?: mongoose.Types.ObjectId;
  userAgent?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await AuditLog.create(params);
  } catch (error) {
    logger.error('Failed to manually log admin action', {
      error: error instanceof Error ? error.message : 'Unknown error',
      action: params.action,
    });
  }
}
