import { create } from 'zustand';
import type { DriverWithProfile } from '@/lib/types';

interface PresenceState {
  myLocation: { lat: number; lng: number; heading?: number } | null;
  myRoute: string | null;
  nearbyDrivers: DriverWithProfile[];
  geoError: string | null;
  locationSyncFailed: boolean;
  setMyLocation: (loc: { lat: number; lng: number; heading?: number }) => void;
  setMyRoute: (route: string | null) => void;
  setNearbyDrivers: (drivers: DriverWithProfile[]) => void;
  upsertNearbyDriver: (driver: DriverWithProfile) => void;
  removeNearbyDriver: (userId: string) => void;
  setGeoError: (err: string | null) => void;
  setLocationSyncFailed: (failed: boolean) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  myLocation: null,
  myRoute: null,
  nearbyDrivers: [],
  geoError: null,
  locationSyncFailed: false,
  setMyLocation: (myLocation) => set({ myLocation }),
  setMyRoute: (myRoute) => set({ myRoute }),
  setNearbyDrivers: (nearbyDrivers) => set({ nearbyDrivers }),
  upsertNearbyDriver: (driver) =>
    set((state) => {
      const idx = state.nearbyDrivers.findIndex((d) => d.user_id === driver.user_id);
      if (idx >= 0) {
        const updated = [...state.nearbyDrivers];
        updated[idx] = driver;
        return { nearbyDrivers: updated };
      }
      return { nearbyDrivers: [...state.nearbyDrivers, driver] };
    }),
  removeNearbyDriver: (userId) =>
    set((state) => ({ nearbyDrivers: state.nearbyDrivers.filter((d) => d.user_id !== userId) })),
  setGeoError: (geoError) => set({ geoError }),
  setLocationSyncFailed: (locationSyncFailed) => set({ locationSyncFailed }),
}));
