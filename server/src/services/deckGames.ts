/**
 * DeckGames Service - Re-export
 *
 * This file has been refactored into modular components.
 * All functionality is now in ./deckGames/ directory.
 *
 * Original: 3,143 lines
 * Now: Modular structure with focused modules
 *
 * Import directly from './deckGames' for the same API.
 */

// Re-export everything from the modular structure
export * from './deckGames/index';

// Default export for backwards compatibility
import deckGamesDefault from './deckGames/index';
export default deckGamesDefault;
