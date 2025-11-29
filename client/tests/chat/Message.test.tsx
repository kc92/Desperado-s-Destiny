/**
 * Message Component Tests
 *
 * Tests for individual message display component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Message } from '@/components/chat/Message';
import type { ChatMessage } from '@desperados/shared';

const mockMessage: ChatMessage = {
  _id: 'msg1',
  roomType: 'global' as any,
  roomId: 'global',
  type: 'chat',
  senderId: 'user1',
  senderName: 'TestUser',
  senderFaction: 'settler',
  content: 'Hello world!',
  createdAt: new Date('2024-01-01T12:00:00Z'),
};

const defaultProps = {
  message: mockMessage,
  isGrouped: false,
  currentUsername: 'CurrentUser',
  timestampFormat: 'relative' as const,
  onReport: vi.fn(),
  onWhisper: vi.fn(),
};

describe('Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render message content', () => {
      render(<Message {...defaultProps} />);
      expect(screen.getByText('Hello world!')).toBeInTheDocument();
    });

    it('should render sender name when not grouped', () => {
      render(<Message {...defaultProps} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('should not render sender name when grouped', () => {
      render(<Message {...defaultProps} isGrouped={true} />);
      expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
    });

    it('should render avatar when not grouped', () => {
      render(<Message {...defaultProps} />);
      const avatar = screen.getByLabelText("TestUser's avatar");
      expect(avatar).toBeInTheDocument();
    });

    it('should not render avatar when grouped', () => {
      render(<Message {...defaultProps} isGrouped={true} />);
      const avatar = screen.queryByLabelText("TestUser's avatar");
      expect(avatar).not.toBeInTheDocument();
    });

    it('should render relative timestamp', () => {
      render(<Message {...defaultProps} timestampFormat="relative" />);
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });

    it('should render absolute timestamp', () => {
      render(<Message {...defaultProps} timestampFormat="absolute" />);
      const timestamp = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(timestamp).toBeInTheDocument();
    });

    it('should show edited indicator when message is edited', () => {
      const editedMessage = { ...mockMessage, edited: true };
      render(<Message {...defaultProps} message={editedMessage} />);
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  describe('System Messages', () => {
    it('should render system message differently', () => {
      const systemMessage = {
        ...mockMessage,
        type: 'system' as const,
        content: 'User joined the room',
      };

      render(<Message {...defaultProps} message={systemMessage} />);

      expect(screen.getByText('User joined the room')).toBeInTheDocument();
      expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
    });
  });

  describe('Mentions', () => {
    it('should highlight mentioned users', () => {
      const messageWithMention = {
        ...mockMessage,
        content: 'Hey @CurrentUser how are you?',
      };

      render(<Message {...defaultProps} message={messageWithMention} />);

      const mention = screen.getByText('@CurrentUser');
      expect(mention).toHaveClass('bg-gold-light');
    });

    it('should not highlight mentions for other users', () => {
      const messageWithMention = {
        ...mockMessage,
        content: 'Hey @OtherUser how are you?',
      };

      render(<Message {...defaultProps} message={messageWithMention} />);

      const mention = screen.getByText('@OtherUser');
      expect(mention).toHaveClass('text-gold-medium');
      expect(mention).not.toHaveClass('bg-gold-light');
    });
  });

  describe('Context Menu', () => {
    it('should show context menu on right click', () => {
      render(<Message {...defaultProps} />);

      const messageElement = screen.getByRole('article');
      fireEvent.contextMenu(messageElement);

      expect(screen.getByText('Copy Message')).toBeInTheDocument();
    });

    it('should copy message to clipboard', () => {
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');

      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));
      fireEvent.click(screen.getByText('Copy Message'));

      expect(clipboardSpy).toHaveBeenCalledWith('Hello world!');
    });

    it('should show whisper option for other users messages', () => {
      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));

      expect(screen.getByText('Send Whisper')).toBeInTheDocument();
    });

    it('should not show whisper option for own messages', () => {
      render(<Message {...defaultProps} currentUsername="TestUser" />);

      fireEvent.contextMenu(screen.getByRole('article'));

      expect(screen.queryByText('Send Whisper')).not.toBeInTheDocument();
    });

    it('should call onWhisper when clicking whisper option', () => {
      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));
      fireEvent.click(screen.getByText('Send Whisper'));

      expect(defaultProps.onWhisper).toHaveBeenCalledWith('user1', 'TestUser');
    });

    it('should show report option for other users messages', () => {
      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));

      expect(screen.getByText('Report Message')).toBeInTheDocument();
    });

    it('should not show report option for own messages', () => {
      render(<Message {...defaultProps} currentUsername="TestUser" />);

      fireEvent.contextMenu(screen.getByRole('article'));

      expect(screen.queryByText('Report Message')).not.toBeInTheDocument();
    });

    it('should call onReport when clicking report option', () => {
      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));
      fireEvent.click(screen.getByText('Report Message'));

      expect(defaultProps.onReport).toHaveBeenCalledWith('msg1');
    });

    it('should close context menu when clicking outside', () => {
      render(<Message {...defaultProps} />);

      fireEvent.contextMenu(screen.getByRole('article'));
      expect(screen.getByText('Copy Message')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('Copy Message')).not.toBeInTheDocument();
    });
  });

  describe('Faction Styling', () => {
    it('should apply settler faction color', () => {
      render(<Message {...defaultProps} />);
      const username = screen.getByText('TestUser');
      expect(username).toHaveStyle({ color: '#8B4513' });
    });

    it('should apply nahi faction color', () => {
      const nahiMessage = { ...mockMessage, senderFaction: 'nahi' as const };
      render(<Message {...defaultProps} message={nahiMessage} />);
      const username = screen.getByText('TestUser');
      expect(username).toHaveStyle({ color: '#228B22' });
    });

    it('should apply frontera faction color', () => {
      const fronteraMessage = { ...mockMessage, senderFaction: 'frontera' as const };
      render(<Message {...defaultProps} message={fronteraMessage} />);
      const username = screen.getByText('TestUser');
      expect(username).toHaveStyle({ color: '#DC143C' });
    });

    it('should apply faction color to avatar', () => {
      render(<Message {...defaultProps} />);
      const avatar = screen.getByLabelText("TestUser's avatar");
      expect(avatar).toHaveClass('bg-faction-settler');
    });
  });
});
