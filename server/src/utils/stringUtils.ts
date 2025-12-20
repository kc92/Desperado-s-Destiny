/**
 * String Utilities
 * Safe string manipulation functions
 *
 * Phase 0 Foundation - Used by chatHandlers, adminCommands, and other services
 */

/**
 * Escape special regex characters to prevent injection
 *
 * SECURITY: This prevents regex denial-of-service (ReDoS) attacks
 * and ensures user input cannot modify query behavior.
 *
 * @param str - User input to escape
 * @returns Escaped string safe for RegExp constructor
 *
 * @example
 * // User input "test.*" becomes "test\\.\\*"
 * escapeRegex("test.*") // => "test\\.\\*"
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create case-insensitive exact match regex safely
 *
 * Use this instead of `new RegExp(\`^${userInput}$\`, 'i')`
 * to prevent regex injection attacks.
 *
 * @param str - String to match exactly
 * @returns RegExp that matches string case-insensitively
 *
 * @example
 * createExactMatchRegex("PlayerName") // matches "playername", "PLAYERNAME", etc.
 */
export function createExactMatchRegex(str: string): RegExp {
  return new RegExp(`^${escapeRegex(str)}$`, 'i');
}

/**
 * Create case-insensitive contains regex safely
 *
 * Use this for search functionality instead of raw user input.
 *
 * @param str - String to search for
 * @returns RegExp that matches if string is contained (case-insensitive)
 *
 * @example
 * createContainsRegex("Player") // matches "SomePlayerHere", "player123", etc.
 */
export function createContainsRegex(str: string): RegExp {
  return new RegExp(escapeRegex(str), 'i');
}

/**
 * Truncate string with ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length including ellipsis (minimum 4)
 * @returns Truncated string with "..." if longer than maxLength
 *
 * @example
 * truncate("Hello World", 8) // => "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (maxLength < 4) maxLength = 4; // Minimum to fit "X..."
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Sanitize string for display (remove control characters)
 *
 * Removes invisible characters that could be used for:
 * - UI spoofing (zero-width characters making names appear similar)
 * - Breaking layouts (newlines, tabs in unexpected places)
 *
 * @param str - String to sanitize
 * @returns String with control characters removed
 */
export function sanitizeDisplayString(str: string): string {
  // Remove control characters (0x00-0x1F, 0x7F-0x9F) except space
  // Remove zero-width characters (0x200B-0x200D, 0xFEFF)
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

/**
 * Normalize whitespace in a string
 *
 * Replaces multiple consecutive whitespace with single space.
 * Useful for normalizing user input before comparison.
 *
 * @param str - String to normalize
 * @returns String with normalized whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string is empty or only whitespace
 *
 * @param str - String to check
 * @returns true if empty or only whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

export default {
  escapeRegex,
  createExactMatchRegex,
  createContainsRegex,
  truncate,
  sanitizeDisplayString,
  normalizeWhitespace,
  isBlank
};
