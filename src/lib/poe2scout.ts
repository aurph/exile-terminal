import { z } from "zod";
import { cached, type Cached } from "./cache";
import { pctChange } from "./format";
import { cookies } from "next/headers";

/**
 * Adapter for the poe2scout.com public API (PoE2-native price data).
 * Every response is validated with Zod, then normalized into clean types the
 * UI consumes. The current league is resolved live, never hardcoded.
 */
const BASE = "https://poe2scout.com/api";
const REALM = "poe2";
const UA = "poe2-assistant (contact: jacksch45@gmail.com)";

async function api<T>(
  schema: z.ZodType<T>,
  path: string,
  query?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`poe2scout ${res.status} for ${path}`);
  return schema.parse(await res.json());
}

/* ----------------------------------- schemas ----------------------------------- */
const PriceLogZ = z
  .object({ Price: z.number(), Time: z.string(), Quantity: z.number().nullable() })
  .nullable();

const MetadataZ = z
  .object({
    name: z.string().optional(),
    base_type: z.string().optional(),
    icon: z.string().optional(),
    item_level: z.number().optional(),
    explicit_mods: z.array(z.string()).nullable().optional(),
    implicit_mods: z.array(z.string()).nullable().optional(),
    flavor_text: z.string().nullable().optional(),
    requirements: z.record(z.string(), z.string()).nullable().optional(),
    description: z.string().nullable().optional(),
    stack_size: z.number().nullable().optional(),
    effect: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

const CurrencyZ = z
  .object({
    ItemId: z.number(),
    ApiId: z.string(),
    Text: z.string(),
    CategoryApiId: z.string(),
    IconUrl: z.string(),
    ItemMetadata: MetadataZ.nullable().optional(),
    PriceLogs: z.array(PriceLogZ).default([]),
    CurrentPrice: z.number().nullable().default(null),
    CurrentQuantity: z.number().nullable().default(null),
  })
  .passthrough();

const UniqueZ = z
  .object({
    UniqueItemId: z.number(),
    ItemId: z.number(),
    IconUrl: z.string(),
    Text: z.string(),
    Name: z.string(),
    CategoryApiId: z.string(),
    Type: z.string().nullable().optional(),
    IsChanceable: z.boolean().optional(),
    ItemMetadata: MetadataZ.nullable().optional(),
    PriceLogs: z.array(PriceLogZ).default([]),
    CurrentPrice: z.number().nullable().default(null),
    CurrentQuantity: z.number().nullable().default(null),
  })
  .passthrough();

const LeagueZ = z
  .object({
    Value: z.string(),
    ShortName: z.string(),
    IsCurrent: z.boolean(),
    DivinePrice: z.number().nullable().optional(),
    ChaosDivinePrice: z.number().nullable().optional(),
  })
  .passthrough();

const CategoryZ = z
  .object({ ApiId: z.string(), Label: z.string(), Icon: z.string().nullable().optional() })
  .passthrough();

const CategoriesZ = z.object({
  UniqueCategories: z.array(CategoryZ),
  CurrencyCategories: z.array(CategoryZ),
});

const paginated = <T>(item: z.ZodType<T>) =>
  z.object({
    CurrentPage: z.number(),
    Pages: z.number(),
    Total: z.number(),
    Items: z.array(item),
  });

/* ---------------------------------- public types ---------------------------------- */
export type League = { value: string; shortName: string; divinePrice: number | null };
export type Category = { id: string; label: string; icon: string | null };

export type Currency = {
  id: string;
  itemId: number;
  name: string;
  icon: string;
  category: string;
  price: number | null;
  quantity: number | null;
  history: number[];
  change: number | null;
};

export type Unique = {
  id: number;
  itemId: number;
  name: string;
  fullName: string;
  base: string | null;
  category: string;
  icon: string;
  itemLevel: number | null;
  mods: string[];
  implicits: string[];
  flavor: string | null;
  requirements: Record<string, string> | null;
  price: number | null;
  quantity: number | null;
  history: number[];
  change: number | null;
};

export type Page<T> = {
  league: League;
  fetchedAt: number;
  stale: boolean;
  page: number;
  pages: number;
  total: number;
  items: T[];
};

/* ---------------------------------- normalize ---------------------------------- */
type PriceLog = { Price: number; Time: string; Quantity: number | null };
function history(logs: (PriceLog | null)[]): number[] {
  return logs.filter((l): l is PriceLog => l != null).map((l) => l.Price);
}

function normCurrency(c: z.infer<typeof CurrencyZ>): Currency {
  const h = history(c.PriceLogs);
  return {
    id: c.ApiId,
    itemId: c.ItemId,
    name: c.Text,
    icon: c.IconUrl,
    category: c.CategoryApiId,
    price: c.CurrentPrice,
    quantity: c.CurrentQuantity,
    history: h,
    change: pctChange(h),
  };
}

function normUnique(u: z.infer<typeof UniqueZ>): Unique {
  const h = history(u.PriceLogs);
  const m = u.ItemMetadata;
  return {
    id: u.UniqueItemId,
    itemId: u.ItemId,
    name: u.Name,
    fullName: u.Text,
    base: u.Type ?? m?.base_type ?? null,
    category: u.CategoryApiId,
    icon: u.IconUrl,
    itemLevel: m?.item_level ?? null,
    mods: m?.explicit_mods ?? [],
    implicits: m?.implicit_mods ?? [],
    flavor: m?.flavor_text ?? null,
    requirements: m?.requirements ?? null,
    price: u.CurrentPrice,
    quantity: u.CurrentQuantity,
    history: h,
    change: pctChange(h),
  };
}

/* ---------------------------------- queries ---------------------------------- */
async function leagueList() {
  const { data } = await cached("leagues", 6 * 3600_000, () =>
    api(z.array(LeagueZ), `/${REALM}/Leagues`)
  );
  return data;
}

export async function getLeagues(): Promise<
  { value: string; shortName: string; isCurrent: boolean }[]
> {
  const data = await leagueList();
  return data.map((l) => ({ value: l.Value, shortName: l.ShortName, isCurrent: l.IsCurrent }));
}

export async function getCurrentLeague(): Promise<League> {
  const data = await leagueList();
  const override = (await cookies()).get("poe_league")?.value;
  const chosen =
    (override ? data.find((l) => l.Value === override) : undefined) ??
    data.find((l) => l.IsCurrent && !/^HC\b/i.test(l.Value)) ??
    data.find((l) => l.IsCurrent) ??
    data[0];
  return {
    value: chosen.Value,
    shortName: chosen.ShortName,
    divinePrice: chosen.DivinePrice ?? null,
  };
}

export async function getCategories(): Promise<{ unique: Category[]; currency: Category[] }> {
  const league = await getCurrentLeague();
  const { data } = await cached(`cats:${league.value}`, 12 * 3600_000, () =>
    api(
      CategoriesZ,
      `/${REALM}/Leagues/${encodeURIComponent(league.value)}/Items/Categories`
    )
  );
  const map = (c: z.infer<typeof CategoryZ>): Category => ({
    id: c.ApiId,
    label: c.Label,
    icon: c.Icon ?? null,
  });
  return { unique: data.UniqueCategories.map(map), currency: data.CurrencyCategories.map(map) };
}

type ListOpts = { page?: number; perPage?: number; search?: string };

export async function getCurrencies(category: string, opts: ListOpts = {}): Promise<Page<Currency>> {
  const league = await getCurrentLeague();
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 60;
  const key = `cur:${league.value}:${category}:${page}:${perPage}:${opts.search ?? ""}`;
  const { data, fetchedAt, stale } = await cached(key, 15 * 60_000, () =>
    api(
      paginated(CurrencyZ),
      `/${REALM}/Leagues/${encodeURIComponent(league.value)}/Currencies/ByCategory`,
      { Category: category, Page: page, PerPage: perPage, Search: opts.search }
    )
  );
  return {
    league,
    fetchedAt,
    stale,
    page: data.CurrentPage,
    pages: data.Pages,
    total: data.Total,
    items: data.Items.map(normCurrency),
  };
}

export async function getUniques(category: string, opts: ListOpts = {}): Promise<Page<Unique>> {
  const league = await getCurrentLeague();
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 48;
  const key = `uniq:${league.value}:${category}:${page}:${perPage}:${opts.search ?? ""}`;
  const { data, fetchedAt, stale } = await cached(key, 30 * 60_000, () =>
    api(
      paginated(UniqueZ),
      `/${REALM}/Leagues/${encodeURIComponent(league.value)}/Uniques/ByCategory`,
      { Category: category, Page: page, PerPage: perPage, Search: opts.search }
    )
  );
  return {
    league,
    fetchedAt,
    stale,
    page: data.CurrentPage,
    pages: data.Pages,
    total: data.Total,
    items: data.Items.map(normUnique),
  };
}

/* ---------------------------------- exchange ---------------------------------- */
const ExchangeSnapshotZ = z
  .object({
    Volume: z.union([z.string(), z.number()]).optional(),
    MarketCap: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const PairCurrencyZ = z
  .object({ ApiId: z.string(), Text: z.string(), IconUrl: z.string() })
  .passthrough();
const PairZ = z
  .object({
    Volume: z.union([z.string(), z.number()]).optional(),
    CurrencyOne: PairCurrencyZ,
    CurrencyTwo: PairCurrencyZ,
  })
  .passthrough();

export type ExchangePulse = {
  volume: number;
  marketCap: number;
  topPairs: { one: { name: string; icon: string }; two: { name: string; icon: string }; volume: number }[];
  fetchedAt: number;
  stale: boolean;
};

const toNum = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v ?? "0")) || 0);

export async function getExchangePulse(): Promise<ExchangePulse | null> {
  const league = await getCurrentLeague();
  try {
    const { data, fetchedAt, stale } = await cached(`pulse:${league.value}`, 15 * 60_000, async () => {
      const base = `/${REALM}/Leagues/${encodeURIComponent(league.value)}`;
      const [snap, pairs] = await Promise.all([
        api(ExchangeSnapshotZ, `${base}/ExchangeSnapshot`),
        api(z.array(PairZ), `${base}/SnapshotPairs`),
      ]);
      const top = [...pairs]
        .sort((a, b) => toNum(b.Volume) - toNum(a.Volume))
        .slice(0, 8)
        .map((p) => ({
          one: { name: p.CurrencyOne.Text, icon: p.CurrencyOne.IconUrl },
          two: { name: p.CurrencyTwo.Text, icon: p.CurrencyTwo.IconUrl },
          volume: toNum(p.Volume),
        }));
      return { volume: toNum(snap.Volume), marketCap: toNum(snap.MarketCap), topPairs: top };
    });
    return { ...data, fetchedAt, stale };
  } catch {
    return null;
  }
}
