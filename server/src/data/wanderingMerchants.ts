/**
 * Wandering Merchant NPCs Data
 *
 * Phase 4, Wave 4.1 - Traveling Merchant NPCs
 *
 * 10 wandering merchants who travel between locations on set routes,
 * selling unique goods and adding life to the world.
 */

import { NPCSchedule, NPCActivity, ScheduleEntry } from '@desperados/shared';
import { ItemRarity } from '../models/Item.model';

/**
 * Route stop interface - defines where and when a merchant stops
 */
export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;      // Day of week (1=Monday, 7=Sunday)
  departureDay: number;
  arrivalHour: number;      // Hour of arrival (0-23)
  departureHour: number;    // Hour of departure (0-23)
}

/**
 * Shop item for wandering merchant
 */
export interface MerchantItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  rarity: ItemRarity;
  type: 'weapon' | 'armor' | 'consumable' | 'mount' | 'material' | 'quest';
  trustRequired?: number;   // Trust level required (0-5), default 0
  quantity?: number;        // Limited stock
  isExclusive?: boolean;    // Only this merchant sells it
}

/**
 * Merchant dialogue by context
 */
export interface MerchantDialogue {
  greeting: string[];
  trading: string[];
  departure: string[];
  busy: string[];
  trust: {
    low: string[];      // Trust 0-1
    medium: string[];   // Trust 2-3
    high: string[];     // Trust 4-5
  };
}

/**
 * Trust unlock - special items/prices available at higher trust
 */
export interface TrustUnlock {
  level: number;
  benefit: string;
  description: string;
}

/**
 * Complete wandering merchant definition
 */
export interface WanderingMerchant {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  faction: string;
  route: RouteStop[];
  schedule: NPCSchedule;        // Full day schedule
  inventory: MerchantItem[];
  dialogue: MerchantDialogue;
  specialFeatures: string[];
  trustLevels: TrustUnlock[];
  barter?: boolean;             // Uses barter instead of gold
  hidden?: boolean;             // Must be discovered
  discoveryCondition?: string;
}

// ========================================
// MERCHANT #1: "Honest" Abe Greenwald
// ========================================
export const HONEST_ABE: WanderingMerchant = {
  id: 'merchant_honest_abe',
  name: '"Honest" Abe Greenwald',
  title: 'General Goods Trader',
  description: 'A rotund, cheerful merchant with a wagon full of essential supplies. Despite his nickname being ironic (earned after a card game incident), he genuinely is one of the most reliable traders in Sangre Territory.',
  personality: 'Jovial, honest (now), tells bad jokes, knows everyone in every town',
  faction: 'SETTLER_ALLIANCE',
  route: [
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 1,    // Monday
      departureDay: 2,  // Tuesday
      arrivalHour: 8,
      departureHour: 16
    },
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 2,    // Tuesday
      departureDay: 4,  // Thursday
      arrivalHour: 20,
      departureHour: 10
    },
    {
      locationId: '6501a0000000000000000003', // Fort Ashford
      locationName: 'Fort Ashford',
      arrivalDay: 4,    // Thursday
      departureDay: 6,  // Saturday
      arrivalHour: 14,
      departureHour: 12
    }
  ],
  schedule: {
    npcId: 'merchant_honest_abe',
    npcName: '"Honest" Abe Greenwald',
    homeLocation: '6501a0000000000000000001', // Red Gulch
    defaultSchedule: [
      {
        hour: 0,
        endHour: 6,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'ZZZ... Come back when the sun\'s up!'
      },
      {
        hour: 6,
        endHour: 8,
        activity: NPCActivity.EATING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: true,
        dialogue: 'Having breakfast. Care for some coffee?'
      },
      {
        hour: 8,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'current_town',
        locationName: 'Town Square',
        interruptible: true,
        dialogue: 'Open for business! Best prices in the territory!'
      },
      {
        hour: 18,
        endHour: 20,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'local_saloon',
        locationName: 'Local Saloon',
        interruptible: true,
        dialogue: 'Relaxing with a drink. What can I get you?'
      },
      {
        hour: 20,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Closed for the night!'
      }
    ]
  },
  inventory: [
    // Common essentials
    {
      itemId: 'abe_bandages',
      name: 'Quality Bandages',
      description: 'Better than average medical wraps',
      price: 8,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'abe_rope',
      name: 'Sturdy Rope',
      description: '100ft of reliable hemp rope',
      price: 15,
      rarity: 'common',
      type: 'material'
    },
    {
      itemId: 'abe_ammunition_pistol',
      name: 'Pistol Ammunition Box',
      description: 'Box of 50 .45 caliber rounds',
      price: 25,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'abe_ammunition_rifle',
      name: 'Rifle Ammunition Box',
      description: 'Box of 40 .44-40 rounds',
      price: 35,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'abe_toolkit',
      name: 'Basic Tool Kit',
      description: 'Hammer, nails, saw - frontier essentials',
      price: 50,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'abe_canteen',
      name: 'Military Canteen',
      description: 'Surplus Army canteen, keeps water cool',
      price: 30,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'abe_lantern',
      name: 'Brass Oil Lantern',
      description: 'Quality lantern with adjustable wick',
      price: 40,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'abe_bedroll',
      name: 'Frontier Bedroll',
      description: 'Waterproof bedroll for camping',
      price: 45,
      rarity: 'common',
      type: 'material'
    },
    // Trust-gated items
    {
      itemId: 'abe_revolver_special',
      name: 'Abe\'s "Friend Price" Revolver',
      description: 'A very nice revolver sold at cost to friends',
      price: 150,
      rarity: 'rare',
      type: 'weapon',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'abe_lucky_coin',
      name: 'Abe\'s Lucky Coin',
      description: 'His personal lucky coin. Must really trust you to sell this.',
      price: 100,
      rarity: 'rare',
      type: 'quest',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Howdy partner! Abe\'s the name, trading\'s the game!',
      'Welcome, welcome! Everything you need and nothing you don\'t!',
      'Step right up! Old Abe never cheats a customer... anymore.',
      'Good to see a friendly face! What can I interest you in today?'
    ],
    trading: [
      'Fair price, square deal - that\'s my motto these days.',
      'Quality goods at honest prices. I learned my lesson about cheating.',
      'That\'ll serve you well out in the territories.',
      'Can\'t go wrong with that purchase, friend.'
    ],
    departure: [
      'Time to hit the trail! See you on my next round!',
      'Wagon\'s packed, horses are ready. Until next time!',
      'Gotta keep moving. These goods won\'t sell themselves!',
      'Safe travels, friend! I\'ll be back through soon.'
    ],
    busy: [
      'Give me a minute here, I\'m in the middle of something.',
      'Hang on, just finishing up some business.',
      'One customer at a time, friend. Be right with you.'
    ],
    trust: {
      low: [
        'First time customer? Welcome!',
        'Everything\'s fairly priced, you can trust me... now.',
        'Take a look around, lots of good stuff.'
      ],
      medium: [
        'Good to see a repeat customer!',
        'I remember you - treated you right last time, didn\'t I?',
        'I might have something special for a regular customer...'
      ],
      high: [
        'My friend! Come, come - let me show you the good stuff!',
        'For you, my friend, I have special prices.',
        'I saved something special, just for you. Take a look at this...'
      ]
    }
  },
  specialFeatures: [
    'Bulk discount (10% off for 5+ items)',
    'Will buy items from players at 60% value (better than standard 50%)',
    'Knows gossip from every town on his route',
    'Can deliver messages between towns for 5 gold'
  ],
  trustLevels: [
    { level: 2, benefit: '5% discount on all purchases', description: 'Abe considers you a regular' },
    { level: 3, benefit: 'Access to "Friend Price" special weapons', description: 'Abe trusts you enough to offer rare items' },
    { level: 4, benefit: '10% discount on all purchases', description: 'Abe considers you a true friend' },
    { level: 5, benefit: 'Access to his personal lucky items', description: 'Abe trusts you completely' }
  ]
};

