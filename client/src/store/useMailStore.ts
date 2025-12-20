/**
 * Mail Store
 * Manages mail state using Zustand
 */

import { create } from 'zustand';
import type { Mail, SendMailRequest } from '@desperados/shared';
import { mailService } from '@/services/mail.service';
import { logger } from '@/services/logger.service';

interface MailStore {
  inbox: Mail[];
  sent: Mail[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchInbox: (unreadOnly?: boolean, limit?: number, offset?: number) => Promise<void>;
  fetchSent: (limit?: number, offset?: number) => Promise<void>;
  sendMail: (mail: SendMailRequest) => Promise<void>;
  claimAttachment: (mailId: string) => Promise<number>;
  deleteMail: (mailId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  clearError: () => void;
}

export const useMailStore = create<MailStore>((set, get) => ({
  inbox: [],
  sent: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchInbox: async (unreadOnly = false, limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const response = unreadOnly
        ? await mailService.getUnreadMail({ limit, offset })
        : await mailService.getInbox({ limit, offset });

      set({
        inbox: unreadOnly ? response : response.data,
        unreadCount: unreadOnly ? 0 : response.unreadCount || 0,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch inbox';
      logger.error('Failed to fetch inbox', error as Error, {
        context: 'useMailStore.fetchInbox',
        unreadOnly,
        limit,
        offset
      });
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  fetchSent: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const response = await mailService.getSentMail({ limit, offset });

      set({
        sent: response.data,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch sent mail';
      logger.error('Failed to fetch sent mail', error as Error, {
        context: 'useMailStore.fetchSent',
        limit,
        offset
      });
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  sendMail: async (mail: SendMailRequest) => {
    set({ isLoading: true, error: null });

    try {
      await mailService.sendMail(mail);
      set({ isLoading: false });

      await get().fetchSent();
      await get().fetchUnreadCount();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send mail';
      logger.error('Failed to send mail', error as Error, {
        context: 'useMailStore.sendMail',
        recipientId: mail.recipientId,
        hasGoldAttachment: !!mail.goldAttachment
      });
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  claimAttachment: async (mailId: string) => {
    set({ isLoading: true, error: null });

    try {
      const goldClaimed = await mailService.claimAttachment(mailId);

      await get().fetchInbox();

      set({ isLoading: false });
      return goldClaimed;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to claim attachment';
      logger.error('Failed to claim attachment', error as Error, {
        context: 'useMailStore.claimAttachment',
        mailId
      });
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  deleteMail: async (mailId: string) => {
    set({ isLoading: true, error: null });

    try {
      await mailService.deleteMail(mailId);

      await get().fetchInbox();
      await get().fetchSent();
      await get().fetchUnreadCount();

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete mail';
      logger.error('Failed to delete mail', error as Error, {
        context: 'useMailStore.deleteMail',
        mailId
      });
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await mailService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      logger.error('Failed to fetch unread count', error as Error, {
        context: 'useMailStore.fetchUnreadCount'
      });
    }
  },

  clearError: () => set({ error: null })
}));
