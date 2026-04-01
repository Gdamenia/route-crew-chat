export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="bg-secondary border border-border rounded-xl p-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          {lines >= 2 && <div className="h-3 bg-muted rounded w-1/2" />}
        </div>
      </div>
    </div>
  );
}

export function SkeletonConversation() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 animate-pulse">
      <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded w-28" />
          <div className="h-3 bg-muted rounded w-10" />
        </div>
        <div className="h-3 bg-muted rounded w-48" />
      </div>
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading map...</div>
    </div>
  );
}