// ========================================
// MERCHANT #2: Maria "La Vendedora" Santos
// ========================================
export const MARIA_LA_VENDEDORA: WanderingMerchant = {
  id: 'merchant_maria_santos',
  name: 'Maria "La Vendedora" Santos',
  title: 'Exotic Goods Trader',
  description: 'A sharp-eyed Mexican woman in her 40s who knows everyone\'s secrets. Her wagon carries spices, textiles, and fine goods from across the border. She trades in information as much as merchandise.',
  personality: 'Shrewd, observant, knows everyone\'s business, never forgets a face or a debt',
  faction: 'FRONTERA',
  route: [
    {
      locationId: '6501a0000000000000000002', // The Frontera
      locationName: 'The Frontera',
      arrivalDay: 1,    // Monday
      departureDay: 3,  // Wednesday
      arrivalHour: 10,
      departureHour: 8
    },
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 3,    // Wednesday
      departureDay: 5,  // Friday
      arrivalHour: 14,
      departureHour: 10
    },
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 5,    // Friday
      departureDay: 7,  // Sunday
      arrivalHour: 16,
      departureHour: 14
    }
  ],
  schedule: {
    npcId: 'merchant_maria_santos',
    npcName: 'Maria "La Vendedora" Santos',
    homeLocation: '6501a0000000000000000002', // The Frontera
    defaultSchedule: [
      {
        hour: 0,
        endHour: 5,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: false,
        dialogue: 'Even La Vendedora must sleep.'
      },
      {
        hour: 5,
        endHour: 7,
        activity: NPCActivity.PRAYING,
        locationId: 'local_church',
        locationName: 'Church/Shrine',
        interruptible: false,
        dialogue: 'Praying. Come back later.'
      },
      {
        hour: 7,
        endHour: 9,
        activity: NPCActivity.EATING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: true,
        dialogue: 'Having coffee. Join me?'
      },
      {
        hour: 9,
        endHour: 19,
        activity: NPCActivity.WORKING,
        locationId: 'current_town',
        locationName: 'Market Square',
        interruptible: true,
        dialogue: 'Looking for something special, mi amigo?'
      },
      {
        hour: 19,
        endHour: 22,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'local_cantina',
        locationName: 'Cantina/Saloon',
        interruptible: true,
        dialogue: 'Information costs, just like everything else.'
      },
      {
        hour: 22,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: false,
        dialogue: 'Closed. Come back in the morning.'
      }
    ]
  },
  inventory: [
    // Mexican imports
    {
      itemId: 'maria_tequila',
      name: 'Fine Tequila',
      description: 'Premium añejo tequila from Jalisco',
      price: 45,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'maria_spices',
      name: 'Mexican Spice Collection',
      description: 'Chili peppers, cumin, cinnamon and more',
      price: 30,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'maria_poncho',
      name: 'Handwoven Poncho',
      description: 'Traditional serape in vibrant colors',
      price: 60,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'maria_sombrero',
      name: 'Wide-Brim Sombrero',
      description: 'Keeps the sun off and looks stylish',
      price: 40,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'maria_tobacco',
      name: 'Premium Tobacco',
      description: 'Hand-rolled cigars from Mexico',
      price: 25,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'maria_silver_jewelry',
      name: 'Silver Jewelry',
      description: 'Handcrafted silver bracelet or necklace',
      price: 80,
      rarity: 'rare',
      type: 'armor'
    },
    {
      itemId: 'maria_textiles',
      name: 'Fine Textiles',
      description: 'Colorful woven fabrics and blankets',
      price: 55,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'maria_knife',
      name: 'Mexican Fighting Knife',
      description: 'Balanced blade with ornate handle',
      price: 70,
      rarity: 'rare',
      type: 'weapon'
    },
    // Trust-gated items
    {
      itemId: 'maria_information',
      name: 'Valuable Information',
      description: 'Maria knows things others don\'t...',
      price: 100,
      rarity: 'rare',
      type: 'quest',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'maria_revolver_el_rey',
      name: 'El Rey\'s Personal Revolver',
      description: 'A gift from Martinez himself. Very rare.',
      price: 500,
      rarity: 'epic',
      type: 'weapon',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Buenos días. What can La Vendedora do for you?',
      'Ah, I remember you. Come to see what treasures I have today?',
      'Welcome, amigo. I have just what you need... probably.',
      'Every item tells a story. Which story interests you?'
    ],
    trading: [
      'A wise purchase. This will serve you well.',
      'Excellent choice. I knew you had good taste.',
      'Ah, that one is special. Treat it with respect.',
      'A fair trade. Pleasure doing business with you.'
    ],
    departure: [
      'Time to move on. The road calls.',
      'I will be back. I always come back.',
      'Until we meet again, amigo.',
      'Safe travels. Watch out for bandits on the road.'
    ],
    busy: [
      'Un momento, por favor.',
      'Patience. I will be with you shortly.',
      'I am in the middle of something important.'
    ],
    trust: {
      low: [
        'I don\'t know you yet. Browse, but don\'t touch.',
        'New face. Maria watches everyone carefully.',
        'First time? I\'ll be watching you, stranger.'
      ],
      medium: [
        'Ah, I remember you. You paid on time last visit.',
        'A familiar face. Perhaps I have something special today...',
        'You\'ve been honest with me. I appreciate that.'
      ],
      high: [
        'My trusted friend! Come, sit. Let me show you my real inventory.',
        'For you, I have things I show to no one else.',
        'You keep my secrets, I keep yours. Now, what do you need?'
      ]
    }
  },
  specialFeatures: [
    'Sells information about other NPCs (100 gold per secret)',
    'Can smuggle items across the border (illegal but lucrative)',
    'Knows passwords to access Frontera illegal shops',
    'Will barter information for information'
  ],
  trustLevels: [
    { level: 2, benefit: 'Maria starts sharing minor gossip', description: 'You\'ve proven you can keep your mouth shut' },
    { level: 3, benefit: 'Access to black market connections', description: 'Maria trusts you with illegal dealings' },
    { level: 4, benefit: 'Reduced prices on rare items (15% off)', description: 'Maria considers you a confidant' },
    { level: 5, benefit: 'Access to El Rey\'s personal items', description: 'Maria trusts you with the most valuable secrets' }
  ]
};

// ========================================
// MERCHANT #3: Wong Chen
// ========================================
export const WONG_CHEN: WanderingMerchant = {
  id: 'merchant_wong_chen',
  name: 'Wong Chen',
  title: 'Chinese Herbalist',
  description: 'A quiet, middle-aged man who travels discreetly between Chinese communities. His wagon contains rare herbs, traditional medicines, and items from the homeland. He helps his people survive in a hostile land.',
  personality: 'Reserved, wise, protective of his community, speaks softly but carries deep knowledge',
  faction: 'CHINESE_DIASPORA',
  hidden: true,
  discoveryCondition: 'Find the Chinese community in Red Gulch (Laundry/Tea House) or gain reputation with Chinese NPCs',
  route: [
    {
      locationId: 'red_gulch_chinatown', // Hidden sub-location
      locationName: 'Red Gulch (Chinatown)',
      arrivalDay: 2,    // Tuesday
      departureDay: 4,  // Thursday
      arrivalHour: 9,
      departureHour: 18
    },
    {
      locationId: 'whiskey_bend_chinese_camp',
      locationName: 'Whiskey Bend (Chinese Camp)',
      arrivalDay: 5,    // Friday
      departureDay: 6,  // Saturday
      arrivalHour: 10,
      departureHour: 16
    },
    {
      locationId: 'railroad_chinese_workers',
      locationName: 'Railroad Construction Camp',
      arrivalDay: 7,    // Sunday
      departureDay: 1,  // Monday
      arrivalHour: 12,
      departureHour: 20
    }
  ],
  schedule: {
    npcId: 'merchant_wong_chen',
    npcName: 'Wong Chen',
    homeLocation: 'red_gulch_chinatown',
    defaultSchedule: [
      {
        hour: 0,
        endHour: 5,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: '...'
      },
      {
        hour: 5,
        endHour: 6,
        activity: NPCActivity.PRAYING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Morning meditation. Please, quiet.'
      },
      {
        hour: 6,
        endHour: 8,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Preparing medicines. Precise work.'
      },
      {
        hour: 8,
        endHour: 20,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Chinese Quarter',
        interruptible: true,
        dialogue: 'You speak with respect. I will help you.'
      },
      {
        hour: 20,
        endHour: 22,
        activity: NPCActivity.EATING,
        locationId: 'tea_house',
        locationName: 'Tea House',
        interruptible: true,
        dialogue: 'Tea? It helps calm the mind.'
      },
      {
        hour: 22,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Too late. Come back tomorrow.'
      }
    ]
  },
  inventory: [
    // Traditional medicines
    {
      itemId: 'wong_ginseng',
      name: 'Aged Ginseng Root',
      description: 'Rare root that restores energy and vitality',
      price: 60,
      rarity: 'rare',
      type: 'consumable'
    },
    {
      itemId: 'wong_herbal_tea',
      name: 'Healing Herbal Tea',
      description: 'Blend of medicinal herbs, very effective',
      price: 30,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'wong_tiger_balm',
      name: 'Tiger Balm Ointment',
      description: 'Soothes pain and heals wounds faster',
      price: 25,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'wong_acupuncture_kit',
      name: 'Acupuncture Needle Set',
      description: 'Traditional healing tools',
      price: 80,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'wong_silk_cloth',
      name: 'Fine Silk Cloth',
      description: 'Luxurious fabric from China',
      price: 100,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'wong_fireworks',
      name: 'Chinese Fireworks',
      description: 'Explosive powder in decorative tubes',
      price: 45,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'wong_tea_leaves',
      name: 'Premium Tea Leaves',
      description: 'Imported from Fujian province',
      price: 35,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'wong_jade_pendant',
      name: 'Jade Protection Pendant',
      description: 'Carved jade, believed to protect the wearer',
      price: 90,
      rarity: 'rare',
      type: 'armor'
    },
    // Trust-gated items
    {
      itemId: 'wong_family_recipe',
      name: 'Wong Family Healing Recipe',
      description: 'Secret recipe passed down for generations',
      price: 200,
      rarity: 'epic',
      type: 'quest',
      trustRequired: 4,
      quantity: 1,
      isExclusive: true
    },
    {
      itemId: 'wong_dragon_sword',
      name: 'Dragon-Etched Jian Sword',
      description: 'Ancestral blade of the Wong family',
      price: 400,
      rarity: 'legendary',
      type: 'weapon',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'You honor me with your visit.',
      'Welcome. You show respect, so I show respect.',
      'Not many outsiders find me. You are persistent.',
      'You seek wisdom, or medicine, or both?'
    ],
    trading: [
      'This will serve you well. Use it wisely.',
      'A good choice. Health is wealth.',
      'Traditional medicine, proven for centuries.',
      'May this bring you balance and health.'
    ],
    departure: [
      'I must go. My people in other camps need me.',
      'Until our paths cross again.',
      'Safe travels, friend.',
      'The road is long. I will see you when I return.'
    ],
    busy: [
      'Please wait. This preparation requires precision.',
      'One moment. I cannot rush this work.',
      'Patience, please. Medicine requires focus.'
    ],
    trust: {
      low: [
        'You are... not from the community.',
        'I do not know you. Browse, but carefully.',
        'Many outsiders cause trouble. I hope you are different.'
      ],
      medium: [
        'You return. You must find my medicines helpful.',
        'I remember you. You have been respectful.',
        'Perhaps you would like to see more rare items?'
      ],
      high: [
        'My friend. You have proven yourself trustworthy.',
        'You honor my people. I am grateful.',
        'For you, I have my family\'s most precious items. Look.'
      ]
    }
  },
  specialFeatures: [
    'Medicines are 25% more effective than standard versions',
    'Can teach player herbal medicine skill (if high trust)',
    'Provides quests to help oppressed Chinese workers',
    'Knows secret shortcuts between locations'
  ],
  trustLevels: [
    { level: 2, benefit: 'Reveals location of other Chinese communities', description: 'Wong sees you mean no harm' },
    { level: 3, benefit: '10% discount on all medicines', description: 'Wong considers you a friend of his people' },
    { level: 4, benefit: 'Access to family healing secrets', description: 'Wong trusts you with sacred knowledge' },
    { level: 5, benefit: 'Access to ancestral items and weapons', description: 'Wong considers you family' }
  ]
};

