/**
 * Companion Species Data - Phase 9, Wave 9.2
 *
 * Defines all companion species available in the game
 */

import {
  CompanionSpecies,
  CompanionSpeciesDefinition,
  CompanionCategory,
  CompanionAbilityId,
  CombatRole,
  AcquisitionMethod
} from '@desperados/shared';

/**
 * All companion species definitions
 */
export const COMPANION_SPECIES: Record<CompanionSpecies, CompanionSpeciesDefinition> = {
  // ===========================================
  // DOGS
  // ===========================================

  [CompanionSpecies.AUSTRALIAN_SHEPHERD]: {
    species: CompanionSpecies.AUSTRALIAN_SHEPHERD,
    name: 'Australian Shepherd',
    category: CompanionCategory.DOG,
    description: 'Intelligent herding dog with boundless energy and loyalty. Excellent for ranch work and tracking.',
    flavorText: 'A blur of motion and intelligence, the Australian Shepherd seems to anticipate your every move.',
    baseStats: {
      loyalty: 75,
      intelligence: 85,
      aggression: 30,
      health: 70
    },
    combatStats: {
      attackPower: 25,
      defensePower: 30,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 20,
      huntingBonus: 15,
      guardBonus: 25,
      socialBonus: 20
    },
    availableAbilities: [
      CompanionAbilityId.HERD,
      CompanionAbilityId.TRACK,
      CompanionAbilityId.GUARD,
      CompanionAbilityId.FETCH,
      CompanionAbilityId.SENSE_DANGER
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.GIFT],
    purchasePrice: 250,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 5,
      shelterRequired: true
    },
    rarity: 'common',
    levelRequired: 5
  },

  [CompanionSpecies.CATAHOULA_LEOPARD_DOG]: {
    species: CompanionSpecies.CATAHOULA_LEOPARD_DOG,
    name: 'Catahoula Leopard Dog',
    category: CompanionCategory.DOG,
    description: 'Louisiana\'s state dog, bred for hunting wild boar. Fierce and independent with exceptional tracking skills.',
    flavorText: 'Those distinctive eyes seem to see right through deception. This dog was born to hunt.',
    baseStats: {
      loyalty: 70,
      intelligence: 75,
      aggression: 55,
      health: 80
    },
    combatStats: {
      attackPower: 35,
      defensePower: 30,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 30,
      huntingBonus: 35,
      guardBonus: 20,
      socialBonus: 10
    },
    availableAbilities: [
      CompanionAbilityId.TRACK,
      CompanionAbilityId.ATTACK,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.INTIMIDATE,
      CompanionAbilityId.POUNCE
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.TAMED],
    purchasePrice: 350,
    tamingDifficulty: 4,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 6,
      shelterRequired: true
    },
    rarity: 'uncommon',
    levelRequired: 8
  },

  [CompanionSpecies.BLOODHOUND]: {
    species: CompanionSpecies.BLOODHOUND,
    name: 'Bloodhound',
    category: CompanionCategory.DOG,
    description: 'Legendary tracking ability. Can follow scent trails days old across any terrain.',
    flavorText: 'With that noble face and those drooping ears, the bloodhound is already on the trail.',
    baseStats: {
      loyalty: 80,
      intelligence: 70,
      aggression: 20,
      health: 75
    },
    combatStats: {
      attackPower: 20,
      defensePower: 25,
      combatRole: CombatRole.SCOUT
    },
    utilityStats: {
      trackingBonus: 50,
      huntingBonus: 20,
      guardBonus: 15,
      socialBonus: 25
    },
    availableAbilities: [
      CompanionAbilityId.TRACK,
      CompanionAbilityId.SENSE_DANGER,
      CompanionAbilityId.GUARD,
      CompanionAbilityId.KEEN_SIGHT
    ],
    maxAbilities: 3,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.QUEST],
    purchasePrice: 500,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 7,
      shelterRequired: true
    },
    rarity: 'rare',
    levelRequired: 12
  },

  [CompanionSpecies.GERMAN_SHEPHERD]: {
    species: CompanionSpecies.GERMAN_SHEPHERD,
    name: 'German Shepherd',
    category: CompanionCategory.DOG,
    description: 'Versatile working dog. Loyal, intelligent, and protective. Excellent guard and combat companion.',
    flavorText: 'Alert and dignified, this shepherd stands ready to defend you with its life.',
    baseStats: {
      loyalty: 90,
      intelligence: 85,
      aggression: 45,
      health: 85
    },
    combatStats: {
      attackPower: 40,
      defensePower: 40,
      combatRole: CombatRole.DEFENDER
    },
    utilityStats: {
      trackingBonus: 25,
      huntingBonus: 20,
      guardBonus: 40,
      socialBonus: 15
    },
    availableAbilities: [
      CompanionAbilityId.GUARD,
      CompanionAbilityId.ATTACK,
      CompanionAbilityId.LOYAL_DEFENSE,
      CompanionAbilityId.INTIMIDATE,
      CompanionAbilityId.SENSE_DANGER
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.GIFT],
    purchasePrice: 450,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 7,
      shelterRequired: true
    },
    rarity: 'uncommon',
    levelRequired: 10
  },

  [CompanionSpecies.COLLIE]: {
    species: CompanionSpecies.COLLIE,
    name: 'Collie',
    category: CompanionCategory.DOG,
    description: 'Beautiful and intelligent ranch dog. Gentle yet effective herder with strong loyalty.',
    flavorText: 'Graceful and attentive, the collie moves like poetry across the prairie.',
    baseStats: {
      loyalty: 85,
      intelligence: 80,
      aggression: 25,
      health: 65
    },
    combatStats: {
      attackPower: 20,
      defensePower: 30,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 20,
      huntingBonus: 15,
      guardBonus: 30,
      socialBonus: 35
    },
    availableAbilities: [
      CompanionAbilityId.HERD,
      CompanionAbilityId.GUARD,
      CompanionAbilityId.SENSE_DANGER,
      CompanionAbilityId.FETCH
    ],
    maxAbilities: 3,
    acquisitionMethods: [AcquisitionMethod.PURCHASE],
    purchasePrice: 200,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 5,
      shelterRequired: true
    },
    rarity: 'common',
    levelRequired: 3
  },

  [CompanionSpecies.PITBULL]: {
    species: CompanionSpecies.PITBULL,
    name: 'Pitbull',
    category: CompanionCategory.DOG,
    description: 'Powerful and tenacious fighter. Controversial but fiercely loyal. Excellent protection.',
    flavorText: 'Muscular and determined, this dog would follow you into hell itself.',
    baseStats: {
      loyalty: 80,
      intelligence: 60,
      aggression: 70,
      health: 90
    },
    combatStats: {
      attackPower: 50,
      defensePower: 45,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 15,
      huntingBonus: 25,
      guardBonus: 45,
      socialBonus: -10
    },
    availableAbilities: [
      CompanionAbilityId.ATTACK,
      CompanionAbilityId.LOYAL_DEFENSE,
      CompanionAbilityId.INTIMIDATE,
      CompanionAbilityId.GUARD,
      CompanionAbilityId.MAUL
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.RESCUED],
    purchasePrice: 300,
    careRequirements: {
      foodType: ['meat', 'dog_food'],
      dailyFoodCost: 8,
      shelterRequired: true
    },
    rarity: 'uncommon',
    levelRequired: 8,
    reputationRequired: {
      faction: 'criminalReputation',
      amount: 20
    }
  },

  [CompanionSpecies.COYDOG]: {
    species: CompanionSpecies.COYDOG,
    name: 'Coydog',
    category: CompanionCategory.DOG,
    description: 'Coyote-dog hybrid. Wild instincts combined with dog loyalty. Difficult to tame but highly capable.',
    flavorText: 'Half wild, half tame - this creature embodies the untamed spirit of the frontier.',
    baseStats: {
      loyalty: 55,
      intelligence: 75,
      aggression: 60,
      health: 75
    },
    combatStats: {
      attackPower: 35,
      defensePower: 30,
      combatRole: CombatRole.SCOUT
    },
    utilityStats: {
      trackingBonus: 35,
      huntingBonus: 40,
      guardBonus: 25,
      socialBonus: 5
    },
    availableAbilities: [
      CompanionAbilityId.TRACK,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.PACK_TACTICS
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.TAMED],
    tamingDifficulty: 6,
    careRequirements: {
      foodType: ['meat', 'raw_meat'],
      dailyFoodCost: 6,
      shelterRequired: false
    },
    rarity: 'rare',
    levelRequired: 15
  },

  [CompanionSpecies.WOLF_HYBRID]: {
    species: CompanionSpecies.WOLF_HYBRID,
    name: 'Wolf Hybrid',
    category: CompanionCategory.DOG,
    description: 'Wolf-dog hybrid. Dangerous and powerful. Requires experienced handler and strong will.',
    flavorText: 'Those yellow eyes hold the wisdom of the wild and the promise of violence.',
    baseStats: {
      loyalty: 50,
      intelligence: 80,
      aggression: 75,
      health: 90
    },
    combatStats: {
      attackPower: 55,
      defensePower: 40,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 40,
      huntingBonus: 45,
      guardBonus: 35,
      socialBonus: -15
    },
    availableAbilities: [
      CompanionAbilityId.ATTACK,
      CompanionAbilityId.PACK_TACTICS,
      CompanionAbilityId.INTIMIDATE,
      CompanionAbilityId.FERAL_RAGE,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.MAUL
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.QUEST],
    tamingDifficulty: 8,
    careRequirements: {
      foodType: ['meat', 'raw_meat'],
      dailyFoodCost: 10,
      shelterRequired: false
    },
    rarity: 'epic',
    levelRequired: 20,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 40
    }
  },

  // ===========================================
  // BIRDS
  // ===========================================

  [CompanionSpecies.RED_TAILED_HAWK]: {
    species: CompanionSpecies.RED_TAILED_HAWK,
    name: 'Red-Tailed Hawk',
    category: CompanionCategory.BIRD,
    description: 'Common but effective hunting bird. Excellent vision and moderate hunting ability.',
    flavorText: 'The hawk\'s piercing cry echoes across the plains as it circles overhead.',
    baseStats: {
      loyalty: 60,
      intelligence: 70,
      aggression: 50,
      health: 40
    },
    combatStats: {
      attackPower: 25,
      defensePower: 15,
      combatRole: CombatRole.SCOUT
    },
    utilityStats: {
      trackingBonus: 25,
      huntingBonus: 30,
      guardBonus: 20,
      socialBonus: 10
    },
    availableAbilities: [
      CompanionAbilityId.SCOUT,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.KEEN_SIGHT,
      CompanionAbilityId.AERIAL_ASSAULT
    ],
    maxAbilities: 3,
    acquisitionMethods: [AcquisitionMethod.PURCHASE, AcquisitionMethod.TAMED],
    purchasePrice: 400,
    tamingDifficulty: 5,
    careRequirements: {
      foodType: ['meat', 'small_game'],
      dailyFoodCost: 4,
      shelterRequired: false
    },
    rarity: 'uncommon',
    levelRequired: 8
  },

  [CompanionSpecies.GOLDEN_EAGLE]: {
    species: CompanionSpecies.GOLDEN_EAGLE,
    name: 'Golden Eagle',
    category: CompanionCategory.BIRD,
    description: 'Majestic apex predator. Can hunt prey as large as deer. Symbol of power and prestige.',
    flavorText: 'The king of the sky, golden feathers gleaming in the sun like a crown.',
    baseStats: {
      loyalty: 55,
      intelligence: 85,
      aggression: 65,
      health: 60
    },
    combatStats: {
      attackPower: 40,
      defensePower: 20,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 35,
      huntingBonus: 50,
      guardBonus: 25,
      socialBonus: 30
    },
    availableAbilities: [
      CompanionAbilityId.SCOUT,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.AERIAL_ASSAULT,
      CompanionAbilityId.KEEN_SIGHT,
      CompanionAbilityId.INTIMIDATE
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.QUEST],
    tamingDifficulty: 9,
    careRequirements: {
      foodType: ['meat', 'large_game'],
      dailyFoodCost: 8,
      shelterRequired: false
    },
    rarity: 'epic',
    levelRequired: 18,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 50
    }
  },

  [CompanionSpecies.RAVEN]: {
    species: CompanionSpecies.RAVEN,
    name: 'Raven',
    category: CompanionCategory.BIRD,
    description: 'Highly intelligent corvid. Can solve puzzles, mimic speech, and sense supernatural activity.',
    flavorText: 'Dark as midnight, clever as the devil, this raven knows things it shouldn\'t.',
    baseStats: {
      loyalty: 65,
      intelligence: 95,
      aggression: 30,
      health: 35
    },
    combatStats: {
      attackPower: 15,
      defensePower: 10,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 30,
      huntingBonus: 10,
      guardBonus: 35,
      socialBonus: 20
    },
    availableAbilities: [
      CompanionAbilityId.SCOUT,
      CompanionAbilityId.MESSAGE,
      CompanionAbilityId.OMEN,
      CompanionAbilityId.DISTRACT,
      CompanionAbilityId.SCAVENGE,
      CompanionAbilityId.SOUL_SENSE
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.GIFT, AcquisitionMethod.QUEST],
    tamingDifficulty: 4,
    careRequirements: {
      foodType: ['meat', 'small_game', 'scrap'],
      dailyFoodCost: 3,
      shelterRequired: false
    },
    rarity: 'rare',
    levelRequired: 10
  },

  // ===========================================
  // EXOTIC
  // ===========================================

  [CompanionSpecies.RACCOON]: {
    species: CompanionSpecies.RACCOON,
    name: 'Raccoon',
    category: CompanionCategory.EXOTIC,
    description: 'Mischievous and clever scavenger. Excellent at finding items and getting into places it shouldn\'t.',
    flavorText: 'Those nimble paws can pick locks better than most outlaws.',
    baseStats: {
      loyalty: 50,
      intelligence: 85,
      aggression: 20,
      health: 40
    },
    combatStats: {
      attackPower: 10,
      defensePower: 15,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 20,
      huntingBonus: 15,
      guardBonus: 10,
      socialBonus: 15
    },
    availableAbilities: [
      CompanionAbilityId.SCAVENGE,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.CLIMB
    ],
    maxAbilities: 3,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.RESCUED],
    tamingDifficulty: 3,
    careRequirements: {
      foodType: ['meat', 'scrap', 'vegetables'],
      dailyFoodCost: 3,
      shelterRequired: false
    },
    rarity: 'common',
    levelRequired: 5
  },

  [CompanionSpecies.FERRET]: {
    species: CompanionSpecies.FERRET,
    name: 'Ferret',
    category: CompanionCategory.EXOTIC,
    description: 'Small but fearless hunter. Perfect for flushing rabbits from burrows and finding hidden items.',
    flavorText: 'Quick as lightning and twice as curious, the ferret darts into every hole.',
    baseStats: {
      loyalty: 70,
      intelligence: 70,
      aggression: 40,
      health: 30
    },
    combatStats: {
      attackPower: 15,
      defensePower: 10,
      combatRole: CombatRole.SCOUT
    },
    utilityStats: {
      trackingBonus: 25,
      huntingBonus: 35,
      guardBonus: 10,
      socialBonus: 20
    },
    availableAbilities: [
      CompanionAbilityId.BURROW_FLUSH,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.SCAVENGE
    ],
    maxAbilities: 3,
    acquisitionMethods: [AcquisitionMethod.PURCHASE],
    purchasePrice: 150,
    careRequirements: {
      foodType: ['meat', 'small_game'],
      dailyFoodCost: 2,
      shelterRequired: true
    },
    rarity: 'uncommon',
    levelRequired: 6
  },

  [CompanionSpecies.MOUNTAIN_LION]: {
    species: CompanionSpecies.MOUNTAIN_LION,
    name: 'Mountain Lion',
    category: CompanionCategory.EXOTIC,
    description: 'Apex predator of the mountains. Powerful, stealthy, and deadly. Extremely difficult to tame.',
    flavorText: 'Silent death on padded paws. This cat hunts because it was born to kill.',
    baseStats: {
      loyalty: 40,
      intelligence: 75,
      aggression: 85,
      health: 95
    },
    combatStats: {
      attackPower: 65,
      defensePower: 40,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 40,
      huntingBonus: 55,
      guardBonus: 30,
      socialBonus: -20
    },
    availableAbilities: [
      CompanionAbilityId.POUNCE,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.MAUL,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.CLIMB,
      CompanionAbilityId.FERAL_RAGE
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.QUEST],
    tamingDifficulty: 10,
    careRequirements: {
      foodType: ['meat', 'raw_meat', 'large_game'],
      dailyFoodCost: 15,
      shelterRequired: false
    },
    rarity: 'legendary',
    levelRequired: 25,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 60
    }
  },

  [CompanionSpecies.WOLF]: {
    species: CompanionSpecies.WOLF,
    name: 'Wolf',
    category: CompanionCategory.EXOTIC,
    description: 'Pure wild wolf. Pack hunter with incredible instincts. Loyalty must be earned through respect.',
    flavorText: 'The wolf acknowledges no master, only pack. Prove yourself worthy.',
    baseStats: {
      loyalty: 45,
      intelligence: 85,
      aggression: 70,
      health: 85
    },
    combatStats: {
      attackPower: 50,
      defensePower: 35,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 45,
      huntingBonus: 50,
      guardBonus: 35,
      socialBonus: -10
    },
    availableAbilities: [
      CompanionAbilityId.PACK_TACTICS,
      CompanionAbilityId.ATTACK,
      CompanionAbilityId.INTIMIDATE_PREY,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.MAUL,
      CompanionAbilityId.SENSE_DANGER
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.QUEST],
    tamingDifficulty: 9,
    careRequirements: {
      foodType: ['meat', 'raw_meat'],
      dailyFoodCost: 12,
      shelterRequired: false
    },
    rarity: 'epic',
    levelRequired: 20,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 50
    }
  },

  [CompanionSpecies.BEAR_CUB]: {
    species: CompanionSpecies.BEAR_CUB,
    name: 'Bear Cub',
    category: CompanionCategory.EXOTIC,
    description: 'Young bear. Grows larger and more powerful with age. Requires significant resources but becomes formidable.',
    flavorText: 'Adorable now, but those claws will grow. This cub will become a force of nature.',
    baseStats: {
      loyalty: 60,
      intelligence: 55,
      aggression: 50,
      health: 100
    },
    combatStats: {
      attackPower: 45,
      defensePower: 50,
      combatRole: CombatRole.DEFENDER
    },
    utilityStats: {
      trackingBonus: 25,
      huntingBonus: 35,
      guardBonus: 40,
      socialBonus: 10
    },
    availableAbilities: [
      CompanionAbilityId.MAUL,
      CompanionAbilityId.INTIMIDATE,
      CompanionAbilityId.LOYAL_DEFENSE,
      CompanionAbilityId.FERAL_RAGE,
      CompanionAbilityId.SENSE_DANGER
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.TAMED, AcquisitionMethod.RESCUED, AcquisitionMethod.QUEST],
    tamingDifficulty: 7,
    careRequirements: {
      foodType: ['meat', 'fish', 'vegetables', 'honey'],
      dailyFoodCost: 20,
      shelterRequired: true
    },
    rarity: 'epic',
    levelRequired: 22
  },

  [CompanionSpecies.COYOTE]: {
    species: CompanionSpecies.COYOTE,
    name: 'Coyote',
    category: CompanionCategory.EXOTIC,
    description: 'Clever desert survivor. Adaptable and cunning. Works well in desert environments.',
    flavorText: 'The trickster of the desert, always one step ahead.',
    baseStats: {
      loyalty: 50,
      intelligence: 80,
      aggression: 55,
      health: 65
    },
    combatStats: {
      attackPower: 30,
      defensePower: 25,
      combatRole: CombatRole.SCOUT
    },
    utilityStats: {
      trackingBonus: 35,
      huntingBonus: 40,
      guardBonus: 20,
      socialBonus: 5
    },
    availableAbilities: [
      CompanionAbilityId.TRACK,
      CompanionAbilityId.HUNT,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.PACK_TACTICS
    ],
    maxAbilities: 4,
    acquisitionMethods: [AcquisitionMethod.TAMED],
    tamingDifficulty: 6,
    careRequirements: {
      foodType: ['meat', 'small_game'],
      dailyFoodCost: 5,
      shelterRequired: false
    },
    rarity: 'uncommon',
    levelRequired: 12
  },

  // ===========================================
  // SUPERNATURAL
  // ===========================================

  [CompanionSpecies.GHOST_HOUND]: {
    species: CompanionSpecies.GHOST_HOUND,
    name: 'Ghost Hound',
    category: CompanionCategory.SUPERNATURAL,
    description: 'Spectral hunting dog from Spirit Springs. Phases through walls and tracks the living and the dead.',
    flavorText: 'Its eyes glow with otherworldly light. This creature walks between worlds.',
    baseStats: {
      loyalty: 70,
      intelligence: 80,
      aggression: 60,
      health: 80
    },
    combatStats: {
      attackPower: 45,
      defensePower: 60,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 60,
      huntingBonus: 40,
      guardBonus: 50,
      socialBonus: -5
    },
    availableAbilities: [
      CompanionAbilityId.GHOST_WALK,
      CompanionAbilityId.SPIRIT_HOWL,
      CompanionAbilityId.TRACK,
      CompanionAbilityId.SOUL_SENSE,
      CompanionAbilityId.PHASE_SHIFT
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.QUEST, AcquisitionMethod.SUPERNATURAL],
    careRequirements: {
      foodType: ['spirit_essence'],
      dailyFoodCost: 10,
      shelterRequired: false
    },
    rarity: 'legendary',
    levelRequired: 30,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 70
    }
  },

  [CompanionSpecies.SKINWALKER_GIFT]: {
    species: CompanionSpecies.SKINWALKER_GIFT,
    name: "Skinwalker's Gift",
    category: CompanionCategory.SUPERNATURAL,
    description: 'Shape-shifting spirit animal. Can take many forms. Gift from a powerful skinwalker shaman.',
    flavorText: 'One moment a wolf, the next a hawk. This creature defies natural law.',
    baseStats: {
      loyalty: 65,
      intelligence: 90,
      aggression: 55,
      health: 75
    },
    combatStats: {
      attackPower: 50,
      defensePower: 45,
      combatRole: CombatRole.SUPPORT
    },
    utilityStats: {
      trackingBonus: 40,
      huntingBonus: 40,
      guardBonus: 40,
      socialBonus: 40
    },
    availableAbilities: [
      CompanionAbilityId.SHAPE_SHIFT,
      CompanionAbilityId.GHOST_WALK,
      CompanionAbilityId.PACK_TACTICS,
      CompanionAbilityId.SOUL_SENSE,
      CompanionAbilityId.SPIRIT_HOWL
    ],
    maxAbilities: 6,
    acquisitionMethods: [AcquisitionMethod.QUEST, AcquisitionMethod.SUPERNATURAL],
    careRequirements: {
      foodType: ['spirit_essence', 'blood'],
      dailyFoodCost: 15,
      shelterRequired: false
    },
    rarity: 'legendary',
    levelRequired: 35,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 80
    }
  },

  [CompanionSpecies.THUNDERBIRD_FLEDGLING]: {
    species: CompanionSpecies.THUNDERBIRD_FLEDGLING,
    name: 'Thunderbird Fledgling',
    category: CompanionCategory.SUPERNATURAL,
    description: 'Young thunderbird. Sacred to the Nahi Coalition. Commands storm and lightning.',
    flavorText: 'Thunder rumbles when it cries. Lightning dances in its wake.',
    baseStats: {
      loyalty: 60,
      intelligence: 85,
      aggression: 65,
      health: 70
    },
    combatStats: {
      attackPower: 60,
      defensePower: 40,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 35,
      huntingBonus: 45,
      guardBonus: 40,
      socialBonus: 50
    },
    availableAbilities: [
      CompanionAbilityId.THUNDER_STRIKE,
      CompanionAbilityId.AERIAL_ASSAULT,
      CompanionAbilityId.SCOUT,
      CompanionAbilityId.SPIRIT_HOWL,
      CompanionAbilityId.OMEN
    ],
    maxAbilities: 5,
    acquisitionMethods: [AcquisitionMethod.QUEST, AcquisitionMethod.SUPERNATURAL],
    careRequirements: {
      foodType: ['meat', 'spirit_essence'],
      dailyFoodCost: 12,
      shelterRequired: false
    },
    rarity: 'legendary',
    levelRequired: 32,
    reputationRequired: {
      faction: 'nahiCoalition',
      amount: 90
    }
  },

  [CompanionSpecies.CHUPACABRA]: {
    species: CompanionSpecies.CHUPACABRA,
    name: 'Chupacabra',
    category: CompanionCategory.SUPERNATURAL,
    description: 'Legendary creature from Frontera folklore. Drains life force from prey. Feared by all.',
    flavorText: 'Nightmare made flesh. Its very presence chills the blood.',
    baseStats: {
      loyalty: 55,
      intelligence: 75,
      aggression: 90,
      health: 85
    },
    combatStats: {
      attackPower: 70,
      defensePower: 40,
      combatRole: CombatRole.ATTACKER
    },
    utilityStats: {
      trackingBonus: 50,
      huntingBonus: 60,
      guardBonus: 45,
      socialBonus: -30
    },
    availableAbilities: [
      CompanionAbilityId.BLOOD_DRAIN,
      CompanionAbilityId.CURSE_BITE,
      CompanionAbilityId.STEALTH,
      CompanionAbilityId.NIGHT_VISION,
      CompanionAbilityId.INTIMIDATE_PREY,
      CompanionAbilityId.FERAL_RAGE
    ],
    maxAbilities: 6,
    acquisitionMethods: [AcquisitionMethod.QUEST, AcquisitionMethod.SUPERNATURAL],
    careRequirements: {
      foodType: ['blood', 'raw_meat'],
      dailyFoodCost: 18,
      shelterRequired: false
    },
    rarity: 'legendary',
    levelRequired: 35,
    reputationRequired: {
      faction: 'frontera',
      amount: 85
    }
  }
};

/**
 * Get species by category
 */
export function getSpeciesByCategory(category: CompanionCategory): CompanionSpeciesDefinition[] {
  return Object.values(COMPANION_SPECIES).filter(species => species.category === category);
}

/**
 * Get species by rarity
 */
export function getSpeciesByRarity(rarity: string): CompanionSpeciesDefinition[] {
  return Object.values(COMPANION_SPECIES).filter(species => species.rarity === rarity);
}

/**
 * Get purchasable species
 */
export function getPurchasableSpecies(): CompanionSpeciesDefinition[] {
  return Object.values(COMPANION_SPECIES).filter(species =>
    species.acquisitionMethods.includes(AcquisitionMethod.PURCHASE)
  );
}

/**
 * Get tameable species
 */
export function getTameableSpecies(): CompanionSpeciesDefinition[] {
  return Object.values(COMPANION_SPECIES).filter(species =>
    species.acquisitionMethods.includes(AcquisitionMethod.TAMED)
  );
}

/**
 * Get species definition
 */
export function getSpeciesDefinition(species: CompanionSpecies): CompanionSpeciesDefinition | undefined {
  return COMPANION_SPECIES[species];
}
