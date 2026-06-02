import { BookOpenText } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function CodexPage({
  searchParams,
}: {
  searchParams: Promise<{ ask?: string }>;
}) {
  const { ask } = await searchParams;

  return (
    <PlaceholderPage
      icon={BookOpenText}
      eyebrow="Codex"
      title="The Oracle"
      sub="Browseable game knowledge, and an assistant that fetches current answers instead of guessing."
      lead="A searchable reference of skills, supports, mechanics, and item bases from poe2db, alongside a tool-calling Oracle that pulls live data per question so it is never stale on what just changed."
      points={[
        "Ask anything about the current patch and get a grounded answer",
        "The Oracle fetches economy, game data, and patch notes on demand",
        "Browse skills, supports, mechanics, and item bases",
        "It can reason about your own character once linked",
      ]}
    >
      {ask && (
        <div className="mt-7 rounded-[5px] border border-gold-700/30 bg-ink-900/50 p-4">
          <div className="eyebrow mb-2 text-bone-500">You asked the Oracle</div>
          <p className="font-body text-[15px] italic text-bone-200">&ldquo;{ask}&rdquo;</p>
          <p className="mono mt-3 text-[11px] text-bone-600">
            The Oracle is being summoned. Tool-calling answers arrive in the next pass.
          </p>
        </div>
      )}
    </PlaceholderPage>
  );
}
