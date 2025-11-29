/**
 * Location Helper
 * Utilities for testing the location-based gameplay system
 */

const { delay, waitForLoading } = require('./navigation.helper');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/**
 * Navigate to location page
 */
async function goToLocation(page) {
  await page.goto(`${BASE_URL}/game/location`);
  await waitForLoading(page);
}

/**
 * Get current character energy from the UI
 */
async function getCurrentEnergy(page) {
  try {
    const energyText = await page.$eval('[data-testid="energy-display"], .energy-display', el => el.textContent);
    const match = energyText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  } catch (e) {
    // Try alternative selectors
    const content = await page.content();
    const match = content.match(/energy[:\s]*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }
}

/**
 * Get current character gold from the UI
 */
async function getCurrentGold(page) {
  try {
    const goldText = await page.$eval('[data-testid="gold-display"], .gold-display', el => el.textContent);
    const match = goldText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  } catch (e) {
    // Try alternative selectors
    const content = await page.content();
    const match = content.match(/gold[:\s]*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }
}

/**
 * Get current location name from the header
 */
async function getCurrentLocationName(page) {
  try {
    const header = await page.$eval('h1', el => el.textContent);
    return header ? header.trim() : null;
  } catch (e) {
    return null;
  }
}

/**
 * Find and click a job's Work button by job name
 */
async function performJob(page, jobName) {
  // Find the job card containing the job name
  const jobCards = await page.$$('[class*="bg-gray-800"]');

  for (const card of jobCards) {
    const cardText = await card.evaluate(el => el.textContent);
    if (cardText.includes(jobName)) {
      // Find the Work button within this card
      const workButton = await card.$('button');
      if (workButton) {
        const buttonText = await workButton.evaluate(el => el.textContent);
        if (buttonText === 'Work' || buttonText === 'Working...') {
          await workButton.click();
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Wait for job result message to appear
 */
async function waitForJobResult(page, timeout = 5000) {
  try {
    await page.waitForFunction(
      () => {
        const content = document.body.textContent;
        return content.includes('Earned') || content.includes('completed') || content.includes('Failed');
      },
      { timeout }
    );
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get the job result message
 */
async function getJobResult(page) {
  try {
    const resultEl = await page.$('[class*="bg-green-900"], [class*="bg-red-900"]');
    if (resultEl) {
      return await resultEl.evaluate(el => el.textContent);
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Open a shop modal by shop name
 */
async function openShop(page, shopName) {
  const shopCards = await page.$$('[class*="bg-gray-800"]');

  for (const card of shopCards) {
    const cardText = await card.evaluate(el => el.textContent);
    if (cardText.includes(shopName)) {
      const browseButton = await card.$('button');
      if (browseButton) {
        await browseButton.click();
        await delay(500); // Wait for modal to open
        return true;
      }
    }
  }
  return false;
}

/**
 * Purchase an item from an open shop modal
 */
async function purchaseItem(page, itemName) {
  // Find item in modal and click Buy
  const itemElements = await page.$$('[class*="border-gray-600"]');

  for (const item of itemElements) {
    const itemText = await item.evaluate(el => el.textContent);
    if (itemText.includes(itemName)) {
      const buyButton = await item.$('button');
      if (buyButton) {
        await buyButton.click();
        await delay(500);
        return true;
      }
    }
  }
  return false;
}

/**
 * Close any open modal
 */
async function closeModal(page) {
  try {
    // Look for close button or backdrop
    const closeButton = await page.$('[aria-label="Close"], button:has-text("Close"), button:has-text("×")');
    if (closeButton) {
      await closeButton.click();
      await delay(300);
      return true;
    }

    // Try clicking backdrop
    const backdrop = await page.$('[class*="bg-black/50"]');
    if (backdrop) {
      await backdrop.click();
      await delay(300);
      return true;
    }
  } catch (e) {
    // Modal might already be closed
  }
  return false;
}

/**
 * Travel to a connected location by name
 */
async function travelTo(page, locationName) {
  // Find travel section and destination
  const travelCards = await page.$$('[class*="bg-gray-800"]');

  for (const card of travelCards) {
    const cardText = await card.evaluate(el => el.textContent);
    if (cardText.includes(locationName)) {
      // Find Go button in this card
      const buttons = await card.$$('button');
      for (const btn of buttons) {
        const btnText = await btn.evaluate(el => el.textContent);
        if (btnText === 'Go' || btnText === 'Traveling...') {
          await btn.click();
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Wait for travel to complete (location name changes)
 */
async function waitForTravelComplete(page, newLocationName, timeout = 10000) {
  try {
    await page.waitForFunction(
      (name) => {
        const h1 = document.querySelector('h1');
        return h1 && h1.textContent.includes(name);
      },
      { timeout },
      newLocationName
    );
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Click Attempt Crime button for a specific crime
 */
async function attemptCrime(page, crimeName) {
  const crimeCards = await page.$$('[class*="border-red-900"]');

  for (const card of crimeCards) {
    const cardText = await card.evaluate(el => el.textContent);
    if (cardText.includes(crimeName)) {
      const attemptButton = await card.$('button');
      if (attemptButton) {
        await attemptButton.click();
        return true;
      }
    }
  }
  return false;
}

/**
 * Click on an NPC to open their dialogue
 */
async function openNPCDialogue(page, npcName) {
  const npcCards = await page.$$('[class*="cursor-pointer"]');

  for (const card of npcCards) {
    const cardText = await card.evaluate(el => el.textContent);
    if (cardText.includes(npcName)) {
      await card.click();
      await delay(500);
      return true;
    }
  }
  return false;
}

/**
 * Get all job names at current location
 */
async function getAvailableJobs(page) {
  const jobs = [];
  const jobCards = await page.$$('.text-amber-300');

  for (const card of jobCards) {
    const text = await card.evaluate(el => el.textContent);
    if (text) jobs.push(text.trim());
  }
  return jobs;
}

/**
 * Get all crime names at current location
 */
async function getAvailableCrimes(page) {
  const crimes = [];
  const crimeCards = await page.$$('.text-red-300');

  for (const card of crimeCards) {
    const text = await card.evaluate(el => el.textContent);
    if (text) crimes.push(text.trim());
  }
  return crimes;
}

/**
 * Check if a section exists on the page
 */
async function hasSectionWithTitle(page, title) {
  const content = await page.content();
  return content.includes(title);
}

/**
 * Get danger level text from the page
 */
async function getDangerLevel(page) {
  try {
    const content = await page.content();
    const match = content.match(/Danger Level:\s*(\d+)\/10/);
    return match ? parseInt(match[1], 10) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Get connected location names
 */
async function getConnectedLocations(page) {
  const locations = [];
  const cards = await page.$$('[class*="bg-gray-800"]');

  // Look for cards in travel section
  for (const card of cards) {
    try {
      const nameEl = await card.$('.text-amber-300');
      if (nameEl) {
        const name = await nameEl.evaluate(el => el.textContent);
        if (name) locations.push(name.trim());
      }
    } catch (e) {
      // Skip this card
    }
  }

  return locations;
}

module.exports = {
  goToLocation,
  getCurrentEnergy,
  getCurrentGold,
  getCurrentLocationName,
  performJob,
  waitForJobResult,
  getJobResult,
  openShop,
  purchaseItem,
  closeModal,
  travelTo,
  waitForTravelComplete,
  attemptCrime,
  openNPCDialogue,
  getAvailableJobs,
  getAvailableCrimes,
  hasSectionWithTitle,
  getDangerLevel,
  getConnectedLocations,
};
