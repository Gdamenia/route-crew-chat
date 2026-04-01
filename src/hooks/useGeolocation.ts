import { useEffect, useRef, useCallback } from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';
import { presenceService } from '@/services/presenceService';
import { PRESENCE_UPDATE_INTERVAL_MS } from '@/lib/constants';

const RESTING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes when resting/dnd

export function useGeolocation(enabled: boolean = true) {
  const { setMyLocation, setMyRoute } = usePresenceStore();
  const { profile } = useAuthStore();
  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  const getInterval = useCallback(() => {
    if (!profile) return PRESENCE_UPDATE_INTERVAL_MS;
    if (profile.status === 'resting' || profile.status === 'dnd') return RESTING_INTERVAL_MS;
    return PRESENCE_UPDATE_INTERVAL_MS;
  }, [profile?.status]);

  useEffect(() => {
    if (!enabled || !profile || !navigator.geolocation) return;

    const startWatch = () => {
      if (watchIdRef.current !== null) return;
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, heading } = pos.coords;
          setMyLocation({ lat, lng, heading: heading ?? undefined });

          if (!isVisibleRef.current) return;

          const now = Date.now();
          const interval = getInterval();
          if (now - lastUpdateRef.current < interval) return;
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
    };

    const stopWatch = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        stopWatch();
      } else {
        isVisibleRef.current = true;
        lastUpdateRef.current = 0; // force immediate update on resume
        startWatch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    startWatch();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopWatch();
    };
  }, [enabled, profile?.user_id, profile?.visibility_mode, profile?.status, getInterval]);
}
