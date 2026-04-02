import { useEffect, useRef, useCallback } from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';
import { presenceService } from '@/services/presenceService';
import { PRESENCE_UPDATE_INTERVAL_MS } from '@/lib/constants';

const RESTING_INTERVAL_MS = 5 * 60 * 1000;
const SYNC_RETRY_MS = 30_000;

export function useGeolocation(enabled: boolean = true) {
  const { setMyLocation, setMyRoute, setGeoError, setLocationSyncFailed } = usePresenceStore();
  const { profile } = useAuthStore();
  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const syncRetryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number; heading?: number } | null>(null);

  const getInterval = useCallback(() => {
    if (!profile) return PRESENCE_UPDATE_INTERVAL_MS;
    if (profile.status === 'resting' || profile.status === 'dnd') return RESTING_INTERVAL_MS;
    return PRESENCE_UPDATE_INTERVAL_MS;
  }, [profile?.status]);

  useEffect(() => {
    if (!enabled || !profile || !navigator.geolocation) return;

    const doUpsert = async (lat: number, lng: number, heading: number | undefined) => {
      const isVisible = profile.visibility_mode !== 'hidden';
      try {
        const route = await presenceService.upsertPresence(profile.user_id, lat, lng, heading, profile.status, isVisible);
        setMyRoute(route);
        setLocationSyncFailed(false);
      } catch (err) {
        console.warn('[Geo] Presence upsert failed:', err);
        setLocationSyncFailed(true);
      }
    };

    const startWatch = () => {
      if (watchIdRef.current !== null) return;
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, heading } = pos.coords;
          const coords = { lat, lng, heading: heading ?? undefined };
          lastCoordsRef.current = coords;
          setMyLocation(coords);
          setGeoError(null);

          if (!isVisibleRef.current) return;

          const now = Date.now();
          const interval = getInterval();
          if (now - lastUpdateRef.current < interval) return;
          lastUpdateRef.current = now;

          await doUpsert(lat, lng, heading ?? undefined);
        },
        (err) => {
          console.warn('[Geo] Error:', err);
          if (err.code === err.PERMISSION_DENIED) {
            setGeoError('Location access denied — enable it in your browser settings to appear on the map.');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setGeoError('Location unavailable — make sure GPS is enabled.');
          } else {
            setGeoError('Location timed out — trying again...');
          }
        },
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
        lastUpdateRef.current = 0;
        startWatch();
      }
    };

    // Retry sync if failed
    syncRetryRef.current = setInterval(() => {
      const store = usePresenceStore.getState();
      if (store.locationSyncFailed && lastCoordsRef.current && profile) {
        doUpsert(lastCoordsRef.current.lat, lastCoordsRef.current.lng, lastCoordsRef.current.heading);
      }
    }, SYNC_RETRY_MS);

    document.addEventListener('visibilitychange', handleVisibility);
    startWatch();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopWatch();
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
    };
  }, [enabled, profile?.user_id, profile?.visibility_mode, profile?.status, getInterval]);
}
