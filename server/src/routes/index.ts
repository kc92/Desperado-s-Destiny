import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import characterRoutes from './character.routes';
import actionRoutes from './action.routes';
import skillRoutes from './skill.routes';
import crimeRoutes from './crime.routes';
import combatRoutes from './combat.routes';
import goldRoutes from './gold.routes';
import currencyRoutes from './currency.routes';
import gangRoutes from './gang.routes';
import gangEconomyRoutes from './gangEconomy.routes';
import mailRoutes from './mail.routes';
import friendRoutes from './friend.routes';
import notificationRoutes from './notification.routes';
import territoryRoutes from './territory.routes';
import territoryControlRoutes from './territoryControl.routes';
import gangWarRoutes from './gangWar.routes';
import chatRoutes from './chat.routes';
import profileRoutes from './profile.routes';
import shopRoutes from './shop.routes';
import questRoutes from './quest.routes';
import leaderboardRoutes from './leaderboard.routes';
import achievementRoutes from './achievement.routes';
import deckGameRoutes from './deckGame.routes';
import duelRoutes from './duel.routes';
import tournamentRoutes from './tournament.routes';
import locationRoutes from './location.routes';
import encounterRoutes from './encounter.routes';
import npcRoutes from './npc.routes';
import craftingRoutes from './crafting.routes';
import reputationRoutes from './reputation.routes';
import worldRoutes from './world.routes';
import secretsRoutes from './secrets.routes';
import bankRoutes from './bank.routes';
import timeRoutes from './time.routes';
import weatherRoutes from './weather.routes';
import bountyRoutes from './bounty.routes';
import bountyHunterRoutes from './bountyHunter.routes';
import jailRoutes from './jail.routes';
import moodRoutes from './mood.routes';
import scheduleRoutes from './schedule.routes';
import gossipRoutes from './gossip.routes';
import mentorRoutes from './mentor.routes';
import reputationSpreadingRoutes from './reputationSpreading.routes';
import serviceProviderRoutes from './serviceProvider.routes';
import chineseDiasporaRoutes from './chineseDiaspora.routes';
import newspaperRoutes from './newspaper.routes';
import legacyRoutes from './legacy.routes';
import permanentUnlockRoutes from './permanentUnlock.routes';
import racingRoutes from './racing.routes';
import shootingRoutes from './shooting.routes';
import gamblingRoutes from './gambling.routes';
import wanderingMerchantRoutes from './wanderingMerchant.routes';
import propertyRoutes from './property.routes';
import loginRewardRoutes from './loginReward.routes';
import dailyContractRoutes from './dailyContract.routes';
import marketplaceRoutes from './marketplace.routes';
import frontierZodiacRoutes from './frontierZodiac.routes';
import calendarRoutes from './calendar.routes';
import gangBaseRoutes from './gangBase.routes';
import npcGangConflictRoutes from './npcGangConflict.routes';
import fishingRoutes from './fishing.routes';
import huntingRoutes from './hunting.routes';
import trackingRoutes from './tracking.routes';
import trainRoutes from './train.routes';
import stagecoachRoutes from './stagecoach.routes';
import heistRoutes from './heist.routes';
import warfareRoutes from './warfare.routes';
import horseRoutes from './horse.routes';
import companionRoutes from './companion.routes';
import entertainerRoutes from './entertainer.routes';
import worldBossRoutes from './worldBoss.routes';
import productionRoutes from './production.routes';
import workshopRoutes from './workshop.routes';
import cosmicRoutes from './cosmic.routes';
import sanityRoutes from './sanity.routes';
import ritualRoutes from './ritual.routes';
import deathRoutes from './death.routes';
import energyRoutes from './energy.routes';
import disguiseRoutes from './disguise.routes';
import bribeRoutes from './bribe.routes';
import conquestRoutes from './conquest.routes';
import factionWarRoutes from './factionWar.routes';
import territoryInfluenceRoutes from './territoryInfluence.routes';
import legendaryHuntRoutes from './legendaryHunt.routes';
import bossEncounterRoutes from './bossEncounter.routes';
import propertyTaxRoutes from './propertyTax.routes';
import foreclosureRoutes from './foreclosure.routes';
import workerRoutes from './worker.routes';
import tutorialRoutes from './tutorial.routes';
import karmaRoutes from './karma.routes';
import deityEncounterRoutes from './deityEncounter.routes';
import { apiRateLimiter } from '../middleware';

