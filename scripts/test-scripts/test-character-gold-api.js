/**
 * Test Character API Response
 * Verifies that the character endpoint returns gold field
 */

const axios = require('axios');

async function testCharacterAPI() {
  try {
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:5000',
      withCredentials: true  // This enables sending/receiving cookies
    });

    console.log('🔐 Logging in...');
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      email: 'test@test.com',
      password: 'Test123!'
    });

    console.log('✅ Login successful');
    const cookies = loginResponse.headers['set-cookie'];
    console.log('Cookies from login:', cookies);

    // Extract the token cookie
    const tokenCookie = cookies[0].split(';')[0];  // Get just "token=..."
    console.log('Token cookie:', tokenCookie);

    console.log('\n📊 Fetching characters...');
    const charactersResponse = await axiosInstance.get('/api/characters', {
      headers: {
        Cookie: tokenCookie
      }
    });

    const characters = charactersResponse.data.data.characters;
    console.log(`\n✅ Found ${characters.length} character(s)`);

    if (characters.length > 0) {
      const character = characters[0];
      console.log('\n💰 Character Data:');
      console.log('  - ID:', character._id);
      console.log('  - Name:', character.name);
      console.log('  - Level:', character.level);
      console.log('  - Gold:', character.gold);
      console.log('  - Energy:', character.energy);
      console.log('  - Max Energy:', character.maxEnergy);
      console.log('  - Has gold field?:', character.hasOwnProperty('gold') ? 'YES ✅' : 'NO ❌');

      if (character.gold !== undefined) {
        console.log('\n✅ SUCCESS: Gold field is present in API response!');
        console.log(`   Current gold amount: $${character.gold.toLocaleString()}`);
      } else {
        console.log('\n❌ FAIL: Gold field is missing from API response!');
      }

      console.log('\n📋 Full character object keys:');
      console.log(Object.keys(character).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCharacterAPI();
