import { NextResponse } from "next/server";
import { z } from "zod";
import { askOracle } from "@/lib/oracle";
import { getSession } from "@/lib/session";

export const maxDuration = 60;

const Body = z.object({
  question: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional(),
});

export async function POST(req: Request) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  try {
    const session = await getSession();
    const result = await askOracle(body.question, body.history ?? [], { uid: session.uid });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "the Oracle failed" },
      { status: 500 }
    );
  }
}
