import {
  getInventoryFn,
  listEquipmentFn,
  getEquipmentByTagFn,
  type EquipmentDTO,
  type ValveDTO,
  type InstrumentDTO,
  type PipelineDTO,
} from "@/lib/pid/api.functions";

export type Equipment = EquipmentDTO;
export type Valve = ValveDTO;
export type Instrument = InstrumentDTO;
export type Pipeline = PipelineDTO;

export interface Inventory {
  equipment: Equipment[];
  valves: Valve[];
  instruments: Instrument[];
  pipelines: Pipeline[];
}

export const inventoryService = {
  getAll: (projectId?: string): Promise<Inventory> =>
    getInventoryFn({ data: { projectId } }),
  listEquipment: (projectId?: string): Promise<Equipment[]> =>
    listEquipmentFn({ data: { projectId } }),
  getEquipment: (tag: string, projectId?: string): Promise<Equipment | undefined> =>
    getEquipmentByTagFn({ data: { tag, projectId } }).then((e) => e ?? undefined),
};
