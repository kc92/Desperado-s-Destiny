/**
 * NPC Examples for Location Seeds
 *
 * Examples of how to add NPCs to location documents
 * Copy these patterns into your location seed files
 */

import { LocationNPC } from '@desperados/shared';

/**
 * Example: Saloon Bartender
 * A friendly NPC who offers quests and information
 */
export const SALOON_BARTENDER: LocationNPC = {
  id: 'saloon-bartender',
  name: 'Jake Morrison',
  title: 'Bartender',
  description: 'A grizzled bartender who knows everyone and everything in town. His ear is always to the ground.',
  personality: 'Friendly but cautious. Will open up with trust.',
  faction: 'settler',
  dialogue: [
    "What'll it be, stranger?", // Tier 1: Stranger (0-19)
    "You're new around here, ain't ya?",
    "Keep your nose clean and we'll get along fine.",
    "I serve drinks, not trouble.", // Tier 2: Acquaintance (20-39)
    "You're becoming a regular. I like that.",
    "I hear things behind this bar. Lots of things.",
    "Between you and me...", // Tier 3: Friend (40-59)
    "You know, there's more to this saloon than meets the eye.",
    "I trust you. Let me tell you about a little opportunity.",
    "The sheriff's been asking questions about someone matching your description.", // Tier 4: Trusted (60-79)
    "There's a secret room downstairs. Only a few know about it.",
    "I've got a business proposition that might interest you.",
    "You're one of the good ones. I'll always have your back.", // Tier 5: Confidant (80-100)
    "There's something I've never told anyone before...",
    "You're family now. The basement poker game runs every night at midnight."
  ],
  quests: ['npc:saloon-bartender:whiskey-runner', 'npc:saloon-bartender:rival-saloon'],
  isVendor: false,
  defaultTrust: 0
};

/**
 * Example: General Store Owner
 * A vendor NPC with a shop
 */
export const STORE_OWNER: LocationNPC = {
  id: 'general-store-owner',
  name: 'Martha Chen',
  title: 'Proprietor',
  description: 'A shrewd businesswoman who runs the best general store in the territory. Fair prices, quality goods.',
  personality: 'Professional and business-minded. Respects loyalty.',
  faction: 'settler',
  dialogue: [
    "Welcome to Chen's General Store!",
    "Looking for supplies?",
    "Quality goods at fair prices.",
    "I appreciate your continued business.",
    "You know, loyal customers get special deals.",
    "I've got some rare items in the back if you're interested.",
    "You've been such a good customer. Let me show you my exclusive inventory.",
    "Family discount for you, my friend.",
    "I've been holding this aside just for you."
  ],
  quests: ['npc:general-store-owner:missing-shipment'],
  isVendor: true,
  shopId: 'general-store-shop',
  defaultTrust: 0
};

/**
 * Example: Mysterious Stranger
 * High trust requirement, unlocks secrets
 */
export const MYSTERIOUS_STRANGER: LocationNPC = {
  id: 'mysterious-stranger',
  name: 'The Stranger',
  title: 'Wanderer',
  description: 'A cloaked figure who sits in the corner, watching. Nobody knows where they came from.',
  personality: 'Enigmatic and cryptic. Only speaks to those they deem worthy.',
  faction: undefined, // No faction
  dialogue: [
    "...", // Low trust = silence
    "*Stares silently*",
    "*Nods slightly*",
    "You have potential.",
    "Not many would dare approach me.",
    "There are forces at work you cannot see.",
    "The spirits speak of you.",
    "You walk a dangerous path, but you walk it well.",
    "I have been waiting for someone like you.",
    "There are things you must know.",
    "The old ways are not forgotten.",
    "The veil between worlds is thin here.",
    "You have proven yourself worthy of the truth.",
    "I will teach you what I know.",
    "The ancestors have chosen you."
  ],
  quests: [
    'npc:mysterious-stranger:spirit-quest',
    'npc:mysterious-stranger:ancient-ritual'
  ],
  isVendor: false,
  defaultTrust: 0
};

/**
 * Example: Corrupt Sheriff
 * Hostile NPC, negative interactions
 */
export const CORRUPT_SHERIFF: LocationNPC = {
  id: 'red-gulch-sheriff',
  name: 'Sheriff Clayton',
  title: 'Town Sheriff',
  description: 'The law in Red Gulch, but his badge is tarnished. Word is he can be bought.',
  personality: 'Corrupt and intimidating. Trust means leverage.',
  faction: 'settler',
  dialogue: [
    "Move along, drifter.",
    "I'm watching you.",
    "Don't cause trouble in my town.",
    "Stay on the right side of the law.",
    "You seem like a reasonable person. Unlike most around here.",
    "Sometimes the law needs... flexibility.",
    "I could use someone like you for a delicate matter.",
    "There are ways around the law, if you know who to ask.",
    "I've got my eyes on bigger fish than you.",
    "Let's just say I can look the other way... for a price.",
    "You and I could do business together.",
    "The Frontera gang pays me well, but I'm always open to better offers.",
    "You want to know what really happened that night? I'll tell you.",
    "I'm the real power in this town, not the mayor."
  ],
  quests: [
    'npc:red-gulch-sheriff:bribery-job',
    'npc:red-gulch-sheriff:frame-rival'
  ],
  isVendor: false,
  defaultTrust: 0
};

/**
 * Example: Medicine Woman
 * Nahi faction, spiritual quests
 */
