import { usePresence, NearbyDriver } from '@/hooks/usePresence';
import { useAuth } from '@/contexts/AuthContext';
import { StatusDot } from '@/components/StatusDot';
import { MapPin, Users, Navigation, Clock } from 'lucide-react';
import type { UserStatus } from '@/lib/types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function MapPage() {
  const { drivers, loading } = usePresence();
  const { user } = useAuth();

  const otherDrivers = drivers.filter((d) => d.user_id !== user?.id);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
        <p className="text-muted-foreground text-sm mt-1">Nearby drivers on your routes</p>
      </div>

      {/* Map placeholder */}
      <div className="relative w-full h-64 md:h-80 bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-medium">Map View</p>
            <p className="text-muted-foreground text-sm">Interactive map coming soon</p>
            <p className="text-muted-foreground text-xs mt-1">Connect a map provider to enable live tracking</p>
          </div>
        </div>

        {/* Driver dots overlay */}
        {otherDrivers.slice(0, 8).map((d, i) => (
          <div
            key={d.id}
            className="absolute"
            style={{
              top: `${20 + (i * 8) % 60}%`,
              left: `${10 + (i * 13) % 80}%`,
            }}
          >
            <div className="relative group cursor-pointer">
              <StatusDot status={d.status as UserStatus} size="md" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                {d.driver_profiles?.display_name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nearby drivers list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Nearby Drivers {!loading && <span className="text-muted-foreground text-sm font-normal">({otherDrivers.length})</span>}
          </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        ) : otherDrivers.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No drivers nearby right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {otherDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverCard({ driver }: { driver: NearbyDriver }) {
  const p = driver.driver_profiles;
  return (
    <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
        {p?.display_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{p?.display_name}</span>
          <StatusDot status={(driver.status as UserStatus) || 'available'} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {p?.truck_type && (
            <span className="text-xs text-muted-foreground">{p.truck_type}</span>
          )}
          {driver.current_route && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {driver.current_route}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Clock className="w-3 h-3" />
        {timeAgo(driver.last_seen_at)}
      </div>
    </div>
  );
}
