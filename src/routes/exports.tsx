import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { exports as exportsList } from "@/lib/mock-data";
import { FileText, FileSpreadsheet, Download, CheckCircle2, Loader2, Map, Boxes, ScanSearch } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/exports")({
  head: () => ({ meta: [{ title: "Export Center — pid_ai" }] }),
  component: ExportsPage,
});

const exportTypes = [
  { id: "enhanced-pdf", label: "Enhanced P&ID PDF", desc: "Annotated drawing with tags, highlights, and inspection overlays", icon: FileText },
  { id: "inv-excel", label: "Inventory Excel", desc: "Complete equipment, valve, instrument, and pipeline workbook", icon: FileSpreadsheet },
  { id: "inv-pdf", label: "Inventory PDF", desc: "Printable equipment register grouped by sheet", icon: Boxes },
  { id: "cards-pdf", label: "Equipment Cards PDF", desc: "One card per equipment item with connections", icon: Map },
  { id: "inspect-pdf", label: "Inspection Report PDF", desc: "Findings, severity, and recommended actions", icon: ScanSearch },
];

function ExportsPage() {
  const [jobs, setJobs] = useState<{ id: string; label: string; progress: number }[]>([]);

  const start = (label: string) => {
    const id = Math.random().toString(36).slice(2);
    setJobs((j) => [{ id, label, progress: 0 }, ...j]);
    const iv = setInterval(() => {
      setJobs((j) => j.map((x) => x.id === id ? { ...x, progress: Math.min(100, x.progress + 12) } : x));
    }, 250);
    setTimeout(() => { clearInterval(iv); toast.success(`${label} ready`); }, 2400);
  };

  return (
    <div>
      <PageHeader title="Export Center" subtitle="Generate reports and annotated documents" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exportTypes.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.id} className="border-border bg-panel">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{t.label}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4 w-full" onClick={() => start(t.label)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Generate
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {jobs.length > 0 && (
          <Card className="border-border bg-panel">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-semibold">Active Jobs</h3>
              </div>
              <ul className="divide-y divide-border">
                {jobs.map((j) => (
                  <li key={j.id} className="flex items-center gap-3 px-4 py-3">
                    {j.progress < 100 ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{j.label}</div>
                      <Progress value={j.progress} className="mt-1.5 h-1.5" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{j.progress}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="border-border bg-panel">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold">Recent Exports</h3>
              <span className="text-xs text-muted-foreground">{exportsList.length} files</span>
            </div>
            <ul className="divide-y divide-border">
              {exportsList.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-accent/40">
                    {e.type === "Excel" ? <FileSpreadsheet className="h-4 w-4 text-success" /> : <FileText className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-sm font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.size} · {e.date}</div>
                  </div>
                  <Badge variant="outline" className="border-success/40 text-success text-[10px]">Complete</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
