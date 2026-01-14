/**
 * Ads Module
 * Export all ad-related functionality
 */

export * from './AdProvider';
export * from './MockAdProvider';
export * from './GoogleIMAProvider';
export * from './AdManager';

// Default export is the ad manager getter
export { getAdManager as default } from './AdManager';
