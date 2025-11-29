/**
 * Workshop Buildings Data
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Complete workshop building definitions across all game locations
 */

import {
  WorkshopBuilding,
  WorkshopFacility,
  GameLocation,
  LOCATION_NAMES,
  OperatingHours,
  AccessRequirement,
  MembershipOption,
  FacilityBonus
} from '@desperados/shared';
import { ProfessionId, CraftingFacilityType } from '@desperados/shared';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createStandardMembership(): MembershipOption[] {
  return [
    {
      type: 'daily',
      cost: 20,
      benefits: ['Unlimited access for 24 hours', '5% quality bonus'],
      description: 'Perfect for a day of intensive crafting'
    },
    {
      type: 'weekly',
      cost: 100,
      benefits: ['Unlimited access for 7 days', '10% quality bonus', 'Priority equipment use'],
      description: 'Best value for regular crafters'
    },
    {
      type: 'monthly',
      cost: 300,
      benefits: ['Unlimited access for 30 days', '15% quality bonus', 'Priority equipment use', 'Free storage locker'],
      description: 'For serious professionals'
    }
  ];
}

function createPremiumMembership(): MembershipOption[] {
  return [
    {
      type: 'daily',
      cost: 50,
      benefits: ['Unlimited access for 24 hours', '10% quality bonus', 'Access to premium facilities'],
      description: 'Premium facilities for discerning crafters'
    },
    {
      type: 'weekly',
      cost: 250,
      benefits: ['Unlimited access for 7 days', '15% quality bonus', 'Priority equipment use', 'Trainer discount'],
      description: 'Professional grade access'
    },
    {
      type: 'monthly',
      cost: 800,
      benefits: ['Unlimited access for 30 days', '20% quality bonus', 'Private workspace', 'Free repairs', 'Recipe research assistance'],
      description: 'Master crafter membership'
    }
  ];
}

// ============================================================================
// RED GULCH WORKSHOPS (Starter Town - Basic to Medium Quality)
// ============================================================================

export const HANKS_FORGE: WorkshopBuilding = {
  id: 'workshop_hanks_forge',
  name: "Hank's Forge",
  workshopType: 'smithy',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.BLACKSMITHING,
  description: "A humble but well-maintained smithy on Red Gulch's main street. The rhythmic clang of hammer on anvil echoes from dawn to dusk.",
  atmosphere: "The forge's heat fills the cramped workspace. Tools hang neatly on the walls, and the scent of hot metal and coal smoke permeates everything. Hank's no-nonsense approach to smithing is evident in every worn floorboard.",
  facilities: [
    {
      type: CraftingFacilityType.FORGE,
      tier: 2,
      condition: 85,
      bonuses: [
        {
          type: 'speed',
          value: 5,
          description: 'Well-maintained forge runs hot and steady'
        }
      ],
      description: 'A reliable coal-fired forge, kept at optimal temperature'
    },
    {
      type: CraftingFacilityType.ANVIL,
      tier: 2,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 5,
          description: 'Solid anvil with good rebound'
        }
      ],
      description: 'Heavy iron anvil, surface worn smooth from years of use'
    },
    {
      type: CraftingFacilityType.QUENCH_TANK,
      tier: 2,
      condition: 80,
      bonuses: [
        {
          type: 'quality',
          value: 10,
          description: 'Clean water produces proper tempering'
        }
      ],
      description: 'Deep quenching tank with fresh water changed daily'
    }
  ],
  npcs: ['npc_hank_ironside', 'npc_jimmy_apprentice'],
  operatingHours: {
    open: 6,
    close: 20,
    description: 'Dawn to dusk, six days a week (closed Sundays)'
  },
  rentalCost: 5,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 3,
  features: [
    'Beginner-friendly environment',
    'Free basic tool use',
    'Discounted metal ore from Hank',
    'Training available for novices'
  ],
  tier: 2,
  ownerNPC: 'npc_hank_ironside',
  specialRules: []
};

export const RED_GULCH_TANNERY: WorkshopBuilding = {
  id: 'workshop_red_gulch_tannery',
  name: 'Red Gulch Tannery',
  workshopType: 'tannery',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.LEATHERWORKING,
  description: "Located on the edge of town to spare residents the smell, this tannery processes hides from the surrounding ranches.",
  atmosphere: "The sharp tang of tanning agents fills the air. Racks of drying leather line the walls, ranging from rough cowhide to supple deerskin. The constant scraping and stretching sounds are oddly rhythmic.",
  facilities: [
    {
      type: CraftingFacilityType.TANNING_RACK,
      tier: 2,
      condition: 75,
      bonuses: [
        {
          type: 'speed',
          value: 10,
          description: 'Multiple racks allow parallel processing'
        }
      ],
      description: 'Six wooden tanning racks for hide processing'
    },
    {
      type: CraftingFacilityType.LEATHER_WORKBENCH,
      tier: 2,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 5,
          description: 'Sturdy bench with good lighting'
        }
      ],
      description: 'Large workbench with complete tool set'
    },
    {
      type: CraftingFacilityType.DYE_VAT,
      tier: 1,
      condition: 70,
      bonuses: [],
      description: 'Basic dye vat - limited color selection'
    }
  ],
  npcs: ['npc_sarah_tanner', 'npc_old_pete'],
  operatingHours: {
    open: 7,
    close: 18,
    description: 'Early morning to evening'
  },
  rentalCost: 4,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 2,
  features: [
    'Hide storage available',
    'Tanning agent included in rental',
    'Bulk hide processing discount',
    'Will buy finished leather goods'
  ],
  tier: 2,
  ownerNPC: 'npc_sarah_tanner'
};

