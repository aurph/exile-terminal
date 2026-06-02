"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NAV } from "@/lib/nav";
import { PROFILE } from "@/lib/config";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-gold-700/20 bg-ink-950/70 backdrop-blur-md lg:flex">
      {/* brand */}
      <Link href="/" className="group flex items-center gap-3 px-6 pb-5 pt-6">
        <Sigil />
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
          {NAV.map((item) => {
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

      {/* character chip */}
      <div className="px-3 pb-5">
        <div className="mx-3 mb-3 rule" />
        <div className="panel panel-hover flex items-center gap-3 rounded-[5px] px-3 py-3">
          <div className="sigil-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-600/30">
            <span className="font-display text-[13px] text-gold-300">A</span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate font-display text-[13px] text-bone-100">
              {PROFILE.character}
            </div>
            <div className="mono mt-0.5 text-[10.5px] text-bone-500">
              not linked · {PROFILE.account}
            </div>
          </div>
          <span
            className="ember h-1.5 w-1.5 shrink-0 rounded-full bg-blood-400"
            title="character not yet linked"
          />
        </div>
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

function Sigil() {
  return (
    <span className="relative grid h-9 w-9 place-items-center">
      <span className="sigil-ring absolute inset-0 rounded-full" />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 1.5 L21 7 V17 L12 22.5 L3 17 V7 Z"
          stroke="url(#g)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path d="M12 5.5 L12 18.5 M6.5 8.5 L17.5 15.5 M17.5 8.5 L6.5 15.5" stroke="url(#g)" strokeWidth="0.8" opacity="0.65" />
        <circle cx="12" cy="12" r="2.4" stroke="url(#g)" strokeWidth="1" />
        <defs>
          <linearGradient id="g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f1dca6" />
            <stop offset="0.6" stopColor="#c2974a" />
            <stop offset="1" stopColor="#7c2018" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
