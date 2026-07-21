import { Router, type Request, type Response } from "express";
import { db, getMeta, getOrCreatePrimaryPlayer } from "../db.js";
import { config } from "../config.js";
import { authStatus } from "../psn/auth.js";
import { syncTrophies, CAMPAIGN_MISSIONS } from "../psn/trophies.js";
import { pollPresence } from "../psn/presence.js";
import { extractStats } from "../ocr/index.js";
import { hasUsableStats } from "../ocr/parse.js";
import { log } from "../logger.js";

export const api = Router();

function playerId(): number {
  return getOrCreatePrimaryPlayer(config.psnOnlineId || null).id;
}

// ── Status ────────────────────────────────────────────────────────────────
api.get("/status", (_req: Request, res: Response) => {
  const pid = playerId();
  const open = db
    .prepare("SELECT id, game, title_name, started_at, last_seen_at FROM sessions WHERE player_id = ? AND ended_at IS NULL ORDER BY id DESC LIMIT 1")
    .get(pid);
  const player = db.prepare("SELECT id, name, psn_id FROM players WHERE id = ?").get(pid);
  res.json({
    player,
    psn: authStatus(),
    activeSession: open ?? null,
    lastPresencePoll: getMeta("last_presence_poll"),
    lastTrophySync: getMeta("last_trophy_sync"),
    pollIntervalSeconds: config.presencePollSeconds,
    ocrEngine: config.ocrEngine,
    claudeConfigured: Boolean(config.anthropicApiKey),
  });
});

// ── Sessions ──────────────────────────────────────────────────────────────
api.get("/sessions", (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 500);
  const rows = db
    .prepare(
      `SELECT id, game, title_name, started_at, ended_at, last_seen_at, source,
        CAST((julianday(COALESCE(ended_at, last_seen_at, started_at)) - julianday(started_at)) * 24 * 60 AS INTEGER) AS minutes
       FROM sessions WHERE player_id = ? ORDER BY started_at DESC LIMIT ?`
    )
    .all(playerId(), limit);
  const totals = db
    .prepare(
      `SELECT game, COUNT(*) AS sessions,
        CAST(SUM((julianday(COALESCE(ended_at, last_seen_at, started_at)) - julianday(started_at)) * 24 * 60) AS INTEGER) AS total_minutes
       FROM sessions WHERE player_id = ? GROUP BY game`
    )
    .all(playerId());
  res.json({ sessions: rows, totals });
});

// ── Trophies + campaign ───────────────────────────────────────────────────
api.get("/trophies", (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT game, name, detail, grade, earned, earned_at, icon_url FROM trophies WHERE player_id = ? ORDER BY game, trophy_id")
    .all(playerId());
  const summary = db
    .prepare("SELECT game, COUNT(*) AS total, SUM(earned) AS earned FROM trophies WHERE player_id = ? GROUP BY game")
    .all(playerId());
  res.json({ trophies: rows, summary });
});

api.get("/campaign", (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT game, mission, completed, completed_at FROM campaign_progress WHERE player_id = ?")
    .all(playerId()) as { game: string; mission: string; completed: number; completed_at: string | null }[];
  const byGame: Record<string, { mission: string; completed: boolean; completedAt: string | null }[]> = {};
  for (const [game, missions] of Object.entries(CAMPAIGN_MISSIONS)) {
    byGame[game] = missions.map((m) => {
      const row = rows.find((r) => r.game === game && r.mission === m);
      return { mission: m, completed: Boolean(row?.completed), completedAt: row?.completed_at ?? null };
    });
  }
  res.json(byGame);
});

api.post("/sync/trophies", async (_req: Request, res: Response) => {
  try {
    const result = await syncTrophies();
    res.json({ ok: true, ...result });
  } catch (err: any) {
    log.error("Manual trophy sync failed", err);
    res.status(502).json({ ok: false, error: String(err?.message ?? err) });
  }
});

api.post("/sync/presence", async (_req: Request, res: Response) => {
  try {
    const result = await pollPresence();
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: String(err?.message ?? err) });
  }
});

