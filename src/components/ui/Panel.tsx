import { cn } from "@/lib/cn";

export function Panel({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("panel panel-hover", className)} style={style}>
      {children}
    </div>
  );
}

export function PanelHead({
  eyebrow,
  title,
  note,
  action,
}: {
  eyebrow?: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h3 className="font-display text-[15px] leading-none text-bone-100">{title}</h3>
      </div>
      {(note || action) && (
        <div className="flex shrink-0 items-center gap-3">
          {note && <span className="mono text-[10px] text-bone-600">{note}</span>}
          {action}
        </div>
      )}
    </div>
  );
}
