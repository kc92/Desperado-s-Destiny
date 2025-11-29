/**
 * Mail Store
 * Manages mail state using Zustand
 */

import { create } from 'zustand';
import type { Mail, SendMailRequest } from '@desperados/shared';
import { api } from '@/services/api';

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
      const response = await api.get('/mail/inbox', {
        params: { unread_only: unreadOnly, limit, offset }
      });

      set({
        inbox: response.data.data,
        unreadCount: response.data.unreadCount,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch inbox'
      });
      throw error;
    }
  },

  fetchSent: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/mail/sent', {
        params: { limit, offset }
      });

      set({
        sent: response.data.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch sent mail'
      });
      throw error;
    }
  },

  sendMail: async (mail: SendMailRequest) => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/mail/send', mail);
      set({ isLoading: false });

      await get().fetchSent();
      await get().fetchUnreadCount();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to send mail'
      });
      throw error;
    }
  },

  claimAttachment: async (mailId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post(`/mail/${mailId}/claim`);
      const goldClaimed = response.data.data.goldClaimed;

      await get().fetchInbox();

      set({ isLoading: false });
      return goldClaimed;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to claim attachment'
      });
      throw error;
    }
  },

  deleteMail: async (mailId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/mail/${mailId}`);

      await get().fetchInbox();
      await get().fetchSent();
      await get().fetchUnreadCount();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete mail'
      });
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/mail/unread-count');
      set({ unreadCount: response.data.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  clearError: () => set({ error: null })
}));
