/**
 * Admin Controller
 *
 * Handles administrative operations for user management, economy monitoring, and system analytics
 */

import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { GoldTransaction, TransactionSource } from '../models/GoldTransaction.model';
import { AppError, HttpStatus } from '../types';
import { sendSuccess, sendError } from '../utils/responseHelpers';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import os from 'os';
import { logSecurityEvent, logEconomyEvent, SecurityEvent, EconomyEvent } from '../services/base';
import { DollarService } from '../services/dollar.service';

/**
 * C2 SECURITY FIX: Escape regex special characters to prevent NoSQL injection
 * Without this, attackers can use patterns like ".*" to enumerate all records
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * H7 SECURITY FIX: Safely parse and bound pagination parameters
 * Prevents DoS via massive skip/limit values and handles invalid input
 */
function safePaginationParams(
  pageInput: unknown,
  limitInput: unknown,
  maxLimit: number = 100
): { page: number; limit: number; skip: number } {
  // Parse page with safe defaults
  let page = 1;
  if (pageInput !== undefined && pageInput !== null) {
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed) && parsed >= 1) {
      page = Math.floor(parsed);
    }
  }

  // Parse limit with safe defaults and bounds
  let limit = 50;
  if (limitInput !== undefined && limitInput !== null) {
    const parsed = Number(limitInput);
    if (Number.isFinite(parsed) && parsed >= 1) {
      limit = Math.min(Math.floor(parsed), maxLimit);
    }
  }

  // Calculate skip with overflow protection
  const skip = Math.max(0, (page - 1) * limit);

  // Additional safety: cap skip to prevent memory issues
  const maxSkip = 100000;
  if (skip > maxSkip) {
    logger.warn(`[SECURITY] Pagination skip capped from ${skip} to ${maxSkip}`);
    return { page: Math.floor(maxSkip / limit) + 1, limit, skip: maxSkip };
  }

  return { page, limit, skip };
}

/**
 * GET /api/admin/users
 * Get list of all users with filtering and pagination
 * H7 SECURITY FIX: Safe pagination bounds
 */
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { search, role, isActive } = req.query;

  // H7 SECURITY FIX: Use safe pagination helper
  const { page, limit, skip } = safePaginationParams(req.query.page, req.query.limit);

  // Build query
  const query: any = {};

  if (search) {
    // C2 SECURITY FIX: Escape regex to prevent NoSQL injection
    query.email = { $regex: escapeRegex(search as string), $options: 'i' };
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Execute query with pagination
  const users = await User.find(query)
    .select('-passwordHash -verificationToken -resetPasswordToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  sendSuccess(res, {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

/**
 * GET /api/admin/users/:userId
 * Get detailed information about a specific user
 */
export async function getUserDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', HttpStatus.BAD_REQUEST);
  }

  const user = await User.findById(userId)
    .select('-passwordHash -verificationToken -resetPasswordToken');

  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  // Get user's characters
  const characters = await Character.find({ userId: new mongoose.Types.ObjectId(userId) });

  sendSuccess(res, {
    user,
    characters
  });
}

/**
 * POST /api/admin/users/:userId/ban
 * Ban a user
 */
export async function banUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', HttpStatus.BAD_REQUEST);
  }

  // Prevent admin from banning themselves
  if (userId === req.user?._id) {
    throw new AppError('Cannot ban yourself', HttpStatus.BAD_REQUEST);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  // Update user status
  user.isActive = false;
  await user.save();

  logger.info(`Admin ${req.user?.email} banned user ${user.email}. Reason: ${reason || 'Not specified'}`);

  // Audit log the admin ban action
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'BAN_USER',
      targetUserId: userId,
      targetEmail: user.email,
      reason: reason || 'Not specified',
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'User banned successfully',
    userId: user._id
  });
}

/**
 * POST /api/admin/users/:userId/unban
 * Unban a user
 */
export async function unbanUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', HttpStatus.BAD_REQUEST);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  // Update user status
  user.isActive = true;
  await user.save();

  logger.info(`Admin ${req.user?.email} unbanned user ${user.email}`);

  // Audit log the admin unban action
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'UNBAN_USER',
      targetUserId: userId,
      targetEmail: user.email,
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'User unbanned successfully',
    userId: user._id
  });
}

