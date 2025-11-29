/**
 * Newspaper System Integration Examples
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * This file demonstrates how to integrate the newspaper system
 * with various game systems. Use these patterns in your services.
 */

import { ObjectId } from 'mongodb';
import { newspaperEvents } from '../utils/newspaperEvents';

/**
 * Example 1: Crime System Integration
 * Report bank robbery to newspapers
 */
export async function exampleBankRobbery() {
  // When a bank robbery succeeds, report it
  const characterId = new ObjectId('507f1f77bcf86cd799439011');
  const characterName = 'Jack Morgan';
  const bankLocation = 'Red Gulch National Bank';
  const stolenAmount = 7500;

  await newspaperEvents.reportBankRobbery({
    characterId,
    characterName,
    location: bankLocation,
    amount: stolenAmount,
  });

  // Result: Articles created in:
  // - Red Gulch Gazette: "BANK ROBBERS STRIKE Red Gulch: $7,500 Missing"
  // - Frontier Oracle: "SHOCKING HEIST! Bandits Steal $7,500!"
}

/**
 * Example 2: Combat System Integration
 * Report duel outcome to newspapers
 */
export async function exampleDuel() {
  // When a duel concludes, report it
  const winnerId = new ObjectId('507f1f77bcf86cd799439011');
  const winnerName = 'Black Jack Morgan';
  const loserId = new ObjectId('507f1f77bcf86cd799439012');
  const loserName = 'Wild Bill Hendricks';
  const duelLocation = 'Main Street, Red Gulch';
  const wasFatal = true;

  await newspaperEvents.reportDuel({
    winnerId,
    winnerName,
    loserId,
    loserName,
    location: duelLocation,
    fatal: wasFatal,
  });

  // Result: Articles created in:
  // - Red Gulch Gazette: "SHOWDOWN AT Main Street: Black Jack Morgan Defeats Wild Bill Hendricks"
  // - Frontier Oracle: "LEGENDARY GUNFIGHT! Black Jack Morgan OBLITERATES Wild Bill Hendricks!"
}

/**
 * Example 3: Hunting System Integration
 * Report legendary animal kill to newspapers
 */
export async function exampleLegendaryKill() {
  // When a legendary animal is killed, report it
  const hunterId = new ObjectId('507f1f77bcf86cd799439011');
  const hunterName = 'Sarah "Hawk Eye" Chen';
  const creatureName = 'Demon Bear of Dark Forest';
  const huntLocation = 'The Dark Forest';
  const rewardAmount = 2000;

  await newspaperEvents.reportLegendaryKill({
    characterId: hunterId,
    characterName: hunterName,
    creatureName,
    location: huntLocation,
    reward: rewardAmount,
  });

  // Result: Articles created in:
  // - All newspapers cover this legendary achievement
  // - Red Gulch Gazette: "LEGENDARY BEAST SLAIN: Sarah 'Hawk Eye' Chen Kills Demon Bear of Dark Forest"
  // - Frontier Oracle: "IMPOSSIBLE FEAT! Sarah 'Hawk Eye' Chen Kills MYTHICAL Demon Bear!"
}

/**
 * Example 4: Gang System Integration
 * Report gang war to newspapers
 */
export async function exampleGangWar() {
  // When gang war breaks out, report it
  const gang1Name = 'Morgan Gang';
  const gang2Name = 'Valdez Cartel';
  const warLocation = 'The Frontera';

  await newspaperEvents.reportGangWar({
    gang1Name,
    gang2Name,
    location: warLocation,
  });

  // Result: Articles created in:
  // - La Voz de la Frontera: "GANG WAR ERUPTS: Morgan Gang vs Valdez Cartel"
  // - Frontier Oracle: "ALL-OUT WAR! Morgan Gang and Valdez Cartel in DEADLY BATTLE!"
}

/**
 * Example 5: Territory System Integration
 * Report territory change to newspapers
 */
export async function exampleTerritoryChange() {
  // When territory control changes, report it
  const territoryName = 'Red Gulch';
  const newFactionName = 'Frontera Cartel';
  const previousFactionName = 'Settler Alliance';

  await newspaperEvents.reportTerritoryChange({
    territory: territoryName,
    newFaction: newFactionName,
    previousFaction: previousFactionName,
  });

  // Result: Articles created in:
  // - ALL newspapers (major political event)
  // - Red Gulch Gazette: "Red Gulch FALLS: Frontera Cartel Seizes Control"
  // - La Voz de la Frontera: "Red Gulch LIBERATED: Frontera Forces Victorious"
  // - Fort Ashford Dispatch: "ENEMY FORCES Occupy Red Gulch: Military Response Planned"
  // - Frontier Oracle: "APOCALYPSE NOW! Red Gulch in TOTAL CHAOS!"
}

