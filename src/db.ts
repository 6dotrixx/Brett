import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  psn_id TEXT UNIQUE,
  account_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token TEXT,
  refresh_token TEXT,
  access_expires_at TEXT,
  refresh_expires_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  game TEXT NOT NULL,
  title_name TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  last_seen_at TEXT,
  source TEXT NOT NULL DEFAULT 'presence'
);

CREATE TABLE IF NOT EXISTS match_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER REFERENCES sessions(id),
  player_id INTEGER NOT NULL REFERENCES players(id),
  game TEXT NOT NULL,
  mode TEXT,
  map TEXT,
  kills INTEGER,
  deaths INTEGER,
  result TEXT,
  round INTEGER,
  source TEXT NOT NULL DEFAULT 'ocr',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lifetime_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  game TEXT NOT NULL,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  kills INTEGER,
  deaths INTEGER,
  wins INTEGER,
  losses INTEGER,
  kd_ratio REAL,
  win_pct REAL,
  score INTEGER,
  accuracy REAL,
  headshots INTEGER,
  time_played TEXT,
  raw_text TEXT,
  source TEXT NOT NULL DEFAULT 'ocr'
);

CREATE TABLE IF NOT EXISTS trophies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  game TEXT NOT NULL,
  np_comm_id TEXT,
  trophy_id INTEGER,
  name TEXT,
  detail TEXT,
  grade TEXT,
  earned INTEGER NOT NULL DEFAULT 0,
  earned_at TEXT,
  icon_url TEXT,
  UNIQUE(player_id, np_comm_id, trophy_id)
);

CREATE TABLE IF NOT EXISTS campaign_progress (
  player_id INTEGER NOT NULL REFERENCES players(id),
  game TEXT NOT NULL,
  mission TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  source TEXT NOT NULL DEFAULT 'trophy',
  PRIMARY KEY (player_id, game, mission)
);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

export function getOrCreatePrimaryPlayer(psnId: string | null): { id: number; name: string; psn_id: string | null } {
  const existing = db.prepare("SELECT id, name, psn_id FROM players ORDER BY id LIMIT 1").get() as
    | { id: number; name: string; psn_id: string | null }
    | undefined;
  if (existing) {
    if (psnId && existing.psn_id !== psnId) {
      db.prepare("UPDATE players SET psn_id = ?, name = ? WHERE id = ?").run(psnId, psnId, existing.id);
      return { ...existing, psn_id: psnId, name: psnId };
    }
    return existing;
  }
  const name = psnId || "OPERATIVE";
  const info = db.prepare("INSERT INTO players (name, psn_id) VALUES (?, ?)").run(name, psnId);
  return { id: Number(info.lastInsertRowid), name, psn_id: psnId };
}

export function setMeta(key: string, value: string): void {
  db.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export function getMeta(key: string): string | null {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}
