/**
 * Moon Phases Data
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Defines moon phases and their effects on gameplay
 */

import { MoonPhase, MoonPhaseEffects } from '@desperados/shared';

/**
 * Moon phase effects configuration
 */
export const MOON_PHASE_EFFECTS: Record<MoonPhase, MoonPhaseEffects> = {
  [MoonPhase.NEW_MOON]: {
    phase: MoonPhase.NEW_MOON,
    illumination: 0,

    // Crime - perfect darkness for criminals
    crimeDetectionModifier: 0.5, // 50% less likely to be caught
    crimeBonusGold: 25, // 25% bonus loot

    // Supernatural - dark magic stronger
    supernaturalEncounterChance: 0.15,
    weirdWestPowerBonus: 15,

    // Other
    fishingBonus: -10, // Fish less active
    npcBehaviorModifier: 1.0,
    wolfActivityBonus: 10,
  },

  [MoonPhase.WAXING_CRESCENT]: {
    phase: MoonPhase.WAXING_CRESCENT,
    illumination: 0.25,

    crimeDetectionModifier: 0.7,
    crimeBonusGold: 15,

    supernaturalEncounterChance: 0.08,
    weirdWestPowerBonus: 8,

    fishingBonus: -5,
    npcBehaviorModifier: 1.0,
    wolfActivityBonus: 5,
  },

  [MoonPhase.FIRST_QUARTER]: {
    phase: MoonPhase.FIRST_QUARTER,
    illumination: 0.5,

    crimeDetectionModifier: 0.85,
    crimeBonusGold: 5,

    supernaturalEncounterChance: 0.05,
    weirdWestPowerBonus: 5,

    fishingBonus: 0,
    npcBehaviorModifier: 1.0,
    wolfActivityBonus: 0,
  },

  [MoonPhase.WAXING_GIBBOUS]: {
    phase: MoonPhase.WAXING_GIBBOUS,
    illumination: 0.75,

    crimeDetectionModifier: 1.0,
    crimeBonusGold: 0,

    supernaturalEncounterChance: 0.1,
    weirdWestPowerBonus: 10,

    fishingBonus: 10,
    npcBehaviorModifier: 1.05,
    wolfActivityBonus: 15,
  },

  [MoonPhase.FULL_MOON]: {
    phase: MoonPhase.FULL_MOON,
    illumination: 1.0,

    // Crime - bright light makes it harder
    crimeDetectionModifier: 1.3, // 30% more likely to be caught
    crimeBonusGold: -10, // 10% less loot

    // Supernatural - peak weird west activity
    supernaturalEncounterChance: 0.3, // 30% chance of encounters
    weirdWestPowerBonus: 25,

    // Other
    fishingBonus: 20, // Fish very active
    npcBehaviorModifier: 1.2, // NPCs act strangely
    wolfActivityBonus: 30, // Werewolves!
  },

  [MoonPhase.WANING_GIBBOUS]: {
    phase: MoonPhase.WANING_GIBBOUS,
    illumination: 0.75,

    crimeDetectionModifier: 1.0,
    crimeBonusGold: 0,

    supernaturalEncounterChance: 0.1,
    weirdWestPowerBonus: 10,

    fishingBonus: 10,
    npcBehaviorModifier: 1.05,
    wolfActivityBonus: 15,
  },

  [MoonPhase.LAST_QUARTER]: {
    phase: MoonPhase.LAST_QUARTER,
    illumination: 0.5,

    crimeDetectionModifier: 0.85,
    crimeBonusGold: 5,

    supernaturalEncounterChance: 0.05,
    weirdWestPowerBonus: 5,

    fishingBonus: 0,
    npcBehaviorModifier: 1.0,
    wolfActivityBonus: 0,
  },

  [MoonPhase.WANING_CRESCENT]: {
    phase: MoonPhase.WANING_CRESCENT,
    illumination: 0.25,

    crimeDetectionModifier: 0.7,
    crimeBonusGold: 15,

    supernaturalEncounterChance: 0.08,
    weirdWestPowerBonus: 8,

    fishingBonus: -5,
    npcBehaviorModifier: 1.0,
    wolfActivityBonus: 5,
  },
};

/**
 * Lunar cycle length in game days
 * In real world: ~29.5 days
 * In game: 1 real day = 1 game week, so a moon cycle should be ~4-5 real days
 * We'll use 28 game days (4 real days) for simplicity
 */
export const LUNAR_CYCLE_DAYS = 28;

/**
 * Days per moon phase
 */
