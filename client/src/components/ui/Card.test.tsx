/**
 * Card Component Tests
 * Comprehensive test suite for the Card component
 * Tests rendering, variants, padding, hover effects, and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h1>Title</h1>
          <p>Description</p>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders with text children', () => {
      render(<Card>Simple text content</Card>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('renders with JSX children', () => {
      render(
        <Card>
          <div data-testid="child-element">
            <span>Nested content</span>
          </div>
        </Card>
      );
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('preserves custom className with default classes', () => {
      const { container } = render(<Card className="my-custom">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('my-custom', 'rounded-lg');
    });

    it('renders as a div element', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });

  describe('Variants', () => {
    it('renders wood variant by default', () => {
      const { container } = render(<Card>Wood Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('wood-panel', 'text-desert-sand');
    });

    it('renders wood variant explicitly', () => {
      const { container } = render(<Card variant="wood">Wood Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('wood-panel', 'text-desert-sand');
    });

    it('renders leather variant', () => {
      const { container } = render(<Card variant="leather">Leather Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('leather-panel', 'text-desert-sand');
    });

    it('renders parchment variant', () => {
      const { container } = render(<Card variant="parchment">Parchment Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('parchment', 'text-western-text');
    });

    it('can switch between variants', () => {
      const { container, rerender } = render(<Card variant="wood">Card</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('wood-panel');

      rerender(<Card variant="leather">Card</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('leather-panel');

      rerender(<Card variant="parchment">Card</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('parchment');
    });

    it('maintains correct text color for each variant', () => {
      const { container, rerender } = render(<Card variant="wood">Content</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('text-desert-sand');

      rerender(<Card variant="leather">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('text-desert-sand');

      rerender(<Card variant="parchment">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('text-western-text');
    });
  });

  describe('Padding', () => {
    it('renders medium padding by default', () => {
      const { container } = render(<Card>Padded</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('renders no padding', () => {
      const { container } = render(<Card padding="none">No Padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-0');
    });

    it('renders small padding', () => {
      const { container } = render(<Card padding="sm">Small Padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('renders medium padding explicitly', () => {
      const { container } = render(<Card padding="md">Medium Padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('renders large padding', () => {
      const { container } = render(<Card padding="lg">Large Padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });

    it('can switch between padding sizes', () => {
      const { container, rerender } = render(<Card padding="sm">Card</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');

      rerender(<Card padding="lg">Card</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Hover Effects', () => {
    it('does not apply hover effects by default', () => {
      const { container } = render(<Card>No Hover</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('hover:scale-105');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('applies hover effects when hover is true', () => {
      const { container } = render(<Card hover>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:scale-105', 'hover:shadow-xl', 'cursor-pointer');
    });

    it('applies transition classes with hover', () => {
      const { container } = render(<Card hover>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('transition-transform', 'duration-200');
    });

    it('can toggle hover effect', () => {
      const { container, rerender } = render(<Card hover>Card</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');

      rerender(<Card hover={false}>Card</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Click Events', () => {
    it('handles onClick when provided', () => {
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
      const card = container.firstChild as HTMLElement;

      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks', () => {
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
      const card = container.firstChild as HTMLElement;

      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('does not error when onClick is not provided', () => {
      const { container } = render(<Card>Not Clickable</Card>);
      const card = container.firstChild as HTMLElement;

      expect(() => fireEvent.click(card)).not.toThrow();
    });

    it('works with hover and onClick together', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card hover onClick={handleClick}>
          Interactive
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(card).toHaveClass('cursor-pointer');
    });

    it('passes event to click handler', () => {
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
      const card = container.firstChild as HTMLElement;

      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Data Test ID', () => {
    it('accepts data-testid prop', () => {
      render(<Card data-testid="my-card">Content</Card>);
      expect(screen.getByTestId('my-card')).toBeInTheDocument();
    });

    it('can find card by test id', () => {
      render(<Card data-testid="unique-card">Unique Content</Card>);
      const card = screen.getByTestId('unique-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Unique Content');
    });

    it('works without data-testid', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Combination of Props', () => {
    it('combines variant and padding', () => {
      const { container } = render(
        <Card variant="leather" padding="lg">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('leather-panel', 'p-8');
    });

    it('combines variant, padding, and hover', () => {
      const { container } = render(
        <Card variant="parchment" padding="sm" hover>
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('parchment', 'p-4', 'hover:scale-105');
    });

    it('combines all props', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card
          variant="wood"
          padding="none"
          hover
          onClick={handleClick}
          className="extra-class"
          data-testid="complex-card"
        >
          Complex Card
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('wood-panel', 'p-0', 'hover:scale-105', 'extra-class');
      expect(screen.getByTestId('complex-card')).toBeInTheDocument();

      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalled();
    });

    it('maintains correct order of classes', () => {
      const { container } = render(
        <Card variant="leather" padding="md" className="custom">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      const classes = card.className;

      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('leather-panel');
      expect(classes).toContain('p-6');
      expect(classes).toContain('custom');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card>{''}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      const { container } = render(<Card>{undefined}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles null children', () => {
      const { container } = render(<Card>{null}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles boolean children', () => {
      const { container } = render(<Card>{false}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles number children', () => {
      render(<Card>{42}</Card>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles array children', () => {
      render(
        <Card>
          {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </Card>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('handles fragment children', () => {
      render(
        <Card>
          <>
            <span>First</span>
            <span>Second</span>
          </>
        </Card>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Styling and Visual', () => {
    it('has rounded corners', () => {
      const { container } = render(<Card>Rounded</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
    });

    it('applies western theme classes', () => {
      const { container } = render(<Card variant="wood">Western</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('wood-panel');
    });

    it('maintains visual consistency across variants', () => {
      const variants: Array<'wood' | 'leather' | 'parchment'> = ['wood', 'leather', 'parchment'];

      variants.forEach(variant => {
        const { container } = render(<Card variant={variant}>Content</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('rounded-lg');
      });
    });
  });

  describe('Accessibility', () => {
    it('is accessible to screen readers', () => {
      render(<Card>Accessible content</Card>);
      expect(screen.getByText('Accessible content')).toBeInTheDocument();
    });

    it('preserves semantic HTML in children', () => {
      render(
        <Card>
          <h2>Heading</h2>
          <p>Paragraph</p>
          <button>Button</button>
        </Card>
      );
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('responds to clicks when onClick is provided', () => {
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Click me</Card>);
      const card = container.firstChild as HTMLElement;

      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalled();
    });

    /**
     * CRITICAL TEST: Keyboard navigation with Enter key
     * Interactive cards must respond to keyboard events for accessibility
     */
    it('calls onClick when Enter key is pressed on interactive card', () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Keyboard accessible
        </Card>
      );
      const card = screen.getByTestId('card');

      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * CRITICAL TEST: Keyboard navigation with Space key
     */
    it('calls onClick when Space key is pressed on interactive card', () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Keyboard accessible
        </Card>
      );
      const card = screen.getByTestId('card');

      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * CRITICAL TEST: Interactive cards must have role="button" for screen readers
     */
    it('has role="button" when onClick is provided', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'button');
    });

    /**
     * CRITICAL TEST: Interactive cards must be focusable
     */
    it('has tabIndex=0 when onClick is provided', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    /**
     * Non-interactive cards should not have button role
     */
    it('does not have role="button" when onClick is not provided', () => {
      render(<Card data-testid="card">Non-interactive</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveAttribute('role', 'button');
    });

    /**
     * Non-interactive cards should not be in tab order
     */
    it('does not have tabIndex when onClick is not provided', () => {
      render(<Card data-testid="card">Non-interactive</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveAttribute('tabIndex');
    });

    /**
     * Interactive cards should have focus-visible styles
     */
    it('has focus-visible class when onClick is provided', () => {
      const { container } = render(
        <Card onClick={() => {}}>Interactive</Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('focus-visible-gold');
    });

    /**
     * Should prevent default on keyboard events to avoid scroll
     */
    it('prevents default on Enter/Space to avoid page scroll', () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');

      card.dispatchEvent(enterEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    /**
     * Should not trigger click on non-activation keys
     */
    it('does not call onClick on non-activation keys', () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');

      fireEvent.keyDown(card, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(card, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(card, { key: 'a', code: 'KeyA' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Content Layout', () => {
    it('preserves child layout', () => {
      render(
        <Card>
          <div className="flex justify-between">
            <span>Left</span>
            <span>Right</span>
          </div>
        </Card>
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('handles nested cards', () => {
      render(
        <Card data-testid="outer-card">
          <h2>Outer</h2>
          <Card data-testid="inner-card">
            <h3>Inner</h3>
          </Card>
        </Card>
      );
      expect(screen.getByTestId('outer-card')).toBeInTheDocument();
      expect(screen.getByTestId('inner-card')).toBeInTheDocument();
    });

    it('supports complex content structures', () => {
      render(
        <Card>
          <header>
            <h1>Title</h1>
          </header>
          <main>
            <p>Content</p>
          </main>
          <footer>
            <button>Action</button>
          </footer>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});
