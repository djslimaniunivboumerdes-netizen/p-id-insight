import { useQuery } from "@tanstack/react-query";
import { exportsService, type ExportItem } from "@/services/exports";
import { withEmpty, type DataResult } from "./types";

export function useExports(projectId?: string): DataResult<ExportItem[]> {
  const q = useQuery<ExportItem[], Error>({
    queryKey: ["exports", projectId ?? "default"],
    queryFn: () => exportsService.list(projectId),
  });
  return withEmpty(q, (d) => d.length === 0);
}
