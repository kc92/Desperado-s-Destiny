/**
 * Ranch and Canyon Buildings Seed Data
 *
 * Seeds the database with 13 buildings across 2 locations:
 * - Longhorn Ranch (6 buildings) - Tier 2 Settler ranching community
 * - Sangre Canyon (7 buildings) - Tier 4 dangerous wilderness with treasures
 */

import mongoose from 'mongoose';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for Longhorn Ranch
export const LONGHORN_RANCH_BUILDING_IDS = {
  RANCH_HOUSE: new mongoose.Types.ObjectId('6503a0000000000000000001'),
  CATTLE_PENS: new mongoose.Types.ObjectId('6503a0000000000000000002'),
  BUNKHOUSE: new mongoose.Types.ObjectId('6503a0000000000000000003'),
  HORSE_CORRAL: new mongoose.Types.ObjectId('6503a0000000000000000004'),
  WINDMILL_WATER_TOWER: new mongoose.Types.ObjectId('6503a0000000000000000005'),
  FRONTIER_CHAPEL: new mongoose.Types.ObjectId('6503a0000000000000000006'),
};

// Building IDs for Sangre Canyon
export const SANGRE_CANYON_BUILDING_IDS = {
  CANYON_OVERLOOK: new mongoose.Types.ObjectId('6503b0000000000000000001'),
  PROSPECTORS_CAMP: new mongoose.Types.ObjectId('6503b0000000000000000002'),
  HIDDEN_CAVE_NETWORK: new mongoose.Types.ObjectId('6503b0000000000000000003'),
  ROPE_BRIDGE_CROSSING: new mongoose.Types.ObjectId('6503b0000000000000000004'),
  ABANDONED_MINE: new mongoose.Types.ObjectId('6503b0000000000000000005'),
  CANYON_SPRINGS: new mongoose.Types.ObjectId('6503b0000000000000000006'),
  BANDIT_LOOKOUT: new mongoose.Types.ObjectId('6503b0000000000000000007'),
};

// ==================== LONGHORN RANCH BUILDINGS ====================

