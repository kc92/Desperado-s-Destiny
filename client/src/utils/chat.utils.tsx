/**
 * Chat Utility Functions
 */

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Date(date).toLocaleDateString();
}

/**
 * Format timestamp to absolute time
 */
export function formatAbsoluteTime(date: Date): string {
  return new Date(date).toLocaleString();
}

/**
 * Get faction color
 */
export function getFactionColor(faction: 'settler' | 'nahi' | 'frontera'): string {
  const colors = {
    settler: '#8B4513',
    nahi: '#228B22',
    frontera: '#DC143C',
  };
  return colors[faction];
}

/**
 * Get faction initials background color (Tailwind class)
 */
export function getFactionBgClass(faction: 'settler' | 'nahi' | 'frontera'): string {
  const classes = {
    settler: 'bg-faction-settler',
    nahi: 'bg-faction-nahi',
    frontera: 'bg-faction-frontera',
  };
  return classes[faction];
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Parse @ mentions from message content
 */
export function parseMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Highlight @ mentions in message content
 */
export function highlightMentions(content: string, currentUsername?: string): React.ReactNode {
  const parts = content.split(/(@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      const isCurrentUser = username === currentUsername;

      return (
        <span
          key={index}
          className={`font-bold ${
            isCurrentUser ? 'bg-gold-light text-wood-dark px-1 rounded' : 'text-gold-medium'
          }`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Get room display name
 */
export function getRoomDisplayName(
  type: string,
  _id: string,
  userFaction?: string,
  gangName?: string
): string {
  switch (type) {
    case 'global':
      return 'Global Chat';
    case 'faction':
      return `${userFaction ? userFaction.charAt(0).toUpperCase() + userFaction.slice(1) : 'Faction'} Chat`;
    case 'gang':
      return gangName ? `${gangName} Chat` : 'Gang Chat';
    case 'whisper':
      return 'Whisper';
    default:
      return 'Chat';
  }
}
