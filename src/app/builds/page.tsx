import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { OracleChat } from "@/components/codex/OracleChat";

export const dynamic = "force-dynamic";

export default function BuildsPage() {
  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Build Guides"
        title="The War Table"
        sub="Ask the Oracle what is winning right now. It searches the current meta and prices it out against the live economy."
      />
      <Panel className="p-5">
        <OracleChat
          suggestions={[
            "What are the top meta builds right now?",
            "Best cheap league-starter build?",
            "Strongest Sorceress build this patch?",
            "What clears endgame the fastest?",
          ]}
        />
      </Panel>
    </div>
  );
}
