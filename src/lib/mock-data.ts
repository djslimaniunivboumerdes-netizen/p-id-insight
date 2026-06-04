export type Severity = "critical" | "high" | "medium" | "low";
export type Status = "operational" | "maintenance" | "out-of-service";

export const projects = [
  { id: "p-001", name: "LNG Train 4 - Compression Unit", pages: 24, updated: "2h ago", status: "Analyzing" },
  { id: "p-002", name: "Refinery Block 12 - Crude Unit", pages: 56, updated: "1d ago", status: "Complete" },
  { id: "p-003", name: "Ethylene Cracker - Quench", pages: 18, updated: "3d ago", status: "Complete" },
  { id: "p-004", name: "Offshore Platform B - Separation", pages: 32, updated: "1w ago", status: "Archived" },
];

export const equipment = [
  { tag: "P-101A", type: "Centrifugal Pump", line: "L-2014", size: "6\"", page: 3, confidence: 0.98, status: "operational" as Status, suction: "L-2014", discharge: "L-2015", instruments: ["PT-101", "FT-101"] },
  { tag: "P-101B", type: "Centrifugal Pump", line: "L-2014", size: "6\"", page: 3, confidence: 0.96, status: "maintenance" as Status, suction: "L-2014", discharge: "L-2015", instruments: ["PT-102"] },
  { tag: "V-201", type: "Pressure Vessel", line: "L-2101", size: "48\"", page: 5, confidence: 0.99, status: "operational" as Status, instruments: ["LT-201", "PT-201", "TT-201"] },
  { tag: "E-301", type: "Shell & Tube Exchanger", line: "L-3001", size: "20\"", page: 7, confidence: 0.94, status: "operational" as Status, instruments: ["TT-301", "TT-302"] },
  { tag: "C-401", type: "Reciprocating Compressor", line: "L-4001", size: "12\"", page: 9, confidence: 0.97, status: "operational" as Status, instruments: ["PT-401", "VT-401"] },
  { tag: "T-501", type: "Storage Tank", line: "L-5001", size: "60\"", page: 11, confidence: 0.99, status: "out-of-service" as Status, instruments: ["LT-501"] },
  { tag: "K-601", type: "Centrifugal Compressor", line: "L-6001", size: "16\"", page: 12, confidence: 0.93, status: "operational" as Status, instruments: ["PT-601", "TT-601"] },
];

export const valves = [
  { tag: "PSV-114", type: "Pressure Safety Valve", line: "L-2015", size: "2\"", page: 3, confidence: 0.99, status: "operational" as Status },
  { tag: "CV-205", type: "Control Valve", line: "L-2101", size: "4\"", page: 5, confidence: 0.97, status: "operational" as Status },
  { tag: "BV-310", type: "Ball Valve", line: "L-3001", size: "8\"", page: 7, confidence: 0.95, status: "operational" as Status },
  { tag: "CHK-415", type: "Check Valve", line: "L-4001", size: "6\"", page: 9, confidence: 0.98, status: "operational" as Status },
  { tag: "GV-512", type: "Gate Valve", line: "L-5001", size: "12\"", page: 11, confidence: 0.94, status: "maintenance" as Status },
];

export const instruments = [
  { tag: "PT-101", type: "Pressure Transmitter", line: "L-2015", size: "—", page: 3, confidence: 0.97, status: "operational" as Status },
  { tag: "FT-101", type: "Flow Transmitter", line: "L-2015", size: "—", page: 3, confidence: 0.96, status: "operational" as Status },
  { tag: "LT-201", type: "Level Transmitter", line: "L-2101", size: "—", page: 5, confidence: 0.98, status: "operational" as Status },
  { tag: "TT-301", type: "Temperature Transmitter", line: "L-3001", size: "—", page: 7, confidence: 0.95, status: "operational" as Status },
  { tag: "LT-204", type: "Level Transmitter", line: "L-2102", size: "—", page: 5, confidence: 0.92, status: "operational" as Status },
];

