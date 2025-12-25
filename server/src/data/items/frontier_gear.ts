/**
 * Grit of the Frontier Gear
 * Items for the iconic archetypes of the West
 */

import { IItem } from '../../models/Item.model';

export const frontierGear: Partial<IItem>[] = [
  // ========================================
  // PROSPECTOR'S GEAR (MINING FOCUS)
  // ========================================
  {
    itemId: 'geologists-loupe',
    name: 'Geologist\'s Loupe',
    description: 'A high-quality magnifying glass, essential for identifying promising mineral veins. Increases the chance of finding rare gems.',
    type: 'armor',
    rarity: 'uncommon',
    price: 450,
    sellPrice: 225,
    inShop: true,
    levelRequired: 8,
    icon: '🧐',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 10, description: '+10% chance to find rare gems while mining' }
    ]
  },
  {
    itemId: 'reinforced-mining-helmet',
    name: 'Reinforced Mining Helmet',
    description: 'A sturdy helmet with a metal plate bolted to the front. It might just save your skull from a falling rock.',
    type: 'armor',
    rarity: 'uncommon',
    price: 320,
    sellPrice: 160,
    inShop: true,
    levelRequired: 8,
    icon: '⛑️',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 15, description: '+15 HP' },
      { type: 'special', value: 5, description: '+5% Physical Resistance' },
      { type: 'special', value: 20, description: '20% chance to ignore damage from mine collapses' }
    ]
  },
  {
    itemId: 'canteen-of-special-water',
    name: 'Canteen of \'Special\' Water',
    description: 'The label is mostly peeled off, but it smells faintly of ozone and regret. Restores a significant amount of energy, but leaves you feeling... wobbly.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 8,
    icon: '💧',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'energy', value: 50, description: 'Restores 50 Energy' },
      { type: 'stat', stat: 'cunning', value: -5, description: '-5 Cunning for 15 minutes (Dizziness)' }
    ]
  },

  // ========================================
  // LAWMAN'S EQUIPMENT (DEFENSE & AUTHORITY)
  // ========================================
  {
    itemId: 'heavy-badge-of-authority',
    name: 'Heavy Badge of Authority',
    description: 'An impressively large and shiny badge. It carries the weight of the law, inspiring allies and intimidating foes.',
    type: 'armor',
    rarity: 'rare',
    price: 1200,
    sellPrice: 600,
    inShop: false, // Faction reward
    levelRequired: 12,
    icon: '🛡️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 5, description: '+5% damage resistance from Outlaw enemies' },
      { type: 'special', value: 10, description: '10% chance for low-level Outlaws to flee at the start of combat' }
    ]
  },
  {
    itemId: 'standard-issue-repeater',
    name: 'Standard Issue Repeater',
    description: 'A reliable and sturdy repeating rifle issued to lawmen across the territory. Unremarkable on its own, but devastating in a posse.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 380,
    sellPrice: 190,
    inShop: false, // Faction reward
    levelRequired: 10,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 5, description: '+5% damage for each other friendly Lawman in the fight (max +15%)' }
    ]
  },

  // ========================================
  // BOUNTY HUNTER'S TOOLS (TRACKING & COMBAT)
  // ========================================
  {
    itemId: 'tracking-bolas',
    name: 'Tracking Bolas',
    description: 'Weighted ropes designed to entangle the legs of a fleeing target. Deals minimal damage but is excellent for capturing bounties alive.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: true,
    levelRequired: 6,
    icon: '🪢',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'special', value: 1, description: 'On hit, has a high chance to immobilize the target for 1 turn.' }
    ]
  },
  {
    itemId: 'notched-duster',
    name: 'Notched Duster',
    description: 'A rugged duster with a growing number of notches on the leather collar. Each one tells a story of a bounty brought to justice.',
    type: 'armor',
    rarity: 'rare',
    price: 1500,
    sellPrice: 750,
    inShop: false, // Reputation reward
    levelRequired: 15,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 25, description: '+25 HP' },
      { type: 'special', value: 1, description: '+1 Combat for every 5 bounties turned in (max +10)' }
    ]
  },
  {
    itemId: 'manacles',
    name: 'Manacles',
    description: 'Heavy iron cuffs. Necessary for bringing in a bounty alive and claiming the full reward.',
    type: 'quest',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: true,
    levelRequired: 1,
    icon: '⛓️',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Allows capture of a bounty with less than 10% health. Consumed on use.' }
    ]
  },

  // ========================================
  // UNIQUE FRONTIER ITEMS
  // ========================================
  {
    itemId: 'one-eyes-revenge',
    name: 'One-Eye\'s Revenge',
    description: 'The personal, pearl-handled revolver of "One-Eyed" Jack. It seems to have a thirst for vengeance.',
    type: 'weapon',
    rarity: 'rare',
    price: 1000,
    sellPrice: 500,
    inShop: false, // Unique drop
    levelRequired: 7,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: 10, description: '+10% critical hit chance.' }
    ]
  }
];

