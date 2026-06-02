import Anthropic from "@anthropic-ai/sdk";
import { getCurrencies, getUniques, getCurrentLeague } from "./poe2scout";
import { getTracker } from "./tracker";
import { PROFILE } from "./config";

/**
 * The Oracle: a tool-calling PoE2 assistant. It reasons over live poe2scout
 * data, the user's tracker, and the web (server-side web_search) so it answers
 * from the current patch rather than stale memory. Manual agent loop with a
 * hard iteration cap. Defaults to Opus 4.8; override with ORACLE_MODEL.
 */
const MODEL = process.env.ORACLE_MODEL ?? "claude-opus-4-8";

const SYSTEM = `You are the Oracle, a Path of Exile 2 assistant inside a personal command terminal for the exile "${PROFILE.account}" (main character "${PROFILE.character}").

Live tools available to you:
- get_economy: current currency/item prices for the active league, quoted in Exalted Orbs.
- search_uniques: look up unique items by name, with live prices, base type, and mods.
- get_tracked_uniques: the user's personal have / want / chasing list.
- get_current_league: the active league name and the current Divine Orb price.
- web_search: search the web for current Path of Exile 2 information (patch notes, mechanics, builds) when your own knowledge may be out of date.

Path of Exile 2 patches frequently. When a question depends on the current patch, recent changes, or specifics you are not sure about, use web_search or the data tools instead of guessing. Prefer real data over memory.

Style: concise and direct, no filler. Quote prices in Exalted Orbs (ex). Reference the user's own tracked uniques when relevant. If you cannot verify something, say so plainly.`;

const clientTools: Anthropic.Tool[] = [
  {
    name: "get_economy",
    description:
      "Current prices for currencies or items in the active PoE2 league, quoted in Exalted Orbs. Call this for any price, value, or economy question.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "currency category id, e.g. 'currency', 'fragments', 'runes', 'essences', 'breach'. Defaults to 'currency'.",
        },
        search: { type: "string", description: "optional name filter" },
      },
      required: [],
    },
  },
  {
    name: "search_uniques",
    description: "Look up PoE2 unique items by name with live prices, base type, and mods.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "unique name or keyword" },
        category: {
          type: "string",
          description: "optional: weapon, armour, accessory, jewel, flask, map, sanctum",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_tracked_uniques",
    description: "The user's personal have / want / chasing unique list.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_current_league",
    description: "The active PoE2 league name and the current Divine Orb price in Exalted.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

const tools: Anthropic.Messages.ToolUnion[] = [
  ...clientTools,
  { type: "web_search_20260209", name: "web_search" },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === "get_economy") {
      const cat = (input.category as string) || "currency";
      const page = await getCurrencies(cat, { perPage: 40, search: input.search as string });
      const items = page.items
        .slice(0, 20)
        .map((c) => ({ name: c.name, ex: c.price, changePct: c.change }));
      return JSON.stringify({ league: page.league.value, base: "Exalted Orb", items });
    }
    if (name === "search_uniques") {
      const cat = (input.category as string) || "weapon";
      const page = await getUniques(cat, { perPage: 12, search: input.query as string });
      const items = page.items.slice(0, 10).map((u) => ({
        name: u.name,
        base: u.base,
        ex: u.price,
        changePct: u.change,
        mods: u.mods.slice(0, 6),
      }));
      return JSON.stringify({ league: page.league.value, category: cat, items });
    }
    if (name === "get_tracked_uniques") {
      const t = await getTracker();
      return JSON.stringify(Object.values(t).map((e) => ({ name: e.name, status: e.status })));
    }
    if (name === "get_current_league") {
      const l = await getCurrentLeague();
      return JSON.stringify({ league: l.value, divineOrbInExalted: l.divinePrice });
    }
    return JSON.stringify({ error: `unknown tool ${name}` });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "tool failed" });
  }
}

export type OracleMessage = { role: "user" | "assistant"; content: string };

export async function askOracle(
  question: string,
  history: OracleMessage[] = []
): Promise<{ answer: string; usedWeb: boolean }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      answer:
        "The Oracle needs an ANTHROPIC_API_KEY to speak. Add it to your environment, then ask again.",
      usedWeb: false,
    };
  }

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: "user", content: question },
  ];
  let usedWeb = false;

  for (let i = 0; i < 8; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools,
      messages,
    });

    if (res.content.some((b) => b.type === "server_tool_use" || b.type === "web_search_tool_result")) {
      usedWeb = true;
    }

    if (res.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: res.content });
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use") {
          const out = await runTool(block.name, (block.input ?? {}) as Record<string, unknown>);
          results.push({ type: "tool_result", tool_use_id: block.id, content: out });
        }
      }
      messages.push({ role: "user", content: results });
      continue;
    }

    if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content });
      continue;
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { answer: text || "(The Oracle returned nothing.)", usedWeb };
  }

  return { answer: "The Oracle could not resolve that. Try a more specific question.", usedWeb };
}
