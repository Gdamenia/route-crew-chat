import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { reportService } from '@/services/reportService';
import { useTranslation } from '@/hooks/useTranslation';
import type { TargetType } from '@/lib/types';
import { toast } from 'sonner';

const REPORT_REASONS = [
  'Harassment',
  'Spam',
  'Fake profile',
  'Dangerous driving advice',
  'Other',
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: TargetType;
  targetId: string;
}

export function ReportModal({ open, onClose, targetType, targetId }: ReportModalProps) {
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async (reason: string) => {
    if (!profile) return;
    setSubmitting(true);
    try {
      await reportService.submitReport(profile.user_id, targetType, targetId, reason);
      toast.success(t('report.submitted'));
      onClose();
    } catch {
      toast.error(t('general.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('report.title')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{t('report.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              disabled={submitting}
              onClick={() => handleReport(reason)}
              className="w-full text-left px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-sm hover:border-primary transition-colors min-h-[44px] disabled:opacity-50"
            >
              {reason}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
