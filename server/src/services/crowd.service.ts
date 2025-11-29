/**
 * Crowd Service
 *
 * Manages dynamic population levels in buildings and locations based on:
 * - Time of day
 * - Weather conditions
 * - Active world events
 * - Day of week
 * - Random variation
 */

import {
  LocationType,
  CrowdLevel,
  CrowdState,
  CrowdFactor,
  CrowdPattern,
  CrowdEffects,
  CrowdCalculation,
  LocationCapacity,
} from '@desperados/shared';
import { WeatherType, TimeOfDay } from '../models/WorldState.model';
import { WorldEventService } from './worldEvent.service';
import { Location } from '../models/Location.model';
import logger from '../utils/logger';

/**
 * Crowd patterns for different building types
 * Values represent base multiplier (0-1) for that time period
 */
const CROWD_PATTERNS: Record<string, CrowdPattern> = {
  // Entertainment & Social
  saloon: {
    dawn: 0.1,
    morning: 0.2,
    noon: 0.3,
    afternoon: 0.4,
    dusk: 0.7,
    evening: 0.9,
    night: 1.0,
    midnight: 0.6,
  },
  cantina: {
    dawn: 0.1,
    morning: 0.2,
    noon: 0.4,
    afternoon: 0.5,
    dusk: 0.8,
    evening: 1.0,
    night: 0.9,
    midnight: 0.5,
  },
  worker_tavern: {
    dawn: 0.1,
    morning: 0.2,
    noon: 0.3,
    afternoon: 0.4,
    dusk: 0.8,
    evening: 1.0,
    night: 0.7,
    midnight: 0.3,
  },
  fighting_pit: {
    dawn: 0.0,
    morning: 0.0,
    noon: 0.1,
    afternoon: 0.2,
    dusk: 0.5,
    evening: 0.9,
    night: 1.0,
    midnight: 0.4,
  },

  // Religious & Spiritual
  church: {
    dawn: 0.3,
    morning: 1.0,
    noon: 0.4,
    afternoon: 0.2,
    dusk: 0.5,
    evening: 0.6,
    night: 0.1,
    midnight: 0.0,
  },
  spirit_lodge: {
    dawn: 0.7,
    morning: 0.5,
    noon: 0.3,
    afternoon: 0.4,
    dusk: 0.8,
    evening: 0.6,
    night: 0.3,
    midnight: 0.1,
  },
  shrine: {
    dawn: 0.6,
    morning: 0.4,
    noon: 0.3,
    afternoon: 0.3,
    dusk: 0.7,
    evening: 0.5,
    night: 0.2,
    midnight: 0.1,
  },

  // Commercial & Business
  general_store: {
    dawn: 0.1,
    morning: 0.7,
    noon: 0.5,
    afternoon: 0.9,
    dusk: 0.6,
    evening: 0.3,
    night: 0.0,
    midnight: 0.0,
  },
  bank: {
    dawn: 0.0,
    morning: 0.6,
    noon: 0.5,
    afternoon: 0.7,
    dusk: 0.4,
    evening: 0.1,
    night: 0.0,
    midnight: 0.0,
  },
  blacksmith: {
    dawn: 0.2,
    morning: 0.8,
    noon: 0.6,
    afternoon: 0.9,
    dusk: 0.5,
    evening: 0.2,
    night: 0.0,
    midnight: 0.0,
  },
  trading_post: {
    dawn: 0.2,
    morning: 0.8,
    noon: 0.6,
    afternoon: 1.0,
    dusk: 0.5,
    evening: 0.2,
    night: 0.0,
    midnight: 0.0,
  },
  assay_office: {
    dawn: 0.0,
    morning: 0.5,
    noon: 0.4,
    afternoon: 0.6,
    dusk: 0.3,
    evening: 0.1,
    night: 0.0,
    midnight: 0.0,
  },

  // Services
  doctors_office: {
    dawn: 0.1,
    morning: 0.6,
    noon: 0.5,
    afternoon: 0.7,
    dusk: 0.4,
    evening: 0.3,
    night: 0.2,
    midnight: 0.1,
  },
  medicine_lodge: {
    dawn: 0.3,
    morning: 0.7,
    noon: 0.5,
    afternoon: 0.6,
    dusk: 0.4,
    evening: 0.3,
    night: 0.2,
    midnight: 0.1,
  },
  hotel: {
    dawn: 0.2,
    morning: 0.4,
    noon: 0.3,
    afternoon: 0.4,
    dusk: 0.6,
    evening: 0.8,
    night: 0.9,
    midnight: 0.7,
  },
  stables: {
    dawn: 0.4,
    morning: 0.7,
    noon: 0.5,
    afternoon: 0.6,
    dusk: 0.5,
    evening: 0.3,
    night: 0.1,
    midnight: 0.0,
  },

  // Government & Law
  sheriff_office: {
    dawn: 0.2,
    morning: 0.6,
    noon: 0.5,
    afternoon: 0.6,
    dusk: 0.5,
    evening: 0.4,
    night: 0.3,
    midnight: 0.2,
  },
  town_square: {
    dawn: 0.2,
    morning: 0.7,
    noon: 0.6,
    afternoon: 0.9,
    dusk: 0.7,
    evening: 0.5,
    night: 0.2,
    midnight: 0.1,
  },
  government: {
    dawn: 0.0,
    morning: 0.7,
    noon: 0.5,
    afternoon: 0.8,
    dusk: 0.4,
    evening: 0.1,
    night: 0.0,
    midnight: 0.0,
  },

  // Transportation
  train_station: {
    dawn: 0.6,
    morning: 0.9,
    noon: 0.7,
    afternoon: 0.8,
    dusk: 0.9,
    evening: 0.6,
    night: 0.3,
    midnight: 0.1,
  },
  railroad_station: {
    dawn: 0.6,
    morning: 0.9,
    noon: 0.7,
    afternoon: 0.8,
    dusk: 0.9,
    evening: 0.6,
    night: 0.3,
    midnight: 0.1,
  },
  telegraph_office: {
    dawn: 0.0,
    morning: 0.6,
    noon: 0.5,
    afternoon: 0.7,
    dusk: 0.4,
    evening: 0.2,
    night: 0.0,
    midnight: 0.0,
  },

  // Special/Faction
  gang_hq: {
    dawn: 0.1,
    morning: 0.3,
    noon: 0.4,
    afternoon: 0.5,
    dusk: 0.6,
    evening: 0.8,
    night: 0.9,
    midnight: 0.5,
  },
  smugglers_den: {
    dawn: 0.1,
    morning: 0.1,
    noon: 0.2,
    afternoon: 0.3,
    dusk: 0.5,
    evening: 0.7,
    night: 1.0,
    midnight: 0.6,
  },
  council_fire: {
    dawn: 0.5,
    morning: 0.6,
    noon: 0.4,
    afternoon: 0.5,
    dusk: 0.9,
    evening: 1.0,
    night: 0.7,
    midnight: 0.2,
  },

  // Labor & Industry
  mining_office: {
    dawn: 0.5,
    morning: 0.9,
    noon: 0.6,
    afternoon: 0.8,
    dusk: 0.7,
    evening: 0.3,
    night: 0.1,
    midnight: 0.0,
  },
  labor_exchange: {
    dawn: 0.7,
    morning: 1.0,
    noon: 0.5,
    afternoon: 0.6,
    dusk: 0.4,
    evening: 0.2,
    night: 0.0,
    midnight: 0.0,
  },

  // Default pattern for unlisted types
  default: {
    dawn: 0.2,
    morning: 0.6,
    noon: 0.5,
    afternoon: 0.7,
    dusk: 0.6,
    evening: 0.4,
    night: 0.2,
    midnight: 0.1,
  },
};

