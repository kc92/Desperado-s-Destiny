/**
 * Holidays Data
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Defines all holidays throughout the year with their effects
 */

import { Holiday, Month } from '@desperados/shared';

/**
 * All holidays in the game
 */
export const HOLIDAYS: Holiday[] = [
  {
    id: 'new-years-day',
    name: "New Year's Day",
    month: Month.JANUARY,
    day: 1,
    description:
      'The start of a new year brings hope and resolutions. Saloons offer free drinks at midnight, and folks make promises they may not keep.',
    effects: {
      shopPriceModifier: 0.9, // Sales
      npcMoodBonus: 15,
      energyRegenBonus: 10,
      specialEventsChance: 0.2,
    },
    activities: ['Midnight celebrations', 'Making resolutions', 'Free drinks', 'Fireworks'],
    isSupernatural: false,
  },

  {
    id: 'valentines-day',
    name: "Valentine's Day",
    month: Month.FEBRUARY,
    day: 14,
    description:
      'A day for romance in the Wild West. Saloon girls receive flowers, cowboys court their sweethearts, and more than one duel has been fought over a lady\'s favor.',
    effects: {
      shopPriceModifier: 1.2, // Flowers, chocolates expensive
      npcMoodBonus: 10,
      energyRegenBonus: 5,
      specialEventsChance: 0.15,
      gatheringBonus: 10, // Flower picking
    },
    activities: [
      'Romantic dinner at the hotel',
      'Saloon dances',
      'Gift giving',
      'Poetry reading',
      'Courting missions',
    ],
    isSupernatural: false,
  },

  {
    id: 'st-patricks-day',
    name: "St. Patrick's Day",
    month: Month.MARCH,
    day: 17,
    description:
      'Irish settlers celebrate their heritage with music, drinking, and fighting. Green whiskey flows freely, and bar brawls are expected.',
    effects: {
      shopPriceModifier: 1.0,
      npcMoodBonus: 20,
      energyRegenBonus: -5, // Hangovers
      specialEventsChance: 0.25,
      combatModifier: 1.1, // Bar brawls
    },
    activities: [
      'Irish music and dancing',
      'Green beer drinking contests',
      'Bar brawls',
      'Lucky charms',
    ],
    isSupernatural: false,
  },

  {
    id: 'easter',
    name: 'Easter Sunday',
    month: Month.APRIL,
    day: 15, // Variable in real life, fixed in game
    description:
      'The holiest day for Christians in the West. Church services, egg hunts for children, and community meals bring folks together.',
    effects: {
      shopPriceModifier: 0.95,
      npcMoodBonus: 15,
      energyRegenBonus: 10,
      specialEventsChance: 0.15,
      gatheringBonus: 15, // Easter egg hunts
    },
    activities: [
      'Church services',
      'Easter egg hunts',
      'Community meals',
      'Spring celebrations',
    ],
    isSupernatural: false,
  },

  {
    id: 'independence-day',
    name: 'Independence Day',
    month: Month.JULY,
    day: 4,
    description:
      'The Fourth of July is the biggest celebration in American territories. Fireworks, parades, speeches, shooting contests, and patriotic fervor.',
    effects: {
      shopPriceModifier: 1.1, // Fireworks expensive
      npcMoodBonus: 25,
      energyRegenBonus: 15,
      specialEventsChance: 0.3,
      combatModifier: 1.05, // Shooting contests
    },
    activities: [
      'Fireworks displays',
      'Shooting contests',
      'Parades',
      'Patriotic speeches',
      'BBQ and picnics',
      'Horse races',
    ],
    isSupernatural: false,
  },

  {
    id: 'halloween',
    name: 'Halloween',
    month: Month.OCTOBER,
    day: 31,
    description:
      'All Hallows Eve. The veil between worlds grows thin. Ghost stories, costumes, and genuine supernatural encounters make this the most dangerous night of the year.',
    effects: {
      shopPriceModifier: 1.0,
      npcMoodBonus: 5,
      energyRegenBonus: 0,
      specialEventsChance: 0.5, // Very high
      combatModifier: 1.2, // Supernatural fights
    },
    activities: [
      'Costume parties',
      'Ghost hunting',
      'Séances',
      'Trick or treating',
      'Supernatural investigations',
      'Werewolf hunts',
    ],
    isSupernatural: true,
  },

  {
    id: 'dia-de-muertos',
    name: 'Día de los Muertos',
    month: Month.NOVEMBER,
    day: 2,
    description:
      'The Day of the Dead is celebrated in Frontera communities. Families honor deceased loved ones with altars, marigolds, and sugar skulls. The spirits walk among us.',
    effects: {
      shopPriceModifier: 1.1, // Special items
      npcMoodBonus: 10,
      energyRegenBonus: 5,
      specialEventsChance: 0.3,
    },
    activities: [
      'Building altars (ofrendas)',
      'Cemetery visits',
      'Spirit communication',
      'Traditional music and dancing',
      'Sugar skull crafting',
    ],
    isSupernatural: true,
  },

  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    month: Month.NOVEMBER,
    day: 24, // Fourth Thursday, simplified to fixed date
    description:
      'Settlers give thanks for surviving another year on the frontier. Communities gather for massive feasts, sharing what little they have.',
    effects: {
      shopPriceModifier: 1.15, // Turkey expensive
      npcMoodBonus: 20,
      energyRegenBonus: 20, // Big feast
      specialEventsChance: 0.15,
    },
    activities: [
      'Community feasts',
      'Turkey hunts',
      'Giving thanks',
      'Charity for the poor',
      'Family gatherings',
    ],
    isSupernatural: false,
  },

  {
    id: 'christmas-eve',
    name: 'Christmas Eve',
    month: Month.DECEMBER,
    day: 24,
    description:
      'The night before Christmas brings quiet peace to even the roughest frontier town. Outlaws declare temporary truces, and miracles are known to happen.',
    effects: {
      shopPriceModifier: 1.3, // Gift shopping
      npcMoodBonus: 25,
      energyRegenBonus: 10,
      specialEventsChance: 0.25,
      combatModifier: 0.5, // Christmas truce
    },
    activities: [
      'Church services',
      'Caroling',
      'Gift wrapping',
      'Decorating',
      'Midnight mass',
    ],
    isSupernatural: false,
  },

  {
    id: 'christmas',
    name: 'Christmas Day',
    month: Month.DECEMBER,
    day: 25,
    description:
      'Christmas brings joy and charity to the frontier. Gifts are exchanged, families reunite, and even hardened gunslingers show their softer side.',
    effects: {
      shopPriceModifier: 0.8, // Post-Christmas sales
      npcMoodBonus: 30,
      energyRegenBonus: 15,
      specialEventsChance: 0.2,
      combatModifier: 0.3, // Peace on earth
    },
    activities: [
      'Opening presents',
      'Christmas dinner',
      'Visiting neighbors',
      'Charity giving',
      'Snow activities',
    ],
    isSupernatural: false,
  },

  {
    id: 'new-years-eve',
    name: "New Year's Eve",
    month: Month.DECEMBER,
    day: 31,
    description:
      'The last night of the year. Saloons are packed, champagne flows (or at least whiskey), and everyone counts down to midnight hoping next year will be better.',
    effects: {
      shopPriceModifier: 1.2, // Party supplies
      npcMoodBonus: 20,
      energyRegenBonus: -10, // Drinking and staying up late
      specialEventsChance: 0.3,
      combatModifier: 1.15, // Drunk fights
    },
    activities: [
      'Saloon parties',
      'Countdown to midnight',
      'Champagne toasts',
      'Fireworks',
      'Reflection on the year',
    ],
    isSupernatural: false,
  },
];

