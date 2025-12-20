/**
 * Mysterious Figure Service
 *
 * Phase 4, Wave 4.2 - Mysterious Figure NPCs
 *
 * Handles spawning, interactions, and quest management for
 * the 10 mysterious figures who add weird west elements.
 */

import { Character } from '../models/Character.model';
import { QuestDefinition, CharacterQuest } from '../models/Quest.model';
import {
  MysteriousFigure,
  MYSTERIOUS_FIGURES,
  getMysteriousFigure,
  getMysteriousFiguresByLocation,
  SpawnConditions
} from '../data/mysteriousFigures';
import { AppError } from '../utils/errors';
import { SecureRNG } from './base/SecureRNG';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';

/**
 * Time of day enum
 */
export enum TimeOfDay {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night'
}

/**
 * Weather conditions enum
 */
export enum WeatherCondition {
  CLEAR = 'Clear',
  CLOUDY = 'Cloudy',
  STORMY = 'Stormy',
  FOGGY = 'Foggy',
  DUST_STORM = 'Dust Storm'
}

/**
 * Spawn result
 */
interface SpawnResult {
  figure: MysteriousFigure;
  message: string;
  dialogue: string;
}

/**
 * Mysterious Figure interaction result
 */
interface InteractionResult {
  dialogue: string[];
  availableQuests: string[];
  hints: string[];
  tradeAvailable: boolean;
}

export class MysteriousFigureService {
  /**
   * Check if a mysterious figure should spawn
   */
  static async checkSpawn(
    characterId: string,
    locationId: string,
    timeOfDay: TimeOfDay,
    weather?: WeatherCondition
  ): Promise<SpawnResult | null> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get figures that can spawn at this location
    const potentialFigures = getMysteriousFiguresByLocation(locationId);

