import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { Radio } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/50 flex items-center justify-center mb-5">
            <Radio className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">RouteLink</h1>
          <p className="text-muted-foreground text-center text-base">Connect with drivers on your route</p>
        </div>

        <div className="space-y-3 mb-10">
          {[
            { icon: '📡', text: "See who's on your route right now" },
            { icon: '💬', text: 'Real-time route channels & chat' },
            { icon: '🎙️', text: 'Voice rooms for your highway' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-foreground text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <RouteButton size="lg" onClick={() => navigate('/signup')}>Get Started</RouteButton>
          <RouteButton size="lg" variant="ghost" onClick={() => navigate('/login')}>Already a driver? Sign In</RouteButton>
        </div>
      </div>
    </div>
  );
}
