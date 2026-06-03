import Link from "next/link";
import { ArrowUpRight, Gem, Sparkles, TrendingUp } from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Delta } from "@/components/ui/Delta";
import { TrendChart } from "@/components/charts/TrendChart";
import { PROFILE } from "@/lib/config";
import { getSession } from "@/lib/session";
import { aiEnabled } from "@/lib/ai";
import { getCurrencies, type Currency } from "@/lib/poe2scout";
import { getTracker, type TrackStatus } from "@/lib/tracker";
import { formatPrice, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

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

const STATUS_DOT: Record<TrackStatus, string> = {
  have: "bg-verdigris-400",
  want: "bg-[#8f8fef]",
  chasing: "bg-gold-400",
};

export default async function Home() {
  const session = await getSession();
  const ai = aiEnabled();

  let econ: Awaited<ReturnType<typeof getCurrencies>> | null = null;
  try {
    econ = await getCurrencies("currency", { perPage: 40 });
  } catch {
    econ = null;
  }
  let tracker: Awaited<ReturnType<typeof getTracker>> = {};
  try {
    tracker = await getTracker(session.uid);
  } catch {
    tracker = {};
  }

  const league = econ?.league.value ?? PROFILE.league;
  const sorted = econ ? [...econ.items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0)) : [];
  const hero: Currency | null = econ
    ? econ.items.find((c) => /^divine/i.test(c.name)) ?? sorted.find((c) => c.history.length > 1) ?? sorted[0] ?? null
    : null;
  const topList = sorted.filter((c) => c !== hero).slice(0, 5);
  const movers = econ
    ? [...econ.items]
        .filter((c) => c.change != null)
        .sort((a, b) => Math.abs(b.change as number) - Math.abs(a.change as number))
        .slice(0, 5)
    : [];
  const tracked = Object.values(tracker).sort((a, b) => b.updatedAt - a.updatedAt);
  const heroLetter = (session.account ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow={`Overview · ${league}`}
        title={session.account ? `Welcome back, ${session.account}` : "Welcome, Exile"}
        sub={
          session.account
            ? `Your command terminal for Path of Exile 2. Tracking ${session.character ?? "your characters"} on patch ${PROFILE.patch}.`
            : "Live economy, a unique tracker, and an Oracle that knows the current patch. Connect an account to personalize it."
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* character hero */}
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "40ms" }}>
          <PanelHead
            eyebrow="Your Exile"
            title={session.character || (session.account ? "Your character" : "No account")}
            note={session.account ? "awaiting link" : "not connected"}
            action={
              <MoreLink
                href={session.account ? "/character" : "/account"}
                label={session.account ? "Open" : "Connect"}
              />
            }
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <span className="sigil-ring absolute inset-0 rounded-full" />
              <span className="font-display text-3xl text-gold-300">{heroLetter}</span>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-[13px] text-bone-300">Class &amp; Ascendancy</span>
                <span className="mono rounded border border-gold-700/30 px-1.5 py-0.5 text-[10px] text-bone-500">
                  {session.account ? "unknown until linked" : "no account"}
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
            {session.account
              ? `Set ${session.account}'s Path of Exile profile to public to pull real gear, passive tree, and stats here.`
              : "Connect a Path of Exile 2 account to pull a character's real gear, passive tree, and stats."}
          </p>
        </Panel>

        {ai && (
        <Panel className="reveal p-6" style={{ animationDelay: "110ms" }}>
          <PanelHead eyebrow="Patch Notes" title="What changed" action={<MoreLink href="/changes" label="Explorer" />} />
          <p className="text-[13px] leading-relaxed text-bone-400">
            Ask the Oracle what changed in the current patch. It searches the live notes and explains any
            change.
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {["Skill and support rebalances", "New and reworked uniques", "Endgame and atlas changes"].map((t) => (
              <li key={t} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-[13px] text-bone-300">
                  <span className="h-1 w-1 shrink-0 rotate-45 bg-gold-400" />
                  {t}
                </span>
                <span className="mono text-[9px] uppercase tracking-wider text-bone-600">explore</span>
              </li>
            ))}
          </ul>
        </Panel>
        )}

        {/* economy — live */}
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "180ms" }}>
          <PanelHead
            eyebrow="Economy"
            title="Currency Exchange"
            note={econ ? `live · ${timeAgo(econ.fetchedAt)}` : "feed warming up"}
            action={<MoreLink href="/market" label="All markets" />}
          />
          {hero ? (
            <>
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <div className="eyebrow text-bone-500">{hero.name} · in Exalted</div>
                  <div className="foil font-display text-[34px] leading-none">
                    {formatPrice(hero.price, "")}
                    <span className="mono ml-1.5 text-sm text-bone-500">ex</span>
                  </div>
                </div>
                {hero.change != null && <Delta value={hero.change} className="mb-1" />}
              </div>
              <TrendChart points={hero.history} height={110} />
              <div className="my-4 rule" />
              <ul className="flex flex-col gap-2.5">
                {topList.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span className="t-currency truncate pr-3 text-[13.5px]">{c.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="mono text-[13px] text-bone-200">{formatPrice(c.price)}</span>
                      {c.change != null ? <Delta value={c.change} className="w-14 justify-end" /> : <span className="w-14" />}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-8 text-center text-[13px] text-bone-500">Economy feed is warming up. Refresh in a moment.</p>
          )}
        </Panel>

        {/* movers — live */}
        <Panel className="reveal p-6" style={{ animationDelay: "250ms" }}>
          <PanelHead
            eyebrow="Movers"
            title="Biggest Swings"
            action={<TrendingUp size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          {movers.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {movers.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.icon} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />
                    <span className="truncate text-[13px] text-bone-200">{c.name}</span>
                  </div>
                  <Delta value={c.change as number} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-[13px] text-bone-500">No swing data yet.</p>
          )}
        </Panel>

        {/* tracker list */}
        <Panel className="reveal flex flex-col p-6" style={{ animationDelay: "320ms" }}>
          <PanelHead eyebrow="Uniques" title="Your List" action={tracked.length > 0 ? <MoreLink href="/uniques" label="Manage" /> : undefined} />
          {tracked.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {tracked.slice(0, 6).map((t) => (
                <li key={t.itemId + t.name} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[t.status])} />
                    <span className="t-unique truncate text-[13px]">{t.name}</span>
                  </span>
                  <span className="mono text-[9.5px] uppercase tracking-wider text-bone-500">{t.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-gold-700/30 bg-ink-900/50">
                <Gem size={20} strokeWidth={1.5} className="text-gold-400" />
              </div>
              <div className="font-display text-[14px] text-bone-200">Nothing on the hunt yet</div>
              <p className="mt-1.5 max-w-[22ch] text-[12.5px] text-bone-500">
                Mark uniques as have, want, or chasing in the Reliquary.
              </p>
              <Link
                href="/uniques"
                className="mono mt-4 inline-flex items-center gap-1.5 rounded-[5px] border border-gold-600/40 bg-gold-500/10 px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/20"
              >
                Open the Reliquary
                <ArrowUpRight size={13} strokeWidth={2} />
              </Link>
            </div>
          )}
        </Panel>

        {ai && (
        <Panel className="reveal p-6 lg:col-span-2" style={{ animationDelay: "390ms" }}>
          <PanelHead
            eyebrow="Oracle"
            title="Ask the current patch"
            action={<Sparkles size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          <p className="mb-4 text-[13px] leading-relaxed text-bone-400">
            The Oracle fetches live data per question, so it answers from the current patch instead of stale
            memory. Ask what changed, what is worth chasing, or what to upgrade next.
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
        )}
      </div>
    </>
  );
}
