import {
  equipment as mockEquipment,
  valves as mockValves,
  instruments as mockInstruments,
} from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type SearchHit =
  | (typeof mockEquipment)[number]
  | (typeof mockValves)[number]
  | (typeof mockInstruments)[number];

export const searchService = {
  search: (query: string, projectId?: string): Promise<SearchHit[]> =>
    fetchOrMock<SearchHit[]>(
      "/search",
      () => {
        const q = query.trim().toLowerCase();
        const all: SearchHit[] = [
          ...mockEquipment,
          ...mockValves,
          ...mockInstruments,
        ];
        if (!q) return all;
        return all.filter((i) => i.tag.toLowerCase().includes(q));
      },
      { query: { q: query, projectId } },
    ),
};
