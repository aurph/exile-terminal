/**
 * Browser-owned save data. Campaign progress and the uniques tracker are
 * small enough that the cookie IS the database: the browser writes it
 * directly (no API round-trip), the server reads it at render time so SSR
 * stays exact, and it survives refreshes, redeploys, and ephemeral
 * production filesystems because the state never leaves the visitor.
 *
 * Encodings are URL-safe by construction:
 *   progress  ->  "a1-clearfell.a2-trial"            (milestone ids, "." joined)
 *   tracker   ->  "739h.201w.85c"                    (<itemId><status char>, append order = recency)
 */
export const PROGRESS_COOKIE = "exile_progress";
export const TRACKER_COOKIE = "exile_tracker";
/** PoB build JSON is too big for a cookie; it lives in localStorage. */
export const BUILD_STORAGE_KEY = "exile_build";
export const SAVE_MAX_AGE = 60 * 60 * 24 * 365;

export type TrackStatus = "have" | "want" | "chasing";
export type TrackEntry = { itemId: number; status: TrackStatus };

const MILESTONE_ID = /^[a-z0-9-]{1,64}$/;
const MAX_MILESTONES = 64;
const MAX_TRACKED = 300;

const STATUS_TO_CHAR: Record<TrackStatus, string> = { have: "h", want: "w", chasing: "c" };
const CHAR_TO_STATUS: Record<string, TrackStatus> = { h: "have", w: "want", c: "chasing" };

export function encodeProgress(ids: Iterable<string>): string {
  return [...ids]
    .filter((id) => MILESTONE_ID.test(id))
    .slice(0, MAX_MILESTONES)
    .join(".");
}

export function decodeProgress(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(".")
    .filter((id) => MILESTONE_ID.test(id))
    .slice(0, MAX_MILESTONES);
}

export function encodeTracker(entries: TrackEntry[]): string {
  return entries
    .slice(-MAX_TRACKED)
    .map((e) => `${e.itemId}${STATUS_TO_CHAR[e.status]}`)
    .join(".");
}

/** Decodes in stored order: oldest first, most recently touched last. */
export function decodeTracker(value: string | undefined | null): TrackEntry[] {
  if (!value) return [];
  const out: TrackEntry[] = [];
  for (const seg of value.split(".")) {
    const m = seg.match(/^(\d{1,9})([hwc])$/);
    if (!m) continue;
    out.push({ itemId: Number(m[1]), status: CHAR_TO_STATUS[m[2]] });
    if (out.length >= MAX_TRACKED) break;
  }
  return out;
}

/** Sets/clears one item's status; touched entries move to the end (recency). */
export function withStatus(
  entries: TrackEntry[],
  itemId: number,
  status: TrackStatus | null
): TrackEntry[] {
  const rest = entries.filter((e) => e.itemId !== itemId);
  return status === null ? rest : [...rest, { itemId, status }];
}

/* ------------------------------- save codes ------------------------------- */

/**
 * A save code is the whole browser-owned save as one PoB-style string:
 * "EXILE1." + base64url(JSON { p: progress cookie, t: tracker cookie,
 * b: parsed build | null }). For moving a save between browsers or keeping a
 * backup; decoding runs everything back through the strict codecs above.
 */
const SAVE_CODE_PREFIX = "EXILE1.";

export type SaveData = {
  progress: string[];
  tracker: TrackEntry[];
  build: unknown | null;
};

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSaveCode(data: SaveData): string {
  const payload = JSON.stringify({
    p: encodeProgress(data.progress),
    t: encodeTracker(data.tracker),
    b: data.build ?? null,
  });
  return SAVE_CODE_PREFIX + toBase64Url(payload);
}

export function decodeSaveCode(code: string): SaveData | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SAVE_CODE_PREFIX)) return null;
  try {
    const raw = JSON.parse(fromBase64Url(trimmed.slice(SAVE_CODE_PREFIX.length))) as {
      p?: unknown;
      t?: unknown;
      b?: unknown;
    };
    const build =
      raw.b && typeof raw.b === "object" && typeof (raw.b as { stats?: unknown }).stats === "object"
        ? raw.b
        : null;
    return {
      progress: decodeProgress(typeof raw.p === "string" ? raw.p : ""),
      tracker: decodeTracker(typeof raw.t === "string" ? raw.t : ""),
      build,
    };
  } catch {
    return null;
  }
}