/**
 * Base capacity for different building types
 */
const BUILDING_CAPACITIES: Partial<Record<LocationType, LocationCapacity>> = {
  saloon: { baseCapacity: 80, isIndoor: true, isPublic: true },
  cantina: { baseCapacity: 60, isIndoor: true, isPublic: true },
  church: { baseCapacity: 100, isIndoor: true, isPublic: true },
  bank: { baseCapacity: 30, isIndoor: true, isPublic: true },
  general_store: { baseCapacity: 40, isIndoor: true, isPublic: true },
  town_square: { baseCapacity: 200, isIndoor: false, isPublic: true },
  train_station: { baseCapacity: 120, isIndoor: false, isPublic: true },
  sheriff_office: { baseCapacity: 20, isIndoor: true, isPublic: true },
  hotel: { baseCapacity: 50, isIndoor: true, isPublic: true },
  blacksmith: { baseCapacity: 15, isIndoor: true, isPublic: true },
  doctors_office: { baseCapacity: 25, isIndoor: true, isPublic: true },
  fighting_pit: { baseCapacity: 150, isIndoor: false, isPublic: true },
  gang_hq: { baseCapacity: 40, isIndoor: true, isPublic: false },
  smugglers_den: { baseCapacity: 30, isIndoor: true, isPublic: false },
  trading_post: { baseCapacity: 50, isIndoor: true, isPublic: true },
};

