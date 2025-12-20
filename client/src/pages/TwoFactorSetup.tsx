/**
 * Two-Factor Authentication Setup Page
 * Guides user through 2FA setup with QR code and backup codes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import twoFactorService, { TwoFactorSetupResponse } from '@/services/twoFactor.service';
import { logger } from '@/services/logger.service';

type SetupStep = 'loading' | 'scan' | 'verify' | 'backup' | 'complete' | 'error';

export const TwoFactorSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>('loading');
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  // Initialize 2FA setup
  useEffect(() => {
    const initSetup = async () => {
      try {
        const data = await twoFactorService.initiateSetup();
        setSetupData(data);
        setStep('scan');
      } catch (err: any) {
        logger.error('Failed to initiate 2FA setup', err, { context: 'TwoFactorSetup' });
        setError(err.message || 'Failed to start 2FA setup');
        setStep('error');
      }
    };

    initSetup();
  }, []);

  // Handle verification code submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await twoFactorService.verifySetup(verificationCode);
      setStep('backup');
    } catch (err: any) {
      logger.error('2FA verification failed', err, { context: 'TwoFactorSetup' });
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = async () => {
    if (!setupData?.backupCodes) return;

    const codesText = setupData.backupCodes.join('\n');
    try {
      await navigator.clipboard.writeText(codesText);
      setBackupCodesCopied(true);
      setTimeout(() => setBackupCodesCopied(false), 3000);
    } catch (err) {
      logger.error('Failed to copy backup codes', err as Error, { context: 'TwoFactorSetup' });
    }
  };

  // Download backup codes as file
  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const codesText = [
      'Desperados Destiny - Two-Factor Authentication Backup Codes',
      '================================================================',
      '',
      'Store these codes in a safe place. Each code can only be used once.',
      '',
      ...setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'desperados-destiny-2fa-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Complete setup and navigate away
  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => navigate('/game/settings'), 2000);
  };

  // Cancel setup
  const handleCancel = async () => {
    try {
      await twoFactorService.cancelSetup();
    } catch (err) {
      // Ignore cancel errors
    }
    navigate('/game/settings');
  };

  // Render loading state
  if (step === 'loading') {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="leather" className="p-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-wood-dark/50 rounded-full mx-auto mb-4" />
            <p className="text-desert-sand">Setting up Two-Factor Authentication...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (step === 'error') {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="leather" className="p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-xl font-western text-gold-light mb-4">Setup Failed</h2>
          <p className="text-desert-stone mb-6">{error}</p>
          <Button onClick={() => navigate('/game/settings')}>Return to Settings</Button>
        </Card>
      </div>
    );
  }

  // Render complete state
  if (step === 'complete') {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="leather" className="p-8 text-center">
          <div className="text-green-500 text-4xl mb-4">&#10003;</div>
          <h2 className="text-xl font-western text-gold-light mb-4">2FA Enabled!</h2>
          <p className="text-desert-sand">Your account is now protected with two-factor authentication.</p>
          <p className="text-desert-stone mt-2">Redirecting to settings...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-western text-gold-light mb-6 text-center">
        Two-Factor Authentication Setup
      </h1>

      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'scan' || step === 'verify' || step === 'backup'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark text-desert-stone'
          }`}>1</span>
          <div className={`w-12 h-1 ${step === 'verify' || step === 'backup' ? 'bg-gold-light' : 'bg-wood-dark'}`} />
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'verify' || step === 'backup'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark text-desert-stone'
          }`}>2</span>
          <div className={`w-12 h-1 ${step === 'backup' ? 'bg-gold-light' : 'bg-wood-dark'}`} />
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'backup'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark text-desert-stone'
          }`}>3</span>
        </div>
      </div>

      {/* Step 1: Scan QR Code */}
      {step === 'scan' && setupData && (
        <Card variant="leather" className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-4">
            Step 1: Scan QR Code
          </h2>
          <p className="text-desert-sand mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Manual entry option */}
          <div className="mb-6">
            <p className="text-sm text-desert-stone mb-2">
              Can't scan? Enter this code manually:
            </p>
            <code className="block bg-wood-dark/50 p-3 rounded text-center text-desert-sand font-mono text-sm break-all">
              {setupData.secret}
            </code>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => setStep('verify')} className="flex-1">
              Next: Verify Code
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Verify Code */}
      {step === 'verify' && (
        <Card variant="leather" className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-4">
            Step 2: Verify Setup
          </h2>
          <p className="text-desert-sand mb-4">
            Enter the 6-digit code from your authenticator app to verify setup.
          </p>

          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-wood-dark/50 border border-wood-grain rounded px-4 py-3 text-desert-sand text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('scan')}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting}
                disabled={verificationCode.length !== 6}
              >
                Verify
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 3: Save Backup Codes */}
      {step === 'backup' && setupData && (
        <Card variant="leather" className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-4">
            Step 3: Save Backup Codes
          </h2>
          <p className="text-desert-sand mb-4">
            Save these backup codes in a safe place. You can use them to access your
            account if you lose your authenticator device.
          </p>

          <div className="bg-wood-dark/50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <code key={index} className="text-desert-sand font-mono text-center py-1">
                  {code}
                </code>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={copyBackupCodes}
              className="flex-1"
            >
              {backupCodesCopied ? 'Copied!' : 'Copy Codes'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={downloadBackupCodes}
              className="flex-1"
            >
              Download
            </Button>
          </div>

          <div className="p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg mb-6">
            <p className="text-yellow-200 text-sm">
              Each backup code can only be used once. Store them securely!
            </p>
          </div>

          <Button onClick={handleComplete} fullWidth>
            Complete Setup
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TwoFactorSetup;