// =============================================================================
// PHASE 19.3: FRONTIER JUSTICE ITEMS (L16-25)
// Boss drops and quest rewards from the Frontier Justice content pack
// =============================================================================

export const frontierJusticeWeapons: Partial<IItem>[] = [
  // Sheriff Barnes Drop (L18)
  {
    itemId: 'deputies-revolver',
    name: "Deputy's Revolver",
    description: 'The sidearm of a corrupt lawman. Ironically, it shoots true against outlaws.',
    type: 'weapon',
    rarity: 'rare',
    price: 850,
    sellPrice: 425,
    inShop: false,
    levelRequired: 18,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The badge may be tarnished, but this gun never missed a shot."',
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'special', value: 15, description: '+15% accuracy vs outlaws' }
    ]
  },

  // McCray Twins Drop (L20)
  {
    itemId: 'mccray-trick-revolver',
    name: "McCray Trick Revolver",
    description: 'Jesse McCray\'s custom revolver with a hidden mechanism. Pull the trigger twice for a surprise.',
    type: 'weapon',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 20,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"One shot\'s never enough for a McCray. Why shoot once when you can shoot twice?"',
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'special', value: 20, description: 'Double Shot: 20% chance to deal damage twice' }
    ]
  },

  // Mining Enforcer Drop (L22)
  {
    itemId: 'volkovs-hammer',
    name: "Volkov's Hammer",
    description: 'The massive sledgehammer of Heinrich Volkov. It breaks more than just rocks.',
    type: 'weapon',
    rarity: 'epic',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 22,
    icon: '🔨',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"In Russia, hammer breaks you. Here, hammer breaks everything else."',
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'spirit', value: -2, description: '-2 Spirit (heavy burden)' },
      { type: 'special', value: 25, description: '+25% damage, -15% attack speed' }
    ]
  },

  // Colonel Blackwood Drop (L25)
  {
    itemId: 'blackwoods-saber',
    name: "Blackwood's Cavalry Saber",
    description: 'The legendary blade of Colonel Blackwood, used to lead a hundred charges.',
    type: 'weapon',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 25,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"For God and country, I led them forward. The saber remembers every charge."',
    effects: [
      { type: 'stat', stat: 'combat', value: 22, description: '+22 Combat' },
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', value: 30, description: '+30% damage when mounted' }
    ]
  },

  // Pinkerton Quest Reward (L16)
  {
    itemId: 'pinkerton-repeater',
    name: 'Pinkerton Repeater',
    description: 'Standard issue for Pinkerton agents. Precision-engineered for taking down targets.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 16,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The Pinkerton Detective Agency ensures every agent is well-equipped."',
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'special', value: 12, description: '+12% critical hit chance' }
    ]
  },

  // Nahi Quest Reward (L21)
  {
    itemId: 'war-chiefs-tomahawk',
    name: "War Chief's Tomahawk",
    description: 'Earned through the trials of the Apache War Band. A weapon of honor.',
    type: 'weapon',
    rarity: 'rare',
    price: 1200,
    sellPrice: 600,
    inShop: false,
    levelRequired: 21,
    icon: '🪓',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Only those who prove themselves worthy may carry this blade."',
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 15, description: 'Can be used as ranged thrown weapon' }
    ]
  },

  // Marshal Reputation Reward (L19)
  {
    itemId: 'lawmans-shotgun',
    name: "Lawman's Shotgun",
    description: 'A double-barreled shotgun favored by town marshals. Excellent for crowd control.',
    type: 'weapon',
    rarity: 'rare',
    price: 950,
    sellPrice: 475,
    inShop: false,
    levelRequired: 19,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"When one barrel doesn\'t make \'em listen, the second one usually does."',
    effects: [
      { type: 'stat', stat: 'combat', value: 13, description: '+13 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 25, description: '+25% damage vs multiple enemies' }
    ]
  },

  // Frontera Quest Reward (L17)
  {
    itemId: 'smugglers-derringer',
    name: "Smuggler's Derringer",
    description: 'A tiny pistol that fits in your boot. Frontera\'s favorite insurance policy.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 17,
    icon: '🔫',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"A gentleman always has a backup plan. And a lady has two."',
    effects: [
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'special', value: 20, description: '+20% escape chance when captured' }
    ]
  }
];