// ========================================
// MERCHANT #4: Old Silas the Tinker
// ========================================
export const OLD_SILAS: WanderingMerchant = {
  id: 'merchant_old_silas',
  name: 'Old Silas the Tinker',
  title: 'Traveling Inventor',
  description: 'An eccentric old man with wild white hair and oil-stained clothes. His wagon is a mobile workshop filled with gears, springs, and half-finished inventions. Some work brilliantly, others explode.',
  personality: 'Eccentric genius, forgetful, kind-hearted, talks to his inventions',
  faction: 'NEUTRAL',
  route: [
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 1,    // Monday
      departureDay: 2,  // Tuesday
      arrivalHour: 10,
      departureHour: 14
    },
    {
      locationId: '6501a0000000000000000003', // Fort Ashford
      locationName: 'Fort Ashford',
      arrivalDay: 2,    // Tuesday
      departureDay: 3,  // Wednesday
      arrivalHour: 18,
      departureHour: 12
    },
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 3,    // Wednesday
      departureDay: 4,  // Thursday
      arrivalHour: 16,
      departureHour: 10
    },
    {
      locationId: '6501a0000000000000000006', // Goldfinger's Mine
      locationName: "Goldfinger's Mine",
      arrivalDay: 4,    // Thursday
      departureDay: 5,  // Friday
      arrivalHour: 14,
      departureHour: 8
    },
    {
      locationId: '6501a0000000000000000009', // Dusty Trail
      locationName: 'Dusty Trail',
      arrivalDay: 5,    // Friday
      departureDay: 6,  // Saturday
      arrivalHour: 12,
      departureHour: 16
    },
    {
      locationId: '6501a000000000000000000a', // Longhorn Ranch
      locationName: 'Longhorn Ranch',
      arrivalDay: 6,    // Saturday
      departureDay: 7,  // Sunday
      arrivalHour: 20,
      departureHour: 10
    }
  ],
  schedule: {
    npcId: 'merchant_old_silas',
    npcName: 'Old Silas the Tinker',
    homeLocation: 'none', // True wanderer
    defaultSchedule: [
      {
        hour: 0,
        endHour: 4,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Workshop-Wagon',
        interruptible: false,
        dialogue: 'Best inventing hours! Come back when it\'s not genius time!'
      },
      {
        hour: 4,
        endHour: 8,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'ZZZ... Dreaming of gears and springs...'
      },
      {
        hour: 8,
        endHour: 10,
        activity: NPCActivity.EATING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: true,
        dialogue: 'Coffee and tinkering. Want to see my latest invention?'
      },
      {
        hour: 10,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'current_town',
        locationName: 'Town Square',
        interruptible: true,
        dialogue: 'Welcome to Silas\'s Curiosities! Everything works... mostly!'
      },
      {
        hour: 18,
        endHour: 20,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Perfecting a new gadget. Don\'t disturb the genius!'
      },
      {
        hour: 20,
        endHour: 24,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: true,
        dialogue: 'Evening inventing session! Want to help test something?'
      }
    ]
  },
  inventory: [
    // Mechanical items
    {
      itemId: 'silas_pocket_watch',
      name: 'Silas\'s Precision Pocket Watch',
      description: 'Incredibly accurate timepiece, never loses time',
      price: 120,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'silas_spyglass',
      name: 'Extendable Spyglass',
      description: 'See far distances with crystal-clear lenses',
      price: 90,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'silas_lockpick_set',
      name: 'Silas\'s Masterwork Lockpicks',
      description: 'Precision tools that make lockpicking easier',
      price: 150,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'silas_mechanical_hand',
      name: 'Clockwork Prosthetic Hand',
      description: 'Functional mechanical hand for the injured',
      price: 500,
      rarity: 'epic',
      type: 'armor'
    },
    {
      itemId: 'silas_spring_boots',
      name: 'Spring-Loaded Boots',
      description: 'Jump higher and run faster (probably)',
      price: 200,
      rarity: 'rare',
      type: 'armor'
    },
    {
      itemId: 'silas_goggles',
      name: 'Inventor\'s Magnifying Goggles',
      description: 'See tiny details with flip-down lenses',
      price: 80,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'silas_multitool',
      name: 'Silas\'s 20-in-1 Multitool',
      description: 'Swiss army knife on steroids',
      price: 110,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'silas_music_box',
      name: 'Mechanical Music Box',
      description: 'Plays beautiful music, soothes the soul',
      price: 75,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'silas_repair_kit',
      name: 'Universal Repair Kit',
      description: 'Fix almost anything mechanical',
      price: 95,
      rarity: 'uncommon',
      type: 'material'
    },
    // Trust-gated items
    {
      itemId: 'silas_auto_revolver',
      name: 'Silas\'s Auto-Loading Revolver',
      description: 'Revolutionary design - chambers load automatically!',
      price: 600,
      rarity: 'epic',
      type: 'weapon',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'silas_steam_horse',
      name: 'Mechanical Steam Horse (Blueprint)',
      description: 'Plans for a steam-powered mechanical mount',
      price: 1000,
      rarity: 'legendary',
      type: 'quest',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Ah! A customer! Or are you here to help me test something?',
      'Welcome, welcome! Careful of the spring traps!',
      'Perfect timing! I just finished a new invention!',
      'Hello there! Everything here is guaranteed to work... eventually!'
    ],
    trading: [
      'Excellent choice! That one only exploded once during testing!',
      'Ah, one of my finest works! Enjoy!',
      'Good eye! That\'s a particularly clever mechanism!',
      'You won\'t regret this! Probably!'
    ],
    departure: [
      'Time to roll onward! Inventions to perfect!',
      'Must keep moving! So many towns, so little time!',
      'Until next time! Try not to break it!',
      'Off I go! The open road calls to old Silas!'
    ],
    busy: [
      'Hold on, this gear is being finicky...',
      'One moment, almost got this spring tensioned right...',
      'Just a second, calibrating this doohickey...'
    ],
    trust: {
      low: [
        'New face! Welcome to Silas\'s Curiosities!',
        'First time? Let me show you the safe items first...',
        'Everything works! More or less!'
      ],
      medium: [
        'You again! Good, good! You didn\'t break the last thing I sold you!',
        'Ah, a repeat customer! Let me show you something special...',
        'You appreciate good craftsmanship! Here, look at this!'
      ],
      high: [
        'My friend! Come, come! I have prototypes I need someone smart to test!',
        'You understand my work! Let me show you my masterpieces!',
        'For you, I have my most advanced inventions! Revolutionary!'
      ]
    }
  },
  specialFeatures: [
    'Can repair broken items for a fee (50% of original cost)',
    'Offers random "experimental" items at 50% discount (may malfunction)',
    'Will create custom gadgets if you bring materials',
    'Has a small chance to give away inventions that don\'t work'
  ],
  trustLevels: [
    { level: 2, benefit: 'Access to "stable" experimental items', description: 'Silas trusts you to handle volatile gear' },
    { level: 3, benefit: 'Custom gadget crafting service', description: 'Silas will create items to your specifications' },
    { level: 4, benefit: '20% discount on all mechanical items', description: 'Silas considers you a fellow inventor' },
    { level: 5, benefit: 'Access to revolutionary prototypes', description: 'Silas shares his greatest inventions' }
  ]
};

