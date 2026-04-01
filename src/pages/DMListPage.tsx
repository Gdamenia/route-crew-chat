import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { dmService } from '@/services/dmService';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { StatusDot } from '@/components/StatusDot';
import { formatRelativeTime } from '@/lib/helpers';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import type { Conversation, UserStatus } from '@/lib/types';

export default function DMListPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    dmService.getConversations(profile.user_id).then((convs) => {
      setConversations(convs);
      setLoading(false);
    }).catch(() => setLoading(false));

    const unsub = dmService.subscribeToDMs(profile.user_id, () => {
      dmService.getConversations(profile.user_id).then(setConversations);
    });
    return unsub;
  }, [profile?.user_id]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-foreground font-bold text-lg">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center pt-16 px-4">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-muted-foreground text-sm mt-1">Tap on a driver on the map to start a conversation</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.other_user_id}
              onClick={() => navigate(`/dm/${conv.other_user_id}`, { state: { name: conv.other_profile.display_name } })}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50"
            >
              <div className="relative flex-shrink-0">
                <AvatarDisplay name={conv.other_profile.display_name} photoUrl={conv.other_profile.photo_url} size="md" />
                <StatusDot status={conv.other_profile.status as UserStatus} className="absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-semibold text-sm truncate">{conv.other_profile.display_name}</p>
                  <span className="text-muted-foreground text-xs flex-shrink-0">{formatRelativeTime(conv.last_message.created_at)}</span>
                </div>
                <p className="text-muted-foreground text-xs truncate mt-0.5">{conv.last_message.text_content}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      <BottomNav active="messages" />
    </div>
  );
}
