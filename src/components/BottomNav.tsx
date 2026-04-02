import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import { Map, MessageSquare, User, MessageCircle } from 'lucide-react';
import { useUnreadStore } from '@/stores/unreadStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { haptic } from '@/lib/haptic';

export const BottomNav = memo(function BottomNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const { unreadDMs, unreadChannels } = useUnreadStore();
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const isDriving = profile?.status === 'driving';

  const tabs = [
    { key: 'map', label: t('nav.map'), path: '/', icon: Map, badge: 0 },
    { key: 'channels', label: t('nav.channels'), path: '/channels', icon: MessageSquare, badge: unreadChannels },
    { key: 'messages', label: t('nav.messages'), path: '/messages', icon: MessageCircle, badge: unreadDMs },
    { key: 'profile', label: t('nav.profile'), path: '/profile', icon: User, badge: 0 },
  ];

  return (
    <div className="flex-shrink-0 flex bg-card border-t border-border">
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => { haptic(); navigate(tab.path); }}
          className={`flex-1 flex flex-col items-center ${isDriving ? 'py-4' : 'py-3'} gap-0.5 transition-colors relative min-h-[48px] ${
            active === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <div className="relative">
            <tab.icon className={`${isDriving ? 'w-7 h-7' : 'w-5 h-5'} ${active === tab.key ? 'tab-active-icon' : ''}`} />
            {tab.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-[9px] text-destructive-foreground font-bold">{tab.badge > 9 ? '9+' : tab.badge}</span>
              </span>
            )}
          </div>
          <span className={`font-medium ${isDriving ? 'text-[11px]' : 'text-xs'}`}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
});
