import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import type { AppUser, DriverProfile } from '@/lib/types';

interface AuthState {
  session: Session | null;
  user: AppUser | null;
  profile: DriverProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: AppUser | null) => void;
  setProfile: (profile: DriverProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set({ session: null, user: null, profile: null, isLoading: false }),
}));
