import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusDot } from '@/components/StatusDot';
import { STATUS_OPTIONS, TRUCK_TYPES, VISIBILITY_OPTIONS } from '@/lib/constants';
import type { UserStatus, VisibilityMode } from '@/lib/types';
import { User, Truck, Eye, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [truckType, setTruckType] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<UserStatus>('available');
  const [visibility, setVisibility] = useState<VisibilityMode>('visible_nearby');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setTruckType(profile.truck_type || '');
      setBio(profile.bio || '');
      setStatus(profile.status);
      setVisibility(profile.visibility_mode);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    await supabase.from('driver_profiles').update({
      display_name: displayName,
      truck_type: truckType || null,
      bio: bio || null,
      status,
      visibility_mode: visibility,
      dnd_enabled: status === 'dnd',
    }).eq('user_id', user.id);

    await supabase.from('driver_presence').update({
      status,
      is_visible: visibility !== 'hidden',
    }).eq('user_id', user.id);

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your driver profile</p>
      </div>

      {/* Avatar + Name */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
            <div className="flex items-center gap-1.5">
              <StatusDot status={status} size="md" />
              <span className="text-sm text-muted-foreground capitalize">{status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Display Name
            </label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              <Truck className="w-3.5 h-3.5 inline mr-1" />
              Truck Type
            </label>
            <select
              value={truckType}
              onChange={(e) => setTruckType(e.target.value)}
              className="w-full rounded-md bg-secondary border border-border text-foreground px-3 py-2 text-sm"
            >
              <option value="">Select truck type</option>
              {TRUCK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-secondary border border-border text-foreground px-3 py-2 text-sm resize-none"
              placeholder="Tell other drivers about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm border transition-colors ${
                status === opt.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <StatusDot status={opt.value} size="md" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Visibility
        </h3>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm border w-full text-left transition-colors ${
                visibility === opt.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saved ? (
          <><CheckCircle className="w-4 h-4 mr-1" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save Profile'}</>
        )}
      </Button>
    </div>
  );
}
