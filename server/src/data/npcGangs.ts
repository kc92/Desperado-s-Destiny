/**
 * NPC Gang Definitions
 *
 * Complete data for all 4 NPC gangs in Desperados Destiny
 */

import {
  NPCGang,
  NPCGangId,
  NPCGangSpecialty,
  RelationshipAttitude,
  AttackType,
  NPCMissionType,
  MissionRequirementType,
  MissionRewardType,
} from '@desperados/shared';

/**
 * El Rey's Frontera Gang
 * Large, powerful smuggling operation on the border
 */
export const EL_REY_FRONTERA_GANG: NPCGang = {
  id: NPCGangId.EL_REY_FRONTERA,
  name: "El Rey's Frontera Gang",
  description: 'A powerful smuggling empire controlling the border territories. Led by the legendary El Rey Martinez.',
  leader: {
    name: 'El Rey Martinez',
    title: 'The Border King',
    level: 40,
    maxHP: 500,
    description: 'A legendary outlaw who controls the entire Frontera region through fear and respect. Master of dual-wielding.',
    abilities: [
      'Dual Wield Mastery',
      'Call Reinforcements',
      'Border Knowledge',
      'Intimidating Presence',
    ],
    loot: {
      goldMin: 500,
      goldMax: 1000,
      uniqueItems: ["El Rey's Saber", 'Frontera Control Papers', 'Border King Crown'],
    },
  },
  strength: 150,
  specialty: [
    NPCGangSpecialty.SMUGGLING,
    NPCGangSpecialty.BORDER_RAIDS,
    NPCGangSpecialty.AMBUSHES,
  ],
  controlledZones: [
    'frontera-cantina-strip',
    'frontera-outlaws-rest',
    'frontera-smugglers-alley',
    'border-crossing',
  ],
  tributeCost: 200,
  baseTribute: 200,
  attitude: RelationshipAttitude.HOSTILE,
  backstory: 'El Rey Martinez built his empire from nothing, controlling every smuggling route across the border. His gang is fiercely loyal and will defend their territory to the death.',
  allies: [],
  enemies: [NPCGangId.RAILROAD_BARONS],
  attackPatterns: [
    {
      type: AttackType.RAID,
      frequency: 7,
      damage: {
        goldLoss: 300,
        influenceLoss: 15,
      },
      description: 'Border raiders strike your businesses and steal gold.',
    },
    {
      type: AttackType.AMBUSH,
      frequency: 5,
      damage: {
        goldLoss: 200,
        influenceLoss: 10,
      },
      description: 'Frontera gang members ambush your crew in contested territory.',
    },
    {
      type: AttackType.BLOCKADE,
      frequency: 14,
      damage: {
        goldLoss: 0,
        influenceLoss: 25,
      },
      description: 'Border blockade cuts off your smuggling income.',
    },
  ],
  missions: [
    {
      id: 'frontera-delivery-1',
      gangId: NPCGangId.EL_REY_FRONTERA,
      name: 'Border Delivery',
      description: 'Transport contraband across the border without getting caught by lawmen.',
      type: NPCMissionType.DELIVERY,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 15,
          description: 'Gang level 15 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 300,
          description: '300 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 15,
          description: '+15 reputation with El Rey',
        },
      ],
      minRelationship: -9,
      cooldown: 24,
      repeatable: true,
      difficulty: 6,
    },
    {
      id: 'frontera-protection-1',
      gangId: NPCGangId.EL_REY_FRONTERA,
      name: 'Guard the Shipment',
      description: "Protect El Rey's smuggling caravan from raiders and lawmen.",
      type: NPCMissionType.PROTECTION,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 20,
          description: 'Gang level 20 or higher',
        },
        {
          type: MissionRequirementType.GANG_SIZE,
          value: 5,
          description: 'At least 5 gang members',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 500,
          description: '500 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 25,
          description: '+25 reputation with El Rey',
        },
        {
          type: MissionRewardType.ITEMS,
          itemId: 'smuggler-pass',
          description: 'Smuggler Pass (free border crossing)',
        },
      ],
      minRelationship: 10,
      cooldown: 48,
      repeatable: true,
      difficulty: 8,
    },
    {
      id: 'frontera-sabotage-railroad',
      gangId: NPCGangId.EL_REY_FRONTERA,
      name: 'Sabotage the Railroad',
      description: 'Strike at the Railroad Barons to weaken their grip on industrial zones.',
      type: NPCMissionType.SABOTAGE,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 25,
          description: 'Gang level 25 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 400,
          description: '400 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 30,
          description: '+30 reputation with El Rey',
        },
        {
          type: MissionRewardType.INFLUENCE,
          amount: 20,
          description: '+20 influence in border zones',
        },
      ],
      minRelationship: 25,
      cooldown: 72,
      repeatable: true,
      difficulty: 9,
    },
  ],
};

