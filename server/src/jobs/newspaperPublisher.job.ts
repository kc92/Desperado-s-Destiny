/**
 * Newspaper Publisher Job
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Weekly publication job that publishes newspapers on their scheduled day
 */

import { newspaperService } from '../services/newspaper.service';
import { getAllNewspapers } from '../data/newspapers';
import { ArticleGenerationParams } from '@desperados/shared';
import { NewsSubscriptionModel } from '../models/NewsSubscription.model';

export class NewspaperPublisherJob {
  /**
   * Run the newspaper publisher
   * Should be called daily to check if any newspapers need publishing
   */
  async run(): Promise<void> {
    console.log('[NewspaperPublisher] Running newspaper publisher job');

    const today = this.getDayOfWeek();
    const newspapers = getAllNewspapers();

    for (const newspaper of newspapers) {
      if (newspaper.publishDay === today) {
        console.log(`[NewspaperPublisher] Publishing ${newspaper.name}`);

        try {
          // Generate any scheduled articles
          await this.generateScheduledArticles(newspaper.id);

          // Publish the edition
          const edition = await newspaperService.publishEdition(newspaper.id);

          console.log(
            `[NewspaperPublisher] Published ${newspaper.name} Edition #${edition.editionNumber} with ${edition.articles.length} articles`
          );
        } catch (error) {
          console.error(`[NewspaperPublisher] Error publishing ${newspaper.name}:`, error);
        }
      }
    }

    // Handle subscription renewals
    await this.handleSubscriptionRenewals();

    // Clean up expired subscriptions
    await this.cleanupExpiredSubscriptions();
  }

  /**
   * Get current day of week
   */
  private getDayOfWeek(): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  /**
   * Generate scheduled articles (flavor content, etc.)
   */
  private async generateScheduledArticles(newspaperId: string): Promise<void> {
    // Generate some flavor articles each week
    const flavorArticles = this.getFlavorArticles(newspaperId);

    for (const articleParams of flavorArticles) {
      try {
        await newspaperService.createArticle(articleParams);
      } catch (error) {
        console.error('[NewspaperPublisher] Error creating flavor article:', error);
      }
    }
  }

  /**
   * Get flavor articles for the week
   */
  private getFlavorArticles(newspaperId: string): ArticleGenerationParams[] {
    const now = new Date();

    // Different newspapers have different flavor content
    switch (newspaperId) {
      case 'red-gulch-gazette':
        return [
          {
            newspaperId,
            eventType: 'market-change',
            category: 'business',
            involvedCharacters: [],
            details: {
              commodity: 'Cattle',
              change: 'risen',
              price: '$45 per head',
              reason: 'increased demand from eastern markets',
            },
            timestamp: now,
          },
          {
            newspaperId,
            eventType: 'social-event',
            category: 'society',
            involvedCharacters: [],
            location: 'Red Gulch',
            details: {
              event: 'Mayor\'s Ball',
              occasion: 'the town\'s 10th anniversary',
            },
            timestamp: now,
          },
        ];

      case 'la-voz-frontera':
        return [
          {
            newspaperId,
            eventType: 'market-change',
            category: 'business',
            involvedCharacters: [],
            details: {
              commodity: 'Tequila',
              change: 'increased',
              price: '$3 per bottle',
              reason: 'new distillery operations',
            },
            timestamp: now,
          },
        ];

      case 'fort-ashford-dispatch':
        return [
          {
            newspaperId,
            eventType: 'law-change',
            category: 'politics',
            involvedCharacters: [],
            location: 'Fort Ashford',
            details: {
              law: 'Curfew Regulations',
            },
            timestamp: now,
          },
        ];

      case 'frontier-oracle':
        return [
          {
            newspaperId,
            eventType: 'supernatural-sighting',
            category: 'weird-west',
            involvedCharacters: [],
            location: 'Dead Man\'s Canyon',
            details: {
              creature: 'a ghostly stagecoach',
            },
            timestamp: now,
          },
          {
            newspaperId,
            eventType: 'mysterious-event',
            category: 'weird-west',
            involvedCharacters: [],
            location: 'the badlands',
            details: {
              event: 'Strange lights in the sky',
            },
            timestamp: now,
          },
        ];

      default:
        return [];
    }
  }

  /**
   * Handle subscription renewals
   */
  private async handleSubscriptionRenewals(): Promise<void> {
    const subscriptionsNeedingRenewal = await NewsSubscriptionModel.find({
      subscriptionType: 'monthly',
      paid: true,
      autoRenew: true,
      endDate: {
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        $gte: new Date(),
      },
    }).exec();

    for (const subscription of subscriptionsNeedingRenewal) {
      try {
        // TODO: Charge the character's account
        // For now, we'll just extend the subscription

        const newEndDate = new Date(subscription.endDate!);
        newEndDate.setDate(newEndDate.getDate() + 30);

        subscription.endDate = newEndDate;
        await subscription.save();

        console.log(
          `[NewspaperPublisher] Renewed subscription ${subscription._id} for character ${subscription.characterId}`
        );
      } catch (error) {
        console.error('[NewspaperPublisher] Error renewing subscription:', error);
      }
    }
  }