// ========================================
// MERCHANT #5: "Snake Oil" Sally
// ========================================
export const SNAKE_OIL_SALLY: WanderingMerchant = {
  id: 'merchant_snake_oil_sally',
  name: '"Snake Oil" Sally Winchester',
  title: 'Medicine Show Proprietress',
  description: 'A charismatic showwoman in her 30s with a dazzling smile and quick tongue. Her wagon is painted with outrageous claims. Some of her tonics are legitimate, others are... questionable. She knows which is which.',
  personality: 'Charismatic charlatan, quick-witted, secretly has a heart of gold, believes in her own hype',
  faction: 'NEUTRAL',
  route: [
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 2,    // Tuesday
      departureDay: 3,  // Wednesday
      arrivalHour: 12,
      departureHour: 18
    },
    {
      locationId: '6501a0000000000000000003', // Fort Ashford
      locationName: 'Fort Ashford',
      arrivalDay: 4,    // Thursday
      departureDay: 5,  // Friday
      arrivalHour: 10,
      departureHour: 16
    },
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 6,    // Saturday
      departureDay: 7,  // Sunday
      arrivalHour: 14,
      departureHour: 20
    }
  ],
  schedule: {
    npcId: 'merchant_snake_oil_sally',
    npcName: '"Snake Oil" Sally Winchester',
    homeLocation: 'none',
    defaultSchedule: [
      {
        hour: 0,
        endHour: 7,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: false,
        dialogue: 'Even miracle workers need beauty sleep!'
      },
      {
        hour: 7,
        endHour: 9,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: false,
        dialogue: 'Preparing today\'s miracle cures! Come back soon!'
      },
      {
        hour: 9,
        endHour: 12,
        activity: NPCActivity.PERFORMING,
        locationId: 'current_town',
        locationName: 'Town Square',
        interruptible: false,
        dialogue: 'Step right up! Witness miracles! (Show in progress)'
      },
      {
        hour: 12,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'current_town',
        locationName: 'Town Square',
        interruptible: true,
        dialogue: 'What ails you? Sally has the cure!'
      },
      {
        hour: 18,
        endHour: 22,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'local_saloon',
        locationName: 'Local Saloon',
        interruptible: true,
        dialogue: 'Off duty, but for you? Always open for business!'
      },
      {
        hour: 22,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'Her Wagon',
        interruptible: false,
        dialogue: 'Closed! Come back tomorrow for miracles!'
      }
    ]
  },
  inventory: [
    // Questionable tonics (actually work, mostly)
    {
      itemId: 'sally_miracle_tonic',
      name: 'Sally\'s Miracle Tonic',
      description: 'Cures what ails you! (Mostly alcohol and herbs)',
      price: 20,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'sally_vigor_elixir',
      name: 'Vigor Restoration Elixir',
      description: 'Restores energy! (Actually works, surprisingly)',
      price: 35,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'sally_hair_tonic',
      name: 'Hair Growth Tonic',
      description: 'Guaranteed to restore hair! (Results may vary)',
      price: 25,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'sally_love_potion',
      name: 'Genuine Love Potion',
      description: 'Makes you irresistible! (Confidence boost)',
      price: 40,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'sally_pain_killer',
      name: 'Dr. Winchester\'s Pain Killer',
      description: 'Numbs any pain! (Mostly laudanum)',
      price: 30,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'sally_stamina_pills',
      name: 'Stamina Enhancement Pills',
      description: 'Increase endurance! (Caffeine and sugar)',
      price: 28,
      rarity: 'common',
      type: 'consumable'
    },
    // Actually legitimate items
    {
      itemId: 'sally_real_medicine',
      name: 'Sally\'s Genuine Medicine',
      description: 'The real deal. She saves this for people she likes.',
      price: 50,
      rarity: 'rare',
      type: 'consumable',
      trustRequired: 2
    },
    {
      itemId: 'sally_antivenom',
      name: 'Rattlesnake Antivenom',
      description: 'Life-saving cure for snake bites',
      price: 80,
      rarity: 'rare',
      type: 'consumable',
      trustRequired: 2
    },
    // Trust-gated special items
    {
      itemId: 'sally_truth_serum',
      name: 'Truth Serum',
      description: 'Makes people tell the truth (Actually works!)',
      price: 150,
      rarity: 'epic',
      type: 'consumable',
      trustRequired: 4,
      isExclusive: true
    },
    {
      itemId: 'sally_phoenix_elixir',
      name: 'Phoenix Revival Elixir',
      description: 'Brings you back from the brink of death. Very rare.',
      price: 500,
      rarity: 'legendary',
      type: 'consumable',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Step right up! What\'s troubling you today?',
      'Ah! A new customer! Sally sees exactly what you need!',
      'Welcome, welcome! Miracles are my specialty!',
      'Looking for something special? You\'ve come to the right place!'
    ],
    trading: [
      'Excellent choice! You\'ll feel like a new person!',
      'That\'s one of my best sellers! And for good reason!',
      'Wise purchase! Come back and tell me how well it works!',
      'You won\'t regret this! Satisfaction guaranteed!'
    ],
    departure: [
      'Time for Sally to work her magic elsewhere!',
      'Off to spread miracles to other towns!',
      'Until next time, dear customer!',
      'Keep an eye out for my return! New miracles coming!'
    ],
    busy: [
      'One moment, darling! Mixing up something special!',
      'Hold on, just finishing with this customer!',
      'Be right with you, sweetheart! Patience!'
    ],
    trust: {
      low: [
        'First time? Let me tell you about my miracle cures!',
        'You look skeptical. Just try something small first!',
        'I know what you\'re thinking. But my products work!'
      ],
      medium: [
        'You\'re back! See, I told you my tonics work!',
        'A repeat customer! Let me show you the better stuff...',
        'You\'re starting to believe in Sally\'s miracles, aren\'t you?'
      ],
      high: [
        'My dear friend! Forget the show - let me get the real medicine.',
        'You know my secret - some of this is theater. But not all of it.',
        'For you, no games. Here\'s what actually works.'
      ]
    }
  },
  specialFeatures: [
    'Morning medicine show performance (entertaining, helps build trust)',
    'Will share "trade secrets" with trusted customers',
    'Offers "samples" to new customers (50% off first purchase)',
    'Can identify fake medicines sold by other merchants'
  ],
  trustLevels: [
    { level: 2, benefit: 'Access to legitimate medicines', description: 'Sally stops the sales pitch and gets real' },
    { level: 3, benefit: '15% discount (no more tourist markup)', description: 'Sally gives you the friend price' },
    { level: 4, benefit: 'Access to rare pharmaceutical compounds', description: 'Sally trusts you with the dangerous stuff' },
    { level: 5, benefit: 'The Phoenix Elixir and ultimate cures', description: 'Sally shares her most valuable secret' }
  ]
};

