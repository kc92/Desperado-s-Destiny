/**
 * Investment Service
 * API client for investment-related endpoints (Phase 10)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  maturityDays: number;
  volatility: number;
}

export interface Investment {
  _id: string;
  characterId: string;
  productId: string;
  productName: string;
  amount: number;
  purchasePrice: number;
  currentValue: number;
  returnPercentage: number;
  status: 'active' | 'matured' | 'cashed_out' | 'lost';
  investedAt: Date;
  maturesAt: Date;
  cashedOutAt?: Date;
}

export interface Portfolio {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  investments: Investment[];
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
  };
}

export interface InvestmentHistory {
  _id: string;
  productName: string;
  amount: number;
  returnAmount: number;
  returnPercentage: number;
  status: string;
  investedAt: Date;
  completedAt: Date;
}

/**
 * Investment service for API calls
 */
export const investmentService = {
  /**
   * Get available investment products
   */
  getProducts: async () => {
    const response = await apiClient.get<ApiResponse<{ products: InvestmentProduct[] }>>(
      '/investments/products'
    );
    return response.data;
  },

  /**
   * Get portfolio
   */
  getPortfolio: async () => {
    const response = await apiClient.get<ApiResponse<{ portfolio: Portfolio }>>(
      '/investments/portfolio'
    );
    return response.data;
  },

  /**
   * Make an investment
   */
  invest: async (productId: string, amount: number) => {
    const response = await apiClient.post<ApiResponse<{ investment: Investment }>>(
      '/investments/invest',
      { productId, amount }
    );
    return response.data;
  },

  /**
   * Cash out investment
   */
  cashOut: async (investmentId: string) => {
    const response = await apiClient.post<ApiResponse<{
      investment: Investment;
      payout: number;
      profit: number
    }>>(
      `/investments/${investmentId}/cashout`
    );
    return response.data;
  },

  /**
   * Get investment history
   */
  getHistory: async (limit: number = 20, offset: number = 0) => {
    const response = await apiClient.get<ApiResponse<{
      history: InvestmentHistory[];
      total: number
    }>>(
      '/investments/history',
      { params: { limit, offset } }
    );
    return response.data;
  },
};

export default investmentService;