/**
 * Get holiday by ID
 */
export function getHoliday(id: string): Holiday | undefined {
  return HOLIDAYS.find((h) => h.id === id);
}

/**
 * Get holidays for a specific month
 */
export function getHolidaysForMonth(month: Month): Holiday[] {
  return HOLIDAYS.filter((h) => h.month === month);
}

/**
 * Get holiday for a specific date
 */
export function getHolidayForDate(month: Month, day: number): Holiday | undefined {
  return HOLIDAYS.find((h) => h.month === month && h.day === day);
}

/**
 * Get all supernatural holidays
 */
export function getSupernaturalHolidays(): Holiday[] {
  return HOLIDAYS.filter((h) => h.isSupernatural);
}

/**
 * Get upcoming holidays from a given date
 */
export function getUpcomingHolidays(
  currentMonth: Month,
  currentDay: number,
  count: number = 3
): Holiday[] {
  const upcoming: Holiday[] = [];

  // Calculate days since start of year
  const currentDayOfYear = getDayOfYear(currentMonth, currentDay);

  // Sort holidays by day of year
  const sortedHolidays = [...HOLIDAYS].sort((a, b) => {
    const aDayOfYear = getDayOfYear(a.month, a.day);
    const bDayOfYear = getDayOfYear(b.month, b.day);
    return aDayOfYear - bDayOfYear;
  });

  // Find next holidays
  for (const holiday of sortedHolidays) {
    const holidayDayOfYear = getDayOfYear(holiday.month, holiday.day);

    if (holidayDayOfYear >= currentDayOfYear) {
      upcoming.push(holiday);
      if (upcoming.length >= count) break;
    }
  }

  // If we don't have enough, wrap around to next year
  if (upcoming.length < count) {
    for (const holiday of sortedHolidays) {
      upcoming.push(holiday);
      if (upcoming.length >= count) break;
    }
  }

  return upcoming.slice(0, count);
}

/**
 * Helper: Get day of year (approximate, doesn't account for exact days per month)
 */
function getDayOfYear(month: Month, day: number): number {
  // Approximate: 30 days per month
  return (month - 1) * 30 + day;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(month: Month, day: number): boolean {
  return HOLIDAYS.some((h) => h.month === month && h.day === day);
}

/**
 * Get all holidays
 */
export function getAllHolidays(): Holiday[] {
  return HOLIDAYS;
}
