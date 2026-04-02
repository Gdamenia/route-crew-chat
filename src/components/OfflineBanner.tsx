import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { t } = useTranslation();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium z-50">
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{t('offline.banner')}</span>
    </div>
  );
}