export const pipelines = [
  { tag: "L-2014", size: "6\"", fluid: "Crude Oil", from: "T-501", to: "P-101A", page: 3, status: "operational" as Status },
  { tag: "L-2015", size: "6\"", fluid: "Crude Oil", from: "P-101A", to: "V-201", page: 3, status: "operational" as Status },
  { tag: "L-2101", size: "8\"", fluid: "Hydrocarbon Vapor", from: "V-201", to: "E-301", page: 5, status: "operational" as Status },
  { tag: "L-3001", size: "20\"", fluid: "Cooling Water", from: "E-301", to: "C-401", page: 7, status: "operational" as Status },
  { tag: "L-4001", size: "12\"", fluid: "Process Gas", from: "C-401", to: "K-601", page: 9, status: "operational" as Status },
  { tag: "L-5001", size: "60\"", fluid: "Storage", from: "T-501", to: "P-101B", page: 11, status: "maintenance" as Status },
];

export const issues: Array<{
  id: string; title: string; category: string; severity: Severity; tag: string; explanation: string; action: string;
}> = [
  { id: "I-001", title: "Missing PSV downstream of pump", category: "Missing PSV", severity: "critical", tag: "P-101A", explanation: "Centrifugal pump P-101A discharge line lacks a pressure safety valve. Per API 521, positive displacement and centrifugal pumps with shut-off head exceeding piping class require overpressure protection.", action: "Add a PSV on line L-2015 sized for blocked outlet scenario." },
  { id: "I-002", title: "Spec mismatch on flange rating", category: "Spec mismatch", severity: "high", tag: "L-3001", explanation: "Line L-3001 shows ANSI 150# flanges connected to a 300# rated header.", action: "Update to ANSI 300# flanges or verify isolation." },
  { id: "I-003", title: "Orphan instrument detected", category: "Orphan instrument", severity: "medium", tag: "PT-102", explanation: "Pressure transmitter PT-102 has no connected control loop or DCS reference.", action: "Verify loop diagram or remove from inventory." },
  { id: "I-004", title: "Dead-end line identified", category: "Dead-end line", severity: "medium", tag: "L-2102", explanation: "Line L-2102 terminates without a vent, drain, or downstream connection.", action: "Add vent/drain or close-coupled blind." },
  { id: "I-005", title: "Missing check valve on parallel pump", category: "Missing check valve", severity: "high", tag: "P-101B", explanation: "Parallel pump configuration without check valve on discharge can cause reverse flow.", action: "Install check valve on P-101B discharge." },
  { id: "I-006", title: "Isolated equipment", category: "Isolated equipment", severity: "low", tag: "T-501", explanation: "Tank T-501 shows no connectivity on current sheet — verify sheet continuation reference.", action: "Confirm cross-sheet reference on page 11." },
];

export const hazop = [
  { deviation: "No Flow", items: [
    { cause: "Pump P-101A trip", consequence: "Loss of feed to V-201, potential dry-out of E-301", safeguard: "Low-flow alarm FAL-101, auto-start of P-101B", recommendation: "Verify auto-start logic and test quarterly." },
    { cause: "Closed isolation valve BV-310", consequence: "Deadhead on P-101A, mechanical damage", safeguard: "Minimum flow recirculation line", recommendation: "Confirm min-flow line is unobstructed." },
  ]},
  { deviation: "More Pressure", items: [
    { cause: "Blocked discharge, downstream valve closure", consequence: "Overpressure of L-2015 above design", safeguard: "PSV-114 set at 285 psig", recommendation: "Verify PSV sizing for blocked outlet case." },
  ]},
  { deviation: "Less Pressure", items: [
    { cause: "Suction line leak", consequence: "Cavitation, pump damage, environmental release", safeguard: "Low pressure alarm PAL-101", recommendation: "Add gas detection in pump area." },
  ]},
  { deviation: "High Temperature", items: [
    { cause: "Loss of cooling water to E-301", consequence: "Process fluid overheating, vapor generation", safeguard: "TAH-301 high temperature alarm", recommendation: "Add SIS trip on TAHH-301." },
  ]},
  { deviation: "Low Temperature", items: [], },
  { deviation: "Reverse Flow", items: [
    { cause: "P-101A trip with P-101B running", consequence: "Reverse rotation, mechanical damage to P-101A", safeguard: "Check valve required (currently missing)", recommendation: "See issue I-005 — install check valve." },
  ]},
  { deviation: "Leak / Loss of Containment", items: [
    { cause: "Flange failure on L-3001 spec mismatch", consequence: "Hydrocarbon release, fire risk", safeguard: "Area gas detection", recommendation: "Correct flange spec — see issue I-002." },
  ]},
];

