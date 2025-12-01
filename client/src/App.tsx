/**
 * App Component
 * Main application component with routing configuration
 */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GameLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';
import { ChatWindow } from '@/components/chat';
import { TutorialOverlay, TutorialAutoTrigger } from '@/components/tutorial';
import { LoginRewardAutoPopup } from '@/components/loginRewards';
import { ToastContainer as NotificationToastContainer } from '@/components/notifications/ToastContainer';
import { ToastContainer as UIToastContainer } from '@/components/ui/Toast';
import { ErrorBoundary, GlobalErrorDisplay } from '@/components/errors';
import { AnimationPreferencesProvider } from '@/contexts';

// Lazy load all page components for code splitting
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const AuthDebug = lazy(() => import('@/pages/AuthDebug').then(m => ({ default: m.AuthDebug })));
const CharacterSelect = lazy(() => import('@/pages/CharacterSelect').then(m => ({ default: m.CharacterSelect })));
const Game = lazy(() => import('@/pages/Game').then(m => ({ default: m.Game })));
const Town = lazy(() => import('@/pages/Town'));
const Location = lazy(() => import('@/pages/Location').then(m => ({ default: m.Location })));
const Actions = lazy(() => import('@/pages/Actions').then(m => ({ default: m.Actions })));
const ActionChallenge = lazy(() => import('@/pages/ActionChallenge').then(m => ({ default: m.ActionChallenge })));
const Skills = lazy(() => import('@/pages/Skills').then(m => ({ default: m.Skills })));
const Combat = lazy(() => import('@/pages/Combat').then(m => ({ default: m.Combat })));
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
const Shop = lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const DeckGuide = lazy(() => import('@/pages/DeckGuide').then(m => ({ default: m.DeckGuide })));
const QuestLog = lazy(() => import('@/pages/QuestLog').then(m => ({ default: m.QuestLog })));
const Help = lazy(() => import('@/pages/Help').then(m => ({ default: m.Help })));
const Achievements = lazy(() => import('@/pages/Achievements').then(m => ({ default: m.Achievements })));
const Tutorial = lazy(() => import('@/pages/Tutorial').then(m => ({ default: m.Tutorial })));
const Merchants = lazy(() => import('@/pages/MerchantsPage').then(m => ({ default: m.MerchantsPage })));
const Entertainers = lazy(() => import('@/pages/EntertainersPage').then(m => ({ default: m.EntertainersPage })));
const HorseRacing = lazy(() => import('@/pages/HorseRacing').then(m => ({ default: m.HorseRacing })));
const ShootingContest = lazy(() => import('@/pages/ShootingContest').then(m => ({ default: m.ShootingContest })));
const Gambling = lazy(() => import('@/pages/Gambling').then(m => ({ default: m.Gambling })));
const PropertyListings = lazy(() => import('@/pages/PropertyListingsPage').then(m => ({ default: m.PropertyListingsPage })));
const MyProperties = lazy(() => import('@/pages/MyPropertiesPage').then(m => ({ default: m.MyPropertiesPage })));
const NPCGangConflict = lazy(() => import('@/pages/NPCGangConflictPage').then(m => ({ default: m.NPCGangConflictPage })));
const MentorTraining = lazy(() => import('@/pages/MentorPage').then(m => ({ default: m.MentorPage })));
const LoginRewards = lazy(() => import('@/pages/LoginRewards').then(m => ({ default: m.LoginRewards })));
const DailyContracts = lazy(() => import('@/pages/DailyContractsPage').then(m => ({ default: m.DailyContractsPage })));
const StarMap = lazy(() => import('@/pages/StarMapPage').then(m => ({ default: m.StarMapPage })));
const ZodiacCalendar = lazy(() => import('@/pages/ZodiacCalendarPage').then(m => ({ default: m.ZodiacCalendarPage })));
const Marketplace = lazy(() => import('@/pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

// Global flag to track if we've checked auth (persists across React StrictMode remounts)
let hasCheckedAuthGlobal = false;

/**
 * Main App component with React Router configuration
 */
function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

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

              {/* Debug Route */}
              <Route path="/auth-debug" element={<AuthDebug />} />

              {/* Admin Route - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
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
                <Route index element={<Location />} />
                <Route path="dashboard" element={<Game />} />
                <Route path="town" element={<Town />} />
                <Route path="location" element={<Location />} />
                <Route path="actions" element={<Actions />} />
                <Route path="action-challenge" element={<ActionChallenge />} />
                <Route path="skills" element={<Skills />} />
                <Route path="combat" element={<Combat />} />
                <Route path="crimes" element={<Crimes />} />
                <Route path="territory" element={<Territory />} />
                <Route path="gang" element={<Gang />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="mail" element={<Mail />} />
                <Route path="friends" element={<Friends />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile/:name" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="shop" element={<Shop />} />
                <Route path="deck-guide" element={<DeckGuide />} />
                <Route path="quests" element={<QuestLog />} />
                <Route path="help" element={<Help />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="tutorial" element={<Tutorial />} />
                <Route path="merchants" element={<Merchants />} />
                <Route path="entertainers" element={<Entertainers />} />
                <Route path="horse-racing" element={<HorseRacing />} />
                <Route path="shooting-contest" element={<ShootingContest />} />
                <Route path="gambling" element={<Gambling />} />
                <Route path="property-listings" element={<PropertyListings />} />
                <Route path="properties" element={<MyProperties />} />
                <Route path="npc-gangs" element={<NPCGangConflict />} />
                <Route path="mentors" element={<MentorTraining />} />
                <Route path="daily-rewards" element={<LoginRewards />} />
                <Route path="contracts" element={<DailyContracts />} />
                <Route path="star-map" element={<StarMap />} />
                <Route path="zodiac-calendar" element={<ZodiacCalendar />} />
                <Route path="marketplace" element={<Marketplace />} />
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
      {isAuthenticated && <ChatWindow />}

      {/* Login Reward Popup - Shows on login if reward available */}
      <LoginRewardAutoPopup isAuthenticated={isAuthenticated} />

      {/* Tutorial Overlay - Shown when tutorial is active */}
      <TutorialOverlay />

      {/* Tutorial Auto-Trigger - Detects new players and prompts for tutorial */}
      <TutorialAutoTrigger />

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
