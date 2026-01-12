/**
 * Alchemy Crafted Items
 * Potions, elixirs, bombs, poisons, and remedies crafted by alchemists
 * Desperados Destiny - Phase 7
 */

import { IItem } from '../../../models/Item.model';

export const alchemyCraftedItems: Partial<IItem>[] = [
  // ============================================================================
  // NOVICE TIER (Level 1-15) - Basic remedies and simple compounds
  // ============================================================================
  {
    itemId: 'medicinal_poultice',
    name: 'Medicinal Poultice',
    description: 'A simple poultice made from medicinal roots. Effective at treating minor wounds.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 1,
    icon: '🩹',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: 'Restores 15 health' }
    ]
  },
  {
    itemId: 'herbal_tea',
    name: 'Herbal Tea',
    description: 'A calming tea that restores energy and minor health.',
    type: 'consumable',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 2,
    icon: '🍵',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 10, description: 'Restores 10 health and 5 energy' }
    ]
  },
  {
    itemId: 'poison_coating',
    name: 'Poison Coating',
    description: 'A basic toxin to coat weapons. Causes damage over time.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 4,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 poison damage for 5 attacks' }
    ]
  },
  {
    itemId: 'rare_essence',
    name: 'Rare Flower Essence',
    description: 'Distilled essence from rare flowers. Used in advanced alchemy.',
    type: 'material',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 6,
    icon: '💧',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'tallow_candle',
    name: 'Tallow Candle',
    description: 'A simple candle made from animal fat. Provides light in darkness.',
    type: 'misc',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false,
    levelRequired: 2,
    icon: '🕯️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 30, description: 'Provides light for 30 minutes' }
    ]
  },
  {
    itemId: 'pine_tar',
    name: 'Pine Tar',
    description: 'Sticky tar made from pine resin. Used as an adhesive and waterproofing.',
    type: 'material',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 5,
    icon: '🫗',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'healing_salve',
    name: 'Healing Salve',
    description: 'A basic ointment that speeds wound recovery. Smells terrible.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 1,
    icon: '🏺',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: 'Restores 20 health over 10 seconds' }
    ]
  },
  {
    itemId: 'snake_oil',
    name: 'Snake Oil',
    description: 'Dubious tonic that claims to cure everything. Actually does provide minor energy boost.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 3,
    icon: '🐍',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 10, description: '+10 energy for 5 minutes' }
    ]
  },
  {
    itemId: 'basic_antidote',
    name: 'Basic Antidote',
    description: 'Counters common poisons and venoms. Keep one handy in rattlesnake country.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 5,
    icon: '💉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 1, description: 'Cures basic poison effects' }
    ]
  },
  {
    itemId: 'smelling_salts',
    name: 'Smelling Salts',
    description: 'Pungent salts that wake the unconscious. Also clears the head.',
    type: 'consumable',
    rarity: 'common',
    price: 22,
    sellPrice: 11,
    inShop: false,
    levelRequired: 8,
    icon: '🧂',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 1, description: 'Revives from unconscious state' }
    ]
  },
  {
    itemId: 'pain_killer',
    name: 'Pain Killer Draught',
    description: 'Numbs pain and allows continued action despite injury.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 12,
    icon: '💊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 15, description: 'Ignore 15% damage for 3 minutes' }
    ]
  },
  {
    itemId: 'sage_salve',
    name: 'Sage Salve',
    description: 'Traditional remedy using desert sage. Promotes natural healing.',
    type: 'consumable',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 3,
    icon: '🌿',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 12, description: 'Restores 12 health' }
    ]
  },
  {
    itemId: 'tobacco_chew',
    name: 'Tobacco Chew',
    description: 'Processed tobacco for chewing. Calms nerves but stains teeth.',
    type: 'consumable',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 5,
    icon: '🍂',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning for 10 minutes' }
    ]
  },
  {
    itemId: 'ginseng_tonic',
    name: 'Ginseng Tonic',
    description: 'Eastern remedy popular with railroad workers. Restores vitality.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 8,
    icon: '🫚',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 20, description: '+20 energy and removes fatigue' }
    ]
  },
  {
    itemId: 'sunburn_remedy',
    name: 'Sunburn Remedy',
    description: 'Aloe-based salve that soothes desert-scorched skin.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 6,
    icon: '☀️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 1, description: 'Removes sunburn debuff' }
    ]
  },
  {
    itemId: 'cough_syrup',
    name: 'Cough Syrup',
    description: 'Sweet medicine that suppresses coughs and soothes throats.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 10,
    icon: '🥄',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 1, description: 'Cures illness debuff' }
    ]
  },
  {
    itemId: 'coffee_stimulant',
    name: 'Coffee Stimulant',
    description: 'Concentrated coffee extract. Keeps you alert through the longest night watches.',
    type: 'consumable',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 4,
    icon: '☕',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning for 15 minutes' },
      { type: 'special', value: 1, description: 'Prevents sleep debuff' }
    ]
  },
  {
    itemId: 'rattlesnake_antidote',
    name: 'Rattlesnake Antidote',
    description: 'Specialized cure for rattlesnake venom. Essential frontier medicine.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 15,
    icon: '🐍',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Cures all snake venoms instantly' }
    ]
  },

  // ============================================================================
  // APPRENTICE TIER (Level 16-30) - Combat enhancers and tactical items
  // ============================================================================
  {
    itemId: 'strength_tonic',
    name: 'Strength Tonic',
    description: 'Increases physical power temporarily. Popular with brawlers.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 16,
    icon: '💪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 10 minutes' }
    ]
  },
  {
    itemId: 'speed_elixir',
    name: 'Speed Elixir',
    description: 'Quickens reflexes and movement. Favored by thieves and gunslingers.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 70,
    sellPrice: 35,
    inShop: false,
    levelRequired: 18,
    icon: '⚡',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning for 10 minutes' }
    ]
  },
  {
    itemId: 'smoke_bomb',
    name: 'Smoke Bomb',
    description: 'Creates a thick cloud of smoke for quick escapes or confusion.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 20,
    icon: '💨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Creates smoke cloud, +50% escape chance' }
    ]
  },
  {
    itemId: 'night_vision_elixir',
    name: 'Night Vision Elixir',
    description: 'Allows clear vision in darkness. Essential for night raids.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 40,
    inShop: false,
    levelRequired: 24,
    icon: '👁️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning in darkness for 30 minutes' }
    ]
  },
  {
    itemId: 'fire_oil',
    name: 'Fire Oil',
    description: 'Flammable liquid that burns intensely. Coat weapons or throw as incendiary.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: false,
    levelRequired: 28,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 fire damage for 3 attacks' }
    ]
  },
  {
    itemId: 'liquid_courage',
    name: 'Liquid Courage',
    description: 'Strong brew that steels nerves for dangerous situations.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 20,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 10 minutes' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit for 10 minutes' }
    ]
  },
  {
    itemId: 'crimson_dye',
    name: 'Crimson Dye',
    description: 'Rich red dye made from cochineal insects. Prized by tailors.',
    type: 'material',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 22,
    icon: '🔴',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'indigo_dye',
    name: 'Indigo Dye',
    description: 'Deep blue dye extracted through careful processing. Used in fine clothing.',
    type: 'material',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 25,
    icon: '🔵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'peyote_vision',
    name: 'Peyote Vision',
    description: 'Ritualistic preparation that induces spirit visions. Handle with respect.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 28,
    icon: '🌵',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit for 20 minutes' },
      { type: 'special', value: 1, description: 'May reveal hidden information' }
    ]
  },
  {
    itemId: 'refined_gunpowder',
    name: 'Refined Gunpowder',
    description: 'High-quality gunpowder for precision ammunition and explosives.',
    type: 'material',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 25,
    icon: '💥',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'fireproof_salve',
    name: 'Fireproof Salve',
    description: 'Coating that protects skin from burns. Essential for working with fire.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 30,
    icon: '🛡️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 50, description: '50% fire resistance for 15 minutes' }
    ]
  },

  // ============================================================================
  // JOURNEYMAN TIER (Level 31-50) - Advanced potions and explosives
  // ============================================================================
  {
    itemId: 'invisibility_potion',
    name: 'Invisibility Potion',
    description: 'Renders the drinker invisible for a short time. Perfect for infiltration.',
    type: 'consumable',
    rarity: 'rare',
    price: 180,
    sellPrice: 90,
    inShop: false,
    levelRequired: 31,
    icon: '👻',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning (stealth) for 2 minutes' },
      { type: 'special', value: 1, description: 'Invisible until attacking' }
    ]
  },
  {
    itemId: 'explosive_charge',
    name: 'Explosive Charge',
    description: 'Powerful explosive for demolition or combat. Handle with extreme care.',
    type: 'consumable',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 34,
    icon: '💣',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 50, description: 'Deals 50 explosive damage in area' }
    ]
  },
  {
    itemId: 'numbing_agent',
    name: 'Numbing Agent',
    description: 'Powerful anesthetic for surgery or interrogation resistance.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 45,
    inShop: false,
    levelRequired: 38,
    icon: '💉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 100, description: 'Complete pain immunity for 5 minutes' }
    ]
  },
  {
    itemId: 'truth_serum',
    name: 'Truth Serum',
    description: 'Makes the subject compelled to answer questions honestly. Illegal in most territories.',
    type: 'consumable',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 42,
    icon: '🗣️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Forces truth in conversation for 10 minutes' }
    ]
  },
  {
    itemId: 'potent_healing_elixir',
    name: 'Potent Healing Elixir',
    description: 'Strong medicine that rapidly heals wounds and restores vitality.',
    type: 'consumable',
    rarity: 'rare',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 35,
    icon: '💚',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 75, description: 'Restores 75 health instantly' }
    ]
  },
  {
    itemId: 'viper_venom_poison',
    name: 'Viper Venom Poison',
    description: 'Concentrated venom that causes severe damage over time.',
    type: 'consumable',
    rarity: 'rare',
    price: 110,
    sellPrice: 55,
    inShop: false,
    levelRequired: 38,
    icon: '☠️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 poison damage for 10 attacks' }
    ]
  },
  {
    itemId: 'frost_weapon_oil',
    name: 'Frost Weapon Oil',
    description: 'Coating that adds freezing damage to weapons. Slows enemies.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 40,
    icon: '❄️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 frost damage, slows target' }
    ]
  },
  {
    itemId: 'stink_bomb',
    name: 'Stink Bomb',
    description: 'Creates a nauseating cloud that drives people away.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 32,
    icon: '🤢',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Clears area, -5 Combat to affected' }
    ]
  },
  {
    itemId: 'laudanum',
    name: 'Laudanum',
    description: 'Opium tincture for severe pain. Highly addictive.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: false,
    levelRequired: 35,
    icon: '🍶',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 50, description: 'Ignore 50% damage, -3 Cunning' }
    ]
  },
  {
    itemId: 'acid_vial',
    name: 'Acid Vial',
    description: 'Corrosive acid that eats through metal and flesh alike.',
    type: 'consumable',
    rarity: 'rare',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 45,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: 'Deals 25 acid damage, ignores armor' }
    ]
  },
  {
    itemId: 'endurance_elixir',
    name: 'Endurance Elixir',
    description: 'Keeps the body going far beyond normal limits.',
    type: 'consumable',
    rarity: 'rare',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 42,
    icon: '🏃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 30, description: '+30 max stamina for 20 minutes' },
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 20 minutes' }
    ]
  },
  {
    itemId: 'flash_powder',
    name: 'Flash Powder',
    description: 'Ignites with blinding light. Used for diversions or photography.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 36,
    icon: '✨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 1, description: 'Blinds targets for 5 seconds' }
    ]
  },
  {
    itemId: 'nitroglycerin',
    name: 'Nitroglycerin',
    description: 'Extremely unstable explosive liquid. Move very carefully.',
    type: 'material',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 45,
    icon: '⚗️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  },
  {
    itemId: 'dynamite_stick',
    name: 'Dynamite Stick',
    description: 'Stabilized explosive for mining and demolition.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 48,
    icon: '🧨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 35, description: 'Deals 35 explosive damage in area' }
    ]
  },

  // ============================================================================
  // EXPERT TIER (Level 51-70) - Powerful elixirs and dangerous compounds
  // ============================================================================
  {
    itemId: 'resurrection_tonic',
    name: 'Resurrection Tonic',
    description: 'Brings someone back from the brink of death. Miracle medicine.',
    type: 'consumable',
    rarity: 'epic',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 51,
    icon: '✝️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Revives from death with 50% health' }
    ]
  },
  {
    itemId: 'deadly_poison',
    name: 'Deadly Poison',
    description: 'Lethal toxin that kills slowly and painfully. Coat weapons or slip into drinks.',
    type: 'consumable',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 55,
    icon: '💀',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 poison damage per attack for 5 attacks' }
    ]
  },
  {
    itemId: 'dynamite_bundle',
    name: 'Dynamite Bundle',
    description: 'Multiple sticks of dynamite for maximum destructive power.',
    type: 'consumable',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 58,
    icon: '🧨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'stat', stat: 'combat', value: 100, description: 'Deals 100 explosive damage in large area' }
    ]
  },
  {
    itemId: 'mind_control_elixir',
    name: 'Mind Control Elixir',
    description: 'Makes the drinker susceptible to suggestion. Extremely dangerous and illegal.',
    type: 'consumable',
    rarity: 'epic',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 60,
    icon: '🧠',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 1, description: 'Target obeys commands for 5 minutes' }
    ]
  },
  {
    itemId: 'berserker_brew',
    name: 'Berserker Brew',
    description: 'Induces battle rage. Massively increases damage but clouds judgment.',
    type: 'consumable',
    rarity: 'rare',
    price: 175,
    sellPrice: 87,
    inShop: false,
    levelRequired: 55,
    icon: '😤',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat for 5 minutes' },
      { type: 'stat', stat: 'cunning', value: -5, description: '-5 Cunning while active' }
    ]
  },
  {
    itemId: 'paralytic_venom',
    name: 'Paralytic Venom',
    description: 'Causes complete paralysis in victims. Extracted from rare spiders.',
    type: 'consumable',
    rarity: 'rare',
    price: 185,
    sellPrice: 92,
    inShop: false,
    levelRequired: 58,
    icon: '🕷️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Paralyzes target for 10 seconds' }
    ]
  },
  {
    itemId: 'ironhide_potion',
    name: 'Ironhide Potion',
    description: 'Hardens skin to resist physical damage. Feels like iron.',
    type: 'consumable',
    rarity: 'rare',
    price: 160,
    sellPrice: 80,
    inShop: false,
    levelRequired: 52,
    icon: '🛡️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 30, description: '30% physical damage reduction for 10 minutes' }
    ]
  },
  {
    itemId: 'greek_fire',
    name: 'Greek Fire',
    description: 'Ancient incendiary that burns even on water. Terrifying weapon.',
    type: 'consumable',
    rarity: 'epic',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 62,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'stat', stat: 'combat', value: 60, description: 'Deals 60 fire damage, spreads to nearby' }
    ]
  },
  {
    itemId: 'universal_antidote',
    name: 'Universal Antidote',
    description: 'Cures any poison, venom, or toxin known to man.',
    type: 'consumable',
    rarity: 'rare',
    price: 180,
    sellPrice: 90,
    inShop: false,
    levelRequired: 55,
    icon: '💊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 1, description: 'Cures all poisons and toxins instantly' }
    ]
  },
  {
    itemId: 'madness_poison',
    name: 'Madness Poison',
    description: 'Causes temporary insanity. Victims attack friends and foes alike.',
    type: 'consumable',
    rarity: 'rare',
    price: 190,
    sellPrice: 95,
    inShop: false,
    levelRequired: 60,
    icon: '🤪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Target attacks randomly for 30 seconds' }
    ]
  },
  {
    itemId: 'incendiary_bomb',
    name: 'Incendiary Bomb',
    description: 'Explosive that spreads fire over a wide area.',
    type: 'consumable',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 58,
    icon: '💥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 45, description: 'Deals 45 fire damage, creates burning area' }
    ]
  },

  // ============================================================================
  // MASTER TIER (Level 71-85) - Supernatural compounds
  // ============================================================================
  {
    itemId: 'immortality_elixir',
    name: 'Immortality Elixir',
    description: 'Temporarily halts aging and prevents death. The secret of the ancients.',
    type: 'consumable',
    rarity: 'epic',
    price: 750,
    sellPrice: 375,
    inShop: false,
    levelRequired: 65,
    icon: '⏳',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 1, description: 'Cannot die for 60 seconds' }
    ]
  },
  {
    itemId: 'transformation_potion',
    name: 'Transformation Potion',
    description: 'Allows the drinker to take another form. Duration and control vary.',
    type: 'consumable',
    rarity: 'epic',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 68,
    icon: '🦊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 1, description: 'Transform into chosen animal for 10 minutes' }
    ]
  },
  {
    itemId: 'werewolf_bane',
    name: 'Werewolf Bane',
    description: 'Silver-infused poison deadly to werewolves and other shapeshifters.',
    type: 'consumable',
    rarity: 'epic',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 72,
    icon: '🐺',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 100, description: 'x3 damage to shapeshifters' }
    ]
  },
  {
    itemId: 'vampire_cure',
    name: 'Vampire Cure',
    description: 'Holy compound that can cure vampirism if administered quickly.',
    type: 'consumable',
    rarity: 'epic',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 75,
    icon: '🧛',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Cures vampirism if used within 24 hours' }
    ]
  },
  {
    itemId: 'specter_oil',
    name: 'Specter Oil',
    description: 'Allows weapons to damage incorporeal beings like ghosts.',
    type: 'consumable',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 70,
    icon: '👻',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: 'Weapon can hit ghosts, +20 vs spirits' }
    ]
  },
  {
    itemId: 'time_dilation_potion',
    name: 'Time Dilation Potion',
    description: 'Slows time perception, making the drinker seem impossibly fast.',
    type: 'consumable',
    rarity: 'epic',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 78,
    icon: '⏱️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'stat', stat: 'cunning', value: 20, description: '+20 Cunning for 30 seconds' },
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat for 30 seconds' }
    ]
  },
  {
    itemId: 'devils_breath',
    name: "Devil's Breath",
    description: 'Hellish compound that removes free will. Made with brimstone.',
    type: 'consumable',
    rarity: 'epic',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 80,
    icon: '😈',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 1, description: 'Complete mind control for 1 hour' }
    ]
  },
  {
    itemId: 'regeneration_elixir',
    name: 'Regeneration Elixir',
    description: 'Grants rapid healing that can regrow lost limbs over time.',
    type: 'consumable',
    rarity: 'epic',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 75,
    icon: '💚',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 10, description: 'Regenerate 10 health per second for 30 seconds' }
    ]
  },
  {
    itemId: 'sanctified_holy_water',
    name: 'Sanctified Holy Water',
    description: 'Blessed by multiple faiths. Devastating to all evil creatures.',
    type: 'consumable',
    rarity: 'epic',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 72,
    icon: '✨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 50, description: 'Deals 50 holy damage to undead/demons' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 10 minutes' }
    ]
  },
  {
    itemId: 'spirit_communion_potion',
    name: 'Spirit Communion Potion',
    description: 'Opens the veil between worlds. Allows communication with the dead.',
    type: 'consumable',
    rarity: 'epic',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 78,
    icon: '🔮',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit for 20 minutes' },
      { type: 'special', value: 1, description: 'Can speak with spirits' }
    ]
  },
  {
    itemId: 'cursed_elixir',
    name: 'Cursed Elixir',
    description: 'Dark potion that transfers a curse to the drinker. Has many uses.',
    type: 'consumable',
    rarity: 'epic',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 80,
    icon: '🖤',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat from dark power' },
      { type: 'stat', stat: 'spirit', value: -10, description: '-10 Spirit while cursed' }
    ]
  },

  // ============================================================================
  // GRANDMASTER TIER (Level 86-100) - Legendary alchemical creations
  // ============================================================================
  {
    itemId: 'elixir_of_legends',
    name: 'Elixir of Legends',
    description: 'The pinnacle of alchemical achievement. Grants temporary godlike power.',
    type: 'consumable',
    rarity: 'legendary',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 86,
    icon: '🌟',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat for 5 minutes' },
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning for 5 minutes' },
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit for 5 minutes' }
    ]
  },
  {
    itemId: 'atomic_explosive',
    name: 'Atomic Explosive',
    description: 'Theoretical explosive of immense power. Can level entire buildings.',
    type: 'consumable',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 90,
    icon: '☢️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 500, description: 'Deals 500 damage in massive area' }
    ]
  },
  {
    itemId: 'fountain_of_youth',
    name: 'Fountain of Youth',
    description: 'Legendary elixir that reverses aging. A single dose lasts decades.',
    type: 'consumable',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '⛲',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 1, description: 'Permanently removes aging debuffs' },
      { type: 'special', value: 100, description: '+100 max health permanently' }
    ]
  },
  {
    itemId: 'phoenix_rebirth_elixir',
    name: 'Phoenix Rebirth Elixir',
    description: 'Made with true phoenix ash. Grants one automatic resurrection.',
    type: 'consumable',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 92,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 1, description: 'Auto-revive on death with full health (1 hour)' }
    ]
  },
  {
    itemId: 'doomsday_explosive',
    name: 'Doomsday Explosive',
    description: 'The most powerful explosive ever created. Can destroy anything.',
    type: 'consumable',
    rarity: 'legendary',
    price: 10000,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 100,
    icon: '💀',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 9999, description: 'Destroys everything in huge radius' }
    ]
  }
];
