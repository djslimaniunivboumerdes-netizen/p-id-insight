import { useQuery } from "@tanstack/react-query";
import { hazopService, type HazopGroup } from "@/services/hazop";
import { withEmpty, type DataResult } from "./types";

export function useHazop(projectId?: string): DataResult<HazopGroup[]> {
  const q = useQuery<HazopGroup[], Error>({
    queryKey: ["hazop", projectId ?? "default"],
    queryFn: () => hazopService.list(projectId),
  });
  return withEmpty(q, (d) => d.length === 0);
}
