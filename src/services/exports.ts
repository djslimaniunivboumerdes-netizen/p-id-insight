import { exports as mockExports } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type ExportItem = (typeof mockExports)[number];

export const exportsService = {
  list: (projectId?: string): Promise<ExportItem[]> =>
    fetchOrMock<ExportItem[]>("/exports", () => [...mockExports], { query: { projectId } }),
};
