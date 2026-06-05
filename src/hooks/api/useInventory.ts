import { useQuery } from "@tanstack/react-query";
import { inventoryService, type Inventory } from "@/services/inventory";
import { withEmpty, type DataResult } from "./types";

export function useInventory(projectId?: string): DataResult<Inventory> {
  const q = useQuery<Inventory, Error>({
    queryKey: ["inventory", projectId ?? "default"],
    queryFn: () => inventoryService.getAll(projectId),
  });
  return withEmpty(
    q,
    (d) =>
      d.equipment.length === 0 &&
      d.valves.length === 0 &&
      d.instruments.length === 0 &&
      d.pipelines.length === 0,
  );
}
