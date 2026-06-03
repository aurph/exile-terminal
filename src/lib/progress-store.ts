import { promises as fs } from "fs";
import path from "path";

/** Per-visitor campaign progress (checked milestone ids), keyed by poe_uid. */
const DIR = path.join(process.cwd(), "data", "progress");

function fileFor(uid: string): string {
  return path.join(DIR, `${uid.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
}

export async function getProgress(uid: string | null): Promise<string[]> {
  if (!uid) return [];
  try {
    const arr = JSON.parse(await fs.readFile(fileFor(uid), "utf8"));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function toggleProgress(uid: string, id: string, done: boolean): Promise<string[]> {
  const set = new Set(await getProgress(uid));
  if (done) set.add(id);
  else set.delete(id);
  const arr = [...set];
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(uid), JSON.stringify(arr), "utf8");
  return arr;
}
