import { z } from "zod";
import { cached } from "./cache";

/**
 * Reads the user's PoE2 characters from GGG's public character-window
 * endpoints (realm=poe2). Works when the account profile is public; if it is
 * private, set POESESSID in the environment and it is sent as a cookie.
 * Everything is defensive: any failure returns null so the page can show a
 * "connect your account" state rather than erroring.
 */
const BASE = "https://www.pathofexile.com/character-window";
const UA = "poe2-assistant (contact: jacksch45@gmail.com)";
const REALM = "poe2";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": UA, Accept: "application/json" };
  if (process.env.POESESSID) h["Cookie"] = `POESESSID=${process.env.POESESSID}`;
  return h;
}

async function ggg<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`GGG ${res.status} for ${path}`);
  return schema.parse(await res.json());
}

const CharacterZ = z
  .object({
    name: z.string(),
    level: z.number(),
    class: z.string(),
    ascendancyClass: z.number().nullable().optional(),
    league: z.string().nullable().optional(),
    experience: z.number().nullable().optional(),
  })
  .passthrough();

const ItemZ = z
  .object({
    name: z.string().default(""),
    typeLine: z.string().default(""),
    baseType: z.string().nullable().optional(),
    inventoryId: z.string().nullable().optional(),
    frameType: z.number().nullable().optional(),
    icon: z.string().nullable().optional(),
    ilvl: z.number().nullable().optional(),
    explicitMods: z.array(z.string()).nullable().optional(),
    implicitMods: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

const ItemsResponseZ = z.object({ items: z.array(ItemZ).default([]) }).passthrough();
const PassivesResponseZ = z
  .object({ hashes: z.array(z.number()).default([]), hashes_ex: z.array(z.number()).nullable().optional() })
  .passthrough();

export type CharacterSummary = {
  name: string;
  level: number;
  className: string;
  ascendancy: number | null;
  league: string | null;
};

export type GearPiece = {
  slot: string;
  name: string;
  base: string;
  rarity: number;
  icon: string | null;
  mods: string[];
};

export type CharacterDetail = {
  summary: CharacterSummary;
  gear: GearPiece[];
  passivesAllocated: number;
};

const RARITY = ["normal", "magic", "rare", "unique"]; // frameType 0..3
export function rarityName(frameType: number | null | undefined): string {
  return RARITY[frameType ?? 0] ?? "normal";
}

function summarize(c: z.infer<typeof CharacterZ>): CharacterSummary {
  return {
    name: c.name,
    level: c.level,
    className: c.class,
    ascendancy: c.ascendancyClass ?? null,
    league: c.league ?? null,
  };
}

/** Whether we have any way to read the account (public profile is also fine, but this gates the explicit token path). */
export function characterLinkConfigured(): boolean {
  return Boolean(process.env.POESESSID);
}

export async function getCharacters(account: string): Promise<CharacterSummary[] | null> {
  if (!account) return null;
  try {
    const { data } = await cached(`chars:${account}`, 10 * 60_000, () =>
      ggg(
        `/get-characters?accountName=${encodeURIComponent(account)}&realm=${REALM}`,
        z.array(CharacterZ)
      )
    );
    return data.map(summarize);
  } catch {
    return null;
  }
}

export async function getCharacterDetail(
  account: string,
  name: string
): Promise<CharacterDetail | null> {
  if (!account || !name) return null;
  try {
    const chars = await getCharacters(account);
    const summary = chars?.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!summary) return null;

    const q = `accountName=${encodeURIComponent(account)}&character=${encodeURIComponent(name)}&realm=${REALM}`;
    const [items, passives] = await Promise.all([
      cached(`items:${name}`, 10 * 60_000, () => ggg(`/get-items?${q}`, ItemsResponseZ)),
      cached(`passives:${name}`, 10 * 60_000, () => ggg(`/get-passive-skills?${q}`, PassivesResponseZ)),
    ]);

    const gear: GearPiece[] = items.data.items
      .filter((it) => it.inventoryId && it.inventoryId !== "MainInventory" && it.inventoryId !== "Flask")
      .map((it) => ({
        slot: it.inventoryId ?? "",
        name: it.name || it.typeLine,
        base: it.baseType ?? it.typeLine,
        rarity: it.frameType ?? 0,
        icon: it.icon ?? null,
        mods: [...(it.implicitMods ?? []), ...(it.explicitMods ?? [])],
      }));

    return { summary, gear, passivesAllocated: passives.data.hashes.length };
  } catch {
    return null;
  }
}