/**
 * GET /api/admin/characters
 * Get list of all characters with filtering and pagination
 * H7 SECURITY FIX: Safe pagination bounds
 */
export async function getCharacters(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { search, faction, minLevel, maxLevel } = req.query;

  // H7 SECURITY FIX: Use safe pagination parsing
  const { page, limit, skip } = safePaginationParams(req.query.page, req.query.limit);

  // Build query
  const query: any = {};

  if (search) {
    // C2 SECURITY FIX: Escape regex to prevent NoSQL injection
    query.name = { $regex: escapeRegex(search as string), $options: 'i' };
  }

  if (faction) {
    query.faction = faction;
  }

  if (minLevel) {
    query.level = { ...query.level, $gte: Number(minLevel) };
  }

  if (maxLevel) {
    query.level = { ...query.level, $lte: Number(maxLevel) };
  }

  // Execute query with pagination (skip already calculated by safePaginationParams)
  const characters = await Character.find(query)
    .populate('userId', 'email')
    .sort({ level: -1, gold: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Character.countDocuments(query);

  sendSuccess(res, {
    characters,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

/**
 * PUT /api/admin/characters/:characterId
 * Modify a character's properties
 */
export async function updateCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { characterId } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(characterId)) {
    throw new AppError('Invalid character ID', HttpStatus.BAD_REQUEST);
  }

  // Whitelist of allowed updates
  const allowedUpdates = ['gold', 'level', 'health', 'energy', 'wanted'];
  const actualUpdates: any = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      actualUpdates[key] = updates[key];
    }
  }

  const character = await Character.findByIdAndUpdate(
    characterId,
    actualUpdates,
    { new: true, runValidators: true }
  );

  if (!character) {
    throw new AppError('Character not found', HttpStatus.NOT_FOUND);
  }

  logger.info(`Admin ${req.user?.email} updated character ${character.name} (${characterId}):`, actualUpdates);

  // Audit log the admin character update
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'UPDATE_CHARACTER',
      targetCharacterId: characterId,
      characterName: character.name,
      updates: actualUpdates,
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'Character updated successfully',
    character
  });
}

/**
 * DELETE /api/admin/characters/:characterId
 * Delete a character
 */
export async function deleteCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { characterId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(characterId)) {
    throw new AppError('Invalid character ID', HttpStatus.BAD_REQUEST);
  }

  const character = await Character.findByIdAndDelete(characterId);

  if (!character) {
    throw new AppError('Character not found', HttpStatus.NOT_FOUND);
  }

  logger.info(`Admin ${req.user?.email} deleted character ${character.name} (${characterId})`);

  // Audit log the admin character deletion
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'DELETE_CHARACTER',
      targetCharacterId: characterId,
      characterName: character.name,
      characterLevel: character.level,
      characterGold: character.gold,
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'Character deleted successfully',
    characterId
  });
}

/**
 * POST /api/admin/gold/adjust
 * Adjust a character's gold
 */