export const DOCS_APOTHECARY: WorkshopBuilding = {
  id: 'workshop_docs_apothecary',
  name: "Doc's Apothecary",
  workshopType: 'apothecary',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.ALCHEMY,
  description: "Doc Holliday's medical practice doubles as an apothecary. The back room is available for serious alchemists to practice their craft.",
  atmosphere: "Glass bottles and jars line floor-to-ceiling shelves. The mingled scent of herbs, alcohol, and chemicals creates a unique perfume. Doc's medical books and journals are scattered about, free to consult.",
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 2,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 10,
          description: 'Medical-grade distillation equipment'
        }
      ],
      description: 'Copper still designed for medicinal tinctures'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 2,
      condition: 85,
      bonuses: [
        {
          type: 'speed',
          value: 5,
          description: 'Precise temperature control'
        }
      ],
      description: 'Iron cauldron with adjustable flame'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 2,
      condition: 95,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Extensive herb library for research'
        }
      ],
      description: 'Climate-controlled storage for reagents and herbs'
    }
  ],
  npcs: ['npc_doc_holliday', 'npc_nurse_maria'],
  operatingHours: {
    open: 8,
    close: 22,
    description: 'Long hours to serve the community'
  },
  accessRequirements: [
    {
      type: 'level',
      value: 5,
      description: 'Doc only allows trained alchemists to use his equipment'
    }
  ],
  rentalCost: 6,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 2,
  features: [
    'Medical library access',
    'Rare herb identification service',
    'Emergency antidote crafting',
    'Doc will test potions for safety'
  ],
  tier: 2,
  ownerNPC: 'npc_doc_holliday'
};

export const DUSTY_SALOON_KITCHEN: WorkshopBuilding = {
  id: 'workshop_dusty_saloon',
  name: "Dusty's Saloon Kitchen",
  workshopType: 'kitchen',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.COOKING,
  description: "The kitchen behind Red Gulch's most popular saloon. Dusty lets skilled cooks use it during off-hours for a small fee.",
  atmosphere: "Cast iron stoves radiate heat. Pots and pans hang from ceiling hooks. The smell of yesterday's stew mingles with fresh bread. It's cramped but well-equipped for frontier cooking.",
  facilities: [
    {
      type: CraftingFacilityType.STOVE,
      tier: 2,
      condition: 80,
      bonuses: [
        {
          type: 'speed',
          value: 10,
          description: 'Large commercial stove with multiple burners'
        }
      ],
      description: 'Six-burner cast iron stove, wood-fired'
    },
    {
      type: CraftingFacilityType.SMOKER,
      tier: 2,
      condition: 75,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Specialized smoking for preserved meats'
        }
      ],
      description: 'Oak-fired smoker out back'
    },
    {
      type: CraftingFacilityType.ICE_BOX,
      tier: 2,
      condition: 85,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Keeps ingredients fresh longer'
        }
      ],
      description: 'Ice delivered weekly from the mountains'
    }
  ],
  npcs: ['npc_dusty_barkeep', 'npc_consuela_cook'],
  operatingHours: {
    open: 5,
    close: 11,
    description: 'Early morning only (saloon uses it afternoon/evening)'
  },
  rentalCost: 3,
  membershipAvailable: false,
  capacity: 2,
  features: [
    'Access to saloon pantry (pay for ingredients)',
    'Can sell prepared meals to Dusty',
    'Free coffee while cooking',
    'Recipe swap board'
  ],
  tier: 2,
  ownerNPC: 'npc_dusty_barkeep'
};

export const GENERAL_STORE_TAILORING: WorkshopBuilding = {
  id: 'workshop_general_store_tailoring',
  name: 'General Store - Tailoring Corner',
  workshopType: 'tailor_shop',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.TAILORING,
  description: "A small tailoring section in the back of the general store. Basic equipment for mending and simple garment construction.",
  atmosphere: "Bolts of fabric line the walls in practical browns and grays. A single sewing table sits by the window for natural light. It's cramped but serviceable for basic work.",
  facilities: [
    {
      type: CraftingFacilityType.SEWING_TABLE,
      tier: 1,
      condition: 70,
      bonuses: [],
      description: 'Simple wooden sewing table with basic tools'
    },
    {
      type: CraftingFacilityType.MANNEQUIN,
      tier: 1,
      condition: 80,
      bonuses: [
        {
          type: 'quality',
          value: 3,
          description: 'Helpful for fitting'
        }
      ],
      description: 'Adjustable dress form'
    }
  ],
  npcs: ['npc_mrs_patterson', 'npc_emily_seamstress'],
  operatingHours: {
    open: 9,
    close: 18,
    description: 'Store hours'
  },
  rentalCost: 2,
  membershipAvailable: false,
  capacity: 1,
  features: [
    'Buy fabric at store prices',
    'Pattern library available',
    'Free thread with rental',
    'Mending and alteration tips'
  ],
  tier: 1,
  ownerNPC: 'npc_mrs_patterson'
};

export const RED_GULCH_ARMORY: WorkshopBuilding = {
  id: 'workshop_red_gulch_armory',
  name: 'Red Gulch Armory',
  workshopType: 'gunsmith',
  locationId: GameLocation.RED_GULCH,
  locationName: LOCATION_NAMES[GameLocation.RED_GULCH],
  professionSupported: ProfessionId.GUNSMITHING,
  description: "The town gunsmith maintains a small workshop for repairs and ammunition crafting. Clean, orderly, and strictly supervised.",
  atmosphere: "Gun oil and powder smoke scent the air. Rifles and pistols line locked cabinets. The workbench is immaculate - the owner tolerates no sloppiness around firearms.",
  facilities: [
    {
      type: CraftingFacilityType.GUN_LATHE,
      tier: 2,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 10,
          description: 'Precision tooling for gun work'
        }
      ],
      description: 'Precision lathe for gun modifications'
    },
    {
      type: CraftingFacilityType.POWDER_PRESS,
      tier: 2,
      condition: 85,
      bonuses: [
        {
          type: 'speed',
          value: 10,
          description: 'Efficient ammunition production'
        }
      ],
      description: 'Safe powder measuring and bullet press'
    },
    {
      type: CraftingFacilityType.TEST_RANGE,
      tier: 1,
      condition: 75,
      bonuses: [
        {
          type: 'quality',
          value: 5,
          description: 'Small range for basic testing'
        }
      ],
      description: 'Twenty-yard indoor test range'
    }
  ],
  npcs: ['npc_gunsmith_cole', 'npc_deputy_jackson'],
  operatingHours: {
    open: 8,
    close: 18,
    description: 'Standard business hours'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 100,
      description: 'Must be known to the community (no strangers)'
    }
  ],
  rentalCost: 7,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 2,
  features: [
    'Safety instruction included',
    'Gun cleaning and maintenance',
    'Ammunition testing services',
    'Will buy quality firearms'
  ],
  tier: 2,
  ownerNPC: 'npc_gunsmith_cole',
  specialRules: [
    'No modifications to stolen weapons',
    'Sheriff may inspect work',
    'Explosive compounds require approval'
  ]
};

