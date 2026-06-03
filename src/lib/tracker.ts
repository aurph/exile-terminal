import { promises as fs } from "fs";
import path from "path";

/**
 * Per-visitor have/want/chasing tracker for uniques, keyed by the `poe_uid`
 * cookie. One small JSON file per visitor under data/trackers: zero native
 * deps, works on any host with a writable filesystem.
 */
export type TrackStatus = "have" | "want" | "chasing";
export type TrackEntry = {
  status: TrackStatus;
  itemId: number;
  name: string;
  category?: string;
  updatedAt: number;
};
export type Tracker = Record<string, TrackEntry>;

const DIR = path.join(process.cwd(), "data", "trackers");

function fileFor(uid: string): string {
  return path.join(DIR, `${uid.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
}

async function read(uid: string): Promise<Tracker> {
  try {
    return JSON.parse(await fs.readFile(fileFor(uid), "utf8")) as Tracker;
  } catch {
    return {};
  }
}

async function write(uid: string, t: Tracker): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(uid), JSON.stringify(t, null, 2), "utf8");
}

export async function getTracker(uid: string | null): Promise<Tracker> {
  return uid ? read(uid) : {};
}

export async function setStatus(
  uid: string,
  uniqueId: number,
  status: TrackStatus | null,
  meta?: { itemId: number; name: string; category?: string }
): Promise<Tracker> {
  const t = await read(uid);
  const key = String(uniqueId);
  if (status === null) {
    delete t[key];
  } else {
    t[key] = {
      status,
      itemId: meta?.itemId ?? t[key]?.itemId ?? 0,
      name: meta?.name ?? t[key]?.name ?? "",
      category: meta?.category ?? t[key]?.category,
      updatedAt: Date.now(),
    };
  }
  await write(uid, t);
  return t;
}
