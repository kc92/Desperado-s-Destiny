/**
 * Button Component Stories
 * Phase 17: UI Polish - Component Documentation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Western-styled button component with multiple variants, sizes, and states.

## Features
- 4 variants: primary, secondary, danger, ghost
- 3 sizes: sm, md, lg
- Icon support (before and after text)
- Loading state with spinner
- Touch-optimized for mobile
- Full accessibility support

## Usage
\`\`\`tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Click Me
</Button>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes button full width',
    },
    children: {
      control: 'text',
      description: 'Button text content',
    },
    loadingText: {
      control: 'text',
      description: 'Text shown during loading state',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// VARIANT STORIES
// =============================================================================

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

// =============================================================================
// SIZE STORIES
// =============================================================================

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// =============================================================================
// STATE STORIES
// =============================================================================

export const Loading: Story = {
  args: {
    isLoading: true,
    loadingText: 'Saving...',
    children: 'Save',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// =============================================================================
// ICON STORIES
// =============================================================================

export const WithIcon: Story = {
  args: {
    icon: '⭐',
    children: 'With Icon',
  },
};

export const WithIconAfter: Story = {
  args: {
    iconAfter: '→',
    children: 'Continue',
  },
};

export const IconBothSides: Story = {
  args: {
    icon: '🔥',
    iconAfter: '💥',
    children: 'Action',
  },
};

// =============================================================================
// COMBINATION STORIES
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
    </div>
  ),
};
