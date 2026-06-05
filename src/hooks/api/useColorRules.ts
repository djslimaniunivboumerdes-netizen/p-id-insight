import { useQuery } from "@tanstack/react-query";
import { settingsService, type ColorRule } from "@/services/settings";
import { withEmpty, type DataResult } from "./types";

export function useColorRules(): DataResult<ColorRule[]> {
  const q = useQuery<ColorRule[], Error>({
    queryKey: ["settings", "color-rules"],
    queryFn: () => settingsService.getColorRules(),
  });
  return withEmpty(q, (d) => d.length === 0);
}
