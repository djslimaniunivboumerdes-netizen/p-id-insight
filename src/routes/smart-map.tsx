import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGraph } from "@/hooks/api/useGraph";
import { useEquipment } from "@/hooks/api/useEquipment";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { Cylinder, Cog, Factory, Container, Activity, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/smart-map")({
  head: () => ({ meta: [{ title: "Smart Map — pid_ai" }] }),
  component: SmartMap,
});

const typeIcon: Record<string, any> = {
  tank: Container, pump: Cog, vessel: Cylinder, exchanger: Factory, compressor: Factory, instrument: Activity,
};
const typeColor: Record<string, string> = {
  tank: "text-info", pump: "text-warning", vessel: "text-primary", exchanger: "text-success", compressor: "text-destructive", instrument: "text-muted-foreground",
};

function SmartMap() {
  const graphQ = useGraph();
  const eqQ = useEquipment();
  const graphNodes = graphQ.data?.nodes ?? [];
  const graphEdges = graphQ.data?.edges ?? [];
  const equipment = eqQ.data ?? [];

  const [selectedNode, setSelectedNode] = useState<string | null>("P-101A");
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredNodes = typeFilter === "all" ? graphNodes : graphNodes.filter((n) => n.type === typeFilter);
  const visibleIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = graphEdges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to));

  const node = graphNodes.find((n) => n.id === selectedNode);
  const eq = equipment.find((e) => e.tag === selectedNode);
  const edge = graphEdges.find((e) => `${e.from}-${e.to}-${e.line}` === selectedEdge);

  return (
    <div>
      <PageHeader title="Smart Map" subtitle="Interactive process network and line tracing" />
      <div className="space-y-4 p-4 md:p-6">
        <Card className="border-border bg-panel">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground mr-2">Filter:</span>
              {["all", "pump", "vessel", "exchanger", "compressor", "tank", "instrument"].map((t) => (
                <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} className="h-7 text-xs capitalize" onClick={() => setTypeFilter(t)}>{t}</Button>
              ))}
              <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Equipment</span>
                <span className="flex items-center gap-1"><span className="h-px w-4 bg-foreground/40" /> Process line</span>
                <span className="flex items-center gap-1"><span className="h-px w-4 bg-foreground/40" style={{ borderTop: "1px dashed" }} /> Signal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {graphQ.isLoading && <LoadingState label="Loading process graph…" />}
        {graphQ.isError && <ErrorState error={graphQ.error} onRetry={() => graphQ.refetch()} label="Couldn't load process graph." />}
        {graphQ.isEmpty && <EmptyState label="No graph data for this project." />}

        {!graphQ.isLoading && !graphQ.isError && graphNodes.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <Card className="border-border bg-panel">
              <CardContent className="p-0">
                <div className="relative h-[560px] overflow-hidden rounded-md grid-bg">
                  <svg viewBox="0 0 1040 520" className="h-full w-full">
                    {/* Edges */}
                    {filteredEdges.map((e, i) => {
                      const a = graphNodes.find((n) => n.id === e.from)!;
                      const b = graphNodes.find((n) => n.id === e.to)!;
                      const id = `${e.from}-${e.to}-${e.line}`;
                      const isSignal = e.line === "signal";
                      const active = selectedEdge === id;
                      return (
                        <g key={i} className="cursor-pointer" onClick={() => { setSelectedEdge(id); setSelectedNode(null); }}>
                          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke={active ? "var(--color-primary)" : "var(--color-muted-foreground)"}
                            strokeWidth={active ? 2.5 : 1.5}
                            strokeDasharray={isSignal ? "4,4" : undefined}
                            opacity={active ? 1 : 0.55}
                          />
                          {!isSignal && (
                            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} fontSize="9" textAnchor="middle"
                              fill="var(--color-muted-foreground)" fontFamily="monospace">{e.line}</text>
                          )}
                        </g>
                      );
                    })}
                    {/* Nodes */}
                    {filteredNodes.map((n) => {
                      const active = selectedNode === n.id;
                      return (
                        <g key={n.id} className="cursor-pointer" onClick={() => { setSelectedNode(n.id); setSelectedEdge(null); }}>
                          <circle cx={n.x} cy={n.y} r={active ? 26 : 22}
                            fill="var(--color-background)"
                            stroke={active ? "var(--color-primary)" : "var(--color-border)"}
                            strokeWidth={active ? 2.5 : 1.5} />
                          <text x={n.x} y={n.y + 3} fontSize="9" textAnchor="middle" fill="var(--color-foreground)" fontFamily="monospace" fontWeight="600">{n.id.split("-")[0]}</text>
                          <text x={n.x} y={n.y + 42} fontSize="10" textAnchor="middle" fill="var(--color-muted-foreground)" fontFamily="monospace">{n.label}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-panel">
              <CardContent className="p-4">
                {(node || edge) && (
                  <button className="ml-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent" onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                {!node && !edge && <div className="py-12 text-center text-sm text-muted-foreground">Select a node or line to inspect.</div>}
                {node && (() => {
                  const Icon = typeIcon[node.type] ?? Activity;
                  return (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className={cn("grid h-10 w-10 place-items-center rounded-md bg-accent/40 ring-1 ring-border", typeColor[node.type])}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-mono text-lg font-semibold">{node.label}</div>
                          <div className="text-xs text-muted-foreground capitalize">{node.type}</div>
                        </div>
                      </div>
                      {eq && (
                        <div className="mt-4 space-y-2 text-xs">
                          <Row k="Type" v={eq.type} />
                          <Row k="Line" v={eq.line} />
                          <Row k="Size" v={eq.size} />
                          <Row k="Page" v={`Sheet ${eq.page}`} />
                          <Row k="Instruments" v={eq.instruments.join(", ")} />
                        </div>
                      )}
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">View on Sheet</Button>
                        <Button size="sm" className="flex-1">Trace Line</Button>
                      </div>
                    </div>
                  );
                })()}
                {edge && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Pipeline</div>
                    <div className="mt-1 font-mono text-lg font-semibold">{edge.line}</div>
                    <div className="mt-4 space-y-2 text-xs">
                      <Row k="From" v={edge.from} />
                      <Row k="To" v={edge.to} />
                      <Row k="Size" v="6&quot;" />
                      <Row k="Fluid" v="Crude Oil" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between border-b border-border/60 pb-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-right">{v}</span>
    </div>
  );
}
