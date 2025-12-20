/**
 * Two-Factor Authentication Service
 * API methods for 2FA setup, verification, and management
 */

import { apiCall } from './api';

/**
 * 2FA setup response with QR code and backup codes
 */
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * 2FA status response
 */
export interface TwoFactorStatusResponse {
  enabled: boolean;
  pendingSetup: boolean;
}

/**
 * Get current 2FA status for the user
 */
export async function getStatus(): Promise<TwoFactorStatusResponse> {
  const response = await apiCall<{ data: TwoFactorStatusResponse }>('get', '/auth/2fa/status');
  return response.data;
}

/**
 * Initiate 2FA setup - returns QR code and backup codes
 */
export async function initiateSetup(): Promise<TwoFactorSetupResponse> {
  const response = await apiCall<{ data: TwoFactorSetupResponse }>('get', '/auth/2fa/setup');
  return response.data;
}

/**
 * Verify setup and enable 2FA
 */
export async function verifySetup(token: string): Promise<void> {
  await apiCall<void>('post', '/auth/2fa/verify-setup', { token });
}

/**
 * Verify 2FA token during login
 */
export async function verifyToken(token: string): Promise<{ user: any }> {
  const response = await apiCall<{ user: any }>('post', '/auth/2fa/verify', { token });
  return response;
}

/**
 * Complete 2FA login with token
 */
export async function complete2FALogin(token: string): Promise<{ user: any }> {
  const response = await apiCall<{ user: any }>('post', '/auth/2fa/complete-login', { token });
  return response;
}

/**
 * Cancel pending 2FA setup
 */
export async function cancelSetup(): Promise<void> {
  await apiCall<void>('post', '/auth/2fa/cancel-setup');
}

/**
 * Disable 2FA (requires password)
 */
export async function disable(password: string): Promise<void> {
  await apiCall<void>('post', '/auth/2fa/disable', { password });
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
  const response = await apiCall<{ data: { backupCodes: string[] } }>('post', '/auth/2fa/backup-codes');
  return response.data;
}

const twoFactorService = {
  getStatus,
  initiateSetup,
  verifySetup,
  verifyToken,
  complete2FALogin,
  cancelSetup,
  disable,
  regenerateBackupCodes,
};

export default twoFactorService;
