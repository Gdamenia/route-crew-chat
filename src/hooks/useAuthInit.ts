import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

export function useAuthInit() {
  const { setSession, setUser, setProfile, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      if (session?.user) {
        try {
          const user = await authService.getUser(session.user.id);
          if (user) setUser(user);
          const profile = await profileService.getProfile(session.user.id);
          setProfile(profile);
        } catch (_) {}
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        try {
          const user = await authService.getUser(session.user.id);
          if (user) setUser(user);
          const profile = await profileService.getProfile(session.user.id);
          setProfile(profile);
        } catch (_) {}
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);
}
