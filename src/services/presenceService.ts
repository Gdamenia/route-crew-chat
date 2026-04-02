import { supabase } from '@/integrations/supabase/client';
import type { DriverWithProfile } from '@/lib/types';
import { detectRoute } from '@/lib/routes';

export const presenceService = {
  async upsertPresence(userId: string, lat: number, lng: number, heading: number | undefined, status: string, isVisible: boolean) {
    const current_route = detectRoute(lat, lng, heading);
    const { error } = await supabase.from('driver_presence').upsert(
      { user_id: userId, lat, lng, heading: heading ?? 0, current_route, last_seen_at: new Date().toISOString(), is_visible: isVisible, status },
      { onConflict: 'user_id' }
    );
    if (error) {
      console.error('[Presence] Upsert failed:', error.message);
      throw error;
    }
    return current_route;
  },

  async getNearbyDrivers(lat: number, lng: number, radiusKm = 50): Promise<DriverWithProfile[]> {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('driver_presence')
      .select('*, driver_profiles(*)')
      .eq('is_visible', true)
      .gte('lat', lat - latDelta).lte('lat', lat + latDelta)
      .gte('lng', lng - lngDelta).lte('lng', lng + lngDelta)
      .gte('last_seen_at', tenMinAgo);
    if (error) throw error;
    return (data ?? []) as unknown as DriverWithProfile[];
  },

  subscribeToPresence(onUpdate: (d: DriverWithProfile) => void, onDelete: (userId: string) => void) {
    const ch = supabase.channel('presence_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_presence' }, (payload) => {
        if (payload.eventType === 'DELETE') onDelete((payload.old as any).user_id);
        else onUpdate(payload.new as unknown as DriverWithProfile);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  },

  async clearPresence(userId: string) {
    await supabase.from('driver_presence').update({ is_visible: false }).eq('user_id', userId);
  },
};
