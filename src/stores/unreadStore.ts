import { create } from 'zustand';

interface UnreadState {
  unreadDMs: number;
  unreadChannels: number;
  setUnreadDMs: (count: number) => void;
  setUnreadChannels: (count: number) => void;
  incrementDMs: () => void;
  incrementChannels: () => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadDMs: 0,
  unreadChannels: 0,
  setUnreadDMs: (count) => set({ unreadDMs: count }),
  setUnreadChannels: (count) => set({ unreadChannels: count }),
  incrementDMs: () => set((s) => ({ unreadDMs: s.unreadDMs + 1 })),
  incrementChannels: () => set((s) => ({ unreadChannels: s.unreadChannels + 1 })),
}));
