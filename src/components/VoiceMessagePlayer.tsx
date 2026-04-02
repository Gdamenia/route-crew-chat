import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number;
  isSelf?: boolean;
}

export function VoiceMessagePlayer({ url, duration, isSelf }: VoiceMessagePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      const a = new Audio(url);
      audioRef.current = a;
      a.addEventListener('timeupdate', () => {
        if (a.duration) setProgress(a.currentTime / a.duration);
      });
      a.addEventListener('ended', () => { setPlaying(false); setProgress(0); });
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatDur = (sec?: number) => {
    if (!sec) return '0:00';
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  };

  // Simple waveform bars (decorative)
  const bars = [0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 0.5, 0.6, 0.3, 0.8, 0.5];

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button onClick={toggle} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isSelf ? 'bg-primary-foreground/20' : 'bg-primary/20'
      }`}>
        {playing ? (
          <Pause className={`w-3.5 h-3.5 ${isSelf ? 'text-primary-foreground' : 'text-primary'}`} />
        ) : (
          <Play className={`w-3.5 h-3.5 ${isSelf ? 'text-primary-foreground' : 'text-primary'} ml-0.5`} />
        )}
      </button>
      <div className="flex-1 flex items-end gap-[2px] h-6">
        {bars.map((h, i) => {
          const filled = progress > i / bars.length;
          return (
            <div key={i} className={`flex-1 rounded-full transition-colors ${
              filled
                ? isSelf ? 'bg-primary-foreground' : 'bg-primary'
                : isSelf ? 'bg-primary-foreground/30' : 'bg-primary/30'
            }`} style={{ height: `${h * 100}%` }} />
          );
        })}
      </div>
      <span className={`text-[10px] font-mono flex-shrink-0 ${isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {formatDur(duration)}
      </span>
    </div>
  );
}
