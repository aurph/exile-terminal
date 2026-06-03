import { cn } from "@/lib/cn";

/**
 * Diverging horizontal bar chart of the biggest market swings. Gainers extend
 * right (verdigris), losers extend left (blood), from a shared center axis.
 */
export function MoversBars({
  items,
}: {
  items: { name: string; icon?: string; change: number }[];
}) {
  const max = Math.max(...items.map((i) => Math.abs(i.change)), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it) => {
        const pos = it.change >= 0;
        const w = (Math.abs(it.change) / max) * 50;
        return (
          <div key={it.name} className="flex items-center gap-2.5">
            <span className="flex w-[44%] min-w-0 items-center justify-end gap-2">
              <span className="t-currency truncate text-[12px]">{it.name}</span>
              {it.icon && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={it.icon} alt="" className="h-4 w-4 shrink-0 object-contain" loading="lazy" />
              )}
            </span>
            <div className="relative h-3.5 flex-1">
              <span className="absolute left-1/2 top-0 h-full w-px bg-gold-700/35" />
              <span
                className={cn(
                  "absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[2px]",
                  pos
                    ? "left-1/2 bg-gradient-to-r from-verdigris-500/60 to-verdigris-400"
                    : "right-1/2 bg-gradient-to-l from-blood-600/60 to-blood-400"
                )}
                style={{ width: `${w}%` }}
              />
            </div>
            <span
              className={cn(
                "mono w-12 shrink-0 text-right text-[11px]",
                pos ? "text-verdigris-300" : "text-blood-400"
              )}
            >
              {pos ? "+" : ""}
              {it.change.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
