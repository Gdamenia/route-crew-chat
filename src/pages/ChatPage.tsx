import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { channelService } from '@/services/channelService';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
import { useChannelStore } from '@/stores/channelStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { DrivingBanner } from '@/components/DrivingBanner';
import { PresetChips } from '@/components/PresetChips';
import { ReportModal } from '@/components/ReportModal';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { VoiceMessagePlayer } from '@/components/VoiceMessagePlayer';
import { LocationMessage } from '@/components/LocationMessage';
import { NewMessagesButton } from '@/components/NewMessagesButton';
import { formatChatTime } from '@/lib/helpers';
import { haptic } from '@/lib/haptic';
import { ArrowLeft, Mic, Send, AlertTriangle, Clock, RotateCcw, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { RouteMessage } from '@/lib/types';

interface OptimisticMessage {
  id: string;
  text_content: string;
  sender_user_id: string;
  created_at: string;
  channel_id: string;
  status: 'sending' | 'failed';
  message_type?: string;
  media_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  sender?: { display_name: string };
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = (location.state as { channelName?: string } | null)?.channelName ?? 'Route Channel';
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const { messages, setMessages, appendMessage } = useChannelStore();
  const { isBlocked } = useBlockStore();
  const { myLocation } = usePresenceStore();
  const { checkLimit } = useRateLimiter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [optimistic, setOptimistic] = useState<OptimisticMessage[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('');
  const [showNewMsg, setShowNewMsg] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDriving = profile?.status === 'driving';

  const resolvedChannelId = channelId ?? '';
  const channelMessages = messages[resolvedChannelId] ?? [];

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      setShowNewMsg(false);
    });
  };

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, []);

  useEffect(() => {
    if (!resolvedChannelId) return;
    let isMounted = true;
    const hasCached = (useChannelStore.getState().messages[resolvedChannelId] ?? []).length > 0;
    if (!hasCached) setLoading(true);
    else { setLoading(false); scrollToBottom(); }
    setError('');

    channelService.getMessages(resolvedChannelId).then((data) => {
      if (!isMounted) return;
      setMessages(resolvedChannelId, data);
      setLoading(false);
      scrollToBottom();
    }).catch(() => {
      if (!isMounted) return;
      setLoading(false);
      setError(t('chat.loadFailed'));
    });

    const unsubscribe = channelService.subscribeToMessages(resolvedChannelId, (msg) => {
      setOptimistic((prev) => prev.filter((o) => o.text_content !== msg.text_content || o.sender_user_id !== msg.sender_user_id));
      appendMessage(resolvedChannelId, msg);
      if (isNearBottom()) scrollToBottom(true);
      else setShowNewMsg(true);
    });

    return () => { isMounted = false; unsubscribe(); };
  }, [resolvedChannelId, setMessages, appendMessage]);

  useEffect(() => {
    if (channelMessages.length > 0 && isNearBottom()) scrollToBottom();
  }, [channelMessages.length]);

  const sendText = async (content: string) => {
    if (!content.trim() || !profile || !resolvedChannelId) return;
    const { allowed } = checkLimit();
    if (!allowed) { toast.error(t('chat.rateLimited') || 'Slow down! Too many messages.'); return; }
    haptic();
    const trimmed = content.trim();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const tempId = `opt_${Date.now()}`;
    const optMsg: OptimisticMessage = {
      id: tempId, text_content: trimmed, sender_user_id: profile.user_id,
      created_at: new Date().toISOString(), channel_id: resolvedChannelId, status: 'sending',
      message_type: 'text', sender: { display_name: profile.display_name },
    };
    setOptimistic((prev) => [...prev, optMsg]);
    scrollToBottom(true);

    try {
      await channelService.sendMessage(resolvedChannelId, profile.user_id, trimmed);
    } catch {
      setOptimistic((prev) => prev.map((o) => o.id === tempId ? { ...o, status: 'failed' as const } : o));
    }
  };

  const sendVoice = async (url: string, _duration: number) => {
    if (!profile || !resolvedChannelId) return;
    haptic();
    try {
      await channelService.sendMessage(resolvedChannelId, profile.user_id, '🎤 Voice message', 'voice', url);
      toast.success(t('chat.voiceSent') || 'Voice message sent');
    } catch {
      toast.error(t('chat.sendFailed'));
    }
  };

  const sendLocation = async () => {
    if (!profile || !resolvedChannelId || !myLocation) return;
    haptic();
    try {
      await channelService.sendMessage(resolvedChannelId, profile.user_id, '📍 Location shared', 'location', undefined, myLocation.lat, myLocation.lng);
      toast.success(t('chat.locationSent') || 'Location shared');
    } catch {
      toast.error(t('chat.sendFailed'));
    }
  };

  const handleRetry = (msg: OptimisticMessage) => {
    setOptimistic((prev) => prev.filter((o) => o.id !== msg.id));
    sendText(msg.text_content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(text); }
  };

  const allMessages = [
    ...channelMessages.filter((m) => !isBlocked(m.sender_user_id)).map((m) => ({ ...m, _type: 'real' as const })),
    ...optimistic.map((m) => ({ ...m, _type: 'optimistic' as const })),
  ];

  const renderMessageContent = (msg: any, isSelf: boolean) => {
    const type = msg.message_type || 'text';
    if (type === 'voice' && msg.media_url) {
      return <VoiceMessagePlayer url={msg.media_url} duration={30} isSelf={isSelf} />;
    }
    if (type === 'location' && msg.location_lat != null && msg.location_lng != null) {
      return <LocationMessage lat={msg.location_lat} lng={msg.location_lng} isSelf={isSelf} />;
    }
    return <>{msg.text_content}</>;
  };

  return (
    <div className="flex flex-col h-screen bg-background page-enter">
      <DrivingBanner />
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/channels')} className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-foreground font-bold text-base">{channelName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-dot" />
            <span className="text-status-available text-xs font-semibold">{t('chat.liveChannel')}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/voice/${resolvedChannelId}`, { state: { channelName } })}
          className="p-2 bg-primary/10 border border-primary/50 rounded-xl hover:bg-primary/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open voice room"
        >
          <Mic className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-muted-foreground text-xs">{t('chat.24hBanner')}</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-destructive text-xs">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="text-center pt-16">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-muted-foreground">{t('chat.noMessages')}</p>
          </div>
        ) : (
          allMessages.map((msg, idx) => {
            const isSelf = msg.sender_user_id === profile?.user_id;
            const prevMsg = allMessages[idx - 1];
            const showAvatar = !isSelf && (!prevMsg || prevMsg.sender_user_id !== msg.sender_user_id);
            const senderName = msg.sender?.display_name ?? 'Driver';
            const isOpt = msg._type === 'optimistic';
            const optStatus = isOpt ? (msg as any).status : null;

            return (
              <div key={msg.id} className={`msg-appear flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                onContextMenu={(e) => { if (!isOpt) { e.preventDefault(); setReportTargetId(msg.id); setReportOpen(true); } }}
              >
                {!isSelf && (
                  <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    <AvatarDisplay name={senderName} photoUrl={(msg as any).sender?.photo_url} size="sm" />
                  </div>
                )}
                <div className={`flex flex-col max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {showAvatar && !isSelf && (
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <p className="text-muted-foreground text-xs">{senderName}</p>
                      {(msg as any).sender?.is_verified && <VerifiedBadge />}
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-base leading-relaxed ${
                    optStatus === 'failed'
                      ? 'bg-destructive/20 border border-destructive/50 text-destructive rounded-br-md'
                      : isSelf
                      ? 'bg-primary text-primary-foreground rounded-br-md font-medium'
                      : 'bg-secondary border border-border text-foreground rounded-bl-md'
                  } ${optStatus === 'sending' ? 'opacity-60' : ''}`}>
                    {renderMessageContent(msg, isSelf)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    {optStatus === 'sending' && <span className="text-muted-foreground text-xs">{t('chat.sending')}</span>}
                    {optStatus === 'failed' && (
                      <button onClick={() => handleRetry(msg as any)} className="flex items-center gap-1 text-destructive text-xs font-medium">
                        <RotateCcw className="w-3 h-3" /> {t('chat.retry')}
                      </button>
                    )}
                    {!isOpt && <p className="text-muted-foreground text-xs">{formatChatTime(msg.created_at)}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
        <NewMessagesButton visible={showNewMsg} onClick={() => scrollToBottom(true)} />
      </div>

      <div className="flex-shrink-0 px-4 py-1 bg-card border-t border-border">
        <PresetChips onSend={sendText} />
      </div>

      <div className="flex-shrink-0 flex items-end gap-2 px-4 py-3 bg-card border-t border-border">
        {myLocation && (
          <button onClick={sendLocation} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]" aria-label="Share location">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <VoiceRecorder onRecorded={sendVoice} disabled={isDriving} large={isDriving} />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.message')}
          rows={1}
          className={`flex-1 bg-secondary border border-border rounded-2xl px-4 py-2.5 text-foreground placeholder-muted-foreground ${isDriving ? 'text-base' : 'text-sm'} resize-none focus:outline-none focus:border-primary transition-colors max-h-24`}
        />
        <button
          onClick={() => sendText(text)}
          disabled={!text.trim()}
          className={`${isDriving ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/80 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]`}
          aria-label={t('chat.send')}
        >
          <Send className={isDriving ? 'w-5 h-5 text-primary-foreground' : 'w-4 h-4 text-primary-foreground'} />
        </button>
      </div>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="message" targetId={reportTargetId} />
    </div>
  );
}
