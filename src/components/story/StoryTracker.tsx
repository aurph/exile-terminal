"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { CAMPAIGN, TOTAL_MILESTONES, type MilestoneTag } from "@/lib/campaign";
import { PROGRESS_COOKIE, encodeProgress } from "@/lib/save";
import { writeCookie } from "@/lib/save-client";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

const TAG_DOT: Record<MilestoneTag, string> = {
  ascend: "bg-gold-300",
  boss: "bg-blood-400",
  skill: "bg-verdigris-400",
  resist: "bg-[#e6c987]",
  pickup: "bg-[#1ba29b]",
  system: "bg-bone-600",
  maps: "bg-gold-400",
};

export function StoryTracker({ initialChecked }: { initialChecked: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked));

  /** The cookie is the save file: write it directly, no round-trip. */
  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeCookie(PROGRESS_COOKIE, encodeProgress(next));
    setChecked(next);
  }

  /** New league, new run. */
  function reset() {
    if (!window.confirm("Reset the whole run? Every milestone goes back to unchecked.")) return;
    writeCookie(PROGRESS_COOKIE, "");
    setChecked(new Set());
  }

  const doneTotal = CAMPAIGN.reduce(
    (n, a) => n + a.milestones.filter((m) => checked.has(m.id)).length,
    0
  );
  const pct = Math.round((doneTotal / TOTAL_MILESTONES) * 100);
  const current = CAMPAIGN.find((a) => !a.milestones.every((m) => checked.has(m.id)));

  return (
    <>
      <Panel className="reveal mb-4 p-5" style={{ animationDelay: "20ms" }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow text-bone-500">Run Progress</div>
            <div className="foil font-display text-3xl leading-none">{pct}%</div>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-right">
              <div className="mono text-[13px] text-bone-200">
                {doneTotal} / {TOTAL_MILESTONES}
              </div>
              <div className="mono text-[10.5px] text-bone-500">
                {current ? `at ${current.name}` : "Endgame reached"}
              </div>
            </div>
            {doneTotal > 0 && (
              <button
                type="button"
                onClick={reset}
                title="Reset the run (new league)"
                className="mono inline-flex items-center gap-1.5 rounded-[5px] border border-gold-700/30 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-bone-500 transition-colors hover:border-blood-600/40 hover:text-blood-400"
              >
                <RotateCcw size={12} />
                Reset run
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        {CAMPAIGN.map((act, i) => {
          const done = act.milestones.filter((m) => checked.has(m.id)).length;
          const actPct = (done / act.milestones.length) * 100;
          const complete = done === act.milestones.length;
          return (
            <Panel key={act.id} className="reveal p-6" style={{ animationDelay: `${80 + i * 70}ms` }}>
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors",
                    complete ? "border-gold-500/60 bg-gold-500/15" : "border-gold-700/40 bg-ink-900/60"
                  )}
                >
                  <span className="font-display text-[14px] text-gold-300">{act.badge}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-[16px] leading-none text-bone-100">{act.name}</h3>
                      <div className="mono mt-1 truncate text-[11px] text-bone-500">
                        {act.subtitle} · Lvl {act.levels}
                      </div>
                    </div>
                    <span className="mono shrink-0 text-[11px] text-gold-300">
                      {done}/{act.milestones.length}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {act.rewards.map((r) => (
                      <span
                        key={r}
                        className="mono rounded border border-gold-700/25 bg-ink-900/50 px-1.5 py-0.5 text-[9.5px] text-bone-400"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-700/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-all"
                      style={{ width: `${actPct}%` }}
                    />
                  </div>

                  <ul className="mt-3 flex flex-col gap-0.5">
                    {act.milestones.map((m) => {
                      const isDone = checked.has(m.id);
                      return (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => toggle(m.id)}
                            className="group flex w-full items-center gap-3 rounded-[5px] px-2 py-2 text-left transition-colors hover:bg-gold-500/[0.05]"
                          >
                            <span
                              className={cn(
                                "grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border transition-colors",
                                isDone ? "border-gold-500 bg-gold-500/20" : "border-gold-700/40 group-hover:border-gold-600/60"
                              )}
                            >
                              {isDone && <Check size={11} strokeWidth={3} className="text-gold-200" />}
                            </span>
                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TAG_DOT[m.tag])} />
                            <span
                              className={cn(
                                "flex-1 text-[13px] transition-colors",
                                isDone ? "text-bone-600 line-through" : "text-bone-200"
                              )}
                            >
                              {m.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
