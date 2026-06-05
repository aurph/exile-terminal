import Link from "next/link";
import { ArrowUpRight, Gem, TrendingUp, Activity, Vault } from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { Delta } from "@/components/ui/Delta";
import { TrendChart } from "@/components/charts/TrendChart";
import { MoversBars } from "@/components/charts/MoversBars";
import { UniqueCard } from "@/components/uniques/UniqueCard";
import { CampaignSpine } from "@/components/story/CampaignSpine";
import { PROFILE } from "@/lib/config";
import { getSession } from "@/lib/session";
import { getCurrencies, getUniques, getExchangePulse, getCatalog, type Unique } from "@/lib/poe2scout";
import { getProgress, getTrackerEntries } from "@/lib/save-server";
import type { TrackStatus } from "@/lib/save";
import { TOTAL_MILESTONES } from "@/lib/campaign";
import { formatPrice, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const compact = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(Math.round(n));

const STATUS_DOT: Record<TrackStatus, string> = {
  have: "bg-verdigris-400",
  want: "bg-[#8f8fef]",
  chasing: "bg-gold-400",
};

function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-bone-500 transition-colors hover:text-gold-300"
    >
      {label}
      <ArrowUpRight size={12} strokeWidth={2} />
    </Link>
  );
}

function Tick({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-bone-600">{label}</span>
      <span className={cn("mono text-[12px]", accent ? "text-gold-300" : "text-bone-100")}>{children}</span>
    </span>
  );
}

