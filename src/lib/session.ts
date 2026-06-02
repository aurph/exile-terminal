import { cookies } from "next/headers";

/**
 * Per-visitor session, no login. `uid` is a random per-browser id that scopes
 * the uniques tracker; `account` / `character` are the PoE account the visitor
 * pointed the terminal at. All three live in cookies, set via the server
 * actions in app/actions.ts. Read-only here (Server Components can't mutate
 * cookies); writes happen in actions and route handlers.
 */
export type Session = {
  uid: string | null;
  account: string | null;
  character: string | null;
};

export async function getSession(): Promise<Session> {
  const c = await cookies();
  return {
    uid: c.get("poe_uid")?.value ?? null,
    account: c.get("poe_account")?.value ?? null,
    character: c.get("poe_character")?.value ?? null,
  };
}
