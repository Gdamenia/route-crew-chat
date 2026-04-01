import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return <BadgeCheck className={`${cls} text-blue-400 flex-shrink-0`} />;
}
