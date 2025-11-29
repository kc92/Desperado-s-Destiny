/**
 * NewsArticle Model
 * Phase 12, Wave 12.1 - Desperados Destiny
 */

import { Schema, model } from 'mongoose';
import { NewsArticle } from '@desperados/shared';

const newsArticleSchema = new Schema<NewsArticle>(
  {
    newspaperId: {
      type: String,
      required: true,
      index: true,
    },
    headline: {
      type: String,
      required: true,
      maxlength: 200,
    },
    subheadline: {
      type: String,
      maxlength: 300,
    },
    byline: {
      type: String,
      required: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'crime',
        'politics',
        'business',
        'society',
        'weird-west',
        'player-actions',
        'breaking-news',
      ],
      index: true,
    },
    publishDate: {
      type: Date,
      required: true,
      index: true,
    },
    editionNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // Source
    eventType: {
      type: String,
      required: true,
      enum: [
        'bank-robbery',
        'train-heist',
        'murder',
        'arrest',
        'territory-change',
        'faction-war',
        'election',
        'law-change',
        'market-change',
        'business-opening',
        'property-sale',
        'social-event',
        'supernatural-sighting',
        'mysterious-event',
        'legendary-kill',
        'gang-activity',
        'achievement-unlock',
        'duel',
        'gang-war',
        'bounty-claimed',
        'escape',
      ],
      index: true,
    },
    sourceEventId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    involvedCharacters: {
      type: [Schema.Types.ObjectId],
      default: [],
      index: true,
    },
    involvedFactions: {
      type: [String],
      default: [],
      enum: ['settlers', 'frontera', 'nahi', 'military', ''],
    },
    location: {
      type: String,
      maxlength: 100,
    },

    // Impact
    reputationEffects: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    bountyIncrease: {
      type: Number,
      min: 0,
    },
    infamyGain: {
      type: Number,
    },

    // Tracking
    readBy: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    reactionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    imageUrl: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
newsArticleSchema.index({ newspaperId: 1, publishDate: -1 });
newsArticleSchema.index({ newspaperId: 1, editionNumber: 1 });
newsArticleSchema.index({ category: 1, publishDate: -1 });
newsArticleSchema.index({ involvedCharacters: 1, publishDate: -1 });
newsArticleSchema.index({ featured: 1, publishDate: -1 });

// Text index for search
newsArticleSchema.index({
  headline: 'text',
  subheadline: 'text',
  content: 'text',
});

// Virtual for excerpt
newsArticleSchema.virtual('excerpt').get(function () {
  if (this.content.length <= 200) {
    return this.content;
  }
  return this.content.substring(0, 200) + '...';
});

// Method to check if character has read article
newsArticleSchema.methods.isReadBy = function (characterId: string): boolean {
  return this.readBy.some((id) => id.toString() === characterId.toString());
};

// Method to mark as read
newsArticleSchema.methods.markAsRead = async function (characterId: string): Promise<void> {
  if (!this.isReadBy(characterId)) {
    this.readBy.push(characterId as any);
    await this.save();
  }
};

// Static method to get recent articles
newsArticleSchema.statics.getRecent = function (
  newspaperId: string,
  limit: number = 10
) {
  return this.find({ newspaperId })
    .sort({ publishDate: -1 })
    .limit(limit)
    .exec();
};

// Static method to get articles by edition
newsArticleSchema.statics.getByEdition = function (
  newspaperId: string,
  editionNumber: number
) {
  return this.find({ newspaperId, editionNumber })
    .sort({ featured: -1, publishDate: -1 })
    .exec();
};

// Static method to search articles
newsArticleSchema.statics.search = function (
  query: string,
  options: {
    newspaperId?: string;
    category?: string;
    limit?: number;
  } = {}
) {
  const filter: any = {
    $text: { $search: query },
  };

  if (options.newspaperId) {
    filter.newspaperId = options.newspaperId;
  }

  if (options.category) {
    filter.category = options.category;
  }

  return this.find(filter)
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .exec();
};

export const NewsArticleModel = model<NewsArticle>('NewsArticle', newsArticleSchema);