// ========================================
// MERCHANT #6: Running Deer
// ========================================
export const RUNNING_DEER: WanderingMerchant = {
  id: 'merchant_running_deer',
  name: 'Running Deer',
  title: 'Coalition Trader',
  description: 'A proud Kaiowa warrior-turned-trader in his 50s. He maintains traditional trade routes between Coalition settlements, refusing to use settler currency. Everything is barter, as it should be.',
  personality: 'Proud, traditional, dislikes settlers, respects those who respect his people and ways',
  faction: 'NAHI_COALITION',
  barter: true,
  route: [
    {
      locationId: '6501a0000000000000000004', // Kaiowa Mesa
      locationName: 'Kaiowa Mesa',
      arrivalDay: 1,    // Monday
      departureDay: 3,  // Wednesday
      arrivalHour: 8,
      departureHour: 16
    },
    {
      locationId: '6501a000000000000000000b', // Spirit Springs
      locationName: 'Spirit Springs',
      arrivalDay: 3,    // Wednesday
      departureDay: 5,  // Friday
      arrivalHour: 20,
      departureHour: 10
    },
    {
      locationId: '6501a0000000000000000007', // Thunderbird's Perch
      locationName: "Thunderbird's Perch",
      arrivalDay: 5,    // Friday
      departureDay: 7,  // Sunday
      arrivalHour: 14,
      departureHour: 12
    }
  ],
  schedule: {
    npcId: 'merchant_running_deer',
    npcName: 'Running Deer',
    homeLocation: '6501a0000000000000000004', // Kaiowa Mesa
    defaultSchedule: [
      {
        hour: 0,
        endHour: 5,
        activity: NPCActivity.SLEEPING,
        locationId: 'tepee',
        locationName: 'His Tepee',
        interruptible: false,
        dialogue: 'Come back when the sun rises.'
      },
      {
        hour: 5,
        endHour: 6,
        activity: NPCActivity.PRAYING,
        locationId: 'sacred_site',
        locationName: 'Sacred Site',
        interruptible: false,
        dialogue: 'I speak with the spirits. Do not interrupt.'
      },
      {
        hour: 6,
        endHour: 8,
        activity: NPCActivity.EATING,
        locationId: 'council_fire',
        locationName: 'Council Fire',
        interruptible: true,
        dialogue: 'Breaking fast. Sit. Share food.'
      },
      {
        hour: 8,
        endHour: 19,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Trading Post',
        interruptible: true,
        dialogue: 'What do you offer in trade?'
      },
      {
        hour: 19,
        endHour: 21,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'council_fire',
        locationName: 'Council Fire',
        interruptible: true,
        dialogue: 'Stories of the day. You may listen.'
      },
      {
        hour: 21,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'tepee',
        locationName: 'His Tepee',
        interruptible: false,
        dialogue: 'The trading is done. Return tomorrow.'
      }
    ]
  },
  inventory: [
    // Traditional goods (barter values in equivalent gold)
    {
      itemId: 'deer_buffalo_pelt',
      name: 'Prime Buffalo Pelt',
      description: 'Thick, warm hide from a great beast',
      price: 100, // Barter value
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'deer_deer_hide',
      name: 'Tanned Deer Hide',
      description: 'Soft leather, perfect for clothing',
      price: 50,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'deer_healing_herbs',
      name: 'Sacred Healing Herbs',
      description: 'Traditional medicine herbs, blessed',
      price: 60,
      rarity: 'rare',
      type: 'consumable'
    },
    {
      itemId: 'deer_vision_herbs',
      name: 'Vision Quest Herbs',
      description: 'Used in sacred ceremonies',
      price: 80,
      rarity: 'rare',
      type: 'consumable',
      trustRequired: 2
    },
    {
      itemId: 'deer_bow',
      name: 'Hunting Bow',
      description: 'Hand-crafted bow of excellent quality',
      price: 120,
      rarity: 'rare',
      type: 'weapon'
    },
    {
      itemId: 'deer_arrows',
      name: 'Flint-Tipped Arrows (20)',
      description: 'Precisely balanced hunting arrows',
      price: 40,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'deer_beadwork',
      name: 'Ceremonial Beadwork',
      description: 'Intricate beaded items of great beauty',
      price: 70,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'deer_war_paint',
      name: 'Warrior\'s Paint',
      description: 'Ceremonial paint for battle',
      price: 35,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'deer_medicine_bag',
      name: 'Medicine Bag',
      description: 'Leather pouch for carrying sacred items',
      price: 45,
      rarity: 'uncommon',
      type: 'armor'
    },
    // Trust-gated ceremonial items
    {
      itemId: 'deer_eagle_feather',
      name: 'Sacred Eagle Feather',
      description: 'Great honor to receive this. Carries protection.',
      price: 200,
      rarity: 'epic',
      type: 'quest',
      trustRequired: 4,
      isExclusive: true
    },
    {
      itemId: 'deer_tomahawk',
      name: 'War Tomahawk of the Kaiowa',
      description: 'Ancestral weapon, blessed by shamans',
      price: 400,
      rarity: 'legendary',
      type: 'weapon',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'You come to trade. Show respect, receive respect.',
      'What do you bring? I do not use the white man\'s coins.',
      'Speak your business. My time is valuable.',
      'You are welcome if you honor our ways.'
    ],
    trading: [
      'A fair trade. This honors both of us.',
      'You understand the value of these things. Good.',
      'This will serve you well. Use it with respect.',
      'We trade as equals. As it should be.'
    ],
    departure: [
      'I return to my people. Until the next journey.',
      'The path calls me to other places.',
      'May the spirits guide your path.',
      'We will meet again when the seasons turn.'
    ],
    busy: [
      'Wait. I am with another.',
      'Patience. All will be heard.',
      'I will speak with you when I am finished here.'
    ],
    trust: {
      low: [
        'You are an outsider. Tread carefully.',
        'Prove you can be trusted before asking for more.',
        'I do not know you. Show respect and we will see.'
      ],
      medium: [
        'You return. You have not broken faith. Good.',
        'You are learning our ways. I see this.',
        'Perhaps you are different from the others.'
      ],
      high: [
        'You are a friend to the Kaiowa. I am honored.',
        'You understand what others do not. For this, I trust you.',
        'You are welcome among my people. This is no small thing.'
      ]
    }
  },
  specialFeatures: [
    'BARTER ONLY - No gold accepted, only item-for-item trades',
    'Will teach player traditional skills (hunting, tracking)',
    'Provides quests to help Coalition settlements',
    'Higher trust grants access to sacred lands and secrets'
  ],
  trustLevels: [
    { level: 2, benefit: 'Access to vision quest items', description: 'Running Deer sees you respect the old ways' },
    { level: 3, benefit: 'Can learn Coalition language and customs', description: 'Accepted as friend of the people' },
    { level: 4, benefit: 'Granted sacred eagle feather', description: 'Honored as warrior and protector' },
    { level: 5, benefit: 'Access to ancestral weapons', description: 'Considered blood brother/sister' }
  ]
};

// ========================================
// MERCHANT #7: "Gunsmith" Garrett Cole
// ========================================
export const GUNSMITH_GARRETT: WanderingMerchant = {
  id: 'merchant_garrett_cole',
  name: 'Garrett Cole',
  title: 'Master Gunsmith',
  description: 'A grizzled Army veteran in his 60s with a precise, methodical manner. He travels between major settlements offering quality firearms, ammunition, and gun modifications. Every weapon is perfectly maintained.',
  personality: 'Precise, professional, no-nonsense, respects skill and discipline',
  faction: 'SETTLER_ALLIANCE',
  route: [
    {
      locationId: '6501a0000000000000000003', // Fort Ashford
      locationName: 'Fort Ashford',
      arrivalDay: 2,    // Tuesday
      departureDay: 4,  // Thursday
      arrivalHour: 8,
      departureHour: 17
    },
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 4,    // Thursday
      departureDay: 6,  // Saturday
      arrivalHour: 20,
      departureHour: 10
    },
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 6,    // Saturday
      departureDay: 1,  // Monday
      arrivalHour: 14,
      departureHour: 16
    }
  ],
  schedule: {
    npcId: 'merchant_garrett_cole',
    npcName: 'Garrett Cole',
    homeLocation: '6501a0000000000000000003', // Fort Ashford
    defaultSchedule: [
      {
        hour: 0,
        endHour: 5,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Reveille\'s at 5. Come back then.'
      },
      {
        hour: 5,
        endHour: 6,
        activity: NPCActivity.WAKING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Morning routine. Give me a few minutes.'
      },
      {
        hour: 6,
        endHour: 7,
        activity: NPCActivity.EATING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: true,
        dialogue: 'Coffee and hardtack. Want some?'
      },
      {
        hour: 7,
        endHour: 8,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Workshop',
        interruptible: false,
        dialogue: 'Cleaning and maintaining stock. Precision work.'
      },
      {
        hour: 8,
        endHour: 17,
        activity: NPCActivity.WORKING,
        locationId: 'current_town',
        locationName: 'Town Square',
        interruptible: true,
        dialogue: 'What can I do for you, soldier?'
      },
      {
        hour: 17,
        endHour: 19,
        activity: NPCActivity.CRAFTING,
        locationId: 'wagon',
        locationName: 'His Workshop',
        interruptible: false,
        dialogue: 'Gunsmithing time. Come back later.'
      },
      {
        hour: 19,
        endHour: 21,
        activity: NPCActivity.EATING,
        locationId: 'local_saloon',
        locationName: 'Local Saloon',
        interruptible: true,
        dialogue: 'Having supper. Join me?'
      },
      {
        hour: 21,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'wagon',
        locationName: 'His Wagon',
        interruptible: false,
        dialogue: 'Lights out. 2100 hours sharp.'
      }
    ]
  },
  inventory: [
    // Standard firearms
    {
      itemId: 'garrett_army_revolver',
      name: 'Army Colt .45',
      description: 'Standard issue cavalry revolver, perfectly maintained',
      price: 180,
      rarity: 'uncommon',
      type: 'weapon'
    },
    {
      itemId: 'garrett_peacemaker',
      name: 'Colt Peacemaker',
      description: 'The most famous revolver in the West',
      price: 250,
      rarity: 'rare',
      type: 'weapon'
    },
    {
      itemId: 'garrett_winchester',
      name: 'Winchester 1873 Rifle',
      description: 'Lever-action rifle in excellent condition',
      price: 300,
      rarity: 'rare',
      type: 'weapon'
    },
    {
      itemId: 'garrett_shotgun',
      name: 'Double-Barrel Shotgun',
      description: 'Coach gun, sawed to perfect length',
      price: 200,
      rarity: 'uncommon',
      type: 'weapon'
    },
    {
      itemId: 'garrett_derringer',
      name: '.41 Derringer',
      description: 'Compact backup piece',
      price: 80,
      rarity: 'uncommon',
      type: 'weapon'
    },
    // Ammunition
    {
      itemId: 'garrett_ammo_45',
      name: '.45 Caliber Ammunition (100 rounds)',
      description: 'Premium quality rounds',
      price: 45,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'garrett_ammo_rifle',
      name: 'Rifle Cartridges (50 rounds)',
      description: '.44-40 Winchester rounds',
      price: 35,
      rarity: 'common',
      type: 'consumable'
    },
    {
      itemId: 'garrett_ammo_shotgun',
      name: 'Shotgun Shells (25 shells)',
      description: '12-gauge buckshot',
      price: 30,
      rarity: 'common',
      type: 'consumable'
    },
    // Modifications and accessories
    {
      itemId: 'garrett_gun_cleaning_kit',
      name: 'Professional Cleaning Kit',
      description: 'Keep your weapons in top condition',
      price: 50,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'garrett_speed_loader',
      name: 'Speed Loader',
      description: 'Load your revolver faster in combat',
      price: 40,
      rarity: 'uncommon',
      type: 'material'
    },
    // Trust-gated military items
    {
      itemId: 'garrett_officer_revolver',
      name: 'Officer\'s Special Revolver',
      description: 'Custom piece with ivory grips and gold inlay',
      price: 600,
      rarity: 'epic',
      type: 'weapon',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'garrett_sharps_rifle',
      name: 'Sharps Buffalo Rifle',
      description: 'Long-range precision rifle. Legendary accuracy.',
      price: 800,
      rarity: 'legendary',
      type: 'weapon',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'What can I help you with today?',
      'Looking for quality firearms? You came to the right place.',
      'Every piece here is inspection-ready. Take a look.',
      'Garrett Cole. Army gunsmith, 20 years. What do you need?'
    ],
    trading: [
      'Solid choice. Maintain it properly and it\'ll never let you down.',
      'Good weapon. I stood behind that one personally.',
      'Keep it clean, keep it oiled. It\'ll save your life someday.',
      'Fair price for quality work. You won\'t find better.'
    ],
    departure: [
      'Time to move out. Back on schedule.',
      'Heading to the next post. See you on the next rotation.',
      'Stay sharp out there. Good luck.',
      'Until next time. Keep that weapon clean.'
    ],
    busy: [
      'Give me a minute. Finishing a repair.',
      'Hold on. Precision work here.',
      'One customer at a time. Military discipline.'
    ],
    trust: {
      low: [
        'First time customer? Let me show you the basics.',
        'Everything here is quality. No junk.',
        'I stand behind every weapon I sell.'
      ],
      medium: [
        'I remember you. You take care of your equipment. Good.',
        'Repeat customer. I respect that. What do you need?',
        'You know quality when you see it. Take a look at this.'
      ],
      high: [
        'You\'ve earned my respect. Let me show you the special inventory.',
        'For a fellow professional, I have something exceptional.',
        'You remind me of the soldiers I served with. Here, look at this.'
      ]
    }
  },
  specialFeatures: [
    'Weapon modification service (add scopes, improve accuracy, etc.)',
    'Free weapon cleaning and maintenance for customers',
    'Will buy back used firearms at fair prices (60%)',
    'Teaches marksmanship skill to high-trust customers'
  ],
  trustLevels: [
    { level: 2, benefit: 'Free weapon maintenance services', description: 'Garrett respects your discipline' },
    { level: 3, benefit: 'Access to officer-grade weapons', description: 'Garrett trusts you with military equipment' },
    { level: 4, benefit: 'Custom weapon modification services', description: 'Garrett will craft custom pieces for you' },
    { level: 5, benefit: 'The Sharps Buffalo Rifle and masterworks', description: 'Garrett considers you a brother in arms' }
  ]
};

