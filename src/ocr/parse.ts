export interface CombatRecordStats {
  game: "BO1" | "BO2" | null;
  kills: number | null;
  deaths: number | null;
  wins: number | null;
  losses: number | null;
  kdRatio: number | null;
  winPct: number | null;
  score: number | null;
  accuracy: number | null;
  headshots: number | null;
  timePlayed: string | null;
}

const emptyStats = (): CombatRecordStats => ({
  game: null, kills: null, deaths: null, wins: null, losses: null,
  kdRatio: null, winPct: null, score: null, accuracy: null, headshots: null, timePlayed: null,
});

function toInt(s: string): number | null {
  const n = parseInt(s.replace(/[,.\s]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toFloat(s: string): number | null {
  const n = parseFloat(s.replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

/** Find the first number that appears after a labeled keyword on the same or next chunk of text. */
function grabInt(text: string, label: RegExp): number | null {
  const re = new RegExp(label.source + String.raw`[\s:.\-]*([\d,.]+)`, "i");
  const m = text.match(re);
  return m ? toInt(m[1]) : null;
}

function grabFloat(text: string, label: RegExp): number | null {
  const re = new RegExp(label.source + String.raw`[\s:.\-]*([\d]+[.,]?[\d]*)\s*%?`, "i");
  const m = text.match(re);
  return m ? toFloat(m[1]) : null;
}

/**
 * Parses raw OCR text from a Black Ops combat record screen into structured stats.
 * The BO1/BO2 combat record screens use consistent labels: KILLS, DEATHS,
 * K/D RATIO, WINS, LOSSES, WIN %, SCORE, ACCURACY, HEADSHOTS, TIME PLAYED.
 */
export function parseCombatRecord(rawText: string): CombatRecordStats {
  const stats = emptyStats();
  const text = rawText.replace(/\r/g, "");

  // "II" is frequently OCR'd as Il / ll / 11 etc. — accept the common confusions
  if (/black\s*ops\W*(ii|2|[il1|]{2})\b/i.test(text)) stats.game = "BO2";
  else if (/black\s*ops/i.test(text)) stats.game = "BO1";

  stats.kills = grabInt(text, /\bkills\b/);
  stats.deaths = grabInt(text, /\bdeaths\b/);
  stats.wins = grabInt(text, /\bwins\b/);
  stats.losses = grabInt(text, /\bloss(?:es)?\b/);
  stats.headshots = grabInt(text, /\bhead\s*shots?\b/);
  stats.score = grabInt(text, /\bscore\b/);
  stats.kdRatio = grabFloat(text, /\bk\s*\/?\s*d(?:\s*ratio)?\b/);
  stats.winPct = grabFloat(text, /\bwin\s*(?:%|percent(?:age)?|ratio)\b/);
  stats.accuracy = grabFloat(text, /\baccuracy\b/);

  const time = text.match(/time\s*played[\s:.\-]*([\dd:hms\s]+)/i);
  if (time) stats.timePlayed = time[1].trim().replace(/\s+/g, " ") || null;

  // Derive missing ratios when their components are present
  if (stats.kdRatio == null && stats.kills != null && stats.deaths != null && stats.deaths > 0) {
    stats.kdRatio = Math.round((stats.kills / stats.deaths) * 100) / 100;
  }
  if (stats.winPct == null && stats.wins != null && stats.losses != null && stats.wins + stats.losses > 0) {
    stats.winPct = Math.round((stats.wins / (stats.wins + stats.losses)) * 1000) / 10;
  }

  return stats;
}

/** True when the parse produced at least one core stat worth snapshotting. */
export function hasUsableStats(s: CombatRecordStats): boolean {
  return [s.kills, s.deaths, s.wins, s.losses, s.score].some((v) => v != null);
}