/**
 * The Comanche Raiders
 * Medium-sized wilderness gang with tracking expertise
 */
export const COMANCHE_RAIDERS_GANG: NPCGang = {
  id: NPCGangId.COMANCHE_RAIDERS,
  name: 'The Comanche Raiders',
  description: 'Fierce wilderness warriors who control the sacred lands and hunting grounds.',
  leader: {
    name: 'War Chief Running Storm',
    title: 'Spirit of the Wilderness',
    level: 35,
    maxHP: 400,
    description: 'A legendary warrior with supernatural abilities and spirit wolf companions.',
    abilities: [
      'Spirit Wolf Summon',
      'Wilderness Mastery',
      'Tracking Expert',
      'Thunderstrike',
    ],
    loot: {
      goldMin: 300,
      goldMax: 600,
      uniqueItems: ['Spirit Tomahawk', 'Wolf Pelt Cloak', 'Sacred Totem'],
    },
  },
  strength: 80,
  specialty: [
    NPCGangSpecialty.TRACKING,
    NPCGangSpecialty.WILDERNESS,
    NPCGangSpecialty.HIT_AND_RUN,
  ],
  controlledZones: [
    'sacred-lands-border',
    'mesa-lookout',
    'hunting-grounds',
  ],
  tributeCost: 150,
  baseTribute: 150,
  attitude: RelationshipAttitude.NEUTRAL,
  backstory: 'The Comanche Raiders protect their ancestral lands from outsiders. They respect strength and honor, but will defend their territory fiercely.',
  allies: [],
  enemies: [NPCGangId.RAILROAD_BARONS],
  attackPatterns: [
    {
      type: AttackType.AMBUSH,
      frequency: 3,
      damage: {
        goldLoss: 150,
        influenceLoss: 20,
      },
      description: 'Raiders ambush your members in the wilderness.',
    },
    {
      type: AttackType.RAID,
      frequency: 10,
      damage: {
        goldLoss: 200,
        influenceLoss: 10,
      },
      description: 'Swift hit-and-run raid on your operations.',
    },
  ],
  missions: [
    {
      id: 'comanche-hunt-1',
      gangId: NPCGangId.COMANCHE_RAIDERS,
      name: 'Sacred Hunt',
      description: 'Join the Comanche on a sacred hunt in the wilderness.',
      type: NPCMissionType.PROTECTION,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 12,
          description: 'Gang level 12 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 200,
          description: '200 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 20,
          description: '+20 reputation with Comanche',
        },
        {
          type: MissionRewardType.ITEMS,
          itemId: 'tracking-kit',
          description: 'Expert Tracking Kit',
        },
      ],
      minRelationship: 0,
      cooldown: 48,
      repeatable: true,
      difficulty: 5,
    },
    {
      id: 'comanche-espionage-1',
      gangId: NPCGangId.COMANCHE_RAIDERS,
      name: 'Track the Railroad',
      description: 'Use your tracking skills to spy on Railroad Baron operations.',
      type: NPCMissionType.ESPIONAGE,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 18,
          description: 'Gang level 18 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 300,
          description: '300 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 25,
          description: '+25 reputation with Comanche',
        },
      ],
      minRelationship: 20,
      cooldown: 72,
      repeatable: true,
      difficulty: 7,
    },
    {
      id: 'comanche-defense-1',
      gangId: NPCGangId.COMANCHE_RAIDERS,
      name: 'Defend Sacred Lands',
      description: 'Help defend the sacred lands from invaders.',
      type: NPCMissionType.TERRITORY_DEFENSE,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 22,
          description: 'Gang level 22 or higher',
        },
        {
          type: MissionRequirementType.GANG_SIZE,
          value: 4,
          description: 'At least 4 gang members',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 350,
          description: '350 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 40,
          description: '+40 reputation with Comanche',
        },
        {
          type: MissionRewardType.TERRITORY_ACCESS,
          zoneId: 'sacred-lands-border',
          description: 'Free access to sacred lands',
        },
      ],
      minRelationship: 35,
      cooldown: 96,
      repeatable: false,
      difficulty: 8,
    },
  ],
};

/**
 * The Railroad Barons
 * Medium-large industrial gang with hired guns
 */
