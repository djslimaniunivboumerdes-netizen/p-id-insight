import { defaultColorRules } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type ColorRule = (typeof defaultColorRules)[number];

export const settingsService = {
  getColorRules: (): Promise<ColorRule[]> =>
    fetchOrMock<ColorRule[]>("/settings/color-rules", () => [...defaultColorRules]),
};
