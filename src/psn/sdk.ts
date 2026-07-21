// psn-api ships a CJS build whose named exports aren't statically analyzable
// under some loaders (tsx). Loading via require() works everywhere, so all
// psn-api access goes through this wrapper.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const psn = require("psn-api") as typeof import("psn-api");

export const {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  exchangeRefreshTokenForAuthTokens,
  getBasicPresence,
  getUserTitles,
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
  makeUniversalSearch,
} = psn;

export type { AuthTokensResponse } from "psn-api";
