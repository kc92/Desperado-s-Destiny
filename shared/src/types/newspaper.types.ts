/**
 * Newspaper System Types
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Dynamic newspaper system that reports on world events and player actions
 */

import { ObjectId } from 'mongodb';

export type FactionId = 'settlers' | 'frontera' | 'nahi' | 'military';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type ArticleCategory =
  | 'crime'
  | 'politics'
  | 'business'
  | 'society'
  | 'weird-west'
  | 'player-actions'
  | 'breaking-news';

export type WorldEventType =
  | 'bank-robbery'
  | 'train-heist'
  | 'murder'
  | 'arrest'
  | 'territory-change'
  | 'faction-war'
  | 'election'
  | 'law-change'
  | 'market-change'
  | 'business-opening'
  | 'property-sale'
  | 'social-event'
  | 'supernatural-sighting'
  | 'mysterious-event'
  | 'legendary-kill'
  | 'gang-activity'
  | 'achievement-unlock'
  | 'duel'
  | 'gang-war'
  | 'bounty-claimed'
  | 'escape';

export type NewsBias =
  | 'pro-law'
  | 'anti-criminal'
  | 'pro-military'
  | 'anti-settler'
  | 'pro-frontera'
  | 'pro-nahi'
  | 'sensationalist'
  | 'neutral';

export type NewspaperAlignment = FactionId | 'neutral' | 'sensational';

export interface Newspaper {
  id: string;
  name: string;
  motto: string;
  alignment: NewspaperAlignment;
  coverageAreas: string[];
  publishDay: DayOfWeek;
  price: number;
  subscriptionPrice: number;
  editor: string;
  biases: NewsBias[];
  language: 'english' | 'bilingual';
  logo?: string;
  founded: string;
  circulation: number;
}

export interface NewsArticle {
  _id?: ObjectId;
  newspaperId: string;
  headline: string;
  subheadline?: string;
  byline: string;
  content: string;
  category: ArticleCategory;
  publishDate: Date;
  editionNumber: number;

  // Source
  eventType: WorldEventType;
  sourceEventId?: ObjectId;
  involvedCharacters: ObjectId[];
  involvedFactions: FactionId[];
  location?: string;

  // Impact
  reputationEffects: Map<string, number>;
  bountyIncrease?: number;
  infamyGain?: number;

  // Tracking
  readBy: ObjectId[];
  reactionsCount: number;
  featured: boolean;
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface NewsSubscription {
  _id?: ObjectId;
  characterId: ObjectId;
  newspaperId: string;
  subscriptionType: 'single' | 'monthly' | 'archive';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  deliveryMethod: 'mail' | 'instant';
  paid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeadlineTemplate {
  eventType: WorldEventType;
  category: ArticleCategory;
  templates: string[];
  biasModifiers: {
    bias: NewsBias;
    alternativeTemplates: string[];
  }[];
}

export interface ArticleGenerationParams {
  eventType: WorldEventType;
  category: ArticleCategory;
  newspaperId: string;
  involvedCharacters: Array<{
    id: ObjectId;
    name: string;
    faction?: FactionId;
    notoriety?: number;
  }>;
  location?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface NewspaperEdition {
  newspaperId: string;
  editionNumber: number;
  publishDate: Date;
  articles: NewsArticle[];
  featuredArticle: NewsArticle;
  circulation: number;
  price: number;
}

export interface NewsReaction {
  _id?: ObjectId;
  articleId: ObjectId;
  characterId: ObjectId;
  reactionType: 'like' | 'angry' | 'shocked' | 'laugh';
  comment?: string;
  createdAt: Date;
}

export interface NewsArchive {
  newspaperId: string;
  editions: NewspaperEdition[];
  searchable: boolean;
  accessLevel: 'public' | 'subscriber' | 'premium';
}

export interface NewspaperStats {
  newspaperId: string;
  totalEditions: number;
  totalArticles: number;
  totalSubscribers: number;
  mostReadArticle: ObjectId;
  averageReactionCount: number;
  revenue: number;
}

// API Types
export interface CreateArticleRequest {
  params: ArticleGenerationParams;
  manualContent?: {
    headline: string;
    content: string;
    byline: string;
  };
}

export interface ReadArticleRequest {
  articleId: string;
  characterId: string;
}

export interface SubscribeRequest {
  characterId: string;
  newspaperId: string;
  subscriptionType: 'monthly' | 'archive';
  autoRenew?: boolean;
}

export interface SearchArticlesRequest {
  newspaperId?: string;
  category?: ArticleCategory;
  eventType?: WorldEventType;
  characterName?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface GetEditionRequest {
  newspaperId: string;
  editionNumber?: number;
  date?: Date;
}

export interface ArticleImpact {
  characterId: ObjectId;
  reputationChange: number;
  infamyChange: number;
  bountyChange: number;
  factionReputationChanges: Map<FactionId, number>;
}

export interface NewsDelivery {
  characterId: ObjectId;
  articleId: ObjectId;
  newspaperId: string;
  deliveryDate: Date;
  read: boolean;
  archived: boolean;
}
