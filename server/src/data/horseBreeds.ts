import {
  HorseBreed,
  HorseBreedDefinition,
  HorseRarity,
  HorseColor
} from '@desperados/shared';

// ============================================================================
// HORSE BREED DEFINITIONS
// ============================================================================

export const HORSE_BREEDS: Record<HorseBreed, HorseBreedDefinition> = {
  // ========================================
  // COMMON BREEDS
  // ========================================

  [HorseBreed.QUARTER_HORSE]: {
    breed: HorseBreed.QUARTER_HORSE,
    name: 'Quarter Horse',
    description: 'The jack-of-all-trades of the West. Good speed, decent stamina, and reliable temperament make this the working cowboy\'s favorite.',
    rarity: HorseRarity.COMMON,
    basePrice: 250,
    statRanges: {
      speed: [50, 70],
      stamina: [55, 75],
      health: [60, 80],
      bravery: [50, 70],
      temperament: [65, 85]
    },
    specialties: ['Ranch work', 'General riding', 'Short-distance racing'],
    maxSkills: 4,
    preferredColors: [
      HorseColor.BAY,
      HorseColor.CHESTNUT,
      HorseColor.BROWN,
      HorseColor.PALOMINO
    ],
    wildEncounter: true,
    shopAvailable: true
  },

  [HorseBreed.MUSTANG]: {
    breed: HorseBreed.MUSTANG,
    name: 'Mustang',
    description: 'Wild spirit of the frontier. High stamina and survival instincts, but requires patience to tame. Once bonded, incredibly loyal.',
    rarity: HorseRarity.COMMON,
    basePrice: 200, // Cheaper if tamed, expensive if pre-broken
    statRanges: {
      speed: [55, 75],
      stamina: [70, 90],
      health: [65, 85],
      bravery: [60, 80],
      temperament: [30, 50] // Harder to handle initially
    },
    specialties: ['Endurance', 'Wilderness survival', 'Mountain terrain'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.BAY,
      HorseColor.BUCKSKIN,
      HorseColor.DAPPLE_GRAY,
      HorseColor.PAINT
    ],
    wildEncounter: true,
    shopAvailable: false, // Must be tamed
    uniqueAbility: 'Natural Survivor: +10% stamina regeneration in wilderness'
  },

  [HorseBreed.PAINT_HORSE]: {
    breed: HorseBreed.PAINT_HORSE,
    name: 'Paint Horse',
    description: 'Flashy pinto coat makes you stand out. Good-natured and social, popular with showmen and those who value appearance.',
    rarity: HorseRarity.COMMON,
    basePrice: 300,
    statRanges: {
      speed: [50, 70],
      stamina: [50, 70],
      health: [55, 75],
      bravery: [45, 65],
      temperament: [70, 90]
    },
    specialties: ['Shows', 'Tricks', 'Social riding'],
    maxSkills: 4,
    preferredColors: [
      HorseColor.PINTO,
      HorseColor.PAINT
    ],
    wildEncounter: false,
    shopAvailable: true,
    uniqueAbility: 'Eye-Catching: +10 Charisma when mounted'
  },

  [HorseBreed.MORGAN]: {
    breed: HorseBreed.MORGAN,
    name: 'Morgan',
    description: 'The perfect first horse. Easy to train, willing to please, and versatile. Not exceptional at anything, but reliable in everything.',
    rarity: HorseRarity.COMMON,
    basePrice: 275,
    statRanges: {
      speed: [45, 65],
      stamina: [55, 75],
      health: [60, 80],
      bravery: [50, 70],
      temperament: [75, 95]
    },
    specialties: ['Beginner-friendly', 'Training', 'Family riding'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.BAY,
      HorseColor.CHESTNUT,
      HorseColor.BLACK
    ],
    wildEncounter: false,
    shopAvailable: true,
    uniqueAbility: 'Quick Learner: Training time reduced by 20%'
  },

  [HorseBreed.APPALOOSA]: {
    breed: HorseBreed.APPALOOSA,
    name: 'Appaloosa',
    description: 'Bred by the Nez Perce. Distinctive spotted coat and striped hooves. Hardy, intelligent, and excellent night vision.',
    rarity: HorseRarity.COMMON,
    basePrice: 320,
    statRanges: {
      speed: [55, 75],
      stamina: [60, 80],
      health: [65, 85],
      bravery: [55, 75],
      temperament: [60, 80]
    },
    specialties: ['Night riding', 'Tracking', 'Native terrain'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.APPALOOSA_SPOTTED
    ],
    wildEncounter: true,
    shopAvailable: true,
    requiresReputation: 10,
    uniqueAbility: 'Night Eyes: No speed penalty during night travel'
  },

  // ========================================
  // QUALITY BREEDS
  // ========================================

  [HorseBreed.TENNESSEE_WALKER]: {
    breed: HorseBreed.TENNESSEE_WALKER,
    name: 'Tennessee Walking Horse',
    description: 'Smooth, ground-covering gait makes long rides comfortable. Plantation favorite turned long-distance champion.',
    rarity: HorseRarity.QUALITY,
    basePrice: 500,
    statRanges: {
      speed: [60, 75],
      stamina: [70, 85],
      health: [60, 75],
      bravery: [50, 65],
      temperament: [70, 85]
    },
    specialties: ['Long-distance', 'Comfort', 'Endurance riding'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.BLACK,
      HorseColor.BAY,
      HorseColor.CHESTNUT,
      HorseColor.ROAN
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 20,
    uniqueAbility: 'Smooth Gait: Rider fatigue reduced by 30% on long journeys'
  },

  [HorseBreed.AMERICAN_STANDARDBRED]: {
    breed: HorseBreed.AMERICAN_STANDARDBRED,
    name: 'American Standardbred',
    description: 'Purpose-bred for harness racing. Natural trotters with competitive spirit and consistent speed.',
    rarity: HorseRarity.QUALITY,
    basePrice: 600,
    statRanges: {
      speed: [70, 85],
      stamina: [65, 80],
      health: [55, 70],
      bravery: [50, 65],
      temperament: [60, 75]
    },
    specialties: ['Racing', 'Harness work', 'Consistent pace'],
    maxSkills: 4,
    preferredColors: [
      HorseColor.BAY,
      HorseColor.BROWN,
      HorseColor.BLACK
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 25,
    uniqueAbility: 'Steady Pace: Stamina consumption 20% slower during sustained travel'
  },

  [HorseBreed.MISSOURI_FOX_TROTTER]: {
    breed: HorseBreed.MISSOURI_FOX_TROTTER,
    name: 'Missouri Fox Trotter',
    description: 'Unique "fox trot" gait combines speed and endurance. Mountain-bred for sure-footedness on rough terrain.',
    rarity: HorseRarity.QUALITY,
    basePrice: 650,
    statRanges: {
      speed: [65, 80],
      stamina: [75, 90],
      health: [65, 80],
      bravery: [60, 75],
      temperament: [65, 80]
    },
    specialties: ['Mountain terrain', 'Endurance', 'Rough trails'],
    maxSkills: 6,
    preferredColors: [
      HorseColor.CHESTNUT,
      HorseColor.PALOMINO,
      HorseColor.BAY
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 30,
    uniqueAbility: 'Sure-Footed: 50% reduced chance of injury on rough terrain'
  },

  [HorseBreed.THOROUGHBRED]: {
    breed: HorseBreed.THOROUGHBRED,
    name: 'Thoroughbred',
    description: 'The ultimate racing machine. Bred for speed and spirit, but high-strung and requires expert handling.',
    rarity: HorseRarity.QUALITY,
    basePrice: 800,
    statRanges: {
      speed: [80, 95],
      stamina: [60, 75],
      health: [50, 65],
      bravery: [55, 70],
      temperament: [40, 55] // Spirited
    },
    specialties: ['Racing', 'Speed', 'Competition'],
    maxSkills: 4,
    preferredColors: [
      HorseColor.BAY,
      HorseColor.CHESTNUT,
      HorseColor.BLACK,
      HorseColor.GRAY
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 35,
    uniqueAbility: 'Racing Blood: +20% speed in official races'
  },

  [HorseBreed.ARABIAN]: {
    breed: HorseBreed.ARABIAN,
    name: 'Arabian',
    description: 'Ancient desert breed. Refined beauty, exceptional intelligence, and legendary endurance. The aristocrat of horses.',
    rarity: HorseRarity.QUALITY,
    basePrice: 1000,
    statRanges: {
      speed: [70, 85],
      stamina: [80, 95],
      health: [70, 85],
      bravery: [65, 80],
      temperament: [70, 85]
    },
    specialties: ['Endurance', 'Intelligence', 'Prestige'],
    maxSkills: 7,
    preferredColors: [
      HorseColor.GRAY,
      HorseColor.BAY,
      HorseColor.CHESTNUT,
      HorseColor.BLACK
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 40,
    uniqueAbility: 'Desert Born: Heat and thirst effects reduced by 50%'
  },

  // ========================================
  // RARE BREEDS
  // ========================================

  [HorseBreed.ANDALUSIAN]: {
    breed: HorseBreed.ANDALUSIAN,
    name: 'Andalusian',
    description: 'Spanish war horse. Powerful, courageous, and trained for centuries for mounted combat. Unflinching in battle.',
    rarity: HorseRarity.RARE,
    basePrice: 1500,
    statRanges: {
      speed: [65, 80],
      stamina: [70, 85],
      health: [75, 90],
      bravery: [85, 100],
      temperament: [65, 80]
    },
    specialties: ['Combat', 'War', 'Intimidation'],
    maxSkills: 6,
    preferredColors: [
      HorseColor.GRAY,
      HorseColor.WHITE,
      HorseColor.BAY
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 50,
    uniqueAbility: 'War Horse: Never flees in combat, +20% mounted combat bonus'
  },

  [HorseBreed.FRIESIAN]: {
    breed: HorseBreed.FRIESIAN,
    name: 'Friesian',
    description: 'Majestic black stallion from the Netherlands. Flowing mane, powerful build, and commanding presence strike fear into enemies.',
    rarity: HorseRarity.RARE,
    basePrice: 1800,
    statRanges: {
      speed: [60, 75],
      stamina: [65, 80],
      health: [80, 95],
      bravery: [75, 90],
      temperament: [60, 75]
    },
    specialties: ['Intimidation', 'Presence', 'Heavy combat'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.BLACK
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 55,
    uniqueAbility: 'Intimidating Presence: -10% enemy morale when mounted'
  },

  [HorseBreed.AKHAL_TEKE]: {
    breed: HorseBreed.AKHAL_TEKE,
    name: 'Akhal-Teke',
    description: 'The "Golden Horse" of Turkmenistan. Metallic coat shimmers like gold. Unmatched endurance and heat tolerance.',
    rarity: HorseRarity.RARE,
    basePrice: 2000,
    statRanges: {
      speed: [75, 90],
      stamina: [85, 100],
      health: [70, 85],
      bravery: [70, 85],
      temperament: [55, 70] // Independent
    },
    specialties: ['Extreme endurance', 'Desert travel', 'Prestige'],
    maxSkills: 6,
    preferredColors: [
      HorseColor.GOLDEN,
      HorseColor.PALOMINO,
      HorseColor.BUCKSKIN
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 60,
    uniqueAbility: 'Golden Endurance: Can travel 50% longer without rest'
  },

  [HorseBreed.PERCHERON]: {
    breed: HorseBreed.PERCHERON,
    name: 'Percheron',
    description: 'French draft horse. Massive and powerful, capable of carrying heavy loads or riders in full armor. Gentle giant.',
    rarity: HorseRarity.RARE,
    basePrice: 1200,
    statRanges: {
      speed: [40, 55],
      stamina: [75, 90],
      health: [90, 100],
      bravery: [80, 95],
      temperament: [75, 90]
    },
    specialties: ['Heavy loads', 'Armored combat', 'Strength'],
    maxSkills: 5,
    preferredColors: [
      HorseColor.GRAY,
      HorseColor.BLACK
    ],
    wildEncounter: false,
    shopAvailable: true,
    requiresReputation: 45,
    uniqueAbility: 'Draft Horse: Carry capacity +100%, speed penalty reduced'
  },

  [HorseBreed.LEGENDARY_WILD_STALLION]: {
    breed: HorseBreed.LEGENDARY_WILD_STALLION,
    name: 'Legendary Wild Stallion',
    description: 'A myth made flesh. Stories speak of an untamable white stallion that appears only to the worthy. Near-perfect stats in all categories.',
    rarity: HorseRarity.LEGENDARY,
    basePrice: 0, // Cannot be purchased
    statRanges: {
      speed: [90, 100],
      stamina: [90, 100],
      health: [90, 100],
      bravery: [90, 100],
      temperament: [20, 40] // Extremely difficult to tame
    },
    specialties: ['Everything', 'Legendary', 'Ultimate'],
    maxSkills: 8,
    preferredColors: [
      HorseColor.WHITE,
      HorseColor.SILVER_DAPPLE
    ],
    wildEncounter: true, // Extremely rare random encounter
    shopAvailable: false,
    requiresReputation: 80,
    uniqueAbility: 'Legend\'s Spirit: All stats +10%, bond gains doubled once tamed'
  }
};

// ============================================================================
// BREED LOOKUP UTILITIES
// ============================================================================

export function getBreedDefinition(breed: HorseBreed): HorseBreedDefinition {
  return HORSE_BREEDS[breed];
}

export function getBreedsByRarity(rarity: HorseRarity): HorseBreedDefinition[] {
  return Object.values(HORSE_BREEDS).filter(b => b.rarity === rarity);
}

export function getShopAvailableBreeds(): HorseBreedDefinition[] {
  return Object.values(HORSE_BREEDS).filter(b => b.shopAvailable);
}

export function getWildEncounterBreeds(): HorseBreedDefinition[] {
  return Object.values(HORSE_BREEDS).filter(b => b.wildEncounter);
}

export function getBreedsByReputationRequired(reputation: number): HorseBreedDefinition[] {
  return Object.values(HORSE_BREEDS).filter(
    b => b.shopAvailable && (!b.requiresReputation || reputation >= b.requiresReputation)
  );
}

// ============================================================================
// STAT GENERATION
// ============================================================================

export function generateHorseStats(breed: HorseBreed): {
  speed: number;
  stamina: number;
  health: number;
  bravery: number;
  temperament: number;
} {
  const definition = HORSE_BREEDS[breed];
  const { statRanges } = definition;

  return {
    speed: randomInRange(statRanges.speed[0], statRanges.speed[1]),
    stamina: randomInRange(statRanges.stamina[0], statRanges.stamina[1]),
    health: randomInRange(statRanges.health[0], statRanges.health[1]),
    bravery: randomInRange(statRanges.bravery[0], statRanges.bravery[1]),
    temperament: randomInRange(statRanges.temperament[0], statRanges.temperament[1])
  };
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// COLOR SELECTION
// ============================================================================

export function selectRandomColor(breed: HorseBreed): HorseColor {
  const definition = HORSE_BREEDS[breed];
  const colors = definition.preferredColors;
  return colors[Math.floor(Math.random() * colors.length)];
}
