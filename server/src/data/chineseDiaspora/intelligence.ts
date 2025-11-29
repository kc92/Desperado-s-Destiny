/**
 * Chinese Diaspora Intelligence System
 *
 * Information and intelligence rewards that can be purchased or earned
 * through the Chinese Diaspora network. Information is as valuable as gold.
 *
 * Intelligence Categories:
 * - Military: Fort movements, patrol schedules
 * - Criminal: Gang operations, smuggling routes
 * - Political: Corruption, power structures
 * - Economic: Trade routes, prices, opportunities
 * - Personal: NPC secrets, blackmail material
 * - Geographic: Maps, locations, hidden caches
 */

import type { IntelligenceItem } from '@desperados/shared';

// ============================================================================
// TRUST LEVEL 2 INTELLIGENCE (Friend)
// ============================================================================

export const LAW_PATROL_SCHEDULES: IntelligenceItem = {
  id: 'law-patrol-schedules',
  name: 'Law Patrol Schedules',
  chineseName: 'Jǐng Chá Xún Luó Shí Jiān',
  category: 'military',
  description: 'Complete schedules of sheriff and deputy patrols across the territory.',
  details: 'Learn when and where lawmen patrol, allowing you to avoid encounters or plan ambushes. Updated daily.',
  trustRequired: 2,
  cost: 50,
  effects: [
    {
      type: 'schedule_access',
      target: 'lawmen',
      value: 'all-locations',
      duration: 24,
    },
    {
      type: 'map_reveal',
      target: 'patrol-routes',
      value: 'visible',
    },
  ],
  refreshRate: 'daily',
  expires: 24,
  stackable: false,
  sourceNPC: 'chen-wei',
};

export const MERCHANT_PRICE_LISTS: IntelligenceItem = {
  id: 'merchant-price-lists',
  name: 'Merchant Price Lists',
  chineseName: 'Shāng Rén Jià Gé Biǎo',
  category: 'economic',
  description: 'Know the best buy and sell prices across all merchants.',
  details: 'The network tracks every merchant\'s prices. You\'ll always know where to get the best deals.',
  trustRequired: 2,
  cost: 75,
  effects: [
    {
      type: 'price_bonus',
      target: 'all-merchants',
      value: 10,
      duration: 168, // 1 week
    },
    {
      type: 'secret_reveal',
      target: 'merchant-inventories',
      value: 'visible',
    },
  ],
  refreshRate: 'weekly',
  expires: 168,
  stackable: false,
  sourceNPC: 'wong-chen',
};

export const GOSSIP_NETWORK_ACCESS: IntelligenceItem = {
  id: 'gossip-network-access',
  name: 'Gossip Network Access',
  chineseName: 'Xiāo Xī Wǎng Luò',
  category: 'personal',
  description: 'Access to the Chinese community\'s gossip network. Learn NPC secrets.',
  details: 'Chinese workers see and hear everything. Laundry, restaurants, railroad - the network knows all the gossip.',
  trustRequired: 2,
  cost: 100,
  effects: [
    {
      type: 'secret_reveal',
      target: 'npc-secrets',
      value: '10-random',
      duration: 72,
    },
    {
      type: 'quest_unlock',
      target: 'blackmail-quests',
      value: 'available',
    },
  ],
  refreshRate: 'daily',
  expires: 72,
  stackable: false,
  sourceNPC: 'chen-wei',
};

// ============================================================================
// TRUST LEVEL 3 INTELLIGENCE (Sibling)
// ============================================================================

export const MILITARY_MOVEMENT_REPORTS: IntelligenceItem = {
  id: 'military-movement-reports',
  name: 'Military Movement Reports',
  chineseName: 'Jūn Duì Dòng Tài',
  category: 'military',
  description: 'Army patrol schedules and Fort Ashford intelligence.',
  details: 'Chinese workers at Fort Ashford report all military movements. Know when troops are on patrol or returning to base.',
  trustRequired: 3,
  cost: 200,
  effects: [
    {
      type: 'schedule_access',
      target: 'military-patrols',
      value: 'all-territory',
      duration: 168,
    },
    {
      type: 'npc_location',
      target: 'military-officers',
      value: 'tracked',
    },
    {
      type: 'quest_unlock',
      target: 'military-heist',
      value: 'available',
    },
  ],
  refreshRate: 'weekly',
  expires: 168,
  stackable: false,
  sourceNPC: 'fort-ashford-contact',
};