    // Check each figure's spawn conditions
    for (const figure of potentialFigures) {
      if (await this.canSpawn(character, figure, locationId, timeOfDay, weather)) {
        // Random chance check
        if (SecureRNG.chance(figure.spawnConditions.randomChance)) {
          return {
            figure,
            message: this.getSpawnMessage(figure),
            dialogue: this.getRandomGreeting(figure)
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if a specific figure can spawn
   */
  private static async canSpawn(
    character: any,
    figure: MysteriousFigure,
    locationId: string,
    timeOfDay: TimeOfDay,
    weather?: WeatherCondition
  ): Promise<boolean> {
    const conditions = figure.spawnConditions;

    // Check location
    if (!conditions.locations.includes('any') && !conditions.locations.includes(locationId)) {
      return false;
    }

    // Check time of day
    if (conditions.timeOfDay && !conditions.timeOfDay.includes(timeOfDay)) {
      return false;
    }

    // Check weather
    if (conditions.weatherConditions && weather) {
      if (!conditions.weatherConditions.includes(weather)) {
        return false;
      }
    }

    // Check level requirements
    if (conditions.minLevel && character.level < conditions.minLevel) {
      return false;
    }

    if (conditions.maxLevel && character.level > conditions.maxLevel) {
      return false;
    }

    // Check discovery requirement
    if (conditions.requiresDiscovery) {
      const discovered = (character as any).discoveredNPCs?.includes(figure.id);
      if (!discovered) {
        return false;
      }
    }

    // Check player conditions (if applicable)
    if (conditions.playerConditions) {
      if (!this.checkPlayerConditions(character, conditions.playerConditions)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check player-specific spawn conditions
   */
  private static checkPlayerConditions(character: any, conditions: string[]): boolean {
    for (const condition of conditions) {
      switch (condition) {
        case 'high_bounty':
          if (character.bounty < 1000) return false;
          break;
        case 'low_health':
          if (character.currentHP > character.maxHP * 0.3) return false;
          break;
        case 'near_death':
          if (character.currentHP > character.maxHP * 0.1) return false;
          break;
        case 'critical_moment':
          // Could be triggered by specific events
          // For now, always true if other conditions met
          break;
        case 'worthy_deed':
          // Check recent positive actions
          break;
        case 'arrogant_action':
          // Check recent arrogant choices
          break;
        case 'has_rare_item':
          // Check inventory for rare items
          const hasRareItem = character.inventory?.some((item: any) =>
            item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary'
          );
          if (!hasRareItem) return false;
          break;
        case 'demon_encounter':
          // Check if character has encountered demons
          break;
        case 'cursed':
          // Check if character has active curses
          break;
      }
    }
    return true;
  }

  /**
   * Get spawn message
   */
  private static getSpawnMessage(figure: MysteriousFigure): string {
    const messages: { [key: string]: string } = {
      mysterious_stranger: 'A tall figure emerges from the shadows. You feel watched.',
      old_coyote: 'A coyote yips in the distance. Or was it laughter?',
      mourning_widow: 'The temperature drops. You see your breath. A woman in black appears.',
      doc_prometheus: 'An explosion echoes nearby, followed by excited muttering.',
      the_prophet: 'Wild-eyed ravings echo through the canyon. Someone is warning of doom.',
      mama_laveau: 'The air shimmers with spiritual energy. Someone powerful is near.',
      the_collector: 'A well-dressed gentleman tips his hat. His eyes appraise you carefully.',
      burned_man: 'The smell of smoke and char. Burning eyes watch from darkness.',
      sister_agnes: 'Latin prayers echo in the wind. A nun approaches, crucifix gleaming.',
      the_cartographer: 'Someone is frantically sketching maps in the dirt, muttering about dimensions.'
    };

    return messages[figure.id] || 'A mysterious figure appears.';
  }

  /**
   * Get random greeting from figure
   */
  private static getRandomGreeting(figure: MysteriousFigure): string {
    const greetings = figure.dialogue.greeting;
    return SecureRNG.select(greetings);
  }

  /**
   * Interact with a mysterious figure
   */
  static async interact(
    characterId: string,
    figureId: string,
    action: 'talk' | 'trade' | 'quest' | 'information'
  ): Promise<InteractionResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    switch (action) {
      case 'talk':
        return this.getTalkDialogue(figure);
      case 'trade':
        return this.getTradeOptions(figure);
      case 'quest':
        return this.getQuestOptions(character, figure);
      case 'information':
        return this.getInformation(figure);
      default:
        throw new AppError('Invalid interaction action', 400);
    }
  }

  /**
   * Get talk dialogue
   */
  private static async getTalkDialogue(figure: MysteriousFigure): Promise<InteractionResult> {
    const hints = figure.dialogue.crypticHints.slice(0, 3); // Return 3 random hints
    const dialogue = [
      this.getRandomGreeting(figure),
      ...SecureRNG.shuffle(hints).slice(0, 2)
    ];

    return {
      dialogue,
      availableQuests: figure.quests.map(q => q.id),
      hints: figure.warnings || [],
      tradeAvailable: !!figure.tradeItems
    };
  }

  /**
   * Get trade options
   */
  private static async getTradeOptions(figure: MysteriousFigure): Promise<InteractionResult> {
    if (!figure.tradeItems) {
      return {
        dialogue: ['I have nothing to trade.'],
        availableQuests: [],
        hints: [],
        tradeAvailable: false
      };
    }

    const tradeDialogue = figure.dialogue.greeting[0];
    const itemDescriptions = figure.tradeItems.map(item =>
      `${item.name} - ${item.description} ${item.price ? `(${item.price} gold)` : '(Barter)'}`
    );

    return {
      dialogue: [tradeDialogue, ...itemDescriptions],
      availableQuests: [],
      hints: [],
      tradeAvailable: true
    };
  }

  /**
   * Get quest options
   */
  private static async getQuestOptions(
    character: any,
    figure: MysteriousFigure
  ): Promise<InteractionResult> {
    // Check which quests the character hasn't completed
    const availableQuests = [];

    for (const quest of figure.quests) {
      const existing = await CharacterQuest.findOne({
        characterId: character._id,
        questId: quest.id
      });

      if (!existing) {
        availableQuests.push(quest.id);
      }
    }

    const questDialogue = availableQuests.map(questId => {
      const quest = figure.quests.find(q => q.id === questId);
      if (quest && figure.dialogue.questDialogue[questId]) {
        return figure.dialogue.questDialogue[questId][0];
      }
      return 'I have a task for you...';
    });

    return {
      dialogue: [this.getRandomGreeting(figure), ...questDialogue],
      availableQuests,
      hints: [],
      tradeAvailable: false
    };
  }

  /**
   * Get information from figure
   */
  private static async getInformation(figure: MysteriousFigure): Promise<InteractionResult> {
    const infoTopics = Object.keys(figure.dialogue.information);
    const randomTopic = SecureRNG.select(infoTopics);
    const info = figure.dialogue.information[randomTopic];

    const randomInfo = SecureRNG.select(info);

    return {
      dialogue: [randomInfo],
      availableQuests: [],
      hints: figure.warnings || [],
      tradeAvailable: false
    };
  }

  /**
   * Start a mysterious figure quest
   */
  static async startQuest(
    characterId: string,
    figureId: string,
    questId: string
  ): Promise<{ success: boolean; message: string; quest?: any }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    const quest = figure.quests.find(q => q.id === questId);
    if (!quest) {
      throw new AppError('Quest not found', 404);
    }

    // Check if quest is already active or completed
    const existing = await CharacterQuest.findOne({
      characterId,
      questId
    });

    if (existing) {
      return {
        success: false,
        message: 'Quest already started or completed'
      };
    }

    // Create quest definition if it doesn't exist
    let questDef = await QuestDefinition.findOne({ questId });

    if (!questDef) {
      questDef = await QuestDefinition.create({
        questId: quest.id,
        name: quest.name,
        description: quest.description,
        type: 'side',
        levelRequired: figure.spawnConditions.minLevel || 1,
        prerequisites: [],
        objectives: quest.objectives,
        rewards: quest.rewards,
        repeatable: false,
        isActive: true
      });
    }

    // Accept the quest using the quest service
    const { QuestService } = await import('./quest.service');
    const characterQuest = await QuestService.acceptQuest(characterId, questId);

    return {
      success: true,
      message: 'Quest accepted',
      quest: characterQuest
    };
  }

  /**
   * Get all cryptic hints from a figure
   */
  static getCrypticHints(figureId: string): string[] {
    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    return figure.dialogue.crypticHints;
  }

  /**
   * Get lore from a figure on specific topic
   */
  static getLore(figureId: string, topic: string): string[] {
    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    return figure.dialogue.information[topic] || [];
  }

  /**
   * Discover a mysterious figure (for those requiring discovery)
   */
  static async discoverFigure(
    characterId: string,
    figureId: string
  ): Promise<{ discovered: boolean; message: string }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    // Initialize discoveredNPCs array if it doesn't exist
    if (!(character as any).discoveredNPCs) {
      (character as any).discoveredNPCs = [];
    }

    // Check if already discovered
    if ((character as any).discoveredNPCs.includes(figureId)) {
      return {
        discovered: false,
        message: `You've already met ${figure.name}`
      };
    }

    // Add to discovered NPCs
    (character as any).discoveredNPCs.push(figureId);
    await character.save();

    return {
      discovered: true,
      message: `You've discovered ${figure.name}! ${(figure as any).description || ''}`
    };
  }

  /**
   * Check if character has discovered a figure
   */
  static async hasDiscovered(characterId: string, figureId: string): Promise<boolean> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    return (character as any).discoveredNPCs?.includes(figureId) || false;
  }

  /**
   * Get all mysterious figures connected to The Scar
   */
  static getScarFigures(): MysteriousFigure[] {
    return MYSTERIOUS_FIGURES.filter(f => f.scarConnection);
  }

  /**
   * Get warnings about The Scar from all figures
   */
  static getScarWarnings(): { figure: string; warnings: string[] }[] {
    const scarFigures = this.getScarFigures();
    return scarFigures.map(figure => ({
      figure: figure.name,
      warnings: figure.warnings || []
    }));
  }

  /**
   * Get current time of day based on game time
   */
  static getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 8) return TimeOfDay.DAWN;
    if (hour >= 8 && hour < 17) return TimeOfDay.DAY;
    if (hour >= 17 && hour < 20) return TimeOfDay.DUSK;
    return TimeOfDay.NIGHT;
  }

  /**
   * Trigger special figure appearance based on event
   */
  static async triggerSpecialAppearance(
    characterId: string,
    eventType: 'near_death' | 'moral_choice' | 'artifact_found' | 'demon_encounter'
  ): Promise<SpawnResult | null> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Map event types to likely figures
    const eventFigures: { [key: string]: string[] } = {
      near_death: ['mysterious_stranger', 'mourning_widow'],
      moral_choice: ['mysterious_stranger', 'old_coyote'],
      artifact_found: ['the_collector'],
      demon_encounter: ['sister_agnes', 'mama_laveau']
    };

    const potentialFigureIds = eventFigures[eventType] || [];

    for (const figureId of potentialFigureIds) {
      const figure = getMysteriousFigure(figureId);
      if (figure && SecureRNG.chance(0.5)) { // 50% chance for event-triggered spawn
        return {
          figure,
          message: this.getSpawnMessage(figure),
          dialogue: this.getRandomGreeting(figure)
        };
      }
    }

    return null;
  }

