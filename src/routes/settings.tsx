import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useColorRules } from "@/hooks/api/useColorRules";
import type { ColorRule } from "@/services/settings";
import { LoadingState, ErrorState } from "@/components/data-states";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — pid_ai" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const rulesQ = useColorRules();
  const [rules, setRules] = useState<ColorRule[]>([]);

  // Sync local edit state once the server data arrives.
  useEffect(() => {
    if (rulesQ.data) setRules(rulesQ.data);
  }, [rulesQ.data]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure detection rules, color mapping, and viewer preferences" actions={
        <Button size="sm" onClick={() => toast.success("Settings saved")}><Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes</Button>
      } />
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-panel">
            <CardContent className="p-5">
              <h3 className="font-semibold">Pipeline Diameter → Color</h3>
              <p className="mt-1 text-xs text-muted-foreground">Define how pipe diameters are color-coded in the viewer overlay.</p>

              {rulesQ.isLoading && <LoadingState label="Loading rules…" />}
              {rulesQ.isError && <ErrorState error={rulesQ.error} onRetry={() => rulesQ.refetch()} label="Couldn't load color rules." />}

              <div className="mt-4 space-y-2">
                {rules.map((r, i) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2.5">
                    <Input className="h-8 w-28 font-mono text-xs" value={r.label} onChange={(e) => {
                      const next = [...rules]; next[i] = { ...r, label: e.target.value }; setRules(next);
                    }} />
                    <span className="text-xs text-muted-foreground">min</span>
                    <Input type="number" className="h-8 w-20 font-mono text-xs" value={r.min} onChange={(e) => {
                      const next = [...rules]; next[i] = { ...r, min: +e.target.value }; setRules(next);
                    }} />
                    <span className="text-xs text-muted-foreground">max</span>
                    <Input type="number" className="h-8 w-20 font-mono text-xs" value={r.max} onChange={(e) => {
                      const next = [...rules]; next[i] = { ...r, max: +e.target.value }; setRules(next);
                    }} />
                    <Input type="color" className="h-8 w-14 cursor-pointer p-1" value={r.color} onChange={(e) => {
                      const next = [...rules]; next[i] = { ...r, color: e.target.value }; setRules(next);
                    }} />
                    <div className="ml-2 h-6 flex-1 rounded" style={{ background: r.color }} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setRules(rules.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setRules([...rules, { id: Math.random().toString(36).slice(2), label: "New", min: 0, max: 1, color: "#888888" }])}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Rule
                </Button>
              </div>

              <Separator className="my-5" />
              <h4 className="text-sm font-semibold">Live Preview</h4>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                {rules.map((r) => (
                  <div key={r.id} className="rounded-md border border-border bg-background p-3 text-center">
                    <div className="mx-auto h-2 w-full rounded-full" style={{ background: r.color }} />
                    <div className="mt-2 font-mono text-xs">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-panel">
            <CardContent className="p-5">
              <h3 className="font-semibold">Status Colors</h3>
              <p className="mt-1 text-xs text-muted-foreground">Equipment operational state colors used across the app.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                {[
                  { label: "Operational", color: "#22c55e" },
                  { label: "Under Maintenance", color: "#eab308" },
                  { label: "Out of Service", color: "#71717a" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <Input type="color" defaultValue={s.color} className="h-9 w-12 cursor-pointer p-1" />
                    <span className="text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-panel">
            <CardContent className="p-5">
              <h3 className="font-semibold">Inspection Rules</h3>
              <p className="mt-1 text-xs text-muted-foreground">Toggle which rules the AI Inspector should apply.</p>
              <div className="mt-4 space-y-3">
                {["Missing PSV detection", "Missing check valve", "Spec mismatch", "Orphan instruments", "Dead-end lines", "Isolated equipment", "Unsupported connections"].map((r) => (
                  <div key={r} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                    <Label className="text-sm">{r}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-panel">
            <CardContent className="p-5">
              <h3 className="font-semibold">Default Export Options</h3>
              <div className="mt-4 space-y-3">
                {["Include cover page", "Embed inspection findings", "Include line legend", "High-resolution rasterization"].map((o) => (
                  <div key={o} className="flex items-center justify-between text-sm">
                    <Label>{o}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-panel">
            <CardContent className="p-5">
              <h3 className="font-semibold">Viewer Preferences</h3>
              <div className="mt-4 space-y-3">
                {["Enable grid overlay", "Snap to tag", "Show confidence chips", "Auto-fit on page change"].map((o) => (
                  <div key={o} className="flex items-center justify-between text-sm">
                    <Label>{o}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
