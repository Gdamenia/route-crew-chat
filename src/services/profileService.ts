import { supabase } from '@/integrations/supabase/client';
import type { DriverProfile, UserStatus, VisibilityMode } from '@/lib/types';

export const profileService = {
  async getProfile(userId: string): Promise<DriverProfile | null> {
    const { data, error } = await supabase.from('driver_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data as DriverProfile | null;
  },

  async createProfile(userId: string, displayName: string): Promise<DriverProfile> {
    // Use upsert to avoid duplicate profile errors on re-login
    const { data, error } = await supabase
      .from('driver_profiles')
      .upsert(
        { user_id: userId, display_name: displayName, status: 'available', visibility_mode: 'visible_nearby', dnd_enabled: false },
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data as DriverProfile;
  },

  async updateProfile(userId: string, updates: Partial<DriverProfile>): Promise<DriverProfile> {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as DriverProfile;
  },

  async updateStatus(userId: string, status: UserStatus): Promise<void> {
    const { error } = await supabase
      .from('driver_profiles')
      .update({ status, dnd_enabled: status === 'dnd' })
      .eq('user_id', userId);
    if (error) throw error;
  },

  async updateVisibility(userId: string, visibility_mode: VisibilityMode): Promise<void> {
    const isVisible = visibility_mode !== 'hidden';
    await supabase.from('driver_profiles').update({ visibility_mode }).eq('user_id', userId);
    await supabase.from('driver_presence').update({ is_visible: isVisible }).eq('user_id', userId);
  },

  async uploadPhoto(userId: string, file: File): Promise<string> {
    const fileName = `${userId}/avatar.jpg`;
    const { error } = await supabase.storage.from('profile-photos').upload(fileName, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    return data.publicUrl;
  },
};
