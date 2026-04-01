import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

export function useAuthInit() {
  const { setSession, setUser, setProfile, setLoading, setInitialized } = useAuthStore();
  const initializedRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData(userId: string) {
      // Prevent concurrent duplicate loads
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const [user, profile] = await Promise.all([
          authService.getUser(userId),
          profileService.getProfile(userId),
        ]);
        if (cancelled) return;
        if (user) setUser(user);
        setProfile(profile);
      } catch (_) {
      } finally {
        loadingRef.current = false;
      }
    }

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (!initializedRef.current) return;

      // Only refetch on actual auth changes, not token refreshes
      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
        return;
      }

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
