/**
 * Test Auth Cookie Flow
 * This script tests the complete authentication flow:
 * 1. Login
 * 2. Check if cookie is set
 * 3. Try to access protected route with cookie
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Cookie jar to store cookies
const cookieJar = [];

// Helper to extract cookies from response
function extractCookies(response) {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    setCookieHeader.forEach(cookie => {
      const cookieValue = cookie.split(';')[0];
      cookieJar.push(cookieValue);
      console.log(`  📝 Received cookie: ${cookieValue.substring(0, 50)}...`);
    });
  }
}

// Helper to add cookies to request
function getCookieHeader() {
  return cookieJar.join('; ');
}

async function testAuthFlow() {
  console.log('='.repeat(70));
  console.log('🔐 Testing Authentication Cookie Flow');
  console.log('='.repeat(70));
  console.log();

  try {
    // Step 1: Login
    console.log('Step 1: Login');
    console.log('-'.repeat(50));

    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'test@test.com',
        password: 'Test123!'
      },
      {
        withCredentials: true,
        validateStatus: () => true // Don't throw on any status
      }
    );

    console.log(`  Status: ${loginResponse.status}`);
    console.log(`  Success: ${loginResponse.data.success}`);

    if (loginResponse.data.user) {
      console.log(`  User: ${loginResponse.data.user.email}`);
    }

    // Extract cookies
    extractCookies(loginResponse);
    console.log();

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed!');
      console.error('   Error:', loginResponse.data.error);
      return;
    }

    if (cookieJar.length === 0) {
      console.error('❌ No cookies received from login!');
      console.error('   This is the problem - server should set a "token" cookie');
      return;
    }

    console.log('✅ Login successful and cookie received');
    console.log();

    // Step 2: Test protected route (skills)
    console.log('Step 2: Access Protected Route (/api/skills)');
    console.log('-'.repeat(50));

    const skillsResponse = await axios.get(
      `${API_URL}/skills`,
      {
        headers: {
          Cookie: getCookieHeader()
        },
        withCredentials: true,
        validateStatus: () => true // Don't throw on any status
      }
    );

    console.log(`  Status: ${skillsResponse.status}`);
    console.log(`  Success: ${skillsResponse.data.success}`);

    if (skillsResponse.status === 200) {
      console.log(`  Skills count: ${skillsResponse.data.data?.skills?.length || 0}`);
      console.log();
      console.log('✅ Skills endpoint accessible with cookie!');
      console.log('✅ Authentication flow is WORKING correctly');
    } else {
      console.log(`  Error: ${skillsResponse.data.error}`);
      console.log();
      console.error('❌ Skills endpoint returned error');
      console.error('   This means cookie auth is not working properly');

      // Debug info
      console.log();
      console.log('Debug Info:');
      console.log('  Cookies being sent:', getCookieHeader().substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }

  console.log();
  console.log('='.repeat(70));
}

testAuthFlow();
