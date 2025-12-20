/**
 * Goldfinger's Mine & Spirit Springs Buildings Seed Data
 *
 * Seeds the database with 16 buildings:
 * - 8 buildings for Goldfinger's Mine (industrial mining operation with cursed depths)
 * - 8 buildings for Spirit Springs (mystical Nahi sacred site)
 */

import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for Goldfinger's Mine
export const GOLDFINGERS_MINE_BUILDING_IDS = {
  MINE_SHAFT_ENTRANCE: new mongoose.Types.ObjectId('6506a0000000000000000001'),
  ASSAY_OFFICE: new mongoose.Types.ObjectId('6506a0000000000000000002'),
  COMPANY_STORE: new mongoose.Types.ObjectId('6506a0000000000000000003'),
  MINERS_BARRACKS: new mongoose.Types.ObjectId('6506a0000000000000000004'),
  SMELTING_WORKS: new mongoose.Types.ObjectId('6506a0000000000000000005'),
  MINE_OFFICE: new mongoose.Types.ObjectId('6506a0000000000000000006'),
  POWDER_MAGAZINE: new mongoose.Types.ObjectId('6506a0000000000000000007'),
  DEEP_TUNNEL_ENTRANCE: new mongoose.Types.ObjectId('6506a0000000000000000008'),
};

// Building IDs for Spirit Springs
export const SPIRIT_SPRINGS_BUILDING_IDS = {
  SACRED_POOL: new mongoose.Types.ObjectId('6507a0000000000000000001'),
  MEDICINE_LODGE: new mongoose.Types.ObjectId('6507a0000000000000000002'),
  SWEAT_LODGE: new mongoose.Types.ObjectId('6507a0000000000000000003'),
  ELDERS_TENT: new mongoose.Types.ObjectId('6507a0000000000000000004'),
  TRADING_POST: new mongoose.Types.ObjectId('6507a0000000000000000005'),
  VISION_ROCK: new mongoose.Types.ObjectId('6507a0000000000000000006'),
  SACRED_SPRINGS_BATHHOUSE: new mongoose.Types.ObjectId('6507a0000000000000000007'),
  SHAMANS_RETREAT: new mongoose.Types.ObjectId('6507a0000000000000000008'),
};

// ============================================================================
// GOLDFINGER'S MINE BUILDINGS (8)
// Theme: Industrial mining, cursed gold, supernatural horror, dangerous labor
// ============================================================================

