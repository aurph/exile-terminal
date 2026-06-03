import {
  LayoutDashboard,
  UserRound,
  Footprints,
  Swords,
  Coins,
  Gem,
  Library,
  BookOpenText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  ai?: boolean;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, blurb: "Your exile at a glance" },
  { href: "/character", label: "Character", icon: UserRound, blurb: "Your gear, stats, passives" },
  { href: "/story", label: "Campaign", icon: Footprints, blurb: "0.5 leveling route to maps" },
  { href: "/builds", label: "Build Guides", icon: Swords, blurb: "Meta and visual build cards", ai: true },
  { href: "/market", label: "Market", icon: Coins, blurb: "Currency and item economy" },
  { href: "/uniques", label: "Uniques", icon: Gem, blurb: "Catalog and your chase list" },
  { href: "/collection", label: "Collection", icon: Library, blurb: "How much you own" },
  { href: "/codex", label: "Codex", icon: BookOpenText, blurb: "Skills, mechanics, and Ask", ai: true },
  { href: "/changes", label: "0.5 Changes", icon: ScrollText, blurb: "What changed from 0.4", ai: true },
];