// ============================================================================
// THE FRONTERA WORKSHOPS (Lawless - High Tier, No Questions Asked)
// ============================================================================

export const EL_HERRERO: WorkshopBuilding = {
  id: 'workshop_el_herrero',
  name: 'El Herrero',
  workshopType: 'smithy',
  locationId: GameLocation.THE_FRONTERA,
  locationName: LOCATION_NAMES[GameLocation.THE_FRONTERA],
  professionSupported: ProfessionId.BLACKSMITHING,
  description: "A sweltering forge in the lawless border town. The smith asks no questions and expects none in return. His work speaks for itself.",
  atmosphere: "Three forges burn day and night. The heat is oppressive. Armed guards watch the entrance. This is where outlaws get their weapons forged and no law crosses the threshold.",
  facilities: [
    {
      type: CraftingFacilityType.FORGE,
      tier: 4,
      condition: 95,
      bonuses: [
        {
          type: 'speed',
          value: 20,
          description: 'Multiple high-temperature forges'
        },
        {
          type: 'quality',
          value: 15,
          description: 'Exceptional heat control'
        }
      ],
      description: 'Three separate forges for simultaneous projects'
    },
    {
      type: CraftingFacilityType.ANVIL,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Master-grade anvil imported from Europe'
        }
      ],
      description: 'Massive German anvil, perfectly balanced'
    },
    {
      type: CraftingFacilityType.QUENCH_TANK,
      tier: 4,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Oil and water quenching options'
        },
        {
          type: 'special',
          value: 0,
          description: 'Secret quenching techniques available'
        }
      ],
      description: 'Multiple quenching tanks with various media'
    }
  ],
  npcs: ['npc_rodrigo_herrero', 'npc_silent_miguel'],
  operatingHours: {
    open: 0,
    close: 23,
    alwaysOpen: true,
    description: '24/7 operation'
  },
  rentalCost: 25,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 5,
  features: [
    'Absolute discretion guaranteed',
    'Rare metals available for purchase',
    'Master smith consultation',
    'Private workspace available',
    'Weapons testing range',
    'Acid etching and engraving services'
  ],
  tier: 4,
  ownerNPC: 'npc_rodrigo_herrero',
  specialRules: [
    'No questions asked about projects',
    'Cash only - no credit',
    'What happens at El Herrero stays at El Herrero',
    'Armed guards enforce privacy'
  ]
};

export const POISON_KITCHEN: WorkshopBuilding = {
  id: 'workshop_poison_kitchen',
  name: 'The Poison Kitchen',
  workshopType: 'apothecary',
  locationId: GameLocation.THE_FRONTERA,
  locationName: LOCATION_NAMES[GameLocation.THE_FRONTERA],
  professionSupported: ProfessionId.ALCHEMY,
  description: "A dark apothecary hidden in the Frontera's back alleys. Here, alchemists create substances that would be illegal anywhere else.",
  atmosphere: "Dim lanterns cast dancing shadows on walls lined with mysterious bottles. Strange vapors swirl in sealed containers. The owner, a gaunt figure, watches from the shadows with knowing eyes.",
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 4,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Alchemical-grade distillation'
        },
        {
          type: 'special',
          value: 0,
          description: 'Can process toxic materials safely'
        }
      ],
      description: 'Advanced distillation setup with fume hoods'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 4,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Precise temperature and timing'
        },
        {
          type: 'special',
          value: 0,
          description: 'Unlocks restricted recipes'
        }
      ],
      description: 'Multiple cauldrons for dangerous concoctions'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 4,
      condition: 95,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Rare and illegal reagents available'
        }
      ],
      description: 'Climate-controlled vaults for volatile substances'
    }
  ],
  npcs: ['npc_widow_blackwood', 'npc_silent_servant'],
  operatingHours: {
    open: 18,
    close: 6,
    description: 'Night hours only (closed during day)'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: -200,
      description: 'Must have criminal reputation'
    },
    {
      type: 'faction',
      value: 'frontera',
      description: 'Must be known to Frontera networks'
    }
  ],
  rentalCost: 30,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 3,
  features: [
    'Poison and paralytic recipes',
    'Hallucinogenic concoctions',
    'Explosives crafting',
    'Antidote creation',
    'Forbidden knowledge library',
    'Ingredient acquisition service (no questions)'
  ],
  tier: 4,
  ownerNPC: 'npc_widow_blackwood',
  specialRules: [
    'Complete discretion required',
    'Law enforcement forbidden',
    'Failed experiments are your problem',
    'Widow Blackwood watches everything'
  ]
};

export const BLACK_MARKET_GUNS: WorkshopBuilding = {
  id: 'workshop_black_market_guns',
  name: 'Black Market Gunsmithing',
  workshopType: 'gunsmith',
  locationId: GameLocation.THE_FRONTERA,
  locationName: LOCATION_NAMES[GameLocation.THE_FRONTERA],
  professionSupported: ProfessionId.GUNSMITHING,
  description: "An underground gunsmithing operation where illegal modifications and experimental weapons are crafted. Entry by introduction only.",
  atmosphere: "Hidden beneath a cantina, this workshop hums with activity. Unmarked crates line the walls. The work here pushes the boundaries of what firearms can do - consequences be damned.",
  facilities: [
    {
      type: CraftingFacilityType.GUN_LATHE,
      tier: 4,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Precision modifications'
        },
        {
          type: 'special',
          value: 0,
          description: 'Illegal modification knowledge'
        }
      ],
      description: 'Top-tier precision equipment for custom work'
    },
    {
      type: CraftingFacilityType.POWDER_PRESS,
      tier: 4,
      condition: 90,
      bonuses: [
        {
          type: 'speed',
          value: 25,
          description: 'Mass ammunition production'
        },
        {
          type: 'special',
          value: 0,
          description: 'Explosive and incendiary rounds'
        }
      ],
      description: 'Industrial-grade powder and ammunition press'
    },
    {
      type: CraftingFacilityType.TEST_RANGE,
      tier: 4,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Comprehensive testing facility'
        }
      ],
      description: 'Underground 100-yard range with armor-plated walls'
    }
  ],
  npcs: ['npc_one_eyed_jack', 'npc_the_tinkerer'],
  operatingHours: {
    open: 0,
    close: 23,
    alwaysOpen: true,
    description: '24/7 by appointment'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: -300,
      description: 'Must be vouched for by current member'
    }
  ],
  rentalCost: 40,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 4,
  features: [
    'Illegal firearm modifications',
    'Explosive ammunition crafting',
    'Serial number removal/modification',
    'Experimental weapon prototyping',
    'Stolen gun parts marketplace',
    'Smuggling connections for rare components'
  ],
  tier: 4,
  ownerNPC: 'npc_one_eyed_jack',
  specialRules: [
    'Entry by introduction only',
    'Membership can be revoked permanently',
    'Failed experiments may attract law attention',
    'No law enforcement tolerated - ever'
  ]
};

