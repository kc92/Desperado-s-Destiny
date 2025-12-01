/**
 * Territory Influence System - Usage Examples
 * Phase 11, Wave 11.1
 *
 * This file demonstrates how to use the Territory Influence System
 */

import { TerritoryInfluenceService } from './server/src/services/territoryInfluence.service';
import { FactionId, InfluenceSource } from './shared/src/types';

// ============================================================================
// EXAMPLE 1: Initialize the Territory System
// ============================================================================

async function initializeSystem() {
  console.log('Initializing Territory Influence System...');

  await TerritoryInfluenceService.initializeTerritories();

  console.log('✓ All 11 territories initialized with faction influence');
}

// ============================================================================
// EXAMPLE 2: Player Completes a Faction Quest
// ============================================================================

async function handleQuestCompletion(
  characterId: string,
  characterName: string,
  questId: string
) {
  // Player completed a Settler Alliance quest in Red Gulch
  const result = await TerritoryInfluenceService.applyQuestInfluence(
    'red_gulch',                    // territoryId
    FactionId.SETTLER_ALLIANCE,     // factionId
    characterId,
    characterName,
    questId,
    15                              // influence gained (+5 to +20 typical)
  );

  console.log(result.message);
  // "Settler Alliance influence increased by 15.0 in Red Gulch"

  if (result.controlChanged) {
    console.log(`Control changed! ${result.controllingFaction} now controls the territory!`);
  }

  // Log to player
  return {
    success: true,
    influence: result.influenceGained,
    territory: result.territoryName,
    faction: result.factionId,
    controlChanged: result.controlChanged,
  };
}

// ============================================================================
// EXAMPLE 3: Player Commits a Crime (Negative Influence)
// ============================================================================

async function handleCrimeCommitted(
  characterId: string,
  characterName: string,
  territoryId: string,
  crimeType: string
) {
  // Player commits robbery in Fort Ashford (Military controlled)
  const result = await TerritoryInfluenceService.applyCrimeInfluence(
    territoryId,
    characterId,
    characterName,
    crimeType
  );

  if (result) {
    console.log(result.message);
    // "U.S. Military influence decreased by 3.0 in Fort Ashford"

    // Penalty for controlling faction
    return {
      influenceLost: Math.abs(result.influenceGained),
      faction: result.factionId,
      warning: 'Criminal activity in controlled territory has consequences!',
    };
  }

  return null; // No controlling faction
}

// ============================================================================
// EXAMPLE 4: Gang Daily Update (Passive Influence)
// ============================================================================

async function handleGangDailyUpdate(gangId: string, gangName: string) {
  // Gang is aligned with Independent Outlaws faction
  // They operate in The Wastes
  const result = await TerritoryInfluenceService.applyGangAlignmentInfluence(
    gangId,
    gangName,
    'the_wastes',                   // territoryId
    FactionId.INDEPENDENT_OUTLAWS,  // aligned faction
    3                               // daily passive gain (1-5)
  );

  console.log(`${gangName} gained +3 influence for Independent Outlaws in The Wastes`);

  return {
    gang: gangName,
    influence: result.influenceGained,
    territory: result.territoryName,
    faction: result.factionId,
  };
}

// ============================================================================
// EXAMPLE 5: Player Donates to Faction
// ============================================================================

async function handleFactionDonation(
  characterId: string,
  characterName: string,
  factionId: FactionId,
  territoryId: string,
  goldAmount: number
) {
  // Player donates 500 gold to Railroad Barons in Whiskey Bend
  const result = await TerritoryInfluenceService.applyDonationInfluence(
    territoryId,
    factionId,
    characterId,
    characterName,
    goldAmount
  );

  const influenceGained = Math.floor(goldAmount / 100); // 1 per 100 gold

  console.log(`Donated ${goldAmount} gold → +${influenceGained} influence`);
  console.log(result.message);

  return {
    goldSpent: goldAmount,
    influenceGained: result.influenceGained,
    faction: result.factionId,
    territory: result.territoryName,
  };
}

// ============================================================================
// EXAMPLE 6: Display Territory Status
// ============================================================================

