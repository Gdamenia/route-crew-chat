import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
import { profileService } from '@/services/profileService';
import { haptic } from '@/lib/haptic';
import { authService } from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { RouteInput } from '@/components/ui/RouteInput';
import { RouteButton } from '@/components/ui/RouteButton';
import { StatusBadge } from '@/components/StatusBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { STATUS_OPTIONS, VISIBILITY_OPTIONS, TRUCK_TYPES, LANGUAGES } from '@/lib/constants';
import type { UserStatus, VisibilityMode, DriverProfile } from '@/lib/types';
import { Camera, Radio, LogOut, ChevronRight, Shield, CheckCircle2, Ban, Globe } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfileFullPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, setProfile, user, setUser, reset } = useAuthStore();
  const { blockedIds, unblockUser } = useBlockStore();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [truckType, setTruckType] = useState(profile?.truck_type ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'status' | 'settings'>('profile');
  const [blockedProfiles, setBlockedProfiles] = useState<DriverProfile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (blockedIds.size === 0) { setBlockedProfiles([]); return; }
    const ids = Array.from(blockedIds);
    supabase.from('driver_profiles').select('*').in('user_id', ids).then(({ data }) => {
      if (data) setBlockedProfiles(data as unknown as DriverProfile[]);
    });
  }, [blockedIds.size]);

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
    haptic();
    await profileService.updateStatus(profile.user_id, status);
    setProfile({ ...profile, status, dnd_enabled: status === 'dnd' });
  };

  const handleVisibilityChange = async (visibility_mode: VisibilityMode) => {
    if (!profile) return;
    await profileService.updateVisibility(profile.user_id, visibility_mode);
    setProfile({ ...profile, visibility_mode });
  };

  const handleLanguageChange = async (langCode: string) => {
    if (!profile) return;
    haptic();
    try {
      await profileService.updateProfile(profile.user_id, { language: langCode } as any);
      setProfile({ ...profile, language: langCode });
      // Also update user store so useTranslation picks it up
      if (user) {
        await supabase.from('users').update({ language: langCode }).eq('id', user.id);
        setUser({ ...user, language: langCode as any });
      }
      toast.success('✓');
    } catch {
      toast.error(t('general.error'));
    }
  };

  const handleSignOut = async () => {
    if (!confirm(t('general.signOutConfirm'))) return;
    await authService.signOut();
    reset();
  };

  if (!profile) return null;

  const statusLabels: Record<string, string> = {
    available: t('status.available'),
    driving: t('status.driving'),
    resting: t('status.resting'),
    dnd: t('status.dnd'),
  };

  const currentLang = profile.language ?? user?.language ?? 'en';

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="text-lg font-black text-foreground tracking-tight">{t('profile.title')}</h1>
        <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive text-sm font-medium transition-colors min-h-[44px] flex items-center">{t('auth.signOut')}</button>
      </div>

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
        <div className="flex items-center gap-1.5">
          <p className="text-foreground font-bold text-lg mt-3">{profile.display_name}</p>
          {profile.is_verified && <VerifiedBadge size="md" />}
        </div>
        <StatusBadge status={profile.status} showLabel size="md" />
      </div>

      <div className="flex border-b border-border bg-card">
        {[
          { key: 'profile', label: t('profile.title') },
          { key: 'status', label: t('profile.driverStatus') },
          { key: 'settings', label: t('profile.settings') },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key as any)}
            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors min-h-[44px] ${
              activeSection === tab.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'profile' && (
          <div className="space-y-0">
            <RouteInput label={t('profile.displayName')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">{t('profile.truckType')}</label>
              <div className="flex flex-wrap gap-2">
                {TRUCK_TYPES.map((tt) => (
                  <button key={tt} type="button" onClick={() => setTruckType(truckType === tt ? '' : tt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-h-[44px] ${
                      truckType === tt ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                    {tt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('profile.bio')}</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="..." maxLength={200} rows={3}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors" />
            </div>
            <RouteButton onClick={handleSave} loading={saving} size="lg">{t('profile.save')}</RouteButton>
          </div>
        )}

        {activeSection === 'status' && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">{t('profile.driverStatus')}</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = profile.status === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors min-h-[48px] ${
                        isSelected ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-muted-foreground'
                      }`}>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                      <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {statusLabels[opt.value] || opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">{t('profile.visibility')}</p>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isSelected = profile.visibility_mode === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleVisibilityChange(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors min-h-[48px] ${
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
                <p className="text-muted-foreground text-xs leading-relaxed">{t('general.hiddenWarning')}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-3">
            {/* Language selector */}
            <div className="bg-secondary border border-border rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">{t('profile.language')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors min-h-[44px] ${
                      currentLang === lang.code ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:border-muted-foreground'
                    }`}>
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-medium truncate ${currentLang === lang.code ? 'text-primary' : 'text-foreground'}`}>{lang.native}</p>
                    </div>
                    {currentLang === lang.code && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => navigate('/channels')} className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:border-muted-foreground transition-colors min-h-[48px]">
              <Radio className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground text-sm">{t('channels.title')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Blocked Users */}
            <div className="bg-secondary border border-border rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">{t('block.blockedUsers')}</span>
              </div>
              {blockedProfiles.length === 0 ? (
                <p className="text-muted-foreground text-xs">{t('block.noBlocked')}</p>
              ) : (
                <div className="space-y-2">
                  {blockedProfiles.map((bp) => (
                    <div key={bp.user_id} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                      <AvatarDisplay name={bp.display_name} photoUrl={bp.photo_url} size="sm" />
                      <span className="flex-1 text-foreground text-sm truncate">{bp.display_name}</span>
                      <button
                        onClick={async () => {
                          if (!profile) return;
                          await unblockUser(profile.user_id, bp.user_id);
                          toast.success(t('block.unblocked'));
                        }}
                        className="text-xs text-primary font-medium px-2 py-1 min-h-[44px] flex items-center"
                      >
                        {t('block.unblock')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:border-destructive transition-colors min-h-[48px]">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="flex-1 text-left text-destructive text-sm font-medium">{t('auth.signOut')}</span>
            </button>
            <p className="text-center text-muted-foreground text-xs mt-6">RouteLink v1.0.0</p>
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
