"use client";

import { useActionState } from "react";
import { importBuild } from "@/app/actions";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importBuild, {});
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="pob"
        rows={4}
        placeholder="Paste your Path of Building 2 export code, or a pobb.in link"
        className="mono w-full resize-y rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-2.5 text-[12px] leading-relaxed text-bone-100 placeholder:text-bone-600 transition-colors focus:border-gold-500/50 focus:outline-none"
      />
      {state?.error && <p className="text-[12px] text-blood-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mono self-start rounded-[5px] border border-gold-600/40 bg-gold-500/15 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/25 disabled:opacity-60"
      >
        {pending ? "Reading..." : "Import build"}
      </button>
    </form>
  );
}
