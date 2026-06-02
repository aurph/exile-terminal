import { Swords } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function BuildsPage() {
  return (
    <PlaceholderPage
      icon={Swords}
      eyebrow="Build Guides"
      title="The War Table"
      sub="Browse what the ladder is actually winning with, then open a full visual build card."
      lead="Live meta pulled from poe.ninja's ladder, opened into character-screen build cards: gear with item art, skill and support gem links, ascendancy and key passives, leveling, and how to play it."
      points={[
        "Sortable meta list by class, skill, popularity, and rough cost tier",
        "Visual build card per build: gear slots, gem links, keystones as an icon list",
        "Passive tree shown as its key-node list with an open-in-planner link",
        "Your character alangreenspan appears here as a build card once linked",
      ]}
    />
  );
}
