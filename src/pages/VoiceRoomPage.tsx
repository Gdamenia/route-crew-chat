import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mic, MicOff, PhoneOff, Radio, AlertTriangle } from 'lucide-react';

type VoicePresencePayload = {
  user_id?: string;
  display_name?: string;
};

type VoiceSignalPayload = {
  from: string;
  to: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type Participant = {
  userId: string;
  displayName: string;
};

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function VoiceRoomPage() {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = (location.state as { channelName?: string } | null)?.channelName ?? 'Voice Room';
  const { session, profile } = useAuthStore();

  const userId = session?.user.id ?? null;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const syncParticipantsFromPresence = () => {
    const channel = channelRef.current;
    if (!channel || !userId) return;

    const state = channel.presenceState() as Record<string, VoicePresencePayload[]>;
    const flat = Object.values(state).flat();
    const map = new Map<string, Participant>();

    for (const item of flat) {
      if (!item.user_id) continue;
      map.set(item.user_id, {
        userId: item.user_id,
        displayName: item.display_name || 'Driver',
      });
    }

    if (!map.has(userId)) {
      map.set(userId, {
        userId,
        displayName: profile?.display_name || 'You',
      });
    }

    const participantList = [...map.values()];
    setParticipants(participantList);

    const activeRemoteIds = participantList.map((p) => p.userId).filter((id) => id !== userId);

    for (const existingPeerId of peerConnectionsRef.current.keys()) {
      if (!activeRemoteIds.includes(existingPeerId)) {
        const existing = peerConnectionsRef.current.get(existingPeerId);
        existing?.close();
        peerConnectionsRef.current.delete(existingPeerId);
        setRemoteStreams((prev) => {
          if (!prev[existingPeerId]) return prev;
          const next = { ...prev };
          delete next[existingPeerId];
          return next;
        });
      }
    }
  };

  const sendSignal = async (event: 'offer' | 'answer' | 'ice-candidate', payload: VoiceSignalPayload) => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event,
      payload,
    });
  };

  const createPeerConnection = (remoteUserId: string) => {
    const existing = peerConnectionsRef.current.get(remoteUserId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        peer.addTrack(track, localStreamRef.current);
      }
    }

    peer.onicecandidate = async (event) => {
      if (!event.candidate || !userId) return;

      await sendSignal('ice-candidate', {
        from: userId,
        to: remoteUserId,
        candidate: event.candidate.toJSON(),
      });
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;

      setRemoteStreams((prev) => {
        if (prev[remoteUserId] === stream) return prev;
        return { ...prev, [remoteUserId]: stream };
      });
    };

    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) {
        peer.close();
        peerConnectionsRef.current.delete(remoteUserId);
      }
    };

    peerConnectionsRef.current.set(remoteUserId, peer);
    return peer;
  };

  const createAndSendOffer = async (remoteUserId: string) => {
    if (!userId) return;

    const peer = createPeerConnection(remoteUserId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    await sendSignal('offer', {
      from: userId,
      to: remoteUserId,
      description: offer,
    });
  };

  const ensureMeshConnections = async () => {
    if (!userId) return;

    const remoteIds = participants.map((p) => p.userId).filter((id) => id !== userId);

    for (const remoteId of remoteIds) {
      if (peerConnectionsRef.current.has(remoteId)) continue;
      if (userId < remoteId) {
        await createAndSendOffer(remoteId);
      }
    }
  };

  const handleIncomingOffer = async (payload: VoiceSignalPayload) => {
    if (!userId || payload.to !== userId || !payload.description) return;

    const peer = createPeerConnection(payload.from);
    await peer.setRemoteDescription(new RTCSessionDescription(payload.description));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    await sendSignal('answer', {
      from: userId,
      to: payload.from,
      description: answer,
    });
  };

  const handleIncomingAnswer = async (payload: VoiceSignalPayload) => {
    if (!userId || payload.to !== userId || !payload.description) return;

    const peer = peerConnectionsRef.current.get(payload.from);
    if (!peer) return;

    await peer.setRemoteDescription(new RTCSessionDescription(payload.description));
  };

  const handleIncomingCandidate = async (payload: VoiceSignalPayload) => {
    if (!userId || payload.to !== userId || !payload.candidate) return;

    const peer = peerConnectionsRef.current.get(payload.from);
    if (!peer) return;

    await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
  };

  const cleanupVoice = () => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    for (const peer of peerConnectionsRef.current.values()) {
      peer.close();
    }

    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
    }

    setRemoteStreams({});
    setParticipants([]);
    setIsConnected(false);
  };

  const handleJoin = async () => {
    if (!channelId || !userId) {
      setError('Missing room or user session. Please go back and try again.');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;

      const voiceChannel = supabase.channel(`voice:${channelId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId },
        },
      });

      channelRef.current = voiceChannel;

      voiceChannel
        .on('broadcast', { event: 'offer' }, ({ payload }) => {
          void handleIncomingOffer(payload as VoiceSignalPayload).catch(() => setError('Voice signaling issue (offer).'));
        })
        .on('broadcast', { event: 'answer' }, ({ payload }) => {
          void handleIncomingAnswer(payload as VoiceSignalPayload).catch(() => setError('Voice signaling issue (answer).'));
        })
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
          void handleIncomingCandidate(payload as VoiceSignalPayload).catch(() => setError('Voice signaling issue (network).'));
        })
        .on('presence', { event: 'sync' }, () => {
          syncParticipantsFromPresence();
        })
        .on('presence', { event: 'join' }, () => {
          syncParticipantsFromPresence();
          void ensureMeshConnections().catch(() => setError('Failed to connect to another participant.'));
        })
        .on('presence', { event: 'leave' }, () => {
          syncParticipantsFromPresence();
        });

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Voice room connection timeout')), 12000);

        voiceChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            window.clearTimeout(timeout);
            await voiceChannel.track({
              user_id: userId,
              display_name: profile?.display_name || 'Driver',
            });
            resolve();
          }

          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            window.clearTimeout(timeout);
            reject(new Error(`Voice room subscribe failed (${status})`));
          }
        });
      });

      setIsConnected(true);
      syncParticipantsFromPresence();
      await ensureMeshConnections();
    } catch {
      cleanupVoice();
      setError('Could not join voice room. Allow microphone access and try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleLeave = () => {
    cleanupVoice();
    navigate(-1);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getAudioTracks()) {
        track.enabled = !nextMuted;
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, []);

  useEffect(() => {
    for (const [remoteId, stream] of Object.entries(remoteStreams)) {
      const audio = audioRefs.current[remoteId];
      if (audio && audio.srcObject !== stream) {
        audio.srcObject = stream;
      }
    }
  }, [remoteStreams]);

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
        {error && (
          <div className="w-full bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-destructive text-xs">{error}</p>
          </div>
        )}

        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all ${
            isConnected ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
          }`}
        >
          <Mic className={`w-12 h-12 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>

        <p className="text-muted-foreground text-sm font-medium">
          {connecting ? 'Connecting…' : isConnected ? `Connected — ${profile?.display_name}` : 'Not connected'}
        </p>

        {isConnected && (
          <div className="w-full bg-secondary border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase mb-3 tracking-wider">Participants</p>
            <div className="space-y-2">
              {participants.map((participant) => {
                const isSelf = participant.userId === userId;
                const connected = isSelf || Boolean(remoteStreams[participant.userId]);

                return (
                  <div key={participant.userId} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {participant.displayName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-foreground text-sm font-semibold">
                        {participant.displayName}{' '}
                        {isSelf && <span className="text-muted-foreground font-normal text-xs">(you)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Radio className={`w-3.5 h-3.5 ${connected ? 'text-status-available' : 'text-muted-foreground'}`} />
                      {connected ? 'Connected' : 'Connecting'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t border-border">
        {isConnected ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleToggleMute}
              className={`flex flex-col items-center gap-1 w-20 py-4 rounded-2xl border transition-colors ${
                isMuted ? 'bg-destructive/10 border-destructive' : 'bg-secondary border-border'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-destructive" /> : <Mic className="w-6 h-6 text-foreground" />}
              <span className={`text-xs font-medium ${isMuted ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>

            <button
              onClick={handleLeave}
              className="flex flex-col items-center gap-1 w-20 py-4 rounded-2xl bg-destructive/10 border border-destructive transition-colors hover:bg-destructive/20"
            >
              <PhoneOff className="w-6 h-6 text-destructive" />
              <span className="text-destructive text-xs font-medium">Leave</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {connecting ? 'Connecting...' : 'Join Voice Room'}
          </button>
        )}
      </div>

      {Object.entries(remoteStreams).map(([remoteUserId, stream]) => (
        <audio
          key={remoteUserId}
          autoPlay
          playsInline
          ref={(node) => {
            audioRefs.current[remoteUserId] = node;
            if (node && node.srcObject !== stream) {
              node.srcObject = stream;
            }
          }}
          className="hidden"
        />
      ))}
    </div>
  );
}
