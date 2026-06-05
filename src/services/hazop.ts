import { hazop as mockHazop } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type HazopGroup = (typeof mockHazop)[number];

export const hazopService = {
  list: (projectId?: string): Promise<HazopGroup[]> =>
    fetchOrMock<HazopGroup[]>("/hazop", () => [...mockHazop], { query: { projectId } }),
};
