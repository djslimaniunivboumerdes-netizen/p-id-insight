import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { useInventory } from "@/hooks/api/useInventory";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { ConfidenceBar, StatusBadge } from "@/components/badges";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — pid_ai" }] }),
  component: Inventory,
});

type Row = { tag: string; type: string; line: string; size: string; page: number; confidence: number; status: any };

function InventoryTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <EmptyState label="No items in this category." />;
  return (
    <div className="rounded-md border border-border bg-panel overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-background/40 hover:bg-background/40">
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Tag</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Type</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Line</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Size</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Page</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Confidence</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-wider">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.tag} className="hover:bg-accent/20">
              <TableCell className="font-mono text-sm font-semibold">{r.tag}</TableCell>
              <TableCell className="text-sm">{r.type}</TableCell>
              <TableCell className="font-mono text-xs">{r.line}</TableCell>
              <TableCell className="font-mono text-xs">{r.size}</TableCell>
              <TableCell className="font-mono text-xs">{r.page}</TableCell>
              <TableCell><ConfidenceBar value={r.confidence} /></TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Inventory() {
  const inv = useInventory();
  const data = inv.data ?? { equipment: [], valves: [], instruments: [], pipelines: [] };
  const { equipment, valves, instruments, pipelines } = data;

  const pipelineRows: Row[] = pipelines.map((p) => ({
    tag: p.tag, type: `Pipeline · ${p.fluid}`, line: `${p.from} → ${p.to}`, size: p.size, page: p.page, confidence: 0.95, status: p.status,
  }));

  return (
    <div>
      <PageHeader
        title="Inventory Generator"
        subtitle="Auto-extracted equipment, valves, instruments, and pipelines"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Exporting Excel…")}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Exporting PDF…")}>
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Download All</Button>
          </>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        {inv.isLoading && <LoadingState label="Loading inventory…" />}
        {inv.isError && <ErrorState error={inv.error} onRetry={() => inv.refetch()} label="Couldn't load inventory." />}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Equipment", value: equipment.length },
            { label: "Valves", value: valves.length },
            { label: "Instruments", value: instruments.length },
            { label: "Pipelines", value: pipelines.length },
          ].map((s) => (
            <Card key={s.label} className="border-border bg-panel">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-mono text-2xl font-semibold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="equipment">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="valves">Valves</TabsTrigger>
              <TabsTrigger value="instruments">Instruments</TabsTrigger>
              <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Filter tags…" className="h-9 w-56 pl-8" />
            </div>
          </div>
          <TabsContent value="equipment" className="mt-4"><InventoryTable rows={equipment as any} /></TabsContent>
          <TabsContent value="valves" className="mt-4"><InventoryTable rows={valves as any} /></TabsContent>
          <TabsContent value="instruments" className="mt-4"><InventoryTable rows={instruments as any} /></TabsContent>
          <TabsContent value="pipelines" className="mt-4"><InventoryTable rows={pipelineRows} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