/**
 * Default capacity for unknown building types
 */
const DEFAULT_CAPACITY: LocationCapacity = {
  baseCapacity: 50,
  isIndoor: true,
  isPublic: true,
};

/**
 * Atmosphere descriptions for crowd levels
 */
const ATMOSPHERE_TEMPLATES: Record<string, Record<CrowdLevel, string[]>> = {
  saloon: {
    [CrowdLevel.EMPTY]: [
      'The empty saloon echoes with your footsteps. A lone bartender polishes glasses in silence.',
      'Chairs are upturned on tables. The piano sits silent and dusty.',
      'Not a soul in sight except the bartender, who eyes you warily.',
    ],
    [CrowdLevel.SPARSE]: [
      'A handful of patrons nurse their drinks in quiet corners.',
      'The saloon is mostly empty. A few old-timers play cards in the corner.',
      'Sparse crowd tonight. The bartender looks bored.',
    ],
    [CrowdLevel.MODERATE]: [
      'A decent crowd fills about half the tables. Conversation flows steadily.',
      'The saloon has a comfortable number of patrons. The piano player taps out a tune.',
      'Moderate traffic. Some folks at the bar, others playing cards.',
    ],
    [CrowdLevel.BUSY]: [
      'Most tables are occupied. The air buzzes with conversation and laughter.',
      'A lively crowd fills the saloon. The bartender works steadily.',
      'Busy evening. You might have to wait for a seat at the bar.',
    ],
    [CrowdLevel.CROWDED]: [
      'The saloon is packed shoulder to shoulder. Noise fills every corner.',
      'Standing room only. The bartender frantically serves drinks.',
      'Barely room to move. The crowd is raucous and energetic.',
    ],
    [CrowdLevel.PACKED]: [
      'Bodies press against each other at the bar. The noise is deafening.',
      'Absolutely packed. Fights could break out at any moment from the overcrowding.',
      'Wall-to-wall humanity. The heat and smell of unwashed bodies is overwhelming.',
    ],
  },
  church: {
    [CrowdLevel.EMPTY]: [
      'The church is silent and empty. Sunlight streams through stained glass.',
      'Not a soul except you and God. Dust motes dance in the light.',
      'The pews are empty. Your footsteps echo on the wooden floor.',
    ],
    [CrowdLevel.SPARSE]: [
      'A few devoted souls kneel in prayer scattered throughout the pews.',
      'The church is quiet. A handful of worshippers sit in contemplation.',
    ],
    [CrowdLevel.MODERATE]: [
      'A modest congregation fills the front pews. Hymns echo softly.',
      'About half the pews are occupied by attentive worshippers.',
    ],
    [CrowdLevel.BUSY]: [
      'Most pews are filled. The preacher addresses the congregation with passion.',
      'A strong turnout today. The church choir sings hymns beautifully.',
    ],
    [CrowdLevel.CROWDED]: [
      'Standing room only. The faithful pack every available space.',
      'Shoulder to shoulder in the pews. Sunday service is well-attended.',
    ],
    [CrowdLevel.PACKED]: [
      'The congregation spills out onto the steps. Everyone comes to worship today.',
      'Absolutely packed for a special service. You can barely squeeze inside.',
    ],
  },
  bank: {
    [CrowdLevel.EMPTY]: [
      'The bank is empty. Tellers wait idly behind their cages.',
      'Not a customer in sight. The guard looks half-asleep.',
    ],
    [CrowdLevel.SPARSE]: [
      'One or two customers conduct business quietly.',
      'A short line forms at a single teller window.',
    ],
    [CrowdLevel.MODERATE]: [
      'Several customers wait in line. Business as usual.',
      'A steady flow of patrons conducting transactions.',
    ],
    [CrowdLevel.BUSY]: [
      'All teller windows are active. The line moves slowly.',
      'Busy day at the bank. Miners cashing in their gold dust.',
    ],
    [CrowdLevel.CROWDED]: [
      'The bank is packed with customers. The guard watches nervously.',
      'Long lines at every window. Must be payday.',
    ],
    [CrowdLevel.PACKED]: [
      'Absolutely jammed. The bank manager looks stressed as customers complain.',
      'Standing room only. Something big must be happening - maybe a gold rush?',
    ],
  },
  town_square: {
    [CrowdLevel.EMPTY]: [
      'The town square is eerily deserted. Wind blows tumbleweeds across the dusty ground.',
      'Not a soul in sight. The fountain trickles quietly.',
    ],
    [CrowdLevel.SPARSE]: [
      'A few townsfolk go about their business, heads down.',
      'Scattered activity. A vendor hawks wares to sparse foot traffic.',
    ],
    [CrowdLevel.MODERATE]: [
      'The square has a comfortable level of activity. People chat and trade.',
      'Moderate crowd. The town feels alive and welcoming.',
    ],
    [CrowdLevel.BUSY]: [
      'The square bustles with activity. Vendors call out their wares.',
      'Busy day. People hurry about their business all around you.',
    ],
    [CrowdLevel.CROWDED]: [
      'The square is packed with people. You have to navigate through the crowd.',
      'Shoulder to shoulder. Must be market day.',
    ],
    [CrowdLevel.PACKED]: [
      'An absolute throng of humanity fills every inch of the square.',
      'You can barely move through the dense crowd. Some kind of event must be happening.',
    ],
  },
  general_store: {
    [CrowdLevel.EMPTY]: [
      'The store is empty except for the proprietor behind the counter.',
      'Shelves fully stocked, but no customers. The shopkeeper dozes.',
    ],
    [CrowdLevel.SPARSE]: [
      'One or two customers browse the shelves quietly.',
      'Sparse traffic. The shopkeeper greets you warmly.',
    ],
    [CrowdLevel.MODERATE]: [
      'Several customers browse goods. A short line at the counter.',
      'Moderate business. People stock up on supplies.',
    ],
    [CrowdLevel.BUSY]: [
      'The store is busy with customers. You might have to wait.',
      'Lots of folks stocking up. The shopkeeper moves efficiently.',
    ],
    [CrowdLevel.CROWDED]: [
      'Crowded with shoppers. Hard to navigate the narrow aisles.',
      'Packed with customers. Shelves are being picked clean.',
    ],
    [CrowdLevel.PACKED]: [
      'Absolutely mobbed. Customers push and shove to reach items.',
      'Standing room only. Must be a shortage of something.',
    ],
  },
  fighting_pit: {
    [CrowdLevel.EMPTY]: [
      'The fighting pit stands empty. Bloodstains mark the sand.',
      'No fights scheduled. The arena is silent and abandoned.',
    ],
    [CrowdLevel.SPARSE]: [
      'A few spectators watch a practice bout.',
      'Small crowd for an informal match.',
    ],
    [CrowdLevel.MODERATE]: [
      'Decent crowd forms around the pit. A fight is about to start.',
      'The stands are half-full. Betting is active.',
    ],
    [CrowdLevel.BUSY]: [
      'Good turnout for tonight\'s matches. The crowd roars.',
      'Most seats are filled. Two fighters circle in the pit.',
    ],
    [CrowdLevel.CROWDED]: [
      'Packed stands. The crowd screams for blood.',
      'Standing room only. A major bout draws a huge crowd.',
    ],
    [CrowdLevel.PACKED]: [
      'The crowd is absolutely frenzied. Bodies press against the pit barriers.',
      'Absolutely packed. A legendary fighter must be competing tonight.',
    ],
  },
};

