import type { DriverWithProfile } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { formatRelativeTime } from '@/lib/helpers';
import type { UserStatus } from '@/lib/types';
import { X } from 'lucide-react';

interface DriverCardProps {
  driver: DriverWithProfile;
  onClose: () => void;
  onViewProfile: () => void;
}

export function DriverCard({ driver, onClose, onViewProfile }: DriverCardProps) {
  const p = driver.driver_profiles;
  if (!p) return null;

  return (
    <div className="bg-secondary border border-border rounded-2xl p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <AvatarDisplay name={p.display_name} photoUrl={p.photo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-foreground font-bold text-base truncate">{p.display_name}</p>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <StatusBadge status={p.status as UserStatus} showLabel size="sm" />
          {driver.current_route && (
            <p className="text-primary text-xs mt-1 font-medium">📍 {driver.current_route}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {p.truck_type && <span className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded-md">{p.truck_type}</span>}
            {p.dnd_enabled && <span className="text-xs bg-accent text-destructive px-2 py-1 rounded-md">🔇 DND</span>}
            <span className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded-md">{formatRelativeTime(driver.last_seen_at)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onViewProfile}
          className="flex-1 bg-primary/10 border border-primary/50 text-primary text-sm font-semibold py-2 rounded-xl hover:bg-primary/20 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