const router = Router();

/**
 * API Routes
 * All routes are prefixed with /api
 */

// Health check route (no rate limiting)
router.use('/health', healthRoutes);

// Authentication routes (includes built-in rate limiting)
router.use('/auth', authRoutes);

// Admin routes (no rate limiting - protected by requireAuth + requireAdmin)
router.use('/admin', adminRoutes);

// Character routes (with API rate limiting)
router.use('/characters', apiRateLimiter, characterRoutes);

// Action routes (with API rate limiting)
router.use('/actions', apiRateLimiter, actionRoutes);

// Skill routes (with API rate limiting)
router.use('/skills', apiRateLimiter, skillRoutes);

// Crime routes (with API rate limiting)
router.use('/crimes', apiRateLimiter, crimeRoutes);

// Combat routes (with API rate limiting)
router.use('/combat', apiRateLimiter, combatRoutes);

// Gold routes (legacy - redirects to currency) (with API rate limiting)
router.use('/gold', apiRateLimiter, goldRoutes);

// Currency routes (with API rate limiting) - Primary currency system
router.use('/currency', apiRateLimiter, currencyRoutes);

// Gang routes (with API rate limiting)
router.use('/gangs', apiRateLimiter, gangRoutes);

// Gang Economy routes (with API rate limiting)
router.use('/gangs', apiRateLimiter, gangEconomyRoutes);

// Mail routes (with API rate limiting)
router.use('/mail', apiRateLimiter, mailRoutes);

// Friend routes (with API rate limiting)
router.use('/friends', apiRateLimiter, friendRoutes);

// Notification routes (with API rate limiting)
router.use('/notifications', apiRateLimiter, notificationRoutes);

// Territory routes (with API rate limiting)
router.use('/territories', apiRateLimiter, territoryRoutes);

// Territory Control routes (with API rate limiting)
router.use('/territory', apiRateLimiter, territoryControlRoutes);

// Gang War routes (with API rate limiting)
router.use('/wars', apiRateLimiter, gangWarRoutes);

// Chat routes (with API rate limiting)
router.use('/chat', apiRateLimiter, chatRoutes);

// Profile routes (with API rate limiting)
router.use('/profiles', apiRateLimiter, profileRoutes);

// Shop routes (with API rate limiting)
router.use('/shop', apiRateLimiter, shopRoutes);

// Quest routes (with API rate limiting)
router.use('/quests', apiRateLimiter, questRoutes);

// Leaderboard routes (with API rate limiting)
router.use('/leaderboard', apiRateLimiter, leaderboardRoutes);

// Achievement routes (with API rate limiting)
router.use('/achievements', apiRateLimiter, achievementRoutes);

// Deck game routes (with API rate limiting)
router.use('/deck', apiRateLimiter, deckGameRoutes);

// Duel routes (with API rate limiting)
router.use('/duels', apiRateLimiter, duelRoutes);

// Tournament routes (with API rate limiting)
router.use('/tournaments', apiRateLimiter, tournamentRoutes);

// Location routes (with API rate limiting)
router.use('/locations', apiRateLimiter, locationRoutes);

// Encounter routes (with API rate limiting)
router.use('/encounters', apiRateLimiter, encounterRoutes);

// NPC routes (with API rate limiting)
router.use('/npcs', apiRateLimiter, npcRoutes);

// Crafting routes (with API rate limiting)
router.use('/crafting', apiRateLimiter, craftingRoutes);

// Reputation routes (with API rate limiting)
router.use('/reputation', apiRateLimiter, reputationRoutes);

// World routes (with API rate limiting)
router.use('/world', apiRateLimiter, worldRoutes);

// Secrets routes (with API rate limiting)
router.use('/secrets', apiRateLimiter, secretsRoutes);