// ============================================================================
// FORT ASHFORD WORKSHOPS (Military - Highest Tier, Restricted Access)
// ============================================================================

export const ARMY_FORGE: WorkshopBuilding = {
  id: 'workshop_army_forge',
  name: 'Fort Ashford Army Forge',
  workshopType: 'smithy',
  locationId: GameLocation.FORT_ASHFORD,
  locationName: LOCATION_NAMES[GameLocation.FORT_ASHFORD],
  professionSupported: ProfessionId.BLACKSMITHING,
  description: "The military smithy at Fort Ashford. State-of-the-art equipment used to maintain the cavalry's weapons and equipment.",
  atmosphere: "Regimented and efficient. Every tool has its place. The constant sound of steel being worked mingles with barked orders from the parade ground. Military precision in every aspect.",
  facilities: [
    {
      type: CraftingFacilityType.FORGE,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'speed',
          value: 25,
          description: 'Military-grade coal forge'
        },
        {
          type: 'quality',
          value: 20,
          description: 'Optimal forge temperature control'
        }
      ],
      description: 'Two military-grade forges, maintained daily'
    },
    {
      type: CraftingFacilityType.ANVIL,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Military specification anvil'
        }
      ],
      description: 'Army-issue anvil, perfectly maintained'
    },
    {
      type: CraftingFacilityType.QUENCH_TANK,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Military tempering standards'
        }
      ],
      description: 'Regulated quenching system for consistent results'
    }
  ],
  npcs: ['npc_sergeant_mcallister', 'npc_corporal_hughes'],
  operatingHours: {
    open: 5,
    close: 22,
    description: 'Military hours (reveille to taps)'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 500,
      description: 'Must have excellent standing with military'
    },
    {
      type: 'faction',
      value: 'settler',
      description: 'Settler Alliance members only'
    }
  ],
  rentalCost: 15,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 4,
  features: [
    'Military-grade materials available',
    'Expert training from army smiths',
    'Quality inspection services',
    'Bulk discounts on metal',
    'Access to military patterns'
  ],
  tier: 4,
  ownerNPC: 'npc_sergeant_mcallister',
  specialRules: [
    'Military personnel have priority',
    'No weapons for known criminals',
    'Random security inspections',
    'Must maintain clean workspace'
  ]
};

export const QUARTERMASTER_TAILORING: WorkshopBuilding = {
  id: 'workshop_quartermaster_tailoring',
  name: 'Quartermaster Tailoring Shop',
  workshopType: 'tailor_shop',
  locationId: GameLocation.FORT_ASHFORD,
  locationName: LOCATION_NAMES[GameLocation.FORT_ASHFORD],
  professionSupported: ProfessionId.TAILORING,
  description: "The fort's tailoring facility where uniforms are made and repaired. Precise, military-standard craftsmanship required.",
  atmosphere: "Rows of uniforms hang in perfect alignment. The quartermaster runs a tight ship - every stitch must be regulation. But the equipment is first-rate and the work teaches discipline.",
  facilities: [
    {
      type: CraftingFacilityType.SEWING_TABLE,
      tier: 3,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Professional sewing equipment'
        }
      ],
      description: 'Three industrial sewing stations'
    },
    {
      type: CraftingFacilityType.MANNEQUIN,
      tier: 3,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 10,
          description: 'Standardized fitting forms'
        }
      ],
      description: 'Military uniform fitting forms'
    },
    {
      type: CraftingFacilityType.LOOM,
      tier: 3,
      condition: 85,
      bonuses: [
        {
          type: 'speed',
          value: 15,
          description: 'Weaving your own fabric'
        }
      ],
      description: 'Small loom for specialty fabric work'
    }
  ],
  npcs: ['npc_quartermaster_jenkins', 'npc_seamstress_molly'],
  operatingHours: {
    open: 7,
    close: 19,
    description: 'Standard military working hours'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 300,
      description: 'Trusted by fort command'
    }
  ],
  rentalCost: 8,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 3,
  features: [
    'Military uniform patterns',
    'Bulk fabric at cost',
    'Quality control inspection',
    'Repair contracts available'
  ],
  tier: 3,
  ownerNPC: 'npc_quartermaster_jenkins',
  specialRules: [
    'Military work takes priority',
    'Must meet quality standards',
    'No unapproved designs'
  ]
};

