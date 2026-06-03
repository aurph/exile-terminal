"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { parsePob } from "@/lib/pob";
import { saveBuild, clearBuild } from "@/lib/build-store";

const YEAR = 60 * 60 * 24 * 365;
const COOKIE = { sameSite: "lax", maxAge: YEAR, path: "/" } as const;

export async function setAccount(formData: FormData): Promise<void> {
  const account = String(formData.get("account") ?? "").trim();
  const character = String(formData.get("character") ?? "").trim();
  const c = await cookies();
  if (!c.get("poe_uid")) {
    c.set("poe_uid", randomUUID(), { ...COOKIE, httpOnly: true });
  }
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

export async function importBuild(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
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

    const build = parsePob(input);
    const c = await cookies();
    let uid = c.get("poe_uid")?.value;
    if (!uid) {
      uid = randomUUID();
      c.set("poe_uid", uid, { ...COOKIE, httpOnly: true });
    }
    await saveBuild(uid, build);
    revalidatePath("/character");
    return {};
  } catch {
    return {
      error: "Could not read that build. Make sure it is a valid PoB2 export code or pobb.in link.",
    };
  }
}

export async function clearBuildAction(): Promise<void> {
  const c = await cookies();
  const uid = c.get("poe_uid")?.value;
  if (uid) await clearBuild(uid);
  revalidatePath("/character");
}
