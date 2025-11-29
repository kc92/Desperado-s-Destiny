/**
 * Cosmic Quests Index
 *
 * Exports all cosmic horror questline quests
 */

import { CosmicQuest } from '@desperados/shared';
import { ACT_1_QUESTS } from './act1';
import { ACT_2_QUESTS } from './act2';
import { ACT_3_QUESTS } from './act3';
import { ACT_4_QUESTS, ENDING_EPILOGUES } from './act4';

/**
 * All cosmic quests in order
 */
export const COSMIC_QUESTS: CosmicQuest[] = [
  ...ACT_1_QUESTS,
  ...ACT_2_QUESTS,
  ...ACT_3_QUESTS,
  ...ACT_4_QUESTS
];

/**
 * Get cosmic quest by ID
 */
export function getCosmicQuest(questId: string): CosmicQuest | undefined {
  return COSMIC_QUESTS.find(q => q.id === questId);
}

/**
 * Get quests by act
 */
export function getQuestsByAct(act: number): CosmicQuest[] {
  return COSMIC_QUESTS.filter(q => q.act === act);
}

/**
 * Get next quest in the chain
 */
export function getNextQuest(currentQuestId: string): CosmicQuest | undefined {
  return COSMIC_QUESTS.find(q => q.previousQuest === currentQuestId);
}

/**
 * Export ending epilogues
 */
export { ENDING_EPILOGUES };

/**
 * Quest chain metadata
 */
export const COSMIC_QUESTLINE_METADATA = {
  name: 'What-Waits-Below',
  description: 'An epic cosmic horror storyline revealing the truth about The Scar',
  minLevel: 25,
  maxLevel: 40,
  estimatedHours: 25,
  acts: 4,
  totalQuests: 20,
  endings: 4,
  tags: ['cosmic horror', 'lovecraftian', 'multiple endings', 'epic', 'narrative-driven']
};
