import { listProjectsFn, getProjectFn, listToolsFn, type ProjectDTO } from "@/lib/pid/api.functions";
import { tools as mockTools } from "@/lib/mock-data";

export type Project = ProjectDTO;
export type Tool = (typeof mockTools)[number];

export const projectsService = {
  list: (): Promise<Project[]> => listProjectsFn(),
  get: (id: string): Promise<Project | undefined> =>
    getProjectFn({ data: { id } }).then((p) => p ?? undefined),
  listTools: (): Promise<Tool[]> => listToolsFn(),
};
