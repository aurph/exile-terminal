/**
 * PoE2 0.5 "Return of the Ancients" campaign, the fast route to endgame.
 * Acts I-IV plus the three interludes (V.1-V.3) that replaced the old Cruel
 * re-run. Milestones are the must-dos for getting to maps quickly: both
 * Ascendancy trials, the high-value reward pickups, and act bosses. Content is
 * sourced from current 0.5 leveling checklists, not invented.
 */
export type MilestoneTag = "ascend" | "boss" | "skill" | "resist" | "pickup" | "system" | "maps";

export type Milestone = { id: string; label: string; tag: MilestoneTag };

export type Act = {
  id: string;
  name: string;
  subtitle: string;
  levels: string;
  badge: string;
  rewards: string[];
  milestones: Milestone[];
};

export const CAMPAIGN: Act[] = [
  {
    id: "act1",
    name: "Act I",
    subtitle: "Clearfell to Ogham",
    levels: "1 – 14",
    badge: "I",
    rewards: ["+4 Skill Points", "+30 Spirit", "+20 Life", "+10% Cold Res"],
    milestones: [
      { id: "a1-clearfell", label: "Clearfell → Grelwood → Red Vale", tag: "system" },
      { id: "a1-lute", label: "Return Una's Lute (Ogham Farmlands) → +2 passives", tag: "pickup" },
      { id: "a1-crowbell", label: "Grab the Crowbell (Hunting Grounds) → +2 passives", tag: "pickup" },
      { id: "a1-gembloom", label: "Gembloom Skull (Freythorn) → +30 Spirit + Spirit Gem", tag: "pickup" },
      { id: "a1-geonor", label: "Kill Count Geonor on The Bridge", tag: "boss" },
    ],
  },
  {
    id: "act2",
    name: "Act II",
    subtitle: "Vastiri to Dreadnought",
    levels: "14 – 29",
    badge: "II",
    rewards: ["+4 Skill Points", "+10% Lightning Res", "+1 Charm Slot"],
    milestones: [
      { id: "a2-trial", label: "Trial of the Sekhemas → 1st Ascendancy (2 pts)", tag: "ascend" },
      { id: "a2-titans", label: "Cross the Valley of Titans", tag: "system" },
      { id: "a2-skill", label: "Clear every Skill Point quest", tag: "skill" },
      { id: "a2-jamanra", label: "Kill Jamanra in The Dreadnought", tag: "boss" },
    ],
  },
  {
    id: "act3",
    name: "Act III",
    subtitle: "Sandswept to Ziggurat",
    levels: "30 – 42",
    badge: "III",
    rewards: ["+4 Skill Points", "+30 Spirit", "+10% Fire Res"],
    milestones: [
      { id: "a3-trial", label: "Trial of Chaos → 2nd Ascendancy (2 pts)", tag: "ascend" },
      { id: "a3-beacons", label: "Light the six Ancient Beacons → Vaal Ruins", tag: "system" },
      { id: "a3-res", label: "Rune-swap to ~75% Fire / Cold / Lightning before the boss", tag: "resist" },
      { id: "a3-doryani", label: "Kill Doryani at the Ziggurat", tag: "boss" },
    ],
  },
  {
    id: "act4",
    name: "Act IV",
    subtitle: "Karui Archipelago",
    levels: "42 – 52",
    badge: "IV",
    rewards: ["+4 Skill Points", "+5% Max Mana", "Hideout"],
    milestones: [
      { id: "a4-farrow", label: "Farrow's quest → unlock Verisium Runeforging", tag: "system" },
      { id: "a4-skill", label: "Clear every Skill Point quest", tag: "skill" },
      { id: "a4-finale", label: "Clear the Act IV finale", tag: "boss" },
    ],
  },
  {
    id: "interludes",
    name: "Interludes",
    subtitle: "V.1 · V.2 · V.3",
    levels: "52 – 59",
    badge: "V",
    rewards: ["+8 Skill Points", "+5% Max Life", "+40 Spirit", "Free Unique", "7 Boons"],
    milestones: [
      { id: "i-holten", label: "Darkness at Holten", tag: "system" },
      { id: "i-water", label: "Gifting of Water", tag: "system" },
      { id: "i-vault", label: "Vaal Vault", tag: "system" },
      { id: "i-beacons", label: "Light the six new Ancient Beacons", tag: "system" },
      { id: "i-maps", label: "Enter the Atlas → Endgame Maps", tag: "maps" },
    ],
  },
];

export const TOTAL_MILESTONES = CAMPAIGN.reduce((n, a) => n + a.milestones.length, 0);
