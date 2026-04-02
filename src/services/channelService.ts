import { supabase } from '@/integrations/supabase/client';
import type { DriverProfile, RouteChannel, RouteMessage } from '@/lib/types';

const loadProfilesMap = async (userIds: string[]) => {
  if (userIds.length === 0) return new Map<string, DriverProfile>();
  const { data, error } = await supabase.from('driver_profiles').select('*').in('user_id', userIds);
  if (error) return new Map<string, DriverProfile>();
  return new Map((data ?? []).map((profile) => [profile.user_id, profile as DriverProfile] as const));
};

const attachSenders = async (rows: RouteMessage[]) => {
  const uniqueUserIds = [...new Set(rows.map((message) => message.sender_user_id))];
  const profilesMap = await loadProfilesMap(uniqueUserIds);
  return rows.map((message) => ({ ...message, sender: profilesMap.get(message.sender_user_id) }));
};

export const channelService = {
  async getAllChannels(userId: string): Promise<RouteChannel[]> {
    const [channelsRes, membershipsRes] = await Promise.all([
      supabase.from('route_channels').select('*').eq('is_active', true).order('route_name'),
      supabase.from('route_channel_members').select('channel_id, muted').eq('user_id', userId),
    ]);
    if (channelsRes.error) throw channelsRes.error;
    const memberMap = new Map((membershipsRes.data ?? []).map((m) => [m.channel_id, m] as const));
    return (channelsRes.data ?? []).map((channel) => ({
      ...channel,
      is_member: memberMap.has(channel.id),
      is_muted: memberMap.get(channel.id)?.muted ?? false,
    })) as unknown as RouteChannel[];
  },

  async joinChannel(channelId: string, userId: string) {
    const { error } = await supabase
      .from('route_channel_members')
      .upsert({ channel_id: channelId, user_id: userId, muted: false }, { onConflict: 'channel_id,user_id' });
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
    const twentyFourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('route_messages')
      .select('*')
      .eq('channel_id', channelId)
      .gte('created_at', twentyFourAgo)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    return attachSenders((data ?? []) as RouteMessage[]);
  },

  async sendMessage(channelId: string, userId: string, text: string, messageType: string = 'text', mediaUrl?: string, locationLat?: number, locationLng?: number): Promise<RouteMessage> {
    const insertObj: Record<string, unknown> = {
      channel_id: channelId, sender_user_id: userId, text_content: text, message_type: messageType,
    };
    if (mediaUrl) insertObj.media_url = mediaUrl;
    if (locationLat != null) insertObj.location_lat = locationLat;
    if (locationLng != null) insertObj.location_lng = locationLng;
    const { data, error } = await supabase
      .from('route_messages')
      .insert(insertObj)
      .select('*')
      .single();
    if (error) throw error;
    const message = data as RouteMessage;
    const profiles = await loadProfilesMap([userId]);
    return { ...message, sender: profiles.get(userId) };
  },

  subscribeToMessages(channelId: string, onMessage: (msg: RouteMessage) => void) {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'route_messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const incoming = payload.new as RouteMessage;
          const profiles = await loadProfilesMap([incoming.sender_user_id]);
          onMessage({ ...incoming, sender: profiles.get(incoming.sender_user_id) });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};
