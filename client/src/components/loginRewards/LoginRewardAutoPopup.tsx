/**
 * LoginRewardAutoPopup Component
 * Phase B - Competitor Parity Plan
 *
 * Auto-showing popup wrapper that integrates with the main app
 * Manages its own visibility state and checks for rewards on mount
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginRewardPopup } from './LoginRewardPopup';

interface LoginRewardAutoPopupProps {
  isAuthenticated: boolean;
}

// Session storage key to track if we've shown the popup this session
const SESSION_KEY = 'loginRewardPopupShown';

export const LoginRewardAutoPopup: React.FC<LoginRewardAutoPopupProps> = ({
  isAuthenticated
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Check if we should show the popup
  useEffect(() => {
    // Only show on game routes, not on character selection
    const isGameRoute = location.pathname.startsWith('/game');

    // Check if we've already shown it this session
    const alreadyShown = sessionStorage.getItem(SESSION_KEY) === 'true';

    if (isAuthenticated && isGameRoute && !alreadyShown && !dismissed) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location.pathname, dismissed]);

  const handleClose = () => {
    setShowPopup(false);
    setDismissed(true);
    // Mark as shown for this session
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  if (!showPopup) return null;

  return (
    <LoginRewardPopup
      onClose={handleClose}
      autoShow={true}
    />
  );
};

export default LoginRewardAutoPopup;
