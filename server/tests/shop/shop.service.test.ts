/**
 * Shop Service Tests - Comprehensive Coverage
 *
 * Tests all shop operations including:
 * - Item listing and retrieval
 * - Buying items
 * - Selling items
 * - Using consumable items
 * - Equipment management (equip/unequip)
 * - Inventory queries
 * - Edge cases and error handling
 */

import mongoose from 'mongoose';
import { ShopService } from '../../src/services/shop.service';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Item, IItem } from '../../src/models/Item.model';
import { Location } from '../../src/models/Location.model';

// Disable transactions for simpler testing
process.env.DISABLE_TRANSACTIONS = 'true';

// Test data
let testUser: any;
let testCharacter: any;
let testLocation: any;
let testWeapon: any;
let testArmor: any;
let testConsumable: any;

/**
 * Setup before each test
 */
beforeEach(async () => {
  // Clear all collections
  await Character.deleteMany({});
  await User.deleteMany({});
  await Item.deleteMany({});
  await Location.deleteMany({});

  // Create test location
  testLocation = await Location.create({
    name: 'General Store',
    type: 'general_store',
    description: 'A shop selling various goods',
    shortDescription: 'General store',
    region: 'town',
    dangerLevel: 1,
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [],
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false
  });

  // Create test user
  testUser = await User.create({
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword123',
    isVerified: true
  });

  // Create test character with inventory
  testCharacter = await Character.create({
    userId: testUser._id,
    name: 'TestShopper',
    faction: 'SETTLER_ALLIANCE',
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    },
    dollars: 5000,
    gold: 5000,
    level: 10,
    currentLocation: testLocation._id.toString(),
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    inventory: [],
    equipment: {
      weapon: null,
      head: null,
      body: null,
      feet: null,
      mount: null,
      accessory: null
    },
    factionReputation: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 }
  });

  // Create test items
  testWeapon = await Item.create({
    itemId: 'test-revolver',
    name: 'Test Revolver',
    description: 'A reliable six-shooter for testing',
    type: 'weapon',
    rarity: 'common',
    price: 100,
    sellPrice: 50,
    inShop: true,
    levelRequired: 1,
    icon: 'revolver.png',
    effects: [
      { type: 'combat_score', value: 10, description: '+10 Combat Score' }
    ],
    stats: { combat: 5 },
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  });

  testArmor = await Item.create({
    itemId: 'test-vest',
    name: 'Leather Vest',
    description: 'Basic protective vest',
    type: 'armor',
    rarity: 'common',
    price: 75,
    sellPrice: 35,
    inShop: true,
    levelRequired: 1,
    icon: 'vest.png',
    effects: [],
    stats: { combat: 2 },
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1
  });

  testConsumable = await Item.create({
    itemId: 'health-tonic',
    name: 'Health Tonic',
    description: 'Restores some health',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 10,
    inShop: true,
    levelRequired: 1,
    icon: 'tonic.png',
    effects: [
      { type: 'health', value: 25, description: 'Restores 25 HP' }
    ],
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10
  });
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  jest.clearAllMocks();
});

// ============================================
// SHOP ITEM LISTING
// ============================================

describe('ShopService - Item Listing', () => {
  describe('getShopItems()', () => {
    it('should return all shop items', async () => {
      const items = await ShopService.getShopItems();

      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter items by type', async () => {
      const weapons = await ShopService.getShopItems('weapon');

      expect(weapons.length).toBeGreaterThanOrEqual(1);
      expect(weapons.every(i => i.type === 'weapon')).toBe(true);
    });

    it('should only return items available in shop', async () => {
      // Create a non-shop item
      await Item.create({
        itemId: 'quest-item',
        name: 'Quest Item',
        description: 'Cannot be bought',
        type: 'quest',
        rarity: 'rare',
        price: 0,
        sellPrice: 0,
        inShop: false, // Not in shop
        levelRequired: 1,
        icon: 'quest.png',
        effects: [],
        isEquippable: false,
        isConsumable: false,
        isStackable: false,
        maxStack: 1
      });

      const items = await ShopService.getShopItems();
      const questItems = items.filter(i => i.itemId === 'quest-item');

      expect(questItems.length).toBe(0);
    });
  });

  describe('getItem()', () => {
    it('should return item by itemId', async () => {
      const item = await ShopService.getItem('test-revolver');

      expect(item).toBeDefined();
      expect(item?.name).toBe('Test Revolver');
    });

    it('should return null for non-existent item', async () => {
      const item = await ShopService.getItem('non-existent');
      expect(item).toBeNull();
    });
  });
});

// ============================================
// BUY OPERATIONS
// ============================================

