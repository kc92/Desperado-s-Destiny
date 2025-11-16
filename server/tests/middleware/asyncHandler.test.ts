import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../src/middleware/asyncHandler';

/**
 * Async Handler Middleware Tests
 */
describe('Async Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call async function and not call next on success', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    await handler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch errors and pass them to next', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);

    await handler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle synchronous errors', async () => {
    const error = new Error('Sync error');
    const asyncFn = jest.fn().mockImplementation(() => {
      throw error;
    });
    const handler = asyncHandler(asyncFn);

    await handler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
