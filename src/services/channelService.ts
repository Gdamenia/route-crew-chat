import { supabase } from '@/integrations/supabase/client';
import type { RouteChannel, RouteMessage } from '@/lib/types';

export const channelService = {
  async getAllChannels(userId: string): Promise<RouteChannel[]> {
    // Parallel fetch — channels + memberships at the same time
    const [channelsRes, membershipsRes] = await Promise.all([
      supabase.from('route_channels').select('*').eq('is_active', true).order('route_name'),
      supabase.from('route_channel_members').select('channel_id, muted').eq('user_id', userId),
    ]);
    if (channelsRes.error) throw channelsRes.error;
    const memberMap = new Map((membershipsRes.data ?? []).map((m) => [m.channel_id, m] as const));
    return (channelsRes.data ?? []).map((c) => ({ ...c, is_member: memberMap.has(c.id), is_muted: memberMap.get(c.id)?.muted ?? false })) as unknown as RouteChannel[];
  },

  async joinChannel(channelId: string, userId: string) {
    const { error } = await supabase.from('route_channel_members').upsert({ channel_id: channelId, user_id: userId, muted: false }, { onConflict: 'channel_id,user_id' });
    if (error) throw error;
  },

  async leaveChannel(channelId: string, userId: string) {
    const { error } = await supabase.from('route_channel_members').delete().eq('channel_id', channelId).eq('user_id', userId);
    if (error) throw error;
  },

  async muteChannel(channelId: string, userId: string, muted: boolean) {
    const { error } = await supabase.from('route_channel_members').update({ muted }).eq('channel_id', channelId).eq('user_id', userId);
    if (error) throw error;
  },

  async getMessages(channelId: string): Promise<RouteMessage[]> {
    const { data, error } = await supabase
      .from('route_messages')
      .select('*, sender:driver_profiles!route_messages_sender_user_id_fkey(*)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) throw error;
    return ((data ?? []) as unknown as RouteMessage[]).reverse();
  },

  async sendMessage(channelId: string, userId: string, text: string): Promise<RouteMessage> {
    const { data, error } = await supabase
      .from('route_messages')
      .insert({ channel_id: channelId, sender_user_id: userId, text_content: text })
      .select('*, sender:driver_profiles!route_messages_sender_user_id_fkey(*)')
      .single();
    if (error) throw error;
    return data as unknown as RouteMessage;
  },

  subscribeToMessages(channelId: string, onMessage: (msg: RouteMessage) => void) {
    const ch = supabase.channel(`messages:${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'route_messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const { data } = await supabase
            .from('route_messages')
            .select('*, sender:driver_profiles!route_messages_sender_user_id_fkey(*)')
            .eq('id', (payload.new as RouteMessage).id)
            .single();
          if (data) onMessage(data as unknown as RouteMessage);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  },
};
