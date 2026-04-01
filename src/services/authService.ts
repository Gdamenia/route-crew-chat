import { supabase } from '@/integrations/supabase/client';
import type { AppUser, Language } from '@/lib/types';

export const authService = {
  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async ensureUserRecord(userId: string, email: string, language: Language = 'en'): Promise<AppUser> {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, email, language }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as AppUser;
  },

  async getUser(userId: string): Promise<AppUser | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    return data as AppUser | null;
  },
};