// ========================================
// MERCHANT #8: Madame Celestine
// ========================================
export const MADAME_CELESTINE: WanderingMerchant = {
  id: 'merchant_madame_celestine',
  name: 'Madame Celestine Dubois',
  title: 'Luxury Goods Trader',
  description: 'An elegant woman in her 40s with a mysterious French accent and expensive perfume. She deals in luxury goods for the wealthy - jewelry, fine clothes, art, and perfumes. Her past is shrouded in intrigue.',
  personality: 'Elegant, mysterious, sophisticated, hints at a scandalous past in New Orleans',
  faction: 'NEUTRAL',
  route: [
    {
      locationId: '6501a000000000000000000c', // Whiskey Bend
      locationName: 'Whiskey Bend',
      arrivalDay: 3,    // Wednesday
      departureDay: 5,  // Friday
      arrivalHour: 14,
      departureHour: 12
    },
    {
      locationId: '6501a0000000000000000002', // The Frontera
      locationName: 'The Frontera',
      arrivalDay: 5,    // Friday
      departureDay: 7,  // Sunday
      arrivalHour: 16,
      departureHour: 14
    }
  ],
  schedule: {
    npcId: 'merchant_madame_celestine',
    npcName: 'Madame Celestine Dubois',
    homeLocation: 'none',
    defaultSchedule: [
      {
        hour: 0,
        endHour: 9,
        activity: NPCActivity.SLEEPING,
        locationId: 'hotel',
        locationName: 'Hotel Suite',
        interruptible: false,
        dialogue: 'Madame is not receiving visitors at this ungodly hour.'
      },
      {
        hour: 9,
        endHour: 11,
        activity: NPCActivity.RESTING,
        locationId: 'hotel',
        locationName: 'Hotel Suite',
        interruptible: false,
        dialogue: 'Morning beauty routine. Come back later, chéri.'
      },
      {
        hour: 11,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'hotel_dining',
        locationName: 'Hotel Restaurant',
        interruptible: true,
        dialogue: 'Brunch. Care to join me? If you can afford it.'
      },
      {
        hour: 13,
        endHour: 19,
        activity: NPCActivity.WORKING,
        locationId: 'hotel_suite',
        locationName: 'Private Showroom',
        interruptible: true,
        dialogue: 'Welcome to my collection. Only the finest things.'
      },
      {
        hour: 19,
        endHour: 23,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'exclusive_salon',
        locationName: 'Exclusive Salon',
        interruptible: true,
        dialogue: 'Evening soirée. You\'re welcome... if you dress appropriately.'
      },
      {
        hour: 23,
        endHour: 24,
        activity: NPCActivity.RESTING,
        locationId: 'hotel',
        locationName: 'Hotel Suite',
        interruptible: false,
        dialogue: 'Preparing for bed. Tomorrow, chéri.'
      }
    ]
  },
  inventory: [
    // Luxury items
    {
      itemId: 'celestine_silk_dress',
      name: 'Parisian Silk Dress',
      description: 'Imported from Paris, exquisite craftsmanship',
      price: 300,
      rarity: 'rare',
      type: 'armor'
    },
    {
      itemId: 'celestine_diamond_necklace',
      name: 'Diamond Necklace',
      description: 'Genuine diamonds in silver setting',
      price: 800,
      rarity: 'epic',
      type: 'armor'
    },
    {
      itemId: 'celestine_gold_ring',
      name: 'Gold Signet Ring',
      description: 'Heavy gold ring with engraved crest',
      price: 250,
      rarity: 'rare',
      type: 'armor'
    },
    {
      itemId: 'celestine_perfume',
      name: 'French Perfume',
      description: 'Rare scent from Grasse, France',
      price: 120,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'celestine_pocket_watch',
      name: 'Gold Pocket Watch',
      description: 'Swiss-made precision timepiece',
      price: 400,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'celestine_opera_glasses',
      name: 'Mother-of-Pearl Opera Glasses',
      description: 'Elegant and functional',
      price: 180,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'celestine_cigar_case',
      name: 'Silver Cigar Case',
      description: 'Monogrammed sterling silver',
      price: 150,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'celestine_painting',
      name: 'Oil Painting (Small)',
      description: 'Original artwork by regional artist',
      price: 500,
      rarity: 'rare',
      type: 'material'
    },
    // Trust-gated special items
    {
      itemId: 'celestine_rare_wine',
      name: 'Château Margaux 1860',
      description: 'Rare French wine. Nearly priceless.',
      price: 600,
      rarity: 'epic',
      type: 'consumable',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'celestine_crown_jewel',
      name: 'The "New Orleans Sapphire"',
      description: 'Legendary gemstone with a scandalous history',
      price: 5000,
      rarity: 'legendary',
      type: 'armor',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Bonjour, chéri. Come to admire beautiful things?',
      'Welcome to Celestine\'s collection. Everything here is... exquisite.',
      'Ah, a potential customer. Do you have refined taste, I wonder?',
      'Good day. I hope you brought sufficient funds.'
    ],
    trading: [
      'Excellent choice. You have impeccable taste.',
      'This will look magnifique on you, darling.',
      'A wise investment in beauty and quality.',
      'Handle it with care. It\'s worth more than most people earn in a year.'
    ],
    departure: [
      'I must depart for my next engagement. Au revoir.',
      'Time to grace another town with my presence.',
      'Until we meet again, chéri. Don\'t forget me.',
      'The wealthy of other towns await. Goodbye, darling.'
    ],
    busy: [
      'Un moment, s\'il vous plaît. I am with another patron.',
      'Patience, darling. Quality takes time.',
      'I will be with you shortly. Have some champagne while you wait.'
    ],
    trust: {
      low: [
        'First time? Browse, but don\'t touch unless you\'re serious.',
        'I don\'t know you yet. Show me you appreciate quality.',
        'These items are for... discerning clientele.'
      ],
      medium: [
        'Ah, you return. And with better taste this time, I see.',
        'A familiar face with a full purse. How delightful.',
        'You\'re starting to understand true luxury. Good.'
      ],
      high: [
        'Mon ami! Come, I saved something special just for you.',
        'You appreciate the finer things. Finally, someone who understands!',
        'For you, my dear, I have items I show to no one else. Look...'
      ]
    }
  },
  specialFeatures: [
    'High prices, but items have prestige value (impress NPCs)',
    'Can arrange "special acquisitions" (smuggled luxury goods)',
    'Knows gossip about the wealthy and powerful',
    'Private showings for high-trust customers only'
  ],
  trustLevels: [
    { level: 2, benefit: 'Access to private showroom', description: 'Madame considers you worthy of her time' },
    { level: 3, benefit: 'Rare imported goods from Europe', description: 'Madame trusts you with black market luxuries' },
    { level: 4, benefit: '20% discount (still expensive)', description: 'Madame considers you a valued patron' },
    { level: 5, benefit: 'The New Orleans Sapphire', description: 'Madame shares her greatest secret' }
  ]
};

