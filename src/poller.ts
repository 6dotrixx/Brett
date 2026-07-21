import cron from "node-cron";
import { config } from "./config.js";
import { pollPresence } from "./psn/presence.js";
import { syncTrophies } from "./psn/trophies.js";
import { log } from "./logger.js";

let presenceErrorStreak = 0;

export function startPoller(): void {
  if (!config.npsso) {
    log.warn("NPSSO not set — poller idle. Add NPSSO to .env and restart to enable presence/trophy sync.");
    return;
  }

  const tick = async () => {
    try {
      await pollPresence();
      presenceErrorStreak = 0;
    } catch (err: any) {
      presenceErrorStreak += 1;
      // Log the first few failures, then go quiet until it recovers
      if (presenceErrorStreak <= 3) log.error(`Presence poll failed (${presenceErrorStreak}x):`, err?.message ?? err);
    }
  };

  const trophyTick = async () => {
    try {
      const r = await syncTrophies();
      log.info(`Trophy sync complete: ${r.titles} titles, ${r.earned}/${r.trophies} earned`);
    } catch (err: any) {
      log.error("Trophy sync failed:", err?.message ?? err);
    }
  };

  // Presence: every N seconds (sub-minute handled via seconds field)
  const s = config.presencePollSeconds;
  const presenceExpr = s < 60 ? `*/${s} * * * * *` : `*/${Math.max(1, Math.round(s / 60))} * * * *`;
  cron.schedule(presenceExpr, tick);

  // Trophies: every N hours
  cron.schedule(`0 */${config.trophySyncHours} * * *`, trophyTick);

  log.info(`Poller armed: presence every ${s}s, trophies every ${config.trophySyncHours}h`);

  // Fire both once at startup so the dashboard is live immediately
  void tick();
  void trophyTick();
}
