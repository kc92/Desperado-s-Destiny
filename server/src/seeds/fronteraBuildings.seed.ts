/**
 * The Frontera Buildings Seed Data
 *
 * Seeds the database with 15 buildings for The Frontera,
 * a Tier 5 Frontera lawless outlaw haven on Rio Sangre
 *
 * District Breakdown:
 * - Original 8 buildings (Foundation)
 * - El Corazon (The Heart): 2 buildings - El Rey's domain
 * - Los Bajos (The Underworld): 2 buildings - Vice and violence
 * - Las Sombras (The Shadows): 3 buildings - Spiritual and deadly
 */

import mongoose from 'mongoose';
import { Location } from '../models/Location.model';
import { LOCATION_IDS } from './locations.seed';

// Building IDs for The Frontera
export const FRONTERA_BUILDING_IDS = {
  LA_CANTINA_DEL_DIABLO: new mongoose.Types.ObjectId('6503a0000000000000000001'),
  THE_PIT: new mongoose.Types.ObjectId('6503a0000000000000000002'),
  EL_MERCADO_NEGRO: new mongoose.Types.ObjectId('6503a0000000000000000003'),
  EL_VAULT: new mongoose.Types.ObjectId('6503a0000000000000000004'),
  SMUGGLERS_DEN: new mongoose.Types.ObjectId('6503a0000000000000000005'),
  SHRINE_OF_SANTA_MUERTE: new mongoose.Types.ObjectId('6503a0000000000000000006'),
  EL_DOCTOR: new mongoose.Types.ObjectId('6503a0000000000000000007'),
  POSADA_DE_LOS_MUERTOS: new mongoose.Types.ObjectId('6503a0000000000000000008'),
  // New buildings
  EL_PALACIO_DE_REY: new mongoose.Types.ObjectId('6503a0000000000000000009'),
  CASA_DE_LOS_JUEGOS: new mongoose.Types.ObjectId('6503a000000000000000000a'),
  LA_CASA_DE_HUMO: new mongoose.Types.ObjectId('6503a000000000000000000b'),
  EL_ARSENAL: new mongoose.Types.ObjectId('6503a000000000000000000c'),
  LA_CAPILLA_DE_LOS_CAIDOS: new mongoose.Types.ObjectId('6503a000000000000000000d'),
  LA_CUEVA_DE_LOS_ESPIRITUS: new mongoose.Types.ObjectId('6503a000000000000000000e'),
  EL_CALLEJON_DE_LOS_ASESINOS: new mongoose.Types.ObjectId('6503a000000000000000000f'),
};

