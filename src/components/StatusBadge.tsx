import type { UserStatus } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/helpers';

interface StatusBadgeProps {
  status: UserStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showLabel = false, size = 'md' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dotSize} rounded-full flex-shrink-0`} style={{ backgroundColor: color }} />
      {showLabel && (
        <span className={`${textSize} font-semibold`} style={{ color }}>{getStatusLabel(status)}</span>
      )}
    </span>
  );
}
