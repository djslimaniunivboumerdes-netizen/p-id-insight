import { listColorRulesFn, saveColorRulesFn, type ColorRuleDTO } from "@/lib/pid/api.functions";

export type ColorRule = ColorRuleDTO;

export const settingsService = {
  getColorRules: (): Promise<ColorRule[]> => listColorRulesFn(),
  saveColorRules: (
    rules: Array<{ label: string; min: number; max: number; color: string }>,
  ): Promise<{ ok: true }> => saveColorRulesFn({ data: { rules } }),
};

export const uploadService = {
  uploadAndProcess: async (file: File) => {
    const { uploadAndProcessFn } = await import("@/lib/pid/api.functions");
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // base64 encode in chunks (avoid call-stack overflow on large files)
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(bin);
    return uploadAndProcessFn({
      data: { name: file.name, sizeBytes: file.size, base64 },
    });
  },
};
