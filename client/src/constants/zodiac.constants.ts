/**
 * Frontier Zodiac Constants
 * Western-themed zodiac sign definitions
 */

import type { FrontierSign, ZodiacSignId } from '@/types/zodiac.types';

/** Sign color configurations */
export const SIGN_COLORS: Record<ZodiacSignId, {
  primary: string;
  secondary: string;
  gradient: string;
  glow: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  prospector: {
    primary: 'amber-500',
    secondary: 'orange-600',
    gradient: 'from-amber-500 via-yellow-500 to-orange-600',
    glow: 'rgba(245, 158, 11, 0.6)',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/50',
  },
  coyote: {
    primary: 'amber-700',
    secondary: 'purple-600',
    gradient: 'from-amber-700 via-stone-500 to-purple-600',
    glow: 'rgba(180, 83, 9, 0.6)',
    bgClass: 'bg-amber-700/20',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-700/50',
  },
  stallion: {
    primary: 'orange-700',
    secondary: 'green-600',
    gradient: 'from-orange-700 via-amber-600 to-green-600',
    glow: 'rgba(194, 65, 12, 0.6)',
    bgClass: 'bg-orange-700/20',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-700/50',
  },
  rattlesnake: {
    primary: 'lime-500',
    secondary: 'gray-900',
    gradient: 'from-lime-500 via-green-600 to-gray-900',
    glow: 'rgba(132, 204, 22, 0.6)',
    bgClass: 'bg-lime-500/20',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500/50',
  },
  eagle: {
    primary: 'yellow-500',
    secondary: 'amber-800',
    gradient: 'from-yellow-400 via-amber-500 to-amber-800',
    glow: 'rgba(234, 179, 8, 0.6)',
    bgClass: 'bg-yellow-500/20',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/50',
  },
  longhorn: {
    primary: 'amber-800',
    secondary: 'orange-600',
    gradient: 'from-amber-800 via-yellow-700 to-orange-600',
    glow: 'rgba(146, 64, 14, 0.6)',
    bgClass: 'bg-amber-800/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-800/50',
  },
  gunslinger: {
    primary: 'slate-500',
    secondary: 'red-600',
    gradient: 'from-slate-500 via-gray-600 to-red-600',
    glow: 'rgba(100, 116, 139, 0.6)',
    bgClass: 'bg-slate-500/20',
    textClass: 'text-slate-300',
    borderClass: 'border-slate-500/50',
  },
  'cactus-flower': {
    primary: 'green-600',
    secondary: 'pink-500',
    gradient: 'from-green-600 via-emerald-500 to-pink-500',
    glow: 'rgba(22, 163, 74, 0.6)',
    bgClass: 'bg-green-600/20',
    textClass: 'text-green-400',
    borderClass: 'border-green-600/50',
  },
  vulture: {
    primary: 'gray-800',
    secondary: 'stone-200',
    gradient: 'from-gray-800 via-gray-600 to-stone-200',
    glow: 'rgba(31, 41, 55, 0.6)',
    bgClass: 'bg-gray-800/20',
    textClass: 'text-gray-300',
    borderClass: 'border-gray-700/50',
  },
  tumbleweed: {
    primary: 'yellow-700',
    secondary: 'sky-500',
    gradient: 'from-yellow-700 via-amber-600 to-sky-500',
    glow: 'rgba(161, 98, 7, 0.6)',
    bgClass: 'bg-yellow-700/20',
    textClass: 'text-yellow-500',
    borderClass: 'border-yellow-700/50',
  },
  wolf: {
    primary: 'gray-500',
    secondary: 'red-700',
    gradient: 'from-gray-500 via-slate-600 to-red-700',
    glow: 'rgba(107, 114, 128, 0.6)',
    bgClass: 'bg-gray-500/20',
    textClass: 'text-gray-300',
    borderClass: 'border-gray-500/50',
  },
  'north-star': {
    primary: 'white',
    secondary: 'yellow-400',
    gradient: 'from-white via-yellow-100 to-yellow-400',
    glow: 'rgba(255, 255, 255, 0.8)',
    bgClass: 'bg-white/20',
    textClass: 'text-yellow-100',
    borderClass: 'border-yellow-200/50',
  },
};

