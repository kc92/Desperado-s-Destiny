/**
 * Test Actions API with Cookie Authentication
 *
 * This script tests that the /api/actions endpoint works with cookies
 */

const axios = require('axios');

async function testActionsAPI() {
  console.log('Testing Actions API with Cookie Authentication\n');

  const baseURL = 'http://localhost:5000/api';
  let authCookie = '';

  try {
    // Step 1: Login to get auth cookie
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@test.com',
      password: 'Test123!'
    }, {
      withCredentials: true,
      validateStatus: () => true // Accept any status
    });

    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginResponse.data.success}`);

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log(`   ❌ Login failed: ${loginResponse.data.error}`);
      return;
    }

    // Extract cookie from response
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      authCookie = cookies[0].split(';')[0];
      console.log(`   ✅ Login successful, got cookie: ${authCookie.substring(0, 50)}...`);
    } else {
      console.log(`   ❌ No cookie received from login`);
      return;
    }

    // Step 2: Test Actions API with cookie
    console.log('\nStep 2: Testing Actions API with cookie...');
    const actionsResponse = await axios.get(`${baseURL}/actions`, {
      headers: {
        'Cookie': authCookie
      },
      withCredentials: true,
      validateStatus: () => true // Accept any status
    });

    console.log(`   Status: ${actionsResponse.status}`);
    console.log(`   Success: ${actionsResponse.data.success}`);

    if (actionsResponse.status === 401) {
      console.log(`\n   ❌ 401 UNAUTHORIZED - Auth middleware is rejecting valid cookie!`);
      console.log(`   Error: ${actionsResponse.data.error}`);
      console.log(`   This means the fix didn't work.`);
      return;
    }

    if (actionsResponse.status === 200 && actionsResponse.data.success) {
      console.log(`\n   ✅ SUCCESS! Actions API accepted cookie authentication!`);

      const actions = actionsResponse.data.data?.actions;
      if (actions) {
        if (Array.isArray(actions)) {
          console.log(`   ✅ Loaded ${actions.length} actions`);
        } else if (typeof actions === 'object') {
          const count = Object.values(actions).flat().length;
          console.log(`   ✅ Loaded ${count} actions (grouped by type)`);
        }
      }
      return true;
    }

    console.log(`\n   ⚠️  Unexpected response:`, actionsResponse.data);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error(`   Response status: ${error.response.status}`);
      console.error(`   Response data:`, error.response.data);
    }
    return false;
  }
}

testActionsAPI().then(success => {
  if (success) {
    console.log('\n✅ All tests passed! Actions API is working with cookie authentication.');
  } else {
    console.log('\n❌ Tests failed. Check the output above for details.');
  }
  process.exit(success ? 0 : 1);
});