export const FORT_ARMORY_WORKSHOP: WorkshopBuilding = {
  id: 'workshop_fort_armory',
  name: 'Fort Ashford Armory',
  workshopType: 'gunsmith',
  locationId: GameLocation.FORT_ASHFORD,
  locationName: LOCATION_NAMES[GameLocation.FORT_ASHFORD],
  professionSupported: ProfessionId.GUNSMITHING,
  description: "The finest gunsmithing facility in the territory. Army gunsmiths maintain cavalry carbines, artillery, and experimental weapons here.",
  atmosphere: "The pinnacle of frontier gunsmithing. Every tool is top-quality. The test range echoes with constant firing. This is where master gunsmiths work on cutting-edge military firearms.",
  facilities: [
    {
      type: CraftingFacilityType.GUN_LATHE,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 30,
          description: 'Best gunsmithing equipment in the West'
        },
        {
          type: 'speed',
          value: 20,
          description: 'Precision work proceeds quickly'
        }
      ],
      description: 'State-of-the-art precision lathe from back East'
    },
    {
      type: CraftingFacilityType.POWDER_PRESS,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 25,
          description: 'Military-grade ammunition production'
        },
        {
          type: 'material_savings',
          value: 15,
          description: 'Efficient powder measurement'
        }
      ],
      description: 'Army specification ammunition press'
    },
    {
      type: CraftingFacilityType.TEST_RANGE,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 30,
          description: 'Comprehensive testing protocols'
        },
        {
          type: 'special',
          value: 0,
          description: 'Ballistics analysis equipment'
        }
      ],
      description: '300-yard test range with chronograph and target analysis'
    }
  ],
  npcs: ['npc_master_gunsmith_wyatt', 'npc_lieutenant_firearms'],
  operatingHours: {
    open: 6,
    close: 21,
    description: 'Extended military hours'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 750,
      description: 'Exceptional military standing required'
    },
    {
      type: 'level',
      value: 30,
      description: 'Master-level gunsmithing skill'
    }
  ],
  rentalCost: 20,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 3,
  features: [
    'Access to experimental designs',
    'Military ammunition contracts',
    'Expert consultation',
    'Precision testing equipment',
    'Government purchasing program',
    'Advanced modification techniques'
  ],
  tier: 5,
  ownerNPC: 'npc_master_gunsmith_wyatt',
  specialRules: [
    'Security clearance required',
    'All work subject to inspection',
    'Experimental work requires approval',
    'No unauthorized modifications'
  ]
};

// ============================================================================
// WHISKEY BEND WORKSHOPS (Entertainment Town - Style Over Substance)
// ============================================================================

export const GILDED_NEEDLE: WorkshopBuilding = {
  id: 'workshop_gilded_needle',
  name: 'The Gilded Needle',
  workshopType: 'tailor_shop',
  locationId: GameLocation.WHISKEY_BEND,
  locationName: LOCATION_NAMES[GameLocation.WHISKEY_BEND],
  professionSupported: ProfessionId.TAILORING,
  description: "Whiskey Bend's premier fashion boutique. Where the wealthy and famous have their finery crafted. Style is everything here.",
  atmosphere: "Elegant and refined. Silk curtains, plush carpets, and walls adorned with fashion plates from Paris and New York. This is where frontier meets high society.",
  facilities: [
    {
      type: CraftingFacilityType.SEWING_TABLE,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 25,
          description: 'Finest tailoring equipment available'
        },
        {
          type: 'special',
          value: 0,
          description: 'Unlocks high-fashion designs'
        }
      ],
      description: 'Four premium sewing stations with the best tools'
    },
    {
      type: CraftingFacilityType.MANNEQUIN,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Perfect fitting results'
        }
      ],
      description: 'Adjustable mannequins for any body type'
    },
    {
      type: CraftingFacilityType.LOOM,
      tier: 4,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Custom fabric weaving'
        }
      ],
      description: 'Large loom for bespoke fabrics'
    }
  ],
  npcs: ['npc_madame_dubois', 'npc_seamstress_vivian'],
  operatingHours: {
    open: 10,
    close: 20,
    description: 'Fashionable hours (no early mornings)'
  },
  rentalCost: 20,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 4,
  features: [
    'Access to luxury fabrics',
    'Fashion consultation services',
    'Celebrity client connections',
    'Custom dye services',
    'Embroidery and embellishment',
    'Fashion show opportunities'
  ],
  tier: 4,
  ownerNPC: 'npc_madame_dubois',
  specialRules: [
    'Dress code enforced',
    'Quality standards must be met',
    'Reputation depends on your work'
  ]
};

export const MADAME_WU_REMEDIES: WorkshopBuilding = {
  id: 'workshop_madame_wu',
  name: "Madame Wu's Exotic Remedies",
  workshopType: 'apothecary',
  locationId: GameLocation.WHISKEY_BEND,
  locationName: LOCATION_NAMES[GameLocation.WHISKEY_BEND],
  professionSupported: ProfessionId.ALCHEMY,
  description: "An apothecary specializing in exotic Eastern medicines and mysterious concoctions. Madame Wu's knowledge spans continents.",
  atmosphere: "Incense smoke curls through the air. Strange herbs hang from the ceiling. Oriental medicine meets Western alchemy in this fascinating shop that caters to Whiskey Bend's exotic tastes.",
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 3,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Traditional distillation methods'
        },
        {
          type: 'special',
          value: 0,
          description: 'Access to Eastern recipes'
        }
      ],
      description: 'Copper and bamboo distillation equipment'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 3,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Precise temperature control'
        }
      ],
      description: 'Traditional medicinal preparation cauldron'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 3,
      condition: 100,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Extensive exotic ingredient library'
        }
      ],
      description: 'Climate-controlled storage with rare Eastern herbs'
    }
  ],
  npcs: ['npc_madame_wu', 'npc_assistant_mei'],
  operatingHours: {
    open: 9,
    close: 21,
    description: 'Extended hours for clientele'
  },
  rentalCost: 12,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 2,
  features: [
    'Rare Eastern ingredients',
    'Traditional medicine knowledge',
    'Exotic recipe library',
    'Custom fragrance creation',
    'Performance enhancers for entertainers'
  ],
  tier: 3,
  ownerNPC: 'npc_madame_wu',
  specialRules: [
    'Respect for traditional methods required',
    'Some recipes require special permission'
  ]
};

