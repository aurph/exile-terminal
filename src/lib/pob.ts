import zlib from "zlib";

/**
 * Parses a Path of Building 2 export code into the computed stats PoB already
 * calculated. A PoB code is URL-safe base64 of a zlib-deflated XML document
 * whose <Build> holds <PlayerStat stat="..." value="..."/> entries (Life,
 * resistances, DPS, etc.). We capture every stat so nothing is lost, and read
 * class/level/ascendancy off the <Build> tag. No GGG dependency at all.
 */
export type ParsedBuild = {
  level: number;
  className: string;
  ascendancy: string;
  stats: Record<string, number>;
  importedAt: number;
};

export function decodePobCode(code: string): string {
  const cleaned = code.trim().replace(/-/g, "+").replace(/_/g, "/");
  const buf = Buffer.from(cleaned, "base64");
  return zlib.inflateSync(buf).toString("utf8");
}

export function parsePob(code: string): ParsedBuild {
  const xml = decodePobCode(code);

  const stats: Record<string, number> = {};
  const re = /<PlayerStat\s+stat="([^"]+)"\s+value="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const v = Number.parseFloat(m[2]);
    if (Number.isFinite(v)) stats[m[1]] = v;
  }

  const buildTag = xml.match(/<Build\b[^>]*>/)?.[0] ?? "";
  const attr = (name: string) => buildTag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
  const level = Number.parseInt(attr("level"), 10) || 0;

  if (Object.keys(stats).length === 0 && level === 0) {
    throw new Error("no build data in code");
  }

  return {
    level,
    className: attr("className"),
    ascendancy: attr("ascendClassName"),
    stats,
    importedAt: Date.now(),
  };
}
