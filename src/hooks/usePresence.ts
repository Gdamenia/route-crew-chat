import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DriverPresence, DriverProfile } from '@/lib/types';

export interface NearbyDriver extends DriverPresence {
  driver_profiles: DriverProfile;
}

export function usePresence() {
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from('driver_presence')
      .select('*, driver_profiles:driver_profiles!driver_presence_user_id_fkey(*)' as any)
      .eq('is_visible', true);

    // Filter to only drivers with lat/lng
    const valid = ((data as unknown as NearbyDriver[]) || []).filter(
      (d) => d.lat != null && d.lng != null && d.driver_profiles
    );
    setDrivers(valid);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);
    return () => clearInterval(interval);
  }, []);

  return { drivers, loading, refetch: fetchDrivers };
}