/**
 * Example 6: Law System Integration
 * Report arrest to newspapers
 */
export async function exampleArrest() {
  // When a criminal is arrested, report it
  const criminalId = new ObjectId('507f1f77bcf86cd799439013');
  const criminalName = 'One-Eyed Pete';
  const crimeCommitted = 'bank robbery and murder';
  const arrestLocation = 'Red Gulch';
  const bountyAmount = 1500;

  await newspaperEvents.reportArrest({
    characterId: criminalId,
    characterName: criminalName,
    crime: crimeCommitted,
    location: arrestLocation,
    bounty: bountyAmount,
  });

  // Result: Articles created in:
  // - Red Gulch Gazette: "OUTLAW CAPTURED: One-Eyed Pete Behind Bars"
  // - Fort Ashford Dispatch: "JUSTICE PREVAILS: Notorious One-Eyed Pete Captured"
}

/**
 * Example 7: Jail System Integration
 * Report escape to newspapers
 */
export async function exampleEscape() {
  // When a prisoner escapes, report it
  const escapeeId = new ObjectId('507f1f77bcf86cd799439013');
  const escapeeName = 'One-Eyed Pete';
  const jailLocation = 'Red Gulch Jail';

  await newspaperEvents.reportEscape({
    characterId: escapeeId,
    characterName: escapeeName,
    location: jailLocation,
  });

  // Result: Articles created in:
  // - Red Gulch Gazette: "JAILBREAK: One-Eyed Pete Escapes from Red Gulch Jail"
  // - Frontier Oracle: "IMPOSSIBLE ESCAPE! One-Eyed Pete Vanishes from Red Gulch Jail!"
}

/**
 * Example 8: Bounty System Integration
 * Report bounty claimed to newspapers
 */
export async function exampleBountyClaimed() {
  // When a bounty is successfully claimed, report it
  const hunterId = new ObjectId('507f1f77bcf86cd799439014');
  const hunterName = 'Marshal Johnson';
  const criminalId = new ObjectId('507f1f77bcf86cd799439013');
  const criminalName = 'One-Eyed Pete';
  const bountyAmount = 1500;

  await newspaperEvents.reportBountyClaimed({
    hunterId,
    hunterName,
    criminalId,
    criminalName,
    bounty: bountyAmount,
  });

  // Result: Articles created in:
  // - Red Gulch Gazette: "BOUNTY HUNTER STRIKES: Marshal Johnson Claims $1,500 on One-Eyed Pete"
  // - Fort Ashford Dispatch: "JUSTICE SERVED: Professional Marshal Johnson Ends One-Eyed Pete Reign of Terror"
}

/**
 * Example 9: Achievement System Integration
 * Report achievement unlock to newspapers
 */
export async function exampleAchievement() {
  // When a player unlocks a major achievement, report it
  const playerId = new ObjectId('507f1f77bcf86cd799439011');
  const playerName = 'Black Jack Morgan';
  const achievementName = 'Legendary Gunslinger';
  const achievementDescription = 'won 100 duels without a single loss';

  await newspaperEvents.reportAchievement({
    characterId: playerId,
    characterName: playerName,
    achievementName,
    description: achievementDescription,
  });

  // Result: Articles created in:
  // - All newspapers cover legendary achievements
  // - Red Gulch Gazette: "FRONTIER LEGEND: Black Jack Morgan Earns 'Legendary Gunslinger'"
  // - Frontier Oracle: "INCREDIBLE! Black Jack Morgan Becomes 'Legendary Gunslinger'!"
}

/**
 * Example 10: Weird West System Integration
 * Report supernatural sighting to newspapers
 */
export async function exampleSupernaturalSighting() {
  // When a supernatural event occurs, report it
  const creatureName = 'ghostly stagecoach driven by a headless coachman';
  const sightingLocation = "Dead Man's Canyon";

  await newspaperEvents.reportSupernaturalSighting({
    creatureName,
    location: sightingLocation,
  });

  // Result: Articles created in:
  // - Frontier Oracle: "SHOCKING PROOF! ghostly stagecoach EXISTS! Witnesses Terrified!"
  // - (Other newspapers may cover with skepticism)
}

