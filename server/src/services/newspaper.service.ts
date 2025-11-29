/**
 * Newspaper Service
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Core newspaper logic - subscriptions, editions, article delivery
 */

import { ObjectId } from 'mongodb';
import {
  ArticleGenerationParams,
  NewsArticle,
  NewsSubscription,
  NewspaperEdition,
  SearchArticlesRequest,
  GetEditionRequest,
  FactionId,
} from '@desperados/shared';
import { NewsArticleModel } from '../models/NewsArticle.model';
import { NewsSubscriptionModel } from '../models/NewsSubscription.model';
import { headlineGeneratorService } from './headlineGenerator.service';
import { getAllNewspapers, getNewspaperById, NEWSPAPERS } from '../data/newspapers';

export class NewspaperService {
  /**
   * Create a new article from event
   */
  async createArticle(params: ArticleGenerationParams): Promise<NewsArticle> {
    // Generate article content
    const articleData = headlineGeneratorService.generateArticle(params);

    // Get current edition number
    const editionNumber = await this.getNextEditionNumber(params.newspaperId);

    // Create article
    const article = await NewsArticleModel.create({
      ...articleData,
      editionNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Notify subscribers
    await this.notifySubscribers(params.newspaperId, article);

    // Apply reputation effects
    await this.applyReputationEffects(article);

    return article as NewsArticle;
  }

  /**
   * Get next edition number for newspaper
   */
  private async getNextEditionNumber(newspaperId: string): Promise<number> {
    const latestArticle = await NewsArticleModel.findOne({ newspaperId })
      .sort({ editionNumber: -1 })
      .exec();

    return latestArticle ? latestArticle.editionNumber : 1;
  }

  /**
   * Publish new edition
   */
  async publishEdition(newspaperId: string): Promise<NewspaperEdition> {
    const newspaper = getNewspaperById(newspaperId);
    if (!newspaper) {
      throw new Error(`Unknown newspaper: ${newspaperId}`);
    }

    const editionNumber = await this.getNextEditionNumber(newspaperId);

    // Get articles for this edition (none yet, will be added throughout the week)
    const articles = await NewsArticleModel.find({
      newspaperId,
      editionNumber,
    })
      .sort({ featured: -1, publishDate: -1 })
      .exec();

    // Find featured article
    const featuredArticle =
      articles.find((a) => a.featured) || articles[0] || ({} as NewsArticle);

    const edition: NewspaperEdition = {
      newspaperId,
      editionNumber,
      publishDate: new Date(),
      articles: articles as NewsArticle[],
      featuredArticle,
      circulation: newspaper.circulation,
      price: newspaper.price,
    };

    // Notify all subscribers
    await this.deliverEditionToSubscribers(edition);

    return edition;
  }

  /**
   * Get current edition
   */
  async getCurrentEdition(newspaperId: string): Promise<NewspaperEdition | null> {
    const newspaper = getNewspaperById(newspaperId);
    if (!newspaper) {
      return null;
    }

    const latestArticle = await NewsArticleModel.findOne({ newspaperId })
      .sort({ editionNumber: -1 })
      .exec();

    if (!latestArticle) {
      return null;
    }

    const articles = await NewsArticleModel.find({
      newspaperId,
      editionNumber: latestArticle.editionNumber,
    })
      .sort({ featured: -1, publishDate: -1 })
      .exec();

    const featuredArticle = articles.find((a) => a.featured) || articles[0];

    return {
      newspaperId,
      editionNumber: latestArticle.editionNumber,
      publishDate: latestArticle.publishDate,
      articles: articles as NewsArticle[],
      featuredArticle: featuredArticle as NewsArticle,
      circulation: newspaper.circulation,
      price: newspaper.price,
    };
  }

  /**
   * Get edition by number or date
   */
  async getEdition(request: GetEditionRequest): Promise<NewspaperEdition | null> {
    const { newspaperId, editionNumber, date } = request;

    let query: any = { newspaperId };

    if (editionNumber) {
      query.editionNumber = editionNumber;
    } else if (date) {
      // Find edition published on or before this date
      const article = await NewsArticleModel.findOne({
        newspaperId,
        publishDate: { $lte: date },
      })
        .sort({ publishDate: -1 })
        .exec();

      if (!article) {
        return null;
      }

      query.editionNumber = article.editionNumber;
    } else {
      return this.getCurrentEdition(newspaperId);
    }

    const articles = await NewsArticleModel.find(query)
      .sort({ featured: -1, publishDate: -1 })
      .exec();

    if (articles.length === 0) {
      return null;
    }

    const newspaper = getNewspaperById(newspaperId);
    const featuredArticle = articles.find((a) => a.featured) || articles[0];

    return {
      newspaperId,
      editionNumber: articles[0].editionNumber,
      publishDate: articles[0].publishDate,
      articles: articles as NewsArticle[],
      featuredArticle: featuredArticle as NewsArticle,
      circulation: newspaper?.circulation || 0,
      price: newspaper?.price || 0,
    };
  }

  /**
   * Search articles
   */
  async searchArticles(request: SearchArticlesRequest): Promise<NewsArticle[]> {
    const {
      newspaperId,
      category,
      eventType,
      characterName,
      startDate,
      endDate,
      limit = 20,
      offset = 0,
    } = request;

    const query: any = {};

    if (newspaperId) {
      query.newspaperId = newspaperId;
    }

    if (category) {
      query.category = category;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (startDate || endDate) {
      query.publishDate = {};
      if (startDate) {
        query.publishDate.$gte = startDate;
      }
      if (endDate) {
        query.publishDate.$lte = endDate;
      }
    }

    if (characterName) {
      // Search in headline and content
      query.$or = [
        { headline: { $regex: characterName, $options: 'i' } },
        { content: { $regex: characterName, $options: 'i' } },
      ];
    }

    const articles = await NewsArticleModel.find(query)
      .sort({ publishDate: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return articles as NewsArticle[];
  }

  /**
   * Get article by ID
   */
  async getArticle(articleId: string): Promise<NewsArticle | null> {
    return (await NewsArticleModel.findById(articleId).exec()) as NewsArticle | null;
  }

  /**
   * Mark article as read by character
   */
  async markArticleAsRead(articleId: string, characterId: string): Promise<void> {
    const article = await NewsArticleModel.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    if (!article.readBy.includes(new ObjectId(characterId))) {
      article.readBy.push(new ObjectId(characterId));
      await article.save();
    }
  }

  /**
   * Subscribe to newspaper
   */
  async subscribe(
    characterId: string,
    newspaperId: string,
    subscriptionType: 'monthly' | 'archive',
    autoRenew: boolean = false
  ): Promise<NewsSubscription> {
    const newspaper = getNewspaperById(newspaperId);
    if (!newspaper) {
      throw new Error(`Unknown newspaper: ${newspaperId}`);
    }

    // Check existing subscription
    const existing = await NewsSubscriptionModel.findOne({
      characterId: new ObjectId(characterId),
      newspaperId,
    }).exec();

    if (existing && existing.paid) {
      throw new Error('Already subscribed to this newspaper');
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days

    const subscription = await NewsSubscriptionModel.create({
      characterId: new ObjectId(characterId),
      newspaperId,
      subscriptionType,
      startDate: new Date(),
      endDate: subscriptionType === 'archive' ? undefined : endDate,
      autoRenew,
      deliveryMethod: 'mail',
      paid: false, // Will be set to true after payment
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return subscription as NewsSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = await NewsSubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.autoRenew = false;
    await subscription.save();
  }

  /**
   * Get character subscriptions
   */
  async getCharacterSubscriptions(characterId: string): Promise<NewsSubscription[]> {
    return (await NewsSubscriptionModel.find({
      characterId: new ObjectId(characterId),
      paid: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    }).exec()) as NewsSubscription[];
  }

  /**
   * Buy single newspaper
   */
  async buySingleNewspaper(
    characterId: string,
    newspaperId: string
  ): Promise<NewsSubscription> {
    const newspaper = getNewspaperById(newspaperId);
    if (!newspaper) {
      throw new Error(`Unknown newspaper: ${newspaperId}`);
    }

    const subscription = await NewsSubscriptionModel.create({
      characterId: new ObjectId(characterId),
      newspaperId,
      subscriptionType: 'single',
      startDate: new Date(),
      deliveryMethod: 'instant',
      paid: false, // Will be set to true after payment
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return subscription as NewsSubscription;
  }

  /**
   * Notify subscribers of new article
   */
  private async notifySubscribers(newspaperId: string, article: NewsArticle): Promise<void> {
    const subscriptions = await NewsSubscriptionModel.find({
      newspaperId,
      paid: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    }).exec();

    const newspaper = getNewspaperById(newspaperId);

    // TODO: Implement notification and mail delivery
    // This will be integrated when mail and notification services are available
    console.log(
      `[Newspaper] Article published: ${article.headline} - ${subscriptions.length} subscribers`
    );
  }

  /**
   * Deliver edition to all subscribers
   */
  private async deliverEditionToSubscribers(edition: NewspaperEdition): Promise<void> {
    const subscriptions = await NewsSubscriptionModel.find({
      newspaperId: edition.newspaperId,
      paid: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    }).exec();

    const newspaper = getNewspaperById(edition.newspaperId);

    // TODO: Implement mail delivery
    // This will be integrated when mail service is available
    console.log(
      `[Newspaper] Edition #${edition.editionNumber} published to ${subscriptions.length} subscribers`
    );
  }

  /**
   * Format edition for mail delivery
   */
  private formatEditionForMail(edition: NewspaperEdition): string {
    const newspaper = getNewspaperById(edition.newspaperId);

    let content = `${newspaper?.name}\n`;
    content += `${newspaper?.motto}\n`;
    content += `Edition #${edition.editionNumber} - ${edition.publishDate.toDateString()}\n\n`;

    if (edition.featuredArticle) {
      content += `*** FEATURED ***\n`;
      content += `${edition.featuredArticle.headline}\n`;
      content += `${edition.featuredArticle.byline}\n\n`;
      content += `${edition.featuredArticle.content}\n\n`;
      content += `---\n\n`;
    }

    content += `OTHER STORIES:\n\n`;

    for (const article of edition.articles.slice(0, 5)) {
      if (article._id?.toString() === edition.featuredArticle?._id?.toString()) {
        continue;
      }

      content += `${article.headline}\n`;
      content += `${article.byline}\n`;
      content += `${article.content.substring(0, 150)}...\n\n`;
    }

    return content;
  }

  /**
   * Apply reputation effects from article
   */
  private async applyReputationEffects(article: NewsArticle): Promise<void> {
    // This would integrate with the reputation system
    // For now, we just store the effects in the article
    // The reputation system would process these periodically

    for (const characterId of article.involvedCharacters) {
      const effect = article.reputationEffects.get(characterId.toString());
      if (effect) {
        // TODO: Apply to character's reputation
        // await reputationService.modifyReputation(characterId, effect);
      }
    }

    if (article.bountyIncrease && article.involvedCharacters.length > 0) {
      // TODO: Increase bounty for involved characters
      // await bountyService.increaseBounty(article.involvedCharacters[0], article.bountyIncrease);
    }
  }

  /**
   * Get newspaper stats
   */
  async getNewspaperStats(newspaperId: string) {
    const totalArticles = await NewsArticleModel.countDocuments({ newspaperId });

    const latestArticle = await NewsArticleModel.findOne({ newspaperId })
      .sort({ editionNumber: -1 })
      .exec();

    const totalEditions = latestArticle?.editionNumber || 0;

    const totalSubscribers = await NewsSubscriptionModel.countDocuments({
      newspaperId,
      paid: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    const mostReadArticle = await NewsArticleModel.findOne({ newspaperId })
      .sort({ readBy: -1 })
      .exec();

    const articles = await NewsArticleModel.find({ newspaperId }).exec();
    const avgReactions =
      articles.length > 0
        ? articles.reduce((sum, a) => sum + a.reactionsCount, 0) / articles.length
        : 0;

    return {
      newspaperId,
      totalEditions,
      totalArticles,
      totalSubscribers,
      mostReadArticle: mostReadArticle?._id,
      averageReactionCount: Math.round(avgReactions * 10) / 10,
      revenue: totalSubscribers * (getNewspaperById(newspaperId)?.subscriptionPrice || 0),
    };
  }

  /**
   * Get all newspapers
   */
  getAllNewspapers() {
    return getAllNewspapers();
  }

  /**
   * Get articles mentioning character
   */
  async getArticlesMentioningCharacter(characterId: string): Promise<NewsArticle[]> {
    return (await NewsArticleModel.find({
      involvedCharacters: new ObjectId(characterId),
    })
      .sort({ publishDate: -1 })
      .limit(50)
      .exec()) as NewsArticle[];
  }

  /**
   * Get breaking news (recent featured articles)
   */
  async getBreakingNews(limit: number = 5): Promise<NewsArticle[]> {
    return (await NewsArticleModel.find({ featured: true })
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec()) as NewsArticle[];
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    return (await NewsArticleModel.find({ category })
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec()) as NewsArticle[];
  }
}

export const newspaperService = new NewspaperService();
