import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { RouteInput } from '@/components/ui/RouteInput';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TRUCK_TYPES, LANGUAGES } from '@/lib/constants';
import type { Language } from '@/lib/types';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, profile, setProfile, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [truckType, setTruckType] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      navigate('/', { replace: true });
      return;
    }
    if (session?.user) {
      profileService.getProfile(session.user.id).then((p) => {
        if (p) { setProfile(p); navigate('/', { replace: true }); }
        else setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session, profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { setError(t('profile.displayName') + ' is required'); return; }
    if (!session?.user) { setError('Not authenticated'); return; }
    setLoading(true);
    setError('');
    try {
      const created = await profileService.createProfile(session.user.id, displayName.trim());
      const updated = truckType ? await profileService.updateProfile(session.user.id, { truck_type: truckType }) : created;
      setProfile({ ...created, ...updated });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Failed to create profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">{t('profile.createTitle')}</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{t('profile.createSubtitle')}</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleCreate}>
          <RouteInput label={t('profile.displayName')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. BigRig_Mike" maxLength={30} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('profile.truckType')}</label>
            <div className="flex flex-wrap gap-2">
              {TRUCK_TYPES.map((tt) => (
                <button key={tt} type="button" onClick={() => setTruckType(truckType === tt ? '' : tt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    truckType === tt ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground'
                  }`}>
                  {tt}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('profile.language')}</label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} type="button" onClick={() => setLanguage(l.code)}
                  className={`flex flex-col items-center py-2.5 rounded-xl border transition-colors ${
                    language === l.code ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-muted-foreground'
                  }`}>
                  <span className="text-xl">{l.flag}</span>
                  <span className={`text-[10px] mt-1 font-medium ${language === l.code ? 'text-primary' : 'text-muted-foreground'}`}>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
          <RouteButton type="submit" size="lg" loading={loading}>{t('profile.createButton')}</RouteButton>
        </form>
      </div>
    </div>
  );
}
