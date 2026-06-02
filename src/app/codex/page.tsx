import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { OracleChat } from "@/components/codex/OracleChat";

export const dynamic = "force-dynamic";

export default async function CodexPage({
  searchParams,
}: {
  searchParams: Promise<{ ask?: string }>;
}) {
  const { ask } = await searchParams;

  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Codex"
        title="The Oracle"
        sub="Ask anything about the current patch. The Oracle pulls live prices, your tracker, and the web before it answers."
      />
      <Panel className="p-5">
        <OracleChat initialAsk={ask} />
      </Panel>
    </div>
  );
}
