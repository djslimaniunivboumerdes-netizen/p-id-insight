import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, WorkflowSteps } from "@/components/app-shell";
import { PdfViewer } from "@/components/pdf-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tools, equipment, issues } from "@/lib/mock-data";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge, StatusBadge, ConfidenceBar } from "@/components/badges";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Workspace — pid_ai" }] }),
  component: Workspace,
});

function Workspace() {
  const [activeTool, setActiveTool] = useState("inventory");
  const [selected, setSelected] = useState<string | undefined>("P-101A");

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        title="Analysis Workspace"
        subtitle="Step 4 — Review extracted data and AI findings"
        actions={
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Analysis Complete
          </Badge>
        }
      />
      <div className="border-b border-border bg-panel/40 px-4 py-3 md:px-6">
        <WorkflowSteps current={4} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Tool rail */}
        <aside className="flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-panel/30 p-2 lg:w-16 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
          {tools.slice(0, 7).map((t) => {
            const Icon = (Icons as any)[t.icon] ?? Icons.Square;
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                title={t.name}
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-md border transition-all",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </aside>

        {/* Viewer */}
        <section className="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
          <PdfViewer pointerMode={!!selected} highlightTag={selected} />
        </section>

        {/* Right panel */}
        <aside className="flex w-full shrink-0 flex-col border-t border-border bg-panel lg:w-96 lg:border-l lg:border-t-0">
          <RightPanel tool={activeTool} selected={selected} onSelect={setSelected} />
        </aside>
      </div>
    </div>
  );
}

function RightPanel({ tool, selected, onSelect }: { tool: string; selected?: string; onSelect: (t: string) => void }) {
  const toolMeta = tools.find((t) => t.id === tool);
  const Icon = (Icons as any)[toolMeta?.icon ?? "Square"];
  return (
    <>
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary"><Icon className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{toolMeta?.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{toolMeta?.desc}</div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          {tool === "inventory" && <InventoryPanel onSelect={onSelect} selected={selected} />}
          {tool === "search" && <SearchPanel onSelect={onSelect} />}
          {tool === "smart-map" && <MapPanel />}
          {tool === "hazop" && <HazopMini />}
          {tool === "inspector" && <InspectorMini />}
          {tool === "color" && <ColorMini />}
          {tool === "equipment" && <EquipmentMini onSelect={onSelect} />}
        </div>
      </ScrollArea>
    </>
  );
}

function InventoryPanel({ onSelect, selected }: { onSelect: (t: string) => void; selected?: string }) {
  return (
    <div className="space-y-2">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Equipment ({equipment.length})</div>
      {equipment.map((e) => (
        <button key={e.tag} onClick={() => onSelect(e.tag)}
          className={cn("w-full rounded-md border p-2.5 text-left transition-colors",
            selected === e.tag ? "border-primary/60 bg-primary/10" : "border-border bg-background hover:border-primary/30")}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold">{e.tag}</span>
            <StatusBadge status={e.status} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{e.type}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">P{e.page} · {e.size}</span>
            <ConfidenceBar value={e.confidence} />
          </div>
        </button>
      ))}
    </div>
  );
}

function SearchPanel({ onSelect }: { onSelect: (t: string) => void }) {
  const [q, setQ] = useState("P-101");
  const results = equipment.filter((e) => e.tag.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. P-101A, PSV-114" className="font-mono" />
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{results.length} matches</div>
      {results.map((e) => (
        <Card key={e.tag} className="border-border bg-background">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{e.tag}</span>
              <Badge variant="outline" className="text-[10px]">Sheet {e.page}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{e.type}</div>
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[10px]">
              <div className="text-muted-foreground">Line</div><div>{e.line}</div>
              <div className="text-muted-foreground">Size</div><div>{e.size}</div>
              <div className="text-muted-foreground">Coords</div><div>X 482 / Y 316</div>
            </div>
            <Button size="sm" className="mt-3 w-full" onClick={() => onSelect(e.tag)}>
              <Icons.Crosshair className="mr-1.5 h-3 w-3" /> Zoom to item
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MapPanel() {
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">Click any node on the canvas to inspect connections. Open the full graph for filtering.</p>
      <Button asChild size="sm" variant="outline" className="w-full"><a href="/smart-map">Open Smart Map →</a></Button>
    </div>
  );
}
function HazopMini() {
  return (
    <div className="space-y-2 text-xs">
      <p className="text-muted-foreground">7 deviation categories analyzed across this sheet.</p>
      <Button asChild size="sm" variant="outline" className="w-full"><a href="/hazop">Open HAZOP Review →</a></Button>
    </div>
  );
}
function InspectorMini() {
  return (
    <div className="space-y-2">
      {issues.slice(0, 4).map((i) => (
        <div key={i.id} className="rounded-md border border-border bg-background p-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium leading-tight">{i.title}</span>
            <SeverityBadge severity={i.severity} />
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted-foreground">{i.tag}</div>
        </div>
      ))}
    </div>
  );
}
function ColorMini() {
  return <div className="text-xs text-muted-foreground">Adjust diameter-color mapping in Settings.</div>;
}
function EquipmentMini({ onSelect }: { onSelect: (t: string) => void }) {
  return (
    <div className="space-y-2">
      {equipment.slice(0, 5).map((e) => (
        <button key={e.tag} onClick={() => onSelect(e.tag)} className="w-full rounded-md border border-border bg-background p-2.5 text-left hover:border-primary/30">
          <div className="font-mono text-sm font-semibold">{e.tag}</div>
          <div className="text-xs text-muted-foreground">{e.type}</div>
        </button>
      ))}
    </div>
  );
}
