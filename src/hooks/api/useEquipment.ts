import { useQuery } from "@tanstack/react-query";
import { inventoryService, type Equipment } from "@/services/inventory";
import { withEmpty, type DataResult } from "./types";

export function useEquipment(projectId?: string): DataResult<Equipment[]> {
  const q = useQuery<Equipment[], Error>({
    queryKey: ["equipment", projectId ?? "default"],
    queryFn: () => inventoryService.listEquipment(projectId),
  });
  return withEmpty(q, (d) => d.length === 0);
}

export function useEquipmentItem(tag: string | undefined): DataResult<Equipment | undefined> {
  const q = useQuery<Equipment | undefined, Error>({
    queryKey: ["equipment", "item", tag],
    queryFn: () => inventoryService.getEquipment(tag as string),
    enabled: !!tag,
  });
  return withEmpty(q, (d) => d === undefined);
}
