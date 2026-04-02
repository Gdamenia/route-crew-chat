import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { NearbyDriversList } from '@/components/NearbyDriversList';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useTranslation } from '@/hooks/useTranslation';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { DrivingBanner } from '@/components/DrivingBanner';
import { BottomNav } from '@/components/BottomNav';
import type { DriverWithProfile } from '@/lib/types';
import { Map, List } from 'lucide-react';

export default function MapFullPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { myRoute, nearbyDrivers } = usePresenceStore();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  useGeolocation(true);
  const isDriving = profile?.status === 'driving';

  const handleDriverSelect = (driver: DriverWithProfile) => {
    navigate(`/dm/${driver.user_id}`, { state: { name: driver.driver_profiles?.display_name } });
  };

  return (
    <div className="flex flex-col h-screen bg-background page-enter">
      <DrivingBanner />
      {!isDriving && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border z-10">
          <div>
            <span className="text-foreground font-black text-lg tracking-tight">RouteLink</span>
            {myRoute && (
              <span className="ml-2 text-xs bg-primary/10 text-primary border border-primary/50 px-2 py-0.5 rounded-md font-semibold">
                📍 {myRoute}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Map/List toggle */}
            <div className="flex bg-secondary border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('map')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <Map className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            {nearbyDrivers.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground bg-secondary border border-border px-2.5 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-dot" />
                {nearbyDrivers.length} {t('map.nearby')}
              </span>
            )}
            <button onClick={() => navigate('/profile')} className="p-0.5 bg-primary rounded-full">
              {profile && <AvatarDisplay name={profile.display_name} photoUrl={profile.photo_url} size="sm" />}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'map' ? (
          <MapView onDriverSelect={handleDriverSelect} />
        ) : (
          <div className="h-full overflow-y-auto">
            <NearbyDriversList onDriverSelect={handleDriverSelect} />
          </div>
        )}
      </div>

      <BottomNav active="map" />
    </div>
  );
}
