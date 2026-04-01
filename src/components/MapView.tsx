import { useEffect, useRef, useState } from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
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
  const { isBlocked } = useBlockStore();
  const filteredDrivers = nearbyDrivers.filter((d) => !isBlocked(d.user_id));
  const [selectedDriver, setSelectedDriver] = useState<DriverWithProfile | null>(null);
  const [mapLoaded, setMapLoaded] = useState(!!(window as any).L);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const myMarkerRef = useRef<any>(null);
  const myCircleRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<string>('');
  const hasInitialView = useRef(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if ((window as any).L) { setMapLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
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

  // Center on user location (only first time)
  useEffect(() => {
    if (mapRef.current && myLocation && !hasInitialView.current) {
      mapRef.current.setView([myLocation.lat, myLocation.lng], 12, { animate: true });
      hasInitialView.current = true;
    }
  }, [myLocation?.lat, myLocation?.lng]);

  // Show MY location marker (blue pulsing dot)
  useEffect(() => {
    if (!mapRef.current || !myLocation) return;
    const L = (window as any).L;
    if (!L) return;

    const myIconHtml = `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:hsl(var(--primary));opacity:0.3;animation:pulse 2s infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:hsl(var(--primary));border:2px solid #fff;"></div>
      </div>
    `;
    const myIcon = L.divIcon({ html: myIconHtml, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });

    if (myMarkerRef.current) {
      myMarkerRef.current.setLatLng([myLocation.lat, myLocation.lng]);
    } else {
      myMarkerRef.current = L.marker([myLocation.lat, myLocation.lng], { icon: myIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
      myMarkerRef.current.bindPopup('<b>You are here</b>');
    }

    // Accuracy circle
    if (myCircleRef.current) {
      myCircleRef.current.setLatLng([myLocation.lat, myLocation.lng]);
    } else {
      myCircleRef.current = L.circle([myLocation.lat, myLocation.lng], {
        radius: 500,
        color: 'hsl(var(--primary))',
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
      }).addTo(mapRef.current);
    }
  }, [myLocation?.lat, myLocation?.lng]);

  // Load nearby drivers
  useEffect(() => {
    if (!myLocation || !profile) return;
    const key = `${myLocation.lat.toFixed(2)},${myLocation.lng.toFixed(2)}`;
    if (key === lastFetchRef.current) return;
    lastFetchRef.current = key;
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

  // Render nearby driver markers
  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach((marker, userId) => {
      if (!filteredDrivers.find((d) => d.user_id === userId)) {
        marker.remove();
        markersRef.current.delete(userId);
      }
    });

    filteredDrivers.forEach((driver) => {
      if (driver.lat == null || driver.lng == null) return;
      const statusColor = getStatusColor(driver.status);
      const name = driver.driver_profiles?.display_name ?? '?';
      const initial = name.charAt(0).toUpperCase();
      const isDnd = driver.driver_profiles?.dnd_enabled || driver.status === 'dnd';
      const iconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:38px;height:38px;border-radius:50%;background:${statusColor};display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0A0C0F;font-size:16px;border:2px solid #0A0C0F;${isDnd ? 'opacity:0.6;' : ''}">${initial}</div>
          <div style="background:#1A1D24;border:1px solid #2E3340;border-radius:4px;padding:1px 6px;margin-top:2px;font-size:10px;color:#F0F2F5;white-space:nowrap;">${name}${isDnd ? ' 🔕' : ''}</div>
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
  }, [filteredDrivers]);

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
