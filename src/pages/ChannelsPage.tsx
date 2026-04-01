import { useState } from 'react';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { StatusDot } from '@/components/StatusDot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare, Hash, Users, ArrowLeft, Send,
  Volume2, VolumeX, LogIn, LogOut as LogOutIcon,
} from 'lucide-react';
import type { RouteMessage, UserStatus } from '@/lib/types';

export default function ChannelsPage() {
  const { channels, loading, joinChannel, leaveChannel, toggleMute } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const selected = channels.find((c) => c.id === selectedChannel);

  if (selectedChannel && selected) {
    return (
      <ChatView
        channel={selected}
        onBack={() => setSelectedChannel(null)}
        onLeave={() => { leaveChannel(selected.id); setSelectedChannel(null); }}
        onToggleMute={() => toggleMute(selected.id, !selected.is_muted)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Route Channels</h1>
        <p className="text-muted-foreground text-sm mt-1">Join channels for the routes you drive</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{ch.route_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{ch.route_code}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {ch.member_count}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ch.is_member ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMute(ch.id, !ch.is_muted)}
                      className="text-muted-foreground"
                    >
                      {ch.is_muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" onClick={() => setSelectedChannel(ch.id)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => joinChannel(ch.id)}>
                    <LogIn className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatView({
  channel,
  onBack,
  onLeave,
  onToggleMute,
}: {
  channel: any;
  onBack: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
}) {
  const { messages, loading, sendMessage } = useMessages(channel.id);
  const { user } = useAuth();
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Hash className="w-4 h-4 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{channel.route_name}</p>
          <p className="text-xs text-muted-foreground">{channel.route_code}</p>
        </div>
        <button onClick={onToggleMute} className="text-muted-foreground hover:text-foreground p-1">
          {channel.is_muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button onClick={onLeave} className="text-destructive hover:text-destructive/80 p-1">
          <LogOutIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_user_id === user?.id} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card shrink-0">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="bg-secondary border-border"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} size="icon" disabled={!text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: RouteMessage; isOwn: boolean }) {
  const sender = msg.sender;
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
        {sender?.display_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground">{sender?.display_name || 'Unknown'}</span>
          {sender?.status && <StatusDot status={sender.status as UserStatus} />}
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isOwn ? 'bg-primary/20 text-foreground' : 'bg-secondary text-foreground'
          }`}
        >
          {msg.text_content}
        </div>
      </div>
    </div>
  );
}