// ── Lifetime snapshots + diffs ────────────────────────────────────────────
api.get("/snapshots", (req: Request, res: Response) => {
  const game = typeof req.query.game === "string" ? req.query.game : null;
  const rows = db
    .prepare(
      `SELECT id, game, captured_at, kills, deaths, wins, losses, kd_ratio, win_pct, score, accuracy, headshots, time_played, source
       FROM lifetime_snapshots WHERE player_id = ? ${game ? "AND game = ?" : ""} ORDER BY captured_at DESC LIMIT 100`
    )
    .all(...(game ? [playerId(), game] : [playerId()]));
  res.json({ snapshots: rows });
});

api.get("/snapshots/diff", (req: Request, res: Response) => {
  const game = typeof req.query.game === "string" ? req.query.game : "BO1";
  const rows = db
    .prepare(
      `SELECT captured_at, kills, deaths, wins, losses FROM lifetime_snapshots
       WHERE player_id = ? AND game = ? ORDER BY captured_at DESC LIMIT 2`
    )
    .all(playerId(), game) as any[];
  if (rows.length < 2) {
    res.json({ game, diff: null, note: "Need at least two snapshots to diff" });
    return;
  }
  const [latest, previous] = rows;
  const d = (a: number | null, b: number | null) => (a != null && b != null ? a - b : null);
  const kills = d(latest.kills, previous.kills);
  const deaths = d(latest.deaths, previous.deaths);
  const wins = d(latest.wins, previous.wins);
  const losses = d(latest.losses, previous.losses);
  res.json({
    game,
    from: previous.captured_at,
    to: latest.captured_at,
    diff: {
      kills, deaths, wins, losses,
      games: wins != null && losses != null ? wins + losses : null,
      kdRatio: kills != null && deaths != null && deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : null,
      winPct: wins != null && losses != null && wins + losses > 0 ? Math.round((wins / (wins + losses)) * 1000) / 10 : null,
    },
  });
});

// ── Screenshot upload → OCR → snapshot ────────────────────────────────────
// Accepts a raw image body (fetch with the file blob as body).
api.post("/upload", async (req: Request, res: Response) => {
  try {
    const image = req.body as Buffer;
    if (!Buffer.isBuffer(image) || image.length === 0) {
      res.status(400).json({ ok: false, error: "Send the image as the raw request body with an image/* content type" });
      return;
    }
    const { stats, engine, rawText } = await extractStats(image);
    if (!hasUsableStats(stats)) {
      res.status(422).json({ ok: false, error: "No stats could be read from this screenshot", engine, stats, rawText });
      return;
    }
    const game = stats.game ?? (typeof req.query.game === "string" ? req.query.game : "BO1");
    const info = db
      .prepare(
        `INSERT INTO lifetime_snapshots (player_id, game, kills, deaths, wins, losses, kd_ratio, win_pct, score, accuracy, headshots, time_played, raw_text, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        playerId(), game, stats.kills, stats.deaths, stats.wins, stats.losses,
        stats.kdRatio, stats.winPct, stats.score, stats.accuracy, stats.headshots,
        stats.timePlayed, rawText, engine === "claude" ? "ocr-claude" : "ocr-tesseract"
      );
    log.info(`Snapshot ${info.lastInsertRowid} recorded for ${game} via ${engine}`);
    res.json({ ok: true, snapshotId: Number(info.lastInsertRowid), game, engine, stats });
  } catch (err: any) {
    log.error("Upload/OCR failed", err);
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});

// Manual per-match stat entry (optional escape hatch)
api.post("/match", (req: Request, res: Response) => {
  const { game, mode, map, kills, deaths, result, round, sessionId } = req.body ?? {};
  if (!game) {
    res.status(400).json({ ok: false, error: "game is required (BO1 or BO2)" });
    return;
  }
  const info = db
    .prepare(
      `INSERT INTO match_stats (session_id, player_id, game, mode, map, kills, deaths, result, round, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')`
    )
    .run(sessionId ?? null, playerId(), game, mode ?? null, map ?? null, kills ?? null, deaths ?? null, result ?? null, round ?? null);
  res.json({ ok: true, matchId: Number(info.lastInsertRowid) });
});

api.get("/matches", (_req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT id, session_id, game, mode, map, kills, deaths, result, round, source, created_at FROM match_stats WHERE player_id = ? ORDER BY created_at DESC LIMIT 100")
    .all(playerId());
  res.json({ matches: rows });
});