// Bank routes (with API rate limiting)
router.use('/bank', apiRateLimiter, bankRoutes);

// Time routes (with API rate limiting)
router.use('/time', apiRateLimiter, timeRoutes);

// Weather routes (with API rate limiting)
router.use('/weather', apiRateLimiter, weatherRoutes);

// Bounty routes (with API rate limiting)
router.use('/bounty', apiRateLimiter, bountyRoutes);

// Bounty Hunter routes (with API rate limiting)
router.use('/bounty-hunters', apiRateLimiter, bountyHunterRoutes);

// Jail routes (with API rate limiting)
router.use('/jail', apiRateLimiter, jailRoutes);

// Mood routes (with API rate limiting)
router.use('/moods', apiRateLimiter, moodRoutes);

// Schedule routes (with API rate limiting)
router.use('/schedule', apiRateLimiter, scheduleRoutes);

// Gossip routes (with API rate limiting)
router.use('/gossip', apiRateLimiter, gossipRoutes);

// Mentor routes (with API rate limiting)
router.use('/mentors', apiRateLimiter, mentorRoutes);

// Reputation Spreading routes (with API rate limiting)
router.use('/reputation-spreading', apiRateLimiter, reputationSpreadingRoutes);

// Service Provider routes (with API rate limiting)
router.use('/service-providers', apiRateLimiter, serviceProviderRoutes);

// Chinese Diaspora routes (with API rate limiting)
router.use('/diaspora', apiRateLimiter, chineseDiasporaRoutes);

// Newspaper routes (with API rate limiting)
router.use('/newspapers', apiRateLimiter, newspaperRoutes);

// Legacy routes (with API rate limiting)
router.use('/legacy', apiRateLimiter, legacyRoutes);

// Permanent Unlock routes (with API rate limiting)
router.use('/unlocks', apiRateLimiter, permanentUnlockRoutes);

// Racing routes (with API rate limiting)
router.use('/racing', apiRateLimiter, racingRoutes);

// Shooting Contest routes (with API rate limiting)
router.use('/shooting', apiRateLimiter, shootingRoutes);

// Gambling routes (with API rate limiting)
router.use('/gambling', apiRateLimiter, gamblingRoutes);

// Wandering Merchant routes (with API rate limiting)
router.use('/merchants', apiRateLimiter, wanderingMerchantRoutes);

// Property routes (with API rate limiting)
router.use('/properties', apiRateLimiter, propertyRoutes);

// Login Reward routes (with API rate limiting) - Phase B Competitor Parity
router.use('/login-rewards', apiRateLimiter, loginRewardRoutes);

// Daily Contract routes (with API rate limiting) - Phase B Competitor Parity
router.use('/contracts', apiRateLimiter, dailyContractRoutes);

// Marketplace routes (with API rate limiting) - Phase C Competitor Parity
router.use('/market', apiRateLimiter, marketplaceRoutes);

// Frontier Zodiac routes (with API rate limiting) - Western-themed zodiac calendar
router.use('/zodiac', apiRateLimiter, frontierZodiacRoutes);

// Calendar routes (with API rate limiting) - Game calendar, seasons, moon phases
router.use('/calendar', apiRateLimiter, calendarRoutes);

// Gang Base routes (with API rate limiting) - Gang base management
router.use('/gang-bases', apiRateLimiter, gangBaseRoutes);

// NPC Gang Conflict routes (with API rate limiting) - NPC gang interactions
router.use('/npc-gangs', apiRateLimiter, npcGangConflictRoutes);

// Fishing routes (with API rate limiting) - Fishing system
router.use('/fishing', apiRateLimiter, fishingRoutes);

// Hunting routes (with API rate limiting) - Hunting system
router.use('/hunting', apiRateLimiter, huntingRoutes);

// Tracking routes (with API rate limiting) - Tracking system (part of hunting)
router.use('/tracking', apiRateLimiter, trackingRoutes);

// Train routes (with API rate limiting) - Train travel and robbery system
router.use('/trains', apiRateLimiter, trainRoutes);

