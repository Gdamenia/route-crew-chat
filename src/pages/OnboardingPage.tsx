import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Truck, Globe, Mic } from 'lucide-react';
import { RouteButton } from '@/components/ui/RouteButton';
import { useTranslation } from '@/hooks/useTranslation';

const slides = [
  { key: 's1', icon: Truck, titleKey: 'onboarding.s1.title', textKey: 'onboarding.s1.text' },
  { key: 's2', icon: Globe, titleKey: 'onboarding.s2.title', textKey: 'onboarding.s2.text' },
  { key: 's3', icon: Mic, titleKey: 'onboarding.s3.title', textKey: 'onboarding.s3.text' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/50 flex items-center justify-center mb-4">
            <Radio className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">RouteLink</h1>
        </div>

        {/* Slide */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <slide.icon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t(slide.titleKey)}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{t(slide.textKey)}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {isLast ? (
            <RouteButton size="lg" onClick={() => navigate('/signup')}>{t('onboarding.getStarted')}</RouteButton>
          ) : (
            <RouteButton size="lg" onClick={() => setStep(step + 1)}>{t('onboarding.next')}</RouteButton>
          )}
          <RouteButton size="lg" variant="ghost" onClick={() => navigate('/login')}>{t('onboarding.alreadyDriver')}</RouteButton>
        </div>
      </div>
    </div>
  );
}
