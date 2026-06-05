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
  // One retry on a failed fetch: upstream blips are common enough that a
  // single second attempt fixes most of them without masking real outages.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (res.status >= 500) throw new Error(`poe2scout ${res.status} for ${path}`);
      if (!res.ok) throw Object.assign(new Error(`poe2scout ${res.status} for ${path}`), { noRetry: true });
      return schema.parse(await res.json());
    } catch (err) {
      lastErr = err;
      if ((err as { noRetry?: boolean }).noRetry) break;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr;
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

/** /Items: the whole league catalog (uniques + currencies) with prices, one call. */
const CatalogItemZ = z
  .object({
    ItemId: z.number(),
    CategoryApiId: z.string(),
    Text: z.string().nullable(),
    Name: z.string().nullable(),
    Type: z.string().nullable(),
    ApiId: z.string().nullable(),
    CurrentPrice: z.number().nullable(),
    IconUrl: z.string().nullable(),
  })
  .passthrough();

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

export type CatalogItem = {
  itemId: number;
  category: string;
  kind: "unique" | "currency";
  /** Unique name ("Sacred Flame") or currency text ("Divine Orb"). */
  name: string;
  /** Base type for uniques ("Sceptre"), null for currencies. */
  base: string | null;
  price: number | null;
  icon: string | null;
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

/**
 * Search note: poe2scout's `Search` query param is an EXACT full-name match
 * upstream ("Sacred Flame" hits, "sacred" returns nothing), so it is useless
 * for the substring search the UI offers. We never send it. Instead, a search
 * pulls every (cached) page of the category and filters locally.
 */
const matches = (q: string, ...fields: (string | null | undefined)[]) =>
  fields.some((f) => f != null && f.toLowerCase().includes(q));

function sliceForPage<T>(all: T[], page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(all.length / perPage));
  const p = Math.min(Math.max(1, page), pages);
  return { items: all.slice((p - 1) * perPage, p * perPage), page: p, pages, total: all.length };
}

type RawPage<T> = { CurrentPage: number; Pages: number; Total: number; Items: T[] };

/** Fetches one ByCategory page through the cache; the key ignores search. */
async function categoryPage<T>(
  kind: "Currencies" | "Uniques",
  schema: z.ZodType<RawPage<T>>,
  league: League,
  category: string,
  page: number,
  perPage: number,
  ttl: number
): Promise<Cached<RawPage<T>>> {
  const key = `${kind}:${league.value}:${category}:${page}:${perPage}`;
  return cached(key, ttl, () =>
    api(schema, `/${REALM}/Leagues/${encodeURIComponent(league.value)}/${kind}/ByCategory`, {
      Category: category,
      Page: page,
      PerPage: perPage,
    })
  );
}

/** Fetches every page of a category (each page individually cached). */
async function wholeCategory<T>(
  kind: "Currencies" | "Uniques",
  schema: z.ZodType<RawPage<T>>,
  league: League,
  category: string,
  perPage: number,
  ttl: number
): Promise<{ items: T[]; fetchedAt: number; stale: boolean }> {
  const first = await categoryPage(kind, schema, league, category, 1, perPage, ttl);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.data.Pages - 1) }, (_, i) =>
      categoryPage(kind, schema, league, category, i + 2, perPage, ttl)
    )
  );
  const all = [first, ...rest];
  return {
    items: all.flatMap((p) => p.data.Items),
    fetchedAt: Math.min(...all.map((p) => p.fetchedAt)),
    stale: all.some((p) => p.stale),
  };
}

const CUR_TTL = 15 * 60_000;
const UNIQ_TTL = 30 * 60_000;

export async function getCurrencies(category: string, opts: ListOpts = {}): Promise<Page<Currency>> {
  const league = await getCurrentLeague();
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 60;
  const q = opts.search?.trim().toLowerCase();

  if (q) {
    const whole = await wholeCategory(
      "Currencies", paginated(CurrencyZ), league, category, perPage, CUR_TTL
    );
    const hits = whole.items.map(normCurrency).filter((c) => matches(q, c.name));
    return { league, fetchedAt: whole.fetchedAt, stale: whole.stale, ...sliceForPage(hits, page, perPage) };
  }

  const { data, fetchedAt, stale } = await categoryPage(
    "Currencies", paginated(CurrencyZ), league, category, page, perPage, CUR_TTL
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
  const q = opts.search?.trim().toLowerCase();

  if (q) {
    const whole = await wholeCategory(
      "Uniques", paginated(UniqueZ), league, category, perPage, UNIQ_TTL
    );
    const hits = whole.items.map(normUnique).filter((u) => matches(q, u.name, u.base, u.fullName));
    return { league, fetchedAt: whole.fetchedAt, stale: whole.stale, ...sliceForPage(hits, page, perPage) };
  }

  const { data, fetchedAt, stale } = await categoryPage(
    "Uniques", paginated(UniqueZ), league, category, page, perPage, UNIQ_TTL
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

/* ---------------------------------- catalog ---------------------------------- */

/** The whole league catalog (1.2k+ items, prices included) in one cached call. */
export async function getCatalog(): Promise<{ items: CatalogItem[]; fetchedAt: number; stale: boolean }> {
  const league = await getCurrentLeague();
  const { data, fetchedAt, stale } = await cached(`catalog:${league.value}`, 10 * 60_000, () =>
    api(z.array(CatalogItemZ), `/${REALM}/Leagues/${encodeURIComponent(league.value)}/Items`)
  );
  const items = data
    .map((it): CatalogItem | null => {
      const name = it.Name ?? it.Text;
      if (!name) return null;
      return {
        itemId: it.ItemId,
        category: it.CategoryApiId,
        // Uniques carry a Name; currencies carry only ApiId/Text.
        kind: it.Name != null ? "unique" : "currency",
        name,
        base: it.Name != null ? it.Type : null,
        price: it.CurrentPrice,
        icon: it.IconUrl,
      };
    })
    .filter((x): x is CatalogItem => x !== null);
  return { items, fetchedAt, stale };
}

/** Case-insensitive substring search across the whole catalog. */
export async function searchCatalog(query: string, limit = 24): Promise<CatalogItem[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { items } = await getCatalog();
  return items
    .filter((it) => matches(q, it.name, it.base))
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, limit);
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
