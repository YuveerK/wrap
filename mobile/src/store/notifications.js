import { create } from 'zustand';

export const useNotificationsStore = create((set) => ({
  hasUnread: false,
  setHasUnread: (val) => set({ hasUnread: val }),
}));
