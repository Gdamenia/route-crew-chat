import { supabase } from '@/integrations/supabase/client';
import type { BlockedUser } from '@/lib/types';

export const blockService = {
  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as BlockedUser[];
  },

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase
      .from('blocked_users')
      .insert({ blocker_id: blockerId, blocked_id: blockedId });
    if (error) throw error;
  },

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (error) throw error;
  },

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();
    return !!data;
  },
};
