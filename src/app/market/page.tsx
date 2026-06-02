import Link from "next/link";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import { getCurrencies, getCategories, type Currency, type Category } from "@/lib/poe2scout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Delta } from "@/components/ui/Delta";
import { TrendChart } from "@/components/charts/TrendChart";
import { formatPrice, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const cat = sp.cat ?? "currency";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let data: Awaited<ReturnType<typeof getCurrencies>> | null = null;
  let cats: { unique: Category[]; currency: Category[] } | null = null;
  let error: string | null = null;
  try {
    [data, cats] = await Promise.all([
      getCurrencies(cat, { page, perPage: 60 }),
      getCategories(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "request failed";
  }

  if (!data) {
    return (
      <div className="reveal">
        <PageHeader eyebrow="Market" title="The Exchange" />
        <Panel className="flex items-center gap-3 p-6">
          <TriangleAlert size={18} className="text-blood-400" />
          <span className="text-[13.5px] text-bone-300">
            poe2scout did not answer ({error}). The cache will serve the last good values once it has them.
          </span>
        </Panel>
      </div>
    );
  }

  const items = [...data.items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const categories = cats?.currency ?? [];

  return (
    <div className="reveal">
      <PageHeader
        eyebrow={`Market · ${data.league.value}`}
        title="The Exchange"
        sub={`Live currency prices in Exalted Orbs. ${
          data.league.divinePrice ? `Divine Orb sits at ${formatPrice(data.league.divinePrice)}.` : ""
        }`}
        action={
          <div className="text-right">
            <div className="eyebrow text-bone-500">{data.stale ? "stale" : "live"} · poe2scout</div>
            <div className="mono mt-1 text-[11px] text-bone-400">updated {timeAgo(data.fetchedAt)}</div>
          </div>
        }
      />

      {/* category tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((c) => {
          const active = c.id === cat;
          return (
            <Link
              key={c.id}
              href={`/market?cat=${c.id}`}
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

      <Panel className="overflow-hidden p-0">
        {/* header row */}
        <div className="grid grid-cols-[1fr_120px_90px_90px] items-center gap-3 border-b border-gold-700/20 px-5 py-3 sm:grid-cols-[1fr_140px_110px_90px_90px]">
          <div className="eyebrow text-bone-500">Item</div>
          <div className="eyebrow hidden text-bone-500 sm:block">7-log trend</div>
          <div className="eyebrow text-right text-bone-500">Price</div>
          <div className="eyebrow text-right text-bone-500">Change</div>
          <div className="eyebrow hidden text-right text-bone-500 sm:block">Stock</div>
        </div>

        <ul>
          {items.map((c, i) => (
            <CurrencyRow key={c.id} c={c} dim={i % 2 === 1} />
          ))}
          {items.length === 0 && (
            <li className="px-5 py-10 text-center text-[13px] text-bone-500">
              No items in this category.
            </li>
          )}
        </ul>
      </Panel>

      {/* pagination */}
      <div className="mt-4 flex items-center justify-between">
        <span className="mono text-[11px] text-bone-600">
          {data.total} items · page {data.page} of {data.pages}
        </span>
        <div className="flex gap-2">
          <PageLink cat={cat} page={page - 1} disabled={page <= 1} dir="prev" />
          <PageLink cat={cat} page={page + 1} disabled={page >= data.pages} dir="next" />
        </div>
      </div>
    </div>
  );
}

function CurrencyRow({ c, dim }: { c: Currency; dim: boolean }) {
  return (
    <li
      className={cn(
        "grid grid-cols-[1fr_120px_90px_90px] items-center gap-3 px-5 py-2.5 transition-colors hover:bg-gold-500/[0.04] sm:grid-cols-[1fr_140px_110px_90px_90px]",
        dim && "bg-ink-900/30"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.icon} alt="" width={26} height={26} className="h-[26px] w-[26px] shrink-0 object-contain" loading="lazy" />
        <span className="t-currency truncate text-[13px]">{c.name}</span>
      </div>
      <div className="hidden sm:block">
        <TrendChart points={c.history} height={26} />
      </div>
      <div className="mono text-right text-[13px] text-bone-100">{formatPrice(c.price)}</div>
      <div className="flex justify-end">
        {c.change == null ? (
          <span className="mono text-[11px] text-bone-600">—</span>
        ) : (
          <Delta value={c.change} />
        )}
      </div>
      <div className="mono hidden text-right text-[12px] text-bone-500 sm:block">
        {c.quantity ?? "—"}
      </div>
    </li>
  );
}

function PageLink({
  cat,
  page,
  disabled,
  dir,
}: {
  cat: string;
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
  return (
    <Link
      href={`/market?cat=${cat}&page=${page}`}
      className={cn(cls, "border-gold-600/40 text-bone-300 hover:bg-gold-500/10 hover:text-gold-200")}
    >
      {dir === "prev" && <ArrowLeft size={13} />}
      {dir}
      {dir === "next" && <ArrowRight size={13} />}
    </Link>
  );
}
