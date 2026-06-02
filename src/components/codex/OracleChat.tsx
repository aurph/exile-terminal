"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string; usedWeb?: boolean };

const SUGGESTIONS = [
  "What changed in the latest PoE2 patch?",
  "What are the best Exalted sinks right now?",
  "What is a Divine Orb worth?",
  "Is anything on my chase list worth it?",
];

export function OracleChat({
  initialAsk,
  suggestions = SUGGESTIONS,
}: {
  initialAsk?: string;
  suggestions?: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? data.error ?? "The Oracle is silent.", usedWeb: data.usedWeb },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "The connection to the Oracle failed." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialAsk && !sentInitial.current) {
      sentInitial.current = true;
      void send(initialAsk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAsk]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-[calc(100vh-15rem)] min-h-[420px] flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="sigil-ring mb-4 grid h-14 w-14 place-items-center rounded-full border border-gold-600/30">
              <Sparkles size={22} className="text-gold-300" />
            </div>
            <div className="font-display text-[16px] text-bone-100">The Oracle awaits your question</div>
            <p className="mt-1.5 max-w-sm text-[12.5px] text-bone-500">
              It reads live prices, your tracker, and the web before answering.
            </p>
            <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-gold-700/30 bg-ink-900/50 px-3 py-1.5 text-[11.5px] text-bone-400 transition-colors hover:border-gold-600/50 hover:text-bone-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {messages.map((m, i) => (
              <Bubble key={i} m={m} />
            ))}
            {loading && <Thinking />}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-4">
        <div className="flex items-end gap-2 rounded-[6px] border border-gold-700/30 bg-ink-900/60 p-2 transition-colors focus-within:border-gold-500/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask the Oracle..."
            className="mono max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] leading-relaxed text-bone-100 placeholder:text-bone-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] bg-gold-500/20 text-gold-200 transition-colors hover:bg-gold-500/30 disabled:opacity-40"
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ m }: { m: Msg }) {
  const isUser = m.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-[6px] px-4 py-3 text-[13px] leading-relaxed",
          isUser
            ? "border border-gold-700/30 bg-gold-500/[0.08] text-bone-100"
            : "border border-gold-700/20 bg-ink-900/50 text-bone-200"
        )}
      >
        {!isUser && (
          <div className="eyebrow mb-1.5 flex items-center gap-2 text-bone-500">
            Oracle
            {m.usedWeb && (
              <span className="inline-flex items-center gap-1 text-verdigris-400">
                <Globe size={10} /> web
              </span>
            )}
          </div>
        )}
        <div className="whitespace-pre-wrap">{m.content}</div>
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[6px] border border-gold-700/20 bg-ink-900/50 px-4 py-3">
        <div className="eyebrow mb-1.5 text-bone-500">Oracle</div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gold-400/70"
              style={{ animation: `emberPulse 1.2s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
          <span className="mono ml-2 text-[11px] text-bone-500">consulting the threads</span>
        </div>
      </div>
    </div>
  );
}
