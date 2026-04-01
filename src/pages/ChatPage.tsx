import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { channelService } from '@/services/channelService';
import { useAuthStore } from '@/stores/authStore';
import { useChannelStore } from '@/stores/channelStore';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { formatChatTime } from '@/lib/helpers';
import { ArrowLeft, Mic, Send, AlertTriangle } from 'lucide-react';

export default function ChatPage() {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = (location.state as { channelName?: string } | null)?.channelName ?? 'Route Channel';
  const { profile } = useAuthStore();
  const { messages, setMessages, appendMessage } = useChannelStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const resolvedChannelId = channelId ?? '';
  const channelMessages = messages[resolvedChannelId] ?? [];

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  useEffect(() => {
    if (!resolvedChannelId) return;

    let isMounted = true;
    const hasCachedMessages = (useChannelStore.getState().messages[resolvedChannelId] ?? []).length > 0;

    if (!hasCachedMessages) {
      setLoading(true);
    } else {
      setLoading(false);
      scrollToBottom();
    }

    setError('');

    channelService
      .getMessages(resolvedChannelId)
      .then((data) => {
        if (!isMounted) return;
        setMessages(resolvedChannelId, data);
        setLoading(false);
        scrollToBottom();
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
        setError('Failed to load messages. Please try again.');
      });

    const unsubscribe = channelService.subscribeToMessages(resolvedChannelId, (msg) => {
      appendMessage(resolvedChannelId, msg);
      scrollToBottom(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [resolvedChannelId, setMessages, appendMessage]);

  useEffect(() => {
    if (channelMessages.length > 0) {
      scrollToBottom();
    }
  }, [channelMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || !profile || !resolvedChannelId || sending) return;

    const trimmed = text.trim();
    setText('');
    setSending(true);
    setError('');

    try {
      const newMessage = await channelService.sendMessage(resolvedChannelId, profile.user_id, trimmed);
      appendMessage(resolvedChannelId, newMessage);
      scrollToBottom(true);
    } catch {
      setText(trimmed);
      setError('Message failed to send. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/channels')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <p className="text-foreground font-bold text-base">{channelName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-dot" />
            <span className="text-status-available text-xs font-semibold">Live Channel</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/voice/${resolvedChannelId}`, { state: { channelName } })}
          className="p-2 bg-primary/10 border border-primary/50 rounded-xl hover:bg-primary/20 transition-colors"
          aria-label="Open voice room"
        >
          <Mic className="w-5 h-5 text-primary" />
        </button>
      </div>

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
        ) : channelMessages.length === 0 ? (
          <div className="text-center pt-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground">No messages yet. Be the first!</p>
          </div>
        ) : (
          channelMessages.map((msg, idx) => {
            const isSelf = msg.sender_user_id === profile?.user_id;
            const prevMsg = channelMessages[idx - 1];
            const showAvatar = !isSelf && (!prevMsg || prevMsg.sender_user_id !== msg.sender_user_id);
            const senderName = msg.sender?.display_name ?? 'Driver';

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isSelf && (
                  <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    <AvatarDisplay name={senderName} photoUrl={msg.sender?.photo_url} size="sm" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {showAvatar && !isSelf && <p className="text-muted-foreground text-xs mb-1 px-1">{senderName}</p>}

                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isSelf
                        ? 'bg-primary text-primary-foreground rounded-br-md font-medium'
                        : 'bg-secondary border border-border text-foreground rounded-bl-md'
                    }`}
                  >
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

      <div className="flex-shrink-0 flex items-end gap-3 px-4 py-3 bg-card border-t border-border">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
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
