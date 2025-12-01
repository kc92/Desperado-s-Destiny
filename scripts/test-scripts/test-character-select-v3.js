/**
 * Test Character Selection with Manual Cookie Handling
 * Tests the exact character selection flow to identify any errors
 */

const API_URL = 'http://localhost:5000/api';

// Helper to extract cookie value from Set-Cookie header
function extractCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

async function testCharacterSelection() {
  console.log('=== TESTING CHARACTER SELECTION ===\n');

  try {
    // Step 1: Login
    console.log('Step 1: Logging in as test@test.com...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Test123!'
      })
    });

    // Extract cookie from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const token = extractCookie(setCookieHeader);
    console.log('Extracted token:', token ? token.substring(0, 50) + '...' : 'NONE');

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.error);
    }

    if (!token) {
      throw new Error('No token cookie received from login!');
    }

    console.log('✓ Login successful\n');

    // Step 2: Get characters
    console.log('Step 2: Fetching characters...');
    const charactersResponse = await fetch(`${API_URL}/characters`, {
      headers: {
        'Cookie': `token=${token}`
      }
    });

    const charactersData = await charactersResponse.json();

    if (!charactersData.success) {
      console.log('Characters response:', JSON.stringify(charactersData, null, 2));
      throw new Error('Failed to fetch characters: ' + charactersData.error);
    }

    const characters = charactersData.data.characters;
    console.log(`✓ Found ${characters.length} character(s)`);

    if (characters.length > 0) {
      console.log(`   - ${characters[0].name} (${characters[0].faction})\n`);
    }

    if (characters.length === 0) {
      console.log('\nNo characters found. Creating a new character...');

      // Create a character
      const createResponse = await fetch(`${API_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          name: 'TestChar' + Date.now(),
          faction: 'frontera',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 0,
            hairStyle: 0,
            hairColor: 0
          }
        })
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        console.log('Create response:', JSON.stringify(createData, null, 2));
        throw new Error('Failed to create character: ' + createData.error);
      }

      characters.push(createData.data.character);
      console.log('✓ Character created\n');
    }

    // Step 3: Select a character
    const characterId = characters[0]._id;
    console.log(`Step 3: Selecting character...`);
    console.log(`   ID: ${characterId}`);
    console.log(`   Name: ${characters[0].name}\n`);

    const selectResponse = await fetch(`${API_URL}/characters/${characterId}/select`, {
      method: 'PATCH',
      headers: {
        'Cookie': `token=${token}`
      }
    });

    console.log('Response status:', selectResponse.status, selectResponse.statusText);

    const selectResponseText = await selectResponse.text();

    if (!selectResponseText) {
      throw new Error('Empty response from select endpoint!');
    }

    let selectData;
    try {
      selectData = JSON.parse(selectResponseText);
    } catch (err) {
      console.error('Failed to parse response as JSON:', selectResponseText);
      throw new Error('Invalid JSON response: ' + err.message);
    }

    console.log('\n--- Select Response ---');
    console.log(JSON.stringify(selectData, null, 2));
    console.log('---\n');

    if (!selectData.success) {
      throw new Error('Failed to select character: ' + selectData.error);
    }

    console.log('✓ Character selected successfully!\n');

    // Verify character data is complete
    const selectedChar = selectData.data.character;
    console.log('=== SELECTED CHARACTER DATA ===');
    console.log('ID:', selectedChar._id);
    console.log('Name:', selectedChar.name);
    console.log('Faction:', selectedChar.faction);
    console.log('Level:', selectedChar.level);
    console.log('Energy:', selectedChar.energy, '/', selectedChar.maxEnergy);
    console.log('Gold:', selectedChar.gold);
    console.log('Location:', selectedChar.currentLocation);
    console.log('Stats:', JSON.stringify(selectedChar.stats));
    console.log('Skills:', selectedChar.skills ? selectedChar.skills.length + ' skills' : 'MISSING');
    console.log('Combat Stats:', JSON.stringify(selectedChar.combatStats));
    console.log('Is Jailed:', selectedChar.isJailed);
    console.log('Wanted Level:', selectedChar.wantedLevel);
    console.log('Bounty:', selectedChar.bountyAmount);

    // Check for missing required fields
    const missingFields = [];
    const fields = {
      '_id': selectedChar._id,
      'name': selectedChar.name,
      'faction': selectedChar.faction,
      'level': selectedChar.level,
      'energy': selectedChar.energy,
      'maxEnergy': selectedChar.maxEnergy,
      'gold': selectedChar.gold,
      'currentLocation': selectedChar.currentLocation,
      'stats': selectedChar.stats,
      'skills': selectedChar.skills,
      'combatStats': selectedChar.combatStats,
      'isJailed': selectedChar.isJailed,
      'wantedLevel': selectedChar.wantedLevel,
      'bountyAmount': selectedChar.bountyAmount
    };

    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined || value === null) {
        missingFields.push(field);
      }
    }

    console.log('\n=== VALIDATION RESULTS ===');
    if (missingFields.length > 0) {
      console.log('❌ MISSING FIELDS:', missingFields.join(', '));
      throw new Error('Character data is incomplete: missing ' + missingFields.join(', '));
    } else {
      console.log('✓ All required fields present!');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('✓✓✓ Character selection is working correctly! ✓✓✓');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCharacterSelection();
