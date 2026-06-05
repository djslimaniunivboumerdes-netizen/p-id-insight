import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEquipment } from "@/hooks/api/useEquipment";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { StatusBadge } from "@/components/badges";
import { Search, Cog, MapPin } from "lucide-react";

export const Route = createFileRoute("/equipment")({
  head: () => ({ meta: [{ title: "Equipment Database — pid_ai" }] }),
  component: EquipmentDb,
});

function EquipmentDb() {
  const eq = useEquipment();
  const equipment = eq.data ?? [];

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const types = ["all", ...Array.from(new Set(equipment.map((e) => e.type.split(" ")[0])))];
  const list = equipment.filter((e) =>
    e.tag.toLowerCase().includes(q.toLowerCase()) &&
    (filter === "all" || e.type.startsWith(filter))
  );
  return (
    <div>
      <PageHeader title="Equipment Database" subtitle="Detected equipment registry with connections and references" />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tag…" className="h-9 w-64 pl-8" />
          </div>
          <div className="flex flex-wrap gap-1">
            {types.map((t) => (
              <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilter(t)}>{t}</Button>
            ))}
          </div>
        </div>

        {eq.isLoading && <LoadingState label="Loading equipment…" />}
        {eq.isError && <ErrorState error={eq.error} onRetry={() => eq.refetch()} label="Couldn't load equipment." />}
        {eq.isEmpty && <EmptyState label="No equipment in the registry yet." />}

        {!eq.isLoading && !eq.isError && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((e) => (
              <Card key={e.tag} className="border-border bg-panel transition-colors hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Cog className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-mono text-base font-semibold">{e.tag}</div>
                        <div className="text-xs text-muted-foreground">{e.type}</div>
                      </div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs">
                    {e.suction && <Row k="Suction" v={e.suction} />}
                    {e.discharge && <Row k="Discharge" v={e.discharge} />}
                    <Row k="Line" v={e.line} />
                    <Row k="Size" v={e.size} />
                    <Row k="Instruments" v={e.instruments.join(", ") || "—"} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Sheet {e.page}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">View →</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {list.length === 0 && equipment.length > 0 && (
              <div className="col-span-full rounded-md border border-dashed border-border bg-panel/40 p-12 text-center text-sm text-muted-foreground">
                No equipment matches your filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