export const frontierJusticeArmor: Partial<IItem>[] = [
  // Colonel Blackwood Drop (L25)
  {
    itemId: 'union-officers-coat',
    name: "Union Officer's Coat",
    description: 'Blackwood\'s dress uniform. The medals still gleam, the buttons still shine.',
    type: 'armor',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 25,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"I wore this coat at Gettysburg. It carries their memory."',
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 15, description: '+15% ally damage in group combat' }
    ]
  },

  // McCray Twins Drop (L20)
  {
    itemId: 'legendary-duster-coat',
    name: 'Legendary Duster Coat',
    description: 'Frank McCray\'s signature coat. Billows dramatically in the wind and gunfire.',
    type: 'armor',
    rarity: 'epic',
    price: 1400,
    sellPrice: 700,
    inShop: false,
    levelRequired: 20,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"A man\'s got to look good when he\'s running from the law."',
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'special', value: 20, description: '+20% evasion chance' }
    ]
  },

  // Mining Enforcer Drop (L22)
  {
    itemId: 'mining-foreman-coat',
    name: "Mining Foreman's Coat",
    description: 'Heavy leather coat reinforced with metal plates. Volkov wore it like armor.',
    type: 'armor',
    rarity: 'epic',
    price: 1800,
    sellPrice: 900,
    inShop: false,
    levelRequired: 22,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The workers feared this coat more than the mine collapse."',
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 25, description: '+25% damage resistance' }
    ]
  },

  // Sheriff Barnes Drop (L18)
  {
    itemId: 'badge-of-false-authority',
    name: 'Badge of False Authority',
    description: 'Sheriff Barnes\' star badge. Tarnished by corruption but still commands fear.',
    type: 'armor',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 18,
    icon: '⭐',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The law is what I say it is." - Sheriff Barnes',
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'special', value: 20, description: '+20% intimidation success' }
    ]
  },

  // Nahi Quest Reward (L21)
  {
    itemId: 'tribal-war-paint',
    name: 'Tribal War Paint',
    description: 'Sacred pigments blessed by the Kaiowa elders. Applied before battle for protection.',
    type: 'armor',
    rarity: 'rare',
    price: 700,
    sellPrice: 350,
    inShop: false,
    levelRequired: 21,
    icon: '🎨',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The spirits guide your hand and shield your heart."',
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'special', value: 30, description: '+30% stealth in wilderness' }
    ]
  },

  // Frontera Quest Reward (L17)
  {
    itemId: 'smugglers-vest',
    name: "Smuggler's Vest",
    description: 'A vest with many hidden pockets. Perfect for moving goods past checkpoints.',
    type: 'armor',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 17,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"You\'d be amazed what fits in these pockets."',
    effects: [
      { type: 'stat', stat: 'cunning', value: 7, description: '+7 Cunning' },
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 25, description: '+25% chance to avoid detection' }
    ]
  },

  // Settler Quest Reward (L19)
  {
    itemId: 'settlers-reinforced-jacket',
    name: "Settler's Reinforced Jacket",
    description: 'A sturdy jacket reinforced with leather patches. Built to last through hard times.',
    type: 'armor',
    rarity: 'uncommon',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 19,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Pa always said a good jacket is worth its weight in gold."',
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'stat', stat: 'craft', value: 4, description: '+4 Craft' },
      { type: 'special', value: 15, description: '+15% equipment durability' }
    ]
  }
];

