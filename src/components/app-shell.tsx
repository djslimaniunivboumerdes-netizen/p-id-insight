import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Upload, FlaskConical, Boxes, Search, Network,
  ShieldAlert, ScanSearch, Database, Download, Settings, FileText,
  Activity, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const nav = [
  { group: "Workflow", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Upload Project", icon: Upload },
    { to: "/workspace", label: "Analysis Workspace", icon: FlaskConical },
  ]},
  { group: "Analysis Tools", items: [
    { to: "/inventory", label: "Inventory", icon: Boxes },
    { to: "/search", label: "Smart Search", icon: Search },
    { to: "/smart-map", label: "Smart Map", icon: Network },
    { to: "/inspector", label: "AI Inspector", icon: ScanSearch },
    { to: "/hazop", label: "HAZOP Assistant", icon: ShieldAlert },
    { to: "/equipment", label: "Equipment DB", icon: Database },
  ]},
  { group: "Output", items: [
    { to: "/exports", label: "Export Center", icon: Download },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
            <Activity className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-mono text-sm font-semibold tracking-tight">pid_ai</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">P&amp;ID Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {nav.map((g) => (
            <div key={g.group} className="mb-4">
              <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{g.group}</div>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const active = pathname === it.to;
                  const Icon = it.icon;
                  return (
                    <li key={it.to}>
                      <Link
                        to={it.to}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{it.label}</span>
                        {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-md bg-sidebar-accent/50 p-3 text-xs">
            <div className="mb-1 flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              System Online
            </div>
            <div className="text-muted-foreground">OCR engine v2.4 · Detector v1.8</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-panel/80 px-4 backdrop-blur">
          <div className="lg:hidden flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-mono text-sm font-semibold">pid_ai</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="border-border bg-background/50 font-mono text-xs">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-info" />
              PROJECT
            </Badge>
            <span className="text-sm font-medium">LNG Train 4 — Compression Unit</span>
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">ANALYZING</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Notes
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/exports"><Download className="mr-1.5 h-3.5 w-3.5" /> Export</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/upload"><Upload className="mr-1.5 h-3.5 w-3.5" /> New Project</Link>
            </Button>
            <div className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-medium ring-1 ring-border">EN</div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function WorkflowSteps({ current = 3 }: { current?: number }) {
  const steps = ["Upload", "Tool Selection", "Processing", "Results"];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "todo";
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
              state === "done" && "border-success/40 bg-success/10 text-success",
              state === "active" && "border-primary/50 bg-primary/15 text-primary",
              state === "todo" && "border-border bg-muted/40 text-muted-foreground",
            )}>
              <span className={cn(
                "grid h-4 w-4 place-items-center rounded-full font-mono text-[10px]",
                state === "done" && "bg-success text-success-foreground",
                state === "active" && "bg-primary text-primary-foreground",
                state === "todo" && "bg-muted text-muted-foreground",
              )}>{n}</span>
              {s}
            </div>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 md:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
