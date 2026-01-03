/**
 * Frontier Zodiac Data
 * Desperados Destiny - Western-themed zodiac calendar system
 *
 * 12 frontier signs, each with unique bonuses, constellations, and themes
 */

/**
 * Activity bonus type
 */
export interface ActivityBonus {
  type: string;
  value: number;
}

/**
 * Skill bonus type
 */
export interface SkillBonus {
  skill: string;
  value: number;
}

/**
 * Special effect bonus
 */
export interface SpecialBonus {
  effect: string;
  value: number;
}

/**
 * Sign bonuses structure
 */
export interface SignBonuses {
  activities: ActivityBonus[];
  skills: SkillBonus[];
  special: SpecialBonus[];
}

/**
 * Constellation data
 */
export interface Constellation {
  name: string;
  stars: number;
  fragmentsRequired: number;
}

/**
 * Frontier Zodiac Sign definition
 */
export interface FrontierSign {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  element: 'Earth' | 'Fire' | 'Water' | 'Air' | 'Spirit';
  theme: string;
  description: string;
  oppositeSign: string;
  bonuses: SignBonuses;
  constellation: Constellation;
  peakDay: number; // Day within the sign period when bonuses are doubled
  lore: string;
}

/**
 * All 12 Frontier Zodiac Signs
 */