  /**
   * Get figure by supernatural level
   */
  static getFiguresBySupernaturalLevel(level: 'mundane' | 'touched' | 'supernatural' | 'cosmic'): MysteriousFigure[] {
    return MYSTERIOUS_FIGURES.filter(f => f.supernaturalLevel === level);
  }

  /**
   * Get all knowledge areas a figure knows about
   */
  static getKnowledgeAreas(figureId: string): string[] {
    const figure = getMysteriousFigure(figureId);
    if (!figure) {
      throw new AppError('Mysterious figure not found', 404);
    }

    return figure.knowledgeAreas;
  }

  /**
   * Trade with a figure
   */
  static async trade(
    characterId: string,
    figureId: string,
    itemId: string
  ): Promise<{ success: boolean; message: string; item?: any }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const figure = getMysteriousFigure(figureId);
    if (!figure || !figure.tradeItems) {
      throw new AppError('Figure does not trade', 404);
    }

    const item = figure.tradeItems.find(i => i.itemId === itemId);
    if (!item) {
      throw new AppError('Item not available for trade', 404);
    }

    // Check if player can afford or has barter item
    if (item.price) {
      if (character.dollars < item.price) {
        return {
          success: false,
          message: 'Not enough dollars'
        };
      }
      await DollarService.deductDollars(
        character._id.toString(),
        item.price,
        TransactionSource.SHOP_PURCHASE,
        { figureId, itemId, itemName: item.name }
      );
    } else if (item.barterItem) {
      const hasBarterItem = character.inventory.find(inv => inv.itemId === item.barterItem);
      if (!hasBarterItem) {
        return {
          success: false,
          message: `You need ${item.barterItem} to trade for this`
        };
      }
      // Remove barter item
      const index = character.inventory.findIndex(inv => inv.itemId === item.barterItem);
      if (hasBarterItem.quantity > 1) {
        hasBarterItem.quantity -= 1;
      } else {
        character.inventory.splice(index, 1);
      }
    }

    // Refetch character to get latest state after DollarService update
    const updatedCharacter = await Character.findById(characterId);
    if (!updatedCharacter) {
      throw new AppError('Character not found after dollar deduction', 500);
    }

    // Add item to inventory
    const existingItem = updatedCharacter.inventory.find(inv => inv.itemId === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCharacter.inventory.push({
        itemId,
        quantity: 1,
        acquiredAt: new Date()
      });
    }

    await updatedCharacter.save();

    return {
      success: true,
      message: `Acquired ${item.name}`,
      item
    };
  }
}