export async function adjustGold(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { characterId, amount, reason } = req.body;

  if (!characterId || amount === undefined) {
    throw new AppError('Character ID and amount are required', HttpStatus.BAD_REQUEST);
  }

  if (!mongoose.Types.ObjectId.isValid(characterId)) {
    throw new AppError('Invalid character ID', HttpStatus.BAD_REQUEST);
  }

  const character = await Character.findById(characterId);

  if (!character) {
    throw new AppError('Character not found', HttpStatus.NOT_FOUND);
  }

  const previousGold = character.dollars ?? character.gold ?? 0;
  const numAmount = Number(amount);

  // Use DollarService for proper currency management
  let result: { newBalance: number };
  if (numAmount >= 0) {
    result = await DollarService.addDollars(
      characterId,
      numAmount,
      TransactionSource.ADMIN_ADJUSTMENT,
      { reason: reason || `Admin adjustment by ${req.user?.email}` }
    );
  } else {
    result = await DollarService.deductDollars(
      characterId,
      Math.abs(numAmount),
      TransactionSource.ADMIN_ADJUSTMENT,
      { reason: reason || `Admin adjustment by ${req.user?.email}` }
    );
  }

  logger.info(`Admin ${req.user?.email} adjusted gold for ${character.name}: ${numAmount > 0 ? '+' : ''}${numAmount} (${previousGold} -> ${result.newBalance}). Reason: ${reason || 'Not specified'}`);

  // Audit log the admin gold adjustment
  await logEconomyEvent({
    event: numAmount > 0 ? EconomyEvent.GOLD_GRANT : EconomyEvent.GOLD_DEDUCT,
    characterId: characterId,
    amount: numAmount,
    beforeBalance: previousGold,
    afterBalance: result.newBalance,
    metadata: {
      source: 'ADMIN_ADJUSTMENT',
      reason: reason || 'Not specified',
      adminUserId: req.user?._id?.toString(),
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'Gold adjusted successfully',
    character: {
      _id: character._id,
      name: character.name,
      previousGold,
      newGold: result.newBalance,
      adjustment: numAmount
    }
  });
}

/**
 * GET /api/admin/analytics
 * Get system analytics and statistics
 */
export async function getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const [
    totalUsers,
    activeUsers,
    totalCharacters,
    totalGangs,
    totalGoldTransactions
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Character.countDocuments(),
    Gang.countDocuments(),
    GoldTransaction.countDocuments()
  ]);

  // Get total gold in circulation
  const goldAggregation = await Character.aggregate([
    { $group: { _id: null, totalGold: { $sum: '$gold' } } }
  ]);
  const totalGoldInCirculation = goldAggregation[0]?.totalGold || 0;

  // Get average gold per character
  const averageGold = totalCharacters > 0 ? totalGoldInCirculation / totalCharacters : 0;

  // Get gold transaction volume (last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTransactions = await GoldTransaction.find({
    createdAt: { $gte: twentyFourHoursAgo }
  });

  const transactionVolume24h = recentTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0
  );

  // Get new users (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  // Get level distribution
  const levelDistribution = await Character.aggregate([
    {
      $bucket: {
        groupBy: '$level',
        boundaries: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        default: 100,
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);

  sendSuccess(res, {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      newThisWeek: newUsersThisWeek
    },
    characters: {
      total: totalCharacters,
      levelDistribution
    },
    gangs: {
      total: totalGangs
    },
    economy: {
      totalGoldInCirculation,
      averageGoldPerCharacter: Math.round(averageGold),
      totalTransactions: totalGoldTransactions,
      transactionVolume24h
    }
  });
}

/**
 * GET /api/admin/gangs
 * Get list of all gangs
 * H7 SECURITY FIX: Safe pagination bounds
 */
export async function getGangs(req: AuthenticatedRequest, res: Response): Promise<void> {
  // H7 SECURITY FIX: Use safe pagination parsing
  const { page, limit, skip } = safePaginationParams(req.query.page, req.query.limit);

  const gangs = await Gang.find()
    .populate('leaderId', 'name')
    .sort({ bankBalance: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Gang.countDocuments();

  sendSuccess(res, {
    gangs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

/**
 * DELETE /api/admin/gangs/:gangId
 * Disband a gang
 */
export async function disbandGang(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { gangId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gangId)) {
    throw new AppError('Invalid gang ID', HttpStatus.BAD_REQUEST);
  }

  const gang = await Gang.findByIdAndDelete(gangId);

  if (!gang) {
    throw new AppError('Gang not found', HttpStatus.NOT_FOUND);
  }

  // Remove gang references from characters
  await Character.updateMany(
    { gangId: new mongoose.Types.ObjectId(gangId) },
    { $unset: { gangId: 1 } }
  );

  logger.info(`Admin ${req.user?.email} disbanded gang ${gang.name} (${gangId})`);

  // Audit log the admin gang disband
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'DISBAND_GANG',
      gangId: gangId,
      gangName: gang.name,
      gangLeaderId: gang.leaderId?.toString(),
      memberCount: gang.members?.length || 0,
      bank: gang.bank || 0,
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'Gang disbanded successfully',
    gangId
  });
}

/**
 * GET /api/admin/system/settings
 * Get system settings
 */
export async function getSystemSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  // In a real implementation, these would come from a database
  // For now, return environment/config values
  sendSuccess(res, {
    environment: process.env.NODE_ENV || 'development',
    maintenanceMode: false,
    registrationEnabled: true,
    chatEnabled: true
  });
}

/**
 * PUT /api/admin/system/settings
 * Update system settings
 */
export async function updateSystemSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { maintenanceMode, registrationEnabled, chatEnabled } = req.body;

  // In a real implementation, these would be saved to database
  // For now, just acknowledge the update
  logger.info(`Admin ${req.user?.email} updated system settings:`, req.body);

  // Audit log the system settings update
  await logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: req.user?._id?.toString() || 'unknown',
    ip: req.ip || 'unknown',
    metadata: {
      action: 'UPDATE_SYSTEM_SETTINGS',
      changes: {
        maintenanceMode,
        registrationEnabled,
        chatEnabled
      },
      adminEmail: req.user?.email
    }
  });

  sendSuccess(res, {
    message: 'System settings updated successfully',
    settings: {
      maintenanceMode,
      registrationEnabled,
      chatEnabled
    }
  });
}

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering and pagination
 * H7 SECURITY FIX: Safe pagination bounds
 */
