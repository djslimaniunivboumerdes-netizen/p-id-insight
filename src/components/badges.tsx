import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Severity, Status } from "@/lib/mock-data";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map = {
    critical: "border-destructive/50 bg-destructive/15 text-destructive",
    high: "border-warning/50 bg-warning/15 text-warning",
    medium: "border-info/50 bg-info/15 text-info",
    low: "border-border bg-muted/40 text-muted-foreground",
  };
  return <Badge variant="outline" className={cn("font-mono text-[10px] uppercase tracking-wider", map[severity])}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string; dot: string }> = {
    operational: { label: "Operational", cls: "border-success/40 bg-success/10 text-success", dot: "bg-success" },
    maintenance: { label: "Maintenance", cls: "border-warning/40 bg-warning/10 text-warning", dot: "bg-warning" },
    "out-of-service": { label: "Out of Service", cls: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", dot: "bg-muted-foreground" },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 text-[10px]", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />{m.label}
    </Badge>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 95 ? "bg-success" : pct >= 85 ? "bg-info" : "bg-warning";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}
