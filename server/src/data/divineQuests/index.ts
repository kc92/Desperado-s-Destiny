/**
 * Divine Quests Index - Divine Struggle System
 *
 * Exports all divine path questline quests (angels & demons rebrand)
 * This is a facade/alias for cosmicQuests (cosmic horror -> divine struggle rebrand)
 */

import { CosmicQuest as DivineQuest } from '@desperados/shared';
import { ACT_1_QUESTS } from '../cosmicQuests/act1';
import { ACT_2_QUESTS } from '../cosmicQuests/act2';
import { ACT_3_QUESTS } from '../cosmicQuests/act3';
import { ACT_4_QUESTS, ENDING_EPILOGUES } from '../cosmicQuests/act4';

// Re-export with original names for backward compatibility
export {
  COSMIC_QUESTS,
  getCosmicQuest,
  getQuestsByAct,
  getNextQuest,
  ENDING_EPILOGUES,
  COSMIC_QUESTLINE_METADATA
} from '../cosmicQuests';

/**
 * All divine quests in order
 */
export const DIVINE_QUESTS: DivineQuest[] = [
  ...ACT_1_QUESTS,
  ...ACT_2_QUESTS,
  ...ACT_3_QUESTS,
  ...ACT_4_QUESTS
];

/**
 * Get divine quest by ID
 */
export function getDivineQuest(questId: string): DivineQuest | undefined {
  return DIVINE_QUESTS.find(q => q.id === questId);
}

/**
 * Get quests by divine act
 */
export function getQuestsByDivineAct(act: number): DivineQuest[] {
  return DIVINE_QUESTS.filter(q => q.act === act);
}

/**
 * Get next quest in the divine path chain
 */
export function getNextDivineQuest(currentQuestId: string): DivineQuest | undefined {
  return DIVINE_QUESTS.find(q => q.previousQuest === currentQuestId);
}

/**
 * Divine quest chain metadata
 */
export const DIVINE_QUESTLINE_METADATA = {
  name: 'The Divine Struggle',
  description: 'An epic divine storyline revealing the truth about The Rift and the eternal battle between angels and demons',
  minLevel: 25,
  maxLevel: 40,
  estimatedHours: 25,
  acts: 4,
  totalQuests: 20,
  endings: 4,
  tags: ['divine struggle', 'angels & demons', 'multiple endings', 'epic', 'narrative-driven']
};

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * Cosmic Quest               ->  Divine Quest / Divine Path
 * What-Waits-Below           ->  The Bound One / The Imprisoned
 * The Scar                   ->  The Rift
 * Corruption                 ->  Sin / Temptation
 * Sanity Loss                ->  Faith Wavering
 * Eldritch                   ->  Celestial / Divine
 * Void                       ->  Infernal Realm
 * Madness                    ->  Spiritual Torment
 */
