# Storybook Setup

Phase 17: UI Polish - Component Documentation

## Installation

Run the following command to install Storybook dependencies:

```bash
npm install --save-dev @storybook/react-vite @storybook/addon-onboarding @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-a11y @storybook/blocks @storybook/test storybook
```

## Usage

Start Storybook development server:

```bash
npm run storybook
```

This will open Storybook at http://localhost:6006

Build static Storybook for deployment:

```bash
npm run build-storybook
```

## Writing Stories

Create `.stories.tsx` files next to your components:

```
src/components/ui/
├── Button.tsx
├── Button.stories.tsx  <-- Story file
├── Button.test.tsx
└── ...
```

### Story Template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props here
  },
};
```

## Configuration Files

- `main.ts` - Storybook framework configuration
- `preview.ts` - Global decorators, styles, and parameters

## Addons Included

- **Essentials** - Controls, Actions, Viewport, Backgrounds, Docs
- **A11y** - Accessibility testing
- **Interactions** - Interactive testing
- **Onboarding** - First-time setup help
