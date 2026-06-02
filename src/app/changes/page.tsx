import { ScrollText } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function ChangesPage() {
  return (
    <PlaceholderPage
      icon={ScrollText}
      eyebrow="Patch Intelligence"
      title="0.4 → 0.5"
      sub="An interactive map of everything that changed, so you do not have to read a wall of patch notes."
      lead="The full 0.4 to 0.5 transition, parsed into a browseable, filterable explorer: skills, supports, uniques, monsters, and systems, each diffed and categorized, with the Oracle ready to explain any single change."
      points={[
        "Every change categorized: buffs, nerfs, new, removed, reworked",
        "Filter by skills, supports, uniques, ascendancies, and systems",
        "Search any keyword across the whole 0.4 to 0.5 diff",
        "Ask the Oracle to explain what a change means for your build",
      ]}
    />
  );
}
