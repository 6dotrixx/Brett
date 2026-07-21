import { config } from "../config.js";
import { log } from "../logger.js";
import {
  parseCombatRecord,
  parseMatchScreen,
  hasUsableStats,
  looksLikeMatchScreen,
  type CombatRecordStats,
  type MatchScreenStats,
} from "./parse.js";
import { ocrImage } from "./tesseract.js";
import { extractWithClaude } from "./claude.js";
import { findMap } from "../psn/maps.js";

export type ExtractedScreen =
  | { kind: "record"; stats: CombatRecordStats }
  | { kind: "match"; match: MatchScreenStats };

export interface OcrResult {
  screen: ExtractedScreen;
  engine: "claude" | "tesseract";
  rawText: string | null;
}

/**
 * Extracts stats from a screenshot — either a lifetime combat record or an
 * end-of-match screen (auto-detected). Engine selection: "claude" and
 * "tesseract" force one path; "auto" prefers Claude vision when an API key is
 * configured and falls back to Tesseract on failure.
 */
export async function extractStats(image: Buffer): Promise<OcrResult> {
  const useClaude =
    config.ocrEngine === "claude" || (config.ocrEngine === "auto" && Boolean(config.anthropicApiKey));

  if (useClaude) {
    try {
      const screen = await extractWithClaude(image);
      if (screen.kind === "match" && screen.match.map) {
        // Normalize Claude's free-text map name against the known roster
        const entry = findMap(screen.match.map, screen.match.game);
        if (entry) {
          screen.match.map = entry.map;
          screen.match.mapCategory = entry.category;
          screen.match.game = screen.match.game ?? entry.game;
        }
      }
      return { screen, engine: "claude", rawText: null };
    } catch (err) {
      if (config.ocrEngine === "claude") throw err;
      log.warn("Claude extraction failed, falling back to Tesseract", err);
    }
  }

  const rawText = await ocrImage(image);
  const record = parseCombatRecord(rawText);
  const match = parseMatchScreen(rawText);

  if (looksLikeMatchScreen(record, match)) {
    return { screen: { kind: "match", match }, engine: "tesseract", rawText };
  }
  if (!hasUsableStats(record)) {
    log.warn("Tesseract parse produced no usable stats");
  }
  return { screen: { kind: "record", stats: record }, engine: "tesseract", rawText };
}
