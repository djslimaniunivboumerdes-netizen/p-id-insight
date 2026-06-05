import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, WorkflowSteps } from "@/components/app-shell";
import { useProjects } from "@/hooks/api/useProjects";
import { useIssues } from "@/hooks/api/useIssues";
import { useEquipment } from "@/hooks/api/useEquipment";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { SeverityBadge } from "@/components/badges";
import { ArrowRight, FileText, Boxes, ShieldAlert, ScanSearch, Upload, Activity, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — pid_ai" }] }),
  component: Dashboard,
});

function Dashboard() {
  const projectsQ = useProjects();
  const issuesQ = useIssues();
  const equipmentQ = useEquipment();

  const projects = projectsQ.data ?? [];
  const issues = issuesQ.data ?? [];
  const equipment = equipmentQ.data ?? [];

  const stats = [
    { label: "Active Projects", value: String(projects.length || 0), trend: "+1 this week", icon: FileText },
    { label: "Equipment Detected", value: String(equipment.length || 0), trend: "98.2% confidence", icon: Boxes },
    { label: "Open Issues", value: String(issues.length || 0), trend: `${issues.filter((i) => i.severity === "critical").length} critical`, icon: ShieldAlert },
    { label: "Sheets Processed", value: "130", trend: "OCR + symbol", icon: ScanSearch },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all P&ID analysis projects"
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link to="/workspace">Open Workspace</Link></Button>
            <Button asChild size="sm"><Link to="/upload"><Upload className="mr-1.5 h-3.5 w-3.5" /> New Project</Link></Button>
          </>
        }
      />

      <div className="space-y-6 p-4 md:p-6">
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Workflow</div>
          <WorkflowSteps current={3} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border bg-panel">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      <div className="mt-2 font-mono text-2xl font-semibold">{s.value}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" /> {s.trend}
                      </div>
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-panel lg:col-span-2">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="font-semibold">Recent Projects</h3>
                  <p className="text-xs text-muted-foreground">Continue where you left off</p>
                </div>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
              {projectsQ.isLoading && <LoadingState label="Loading projects…" />}
              {projectsQ.isError && <ErrorState error={projectsQ.error} onRetry={() => projectsQ.refetch()} label="Couldn't load projects." />}
              {projectsQ.isEmpty && <EmptyState label="No projects yet. Upload a P&ID to get started." />}
              {!projectsQ.isLoading && !projectsQ.isError && projects.length > 0 && (
                <ul className="divide-y divide-border">
                  {projects.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                      <div className="grid h-10 w-10 place-items-center rounded-md bg-accent/40 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{p.pages} sheets · updated {p.updated}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link to="/workspace"><ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-panel">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="font-semibold">Critical Findings</h3>
                  <p className="text-xs text-muted-foreground">From AI Inspector</p>
                </div>
                <Button asChild variant="ghost" size="sm"><Link to="/inspector">All</Link></Button>
              </div>
              {issuesQ.isLoading && <LoadingState label="Loading findings…" />}
              {issuesQ.isError && <ErrorState error={issuesQ.error} onRetry={() => issuesQ.refetch()} label="Couldn't load findings." />}
              {issuesQ.isEmpty && <EmptyState label="No findings." />}
              {!issuesQ.isLoading && !issuesQ.isError && issues.length > 0 && (
                <ul className="divide-y divide-border">
                  {issues.slice(0, 4).map((i) => (
                    <li key={i.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{i.title}</div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{i.tag}</div>
                        </div>
                        <SeverityBadge severity={i.severity} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-panel">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Recently Detected Equipment</h3>
              <p className="text-xs text-muted-foreground">Most recent items extracted by the symbol detector</p>
            </div>
            {equipmentQ.isLoading && <LoadingState label="Loading equipment…" />}
            {equipmentQ.isError && <ErrorState error={equipmentQ.error} onRetry={() => equipmentQ.refetch()} label="Couldn't load equipment." />}
            {equipmentQ.isEmpty && <EmptyState label="No equipment detected yet." />}
            {!equipmentQ.isLoading && !equipmentQ.isError && equipment.length > 0 && (
              <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {equipment.slice(0, 6).map((e) => (
                  <div key={e.tag} className="rounded-md border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{e.tag}</span>
                      <Badge variant="outline" className="text-[10px]">{e.size}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{e.type}</div>
                    <div className="mt-2 font-mono text-[10px] text-muted-foreground">Page {e.page} · {e.line}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
