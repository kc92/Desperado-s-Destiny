/**
 * Newspaper Service
 * Phase 12, Wave 12.1 - Desperados Destiny
 * API client for newspaper-related endpoints
 */

import { apiCall } from './api';
import type {
  Newspaper,
  NewsArticle,
  NewsSubscription,
  NewspaperEdition,
  NewspaperStats,
  SearchArticlesRequest,
  CreateArticleRequest,
  SubscribeRequest,
} from '@desperados/shared';

// Request types
export interface BuySingleNewspaperRequest {
  characterId: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
}

export interface GetCharacterMentionsRequest {
  characterId: string;
  limit?: number;
  offset?: number;
}

export interface GetEditionParams {
  newspaperId: string;
  editionNumber: number;
}

export interface GetArticleParams {
  articleId: string;
}

export interface PublishNewspaperRequest {
  newspaperId: string;
  articles?: string[]; // Article IDs to include
}

export interface HandleWorldEventRequest {
  eventType: string;
  eventData: Record<string, any>;
}

// Response types
export interface GetAllNewspapersResponse {
  newspapers: Newspaper[];
}

export interface GetBreakingNewsResponse {
  articles: NewsArticle[];
}

export interface GetCurrentEditionResponse {
  edition: NewspaperEdition;
}

export interface GetEditionResponse {
  edition: NewspaperEdition;
}

export interface GetArticleResponse {
  article: NewsArticle;
}

export interface SearchArticlesResponse {
  articles: NewsArticle[];
  total: number;
  hasMore: boolean;
}

export interface GetStatsResponse {
  stats: NewspaperStats;
}

export interface SubscribeResponse {
  subscription: NewsSubscription;
}

export interface BuySingleNewspaperResponse {
  success: boolean;
  article: NewsArticle;
}

export interface GetSubscriptionsResponse {
  subscriptions: NewsSubscription[];
}

export interface GetCharacterMentionsResponse {
  articles: NewsArticle[];
  total: number;
}

export interface CreateArticleResponse {
  article: NewsArticle;
}

export interface PublishNewspaperResponse {
  edition: NewspaperEdition;
}

export interface HandleWorldEventResponse {
  articles: NewsArticle[];
}

/**
 * Get all available newspapers
 * Public endpoint - no auth required
 */
export async function getAllNewspapers(): Promise<GetAllNewspapersResponse> {
  return apiCall<GetAllNewspapersResponse>('get', '/newspapers');
}

/**
 * Get breaking news articles from all newspapers
 * Public endpoint - no auth required
 */
export async function getBreakingNews(): Promise<GetBreakingNewsResponse> {
  return apiCall<GetBreakingNewsResponse>('get', '/newspapers/breaking-news');
}

/**
 * Get the current edition of a specific newspaper
 * Public endpoint - no auth required
 */
export async function getCurrentEdition(newspaperId: string): Promise<GetCurrentEditionResponse> {
  return apiCall<GetCurrentEditionResponse>('get', `/newspapers/${newspaperId}/current`);
}

/**
 * Get a specific edition by edition number
 * Public endpoint - no auth required
 */
export async function getEdition(params: GetEditionParams): Promise<GetEditionResponse> {
  return apiCall<GetEditionResponse>(
    'get',
    `/newspapers/${params.newspaperId}/editions/${params.editionNumber}`
  );
}

/**
 * Get a specific article by ID
 * Public endpoint - no auth required
 */
export async function getArticle(articleId: string): Promise<GetArticleResponse> {
  return apiCall<GetArticleResponse>('get', `/newspapers/articles/${articleId}`);
}

/**
 * Search articles with filters
 * Public endpoint - no auth required
 */
export async function searchArticles(
  searchParams: SearchArticlesRequest
): Promise<SearchArticlesResponse> {
  return apiCall<SearchArticlesResponse>('post', '/newspapers/search', searchParams);
}

/**
 * Get statistics for a specific newspaper
 * Public endpoint - no auth required
 */
export async function getStats(newspaperId: string): Promise<GetStatsResponse> {
  return apiCall<GetStatsResponse>('get', `/newspapers/${newspaperId}/stats`);
}

/**
 * Subscribe to a newspaper
 * Protected endpoint - requires authentication
 */
export async function subscribe(
  newspaperId: string,
  subscribeData: Omit<SubscribeRequest, 'newspaperId'>
): Promise<SubscribeResponse> {
  return apiCall<SubscribeResponse>('post', `/newspapers/${newspaperId}/subscribe`, subscribeData);
}

/**
 * Buy a single newspaper edition
 * Protected endpoint - requires authentication
 */
export async function buySingleNewspaper(
  newspaperId: string,
  data: BuySingleNewspaperRequest
): Promise<BuySingleNewspaperResponse> {
  return apiCall<BuySingleNewspaperResponse>('post', `/newspapers/${newspaperId}/buy`, data);
}

/**
 * Cancel a newspaper subscription
 * Protected endpoint - requires authentication
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  return apiCall<void>('delete', `/newspapers/subscriptions/${subscriptionId}`);
}

/**
 * Get all subscriptions for the authenticated user
 * Protected endpoint - requires authentication
 */
export async function getSubscriptions(): Promise<GetSubscriptionsResponse> {
  return apiCall<GetSubscriptionsResponse>('get', '/newspapers/subscriptions');
}

/**
 * Get all articles mentioning a specific character
 * Protected endpoint - requires authentication
 */
export async function getCharacterMentions(
  characterId: string,
  params?: { limit?: number; offset?: number }
): Promise<GetCharacterMentionsResponse> {
  const queryParams = params
    ? `?${new URLSearchParams({
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.offset && { offset: params.offset.toString() }),
      }).toString()}`
    : '';

  return apiCall<GetCharacterMentionsResponse>(
    'get',
    `/newspapers/mentions/${characterId}${queryParams}`
  );
}

/**
 * Create a new article (admin only)
 * Protected endpoint - requires authentication and admin role
 */
export async function createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse> {
  return apiCall<CreateArticleResponse>('post', '/newspapers/articles', data);
}

/**
 * Publish a newspaper edition (admin only)
 * Protected endpoint - requires authentication and admin role
 */
export async function publishNewspaper(
  data: PublishNewspaperRequest
): Promise<PublishNewspaperResponse> {
  return apiCall<PublishNewspaperResponse>('post', '/newspapers/publish', data);
}

/**
 * Handle a world event and generate articles (admin/system only)
 * Protected endpoint - requires authentication and admin role
 */
export async function handleWorldEvent(
  data: HandleWorldEventRequest
): Promise<HandleWorldEventResponse> {
  return apiCall<HandleWorldEventResponse>('post', '/newspapers/world-event', data);
}

/**
 * Default export - newspaper service object
 */
const newspaperService = {
  getAllNewspapers,
  getBreakingNews,
  getCurrentEdition,
  getEdition,
  getArticle,
  searchArticles,
  getStats,
  subscribe,
  buySingleNewspaper,
  cancelSubscription,
  getSubscriptions,
  getCharacterMentions,
  createArticle,
  publishNewspaper,
  handleWorldEvent,
};

export default newspaperService;
