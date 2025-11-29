/**
 * Test Character Selection with Cookie-based Auth
 * Tests the exact character selection flow to identify any errors
 */

const API_URL = 'http://localhost:5000/api';

async function testCharacterSelection() {
  console.log('=== TESTING CHARACTER SELECTION ===\n');

  try {
    // Step 1: Login
    console.log('Step 1: Logging in as test@test.com...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: Include cookies
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Test123!'
      })
    });

    // Extract cookie from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);

    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.error);
    }

    console.log('✓ Login successful\n');

    // Step 2: Get characters
    console.log('Step 2: Fetching characters...');
    const charactersResponse = await fetch(`${API_URL}/characters`, {
      credentials: 'include' // Include cookies
    });

    const charactersData = await charactersResponse.json();
    console.log('Characters response:', JSON.stringify(charactersData, null, 2));

    if (!charactersData.success) {
      throw new Error('Failed to fetch characters: ' + charactersData.error);
    }

    const characters = charactersData.data.characters;
    console.log(`✓ Found ${characters.length} character(s)\n`);

    if (characters.length === 0) {
      console.log('No characters found. Creating a new character...');

      // Create a character
      const createResponse = await fetch(`${API_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          name: 'TestCharacter' + Date.now(),
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
      console.log('Create character response:', JSON.stringify(createData, null, 2));

      if (!createData.success) {
        throw new Error('Failed to create character: ' + createData.error);
      }

      characters.push(createData.data.character);
      console.log('✓ Character created\n');
    }

    // Step 3: Select a character
    const characterId = characters[0]._id;
    console.log(`Step 3: Selecting character ${characterId}...`);
    console.log(`Character name: ${characters[0].name}\n`);

    const selectResponse = await fetch(`${API_URL}/characters/${characterId}/select`, {
      method: 'PATCH',
      credentials: 'include' // Include cookies
    });

    console.log('Select response status:', selectResponse.status);
    console.log('Select response statusText:', selectResponse.statusText);
    console.log('Select response headers:', Object.fromEntries(selectResponse.headers.entries()));

    const selectResponseText = await selectResponse.text();
    console.log('Raw response:', selectResponseText);

    let selectData;
    try {
      selectData = JSON.parse(selectResponseText);
    } catch (err) {
      throw new Error('Failed to parse response as JSON: ' + selectResponseText);
    }

    console.log('Select character response:', JSON.stringify(selectData, null, 2));

    if (!selectData.success) {
      throw new Error('Failed to select character: ' + selectData.error);
    }

    console.log('✓ Character selected successfully!\n');

    // Verify character data is complete
    const selectedChar = selectData.data.character;
    console.log('\n=== SELECTED CHARACTER DATA ===');
    console.log('ID:', selectedChar._id);
    console.log('Name:', selectedChar.name);
    console.log('Faction:', selectedChar.faction);
    console.log('Level:', selectedChar.level);
    console.log('Energy:', selectedChar.energy);
    console.log('Max Energy:', selectedChar.maxEnergy);
    console.log('Gold:', selectedChar.gold);
    console.log('Location:', selectedChar.currentLocation);
    console.log('Stats:', JSON.stringify(selectedChar.stats));
    console.log('Skills:', selectedChar.skills ? selectedChar.skills.length + ' skills' : 'MISSING');
    console.log('Combat Stats:', JSON.stringify(selectedChar.combatStats));
    console.log('Is Jailed:', selectedChar.isJailed);
    console.log('Wanted Level:', selectedChar.wantedLevel);
    console.log('Bounty:', selectedChar.bountyAmount);
    console.log('Created At:', selectedChar.createdAt);
    console.log('Last Active:', selectedChar.lastActive);

    // Check for missing required fields
    const missingFields = [];
    if (!selectedChar._id) missingFields.push('_id');
    if (!selectedChar.name) missingFields.push('name');
    if (!selectedChar.faction) missingFields.push('faction');
    if (selectedChar.level === undefined) missingFields.push('level');
    if (selectedChar.energy === undefined) missingFields.push('energy');
    if (selectedChar.maxEnergy === undefined) missingFields.push('maxEnergy');
    if (selectedChar.gold === undefined) missingFields.push('gold');
    if (!selectedChar.currentLocation) missingFields.push('currentLocation');
    if (!selectedChar.stats) missingFields.push('stats');
    if (!selectedChar.skills) missingFields.push('skills');
    if (!selectedChar.combatStats) missingFields.push('combatStats');
    if (selectedChar.isJailed === undefined) missingFields.push('isJailed');
    if (selectedChar.wantedLevel === undefined) missingFields.push('wantedLevel');
    if (selectedChar.bountyAmount === undefined) missingFields.push('bountyAmount');

    if (missingFields.length > 0) {
      console.log('\n❌ MISSING FIELDS:', missingFields.join(', '));
      throw new Error('Character data is incomplete: missing ' + missingFields.join(', '));
    } else {
      console.log('\n✓ All required fields present!');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('✓ Character selection is working correctly!');

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
