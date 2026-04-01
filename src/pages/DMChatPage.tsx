import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { dmService } from '@/services/dmService';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { formatChatTime } from '@/lib/helpers';
import { ArrowLeft, Send, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { DirectMessage } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import type { DriverProfile } from '@/lib/types';

export default function DMChatPage() {
  const navigate = useNavigate();
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const location = useLocation();
  const passedName = (location.state as { name?: string } | null)?.name;
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherProfile, setOtherProfile] = useState<DriverProfile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const resolvedOther = otherUserId ?? '';

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  // Load other user's profile
  useEffect(() => {
    if (!resolvedOther) return;
    supabase.from('driver_profiles').select('*').eq('user_id', resolvedOther).single()
      .then(({ data }) => { if (data) setOtherProfile(data as unknown as DriverProfile); });
  }, [resolvedOther]);

  // Load messages
  useEffect(() => {
    if (!profile || !resolvedOther) return;
    let mounted = true;

    dmService.getMessages(profile.user_id, resolvedOther).then((msgs) => {
      if (!mounted) return;
      setMessages(msgs);
      setLoading(false);
      scrollToBottom();
    }).catch(() => { if (mounted) { setLoading(false); setError('Failed to load messages'); } });

    // Mark as read
    dmService.markAsRead(profile.user_id, resolvedOther);

    // Subscribe
    const unsub = dmService.subscribeToDMs(profile.user_id, (msg) => {
      if (
        (msg.sender_id === resolvedOther && msg.receiver_id === profile.user_id) ||
        (msg.sender_id === profile.user_id && msg.receiver_id === resolvedOther)
      ) {
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

  const handleSend = async () => {
    if (!text.trim() || !profile || !resolvedOther || sending) return;
    const trimmed = text.trim();
    setText('');
    setSending(true);
    setError('');
    try {
      const msg = await dmService.sendMessage(profile.user_id, resolvedOther, trimmed);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom(true);
    } catch {
      setText(trimmed);
      setError('Message failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/messages')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AvatarDisplay name={displayName} photoUrl={otherProfile?.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="text-foreground font-bold text-sm truncate">{displayName}</p>
            {isDnd && (
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-status-dnd" />
                <span className="text-status-dnd text-xs">Do Not Disturb</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DND banner */}
      {isDnd && (
        <div className="bg-status-dnd/10 border-b border-status-dnd/30 px-4 py-2">
          <p className="text-status-dnd text-xs">This driver is on DND. Your message will be delivered silently.</p>
        </div>
      )}

      {/* Messages */}
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
        ) : messages.length === 0 ? (
          <div className="text-center pt-16">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender_id === profile?.user_id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isSelf && (
                  <div className="flex-shrink-0">
                    <AvatarDisplay name={displayName} photoUrl={otherProfile?.photo_url} size="sm" />
                  </div>
                )}
                <div className={`flex flex-col max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isSelf
                      ? 'bg-primary text-primary-foreground rounded-br-md font-medium'
                      : 'bg-secondary border border-border text-foreground rounded-bl-md'
                  }`}>
                    {msg.text_content}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 px-1">{formatChatTime(msg.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex items-end gap-3 px-4 py-3 bg-card border-t border-border">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDnd ? 'Message (delivered silently)...' : 'Message...'}
          rows={1}
          className="flex-1 bg-secondary border border-border rounded-2xl px-4 py-2.5 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors max-h-24"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/80 transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