  /**
   * Clean up expired subscriptions
   */
  private async cleanupExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await NewsSubscriptionModel.find({
      paid: true,
      autoRenew: false,
      endDate: {
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    }).exec();

    for (const subscription of expiredSubscriptions) {
      subscription.paid = false;
      await subscription.save();
    }

    if (expiredSubscriptions.length > 0) {
      console.log(
        `[NewspaperPublisher] Cleaned up ${expiredSubscriptions.length} expired subscriptions`
      );
    }
  }

  /**
   * Generate article from world event
   * This is called by other services when significant events occur
   */
  async handleWorldEvent(params: ArticleGenerationParams): Promise<void> {
    // Determine which newspapers should cover this event
    const newspapers = this.getRelevantNewspapers(params);

    for (const newspaperId of newspapers) {
      try {
        // Create version of article for this newspaper
        const articleParams: ArticleGenerationParams = {
          ...params,
          newspaperId,
        };

        await newspaperService.createArticle(articleParams);

        console.log(
          `[NewspaperPublisher] Created article for ${newspaperId}: ${params.eventType}`
        );
      } catch (error) {
        console.error(`[NewspaperPublisher] Error creating article for ${newspaperId}:`, error);
      }
    }
  }

  /**
   * Determine which newspapers should cover an event
   */
  private getRelevantNewspapers(params: ArticleGenerationParams): string[] {
    const newspapers: string[] = [];

    // Frontier Oracle covers everything
    newspapers.push('frontier-oracle');

    // Location-based coverage
    if (params.location) {
      const location = params.location.toLowerCase();

      if (
        location.includes('red gulch') ||
        location.includes('longhorn') ||
        location.includes('whiskey bend')
      ) {
        newspapers.push('red-gulch-gazette');
      }

      if (location.includes('frontera') || location.includes('border')) {
        newspapers.push('la-voz-frontera');
      }

      if (location.includes('fort ashford') || location.includes('military')) {
        newspapers.push('fort-ashford-dispatch');
      }
    }

    // Event type coverage
    switch (params.eventType) {
      case 'bank-robbery':
      case 'train-heist':
      case 'murder':
        newspapers.push('red-gulch-gazette'); // Crime coverage
        newspapers.push('la-voz-frontera'); // Also covers crime
        break;

      case 'supernatural-sighting':
      case 'mysterious-event':
        // Only Oracle covers supernatural by default
        break;

      case 'territory-change':
      case 'faction-war':
      case 'law-change':
        // All newspapers cover major political events
        newspapers.push('red-gulch-gazette');
        newspapers.push('la-voz-frontera');
        newspapers.push('fort-ashford-dispatch');
        break;

      case 'arrest':
        newspapers.push('red-gulch-gazette');
        newspapers.push('fort-ashford-dispatch');
        break;

      case 'gang-activity':
      case 'gang-war':
        newspapers.push('la-voz-frontera');
        break;

      case 'legendary-kill':
      case 'achievement-unlock':
        // All newspapers cover legendary achievements
        newspapers.push('red-gulch-gazette');
        newspapers.push('la-voz-frontera');
        break;
    }

    // Remove duplicates
    const uniqueNewspapers: string[] = [];
    for (const paper of newspapers) {
      if (!uniqueNewspapers.includes(paper)) {
        uniqueNewspapers.push(paper);
      }
    }
    return uniqueNewspapers;
  }

  /**
   * Feature an article (make it front page news)
   */
  async featureArticle(articleId: string): Promise<void> {
    const article = await newspaperService.getArticle(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Unfeature other articles in the same edition
    await import('../models/NewsArticle.model').then(({ NewsArticleModel }) =>
      NewsArticleModel.updateMany(
        {
          newspaperId: article.newspaperId,
          editionNumber: article.editionNumber,
          featured: true,
        },
        { featured: false }
      )
    );

    // Feature this article
    await import('../models/NewsArticle.model').then(({ NewsArticleModel }) =>
      NewsArticleModel.findByIdAndUpdate(articleId, { featured: true })
    );
  }
}

export const newspaperPublisherJob = new NewspaperPublisherJob();

/**
 * Schedule the newspaper publisher to run daily
 */
export function scheduleNewspaperPublisher(): void {
  // Run every day at 6:00 AM
  const scheduleTime = new Date();
  scheduleTime.setHours(6, 0, 0, 0);

  const now = new Date();
  let delay = scheduleTime.getTime() - now.getTime();

  // If we've passed today's scheduled time, schedule for tomorrow
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000;
  }

  setTimeout(() => {
    newspaperPublisherJob.run();

    // Schedule to run every 24 hours
    setInterval(() => {
      newspaperPublisherJob.run();
    }, 24 * 60 * 60 * 1000);
  }, delay);

  console.log(
    `[NewspaperPublisher] Scheduled to run daily at 6:00 AM (next run in ${Math.round(delay / 1000 / 60)} minutes)`
  );
}
