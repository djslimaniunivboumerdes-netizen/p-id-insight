import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PdfViewer } from "@/components/pdf-viewer";
import { useSearch } from "@/hooks/api/useSearch";
import { useInventory } from "@/hooks/api/useInventory";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { Search, Crosshair, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Smart Search — pid_ai" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("P-101");
  const [picked, setPicked] = useState<string | undefined>("P-101A");

  const searchQ = useSearch(q);
  const results = searchQ.data ?? [];

  // Lookup picked item details from the full inventory.
  const invQ = useInventory();
  const all = invQ.data
    ? [...invQ.data.equipment, ...invQ.data.valves, ...invQ.data.instruments]
    : [];
  const item = all.find((i) => i.tag === picked);

  return (
    <div>
      <PageHeader title="Smart Search" subtitle="Locate any tag across all sheets instantly" />
      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags e.g. PSV-114, LT-204" className="pl-8 font-mono" />
            {q && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
                {results.slice(0, 6).map((r) => (
                  <button key={r.tag} onClick={() => { setPicked(r.tag); setQ(r.tag); }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-accent">
                    <span className="font-mono">{r.tag}</span>
                    <span className="text-xs text-muted-foreground">{r.type}</span>
                  </button>
                ))}
                {!searchQ.isLoading && results.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No results</div>}
                {searchQ.isLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>}
              </div>
            )}
          </div>

          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{results.length} results</div>

          {searchQ.isLoading && <LoadingState label="Searching…" />}
          {searchQ.isError && <ErrorState error={searchQ.error} onRetry={() => searchQ.refetch()} label="Search failed." />}
          {!searchQ.isLoading && !searchQ.isError && searchQ.isEmpty && (
            <EmptyState label="No tags match your query." />
          )}

          <div className="space-y-2">
            {results.map((r) => (
              <Card key={r.tag} className={`cursor-pointer border-border bg-panel transition-colors ${picked === r.tag ? "ring-2 ring-primary" : ""}`} onClick={() => setPicked(r.tag)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold">{r.tag}</span>
                    <Badge variant="outline" className="text-[10px]">Sheet {r.page}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.type}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex h-[640px] flex-col gap-3">
          {item && (
            <Card className="border-border bg-panel">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-lg font-semibold">{item.tag}</div>
                    <div className="text-sm text-muted-foreground">{item.type}</div>
                  </div>
                  <Button size="sm"><Crosshair className="mr-1.5 h-3.5 w-3.5" /> Zoom to item</Button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs md:grid-cols-4">
                  <div><div className="text-muted-foreground">Sheet</div><div className="mt-0.5">Page {item.page}</div></div>
                  <div><div className="text-muted-foreground">Line</div><div className="mt-0.5">{item.line}</div></div>
                  <div><div className="text-muted-foreground">Size</div><div className="mt-0.5">{item.size}</div></div>
                  <div><div className="text-muted-foreground">Coords</div><div className="mt-0.5">X 482 / Y 316</div></div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border bg-background p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium"><ArrowUp className="h-3 w-3 text-info" /> Upstream</div>
                    <div className="mt-1.5 font-mono text-xs text-muted-foreground">T-501 · L-2014</div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium"><ArrowDown className="h-3 w-3 text-success" /> Downstream</div>
                    <div className="mt-1.5 font-mono text-xs text-muted-foreground">V-201 · L-2015</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex-1 min-h-0"><PdfViewer pointerMode highlightTag={picked} /></div>
        </div>
      </div>
    </div>
  );
}
