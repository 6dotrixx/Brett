import { config } from "../config.js";

export type GameKey = "BO1" | "BO2" | "BO_OTHER";

// PSN presence and trophy titles are matched by name, not hard-coded title IDs —
// the same games surface under different IDs per region/platform.
export function matchesBlackOps(titleName: string | undefined | null): boolean {
  if (!titleName) return false;
  return config.titleMatch.test(titleName);
}

export function classifyGame(titleName: string): GameKey {
  const t = titleName.toLowerCase();
  if (/black ops\s*(ii|2)/.test(t)) return "BO2";
  if (/black ops/.test(t)) return "BO1";
  return "BO_OTHER";
}

export function gameLabel(game: GameKey): string {
  switch (game) {
    case "BO1": return "CALL OF DUTY: BLACK OPS";
    case "BO2": return "CALL OF DUTY: BLACK OPS II";
    default: return "BLACK OPS (UNCLASSIFIED)";
  }
}
