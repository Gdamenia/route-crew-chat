import { supabase } from '@/integrations/supabase/client';
import type { DirectMessage, DriverProfile, Conversation } from '@/lib/types';

const loadProfilesMap = async (userIds: string[]) => {
  if (userIds.length === 0) return new Map<string, DriverProfile>();
  const { data } = await supabase.from('driver_profiles').select('*').in('user_id', userIds);
  return new Map((data ?? []).map((p) => [p.user_id, p as unknown as DriverProfile] as const));
};

export const dmService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    const messages = (data ?? []) as unknown as DirectMessage[];

    const convMap = new Map<string, { messages: DirectMessage[]; unread: number }>();
    for (const msg of messages) {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, { messages: [], unread: 0 });
      const conv = convMap.get(otherId)!;
      conv.messages.push(msg);
      if (!msg.is_read && msg.receiver_id === userId) conv.unread++;
    }

    const profileIds = [...convMap.keys()];
    const profiles = await loadProfilesMap(profileIds);

    const conversations: Conversation[] = [];
    for (const [otherId, { messages: msgs, unread }] of convMap) {
      const profile = profiles.get(otherId);
      if (!profile) continue;
      conversations.push({
        other_user_id: otherId,
        other_profile: profile,
        last_message: msgs[0],
        unread_count: unread,
      });
    }

    return conversations.sort((a, b) =>
      new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
    );
  },

  async getMessages(userId: string, otherUserId: string, before?: string): Promise<DirectMessage[]> {
    let query = supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })
      .limit(50);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;

    const messages = (data ?? []) as unknown as DirectMessage[];
    const profiles = await loadProfilesMap([userId, otherUserId]);
    return messages.map((m) => ({ ...m, sender: profiles.get(m.sender_id) }));
  },

  async sendMessage(senderId: string, receiverId: string, text: string, messageType: string = 'text', mediaUrl?: string, locationLat?: number, locationLng?: number): Promise<DirectMessage> {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: senderId, receiver_id: receiverId, text_content: text, message_type: messageType,
        media_url: mediaUrl ?? null, location_lat: locationLat ?? null, location_lng: locationLng ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;

    const msg = data as unknown as DirectMessage;
    const profiles = await loadProfilesMap([senderId]);
    return { ...msg, sender: profiles.get(senderId) };
  },

  async markAsRead(userId: string, otherUserId: string) {
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
  },

  subscribeToDMs(userId: string, onMessage: (msg: DirectMessage) => void) {
    const channel = supabase
      .channel(`dm:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async (payload) => {
          const msg = payload.new as unknown as DirectMessage;
          if (msg.sender_id !== userId && msg.receiver_id !== userId) return;
          const profiles = await loadProfilesMap([msg.sender_id]);
          onMessage({ ...msg, sender: profiles.get(msg.sender_id) });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
};
