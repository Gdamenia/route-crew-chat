import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { RouteInput } from '@/components/ui/RouteInput';
import { RouteButton } from '@/components/ui/RouteButton';
import { StatusBadge } from '@/components/StatusBadge';
import { STATUS_OPTIONS, VISIBILITY_OPTIONS, TRUCK_TYPES } from '@/lib/constants';
import type { UserStatus, VisibilityMode } from '@/lib/types';
import { Camera, Radio, LogOut, ChevronRight, Shield, CheckCircle2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';

export default function ProfileFullPage() {
  const navigate = useNavigate();
  const { profile, setProfile, reset } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [truckType, setTruckType] = useState(profile?.truck_type ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'status' | 'settings'>('profile');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(profile.user_id, {
        display_name: displayName.trim(),
        truck_type: truckType || undefined,
        bio: bio || undefined,
      } as any);
      setProfile({ ...profile, ...updated });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setPhotoUploading(true);
    try {
      const url = await profileService.uploadPhoto(profile.user_id, file);
      await profileService.updateProfile(profile.user_id, { photo_url: url } as any);
      setProfile({ ...profile, photo_url: url });
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleStatusChange = async (status: UserStatus) => {
    if (!profile) return;
    await profileService.updateStatus(profile.user_id, status);
    setProfile({ ...profile, status, dnd_enabled: status === 'dnd' });
  };

  const handleVisibilityChange = async (visibility_mode: VisibilityMode) => {
    if (!profile) return;
    await profileService.updateVisibility(profile.user_id, visibility_mode);
    setProfile({ ...profile, visibility_mode });
  };

  const handleSignOut = async () => {
    if (!confirm('Sign out of RouteLink?')) return;
    await authService.signOut();
    reset();
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="text-lg font-black text-foreground tracking-tight">Profile</h1>
        <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive text-sm font-medium transition-colors">Sign Out</button>
      </div>

      {/* Avatar section */}
      <div className="flex-shrink-0 flex flex-col items-center py-6 bg-card border-b border-border">
        <div className="relative">
          <AvatarDisplay name={profile.display_name} photoUrl={profile.photo_url} size="xl" />
          <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-card flex items-center justify-center">
            {photoUploading ? (
              <div className="w-3 h-3 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>
        <p className="text-foreground font-bold text-lg mt-3">{profile.display_name}</p>
        <StatusBadge status={profile.status} showLabel size="md" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'status', label: 'Status' },
          { key: 'settings', label: 'Settings' },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveSection(t.key as any)}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeSection === t.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'profile' && (
          <div className="space-y-0">
            <RouteInput label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Truck Type</label>
              <div className="flex flex-wrap gap-2">
                {TRUCK_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setTruckType(truckType === t ? '' : t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      truckType === t
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A bit about you..." maxLength={200} rows={3}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors" />
            </div>
            <RouteButton onClick={handleSave} loading={saving} size="lg">Save Profile</RouteButton>
          </div>
        )}

        {activeSection === 'status' && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">Driver Status</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = profile.status === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-muted-foreground'
                      }`}>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                      <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">Visibility</p>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isSelected = profile.visibility_mode === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleVisibilityChange(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-muted-foreground'
                      }`}>
                      <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4 p-3 bg-secondary rounded-xl border border-border">
                <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-xs leading-relaxed">Hidden removes you from the live map entirely. Channel visibility keeps you present only in your joined channels.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-3">
            <button onClick={() => navigate('/channels')} className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:border-muted-foreground transition-colors">
              <Radio className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground text-sm">Route Channels</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:border-destructive transition-colors">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="flex-1 text-left text-destructive text-sm font-medium">Sign Out</span>
            </button>
            <p className="text-center text-muted-foreground text-xs mt-6">RouteLink v1.0.0 — Driver Network MVP</p>
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
