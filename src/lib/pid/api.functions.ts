/**
 * All P&ID server functions. Client code imports from here; the TanStack
 * Vite plugin replaces handler bodies with RPC stubs in the client bundle.
 *
 * IMPORTANT: any server-only module (client.server, pipeline.server) must
 * be imported INSIDE `.handler()` bodies via `await import(...)`, otherwise
 * the service-role key leaks into the client graph.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  defaultColorRules,
  graphEdges as mockGraphEdges,
  graphNodes as mockGraphNodes,
  hazop as mockHazop,
  issues as mockIssues,
  projects as mockProjects,
  tools as mockTools,
  equipment as mockEquipment,
  valves as mockValves,
  instruments as mockInstruments,
  pipelines as mockPipelines,
  exports as mockExports,
} from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Shared DTOs (must match the existing service types in src/services/*)
// ---------------------------------------------------------------------------

export type ProjectDTO = {
  id: string;
  name: string;
  pages: number;
  updated: string;
  status: string;
};

export type EquipmentDTO = (typeof mockEquipment)[number];
export type ValveDTO = (typeof mockValves)[number];
export type InstrumentDTO = (typeof mockInstruments)[number];
export type PipelineDTO = (typeof mockPipelines)[number];
export type IssueDTO = (typeof mockIssues)[number];
export type HazopGroupDTO = (typeof mockHazop)[number];
export type ExportDTO = (typeof mockExports)[number];
export type ColorRuleDTO = (typeof defaultColorRules)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  const w = Math.floor(days / 7);
  return `${w}w ago`;
}

// ---------------------------------------------------------------------------
// Projects / tools
// ---------------------------------------------------------------------------

export const listProjectsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProjectDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("id, name, page_count, status, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      pages: r.page_count ?? 0,
      updated: relativeTime(r.updated_at),
      status: r.status,
    }));
  },
);

export const getProjectFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<ProjectDTO | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("projects")
      .select("id, name, page_count, status, updated_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      pages: row.page_count ?? 0,
      updated: relativeTime(row.updated_at),
      status: row.status,
    };
  });

export const listToolsFn = createServerFn({ method: "GET" }).handler(
  async () => [...mockTools],
);

// ---------------------------------------------------------------------------
// Upload + process
// ---------------------------------------------------------------------------

export const uploadAndProcessFn = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; sizeBytes: number; base64: string }) =>
    z
      .object({
        name: z.string().min(1).max(255),
        sizeBytes: z.number().int().min(1).max(60 * 1024 * 1024),
        base64: z.string().min(1),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ projectId: string; pageCount: number; tagsFound: number }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { extractFromPdf } = await import("@/lib/pid/pipeline.server");

      // 1. Decode base64 → bytes
      const bin = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));

      // 2. Create project row
      const { data: project, error: pErr } = await supabaseAdmin
        .from("projects")
        .insert({
          name: data.name,
          status: "Processing",
          file_size_bytes: data.sizeBytes,
        })
        .select("id")
        .single();
      if (pErr || !project) throw new Error(pErr?.message ?? "Failed to create project");
      const projectId = project.id;

      // 3. Upload to private storage bucket
      const storagePath = `${projectId}/${data.name}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("pids")
        .upload(storagePath, bin, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (upErr) {
        await supabaseAdmin.from("projects").delete().eq("id", projectId);
        throw new Error(`Storage upload failed: ${upErr.message}`);
      }
      await supabaseAdmin
        .from("projects")
        .update({ file_path: storagePath })
        .eq("id", projectId);

      // 4. Extract text + tags
      let extraction;
      try {
        extraction = await extractFromPdf(bin.buffer);
      } catch (err) {
        await supabaseAdmin
          .from("projects")
          .update({ status: "Failed" })
          .eq("id", projectId);
        throw new Error(
          `PDF parse failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // 5. Persist OCR text per page
      if (extraction.pages.length) {
        const rows = extraction.pages.map((content, i) => ({
          project_id: projectId,
          page: i + 1,
          content: content.slice(0, 40_000), // safety cap
        }));
        await supabaseAdmin.from("ocr_text").insert(rows);
      }

      // 6. Persist tags
      type TagRow = {
        project_id: string;
        tag: string;
        type: string;
        page: number;
        confidence: number;
        status: string;
        line: string;
        size: string;
      };
      const eqRows: TagRow[] = [];
      const valveRows: TagRow[] = [];
      const instRows: TagRow[] = [];

      for (const t of extraction.tags) {
        const base: TagRow = {
          project_id: projectId,
          tag: t.tag,
          type: t.type,
          page: t.page,
          confidence: 0.85,
          status: "operational",
          line: "",
          size: "",
        };
        if (t.kind === "equipment") eqRows.push(base);
        else if (t.kind === "valve") valveRows.push(base);
        else instRows.push({ ...base, size: "—" });
      }

      const lineRows = extraction.lines.map((l) => ({
        project_id: projectId,
        tag: l.tag,
        size: "",
        fluid: "Process Fluid",
        page: l.page,
        status: "operational",
      }));

      if (eqRows.length)
        await supabaseAdmin.from("equipment").insert(eqRows as never);
      if (valveRows.length)
        await supabaseAdmin.from("valves").insert(valveRows as never);
      if (instRows.length)
        await supabaseAdmin.from("instruments").insert(instRows as never);
      if (lineRows.length)
        await supabaseAdmin.from("pipelines").insert(lineRows as never);

      // 7. Seed minimal HAZOP scaffold so the page has something to show
      const hazopRows = [
        "No Flow",
        "More Pressure",
        "Less Pressure",
        "High Temperature",
        "Reverse Flow",
        "Leak / Loss of Containment",
      ].map((deviation, i) => ({
        project_id: projectId,
        deviation,
        cause: "",
        consequence: "",
        safeguard: "",
        recommendation:
          "Review with process engineer — auto-detection not yet configured.",
        sort_order: i,
      }));
      await supabaseAdmin.from("hazop_items").insert(hazopRows);

      // 8. Finalize
      const totalTags = eqRows.length + valveRows.length + instRows.length;
      const finalStatus = totalTags === 0 ? "OCR not configured" : "Complete";
      await supabaseAdmin
        .from("projects")
        .update({ page_count: extraction.pageCount, status: finalStatus })
        .eq("id", projectId);

      return {
        projectId,
        pageCount: extraction.pageCount,
        tagsFound: totalTags,
      };
    },
  );

// ---------------------------------------------------------------------------
// Inventory / equipment
// ---------------------------------------------------------------------------

type InventoryQuery = { projectId?: string };
const inventoryInput = z.object({ projectId: z.string().optional() });

function mapEquipmentRow(r: Record<string, unknown>): EquipmentDTO {
  return {
    tag: String(r.tag ?? ""),
    type: String(r.type ?? "Equipment"),
    line: String(r.line ?? ""),
    size: String(r.size ?? ""),
    page: Number(r.page ?? 1),
    confidence: Number(r.confidence ?? 0.8),
    status: (r.status as EquipmentDTO["status"]) ?? "operational",
    suction: r.suction ? String(r.suction) : undefined,
    discharge: r.discharge ? String(r.discharge) : undefined,
    instruments: Array.isArray(r.instruments) ? (r.instruments as string[]) : [],
  } as EquipmentDTO;
}
function mapTagRow(r: Record<string, unknown>): ValveDTO {
  return {
    tag: String(r.tag ?? ""),
    type: String(r.type ?? ""),
    line: String(r.line ?? ""),
    size: String(r.size ?? ""),
    page: Number(r.page ?? 1),
    confidence: Number(r.confidence ?? 0.8),
    status: (r.status as ValveDTO["status"]) ?? "operational",
  } as ValveDTO;
}
function mapPipelineRow(r: Record<string, unknown>): PipelineDTO {
  return {
    tag: String(r.tag ?? ""),
    size: String(r.size ?? ""),
    fluid: String(r.fluid ?? "Process Fluid"),
    from: r.from_tag ? String(r.from_tag) : "",
    to: r.to_tag ? String(r.to_tag) : "",
    page: Number(r.page ?? 1),
    status: (r.status as PipelineDTO["status"]) ?? "operational",
  } as PipelineDTO;
}

export const getInventoryFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(
    async ({
      data,
    }): Promise<{
      equipment: EquipmentDTO[];
      valves: ValveDTO[];
      instruments: InstrumentDTO[];
      pipelines: PipelineDTO[];
    }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (!data.projectId) {
        return {
          equipment: [...mockEquipment],
          valves: [...mockValves],
          instruments: [...mockInstruments],
          pipelines: [...mockPipelines],
        };
      }
      const [eq, vl, ins, pl] = await Promise.all([
        supabaseAdmin.from("equipment").select("*").eq("project_id", data.projectId),
        supabaseAdmin.from("valves").select("*").eq("project_id", data.projectId),
        supabaseAdmin.from("instruments").select("*").eq("project_id", data.projectId),
        supabaseAdmin.from("pipelines").select("*").eq("project_id", data.projectId),
      ]);
      return {
        equipment: (eq.data ?? []).map(mapEquipmentRow),
        valves: (vl.data ?? []).map(mapTagRow),
        instruments: (ins.data ?? []).map(mapTagRow) as InstrumentDTO[],
        pipelines: (pl.data ?? []).map(mapPipelineRow),
      };
    },
  );

export const listEquipmentFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(async ({ data }): Promise<EquipmentDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.projectId) return [...mockEquipment];
    const { data: rows, error } = await supabaseAdmin
      .from("equipment")
      .select("*")
      .eq("project_id", data.projectId);
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapEquipmentRow);
  });

export const getEquipmentByTagFn = createServerFn({ method: "GET" })
  .inputValidator((input: { tag: string; projectId?: string }) =>
    z.object({ tag: z.string().min(1), projectId: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<EquipmentDTO | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.projectId) {
      return mockEquipment.find((e) => e.tag === data.tag) ?? null;
    }
    const { data: row } = await supabaseAdmin
      .from("equipment")
      .select("*")
      .eq("project_id", data.projectId)
      .eq("tag", data.tag)
      .maybeSingle();
    return row ? mapEquipmentRow(row) : null;
  });

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const searchFn = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string; projectId?: string }) =>
    z.object({ q: z.string().max(200), projectId: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.q.trim();
    if (!data.projectId) {
      const all = [...mockEquipment, ...mockValves, ...mockInstruments];
      if (!q) return all;
      return all.filter((i) => i.tag.toLowerCase().includes(q.toLowerCase()));
    }
    const pattern = q ? `%${q}%` : "%";
    const [eq, vl, ins] = await Promise.all([
      supabaseAdmin
        .from("equipment")
        .select("*")
        .eq("project_id", data.projectId)
        .ilike("tag", pattern),
      supabaseAdmin
        .from("valves")
        .select("*")
        .eq("project_id", data.projectId)
        .ilike("tag", pattern),
      supabaseAdmin
        .from("instruments")
        .select("*")
        .eq("project_id", data.projectId)
        .ilike("tag", pattern),
    ]);
    return [
      ...(eq.data ?? []).map(mapEquipmentRow),
      ...(vl.data ?? []).map(mapTagRow),
      ...(ins.data ?? []).map(mapTagRow),
    ];
  });

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

export const getGraphFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(async ({ data }) => {
    if (!data.projectId) {
      return { nodes: [...mockGraphNodes], edges: [...mockGraphEdges] };
    }
    // Build a simple grid graph from equipment + pipelines for real projects.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [eq, pl] = await Promise.all([
      supabaseAdmin.from("equipment").select("tag, type").eq("project_id", data.projectId),
      supabaseAdmin
        .from("pipelines")
        .select("tag, from_tag, to_tag")
        .eq("project_id", data.projectId),
    ]);
    const nodes = (eq.data ?? []).map((row, i) => ({
      id: row.tag,
      type: String(row.type ?? "equipment").toLowerCase(),
      x: 120 + (i % 5) * 160,
      y: 120 + Math.floor(i / 5) * 140,
      label: row.tag,
    }));
    const edges = (pl.data ?? [])
      .filter((p) => p.from_tag && p.to_tag)
      .map((p) => ({ from: p.from_tag as string, to: p.to_tag as string, line: p.tag }));
    return { nodes, edges };
  });

// ---------------------------------------------------------------------------
// Issues / HAZOP / Exports
// ---------------------------------------------------------------------------

export const listIssuesFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(async ({ data }): Promise<IssueDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.projectId) return [...mockIssues];
    const { data: rows, error } = await supabaseAdmin
      .from("issues")
      .select("*")
      .eq("project_id", data.projectId);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      category: String(r.category),
      severity: r.severity as IssueDTO["severity"],
      tag: String(r.tag),
      explanation: String(r.explanation),
      action: String(r.action),
    }));
  });

export const listHazopFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(async ({ data }): Promise<HazopGroupDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.projectId) return [...mockHazop];
    const { data: rows, error } = await supabaseAdmin
      .from("hazop_items")
      .select("*")
      .eq("project_id", data.projectId)
      .order("sort_order");
    if (error) throw new Error(error.message);
    const byDev = new Map<string, HazopGroupDTO>();
    for (const r of rows ?? []) {
      const deviation = String(r.deviation);
      if (!byDev.has(deviation)) byDev.set(deviation, { deviation, items: [] });
      if (r.cause || r.consequence || r.safeguard || r.recommendation) {
        byDev.get(deviation)!.items.push({
          cause: String(r.cause ?? ""),
          consequence: String(r.consequence ?? ""),
          safeguard: String(r.safeguard ?? ""),
          recommendation: String(r.recommendation ?? ""),
        });
      }
    }
    return Array.from(byDev.values());
  });

export const listExportsFn = createServerFn({ method: "GET" })
  .inputValidator((input: InventoryQuery) => inventoryInput.parse(input))
  .handler(async ({ data }): Promise<ExportDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.projectId) return [...mockExports];
    const { data: rows, error } = await supabaseAdmin
      .from("exports")
      .select("*")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      type: String(r.type),
      size: String(r.size),
      date: relativeTime(String(r.created_at)),
      status: String(r.status),
    })) as ExportDTO[];
  });

// ---------------------------------------------------------------------------
// Color rules
// ---------------------------------------------------------------------------

export const listColorRulesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ColorRuleDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("color_rules")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [...defaultColorRules];
    return data.map((r) => ({
      id: String(r.id),
      label: String(r.label),
      min: Number(r.min),
      max: Number(r.max),
      color: String(r.color),
    })) as ColorRuleDTO[];
  },
);

export const saveColorRulesFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      rules: Array<{ label: string; min: number; max: number; color: string }>;
    }) =>
      z
        .object({
          rules: z
            .array(
              z.object({
                label: z.string().min(1).max(64),
                min: z.number().min(0).max(9999),
                max: z.number().min(0).max(9999),
                color: z
                  .string()
                  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be hex #RRGGBB"),
              }),
            )
            .min(1)
            .max(20),
        })
        .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("color_rules").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const rows = data.rules.map((r, i) => ({ ...r, sort_order: i }));
    const { error } = await supabaseAdmin.from("color_rules").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
