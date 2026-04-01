import { useEffect, useRef } from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';
import { presenceService } from '@/services/presenceService';
import { PRESENCE_UPDATE_INTERVAL_MS } from '@/lib/constants';

export function useGeolocation(enabled: boolean = true) {
  const { setMyLocation, setMyRoute } = usePresenceStore();
  const { profile } = useAuthStore();
  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !profile || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, heading } = pos.coords;
        setMyLocation({ lat, lng, heading: heading ?? undefined });

        const now = Date.now();
        if (now - lastUpdateRef.current < PRESENCE_UPDATE_INTERVAL_MS) return;
        lastUpdateRef.current = now;

        const isVisible = profile.visibility_mode !== 'hidden';
        try {
          const route = await presenceService.upsertPresence(profile.user_id, lat, lng, heading ?? undefined, profile.status, isVisible);
          setMyRoute(route);
        } catch (err) {
          console.warn('[Geo] Presence update failed:', err);
        }
      },
      (err) => console.warn('[Geo] Error:', err),
      { enableHighAccuracy: false, maximumAge: 20000, timeout: 30000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [enabled, profile?.user_id, profile?.visibility_mode, profile?.status]);
}
