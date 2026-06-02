"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { PROFILE } from "@/lib/config";

export function Topbar() {
  const router = useRouter();
  const [ask, setAsk] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = ask.trim();
    router.push(q ? `/codex?ask=${encodeURIComponent(q)}` : "/codex");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gold-700/20 bg-obsidian/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1520px] items-center gap-4 px-5 sm:px-8">
        {/* league badge */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris-400 ember" />
          <span className="eyebrow text-bone-400">
            League <span className="text-gold-400">{PROFILE.league}</span>
          </span>
          <span className="mono rounded border border-gold-700/30 px-1.5 py-0.5 text-[10px] text-gold-300">
            patch {PROFILE.patch}
          </span>
        </div>

        {/* ask the oracle */}
        <form onSubmit={submit} className="ml-auto flex w-full max-w-md items-center">
          <div className="group flex w-full items-center gap-2.5 rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-2 transition-colors focus-within:border-gold-500/50">
            <Search size={15} strokeWidth={1.75} className="text-bone-500 group-focus-within:text-gold-400" />
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask the Oracle  ·  what changed in 0.5?"
              className="mono w-full bg-transparent text-[12.5px] text-bone-100 placeholder:text-bone-600 focus:outline-none"
            />
            <kbd className="mono hidden rounded border border-gold-700/30 px-1.5 py-0.5 text-[10px] text-bone-500 sm:block">
              ↵
            </kbd>
          </div>
        </form>

        {/* sync */}
        <button
          type="button"
          className="hidden items-center gap-2 text-bone-500 transition-colors hover:text-gold-300 md:flex"
          title="data sync status"
        >
          <RefreshCw size={14} strokeWidth={1.75} />
          <span className="mono text-[10.5px] leading-none">
            synced<br />
            <span className="text-bone-400">awaiting live feed</span>
          </span>
        </button>
      </div>
    </header>
  );
}
