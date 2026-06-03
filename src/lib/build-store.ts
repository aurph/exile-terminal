import { promises as fs } from "fs";
import path from "path";
import type { ParsedBuild } from "./pob";

/** Per-visitor imported build, keyed by the poe_uid cookie. One JSON per uid. */
const DIR = path.join(process.cwd(), "data", "builds");

function fileFor(uid: string): string {
  return path.join(DIR, `${uid.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
}

export async function getBuild(uid: string | null): Promise<ParsedBuild | null> {
  if (!uid) return null;
  try {
    return JSON.parse(await fs.readFile(fileFor(uid), "utf8")) as ParsedBuild;
  } catch {
    return null;
  }
}

export async function saveBuild(uid: string, build: ParsedBuild): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(uid), JSON.stringify(build), "utf8");
}

export async function clearBuild(uid: string): Promise<void> {
  try {
    await fs.unlink(fileFor(uid));
  } catch {
    /* nothing to clear */
  }
}
