/**
 * App Component
 * Main application component with routing configuration
 */

import { useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useAuthBroadcast, type AuthBroadcastMessage } from '@/hooks/useStorageSync';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GameLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';
import { ChatWindow, ChatErrorFallback } from '@/components/chat';
import { TutorialOverlay, TutorialComplete } from '@/components/tutorial';
import { LoginRewardAutoPopup } from '@/components/loginRewards';
import { ToastContainer as NotificationToastContainer } from '@/components/notifications/ToastContainer';
import { ToastContainer as UIToastContainer } from '@/components/ui/Toast';
import {
  ErrorBoundary,
  GlobalErrorDisplay,
  GameErrorFallback,
  DuelErrorFallback,
  // CombatErrorFallback, // Removed - Combat uses inline error handling
  GangErrorFallback,
  MarketplaceErrorFallback,
  PropertiesErrorFallback,
  SkillsErrorFallback,
  StatsErrorFallback,
  // ActionsErrorFallback, // Removed - Phase 7: Location-Specific Actions
  MailErrorFallback,
  SettingsErrorFallback,
  ProfileErrorFallback,
  CraftingErrorFallback,
  GatheringErrorFallback,
  // Production hardening - additional page fallbacks
  CrimesErrorFallback,
  CompanionErrorFallback,
  FishingErrorFallback,
  HuntingErrorFallback,
  TownErrorFallback,
  BankErrorFallback,
  ShopErrorFallback,
  InventoryErrorFallback,
  PageErrorFallback,
} from '@/components/errors';
import { AnimationPreferencesProvider } from '@/contexts';

