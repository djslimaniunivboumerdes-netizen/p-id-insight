import { listExportsFn, type ExportDTO } from "@/lib/pid/api.functions";

export type ExportItem = ExportDTO;

export const exportsService = {
  list: (projectId?: string): Promise<ExportItem[]> =>
    listExportsFn({ data: { projectId } }),
};
