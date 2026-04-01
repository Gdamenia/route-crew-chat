import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
import { dmService } from '@/services/dmService';
import { useTranslation } from '@/hooks/useTranslation';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { DrivingBanner } from '@/components/DrivingBanner';
import { PresetChips } from '@/components/PresetChips';
import { ReportModal } from '@/components/ReportModal';
import { formatChatTime } from '@/lib/helpers';
import { ArrowLeft, Send, AlertTriangle, ShieldAlert, RotateCcw, Flag, Ban } from 'lucide-react';
import type { DirectMessage, DriverProfile } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimisticDM {
  id: string;
  sender_id: string;
  receiver_id: string;
  text_content: string;
  is_read: boolean;
  created_at: string;
  status: 'sending' | 'failed';
}

export default function DMChatPage() {
  const navigate = useNavigate();
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const location = useLocation();
  const passedName = (location.state as { name?: string } | null)?.name;
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const { blockUser, isBlocked } = useBlockStore();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherProfile, setOtherProfile] = useState<DriverProfile | null>(null);
  const [optimistic, setOptimistic] = useState<OptimisticDM[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportTargetType, setReportTargetType] = useState<'user' | 'message'>('user');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDriving = profile?.status === 'driving';

  const resolvedOther = otherUserId ?? '';

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, []);

  useEffect(() => {
    if (!resolvedOther) return;
    supabase.from('driver_profiles').select('*').eq('user_id', resolvedOther).single()
      .then(({ data }) => { if (data) setOtherProfile(data as unknown as DriverProfile); });
  }, [resolvedOther]);

  useEffect(() => {
    if (!profile || !resolvedOther) return;
    let mounted = true;

    dmService.getMessages(profile.user_id, resolvedOther).then((msgs) => {
      if (!mounted) return;
      setMessages(msgs);
      setLoading(false);
      scrollToBottom();
    }).catch(() => { if (mounted) { setLoading(false); setError(t('chat.loadFailed')); } });

    dmService.markAsRead(profile.user_id, resolvedOther);

    const unsub = dmService.subscribeToDMs(profile.user_id, (msg) => {
      if (
        (msg.sender_id === resolvedOther && msg.receiver_id === profile.user_id) ||
        (msg.sender_id === profile.user_id && msg.receiver_id === resolvedOther)
      ) {
        setOptimistic((prev) => prev.filter((o) => o.text_content !== msg.text_content || o.sender_id !== msg.sender_id));
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom(true);
        if (msg.sender_id === resolvedOther) dmService.markAsRead(profile.user_id, resolvedOther);
      }
    });

    return () => { mounted = false; unsub(); };
  }, [profile?.user_id, resolvedOther]);

  const isDnd = otherProfile?.dnd_enabled || otherProfile?.status === 'dnd';
  const displayName = otherProfile?.display_name ?? passedName ?? 'Driver';

  const sendText = async (content: string) => {
    if (!content.trim() || !profile || !resolvedOther) return;
    const trimmed = content.trim();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const tempId = `opt_${Date.now()}`;
    const optMsg: OptimisticDM = {
      id: tempId,
      sender_id: profile.user_id,
      receiver_id: resolvedOther,
      text_content: trimmed,
      is_read: false,
      created_at: new Date().toISOString(),
      status: 'sending',
    };
    setOptimistic((prev) => [...prev, optMsg]);
    scrollToBottom(true);

    try {
      await dmService.sendMessage(profile.user_id, resolvedOther, trimmed);
    } catch {
      setOptimistic((prev) => prev.map((o) => o.id === tempId ? { ...o, status: 'failed' as const } : o));
    }
  };

  const handleRetry = (msg: OptimisticDM) => {
    setOptimistic((prev) => prev.filter((o) => o.id !== msg.id));
    sendText(msg.text_content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(text); }
  };

  const allMessages = [
    ...messages.map((m) => ({ ...m, _type: 'real' as const, _status: null as string | null })),
    ...optimistic.map((m) => ({ ...m, _type: 'optimistic' as const, _status: m.status })),
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <DrivingBanner />
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/messages')} className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AvatarDisplay name={displayName} photoUrl={otherProfile?.photo_url} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-foreground font-bold text-sm truncate">{displayName}</p>
              {otherProfile?.is_verified && <VerifiedBadge />}
            </div>
            {isDnd && (
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-status-dnd" />
                <span className="text-status-dnd text-xs">{t('status.dnd')}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => { setReportTargetId(resolvedOther); setReportTargetType('user'); setReportOpen(true); }} className="text-muted-foreground hover:text-destructive p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Flag className="w-4 h-4" />
        </button>
        <button onClick={async () => {
          if (!profile) return;
          if (!confirm(t('block.confirmBlock'))) return;
          try { await blockUser(profile.user_id, resolvedOther); toast.success(t('block.blocked')); navigate('/messages'); } catch { toast.error(t('general.error')); }
        }} className="text-muted-foreground hover:text-destructive p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Ban className="w-4 h-4" />
        </button>
      </div>

      {isDnd && (
        <div className="bg-status-dnd/10 border-b border-status-dnd/30 px-4 py-2">
          <p className="text-status-dnd text-xs">{t('chat.dndBanner')}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
            <p className="text-muted-foreground">{t('chat.startConversation')}</p>
          </div>
        ) : (
          allMessages.map((msg) => {
            const isSelf = msg.sender_id === profile?.user_id;
            const isOpt = msg._type === 'optimistic';
            const optStatus = msg._status;

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                onContextMenu={(e) => { if (!isOpt) { e.preventDefault(); setReportTargetId(msg.id); setReportTargetType('message'); setReportOpen(true); } }}
              >
                {!isSelf && (
                  <div className="flex-shrink-0">
                    <AvatarDisplay name={displayName} photoUrl={otherProfile?.photo_url} size="sm" />
                  </div>
                )}
                <div className={`flex flex-col max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl ${isDriving ? 'text-base' : 'text-sm'} leading-relaxed ${
                    optStatus === 'failed'
                      ? 'bg-destructive/20 border border-destructive/50 text-destructive rounded-br-md'
                      : isSelf
                      ? 'bg-primary text-primary-foreground rounded-br-md font-medium'
                      : 'bg-secondary border border-border text-foreground rounded-bl-md'
                  } ${optStatus === 'sending' ? 'opacity-60' : ''}`}>
                    {msg.text_content}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    {optStatus === 'sending' && <span className="text-muted-foreground text-xs">{t('chat.sending')}</span>}
                    {optStatus === 'failed' && (
                      <button onClick={() => handleRetry(msg as any)} className="flex items-center gap-1 text-destructive text-xs font-medium">
                        <RotateCcw className="w-3 h-3" />
                        {t('chat.retry')}
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
      </div>

      <div className="flex-shrink-0 px-4 py-1 bg-card border-t border-border">
        <PresetChips onSend={sendText} />
      </div>

      <div className="flex-shrink-0 flex items-end gap-3 px-4 py-3 bg-card border-t border-border">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={isDnd ? t('chat.deliveredSilently') : t('chat.message')}
          rows={1}
          className={`flex-1 bg-secondary border border-border rounded-2xl px-4 py-2.5 text-foreground placeholder-muted-foreground ${isDriving ? 'text-base' : 'text-sm'} resize-none focus:outline-none focus:border-primary transition-colors max-h-24`}
        />
        <button
          onClick={() => sendText(text)}
          disabled={!text.trim()}
          className={`${isDriving ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/80 transition-colors flex-shrink-0`}
          aria-label={t('chat.send')}
        >
          <Send className={isDriving ? 'w-5 h-5 text-primary-foreground' : 'w-4 h-4 text-primary-foreground'} />
        </button>
      </div>
    </div>
  );
}
