/**
 * Input Sanitization Middleware
 *
 * Sanitizes user input to prevent XSS and injection attacks
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Recursively sanitize object values
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Escape HTML entities to prevent XSS
    return validator.escape(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(value)) {
      // Also sanitize keys to prevent prototype pollution
      const sanitizedKey = typeof key === 'string' ? validator.escape(key) : key;
      sanitized[sanitizedKey] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

/**
 * Middleware to sanitize query parameters
 */
export function sanitizeQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
}

/**
 * Middleware to sanitize all user input
 */
export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  sanitizeBody(req, res, () => {});
  sanitizeQuery(req, res, () => {});
  next();
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(input: string): string {
  return validator.stripLow(input.replace(/<[^>]*>/g, ''));
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return validator.normalizeEmail(email) || email.toLowerCase().trim();
}

/**
 * Check for dangerous patterns (SQL injection, XSS, etc.)
 */
export function containsDangerousPatterns(input: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /\{.*\$.*\}/g, // NoSQL injection attempts
    /\$where/gi,
    /\$ne/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}

export default {
  sanitizeBody,
  sanitizeQuery,
  sanitizeInput,
  stripHtml,
  sanitizeEmail,
  containsDangerousPatterns
};
