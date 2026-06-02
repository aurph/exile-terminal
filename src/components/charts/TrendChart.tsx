import { cn } from "@/lib/cn";

/**
 * Bespoke SVG area chart. No charting library: full control of the aesthetic,
 * zero render-time JS, no React 19 peer-dep risk. Draws a smooth-ish polyline
 * area with a gold gradient and a glowing end node.
 */
export function TrendChart({
  points,
  className,
  height = 120,
}: {
  points: number[];
  className?: string;
  height?: number;
}) {
  const W = 100;
  const H = 36;
  const pad = 2;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (v - min) / span) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(2)},${H} L${coords[0][0].toFixed(2)},${H} Z`;
  const [ex, ey] = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label="trend"
    >
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af63" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#d4af63" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9d7833" />
          <stop offset="60%" stopColor="#e6c987" />
          <stop offset="100%" stopColor="#f1dca6" />
        </linearGradient>
      </defs>

      {/* faint baseline rules */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={W - pad} y1={pad + f * (H - pad * 2)} y2={pad + f * (H - pad * 2)} stroke="#c2974a" strokeOpacity="0.08" strokeWidth="0.25" />
      ))}

      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="url(#trendLine)" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={ex} cy={ey} r="1.4" fill="#f4ecda" />
      <circle cx={ex} cy={ey} r="2.6" fill="none" stroke="#e6c987" strokeOpacity="0.5" strokeWidth="0.5" />
    </svg>
  );
}
