/**
 * Header Component
 * Main navigation header for the application
 */

import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, NavLink, GameClock } from '@/components/ui';
import { NotificationBell } from '@/components/notifications';

/**
 * Application header with navigation and user menu
 * Memoized to prevent unnecessary re-renders
 */
export const Header: React.FC = React.memo(() => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

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
                <NavLink to="/game/location" exact>
                  Location
                </NavLink>

                <NavLink to="/game/actions" exact>
                  Actions
                </NavLink>

                <NavLink to="/game/skills" exact>
                  Skills
                </NavLink>

                <NavLink to="/game/combat" exact>
                  Combat
                </NavLink>

                <NavLink to="/game/gang" exact>
                  Gangs
                </NavLink>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-wood-medium">
                  {/* Notification Bell */}
                  <NotificationBell />

                  <span className="text-desert-sand font-serif text-sm">
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
