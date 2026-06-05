import { useQuery } from "@tanstack/react-query";
import { issuesService, type Issue } from "@/services/issues";
import { withEmpty, type DataResult } from "./types";

export function useIssues(projectId?: string): DataResult<Issue[]> {
  const q = useQuery<Issue[], Error>({
    queryKey: ["issues", projectId ?? "default"],
    queryFn: () => issuesService.list(projectId),
  });
  return withEmpty(q, (d) => d.length === 0);
}