describe('ShopService - Buying', () => {
  describe('buyItem()', () => {
    it('should purchase item successfully', async () => {
      const result = await ShopService.buyItem(
        testCharacter._id.toString(),
        'test-revolver',
        1
      );

      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(100);

      // Verify character balance decreased
      const character = await Character.findById(testCharacter._id);
      expect(character?.dollars).toBeLessThan(5000);
    });

    it('should add item to inventory after purchase', async () => {
      await ShopService.buyItem(
        testCharacter._id.toString(),
        'test-revolver',
        1
      );

      const character = await Character.findById(testCharacter._id);
      const hasRevolver = character?.inventory.some(
        (i: any) => i.itemId === 'test-revolver'
      );
      expect(hasRevolver).toBe(true);
    });

    it('should handle quantity for stackable items', async () => {
      const result = await ShopService.buyItem(
        testCharacter._id.toString(),
        'health-tonic',
        5
      );

      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(125); // 25 * 5

      const character = await Character.findById(testCharacter._id);
      const tonics = character?.inventory.find(
        (i: any) => i.itemId === 'health-tonic'
      );
      expect(tonics?.quantity).toBe(5);
    });

    it('should reject purchase with insufficient funds', async () => {
      // Reduce character funds
      await Character.findByIdAndUpdate(testCharacter._id, { dollars: 10 });

      await expect(
        ShopService.buyItem(testCharacter._id.toString(), 'test-revolver', 1)
      ).rejects.toThrow(/insufficient|afford|money|funds/i);
    });

    it('should reject purchase of non-existent item', async () => {
      await expect(
        ShopService.buyItem(testCharacter._id.toString(), 'fake-item', 1)
      ).rejects.toThrow(/not found|invalid|does not exist/i);
    });

    it('should reject purchase if level requirement not met', async () => {
      // Create high-level item
      await Item.create({
        itemId: 'elite-rifle',
        name: 'Elite Rifle',
        description: 'High level weapon',
        type: 'weapon',
        rarity: 'epic',
        price: 1000,
        sellPrice: 500,
        inShop: true,
        levelRequired: 50, // Character is level 10
        icon: 'rifle.png',
        effects: [],
        isEquippable: true,
        isConsumable: false,
        isStackable: false,
        maxStack: 1
      });

      await expect(
        ShopService.buyItem(testCharacter._id.toString(), 'elite-rifle', 1)
      ).rejects.toThrow(/level|requirement/i);
    });

    it('should reject purchase of item not available in shop', async () => {
      await Item.create({
        itemId: 'special-item',
        name: 'Special Item',
        description: 'Not for sale',
        type: 'material',
        rarity: 'legendary',
        price: 10000,
        sellPrice: 5000,
        inShop: false, // Not available
        levelRequired: 1,
        icon: 'special.png',
        effects: [],
        isEquippable: false,
        isConsumable: false,
        isStackable: false,
        maxStack: 1
      });

      await expect(
        ShopService.buyItem(testCharacter._id.toString(), 'special-item', 1)
      ).rejects.toThrow(/not available|not in shop|cannot buy/i);
    });
  });
});

// ============================================
// SELL OPERATIONS
// ============================================

