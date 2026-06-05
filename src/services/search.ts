import { searchFn } from "@/lib/pid/api.functions";
import type { Equipment, Valve, Instrument } from "./inventory";

export type SearchHit = Equipment | Valve | Instrument;

export const searchService = {
  search: (query: string, projectId?: string): Promise<SearchHit[]> =>
    searchFn({ data: { q: query, projectId } }) as Promise<SearchHit[]>,
};