async function displayTerritoryStatus(territoryId: string) {
  const territory = await TerritoryInfluenceService.getTerritoryInfluence(territoryId);

  console.log('\n=== TERRITORY STATUS ===');
  console.log(`Name: ${territory.territoryName}`);
  console.log(`Type: ${territory.territoryType}`);
  console.log(`Control: ${territory.controlLevel.toUpperCase()}`);
  console.log(`Controlling Faction: ${territory.controllingFaction || 'None'}`);
  console.log(`Stability: ${territory.stability}%`);
  console.log(`Is Contested: ${territory.isContested ? 'Yes' : 'No'}`);

  console.log('\nTop Factions:');
  territory.topFactions.forEach((faction, index) => {
    console.log(`  ${index + 1}. ${faction.factionId}: ${faction.influence.toFixed(1)}% (${faction.trend})`);
  });

  return territory;
}

// ============================================================================
// EXAMPLE 7: Get Player Benefits
// ============================================================================

async function getPlayerBenefits(
  territoryId: string,
  playerFactionId: FactionId
) {
  const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
    territoryId,
    playerFactionId
  );

  if (!benefits) {
    return null;
  }

  console.log('\n=== PLAYER BENEFITS ===');
  console.log(`Territory: ${territoryId}`);
  console.log(`Aligned Faction: ${playerFactionId}`);
  console.log(`Shop Discount: ${benefits.shopDiscount}%`);
  console.log(`Reputation Bonus: ${benefits.reputationBonus}%`);
  console.log(`Crime Heat Reduction: ${benefits.crimeHeatReduction}%`);
  console.log(`Has Safe House: ${benefits.hasSafeHouse ? 'Yes' : 'No'}`);
  console.log(`Job Priority: ${benefits.jobPriority ? 'Yes' : 'No'}`);

  return benefits;
}

// ============================================================================
// EXAMPLE 8: Display All Territories
// ============================================================================

async function displayAllTerritories() {
  const territories = await TerritoryInfluenceService.getAllTerritories();

  console.log('\n=== ALL TERRITORIES ===\n');

  territories.forEach((territory) => {
    const controller = territory.controllingFaction || 'Contested';
    const topInfluence = territory.topFactions[0]?.influence.toFixed(1) || '0';

    console.log(`${territory.territoryName.padEnd(25)} | ${territory.controlLevel.padEnd(10)} | ${controller.padEnd(20)} | Top: ${topInfluence}%`);
  });

  return territories;
}

// ============================================================================
// EXAMPLE 9: Get Faction Overview
// ============================================================================

async function displayFactionOverview(factionId: FactionId) {
  const overview = await TerritoryInfluenceService.getFactionOverview(factionId);

  console.log(`\n=== ${factionId} OVERVIEW ===`);
  console.log(`Total Territories: ${overview.totalTerritories}`);
  console.log(`Dominated: ${overview.dominatedTerritories}`);
  console.log(`Controlled: ${overview.controlledTerritories}`);
  console.log(`Disputed: ${overview.disputedTerritories}`);
  console.log(`Contested: ${overview.contestedTerritories}`);
  console.log(`Total Influence: ${overview.totalInfluence.toFixed(1)}`);
  console.log(`Average Influence: ${overview.averageInfluence.toFixed(1)}%`);
  console.log(`Strength: ${overview.strength.toUpperCase()}`);

  return overview;
}

// ============================================================================
// EXAMPLE 10: View Territory History
// ============================================================================

async function displayTerritoryHistory(territoryId: string, limit: number = 20) {
  const history = await TerritoryInfluenceService.getInfluenceHistory(territoryId, limit);

  console.log(`\n=== ${territoryId.toUpperCase()} HISTORY (Last ${limit} changes) ===\n`);

  history.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleString();
    const sign = entry.amount > 0 ? '+' : '';
    const actor = entry.characterName || entry.gangName || 'System';

    console.log(`${date} | ${entry.factionId.padEnd(20)} | ${sign}${entry.amount.toFixed(1).padStart(6)} | ${entry.source.padEnd(20)} | by ${actor}`);
  });

  return history;
}

// ============================================================================
// EXAMPLE 11: Admin - Manually Modify Influence
// ============================================================================