export const frontierJusticeAccessories: Partial<IItem>[] = [
  // Mining Enforcer Drop (L22)
  {
    itemId: 'russian-cross-pendant',
    name: 'Russian Cross Pendant',
    description: 'Volkov\'s Orthodox cross. He clutched it when he fell.',
    type: 'accessory',
    rarity: 'epic',
    price: 1600,
    sellPrice: 800,
    inShop: false,
    levelRequired: 22,
    icon: '✝️',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Боже, спаси меня..." (God, save me...)',
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 20, description: '+20% damage reduction when below 25% HP' }
    ]
  },

  // McCray Twins Drop (L20)
  {
    itemId: 'mccray-bandolier',
    name: 'McCray Bandolier',
    description: 'Jesse McCray\'s ammunition belt. Still has powder burns from the last heist.',
    type: 'accessory',
    rarity: 'epic',
    price: 1300,
    sellPrice: 650,
    inShop: false,
    levelRequired: 20,
    icon: '🎒',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Never run out of bullets. Rule number one of train robbing."',
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', value: 50, description: '+50% ammunition capacity' }
    ]
  },

  // Sheriff Barnes Drop (L18)
  {
    itemId: 'barons-ledger',
    name: "Baron's Ledger",
    description: 'The cattle baron\'s financial records. Contains evidence and useful contacts.',
    type: 'accessory',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 18,
    icon: '📒',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Names, dates, amounts. Everything needed to bring down the whole operation."',
    effects: [
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 15, description: '+15% trading profit' }
    ]
  },

  // Colonel Blackwood Drop (L25)
  {
    itemId: 'railroad-shares',
    name: 'Railroad Shares',
    description: 'Stock certificates for the Transcontinental Railroad. Worth a fortune... if the Railroad survives.',
    type: 'accessory',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 25,
    icon: '📜',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Progress has a price. These shares represent that price."',
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 100, description: '+$100 passive income per day' }
    ]
  },

  // Colonel Blackwood Drop (L25)
  {
    itemId: 'command-train-deed',
    name: 'Command Train Deed',
    description: 'Ownership papers for the armored command train "The Manifest."',
    type: 'accessory',
    rarity: 'legendary',
    price: 10000,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 25,
    icon: '🚂',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The Manifest was Blackwood\'s mobile headquarters. Now it\'s yours."',
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', value: 0, description: 'Unlocks private train fast-travel' }
    ]
  }
];

export const frontierJusticeConsumables: Partial<IItem>[] = [
  // Crafted (L16)
  {
    itemId: 'frontier-whiskey',
    name: 'Frontier Whiskey',
    description: 'Strong whiskey that puts fire in your belly and courage in your heart.',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: true,
    levelRequired: 16,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    flavorText: '"Liquid courage. Every gunslinger\'s secret weapon."',
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 30 minutes' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit for 30 minutes' },
      { type: 'stat', stat: 'cunning', value: -2, description: '-2 Cunning for 30 minutes' }
    ]
  },

  // Nahi Crafted (L16)
  {
    itemId: 'pemmican-rations',
    name: 'Pemmican Rations',
    description: 'Traditional Nahi travel food. Dense, nutritious, and lasts forever.',
    type: 'consumable',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 16,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    flavorText: '"Our ancestors traveled the plains with nothing but pemmican and determination."',
    effects: [
      { type: 'health', value: 50, description: 'Restore 50 HP over time' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit for 1 hour' }
    ]
  },

  // Combat Item (L18)
  {
    itemId: 'smelling-salts',
    name: 'Smelling Salts',
    description: 'Strong ammonia salts that can revive someone from unconsciousness.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: true,
    levelRequired: 18,
    icon: '💊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    flavorText: '"One whiff of these and you\'ll be wide awake. Guaranteed."',
    effects: [
      { type: 'special', value: 30, description: 'Restore 30% HP when knocked out' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 5 minutes' }
    ]
  },

  // Crafted (L20)
  {
    itemId: 'dynamite-bundle',
    name: 'Dynamite Bundle',
    description: 'Three sticks of dynamite bundled together. Handle with extreme care.',
    type: 'consumable',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 20,
    icon: '💣',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    flavorText: '"When persuasion fails, dynamite speaks volumes."',
    effects: [
      { type: 'combat_score', value: 200, description: 'Deal 200 AoE damage' },
      { type: 'special', value: 50, description: '50% chance to stun enemies' }
    ]
  },

  // Crafted (L17)
  {
    itemId: 'antidote-kit',
    name: 'Antidote Kit',
    description: 'A leather pouch containing various antidotes for common poisons.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: true,
    levelRequired: 17,
    icon: '💉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    flavorText: '"Snake bites, bad water, poisoned arrows - this kit handles them all."',
    effects: [
      { type: 'special', value: 100, description: 'Remove all poison effects' },
      { type: 'health', value: 25, description: 'Restore 25 HP' }
    ]
  }
];

// Combined export for Phase 19.3 items
export const ALL_FRONTIER_JUSTICE_ITEMS: Partial<IItem>[] = [
  ...frontierJusticeWeapons,
  ...frontierJusticeArmor,
  ...frontierJusticeAccessories,
  ...frontierJusticeConsumables,
];
