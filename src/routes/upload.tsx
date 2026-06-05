import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, WorkflowSteps } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, FileText, X, CheckCircle2 } from "lucide-react";
import { useProjects } from "@/hooks/api/useProjects";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload — pid_ai" }] }),
  component: UploadPage,
});

function UploadPage() {
  const projectsQ = useProjects();
  const projects = projectsQ.data ?? [];

  const [file, setFile] = useState<{ name: string; size: string; pages: number; progress: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const startMock = () => {
    setFile({ name: "LNG_Train4_Compression.pdf", size: "24.6 MB", pages: 24, progress: 0 });
    let p = 0;
    const t = setInterval(() => {
      p += 8;
      setFile((f) => f ? { ...f, progress: Math.min(100, p) } : null);
      if (p >= 100) {
        clearInterval(t);
        toast.success("Upload complete · 24 sheets indexed");
      }
    }, 220);
  };

  return (
    <div>
      <PageHeader title="Upload Project" subtitle="Step 1 — Upload a P&ID document to begin analysis" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="rounded-lg border border-border bg-panel p-4">
          <WorkflowSteps current={1} />
        </div>

        <Card className="border-border bg-panel">
          <CardContent className="p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); startMock(); }}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-background/40"}`}
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                <UploadIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Drop your P&ID PDF here</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Or click to browse. PDF files only · Up to 500 MB · Vector or scanned drawings supported.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button onClick={startMock}><UploadIcon className="mr-1.5 h-3.5 w-3.5" /> Choose File</Button>
                <Badge variant="outline" className="font-mono text-[10px]">.PDF only</Badge>
              </div>
            </div>

            {file && (
              <div className="mt-6 rounded-md border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-destructive/15 text-destructive">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium">{file.name}</div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{file.size} · {file.pages} pages</div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={file.progress} className="h-1.5 flex-1" />
                      <span className="font-mono text-xs text-muted-foreground w-10 text-right">{file.progress}%</span>
                      {file.progress === 100 && <CheckCircle2 className="h-4 w-4 text-success" />}
                    </div>
                  </div>
                </div>
                {file.progress === 100 && (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>Cancel</Button>
                    <Button asChild size="sm"><Link to="/workspace">Start Analysis →</Link></Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-panel">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Recent Projects</h3>
              <p className="text-xs text-muted-foreground">Pick up where you left off</p>
            </div>
            {projectsQ.isLoading && <LoadingState label="Loading projects…" />}
            {projectsQ.isError && <ErrorState error={projectsQ.error} onRetry={() => projectsQ.refetch()} label="Couldn't load projects." />}
            {projectsQ.isEmpty && <EmptyState label="No projects yet. Upload your first P&ID above." />}
            {!projectsQ.isLoading && !projectsQ.isError && projects.length > 0 && (
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {projects.map((p) => (
                  <Link key={p.id} to="/workspace" className="group rounded-md border border-border bg-background p-3 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="mt-2 text-sm font-medium leading-tight group-hover:text-primary">{p.name}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">{p.pages} sheets · {p.updated}</div>
                    <Badge variant="outline" className="mt-2 text-[10px]">{p.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