// ========================================
// MERCHANT #9: "Dusty" Pete Morrison
// ========================================
export const DUSTY_PETE: WanderingMerchant = {
  id: 'merchant_dusty_pete',
  name: '"Dusty" Pete Morrison',
  title: 'Prospector Trader',
  description: 'A grizzled prospector in his 70s who knows every inch of Sangre Territory. He trades mining equipment, assays gold, and sells maps - some real, some "optimistic". Very superstitious about Goldfinger\'s Mine.',
  personality: 'Gruff, superstitious, surprisingly knowledgeable about geology, hates Goldfinger',
  faction: 'NEUTRAL',
  route: [
    {
      locationId: '6501a0000000000000000006', // Goldfinger's Mine
      locationName: "Goldfinger's Mine",
      arrivalDay: 2,    // Tuesday
      departureDay: 3,  // Wednesday
      arrivalHour: 10,
      departureHour: 18
    },
    {
      locationId: '6501a0000000000000000001', // Red Gulch
      locationName: 'Red Gulch',
      arrivalDay: 4,    // Thursday
      departureDay: 5,  // Friday
      arrivalHour: 12,
      departureHour: 14
    },
    {
      locationId: '6501a0000000000000000009', // Dusty Trail
      locationName: 'Dusty Trail',
      arrivalDay: 6,    // Saturday
      departureDay: 7,  // Sunday
      arrivalHour: 16,
      departureHour: 20
    }
  ],
  schedule: {
    npcId: 'merchant_dusty_pete',
    npcName: '"Dusty" Pete Morrison',
    homeLocation: '6501a0000000000000000009', // Dusty Trail
    defaultSchedule: [
      {
        hour: 0,
        endHour: 4,
        activity: NPCActivity.SLEEPING,
        locationId: 'camp',
        locationName: 'His Camp',
        interruptible: false,
        dialogue: '*snoring loudly*'
      },
      {
        hour: 4,
        endHour: 6,
        activity: NPCActivity.WAKING,
        locationId: 'camp',
        locationName: 'His Camp',
        interruptible: true,
        dialogue: 'Early bird gets the gold, they say. Coffee?'
      },
      {
        hour: 6,
        endHour: 12,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Mining Area',
        interruptible: true,
        dialogue: 'Need mining gear? Assay work? Pete\'s got you covered.'
      },
      {
        hour: 12,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'camp',
        locationName: 'His Camp',
        interruptible: true,
        dialogue: 'Beans and hardtack. Want some?'
      },
      {
        hour: 13,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Assay Office Area',
        interruptible: true,
        dialogue: 'Back open. What\'cha got for me to look at?'
      },
      {
        hour: 18,
        endHour: 22,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'local_saloon',
        locationName: 'Prospector Saloon',
        interruptible: true,
        dialogue: 'Telling tales of the old days. And they\'re all true!'
      },
      {
        hour: 22,
        endHour: 24,
        activity: NPCActivity.SLEEPING,
        locationId: 'camp',
        locationName: 'His Camp',
        interruptible: false,
        dialogue: 'Sun\'s down, Pete\'s down. Come back tomorrow.'
      }
    ]
  },
  inventory: [
    // Mining equipment
    {
      itemId: 'pete_pickaxe',
      name: 'Quality Mining Pickaxe',
      description: 'Well-balanced pickaxe for hard rock',
      price: 65,
      rarity: 'common',
      type: 'material'
    },
    {
      itemId: 'pete_gold_pan',
      name: 'Prospector\'s Gold Pan',
      description: 'Essential tool for panning gold',
      price: 30,
      rarity: 'common',
      type: 'material'
    },
    {
      itemId: 'pete_dynamite',
      name: 'Dynamite Sticks (5)',
      description: 'For breaking through hard rock. Careful!',
      price: 80,
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'pete_mining_helmet',
      name: 'Mining Helmet with Lamp',
      description: 'Keeps your hands free in dark tunnels',
      price: 45,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'pete_assay_kit',
      name: 'Gold Assay Kit',
      description: 'Test ore samples for gold content',
      price: 120,
      rarity: 'rare',
      type: 'material'
    },
    // Maps (some real, some wishful thinking)
    {
      itemId: 'pete_map_common',
      name: 'Territory Map',
      description: 'Detailed map of Sangre Territory',
      price: 40,
      rarity: 'common',
      type: 'material'
    },
    {
      itemId: 'pete_map_gold',
      name: '"Guaranteed Gold" Map',
      description: 'Claims to show a rich gold vein. Maybe.',
      price: 100,
      rarity: 'uncommon',
      type: 'quest'
    },
    {
      itemId: 'pete_lucky_charm',
      name: 'Prospector\'s Lucky Charm',
      description: 'Pete swears this brings good fortune',
      price: 25,
      rarity: 'uncommon',
      type: 'material'
    },
    // Trust-gated items
    {
      itemId: 'pete_real_map',
      name: 'Pete\'s Personal Strike Map',
      description: 'His actual map to a real gold vein. Very rare.',
      price: 500,
      rarity: 'epic',
      type: 'quest',
      trustRequired: 4,
      quantity: 1,
      isExclusive: true
    },
    {
      itemId: 'pete_goldfinger_secret',
      name: 'Goldfinger Mine Secret',
      description: 'The truth about what\'s really in that cursed mine',
      price: 1000,
      rarity: 'legendary',
      type: 'quest',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'Hey there, prospector! Need some equipment?',
      'Pete Morrison, at your service. What can I do for ya?',
      'Looking to strike it rich? I\'ve got what you need!',
      'Welcome, welcome! Don\'t mention Goldfinger around me.'
    ],
    trading: [
      'That\'ll serve you well out there. Good luck!',
      'Solid purchase. Many a prospector\'s trusted Pete\'s gear.',
      'May fortune smile on your claim!',
      'If you find color, come back and show old Pete!'
    ],
    departure: [
      'Time to hit the trail. Gold won\'t find itself!',
      'Moving on to the next mining camp. Safe digging!',
      'See you on the circuit. Watch out for claim jumpers!',
      'Until next time! May your pan be heavy with gold!'
    ],
    busy: [
      'Hold your horses, I\'m assaying this sample.',
      'One moment, checking the purity on this nugget.',
      'Hang on, got to finish this calibration.'
    ],
    trust: {
      low: [
        'New to prospecting? I\'ll sell you the basics.',
        'Don\'t know you yet. Lots of swindlers out here.',
        'First timer? Well, good luck to you.'
      ],
      medium: [
        'You again! Found any color with that equipment?',
        'I remember you. You know your business.',
        'A serious prospector. I respect that. What do you need?'
      ],
      high: [
        'Friend, I trust you. Let me show you my real maps.',
        'You\'re no cheater or thief. I can tell. Come here...',
        'I\'ll tell you something I don\'t tell many people...'
      ]
    }
  },
  specialFeatures: [
    'Gold assay service (50 gold per sample, tells true value)',
    'Sells maps to hidden gold veins (some real, some fake)',
    'Knows secret passages through mountains',
    'Will warn high-trust customers about claim jumpers'
  ],
  trustLevels: [
    { level: 2, benefit: 'Honest assay results (won\'t cheat you)', description: 'Pete sees you\'re an honest prospector' },
    { level: 3, benefit: 'Access to genuine gold vein maps', description: 'Pete trusts you with real locations' },
    { level: 4, benefit: 'Pete\'s personal strike location', description: 'Pete shares his own gold claim' },
    { level: 5, benefit: 'The Goldfinger Mine secret', description: 'Pete reveals the mine\'s dark truth' }
  ]
};

