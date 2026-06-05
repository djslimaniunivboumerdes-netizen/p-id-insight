import { Loader2, AlertTriangle, Inbox } from "lucide-react";

/**
 * Compact, inline state placeholders meant to be dropped into existing
 * panels/cards without changing surrounding layout or styling.
 */

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  label = "Failed to load.",
}: {
  error?: Error | null;
  onRetry?: () => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-xs text-destructive">
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>
        {label}
        {error?.message ? <span className="ml-1 text-muted-foreground">({error.message})</span> : null}
      </span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-accent"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ label = "No items yet." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
      <Inbox className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
