import Link from "next/link";
import type { ParsedBuild } from "@/lib/pob";
import { Panel, PanelHead } from "@/components/ui/Panel";

const pick = (s: Record<string, number>, ...keys: string[]) => {
  for (const k of keys) if (k in s) return s[k];
  return undefined;
};
const fmt = (n?: number) =>
  n == null
    ? "—"
    : Math.abs(n) >= 1e6
      ? `${(n / 1e6).toFixed(2)}M`
      : Math.abs(n) >= 1e4
        ? `${Math.round(n / 1000)}k`
        : Math.round(n).toLocaleString();

const CAP = 75;
const CX = 70;
const CY = 70;
const R = 55;

export function BuildRadar({ build }: { build: ParsedBuild }) {
  const s = build.stats;
  const fire = pick(s, "FireResist", "FireResistTotal");
  const cold = pick(s, "ColdResist", "ColdResistTotal");
  const light = pick(s, "LightningResist", "LightningResistTotal");
  const chaos = pick(s, "ChaosResist", "ChaosResistTotal");

  const axes = [
    { label: "Fire", v: fire, ux: 0, uy: -1 },
    { label: "Light", v: light, ux: 1, uy: 0 },
    { label: "Cold", v: cold, ux: 0, uy: 1 },
    { label: "Chaos", v: chaos, ux: -1, uy: 0 },
  ];
  const ptFor = (v: number | undefined, ux: number, uy: number) => {
    const r = Math.max(0, Math.min(1.15, (v ?? 0) / CAP)) * R;
    return [CX + r * ux, CY + r * uy];
  };
  const valuePoly = axes.map((a) => ptFor(a.v, a.ux, a.uy).join(",")).join(" ");
  const capPoly = axes.map((a) => [CX + R * a.ux, CY + R * a.uy].join(",")).join(" ");
  const midPoly = axes.map((a) => [CX + R * 0.5 * a.ux, CY + R * 0.5 * a.uy].join(",")).join(" ");

  const elementals = [
    { label: "Fire", v: fire },
    { label: "Cold", v: cold },
    { label: "Lightning", v: light },
  ];
  const weak = elementals.filter((e) => e.v != null && e.v < CAP);

  const vitals = [
    { label: "Life", v: pick(s, "Life") },
    { label: "Energy Shield", v: pick(s, "EnergyShield") },
    { label: "Mana", v: pick(s, "Mana") },
    { label: "Spirit", v: pick(s, "Spirit") },
    { label: "Armour", v: pick(s, "Armour") },
    { label: "Evasion", v: pick(s, "Evasion") },
  ].filter((g) => g.v != null);
  const dps = pick(s, "FullDPS", "TotalDPS", "CombinedDPS", "AverageDamage");
  const ehp = pick(s, "TotalEHP");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel className="p-6">
        <PanelHead eyebrow="Defense" title="Resistance Radar" note="from PoB" />
        <svg viewBox="0 0 140 140" className="mx-auto w-full max-w-[260px]">
          <polygon points={capPoly} fill="none" stroke="#c2974a" strokeOpacity="0.25" strokeWidth="0.6" />
          <polygon points={midPoly} fill="none" stroke="#c2974a" strokeOpacity="0.12" strokeWidth="0.5" />
          {axes.map((a) => (
            <line
              key={a.label}
              x1={CX}
              y1={CY}
              x2={CX + R * a.ux}
              y2={CY + R * a.uy}
              stroke="#c2974a"
              strokeOpacity="0.12"
              strokeWidth="0.5"
            />
          ))}
          <polygon points={valuePoly} fill="#c2974a" fillOpacity="0.18" stroke="#e6c987" strokeWidth="1" strokeLinejoin="round" />
          {axes.map((a) => (
            <text
              key={a.label}
              x={CX + (R + 9) * a.ux}
              y={CY + (R + 9) * a.uy}
              fill="#b3a585"
              fontSize="7"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {a.label}
            </text>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
          {axes.map((a) => (
            <div key={a.label}>
              <div
                className="mono text-[12px]"
                style={{ color: a.v != null && a.label !== "Chaos" && a.v < CAP ? "#cf4436" : "#e6dcc4" }}
              >
                {a.v == null ? "—" : Math.round(a.v)}
              </div>
              <div className="eyebrow text-[7px] text-bone-600">{a.label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-6">
        <PanelHead eyebrow="Bulk" title="Vitals" />
        <dl className="flex flex-col gap-3">
          {vitals.map((g) => (
            <div key={g.label} className="flex items-center justify-between">
              <dt className="text-[13px] text-bone-500">{g.label}</dt>
              <dd className="mono text-[13px] text-bone-100">{fmt(g.v)}</dd>
            </div>
          ))}
          {dps != null && (
            <div className="flex items-center justify-between border-t border-gold-700/15 pt-3">
              <dt className="text-[13px] text-bone-500">DPS</dt>
              <dd className="mono text-[13px] text-gold-300">{fmt(dps)}</dd>
            </div>
          )}
          {ehp != null && (
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-bone-500">Effective HP</dt>
              <dd className="mono text-[13px] text-bone-100">{fmt(ehp)}</dd>
            </div>
          )}
        </dl>
      </Panel>

      <Panel className="p-6">
        <PanelHead eyebrow="Audit" title="Weak Spots" />
        {weak.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {weak.map((w) => (
              <li key={w.label} className="flex items-start gap-2.5 text-[13px] text-bone-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blood-400" />
                <span>
                  {w.label} resistance uncapped at {Math.round(w.v as number)}% ({CAP - Math.round(w.v as number)} to cap)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-bone-400">Elemental resistances are capped. Solid foundation.</p>
        )}
        {chaos != null && chaos < 0 && (
          <p className="mt-2.5 flex items-start gap-2.5 text-[13px] text-bone-400">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8f8fef]" />
            <span>Chaos resistance is {Math.round(chaos)}%. Common, but a liability against chaos damage.</span>
          </p>
        )}
        <Link
          href="/uniques"
          className="mono mt-5 inline-flex rounded-[5px] border border-gold-600/40 bg-gold-500/10 px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/20"
        >
          Find upgrades in the Reliquary
        </Link>
      </Panel>
    </div>
  );
}
