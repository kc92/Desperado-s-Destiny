/**
 * Legendary Quest Chains Index
 * All 6 legendary quest chains for end-game players
 */

import type { LegendaryQuestChain } from '@desperados/shared';
import { jesseJamesChain } from './jesseJames';
import { sacredArtifactsChain } from './sacredArtifacts';
import { ghostRidersChain } from './ghostRiders';
import { conquistadorChain } from './conquistador';
import { railroadChain } from './railroad';
import { gunslingerChain } from './gunslinger';

// All legendary quest chains
export const LEGENDARY_CHAINS: LegendaryQuestChain[] = [
  jesseJamesChain,
  sacredArtifactsChain,
  ghostRidersChain,
  conquistadorChain,
  railroadChain,
  gunslingerChain,
];

// Quick lookup by ID
export const LEGENDARY_CHAINS_BY_ID: Record<string, LegendaryQuestChain> = {
  [jesseJamesChain.id]: jesseJamesChain,
  [sacredArtifactsChain.id]: sacredArtifactsChain,
  [ghostRidersChain.id]: ghostRidersChain,
  [conquistadorChain.id]: conquistadorChain,
  [railroadChain.id]: railroadChain,
  [gunslingerChain.id]: gunslingerChain,
};

// Get chain by ID
export function getLegendaryChain(chainId: string): LegendaryQuestChain | undefined {
  return LEGENDARY_CHAINS_BY_ID[chainId];
}

// Get all chains for a level range
export function getChainsForLevel(level: number): LegendaryQuestChain[] {
  return LEGENDARY_CHAINS.filter(
    (chain) => level >= chain.levelRange[0] && level <= chain.levelRange[1]
  );
}

// Get chains by theme
export function getChainsByTheme(theme: string): LegendaryQuestChain[] {
  return LEGENDARY_CHAINS.filter((chain) => chain.theme === theme);
}

// Get chains by difficulty
export function getChainsByDifficulty(difficulty: string): LegendaryQuestChain[] {
  return LEGENDARY_CHAINS.filter((chain) => chain.difficulty === difficulty);
}

// Get quest from a chain
export function getQuestFromChain(
  chainId: string,
  questId: string
): LegendaryQuestChain['quests'][0] | undefined {
  const chain = getLegendaryChain(chainId);
  if (!chain) return undefined;
  return chain.quests.find((quest) => quest.id === questId);
}

// Get quest by number in chain
export function getQuestByNumber(
  chainId: string,
  questNumber: number
): LegendaryQuestChain['quests'][0] | undefined {
  const chain = getLegendaryChain(chainId);
  if (!chain) return undefined;
  return chain.quests.find((quest) => quest.questNumber === questNumber);
}

// Check if player meets prerequisites
export function meetsPrerequisites(
  chain: LegendaryQuestChain,
  playerData: {
    level: number;
    completedQuests: string[];
    factionRep: Record<string, number>;
    inventory: Record<string, number>;
  }
): { meets: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const prereq of chain.prerequisites) {
    switch (prereq.type) {
      case 'level':
        if (playerData.level < prereq.minLevel) {
          missing.push(`Level ${prereq.minLevel} required`);
        }
        break;
      case 'quest':
        if (!playerData.completedQuests.includes(prereq.questId) === prereq.completed) {
          missing.push(`Quest ${prereq.questId} must be ${prereq.completed ? 'completed' : 'not completed'}`);
        }
        break;
      case 'faction':
        const rep = playerData.factionRep[prereq.faction] || 0;
        if (rep < prereq.minReputation) {
          missing.push(
            `${prereq.faction} reputation ${prereq.minReputation} required (current: ${rep})`
          );
        }
        break;
      case 'item':
        const count = playerData.inventory[prereq.itemId] || 0;
        if (count < prereq.quantity) {
          missing.push(
            `${prereq.quantity}x ${prereq.itemId} required (have: ${count})`
          );
        }
        break;
    }
  }

  return {
    meets: missing.length === 0,
    missing,
  };
}

// Get total quest count across all chains
export function getTotalQuestCount(): number {
  return LEGENDARY_CHAINS.reduce((sum, chain) => sum + chain.totalQuests, 0);
}

// Get all unique items from all chains
export function getAllUniqueItems(): LegendaryQuestChain['uniqueItems'] {
  const items: LegendaryQuestChain['uniqueItems'] = [];
  for (const chain of LEGENDARY_CHAINS) {
    items.push(...chain.uniqueItems);
  }
  return items;
}

// Get all titles from all chains
export function getAllTitles(): string[] {
  return LEGENDARY_CHAINS.map((chain) => chain.titleUnlocked);
}

// Statistics
export const LEGENDARY_QUEST_STATS = {
  totalChains: LEGENDARY_CHAINS.length,
  totalQuests: getTotalQuestCount(),
  totalUniqueItems: getAllUniqueItems().length,
  totalTitles: getAllTitles().length,
  themes: [...new Set(LEGENDARY_CHAINS.map((c) => c.theme))],
  difficulties: [...new Set(LEGENDARY_CHAINS.map((c) => c.difficulty))],
  levelRange: {
    min: Math.min(...LEGENDARY_CHAINS.map((c) => c.levelRange[0])),
    max: Math.max(...LEGENDARY_CHAINS.map((c) => c.levelRange[1])),
  },
};

export default {
  LEGENDARY_CHAINS,
  LEGENDARY_CHAINS_BY_ID,
  getLegendaryChain,
  getChainsForLevel,
  getChainsByTheme,
  getChainsByDifficulty,
  getQuestFromChain,
  getQuestByNumber,
  meetsPrerequisites,
  getTotalQuestCount,
  getAllUniqueItems,
  getAllTitles,
  LEGENDARY_QUEST_STATS,
};
