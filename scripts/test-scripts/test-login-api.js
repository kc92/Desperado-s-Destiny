const axios = require('axios');

async function testLoginAPI() {
  console.log('🔍 TESTING LOGIN API DIRECTLY\n');

  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'Test123!'
    }, {
      withCredentials: true,
      validateStatus: () => true // Accept any status
    });

    console.log('📊 RESPONSE DETAILS:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', response.headers);
    console.log('   Has Set-Cookie:', !!response.headers['set-cookie']);
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Data:', response.data);

    if (response.data) {
      console.log('\n📦 RESPONSE STRUCTURE:');
      console.log('   Type:', typeof response.data);
      console.log('   Keys:', Object.keys(response.data));
      console.log('   Full data:', JSON.stringify(response.data, null, 2));
    }

    if (response.status === 204) {
      console.log('\n⚠️  WARNING: API returned 204 No Content');
      console.log('   This means no response body, which breaks the frontend!');
    } else if (response.status === 200) {
      console.log('\n✅ API returned 200 with data');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }
}

testLoginAPI();