export const RAILROAD_BARONS_GANG: NPCGang = {
  id: NPCGangId.RAILROAD_BARONS,
  name: 'The Railroad Barons',
  description: 'Wealthy industrialists who control trade routes and business through hired guns and legal pressure.',
  leader: {
    name: 'Cornelius Blackwell',
    title: 'The Railroad Tycoon',
    level: 30,
    maxHP: 350,
    description: 'A ruthless businessman protected by elite hired guards and legal immunity.',
    abilities: [
      'Elite Guard Summon',
      'Business Tactics',
      'Legal Immunity',
      'Industrial Resources',
    ],
    loot: {
      goldMin: 400,
      goldMax: 800,
      uniqueItems: ['Railroad Stock Certificates', 'Gold Pocket Watch', 'Tycoon Suit'],
    },
  },
  strength: 100,
  specialty: [
    NPCGangSpecialty.INDUSTRIAL,
    NPCGangSpecialty.HIRED_GUNS,
    NPCGangSpecialty.LEGAL_PRESSURE,
  ],
  controlledZones: [
    'whiskey-bend-docks',
    'mining-camp-influence',
    'trade-route-junction',
    'railroad-depot',
    'whiskey-bend-industrial-quarter',
  ],
  tributeCost: 300,
  baseTribute: 300,
  attitude: RelationshipAttitude.NEUTRAL,
  backstory: 'The Railroad Barons built their fortune on steel and steam. They prefer business deals to violence, but have deep pockets for hiring the best guns.',
  allies: [NPCGangId.BANKERS_SYNDICATE],
  enemies: [NPCGangId.EL_REY_FRONTERA, NPCGangId.COMANCHE_RAIDERS],
  attackPatterns: [
    {
      type: AttackType.BLOCKADE,
      frequency: 7,
      damage: {
        goldLoss: 0,
        influenceLoss: 30,
      },
      description: 'Railroad blockade cuts off trade routes.',
    },
    {
      type: AttackType.RAID,
      frequency: 14,
      damage: {
        goldLoss: 400,
        influenceLoss: 15,
      },
      description: 'Hired guns raid your businesses.',
    },
    {
      type: AttackType.ASSASSINATION,
      frequency: 30,
      damage: {
        goldLoss: 500,
        influenceLoss: 25,
      },
      description: 'Elite assassin targets your gang leadership.',
    },
  ],
  missions: [
    {
      id: 'railroad-protection-1',
      gangId: NPCGangId.RAILROAD_BARONS,
      name: 'Guard the Shipment',
      description: 'Protect a valuable railroad shipment from bandits.',
      type: NPCMissionType.PROTECTION,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 15,
          description: 'Gang level 15 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 400,
          description: '400 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 15,
          description: '+15 reputation with Railroad Barons',
        },
      ],
      minRelationship: 0,
      cooldown: 48,
      repeatable: true,
      difficulty: 6,
    },
    {
      id: 'railroad-sabotage-frontera',
      gangId: NPCGangId.RAILROAD_BARONS,
      name: 'Disrupt Smuggling',
      description: "Sabotage El Rey's smuggling operations along the border.",
      type: NPCMissionType.SABOTAGE,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 20,
          description: 'Gang level 20 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 500,
          description: '500 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 25,
          description: '+25 reputation with Railroad Barons',
        },
      ],
      minRelationship: 15,
      cooldown: 72,
      repeatable: true,
      difficulty: 8,
    },
    {
      id: 'railroad-delivery-1',
      gangId: NPCGangId.RAILROAD_BARONS,
      name: 'Industrial Supply Run',
      description: 'Deliver industrial supplies to remote mining operations.',
      type: NPCMissionType.DELIVERY,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 18,
          description: 'Gang level 18 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 450,
          description: '450 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 20,
          description: '+20 reputation with Railroad Barons',
        },
        {
          type: MissionRewardType.ITEMS,
          itemId: 'railroad-pass',
          description: 'Railroad Pass (fast travel)',
        },
      ],
      minRelationship: 25,
      cooldown: 48,
      repeatable: true,
      difficulty: 7,
    },
  ],
};

/**
 * The Banker's Syndicate
 * Small but wealthy gang focused on corruption and economics
 */