/**
 * Default atmosphere template
 */
const DEFAULT_ATMOSPHERE: Record<CrowdLevel, string[]> = {
  [CrowdLevel.EMPTY]: ['The place is completely empty.', 'Not a soul in sight.'],
  [CrowdLevel.SPARSE]: ['Only a few people are here.', 'Mostly empty.'],
  [CrowdLevel.MODERATE]: ['A moderate number of people are present.', 'Comfortable crowd.'],
  [CrowdLevel.BUSY]: ['Quite busy here.', 'Lots of activity.'],
  [CrowdLevel.CROWDED]: ['Very crowded.', 'Packed with people.'],
  [CrowdLevel.PACKED]: ['Absolutely packed.', 'Wall-to-wall people.'],
};

export class CrowdService {
  /**
   * Calculate current crowd level for a location
   */
  static async getCrowdLevel(locationId: string): Promise<CrowdState | null> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return null;
      }

      const calculation = await this.calculateCrowd(location.type);
      const capacity = this.getLocationCapacity(location.type);
      const effects = this.getCrimeModifier(calculation.level);
      const atmosphere = this.getAtmosphereDescription(location.type, calculation.level);

      const crowdState: CrowdState = {
        locationId,
        currentLevel: calculation.level,
        estimatedCount: calculation.estimatedCount,
        baseCapacity: capacity.baseCapacity,
        percentFull: Math.round((calculation.estimatedCount / capacity.baseCapacity) * 100),
        factors: calculation.factors,
        atmosphereDescription: atmosphere,
        lastUpdated: new Date(),
      };

      return crowdState;
    } catch (error) {
      logger.error('Error calculating crowd level:', error);
      return null;
    }
  }

  /**
   * Calculate crowd for a specific location type
   */
  static async calculateCrowd(locationType: LocationType): Promise<CrowdCalculation> {
    const worldState = await WorldEventService.getWorldState();
    const capacity = this.getLocationCapacity(locationType);
    const factors: CrowdFactor[] = [];

    // 1. Get base time multiplier
    const timeMultiplier = this.getTimeMultiplier(locationType, worldState.timeOfDay);
    factors.push({
      type: 'time',
      modifier: timeMultiplier,
      description: `${worldState.timeOfDay} (${worldState.gameHour}:00)`,
    });

    // 2. Get weather modifier (affects outdoor locations)
    const weatherModifier = this.getWeatherModifier(
      worldState.currentWeather,
      capacity.isIndoor
    );
    if (weatherModifier !== 1.0) {
      factors.push({
        type: 'weather',
        modifier: weatherModifier,
        description: worldState.currentWeather,
      });
    }

    // 3. Check for active events
    const eventModifier = await this.getEventModifier(locationType);
    if (eventModifier !== 1.0) {
      factors.push({
        type: 'event',
        modifier: eventModifier,
        description: 'Special event affecting crowds',
      });
    }

    // 4. Day of week variation (weekends busier for entertainment)
    const dayModifier = this.getDayOfWeekModifier(locationType, worldState.gameDay);
    if (dayModifier !== 1.0) {
      factors.push({
        type: 'day_of_week',
        modifier: dayModifier,
        description: 'Day of week effect',
      });
    }

    // 5. Random variation (±10%)
    const randomModifier = 0.9 + Math.random() * 0.2;
    factors.push({
      type: 'random',
      modifier: randomModifier,
      description: 'Natural variation',
    });

    // Calculate final multiplier
    const rawMultiplier = timeMultiplier;
    const finalMultiplier = rawMultiplier * weatherModifier * eventModifier * dayModifier * randomModifier;
    const estimatedCount = Math.round(capacity.baseCapacity * finalMultiplier);
    const level = this.determineLevel(estimatedCount, capacity.baseCapacity);

    return {
      rawMultiplier,
      finalMultiplier,
      estimatedCount: Math.max(0, estimatedCount),
      level,
      factors,
    };
  }

  /**
   * Get time-based multiplier
   */
  private static getTimeMultiplier(locationType: LocationType, timeOfDay: TimeOfDay): number {
    const pattern = CROWD_PATTERNS[locationType] || CROWD_PATTERNS.default;

    switch (timeOfDay) {
      case TimeOfDay.DAWN:
        return pattern.dawn;
      case TimeOfDay.MORNING:
        return pattern.morning;
      case TimeOfDay.NOON:
        return pattern.noon;
      case TimeOfDay.AFTERNOON:
        return pattern.afternoon;
      case TimeOfDay.DUSK:
        return pattern.dusk;
      case TimeOfDay.EVENING:
        return pattern.evening;
      case TimeOfDay.NIGHT:
        return pattern.night;
      default:
        return pattern.midnight;
    }
  }

  /**
   * Get weather modifier
   */
  private static getWeatherModifier(weather: WeatherType, isIndoor: boolean): number {
    // Indoor locations less affected by weather
    if (isIndoor) {
      switch (weather) {
        case WeatherType.DUST_STORM:
        case WeatherType.THUNDERSTORM:
          return 1.2; // More people take shelter
        case WeatherType.RAIN:
          return 1.1;
        default:
          return 1.0;
      }
    }

    // Outdoor locations very affected by weather
    switch (weather) {
      case WeatherType.DUST_STORM:
        return 0.2; // -80% outdoor crowds
      case WeatherType.THUNDERSTORM:
        return 0.3; // -70%
      case WeatherType.RAIN:
        return 0.6; // -40%
      case WeatherType.HEAT_WAVE:
        return 0.7; // -30%
      case WeatherType.FOG:
        return 0.8; // -20%
      default:
        return 1.0;
    }
  }

  /**
   * Get event modifier
   */
  private static async getEventModifier(locationType: LocationType): Promise<number> {
    try {
      const activeEvents = await WorldEventService.getActiveEvents();

      for (const event of activeEvents) {
        // Check if event affects this location type
        if (event.type === 'TOWN_FESTIVAL') {
          // Festivals increase crowds in entertainment venues
          if (['saloon', 'cantina', 'town_square', 'fighting_pit'].includes(locationType)) {
            return 1.5;
          }
        }
        // Add more event types as needed
      }

      return 1.0;
    } catch (error) {
      logger.error('Error getting event modifier:', error);
      return 1.0;
    }
  }

  /**
   * Get day of week modifier
   */
  private static getDayOfWeekModifier(locationType: LocationType, gameDay: number): number {
    // Simple weekend simulation (days 6-7, 13-14, 20-21, 27-28)
    const dayOfWeek = gameDay % 7;
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    if (isWeekend) {
      // Entertainment venues busier on weekends
      if (['saloon', 'cantina', 'fighting_pit', 'hotel'].includes(locationType)) {
        return 1.3;
      }
      // Business slower on weekends
      if (['bank', 'government', 'mining_office', 'labor_exchange'].includes(locationType)) {
        return 0.7;
      }
    }

    return 1.0;
  }

  /**
   * Determine crowd level from count and capacity
   */
  private static determineLevel(count: number, capacity: number): CrowdLevel {
    const percent = (count / capacity) * 100;

    if (percent >= 90) return CrowdLevel.PACKED;
    if (percent >= 75) return CrowdLevel.CROWDED;
    if (percent >= 50) return CrowdLevel.BUSY;
    if (percent >= 25) return CrowdLevel.MODERATE;
    if (percent >= 5) return CrowdLevel.SPARSE;
    return CrowdLevel.EMPTY;
  }

  /**
   * Get location capacity data
   */
  private static getLocationCapacity(locationType: LocationType): LocationCapacity {
    return BUILDING_CAPACITIES[locationType] || DEFAULT_CAPACITY;
  }

  /**
   * Get crime detection modifier based on crowd level
   */
  static getCrimeModifier(crowdLevel: CrowdLevel): CrowdEffects {
    switch (crowdLevel) {
      case CrowdLevel.EMPTY:
        return {
          crimeDetectionModifier: 0.2, // 80% less chance of being witnessed
          pickpocketingAvailable: false,
          pickpocketingBonus: 0,
          atmosphereBonus: 'Few witnesses around',
        };
      case CrowdLevel.SPARSE:
        return {
          crimeDetectionModifier: 0.5,
          pickpocketingAvailable: false,
          pickpocketingBonus: 0,
          atmosphereBonus: 'Limited witnesses',
        };
      case CrowdLevel.MODERATE:
        return {
          crimeDetectionModifier: 0.8,
          pickpocketingAvailable: true,
          pickpocketingBonus: 1.0,
          atmosphereBonus: 'Moderate crowd provides some cover',
        };
      case CrowdLevel.BUSY:
        return {
          crimeDetectionModifier: 1.0, // Baseline
          pickpocketingAvailable: true,
          pickpocketingBonus: 1.3,
          atmosphereBonus: 'Busy crowd - easy to blend in',
        };
      case CrowdLevel.CROWDED:
        return {
          crimeDetectionModifier: 1.3, // More eyes watching
          pickpocketingAvailable: true,
          pickpocketingBonus: 1.5,
          atmosphereBonus: 'Dense crowd - many potential marks',
        };
      case CrowdLevel.PACKED:
        return {
          crimeDetectionModifier: 1.5, // Very risky
          pickpocketingAvailable: true,
          pickpocketingBonus: 1.8,
          atmosphereBonus: 'Chaos and confusion provide opportunities',
        };
      default:
        return {
          crimeDetectionModifier: 1.0,
          pickpocketingAvailable: false,
          pickpocketingBonus: 0,
          atmosphereBonus: '',
        };
    }
  }

  /**
   * Generate atmosphere description
   */
  static getAtmosphereDescription(locationType: LocationType, crowdLevel: CrowdLevel): string {
    const templates = ATMOSPHERE_TEMPLATES[locationType] || DEFAULT_ATMOSPHERE;
    const options = templates[crowdLevel];

    if (!options || options.length === 0) {
      return `The ${locationType} is ${crowdLevel}.`;
    }

    // Pick a random description from available options
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Batch update crowd levels for all locations (called periodically)
   * This would be used by a background job to cache crowd states
   */
  static async updateAllLocationCrowds(): Promise<number> {
    try {
      const locations = await Location.find({ isHidden: false }).select('_id type');
      let updated = 0;

      for (const location of locations) {
        const crowdState = await this.getCrowdLevel(location._id.toString());
        if (crowdState) {
          // In a real implementation, we'd cache this in Redis or similar
          // For now, we just log it
          logger.debug(`Updated crowd for ${location.type}: ${crowdState.currentLevel}`);
          updated++;
        }
      }

      logger.info(`Updated crowd levels for ${updated} locations`);
      return updated;
    } catch (error) {
      logger.error('Error updating location crowds:', error);
      return 0;
    }
  }

  /**
   * Get multiple crowd factors for display
   */
  static async calculateCrowdFactors(locationId: string): Promise<CrowdFactor[]> {
    const crowdState = await this.getCrowdLevel(locationId);
    return crowdState?.factors || [];
  }
}

export default CrowdService;
