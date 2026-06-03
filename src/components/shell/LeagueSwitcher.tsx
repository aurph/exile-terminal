"use client";

import { setLeague } from "@/app/actions";

export function LeagueSwitcher({
  current,
  leagues,
}: {
  current: string;
  leagues: { value: string; shortName: string; isCurrent: boolean }[];
}) {
  if (leagues.length === 0) return null;
  return (
    <form action={setLeague} className="hidden items-center gap-2 sm:flex">
      <span className="ember h-1.5 w-1.5 rounded-full bg-verdigris-400" />
      <span className="eyebrow text-bone-500">League</span>
      <select
        name="league"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="mono rounded-[4px] border border-gold-700/30 bg-ink-900/60 px-2 py-1 text-[11px] text-gold-300 focus:border-gold-500/50 focus:outline-none"
      >
        {leagues.map((l) => (
          <option key={l.value} value={l.value} className="bg-ink-900 text-bone-200">
            {l.value}
            {l.isCurrent ? " (current)" : ""}
          </option>
        ))}
      </select>
    </form>
  );
}
