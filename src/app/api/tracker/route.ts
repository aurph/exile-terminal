import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getTracker, setStatus } from "@/lib/tracker";

export async function GET() {
  const c = await cookies();
  const uid = c.get("poe_uid")?.value ?? null;
  return NextResponse.json(await getTracker(uid));
}

const Body = z.object({
  uniqueId: z.number(),
  status: z.enum(["have", "want", "chasing"]).nullable(),
  itemId: z.number().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const c = await cookies();
  let uid = c.get("poe_uid")?.value;
  if (!uid) {
    uid = randomUUID();
    c.set("poe_uid", uid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const meta =
    parsed.itemId != null || parsed.name != null || parsed.category != null
      ? { itemId: parsed.itemId ?? 0, name: parsed.name ?? "", category: parsed.category }
      : undefined;
  const tracker = await setStatus(uid, parsed.uniqueId, parsed.status, meta);
  return NextResponse.json(tracker[String(parsed.uniqueId)] ?? null);
}
