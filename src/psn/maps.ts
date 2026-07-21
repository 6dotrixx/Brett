// Map rosters for BO1/BO2 (base + DLC) used to recognize maps in end-of-match
// screenshots. Matching is done longest-name-first so "Nuketown 2025" (BO2)
// wins over "Nuketown" (BO1).
export type MapCategory = "mp" | "zombies";

export interface MapEntry {
  game: "BO1" | "BO2";
  map: string;
  category: MapCategory;
}

const BO1_MP = [
  "Array", "Cracked", "Crisis", "Firing Range", "Grid", "Hanoi", "Havana",
  "Jungle", "Launch", "Nuketown", "Radiation", "Summit", "Villa", "WMD",
  "Berlin Wall", "Discovery", "Kowloon", "Stadium", "Convoy", "Hotel",
  "Stockpile", "Zoo", "Drive-In", "Hangar 18", "Silo", "Hazard",
];
const BO1_ZOMBIES = [
  "Kino der Toten", "Five", "Dead Ops Arcade", "Ascension", "Call of the Dead",
  "Shangri-La", "Moon", "Nacht der Untoten", "Verruckt", "Shi No Numa", "Der Riese",
];
const BO2_MP = [
  "Aftermath", "Cargo", "Carrier", "Drone", "Express", "Hijacked", "Meltdown",
  "Overflow", "Plaza", "Raid", "Slums", "Standoff", "Turbine", "Yemen",
  "Nuketown 2025", "Downhill", "Grind", "Hydro", "Mirage", "Cove", "Detour",
  "Pod", "Magma", "Studio", "Vertigo", "Encore", "Dig", "Frost", "Takeoff",
  "Uplink",
];
const BO2_ZOMBIES = [
  "TranZit", "Green Run", "Nuketown Zombies", "Die Rise", "Mob of the Dead",
  "Buried", "Origins", "Town", "Farm", "Bus Depot",
];

export const ALL_MAPS: MapEntry[] = [
  ...BO1_MP.map((map) => ({ game: "BO1" as const, map, category: "mp" as const })),
  ...BO1_ZOMBIES.map((map) => ({ game: "BO1" as const, map, category: "zombies" as const })),
  ...BO2_MP.map((map) => ({ game: "BO2" as const, map, category: "mp" as const })),
  ...BO2_ZOMBIES.map((map) => ({ game: "BO2" as const, map, category: "zombies" as const })),
].sort((a, b) => b.map.length - a.map.length);

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Finds a known map name inside OCR text. Longest names are tried first, and
 * maps present in both games (e.g. shared names) resolve via gameHint.
 */
export function findMap(text: string, gameHint?: "BO1" | "BO2" | null): MapEntry | null {
  const haystack = ` ${normalize(text)} `;
  let fallback: MapEntry | null = null;
  for (const entry of ALL_MAPS) {
    if (haystack.includes(` ${normalize(entry.map)} `)) {
      if (!gameHint || entry.game === gameHint) return entry;
      fallback = fallback ?? entry;
    }
  }
  return fallback;
}

export const KNOWN_MODES = [
  "Team Deathmatch", "TDM", "Domination", "Kill Confirmed", "Hardpoint",
  "Search and Destroy", "Search & Destroy", "Demolition", "Headquarters",
  "Capture the Flag", "CTF", "Free-for-All", "Free for All", "FFA",
  "Sabotage", "Ground War", "Sticks and Stones", "Gun Game", "One in the Chamber",
  "Sharpshooter", "Party Games", "Zombies", "Grief", "Turned",
];

export function findMode(text: string): string | null {
  const haystack = normalize(text);
  for (const mode of [...KNOWN_MODES].sort((a, b) => b.length - a.length)) {
    if (haystack.includes(normalize(mode))) return mode;
  }
  return null;
}