// Lazy load all page components for code splitting
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const CharacterSelect = lazy(() => import('@/pages/CharacterSelect').then(m => ({ default: m.CharacterSelect })));
const Game = lazy(() => import('@/pages/Game').then(m => ({ default: m.Game })));
const Town = lazy(() => import('@/pages/Town'));
const Location = lazy(() => import('@/pages/location/LocationHub').then(m => ({ default: m.LocationHub })));
// Actions page removed - Phase 7: Location-Specific Actions
// const Actions = lazy(() => import('@/pages/Actions').then(m => ({ default: m.Actions })));
const ActionChallenge = lazy(() => import('@/pages/ActionChallenge').then(m => ({ default: m.ActionChallenge })));
const Skills = lazy(() => import('@/pages/Skills').then(m => ({ default: m.Skills })));
const SkillAcademy = lazy(() => import('@/pages/SkillAcademy').then(m => ({ default: m.SkillAcademy })));
const Stats = lazy(() => import('@/pages/Stats').then(m => ({ default: m.Stats })));
// Combat page removed - Phase 7: Location-Specific Combat
// const Combat = lazy(() => import('@/pages/Combat').then(m => ({ default: m.Combat })));
const Crimes = lazy(() => import('@/pages/Crimes').then(m => ({ default: m.Crimes })));
const Territory = lazy(() => import('@/pages/Territory').then(m => ({ default: m.Territory })));
const Gang = lazy(() => import('@/pages/Gang').then(m => ({ default: m.Gang })));
const Leaderboard = lazy(() => import('@/pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Mail = lazy(() => import('@/pages/Mail').then(m => ({ default: m.Mail })));
const Friends = lazy(() => import('@/pages/Friends').then(m => ({ default: m.Friends })));
const Inventory = lazy(() => import('@/pages/Inventory').then(m => ({ default: m.Inventory })));
const Notifications = lazy(() => import('@/pages/Notifications').then(m => ({ default: m.Notifications })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const TwoFactorSetup = lazy(() => import('@/pages/TwoFactorSetup').then(m => ({ default: m.TwoFactorSetup })));
const Shop = lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const DeckGuide = lazy(() => import('@/pages/DeckGuide').then(m => ({ default: m.DeckGuide })));
const QuestLog = lazy(() => import('@/pages/QuestLog').then(m => ({ default: m.QuestLog })));
const Help = lazy(() => import('@/pages/Help').then(m => ({ default: m.Help })));
const Achievements = lazy(() => import('@/pages/Achievements').then(m => ({ default: m.Achievements })));
const Prestige = lazy(() => import('@/pages/Prestige').then(m => ({ default: m.Prestige })));
const Tutorial = lazy(() => import('@/pages/Tutorial').then(m => ({ default: m.Tutorial })));
const Merchants = lazy(() => import('@/pages/MerchantsPage').then(m => ({ default: m.MerchantsPage })));
const Entertainers = lazy(() => import('@/pages/EntertainersPage').then(m => ({ default: m.EntertainersPage })));
const HorseRacing = lazy(() => import('@/pages/HorseRacing').then(m => ({ default: m.HorseRacing })));
const ShootingContest = lazy(() => import('@/pages/ShootingContest').then(m => ({ default: m.ShootingContest })));
const Gambling = lazy(() => import('@/pages/Gambling').then(m => ({ default: m.Gambling })));

// Gambling decomposed pages
const GamblingHub = lazy(() => import('@/pages/gambling/GamblingHub').then(m => ({ default: m.GamblingHub })));
const GamblingHistory = lazy(() => import('@/pages/gambling/GamblingHistory').then(m => ({ default: m.GamblingHistory })));
const GamblingLeaderboard = lazy(() => import('@/pages/gambling/GamblingLeaderboard').then(m => ({ default: m.GamblingLeaderboard })));
const Blackjack = lazy(() => import('@/pages/gambling/Blackjack').then(m => ({ default: m.Blackjack })));
const Roulette = lazy(() => import('@/pages/gambling/Roulette').then(m => ({ default: m.Roulette })));
const Craps = lazy(() => import('@/pages/gambling/Craps').then(m => ({ default: m.Craps })));
const Faro = lazy(() => import('@/pages/gambling/Faro').then(m => ({ default: m.Faro })));
const ThreeCardMonte = lazy(() => import('@/pages/gambling/ThreeCardMonte').then(m => ({ default: m.ThreeCardMonte })));
const WheelOfFortune = lazy(() => import('@/pages/gambling/WheelOfFortune').then(m => ({ default: m.WheelOfFortune })));
const PropertyListings = lazy(() => import('@/pages/PropertyListingsPage').then(m => ({ default: m.PropertyListingsPage })));
const MyProperties = lazy(() => import('@/pages/MyPropertiesPage').then(m => ({ default: m.MyPropertiesPage })));
const NPCGangConflict = lazy(() => import('@/pages/NPCGangConflictPage').then(m => ({ default: m.NPCGangConflictPage })));
const MentorTraining = lazy(() => import('@/pages/MentorPage').then(m => ({ default: m.MentorPage })));
const LoginRewards = lazy(() => import('@/pages/LoginRewards').then(m => ({ default: m.LoginRewards })));
const DailyContracts = lazy(() => import('@/pages/DailyContractsPage').then(m => ({ default: m.DailyContractsPage })));
const StarMap = lazy(() => import('@/pages/StarMapPage').then(m => ({ default: m.StarMapPage })));
const ZodiacCalendar = lazy(() => import('@/pages/ZodiacCalendarPage').then(m => ({ default: m.ZodiacCalendarPage })));
const Marketplace = lazy(() => import('@/pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const Bank = lazy(() => import('@/pages/Bank').then(m => ({ default: m.Bank })));
const Fishing = lazy(() => import('@/pages/Fishing').then(m => ({ default: m.Fishing })));
const Hunting = lazy(() => import('@/pages/Hunting').then(m => ({ default: m.Hunting })));
const Crafting = lazy(() => import('@/pages/Crafting').then(m => ({ default: m.Crafting })));
const Gathering = lazy(() => import('@/pages/Gathering').then(m => ({ default: m.Gathering })));
const Companion = lazy(() => import('@/pages/Companion').then(m => ({ default: m.Companion })));
const Duel = lazy(() => import('@/pages/Duel').then(m => ({ default: m.Duel })));
const DuelArena = lazy(() => import('@/pages/DuelArena'));
const Train = lazy(() => import('@/pages/Train').then(m => ({ default: m.Train })));
const TrainRobbery = lazy(() => import('@/pages/TrainRobbery').then(m => ({ default: m.TrainRobbery })));
const Stagecoach = lazy(() => import('@/pages/Stagecoach').then(m => ({ default: m.Stagecoach })));
const StagecoachAmbush = lazy(() => import('@/pages/StagecoachAmbush').then(m => ({ default: m.StagecoachAmbush })));
const WorldMap = lazy(() => import('@/pages/WorldMap').then(m => ({ default: m.WorldMap })));
const TeamCardGame = lazy(() => import('@/pages/TeamCardGame').then(m => ({ default: m.TeamCardGame })));
const Heists = lazy(() => import('@/pages/Heists').then(m => ({ default: m.Heists })));
const Raids = lazy(() => import('@/pages/Raids').then(m => ({ default: m.Raids })));
const Expeditions = lazy(() => import('@/pages/Expeditions').then(m => ({ default: m.Expeditions })));
const BountyHunting = lazy(() => import('@/pages/BountyHunting').then(m => ({ default: m.BountyHunting })));
const LegendaryHunts = lazy(() => import('@/pages/LegendaryHunts').then(m => ({ default: m.LegendaryHunts })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ArtAssetDashboard = lazy(() => import('@/pages/admin/ArtAssetDashboard').then(m => ({ default: m.ArtAssetDashboard })));
const StatusDashboard = lazy(() => import('@/pages/StatusDashboard').then(m => ({ default: m.StatusDashboard })));
const MapDemo = lazy(() => import('@/pages/MapDemo').then(m => ({ default: m.MapDemo })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

// Global flag to track if we've checked auth (persists across React StrictMode remounts)
let hasCheckedAuthGlobal = false;

/**
 * Main App component with React Router configuration
 */
function App() {
  const { checkAuth, isLoading: _isLoading, isAuthenticated, user } = useAuthStore();
  const { currentCharacter, selectCharacter } = useCharacterStore();

  // Handle auth broadcasts from other tabs
  const handleAuthBroadcast = useCallback((message: AuthBroadcastMessage) => {
    if (message.type === 'LOGOUT') {
      // Another tab logged out - clear our state without making another API call
      // Just update local state since server-side logout already happened
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      // Also clear character state
      useCharacterStore.getState().clearCharacterState();
    } else if (message.type === 'LOGIN') {
      // Another tab logged in - refresh our auth state to pick up the new session
      // Only re-check if we're not already authenticated or it's a different user
      if (!isAuthenticated || (message.userId && user?.id !== message.userId)) {
        checkAuth();
      }
    } else if (message.type === 'SESSION_EXPIRED') {
      // Session expired in another tab - force logout
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired',
      });
      useCharacterStore.getState().clearCharacterState();
    } else if (message.type === 'CHARACTER_CHANGED') {
      // Another tab selected a different character
      if (message.characterId && message.characterId !== currentCharacter?._id) {
        // Load the newly selected character
        selectCharacter(message.characterId).catch((error) => {
          console.warn('Failed to sync character from other tab:', error);
        });
      }
    }
  }, [checkAuth, isAuthenticated, user?.id, currentCharacter?._id, selectCharacter]);

  // Listen for auth events from other tabs
  useAuthBroadcast(handleAuthBroadcast);

  // Check authentication status on app load by validating session cookie with backend
  // This is the ONLY source of truth - no localStorage persistence
  useEffect(() => {
    // Skip if we've already checked (prevents double-checking in React StrictMode)
    if (hasCheckedAuthGlobal) {
      return;
    }

    hasCheckedAuthGlobal = true;

    // Only check auth if we're not already authenticated
    // This prevents checkAuth from running after login
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated]);

  // Don't show global loading screen - let pages handle their own loading states
  // This prevents blocking the login page when checkAuth is running

  return (
    <ErrorBoundary>
      <AnimationPreferencesProvider>
        <BrowserRouter>
          {/* Skip to main content link for keyboard users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <GlobalErrorDisplay />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/status" element={<StatusDashboard />} />
              <Route path="/map-demo" element={<MapDemo />} />

              {/* Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/art-assets"
                element={
                  <ProtectedRoute>
                    <ArtAssetDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/characters"
                element={
                  <ProtectedRoute>
                    <CharacterSelect />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <GameLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={
                <ErrorBoundary fallback={<PageErrorFallback pageName="Location" />}>
                  <Location />
                </ErrorBoundary>
              } />
                <Route path="dashboard" element={
                  <ErrorBoundary fallback={<GameErrorFallback />}>
                    <Game />
                  </ErrorBoundary>
                } />
                <Route path="town" element={
                  <ErrorBoundary fallback={<TownErrorFallback />}>
                    <Town />
                  </ErrorBoundary>
                } />
                <Route path="location" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Location" />}>
                    <Location />
                  </ErrorBoundary>
                } />
                {/* Actions page removed - redirects to Location (Phase 7: Location-Specific Actions) */}
                <Route path="actions" element={<Navigate to="/game/location" replace />} />
                <Route path="action-challenge" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Action Challenge" />}>
                    <ActionChallenge />
                  </ErrorBoundary>
                } />
                <Route path="skills" element={
                  <ErrorBoundary fallback={<SkillsErrorFallback />}>
                    <Skills />
                  </ErrorBoundary>
                } />
                <Route path="academy" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Skill Academy" />}>
                    <SkillAcademy />
                  </ErrorBoundary>
                } />
                <Route path="stats" element={
                  <ErrorBoundary fallback={<StatsErrorFallback />}>
                    <Stats />
                  </ErrorBoundary>
                } />
                {/* Combat page removed - redirects to Location (Phase 7: Location-Specific Combat) */}
                <Route path="combat" element={<Navigate to="/game/location" replace />} />
                <Route path="crimes" element={
                  <ErrorBoundary fallback={<CrimesErrorFallback />}>
                    <Crimes />
                  </ErrorBoundary>
                } />
                <Route path="territory" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Territory" />}>
                    <Territory />
                  </ErrorBoundary>
                } />
                <Route path="gang" element={
                  <ErrorBoundary fallback={<GangErrorFallback />}>
                    <Gang />
                  </ErrorBoundary>
                } />
                <Route path="leaderboard" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Leaderboard" />}>
                    <Leaderboard />
                  </ErrorBoundary>
                } />
                <Route path="mail" element={
                  <ErrorBoundary fallback={<MailErrorFallback />}>
                    <Mail />
                  </ErrorBoundary>
                } />
                <Route path="friends" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Friends" />}>
                    <Friends />
                  </ErrorBoundary>
                } />
                <Route path="inventory" element={
                  <ErrorBoundary fallback={<InventoryErrorFallback />}>
                    <Inventory />
                  </ErrorBoundary>
                } />
                <Route path="notifications" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Notifications" />}>
                    <Notifications />
                  </ErrorBoundary>
                } />
                <Route path="profile/:name" element={
                  <ErrorBoundary fallback={<ProfileErrorFallback />}>
                    <Profile />
                  </ErrorBoundary>
                } />
                <Route path="settings" element={
                  <ErrorBoundary fallback={<SettingsErrorFallback />}>
                    <Settings />
                  </ErrorBoundary>
                } />
                <Route path="settings/2fa-setup" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="2FA Setup" />}>
                    <TwoFactorSetup />
                  </ErrorBoundary>
                } />
                <Route path="shop" element={
                  <ErrorBoundary fallback={<ShopErrorFallback />}>
                    <Shop />
                  </ErrorBoundary>
                } />
                <Route path="deck-guide" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Deck Guide" />}>
                    <DeckGuide />
                  </ErrorBoundary>
                } />
                <Route path="quests" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Quest Log" />}>
                    <QuestLog />
                  </ErrorBoundary>
                } />
                <Route path="help" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Help" />}>
                    <Help />
                  </ErrorBoundary>
                } />
                <Route path="achievements" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Achievements" />}>
                    <Achievements />
                  </ErrorBoundary>
                } />
                <Route path="prestige" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Prestige" />}>
                    <Prestige />
                  </ErrorBoundary>
                } />
                <Route path="tutorial" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Tutorial" />}>
                    <Tutorial />
                  </ErrorBoundary>
                } />
                <Route path="merchants" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Merchants" />}>
                    <Merchants />
                  </ErrorBoundary>
                } />
                <Route path="entertainers" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Entertainers" />}>
                    <Entertainers />
                  </ErrorBoundary>
                } />
                <Route path="horse-racing" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Horse Racing" />}>
                    <HorseRacing />
                  </ErrorBoundary>
                } />
                <Route path="shooting-contest" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Shooting Contest" />}>
                    <ShootingContest />
                  </ErrorBoundary>
                } />
                {/* Gambling routes - decomposed pages */}
                <Route path="gambling" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Gambling" />}>
                    <GamblingHub />
                  </ErrorBoundary>
                } />
                <Route path="gambling/blackjack" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Blackjack" />}>
                    <Blackjack />
                  </ErrorBoundary>
                } />
                <Route path="gambling/roulette" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Roulette" />}>
                    <Roulette />
                  </ErrorBoundary>
                } />
                <Route path="gambling/craps" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Craps" />}>
                    <Craps />
                  </ErrorBoundary>
                } />
                <Route path="gambling/faro" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Faro" />}>
                    <Faro />
                  </ErrorBoundary>
                } />
                <Route path="gambling/three-card-monte" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Three Card Monte" />}>
                    <ThreeCardMonte />
                  </ErrorBoundary>
                } />
                <Route path="gambling/wheel-of-fortune" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Wheel of Fortune" />}>
                    <WheelOfFortune />
                  </ErrorBoundary>
                } />
                <Route path="gambling/history" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Gambling History" />}>
                    <GamblingHistory />
                  </ErrorBoundary>
                } />
                <Route path="gambling/leaderboard" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Gambling Leaderboard" />}>
                    <GamblingLeaderboard />
                  </ErrorBoundary>
                } />
                {/* Legacy route - redirect to new hub */}
                <Route path="gambling-old" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Gambling" />}>
                    <Gambling />
                  </ErrorBoundary>
                } />
                <Route path="property-listings" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Property Listings" />}>
                    <PropertyListings />
                  </ErrorBoundary>
                } />
                <Route path="properties" element={
                  <ErrorBoundary fallback={<PropertiesErrorFallback />}>
                    <MyProperties />
                  </ErrorBoundary>
                } />
                <Route path="npc-gangs" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="NPC Gangs" />}>
                    <NPCGangConflict />
                  </ErrorBoundary>
                } />
                <Route path="mentors" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Mentors" />}>
                    <MentorTraining />
                  </ErrorBoundary>
                } />
                <Route path="daily-rewards" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Login Rewards" />}>
                    <LoginRewards />
                  </ErrorBoundary>
                } />
                <Route path="contracts" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Daily Contracts" />}>
                    <DailyContracts />
                  </ErrorBoundary>
                } />
                <Route path="star-map" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Star Map" />}>
                    <StarMap />
                  </ErrorBoundary>
                } />
                <Route path="zodiac-calendar" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Zodiac Calendar" />}>
                    <ZodiacCalendar />
                  </ErrorBoundary>
                } />
                <Route path="marketplace" element={
                  <ErrorBoundary fallback={<MarketplaceErrorFallback />}>
                    <Marketplace />
                  </ErrorBoundary>
                } />
                <Route path="bank" element={
                  <ErrorBoundary fallback={<BankErrorFallback />}>
                    <Bank />
                  </ErrorBoundary>
                } />
                <Route path="fishing" element={
                  <ErrorBoundary fallback={<FishingErrorFallback />}>
                    <Fishing />
                  </ErrorBoundary>
                } />
                <Route path="hunting" element={
                  <ErrorBoundary fallback={<HuntingErrorFallback />}>
                    <Hunting />
                  </ErrorBoundary>
                } />
                <Route path="crafting" element={
                  <ErrorBoundary fallback={<CraftingErrorFallback />}>
                    <Crafting />
                  </ErrorBoundary>
                } />
                <Route path="gathering" element={
                  <ErrorBoundary fallback={<GatheringErrorFallback />}>
                    <Gathering />
                  </ErrorBoundary>
                } />
                <Route path="companions" element={
                  <ErrorBoundary fallback={<CompanionErrorFallback />}>
                    <Companion />
                  </ErrorBoundary>
                } />
                <Route path="duel" element={
                  <ErrorBoundary fallback={<DuelErrorFallback />}>
                    <Duel />
                  </ErrorBoundary>
                } />
                <Route path="duel/:duelId" element={
                  <ErrorBoundary fallback={<DuelErrorFallback />}>
                    <DuelArena />
                  </ErrorBoundary>
                } />
                <Route path="train" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Train" />}>
                    <Train />
                  </ErrorBoundary>
                } />
                <Route path="train-robbery" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Train Robbery" />}>
                    <TrainRobbery />
                  </ErrorBoundary>
                } />
                <Route path="stagecoach" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Stagecoach" />}>
                    <Stagecoach />
                  </ErrorBoundary>
                } />
                <Route path="stagecoach-ambush" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Stagecoach Ambush" />}>
                    <StagecoachAmbush />
                  </ErrorBoundary>
                } />
                <Route path="world-map" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="World Map" />}>
                    <WorldMap />
                  </ErrorBoundary>
                } />
                <Route path="card-games" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Card Games" />}>
                    <TeamCardGame />
                  </ErrorBoundary>
                } />
                <Route path="heists" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Heists" />}>
                    <Heists />
                  </ErrorBoundary>
                } />
                <Route path="raids" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Raids" />}>
                    <Raids />
                  </ErrorBoundary>
                } />
                <Route path="expeditions" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Expeditions" />}>
                    <Expeditions />
                  </ErrorBoundary>
                } />
                <Route path="bounty-hunting" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Bounty Hunting" />}>
                    <BountyHunting />
                  </ErrorBoundary>
                } />
                <Route path="legendary-hunts" element={
                  <ErrorBoundary fallback={<PageErrorFallback pageName="Legendary Hunts" />}>
                    <LegendaryHunts />
                  </ErrorBoundary>
                } />
              </Route>

              {/* Character Selection - Standalone Protected Route */}
              <Route
                path="/character-select"
                element={
                  <ProtectedRoute>
                    <CharacterSelect />
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>

      {/* Chat Window - Always rendered when authenticated */}
      {isAuthenticated && (
        <ErrorBoundary fallback={<ChatErrorFallback />}>
          <ChatWindow />
        </ErrorBoundary>
      )}

      {/* Login Reward Popup - Shows on login if reward available */}
      <LoginRewardAutoPopup isAuthenticated={isAuthenticated} />

      {/* Tutorial Overlay - Shown when tutorial is active (includes TutorialAutoTrigger internally) */}
      <TutorialOverlay />

      {/* Tutorial Complete - Celebration modal shown when tutorial finishes */}
      <TutorialComplete />

          {/* Toast Notifications - Server notifications */}
          <NotificationToastContainer />

          {/* UI Toasts - Action feedback toasts */}
          <UIToastContainer />
        </BrowserRouter>
      </AnimationPreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
