/**
 * Fishing Gear Data
 *
 * All fishing equipment available in Desperados Destiny
 */

import {
  FishingRod,
  FishingReel,
  FishingLine,
  Bait,
  Lure,
  RodType,
  ReelType,
  LineType,
  BaitType,
  LureType,
  FishCategory,
  SpotType
} from '@desperados/shared';

// ==================== FISHING RODS ====================

export const FISHING_RODS: Record<string, FishingRod> = {
  CANE_POLE: {
    id: 'cane_pole',
    name: 'Cane Pole',
    description: 'Simple bamboo pole with line tied to the end. Basic but functional.',
    type: RodType.CANE_POLE,
    castDistance: 20,
    flexibility: 40,
    strength: 30,
    durability: 100,
    price: 25
  },

  BAMBOO_ROD: {
    id: 'bamboo_rod',
    name: 'Bamboo Fishing Rod',
    description: 'Flexible bamboo rod with guides. Good all-around choice.',
    type: RodType.BAMBOO_ROD,
    castDistance: 50,
    flexibility: 70,
    strength: 50,
    durability: 200,
    requiredLevel: 5,
    price: 75
  },

  STEEL_ROD: {
    id: 'steel_rod',
    name: 'Steel Fishing Rod',
    description: 'Strong steel rod for big fish. Heavy but powerful.',
    type: RodType.STEEL_ROD,
    castDistance: 60,
    flexibility: 50,
    strength: 85,
    durability: 300,
    requiredLevel: 15,
    price: 180,
    bonuses: {
      fightBonus: 10 // 10% easier fights
    }
  },

  CUSTOM_ROD: {
    id: 'custom_rod',
    name: 'Custom Frontier Rod',
    description: 'Hand-crafted masterpiece. Perfect balance of all qualities.',
    type: RodType.CUSTOM_ROD,
    castDistance: 85,
    flexibility: 80,
    strength: 90,
    durability: 500,
    requiredLevel: 25,
    requiredSkill: 30,
    price: 500,
    bonuses: {
      catchChance: 15,      // +15% catch chance
      fightBonus: 15,       // 15% easier fights
      experienceBonus: 10   // +10% XP
    }
  }
};

// ==================== FISHING REELS ====================

export const FISHING_REELS: Record<string, FishingReel> = {
  SIMPLE_REEL: {
    id: 'simple_reel',
    name: 'Simple Reel',
    description: 'Basic hand-crank reel. Gets the job done.',
    type: ReelType.SIMPLE_REEL,
    retrieveSpeed: 40,
    dragStrength: 30,
    lineCapacity: 50,
    price: 15
  },

  MULTIPLIER_REEL: {
    id: 'multiplier_reel',
    name: 'Multiplier Reel',
    description: 'Geared reel for faster retrieve. Good for active fishing.',
    type: ReelType.MULTIPLIER_REEL,
    retrieveSpeed: 70,
    dragStrength: 50,
    lineCapacity: 75,
    requiredLevel: 10,
    price: 85,
    bonuses: {
      fightTime: 10 // 10% faster fights
    }
  },

  DRAG_REEL: {
    id: 'drag_reel',
    name: 'Precision Drag Reel',
    description: 'Advanced reel with adjustable drag. For trophy fish.',
    type: ReelType.DRAG_REEL,
    retrieveSpeed: 60,
    dragStrength: 90,
    lineCapacity: 100,
    requiredLevel: 20,
    price: 200,
    bonuses: {
      tensionControl: 20 // +20% better tension control
    }
  }
};

// ==================== FISHING LINES ====================

export const FISHING_LINES: Record<string, FishingLine> = {
  COTTON_LINE: {
    id: 'cotton_line',
    name: 'Cotton Line',
    description: 'Cheap twisted cotton line. Weak but affordable.',
    type: LineType.COTTON_LINE,
    strength: 30,
    visibility: 70,
    flexibility: 60,
    price: 5
  },

  SILK_LINE: {
    id: 'silk_line',
    name: 'Silk Line',
    description: 'Strong silk line. Good strength and flexibility.',
    type: LineType.SILK_LINE,
    strength: 60,
    visibility: 50,
    flexibility: 80,
    price: 25
  },

  HORSEHAIR_LINE: {
    id: 'horsehair_line',
    name: 'Horse Hair Line',
    description: 'Premium braided horsehair. Nearly invisible in water.',
    type: LineType.HORSEHAIR_LINE,
    strength: 80,
    visibility: 25,
    flexibility: 70,
    price: 50
  },

  WIRE_LEADER: {
    id: 'wire_leader',
    name: 'Wire Leader Line',
    description: 'Steel wire leader for toothy fish like pike and muskie.',
    type: LineType.WIRE_LEADER,
    strength: 95,
    visibility: 80,
    flexibility: 40,
    price: 40,
    forPike: true
  }
};

// ==================== BAIT ====================

