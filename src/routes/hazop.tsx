import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useHazop } from "@/hooks/api/useHazop";
import { LoadingState, ErrorState, EmptyState } from "@/components/data-states";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ShieldCheck, FileWarning } from "lucide-react";

export const Route = createFileRoute("/hazop")({
  head: () => ({ meta: [{ title: "HAZOP Assistant — pid_ai" }] }),
  component: HazopPage,
});

function HazopPage() {
  const q = useHazop();
  const hazop = q.data ?? [];

  return (
    <div>
      <PageHeader title="AI HAZOP Assistant" subtitle="Guided deviation analysis with cause / consequence / safeguard" />
      <div className="space-y-4 p-4 md:p-6">
        <Card className="border-border bg-panel">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              Review session for <span className="font-medium text-foreground">Node 1 — Pump Discharge to V-201</span>. Findings are AI-suggested and require engineering review.
            </div>
          </CardContent>
        </Card>

        {q.isLoading && <LoadingState label="Loading HAZOP session…" />}
        {q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} label="Couldn't load HAZOP data." />}
        {q.isEmpty && <EmptyState label="No HAZOP deviations defined." />}

        {!q.isLoading && !q.isError && hazop.length > 0 && (
          <Accordion type="multiple" defaultValue={["No Flow", "More Pressure"]} className="space-y-3">
            {hazop.map((group) => (
              <AccordionItem key={group.deviation} value={group.deviation} className="rounded-lg border border-border bg-panel px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-warning/10 text-warning ring-1 ring-warning/20">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{group.deviation}</div>
                      <div className="text-xs text-muted-foreground">{group.items.length} scenario(s) identified</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {group.items.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
                      No scenarios identified for this deviation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.items.map((it, i) => (
                        <div key={i} className="grid gap-3 rounded-md border border-border bg-background p-4 md:grid-cols-2">
                          <Field icon={FileWarning} label="Cause" value={it.cause} tone="warning" />
                          <Field icon={AlertTriangle} label="Consequence" value={it.consequence} tone="destructive" />
                          <Field icon={ShieldCheck} label="Existing Safeguard" value={it.safeguard} tone="info" />
                          <Field icon={ShieldCheck} label="Recommendation" value={it.recommendation} tone="success" />
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, tone }: any) {
  const toneCls: Record<string, string> = {
    warning: "text-warning border-warning/30 bg-warning/5",
    destructive: "text-destructive border-destructive/30 bg-destructive/5",
    info: "text-info border-info/30 bg-info/5",
    success: "text-success border-success/30 bg-success/5",
  };
  return (
    <div className={`rounded-md border p-3 ${toneCls[tone]}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1.5 text-sm text-foreground/90">{value}</p>
    </div>
  );
}
