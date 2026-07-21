import "dotenv/config";
import path from "node:path";

function num(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const config = {
  port: num("PORT", 8080),
  dbPath: process.env.DB_PATH || path.resolve("data", "combat-record.db"),
  npsso: process.env.NPSSO || "",
  psnOnlineId: process.env.PSN_ONLINE_ID || "",
  presencePollSeconds: num("PRESENCE_POLL_SECONDS", 60),
  trophySyncHours: num("TROPHY_SYNC_HOURS", 6),
  ocrEngine: (process.env.OCR_ENGINE || "auto") as "auto" | "tesseract" | "claude",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  claudeModel: process.env.CLAUDE_MODEL || "claude-opus-4-8",
  titleMatch: new RegExp(process.env.TITLE_MATCH || "black ops", "i"),
};

export type Config = typeof config;
