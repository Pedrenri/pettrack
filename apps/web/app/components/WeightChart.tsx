"use client";

import { useState } from "react";

interface Entry {
  measured_at: string;
  weight: number;
}

const W = 520;
const H = 200;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const GRAD_ID = "wc-grad";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

// Smooth catmull-rom to bezier
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function WeightChart({ entries }: { entries: Entry[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; e: Entry } | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-gray-400">
        No data yet
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  const ws = sorted.map((e) => e.weight);
  const lo = Math.min(...ws);
  const hi = Math.max(...ws);
  const rng = hi - lo || 1;

  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const xOf = (i: number) => PAD.left + (sorted.length === 1 ? iW / 2 : (i / (sorted.length - 1)) * iW);
  const yOf = (w: number) => PAD.top + iH - ((w - lo) / rng) * iH;

  const pts = sorted.map((e, i) => ({ x: xOf(i), y: yOf(e.weight), e }));
  const line = smoothPath(pts.map((p) => ({ x: p.x, y: p.y })));
  const area = `${line} L${pts[pts.length - 1].x},${PAD.top + iH} L${pts[0].x},${PAD.top + iH}Z`;

  const ticks = Array.from({ length: 4 }, (_, i) => {
    const v = lo + (rng / 3) * i;
    return { v: Math.round(v), y: yOf(v) };
  });

  const maxX = 5;
  const xStep = Math.max(1, Math.ceil(sorted.length / maxX));
  const xLabels = sorted
    .map((e, i) => ({ label: fmtDate(e.measured_at), x: xOf(i), show: i % xStep === 0 || i === sorted.length - 1 }))
    .filter((l) => l.show);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260, maxHeight: 200 }} onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {ticks.map((t, i) => (
          <line key={i} x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="var(--chart-grid)" strokeWidth={1} />
        ))}

        {/* Y labels */}
        {ticks.map((t, i) => (
          <text key={i} x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="var(--chart-label)" fontFamily="system-ui">
            {t.v}g
          </text>
        ))}

        {/* X labels */}
        {xLabels.map((l) => (
          <text key={l.x} x={l.x} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--chart-label)" fontFamily="system-ui">
            {l.label}
          </text>
        ))}

        {/* Area */}
        <path d={area} fill={`url(#${GRAD_ID})`} />

        {/* Line */}
        <path d={line} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setTip({ x: p.x, y: p.y, e: p.e })}>
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            <circle
              cx={p.x} cy={p.y} r={tip?.e === p.e ? 5 : 3.5}
              fill={tip?.e === p.e ? "#059669" : "#10b981"}
              stroke="white" strokeWidth={2}
              style={{ transition: "r 0.15s" }}
            />
          </g>
        ))}

        {/* Tooltip */}
        {tip && (() => {
          const bx = Math.min(Math.max(tip.x - 36, PAD.left), W - PAD.right - 72);
          const by = Math.max(tip.y - 48, PAD.top);
          return (
            <g>
              <rect x={bx} y={by} width={72} height={34} rx={8} fill="#111827" />
              <text x={bx + 36} y={by + 13} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">
                {fmtDate(tip.e.measured_at)}
              </text>
              <text x={bx + 36} y={by + 26} textAnchor="middle" fontSize={11} fontWeight="600" fill="#34d399" fontFamily="system-ui">
                {tip.e.weight}g
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
