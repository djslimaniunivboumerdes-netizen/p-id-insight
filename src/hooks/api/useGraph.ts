import { useQuery } from "@tanstack/react-query";
import { graphService, type Graph } from "@/services/graph";
import { withEmpty, type DataResult } from "./types";

export function useGraph(projectId?: string): DataResult<Graph> {
  const q = useQuery<Graph, Error>({
    queryKey: ["graph", projectId ?? "default"],
    queryFn: () => graphService.get(projectId),
  });
  return withEmpty(q, (d) => d.nodes.length === 0);
}