export const GRAND_HOTEL_KITCHEN: WorkshopBuilding = {
  id: 'workshop_grand_hotel',
  name: 'The Grand Hotel Kitchen',
  workshopType: 'kitchen',
  locationId: GameLocation.WHISKEY_BEND,
  locationName: LOCATION_NAMES[GameLocation.WHISKEY_BEND],
  professionSupported: ProfessionId.COOKING,
  description: "The finest kitchen in the territory. Where gourmet meals worthy of San Francisco or New York are prepared daily.",
  atmosphere: "Gleaming copper pots hang above marble counters. A French-trained chef oversees operations. This kitchen could hold its own in any major city back East.",
  facilities: [
    {
      type: CraftingFacilityType.STOVE,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 25,
          description: 'Professional-grade range'
        },
        {
          type: 'speed',
          value: 20,
          description: 'Multiple cooking stations'
        }
      ],
      description: 'Eight-burner restaurant range with dual ovens'
    },
    {
      type: CraftingFacilityType.SMOKER,
      tier: 3,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Apple and cherry wood smoking'
        }
      ],
      description: 'Professional smoker for fine meats'
    },
    {
      type: CraftingFacilityType.ICE_BOX,
      tier: 4,
      condition: 100,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Keeps ingredients at peak freshness'
        }
      ],
      description: 'Large walk-in ice room, stocked daily'
    }
  ],
  npcs: ['npc_chef_beaumont', 'npc_sous_chef_antonio'],
  operatingHours: {
    open: 4,
    close: 14,
    description: 'Early morning prep hours only (hotel uses afternoon/evening)'
  },
  accessRequirements: [
    {
      type: 'level',
      value: 25,
      description: 'Expert-level cooking skill required'
    }
  ],
  rentalCost: 25,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 3,
  features: [
    'Gourmet ingredient sourcing',
    'French cooking techniques',
    'Wine pairing advice',
    'Presentation training',
    'Catering opportunities for wealthy clients'
  ],
  tier: 4,
  ownerNPC: 'npc_chef_beaumont',
  specialRules: [
    'Impeccable cleanliness required',
    'Must demonstrate skill before access',
    "Chef Beaumont's approval needed"
  ]
};

// ============================================================================
// KAIOWA MESA WORKSHOPS (Coalition Sacred Site - Traditional Methods)
// ============================================================================

export const SACRED_TANNING_GROUNDS: WorkshopBuilding = {
  id: 'workshop_sacred_tanning',
  name: 'Sacred Tanning Grounds',
  workshopType: 'tannery',
  locationId: GameLocation.KAIOWA_MESA,
  locationName: LOCATION_NAMES[GameLocation.KAIOWA_MESA],
  professionSupported: ProfessionId.LEATHERWORKING,
  description: "Traditional leather working using methods passed down through generations. Every hide is honored, every piece has meaning.",
  atmosphere: "Open-air racks stretch across the mesa. The elders teach traditional techniques with patience. Here, leatherworking is ceremony as much as craft. The buffalo gives its hide; you give it purpose.",
  facilities: [
    {
      type: CraftingFacilityType.TANNING_RACK,
      tier: 4,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 25,
          description: 'Traditional brain-tanning methods'
        },
        {
          type: 'special',
          value: 0,
          description: 'Spiritual blessing enhances durability'
        }
      ],
      description: 'Traditional wooden racks blessed by tribal elders'
    },
    {
      type: CraftingFacilityType.LEATHER_WORKBENCH,
      tier: 4,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Hand tools of exceptional quality'
        }
      ],
      description: 'Stone and bone tools alongside modern implements'
    },
    {
      type: CraftingFacilityType.DYE_VAT,
      tier: 4,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Natural dyes from sacred plants'
        },
        {
          type: 'special',
          value: 0,
          description: 'Unique colors unavailable elsewhere'
        }
      ],
      description: 'Natural dye vats using traditional plant extracts'
    }
  ],
  npcs: ['npc_elder_standing_bear', 'npc_gray_dove'],
  operatingHours: {
    open: 6,
    close: 19,
    description: 'Sunrise to sunset'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 500,
      description: 'Must be honored by the Coalition'
    },
    {
      type: 'quest',
      value: 'prove_respect_to_elders',
      description: 'Must complete ritual quest'
    }
  ],
  rentalCost: 0,
  membershipAvailable: false,
  capacity: 3,
  features: [
    'Traditional technique training',
    'Spiritual crafting rituals',
    'Buffalo hide processing',
    'Blessing ceremonies',
    'Natural dye knowledge',
    'Tools crafted from bone and stone'
  ],
  tier: 4,
  ownerNPC: 'npc_elder_standing_bear',
  specialRules: [
    'Barter only - no gold accepted',
    'Must show respect for materials and traditions',
    'Participate in blessing ceremonies',
    'No wasteful practices tolerated',
    'Share knowledge freely with others'
  ]
};

export const MEDICINE_LODGE: WorkshopBuilding = {
  id: 'workshop_medicine_lodge',
  name: 'Medicine Lodge',
  workshopType: 'apothecary',
  locationId: GameLocation.KAIOWA_MESA,
  locationName: LOCATION_NAMES[GameLocation.KAIOWA_MESA],
  professionSupported: ProfessionId.ALCHEMY,
  description: "Where medicine women and men prepare traditional healing remedies. Ancient knowledge meets the healing power of the land.",
  atmosphere: "Smoke from sacred herbs fills the air. Dried plants hang from every beam. The medicine keeper speaks in quiet tones about plants, spirits, and healing. This is where alchemy becomes medicine.",
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 3,
      condition: 80,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Traditional extraction methods'
        }
      ],
      description: 'Clay pots and copper stills for traditional remedies'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 3,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Ceremonial preparation enhances potency'
        },
        {
          type: 'special',
          value: 0,
          description: 'Spiritual healing properties'
        }
      ],
      description: 'Sacred cauldron used in healing ceremonies'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 3,
      condition: 90,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Access to sacred healing plants'
        }
      ],
      description: 'Dried herbs and roots from across Coalition lands'
    }
  ],
  npcs: ['npc_medicine_woman_white_cloud', 'npc_apprentice_two_hawks'],
  operatingHours: {
    open: 5,
    close: 21,
    description: 'Early dawn to night (healing knows no schedule)'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 300,
      description: 'Trusted by Coalition people'
    }
  ],
  rentalCost: 0,
  membershipAvailable: false,
  capacity: 2,
  features: [
    'Traditional healing recipes',
    'Sacred plant knowledge',
    'Spiritual consultation',
    'Vision quest preparation',
    'Ceremonial crafting',
    'Teaching of old ways'
  ],
  tier: 3,
  ownerNPC: 'npc_medicine_woman_white_cloud',
  specialRules: [
    'Barter only - trade for services or goods',
    'Must participate in prayer and ceremony',
    'Healing knowledge must be used responsibly',
    'Share knowledge with those in need'
  ]
};

