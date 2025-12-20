/**
 * Currency Service
 *
 * API client for the currency system:
 * - Dollars (primary currency)
 * - Gold Resource (valuable material)
 * - Silver Resource (common material)
 * - Exchange operations
 */

import api from './api';
import { CurrencyType } from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

export interface CurrencyBalance {
  characterId: string;
  characterName: string;
  dollars: number;
  goldResource: number;
  silverResource: number;
}

export interface Transaction {
  _id: string;
  characterId: string;
  currencyType: CurrencyType;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'TRANSFER' | 'ADMIN';
  source: string;
  balanceBefore: number;
  balanceAfter: number;
  exchangeRate?: number;
  exchangedFrom?: CurrencyType;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface CurrencyStatistics {
  totalEarned: number;
  totalSpent: number;
  netAmount: number;
  transactionCount: number;
}

export interface AllStatistics {
  dollars: CurrencyStatistics & { currentBalance: number };
  goldResource: CurrencyStatistics & { currentBalance: number };
  silverResource: CurrencyStatistics & { currentBalance: number };
}

export interface ExchangeRates {
  gold: {
    currentRate: number;
    baseRate: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    lastUpdated: Date;
  };
  silver: {
    currentRate: number;
    baseRate: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    lastUpdated: Date;
  };
  feeRate: number;
}

export interface PriceHistoryEntry {
  timestamp: Date;
  price: number;
  eventType?: string;
}

export interface ExchangeResult {
  resourceType: 'gold' | 'silver';
  amount: number;
  exchangeRate: number;
  fee: number;
  dollarsReceived?: number;
  dollarsSpent?: number;
  newDollarBalance: number;
  newResourceBalance: number;
  message: string;
}

// =============================================================================
// API CALLS
// =============================================================================

/**
 * Get all currency balances
 */
export async function getBalance(): Promise<CurrencyBalance> {
  const response = await api.get('/currency/balance');
  return response.data.data;
}

/**
 * Get specific resource balance
 */
export async function getResourceBalance(type: 'gold' | 'silver'): Promise<number> {
  const response = await api.get(`/currency/resources/${type}`);
  return response.data.data.balance;
}

/**
 * Get transaction history
 */
export async function getHistory(options?: {
  limit?: number;
  offset?: number;
  type?: CurrencyType;
}): Promise<{
  transactions: Transaction[];
  statistics: CurrencyStatistics;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.type) params.append('type', options.type);

  const response = await api.get(`/currency/history?${params.toString()}`);
  return response.data.data;
}

/**
 * Get resource-specific transaction history
 */
export async function getResourceHistory(
  type: 'gold' | 'silver',
  options?: { limit?: number; offset?: number }
): Promise<{
  resourceType: string;
  transactions: Transaction[];
  pagination: { limit: number; offset: number };
}> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await api.get(`/currency/resources/${type}/history?${params.toString()}`);
  return response.data.data;
}

/**
 * Get detailed statistics for all currencies
 */
export async function getStatistics(): Promise<AllStatistics> {
  const response = await api.get('/currency/statistics');
  return response.data.data;
}

/**
 * Get current exchange rates
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await api.get('/currency/rates');
  return response.data.data;
}

/**
 * Get price history for a resource
 */
export async function getPriceHistory(
  type: 'gold' | 'silver',
  days: number = 7
): Promise<PriceHistoryEntry[]> {
  const response = await api.get(`/currency/rates/history?type=${type}&days=${days}`);
  return response.data.data.history;
}

/**
 * Sell resource for dollars
 */
export async function sellResource(
  type: 'gold' | 'silver',
  amount: number
): Promise<ExchangeResult> {
  const response = await api.post('/currency/exchange/sell', { type, amount });
  return response.data.data;
}

/**
 * Buy resource with dollars
 */
export async function buyResource(
  type: 'gold' | 'silver',
  amount: number
): Promise<ExchangeResult> {
  const response = await api.post('/currency/exchange/buy', { type, amount });
  return response.data.data;
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const currencyService = {
  getBalance,
  getResourceBalance,
  getHistory,
  getResourceHistory,
  getStatistics,
  getExchangeRates,
  getPriceHistory,
  sellResource,
  buyResource,
};

export default currencyService;
