import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getProgress, toggleProgress } from "@/lib/progress-store";

export async function GET() {
  const uid = (await cookies()).get("poe_uid")?.value ?? null;
  return NextResponse.json(await getProgress(uid));
}

const Body = z.object({ id: z.string().min(1).max(64), done: z.boolean() });

export async function POST(req: Request) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const c = await cookies();
  let uid = c.get("poe_uid")?.value;
  if (!uid) {
    uid = randomUUID();
    c.set("poe_uid", uid, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return NextResponse.json(await toggleProgress(uid, body.id, body.done));
}
