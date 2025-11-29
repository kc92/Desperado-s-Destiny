/**
 * Button Component Tests
 * Comprehensive test suite for the Button component
 * Tests rendering, variants, sizes, states, interactions, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Button>Test Button Text</Button>);
      expect(screen.getByText('Test Button Text')).toBeInTheDocument();
    });

    it('renders with JSX children', () => {
      render(
        <Button>
          <span data-testid="icon">Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(<Button>Base Styles</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-western', 'font-semibold', 'uppercase', 'tracking-wider');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('preserves custom className with default classes', () => {
      render(<Button className="my-custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class', 'btn-western');
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-leather-brown', 'hover:bg-leather-saddle', 'text-desert-sand');
    });

    it('renders primary variant explicitly', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-leather-brown', 'text-desert-sand', 'border-wood-dark');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gold-medium', 'hover:bg-gold-dark', 'text-wood-dark');
    });

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blood-red', 'hover:bg-blood-dark', 'text-desert-sand');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'hover:bg-wood-light/20', 'text-wood-dark');
    });

    it('can switch between variants', () => {
      const { rerender } = render(<Button variant="primary">Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-leather-brown');

      rerender(<Button variant="danger">Button</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blood-red');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-3', 'px-6', 'text-base');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-2', 'px-4', 'text-sm');
    });

    it('renders medium size explicitly', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-3', 'px-6', 'text-base');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-4', 'px-8', 'text-lg');
    });

    it('can switch between sizes', () => {
      const { rerender } = render(<Button size="sm">Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('py-2', 'px-4', 'text-sm');

      rerender(<Button size="lg">Button</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('py-4', 'px-8', 'text-lg');
    });
  });

  describe('Width', () => {
    it('does not render full width by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('renders full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('can toggle full width', () => {
      const { rerender } = render(<Button fullWidth>Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');

      rerender(<Button fullWidth={false}>Button</Button>);
      button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Disabled State', () => {
    it('is not disabled by default', () => {
      render(<Button>Enabled</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not trigger click when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents all events when disabled', () => {
      const handleClick = vi.fn();
      const handleMouseDown = vi.fn();
      render(
        <Button onClick={handleClick} onMouseDown={handleMouseDown} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.mouseDown(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(handleMouseDown).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('is not loading by default', () => {
      render(<Button>Not Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy', 'true');
    });

    it('shows loading state', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });

    it('displays default loading text', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('displays custom loading text', () => {
      render(<Button isLoading loadingText="Submitting...">Submit</Button>);
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('renders loading spinner', () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('uses correct spinner size for small button', () => {
      const { container } = render(<Button size="sm" isLoading>Loading</Button>);
      const spinner = container.querySelector('.w-3.h-3');
      expect(spinner).toBeInTheDocument();
    });

    it('uses correct spinner size for medium button', () => {
      const { container } = render(<Button size="md" isLoading>Loading</Button>);
      const spinner = container.querySelector('.w-4.h-4');
      expect(spinner).toBeInTheDocument();
    });

    it('uses correct spinner size for large button', () => {
      const { container } = render(<Button size="lg" isLoading>Loading</Button>);
      const spinner = container.querySelector('.w-5.h-5');
      expect(spinner).toBeInTheDocument();
    });

    it('does not trigger click when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} isLoading>Loading</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies loading styles', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('spinner has aria-hidden attribute', () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Click Events', () => {
    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('passes event to click handler', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('HTML Attributes', () => {
    it('accepts and applies type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('does not set type attribute by default', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      // Button component doesn't set a default type attribute
      expect(button).not.toHaveAttribute('type');
    });

    it('accepts data attributes', () => {
      render(<Button data-testid="my-button" data-custom="value">Button</Button>);
      const button = screen.getByTestId('my-button');
      expect(button).toHaveAttribute('data-custom', 'value');
    });

    it('accepts aria attributes', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('accepts id attribute', () => {
      render(<Button id="unique-button">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'unique-button');
    });

    it('accepts name attribute', () => {
      render(<Button name="submit-button">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'submit-button');
    });

    it('accepts form attribute', () => {
      render(<Button form="my-form">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
    });
  });

  describe('Accessibility', () => {
    it('has proper role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('sets aria-busy when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Button>Not Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('is discoverable by accessible name', () => {
      render(<Button>Find Me</Button>);
      expect(screen.getByRole('button', { name: 'Find Me' })).toBeInTheDocument();
    });

    it('respects aria-label', () => {
      render(<Button aria-label="Custom Accessible Name">Button</Button>);
      expect(screen.getByRole('button', { name: 'Custom Accessible Name' })).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('can be focused via ref', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('can access button methods via ref', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<Button>{undefined}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles both disabled and loading states', () => {
      render(<Button disabled isLoading>Both States</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('maintains correct styles with multiple props', () => {
      render(
        <Button variant="danger" size="lg" fullWidth isLoading className="custom">
          Complex
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blood-red', 'py-4', 'px-8', 'w-full', 'opacity-50', 'custom');
    });
  });

  describe('Animation Classes', () => {
    it('includes transition classes', () => {
      render(<Button>Animated</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-200');
    });
  });
});
