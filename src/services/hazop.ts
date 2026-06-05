import { listHazopFn, type HazopGroupDTO } from "@/lib/pid/api.functions";

export type HazopGroup = HazopGroupDTO;

export const hazopService = {
  list: (projectId?: string): Promise<HazopGroup[]> =>
    listHazopFn({ data: { projectId } }),
};
