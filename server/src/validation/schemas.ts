/**
 * Validation Schemas
 *
 * Pre-defined validation schemas for all major API endpoints.
 * Use these with the validate() middleware in routes.
 */

import { ValidationSchema, FieldValidator } from './middleware';
import {
  CHARACTER_LIMITS,
  GANG_CONSTANTS,
  MARKETPLACE_CONSTANTS,
  DUEL_CONSTANTS,
  GAMBLING_CONSTANTS,
  QUEST_CONSTANTS,
  PROGRESSION,
  SKILLS,
  Faction
} from '@desperados/shared';

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const AuthSchemas = {
  register: {
    body: {
      email: {
        required: true,
        type: 'string',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please provide a valid email address'
      },
      password: {
        required: true,
        type: 'string',
        min: 8,
        max: 128,
        message: 'Password must be between 8 and 128 characters'
      },
      username: {
        required: true,
        type: 'string',
        min: 3,
        max: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
      }
    }
  } as ValidationSchema,

  login: {
    body: {
      email: {
        required: true,
        type: 'string'
      },
      password: {
        required: true,
        type: 'string'
      }
    }
  } as ValidationSchema,

  changePassword: {
    body: {
      currentPassword: { required: true, type: 'string' },
      newPassword: {
        required: true,
        type: 'string',
        min: 8,
        max: 128
      }
    }
  } as ValidationSchema,

  resetPassword: {
    body: {
      token: { required: true, type: 'string' },
      password: {
        required: true,
        type: 'string',
        min: 8,
        max: 128
      }
    }
  } as ValidationSchema
};

// ============================================
// CHARACTER SCHEMAS
// ============================================

export const CharacterSchemas = {
  create: {
    body: {
      name: {
        required: true,
        type: 'string',
        min: CHARACTER_LIMITS.MIN_NAME_LENGTH,
        max: CHARACTER_LIMITS.MAX_NAME_LENGTH,
        pattern: CHARACTER_LIMITS.NAME_PATTERN,
        message: 'Character name must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens'
      },
      faction: {
        required: true,
        type: 'string',
        enum: [Faction.SETTLER_ALLIANCE, Faction.NAHI_COALITION, Faction.FRONTERA] as const
      }
    }
  } as ValidationSchema,

  update: {
    params: {
      characterId: { required: true, type: 'objectId' }
    },
    body: {
      appearance: { type: 'object' as unknown as 'string' } // Complex type
    }
  } as ValidationSchema,

  getById: {
    params: {
      characterId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema
};

// ============================================
// GANG SCHEMAS
// ============================================

export const GangSchemas = {
  create: {
    body: {
      name: {
        required: true,
        type: 'string',
        min: GANG_CONSTANTS.MIN_NAME_LENGTH,
        max: GANG_CONSTANTS.MAX_NAME_LENGTH
      },
      tag: {
        required: true,
        type: 'string',
        min: GANG_CONSTANTS.MIN_TAG_LENGTH,
        max: GANG_CONSTANTS.MAX_TAG_LENGTH,
        pattern: /^[A-Z0-9]+$/,
        message: 'Tag must be uppercase letters and numbers only'
      },
      description: {
        type: 'string',
        max: 500
      }
    }
  } as ValidationSchema,

  invite: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      targetCharacterId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  deposit: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  withdraw: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: GANG_CONSTANTS.MAX_BANK_CAPACITY
      }
    }
  } as ValidationSchema,

  kick: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      memberId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  promote: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      memberId: { required: true, type: 'objectId' },
      newRank: {
        required: true,
        type: 'string',
        enum: ['recruit', 'member', 'officer', 'leader'] as const
      }
    }
  } as ValidationSchema
};

// ============================================
// MARKETPLACE SCHEMAS
// ============================================

