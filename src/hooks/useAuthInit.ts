import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

export function useAuthInit() {
  const { setSession, setUser, setProfile, setLoading, setInitialized } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData(userId: string) {
      try {
        const [user, profile] = await Promise.all([
          authService.getUser(userId),
          profileService.getProfile(userId),
        ]);
        if (cancelled) return;
        if (user) setUser(user);
        setProfile(profile);
      } catch (_) {}
    }

    // Get initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
      initializedRef.current = true;
    });

    // Then listen for changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      // Skip the initial event — we already handled it above
      if (!initializedRef.current) return;

      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
}