export const MEDICINE_WOMAN: LocationNPC = {
  id: 'medicine-woman',
  name: 'White Owl',
  title: 'Medicine Woman',
  description: 'A respected healer and spiritual leader of the Nahi people. She communes with the spirits.',
  personality: 'Wise and spiritual. Values harmony and respect.',
  faction: 'nahi',
  dialogue: [
    "The spirits guided you here.",
    "Healing takes many forms.",
    "Respect the old ways.",
    "You carry pain with you.",
    "The spirits see your heart.",
    "There is strength in you, but also turmoil.",
    "The path of balance is not easy to walk.",
    "You are learning. That is good.",
    "The ancestors watch over you now.",
    "I sense great potential within you.",
    "You have been chosen for a greater purpose.",
    "The spirits have shown me your future. It is intertwined with ours.",
    "You are no longer an outsider. You are family.",
    "I will share the sacred knowledge with you.",
    "The Great Spirit has blessed our meeting."
  ],
  quests: [
    'npc:medicine-woman:sacred-herbs',
    'npc:medicine-woman:vision-quest',
    'npc:medicine-woman:spirit-guide'
  ],
  isVendor: true,
  shopId: 'medicine-lodge-shop',
  defaultTrust: 10 // Higher default for respectful characters
};

/**
 * Example: Gang Leader
 * Frontera faction, criminal quests
 */
export const GANG_LEADER: LocationNPC = {
  id: 'frontera-boss',
  name: 'El Carnicero',
  title: 'Gang Boss',
  description: 'The ruthless leader of a Frontera gang. His word is law in these parts.',
  personality: 'Dangerous and calculating. Respects strength.',
  faction: 'frontera',
  dialogue: [
    "You got business here?",
    "Speak quickly.",
    "I don't know you.",
    "You got guts coming here.",
    "I've heard of you.",
    "You're making a name for yourself.",
    "Strength respects strength.",
    "You could be useful to me.",
    "I have work that requires... discretion.",
    "You've proven yourself capable.",
    "You fight well. I respect that.",
    "The Frontera could use someone like you.",
    "You have earned my trust. That is not easily given.",
    "Welcome to the family, hermano.",
    "Together we will rule this territory."
  ],
  quests: [
    'npc:frontera-boss:territory-war',
    'npc:frontera-boss:rival-gang',
    'npc:frontera-boss:weapons-deal'
  ],
  isVendor: false,
  defaultTrust: 0
};

/**
 * Example: Quest-Giver Pattern
 *
 * In your quest seed, create quests with this pattern:
 */
export const EXAMPLE_NPC_QUEST = {
  questId: 'npc:saloon-bartender:whiskey-runner',
  name: "Jake's Whiskey Run",
  description: "The bartender needs someone to pick up a shipment of whiskey from the distillery.",
  type: 'side' as const,
  levelRequired: 3,
  prerequisites: [],
  objectives: [
    {
      id: 'obj-1',
      description: 'Travel to Mountain Pass Distillery',
      type: 'visit' as const,
      target: 'mountain-pass-distillery',
      required: 1
    },
    {
      id: 'obj-2',
      description: 'Pick up whiskey shipment',
      type: 'collect' as const,
      target: 'whiskey-crate',
      required: 1
    },
    {
      id: 'obj-3',
      description: 'Return to Jake at the saloon',
      type: 'visit' as const,
      target: 'npc:saloon-bartender',
      required: 1
    }
  ],
  rewards: [
    { type: 'gold', amount: 50 },
    { type: 'xp', amount: 100 },
    { type: 'reputation', amount: 5 } // Increases trust with Jake
  ],
  repeatable: true,
  isActive: true
};

/**
 * Example: Location with Secret Unlocked by NPC Trust
 */
export const EXAMPLE_LOCATION_WITH_SECRET = {
  name: 'Red Gulch Saloon',
  type: 'saloon',
  // ... other location fields
  npcs: [SALOON_BARTENDER],
  secrets: [
    {
      id: 'saloon-basement',
      name: 'Hidden Basement',
      description: 'A secret basement where high-stakes poker games run all night.',
      type: 'hidden_room',
      unlockCondition: {
        npcTrust: {
          npcId: 'saloon-bartender',
          level: 50 // Unlocks at FRIEND tier
        }
      },
      content: {
        actions: ['underground-poker', 'speak-with-informant'],
        dialogue: [
          "Jake: 'Welcome to the real saloon, friend.'",
          "You see several shady characters playing cards."
        ],
        rewards: {
          gold: 100,
          xp: 250
        }
      },
      isDiscovered: false
    },
    {
      id: 'saloon-smuggling-route',
      name: 'Smuggling Route',
      description: "Jake's secret smuggling operation.",
      type: 'secret_action',
      unlockCondition: {
        npcTrust: {
          npcId: 'saloon-bartender',
          level: 80 // Unlocks at CONFIDANT tier
        }
      },
      content: {
        actions: ['smuggle-goods'],
        dialogue: [
          "Jake: 'The route goes through the old mine. Tell 'em Jake sent you.'"
        ]
      },
      isDiscovered: false
    }
  ]
};

/**
 * How to use in your seed files:
 *
 * 1. Import these examples or create similar NPCs
 * 2. Add them to your location's npcs array
 * 3. Create quests with matching NPC IDs
 * 4. Add secrets with npcTrust unlock conditions
 * 5. NPCs will automatically appear in buildings and trigger trust system
 */