async function adminModifyInfluence(
  territoryId: string,
  factionId: FactionId,
  amount: number,
  reason: string
) {
  const result = await TerritoryInfluenceService.modifyInfluence(
    territoryId,
    factionId,
    amount,
    InfluenceSource.SYSTEM_ADJUSTMENT,
    undefined,
    undefined,
    undefined,
    undefined,
    { reason }
  );

  console.log(`[ADMIN] ${result.message}`);
  console.log(`Reason: ${reason}`);

  return result;
}

// ============================================================================
// EXAMPLE 12: Complete Game Loop Example
// ============================================================================

async function completeGameLoopExample() {
  console.log('\n========================================');
  console.log('COMPLETE GAME LOOP EXAMPLE');
  console.log('========================================\n');

  // 1. Initialize system
  await initializeSystem();

  // 2. Display all territories
  await displayAllTerritories();

  // 3. Player completes quest
  await handleQuestCompletion(
    'char_123',
    'Dusty McCoy',
    'quest_settler_001'
  );

  // 4. Check benefits
  await getPlayerBenefits('red_gulch', FactionId.SETTLER_ALLIANCE);

  // 5. Player commits crime
  await handleCrimeCommitted(
    'char_123',
    'Dusty McCoy',
    'fort_ashford',
    'robbery'
  );

  // 6. Gang daily update
  await handleGangDailyUpdate('gang_001', 'The Wild Bunch');

  // 7. View specific territory
  await displayTerritoryStatus('red_gulch');

  // 8. View faction overview
  await displayFactionOverview(FactionId.NAHI_COALITION);

  // 9. View territory history
  await displayTerritoryHistory('red_gulch', 10);

  console.log('\n✓ Game loop example complete!');
}

// ============================================================================
// EXAMPLE 13: Integration with Quest System
// ============================================================================

/**
 * Example of integrating with quest completion
 */
async function onQuestComplete(character: any, quest: any) {
  // Check if quest affects territory influence
  if (quest.territoryId && quest.factionId && quest.influenceReward) {
    const result = await TerritoryInfluenceService.applyQuestInfluence(
      quest.territoryId,
      quest.factionId,
      character._id,
      character.name,
      quest._id,
      quest.influenceReward
    );

    // Notify player
    return {
      questComplete: true,
      influenceGained: result.influenceGained,
      territory: result.territoryName,
      faction: result.factionId,
      controlChanged: result.controlChanged,
      message: result.message,
    };
  }

  return { questComplete: true };
}

// ============================================================================
// EXAMPLE 14: Integration with Shop System
// ============================================================================

/**
 * Apply alignment discount to shop prices
 */
async function calculateShopPrice(
  basePrice: number,
  territoryId: string,
  playerFaction?: FactionId
) {
  if (!playerFaction) {
    return basePrice; // No faction alignment
  }

  const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
    territoryId,
    playerFaction
  );

  if (!benefits) {
    return basePrice;
  }

  const discount = benefits.shopDiscount / 100;
  const finalPrice = basePrice * (1 - discount);

  return Math.round(finalPrice);
}

// Example usage:
// const price = await calculateShopPrice(1000, 'red_gulch', FactionId.SETTLER_ALLIANCE);
// If Settlers control Red Gulch (dominated): 1000 * 0.75 = 750 gold

// ============================================================================
// EXAMPLE 15: Integration with Reputation System
// ============================================================================

/**
 * Apply alignment bonus to reputation gains
 */
async function calculateReputationGain(
  baseRep: number,
  territoryId: string,
  playerFaction?: FactionId
) {
  if (!playerFaction) {
    return baseRep;
  }

  const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
    territoryId,
    playerFaction
  );

  if (!benefits) {
    return baseRep;
  }

  const bonus = benefits.reputationBonus / 100;
  const finalRep = baseRep * (1 + bonus);

  return Math.round(finalRep);
}

// Example usage:
// const rep = await calculateReputationGain(100, 'red_gulch', FactionId.SETTLER_ALLIANCE);
// If Settlers dominate Red Gulch: 100 * 1.15 = 115 reputation

// ============================================================================
// Run examples (comment/uncomment as needed)
// ============================================================================

// completeGameLoopExample();
