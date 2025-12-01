/**
 * Header Component
 * Main navigation header for the application
 */

import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, NavLink, GameClock } from '@/components/ui';
import { NotificationBell } from '@/components/notifications';
import { useTutorialStore } from '@/store/useTutorialStore';
import { completeTutorialAction } from '@/utils/tutorialActionHandlers';

/**
 * Application header with navigation and user menu
 * Memoized to prevent unnecessary re-renders
 */
export const Header: React.FC = React.memo(() => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { isActive, getCurrentStep } = useTutorialStore();

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  // Handle navigation clicks for tutorial actions
  const handleNavLinkClick = useCallback((actionId: string, path: string) => {
    if (isActive && getCurrentStep()?.requiresAction === actionId) {
      completeTutorialAction(actionId);
    }
    navigate(path);
  }, [isActive, getCurrentStep, navigate]);

  // Handle dashboard click for tutorial action
  const handleDashboardClick = useCallback(() => {
    if (isActive && getCurrentStep()?.requiresAction === 'click-dashboard') {
      completeTutorialAction('click-dashboard');
    }
  }, [isActive, getCurrentStep]);

  return (
    <header className="bg-wood-dark border-b-4 border-wood-medium shadow-wood">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="text-4xl text-gold-light group-hover:text-gold-medium transition-colors">
              ★
            </div>
            <div>
              <h1 className="text-2xl font-western text-desert-sand text-shadow-dark group-hover:text-gold-light transition-colors">
                Desperados Destiny
              </h1>
              <p className="text-xs text-desert-stone uppercase tracking-wider">
                Sangre Territory • 1875
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Game Clock - visible when authenticated */}
                <GameClock showIcon={true} compact={false} />

                {/* Authenticated navigation with active route indicators */}
                <NavLink to="/game/location" exact onClick={() => handleNavLinkClick('navigate-location', '/game/location')}>
                  Location
                </NavLink>

                <NavLink to="/game/actions" exact onClick={() => handleNavLinkClick('navigate-jobs', '/game/actions')}>
                  Actions
                </NavLink>

                <NavLink to="/game/skills" exact onClick={() => handleNavLinkClick('navigate-skills', '/game/skills')}>
                  Skills
                </NavLink>

                <NavLink to="/game/combat" exact onClick={() => handleNavLinkClick('navigate-combat', '/game/combat')}>
                  Combat
                </NavLink>

                <NavLink to="/game/gang" exact onClick={() => handleNavLinkClick('navigate-gang', '/game/gang')}>
                  Gangs
                </NavLink>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-wood-medium">
                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* Hidden Character Info Button for Tutorial */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => completeTutorialAction('open-character-panel')}
                    className="hidden" // Hidden by default
                    data-tutorial-target="character-panel-button"
                  >
                    Character Info
                  </Button>

                  <span
                    className="text-desert-sand font-serif text-sm cursor-pointer"
                    onClick={handleDashboardClick}
                    data-tutorial-target="dashboard-stats"
                  >
                    {user?.email}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Guest navigation */}
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>

                <Link to="/register">
                  <Button variant="secondary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
});

// Display name for React DevTools
Header.displayName = 'Header';

export default Header;
