/**
 * Global Error Display Component
 * Renders all active API errors in a fixed position
 */

import React from 'react';
import { useErrorStore } from '@/store/useErrorStore';
import { ApiErrorAlert } from './ApiErrorAlert';

export const GlobalErrorDisplay: React.FC = () => {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      aria-label="Error notifications"
    >
      {errors.map((error) => (
        <ApiErrorAlert
          key={error.id}
          error={error}
          onDismiss={removeError}
        />
      ))}
    </div>
  );
};
