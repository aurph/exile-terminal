"use client";

import { useSyncExternalStore } from "react";
import { RefreshCw, ShieldHalf } from "lucide-react";
import type { ParsedBuild } from "@/lib/pob";
import { readStoredBuild, subscribeToBuild, writeBuild } from "@/lib/save-client";
import { ImportForm } from "@/components/character/ImportForm";
import { BuildRadar } from "@/components/character/BuildRadar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

/**
 * The imported build lives in this browser's localStorage: the server parses
 * the PoB code and hands it back, but never stores it. The store is read via
 * useSyncExternalStore so same-tab writes, other-tab writes (storage event),
 * and SSR ("init" until hydration) all stay consistent.
 */

// During SSR and hydration's first paint the save is unknowable.
const INIT = Symbol("init");
function getServerSnapshot(): typeof INIT {
  return INIT;
}

export function CharacterView() {
  const stored = useSyncExternalStore<ParsedBuild | null | typeof INIT>(
    subscribeToBuild,
    readStoredBuild,
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
