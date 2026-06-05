import { useQuery } from "@tanstack/react-query";
import { projectsService, type Project, type Tool } from "@/services/projects";
import { withEmpty, type DataResult } from "./types";

export function useProjects(): DataResult<Project[]> {
  const q = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: () => projectsService.list(),
  });
  return withEmpty(q, (d) => d.length === 0);
}

export function useProject(id: string | undefined): DataResult<Project | undefined> {
  const q = useQuery<Project | undefined, Error>({
    queryKey: ["projects", id],
    queryFn: () => projectsService.get(id as string),
    enabled: !!id,
  });
  return withEmpty(q, (d) => d === undefined);
}

export function useTools(): DataResult<Tool[]> {
  const q = useQuery<Tool[], Error>({
    queryKey: ["tools"],
    queryFn: () => projectsService.listTools(),
  });
  return withEmpty(q, (d) => d.length === 0);
}
