import Link from "next/link";
import { getTrackerEntries } from "@/lib/save-server";
import { getCategories, getCatalog } from "@/lib/poe2scout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PanelHead } from "@/components/ui/Panel";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const [trackerEntries, catalog] = await Promise.all([
    getTrackerEntries(),
    getCatalog().catch(() => null),
  ]);
  const catalogById = new Map((catalog?.items ?? []).map((i) => [i.itemId, i]));
  const entries = trackerEntries.map((e) => ({
    ...e,
    name: catalogById.get(e.itemId)?.name ?? `#${e.itemId}`,
    category: catalogById.get(e.itemId)?.category,
  }));
  const owned = entries.filter((e) => e.status === "have");
  const wanted = entries.filter((e) => e.status === "want");
  const chasing = entries.filter((e) => e.status === "chasing");

  // Catalog totals per unique category, all from the one cached /Items call.
  let cats: Awaited<ReturnType<typeof getCategories>> | null = null;
  const totals: Record<string, number> = {};
  try {
    cats = await getCategories();
    for (const item of catalog?.items ?? []) {
      if (item.kind === "unique") totals[item.category] = (totals[item.category] ?? 0) + 1;
    }
  } catch {
    cats = null;
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const pct = grandTotal > 0 ? Math.round((owned.length / grandTotal) * 100) : 0;
  const ownedByCat: Record<string, number> = {};
  for (const e of owned) {
    const c = e.category ?? "other";
    ownedByCat[c] = (ownedByCat[c] ?? 0) + 1;
  }

  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Collection"
        title="The Vault"
        sub="How much of the unique catalog you own. Mark uniques as Have in the Reliquary to fill it."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative h-32 w-32">
            <Ring pct={pct} />
            <div className="absolute inset-0 grid place-items-center">
              <div className="foil font-display text-3xl">{pct}%</div>
            </div>
          </div>
          <div className="mono mt-3 text-[13px] text-bone-200">
            {owned.length} / {grandTotal || "?"}
          </div>
          <div className="eyebrow mt-1 text-bone-500">uniques owned</div>
          <div className="mt-4 flex gap-4 text-[11.5px]">
            <span className="text-[#8f8fef]">{wanted.length} want</span>
            <span className="text-gold-300">{chasing.length} chasing</span>
          </div>
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <PanelHead
            eyebrow="By Slot"
            title="Catalog Coverage"
            action={
              <Link href="/uniques" className="mono text-[10.5px] uppercase tracking-[0.18em] text-bone-500 transition-colors hover:text-gold-300">
                Reliquary
              </Link>
            }
          />
          {cats ? (
            <ul className="flex flex-col gap-3.5">
              {cats.unique.map((c) => {
                const tot = totals[c.id] ?? 0;
                const own = ownedByCat[c.id] ?? 0;
                const p = tot > 0 ? (own / tot) * 100 : 0;
                return (
                  <li key={c.id}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="font-display text-[13.5px] capitalize text-bone-100">{c.label}</span>
                      <span className="mono text-[11.5px] text-bone-400">
                        {own} / {tot}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${p}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-bone-500">Catalog totals are warming up.</p>
          )}
        </Panel>

        <Panel className="p-6 lg:col-span-3">
          <PanelHead eyebrow="Owned" title="Your Uniques" note={`${owned.length} marked have`} />
          {owned.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {owned
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((e) => (
                  <div key={e.itemId} className="flex items-center justify-between gap-2 border-b border-gold-700/10 py-1.5">
                    <span className="t-unique truncate text-[12.5px]">{e.name}</span>
                    <span className="mono shrink-0 text-[9.5px] uppercase tracking-wider text-bone-600">{e.category ?? ""}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="py-8 text-center text-[13px] text-bone-500">
              Nothing marked as Have yet. Open the Reliquary and tag what you own.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
      <circle cx="64" cy="64" r={r} fill="none" stroke="#241a10" strokeWidth="8" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="url(#rg)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
      />
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e6c987" />
          <stop offset="1" stopColor="#9d7833" />
        </linearGradient>
      </defs>
    </svg>
  );
}
