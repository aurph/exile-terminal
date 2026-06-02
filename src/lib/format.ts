/** Compact price formatting for Exalted-denominated values. */
export function formatPrice(n: number | null | undefined, unit = "ex"): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  let s: string;
  if (abs >= 100000) s = `${Math.round(n / 1000)}k`;
  else if (abs >= 10000) s = `${(n / 1000).toFixed(1)}k`;
  else if (abs >= 1000) s = `${(n / 1000).toFixed(2)}k`;
  else if (abs >= 100) s = n.toFixed(0);
  else if (abs >= 10) s = n.toFixed(1);
  else s = n.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

/** Percent change across a price-history series. */
export function pctChange(history: number[]): number | null {
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  if (!first) return null;
  return ((last - first) / first) * 100;
}

export function timeAgo(epochMs: number): string {
  const s = Math.max(0, Math.round((Date.now() - epochMs) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
