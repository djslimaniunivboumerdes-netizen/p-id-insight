import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { issues } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/badges";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/inspector")({
  head: () => ({ meta: [{ title: "AI Inspector — pid_ai" }] }),
  component: Inspector,
});

function Inspector() {
  const counts = {
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
  };
  return (
    <div>
      <PageHeader title="AI Inspector" subtitle="Rules-based inspection of detected issues" actions={
        <Button variant="outline" size="sm"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Export Report</Button>
      } />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Critical", v: counts.critical, c: "text-destructive" },
            { l: "High", v: counts.high, c: "text-warning" },
            { l: "Medium", v: counts.medium, c: "text-info" },
            { l: "Low", v: counts.low, c: "text-muted-foreground" },
          ].map((s) => (
            <Card key={s.l} className="border-border bg-panel">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className={`mt-1 font-mono text-2xl font-semibold ${s.c}`}>{s.v}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
          </TabsList>
          {["all", "critical", "high"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
              {issues.filter((i) => tab === "all" || i.severity === tab).map((i) => (
                <Card key={i.id} className="border-border bg-panel">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-md bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{i.title}</div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{i.category}</Badge>
                            <span className="font-mono text-xs text-muted-foreground">{i.tag}</span>
                          </div>
                        </div>
                      </div>
                      <SeverityBadge severity={i.severity} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{i.explanation}</p>
                    <div className="mt-3 rounded-md border border-info/30 bg-info/5 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-info">
                        <Lightbulb className="h-3.5 w-3.5" /> Suggested action
                      </div>
                      <p className="mt-1 text-sm">{i.action}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">View on Sheet</Button>
                      <Button variant="outline" size="sm">Dismiss</Button>
                      <Button size="sm" className="ml-auto">Mark Resolved</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
