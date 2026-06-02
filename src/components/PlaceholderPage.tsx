import type { LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { PageHeader } from "@/components/ui/PageHeader";

export function PlaceholderPage({
  icon: Icon,
  eyebrow,
  title,
  sub,
  lead,
  points,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  sub?: string;
  lead: string;
  points: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="reveal">
      <PageHeader eyebrow={eyebrow} title={title} sub={sub} />

      <Panel className="relative overflow-hidden p-8 sm:p-10">
        {/* watermark sigil */}
        <div
          aria-hidden
          className="sigil-ring pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40"
        />
        <div className="relative max-w-2xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[6px] border border-gold-600/30 bg-ink-800/60">
            <Icon size={22} strokeWidth={1.5} className="text-gold-300" />
          </div>

          <p className="text-[15px] leading-relaxed text-bone-300">{lead}</p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[13.5px] text-bone-400">
                <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-gold-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {children}

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold-700/30 bg-ink-900/60 px-3 py-1.5">
            <span className="ember h-1.5 w-1.5 rounded-full bg-gold-400" />
            <span className="eyebrow text-bone-400">Forging · ships next pass</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
