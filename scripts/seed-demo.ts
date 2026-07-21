/**
 * Seeds the database with realistic demo data so you can explore the dashboard
 * before linking PSN. Run: npm run demo   (then npm run dev / npm start)
 * Wipe with: rm -rf data/
 */
import { db, getOrCreatePrimaryPlayer } from "../src/db.js";
import { CAMPAIGN_MISSIONS } from "../src/psn/trophies.js";

const player = getOrCreatePrimaryPlayer("SixDotRixx");
const pid = player.id;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const H = 3600_000;
const D = 24 * H;

// Sessions across the past week + one live session
const sessions: [string, string, number, number | null][] = [
  ["BO1", "Call of Duty®: Black Ops", 6 * D + 2 * H, 6 * D],
  ["BO2", "Call of Duty®: Black Ops II", 5 * D + 3 * H, 5 * D + 1 * H],
  ["BO2", "Call of Duty®: Black Ops II", 3 * D + 90 * 60_000, 3 * D],
  ["BO1", "Call of Duty®: Black Ops", 2 * D + 45 * 60_000, 2 * D],
  ["BO2", "Call of Duty®: Black Ops II", 26 * H, 24 * H],
  ["BO1", "Call of Duty®: Black Ops", 40 * 60_000, null], // live now
];
const insSession = db.prepare(
  "INSERT INTO sessions (player_id, game, title_name, started_at, ended_at, last_seen_at, source) VALUES (?, ?, ?, ?, ?, ?, 'presence')"
);
for (const [game, title, startAgo, endAgo] of sessions) {
  insSession.run(pid, game, title, iso(startAgo), endAgo == null ? null : iso(endAgo), iso(endAgo ?? 60_000));
}

// Two lifetime snapshots per game, a week apart, so the diff view lights up
const insSnap = db.prepare(
  `INSERT INTO lifetime_snapshots (player_id, game, captured_at, kills, deaths, wins, losses, kd_ratio, win_pct, score, accuracy, headshots, time_played, source)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ocr-claude')`
);
insSnap.run(pid, "BO1", iso(7 * D), 14210, 11060, 421, 389, 1.28, 52.0, 2841000, 17.2, 1490, "9d 12h");
insSnap.run(pid, "BO1", iso(1 * H), 14655, 11342, 438, 398, 1.29, 52.4, 2930500, 17.4, 1544, "9d 21h");
insSnap.run(pid, "BO2", iso(7 * D), 40890, 29610, 1188, 975, 1.38, 54.9, 5350100, 18.3, 4051, "20d 22h");
insSnap.run(pid, "BO2", iso(2 * H), 41323, 29881, 1204, 986, 1.38, 55.0, 5412900, 18.4, 4102, "21d 4h");

// Trophies — a plausible spread
const insTrophy = db.prepare(
  `INSERT OR REPLACE INTO trophies (player_id, game, np_comm_id, trophy_id, name, detail, grade, earned, earned_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const bo1Trophies: [string, string, string, boolean][] = [
  ["Platinum", "Awarded when all other trophies have been unlocked", "platinum", false],
  ["Sacrifice", "Ensure your squad escapes safely from Khe Sanh", "bronze", true],
  ["Give me liberty, or give me death", "Escape Vorkuta", "bronze", true],
  ["Death to Dictators", "Take down Castro with a headshot", "bronze", true],
  ["Some wounds never heal", "Escape the past", "bronze", true],
  ["Sally Likes Blood", "Demonstrate killer economic sensibilities by taking down 3 enemies with a single bullet", "bronze", false],
  ["Down and dirty", "Complete S.O.G. and The Defector on Veteran", "silver", true],
  ["Closer Analysis", "Find all the hidden intel", "gold", false],
  ["Black Op Master", "Complete the campaign on Hardened or Veteran", "gold", true],
];
const bo2Trophies: [string, string, string, boolean][] = [
  ["Platinum", "Awarded when all other trophies have been unlocked", "platinum", false],
  ["Gathering Storm", "Complete 'Pyrrhic Victory'", "bronze", true],
  ["Shifting Sands", "Complete 'Celerium'", "bronze", true],
  ["Driven by Rage", "Complete 'Old Wounds'", "bronze", true],
  ["Waterlogged", "Gather intel on Raul Menendez in 'Time and Fate'", "bronze", true],
  ["Sinking Star", "Interrogate Menendez in 'Fallen Angel'", "bronze", true],
  ["Late for the Prom", "Escort the president to the secure location in downtown LA in 'Cordis Die'", "bronze", true],
  ["Judgment Day", "Complete 'Judgement Day'", "bronze", false],
  ["Giant Accomplishment", "Complete all challenges in Der Riese", "silver", false],
  ["Mission Complete", "Complete the campaign on any difficulty", "gold", false],
];
bo1Trophies.forEach(([name, detail, grade, earned], i) =>
  insTrophy.run(pid, "BO1", "NPWR-DEMO-BO1", i + 1, name, detail, grade, earned ? 1 : 0, earned ? iso((30 - i) * D) : null)
);
bo2Trophies.forEach(([name, detail, grade, earned], i) =>
  insTrophy.run(pid, "BO2", "NPWR-DEMO-BO2", i + 1, name, detail, grade, earned ? 1 : 0, earned ? iso((20 - i) * D) : null)
);

// Campaign progress — derive from the seeded trophies, then mark a few extra BO1 missions
const insCampaign = db.prepare(
  `INSERT OR REPLACE INTO campaign_progress (player_id, game, mission, completed, completed_at, source) VALUES (?, ?, ?, ?, ?, 'trophy')`
);
const bo1Done = new Set(["Operation 40", "Vorkuta", "U.S.D.D.", "Executive Order", "S.O.G.", "The Defector", "Numbers"]);
const bo2Done = new Set(["Pyrrhic Victory", "Celerium", "Old Wounds", "Time and Fate", "Fallen Angel", "Karma", "Cordis Die"]);
for (const m of CAMPAIGN_MISSIONS.BO1) insCampaign.run(pid, "BO1", m, bo1Done.has(m) ? 1 : 0, bo1Done.has(m) ? iso(25 * D) : null);
for (const m of CAMPAIGN_MISSIONS.BO2) insCampaign.run(pid, "BO2", m, bo2Done.has(m) ? 1 : 0, bo2Done.has(m) ? iso(15 * D) : null);

db.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('last_presence_poll', ?)").run(iso(30_000));
db.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('last_trophy_sync', ?)").run(iso(3 * H));
db.prepare("INSERT OR REPLACE INTO auth_state (id, access_token, refresh_token, access_expires_at, refresh_expires_at, updated_at) VALUES (1, 'demo', 'demo', ?, ?, datetime('now'))")
  .run(iso(-1 * H), iso(-60 * D));

console.log("Demo data seeded. Start the app with `npm run dev` and open http://localhost:8080");
