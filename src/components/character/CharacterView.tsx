"use client";

import { useSyncExternalStore } from "react";
import { RefreshCw, ShieldHalf } from "lucide-react";
import type { ParsedBuild } from "@/lib/pob";
import { BUILD_STORAGE_KEY } from "@/lib/save";
import { ImportForm } from "@/components/character/ImportForm";
import { BuildRadar } from "@/components/character/BuildRadar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

/**
 * The imported build lives in this browser's localStorage: the server parses
 * the PoB code and hands it back, but never stores it. The store is read via
 * useSyncExternalStore so the same-tab writes, other-tab writes (storage
 * event), and SSR ("init" until hydration) all stay consistent.
 */
const CHANGE_EVENT = "exile:build-change";

// getSnapshot must be referentially stable, so cache by the raw string.
let snapshotCache: { raw: string | null; build: ParsedBuild | null } = { raw: "", build: null };

function getSnapshot(): ParsedBuild | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (snapshotCache.raw !== raw) {
    let build: ParsedBuild | null = null;
    if (raw) {
      try {
        const b = JSON.parse(raw) as ParsedBuild;
        if (b && typeof b === "object" && typeof b.stats === "object") build = b;
      } catch {
        /* corrupt save: treat as empty */
      }
    }
    snapshotCache = { raw, build };
  }
  return snapshotCache.build;
}

// During SSR and hydration's first paint the save is unknowable.
const INIT = Symbol("init");
function getServerSnapshot(): typeof INIT {
  return INIT;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function writeBuild(build: ParsedBuild | null): void {
  try {
    if (build) window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(build));
    else window.localStorage.removeItem(BUILD_STORAGE_KEY);
  } catch {
    /* storage blocked or full; the UI still updates for this session */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CharacterView() {
  const stored = useSyncExternalStore<ParsedBuild | null | typeof INIT>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (stored === INIT) {
    return (
      <div className="reveal">
        <PageHeader eyebrow="Your Exile" title="Character" />
        <Panel className="max-w-2xl p-6">
          <p className="mono text-[11.5px] text-bone-600">Checking this browser for a saved build…</p>
        </Panel>
      </div>
    );
  }

  if (stored === null) {
    return (
      <div className="reveal">
        <PageHeader
          eyebrow="Your Exile"
          title="Character"
          sub="Import your build from Path of Building 2 to see your defenses, weak spots, and stats. No login, and it stays in your browser."
        />
        <Panel className="max-w-2xl p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[6px] border border-gold-600/30 bg-ink-800/60">
            <ShieldHalf size={20} strokeWidth={1.5} className="text-gold-300" />
          </div>
          <ImportForm onImported={(b) => writeBuild(b)} />
          <p className="mono mt-5 text-[11px] leading-relaxed text-bone-600">
            In Path of Building 2: Import/Export &rarr; Generate &rarr; copy the code or pobb.in link, then
            paste it above. PoB2 already computed your stats, so the radar reads them exactly. PoE2 does not
            expose character data without an OAuth sign-in, so this is the reliable, login-free path.
          </p>
        </Panel>
      </div>
    );
  }

  const build = stored;
  return (
    <div className="reveal">
      <PageHeader
        eyebrow={`Your Exile${build.ascendancy ? ` · ${build.ascendancy}` : ""}`}
        title={build.className || "Character"}
        sub={build.level ? `Level ${build.level}` : undefined}
        action={
          <button
            type="button"
            onClick={() => writeBuild(null)}
            className="mono inline-flex items-center gap-1.5 rounded-[5px] border border-gold-700/30 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-bone-400 transition-colors hover:text-gold-300"
          >
            <RefreshCw size={12} /> Re-import
          </button>
        }
      />
      <BuildRadar build={build} />
    </div>
  );
}
