/**
 * Energy Middleware Tests
 *
 * Comprehensive tests for energy validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { requireEnergy, checkEnergy, EnergyRequest } from '../../src/middleware/energy.middleware';
import { Character } from '../../src/models/Character.model';
import { InsufficientEnergyError, NotFoundError, AuthenticationError } from '../../src/utils/errors';
import { ENERGY } from '@desperados/shared';

// Mock the Character model
jest.mock('../../src/models/Character.model');

// Mock logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Energy Middleware', () => {
  let mockRequest: Partial<EnergyRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        emailVerified: true,
      },
      params: {},
      body: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireEnergy', () => {
    const mockCharacter = {
      _id: 'char123',
      userId: 'user123',
      name: 'Test Character',
      energy: 100,
      maxEnergy: ENERGY.FREE_MAX,
      lastEnergyUpdate: new Date(),
      toString: () => 'user123',
    };

    it('should pass when character has sufficient energy', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRequest.energyCheck).toBeDefined();
      expect(mockRequest.energyCheck?.current).toBe(100);
      expect(mockRequest.energyCheck?.cost).toBe(50);
      expect(mockRequest.energyCheck?.remaining).toBe(50);
    });

    it('should pass when energy exactly equals cost', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: 50,
      });

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.remaining).toBe(0);
    });

    it('should throw InsufficientEnergyError when energy is insufficient', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: 20,
      });

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(InsufficientEnergyError);
      expect(error.current).toBe(20);
      expect(error.required).toBe(50);
      expect(error.deficit).toBe(30);
    });

    it('should throw AuthenticationError when user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should throw NotFoundError when character ID is missing', async () => {
      // No characterId in params, body, or query

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError when character does not exist', async () => {
      mockRequest.params = { characterId: 'nonexistent' };

      (Character.findById as jest.Mock).mockResolvedValue(null);

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should throw AuthenticationError when character is not owned by user', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        userId: {
          toString: () => 'differentUser',
        },
      });

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toContain('do not own');
    });

    it('should accept character ID from body', async () => {
      mockRequest.body = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(30);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.cost).toBe(30);
    });

    it('should accept character ID from query', async () => {
      mockRequest.query = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(20);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.cost).toBe(20);
    });

    it('should calculate energy with regeneration', async () => {
      mockRequest.params = { characterId: 'char123' };

      // Character has 50 energy, but 1 hour has passed
      // Free regen: 30 per hour, so should have 80 energy now
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: 50,
        lastEnergyUpdate: oneHourAgo,
      });

      const middleware = requireEnergy(75);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.current).toBeGreaterThanOrEqual(79);
      expect(mockRequest.energyCheck?.current).toBeLessThanOrEqual(80);
    });

    it('should cap energy at maxEnergy after regeneration', async () => {
      mockRequest.params = { characterId: 'char123' };

      // Character at full energy, but time has passed
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: ENERGY.FREE_MAX,
        lastEnergyUpdate: tenHoursAgo,
      });

      const middleware = requireEnergy(10);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.current).toBe(ENERGY.FREE_MAX);
    });

    it('should attach character to request', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.character).toBeDefined();
      expect(mockRequest.character?._id).toBe('char123');
    });

    it('should provide time until energy is available in error', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: 10,
      });

      const middleware = requireEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(InsufficientEnergyError);
      expect(error.timeUntilAvailable).toBeDefined();
      expect(typeof error.timeUntilAvailable).toBe('string');
    });

    it('should handle zero energy cost', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(0);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.cost).toBe(0);
    });

    it('should handle negative energy values gracefully', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = requireEnergy(-10);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('checkEnergy', () => {
    const mockCharacter = {
      _id: 'char123',
      userId: 'user123',
      name: 'Test Character',
      energy: 100,
      maxEnergy: ENERGY.FREE_MAX,
      lastEnergyUpdate: new Date(),
      toString: () => 'user123',
    };

    it('should attach energy info without blocking when sufficient', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = checkEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck).toBeDefined();
      expect(mockRequest.energyCheck?.current).toBe(100);
    });

    it('should not throw error when energy is insufficient', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        energy: 20,
      });

      const middleware = checkEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.remaining).toBe(-30);
    });

    it('should continue when user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = checkEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck).toBeUndefined();
    });

    it('should continue when character ID is missing', async () => {
      const middleware = checkEnergy(50);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck).toBeUndefined();
    });

    it('should work without specifying cost', async () => {
      mockRequest.params = { characterId: 'char123' };

      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const middleware = checkEnergy();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.energyCheck?.cost).toBe(0);
    });
  });
});
