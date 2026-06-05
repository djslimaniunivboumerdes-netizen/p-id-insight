import {
  equipment as mockEquipment,
  valves as mockValves,
  instruments as mockInstruments,
  pipelines as mockPipelines,
} from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type Equipment = (typeof mockEquipment)[number];
export type Valve = (typeof mockValves)[number];
export type Instrument = (typeof mockInstruments)[number];
export type Pipeline = (typeof mockPipelines)[number];

export interface Inventory {
  equipment: Equipment[];
  valves: Valve[];
  instruments: Instrument[];
  pipelines: Pipeline[];
}

export const inventoryService = {
  getAll: (projectId?: string): Promise<Inventory> =>
    fetchOrMock<Inventory>(
      "/inventory",
      () => ({
        equipment: [...mockEquipment],
        valves: [...mockValves],
        instruments: [...mockInstruments],
        pipelines: [...mockPipelines],
      }),
      { query: { projectId } },
    ),

  listEquipment: (projectId?: string): Promise<Equipment[]> =>
    fetchOrMock<Equipment[]>(
      "/equipment",
      () => [...mockEquipment],
      { query: { projectId } },
    ),

  getEquipment: (tag: string): Promise<Equipment | undefined> =>
    fetchOrMock<Equipment | undefined>(
      `/equipment/${encodeURIComponent(tag)}`,
      () => mockEquipment.find((e) => e.tag === tag),
    ),
};
