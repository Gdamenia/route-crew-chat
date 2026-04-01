import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RouteChannel } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<(RouteChannel & { is_member: boolean; is_muted: boolean; member_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    const { data: channelsData } = await supabase
      .from('route_channels')
      .select('*')
      .eq('is_active', true);

    const { data: memberships } = user
      ? await supabase.from('route_channel_members').select('channel_id, muted').eq('user_id', user.id)
      : { data: [] };

    const { data: memberCounts } = await supabase
      .from('route_channel_members')
      .select('channel_id');

    const countMap: Record<string, number> = {};
    memberCounts?.forEach((m: { channel_id: string }) => {
      countMap[m.channel_id] = (countMap[m.channel_id] || 0) + 1;
    });

    const memberMap = new Map(memberships?.map((m: { channel_id: string; muted: boolean | null }) => [m.channel_id, m]) || []);

    setChannels(
      (channelsData || []).map((ch: any) => {
        const membership = memberMap.get(ch.id) as { muted: boolean | null } | undefined;
        return {
          ...ch,
          is_member: !!membership,
          is_muted: membership?.muted ?? false,
          member_count: countMap[ch.id] || 0,
        };
      })
    );
    setLoading(false);
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return;
    await supabase.from('route_channel_members').insert({ channel_id: channelId, user_id: user.id });
    await fetchChannels();
  };

  const leaveChannel = async (channelId: string) => {
    if (!user) return;
    await supabase.from('route_channel_members').delete().eq('channel_id', channelId).eq('user_id', user.id);
    await fetchChannels();
  };

  const toggleMute = async (channelId: string, muted: boolean) => {
    if (!user) return;
    await supabase.from('route_channel_members').update({ muted }).eq('channel_id', channelId).eq('user_id', user.id);
    await fetchChannels();
  };

  useEffect(() => {
    fetchChannels();
  }, [user]);

  return { channels, loading, joinChannel, leaveChannel, toggleMute, refetch: fetchChannels };
}
