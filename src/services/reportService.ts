import { supabase } from '@/integrations/supabase/client';
import type { TargetType } from '@/lib/types';

export const reportService = {
  async submitReport(reporterUserId: string, targetType: TargetType, targetId: string, reason: string) {
    const { error } = await supabase.from('reports').insert({ reporter_user_id: reporterUserId, target_type: targetType, target_id: targetId, reason });
    if (error) throw error;
  },
};
