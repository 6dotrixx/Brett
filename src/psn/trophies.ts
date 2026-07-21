import { getUserTitles, getTitleTrophies, getUserTrophiesEarnedForTitle } from "./sdk.js";
import { getAuth } from "./auth.js";
import { resolveAccountId } from "./account.js";
import { matchesBlackOps, classifyGame } from "./titles.js";
import { db, setMeta } from "../db.js";
import { log } from "../logger.js";

/**
 * Syncs trophy lists + earned status for every Black Ops title on the account,
 * then derives campaign progress from earned trophies whose name/detail text
 * mentions a campaign mission.
 */
export async function syncTrophies(): Promise<{ titles: number; trophies: number; earned: number }> {
  const auth = await getAuth();
  const { accountId, playerId } = await resolveAccountId();

  const userTitles = await getUserTitles(auth, accountId);
  const boTitles = (userTitles.trophyTitles ?? []).filter((t: any) => matchesBlackOps(t.trophyTitleName));

  let totalTrophies = 0;
  let totalEarned = 0;

  const upsert = db.prepare(
    `INSERT INTO trophies (player_id, game, np_comm_id, trophy_id, name, detail, grade, earned, earned_at, icon_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(player_id, np_comm_id, trophy_id) DO UPDATE SET
       earned = excluded.earned,
       earned_at = excluded.earned_at,
       name = excluded.name,
       detail = excluded.detail,
       grade = excluded.grade`
  );

  for (const title of boTitles) {
    const npCommId = title.npCommunicationId;
    const game = classifyGame(title.trophyTitleName);
    // Pre-PS5 titles require npServiceName "trophy"
    const options = title.trophyTitlePlatform?.includes("PS5") ? {} : { npServiceName: "trophy" as const };

    const [defs, earned] = await Promise.all([
      getTitleTrophies(auth, npCommId, "all", options),
      getUserTrophiesEarnedForTitle(auth, accountId, npCommId, "all", options),
    ]);

    const earnedById = new Map<number, any>();
    for (const t of earned.trophies ?? []) earnedById.set(t.trophyId, t);

    const tx = db.transaction(() => {
      for (const t of defs.trophies ?? []) {
        const e = earnedById.get(t.trophyId);
        upsert.run(
          playerId,
          game,
          npCommId,
          t.trophyId,
          t.trophyName ?? null,
          t.trophyDetail ?? null,
          t.trophyType ?? null,
          e?.earned ? 1 : 0,
          e?.earnedDateTime ?? null,
          t.trophyIconUrl ?? null
        );
        totalTrophies += 1;
        if (e?.earned) totalEarned += 1;
      }
    });
    tx();
    log.info(`Trophies synced for ${title.trophyTitleName} (${npCommId})`);
  }

  deriveCampaignProgress(playerId);
  setMeta("last_trophy_sync", new Date().toISOString());
  return { titles: boTitles.length, trophies: totalTrophies, earned: totalEarned };
}

// Campaign mission lists. Progress is derived by matching mission names against
// earned trophy names/descriptions (mission-completion trophies reference the
// mission by name on both titles).
export const CAMPAIGN_MISSIONS: Record<string, string[]> = {
  BO1: [
    "Operation 40", "Vorkuta", "U.S.D.D.", "Executive Order", "S.O.G.", "The Defector",
    "Numbers", "Project Nova", "Victor Charlie", "Crash Site", "WMD", "Payback",
    "Rebirth", "Revelations", "Redemption",
  ],
  BO2: [
    "Pyrrhic Victory", "Celerium", "Old Wounds", "Time and Fate", "Fallen Angel",
    "Karma", "Suffer with Me", "Achilles' Veil", "Odysseus", "Cordis Die", "Judgement Day",
  ],
};

export function deriveCampaignProgress(playerId: number): void {
  const earnedTrophies = db
    .prepare("SELECT game, name, detail, earned_at FROM trophies WHERE player_id = ? AND earned = 1")
    .all(playerId) as { game: string; name: string | null; detail: string | null; earned_at: string | null }[];

  const upsert = db.prepare(
    `INSERT INTO campaign_progress (player_id, game, mission, completed, completed_at, source)
     VALUES (?, ?, ?, ?, ?, 'trophy')
     ON CONFLICT(player_id, game, mission) DO UPDATE SET
       completed = MAX(campaign_progress.completed, excluded.completed),
       completed_at = COALESCE(campaign_progress.completed_at, excluded.completed_at)`
  );

  const tx = db.transaction(() => {
    for (const [game, missions] of Object.entries(CAMPAIGN_MISSIONS)) {
      for (const mission of missions) {
        const needle = mission.toLowerCase();
        const match = earnedTrophies.find(
          (t) => t.game === game && ((t.name ?? "").toLowerCase().includes(needle) || (t.detail ?? "").toLowerCase().includes(needle))
        );
        upsert.run(playerId, game, mission, match ? 1 : 0, match?.earned_at ?? null);
      }
    }
  });
  tx();
}
