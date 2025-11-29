/**
 * Newspaper Event Hooks
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Helper functions to trigger newspaper articles from game events
 */

import { ObjectId } from 'mongodb';
import { ArticleGenerationParams } from '@desperados/shared';
import { newspaperPublisherJob } from '../jobs/newspaperPublisher.job';

export class NewspaperEventHooks {
  /**
   * Report bank robbery to newspapers
   */
  static async reportBankRobbery(params: {
    characterId: ObjectId;
    characterName: string;
    location: string;
    amount: number;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '', // Will be filled by publisher
      eventType: 'bank-robbery',
      category: 'crime',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      location: params.location,
      details: {
        amount: `$${params.amount.toLocaleString()}`,
        location: params.location,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report train heist to newspapers
   */
  static async reportTrainHeist(params: {
    characterId: ObjectId;
    characterName: string;
    trainName: string;
    amount: number;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'train-heist',
      category: 'crime',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      details: {
        trainName: params.trainName,
        amount: `$${params.amount.toLocaleString()}`,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report legendary animal kill to newspapers
   */
  static async reportLegendaryKill(params: {
    characterId: ObjectId;
    characterName: string;
    creatureName: string;
    location: string;
    reward?: number;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'legendary-kill',
      category: 'player-actions',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      location: params.location,
      details: {
        creature: params.creatureName,
        hunter: params.characterName,
        reward: params.reward ? `$${params.reward}` : undefined,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report duel outcome to newspapers
   */
  static async reportDuel(params: {
    winnerId: ObjectId;
    winnerName: string;
    loserId: ObjectId;
    loserName: string;
    location: string;
    fatal: boolean;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'duel',
      category: 'player-actions',
      involvedCharacters: [
        {
          id: params.winnerId,
          name: params.winnerName,
        },
        {
          id: params.loserId,
          name: params.loserName,
        },
      ],
      location: params.location,
      details: {
        winner: params.winnerName,
        loser: params.loserName,
        fatal: params.fatal,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report gang war to newspapers
   */
  static async reportGangWar(params: {
    gang1Name: string;
    gang2Name: string;
    location: string;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'gang-war',
      category: 'crime',
      involvedCharacters: [],
      location: params.location,
      details: {
        gang1: params.gang1Name,
        gang2: params.gang2Name,
        location: params.location,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report territory change to newspapers
   */
  static async reportTerritoryChange(params: {
    territory: string;
    newFaction: string;
    previousFaction: string;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'territory-change',
      category: 'politics',
      involvedCharacters: [],
      details: {
        territory: params.territory,
        faction: params.newFaction,
        previousFaction: params.previousFaction,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report arrest to newspapers
   */
  static async reportArrest(params: {
    characterId: ObjectId;
    characterName: string;
    crime: string;
    location: string;
    bounty?: number;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'arrest',
      category: 'crime',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      location: params.location,
      details: {
        criminal: params.characterName,
        crime: params.crime,
        bounty: params.bounty ? `$${params.bounty}` : undefined,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report jailbreak/escape to newspapers
   */
  static async reportEscape(params: {
    characterId: ObjectId;
    characterName: string;
    location: string;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'escape',
      category: 'crime',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      location: params.location,
      details: {
        criminal: params.characterName,
        location: params.location,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report bounty claimed to newspapers
   */
  static async reportBountyClaimed(params: {
    hunterId: ObjectId;
    hunterName: string;
    criminalId: ObjectId;
    criminalName: string;
    bounty: number;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'bounty-claimed',
      category: 'crime',
      involvedCharacters: [
        {
          id: params.hunterId,
          name: params.hunterName,
        },
        {
          id: params.criminalId,
          name: params.criminalName,
        },
      ],
      details: {
        hunter: params.hunterName,
        criminal: params.criminalName,
        bounty: `$${params.bounty.toLocaleString()}`,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report achievement unlock to newspapers
   */
  static async reportAchievement(params: {
    characterId: ObjectId;
    characterName: string;
    achievementName: string;
    description: string;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'achievement-unlock',
      category: 'player-actions',
      involvedCharacters: [
        {
          id: params.characterId,
          name: params.characterName,
        },
      ],
      details: {
        player: params.characterName,
        achievement: params.achievementName,
        description: params.description,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }

  /**
   * Report supernatural sighting to newspapers
   */
  static async reportSupernaturalSighting(params: {
    creatureName: string;
    location: string;
  }): Promise<void> {
    const eventParams: ArticleGenerationParams = {
      newspaperId: '',
      eventType: 'supernatural-sighting',
      category: 'weird-west',
      involvedCharacters: [],
      location: params.location,
      details: {
        creature: params.creatureName,
        location: params.location,
      },
      timestamp: new Date(),
    };

    await newspaperPublisherJob.handleWorldEvent(eventParams);
  }
}

export const newspaperEvents = NewspaperEventHooks;
