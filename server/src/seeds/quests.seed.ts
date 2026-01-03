/**
 * Quests Seed Data
 * Seed the database with starter quests
 */

import { QuestDefinition } from '../models/Quest.model';
import { ALL_STARTER_QUESTS } from '../data/quests/starter-quests';

// Legacy quests kept for reference - actual seeding uses ALL_STARTER_QUESTS
const legacyQuests = [
  // Main Story Quests
  {
    questId: 'welcome-to-frontier',
    name: 'Welcome to the Frontier',
    description: 'Get acquainted with life on the frontier. Visit the main locations and learn the ropes.',
    type: 'main',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'visit-saloon',
        description: 'Visit the Saloon',
        type: 'visit',
        target: 'location:saloon',
        required: 1
      },
      {
        id: 'visit-shop',
        description: 'Visit the General Store',
        type: 'visit',
        target: 'location:shop',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 50 }
    ],
    repeatable: false
  },
  {
    questId: 'first-blood',
    name: 'First Blood',
    description: 'Prove yourself in combat against local troublemakers.',
    type: 'main',
    levelRequired: 1,
    prerequisites: ['welcome-to-frontier'],
    objectives: [
      {
        id: 'defeat-enemies',
        description: 'Defeat 3 enemies in combat',
        type: 'kill',
        target: 'any',
        required: 3
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 100 },
      { type: 'item', itemId: 'bandages' }
    ],
    repeatable: false
  },
  {
    questId: 'outlaw-ways',
    name: 'The Outlaw Ways',
    description: 'Sometimes you gotta bend the law to survive. Commit some petty crimes to get by.',
    type: 'main',
    levelRequired: 2,
    prerequisites: ['first-blood'],
    objectives: [
      {
        id: 'commit-crimes',
        description: 'Successfully commit 5 crimes',
        type: 'crime',
        target: 'any',
        required: 5
      }
    ],
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 150 }
    ],
    repeatable: false
  },

  // Side Quests
  {
    questId: 'gold-digger',
    name: 'Gold Digger',
    description: 'Build up your fortune through any means necessary.',
    type: 'side',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'earn-gold',
        description: 'Earn 500 gold',
        type: 'gold',
        target: 'earned',
        required: 500
      }
    ],
    rewards: [
      { type: 'xp', amount: 100 },
      { type: 'item', itemId: 'whiskey' }
    ],
    repeatable: false
  },
  {
    questId: 'combat-veteran',
    name: 'Combat Veteran',
    description: 'Prove your worth in extended combat operations.',
    type: 'side',
    levelRequired: 3,
    prerequisites: ['first-blood'],
    objectives: [
      {
        id: 'defeat-many',
        description: 'Defeat 20 enemies',
        type: 'kill',
        target: 'any',
        required: 20
      }
    ],
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 300 },
      { type: 'item', itemId: 'six-shooter' }
    ],
    repeatable: false
  },
  {
    questId: 'skill-student',
    name: 'Skill Student',
    description: 'Develop your abilities by training skills.',
    type: 'side',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'train-skills',
        description: 'Complete 3 skill training sessions',
        type: 'skill',
        target: 'any',
        required: 3
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 200 }
    ],
    repeatable: false
  },

  // Daily Quests
  {
    questId: 'daily-scuffle',
    name: 'Daily Scuffle',
    description: 'Keep your skills sharp with daily combat practice.',
    type: 'daily',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'daily-combat',
        description: 'Win 2 combats today',
        type: 'kill',
        target: 'any',
        required: 2
      }
    ],
    rewards: [
      { type: 'gold', amount: 50 },
      { type: 'xp', amount: 25 }
    ],
    timeLimit: 1440, // 24 hours
    repeatable: true
  },
  {
    questId: 'daily-mischief',
    name: 'Daily Mischief',
    description: 'A little crime keeps life interesting.',
    type: 'daily',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'daily-crime',
        description: 'Commit 2 crimes today',
        type: 'crime',
        target: 'any',
        required: 2
      }
    ],
    rewards: [
      { type: 'gold', amount: 75 },
      { type: 'xp', amount: 30 }
    ],
    timeLimit: 1440,
    repeatable: true
  },

  // Weekly Quests
  {
    questId: 'weekly-warrior',
    name: 'Weekly Warrior',
    description: 'Dominate in combat throughout the week.',
    type: 'weekly',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'weekly-kills',
        description: 'Defeat 50 enemies this week',
        type: 'kill',
        target: 'any',
        required: 50
      }
    ],
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'tequila' }
    ],
    timeLimit: 10080, // 7 days
    repeatable: true
  },

  // ========================================
  // RED GULCH NPC QUESTS
  // ========================================

  // SHERIFF JOHN HAWK QUESTS
  {
    questId: 'track-outlaw',
    name: 'Track the Outlaw',
    description: 'Sheriff Hawk needs a tracker to hunt down Rattlesnake Jake, a notorious horse thief who\'s been raiding ranches north of Red Gulch. Follow the trail and bring him in - dead or alive.',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'speak-sheriff',
        description: 'Get the details from Sheriff Hawk',
        type: 'visit',
        target: 'npc:sheriff-john-hawk',
        required: 1
      },
      {
        id: 'track-jake',
        description: 'Track Rattlesnake Jake through the badlands',
        type: 'skill',
        target: 'skill:tracking',
        required: 1
      },
      {
        id: 'defeat-jake',
        description: 'Bring down Rattlesnake Jake',
        type: 'kill',
        target: 'npc:rattlesnake-jake',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 150 },
      { type: 'reputation', amount: 40 }
    ],
    repeatable: false
  },
  {
    questId: 'clear-bounty',
    name: 'Clear the Bounty',
    description: 'The Deacon Gang has been terrorizing Red Gulch. Sheriff Hawk wants you to visit three locations to gather intelligence on their hideout before organizing a raid.',
    type: 'side',
    levelRequired: 6,
    prerequisites: ['track-outlaw'],
    objectives: [
      {
        id: 'visit-saloon',
        description: 'Question Whiskey Pete at the Golden Spur',
        type: 'visit',
        target: 'location:golden-spur-saloon',
        required: 1
      },
      {
        id: 'visit-ranch',
        description: 'Check the raided Brennan Ranch for clues',
        type: 'visit',
        target: 'location:brennan-ranch',
        required: 1
      },
      {
        id: 'visit-canyon',
        description: 'Scout the suspected hideout in Copper Canyon',
        type: 'visit',
        target: 'location:copper-canyon',
        required: 1
      },
      {
        id: 'report-hawk',
        description: 'Report your findings to Sheriff Hawk',
        type: 'visit',
        target: 'npc:sheriff-john-hawk',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 250 },
      { type: 'xp', amount: 200 },
      { type: 'reputation', amount: 50 }
    ],
    repeatable: false
  },
  {
    questId: 'deputys-duty',
    name: "Deputy's Duty",
    description: 'Walk the streets of Red Gulch with Deputy Mills and help keep the peace. A simple patrol job that pays regular wages.',
    type: 'daily',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'patrol-streets',
        description: 'Complete 3 patrol circuits around Red Gulch',
        type: 'visit',
        target: 'location:red-gulch',
        required: 3
      },
      {
        id: 'stop-crime',
        description: 'Intervene in 1 criminal activity',
        type: 'crime',
        target: 'prevent',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 50 },
      { type: 'xp', amount: 30 },
      { type: 'reputation', amount: 10 }
    ],
    timeLimit: 1440,
    repeatable: true
  },

  // WHISKEY PETE QUESTS
  {
    questId: 'petes-rumor-mill',
    name: "Pete's Rumor Mill",
    description: 'Old Whiskey Pete hears everything that goes on in Red Gulch. He\'ll share what he knows - for a price, or if you do him a favor.',
    type: 'side',
    levelRequired: 2,
    prerequisites: [],
    objectives: [
      {
        id: 'buy-drinks',
        description: 'Buy a round for Pete and the regulars',
        type: 'gold',
        target: 'spent',
        required: 25
      },
      {
        id: 'listen-stories',
        description: 'Sit and listen to Pete\'s stories',
        type: 'visit',
        target: 'npc:whiskey-pete',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 100 },
      { type: 'item', itemId: 'valuable-information' }
    ],
    repeatable: false
  },
  {
    questId: 'troublemaker-ejection',
    name: 'Troublemaker Ejection',
    description: 'A rowdy drunk is causing problems at the Golden Spur. Pete needs someone with muscle to escort him out - peacefully if possible.',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'confront-drunk',
        description: 'Deal with the troublemaker',
        type: 'skill',
        target: 'choice:persuade-intimidate-fight',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 40 },
      { type: 'xp', amount: 50 },
      { type: 'item', itemId: 'whiskey' }
    ],
    repeatable: true
  },

  // MARTHA CHEN QUESTS
  {
    questId: 'supply-wagon-escort',
    name: 'Supply Wagon Escort',
    description: 'Martha Chen has a wagon of goods coming from the railhead, but bandits have been hitting supply trains. She needs a guard to escort her shipment safely to Red Gulch.',
    type: 'side',
    levelRequired: 4,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-wagon',
        description: 'Meet the supply wagon at the railhead',
        type: 'visit',
        target: 'location:railhead-depot',
        required: 1
      },
      {
        id: 'defend-wagon',
        description: 'Defend the wagon from bandits',
        type: 'kill',
        target: 'npc:bandit',
        required: 4
      },
      {
        id: 'deliver-safely',
        description: 'Deliver the wagon to Miner\'s Supply Co',
        type: 'visit',
        target: 'location:miners-supply',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 180 },
      { type: 'xp', amount: 140 },
      { type: 'item', itemId: 'supply-discount-token' }
    ],
    repeatable: false
  },
  {
    questId: 'inventory-audit',
    name: 'Inventory Audit',
    description: 'Martha suspects one of her employees is skimming stock. Help her conduct a full inventory and catch the thief.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'count-inventory',
        description: 'Conduct a complete inventory audit',
        type: 'skill',
        target: 'skill:appraisal',
        required: 1
      },
      {
        id: 'find-thief',
        description: 'Identify the employee stealing from Martha',
        type: 'skill',
        target: 'skill:investigation',
        required: 1
      },
      {
        id: 'confront-thief',
        description: 'Confront the thief - turn them in, fire them, or make a deal',
        type: 'skill',
        target: 'choice:law-mercy-profit',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 180 },
      { type: 'reputation', amount: 30 }
    ],
    repeatable: false
  },

  // CORNELIUS FINCH (BANKER) QUESTS
  {
    questId: 'ledger-recovery',
    name: 'Ledger Recovery',
    description: 'Finch\'s ledger containing sensitive financial records was stolen during a break-in. He needs it recovered before the information falls into the wrong hands.',
    type: 'side',
    levelRequired: 7,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate-bank',
        description: 'Investigate the bank break-in scene',
        type: 'visit',
        target: 'location:red-gulch-bank',
        required: 1
      },
      {
        id: 'track-thieves',
        description: 'Track down the thieves to their hideout',
        type: 'skill',
        target: 'skill:tracking',
        required: 1
      },
      {
        id: 'recover-ledger',
        description: 'Retrieve the stolen ledger',
        type: 'collect',
        target: 'item:bank-ledger',
        required: 1
      },
      {
        id: 'return-ledger',
        description: 'Return the ledger to Finch - or read it first',
        type: 'skill',
        target: 'choice:return-read-sell',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 250 },
      { type: 'reputation', amount: 60 }
    ],
    repeatable: false
  },
  {
    questId: 'debt-collection',
    name: 'Debt Collection',
    description: 'A prospector owes the bank a substantial sum and has been avoiding Finch. Collect the debt by any means necessary.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'locate-debtor',
        description: 'Find the prospector who owes the bank',
        type: 'visit',
        target: 'npc:deadbeat-prospector',
        required: 1
      },
      {
        id: 'collect-payment',
        description: 'Collect the debt - payment, collateral, or labor',
        type: 'skill',
        target: 'choice:gold-goods-service',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 120 },
      { type: 'xp', amount: 100 },
      { type: 'reputation', amount: 20 }
    ],
    repeatable: true
  },

  // IRON JAKE QUESTS
  {
    questId: 'quality-ore-needed',
    name: 'Quality Ore Needed',
    description: 'Iron Jake needs quality iron ore for a special commission. Find him the best ore in the territory.',
    type: 'side',
    levelRequired: 6,
    prerequisites: [],
    objectives: [
      {
        id: 'find-ore',
        description: 'Mine or purchase 10 units of quality iron ore',
        type: 'collect',
        target: 'item:quality-iron-ore',
        required: 10
      },
      {
        id: 'deliver-ore',
        description: 'Deliver the ore to Iron Jake',
        type: 'visit',
        target: 'npc:iron-jake',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 150 },
      { type: 'item', itemId: 'custom-weapon-discount' }
    ],
    repeatable: false
  },
  {
    questId: 'forge-apprentice',
    name: 'Forge Apprentice',
    description: 'Learn the basics of blacksmithing by assisting Iron Jake with his work. Hard labor, but valuable skills.',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'work-bellows',
        description: 'Pump the bellows for 3 forging sessions',
        type: 'skill',
        target: 'job:forge-assistant',
        required: 3
      },
      {
        id: 'craft-horseshoe',
        description: 'Successfully craft a horseshoe under Jake\'s guidance',
        type: 'skill',
        target: 'skill:crafting',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 200 },
      { type: 'item', itemId: 'apprentice-hammer' }
    ],
    repeatable: false
  },

  // DOC MORRISON QUESTS
  {
    questId: 'medical-supply-run',
    name: 'Medical Supply Run',
    description: 'Doc Morrison is running low on laudanum and carbolic acid. Make a supply run to the nearest territorial depot.',
    type: 'side',
    levelRequired: 4,
    prerequisites: [],
    objectives: [
      {
        id: 'travel-depot',
        description: 'Travel to the territorial medical depot',
        type: 'visit',
        target: 'location:medical-depot',
        required: 1
      },
      {
        id: 'purchase-supplies',
        description: 'Purchase medical supplies',
        type: 'gold',
        target: 'spent',
        required: 100
      },
      {
        id: 'return-safely',
        description: 'Return the supplies to Doc Morrison',
        type: 'visit',
        target: 'npc:doc-morrison',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 120 },
      { type: 'item', itemId: 'medical-supplies' }
    ],
    repeatable: true
  },
  {
    questId: 'emergency-surgery',
    name: 'Emergency Surgery',
    description: 'A miner was crushed in a cave-in. Doc Morrison needs an assistant for emergency surgery. Keep your hands steady and your stomach strong.',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'assist-surgery',
        description: 'Assist Doc Morrison with the surgery',
        type: 'skill',
        target: 'skill:medicine',
        required: 1
      },
      {
        id: 'fetch-supplies',
        description: 'Fetch surgical supplies during the operation',
        type: 'skill',
        target: 'skill:timed-action',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 80 },
      { type: 'xp', amount: 200 },
      { type: 'reputation', amount: 40 }
    ],
    repeatable: false
  },

  // AGNES MILLER (HOTEL) QUESTS
  {
    questId: 'rowdy-guests',
    name: 'Rowdy Guests',
    description: 'Three drunk cowboys are tearing up the hotel. Agnes needs someone to restore order before they wreck the place.',
    type: 'side',
    levelRequired: 4,
    prerequisites: [],
    objectives: [
      {
        id: 'calm-cowboys',
        description: 'Deal with the rowdy cowboys',
        type: 'skill',
        target: 'choice:talk-threaten-fight',
        required: 1
      },
      {
        id: 'repair-damage',
        description: 'Pay for damages or help repair what broke',
        type: 'skill',
        target: 'choice:pay-repair',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 60 },
      { type: 'xp', amount: 80 },
      { type: 'item', itemId: 'free-room-voucher' }
    ],
    repeatable: true
  },
  {
    questId: 'agness-secret',
    name: "Agnes's Secret",
    description: 'A mysterious guest has been staying at the hotel for weeks, paying in gold but never leaving their room. Agnes suspects something illegal. Investigate without causing a scene.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate-guest',
        description: 'Discreetly investigate the mysterious guest',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      },
      {
        id: 'search-room',
        description: 'Search the guest\'s room when they\'re out',
        type: 'visit',
        target: 'location:hotel-room-13',
        required: 1
      },
      {
        id: 'discover-truth',
        description: 'Uncover what the guest is hiding',
        type: 'collect',
        target: 'item:hidden-evidence',
        required: 1
      },
      {
        id: 'report-agnes',
        description: 'Decide what to tell Agnes - truth, lie, or blackmail',
        type: 'skill',
        target: 'choice:truth-lie-blackmail',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 250 },
      { type: 'xp', amount: 300 },
      { type: 'reputation', amount: 50 }
    ],
    repeatable: false
  },

  // ========================================
  // KAIOWA MESA NPC QUESTS
  // ========================================

  // WISE SKY (ELDER SHAMAN) QUESTS
  {
    questId: 'vision-quest',
    name: 'Vision Quest',
    description: 'Elder Wise Sky believes you have potential to see beyond the veil. Undertake a traditional vision quest to commune with the spirits and learn your true path.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'purification-ritual',
        description: 'Undergo purification at the Spirit Lodge',
        type: 'visit',
        target: 'location:spirit-lodge',
        required: 1
      },
      {
        id: 'consume-herbs',
        description: 'Consume the vision herbs prepared by Wise Sky',
        type: 'skill',
        target: 'item:vision-herbs',
        required: 1
      },
      {
        id: 'night-vigil',
        description: 'Spend the night at Thunderbird\'s Perch',
        type: 'visit',
        target: 'location:thunderbirds-perch',
        required: 1
      },
      {
        id: 'interpret-vision',
        description: 'Return and discuss your vision with Wise Sky',
        type: 'visit',
        target: 'npc:wise-sky',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 400 },
      { type: 'item', itemId: 'spirit-vision-buff' },
      { type: 'reputation', amount: 75 }
    ],
    repeatable: false
  },
  {
    questId: 'spirit-trial',
    name: 'The Spirit Trial',
    description: 'Wise Sky has seen darkness gathering around you. Face three spiritual trials to cleanse your soul and prove your worthiness to the spirits.',
    type: 'side',
    levelRequired: 12,
    prerequisites: ['vision-quest'],
    objectives: [
      {
        id: 'trial-courage',
        description: 'Face your deepest fear at the Cave of Echoes',
        type: 'visit',
        target: 'location:cave-of-echoes',
        required: 1
      },
      {
        id: 'trial-wisdom',
        description: 'Solve the riddle of the ancient petroglyphs',
        type: 'skill',
        target: 'skill:cunning',
        required: 1
      },
      {
        id: 'trial-strength',
        description: 'Defeat the spirit guardian in single combat',
        type: 'kill',
        target: 'npc:spirit-guardian',
        required: 1
      },
      {
        id: 'receive-blessing',
        description: 'Receive Wise Sky\'s blessing',
        type: 'visit',
        target: 'npc:wise-sky',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 350 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'spirit-blessed-totem' },
      { type: 'reputation', amount: 100 }
    ],
    repeatable: false
  },

  // STONE BEAR (PEACEKEEPER CHIEF) QUESTS
  {
    questId: 'track-dishonorable',
    name: 'Track the Dishonorable',
    description: 'A Nahi warrior has broken the sacred laws and fled the mesa. Stone Bear tasks you with tracking them down and bringing them to justice.',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'accept-mission',
        description: 'Receive the details from Stone Bear',
        type: 'visit',
        target: 'npc:stone-bear',
        required: 1
      },
      {
        id: 'track-fugitive',
        description: 'Track the fugitive through the wilderness',
        type: 'skill',
        target: 'skill:tracking',
        required: 1
      },
      {
        id: 'confront-fugitive',
        description: 'Apprehend or eliminate the fugitive',
        type: 'kill',
        target: 'npc:dishonored-warrior',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 280 },
      { type: 'xp', amount: 320 },
      { type: 'reputation', amount: 80 }
    ],
    repeatable: false
  },
  {
    questId: 'defend-mesa',
    name: 'Defend the Mesa',
    description: 'Settler scouts have been spotted near sacred ground. Stone Bear needs warriors to defend Kaiowa Mesa from encroachment.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'scout-perimeter',
        description: 'Scout the mesa perimeter for intruders',
        type: 'visit',
        target: 'location:mesa-perimeter',
        required: 3
      },
      {
        id: 'confront-settlers',
        description: 'Drive off or eliminate settler scouts',
        type: 'kill',
        target: 'npc:settler-scout',
        required: 5
      },
      {
        id: 'report-stone-bear',
        description: 'Report back to Stone Bear',
        type: 'visit',
        target: 'npc:stone-bear',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 350 },
      { type: 'reputation', amount: 90 }
    ],
    repeatable: true
  },

  // RED THUNDER (WAR CHIEF) QUESTS
  {
    questId: 'war-party',
    name: 'Join the War Party',
    description: 'Red Thunder is assembling a war party to strike at settler expansion. Prove your worth and ride with the Coalition\'s finest warriors.',
    type: 'side',
    levelRequired: 15,
    prerequisites: [],
    objectives: [
      {
        id: 'prove-worth',
        description: 'Demonstrate your combat skills to Red Thunder',
        type: 'skill',
        target: 'skill:combat',
        required: 1
      },
      {
        id: 'join-raid',
        description: 'Participate in the raid on settler outposts',
        type: 'kill',
        target: 'npc:settler-soldier',
        required: 8
      },
      {
        id: 'return-victorious',
        description: 'Return to Kaiowa Mesa with the war party',
        type: 'visit',
        target: 'location:council-fire',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 450 },
      { type: 'xp', amount: 600 },
      { type: 'item', itemId: 'war-chiefs-favor' },
      { type: 'reputation', amount: 120 }
    ],
    repeatable: false
  },
  {
    questId: 'defend-territory',
    name: 'Defend Coalition Territory',
    description: 'Settlers are building a fort on Coalition land. Red Thunder commands you to destroy it before it\'s completed.',
    type: 'side',
    levelRequired: 18,
    prerequisites: ['war-party'],
    objectives: [
      {
        id: 'scout-fort',
        description: 'Scout the fort under construction',
        type: 'visit',
        target: 'location:settler-fort-construction',
        required: 1
      },
      {
        id: 'sabotage-supplies',
        description: 'Destroy construction supplies',
        type: 'skill',
        target: 'skill:sabotage',
        required: 1
      },
      {
        id: 'defeat-garrison',
        description: 'Eliminate the garrison',
        type: 'kill',
        target: 'npc:fort-defender',
        required: 10
      }
    ],
    rewards: [
      { type: 'gold', amount: 550 },
      { type: 'xp', amount: 700 },
      { type: 'reputation', amount: 130 }
    ],
    repeatable: false
  },
  {
    questId: 'raid-enemy',
    name: 'Raid Enemy Supply Lines',
    description: 'Cut off settler expansion by raiding their supply wagons. Red Thunder wants them to know the Coalition is not to be trifled with.',
    type: 'side',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'locate-convoy',
        description: 'Find the settler supply convoy',
        type: 'visit',
        target: 'location:mountain-pass',
        required: 1
      },
      {
        id: 'ambush-convoy',
        description: 'Ambush and defeat the convoy guards',
        type: 'kill',
        target: 'npc:convoy-guard',
        required: 6
      },
      {
        id: 'capture-supplies',
        description: 'Capture or destroy the supplies',
        type: 'skill',
        target: 'choice:capture-destroy',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 400 },
      { type: 'xp', amount: 450 },
      { type: 'item', itemId: 'captured-supplies' },
      { type: 'reputation', amount: 100 }
    ],
    repeatable: true
  },

  // HEALING HAND (MEDICINE WOMAN) QUESTS
  {
    questId: 'gather-sacred-herbs',
    name: 'Gather Sacred Herbs',
    description: 'Healing Hand needs rare medicinal herbs that only grow in dangerous areas. Collect them for her healing work.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'find-moonflower',
        description: 'Gather moonflower that blooms only at night',
        type: 'collect',
        target: 'item:moonflower',
        required: 5
      },
      {
        id: 'find-serpent-root',
        description: 'Dig up serpent root from the canyon',
        type: 'collect',
        target: 'item:serpent-root',
        required: 3
      },
      {
        id: 'find-eagle-moss',
        description: 'Climb to the high places for eagle moss',
        type: 'collect',
        target: 'item:eagle-moss',
        required: 4
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 200 },
      { type: 'item', itemId: 'healing-poultice' },
      { type: 'reputation', amount: 50 }
    ],
    repeatable: true
  },
  {
    questId: 'plague-cure',
    name: 'Cure the Plague',
    description: 'A mysterious illness is spreading through a nearby Nahi village. Healing Hand needs your help gathering rare ingredients for a cure.',
    type: 'side',
    levelRequired: 14,
    prerequisites: [],
    objectives: [
      {
        id: 'study-illness',
        description: 'Visit the afflicted village and study symptoms',
        type: 'visit',
        target: 'location:afflicted-village',
        required: 1
      },
      {
        id: 'find-ingredients',
        description: 'Gather the three sacred cure ingredients',
        type: 'collect',
        target: 'item:cure-ingredients',
        required: 3
      },
      {
        id: 'brew-medicine',
        description: 'Help Healing Hand brew the cure',
        type: 'skill',
        target: 'skill:medicine',
        required: 1
      },
      {
        id: 'distribute-cure',
        description: 'Distribute the cure to the sick',
        type: 'visit',
        target: 'location:afflicted-village',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 400 },
      { type: 'xp', amount: 550 },
      { type: 'item', itemId: 'healers-blessing' },
      { type: 'reputation', amount: 150 }
    ],
    repeatable: false
  },

  // ========================================
  // FRONTERA NPC QUESTS
  // ========================================

  // ROSA MUERTE (CANTINA OWNER) QUESTS
  {
    questId: 'prove-yourself-frontera',
    name: 'Prove Yourself',
    description: 'Rosa Muerte doesn\'t trust newcomers easily. Complete a crime job to prove you\'re not a settler spy.',
    type: 'side',
    levelRequired: 4,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-rosa',
        description: 'Speak with Rosa Muerte at La Cantina del Diablo',
        type: 'visit',
        target: 'npc:rosa-muerte',
        required: 1
      },
      {
        id: 'commit-crime',
        description: 'Successfully commit 1 serious crime',
        type: 'crime',
        target: 'high-risk',
        required: 1
      },
      {
        id: 'report-rosa',
        description: 'Report your success to Rosa',
        type: 'visit',
        target: 'npc:rosa-muerte',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 180 },
      { type: 'reputation', amount: 60 }
    ],
    repeatable: false
  },
  {
    questId: 'revolucionario-recruitment',
    name: 'Revolucionario Recruitment',
    description: 'The revolution needs bodies. Rosa wants you to recruit sympathizers from Red Gulch without attracting sheriff attention.',
    type: 'side',
    levelRequired: 10,
    prerequisites: ['prove-yourself-frontera'],
    objectives: [
      {
        id: 'identify-targets',
        description: 'Identify potential recruits in Red Gulch',
        type: 'visit',
        target: 'location:red-gulch',
        required: 1
      },
      {
        id: 'recruit-fighters',
        description: 'Convince 3 people to join the cause',
        type: 'skill',
        target: 'skill:persuasion',
        required: 3
      },
      {
        id: 'avoid-law',
        description: 'Return to Frontera without being followed',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 350 },
      { type: 'xp', amount: 400 },
      { type: 'reputation', amount: 90 }
    ],
    repeatable: false
  },

  // SANGRE (PIT MASTER) QUESTS
  {
    questId: 'prove-yourself-pit',
    name: 'Prove Yourself in The Pit',
    description: 'Sangre won\'t let just anyone fight in The Pit. Win three preliminary fights to earn your place in the real matches.',
    type: 'side',
    levelRequired: 6,
    prerequisites: [],
    objectives: [
      {
        id: 'win-prelim-1',
        description: 'Win your first preliminary fight',
        type: 'kill',
        target: 'npc:pit-challenger',
        required: 1
      },
      {
        id: 'win-prelim-2',
        description: 'Win your second preliminary fight',
        type: 'kill',
        target: 'npc:pit-challenger',
        required: 1
      },
      {
        id: 'win-prelim-3',
        description: 'Win your third preliminary fight',
        type: 'kill',
        target: 'npc:pit-challenger',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 250 },
      { type: 'xp', amount: 300 },
      { type: 'item', itemId: 'pit-fighter-brand' }
    ],
    repeatable: false
  },
  {
    questId: 'championship-fight',
    name: 'Championship Fight',
    description: 'You\'ve fought your way to the top. Now face El Toro, the undefeated champion of The Pit, for ultimate glory.',
    type: 'side',
    levelRequired: 20,
    prerequisites: ['prove-yourself-pit'],
    objectives: [
      {
        id: 'train-hard',
        description: 'Complete intensive training',
        type: 'skill',
        target: 'job:pit-fighter',
        required: 5
      },
      {
        id: 'defeat-champion',
        description: 'Defeat El Toro in the championship bout',
        type: 'kill',
        target: 'npc:el-toro',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 800 },
      { type: 'xp', amount: 900 },
      { type: 'item', itemId: 'pit-champion-belt' },
      { type: 'reputation', amount: 150 }
    ],
    repeatable: false
  },

  // LA SOMBRA (SMUGGLER BOSS) QUESTS
  {
    questId: 'smuggle-cargo',
    name: 'Smuggle the Cargo',
    description: 'La Sombra has a shipment of illegal firearms that needs to get across the border. Get it there without attracting law enforcement.',
    type: 'side',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'receive-cargo',
        description: 'Pick up the cargo from the Smuggler\'s Den',
        type: 'visit',
        target: 'location:smugglers-den',
        required: 1
      },
      {
        id: 'evade-patrols',
        description: 'Cross the territory avoiding law patrols',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      },
      {
        id: 'deliver-cargo',
        description: 'Deliver the cargo to the buyer',
        type: 'visit',
        target: 'location:border-crossing',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 450 },
      { type: 'xp', amount: 500 },
      { type: 'reputation', amount: 100 }
    ],
    repeatable: true
  },
  {
    questId: 'establish-route',
    name: 'Establish New Route',
    description: 'Law enforcement has shut down La Sombra\'s best smuggling route. Scout and establish a new one through dangerous territory.',
    type: 'side',
    levelRequired: 16,
    prerequisites: ['smuggle-cargo'],
    objectives: [
      {
        id: 'scout-territory',
        description: 'Scout three potential route locations',
        type: 'visit',
        target: 'location:wild-territory',
        required: 3
      },
      {
        id: 'clear-threats',
        description: 'Eliminate threats along the chosen route',
        type: 'kill',
        target: 'npc:territory-threat',
        required: 8
      },
      {
        id: 'test-route',
        description: 'Complete a test smuggling run on the new route',
        type: 'visit',
        target: 'location:new-route-end',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 600 },
      { type: 'xp', amount: 650 },
      { type: 'item', itemId: 'smugglers-map' },
      { type: 'reputation', amount: 120 }
    ],
    repeatable: false
  },

  // PADRE OSCURO (DARK PRIEST) QUESTS
  {
    questId: 'santa-muerte-offering',
    name: 'Santa Muerte\'s Offering',
    description: 'Padre Oscuro requires special offerings for a powerful blessing ceremony. Acquire what he needs, by any means necessary.',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'black-candles',
        description: 'Obtain 5 black candles',
        type: 'collect',
        target: 'item:black-candle',
        required: 5
      },
      {
        id: 'graveyard-dirt',
        description: 'Collect dirt from a fresh grave',
        type: 'collect',
        target: 'item:grave-dirt',
        required: 1
      },
      {
        id: 'blood-offering',
        description: 'Provide a blood offering',
        type: 'skill',
        target: 'choice:animal-enemy-self',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 350 },
      { type: 'item', itemId: 'santa-muerte-blessing' },
      { type: 'reputation', amount: 70 }
    ],
    repeatable: false
  },
  {
    questId: 'curse-enemy-quest',
    name: 'Curse Your Enemy',
    description: 'Padre Oscuro can place a powerful curse on your enemies, but the ritual requires dark deeds and darker prices.',
    type: 'side',
    levelRequired: 15,
    prerequisites: ['santa-muerte-offering'],
    objectives: [
      {
        id: 'name-enemy',
        description: 'Choose your target and provide their name',
        type: 'skill',
        target: 'skill:choice',
        required: 1
      },
      {
        id: 'ritual-component',
        description: 'Steal something personal from your enemy',
        type: 'collect',
        target: 'item:personal-belonging',
        required: 1
      },
      {
        id: 'midnight-ritual',
        description: 'Participate in the midnight curse ritual',
        type: 'visit',
        target: 'location:shrine-of-santa-muerte',
        required: 1
      },
      {
        id: 'pay-price',
        description: 'Pay the spiritual price for the curse',
        type: 'skill',
        target: 'choice:gold-health-luck',
        required: 1
      }
    ],
    rewards: [
      { type: 'item', itemId: 'enemy-curse-active' },
      { type: 'xp', amount: 400 }
    ],
    repeatable: true
  },

  // DR. CARNICERO (THE BUTCHER) QUESTS
  {
    questId: 'emergency-extraction',
    name: 'Emergency Extraction',
    description: 'A prominent outlaw was shot during a robbery and needs immediate surgery. Dr. Carnicero needs someone to hold the patient down.',
    type: 'side',
    levelRequired: 7,
    prerequisites: [],
    objectives: [
      {
        id: 'assist-surgery',
        description: 'Assist Dr. Carnicero with emergency surgery',
        type: 'skill',
        target: 'skill:medicine',
        required: 1
      },
      {
        id: 'dispose-evidence',
        description: 'Dispose of the bloody evidence',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 200 },
      { type: 'reputation', amount: 40 }
    ],
    repeatable: true
  },
  {
    questId: 'medical-supplies-heist',
    name: 'Medical Supplies Heist',
    description: 'Dr. Carnicero is running low on morphine and surgical equipment. Raid a settler medical depot to resupply his practice.',
    type: 'side',
    levelRequired: 11,
    prerequisites: [],
    objectives: [
      {
        id: 'scout-depot',
        description: 'Scout the medical depot defenses',
        type: 'visit',
        target: 'location:medical-depot',
        required: 1
      },
      {
        id: 'steal-supplies',
        description: 'Raid the depot and steal medical supplies',
        type: 'crime',
        target: 'crime:burglary',
        required: 1
      },
      {
        id: 'deliver-carnicero',
        description: 'Deliver the supplies to Dr. Carnicero',
        type: 'visit',
        target: 'npc:dr-carnicero',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 350 },
      { type: 'xp', amount: 400 },
      { type: 'item', itemId: 'medical-discount-token' }
    ],
    repeatable: false
  },

  // LA VIUDA (INN KEEPER) QUESTS
  {
    questId: 'protect-guest',
    name: 'Protect the Guest',
    description: 'A high-value fugitive is hiding at the Posada. Bounty hunters are coming. La Viuda needs protection for her guest.',
    type: 'side',
    levelRequired: 13,
    prerequisites: [],
    objectives: [
      {
        id: 'fortify-inn',
        description: 'Help fortify the inn defenses',
        type: 'skill',
        target: 'skill:preparation',
        required: 1
      },
      {
        id: 'defend-assault',
        description: 'Defend against the bounty hunter assault',
        type: 'kill',
        target: 'npc:bounty-hunter',
        required: 5
      },
      {
        id: 'evacuate-guest',
        description: 'Evacuate the guest through the tunnels',
        type: 'visit',
        target: 'location:escape-tunnels',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 450 },
      { type: 'xp', amount: 500 },
      { type: 'reputation', amount: 110 }
    ],
    repeatable: false
  },
  {
    questId: 'viudas-revenge',
    name: "La Viuda's Revenge",
    description: 'La Viuda\'s third husband was murdered by a settler marshal. She wants revenge, and she\'s willing to pay for it.',
    type: 'side',
    levelRequired: 18,
    prerequisites: [],
    objectives: [
      {
        id: 'track-marshal',
        description: 'Track down Marshal Thaddeus Kane',
        type: 'visit',
        target: 'location:kane-location',
        required: 1
      },
      {
        id: 'confront-kane',
        description: 'Kill Marshal Kane or make him suffer',
        type: 'skill',
        target: 'choice:kill-torture-ruin',
        required: 1
      },
      {
        id: 'proof-death',
        description: 'Bring proof of Kane\'s fate to La Viuda',
        type: 'collect',
        target: 'item:proof-of-death',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 700 },
      { type: 'xp', amount: 750 },
      { type: 'item', itemId: 'viudas-gratitude' },
      { type: 'reputation', amount: 140 }
    ],
    repeatable: false
  },

  // ========================================
  // ADDITIONAL DAILY/WEEKLY QUESTS
  // ========================================

  {
    questId: 'daily-herb-gathering',
    name: 'Daily Herb Gathering',
    description: 'Collect medicinal herbs for the territory\'s healers. Simple work that helps the community.',
    type: 'daily',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'gather-herbs',
        description: 'Gather 10 medicinal herbs',
        type: 'collect',
        target: 'item:medicinal-herb',
        required: 10
      }
    ],
    rewards: [
      { type: 'gold', amount: 40 },
      { type: 'xp', amount: 20 }
    ],
    timeLimit: 1440,
    repeatable: true
  },
  {
    questId: 'daily-bounty',
    name: 'Daily Bounty',
    description: 'Claim a bounty on a wanted criminal. New targets posted daily.',
    type: 'daily',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'claim-bounty',
        description: 'Capture or kill today\'s bounty target',
        type: 'kill',
        target: 'npc:daily-bounty-target',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 50 },
      { type: 'reputation', amount: 15 }
    ],
    timeLimit: 1440,
    repeatable: true
  },
  {
    questId: 'daily-gambling',
    name: 'Lucky Streak',
    description: 'Test your luck at the gambling tables. Win big or lose it all.',
    type: 'daily',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'win-games',
        description: 'Win 3 gambling games',
        type: 'skill',
        target: 'skill:gambling',
        required: 3
      }
    ],
    rewards: [
      { type: 'gold', amount: 80 },
      { type: 'xp', amount: 35 }
    ],
    timeLimit: 1440,
    repeatable: true
  },
  {
    questId: 'weekly-smuggling',
    name: 'Weekly Smuggling Run',
    description: 'Complete a major smuggling operation. High risk, high reward.',
    type: 'weekly',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'smuggle-goods',
        description: 'Successfully smuggle 5 contraband shipments',
        type: 'crime',
        target: 'crime:smuggling',
        required: 5
      }
    ],
    rewards: [
      { type: 'gold', amount: 800 },
      { type: 'xp', amount: 400 },
      { type: 'reputation', amount: 80 }
    ],
    timeLimit: 10080,
    repeatable: true
  },
  {
    questId: 'weekly-peacekeeper',
    name: 'Weekly Peacekeeper Duty',
    description: 'Serve as a peacekeeper for the week, maintaining order and justice.',
    type: 'weekly',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'prevent-crimes',
        description: 'Prevent or stop 10 crimes this week',
        type: 'crime',
        target: 'prevent',
        required: 10
      },
      {
        id: 'patrol-duty',
        description: 'Complete 15 patrol sessions',
        type: 'skill',
        target: 'job:patrol',
        required: 15
      }
    ],
    rewards: [
      { type: 'gold', amount: 600 },
      { type: 'xp', amount: 350 },
      { type: 'reputation', amount: 100 }
    ],
    timeLimit: 10080,
    repeatable: true
  },

  // ========================================
  // EVENT QUESTS
  // ========================================

  {
    questId: 'blood-moon-rising',
    name: 'Blood Moon Rising',
    description: 'During the blood moon, dark forces stir. The spirits are restless and the dead walk. Survive the night and protect the living.',
    type: 'event',
    levelRequired: 15,
    prerequisites: [],
    objectives: [
      {
        id: 'defend-settlement',
        description: 'Defend a settlement from supernatural attacks',
        type: 'kill',
        target: 'npc:undead',
        required: 20
      },
      {
        id: 'seal-portal',
        description: 'Seal the dark portal before dawn',
        type: 'skill',
        target: 'skill:ritual',
        required: 1
      },
      {
        id: 'survive-night',
        description: 'Survive until sunrise',
        type: 'skill',
        target: 'skill:survival',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 800 },
      { type: 'item', itemId: 'blood-moon-talisman' },
      { type: 'reputation', amount: 150 }
    ],
    timeLimit: 480, // 8 hours
    repeatable: true
  },
  {
    questId: 'gold-rush-fever',
    name: 'Gold Rush Fever',
    description: 'A massive gold strike has been discovered! Join the rush and stake your claim before it\'s too late.',
    type: 'event',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'stake-claim',
        description: 'Race to stake your mining claim',
        type: 'visit',
        target: 'location:gold-strike',
        required: 1
      },
      {
        id: 'mine-gold',
        description: 'Mine as much gold as possible',
        type: 'collect',
        target: 'item:gold-nugget',
        required: 20
      },
      {
        id: 'defend-claim',
        description: 'Defend your claim from claim jumpers',
        type: 'kill',
        target: 'npc:claim-jumper',
        required: 5
      }
    ],
    rewards: [
      { type: 'gold', amount: 1500 },
      { type: 'xp', amount: 600 },
      { type: 'item', itemId: 'mining-deed' }
    ],
    timeLimit: 2880, // 48 hours
    repeatable: true
  },
  {
    questId: 'territorial-war',
    name: 'Territorial War',
    description: 'All-out war has erupted between factions. Choose your side and fight for territory control.',
    type: 'event',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'choose-faction',
        description: 'Declare allegiance to a faction',
        type: 'skill',
        target: 'choice:settler-nahi-frontera',
        required: 1
      },
      {
        id: 'capture-locations',
        description: 'Help capture 3 strategic locations',
        type: 'visit',
        target: 'location:strategic-point',
        required: 3
      },
      {
        id: 'eliminate-enemies',
        description: 'Eliminate 30 enemy combatants',
        type: 'kill',
        target: 'npc:enemy-faction',
        required: 30
      }
    ],
    rewards: [
      { type: 'gold', amount: 1200 },
      { type: 'xp', amount: 1000 },
      { type: 'item', itemId: 'war-hero-medal' },
      { type: 'reputation', amount: 200 }
    ],
    timeLimit: 4320, // 72 hours
    repeatable: true
  },
  {
    questId: 'halloween-haunting',
    name: 'The Halloween Haunting',
    description: 'Strange things happen on All Hallows\' Eve. Ghost towns come alive, specters walk the earth, and ancient curses awaken.',
    type: 'event',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate-haunting',
        description: 'Investigate reports of supernatural activity',
        type: 'visit',
        target: 'location:haunted-location',
        required: 5
      },
      {
        id: 'banish-spirits',
        description: 'Banish 15 restless spirits',
        type: 'kill',
        target: 'npc:spirit',
        required: 15
      },
      {
        id: 'collect-artifacts',
        description: 'Collect cursed artifacts to prevent their misuse',
        type: 'collect',
        target: 'item:cursed-artifact',
        required: 7
      }
    ],
    rewards: [
      { type: 'gold', amount: 666 },
      { type: 'xp', amount: 777 },
      { type: 'item', itemId: 'halloween-mask' },
      { type: 'reputation', amount: 100 }
    ],
    timeLimit: 1440,
    repeatable: true
  },
  {
    questId: 'christmas-miracle',
    name: 'Christmas Miracle',
    description: 'The spirit of giving comes to the frontier. Help those in need and spread holiday cheer in these harsh lands.',
    type: 'event',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'donate-supplies',
        description: 'Donate supplies to struggling families',
        type: 'gold',
        target: 'spent',
        required: 200
      },
      {
        id: 'deliver-gifts',
        description: 'Deliver gifts to 10 settlements',
        type: 'visit',
        target: 'location:settlement',
        required: 10
      },
      {
        id: 'rescue-travelers',
        description: 'Rescue travelers stranded in winter storms',
        type: 'skill',
        target: 'skill:survival',
        required: 3
      }
    ],
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 400 },
      { type: 'item', itemId: 'santa-hat' },
      { type: 'reputation', amount: 120 }
    ],
    timeLimit: 2880,
    repeatable: true
  }
];

/**
 * Seed quests into database
 * Uses ALL_STARTER_QUESTS from data/quests/starter-quests.ts which includes:
 * - Newcomer's Trail, Greenhorn's Trail, Frontier Justice, etc.
 * - Skill Academy tutorial quests (26 quests)
 * - All NPC quest chains
 */
export async function seedQuests(): Promise<void> {
  console.log('Seeding quests...');

  for (const quest of ALL_STARTER_QUESTS) {
    await QuestDefinition.findOneAndUpdate(
      { questId: quest.questId },
      quest,
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${ALL_STARTER_QUESTS.length} quests`);
}

/**
 * Clear all quests
 */
export async function clearQuests(): Promise<void> {
  await QuestDefinition.deleteMany({});
  console.log('Cleared all quests');
}
