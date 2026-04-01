import { create } from 'zustand';
import { blockService } from '@/services/blockService';

interface BlockState {
  blockedIds: Set<string>;
  loaded: boolean;
  loadBlocked: (userId: string) => Promise<void>;
  blockUser: (blockerId: string, blockedId: string) => Promise<void>;
  unblockUser: (blockerId: string, blockedId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
}

export const useBlockStore = create<BlockState>((set, get) => ({
  blockedIds: new Set(),
  loaded: false,

  loadBlocked: async (userId: string) => {
    try {
      const blocked = await blockService.getBlockedUsers(userId);
      set({ blockedIds: new Set(blocked.map((b) => b.blocked_id)), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  blockUser: async (blockerId: string, blockedId: string) => {
    await blockService.blockUser(blockerId, blockedId);
    set((state) => {
      const next = new Set(state.blockedIds);
      next.add(blockedId);
      return { blockedIds: next };
    });
  },

  unblockUser: async (blockerId: string, blockedId: string) => {
    await blockService.unblockUser(blockerId, blockedId);
    set((state) => {
      const next = new Set(state.blockedIds);
      next.delete(blockedId);
      return { blockedIds: next };
    });
  },

  isBlocked: (userId: string) => get().blockedIds.has(userId),
}));
