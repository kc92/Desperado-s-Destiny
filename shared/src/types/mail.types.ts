/**
 * Mail Types
 *
 * Shared types for mail system
 */

export interface Mail {
  _id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;

  subject: string;
  body: string;

  goldAttachment: number;
  goldClaimed: boolean;

  isRead: boolean;
  readAt: string | null;

  sentAt: string;

  deletedBySender: boolean;
  deletedByRecipient: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface SendMailRequest {
  recipientId: string;
  subject: string;
  body: string;
  goldAttachment?: number;
}

export interface SendMailResponse {
  success: boolean;
  data: Mail;
}

export interface GetInboxResponse {
  success: boolean;
  data: Mail[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export interface GetSentMailResponse {
  success: boolean;
  data: Mail[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface GetMailResponse {
  success: boolean;
  data: Mail;
}

export interface ClaimAttachmentResponse {
  success: boolean;
  data: {
    goldClaimed: number;
  };
}

export interface MailUnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}
