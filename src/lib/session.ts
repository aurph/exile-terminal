import { cookies } from "next/headers";

/**
 * Per-visitor session, no login. `account` / `character` are the PoE account
 * labels the visitor pointed the terminal at; they live in cookies set by the
 * server actions in app/actions.ts. All real save data (campaign progress,
 * tracker, build) is browser-owned — see lib/save.ts.
 */
export type Session = {
  account: string | null;
  character: string | null;
};

export async function getSession(): Promise<Session> {
  const c = await cookies();
  return {
    account: c.get("poe_account")?.value ?? null,
    character: c.get("poe_character")?.value ?? null,
  };
}
