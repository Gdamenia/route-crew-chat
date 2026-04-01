import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteButton } from '@/components/ui/RouteButton';
import { RouteInput } from '@/components/ui/RouteInput';
import { authService } from '@/services/authService';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.signUp(email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center w-full max-w-sm">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-6">We sent a confirmation link to {email}. Click it to activate your account.</p>
          <RouteButton size="lg" onClick={() => navigate('/login')}>Go to Sign In</RouteButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Create Account</h1>
        <p className="text-muted-foreground mb-8 text-sm">Join the driver network.</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <RouteInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          <RouteInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" showPasswordToggle required />
          <RouteInput label="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" showPasswordToggle required />
          <RouteButton type="submit" size="lg" loading={loading}>Create Account</RouteButton>
        </form>
        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
}
