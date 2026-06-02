import { Gem } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function UniquesPage() {
  return (
    <PlaceholderPage
      icon={Gem}
      eyebrow="Uniques"
      title="The Reliquary"
      sub="The full unique catalog, plus your personal chase tracker with live prices."
      lead="Every Path of Exile 2 unique from poe2db with art, full mods, base item, and drop source, joined to live prices. Mark each one as have, want, or chasing and watch what your chase items cost and what your stash is worth."
      points={[
        "Complete unique catalog with art, mods, and drop source (not a sample of 15)",
        "Personal tracker: have, want, chasing, saved locally",
        "Live price on every unique, sorted by what you are hunting",
        "Filter by slot, price, and status",
      ]}
    />
  );
}
