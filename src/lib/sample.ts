/**
 * Representative sample data so the UI is populated and shaped exactly like the
 * live feeds will be. Every consumer treats this as a stand-in: panels that use
 * it are tagged "sample feed" until the real adapters (poe.ninja, poe2db, GGG)
 * are wired. Currency names are real; the values are illustrative.
 */
export const SAMPLE = true;

export const SYNC = {
  economy: "18:42",
  patch: "08:00",
  builds: "17:15",
} as const;

/** Values are quoted in Exalted Orbs (the league's working base). */
export type Currency = {
  id: string;
  name: string;
  abbr: string;
  valueEx: number;
  change: number;
};

export const CURRENCIES: Currency[] = [
  { id: "divine", name: "Divine Orb", abbr: "div", valueEx: 412, change: 3.4 },
  { id: "annul", name: "Orb of Annulment", abbr: "annul", valueEx: 5.2, change: 2.1 },
  { id: "chaos", name: "Chaos Orb", abbr: "c", valueEx: 8.6, change: -1.2 },
  { id: "vaal", name: "Vaal Orb", abbr: "vaal", valueEx: 1.9, change: 0.4 },
];

/** Divine Orb value in Exalted across the last 14 days. */
export const DIVINE_TREND: number[] = [
  362, 358, 371, 369, 384, 392, 388, 401, 397, 405, 408, 399, 407, 412,
];

export type MetaBuild = {
  ascendancy: string;
  skill: string;
  className: string;
  share: number;
};

export const META_BUILDS: MetaBuild[] = [
  { ascendancy: "Stormweaver", className: "Sorceress", skill: "Spark", share: 14.2 },
  { ascendancy: "Titan", className: "Warrior", skill: "Hammer of the Gods", share: 9.8 },
  { ascendancy: "Deadeye", className: "Ranger", skill: "Lightning Arrow", share: 8.1 },
  { ascendancy: "Infernalist", className: "Witch", skill: "Firewall", share: 6.5 },
];
