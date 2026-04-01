import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { RouteInput } from '@/components/ui/RouteInput';
import { authService } from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email, password);
      // Auth state change listener will handle navigation
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 page-enter">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/welcome')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('auth.back')}
        </button>
        <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">{t('auth.signIn')}</h1>
        <p className="text-muted-foreground mb-8 text-sm">{t('auth.welcomeBack')}</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <RouteInput label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" required />
          <RouteInput label={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" showPasswordToggle autoComplete="current-password" required />
          <RouteButton type="submit" size="lg" loading={loading}>{t('auth.signIn')}</RouteButton>
        </form>
        <p className="text-center text-muted-foreground text-sm mt-6">
          {t('auth.noAccount')}{' '}
          <button onClick={() => navigate('/signup')} className="text-primary font-semibold hover:underline">{t('auth.signUp')}</button>
        </p>
      </div>
    </div>
  );
}
