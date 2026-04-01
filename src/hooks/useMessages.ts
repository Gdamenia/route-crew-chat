import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RouteMessage, DriverProfile } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useMessages(channelId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RouteMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    const { data } = await supabase
      .from('route_messages')
      .select('*, sender:driver_profiles!route_messages_sender_user_id_fkey(*)' as any)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data as unknown as RouteMessage[]) || []);
    setLoading(false);
  }, [channelId]);

  const sendMessage = async (text: string) => {
    if (!user || !channelId) return;
    await supabase.from('route_messages').insert({
      channel_id: channelId,
      sender_user_id: user.id,
      text_content: text,
    });
  };

  useEffect(() => {
    fetchMessages();

    if (!channelId) return;

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'route_messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', (payload.new as any).sender_user_id)
            .maybeSingle();
          const msg = { ...payload.new, sender: profile } as unknown as RouteMessage;
          setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, fetchMessages]);

  return { messages, loading, sendMessage };
}