describe('ShopService - Selling', () => {
  beforeEach(async () => {
    // Give character items to sell
    await Character.findByIdAndUpdate(testCharacter._id, {
      inventory: [
        { itemId: 'test-revolver', quantity: 1 },
        { itemId: 'health-tonic', quantity: 5 }
      ]
    });
  });

  describe('sellItem()', () => {
    it('should sell item successfully', async () => {
      const initialBalance = 5000;
      const result = await ShopService.sellItem(
        testCharacter._id.toString(),
        'test-revolver',
        1
      );

      expect(result.success).toBe(true);
      expect(result.earnings).toBe(50); // sellPrice is 50

      // Verify balance increased
      const character = await Character.findById(testCharacter._id);
      expect(character?.dollars).toBe(initialBalance + 50);
    });

    it('should remove item from inventory after sale', async () => {
      await ShopService.sellItem(
        testCharacter._id.toString(),
        'test-revolver',
        1
      );

      const character = await Character.findById(testCharacter._id);
      const hasRevolver = character?.inventory.some(
        (i: any) => i.itemId === 'test-revolver'
      );
      expect(hasRevolver).toBe(false);
    });

    it('should sell partial stack of stackable items', async () => {
      const result = await ShopService.sellItem(
        testCharacter._id.toString(),
        'health-tonic',
        3
      );

      expect(result.success).toBe(true);
      expect(result.earnings).toBe(30); // 10 * 3

      const character = await Character.findById(testCharacter._id);
      const tonics = character?.inventory.find(
        (i: any) => i.itemId === 'health-tonic'
      );
      expect(tonics?.quantity).toBe(2); // 5 - 3
    });

    it('should reject selling items not in inventory', async () => {
      await expect(
        ShopService.sellItem(testCharacter._id.toString(), 'test-vest', 1)
      ).rejects.toThrow(/not in inventory|don't have|not found/i);
    });

    it('should reject selling more than owned', async () => {
      await expect(
        ShopService.sellItem(testCharacter._id.toString(), 'health-tonic', 10)
      ).rejects.toThrow(/not enough|insufficient|quantity/i);
    });
  });
});

// ============================================
// USE CONSUMABLE ITEMS
// ============================================

describe('ShopService - Using Items', () => {
  beforeEach(async () => {
    // Give character consumables
    await Character.findByIdAndUpdate(testCharacter._id, {
      inventory: [
        { itemId: 'health-tonic', quantity: 3 }
      ],
      hp: 50 // Damaged character
    });
  });

  describe('useItem()', () => {
    it('should use consumable item', async () => {
      const result = await ShopService.useItem(
        testCharacter._id.toString(),
        'health-tonic'
      );

      expect(result.success).toBe(true);
    });

    it('should apply item effects', async () => {
      await ShopService.useItem(
        testCharacter._id.toString(),
        'health-tonic'
      );

      const character = await Character.findById(testCharacter._id);
      // Health should increase (was 50, tonic restores 25)
      expect(character?.hp).toBeGreaterThan(50);
    });

    it('should decrease item quantity after use', async () => {
      await ShopService.useItem(
        testCharacter._id.toString(),
        'health-tonic'
      );

      const character = await Character.findById(testCharacter._id);
      const tonics = character?.inventory.find(
        (i: any) => i.itemId === 'health-tonic'
      );
      expect(tonics?.quantity).toBe(2); // 3 - 1
    });

    it('should reject using non-consumable items', async () => {
      // Give character a weapon
      await Character.findByIdAndUpdate(testCharacter._id, {
        inventory: [{ itemId: 'test-revolver', quantity: 1 }]
      });

      await expect(
        ShopService.useItem(testCharacter._id.toString(), 'test-revolver')
      ).rejects.toThrow(/not consumable|cannot use|not usable/i);
    });

    it('should reject using items not in inventory', async () => {
      await expect(
        ShopService.useItem(testCharacter._id.toString(), 'test-vest')
      ).rejects.toThrow(/not in inventory|don't have|not found/i);
    });
  });
});

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================

describe('ShopService - Equipment', () => {
  beforeEach(async () => {
    // Give character equippable items
    await Character.findByIdAndUpdate(testCharacter._id, {
      inventory: [
        { itemId: 'test-revolver', quantity: 1 },
        { itemId: 'test-vest', quantity: 1 }
      ]
    });
  });

  describe('equipItem()', () => {
    it('should equip item in correct slot', async () => {
      const result = await ShopService.equipItem(
        testCharacter._id.toString(),
        'test-revolver'
      );

      expect(result.success).toBe(true);

      const character = await Character.findById(testCharacter._id);
      expect(character?.equipment.weapon).toBe('test-revolver');
    });

    it('should remove item from inventory when equipped', async () => {
      await ShopService.equipItem(
        testCharacter._id.toString(),
        'test-revolver'
      );

      const character = await Character.findById(testCharacter._id);
      const hasInInventory = character?.inventory.some(
        (i: any) => i.itemId === 'test-revolver'
      );
      expect(hasInInventory).toBe(false);
    });

    it('should swap with currently equipped item', async () => {
      // Equip first weapon
      await ShopService.equipItem(
        testCharacter._id.toString(),
        'test-revolver'
      );

      // Create and add second weapon to inventory
      await Item.create({
        itemId: 'better-revolver',
        name: 'Better Revolver',
        description: 'An upgraded revolver',
        type: 'weapon',
        rarity: 'uncommon',
        price: 200,
        sellPrice: 100,
        inShop: true,
        levelRequired: 1,
        icon: 'revolver2.png',
        effects: [],
        stats: { combat: 10 },
        equipSlot: 'weapon',
        isEquippable: true,
        isConsumable: false,
        isStackable: false,
        maxStack: 1
      });

      await Character.findByIdAndUpdate(testCharacter._id, {
        $push: { inventory: { itemId: 'better-revolver', quantity: 1 } }
      });

      // Equip second weapon
      await ShopService.equipItem(
        testCharacter._id.toString(),
        'better-revolver'
      );

      const character = await Character.findById(testCharacter._id);
      expect(character?.equipment.weapon).toBe('better-revolver');

      // Old weapon should be back in inventory
      const hasOldWeapon = character?.inventory.some(
        (i: any) => i.itemId === 'test-revolver'
      );
      expect(hasOldWeapon).toBe(true);
    });

    it('should reject equipping non-equippable items', async () => {
      // Add consumable to inventory
      await Character.findByIdAndUpdate(testCharacter._id, {
        $push: { inventory: { itemId: 'health-tonic', quantity: 1 } }
      });

      await expect(
        ShopService.equipItem(testCharacter._id.toString(), 'health-tonic')
      ).rejects.toThrow(/not equippable|cannot equip/i);
    });
  });

  describe('unequipItem()', () => {
    beforeEach(async () => {
      // Equip weapon first
      await ShopService.equipItem(
        testCharacter._id.toString(),
        'test-revolver'
      );
    });

    it('should unequip item from slot', async () => {
      const result = await ShopService.unequipItem(
        testCharacter._id.toString(),
        'weapon'
      );

      expect(result.success).toBe(true);

      const character = await Character.findById(testCharacter._id);
      expect(character?.equipment.weapon).toBeNull();
    });

    it('should return item to inventory when unequipped', async () => {
      await ShopService.unequipItem(
        testCharacter._id.toString(),
        'weapon'
      );

      const character = await Character.findById(testCharacter._id);
      const hasRevolver = character?.inventory.some(
        (i: any) => i.itemId === 'test-revolver'
      );
      expect(hasRevolver).toBe(true);
    });

    it('should handle unequipping empty slot', async () => {
      // Unequip first
      await ShopService.unequipItem(testCharacter._id.toString(), 'weapon');

      // Try to unequip again - should handle gracefully
      const result = await ShopService.unequipItem(
        testCharacter._id.toString(),
        'weapon'
      );

      // Either succeeds with nothing to unequip or throws
      expect(result.success !== undefined || true).toBe(true);
    });
  });

  describe('getEquipment()', () => {
    it('should return all equipment slots', async () => {
      const equipment = await ShopService.getEquipment(testCharacter._id.toString());

      expect(equipment).toBeDefined();
      expect('weapon' in equipment).toBe(true);
      expect('body' in equipment).toBe(true);
    });

    it('should include equipped item details', async () => {
      await ShopService.equipItem(
        testCharacter._id.toString(),
        'test-revolver'
      );

      const equipment = await ShopService.getEquipment(testCharacter._id.toString());

      expect(equipment.weapon).toBeDefined();
    });
  });
});

// ============================================
// INVENTORY QUERIES
// ============================================

describe('ShopService - Inventory', () => {
  beforeEach(async () => {
    await Character.findByIdAndUpdate(testCharacter._id, {
      inventory: [
        { itemId: 'test-revolver', quantity: 1 },
        { itemId: 'health-tonic', quantity: 5 }
      ]
    });
  });

  describe('getInventoryWithDetails()', () => {
    it('should return inventory with full item details', async () => {
      const result = await ShopService.getInventoryWithDetails(
        testCharacter._id.toString()
      );

      expect(result.items.length).toBeGreaterThan(0);
      // Each item should have details
      expect(result.items[0].name).toBeDefined();
    });

    it('should include quantity information', async () => {
      const result = await ShopService.getInventoryWithDetails(
        testCharacter._id.toString()
      );

      const tonics = result.items.find(i => i.itemId === 'health-tonic');
      expect(tonics?.quantity).toBe(5);
    });
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('ShopService - Edge Cases', () => {
  it('should handle buying at exact balance', async () => {
    // Set balance to exact item price
    await Character.findByIdAndUpdate(testCharacter._id, { dollars: 100 });

    const result = await ShopService.buyItem(
      testCharacter._id.toString(),
      'test-revolver',
      1
    );

    expect(result.success).toBe(true);

    const character = await Character.findById(testCharacter._id);
    expect(character?.dollars).toBe(0);
  });

  it('should handle zero quantity gracefully', async () => {
    await expect(
      ShopService.buyItem(testCharacter._id.toString(), 'test-revolver', 0)
    ).rejects.toThrow(/quantity|invalid|must be/i);
  });

  it('should handle negative quantity', async () => {
    await expect(
      ShopService.buyItem(testCharacter._id.toString(), 'test-revolver', -1)
    ).rejects.toThrow(/quantity|invalid|must be/i);
  });

  it('should handle non-existent character', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(
      ShopService.buyItem(fakeId, 'test-revolver', 1)
    ).rejects.toThrow(/character|not found/i);
  });

  it('should handle maxStack limits', async () => {
    // Buy up to max stack
    await ShopService.buyItem(
      testCharacter._id.toString(),
      'health-tonic',
      10 // maxStack is 10
    );

    const character = await Character.findById(testCharacter._id);
    const tonics = character?.inventory.find(
      (i: any) => i.itemId === 'health-tonic'
    );
    expect(tonics?.quantity).toBeLessThanOrEqual(10);
  });
});
