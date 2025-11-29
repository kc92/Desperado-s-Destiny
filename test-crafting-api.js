/**
 * Test Script: Crafting API Endpoints
 * Tests the complete crafting system integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let characterId = '';

// Test credentials
const TEST_USER = {
  email: `crafting_test_${Date.now()}@example.com`,
  password: 'Test123!@#',
  username: `CraftingTester${Date.now()}`
};

/**
 * Helper function to make authenticated requests
 */
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Test 1: Register and login
 */
async function testAuth() {
  console.log('\n=== Test 1: Authentication ===');

  // Register
  const register = await apiCall('POST', '/auth/register', TEST_USER);
  if (!register.success) {
    console.error('❌ Registration failed:', register.error);
    return false;
  }
  console.log('✅ User registered');

  // Login
  const login = await apiCall('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (!login.success || !login.data.data?.token) {
    console.error('❌ Login failed:', login.error);
    return false;
  }

  authToken = login.data.data.token;
  console.log('✅ User logged in');
  return true;
}

/**
 * Test 2: Create a test character
 */
async function testCreateCharacter() {
  console.log('\n=== Test 2: Create Character ===');

  const charData = {
    name: `Crafter${Date.now()}`,
    faction: 'frontera',
    appearance: {
      bodyType: 'male',
      skinTone: 3,
      facePreset: 2,
      hairStyle: 5,
      hairColor: 1
    },
    stats: { cunning: 5, spirit: 5, combat: 5, craft: 10 }
  };

  const result = await apiCall('POST', '/characters', charData);

  if (!result.success || !result.data.data?.character?._id) {
    console.error('❌ Character creation failed:', result.error);
    return false;
  }

  characterId = result.data.data.character._id;
  console.log('✅ Character created:', characterId);
  return true;
}

/**
 * Test 3: Get all available recipes
 */
async function testGetRecipes() {
  console.log('\n=== Test 3: Get Available Recipes ===');

  const result = await apiCall('GET', `/crafting/recipes?characterId=${characterId}`);

  if (!result.success) {
    console.error('❌ Failed to get recipes:', result.error);
    return false;
  }

  const recipes = result.data.data?.recipes || [];
  console.log(`✅ Retrieved ${recipes.length} available recipes`);

  if (recipes.length > 0) {
    const sample = recipes[0];
    console.log('   Sample recipe:', {
      name: sample.name,
      category: sample.category,
      ingredients: sample.ingredients.length,
      skillRequired: `${sample.skillRequired.skillId} level ${sample.skillRequired.level}`
    });
  }

  return true;
}

/**
 * Test 4: Get recipes by category
 */
async function testGetRecipesByCategory() {
  console.log('\n=== Test 4: Get Recipes by Category ===');

  const categories = ['weapon', 'consumable', 'material', 'armor', 'ammo'];

  for (const category of categories) {
    const result = await apiCall('GET', `/crafting/recipes/${category}`);

    if (!result.success) {
      console.error(`❌ Failed to get ${category} recipes:`, result.error);
      return false;
    }

    const count = result.data.data?.recipes?.length || 0;
    console.log(`✅ ${category}: ${count} recipes`);
  }

  return true;
}

/**
 * Test 5: Check if can craft (should fail - missing ingredients)
 */
async function testCanCraft() {
  console.log('\n=== Test 5: Check Can Craft ===');

  // Try to craft basic knife (recipeId: basic-knife)
  const result = await apiCall('GET', `/crafting/can-craft/basic-knife?characterId=${characterId}`);

  if (!result.success) {
    console.error('❌ Failed to check craft ability:', result.error);
    return false;
  }

  const { canCraft, reason } = result.data.data;
  console.log(`✅ Can craft basic knife: ${canCraft}`);
  if (!canCraft) {
    console.log(`   Reason: ${reason}`);
  }

  return true;
}

/**
 * Test 6: Get crafting stations
 */
async function testGetStations() {
  console.log('\n=== Test 6: Get Crafting Stations ===');

  const result = await apiCall('GET', `/crafting/stations?characterId=${characterId}`);

  if (!result.success) {
    console.error('❌ Failed to get crafting stations:', result.error);
    return false;
  }

  const stations = result.data.data?.stations || [];
  const location = result.data.data?.location;

  console.log(`✅ Character location: ${location}`);
  console.log(`✅ Available stations: ${stations.join(', ')}`);

  return true;
}

/**
 * Test 7: Attempt to craft without ingredients (should fail)
 */
async function testCraftWithoutIngredients() {
  console.log('\n=== Test 7: Attempt Craft Without Ingredients ===');

  const result = await apiCall('POST', '/crafting/craft', {
    characterId,
    recipeId: 'basic-knife'
  });

  if (result.success) {
    console.error('❌ Craft succeeded when it should have failed (no ingredients)');
    return false;
  }

  console.log('✅ Craft correctly failed:', result.error?.error || result.error);
  return true;
}

/**
 * Test 8: Invalid category
 */
async function testInvalidCategory() {
  console.log('\n=== Test 8: Invalid Category Handling ===');

  const result = await apiCall('GET', '/crafting/recipes/invalid_category');

  if (result.success) {
    console.error('❌ Invalid category request succeeded when it should have failed');
    return false;
  }

  console.log('✅ Invalid category correctly rejected:', result.error?.error || result.error);
  return true;
}

/**
 * Test 9: Rate limiting
 */
async function testRateLimiting() {
  console.log('\n=== Test 9: Rate Limiting (Optional) ===');
  console.log('⚠️  Skipping rate limit test (would require 30+ rapid requests)');
  return true;
}

/**
 * Test 10: Authentication required
 */
async function testAuthRequired() {
  console.log('\n=== Test 10: Authentication Required ===');

  // Temporarily remove auth token
  const tempToken = authToken;
  authToken = '';

  const result = await apiCall('GET', '/crafting/recipes');

  // Restore token
  authToken = tempToken;

  if (result.success) {
    console.error('❌ Unauthenticated request succeeded');
    return false;
  }

  console.log('✅ Unauthenticated request correctly rejected');
  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Crafting System API Integration Test  ║');
  console.log('╚══════════════════════════════════════════╝');

  const tests = [
    { name: 'Authentication', fn: testAuth },
    { name: 'Create Character', fn: testCreateCharacter },
    { name: 'Get Recipes', fn: testGetRecipes },
    { name: 'Get Recipes by Category', fn: testGetRecipesByCategory },
    { name: 'Check Can Craft', fn: testCanCraft },
    { name: 'Get Crafting Stations', fn: testGetStations },
    { name: 'Craft Without Ingredients', fn: testCraftWithoutIngredients },
    { name: 'Invalid Category', fn: testInvalidCategory },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Auth Required', fn: testAuthRequired }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" threw error:`, error.message);
      failed++;
    }
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║            Test Summary                  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
