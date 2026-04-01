import { create } from 'zustand';
import type { RouteChannel, RouteMessage } from '@/lib/types';

interface ChannelState {
  channels: RouteChannel[];
  messages: Record<string, RouteMessage[]>;
  setChannels: (channels: RouteChannel[]) => void;
  updateChannel: (channel: RouteChannel) => void;
  setMessages: (channelId: string, messages: RouteMessage[]) => void;
  appendMessage: (channelId: string, msg: RouteMessage) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  messages: {},
  setChannels: (channels) => set({ channels }),
  updateChannel: (channel) =>
    set((state) => ({ channels: state.channels.map((c) => (c.id === channel.id ? channel : c)) })),
  setMessages: (channelId, messages) =>
    set((state) => ({ messages: { ...state.messages, [channelId]: messages } })),
  appendMessage: (channelId, msg) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: [...(state.messages[channelId] ?? []), msg] },
    })),
}));
