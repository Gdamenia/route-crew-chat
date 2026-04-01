import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelService } from '@/services/channelService';
import { useAuthStore } from '@/stores/authStore';
import { useChannelStore } from '@/stores/channelStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useTranslation } from '@/hooks/useTranslation';
import { haptic } from '@/lib/haptic';
import { PullToRefresh } from '@/components/PullToRefresh';
import type { RouteChannel } from '@/lib/types';
import { ArrowLeft, RefreshCw, MessageSquare, Radio, ChevronRight } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { DrivingBanner } from '@/components/DrivingBanner';
import { SkeletonCard } from '@/components/Skeletons';

export default function ChannelsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { channels, setChannels, updateChannel } = useChannelStore();
  const { myRoute } = usePresenceStore();
  const [loading, setLoading] = useState(channels.length === 0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'joined' | 'all'>('joined');
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await channelService.getAllChannels(profile.user_id);
      setChannels(data);
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (loadedRef.current && channels.length > 0) return;
    loadedRef.current = true;
    load();
  }, [load]);

  const handleJoinLeave = async (channel: RouteChannel & { is_member?: boolean }) => {
    if (!profile) return;
    haptic();
    setTogglingId(channel.id);
    try {
      if (channel.is_member) {
        await channelService.leaveChannel(channel.id, profile.user_id);
        updateChannel({ ...channel, is_member: false } as any);
      } else {
        await channelService.joinChannel(channel.id, profile.user_id);
        updateChannel({ ...channel, is_member: true } as any);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const joinedChannels = channels.filter((c: any) => c.is_member);
  const suggestedChannels = channels.filter((c: any) => !c.is_member && myRoute && c.route_name.toLowerCase().includes(myRoute.toLowerCase().split(' ')[0]));
  const allChannels = channels.filter((c: any) => !c.is_member);
  const displayList = activeTab === 'joined' ? [...joinedChannels, ...suggestedChannels] : allChannels;

  return (
    <div className="flex flex-col h-screen bg-background page-enter">
      <DrivingBanner />
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-foreground tracking-tight flex-1">{t('channels.title')}</h1>
        <button onClick={() => { setLoading(true); load(); }} className="text-muted-foreground hover:text-primary">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-border bg-card">
        {[
          { key: 'joined', label: `${t('channels.myChannels')}${joinedChannels.length > 0 ? ` (${joinedChannels.length})` : ''}` },
          { key: 'all', label: t('channels.allChannels') },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as 'joined' | 'all')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <PullToRefresh onRefresh={load} className="p-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : displayList.length === 0 ? (
          <div className="text-center pt-16 px-4">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-foreground font-semibold mb-1">
              {activeTab === 'joined' ? t('channels.noJoined') : t('channels.noAvailable')}
            </p>
            {activeTab === 'joined' && (
              <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                Join a route channel to chat with drivers on your highway. Tap "All Channels" above to browse.
              </p>
            )}
          </div>
        ) : displayList.map((channel: any) => {
          const isSuggested = !channel.is_member && suggestedChannels.includes(channel);
          return (
            <div key={channel.id} className="bg-secondary border border-border rounded-xl overflow-hidden">
              {isSuggested && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border-b border-primary/50">
                  <span className="text-primary text-xs font-semibold">{t('channels.yourRoute')}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Radio className={`w-5 h-5 ${channel.is_member ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{channel.route_name}</p>
                  {channel.description && <p className="text-muted-foreground text-xs truncate mt-0.5">{channel.description}</p>}
                </div>
                <button
                  onClick={() => handleJoinLeave(channel)}
                  disabled={togglingId === channel.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
                    channel.is_member
                      ? 'bg-accent border border-border text-muted-foreground hover:border-destructive hover:text-destructive'
                      : 'bg-primary text-primary-foreground hover:bg-primary/80'
                  }`}>
                  {togglingId === channel.id ? '...' : channel.is_member ? t('channels.leave') : t('channels.join')}
                </button>
              </div>
              {channel.is_member && (
                <button onClick={() => navigate(`/chat/${channel.id}`, { state: { channelName: channel.route_name } })}
                  className="w-full flex items-center justify-between px-3 py-2 bg-primary/10 border-t border-primary/50 hover:bg-primary/20 transition-colors min-h-[44px]">
                  <span className="text-primary text-xs font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t('channels.openChat')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>
          );
        })}
      </PullToRefresh>

      <BottomNav active="channels" />
    </div>
  );
}