export const longhornRanchBuildings = [
  // ===== 1. RANCH HOUSE =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.RANCH_HOUSE,
    name: 'Longhorn Ranch House',
    description: 'The heart of the Longhorn Ranch, a sturdy two-story homestead built by the patriarch Ezra Longhorn thirty years ago. Family portraits line the walls, and the smell of home cooking drifts from the kitchen. This is where ranch business is conducted and important decisions are made.',
    shortDescription: 'Main residence and ranch headquarters',
    type: 'ranch',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 22 },
    atmosphere: 'Worn leather furniture sits before a stone fireplace. Maps of the ranch lands cover the walls. The wooden floors creak with history, and sunlight streams through lace curtains. Everything speaks of hard work and honest living.',
    npcs: [
      {
        id: 'ezra-longhorn',
        name: 'Ezra Longhorn',
        title: 'Ranch Patriarch',
        description: 'A weathered man in his sixties with silver hair and calloused hands. He built this ranch from nothing and defends it with pride. His word is his bond, and he expects the same from others.',
        personality: 'Wise, traditional, and stubborn. Values family and hard work above all. Slow to trust outsiders but fiercely loyal to those who prove themselves.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Welcome to the Longhorn. We run an honest operation here.',
          'This land was nothing but dust and rattlesnakes when I arrived. Built it all with these hands.',
          'Need work? I respect a man who earns his keep.',
        ],
        quests: ['negotiate-cattle-price', 'defend-ranch-raid'],
      },
      {
        id: 'sarah-longhorn',
        name: 'Sarah Longhorn',
        title: "Ezra's Daughter",
        description: 'A sharp-eyed woman in her thirties who manages the ranch accounts and trade negotiations. She\'s shrewder than most city merchants.',
        personality: 'Intelligent and practical. Balances her father\'s tradition with modern business sense.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Father built this ranch, but I keep it profitable.',
          'We get fair prices, or we don\'t sell. Simple as that.',
          'Numbers don\'t lie, unlike most people around here.',
        ],
      },
    ],
    availableActions: ['negotiate-contract', 'ranch-business', 'family-dinner', 'review-accounts'],
    availableCrimes: [],
    jobs: [
      {
        id: 'ranch-management',
        name: 'Ranch Management',
        description: 'Help with paperwork, contracts, and organizing ranch operations.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 18, goldMax: 28, xp: 30, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'cattle-negotiations',
        name: 'Cattle Negotiations',
        description: 'Accompany Sarah to town to negotiate cattle prices with buyers.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 25, goldMax: 40, xp: 35, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'family-treasure',
        name: 'Buried Family Treasure',
        description: 'Ezra once mentioned a strongbox buried beneath the old oak tree, containing gold saved for hard times. Only family knows the exact location.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'ezra-longhorn', level: 5 },
          visitCount: 10,
        },
        content: {
          actions: ['dig-for-treasure'],
          dialogue: ['You\'ve proven yourself family. Let me show you something...'],
          rewards: { gold: 500, xp: 100, items: ['longhorn-family-ring'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. CATTLE PENS =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.CATTLE_PENS,
    name: 'Cattle Pens',
    description: 'Sturdy wooden corrals hold hundreds of longhorn cattle, the lifeblood of the ranch. The smell of livestock fills the air, along with the constant lowing of cattle and the crack of foreman Diego\'s whip.',
    shortDescription: 'Livestock area and cattle operations',
    type: 'ranch',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 5, close: 20 },
    atmosphere: 'Dust rises from the cattle pens as cowhands work the herd. Branding irons heat in a small forge. The constant sound of mooing cattle and shouted commands fills the air. It\'s honest, hard work.',
    npcs: [
      {
        id: 'diego-santos',
        name: 'Diego Santos',
        title: 'Foreman',
        description: 'A hardworking man from the Frontera territories who\'s earned Ezra\'s complete trust. He knows cattle better than most men know their own families.',
        personality: 'Hardworking, loyal, and patient. Treats his workers fairly and the cattle with respect. Dedicated to the Longhorn family.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'These cattle are our future. We treat them right, they treat us right.',
          'A good cowhand knows his animals. Each one has a personality.',
          'Señor Longhorn gave me a chance when no one else would. I won\'t forget that.',
        ],
      },
    ],
    availableActions: ['work-cattle', 'brand-calves', 'count-herd', 'buy-cattle'],
    availableCrimes: ['Cattle Rustling', 'Brand Tampering'],
    jobs: [
      {
        id: 'cattle-herding',
        name: 'Cattle Herding',
        description: 'Move cattle between pastures and pens. Hard work under the sun.',
        energyCost: 18,
        cooldownMinutes: 35,
        rewards: { goldMin: 15, goldMax: 25, xp: 28, items: [] },
        requirements: { minLevel: 2 },
      },
      {
        id: 'cattle-branding',
        name: 'Cattle Branding',
        description: 'Help brand the new calves with the Longhorn mark.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 20, goldMax: 30, xp: 32, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [
      {
        id: 'cattle-sales',
        name: 'Cattle Sales',
        description: 'Purchase livestock and ranching supplies.',
        shopType: 'specialty',
        items: [
          { itemId: 'longhorn-calf', name: 'Longhorn Calf', description: 'Young cattle for breeding', price: 150 },
          { itemId: 'breeding-bull', name: 'Breeding Bull', description: 'Prime bull for your herd', price: 500, requiredLevel: 8 },
          { itemId: 'ranch-rope', name: 'Ranch Rope', description: 'Quality lasso rope', price: 12 },
          { itemId: 'cattle-feed', name: 'Cattle Feed (Bag)', description: 'Supplemental feed', price: 25 },
          { itemId: 'branding-iron', name: 'Branding Iron', description: 'Custom cattle brand', price: 75, requiredLevel: 5 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. BUNKHOUSE =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.BUNKHOUSE,
    name: 'Ranch Bunkhouse',
    description: 'The ranch hands\' quarters, a long building with rows of simple bunks. Cookie Clara rules the attached kitchen with an iron fist and a wooden spoon, feeding the hungry workers three square meals a day.',
    shortDescription: 'Worker housing and mess hall',
    type: 'ranch',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Simple bunks line both walls, each with a footlocker. The attached mess hall smells of coffee, bacon, and biscuits. Ranch hands swap stories and play cards at rough-hewn tables. It\'s communal living at its finest.',
    npcs: [
      {
        id: 'cookie-clara',
        name: 'Cookie Clara',
        title: 'Ranch Cook',
        description: 'A grandmother figure with flour-dusted hands and a warm smile. She\'s been cooking for the Longhorn Ranch for twenty years and knows every cowhand\'s favorite meal.',
        personality: 'Motherly, nurturing, and fiercely protective of "her boys." Rules the kitchen with love and wooden spoon discipline. Great listener.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Sit down, child. You look hungry. I\'ll fix you a plate.',
          'A full belly makes a happy cowhand. That\'s my philosophy.',
          'You need anything, you come to Cookie Clara. I take care of my people.',
        ],
        isVendor: true,
        shopId: 'bunkhouse-provisions',
      },
    ],
    availableActions: ['eat-meal', 'rest', 'play-cards', 'swap-stories'],
    availableCrimes: ['Pickpocket', 'Theft'],
    jobs: [
      {
        id: 'kitchen-work',
        name: 'Kitchen Work',
        description: 'Help Cookie Clara prepare meals and clean up the mess hall.',
        energyCost: 10,
        cooldownMinutes: 25,
        rewards: { goldMin: 10, goldMax: 16, xp: 18, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'supply-runner',
        name: 'Supply Runner',
        description: 'Fetch provisions and supplies from town for the bunkhouse.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 12, goldMax: 20, xp: 22, items: [] },
        requirements: { minLevel: 1 },
      },
    ],
    shops: [
      {
        id: 'bunkhouse-provisions',
        name: 'Bunkhouse Provisions',
        description: 'Simple food and ranch supplies.',
        shopType: 'general',
        items: [
          { itemId: 'hot-breakfast', name: 'Hot Breakfast', description: 'Eggs, bacon, and biscuits', price: 2 },
          { itemId: 'lunch-pail', name: 'Lunch Pail', description: 'Meal for the day', price: 3 },
          { itemId: 'cookie-pie', name: "Cookie's Pie", description: 'Restores health and morale', price: 5 },
          { itemId: 'ranch-coffee', name: 'Ranch Coffee', description: 'Strong and black', price: 1 },
          { itemId: 'trail-rations', name: 'Trail Rations', description: 'Week\'s worth of food', price: 12 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'moonshine-still',
        name: 'Hidden Moonshine Still',
        description: 'Behind the woodpile, some of the ranch hands run a secret still. Cookie knows about it but turns a blind eye - a little whiskey helps morale.',
        type: 'hidden_room',
        unlockCondition: {
          npcTrust: { npcId: 'cookie-clara', level: 3 },
          visitCount: 5,
        },
        content: {
          actions: ['buy-moonshine', 'help-distill'],
          dialogue: ['The boys work hard. They deserve a drink now and then. Just don\'t tell Mr. Longhorn.'],
          rewards: { gold: 0, xp: 50, items: [] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 80, nahiCoalition: 5, frontera: 15 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. HORSE CORRAL =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.HORSE_CORRAL,
    name: 'Horse Corral',
    description: 'The pride of the Longhorn Ranch - a sprawling corral where wild mustangs are broken and trained. Mustang Mary works her magic here, turning wild horses into loyal companions through patience and skill.',
    shortDescription: 'Horse training and sales',
    type: 'stables',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 5, close: 21 },
    atmosphere: 'The thunder of hooves echoes across the corral. Wild mustangs kick and rear while Mary speaks to them in soothing tones. The smell of hay, leather, and horse sweat fills the air. This is where wildness meets discipline.',
    npcs: [
      {
        id: 'mustang-mary',
        name: 'Mustang Mary',
        title: 'Horse Breaker',
        description: 'A wild-spirited woman who seems to understand horses better than people. She can break any mustang without ever raising a whip, using only patience, treats, and gentle words.',
        personality: 'Wild, free-spirited, and fiercely independent. Prefers the company of horses to most humans. Respects those who respect animals.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Horses know when you fear them, and when you respect them. Show respect.',
          'I don\'t break horses. I make partners. There\'s a difference.',
          'That mustang? Give me two weeks and she\'ll be the best mount you ever rode.',
        ],
        isVendor: true,
        shopId: 'horse-corral-sales',
      },
    ],
    availableActions: ['buy-horse', 'train-horse', 'riding-lessons', 'brush-horses'],
    availableCrimes: ['Horse Theft'],
    jobs: [
      {
        id: 'horse-breaking',
        name: 'Horse Breaking',
        description: 'Help Mary train wild mustangs. Difficult and dangerous work.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 25, goldMax: 40, xp: 45, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'riding-lessons',
        name: 'Riding Lessons',
        description: 'Teach greenhorns the basics of horsemanship.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 18, goldMax: 28, xp: 30, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [
      {
        id: 'horse-corral-sales',
        name: 'Mustang Mary\'s Horses',
        description: 'Quality horses and riding equipment.',
        shopType: 'specialty',
        items: [
          { itemId: 'ranch-horse', name: 'Ranch Horse', description: 'Reliable work horse', price: 200 },
          { itemId: 'mustang', name: 'Trained Mustang', description: 'Fast and spirited', price: 350, requiredLevel: 5 },
          { itemId: 'saddle-basic', name: 'Basic Saddle', description: 'Functional saddle', price: 50 },
          { itemId: 'saddle-fine', name: 'Fine Saddle', description: 'Comfortable riding saddle', price: 125, requiredLevel: 3 },
          { itemId: 'saddlebags', name: 'Saddlebags', description: 'Extra carrying capacity', price: 35 },
          { itemId: 'horse-brush', name: 'Horse Brush Set', description: 'Keep your mount happy', price: 8 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 10, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. WINDMILL & WATER TOWER =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.WINDMILL_WATER_TOWER,
    name: 'Windmill & Water Tower',
    description: 'The engineering marvel that keeps the Longhorn Ranch alive - a massive windmill pumping water from deep underground to fill a raised water tower. Engineer Samuel Tinker constantly tinkers with improvements to his creation.',
    shortDescription: 'Water infrastructure and engineering',
    type: 'ranch',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'The windmill creaks and groans as its blades turn in the constant breeze. Water gurgles through iron pipes. Samuel\'s workshop is cluttered with gears, tools, and half-finished inventions. The sound of hammering metal is constant.',
    npcs: [
      {
        id: 'samuel-tinker',
        name: 'Samuel Tinker',
        title: 'Ranch Engineer',
        description: 'A brilliant but eccentric inventor from back East. He designed the irrigation system that transformed the ranch from dusty plain to productive pasture. Always has grease under his fingernails.',
        personality: 'Inventive, excitable, and scattered. Gets lost in his work. Explains things in overly technical terms. Loves a good engineering challenge.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'The aquifer depth is approximately 180 feet. My pump system can extract 500 gallons per hour!',
          'I\'m working on an automatic cattle waterer. Just need to solve the pressure regulation issue...',
          'Beautiful, isn\'t it? Form following function in perfect harmony.',
        ],
        quests: ['repair-irrigation', 'find-spare-parts'],
      },
    ],
    availableActions: ['check-water-levels', 'repair-pump', 'help-tinker', 'study-system'],
    availableCrimes: ['Sabotage Water Supply'],
    jobs: [
      {
        id: 'pump-repairs',
        name: 'Pump Repairs',
        description: 'Help Samuel maintain and repair the complex pumping system.',
        energyCost: 18,
        cooldownMinutes: 40,
        rewards: { goldMin: 20, goldMax: 32, xp: 38, items: [] },
        requirements: { minLevel: 4 },
      },
      {
        id: 'irrigation-work',
        name: 'Irrigation Work',
        description: 'Maintain the irrigation channels and ensure water reaches all pastures.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 28, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'aquifer-map',
        name: 'Underground Aquifer Map',
        description: 'Samuel discovered an extensive underground water network. His maps show the aquifer extends far beyond the ranch - valuable information for land speculation.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'samuel-tinker', level: 4 },
        },
        content: {
          actions: ['copy-aquifer-maps', 'explore-water-sources'],
          dialogue: ['These maps could be worth a fortune. But Mr. Longhorn deserves to know first...'],
          rewards: { gold: 0, xp: 75, items: ['aquifer-maps'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. FRONTIER CHAPEL =====
  {
    _id: LONGHORN_RANCH_BUILDING_IDS.FRONTIER_CHAPEL,
    name: 'Frontier Chapel',
    description: 'A small whitewashed church with a modest steeple. Reverend Isaiah Shepherd holds services here on Sundays and provides counsel to troubled souls throughout the week. The chapel serves as the moral center of ranch life.',
    shortDescription: 'Small church and spiritual guidance',
    type: 'church',
    region: 'town',
    parentId: LOCATION_IDS.LONGHORN_RANCH,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 21 },
    atmosphere: 'Sunlight streams through simple stained glass windows. Wooden pews face a modest altar. The smell of candle wax and old books fills the quiet space. Peace seems to seep from the very walls.',
    npcs: [
      {
        id: 'isaiah-shepherd',
        name: 'Reverend Isaiah Shepherd',
        title: 'Preacher',
        description: 'A thoughtful man in his forties struggling with the contradictions of frontier faith. He\'s seen too much violence for easy answers, but still believes in redemption.',
        personality: 'Conflicted but compassionate. Questions his own faith while helping others find theirs. Believes everyone deserves a second chance.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Welcome, friend. All souls are welcome in this house.',
          'I don\'t have all the answers. Sometimes faith means admitting that.',
          'What you tell me here stays here. That\'s sacred.',
        ],
      },
    ],
    availableActions: ['attend-service', 'seek-counsel', 'confess', 'pray'],
    availableCrimes: [],
    jobs: [
      {
        id: 'community-service',
        name: 'Community Service',
        description: 'Help with charity work, visiting the sick, and community support.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 8, goldMax: 16, xp: 25, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'spiritual-counseling',
        name: 'Spiritual Counseling',
        description: 'Assist the Reverend in providing guidance to troubled souls.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 12, goldMax: 20, xp: 30, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'confession-secrets',
        name: 'Confession Secrets',
        description: 'The Reverend hears confessions from everyone on the ranch. He knows secrets about cattle rustling, affairs, hidden crimes - but his vow of confidentiality keeps him silent.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'isaiah-shepherd', level: 5 },
        },
        content: {
          actions: ['hear-confessions'],
          dialogue: [
            'I shouldn\'t tell you this, but... lives may depend on it.',
            'What I\'m about to share breaks sacred trust. May God forgive me.',
          ],
          rewards: { gold: 0, xp: 100, items: [] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 88, nahiCoalition: 8, frontera: 4 },
    isUnlocked: true,
    isHidden: false,
  },
];

// ==================== SANGRE CANYON BUILDINGS ====================

export const sangreCanyonBuildings = [
  // ===== 1. CANYON OVERLOOK =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.CANYON_OVERLOOK,
    name: 'Canyon Overlook',
    description: 'A breathtaking viewpoint at the canyon\'s edge where red rock walls plunge 800 feet into the shadowed depths below. Running Deer, a Nahi elder, offers guided tours and safe passage to those who show proper respect for this sacred land.',
    shortDescription: 'Scenic viewpoint and tour station',
    type: 'canyon',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'Wind howls across the canyon rim, carrying the scent of sage and ancient stone. Eagles soar below the overlook. The view stretches for miles - crimson walls, shadowed caves, and the silver ribbon of a river far below.',
    npcs: [
      {
        id: 'running-deer',
        name: 'Running Deer',
        title: 'Nahi Elder & Guide',
        description: 'An elderly Nahi guide who knows every path, cave, and secret of Sangre Canyon. His people have lived here for generations, and he treats the canyon as sacred ground.',
        personality: 'Spiritual, wise, and protective of the canyon. Shares knowledge with those who show respect. Deeply connected to the land and its spirits.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'This canyon has many moods. Respect her, and she may show you wonders.',
          'My grandfather\'s grandfather walked these paths. The land remembers.',
          'Some places are sacred. Remember that as you descend.',
        ],
        quests: ['vision-quest-canyon', 'protect-sacred-sites'],
      },
    ],
    availableActions: ['canyon-tour', 'safe-passage', 'meditation', 'scout-path'],
    availableCrimes: [],
    jobs: [
      {
        id: 'guide-tourists',
        name: 'Guide Tourists',
        description: 'Help Running Deer lead settlers and travelers safely through the canyon.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 22, goldMax: 35, xp: 40, items: [] },
        requirements: { minLevel: 4 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'vision-quest-location',
        name: 'Vision Quest Location',
        description: 'A hidden alcove where Nahi youth undergo vision quests. Running Deer may share this sacred place with outsiders who prove themselves worthy.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'running-deer', level: 5 },
          faction: 'NAHI_COALITION',
          factionStanding: 'honored',
        },
        content: {
          actions: ['undertake-vision-quest'],
          dialogue: ['You have shown respect. The spirits may speak to you here...'],
          rewards: { gold: 0, xp: 150, items: ['spirit-vision-token'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 90, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. PROSPECTOR'S CAMP =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.PROSPECTORS_CAMP,
    name: "Prospector's Camp",
    description: 'A ramshackle mining camp clinging to the canyon wall. Old Pete "Goldfever" McCready has been searching for the mother lode for fifteen years, and he swears he\'s getting close. Rusted equipment and abandoned claims litter the area.',
    shortDescription: 'Mining camp and claim office',
    type: 'mine',
    region: 'outlaw_territory',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'neutral',
    operatingHours: { open: 5, close: 23 },
    atmosphere: 'Canvas tents flap in the wind. Sluice boxes and mining equipment rust in the sun. The constant sound of picks striking stone echoes off canyon walls. Desperate hope and bitter disappointment hang equally thick in the air.',
    npcs: [
      {
        id: 'goldfever-pete',
        name: 'Old Pete "Goldfever" McCready',
        title: 'Prospector',
        description: 'A wild-eyed prospector whose obsession with finding gold has consumed his life. His clothes are patched and repatched, but his mining equipment is lovingly maintained.',
        personality: 'Obsessed, paranoid, but occasionally lucid and helpful. Believes everyone is after his claim. Generous with mining advice if you gain his trust.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'She\'s down there, I know it! The mother lode! Just need to dig a little deeper...',
          'You think I\'m crazy? They all thought I was crazy. But the canyon talks to me.',
          'Stake your own claim, but stay away from mine! I was here first!',
        ],
        isVendor: true,
        shopId: 'prospector-equipment',
      },
    ],
    availableActions: ['prospect-gold', 'stake-claim', 'pan-river', 'inspect-samples'],
    availableCrimes: ['Claim Jumping', 'Equipment Theft'],
    jobs: [
      {
        id: 'canyon-mining',
        name: 'Canyon Mining',
        description: 'Work a mining claim in the canyon. Backbreaking work with uncertain rewards.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 20, goldMax: 60, xp: 45, items: ['gold-nugget'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'claim-staking',
        name: 'Claim Staking',
        description: 'Help prospectors survey and stake new mining claims.',
        energyCost: 18,
        cooldownMinutes: 40,
        rewards: { goldMin: 18, goldMax: 30, xp: 35, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [
      {
        id: 'prospector-equipment',
        name: "Pete's Mining Supplies",
        description: 'Prospecting and mining equipment.',
        shopType: 'specialty',
        items: [
          { itemId: 'gold-pan', name: 'Gold Pan', description: 'For panning rivers', price: 15 },
          { itemId: 'pickaxe-quality', name: 'Quality Pickaxe', description: 'Better than standard', price: 40 },
          { itemId: 'miners-helmet', name: "Miner's Helmet", description: 'With oil lamp', price: 30 },
          { itemId: 'dynamite-stick', name: 'Dynamite Stick', description: 'Handle with care', price: 25, requiredLevel: 6 },
          { itemId: 'assay-kit', name: 'Assay Kit', description: 'Test ore quality', price: 60, requiredLevel: 5 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'mother-lode-location',
        name: 'Mother Lode Location',
        description: 'Pete actually found a massive gold vein years ago, but it\'s in a nearly inaccessible part of the canyon. He\'ll share the location if he trusts you completely.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'goldfever-pete', level: 5 },
        },
        content: {
          actions: ['access-mother-lode'],
          dialogue: ['I\'m getting too old for this. Maybe... maybe you could help me get to it.'],
          rewards: { gold: 1000, xp: 200, items: ['pure-gold-vein-map'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 50, nahiCoalition: 20, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. HIDDEN CAVE NETWORK =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.HIDDEN_CAVE_NETWORK,
    name: 'Hidden Cave Network',
    description: 'A labyrinthine network of caves carved by ancient waters. Blind Bat Beatrice, who lost her sight in a cave-in, has memorized every tunnel and chamber. Artifacts from lost civilizations can be found in the deepest chambers.',
    shortDescription: 'Mysterious caves with ancient secrets',
    type: 'cave',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'neutral',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Darkness presses close, broken only by flickering torchlight. Water drips from stalactites with hypnotic rhythm. Ancient pictographs cover the walls. The air is cool and still, carrying whispers of the past.',
    npcs: [
      {
        id: 'blind-bat-beatrice',
        name: 'Blind Bat Beatrice',
        title: 'Cave Guide',
        description: 'A blind woman who knows the cave network better than anyone with sight. She navigates by touch, sound, and an almost supernatural sense of the caves. Lives deep within the network.',
        personality: 'Mysterious, practical, and surprisingly cheerful despite her disability. Charges for her guide services. Knows the caves\' secrets.',
        faction: 'NEUTRAL',
        dialogue: [
          'You need eyes to see in the dark? How limiting. I see just fine.',
          'These caves breathe. Listen. Feel. They\'ll tell you where to go.',
          'Something valuable in the deep chambers? Maybe. You hiring me to find out?',
        ],
        quests: ['map-cave-network', 'artifact-recovery'],
      },
    ],
    availableActions: ['explore-caves', 'artifact-hunting', 'hire-guide', 'study-pictographs'],
    availableCrimes: ['Grave Robbing', 'Desecrate Sacred Site'],
    jobs: [
      {
        id: 'cave-exploration',
        name: 'Cave Exploration',
        description: 'Navigate the cave network searching for artifacts and treasures.',
        energyCost: 30,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 70, xp: 60, items: ['ancient-artifact'] },
        requirements: { minLevel: 7 },
      },
      {
        id: 'artifact-hunting',
        name: 'Artifact Hunting',
        description: 'Search for valuable relics from ancient civilizations.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 25, goldMax: 50, xp: 50, items: [] },
        requirements: { minLevel: 6 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'ancient-burial-chamber',
        name: 'Ancient Burial Chamber',
        description: 'The deepest cave contains a sealed burial chamber from a civilization that predates the Nahi. Beatrice knows how to find it but warns of curses.',
        type: 'hidden_room',
        unlockCondition: {
          npcTrust: { npcId: 'blind-bat-beatrice', level: 4 },
          requiredItems: ['cave-map'],
        },
        content: {
          actions: ['enter-burial-chamber', 'excavate-tomb'],
          npcs: ['ancient-guardian-spirit'],
          dialogue: ['The ancestors sleep here. Disturb them at your peril.'],
          rewards: { gold: 500, xp: 150, items: ['ancient-crown', 'cursed-relic'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 60, frontera: 20 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. ROPE BRIDGE CROSSING =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.ROPE_BRIDGE_CROSSING,
    name: 'Rope Bridge Crossing',
    description: 'A terrifying rope bridge spanning a 300-foot chasm. One-Arm Omar maintains the bridge and collects tolls from travelers. The bridge sways sickeningly in the wind, and the planks are worryingly spaced.',
    shortDescription: 'Dangerous canyon crossing',
    type: 'canyon',
    region: 'outlaw_territory',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'neutral',
    operatingHours: { open: 7, close: 19 }, // Daylight only
    atmosphere: 'The bridge groans and sways in the constant wind. Frayed ropes creak ominously. Far below, the river looks like a thin ribbon. One wrong step means certain death. The wind carries the scent of fear.',
    npcs: [
      {
        id: 'one-arm-omar',
        name: 'One-Arm Omar',
        title: 'Tollkeeper',
        description: 'A grizzled man who lost his left arm to a fall into the canyon twenty years ago. Somehow he survived, and now he maintains the bridge and helps rescue the foolish who get stuck.',
        personality: 'Gruff and practical. Respects courage but has no patience for stupidity. His near-death experience made him philosophical about mortality.',
        faction: 'NEUTRAL',
        dialogue: [
          'Toll\'s five gold. Don\'t like it? Go around. Only adds three days.',
          'Lost my arm to this canyon. She\'s a hungry lady. Don\'t give her the satisfaction.',
          'You get halfway across and freeze? I\'ll come get you. For a price.',
        ],
      },
    ],
    availableActions: ['cross-bridge', 'pay-toll', 'hire-rescue', 'bridge-maintenance'],
    availableCrimes: ['Rob Tollkeeper'],
    jobs: [
      {
        id: 'bridge-maintenance',
        name: 'Bridge Maintenance',
        description: 'Help Omar replace worn ropes and planks. Dangerous work high above the canyon.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 40, xp: 45, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'rescue-missions',
        name: 'Rescue Missions',
        description: 'Help rescue travelers who freeze up on the bridge crossing.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 30, goldMax: 50, xp: 50, items: [] },
        requirements: { minLevel: 6 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'bridge-shortcut',
        name: 'Shortcut to Treasure',
        description: 'Omar knows about a cave entrance accessible from beneath the bridge - a shortcut to hidden treasure. Only he knows the safe way to reach it.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'one-arm-omar', level: 4 },
        },
        content: {
          actions: ['descend-to-cave', 'access-hidden-treasure'],
          dialogue: ['See that ledge? That\'s where I fell. But I saw something down there...'],
          rewards: { gold: 750, xp: 125, items: ['canyon-treasure-map'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 40, nahiCoalition: 30, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. ABANDONED MINE =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.ABANDONED_MINE,
    name: 'Abandoned Silver Mine',
    description: 'The Sil haunter Silver Sam still walks these tunnels, protecting the cursed silver that killed him and his crew. Some say he\'ll guide the brave to riches. Others say he drags the greedy to their doom.',
    shortDescription: 'Haunted silver mine',
    type: 'mine',
    region: 'ghost_towns',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'neutral',
    operatingHours: { open: 0, close: 23 }, // 24/7 (ghosts don't sleep)
    atmosphere: 'Rotting timbers groan under the weight of stone. Rusted equipment lies scattered like bones. Cold air flows from the depths, carrying whispers and moans. Lantern light casts dancing shadows that seem almost alive.',
    npcs: [
      {
        id: 'silver-sam-ghost',
        name: 'Silver Sam',
        title: 'Restless Spirit',
        description: 'The ghost of Samuel "Silver Sam" Thornton, who struck the mother lode and died in the collapse it caused. He appears as a translucent figure carrying a ghostly lantern.',
        personality: 'Tragic and warning. Protects the cursed silver from the greedy but may guide the pure of heart. Speaks in riddles and echoes.',
        faction: 'NEUTRAL',
        dialogue: [
          '*hollow voice* The silver... so beautiful... so deadly...',
          'Turn back... turn back... the silver is cursed...',
          'Only the worthy... may claim... what I could not...',
        ],
        quests: ['lay-sam-to-rest', 'break-silver-curse'],
      },
    ],
    availableActions: ['ghost-hunting', 'explore-haunted-mine', 'commune-with-ghost', 'mine-cursed-silver'],
    availableCrimes: ['Desecrate Grave'],
    jobs: [
      {
        id: 'ghost-investigation',
        name: 'Ghost Investigation',
        description: 'Investigate the supernatural occurrences in the abandoned mine.',
        energyCost: 25,
        cooldownMinutes: 55,
        rewards: { goldMin: 30, goldMax: 55, xp: 55, items: [] },
        requirements: { minLevel: 7 },
      },
      {
        id: 'haunted-exploration',
        name: 'Haunted Exploration',
        description: 'Brave the ghost-haunted tunnels in search of abandoned silver.',
        energyCost: 30,
        cooldownMinutes: 60,
        rewards: { goldMin: 40, goldMax: 80, xp: 65, items: ['cursed-silver'] },
        requirements: { minLevel: 8 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'cursed-silver-vein',
        name: 'Cursed Silver Vein',
        description: 'The massive silver vein that killed Sam and his crew still exists deep in the mine. The silver is incredibly valuable but carries a terrible curse.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'silver-sam-ghost', level: 3 },
        },
        content: {
          actions: ['mine-cursed-vein', 'attempt-curse-break'],
          dialogue: ['*ghostly whisper* Take it... if you dare... but the curse... the curse...'],
          rewards: { gold: 1500, xp: 200, items: ['cursed-silver-ore', 'sam-wedding-ring'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 30, nahiCoalition: 40, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. CANYON SPRINGS =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.CANYON_SPRINGS,
    name: 'Canyon Springs',
    description: 'Natural hot springs bubble up from deep within the earth, creating pools of healing water. Willow Song, a Nahi medicine woman, tends the springs and uses their waters for healing. Rumors speak of miraculous cures.',
    shortDescription: 'Healing hot springs',
    type: 'springs',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 6, close: 22 },
    atmosphere: 'Steam rises from crystal-clear pools surrounded by lush vegetation impossible in the desert. The water smells faintly of minerals. The sound of bubbling water creates a soothing rhythm. Birds sing in the willows.',
    npcs: [
      {
        id: 'willow-song',
        name: 'Willow Song',
        title: 'Nahi Medicine Woman',
        description: 'A serene healer who tends the sacred springs. She combines water therapy with herbal medicine and spiritual healing. Her cures border on miraculous.',
        personality: 'Calm, compassionate, and deeply spiritual. Treats all who come with respect. Believes the springs choose who to heal.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The waters remember the ancient times when all was healing.',
          'Sink into the springs. Let the earth\'s warmth draw out your pain.',
          'Some wounds are of the spirit. The springs heal those too, if you let them.',
        ],
        isVendor: true,
        shopId: 'canyon-springs-remedies',
        quests: ['gather-spring-herbs', 'protect-sacred-springs'],
      },
    ],
    availableActions: ['bathe-in-springs', 'healing-ritual', 'gather-herbs', 'meditation'],
    availableCrimes: ['Desecrate Sacred Site', 'Poison Water'],
    jobs: [
      {
        id: 'herb-gathering-springs',
        name: 'Herb Gathering',
        description: 'Collect rare medicinal herbs that grow only near the springs.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 18, goldMax: 30, xp: 35, items: ['rare-healing-herb'] },
        requirements: { minLevel: 4 },
      },
      {
        id: 'spring-healing',
        name: 'Spring Healing',
        description: 'Assist Willow Song in treating patients with water and herb therapy.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 22, goldMax: 38, xp: 42, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'canyon-springs-remedies',
        name: 'Spring Remedies',
        description: 'Healing herbs and blessed water.',
        shopType: 'medicine',
        items: [
          { itemId: 'spring-water', name: 'Blessed Spring Water', description: 'Heals wounds', price: 20 },
          { itemId: 'willow-bark', name: 'Willow Bark', description: 'Reduces pain', price: 12 },
          { itemId: 'healing-mud', name: 'Healing Mud', description: 'Draws out poison', price: 25 },
          { itemId: 'spring-herbs', name: 'Spring Herbs', description: 'Rare medicinals', price: 40, requiredLevel: 5 },
          { itemId: 'miracle-tonic', name: 'Miracle Tonic', description: 'Powerful healing', price: 100, requiredLevel: 8 },
        ],
        buyMultiplier: 0.4,
      },
    ],
    secrets: [
      {
        id: 'fountain-of-youth',
        name: 'Fountain of Youth',
        description: 'Deep within the spring network is a hidden pool said to restore youth and vitality. Willow Song knows its location but shares it only with the truly worthy.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'willow-song', level: 5 },
          faction: 'NAHI_COALITION',
          factionStanding: 'honored',
        },
        content: {
          actions: ['bathe-fountain-youth'],
          dialogue: ['The ancient pool calls to you. Your spirit is ready to receive its blessing.'],
          rewards: { gold: 0, xp: 250, items: ['eternal-youth-blessing'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 10, nahiCoalition: 85, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 7. BANDIT LOOKOUT =====
  {
    _id: SANGRE_CANYON_BUILDING_IDS.BANDIT_LOOKOUT,
    name: 'Bandit Lookout',
    description: 'A fortified position on a narrow ledge with a commanding view of the canyon approaches. The Canyon Ghost gang uses this as their base for ambushing travelers and storing stolen goods. Heavily guarded and dangerous.',
    shortDescription: 'Outlaw hideout and ambush point',
    type: 'hideout',
    region: 'outlaw_territory',
    parentId: LOCATION_IDS.SANGRE_CANYON,
    tier: 4,
    dominantFaction: 'neutral',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Rough men clean weapons and count loot. A lookout watches the canyon trails through a spyglass. Stolen goods are stacked haphazardly. The smell of whiskey and gun oil fills the air. Tension crackles - everyone here is wanted.',
    requirements: {
      minLevel: 8,
      minCriminalRep: 30,
    },
    npcs: [
      {
        id: 'canyon-ghost',
        name: 'The Canyon Ghost',
        title: 'Gang Leader',
        description: 'A mysterious figure who always wears a pale mask and speaks in whispers. No one knows their true identity. They lead the most successful bandit gang in Sangre Canyon.',
        personality: 'Mysterious, ruthless, and highly intelligent. Plans ambushes with military precision. Loyal to their gang but trusts no one.',
        faction: 'FRONTERA',
        dialogue: [
          '*whispered* You want to run with the Ghost? Prove yourself worthy.',
          '*whispered* The canyon provides for those bold enough to take what they need.',
          '*whispered* Loyalty is everything. Betray me and you\'ll disappear like morning mist.',
        ],
        quests: ['join-canyon-gang', 'ambush-caravan', 'gang-war'],
      },
    ],
    availableActions: ['join-gang', 'plan-ambush', 'fence-goods', 'criminal-training'],
    availableCrimes: ['Ambush Travelers', 'Stagecoach Robbery', 'Murder'],
    jobs: [
      {
        id: 'ambush-planning',
        name: 'Ambush Planning',
        description: 'Scout travelers and plan robberies with the Canyon Ghost gang.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 40, goldMax: 70, xp: 55, items: [] },
        requirements: { minLevel: 8, minCriminalRep: 40 },
      },
      {
        id: 'outlaw-work',
        name: 'Outlaw Work',
        description: 'Participate in gang operations - robbery, intimidation, and theft.',
        energyCost: 30,
        cooldownMinutes: 60,
        rewards: { goldMin: 50, goldMax: 100, xp: 70, items: ['stolen-goods'] },
        requirements: { minLevel: 10, minCriminalRep: 50 },
      },
    ],
    shops: [
      {
        id: 'bandit-fence',
        name: 'Stolen Goods',
        description: 'Fenced items and black market goods.',
        shopType: 'black_market',
        items: [
          { itemId: 'stolen-watch', name: 'Stolen Watch', description: 'No questions asked', price: 40 },
          { itemId: 'illegal-weapons', name: 'Illegal Weapons', description: 'Untraceable firearms', price: 200, requiredLevel: 10 },
          { itemId: 'counterfeit-papers', name: 'Counterfeit Papers', description: 'New identity', price: 150, requiredLevel: 8 },
          { itemId: 'lockpicks-pro', name: 'Professional Lockpicks', description: 'Best quality', price: 75, requiredLevel: 7 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'gang-treasure-vault',
        name: 'Gang Treasure Vault',
        description: 'The Canyon Ghost gang\'s accumulated loot is hidden in a secret cave accessible only from the lookout. Heavily trapped and guarded.',
        type: 'hidden_room',
        unlockCondition: {
          npcTrust: { npcId: 'canyon-ghost', level: 5 },
          minCriminalRep: 75,
        },
        content: {
          actions: ['access-vault', 'steal-from-gang'],
          npcs: ['vault-guard'],
          dialogue: ['*whispered* You\'ve earned this. Take your share from our victories.'],
          rewards: { gold: 2000, xp: 300, items: ['gang-medallion', 'rare-weapons'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 10, frontera: 85 },
    isUnlocked: false, // Requires discovery or criminal reputation
    isHidden: true,
  },
];

/**
 * Seed Longhorn Ranch buildings into the database
 */
export async function seedLonghornRanchBuildings(): Promise<void> {
  try {
    // Verify Longhorn Ranch exists
    const longhornRanch = await Location.findById(LOCATION_IDS.LONGHORN_RANCH);
    if (!longhornRanch) {
      console.warn('Warning: Longhorn Ranch location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Longhorn Ranch buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.LONGHORN_RANCH });

    // Insert Longhorn Ranch buildings
    await Location.insertMany(longhornRanchBuildings);

    console.log(`Successfully seeded ${longhornRanchBuildings.length} Longhorn Ranch buildings`);
  } catch (error) {
    console.error('Error seeding Longhorn Ranch buildings:', error);
    throw error;
  }
}

/**
 * Seed Sangre Canyon buildings into the database
 */
export async function seedSangreCanyonBuildings(): Promise<void> {
  try {
    // Verify Sangre Canyon exists
    const sangreCanyon = await Location.findById(LOCATION_IDS.SANGRE_CANYON);
    if (!sangreCanyon) {
      console.warn('Warning: Sangre Canyon location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Sangre Canyon buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.SANGRE_CANYON });

    // Insert Sangre Canyon buildings
    await Location.insertMany(sangreCanyonBuildings);

    console.log(`Successfully seeded ${sangreCanyonBuildings.length} Sangre Canyon buildings`);
  } catch (error) {
    console.error('Error seeding Sangre Canyon buildings:', error);
    throw error;
  }
}

/**
 * Seed all ranch and canyon buildings
 */
export async function seedAllRanchAndCanyonBuildings(): Promise<void> {
  await seedLonghornRanchBuildings();
  await seedSangreCanyonBuildings();
  console.log('Successfully seeded all Ranch and Canyon buildings');
}

export default {
  longhornRanchBuildings,
  sangreCanyonBuildings,
  seedLonghornRanchBuildings,
  seedSangreCanyonBuildings,
  seedAllRanchAndCanyonBuildings,
};
