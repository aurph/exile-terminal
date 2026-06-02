import Link from "next/link";
import { ArrowUpRight, Gem, Sparkles } from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Delta } from "@/components/ui/Delta";
import { TrendChart } from "@/components/charts/TrendChart";
import { PROFILE } from "@/lib/config";
import { CURRENCIES, DIVINE_TREND, META_BUILDS, SYNC } from "@/lib/sample";

function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mono inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] text-bone-500 transition-colors hover:text-gold-300"
    >
      {label}
      <ArrowUpRight size={12} strokeWidth={2} />
    </Link>
  );
}

function StatSlot({ label }: { label: string }) {
  return (
    <div className="rounded-[5px] border border-dashed border-gold-700/30 bg-ink-900/40 px-3 py-2.5">
      <div className="eyebrow text-[9px] text-bone-600">{label}</div>
      <div className="mono mt-1 text-lg text-bone-500">&mdash;</div>
    </div>
  );
}

export default function Home() {
  const divine = CURRENCIES[0];
  const minors = CURRENCIES.slice(1);
  const maxShare = Math.max(...META_BUILDS.map((b) => b.share));

  return (
    <>
      <PageHeader
        eyebrow={`Overview · ${PROFILE.league}`}
        title={`Welcome back, ${PROFILE.account}`}
        sub={`Your command terminal for Path of Exile 2. Tracking ${PROFILE.character} on patch ${PROFILE.patch}.`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* character hero */}
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "40ms" }}>
          <PanelHead
            eyebrow="Your Exile"
            title={PROFILE.character}
            note="awaiting link"
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <span className="sigil-ring absolute inset-0 rounded-full" />
              <span className="font-display text-3xl text-gold-300">A</span>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-[13px] text-bone-300">Class &amp; Ascendancy</span>
                <span className="mono rounded border border-gold-700/30 px-1.5 py-0.5 text-[10px] text-bone-500">
                  unknown until linked
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <StatSlot label="Life" />
                <StatSlot label="Energy Shield" />
                <StatSlot label="Spirit" />
                <StatSlot label="DPS" />
              </div>
            </div>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-bone-400">
            Link your account to pull {PROFILE.character}&rsquo;s real gear, passive tree, and stats. No
            OAuth wait required: set your Path of Exile profile to public, or add a session token, and
            this lights up.
          </p>
        </Panel>

        {/* 0.5 digest */}
        <Panel className="reveal p-6" style={{ animationDelay: "110ms" }}>
          <PanelHead
            eyebrow="Patch 0.5"
            title="What changed"
            action={<MoreLink href="/changes" label="Explorer" />}
          />
          <p className="text-[13px] leading-relaxed text-bone-400">
            The full 0.4 to 0.5 digest compiles when the live patch feed connects. The interactive
            explorer is one click away.
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {["Skill and support rebalances", "New and reworked uniques", "Endgame and atlas changes"].map(
              (t) => (
                <li key={t} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-[13px] text-bone-300">
                    <span className="h-1 w-1 shrink-0 rotate-45 bg-gold-400" />
                    {t}
                  </span>
                  <span className="mono text-[9px] uppercase tracking-wider text-bone-600">pending</span>
                </li>
              )
            )}
          </ul>
        </Panel>

        {/* economy */}
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "180ms" }}>
          <PanelHead
            eyebrow="Economy"
            title="Currency Exchange"
            note={`sample feed · ${SYNC.economy}`}
            action={<MoreLink href="/market" label="All markets" />}
          />
          <div className="mb-2 flex items-end justify-between">
            <div>
              <div className="eyebrow text-bone-500">Divine Orb · in Exalted</div>
              <div className="foil font-display text-[34px] leading-none">
                {divine.valueEx}
                <span className="mono ml-1.5 text-sm text-bone-500">ex</span>
              </div>
            </div>
            <Delta value={divine.change} className="mb-1" />
          </div>
          <TrendChart points={DIVINE_TREND} height={110} />
          <div className="my-4 rule" />
          <ul className="flex flex-col gap-2.5">
            {minors.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <span className="t-currency text-[13.5px]">{c.name}</span>
                  <span className="mono rounded bg-ink-700/60 px-1.5 py-0.5 text-[9.5px] text-bone-500">
                    {c.abbr}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="mono text-[13px] text-bone-200">{c.valueEx} ex</span>
                  <Delta value={c.change} className="w-12 justify-end" />
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* meta */}
        <Panel className="reveal p-6" style={{ animationDelay: "250ms" }}>
          <PanelHead
            eyebrow="Meta"
            title="Top Builds"
            note="sample"
            action={<MoreLink href="/builds" label="All" />}
          />
          <ul className="flex flex-col gap-4">
            {META_BUILDS.map((b) => (
              <li key={b.ascendancy}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="font-display text-[13.5px] text-bone-100">{b.ascendancy}</span>
                  <span className="mono text-[11px] text-gold-300">{b.share.toFixed(1)}%</span>
                </div>
                <div className="mb-1.5 text-[11.5px] text-bone-500">
                  {b.className} · {b.skill}
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300"
                    style={{ width: `${(b.share / maxShare) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* uniques chase — empty state */}
        <Panel className="reveal flex flex-col p-6" style={{ animationDelay: "320ms" }}>
          <PanelHead eyebrow="Uniques" title="Chase List" />
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-gold-700/30 bg-ink-900/50">
              <Gem size={20} strokeWidth={1.5} className="text-gold-400" />
            </div>
            <div className="font-display text-[14px] text-bone-200">Nothing on the hunt yet</div>
            <p className="mt-1.5 max-w-[22ch] text-[12.5px] text-bone-500">
              Track the uniques you want and watch their price move.
            </p>
            <Link
              href="/uniques"
              className="mono mt-4 inline-flex items-center gap-1.5 rounded-[5px] border border-gold-600/40 bg-gold-500/10 px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/20"
            >
              Open the Reliquary
              <ArrowUpRight size={13} strokeWidth={2} />
            </Link>
          </div>
        </Panel>

        {/* oracle invite */}
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "390ms" }}>
          <PanelHead
            eyebrow="Oracle"
            title="Ask the current patch"
            action={<Sparkles size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          <p className="mb-4 text-[13px] leading-relaxed text-bone-400">
            The Oracle fetches live data per question, so it answers from the current patch instead of
            stale memory. Ask what changed, what is worth chasing, or what to upgrade next.
          </p>
          <Link
            href="/codex?ask=What%20should%20I%20craft%20with%205%20divine%3F"
            className="group flex items-center justify-between gap-3 rounded-[5px] border border-gold-700/25 bg-ink-900/50 px-4 py-3 transition-colors hover:border-gold-500/40"
          >
            <span className="mono text-[12.5px] text-bone-400 group-hover:text-bone-200">
              What should I craft with 5 divine?
            </span>
            <ArrowUpRight size={15} strokeWidth={2} className="text-bone-600 group-hover:text-gold-300" />
          </Link>
        </Panel>
      </div>
    </>
  );
}