/**
 * Example 11: Train System Integration
 * Report train heist to newspapers
 */
export async function exampleTrainHeist() {
  // When a train is robbed, report it
  const robberId = new ObjectId('507f1f77bcf86cd799439011');
  const robberName = 'Jesse Morgan';
  const trainName = 'Western Express';
  const stolenAmount = 25000;

  await newspaperEvents.reportTrainHeist({
    characterId: robberId,
    characterName: robberName,
    trainName,
    amount: stolenAmount,
  });

  // Result: Articles created in:
  // - All major newspapers
  // - Red Gulch Gazette: "IRON HORSE ROBBED: Train Heist Nets $25,000"
  // - Fort Ashford Dispatch: "ARMY CAVALRY IN PURSUIT After Western Express Robbery"
  // - Frontier Oracle: "TERROR ON THE RAILS! Ghost Bandits Rob Western Express!"
}

/**
 * INTEGRATION PATTERN: Crime Service
 *
 * This shows the complete pattern for integrating newspapers
 * into a game service.
 */
export class CrimeServiceExample {
  async executeBankRobbery(characterId: string, bankId: string) {
    // 1. Validate the action
    const character = await this.getCharacter(characterId);
    const bank = await this.getBank(bankId);

    if (!character || !bank) {
      throw new Error('Invalid character or bank');
    }

    // 2. Check requirements (energy, skills, etc.)
    const canRob = await this.checkRequirements(character, bank);
    if (!canRob) {
      throw new Error('Requirements not met');
    }

    // 3. Execute the robbery
    const result = await this.performRobbery(character, bank);

    // 4. Update game state
    await this.updateCharacter(character, result);
    await this.updateBank(bank, result);

    // 5. Report to newspapers (if successful)
    if (result.success) {
      await newspaperEvents.reportBankRobbery({
        characterId: new ObjectId(characterId),
        characterName: character.name,
        location: bank.location,
        amount: result.stolenAmount,
      });
    }

    // 6. Return result to player
    return result;
  }

  // Placeholder methods for example
  private async getCharacter(id: string): Promise<any> {
    return { name: 'Jack Morgan' };
  }
  private async getBank(id: string): Promise<any> {
    return { location: 'Red Gulch' };
  }
  private async checkRequirements(character: any, bank: any): Promise<boolean> {
    return true;
  }
  private async performRobbery(character: any, bank: any): Promise<any> {
    return { success: true, stolenAmount: 5000 };
  }
  private async updateCharacter(character: any, result: any): Promise<void> {}
  private async updateBank(bank: any, result: any): Promise<void> {}
}

/**
 * CONDITIONAL REPORTING: Only report significant events
 */
export async function exampleConditionalReporting(
  characterId: ObjectId,
  characterName: string,
  notoriety: number,
  crimeValue: number
) {
  // Only report to newspapers if:
  // - Player has high notoriety (>50), OR
  // - Crime value is significant (>$1000)

  const shouldReport = notoriety > 50 || crimeValue > 1000;

  if (shouldReport) {
    await newspaperEvents.reportBankRobbery({
      characterId,
      characterName,
      location: 'Red Gulch',
      amount: crimeValue,
    });
  } else {
    console.log('Crime too minor for newspaper coverage');
  }
}

/**
 * TESTING: Manual article creation for testing
 */
export async function exampleManualArticleCreation() {
  // For testing, you can create articles directly via API
  // This bypasses the event hook system

  const response = await fetch('/api/newspapers/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newspaperId: 'red-gulch-gazette',
      eventType: 'bank-robbery',
      category: 'crime',
      involvedCharacters: [
        {
          id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'Test Character',
        },
      ],
      location: 'Test Location',
      details: {
        amount: '$9,999',
        location: 'Test Location',
      },
      timestamp: new Date(),
    }),
  });

  const result: any = await response.json();
  console.log('Created article:', result.article?.headline);
}

/**
 * Best practices summary:
 *
 * 1. Always use event hooks (newspaperEvents.*) instead of direct API calls
 * 2. Call event hooks AFTER the action succeeds, not before
 * 3. Only report significant events (high-profile players or major actions)
 * 4. Provide accurate data (character names, locations, amounts)
 * 5. Let the system handle newspaper selection and article generation
 * 6. Don't worry about duplicate coverage (multiple newspapers is intentional)
 * 7. Use try-catch around newspaper calls (shouldn't break main flow)
 */
