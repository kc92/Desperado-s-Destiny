/**
 * Application Entry Point
 * Initializes React application and mounts to DOM
 */

// Initialize Sentry error tracking FIRST - before any other imports
import { initializeSentry } from './config/sentry';
initializeSentry();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { logger } from './services/logger.service';
import App from './App';
import './styles/index.css';

// Initialize tutorial analytics dev tools
import { exposeAnalyticsToDevTools } from './utils/tutorialAnalytics';
import { useTutorialStore } from './store/useTutorialStore';
import { useCharacterStore } from './store/useCharacterStore';

if (import.meta.env.DEV) {
  exposeAnalyticsToDevTools();

  // Expose tutorial helpers for debugging
  (window as any).__tutorial = {
    getState: () => useTutorialStore.getState(),
    reset: () => useTutorialStore.getState().resetTutorial(),
    forceStart: () => {
      const tutorialStore = useTutorialStore.getState();
      const character = useCharacterStore.getState().currentCharacter;
      const factionId = character?.faction || 'SETTLER_ALLIANCE';
      const factionMap: Record<string, string> = {
        'SETTLER_ALLIANCE': 'intro_settler',
        'NAHI_COALITION': 'intro_nahi',
        'FRONTERA': 'intro_frontera',
      };
      const section = factionMap[factionId] || 'intro_settler';
      tutorialStore.resetTutorial();
      tutorialStore.startTutorial(section, 'core', factionId);
      console.log('[Tutorial] Force started! Section:', section, 'Faction:', factionId);
    },
    skip: () => {
      // Set tutorialCompleted to true to skip
      useTutorialStore.setState({
        tutorialCompleted: true,
        isActive: false,
        isPaused: false,
        currentSection: null
      });
      console.log('[Tutorial] Skipped!');
    },
  };
  console.log('[Dev] Tutorial helpers available at window.__tutorial (getState, reset, forceStart, skip)');
}

/**
 * Initialize and render the React application
 */
function initializeApp(): void {
  // Get root element
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Failed to find the root element');
  }

  // Create React root and render app
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Wrap app initialization in try-catch to report startup errors
try {
  initializeApp();
} catch (error) {
  logger.error('Failed to initialize application', error as Error, { context: 'main.tsx' });

  // Report to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  }

  // Show user-friendly error message
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1c1917;
      color: #fef3c7;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
    ">
      <div style="
        max-width: 500px;
        text-align: center;
        background: rgba(127, 29, 29, 0.5);
        border: 1px solid #ef4444;
        border-radius: 8px;
        padding: 2rem;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Failed to Start Application</h1>
        <p style="color: #d6d3d1; margin-bottom: 1.5rem;">
          The application failed to initialize. Please try refreshing the page.
        </p>
        <button onclick="window.location.reload()" style="
          padding: 0.75rem 1.5rem;
          background: #d97706;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        ">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
