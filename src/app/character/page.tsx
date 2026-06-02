import Link from "next/link";
import { ExternalLink, ShieldHalf } from "lucide-react";
import { getCharacterDetail, rarityName, type GearPiece } from "@/lib/poe-character";
import { PROFILE } from "@/lib/config";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const rarityClass: Record<string, string> = {
  normal: "text-rarity-normal",
  magic: "t-magic",
  rare: "t-rare",
  unique: "t-unique",
};

export default async function CharacterPage() {
  const detail = await getCharacterDetail(PROFILE.character);

  if (!detail) {
    return (
      <div className="reveal">
        <PageHeader eyebrow="Your Exile" title={PROFILE.character} />
        <Panel className="max-w-2xl p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[6px] border border-gold-600/30 bg-ink-800/60">
            <ShieldHalf size={22} strokeWidth={1.5} className="text-gold-300" />
          </div>
          <h3 className="font-display text-[16px] text-bone-100">Connect your character</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-bone-400">
            Account <span className="text-gold-300">{PROFILE.account}</span> and character{" "}
            <span className="t-unique">{PROFILE.character}</span> are preconfigured. Give the app read
            access one of two ways and this lights up with real gear, stats, and passive allocation:
          </p>
          <ol className="mt-5 flex flex-col gap-3">
            <li className="flex gap-3 text-[13px] text-bone-300">
              <span className="mono text-gold-400">1</span>
              <span>
                Set your profile to public at{" "}
                <Link
                  href="https://www.pathofexile.com/my-account/privacy"
                  className="text-gold-300 underline decoration-gold-700/40 underline-offset-2 hover:text-gold-200"
                >
                  pathofexile.com privacy settings
                </Link>
                , then reload this page. Simplest, no secrets.
              </span>
            </li>
            <li className="flex gap-3 text-[13px] text-bone-300">
              <span className="mono text-gold-400">2</span>
              <span>
                Or keep it private and add <span className="mono text-gold-300">POESESSID</span> to your
                environment. Copy the POESESSID cookie from pathofexile.com in your
                browser.
              </span>
            </li>
          </ol>
          <p className="mono mt-6 text-[11px] text-bone-600">
            Reads GGG&rsquo;s character endpoints with realm=poe2. The deep passive tree links out to a
            planner.
          </p>
        </Panel>
      </div>
    );
  }

  const s = detail.summary;
  return (
    <div className="reveal">
      <PageHeader
        eyebrow={`Your Exile · ${s.league ?? PROFILE.league}`}
        title={s.name}
        sub={`Level ${s.level} ${s.className}`}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="p-6">
          <PanelHead eyebrow="Sheet" title="Character" />
          <dl className="flex flex-col gap-3">
            <Row label="Level" value={String(s.level)} />
            <Row label="Class" value={s.className} />
            <Row label="Passives allocated" value={String(detail.passivesAllocated)} />
            <Row label="Gear pieces" value={String(detail.gear.length)} />
          </dl>
          <Link
            href="https://poe-planner.com"
            className="mono mt-5 inline-flex items-center gap-1.5 rounded-[5px] border border-gold-600/40 bg-gold-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-gold-200 transition-colors hover:bg-gold-500/20"
          >
            Open full tree in planner
            <ExternalLink size={12} />
          </Link>
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <PanelHead eyebrow="Equipment" title="Gear" note={`${detail.gear.length} equipped`} />
          {detail.gear.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-bone-500">No equipped items returned.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {detail.gear.map((g) => (
                <GearRow key={g.slot} g={g} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[13px] text-bone-500">{label}</dt>
      <dd className="mono text-[13px] text-bone-100">{value}</dd>
    </div>
  );
}

function GearRow({ g }: { g: GearPiece }) {
  return (
    <div className="rounded-[5px] border border-gold-700/20 bg-ink-900/40 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={cn("truncate text-[13px]", rarityClass[rarityName(g.rarity)])}>
          {g.name || g.base}
        </span>
        <span className="mono shrink-0 text-[9.5px] uppercase tracking-wider text-bone-600">{g.slot}</span>
      </div>
      {g.base && g.name !== g.base && <div className="mono text-[10.5px] text-bone-500">{g.base}</div>}
      {g.mods.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-0.5">
          {g.mods.slice(0, 3).map((m, i) => (
            <li key={i} className="truncate text-[11px] text-[#9fb0d9]">
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
