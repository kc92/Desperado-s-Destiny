/**
 * Calendar System Test Script
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Demonstrates and tests the seasonal calendar system
 */

import mongoose from 'mongoose';
import { calendarService } from '../services/calendar.service';
import { seasonService } from '../services/season.service';
import { GameCalendarModel } from '../models/GameCalendar.model';
import { Season, Month, ItemCategory } from '@desperados/shared';
import {
  formatGameDate,
  getFullDateString,
  generateCalendarSummary,
  getItemCategoryName,
  getPriceTrendDescription,
} from '../utils/calendarUtils';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB\n');
}

/**
 * Test calendar initialization
 */
async function testCalendarInitialization() {
  console.log('=== CALENDAR INITIALIZATION ===\n');

  const calendar = await calendarService.getCalendar();
  const currentDate = await calendarService.getCurrentDate();

  console.log('Calendar initialized:');
  console.log(`  Year: ${calendar.currentYear}`);
  console.log(`  Month: ${calendar.currentMonth} (${Month[calendar.currentMonth]})`);
  console.log(`  Week: ${calendar.currentWeek}`);
  console.log(`  Day: ${calendar.currentDay}`);
  console.log(`  Season: ${calendar.currentSeason}`);
  console.log(`  Moon Phase: ${calendar.currentMoonPhase}`);
  console.log(`\nFormatted: ${getFullDateString(currentDate)}\n`);
}

/**
 * Test seasonal effects
 */
async function testSeasonalEffects() {
  console.log('=== SEASONAL EFFECTS ===\n');

  for (const season of [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER]) {
    const effects = seasonService.getSeasonalEffects(season);
    const description = seasonService.getSeasonDescription(season);

    console.log(`${season}:`);
    console.log(`  ${description}`);
    console.log(`  Travel Speed: ${effects.travelSpeedModifier}x`);
    console.log(`  Travel Danger: ${effects.travelDangerModifier}x`);
    console.log(`  Crop Yield: ${effects.cropYieldModifier}x`);
    console.log(`  Hunting Bonus: +${effects.huntingBonus}%`);
    console.log(`  Fishing Bonus: ${effects.fishingBonus >= 0 ? '+' : ''}${effects.fishingBonus}%`);
    console.log(`  Energy Cost: ${effects.energyCostModifier}x`);
    console.log(`  Road Condition: ${effects.roadCondition}`);
    console.log('');
  }
}

/**
 * Test price modifiers
 */
async function testPriceModifiers() {
  console.log('=== SEASONAL PRICE MODIFIERS ===\n');

  const categories: ItemCategory[] = ['crops', 'furs', 'fish', 'food', 'clothing'];
  const seasons = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];

  console.log('Category'.padEnd(15) + seasons.map((s) => s.substring(0, 6)).join('  '));
  console.log('-'.repeat(50));

  for (const category of categories) {
    const modifiers = seasons.map((season) =>
      seasonService.getSeasonalEffects(season).priceModifiers.get(category) || 1.0
    );

    const row =
      getItemCategoryName(category).padEnd(15) +
      modifiers.map((m) => (m.toFixed(2) + 'x').padEnd(8)).join('');
    console.log(row);
  }
  console.log('');
}

/**
 * Test moon phases
 */
async function testMoonPhases() {
  console.log('=== MOON PHASE EFFECTS ===\n');

  const moonInfo = await seasonService.getMoonPhaseInfo();

  console.log(`Current Moon Phase: ${moonInfo.phase}`);
  console.log(`Illumination: ${Math.round(moonInfo.illumination * 100)}%`);
  console.log(`Description: ${moonInfo.description}`);
  console.log(`\nEffects:`);
  console.log(`  Crime Detection: ${moonInfo.effects.crimeDetectionModifier}x`);
  console.log(`  Crime Bonus Gold: ${moonInfo.effects.crimeBonusGold >= 0 ? '+' : ''}${moonInfo.effects.crimeBonusGold}%`);
  console.log(`  Supernatural Encounter Chance: ${moonInfo.effects.supernaturalEncounterChance * 100}%`);
  console.log(`  Weird West Power Bonus: +${moonInfo.effects.weirdWestPowerBonus}%`);
  console.log(`  Fishing Bonus: ${moonInfo.effects.fishingBonus >= 0 ? '+' : ''}${moonInfo.effects.fishingBonus}%`);
  console.log(`\nDays until full moon: ${moonInfo.daysUntilFullMoon}`);
  console.log(`Days until new moon: ${moonInfo.daysUntilNewMoon}\n`);
}

/**
 * Test holidays
 */
async function testHolidays() {
  console.log('=== UPCOMING HOLIDAYS ===\n');

  const upcoming = await calendarService.getUpcomingHolidays(5);

  for (const holiday of upcoming) {
    console.log(`${holiday.name} (${Month[holiday.month]} ${holiday.day})`);
    console.log(`  ${holiday.description}`);
    console.log(`  Shop Price Modifier: ${holiday.effects.shopPriceModifier}x`);
    console.log(`  NPC Mood Bonus: +${holiday.effects.npcMoodBonus}`);
    if (holiday.isSupernatural) {
      console.log(`  ⚠️ SUPERNATURAL EVENT`);
    }
    console.log('');
  }
}

/**
 * Test activity timing
 */
async function testActivityTiming() {
  console.log('=== ACTIVITY TIMING CHECK ===\n');

  const activities: Array<'hunting' | 'fishing' | 'crime' | 'trading'> = [
    'hunting',
    'fishing',
    'crime',
    'trading',
  ];

  for (const activity of activities) {
    const check = await seasonService.isGoodTimeFor(activity);
    const status = check.isGood ? '✓ GOOD' : '✗ POOR';
    console.log(`${activity.toUpperCase()}:`);
    console.log(`  Status: ${status}`);
    console.log(`  Reason: ${check.reason}`);
    console.log(`  Bonus: ${check.bonus >= 0 ? '+' : ''}${check.bonus}%`);
    console.log('');
  }
}

/**
 * Test time advancement
 */
async function testTimeAdvancement() {
  console.log('=== TIME ADVANCEMENT TEST ===\n');

  const initialDate = await calendarService.getCurrentDate();
  console.log(`Starting Date: ${formatGameDate(initialDate)}`);
  console.log(`Season: ${initialDate.season}\n`);

  // Advance 90 days (to next season)
  console.log('Advancing 90 days...\n');
  await calendarService.forceAdvanceTime(90);

  const newDate = await calendarService.getCurrentDate();
  console.log(`New Date: ${formatGameDate(newDate)}`);
  console.log(`Season: ${newDate.season}`);
  console.log(`Moon Phase: ${newDate.moonPhase}\n`);

  // Reset back
  console.log('Resetting calendar...\n');
  const calendar = await GameCalendarModel.findOne();
  if (calendar) {
    calendar.currentYear = initialDate.year;
    calendar.currentMonth = initialDate.month;
    calendar.currentWeek = initialDate.week;
    calendar.currentDay = initialDate.day;
    calendar.currentSeason = initialDate.season;
    calendar.currentMoonPhase = initialDate.moonPhase;
    await calendar.save();
  }
}

/**
 * Main test function
 */
async function main() {
  try {
    await connectDB();

    await testCalendarInitialization();
    await testSeasonalEffects();
    await testPriceModifiers();
    await testMoonPhases();
    await testHolidays();
    await testActivityTiming();
    await testTimeAdvancement();

    console.log('=== ALL TESTS COMPLETE ===\n');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run tests
main();
