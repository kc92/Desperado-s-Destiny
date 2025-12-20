/**
 * Mail Service
 * API client for in-game mail system
 */

import api from './api';
import {
  Mail,
  SendMailRequest,
  SendMailResponse,
  GetInboxResponse,
  GetSentMailResponse,
  GetMailResponse,
  ClaimAttachmentResponse,
  MailUnreadCountResponse,
} from '@shared/types/mail.types';

// ===== Additional Response Types =====

export interface DeleteMailResponse {
  success: boolean;
  message: string;
}

export interface ReportMailResponse {
  success: boolean;
  message: string;
}

// ===== Query Parameters =====

export interface GetMailboxParams {
  limit?: number;
  offset?: number;
}

// ===== Mail Service =====

export const mailService = {
  /**
   * Send mail to another character
   */
  async sendMail(mailData: SendMailRequest): Promise<Mail> {
    const response = await api.post<SendMailResponse>('/mail/send', mailData);
    return response.data.data;
  },

  /**
   * Get inbox (received mail)
   */
  async getInbox(params?: GetMailboxParams): Promise<GetInboxResponse> {
    const response = await api.get<GetInboxResponse>('/mail/inbox', { params });
    return response.data;
  },

  /**
   * Get sent mail
   */
  async getSentMail(params?: GetMailboxParams): Promise<GetSentMailResponse> {
    const response = await api.get<GetSentMailResponse>('/mail/sent', { params });
    return response.data;
  },

  /**
   * Get unread mail count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<MailUnreadCountResponse>('/mail/unread-count');
    return response.data.data.count;
  },

  /**
   * Get a specific mail by ID
   */
  async getMail(mailId: string): Promise<Mail> {
    const response = await api.get<GetMailResponse>(`/mail/${mailId}`);
    return response.data.data;
  },

  /**
   * Claim gold attachment from mail
   */
  async claimAttachment(mailId: string): Promise<number> {
    const response = await api.post<ClaimAttachmentResponse>(`/mail/${mailId}/claim`);
    return response.data.data.goldClaimed;
  },

  /**
   * Delete a mail
   */
  async deleteMail(mailId: string): Promise<void> {
    await api.delete<DeleteMailResponse>(`/mail/${mailId}`);
  },

  /**
   * Report inappropriate mail
   */
  async reportMail(mailId: string): Promise<void> {
    await api.post<ReportMailResponse>(`/mail/${mailId}/report`);
  },

  // ===== Convenience Methods =====

  /**
   * Get only unread mail
   */
  async getUnreadMail(params?: GetMailboxParams): Promise<Mail[]> {
    const response = await this.getInbox(params);
    return response.data.filter(mail => !mail.isRead);
  },

  /**
   * Get mail with unclaimed gold attachments
   */
  async getMailWithAttachments(params?: GetMailboxParams): Promise<Mail[]> {
    const response = await this.getInbox(params);
    return response.data.filter(mail => mail.goldAttachment > 0 && !mail.goldClaimed);
  },

  /**
   * Send mail with gold attachment
   */
  async sendMailWithGold(
    recipientId: string,
    subject: string,
    body: string,
    goldAmount: number
  ): Promise<Mail> {
    return this.sendMail({
      recipientId,
      subject,
      body,
      goldAttachment: goldAmount,
    });
  },

  /**
   * Send simple text mail (no gold)
   */
  async sendTextMail(recipientId: string, subject: string, body: string): Promise<Mail> {
    return this.sendMail({
      recipientId,
      subject,
      body,
    });
  },

  /**
   * Check if there is unread mail
   */
  async hasUnread(): Promise<boolean> {
    const count = await this.getUnreadCount();
    return count > 0;
  },

  /**
   * Get total unclaimed gold across all mail
   */
  async getTotalUnclaimedGold(params?: GetMailboxParams): Promise<number> {
    const mailWithAttachments = await this.getMailWithAttachments(params);
    return mailWithAttachments.reduce((total, mail) => total + mail.goldAttachment, 0);
  },

  /**
   * Bulk claim all attachments
   * Claims gold from all mail with attachments
   */
  async claimAllAttachments(params?: GetMailboxParams): Promise<number> {
    const mailWithAttachments = await this.getMailWithAttachments(params);
    let totalClaimed = 0;

    for (const mail of mailWithAttachments) {
      try {
        const claimed = await this.claimAttachment(mail._id);
        totalClaimed += claimed;
      } catch (error) {
        console.error(`Failed to claim attachment from mail ${mail._id}:`, error);
      }
    }

    return totalClaimed;
  },
};

export default mailService;