export const goldfingersMineBuildings = [
  // ===== 1. MINE SHAFT ENTRANCE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.MINE_SHAFT_ENTRANCE,
    name: 'Mine Shaft Entrance',
    description: 'The main gateway to the underground labyrinth where fortunes are made and lives are lost. Foreman "Hardrock" Harrigan stands at the entrance with his clipboard, sending men into darkness with little regard for safety. The timber supports creak ominously, and everyone knows the deep shaft is unstable.',
    shortDescription: 'Main mine access and shift assignment',
    type: 'mine',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 3,
    dominantFaction: 'settler',
    operatingHours: { open: 5, close: 22 },
    atmosphere: 'The shaft mouth yawns like a hungry mouth, swallowing streams of tired men with lunch pails and pickaxes. Steam from underground vents creates ghostly fog. The mechanical lift clanks and groans as cages descend into blackness. The smell of sweat, ore dust, and fear permeates everything. Cave-ins are so common they barely make conversation.',
    npcs: [
      {
        id: 'hardrock-harrigan',
        name: 'Foreman "Hardrock" Harrigan',
        title: 'Mine Foreman',
        description: 'A barrel-chested man with a face carved from granite and a voice like grinding stone. He lost his left hand in a cave-in but stayed on, claiming the mine owns him now. He drives men hard and safety is always secondary to production quotas. Goldfinger himself promoted Harrigan for his ruthless efficiency.',
        personality: 'Gruff, demanding, and cynical. He has seen too many men die and stopped caring years ago. Respects hard workers but has no patience for complainers.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Down you go. Try not to die - paperwork is murder.',
          'Safety? This is a MINE, boy. Danger is in the job description.',
          'Lost three men last week. Need replacements by Monday.',
          'That unstable shaft? Someone brave enough could get rich. Or dead. Probably both.',
        ],
        quests: ['clear-unstable-shaft', 'meet-production-quota', 'investigate-sabotage'],
      },
      {
        id: 'canary-joe',
        name: 'Canary Joe',
        title: 'Safety Officer',
        description: 'A thin, nervous man who carries a caged canary everywhere. He tries to enforce safety regulations but is constantly overruled by Harrigan and management. The miners appreciate his efforts even if they are futile.',
        personality: 'Anxious, well-meaning, and perpetually ignored. Genuinely wants to save lives.',
        dialogue: [
          'Check your lamp oil before descending. Please.',
          'That tunnel is marked unstable. Which means Harrigan will send you there.',
          'My canary died this morning. Bad omen.',
          'I file safety reports. They use them to light cigars.',
        ],
      },
    ],
    availableActions: ['descend-mine', 'check-shift-board', 'inspect-equipment', 'talk-to-miners'],
    availableCrimes: ['Sabotage Equipment', 'Steal Tools', 'Clock Fraud'],
    jobs: [
      {
        id: 'mining-shift',
        name: 'Mining Shift',
        description: 'Work a grueling 10-hour shift in the tunnels. Dangerous but pays.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 15, goldMax: 30, xp: 35, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'ore-hauling',
        name: 'Ore Hauling',
        description: 'Transport heavy ore carts from deep tunnels to the surface.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 12, goldMax: 25, xp: 28, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'timber-support',
        name: 'Timber Support Work',
        description: 'Shore up tunnel supports. Skilled and dangerous work.',
        energyCost: 22,
        cooldownMinutes: 50,
        rewards: { goldMin: 18, goldMax: 32, xp: 38, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'unstable-shaft-riches',
        name: 'The Unstable Shaft',
        description: 'A collapsed section of tunnel that Harrigan sealed off. His private maps show it leads to the richest gold vein in the entire mine - possibly millions in ore. But the supports are rotten and one wrong step could bury you forever. Only the foolhardy or desperate venture there.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 30,
          npcTrust: { npcId: 'hardrock-harrigan', level: 3 },
        },
        content: {
          actions: ['explore-unstable-shaft', 'mine-rich-vein', 'install-supports'],
          npcs: [],
          dialogue: [
            'That shaft will make you rich or dead. Maybe both. You got the stones to try it?',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. ASSAY OFFICE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.ASSAY_OFFICE,
    name: 'Assay Office',
    description: 'Where ore becomes wealth. Assayer Cornelius Webb evaluates every rock with scientific precision, determining how much gold each contains. His honesty is legendary - he will tell you the exact value. His greed is equally legendary - he always wants to buy your ore below market price.',
    shortDescription: 'Ore evaluation and certification',
    type: 'assay_office',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 3,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'Scientific instruments gleam on workbenches. Scales of incredible precision measure tiny gold fragments. Cornelius Webb peers through magnifying lenses, his lips moving as he calculates values. Sample trays overflow with ore chips. The smell of chemicals used in testing fills the air. A large safe dominates one wall.',
    npcs: [
      {
        id: 'cornelius-webb',
        name: 'Cornelius Webb',
        title: 'Chief Assayer',
        description: 'A bespectacled man of 45 with ink-stained fingers and a mind for numbers. He can evaluate ore quality with a single glance after 20 years in the business. He is scrupulously honest in his assessments but ruthlessly greedy in his offers. He dreams of owning his own mine someday.',
        personality: 'Precise, honest about values but manipulative about prices. Loves knowledge and gold equally.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'This ore assays at 0.7 ounces per ton. Very respectable.',
          'My evaluation is always accurate. My offer, however, factors in market conditions.',
          'I will tell you the truth about your ore. The question is, can you afford to keep it?',
          'Every rock tells a story if you know how to listen.',
        ],
        isVendor: true,
        shopId: 'assay-office-shop',
        quests: ['find-platinum-sample', 'evaluate-mysterious-ore'],
      },
      {
        id: 'lucy-chen',
        name: 'Lucy Chen',
        title: 'Junior Assayer',
        description: 'A brilliant young Chinese woman who learned the trade from her father. She is faster than Webb and equally accurate, but he refuses to give her full credit. She handles the overflow work and dreams of opening her own office.',
        personality: 'Ambitious, skilled, and frustrated by lack of recognition. Friendly to those who respect her.',
        dialogue: [
          'Mr. Webb taught me well. Too well, perhaps. I might be better than him.',
          'You want a second opinion? I can do it faster and just as accurately.',
          'My father was an assayer in San Francisco. I will honor his legacy.',
        ],
      },
    ],
    availableActions: ['evaluate-ore', 'sell-ore', 'buy-certificate', 'learn-assaying'],
    availableCrimes: ['Forge Certificates', 'Switch Samples', 'Steal Gold Samples'],
    jobs: [
      {
        id: 'ore-evaluation',
        name: 'Ore Evaluation Work',
        description: 'Assist with evaluating and cataloging ore samples.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 18, goldMax: 28, xp: 30, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'certificate-production',
        name: 'Certificate Production',
        description: 'Create official gold certificates for verified ore.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 25, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'assay-office-shop',
        name: 'Assay Office Equipment',
        description: 'Mining equipment and assaying tools.',
        shopType: 'specialty',
        items: [
          { itemId: 'gold-pan', name: 'Gold Pan', description: 'Essential prospecting tool', price: 15 },
          { itemId: 'magnifying-loupe', name: 'Magnifying Loupe', description: 'Examine ore quality', price: 25 },
          { itemId: 'testing-kit', name: 'Ore Testing Kit', description: 'Portable assay equipment', price: 75, requiredLevel: 5 },
          { itemId: 'gold-certificate', name: 'Gold Certificate (Blank)', description: 'Official ore certification', price: 50, requiredLevel: 8 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. COMPANY STORE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.COMPANY_STORE,
    name: 'Company Store',
    description: 'The economic trap that keeps miners perpetually in debt. Everything a miner needs is here, at prices 300% above normal. Clerk Pennelope Price runs the register with dead eyes, trapped by the same system that enslaves the miners. The ledger books tell stories of broken dreams.',
    shortDescription: 'Mining supplies and provisions',
    type: 'general_store',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 3,
    dominantFaction: 'settler',
    operatingHours: { open: 5, close: 22 },
    atmosphere: 'Cramped shelves overflow with tools, canned goods, and mining supplies. Everything is dusty and overpriced. The air smells of leather, tobacco, and desperation. A large ledger on the counter records debts in Pennelope\'s precise handwriting. Signs proclaim "Company Credit Available" and "Prices Subject to Change." Most miners owe more than they earn.',
    npcs: [
      {
        id: 'pennelope-price',
        name: 'Pennelope Price',
        title: 'Store Clerk',
        description: 'A woman of 28 who looks 45, worn down by the weight of the system she perpetuates. She came West with dreams of freedom but ended up trapped by debt to the mine. She records every purchase, knowing she is helping enslave men just as she is enslaved. Kind eyes hide deep sadness.',
        personality: 'Weary, sympathetic, but powerless to help. Dreams constantly of escape but cannot imagine how.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'That will be six dollars. I can put it on your account if you like.',
          'Everyone starts with hope. Then they see the ledger.',
          'I dream of leaving. But I owe more than three years wages.',
          'You want to know how much you owe? Sit down first.',
        ],
        isVendor: true,
        shopId: 'company-store-shop',
        quests: ['erase-her-debt', 'expose-price-gouging'],
      },
      {
        id: 'grumpy-tom',
        name: 'Grumpy Tom',
        title: 'Stock Manager',
        description: 'An old miner too broken to work the shafts anymore. He moves inventory and mutters about the old days. He paid off his debt once, then got injured and fell back into it. Now he will die in debt.',
        personality: 'Bitter, cynical, but occasionally helpful to young miners he sees himself in.',
        dialogue: [
          'This pickaxe costs what I used to make in a week. Highway robbery.',
          'I been paid off once. Felt like being free. Then I got hurt.',
          'They own us, son. Sooner you accept it, the less it hurts.',
        ],
      },
    ],
    availableActions: ['buy-supplies', 'check-account', 'take-credit', 'review-debts'],
    availableCrimes: ['Shoplift', 'Alter Ledger', 'Steal from Till'],
    jobs: [
      {
        id: 'stock-inventory',
        name: 'Stock Inventory',
        description: 'Count and organize store inventory. Boring but steady.',
        energyCost: 12,
        cooldownMinutes: 25,
        rewards: { goldMin: 10, goldMax: 18, xp: 20, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'delivery-work',
        name: 'Delivery Work',
        description: 'Deliver supplies to miners in the camps and tunnels.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 12, goldMax: 22, xp: 25, items: [] },
        requirements: { minLevel: 1 },
      },
    ],
    shops: [
      {
        id: 'company-store-shop',
        name: 'Company Store',
        description: 'Everything a miner needs at prices they cannot afford.',
        shopType: 'general',
        items: [
          { itemId: 'pickaxe', name: 'Pickaxe', description: 'Basic mining tool', price: 35 },
          { itemId: 'miners-lamp', name: 'Miner\'s Lamp', description: 'Oil lamp for tunnels', price: 28 },
          { itemId: 'work-gloves', name: 'Work Gloves', description: 'Leather work gloves', price: 15 },
          { itemId: 'lunch-pail', name: 'Lunch Pail', description: 'Daily meal, overpriced', price: 8 },
          { itemId: 'dynamite', name: 'Dynamite Stick', description: 'Blasting explosive', price: 75, requiredLevel: 5 },
          { itemId: 'safety-rope', name: 'Safety Rope (100ft)', description: 'Could save your life', price: 45 },
          { itemId: 'tobacco', name: 'Tobacco Pouch', description: 'Only comfort down below', price: 12 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'debt-ledger-secrets',
        name: 'The Master Ledger',
        description: 'Hidden in Pennelope\'s desk is the true accounting ledger showing how the mine deliberately inflates prices and manipulates debts to keep workers enslaved. Evidence of illegal price fixing, fraudulent debt calculations, and collusion with other mining companies. This information could spark a miners\' revolt.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 40,
          npcTrust: { npcId: 'pennelope-price', level: 4 },
        },
        content: {
          actions: ['study-ledger', 'copy-evidence', 'expose-fraud', 'blackmail-management'],
          npcs: [],
          dialogue: [
            'This proves everything. They are keeping us in chains. What will you do with this knowledge?',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. MINERS' BARRACKS =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.MINERS_BARRACKS,
    name: 'Miners\' Barracks',
    description: 'Long bunkhouses crammed with exhausted men sleeping in shifts. Union Man Patrick O\'Brien moves through the bunks quietly organizing resistance. The air is thick with sweat, snoring, and whispered plans for strikes. Most men are too tired to dream of rebellion, but O\'Brien never stops trying.',
    shortDescription: 'Worker housing and union organizing',
    type: 'camp',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Rows of rough bunks fill long wooden buildings. Men sleep fully clothed, ready for the next shift. Personal belongings fit in a single crate. The smell of unwashed bodies and dirty socks pervades everything. At night, O\'Brien holds secret meetings by candlelight, planning strikes and safety demands. Guards patrol outside, watching for union activity.',
    npcs: [
      {
        id: 'patrick-obrien',
        name: 'Patrick O\'Brien',
        title: 'Union Organizer',
        description: 'A passionate Irish immigrant with fire in his eyes and eloquence in his voice. He survived mining disasters in Pennsylvania and Colorado before coming West. He has organized three successful strikes and been beaten twice by company thugs. He will not stop fighting until workers are treated fairly or he is dead.',
        personality: 'Passionate, eloquent, and brave to the point of recklessness. Inspiring speaker who believes in worker solidarity.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Brothers, we dig their gold while they count their riches. When do WE prosper?',
          'They can beat us, jail us, fire us - but they cannot stop the union idea.',
          'Eight men died last month. EIGHT. And management called it "acceptable losses."',
          'Strike? Damn right we strike. But we need more men to have the courage.',
        ],
        quests: ['organize-union-meeting', 'collect-strike-votes', 'protect-union-from-thugs'],
      },
      {
        id: 'big-sven',
        name: 'Big Sven Johannson',
        title: 'Senior Miner',
        description: 'A massive Swedish immigrant who has worked the mines for 15 years. He is cautious about O\'Brien\'s union talk, having seen strikes broken bloodily. But he is tired of seeing friends die for company profits.',
        personality: 'Cautious, practical, and protective of younger miners. Respected by all for his strength and fairness.',
        dialogue: [
          'Patrick talks good. But talk does not stop bullets when strike-breakers come.',
          'I been here fifteen years. Seen a lot of good men buried.',
          'Union is dangerous. But so is saying nothing while men die.',
        ],
      },
    ],
    availableActions: ['rest', 'attend-union-meeting', 'recruit-members', 'hide-pamphlets'],
    availableCrimes: ['Steal from Bunks', 'Plant Evidence', 'Sabotage Report'],
    jobs: [
      {
        id: 'union-organizing',
        name: 'Union Organizing',
        description: 'Recruit miners to the union cause. Dangerous work.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 0, goldMax: 10, xp: 40, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'safety-inspections',
        name: 'Safety Inspections',
        description: 'Document unsafe conditions for union complaints.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 15, goldMax: 25, xp: 35, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'strike-plans',
        name: 'Hidden Strike Plans',
        description: 'Beneath a loose floorboard in O\'Brien\'s bunk are detailed plans for a territory-wide mining strike, correspondence with other union organizers, and damning evidence of company sabotage that killed workers. Also hidden is proof that management hired thugs to murder union leaders. If discovered by management, O\'Brien and everyone involved would be killed.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 50,
          npcTrust: { npcId: 'patrick-obrien', level: 5 },
        },
        content: {
          actions: ['study-strike-plans', 'contact-other-unions', 'expose-company-murders', 'organize-territory-strike'],
          npcs: ['big-sven'],
          dialogue: [
            'You are in now, brother. If management finds this, we all hang. But it is time workers took back their dignity.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 70, nahiCoalition: 10, frontera: 20 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. SMELTING WORKS =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.SMELTING_WORKS,
    name: 'Smelting Works',
    description: 'Hell brought to earth. Massive furnaces roar at temperatures that melt gold from ore. Smelter Boss Wilhelm Kruger runs operations with Teutonic precision, demanding perfection in every pour. The heat is unbearable, accidents are common, and the refined gold bars that emerge are worth fortunes.',
    shortDescription: 'Ore processing and metal refining',
    type: 'blacksmith',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 3,
    dominantFaction: 'settler',
    operatingHours: { open: 0, close: 23 }, // Furnaces run 24/7
    atmosphere: 'Infernal heat blasts from enormous furnaces. Molten metal glows orange and white. Workers stripped to the waist shovel ore and tend crucibles. Kruger barks orders in German-accented English, inspecting every process. The smell of sulfur, coal smoke, and burning metal overwhelms. Gold bars cool in molds, each one representing months of miners\' labor.',
    npcs: [
      {
        id: 'wilhelm-kruger',
        name: 'Wilhelm Kruger',
        title: 'Smelter Boss',
        description: 'A perfectionist German engineer in his 50s with burn scars covering his forearms. He learned metallurgy in Berlin and perfected it in California before coming to Sangre Territory. He demands precision in measurements, temperatures, and timing. A single degree wrong and the batch is ruined. He is harsh but fair, and takes pride in producing the purest gold bars in the West.',
        personality: 'Demanding, precise, and passionate about his craft. Respects competence and despises sloppiness.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Precision! The temperature must be EXACT or the gold is impure!',
          'I learned metallurgy from the best in Deutschland. Now I teach it to cowboys.',
          'This bar is 99.8% pure. Acceptable. Barely.',
          'You want to work here? Show me you can follow instructions TO THE LETTER.',
        ],
        isVendor: true,
        shopId: 'smelting-works-shop',
        quests: ['perfect-gold-pour', 'source-rare-metals', 'catch-gold-thief'],
      },
      {
        id: 'burns-mcgee',
        name: '"Burns" McGee',
        title: 'Lead Furnace Operator',
        description: 'An Irishman covered in burn scars from 20 years of smelting. He lost part of his left ear to molten gold splash. He can judge furnace temperature by color alone and knows when a pour will succeed or fail by instinct.',
        personality: 'Gruff, experienced, and darkly humorous about his injuries. Respected by all furnace workers.',
        dialogue: [
          'See that orange glow? Too cold. Needs another ten minutes.',
          'Lost my ear in \'79. Could have been worse - could have been my eyes.',
          'Kruger is a hard bastard, but he knows his business.',
          'Every scar tells a story. I got a lot of stories.',
        ],
      },
    ],
    availableActions: ['smelt-ore', 'pour-bars', 'learn-metallurgy', 'inspect-furnaces'],
    availableCrimes: ['Steal Gold Bar', 'Sabotage Furnace', 'Skim Gold'],
    jobs: [
      {
        id: 'ore-processing',
        name: 'Ore Processing',
        description: 'Feed ore into furnaces and tend the smelting process.',
        energyCost: 25,
        cooldownMinutes: 50,
        rewards: { goldMin: 22, goldMax: 38, xp: 40, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'furnace-operation',
        name: 'Furnace Operation',
        description: 'Skilled work operating high-temperature furnaces.',
        energyCost: 30,
        cooldownMinutes: 60,
        rewards: { goldMin: 28, goldMax: 48, xp: 50, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'bar-casting',
        name: 'Gold Bar Casting',
        description: 'Pour and cast refined gold into standard bars.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 42, xp: 45, items: [] },
        requirements: { minLevel: 7 },
      },
    ],
    shops: [
      {
        id: 'smelting-works-shop',
        name: 'Refined Metals',
        description: 'High-quality refined metals and bars.',
        shopType: 'specialty',
        items: [
          { itemId: 'copper-bar', name: 'Copper Bar', description: 'Pure refined copper', price: 25 },
          { itemId: 'silver-bar', name: 'Silver Bar (1oz)', description: 'Pure silver', price: 150 },
          { itemId: 'gold-bar', name: 'Gold Bar (1oz)', description: 'Pure gold, 99.8%', price: 1200, requiredLevel: 10 },
          { itemId: 'platinum-bar', name: 'Platinum Bar (1oz)', description: 'Extremely rare', price: 2000, requiredLevel: 15 },
          { itemId: 'heat-gloves', name: 'Heat-Resistant Gloves', description: 'Essential for furnace work', price: 45 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. MINE OFFICE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.MINE_OFFICE,
    name: 'Mine Office',
    description: 'The nerve center of the mining operation where owner Jasper Goldfinger III makes his fortune. Mahogany desk, expensive cigars, and leather chairs stand in stark contrast to the poverty outside. Here deals are made, claims are stolen legally, and the books are carefully cooked to maximize profits.',
    shortDescription: 'Mine administration and business office',
    type: 'settlement',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 4,
    dominantFaction: 'settler',
    operatingHours: { open: 8, close: 18 },
    atmosphere: 'Opulent compared to everything else at the mine. Persian rugs, oil paintings of the Goldfinger family, a mahogany desk imported from Philadelphia. Jasper Goldfinger III holds court here, smoking expensive cigars and making deals that enrich him while miners die below. Filing cabinets contain property deeds, claim records, and financial ledgers. Two armed guards stand outside.',
    npcs: [
      {
        id: 'jasper-goldfinger-iii',
        name: 'Jasper Goldfinger III',
        title: 'Mine Owner',
        description: 'A ruthless businessman in his 40s who inherited the mine from his father. He wears tailored suits and never gets his hands dirty. He sees miners as expendable resources and views safety regulations as obstacles to profit. He has bribed judges, intimidated rivals, and stolen dozens of claims through legal manipulation. His grandfather discovered the mine; he perfected extracting wealth from it.',
        personality: 'Ruthless, charming when it suits him, and absolutely amoral. Views everything through the lens of profit.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Every mine has acceptable casualty rates. We are well within parameters.',
          'The beauty of capitalism is that it transforms tragedy into opportunity.',
          'My grandfather found the gold. I found how to keep it.',
          'Union talk? Fire them all. There are always more desperate men.',
        ],
        quests: ['acquire-rival-claim', 'suppress-union-activity', 'negotiate-land-deal'],
      },
      {
        id: 'edwin-sharpe',
        name: 'Edwin Sharpe',
        title: 'Company Lawyer',
        description: 'A snake in a suit. Sharpe handles all legal matters for the mine, specializing in claim jumping, contract manipulation, and union-busting. He can find loopholes in any agreement and has never lost a case in Sangre Territory - mostly because he bribes the judges.',
        personality: 'Slick, manipulative, and completely without conscience. Proud of his legal prowess.',
        dialogue: [
          'The law is a wonderful tool when you know how to wield it.',
          'That claim? I found three irregularities in the filing. It is ours now.',
          'Union contracts? I have written clauses that make them unenforceable.',
          'Justice is what the judge says it is. And I know all the judges.',
        ],
      },
    ],
    availableActions: ['negotiate-contracts', 'review-claims', 'bribe-officials', 'access-records'],
    availableCrimes: ['Steal Deeds', 'Forge Documents', 'Blackmail'],
    jobs: [
      {
        id: 'bookkeeping',
        name: 'Bookkeeping',
        description: 'Maintain financial records and production reports.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 20, goldMax: 35, xp: 30, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'land-deals',
        name: 'Land Acquisition',
        description: 'Help negotiate and process claim purchases.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 25, goldMax: 45, xp: 40, items: [] },
        requirements: { minLevel: 8 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'claim-jumping-records',
        name: 'The Hidden Safe',
        description: 'Behind a false panel in Goldfinger\'s office is a safe containing records of every illegal claim jump, bribery payment, and fraudulent deed in the mine\'s history. Evidence of murdered claim holders, forged documents, and payments to corrupt officials. This information could destroy the Goldfinger family and trigger lawsuits worth millions.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 70,
          npcTrust: { npcId: 'jasper-goldfinger-iii', level: 4 },
        },
        content: {
          actions: ['study-records', 'copy-evidence', 'blackmail-goldfinger', 'expose-fraud'],
          npcs: [],
          dialogue: [
            'You have earned my trust. These records represent the true foundation of my fortune. Use them wisely - or we both hang.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 95, nahiCoalition: 0, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ===== 7. POWDER MAGAZINE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.POWDER_MAGAZINE,
    name: 'Powder Magazine',
    description: 'A reinforced building set apart from other structures, storing thousands of pounds of explosives. "Boom Boom" Betty supervises all blasting operations with manic enthusiasm. She loves explosions a bit too much. Rumors persist that she has stolen military-grade explosives hidden somewhere in the magazine.',
    shortDescription: 'Explosives storage and blasting operations',
    type: 'camp',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 3,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'Heavily fortified with thick walls and a reinforced door. Shelves hold crates of dynamite, blasting caps, fuses, and other explosives. Everything is meticulously organized and labeled. A strict sign-in/sign-out system tracks every stick of dynamite. Betty keeps her tools immaculate and her explosives perfectly arranged. The faint smell of nitroglycerin permeates everything. Everyone speaks quietly here, as if loud noise might set something off.',
    npcs: [
      {
        id: 'boom-boom-betty',
        name: '"Boom Boom" Betty Thompson',
        title: 'Demolitions Expert',
        description: 'A wild-eyed woman in her 30s who discovered her calling when she accidentally set off dynamite as a teenager. She lost two fingers on her left hand to a premature detonation but considers it a fair trade for the knowledge gained. She can calculate blast patterns in her head and place charges with surgical precision. Management tolerates her eccentricity because she is the best at what she does.',
        personality: 'Manic, brilliant, and possibly insane. Loves explosions with childlike enthusiasm. Utterly fearless.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'You know what I love? The moment right before the boom. Pure potential.',
          'Lost two fingers learning this trade. Best education I ever got.',
          'Want to see something beautiful? Watch me drop a tunnel ceiling with one charge.',
          'They think I am crazy. Maybe I am. But I am GOOD at this.',
        ],
        isVendor: false,
        quests: ['precision-blast', 'clear-rock-fall', 'secret-demolition'],
      },
      {
        id: 'nervous-ned',
        name: 'Nervous Ned',
        title: 'Powder Assistant',
        description: 'A perpetually anxious young man who helps Betty but is terrified of explosives. He maintains inventory and handles paperwork while staying as far from actual blasting as possible.',
        personality: 'Anxious, detail-oriented, and wishes he worked anywhere else.',
        dialogue: [
          'Please be careful with that. Please. PLEASE.',
          'Betty signed out 40 sticks yesterday. Should have been 30. Where did the other 10 go?',
          'I have nightmares about this place exploding.',
          'Why did I take this job? Oh right, the pay. Not worth it.',
        ],
      },
    ],
    availableActions: ['request-explosives', 'learn-blasting', 'conduct-controlled-blast'],
    availableCrimes: ['Steal Dynamite', 'Forge Requisition', 'Plant Explosives'],
    jobs: [
      {
        id: 'blasting-operations',
        name: 'Blasting Operations',
        description: 'Assist with controlled explosions to open new tunnels.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 55, xp: 55, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'demolition-work',
        name: 'Demolition Work',
        description: 'Help place and detonate charges for rock removal.',
        energyCost: 22,
        cooldownMinutes: 50,
        rewards: { goldMin: 28, goldMax: 50, xp: 50, items: [] },
        requirements: { minLevel: 6 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'military-explosives',
        name: 'Hidden Military Cache',
        description: 'In a concealed compartment beneath the main floor, Betty has stashed stolen military-grade explosives - TNT, nitroglycerin, and experimental blasting compounds "liberated" from an Army munitions train. Enough explosive power to level half the mine. She keeps it for "special projects" and emergencies. If discovered, she would be hanged for theft of military property.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 60,
          npcTrust: { npcId: 'boom-boom-betty', level: 5 },
        },
        content: {
          actions: ['access-military-explosives', 'plan-major-blast', 'purchase-banned-explosives'],
          npcs: [],
          dialogue: [
            'You want to know my secret? I got enough boom here to reshape the landscape. What you want to reshape?',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ===== 8. DEEP TUNNEL ENTRANCE =====
  {
    _id: GOLDFINGERS_MINE_BUILDING_IDS.DEEP_TUNNEL_ENTRANCE,
    name: 'Deep Tunnel Entrance',
    description: 'The mouth of the deepest, most dangerous section of Goldfinger\'s Mine. This is where the original disaster occurred - a catastrophic collapse that killed dozens of miners and unleashed something far worse than cave-ins. The tunnel descends into absolute darkness, and those who enter speak of voices in the dark, ghostly lights, and an overwhelming sense of dread. The gold down here is incredibly rich, but it comes with a terrible price. The workers call it "cursed gold" and whisper that the mine itself is hungry.',
    shortDescription: 'Gateway to the cursed depths where fortunes and souls are lost',
    type: 'mine_tunnel',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.GOLDFINGERS_MINE,
    tier: 4,
    dominantFaction: 'settler',
    operatingHours: { open: 6, close: 18 }, // Shorter hours - nobody wants to be here after dark
    atmosphere: 'Cold air flows from the tunnel entrance like the breath of some vast underground beast. The timber supports are newer here, replacing the rotted frames that failed during the collapse. Burn marks and blast scoring mar the walls. A memorial plaque lists 47 names of miners who died in the original disaster. The deeper sections glow with an eerie phosphorescence that has no natural explanation. Experienced miners cross themselves before entering. The smell of sulfur, decay, and something sweet and rotten permeates the air. At night, people swear they hear picks striking stone and men singing work songs from tunnels that have been sealed for years.',
    npcs: [
      {
        id: 'crazy-pete',
        name: 'Crazy Pete',
        title: 'Sole Survivor',
        description: 'The only man who survived the original collapse that killed 47 miners. Pete was buried alive for six days before rescuers found him. What he experienced in that darkness broke something fundamental in his mind. He refuses to leave the mine, claiming "they" won\'t let him. His eyes have a haunted, distant look, and he speaks to people who are not there. He knows more about the deep tunnels than anyone alive, but his warnings come wrapped in madness and prophecy. Half the time he makes no sense. The other half, he is terrifyingly accurate.',
        personality: 'Fractured, haunted, and prophetic. Switches between lucidity and madness. Desperate to warn people but unable to communicate clearly.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'They died screaming. All of them. I heard every voice. Six days in the dark.',
          'The gold wants to be taken. It WANTS you. That is what makes it cursed.',
          'I tried to leave. Got as far as Silverado. Woke up here. They brought me back.',
          'You smell like fresh meat. The tunnels will like you.',
          'Count the bodies. I did. Forty-seven. But I hear forty-eight voices. Who is the extra?',
          'The gold down there glows. GLOWS. That is not natural. That is hunger.',
        ],
        isVendor: false,
        quests: ['listen-to-petes-story', 'find-the-48th-voice', 'retrieve-foremans-log'],
      },
      {
        id: 'ghost-foreman-callahan',
        name: 'Ghost of Foreman Callahan',
        title: 'Spectral Guardian',
        description: 'The ghost of Marcus Callahan, the foreman who died trying to save his men during the collapse. Unlike the angry, hungry spirits deeper in the mine, Callahan\'s ghost seems protective, trying to warn people away from the cursed tunnels. He appears as a translucent figure in work clothes, his phantom face showing the horror of his final moments. Only certain people can see him - those with "the sight" or those marked by the curse. He cannot speak, but communicates through gestures, apparitions, and by manipulating the environment.',
        personality: 'Protective, tragic, and desperate. Tries to save people from the fate that claimed him.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          '[Callahan points frantically toward the exit, his mouth moving in silent screams]',
          '[The ghost materializes, holding up his hand - STOP. His eyes plead with you to turn back]',
          '[Cold air swirls as Callahan\'s form flickers. He points to a rotted support beam, warning of danger]',
          '[The phantom foreman appears, touching his chest where the rock crushed him, then points to the gold. His message is clear: not worth it]',
          '[Callahan\'s ghost stands blocking the tunnel, shaking his head violently. Some barriers are meant to protect, not imprison]',
        ],
        isVendor: false,
        quests: ['help-callahan-rest', 'understand-the-warning', 'seal-the-breach'],
      },
      {
        id: 'maria-de-la-cruz',
        name: 'Maria de la Cruz',
        title: 'Grieving Widow',
        description: 'A woman in her thirties who lost her husband, Rodrigo, in the collapse. She comes to the tunnel entrance every day, waiting for him to emerge, even though it has been three years. She knows he is dead - his body was never recovered from the sealed sections. But she cannot leave, convinced his spirit is trapped down there, calling for her. She wears black and keeps a small shrine at the tunnel entrance with his photograph, candles, and religious medals. Her grief has given her a strange sensitivity to the supernatural. She can feel when the dead are restless.',
        personality: 'Heartbroken, determined, and spiritually aware. Her love transcends death.',
        dialogue: [
          'Rodrigo is down there. I can feel him. He calls to me in my dreams.',
          'The other widows moved on. I cannot. Not while he is trapped.',
          'They sealed the tunnel where he died. Sealed him in darkness forever.',
          'I hear them sometimes, at night. The men who died. They sing the old songs.',
          'You want to go down there? Say a prayer first. And mean it.',
          'If you find any trace of my Rodrigo - anything - please. I need to know where he rests.',
        ],
        isVendor: false,
        quests: ['find-rodrigos-remains', 'bring-peace-to-maria', 'perform-memorial-ritual'],
      },
      {
        id: 'lucky-jim-patterson',
        name: '"Lucky" Jim Patterson',
        title: 'Cursed Treasure Hunter',
        description: 'A treasure hunter who has been working the deep tunnels for six months, taking out massive amounts of cursed gold. The curse is visibly manifesting on him - his skin has a grayish pallor, his eyes have dark circles, he has lost significant weight, and he suffers from tremors and night terrors. He is obsessed with "one more haul" despite the obvious toll it is taking. His hands shake constantly, and he has developed a hacking cough. He knows he is dying but cannot stop. The gold has its hooks in him.',
        personality: 'Addicted, deteriorating, and in denial. Rationalizes the curse symptoms as normal mining hazards.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Just one more big haul. Then I am done. I swear. Just one more.',
          'What, this? Just miner\'s cough. Everybody gets it. I am fine.',
          'The gold down there is so rich it practically glows. Best strike of my life.',
          'Sure, I do not sleep much anymore. And the dreams... but that is just stress.',
          'My partners quit. Said the gold was cursed. Superstitious fools. More for me.',
          'You think I look bad? You should see how much gold I got. Totally worth it.',
          '[Coughs violently] See? Just dust. Cleared right up.',
        ],
        isVendor: false,
        quests: ['convince-jim-to-stop', 'cure-the-curse', 'witness-jims-fate'],
      },
    ],
    availableActions: [
      'descend-into-deep-tunnel',
      'examine-memorial-plaque',
      'light-candle-at-shrine',
      'speak-to-ghosts',
      'prospect-for-cursed-gold',
      'investigate-collapse-site',
    ],
    availableCrimes: [
      'Steal Cursed Gold',
      'Desecrate Memorial',
      'Rob Ghost Offerings',
      'Vandalize Warning Signs',
    ],
    jobs: [
      {
        id: 'deep-mining-operation',
        name: 'Deep Mining Operation',
        description: 'Venture into the deepest parts of the mine to extract incredibly rich gold ore. WARNING: The gold from these depths carries a supernatural curse. The more you take, the worse the effects. CURSE SCALING: 1-100g = Minor debuff (1hr), 101-500g = Moderate debuff (6hrs), 501-1000g = Severe debuff (24hrs), 1000g+ = Long-term curse requiring ritual cleansing. Mine at your own risk.',
        energyCost: 35,
        cooldownMinutes: 120,
        rewards: {
          goldMin: 75,
          goldMax: 250,
          xp: 100,
          items: [],
        },
        requirements: { minLevel: 15 },
      },
      {
        id: 'ghost-investigation',
        name: 'Ghost Investigation',
        description: 'Explore the haunted sections of the deep tunnels to uncover the truth about the mine\'s dark history. Document supernatural phenomena, search for evidence of the original disaster, and piece together what really happened. High risk of supernatural encounters.',
        energyCost: 30,
        cooldownMinutes: 90,
        rewards: { goldMin: 40, goldMax: 80, xp: 120, items: [] },
        requirements: { minLevel: 17 },
      },
      {
        id: 'rescue-rodrigos-remains',
        name: 'Rescue Rodrigo\'s Remains',
        description: 'Maria de la Cruz has asked you to venture into the sealed sections of the deep tunnel to find her husband\'s body. The area is extremely dangerous - unstable tunnels, aggressive spirits, and the curse is strongest there. But bringing his remains to the surface could give Maria peace and lay a restless spirit to rest.',
        energyCost: 40,
        cooldownMinutes: 180,
        rewards: { goldMin: 30, goldMax: 60, xp: 150, items: [] },
        requirements: { minLevel: 20 },
      },
      {
        id: 'seal-cursed-chamber',
        name: 'Seal the Cursed Chamber',
        description: 'Crazy Pete has revealed the location of the Chamber of the Damned - the ancient Native burial ground that was desecrated during the original mining operations, causing the curse. Entering the chamber is extremely dangerous, but performing a ritual sealing could stop the curse at its source. This is the ultimate challenge of Goldfinger\'s Mine.',
        energyCost: 50,
        cooldownMinutes: 1440, // Once per day
        rewards: { goldMin: 100, goldMax: 200, xp: 250, items: [] },
        requirements: { minLevel: 25 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'the-original-sin',
        name: 'The Original Sin',
        description: 'Crazy Pete, in a moment of lucidity, reveals the truth: the mine was built on top of an ancient Native burial ground sacred to a forgotten tribe. The original mining company knew this and proceeded anyway, desecrating graves in their greed for gold. The "collapse" was no accident - it was a supernatural retaliation. The spirits of the desecrated dead cursed the gold, ensuring that anyone who took it would suffer. The mine has been feeding on the greed of miners ever since.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 50,
          npcTrust: { npcId: 'crazy-pete', level: 4 },
        },
        content: {
          actions: ['learn-full-history', 'view-desecrated-graves', 'understand-the-curse'],
          npcs: [],
          dialogue: [
            'They dug right through the burial chamber. Scattered bones like they were rocks. The elders warned them. They laughed. Then they died screaming.',
          ],
        },
      },
      {
        id: 'foremans-final-log',
        name: 'Foreman Callahan\'s Final Log',
        description: 'Hidden in a collapsed section of tunnel is Foreman Callahan\'s journal from the days leading up to the disaster. His entries describe increasingly disturbing phenomena - tools disappearing, voices in the dark, miners reporting visions, and the discovery of the burial chamber. His final entry, written moments before the collapse, reveals he tried to stop the excavation of the sacred chamber but was overruled by the mine owner. "The ground is shaking. The walls are screaming. God forgive us for what we have done. God forgive—" The entry ends mid-sentence.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 60,
          questComplete: 'retrieve-foremans-log',
        },
        content: {
          actions: ['read-journal', 'deliver-to-maria', 'show-crazy-pete'],
          npcs: [],
          dialogue: [
            'This journal... it proves Callahan tried to stop it. He was a good man. And he died for their greed.',
          ],
        },
      },
      {
        id: 'chamber-of-the-damned',
        name: 'Chamber of the Damned',
        description: 'The epicenter of the curse - an ancient burial chamber deep beneath the mine. Human remains are scattered among shattered pottery and destroyed grave goods. The walls are covered in Native pictographs warning against disturbing this place. The air is thick with supernatural energy. Ghostly figures materialize and fade. The cursed gold originated here, where the miners first desecrated the graves. A massive crack in the chamber floor leads to even deeper darkness, from which emanates a palpable malevolence. This is where the curse began, and this is where it can be ended - if you are strong enough to face what dwells here. REQUIRES: Level 25+, completed "Listen to Pete\'s Story" and "Find the 48th Voice" quests.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 80,
          npcTrust: { npcId: 'crazy-pete', level: 5 },
        },
        content: {
          actions: [
            'perform-sealing-ritual',
            'confront-the-source',
            'restore-the-graves',
            'make-offering-to-spirits',
          ],
          npcs: ['ancient-spirits', 'the-source-of-curse'],
          dialogue: [
            'This is where it all began. Where greed murdered the sacred. Where the curse was born from blood and desecration.',
            'The spirits here are not evil - they are victims. Victims who became monsters in their rage.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 10, // Extremely dangerous
    factionInfluence: { settlerAlliance: 70, nahiCoalition: 20, frontera: 10 },
    isUnlocked: false, // Must be unlocked through progression
    isHidden: false,
    requirements: { minLevel: 15 },
  },
];

// ============================================================================
// SPIRIT SPRINGS BUILDINGS (6)
// Theme: Mystical healing, Nahi tradition, supernatural, sacred pilgrimage
// ============================================================================

export const spiritSpringsBuildings = [
  // ===== 1. SACRED POOL =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.SACRED_POOL,
    name: 'Sacred Pool',
    description: 'The heart of Spirit Springs, where crystalline waters bubble from deep earth warmed by ancient fires. High Priestess Moon Shadow tends the sacred waters, which the Nahi believe are a direct connection to the spirit realm. The pool has healed the sick, revealed visions, and granted wisdom for countless generations.',
    shortDescription: 'Central healing spring and spirit gateway',
    type: 'springs',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 5, close: 22, peakStart: 6, peakEnd: 9 }, // Dawn ceremonies
    atmosphere: 'Steam rises from turquoise waters that shimmer with impossible colors at dawn. The pool is perfectly circular, as if carved by divine hands. Prayer bundles hang from surrounding cottonwood trees, fluttering in the breeze. The air smells of minerals, sage, and something indefinably sacred. At certain times, the waters glow faintly. Moon Shadow moves like a living spirit, ancient and timeless.',
    npcs: [
      {
        id: 'moon-shadow',
        name: 'High Priestess Moon Shadow',
        title: 'Keeper of the Sacred Waters',
        description: 'An ancient Nahi woman whose exact age is unknown - some say she has tended these waters for a century. Her eyes are clouded with cataracts yet seem to see more than normal vision allows. She speaks in riddles and prophecies, communicating directly with the spirits that dwell in the waters. She has presided over healing ceremonies, vision quests, and sacred rituals since before the settlers came.',
        personality: 'Cryptic, wise beyond measure, and connected to forces beyond mortal understanding. Speaks in layered meanings.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The waters remember all who have bathed here. They will remember you.',
          'You seek healing? The springs heal what needs healing, not always what you wish healed.',
          'The spirits speak through the mist. Listen. Truly listen.',
          'Past and future meet here. Which do you wish to see?',
        ],
        quests: ['purification-ritual', 'communion-with-spirits', 'sacred-offering'],
      },
      {
        id: 'young-deer',
        name: 'Young Deer',
        title: 'Priestess Apprentice',
        description: 'A teenage Nahi girl learning the sacred mysteries from Moon Shadow. She is gifted with visions but still learning to interpret them. She performs daily rituals and helps pilgrims understand the ways of the springs.',
        personality: 'Earnest, spiritual, and still discovering her own power. Eager to help visitors.',
        dialogue: [
          'The High Priestess says I will succeed her. I am not ready.',
          'The waters showed me your coming. They show me many things.',
          'To enter the sacred pool, you must leave your weapons and your anger behind.',
          'Moon Shadow says the spirits are restless. Great change comes.',
        ],
      },
    ],
    availableActions: ['bathe-in-waters', 'meditate', 'offer-prayers', 'seek-vision'],
    availableCrimes: [], // Sacred ground - crimes forbidden
    jobs: [
      {
        id: 'purification-rituals',
        name: 'Purification Rituals',
        description: 'Assist with ceremonial purification of pilgrims.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 20, goldMax: 35, xp: 45, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'spiritual-guidance',
        name: 'Spiritual Guidance',
        description: 'Help guide visitors through sacred ceremonies.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 28, xp: 40, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'spirit-gateway',
        name: 'Gateway to Spirit World',
        description: 'At dawn on certain sacred days, the pool becomes a doorway to the spirit realm. Moon Shadow can guide worthy souls through this gateway to commune directly with ancestor spirits and receive profound visions. The experience transforms all who undergo it. Only those who have proven their spiritual worthiness are shown this secret.',
        type: 'secret_action',
        unlockCondition: {
          minReputation: 80,
          npcTrust: { npcId: 'moon-shadow', level: 5 },
        },
        content: {
          actions: ['enter-spirit-realm', 'commune-with-ancestors', 'receive-prophecy'],
          npcs: ['young-deer'],
          dialogue: [
            'The gateway opens. The spirits have judged you worthy. What you see beyond will change you forever.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 33, nahiCoalition: 34, frontera: 33 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. MEDICINE LODGE =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.MEDICINE_LODGE,
    name: 'Medicine Lodge',
    description: 'A sacred healing space where Healer Gentle Bear practices ancient Nahi medicine. Herbs dry from ceiling beams, healing crystals catch the light, and the air is thick with sage and sweetgrass. More people recover here than in any settler hospital, though doctors dismiss it as superstition.',
    shortDescription: 'Traditional healing center',
    type: 'medicine_lodge',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 6, close: 21 },
    atmosphere: 'Soft light filters through hide walls painted with healing symbols. Bundles of dried herbs hang everywhere - sage, sweetgrass, yerba santa, osha root. Crystals and sacred stones are arranged in patterns of power. Gentle Bear works quietly, grinding herbs, chanting healing songs, and treating patients with centuries-old wisdom. The space feels peaceful and safe.',
    npcs: [
      {
        id: 'gentle-bear',
        name: 'Gentle Bear',
        title: 'Master Healer',
        description: 'A warm-faced Nahi man in his 50s with hands that bring comfort and healing. He learned medicine from his grandmother and has expanded that knowledge through 30 years of practice. He treats anyone who comes seeking help, regardless of faction. Settlers who mock Nahi ways still seek him out when settler doctors fail.',
        personality: 'Warm, patient, and infinitely compassionate. Sees healing as a sacred calling.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'All healing comes from harmony - between body, spirit, and the world.',
          'Your wound is infected. The settler doctor used dirty tools. I will fix this.',
          'Pain is the body speaking. I listen to what it says.',
          'You may pay what you can. Those who have nothing receive healing just the same.',
        ],
        isVendor: true,
        shopId: 'medicine-lodge-shop',
        quests: ['gather-rare-herbs', 'heal-sick-child', 'create-medicine-bundle'],
      },
      {
        id: 'singing-crow',
        name: 'Singing Crow',
        title: 'Herbalist',
        description: 'An elderly Nahi woman who knows every plant in the territory and its uses. She gathers herbs year-round and teaches others to identify and harvest them respectfully.',
        personality: 'Gentle, knowledgeable, and passionate about plant medicine.',
        dialogue: [
          'This leaf cures fever. That root stops infection. The spirits provide all we need.',
          'You take from the earth, you give back. Always leave an offering.',
          'The settlers have much technology. We have wisdom.',
        ],
      },
    ],
    availableActions: ['seek-healing', 'learn-herbalism', 'create-medicine', 'blessing-ceremony'],
    availableCrimes: [], // Healing lodge - sacred neutrality
    jobs: [
      {
        id: 'herb-preparation',
        name: 'Herb Preparation',
        description: 'Help prepare medicinal herbs and healing compounds.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 30, items: ['healing-herbs'] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'healing-ceremonies',
        name: 'Healing Ceremonies',
        description: 'Assist with traditional healing rituals.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 20, goldMax: 35, xp: 40, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'medicine-lodge-shop',
        name: 'Sacred Medicines',
        description: 'Traditional healing medicines and blessed items.',
        shopType: 'medicine',
        items: [
          { itemId: 'healing-tea', name: 'Healing Tea', description: 'Restores vitality naturally', price: 15 },
          { itemId: 'sage-bundle', name: 'Sage Bundle', description: 'For cleansing and protection', price: 10 },
          { itemId: 'pain-poultice', name: 'Pain Poultice', description: 'Draws out pain and poison', price: 20 },
          { itemId: 'spirit-medicine', name: 'Spirit Medicine', description: 'Treats spiritual ailments', price: 40, requiredLevel: 5 },
          { itemId: 'vision-tea', name: 'Vision Tea', description: 'Opens inner sight', price: 60, requiredLevel: 8 },
          { itemId: 'blessing-oil', name: 'Blessing Oil', description: 'Consecrated protection', price: 35 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 30, nahiCoalition: 40, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. SWEAT LODGE =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.SWEAT_LODGE,
    name: 'Sweat Lodge',
    description: 'A dome-shaped structure where Fire Keeper Red Hawk conducts purification ceremonies. Heated stones fill the interior with cleansing steam. Warriors come here before battle, seekers before vision quests, and the troubled to burn away their demons. The experience is intense, transformative, and not for the weak.',
    shortDescription: 'Purification and warrior ceremonies',
    type: 'spirit_lodge',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 3,
    dominantFaction: 'nahi',
    operatingHours: { open: 15, close: 23 }, // Afternoon and evening
    atmosphere: 'A low dome covered in hides and earth. Inside, darkness and overwhelming heat. Red-hot stones glow in the center pit. Steam erupts as water hits the stones. The air is so hot it burns the lungs. Participants sit in a circle, sweating out toxins, fears, and weakness. Red Hawk\'s voice booms through the darkness, guiding the ceremony with power and intensity.',
    npcs: [
      {
        id: 'red-hawk',
        name: 'Fire Keeper Red Hawk',
        title: 'Sweat Lodge Master',
        description: 'A fierce Nahi warrior-shaman in his 40s with a body covered in ceremonial scars. He leads purification ceremonies with intimidating intensity, pushing participants to their limits. He believes weakness must be burned away to reveal strength. Many fear him, but those who complete his ceremonies emerge transformed.',
        personality: 'Intense, demanding, and spiritually powerful. Shows no mercy during ceremonies but deep respect after.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The lodge reveals what you hide from yourself. Can you face it?',
          'Weakness burns away here. Only truth remains.',
          'Warriors prepare for battle. Seekers prepare for vision. What do YOU prepare for?',
          'You will beg to leave. If you do, you are not ready. Stay, and transformation comes.',
        ],
        quests: ['complete-warrior-purification', 'vision-quest-preparation', 'fire-ceremony'],
      },
      {
        id: 'silent-wolf',
        name: 'Silent Wolf',
        title: 'Lodge Tender',
        description: 'A young Nahi warrior who maintains the sweat lodge and heats the ceremonial stones. He speaks little but his presence is calming.',
        personality: 'Quiet, strong, and deeply respectful of tradition.',
        dialogue: [
          'The stones must be heated to the correct temperature. Too hot kills, too cool does nothing.',
          'Red Hawk is harsh because the spirits demand it.',
          'I have sweated in this lodge fifty times. Each time I am reborn.',
        ],
      },
    ],
    availableActions: ['sweat-ceremony', 'warrior-purification', 'vision-quest-prep', 'meditation'],
    availableCrimes: [], // Sacred space
    jobs: [
      {
        id: 'vision-quest-assistance',
        name: 'Vision Quest Assistance',
        description: 'Help prepare seekers for their vision quests.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 0, goldMax: 15, xp: 50, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'purification-ceremonies',
        name: 'Purification Work',
        description: 'Assist with sweat lodge purification ceremonies.',
        energyCost: 20,
        cooldownMinutes: 50,
        rewards: { goldMin: 18, goldMax: 30, xp: 45, items: [] },
        requirements: { minLevel: 7 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'warrior-spirit-summoning',
        name: 'Warrior Spirit Summoning',
        description: 'During the most intense ceremonies, Red Hawk can summon warrior spirits to possess participants temporarily, granting them combat abilities and warrior wisdom. This dangerous ritual is only performed for those proven worthy through multiple purification ceremonies. The spirits are powerful and not easily controlled.',
        type: 'secret_action',
        unlockCondition: {
          minReputation: 65,
          npcTrust: { npcId: 'red-hawk', level: 4 },
        },
        content: {
          actions: ['summon-warrior-spirit', 'receive-combat-blessing', 'undergo-spirit-possession'],
          npcs: [],
          dialogue: [
            'You have proven your strength. The warrior spirits have chosen you. Are you ready to become their vessel?',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 60, frontera: 20 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 3 },
  },

  // ===== 4. ELDER'S TENT =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.ELDERS_TENT,
    name: 'Elder\'s Tent',
    description: 'The dwelling of Elder Speaks-With-Wind, keeper of Nahi history and wisdom. Every story of the people is preserved in his memory - victories, defeats, sacred places, and prophetic warnings. He sits by his fire, sharing knowledge with those who truly wish to learn, not merely observe.',
    shortDescription: 'Wisdom keeper and living history',
    type: 'camp',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 9, close: 20 },
    atmosphere: 'A spacious hide tent filled with sacred objects - ceremonial masks, ancient weapons, painted hides depicting tribal history. A small fire burns constantly in the center. Elder Speaks-With-Wind sits on thick furs, his weathered face a map of decades lived. His voice is gentle but carries weight. Young Nahi come to learn their heritage; wise settlers come to understand what they are destroying.',
    npcs: [
      {
        id: 'speaks-with-wind',
        name: 'Elder Speaks-With-Wind',
        title: 'Keeper of Stories',
        description: 'An ancient Nahi elder who has lived through the entire conflict between settlers and the Nahi people. He remembers when the territory was purely Nahi land, witnessed the first settlers arrive, and watched the slow destruction of his people\'s way of life. Despite this, he harbors no hatred - only profound sadness and hope that understanding might yet prevail.',
        personality: 'Patient, wise, and encyclopedic in his knowledge. Speaks slowly, choosing words with great care.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'Every story has many sides. I have lived long enough to see them all.',
          'The settlers call this Sangre Territory. We call it home. We always have.',
          'History is not what happened. It is what we remember and how we tell it.',
          'You wish to know our sacred places? I will tell you - but will you respect them?',
        ],
        quests: ['learn-tribal-history', 'find-ancient-artifacts', 'record-oral-traditions'],
      },
      {
        id: 'bright-feather',
        name: 'Bright Feather',
        title: 'Story Apprentice',
        description: 'A young Nahi woman learning to become the next keeper of stories. She has memorized hundreds of stories but still has thousands more to learn before the Elder passes.',
        personality: 'Earnest, passionate about preserving her culture, and frustrated by how much has been lost.',
        dialogue: [
          'Every story the Elder tells, I commit to memory. I cannot let our history die.',
          'Settlers write history in books. We write it in memory and song.',
          'My grandmother spoke twelve languages. I speak four. Each generation, we lose more.',
        ],
      },
    ],
    availableActions: ['hear-stories', 'learn-history', 'record-traditions', 'seek-wisdom'],
    availableCrimes: [], // Profoundly disrespectful
    jobs: [
      {
        id: 'story-preservation',
        name: 'Story Preservation',
        description: 'Help record and preserve Nahi oral traditions.',
        energyCost: 10,
        cooldownMinutes: 30,
        rewards: { goldMin: 10, goldMax: 20, xp: 35, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'wisdom-seeking',
        name: 'Wisdom Seeking',
        description: 'Learn Nahi history, culture, and philosophy from the Elder.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 15, goldMax: 25, xp: 45, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'sacred-artifact-locations',
        name: 'Map of Sacred Places',
        description: 'The Elder knows the location of every sacred Nahi site in the territory - hidden shrines, burial grounds, ceremonial caves, and places of power. He also knows where ancient artifacts are hidden to protect them from settler looters. This knowledge is the most guarded secret of the Nahi people. Revealing these locations to the wrong person would be catastrophic.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 90,
          npcTrust: { npcId: 'speaks-with-wind', level: 5 },
        },
        content: {
          actions: ['learn-sacred-sites', 'locate-artifacts', 'protect-holy-ground'],
          npcs: ['bright-feather'],
          dialogue: [
            'You have proven yourself a friend to the Nahi people. I will share what must be protected. This knowledge is now your burden.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 25, nahiCoalition: 50, frontera: 25 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. TRADING POST =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.TRADING_POST,
    name: 'Spirit Springs Trading Post',
    description: 'Where cultures meet and trade flows freely. Two Worlds runs this neutral ground where settlers, Nahi, and Frontera all conduct business peacefully. Beautiful Nahi crafts, rare artifacts, and spirit items are sold alongside practical goods. This is one of the few places all factions treat as sacred neutral territory.',
    shortDescription: 'Cultural exchange and rare goods',
    type: 'trading_post',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 4,
    dominantFaction: 'nahi',
    operatingHours: { open: 7, close: 20 },
    atmosphere: 'A large wooden building displaying incredible craftsmanship. Nahi beadwork, woven baskets, and ceremonial items hang alongside settler tools and Frontera leather goods. The space is meticulously organized. Two Worlds moves between cultures effortlessly, speaking four languages fluently. The trading post smells of leather, tobacco, and exotic incense.',
    npcs: [
      {
        id: 'two-worlds',
        name: 'Two Worlds',
        title: 'Master Trader',
        description: 'Born to a Nahi mother and settler father, Two Worlds has spent his life bridging cultures. He speaks Nahi dialects, English, Spanish, and some Chinese. He has connections throughout the territory and can source almost anything. He believes trade and understanding can prevent war - though he knows he fights a losing battle.',
        personality: 'Diplomatic, multilingual, and genuinely committed to peace between factions.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'All are welcome here. Leave your weapons and your hatred at the door.',
          'You want something rare? I know someone who knows someone. Give me two days.',
          'My mother\'s people and my father\'s people both call me traitor. I call myself bridge.',
          'War is expensive. Peace is profitable. Yet men choose war.',
        ],
        isVendor: true,
        shopId: 'trading-post-shop',
        quests: ['broker-peace-deal', 'source-rare-item', 'prevent-conflict'],
      },
      {
        id: 'little-thunder',
        name: 'Little Thunder',
        title: 'Craft Master',
        description: 'A Nahi artisan who creates exquisite beadwork, leatherwork, and ceremonial items. Her work is sought after across the territory.',
        personality: 'Proud of her craft, protective of Nahi traditions, but willing to share with respectful students.',
        dialogue: [
          'Every bead tells a story. Every pattern has meaning.',
          'Settlers buy our art but not our culture. They do not understand.',
          'This piece took three months to make. You offer twenty dollars? Insulting.',
        ],
      },
    ],
    availableActions: ['browse-goods', 'commission-craft', 'sell-items', 'cultural-exchange'],
    availableCrimes: [], // Neutral sacred ground
    jobs: [
      {
        id: 'trade-negotiations',
        name: 'Trade Negotiations',
        description: 'Help broker deals between different factions.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 20, goldMax: 35, xp: 35, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'cultural-exchange-work',
        name: 'Cultural Exchange',
        description: 'Facilitate understanding between settlers and Nahi.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 28, xp: 40, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [
      {
        id: 'trading-post-shop',
        name: 'Spirit Springs Trading Post',
        description: 'Nahi crafts, rare artifacts, and spirit items.',
        shopType: 'specialty',
        items: [
          { itemId: 'nahi-blanket', name: 'Nahi Woven Blanket', description: 'Exquisite craftsmanship', price: 75 },
          { itemId: 'medicine-bag', name: 'Medicine Bag', description: 'Blessed for protection', price: 50 },
          { itemId: 'spirit-totem', name: 'Spirit Totem', description: 'Carved protective charm', price: 90, requiredLevel: 5 },
          { itemId: 'ceremonial-knife', name: 'Ceremonial Knife', description: 'Sacred Nahi blade', price: 150, requiredLevel: 8 },
          { itemId: 'dream-catcher', name: 'Dream Catcher', description: 'Traps nightmares', price: 40 },
          { itemId: 'war-paint', name: 'Sacred War Paint', description: 'Used in warrior ceremonies', price: 65, requiredLevel: 10 },
          { itemId: 'rare-artifact', name: 'Ancient Artifact', description: 'Extremely rare Nahi relic', price: 500, requiredLevel: 15 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 33, nahiCoalition: 34, frontera: 33 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. VISION ROCK =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.VISION_ROCK,
    name: 'Vision Rock',
    description: 'A towering red stone formation where Seer Painted Sky sits in perpetual meditation. This ancient prophecy site has revealed the future to seekers for centuries. The visions granted here are powerful, cryptic, and never wrong - though their meaning is rarely clear until events unfold.',
    shortDescription: 'Prophecy site and future visions',
    type: 'sacred_site',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 5,
    dominantFaction: 'nahi',
    operatingHours: { open: 0, close: 23 }, // Available always
    atmosphere: 'A massive red stone thrust from the earth like a finger pointing at the sky. Ancient petroglyphs cover its surface - some recognizable, others depicting things that have not yet happened. Painted Sky sits at the base, sometimes motionless for days. The air around the rock feels charged with potential. Time flows strangely here. Visions come unbidden to sensitive souls.',
    npcs: [
      {
        id: 'painted-sky',
        name: 'Painted Sky',
        title: 'Seer of Futures',
        description: 'A mysterious Nahi woman whose age is unknowable. Her body is covered in elaborate painted symbols that shift and change. Her eyes see multiple timelines simultaneously. She speaks in riddles and metaphors because linear communication cannot contain what she perceives. Those seeking clear answers are always disappointed; those seeking truth sometimes find it.',
        personality: 'Cryptic, otherworldly, and simultaneously present and absent. Speaks in layered prophecies.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'You ask what will happen. I see ten futures. Which will you choose?',
          'The blood moon rises over crossed swords. The river runs gold, then red, then dry.',
          'Three paths before you: one leads to glory, one to ruin, one to revelation. All are the same path.',
          'The question you should ask is not what I see, but what you fear to see.',
        ],
        quests: ['interpret-prophecy', 'seek-vision-of-future', 'prevent-dark-future'],
      },
      {
        id: 'gray-owl',
        name: 'Gray Owl',
        title: 'Vision Guardian',
        description: 'An old Nahi warrior who protects Painted Sky and helps interpret her prophecies. He has spent decades trying to understand her visions.',
        personality: 'Patient, protective, and endlessly fascinated by prophecy.',
        dialogue: [
          'She told me I would die by fire. I have avoided flames for thirty years.',
          'Every prophecy she speaks comes true. But never how you expect.',
          'The rock remembers all visions. Sometimes it shows them again.',
        ],
      },
    ],
    availableActions: ['seek-vision', 'interpret-prophecy', 'meditate-on-rock', 'study-petroglyphs'],
    availableCrimes: [], // Deeply sacred
    jobs: [
      {
        id: 'future-reading',
        name: 'Future Reading',
        description: 'Seek visions of what may come to pass.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 20, xp: 60, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'dream-interpretation',
        name: 'Dream Interpretation',
        description: 'Help others understand their visions and dreams.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 15, goldMax: 30, xp: 45, items: [] },
        requirements: { minLevel: 10 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'territory-fate-prophecy',
        name: 'The Great Prophecy',
        description: 'Painted Sky has seen the ultimate fate of Sangre Territory - a vision of fire, blood, and transformation. She knows which faction will ultimately prevail, what cataclysm approaches, and how the supernatural forces will manifest. This knowledge is fragmentary and terrifying. She reveals pieces only to those who have proven they can bear the weight of knowing the future.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 85,
          npcTrust: { npcId: 'painted-sky', level: 5 },
        },
        content: {
          actions: ['receive-great-prophecy', 'see-territorial-future', 'learn-catastrophe-timing'],
          npcs: ['gray-owl'],
          dialogue: [
            'You have seen small futures. Now see the Great Future. The territory dies. The territory is reborn. You stand at the center.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 60, frontera: 20 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 8 },
  },

  // ===== 7. SACRED SPRINGS BATHHOUSE =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.SACRED_SPRINGS_BATHHOUSE,
    name: 'Sacred Springs Bathhouse',
    description: 'The main healing sanctuary of Spirit Springs, where multiple natural hot spring pools bubble with sacred waters of extraordinary healing power. Head Healer Running Water oversees all healing services in this peaceful sanctuary. This is a STRICT PEACE ZONE - any act of violence here triggers immediate supernatural consequences including spirit possession, paralysis, and permanent curses. The spirits protect this place fiercely.',
    shortDescription: 'Primary healing facility with hot spring pools',
    type: 'healing_sanctuary',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 5,
    dominantFaction: 'nahi',
    operatingHours: { open: 0, close: 23 }, // Open nearly 24/7 for healing emergencies
    atmosphere: 'Multiple steaming pools of varying temperatures fill the main chamber, each blessed for different healing purposes. The largest pool glows with an ethereal turquoise light, its waters channeling pure healing energy from the spirit realm. Ceremonial herbs hang from cedar beams - white sage, sweetgrass, tobacco, and rare healing plants found nowhere else. The air is thick with mineral-rich steam and the scent of sacred smoke. Soft chanting echoes from unseen sources. Patients rest on woven mats between treatments, their bodies and spirits gradually restoring. An altar to the healing spirits occupies the eastern wall, laden with offerings. The atmosphere radiates peace so profound that even the most violent souls feel their aggression drain away.',
    npcs: [
      {
        id: 'running-water',
        name: 'Running Water',
        title: 'Head Healer',
        description: 'A serene Nahi woman in her 40s with healing hands that seem to glow with inner light. She has studied with medicine people across three tribes and possesses encyclopedic knowledge of healing arts - herbal medicine, bone-setting, spiritual cleansing, addiction recovery, and curse removal. She has healed terminal illnesses, reversed dark magic, and guided dozens through successful addiction recovery. Her presence alone brings comfort to the suffering.',
        personality: 'Infinitely compassionate, clinically competent, and spiritually powerful. Treats all who come regardless of faction or ability to pay.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The waters will heal your body. The spirits will heal your soul. But you must be willing to release what poisons you.',
          'This is a sanctuary of peace. Violence attempted here brings swift spiritual justice - the spirits will not tolerate it.',
          'Your wound is deep, but I have treated worse. Trust the process and trust the waters.',
          'Addiction is not weakness - it is a spirit that has possessed you. We will cast it out together, but the battle will be hard.',
          'Physical healing takes days. Spiritual cleansing takes longer. Recovery from addiction? That is a journey of months, but I will walk it with you.',
        ],
        isVendor: true,
        shopId: 'bathhouse-barter-services',
        quests: ['gather-sacred-healing-herbs', 'assist-difficult-healing', 'vision-quest-guide', 'break-powerful-curse'],
      },
      {
        id: 'quiet-river',
        name: 'Quiet River',
        title: 'Spirit Talker',
        description: 'A young Nahi man with the rare gift of communicating directly with healing spirits. During treatments, he channels spirit energy into patients, dramatically accelerating recovery. His eyes glaze white when spirits speak through him.',
        personality: 'Gentle, mystical, and slightly otherworldly. Often distracted by spirit voices only he can hear.',
        dialogue: [
          'The spirits say your left shoulder carries old grief. We must release it before the physical wound can heal.',
          'I hear them constantly - ancestor spirits, nature spirits, healing spirits. They all wish to help.',
          'When I channel the spirits, I am not fully here. Do not be alarmed if I speak in voices not my own.',
          'The waters are alive. Truly alive. They have consciousness and intention.',
        ],
      },
      {
        id: 'silver-rain',
        name: 'Silver Rain',
        title: 'Bathhouse Attendant',
        description: 'A middle-aged Nahi woman who maintains the pools, prepares ceremonial baths, and assists healers. She knows every property of every pool and which water best treats each ailment.',
        personality: 'Practical, knowledgeable, and warmly maternal toward patients.',
        dialogue: [
          'The blue pool for fevers, the green for infections, the red for broken bones. Each pool has its purpose.',
          'You look exhausted beyond measure. The renewal pool will restore your energy completely.',
          'We use no gold here. Bring ceremonial tokens, sacred herbs, or a sincere offering of service.',
          'I have tended these pools for twenty years. They have saved countless lives.',
        ],
      },
      {
        id: 'stands-with-dawn',
        name: 'Stands With Dawn',
        title: 'Addiction Recovery Specialist',
        description: 'A former opium addict who recovered through the bathhouse program and now dedicates his life to helping others break their chains. His methods are intense - combining spiritual cleansing, herbal treatments, sweat lodge purification, and unflinching honesty.',
        personality: 'Bluntly honest, intensely committed, and zero tolerance for self-deception. Compassionate but uncompromising.',
        dialogue: [
          'I was where you are. Lost in the smoke, dying slowly. These waters saved me. They can save you - if you commit FULLY.',
          'Recovery is seven days of hell followed by months of discipline. I will not lie to you - it will be the hardest thing you ever do.',
          'The opium spirit has possessed you. We will starve it, burn it out, and cast it into the void. But YOU must want this.',
          'Day three is when most people break. I will be there. You will not go through this alone.',
        ],
        quests: ['addiction-intervention', 'recovery-program-assistance'],
      },
      {
        id: 'healing-winds',
        name: 'Healing Winds',
        title: 'Vision Quest Guide',
        description: 'An elder Nahi woman who guides seekers through sacred vision quests. She prepares participants spiritually, monitors their journeys, and helps interpret the visions they receive.',
        personality: 'Patient, wise, and deeply attuned to spiritual realms.',
        dialogue: [
          'A vision quest is not recreation. You will face your deepest fears and hidden truths. Are you prepared?',
          'The spirits will show you what you need to see, not what you wish to see.',
          'I have guided over two hundred vision quests. Each one unique, each one transformative.',
          'Your vision revealed a black wolf with red eyes. This is significant. Let us explore its meaning together.',
        ],
        quests: ['prepare-vision-quest', 'interpret-vision-symbols'],
      },
      {
        id: 'stone-bear',
        name: 'Stone Bear',
        title: 'Peace Zone Guardian',
        description: 'A massive Nahi warrior who enforces the sacred peace of the bathhouse. He carries no weapons - he doesn\'t need them. Anyone foolish enough to attempt violence here faces his wrath first, then supernatural consequences second.',
        personality: 'Silent, powerful, and absolutely committed to protecting the sanctuary. Intimidating presence.',
        dialogue: [
          'Violence here brings consequences beyond my fists. The spirits punish such desecration severely.',
          'I have guarded this sanctuary for fifteen years. No blood has been shed here. That record will not break.',
          'You look like trouble. Prove me wrong.',
          'Leave weapons outside. Leave hatred outside. Bring only your wounds and willingness to heal.',
        ],
      },
    ],
    availableActions: [
      'bathe-in-healing-waters',
      'physical-healing-treatment',
      'spiritual-cleansing-ceremony',
      'addiction-recovery-program',
      'vision-quest-preparation',
      'curse-removal-ritual',
      'full-energy-restoration',
      'rest-and-recover',
    ],
    availableCrimes: [], // STRICT PEACE ZONE - supernatural consequences for violence
    jobs: [
      {
        id: 'healing-assistance',
        name: 'Healing Assistance',
        description: 'Help healers treat patients and maintain the sacred pools.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 0, goldMax: 0, xp: 45, items: ['ceremonial-token', 'healing-herbs'] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'spirit-channeling-work',
        name: 'Spirit Channeling',
        description: 'Assist Quiet River in channeling healing spirits during treatments.',
        energyCost: 20,
        cooldownMinutes: 50,
        rewards: { goldMin: 0, goldMax: 0, xp: 60, items: ['sacred-herbs', 'spirit-token'] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'recovery-program-support',
        name: 'Recovery Program Support',
        description: 'Help Stands With Dawn support patients through addiction recovery.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 0, goldMax: 0, xp: 55, items: ['ceremonial-token'] },
        requirements: { minLevel: 6 },
      },
    ],
    shops: [
      {
        id: 'bathhouse-barter-services',
        name: 'Sacred Healing Services',
        description: 'Barter-based healing services using ceremonial tokens, sacred herbs, and service offerings.',
        shopType: 'services',
        items: [
          {
            itemId: 'basic-healing',
            name: 'Basic Physical Healing',
            description: 'Treats wounds, injuries, and common ailments',
            barterCost: { ceremonialTokens: 3, sacredHerbs: 2 },
            effect: 'Restores 50 HP',
          },
          {
            itemId: 'full-healing',
            name: 'Full Physical Healing',
            description: 'Complete restoration of physical health',
            barterCost: { ceremonialTokens: 5, sacredHerbs: 3 },
            effect: 'Restores 100% HP',
          },
          {
            itemId: 'disease-cure',
            name: 'Disease Cure',
            description: 'Removes diseases, infections, and poisoning',
            barterCost: { ceremonialTokens: 4, sacredHerbs: 4, rarePlants: 1 },
            effect: 'Removes all disease/poison status effects',
          },
          {
            itemId: 'spiritual-cleansing',
            name: 'Spiritual Cleansing',
            description: 'Removes curses, dark magic effects, and spiritual corruption',
            barterCost: { ceremonialTokens: 7, sacredHerbs: 5, blessedWater: 1 },
            effect: 'Removes curses and dark magic',
            requiredLevel: 5,
          },
          {
            itemId: 'addiction-treatment',
            name: 'Addiction Treatment (7-day program)',
            description: 'Intensive program to break addiction to opium, alcohol, or other substances',
            barterCost: { ceremonialTokens: 20, sacredHerbs: 10, personalSacrifice: true },
            effect: 'Removes addiction status (requires 7-day commitment)',
            requiredLevel: 3,
          },
          {
            itemId: 'vision-quest',
            name: 'Guided Vision Quest',
            description: 'Sacred spiritual journey revealing hidden truths and future paths',
            barterCost: { ceremonialTokens: 15, sacredHerbs: 8, spiritOffering: true },
            effect: 'Receive prophetic vision about character destiny',
            requiredLevel: 8,
          },
          {
            itemId: 'full-energy-restoration',
            name: 'Full Energy Restoration',
            description: 'Complete renewal of physical and spiritual energy through sacred waters',
            barterCost: { ceremonialTokens: 10, sacredHerbs: 6 },
            effect: 'Restores 100% energy',
            requiredLevel: 1,
          },
          {
            itemId: 'curse-removal',
            name: 'Advanced Curse Removal',
            description: 'Remove powerful supernatural curses and hexes',
            barterCost: { ceremonialTokens: 12, sacredHerbs: 8, rarePlants: 2, spiritOffering: true },
            effect: 'Removes even the most powerful curses',
            requiredLevel: 10,
          },
        ],
        buyMultiplier: 0,
      },
    ],
    secrets: [
      {
        id: 'ancient-healing-techniques',
        name: 'Ancient Healing Wisdom',
        description: 'Running Water possesses healing knowledge passed down through twenty generations - techniques for treating injuries that settler doctors call impossible, herbal formulas that can cure supposedly terminal diseases, and spiritual practices that mend broken minds. She guards this knowledge carefully, sharing only with those who prove themselves worthy and respectful of Nahi traditions.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 70,
          npcTrust: { npcId: 'running-water', level: 4 },
        },
        content: {
          actions: ['learn-ancient-healing', 'master-herbal-medicine', 'spiritual-healing-training'],
          npcs: ['quiet-river', 'healing-winds'],
          dialogue: [
            'You have proven yourself a true healer in spirit. I will teach you what my grandmother taught me, and her grandmother before her. This knowledge is sacred - use it only to help, never to harm.',
          ],
        },
      },
      {
        id: 'spirit-communion-chamber',
        name: 'Spirit Communion Chamber',
        description: 'Hidden beneath the bathhouse is a secret chamber where the most powerful healing rituals occur. Here, Running Water and Quiet River can summon healing spirits directly, channeling their power to perform miracle cures - regenerating lost limbs, restoring sight to the blind, even returning those at death\'s door to full vitality. Access to this chamber is granted only to those who have earned profound trust.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 85,
          npcTrust: { npcId: 'running-water', level: 5 },
        },
        content: {
          actions: ['access-communion-chamber', 'summon-healing-spirits', 'miracle-healing-ritual'],
          npcs: ['quiet-river'],
          dialogue: [
            'The spirits have judged you worthy. Come. I will show you where true miracles happen. What you witness here must never be spoken of to outsiders.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 0, // Peace zone - safest location in the territory
    factionInfluence: { settlerAlliance: 33, nahiCoalition: 34, frontera: 33 },
    peaceZone: true,
    peaceZoneConsequences: [
      'Spirit possession',
      'Temporary paralysis',
      'Permanent supernatural curse',
      'Immediate expulsion from all Coalition territories',
    ],
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 8. SHAMAN'S RETREAT =====
  {
    _id: SPIRIT_SPRINGS_BUILDING_IDS.SHAMANS_RETREAT,
    name: 'Shaman\'s Retreat',
    description: 'Private quarters and sacred training grounds where Elder Shaman Walks Between Worlds teaches shamanic arts to proven apprentices. This mystical lodge serves as a portal to the spirit realm, a prophecy chamber, and a sanctuary where the boundaries between physical and supernatural dissolve. Only those with genuine spiritual gifts or extraordinary trust are permitted entry.',
    shortDescription: 'Shamanic training lodge and spirit portal',
    type: 'spirit_lodge',
    region: 'sacred_lands',
    parentId: LOCATION_IDS.SPIRIT_SPRINGS,
    tier: 5,
    dominantFaction: 'nahi',
    operatingHours: { open: 18, close: 6 }, // Night hours - shamanic power peaks after sunset
    atmosphere: 'The retreat occupies a natural cave carved with centuries of sacred symbols that seem to move in flickering firelight. Bundles of powerful medicine hang from every surface - eagle feathers, bear claws, crystals pulsing with inner light, and herbs that don\'t grow in this world. A ceremonial fire burns eternally in the center, its smoke forming shapes and faces. The air vibrates with spiritual energy so intense that non-sensitive visitors feel dizzy and disoriented. Walks Between Worlds sits in deep meditation, his consciousness simultaneously in multiple realms. Spirit guides - translucent figures of ancestors and animal totems - move through the space as casually as living beings. Time flows strangely here; hours can pass like minutes. The walls seem thin, as if reality itself is stretched gossamer-fine.',
    npcs: [
      {
        id: 'walks-between-worlds',
        name: 'Walks Between Worlds',
        title: 'Elder Shaman',
        description: 'The most powerful living shaman of the Nahi people, a man who exists simultaneously in physical and spirit realms. His age is unknown - some say he has lived for two centuries through shamanic practices that transcend mortality. He can perceive spirits invisible to others, travel into the spirit world while his body remains in trance, and receive visions of events happening anywhere in the territory. His prophecies are never wrong, though often cryptic. He has witnessed the rise of three different chiefs and seen the slow encroachment of settler civilization. Despite his vast power, he is humble and patient, teaching those few gifted enough to learn.',
        personality: 'Mystical, patient, and possessing perspective that spans lifetimes. Speaks with layered meanings and profound wisdom.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'In the spirit world, past and future exist simultaneously. I see both your history and your destiny.',
          'The spirits whisper of great upheaval coming to Sangre Territory. A reckoning approaches.',
          'You have the gift - I see it flickering in your aura. But gift without training is danger. Will you learn?',
          'Tonight the veil between worlds grows thin. We can speak with those long departed. Who do you wish to meet?',
          'Shamanic power is not dominion over spirits - it is partnership. They choose to work with us if we prove worthy.',
        ],
        quests: [
          'shamanic-training',
          'spirit-world-journey',
          'commune-with-ancestors',
          'investigate-territorial-disturbance',
          'prevent-supernatural-catastrophe',
        ],
      },
      {
        id: 'dancing-flame',
        name: 'Dancing Flame',
        title: 'Shaman Apprentice',
        description: 'A gifted young Nahi woman learning shamanic arts from Walks Between Worlds. She has natural talent for spirit communication and has already completed two successful journeys into the spirit realm. She is eager, powerful, but still learning control.',
        personality: 'Enthusiastic, talented, and sometimes reckless with her growing powers. Deeply respectful of her teacher.',
        dialogue: [
          'Last night I spoke with my great-grandmother\'s spirit. She told me secrets about our family line.',
          'The Elder can stay in the spirit world for days. I can only manage hours before my body pulls me back.',
          'Spirit communication is easier than I expected. Controlling which spirits answer? That is the hard part.',
          'I saw your future in a vision. You stand at a crossroads bathed in red light. Choose carefully.',
        ],
      },
      {
        id: 'shadow-walker',
        name: 'Shadow Walker',
        title: 'Advanced Apprentice',
        description: 'A mysterious Nahi man who specializes in darker shamanic arts - curse removal, banishing malevolent spirits, and traveling to the shadow realms. He is powerful but unsettling, walking closer to darkness than most shamans dare.',
        personality: 'Quiet, intense, and comfortable with aspects of shamanism that frighten others.',
        dialogue: [
          'Not all spirits are benevolent. I deal with the ones that want to harm you.',
          'The shadow realm is dangerous, but necessary. Evil must be confronted where it lives.',
          'Your enemy has placed a curse on you. I can see it, black tendrils around your heart. I can remove it - for a price.',
          'Fear me if you wish. But when dark spirits come for you, I am who you will call.',
        ],
        quests: ['remove-powerful-curse', 'banish-malevolent-spirit', 'investigate-dark-magic'],
      },
      {
        id: 'star-singer',
        name: 'Star Singer',
        title: 'Spirit Guide',
        description: 'A translucent, ethereal being - an ancestor spirit who has chosen to remain connected to the physical world to guide shamans. She appears as a beautiful Nahi woman who seems made of starlight and mist. She can only be seen by those with shamanic sight or strong spiritual sensitivity.',
        personality: 'Otherworldly, wise, and speaking in riddles that always prove prophetic.',
        dialogue: [
          'I died three generations ago, yet I remain. The spirits chose me to guide the living.',
          'You stand at the threshold between worlds. Step through, and you can never fully return to ordinary existence.',
          'I have watched the territory for seventy years from the spirit side. Great changes approach.',
          'In the spirit realm, truth cannot be hidden. Your deepest secrets will be laid bare. Are you prepared?',
        ],
        isSpirit: true,
      },
      {
        id: 'thunder-voice',
        name: 'Thunder Voice',
        title: 'Prophecy Interpreter',
        description: 'An elderly Nahi shaman who specializes in interpreting prophecies and visions. He maintains written records of all major prophecies and tracks their fulfillment across decades.',
        personality: 'Scholarly, meticulous, and fascinated by the patterns in prophetic visions.',
        dialogue: [
          'Painted Sky spoke a prophecy in 1847 that is only now coming true. Prophecy unfolds on its own schedule.',
          'Your vision of the burning crow? I have seen that symbol in three other prophecies. It signifies betrayal from within.',
          'I have documented over five hundred prophecies. Ninety-eight percent have proven accurate.',
          'The Elder saw your arrival in a vision two years ago. You are part of the greater pattern.',
        ],
        quests: ['interpret-vision', 'research-prophecy-connection'],
      },
    ],
    availableActions: [
      'spirit-communication',
      'journey-to-spirit-world',
      'receive-prophecy',
      'shamanic-training',
      'curse-removal',
      'commune-with-ancestors',
      'study-sacred-texts',
      'meditation-in-power-place',
    ],
    availableCrimes: [], // Sacred shamanic space - profaning it would bring severe supernatural consequences
    jobs: [
      {
        id: 'spirit-communication',
        name: 'Spirit Communication',
        description: 'Practice communicating with spirits under shamanic guidance.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 0, xp: 70, items: ['spirit-token', 'vision-crystal'] },
        requirements: { minLevel: 10 },
      },
      {
        id: 'prophecy-interpretation',
        name: 'Prophecy Interpretation',
        description: 'Study prophecies with Thunder Voice and learn to interpret visionary symbols.',
        energyCost: 15,
        cooldownMinutes: 45,
        rewards: { goldMin: 0, goldMax: 0, xp: 60, items: ['ceremonial-token'] },
        requirements: { minLevel: 12 },
      },
      {
        id: 'shamanic-study',
        name: 'Shamanic Study',
        description: 'Learn shamanic techniques and spiritual practices from Elder Walks Between Worlds.',
        energyCost: 25,
        cooldownMinutes: 70,
        rewards: { goldMin: 0, goldMax: 0, xp: 85, items: ['sacred-herbs', 'power-object'] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'spirit-world-portal',
        name: 'Portal to the Spirit World',
        description: 'At the back of the cave lies a dimensional gateway to the spirit realm - a shimmering tear in reality maintained by Walks Between Worlds\' constant meditation. Those with sufficient training can step through this portal physically, entering a realm where spirits dwell, ancestors gather, and the fundamental nature of reality becomes clear. The spirit world is beautiful, terrifying, and transformative. Those who enter return changed forever, having seen truths no living being should witness.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 90,
          npcTrust: { npcId: 'walks-between-worlds', level: 5 },
        },
        content: {
          actions: [
            'enter-spirit-world',
            'commune-with-ancestor-spirits',
            'visit-animal-totem-realm',
            'consult-ancient-shamans',
            'witness-spirit-council',
          ],
          npcs: ['dancing-flame', 'star-singer'],
          dialogue: [
            'You have proven yourself worthy. The portal awaits. Step through and witness the realm beyond flesh. But know this - you will return changed. Part of you will always remain Between Worlds now.',
          ],
        },
      },
      {
        id: 'ancient-prophecies',
        name: 'Ancient Prophecies of the Territory',
        description: 'Thunder Voice maintains a sacred scroll containing prophecies dating back centuries - visions of the territory\'s past, present, and future. These prophecies foretell the coming of settlers, the rise of supernatural threats, the emergence of powerful individuals (possibly including player characters), and the ultimate fate of Sangre Territory. The most disturbing prophecies speak of a great reckoning - fire, blood, and transformation that will reshape everything. Access to these prophecies is granted only to those with proven wisdom and discretion.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 85,
          npcTrust: { npcId: 'walks-between-worlds', level: 4 },
        },
        content: {
          actions: [
            'study-ancient-prophecies',
            'learn-territory-fate',
            'discover-personal-prophecy',
            'identify-prophesied-individuals',
          ],
          npcs: ['thunder-voice'],
          dialogue: [
            'The prophecies speak of one who walks between factions, belonging to none yet touching all. I believe that may be you. Come, read what the ancestors foresaw.',
          ],
        },
      },
      {
        id: 'shamanic-sight-awakening',
        name: 'Awakening of Shamanic Sight',
        description: 'Through intense training and a dangerous ritual, Walks Between Worlds can awaken latent shamanic abilities in spiritually gifted individuals. This grants permanent ability to see spirits, perceive magical auras, receive prophetic visions, and sense supernatural disturbances. However, this gift is also a burden - you will see things others cannot, know things you wish you didn\'t, and be called upon by spirits constantly. Once awakened, shamanic sight cannot be turned off.',
        type: 'secret_action',
        unlockCondition: {
          minReputation: 95,
          npcTrust: { npcId: 'walks-between-worlds', level: 5 },
        },
        content: {
          actions: ['undergo-awakening-ritual', 'accept-shamanic-gift', 'begin-lifelong-training'],
          npcs: ['dancing-flame', 'shadow-walker', 'star-singer'],
          dialogue: [
            'The spirits have chosen you. I see it clearly now. You have the gift sleeping within. I can awaken it - but this changes everything. You will never see the world as ordinary again. You will perceive spirits, sense magic, receive visions. Is this burden you are willing to carry?',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 15, nahiCoalition: 70, frontera: 15 },
    peaceZone: true,
    isUnlocked: false, // Must be discovered/unlocked
    isHidden: true, // Not visible to all players initially
    requirements: { minLevel: 10 },
  },
];

/**
 * Seed Goldfinger's Mine buildings into the database
 */
export async function seedGoldfingersMineBulidings(): Promise<void> {
  try {
    // Verify parent location exists
    const goldfingersMine = await Location.findById(LOCATION_IDS.GOLDFINGERS_MINE);
    if (!goldfingersMine) {
      console.warn('Warning: Goldfinger\'s Mine location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Goldfinger's Mine buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.GOLDFINGERS_MINE });

    // Insert Goldfinger's Mine buildings
    await Location.insertMany(goldfingersMineBuildings);

    console.log(`Successfully seeded ${goldfingersMineBuildings.length} Goldfinger's Mine buildings`);
  } catch (error) {
    logger.error('Error seeding Goldfinger\'s Mine buildings', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

/**
 * Seed Spirit Springs buildings into the database
 */
export async function seedSpiritSpringsBuildings(): Promise<void> {
  try {
    // Verify parent location exists
    const spiritSprings = await Location.findById(LOCATION_IDS.SPIRIT_SPRINGS);
    if (!spiritSprings) {
      console.warn('Warning: Spirit Springs location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Spirit Springs buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.SPIRIT_SPRINGS });

    // Insert Spirit Springs buildings
    await Location.insertMany(spiritSpringsBuildings);

    console.log(`Successfully seeded ${spiritSpringsBuildings.length} Spirit Springs buildings`);
  } catch (error) {
    logger.error('Error seeding Spirit Springs buildings', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

/**
 * Seed both locations' buildings in one operation
 */
export async function seedMineAndSpringsBuildings(): Promise<void> {
  try {
    await seedGoldfingersMineBulidings();
    await seedSpiritSpringsBuildings();
    console.log('Successfully seeded all Mine and Springs buildings');
  } catch (error) {
    logger.error('Error seeding Mine and Springs buildings', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

export default [...goldfingersMineBuildings, ...spiritSpringsBuildings];
