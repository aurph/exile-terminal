/**
 * Tiny in-process TTL cache. The app runs as one long-lived Node server
 * so a module-level map persists across requests.
 * Cache-first: serve fresh within the TTL, and on a fetch failure fall back to
 * the last good value rather than erroring the page.
 */
type Entry = { value: unknown; at: number };
const store = new Map<string, Entry>();

export type Cached<T> = { data: T; fetchedAt: number; stale: boolean };

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<Cached<T>> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.at < ttlMs) {
    return { data: hit.value as T, fetchedAt: hit.at, stale: false };
  }
  try {
    const value = await fetcher();
    store.set(key, { value, at: now });
    return { data: value, fetchedAt: now, stale: false };
  } catch (err) {
    if (hit) return { data: hit.value as T, fetchedAt: hit.at, stale: true };
    throw err;
  }
}
