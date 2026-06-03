"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { NAV } from "@/lib/nav";
import { ExaltedOrb } from "@/components/brand/ExaltedOrb";
import { LeagueSwitcher } from "./LeagueSwitcher";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav({
  account,
  character,
  aiEnabled,
  league,
  leagues,
}: {
  account: string | null;
  character: string | null;
  aiEnabled: boolean;
  league: string;
  leagues: { value: string; shortName: string; isCurrent: boolean }[];
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.ai || aiEnabled);

  return (
    <header className="sticky top-0 z-30 hidden border-b border-gold-700/25 bg-obsidian/85 backdrop-blur-xl lg:block">
      {/* tier 1 — brand + status strip */}
      <div className="border-b border-gold-700/10">
        <div className="mx-auto flex h-12 w-full max-w-[1520px] items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="transition-transform group-hover:scale-105">
              <ExaltedOrb size={26} />
            </span>
            <span className="foil font-display text-[14px] font-700 tracking-[0.18em]">EXILE TERMINAL</span>
            <span className="mono hidden text-[9px] uppercase tracking-[0.2em] text-bone-700 xl:block">
              // Wraeclast Ledger
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <LeagueSwitcher current={league} leagues={leagues} />
            <span className="hidden items-center gap-1.5 md:flex">
              <span className="ember h-1.5 w-1.5 rounded-full bg-verdigris-400" />
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-bone-500">Live</span>
            </span>
            <Link
              href="/account"
              className="group flex items-center gap-2 rounded-[5px] border border-gold-700/25 bg-ink-900/50 px-2.5 py-1.5 transition-colors hover:border-gold-600/45"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-gold-600/30 font-display text-[10px] text-gold-300">
                {(account ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="mono max-w-[120px] truncate text-[11px] text-bone-300 group-hover:text-bone-100">
                {character || account || "Connect"}
              </span>
              <Settings size={12} strokeWidth={1.75} className="text-bone-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* tier 2 — nav tabs */}
      <div className="bg-ink-950/40">
        <nav className="mx-auto flex h-11 w-full max-w-[1520px] items-center px-4 sm:px-7">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-11 items-center gap-2 px-3.5 transition-colors",
                  active ? "text-gold-200" : "text-bone-500 hover:text-bone-200"
                )}
              >
                <Icon
                  size={14}
                  strokeWidth={1.75}
                  className={cn("shrink-0", active ? "text-gold-300" : "text-bone-600 group-hover:text-gold-500")}
                />
                <span className="mono text-[11px] uppercase tracking-[0.14em]">{item.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-2.5 bottom-0 h-[2px] rounded-t bg-gradient-to-r from-gold-600 to-gold-300 transition-all",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
          <span className="mono ml-auto hidden text-[10px] uppercase tracking-[0.18em] text-bone-700 xl:block">
            Patch 0.5 · Return of the Ancients
          </span>
        </nav>
      </div>
    </header>
  );
}
