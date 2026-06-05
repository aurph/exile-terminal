import Link from "next/link";
import { Search, TriangleAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { getUniques, getCategories, searchCatalog, type Category, type CatalogItem } from "@/lib/poe2scout";
import { getTrackerEntries } from "@/lib/save-server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { UniqueCard } from "@/components/uniques/UniqueCard";
import { cn } from "@/lib/cn";
import { timeAgo, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UniquesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const cat = sp.cat ?? "weapon";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();

  const trackerEntries = await getTrackerEntries();
  let data: Awaited<ReturnType<typeof getUniques>> | null = null;
  let cats: { unique: Category[]; currency: Category[] } | null = null;
  let elsewhere: CatalogItem[] = [];
  let error: string | null = null;
  try {
    [data, cats, elsewhere] = await Promise.all([
      getUniques(cat, { page, perPage: 48, search: q }),
      getCategories(),
      // Cross-category hits so a search never dead-ends in the wrong tab.
      q ? searchCatalog(q).then((hits) => hits.filter((h) => h.kind === "unique" && h.category !== cat)) : [],
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "request failed";
  }

  const trackerStatus = new Map(trackerEntries.map((e) => [e.itemId, e.status]));
  const trackedCount = trackerEntries.length;

  if (!data) {
    return (
      <div className="reveal">
        <PageHeader eyebrow="Uniques" title="The Reliquary" />
        <Panel className="flex items-center gap-3 p-6">
          <TriangleAlert size={18} className="text-blood-400" />
          <span className="text-[13.5px] text-bone-300">
            poe2scout did not answer ({error}). Try again shortly.
          </span>
        </Panel>
      </div>
    );
  }

  const items = [...data.items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const categories = cats?.unique ?? [];

  return (
    <div className="reveal">
      <PageHeader
        eyebrow={`Uniques · ${data.league.value}`}
        title="The Reliquary"
        sub="The full unique catalog with live prices. Mark what you have, want, and are chasing."
        action={
          <div className="text-right">
            <div className="eyebrow text-bone-500">{trackedCount} tracked</div>
            <div className="mono mt-1 text-[11px] text-bone-400">updated {timeAgo(data.fetchedAt)}</div>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const active = c.id === cat;
            return (
              <Link
                key={c.id}
                href={`/uniques?cat=${c.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={cn(
                  "mono rounded-[4px] border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-gold-500/50 bg-gold-500/15 text-gold-200"
                    : "border-gold-700/20 bg-ink-900/40 text-bone-500 hover:border-gold-600/40 hover:text-bone-300"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* search */}
        <form action="/uniques" method="get" className="flex items-center">
          <input type="hidden" name="cat" value={cat} />
          <div className="flex items-center gap-2 rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-1.5 focus-within:border-gold-500/50">
            <Search size={14} className="text-bone-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="search uniques"
              className="mono w-40 bg-transparent text-[12px] text-bone-100 placeholder:text-bone-600 focus:outline-none"
            />
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <Panel className="p-10 text-center text-[13.5px] text-bone-500">
          No uniques match{q ? ` "${q}"` : ""} in this category.
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((u) => (
            <UniqueCard key={u.id} unique={u} initialStatus={trackerStatus.get(u.itemId) ?? null} />
          ))}
        </div>
      )}

      {/* cross-category matches */}
      {q && elsewhere.length > 0 && (
        <div className="mt-5">
          <div className="eyebrow mb-2.5 text-bone-500">
            Also matching “{q}” in other categories
          </div>
          <div className="flex flex-wrap gap-2">
            {elsewhere.slice(0, 12).map((h) => (
              <Link
                key={h.itemId}
                href={`/uniques?cat=${h.category}&q=${encodeURIComponent(q)}`}
                className="mono inline-flex items-center gap-2 rounded-[5px] border border-gold-700/25 bg-ink-900/50 px-2.5 py-1.5 text-[11px] text-bone-300 transition-colors hover:border-gold-500/50 hover:text-gold-200"
              >
                {h.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.icon} alt="" className="h-4 w-4 object-contain" loading="lazy" />
                )}
                {h.name}
                <span className="text-bone-600">{h.category}</span>
                {h.price != null && <span className="text-bone-400">{formatPrice(h.price)}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* pagination */}
      <div className="mt-5 flex items-center justify-between">
        <span className="mono text-[11px] text-bone-600">
          {data.total} uniques · page {data.page} of {data.pages}
        </span>
        <div className="flex gap-2">
          <PageLink cat={cat} q={q} page={page - 1} disabled={page <= 1} dir="prev" />
          <PageLink cat={cat} q={q} page={page + 1} disabled={page >= data.pages} dir="next" />
        </div>
      </div>
    </div>
  );
}

function PageLink({
  cat,
  q,
  page,
  disabled,
  dir,
}: {
  cat: string;
  q: string;
  page: number;
  disabled: boolean;
  dir: "prev" | "next";
}) {
  const cls =
    "mono inline-flex items-center gap-1.5 rounded-[5px] border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors";
  if (disabled) {
    return (
      <span className={cn(cls, "border-gold-700/15 text-bone-700")}>
        {dir === "prev" && <ArrowLeft size={13} />}
        {dir}
        {dir === "next" && <ArrowRight size={13} />}
      </span>
    );
  }
  const href = `/uniques?cat=${cat}&page=${page}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  return (
    <Link href={href} className={cn(cls, "border-gold-600/40 text-bone-300 hover:bg-gold-500/10 hover:text-gold-200")}>
      {dir === "prev" && <ArrowLeft size={13} />}
      {dir}
      {dir === "next" && <ArrowRight size={13} />}
    </Link>
  );
}