export const DAYS_PER_PHASE = LUNAR_CYCLE_DAYS / 8; // 3.5 days per phase

/**
 * Get moon phase effects
 */
export function getMoonPhaseEffects(phase: MoonPhase): MoonPhaseEffects {
  return MOON_PHASE_EFFECTS[phase];
}

/**
 * Calculate moon phase based on day of year
 */
export function calculateMoonPhase(dayOfYear: number): MoonPhase {
  // Calculate position in lunar cycle
  const cyclePosition = dayOfYear % LUNAR_CYCLE_DAYS;
  const phaseIndex = Math.floor(cyclePosition / DAYS_PER_PHASE);

  const phases = [
    MoonPhase.NEW_MOON,
    MoonPhase.WAXING_CRESCENT,
    MoonPhase.FIRST_QUARTER,
    MoonPhase.WAXING_GIBBOUS,
    MoonPhase.FULL_MOON,
    MoonPhase.WANING_GIBBOUS,
    MoonPhase.LAST_QUARTER,
    MoonPhase.WANING_CRESCENT,
  ];

  return phases[Math.min(phaseIndex, 7)];
}

/**
 * Get days until next full moon
 */
export function getDaysUntilFullMoon(currentDayOfYear: number): number {
  const currentPhase = calculateMoonPhase(currentDayOfYear);
  const cyclePosition = currentDayOfYear % LUNAR_CYCLE_DAYS;

  // Full moon is at day 14 of cycle
  const fullMoonDay = 14;
  let daysUntil = fullMoonDay - cyclePosition;

  if (daysUntil < 0) {
    daysUntil += LUNAR_CYCLE_DAYS;
  }

  return Math.round(daysUntil);
}

/**
 * Get days until next new moon
 */
export function getDaysUntilNewMoon(currentDayOfYear: number): number {
  const cyclePosition = currentDayOfYear % LUNAR_CYCLE_DAYS;

  // New moon is at day 0 of cycle
  let daysUntil = LUNAR_CYCLE_DAYS - cyclePosition;

  if (cyclePosition === 0) {
    daysUntil = 0;
  }

  return Math.round(daysUntil);
}

/**
 * Get moon phase description
 */
export function getMoonPhaseDescription(phase: MoonPhase): string {
  const descriptions: Record<MoonPhase, string> = {
    [MoonPhase.NEW_MOON]:
      'The new moon cloaks the night in darkness. Perfect for skullduggery and dark deeds.',
    [MoonPhase.WAXING_CRESCENT]:
      'A thin crescent moon hangs in the sky, barely illuminating the night.',
    [MoonPhase.FIRST_QUARTER]:
      'The moon is half-illuminated, providing modest light to the frontier night.',
    [MoonPhase.WAXING_GIBBOUS]:
      'The gibbous moon grows brighter, and strange things stir in the shadows.',
    [MoonPhase.FULL_MOON]:
      'The full moon bathes the land in silver light. Werewolves howl, spirits walk, and the weird west is at its most powerful.',
    [MoonPhase.WANING_GIBBOUS]:
      'The bright moon wanes, but supernatural forces still linger.',
    [MoonPhase.LAST_QUARTER]:
      'The moon is half-dark, balanced between light and shadow.',
    [MoonPhase.WANING_CRESCENT]:
      'A thin crescent remains as the moon fades toward darkness once more.',
  };

  return descriptions[phase];
}

/**
 * Check if moon phase is favorable for crime
 */
export function isCrimeMoon(phase: MoonPhase): boolean {
  return (
    phase === MoonPhase.NEW_MOON ||
    phase === MoonPhase.WAXING_CRESCENT ||
    phase === MoonPhase.WANING_CRESCENT
  );
}

/**
 * Check if moon phase is favorable for supernatural events
 */
export function isSupernaturalMoon(phase: MoonPhase): boolean {
  return (
    phase === MoonPhase.FULL_MOON ||
    phase === MoonPhase.WAXING_GIBBOUS ||
    phase === MoonPhase.WANING_GIBBOUS
  );
}

/**
 * Get illumination percentage as string
 */
export function getIlluminationString(phase: MoonPhase): string {
  const illumination = MOON_PHASE_EFFECTS[phase].illumination;
  return `${Math.round(illumination * 100)}%`;
}

/**
 * Coalition ceremony schedule (occur on specific moon phases)
 */
export function isCoalitionCeremonyNight(phase: MoonPhase): boolean {
  // Coalition performs ceremonies on new and full moons
  return phase === MoonPhase.NEW_MOON || phase === MoonPhase.FULL_MOON;
}