export const BAITS: Record<string, Bait> = {
  WORMS: {
    id: 'worms',
    name: 'Earthworms',
    description: 'Classic fishing bait. Works on almost everything.',
    type: BaitType.WORMS,
    attractiveness: 60,
    price: 1,
    consumable: true
  },

  MINNOWS: {
    id: 'minnows',
    name: 'Live Minnows',
    description: 'Small baitfish. Predator fish love them.',
    type: BaitType.MINNOWS,
    attractiveness: 75,
    targetFish: [FishCategory.BASS, FishCategory.PIKE, FishCategory.TROUT],
    price: 3,
    consumable: true,
    bonusBiteChance: 10
  },

  CRAWFISH: {
    id: 'crawfish',
    name: 'Crawfish',
    description: 'Bottom-dwelling crustacean. Bass and catfish favorite.',
    type: BaitType.CRAWFISH,
    attractiveness: 70,
    targetFish: [FishCategory.BASS, FishCategory.CATFISH],
    price: 2,
    consumable: true,
    bonusBiteChance: 5
  },

  INSECTS: {
    id: 'insects',
    name: 'Grasshoppers',
    description: 'Live insects. Perfect for trout and panfish.',
    type: BaitType.INSECTS,
    attractiveness: 65,
    targetFish: [FishCategory.TROUT, FishCategory.PANFISH],
    price: 1,
    consumable: true
  },

  CUT_BAIT: {
    id: 'cut_bait',
    name: 'Cut Bait',
    description: 'Chunks of fish meat. Strong scent attracts catfish.',
    type: BaitType.CUT_BAIT,
    attractiveness: 70,
    targetFish: [FishCategory.CATFISH, FishCategory.STURGEON],
    price: 2,
    consumable: true,
    bonusBiteChance: 8
  },

  SPECIAL_BAIT: {
    id: 'special_bait',
    name: 'Special Prepared Bait',
    description: 'Secret recipe bait for picky fish. Expensive but effective.',
    type: BaitType.SPECIAL_BAIT,
    attractiveness: 90,
    price: 25,
    consumable: true,
    bonusBiteChance: 20,
    attractsRare: true
  },

  GOLDEN_GRUB: {
    id: 'golden_grub',
    name: 'Golden Grub',
    description: 'Rare insect larva found only in sacred springs. Irresistible to bass.',
    type: BaitType.GOLDEN_GRUB,
    attractiveness: 95,
    targetFish: [FishCategory.BASS],
    price: 50,
    consumable: true,
    bonusBiteChance: 30,
    attractsRare: true
  },

  SPIRIT_WORM: {
    id: 'spirit_worm',
    name: 'Spirit Worm',
    description: 'Glowing worm from Nahi sacred grounds. Attracts legendary fish.',
    type: BaitType.SPIRIT_WORM,
    attractiveness: 98,
    targetFish: [FishCategory.TROUT],
    price: 100,
    consumable: true,
    bonusBiteChance: 40,
    attractsRare: true
  },

  BLOOD_LURE: {
    id: 'blood_lure',
    name: 'Blood Lure',
    description: 'Cursed bait that smells of copper and death. For The Scar only.',
    type: BaitType.BLOOD_LURE,
    attractiveness: 100,
    targetFish: [FishCategory.EXOTIC],
    price: 150,
    consumable: true,
    bonusBiteChance: 50,
    attractsRare: true
  }
};

// ==================== LURES ====================

