import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { haptic } from '@/lib/haptic';

interface VoiceRecorderProps {
  onRecorded: (url: string, durationSec: number) => void;
  disabled?: boolean;
  large?: boolean;
}

const MAX_DURATION = 60;

export function VoiceRecorder({ onRecorded, disabled, large }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    mediaRecorderRef.current = null;
    setRecording(false);
    setElapsed(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startRecording = async () => {
    try {
      haptic();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        await uploadAndSend(blob, duration);
      };
      mediaRecorderRef.current = mr;
      startTimeRef.current = Date.now();
      mr.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => {
        const sec = Math.round((Date.now() - startTimeRef.current) / 1000);
        setElapsed(sec);
        if (sec >= MAX_DURATION) stopRecording();
      }, 500);
    } catch {
      // permission denied or no mic
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
  };

  const uploadAndSend = async (blob: Blob, duration: number) => {
    setUploading(true);
    try {
      const ext = blob.type.includes('webm') ? 'webm' : 'mp4';
      const path = `voice/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('voice-messages').upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('voice-messages').getPublicUrl(path);
      onRecorded(urlData.publicUrl, duration);
    } catch (err) {
      console.error('Voice upload failed:', err);
    } finally {
      setUploading(false);
      setElapsed(0);
    }
  };

  const sz = large ? 'w-14 h-14' : 'w-10 h-10';
  const iconSz = large ? 'w-5 h-5' : 'w-4 h-4';

  if (uploading) {
    return (
      <div className={`${sz} rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
        <Loader2 className={`${iconSz} text-muted-foreground animate-spin`} />
      </div>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/10 border border-destructive/30 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-destructive text-xs font-mono font-bold">
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-destructive/60 text-xs">/ {MAX_DURATION}s</span>
        </div>
        <button onClick={stopRecording} className={`${sz} rounded-full bg-destructive flex items-center justify-center`}>
          <Square className={`${iconSz} text-destructive-foreground fill-current`} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className={`${sz} rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0 disabled:opacity-40`}
      aria-label="Record voice message"
    >
      <Mic className={`${iconSz} text-muted-foreground`} />
    </button>
  );
}
