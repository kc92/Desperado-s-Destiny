/**
 * Storybook Preview Configuration
 * Phase 17: UI Polish - Documentation & Component Library
 */

import type { Preview } from '@storybook/react';

// Import global styles
import '../src/styles/index.css';
import '../src/styles/theme.css';
import '../src/styles/animations.css';
import '../src/styles/mobile.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'western-dark',
      values: [
        {
          name: 'western-dark',
          value: '#1a1a1a',
        },
        {
          name: 'western-light',
          value: '#F5F5DC',
        },
        {
          name: 'wood',
          value: '#3E2723',
        },
        {
          name: 'desert',
          value: '#E6D5B8',
        },
      ],
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
