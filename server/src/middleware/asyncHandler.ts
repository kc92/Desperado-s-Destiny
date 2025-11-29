import { Request, Response, NextFunction } from 'express';

/**
 * Async request handler type that can work with any Request type
 * Supports handlers with or without next parameter
 */
export type AsyncRequestHandler<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next?: NextFunction
) => Promise<void | Response>;

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
export function asyncHandler<TRequest extends Request = Request>(
  fn: AsyncRequestHandler<TRequest>
) {
  return (req: TRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export default asyncHandler;
