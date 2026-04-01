import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { useBlockStore } from '@/stores/blockStore';

export function useAuthInit() {
  const { setSession, setUser, setProfile, setLoading, setInitialized } = useAuthStore();
  const { loadBlocked } = useBlockStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData(userId: string, email?: string) {
      try {
        const [user, profile] = await Promise.all([
          authService.getUser(userId).catch(() => null),
          profileService.getProfile(userId).catch(() => null),
        ]);
        if (cancelled) return;

        // If no user record yet (trigger might be slow), create it
        if (!user && email) {
          const created = await authService.ensureUserRecord(userId, email);
          if (!cancelled) setUser(created);
        } else if (user) {
          setUser(user);
        }

        setProfile(profile);
        loadBlocked(userId);
      } catch (_) {
        // Don't crash auth init on network errors
      }
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email);
      }
      setLoading(false);
      setInitialized(true);
      initializedRef.current = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (!initializedRef.current) return;

      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
        return;
      }

      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email);
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
