/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui';
import type { ProtectedRouteProps } from '@/types';

/**
 * Protected route wrapper - redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  // CRITICAL: Wait for hydration to complete before checking auth
  // This prevents the race condition where we check auth before persisted state loads
  if (!_hasHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Add state to remember where user was trying to go
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
