import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { AppError, HttpStatus } from '../../src/types';

/**
 * Error Handler Middleware Tests
 */
describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  it('should handle AppError with custom status code', () => {
    const error = new AppError('Test error', HttpStatus.BAD_REQUEST);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Test error',
      })
    );
  });

  it('should handle AppError with validation errors', () => {
    const errors = {
      email: ['Email is required'],
      password: ['Password must be at least 8 characters'],
    };

    const error = new AppError('Validation failed', HttpStatus.BAD_REQUEST, true, errors);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation failed',
        errors,
      })
    );
  });

  it('should handle generic Error with 500 status', () => {
    const error = new Error('Generic error');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'An unexpected error occurred',
      })
    );
  });

  it('should include timestamp in response', () => {
    const error = new AppError('Test error', HttpStatus.BAD_REQUEST);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      })
    );
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Invalid token',
      })
    );
  });

  it('should handle expired token errors', () => {
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Token expired',
      })
    );
  });

  it('should handle cast errors', () => {
    const error = new Error('Cast to ObjectId failed');
    error.name = 'CastError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Invalid data format',
      })
    );
  });
});
