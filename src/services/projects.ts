import { projects as mockProjects, tools as mockTools } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type Project = (typeof mockProjects)[number];
export type Tool = (typeof mockTools)[number];

export const projectsService = {
  list: (): Promise<Project[]> =>
    fetchOrMock<Project[]>("/projects", () => [...mockProjects]),

  get: (id: string): Promise<Project | undefined> =>
    fetchOrMock<Project | undefined>(
      `/projects/${encodeURIComponent(id)}`,
      () => mockProjects.find((p) => p.id === id),
    ),

  listTools: (): Promise<Tool[]> =>
    fetchOrMock<Tool[]>("/tools", () => [...mockTools]),
};