export const CRIMINAL_NETWORK_MAPS: IntelligenceItem = {
  id: 'criminal-network-maps',
  name: 'Criminal Network Maps',
  chineseName: 'Fàn Zuì Wǎng Luò Dì Tú',
  category: 'criminal',
  description: 'Complete map of Frontera operations and smuggling routes.',
  details: 'The network tracks all gang activity. Frontera hideouts, smuggling routes, stash houses - all revealed.',
  trustRequired: 3,
  cost: 250,
  effects: [
    {
      type: 'map_reveal',
      target: 'gang-locations',
      value: 'all-frontera',
    },
    {
      type: 'map_reveal',
      target: 'smuggling-routes',
      value: 'visible',
    },
    {
      type: 'secret_reveal',
      target: 'gang-operations',
      value: 'details',
    },
  ],
  refreshRate: 'weekly',
  stackable: false,
  sourceNPC: 'chen-wei',
};

export const POLITICAL_INTELLIGENCE: IntelligenceItem = {
  id: 'political-intelligence',
  name: 'Political Intelligence',
  chineseName: 'Zhèng Zhì Qíng Bào',
  category: 'political',
  description: 'Who\'s bribing who, complete power structure intelligence.',
  details: 'The network sees the money flows. Mayor takes bribes from railroad. Sheriff protects certain gangs. Judge is corrupt. All revealed.',
  trustRequired: 3,
  cost: 300,
  effects: [
    {
      type: 'secret_reveal',
      target: 'corruption',
      value: 'all-officials',
    },
    {
      type: 'quest_unlock',
      target: 'political-quests',
      value: 'multiple',
    },
    {
      type: 'npc_location',
      target: 'corrupt-officials',
      value: 'tracked',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'wong-li',
};

export const HIDDEN_CACHES_MAP: IntelligenceItem = {
  id: 'hidden-caches-map',
  name: 'Hidden Caches Map',
  chineseName: 'Yǐn Cáng Bǎo Cáng',
  category: 'geographic',
  description: 'Locations of hidden supply caches throughout the territory.',
  details: 'Chinese workers hid supplies for emergencies. Food, medicine, weapons, gold - scattered across the territory.',
  trustRequired: 3,
  cost: 200,
  effects: [
    {
      type: 'map_reveal',
      target: 'supply-caches',
      value: '15-locations',
    },
    {
      type: 'quest_unlock',
      target: 'treasure-hunt',
      value: 'available',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'old-zhang',
};

// ============================================================================
// TRUST LEVEL 4 INTELLIGENCE (Family)
// ============================================================================

export const COMPLETE_TERRITORY_MAP: IntelligenceItem = {
  id: 'complete-territory-map',
  name: 'Complete Territory Map',
  chineseName: 'Wán Zhěng Dì Tú',
  category: 'geographic',
  description: 'Every secret location, tunnel, cache, and hideout in the territory.',
  details: 'The ultimate map. Fifty years of Chinese exploration and construction revealed. Secret tunnels from the railroad era. Hidden caves. Ancient ruins. Smuggler tunnels. Everything.',
  trustRequired: 4,
  cost: 500,
  effects: [
    {
      type: 'map_reveal',
      target: 'all-locations',
      value: 'complete',
    },
    {
      type: 'map_reveal',
      target: 'tunnels',
      value: 'all-systems',
    },
    {
      type: 'map_reveal',
      target: 'secrets',
      value: 'all-caches',
    },
    {
      type: 'quest_unlock',
      target: 'legendary-locations',
      value: 'available',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'old-zhang',
};

export const BLACKMAIL_ARCHIVES: IntelligenceItem = {
  id: 'blackmail-archives',
  name: 'Blackmail Archives',
  chineseName: 'Lè Suǒ Dàng Àn',
  category: 'personal',
  description: 'Damaging secrets of major NPCs. Leverage over powerful people.',
  details: 'The network has compiled secrets over decades. Mayors, sheriffs, judges, gang leaders - everyone has skeletons. This archive contains proof.',
  trustRequired: 4,
  cost: 750,
  effects: [
    {
      type: 'secret_reveal',
      target: 'major-npcs',
      value: 'all-secrets',
    },
    {
      type: 'quest_unlock',
      target: 'blackmail-missions',
      value: 'all',
    },
    {
      type: 'secret_reveal',
      target: 'leverage-points',
      value: 'exploitable',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'wong-li',
};

export const RAILROAD_COMPANY_SECRETS: IntelligenceItem = {
  id: 'railroad-company-secrets',
  name: 'Railroad Company Secrets',
  chineseName: 'Tiě Lù Gōng Sī Mì Mì',
  category: 'political',
  description: 'Corruption, murders, and crimes of the railroad companies.',
  details: 'Chinese workers saw it all. Murdered strikers. Bribed officials. Stolen land. Unsafe conditions. Cover-ups. All documented.',
  trustRequired: 4,
  cost: 600,
  effects: [
    {
      type: 'secret_reveal',
      target: 'railroad-corruption',
      value: 'complete-evidence',
    },
    {
      type: 'quest_unlock',
      target: 'railroad-justice',
      value: 'chain',
    },
    {
      type: 'secret_reveal',
      target: 'mass-graves',
      value: 'locations',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'old-zhang',
};

export const SMUGGLING_OPERATIONS_INTEL: IntelligenceItem = {
  id: 'smuggling-operations-intel',
  name: 'Smuggling Operations Intel',
  chineseName: 'Zǒu Sī Qíng Bào',
  category: 'criminal',
  description: 'Complete details on all smuggling operations in the territory.',
  details: 'Opium dens, gun runners, stolen goods fences - the network knows them all. Times, routes, payments, protection.',
  trustRequired: 4,
  cost: 400,
  effects: [
    {
      type: 'map_reveal',
      target: 'smuggling-network',
      value: 'complete',
    },
    {
      type: 'schedule_access',
      target: 'smuggler-runs',
      value: 'all',
      duration: 168,
    },
    {
      type: 'quest_unlock',
      target: 'smuggling-quests',
      value: 'multiple',
    },
  ],
  refreshRate: 'weekly',
  expires: 168,
  stackable: false,
  sourceNPC: 'silent-wu',
};

// ============================================================================
// TRUST LEVEL 5 INTELLIGENCE (Dragon)
// ============================================================================

export const DRAGONS_KNOWLEDGE: IntelligenceItem = {
  id: 'dragons-knowledge',
  name: 'The Dragon\'s Knowledge',
  chineseName: 'Lóng Zhī Zhī Shì',
  category: 'personal',
  description: 'Complete network intelligence. Know everything the network knows.',
  details: 'You become part of the network\'s collective intelligence. Every secret, every schedule, every location. You see what they see.',
  trustRequired: 5,
  cost: 1000,
  effects: [
    {
      type: 'secret_reveal',
      target: 'everything',
      value: 'network-knowledge',
    },
    {
      type: 'schedule_access',
      target: 'all-npcs',
      value: 'complete',
    },
    {
      type: 'map_reveal',
      target: 'all',
      value: 'everything',
    },
    {
      type: 'npc_location',
      target: 'all-important',
      value: 'live-tracking',
    },
    {
      type: 'quest_unlock',
      target: 'dragon-exclusive',
      value: 'all',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'wong-li',
};

export const ANCIENT_TREASURE_MAP: IntelligenceItem = {
  id: 'ancient-treasure-map',
  name: 'Ancient Treasure Map',
  chineseName: 'Gǔ Dài Bǎo Cáng Tú',
  category: 'geographic',
  description: 'Map to a legendary treasure hidden before the American settlers arrived.',
  details: 'An ancient cache of Spanish gold, hidden by conquistadors in the 1600s. Chinese miners discovered clues. The network pieced together the location.',
  trustRequired: 5,
  cost: 1500,
  effects: [
    {
      type: 'map_reveal',
      target: 'legendary-treasure',
      value: 'location',
    },
    {
      type: 'quest_unlock',
      target: 'treasure-quest-chain',
      value: 'epic',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'wong-li',
};

export const SUPERNATURAL_SITES_GUIDE: IntelligenceItem = {
  id: 'supernatural-sites-guide',
  name: 'Supernatural Sites Guide',
  chineseName: 'Chāo Zì Rán Dì Diǎn',
  category: 'geographic',
  description: 'Locations where the veil between worlds is thin. Places of power.',
  details: 'The network has identified places where supernatural forces are strong. Native burial grounds, cursed mines, spirit crossings, dragon veins (ley lines).',
  trustRequired: 5,
  cost: 800,
  effects: [
    {
      type: 'map_reveal',
      target: 'supernatural-locations',
      value: 'all',
    },
    {
      type: 'quest_unlock',
      target: 'supernatural-quests',
      value: 'chain',
    },
    {
      type: 'secret_reveal',
      target: 'spirits',
      value: 'interaction-methods',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'chen-tao',
};

// ============================================================================
// SPECIAL INTELLIGENCE (Quest Rewards)
// ============================================================================

export const GOLDEN_SPIKE_LOCATION: IntelligenceItem = {
  id: 'golden-spike-location',
  name: 'Golden Spike Location',
  chineseName: 'Jīn Dīng Zi Wèi Zhì',
  category: 'geographic',
  description: 'The true location of the ceremonial golden spike - and what lies beneath.',
  details: 'The famous golden spike ceremony was a lie. Chinese workers know where the real spike is buried, along with a time capsule of forbidden truths.',
  trustRequired: 4,
  cost: 0,  // Quest-only, no gold cost
  effects: [
    {
      type: 'map_reveal',
      target: 'golden-spike',
      value: 'location',
    },
    {
      type: 'secret_reveal',
      target: 'railroad-truth',
      value: 'complete-history',
    },
    {
      type: 'quest_unlock',
      target: 'final-spike-quest',
      value: 'available',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  questUnlock: 'the-final-spike',
  sourceNPC: 'old-zhang',
};

export const NETWORK_MEMBER_DIRECTORY: IntelligenceItem = {
  id: 'network-member-directory',
  name: 'Network Member Directory',
  chineseName: 'Wǎng Luò Míng Dān',
  category: 'personal',
  description: 'Complete list of all Chinese Diaspora network members.',
  details: 'Every member, every location, every specialty. The complete network revealed.',
  trustRequired: 4,
  cost: 500,
  effects: [
    {
      type: 'npc_location',
      target: 'all-network-npcs',
      value: 'revealed',
    },
    {
      type: 'secret_reveal',
      target: 'npc-specialties',
      value: 'all',
    },
    {
      type: 'quest_unlock',
      target: 'network-quests',
      value: 'all',
    },
  ],
  refreshRate: 'permanent',
  stackable: false,
  sourceNPC: 'wong-li',
};

export const OPIUM_TRADE_INTELLIGENCE: IntelligenceItem = {
  id: 'opium-trade-intelligence',
  name: 'Opium Trade Intelligence',
  chineseName: 'Yā Piàn Mào Yì',
  category: 'criminal',
  description: 'Complete intelligence on opium smuggling operations.',
  details: 'Sensitive information about who controls the opium trade, routes from San Francisco, protection payments, and dens. Handle carefully.',
  trustRequired: 3,
  cost: 350,
  effects: [
    {
      type: 'map_reveal',
      target: 'opium-dens',
      value: 'all-locations',
    },
    {
      type: 'secret_reveal',
      target: 'opium-lords',
      value: 'identities',
    },
    {
      type: 'quest_unlock',
      target: 'opium-quests',
      value: 'multiple',
    },
  ],
  refreshRate: 'weekly',
  stackable: false,
  sourceNPC: 'wong-chen',
};

// ============================================================================
// EXPORTS
// ============================================================================

export const TRUST_LEVEL_2_INTEL: IntelligenceItem[] = [
  LAW_PATROL_SCHEDULES,
  MERCHANT_PRICE_LISTS,
  GOSSIP_NETWORK_ACCESS,
];

export const TRUST_LEVEL_3_INTEL: IntelligenceItem[] = [
  MILITARY_MOVEMENT_REPORTS,
  CRIMINAL_NETWORK_MAPS,
  POLITICAL_INTELLIGENCE,
  HIDDEN_CACHES_MAP,
  OPIUM_TRADE_INTELLIGENCE,
];

export const TRUST_LEVEL_4_INTEL: IntelligenceItem[] = [
  COMPLETE_TERRITORY_MAP,
  BLACKMAIL_ARCHIVES,
  RAILROAD_COMPANY_SECRETS,
  SMUGGLING_OPERATIONS_INTEL,
  NETWORK_MEMBER_DIRECTORY,
];

export const TRUST_LEVEL_5_INTEL: IntelligenceItem[] = [
  DRAGONS_KNOWLEDGE,
  ANCIENT_TREASURE_MAP,
  SUPERNATURAL_SITES_GUIDE,
];

export const QUEST_REWARD_INTEL: IntelligenceItem[] = [
  GOLDEN_SPIKE_LOCATION,
];

export const ALL_INTELLIGENCE: IntelligenceItem[] = [
  ...TRUST_LEVEL_2_INTEL,
  ...TRUST_LEVEL_3_INTEL,
  ...TRUST_LEVEL_4_INTEL,
  ...TRUST_LEVEL_5_INTEL,
  ...QUEST_REWARD_INTEL,
];

/**
 * Intelligence pricing by trust level
 */
export const INTEL_PRICE_MODIFIERS = {
  2: 1.0,   // Friend: Full price
  3: 0.85,  // Sibling: 15% discount
  4: 0.70,  // Family: 30% discount
  5: 0.50,  // Dragon: 50% discount
};

/**
 * Get intelligence items available at a trust level
 */
export function getIntelligenceByTrustLevel(trustLevel: number): IntelligenceItem[] {
  return ALL_INTELLIGENCE.filter(intel => intel.trustRequired <= trustLevel);
}

/**
 * Get intelligence price with trust discount
 */
export function getIntelligencePrice(intel: IntelligenceItem, trustLevel: number): number {
  const basePrice = intel.cost;
  const modifier = INTEL_PRICE_MODIFIERS[trustLevel as keyof typeof INTEL_PRICE_MODIFIERS] || 1.0;
  return Math.floor(basePrice * modifier);
}
