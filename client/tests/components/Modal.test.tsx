/**
 * Modal Component Tests
 * Tests modal dialog behavior and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should render title correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="My Modal Title">
        <div>Content</div>
      </Modal>
    );

    const title = screen.getByText('My Modal Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('should render children correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div data-testid="modal-content">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </div>
      </Modal>
    );

    const content = screen.getByTestId('modal-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('should render different sizes correctly', () => {
    const { rerender, container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test" size="sm">
        <div>Content</div>
      </Modal>
    );

    let modalContent = container.querySelector('.max-w-md');
    expect(modalContent).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test" size="md">
        <div>Content</div>
      </Modal>
    );
    modalContent = container.querySelector('.max-w-lg');
    expect(modalContent).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test" size="lg">
        <div>Content</div>
      </Modal>
    );
    modalContent = container.querySelector('.max-w-2xl');
    expect(modalContent).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test" size="xl">
        <div>Content</div>
      </Modal>
    );
    modalContent = container.querySelector('.max-w-4xl');
    expect(modalContent).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Accessible Modal">
        <div>Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should prevent body scroll when open', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should handle escape key press', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on escape when modal is closed', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should render with backdrop blur effect', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const backdrop = container.querySelector('.backdrop-blur-sm');
    expect(backdrop).toBeInTheDocument();
  });

  it('should render with fade-in animation', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const backdrop = container.querySelector('.animate-fade-in');
    expect(backdrop).toBeInTheDocument();
  });

  it('should render with slide-up animation for content', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const slideUp = container.querySelector('.animate-slide-up');
    expect(slideUp).toBeInTheDocument();
  });

  it('should have scrollable content area', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const scrollableArea = container.querySelector('.overflow-y-auto');
    expect(scrollableArea).toBeInTheDocument();
  });
});
