import { config } from "../config.js";
import { log } from "../logger.js";
import { parseCombatRecord, hasUsableStats, type CombatRecordStats } from "./parse.js";
import { ocrImage } from "./tesseract.js";
import { extractWithClaude } from "./claude.js";

export interface OcrResult {
  stats: CombatRecordStats;
  engine: "claude" | "tesseract";
  rawText: string | null;
}

/**
 * Extracts combat-record stats from a screenshot.
 * Engine selection: "claude" and "tesseract" force one path; "auto" prefers
 * Claude vision when an API key is configured (more robust on game UI) and
 * falls back to Tesseract on failure or when no key is set.
 */
export async function extractStats(image: Buffer): Promise<OcrResult> {
  const useClaude =
    config.ocrEngine === "claude" || (config.ocrEngine === "auto" && Boolean(config.anthropicApiKey));

  if (useClaude) {
    try {
      const stats = await extractWithClaude(image);
      return { stats, engine: "claude", rawText: null };
    } catch (err) {
      if (config.ocrEngine === "claude") throw err;
      log.warn("Claude extraction failed, falling back to Tesseract", err);
    }
  }

  const rawText = await ocrImage(image);
  const stats = parseCombatRecord(rawText);
  if (!hasUsableStats(stats)) {
    log.warn("Tesseract parse produced no usable stats");
  }
  return { stats, engine: "tesseract", rawText };
}
