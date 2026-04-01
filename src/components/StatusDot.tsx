import type { UserStatus } from '@/lib/types';

const statusClasses: Record<UserStatus, string> = {
  available: 'bg-status-available',
  driving: 'bg-status-driving',
  resting: 'bg-status-resting',
  dnd: 'bg-status-dnd',
};

export function StatusDot({ status, size = 'sm' }: { status: UserStatus; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-3 h-3' : 'w-2 h-2';
  return (
    <span className={`inline-block rounded-full ${sizeClass} ${statusClasses[status] || 'bg-muted-foreground'}`} />
  );
}