// ============================================================================
// SPIRIT SPRINGS WORKSHOPS (Coalition Healing Site)
// ============================================================================

export const HEALING_WATERS_APOTHECARY: WorkshopBuilding = {
  id: 'workshop_healing_waters',
  name: 'Healing Waters Apothecary',
  workshopType: 'apothecary',
  locationId: GameLocation.SPIRIT_SPRINGS,
  locationName: LOCATION_NAMES[GameLocation.SPIRIT_SPRINGS],
  professionSupported: ProfessionId.ALCHEMY,
  description: "Built around the sacred springs, this is the finest healing facility in the territory. The waters themselves are said to bless all remedies created here.",
  atmosphere: "Steam from the hot springs mingles with herbal vapors. The sound of running water is constant. Here, the boundary between natural and supernatural healing blurs beautifully.",
  facilities: [
    {
      type: CraftingFacilityType.DISTILLERY,
      tier: 5,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 30,
          description: 'Sacred spring water enhances all potions'
        },
        {
          type: 'special',
          value: 0,
          description: 'Legendary healing potion recipes'
        }
      ],
      description: 'Crystal-clear distillation using blessed spring water'
    },
    {
      type: CraftingFacilityType.CAULDRON,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 35,
          description: 'Waters from the sacred spring'
        },
        {
          type: 'special',
          value: 0,
          description: 'Supernatural healing properties'
        }
      ],
      description: 'Ancient cauldron positioned over the main spring'
    },
    {
      type: CraftingFacilityType.STORAGE_RACKS,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Complete library of healing knowledge'
        }
      ],
      description: 'Temperature-controlled vaults with centuries of accumulated herbs'
    }
  ],
  npcs: ['npc_grandmother_eagle_song', 'npc_healer_running_stream'],
  operatingHours: {
    open: 0,
    close: 23,
    alwaysOpen: true,
    description: 'Always open - healing never sleeps'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 750,
      description: 'Must be greatly honored by Coalition'
    },
    {
      type: 'quest',
      value: 'pilgrimage_to_spirit_springs',
      description: 'Must complete sacred pilgrimage'
    }
  ],
  rentalCost: 0,
  membershipAvailable: false,
  capacity: 4,
  features: [
    'Legendary healing potion recipes',
    'Spring water blessed by spirits',
    'Ancient healing knowledge',
    'Supernatural remedy crafting',
    'Cure for any ailment (with right ingredients)',
    'Training from legendary healers'
  ],
  tier: 5,
  ownerNPC: 'npc_grandmother_eagle_song',
  specialRules: [
    'No payment - contribute what you can',
    'Healing knowledge must help others',
    'Participate in spring blessing ceremonies',
    'Respect the sacred waters',
    'Share discoveries for benefit of all'
  ]
};

// ============================================================================
// LONGHORN RANCH WORKSHOPS (Cattle Ranch)
// ============================================================================

export const RANCH_TANNERY: WorkshopBuilding = {
  id: 'workshop_ranch_tannery',
  name: 'Longhorn Ranch Tannery',
  workshopType: 'tannery',
  locationId: GameLocation.LONGHORN_RANCH,
  locationName: LOCATION_NAMES[GameLocation.LONGHORN_RANCH],
  professionSupported: ProfessionId.LEATHERWORKING,
  description: "The finest leather working facility in the West. With thousands of cattle, the ranch produces exceptional hides and the craftsmen to work them.",
  atmosphere: "The smell of leather is overwhelming but not unpleasant. Mountains of hides await processing. Expert tanners from Mexico and back East work side-by-side, producing the finest leather goods in the territory.",
  facilities: [
    {
      type: CraftingFacilityType.TANNING_RACK,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'speed',
          value: 30,
          description: 'Industrial-scale operation'
        },
        {
          type: 'quality',
          value: 25,
          description: 'Expert tanning methods'
        }
      ],
      description: 'Dozens of racks with multiple tanning methods available'
    },
    {
      type: CraftingFacilityType.LEATHER_WORKBENCH,
      tier: 5,
      condition: 100,
      bonuses: [
        {
          type: 'quality',
          value: 30,
          description: 'Master craftsman tools'
        },
        {
          type: 'special',
          value: 0,
          description: 'Can work with any hide type'
        }
      ],
      description: 'Ten workbenches with complete professional tool sets'
    },
    {
      type: CraftingFacilityType.DYE_VAT,
      tier: 5,
      condition: 95,
      bonuses: [
        {
          type: 'quality',
          value: 25,
          description: 'Full color spectrum available'
        },
        {
          type: 'material_savings',
          value: 20,
          description: 'Efficient dye use'
        }
      ],
      description: 'Professional dye works with every color imaginable'
    }
  ],
  npcs: ['npc_master_tanner_cruz', 'npc_hide_buyer_jackson', 'npc_saddle_maker_tom'],
  operatingHours: {
    open: 5,
    close: 20,
    description: 'Rancher hours - early to late'
  },
  rentalCost: 15,
  membershipAvailable: true,
  membershipOptions: createPremiumMembership(),
  capacity: 6,
  features: [
    'Unlimited supply of quality hides',
    'Expert training available',
    'Custom saddle and tack crafting',
    'Bulk hide processing',
    'Will purchase finished goods',
    'Connections to merchants nationwide'
  ],
  tier: 5,
  ownerNPC: 'npc_master_tanner_cruz',
  specialRules: [
    'Ranch hands get discounted rates',
    'Quality work may earn permanent position',
    'No waste - use every part of the hide'
  ]
};

