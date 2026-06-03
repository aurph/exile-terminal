import { RefreshCw, ShieldHalf } from "lucide-react";
import { getSession } from "@/lib/session";
import { getBuild } from "@/lib/build-store";
import { clearBuildAction } from "@/app/actions";
import { ImportForm } from "@/components/character/ImportForm";
import { BuildRadar } from "@/components/character/BuildRadar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const session = await getSession();
  const build = await getBuild(session.uid);

  if (!build) {
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
          <ImportForm />
          <p className="mono mt-5 text-[11px] leading-relaxed text-bone-600">
            In Path of Building 2: Import/Export &rarr; Generate &rarr; copy the code or pobb.in link, then
            paste it above. PoB2 already computed your stats, so the radar reads them exactly. PoE2 does not
            expose character data without an OAuth sign-in, so this is the reliable, login-free path.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="reveal">
      <PageHeader
        eyebrow={`Your Exile${build.ascendancy ? ` · ${build.ascendancy}` : ""}`}
        title={build.className || "Character"}
        sub={build.level ? `Level ${build.level}` : undefined}
        action={
          <form action={clearBuildAction}>
            <button
              type="submit"
              className="mono inline-flex items-center gap-1.5 rounded-[5px] border border-gold-700/30 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-bone-400 transition-colors hover:text-gold-300"
            >
              <RefreshCw size={12} /> Re-import
            </button>
          </form>
        }
      />
      <BuildRadar build={build} />
    </div>
  );
}
