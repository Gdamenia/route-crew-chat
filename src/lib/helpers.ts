import type { UserStatus } from '@/lib/types';

export function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString();
}

export function formatChatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getStatusColor(status: UserStatus | string): string {
  switch (status) {
    case 'available': return 'hsl(var(--status-available))';
    case 'driving': return 'hsl(var(--status-driving))';
    case 'resting': return 'hsl(var(--status-resting))';
    case 'dnd': return 'hsl(var(--status-dnd))';
    default: return 'hsl(var(--muted-foreground))';
  }
}

export function getStatusLabel(status: UserStatus | string): string {
  switch (status) {
    case 'available': return 'Available';
    case 'driving': return 'Driving';
    case 'resting': return 'Resting';
    case 'dnd': return 'Do Not Disturb';
    default: return status;
  }
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