export const CHUCK_WAGON_KITCHEN: WorkshopBuilding = {
  id: 'workshop_chuck_wagon',
  name: 'Chuck Wagon Kitchen',
  workshopType: 'kitchen',
  locationId: GameLocation.LONGHORN_RANCH,
  locationName: LOCATION_NAMES[GameLocation.LONGHORN_RANCH],
  professionSupported: ProfessionId.COOKING,
  description: "Where Cookie feeds fifty hungry cowboys three times a day. Simple, hearty fare cooked in massive quantities. Efficiency is everything.",
  atmosphere: "Two massive stoves work constantly. The smell of beef, beans, and coffee permeates everything. Cookie runs this kitchen like a battlefield - organized chaos that somehow produces meals on time, every time.",
  facilities: [
    {
      type: CraftingFacilityType.STOVE,
      tier: 3,
      condition: 85,
      bonuses: [
        {
          type: 'speed',
          value: 25,
          description: 'Designed for mass cooking'
        }
      ],
      description: 'Two industrial ranch stoves, always hot'
    },
    {
      type: CraftingFacilityType.SMOKER,
      tier: 3,
      condition: 90,
      bonuses: [
        {
          type: 'quality',
          value: 20,
          description: 'Mesquite smoking perfected'
        }
      ],
      description: 'Large mesquite smoker for beef and game'
    },
    {
      type: CraftingFacilityType.ICE_BOX,
      tier: 2,
      condition: 75,
      bonuses: [],
      description: 'Basic cold storage, ice when available'
    }
  ],
  npcs: ['npc_cookie_mccormick', 'npc_dishwasher_timmy'],
  operatingHours: {
    open: 4,
    close: 21,
    description: 'Before dawn to after dark (ranch schedule)'
  },
  rentalCost: 5,
  membershipAvailable: false,
  capacity: 2,
  features: [
    'Beef at cost (ranch supply)',
    'Bulk cooking techniques',
    "Cookie's secret recipes",
    'Feed the crew for pay',
    'Preserving and canning knowledge'
  ],
  tier: 3,
  ownerNPC: 'npc_cookie_mccormick',
  specialRules: [
    'Stay out of the way during meal prep',
    "Don't waste beef - Cookie's one rule",
    'Help with dishes, get free meal'
  ]
};

// ============================================================================
// GOLDFINGER'S MINE WORKSHOPS (Mining Operation)
// ============================================================================

export const MINE_FORGE: WorkshopBuilding = {
  id: 'workshop_mine_forge',
  name: "Goldfinger's Mine Forge",
  workshopType: 'smithy',
  locationId: GameLocation.GOLDFINGER_MINE,
  locationName: LOCATION_NAMES[GameLocation.GOLDFINGER_MINE],
  professionSupported: ProfessionId.BLACKSMITHING,
  description: "The mine's smithy keeps tools sharp and equipment working. Access to raw ore straight from the earth makes this unique.",
  atmosphere: "Utilitarian and functional. This forge exists to keep the mine running, but the smith knows his craft. The constant supply of fresh ore from below makes metallurgy experiments possible.",
  facilities: [
    {
      type: CraftingFacilityType.FORGE,
      tier: 3,
      condition: 80,
      bonuses: [
        {
          type: 'special',
          value: 0,
          description: 'Direct access to raw ore'
        }
      ],
      description: 'Industrial forge for mining equipment'
    },
    {
      type: CraftingFacilityType.ANVIL,
      tier: 3,
      condition: 85,
      bonuses: [
        {
          type: 'quality',
          value: 15,
          description: 'Heavy-duty anvil for tool work'
        }
      ],
      description: 'Large anvil designed for tool and equipment repair'
    },
    {
      type: CraftingFacilityType.QUENCH_TANK,
      tier: 3,
      condition: 75,
      bonuses: [
        {
          type: 'speed',
          value: 10,
          description: 'Quick cooling for production work'
        }
      ],
      description: 'Water tank fed by underground stream'
    }
  ],
  npcs: ['npc_blacksmith_klaus', 'npc_ore_hauler_big_mike'],
  operatingHours: {
    open: 6,
    close: 22,
    description: 'Extended hours to support mine operations'
  },
  accessRequirements: [
    {
      type: 'reputation',
      value: 200,
      description: 'Must be trusted by mining company'
    }
  ],
  rentalCost: 8,
  membershipAvailable: true,
  membershipOptions: createStandardMembership(),
  capacity: 3,
  features: [
    'Raw ore at cost',
    'Ore testing and assaying',
    'Tool sharpening service',
    'Metal experimentation encouraged',
    'Mine equipment contracts available'
  ],
  tier: 3,
  ownerNPC: 'npc_blacksmith_klaus',
  specialRules: [
    'Mine work takes priority',
    'Safety equipment required',
    'Report any promising ore discoveries'
  ]
};

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_WORKSHOPS: WorkshopBuilding[] = [
  // Red Gulch (6 workshops)
  HANKS_FORGE,
  RED_GULCH_TANNERY,
  DOCS_APOTHECARY,
  DUSTY_SALOON_KITCHEN,
  GENERAL_STORE_TAILORING,
  RED_GULCH_ARMORY,

  // The Frontera (3 workshops)
  EL_HERRERO,
  POISON_KITCHEN,
  BLACK_MARKET_GUNS,

  // Fort Ashford (3 workshops)
  ARMY_FORGE,
  QUARTERMASTER_TAILORING,
  FORT_ARMORY_WORKSHOP,

  // Whiskey Bend (3 workshops)
  GILDED_NEEDLE,
  MADAME_WU_REMEDIES,
  GRAND_HOTEL_KITCHEN,

  // Kaiowa Mesa (2 workshops)
  SACRED_TANNING_GROUNDS,
  MEDICINE_LODGE,

  // Spirit Springs (1 workshop)
  HEALING_WATERS_APOTHECARY,

  // Longhorn Ranch (2 workshops)
  RANCH_TANNERY,
  CHUCK_WAGON_KITCHEN,

  // Goldfinger's Mine (1 workshop)
  MINE_FORGE
];

/**
 * Get workshop by ID
 */
export function getWorkshop(id: string): WorkshopBuilding | undefined {
  return ALL_WORKSHOPS.find(w => w.id === id);
}

/**
 * Get workshops by location
 */
export function getWorkshopsByLocation(locationId: GameLocation): WorkshopBuilding[] {
  return ALL_WORKSHOPS.filter(w => w.locationId === locationId);
}

/**
 * Get workshops by profession
 */
export function getWorkshopsByProfession(profession: ProfessionId): WorkshopBuilding[] {
  return ALL_WORKSHOPS.filter(w => w.professionSupported === profession);
}

/**
 * Get workshops by tier
 */
export function getWorkshopsByTier(minTier: number): WorkshopBuilding[] {
  return ALL_WORKSHOPS.filter(w => w.tier >= minTier);
}
