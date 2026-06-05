/**
 * P&ID processing pipeline — server-only.
 *
 * Extracts text from a PDF using `unpdf` (PyMuPDF-equivalent on the JS
 * worker runtime), runs regex tag-extraction rules, and returns a
 * structured inventory the API layer persists to the database.
 *
 * NOTE: This is a vector-text-only pipeline (the MVP path the user picked).
 * Scanned PDFs that have no embedded text return zero tags and the API
 * tags the project with status "OCR not configured".
 */

import { extractText, getDocumentProxy } from "unpdf";

// ---------------------------------------------------------------------------
// Tag classification
// ---------------------------------------------------------------------------

const VALVE_PREFIXES = new Set([
  "PSV", "CV", "BV", "GV", "CHK", "HV", "NV", "SV", "ESDV", "XV", "RV",
  "PCV", "TCV", "LCV", "FCV", "PRV", "BDV", "SDV", "MOV",
]);

// Equipment major-class single/two-letter prefixes
const EQUIPMENT_PREFIXES = new Set([
  "P", "C", "K", "V", "E", "T", "R", "D", "H", "F", "B",
  "EX", "HX", "RX", "TK", "CP",
]);

const EQUIPMENT_TYPE_BY_PREFIX: Record<string, string> = {
  P: "Pump",
  C: "Compressor",
  K: "Compressor",
  V: "Vessel",
  E: "Heat Exchanger",
  T: "Tank",
  R: "Reactor",
  D: "Drum",
  H: "Heater",
  F: "Filter",
  B: "Blower",
  EX: "Heat Exchanger",
  HX: "Heat Exchanger",
  RX: "Reactor",
  TK: "Tank",
  CP: "Compressor",
};

const VALVE_TYPE_BY_PREFIX: Record<string, string> = {
  PSV: "Pressure Safety Valve",
  CV: "Control Valve",
  BV: "Ball Valve",
  GV: "Gate Valve",
  CHK: "Check Valve",
  HV: "Hand Valve",
  NV: "Needle Valve",
  SV: "Safety Valve",
  ESDV: "Emergency Shutdown Valve",
  XV: "On/Off Valve",
  RV: "Relief Valve",
  PCV: "Pressure Control Valve",
  TCV: "Temperature Control Valve",
  LCV: "Level Control Valve",
  FCV: "Flow Control Valve",
  PRV: "Pressure Reducing Valve",
  BDV: "Blowdown Valve",
  SDV: "Shutdown Valve",
  MOV: "Motor Operated Valve",
};

// Two-/three-letter instrument prefixes (ISA-5.1 style)
const INSTRUMENT_PREFIX_RE = /^([PFLTAS][TICEHL][CLH]?)$/;

const INSTRUMENT_TYPE_BY_FIRST: Record<string, string> = {
  P: "Pressure",
  F: "Flow",
  L: "Level",
  T: "Temperature",
  A: "Analysis",
  S: "Speed",
};

const INSTRUMENT_TYPE_BY_SECOND: Record<string, string> = {
  T: "Transmitter",
  I: "Indicator",
  C: "Controller",
  E: "Element",
  H: "Switch (High)",
  L: "Switch (Low)",
};

// Anything like ABC-123 or AB-123A
const TAG_RE = /\b([A-Z]{1,4})-(\d{2,5}[A-Z]?)\b/g;

// Line numbers: classic ISA "L-1234" or "L-1234A"
const LINE_RE = /\bL-(\d{3,5}[A-Z]?)\b/g;

export type ExtractedTag = {
  tag: string;
  kind: "equipment" | "valve" | "instrument";
  type: string;
  prefix: string;
  page: number;
};

export type ExtractedLine = { tag: string; page: number };

export type PdfExtraction = {
  pageCount: number;
  /** Plain text per page (1-indexed: `pages[0]` is sheet 1). */
  pages: string[];
  tags: ExtractedTag[];
  lines: ExtractedLine[];
};

function classifyTag(prefix: string, number: string): ExtractedTag["kind"] | null {
  if (VALVE_PREFIXES.has(prefix)) return "valve";
  // Two-letter instrument prefixes (PT, FT, LT, TT, PI, FI, etc.)
  if (prefix.length >= 2 && INSTRUMENT_PREFIX_RE.test(prefix)) return "instrument";
  if (EQUIPMENT_PREFIXES.has(prefix)) return "equipment";
  // Common 3-letter equipment fallback (only if 3+ digit number)
  if (prefix.length <= 3 && /^\d{3,}/.test(number)) return "equipment";
  return null;
}

function typeFor(kind: ExtractedTag["kind"], prefix: string): string {
  if (kind === "equipment") {
    return EQUIPMENT_TYPE_BY_PREFIX[prefix] ?? "Equipment";
  }
  if (kind === "valve") {
    return VALVE_TYPE_BY_PREFIX[prefix] ?? "Valve";
  }
  // instrument
  const first = prefix[0];
  const second = prefix[1];
  const what = INSTRUMENT_TYPE_BY_FIRST[first] ?? "Process";
  const fn = INSTRUMENT_TYPE_BY_SECOND[second] ?? "Instrument";
  return `${what} ${fn}`;
}

/**
 * Extract text + tags from a PDF buffer using unpdf's serverless build.
 */
export async function extractFromPdf(buffer: ArrayBuffer): Promise<PdfExtraction> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const pages: string[] = Array.isArray(text) ? text : [text];

  const seenTags = new Map<string, ExtractedTag>();
  const seenLines = new Map<string, ExtractedLine>();

  pages.forEach((pageText, idx) => {
    const pageNum = idx + 1;
    const haystack = (pageText ?? "").toUpperCase();

    for (const m of haystack.matchAll(TAG_RE)) {
      const [, prefix, number] = m;
      const kind = classifyTag(prefix, number);
      if (!kind) continue;
      const tag = `${prefix}-${number}`;
      if (seenTags.has(tag)) continue;
      seenTags.set(tag, {
        tag,
        kind,
        type: typeFor(kind, prefix),
        prefix,
        page: pageNum,
      });
    }

    for (const m of haystack.matchAll(LINE_RE)) {
      const tag = `L-${m[1]}`;
      if (seenLines.has(tag)) continue;
      seenLines.set(tag, { tag, page: pageNum });
    }
  });

  return {
    pageCount: totalPages,
    pages,
    tags: Array.from(seenTags.values()),
    lines: Array.from(seenLines.values()),
  };
}

/**
 * Heuristic: pick a default pipeline size from the surrounding text near a
 * line tag. Looks for things like `6"` near the tag.
 */
export function inferSize(pageText: string, around: string): string {
  const idx = pageText.toUpperCase().indexOf(around);
  if (idx < 0) return "";
  const window = pageText.slice(Math.max(0, idx - 40), idx + 40);
  const m = window.match(/(\d{1,3})\s*["”]/);
  return m ? `${m[1]}"` : "";
}
