import { Coins } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function MarketPage() {
  return (
    <PlaceholderPage
      icon={Coins}
      eyebrow="Market"
      title="The Exchange"
      sub="Currency and item economy for the current league, quoted against one clear base."
      lead="The full economy from poe.ninja: currency exchange rates and notable items, every value named and quoted in Exalted Orbs, with trend charts so you can see what is climbing and what is bleeding out."
      points={[
        "Currency table with named, icon-labeled rates (no raw shorthand like c)",
        "Per-currency trend charts and league-long history",
        "Notable and high-value item movers",
        "Refreshes on a schedule, every value stamped with its fetch time",
      ]}
    />
  );
}
