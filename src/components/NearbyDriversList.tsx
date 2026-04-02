import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '@/stores/presenceStore';
import { useBlockStore } from '@/stores/blockStore';
import { useTranslation } from '@/hooks/useTranslation';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { StatusBadge } from '@/components/StatusBadge';
import type { DriverWithProfile, UserStatus } from '@/lib/types';
import { MessageCircle } from 'lucide-react';

interface NearbyDriversListProps {
  onDriverSelect?: (driver: DriverWithProfile) => void;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  const mi = km * 0.621371;
  if (mi < 0.1) return '< 0.1 mi';
  return `${mi.toFixed(1)} mi`;
}

export const NearbyDriversList = memo(function NearbyDriversList({ onDriverSelect }: NearbyDriversListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { myLocation, nearbyDrivers } = usePresenceStore();
  const { isBlocked } = useBlockStore();

  const filtered = nearbyDrivers
    .filter(d => !isBlocked(d.user_id) && d.lat != null && d.lng != null)
    .map(d => ({
      ...d,
      distance: myLocation ? getDistanceKm(myLocation.lat, myLocation.lng, d.lat!, d.lng!) : 999,
    }))
    .sort((a, b) => a.distance - b.distance);

  if (filtered.length === 0) {
    return (
      <div className="text-center pt-16 px-6">
        <div className="text-4xl mb-3">🛣️</div>
        <p className="text-foreground font-semibold mb-1">{t('map.noDrivers')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {filtered.map(driver => {
        const p = driver.driver_profiles;
        const name = p?.display_name ?? '?';
        return (
          <button
            key={driver.user_id}
            onClick={() => navigate(`/dm/${driver.user_id}`, { state: { name } })}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors min-h-[60px]"
          >
            <AvatarDisplay name={name} photoUrl={p?.photo_url} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-foreground font-semibold text-sm truncate">{name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={(p?.status ?? 'available') as UserStatus} showLabel size="sm" />
                {driver.current_route && (
                  <span className="text-primary text-xs font-medium truncate">📍 {driver.current_route}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-muted-foreground text-xs">{formatDistance(driver.distance)}</span>
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
          </button>
        );
      })}
    </div>
  );
});