// ========================================
// MERCHANT #10: Three Crows
// ========================================
export const THREE_CROWS: WanderingMerchant = {
  id: 'merchant_three_crows',
  name: 'Three Crows',
  title: 'Spiritual Trader & Mystic',
  description: 'An ancient Kaiowa shaman of indeterminate age who wanders sacred sites. He speaks in riddles and sees beyond the veil. His wares are spiritual tools, vision quest supplies, and sacred items. Some say he communes with spirits.',
  personality: 'Mystical, speaks in riddles, timeless wisdom, sees the future, never direct',
  faction: 'NAHI_COALITION',
  barter: true,
  route: [
    {
      locationId: '6501a000000000000000000b', // Spirit Springs
      locationName: 'Spirit Springs',
      arrivalDay: 1,    // Monday
      departureDay: 3,  // Wednesday
      arrivalHour: 6,
      departureHour: 18
    },
    {
      locationId: '6501a0000000000000000007', // Thunderbird's Perch
      locationName: "Thunderbird's Perch",
      arrivalDay: 4,    // Thursday
      departureDay: 5,  // Friday
      arrivalHour: 5,
      departureHour: 20
    },
    {
      locationId: 'sacred_mesa', // Hidden sacred site
      locationName: 'Sacred Mesa (Hidden)',
      arrivalDay: 6,    // Saturday
      departureDay: 7,  // Sunday
      arrivalHour: 0,
      departureHour: 23
    }
  ],
  schedule: {
    npcId: 'merchant_three_crows',
    npcName: 'Three Crows',
    homeLocation: 'spirit_realm', // He has no home
    defaultSchedule: [
      {
        hour: 0,
        endHour: 5,
        activity: NPCActivity.PRAYING,
        locationId: 'sacred_site',
        locationName: 'Sacred Ground',
        interruptible: false,
        dialogue: 'The spirits speak when the world sleeps. Come later.'
      },
      {
        hour: 5,
        endHour: 8,
        activity: NPCActivity.PRAYING,
        locationId: 'sacred_site',
        locationName: 'Sacred Ground',
        interruptible: false,
        dialogue: 'Dawn ceremony. The spirits are near.'
      },
      {
        hour: 8,
        endHour: 12,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Sacred Site',
        interruptible: true,
        dialogue: 'The spirits said you would come. What do you seek?'
      },
      {
        hour: 12,
        endHour: 14,
        activity: NPCActivity.RESTING,
        locationId: 'sacred_site',
        locationName: 'Sacred Ground',
        interruptible: false,
        dialogue: 'The sun is high. The spirits rest. So must I.'
      },
      {
        hour: 14,
        endHour: 19,
        activity: NPCActivity.WORKING,
        locationId: 'current_location',
        locationName: 'Sacred Site',
        interruptible: true,
        dialogue: 'You have questions. The spirits have answers.'
      },
      {
        hour: 19,
        endHour: 21,
        activity: NPCActivity.PRAYING,
        locationId: 'sacred_site',
        locationName: 'Sacred Ground',
        interruptible: false,
        dialogue: 'Evening prayers. The boundary grows thin.'
      },
      {
        hour: 21,
        endHour: 24,
        activity: NPCActivity.PRAYING,
        locationId: 'sacred_site',
        locationName: 'Sacred Ground',
        interruptible: true,
        dialogue: 'The spirits walk at night. You may speak with me.'
      }
    ]
  },
  inventory: [
    // Spiritual items
    {
      itemId: 'crows_sage_bundle',
      name: 'Sacred Sage Bundle',
      description: 'For cleansing and protection rituals',
      price: 40, // Barter value
      rarity: 'uncommon',
      type: 'consumable'
    },
    {
      itemId: 'crows_vision_herbs',
      name: 'Vision Quest Mixture',
      description: 'Opens the mind to spirit visions',
      price: 100,
      rarity: 'rare',
      type: 'consumable'
    },
    {
      itemId: 'crows_medicine_bag',
      name: 'Shaman\'s Medicine Pouch',
      description: 'Blessed bag containing protective herbs',
      price: 80,
      rarity: 'rare',
      type: 'armor'
    },
    {
      itemId: 'crows_spirit_stone',
      name: 'Spirit-Touched Stone',
      description: 'Stone that has seen the spirit world',
      price: 60,
      rarity: 'uncommon',
      type: 'material'
    },
    {
      itemId: 'crows_dream_catcher',
      name: 'Sacred Dreamcatcher',
      description: 'Protects sleep from evil spirits',
      price: 70,
      rarity: 'uncommon',
      type: 'armor'
    },
    {
      itemId: 'crows_bone_fetish',
      name: 'Bone Spirit Fetish',
      description: 'Carved bones that channel spirit power',
      price: 90,
      rarity: 'rare',
      type: 'material'
    },
    {
      itemId: 'crows_ceremonial_paint',
      name: 'Ceremonial Face Paint',
      description: 'Sacred pigments for ritual use',
      price: 50,
      rarity: 'uncommon',
      type: 'consumable'
    },
    // Trust-gated sacred items
    {
      itemId: 'crows_spirit_guide',
      name: 'Spirit Guide Totem',
      description: 'Calls a spirit guide to aid you',
      price: 300,
      rarity: 'epic',
      type: 'quest',
      trustRequired: 3,
      isExclusive: true
    },
    {
      itemId: 'crows_thunderbird_feather',
      name: 'Thunderbird\'s Primary Feather',
      description: 'The most sacred object. Channels lightning itself.',
      price: 1000,
      rarity: 'legendary',
      type: 'armor',
      trustRequired: 5,
      quantity: 1,
      isExclusive: true
    }
  ],
  dialogue: {
    greeting: [
      'The crows told me of your coming.',
      'You walk between worlds, like I do. I see this.',
      'What does the seeker seek? Speak.',
      'The spirits knew you would arrive. They are never wrong.'
    ],
    trading: [
      'This was meant for you. The spirits guided you here.',
      'Use it wisely. Power demands respect.',
      'The exchange is complete. You are bound to it now.',
      'May the spirits walk beside you.'
    ],
    departure: [
      'The sacred places call. I must answer.',
      'The spirits have other tasks for me. We will meet again.',
      'Three Crows flies to distant places. Until the wheel turns.',
      'The path leads onward. Farewell, walker of worlds.'
    ],
    busy: [
      'The ceremony is not complete. Wait.',
      'Silence. The spirits speak.',
      'Not now. The veil is thin, the work is delicate.'
    ],
    trust: {
      low: [
        'You are new. The spirits watch you. Be worthy.',
        'I do not know your spirit yet. Prove yourself.',
        'Outsider. But even outsiders can walk the sacred path.'
      ],
      medium: [
        'You return. The spirits remember you.',
        'I see your spirit grows stronger. Good.',
        'You respect the old ways. This pleases the spirits.'
      ],
      high: [
        'The spirits speak your name with favor. Listen...',
        'You have walked far on the sacred path. I honor this.',
        'Come. For you, I have items of great power. See...'
      ]
    }
  },
  specialFeatures: [
    'Provides prophetic riddles (hints at future events)',
    'Can perform vision quests for high-trust customers',
    'Speaks only in riddles and metaphors (frustrating but wise)',
    'Reveals location of hidden sacred sites',
    'BARTER ONLY - Wants sacred items, relics, or spirit offerings'
  ],
  trustLevels: [
    { level: 2, benefit: 'Three Crows interprets prophetic visions for you', description: 'The spirits acknowledge your presence' },
    { level: 3, benefit: 'Access to spirit guide summoning items', description: 'You may walk the spirit paths' },
    { level: 4, benefit: 'Vision quest ceremony (powerful character boost)', description: 'The spirits claim you as worthy' },
    { level: 5, benefit: 'Thunderbird\'s Feather - legendary power', description: 'You are chosen by the Thunderbird itself' }
  ]
};

// ========================================
// EXPORTS
// ========================================

/**
 * All wandering merchant NPCs
 */
export const WANDERING_MERCHANTS: WanderingMerchant[] = [
  HONEST_ABE,
  MARIA_LA_VENDEDORA,
  WONG_CHEN,
  OLD_SILAS,
  SNAKE_OIL_SALLY,
  RUNNING_DEER,
  GUNSMITH_GARRETT,
  MADAME_CELESTINE,
  DUSTY_PETE,
  THREE_CROWS
];

/**
 * Get merchant by ID
 */
export function getMerchantById(id: string): WanderingMerchant | undefined {
  return WANDERING_MERCHANTS.find(m => m.id === id);
}

/**
 * Get all merchants at a specific location and day
 */
export function getMerchantsAtLocation(locationId: string, dayOfWeek: number, hour: number): WanderingMerchant[] {
  return WANDERING_MERCHANTS.filter(merchant => {
    return merchant.route.some(stop => {
      const isCorrectLocation = stop.locationId === locationId;
      const isCorrectDay = dayOfWeek >= stop.arrivalDay && dayOfWeek <= stop.departureDay;
      const isCorrectHour = hour >= stop.arrivalHour && hour <= stop.departureHour;
      return isCorrectLocation && isCorrectDay && isCorrectHour;
    });
  });
}

/**
 * Get merchant's current location
 */
export function getMerchantCurrentLocation(merchantId: string, dayOfWeek: number, hour: number): RouteStop | null {
  const merchant = getMerchantById(merchantId);
  if (!merchant) return null;

  for (const stop of merchant.route) {
    const isCorrectDay = dayOfWeek >= stop.arrivalDay && dayOfWeek <= stop.departureDay;
    const isCorrectHour = hour >= stop.arrivalHour && hour <= stop.departureHour;
    if (isCorrectDay && isCorrectHour) {
      return stop;
    }
  }

  return null; // Merchant is traveling between locations
}