export const BANKERS_SYNDICATE_GANG: NPCGang = {
  id: NPCGangId.BANKERS_SYNDICATE,
  name: "The Banker's Syndicate",
  description: 'A small but extremely wealthy criminal organization that controls finances through corruption and assassination.',
  leader: {
    name: 'Augustus Sterling III',
    title: 'The Money Man',
    level: 25,
    maxHP: 250,
    description: 'Physically weak but protected by layers of bodyguards, lawyers, and dirty money.',
    abilities: [
      'Bribery Master',
      'Legal Immunity',
      'Assassin Network',
      'Economic Manipulation',
    ],
    loot: {
      goldMin: 600,
      goldMax: 1200,
      uniqueItems: ['Bank Vault Key', 'Blackmail Documents', 'Sterling Fortune'],
    },
  },
  strength: 60,
  specialty: [
    NPCGangSpecialty.ECONOMIC_WARFARE,
    NPCGangSpecialty.CORRUPTION,
    NPCGangSpecialty.ASSASSINATION,
  ],
  controlledZones: [
    'red-gulch-market-square',
    'red-gulch-mining-office-district',
  ],
  tributeCost: 400,
  baseTribute: 400,
  attitude: RelationshipAttitude.NEUTRAL,
  backstory: 'The Banker\'s Syndicate controls the flow of money in Sangre Territory. They prefer deals to fights, but their assassins are the best money can buy.',
  allies: [NPCGangId.RAILROAD_BARONS],
  enemies: [],
  attackPatterns: [
    {
      type: AttackType.ASSASSINATION,
      frequency: 21,
      damage: {
        goldLoss: 600,
        influenceLoss: 20,
      },
      description: 'Professional assassin eliminates key gang member.',
    },
    {
      type: AttackType.RAID,
      frequency: 30,
      damage: {
        goldLoss: 800,
        influenceLoss: 10,
      },
      description: 'Economic pressure drains your resources.',
    },
  ],
  missions: [
    {
      id: 'banker-collection-1',
      gangId: NPCGangId.BANKERS_SYNDICATE,
      name: 'Debt Collection',
      description: 'Collect debts from those who owe the Syndicate.',
      type: NPCMissionType.PROTECTION,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 12,
          description: 'Gang level 12 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 350,
          description: '350 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 15,
          description: '+15 reputation with Bankers',
        },
      ],
      minRelationship: 0,
      cooldown: 48,
      repeatable: true,
      difficulty: 5,
    },
    {
      id: 'banker-espionage-1',
      gangId: NPCGangId.BANKERS_SYNDICATE,
      name: 'Financial Espionage',
      description: 'Gather financial intelligence on rival gangs.',
      type: NPCMissionType.ESPIONAGE,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 18,
          description: 'Gang level 18 or higher',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 500,
          description: '500 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 25,
          description: '+25 reputation with Bankers',
        },
      ],
      minRelationship: 20,
      cooldown: 72,
      repeatable: true,
      difficulty: 7,
    },
    {
      id: 'banker-assassination-1',
      gangId: NPCGangId.BANKERS_SYNDICATE,
      name: 'Contract Kill',
      description: 'Eliminate a business rival for the Syndicate.',
      type: NPCMissionType.ASSASSINATION,
      requirements: [
        {
          type: MissionRequirementType.LEVEL,
          value: 25,
          description: 'Gang level 25 or higher',
        },
        {
          type: MissionRequirementType.REPUTATION,
          value: 40,
          description: '40+ reputation with Bankers',
        },
      ],
      rewards: [
        {
          type: MissionRewardType.GOLD,
          amount: 800,
          description: '800 gold payment',
        },
        {
          type: MissionRewardType.REPUTATION,
          amount: 35,
          description: '+35 reputation with Bankers',
        },
        {
          type: MissionRewardType.ITEMS,
          itemId: 'bank-access',
          description: 'Bank Vault Access',
        },
      ],
      minRelationship: 40,
      cooldown: 96,
      repeatable: false,
      difficulty: 10,
    },
  ],
};

/**
 * All NPC Gangs
 */
export const ALL_NPC_GANGS: NPCGang[] = [
  EL_REY_FRONTERA_GANG,
  COMANCHE_RAIDERS_GANG,
  RAILROAD_BARONS_GANG,
  BANKERS_SYNDICATE_GANG,
];

/**
 * Get NPC Gang by ID
 */
export function getNPCGangById(gangId: NPCGangId): NPCGang | undefined {
  return ALL_NPC_GANGS.find(gang => gang.id === gangId);
}

/**
 * Get NPC Gangs by zone
 */
export function getNPCGangsByZone(zoneId: string): NPCGang[] {
  return ALL_NPC_GANGS.filter(gang => gang.controlledZones.includes(zoneId));
}
