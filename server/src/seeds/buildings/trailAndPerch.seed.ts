/**
 * Trail and Perch Buildings Seed Data
 *
 * Seeds the database with 10 buildings across 2 locations:
 * - Dusty Trail (6 buildings) - Crossroads waystation and information hub
 * - Thunderbird's Perch (4 buildings) - Coalition sacred peak and Thunderbird's sanctuary
 */

import mongoose from 'mongoose';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for Dusty Trail
export const DUSTY_TRAIL_BUILDING_IDS = {
  WAYSTATION_INN: new mongoose.Types.ObjectId('6505a0000000000000000001'),
  STAGECOACH_OFFICE: new mongoose.Types.ObjectId('6505a0000000000000000002'),
  BLACKSMITH_WHEELWRIGHT: new mongoose.Types.ObjectId('6505a0000000000000000003'),
  WATERING_HOLE_SALOON: new mongoose.Types.ObjectId('6505a0000000000000000004'),
  GENERAL_MERCANTILE: new mongoose.Types.ObjectId('6505a0000000000000000005'),
  SHERIFFS_WAYPOST: new mongoose.Types.ObjectId('6505a0000000000000000006'),
};

// Building IDs for Thunderbird's Perch
export const THUNDERBIRDS_PERCH_BUILDING_IDS = {
  THUNDERBIRDS_EYRIE: new mongoose.Types.ObjectId('6505b0000000000000000001'),
  CLOUD_WALKERS_TEMPLE: new mongoose.Types.ObjectId('6505b0000000000000000002'),
  GUARDIANS_WATCH: new mongoose.Types.ObjectId('6505b0000000000000000003'),
  PILGRIMS_REST: new mongoose.Types.ObjectId('6505b0000000000000000004'),
};

// ==================== DUSTY TRAIL BUILDINGS ====================