export const FRONTIER_SIGNS: FrontierSign[] = [
  // 1. The Prospector (Jan 1 - Jan 30)
  {
    id: 'prospector',
    name: 'The Prospector',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 30,
    element: 'Earth',
    theme: 'Mining, treasure hunting, wealth accumulation',
    description: 'Those born under The Prospector are driven by the promise of riches hidden beneath the earth. Patient and methodical, they dig deep to find their fortunes.',
    oppositeSign: 'gunslinger',
    bonuses: {
      activities: [
        { type: 'mining', value: 0.25 },
        { type: 'treasure_hunting', value: 0.20 },
        { type: 'gathering', value: 0.15 }
      ],
      skills: [
        { skill: 'mining', value: 0.10 },
        { skill: 'appraisal', value: 0.08 }
      ],
      special: [
        { effect: 'gold_find', value: 0.10 },
        { effect: 'ore_quality', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Pickaxe',
      stars: 8,
      fragmentsRequired: 15
    },
    peakDay: 15,
    lore: 'When the winter snows cover the mountains, the wise prospector digs deepest. The Pickaxe constellation points to where gold sleeps.'
  },

  // 2. The Coyote (Jan 31 - Mar 1)
  {
    id: 'coyote',
    name: 'The Coyote',
    startMonth: 1,
    startDay: 31,
    endMonth: 3,
    endDay: 1,
    element: 'Air',
    theme: 'Gambling, trickery, cunning survival',
    description: 'The Coyote is the trickster of the frontier. Those born under this sign possess sharp wits, silver tongues, and the luck to survive any predicament.',
    oppositeSign: 'longhorn',
    bonuses: {
      activities: [
        { type: 'gambling', value: 0.25 },
        { type: 'persuasion', value: 0.20 },
        { type: 'theft', value: 0.15 }
      ],
      skills: [
        { skill: 'gambling', value: 0.12 },
        { skill: 'deception', value: 0.10 }
      ],
      special: [
        { effect: 'luck', value: 0.15 },
        { effect: 'escape_chance', value: 0.20 }
      ]
    },
    constellation: {
      name: 'The Grinning Jaw',
      stars: 11,
      fragmentsRequired: 18
    },
    peakDay: 14,
    lore: 'The Coyote howls at twilight, when the line between truth and lies blurs. His children find fortune in chaos.'
  },

  // 3. The Stallion (Mar 2 - Apr 1)
  {
    id: 'stallion',
    name: 'The Stallion',
    startMonth: 3,
    startDay: 2,
    endMonth: 4,
    endDay: 1,
    element: 'Fire',
    theme: 'Horses, racing, freedom, speed',
    description: 'Wild and untamed, those born under The Stallion live for the thrill of the ride. They form deep bonds with their horses and can outrun any trouble.',
    oppositeSign: 'vulture',
    bonuses: {
      activities: [
        { type: 'horse_racing', value: 0.30 },
        { type: 'horse_training', value: 0.25 },
        { type: 'travel', value: 0.20 }
      ],
      skills: [
        { skill: 'horsemanship', value: 0.15 },
        { skill: 'animal_handling', value: 0.10 }
      ],
      special: [
        { effect: 'horse_bond', value: 0.20 },
        { effect: 'travel_speed', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Running Hooves',
      stars: 14,
      fragmentsRequired: 20
    },
    peakDay: 17,
    lore: 'When spring awakens the plains, The Stallion runs free. Those who follow his star are never truly bound.'
  },

  // 4. The Rattlesnake (Apr 2 - May 1)
  {
    id: 'rattlesnake',
    name: 'The Rattlesnake',
    startMonth: 4,
    startDay: 2,
    endMonth: 5,
    endDay: 1,
    element: 'Earth',
    theme: 'Crime, stealth, patience, deadly precision',
    description: 'Silent and patient, The Rattlesnake waits for the perfect moment to strike. Those born under this sign excel at working in the shadows.',
    oppositeSign: 'north_star',
    bonuses: {
      activities: [
        { type: 'crime', value: 0.25 },
        { type: 'stealth', value: 0.20 },
        { type: 'assassination', value: 0.15 }
      ],
      skills: [
        { skill: 'stealth', value: 0.12 },
        { skill: 'lockpicking', value: 0.10 }
      ],
      special: [
        { effect: 'crime_success', value: 0.20 },
        { effect: 'detection_evasion', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Coiled Strike',
      stars: 9,
      fragmentsRequired: 16
    },
    peakDay: 16,
    lore: 'The Rattlesnake never strikes without warning, but when it does, it is always fatal. Patience is the deadliest weapon.'
  },

  // 5. The Eagle (May 2 - Jun 1)
  {
    id: 'eagle',
    name: 'The Eagle',
    startMonth: 5,
    startDay: 2,
    endMonth: 6,
    endDay: 1,
    element: 'Air',
    theme: 'Hunting, scouting, vision, precision',
    description: 'With eyes that see for miles and talons that never miss, The Eagle represents the hunter supreme. Those born under this sign are master trackers.',
    oppositeSign: 'wolf',
    bonuses: {
      activities: [
        { type: 'hunting', value: 0.30 },
        { type: 'scouting', value: 0.25 },
        { type: 'tracking', value: 0.20 }
      ],
      skills: [
        { skill: 'hunting', value: 0.15 },
        { skill: 'duel_instinct', value: 0.12 }
      ],
      special: [
        { effect: 'tracking_range', value: 0.25 },
        { effect: 'critical_hit', value: 0.10 }
      ]
    },
    constellation: {
      name: 'The Soaring Wing',
      stars: 12,
      fragmentsRequired: 18
    },
    peakDay: 16,
    lore: 'The Eagle soars above all, seeing truths hidden from those who walk the earth. Its children never lose their prey.'
  },

  // 6. The Longhorn (Jun 2 - Jul 1)
  {
    id: 'longhorn',
    name: 'The Longhorn',
    startMonth: 6,
    startDay: 2,
    endMonth: 7,
    endDay: 1,
    element: 'Earth',
    theme: 'Ranching, cattle, steadfast determination',
    description: 'Strong and stubborn, The Longhorn represents the rancher\'s way. Those born under this sign build empires through hard work and perseverance.',
    oppositeSign: 'coyote',
    bonuses: {
      activities: [
        { type: 'ranching', value: 0.30 },
        { type: 'cattle_herding', value: 0.25 },
        { type: 'farming', value: 0.20 }
      ],
      skills: [
        { skill: 'ranching', value: 0.15 },
        { skill: 'animal_husbandry', value: 0.12 }
      ],
      special: [
        { effect: 'livestock_value', value: 0.20 },
        { effect: 'property_income', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Great Horns',
      stars: 10,
      fragmentsRequired: 17
    },
    peakDay: 16,
    lore: 'The Longhorn stands firm where others flee. Its horns guard the herd, and its children guard their people.'
  },

  // 7. The Gunslinger (Jul 2 - Aug 1)
  {
    id: 'gunslinger',
    name: 'The Gunslinger',
    startMonth: 7,
    startDay: 2,
    endMonth: 8,
    endDay: 1,
    element: 'Fire',
    theme: 'Combat, dueling, deadly accuracy',
    description: 'Quick on the draw and deadly accurate, The Gunslinger represents the warrior spirit of the frontier. Combat is an art form to those born under this sign.',
    oppositeSign: 'prospector',
    bonuses: {
      activities: [
        { type: 'combat', value: 0.25 },
        { type: 'dueling', value: 0.30 },
        { type: 'bounty_hunting', value: 0.20 }
      ],
      skills: [
        { skill: 'shooting', value: 0.15 },
        { skill: 'quick_draw', value: 0.12 }
      ],
      special: [
        { effect: 'duel_advantage', value: 0.25 },
        { effect: 'weapon_damage', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Smoking Barrel',
      stars: 7,
      fragmentsRequired: 15
    },
    peakDay: 16,
    lore: 'When The Gunslinger draws, death follows. The fastest hands belong to those who sleep under the Smoking Barrel.'
  },

  // 8. The Cactus Flower (Aug 2 - Sep 1)
  {
    id: 'cactus_flower',
    name: 'The Cactus Flower',
    startMonth: 8,
    startDay: 2,
    endMonth: 9,
    endDay: 1,
    element: 'Water',
    theme: 'Crafting, resilience, hidden beauty',
    description: 'Beauty that thrives in hardship, The Cactus Flower represents the artisans and craftspeople. Those born under this sign create wonders from nothing.',
    oppositeSign: 'tumbleweed',
    bonuses: {
      activities: [
        { type: 'crafting', value: 0.30 },
        { type: 'smithing', value: 0.25 },
        { type: 'brewing', value: 0.20 }
      ],
      skills: [
        { skill: 'crafting', value: 0.15 },
        { skill: 'alchemy', value: 0.10 }
      ],
      special: [
        { effect: 'craft_quality', value: 0.20 },
        { effect: 'resource_efficiency', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Blooming Thorn',
      stars: 13,
      fragmentsRequired: 19
    },
    peakDay: 16,
    lore: 'The Cactus Flower blooms once a year, but its beauty outlasts the storm. Creation is the greatest act of defiance.'
  },

  // 9. The Vulture (Sep 2 - Oct 1)
  {
    id: 'vulture',
    name: 'The Vulture',
    startMonth: 9,
    startDay: 2,
    endMonth: 10,
    endDay: 1,
    element: 'Spirit',
    theme: 'Bounty hunting, scavenging, patience',
    description: 'Patient and opportunistic, The Vulture knows that all things come to those who wait. Bounty hunters and scavengers find their calling under this sign.',
    oppositeSign: 'stallion',
    bonuses: {
      activities: [
        { type: 'bounty_hunting', value: 0.30 },
        { type: 'scavenging', value: 0.25 },
        { type: 'investigation', value: 0.20 }
      ],
      skills: [
        { skill: 'tracking', value: 0.12 },
        { skill: 'intimidation', value: 0.10 }
      ],
      special: [
        { effect: 'bounty_reward', value: 0.20 },
        { effect: 'loot_quality', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Circling Shadow',
      stars: 9,
      fragmentsRequired: 16
    },
    peakDay: 16,
    lore: 'The Vulture circles above the battlefield, patient and eternal. Death is not an end, but an opportunity.'
  },

  // 10. The Tumbleweed (Oct 2 - Nov 1)
  {
    id: 'tumbleweed',
    name: 'The Tumbleweed',
    startMonth: 10,
    startDay: 2,
    endMonth: 11,
    endDay: 1,
    element: 'Air',
    theme: 'Travel, trade, adaptability',
    description: 'Free as the wind, The Tumbleweed rolls wherever fortune takes it. Merchants and wanderers are blessed by this restless sign.',
    oppositeSign: 'cactus_flower',
    bonuses: {
      activities: [
        { type: 'trading', value: 0.25 },
        { type: 'travel', value: 0.25 },
        { type: 'exploration', value: 0.20 }
      ],
      skills: [
        { skill: 'bartering', value: 0.12 },
        { skill: 'navigation', value: 0.10 }
      ],
      special: [
        { effect: 'trade_profit', value: 0.20 },
        { effect: 'travel_cost_reduction', value: 0.15 }
      ]
    },
    constellation: {
      name: 'The Rolling Path',
      stars: 11,
      fragmentsRequired: 17
    },
    peakDay: 16,
    lore: 'The Tumbleweed has no roots, yet it spreads its seeds across the land. Freedom is the greatest treasure.'
  },

  // 11. The Wolf (Nov 2 - Dec 1)
  {
    id: 'wolf',
    name: 'The Wolf',
    startMonth: 11,
    startDay: 2,
    endMonth: 12,
    endDay: 1,
    element: 'Spirit',
    theme: 'Gangs, pack loyalty, survival',
    description: 'The Wolf runs with the pack. Those born under this sign understand that strength lies in unity, and loyalty is the highest virtue.',
    oppositeSign: 'eagle',
    bonuses: {
      activities: [
        { type: 'gang_activities', value: 0.25 },
        { type: 'pack_hunting', value: 0.20 },
        { type: 'heist', value: 0.20 }
      ],
      skills: [
        { skill: 'leadership', value: 0.10 },
        { skill: 'teamwork', value: 0.15 }
      ],
      special: [
        { effect: 'gang_bonus', value: 0.25 },
        { effect: 'group_combat', value: 0.20 }
      ]
    },
    constellation: {
      name: 'The Pack Leader',
      stars: 15,
      fragmentsRequired: 20
    },
    peakDay: 16,
    lore: 'The Wolf howls to call its brothers. Alone, a wolf hunts rabbits. Together, they bring down buffalo.'
  },

  // 12. The North Star (Dec 2 - Dec 31)
  {
    id: 'north_star',
    name: 'The North Star',
    startMonth: 12,
    startDay: 2,
    endMonth: 12,
    endDay: 31,
    element: 'Spirit',
    theme: 'Quests, guidance, destiny',
    description: 'The guiding light in the darkness, The North Star represents those who follow their destiny. Quest-seekers and heroes are born under this sign.',
    oppositeSign: 'rattlesnake',
    bonuses: {
      activities: [
        { type: 'questing', value: 0.30 },
        { type: 'exploration', value: 0.25 },
        { type: 'mentoring', value: 0.20 }
      ],
      skills: [
        { skill: 'willpower', value: 0.12 },
        { skill: 'inspiration', value: 0.10 }
      ],
      special: [
        { effect: 'quest_xp', value: 0.25 },
        { effect: 'quest_reward', value: 0.20 }
      ]
    },
    constellation: {
      name: 'The Guiding Light',
      stars: 16,
      fragmentsRequired: 22
    },
    peakDay: 16,
    lore: 'The North Star never moves, yet guides all travelers home. Those who follow it find their true purpose.'
  }
];

/**
 * Get sign by ID
 */
export function getSignById(signId: string): FrontierSign | undefined {
  return FRONTIER_SIGNS.find(s => s.id === signId);
}

/**
 * Get sign for a specific date
 * @param month - 1-12
 * @param day - 1-31
 */
export function getSignForDate(month: number, day: number): FrontierSign | undefined {
  return FRONTIER_SIGNS.find(sign => {
    // Handle signs that span across year boundary (none currently, but future-proof)
    if (sign.startMonth > sign.endMonth) {
      // Sign spans year end (e.g., Dec 15 - Jan 15)
      return (month > sign.startMonth || (month === sign.startMonth && day >= sign.startDay)) ||
             (month < sign.endMonth || (month === sign.endMonth && day <= sign.endDay));
    }

    // Handle signs that span across months
    if (sign.startMonth !== sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay) return true;
      if (month === sign.endMonth && day <= sign.endDay) return true;
      if (month > sign.startMonth && month < sign.endMonth) return true;
      return false;
    }

    // Sign is within a single month
    return month === sign.startMonth && day >= sign.startDay && day <= sign.endDay;
  });
}

/**
 * Get current sign based on real-world date
 */
export function getCurrentSign(): FrontierSign | undefined {
  const now = new Date();
  return getSignForDate(now.getMonth() + 1, now.getDate());
}

/**
 * Check if today is a peak day for the given sign
 */
export function isPeakDayForSign(sign: FrontierSign): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Peak day is relative to the sign's start
  const peakMonth = sign.startMonth;
  const peakDay = sign.startDay + sign.peakDay - 1;

  return currentMonth === peakMonth && currentDay === peakDay;
}

/**
 * Check if today is any sign's peak day
 */
export function isPeakDay(): { isPeak: boolean; sign?: FrontierSign } {
  const currentSign = getCurrentSign();
  if (!currentSign) {
    return { isPeak: false };
  }

  const isPeak = isPeakDayForSign(currentSign);
  return {
    isPeak,
    sign: isPeak ? currentSign : undefined
  };
}

/**
 * Get opposite sign
 */
export function getOppositeSign(signId: string): FrontierSign | undefined {
  const sign = getSignById(signId);
  if (!sign) return undefined;
  return getSignById(sign.oppositeSign);
}

/**
 * Get all signs
 */
export function getAllSigns(): FrontierSign[] {
  return FRONTIER_SIGNS;
}

/**
 * Get signs by element
 */
export function getSignsByElement(element: FrontierSign['element']): FrontierSign[] {
  return FRONTIER_SIGNS.filter(s => s.element === element);
}

/**
 * Calculate days until next sign
 */
export function getDaysUntilNextSign(): number {
  const currentSign = getCurrentSign();
  if (!currentSign) return 0;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Calculate days until sign ends
  let daysRemaining = 0;

  if (currentMonth === currentSign.endMonth) {
    daysRemaining = currentSign.endDay - currentDay;
  } else if (currentMonth === currentSign.startMonth) {
    // Days to end of start month + days in end month
    const daysInCurrentMonth = new Date(now.getFullYear(), currentMonth, 0).getDate();
    daysRemaining = (daysInCurrentMonth - currentDay) + currentSign.endDay;
  }

  return Math.max(0, daysRemaining);
}

/**
 * Get sign compatibility (based on elements)
 */
export function getSignCompatibility(signId1: string, signId2: string): {
  compatible: boolean;
  level: 'excellent' | 'good' | 'neutral' | 'challenging';
  reason: string;
} {
  const sign1 = getSignById(signId1);
  const sign2 = getSignById(signId2);

  if (!sign1 || !sign2) {
    return { compatible: false, level: 'neutral', reason: 'Unknown signs' };
  }

  // Same element = excellent
  if (sign1.element === sign2.element) {
    return {
      compatible: true,
      level: 'excellent',
      reason: `Both signs share the ${sign1.element} element`
    };
  }

  // Opposite signs = challenging but powerful
  if (sign1.oppositeSign === sign2.id || sign2.oppositeSign === sign1.id) {
    return {
      compatible: true,
      level: 'challenging',
      reason: 'Opposite signs - challenging but powerful together'
    };
  }

  // Complementary elements
  const complementary: Record<string, string[]> = {
    'Earth': ['Water', 'Spirit'],
    'Fire': ['Air', 'Spirit'],
    'Water': ['Earth', 'Spirit'],
    'Air': ['Fire', 'Spirit'],
    'Spirit': ['Earth', 'Fire', 'Water', 'Air']
  };

  if (complementary[sign1.element]?.includes(sign2.element)) {
    return {
      compatible: true,
      level: 'good',
      reason: `${sign1.element} and ${sign2.element} complement each other`
    };
  }

  return {
    compatible: true,
    level: 'neutral',
    reason: 'Neutral compatibility'
  };
}