const fronteraBuildings = [
  // ===== 1. LA CANTINA DEL DIABLO =====
  {
    _id: FRONTERA_BUILDING_IDS.LA_CANTINA_DEL_DIABLO,
    name: 'La Cantina del Diablo',
    description: 'The heart of Frontera nightlife, where outlaws, revolutionaries, and smugglers gather under flickering candlelight. The mezcal flows freely and secrets are traded like currency.',
    shortDescription: 'Outlaw cantina and revolucionario meeting hub',
    type: 'cantina',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 10, close: 6 },
    atmosphere: 'Smoke curls through the dim light as a guitarist plays corridos of fallen heroes. Wanted men drink shoulder to shoulder with revolucionarios planning their next move. The air crackles with danger and opportunity.',
    npcs: [
      {
        id: 'rosa-muerte',
        name: 'Rosa Muerte',
        title: 'Cantina Owner',
        description: 'A striking woman with raven hair and eyes that have seen too much death. She runs the cantina with an iron fist wrapped in velvet.',
        personality: 'Cunning and dangerous. Fiercely loyal to those who earn her trust. Shows no mercy to traitors.',
        faction: 'FRONTERA',
        dialogue: [
          'Bienvenidos, stranger. Mind your manners and we\'ll get along fine.',
          'Information has a price here. So does silence.',
          'The revolution needs soldiers. Are you one of us?',
        ],
      },
      {
        id: 'el-serpiente',
        name: 'El Serpiente',
        title: 'Card Shark',
        description: 'A thin man with quick hands and cold eyes. His deck is said to be enchanted, though the only magic is his skill at cheating.',
        personality: 'Calculating and patient. Strikes only when the odds favor him.',
        dialogue: [
          'Care to test your luck, amigo?',
          'I can smell fear... and desperation.',
          'The house always wins. But I am the house.',
        ],
      },
    ],
    availableActions: ['gamble', 'buy-drink', 'gather-rumors', 'underground-contacts', 'revolucionario-meeting'],
    availableCrimes: ['Cheat at Cards', 'Pickpocket', 'Poison Drink'],
    jobs: [
      {
        id: 'cantina-enforcer',
        name: 'Cantina Enforcer',
        description: 'Keep troublemakers in line. Permanently, if necessary.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 18, goldMax: 30, xp: 30, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'cantina-bar',
        name: 'Cantina del Diablo Bar',
        description: 'Strong drinks for hard men.',
        shopType: 'general',
        items: [
          { itemId: 'mezcal', name: 'Mezcal', description: 'Burns going down', price: 4 },
          { itemId: 'pulque', name: 'Pulque', description: 'Fermented agave', price: 2 },
          { itemId: 'tequila', name: 'Tequila', description: 'Liquid courage', price: 5 },
          { itemId: 'puro', name: 'Puro', description: 'Hand-rolled cigar', price: 6 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'revolucionario-hideout',
        name: 'Revolucionario Hideout',
        description: 'A hidden cellar where the revolution plots to overthrow the corrupt establishment.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 75,
          npcTrust: { npcId: 'rosa-muerte', level: 4 },
        },
        content: {
          actions: ['plan-revolution', 'recruit-fighters', 'arms-deal'],
          npcs: ['el-comandante'],
          dialogue: ['La revolución necesita sangre nueva. Welcome, comrade.'],
        },
      },
    ],
    connections: [],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 10, frontera: 85 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. THE PIT =====
  {
    _id: FRONTERA_BUILDING_IDS.THE_PIT,
    name: 'The Pit',
    description: 'A sunken arena where men fight for gold and glory. Blood stains the sand and the crowd howls for violence. Only the strong survive The Pit.',
    shortDescription: 'Underground fighting arena',
    type: 'fighting_pit',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 18, close: 4 },
    atmosphere: 'Torchlight flickers across bloodstained sand. The crowd presses against the rope barriers, screaming for blood. The smell of sweat, fear, and copper hangs heavy in the air.',
    requirements: { minCriminalRep: 10 },
    npcs: [
      {
        id: 'sangre',
        name: 'Sangre',
        title: 'Pit Master',
        description: 'A scarred giant who fought his way up from the sand. He runs The Pit with brutal efficiency and respects only strength.',
        personality: 'Brutal but honorable in his own way. Respects fighters who show heart. Despises cowards.',
        faction: 'FRONTERA',
        dialogue: [
          'You want to fight? Show me your hands.',
          'In The Pit, there\'s only two ways out. Victory or death.',
          'The crowd wants blood. Don\'t disappoint them.',
        ],
        quests: ['prove-yourself', 'championship-fight'],
      },
    ],
    availableActions: ['enter-fight', 'bet-on-fight', 'challenge-champion', 'watch-fight'],
    availableCrimes: ['Fix Fight', 'Poison Fighter'],
    jobs: [
      {
        id: 'pit-fighter',
        name: 'Pit Fighter',
        description: 'Fight for money and reputation in The Pit.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 50, xp: 40, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'bookie-runner',
        name: 'Bookie Runner',
        description: 'Collect bets and pay out winnings.',
        energyCost: 12,
        cooldownMinutes: 25,
        rewards: { goldMin: 15, goldMax: 25, xp: 20, items: [] },
        requirements: { minLevel: 3 },
      },
    ],
    shops: [],
    connections: [],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 5, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. EL MERCADO NEGRO =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_MERCADO_NEGRO,
    name: 'El Mercado Negro',
    description: 'The night market where anything can be bought if you know who to ask. Stolen goods, contraband, and forbidden items change hands under the cover of darkness.',
    shortDescription: 'Black market and contraband',
    type: 'general_store',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 20, close: 6 },
    atmosphere: 'Shadowy stalls line narrow alleys lit only by guttering lanterns. Vendors speak in whispers and deals are sealed with coded phrases. Everyone watches their back.',
    npcs: [
      {
        id: 'el-susurro',
        name: 'El Susurro',
        title: 'The Whisper',
        description: 'No one knows his real name or face, only his voice. He controls the black market from the shadows and knows the price of everything.',
        personality: 'Mysterious and all-knowing. Speaks in riddles. Never forgets a debt.',
        faction: 'FRONTERA',
        dialogue: [
          '*whisper* What do you seek in the darkness?',
          'Everything has a price. Can you pay it?',
          'I know what you need before you do. The question is... what will you trade?',
        ],
        isVendor: true,
        shopId: 'mercado-negro-shop',
      },
    ],
    availableActions: ['buy', 'sell', 'fence-goods', 'special-order'],
    availableCrimes: ['Steal Contraband', 'Extort Vendor'],
    jobs: [
      {
        id: 'market-lookout',
        name: 'Market Lookout',
        description: 'Watch for law enforcement and warn vendors.',
        energyCost: 10,
        cooldownMinutes: 20,
        rewards: { goldMin: 12, goldMax: 20, xp: 15, items: [] },
        requirements: { minLevel: 2 },
      },
    ],
    shops: [
      {
        id: 'mercado-negro-shop',
        name: 'El Mercado Negro',
        description: 'Contraband and stolen goods.',
        shopType: 'general',
        items: [
          { itemId: 'stolen-watch', name: 'Stolen Watch', description: 'Fine timepiece, no questions', price: 30 },
          { itemId: 'lockpicks-pro', name: 'Professional Lockpicks', description: 'Top quality tools', price: 75 },
          { itemId: 'poison-vial', name: 'Poison Vial', description: 'Colorless and odorless', price: 50 },
          { itemId: 'forged-documents', name: 'Forged Documents', description: 'New identity papers', price: 100 },
          { itemId: 'dynamite', name: 'Dynamite', description: 'Handle with care', price: 80, requiredLevel: 8 },
          { itemId: 'stolen-jewelry', name: 'Stolen Jewelry', description: 'Hot merchandise', price: 60 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 10, frontera: 90 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. EL VAULT =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_VAULT,
    name: 'El Vault',
    description: 'An underground bank where no questions are asked and records don\'t exist. Dead-Eye Diego protects your gold with his life - and will take yours if you try to cheat him.',
    shortDescription: 'Underground bank, no questions asked',
    type: 'bank',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Heavy iron doors guard the entrance. Armed men watch from the shadows. The vault itself is said to be deeper than any mine, carved into the bedrock beneath the city.',
    npcs: [
      {
        id: 'dead-eye-diego',
        name: 'Dead-Eye Diego',
        title: 'Vault Keeper',
        description: 'A former bandito with a glass eye and a reputation for never missing a shot. He guards El Vault with religious devotion.',
        personality: 'Paranoid and deadly accurate. Honors deals absolutely. Betrayal means death.',
        faction: 'FRONTERA',
        dialogue: [
          'Code word first. Then we talk.',
          'Your gold is safe here. Safer than in the ground.',
          'Try to rob me and you\'ll be joining the bodies in the foundation.',
        ],
        isVendor: false,
      },
    ],
    availableActions: ['deposit', 'withdraw', 'check-balance', 'coded-access', 'anonymous-transfer'],
    availableCrimes: ['Vault Heist', 'Forge Access Codes'],
    jobs: [],
    shops: [],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 5, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 5. SMUGGLER'S DEN =====
  {
    _id: FRONTERA_BUILDING_IDS.SMUGGLERS_DEN,
    name: "Smuggler's Den",
    description: 'Hidden beneath an abandoned church, the Den is where smugglers plan their routes and fence their contraband. La Sombra runs the operation with ruthless precision.',
    shortDescription: 'Smuggling operations and fence',
    type: 'smugglers_den',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 22, close: 6 },
    atmosphere: 'Crates marked with coded symbols fill the underground chamber. Maps of smuggling routes cover the walls. The air is thick with the smell of tobacco and gunpowder.',
    requirements: { minCriminalRep: 20 },
    npcs: [
      {
        id: 'la-sombra',
        name: 'La Sombra',
        title: 'The Shadow',
        description: 'A ghost of a woman who moves without sound and sees everything. She controls the smuggling routes across the border and beyond.',
        personality: 'Cold and calculating. Values efficiency above all. Disposes of liabilities without hesitation.',
        faction: 'FRONTERA',
        dialogue: [
          'You come to me, so you must need something moved. What is it?',
          'Every route has a price. Blood or gold, your choice.',
          'Fail me once, I forget. Fail me twice, you disappear.',
        ],
        quests: ['smuggle-cargo', 'establish-route'],
      },
    ],
    availableActions: ['fence-goods', 'plan-smuggle-run', 'buy-contraband', 'hire-smugglers'],
    availableCrimes: ['Hijack Shipment', 'Steal Smuggled Goods'],
    jobs: [
      {
        id: 'contraband-runner',
        name: 'Contraband Runner',
        description: 'Move illegal goods across dangerous territory.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 35, goldMax: 60, xp: 45, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'fence-operator',
        name: 'Fence Operator',
        description: 'Help process and move stolen merchandise.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 20, goldMax: 35, xp: 25, items: [] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'smugglers-inventory',
        name: 'Smuggler\'s Inventory',
        description: 'Rare and illegal goods.',
        shopType: 'general',
        items: [
          { itemId: 'rare-medicine', name: 'Rare Medicine', description: 'Smuggled pharmaceuticals', price: 80 },
          { itemId: 'military-rifles', name: 'Military Rifles', description: 'Army surplus, stolen', price: 150, requiredLevel: 10 },
          { itemId: 'exotic-spirits', name: 'Exotic Spirits', description: 'From across the border', price: 25 },
          { itemId: 'sacred-artifacts', name: 'Sacred Artifacts', description: 'Stolen from churches', price: 200, requiredLevel: 12 },
        ],
        buyMultiplier: 0.7,
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 5, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 6. SHRINE OF SANTA MUERTE =====
  {
    _id: FRONTERA_BUILDING_IDS.SHRINE_OF_SANTA_MUERTE,
    name: 'Shrine of Santa Muerte',
    description: 'A dark chapel dedicated to the Saint of Death, where outlaws pray for protection and criminals seek blessings for their dark deeds. Padre Oscuro tends to his flock of lost souls.',
    shortDescription: 'Dark shrine for outlaw blessings',
    type: 'shrine',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Candles flicker before skeletal statues draped in fine robes. The smell of incense and marigolds fills the air. Whispered prayers echo in the darkness.',
    npcs: [
      {
        id: 'padre-oscuro',
        name: 'Padre Oscuro',
        title: 'Dark Priest',
        description: 'A former Catholic priest who found his true calling serving Santa Muerte. He offers blessings and curses in equal measure.',
        personality: 'Serene yet unsettling. Speaks of death as a friend. Genuinely cares for his outlaw flock.',
        faction: 'FRONTERA',
        dialogue: [
          'Santa Muerte judges no one. All are equal before her.',
          'What blessing do you seek, child? Protection? Vengeance? Fortune?',
          'Leave an offering, and she will hear your prayers.',
        ],
      },
    ],
    availableActions: ['pray', 'receive-blessing', 'light-candle', 'confession', 'curse-enemy'],
    availableCrimes: ['Steal Offerings', 'Rob Pilgrims'],
    jobs: [
      {
        id: 'shrine-keeper',
        name: 'Shrine Keeper',
        description: 'Maintain the shrine and assist pilgrims.',
        energyCost: 8,
        cooldownMinutes: 20,
        rewards: { goldMin: 10, goldMax: 18, xp: 15, items: [] },
        requirements: { minLevel: 1 },
      },
    ],
    shops: [
      {
        id: 'shrine-offerings',
        name: 'Shrine Offerings',
        description: 'Sacred items and offerings.',
        shopType: 'general',
        items: [
          { itemId: 'santa-muerte-candle', name: 'Santa Muerte Candle', description: 'For prayers and offerings', price: 5 },
          { itemId: 'blessed-medallion', name: 'Blessed Medallion', description: '+5% luck for 24 hours', price: 50 },
          { itemId: 'protection-charm', name: 'Protection Charm', description: 'Ward against death', price: 75 },
          { itemId: 'curse-token', name: 'Curse Token', description: 'Bring misfortune to enemies', price: 100, requiredLevel: 10 },
        ],
        buyMultiplier: 0.2,
      },
    ],
    connections: [],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 15, frontera: 85 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 7. EL DOCTOR =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_DOCTOR,
    name: 'El Doctor',
    description: 'A back-alley surgery where outlaws get patched up with no questions asked and no records kept. Dr. Carnicero\'s methods are brutal but effective.',
    shortDescription: 'No-questions-asked medical care',
    type: 'doctors_office',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Blood-stained sheets cover makeshift operating tables. The smell of alcohol and something worse fills the cramped room. Bullet casings litter the floor like spent prayers.',
    npcs: [
      {
        id: 'dr-carnicero',
        name: 'Dr. Carnicero',
        title: 'The Butcher',
        description: 'A disgraced surgeon who lost his license but not his skills. His hands are steady and his methods are questionable, but he keeps outlaws alive.',
        personality: 'Pragmatic and amoral. Treats everyone the same - like meat to be repaired. Surprisingly gentle with children.',
        faction: 'FRONTERA',
        dialogue: [
          'No names, no records. Just gold.',
          'Hold still or you\'ll lose more than blood.',
          'I\'ve pulled bullets out of worse. You\'ll live.',
        ],
        isVendor: true,
        shopId: 'el-doctor-shop',
      },
    ],
    availableActions: ['heal', 'buy-medicine', 'surgery', 'extract-bullet', 'set-bones'],
    availableCrimes: [],
    jobs: [],
    shops: [
      {
        id: 'el-doctor-shop',
        name: 'El Doctor Supplies',
        description: 'Medical supplies, no questions.',
        shopType: 'medicine',
        items: [
          { itemId: 'dirty-bandages', name: 'Bandages', description: 'Used but functional', price: 3 },
          { itemId: 'morphine', name: 'Morphine', description: 'Kill the pain', price: 30 },
          { itemId: 'blood-tonic', name: 'Blood Tonic', description: 'Restore lost blood', price: 35 },
          { itemId: 'surgical-kit', name: 'Surgical Kit', description: 'For field operations', price: 90 },
          { itemId: 'stimulant-injection', name: 'Stimulant Injection', description: '+20 energy', price: 50 },
        ],
        buyMultiplier: 0.4,
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 10, frontera: 85 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 8. POSADA DE LOS MUERTOS =====
  {
    _id: FRONTERA_BUILDING_IDS.POSADA_DE_LOS_MUERTOS,
    name: 'Posada de los Muertos',
    description: 'The Inn of the Dead, where wanted men rest their heads and no one asks about your past. La Viuda keeps her guests\' secrets as safe as her own.',
    shortDescription: 'Discrete lodging and safe haven',
    type: 'hotel',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7
    atmosphere: 'Faded photographs of the dead line the walls. The floorboards creak with secrets. Every room has two exits, and the beds have seen their share of blood.',
    npcs: [
      {
        id: 'la-viuda',
        name: 'La Viuda',
        title: 'The Widow',
        description: 'A woman in perpetual mourning who has buried three husbands, all outlaws. She protects her guests with the ferocity of a mother wolf.',
        personality: 'Melancholy but fierce. Fiercely protective of those under her roof. Never forgets a kindness or a slight.',
        faction: 'FRONTERA',
        dialogue: [
          'Welcome to the Posada. Here, the dead rest easy.',
          'What happens in my inn stays in my inn. Understood?',
          'I ask no questions. You tell no lies. That\'s how we get along.',
        ],
      },
    ],
    availableActions: ['rent-room', 'rest', 'hideout', 'store-items', 'lay-low'],
    availableCrimes: ['Rob Guest', 'Pickpocket'],
    jobs: [
      {
        id: 'posada-work',
        name: 'Posada Work',
        description: 'Clean rooms and keep watch for trouble.',
        energyCost: 10,
        cooldownMinutes: 20,
        rewards: { goldMin: 10, goldMax: 18, xp: 15, items: [] },
        requirements: { minLevel: 1 },
      },
    ],
    shops: [
      {
        id: 'posada-cantina',
        name: 'Posada Cantina',
        description: 'Simple food and drink.',
        shopType: 'general',
        items: [
          { itemId: 'frijoles', name: 'Frijoles y Tortillas', description: 'Simple but filling', price: 2 },
          { itemId: 'cafe', name: 'Cafe de Olla', description: 'Strong cinnamon coffee', price: 1 },
          { itemId: 'tamales', name: 'Tamales', description: 'Wrapped in corn husks', price: 3 },
          { itemId: 'room-night', name: 'Room (1 Night)', description: 'Safe sleep, no questions', price: 5 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'escape-tunnels',
        name: 'Escape Tunnels',
        description: 'A network of tunnels beneath the inn that leads to multiple escape routes.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 60,
          npcTrust: { npcId: 'la-viuda', level: 3 },
        },
        content: {
          actions: ['quick-escape', 'underground-travel', 'hide-contraband'],
          npcs: [],
          dialogue: ['The tunnels remember every soul who\'s passed through. Now they\'ll remember you.'],
        },
      },
    ],
    connections: [],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 10, frontera: 85 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== EL CORAZON (THE HEART) - 2 BUILDINGS =====

  // ===== 9. EL PALACIO DE REY =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_PALACIO_DE_REY,
    name: 'El Palacio de Rey',
    description: 'The fortress-palace of El Rey Martinez rises above the Frontera like a monument to defiance. Behind its heavy oak doors, the outlaw king holds court, dispensing his own brand of justice and plotting the revolution that will reshape the frontier.',
    shortDescription: 'El Rey\'s palace and seat of power',
    type: 'elite_club',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 10, close: 18 }, // Audiences 10am-6pm, but palace is always guarded
    atmosphere: 'Revolutionary flags hang from stone walls stained with the blood of traitors. Maps of the frontier cover war tables while armed revolucionarios stand at attention. The air crackles with the energy of men who believe they can change the world through violence.',
    requirements: { minCriminalRep: 50 },
    npcs: [
      {
        id: 'el-rey-martinez',
        name: 'El Rey Martinez',
        title: 'The Outlaw King',
        description: 'A complex anti-hero who rules the Frontera with charisma and an iron fist. Ruthless to his enemies, fiercely loyal to his people. He dreams of a free frontier, but his methods are stained with blood.',
        personality: 'Ruthless yet charismatic. Cunning strategist who plays the long game. Genuinely believes in the revolution but willing to sacrifice anything for it. Respects strength and loyalty above all.',
        faction: 'FRONTERA',
        dialogue: [
          'Welcome to my kingdom, stranger. Here, the Frontera Code is law.',
          'The settlers and the federales think they own this land. We\'ll teach them otherwise.',
          'Loyalty is everything in the Frontera. Betray me, and you\'ll wish you were never born.',
          'Rosa Muerte tells me you\'re making a name for yourself. Good. We need fighters.',
          'Dead-Eye Diego guards our gold. Cross him and you cross me.',
        ],
        quests: ['prove-loyalty', 'revolucionario-mission', 'eliminate-traitor'],
      },
      {
        id: 'capitan-fuentes',
        name: 'Capitán Fuentes',
        title: 'El Rey\'s Enforcer',
        description: 'A scarred veteran of countless battles who enforces El Rey\'s will with brutal efficiency. His loyalty is absolute and his methods are uncompromising.',
        personality: 'Disciplined and ruthless. No sense of humor. Follows orders without question. Respects only strength and loyalty.',
        faction: 'FRONTERA',
        dialogue: [
          'State your business. El Rey\'s time is valuable.',
          'You want to see the king? Prove you\'re worthy first.',
          'I\'ve broken stronger men than you for less. Don\'t test me.',
          'The revolution needs soldiers, not talkers.',
        ],
      },
      {
        id: 'la-rosa',
        name: 'La Rosa',
        title: 'Spy & Advisor',
        description: 'A beautiful and deadly woman who serves as El Rey\'s eyes and ears throughout the frontier. She knows everyone\'s secrets and uses them like weapons.',
        personality: 'Cunning and manipulative. Speaks in half-truths and riddles. Fiercely intelligent. Her loyalty to El Rey is her only certainty.',
        faction: 'FRONTERA',
        dialogue: [
          'Information is power, querido. What secrets do you bring me?',
          'I know what you did at the cantina. El Rey knows everything.',
          'El Susurro deals in goods. I deal in truths. Which is more valuable?',
          'Trust is earned in blood here. Are you willing to bleed for the Frontera?',
        ],
      },
      {
        id: 'palace-guard-1',
        name: 'Palace Guard',
        title: 'Elite Guard',
        description: 'One of El Rey\'s most trusted soldiers, armed and alert.',
        personality: 'Silent and watchful. All business.',
        faction: 'FRONTERA',
        dialogue: [
          'Move along unless you have business with El Rey.',
          'The palace is secure. As always.',
        ],
      },
    ],
    availableActions: ['audience-with-rey', 'revolucionario-planning', 'intelligence-briefing', 'loyalty-oath'],
    availableCrimes: ['Spy on War Room', 'Steal Intelligence'],
    jobs: [
      {
        id: 'palace-guard',
        name: 'Palace Guard',
        description: 'Protect El Rey\'s palace from threats. Stand watch and enforce security.',
        energyCost: 15,
        cooldownMinutes: 40,
        rewards: { goldMin: 22, goldMax: 35, xp: 35, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'revolucionario-courier',
        name: 'Revolucionario Courier',
        description: 'Deliver secret messages between revolucionario cells across the frontier.',
        energyCost: 18,
        cooldownMinutes: 50,
        rewards: { goldMin: 30, goldMax: 50, xp: 45, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'code-enforcer',
        name: 'Code Enforcer',
        description: 'Enforce the Frontera Code. Hunt down those who break El Rey\'s laws.',
        energyCost: 22,
        cooldownMinutes: 60,
        rewards: { goldMin: 45, goldMax: 70, xp: 60, items: [] },
        requirements: { minLevel: 12 },
      },
      {
        id: 'personal-favor',
        name: 'Personal Favor for El Rey',
        description: 'Handle delicate matters that require El Rey\'s most trusted operatives.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 70, goldMax: 120, xp: 85, items: [] },
        requirements: { minLevel: 18 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'war-room',
        name: 'War Room',
        description: 'The inner sanctum where El Rey plans the revolution. Maps, intelligence reports, and battle plans cover every surface.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 150,
          npcTrust: { npcId: 'el-rey-martinez', level: 5 },
        },
        content: {
          actions: ['review-battle-plans', 'coordinate-revolution', 'command-operations'],
          npcs: ['el-rey-martinez', 'la-rosa', 'capitan-fuentes'],
          dialogue: [
            'You\'ve proven yourself, amigo. Now you see the true face of the revolution.',
            'These maps show every settlement, every weakness. Soon, the frontier will be ours.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 5, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 10. CASA DE LOS JUEGOS =====
  {
    _id: FRONTERA_BUILDING_IDS.CASA_DE_LOS_JUEGOS,
    name: 'Casa de los Juegos',
    description: 'The House of Games pulses with the thrill of chance and the agony of loss. Cards slap on felt tables, dice clatter, and fortunes change hands beneath the watchful eye of El Serpiente. Some say La Fortuna\'s predictions are more reliable than the cards.',
    shortDescription: 'High-stakes gambling hall',
    type: 'cantina',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 12, close: 4 },
    atmosphere: 'Cigar smoke hangs thick in the air. The rattle of dice and shuffle of cards creates a hypnotic rhythm. Desperate men bet their last gold while wealthy banditos laugh at their losses. Fortune is a fickle mistress here.',
    npcs: [
      {
        id: 'el-serpiente-gambler',
        name: 'El Serpiente',
        title: 'Master Card Shark',
        description: 'The same thin man with quick hands from the cantina, but here he reigns supreme at the high-stakes tables. His reputation for reading opponents is legendary.',
        personality: 'Calculating and patient. Strikes only when the odds favor him. Enjoys the psychological warfare of gambling more than the money.',
        faction: 'FRONTERA',
        dialogue: [
          'Welcome to the House of Games. Your gold or your pride - you\'ll leave without one.',
          'I can see your tell from across the room, amigo. You should work on that.',
          'Rosa Muerte sends promising players my way. Let\'s see if you\'re one of them.',
          'La Fortuna read my cards once. She hasn\'t been wrong yet, unfortunately.',
        ],
      },
      {
        id: 'la-fortuna',
        name: 'La Fortuna',
        title: 'Fortune Teller',
        description: 'An ancient Nahi woman with clouded eyes who sees more than most. Her card readings are eerily accurate, and even the hardest outlaws seek her counsel.',
        personality: 'Mysterious and knowing. Speaks in cryptic prophecies. Genuinely connected to something beyond normal understanding.',
        faction: 'FRONTERA',
        dialogue: [
          'The cards speak, hijo. Do you dare to listen?',
          'I see blood in your future. But also gold. Which will flow more freely?',
          'El Rey fears only one thing - the truth I might tell. What do you fear?',
          'Death walks with you. But she is patient. You have time yet.',
        ],
      },
      {
        id: 'pit-boss-juegos',
        name: 'Marco "El Ojo"',
        title: 'Pit Boss',
        description: 'A sharp-eyed man who watches every table for cheaters. He\'s fast with both his eyes and his blade.',
        personality: 'Paranoid and observant. No-nonsense. Hates cheaters with a passion.',
        faction: 'FRONTERA',
        dialogue: [
          'Play fair or don\'t play at all. My house, my rules.',
          'I catch you cheating, Sangre gets first crack at you in The Pit.',
          'The house edge is enough. We don\'t need cheaters making it worse.',
        ],
      },
    ],
    availableActions: ['poker', 'dice-games', 'fortune-telling', 'high-stakes-table', 'watch-games'],
    availableCrimes: ['Cheat at Cards', 'Steal from Winner', 'Mark Cards'],
    jobs: [
      {
        id: 'dealer',
        name: 'Dealer',
        description: 'Deal cards and run games. Keep the house edge working.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 20, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'card-counter',
        name: 'Card Counter',
        description: 'Use your skills to track cards and give the house intelligence on big players.',
        energyCost: 18,
        cooldownMinutes: 45,
        rewards: { goldMin: 30, goldMax: 55, xp: 40, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'high-stakes-table',
        name: 'High Stakes Table',
        description: 'Play at the invitation-only high-rollers table. Big risk, bigger rewards.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 50, goldMax: 150, xp: 65, items: [] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [
      {
        id: 'gambling-supplies',
        name: 'Casa de los Juegos Shop',
        description: 'Gambling supplies and lucky charms.',
        shopType: 'specialty',
        items: [
          { itemId: 'marked-cards', name: 'Marked Cards', description: 'Subtle markings only you can see', price: 60, requiredLevel: 5 },
          { itemId: 'loaded-dice', name: 'Loaded Dice', description: 'Always land on your number', price: 45, requiredLevel: 5 },
          { itemId: 'lucky-coin', name: 'Lucky Coin', description: '+3% gambling luck', price: 30 },
          { itemId: 'card-deck', name: 'Quality Card Deck', description: 'Professional grade cards', price: 10 },
          { itemId: 'fortuna-charm', name: 'La Fortuna\'s Charm', description: 'Blessed by the fortune teller', price: 85, requiredLevel: 8 },
          { itemId: 'poker-chips', name: 'Poker Chips', description: 'House chips for betting', price: 5 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'rigged-vault',
        name: 'Rigged Vault',
        description: 'The house\'s secret vault where marked cards, loaded dice, and the real winnings are kept. Only the most skilled can access it.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 100,
        },
        content: {
          actions: ['steal-house-edge', 'learn-rigging-techniques'],
          npcs: [],
          dialogue: ['So you found the vault. El Serpiente will be impressed... or furious.'],
          rewards: { gold: 500, xp: 100, items: ['master-marked-deck', 'weighted-dice-set'] },
        },
      },
    ],
    connections: [],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 10, frontera: 90 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== LOS BAJOS (THE UNDERWORLD) - 2 BUILDINGS =====

  // ===== 11. LA CASA DE HUMO =====
  {
    _id: FRONTERA_BUILDING_IDS.LA_CASA_DE_HUMO,
    name: 'La Casa de Humo',
    description: 'Sweet, acrid smoke drifts through silk curtains in this opium den run by Chen Wei-Lin. Here, dreams and nightmares blur together while information flows as freely as the smoke. The House of Smoke is where secrets come to die... or to be reborn.',
    shortDescription: 'Opium den and information broker',
    type: 'cantina',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 18, close: 6 },
    atmosphere: 'Silk lanterns cast red and gold shadows through thick, sweet smoke. Men and women recline on cushions, lost in opium dreams. In the back rooms, information brokers whisper secrets that could topple empires. The air itself seems to whisper forbidden knowledge.',
    requirements: { minCriminalRep: 30 },
    npcs: [
      {
        id: 'chen-wei-lin',
        name: 'Chen Wei-Lin "El Dragón"',
        title: 'Master of the House',
        description: 'A Chinese merchant who escaped the railroad camps and built an empire of smoke and secrets. His network extends far beyond the Frontera, connecting to Chinese communities across the frontier.',
        personality: 'Cunning and patient. Speaks softly but commands absolute respect. Values information above gold. Has connections throughout the Chinese railroad network.',
        faction: 'FRONTERA',
        dialogue: [
          'Welcome to my humble establishment. The smoke reveals all truths, given time.',
          'I know of your dealings with El Susurro. Different merchandise, same business.',
          'La Rosa seeks information. I seek understanding. We are not the same.',
          'The railroad workers tell me things. Things the settlers wish to keep hidden.',
        ],
      },
      {
        id: 'smoke-girl-mei',
        name: 'Mei',
        title: 'Smoke Girl',
        description: 'A young woman who tends to clients with quiet efficiency. Her eyes see everything while her lips say nothing.',
        personality: 'Silent and observant. Loyal to Chen Wei-Lin. Knows more than she reveals.',
        faction: 'FRONTERA',
        dialogue: [
          '*offers pipe silently*',
          'The smoke will show you what you need to see.',
          'Chen knows you are here. He knows everything.',
        ],
      },
      {
        id: 'the-whisperer',
        name: 'The Whisperer',
        title: 'Information Broker',
        description: 'A shadowy figure who buys and sells secrets from a back room shrouded in smoke.',
        personality: 'Paranoid and cryptic. Deals only in valuable information.',
        faction: 'FRONTERA',
        dialogue: [
          '*whisper* What secret do you seek? What secret can you trade?',
          'Information has more value than opium. The smoke fades, but knowledge endures.',
          'I know things about El Rey that would make La Rosa jealous. For a price.',
        ],
      },
    ],
    availableActions: ['smoke-opium', 'buy-information', 'sell-information', 'dream-visions', 'chinese-network-contact'],
    availableCrimes: ['Steal Opium', 'Rob Dreamers', 'Eavesdrop'],
    jobs: [
      {
        id: 'runner',
        name: 'Runner',
        description: 'Deliver opium and messages throughout the Frontera.',
        energyCost: 15,
        cooldownMinutes: 35,
        rewards: { goldMin: 20, goldMax: 35, xp: 30, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'information-gatherer',
        name: 'Information Gatherer',
        description: 'Listen to dreamers\' confessions and extract valuable intelligence.',
        energyCost: 18,
        cooldownMinutes: 50,
        rewards: { goldMin: 35, goldMax: 60, xp: 45, items: [] },
        requirements: { minLevel: 10 },
      },
      {
        id: 'dream-reader',
        name: 'Dream Reader',
        description: 'Interpret opium visions for clients and uncover hidden truths.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 45, goldMax: 75, xp: 55, items: [] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [
      {
        id: 'smoke-house-shop',
        name: 'House of Smoke Wares',
        description: 'Substances and secrets. WARNING: Opium products may cause addiction (future mechanic).',
        shopType: 'black_market',
        items: [
          { itemId: 'tobacco-pipe', name: 'Tobacco Pipe', description: 'Simple pipe for smoking', price: 8 },
          { itemId: 'hashish', name: 'Hashish', description: 'Mild relaxation. WARNING: Addictive', price: 25, requiredLevel: 5 },
          { itemId: 'opium-small', name: 'Opium (Small)', description: 'Enter the dream world. WARNING: Highly addictive', price: 50, requiredLevel: 8 },
          { itemId: 'opium-large', name: 'Opium (Large)', description: 'Deep visions. WARNING: Extreme addiction risk', price: 120, requiredLevel: 12 },
          { itemId: 'secret-low', name: 'Minor Secret', description: 'Low-value information', price: 40 },
          { itemId: 'secret-high', name: 'Major Secret', description: 'Valuable intelligence', price: 150, requiredLevel: 10 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 5, frontera: 90 },
    isUnlocked: true,
    isHidden: false,
  },
  // NOTE: ADDICTION MECHANIC - Future feature will track opium/substance use and create addiction status effects
  // Players will need to manage addiction levels, suffer withdrawal penalties, and seek treatment
  // Addiction will affect energy regen, combat stats, and create dependencies on substances

  // ===== 12. EL ARSENAL =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_ARSENAL,
    name: 'El Arsenal',
    description: 'The revolution\'s beating heart - a fortress warehouse stacked with enough weapons and explosives to arm a small army. Dynamite Miguel and Sergeant Cole maintain the arsenal with military precision, preparing for the war they know is coming.',
    shortDescription: 'Revolutionary weapons warehouse',
    type: 'blacksmith',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 6, close: 22 },
    atmosphere: 'The sharp smell of gun oil and powder fills the air. Rifles line the walls like soldiers at attention. Crates marked with revolucionario symbols are stacked to the ceiling. Every sound echoes with the promise of violence to come.',
    requirements: { minCriminalRep: 40 },
    npcs: [
      {
        id: 'dynamite-miguel',
        name: 'Dynamite Miguel',
        title: 'Master Demolitionist',
        description: 'A genius with explosives who lost three fingers learning his craft. What he can do with dynamite and black powder borders on artistry... deadly artistry.',
        personality: 'Enthusiastic about explosions to a disturbing degree. Brilliant but slightly unhinged. Deeply loyal to the revolution.',
        faction: 'FRONTERA',
        dialogue: [
          'Ah, amigo! Come to see my beautiful explosions? I have something special today!',
          'People fear dynamite. I love it. We understand each other, the dynamite and I.',
          'Capitán Fuentes wants the bridge destroyed? Hah! Give me two sticks and ten minutes!',
          'El Rey says I\'m loco. But crazy and genius, they look the same when the smoke clears.',
        ],
      },
      {
        id: 'sergeant-cole',
        name: 'Sergeant Cole',
        title: 'Arsenal Master',
        description: 'A former US Army quartermaster who deserted after witnessing too many atrocities. He runs the arsenal with military efficiency.',
        personality: 'Disciplined and methodical. Haunted by his past. Believes in the revolution as redemption.',
        faction: 'FRONTERA',
        dialogue: [
          'Every weapon accounted for. Every bullet logged. Discipline wins wars.',
          'I served the federales once. Never again. The revolution is my redemption.',
          'Miguel\'s brilliant but reckless. Someone has to keep him from blowing us all up.',
          'You want military-grade weapons? Prove you can handle them first.',
        ],
      },
      {
        id: 'arsenal-guard-1',
        name: 'Arsenal Guard',
        title: 'Armed Guard',
        description: 'A heavily armed revolucionario standing watch over the weapons cache.',
        personality: 'Alert and serious. No unauthorized access.',
        faction: 'FRONTERA',
        dialogue: [
          'State your business. This is a restricted area.',
          'El Rey trusts us to protect these weapons. I won\'t fail him.',
        ],
      },
    ],
    availableActions: ['requisition-weapons', 'explosives-training', 'weapons-maintenance', 'demolition-planning'],
    availableCrimes: ['Steal Weapons', 'Steal Explosives'],
    jobs: [
      {
        id: 'weapons-loader',
        name: 'Weapons Loader',
        description: 'Load, organize, and maintain the arsenal\'s inventory.',
        energyCost: 12,
        cooldownMinutes: 30,
        rewards: { goldMin: 18, goldMax: 28, xp: 25, items: [] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'demolition-prep',
        name: 'Demolition Preparation',
        description: 'Help Miguel prepare explosive charges for revolucionario operations.',
        energyCost: 20,
        cooldownMinutes: 50,
        rewards: { goldMin: 40, goldMax: 65, xp: 50, items: [] },
        requirements: { minLevel: 10 },
      },
      {
        id: 'arms-runner',
        name: 'Arms Runner',
        description: 'Transport weapons to revolucionario cells across dangerous territory.',
        energyCost: 25,
        cooldownMinutes: 75,
        rewards: { goldMin: 60, goldMax: 100, xp: 70, items: [] },
        requirements: { minLevel: 18 },
      },
    ],
    shops: [
      {
        id: 'arsenal-shop',
        name: 'El Arsenal',
        description: 'Military-grade weapons and explosives.',
        shopType: 'weapons',
        items: [
          { itemId: 'revolver-standard', name: 'Standard Revolver', description: 'Reliable sidearm', price: 45 },
          { itemId: 'rifle-winchester', name: 'Winchester Rifle', description: 'Lever-action repeater', price: 120, requiredLevel: 5 },
          { itemId: 'shotgun-sawed', name: 'Sawed-off Shotgun', description: 'Close-range devastation', price: 85, requiredLevel: 6 },
          { itemId: 'dynamite-stick', name: 'Dynamite Stick', description: 'Miguel\'s finest work', price: 60, requiredLevel: 8 },
          { itemId: 'blasting-powder', name: 'Blasting Powder', description: 'Black powder explosive', price: 35, requiredLevel: 6 },
          { itemId: 'ammunition-box', name: 'Ammunition Box', description: '100 rounds assorted', price: 25 },
          { itemId: 'military-rifle', name: 'Military Rifle', description: 'Army surplus, stolen', price: 180, requiredLevel: 10 },
          { itemId: 'machete-large', name: 'Large Machete', description: 'Close combat weapon', price: 30 },
          { itemId: 'throwing-knives', name: 'Throwing Knives (Set)', description: 'Silent and deadly', price: 40, requiredLevel: 5 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'hidden-armory',
        name: 'Hidden Armory',
        description: 'A secret underground cache containing the revolution\'s most powerful weapons - Gatling guns, heavy explosives, and experimental weapons.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 500,
        },
        content: {
          actions: ['access-heavy-weapons', 'experimental-explosives'],
          npcs: ['dynamite-miguel', 'sergeant-cole'],
          dialogue: [
            'You\'ve earned this, soldado. These weapons will change the revolution.',
            'What you see here could destroy an entire settlement. Use them wisely.',
          ],
          rewards: { items: ['gatling-gun-schematic', 'experimental-dynamite'] },
        },
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 100 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== LAS SOMBRAS (THE SHADOWS) - 3 BUILDINGS =====

  // ===== 13. LA CAPILLA DE LOS CAÍDOS =====
  {
    _id: FRONTERA_BUILDING_IDS.LA_CAPILLA_DE_LOS_CAIDOS,
    name: 'La Capilla de los Caídos',
    description: 'A weathered chapel where Padre Domingo tends to the souls of outlaws and revolucionarios. Here, even the most hardened criminals seek absolution, and Sister María heals wounds both physical and spiritual. Below, in the catacombs, the chapel offers sanctuary to those fleeing justice.',
    shortDescription: 'Outlaw chapel and sanctuary',
    type: 'church',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7 - sanctuary knows no hours
    atmosphere: 'Candles flicker before a bullet-scarred crucifix. The pews are worn smooth by countless desperate prayers. Blood stains the floorboards near the confessional - some sins require more than words to absolve.',
    npcs: [
      {
        id: 'padre-domingo',
        name: 'Padre Domingo',
        title: 'The Outlaw Priest',
        description: 'A priest who left his cathedral to serve those the church abandoned. He wears his collar with a gun belt beneath his robes and dispenses both blessings and bullets with equal conviction.',
        personality: 'Compassionate but realistic. Believes God forgives all, but justice still requires action. Genuinely cares for his outlaw flock.',
        faction: 'FRONTERA',
        dialogue: [
          'God welcomes all souls, hijo. Even those stained with blood.',
          'Confession cleanses the soul. But the catacombs hide the body - if needed.',
          'Sister María can heal your wounds. Only you can heal your spirit.',
          'Padre Oscuro serves Death. I serve Life. We understand each other.',
          'El Rey fights for freedom. I fight for salvation. Sometimes they\'re the same.',
        ],
      },
      {
        id: 'sister-maria',
        name: 'Sister María',
        title: 'Healer with a Dark Past',
        description: 'A nun with gentle hands and haunted eyes. Rumor says she was once La Rosa\'s protégé before finding redemption in the chapel. She never speaks of her past.',
        personality: 'Quiet and kind, but with steel beneath. Her nursing skills are matched only by her ability to keep secrets.',
        faction: 'FRONTERA',
        dialogue: [
          'Let me see your wounds. I\'ve treated worse.',
          'The past is buried. Only the present needs healing.',
          'Some ask if I know La Rosa. I ask them: does it matter?',
          'Dr. Carnicero keeps you alive. I help you live. Different skills.',
        ],
      },
    ],
    availableActions: ['confession', 'prayer', 'healing', 'sanctuary', 'last-rites'],
    availableCrimes: ['Steal Donations', 'Rob Pilgrims'],
    jobs: [
      {
        id: 'confessor',
        name: 'Confessor',
        description: 'Listen to confessions and provide spiritual counsel. Learn secrets.',
        energyCost: 8,
        cooldownMinutes: 25,
        rewards: { goldMin: 8, goldMax: 15, xp: 12, items: [] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'last-rites',
        name: 'Last Rites',
        description: 'Attend to the dying and perform funeral rites. Grim but necessary work.',
        energyCost: 15,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 40, xp: 35, items: [] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'sanctuary-guard',
        name: 'Sanctuary Guard',
        description: 'Protect those seeking sanctuary in the chapel from pursuers.',
        energyCost: 20,
        cooldownMinutes: 55,
        rewards: { goldMin: 35, goldMax: 55, xp: 45, items: [] },
        requirements: { minLevel: 12 },
      },
    ],
    shops: [
      {
        id: 'chapel-offerings',
        name: 'Chapel of the Fallen Offerings',
        description: 'Religious items and healing supplies.',
        shopType: 'general',
        items: [
          { itemId: 'prayer-candle', name: 'Prayer Candle', description: 'Light a candle for the fallen', price: 2 },
          { itemId: 'rosary-beads', name: 'Rosary Beads', description: 'For prayer and meditation', price: 8 },
          { itemId: 'blessed-cross', name: 'Blessed Cross', description: '+5% protection from death', price: 45 },
          { itemId: 'healing-herbs', name: 'Healing Herbs', description: 'Sister María\'s blend', price: 20 },
          { itemId: 'forgiveness-writ', name: 'Forgiveness Writ', description: 'Official church pardon', price: 100, requiredLevel: 8 },
          { itemId: 'sanctuary-token', name: 'Sanctuary Token', description: 'Grants one use of chapel sanctuary', price: 75 },
        ],
        buyMultiplier: 0.3,
      },
    ],
    secrets: [
      {
        id: 'catacombs',
        name: 'The Catacombs',
        description: 'Ancient tunnels beneath the chapel where escaped outlaws hide and revolucionarios plan in secret. The bones of forgotten criminals line the walls.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 80,
          npcTrust: { npcId: 'padre-domingo', level: 4 },
        },
        content: {
          actions: ['hide-from-law', 'underground-meeting', 'escape-tunnel-access'],
          npcs: ['escaped-outlaw-npc'],
          dialogue: [
            'The dead keep our secrets. And so shall I.',
            'Many have hidden here. Few have betrayed the sanctuary. Those who did... well, the catacombs have room.',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 10, nahiCoalition: 15, frontera: 75 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 14. LA CUEVA DE LOS ESPÍRITUS =====
  {
    _id: FRONTERA_BUILDING_IDS.LA_CUEVA_DE_LOS_ESPIRITUS,
    name: 'La Cueva de los Espíritus',
    description: 'Deep in the cliffs above the Frontera, a sacred cave where the boundary between worlds grows thin. The Prophet dwells here in darkness, his blind eyes seeing what others cannot. Those who brave the vision quest emerge changed - if they emerge at all.',
    shortDescription: 'Mystical cave for vision quests',
    type: 'spirit_lodge',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // 24/7 - spirits don't keep office hours
    atmosphere: 'Ancient petroglyphs cover the cave walls, illuminated by sacred fires. The air tastes of sage and peyote smoke. Whispers echo from deep within - though whether from spirits or madness, who can say?',
    requirements: { minLevel: 10 },
    npcs: [
      {
        id: 'the-prophet',
        name: 'The Prophet',
        title: 'Blind Seer',
        description: 'An ancient man of unclear heritage - perhaps Nahi, perhaps Spanish, perhaps something older. His eyes are milk-white with cataracts, yet he navigates the cave with perfect precision. His prophecies are rarely clear but never wrong.',
        personality: 'Cryptic and otherworldly. Speaks in riddles and visions. Deeply connected to the spiritual realm. Respects those who seek truth.',
        faction: 'FRONTERA',
        dialogue: [
          'I see you, stranger. Not with these dead eyes, but with sight beyond sight.',
          'You seek the spirits. But do they seek you? That is the question.',
          'La Fortuna reads cards. I read souls. We both see the same truths, written differently.',
          'The cave will show you what you need to see. Not what you want to see.',
          'Three visions you must complete. Then the Prophecy Chamber opens. Are you ready?',
        ],
      },
      {
        id: 'cave-tender',
        name: 'Silent Runner',
        title: 'Cave Tender',
        description: 'A young Nahi man who tends the sacred fires and prepares vision seekers. He never speaks, communicating only through gestures.',
        personality: 'Silent and reverent. Deeply spiritual. Protects the cave and The Prophet.',
        faction: 'FRONTERA',
        dialogue: [
          '*gestures toward the fire*',
          '*offers sacred peyote*',
          '*nods solemnly*',
        ],
      },
    ],
    availableActions: ['vision-quest', 'spirit-communication', 'prophecy-seeking', 'sacred-meditation'],
    availableCrimes: ['Steal Sacred Items', 'Desecrate Cave'],
    jobs: [
      {
        id: 'vision-quest',
        name: 'Vision Quest',
        description: 'Undergo a sacred peyote journey to commune with spirits and gain insight.',
        energyCost: 25,
        cooldownMinutes: 120,
        rewards: { goldMin: 0, goldMax: 0, xp: 60, items: [] },
        requirements: { minLevel: 10 },
      },
      {
        id: 'spirit-guide',
        name: 'Spirit Guide',
        description: 'Guide others through their vision quests and protect them from dark spirits.',
        energyCost: 20,
        cooldownMinutes: 90,
        rewards: { goldMin: 40, goldMax: 70, xp: 55, items: [] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'oracle-consultation',
        name: 'Oracle Consultation',
        description: 'Consult The Prophet for specific prophecies and spiritual guidance.',
        energyCost: 30,
        cooldownMinutes: 180,
        rewards: { goldMin: 50, goldMax: 100, xp: 75, items: [] },
        requirements: { minLevel: 20 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'prophecy-chamber',
        name: 'Prophecy Chamber',
        description: 'The deepest chamber of the cave where The Prophet receives his most powerful visions. The walls are covered in prophecies spanning centuries.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 120,
        },
        content: {
          actions: ['read-ancient-prophecies', 'deep-vision-quest', 'commune-with-ancients'],
          npcs: ['the-prophet'],
          dialogue: [
            'The chamber opens to you. Read the walls. Read the future. Read yourself.',
            'Every prophecy here has come true. Yours is written too. Do you dare to read it?',
          ],
          rewards: { xp: 150, items: ['prophecy-scroll'] },
        },
      },
    ],
    connections: [],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 40, frontera: 55 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 15. EL CALLEJÓN DE LOS ASESINOS =====
  {
    _id: FRONTERA_BUILDING_IDS.EL_CALLEJON_DE_LOS_ASESINOS,
    name: 'El Callejón de los Asesinos',
    description: 'Few know this place exists. Hidden in the maze of the Frontera\'s darkest alleys, this is where La Sombra Blanca conducts her deadly business. Here, death is a commodity traded with cold precision. Only the most skilled and trusted are permitted entry.',
    shortDescription: 'Hidden assassin\'s guild',
    type: 'smugglers_den',
    region: 'town',
    parentId: LOCATION_IDS.THE_FRONTERA,
    tier: 5,
    dominantFaction: 'frontera',
    operatingHours: { open: 22, close: 4 },
    atmosphere: 'Shadow upon shadow. Blades gleam in candlelight. A contract board lists names - each one worth a fortune or a death sentence. The silence here is absolute and terrifying.',
    requirements: {
      minLevel: 15,
      minCriminalRep: 750,
    },
    npcs: [
      {
        id: 'la-sombra-blanca',
        name: 'La Sombra Blanca',
        title: 'The White Shadow',
        description: 'The master assassin of the Frontera, dressed always in white - a mockery of her deadly profession. She has never failed a contract. Never. Her methods are as elegant as they are lethal.',
        personality: 'Cold and professional. Sees assassination as art. No emotion, no hesitation, no mercy. Respects skill and discretion above all.',
        faction: 'FRONTERA',
        dialogue: [
          'You were referred. Good. I don\'t advertise.',
          'A name. A price. A deadline. That is all I need.',
          'La Sombra runs smugglers. I run a different kind of business. We don\'t compete.',
          'The Whisperer sells information. I sell silence. Permanent silence.',
          'El Rey knows what I do. He permits it. That is all you need to know.',
        ],
        quests: ['first-contract', 'impossible-target'],
      },
      {
        id: 'contact-handler',
        name: 'El Silencio',
        title: 'Contact Handler',
        description: 'A figure completely wrapped in dark cloth. They handle the business side of assassination - vetting clients, collecting payment, verifying kills.',
        personality: 'Silent and efficient. Never speaks, only writes. Utterly loyal to La Sombra Blanca.',
        faction: 'FRONTERA',
        dialogue: [
          '*writes on paper: State your business*',
          '*writes: Payment first. Results guaranteed.*',
          '*nods and points to contract board*',
        ],
      },
    ],
    availableActions: ['review-contracts', 'accept-assassination', 'report-kill', 'training'],
    availableCrimes: [], // No crimes here - this IS the crime
    jobs: [
      {
        id: 'intel-gathering',
        name: 'Intelligence Gathering',
        description: 'Study your target. Learn patterns, weaknesses, opportunities.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 50, goldMax: 80, xp: 55, items: [] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'target-setup',
        name: 'Target Setup',
        description: 'Position yourself for the perfect kill. Preparation is everything.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 75, goldMax: 120, xp: 70, items: [] },
        requirements: { minLevel: 20 },
      },
      {
        id: 'elimination-contract',
        name: 'Elimination Contract',
        description: 'Execute a full assassination contract. High risk, high reward.',
        energyCost: 35,
        cooldownMinutes: 180,
        rewards: { goldMin: 150, goldMax: 300, xp: 120, items: [] },
        requirements: { minLevel: 25 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'contract-board',
        name: 'Master Contract Board',
        description: 'The full assassination contracts - targets that require the highest skill level. Politicians, gang leaders, federal agents. Each one a fortune.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 1000,
          npcTrust: { npcId: 'la-sombra-blanca', level: 5 },
        },
        content: {
          actions: ['legendary-contracts', 'political-assassinations', 'gang-war-eliminations'],
          npcs: ['la-sombra-blanca'],
          dialogue: [
            'You\'ve proven yourself. These contracts are the real work. Fail once, and you\'re finished.',
            'Each name here could change the frontier. Choose wisely.',
          ],
          rewards: { gold: 1000, items: ['master-assassin-blade'] },
        },
      },
    ],
    connections: [],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 100 },
    isUnlocked: true,
    isHidden: true, // This building is hidden until discovered
  },
];

/**
 * Seed The Frontera buildings into the database
 */
export async function seedFronteraBuildings(): Promise<void> {
  try {
    // Verify The Frontera exists
    const frontera = await Location.findById(LOCATION_IDS.THE_FRONTERA);
    if (!frontera) {
      console.warn('Warning: The Frontera location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Frontera buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.THE_FRONTERA });

    // Insert Frontera buildings
    await Location.insertMany(fronteraBuildings);

    console.log(`Successfully seeded ${fronteraBuildings.length} Frontera buildings`);
  } catch (error) {
    console.error('Error seeding Frontera buildings:', error);
    throw error;
  }
}

export default fronteraBuildings;