export const dustyTrailBuildings = [
  // ===== 1. WAYSTATION INN =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.WAYSTATION_INN,
    name: 'Waystation Inn',
    description: 'The heart of Dusty Trail, a sturdy two-story inn where travelers rest their weary bones. Innkeeper Martha "Ma" Jenkins has run this establishment for twenty years, feeding and sheltering every soul who passes through. She knows everyone\'s business and keeps most of it secret.',
    shortDescription: 'Main rest stop and lodging',
    type: 'hotel',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'neutral',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'The smell of fresh bread and coffee greets you at the door. Clean rooms line the upper floor while the dining area bustles with travelers sharing tales. Ma Jenkins moves between tables like a motherly whirlwind, ensuring every guest is fed and comfortable.',
    npcs: [
      {
        id: 'ma-jenkins',
        name: 'Martha "Ma" Jenkins',
        title: 'Innkeeper',
        description: 'A warm, matronly woman in her fifties with flour-dusted apron and knowing eyes. She treats every guest like family and seems to know everyone who passes through the territory. Her kindness hides a sharp mind and sharper memory.',
        personality: 'Motherly, perceptive, and protective. Excellent listener who remembers everything. Fiercely neutral but secretly helps those in genuine need.',
        faction: 'NEUTRAL',
        dialogue: [
          'Come in, come in! You look half-starved. Sit down and I\'ll fix you a plate.',
          'I see all kinds pass through here. Settlers, Nahi, outlaws... Everyone needs a warm meal and a safe bed.',
          'What you tell me stays with me, dear. This is neutral ground.',
          'Been here twenty years. I know every trail, every town, and every secret worth knowing.',
        ],
        isVendor: true,
        shopId: 'waystation-inn-shop',
      },
      {
        id: 'deputy-walker',
        name: 'Deputy Sam Walker',
        title: 'Undercover Marshal',
        description: 'A quiet man who claims to be a traveling salesman but is actually a U.S. Marshal running a witness protection safe house from the inn. Only Ma knows his true identity.',
        personality: 'Careful, observant, and professional. Maintains his cover religiously. Protects those under his care with dedication.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Just passing through with my wares. Buttons, thread, that sort of thing.',
          '*low voice* You need protection? I can arrange something.',
          'Ma\'s got good instincts about people. I trust her judgment.',
        ],
      },
    ],
    availableActions: ['rent-room', 'eat-meal', 'gather-information', 'relay-message', 'seek-refuge'],
    availableCrimes: ['Eavesdrop', 'Steal Mail'],
    jobs: [
      {
        id: 'inn-hospitality',
        name: 'Hospitality Work',
        description: 'Help Ma Jenkins serve guests, clean rooms, and manage the inn.',
        energyCost: 12,
        cooldownMinutes: 25,
        rewards: { goldMin: 12, goldMax: 20, xp: 22, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'message-relay',
        name: 'Message Relay',
        description: 'Carry messages between travelers and towns. Discretion required.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 28, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [
      {
        id: 'waystation-inn-shop',
        name: 'Waystation Inn Services',
        description: 'Lodging, meals, and travel supplies.',
        shopType: 'general',
        items: [
          { itemId: 'inn-room', name: 'Room (1 Night)', description: 'Clean bed and safety', price: 5 },
          { itemId: 'hot-meal', name: 'Hot Meal', description: 'Ma\'s home cooking', price: 3 },
          { itemId: 'trail-rations-week', name: 'Trail Rations (Week)', description: 'Food for the road', price: 15 },
          { itemId: 'canteen', name: 'Canteen', description: 'Water storage', price: 8 },
          { itemId: 'bedroll', name: 'Bedroll', description: 'For camping', price: 12 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'witness-protection-safe-house',
        name: 'Safe House',
        description: 'Deputy Walker runs a witness protection operation from the inn\'s basement. Several people with bounties on their heads hide here under new identities while waiting for trials back East.',
        type: 'hidden_room',
        unlockCondition: {
          npcTrust: { npcId: 'ma-jenkins', level: 5 },
        },
        content: {
          actions: ['access-safe-house', 'meet-witnesses', 'arrange-protection'],
          npcs: ['deputy-walker'],
          dialogue: [
            'Some folks need protecting from bad people. Sam handles that quietly. You seem trustworthy enough to know.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 40, nahiCoalition: 30, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. STAGECOACH OFFICE =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.STAGECOACH_OFFICE,
    name: 'Stagecoach Office',
    description: 'The transportation hub of Dusty Trail, where the famous Butterfield Stage makes its scheduled stops. Driver "Whip" Wilson manages routes, cargo, and passenger service. His coaches connect the entire territory, making him invaluable to anyone needing to travel fast.',
    shortDescription: 'Transportation hub and ticket office',
    type: 'stagecoach',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'neutral',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'Dust-covered coaches sit in the yard, being loaded and unloaded. The office smells of leather and axle grease. Schedule boards show arrival and departure times. Anxious passengers wait for their rides while cargo is carefully inventoried.',
    npcs: [
      {
        id: 'whip-wilson',
        name: '"Whip" Wilson',
        title: 'Stage Driver & Manager',
        description: 'A weathered man in his forties with a face like tanned leather and hands scarred from reins. He\'s driven stagecoaches for twenty-five years, surviving three robberies, two Apache raids, and countless accidents. Most reliable driver in the territory.',
        personality: 'Reliable, gruff but fair, and deeply professional. Values punctuality and integrity. Has seen everything on the trail.',
        faction: 'NEUTRAL',
        dialogue: [
          'Stage leaves at dawn, rain or shine. Be here or be left behind.',
          'I\'ve been driving these routes longer than you\'ve been alive. Trust me, I know the way.',
          'Cargo\'s secure, passengers are safe. That\'s my guarantee.',
          'You want fast delivery? I can arrange that... for the right price.',
        ],
        quests: ['escort-valuable-cargo', 'investigate-stage-robberies'],
      },
      {
        id: 'ticket-clerk-pete',
        name: 'Peter "Numbers" Chang',
        title: 'Ticket Clerk',
        description: 'A meticulous Chinese clerk who manages all scheduling, ticketing, and cargo manifests. His records are impeccable and his memory for numbers is legendary.',
        personality: 'Precise, organized, and cautious. Values proper documentation.',
        dialogue: [
          'Ticket to Red Gulch? That will be twelve dollars. Return trip available.',
          'All cargo must be properly manifested. No exceptions.',
          'I can arrange private charters, but they cost considerably more.',
        ],
      },
    ],
    availableActions: ['buy-ticket', 'ship-cargo', 'hire-escort', 'charter-stage'],
    availableCrimes: ['Stagecoach Robbery', 'Cargo Theft', 'Forge Documents'],
    jobs: [
      {
        id: 'passenger-escort',
        name: 'Passenger Escort',
        description: 'Ride shotgun on stagecoach runs, protecting passengers from bandits.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 40, xp: 38, items: [] },
        requirements: { minLevel: 4 },
      },
      {
        id: 'cargo-delivery',
        name: 'Cargo Delivery',
        description: 'Handle and secure cargo for long-distance deliveries.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 18, goldMax: 30, xp: 30, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [
      {
        id: 'stagecoach-office-shop',
        name: 'Stagecoach Services',
        description: 'Travel tickets and shipping services.',
        shopType: 'specialty',
        items: [
          { itemId: 'ticket-red-gulch', name: 'Ticket to Red Gulch', description: 'One-way passage', price: 12 },
          { itemId: 'ticket-frontera', name: 'Ticket to The Frontera', description: 'One-way passage', price: 15 },
          { itemId: 'cargo-shipping', name: 'Cargo Shipping (per crate)', description: 'Secure delivery', price: 8 },
          { itemId: 'express-delivery', name: 'Express Delivery', description: 'Double speed', price: 25, requiredLevel: 3 },
          { itemId: 'private-charter', name: 'Private Charter', description: 'Exclusive coach', price: 100, requiredLevel: 5 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'smuggling-routes',
        name: 'Smuggling Routes',
        description: 'Whip Wilson knows about secret routes and hidden compartments in his coaches, used to smuggle contraband across territory lines. He\'ll share this knowledge with trusted associates for a cut of the profits.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'whip-wilson', level: 4 },
        },
        content: {
          actions: ['arrange-smuggling', 'use-secret-routes'],
          dialogue: [
            'I didn\'t survive twenty-five years by asking questions about every crate. Sometimes I just... don\'t look too close.',
          ],
          rewards: { gold: 0, xp: 75, items: ['smuggling-routes-map'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 45, nahiCoalition: 25, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. BLACKSMITH & WHEELWRIGHT =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.BLACKSMITH_WHEELWRIGHT,
    name: 'Blacksmith & Wheelwright',
    description: 'Iron John\'s smithy, where the constant ring of hammer on anvil echoes across Dusty Trail. The gentle giant repairs everything from horseshoes to wagon wheels to fancy metalwork. His forge burns day and night, and his craftsmanship is legendary across the territory.',
    shortDescription: 'Repairs and custom metalwork',
    type: 'blacksmith',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'neutral',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'The heat of the forge washes over everything. Sparks fly as John hammers glowing iron. Broken wagon wheels, damaged tools, and various metalwork projects fill every corner. The smell of hot metal and coal smoke is thick in the air.',
    npcs: [
      {
        id: 'iron-john',
        name: 'Iron John Blackburn',
        title: 'Master Blacksmith',
        description: 'A massive man, seven feet tall with arms like tree trunks and hands that could crush rocks. Despite his intimidating appearance, he\'s gentle as a lamb and treats every customer with patient kindness. His metalwork is art.',
        personality: 'Gentle giant, patient craftsman, and perfectionist. Kind to everyone but deeply passionate about his craft. Takes immense pride in quality work.',
        faction: 'NEUTRAL',
        dialogue: [
          'Bring it here, friend. Everything can be fixed if you know how.',
          'A good horseshoe is like a promise - it supports you every step of the way.',
          'I don\'t rush my work. Good craftsmanship takes time.',
          'People fear me because I\'m big. But size don\'t make a man cruel. That\'s a choice.',
        ],
        isVendor: true,
        shopId: 'blacksmith-shop',
        quests: ['find-rare-metals', 'craft-masterwork'],
      },
      {
        id: 'apprentice-tommy',
        name: 'Tommy "Sparks" Miller',
        title: 'Apprentice',
        description: 'A eager fourteen-year-old learning the trade. Quick and enthusiastic but still mastering the finer points of the craft.',
        personality: 'Enthusiastic, hardworking, eager to please.',
        dialogue: [
          'Mr. John says I\'m getting better every day!',
          'I love working the forge. It\'s like magic when the metal glows!',
          'One day I\'ll be as good as Mr. John. Just you wait!',
        ],
      },
    ],
    availableActions: ['repair-equipment', 'commission-work', 'horseshoeing', 'wheel-repair'],
    availableCrimes: ['Steal Tools', 'Steal Metal'],
    jobs: [
      {
        id: 'wagon-repairs',
        name: 'Wagon Repairs',
        description: 'Help repair broken wagons and wheels for travelers.',
        energyCost: 18,
        cooldownMinutes: 40,
        rewards: { goldMin: 20, goldMax: 32, xp: 35, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'horseshoeing',
        name: 'Horseshoeing',
        description: 'Shoe horses for travelers passing through the waystation.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 16, goldMax: 26, xp: 28, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [
      {
        id: 'blacksmith-shop',
        name: 'Iron John\'s Smithy',
        description: 'Tools, wagon parts, and custom metalwork.',
        shopType: 'specialty',
        items: [
          { itemId: 'horseshoes', name: 'Horseshoes (Set)', description: 'Quality iron shoes', price: 8 },
          { itemId: 'wagon-wheel', name: 'Wagon Wheel', description: 'Reinforced wheel', price: 45 },
          { itemId: 'tools-basic', name: 'Tool Set (Basic)', description: 'Hammer, saw, nails', price: 25 },
          { itemId: 'tools-quality', name: 'Tool Set (Quality)', description: 'Professional grade', price: 75, requiredLevel: 5 },
          { itemId: 'custom-metalwork', name: 'Custom Metalwork', description: 'Commission piece', price: 150, requiredLevel: 8 },
          { itemId: 'wagon-axle', name: 'Wagon Axle', description: 'Reinforced axle', price: 60, requiredLevel: 4 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'master-crafting-techniques',
        name: 'Master Techniques',
        description: 'Iron John learned special metalworking techniques from a Japanese swordsmith he met in San Francisco. He guards these techniques carefully but may teach a worthy student.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'iron-john', level: 5 },
        },
        content: {
          actions: ['learn-master-techniques', 'craft-exceptional-items'],
          dialogue: [
            'You\'ve proven yourself a true craftsman. Let me show you what I learned from Master Takeshi...',
          ],
          rewards: { gold: 0, xp: 150, items: ['master-crafting-manual'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 40, nahiCoalition: 30, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. WATERING HOLE SALOON =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.WATERING_HOLE_SALOON,
    name: 'Watering Hole Saloon',
    description: 'A modest traveler\'s bar where information flows as freely as the whiskey. Bartender Slim Jim stands six-foot-five and thin as a rail, serving drinks and collecting gossip from every soul who passes through. If you want to know something, ask Slim - for a price.',
    shortDescription: 'Traveler\'s bar and information hub',
    type: 'saloon',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'neutral',
    operatingHours: { open: 10, close: 2 },
    atmosphere: 'A simple wooden bar with tables worn smooth by countless elbows. Wanted posters and trail maps cover the walls. The air smells of whiskey and tobacco. Travelers swap stories over drinks while Slim listens to everything.',
    npcs: [
      {
        id: 'slim-jim',
        name: 'Slim Jim Corrigan',
        title: 'Bartender & Information Broker',
        description: 'An impossibly tall and thin man who seems to be all arms and legs. His ears are always open and his memory is perfect. He knows who\'s traveling where, who\'s meeting whom, and what everyone\'s business is. Information is his currency.',
        personality: 'Observant, discreet when paid to be, and always listening. Neutral in all conflicts. Sells information to all sides but never takes sides himself.',
        faction: 'NEUTRAL',
        dialogue: [
          'What\'ll it be? Whiskey, information, or both?',
          'I hear things. Lots of things. Question is, what\'s it worth to you?',
          'Everybody talks when they drink. I just remember what they say.',
          'Neutral ground, this bar. All are welcome, long as they keep it peaceful.',
        ],
        isVendor: true,
        shopId: 'watering-hole-shop',
        quests: ['buy-information', 'track-target'],
      },
    ],
    availableActions: ['buy-drink', 'gather-rumors', 'buy-information', 'play-cards'],
    availableCrimes: ['Pickpocket', 'Cheat at Cards'],
    jobs: [
      {
        id: 'information-gathering',
        name: 'Information Gathering',
        description: 'Listen to conversations and report useful intelligence to Slim.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 28, xp: 25, items: [] },
        requirements: { minLevel: 2 },
      },
      {
        id: 'bartending',
        name: 'Bartending',
        description: 'Help Slim serve drinks during busy hours.',
        energyCost: 10,
        cooldownMinutes: 25,
        rewards: { goldMin: 10, goldMax: 18, xp: 20, items: [] },
        requirements: { minLevel: 1 },
      },
    ],
    shops: [
      {
        id: 'watering-hole-shop',
        name: 'Watering Hole Bar',
        description: 'Drinks and trail snacks.',
        shopType: 'general',
        items: [
          { itemId: 'whiskey-shot', name: 'Whiskey Shot', description: 'Burns going down', price: 2 },
          { itemId: 'beer-mug', name: 'Beer Mug', description: 'Cold and refreshing', price: 1 },
          { itemId: 'trail-jerky', name: 'Beef Jerky', description: 'Salted trail meat', price: 3 },
          { itemId: 'peanuts', name: 'Roasted Peanuts', description: 'Bar snack', price: 1 },
          { itemId: 'information-basic', name: 'Basic Information', description: 'Local rumors', price: 10, requiredLevel: 1 },
          { itemId: 'information-valuable', name: 'Valuable Information', description: 'Specific intel', price: 50, requiredLevel: 5 },
        ],
        buyMultiplier: 0.4,
      },
    ],
    secrets: [
      {
        id: 'information-network',
        name: 'Intelligence Network',
        description: 'Slim Jim runs an extensive information network across the entire territory. He has contacts in every town and pays informants for valuable intelligence. Those who prove trustworthy can tap into this network.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'slim-jim', level: 4 },
        },
        content: {
          actions: ['access-network', 'buy-premium-intel', 'sell-information'],
          dialogue: [
            'You\'ve proven you can be discreet. Let me show you how deep my sources run...',
          ],
          rewards: { gold: 0, xp: 100, items: ['information-network-access'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 35, nahiCoalition: 35, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. GENERAL MERCANTILE =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.GENERAL_MERCANTILE,
    name: 'General Mercantile',
    description: 'Widow Abigail Stone\'s trading post, packed floor to ceiling with everything a traveler might need. She drives a hard bargain but deals fairly with all comers. Her shop is the commercial heart of Dusty Trail, supplying everyone from prospectors to settlers to Nahi traders.',
    shortDescription: 'Trading post and supply center',
    type: 'general_store',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'neutral',
    operatingHours: { open: 7, close: 19 },
    atmosphere: 'Shelves overflow with goods from across the territory and beyond. The smell of coffee, leather, and dry goods fills the air. Maps cover one wall, showing every trail and town. Widow Stone watches everything with sharp merchant eyes.',
    npcs: [
      {
        id: 'widow-stone',
        name: 'Abigail Stone',
        title: 'Merchant & Trader',
        description: 'A shrewd businesswoman in her forties who built this trading empire after her husband died. She knows the value of everything and everyone. Fair but never generous, she respects those who work hard and has no patience for cheats or fools.',
        personality: 'Sharp, business-minded, and scrupulously fair. Respects hard work and honest dealing. Has a soft spot for orphans and widows but hides it well.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Name your need and I\'ll name my price. Fair trade keeps everyone honest.',
          'I deal with settlers, Nahi, Frontera... Gold spends the same from any hand.',
          'My husband taught me business before he died. I taught myself everything else.',
          'Quality goods at fair prices. That\'s been my motto for fifteen years.',
        ],
        isVendor: true,
        shopId: 'general-mercantile-shop',
        quests: ['supply-run-mission', 'negotiate-trade-deal'],
      },
    ],
    availableActions: ['buy-goods', 'sell-goods', 'trade-items', 'study-maps'],
    availableCrimes: ['Shoplift', 'Burglary'],
    jobs: [
      {
        id: 'trading-work',
        name: 'Trading Work',
        description: 'Help Widow Stone with inventory, pricing, and customer service.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 14, goldMax: 22, xp: 25, items: [] },
        requirements: { minLevel: 2 },
      },
      {
        id: 'supply-runs',
        name: 'Supply Runs',
        description: 'Travel to remote locations to buy supplies for the mercantile.',
        energyCost: 20,
        cooldownMinutes: 50,
        rewards: { goldMin: 25, goldMax: 40, xp: 38, items: [] },
        requirements: { minLevel: 4 },
      },
    ],
    shops: [
      {
        id: 'general-mercantile-shop',
        name: 'Widow Stone\'s Mercantile',
        description: 'General goods, maps, and survival gear.',
        shopType: 'general',
        items: [
          { itemId: 'dried-beans', name: 'Dried Beans (lb)', description: 'Basic food', price: 2 },
          { itemId: 'coffee-beans', name: 'Coffee (lb)', description: 'Fresh roasted', price: 4 },
          { itemId: 'flour-sack', name: 'Flour (25lb sack)', description: 'Baking supplies', price: 8 },
          { itemId: 'survival-kit', name: 'Survival Kit', description: 'Essential wilderness gear', price: 50 },
          { itemId: 'territory-map', name: 'Territory Map', description: 'Detailed regional map', price: 15 },
          { itemId: 'compass', name: 'Compass', description: 'Brass navigation compass', price: 25 },
          { itemId: 'spyglass', name: 'Spyglass', description: 'See for miles', price: 75, requiredLevel: 5 },
          { itemId: 'tent-canvas', name: 'Canvas Tent', description: 'Two-person shelter', price: 40 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 50, nahiCoalition: 25, frontera: 25 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. SHERIFF'S WAYPOST =====
  {
    _id: DUSTY_TRAIL_BUILDING_IDS.SHERIFFS_WAYPOST,
    name: "Sheriff's Waypost",
    description: 'A small law enforcement outpost manned by Deputy Marshal Roy Goodman, a young idealistic lawman trying to keep order on the frontier. His office serves as courthouse, jail, and legal center for the crossroads. Wanted posters cover every wall.',
    shortDescription: 'Law office and small jail',
    type: 'sheriff_office',
    region: 'town',
    parentId: LOCATION_IDS.DUSTY_TRAIL,
    tier: 2,
    dominantFaction: 'settler',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'A modest office with a desk, gun rack, and two jail cells in back. Wanted posters paper the walls like grim wallpaper. The smell of gun oil and old coffee pervades. Roy keeps everything meticulously organized, maintaining order in his small corner of chaos.',
    npcs: [
      {
        id: 'roy-goodman',
        name: 'Deputy Marshal Roy Goodman',
        title: 'Deputy U.S. Marshal',
        description: 'A earnest young man in his mid-twenties, fresh from the East with idealistic notions about law and justice. The frontier is teaching him harsh lessons, but he maintains his integrity. His inexperience shows, but his courage doesn\'t.',
        personality: 'Idealistic, honest, and surprisingly brave. Still believes in justice and redemption. Learning that frontier law isn\'t black and white.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          'Law reaches everywhere, even out here. I\'ll make sure of that.',
          'I know I\'m young, but a badge is a badge. I\'ll do my duty.',
          'Sometimes I wonder if I\'m making a difference. Then I remember why I came here.',
          'You got information on wanted criminals? There\'s reward money available.',
        ],
        quests: ['track-wanted-criminal', 'testify-at-trial'],
      },
    ],
    availableActions: ['report-crime', 'view-bounties', 'turn-in-bounty', 'patrol-assistance'],
    availableCrimes: ['Bribe Officer', 'Jailbreak'],
    jobs: [
      {
        id: 'bounty-tracking',
        name: 'Bounty Tracking',
        description: 'Help Deputy Goodman track wanted criminals passing through.',
        energyCost: 18,
        cooldownMinutes: 40,
        rewards: { goldMin: 22, goldMax: 38, xp: 35, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'patrol-work',
        name: 'Patrol Assistance',
        description: 'Help keep order at the crossroads, checking travelers and watching for trouble.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 18, goldMax: 28, xp: 30, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'wanted-criminal-ledger',
        name: 'Criminal Sightings Ledger',
        description: 'Deputy Goodman keeps a detailed ledger of every wanted criminal spotted in the area. This intelligence is valuable to bounty hunters and law enforcement across the territory.',
        type: 'secret_action',
        unlockCondition: {
          npcTrust: { npcId: 'roy-goodman', level: 4 },
        },
        content: {
          actions: ['study-ledger', 'track-criminals', 'claim-bounties'],
          dialogue: [
            'I trust you. You can access my sightings ledger. Use it wisely - some of these folks are extremely dangerous.',
          ],
          rewards: { gold: 0, xp: 75, items: ['marshal-ledger-access'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 70, nahiCoalition: 15, frontera: 15 },
    isUnlocked: true,
    isHidden: false,
  },
];

// ==================== THUNDERBIRD'S PERCH BUILDINGS ====================

export const thunderbirdsPerchBuildings = [
  // ===== 1. THUNDERBIRD'S EYRIE =====
  {
    _id: THUNDERBIRDS_PERCH_BUILDING_IDS.THUNDERBIRDS_EYRIE,
    name: "Thunderbird's Eyrie",
    description: 'The sacred nest of the Thunderbird itself, a massive structure of woven branches, sacred stones, and ancient power perched on the highest peak. Lightning crackles in the air. The wind speaks with voices. The Great Spirit that dwells here is REAL - an entity of immense power that has watched over these mountains since time immemorial. Only those who have proven themselves worthy through the Path of Thunder may approach.',
    shortDescription: 'Sacred shrine and nest of the Thunderbird spirit',
    type: 'sacred_shrine',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.THUNDERBIRDS_PERCH,
    tier: 5,
    dominantFaction: 'nahiCoalition',
    operatingHours: { open: 0, close: 23 }, // 24/7 but highly restricted access
    atmosphere: 'The air crackles with supernatural energy. Storm clouds gather and disperse at the Thunderbird\'s whim. The massive nest is woven from lightning-struck trees, and ancient stones carved with symbols glow faintly. The presence of the Great Spirit is overwhelming - beautiful and terrifying in equal measure. Those who stand here feel the weight of eternity.',
    requirements: {
      minLevel: 20,
      minFactionReputation: [{ faction: 'nahiCoalition', level: 500 }],
      questsComplete: ['path-of-thunder'],
    },
    npcs: [
      {
        id: 'the-thunderbird',
        name: 'The Thunderbird',
        title: 'Great Spirit of Storms',
        description: 'Not a myth. Not a legend. A REAL supernatural entity of staggering power. The Thunderbird appears as a massive eagle wreathed in lightning and storm clouds, eyes glowing like suns. Its voice is thunder itself. Ancient beyond measure, it has guarded these mountains and the Nahi people since the dawn of time. It can grant blessings, deliver prophecies, and summon storms that reshape the land.',
        personality: 'Ancient, powerful, and deeply wise. Speaks rarely but with absolute authority. Values courage, honor, and respect for nature. Can be benevolent to the worthy or terrible to the arrogant. Its presence is overwhelming.',
        faction: 'NAHI_COALITION',
        dialogue: [
          '*VOICE LIKE THUNDER* You have walked the Path. You have earned the right to stand before me.',
          'I have watched these mountains since the First People emerged into this world. I will watch long after you are dust.',
          'The storms obey me. The sky is my domain. The lightning is my voice.',
          '*eyes glow* You seek prophecy? Look then, and see what will be...',
        ],
        quests: ['receive-thunderbird-blessing', 'summon-great-storm', 'legendary-quest-chain'],
        isSupernaturalEntity: true,
      },
      {
        id: 'high-priest-soaring-hawk',
        name: 'Soaring Hawk',
        title: 'High Priest of the Thunderbird',
        description: 'The eldest and most powerful spiritual leader of the Coalition, chosen by the Thunderbird itself. He has served here for forty years, conducting ceremonies and interpreting the Great Spirit\'s will. His connection to the supernatural is profound - he can call lightning and read the storms.',
        personality: 'Deeply spiritual, commanding presence, utterly devoted to the Thunderbird. Wise beyond measure. Tests all who seek to approach the Great Spirit.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The Thunderbird watches all. It knows your heart before you speak.',
          'I have served the Great Spirit for forty winters. It has shown me wonders beyond mortal understanding.',
          'You wish to approach the Eyrie? First, you must prove yourself worthy.',
          'When the Thunderbird speaks, the wise listen. The foolish die.',
        ],
        quests: ['path-of-thunder', 'weather-ceremony', 'spiritual-trial'],
        isVendor: true,
        shopId: 'thunderbird-eyrie-shop',
      },
    ],
    availableActions: ['receive-prophecy', 'weather-ritual', 'blessing-ceremony', 'commune-with-spirit'],
    availableCrimes: [], // Attempting crime here is instant death
    jobs: [
      {
        id: 'weather-control-ritual',
        name: 'Weather Control Ritual',
        description: 'Assist in sacred ceremonies that allow the Thunderbird to influence weather across the entire territory. Requires deep spiritual connection and Coalition trust.',
        energyCost: 40,
        cooldownMinutes: 180,
        rewards: { goldMin: 0, goldMax: 0, xp: 500, items: ['storm-blessing-token'] },
        requirements: { minLevel: 20, minFactionReputation: [{ faction: 'nahiCoalition', level: 500 }] },
      },
      {
        id: 'receive-prophecy',
        name: 'Receive Thunderbird Prophecy',
        description: 'Undergo the sacred ritual to receive a prophecy directly from the Great Spirit. These visions shape destinies.',
        energyCost: 30,
        cooldownMinutes: 240,
        rewards: { goldMin: 0, goldMax: 0, xp: 300, items: ['prophecy-vision'] },
        requirements: { minLevel: 18, questsComplete: ['path-of-thunder'] },
      },
    ],
    shops: [
      {
        id: 'thunderbird-eyrie-shop',
        name: 'Sacred Offerings Exchange',
        description: 'Ceremonial items blessed by the Thunderbird. Barter system only - gold is meaningless here.',
        shopType: 'barter',
        items: [
          { itemId: 'lightning-blessed-feather', name: 'Lightning-Blessed Feather', description: 'Grants storm protection', price: 0, barterCost: { ceremonialTokens: 5 }, requiredLevel: 18 },
          { itemId: 'thunderstone', name: 'Thunderstone', description: 'Stone touched by lightning', price: 0, barterCost: { sacredOfferings: 3 }, requiredLevel: 20 },
          { itemId: 'storm-callers-staff', name: 'Storm Caller\'s Staff', description: 'Legendary weapon', price: 0, barterCost: { spiritFavors: 10 }, requiredLevel: 22 },
          { itemId: 'winds-blessing', name: 'Blessing of the Winds', description: 'Permanent speed bonus', price: 0, barterCost: { ceremonialTokens: 15 }, requiredLevel: 25 },
        ],
        buyMultiplier: 0,
        usesBarterSystem: true,
      },
    ],
    secrets: [
      {
        id: 'direct-communion-with-thunderbird',
        name: 'Direct Communion',
        description: 'Those who have earned the Thunderbird\'s highest trust can commune directly with the Great Spirit, receiving power beyond mortal understanding. This is the ultimate spiritual achievement.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'the-thunderbird', level: 10 },
          minFactionReputation: [{ faction: 'nahiCoalition', level: 1000 }],
          questsComplete: ['legendary-quest-chain'],
        },
        content: {
          actions: ['summon-thunderbird', 'call-great-storm', 'receive-ultimate-blessing'],
          dialogue: [
            '*THE THUNDERBIRD\'S VOICE FILLS YOUR MIND* You have proven yourself beyond all others. I grant you a fragment of my power.',
          ],
          rewards: { gold: 0, xp: 2000, items: ['thunderbird-champion-mantle', 'storm-command'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 100, frontera: 0 },
    isUnlocked: false, // Requires Path of Thunder quest
    isHidden: false,
  },

  // ===== 2. CLOUD WALKER'S TEMPLE =====
  {
    _id: THUNDERBIRDS_PERCH_BUILDING_IDS.CLOUD_WALKERS_TEMPLE,
    name: "Cloud Walker's Temple",
    description: 'The main ceremonial building of Thunderbird\'s Perch, a magnificent structure of carved stone and painted wood built into the mountainside. Here, Coalition priests conduct daily ceremonies honoring the sky spirits, the winds, and the Thunderbird. Sacred smoke rises constantly from the ceremonial fires. The temple walls are covered in ancient pictographs depicting the Thunderbird\'s deeds across centuries.',
    shortDescription: 'Main worship temple and ceremony center',
    type: 'temple',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.THUNDERBIRDS_PERCH,
    tier: 4,
    dominantFaction: 'nahiCoalition',
    operatingHours: { open: 5, close: 22 }, // Dawn to dusk ceremonies
    atmosphere: 'Sacred smoke fills the air, carrying prayers to the sky. Drums echo constantly, maintaining the sacred rhythm. Priests in ceremonial regalia move through elaborate rituals. Pilgrims from across Coalition territory kneel in prayer. The walls glow with pictographs showing the Thunderbird\'s legends. The atmosphere is reverent, powerful, deeply spiritual.',
    requirements: {
      minLevel: 15,
      minFactionReputation: [{ faction: 'nahiCoalition', level: 200 }],
    },
    npcs: [
      {
        id: 'temple-priest-listening-wind',
        name: 'Listening Wind',
        title: 'Temple Priest',
        description: 'A serene woman in her forties who has dedicated her life to serving the sky spirits. She leads daily ceremonies and teaches spiritual practices to pilgrims. Her voice carries the rhythm of ancient chants.',
        personality: 'Calm, spiritual, deeply knowledgeable about Coalition theology. Patient teacher. Fierce protector of sacred traditions.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'The sky spirits hear all prayers spoken with true heart.',
          'Our ceremonies have continued unbroken for ten generations. We will not be the ones to fail.',
          'The Thunderbird\'s blessing flows through this temple. Can you feel it?',
          'Come, join the ceremony. All who respect the sacred are welcome.',
        ],
        quests: ['learn-sky-ceremonies', 'gather-sacred-herbs', 'assist-ritual'],
        isVendor: true,
        shopId: 'cloud-walkers-temple-shop',
      },
      {
        id: 'acolyte-morning-star',
        name: 'Morning Star',
        title: 'Temple Acolyte',
        description: 'A young man training in the priestly arts. Eager and devoted, he helps maintain the temple and assists in ceremonies.',
        personality: 'Enthusiastic, reverent, learning. Deeply honored to serve here.',
        dialogue: [
          'I am blessed to study in this sacred place. The spirits are strong here.',
          'Every ceremony brings me closer to understanding the Great Spirit\'s will.',
          'May I help prepare you for the ritual? It is my honor.',
        ],
      },
      {
        id: 'pilgrim-elder-gray-wolf',
        name: 'Gray Wolf',
        title: 'Visiting Elder',
        description: 'An elder from a distant Coalition tribe who has made the sacred journey here. He shares wisdom and stories of other Coalition territories.',
        personality: 'Wise, storyteller, connects different Coalition peoples.',
        dialogue: [
          'I traveled three moons to reach this peak. The journey itself is sacred.',
          'My people to the north also honor the Thunderbird, though we call it by different names.',
          'This temple unites all Coalition peoples. Here we remember we are one.',
        ],
      },
    ],
    availableActions: ['attend-ceremony', 'make-offering', 'spiritual-study', 'meditation'],
    availableCrimes: [], // Sacred ground - attempting crime brings severe consequences
    jobs: [
      {
        id: 'ceremony-assistant',
        name: 'Ceremony Assistant',
        description: 'Assist the priests in conducting daily ceremonies, maintaining sacred fires, and preparing ritual items.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 0, xp: 150, items: ['ceremonial-token'] },
        requirements: { minLevel: 15, minFactionReputation: [{ faction: 'nahiCoalition', level: 200 }] },
      },
      {
        id: 'sacred-herb-gathering',
        name: 'Sacred Herb Gathering',
        description: 'Gather rare herbs from the mountain slopes that are used in ceremonies. Requires knowledge of sacred plants.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 0, goldMax: 0, xp: 120, items: ['sacred-herbs', 'ceremonial-token'] },
        requirements: { minLevel: 16 },
      },
      {
        id: 'pilgrim-guide',
        name: 'Pilgrim Guide',
        description: 'Guide other pilgrims up the sacred paths, teaching them proper rituals and respect.',
        energyCost: 18,
        cooldownMinutes: 50,
        rewards: { goldMin: 0, goldMax: 0, xp: 100, items: ['spirit-favor'] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [
      {
        id: 'cloud-walkers-temple-shop',
        name: 'Temple Offerings',
        description: 'Ceremonial items and sacred goods. Barter-based economy.',
        shopType: 'specialty',
        items: [
          { itemId: 'prayer-bundle', name: 'Prayer Bundle', description: 'Sacred herbs for offerings', price: 0, barterCost: { sacredOfferings: 1 }, requiredLevel: 15 },
          { itemId: 'ceremonial-paint', name: 'Ceremonial Paint', description: 'For ritual marking', price: 0, barterCost: { sacredOfferings: 2 }, requiredLevel: 15 },
          { itemId: 'sky-spirit-charm', name: 'Sky Spirit Charm', description: 'Blessed protection', price: 0, barterCost: { ceremonialTokens: 3 }, requiredLevel: 16 },
          { itemId: 'weather-blessing', name: 'Weather Blessing', description: 'Protection from storms', price: 0, barterCost: { ceremonialTokens: 5 }, requiredLevel: 18 },
          { itemId: 'priests-robe', name: 'Priest\'s Ceremonial Robe', description: 'Honorary garment', price: 0, barterCost: { spiritFavors: 5 }, requiredLevel: 20 },
        ],
        buyMultiplier: 0,
        usesBarterSystem: true,
      },
    ],
    secrets: [
      {
        id: 'ancient-weather-magic',
        name: 'Ancient Weather Magic',
        description: 'The temple priests guard knowledge of ancient weather magic passed down from the Thunderbird itself. Those who prove worthy can learn to read the sky and predict storms with uncanny accuracy.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'temple-priest-listening-wind', level: 5 },
          minFactionReputation: [{ faction: 'nahiCoalition', level: 400 }],
        },
        content: {
          actions: ['learn-weather-magic', 'predict-storms', 'call-rain'],
          dialogue: [
            'You have shown respect and dedication. The ancient knowledge shall be shared with you.',
          ],
          rewards: { gold: 0, xp: 400, items: ['weather-sense-ability', 'storm-reader-charm'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 95, frontera: 0 },
    isUnlocked: false, // Requires Coalition reputation
    isHidden: false,
  },

  // ===== 3. GUARDIAN'S WATCH =====
  {
    _id: THUNDERBIRDS_PERCH_BUILDING_IDS.GUARDIANS_WATCH,
    name: "Guardian's Watch",
    description: 'A fortified warrior shrine defending the sacred peak from desecrators and threats. The elite Thunderbird Warriors - the Coalition\'s most formidable fighters - maintain eternal vigilance here. These are not ordinary warriors; they are spiritual protectors blessed by the Great Spirit itself, wielding weapons touched by lightning. War Shaman Standing Bear leads them with tactical brilliance and supernatural insight.',
    shortDescription: 'Elite warrior shrine and defensive post',
    type: 'warrior_shrine',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.THUNDERBIRDS_PERCH,
    tier: 3,
    dominantFaction: 'nahiCoalition',
    operatingHours: { open: 0, close: 23 }, // 24/7 guard duty
    atmosphere: 'Warriors in ceremonial armor patrol with disciplined precision. The air hums with both martial skill and spiritual power. Lightning-blessed weapons line the walls. The War Shaman conducts combat rituals, training warriors in both physical and supernatural fighting arts. The atmosphere is one of focused intensity and sacred duty.',
    requirements: {
      minLevel: 15,
      minFactionReputation: [{ faction: 'nahiCoalition', level: 100 }],
    },
    npcs: [
      {
        id: 'war-shaman-standing-bear',
        name: 'Standing Bear',
        title: 'War Shaman & Commander',
        description: 'A massive warrior in his prime, scarred from countless battles defending the sacred mountain. He combines tactical genius with shamanic power, leading the Thunderbird Warriors with absolute authority. Blessed by the Thunderbird itself, he can call lightning to his weapons.',
        personality: 'Fierce warrior, tactical mind, deeply spiritual. Commands respect through skill and supernatural power. Protective of pilgrims, merciless to threats.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'This peak is sacred ground. We guard it with our lives and the Thunderbird\'s blessing.',
          'I have trained these warriors for ten years. They are the finest fighters in all Coalition lands.',
          '*lightning crackles around his weapon* The Great Spirit grants us strength to defend what is holy.',
          'You wish to join our vigil? Prove your worth in combat and your heart in ceremony.',
        ],
        quests: ['warrior-initiation-trial', 'defend-sacred-peak', 'hunt-desecrators'],
        isVendor: true,
        shopId: 'guardians-watch-shop',
      },
      {
        id: 'thunderbird-warrior-quick-arrow',
        name: 'Quick Arrow',
        title: 'Elite Thunderbird Warrior',
        description: 'One of the finest warriors in the Guardian\'s Watch, known for supernatural speed and precision. Her arrows never miss when defending the sacred peak.',
        personality: 'Focused, deadly skilled, spiritually attuned. Quiet but lethal.',
        dialogue: [
          'Speed and precision. These are the warrior\'s truths.',
          'The Thunderbird watches over us. Our aim is true because our cause is just.',
          'I have defended this peak for seven years. None have passed my watch.',
        ],
      },
      {
        id: 'warrior-initiate-running-wolf',
        name: 'Running Wolf',
        title: 'Warrior Initiate',
        description: 'A young warrior undergoing the trials to join the elite Thunderbird Warriors. Eager to prove himself worthy of the Great Spirit\'s blessing.',
        personality: 'Determined, respectful, learning. Honored to train here.',
        dialogue: [
          'One day I will earn my lightning blessing. Until then, I train.',
          'War Shaman Standing Bear is the greatest warrior I have ever seen.',
          'Every day I grow stronger. The sacred mountain tests us all.',
        ],
      },
    ],
    availableActions: ['warrior-training', 'guard-duty', 'escort-pilgrims', 'hunt-threats'],
    availableCrimes: [], // Attempting to crime here means facing elite warriors
    jobs: [
      {
        id: 'sacred-peak-defense',
        name: 'Sacred Peak Defense',
        description: 'Stand guard duty protecting the peak from threats, intruders, and desecrators.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 0, xp: 180, items: ['warrior-honor-token'] },
        requirements: { minLevel: 15, minFactionReputation: [{ faction: 'nahiCoalition', level: 150 }] },
      },
      {
        id: 'pilgrim-escort',
        name: 'Pilgrim Escort',
        description: 'Escort pilgrims safely up the sacred paths, defending them from dangers.',
        energyCost: 20,
        cooldownMinutes: 50,
        rewards: { goldMin: 0, goldMax: 0, xp: 140, items: ['ceremonial-token'] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'combat-training',
        name: 'Warrior Combat Training',
        description: 'Train with the elite Thunderbird Warriors, learning supernatural combat techniques.',
        energyCost: 30,
        cooldownMinutes: 90,
        rewards: { goldMin: 0, goldMax: 0, xp: 200, items: ['combat-skill-boost'] },
        requirements: { minLevel: 17, minFactionReputation: [{ faction: 'nahiCoalition', level: 200 }] },
      },
    ],
    shops: [
      {
        id: 'guardians-watch-shop',
        name: 'Sacred Armory',
        description: 'Weapons and armor blessed by the Thunderbird. Available only to proven warriors.',
        shopType: 'weapons',
        items: [
          { itemId: 'lightning-blessed-spear', name: 'Lightning-Blessed Spear', description: 'Legendary weapon', price: 0, barterCost: { warriorHonorTokens: 10 }, requiredLevel: 18 },
          { itemId: 'thunderbird-bow', name: 'Thunderbird Bow', description: 'Arrows never miss', price: 0, barterCost: { warriorHonorTokens: 8 }, requiredLevel: 17 },
          { itemId: 'storm-blessed-armor', name: 'Storm-Blessed Armor', description: 'Superior protection', price: 0, barterCost: { warriorHonorTokens: 12 }, requiredLevel: 20 },
          { itemId: 'war-shamans-staff', name: 'War Shaman\'s Staff', description: 'Channels lightning', price: 0, barterCost: { spiritFavors: 8 }, requiredLevel: 22 },
        ],
        buyMultiplier: 0,
        usesBarterSystem: true,
      },
    ],
    secrets: [
      {
        id: 'thunderbird-warrior-initiation',
        name: 'Thunderbird Warrior Initiation',
        description: 'Those who prove themselves in both combat and spiritual devotion can undergo the sacred initiation to become a true Thunderbird Warrior - receiving the Great Spirit\'s blessing and wielding lightning-touched weapons.',
        type: 'progressive',
        unlockCondition: {
          npcTrust: { npcId: 'war-shaman-standing-bear', level: 5 },
          minFactionReputation: [{ faction: 'nahiCoalition', level: 500 }],
          questsComplete: ['warrior-initiation-trial'],
        },
        content: {
          actions: ['receive-thunderbird-blessing', 'become-elite-warrior', 'wield-lightning'],
          dialogue: [
            'You have proven yourself worthy in battle and spirit. The Thunderbird acknowledges you. Receive its blessing.',
          ],
          rewards: { gold: 0, xp: 600, items: ['thunderbird-warrior-status', 'lightning-weapon-mastery'] },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 95, frontera: 0 },
    isUnlocked: false, // Requires Coalition reputation
    isHidden: false,
  },

  // ===== 4. PILGRIM'S REST =====
  {
    _id: THUNDERBIRDS_PERCH_BUILDING_IDS.PILGRIMS_REST,
    name: "Pilgrim's Rest",
    description: 'The entry point to Thunderbird\'s Perch, a welcoming rest house where those making the sacred journey can prepare themselves physically and spiritually for the ascent. Gentle Wind, the caretaker, provides shelter, food, and guidance to all pilgrims regardless of their tribe. This is where the sacred journey begins, where travelers learn what it means to approach the dwelling of the Great Spirit.',
    shortDescription: 'Rest house and pilgrim preparation center',
    type: 'rest_house',
    region: 'sangre_mountains',
    parentId: LOCATION_IDS.THUNDERBIRDS_PERCH,
    tier: 2,
    dominantFaction: 'nahiCoalition',
    operatingHours: { open: 0, close: 23 }, // Always open to pilgrims
    atmosphere: 'Warm fires, simple but comfortable accommodations, and the smell of cooking food welcome tired travelers. Gentle Wind moves quietly, ensuring every pilgrim is fed and rested. Maps of the sacred paths cover the walls. Other pilgrims share stories of their journeys. The atmosphere is one of peaceful preparation and spiritual anticipation.',
    requirements: {
      minLevel: 15,
      minFactionReputation: [{ faction: 'nahiCoalition', level: 50 }],
    },
    npcs: [
      {
        id: 'gentle-wind',
        name: 'Gentle Wind',
        title: 'Caretaker & Guide',
        description: 'An elderly woman who has maintained this rest house for thirty years, welcoming countless pilgrims. She knows every path up the mountain and every ritual required to approach the sacred sites. Her kindness is legendary, but she takes her duties seriously - ensuring only those properly prepared attempt the ascent.',
        personality: 'Warm, maternal, wise. Kind to all but firm about sacred protocols. Has seen generations of pilgrims.',
        faction: 'NAHI_COALITION',
        dialogue: [
          'Welcome, traveler. Rest here and prepare your spirit for the sacred journey ahead.',
          'I have tended this house for thirty winters. I know the mountain and its moods.',
          'The path is steep, but the reward is beyond measure. The Thunderbird awaits the worthy.',
          'Let me share food and wisdom. Both will sustain you on your climb.',
        ],
        quests: ['learn-sacred-paths', 'gather-offerings', 'prepare-for-ascent'],
        isVendor: true,
        shopId: 'pilgrims-rest-shop',
      },
      {
        id: 'mountain-guide-sure-foot',
        name: 'Sure Foot',
        title: 'Mountain Guide',
        description: 'A skilled guide who knows every trail and hazard on the mountain. He escorts pilgrims up the sacred paths, ensuring their safety.',
        personality: 'Practical, knowledgeable, protective. Takes his duty seriously.',
        dialogue: [
          'The mountain can be treacherous. Follow my lead and you will reach the peak safely.',
          'I have climbed these paths a thousand times. Trust in my guidance.',
          'Weather changes fast up here. We must be prepared.',
        ],
      },
      {
        id: 'visiting-pilgrim-distant-thunder',
        name: 'Distant Thunder',
        title: 'Visiting Pilgrim',
        description: 'A pilgrim from a far-off Coalition tribe, resting before beginning his ascent. He shares stories of his homeland and his reasons for making this sacred journey.',
        personality: 'Contemplative, spiritual, shares experiences.',
        dialogue: [
          'I have traveled many moons to reach this place. Tomorrow, I begin the climb.',
          'My people sent me to receive the Thunderbird\'s blessing for our village.',
          'Every step of this journey brings me closer to the Great Spirit.',
        ],
      },
    ],
    availableActions: ['rest-and-recover', 'receive-guidance', 'prepare-offerings', 'study-paths'],
    availableCrimes: [], // Sacred hospitality - violating this is severe taboo
    jobs: [
      {
        id: 'guide-pilgrims',
        name: 'Guide Pilgrims',
        description: 'Help guide other pilgrims up the sacred paths, sharing knowledge of the mountain.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 0, goldMax: 0, xp: 100, items: ['spirit-favor'] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'gather-sacred-items',
        name: 'Gather Sacred Items',
        description: 'Collect sacred herbs, special stones, and ceremonial materials from the lower mountain slopes.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 0, xp: 90, items: ['sacred-offerings', 'mountain-herbs'] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'maintain-rest-house',
        name: 'Maintain Rest House',
        description: 'Help Gentle Wind maintain the rest house, preparing food and shelter for pilgrims.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 0, goldMax: 0, xp: 80, items: ['ceremonial-token'] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [
      {
        id: 'pilgrims-rest-shop',
        name: 'Pilgrim Provisions',
        description: 'Essential supplies for the sacred journey. Simple barter.',
        shopType: 'general',
        items: [
          { itemId: 'trail-food', name: 'Trail Food', description: 'Sustenance for the climb', price: 0, barterCost: { basicGoods: 2 }, requiredLevel: 15 },
          { itemId: 'warm-blanket', name: 'Warm Blanket', description: 'Protection from cold', price: 0, barterCost: { basicGoods: 3 }, requiredLevel: 15 },
          { itemId: 'climbing-rope', name: 'Climbing Rope', description: 'Safety equipment', price: 0, barterCost: { basicGoods: 4 }, requiredLevel: 15 },
          { itemId: 'offering-bundle', name: 'Offering Bundle', description: 'Prepared sacred offerings', price: 0, barterCost: { sacredOfferings: 2 }, requiredLevel: 15 },
          { itemId: 'mountain-guide', name: 'Guided Ascent', description: 'Sure Foot will escort you', price: 0, barterCost: { sacredOfferings: 5 }, requiredLevel: 15 },
        ],
        buyMultiplier: 0,
        usesBarterSystem: true,
      },
    ],
    secrets: [],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 10, nahiCoalition: 90, frontera: 0 },
    isUnlocked: false, // Requires basic Coalition reputation
    isHidden: false,
  },
];

/**
 * Seed Dusty Trail buildings into the database
 */
export async function seedDustyTrailBuildings(): Promise<void> {
  try {
    // Verify Dusty Trail exists
    const dustyTrail = await Location.findById(LOCATION_IDS.DUSTY_TRAIL);
    if (!dustyTrail) {
      console.warn('Warning: Dusty Trail location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Dusty Trail buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.DUSTY_TRAIL });

    // Insert Dusty Trail buildings
    await Location.insertMany(dustyTrailBuildings);

    console.log(`Successfully seeded ${dustyTrailBuildings.length} Dusty Trail buildings`);
  } catch (error) {
    console.error('Error seeding Dusty Trail buildings:', error);
    throw error;
  }
}

/**
 * Seed Thunderbird's Perch buildings into the database
 */
export async function seedThunderbirdsPerchBuildings(): Promise<void> {
  try {
    // Verify Thunderbird's Perch exists
    const thunderbirdsPerch = await Location.findById(LOCATION_IDS.THUNDERBIRDS_PERCH);
    if (!thunderbirdsPerch) {
      console.warn('Warning: Thunderbird\'s Perch location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Thunderbird's Perch buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.THUNDERBIRDS_PERCH });

    // Insert Thunderbird's Perch buildings
    await Location.insertMany(thunderbirdsPerchBuildings);

    console.log(`Successfully seeded ${thunderbirdsPerchBuildings.length} Thunderbird\'s Perch buildings`);
  } catch (error) {
    console.error('Error seeding Thunderbird\'s Perch buildings:', error);
    throw error;
  }
}

/**
 * Seed all Trail and Perch buildings
 */
export async function seedAllTrailAndPerchBuildings(): Promise<void> {
  await seedDustyTrailBuildings();
  await seedThunderbirdsPerchBuildings();
  console.log('Successfully seeded all Trail and Perch buildings');
}

export default {
  dustyTrailBuildings,
  thunderbirdsPerchBuildings,
  seedDustyTrailBuildings,
  seedThunderbirdsPerchBuildings,
  seedAllTrailAndPerchBuildings,
};