export const LURES: Record<string, Lure> = {
  SPOON_LURE: {
    id: 'spoon_lure',
    name: 'Silver Spoon Lure',
    description: 'Spinning metal lure. Flash attracts predators.',
    type: LureType.SPOON_LURE,
    attractiveness: 70,
    targetFish: [FishCategory.BASS, FishCategory.PIKE, FishCategory.TROUT],
    depth: [SpotType.SURFACE, SpotType.SHALLOW, SpotType.DEEP],
    durability: 50,
    price: 15,
    bonusHook: 5
  },

  FLY_LURE: {
    id: 'fly_lure',
    name: 'Hand-Tied Fly',
    description: 'Artificial fly that mimics insects. Trout favorite.',
    type: LureType.FLY_LURE,
    attractiveness: 75,
    targetFish: [FishCategory.TROUT, FishCategory.PANFISH],
    depth: [SpotType.SURFACE],
    durability: 30,
    price: 12,
    realistic: true,
    bonusHook: 10
  },

  JIG: {
    id: 'jig',
    name: 'Lead Jig',
    description: 'Weighted lure for bottom fishing. Bounces attractively.',
    type: LureType.JIG,
    attractiveness: 65,
    targetFish: [FishCategory.BASS, FishCategory.PANFISH],
    depth: [SpotType.BOTTOM, SpotType.DEEP],
    durability: 60,
    price: 10
  },

  PLUG: {
    id: 'plug',
    name: 'Wooden Plug',
    description: 'Carved and painted to look like a baitfish. Swims realistically.',
    type: LureType.PLUG,
    attractiveness: 80,
    targetFish: [FishCategory.BASS, FishCategory.PIKE],
    depth: [SpotType.SHALLOW, SpotType.DEEP],
    durability: 40,
    price: 20,
    realistic: true,
    bonusHook: 8
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all rods as array
 */
export function getAllRods(): FishingRod[] {
  return Object.values(FISHING_RODS);
}

/**
 * Get all reels as array
 */
export function getAllReels(): FishingReel[] {
  return Object.values(FISHING_REELS);
}

/**
 * Get all lines as array
 */
export function getAllLines(): FishingLine[] {
  return Object.values(FISHING_LINES);
}

/**
 * Get all baits as array
 */
export function getAllBaits(): Bait[] {
  return Object.values(BAITS);
}

/**
 * Get all lures as array
 */
export function getAllLures(): Lure[] {
  return Object.values(LURES);
}

/**
 * Get gear by ID
 */
export function getRod(rodId: string): FishingRod | undefined {
  return FISHING_RODS[rodId];
}

export function getReel(reelId: string): FishingReel | undefined {
  return FISHING_REELS[reelId];
}

export function getLine(lineId: string): FishingLine | undefined {
  return FISHING_LINES[lineId];
}

export function getBait(baitId: string): Bait | undefined {
  return BAITS[baitId];
}

export function getLure(lureId: string): Lure | undefined {
  return LURES[lureId];
}

/**
 * Get starter fishing kit
 */
export function getStarterKit(): {
  rod: FishingRod;
  reel: FishingReel;
  line: FishingLine;
  bait: Bait;
} {
  return {
    rod: FISHING_RODS.CANE_POLE,
    reel: FISHING_REELS.SIMPLE_REEL,
    line: FISHING_LINES.COTTON_LINE,
    bait: BAITS.WORMS
  };
}

/**
 * Calculate total setup quality (1-100)
 */
export function calculateSetupQuality(
  rod: FishingRod,
  reel: FishingReel,
  line: FishingLine
): number {
  const rodQuality = (rod.castDistance + rod.flexibility + rod.strength) / 3;
  const reelQuality = (reel.retrieveSpeed + reel.dragStrength + reel.lineCapacity) / 3;
  const lineQuality = (line.strength + (100 - line.visibility) + line.flexibility) / 3;

  return Math.floor((rodQuality + reelQuality + lineQuality) / 3);
}

/**
 * Check if setup is suitable for fish
 */
export function isSetupSuitable(
  fish: { maxWeight: number; category: FishCategory },
  rod: FishingRod,
  line: FishingLine
): { suitable: boolean; reason?: string } {
  // Check rod strength
  const fishStrengthRequired = Math.min(100, fish.maxWeight * 3);
  if (rod.strength < fishStrengthRequired) {
    return {
      suitable: false,
      reason: 'Rod not strong enough for this fish'
    };
  }

  // Check line strength
  const lineStrengthRequired = Math.min(100, fish.maxWeight * 4);
  if (line.strength < lineStrengthRequired) {
    return {
      suitable: false,
      reason: 'Line too weak for this fish'
    };
  }

  // Check if pike/muskie need wire leader
  if (
    (fish.category === FishCategory.PIKE) &&
    fish.maxWeight > 15 &&
    !line.forPike
  ) {
    return {
      suitable: false,
      reason: 'Need wire leader for large toothy fish'
    };
  }

  return { suitable: true };
}

/**
 * Calculate bait effectiveness for fish
 */
export function calculateBaitEffectiveness(
  bait: Bait,
  fish: { category: FishCategory; rarity: string }
): number {
  let effectiveness = bait.attractiveness;

  // Bonus for target fish
  if (bait.targetFish && bait.targetFish.includes(fish.category)) {
    effectiveness += 20;
  }

  // Bonus for rare fish
  if (bait.attractsRare && (fish.rarity === 'RARE' || fish.rarity === 'LEGENDARY')) {
    effectiveness += 15;
  }

  // Apply bite chance bonus
  if (bait.bonusBiteChance) {
    effectiveness += bait.bonusBiteChance;
  }

  return Math.min(100, effectiveness);
}

/**
 * Calculate lure effectiveness
 */
export function calculateLureEffectiveness(
  lure: Lure,
  fish: { category: FishCategory },
  spot: SpotType
): number {
  let effectiveness = lure.attractiveness;

  // Bonus for target fish
  if (lure.targetFish && lure.targetFish.includes(fish.category)) {
    effectiveness += 15;
  }

  // Bonus if lure matches depth
  if (lure.depth.includes(spot)) {
    effectiveness += 10;
  }

  // Realistic lures work better on wary fish
  if (lure.realistic) {
    effectiveness += 5;
  }

  return Math.min(100, effectiveness);
}
