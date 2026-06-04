import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Move, Search, Highlighter, Layers, ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export function PdfViewer({ pointerMode = false, highlightTag }: { pointerMode?: boolean; highlightTag?: string }) {
  const [zoom, setZoom] = useState(100);
  const [highlight, setHighlight] = useState(true);
  const [layers, setLayers] = useState(true);
  const [pan, setPan] = useState(false);
  const [page, setPage] = useState(3);

  return (
    <div className="flex h-full flex-col panel-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-panel/60 px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs">
            <span>{page}</span><span className="text-muted-foreground">/ 24</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(Math.min(24, page + 1))}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, zoom - 25))}><ZoomOut className="h-3.5 w-3.5" /></Button>
        <span className="w-12 text-center font-mono text-xs text-muted-foreground">{zoom}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(400, zoom + 25))}><ZoomIn className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(100)}><Maximize2 className="h-3.5 w-3.5" /></Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Toggle pressed={pan} onPressedChange={setPan} size="sm" className="h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"><Move className="h-3.5 w-3.5" /></Toggle>
        <Toggle pressed={highlight} onPressedChange={setHighlight} size="sm" className="h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"><Highlighter className="h-3.5 w-3.5" /></Toggle>
        <Toggle pressed={layers} onPressedChange={setLayers} size="sm" className="h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"><Layers className="h-3.5 w-3.5" /></Toggle>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tags…" className="h-7 w-44 pl-7 font-mono text-xs" />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden bg-background grid-bg">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative aspect-[4/3] w-full max-w-5xl rounded-md border border-border bg-[oklch(0.97_0.005_250)] shadow-2xl"
               style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}>
            {/* Mock P&ID drawing */}
            <svg viewBox="0 0 800 600" className="h-full w-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dbe1e8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#grid)" />
              {/* Title block */}
              <rect x="560" y="510" width="220" height="70" fill="white" stroke="#1e293b" strokeWidth="1.2" />
              <text x="570" y="528" fontSize="9" fill="#1e293b" fontFamily="monospace">P&amp;ID — LNG TRAIN 4</text>
              <text x="570" y="542" fontSize="8" fill="#475569" fontFamily="monospace">SHEET 3 OF 24</text>
              <text x="570" y="556" fontSize="8" fill="#475569" fontFamily="monospace">REV: B  |  2024-09</text>
              <text x="570" y="570" fontSize="8" fill="#475569" fontFamily="monospace">SCALE: NTS</text>

              {/* Tank */}
              <rect x="60" y="240" width="80" height="140" fill="white" stroke="#1e293b" strokeWidth="2" />
              <text x="100" y="315" fontSize="10" fill="#1e293b" fontFamily="monospace" textAnchor="middle">T-501</text>

              {/* Lines */}
              <line x1="140" y1="310" x2="240" y2="310" stroke="#1e293b" strokeWidth="2" />
              <text x="180" y="302" fontSize="8" fill="#3b82f6" fontFamily="monospace">L-2014 6"</text>

              {/* Pump P-101A */}
              <circle cx="270" cy="310" r="30" fill="white" stroke="#1e293b" strokeWidth="2" />
              <polygon points="252,310 282,295 282,325" fill="#1e293b" />
              <text x="270" y="360" fontSize="10" fill="#1e293b" fontFamily="monospace" textAnchor="middle">P-101A</text>

              <line x1="300" y1="310" x2="420" y2="310" stroke="#1e293b" strokeWidth="2" />
              <text x="350" y="302" fontSize="8" fill="#3b82f6" fontFamily="monospace">L-2015 6"</text>

              {/* PSV */}
              <polygon points="350,260 360,280 340,280" fill="white" stroke="#dc2626" strokeWidth="1.5" />
              <text x="350" y="252" fontSize="8" fill="#dc2626" fontFamily="monospace" textAnchor="middle">PSV-114</text>
              <line x1="350" y1="280" x2="350" y2="310" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,2" />

              {/* Vessel V-201 */}
              <rect x="420" y="220" width="100" height="180" rx="10" fill="white" stroke="#1e293b" strokeWidth="2" />
              <text x="470" y="315" fontSize="11" fill="#1e293b" fontFamily="monospace" textAnchor="middle">V-201</text>

              {/* Instrument PT-101 */}
              <circle cx="270" cy="220" r="16" fill="white" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="254" y1="220" x2="286" y2="220" stroke="#1e293b" strokeWidth="1" />
              <text x="270" y="217" fontSize="7" fill="#1e293b" fontFamily="monospace" textAnchor="middle">PT</text>
              <text x="270" y="227" fontSize="7" fill="#1e293b" fontFamily="monospace" textAnchor="middle">101</text>
              <line x1="270" y1="236" x2="270" y2="280" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Pump P-101B */}
              <circle cx="270" cy="450" r="30" fill="white" stroke="#1e293b" strokeWidth="2" />
              <polygon points="252,450 282,435 282,465" fill="#1e293b" />
              <text x="270" y="500" fontSize="10" fill="#1e293b" fontFamily="monospace" textAnchor="middle">P-101B</text>
              <line x1="140" y1="350" x2="240" y2="450" stroke="#1e293b" strokeWidth="2" />
              <line x1="300" y1="450" x2="420" y2="380" stroke="#1e293b" strokeWidth="2" />

              {/* Exchanger */}
              <rect x="600" y="270" width="140" height="60" fill="white" stroke="#1e293b" strokeWidth="2" />
              <line x1="600" y1="285" x2="740" y2="285" stroke="#1e293b" strokeWidth="1" />
              <line x1="600" y1="315" x2="740" y2="315" stroke="#1e293b" strokeWidth="1" />
              <text x="670" y="350" fontSize="10" fill="#1e293b" fontFamily="monospace" textAnchor="middle">E-301</text>
              <line x1="520" y1="300" x2="600" y2="300" stroke="#1e293b" strokeWidth="2" />
              <text x="555" y="292" fontSize="8" fill="#3b82f6" fontFamily="monospace">L-2101</text>

              {/* Highlight overlay */}
              {highlight && highlightTag && (
                <rect x="240" y="280" width="60" height="60" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" rx="4">
                  <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </rect>
              )}
            </svg>

            {/* Pointer mode marker */}
            {pointerMode && (
              <div className="absolute" style={{ left: "33%", top: "52%" }}>
                <div className="relative">
                  <div className="absolute -inset-6 rounded-full border-2 border-destructive animate-ping" />
                  <div className="h-4 w-4 rounded-full border-2 border-destructive bg-destructive/30" />
                  <Crosshair className="absolute -top-1 -left-1 h-6 w-6 text-destructive" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-border bg-panel/80 px-3 py-1 text-[10px] font-mono text-muted-foreground backdrop-blur">
          <span>X: 482 Y: 316</span>
          <span className={cn("flex items-center gap-1.5", pointerMode && "text-destructive")}>
            {pointerMode && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />}
            {pointerMode ? "POINTER MODE" : "VIEW MODE"}
          </span>
          <span>SHEET 3 / 24 · NTS</span>
        </div>
      </div>
    </div>
  );
}
