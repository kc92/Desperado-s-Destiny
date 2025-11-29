/**
 * Auth Debug Page
 * Debug auth state and persistence
 */

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const AuthDebug: React.FC = () => {
  const authState = useAuthStore();

  useEffect(() => {
    // Auth state is displayed in the UI below
  }, [authState]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Auth Debug Page</h1>
      <h2>Current Auth State:</h2>
      <pre>{JSON.stringify({
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading: authState.isLoading,
        error: authState.error
      }, null, 2)}</pre>

      <h2>localStorage:</h2>
      <pre>{localStorage.getItem('auth-store')}</pre>
    </div>
  );
};

export default AuthDebug;