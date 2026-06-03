import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CAMPAIGN, TOTAL_MILESTONES } from "@/lib/campaign";
import { cn } from "@/lib/cn";

/** Compact act-by-act campaign timeline for the overview. Display only; the
 * interactive checklist lives on /story. */
export function CampaignSpine({ checked }: { checked: string[] }) {
  const set = new Set(checked);
  const done = checked.length;
  const pct = Math.round((done / TOTAL_MILESTONES) * 100);
  const currentId = CAMPAIGN.find((a) => !a.milestones.every((m) => set.has(m.id)))?.id;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between gap-3">
        <div className="foil font-display text-2xl leading-none">{pct}%</div>
        <span className="mono text-[10.5px] text-bone-500">
          {done} / {TOTAL_MILESTONES} steps
        </span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-700/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="relative mt-4 flex flex-1 flex-col justify-between">
        <span className="absolute bottom-3 left-[6px] top-3 w-px bg-gold-700/25" />
        {CAMPAIGN.map((act) => {
          const d = act.milestones.filter((m) => set.has(m.id)).length;
          const total = act.milestones.length;
          const complete = d === total;
          const current = act.id === currentId;
          return (
            <li key={act.id} className="relative flex items-center gap-3 py-1">
              <span
                className={cn(
                  "relative z-10 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                  complete
                    ? "border-gold-400 bg-gold-400"
                    : "border-gold-700/45 bg-ink-900"
                )}
              >
                {complete && <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />}
                {current && !complete && <span className="ember h-2 w-2 rounded-full bg-gold-300" />}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12.5px]",
                  complete ? "text-bone-400" : current ? "text-bone-100" : "text-bone-500"
                )}
              >
                {act.name}
                <span className="mono ml-1.5 text-[10px] text-bone-600">{act.subtitle}</span>
              </span>
              {current && (
                <span className="mono shrink-0 text-[9px] uppercase tracking-[0.16em] text-gold-300">now</span>
              )}
              <span className="mono shrink-0 text-[10.5px] text-bone-500">
                {d}/{total}
              </span>
            </li>
          );
        })}
      </ol>

      <Link
        href="/story"
        className="mono mt-4 inline-flex items-center gap-1.5 self-start rounded-[5px] border border-gold-600/35 bg-gold-500/10 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-gold-200 transition-colors hover:bg-gold-500/20"
      >
        Open the route
        <ArrowUpRight size={13} strokeWidth={2} />
      </Link>
    </div>
  );
}
