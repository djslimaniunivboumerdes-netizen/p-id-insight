import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchService, type SearchHit } from "@/services/search";
import { withEmpty, type DataResult } from "./types";

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useSearch(query: string, projectId?: string): DataResult<SearchHit[]> {
  const debounced = useDebounced(query, 150);
  const q = useQuery<SearchHit[], Error>({
    queryKey: ["search", debounced, projectId ?? "default"],
    queryFn: () => searchService.search(debounced, projectId),
    placeholderData: keepPreviousData,
  });
  return withEmpty(q, (d) => d.length === 0);
}
