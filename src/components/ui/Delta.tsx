import { cn } from "@/lib/cn";

export function Delta({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1 text-[11px] leading-none",
        up ? "text-verdigris-300" : "text-blood-400",
        className
      )}
    >
      <span aria-hidden className="text-[8px]">{up ? "▲" : "▼"}</span>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
