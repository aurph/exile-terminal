import { NextResponse } from "next/server";
import { z } from "zod";
import { getTracker, setStatus } from "@/lib/tracker";

export async function GET() {
  return NextResponse.json(await getTracker());
}

const Body = z.object({
  uniqueId: z.number(),
  status: z.enum(["have", "want", "chasing"]).nullable(),
  itemId: z.number().optional(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const meta =
    parsed.itemId != null || parsed.name != null
      ? { itemId: parsed.itemId ?? 0, name: parsed.name ?? "" }
      : undefined;
  const tracker = await setStatus(parsed.uniqueId, parsed.status, meta);
  return NextResponse.json(tracker[String(parsed.uniqueId)] ?? null);
}