export default async function Home() {
  const session = await getSession();

  const [econ, weapons, armour, accessories, pulse, catalog, progress, trackerEntries] =
    await Promise.all([
      getCurrencies("currency", { perPage: 60 }).catch(() => null),
      getUniques("weapon", { perPage: 24 }).catch(() => null),
      getUniques("armour", { perPage: 16 }).catch(() => null),
      getUniques("accessory", { perPage: 16 }).catch(() => null),
      getExchangePulse().catch(() => null),
      getCatalog().catch(() => null),
      getProgress(),
      getTrackerEntries(),
    ]);

  const league = econ?.league.value ?? PROFILE.league;
  const currSorted = econ ? [...econ.items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0)) : [];
  const hero =
    econ?.items.find((c) => /^divine/i.test(c.name)) ??
    currSorted.find((c) => c.history.length > 1) ??
    currSorted[0] ??
    null;
  const exchangeList = currSorted.filter((c) => c !== hero).slice(0, 6);
  const vault = currSorted.slice(0, 8);
  const movers = econ
    ? [...econ.items]
        .filter((c) => c.change != null)
        .sort((a, b) => Math.abs(b.change as number) - Math.abs(a.change as number))
        .slice(0, 7)
        .map((c) => ({ name: c.name, icon: c.icon, change: c.change as number }))
    : [];

  const seen = new Set<number>();
  const chase: Unique[] = [];
  for (const u of [...(weapons?.items ?? []), ...(armour?.items ?? []), ...(accessories?.items ?? [])]
    .filter((u) => u.price != null)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    chase.push(u);
    if (chase.length >= 6) break;
  }

  // Tracker cookie stores itemId + status in touch order; the catalog supplies names.
  const catalogById = new Map((catalog?.items ?? []).map((i) => [i.itemId, i]));
  const trackerStatus = new Map(trackerEntries.map((e) => [e.itemId, e.status]));
  const tracked = [...trackerEntries].reverse();
  const pct = Math.round((progress.length / TOTAL_MILESTONES) * 100);

  return (
    <div className="reveal">
      {/* command header + ticker */}
      <div className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2 flex items-center gap-2 text-bone-500">
              <span className="h-1.5 w-1.5 rotate-45 bg-gold-400" />
              Overview · {league}
            </div>
            <h1 className="font-display text-2xl leading-none text-bone-100 sm:text-[30px]">
              {session.account ? `Welcome back, ${session.account}` : "Wraeclast at a Glance"}
            </h1>
          </div>
          {econ && (
            <span className="mono text-[10.5px] text-bone-600">feed · {timeAgo(econ.fetchedAt)}</span>
          )}
        </div>

        <div className="panel mt-4 flex flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-3">
          <Tick label="Divine" accent>
            {hero ? `${formatPrice(hero.price, "")} ex` : "—"}
          </Tick>
          <span className="hidden h-3.5 w-px bg-gold-700/25 sm:block" />
          <Tick label="Mkt Vol">{pulse ? compact(pulse.volume) : "—"}</Tick>
          <Tick label="Mkt Cap">{pulse ? compact(pulse.marketCap) : "—"}</Tick>
          <span className="hidden h-3.5 w-px bg-gold-700/25 sm:block" />
          <Tick label="Tracked">{tracked.length}</Tick>
          <Tick label="Campaign" accent>
            {pct}%
          </Tick>
          <Tick label="League">{league}</Tick>
        </div>
      </div>

      {/* zone 1 — chase uniques + campaign */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="reveal p-5 xl:col-span-8" style={{ animationDelay: "40ms" }}>
          <PanelHead
            eyebrow="The Reliquary"
            title="Chase Items"
            note="the economy's priciest uniques"
            action={<MoreLink href="/uniques" label="All uniques" />}
          />
          {chase.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {chase.map((u) => (
                <UniqueCard key={u.id} unique={u} initialStatus={trackerStatus.get(u.itemId) ?? null} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-bone-500">Reliquary feed is warming up.</p>
          )}
        </Panel>

        <Panel className="reveal flex flex-col p-5 xl:col-span-4" style={{ animationDelay: "110ms" }}>
          <PanelHead eyebrow="Campaign" title="The Fast Road" action={<MoreLink href="/story" label="Open" />} />
          <CampaignSpine checked={progress} />
        </Panel>
      </div>

      {/* zone 2 — exchange + vault + movers */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="reveal p-5 xl:col-span-5" style={{ animationDelay: "180ms" }}>
          <PanelHead
            eyebrow="Economy"
            title="Currency Exchange"
            note={hero ? `${hero.name} · in Exalted` : undefined}
            action={<MoreLink href="/market" label="Markets" />}
          />
          {hero ? (
            <>
              <div className="mb-2 flex items-end justify-between">
                <div className="foil font-display text-[32px] leading-none">
                  {formatPrice(hero.price, "")}
                  <span className="mono ml-1.5 text-sm text-bone-500">ex</span>
                </div>
                {hero.change != null && <Delta value={hero.change} className="mb-1" />}
              </div>
              <TrendChart points={hero.history} height={96} />
              <div className="my-4 rule" />
              <ul className="flex flex-col gap-2.5">
                {exchangeList.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span className="t-currency truncate pr-3 text-[13px]">{c.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="mono text-[12.5px] text-bone-200">{formatPrice(c.price)}</span>
                      {c.change != null ? (
                        <Delta value={c.change} className="w-12 justify-end" />
                      ) : (
                        <span className="w-12" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-10 text-center text-[13px] text-bone-500">Economy feed is warming up.</p>
          )}
        </Panel>

        <Panel className="reveal p-5 xl:col-span-4" style={{ animationDelay: "250ms" }}>
          <PanelHead
            eyebrow="The Vault"
            title="Most Valuable"
            action={<Vault size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          {vault.length > 0 ? (
            <ol className="flex flex-col gap-2.5">
              {vault.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="mono w-4 shrink-0 text-[11px] text-bone-600">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.icon} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />
                  <span className="t-currency min-w-0 flex-1 truncate text-[13px]">{c.name}</span>
                  <span className="mono shrink-0 text-[12.5px] text-bone-100">{formatPrice(c.price)}</span>
                  {c.change != null ? (
                    <Delta value={c.change} className="w-11 shrink-0 justify-end" />
                  ) : (
                    <span className="w-11 shrink-0" />
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-10 text-center text-[13px] text-bone-500">No data yet.</p>
          )}
        </Panel>

        <Panel className="reveal p-5 xl:col-span-3" style={{ animationDelay: "320ms" }}>
          <PanelHead
            eyebrow="Swings"
            title="Market Movers"
            action={<TrendingUp size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          {movers.length > 0 ? (
            <MoversBars items={movers} />
          ) : (
            <p className="py-10 text-center text-[13px] text-bone-500">No swing data yet.</p>
          )}
        </Panel>
      </div>

      {/* zone 3 — tracker + traded flow */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="reveal flex flex-col p-5 xl:col-span-4" style={{ animationDelay: "390ms" }}>
          <PanelHead
            eyebrow="Uniques"
            title="Your List"
            action={tracked.length > 0 ? <MoreLink href="/uniques" label="Manage" /> : undefined}
          />
          {tracked.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {tracked.slice(0, 7).map((t) => (
                <li key={t.itemId} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[t.status])} />
                    <span className="t-unique truncate text-[13px]">
                      {catalogById.get(t.itemId)?.name ?? `#${t.itemId}`}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[9.5px] uppercase tracking-wider text-bone-500">
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-gold-700/30 bg-ink-900/50">
                <Gem size={20} strokeWidth={1.5} className="text-gold-400" />
              </div>
              <div className="font-display text-[14px] text-bone-200">Nothing on the hunt yet</div>
              <p className="mt-1.5 max-w-[24ch] text-[12.5px] text-bone-500">
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

        <Panel className="reveal p-5 xl:col-span-8" style={{ animationDelay: "460ms" }}>
          <PanelHead
            eyebrow="Exchange Flow"
            title="Most Traded"
            note="highest-volume currency pairs"
            action={<Activity size={15} strokeWidth={1.75} className="text-gold-400" />}
          />
          {pulse && pulse.topPairs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {pulse.topPairs.slice(0, 8).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-[6px] border border-gold-700/20 bg-ink-900/40 px-2.5 py-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.one.icon} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" />
                  <span className="text-bone-700">/</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.two.icon} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" />
                  <span className="mono ml-auto text-[10px] text-bone-500">{compact(p.volume)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-bone-500">Exchange flow is warming up.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
