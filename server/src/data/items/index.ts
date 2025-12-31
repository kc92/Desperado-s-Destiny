/**
 * Items Database Index
 * Exports all items for the game
 */

import { IItem } from '../../models/Item.model';
import logger from '../../utils/logger';
import { weapons } from './weapons';
import { armor } from './armor';
import { consumables } from './consumables';
import { materials } from './materials';
import { diasporaWeapons } from './diaspora_weapons';
import { diasporaArmor } from './diaspora_armor';
import { diasporaConsumables } from './diaspora_consumables';
import { frontierGear, ALL_FRONTIER_JUSTICE_ITEMS } from './frontier_gear';
import { huntingGear } from './hunting_gear';
import { fishingGear } from './fishing_gear';
import { craftingGear } from './crafting_gear';
import { nativeGear } from './native_gear';
import { contestedLandsGear } from './contested_lands_gear';
import { defenderGear } from './defender_gear';
import { supportGear } from './support_gear';
import { debufferGear } from './debuffer_gear';
import { gamblingGear } from './gambling_gear';
import { horseRacingGear } from './horse_racing_gear';
import { gatheringMaterials } from './gathering_materials';
import { refinedMaterials } from './refined_materials';
import { components } from './components';
import { craftingTools } from './crafting_tools';
import { tieredGear } from './tiered_gear';
import { milestoneItems } from './milestone_items';
import { goldSinkItems } from './gold_sink_items';
import { greenhornGear } from './greenhorn_gear';
import { heartOfTerritoryGear } from './heart_of_territory_gear';
import { legendsGear } from './legends_gear';
import { actionRewardItems } from './action_rewards';

/**
 * All items in the game
 * Total: 90+ items across 4 categories
 */
export const allItems: Partial<IItem>[] = [
  ...weapons,     // 24 weapons (revolvers, rifles, shotguns, melee)
  ...armor,       // 30 armor pieces (hats, body, boots)
  ...consumables, // 19 consumables (healing, energy, food, buffs)
  ...materials,    // 24 materials (hides, ores, herbs, crafting)
  ...diasporaWeapons,
  ...diasporaArmor,
  ...diasporaConsumables,
  ...frontierGear,
  ...huntingGear,
  ...fishingGear,
  ...craftingGear,
  ...nativeGear,
  ...contestedLandsGear,
  ...defenderGear,
  ...supportGear,
  ...debufferGear,
  ...gamblingGear,
  ...horseRacingGear,
  ...gatheringMaterials,
  ...refinedMaterials,
  ...components,
  ...craftingTools,
  ...tieredGear,
  ...milestoneItems,  // Sprint 7: Level milestone reward items
  ...goldSinkItems,   // Sprint 7: Early/mid-game gold sink items
  ...greenhornGear,   // Phase 19.2: Greenhorn's Trail items (L1-15)
  ...ALL_FRONTIER_JUSTICE_ITEMS,  // Phase 19.3: Frontier Justice items (L16-25)
  ...heartOfTerritoryGear,  // Phase 19.4: Heart of the Territory items (L26-35)
  ...legendsGear,     // Phase 19.5: Legends of the West items (L36-45)
  ...actionRewardItems,  // Action reward items (crime loot, combat drops, boss drops)
];

/**
 * Get items by type
 */
export function getItemsByType(type: string): Partial<IItem>[] {
  return allItems.filter(item => item.type === type);
}

/**
 * Get items by rarity
 */
export function getItemsByRarity(rarity: string): Partial<IItem>[] {
  return allItems.filter(item => item.rarity === rarity);
}

/**
 * Get shop items
 */
export function getShopItems(): Partial<IItem>[] {
  return allItems.filter(item => item.inShop === true);
}

/**
 * Get item by ID
 */
export function getItemById(itemId: string): Partial<IItem> | undefined {
  return allItems.find(item => item.itemId === itemId);
}

// Export individual categories
export { weapons, armor, consumables, materials, diasporaWeapons, diasporaArmor, diasporaConsumables, frontierGear, ALL_FRONTIER_JUSTICE_ITEMS, huntingGear, fishingGear, craftingGear, nativeGear, contestedLandsGear, defenderGear, supportGear, debufferGear, gamblingGear, horseRacingGear, gatheringMaterials, refinedMaterials, components, craftingTools, tieredGear, milestoneItems, goldSinkItems, greenhornGear, heartOfTerritoryGear, legendsGear, actionRewardItems };

// Export count for validation
export const itemCounts = {
  weapons: weapons.length + diasporaWeapons.length + huntingGear.filter(i => i.type === 'weapon').length + fishingGear.filter(i => i.type === 'weapon').length + nativeGear.filter(i => i.type === 'weapon').length + contestedLandsGear.filter(i => i.type === 'weapon').length + defenderGear.filter(i => i.type === 'weapon').length + craftingTools.length + tieredGear.filter(i => i.type === 'weapon').length,
  armor: armor.length + diasporaArmor.length + frontierGear.filter(i => i.type === 'armor').length + huntingGear.filter(i => i.type === 'armor').length + fishingGear.filter(i => i.type === 'armor').length + craftingGear.filter(i => i.type === 'armor').length + nativeGear.filter(i => i.type === 'armor').length + contestedLandsGear.filter(i => i.type === 'armor').length + defenderGear.filter(i => i.type === 'armor').length + supportGear.filter(i => i.type === 'armor').length + debufferGear.filter(i => i.type === 'armor').length + gamblingGear.filter(i => i.type === 'armor').length + horseRacingGear.filter(i => i.type === 'armor').length + tieredGear.filter(i => i.type === 'armor').length,
  consumables: consumables.length + diasporaConsumables.length + frontierGear.filter(i => i.type === 'consumable').length + huntingGear.filter(i => i.type === 'consumable').length + fishingGear.filter(i => i.type === 'consumable').length + craftingGear.filter(i => i.type === 'consumable').length + nativeGear.filter(i => i.type === 'consumable').length + defenderGear.filter(i => i.type === 'consumable').length + supportGear.filter(i => i.type === 'consumable').length + debufferGear.filter(i => i.type === 'consumable').length + gamblingGear.filter(i => i.type === 'consumable').length + horseRacingGear.filter(i => i.type === 'consumable').length,
  materials: materials.length + gatheringMaterials.length + refinedMaterials.length + components.length,
  total: allItems.length
};

logger.info('Items Database Loaded:', itemCounts);
