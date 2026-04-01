import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { RouteInput } from '@/components/ui/RouteInput';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { TRUCK_TYPES, LANGUAGES } from '@/lib/constants';
import type { Language } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { setProfile, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [truckType, setTruckType] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { setError('Display name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const user = await authService.ensureUserRecord(session.user.id, session.user.email!, language);
      setUser(user);
      const profile = await profileService.createProfile(session.user.id, displayName.trim());
      const updated = truckType ? await profileService.updateProfile(session.user.id, { truck_type: truckType }) : profile;
      setProfile({ ...profile, ...updated });
      navigate('/');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Create Your Profile</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">This is how other drivers will see you. Use a nickname if you prefer privacy.</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleCreate}>
          <RouteInput label="Display Name / Nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. BigRig_Mike or Ivan_K" maxLength={30} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Truck Type (optional)</label>
            <div className="flex flex-wrap gap-2">
              {TRUCK_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setTruckType(truckType === t ? '' : t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    truckType === t
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} type="button" onClick={() => setLanguage(l.code)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-colors ${
                    language === l.code
                      ? 'bg-primary/10 border-primary'
                      : 'bg-secondary border-border hover:border-muted-foreground'
                  }`}>
                  <span className="text-2xl">{l.flag}</span>
                  <span className={`text-xs mt-1 font-medium ${language === l.code ? 'text-primary' : 'text-muted-foreground'}`}>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
          <RouteButton type="submit" size="lg" loading={loading}>Create Profile & Enter Map</RouteButton>
        </form>
      </div>
    </div>
  );
}
