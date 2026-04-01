import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Mic, MicOff, PhoneOff, AlertTriangle } from 'lucide-react';

export default function VoiceRoomPage() {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const location = useLocation();
  const channelName = (location.state as any)?.channelName ?? 'Voice Room';
  const { profile } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleJoin = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsConnected(true);
    setConnecting(false);
  };

  const handleLeave = () => {
    setIsConnected(false);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-foreground font-bold">{channelName}</p>
          <p className="text-muted-foreground text-xs">Voice Room</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-primary text-xs">Mock voice — Agora/LiveKit integration pending</p>
        </div>

        <div className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all ${
          isConnected ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
        }`}>
          <Mic className={`w-12 h-12 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>

        <p className="text-muted-foreground text-sm font-medium">
          {connecting ? 'Connecting...' : isConnected ? `Connected — ${profile?.display_name}` : 'Not connected'}
        </p>

        {isConnected && (
          <div className="w-full bg-secondary border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase mb-3 tracking-wider">Participants (Mock)</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                {profile?.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">{profile?.display_name} <span className="text-muted-foreground font-normal text-xs">(you)</span></p>
                {isMuted && <p className="text-destructive text-xs">Muted</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t border-border">
        {isConnected ? (
          <div className="flex gap-4 justify-center">
            <button onClick={() => setIsMuted(!isMuted)}
              className={`flex flex-col items-center gap-1 w-20 py-4 rounded-2xl border transition-colors ${
                isMuted ? 'bg-destructive/10 border-destructive' : 'bg-secondary border-border'
              }`}>
              {isMuted ? <MicOff className="w-6 h-6 text-destructive" /> : <Mic className="w-6 h-6 text-foreground" />}
              <span className={`text-xs font-medium ${isMuted ? 'text-destructive' : 'text-muted-foreground'}`}>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button onClick={handleLeave} className="flex flex-col items-center gap-1 w-20 py-4 rounded-2xl bg-destructive/10 border border-destructive transition-colors hover:bg-destructive/20">
              <PhoneOff className="w-6 h-6 text-destructive" />
              <span className="text-destructive text-xs font-medium">Leave</span>
            </button>
          </div>
        ) : (
          <button onClick={handleJoin} disabled={connecting}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:bg-primary/80 transition-colors disabled:opacity-50">
            {connecting ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Mic className="w-5 h-5" />}
            {connecting ? 'Connecting...' : 'Join Voice Room'}
          </button>
        )}
      </div>
    </div>
  );
}