export const MarketplaceSchemas = {
  createListing: {
    body: {
      itemId: { required: true, type: 'objectId' },
      startingPrice: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      },
      buyoutPrice: {
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      },
      duration: {
        required: true,
        type: 'number',
        min: MARKETPLACE_CONSTANTS.MIN_LISTING_HOURS,
        max: MARKETPLACE_CONSTANTS.MAX_LISTING_HOURS
      },
      quantity: {
        type: 'number',
        min: 1,
        default: 1
      }
    }
  } as ValidationSchema,

  placeBid: {
    params: {
      listingId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  buyout: {
    params: {
      listingId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  cancelListing: {
    params: {
      listingId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  search: {
    query: {
      category: { type: 'string' },
      subcategory: { type: 'string' },
      minPrice: { type: 'number', min: 0 },
      maxPrice: { type: 'number', min: 0 },
      sellerId: { type: 'objectId' },
      sort: {
        type: 'string',
        enum: ['price_asc', 'price_desc', 'ending_soon', 'newest'] as const,
        default: 'ending_soon'
      },
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 50, default: 20 }
    }
  } as ValidationSchema
};

// ============================================
// DUEL SCHEMAS
// ============================================

export const DuelSchemas = {
  challenge: {
    body: {
      opponentId: { required: true, type: 'objectId' },
      wager: {
        required: true,
        type: 'number',
        min: DUEL_CONSTANTS.MIN_WAGER,
        max: DUEL_CONSTANTS.MAX_WAGER
      },
      isRanked: {
        type: 'boolean',
        default: false
      }
    }
  } as ValidationSchema,

  respond: {
    params: {
      duelId: { required: true, type: 'objectId' }
    },
    body: {
      accept: { required: true, type: 'boolean' }
    }
  } as ValidationSchema,

  action: {
    params: {
      duelId: { required: true, type: 'objectId' }
    },
    body: {
      action: {
        required: true,
        type: 'string',
        enum: ['bet', 'check', 'fold', 'raise', 'call'] as const
      },
      amount: {
        type: 'number',
        min: 0
      }
    }
  } as ValidationSchema
};

// ============================================
// GAMBLING SCHEMAS
// ============================================

export const GamblingSchemas = {
  placeBet: {
    body: {
      amount: {
        required: true,
        type: 'number',
        min: GAMBLING_CONSTANTS.MIN_BET,
        max: GAMBLING_CONSTANTS.MAX_BET
      },
      gameType: {
        required: true,
        type: 'string',
        enum: ['blackjack', 'poker', 'slots', 'roulette', 'dice'] as const
      }
    }
  } as ValidationSchema,

  blackjackAction: {
    params: {
      sessionId: { required: true, type: 'objectId' }
    },
    body: {
      action: {
        required: true,
        type: 'string',
        enum: ['hit', 'stand', 'double', 'split'] as const
      }
    }
  } as ValidationSchema,

  rouletteAction: {
    params: {
      sessionId: { required: true, type: 'objectId' }
    },
    body: {
      betType: {
        required: true,
        type: 'string',
        enum: ['number', 'red', 'black', 'odd', 'even', 'high', 'low'] as const
      },
      betValue: { type: 'number' },
      amount: {
        required: true,
        type: 'number',
        min: GAMBLING_CONSTANTS.MIN_BET,
        max: GAMBLING_CONSTANTS.MAX_BET
      }
    }
  } as ValidationSchema
};

// ============================================
// COMBAT SCHEMAS
// ============================================

export const CombatSchemas = {
  startEncounter: {
    body: {
      npcId: { type: 'objectId' },
      locationId: { type: 'objectId' },
      difficulty: {
        type: 'number',
        min: 1,
        max: 10
      }
    }
  } as ValidationSchema,

  combatAction: {
    params: {
      encounterId: { required: true, type: 'objectId' }
    },
    body: {
      action: {
        required: true,
        type: 'string',
        enum: ['attack', 'defend', 'skill', 'item', 'flee'] as const
      },
      targetId: { type: 'objectId' },
      skillId: { type: 'string' },
      itemId: { type: 'objectId' }
    }
  } as ValidationSchema
};

// ============================================
// QUEST SCHEMAS
// ============================================

export const QuestSchemas = {
  accept: {
    body: {
      questId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  abandon: {
    body: {
      questId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  complete: {
    body: {
      questId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  completeObjective: {
    params: {
      questId: { required: true, type: 'string' }
    },
    body: {
      objectiveId: { required: true, type: 'string' },
      progress: { type: 'number', min: 1 }
    }
  } as ValidationSchema
};

// ============================================
// GOLD TRANSFER SCHEMAS
// ============================================

export const GoldSchemas = {
  transfer: {
    body: {
      recipientId: { required: true, type: 'objectId' },
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      },
      reason: {
        type: 'string',
        max: 200
      }
    }
  } as ValidationSchema,

  deposit: {
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  withdraw: {
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema
};

// ============================================
// CHAT SCHEMAS
// ============================================

export const ChatSchemas = {
  sendMessage: {
    body: {
      channel: {
        required: true,
        type: 'string',
        enum: ['global', 'local', 'gang', 'trade', 'help'] as const
      },
      message: {
        required: true,
        type: 'string',
        min: 1,
        max: 500
      }
    }
  } as ValidationSchema,

  whisper: {
    body: {
      recipientId: { required: true, type: 'objectId' },
      message: {
        required: true,
        type: 'string',
        min: 1,
        max: 500
      }
    }
  } as ValidationSchema
};

// ============================================
// PROPERTY SCHEMAS
// ============================================

export const PropertySchemas = {
  purchase: {
    body: {
      propertyId: { required: true, type: 'objectId' },
      paymentMethod: {
        type: 'string',
        enum: ['gold', 'loan'] as const
      }
    }
  } as ValidationSchema,

  upgradeTier: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  upgrade: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      upgradeType: {
        required: true,
        type: 'string'
      }
    }
  } as ValidationSchema,

  hireWorker: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      workerId: { type: 'objectId' },
      workerType: { type: 'string' }
    }
  } as ValidationSchema,

  fireWorker: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      workerId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  depositItem: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      itemId: { required: true, type: 'objectId' },
      quantity: {
        type: 'number',
        min: 1,
        default: 1
      }
    }
  } as ValidationSchema,

  withdrawItem: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      itemId: { required: true, type: 'objectId' },
      quantity: {
        type: 'number',
        min: 1,
        default: 1
      }
    }
  } as ValidationSchema,

  makeLoanPayment: {
    params: {
      loanId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  transferProperty: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    },
    body: {
      targetCharacterId: { required: true, type: 'objectId' },
      price: {
        type: 'number',
        min: 0,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  getPropertyDetails: {
    params: {
      propertyId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema
};

// ============================================
// HUNTING SCHEMAS
// ============================================

export const HuntingSchemas = {
  startHunt: {
    body: {
      locationId: { required: true, type: 'objectId' },
      targetType: {
        type: 'string',
        enum: ['small', 'medium', 'large', 'legendary'] as const
      }
    }
  } as ValidationSchema,

  trackingAction: {
    params: {
      huntId: { required: true, type: 'objectId' }
    },
    body: {
      direction: {
        required: true,
        type: 'string',
        enum: ['north', 'south', 'east', 'west', 'follow_tracks'] as const
      }
    }
  } as ValidationSchema,

  takeShot: {
    params: {
      huntId: { required: true, type: 'objectId' }
    },
    body: {
      aimPoint: {
        required: true,
        type: 'string',
        enum: ['head', 'heart', 'body', 'legs'] as const
      }
    }
  } as ValidationSchema
};

// ============================================
// ADMIN SCHEMAS
// ============================================

export const AdminSchemas = {
  grantGold: {
    body: {
      characterId: { required: true, type: 'objectId' },
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      },
      reason: {
        required: true,
        type: 'string',
        min: 1,
        max: 200
      }
    }
  } as ValidationSchema,

  grantEnergy: {
    body: {
      characterId: { required: true, type: 'objectId' },
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: 1000
      }
    }
  } as ValidationSchema,

  banUser: {
    body: {
      userId: { required: true, type: 'objectId' },
      reason: {
        required: true,
        type: 'string',
        min: 1,
        max: 500
      },
      duration: {
        type: 'number',
        min: 0 // 0 = permanent
      }
    }
  } as ValidationSchema,

  updateSettings: {
    body: {
      maintenanceMode: {
        type: 'boolean',
        message: 'maintenanceMode must be a boolean'
      },
      registrationEnabled: {
        type: 'boolean',
        message: 'registrationEnabled must be a boolean'
      },
      chatEnabled: {
        type: 'boolean',
        message: 'chatEnabled must be a boolean'
      }
    }
  } as ValidationSchema
};

// ============================================
// SKILL SCHEMAS
// ============================================

// Get valid skill IDs from shared constants
const VALID_SKILL_IDS = Object.values(SKILLS).map(s => s.id);

export const SkillSchemas = {
  startTraining: {
    body: {
      skillId: {
        required: true,
        type: 'string',
        enum: VALID_SKILL_IDS as readonly string[],
        message: 'Invalid skill ID. Must be a valid skill from the game'
      }
    }
  } as ValidationSchema,

  cancelTraining: {
    // No body required - just needs authentication
  } as ValidationSchema,

  completeTraining: {
    // No body required - just needs authentication
  } as ValidationSchema
};

// ============================================
// TRAIN SCHEMAS
// ============================================

export const TrainSchemas = {
  purchaseTicket: {
    body: {
      origin: {
        required: true,
        type: 'string',
        min: 1,
        message: 'Origin station is required'
      },
      destination: {
        required: true,
        type: 'string',
        min: 1,
        message: 'Destination station is required'
      },
      ticketClass: {
        required: true,
        type: 'string',
        enum: ['economy', 'business', 'sleeper'] as const,
        message: 'Ticket class must be economy, business, or sleeper'
      },
      departureTime: {
        type: 'string'
      }
    }
  } as ValidationSchema,

  boardTrain: {
    params: {
      ticketId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  refundTicket: {
    params: {
      ticketId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  shipCargo: {
    body: {
      origin: {
        required: true,
        type: 'string',
        min: 1
      },
      destination: {
        required: true,
        type: 'string',
        min: 1
      },
      cargo: {
        required: true,
        type: 'array'
      },
      insured: {
        type: 'boolean',
        default: false
      }
    }
  } as ValidationSchema,

  scoutTrain: {
    body: {
      trainId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  planRobbery: {
    body: {
      trainId: { required: true, type: 'string' },
      departureTime: { required: true, type: 'string' },
      approach: {
        required: true,
        type: 'string',
        enum: ['stealth', 'assault', 'deception'] as const
      },
      targetLocation: {
        required: true,
        type: 'string',
        enum: ['engine', 'passenger', 'cargo', 'caboose'] as const
      },
      gangMemberIds: {
        required: true,
        type: 'array',
        min: 1,
        max: 10
      },
      equipment: {
        type: 'array',
        max: 20
      }
    }
  } as ValidationSchema,

  executeRobbery: {
    params: {
      robberyId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema
};

// ============================================
// STAGECOACH SCHEMAS
// ============================================

export const StagecoachSchemas = {
  bookTicket: {
    body: {
      routeId: { required: true, type: 'objectId' },
      departureLocationId: { required: true, type: 'objectId' },
      destinationLocationId: { required: true, type: 'objectId' },
      departureTime: { type: 'string' },
      luggageWeight: {
        type: 'number',
        min: 0,
        max: 100
      },
      weaponDeclared: {
        type: 'boolean',
        default: false
      }
    }
  } as ValidationSchema,

  cancelTicket: {
    params: {
      ticketId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  getTravelProgress: {
    params: {
      ticketId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  completeJourney: {
    params: {
      ticketId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  getAmbushSpots: {
    params: {
      routeId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  getAmbushSpot: {
    params: {
      routeId: { required: true, type: 'objectId' },
      spotId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  setupAmbush: {
    body: {
      routeId: { required: true, type: 'objectId' },
      ambushSpotId: { required: true, type: 'objectId' },
      scheduledTime: { required: true, type: 'string' },
      gangMemberIds: {
        required: true,
        type: 'array',
        min: 1,
        max: 10
      },
      strategy: {
        type: 'string',
        enum: ['roadblock', 'surprise', 'deception'] as const
      }
    }
  } as ValidationSchema,

  executeAmbush: {
    body: {
      stagecoachId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  defendStagecoach: {
    body: {
      stagecoachId: { required: true, type: 'string' }
    }
  } as ValidationSchema,

  distributeLoot: {
    body: {
      totalValue: {
        required: true,
        type: 'number',
        min: 0
      },
      loot: {
        required: true,
        type: 'array'
      },
      gangMemberIds: {
        required: true,
        type: 'array'
      }
    }
  } as ValidationSchema
};

// ============================================
// HEIST SCHEMAS
// ============================================

export const HeistSchemas = {
  planHeist: {
    body: {
      target: {
        required: true,
        type: 'string'
      },
      roleAssignments: {
        type: 'array'
      }
    }
  } as ValidationSchema,

  heistIdParam: {
    params: {
      heistId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  increaseProgress: {
    params: {
      heistId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        type: 'number',
        min: 1,
        max: 100
      }
    }
  } as ValidationSchema,

  assignRole: {
    params: {
      heistId: { required: true, type: 'objectId' }
    },
    body: {
      role: {
        required: true,
        type: 'string',
        enum: ['lookout', 'infiltrator', 'muscle', 'driver', 'mastermind', 'safecracker'] as const
      },
      targetCharacterId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema
};

// ============================================
// GANG BASE SCHEMAS
// ============================================

export const GangBaseSchemas = {
  gangIdParam: {
    params: {
      gangId: { required: true, type: 'objectId' }
    }
  } as ValidationSchema,

  upgradeBase: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      upgradeType: {
        required: true,
        type: 'string',
        enum: ['storage', 'security', 'income', 'efficiency', 'aesthetics', 'defense', 'production', 'capacity'] as const
      }
    }
  } as ValidationSchema,

  depositToTreasury: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      }
    }
  } as ValidationSchema,

  withdrawFromTreasury: {
    params: {
      gangId: { required: true, type: 'objectId' }
    },
    body: {
      amount: {
        required: true,
        type: 'number',
        min: 1,
        max: CHARACTER_LIMITS.MAX_GOLD
      },
      reason: {
        type: 'string',
        max: 200
      }
    }
  } as ValidationSchema
};

export default {
  AuthSchemas,
  CharacterSchemas,
  GangSchemas,
  MarketplaceSchemas,
  DuelSchemas,
  GamblingSchemas,
  CombatSchemas,
  QuestSchemas,
  GoldSchemas,
  ChatSchemas,
  PropertySchemas,
  HuntingSchemas,
  AdminSchemas,
  SkillSchemas,
  TrainSchemas,
  StagecoachSchemas,
  HeistSchemas,
  GangBaseSchemas
};
