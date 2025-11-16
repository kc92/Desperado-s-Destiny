import { Request, Response, NextFunction } from 'express';
import { AsyncRequestHandler } from '../types';

/**
 * Wrapper for async route handlers to catch errors and pass them to error handling middleware
 * This eliminates the need for try-catch blocks in every async route handler
 *
 * @param fn Async function to wrap
 * @returns Express middleware function
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * }));
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export default asyncHandler;
