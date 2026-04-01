import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RouteChannel } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

export function useChannels() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const [channels, setChannels] = useState<(RouteChannel & { is_member: boolean; is_muted: boolean; member_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    const [channelsRes, membershipsRes, memberCountsRes] = await Promise.all([
      supabase.from('route_channels').select('*').eq('is_active', true),
      userId
        ? supabase.from('route_channel_members').select('channel_id, muted').eq('user_id', userId)
        : Promise.resolve({ data: [] as { channel_id: string; muted: boolean | null }[] }),
      supabase.from('route_channel_members').select('channel_id'),
    ]);

    const countMap: Record<string, number> = {};
    (memberCountsRes as any).data?.forEach((m: { channel_id: string }) => {
      countMap[m.channel_id] = (countMap[m.channel_id] || 0) + 1;
    });

    const memberships = ('data' in membershipsRes ? membershipsRes.data : []) || [];
    const memberMap = new Map(memberships.map((m: any) => [m.channel_id, m] as const));

    setChannels(
      (channelsRes.data || []).map((ch: any) => {
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
  }, [userId]);

  const joinChannel = useCallback(async (channelId: string) => {
    if (!userId) return;
    await supabase.from('route_channel_members').upsert(
      { channel_id: channelId, user_id: userId, muted: false },
      { onConflict: 'channel_id,user_id' }
    );
    await fetchChannels();
  }, [userId, fetchChannels]);

  const leaveChannel = useCallback(async (channelId: string) => {
    if (!userId) return;
    await supabase.from('route_channel_members').delete().eq('channel_id', channelId).eq('user_id', userId);
    await fetchChannels();
  }, [userId, fetchChannels]);

  const toggleMute = useCallback(async (channelId: string, muted: boolean) => {
    if (!userId) return;
    await supabase.from('route_channel_members').update({ muted }).eq('channel_id', channelId).eq('user_id', userId);
    await fetchChannels();
  }, [userId, fetchChannels]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, loading, joinChannel, leaveChannel, toggleMute, refetch: fetchChannels };
}
