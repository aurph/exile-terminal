"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

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
