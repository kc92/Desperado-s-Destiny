/**
 * NPC Personality Definitions
 *
 * Defines personality traits and base moods for all key NPCs in the game world
 */

import { NPCPersonality, PersonalityType, MoodType } from '@desperados/shared';

/**
 * Predefined NPC personalities for key NPCs
 * These define how each NPC reacts to world events, weather, and player actions
 */
export const NPC_PERSONALITIES: NPCPersonality[] = [
  // SALOON & ENTERTAINMENT
  {
    npcId: 'bartender_01',
    name: 'Jake "Whiskey" McGraw',
    role: 'bartender',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    moodVolatility: 0.7,
    likesWeather: ['CLEAR', 'RAIN'],
    dislikesWeather: ['DUST_STORM', 'SANDSTORM'],
    notes: 'Loves serving drinks and hearing stories. Rain brings more customers indoors.',
  },
  {
    npcId: 'saloon_girl_01',
    name: 'Ruby Heart',
    role: 'saloon_girl',
    personality: PersonalityType.MELANCHOLIC,
    baseMood: MoodType.SAD,
    moodVolatility: 1.2,
    likesWeather: ['CLEAR'],
    dislikesWeather: ['RAIN', 'FOG'],
    notes: 'Puts on a brave face but carries deep sorrow. Weather affects her mood significantly.',
  },
  {
    npcId: 'piano_player_01',
    name: 'Fingers O\'Malley',
    role: 'musician',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.CONTENT,
    moodVolatility: 0.5,
    likesWeather: ['CLOUDY', 'RAIN'],
    dislikesWeather: ['HEAT_WAVE'],
    notes: 'Music keeps him content. Heat makes his fingers swell.',
  },

  // LAW ENFORCEMENT
  {
    npcId: 'sheriff_01',
    name: 'Marshal Cole Striker',
    role: 'sheriff',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.3,
    likesWeather: ['CLEAR'],
    dislikesWeather: ['SANDSTORM', 'DUST_STORM'],
    notes: 'Professional and unflappable. Rarely shows emotion. Crime wave makes him suspicious.',
  },
  {
    npcId: 'deputy_01',
    name: 'Deputy Billy Crane',
    role: 'deputy',
    personality: PersonalityType.NERVOUS,
    baseMood: MoodType.FEARFUL,
    moodVolatility: 1.5,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['THUNDERSTORM', 'SUPERNATURAL_MIST'],
    notes: 'Young and easily spooked. Supernatural events terrify him.',
  },

  // MERCHANTS
  {
    npcId: 'general_store_01',
    name: 'Samuel Goodwin',
    role: 'shopkeeper',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    moodVolatility: 0.8,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['SANDSTORM', 'DUST_STORM'],
    notes: 'Always ready to make a sale. Bad weather keeps customers away, making him anxious.',
  },
  {
    npcId: 'blacksmith_01',
    name: 'Gruff McIron',
    role: 'blacksmith',
    personality: PersonalityType.GRUMPY,
    baseMood: MoodType.ANNOYED,
    moodVolatility: 0.4,
    likesWeather: ['RAIN', 'COLD_SNAP'],
    dislikesWeather: ['HEAT_WAVE'],
    notes: 'Perpetually grumpy. Heat waves make his forge unbearable. Rain cools the shop.',
  },
  {
    npcId: 'gunsmith_01',
    name: 'Winchester Pete',
    role: 'gunsmith',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.5,
    likesWeather: ['CLEAR'],
    dislikesWeather: ['RAIN', 'FOG'],
    notes: 'All business. Moisture damages his inventory, making him irritable.',
  },
  {
    npcId: 'apothecary_01',
    name: 'Doc Holloway',
    role: 'doctor',
    personality: PersonalityType.NERVOUS,
    baseMood: MoodType.FEARFUL,
    moodVolatility: 1.3,
    likesWeather: ['CLOUDY'],
    dislikesWeather: ['DUST_STORM', 'SANDSTORM'],
    notes: 'Worries about patients constantly. Dust storms bring respiratory cases.',
  },

  // SPIRITUAL & MYSTICAL
  {
    npcId: 'priest_01',
    name: 'Father Thomas',
    role: 'priest',
    personality: PersonalityType.MELANCHOLIC,
    baseMood: MoodType.SAD,
    moodVolatility: 0.6,
    likesWeather: ['RAIN', 'CLOUDY'],
    dislikesWeather: ['SUPERNATURAL_MIST', 'REALITY_DISTORTION'],
    notes: 'Burdened by the sins he hears in confession. Supernatural weather disturbs him.',
  },
  {
    npcId: 'shaman_01',
    name: 'Running Water',
    role: 'shaman',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.4,
    likesWeather: ['SUPERNATURAL_MIST', 'THUNDERBIRD_STORM'],
    dislikesWeather: ['HEAT_WAVE'],
    notes: 'Connected to the spirit world. Supernatural weather energizes him.',
  },
  {
    npcId: 'fortune_teller_01',
    name: 'Madame Mystique',
    role: 'fortune_teller',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.SUSPICIOUS,
    moodVolatility: 1.8,
    likesWeather: ['FOG', 'SUPERNATURAL_MIST'],
    dislikesWeather: ['CLEAR'],
    notes: 'Mood swings wildly. Clear weather reduces mystical atmosphere she cultivates.',
  },

  // OUTLAWS & CRIMINALS
  {
    npcId: 'outlaw_leader_01',
    name: 'Black Jack Cassidy',
    role: 'outlaw_leader',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.ANGRY,
    moodVolatility: 2.0,
    likesWeather: ['DUST_STORM', 'FOG'],
    dislikesWeather: ['CLEAR'],
    notes: 'Unpredictable and dangerous. Loves cover for robberies. Clear days frustrate him.',
  },
  {
    npcId: 'fence_01',
    name: 'Sly Willie',
    role: 'fence',
    personality: PersonalityType.SUSPICIOUS,
    baseMood: MoodType.SUSPICIOUS,
    moodVolatility: 1.0,
    likesWeather: ['FOG', 'DUST_STORM'],
    dislikesWeather: ['CLEAR'],
    notes: 'Always watching his back. Clear weather makes him paranoid about being watched.',
  },

  // TRAVELERS & MERCHANTS
  {
    npcId: 'stagecoach_driver_01',
    name: 'Old Bill',
    role: 'driver',
    personality: PersonalityType.GRUMPY,
    baseMood: MoodType.ANNOYED,
    moodVolatility: 0.9,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['SANDSTORM', 'THUNDERSTORM', 'DUST_STORM'],
    notes: 'Years on the trail have made him cranky. Bad weather delays his routes.',
  },
  {
    npcId: 'traveling_merchant_01',
    name: 'Ezekiel Goldstein',
    role: 'merchant',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.EXCITED,
    moodVolatility: 0.7,
    likesWeather: ['CLEAR'],
    dislikesWeather: ['RAIN', 'SANDSTORM'],
    notes: 'Excited about sales opportunities. Bad weather ruins his goods.',
  },

  // LOCALS & WORKERS
  {
    npcId: 'stable_master_01',
    name: 'Rusty Jenkins',
    role: 'stable_master',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.CONTENT,
    moodVolatility: 0.5,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['HEAT_WAVE', 'COLD_SNAP'],
    notes: 'Calm around animals. Extreme temperatures make horses difficult.',
  },
  {
    npcId: 'miner_01',
    name: 'Dusty Pete',
    role: 'miner',
    personality: PersonalityType.GRUMPY,
    baseMood: MoodType.ANNOYED,
    moodVolatility: 0.6,
    likesWeather: ['CLOUDY', 'RAIN'],
    dislikesWeather: ['HEAT_WAVE', 'DUST_STORM'],
    notes: 'Hard life underground makes him perpetually irritable.',
  },
  {
    npcId: 'rancher_01',
    name: 'Big Jim Calhoun',
    role: 'rancher',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.4,
    likesWeather: ['RAIN', 'CLOUDY'],
    dislikesWeather: ['HEAT_WAVE', 'DUST_STORM'],
    notes: 'Weathered by years on the range. Rain means water for cattle.',
  },

  // SPECIAL NPCS
  {
    npcId: 'mysterious_stranger_01',
    name: 'The Stranger',
    role: 'mysterious',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.1,
    likesWeather: ['SUPERNATURAL_MIST', 'REALITY_DISTORTION'],
    dislikesWeather: [],
    notes: 'Never shows emotion. Seems to appear during supernatural events.',
  },
  {
    npcId: 'town_drunk_01',
    name: 'Whiskey Joe',
    role: 'drunk',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.DRUNK,
    moodVolatility: 2.0,
    likesWeather: ['RAIN'],
    dislikesWeather: ['HEAT_WAVE'],
    notes: 'Perpetually drunk. Mood swings wildly. Heat makes him more irritable.',
  },

  // WANDERING ENTERTAINERS
  {
    npcId: 'entertainer_piano_pete',
    name: 'Piano Pete Patterson',
    role: 'entertainer',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    moodVolatility: 0.7,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['RAIN'],
    notes: 'Jovial saloon pianist and gossip collector. Rain keeps customers away.',
  },
  {
    npcId: 'entertainer_alonzo',
    name: 'The Amazing Alonzo',
    role: 'entertainer',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.EXCITED,
    moodVolatility: 1.5,
    likesWeather: ['CLEAR', 'FOG'],
    dislikesWeather: ['RAIN', 'DUST_STORM'],
    notes: 'Flamboyant magician. Fog adds mystique, storms ruin outdoor performances.',
  },
  {
    npcId: 'entertainer_rosa',
    name: 'Rosa "La Cantante" Velazquez',
    role: 'entertainer',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.5,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['DUST_STORM', 'SANDSTORM'],
    notes: 'Passionate singer and hidden revolutionary. Professional regardless of weather.',
  },
  {
    npcId: 'entertainer_ezekiel',
    name: 'Old Ezekiel',
    role: 'storyteller',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    moodVolatility: 0.2,
    likesWeather: ['SUPERNATURAL_MIST', 'FOG', 'THUNDERSTORM'],
    dislikesWeather: [],
    notes: 'Ancient storyteller. Dramatic weather enhances his supernatural tales.',
  },
  {
    npcId: 'entertainer_crimson_dancers',
    name: 'The Crimson Dancers',
    role: 'entertainer',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.EXCITED,
    moodVolatility: 0.8,
    likesWeather: ['CLEAR', 'CLOUDY'],
    dislikesWeather: ['RAIN', 'HEAT_WAVE'],
    notes: 'Professional dance troupe. Heat exhausts them, rain cancels outdoor shows.',
  },
  {
    npcId: 'entertainer_harmonica_joe',
    name: 'Harmonica Joe',
    role: 'entertainer',
    personality: PersonalityType.MELANCHOLIC,
    baseMood: MoodType.SAD,
    moodVolatility: 0.4,
    likesWeather: ['RAIN', 'FOG', 'CLOUDY'],
    dislikesWeather: ['CLEAR', 'HEAT_WAVE'],
    notes: 'Melancholic blues player. Sad weather matches his music. Sunshine feels wrong.',
  },
  {
    npcId: 'entertainer_buffalo_bill',
    name: 'Buffalo Bill Cody',
    role: 'entertainer',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.EXCITED,
    moodVolatility: 0.6,
    likesWeather: ['CLEAR'],
    dislikesWeather: ['RAIN', 'DUST_STORM', 'THUNDERSTORM'],
    notes: 'Wild West showman. Needs good weather for outdoor performances.',
  },
  {
    npcId: 'entertainer_madame_fortuna',
    name: 'Madame Fortuna',
    role: 'fortune_teller',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.SUSPICIOUS,
    moodVolatility: 1.8,
    likesWeather: ['FOG', 'SUPERNATURAL_MIST', 'CLOUDY'],
    dislikesWeather: ['CLEAR', 'HEAT_WAVE'],
    notes: 'Mysterious fortune teller. Mystical weather enhances her readings.',
  },
  {
    npcId: 'entertainer_preachers_choir',
    name: 'The Preacher\'s Choir',
    role: 'entertainer',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.CONTENT,
    moodVolatility: 0.3,
    likesWeather: ['CLEAR', 'CLOUDY', 'RAIN'],
    dislikesWeather: ['SUPERNATURAL_MIST', 'REALITY_DISTORTION'],
    notes: 'Gospel singers. Accept all natural weather as God\'s will. Supernatural disturbs them.',
  },
  {
    npcId: 'entertainer_whiskey_willy',
    name: 'Whiskey Willy',
    role: 'comedian',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    moodVolatility: 0.9,
    likesWeather: ['CLEAR', 'RAIN'],
    dislikesWeather: ['DUST_STORM'],
    notes: 'Quick-witted comedian. Rain means full saloons. Dust storms ruin his voice.',
  },
];

/**
 * Get personality for an NPC by ID
 */
export function getNPCPersonality(npcId: string): NPCPersonality | undefined {
  return NPC_PERSONALITIES.find(p => p.npcId === npcId);
}

/**
 * Get all NPCs with a specific role
 */
export function getNPCsByRole(role: string): NPCPersonality[] {
  return NPC_PERSONALITIES.filter(p => p.role === role);
}

/**
 * Get all NPCs with a specific personality type
 */
export function getNPCsByPersonality(personality: PersonalityType): NPCPersonality[] {
  return NPC_PERSONALITIES.filter(p => p.personality === personality);
}

/**
 * Default personality for NPCs without a defined personality
 */
export const DEFAULT_NPC_PERSONALITY: NPCPersonality = {
  npcId: 'default',
  name: 'Unknown NPC',
  role: 'citizen',
  personality: PersonalityType.STOIC,
  baseMood: MoodType.NEUTRAL,
  moodVolatility: 0.5,
  notes: 'Default personality for undefined NPCs',
};