/** All 12 Frontier Zodiac Signs */
export const FRONTIER_SIGNS: FrontierSign[] = [
  {
    id: 'prospector',
    name: 'The Prospector',
    symbol: 'pickaxe',
    iconEmoji: '⛏️',
    theme: 'Fortune & Determination',
    description: 'Those born under the Prospector are driven by the pursuit of riches and glory.',
    lore: 'When the first gold was found in the Sangre River, the stars aligned in the shape of a pickaxe. Ever since, those born under this sign have an uncanny ability to find fortune where others see only dust.',
    startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
    peakMonth: 2, peakDay: 4,
    colors: {
      primary: 'amber-500',
      secondary: 'orange-600',
      gradient: 'from-amber-500 to-orange-600',
      glow: 'rgba(245, 158, 11, 0.6)',
    },
    bonuses: [
      { id: 'prospector-gold', type: 'gold_multiplier', name: 'Fortune Seeker', description: '+15% gold from all sources', value: 15, isActive: true },
      { id: 'prospector-luck', type: 'luck_increase', name: 'Lucky Strike', description: '+10% rare item discovery', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'prospector-peak-gold', type: 'gold_multiplier', name: 'Golden Rush', description: '+50% gold during peak day', value: 50, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['old-dusty-dan', 'claim-jumper-clem'],
    exclusiveBounties: ['lost-mine-mystery', 'gold-thief-gang'],
    specialQuests: ['mother-lode-legend'],
  },
  {
    id: 'coyote',
    name: 'The Coyote',
    symbol: 'coyote',
    iconEmoji: '🐺',
    theme: 'Cunning & Adaptability',
    description: 'Coyotes are survivors, tricksters who thrive in chaos and turn misfortune to advantage.',
    lore: 'The old Nahi tell of Coyote, the first trickster, whose spirit dances among the stars. Those born under his sign walk between worlds, never quite what they seem.',
    startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
    peakMonth: 3, peakDay: 5,
    colors: {
      primary: 'amber-700',
      secondary: 'purple-600',
      gradient: 'from-amber-700 to-purple-600',
      glow: 'rgba(180, 83, 9, 0.6)',
    },
    bonuses: [
      { id: 'coyote-crime', type: 'crime_success', name: 'Trickster\'s Luck', description: '+12% crime success rate', value: 12, isActive: true },
      { id: 'coyote-stealth', type: 'stealth_bonus', name: 'Shadow Walker', description: '+8% escape chance', value: 8, isActive: true },
    ],
    peakBonuses: [
      { id: 'coyote-peak', type: 'crime_success', name: 'Coyote Moon', description: '+35% crime success during peak day', value: 35, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['desert-witch-maria', 'trickster-tom'],
    exclusiveBounties: ['phantom-rustler', 'moonlight-bandit'],
    specialQuests: ['coyotes-bargain'],
  },
  {
    id: 'stallion',
    name: 'The Stallion',
    symbol: 'horse',
    iconEmoji: '🐎',
    theme: 'Freedom & Power',
    description: 'Wild and untameable, Stallions charge through life with unmatched passion and strength.',
    lore: 'The great Stallion runs eternal across the night sky, leading the wild herds of the spirit world. His children on earth share his fierce independence.',
    startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
    peakMonth: 4, peakDay: 5,
    colors: {
      primary: 'orange-700',
      secondary: 'green-600',
      gradient: 'from-orange-700 to-green-600',
      glow: 'rgba(194, 65, 12, 0.6)',
    },
    bonuses: [
      { id: 'stallion-travel', type: 'travel_speed', name: 'Wild Runner', description: '+20% travel speed', value: 20, isActive: true },
      { id: 'stallion-combat', type: 'combat_power', name: 'Charging Strike', description: '+8% first strike damage', value: 8, isActive: true },
    ],
    peakBonuses: [
      { id: 'stallion-peak', type: 'travel_speed', name: 'Spirit Run', description: 'Free fast travel during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['wild-horse-hannah', 'mustang-mike'],
    exclusiveBounties: ['horse-thief-king', 'phantom-rider'],
    specialQuests: ['wild-heart-quest'],
  },
  {
    id: 'rattlesnake',
    name: 'The Rattlesnake',
    symbol: 'snake',
    iconEmoji: '🐍',
    theme: 'Danger & Patience',
    description: 'Rattlesnakes wait in perfect stillness before striking with deadly precision.',
    lore: 'In the burning sands, the Rattlesnake watches. Patient. Deadly. Those born under this sign know that the greatest power lies in the moment before action.',
    startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
    peakMonth: 5, peakDay: 5,
    colors: {
      primary: 'lime-500',
      secondary: 'gray-900',
      gradient: 'from-lime-500 to-gray-900',
      glow: 'rgba(132, 204, 22, 0.6)',
    },
    bonuses: [
      { id: 'snake-combat', type: 'combat_power', name: 'Venom Strike', description: '+15% critical hit damage', value: 15, isActive: true },
      { id: 'snake-stealth', type: 'stealth_bonus', name: 'Coiled Patience', description: '+10% ambush bonus', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'snake-peak', type: 'combat_power', name: 'Death Rattle', description: 'Guaranteed critical on first strike during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['snake-oil-sam', 'viper-victoria'],
    exclusiveBounties: ['desert-assassin', 'poison-trader'],
    specialQuests: ['serpents-wisdom'],
  },
  {
    id: 'eagle',
    name: 'The Eagle',
    symbol: 'eagle',
    iconEmoji: '🦅',
    theme: 'Vision & Honor',
    description: 'Eagles soar above the petty concerns of others, seeing truth where others see shadow.',
    lore: 'The Eagle carries the prayers of the righteous to the Great Spirit. Those born under its wings are blessed with far-seeing eyes and noble hearts.',
    startMonth: 5, startDay: 21, endMonth: 6, endDay: 21,
    peakMonth: 6, peakDay: 6,
    colors: {
      primary: 'yellow-500',
      secondary: 'amber-800',
      gradient: 'from-yellow-400 to-amber-800',
      glow: 'rgba(234, 179, 8, 0.6)',
    },
    bonuses: [
      { id: 'eagle-rep', type: 'reputation_gain', name: 'Noble Bearing', description: '+15% reputation gains', value: 15, isActive: true },
      { id: 'eagle-xp', type: 'xp_multiplier', name: 'Eagle Eye', description: '+10% XP from quests', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'eagle-peak', type: 'reputation_gain', name: 'Spirit Flight', description: '+40% reputation during peak day', value: 40, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['chief-soaring-hawk', 'marshal-noble'],
    exclusiveBounties: ['oath-breaker', 'false-prophet'],
    specialQuests: ['eagles-truth'],
  },
  {
    id: 'longhorn',
    name: 'The Longhorn',
    symbol: 'bull',
    iconEmoji: '🐂',
    theme: 'Strength & Stubbornness',
    description: 'Longhorns are immovable forces, their determination as legendary as their horns.',
    lore: 'The great herds that cross the plains are led by the strongest. The Longhorn in the sky reminds us that true strength is not in the charge, but in standing firm.',
    startMonth: 6, startDay: 22, endMonth: 7, endDay: 22,
    peakMonth: 7, peakDay: 7,
    colors: {
      primary: 'amber-800',
      secondary: 'orange-600',
      gradient: 'from-amber-800 to-orange-600',
      glow: 'rgba(146, 64, 14, 0.6)',
    },
    bonuses: [
      { id: 'longhorn-combat', type: 'combat_power', name: 'Iron Hide', description: '+12% damage resistance', value: 12, isActive: true },
      { id: 'longhorn-energy', type: 'energy_regen', name: 'Enduring Spirit', description: '+10% max energy', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'longhorn-peak', type: 'combat_power', name: 'Unstoppable', description: '50% damage reduction during peak day', value: 50, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['cattle-baron-bart', 'ranch-hand-rosa'],
    exclusiveBounties: ['cattle-rustler-king', 'range-war'],
    specialQuests: ['longhorns-legacy'],
  },
  {
    id: 'gunslinger',
    name: 'The Gunslinger',
    symbol: 'pistols',
    iconEmoji: '🔫',
    theme: 'Speed & Precision',
    description: 'Gunslingers live on the edge, where a split-second determines life or death.',
    lore: 'When iron first sang in the West, the stars formed crossed pistols in memorial. The Gunslinger\'s children draw faster than thought.',
    startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
    peakMonth: 8, peakDay: 8,
    colors: {
      primary: 'slate-500',
      secondary: 'red-600',
      gradient: 'from-slate-500 to-red-600',
      glow: 'rgba(100, 116, 139, 0.6)',
    },
    bonuses: [
      { id: 'gunslinger-combat', type: 'combat_power', name: 'Quick Draw', description: '+18% attack speed', value: 18, isActive: true },
      { id: 'gunslinger-skill', type: 'skill_boost', name: 'Dead Shot', description: '+12% marksmanship XP', value: 12, isActive: true },
    ],
    peakBonuses: [
      { id: 'gunslinger-peak', type: 'combat_power', name: 'High Noon', description: 'Double damage in duels during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['quick-draw-quinn', 'iron-jane'],
    exclusiveBounties: ['legendary-duellist', 'fastest-gun'],
    specialQuests: ['gunslingers-code'],
  },
  {
    id: 'cactus-flower',
    name: 'The Cactus Flower',
    symbol: 'cactus',
    iconEmoji: '🌵',
    theme: 'Beauty & Resilience',
    description: 'Like the desert flower, those born under this sign find beauty in hardship.',
    lore: 'The Cactus Flower blooms but once a year, and on that night, the desert becomes an ocean of color. Such rare beauty marks those born under its light.',
    startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
    peakMonth: 9, peakDay: 8,
    colors: {
      primary: 'green-600',
      secondary: 'pink-500',
      gradient: 'from-green-600 to-pink-500',
      glow: 'rgba(22, 163, 74, 0.6)',
    },
    bonuses: [
      { id: 'cactus-crafting', type: 'crafting_bonus', name: 'Desert Bloom', description: '+15% crafting success', value: 15, isActive: true },
      { id: 'cactus-rep', type: 'reputation_gain', name: 'Rare Beauty', description: '+10% NPC favor', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'cactus-peak', type: 'crafting_bonus', name: 'Perfect Bloom', description: 'Masterwork chance +50% during peak day', value: 50, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['herbalist-helena', 'desert-artist-diego'],
    exclusiveBounties: ['poison-flower', 'rare-herb-thief'],
    specialQuests: ['desert-garden'],
  },
  {
    id: 'vulture',
    name: 'The Vulture',
    symbol: 'vulture',
    iconEmoji: '🦃',
    theme: 'Death & Renewal',
    description: 'Vultures are misunderstood guardians who clean what others fear to touch.',
    lore: 'The Vulture circles where life ends, but from death comes new beginning. Those born under this sign understand that endings are merely transformations.',
    startMonth: 9, startDay: 23, endMonth: 10, endDay: 23,
    peakMonth: 10, peakDay: 10,
    colors: {
      primary: 'gray-800',
      secondary: 'stone-200',
      gradient: 'from-gray-800 to-stone-200',
      glow: 'rgba(31, 41, 55, 0.6)',
    },
    bonuses: [
      { id: 'vulture-loot', type: 'gold_multiplier', name: 'Carrion Finder', description: '+20% loot from defeated enemies', value: 20, isActive: true },
      { id: 'vulture-stealth', type: 'stealth_bonus', name: 'Death\'s Shadow', description: '+15% crime rewards', value: 15, isActive: true },
    ],
    peakBonuses: [
      { id: 'vulture-peak', type: 'special', name: 'Circle of Death', description: 'Guaranteed rare loot during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['gravedigger-gus', 'bone-collector'],
    exclusiveBounties: ['grave-robber', 'death-dealer'],
    specialQuests: ['vultures-gift'],
  },
  {
    id: 'tumbleweed',
    name: 'The Tumbleweed',
    symbol: 'tumbleweed',
    iconEmoji: '🌀',
    theme: 'Wandering & Freedom',
    description: 'Tumbleweeds go wherever the wind takes them, never bound to one place.',
    lore: 'The Tumbleweed has no roots but touches all the land. Those born under this sign are eternal wanderers, finding home in the journey itself.',
    startMonth: 10, startDay: 24, endMonth: 11, endDay: 21,
    peakMonth: 11, peakDay: 7,
    colors: {
      primary: 'yellow-700',
      secondary: 'sky-500',
      gradient: 'from-yellow-700 to-sky-500',
      glow: 'rgba(161, 98, 7, 0.6)',
    },
    bonuses: [
      { id: 'tumbleweed-travel', type: 'travel_speed', name: 'Wind Walker', description: '+25% travel speed', value: 25, isActive: true },
      { id: 'tumbleweed-luck', type: 'luck_increase', name: 'Wanderer\'s Luck', description: '+12% random encounter rewards', value: 12, isActive: true },
    ],
    peakBonuses: [
      { id: 'tumbleweed-peak', type: 'travel_speed', name: 'Spirit Wind', description: 'Instant travel anywhere during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['drifter-dave', 'vagabond-vicky'],
    exclusiveBounties: ['mystery-stranger', 'ghost-town-secrets'],
    specialQuests: ['endless-road'],
  },
  {
    id: 'wolf',
    name: 'The Wolf',
    symbol: 'wolf',
    iconEmoji: '🐺',
    theme: 'Pack & Loyalty',
    description: 'Wolves are fierce protectors who draw strength from their pack.',
    lore: 'The Wolf howls at the moon, calling to its kin across the vastness. Those born under this sign know that true strength lies in those who stand beside you.',
    startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
    peakMonth: 12, peakDay: 7,
    colors: {
      primary: 'gray-500',
      secondary: 'red-700',
      gradient: 'from-gray-500 to-red-700',
      glow: 'rgba(107, 114, 128, 0.6)',
    },
    bonuses: [
      { id: 'wolf-gang', type: 'special', name: 'Pack Tactics', description: '+15% gang activity rewards', value: 15, isActive: true },
      { id: 'wolf-combat', type: 'combat_power', name: 'Alpha Strike', description: '+10% damage with allies nearby', value: 10, isActive: true },
    ],
    peakBonuses: [
      { id: 'wolf-peak', type: 'special', name: 'Blood Moon', description: 'Double gang rewards during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['pack-leader-logan', 'she-wolf-sarah'],
    exclusiveBounties: ['lone-wolf', 'pack-hunter'],
    specialQuests: ['wolfs-call'],
  },
  {
    id: 'north-star',
    name: 'The North Star',
    symbol: 'star',
    iconEmoji: '⭐',
    theme: 'Guidance & Destiny',
    description: 'The North Star is the guiding light, showing the way to all who are lost.',
    lore: 'The North Star has guided travelers since time began. Those born under its eternal light are destined to lead others to their fate.',
    startMonth: 12, startDay: 22, endMonth: 1, endDay: 19,
    peakMonth: 1, peakDay: 5,
    colors: {
      primary: 'white',
      secondary: 'yellow-400',
      gradient: 'from-white to-yellow-400',
      glow: 'rgba(255, 255, 255, 0.8)',
    },
    bonuses: [
      { id: 'star-xp', type: 'xp_multiplier', name: 'Guiding Light', description: '+15% XP from all sources', value: 15, isActive: true },
      { id: 'star-rep', type: 'reputation_gain', name: 'Destined Leader', description: '+12% faction standing', value: 12, isActive: true },
    ],
    peakBonuses: [
      { id: 'star-peak', type: 'special', name: 'Celestial Blessing', description: 'All bonuses doubled during peak day', value: 100, isActive: false, isPeakBonus: true },
    ],
    exclusiveNPCs: ['stargazer-stella', 'prophet-peter'],
    exclusiveBounties: ['false-star', 'destiny-thief'],
    specialQuests: ['polaris-path'],
  },
];

/** Get sign by ID */
export function getSignById(id: ZodiacSignId): FrontierSign | undefined {
  return FRONTIER_SIGNS.find(sign => sign.id === id);
}

/** Get current sign based on date */
export function getCurrentSign(date: Date = new Date()): FrontierSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of FRONTIER_SIGNS) {
    // Handle year wrap (North Star: Dec 22 - Jan 19)
    if (sign.startMonth > sign.endMonth) {
      if ((month === sign.startMonth && day >= sign.startDay) ||
          (month === sign.endMonth && day <= sign.endDay) ||
          month > sign.startMonth || month < sign.endMonth) {
        return sign;
      }
    } else {
      if ((month === sign.startMonth && day >= sign.startDay) ||
          (month === sign.endMonth && day <= sign.endDay) ||
          (month > sign.startMonth && month < sign.endMonth)) {
        return sign;
      }
    }
  }

  return FRONTIER_SIGNS[0]; // Fallback
}

/** Check if today is a peak day */
export function isPeakDay(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return FRONTIER_SIGNS.some(sign =>
    sign.peakMonth === month && sign.peakDay === day
  );
}

/** Get days until next sign */
export function getDaysUntilNextSign(currentSign: FrontierSign, date: Date = new Date()): number {
  const endDate = new Date(date.getFullYear(), currentSign.endMonth - 1, currentSign.endDay);
  if (endDate < date) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return Math.ceil((endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get days until peak day */
export function getDaysUntilPeakDay(currentSign: FrontierSign, date: Date = new Date()): number {
  const peakDate = new Date(date.getFullYear(), currentSign.peakMonth - 1, currentSign.peakDay);
  if (peakDate < date) {
    peakDate.setFullYear(peakDate.getFullYear() + 1);
  }
  return Math.ceil((peakDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Default constellation patterns for each sign */
export const CONSTELLATION_PATTERNS: Record<ZodiacSignId, { stars: Array<{ x: number; y: number; size: 'small' | 'medium' | 'large' | 'major' }>; connections: Array<[number, number]> }> = {
  prospector: {
    stars: [
      { x: 30, y: 20, size: 'major' },   // Handle top
      { x: 35, y: 35, size: 'medium' },  // Handle mid
      { x: 40, y: 50, size: 'large' },   // Handle bottom/head
      { x: 55, y: 45, size: 'medium' },  // Pick head right
      { x: 25, y: 55, size: 'medium' },  // Pick head left
      { x: 60, y: 60, size: 'small' },   // Pick tip right
      { x: 15, y: 70, size: 'small' },   // Pick tip left
    ],
    connections: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6]],
  },
  coyote: {
    stars: [
      { x: 25, y: 30, size: 'medium' },  // Snout
      { x: 40, y: 25, size: 'large' },   // Head
      { x: 35, y: 15, size: 'medium' },  // Ear left
      { x: 50, y: 18, size: 'medium' },  // Ear right
      { x: 55, y: 40, size: 'major' },   // Shoulder
      { x: 70, y: 50, size: 'large' },   // Back
      { x: 80, y: 65, size: 'medium' },  // Tail
      { x: 50, y: 60, size: 'medium' },  // Belly
      { x: 40, y: 75, size: 'small' },   // Front leg
    ],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [5, 6], [4, 7], [7, 8]],
  },
  stallion: {
    stars: [
      { x: 20, y: 20, size: 'large' },   // Head
      { x: 30, y: 10, size: 'medium' },  // Ear
      { x: 25, y: 35, size: 'medium' },  // Neck
      { x: 40, y: 45, size: 'major' },   // Chest
      { x: 60, y: 40, size: 'large' },   // Back
      { x: 75, y: 50, size: 'medium' },  // Rump
      { x: 85, y: 65, size: 'small' },   // Tail
      { x: 35, y: 70, size: 'small' },   // Front leg
      { x: 70, y: 75, size: 'small' },   // Back leg
    ],
    connections: [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 7], [5, 8]],
  },
  rattlesnake: {
    stars: [
      { x: 15, y: 40, size: 'major' },   // Head
      { x: 25, y: 35, size: 'medium' },  // Neck
      { x: 35, y: 45, size: 'large' },   // Body 1
      { x: 50, y: 35, size: 'medium' },  // Body 2
      { x: 60, y: 50, size: 'large' },   // Body 3
      { x: 75, y: 40, size: 'medium' },  // Body 4
      { x: 85, y: 55, size: 'large' },   // Rattle base
      { x: 90, y: 60, size: 'small' },   // Rattle tip
      { x: 10, y: 35, size: 'small' },   // Tongue
    ],
    connections: [[8, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  eagle: {
    stars: [
      { x: 50, y: 20, size: 'major' },   // Head
      { x: 50, y: 35, size: 'large' },   // Body
      { x: 20, y: 30, size: 'large' },   // Left wing tip
      { x: 35, y: 35, size: 'medium' },  // Left wing mid
      { x: 65, y: 35, size: 'medium' },  // Right wing mid
      { x: 80, y: 30, size: 'large' },   // Right wing tip
      { x: 45, y: 55, size: 'medium' },  // Tail left
      { x: 55, y: 55, size: 'medium' },  // Tail right
      { x: 50, y: 65, size: 'small' },   // Tail tip
    ],
    connections: [[0, 1], [1, 3], [3, 2], [1, 4], [4, 5], [1, 6], [1, 7], [6, 8], [7, 8]],
  },
  longhorn: {
    stars: [
      { x: 50, y: 50, size: 'major' },   // Head center
      { x: 20, y: 30, size: 'large' },   // Left horn tip
      { x: 35, y: 40, size: 'medium' },  // Left horn base
      { x: 65, y: 40, size: 'medium' },  // Right horn base
      { x: 80, y: 30, size: 'large' },   // Right horn tip
      { x: 45, y: 60, size: 'medium' },  // Snout left
      { x: 55, y: 60, size: 'medium' },  // Snout right
      { x: 40, y: 45, size: 'small' },   // Left eye
      { x: 60, y: 45, size: 'small' },   // Right eye
    ],
    connections: [[1, 2], [2, 0], [0, 3], [3, 4], [0, 7], [0, 8], [0, 5], [0, 6]],
  },
  gunslinger: {
    stars: [
      { x: 30, y: 30, size: 'large' },   // Left gun barrel
      { x: 40, y: 45, size: 'medium' },  // Left trigger
      { x: 45, y: 55, size: 'major' },   // Cross point
      { x: 55, y: 55, size: 'major' },   // Cross point 2
      { x: 60, y: 45, size: 'medium' },  // Right trigger
      { x: 70, y: 30, size: 'large' },   // Right gun barrel
      { x: 35, y: 65, size: 'small' },   // Left handle
      { x: 65, y: 65, size: 'small' },   // Right handle
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [3, 7]],
  },
  'cactus-flower': {
    stars: [
      { x: 50, y: 70, size: 'large' },   // Base
      { x: 50, y: 50, size: 'major' },   // Center
      { x: 35, y: 55, size: 'medium' },  // Left arm
      { x: 65, y: 55, size: 'medium' },  // Right arm
      { x: 50, y: 30, size: 'large' },   // Flower center
      { x: 40, y: 20, size: 'medium' },  // Petal 1
      { x: 60, y: 20, size: 'medium' },  // Petal 2
      { x: 35, y: 30, size: 'small' },   // Petal 3
      { x: 65, y: 30, size: 'small' },   // Petal 4
    ],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [4, 6], [4, 7], [4, 8]],
  },
  vulture: {
    stars: [
      { x: 40, y: 30, size: 'medium' },  // Head
      { x: 50, y: 35, size: 'large' },   // Neck
      { x: 50, y: 50, size: 'major' },   // Body
      { x: 25, y: 45, size: 'large' },   // Left wing
      { x: 75, y: 45, size: 'large' },   // Right wing
      { x: 15, y: 55, size: 'medium' },  // Left wing tip
      { x: 85, y: 55, size: 'medium' },  // Right wing tip
      { x: 50, y: 70, size: 'medium' },  // Tail
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 5], [2, 4], [4, 6], [2, 7]],
  },
  tumbleweed: {
    stars: [
      { x: 50, y: 50, size: 'major' },   // Center
      { x: 50, y: 25, size: 'medium' },  // Top
      { x: 75, y: 35, size: 'medium' },  // Top right
      { x: 75, y: 65, size: 'medium' },  // Bottom right
      { x: 50, y: 75, size: 'medium' },  // Bottom
      { x: 25, y: 65, size: 'medium' },  // Bottom left
      { x: 25, y: 35, size: 'medium' },  // Top left
      { x: 60, y: 40, size: 'small' },   // Inner 1
      { x: 40, y: 60, size: 'small' },   // Inner 2
    ],
    connections: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 6], [2, 3], [4, 5]],
  },
  wolf: {
    stars: [
      { x: 30, y: 25, size: 'large' },   // Snout up (howling)
      { x: 35, y: 35, size: 'medium' },  // Head
      { x: 28, y: 30, size: 'small' },   // Ear
      { x: 45, y: 45, size: 'major' },   // Shoulder
      { x: 60, y: 50, size: 'large' },   // Body
      { x: 75, y: 55, size: 'medium' },  // Rump
      { x: 85, y: 45, size: 'medium' },  // Tail
      { x: 40, y: 65, size: 'small' },   // Front leg
      { x: 70, y: 70, size: 'small' },   // Back leg
    ],
    connections: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [3, 7], [5, 8]],
  },
  'north-star': {
    stars: [
      { x: 50, y: 50, size: 'major' },   // Center (the North Star)
      { x: 50, y: 20, size: 'large' },   // Top point
      { x: 80, y: 35, size: 'large' },   // Top right
      { x: 70, y: 70, size: 'large' },   // Bottom right
      { x: 30, y: 70, size: 'large' },   // Bottom left
      { x: 20, y: 35, size: 'large' },   // Top left
      { x: 50, y: 35, size: 'small' },   // Inner top
      { x: 60, y: 55, size: 'small' },   // Inner right
      { x: 40, y: 55, size: 'small' },   // Inner left
    ],
    connections: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [0, 7], [0, 8]],
  },
};
