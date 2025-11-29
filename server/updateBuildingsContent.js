/**
 * Update Red Gulch buildings with appropriate content
 * Moves jobs, shops, NPCs, and crimes to the correct buildings
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function update() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados');
  console.log('Connected to MongoDB');

  const Location = mongoose.model('Location', new mongoose.Schema({}, { strict: false }));

  const RED_GULCH_ID = '6501a0000000000000000001';

  // Correct Building IDs (from database check)
  const BUILDINGS = {
    GOLDEN_SPUR_SALOON: '6502b0000000000000000001',    // The Golden Spur Saloon
    SHERIFF_OFFICE: '6502b0000000000000000002',         // Sheriff's Office
    MINERS_SUPPLY: '6502b0000000000000000003',          // Miner's Supply Co
    RED_GULCH_BANK: '6502b0000000000000000004',         // Red Gulch Bank
    IRON_JAKES_FORGE: '6502b0000000000000000005',       // Iron Jake's Forge
    ASSAY_OFFICE: '6502b0000000000000000006',           // Gulch Assay Office
    DOCTORS_OFFICE: '6502b0000000000000000007',         // Doc Morrison's
    DUSTY_TRAILS_HOTEL: '6502b0000000000000000008',     // Dusty Trails Hotel
    GOVERNORS_MANSION: '6502b0000000000000000009',      // Governor's Mansion
    MINING_COMPANY_HQ: '6502b000000000000000000a',      // Ashford Mining Company HQ
    GILDED_PEACOCK: '6502b000000000000000000b',         // The Gilded Peacock
    LABOR_EXCHANGE: '6502b000000000000000000c',         // The Labor Exchange
    SLOP_HOUSE: '6502b000000000000000000d',             // The Slop House
    TENT_CITY: '6502b000000000000000000e',              // Tent City
    CHENS_APOTHECARY: '6502b000000000000000000f',       // Chen's Apothecary
    DRAGON_GATE_TEA: '6502b0000000000000000010',        // Dragon Gate Tea House
    MEI_LINGS_LAUNDRY: '6502b0000000000000000011',      // Mei Ling's Laundry
  };

  // === CLEAR RED GULCH PARENT ===
  console.log('\nClearing Red Gulch parent location content...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(RED_GULCH_ID) },
    {
      $set: {
        jobs: [],
        shops: [],
        npcs: [],
        availableCrimes: []
      }
    }
  );
  console.log('Red Gulch parent cleared');

  // === UPDATE GOLDEN SPUR SALOON ===
  console.log('\nUpdating Golden Spur Saloon...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.GOLDEN_SPUR_SALOON) },
    {
      $set: {
        jobs: [
          {
            id: 'bartender',
            name: 'Bartender Shift',
            description: 'Serve drinks, listen to gossip, and keep the peace behind the bar.',
            energyCost: 12,
            cooldownMinutes: 20,
            rewards: { goldMin: 10, goldMax: 20, xp: 15, items: [] },
            requirements: { minLevel: 1 }
          },
          {
            id: 'card-dealer',
            name: 'Card Dealer',
            description: 'Deal poker and faro games for the house.',
            energyCost: 15,
            cooldownMinutes: 30,
            rewards: { goldMin: 15, goldMax: 30, xp: 25, items: [] },
            requirements: { minLevel: 3 }
          }
        ],
        npcs: [
          {
            id: 'two-gun-wade',
            name: 'Samuel "Two-Gun" Wade',
            title: 'Saloon Owner',
            description: 'Charming and calculating owner of The Golden Spur. He knows everyones secrets.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Care for a game of poker?', 'Information has a price, friend.', 'What can I get ya?'],
            quests: ['saloon-debt-collection'],
            isVendor: false
          },
          {
            id: 'piano-pete',
            name: 'Piano Pete',
            title: 'Pianist',
            description: 'The old pianist who plays from dusk till dawn. He sees everything.',
            dialogue: ['*plays a melancholy tune*', 'Tips are appreciated, stranger.'],
            isVendor: false
          }
        ],
        availableCrimes: ['Pickpocket Drunk', 'Rob Saloon', 'Cheat at Cards'],
        shops: [
          {
            id: 'saloon-bar',
            name: 'The Bar',
            description: 'Drinks to warm your belly and loosen your tongue.',
            shopType: 'general',
            items: [
              { itemId: 'whiskey', name: 'Whiskey Shot', description: 'Burns going down', price: 2 },
              { itemId: 'beer', name: 'Beer', description: 'Watered down but cold', price: 1 },
              { itemId: 'fine-whiskey', name: 'Fine Whiskey', description: 'The good stuff', price: 10 }
            ],
            buyMultiplier: 0.3
          }
        ]
      }
    }
  );

  // === UPDATE SHERIFF'S OFFICE ===
  console.log('Updating Sheriff\'s Office...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.SHERIFF_OFFICE) },
    {
      $set: {
        jobs: [
          {
            id: 'deputy-work',
            name: 'Deputy Work',
            description: 'Help the marshal keep order in town. Patrol streets and handle minor disputes.',
            energyCost: 15,
            cooldownMinutes: 30,
            rewards: { goldMin: 15, goldMax: 25, xp: 30, items: [] },
            requirements: { minLevel: 1 }
          },
          {
            id: 'bounty-posting',
            name: 'Check Bounty Board',
            description: 'Review wanted posters and claim bounties.',
            energyCost: 5,
            cooldownMinutes: 10,
            rewards: { goldMin: 0, goldMax: 0, xp: 5, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'marshal-blackwood',
            name: 'Kane Blackwood',
            title: 'Town Marshal',
            description: 'A rare honest lawman struggling to maintain justice in a corrupt town. His eyes are tired but determined.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Keep your nose clean, stranger.', 'Justice is hard to come by here.', 'I could use someone I can trust.'],
            quests: ['corruption-investigation', 'bring-em-in-alive'],
            isVendor: false
          }
        ],
        availableCrimes: ['Jail Break', 'Steal Evidence'],
        shops: []
      }
    }
  );

  // === UPDATE MINER'S SUPPLY ===
  console.log('Updating Miner\'s Supply Co...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.MINERS_SUPPLY) },
    {
      $set: {
        jobs: [
          {
            id: 'stock-shelves',
            name: 'Stock Shelves',
            description: 'Help organize inventory and stock supplies.',
            energyCost: 10,
            cooldownMinutes: 15,
            rewards: { goldMin: 8, goldMax: 15, xp: 15, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'henderson',
            name: 'Eliza Henderson',
            title: 'Store Owner',
            description: 'A shrewd businesswoman who runs the largest general store in town.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Best prices in town, guaranteed.', 'Mining supplies in the back.'],
            quests: [],
            isVendor: true,
            shopId: 'miners-supply-store'
          }
        ],
        availableCrimes: ['Steal from Market', 'Burglarize Store'],
        shops: [
          {
            id: 'miners-supply-store',
            name: 'General Goods',
            description: 'Everything a prospector or settler needs.',
            shopType: 'general',
            items: [
              { itemId: 'bandages', name: 'Bandages', description: 'Basic medical supplies', price: 5 },
              { itemId: 'rope', name: 'Rope (50ft)', description: 'Sturdy hemp rope', price: 8 },
              { itemId: 'lantern', name: 'Oil Lantern', description: 'Light your way', price: 15 },
              { itemId: 'pickaxe', name: 'Pickaxe', description: 'Mining essential', price: 25 },
              { itemId: 'gold-pan', name: 'Gold Pan', description: 'For prospecting', price: 10 },
              { itemId: 'lockpicks', name: 'Lockpick Set', description: 'Tools for... professionals', price: 50, requiredLevel: 5 }
            ],
            buyMultiplier: 0.5
          }
        ]
      }
    }
  );

  // === UPDATE BANK ===
  console.log('Updating Red Gulch Bank...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.RED_GULCH_BANK) },
    {
      $set: {
        jobs: [],
        npcs: [
          {
            id: 'banker-whitmore',
            name: 'Cornelius Whitmore',
            title: 'Bank Manager',
            description: 'A portly man with gold spectacles who guards the town\'s wealth.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Your money is safe with us.', 'Interest rates are quite favorable.'],
            quests: [],
            isVendor: false
          }
        ],
        availableCrimes: ['Bank Heist', 'Steal from Vault'],
        shops: []
      }
    }
  );

  // === UPDATE BLACKSMITH ===
  console.log('Updating Iron Jake\'s Forge...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.IRON_JAKES_FORGE) },
    {
      $set: {
        jobs: [
          {
            id: 'bellows-work',
            name: 'Work the Bellows',
            description: 'Pump the bellows to keep the forge hot.',
            energyCost: 15,
            cooldownMinutes: 25,
            rewards: { goldMin: 12, goldMax: 20, xp: 20, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'iron-jake',
            name: 'Jacob "Iron Jake" Brennan',
            title: 'Blacksmith',
            description: 'A massive man with burn-scarred forearms. Best metalworker in the territory.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Good steel costs good money.', 'I can fix anything made of metal.'],
            quests: ['rare-ore-delivery'],
            isVendor: true,
            shopId: 'blacksmith-shop'
          }
        ],
        availableCrimes: [],
        shops: [
          {
            id: 'blacksmith-shop',
            name: 'Forge & Arms',
            description: 'Quality metalwork and weapons.',
            shopType: 'weapons',
            items: [
              { itemId: 'revolver-basic', name: 'Colt Single Action', description: 'Reliable six-shooter', price: 100 },
              { itemId: 'knife', name: 'Bowie Knife', description: 'Sharp and dependable', price: 25 },
              { itemId: 'horseshoes', name: 'Horseshoes (set)', description: 'For your mount', price: 15 },
              { itemId: 'rifle-basic', name: 'Winchester Rifle', description: 'Lever-action repeater', price: 200, requiredLevel: 10 }
            ],
            buyMultiplier: 0.4
          }
        ]
      }
    }
  );

  // === UPDATE ASSAY OFFICE ===
  console.log('Updating Gulch Assay Office...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.ASSAY_OFFICE) },
    {
      $set: {
        jobs: [
          {
            id: 'assay-clerk',
            name: 'Assay Clerk',
            description: 'Help process ore samples and file paperwork.',
            energyCost: 10,
            cooldownMinutes: 20,
            rewards: { goldMin: 12, goldMax: 22, xp: 18, items: [] },
            requirements: { minLevel: 2 }
          }
        ],
        npcs: [
          {
            id: 'assayer-morrison',
            name: 'Franklin Morrison',
            title: 'Assayer',
            description: 'The official who tests ore samples and certifies their value.',
            dialogue: ['Bring me your samples.', 'I can tell real gold from fools gold.'],
            quests: [],
            isVendor: false
          }
        ],
        availableCrimes: ['Bribe Assayer', 'Swap Samples'],
        shops: []
      }
    }
  );

  // === UPDATE DOCTOR'S OFFICE ===
  console.log('Updating Doc Morrison\'s...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.DOCTORS_OFFICE) },
    {
      $set: {
        jobs: [],
        npcs: [
          {
            id: 'doc-morrison',
            name: 'Dr. Silas Morrison',
            title: 'Town Doctor',
            description: 'A grizzled frontier doctor who has seen it all.',
            dialogue: ['Let me take a look at that.', 'Medicine ain\'t cheap out here.'],
            quests: ['rare-herb-collection'],
            isVendor: true,
            shopId: 'medical-supplies'
          }
        ],
        availableCrimes: [],
        shops: [
          {
            id: 'medical-supplies',
            name: 'Medical Supplies',
            description: 'Healing remedies and medicines.',
            shopType: 'medicine',
            items: [
              { itemId: 'health-tonic', name: 'Health Tonic', description: 'Restores health', price: 25 },
              { itemId: 'bandages-medical', name: 'Medical Bandages', description: 'Professional grade', price: 10 },
              { itemId: 'laudanum', name: 'Laudanum', description: 'Pain relief', price: 30 },
              { itemId: 'antidote', name: 'Snake Antidote', description: 'Cures poison', price: 40 }
            ],
            buyMultiplier: 0.4
          }
        ]
      }
    }
  );

  // === UPDATE HOTEL ===
  console.log('Updating Dusty Trails Hotel...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.DUSTY_TRAILS_HOTEL) },
    {
      $set: {
        jobs: [
          {
            id: 'hotel-staff',
            name: 'Hotel Staff',
            description: 'Clean rooms, carry luggage, attend to guests.',
            energyCost: 12,
            cooldownMinutes: 20,
            rewards: { goldMin: 10, goldMax: 18, xp: 18, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'hotel-manager',
            name: 'William Hayes',
            title: 'Hotel Manager',
            description: 'A fastidious man who runs a tight ship at the Dusty Trails.',
            dialogue: ['Welcome to the Dusty Trails.', 'Discretion is our specialty.'],
            quests: ['missing-guest'],
            isVendor: false
          }
        ],
        availableCrimes: ['Burglarize Room', 'Pick Lock'],
        shops: [
          {
            id: 'hotel-services',
            name: 'Hotel Services',
            description: 'Rest and recuperation.',
            shopType: 'service',
            items: [
              { itemId: 'room-night', name: 'Room (1 night)', description: 'Restores energy', price: 10 },
              { itemId: 'hot-bath', name: 'Hot Bath', description: 'Clean up nice', price: 5 },
              { itemId: 'fine-meal', name: 'Fine Meal', description: 'Best food in town', price: 8 }
            ],
            buyMultiplier: 0
          }
        ]
      }
    }
  );

  // === UPDATE GOVERNOR'S MANSION ===
  console.log('Updating Governor\'s Mansion...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.GOVERNORS_MANSION) },
    {
      $set: {
        jobs: [],
        npcs: [
          {
            id: 'governor',
            name: 'Governor Harlan Ashford',
            title: 'Territorial Governor',
            description: 'The ruthless political boss of Red Gulch, in the pocket of the mining companies.',
            faction: 'SETTLER_ALLIANCE',
            dialogue: ['Red Gulch is MY town.', 'Progress demands sacrifice.'],
            quests: ['political-favor'],
            isVendor: false
          }
        ],
        availableCrimes: ['Blackmail Governor', 'Steal Documents'],
        shops: []
      }
    }
  );

  // === UPDATE MINING COMPANY HQ ===
  console.log('Updating Ashford Mining Company HQ...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.MINING_COMPANY_HQ) },
    {
      $set: {
        jobs: [
          {
            id: 'mine-work',
            name: 'Mining Shift',
            description: 'Hard labor in the mines for the Ashford company.',
            energyCost: 20,
            cooldownMinutes: 45,
            rewards: { goldMin: 20, goldMax: 40, xp: 35, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'foreman-burke',
            name: 'Foreman Burke',
            title: 'Mine Foreman',
            description: 'A brutal taskmaster who works miners to the bone.',
            dialogue: ['Get back to work!', 'Slackers don\'t get paid.'],
            quests: [],
            isVendor: false
          }
        ],
        availableCrimes: ['Steal Ore', 'Sabotage Equipment'],
        shops: []
      }
    }
  );

  // === UPDATE GILDED PEACOCK ===
  console.log('Updating The Gilded Peacock...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.GILDED_PEACOCK) },
    {
      $set: {
        jobs: [
          {
            id: 'entertainment',
            name: 'Entertainment Work',
            description: 'Provide entertainment for wealthy patrons.',
            energyCost: 15,
            cooldownMinutes: 30,
            rewards: { goldMin: 20, goldMax: 35, xp: 25, items: [] },
            requirements: { minLevel: 3 }
          }
        ],
        npcs: [
          {
            id: 'madame-velvet',
            name: 'Madame Velvet',
            title: 'Proprietress',
            description: 'The elegant and dangerous owner of the Gilded Peacock. She has connections everywhere.',
            dialogue: ['Welcome to paradise, darling.', 'Information is more valuable than gold.'],
            quests: ['secrets-for-sale'],
            isVendor: false
          }
        ],
        availableCrimes: ['Blackmail Patron', 'Rob Wealthy Guest'],
        shops: [
          {
            id: 'peacock-services',
            name: 'Premium Services',
            description: 'Entertainment for those who can afford it.',
            shopType: 'service',
            items: [
              { itemId: 'champagne', name: 'Champagne', description: 'Imported bubbly', price: 25 },
              { itemId: 'private-room', name: 'Private Room', description: 'Discretion assured', price: 50 },
              { itemId: 'vip-treatment', name: 'VIP Treatment', description: 'The full experience', price: 100 }
            ],
            buyMultiplier: 0
          }
        ]
      }
    }
  );

  // === UPDATE LABOR EXCHANGE ===
  console.log('Updating The Labor Exchange...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.LABOR_EXCHANGE) },
    {
      $set: {
        jobs: [
          {
            id: 'day-labor',
            name: 'Day Labor',
            description: 'Pick up odd jobs from the board.',
            energyCost: 15,
            cooldownMinutes: 25,
            rewards: { goldMin: 10, goldMax: 20, xp: 20, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'labor-boss',
            name: 'Big Mike Sullivan',
            title: 'Labor Boss',
            description: 'Controls who works and who starves in Red Gulch.',
            dialogue: ['Looking for work?', 'Strong back? I got jobs.'],
            quests: ['strike-breaker'],
            isVendor: false
          }
        ],
        availableCrimes: ['Extort Workers'],
        shops: []
      }
    }
  );

  // === UPDATE SLOP HOUSE ===
  console.log('Updating The Slop House...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.SLOP_HOUSE) },
    {
      $set: {
        jobs: [
          {
            id: 'kitchen-work',
            name: 'Kitchen Work',
            description: 'Cook and serve food for hungry miners.',
            energyCost: 10,
            cooldownMinutes: 20,
            rewards: { goldMin: 5, goldMax: 12, xp: 12, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'slop-cook',
            name: 'One-Eyed Maggie',
            title: 'Cook',
            description: 'Serves up the cheapest meals in town. Don\'t ask what\'s in the stew.',
            dialogue: ['Eat up or shut up.', 'You get what you pay for.'],
            quests: [],
            isVendor: true,
            shopId: 'slop-menu'
          }
        ],
        availableCrimes: ['Steal Food', 'Pickpocket Miners'],
        shops: [
          {
            id: 'slop-menu',
            name: 'Cheap Eats',
            description: 'Food for those on a budget.',
            shopType: 'general',
            items: [
              { itemId: 'stew', name: 'Mystery Stew', description: 'Fills your belly', price: 1 },
              { itemId: 'hardtack', name: 'Hardtack', description: 'Lasts forever', price: 1 },
              { itemId: 'coffee', name: 'Black Coffee', description: 'Strong and bitter', price: 1 }
            ],
            buyMultiplier: 0.2
          }
        ]
      }
    }
  );

  // === UPDATE TENT CITY ===
  console.log('Updating Tent City...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.TENT_CITY) },
    {
      $set: {
        jobs: [],
        npcs: [
          {
            id: 'tent-elder',
            name: 'Old Jacob',
            title: 'Camp Elder',
            description: 'The unofficial leader of the desperate souls in Tent City.',
            dialogue: ['Times are hard, friend.', 'We look out for our own here.'],
            quests: ['help-the-poor'],
            isVendor: false
          }
        ],
        availableCrimes: ['Rob Desperate Folk', 'Underground Fighting'],
        shops: []
      }
    }
  );

  // === UPDATE CHEN'S APOTHECARY ===
  console.log('Updating Chen\'s Apothecary...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.CHENS_APOTHECARY) },
    {
      $set: {
        jobs: [
          {
            id: 'herb-gathering',
            name: 'Herb Gathering',
            description: 'Collect and prepare medicinal herbs.',
            energyCost: 12,
            cooldownMinutes: 25,
            rewards: { goldMin: 8, goldMax: 18, xp: 18, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'dr-chen',
            name: 'Dr. Wei Chen',
            title: 'Apothecary',
            description: 'A Chinese immigrant trained in Eastern medicine. His remedies work better than most.',
            dialogue: ['Balance in all things.', 'Western medicine forgets the spirit.'],
            quests: ['rare-herbs'],
            isVendor: true,
            shopId: 'apothecary-supplies'
          }
        ],
        availableCrimes: ['Steal Medicine', 'Buy Opium'],
        shops: [
          {
            id: 'apothecary-supplies',
            name: 'Eastern Medicine',
            description: 'Herbal remedies and traditional cures.',
            shopType: 'medicine',
            items: [
              { itemId: 'herbal-tea', name: 'Herbal Tea', description: 'Calms nerves', price: 3 },
              { itemId: 'healing-salve', name: 'Healing Salve', description: 'Speeds recovery', price: 15 },
              { itemId: 'energy-tonic', name: 'Energy Tonic', description: 'Restores vigor', price: 20 },
              { itemId: 'antidote-eastern', name: 'Eastern Antidote', description: 'Cures most poisons', price: 35 }
            ],
            buyMultiplier: 0.4
          }
        ]
      }
    }
  );

  // === UPDATE DRAGON GATE TEA HOUSE ===
  console.log('Updating Dragon Gate Tea House...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.DRAGON_GATE_TEA) },
    {
      $set: {
        jobs: [
          {
            id: 'tea-service',
            name: 'Tea Service',
            description: 'Serve tea and dim sum to patrons.',
            energyCost: 10,
            cooldownMinutes: 20,
            rewards: { goldMin: 8, goldMax: 15, xp: 15, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'tea-master',
            name: 'Master Wong',
            title: 'Tea Master',
            description: 'The wise proprietor of the Dragon Gate. He hears all the whispers of Chinatown.',
            dialogue: ['Tea reveals truth.', 'Sit. Drink. Listen.'],
            quests: ['chinatown-secrets'],
            isVendor: true,
            shopId: 'tea-menu'
          }
        ],
        availableCrimes: ['Opium Den Access', 'Smuggle Goods'],
        shops: [
          {
            id: 'tea-menu',
            name: 'Tea House',
            description: 'Fine teas and Chinese cuisine.',
            shopType: 'general',
            items: [
              { itemId: 'green-tea', name: 'Green Tea', description: 'Refreshing and calming', price: 3 },
              { itemId: 'dim-sum', name: 'Dim Sum', description: 'Assorted dumplings', price: 5 },
              { itemId: 'special-tea', name: 'Special Blend', description: 'Grants temporary bonuses', price: 20 },
              { itemId: 'fortune-cookie', name: 'Fortune Cookie', description: 'What does fate hold?', price: 1 }
            ],
            buyMultiplier: 0.3
          }
        ]
      }
    }
  );

  // === UPDATE MEI LING'S LAUNDRY ===
  console.log('Updating Mei Ling\'s Laundry...');
  await Location.updateOne(
    { _id: new mongoose.Types.ObjectId(BUILDINGS.MEI_LINGS_LAUNDRY) },
    {
      $set: {
        jobs: [
          {
            id: 'laundry-work',
            name: 'Laundry Work',
            description: 'Wash and press clothes for customers.',
            energyCost: 12,
            cooldownMinutes: 20,
            rewards: { goldMin: 6, goldMax: 14, xp: 14, items: [] },
            requirements: { minLevel: 1 }
          }
        ],
        npcs: [
          {
            id: 'mei-ling',
            name: 'Mei Ling',
            title: 'Laundry Owner',
            description: 'A quiet woman who runs the laundry. She sees the stains on everyone\'s secrets.',
            dialogue: ['Clean clothes, clean conscience.', 'Blood stains extra.'],
            quests: ['lost-item'],
            isVendor: false
          }
        ],
        availableCrimes: ['Search Pockets', 'Fence Stolen Goods'],
        shops: []
      }
    }
  );

  // Verify updates
  console.log('\n=== Verification ===');
  const redGulch = await Location.findById(RED_GULCH_ID).lean();
  console.log('Red Gulch parent:');
  console.log('  Jobs:', redGulch?.jobs?.length || 0);
  console.log('  Shops:', redGulch?.shops?.length || 0);
  console.log('  NPCs:', redGulch?.npcs?.length || 0);
  console.log('  Crimes:', redGulch?.availableCrimes?.length || 0);

  const buildings = await Location.find({ parentId: new mongoose.Types.ObjectId(RED_GULCH_ID) }).lean();
  console.log('\nBuildings with content:');
  let totalJobs = 0, totalShops = 0, totalNPCs = 0;
  buildings.forEach(b => {
    const jobs = b.jobs?.length || 0;
    const shops = b.shops?.length || 0;
    const npcs = b.npcs?.length || 0;
    totalJobs += jobs;
    totalShops += shops;
    totalNPCs += npcs;
    if (jobs || shops || npcs) {
      console.log(`  ${b.name}: ${jobs} jobs, ${shops} shops, ${npcs} NPCs`);
    }
  });
  console.log(`\nTotals: ${totalJobs} jobs, ${totalShops} shops, ${totalNPCs} NPCs`);

  await mongoose.disconnect();
  console.log('\nDone!');
}

update().catch(console.error);
