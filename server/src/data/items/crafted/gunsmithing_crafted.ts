/**
 * Gunsmithing Crafted Items Database
 * Phase 7.2 Crafting Expansion - Recipe outputs for Gunsmithing profession
 * Includes: firearms, ammunition, gun parts, modifications
 */

import { IItem } from '../../../models/Item.model';

export const gunsmithingCrafted: Partial<IItem>[] = [
  // ========== BASIC AMMUNITION (Level 1-30) ==========
  {
    itemId: 'basic_bullets',
    name: 'Basic Bullets',
    description: 'Standard lead bullets for revolvers. Nothing fancy, but they work.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 1,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'small_caliber_bullets',
    name: 'Small Caliber Bullets',
    description: 'Lighter bullets for derringers and small pistols.',
    type: 'consumable',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 5,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'paper_cartridges',
    name: 'Paper Cartridges',
    description: 'Old-style paper-wrapped cartridges. Faster to reload than loose powder.',
    type: 'consumable',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 8,
    icon: '📜',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'rifle_ammo',
    name: 'Rifle Ammunition',
    description: 'Standard rifle cartridges. Longer range, more stopping power.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 15,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'shotgun_shells',
    name: 'Shotgun Shells',
    description: 'Standard 12-gauge shells loaded with buckshot.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 12,
    icon: '🔴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========== ADVANCED AMMUNITION (Level 25-60) ==========
  {
    itemId: 'hollow_point_bullets',
    name: 'Hollow Point Bullets',
    description: 'Bullets that expand on impact. Devastating stopping power.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 25,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 25, description: '+25% damage vs unarmored' }
    ]
  },
  {
    itemId: 'armor_piercing_rounds',
    name: 'Armor-Piercing Rounds',
    description: 'Hardened steel-core bullets that punch through armor.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 30,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 30, description: '+30% armor penetration' }
    ]
  },
  {
    itemId: 'wadcutter_rounds',
    name: 'Wadcutter Rounds',
    description: 'Flat-nosed bullets that cut clean holes. Favored for target shooting.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 28,
    icon: '🔘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: '+15% accuracy' }
    ]
  },
  {
    itemId: 'buckshot_spread_shells',
    name: 'Buckshot Spread Shells',
    description: 'Wide-pattern buckshot for maximum spread. Hard to miss.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 25,
    icon: '🔴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: '+20% hit chance at close range' }
    ]
  },
  {
    itemId: 'slug_shells',
    name: 'Rifled Slug Shells',
    description: 'Single heavy slugs for shotguns. Long range accuracy from a scattergun.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 32,
    icon: '🔴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 35, description: '+35% shotgun range' }
    ]
  },
  {
    itemId: 'match_grade_ammo',
    name: 'Match-Grade Ammunition',
    description: 'Precisely crafted cartridges for competition shooting. Perfect consistency.',
    type: 'consumable',
    rarity: 'rare',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 45,
    icon: '🎯',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 25, description: '+25% accuracy' }
    ]
  },
  {
    itemId: 'tracer_rounds',
    name: 'Tracer Rounds',
    description: 'Phosphorus-tipped bullets that leave a visible trail. Great for aiming.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 35,
    icon: '💥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: '+15% accuracy at night' }
    ]
  },
  {
    itemId: 'incendiary_rounds',
    name: 'Incendiary Rounds',
    description: 'Bullets that ignite on impact. Sets targets ablaze.',
    type: 'consumable',
    rarity: 'rare',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 50,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 10, description: '+10 fire damage' }
    ]
  },
  {
    itemId: 'explosive_rounds',
    name: 'Explosive Rounds',
    description: 'Bullets with tiny explosive charges. Devastating on impact.',
    type: 'consumable',
    rarity: 'rare',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 55,
    icon: '💥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 20, description: '+20 explosive damage' }
    ]
  },
  {
    itemId: 'poison_tipped_rounds',
    name: 'Poison-Tipped Rounds',
    description: 'Bullets coated with deadly venom. Causes lingering damage.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 50,
    icon: '☠️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 15, description: '+15 poison damage over time' }
    ]
  },

  // ========== SUPERNATURAL AMMUNITION (Level 55-90) ==========
  {
    itemId: 'silver_bullets',
    name: 'Pure Silver Bullets',
    description: 'Bullets cast from pure silver. Deadly to werewolves and the unholy.',
    type: 'consumable',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 55,
    icon: '⚪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 100, description: '+100% damage vs supernatural' }
    ]
  },
  {
    itemId: 'ghost_killing_rounds',
    name: 'Ghost-Killing Rounds',
    description: 'Bullets blessed to affect incorporeal beings. Even ghosts can die.',
    type: 'consumable',
    rarity: 'epic',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 70,
    icon: '👻',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 100, description: 'Can damage incorporeal beings' }
    ]
  },
  {
    itemId: 'judgement_rounds',
    name: 'Rounds of Judgement',
    description: 'Holy ammunition that burns with divine fire. Judges the wicked.',
    type: 'consumable',
    rarity: 'legendary',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 90,
    icon: '⚡',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 50, description: '+50 holy damage vs evil' }
    ]
  },

  // ========== BASIC FIREARMS (Level 10-35) ==========
  {
    itemId: 'derringer_pistol',
    name: 'Derringer Pocket Pistol',
    description: 'A tiny two-shot pistol that fits in a vest pocket. Last resort weapon.',
    type: 'weapon',
    rarity: 'common',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 10,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' }
    ]
  },
  {
    itemId: 'colt_walker',
    name: 'Colt Walker Revolver',
    description: 'The famous Walker Colt, preferred by Texas Rangers. Heavy but powerful.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 25,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' }
    ]
  },
  {
    itemId: 'dragoon_revolver',
    name: 'Colt Dragoon Revolver',
    description: 'A cavalry-issue .44 caliber monster. Intimidating and deadly.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 380,
    sellPrice: 190,
    inShop: false,
    levelRequired: 28,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 13, description: '+13 Combat' }
    ]
  },
  {
    itemId: 'sawed_off_shotgun',
    name: 'Sawed-Off Shotgun',
    description: 'A shotgun with shortened barrels. Devastating at close range.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 25,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat at close range' }
    ]
  },
  {
    itemId: 'coach_gun',
    name: 'Coach Gun',
    description: 'Double-barreled shotgun favored by stagecoach guards.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 320,
    sellPrice: 160,
    inShop: false,
    levelRequired: 28,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' }
    ]
  },

  // ========== ICONIC FIREARMS (Level 35-60) ==========
  {
    itemId: 'colt_peacemaker',
    name: 'Colt Peacemaker Replica',
    description: 'The gun that won the West. Single Action Army revolver.',
    type: 'weapon',
    rarity: 'rare',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 40,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 16, description: '+16 Combat' }
    ]
  },
  {
    itemId: 'schofield_revolver',
    name: 'Schofield Top-Break Revolver',
    description: 'A fast-loading top-break design favored by many outlaws.',
    type: 'weapon',
    rarity: 'rare',
    price: 520,
    sellPrice: 260,
    inShop: false,
    levelRequired: 38,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: 20, description: '+20% reload speed' }
    ]
  },
  {
    itemId: 'lemat_revolver',
    name: 'LeMat Grapeshot Revolver',
    description: 'A nine-shot revolver with an under-barrel shotgun. Confederate favorite.',
    type: 'weapon',
    rarity: 'rare',
    price: 650,
    sellPrice: 325,
    inShop: false,
    levelRequired: 45,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 17, description: '+17 Combat' },
      { type: 'special', value: 1, description: 'Secondary shotgun blast' }
    ]
  },
  {
    itemId: 'volcanic_pistol',
    name: 'Volcanic Repeating Pistol',
    description: 'Early repeating pistol with lever action. Fast and reliable.',
    type: 'weapon',
    rarity: 'rare',
    price: 580,
    sellPrice: 290,
    inShop: false,
    levelRequired: 42,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 30, description: '+30% fire rate' }
    ]
  },
  {
    itemId: 'henry_rifle',
    name: 'Henry Repeating Rifle',
    description: 'The rifle that you load on Sunday and shoot all week.',
    type: 'weapon',
    rarity: 'rare',
    price: 700,
    sellPrice: 350,
    inShop: false,
    levelRequired: 50,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'special', value: 16, description: '16-round capacity' }
    ]
  },
  {
    itemId: 'winchester_lever_action',
    name: 'Winchester Lever-Action Rifle',
    description: 'The iconic rifle of the American frontier. Reliable and powerful.',
    type: 'weapon',
    rarity: 'rare',
    price: 750,
    sellPrice: 375,
    inShop: false,
    levelRequired: 52,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 19, description: '+19 Combat' }
    ]
  },
  {
    itemId: 'sharps_rifle',
    name: 'Sharps Buffalo Rifle',
    description: 'The preferred rifle of buffalo hunters. Incredible range and power.',
    type: 'weapon',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 55,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 22, description: '+22 Combat' },
      { type: 'special', value: 50, description: '+50% range' }
    ]
  },

  // ========== GUN PARTS & MODIFICATIONS (Level 15-70) ==========
  {
    itemId: 'simple_grip',
    name: 'Simple Wooden Grip',
    description: 'Basic wooden grips for a revolver. Nothing fancy.',
    type: 'misc',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 10,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'custom_grip',
    name: 'Custom Carved Grip',
    description: 'Beautifully carved wooden grips with custom designs.',
    type: 'misc',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 30,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 5, description: '+5% accuracy' }
    ]
  },
  {
    itemId: 'rifled_barrel',
    name: 'Rifled Barrel',
    description: 'A precision-cut rifled barrel for improved accuracy.',
    type: 'misc',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 35,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% accuracy' }
    ]
  },
  {
    itemId: 'engraved_barrel',
    name: 'Custom Engraved Barrel',
    description: 'A barrel with intricate engravings. Form meets function.',
    type: 'misc',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 45,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% accuracy' },
      { type: 'special', value: 10, description: '+10% weapon value' }
    ]
  },
  {
    itemId: 'hair_trigger',
    name: 'Hair Trigger Mechanism',
    description: 'An ultra-light trigger for faster firing. Requires a steady hand.',
    type: 'misc',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 38,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% fire rate' }
    ]
  },
  {
    itemId: 'hammer_spur',
    name: 'Extended Hammer Spur',
    description: 'Extended spur for faster cocking. Essential for quick-draw.',
    type: 'misc',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 30,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% draw speed' }
    ]
  },
  {
    itemId: 'extended_magazine',
    name: 'Extended Magazine',
    description: 'Modified cylinder or magazine for additional rounds.',
    type: 'misc',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 35,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 2, description: '+2 ammunition capacity' }
    ]
  },
  {
    itemId: 'quick_draw_spring',
    name: 'Quick-Draw Holster Spring',
    description: 'A spring mechanism that pops the gun into your hand.',
    type: 'misc',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 45,
    inShop: false,
    levelRequired: 32,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 25, description: '+25% draw speed' }
    ]
  },
  {
    itemId: 'scope_mount',
    name: 'Rifle Scope Mount',
    description: 'A mount for attaching optics to rifles.',
    type: 'misc',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 35,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'sniper_scope',
    name: 'Sniper Scope',
    description: 'A long-range optical scope for precision shooting.',
    type: 'misc',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 50,
    icon: '🔭',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% range' },
      { type: 'special', value: 25, description: '+25% accuracy' }
    ]
  },
  {
    itemId: 'suppressor',
    name: 'Suppressor',
    description: 'A muzzle device that reduces the sound of gunfire. Silent but deadly.',
    type: 'misc',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 55,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' }
    ]
  },
  {
    itemId: 'auto_loader',
    name: 'Auto-Loader Mechanism',
    description: 'An experimental automatic loading mechanism. Very advanced.',
    type: 'misc',
    rarity: 'epic',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 65,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% fire rate' }
    ]
  },
  {
    itemId: 'lightning_draw_mech',
    name: 'Lightning Draw Mechanism',
    description: 'A holster mechanism that draws faster than thought.',
    type: 'misc',
    rarity: 'epic',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 60,
    icon: '⚡',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% draw speed' }
    ]
  },
  {
    itemId: 'perfect_balance_mod',
    name: 'Perfect Balance Modification',
    description: 'Precision adjustments for perfect weapon balance.',
    type: 'misc',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 50,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% accuracy' },
      { type: 'special', value: 10, description: '+10% handling' }
    ]
  },

  // ========== TOOLS & KITS (Level 10-50) ==========
  {
    itemId: 'basic_holster_clip',
    name: 'Basic Holster Clip',
    description: 'A simple belt clip for holster attachment.',
    type: 'misc',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 5,
    icon: '📎',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'pistol_cleaning_brush',
    name: 'Pistol Cleaning Brush',
    description: 'A brush for cleaning pistol barrels. Basic maintenance.',
    type: 'tool',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 5,
    icon: '🧹',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'gun_cleaning_kit',
    name: 'Gun Cleaning Kit',
    description: 'Complete kit for cleaning and maintaining firearms.',
    type: 'tool',
    rarity: 'common',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 15,
    icon: '🧰',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% weapon durability' }
    ]
  },
  {
    itemId: 'blued_steel_kit',
    name: 'Blued Steel Finishing Kit',
    description: 'Kit for applying protective blued steel finish to guns.',
    type: 'tool',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 30,
    icon: '🧴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 20, description: '+20% rust resistance' }
    ]
  },
  {
    itemId: 'field_repair_kit',
    name: 'Field Repair Kit',
    description: 'Portable kit for emergency gun repairs in the field.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 35,
    icon: '🧰',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 30, description: 'Repairs weapon by 30%' }
    ]
  },
  {
    itemId: 'trigger_job_kit',
    name: 'Trigger Job Kit',
    description: 'Specialized tools for adjusting trigger mechanisms.',
    type: 'tool',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 40,
    icon: '🔧',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'speed_loader_pouch',
    name: 'Leather Speed Loader Pouch',
    description: 'Pouch holding pre-loaded cylinders for fast reloading.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 28,
    icon: '👝',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 40, description: '+40% reload speed' }
    ]
  },
  {
    itemId: 'mercury_primers',
    name: 'Mercury Fulminate Primers',
    description: 'Reliable primers for consistent ignition. Standard chemistry.',
    type: 'misc',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 15,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========== EXPERIMENTAL & LEGENDARY FIREARMS (Level 65-100) ==========
  {
    itemId: 'gatling_pistol',
    name: 'Gatling Pistol',
    description: 'A hand-held multi-barrel rotary pistol. Experimental and devastating.',
    type: 'weapon',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 70,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'special', value: 100, description: '+100% fire rate' }
    ]
  },
  {
    itemId: 'gatling_conversion',
    name: 'Gatling Conversion Kit',
    description: 'Convert a rifle into a hand-cranked repeating weapon.',
    type: 'misc',
    rarity: 'epic',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 65,
    icon: '⚙️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'hellfire_pistol',
    name: 'Hellfire Pistol',
    description: 'A pistol that fires bullets of pure hellfire. Burns with infernal fury.',
    type: 'weapon',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 85,
    icon: '🔥',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat' },
      { type: 'special', value: 25, description: '+25 fire damage' }
    ]
  },
  {
    itemId: 'destiny_revolver',
    name: 'Destiny Revolver',
    description: 'A revolver that always hits its intended target. Fate guides each bullet.',
    type: 'weapon',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 90,
    icon: '⭐',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 28, description: '+28 Combat' },
      { type: 'special', value: 50, description: '+50% accuracy' }
    ]
  },
  {
    itemId: 'blessed_carbine',
    name: 'Blessed Carbine of St. Michael',
    description: 'A rifle blessed by archangelic power. Smites the wicked.',
    type: 'weapon',
    rarity: 'legendary',
    price: 4500,
    sellPrice: 2250,
    inShop: false,
    levelRequired: 92,
    icon: '👼',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 32, description: '+32 Combat' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 100, description: '+100% damage vs evil' }
    ]
  },
  {
    itemId: 'pale_rider_revolvers',
    name: 'Pale Rider Matched Revolvers',
    description: 'Twin ivory-handled revolvers that herald death. The last thing many have seen.',
    type: 'weapon',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '💀',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 35, description: '+35 Combat' },
      { type: 'special', value: 20, description: '+20% instant kill chance on critical' }
    ]
  },
  {
    itemId: 'infinity_chamber',
    name: 'Infinity Chamber',
    description: 'A cylinder that holds infinite bullets. Defies all laws of physics.',
    type: 'misc',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 95,
    icon: '♾️',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 999, description: 'Unlimited ammunition' }
    ]
  },
  {
    itemId: 'devils_own',
    name: "The Devil's Own",
    description: 'A pistol forged in hellfire by the devil himself. The ultimate outlaw weapon.',
    type: 'weapon',
    rarity: 'legendary',
    price: 7500,
    sellPrice: 3750,
    inShop: false,
    levelRequired: 100,
    icon: '😈',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 45, description: '+45 Combat' },
      { type: 'stat', stat: 'cunning', value: 20, description: '+20 Cunning' },
      { type: 'special', value: 30, description: '+30% critical damage' }
    ]
  }
];