export const defaultColorRules = [
  { id: "r1", label: "≤ 2\"", min: 0, max: 2, color: "#ef4444" },
  { id: "r2", label: "2\" – 4\"", min: 2, max: 4, color: "#3b82f6" },
  { id: "r3", label: "4\" – 8\"", min: 4, max: 8, color: "#22c55e" },
  { id: "r4", label: "8\" – 20\"", min: 8, max: 20, color: "#a855f7" },
  { id: "r5", label: "> 20\"", min: 20, max: 999, color: "#f59e0b" },
];

export const exports = [
  { id: "e1", name: "Inventory_Report_v3.xlsx", type: "Excel", size: "2.4 MB", date: "Today, 14:22", status: "complete" },
  { id: "e2", name: "Enhanced_PnID_Annotated.pdf", type: "PDF", size: "18.7 MB", date: "Today, 13:55", status: "complete" },
  { id: "e3", name: "Inspection_Report.pdf", type: "PDF", size: "4.1 MB", date: "Yesterday", status: "complete" },
];

// Graph nodes for smart map
export const graphNodes = [
  { id: "T-501", type: "tank", x: 80, y: 280, label: "T-501" },
  { id: "P-101A", type: "pump", x: 240, y: 220, label: "P-101A" },
  { id: "P-101B", type: "pump", x: 240, y: 360, label: "P-101B" },
  { id: "V-201", type: "vessel", x: 420, y: 280, label: "V-201" },
  { id: "E-301", type: "exchanger", x: 600, y: 200, label: "E-301" },
  { id: "C-401", type: "compressor", x: 780, y: 280, label: "C-401" },
  { id: "K-601", type: "compressor", x: 940, y: 200, label: "K-601" },
  { id: "PT-101", type: "instrument", x: 320, y: 140, label: "PT-101" },
  { id: "LT-201", type: "instrument", x: 480, y: 180, label: "LT-201" },
  { id: "TT-301", type: "instrument", x: 660, y: 120, label: "TT-301" },
];

export const graphEdges = [
  { from: "T-501", to: "P-101A", line: "L-2014" },
  { from: "T-501", to: "P-101B", line: "L-5001" },
  { from: "P-101A", to: "V-201", line: "L-2015" },
  { from: "P-101B", to: "V-201", line: "L-2015" },
  { from: "V-201", to: "E-301", line: "L-2101" },
  { from: "E-301", to: "C-401", line: "L-3001" },
  { from: "C-401", to: "K-601", line: "L-4001" },
  { from: "PT-101", to: "P-101A", line: "signal" },
  { from: "LT-201", to: "V-201", line: "signal" },
  { from: "TT-301", to: "E-301", line: "signal" },
];

export const tools = [
  { id: "inventory", name: "Inventory Generator", desc: "Auto-extract equipment, valves, instruments, lines", icon: "Boxes", route: "/inventory" },
  { id: "search", name: "Smart Search", desc: "Find any tag across all sheets instantly", icon: "Search", route: "/search" },
  { id: "smart-map", name: "Smart Map", desc: "Interactive process network and line tracing", icon: "Network", route: "/smart-map" },
  { id: "hazop", name: "AI HAZOP Assistant", desc: "Guided deviation analysis with recommendations", icon: "ShieldAlert", route: "/hazop" },
  { id: "color", name: "Color-Coded Status", desc: "Visualize pipe sizes and equipment states", icon: "Palette", route: "/settings" },
  { id: "inspector", name: "AI Inspector", desc: "Detect spec mismatches and missing safety items", icon: "ScanSearch", route: "/inspector" },
  { id: "equipment", name: "Equipment Database", desc: "Browse and search the equipment registry", icon: "Database", route: "/equipment" },
  { id: "rules", name: "Pipeline Color Rules", desc: "Define diameter-to-color mappings", icon: "SlidersHorizontal", route: "/settings" },
  { id: "export", name: "Export Center", desc: "Generate annotated PDFs and Excel reports", icon: "Download", route: "/exports" },
];
