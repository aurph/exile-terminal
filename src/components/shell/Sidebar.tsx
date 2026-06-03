"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Settings } from "lucide-react";
import { NAV } from "@/lib/nav";
import { ExaltedOrb } from "@/components/brand/ExaltedOrb";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({
  account,
  character,
  aiEnabled,
}: {
  account: string | null;
  character: string | null;
  aiEnabled: boolean;
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.ai || aiEnabled);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-gold-700/20 bg-ink-950/70 backdrop-blur-md lg:flex">
      {/* brand */}
      <Link href="/" className="group flex items-center gap-3 px-6 pb-5 pt-6">
        <span className="grid h-9 w-9 shrink-0 place-items-center transition-transform group-hover:scale-105">
          <ExaltedOrb size={34} />
        </span>
        <div className="leading-none">
          <div className="foil font-display text-[15px] font-700 tracking-[0.14em]">
            EXILE TERMINAL
          </div>
          <div className="eyebrow mt-1.5 text-bone-500">Wraeclast Ledger</div>
        </div>
      </Link>

      <div className="mx-6 rule" />

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-[5px] px-3 py-2.5 transition-colors",
                    active
                      ? "bg-gold-500/10 text-bone-100"
                      : "text-bone-400 hover:bg-ink-700/40 hover:text-bone-200"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r bg-gold-400 transition-all",
                      active ? "w-[3px] opacity-100" : "w-0 opacity-0"
                    )}
                  />
                  <Icon
                    size={17}
                    strokeWidth={1.75}
                    className={clsx(
                      "shrink-0 transition-colors",
                      active ? "text-gold-300" : "text-bone-500 group-hover:text-gold-400"
                    )}
                  />
                  <span className="flex-1">
                    <span className="block text-[13.5px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* account chip */}
      <div className="px-3 pb-5">
        <div className="mx-3 mb-3 rule" />
        <Link
          href="/account"
          className="panel panel-hover flex items-center gap-3 rounded-[5px] px-3 py-3"
        >
          <div className="sigil-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-600/30">
            <span className="font-display text-[13px] text-gold-300">
              {(account ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            {account ? (
              <>
                <div className="truncate font-display text-[13px] text-bone-100">
                  {character || account}
                </div>
                <div className="mono mt-0.5 truncate text-[10.5px] text-bone-500">{account}</div>
              </>
            ) : (
              <>
                <div className="font-display text-[13px] text-bone-200">Connect account</div>
                <div className="mono mt-0.5 text-[10.5px] text-bone-500">point the terminal</div>
              </>
            )}
          </div>
          <Settings size={14} strokeWidth={1.75} className="shrink-0 text-bone-600" />
        </Link>
        <a
          href="https://github.com/aurph"
          target="_blank"
          rel="noreferrer"
          className="mono mt-3 block px-1 text-center text-[10px] text-bone-600 transition-colors hover:text-gold-400"
        >
          Built by Jack Schwartz (aurph)
        </a>
      </div>
    </aside>
  );
}
