import { Mic, MicOff, Volume2, Headphones, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoicePage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Voice Rooms</h1>
        <p className="text-muted-foreground text-sm mt-1">Talk hands-free with drivers on your route</p>
      </div>

      {/* Active room scaffold */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">I-95 North Voice Room</p>
              <p className="text-xs text-muted-foreground">3 drivers connected</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-wrap gap-6 justify-center">
          {['BigRig_Mike', 'NightOwl', 'You'].map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                i === 2 ? 'bg-primary/20 ring-2 ring-primary text-primary' : 'bg-secondary text-foreground'
              }`}>
                {name.charAt(0)}
              </div>
              <span className="text-xs text-foreground">{name}</span>
              {i === 0 && <Volume2 className="w-3 h-3 text-status-available animate-pulse-dot" />}
              {i === 1 && <MicOff className="w-3 h-3 text-muted-foreground" />}
              {i === 2 && <Mic className="w-3 h-3 text-primary" />}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
            <Mic className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
            <Headphones className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="icon" className="rounded-full w-12 h-12">
            <MicOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <Headphones className="w-6 h-6 text-primary" />
        </div>
        <p className="text-foreground font-medium mb-1">Voice Rooms Coming Soon</p>
        <p className="text-muted-foreground text-sm">
          Real-time voice communication is being developed. This is a preview of the interface.
        </p>
      </div>
    </div>
  );
}
