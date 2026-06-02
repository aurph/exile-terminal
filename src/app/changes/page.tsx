import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { OracleChat } from "@/components/codex/OracleChat";

export const dynamic = "force-dynamic";

export default function ChangesPage() {
  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Patch Intelligence"
        title="What Changed"
        sub="Ask the Oracle what is new. It searches the current patch notes and explains any change in plain terms."
      />
      <Panel className="p-5">
        <OracleChat
          suggestions={[
            "What changed in the latest PoE2 patch?",
            "Which skills got buffed or nerfed?",
            "What uniques were added or reworked?",
            "Any big endgame or atlas changes?",
          ]}
        />
      </Panel>
    </div>
  );
}
