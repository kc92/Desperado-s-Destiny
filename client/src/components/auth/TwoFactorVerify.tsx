/**
 * Two-Factor Authentication Verification Modal
 * Shown during login when user has 2FA enabled
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import twoFactorService from '@/services/twoFactor.service';
import { logger } from '@/services/logger.service';

interface TwoFactorVerifyProps {
  /** Called when verification is successful with the user data */
  onSuccess: (user: any) => void;
  /** Called when user cancels verification */
  onCancel: () => void;
  /** Whether the modal is visible */
  isOpen: boolean;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  onSuccess,
  onCancel,
  isOpen,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setUseBackupCode(false);
    }
  }, [isOpen]);

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (useBackupCode) {
      // Backup codes: allow alphanumeric and hyphens, max 9 chars (XXXX-XXXX)
      const sanitized = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      setCode(sanitized.slice(0, 9));
    } else {
      // TOTP codes: digits only, max 6
      const sanitized = value.replace(/\D/g, '');
      setCode(sanitized.slice(0, 6));
    }

    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expectedLength = useBackupCode ? 9 : 6;
    if (code.length < expectedLength) {
      setError(useBackupCode
        ? 'Please enter a valid backup code (XXXX-XXXX)'
        : 'Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await twoFactorService.complete2FALogin(code);
      onSuccess(response.user);
    } catch (err: any) {
      logger.error('2FA verification failed', err, { context: 'TwoFactorVerify' });
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle between TOTP and backup code mode
  const toggleMode = () => {
    setUseBackupCode(!useBackupCode);
    setCode('');
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card variant="leather" className="w-full max-w-md p-6">
        <h2 className="text-2xl font-western text-gold-light mb-2 text-center">
          Two-Factor Authentication
        </h2>
        <p className="text-desert-sand text-center mb-6">
          {useBackupCode
            ? 'Enter one of your backup codes'
            : 'Enter the code from your authenticator app'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              className="w-full bg-wood-dark/50 border border-wood-grain rounded px-4 py-3 text-desert-sand text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              inputMode={useBackupCode ? 'text' : 'numeric'}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={code.length < (useBackupCode ? 9 : 6)}
            >
              Verify
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-desert-stone hover:text-gold-light transition-colors"
            >
              {useBackupCode
                ? 'Use authenticator app instead'
                : 'Use a backup code instead'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TwoFactorVerify;
