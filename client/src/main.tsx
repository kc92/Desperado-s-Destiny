/**
 * Application Entry Point
 * Initializes React application and mounts to DOM
 */

// Initialize Sentry error tracking FIRST - before any other imports
import { initializeSentry } from './config/sentry';
initializeSentry();

// React import used in comments for StrictMode
// import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Initialize tutorial analytics dev tools
import { exposeAnalyticsToDevTools } from './utils/tutorialAnalytics';
if (import.meta.env.DEV) {
  exposeAnalyticsToDevTools();
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
  // StrictMode temporarily disabled to debug infinite render loop
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
      <App />
    // </React.StrictMode>
  );
}

// Wrap app initialization in try-catch to report startup errors
try {
  initializeApp();
} catch (error) {
  console.error('Failed to initialize application:', error);

  // Report to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(error);
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