// Stagecoach routes (with API rate limiting) - Stagecoach travel and ambush system
router.use('/stagecoach', apiRateLimiter, stagecoachRoutes);

// Heist routes (with API rate limiting) - Gang heist operations
router.use('/heists', apiRateLimiter, heistRoutes);

// Warfare routes (with API rate limiting) - Territory warfare, fortifications, and resistance
router.use('/warfare', apiRateLimiter, warfareRoutes);

// Horse routes (with API rate limiting) - Horse ownership, care, training, and breeding
router.use('/horses', apiRateLimiter, horseRoutes);

// Companion routes (with API rate limiting) - Animal companion ownership, care, training, taming, and combat
router.use('/companions', apiRateLimiter, companionRoutes);

// Entertainer routes (with API rate limiting) - Wandering entertainers, performances, skills
router.use('/entertainers', apiRateLimiter, entertainerRoutes);

// World Boss routes (with API rate limiting) - World boss encounters and boss fights
router.use('/world-bosses', apiRateLimiter, worldBossRoutes);

// Production routes (with API rate limiting) - Property production system
router.use('/production', apiRateLimiter, productionRoutes);

// Workshop routes (with API rate limiting) - Workshop access, masterwork crafting, and repairs
router.use('/workshops', apiRateLimiter, workshopRoutes);

// Cosmic routes (with API rate limiting) - Cosmic quest storyline, endings, lore
router.use('/cosmic', apiRateLimiter, cosmicRoutes);

// Sanity routes (with API rate limiting) - Sanity, corruption, madness, reality distortion
router.use('/sanity', apiRateLimiter, sanityRoutes);

// Ritual routes (with API rate limiting) - Dark rituals and cosmic ceremonies
router.use('/rituals', apiRateLimiter, ritualRoutes);

// Death routes (with API rate limiting) - Death, respawn, and death penalties
router.use('/death', apiRateLimiter, deathRoutes);

// Energy routes (with API rate limiting) - Energy management and regeneration
router.use('/energy', apiRateLimiter, energyRoutes);

// Disguise routes (with API rate limiting) - Disguise application and detection
router.use('/disguise', apiRateLimiter, disguiseRoutes);

// Bribe routes (with API rate limiting) - Bribery system for guards and NPCs
router.use('/bribe', apiRateLimiter, bribeRoutes);

// Conquest routes (with API rate limiting) - Territory siege and conquest mechanics
router.use('/conquest', apiRateLimiter, conquestRoutes);

// Faction War routes (with API rate limiting) - Faction war events and participation
router.use('/faction-wars', apiRateLimiter, factionWarRoutes);

// Territory Influence routes (with API rate limiting) - Faction influence and territory control
router.use('/territory-influence', apiRateLimiter, territoryInfluenceRoutes);

// Legendary Hunt routes (with API rate limiting) - Legendary animal discovery, tracking, and combat
router.use('/legendary-hunts', apiRateLimiter, legendaryHuntRoutes);

// Boss Encounter routes (with API rate limiting) - Individual boss encounters and multi-phase combat
router.use('/boss-encounters', apiRateLimiter, bossEncounterRoutes);

// Property Tax routes (with API rate limiting) - Property tax calculation, payment, and auto-pay
router.use('/property-tax', apiRateLimiter, propertyTaxRoutes);

// Foreclosure routes (with API rate limiting) - Property auctions, bankruptcy, and foreclosure
router.use('/foreclosure', apiRateLimiter, foreclosureRoutes);

// Worker routes (with API rate limiting) - Advanced worker management (training, wages, strikes)
router.use('/workers', apiRateLimiter, workerRoutes);

// Tutorial routes (with API rate limiting) - Tutorial rewards and analytics
router.use('/tutorial', apiRateLimiter, tutorialRoutes);

// Karma routes (with API rate limiting) - Deity karma tracking, blessings, curses
router.use('/karma', apiRateLimiter, karmaRoutes);

// Deity Encounter routes (with API rate limiting) - Strangers, omens, dreams, manifestations
router.use('/deity', apiRateLimiter, deityEncounterRoutes);

export default router;

