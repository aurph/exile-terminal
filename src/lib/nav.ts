import {
  LayoutDashboard,
  UserRound,
  Swords,
  Coins,
  Gem,
  BookOpenText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, blurb: "Your exile at a glance" },
  { href: "/character", label: "Character", icon: UserRound, blurb: "Your gear, stats, passives" },
  { href: "/builds", label: "Build Guides", icon: Swords, blurb: "Meta and visual build cards" },
  { href: "/market", label: "Market", icon: Coins, blurb: "Currency and item economy" },
  { href: "/uniques", label: "Uniques", icon: Gem, blurb: "Catalog and your chase list" },
  { href: "/codex", label: "Codex", icon: BookOpenText, blurb: "Skills, mechanics, and Ask" },
  { href: "/changes", label: "0.5 Changes", icon: ScrollText, blurb: "What changed from 0.4" },
];
