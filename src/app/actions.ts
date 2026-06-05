"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parsePob, type ParsedBuild } from "@/lib/pob";

const YEAR = 60 * 60 * 24 * 365;
const COOKIE = { sameSite: "lax", maxAge: YEAR, path: "/" } as const;

export async function setAccount(formData: FormData): Promise<void> {
  const account = String(formData.get("account") ?? "").trim();
  const character = String(formData.get("character") ?? "").trim();
  const c = await cookies();
  if (account) c.set("poe_account", account, COOKIE);
  else c.delete("poe_account");
  if (character) c.set("poe_character", character, COOKIE);
  else c.delete("poe_character");
  redirect("/");
}

export async function clearAccount(): Promise<void> {
  const c = await cookies();
  c.delete("poe_account");
  c.delete("poe_character");
  redirect("/account");
}

export async function setLeague(formData: FormData): Promise<void> {
  const league = String(formData.get("league") ?? "").trim();
  const c = await cookies();
  if (league) c.set("poe_league", league, COOKIE);
  else c.delete("poe_league");
  revalidatePath("/", "layout");
}

const POB_UA = "poe2-assistant (contact: jacksch45@gmail.com)";

/**
 * Parses a PoB2 code (or pobb.in link) server-side — the zlib inflate and the
 * cross-origin pobb.in fetch both need the server — and returns the parsed
 * build to the client, which stores it in localStorage. The server keeps
 * nothing, so the build survives redeploys with the visitor, not the host.
 */
export async function importBuild(
  _prev: { error?: string; build?: ParsedBuild } | undefined,
  formData: FormData
): Promise<{ error?: string; build?: ParsedBuild }> {
  try {
    let input = String(formData.get("pob") ?? "").trim();
    if (!input) return { error: "Paste a Path of Building code or a pobb.in link." };

    const link = input.match(/pobb\.in\/([A-Za-z0-9_-]+)/);
    if (link) {
      const res = await fetch(`https://pobb.in/${link[1]}/raw`, {
        headers: { "User-Agent": POB_UA },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return { error: "Could not fetch that pobb.in link." };
      input = (await res.text()).trim();
    }

    return { build: parsePob(input) };
  } catch {
    return {
      error: "Could not read that build. Make sure it is a valid PoB2 export code or pobb.in link.",
    };
  }
}
