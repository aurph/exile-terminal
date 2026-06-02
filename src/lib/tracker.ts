import { promises as fs } from "fs";
import path from "path";

/**
 * Durable have/want/chasing tracker for uniques. Single-user, so a small JSON
 * file on disk is the right tool: zero native deps, works identically locally
 * and on Replit's persistent filesystem. Keyed by poe2scout UniqueItemId.
 */
export type TrackStatus = "have" | "want" | "chasing";
export type TrackEntry = {
  status: TrackStatus;
  itemId: number;
  name: string;
  updatedAt: number;
};
export type Tracker = Record<string, TrackEntry>;

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "tracker.json");

async function read(): Promise<Tracker> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Tracker;
  } catch {
    return {};
  }
}

async function write(t: Tracker): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(t, null, 2), "utf8");
}

export async function getTracker(): Promise<Tracker> {
  return read();
}

export async function setStatus(
  uniqueId: number,
  status: TrackStatus | null,
  meta?: { itemId: number; name: string }
): Promise<Tracker> {
  const t = await read();
  const key = String(uniqueId);
  if (status === null) {
    delete t[key];
  } else {
    t[key] = {
      status,
      itemId: meta?.itemId ?? t[key]?.itemId ?? 0,
      name: meta?.name ?? t[key]?.name ?? "",
      updatedAt: Date.now(),
    };
  }
  await write(t);
  return t;
}
