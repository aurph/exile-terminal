"use client";

import { useState } from "react";
import { TrendChart } from "@/components/charts/TrendChart";
import { Delta } from "@/components/ui/Delta";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Unique } from "@/lib/poe2scout";
import {
  TRACKER_COOKIE,
  decodeTracker,
  encodeTracker,
  withStatus,
  type TrackStatus,
} from "@/lib/save";
import { readCookie, writeCookie } from "@/lib/save-client";

const STATUSES: { key: TrackStatus; label: string }[] = [
  { key: "have", label: "Have" },
  { key: "want", label: "Want" },
  { key: "chasing", label: "Chase" },
];

function ringFor(s: TrackStatus | null): string {
  if (s === "have") return "ring-1 ring-verdigris-500/40";
  if (s === "want") return "ring-1 ring-[#8f8fef]/40";
  if (s === "chasing") return "ring-1 ring-gold-500/50";
  return "";
}

function activeFor(k: TrackStatus): string {
  if (k === "have") return "border-verdigris-500/60 bg-verdigris-500/15 text-verdigris-300";
  if (k === "want") return "border-[#8f8fef]/60 bg-[#8f8fef]/15 text-[#b9b9f5]";
  return "border-gold-500/60 bg-gold-500/15 text-gold-200";
}

export function UniqueCard({
  unique,
  initialStatus,
}: {
  unique: Unique;
  initialStatus: TrackStatus | null;
}) {
  const [status, setStatus] = useState<TrackStatus | null>(initialStatus);

  /** Tracker lives in a cookie the browser owns: read, update, write. */
  function toggle(s: TrackStatus) {
    const next = status === s ? null : s;
    const entries = decodeTracker(readCookie(TRACKER_COOKIE));
    writeCookie(TRACKER_COOKIE, encodeTracker(withStatus(entries, unique.itemId, next)));
    setStatus(next);
  }

  return (
    <div className={cn("panel panel-hover flex flex-col p-4", ringFor(status))}>
      <div className="flex gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-gold-700/25 bg-ink-950/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={unique.icon} alt="" className="max-h-12 max-w-12 object-contain" loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="t-unique font-display text-[14px] leading-tight">{unique.name}</div>
          <div className="mono mt-0.5 truncate text-[11px] text-bone-500">
            {unique.base}
            {unique.itemLevel ? ` · ilvl ${unique.itemLevel}` : ""}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="mono text-[13px] text-bone-100">{formatPrice(unique.price)}</span>
            {unique.change != null && <Delta value={unique.change} />}
          </div>
        </div>
        <div className="w-16 shrink-0">
          <TrendChart points={unique.history} height={30} />
        </div>
      </div>

      {unique.mods.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {unique.mods.slice(0, 4).map((m, i) => (
            <li key={i} className="text-[12px] leading-snug text-[#9fb0d9]">
              {m}
            </li>
          ))}
          {unique.mods.length > 4 && (
            <li className="mono text-[10px] text-bone-600">+{unique.mods.length - 4} more</li>
          )}
        </ul>
      )}

      {unique.flavor && (
        <p className="mt-2 line-clamp-2 text-[11.5px] italic leading-snug text-bone-600">
          {unique.flavor}
        </p>
      )}

      <div className="mt-auto flex gap-1.5 border-t border-gold-700/15 pt-3">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            className={cn(
              "mono flex-1 rounded-[4px] border px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors",
              status === s.key
                ? activeFor(s.key)
                : "border-gold-700/20 text-bone-500 hover:border-gold-600/40 hover:text-bone-300"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
