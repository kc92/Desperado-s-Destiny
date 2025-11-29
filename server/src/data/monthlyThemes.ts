/**
 * Monthly Themes Data
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Defines themed content, atmosphere, and events for each month
 */

import { Month, MonthlyTheme, Season } from '@desperados/shared';

/**
 * Monthly themes with flavor content
 */
export const MONTHLY_THEMES: Record<Month, MonthlyTheme> = {
  [Month.JANUARY]: {
    month: Month.JANUARY,
    name: 'January',
    season: Season.WINTER,
    description: 'The coldest month. Fresh start after New Year celebrations, but winter hardship sets in.',
    themeColor: '#C8E6F5',
    weatherEmphasis: 'Bitter cold, occasional snow in mountains, frost common',
    economicFocus: 'Survival mode - people use stored resources and stay indoors',
    activities: [
      'Ice fishing in frozen lakes',
      'Indoor gambling and cards',
      'Planning spring ventures',
      'Tending to livestock in barns',
      'Repairing equipment',
    ],
    flavorEvents: [
      'Wolves driven by hunger venture closer to settlements',
      'Frozen water sources force people to haul water from rivers',
      'Cabin fever leads to increased bar fights',
      'Indigenous peoples perform winter ceremonies',
      'Blizzard traps travelers at way stations',
    ],
    dangerLevel: 7,
  },

  [Month.FEBRUARY]: {
    month: Month.FEBRUARY,
    name: 'February',
    season: Season.WINTER,
    description: 'Still cold, but hope of spring emerges. Valentine\'s Day brings social activities.',
    themeColor: '#FFB6C1',
    weatherEmphasis: 'Cold but slowly warming, late winter storms possible',
    economicFocus: 'Resources running low, anticipation of spring trading',
    activities: [
      'Valentine\'s Day social events',
      'Last of winter hunting',
      'Poker tournaments to pass time',
      'Courtship and romance',
      'Preparing for spring planting',
    ],
    flavorEvents: [
      'Valentine\'s Day dance at the saloon',
      'Couples elope to avoid family disapproval',
      'Love triangle duels',
      'Final blizzard of the season',
      'First hints of spring thaw in lowlands',
    ],
    dangerLevel: 6,
  },

  [Month.MARCH]: {
    month: Month.MARCH,
    name: 'March',
    season: Season.SPRING,
    description: 'Spring thaw begins. Melting snow causes floods, but new life emerges.',
    themeColor: '#90EE90',
    weatherEmphasis: 'Unpredictable - warm days, cold nights, heavy rain, flooding',
    economicFocus: 'Spring trading season begins, merchants restock supplies',
    activities: [
      'Spring roundup of cattle',
      'Planting early crops',
      'Repairing flood damage',
      'Prospecting as snow melts',
      'Easter preparations',
    ],
    flavorEvents: [
      'Flash flooding washes out bridges',
      'First wagon trains of the season arrive',
      'Mudslides in mountain passes',
      'Wildflowers bloom across plains',
      'Bears emerge from hibernation, hungry and dangerous',
    ],
    dangerLevel: 5,
  },

  [Month.APRIL]: {
    month: Month.APRIL,
    name: 'April',
    season: Season.SPRING,
    description: 'Spring in full swing. Easter celebrations, planting season, new beginnings.',
    themeColor: '#98FB98',
    weatherEmphasis: 'Mild days, frequent spring showers, occasional thunderstorms',
    economicFocus: 'Peak planting season, seed prices high, optimism for harvest',
    activities: [
      'Easter egg hunts and festivals',
      'Full planting operations',
      'Breaking and training horses',
      'Spring fishing runs',
      'Opening mines for the season',
    ],
    flavorEvents: [
      'Easter Sunday services and town picnics',
      'Birth of colts and calves',
      'Tornados threaten the plains',
      'Prospectors rush to new gold claims',
      'Indigenous spring ceremonies',
    ],
    dangerLevel: 4,
  },

  [Month.MAY]: {
    month: Month.MAY,
    name: 'May',
    season: Season.SPRING,
    description: 'Late spring warmth. Cattle drives begin, traders are active, town festivals.',
    themeColor: '#7CFC00',
    weatherEmphasis: 'Warm and pleasant, occasional storms',
    economicFocus: 'Cattle drives to market begin, trade route activity peaks',
    activities: [
      'Long cattle drives north',
      'Spring festivals and fairs',
      'Prospecting expeditions',
      'Racing and rodeos',
      'Finishing planting',
    ],
    flavorEvents: [
      'Cattle drive kickoff celebrations',
      'May Day festivals in settlements',
      'Outlaws ambush cattle drives',
      'Buffalo herds migrate north',
      'Thunderbird sightings in the mountains',
    ],
    dangerLevel: 5,
  },

  [Month.JUNE]: {
    month: Month.JUNE,
    name: 'June',
    season: Season.SUMMER,
    description: 'Summer arrives with heat. Crops are growing, activity is at its peak.',
    themeColor: '#FFD700',
    weatherEmphasis: 'Hot and dry, first heat waves',
    economicFocus: 'Peak business season, all trades active',
    activities: [
      'Tending growing crops',
      'Peak hunting and fishing',
      'Long-distance travel',
      'Mining operations in full swing',
      'Summer weddings',
    ],
    flavorEvents: [
      'First dust devils appear',
      'Rivers begin to run low',
      'Snake encounters increase',
      'Frontier celebrations and contests',
      'Desperados more active in heat of summer',
    ],
    dangerLevel: 6,
  },

  [Month.JULY]: {
    month: Month.JULY,
    name: 'July',
    season: Season.SUMMER,
    description: 'Peak summer heat. Independence Day celebrations, but also drought concerns.',
    themeColor: '#FF6347',
    weatherEmphasis: 'Scorching heat, dust storms, occasional thunderstorms',
    economicFocus: 'Slowing as heat becomes oppressive, midday siesta common',
    activities: [
      'Independence Day celebrations',
      'Fireworks and shooting contests',
      'Night riding to avoid heat',
      'Swimming in rivers and lakes',
      'Maintaining irrigation',
    ],
    flavorEvents: [
      '4th of July town celebrations and parades',
      'Gunfighting competitions',
      'Heat wave forces businesses to close midday',
      'Wildfires threaten grasslands',
      'Mysterious lights in night sky',
    ],
    dangerLevel: 7,
  },

  [Month.AUGUST]: {
    month: Month.AUGUST,
    name: 'August',
    season: Season.SUMMER,
    description: 'Dog days of summer. Brutal heat, drought fears, everyone waiting for fall.',
    themeColor: '#FFA500',
    weatherEmphasis: 'Extreme heat, dust storms frequent, drought conditions',
    economicFocus: 'Drought stress on crops, water rights disputes',
    activities: [
      'Emergency irrigation',
      'Night travel only',
      'Indoor activities during day',
      'Preparation for harvest',
      'Water dowsing',
    ],
    flavorEvents: [
      'Drought leads to crop failures',
      'Dust storms block out the sun',
      'Heat madness incidents increase',
      'Water source conflicts and violence',
      'Mirage sightings become common',
    ],
    dangerLevel: 8,
  },

  [Month.SEPTEMBER]: {
    month: Month.SEPTEMBER,
    name: 'September',
    season: Season.FALL,
    description: 'Harvest begins! Relief from summer heat, abundant crops, optimistic mood.',
    themeColor: '#DAA520',
    weatherEmphasis: 'Perfect weather, warm days, cool nights',
    economicFocus: 'Harvest season begins, grain prices drop, labor in high demand',
    activities: [
      'Crop harvesting',
      'Autumn hunting season opens',
      'Hiring harvest workers',
      'Storing provisions',
      'County fairs and exhibits',
    ],
    flavorEvents: [
      'Harvest festivals with music and dancing',
      'Record crops celebrated',
      'Migrating birds fill the skies',
      'First hints of autumn colors',
      'Harvest moon ceremonies',
    ],
    dangerLevel: 4,
  },

  [Month.OCTOBER]: {
    month: Month.OCTOBER,
    name: 'October',
    season: Season.FALL,
    description: 'Peak autumn. Halloween approaches, supernatural activity increases, hunting season.',
    themeColor: '#FF8C00',
    weatherEmphasis: 'Crisp and clear, beautiful fall weather',
    economicFocus: 'Peak harvest time, markets flooded with produce',
    activities: [
      'Halloween preparations',
      'Deer hunting season',
      'Pumpkin harvesting',
      'Preserving food for winter',
      'Ghost stories and superstitions',
    ],
    flavorEvents: [
      'Halloween night supernatural events',
      'Ghost sightings increase dramatically',
      'Werewolf rumors in remote areas',
      'Autumn leaves paint mountains gold',
      'Witches gather at Devil\'s Peak',
    ],
    dangerLevel: 6,
  },

  [Month.NOVEMBER]: {
    month: Month.NOVEMBER,
    name: 'November',
    season: Season.FALL,
    description: 'Late autumn. Thanksgiving celebrations, preparing for winter, hunting season peaks.',
    themeColor: '#CD853F',
    weatherEmphasis: 'Cooling rapidly, early frost, occasional early snow',
    economicFocus: 'Final harvest, stocking supplies for winter',
    activities: [
      'Thanksgiving feasts',
      'Final harvest rush',
      'Hunting and preserving meat',
      'Stockpiling firewood',
      'Winterizing buildings',
    ],
    flavorEvents: [
      'Thanksgiving community celebrations',
      'First snowfall in mountains',
      'Turkey hunting competitions',
      'Gratitude despite frontier hardships',
      'Preparation for long winter ahead',
    ],
    dangerLevel: 5,
  },

  [Month.DECEMBER]: {
    month: Month.DECEMBER,
    name: 'December',
    season: Season.WINTER,
    description: 'Winter sets in. Christmas brings joy and charity, year-end reflection, harsh weather.',
    themeColor: '#4682B4',
    weatherEmphasis: 'Cold, snow in mountains and north, ice forming',
    economicFocus: 'Year-end accounting, gift buying, charitable giving',
    activities: [
      'Christmas preparations and shopping',
      'New Year celebrations',
      'Indoor social gatherings',
      'Charity drives for the poor',
      'Year-end reflection',
    ],
    flavorEvents: [
      'Christmas Eve church services',
      'Gift exchanges and caroling',
      'New Year\'s Eve parties at saloons',
      'Blizzard traps town for Christmas',
      'Mysterious Christmas ghost appearances',
      'Year-end gang truces',
    ],
    dangerLevel: 6,
  },
};

/**
 * Get monthly theme for a given month
 */
export function getMonthlyTheme(month: Month): MonthlyTheme {
  return MONTHLY_THEMES[month];
}

/**
 * Get month name
 */
export function getMonthName(month: Month): string {
  return MONTHLY_THEMES[month].name;
}

/**
 * Get upcoming flavor events for current month
 */
export function getFlavorEvents(month: Month): string[] {
  return MONTHLY_THEMES[month].flavorEvents;
}

/**
 * Get a random flavor event for the current month
 */
export function getRandomFlavorEvent(month: Month): string {
  const events = MONTHLY_THEMES[month].flavorEvents;
  return events[Math.floor(Math.random() * events.length)];
}

/**
 * Get danger level for current month
 */
export function getMonthDangerLevel(month: Month): number {
  return MONTHLY_THEMES[month].dangerLevel;
}

/**
 * Get all activities for a month
 */
export function getMonthActivities(month: Month): string[] {
  return MONTHLY_THEMES[month].activities;
}