export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId, action, endpoint, startDate, endDate } = req.query;

  // H7 SECURITY FIX: Use safe pagination parsing (audit logs allow up to 100 per page)
  const { page, limit, skip } = safePaginationParams(req.query.page, req.query.limit, 100);

  // Build filters
  const filters: any = {};

  if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
    filters.userId = new mongoose.Types.ObjectId(userId as string);
  }

  if (action) {
    // C2 SECURITY FIX: Escape regex to prevent NoSQL injection
    filters.action = { $regex: escapeRegex(action as string), $options: 'i' };
  }

  if (endpoint) {
    // C2 SECURITY FIX: Escape regex to prevent NoSQL injection
    filters.endpoint = { $regex: escapeRegex(endpoint as string), $options: 'i' };
  }

  if (startDate || endDate) {
    filters.timestamp = {};
    if (startDate) {
      filters.timestamp.$gte = new Date(startDate as string);
    }
    if (endDate) {
      filters.timestamp.$lte = new Date(endDate as string);
    }
  }

  // Import AuditLog model dynamically
  const { AuditLog } = await import('../models/AuditLog.model');

  // Execute query with pagination (skip already calculated by safePaginationParams)
  const logs = await AuditLog.find(filters)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'email username')
    .populate('characterId', 'name')
    .lean();

  const total = await AuditLog.countDocuments(filters);

  logger.info(`Admin ${req.user?.email} viewed audit logs`, {
    filters,
    resultsCount: logs.length
  });

  sendSuccess(res, {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

/**
 * GET /api/admin/server/health
 * Get server health metrics
 */
export async function getServerHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  // System info
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const cpuCount = os.cpus().length;
  const loadAverage = os.loadavg();

  // Database connection status
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';

  sendSuccess(res, {
    server: {
      uptime: Math.floor(uptime),
      uptimeFormatted: formatUptime(uptime),
      nodeVersion: process.version,
      platform: process.platform
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      system: {
        total: Math.round(totalMemory / 1024 / 1024), // MB
        free: Math.round(freeMemory / 1024 / 1024), // MB
        usagePercent: Math.round(((totalMemory - freeMemory) / totalMemory) * 100)
      }
    },
    cpu: {
      count: cpuCount,
      loadAverage: loadAverage.map(val => Math.round(val * 100) / 100)
    },
    database: {
      status: dbStatusText,
      connected: dbStatus === 1
    }
  });
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * POST /api/admin/territories/reset
 * Reset all territories (dangerous operation)
 */
export async function resetTerritories(req: AuthenticatedRequest, res: Response): Promise<void> {
  // This would be implemented when territories system needs reset functionality
  logger.warn(`Admin ${req.user?.email} requested territory reset - NOT IMPLEMENTED`);

  throw new AppError('Territory reset not yet implemented', HttpStatus.NOT_IMPLEMENTED);
}
