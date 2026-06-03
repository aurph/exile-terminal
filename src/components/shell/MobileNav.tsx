"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserRound } from "lucide-react";
import { clsx } from "clsx";
import { NAV } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileNav({ account }: { account: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gold-700/20 bg-obsidian/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" onClick={close} className="flex items-center gap-2.5">
          <Mark />
          <span className="foil font-display text-[13px] font-700 tracking-[0.12em]">EXILE TERMINAL</span>
        </Link>
        <button
          type="button"
          aria-label="menu"
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-[5px] border border-gold-700/30 text-bone-300"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-obsidian/96 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={clsx(
                    "flex items-center gap-3 rounded-[6px] px-4 py-3 transition-colors",
                    active ? "bg-gold-500/12 text-bone-100" : "text-bone-300 hover:bg-ink-700/40"
                  )}
                >
                  <Icon size={18} strokeWidth={1.75} className={active ? "text-gold-300" : "text-bone-500"} />
                  <span className="text-[14px] font-medium">{item.label}</span>
                </Link>
              );
            })}

            <div className="my-3 rule" />

            <Link
              href="/account"
              onClick={close}
              className="flex items-center gap-3 rounded-[6px] border border-gold-700/25 bg-ink-900/50 px-4 py-3 text-bone-200"
            >
              <UserRound size={18} strokeWidth={1.75} className="text-gold-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{account ? account : "Connect account"}</span>
                <span className="mono block text-[11px] text-bone-500">{account ? "switch or sign out" : "point the terminal"}</span>
              </span>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1.5 L21 7 V17 L12 22.5 L3 17 V7 Z" stroke="url(#mg)" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.4" stroke="url(#mg)" strokeWidth="1" />
      <defs>
        <linearGradient id="mg" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1dca6" />
          <stop offset="0.6" stopColor="#c2974a" />
          <stop offset="1" stopColor="#7c2018" />
        </linearGradient>
      </defs>
    </svg>
  );
}
