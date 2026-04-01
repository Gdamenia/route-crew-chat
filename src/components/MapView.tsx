import { useEffect, useRef, useState } from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';
import { presenceService } from '@/services/presenceService';
import type { DriverWithProfile } from '@/lib/types';
import { getStatusColor } from '@/lib/helpers';
import { DriverCard } from '@/components/DriverCard';

interface MapViewProps {
  onDriverSelect?: (driver: DriverWithProfile) => void;
}

export function MapView({ onDriverSelect }: MapViewProps) {
  const { myLocation, nearbyDrivers, setNearbyDrivers, upsertNearbyDriver, removeNearbyDriver } = usePresenceStore();
  const { profile } = useAuthStore();
  const [selectedDriver, setSelectedDriver] = useState<DriverWithProfile | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if ((window as any).L) { setMapLoaded(true); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };
    loadLeaflet();
  }, []);

  // Init map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;
    const L = (window as any).L;
    mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([39.5, -98.35], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(mapRef.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
  }, [mapLoaded]);

  // Center on user location
  useEffect(() => {
    if (mapRef.current && myLocation) {
      mapRef.current.setView([myLocation.lat, myLocation.lng], 10, { animate: true });
    }
  }, [myLocation?.lat, myLocation?.lng]);

  // Load nearby drivers
  useEffect(() => {
    if (!myLocation || !profile) return;
    presenceService.getNearbyDrivers(myLocation.lat, myLocation.lng, 50).then((drivers) => {
      setNearbyDrivers(drivers.filter((d) => d.user_id !== profile.user_id));
    });
  }, [myLocation?.lat, myLocation?.lng]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;
    return presenceService.subscribeToPresence(
      (driver) => { if (driver.user_id !== profile.user_id) upsertNearbyDriver(driver); },
      (userId) => removeNearbyDriver(userId)
    );
  }, [profile?.user_id]);

  // Render markers
  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach((marker, userId) => {
      if (!nearbyDrivers.find((d) => d.user_id === userId)) {
        marker.remove();
        markersRef.current.delete(userId);
      }
    });

    nearbyDrivers.forEach((driver) => {
      if (driver.lat == null || driver.lng == null) return;
      const statusColor = getStatusColor(driver.status);
      const name = driver.driver_profiles?.display_name ?? '?';
      const initial = name.charAt(0).toUpperCase();
      const iconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:38px;height:38px;border-radius:50%;background:${statusColor};display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0A0C0F;font-size:16px;border:2px solid #0A0C0F;">${initial}</div>
          <div style="background:#1A1D24;border:1px solid #2E3340;border-radius:4px;padding:1px 6px;margin-top:2px;font-size:10px;color:#F0F2F5;white-space:nowrap;">${name}</div>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: '', iconAnchor: [19, 19] });

      if (markersRef.current.has(driver.user_id)) {
        const marker = markersRef.current.get(driver.user_id);
        marker.setLatLng([driver.lat, driver.lng]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([driver.lat, driver.lng], { icon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedDriver(driver));
        markersRef.current.set(driver.user_id, marker);
      }
    });
  }, [nearbyDrivers]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-primary animate-pulse text-lg font-medium">Loading map...</div>
        </div>
      )}
      {selectedDriver && (
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-sm mx-auto">
          <DriverCard
            driver={selectedDriver}
            onClose={() => setSelectedDriver(null)}
            onViewProfile={() => { onDriverSelect?.(selectedDriver); setSelectedDriver(null); }}
          />
        </div>
      )}
    </div>
  );
}
