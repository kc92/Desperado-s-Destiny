/**
 * Items Seed Data
 * Seed the database with shop items
 */

import { Item } from '../models/Item.model';

const shopItems = [
  // Weapons
  {
    itemId: 'rusty-revolver',
    name: 'Rusty Revolver',
    description: 'A worn six-shooter that still works',
    type: 'weapon',
    rarity: 'common',
    price: 100,
    sellPrice: 50,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' }
    ],
    levelRequired: 1,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'six-shooter',
    name: 'Six-Shooter',
    description: 'Standard issue frontier pistol',
    type: 'weapon',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' }
    ],
    levelRequired: 5,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'peacemaker',
    name: 'Peacemaker',
    description: 'The gun that won the West',
    type: 'weapon',
    rarity: 'rare',
    price: 2000,
    sellPrice: 1000,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' }
    ],
    levelRequired: 15,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'shotgun',
    name: 'Sawed-Off Shotgun',
    description: 'Devastating at close range',
    type: 'weapon',
    rarity: 'uncommon',
    price: 800,
    sellPrice: 400,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' }
    ],
    levelRequired: 8,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'bowie-knife',
    name: 'Bowie Knife',
    description: 'A large hunting knife',
    type: 'weapon',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    icon: '🔪',
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' }
    ],
    levelRequired: 1,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },

  // Armor
  {
    itemId: 'leather-vest',
    name: 'Leather Vest',
    description: 'Basic protection from the elements',
    type: 'armor',
    rarity: 'common',
    price: 200,
    sellPrice: 100,
    icon: '🦺',
    effects: [
      { type: 'stat', stat: 'hp', value: 5, description: '+5 HP' }
    ],
    levelRequired: 1,
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'duster',
    name: 'Reinforced Duster',
    description: 'A long coat with hidden plates',
    type: 'armor',
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    icon: '🧥',
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' }
    ],
    levelRequired: 5,
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'cavalry-boots',
    name: 'Cavalry Boots',
    description: 'Sturdy military-grade footwear',
    type: 'armor',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    icon: '👢',
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ],
    levelRequired: 1,
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'stetson',
    name: 'Fine Stetson',
    description: 'A quality wide-brimmed hat',
    type: 'armor',
    rarity: 'uncommon',
    price: 400,
    sellPrice: 200,
    icon: '🤠',
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' }
    ],
    levelRequired: 5,
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },

  // Consumables
  {
    itemId: 'whiskey',
    name: 'Whiskey',
    description: 'Restores energy quickly',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 10,
    icon: '🥃',
    effects: [
      { type: 'energy', stat: 'energy', value: 10, description: '+10 Energy' }
    ],
    levelRequired: 1,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99
  },
  {
    itemId: 'tequila',
    name: 'Fine Tequila',
    description: 'Premium spirit from Mexico',
    type: 'consumable',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 35,
    icon: '🍾',
    effects: [
      { type: 'energy', stat: 'energy', value: 25, description: '+25 Energy' }
    ],
    levelRequired: 5,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99
  },
  {
    itemId: 'bandages',
    name: 'Bandages',
    description: 'Basic medical supplies',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    icon: '🩹',
    effects: [
      { type: 'health', stat: 'hp', value: 20, description: 'Heal 20 HP' }
    ],
    levelRequired: 1,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99
  },
  {
    itemId: 'snake-oil',
    name: 'Snake Oil',
    description: 'Mysterious cure-all tonic',
    type: 'consumable',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    icon: '🧪',
    effects: [
      { type: 'special', stat: 'energy', value: 1, description: 'Remove Wanted Level' }
    ],
    levelRequired: 10,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99
  },
  {
    itemId: 'dynamite',
    name: 'Dynamite',
    description: 'Handle with extreme care',
    type: 'consumable',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    icon: '🧨',
    effects: [
      { type: 'special', stat: 'combat', value: 50, description: '+50% Crime Success' }
    ],
    levelRequired: 15,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10
  },

  // Mounts
  {
    itemId: 'mule',
    name: 'Old Mule',
    description: 'Slow but reliable',
    type: 'mount',
    rarity: 'common',
    price: 500,
    sellPrice: 250,
    icon: '🫏',
    effects: [
      { type: 'special', stat: 'spirit', value: 10, description: '-10% Travel Time' }
    ],
    levelRequired: 1,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'mustang',
    name: 'Mustang',
    description: 'Wild horse of the plains',
    type: 'mount',
    rarity: 'uncommon',
    price: 2000,
    sellPrice: 1000,
    icon: '🐎',
    effects: [
      { type: 'special', stat: 'spirit', value: 25, description: '-25% Travel Time' }
    ],
    levelRequired: 10,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },
  {
    itemId: 'appaloosa',
    name: 'Appaloosa',
    description: 'Prized spotted horse',
    type: 'mount',
    rarity: 'rare',
    price: 5000,
    sellPrice: 2500,
    icon: '🐴',
    effects: [
      { type: 'special', stat: 'spirit', value: 40, description: '-40% Travel Time' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ],
    levelRequired: 20,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  },

  // ========================================
  // LEGENDARY ITEMS
  // Storied gear with unique abilities and trade-offs
  // ========================================

  // Legendary Weapon 1: The Widowmaker
  {
    itemId: 'widowmaker',
    name: 'The Widowmaker',
    description: 'John "Black Jack" Ketchum\'s personal revolver. Every notch on the grip is a lawman. The gun shoots true, but it brings the law down on whoever carries it. They say Black Jack still wants it back.',
    type: 'weapon',
    rarity: 'legendary',
    price: 25000,
    sellPrice: 12500,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', stat: 'combat', value: -20, description: '+20% Wanted Level Gain' }
    ],
    levelRequired: 35,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Weapon 2: Grandfather's Tomahawk
  {
    itemId: 'grandfathers-tomahawk',
    name: 'Grandfather\'s Tomahawk',
    description: 'A Kaiowa war tomahawk passed down seven generations. The blade has never been sharpened - it doesn\'t need to be. Honors the old ways: devastatingly effective in melee, useless at range.',
    type: 'weapon',
    rarity: 'legendary',
    price: 20000,
    sellPrice: 10000,
    icon: '🪓',
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat (Melee Only)' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', stat: 'combat', value: -50, description: '-50% Ranged Damage' }
    ],
    levelRequired: 30,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Armor 3: The Preacher's Coat
  {
    itemId: 'preachers-coat',
    name: 'The Preacher\'s Coat',
    description: 'Reverend Morrison wore this coat when he walked into the Crimson Saloon and talked down the Dalton brothers without drawing iron. Bullet holes from that night are still stitched shut. Protects the body but demands you talk before you shoot.',
    type: 'armor',
    rarity: 'legendary',
    price: 18000,
    sellPrice: 9000,
    icon: '🧥',
    effects: [
      { type: 'stat', stat: 'hp', value: 50, description: '+50 HP' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', stat: 'combat', value: -15, description: '-15% First Strike Damage' }
    ],
    levelRequired: 28,
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Mount 4: El Muerto
  {
    itemId: 'el-muerto',
    name: 'El Muerto',
    description: 'A pale stallion that appeared the night the Sangre River ran red. No one has ever seen it eat or drink. Faster than any living horse, but horses shy away from it, and dogs howl when it passes. Some say it\'s the Pale Rider\'s steed, waiting for its master.',
    type: 'mount',
    rarity: 'legendary',
    price: 50000,
    sellPrice: 25000,
    icon: '🐴',
    effects: [
      { type: 'special', stat: 'spirit', value: 60, description: '-60% Travel Time' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', stat: 'spirit', value: -20, description: '-20% NPC Trust' }
    ],
    levelRequired: 40,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Accessory 5: The Devil's Eye
  {
    itemId: 'devils-eye',
    name: 'The Devil\'s Eye',
    description: 'A blood-red ruby supposedly cut from a larger stone in the court of Montezuma. Baron Von Steiger acquired it, then lost everything. It shows you what people truly want - but that knowledge comes at a cost.',
    type: 'armor',
    rarity: 'legendary',
    price: 30000,
    sellPrice: 15000,
    icon: '💎',
    effects: [
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', stat: 'hp', value: -10, description: '-10 Max HP' }
    ],
    levelRequired: 35,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Armor 6: Ironhide's Badge
  {
    itemId: 'ironhides-badge',
    name: 'Ironhide\'s Badge',
    description: 'Marshal Samuel "Ironhide" Tanner\'s badge, worn through 47 gunfights. He never lost. He also never made a friend or showed mercy. The badge grants protection but demands the law be served - cold.',
    type: 'armor',
    rarity: 'legendary',
    price: 22000,
    sellPrice: 11000,
    icon: '⭐',
    effects: [
      { type: 'stat', stat: 'hp', value: 35, description: '+35 HP' },
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', stat: 'spirit', value: -25, description: '-25% Crime Rewards' }
    ],
    levelRequired: 32,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Weapon 7: The Last Word
  {
    itemId: 'last-word',
    name: 'The Last Word',
    description: 'A ornate rifle commissioned by a dying cattle baron to settle a 40-year feud. The engraving reads: "For my enemy - the last word is mine." Perfect for one shot. Useless for the second.',
    type: 'weapon',
    rarity: 'legendary',
    price: 28000,
    sellPrice: 14000,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 40, description: '+40 Combat (First Shot)' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', stat: 'combat', value: -30, description: '-30% Sustained Combat' }
    ],
    levelRequired: 38,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Armor 8: La Llorona's Shawl
  {
    itemId: 'la-lloronas-shawl',
    name: 'La Llorona\'s Shawl',
    description: 'A mourning shawl found near the river where children go missing. It whispers warnings of danger - but also cries constantly. The weeping never stops. Saves your life, costs your sanity.',
    type: 'armor',
    rarity: 'legendary',
    price: 19000,
    sellPrice: 9500,
    icon: '🧣',
    effects: [
      { type: 'stat', stat: 'spirit', value: 30, description: '+30 Spirit' },
      { type: 'special', stat: 'hp', value: 25, description: '+25% Ambush Detection' },
      { type: 'special', stat: 'energy', value: -5, description: '-5 Max Energy' }
    ],
    levelRequired: 25,
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Weapon 9: The Gambler's Derringer
  {
    itemId: 'gamblers-derringer',
    name: 'The Gambler\'s Derringer',
    description: 'Doc Holliday\'s backup piece, hidden up his sleeve through a hundred card games. Tiny, easily concealed, and loaded with luck. But luck runs both ways, and the house always wins eventually.',
    type: 'weapon',
    rarity: 'legendary',
    price: 15000,
    sellPrice: 7500,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'cunning', value: 20, description: '+20 Cunning' },
      { type: 'special', stat: 'combat', value: 30, description: '+30% Critical Hit Chance' },
      { type: 'special', stat: 'combat', value: -10, description: '-10% Base Damage' }
    ],
    levelRequired: 22,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // Legendary Armor 10: The Sundance Spurs
  {
    itemId: 'sundance-spurs',
    name: 'The Sundance Spurs',
    description: 'Silver spurs worn by the Sundance Kid on his last ride to Bolivia. They\'ve seen more borders crossed than any map shows. Grant incredible speed and evasion, but they only run one direction - away.',
    type: 'armor',
    rarity: 'legendary',
    price: 24000,
    sellPrice: 12000,
    icon: '👢',
    effects: [
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', stat: 'spirit', value: 40, description: '+40% Escape Chance' },
      { type: 'special', stat: 'combat', value: -20, description: '-20% Stand Your Ground Bonus' }
    ],
    levelRequired: 30,
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // BOSS DROP LEGENDARY ITEMS
  // Exclusive drops from boss encounters
  // ========================================

  {
    itemId: 'wardens-lantern',
    name: 'Warden\'s Lantern',
    description: 'The ghostly lantern carried by the Warden of Perdition. Its flame never dies, revealing secrets in the darkness. Some say it shows the way to buried treasure - others say it leads to damnation.',
    type: 'armor',
    rarity: 'legendary',
    price: 35000,
    sellPrice: 17500,
    icon: '🏮',
    effects: [
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', stat: 'spirit', value: 50, description: '+50% Hidden Item Detection' }
    ],
    levelRequired: 25,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'carniceros-cleaver',
    name: 'El Carnicero\'s Cleaver',
    description: 'The massive blade used by the infamous butcher of Sangre Canyon. The edge never dulls, and it seems to grow heavier with each kill. They say it hungers for more.',
    type: 'weapon',
    rarity: 'legendary',
    price: 38000,
    sellPrice: 19000,
    icon: '🔪',
    effects: [
      { type: 'stat', stat: 'combat', value: 35, description: '+35 Combat' },
      { type: 'special', stat: 'combat', value: 25, description: '+25% Bleed Damage' },
      { type: 'special', stat: 'spirit', value: -15, description: '-15 Spirit' }
    ],
    levelRequired: 30,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'pale-riders-pistol',
    name: 'Pale Rider\'s Pistol',
    description: 'A bone-white revolver that fires without smoke or sound. The bullets leave no wound - the target simply stops living. It belonged to Death itself, or so they say.',
    type: 'weapon',
    rarity: 'legendary',
    price: 45000,
    sellPrice: 22500,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat' },
      { type: 'stat', stat: 'cunning', value: 20, description: '+20 Cunning' },
      { type: 'special', stat: 'combat', value: 100, description: 'Guaranteed Critical on Killing Blow' }
    ],
    levelRequired: 35,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'wendigo-fang',
    name: 'Wendigo Fang',
    description: 'A tooth from the legendary Wendigo of the northern woods. Ice cold to the touch, it never warms. Those who carry it feel the creature\'s endless hunger gnawing at their soul.',
    type: 'armor',
    rarity: 'legendary',
    price: 40000,
    sellPrice: 20000,
    icon: '🦷',
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', stat: 'hp', value: 30, description: '+30% Life Steal' },
      { type: 'special', stat: 'energy', value: -10, description: '-10% Energy Regen' }
    ],
    levelRequired: 32,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'generals-saber',
    name: 'General\'s Saber',
    description: 'The ceremonial saber of General Sangre, stained red from the Massacre at Perdition Creek. A symbol of authority and brutality that inspires terror in all who face it.',
    type: 'weapon',
    rarity: 'legendary',
    price: 42000,
    sellPrice: 21000,
    icon: '⚔️',
    effects: [
      { type: 'stat', stat: 'combat', value: 28, description: '+28 Combat' },
      { type: 'stat', stat: 'cunning', value: 12, description: '+12 Cunning' },
      { type: 'special', stat: 'combat', value: 20, description: '+20% Intimidation' }
    ],
    levelRequired: 38,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // QUEST REWARD ITEMS
  // Unique items earned from completing quests
  // ========================================

  {
    itemId: 'spirit-touched-compass',
    name: 'Spirit-Touched Compass',
    description: 'A compass blessed by Nahi elders. Its needle points toward what you need, not what you want.',
    type: 'armor',
    rarity: 'rare',
    price: 5000,
    sellPrice: 2500,
    icon: '🧭',
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', stat: 'spirit', value: 25, description: '+25% Quest Item Find Rate' }
    ],
    levelRequired: 10,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'derby-winner-badge',
    name: 'Derby Winner Badge',
    description: 'Proof of victory in the annual Red Gulch Derby. Opens doors in high society.',
    type: 'armor',
    rarity: 'rare',
    price: 3000,
    sellPrice: 1500,
    icon: '🏆',
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ],
    levelRequired: 8,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'miners-gratitude-pick',
    name: 'Miner\'s Gratitude Pick',
    description: 'A masterwork pickaxe gifted by the miners you saved from the cave-in.',
    type: 'weapon',
    rarity: 'rare',
    price: 4500,
    sellPrice: 2250,
    icon: '⛏️',
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'special', stat: 'craft', value: 20, description: '+20% Mining Yield' }
    ],
    levelRequired: 12,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'catacombs-key',
    name: 'Catacombs Key',
    description: 'An ancient key to the catacombs beneath the old mission. What secrets lie below?',
    type: 'quest',
    rarity: 'epic',
    price: 0,
    sellPrice: 0,
    icon: '🗝️',
    effects: [],
    levelRequired: 15,
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'whitmores-lucky-coin',
    name: 'Whitmore\'s Lucky Coin',
    description: 'The coin Ezekiel Whitmore flipped before every successful heist. Maybe luck can be passed on.',
    type: 'armor',
    rarity: 'epic',
    price: 8000,
    sellPrice: 4000,
    icon: '🪙',
    effects: [
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', stat: 'cunning', value: 10, description: '+10% Crime Success' }
    ],
    levelRequired: 18,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'gatling-operators-manual',
    name: 'Gatling Operator\'s Manual',
    description: 'Technical manual for operating a Gatling gun. Knowledge is power.',
    type: 'quest',
    rarity: 'rare',
    price: 0,
    sellPrice: 0,
    icon: '📖',
    effects: [],
    levelRequired: 20,
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'bank-blueprints',
    name: 'Bank Blueprints',
    description: 'Detailed architectural plans of the Frontier Bank. Very valuable to the right people.',
    type: 'quest',
    rarity: 'rare',
    price: 0,
    sellPrice: 0,
    icon: '📜',
    effects: [],
    levelRequired: 22,
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'gamblers-lucky-chip',
    name: 'Gambler\'s Lucky Chip',
    description: 'A poker chip from the legendary game at the Silver Moon Saloon. Its owner never lost.',
    type: 'armor',
    rarity: 'rare',
    price: 6000,
    sellPrice: 3000,
    icon: '🎰',
    effects: [
      { type: 'stat', stat: 'cunning', value: 12, description: '+12 Cunning' },
      { type: 'special', stat: 'cunning', value: 15, description: '+15% Destiny Deck Bonus' }
    ],
    levelRequired: 15,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'railroad-share-certificate',
    name: 'Railroad Share Certificate',
    description: 'Shares in the Trans-Continental Railroad. These will be worth a fortune someday.',
    type: 'quest',
    rarity: 'epic',
    price: 10000,
    sellPrice: 5000,
    icon: '📃',
    effects: [
      { type: 'special', stat: 'craft', value: 5, description: '+5% Daily Gold Income' }
    ],
    levelRequired: 25,
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    inShop: false
  },

  {
    itemId: 'castellano-ring',
    name: 'Castellano Ring',
    description: 'The signet ring of the Castellano family, rulers of the old territory. Grants influence in certain circles.',
    type: 'armor',
    rarity: 'epic',
    price: 12000,
    sellPrice: 6000,
    icon: '💍',
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', stat: 'spirit', value: 20, description: '+20% Frontera Reputation' }
    ],
    levelRequired: 28,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'territorys-future',
    name: 'Territory\'s Future',
    description: 'A mysterious artifact that represents the destiny of the Sangre Territory. Its true power is unknown.',
    type: 'quest',
    rarity: 'legendary',
    price: 0,
    sellPrice: 0,
    icon: '🌟',
    effects: [
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' },
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning' },
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' }
    ],
    levelRequired: 40,
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'skinwalker-fang',
    name: 'Skinwalker Fang',
    description: 'A fang from a defeated skinwalker. Carries dark power that should not be trifled with.',
    type: 'material',
    rarity: 'epic',
    price: 7500,
    sellPrice: 3750,
    icon: '🦷',
    effects: [],
    levelRequired: 20,
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    inShop: false
  }
];

/**
 * Seed items into database
 */
export async function seedItems(): Promise<void> {
  console.log('Seeding items...');

  for (const item of shopItems) {
    await Item.findOneAndUpdate(
      { itemId: item.itemId },
      item,
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${shopItems.length} items`);
}

/**
 * Clear all items
 */
export async function clearItems(): Promise<void> {
  await Item.deleteMany({});
  console.log('Cleared all items');
}
