import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import type { DriverWithProfile } from '@/lib/types';
import { Map, MessageSquare, User } from 'lucide-react';

export default function MapFullPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { myRoute, nearbyDrivers } = usePresenceStore();
  const [selectedDriver, setSelectedDriver] = useState<DriverWithProfile | null>(null);
  useGeolocation(true);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
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
          {nearbyDrivers.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-foreground bg-secondary border border-border px-2.5 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-dot" />
              {nearbyDrivers.length} nearby
            </span>
          )}
          <button onClick={() => navigate('/channels')} className="p-2 bg-secondary border border-border rounded-lg hover:border-primary transition-colors">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/profile')} className="p-0.5 bg-primary rounded-full">
            {profile && <AvatarDisplay name={profile.display_name} photoUrl={profile.photo_url} size="sm" />}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView onDriverSelect={setSelectedDriver} />

        {/* Bottom tab bar */}
        <div className="absolute bottom-0 left-0 right-0 flex bg-card/95 border-t border-border backdrop-blur-sm z-50">
          {[
            { label: 'Map', icon: Map, active: true, path: '/' },
            { label: 'Channels', icon: MessageSquare, active: false, path: '/channels' },
            { label: 'Profile', icon: User, active: false, path: '/profile' },
          ].map((tab) => (
            <button key={tab.label} onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                tab.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
