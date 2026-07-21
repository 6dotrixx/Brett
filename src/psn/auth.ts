import {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  exchangeRefreshTokenForAuthTokens,
  type AuthTokensResponse,
} from "./sdk.js";
import { db, setMeta } from "../db.js";
import { config } from "../config.js";
import { log } from "../logger.js";

export interface PsnAuth {
  accessToken: string;
}

interface AuthRow {
  access_token: string | null;
  refresh_token: string | null;
  access_expires_at: string | null;
  refresh_expires_at: string | null;
}

function saveTokens(t: AuthTokensResponse): void {
  const now = Date.now();
  db.prepare(
    `INSERT INTO auth_state (id, access_token, refresh_token, access_expires_at, refresh_expires_at, updated_at)
     VALUES (1, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       access_expires_at = excluded.access_expires_at,
       refresh_expires_at = excluded.refresh_expires_at,
       updated_at = excluded.updated_at`
  ).run(
    t.accessToken,
    t.refreshToken,
    new Date(now + t.expiresIn * 1000).toISOString(),
    new Date(now + t.refreshTokenExpiresIn * 1000).toISOString()
  );
}

function loadTokens(): AuthRow | undefined {
  return db.prepare("SELECT access_token, refresh_token, access_expires_at, refresh_expires_at FROM auth_state WHERE id = 1").get() as
    | AuthRow
    | undefined;
}

let cached: { accessToken: string; expiresAt: number } | null = null;

/**
 * Returns a valid PSN access token, refreshing or re-authenticating as needed.
 * Throws if no NPSSO is configured and no stored refresh token is usable.
 */
export async function getAuth(): Promise<PsnAuth> {
  // In-memory cache with a 60s safety margin
  if (cached && cached.expiresAt - 60_000 > Date.now()) {
    return { accessToken: cached.accessToken };
  }

  const stored = loadTokens();
  if (stored?.access_token && stored.access_expires_at && new Date(stored.access_expires_at).getTime() - 60_000 > Date.now()) {
    cached = { accessToken: stored.access_token, expiresAt: new Date(stored.access_expires_at).getTime() };
    return { accessToken: stored.access_token };
  }

  if (stored?.refresh_token && stored.refresh_expires_at && new Date(stored.refresh_expires_at).getTime() > Date.now()) {
    try {
      const tokens = await exchangeRefreshTokenForAuthTokens(stored.refresh_token);
      saveTokens(tokens);
      cached = { accessToken: tokens.accessToken, expiresAt: Date.now() + tokens.expiresIn * 1000 };
      log.info("PSN access token refreshed");
      return { accessToken: tokens.accessToken };
    } catch (err) {
      log.warn("PSN token refresh failed, falling back to NPSSO", err);
    }
  }

  if (!config.npsso) {
    throw new Error("PSN not linked: set NPSSO in .env (see .env.example) and restart.");
  }

  const accessCode = await exchangeNpssoForCode(config.npsso);
  const tokens = await exchangeCodeForAccessToken(accessCode);
  saveTokens(tokens);
  setMeta("psn_linked_at", new Date().toISOString());
  cached = { accessToken: tokens.accessToken, expiresAt: Date.now() + tokens.expiresIn * 1000 };
  log.info("PSN linked via NPSSO");
  return { accessToken: tokens.accessToken };
}

export function authStatus(): { linked: boolean; accessExpiresAt: string | null; refreshExpiresAt: string | null } {
  const stored = loadTokens();
  return {
    linked: Boolean(stored?.refresh_token || config.npsso),
    accessExpiresAt: stored?.access_expires_at ?? null,
    refreshExpiresAt: stored?.refresh_expires_at ?? null,
  };
}
