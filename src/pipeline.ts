import { db, getOrCreatePrimaryPlayer } from "./db.js";
import { config } from "./config.js";
import { extractStats } from "./ocr/index.js";
import { hasUsableStats, type CombatRecordStats, type MatchScreenStats } from "./ocr/parse.js";
import { log } from "./logger.js";

export type ProcessResult =
  | { ok: true; type: "match"; matchId: number; game: string; engine: string; match: MatchScreenStats; sessionId: number | null }
  | { ok: true; type: "record"; snapshotId: number; game: string; engine: string; stats: CombatRecordStats }
  | { ok: false; error: string; engine?: string; stats?: CombatRecordStats; rawText?: string | null };

/**
 * Full screenshot pipeline: OCR → classify (lifetime record vs end-of-match)
 * → persist. Shared by the HTTP upload route and the auto-ingest watcher.
 */
export async function processImage(image: Buffer, gameFallback = "BO1"): Promise<ProcessResult> {
  const { screen, engine, rawText } = await extractStats(image);
  const source = engine === "claude" ? "ocr-claude" : "ocr-tesseract";
  const pid = getOrCreatePrimaryPlayer(config.psnOnlineId || null).id;

  if (screen.kind === "match") {
    const m = screen.match;
    const game = m.game ?? gameFallback;
    // Attach to the open session, or the most recent one that ended in the last 2h
    const session = db
      .prepare(
        `SELECT id FROM sessions WHERE player_id = ? AND game = ?
           AND (ended_at IS NULL OR ended_at > datetime('now', '-2 hours'))
         ORDER BY started_at DESC LIMIT 1`
      )
      .get(pid, game) as { id: number } | undefined;
    const info = db
      .prepare(
        `INSERT INTO match_stats (session_id, player_id, game, mode, map, kills, deaths, result, round, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(session?.id ?? null, pid, game, m.mode, m.map, m.kills, m.deaths, m.result, m.round, source);
    log.info(`Match ${info.lastInsertRowid} recorded: ${game} ${m.map ?? "?"} via ${engine}`);
    return { ok: true, type: "match", matchId: Number(info.lastInsertRowid), game, engine, match: m, sessionId: session?.id ?? null };
  }

  const stats = screen.stats;
  if (!hasUsableStats(stats)) {
    return { ok: false, error: "No stats could be read from this screenshot", engine, stats, rawText };
  }
  const game = stats.game ?? gameFallback;
  const info = db
    .prepare(
      `INSERT INTO lifetime_snapshots (player_id, game, kills, deaths, wins, losses, kd_ratio, win_pct, score, accuracy, headshots, time_played, raw_text, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      pid, game, stats.kills, stats.deaths, stats.wins, stats.losses,
      stats.kdRatio, stats.winPct, stats.score, stats.accuracy, stats.headshots,
      stats.timePlayed, rawText, source
    );
  log.info(`Snapshot ${info.lastInsertRowid} recorded for ${game} via ${engine}`);
  return { ok: true, type: "record", snapshotId: Number(info.lastInsertRowid), game, engine, stats };
}
