"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Download } from "lucide-react";
import type { ParsedBuild } from "@/lib/pob";
import {
  PROGRESS_COOKIE,
  TRACKER_COOKIE,
  decodeProgress,
  decodeTracker,
  encodeProgress,
  encodeTracker,
  encodeSaveCode,
  decodeSaveCode,
} from "@/lib/save";
import { readCookie, writeCookie, readStoredBuild, writeBuild } from "@/lib/save-client";
import { Panel, PanelHead } from "@/components/ui/Panel";

/**
 * Save data never leaves this browser, so a save code is the carry handle:
 * one string holding campaign progress, the tracker, and the imported build.
 * Copy it on one machine, restore it on another, or keep it as a backup
 * before clearing browser data.
 */
export function SaveCodePanel() {
  const router = useRouter();
  const [exported, setExported] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [restoreMsg, setRestoreMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleExport() {
    const code = encodeSaveCode({
      progress: decodeProgress(readCookie(PROGRESS_COOKIE)),
      tracker: decodeTracker(readCookie(TRACKER_COOKIE)),
      build: readStoredBuild(),
    });
    setExported(code);
    setCopied(false);
    navigator.clipboard
      ?.writeText(code)
      .then(() => setCopied(true))
      .catch(() => {
        /* clipboard blocked; the textarea below still shows the code */
      });
  }

  function handleRestore() {
    const data = decodeSaveCode(pasted);
    if (!data) {
      setRestoreMsg({ ok: false, text: "That does not look like an EXILE1 save code." });
      return;
    }
    writeCookie(PROGRESS_COOKIE, encodeProgress(data.progress));
    writeCookie(TRACKER_COOKIE, encodeTracker(data.tracker));
    writeBuild((data.build as ParsedBuild) ?? null);
    setRestoreMsg({
      ok: true,
      text: `Restored: ${data.progress.length} milestones, ${data.tracker.length} tracked uniques${
        data.build ? ", and your build" : ""
      }.`,
    });
    setPasted("");
    router.refresh();
  }

  return (
    <Panel className="mt-4 max-w-xl p-6">
      <PanelHead
        eyebrow="Save Data"
        title="Save Code"
        note="progress · tracker · build, in one string"
      />
      <p className="mb-4 text-[12.5px] leading-relaxed text-bone-500">
        Everything saves to this browser. A save code carries it to another browser or device, and
        works as a backup before clearing browser data.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="mono inline-flex items-center gap-2 self-start rounded-[5px] border border-gold-600/40 bg-gold-500/15 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/25"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied to clipboard" : "Copy save code"}
        </button>

        {exported && (
          <textarea
            readOnly
            rows={3}
            value={exported}
            onFocus={(e) => e.currentTarget.select()}
            className="mono w-full resize-y rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-2.5 text-[11px] leading-relaxed text-bone-300 focus:border-gold-500/50 focus:outline-none"
          />
        )}

        <div className="my-1 rule" />

        <textarea
          rows={3}
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="Paste a save code to restore it here"
          className="mono w-full resize-y rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-2.5 text-[11px] leading-relaxed text-bone-100 placeholder:text-bone-600 transition-colors focus:border-gold-500/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleRestore}
          disabled={!pasted.trim()}
          className="mono inline-flex items-center gap-2 self-start rounded-[5px] border border-gold-700/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-bone-300 transition-colors hover:border-gold-600/40 hover:text-gold-200 disabled:opacity-50"
        >
          <Download size={13} />
          Restore
        </button>
        {restoreMsg && (
          <p className={`text-[12px] ${restoreMsg.ok ? "text-verdigris-400" : "text-blood-400"}`}>
            {restoreMsg.text}
          </p>
        )}
        <p className="mono text-[10.5px] leading-relaxed text-bone-600">
          Restoring overwrites this browser&rsquo;s progress, tracker, and build with the code&rsquo;s contents.
        </p>
      </div>
    </Panel>
  );
}
