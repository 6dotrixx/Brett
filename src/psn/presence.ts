import { getBasicPresence } from "./sdk.js";
import { getAuth } from "./auth.js";
import { resolveAccountId } from "./account.js";
import { matchesBlackOps, classifyGame, gameLabel } from "./titles.js";
import { db, setMeta } from "../db.js";
import { log } from "../logger.js";

// Number of consecutive polls with no matching title before a session is closed.
// Absorbs momentary presence blips (menu transitions, PSN hiccups).
const CLOSE_GRACE_POLLS = 2;
let missCount = 0;

interface OpenSession {
  id: number;
  game: string;
  title_name: string;
}

function getOpenSession(playerId: number): OpenSession | undefined {
  return db
    .prepare("SELECT id, game, title_name FROM sessions WHERE player_id = ? AND ended_at IS NULL ORDER BY id DESC LIMIT 1")
    .get(playerId) as OpenSession | undefined;
}

export interface PresenceResult {
  online: boolean;
  playingTitle: string | null;
  matched: boolean;
  session: { id: number; game: string; startedAt: string } | null;
}

export async function pollPresence(): Promise<PresenceResult> {
  const auth = await getAuth();
  const { accountId, playerId } = await resolveAccountId();

  const presence = await getBasicPresence(auth, accountId);
  const basic: any = (presence as any).basicPresence ?? presence;
  const online = basic?.availability === "availableToPlay" || basic?.primaryPlatformInfo?.onlineStatus === "online";
  const titles: any[] = basic?.gameTitleInfoList ?? [];
  const now = new Date().toISOString();
  setMeta("last_presence_poll", now);

  const boTitle = titles.find((t) => matchesBlackOps(t.titleName));
  const open = getOpenSession(playerId);

  if (boTitle) {
    missCount = 0;
    const game = classifyGame(boTitle.titleName);
    if (open && open.game === game) {
      db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, open.id);
      return { online, playingTitle: boTitle.titleName, matched: true, session: { id: open.id, game, startedAt: now } };
    }
    if (open && open.game !== game) {
      // Switched between BO1 and BO2 — close the old session, open a new one
      db.prepare("UPDATE sessions SET ended_at = ? WHERE id = ?").run(now, open.id);
      log.info(`Session ${open.id} closed (switched title)`);
    }
    const info = db
      .prepare("INSERT INTO sessions (player_id, game, title_name, started_at, last_seen_at, source) VALUES (?, ?, ?, ?, ?, 'presence')")
      .run(playerId, game, boTitle.titleName, now, now);
    log.info(`▶ Session started: ${gameLabel(game)} (session ${info.lastInsertRowid})`);
    return { online, playingTitle: boTitle.titleName, matched: true, session: { id: Number(info.lastInsertRowid), game, startedAt: now } };
  }

  // No Black Ops title in presence
  if (open) {
    missCount += 1;
    if (missCount >= CLOSE_GRACE_POLLS) {
      db.prepare("UPDATE sessions SET ended_at = COALESCE(last_seen_at, ?) WHERE id = ?").run(now, open.id);
      missCount = 0;
      log.info(`■ Session ${open.id} ended`);
    }
  }
  const playing = titles[0]?.titleName ?? null;
  return { online, playingTitle: playing, matched: false, session: null };
}
