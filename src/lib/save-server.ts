import { cookies } from "next/headers";
import {
  PROGRESS_COOKIE,
  TRACKER_COOKIE,
  decodeProgress,
  decodeTracker,
  type TrackEntry,
} from "./save";

/** Server half of the browser-owned save: read-only, straight off the request. */

export async function getProgress(): Promise<string[]> {
  const c = await cookies();
  return decodeProgress(c.get(PROGRESS_COOKIE)?.value);
}

/** Oldest first, most recently touched last (cookie append order). */
export async function getTrackerEntries(): Promise<TrackEntry[]> {
  const c = await cookies();
  return decodeTracker(c.get(TRACKER_COOKIE)?.value);
}
