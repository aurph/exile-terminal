"use client";

import { useId } from "react";

/**
 * Exile Terminal mark: a stylized Exalted Orb. Original rendition (molten-gold
 * sphere with an engraved outer ring), not Grinding Gear Games artwork.
 */
export function ExaltedOrb({ size = 36, className }: { size?: number; className?: string }) {
  const raw = useId().replace(/[:]/g, "");
  const orb = `orb-${raw}`;
  const glow = `glow-${raw}`;
  const shade = `shade-${raw}`;
  const spec = `spec-${raw}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={orb} cx="0.38" cy="0.30" r="0.85">
          <stop offset="0%" stopColor="#fff3d2" />
          <stop offset="20%" stopColor="#f4d488" />
          <stop offset="52%" stopColor="#dca23f" />
          <stop offset="80%" stopColor="#9c5d1d" />
          <stop offset="100%" stopColor="#532a0e" />
        </radialGradient>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="55%" stopColor="#f6d27e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f6d27e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={spec} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff7e6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff7e6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shade} cx="0.5" cy="0.78" r="0.6">
          <stop offset="0%" stopColor="#34190a" stopOpacity="0.5" />
          <stop offset="65%" stopColor="#34190a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* aura */}
      <circle cx="32" cy="32" r="30" fill={`url(#${glow})`} />
      {/* sphere */}
      <circle cx="32" cy="32" r="21" fill={`url(#${orb})`} />
      <circle cx="32" cy="32" r="21" fill={`url(#${shade})`} />
      {/* inner rim + engraved outer ring */}
      <circle cx="32" cy="32" r="21" fill="none" stroke="#f4dca6" strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke="#caa24f" strokeOpacity="0.22" strokeWidth="0.75" />
      {/* specular highlight */}
      <ellipse cx="24.5" cy="23" rx="7" ry="4.6" transform="rotate(-28 24.5 23)" fill={`url(#${spec})`} />
      <circle cx="22" cy="20.5" r="1.5" fill="#fffaf0" />
    </svg>
  );
}
