import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { RouteInput } from '@/components/ui/RouteInput';
import { authService } from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(t('auth.passwordMismatch')); return; }
    if (password.length < 6) { setError(t('auth.passwordLength')); return; }
    setLoading(true);
    setError('');
    try {
      await authService.signUp(email, password);
      await authService.signIn(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('auth.back')}
        </button>
        <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">{t('auth.signUp')}</h1>
        <p className="text-muted-foreground mb-8 text-sm">{t('auth.joinNetwork')}</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <RouteInput label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          <RouteInput label={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" showPasswordToggle required />
          <RouteInput label={t('auth.confirmPassword')} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" showPasswordToggle required />
          <RouteButton type="submit" size="lg" loading={loading}>{t('auth.signUp')}</RouteButton>
        </form>
        <p className="text-center text-muted-foreground text-sm mt-6">
          {t('auth.hasAccount')}{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline">{t('auth.signIn')}</button>
        </p>
      </div>
    </div>
  );
}
