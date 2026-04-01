import { useAuthStore } from '@/stores/authStore';
import { profileService } from '@/services/profileService';
import { useTranslation } from '@/hooks/useTranslation';

export function DrivingBanner() {
  const { profile, setProfile } = useAuthStore();
  const { t } = useTranslation();

  if (profile?.status !== 'driving') return null;

  const handlePark = async () => {
    if (!profile) return;
    await profileService.updateStatus(profile.user_id, 'available');
    setProfile({ ...profile, status: 'available' as const });
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-amber-500/15 border-b border-amber-500/30">
      <p className="text-amber-400 text-xs font-semibold flex-1">{t('driving.banner')}</p>
      <button
        onClick={handlePark}
        className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors min-h-[36px]"
      >
        {t('driving.parked')}
      </button>
    </div>
  );
}
