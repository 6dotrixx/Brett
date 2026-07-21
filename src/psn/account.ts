import { makeUniversalSearch } from "./sdk.js";
import { getAuth } from "./auth.js";
import { config } from "../config.js";
import { db, getOrCreatePrimaryPlayer } from "../db.js";
import { log } from "../logger.js";

/**
 * Resolves the tracked account. If PSN_ONLINE_ID is set, looks up that account's
 * numeric accountId via universal search; otherwise uses "me" (the token owner).
 */
export async function resolveAccountId(): Promise<{ accountId: string; playerId: number }> {
  const player = getOrCreatePrimaryPlayer(config.psnOnlineId || null);

  const existing = db.prepare("SELECT account_id FROM players WHERE id = ?").get(player.id) as { account_id: string | null };
  if (existing?.account_id) {
    return { accountId: existing.account_id, playerId: player.id };
  }

  let accountId = "me";
  if (config.psnOnlineId) {
    const auth = await getAuth();
    const search = await makeUniversalSearch(auth, config.psnOnlineId, "SocialAllAccounts");
    const results = search.domainResponses?.[0]?.results ?? [];
    const hit = results.find(
      (r: any) => r.socialMetadata?.onlineId?.toLowerCase() === config.psnOnlineId.toLowerCase()
    ) ?? results[0];
    if (hit?.socialMetadata?.accountId) {
      accountId = hit.socialMetadata.accountId;
      log.info(`Resolved PSN ID ${config.psnOnlineId} -> account ${accountId}`);
    } else {
      log.warn(`Could not resolve PSN_ONLINE_ID "${config.psnOnlineId}", using token owner ("me")`);
    }
  }

  db.prepare("UPDATE players SET account_id = ? WHERE id = ?").run(accountId, player.id);
  return { accountId, playerId: player.id };
}
